import { config as dotenvConfig } from 'dotenv';
import { resolveColor } from 'discord.js';
dotenvConfig();


export type BotConfig = {
  token: string;
  applicationId: string;
  //prefix: string;
  owner: string;
  credentials: {
    username: string;
    password: string;
  };
  //mongodb_uri: string;
  embed: {
    colors: {
      default: number;
      error: number;
      success: number;
      warning: number;
    };
  };
  debugMode: boolean;
};

export const config: BotConfig = {
  token: process.env.TOKEN,
  applicationId: process.env.APPID,
  //prefix: process.env.PREFIX,
  owner: process.env.OWNER,
  credentials: {
    username: process.env.LOGIN,
    password: process.env.PASSWORD
  },
  //mongodb_uri: process.env.MONGODB_SRV,
  embed: {
    colors: {
      default: resolveColor('#ffcc00'),
      error: resolveColor('#ff0000'),
      success: resolveColor('#00ff00'),
      warning: resolveColor('#ffff00'),
    },
  },
  debugMode: process.env.DEBUGMODE === 'true',
};
