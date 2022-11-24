import { iEvent } from 'm-bot';

const ReadyEvent: iEvent = {
  name: 'ready',
  async execute(client) {
    client.logger.info(`Logged in as ${client.user.tag}`);
  }
};

export default ReadyEvent;
