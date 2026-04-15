require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
  {
    name: 'verify',
    description: 'Sends a verify embed',
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🧹 Clearing old slash commands...');

    // ✅ THIS CLEARS ALL GLOBAL COMMANDS FIRST
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [] }
    );

    console.log('📦 Old commands deleted. Registering new ones...');

    // ✅ THEN RECREATE
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log('✅ Slash commands were re-registered successfully!');
  } catch (error) {
    console.error('❌ Error refreshing commands:', error);
  }
})();