import torch
from espnet_pytorch_library.conformer.encoder import Encoder
from espnet_pytorch_library.tacotron2.decoder import Postnet
from torch import nn


class Decoder(nn.Module):
  """
  A Several Conformer Blocks followed with a post-net, very simple
  """

  def __init__(self, idim, edim, adim, odim, phoneme_dim, num_block):
    super(Decoder, self).__init__()
    self.input_layer = nn.Embedding(phoneme_dim + 1, edim, padding_idx=0)
    self.pre = nn.Linear(idim, adim)
    self.encoder = Encoder(
      idim=None,
      attention_dim=adim,
      attention_heads=2,
      linear_units=adim * 4,
      num_blocks=num_block,
      input_layer=None,
      dropout_rate=0.2,
      positional_dropout_rate=0.2,
      attention_dropout_rate=0.2,
      normalize_before=True,
      positionwise_layer_type="conv1d",
      positionwise_conv_kernel_size=3,
      macaron_style=True,
      pos_enc_layer_type="rel_pos",
      selfattention_layer_type="rel_selfattn",
      activation_type="swish",
      use_cnn_module=True,
      cnn_module_kernel=31,
    )
    self.post = nn.Linear(adim, odim)
    self.postnet = Postnet(
      idim=None,
      odim=odim,
      n_layers=5,
      n_chans=adim,
      n_filts=5,
      use_batch_norm=True,
      dropout_rate=0.5,
    )

  def forward(self, phoneme, mask):
    """
    phoneme: Phoneme already expanded with duration and concat. with pitch and energy. shape: [S,B,N]
    """
    p_slice = phoneme[:, :, 0]
    p_variance = phoneme[:, :, 1:]
    p_slice = self.input_layer(p_slice.long())
    p_input = torch.cat((p_slice, p_variance), dim=-1)  # [S,B,N] N=16
    data1 = self.pre(p_input)
    data2, _ = self.encoder(data1, mask)
    output1 = self.post(data2)
    if mask is not None:
      output1 = output1.masked_fill(~mask.transpose(1, 2), 0.0)
    output2 = output1 + self.postnet(output1.transpose(1, 2)).transpose(1, 2)
    if mask is not None:
      output2 = output2.masked_fill(~mask.transpose(1, 2), 0.0)
    return output1, output2
