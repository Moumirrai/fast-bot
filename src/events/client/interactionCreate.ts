import { Interaction } from 'discord.js';
import { iEvent } from 'm-bot';
import { Core } from '../../struct/Core';

const MessageEvent: iEvent = {
  name: 'interactionCreate',
  async execute(client: Core, interaction: Interaction) {
    if (interaction.user.id !== client.config.owner) {
      if (
        interaction.isChatInputCommand() ||
        interaction.isModalSubmit() ||
        interaction.isButton()
      ) {
        return interaction.reply({
          content: `You can't use this command!`,
          ephemeral: true
        });
      } else {
        return;
      }
    }
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        return interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true
        });
      }
      await command.execute({ client, interaction });
    } else if (interaction.isSelectMenu()) {
      if (!interaction.customId) {
        return interaction.reply({
          content: 'There was an error while executing this select menu!',
          ephemeral: true
        });
      }
      const menu = client.menus.get(interaction.customId);
      if (!menu) {
        return interaction.reply({
          content: 'There was an error while executing this select menu!',
          ephemeral: true
        });
      }
      await menu.execute({ client, interaction });
    }
  }
};

export default MessageEvent;
