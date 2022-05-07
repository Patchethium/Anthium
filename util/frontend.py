import string

import numpy
import numpy as np
import torch
from g2p_en import G2p

g2p = G2p()

marks = ['', 'AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'B', 'CH', 'D', 'DH', 'EH', 'ER', 'EY', 'F', 'G',
         'HH', 'IH', 'IY', 'JH', 'K', 'L', 'M', 'N', 'NG', 'OW', 'OY', 'P', 'R', 'S', 'SH', 'T',
         'TH', 'UH', 'UW', 'V', 'W', 'Y', 'Z', 'ZH', 'sil', 'sp', 'spn']


def extract_stress(p:str):
  stress = None
  if len(p) == 3 and p != "sil" and p != "spn":
    ph = p[0: 2]
    stress = int(p[-1])
  elif p in string.punctuation:
    ph = "sp"
  else:
    ph = p

  return ph, stress


def get_phoneme(text: str):
  return g2p(text, get_mapping=True)


def get_phoneme_vec(text: str):
  a = get_phoneme(text)
  phoneme_list_vec = []
  for k, v in a.items():
    for i, p in enumerate(v):
      ph, stress = extract_stress(p)

      ph_vec = numpy.array([marks.index(ph) + 1], dtype="float32")

      pos_vec = np.zeros((2,), dtype="float32")
      if i == 0:
        pos_vec[0] = 1.
      if i == len(v) - 1:
        pos_vec[1] = 1.

      stress_vec = np.zeros((3,), dtype="float32")
      if stress is not None:
        stress_vec[stress] = 1.

      input_vec = np.concatenate((ph_vec, pos_vec, stress_vec), axis=-1)
      phoneme_list_vec.append(input_vec)

  return np.stack(phoneme_list_vec)


if __name__ == "__main__":
  print(get_phoneme("Printing, in the only sense of which we are concerned"))