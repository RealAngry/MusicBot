const { EmbedBuilder } = require("discord.js");
const { convertTime } = require('../../utils/convert.js');
const $ = require('../../emojis.js');

module.exports = {
    name: "play",
    category: "Music",
    aliases: ["p", "play", "start"],
    description: "Plays audio from YouTube, SoundCloud, or Spotify",
    args: true,
    usage: "<YouTube URL | Video Name | Spotify URL>",
    owner: false,
    player: false,
    inVoiceChannel: true,
    sameVoiceChannel: false,
    execute: async (message, args, client, prefix) => {

        const { channel } = message.member.voice;
        let player = message.client.manager.get(message.guild.id);

        // Check if user is in the same voice channel as the bot
        if (player && message.member?.voice?.channel !== message.guild.members.cache.get(client.user.id).voice?.channel) {
            const warning = await client.translate(message.guild.id, "You must be in the same voice channel as me to listen to music!");
            return message.channel.send({ content: `${$.error} **${warning}**` });
        } else if (!player) {
            player = message.client.manager.create({
                guild: message.guild.id,
                voiceChannel: channel.id,
                textChannel: message.channel.id,
                volume: 100,
                selfDeafen: true,
            });
        }

        if (player.state !== "CONNECTED") player.connect();
        player.set("autoplay", false);

        const search = args.join(' ');
        let res;
        const searchingMessage = await client.translate(message.guild.id, "Searching");
        
        // Display appropriate search message based on platform
        if (message.content.includes("youtu")) {
            message.channel.send({ content: `> ${$.music} \`🔴 YouTube \` **${searchingMessage}** :mag_right: **\`${args.join(" ")}\`**` });
        } else if (message.content.includes("spotify")) {
            message.channel.send({ content: `> ${$.music} \`🟢 Spotify \` **${searchingMessage}** :mag_right: **\`${args.join(" ")}\`**` });
        } else if (message.content.includes("soundcloud")) {
            message.channel.send({ content: `> ${$.music} \`🟠 SoundCloud \` **${searchingMessage}** :mag_right: **\`${args.join(" ")}\`**` });
        } else {
            message.channel.send({ content: `> ${$.music} \`🔴 YouTube \` **${searchingMessage}** :mag_right: **\`${args.join(" ")}\`**` });
        }

        try {
            res = await player.search(search, message.author);
            if (res.loadType === 'LOAD_FAILED') {
                if (!player.queue.current) player.destroy();
                throw res.exception;
            }
        } catch (err) {
            const errorMessage = await client.translate(message.guild.id, "I encountered an error while searching for the track:");
            return message.channel.send({ content: `> ${$.error} **${errorMessage} ${err.message}**` });
        }

        switch (res.loadType) {
            case 'NO_MATCHES':
                if (!player.queue.current) player.destroy();
                const noResults = await client.translate(message.guild.id, "No results found from the search..");
                return message.channel.send({ content: `> ${$.error} **${noResults}**` });
            
            case 'TRACK_LOADED':
                const track = res.tracks[0];
                player.set("autoplay", false);
                player.queue.add(track);
                
                if (!player.playing && !player.paused && !player.queue.size) {
                    return player.play();
                } else {
                    const channelText = await client.translate(message.guild.id, "Channel");
                    const requesterText = await client.translate(message.guild.id, "Requester");
                    const durationText = await client.translate(message.guild.id, "Duration");
                    const addedToQueue = await client.translate(message.guild.id, "Track added to queue");
                    
                    const embed = new EmbedBuilder()
                        .setColor("#FF0000")
                        .setTimestamp()
                        .addFields([
                            { name: `${$.song} ${channelText}`, value: `> ${track.author}`, inline: true },
                            { name: `${$.info} ${requesterText}`, value: `> <@${track.requester.id}>`, inline: true },
                            { name: `${$.time} ${durationText}`, value: `> **\`[${convertTime(track.duration)}]\`**`, inline: true }
                        ])
                        .setAuthor({ 
                            name: `${addedToQueue}`,
                            iconURL: message.author.avatarURL({ dynamic: true }) 
                        })
                        .setThumbnail(`https://img.youtube.com/vi/${track.identifier}/mqdefault.jpg`)
                        .setTitle(`${$.music} **${track.title}**`)
                        .setFooter({ text: `Enjoy your music!`, iconURL: client.user.displayAvatarURL() });
                    
                    return message.channel.send({ embeds: [embed] });
                }
            
            case 'PLAYLIST_LOADED':
                const playlistAdded = await client.translate(message.guild.id, "Playlist added to queue");
                const trackCount = await client.translate(message.guild.id, "tracks");
                
                player.set("autoplay", false);
                player.queue.add(res.tracks);
                
                if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) {
                    player.play();
                }
                
                const playlistEmbed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setTimestamp()
                    .setThumbnail(`https://cdn.discordapp.com/emojis/900883866527596614.png?size=128&quality=lossless`)
                    .setAuthor({ 
                        name: `${playlistAdded}`,
                        iconURL: message.author.avatarURL({ dynamic: true }) 
                    })
                    .setDescription(`${$.song} **${res.tracks.length} ${trackCount}** added from playlist\n${$.info} **Name:** \`${res.playlist.name}\`\n${$.time} **Duration:** \`[${convertTime(res.playlist.duration)}]\``)
                    .setFooter({ text: `Queue boosted with ${res.tracks.length} tracks!`, iconURL: client.user.displayAvatarURL() });
                
                return message.channel.send({ embeds: [playlistEmbed] });
            
            case 'SEARCH_RESULT':
                const selectedTrack = res.tracks[0];
                player.set("autoplay", false);
                player.queue.add(selectedTrack);
                
                if (!player.playing && !player.paused && !player.queue.size) {
                    return player.play();
                } else {
                    const channelText = await client.translate(message.guild.id, "Channel");
                    const requesterText = await client.translate(message.guild.id, "Requester");
                    const durationText = await client.translate(message.guild.id, "Duration");
                    const addedToQueue = await client.translate(message.guild.id, "Track added to queue");
                    
                    const searchEmbed = new EmbedBuilder()
                        .setColor("#FF0000")
                        .setTimestamp()
                        .addFields([
                            { name: `${$.song} ${channelText}`, value: `> ${selectedTrack.author}`, inline: true },
                            { name: `${$.info} ${requesterText}`, value: `> <@${selectedTrack.requester.id}>`, inline: true },
                            { name: `${$.time} ${durationText}`, value: `> **\`[${convertTime(selectedTrack.duration)}]\`**`, inline: true }
                        ])
                        .setAuthor({ 
                            name: `Search Result Added to Queue`,
                            iconURL: message.author.avatarURL({ dynamic: true }) 
                        })
                        .setThumbnail(`https://img.youtube.com/vi/${selectedTrack.identifier}/mqdefault.jpg`)
                        .setTitle(`${$.music} **${selectedTrack.title}**`)
                        .setFooter({ text: `Requested by ${message.author.username} • Enjoy! 🎶`, iconURL: message.author.displayAvatarURL() });
                    
                    return message.channel.send({ embeds: [searchEmbed] });
                }
        }
    }
}