const { SlashCommandBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
	.setName('clear')
	.setDescription('Bulk delete messages from a channel')
	.addIntegerOption(option =>
		option
			.setName('amount')
			.setDescription('The number of messages to delete')
			.setRequired(true)
			.setMinValue(1)
			.setMaxValue(100)
	);

module.exports = {
	data: data,
	onCommand: async (bot, interaction) => {
		const { options } = interaction;
		
		let amount = options.getInteger("amount");

		await interaction.deferReply({
			content: `Clearing ${amount} messages...`,
			ephemeral: true
		});

		try {
			var messages = await interaction.channel.bulkDelete(amount, false);

			interaction.editReply({
				content: `Bulk deleted ${messages.size} ${messages.size > 1 ? "messages" : "message"}.`,
				ephemeral: true
			});
		} catch (error) {
			interaction.editReply({
				content: `Sorry, I wasn't able to bulk delete messages.`,
				ephemeral: true
			});
		}
	}
};
