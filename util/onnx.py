import argparse
from os import path

from torch import onnx
from model.decoder import Decoder
from model.variance_predictor import VariancePredictor


def export(a):
    if a.type == "decoder":
        model_path = Decoder()
    elif a.type == "predictor":
        model_path = path.join(a.pretrained_path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pretrained_path", default=None)
    parser.add_argument("--output_path", default="../output")
    parser.add_argument("--type", default="decoder")
    parser.add_argument("--config_path", default="../config/LJSpeech/model.yaml")

    a = parser.parse_args()
    export(a)


if __name__ == "__main__":
    main()

