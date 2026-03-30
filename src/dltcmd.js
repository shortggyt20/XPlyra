const { REST, Routes } = require('discord.js');

const clientId = '1487911602328961217';
const TOKEN = 'MTQ4NzkxMTYwMjMyODk2MTIxNw.GczAzu.DOuIGcz4YVwQvrhqaWinNp79gAvY_j_wmBScb8'

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        // ✅ Delete ALL global commands
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: [] }
        );

        console.log('✅ Successfully deleted ALL global commands.');
    } catch (error) {
        console.error(error);
    }
})();