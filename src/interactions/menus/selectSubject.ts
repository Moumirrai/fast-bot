import { Menu, MenuArgs } from 'm-bot';

const selectSubjectMenu: Menu = {
  id: 'selectSubject',
  ratelimit: {
    window: 5000,
    limit: 5
  },
  async execute({ client, interaction }: MenuArgs): Promise<void> {
    const selectedSubject = interaction.values[0];
    client.db.user.set('category', selectedSubject)
    await interaction.deferUpdate()
    await client.dashboard.update(client)
  }
};

export default selectSubjectMenu;