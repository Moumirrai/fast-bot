import { Message } from 'discord.js';
import { iEvent } from 'm-bot';
import { Core } from '../../struct/Core';

const MessageEvent: iEvent = {
  name: 'messageCreate',
  async execute(client: Core, message: Message) {
    return
  }
};

export default MessageEvent;
