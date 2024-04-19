import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Ping the bot');

export async function onCommand(bot, interaction) {
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
