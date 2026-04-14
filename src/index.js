const config = require("./config.json");
require('dotenv').config();
const {
  Client,
  IntentsBitField,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ActivityType,
} = require('discord.js');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

// ================= READY =================
client.on('clientReady', async (c) => {
  LOG_CHANNEL_ID = '1493300920908382411';
  logChannel = await client.channels.fetch(LOG_CHANNEL_ID);

  console.log(`✅ ${c.user.tag} is online.`);
  client.user.setActivity('🛡️ XPlyra Network 🛡️', { type: ActivityType.Playing });
  client.user.setStatus('dnd');

  startJoinLogger();
  startCommandLogger();
  startKillLogger();
});

// ================= VERIFY SYSTEM =================
client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'verify') {
      if (interaction.user.id !== '1270489291255976026') {
        return interaction.reply({ content: '❌ Not allowed.', ephemeral: true });
      }

      const button = new ButtonBuilder()
        .setLabel('✅ • Verify')
        .setStyle(ButtonStyle.Success)
        .setCustomId('verify_btn');

      const buttonlink = new ButtonBuilder()
        .setLabel('Support')
        .setStyle(ButtonStyle.Link)
        .setURL('https://kfrp.base44.app/support');

      const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setTitle('✅ • Verify')
        .setDescription("Official XPlyra verify system.")
        .setImage('https://cdn.discordapp.com/attachments/1485396851434983507/1488314211271708692/VERIFY.png');

      const row = new ActionRowBuilder().addComponents(button, buttonlink);

      await interaction.channel.send({ embeds: [embed], components: [row] });
      return interaction.reply({ content: '✅ Verify embed sent.', ephemeral: true });
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId !== 'verify_btn') return;

    const role = interaction.guild.roles.cache.find(r => r.name === '✔ | Verified');
    const role1 = interaction.guild.roles.cache.find(r => r.name === 'UnVerifyed');
    const role2 = interaction.guild.roles.cache.find(r => r.name === '𝙆𝙁𝙍𝙋 •  Community Member');

    if (!role || !role1 || !role2) {
      return interaction.reply({ content: '❌ Roles not configured correctly.', ephemeral: true });
    }

    if (interaction.member.roles.cache.has(role.id)) {
      return interaction.reply({ content: '❌ Already verified.', ephemeral: true });
    }

    try {
      await interaction.member.roles.add(role);
      await interaction.member.roles.add(role2);
      await interaction.member.roles.remove(role1);

      return interaction.reply({ content: '✅ Verified!', ephemeral: true });

    } catch (err) {
      console.error(err);
    }
  }
});


// ================= AUTO ROLE =================
client.on('guildMemberAdd', (member) => {
  const role = member.guild.roles.cache.find(r => r.name === 'UnVerifyed');
  if (role) member.roles.add(role).catch(console.error);
});


// ================= JOIN LOGGER =================
function startJoinLogger() {
  const CHANNEL_ID = '1486158915111489608';
  const INTERVAL = 5000;

  let seen = new Set();
  let init = false;

  setInterval(async () => {
    try {
      const res = await fetch('https://api.policeroleplay.community/v1/server/joinlogs', {
        headers: { 'server-key': process.env.PRC_KEY }
      });

      const logs = await res.json();
      const channel = await client.channels.fetch(CHANNEL_ID);

      if (!init) {
        logs.forEach(l => seen.add(`${l.Player}-${l.Timestamp}`));
        init = true;
        return;
      }

      const fresh = logs.filter(l => !seen.has(`${l.Player}-${l.Timestamp}`));

      for (const log of fresh.reverse()) {
        const [name, id] = log.Player.split(":");
        const url = `https://roblox.com/users/${id}/profile`;
        const time = `<t:${log.Timestamp}:T>`;

        await channel.send(
          log.Join
            ? `<:Add:1490143650049425428> **[${name}](${url})** joined at ${time}`
            : `<:Subtrack:1490143673109971014> **[${name}](${url})** left at ${time}`
        );

        seen.add(`${log.Player}-${log.Timestamp}`);
      }

    } catch (err) {
      console.error(err);
    }
  }, INTERVAL);
}


// ================= COMMAND LOGGER =================
function startCommandLogger() {
  const CHANNEL_ID = '1485396851627790409';
  const INTERVAL = 5000;

  let seen = new Set();
  let init = false;

  setInterval(async () => {
    try {
      const res = await fetch('https://api.policeroleplay.community/v1/server/commandlogs', {
        headers: { 'server-key': process.env.PRC_KEY }
      });

      const logs = await res.json();
      const channel = await client.channels.fetch(CHANNEL_ID);

      if (!init) {
        logs.forEach(l => seen.add(`${l.Player}-${l.Timestamp}`));
        init = true;
        return;
      }

      const fresh = logs.filter(l => !seen.has(`${l.Player}-${l.Timestamp}`));

      for (const log of fresh.reverse()) {
        const [name, id] = log.Player.split(":");
        const url = `https://roblox.com/users/${id}/profile`;
        const time = `<t:${log.Timestamp}:T>`;

        await channel.send(
          `<:Cmd:1493298928282632272> **[${name}](${url})** ran \`${log.Command}\` at ${time}`
        );

        seen.add(`${log.Player}-${log.Timestamp}`);
      }

    } catch (err) {
      console.error(err);
    }
  }, INTERVAL);
}


// ================= KILL LOGGER =================
function startKillLogger() {
  const CHANNEL_ID = '1488951297787826410';
  const INTERVAL = 5000;

  let seen = new Set();
  let init = false;

  setInterval(async () => {
    try {
      const res = await fetch('https://api.policeroleplay.community/v1/server/killlogs', {
        headers: { 'server-key': process.env.PRC_KEY }
      });

      const logs = await res.json();
      const channel = await client.channels.fetch(CHANNEL_ID);

      if (!init) {
        logs.forEach(l => seen.add(`${l.Killer}-${l.Victim}-${l.Timestamp}`));
        init = true;
        return;
      }

      const fresh = logs.filter(l => !seen.has(`${l.Killer}-${l.Victim}-${l.Timestamp}`));

      for (const log of fresh.reverse()) {
        const [kName, kId] = log.Killer.split(":");
        const [vName, vId] = log.Victim.split(":");

        const kUrl = `https://roblox.com/users/${kId}/profile`;
        const vUrl = `https://roblox.com/users/${vId}/profile`;
        const time = `<t:${log.Timestamp}:T>`;

        await channel.send(
          `<:kill:1493356356357455898> **[${kName}](${kUrl})** eliminated **[${vName}](${vUrl})** at ${time}`
        );

        seen.add(`${log.Killer}-${log.Victim}-${log.Timestamp}`);
      }

    } catch (err) {
      console.error(err);
    }
  }, INTERVAL);
}


// ================= LOGIN =================
client.login(process.env.TOKEN);