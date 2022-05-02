import matplotlib.pyplot as plt
import numpy as np
import torch.cuda

from model.Decoder import Decoder
from model.VariancePredictor import VariancePredictor

from util.LengthRegulator import expand
from util.frontend import get_phoneme_vec, get_phoneme

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
predictor = VariancePredictor(idim=14, edim=9, adim=32, odim=1, kernel_size=3, num_layer=3, l_phoneme=44).to(device)
decoder = Decoder(idim=16, edim=9, adim=384, odim=80, phoneme_dim=44, num_block=4).to(device)
mel_sr = 22050 / 256


def inference(text: str):
  ph_vec = get_phoneme_vec(text)
  with torch.no_grad():
    predictor.eval()
    decoder.eval()

    ph_vec = torch.from_numpy(ph_vec).unsqueeze(1)

    pit, eng, dur = [x.squeeze() for x in predictor(ph_vec, None)]

    print(dur)


    p_emb = torch.cat((ph_vec.squeeze(1), pit.unsqueeze(1), eng.unsqueeze(1)), dim=-1)

    dur = torch.exp(dur).numpy() + 1

    dur = np.rint(dur * mel_sr)

    p_emb = expand(p_emb, dur)

    opt1, opt2 = decoder(p_emb.unsqueeze(0), None)

    plt.imshow(opt2.squeeze().transpose(0, 1))
    plt.show()

    np.save("output1.npy", opt1.squeeze().numpy().T)
    np.save("output2.npy", opt2.squeeze().numpy().T)


def load_pretrained(pred_path, dec_path):
  global predictor, decoder, device
  predictor.load_state_dict(torch.load(pred_path, map_location=device))
  decoder.load_state_dict(torch.load(dec_path, map_location=device)["model"])


def main():
  load_pretrained("/home/patchethium/PycharmProjects/Clio-training/test/data/vp-epoch-1000.pth.tar",
                  "/home/patchethium/PycharmProjects/Clio-training/ckpt/80000.pth.tar")
  np.load("/home/patchethium/PycharmProjects/Clio-training/ckpt/PhonemeEmbedding.npy", allow_pickle=True).tolist()
  text = """There's a fire starting in my heart, reaching the fever which is bringing me out the dark"""
  inference(text)
  pass


if __name__ == "__main__":
  main()
