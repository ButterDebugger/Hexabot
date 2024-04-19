import { Client, GatewayIntentBits, ActivityType } from "discord.js";
import * as ConfigManager from "./configManager.js";
import * as DataManager from "./dataManager.js";
import initCmd from "./cmd.js";
import initLogger from "./logger.js";
import initCounting from "./counting.js";
import initJoinLeaveMsgs from "./joinLeaveMsgs.js";
import initAutoStickyRoles from "./autoStickyRoles.js";

console.log(ConfigManager.botConfig)

const { custom_activity } = ConfigManager.botConfig;

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildBans, GatewayIntentBits.GuildModeration,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildInvites,
    ]
});

bot.ConfigManager = ConfigManager;
bot.DataManager = DataManager;

bot.on("ready", async () => {
    // Start required modules
    await ConfigManager.refresh(bot);
    await ConfigManager.init(bot);

    initCmd(bot);

    // Start bot modules
    initLogger(bot);
    initCounting(bot);
    initJoinLeaveMsgs(bot);
    initAutoStickyRoles(bot);

    // Set bot status and activity
    console.log(custom_activity)
    bot.user.setStatus(custom_activity.status);

    const updateActivity = () => {
        let actIndex = Math.floor(Math.random() * custom_activity.activities.length);
        let activity = custom_activity.activities[actIndex];

        if (typeof activity == "object" && typeof activity?.type == "string") {
            activity.type = ActivityType[activity.type];
        }

        bot.user.setActivity(activity);
    };

    updateActivity();
    setInterval(updateActivity, custom_activity.interval);

    // Log bot startup
    console.log(`Logged in as ${bot.user.tag}!`);
});

bot.login(process.env.BOT_TOKEN);
