import argparse

import numpy as np
import torch
from flask import Flask, jsonify, send_from_directory

from model import VariancePredictor, Decoder

MAX_VALUE = 0x7FFF  # the max value of int16
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
predictor = VariancePredictor(idim=14, edim=9, adim=32, odim=1, kernel_size=3, num_layer=3, l_phoneme=44).to(device)
decoder = Decoder(idim=16, edim=9, adim=384, odim=80, phoneme_dim=44, num_block=4).to(device)

def load_pretrained(path):
  pass
predictor = VariancePredictor(idim=14, edim=9, adim=32, odim=1, kernel_size=3, num_layer=3, l_phoneme=44).to(device)
decoder = Decoder(idim=16, edim=9, adim=384, odim=80, phoneme_dim=44, num_block=4).to(device)

app = Flask(__name__)
app.config.from_object(__name__)

def jsonifyAccentPhrase(dur: np.ndarray, pit: np.ndarray, eng: np.ndarray, phoneme: List[Tuple]):
  pass

# Serve Svelte apps
@app.route("/<path:path>")
def svelte_client(path):
  return send_from_directory('../client/public/build', path)

@app.route("/accent_phrases")
def accentPhrases(text):
  pass

def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("-p", "--pretrained", default="./pretrained", help="path to pretrained models")
  a = parser.parse_args()
  load_pretrained(a.pretrained)
  app.run()

if __name__ == '__main__':
  main()