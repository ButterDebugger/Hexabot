import { EmbedBuilder, inlineCode } from "discord.js";
import * as ConfigManager from "./configManager.js";

const { emojis } = ConfigManager.botConfig;

function getCountingChannel(bot, guild) {
    let channelId = bot.ConfigManager.getConfigValue(guild.id, "counting_channel");
    if (channelId == null) return null;

    let channel = guild.channels.cache.get(channelId);
    return !channel ? null : channel;
}

function getCountingTopic(bot, guild) {
    return bot.ConfigManager.getConfigValue(guild.id, "counting_topic");
}

function userTagFormat(user) {
    return user.discriminator === "0" ? user.username : `${user.username}#${user.discriminator}`;
}

export default async (bot) => {
    bot.on("messageCreate", async (message) => {
        let countingChannel = getCountingChannel(bot, message.guild);
        let countingTopic = getCountingTopic(bot, message.guild);
        if (countingChannel == null) return;

        if (message.channel.id !== countingChannel.id) return;
        if (message.author.bot) return;

        let data = bot.DataManager.getGuildData(message.guild.id);

        if (typeof data.counting_number == "undefined") data.counting_number = 0;
        if (typeof data.counting_last_guesser == "undefined") data.counting_last_guesser = bot.user.id;
        if (typeof data.counting_high_score == "undefined") data.counting_high_score = 0;

        let number = Number(message.content);

        if (!isNaN(number)) {
			if (data.counting_last_guesser !== message.member.user.id) { // If guesser wasn't the old guesser
				if (number - 1 == data.counting_number) { // If number was the next number
					data.counting_number = number; // Set the new number
					data.counting_last_guesser = message.member.user.id; // Set the last guesser

					if (number > data.counting_high_score) { // Set the new highscore
						data.counting_high_score = number;
					}

					bot.DataManager.setGuildData(message.guild.id, data); // Save guild data
					if (number == 100) {
						message.react("💯").catch(console.error);
					} else {
						message.react(emojis.check_mark).catch(console.error);
					}
				} else { // If number wasn't the next number
					message.reply("You've messed up the counting! The current number has been reset to 0.")
					data.counting_number = 0; // Reset counting
					data.counting_last_guesser = null; // Reset last guesser

					bot.DataManager.setGuildData(message.guild.id, data); // Save guild data
					message.react(emojis.cross_mark).catch(console.error);
				}
			} else { // If guesser was the old guesser
				message.reply("It isn't your turn! The current number is now 0.")
				data.counting_number = 0; // Reset counting
				data.counting_last_guesser = null; // Reset last guesser

				bot.DataManager.setGuildData(message.guild.id, data); // Save guild data
				message.react(emojis.cross_mark).catch(console.error);
			}

			if (typeof countingTopic == "string") {
				let customTopic = countingTopic.replace(/{highscore}/g, data.counting_high_score);

				if (message.channel.topic !== customTopic) {
					message.channel.setTopic(customTopic).catch(console.error);
				}
			}
        }
    });
    bot.on("messageUpdate", async (oldMessage, newMessage) => {
        let countingChannel = getCountingChannel(bot, oldMessage.guild);
        if (countingChannel == null) return;

        if (oldMessage.channel.id !== countingChannel.id) return;
        if (oldMessage.author.bot) return;

        let data = bot.DataManager.getGuildData(oldMessage.guild.id);
        let number = Number(oldMessage.content);

        if (typeof data.counting_number == "undefined") data.counting_number = 0;

        if (!isNaN(number) && number === data.counting_number) {
            const embed = new EmbedBuilder()
                .setColor(0xED861F)
                .setTitle("**Number Edited!**")
                .setDescription(`Number: ${inlineCode(oldMessage.content)}`)
                .setFooter({
                    text: `Sent by ${userTagFormat(oldMessage.member.user)}`
                });

            countingChannel.send({
                embeds: [ embed ]
            }).then(sentEmbed => {
                sentEmbed.react(emojis.check_mark).catch(console.error);
            }).catch(console.error);
        }
    });
    bot.on("messageDelete", async (message) => {
        let countingChannel = getCountingChannel(bot, message.guild);
        if (countingChannel == null) return;

        if (message.channel.id !== countingChannel.id) return;
        if (message.author.bot) return;

        let data = bot.DataManager.getGuildData(message.guild.id);
        let number = Number(message.content);

        if (typeof data.counting_number == "undefined") data.counting_number = 0;

        if (!isNaN(number) && number === data.counting_number) {
            const embed = new EmbedBuilder()
                .setColor(0xF25656)
                .setTitle("**Number Deleted!**")
                .setDescription(`Number: ${inlineCode(message.content)}`)
                .setFooter({
                    text: `Sent by ${userTagFormat(message.member.user)}`
                });

            countingChannel.send({
                embeds: [ embed ]
            }).then(sentEmbed => {
                sentEmbed.react(emojis.check_mark).catch(console.error);
            }).catch(console.error);
        }
    });
}
