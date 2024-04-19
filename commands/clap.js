import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName('clap')
	.setDescription('👏 Add 👏 claps 👏 to 👏 your 👏 message 👏')
	.addStringOption(option =>
		option
			.setName('message')
			.setDescription('The message to clap')
			.setRequired(true)
			.setMaxLength(2000)
	);

export async function onCommand(bot, interaction) {
	const { options } = interaction;

	let message = options.getString("message");

	message = "👏 " + message.replaceAll(" ", " 👏 ") + " 👏";
	message = message.substring(0, 2000);

	interaction.reply({
		content: message,
	});
}
