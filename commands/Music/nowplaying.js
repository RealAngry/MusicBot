const { EmbedBuilder } = require("discord.js");
const { convertTime } = require('../../utils/convert.js');
const { progressbar } = require('../../utils/progressbar.js');
const $ = require('../../emojis.js');

module.exports = {
    name: "nowplaying",
    aliases: ["np", "çalan", "şuan"],
    category: "Music",
    description: "Show currently playing song",
    args: false,
    player: true,
    inVoiceChannel: false,
    sameVoiceChannel: false,
    execute: async (message, args, client, prefix) => {
        const player = message.client.manager.get(message.guild.id);
        
        // Translations
        const noSongPlaying = await client.translate(message.guild.id, "No song is currently playing.");
        const nowPlaying = await client.translate(message.guild.id, "Now Playing");
        const channelText = await client.translate(message.guild.id, "Artist");
        const requesterText = await client.translate(message.guild.id, "Requester");
        const durationText = await client.translate(message.guild.id, "Duration");

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

        const song = player.queue.current;
        
        // Create progress bar
        const progress = progressbar(song.duration, player.position, 15, '▬', '🔴');
        const timeDisplay = `${convertTime(player.position)} / ${convertTime(song.duration)}`;

        // Build embed
        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setAuthor({
                name: `🎶 ${nowPlaying}`,
                iconURL: message.author.displayAvatarURL()
            })
            .setTitle(`**${song.title}**`)
            .setURL(song.uri)
            .setThumbnail(song.displayThumbnail("mqdefault"))
            .addFields([
                { 
                    name: `${$.song} ${channelText}`, 
                    value: `\`${song.author}\``, 
                    inline: true 
                },
                { 
                    name: `${$.info} ${requesterText}`, 
                    value: `<@${song.requester.id}>`, 
                    inline: true 
                },
                { 
                    name: `${$.time} ${durationText}`, 
                    value: `\`[${convertTime(song.duration)}]\``, 
                    inline: true 
                },
                { 
                    name: '\u200b', 
                    value: `${progress}\n\`${timeDisplay}\``, 
                    inline: false 
                }
            ])
            .setFooter({
                text: `${message.guild.name}`,
                iconURL: message.guild.iconURL()
            });

        return message.channel.send({ embeds: [embed] });
    }
};