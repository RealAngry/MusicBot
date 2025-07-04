const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { convertTime } = require('../../utils/convert.js');
const $ = require('../../emojis.js');

module.exports = async (client, player, track, payload) => {
    // Disable autoplay if enabled
    player.set('autoplay', false);

    // Clear previous now-playing message buttons if exists
    const previousNowPlaying = player.get('nowPlayingMessage');
    if (previousNowPlaying) {
        try {
            const previousChannel = client.channels.cache.get(player.textChannel);
            if (previousChannel) {
                await previousNowPlaying.edit({ components: [] }).catch(() => {});
            }
        } catch (error) {
            console.error('Failed to clear previous now-playing message:', error);
        }
    }

    // If there's no new track (queue ended), just clear the previous message and return
    if (!track) {
        return;
    }

    // Load translations
    const [channelText, requesterText, durationText, nowPlayingText, queueShuffled, notEnoughTracks] = await Promise.all([
        client.translate(player.guild, 'Artist'),
        client.translate(player.guild, 'Requested by'),
        client.translate(player.guild, 'Duration'),
        client.translate(player.guild, 'Now Playing'),
        client.translate(player.guild, 'Queue has been shuffled!'),
        client.translate(player.guild, 'Not enough tracks in queue to shuffle!')
    ]);
    
    // Set up requester information
    const requester = track?.requester ? `<@${track.requester.id}>` : `${$.repeat} Autoplay`;
    const requesterAvatar = track?.requester?.avatarURL({ dynamic: true }) || client.user.displayAvatarURL();
    
    // Create embed
    const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTimestamp()
        .addFields([
            { name: `${$.song} ${channelText}`, value: `\`${track.author}\``, inline: true },
            { name: `${$.info} ${requesterText}`, value: requester, inline: true },
            { name: `${$.time} ${durationText}`, value: `\`${convertTime(track.duration)}\``, inline: true },
        ])
        .setAuthor({ name: `${nowPlayingText}`, iconURL: requesterAvatar })
        .setThumbnail(track.displayThumbnail('hqdefault'))
        .setTitle(`${track.title}`)
        .setURL(track.uri);

    // Create action rows with buttons
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('pause')
            .setEmoji($.pause)
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('stop')
            .setEmoji($.stop)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('resume')
            .setEmoji($.play)
            .setStyle(ButtonStyle.Success)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('skip')
            .setEmoji($.skipp)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('shuffle')
            .setEmoji($.shuffle)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('loop')
            .setEmoji($.repeat)
            .setStyle(ButtonStyle.Primary)
    );

    // Send to text channel
    const channel = client.channels.cache.get(player.textChannel);
    if (!channel) return;

    try {
        const message = await channel.send({
            embeds: [embed],
            components: [row1, row2]
        });

        // Store message reference
        player.set('nowPlayingMessage', message);

        // Button interaction collector
        const filter = (interaction) => ['pause', 'resume', 'stop', 'skip', 'loop', 'shuffle'].includes(interaction.customId);
        const collector = message.createMessageComponentCollector({ 
            filter,
            time: track.duration + 5000 // 5 seconds buffer after track ends
        });

        collector.on('collect', async (interaction) => {
            // Verify user is in voice channel
            if (!interaction.member.voice.channel || interaction.member.voice.channel.id !== player.voiceChannel) {
                return interaction.reply({
                    content: 'You must be in my voice channel to control music!',
                    ephemeral: true
                });
            }

            // Handle button interactions
            switch (interaction.customId) {
                case 'pause':
                    if (!player.paused) {
                        player.pause(true);
                        await interaction.reply({
                            content: `${$.pause} Music paused.`,
                            ephemeral: true
                        });
                    } else {
                        await interaction.reply({
                            content: `${$.error} Music is already paused.`,
                            ephemeral: true
                        });
                    }
                    break;

                case 'resume':
                    if (player.paused) {
                        player.pause(false);
                        await interaction.reply({
                            content: `${$.play} Music resumed.`,
                            ephemeral: true
                        });
                    } else {
                        await interaction.reply({
                            content: `${$.error} Music is already playing.`,
                            ephemeral: true
                        });
                    }
                    break;

                case 'stop':
                    player.destroy();
                    await interaction.reply({
                        content: `${$.stop} Music stopped.`,
                        ephemeral: true
                    });
                    await message.edit({ components: [] });
                    collector.stop();
                    break;

                case 'skip':
                    if (player.queue.size > 0 || player.trackRepeat || player.queueRepeat) {
                        player.stop();
                        await interaction.reply({
                            content: `${$.skipp} Skipped to the next track.`,
                            ephemeral: true
                        });
                    } else {
                        await interaction.reply({
                            content: `${$.error} No more tracks to skip.`,
                            ephemeral: true
                        });
                    }
                    break;

                case 'shuffle':
                    if (player.queue.size > 1) {
                        player.queue.shuffle();
                        await interaction.reply({
                            content: `${$.shuffle} **${queueShuffled}**`,
                            ephemeral: true
                        });
                    } else {
                        await interaction.reply({
                            content: `${$.error} **${notEnoughTracks}**`,
                            ephemeral: true
                        });
                    }
                    break;

                case 'loop':
                    const [queueLoopEnabled, queueLoopDisabled, trackLoopEnabled, trackLoopDisabled] = await Promise.all([
                        client.translate(interaction.guild.id, 'Queue loop enabled'),
                        client.translate(interaction.guild.id, 'Queue loop disabled'),
                        client.translate(interaction.guild.id, 'Track loop enabled'),
                        client.translate(interaction.guild.id, 'Track loop disabled')
                    ]);

                    if (!player.trackRepeat && !player.queueRepeat) {
                        player.setTrackRepeat(true);
                        await interaction.reply({
                            content: `${$.repeat} **${trackLoopEnabled}**`,
                            ephemeral: true
                        });
                    } else if (player.trackRepeat && !player.queueRepeat) {
                        player.setTrackRepeat(false);
                        player.setQueueRepeat(true);
                        await interaction.reply({
                            content: `${$.repeat} **${queueLoopEnabled}**`,
                            ephemeral: true
                        });
                    } else {
                        player.setTrackRepeat(false);
                        player.setQueueRepeat(false);
                        await interaction.reply({
                            content: `${$.repeat} **${queueLoopDisabled}**`,
                            ephemeral: true
                        });
                    }
                    break;
            }
        });

        collector.on('end', async () => {
            try {
                await message.edit({ components: [] });
            } catch (error) {
                console.error('Failed to remove buttons:', error);
            }
        });

    } catch (error) {
        console.error('Failed to send now playing embed:', error);
    }
};