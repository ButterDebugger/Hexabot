const { REST } = require("@discordjs/rest");
const { Routes, Collection } = require("discord.js");
const fs = require("node:fs");

const appCommands = [];
const commands = new Collection();
const customNamespaces = new Map();

for (const file of fs
	.readdirSync(`${process.cwd()}/commands/`)
	.filter((file) => file.endsWith(".js"))
) {
	let command = require(`${process.cwd()}/commands/${file}`);
	let commandName = command.data.name;

	appCommands.push(command.data.toJSON());
	commands.set(commandName, command);

	if (typeof command.customNamespace == "string") {
		customNamespaces.set(command.customNamespace, commandName);
	}
}

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

module.exports = async (bot) => {
	// Register application slash commands
	try {
		console.log("Started refreshing application slash commands.");

		await rest.put(Routes.applicationCommands(bot.user.id), {
			body: appCommands
		});

		console.log("Successfully reloaded application slash commands.");
	} catch (error) {
		throw error;
	}

	// Add an interaction create event listener
	bot.on("interactionCreate", async (interaction) => {
		if (typeof interaction.guildId !== "string") return;

		if (interaction.isCommand()) {
			const { commandName } = interaction;

			if (typeof commandName !== "string") return;
			if (!commands.has(commandName)) return;

			const command = commands.get(commandName);

			await command.onCommand(bot, interaction);
		} else if (interaction.isButton()) {
			let customId = interaction.customId;
			if (typeof customId !== "string") return;

			let namespace = customId.substring(0, customId.indexOf(":"));
			if (!customNamespaces.has(namespace)) return;

			let commandName = customNamespaces.get(namespace);
			if (!commands.has(commandName)) return;

			let command = commands.get(commandName);
			await command.onButton(bot, interaction);
		} else if (interaction.isModalSubmit()) {
			let customId = interaction.customId;
			if (typeof customId !== "string") return;

			let namespace = customId.substring(0, customId.indexOf(":"));
			if (!customNamespaces.has(namespace)) return;

			let commandName = customNamespaces.get(namespace);
			if (!commands.has(commandName)) return;

			let command = commands.get(commandName);
			await command.onModal(bot, interaction);
		}
	});
};
