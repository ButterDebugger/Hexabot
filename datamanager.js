const fs = require("fs");
const path = require("path");
const { json_spacing } = require("./config.json");

const dataPath = `${process.cwd()}/storage/data`;

function getDataContainer(key) {
	if (typeof key !== "string") throw new TypeError("Key must be a string.");

	let filePath = `${dataPath}/${key}.json`;
	fs.mkdirSync(path.dirname(filePath), { recursive: true });

	if (!fs.existsSync(filePath)) return {};
	return JSON.parse(fs.readFileSync(filePath)) ?? {};
}
function setDataContainer(key, data) {
	if (typeof key !== "string") throw new TypeError("Key must be a string.");
	if (typeof data !== "object") throw new TypeError("Data must be an object.");

	let filePath = `${dataPath}/${key}.json`;
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(
		filePath,
		JSON.stringify(data, null, json_spacing)
	);
}
function deleteDataContainer(key) {
	if (typeof key !== "string") throw new TypeError("Key must be a string.");

	let filePath = `${dataPath}/${key}.json`;
	fs.unlinkSync(filePath);
}

function getGuildData(guildId) {
	return getDataContainer(`guilds/${guildId}`);
}
function setGuildData(guildId, data) {
	return setDataContainer(`guilds/${guildId}`, data);
}
function deleteGuildData(guildId) {
	return deleteDataContainer(`guilds/${guildId}`);
}

module.exports = {
	getDataContainer,
	setDataContainer,
	deleteDataContainer,
	getGuildData,
	setGuildData,
	deleteGuildData
};
