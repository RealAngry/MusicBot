const { EmbedBuilder } = require("discord.js");
const $ = require('../../emojis.js');

module.exports = {
    name: "skip",
    aliases: ["s"],
    category: "Music",
    description: "Skip the currently playing song",
    args: false,
    owner: false,
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        const player = message.client.manager.get(message.guild.id);
        
        // Translations
        const noSongPlaying = await client.translate(message.guild.id, "No song is currently playing.");
        const songSkipped = await client.translate(message.guild.id, "Song skipped successfully!");

        // Check if player exists
        if (!player?.queue?.current) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`${$.error} **${noSongPlaying}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Handle skip with autoplay check
        const autoplay = player.get("autoplay");
        if (autoplay === false) {
            player.stop();
        } else {
            player.stop();
            player.queue.clear();
            player.set("autoplay", false);
        }

        // Create success embed
        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setAuthor({ 
                name: "⏭️ Song Skipped",  // Using normal emoji here
                iconURL: message.author.displayAvatarURL() 
            })
            .setDescription(`${$.success} **${songSkipped}**`)
            .setFooter({
                text: `Requested by ${message.author.username}`,  // No custom emoji
                iconURL: message.author.displayAvatarURL()
            });

        return message.channel.send({ embeds: [embed] });
    }
};