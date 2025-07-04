const { EmbedBuilder } = require("discord.js");
const $ = require('../../emojis.js');

module.exports = {
    name: "join",
    aliases: ["j"],
    category: "Music",
    description: "Join voice channel",
    args: false,
    player: false,
    inVoiceChannel: true,
    sameVoiceChannel: false,
    execute: async (message, args, client, prefix) => {
        const { channel } = message.member.voice;
        const botVoiceChannel = message.guild.members.cache.get(client.user.id).voice.channel;

        // If bot is not in any voice channel
        if (!botVoiceChannel) {
            const player = message.client.manager.create({
                guild: message.guild.id,
                voiceChannel: channel.id,
                textChannel: message.channel.id,
                volume: 100,
                selfDeafen: true,
            });
            
            player.connect();
            
            const successEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setAuthor({ name: "🔊 Joined Voice Channel" })
                .setDescription(`${$.success} Joined <#${channel.id}> and will send notifications to <#${message.channel.id}>`)
                .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() });
            
            return message.channel.send({ embeds: [successEmbed] });
        }
        // If bot is already in a voice channel
        else if (botVoiceChannel) {
            // If in different channel than user
            if (botVoiceChannel.id !== channel.id) {
                const errorEmbed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setAuthor({ name: "❌ Cannot Join Channel" })
                    .setDescription(`${$.error} You must be in the same voice channel as me (${botVoiceChannel}) to use this command!`)
                    .setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL() });
                
                return message.channel.send({ embeds: [errorEmbed] });
            }
            // If already in same channel
            else {
                const infoEmbed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setAuthor({ name: "ℹ️ Already Connected" })
                    .setDescription(`${$.info} I'm already in your voice channel!`)
                    .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() });
                
                return message.channel.send({ embeds: [infoEmbed] });
            }
        }
    }
};