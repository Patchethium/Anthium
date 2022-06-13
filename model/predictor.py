from torch import nn
import torch
import torch.nn.functional as F


class Conv(nn.Module):
    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        kernel_size: int,
        dilation=1,
        padding=0,
    ):
        super(Conv, self).__init__()
        self.conv = nn.Conv1d(
            in_channels,
            out_channels,
            kernel_size=kernel_size,
            dilation=dilation,
            padding=padding,
        )

    def forward(self, data):
        data = data.transpose(1, 2)
        data = self.conv(data)
        data = data.transpose(1, 2)
        return data


class VariancePredictor(nn.Module):
    """
    Diated CNN with a BiLSTM
    """

    def __init__(
        self,
        idim: int,
        edim: int,
        adim: int,
        odim: int,
        kernel_size: int,
        num_layer: int,
        l_phoneme: int,
    ):
        super(VariancePredictor, self).__init__()
        self.input_layer = nn.Embedding(l_phoneme, edim, padding_idx=0)
        self.pre = nn.Linear(idim, adim)

        self.lstm = nn.LSTM(input_size=adim, hidden_size=adim, bidirectional=True)

        self.convs = nn.ModuleList(
            [
                nn.utils.weight_norm(
                    nn.Conv1d(
                        in_channels=2 * adim,
                        out_channels=2 * adim,
                        kernel_size=kernel_size,
                        dilation=kernel_size ** i,
                        padding=kernel_size ** i * (kernel_size // 2),
                    )
                )
                for i in range(num_layer)
            ]
        )

        self.post = nn.Linear(2 * adim, odim)

    def init_hidden(self, batch_size):
        hidden_state = torch.zeros(self.n_layers, batch_size, self.n_hidden)
        cell_state = torch.zeros(self.n_layers, batch_size, self.n_hidden)
        return (hidden_state, cell_state)

    def forward(self, phoneme, masks):
        ph_slice = phoneme[:, :, 0]
        p_var = phoneme[:, :, 1:]
        ph_emb = self.input_layer(ph_slice.long())
        ph_input = torch.cat((ph_emb, p_var), dim=-1)
        data = self.pre(ph_input)
        data, _ = self.lstm(data)
        data = data.transpose(1, 2)
        for conv in self.convs:
            data = data + conv(F.dropout(F.relu(data), p=0.1))
        data = data.transpose(1, 2)
        if masks is not None:
            data = data.masked_fill(masks, 0.0)
        data = F.relu(self.post(data))
        return data
