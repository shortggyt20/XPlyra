const { REST, Routes } = require('discord.js');

const clientId = '1487911602328961217';
const TOKEN = 'MTQ4NzkxMTYwMjMyODk2MTIxNw.GKhXTs.tNCRxph5OM-JLk7gPSUOj5RZ_jMGYn9RePodCw'

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: [] }
        );

        console.log('✅ Successfully deleted ALL global commands.');
    } catch (error) {
        console.error(error);
    }
})();