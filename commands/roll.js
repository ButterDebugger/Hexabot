import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName('roll')
	.setDescription('Roll a die')
	.addIntegerOption(option =>
		option
			.setName('sides')
			.setDescription('The number of sides of the dice')
			.setMinValue(4)
			.setMaxValue(100)
	);

export async function onCommand(bot, interaction) {
	const { options } = interaction;

	let sides = options.getInteger("sides") ?? 6;

	await interaction.deferReply({
		content: "Rolling a die...",
	});

	let roll = Math.floor(Math.random() * sides) + 1;

	interaction.editReply({
		content: `You rolled a ${roll}!`,
	});
}
