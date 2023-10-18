const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const config = require("./config.json");
require("dotenv").config();

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

const ConfigManager = bot.ConfigManager = require("./configmanager.js");
const DataManager = bot.DataManager = require("./datamanager.js");

bot.on("ready", async () => {
    // Start required modules
    await ConfigManager.refresh(bot);
    await ConfigManager.init(bot);
    
    await require("./cmd.js")(bot);

    // Start bot modules
    await require("./logger.js")(bot);
    await require("./counting.js")(bot);
    await require("./joinleavemsgs.js")(bot);
    await require("./autoStickyRoles.js")(bot);
    
    // Set bot status and activity
    bot.user.setStatus(config.activity.status);

    const updateActivity = () => {
        var actIndex = Math.floor(Math.random() * config.activity.activities.length);
        var activity = config.activity.activities[actIndex];

        if (typeof activity == "object" && typeof activity?.type == "string") {
            activity.type = ActivityType[activity.type];
        }
        
        bot.user.setActivity(activity);
    };

    updateActivity();
    setInterval(updateActivity, config.activity.interval);

    // Log bot startup
    console.log(`Logged in as ${bot.user.tag}!`);
});

bot.login(process.env.BOT_TOKEN);