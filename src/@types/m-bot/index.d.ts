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

  export interface Button {
    id: string;
    ratelimit: {
      window: number;
      limit: number;
    }
    execute: (commandArgs: ButtonArgs) => Promise<unknown>;
  }

  export interface Menu {
    id: string;
    ratelimit: {
      window: number;
      limit: number;
    }
    execute: (commandArgs: MenuArgs) => Promise<unknown>;
  }

  export interface MenuArgs {
    client: import('../../struct/Core').Core;
    interaction: import('discord.js').SelectMenuInteraction;
  }

  export interface ButtonArgs {
    client: import('../../struct/Core').Core;
    interaction: import('discord.js').ButtonInteraction;
    param: string;
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
    watchlist: Array<number>;
    notifyOnNew: boolean;
    message: string;
  }

  import enmap from "enmap"
}
