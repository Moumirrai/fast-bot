import { ScraperInterface, TerminData, SubjectData, Pair } from 'vut-scraper';
import { Core } from '../Core';
import { UserData } from 'm-bot';
import { AxiosInstance } from 'axios';
import cron from 'node-cron';
import { login, scrape } from './scraper';
import hash from 'hash-it';

import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} from 'discord.js';

export class ScraperCore implements ScraperInterface {
  public client: Core;
  public scrapperClient: AxiosInstance;
  public lastData: Array<SubjectData>;

  constructor(client: Core) {
    this.client = client;
    this.main();
  }

  private async main() {
    await login(this);
    await this.client.dashboard.fix(this.client);
    this.cron();
    return this;
  }

  public async scrape(): Promise<Array<SubjectData>> {
    let data = await scrape(this.scrapperClient);
    return data;
  }

  private async cron(): Promise<void> {
    //create cron job taht runs every minute
    cron.schedule('* * * * *', async () => {
      this.cycle();
    });
  }

  public async cycle(): Promise<void> {
    this.lastData = await this.scrape();
    this.processData();
  }

  private async processData(): Promise<void> {
    let userData: UserData = await this.client.db.user.get('data');
    let oldData = await (this.client.db.scrapper.get(
      'data'
    ) as Array<SubjectData>);
    let newData = this.lastData as Array<SubjectData>;

    if (!userData) return;

    let oldTerms = oldData
      ? oldData.map((subject) => subject.terms).flat()
      : [];
    let newTerms = newData.map((subject) => subject.terms).flat();

    let newTermsHashesSet = new Set(newTerms.map((term) => hash(term)));
    let oldTermsHashesSet = new Set(oldTerms.map((term) => hash(term)));

    if (userData.notifyOnNew) {
      let newTermsHashesSetDifference = new Set(
        [...newTermsHashesSet].filter((x) => !oldTermsHashesSet.has(x))
      );

      let newTermsHashes = [...newTermsHashesSetDifference];
      let newTermsArray = newTerms.filter((term) =>
        newTermsHashes.includes(hash(term))
      );
      await this.sendNewTerms(newTermsArray);
      this.client.dashboard.fix(this.client);
    }
    if (userData.watchlist && userData.watchlist.length > 0) {
      //get all hashes from new and old terms, add them to array and remove duplicates
      let allTermsHashesSet = new Set([
        ...newTermsHashesSet,
        ...oldTermsHashesSet
      ]);
      let allTermsHashes = [...allTermsHashesSet];
      let pairs: Array<Pair> = [];
      //for each hash, find newTerm and oldTerm
      for (let i = 0; i < allTermsHashes.length; i++) {
        let newTerm = newTerms.find((term) => term.hash === allTermsHashes[i]);
        let oldTerm = oldTerms.find((term) => term.hash === allTermsHashes[i]);
        pairs.push({
          hash: allTermsHashes[i],
          new: newTerm ? newTerm : null,
          old: oldTerm ? oldTerm : null
        });
      }

      let filteredPairs = pairs.filter((pair) =>
        userData.watchlist.includes(pair.hash)
      );

      for (let i = 0; i < filteredPairs.length; i++) {
        if (!filteredPairs[i].new && filteredPairs[i].old) {
          let index = userData.watchlist.indexOf(filteredPairs[i].hash);
          if (index > -1) {
            userData.watchlist.splice(index, 1);
          }
          this.client.db.user.set('data', userData);
          await this.sendTermDeleted(filteredPairs[i].old);
        } else if (filteredPairs[i].new && !filteredPairs[i].old) {
          return;
        } else if (
          filteredPairs[i].new.filled == false &&
          filteredPairs[i].old.filled == true
        ) {
          await this.sendSpotAvailable(filteredPairs[i].new);
        } else if (
          filteredPairs[i].new.filled == true &&
          filteredPairs[i].old.filled == false
        ) {
          await this.sendSpotTaken(filteredPairs[i].new);
        }
      }
    }

    this.client.db.scrapper.set('data', newData);
  }

