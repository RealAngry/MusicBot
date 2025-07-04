const { EmbedBuilder } = require("discord.js");

module.exports = async (client, message) => {
    // Basic checks
    if (!message.guild || message.author.bot) return;

    const prefix = client.prefix;
    
    // Handle bot mention
    const mention = new RegExp(`^<@!?${client.user.id}>( |)$`);
    if (message.content.match(mention)) {
        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setDescription(`**My prefix is \`${prefix}\`**`);
        return message.channel.send({ embeds: [embed] });
    }

    // Check prefix
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(message.content)) return;

    // Parse command
    const [matchedPrefix] = message.content.match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || 
                    client.commands.find(cmd => cmd.aliases?.includes(commandName));
    if (!command) return;

    // Command validations
    try {
        // Check arguments
        const missingArgs = await client.translate(message.guild.id, 
            `Missing arguments. Usage: \`${prefix}${command.name} ${command.usage || ''}\``);
        if (command.args && !args.length) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor("#FF0000")
                    .setDescription(`**${missingArgs}**`)]
            });
        }

        // Check permissions
        const missingPerms = await client.translate(message.guild.id,
            "You don't have permission to use this command!");
        if (command.permission && !message.member.permissions.has(command.permission)) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor("#FF0000")
                    .setDescription(`**${missingPerms}**`)]
            });
        }

        // Player checks
        const player = message.client.manager.get(message.guild.id);
        const noPlayer = await client.translate(message.guild.id,
            "No music is currently playing!");
        if (command.player && !player) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor("#FF0000")
                    .setDescription(`**${noPlayer}**`)]
            });
        }

        // Voice channel checks
        const joinVC = await client.translate(message.guild.id,
            "You need to be in a voice channel!");
        const sameVC = await client.translate(message.guild.id,
            "You need to be in the same voice channel as me!");
        
        if (command.inVoiceChannel && !message.member.voice.channel) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor("#FF0000")
                    .setDescription(`**${joinVC}**`)]
            });
        }

        if (command.sameVoiceChannel && 
            message.member.voice.channel !== message.guild.members.me.voice.channel) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor("#FF0000")
                    .setDescription(`**${sameVC}**`)]
            });
        }

        // Execute command
        await message.react("🟢").catch(() => {});
        await command.execute(message, args, client, prefix);

    } catch (error) {
        console.error("Command Error:", error);
        await message.react("🔴").catch(() => {});
        const cmdError = await client.translate(message.guild.id,
            "An error occurred while executing this command. Please try again later.");
        
        message.channel.send({
            embeds: [new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(`**⚠️ ${cmdError}**`)]
        });
    }
};