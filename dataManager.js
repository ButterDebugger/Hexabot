import fs from "node:fs";
import path from "node:path";
import * as ConfigManager from "./configManager.js";

const dataPath = `${process.cwd()}/storage/data`;
const { json_spacing } = ConfigManager.botConfig;

export function getDataContainer(key) {
	if (typeof key !== "string") throw new TypeError("Key must be a string.");

	const filePath = `${dataPath}/${key}.json`;
	fs.mkdirSync(path.dirname(filePath), { recursive: true });

	if (!fs.existsSync(filePath)) return {};
	return JSON.parse(fs.readFileSync(filePath)) ?? {};
}
export function setDataContainer(key, data) {
	if (typeof key !== "string") throw new TypeError("Key must be a string.");
	if (typeof data !== "object") throw new TypeError("Data must be an object.");

	const filePath = `${dataPath}/${key}.json`;
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, JSON.stringify(data, null, json_spacing));
}
export function deleteDataContainer(key) {
	if (typeof key !== "string") throw new TypeError("Key must be a string.");

	const filePath = `${dataPath}/${key}.json`;
	fs.unlinkSync(filePath);
}

export function getGuildData(guildId) {
	return getDataContainer(`guilds/${guildId}`);
}
export function setGuildData(guildId, data) {
	return setDataContainer(`guilds/${guildId}`, data);
}
export function deleteGuildData(guildId) {
	return deleteDataContainer(`guilds/${guildId}`);
}
