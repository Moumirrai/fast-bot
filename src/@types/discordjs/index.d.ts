import type { Client } from 'discord.js';
import type { ScraperCore } from '../../struct/scraper/client';

declare module 'discord.js' {
  export interface Client {
    config: BotConfig;
    scrapper: ScraperCore;
  }
}
