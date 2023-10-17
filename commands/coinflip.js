const { SlashCommandBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
	.setName('coinflip')
	.setDescription('Flip a coin');

module.exports = {
	data: data,
	onCommand: async (bot, interaction) => {
		await interaction.deferReply({
			content: "Flipping a coin...",
		});

		await new Promise(resolve => setTimeout(resolve, 850));

		if (Math.random() <= 0.001) { // 0.1% chance
			interaction.editReply({
				content: "It landed on its side!",
			});
		} else {
			let outcome = Math.round(Math.random());
			
			interaction.editReply({
				content: `It landed on ${outcome == 1 ? "heads" : "tails"}!`,
			});
		}
	}
};
