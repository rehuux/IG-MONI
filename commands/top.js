const { embed } = require('./utils');

function fmtNum(n) {
  if (!n) return '0';
  const num = parseInt(n);
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000)    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toLocaleString();
}

module.exports = async function topCmd({ message, db }) {
  const accounts = await db.getAccounts();

  if (!accounts.length) {
    return message.channel.send({ embeds: [embed('📊 Top Accounts', '*No accounts being watched.*')] });
  }

  // Sort by followers descending
  const sorted = accounts
    .filter(a => a.followers > 0)
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 10);

  if (!sorted.length) {
    return message.channel.send({ embeds: [embed('📊 Top Accounts', '*No follower data available yet.*')] });
  }

  const medals = ['🥇', '🥈', '🥉'];
  const lines  = sorted.map((acc, i) => {
    const medal  = medals[i] || `\`${i + 1}.\``;
    const status = acc.lastStatus === 'active' ? '🟢' : '🔴';
    return `${medal} ${status} **@${acc.username}** — **${fmtNum(acc.followers)}** followers`;
  });

  return message.channel.send({ embeds: [
    embed('📊 Top Watched Accounts', lines.join('\n'))
      .setFooter({ text: `Top ${sorted.length} of ${accounts.length} watched accounts` })
      .setTimestamp()
  ]});
};
