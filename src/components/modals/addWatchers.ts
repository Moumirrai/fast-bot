import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  SelectMenuOptionBuilder,
  TextInputStyle,
  ModalActionRowComponentBuilder
} from 'discord.js';

export default function createModal(): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId('addWatchers')
    .setTitle('Add new watchers');

  const subjectMenu = new SelectMenuOptionBuilder()

  //TODO: fix modals

  const favoriteColorInput = new TextInputBuilder()
    .setCustomId('verificationID')
    .setLabel('Enter your number or email address')
    .setMinLength(4)
    .setMaxLength(100)
    .setPlaceholder('Number or email address')
    .setStyle(TextInputStyle.Short);

  const firstActionRow =
    new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
      favoriteColorInput
    );

  modal.addComponents(firstActionRow);
  return modal;
}
