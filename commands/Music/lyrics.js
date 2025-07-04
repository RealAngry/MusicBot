const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const $ = require('../../emojis.js');

module.exports = {
    name: "lyrics",
    aliases: ["ly", "lyric"],
    category: "Music",
    description: "Get lyrics for the current song or search by title",
    args: false,
    usage: "[song title]",
    execute: async (message, args, client, prefix) => {
        try {
            // Get search query
            let query;
            const player = message.client.manager.get(message.guild.id);
            
            if (!args.length && player?.queue?.current) {
                query = player.queue.current.title.replace(/\(.*?\)|\[.*?\]/g, '').trim();
            } else if (args.length) {
                query = args.join(' ');
            } else {
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#FF0000")
                            .setDescription(`${$.error} Please provide a song name or play a song first!`)
                    ]
                });
            }

            // Show searching message
            const searchingMsg = await message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#FF0000")
                        .setDescription(`${$.music} Searching lyrics for **${query}**...`)
                ]
            });

            // Fetch lyrics
            const { data } = await axios.get(`https://some-random-api.com/others/lyrics?title=${encodeURIComponent(query)}`);
            
            if (!data || !data.lyrics) {
                return searchingMsg.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#FF0000")
                            .setDescription(`${$.error} Couldn't find lyrics for **${query}**`)
                    ]
                });
            }

            // Format lyrics
            let lyrics = data.lyrics;
            if (lyrics.length > 4096) {
                lyrics = lyrics.substring(0, 4093) + '...';
            }

            // Create embed (without any clickable links)
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle(`${data.title} - ${data.author}`)  // Plain text title
                .setDescription(lyrics)
                .setThumbnail(data.thumbnail.genius)  // Genius thumbnail only
                .setFooter({ 
                    text: `Lyrics May Not 100% Accurate`
                });

            return searchingMsg.edit({ embeds: [embed] });

        } catch (error) {
            console.error('Lyrics error:', error);
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#FF0000")
                        .setDescription(`${$.error} Failed to fetch lyrics. Please try again later.`)
                ]
            });
        }
    }
};