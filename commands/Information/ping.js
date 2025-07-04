const { EmbedBuilder } = require("discord.js");
const $ = require('../../emojis.js');

module.exports = {
    name: "ping",
    category: "Information",
    description: "Check bot's latency",
    args: false,
    execute: async (message, args, client, prefix) => {
        const ping = client.ws.ping;
        const msText = await client.translate(message.guild.id, "Milliseconds");
        
        const embed = new EmbedBuilder()
            .setColor("#FF0000") // Red color scheme
            .setAuthor({
                name: "Bot Latency", // No emoji in author
                iconURL: client.user.displayAvatarURL()
            })
            .setDescription(`${$.info} **Ping:** \`${ping}ms\` ${msText}`) // Custom ping emoji
            .setFooter({
                text: `Requested by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL()
            })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }
};