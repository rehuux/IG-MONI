const { embed } = require('./utils');

module.exports = async function serverlistCmd({ message, client, OWNER_IDS }) {
  const isOwner = OWNER_IDS.includes(message.author.id);
  if (!isOwner) return message.channel.send({ embeds: [embed('❌ Owner Only', 'Only bot owners can use this.')] });

  const guilds = client.guilds.cache;

  const lines = guilds.map((g, i) => {
    return `\`${i + 1}.\` **${g.name}** — \`${g.id}\` — **${g.memberCount}** members`;
  });

  // Split into chunks of 20 if too many servers
  const chunkSize = 20;
  const chunks = [];
  for (let i = 0; i < lines.length; i += chunkSize) {
    chunks.push(lines.slice(i, i + chunkSize));
  }

  for (let i = 0; i < chunks.length; i++) {
    await message.channel.send({ embeds: [
      embed(
        i === 0 ? `🌐 Server List (${guilds.size} total)` : `🌐 Server List (continued)`,
        chunks[i].join('\n')
      ).setFooter({ text: `Page ${i + 1}/${chunks.length}` })
    ]});
  }
};
