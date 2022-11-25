import { Button, ButtonArgs } from 'm-bot';
import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} from 'discord.js';

const unwatchButton: Button = {
  id: 'watchButton',
  ratelimit: {
    window: 5000,
    limit: 5
  },
  async execute({ client, interaction, param }: ButtonArgs): Promise<void> {
    interaction.reply({
      content: `TODO: unwatch ${param}`,
      ephemeral: true
    });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('watchButton#'+param)
        .setLabel('Watch')
        .setStyle(ButtonStyle.Primary)
    ) as ActionRowBuilder<ButtonBuilder>;

    interaction.update({ components: [row] });
  }
};

export default unwatchButton;