const { embed } = require('./utils');

module.exports = async function pfpCmd({ message, rest, client, OWNER_IDS, PREFIX }) {
  const isOwner = OWNER_IDS.includes(message.author.id);
  if (!isOwner) return message.channel.send({ embeds: [embed('❌ Owner Only', 'Only bot owners can change the avatar.')] });

  const attachment = message.attachments.first();
  const urlArg     = rest[0];
  const imgUrl     = attachment?.url || urlArg;

  if (!imgUrl) return message.channel.send({ embeds: [embed('❌ Missing Image',
    `Attach an image or provide a URL:\n\`${PREFIX}pfp <url>\``
  )] });

  try {
    const res = await fetch(imgUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf  = Buffer.from(await res.arrayBuffer());

    // Detect image type
    let mime = 'image/png';
    if (buf[0] === 0xFF && buf[1] === 0xD8) mime = 'image/jpeg';
    else if (buf[0] === 0x47 && buf[1] === 0x49) mime = 'image/gif';
    else if (buf[0] === 0x57 && buf[1] === 0x45) mime = 'image/webp';

    const base64 = `data:${mime};base64,${buf.toString('base64')}`;

    if (message.guild) {
      // Guild-specific avatar via REST
      await client.rest.patch(
        `/guilds/${message.guild.id}/members/@me`,
        { body: { avatar: base64 } }
      );
      return message.channel.send({ embeds: [embed('✅ Server Avatar Changed',
        `Bot avatar updated for **${message.guild.name}** only!\nEach server can have its own avatar.`
      )] });
    } else {
      // Global avatar
      await client.user.setAvatar(buf);
      return message.channel.send({ embeds: [embed('✅ Global Avatar Changed', 'Bot avatar updated globally.')] });
    }
  } catch (e) {
    return message.channel.send({ embeds: [embed('❌ Failed',
      `Could not change avatar.\n\`${e.message}\`\n\n> Guild avatars only work for bots in 100+ servers (verified bots).`
    )] });
  }
};
