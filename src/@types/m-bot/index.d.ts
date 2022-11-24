//import type { Collection } from 'discord.js';
declare module 'm-bot' {
  export interface CommandArgs {
    client: import('../../struct/Core').Core;
    interaction: import('discord.js').ChatInputCommandInteraction;
  }
  export interface ModalArgs {
    client: import('../../struct/Core').Core;
    interaction: import('discord.js').ModalSubmitInteraction;
  }
  export interface Command {
    data: import('discord.js').SlashCommandBuilder;
    ratelimit: {
      window: number;
      limit: number;
    }
    execute: (commandArgs: CommandArgs) => Promise<unknown>;
  }
  export interface Modal {
    id: string;
    ratelimit: {
      window: number;
      limit: number;
    }
    execute: (commandArgs: ModalArgs) => Promise<unknown>;
  }
  export interface iSlashCommand {
    options: import('discord.js').ApplicationCommandOptionData[];
  }
  export interface iEvent {
    name: string;
    execute: (
      client: import('../../struct/Core').Core,
      ...args: any[]
    ) => Promise<unknown>;
  }

  export interface Database {
    user: enmap
    scrapper: enmap
  }

  export interface UserData {
    watchlist: object[];
    notifyOnNew: boolean;
    message: string;
  }

  import enmap from "enmap"
}
