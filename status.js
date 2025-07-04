const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const config = require('./config.json');

const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildVoiceStates

    ]

});

const updateStatus = () => {

    let count = 0;

    client.guilds.cache.forEach(guild => {

        const botMember = guild.members.me;

        if (!botMember) return;

        

        const voiceChannel = guild.channels.cache.find(channel =>

            channel.type === 2 && channel.members.has(botMember.id)

        );

        if (voiceChannel) count++;

    });

    client.user.setPresence({

        activities: [{ name: `🔊 ${count} Voice Channel`, type: ActivityType.Listening }],

        status: 'online'

    });

};

client.once('ready', () => {

    console.log(`[🎉-LOG] ${client.user.tag} is online with the new activity status!`);

    updateStatus();

});


client.on('voiceStateUpdate', () => {

    setTimeout(updateStatus, 1);

});

client.login(config.token);