  private async sendSpotAvailable(term: TerminData): Promise<void> {
    const exampleEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setAuthor({
        name: 'Avaliable spot!',
        iconURL:
          'https://pbs.twimg.com/profile_images/656806289192919040/QeQ6u3bz.jpg'
      })
      .setTitle(`${term.spots.free} SPOT(S) AVALIBLE\n${term.title}\n${term.termin}`)
      .setURL('https://www.vut.cz/studis/student.phtml?sn=terminy_zk')
      .setDescription(
        `${term.type}\n[${term.examiner}](${term.examinerLink})`
      )
      .addFields({
        name: 'Spots',
        value: `TAKEN - \`${term.spots.taken}\`\nTOTAL - \`${term.spots.total}\`\n**AVALIBLE** - \`${term.spots.free}\``
      });

    this.client.userChannel.send({
      embeds: [exampleEmbed],
    });
  }

  private async sendSpotTaken(term: TerminData): Promise<void> {
    const exampleEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setAuthor({
        name: 'No longer avalible!',
        iconURL:
          'https://pbs.twimg.com/profile_images/656806289192919040/QeQ6u3bz.jpg'
      })
      .setTitle(`NO LONGER AVALIBLE\n${term.title}\n${term.termin}`)
      .setURL('https://www.vut.cz/studis/student.phtml?sn=terminy_zk')
      .setDescription(
        `${term.type}\n[${term.examiner}](${term.examinerLink}\n**THERE ARE NO AVALBLE SPOTS AT THE MOMENT!**)`
      )
      .addFields({
        name: 'Spots',
        value: `TAKEN - \`${term.spots.taken}\`\nTOTAL - \`${term.spots.total}\`\n**AVALIBLE** - \`${term.spots.free}\``
      });
    this.client.userChannel.send({
      embeds: [exampleEmbed],
    });
  }

  private async sendTermDeleted(term: TerminData): Promise<void> {
    const exampleEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setAuthor({
        name: 'Term was removed!',
        iconURL:
          'https://pbs.twimg.com/profile_images/656806289192919040/QeQ6u3bz.jpg'
      })
      .setTitle(`REMOVED\n${term.title}\n${term.termin}`)
      .setURL('https://www.vut.cz/studis/student.phtml?sn=terminy_zk')
      .setDescription(
        `${term.type}\n[${term.examiner}](${term.examinerLink})\n**Term was automatically removed from your watchlist!**`
      );

    this.client.userChannel.send({
      embeds: [exampleEmbed]
    });
  }

  private async sendNewTerms(terms: Array<TerminData>): Promise<void> {
    //for each term in terms, send a message to the user with 5s delay
    for (let i = 0; i < terms.length; i++) {
      let term = terms[i];
      setTimeout(() => {
        const exampleEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setAuthor({
            name: 'New term found!',
            iconURL:
              'https://pbs.twimg.com/profile_images/656806289192919040/QeQ6u3bz.jpg'
          })
          .setTitle(`${term.title}\n${term.termin}`)
          .setURL('https://www.vut.cz/studis/student.phtml?sn=terminy_zk')
          .setDescription(
            `${term.type}\n[${term.examiner}](${term.examinerLink})`
          )
          .addFields({
            name: 'Spots',
            value: `TAKEN - \`${term.spots.taken}\`\nTOTAL - \`${term.spots.total}\`\n**AVALIBLE** - \`${term.spots.free}\``
          });
        //create button
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('watchButton#' + term.hash)
            .setLabel('Watch')
            .setStyle(ButtonStyle.Primary)
        ) as ActionRowBuilder<ButtonBuilder>;

        this.client.userChannel.send({
          embeds: [exampleEmbed],
          components: term.filled ? [row] : []
        });
      }, i * 1000);
    }
  }
}
