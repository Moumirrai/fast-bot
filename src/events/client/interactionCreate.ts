import {
  ChatInputCommandInteraction,
  Interaction,
  InteractionType
} from 'discord.js';
import { iEvent } from 'm-bot';
import { Core } from '../../struct/Core';

const MessageEvent: iEvent = {
  name: 'interactionCreate',
  async execute(client: Core, interaction: Interaction) {
    if (interaction.user.id !== client.config.owner) {
      if (interaction.isChatInputCommand() || interaction.isModalSubmit() || interaction.isButton()) {
        return interaction.reply({
          content: `You can't use this command!`,
          ephemeral: true
        });
      } else {
        return;
      }
    };
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        return interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true
        });
      }
      await command.execute({ client, interaction });
    } else if (interaction.isModalSubmit()) {
      const modal = client.modals.get(interaction.customId);
      if (!modal) {
        return interaction.reply({
          content: 'There was an error while executing this modal!',
          ephemeral: true
        });
      }
      await modal.execute({ client, interaction });
    } /*
    else if (interaction.isButton()) {
      if (!interaction.customId) {
        return interaction.reply({
          content: 'There was an error while executing this button!',
          ephemeral: true
        });
      }
      let params = interaction.customId.split('#');
      let buttonType = params.shift();
      const button = client.buttons.get(buttonType);
      if (!button) {
        return interaction.reply({
          content: 'There was an error while executing this button!',
          ephemeral: true
        });
      }
      await button.execute({ client, interaction, param: params[0] });
      //console.log(interaction.customId);
    }
    */
   else if (interaction.isSelectMenu()) {
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

    /*
    if (interaction.type !== 2) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      return interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
    await command.execute({ client, interaction});

    */

    /*
    if (!message.content || !message.guild || message.author.bot) return;
    if (!message.content.startsWith(client.config.prefix)) return;
    const args = message.content
      .slice(client.config.prefix.length)
      .split(' ')
      .filter(Boolean);
    const commandArg = args.shift()?.toLowerCase();
    if (!commandArg) return;
    const command =
      client.commands.get(commandArg) || client.aliases.get(commandArg);
    if (!command) return;

    await command.execute({
      client,
      message,
      args
    });
    */
  }
};

export default MessageEvent;
