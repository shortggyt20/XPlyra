require('dotenv').config();
const { 
  Client, 
  IntentsBitField, 
  EmbedBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ActionRowBuilder 
} = require('discord.js');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
  ],
});

client.on('ready', (c) => {
  console.log(`✅ ${c.user.tag} is online.`);
});

client.on('interactionCreate', async (interaction) => {

  // ✅ SLASH COMMAND
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'verify') {

      if (interaction.user.id !== '1270489291255976026') {
        return interaction.reply({ content: '❌ Not allowed.', ephemeral: true });
      }

      const button = new ButtonBuilder()
        .setLabel('✅ • Verify')
        .setStyle(ButtonStyle.Success)
        .setCustomId('verify_btn');

      const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setTitle('✅ • Verify')
        .setDescription("This is the offical **XPlyra Verify** system. \n\nWhat we track? we track you your discord id and your username. This infomation is for us to track punnishment logs, kick logs and ban logs")
        .setImage('https://cdn.discordapp.com/attachments/1348469158429327362/1487917598451433512/VERIFY.png');

      const row = new ActionRowBuilder().addComponents(button);

      await interaction.channel.send({ embeds: [embed], components: [row] });

      return interaction.reply({ content: '✅ Verify embed sent.', ephemeral: true });
    }
  }

  // ✅ BUTTON HANDLER
  if (interaction.isButton()) {
    if (interaction.customId !== 'verify_btn') return;

    const role = interaction.guild.roles.cache.find(r => r.name === '✔ | Verified');
    const role1 = interaction.guild.roles.cache.find(r => r.name === 'UnVerifyed');
    const role2 = interaction.guild.roles.cache.find(r => r.name === '𝙆𝙁𝙍𝙋 •  Community Member');

    if (!role) {
      return interaction.reply({ content: '❌ Role not found.', ephemeral: true });
    }

    // ✅ Check if already verified
    if (interaction.member.roles.cache.has(role.id)) {
      return interaction.reply({ content: '❌ You are already verified.', ephemeral: true });
    }

    try {
      const channel44 = client.channels.cache.get('1487943973094948866');
      const unixTimestampInSeconds = Math.floor(interaction.createdTimestamp / 1000);
      await interaction.member.roles.add(role);
      await interaction.member.roles.add(role2);
      await interaction.member.roles.remove(role1);

      await channel44.send(`User: <@${interaction.user.id}> Id: ${interaction.user.id} has been verifyed at <t:${unixTimestampInSeconds}:f> in the server "${interaction.guild.name}"`)

      return interaction.reply({
        content: '✅ You have been verified!',
        ephemeral: true
      });

    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: '❌ Failed to assign role (check bot permissions).',
        ephemeral: true
      });
    }
  }
});

client.on('guildMemberAdd', (member) => {
  const role = member.guild.roles.cache.find(r => r.name === 'UnVerifyed');
  member.roles.add(role);
})

client.login(process.env.TOKEN);