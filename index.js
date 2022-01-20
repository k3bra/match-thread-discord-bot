require('dotenv').config();

const Discord = require("discord.js");
const MatchThread = require("./MatchThread");
const NewspapersFrontPage = require("./NewspapersFrontPage");
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
const CronJob = require('cron').CronJob;

client.login(process.env.TOKEN)

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


