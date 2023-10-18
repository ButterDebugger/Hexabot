const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType, inlineCode, channelMention, roleMention } = require("discord.js");

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
			.addStringOption(option =>
				option
					.setName('join_message')
					.setDescription('Custom user join message. Use {user} and {server} as a placeholder')
					.setMaxLength(1000)
			)
			.addStringOption(option =>
				option
					.setName('join_direct_message')
					.setDescription('Custom user join private message. Use {user} and {server} as a placeholder')
					.setMaxLength(1000)
			)
			.addChannelOption(option =>
				option
					.setName('join_message_channel')
					.setDescription('The channel where join messages will be sent')
					.addChannelTypes(ChannelType.GuildText)
			)
			.addStringOption(option =>
				option
					.setName('leave_message')
					.setDescription('Custom user leave message. Use {user} and {server} as a placeholder')
					.setMaxLength(1000)
			)
			.addChannelOption(option =>
				option
					.setName('leave_message_channel')
					.setDescription('The channel where leave messages will be sent')
					.addChannelTypes(ChannelType.GuildText)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('add_auto_role')
			.setDescription('Add an auto role')
			.addRoleOption(option =>
				option
					.setName('role')
					.setDescription('The role you want to be automatically assigned to new members')
					.setRequired(true)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('remove_auto_role')
			.setDescription('Remove an auto role')
			.addRoleOption(option =>
				option
					.setName('role')
					.setDescription('The role you no longer want to be automatically assigned to new members')
					.setRequired(true)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('add_sticky_role')
			.setDescription('Add an sticky role')
			.addRoleOption(option =>
				option
					.setName('role')
					.setDescription('The role you want to be automatically reassigned to returning members')
					.setRequired(true)
			)
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('remove_sticky_role')
			.setDescription('Remove an sticky role')
			.addRoleOption(option =>
				option
					.setName('role')
					.setDescription('The role you no longer want to be automatically reassigned to returning members')
					.setRequired(true)
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
						{ name: 'join_leave_messages', value: 'join_leave_messages' },
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
			let use_sticky_roles = bot.ConfigManager.getConfigValue(guildid, "use_sticky_roles");
			let sticky_roles = bot.ConfigManager.getConfigValue(guildid, "sticky_roles");
			let use_auto_roles = bot.ConfigManager.getConfigValue(guildid, "use_auto_roles");
			let auto_roles = bot.ConfigManager.getConfigValue(guildid, "auto_roles");
			let owner_only = bot.ConfigManager.getConfigValue(guildid, "owner_only");
			let counting_channel = bot.ConfigManager.getConfigValue(guildid, "counting_channel");
			let counting_topic = bot.ConfigManager.getConfigValue(guildid, "counting_topic");
			let join_message = bot.ConfigManager.getConfigValue(guildid, "join_message");
			let join_direct_message = bot.ConfigManager.getConfigValue(guildid, "join_direct_message");
			let join_message_channel = bot.ConfigManager.getConfigValue(guildid, "join_message_channel");
			let leave_message = bot.ConfigManager.getConfigValue(guildid, "leave_message");
			let leave_message_channel = bot.ConfigManager.getConfigValue(guildid, "leave_message_channel");

			let embed = new EmbedBuilder()
				.setTitle("Current Configuration")
				.addFields(
					{ name: 'logging_channel', value: logging_channel === null ? "Not Configured" : channelMention(logging_channel), inline: true },
					{ name: 'log_member_joins', value: log_member_joins ? "True" : "False", inline: true },
					{ name: 'log_member_leaves', value: log_member_leaves ? "True" : "False", inline: true },
					{ name: 'log_message_deletion', value: log_message_deletion ? "True" : "False", inline: true },
					{ name: 'log_message_edits', value: log_message_edits ? "True" : "False", inline: true },
					{ name: 'log_member_banned', value: log_member_banned ? "True" : "False", inline: true },
					{ name: 'log_member_unbanned', value: log_member_unbanned ? "True" : "False", inline: true },
					{ name: 'log_member_kicked', value: log_member_kicked ? "True" : "False", inline: true },
					{ name: 'log_invite_added', value: log_invite_added ? "True" : "False", inline: true },
					{ name: 'log_invite_removed', value: log_invite_removed ? "True" : "False", inline: true },
					{
						name: 'sticky_roles',
						value: use_sticky_roles
							? sticky_roles.length > 0
								? sticky_roles.map(roleId => `${roleMention(roleId)}`).join('\n')
								: "None"
							: "Not Enabled",
						inline: true
					},
					{
						name: 'auto_roles',
						value: use_auto_roles
							? auto_roles.length > 0
								? auto_roles.map(roleId => `${roleMention(roleId)}`).join('\n')
								: "none"
							: "Not Enabled",
						inline: true
					},
					{ name: 'owner_only', value: owner_only ? "True" : "False", inline: true },
					{ name: 'counting_channel', value: counting_channel === null ? "Not Configured" : channelMention(counting_channel), inline: true },
					{ name: 'counting_topic', value: counting_topic === null ? "Not Configured" : counting_topic, inline: true },
					{ name: 'join_message', value: join_message === null ? "Not Configured" : join_message, inline: true },
					{ name: 'join_direct_message', value: join_direct_message === null ? "Not Configured" : join_direct_message, inline: true },
					{ name: 'join_message_channel', value: join_message_channel === null ? "Not Configured" : channelMention(join_message_channel), inline: true },
					{ name: 'leave_message', value: leave_message === null ? "Not Configured" : leave_message, inline: true },
					{ name: 'leave_message_channel', value: leave_message_channel === null ? "Not Configured" : channelMention(leave_message_channel), inline: true },
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
			let join_message = options.getString("join_message");
			let join_direct_message = options.getString("join_direct_message");
			let join_message_channel = options.getChannel("join_message_channel");
			let leave_message = options.getString("leave_message");
			let leave_message_channel = options.getChannel("leave_message_channel");

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
			if (join_message !== null) {
				bot.ConfigManager.setConfigValue(guildid, "join_message", join_message);
			}
			if (join_direct_message !== null) {
				bot.ConfigManager.setConfigValue(guildid, "join_direct_message", join_direct_message);
			}
			if (join_message_channel !== null) {
				bot.ConfigManager.setConfigValue(guildid, "join_message_channel", join_message_channel.id);
			}
			if (leave_message !== null) {
				bot.ConfigManager.setConfigValue(guildid, "leave_message", leave_message);
			}
			if (leave_message_channel !== null) {
				bot.ConfigManager.setConfigValue(guildid, "leave_message_channel", leave_message_channel.id);
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
			} else if (option === "join_leave_messages") {
				bot.ConfigManager.deleteConfigValue(guildid, "join_message");
				bot.ConfigManager.deleteConfigValue(guildid, "join_direct_message");
				bot.ConfigManager.deleteConfigValue(guildid, "join_message_channel");
				bot.ConfigManager.deleteConfigValue(guildid, "leave_message");
				bot.ConfigManager.deleteConfigValue(guildid, "leave_message_channel");
				
				embed.setDescription(`The ${inlineCode("join_leave_messages")} options in the configuration has been reset to its default value.`);
			}

			interaction.reply({
				embeds: [ embed ],
				ephemeral: true
			});
		} else if (options.getSubcommand() === "add_auto_role") {
			let role = options.getRole("role");
			let usingAutoRoles = bot.ConfigManager.getConfigValue(guildid, "use_auto_roles");

			if (!usingAutoRoles) {
				let embed = new EmbedBuilder()
					.setTitle("Configuration Conflict")
					.setDescription(`${inlineCode("auto_roles")} must be enabled in the config to add any auto roles`)
					.setColor(0x202225);
	
				interaction.reply({
					embeds: [ embed ],
					ephemeral: true
				});
				return;
			}
			
			let autoRoles = bot.ConfigManager.getConfigValue(guildid, "auto_roles");
			if (!autoRoles.includes(role.id)) autoRoles.push(role.id);
			bot.ConfigManager.setConfigValue(guildid, "auto_roles", autoRoles);

			let embed = new EmbedBuilder()
				.setTitle("Configuration Edited")
				.setDescription(`${inlineCode(role.name)} has been added to the list of auto roles`)
				.setColor(0x202225);

			interaction.reply({
				embeds: [ embed ],
				ephemeral: true
			});
		} else if (options.getSubcommand() === "remove_auto_role") {
			let role = options.getRole("role");
			let usingAutoRoles = bot.ConfigManager.getConfigValue(guildid, "use_auto_roles");

			if (!usingAutoRoles) {
				let embed = new EmbedBuilder()
					.setTitle("Configuration Conflict")
					.setDescription(`${inlineCode("auto_roles")} must be enabled in the config to remove any auto roles`)
					.setColor(0x202225);
	
				interaction.reply({
					embeds: [ embed ],
					ephemeral: true
				});
				return;
			}
			
			let autoRoles = bot.ConfigManager.getConfigValue(guildid, "auto_roles");
			autoRoles = autoRoles.filter(roleId => roleId !== role.id);
			bot.ConfigManager.setConfigValue(guildid, "auto_roles", autoRoles);

			let embed = new EmbedBuilder()
				.setTitle("Configuration Edited")
				.setDescription(`${inlineCode(role.name)} has been removed to the list of auto roles`)
				.setColor(0x202225);

			interaction.reply({
				embeds: [ embed ],
				ephemeral: true
			});
		} else if (options.getSubcommand() === "add_sticky_role") {
			let role = options.getRole("role");
			let usingStickyRoles = bot.ConfigManager.getConfigValue(guildid, "use_sticky_roles");

			if (!usingStickyRoles) {
				let embed = new EmbedBuilder()
					.setTitle("Configuration Conflict")
					.setDescription(`${inlineCode("sticky_roles")} must be enabled in the config to add any sticky roles`)
					.setColor(0x202225);
	
				interaction.reply({
					embeds: [ embed ],
					ephemeral: true
				});
				return;
			}
			
			let stickyRoles = bot.ConfigManager.getConfigValue(guildid, "sticky_roles");
			if (!stickyRoles.includes(role.id)) stickyRoles.push(role.id);
			bot.ConfigManager.setConfigValue(guildid, "sticky_roles", stickyRoles);

			let embed = new EmbedBuilder()
				.setTitle("Configuration Edited")
				.setDescription(`${inlineCode(role.name)} has been added to the list of sticky roles`)
				.setColor(0x202225);

			interaction.reply({
				embeds: [ embed ],
				ephemeral: true
			});
		} else if (options.getSubcommand() === "remove_sticky_role") {
			let role = options.getRole("role");
			let usingStickyRoles = bot.ConfigManager.getConfigValue(guildid, "use_sticky_roles");

			if (!usingStickyRoles) {
				let embed = new EmbedBuilder()
					.setTitle("Configuration Conflict")
					.setDescription(`${inlineCode("sticky_roles")} must be enabled in the config to remove any sticky roles`)
					.setColor(0x202225);
	
				interaction.reply({
					embeds: [ embed ],
					ephemeral: true
				});
				return;
			}
			
			let stickyRoles = bot.ConfigManager.getConfigValue(guildid, "sticky_roles");
			stickyRoles = stickyRoles.filter(roleId => roleId !== role.id);
			bot.ConfigManager.setConfigValue(guildid, "sticky_roles", stickyRoles);

			let embed = new EmbedBuilder()
				.setTitle("Configuration Edited")
				.setDescription(`${inlineCode(role.name)} has been removed to the list of sticky roles`)
				.setColor(0x202225);

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
