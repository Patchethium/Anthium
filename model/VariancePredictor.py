import torch
import torch.nn.functional as F
from torch import nn


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
    output, _ = self.lstm(data)
    if masks is not None:
      output = output.masked_fill(masks, 0.0)
    return output


class DurEngDecoder(nn.Module):
  def __init__(self, adim, odim):
    super(DurEngDecoder, self).__init__()
    self.decoder = nn.Sequential(
      nn.Linear(2 * adim, adim),
      nn.ReLU(),
      nn.Linear(adim, odim),
      nn.ReLU()
    )

  def forward(self, xs):
    xs = self.decoder(xs)
    return xs


class VarianceDecoder(nn.Module):
  def __init__(self, adim: int, odim: int):
    super(VarianceDecoder, self).__init__()
    self.conv1 = nn.Conv1d(in_channels=2 * adim, out_channels=2 * adim, kernel_size=3, padding=1)
    self.conv2 = nn.Conv1d(in_channels=2 * adim, out_channels=2 * adim, kernel_size=3, padding=1)
    self.decoder = DurEngDecoder(adim, odim)

  def forward(self, xs, mask):
    xs = xs.transpose(1, 2)
    xs = self.conv1(xs)
    xs = self.conv2(xs)
    xs = xs.transpose(1, 2)
    xs = self.decoder(xs)
    if mask is not None:
      xs = xs.masked_fill(mask, 0.0)
    return xs


class VariancePredictor(nn.Module):
  def __init__(self, idim: int, edim: int, adim: int, odim: int, kernel_size: int, num_layer: int, l_phoneme: int):
    super(VariancePredictor, self).__init__()
    self.encoder = VarianceEncoder(idim, edim, adim, odim, kernel_size, num_layer, l_phoneme)
    # self.pit, self.eng, self.dur = [VarianceDecoder(adim, odim, dropout_rate) for x in range(3)]
    self.pit = VarianceDecoder(adim, odim)
    self.eng = DurEngDecoder(adim, odim)
    self.dur = DurEngDecoder(adim, odim)

  def forward(self, xs, masks):
    data = self.encoder(xs, masks)
    pit_o = self.pit(data, masks)
    eng_o = self.eng(data)
    dur_o = self.dur(data)
    return pit_o, eng_o, dur_o
