import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName('math')
	.setDescription('Do simple math expressions')
	.addSubcommand(subcommand =>
		subcommand
			.setName('add')
			.setDescription('Add two numbers')
			.addNumberOption(option =>
				option
					.setName('num1')
					.setDescription('The first number')
					.setRequired(true))
			.addNumberOption(option =>
				option
					.setName('num2')
					.setDescription('The second number')
					.setRequired(true))
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('subtract')
			.setDescription('Subtract two numbers')
			.addNumberOption(option =>
				option
					.setName('num1')
					.setDescription('The first number')
					.setRequired(true))
			.addNumberOption(option =>
				option
					.setName('num2')
					.setDescription('The second number')
					.setRequired(true))
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('multiply')
			.setDescription('Multiply two numbers')
			.addNumberOption(option =>
				option
					.setName('num1')
					.setDescription('The first number')
					.setRequired(true))
			.addNumberOption(option =>
				option
					.setName('num2')
					.setDescription('The second number')
					.setRequired(true))
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('divide')
			.setDescription('Divide two numbers')
			.addNumberOption(option =>
				option
					.setName('num1')
					.setDescription('The first number')
					.setRequired(true))
			.addNumberOption(option =>
				option
					.setName('num2')
					.setDescription('The second number')
					.setRequired(true))
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('modulo')
			.setDescription('Modulo two numbers')
			.addNumberOption(option =>
				option
					.setName('num1')
					.setDescription('The first number')
					.setRequired(true))
			.addNumberOption(option =>
				option
					.setName('num2')
					.setDescription('The second number')
					.setRequired(true))
	)
	.addSubcommand(subcommand =>
		subcommand
			.setName('power')
			.setDescription('Raise two numbers')
			.addNumberOption(option =>
				option
					.setName('num1')
					.setDescription('The first number')
					.setRequired(true))
			.addNumberOption(option =>
				option
					.setName('num2')
					.setDescription('The second number')
					.setRequired(true))
	);

export async function onCommand(bot, interaction) {
	const { options } = interaction;

	if (options.getSubcommand() === "add") {
		let num1 = options.getNumber("num1");
		let num2 = options.getNumber("num2");

		interaction.reply({
			content: `The answer to ${num1} plus ${num2} is ${num1 + num2}`,
			ephemeral: true
		});
	} else if (options.getSubcommand() === "subtract") {
		let num1 = options.getNumber("num1");
		let num2 = options.getNumber("num2");

		interaction.reply({
			content: `The answer to ${num1} minus ${num2} is ${num1 - num2}`,
			ephemeral: true
		});
	} else if (options.getSubcommand() === "multiply") {
		let num1 = options.getNumber("num1");
		let num2 = options.getNumber("num2");

		interaction.reply({
			content: `The answer to ${num1} times ${num2} is ${num1 * num2}`,
			ephemeral: true
		});
	} else if (options.getSubcommand() === "divide") {
		let num1 = options.getNumber("num1");
		let num2 = options.getNumber("num2");

		interaction.reply({
			content: `The answer to ${num1} divided by ${num2} is ${num1 / num2}`,
			ephemeral: true
		});
	} else if (options.getSubcommand() === "modulo") {
		let num1 = options.getNumber("num1");
		let num2 = options.getNumber("num2");

		interaction.reply({
			content: `The answer to ${num1} modulo ${num2} is ${num1 % num2}`,
			ephemeral: true
		});
	} else if (options.getSubcommand() === "power") {
		let num1 = options.getNumber("num1");
		let num2 = options.getNumber("num2");

		interaction.reply({
			content: `The answer to ${num1} to the power of ${num2} is ${num1 ** num2}`,
			ephemeral: true
		});
	}
}
