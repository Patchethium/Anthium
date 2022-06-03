import yaml
import traceback
import os
import collections


class DictWrapper(collections.Mapping):
    def __init__(self, data):
        self._data = data

    def __getitem__(self, key):
        return self._data[key]

    def __len__(self):
        return len(self._data)

    def __iter__(self):
        return iter(self._data)


def get_config(corpus: str):
    base = os.getcwd()
    yaml_path = os.path.join(base, "corpus", corpus, "config.yaml")
    yml_path = os.path.join(base, "corpus", corpus, "config.yml")

    # umm, ugly...
    try:
        stream = open(yaml_path, "r")
    except:
        try:
            stream = open(yml_path, "r")
        except:
            print(f"Failed reading config file of {corpus}")
            print(traceback.format_exc())
    conf_dict = yaml.safe_load(stream)
    stream.close()
    return conf_dict

