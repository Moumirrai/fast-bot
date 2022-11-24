import { Modal, ModalArgs } from 'm-bot';

const initVerificationModal: Modal = {
  id: 'initVerification',
  ratelimit: {
    window: 5000,
    limit: 5
  },
  async execute({ client, interaction }: ModalArgs): Promise<void> {
    const query = interaction.fields.getTextInputValue('verificationID');
    interaction.reply({
      content: 'You entered: ' + query,
      ephemeral: true
    });
  }
};

export default initVerificationModal;