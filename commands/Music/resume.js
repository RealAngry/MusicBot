const { EmbedBuilder } = require("discord.js");
const $ = require('../../emojis.js');

module.exports = {
    name: "resume",
    aliases: ["r"],
    category: "Music",
    description: "Resume currently playing music",
    args: false,
    usage: "<Number of song in queue>",
    owner: false,
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        const player = message.client.manager.get(message.guild.id);
        
        // Translations
        const noSongPlaying = await client.translate(message.guild.id, "There is no song currently playing.");
        const alreadyPlaying = await client.translate(message.guild.id, "The song is already playing.");
        const resumedSuccess = await client.translate(message.guild.id, "Resumed");

        // Check if there's a song playing
        if (!player.queue.current) {
            return message.channel.send({
                content: `${$.error} **${noSongPlaying}**`
            });
        }

        // Check if already playing
        if (!player.paused) {
            return message.channel.send({
                content: `${$.play} **${alreadyPlaying}**`
            });
        }

        // Resume the player
        player.pause(false);

        // Create embed
        const embed = new EmbedBuilder()
            .setColor("#FF0000") // Red color
            .setAuthor({ name: "▶️ Music Resumed" }) // Normal emoji here
            .setDescription(`${$.play} **${resumedSuccess} [${player.queue.current.title}](${player.queue.current.uri})**`)
            .setThumbnail(`https://img.youtube.com/vi/${player.queue.current.identifier}/hqdefault.jpg`)
            .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() }); // Normal text here

        return message.channel.send({
            embeds: [embed],
            content: `${$.play} **${resumedSuccess}** \`${player.queue.current.title}\``
        });
    }
};