const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require('discord.js');

const COLOR = 0xFFFFFF;

const CATEGORIES = {
  watch: {
    label: '👁️ Watch',
    description: 'Ban/Unban monitoring commands',
    emoji: '👁️',
    fields: (PREFIX) => [
      `\`${PREFIX}watch <user>\` — Auto detect ban or unban`,
      `\`${PREFIX}banwatch <user>\` — Watch for ban`,
      `\`${PREFIX}unbanwatch <user>\` — Watch for unban`,
      `\`${PREFIX}multiwatch u1 u2\` — Watch multiple`,
      `\`${PREFIX}unwatch <user>\` — Stop watching`,
      `\`${PREFIX}pause <user>\` — Pause watch`,
      `\`${PREFIX}resume <user>\` — Resume watch`,
    ]
  },
  verify: {
    label: '🔵 Verify & Followers',
    description: 'Verification and follower tracking',
    emoji: '🔵',
    fields: (PREFIX) => [
      `\`${PREFIX}verifywatch <user>\` — Watch for verification`,
      `\`${PREFIX}unverifywatch <user>\` — Stop verify watch`,
      `\`${PREFIX}verifylist\` — List verify watches`,
      `\`${PREFIX}followers <user> [threshold]\` — Track follower changes`,
    ]
  },
  lists: {
    label: '📋 Lists',
    description: 'View watchlists and account lists',
    emoji: '📋',
    fields: (PREFIX) => [
      `\`${PREFIX}watchlist\` — All active watches`,
      `\`${PREFIX}banlist\` — Ban watch list`,
      `\`${PREFIX}unbanlist\` — Unban watch list`,
      `\`${PREFIX}top\` — Top accounts by followers`,
      `\`${PREFIX}clearlist\` — Clear all watches`,
    ]
  },
  info: {
    label: '🔍 Info & Stats',
    description: 'Account info and bot statistics',
    emoji: '🔍',
    fields: (PREFIX) => [
      `\`${PREFIX}status <user>\` — Account status`,
      `\`${PREFIX}check <user>\` — Check + screenshot`,
      `\`${PREFIX}watchtime <user>\` — How long watching`,
      `\`${PREFIX}history <user>\` — Ban/unban history`,
      `\`${PREFIX}logs\` — Recent events`,
      `\`${PREFIX}stats\` — Bot stats`,
      `\`${PREFIX}watchstats\` — Detailed watch stats`,
      `\`${PREFIX}ping\` — Bot latency`,
      `\`${PREFIX}uptime\` — Bot uptime`,
    ]
  },
  alerts: {
    label: '🔔 Alerts & DM',
    description: 'Notification and DM settings',
    emoji: '🔔',
    fields: (PREFIX) => [
      `\`${PREFIX}setping @role\` — Ping role on alerts`,
      `\`${PREFIX}dmon\` — Enable DM notifications`,
      `\`${PREFIX}dmoff\` — Disable DM notifications`,
      `\`${PREFIX}remind <user> <time>\` — Remind after time`,
    ]
  },
  settings: {
    label: '⚙️ Settings',
    description: 'Bot configuration',
    emoji: '⚙️',
    fields: (PREFIX) => [
      `\`${PREFIX}setchannel ban/unban/verify\` — Set alert channels`,
      `\`${PREFIX}prefix <char>\` — Change prefix`,
      `\`${PREFIX}interval <secs>\` — Check interval`,
      `\`${PREFIX}retry <user>\` — Reset fail count`,
      `\`${PREFIX}blacklist add/remove/list <u>\` — Blacklist`,
    ]
  },
  bot: {
    label: '🌐 Bot Info',
    description: 'Bot information and links',
    emoji: '🌐',
    fields: (PREFIX) => [
      `\`${PREFIX}botinfo\` — Full bot info`,
      `\`${PREFIX}serverinfo\` — Server info`,
      `\`${PREFIX}serverlist\` — All servers (owner)`,
      `\`${PREFIX}owner\` — Owner info & status`,
      `\`${PREFIX}invite\` — Invite link`,
      `\`${PREFIX}price\` — Premium pricing`,
    ]
  },
  owner: {
    label: '👑 Owner Only',
    description: 'Owner-exclusive commands',
    emoji: '👑',
    ownerOnly: true,
    fields: (PREFIX) => [
      `\`${PREFIX}guildaccess add/remove/list\` — Guild access`,
      `\`${PREFIX}givepremium add/remove/list\` — Premium`,
      `\`${PREFIX}noprefix add/remove/list\` — No-prefix`,
      `\`${PREFIX}setstatus <status>\` — Bot status`,
      `\`${PREFIX}pfp <url>\` — Bot avatar`,
      `\`${PREFIX}nick <name>\` — Bot nickname`,
      `\`${PREFIX}mon\` / \`${PREFIX}moff\` — Maintenance`,
      `\`${PREFIX}update send <msg>\` — Broadcast update`,
    ]
  }
};

module.exports = async function helpCmd({ message, client, PREFIX, isOwner, checkInterval }) {
  // Build select menu options
  const options = Object.entries(CATEGORIES)
    .filter(([, cat]) => !cat.ownerOnly || isOwner)
    .map(([key, cat]) =>
      new StringSelectMenuOptionBuilder()
        .setLabel(cat.label)
        .setDescription(cat.description)
        .setValue(key)
        .setEmoji(cat.emoji)
    );

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('help_menu')
    .setPlaceholder('📖 Select a category...')
    .addOptions(options);

  const row = new ActionRowBuilder().addComponents(selectMenu);

  const mainEmbed = new EmbedBuilder()
    .setTitle('📖 Help Menu')
    .setDescription(
      `Welcome! Use the dropdown below to browse commands.\n\n` +
      `**Prefix:** \`${PREFIX}\`\n` +
      `**Interval:** ${checkInterval / 1000}s\n` +
      `**Servers:** ${client.guilds.cache.size}`
    )
    .setColor(COLOR)
    .setFooter({ text: 'Select a category from the dropdown' })
    .setTimestamp();

  const reply = await message.channel.send({ embeds: [mainEmbed], components: [row] });

  // Collector — listen for dropdown interaction
  const collector = reply.createMessageComponentCollector({
    filter: i => i.user.id === message.author.id && i.customId === 'help_menu',
    time: 120000 // 2 minutes
  });

  collector.on('collect', async (interaction) => {
    const selected = interaction.values[0];
    const cat      = CATEGORIES[selected];
    if (!cat) return;

    const catEmbed = new EmbedBuilder()
      .setTitle(`${cat.label} Commands`)
      .setDescription(cat.fields(PREFIX).join('\n'))
      .setColor(COLOR)
      .setFooter({ text: `Prefix: ${PREFIX} · Select another category below` });

    await interaction.update({ embeds: [catEmbed], components: [row] });
  });

  collector.on('end', async () => {
    // Disable menu after timeout
    const disabledMenu = new StringSelectMenuBuilder()
      .setCustomId('help_menu_disabled')
      .setPlaceholder('⏰ Menu expired — run ,help again')
      .setDisabled(true)
      .addOptions(new StringSelectMenuOptionBuilder().setLabel('Expired').setValue('expired'));

    const disabledRow = new ActionRowBuilder().addComponents(disabledMenu);
    await reply.edit({ components: [disabledRow] }).catch(() => {});
  });
};
