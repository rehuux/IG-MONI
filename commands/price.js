const { embed } = require('./utils');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async function priceCmd({ message }) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Contact to Buy')
      .setStyle(ButtonStyle.Link)
      .setURL('https://discord.com/users/1478974680219254818')
      .setEmoji('💳')
  );

  return message.channel.send({
    embeds: [embed('💎 Premium Pricing',
      [
        '> Get **no-prefix** access and unlock all features!',
        '',
        '**📅 Monthly Plan**',
        '> `$50 / month`',
        '> • No-prefix mode',
        '> • DM notifications',
        '> • Priority support',
        '',
        '**♾️ Lifetime Plan**',
        '> `$150 one-time`',
        '> • Everything in Monthly',
        '> • Never expires',
        '> • Best value 🔥',
        '',
        '**Payment:** Crypto / PayPal',
        'DM an owner to purchase.'
      ].join('\n')
    )],
    components: [row]
  });
};
