import numpy as np
import torch


def create_expand_mat(dur):
  """
  create a 0-1 matrix where
  :param dur:
  :return:
  """
  print(dur[0])
  expand_mat = torch.zeros((int(np.sum(dur)), dur.shape[0]), dtype=torch.float32)
  col_idx = 0
  N = dur.shape[0]
  for ph_idx in range(N):
    D = dur[ph_idx]
    for _ in range(D):
      expand_mat[col_idx][ph_idx] = 1
      col_idx += 1
  return expand_mat


def expand(phoneme, dur):
  """
  expand phoneme tensor with dur
  :param phoneme: phoneme tensor in shape [S,N]
  :param dur: duration tensor in shape [S, ]
  :return:
  """
  n_dur = dur.astype(np.int32)
  return create_expand_mat(n_dur) @ phoneme
