const { EmbedBuilder } = require("discord.js");
const $ = require('../../emojis.js');

module.exports = {
    name: "volume",
    aliases: ["v", "vol", "ses"],
    category: "Music",
    description: "Adjusts the player volume",
    args: false,
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        const player = message.client.manager.get(message.guild.id);

        // Translations
        const noSongPlaying = await client.translate(message.guild.id, "No song is currently playing.");
        const currentVolume = await client.translate(message.guild.id, "Current volume level");
        const volumeUsage = await client.translate(message.guild.id, `Usage: ${prefix}volume <0-200>`);
        const volumeSet = await client.translate(message.guild.id, "Volume set to");

        // Check if player exists
        if (!player?.queue?.current) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`${$.error} **${noSongPlaying}**`)
                .setAuthor({ 
                    name: "Volume Error", // No emoji here
                    iconURL: client.user.displayAvatarURL()
                });
            return message.channel.send({ embeds: [embed] });
        }

        // Store previous volume for comparison
        const previousVolume = player.volume;

        // Show current volume if no args
        if (!args.length) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`${$.volume} **${currentVolume}:** \`${previousVolume}%\``)
                .setAuthor({ 
                    name: "Volume Information", // No emoji here
                    iconURL: client.user.displayAvatarURL()
                });
            return message.channel.send({ embeds: [embed] });
        }

        const newVolume = Number(args[0]);
        
        // Validate volume
        if (isNaN(newVolume) || newVolume < 0 || newVolume > 200) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`${$.error} **${volumeUsage}**`)
                .setFooter({
                    text: `Current volume: ${previousVolume}%`,
                    iconURL: message.author.displayAvatarURL()
                });
            return message.channel.send({ embeds: [embed] });
        }

        // Set volume
        player.setVolume(newVolume);

        // Determine volume change direction
        const volumeIncreased = newVolume > previousVolume;
        const volumeDecreased = newVolume < previousVolume;

        // Create embed
        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setDescription(
                volumeIncreased ? `${$.volume_up} **${volumeSet}:** \`${newVolume}%\`` :
                volumeDecreased ? `${$.volume_down} **${volumeSet}:** \`${newVolume}%\`` :
                `${$.volume} **${volumeSet}:** \`${newVolume}%\``
            )
            .setAuthor({ 
                name: volumeIncreased ? "Volume Increased" : 
                      volumeDecreased ? "Volume Decreased" : "Volume Set",
                iconURL: client.user.displayAvatarURL()
            })
            .setFooter({
                text: `Requested by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL()
            });

        return message.channel.send({ embeds: [embed] });
    }
};