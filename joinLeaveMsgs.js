import { userMention } from "discord.js";

function getJoinMsgChannel(bot, guild) {
    let channelId = bot.ConfigManager.getConfigValue(guild.id, "join_message_channel");
    if (channelId == null) return null;

    let channel = guild.channels.cache.get(channelId);
    return !channel ? null : channel;
}

function getLeaveMsgChannel(bot, guild) {
    let channelId = bot.ConfigManager.getConfigValue(guild.id, "leave_message_channel");
    if (channelId == null) return null;

    let channel = guild.channels.cache.get(channelId);
    return !channel ? null : channel;
}

function getJoinMsg(bot, member) {
    let msg = bot.ConfigManager.getConfigValue(member.guild.id, "join_message");
    if (typeof msg !== "string") return null;

    return msg.replace(/{user}/g, userMention(member.user.id)).replace(/{server}/g, member.guild.name);
}

function getJoinPrivateMsg(bot, member) {
    let msg = bot.ConfigManager.getConfigValue(member.guild.id, "join_direct_message");
    if (typeof msg !== "string") return null;

    return msg.replace(/{user}/g, userMention(member.user.id)).replace(/{server}/g, member.guild.name);
}

function getLeaveMsg(bot, member) {
    let msg = bot.ConfigManager.getConfigValue(member.guild.id, "leave_message");
    if (typeof msg !== "string") return null;

    return msg.replace(/{user}/g, userTagFormat(member.user)).replace(/{server}/g, member.guild.name);
}

function userTagFormat(user) {
    return user.discriminator === "0" ? user.username : `${user.username}#${user.discriminator}`;
}

export default async (bot) => {
    bot.on("guildMemberAdd", async (member) => {
        let joinMsgChannel = getJoinMsgChannel(bot, member.guild);
        let joinMsg = getJoinMsg(bot, member);
        let joinPrivateMsg = getJoinPrivateMsg(bot, member);

        if (joinMsgChannel !== null && typeof joinMsg == "string") {
            joinMsgChannel.send(joinMsg).catch(console.error);
        }
        if (typeof joinPrivateMsg == "string") {
            member.send(joinPrivateMsg).catch(console.error);
        }
    });
    bot.on("guildMemberRemove", async (member) => {
        let leaveMsgChannel = getLeaveMsgChannel(bot, member.guild);
        let leaveMsg = getLeaveMsg(bot, member);

        if (leaveMsgChannel !== null && typeof leaveMsg == "string") {
            leaveMsgChannel.send(leaveMsg).catch(console.error);
        }
    });
}
