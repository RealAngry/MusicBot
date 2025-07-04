const { EmbedBuilder } = require("discord.js");
const $ = require('../../emojis.js');

module.exports = {
    name: "skipto",
    aliases: ["jump"],
    category: "Music",
    description: "⏩ Forward to a specific song in queue", // Normal emoji here
    args: true,
    usage: "<Number of song in queue>",
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        const player = message.client.manager.get(message.guild.id);
        
        // Translations
        const noSongPlaying = await client.translate(message.guild.id, "No song is currently playing.");
        const usageText = await client.translate(message.guild.id, `Usage: \`${prefix}skipto <song number>\``);
        const skippedText = await client.translate(message.guild.id, `Skipped to song at position`);

        // Check if player exists
        if (!player?.queue?.current) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`${$.error} **${noSongPlaying}**`) // Custom emoji
                .setAuthor({ 
                    name: "❌ Error", // Normal emoji
                    iconURL: client.user.displayAvatarURL()
                });
            return message.channel.send({ embeds: [embed] });
        }

        const position = Number(args[0]);
        
        // Validate position
        if (!position || position < 1 || position > player.queue.size) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`${$.error} **${usageText}**`) // Custom emoji
                .setFooter({ 
                    text: `Queue has ${player.queue.size} songs`, // Normal text
                    iconURL: message.author.displayAvatarURL()
                });
            return message.channel.send({ embeds: [embed] });
        }

        // Perform skip
        player.queue.remove(0, position - 1);
        player.stop();

        // Success embed
        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setAuthor({ 
                name: "⏭️ Song Skipped", // Normal emoji
                iconURL: client.user.displayAvatarURL()
            })
            .setDescription(`${$.success} **${skippedText} \`${position}\`**`) // Custom emoji
            .setFooter({ 
                text: `Requested by ${message.author.username}`, // Normal text
                iconURL: message.author.displayAvatarURL()
            })
            .setTitle(`Jumped to Position ${$.skip} ${position}`); // Custom emoji in title

        return message.channel.send({ embeds: [embed] });
    }
};