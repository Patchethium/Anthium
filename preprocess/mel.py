"""
Part of this file comes from acoustic_feature_extractor, Kazuyuki Hiroshiba, MIT Licence
https://github.com/Hiroshiba/acoustic_feature_extractor
"""
import multiprocessing
import os

import numpy as np
from scipy.io import wavfile
from tqdm.auto import tqdm

from audio.MelSpec import Mel

h = {
  "wav_path": "/home/patchethium/LJSpeech/wavs",
  "output_path": "/home/patchethium/LJSpeech/output",
  "filter_length": 1024,
  "num_mels": 80,
  "num_freq": 1025,
  "n_fft": 1024,
  "hop_size": 256,
  "win_size": 1024,
  "sampling_rate": 22050,
  "fmin": 0,
  "fmax": 8000,
  "max_wav_value": 32768.0,
}

mel = Mel(n_fft=h["n_fft"], num_mels=h["num_mels"], sampling_rate=h["sampling_rate"], hop_size=h["hop_size"],
          win_size=h["win_size"], fmin=h["fmin"], fmax=h["fmax"])


def process(fn):
  global mel
  _, signal = wavfile.read(os.path.join(h["wav_path"], fn))
  signal = signal / h["max_wav_value"]
  spec = mel.mel_spec(signal)
  np.save(os.path.join(h["output_path"], "mel", "".join(fn.split(".")[:-1]) + ".npy"), spec)


def main():
  fn_list = os.listdir(h["wav_path"])
  with multiprocessing.Pool() as pool:
    list(tqdm(pool.imap(process, fn_list), total=len(fn_list), desc="extract_melspectrogram"))


if __name__ == "__main__":
  main()
