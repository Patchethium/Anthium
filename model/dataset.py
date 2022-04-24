import os
from typing import List

import numpy as np
import torch
from espnet_pytorch_library.nets_utils import make_non_pad_mask
from torch.nn.utils.rnn import pad_sequence
from torch.utils.data.dataset import Dataset


class MelDataset(Dataset):
  def __init__(self, mel_path):
    self.mel_path = mel_path
    self.fn_list = os.listdir(mel_path)
    self.fn_list.sort()

  def __len__(self):
    return len(self.fn_list)

  def __getitem__(self, item):
    return torch.from_numpy(np.load(os.path.join(self.mel_path, self.fn_list[item]))).T


class PhonemeDataset(Dataset):
  def __init__(self, ph_path):
    data = np.load(ph_path, allow_pickle=True)
    self.data = [torch.from_numpy(x) for x in data]

  def __len__(self):
    return len(self.data)

  def __getitem__(self, item):
    return self.data[item]


def pad_collate(tensor_list: List[torch.Tensor]):
  length_list = np.array([len(x) for x in tensor_list], dtype=np.int32)
  mask = make_non_pad_mask(length_list)
  return pad_sequence(tensor_list), mask
