import { UserData } from 'm-bot';
import { Core } from './Core';
import Logger from './Logger';
import { EmbedBuilder } from 'discord.js';

export default class dashboard {
  /**
   * Escapes regex characters in a string
   * @param  {string} string
   * @returns {string}
   */

  public static async fix(client: Core) {
    let ownerId = client.config.owner;
    client.userChannel = await client.users.createDM(ownerId);
    let oldMessage = client.db.user.get('data') as UserData;
    if (oldMessage) {
      await client.userChannel.messages
        .fetch(oldMessage.message)
        .then((message) => message.delete())
        .catch((err) => {
          Logger.error(err);
          return
        });
    }
    await this.generateMessage(client);
    return
  }

  public static async generateMessage(client: Core) {
    const exampleEmbed = { title: 'Iinitializing...', color: 0xffcc00 };
    const message = await client.userChannel
      .send({ embeds: [exampleEmbed] })
      .catch((err) => {
        Logger.error(err);
        return
      });
    if (message) {
      let oldData = client.db.user.get('data') as UserData;
      client.db.user.set('data', {
        notifyOnNew: oldData ? oldData.notifyOnNew : true,
        watchlist: oldData ? oldData.watchlist : [],
        message: message.id
      });
      client.dashboardMessage = message;
    } else {
      return Logger.error('Message not sent');
    }
  }
}
