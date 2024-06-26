import { SlashCommandBuilder, ChannelType } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName('echo')
	.setDescription('Makes the bot say anything you want')
	.addStringOption(option =>
		option
			.setName('message')
			.setDescription('The message')
			.setRequired(true)
			.setMaxLength(2000)
	)
	.addChannelOption(option =>
		option
			.setName('channel')
			.setDescription('The text channel')
			.addChannelTypes(ChannelType.GuildText)
	);

export async function onCommand(bot, interaction) {
	const { options } = interaction;

	let message = options.getString("message");
	let channel = options.getChannel("channel") ?? interaction.channel;

	await interaction.deferReply({
		content: "Sending message...",
		ephemeral: true
	});

	channel.send({
		content: message
	}).then(() => {
		interaction.editReply({
			content: `Message has been sent!`,
		});
	});
}
