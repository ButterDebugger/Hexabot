import {
	EmbedBuilder,
	userMention,
	time,
	AuditLogEvent,
	bold,
	channelMention,
} from "discord.js";

function getLoggingChannel(bot, guild) {
	const channelid = bot.ConfigManager.getConfigValue(
		guild.id,
		"logging_channel",
	);
	if (channelid == null) return null;

	const channel = guild.channels.cache.get(channelid);
	if (!channel) return null;

	return channel;
}

function isLogged(bot, guildid, key) {
	return !!bot.ConfigManager.getConfigValue(guildid, `log_${key}`);
}

export default async (bot) => {
	bot.on("messageDelete", async (message) => {
		const loggingChannel = getLoggingChannel(bot, message.guild);
		if (loggingChannel == null) return;

		if (!isLogged(bot, message.guild.id, "message_deletion")) return;

		if (message.author.bot) return;

		// Check audit logs for more info
		const fetchedLogs = await message.guild
			.fetchAuditLogs({
				limit: 6,
				type: AuditLogEvent.MessageDelete,
			})
			.catch(console.error);

		const auditEntry = fetchedLogs.entries
			.filter((a) => {
				return (
					Date.now() - a.createdTimestamp < 20000 &&
					a.target.id === message.author.id &&
					a.extra.channel.id === message.channel.id
				);
			})
			.first();

		// Create message embed
		const embed = new EmbedBuilder()
			.setColor(0xf25656)
			.setTitle("Message Deleted")
			.addFields(
				{ name: "Sent By", value: userMention(message.author.id) },
				{
					name: "Time Sent",
					value: time(Math.floor(message.createdTimestamp / 1000), "f"),
				},
				{ name: "Message Content", value: message.content },
				{
					name: "Deleted By",
					value: auditEntry?.executor
						? userMention(auditEntry.executor.id)
						: "Unknown",
				},
			)
			.setTimestamp();

		// Send message in logging channel
		loggingChannel
			.send({
				embeds: [embed],
			})
			.catch(console.error);
	});

	bot.on("messageUpdate", async (oldMessage, newMessage) => {
		const loggingChannel = getLoggingChannel(bot, newMessage.guild);
		if (loggingChannel == null) return;

		if (!isLogged(bot, newMessage.guild.id, "message_edits")) return;

		if (newMessage.author.bot) return;
		if (oldMessage.content === newMessage.content) return; // Only log if the message content changes

		// Create message embed
		const embed = new EmbedBuilder()
			.setColor(0xed861f)
			.setTitle("Message Edited")
			.addFields(
				{ name: "Sent By", value: userMention(newMessage.author.id) },
				{
					name: "Time Edited",
					value: time(Math.floor(newMessage.editedTimestamp / 1000), "f"),
				},
				{ name: "Old Content", value: oldMessage.content },
				{ name: "New Content", value: newMessage.content },
			)
			.setTimestamp();

		// Send message in logging channel
		loggingChannel
			.send({
				embeds: [embed],
			})
			.catch(console.error);
	});

	bot.on("guildMemberAdd", async (member) => {
		const loggingChannel = getLoggingChannel(bot, member.guild);
		if (loggingChannel == null) return;

		if (!isLogged(bot, member.guild.id, "member_joins")) return;

		// Create message embed
		const embed = new EmbedBuilder()
			.setColor(0x58f257)
			.setTitle("Member Joined")
			.addFields(
				{
					name: "User Profile",
					value: [
						`${bold("Profile")}: ${userMention(member.user.id)}`,
						writeUserTagname(member.user),
						`${bold("User ID")}: ${member.user.id}`,
					].join("\n"),
				},
				{
					name: "Time Joined",
					value: time(Math.floor(member.joinedTimestamp / 1000), "f"),
				},
			)
			.setThumbnail(
				`https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`,
			)
			.setTimestamp();

		// Send message in logging channel
		loggingChannel
			.send({
				embeds: [embed],
			})
			.catch(console.error);
	});

	bot.on("guildMemberRemove", async (member) => {
		const loggingChannel = getLoggingChannel(bot, member.guild);
		if (loggingChannel == null) return;

		// Check audit logs for more info
		const fetchedLogs = await member.guild
			.fetchAuditLogs({
				limit: 6,
				type: AuditLogEvent.MemberKick,
			})
			.catch(console.error);

		const auditEntry = fetchedLogs.entries
			.filter((a) => {
				return (
					Date.now() - a.createdTimestamp < 20000 &&
					a.target.id === member.user.id
				);
			})
			.first();

		if (auditEntry && isLogged(bot, member.guild.id, "member_kicked")) {
			// Create message embed
			const embed = new EmbedBuilder()
				.setColor(0xf7682a)
				.setTitle("Member Kicked")
				.addFields(
					{
						name: "User Profile",
						value: [
							`${bold("Profile")}: ${userMention(member.user.id)}`,
							writeUserTagname(member.user),
							`${bold("User ID")}: ${member.user.id}`,
						].join("\n"),
					},
					{
						name: "Member Since",
						value: time(Math.floor(member.joinedTimestamp / 1000), "f"),
					},
					{
						name: "Reason",
						value:
							auditEntry.reason === null ? "Unspecified" : auditEntry.reason,
					},
					{
						name: "Kicked By",
						value: auditEntry?.executor
							? userMention(auditEntry.executor.id)
							: "Unknown",
					},
				)
				.setThumbnail(
					`https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`,
				)
				.setTimestamp();

			// Send message in logging channel
			loggingChannel
				.send({
					embeds: [embed],
				})
				.catch(console.error);
		} else if (isLogged(bot, member.guild.id, "member_leaves")) {
			// Create message embed
			const embed = new EmbedBuilder()
				.setColor(0xf25656)
				.setTitle("Member Left")
				.addFields(
					{
						name: "User Profile",
						value: [
							`${bold("Profile")}: ${userMention(member.user.id)}`,
							writeUserTagname(member.user),
							`${bold("User ID")}: ${member.user.id}`,
						].join("\n"),
					},
					{
						name: "Member Since",
						value: time(Math.floor(member.joinedTimestamp / 1000), "f"),
					},
				)
				.setThumbnail(
					`https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`,
				)
				.setTimestamp();

			// Send message in logging channel
			loggingChannel
				.send({
					embeds: [embed],
				})
				.catch(console.error);
		}
	});

	bot.on("guildBanAdd", async (ban) => {
		const loggingChannel = getLoggingChannel(bot, ban.guild);
		if (loggingChannel == null) return;

		if (!isLogged(bot, ban.guild.id, "member_banned")) return;

		// Check audit logs for more info
		const fetchedLogs = await ban.guild
			.fetchAuditLogs({
				limit: 6,
				type: AuditLogEvent.MemberBanAdd,
			})
			.catch(console.error);

		const auditEntry = fetchedLogs.entries
			.filter((a) => {
				return (
					Date.now() - a.createdTimestamp < 20000 && a.target.id === ban.user.id
				);
			})
			.first();

		// Create message embed
		const embed = new EmbedBuilder()
			.setColor(0xc23761)
			.setTitle("Member Banned")
			.addFields({
				name: "User Profile",
				value: [
					`${bold("Profile")}: ${userMention(ban.user.id)}`,
					writeUserTagname(ban.user),
					`${bold("User ID")}: ${ban.user.id}`,
				].join("\n"),
			})
			.setThumbnail(
				`https://cdn.discordapp.com/avatars/${ban.user.id}/${ban.user.avatar}.png`,
			)
			.setTimestamp();

		// Add additional audit log info
		if (auditEntry) {
			embed.addFields(
				{
					name: "Reason",
					value: auditEntry.reason === null ? "Unspecified" : auditEntry.reason,
				},
				{ name: "Banned By", value: userMention(auditEntry.executor.id) },
			);
		}

		// Send message in logging channel
		loggingChannel
			.send({
				embeds: [embed],
			})
			.catch(console.error);
	});

	bot.on("guildBanRemove", async (ban) => {
		const loggingChannel = getLoggingChannel(bot, ban.guild);
		if (loggingChannel == null) return;

		if (!isLogged(bot, ban.guild.id, "member_unbanned")) return;

		// Check audit logs for more info
		const fetchedLogs = await ban.guild
			.fetchAuditLogs({
				limit: 6,
				type: AuditLogEvent.MemberBanRemove,
			})
			.catch(console.error);

		const auditEntry = fetchedLogs.entries
			.filter((a) => {
				return (
					Date.now() - a.createdTimestamp < 20000 && a.target.id === ban.user.id
				);
			})
			.first();

		// Create message embed
		const embed = new EmbedBuilder()
			.setColor(0x24c98a)
			.setTitle("Member Unbanned")
			.addFields({
				name: "User Profile",
				value: [
					`${bold("Profile")}: ${userMention(ban.user.id)}`,
					writeUserTagname(ban.user),
					`${bold("User ID")}: ${ban.user.id}`,
				].join("\n"),
			})
			.setThumbnail(
				`https://cdn.discordapp.com/avatars/${ban.user.id}/${ban.user.avatar}.png`,
			)
			.setTimestamp();

		// Add additional audit log info
		if (auditEntry) {
			embed.addFields({
				name: "Unbanned By",
				value: userMention(auditEntry.executor.id),
			});
		}

		// Send message in logging channel
		loggingChannel
			.send({
				embeds: [embed],
			})
			.catch(console.error);
	});

	bot.on("inviteCreate", async (invite) => {
		const loggingChannel = getLoggingChannel(bot, invite.guild);
		if (loggingChannel == null) return;

		if (!isLogged(bot, invite.guild.id, "invite_added")) return;

		// Create message embed
		const embed = new EmbedBuilder()
			.setColor(0xf062f0)
			.setTitle("Invite Created")
			.addFields(
				{ name: "Code", value: invite.code },
				{ name: "Inviter", value: userMention(invite.inviterId) },
				{ name: "Channel", value: channelMention(invite.channelId) },
				{
					name: "Expires",
					value:
						invite._expiresTimestamp == null
							? "Never"
							: time(Math.floor(invite._expiresTimestamp / 1000), "R"),
				},
				{
					name: "Max Uses",
					value: invite.maxUses === 0 ? "No Limit" : `${invite.maxUses}`,
				},
				{
					name: "Created At",
					value: time(Math.floor(invite.createdTimestamp / 1000), "f"),
				},
			)
			.setTimestamp();

		// Send message in logging channel
		loggingChannel
			.send({
				embeds: [embed],
			})
			.catch(console.error);
	});

	bot.on("inviteDelete", async (invite) => {
		const loggingChannel = getLoggingChannel(bot, invite.guild);
		if (loggingChannel == null) return;

		if (!isLogged(bot, invite.guild.id, "invite_removed")) return;

		// Check audit logs for more info
		const fetchedLogs = await invite.guild
			.fetchAuditLogs({
				limit: 6,
				type: AuditLogEvent.InviteDelete,
			})
			.catch(console.error);

		const auditEntry = fetchedLogs.entries
			.filter((a) => {
				return (
					Date.now() - a.createdTimestamp < 20000 &&
					a.target.code === invite.code &&
					a.target.channelId === invite.channelId
				);
			})
			.first();

		// Create message embed
		const embed = new EmbedBuilder()
			.setColor(0x585ef2)
			.setTitle("Invite Removed")
			.addFields(
				{ name: "Code", value: invite.code },
				{ name: "Channel", value: channelMention(invite.channelId) },
			)
			.setTimestamp();

		// Add additional audit log info
		if (auditEntry) {
			embed.addFields({
				name: "Removed By",
				value: userMention(auditEntry.executor.id),
			});
		}

		// Send message in logging channel
		loggingChannel
			.send({
				embeds: [embed],
			})
			.catch(console.error);
	});

	// bot.on("channelPinsUpdate", async (channel, time) => {
	//     console.log(channel, time)
	// });

	console.log("Logging module has been loaded.");
};

function writeUserTagname(user) {
	if (user.discriminator === 0) {
		return `${bold("Username")}: ${user.username}`;
	}

	return `${bold("User Tag")}: ${user.username}#${user.discriminator}`;
}
