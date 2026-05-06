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
  MessageFlags
} = require('discord.js');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

// ================= SERVER CACHE =================
let serverCache = {
  data: null,
  online: false
};

async function updateServerCache() {
  try {
    const res = await fetch(
      'https://api.policeroleplay.community/v2/server?Players=true&Vehicles=true&JoinLogs=true&KillLogs=true&CommandLogs=true&ModCalls=true',
      { headers: { 'server-key': process.env.PRC_KEY } }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    serverCache.data = data;
    serverCache.online = (data?.CurrentPlayers || 0) > 0;

  } catch (err) {
    console.error("Cache Error:", err.message);
  }
}
// ===============================================


// ================= READY =================
client.on('clientReady', async (c) => {
  console.log(`✅ ${c.user.tag} is online.`);
  client.user.setActivity('🛡️ XPlyra Network 🛡️', { type: ActivityType.Playing });
  client.user.setStatus('dnd');

  // 🔥 ONLY API CALL IN ENTIRE BOT
  updateServerCache();
  const CACHE_INTERVAL = 5 * 1000;
  setInterval(updateServerCache, CACHE_INTERVAL);

  // Start loggers
  startJoinLogger();
  startCommandLogger();
  startKillLogger();
  startModLogger();
});

function startJoinLogger() {
  const CHANNEL_ID = '1486158915111489608';
  const INTERVAL = 5000;

  let seen = new Set();
  let init = false;

  setInterval(async () => {
    try {
      const data = serverCache.data;
      if (!data || !serverCache.online) return;

      const logs = data.JoinLogs || [];
      const channel = await client.channels.fetch(CHANNEL_ID);

      if (!init) {
        logs.forEach(l => seen.add(`${l.Player}-${l.Timestamp}`));
        init = true;
        return;
      }

      const fresh = logs.filter(l => !seen.has(`${l.Player}-${l.Timestamp}`));

      for (const log of fresh.reverse()) {
        if (!log.Player) continue;

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
      console.error("Join Logger Error:", err.message);
    }
  }, INTERVAL);
}

function startCommandLogger() {
  const CHANNEL_ID = '1485396851627790409';
  const INTERVAL = 5000;

  let seen = new Set();
  let init = false;

  setInterval(async () => {
    try {
      const data = serverCache.data;
      if (!data || !serverCache.online) return;

      const logs = data.CommandLogs || [];
      const channel = await client.channels.fetch(CHANNEL_ID);

      if (!init) {
        logs.forEach(l => seen.add(`${l.Player}-${l.Timestamp}`));
        init = true;
        return;
      }

      const fresh = logs.filter(l => !seen.has(`${l.Player}-${l.Timestamp}`));

      for (const log of fresh.reverse()) {
        if (!log.Player) continue;

        const [name, id] = log.Player.split(":");
        const url = `https://roblox.com/users/${id}/profile`;
        const time = `<t:${log.Timestamp}:T>`;

        await channel.send(
          `<:Cmd:1493298928282632272> **[${name}](${url})** ran \`${log.Command}\` at ${time}`
        );

        seen.add(`${log.Player}-${log.Timestamp}`);
      }

    } catch (err) {
      console.error("Command Logger Error:", err.message);
    }
  }, INTERVAL);
}

function startKillLogger() {
  const CHANNEL_ID = '1488951297787826410';
  const INTERVAL = 5000;

  let seen = new Set();
  let init = false;

  setInterval(async () => {
    try {
      const data = serverCache.data;
      if (!data || !serverCache.online) return;

      const logs = data.KillLogs || [];
      const channel = await client.channels.fetch(CHANNEL_ID);

      if (!init) {
        logs.forEach(l => seen.add(`${l.Killer}-${l.Victim}-${l.Timestamp}`));
        init = true;
        return;
      }

      const fresh = logs.filter(l => !seen.has(`${l.Killer}-${l.Victim}-${l.Timestamp}`));

      for (const log of fresh.reverse()) {
        if (!log.Killer || !log.Victim) continue;

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
      console.error("Kill Logger Error:", err.message);
    }
  }, INTERVAL);
}

function startModLogger() {
  const CHANNEL_ID = '1485396851627790409';
  const INTERVAL = 5000;

  let seen = new Set();
  let init = false;

  setInterval(async () => {
    try {
      const data = serverCache.data;
      if (!data || !serverCache.online) return;

      const logs = data.ModCalls || [];
      const channel = await client.channels.fetch(CHANNEL_ID);

      if (!init) {
        logs.forEach(l => seen.add(`${l.Caller}-${l.Moderator}-${l.Timestamp}`));
        init = true;
        return;
      }

      const fresh = logs.filter(l =>
        !seen.has(`${l.Caller}-${l.Moderator}-${l.Timestamp}`)
      );

      for (const log of fresh.reverse()) {

        let callerName = "Unknown", callerId = null;
        let modName = "Unknown", modId = null;

        if (log.Caller?.includes(":"))
          [callerName, callerId] = log.Caller.split(":");

        if (log.Moderator?.includes(":"))
          [modName, modId] = log.Moderator.split(":");

        const callerUrl = callerId ? `https://roblox.com/users/${callerId}/profile` : null;
        const modUrl = modId ? `https://roblox.com/users/${modId}/profile` : null;

        const time = `<t:${log.Timestamp}:T>`;

        await channel.send(
          `<:Mod:1493720254306717808> **${callerUrl ? `[${callerName}](${callerUrl})` : callerName}** handled by **${modUrl ? `[${modName}](${modUrl})` : modName}** at ${time}`
        );

        seen.add(`${log.Caller}-${log.Moderator}-${log.Timestamp}`);
      }

    } catch (err) {
      console.error("Mod Logger Error:", err.message);
    }
  }, INTERVAL);
}

function startJoinLogger() {
  const CHANNEL_ID = '1486158915111489608';
  const INTERVAL = 5000;

  let seen = new Set();
  let init = false;

  setInterval(async () => {
    try {
      const res = await fetch(
        'https://api.policeroleplay.community/v1/server/joinlogs',
        {
          headers: {
            'server-key': process.env.PRC_KEY,
            Accept: 'application/json'
          }
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const logs = await res.json();
      const channel = await client.channels.fetch(CHANNEL_ID);

      if (!Array.isArray(logs)) return;

      // 🚫 prevent spam on startup
      if (!init) {
        logs.forEach(l => seen.add(`${l.Player}-${l.Timestamp}`));
        init = true;
        console.log("Join logger initialized");
        return;
      }

      const fresh = logs.filter(l => !seen.has(`${l.Player}-${l.Timestamp}`));

      for (const log of fresh.reverse()) {
        if (!log.Player) continue;

        const [name, id] = log.Player.split(":");
        const url = id ? `https://www.roblox.com/users/${id}/profile` : null;
        const time = `<t:${log.Timestamp}:T>`;

        const msg = log.Join
          ? `<:Add:1490143650049425428> **${url ? `[${name}](${url})` : name}** joined at ${time}`
          : `<:Subtrack:1490143673109971014> **${url ? `[${name}](${url})` : name}** left at ${time}`;

        await channel.send(msg);

        seen.add(`${log.Player}-${log.Timestamp}`);
      }

    } catch (err) {
      console.error("Join Logger Error:", err.message);
    }
  }, INTERVAL);
}

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

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.author.id !== '1270489291255976026') return;

  if (message.content === '!players') {
    try {
      const res = await fetch(
        'https://api.policeroleplay.community/v2/server?Players=true&Vehicles=true',
        {
          method: 'GET',
          headers: {
            "server-key": process.env.PRC_KEY,
            "Accept": "*/*",
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const players = data.Players || [];
      const vehicles = data.Vehicles || [];

      const playerList = players.length
        ? players.slice(0, 20).map(p => {
            const [username, userId] = p.Player?.split(":") || ["Unknown", ""];

            const ownedVehicles = vehicles
              .filter(v => v.Owner === username)
              .map(v => v.Name)
              .join(', ') || "None";

            const loc = p.Location || {};
            const locationText = loc.PostalCode
              ? `📍 ${loc.PostalCode} | ${loc.StreetName || "Unknown"} ${loc.BuildingNumber || ""}`
              : "📍 Unknown";

            return `<:Bracketleft:1493731052428988497> **${username}** <:Bracketright:1493731558023233698>
<:dot:1493727753059438703> 🏷️ **${p.Permission || "Unknown"}**
<:dot:1493727753059438703> 🚗 ${ownedVehicles}
<:dot:1493727753059438703> Location: ${locationText}`;
          }).join('\n\n')
        : 'No players online';

      const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setTitle('<:Server:1493725741894991912> Player Data')
        .setDescription(playerList)
        .setFooter({ text: `Players: ${players.length} | Vehicles: ${vehicles.length}` })
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (err) {
      console.error("Player API Error:", err);
      message.reply('❌ Failed to fetch player data.');
    }
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!serverinfo' || message.content === '!server') {
    try {
      const res = await fetch(
        'https://api.policeroleplay.community/v2/server?Players=true',
        {
          headers: {
            Accept: 'application/json',
            'server-key': process.env.PRC_KEY
          }
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const name = data.Name || "Unknown";
      const ownerId = data.OwnerId || null;
      const players = `${data.CurrentPlayers || 0}/${data.MaxPlayers || 0}`;
      const joinCode = data.JoinKey || "N/A";
      const verified = data.AccVerifiedReq || "Unknown";
      const balance = data.TeamBalance ? "Enabled" : "Disabled";

      let ownerName = "Unknown";

      if (ownerId) {
        try {
          const userRes = await fetch(`https://users.roblox.com/v1/users/${ownerId}`);
          const userData = await userRes.json();
          ownerName = userData.name || "Unknown";
        } catch (err) {
          console.error("Owner fetch failed:", err);
        }
      }

      const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setTitle('<:Server:1493725741894991912> Server Information')
        .addFields(
          { name: '🏷️ Server Name', value: `<:dot:1493727753059438703> **${name}**` },
          { name: '👑 Owner', value: `**[${ownerName}](https://www.roblox.com/users/${ownerId}/profile)**` },
          { name: '👥 Players', value: players, inline: true },
          { name: '🔑 Join Code', value: `\`${joinCode}\``, inline: true },
          { name: '✅ Verification', value: verified, inline: true },
          { name: '⚖️ Team Balance', value: balance, inline: true }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });

    } catch (err) {
      console.error("Server Info API Error:", err);
      message.reply('❌ Failed to fetch server info.');
    }
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content === '!help') {
    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle('XPlyra Bot Commands')
      .setDescription('List of available commands:')
      .addFields(
        { name: '!verify', value: 'Sends the verification embed.' },
        { name: '!players', value: 'Shows current players and their vehicles.' },
        { name: '!serverinfo / !server', value: 'Displays server information.' }
      )
      .setFooter({ text: 'XPlyra Network' })
      .setTimestamp();  

    await message.reply({ embeds: [embed] });
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '!bans') {
    try {

      const res = await fetch("https://api.policeroleplay.community/v1/server/bans", {
        headers: {
          "server-key": process.env.PRC_KEY,
          "Accept": "*/*"
        }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const bans = await res.json();
      const entries = Object.entries(bans);

      let description = "";

      if (!entries.length) {
        description = "No active bans.";
      } else {
        entries.slice(0, entries.length).forEach(([id, username], i) => {
          description += `**${i + 1}.** ${username} (\`${id}\`)\n`;
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("🚫 ERLC Ban List")
        .setDescription(description)
        .setColor(0xff0000)
        .setFooter({ text: `Total Bans: ${entries.length}` })
        .setTimestamp();

      // 🔒 send privately (hidden alternative)
      await message.reply({ embeds: [embed], ephemeral: true });

      // optional: delete command message
      await message.delete().catch(() => {});

    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to fetch ban list.");
    }
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (!message.content.startsWith('!purge')) return;

  // permission check
  if (!message.member.permissions.has('ManageMessages')) {
    return message.reply("❌ You don't have permission to use this.");
  }

  const args = message.content.split(' ');
  const amount = parseInt(args[1]);

  if (!amount || amount < 1 || amount > 100) {
    return message.reply("❌ Please provide a number between 1 and 100.");
  }

  try {
    // fetch + bulk delete
    const deleted = await message.channel.bulkDelete(amount, true);

    const reply = await message.channel.send(`🧹 Deleted ${deleted.size} messages.`);

    setTimeout(() => reply.delete().catch(() => {}), 3000);

  } catch (err) {
    console.error(err);
    message.reply("❌ Failed to delete messages. (Messages may be older than 14 days)");
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (!message.content.startsWith('!cmdr ')) return;

  const args = message.content.slice(7).trim().split(' ');
  const action = args[0];
  const target = args.slice(1).join(' ');

  if (!action) {
    return message.reply("❌ Usage: !cmdr <command> <args>");
  }

  const erlcCommand = target
    ? `:${action} ${target}`
    : `:${action}`;

  try {
    const res = await fetch("https://api.policeroleplay.community/v1/server/command", {
      method: "POST",
      headers: {
        "server-key": process.env.PRC_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        command: erlcCommand
      })
    });

    const text = await res.text(); // helpful for debugging

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} - ${text}`);
    }

    return message.reply(`✅ Sent: \`${erlcCommand}\``);

  } catch (err) {
    if (err.message.includes('3002')) {
      console.error(err);
      return message.reply("❌ ERLC said the server is offline. Command not sent.");
    }
  }
});

client.login(process.env.TOKEN);