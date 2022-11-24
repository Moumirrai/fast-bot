import { ScraperInterface, TerminData, SubjectData } from 'vut-scraper';
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
    if (userData.notifyOnNew) {
      let oldTerms = oldData
        ? oldData.map((subject) => subject.terms).flat()
        : [];
      let newTerms = newData.map((subject) => subject.terms).flat();

      let newTermsHashesSet = new Set(newTerms.map((term) => hash(term)));
      let oldTermsHashesSet = new Set(oldTerms.map((term) => hash(term)));

      let newTermsHashesSetDifference = new Set(
        [...newTermsHashesSet].filter((x) => !oldTermsHashesSet.has(x))
      );

      let newTermsHashes = [...newTermsHashesSetDifference];
      let newTermsArray = newTerms.filter((term) =>
        newTermsHashes.includes(hash(term))
      );

      console.log(newTermsArray.length);
      this.sendNewTerms(newTermsArray);
    }

    this.client.db.scrapper.set('data', newData);
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
            value: `TAKEN - \`${term.spots.taken}\`\nTOTAL - \`${term.spots.total}\`\n*FREE* - \`${term.spots.free}\``
          });
        //create button
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('watchButton#'+term.hash)
            .setLabel('Watch')
            .setStyle(ButtonStyle.Primary)
        ) as ActionRowBuilder<ButtonBuilder>;

        this.client.userChannel.send({
          embeds: [exampleEmbed],
          components: term.filled ? [row] : []
        });
      }, i * 1000)
    }
  }
}
