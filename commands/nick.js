const { embed } = require('./utils');

module.exports = async function nickCmd({ message, rest, OWNER_IDS, allowedUserIds }) {
  const isOwner   = OWNER_IDS.includes(message.author.id);
  const isAllowed = allowedUserIds.includes(message.author.id);

  if (!isOwner && !isAllowed) return message.channel.send({ embeds: [embed('❌ Access Denied', 'No permission.')] });
  if (!message.guild) return message.channel.send({ embeds: [embed('❌ Server Only', 'Use this command in a server.')] });

  const newNick = rest.join(' ');
  if (!newNick) return message.channel.send({ embeds: [embed('❌ Missing Nickname', 'Usage: `,nick <new nickname>`')] });

  try {
    await message.guild.members.me.setNickname(newNick);
    return message.channel.send({ embeds: [embed('✅ Nickname Changed', `Bot nickname set to **${newNick}** in this server.`)] });
  } catch (e) {
    return message.channel.send({ embeds: [embed('❌ Failed', `Could not change nickname.\n\`${e.message}\``)] });
  }
};
