import { EmbedBuilder, BaseMessageOptions } from 'discord.js';
import { config } from '../config/config';

export default class Embeds {
  public static default(
    message: string,
    options?: BaseMessageOptions
  ): EmbedBuilder {
    return new EmbedBuilder({
      color: config.embed.colors.default,
      description: message,
      ...options
    });
  }

  public static error(
    message: string,
    options?: BaseMessageOptions
  ): EmbedBuilder {
    return new EmbedBuilder({
      color: config.embed.colors.error,
      description: message,
      ...options
    });
  }

  public static success(
    message: string,
    options?: BaseMessageOptions
  ): EmbedBuilder {
    return new EmbedBuilder({
      color: config.embed.colors.success,
      description: message,
      ...options
    });
  }

  public static warning(
    message: string,
    options?: BaseMessageOptions
  ): EmbedBuilder {
    return new EmbedBuilder({
      color: config.embed.colors.warning,
      description: message,
      ...options
    });
  }
}
