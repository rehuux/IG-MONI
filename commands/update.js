const { embed } = require('./utils');
const { ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = async function updateCmd({ message, rest, db, client, OWNER_IDS, PREFIX }) {
  const isOwner = OWNER_IDS.includes(message.author.id);
  if (!isOwner) return message.channel.send({ embeds: [embed('❌ Owner Only', 'Only bot owners can use this.')] });

  const sub = rest[0]?.toLowerCase();

  // ── ,update send <message> — send update to ALL guilds ───────────────────────
  if (sub === 'send') {
    const updateMsg = rest.slice(1).join(' ');
    if (!updateMsg) return message.channel.send({ embeds: [embed('❌ Missing Message', `Usage: \`${PREFIX}update send <message>\``)] });

    const loading = await message.channel.send({ embeds: [embed('⏳ Sending...', 'Creating channels and sending update to all servers...')] });

    let success = 0, failed = 0, created = 0;

    for (const guild of client.guilds.cache.values()) {
      try {
        // Check if update channel already exists for this guild
        const existing = await db.getUpdateChannel(guild.id);
        let channel = null;

        if (existing) {
          // Try to fetch existing channel
          channel = await guild.channels.fetch(existing.channelId).catch(() => null);
        }

        // Create channel if not exists or was deleted
        if (!channel) {
          channel = await guild.channels.create({
            name: '📢bot-updates',
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: guild.roles.everyone,
                deny: [PermissionFlagsBits.SendMessages],
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory]
              }
            ],
            topic: 'Bot updates and announcements'
          });
          await db.setUpdateChannel(guild.id, channel.id);
          created++;
        }

        // Send the update message
        await channel.send({ embeds: [
          embed('📢 Bot Update', updateMsg)
            .setFooter({ text: `Update from bot owner • ${new Date().toLocaleDateString()}` })
            .setTimestamp()
        ]});
        success++;
      } catch (e) {
        console.log(`[update] Failed for guild ${guild.id}: ${e.message}`);
        failed++;
      }
    }

    return loading.edit({ embeds: [embed('✅ Update Sent',
      `**Sent to:** ${success} server(s)\n` +
      `**New channels created:** ${created}\n` +
      `**Failed:** ${failed}`
    )] });
  }

  // ── ,update setchannel — set this channel as update channel for this guild ───
  if (sub === 'setchannel') {
    if (!message.guild) return message.channel.send({ embeds: [embed('❌ Server Only', 'Use in a server.')] });
    await db.setUpdateChannel(message.guild.id, message.channel.id);
    return message.channel.send({ embeds: [embed('✅ Update Channel Set', `This channel will receive bot updates.`)] });
  }

  // ── ,update remove — remove update channel for this guild ────────────────────
  if (sub === 'remove') {
    if (!message.guild) return message.channel.send({ embeds: [embed('❌ Server Only', 'Use in a server.')] });
    await db.removeUpdateChannel(message.guild.id);
    return message.channel.send({ embeds: [embed('✅ Removed', 'Update channel removed for this server.')] });
  }

  // ── ,update list — show all guilds with update channels ──────────────────────
  if (sub === 'list') {
    const list = await db.getAllUpdateChannels();
    const lines = list.map((u, i) => {
      const guild = client.guilds.cache.get(u.guildId);
      return `\`${i+1}.\` **${guild?.name || 'Unknown'}** — <#${u.channelId}>`;
    });
    return message.channel.send({ embeds: [embed('📋 Update Channels',
      lines.length ? lines.join('\n') : '*No update channels set.*'
    ).setFooter({ text: `${list.length} server(s)` })] });
  }

  // ── Help ──────────────────────────────────────────────────────────────────────
  return message.channel.send({ embeds: [embed('📢 Update Command',
    [
      `\`${PREFIX}update send <message>\` — Send update to ALL servers`,
      `\`${PREFIX}update setchannel\` — Set this channel as update channel`,
      `\`${PREFIX}update remove\` — Remove update channel for this server`,
      `\`${PREFIX}update list\` — Show all update channels`,
      ``,
      `**How it works:**`,
      `• \`send\` creates \`📢bot-updates\` channel in every server automatically`,
      `• If channel already exists, reuses it (no duplicate)`,
      `• Members can read but not send messages`
    ].join('\n')
  )] });
};
