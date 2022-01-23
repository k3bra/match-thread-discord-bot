require('dotenv').config();

const Discord = require("discord.js");
const MatchThread = require("./services/MatchThread");
const NewspapersFrontPage = require("./services/NewspapersFrontPage");
const PredictIntent = require("./services/PredictIntent");
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
const CronJob = require('cron').CronJob;

client.login(process.env.TOKEN)

client.on("message", msg => {
    if (msg.author.bot === true) {
        return;
    }

    let predictIntent = new PredictIntent();

    if (msg.mentions.has(client.user)) {
        let botMention = `<@!${client.user.id}>`;
        let message = msg.content.replace(botMention, "");
        predictIntent.predict(message.trim()).then(response => msg.reply(response));
    }

    if (msg.content.startsWith("k3brot")) {
        let message = msg.content.replace("k3brot", "");
        predictIntent.predict(message.trim()).then(response => msg.reply(response));
    }
})



client.on("message", msg => {
    if (msg.content === "ping") {
        msg.reply("pong");
    }
})

let matchThread = new CronJob(
    '32 * * * *',
    () => {
        let matchThread = new MatchThread();
        matchThread.send();
    },
    null,
    true
);


let jobNewsPaper = new CronJob(
    '0 9 * * *',
    () => {
        let newsPaper = new NewspapersFrontPage();
        newsPaper.send();
    },
    null,
    true
);

matchThread.start();

jobNewsPaper.start();


