const { EmbedBuilder } = require("discord.js");
const $ = require('../../emojis.js');

module.exports = async (client, player, track, payload) => {
    const channel = client.channels.cache.get(player.textChannel);
    if (!channel) return;

    // Translations
    const errorMessage = await client.translate(player.guild, "An error occurred while trying to play this track!");
    const errorDetails = await client.translate(player.guild, "Error Details");
    const actionTaken = await client.translate(player.guild, "The player has been stopped because there's no voice channel connection");

    try {
        // Create error embed
        const embed = new EmbedBuilder()
            .setColor("#FF0000") // Red for errors
            .setAuthor({
                name: "Track Playback Error",
                iconURL: client.user.displayAvatarURL()
            })
            .setDescription(`${$.error} **${errorMessage}**`)
            .addFields([
                {
                    name: `${errorDetails}:`,
                    value: `\`\`\`${payload.error || "Unknown error"}\`\`\``
                }
            ])
            .setFooter({
                text: player.voiceChannel ? "" : actionTaken,
                iconURL: client.user.displayAvatarURL()
            })
            .setTimestamp();

        await channel.send({ embeds: [embed] });

        // Destroy player if not in voice channel
        if (!player.voiceChannel) {
            player.destroy();
        }

    } catch (err) {
        console.error("Failed to send track error message:", err);
        // Fallback to simple message if embed fails
        await channel.send(`${$.error} **${errorMessage}**`).catch(() => {});
    }
};