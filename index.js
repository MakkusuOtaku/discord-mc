const { Client, Events, GatewayIntentBits } = require("discord.js");
const { host, port, token } = require("./config.json");
const mineflayer = require("mineflayer");

const channelID = "0123456789"; // put your channel ID here

let gameID;
let ready = false;

// discord setup
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
] });

client.once("ready", (readyClient)=>{
	console.log(`Discord ready! Logged in as ${readyClient.user.tag}`);
    
    if (ready) startGame();
    else ready = true;
});

client.login(token);

// minecraft setup
const bot = mineflayer.createBot({
    username: "DiscordBot",
    host: host,
    port: port,
});

bot.once("spawn", ()=>{
    console.log(`Minecraft ready! Logged in as ${bot.username}`);

    if (ready) startGame();
    else ready = true;
});

bot.on("physicsTick", ()=>{
    if (bot.entity.isCollidedHorizontally !== undefined) {
        bot.setControlState("jump", bot.entity.isCollidedHorizontally);
    }
});

const actions = {
    "🔼": async ()=>{
        bot.setControlState("forward", true);
        await bot.waitForTicks(20);
        bot.setControlState("forward", false);
    },
    "◀️": async ()=>{
        await bot.look(bot.entity.yaw + 1, 0);
    },
    "▶️": async ()=>{
        await bot.look(bot.entity.yaw - 1, 0);
    },
};

async function startGame() {
    const channel = client.channels.cache.get(channelID);
    const messageContent = `Playing minecraft on ${host}:${port}`;
    const message = await channel.send(messageContent);

    message.react("◀️");
    message.react("🔼");
    message.react("▶️");

    gameID = message.id;
}

client.on("messageReactionAdd", (reaction, user)=>{
    if (user.bot || reaction.message.id !== gameID) return;

    let actionName = reaction.emoji.name;
    let action = actions[actionName];

    if (action) {
        action();
    }

    reaction.users.remove(user).catch(console.error);
});