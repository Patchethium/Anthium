import argparse
import json
import os

import numpy as np
import torch.cuda
from scipy.io import wavfile

from model import Generator, AttrDict
from model.decoder import Decoder
from model.variance_predictor import VariancePredictor
from util.length_regulator import expand
from util.frontend import get_phoneme_vec

MAX_VALUE = 0x7FFF  # the max value of int16
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
predictor = VariancePredictor(
    idim=14, edim=9, adim=32, odim=1, kernel_size=3, num_layer=3, l_phoneme=44
).to(device)
decoder = Decoder(idim=16, edim=9, adim=384, odim=80, phoneme_dim=44, num_block=4).to(
    device
)
vocoder = None
vocoder_config = None
mel_sr = 22050 / 256  # sample_rate / hop_size


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

        p_emb = torch.cat(
            (ph_vec.squeeze(1), pit.unsqueeze(1), eng.unsqueeze(1)), dim=-1
        )

        dur = np.rint(dur * mel_sr).numpy()
        p_emb = expand(p_emb, dur)

        _, opt2 = decoder(p_emb.unsqueeze(0), None)

        wave = vocoder(opt2.transpose(1, 2))

        wave = (wave.cpu().numpy() * MAX_VALUE).astype("int16")

        if not os.path.exists("./output"):
            os.makedirs("./output", exist_ok=False)
        wavfile.write(os.path.join("./output", "{}.wav".format(h.text)), 22050, wave)


def load_pretrained():
    global predictor, decoder, vocoder, device
    predictor.load_state_dict(
        torch.load("./pretrained/vp-epoch-1000.pth.tar", map_location=device)
    )
    predictor.to(device)
    decoder.load_state_dict(
        torch.load("./pretrained/dec-step-180000.pth.tar", map_location=device)["model"]
    )
    decoder.to(device)
    with open("./pretrained/config.json", "r") as conf:
        config = json.load(conf)
    config = AttrDict(config)
    vocoder = Generator(config)
    vocoder.load_state_dict(
        torch.load("./pretrained/generator_LJSpeech.pth.tar", map_location=device)[
            "generator"
        ]
    )
    vocoder.remove_weight_norm()
    vocoder.to(device)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--text", default="")
    parser.add_argument("--pit_scale", default=1.0)
    parser.add_argument("--eng_scale", default=1.0)
    parser.add_argument("--dur_scale", default=1.0)

    a = parser.parse_args()

    load_pretrained()

    inference(a)


if __name__ == "__main__":
    main()
