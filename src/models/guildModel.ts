import { Document, Schema, model } from 'mongoose';

export interface IGuildModel extends Document {
  guildID: string;
  timestamp: Date;
}

export const GuildSchema = new Schema({
  guildID: {
    type: String,
    required: true,
    unique: true
  },
  timestamp: { type: Date, default: Date.now }
});

export const GuildModel = model<IGuildModel>(
  'GuildModel',
  GuildSchema,
  'GUILD_COLLECTION'
);
