import os
from os import path

import numpy as np
import torch.nn
import yaml
from tqdm.auto import tqdm

from util.LengthRegulator import expand

h = yaml.load(open("../config/LJSpeech/preprocess.yaml", "r"), Loader=yaml.FullLoader)


def main():
  marks = h["marks"]

  (phoneme_list, dur_list, pit_list, eng_list, pos_list, str_list) = [
    np.load(path.join(h["variance_path"], x), allow_pickle=True) for x in
    ("phoneme.npy", "duration.npy", "pitch.npy", "log_energy.npy", "pos.npy", "stress.npy")
  ]
  emb = torch.nn.Embedding(num_embeddings=len(marks), embedding_dim=9)  # 16-3-2-1-1
  vanilla_phoneme_list = []
  variance_phoneme_list = []

  mel_fn_list = os.listdir(h["mel_path"])
  mel_fn_list.sort()

  mel_sr = h["sampling_rate"] / h["hop_size"]

  larger = 0
  less = 0

  larger_sum = 0
  less_sum = 0

  for param in emb.parameters():
    param.requires_grad = False
  for idx in tqdm(range(len(phoneme_list))):
    mel = np.load(path.join(h["mel_path"], mel_fn_list[idx]))
    p_0 = emb(torch.from_numpy(phoneme_list[idx]).int())  # [S,N], N = 9
    p_1 = torch.cat((p_0, torch.from_numpy(pos_list[idx])), 1)  # [S,N], N = 11
    p_2 = torch.cat((p_1, torch.from_numpy(str_list[idx])),
                    1)  # [S,N], N = 14; this is the input of variance predictors

    p_3 = torch.cat((p_2, torch.from_numpy(pit_list[idx]).unsqueeze(1)), 1)  # [S,N], N = 15
    p_4 = torch.cat((p_3, torch.from_numpy(eng_list[idx]).unsqueeze(1)), 1)  # [S,N], N = 16

    dur = np.rint(dur_list[idx] * mel_sr)

    p_5 = expand(p_4, dur)  # [S_mel,N], N = 16, decoder input

    if mel.shape[1] < p_5.shape[0]:
      less_sum += p_5.shape[0] - mel.shape[1]
      less += 1

      p_5 = p_5[:mel.shape[1]]
    elif mel.shape[1] > p_5.shape[0]:
      larger_sum += mel.shape[1] - p_5.shape[0]
      larger += 1

      padding = torch.ones((mel.shape[1] - p_5.shape[0], 1)) * p_5[-1]
      p_5 = torch.cat((p_5, padding), dim=0)

    vanilla_phoneme_list.append(p_2.numpy())
    variance_phoneme_list.append(p_5.numpy())

  np.save(path.join(h["output_path"], "vanilla_phoneme.npy"), np.array(vanilla_phoneme_list, dtype="object"),
          allow_pickle=True)
  np.save(path.join(h["output_path"], "variance_phoneme.npy"), np.array(variance_phoneme_list, dtype="object"),
          allow_pickle=True)

  print(f"Done. larger: {larger}, less: {less}")
  print(f"average larger sum: {larger_sum / larger}, average less sum: {less_sum / less}")


if __name__ == "__main__":
  main()
