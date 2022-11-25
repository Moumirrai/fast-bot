import { Menu, MenuArgs, UserData } from 'm-bot';

const watchTermMenu: Menu = {
  id: 'watchTerm',
  ratelimit: {
    window: 5000,
    limit: 5
  },
  async execute({ client, interaction }: MenuArgs): Promise<void> {
    const selectedTerms = interaction.values
    let userData = (client.db.user.get('data') as UserData)
    let succes = 0
    selectedTerms.forEach(hash => {
      if (!userData.watchlist.includes(Number(hash))){
        userData.watchlist.push(Number(hash))
        succes++
      }
    })
    client.db.user.set('data', userData)
    await interaction.reply({ content: `Added ${succes} terms to your watchlist`, ephemeral: true })
    await client.dashboard.update(client)
  }
};

export default watchTermMenu;