# Anthe-training

Training recipe for the TTS system [Anthe](https://github.com/Patchethium/Anthe).

This project is still in its **very** early stage, don't expect you'd find anything useful here for now.

## Inference

At this point this repository only supports inference from pre-trained models, I'll update the preprocessing and training part as soon as possible.

### Clone this repository

```bash
git clone https://github.com/Patchethium/Anthe-training.git
cd Anthe-training
```

### Install dependencies

Since the web demo needs flask installed, which recommends you to work with it in a virtual environment, you may want to create one with:   

```shell
# create
python -m venv venv
# activate
. venv/Scripts/activate
```
Then install the dependencies  

```bash
pip install -r requirement.txt
```

### Download pre-trained models

Create `pretrained` folder  
```bash
mkdir pretrained
```
Download all the files from my [Google Drive](https://drive.google.com/drive/folders/1cpSD60lO3DCzcrdoVwF6zBEmV6DdQwIP?usp=sharing) and put them into `pretrained` folder, the file structure is shown below:
```
Anthe-training/
  |-pretrained/
    |-dec-step-180000.pth.tar
    |-pp-epoch-100.pth.tar
    |-dp-epoch-100.pth.tar
    |-vp-epoch-100.pth.tar
    |-config.json
    |-generator_LJSpeech.pth.tar
  |-...
```
### Web GUI

We provide a simple web GUI for inference.  
First, you need to build the svelte frontend:

```shell
cd client

# install dependencies
pnpm install

# build the frontend
pnpm build
```
then launch the server
```shell
cd ..

flask run
```

open [localhost:5000](http://localhost:5000) in the browser, and you may find the demo page.

## Development of the web GUI

### Install dependencies
```shell
cd client

pnpm install
```
### Launch

Flask serves a complied svelte frontend, so instead of `pnpm dev`, run

```shell
pnpm autobuild
```
Then in another terminal, run
```shell
cd ..
# set the debug mode for flask
# for Linux and OS X
export FLASK_ENV=development
# for Windows Powershell
$env:FLASK_ENV = "development"

flask run
```

## About the name

Anthe<sup>[\[wikipedia\]](https://en.wikipedia.org/wiki/Anthe_(moon))</sup>(/ˈænθiː/;アンテ) is also known as Saturn XLIX, a very small natural satellite of Saturn, named after one of the Alkyonides; the name means flowery.

## License

This repository(training recipe for Anthe) is released under GNU General Public License Version 3.