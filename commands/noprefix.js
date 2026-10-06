const { embed, parseTime, formatDuration, formatExpiry } = require('./utils');

module.exports = async function noprefixCmd({ message, rest, db, client, OWNER_IDS, PREFIX }) {
  const isOwner = OWNER_IDS.includes(message.author.id);
  if (!isOwner) return message.channel.send({ embeds: [embed('❌ Owner Only', 'Only bot owners can use this.')] });

  const sub    = rest[0]?.toLowerCase();
  const userId = rest[1]?.replace(/[<@!>]/g, '');
  const timeStr = rest[2];

  if (!sub || !['add', 'remove', 'list'].includes(sub)) {
    return message.channel.send({ embeds: [embed('🔓 No-Prefix',
      `\`${PREFIX}noprefix add <@user> [time]\`\n` +
      `\`${PREFIX}noprefix remove <@user>\`\n` +
      `\`${PREFIX}noprefix list\`\n\n` +
      `**Time examples:** \`1m\` \`7d\` \`1mo\` \`1y\` *(no time = permanent)*\n\n` +
      `No-prefix users can run commands **without** the \`${PREFIX}\` prefix.`
    )] });
  }

  if (sub === 'add') {
    if (!userId) return message.channel.send({ embeds: [embed('❌ Missing User', `Usage: \`${PREFIX}noprefix add <@user> [time]\``)] });

    const ms        = parseTime(timeStr);
    const expiresAt = ms ? new Date(Date.now() + ms) : null;

    await db.addPremium(userId, message.guild?.id, message.author.id, expiresAt);

    // DM the user
    try {
      const user = await client.users.fetch(userId);
      await user.send({ embeds: [embed('🔓 No-Prefix Activated!',
        `You now have **no-prefix** access!\n\n` +
        `✅ Use all commands **without** \`${PREFIX}\`\n\n` +
        `**Duration:** ${formatDuration(ms)}\n` +
        `**Expires:** ${formatExpiry(expiresAt)}`
      )] });
    } catch (_) {}

    return message.channel.send({ embeds: [embed('✅ No-Prefix Granted',
      `<@${userId}> can now use commands without prefix.\n` +
      `**Duration:** ${formatDuration(ms)}\n` +
      `**Expires:** ${formatExpiry(expiresAt)}\n` +
      `DM sent ✅`
    )] });
  }

  if (sub === 'remove') {
    if (!userId) return message.channel.send({ embeds: [embed('❌ Missing User', `Usage: \`${PREFIX}noprefix remove <@user>\``)] });
    await db.removePremium(userId);
    try {
      const user = await client.users.fetch(userId);
      await user.send({ embeds: [embed('🔒 No-Prefix Removed', 'Your no-prefix access has been removed.')] });
    } catch (_) {}
    return message.channel.send({ embeds: [embed('✅ No-Prefix Removed', `<@${userId}> no-prefix access revoked.`)] });
  }

  if (sub === 'list') {
    const list = await db.getPremiumList();
    const now  = Date.now();
    const lines = list.map((u, i) => {
      const expired = u.expiresAt && new Date(u.expiresAt) < now;
      const expiry  = u.expiresAt ? `expires ${formatExpiry(u.expiresAt)}` : 'permanent';
      return `\`${i+1}.\` <@${u.userId}> — ${expired ? '❌ expired' : `✅ ${expiry}`}`;
    });
    return message.channel.send({ embeds: [embed('🔓 No-Prefix Users',
      lines.length ? lines.join('\n') : '*No users with no-prefix access.*'
    ).setFooter({ text: `${list.length} user(s)` })] });
  }
};
