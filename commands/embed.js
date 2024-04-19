import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName('embed')
	.setDescription('Send an embed')
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
	.addStringOption(option =>
		option
			.setName('title')
			.setDescription('The title of the embed')
			.setMaxLength(256)
	)
	.addStringOption(option =>
		option
			.setName('description')
			.setDescription('The description of the embed')
			.setMaxLength(4096)
	)
	.addStringOption(option =>
		option
			.setName('color')
			.setDescription('The hex color of the embed')
			.setMinLength(7)
			.setMaxLength(7)
	)
	.addStringOption(option =>
		option
			.setName('url')
			.setDescription('The url of the embed')
			.setMaxLength(2048)
	)
	.addStringOption(option =>
		option
			.setName('footer')
			.setDescription('The footer of the embed')
			.setMaxLength(2048)
	)

export async function onCommand(bot, interaction) {
	const { options } = interaction;

	let title = options.getString("title");
	let description = options.getString("description");
	let color = options.getString("color");
	let url = options.getString("url");
	let footer = options.getString("footer");

	if (title === null && description === null && footer === null) {
		interaction.reply({
			content: "Please provide a title, description, or footer.",
			ephemeral: true
		});
		return;
	}

	let embed = new EmbedBuilder();

	if (typeof title == "string") {
		embed.setTitle(title);
	}
	if (typeof description == "string") {
		embed.setDescription(description);
	}
	if (typeof color == "string") {
		let colorRegex = /^#([0-9a-fA-F]{6})$/g;

		if (colorRegex.test(color)) {
			embed.setColor(color);
		} else {
			interaction.reply({
				content: "Invalid color.",
				ephemeral: true
			});
			return;
		}
	}
	if (typeof url == "string") {
		try {
			embed.setURL(url);
		} catch (error) {
			interaction.reply({
				content: "Invalid url.",
				ephemeral: true
			});
			return;
		}
	}
	if (typeof footer == "string") {
		embed.setFooter({
			text: footer
		});
	}

	interaction.channel.send({
		embeds: [ embed ]
	}).then(() => {
		interaction.reply({
			content: "Embed has been sent!",
			ephemeral: true
		});
	}).catch(() => {
		interaction.reply({
			content: "Sorry, I wasn't able to send the embed.",
			ephemeral: true
		});
	});
}
