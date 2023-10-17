const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType, inlineCode, channelMention, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

const data = new SlashCommandBuilder()
	.setName('config')
	.setDescription('Configure the bot')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.addSubcommand(subcommand =>
		subcommand
			.setName('view')
			.setDescription('View the current configuration')
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('edit')
			.setDescription('Edit a configuration value')
			.addChannelOption(option =>
				option
					.setName('logging_channel')
					.setDescription('The channel to log to')
					.addChannelTypes(ChannelType.GuildText)
			)
			.addBooleanOption(option =>
				option
					.setName('log_member_joins')
					.setDescription('Whether to log when a member joins')
			)
			.addBooleanOption(option =>
				option
					.setName('log_member_leaves')
					.setDescription('Whether to log when a member leaves')
			)
			.addBooleanOption(option =>
				option
					.setName('log_message_deletion')
					.setDescription('Whether to log when a message gets deleted')
			)
			.addBooleanOption(option =>
				option
					.setName('log_message_edits')
					.setDescription('Whether to log when a message is edited')
			)
			.addBooleanOption(option =>
				option
					.setName('log_member_banned')
					.setDescription('Whether to log when a member gets banned')
			)
			.addBooleanOption(option =>
				option
					.setName('log_member_unbanned')
					.setDescription('Whether to log when a member gets unbanned')
			)
			.addBooleanOption(option =>
				option
					.setName('log_member_kicked')
					.setDescription('Whether to log when a member gets kicked')
			)
			.addBooleanOption(option =>
				option
					.setName('log_invite_added')
					.setDescription('Whether to log when an invite is created')
			)
			.addBooleanOption(option =>
				option
					.setName('log_invite_removed')
					.setDescription('Whether to log when an invite is deleted')
			)
			.addBooleanOption(option =>
				option
					.setName('sticky_roles')
					.setDescription('Make certain roles *stick* to a member when leaving and rejoining')
			)
			.addBooleanOption(option =>
				option
					.setName('auto_roles')
					.setDescription('Automatically assign roles to new members')
			)
			.addBooleanOption(option =>
				option
					.setName('owner_only')
					.setDescription('Whether the owner is the only member allowed to edit the config')
			)
	)
	
	.addSubcommand(subcommand =>
		subcommand
			.setName('counting')
			.setDescription('Edit the counting configuration')
			.addChannelOption(option =>
				option
					.setName('channel')
					.setDescription('The channel you want to count in')
					.addChannelTypes(ChannelType.GuildText)
					.setRequired(true)
			)
			.addStringOption(option =>
				option
					.setName('topic')
					.setDescription('An dynamic channel topic. Use {highscore} as a placeholder')
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('reset')
			.setDescription('Reset the configuration to the default values')
			.addStringOption(option =>
				option
					.setName('option')
					.setDescription('The option to reset')
					.setRequired(true)
					.addChoices(
						{ name: 'everything', value: 'everything' },
						{ name: 'logging', value: 'logging' },
						{ name: 'sticky_roles', value: 'sticky_roles' },
						{ name: 'auto_roles', value: 'auto_roles' },
						{ name: 'owner_only', value: 'owner_only' },
						{ name: 'counting', value: 'counting' },
					)
			)
	);

module.exports = {
	data: data,
	customNamespace: "config",
	onCommand: async (bot, interaction) => {
		const { options } = interaction;
		
		var guildid = interaction.guild.id;
		var userid = interaction.user.id;
		var isowner = interaction.guild.ownerId === userid;

		if (bot.ConfigManager.getConfigValue(guildid, "owner_only") && !isowner) {
			var embed = new EmbedBuilder()
				.setTitle("Configuration Locked")
				.setDescription("The configuration can only be edited by the owner.")
				.setColor(0x202225);

			interaction.reply({
				embeds: [ embed ],
				ephemeral: true
			});
			return;
		}

		if (options.getSubcommand() === "view") {
			let logging_channel = bot.ConfigManager.getConfigValue(guildid, "logging_channel");
			let log_member_joins = bot.ConfigManager.getConfigValue(guildid, "log_member_joins");
			let log_member_leaves = bot.ConfigManager.getConfigValue(guildid, "log_member_leaves");
			let log_message_deletion = bot.ConfigManager.getConfigValue(guildid, "log_message_deletion");
			let log_message_edits = bot.ConfigManager.getConfigValue(guildid, "log_message_edits");
			let log_member_banned = bot.ConfigManager.getConfigValue(guildid, "log_member_banned");
			let log_member_unbanned = bot.ConfigManager.getConfigValue(guildid, "log_member_unbanned");
			let log_member_kicked = bot.ConfigManager.getConfigValue(guildid, "log_member_kicked");
			let log_invite_added = bot.ConfigManager.getConfigValue(guildid, "log_invite_added");
			let log_invite_removed = bot.ConfigManager.getConfigValue(guildid, "log_invite_removed");
			let sticky_roles = bot.ConfigManager.getConfigValue(guildid, "use_sticky_roles");
			let auto_roles = bot.ConfigManager.getConfigValue(guildid, "use_auto_roles");
			let owner_only = bot.ConfigManager.getConfigValue(guildid, "owner_only");

			let embed = new EmbedBuilder()
				.setTitle("Current Configuration")
				.addFields(
					{ name: 'logging_channel', value: logging_channel == null ? "Not Configured" : channelMention(logging_channel), inline: true },
					{ name: 'log_member_joins', value: log_member_joins ? "True" : "False", inline: true },
					{ name: 'log_member_leaves', value: log_member_leaves ? "True" : "False", inline: true },
					{ name: 'log_message_deletion', value: log_message_deletion ? "True" : "False", inline: true },
					{ name: 'log_message_edits', value: log_message_edits ? "True" : "False", inline: true },
					{ name: 'log_member_banned', value: log_member_banned ? "True" : "False", inline: true },
					{ name: 'log_member_unbanned', value: log_member_unbanned ? "True" : "False", inline: true },
					{ name: 'log_member_kicked', value: log_member_kicked ? "True" : "False", inline: true },
					{ name: 'log_invite_added', value: log_invite_added ? "True" : "False", inline: true },
					{ name: 'log_invite_removed', value: log_invite_removed ? "True" : "False", inline: true },
					{ name: 'sticky_roles', value: sticky_roles ? "True" : "False", inline: true },
					{ name: 'auto_roles', value: auto_roles ? "True" : "False", inline: true },
					{ name: 'owner_only', value: owner_only ? "True" : "False", inline: true },
				)
				.setColor(0x202225);

			interaction.reply({
				embeds: [ embed ],
				ephemeral: true
			});
		} else if (options.getSubcommand() === "edit") {
			let logging_channel = options.getChannel("logging_channel");
			let log_member_joins = options.getBoolean("log_member_joins");
			let log_member_leaves = options.getBoolean("log_member_leaves");
			let log_message_deletion = options.getBoolean("log_message_deletion");
			let log_message_edits = options.getBoolean("log_message_edits");
			let log_member_banned = options.getBoolean("log_member_banned");
			let log_member_unbanned = options.getBoolean("log_member_unbanned");
			let log_member_kicked = options.getBoolean("log_member_kicked");
			let log_invite_added = options.getBoolean("log_invite_added");
			let log_invite_removed = options.getBoolean("log_invite_removed");
			let sticky_roles = options.getBoolean("sticky_roles");
			let auto_roles = options.getBoolean("auto_roles");
			let owner_only = options.getBoolean("owner_only");

			if (logging_channel !== null) {
				bot.ConfigManager.setConfigValue(guildid, "logging_channel", logging_channel.id);
			}
			if (log_member_joins !== null) {
				bot.ConfigManager.setConfigValue(guildid, "log_member_joins", log_member_joins);
			}
			if (log_member_leaves !== null) {
				bot.ConfigManager.setConfigValue(guildid, "log_member_leaves", log_member_leaves);
			}
			if (log_message_deletion !== null) {
				bot.ConfigManager.setConfigValue(guildid, "log_message_deletion", log_message_deletion);
			}
			if (log_message_edits !== null) {
				bot.ConfigManager.setConfigValue(guildid, "log_message_edits", log_message_edits);
			}
			if (log_member_banned !== null) {
				bot.ConfigManager.setConfigValue(guildid, "log_member_banned", log_member_banned);
			}
			if (log_member_unbanned !== null) {
				bot.ConfigManager.setConfigValue(guildid, "log_member_unbanned", log_member_unbanned);
			}
			if (log_member_kicked !== null) {
				bot.ConfigManager.setConfigValue(guildid, "log_member_kicked", log_member_kicked);
			}
			if (log_invite_added !== null) {
				bot.ConfigManager.setConfigValue(guildid, "log_invite_added", log_invite_added);
			}
			if (log_invite_removed !== null) {
				bot.ConfigManager.setConfigValue(guildid, "log_invite_removed", log_invite_removed);
			}
			if (sticky_roles !== null) {
				bot.ConfigManager.setConfigValue(guildid, "use_sticky_roles", sticky_roles);
			}
			if (auto_roles !== null) {
				bot.ConfigManager.setConfigValue(guildid, "use_auto_roles", auto_roles);
			}
			if (owner_only !== null) {
				bot.ConfigManager.setConfigValue(guildid, "owner_only", owner_only);
			}

			var embed = new EmbedBuilder()
				.setTitle("Configuration Edited")
				.setDescription("The configuration has been updated for this server.")
				.setColor(0x202225);

			interaction.reply({
				embeds: [ embed ],
				ephemeral: true
			});
		} else if (options.getSubcommand() === "reset") {
			let option = options.getString("option");

			let embed = new EmbedBuilder()
				.setTitle("Configuration Reset")
				.setColor(0x202225);

			if (option === "everything") {
				bot.ConfigManager.resetConfig(guildid);
				
				embed.setDescription("The configuration has been reset to its default values.");
			} else if (option === "logging") {
				bot.ConfigManager.deleteConfigValue(guildid, "logging_channel");
				bot.ConfigManager.deleteConfigValue(guildid, "log_member_joins");
				bot.ConfigManager.deleteConfigValue(guildid, "log_member_leaves");
				bot.ConfigManager.deleteConfigValue(guildid, "log_message_deletion");
				bot.ConfigManager.deleteConfigValue(guildid, "log_message_edits");
				bot.ConfigManager.deleteConfigValue(guildid, "log_member_banned");
				bot.ConfigManager.deleteConfigValue(guildid, "log_member_unbanned");
				bot.ConfigManager.deleteConfigValue(guildid, "log_member_kicked");
				bot.ConfigManager.deleteConfigValue(guildid, "log_invite_added");
				bot.ConfigManager.deleteConfigValue(guildid, "log_invite_removed");
				
				embed.setDescription(`The ${inlineCode("logging")} options in the configuration has been reset to its default values.`);
			} else if (option === "sticky_roles") {
				bot.ConfigManager.deleteConfigValue(guildid, "use_sticky_roles");
				bot.ConfigManager.deleteConfigValue(guildid, "sticky_roles");
				
				embed.setDescription(`The ${inlineCode("sticky_roles")} option in the configuration has been reset to its default value.`);
			} else if (option === "auto_roles") {
				bot.ConfigManager.deleteConfigValue(guildid, "use_auto_roles");
				bot.ConfigManager.deleteConfigValue(guildid, "auto_roles");
				
				embed.setDescription(`The ${inlineCode("auto_roles")} option in the configuration has been reset to its default value.`);
			} else if (option === "owner_only") {
				bot.ConfigManager.deleteConfigValue(guildid, "owner_only");
				
				embed.setDescription(`The ${inlineCode("owner_only")} option in the configuration has been reset to its default value.`);
			} else if (option === "counting") {
				bot.ConfigManager.deleteConfigValue(guildid, "counting_channel");
				bot.ConfigManager.deleteConfigValue(guildid, "counting_topic");
				
				embed.setDescription(`The ${inlineCode("counting")} options in the configuration has been reset to its default value.`);
			}

			interaction.reply({
				embeds: [ embed ],
				ephemeral: true
			});
		} else if (options.getSubcommand() === "counting") {
			let channel = options.getChannel("channel");
			let topic = options.getString("topic");
			
			bot.ConfigManager.setConfigValue(guildid, "counting_channel", channel.id);
			
			if (topic == null) {
				bot.ConfigManager.deleteConfigValue(guildid, "counting_topic");
			} else {
				bot.ConfigManager.setConfigValue(guildid, "counting_topic", topic);
			}

			let embed = new EmbedBuilder()
				.setTitle("Counting configuration has been set")
				.setColor(0x202225);

			interaction.reply({
				embeds: [ embed ],
				ephemeral: true
			});
		}
	}
};
