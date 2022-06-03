import yaml

config = None

class Config:
  def __init__(corpus: str):
    config_path = "..corpus/{corpus}/config.yaml"
    try:
      with open(config_path, "r") as stream:
        conf_dict = yaml.load_all(stream)
    except:
      print("Failed to read config from corpus {corpus}")
    self.conf_dict = conf_dict
  
  def __call__(self):
    return self.conf_dict

def get_config(corpus: str):
  """
  get a parsed config from the corpse specified
  
  corpus: string, the corpus name, which means name of the folder containing all the stuff

  """
  if config is None:
    config = Config(corpus)
  return config