const { EmbedBuilder } = require("discord.js");
const $ = require('../../emojis.js');

module.exports = async (client, player) => {
    try {
        const channel = client.channels.cache.get(player.textChannel);
        if (!channel) return;

        const endMessage = await client.translate(player.guild, "The queue has ended!");

        const embed = new EmbedBuilder()
            .setColor("#FF0000") // Consistent red color scheme
            .setDescription(`${$.success} **${endMessage}**`)
            .setFooter({
                text: client.user.username,
                iconURL: client.user.displayAvatarURL()
            })
            .setTimestamp();

        await channel.send({ embeds: [embed] });

    } catch (error) {
        console.error("Queue end handler error:", error);
    }
};