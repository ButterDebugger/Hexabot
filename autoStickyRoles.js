function isUsingAutoRoles(bot, guild) {
	return bot.ConfigManager.getConfigValue(guild.id, "use_auto_roles") === true;
}

function getAutoRoles(bot, guild) {
	const autoRoles = bot.ConfigManager.getConfigValue(guild.id, "auto_roles");
	return autoRoles === null ? [] : autoRoles;
}

function isUsingStickyRoles(bot, guild) {
	return (
		bot.ConfigManager.getConfigValue(guild.id, "use_sticky_roles") === true
	);
}

function getUsersPreviousRoles(bot, member) {
	const guildData = bot.DataManager.getGuildData(member.guild.id);
	return guildData[`sticky_roles:${member.user.id}`] ?? [];
}

function getStickyRoles(bot, guild) {
	const stickyRoles = bot.ConfigManager.getConfigValue(
		guild.id,
		"sticky_roles",
	);
	return stickyRoles === null ? [] : stickyRoles;
}

export default async (bot) => {
	bot.on("guildMemberAdd", async (member) => {
		let newRoles = [];

		if (isUsingAutoRoles(bot, member.guild)) {
			newRoles = newRoles.concat(getAutoRoles(bot, member.guild));
		}
		if (isUsingStickyRoles(bot, member.guild)) {
			const previousRoles = getUsersPreviousRoles(bot, member);
			const stickyRoles = getStickyRoles(bot, member.guild);
			const roles = previousRoles.filter((roleId) =>
				stickyRoles.includes(roleId),
			);

			newRoles = newRoles.concat(roles);
		}

		if (newRoles.length > 0) {
			member.roles.add(newRoles);
		}
	});
	bot.on("guildMemberRemove", async (member) => {
		if (!isUsingStickyRoles(bot, member.guild)) return;

		const stickyRoles = getStickyRoles(bot, member.guild);
		const roles = member._roles.filter((roleId) =>
			stickyRoles.includes(roleId),
		);

		const guildData = bot.DataManager.getGuildData(member.guild.id);
		guildData[`sticky_roles:${member.user.id}`] = roles;
		bot.DataManager.setGuildData(member.guild.id, guildData);
	});
};
