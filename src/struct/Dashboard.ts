import { UserData } from 'm-bot';
import { Core } from './Core';
import Logger from './Logger';
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  SelectMenuBuilder,
  ButtonStyle
} from 'discord.js';
import { TerminData } from 'vut-scraper';

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
          return;
        });
    }
    await this.generateMessage(client);
    return;
  }

  public static async generateMessage(client: Core) {
    const exampleEmbed = { title: 'Iinitializing...', color: 0xffcc00 };
    const message = await client.userChannel
      .send({ embeds: [exampleEmbed] })
      .catch((err) => {
        Logger.error(err);
        return;
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
    let oldTerms = client.scrapper.lastData;
    let category = client.db.user.get('category') as string;
    let filtereTerms: Array<TerminData> = [];

    if (oldTerms) {
      let filteredSubjects = oldTerms;
      if (category) {
        if (category !== 'all') {
          filteredSubjects = oldTerms.filter((subject) => {
            return subject.title === category;
          });
        }
      }
      filtereTerms = filteredSubjects.map((subject) => subject.terms).flat();
    } else {
      filtereTerms = [];
    }

    let watchListTerms = filtereTerms
      ? (filtereTerms as Array<TerminData>).filter((term) =>
          data.watchlist.includes(term.hash)
        )
      : [];

    let embed = new EmbedBuilder()
      //.setTitle('Dashboard')
      .setTitle('Running')
      .setColor(0xffcc00)
      /*
      .setDescription(`You are watching ${data.watchlist.length} terms`)
      .setFooter({ text: `Filter - ${category ? category : 'all'}` });
      
    if (watchListTerms.length > 0) {
      embed.addFields({
        name: 'Watchlist',
        value: watchListTerms
          .map((term, index) => {
            return `${index}. ${term.title} - **${term.termin}**`;
          })
          .join('\n')
      });
    }
    */

    let components: Array<ActionRowBuilder<SelectMenuBuilder>> = [];
    //create action row
    const subjectRow = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId('selectSubject')
        .setPlaceholder('Select a subject')
        .addOptions(
          client.scrapper.lastData.map((subject) => {
            return {
              label: subject.title,
              value: subject.title
            };
          })
        )
        .addOptions([
          {
            label: 'All',
            value: 'all'
          }
        ])
    );
    components.push(subjectRow);

    let watchTermRow: ActionRowBuilder<SelectMenuBuilder> = null;

    if (filtereTerms && filtereTerms.length > 0) {
      watchTermRow = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
        new SelectMenuBuilder()
          .setCustomId('watchTerm')
          .setPlaceholder('Watch term')
          .setMaxValues(filtereTerms.length)
          .setMinValues(1)
          .addOptions(
            filtereTerms.map((term) => {
              return {
                label: `${term.termin} - ${term.filled ? 'FULL' : `${term.spots.taken}/${term.spots.total}`}`,
                value: String(term.hash),
                description: term.title
              };
            })
          )
      );
      components.push(watchTermRow);
    }

    let unwatchTermRow: ActionRowBuilder<SelectMenuBuilder> = null;

    if (watchListTerms.length > 0) {
      unwatchTermRow = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
        new SelectMenuBuilder()
          .setCustomId('unwatchTerm')
          .setPlaceholder('Remove watchers')
          .setMaxValues(watchListTerms.length)
          .setMinValues(1)
          .addOptions(
            watchListTerms.map((term) => {
              return {
                label: term.termin,
                value: String(term.hash),
                description: term.title
              };
            })
          )
      );
      components.push(unwatchTermRow);
    }




    client.dashboardMessage.edit({
      embeds: [embed],
      /*components: components*/
    });
  }
}
