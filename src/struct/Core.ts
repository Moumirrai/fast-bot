import { config } from '../config/config';
import { Client, GatewayIntentBits, Partials, Collection, SlashCommandBuilder, DMChannel, Message } from 'discord.js';
import { readdirSync } from 'fs';
import Logger from './Logger';
import { resolve } from 'path';
import { Command, Menu } from 'm-bot';
import { ScraperCore } from './scraper/client';
import Functions from './Functions';
import dashboard from './Dashboard';
import Embeds from './Embeds';
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
  public menus = new Collection<string, Menu>();
  public status = 1;
  public functions = Functions;
  public dashboard = dashboard;
  public dashboardMessage: Message;
  public userChannel: DMChannel;
  public embeds = Embeds;
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
      await this.loadMenus();
      await this.login(this.config.token);
      this.scrapper = new ScraperCore(this);
    } catch (error) {
      console.log('Error while starting - CODE' + '001')
      this.logger.error(error);
      this.destroy();
      process.exit(1);
    }
  }

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

  private async loadMenus(): Promise<void> {
    const files = readdirSync(resolve(__dirname, '..', 'interactions', 'menus'));
    for (const file of files) {
      const menu = (await import(resolve(__dirname, '..', 'interactions', 'menus', file)))
        .default;
      const menuId = (menu.id as string)
      if (this.menus.has(menuId)) {
        this.logger.warn(
          `Menu with ID ${menuId} already exists, skipping...`
        );
        continue;
      }
      this.menus.set(menuId, menu);
    }
    this.logger.info(`${this.menus.size} menus loaded!`);
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
