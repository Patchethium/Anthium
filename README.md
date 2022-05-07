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

Since the web demo needs flask installed, which recommends you to work with it in a virtual env, you may want to create one with:   

```shell
# create
python -m venv venv
# activate
. venv/bin/activate
```
Then install the dependencies  

```bash
pip install -r requirement.txt
```

### Download pretrained models

Create `pretrained` folder  
```bash
mkdir pretrained
```
Download all the files from my [Google Drive](https://drive.google.com/drive/folders/1cpSD60lO3DCzcrdoVwF6zBEmV6DdQwIP?usp=sharing) and put them into `pretrained` floder, the file structure is shown below:
```
Anthe-training/
  |-pretrained/
    |-dec-step-180000.pth.tar
    |-vp-epoch-1000.pth.tar
    |-config.json
    |-generator_LJSpeech.pth.tar
  |-...
```
### Inference

```bash
python inference.py --text "Hello, world!"
```

Now you may find the synthesised audio at `./output/`.

### Web GUI

We also provide a simple web GUI, first, you need to build the svelte frontend:

```shell
cd client

# install dependencies
pnpm install

# build the frontend
pnpm build
```
then launch the server with
```shell
cd ..

flask run
```

Finally, open [localhost:5000](http://localhost:5000) in the browser, and you may find the demo page.

## Development of the web GUI

### Install dependencies
```shell
cd client

pnpm install
```
### Launch

Flask server serves a complied svelte frontend, so instead of `pnpm dev`, run

```shell
pnpm autobuild
```
Then in another terminal, run
```shell
cd ..

flask run
```

## About the name

Anthe<sup>[\[wikipedia\]](https://en.wikipedia.org/wiki/Anthe_(moon))</sup>(/ˈænθiː/;アンテ) is also known as Saturn XLIX, a very small natural satellite of Saturn, named after one of the Alkyonides; the name means flowery.

Note: At the beginning I named it after one of the Muses, Clio, but later moved to Anthe to avoid [Clio the programming language](https://github.com/clio-lang/clio).
