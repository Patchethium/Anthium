import os
from typing import List

import numpy as np
import torch
import yaml
from espnet_pytorch_library.nets_utils import make_non_pad_mask
from torch import nn, optim
from torch.nn.utils.rnn import pad_sequence
from torch.utils.data.dataloader import DataLoader
from torch.utils.data.dataset import Dataset

from model.Decoder import Decoder
from model.optimizer import ScheduledOptim

from model.dataset import MelDataset, PhonemeDataset, pad_collate

train_config = yaml.load(open("config/LJSpeech/train.yaml", "r"), Loader=yaml.FullLoader)
model_config = yaml.load(open("config/LJSpeech/model.yaml", "r"), Loader=yaml.FullLoader)
preprocess_config = yaml.load(open("config/LJSpeech/preprocess.yaml", "r"), Loader=yaml.FullLoader)


def train_decoder():
  device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
  model = Decoder(model_config["decoder"]["d_model"], model_config["decoder"]["num_block"], preprocess_config["num_mels"]).to(device)

  optimizer = ScheduledOptim(model, train_config, model_config, 0)

  mel_ds = MelDataset(train_config["path"]["mel_path"])
  mel_dl = DataLoader(mel_ds, shuffle=False, batch_size=train_config["optimizer"]["batch_size"], collate_fn=pad_sequence)

  ph_ds = PhonemeDataset(train_config["path"]["variance_phoneme_path"])
  ph_dl = DataLoader(ph_ds, shuffle=False, batch_size=train_config["optimizer"]["batch_size"], collate_fn=pad_collate)

  grad_acc_step = train_config["optimizer"]["grad_acc_step"]
  grad_clip_thresh = train_config["optimizer"]["grad_clip_thresh"]
  total_step = train_config["step"]["total_step"]
  save_step = train_config["step"]["save_step"]

  step = 1
  epoch = 1

  mae = nn.L1Loss()
  while True:
    for mel, (phoneme, mask) in zip(mel_dl, ph_dl):
      opt1, opt2 = model(phoneme.transpose(0, 1), mask.unsqueeze(1))
      mel = mel.transpose(0, 1)
      print(opt1.shape, mel.shape)
      print(opt1.dtype, mel.dtype)
      loss2 = mae(opt1, mel)
      loss1 = mae(opt2, mel)
      loss = loss1 + loss2

      loss = loss / grad_acc_step
      loss.backward()

      if step % grad_acc_step == 0:
        # Clipping gradients to avoid gradient explosion
        nn.utils.clip_grad_norm_(model.parameters(), grad_clip_thresh)

        # Update weights
        optimizer.step_and_update_lr()
        optimizer.zero_grad()

      if step % save_step == 0:
        torch.save(
          {
            "model": model.module.state_dict(),
            "optimizer": optimizer._optimizer.state_dict(),
          },
          os.path.join(
            train_config["path"]["ckpt_path"],
            "{}.pth.tar".format(step),
          ),
        )

      if step == total_step:
        quit()

      step += 1
    epoch += 1
    print(f"epoch {epoch}, step: {step}, loss: {loss.item()}")



if __name__ == "__main__":
  train_decoder()
