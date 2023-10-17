const { SlashCommandBuilder, userMention, EmbedBuilder } = require("discord.js");
const { emojis } = require("../config.json");

const data = new SlashCommandBuilder()
	.setName('poll')
	.setDescription('Create a poll')
	.addStringOption(option =>
		option
			.setName('message')
			.setDescription('The message of the poll')
			.setRequired(true)
			.setMaxLength(1024)
	);

module.exports = {
	data: data,
	onCommand: async (bot, interaction) => {
		const { options } = interaction;

		let message = options.getString("message");

		try {
			var embed = new EmbedBuilder()
				.setColor(0x00AE86)
				.setTitle("▬▬▬▬▬▬▬▬▬▬▬▬▬« Poll »▬▬▬▬▬▬▬▬▬▬▬▬▬")
				.addFields({ name: 'Created By:', value: userMention(interaction.user.id) })
				.addFields({ name: 'Description:', value: message })
				.setTimestamp();
	
			var reply = await interaction.reply({
				embeds: [ embed ],
				fetchReply: true
			});
			
			await reply.react(emojis.up_vote).catch(console.error);;
			await reply.react(emojis.down_vote).catch(console.error);;
		} catch (error) {
			interaction.reply({
				content: "Sorry, I wasn't able to create the poll.",
				ephemeral: true
			});
		}
	}
};
