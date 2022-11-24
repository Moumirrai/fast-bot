import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { CommandArgs, Command } from 'm-bot';

const FixCommand: Command = {
  data: new SlashCommandBuilder().setName('fix').setDescription('TODO'),

  ratelimit: {
    window: 5000,
    limit: 5
  },
  async execute({ client, interaction }: CommandArgs): Promise<void> {
    interaction.reply({
      content: 'Fixing...',
      ephemeral: true
    });

    await client.dashboard.fix(client);
  }
};

export default FixCommand;
