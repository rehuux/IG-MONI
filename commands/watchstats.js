const { embed } = require('./utils');

module.exports = async function watchstatsCmd({ message, db, activeWatches, BOT_START }) {
  // Get counts from DB
  const [
    totalWatched,
    totalBanned,
    totalRecovered,
    banWatchList,
    unbanWatchList,
    followerTracks,
    verifyTracks
  ] = await Promise.all([
    db.getAccounts().then(a => a.length),
    db.getStats().then(s => s.totalBanned),
    db.getStats().then(s => s.totalRecovered),
    db.getBanWatchList(),
    db.getUnbanWatchList(),
    db.getFollowerTracks(),
    db.getVerifyTracks()
  ]);

  // Recent events (last 24h)
  const logs = await db.getLogs();
  const now  = Date.now();
  const last24h = logs.filter(l => now - new Date(l.timestamp).getTime() < 86400000);
  const banned24h    = last24h.filter(l => l.event === 'banned').length;
  const recovered24h = last24h.filter(l => l.event === 'recovered').length;

  // Uptime
  const uptimeMs = now - BOT_START;
  const hrs  = Math.floor(uptimeMs / 3600000);
  const mins = Math.floor((uptimeMs % 3600000) / 60000);
  const uptime = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

  return message.channel.send({ embeds: [
    embed('📊 Watch Stats',
      [
        `**🔴 Ban Watch:** ${banWatchList.length} active`,
        `**🟢 Unban Watch:** ${unbanWatchList.length} active`,
        `**📈 Follower Track:** ${followerTracks.length} active`,
        `**🔵 Verify Watch:** ${verifyTracks.length} active`,
        `**⚡ Active Intervals:** ${activeWatches.size}`,
        ``,
        `**📅 Last 24 Hours:**`,
        `> 🔥 Banned: **${banned24h}**`,
        `> 🏆 Recovered: **${recovered24h}**`,
        ``,
        `**📦 All Time:**`,
        `> Total Banned: **${totalBanned}**`,
        `> Total Recovered: **${totalRecovered}**`,
        `> Total Watched: **${totalWatched}**`,
        ``,
        `**⏱️ Uptime:** ${uptime}`,
      ].join('\n')
    ).setFooter({ text: `Stats updated now` }).setTimestamp()
  ]});
};
