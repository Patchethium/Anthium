import librosa
import numpy as np
import torch
from torch.nn.functional import pad


def dynamic_range_compression(x, C=1, clip_val=1e-5):
    return np.log(np.clip(x, a_min=clip_val, a_max=None) * C)


def dynamic_range_decompression(x, C=1):
    return np.exp(x) / C


def dynamic_range_compression_torch(x, C=1, clip_val=1e-5):
    return torch.log(torch.clamp(x, min=clip_val) * C)


def dynamic_range_decompression_torch(x, C=1):
    return torch.exp(x) / C


def spectral_normalize_torch(magnitudes):
    output = dynamic_range_compression_torch(magnitudes)
    return output


def spectral_de_normalize_torch(magnitudes):
    output = dynamic_range_decompression_torch(magnitudes)
    return output


class Mel:
    def __init__(
        self,
        n_fft,
        num_mels,
        sampling_rate,
        hop_size,
        win_size,
        fmin,
        fmax,
        center=False,
        **_,
    ):
        self.n_fft = n_fft
        self.hop_size = hop_size
        self.sr = sampling_rate
        self.win_size = win_size
        self.window = torch.hann_window(win_size)
        self.mel = torch.from_numpy(
            librosa.filters.mel(
                sr=sampling_rate, n_fft=n_fft, n_mels=num_mels, fmin=fmin, fmax=fmax
            )
        )
        self.num_mels = num_mels
        self.fmin = fmin
        self.fmax = fmax
        self.center = center

    def mel_spec(self, data):
        y = torch.from_numpy(data)
        y = pad(
            y.unsqueeze(0),
            (int((self.n_fft - self.hop_size) / 2), int((self.n_fft - self.hop_size) / 2)),
            mode="reflect",
        )
        spec = torch.stft(
            input=y,
            n_fft=self.n_fft,
            hop_length=self.hop_size,
            window=self.window,
            win_length=self.win_size,
            center=self.center,
            pad_mode="reflect",
            return_complex=False
        )
        spec = torch.sqrt(spec.pow(2).sum(-1) + (1e-9)).float()
        spec = torch.matmul(self.mel, spec)
        spec = spectral_normalize_torch(spec)
        return spec.numpy()

