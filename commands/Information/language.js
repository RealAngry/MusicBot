const { EmbedBuilder } = require("discord.js");
const client = global.client;
const db = client.db;
const langs = require("../../lang.json");
const $ = require('../../emojis.js');

module.exports = {
    name: "language",
    category: "Information",
    aliases: ["lng", "lang"],
    description: "Set server language preference",
    args: false,
    execute: async (message, args, client, prefix) => {
        const selection = args[0];
        
        // Translations
        const noLanguageCode = await client.translate(message.guild.id, "You need to enter a language code! Example:");
        const invalidLanguage = await client.translate(message.guild.id, "You need to enter a valid language code! Example:");

        // Check if language code provided
        if (!selection) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`${$.error} **${noLanguageCode}** \`${prefix}language en\``)
                .setAuthor({
                    name: "Language Setup",
                    iconURL: client.user.displayAvatarURL()
                });
            return message.channel.send({ embeds: [embed] });
        }

        // Validate language code
        if (!langs.all.some(lang => selection === lang.code)) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`${$.error} **${invalidLanguage}** \`${prefix}language en\``)
                .setFooter({
                    text: `Available languages: ${langs.all.map(l => l.code).join(', ')}`,
                    iconURL: message.author.displayAvatarURL()
                });
            return message.channel.send({ embeds: [embed] });
        }

        // Set language and get language info
        const foundLang = langs.all.find(lang => lang.code === selection);
        db.set(`language-${message.guild.id}`, selection);

        // Success embed
        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setAuthor({
                name: "🌍 Language Updated", // Normal emoji
                iconURL: client.user.displayAvatarURL()
            })
            .setDescription(`${$.success} **Language settings changed**`)
            .addFields([
                { 
                    name: "Language Code", 
                    value: `\`${foundLang.code}\``, 
                    inline: true 
                },
                { 
                    name: "Native Name", 
                    value: `\`${foundLang.nativeName}\``, 
                    inline: true 
                },
                { 
                    name: "English Name", 
                    value: `\`${foundLang.name}\``, 
                    inline: true 
                }
            ])
            .setFooter({
                text: `Changed by ${message.author.username}`,
                iconURL: message.author.displayAvatarURL()
            });

        return message.channel.send({ embeds: [embed] });
    }
};