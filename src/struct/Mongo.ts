import { GuildModel, IGuildModel } from '../models/guildModel';

export default class Mongo {
  public static async getGuild(id: string): Promise<IGuildModel> {
    const guild = await GuildModel.findOne({ id });
    if (!guild) {
      const newGuild = new GuildModel({
        id,
        prefix: '!',
        language: 'en',
        disabledCommands: [],
        disabledCategories: [],
        disabledChannels: [],
        disabledRoles: []
      });
      await newGuild.save();
      return newGuild;
    }
    return guild;
  }
}
