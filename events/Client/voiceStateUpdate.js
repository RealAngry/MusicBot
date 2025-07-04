const delay = require("delay");
const { EmbedBuilder } = require("discord.js");
const $ = require('../../emojis.js');

module.exports = async (client, oldState, newState) => {
    const player = client.manager?.players.get(newState.guild.id);
    if (!player) return;

    // Bot was disconnected from voice channel
    if (!newState.guild.members.me.voice.channelId) {
        player.destroy();
        return;
    }

    // Ignore if the state change is from the bot itself or bot wasn't in a voice channel before
    if (oldState.id === client.user.id || !oldState.guild.members.me.voice.channelId) return;

    // Check if someone left the bot's voice channel
    if (oldState.guild.members.me.voice.channelId === oldState.channelId) {
        const voiceChannel = oldState.guild.members.me.voice.channel;
        
        // Check if voice channel is empty (only bots remaining)
        if (voiceChannel && voiceChannel.members.filter(m => !m.user.bot).size === 0) {
            // Check if 24/7 mode is enabled
            const is247Enabled = player.get("247");
            if (is247Enabled) return; // Don't leave if 24/7 mode is on
            
            await delay(45000); // Wait 45 seconds
            
            const remainingMembers = voiceChannel.members.filter(m => !m.user.bot).size;
            if (!remainingMembers || remainingMembers === 0) {
                try {
                    // Destroy player or leave channel
                    const currentPlayer = client.manager?.players.get(newState.guild.id);
                    currentPlayer ? currentPlayer.destroy() : voiceChannel.leave();

                    // Send leave message if text channel exists
                    if (player.textChannel) {
                        const channel = client.channels.cache.get(player.textChannel);
                        if (channel) {
                            const leaveMessage = await client.translate(
                                newState.guild.id,
                                `I left <#${voiceChannel.id}> because the channel was empty for too long.`
                            );

                            const embed = new EmbedBuilder()
                                .setColor("#FF0000")
                                .setDescription(`**${leaveMessage}**`);

                            await channel.send({ embeds: [embed] });
                        }
                    }
                } catch (error) {
                    console.error("Voice State Error:", error.message);
                }
            }
        }
    }
};