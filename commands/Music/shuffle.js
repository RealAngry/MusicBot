const { EmbedBuilder } = require("discord.js");
const $ = require('../../emojis.js');

module.exports = {
    name: "shuffle",
    aliases: ["sh"],
    category: "Music",
    description: "Shuffle the current queue",
    args: false,
    owner: false,
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        const player = message.client.manager.get(message.guild.id);
        
        // Translations
        const noSongPlaying = await client.translate(message.guild.id, "No song is currently playing.");
        const queueShuffled = await client.translate(message.guild.id, "Queue has been shuffled!");

        // Check if player exists
        if (!player?.queue?.current) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#FF0000")
                        .setDescription(`${$.error} **${noSongPlaying}**`)
                ]
            });
        }

        // Shuffle the queue
        player.queue.shuffle();

        // Create success embed
        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setAuthor({ 
                name: `✓ Queue Shuffled`,
                iconURL: message.author.displayAvatarURL()
            })
            .setDescription(`${$.success} **${queueShuffled}**`)
            .setFooter({
                text: `Shuffled by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL()
            });

        return message.channel.send({ embeds: [embed] });
    }
};