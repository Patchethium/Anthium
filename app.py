import argparse
import json
import os
from typing import List, Dict

import numpy as np
import torch
from flask import Flask, send_from_directory, request, jsonify, send_file
from g2p_en import G2p
from scipy.io import wavfile

from model import VariancePredictor, Decoder, AttrDict, Generator
from util.LengthRegulator import expand
from util.frontend import get_phoneme_vec, extract_stress, marks

MAX_VALUE = 0x7FFF  # the max value of int16
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
predictor = VariancePredictor(idim=14, edim=9, adim=32, odim=1, kernel_size=3, num_layer=3, l_phoneme=44).to(device)
decoder = Decoder(idim=16, edim=9, adim=384, odim=80, phoneme_dim=44, num_block=4).to(device)
vocoder = None
mel_sr = 22050 / 256  # sample_rate / hop_size

g2p = G2p()


def load_pretrained():
  global predictor, decoder, vocoder
  predictor.load_state_dict(torch.load("/home/patchethium/PycharmProjects/Anthe-training/pretrained/vp-epoch-1000.pth.tar", map_location=device))
  decoder.load_state_dict(torch.load("/home/patchethium/PycharmProjects/Anthe-training/pretrained/dec-step-180000.pth.tar", map_location=device)["model"])
  predictor.eval()
  decoder.eval()
  with open("/home/patchethium/PycharmProjects/Anthe-training/pretrained/config.json", "r") as conf:
    config = json.load(conf)
  config = AttrDict(config)
  vocoder = Generator(config)
  vocoder.load_state_dict(torch.load("/home/patchethium/PycharmProjects/Anthe-training/pretrained/generator_LJSpeech.pth.tar", map_location=device)["generator"])
  vocoder.remove_weight_norm()
  vocoder.eval()


app = Flask(__name__)
app.config.from_object(__name__)


def serialize_accent_phrases(dur: np.ndarray, pit: np.ndarray, eng: np.ndarray, phoneme: Dict[str, List[str]]):
  res = []
  idx = 0
  for k, v in phoneme.items():
    mark_list = []
    for mark in v:
      ph, stress = extract_stress(mark)
      mark_list.append(
        {
          "dur": float(dur[idx].squeeze()),
          "pit": float(pit[idx].squeeze()),
          "eng": float(eng[idx].squeeze()),
          "mark": ph,
          "stress": stress
        }
      )
      idx += 1
    res.append({"word": k, "marks":mark_list})
  return res


def deserialize_accent_phrases(accent_phrase):
  phoneme_list_vec = []
  dur_list = []
  for accent_item in accent_phrase:
    for i, mark in enumerate(accent_item["marks"]):
      ph_vec = np.array([marks.index(mark["mark"]) + 1], dtype="float32")

      pos_vec = np.zeros((2,), dtype="float32")
      if i == 0:
        pos_vec[0] = 1.
      if i == len(accent_item["marks"]) - 1:
        pos_vec[1] = 1.

      stress = mark["stress"]
      stress_vec = np.zeros((3,), dtype="float32")
      if stress is not None:
        stress_vec[stress] = 1.

      dur = torch.Tensor([mark["dur"]])
      pit = torch.Tensor([mark["pit"]])
      eng = torch.Tensor([mark["eng"]])

      input_vec = np.concatenate((ph_vec, pos_vec, stress_vec, pit, eng), axis=-1)

      dur_list.append(dur)
      phoneme_list_vec.append(input_vec)

  ph = np.stack(phoneme_list_vec)

  dur = np.stack(dur_list)

  dur = np.rint(dur * mel_sr)

  opt = expand(ph, dur.squeeze())

  print(opt.shape)
  print(opt[:,0])

  return opt



def pred_accent_phrases(text: str):
  phoneme = g2p(text, get_mapping=True)
  phoneme_vec = get_phoneme_vec(text)
  phoneme_vec = torch.from_numpy(phoneme_vec).unsqueeze(1)

  with torch.no_grad():
    pit, eng, dur = [x.squeeze() for x in predictor(phoneme_vec, None)]

  accent_phrases = serialize_accent_phrases(dur, pit, eng, phoneme)

  return accent_phrases

def _synthesis(accent_phrases):
  with torch.no_grad():
    _, mel = decoder(deserialize_accent_phrases(accent_phrases).unsqueeze(0), None)
    print(mel.shape)
    wave = vocoder(mel.transpose(1, 2))

  wave = (
      wave.cpu().numpy()
      * MAX_VALUE
  ).astype("int16")

  if not os.path.exists("./output"):
    os.makedirs("./output", exist_ok=False)
  wavfile.write(os.path.join("./output", "result.wav"), 22050, wave)


@app.before_first_request
def _prepare():
  print("hello, world!")
  load_pretrained()


# Serve Svelte apps
@app.route("/<path:path>")
def svelte_client(path):
  return send_from_directory('../client/public/build', path)


@app.route("/accent_phrases", methods=["GET"])
def get_accent_phrases():
  text = request.args.get("text", type=str)
  return jsonify(pred_accent_phrases(text))

@app.route("/synthesis", methods=["POST"])
def synthesis():
  accent_phrases = request.json
  _synthesis(accent_phrases)
  return send_file("./output/result.wav", as_attachment=True)


def main():

  app.run()


if __name__ == '__main__':
  main()