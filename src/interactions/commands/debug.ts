import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { CommandArgs, Command } from 'm-bot';

const FetchCommand: Command = {
  data: new SlashCommandBuilder().setName('fetch').setDescription('TODO'),

  ratelimit: {
    window: 5000,
    limit: 5
  },
  async execute({ client, interaction }: CommandArgs): Promise<void> {
    interaction.reply({
      content: 'Fetching...',
      ephemeral: true
    });

    //console.log(client.scrapper.scrapperClient)
    let data = await client.scrapper.scrape();
    console.log(data.length);
  }
};

export default FetchCommand;
