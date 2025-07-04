const { EmbedBuilder } = require("discord.js");
const $ = require("../../emojis.js");

module.exports = {
    name: "247",
    category: "Music",
    aliases: ["24/7", "stay"],
    description: "Toggles 24/7 mode to keep the bot in the voice channel.",
    args: false,
    usage: "",
    owner: false,
    player: false, // Changed from true to false to allow command without player
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        const { channel } = message.member.voice;
        let player = message.client.manager.get(message.guild.id);
        
        // If no player exists, create one with 24/7 mode enabled
        if (!player) {
            player = message.client.manager.create({
                guild: message.guild.id,
                voiceChannel: channel.id,
                textChannel: message.channel.id,
            });
            player.connect();
            player.set("247", true);
            
            const statusMessage = await client.translate(message.guild.id, "24/7 mode has been enabled.");
            
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle(`${$.music} 24/7 Mode`)
                .setDescription(`> **${statusMessage}**`)
                .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();
            
            return message.channel.send({ embeds: [embed] });
        }

        let is247Enabled = player.get("247") || false;
        player.set("247", !is247Enabled);
        
        const statusText = is247Enabled ? "Disabled" : "Enabled";
        const statusEmoji = is247Enabled ? $.off : $.on;
        const statusMessage = await client.translate(message.guild.id, `24/7 mode has been ${statusText.toLowerCase()}.`);
        
        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle(`${$.music} 24/7 Mode`)
            .setDescription(`> **${statusMessage}**`)
            .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();
        
        return message.channel.send({ embeds: [embed] });
    }
};