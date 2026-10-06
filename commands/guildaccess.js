const { embed, parseTime, formatDuration, formatExpiry } = require('./utils');

module.exports = async function guildaccessCmd({ message, rest, db, client, OWNER_IDS, PREFIX }) {
  const isOwner = OWNER_IDS.includes(message.author.id);
  if (!isOwner) return message.channel.send({ embeds: [embed('❌ Owner Only', 'Only bot owners can use this.')] });

  const sub     = rest[0]?.toLowerCase();
  const guildId = rest[1];
  const timeStr = rest[2]; // optional: 1m, 7d, 1y, 6mo

  if (!sub || !['add', 'remove', 'list'].includes(sub)) {
    return message.channel.send({ embeds: [embed('📋 Guild Access', [
      `\`${PREFIX}guildaccess add <guildId> [time]\``,
      `\`${PREFIX}guildaccess remove <guildId>\``,
      `\`${PREFIX}guildaccess list\``,
      '',
      '**Time examples:** `1m` `7d` `1mo` `1y` *(no time = permanent)*'
    ].join('\n'))] });
  }

  if (sub === 'add') {
    if (!guildId) return message.channel.send({ embeds: [embed('❌ Missing Guild ID', `Usage: \`${PREFIX}guildaccess add <guildId> [time]\``)] });

    const ms        = parseTime(timeStr);
    const expiresAt = ms ? new Date(Date.now() + ms) : null;
    const guild     = client.guilds.cache.get(guildId);

    await db.addGuildAccess(guildId, guild?.name || 'Unknown', message.author.id, expiresAt);

    return message.channel.send({ embeds: [embed('✅ Guild Access Granted',
      `**Server:** ${guild?.name || guildId}\n` +
      `**Duration:** ${formatDuration(ms)}\n` +
      `**Expires:** ${formatExpiry(expiresAt)}`
    )] });
  }

  if (sub === 'remove') {
    if (!guildId) return message.channel.send({ embeds: [embed('❌ Missing Guild ID', `Usage: \`${PREFIX}guildaccess remove <guildId>\``)] });
    await db.removeGuildAccess(guildId);
    return message.channel.send({ embeds: [embed('✅ Guild Access Removed', `Guild \`${guildId}\` access revoked.`)] });
  }

  if (sub === 'list') {
    const list = await db.getGuildAccessList();
    const now  = Date.now();
    const lines = list.map((g, i) => {
      const expired = g.expiresAt && new Date(g.expiresAt) < now;
      const expiry  = g.expiresAt ? `expires ${formatExpiry(g.expiresAt)}` : 'permanent';
      return `\`${i+1}.\` **${g.guildName || 'Unknown'}** \`${g.guildId}\` — ${expired ? '❌ expired' : `✅ ${expiry}`}`;
    });
    return message.channel.send({ embeds: [embed('🏠 Authorized Guilds',
      lines.length ? lines.join('\n') : '*No guilds authorized yet.*'
    ).setFooter({ text: `${list.length} guild(s)` })] });
  }
};
