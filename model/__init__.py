from .hifigan import Generator
from .variance_predictor import VariancePredictor
from .decoder import Decoder
from .optimizer import ScheduledOptim
from .dataset import PhonemeDataset, MelDataset, VarGeneralDataset


class AttrDict(dict):
    def __init__(self, *args, **kwargs):
        super(AttrDict, self).__init__(*args, **kwargs)
        self.__dict__ = self

