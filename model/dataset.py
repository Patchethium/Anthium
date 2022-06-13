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
        return torch.from_numpy(
            np.load(os.path.join(self.mel_path, self.fn_list[item]))
        ).T


class PhonemeDataset(Dataset):
    def __init__(self, ph_path):
        data = np.load(ph_path, allow_pickle=True)
        self.data = [torch.from_numpy(x) for x in data]

    def __len__(self):
        return len(self.data)

    def __getitem__(self, item):
        return self.data[item]


class VarianceDataset(Dataset):
    def __init__(self, ph_path):
        data = np.load(ph_path, allow_pickle=True)
        self.data = [torch.from_numpy(x).unsqueeze(-1) for x in data]

    def __len__(self):
        return len(self.data)

    def __getitem__(self, item):
        return self.data[item]


class VarGeneralDataset(Dataset):
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
    mask = make_non_pad_mask(length_list)
    return pad_sequence(tensor_list), mask
