from espnet_pytorch_library.conformer.encoder import Encoder
from espnet_pytorch_library.tacotron2.decoder import Postnet
from torch import nn


class Decoder(nn.Module):
  """
  Several Conformer Blocks followed with a post-net, very simple
  """

  def __init__(self, d_model, num_block, output_size):
    super(Decoder, self).__init__()
    self.encoder = Encoder(
      idim=None,
      attention_dim=d_model,
      attention_heads=4,
      linear_units=d_model * 4,
      num_blocks=num_block,
      input_layer=None,
      positionwise_layer_type="conv1d",
      positionwise_conv_kernel_size=3,
      macaron_style=True,
      pos_enc_layer_type="rel_pos",
      selfattention_layer_type="rel_selfattn",
      use_cnn_module=True,
    )
    self.post = nn.Linear(d_model, output_size)
    self.postnet = Postnet(
      idim=d_model,
      odim=output_size,
      n_chans=d_model
    )

  def forward(self, phoneme, mask):
    """
    :param phoneme: Phoneme expanded with duration and concat. with pitch and energy.
    shape: [#batch, time, idim]
    """
    data, _ = self.encoder(phoneme, mask)
    output1 = self.post(data)
    output2 = output1 + self.postnet(output1.transpose(1, 2)).transpose(1, 2)
    return output1, output2
