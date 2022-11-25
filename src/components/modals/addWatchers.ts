import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  SelectMenuBuilder,
  TextInputStyle,
  ModalActionRowComponentBuilder
} from 'discord.js';

export default function createModal(): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId('addWatchers')
    .setTitle('Add new watchers');

  const subjectMenu = new SelectMenuBuilder()
  .addOptions([
    {
      label: 'Channel',
      value: 'channel',
      description: 'Watch a channel',
      emoji: '📺'
    },
    {
      label: 'Role',
      value: 'role',
      description: 'Watch a role',
      emoji: '👥'
    },
  ])
  .setPlaceholder('Select a subject')
  .setCustomId('subject');

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
      favoriteColorInput, subjectMenu
    );

  modal.addComponents(firstActionRow);
  return modal;
}
