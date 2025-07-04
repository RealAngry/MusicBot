const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const $ = require('../../emojis.js');

module.exports = {
    name: "invite",
    category: "Information",
    aliases: ["addme"],
    description: "Invite the bot to your server",
    args: false,
    execute: async (message, args, client, prefix) => {
        try {
            // Get translations
            const [inviteText, buttonText] = await Promise.all([
                client.translate(message.guild.id, "Click the button below to invite me to your server!"),
                client.translate(message.guild.id, "Invite")
            ]);

            // Create invite button
            const inviteBtn = new ButtonBuilder()
                .setLabel(buttonText)
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=applications.commands%20bot`);

            // Create embed
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`${$.info} **${inviteText}**`)
                .setFooter({
                    text: `${client.user.username} | Invite`,
                    iconURL: client.user.displayAvatarURL()
                });

            // Create action row
            const row = new ActionRowBuilder()
                .addComponents(inviteBtn);

            // Send message
            await message.channel.send({
                embeds: [embed],
                components: [row]
            });

        } catch (error) {
            console.error("Invite command error:", error);
            const errorMsg = await client.translate(message.guild.id, "Failed to generate invite link");
            await message.channel.send(`${$.error} **${errorMsg}**`);
        }
    }
};