const { EmbedBuilder } = require("discord.js");
const $ = require('../../emojis.js');

module.exports = async (client, player, track, payload) => {
    try {
        // Get text channel and check if it exists
        const channel = client.channels.cache.get(player.textChannel);
        if (!channel) return;

        // Get translation
        const errorMessage = await client.translate(player.guild, "An error occurred while trying to play this track!");

        // Create error embed
        const embed = new EmbedBuilder()
            .setColor("#FF0000") // Red color for errors
            .setDescription(`${$.error} **${errorMessage}**`)
            .setFooter({
                text: "Track playback failed",
                iconURL: client.user.displayAvatarURL()
            })
            .setTimestamp();

        // Send error message
        await channel.send({ embeds: [embed] });

        // Destroy player if not connected to voice channel
        if (!player.voiceChannel) {
            player.destroy();
        }

    } catch (error) {
        console.error("Error in track error handler:", error);
    }
};