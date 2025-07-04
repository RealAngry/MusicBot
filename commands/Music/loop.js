const { EmbedBuilder } = require("discord.js");
const $ = require('../../emojis.js');

module.exports = {
    name: "loop",
    aliases: ['l'],
    category: "Music",
    description: "Toggle music loop mode",
    args: false,
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        const player = message.client.manager.get(message.guild.id);
        
        // Translations
        const noSongPlaying = await client.translate(message.guild.id, "There is no song currently playing.");
        const queueLoopEnabled = await client.translate(message.guild.id, "Queue loop enabled");
        const queueLoopDisabled = await client.translate(message.guild.id, "Queue loop disabled");
        const trackLoopEnabled = await client.translate(message.guild.id, "Track loop enabled");
        const trackLoopDisabled = await client.translate(message.guild.id, "Track loop disabled");

        // Check if player exists
        if (!player?.queue?.current) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`${$.error} **${noSongPlaying}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Handle queue loop
        if (args.length && /queue/i.test(args[0])) {
            player.setQueueRepeat(!player.queueRepeat);
            const status = player.queueRepeat ? 
                `${$.success} **${queueLoopEnabled}**` : 
                `${$.error} **${queueLoopDisabled}**`;

            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setAuthor({ name: `${player.queueRepeat ? "🔁 Enabled" : "🔁 Disabled"}` })
                .setDescription(status)
                .setFooter({ 
                    text: `Requested by ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL() 
                });

            return message.channel.send({ embeds: [embed] });
        }

        // Handle track loop
        player.setTrackRepeat(!player.trackRepeat);
        const status = player.trackRepeat ? 
            `${$.success} **${trackLoopEnabled}**` : 
            `${$.success} **${trackLoopDisabled}**`;

        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setAuthor({ name: `${player.trackRepeat ? "🔂 Enabled" : "🔂 Disabled"}` })
            .setDescription(status)
            .setFooter({ 
                text: `Requested by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL() 
            });

        return message.channel.send({ embeds: [embed] });
    }
};