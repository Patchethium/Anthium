import argparse
import json
import os

import matplotlib.pyplot as plt
import numpy as np
import torch.cuda
from scipy.io import wavfile

from model import Generator, AttrDict
from model.decoder import Decoder
from model.variance_predictor import VariancePredictor
from util.LengthRegulator import expand
from util.frontend import get_phoneme_vec

MAX_VALUE = 0x7FFF
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
predictor = VariancePredictor(idim=14, edim=9, adim=32, odim=1, kernel_size=3, num_layer=3, l_phoneme=44).to(device)
decoder = Decoder(idim=16, edim=9, adim=384, odim=80, phoneme_dim=44, num_block=4).to(device)
vocoder = None
vocoder_config = None
mel_sr = 22050 / 256


def inference(h):
  ph_vec = get_phoneme_vec(h.text)
  with torch.no_grad():
    predictor.eval()
    decoder.eval()
    vocoder.eval()

    ph_vec = torch.from_numpy(ph_vec).unsqueeze(1)

    pit, eng, dur = [x.squeeze() for x in predictor(ph_vec, None)]

    dur *= float(h.dur_scale)
    pit *= float(h.pit_scale)
    eng *= float(h.eng_scale)

    p_emb = torch.cat((ph_vec.squeeze(1), pit.unsqueeze(1), eng.unsqueeze(1)), dim=-1)

    dur = np.rint(dur * mel_sr).numpy()
    p_emb = expand(p_emb, dur)

    opt1, opt2 = decoder(p_emb.unsqueeze(0), None)

    wave = vocoder(opt2.transpose(1,2))

    wave = (
        wave.cpu().numpy()
        * MAX_VALUE
    ).astype("int16")

    if not os.path.exists("./output"):
      os.makedirs("./output", exist_ok=False)
    wavfile.write(os.path.join("./output", "{}.wav".format(h.text)), 22050, wave)


def load_pretrained(pred_path, dec_path, voc_conf_path, voc_gen_path):
  global predictor, decoder, vocoder, device
  predictor.load_state_dict(torch.load(pred_path, map_location=device))
  predictor.to(device)
  decoder.load_state_dict(torch.load(dec_path, map_location=device)["model"])
  decoder.to(device)
  with open(voc_conf_path, "r") as conf:
    config = json.load(conf)
  config = AttrDict(config)
  vocoder = Generator(config)
  vocoder.load_state_dict(torch.load(voc_gen_path, map_location=device)["generator"])
  vocoder.remove_weight_norm()
  vocoder.to(device)


def main():
  parser = argparse.ArgumentParser()
  parser.add_argument('--pretrained_path', default=None)
  parser.add_argument("--text", default="")
  parser.add_argument("--pit_scale", default=1.0)
  parser.add_argument("--eng_scale", default=1.0)
  parser.add_argument("--dur_scale", default=1.0)

  a = parser.parse_args()

  vp_path = os.path.join(a.pretrained_path, "vp-epoch-1000.pth.tar")
  decoder_path = os.path.join(a.pretrained_path, "dec-step-180000.pth.tar")
  vocoder_config_path = os.path.join(a.pretrained_path, "config.json")
  vocoder_generator_path = os.path.join(a.pretrained_path, "generator_LJSpeech.pth.tar")

  load_pretrained(vp_path, decoder_path, vocoder_config_path, vocoder_generator_path)

  inference(a)
  pass


if __name__ == "__main__":
  main()
