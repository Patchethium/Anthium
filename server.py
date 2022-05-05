import argparse

from flask import Flask, jsonify, send_from_directory

app = Flask(__name__)
app.config.from_object(__name__)

# Serve Svelte apps
@app.route("/<path:path>")
def svelte_client(path):
    return send_from_directory('../client/public/', path)

def main():
  parser = argparse.ArgumentParser()
  parser.add_argument("-p", "--pretrained", default="./pretrained", help="path to pretrained models")


  app.run()

if __name__ == '__main__':
  main()