const { EmbedBuilder } = require("discord.js");
const $ = require('../../emojis.js');

module.exports = {
    name: "leave",
    aliases: ["l"],
    category: "Music",
    description: "Leave voice channel",
    args: false,
    player: false,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        const player = message.client.manager.get(message.guild.id);
        const botVoiceChannel = message.guild.members.cache.get(client.user.id)?.voice?.channel;

        // If bot is not in any voice channel
        if (!botVoiceChannel) {
            const notInChannelEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setAuthor({ name: "❌ Not Connected" })
                .setDescription(`${$.error} I'm not currently in any voice channel!`)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });
            
            return message.channel.send({ embeds: [notInChannelEmbed] });
        }

        // If no player instance exists
        if (!player) {
            const noPlayerEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setAuthor({ name: "❌ Not Playing" })
                .setDescription(`${$.error} I'm not currently playing anything!`)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });
            
            return message.channel.send({ embeds: [noPlayerEmbed] });
        }

        // Destroy player and leave
        player.destroy();
        
        const successEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setAuthor({ name: "👋 Left Voice Channel" })
            .setDescription(`${$.success} Successfully left the voice channel!`)
            .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() });
        
        return message.channel.send({ embeds: [successEmbed] });
    }
};