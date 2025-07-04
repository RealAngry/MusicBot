const { EmbedBuilder } = require("discord.js");
const $ = require('../../emojis.js');

module.exports = {
    name: "stop",
    aliases: ["st"],
    category: "Music",
    description: "Stops the music and clears the queue",
    args: false,
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        const player = message.client.manager.get(message.guild.id);

        // Translations
        const noSongPlaying = await client.translate(message.guild.id, "No song is currently playing.");
        const musicStopped = await client.translate(message.guild.id, "Music stopped and queue cleared!");

        // Check if player exists
        if (!player?.queue?.current) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`${$.error} **${noSongPlaying}**`)
                .setAuthor({ 
                    name: "❌ Music Error",
                    iconURL: client.user.displayAvatarURL()
                });
            return message.channel.send({ embeds: [embed] });
        }

        // Stop player and clear queue
        player.stop();
        player.queue.clear();

        // Success embed
        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setAuthor({ 
                name: "⏹️ Music Stopped",
                iconURL: client.user.displayAvatarURL()
            })
            .setDescription(`${$.stop} **${musicStopped}**`)
            .setFooter({ 
                text: `Requested by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL()
            });

        return message.channel.send({ embeds: [embed] });
    }
};