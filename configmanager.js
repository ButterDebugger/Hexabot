const fs = require("fs");
const { json_spacing } = require("./config.json");

const configsPath = `${process.cwd()}/storage/configs`;

function getDefaultConfig() {
	return JSON.parse(
		fs.readFileSync(`${process.cwd()}/storage/defaultconfig.json`)
	);
}

function configExists(id) {
	return fs.existsSync(`${configsPath}/${id}.json`);
}

async function init(bot) {
	bot.on("guildCreate", async (guild) => {
		console.log(`Joined guild "${guild.name}" (${guild.id}).`);

		if (!configExists(guild.id)) {
			// Check if guild config doesn't exist
			fs.writeFileSync(`${configsPath}/${guild.id}.json`, "{}");
		}
	});

	bot.on("guildDelete", async (guild) => {
		console.log(`Left guild "${guild.name}" (${guild.id}).`);

		if (configExists(guild.id)) {
			// Check if guild config exists
			fs.unlinkSync(`${configsPath}/${guild.id}.json`);
		}
	});
}

async function refresh(bot) {
	let cleanids = fs
		.readdirSync(`${configsPath}/`)
		.filter((file) => file.endsWith(".json"))
		.map((file) => file.replace(".json", ""));

	console.log(
		`Refreshing ${bot.guilds.cache.size} ${
			bot.guilds.cache.size == 1 ? "config" : "configs"
		}.`
	);

	for (const guild of bot.guilds.cache.values()) {
		// Loop through all guilds
		if (!configExists(guild.id)) {
			// Check if guild config doesn't exist
			fs.writeFileSync(`${configsPath}/${guild.id}.json`, "{}");
		}

		cleanids = cleanids.filter((id) => id !== guild.id);
	}

	if (cleanids.length > 0) {
		// If there are any leftover configs, delete them
		console.log(
			`Cleaning up ${cleanids.length} ${
				cleanids.length == 1 ? "config" : "configs"
			}.`
		);

		for (const id of cleanids) {
			// Loop through all guilds that don't exist anymore
			fs.unlinkSync(`${configsPath}/${id}.json`);
		}
	}
}

function resetConfig(id) {
	fs.writeFileSync(`${configsPath}/${id}.json`, "{}");
}

function getConfigValue(id, key) {
	let config = Object.assign(
		getDefaultConfig(),
		JSON.parse(fs.readFileSync(`${configsPath}/${id}.json`))
	);
	return config[key];
}

function setConfigValue(id, key, value) {
	let config = JSON.parse(fs.readFileSync(`${configsPath}/${id}.json`));
	config[key] = value;
	fs.writeFileSync(
		`${configsPath}/${id}.json`,
		JSON.stringify(config, null, json_spacing)
	);
}

function deleteConfigValue(id, key) {
	let config = JSON.parse(fs.readFileSync(`${configsPath}/${id}.json`));
	delete config[key];
	fs.writeFileSync(
		`${configsPath}/${id}.json`,
		JSON.stringify(config, null, json_spacing)
	);
}

module.exports = {
	init,
	refresh,
	resetConfig,
	getConfigValue,
	setConfigValue,
	deleteConfigValue
};
