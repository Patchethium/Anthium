# Anthe-training

Training recipe for the TTS system [Anthe](https://github.com/Patchethium/Anthe).

This project is still in its very early stage, don't expect you'd find anything useful here for now.

## Inferencing

At this point this repostory only supports inferencing from pretrained models, I'll update the preprocessing and training part as soon as possible.

### Clone this repo

```bash
git clone https://github.com/Patchethium/Anthe-training.git
cd Anthe-training
```

### Install dependencies
```bash
pip install -r requirement.txt
```

### Download pretrained models

Download all the files from my [Google Drive](https://drive.google.com/drive/folders/1cpSD60lO3DCzcrdoVwF6zBEmV6DdQwIP?usp=sharing) and put them into a directory like below:
```
-folder
  -dec-step-180000.pth.tar
  -vp-epoch-1000.pth.tar
  -config.json
  -generator_LJSpeech.pth.tar
```
### Inference

```python
python inference.py --text "Hello, world!" --pretrained_path /home/.../folder
```

Now you may find the synthesised audio at `./output/`.

## About the name

Anthe<sup>[\[wikipedia\]](https://en.wikipedia.org/wiki/Anthe_(moon))</sup>(/ˈænθiː/;アンテ) is also known as Saturn XLIX, a very small natural satellite of Saturn, named after one of the Alkyonides; the name means flowery.

Note: At the beginning I named it after one of the Muses, Clio, but later moved to Anthe to avoid [Clio the programming language](https://github.com/clio-lang/clio).
