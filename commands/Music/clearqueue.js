const { EmbedBuilder } = require("discord.js");
const $ = require('../../emojis.js');

module.exports = {
    name: "clearqueue",
    aliases: ["cq", "clear"],
    category: "Music",
    description: "Clear the current music queue",
    args: false,
    usage: "<Number of song in queue>",
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        const player = message.client.manager.get(message.guild.id);
        
        // Translations
        const noSongPlaying = await client.translate(message.guild.id, "There is no song currently playing.");
        const queueCleared = await client.translate(message.guild.id, "The queue has been cleared.");

        // Check if player exists and has current track
        if (!player?.queue?.current) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`${$.error} **${noSongPlaying}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Clear the queue
        player.queue.clear();

        // Create success embed
        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setAuthor({ name: "Queue Cleared" })
            .setDescription(`${$.dustbin} **${queueCleared}**`)
            .setFooter({ 
                text: `Requested by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL() 
            });

        return message.channel.send({ embeds: [embed] });
    }
};