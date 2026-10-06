const { embed } = require('./utils');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async function inviteCmd({ message, client, PREFIX }) {
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=1527913168578285599&permissions=8&integration_type=0&scope=bot`;

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Invite Bot')
      .setStyle(ButtonStyle.Link)
      .setURL(inviteUrl)
      .setEmoji('🤖')
  );

  return message.channel.send({
    embeds: [embed('🤖 Invite Me!',
      `Click the button below to add the bot to your server.\n\n` +
      `⚠️ After inviting, ask an owner to authorize your server:\n` +
      `\`${PREFIX}guildaccess add <your server id> [time]\``
    )],
    components: [row]
  });
};
