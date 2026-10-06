const { embed } = require('./utils');

module.exports = async function serverinfoCmd({ message, db }) {
  if (!message.guild) return message.channel.send({ embeds: [embed('❌ Server Only', 'Use this in a server.')] });

  const guild = message.guild;

  // Fetch full guild data
  await guild.fetch().catch(() => {});

  const owner       = await guild.fetchOwner().catch(() => null);
  const hasAccess   = await db.hasGuildAccess(guild.id);
  const channels    = guild.channels.cache;
  const textCh      = channels.filter(c => c.type === 0).size;
  const voiceCh     = channels.filter(c => c.type === 2).size;
  const roles       = guild.roles.cache.size - 1; // minus @everyone
  const createdAt   = `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`;
  const boosts      = guild.premiumSubscriptionCount || 0;
  const boostLevel  = guild.premiumTier;

  return message.channel.send({ embeds: [
    embed(`🏠 ${guild.name}`,
      [
        `**ID:** \`${guild.id}\``,
        `**Owner:** ${owner ? `${owner.user.tag}` : 'Unknown'}`,
        `**Created:** ${createdAt}`,
        `**Members:** ${guild.memberCount}`,
        `**Channels:** ${textCh} text · ${voiceCh} voice`,
        `**Roles:** ${roles}`,
        `**Boosts:** ${boosts} (Level ${boostLevel})`,
        `**Bot Access:** ${hasAccess ? '✅ Authorized' : '❌ Not Authorized'}`,
      ].join('\n')
    )
    .setThumbnail(guild.iconURL({ dynamic: true }) || null)
    .setFooter({ text: `Verification: ${guild.verificationLevel}` })
  ]});
};
