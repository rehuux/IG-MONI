const { embed, e } = require('./utils');

const FUCKER_ID  = '1475349294377730230';
const XEBIX_ID   = '887987295637110794';

const STATUS_ICONS = {
  online:  `${e('status.online')} Online`,
  idle:    `${e('status.idle')} Idle`,
  dnd:     `${e('status.dnd')} Do Not Disturb`,
  offline: `${e('status.offline')} Offline`,
};

const ACTIVITY_ICONS = {
  0: e('activity.playing'),
  1: e('activity.streaming'),
  2: e('activity.listening'),
  3: e('activity.watching'),
  4: e('activity.custom'),
  5: e('activity.competing')
};

async function getLanyard(userId) {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (_) {
    return null;
  }
}

function buildPresenceLines(presence) {
  if (!presence) return [`> Status: ${e('status.offline')} Offline`];

  const lines = [];
  const status = presence.discord_status || 'offline';
  lines.push(`> Status: ${STATUS_ICONS[status] || `${e('status.offline')} Offline`}`);

  // Platform
  const platforms = [];
  if (presence.active_on_discord_desktop) platforms.push(`${e('platform.desktop')} Desktop`);
  if (presence.active_on_discord_mobile)  platforms.push(`${e('platform.mobile')} Mobile`);
  if (presence.active_on_discord_web)     platforms.push(`${e('platform.web')} Web`);
  if (platforms.length) lines.push(`> Platform: ${platforms.join(' · ')}`);

  // Spotify
  if (presence.listening_to_spotify && presence.spotify) {
    const sp = presence.spotify;
    lines.push(
      `> ${e('activity.spotify')} **${sp.song}** by ${sp.artist}`,
      `> Album: ${sp.album}`
    );
  }

  // Other activities (skip spotify)
  for (const act of (presence.activities || [])) {
    if (act.id === 'spotify:1') continue;
    if (act.type === 4) {
      const emoji = act.emoji?.name || '';
      const text  = act.state || '';
      if (text) lines.push(`> ${e('activity.custom')} ${emoji} ${text}`.trim());
    } else {
      const icon = ACTIVITY_ICONS[act.type] || '▶️';
      let line = `> ${icon} **${act.name}**`;
      if (act.details) line += ` — ${act.details}`;
      lines.push(line);
    }
  }

  return lines;
}

module.exports = async function ownerCmd({ message, client }) {
  // Fetch both presences in parallel
  const [fuckerPresence, xebixPresence] = await Promise.all([
    getLanyard(FUCKER_ID),
    getLanyard(XEBIX_ID)
  ]);

  const fuckerLines = buildPresenceLines(fuckerPresence);
  const xebixLines  = buildPresenceLines(xebixPresence);

  const lines = [
    `${e('ui.crown')} **Owner & Developer**`,
    `> **fucker** — <@1478974680219254818>`,
    ...fuckerLines,
    ``,
    `${e('ui.partner')} **Dev Partner**`,
    `> **xebix** — <@887987295637110794>`,
    ...xebixLines,
    ``,
    `${e('ui.bot')} **Bot:** ${client.user.tag}`,
    `${e('platform.web')} **Servers:** ${client.guilds.cache.size}`,
  ];

  return message.channel.send({ embeds: [
    embed('👑 Bot Ownership', lines.join('\n'))
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'Instagram Monitor Bot' })
      .setTimestamp()
  ]});
};
