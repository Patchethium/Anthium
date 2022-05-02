from time import time
from typing import List

import numpy as np
import torch
import torch.nn.functional as F
from espnet_pytorch_library.nets_utils import make_pad_mask
from torch import nn
from torch.nn.utils.rnn import pad_sequence
from torch.utils.data import random_split
from torch.utils.data.dataloader import DataLoader
from torch.utils.data.dataset import Dataset
from torch.utils.tensorboard import SummaryWriter


class VarianceEncoder(nn.Module):
  """
  Diated CNN with a BiLSTM
  """

  def __init__(self, idim: int, edim: int, adim: int, odim: int, kernel_size: int, num_layer: int, l_phoneme: int):
    super(VarianceEncoder, self).__init__()
    self.input_layer = nn.Embedding(l_phoneme, edim, padding_idx=0)
    self.pre = nn.Linear(idim, adim)
    self.convs = nn.ModuleList(
      [
        nn.utils.weight_norm(
          nn.Conv1d(
            in_channels=adim,
            out_channels=adim,
            kernel_size=kernel_size,
            dilation=kernel_size ** i,
            padding=kernel_size ** i * (kernel_size // 2)
          )
        ) for i in range(num_layer)
      ]
    )

    self.lstm = nn.LSTM(
      input_size=adim,
      hidden_size=adim,
      bidirectional=True
    )

    self.post = nn.Linear(adim * 2, adim)

  def forward(self, phoneme, masks):
    ph_slice = phoneme[:, :, 0] + 1
    p_var = phoneme[:, :, 1:]
    ph_emb = self.input_layer(ph_slice.long())
    ph_input = torch.cat((ph_emb, p_var), dim=-1)
    data = self.pre(ph_input)
    data = data.transpose(1, 2)
    for conv in self.convs:
      data = data + conv(F.relu(data))
    data = data.transpose(1, 2)
    data, _ = self.lstm(data)
    output = self.post(data)
    if masks is not None:
      output = output.masked_fill(masks, 0.0)
    return output


class GeneralDataset(Dataset):
  def __init__(self, ph_path, dur_path, pit_path, eng_path, device):
    ph = np.load(ph_path, allow_pickle=True)
    dur = np.load(dur_path, allow_pickle=True)
    pit = np.load(pit_path, allow_pickle=True)
    eng = np.load(eng_path, allow_pickle=True)

    self.ph = [torch.from_numpy(x).to(device) for x in ph]
    self.dur = [torch.from_numpy(x).unsqueeze(-1).to(device) for x in dur]
    self.pit = [torch.from_numpy(x).unsqueeze(-1).to(device) for x in pit]
    self.eng = [torch.from_numpy(x).unsqueeze(-1).to(device) for x in eng]

  def __len__(self):
    return len(self.ph)

  def __getitem__(self, item):
    return [self.ph[item], self.dur[item], self.pit[item], self.eng[item]]


def pad_collate(tensor_list: List[torch.Tensor]):
  length_list = np.array([len(x) for x in tensor_list], dtype=np.int32)
  mask = make_pad_mask(length_list)
  return pad_sequence(tensor_list), mask


class VarianceDecoder(nn.Module):
  def __init__(self, adim: int, odim: int, dropout_rate: float):
    super(VarianceDecoder, self).__init__()
    self.conv1 = nn.Conv1d(in_channels=adim, out_channels=adim, kernel_size=3, padding=1)
    self.conv2 = nn.Conv1d(in_channels=adim, out_channels=adim, kernel_size=3, padding=1)
    self.linear = nn.Linear(adim, odim)
    self.relu = nn.ReLU()

  def forward(self, xs, xmasks):
    xs = xs.transpose(1, 2)
    xs = self.conv1(xs)
    xs = self.conv2(xs)
    xs = xs.transpose(1, 2)
    xs = self.linear(xs)
    xs = self.relu(xs)
    if xmasks is not None:
      xs = xs.masked_fill(xmasks, 0.0)
    return xs


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def g_pad_collate(tensor_list):
  ph_list = []
  dur_list = []
  pit_list = []
  eng_list = []
  for group in tensor_list:
    ph, dur, pit, eng = group
    ph_list.append(ph)
    dur_list.append(dur)
    pit_list.append(pit)
    eng_list.append(eng)
  length_list = np.array([x.shape[0] for x in ph_list], dtype=np.int32)
  mask = make_pad_mask(length_list)
  return [pad_sequence(x) for x in [ph_list, dur_list, pit_list, eng_list]], mask


g_ds = GeneralDataset("/content/data/vanilla_phoneme.npy", "/content/data/log_duration.npy", "/content/data/pitch.npy",
                      "/content/data/log_energy.npy", device)

g_train, g_val, g_test = random_split(g_ds, [10000, 2000, 1100])

g_train_dl, g_val_dl, g_test_dl = [DataLoader(x, shuffle=True, batch_size=256, collate_fn=g_pad_collate) for x
                                   in (g_train, g_val, g_test)]


class VariancePredictor(nn.Module):
  def __init__(self, idim: int, edim: int, adim: int, odim: int, kernel_size: int, num_layer: int, dropout_rate: float,
               l_phoneme, ):
    super(VariancePredictor, self).__init__()
    self.encoder = VarianceEncoder(idim, edim, adim, odim, kernel_size, num_layer, l_phoneme)
    # self.pit, self.eng, self.dur = [VarianceDecoder(adim, odim, dropout_rate) for x in range(3)]
    self.pit, self.eng, self.dur = [nn.Linear(adim, odim) for x in range(3)]

  def forward(self, xs, masks):
    data = self.encoder(xs, masks)
    pit_o = self.pit(data)
    eng_o = self.eng(data)
    dur_o = self.dur(data)
    return pit_o, eng_o, dur_o


def train(epochs):
  device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
  writer = SummaryWriter()
  model = VariancePredictor(idim=14, edim=9, adim=32, odim=1, kernel_size=3, num_layer=3, dropout_rate=0.1,
                            l_phoneme=44).to(device)
  optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.001,
    betas=(0.9, 0.98),
    eps=1e-9,
    weight_decay=0,
  )

  mae = nn.L1Loss()

  for epoch in range(epochs):
    s_time = time()
    train_loss = 0
    val_count = 0
    for [ph, dur, pit, eng], masks in g_train_dl:
      optimizer.zero_grad()
      masks = masks.transpose(0, 1).unsqueeze(-1).to(device)
      pit_o, eng_o, dur_o = model(ph, masks)
      loss_pit = mae(pit_o, pit)
      loss_eng = mae(eng_o, eng)
      loss_dur = mae(dur_o, dur)
      loss = loss_pit + loss_eng + loss_dur
      train_loss = loss.item()
      loss.backward()
      optimizer.step()
    else:
      writer.add_scalar("Loss/Duration/train", loss_dur.item(), epoch)
      writer.add_scalar("Loss/Pitch/train", loss_pit.item(), epoch)
      writer.add_scalar("Loss/Eng/train", loss_eng.item(), epoch)
      writer.add_scalar("Loss/Total/train", loss.item(), epoch)
      model.eval()
      t_loss_dur = 0
      t_loss_pit = 0
      t_loss_eng = 0
      with torch.no_grad():
        for [ph, dur, pit, eng], masks in g_val_dl:
          masks = masks.transpose(0, 1).unsqueeze(-1).to(device)
          pit_o, eng_o, dur_o = model(ph, masks)
          loss_pit = mae(pit_o, pit)
          loss_eng = mae(eng_o, eng)
          loss_dur = mae(dur_o, dur)
          t_loss_dur += loss_dur.item()
          t_loss_pit += loss_pit.item()
          t_loss_eng += loss_eng.item()
          loss += loss_pit + loss_eng + loss_dur
          val_count += 1
      writer.add_scalar("Loss/Duration/val", t_loss_dur / val_count, epoch)
      writer.add_scalar("Loss/Pitch/val", t_loss_pit / val_count, epoch)
      writer.add_scalar("Loss/Eng/val", t_loss_eng / val_count, epoch)
      writer.add_scalar("Loss/Total/val", loss.item() / val_count, epoch)

      model.train()
    if epoch % 25 == 0:
      print(f"epoch {epoch}, loss {train_loss}, time consumed: {time() - s_time}", flush=True)
    if epoch % 100 == 0:
      torch.save(model.state_dict(), f"/content/data/vp-epoch{epoch}.pth.tar")

  writer.close()


import matplotlib.pyplot as plt

import random

idx = random.randint(0, 2000)
ph, gdur, gpit, geng = g_val[idx]
print(ph.shape)
with torch.no_grad():
  model.eval()
  pit, eng, dur = model(ph.unsqueeze(1), None)

plt.plot(dur.squeeze().cpu(), color="blue")
plt.plot(gdur.cpu(), color="red")
plt.show()

plt.plot(pit.squeeze().cpu(), color="blue")
plt.plot(gpit.cpu(), color="red")
plt.show()

plt.plot(eng.squeeze().cpu(), color="blue")
plt.plot(geng.cpu(), color="red")
plt.show()
