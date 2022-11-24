import {
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { CommandArgs, Command } from 'm-bot';

const PingCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription("Shows the bot's latency"),
    
  ratelimit: {
    window: 5000,
    limit: 5
  },
  async execute({ client, interaction }: CommandArgs): Promise<void> {
    interaction.reply({
      content: '',
      embeds: [
        new EmbedBuilder()
          .setColor(0xffcc00)
          .setTitle(`API Latency - \`${Math.round(client.ws.ping)}ms\``)
      ],
      ephemeral: true
    });
  }
};

export default PingCommand;