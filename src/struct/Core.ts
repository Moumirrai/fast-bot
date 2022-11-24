import { config } from '../config/config';
import { Client, GatewayIntentBits, Partials, Collection, SlashCommandBuilder, DMChannel, Message } from 'discord.js';
import { readdirSync } from 'fs';
import Logger from './Logger';
import { resolve } from 'path';
import { Command, Modal, Database } from 'm-bot';
//import { connect, ConnectOptions } from 'mongoose';
import { ScraperCore } from './scraper/client';
import Functions from './Functions';
import dashboard from './Dashboard';
import Embeds from './Embeds';
import Mongo from './Mongo';
import Enmap from 'enmap';

export class Core extends Client {
  constructor() {
    super({
      partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User],
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
      ],
      presence: {
        status: 'dnd'
      }
    });
    this.config = config;
  }
  public logger = Logger;
  public commands = new Collection<string, Command>();
  public modals = new Collection<string, Modal>();
  public status = 1;
  public functions = Functions;
  public dashboard = dashboard;
  public dashboardMessage: Message;
  public userChannel: DMChannel;
  public embeds = Embeds;
  public mongo = Mongo;
  public db = {
    scrapper: new Enmap({
      name: "scrapper",
      autoFetch: true,
      fetchAll: false
    }),
    user: new Enmap({
      name: "user",
      autoFetch: true,
      fetchAll: false
    })
  }
  public async main() {
    try {
      this.logger.info('Initializing...');
      await this.loadEvents();
      await this.loadCommands();
      await this.loadModals();
      await this.login(this.config.token);
      this.scrapper = new ScraperCore(this);
    } catch (error) {
      console.log('pepe' + '1')
      this.logger.error(error);
      this.destroy();
      process.exit(1);
    }
  }

  /*
  private async mongoDB(): Promise<void> {
    connect(this.config.mongodb_uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: false
    } as ConnectOptions)
      .then(() => {
        return this.logger.info('Connected to MongoDB');
      })
      .catch((err) => {
        return this.logger.error('MongoDB connection error: ' + err);
      });
  }
  */

  private async loadCommands(): Promise<void> {
    const files = readdirSync(resolve(__dirname, '..', 'interactions', 'commands'));
    for (const file of files) {
      const command = (await import(resolve(__dirname, '..', 'interactions', 'commands', file)))
        .default;
      const cmdName = (command.data as SlashCommandBuilder).name;
      if (this.commands.has(cmdName)) {
        this.logger.warn(
          `Command with name ${cmdName} already exists, skipping...`
        );
        continue;
      }
      this.commands.set(cmdName, command);
    }
    this.logger.info(`${this.commands.size} commands loaded!`);
  }

  private async loadModals(): Promise<void> {
    const files = readdirSync(resolve(__dirname, '..', 'interactions', 'modals'));
    for (const file of files) {
      const modal = (await import(resolve(__dirname, '..', 'interactions', 'modals', file)))
        .default;
      const modalId = (modal.id as string)
      if (this.modals.has(modalId)) {
        this.logger.warn(
          `Modal with ID ${modalId} already exists, skipping...`
        );
        continue;
      }
      this.modals.set(modalId, modal);
    }
    this.logger.info(`${this.modals.size} modals loaded!`);
  }

  private async loadEvents(): Promise<void> {
    const files = readdirSync(resolve(__dirname, '..', 'events', 'client'));
    for (const file of files) {
      const event = (
        await import(resolve(__dirname, '..', 'events', 'client', file))
      ).default;
      this.on(event.name, (...args) => event.execute(this, ...args));
    }
    this.logger.info(`${files.length} events loaded!`);
  }
}
