const { EmbedBuilder } = require("discord.js");
const $ = require('../../emojis.js');

module.exports = {
    name: "pause",
    aliases: ["pause"],
    category: "Music",
    description: "Pause the currently playing music",
    args: false,
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        const player = message.client.manager.get(message.guild.id);
        
        // Translation variables
        const noSongPlaying = await client.translate(message.guild.id, "There is no song currently playing.");
        const alreadyPaused = await client.translate(message.guild.id, "The song is already paused.");
        const pausedSuccess = await client.translate(message.guild.id, "Paused");

        // Check if there's a song playing
        if (!player.queue.current) {
            return message.channel.send({
                content: `${$.error} **${noSongPlaying}**`
            });
        }

        // Check if already paused
        if (player.paused) {
            return message.channel.send({
                content: `${$.pause} **${alreadyPaused}**`
            });
        }

        // Pause the player
        player.pause(true);

        // Send success message with embed
        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setAuthor({ name: "⏸️ Music Paused", iconURL: message.author.displayAvatarURL() })
            .setDescription(`${$.pause} **${pausedSuccess} [${player.queue.current.title}](${player.queue.current.uri})**`)
            .setFooter({ text: `Requested by ${message.author.username} • Enjoy your music!`, iconURL: message.author.displayAvatarURL() });

        return message.channel.send({
            content: `${$.pause} **${pausedSuccess}** \`${player.queue.current.title}\``,
            embeds: [embed]
        });
    }
};