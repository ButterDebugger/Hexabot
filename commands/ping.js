const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Ping the bot');

module.exports = {
	data: data,
	onCommand: async (bot, interaction) => {
		var embed = new EmbedBuilder()
			.setColor(0x5865f2)
			.setTitle("Pong! 🏓")
			.setTimestamp()
			.setFooter({
				text: `Latency: ${bot.ws.ping}ms`,
			});

		interaction.reply({
			embeds: [ embed ],
			ephemeral: true
		});
	}
};
