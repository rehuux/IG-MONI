const { embed } = require('./utils');
const { ActivityType } = require('discord.js');

module.exports = async function setstatusCmd({ message, rest, client, OWNER_IDS, PREFIX }) {
  const isOwner = OWNER_IDS.includes(message.author.id);
  if (!isOwner) return message.channel.send({ embeds: [embed('❌ Owner Only', 'Only bot owners can change the status.')] });

  const sub = rest[0]?.toLowerCase();

  // ,setstatus online/idle/dnd/invisible
  if (['online', 'idle', 'dnd', 'invisible'].includes(sub) && rest.length === 1) {
    client.user.setPresence({ status: sub });
    const icons = { online: '🟢', idle: '🌙', dnd: '🔴', invisible: '⚫' };
    return message.channel.send({ embeds: [embed('✅ Status Changed', `Bot status set to ${icons[sub]} **${sub}**`)] });
  }

  // ,setstatus <type> <text>
  // type: playing, watching, listening, competing, streaming, custom
  const typeMap = {
    playing:   ActivityType.Playing,
    watching:  ActivityType.Watching,
    listening: ActivityType.Listening,
    competing: ActivityType.Competing,
    streaming: ActivityType.Streaming,
    custom:    ActivityType.Custom,
  };

  if (!sub || !typeMap[sub]) {
    return message.channel.send({ embeds: [embed('📋 Set Status',
      [
        `**Presence:**`,
        `\`${PREFIX}setstatus online\``,
        `\`${PREFIX}setstatus idle\``,
        `\`${PREFIX}setstatus dnd\``,
        `\`${PREFIX}setstatus invisible\``,
        ``,
        `**Activity:**`,
        `\`${PREFIX}setstatus playing <text>\``,
        `\`${PREFIX}setstatus watching <text>\``,
        `\`${PREFIX}setstatus listening <text>\``,
        `\`${PREFIX}setstatus competing <text>\``,
        `\`${PREFIX}setstatus custom <text>\``,
        ``,
        `**Clear activity:**`,
        `\`${PREFIX}setstatus clear\``,
      ].join('\n')
    )] });
  }

  // Clear activity
  if (sub === 'clear') {
    client.user.setActivity(null);
    return message.channel.send({ embeds: [embed('✅ Activity Cleared', 'Bot activity removed.')] });
  }

  const text = rest.slice(1).join(' ');
  if (!text) return message.channel.send({ embeds: [embed('❌ Missing Text', `Usage: \`${PREFIX}setstatus ${sub} <text>\``)] });

  client.user.setActivity(text, { type: typeMap[sub] });

  const icons = {
    playing: '🎮', watching: '📺', listening: '🎵',
    competing: '🏆', streaming: '📡', custom: '💬'
  };

  return message.channel.send({ embeds: [embed('✅ Activity Set',
    `${icons[sub]} **${sub.charAt(0).toUpperCase() + sub.slice(1)}** ${text}`
  )] });
};
