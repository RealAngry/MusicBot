const { EmbedBuilder } = require("discord.js");
const $ = require('../../emojis.js');

module.exports = async (client, player, oldChannel, newChannel) => {
    try {
        const guild = client.guilds.cache.get(player.guild);
        if (!guild) return;

        const textChannel = guild.channels.cache.get(player.textChannel);
        
        // No change in voice channel
        if (oldChannel === newChannel) return;

        // Bot was disconnected from voice
        if (!newChannel) {
            if (!player) return;

            const leftMessage = await client.translate(
                player.guild, 
                `I have left <#${oldChannel}> because I was disconnected`
            );

            if (textChannel) {
                const embed = new EmbedBuilder()
                    .setColor("#FF0000") // Red for disconnection
                    .setDescription(`${$.leave} **${leftMessage}**`)
                    .setFooter({
                        text: guild.name,
                        iconURL: guild.iconURL()
                    });

                await textChannel.send({ embeds: [embed] });
            }

            return player.destroy();
        }

        // Bot moved to new voice channel
        player.voiceChannel = newChannel;
        
        // Resume if paused
        if (player.paused) player.pause(false);

        const movedMessage = await client.translate(
            player.guild,
            `I have moved to <#${newChannel}>`
        );

        if (textChannel) {
            const embed = new EmbedBuilder()
                .setColor("#00FF00") // Green for successful move
                .setDescription(`${$.success} **${movedMessage}**`)
                .setFooter({
                    text: guild.name,
                    iconURL: guild.iconURL()
                });

            await textChannel.send({ embeds: [embed] });
        }

    } catch (error) {
        console.error("Voice channel update error:", error);
    }
};