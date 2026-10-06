// ─── Shared helpers for all commands ─────────────────────────────────────────
const { EmbedBuilder } = require('discord.js');
const EMOJIS = require('../emojis.json');

const COLOR = 0xFFFFFF; // all embeds same white color

function embed(title, description, color = COLOR) {
  return new EmbedBuilder().setTitle(title).setDescription(description).setColor(color);
}

// Easy emoji access: e('ui.success') → ✅
function e(path) {
  const parts = path.split('.');
  let obj = EMOJIS;
  for (const p of parts) {
    obj = obj?.[p];
    if (!obj) return '';
  }
  return obj;
}

// Parse time string like 1m, 7d, 1y, 6mo → ms
function parseTime(str) {
  if (!str) return null;
  const match = str.match(/^(\d+)(m|h|d|mo|y)$/i);
  if (!match) return null;
  const n = parseInt(match[1]);
  const u = match[2].toLowerCase();
  const map = { m: 60000, h: 3600000, d: 86400000, mo: 2592000000, y: 31536000000 };
  return n * (map[u] || 0);
}

// Format ms to readable string
function formatDuration(ms) {
  if (!ms) return 'Permanent';
  const s = Math.floor(ms / 1000);
  if (s < 60)   return `${s}s`;
  if (s < 3600) return `${Math.floor(s/60)}m`;
  if (s < 86400) return `${Math.floor(s/3600)}h`;
  if (s < 2592000) return `${Math.floor(s/86400)}d`;
  if (s < 31536000) return `${Math.floor(s/2592000)} month(s)`;
  return `${Math.floor(s/31536000)} year(s)`;
}

function formatExpiry(expiresAt) {
  if (!expiresAt) return 'Never';
  return `<t:${Math.floor(new Date(expiresAt).getTime() / 1000)}:R>`;
}

module.exports = { embed, COLOR, parseTime, formatDuration, formatExpiry, e, EMOJIS };
