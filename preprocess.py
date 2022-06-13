import argparse
import os
import subprocess
import numpy as np

from scipy.io import wavfile
from preprocess.mel import Mel
import matplotlib.pyplot as plt
from typing import Dict

from util.config import get_config


def extract_mel(config: Dict):
    print("Extracting mel spectrogram")
    mel = Mel(**config)
    rs, data = wavfile.read("test/LJ001-0001.wav")
    max_value = np.iinfo(data.dtype).max
    data = data.astype(np.float32)
    data /= max_value
    spec = mel.mel_spec(data)
    plt.imshow(np.squeeze(spec))
    plt.show()
    pass


def extract_duration(config: Dict):
    pass


def extract_pitch():
    pass


def extract_energy():
    pass


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-c", "--corpus", default="Default")

    a = parser.parse_args()

    corpus = a.corpus

    if a.corpus == "Default":
        avaliable_corpus = os.listdir("corpus")
        if len(avaliable_corpus) == 0:
            print("Corpus not found")
            exit(0)
        else:
            print("Corpus name not specified,\n using the first corpus by alphabet")
            corpus = avaliable_corpus[0]

    config = get_config(corpus)
    extract_mel(config)


if __name__ == "__main__":
    main()
