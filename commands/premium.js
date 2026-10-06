const { embed, parseTime, formatDuration, formatExpiry } = require('./utils');

module.exports = async function premiumCmd({ message, rest, db, client, OWNER_IDS, PREFIX }) {
  const isOwner = OWNER_IDS.includes(message.author.id);
  if (!isOwner) return message.channel.send({ embeds: [embed('❌ Owner Only', 'Only bot owners can use this.')] });

  const sub    = rest[0]?.toLowerCase();
  const userId = rest[1]?.replace(/[<@!>]/g, '');
  const timeStr = rest[2]; // optional: 1m, 7d, 1y, 6mo

  if (!sub || !['add', 'remove', 'list'].includes(sub)) {
    return message.channel.send({ embeds: [embed('⭐ Premium', [
      `\`${PREFIX}givepremium add <@user> [time]\``,
      `\`${PREFIX}givepremium remove <@user>\``,
      `\`${PREFIX}givepremium list\``,
      '',
      '**Time examples:** `1m` `7d` `1mo` `1y` *(no time = permanent)*',
      '',
      '**Premium perks:**',
      '✅ No-prefix mode',
      '✅ DM notifications'
    ].join('\n'))] });
  }

  if (sub === 'add') {
    if (!userId) return message.channel.send({ embeds: [embed('❌ Missing User', `Usage: \`${PREFIX}givepremium add <@user> [time]\``)] });

    const ms        = parseTime(timeStr);
    const expiresAt = ms ? new Date(Date.now() + ms) : null;

    await db.addPremium(userId, message.guild?.id, message.author.id, expiresAt);

    // DM the user
    try {
      const user = await client.users.fetch(userId);
      await user.send({ embeds: [
        embed('⭐ Premium Activated!',
          `You have been granted **Premium** access!\n\n` +
          `✅ **No-prefix mode** — use commands without \`${PREFIX}\`\n` +
          `✅ **DM notifications**\n\n` +
          `**Duration:** ${formatDuration(ms)}\n` +
          `**Expires:** ${formatExpiry(expiresAt)}\n\n` +
          `Enjoy! 🎉`
        )
      ]});
    } catch (_) {}

    return message.channel.send({ embeds: [embed('⭐ Premium Granted',
      `<@${userId}> now has premium!\n` +
      `**Duration:** ${formatDuration(ms)}\n` +
      `**Expires:** ${formatExpiry(expiresAt)}\n` +
      `DM sent ✅`
    )] });
  }

  if (sub === 'remove') {
    if (!userId) return message.channel.send({ embeds: [embed('❌ Missing User', `Usage: \`${PREFIX}givepremium remove <@user>\``)] });
    await db.removePremium(userId);
    // DM user about removal
    try {
      const user = await client.users.fetch(userId);
      await user.send({ embeds: [embed('⭐ Premium Expired', 'Your premium access has been removed.')] });
    } catch (_) {}
    return message.channel.send({ embeds: [embed('✅ Premium Removed', `<@${userId}> premium revoked.`)] });
  }

  if (sub === 'list') {
    const list = await db.getPremiumList();
    const now  = Date.now();
    const lines = list.map((u, i) => {
      const expired = u.expiresAt && new Date(u.expiresAt) < now;
      const expiry  = u.expiresAt ? `expires ${formatExpiry(u.expiresAt)}` : 'permanent';
      return `\`${i+1}.\` <@${u.userId}> — ${expired ? '❌ expired' : `✅ ${expiry}`}`;
    });
    return message.channel.send({ embeds: [embed('⭐ Premium Users',
      lines.length ? lines.join('\n') : '*No premium users yet.*'
    ).setFooter({ text: `${list.length} user(s)` })] });
  }
};
