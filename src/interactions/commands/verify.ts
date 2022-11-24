import {
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { CommandArgs, Command } from 'm-bot';
import initModal from '../../components/modals/initVerification';

const VerifyCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription("Verifies your account"),
  ratelimit: {
    window: 5000,
    limit: 5
  },
  async execute({ client, interaction }: CommandArgs): Promise<void> {
    const modal = initModal();
    await interaction.showModal(modal);
  }
};

export default VerifyCommand;