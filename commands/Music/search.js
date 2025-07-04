const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { convertTime } = require('../../utils/convert.js');
const $ = require('../../emojis.js');

module.exports = {
    name: "search",
    category: "Music",
    aliases: ["find", "lookup"],
    description: "Searches for a track and lets you pick from results",
    args: true,
    usage: "<track name>",
    owner: false,
    player: false,
    inVoiceChannel: true,
    sameVoiceChannel: false,
    execute: async (message, args, client, prefix) => {
        const { channel } = message.member.voice;
        let player = message.client.manager.get(message.guild.id);
        if (player && channel !== message.guild.members.cache.get(client.user.id).voice?.channel) {
            return message.channel.send({ content: `${$.error} **You must be in the same voice channel as me!**` });
        }

        if (!player) {
            player = message.client.manager.create({
                guild: message.guild.id,
                voiceChannel: channel.id,
                textChannel: message.channel.id,
                volume: 100,
                selfDeafen: true,
            });
        }
        if (player.state !== "CONNECTED") player.connect();

        const search = args.join(' ');
        const searchEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setDescription(`${$.music} **Searching for:** \`${search}\`...`)
            .setFooter({ text: "Please wait while we fetch results." });
        
        const searchMsg = await message.channel.send({ embeds: [searchEmbed] });
        
        let res;
        try {
            res = await player.search(search, message.author);
            if (res.loadType === 'LOAD_FAILED') throw res.exception;
        } catch (err) {
            return searchMsg.edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#FF0000")
                        .setDescription(`${$.error} **Error:** ${err.message}`)
                ]
            });
        }

        if (res.loadType === 'NO_MATCHES') {
            return searchMsg.edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#FF0000")
                        .setDescription(`${$.error} **No results found.**`)
                ]
            });
        }

        const tracks = res.tracks.slice(0, 5);
        const buttons = tracks.map((track, index) => (
            new ButtonBuilder()
                .setCustomId(`select_${index}`)
                .setLabel(`${index + 1}`)
                .setStyle(ButtonStyle.Danger)
        ));

        const row = new ActionRowBuilder().addComponents(buttons);
        
        const resultsEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle(`${$.music} **Search Results**`)
            .setDescription(tracks.map((t, i) => `**${i + 1}.** [${t.title}](${t.uri}) - \`${convertTime(t.duration)}\``).join("\n"))
            .setFooter({ text: "Click a button to select a track." });
        
        await searchMsg.edit({ embeds: [resultsEmbed], components: [row] });
        
        const filter = (interaction) => interaction.user.id === message.author.id;
        const collector = searchMsg.createMessageComponentCollector({ filter, time: 30000 });
        
        let trackSelected = false;
        collector.on('collect', async (interaction) => {
            if (!interaction.isButton()) return;
            trackSelected = true;
            const selectedTrack = tracks[parseInt(interaction.customId.split("_")[1])];
            player.queue.add(selectedTrack);
            
            if (!player.playing && !player.paused && !player.queue.size) player.play();
            
            const trackEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle(`${$.music} **Added to Queue**`)
                .setDescription(`**[${selectedTrack.title}](${selectedTrack.uri})**`)
                .setThumbnail(`https://img.youtube.com/vi/${selectedTrack.identifier}/mqdefault.jpg`)
                .addFields(
                    { name: "Artist", value: selectedTrack.author, inline: true },
                    { name: "Duration", value: `\`${convertTime(selectedTrack.duration)}\``, inline: true },
                    { name: "Requested by", value: `<@${message.author.id}>`, inline: true }
                )
                .setFooter({ text: "Enjoy your music! 🎶" });
            
            await interaction.update({ embeds: [trackEmbed], components: [] });
            collector.stop();
        });
        
        collector.on('end', async () => {
            if (!trackSelected) {
                await searchMsg.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#FF0000")
                            .setDescription(`${$.error} **Search cancelled. No track selected.**`)
                    ],
                    components: []
                });
            }
        });
    }
};
