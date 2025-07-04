const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require("discord.js");
const client = global.client;
const $ = require('../../emojis.js');

// Command lists with custom emojis
const COMMAND_LISTS = {
    music: [
        `${$.play} ${client.prefix}play - Play music`,
        `${$.skipp} ${client.prefix}skip - Skip track`,
        `${$.stop} ${client.prefix}stop - Stop player`,
        `${$.queue} ${client.prefix}queue - Show queue`,
        `${$.music} ${client.prefix}np - Now playing`,
        `${$.repeat} ${client.prefix}loop - Toggle loop`,
        `${$.music} ${client.prefix}247 - When Enabled Bot Will Be In a Voice Channel 24/7`,
        `${$.success} ${client.prefix}join - Join voice`,
        `${$.error} ${client.prefix}leave - Leave voice`,
        `${$.dustbin} ${client.prefix}clear - Clear queue`,
        `${$.pause} ${client.prefix}pause - Pause player`,
        `${$.play} ${client.prefix}resume - Resume player`,
        `${$.shuffle} ${client.prefix}shuffle - Shuffle queue`,
        `${$.info} ${client.prefix}lyrics - Get lyrics`,
        `${$.skip} ${client.prefix}skipto - Skip to track`,
        `${$.volume} ${client.prefix}volume - Change volume`
    ],
    other: [
        `${$.info} ${client.prefix}invite - Bot invite`,
        `${$.info} ${client.prefix}ping - Check latency`,
        `${$.info} ${client.prefix}language - Change The Bot Language`,
        `${$.info} ${client.prefix}help - This menu`
    ]
};

module.exports = {
    name: "help",
    category: "Information",
    aliases: ["h"],
    description: "Show command list",
    execute: async (message) => {
        try {
            await message.channel.sendTyping();
            
            const [musicTitle, otherTitle, menuTitle, supportText] = await Promise.all([
                client.translate(message.guild.id, "Music Commands"),
                client.translate(message.guild.id, "Other Commands"),
                client.translate(message.guild.id, "Select Category"),
                client.translate(message.guild.id, "Bot supports multiple languages")
            ]);

            const menu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('help')
                    .setPlaceholder(menuTitle)
                    .setOptions([
                        { value: "music", label: musicTitle, emoji: `${$.music}` },
                        { value: "other", label: otherTitle, emoji: `${$.info}` }
                    ])
            );

            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setAuthor({
                    name: `${client.user.username} Help Menu`,
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`${$.info} ${supportText}`)
                .setFooter({
                    text: `Requested by ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL()
                });

            await message.reply({
                embeds: [embed],
                components: [menu]
            });
        } catch (e) {
            console.error("Help Command Error:", e);
            message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor("#FF0000")
                    .setDescription(`${$.error} Failed to load help menu`)]
            });
        }
    }
};

// Menu Interaction Handler
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== 'help') return;
    
    await interaction.deferReply({ ephemeral: true });

    try {
        const value = interaction.values[0];
        const commands = COMMAND_LISTS[value];
        const title = value === "music" 
            ? `Music Commands` 
            : `Other Commands`;
        
        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setAuthor({
                name: title,
                iconURL: client.user.displayAvatarURL()
            })
            .setDescription(commands.join('\n')) // Removed codeBlock wrapper
            .setFooter({
                text: `Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.editReply({ embeds: [embed] });
    } catch (e) {
        console.error("Menu Error:", e);
        await interaction.editReply({
            embeds: [new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`${$.error} Failed to load commands`)]
        });
    }
});