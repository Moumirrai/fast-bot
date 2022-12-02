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
  ActionRowBuilder,
  Collection
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
    await this.cycle();
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
    this.client.db.scrapper.set('data', newData);
    if (userData.notifyOnNew) {
      let newTermsHashesSetDifference = new Set(
        [...newTermsHashesSet].filter((x) => !oldTermsHashesSet.has(x))
      );

      let newTermsHashes = [...newTermsHashesSetDifference];
      let newTermsArray = newTerms.filter((term) =>
        newTermsHashes.includes(hash(term))
      );
      if (newTermsArray.length > 0) {
        await this.sendNewTerms(newTermsArray);
      }
    }
    /*
    if (userData.watchlist && userData.watchlist.length > 0) {
      //get all hashes from new and old terms, add them to array and remove duplicates
      let allTermsHashesSet = new Set([
        ...newTermsHashesSet,
        ...oldTermsHashesSet
      ]);
      let allTermsHashes = [...allTermsHashesSet];

      console.log(newTerms)

      //TODO:FIX THIS

      let watchListTerms = newTerms.filter((term) =>
        allTermsHashes.includes(term.hash)
      );

      console.log(watchListTerms);

      let oldC: Array<{ hash: number; old: TerminData }> = oldTerms
        .filter((term) => allTermsHashes.includes(term.hash))
        .map((term) => ({ hash: term.hash, old: term }));

      console.log(oldC);

      let newC: Array<{ hash: number; new: TerminData }> = newTerms
        .filter((term) => allTermsHashes.includes(term.hash))
        .map((term) => ({ hash: term.hash, new: term }));

      let pairs = new Collection<number, Pair|null>()

      for (let i = 0; i < newC.length; i++) {
        let pair = newC[i];
        pairs.set(pair.hash, { old: null, new: pair.new, hash: pair.hash });
      }

      for (let i = 0; i < oldC.length; i++) {
        let pair = oldC[i];
        if (pairs.has(pair.hash)) {
          let p = pairs.get(pair.hash);
          if (p) {
            p.old = pair.old;
            pairs.set(pair.hash, p);
          }
        } else {
          pairs.set(pair.hash, { old: pair.old, new: null, hash: pair.hash });
        }
      }

      console.log(pairs);

      let filteredPairs = pairs.filter((pair) =>
        userData.watchlist.includes(pair.hash)
      );

      console.log('filteredPairs');
      console.log(filteredPairs);

      let sentMessages = 0;

      filteredPairs.forEach(async (pair, i) => {
        if (!filteredPairs[i].new && filteredPairs[i].old) {
          let index = userData.watchlist.indexOf(filteredPairs[i].hash);
          if (index > -1) {
            userData.watchlist.splice(index, 1);
          }
          this.client.db.user.set('data', userData);
          sentMessages++;
          await this.sendTermDeleted(filteredPairs[i].old);
        } else if (filteredPairs[i].new && !filteredPairs[i].old) {
          return;
        } else if (
          filteredPairs[i].new.filled == false &&
          filteredPairs[i].old.filled == true
        ) {
          sentMessages++;
          await this.sendSpotAvailable(filteredPairs[i].new);
        } else if (
          filteredPairs[i].new.filled == true &&
          filteredPairs[i].old.filled == false
        ) {
          sentMessages++;
          await this.sendSpotTaken(filteredPairs[i].new);
        }
        //on last pair, fix data
        if (i == filteredPairs.map.length - 1) {
          if (sentMessages > 0) await this.client.dashboard.fix(this.client);
          await this.client.dashboard.update(this.client);
        }
      });
    } else {
      await this.client.dashboard.update(this.client);
    }
    */

    await this.client.dashboard.update(this.client);
  }

  private async sendSpotAvailable(term: TerminData): Promise<void> {
    const exampleEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setAuthor({
        name: 'Avaliable spot!',
        iconURL:
          'https://pbs.twimg.com/profile_images/656806289192919040/QeQ6u3bz.jpg'
      })
      .setTitle(
        `${term.spots.free} SPOT(S) AVALIBLE\n${term.title}\n${term.termin}`
      )
      .setURL('https://www.vut.cz/studis/student.phtml?sn=terminy_zk')
      .setDescription(`${term.type}\n[${term.examiner}](${term.examinerLink})`)
      .addFields({
        name: 'Spots',
        value: `TAKEN - \`${term.spots.taken}\`\nTOTAL - \`${term.spots.total}\`\n**AVALIBLE** - \`${term.spots.free}\``
      });

    this.client.userChannel.send({
      embeds: [exampleEmbed]
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
      embeds: [exampleEmbed]
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
    terms.forEach(async (term, index) => {
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

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await this.client.userChannel.send({
        embeds: [exampleEmbed]
      });
      if (index == terms.length - 1) {
        await this.client.dashboard.fix(this.client);
        await this.client.dashboard.update(this.client);
      }
    });
  }
}
