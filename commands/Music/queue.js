const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const pms = require("pretty-ms");
const load = require("lodash");
const $ = require('../../emojis.js');

module.exports = {
    name: "queue",
    category: "Music",
    aliases: ["q"],
    description: "Show the music queue and now playing.",
    args: false,
    owner: false,
    player: true,
    inVoiceChannel: false,
    sameVoiceChannel: false,
    execute: async (message, args, client, prefix) => {
        const player = client.manager.get(message.guild.id);
        
        // Translations
        const noSongPlaying = await client.translate(message.guild.id, "There is no song currently playing.");
        const nowPlaying = await client.translate(message.guild.id, "Now Playing");
        const queueSongs = await client.translate(message.guild.id, "Queue Songs");
        const pageText = await client.translate(message.guild.id, "Page");
        const queueText = await client.translate(message.guild.id, "Queue");
        const buttonError = await client.translate(message.guild.id, `Only ${message.author.username} can use these buttons.`);

        // Check if player exists
        if (!player || !player.queue) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`${$.error} **${noSongPlaying}**`);
            return message.channel.send({ embeds: [embed] });
        }

        // Format queued songs
        const queuedSongs = player.queue.map((t, i) => 
            `\`${++i}\` • [${t.title}](${t.uri}) • \`[ ${pms(t.duration)} ]\` • ${t.requester}`
        );

        // Handle empty queue
        if (player.queue.size === 0) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setThumbnail(player.queue.current.displayThumbnail("mqdefault"))
                .setDescription(
                    `**${nowPlaying}**\n` +
                    `[${player.queue.current.title}](${player.queue.current.uri})\n` +
                    `\`[${pms(player.position)} / ${pms(player.queue.current.duration)}]\` • ${player.queue.current.requester}`
                )
                .setFooter({ text: `${message.guild.name} ${queueText}`, iconURL: message.guild.iconURL() });
            
            return message.channel.send({ embeds: [embed] });
        }

        // Paginate queue
        const mapping = load.chunk(queuedSongs, 5);
        const pages = mapping.map((s) => s.join("\n"));
        let page = 0;

        // Create base embed
        const createEmbed = (page) => {
            return new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(
                    `**${nowPlaying}**\n` +
                    `[${player.queue.current.title}](${player.queue.current.uri})\n` +
                    `\`[${pms(player.position)} / ${pms(player.queue.current.duration)}]\` • ${player.queue.current.requester}\n\n` +
                    `**${queueSongs}**\n${pages[page]}`
                )
                .setFooter({ 
                    text: `${pageText} ${page + 1}/${pages.length} • ${message.guild.name} ${queueText}`,
                    iconURL: message.author.displayAvatarURL() 
                })
                .setThumbnail(player.queue.current.displayThumbnail("mqdefault"));
        };

        // Create buttons
        const createButtons = () => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("queue_prev")
                    .setEmoji(`${$.previous}`)
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("queue_next")
                    .setEmoji(`${$.skip}`)
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("queue_delete")
                    .setEmoji(`${$.dustbin}`)
                    .setStyle(ButtonStyle.Danger)
            );
        };

        // Send initial message
        const msg = await message.channel.send({
            embeds: [createEmbed(page)],
            components: pages.length > 1 ? [createButtons()] : []
        });

        // Add collector if pagination needed
        if (pages.length > 1) {
            const collector = msg.createMessageComponentCollector({
                filter: async (i) => {
                    if (i.user.id === message.author.id) return true;
                    await i.reply({
                        ephemeral: true,
                        content: `${$.error} **${buttonError}**`
                    });
                    return false;
                },
                time: 300000 // 5 minutes
            });

            collector.on("collect", async (i) => {
                await i.deferUpdate();
                
                switch (i.customId) {
                    case "queue_prev":
                        page = page > 0 ? page - 1 : pages.length - 1;
                        break;
                    case "queue_next":
                        page = page < pages.length - 1 ? page + 1 : 0;
                        break;
                    case "queue_delete":
                        collector.stop();
                        return;
                }

                await msg.edit({ embeds: [createEmbed(page)] });
            });

            collector.on("end", () => msg.edit({ components: [] }));
        }
    }
};