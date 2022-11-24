import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { Command } from 'm-bot';
import { BotConfig, config } from '../config/config';
import Logger from './Logger';

class CommandDeployer {
  private config: BotConfig;
  private commands: any[];
  private logger = Logger;

  public async deploy() {
    this.config = config;
    this.logger.info('Deployer started');
    this.commands = [];
    await this.getCommands();
    await this.deployCommands();
    this.logger.info('Deployer finished');
  }

  private async getCommands() {
    const files = readdirSync(
      resolve(__dirname, '..', 'interactions', 'commands')
    );
    for (const file of files) {
      const command: Command = (
        await import(resolve(__dirname, '..', 'interactions', 'commands', file))
      ).default;
      if (!command.data) continue;
      //if there is already a command with the same name, remove it
      if (this.commands.includes(command.data.toJSON)) continue;
      this.commands.push(command.data.toJSON());
    }
  }

  private async deployCommands() {
    const rest = new REST({ version: '10' }).setToken(this.config.token);

    try {
      this.logger.info(
        `Started refreshing ${this.commands.length} application (/) commands.`
      );

      const data = await rest.put(
        Routes.applicationCommands(this.config.applicationId),
        { body: this.commands }
      );

      this.logger.info(`Successfully reloaded application (/) commands.`);
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async remove() {
    this.config = config;
    const rest = new REST({ version: '10' }).setToken(this.config.token);
    try {
      this.logger.info('Removing application (/) commands.');
      rest.put(Routes.applicationCommands(this.config.applicationId), {
        body: []
      });
      this.logger.info('Successfully removed application (/) commands.');
    } catch (error) {
      this.logger.error(error);
    }
  }
}

//get launch flags
//if --deploy is present, deploy commands, if --remove is present, remove commands
const args = process.argv.splice(2);
const deployer = new CommandDeployer();
if (args.includes('--remove')) {
  deployer.remove();
} else {
  deployer.deploy();
}
