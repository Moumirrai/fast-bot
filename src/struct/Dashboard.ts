import { UserData } from 'm-bot';
import { Core } from './Core';
import Logger from './Logger';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, ButtonStyle } from 'discord.js';

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

  public static async update(client: Core) {
    let data = client.db.user.get('data') as UserData;
    let oldTerms = client.scrapper.lastData
      ? client.scrapper.lastData.map((subject) => subject.terms).flat()
      : [];

    let watchListTerms = oldTerms.filter((term) =>
      data.watchlist.includes(term.hash)
    );

    let embed = new EmbedBuilder()
      .setTitle('Dashboard')
      .setColor(0xffcc00)
      .setDescription(
        `You are watching ${data.watchlist.length} terms`
      )
    if (watchListTerms.length > 0) {
      embed.addFields({ name: 'Watchlist', value: watchListTerms.map((term) => { return `${term.title} - **${term.termin}**`}).join('\n') });
    }

    //create action row
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
          .setCustomId('addWatcher')
          .setLabel('Add watcher')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('removeWatcher')
          .setLabel('Remove watcher')
          .setStyle(ButtonStyle.Danger),
    ) as ActionRowBuilder<ButtonBuilder>;

    client.userChannel.send({
      embeds: [embed],
      components: oldTerms ? [row] : []
    });
  }
}
