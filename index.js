require('dotenv').config();

const Discord = require("discord.js");
const MatchThread = require("./services/MatchThread");
const NewspapersFrontPage = require("./services/NewspapersFrontPage");
const PredictIntent = require("./services/PredictIntent");
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
const CronJob = require('cron').CronJob;

async function start() {

    await client.login(process.env.TOKEN)

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
        console.log("Message ID");
        console.log(msg.channel.id);

        if (msg.content === "ping") {
            msg.reply("pong");
        }
    })

    let matchThread = new CronJob(
        '*/5 * * * *',
        () => {
            console.log('trying to create thread');
            let matchThread = new MatchThread(client);
            matchThread.send();
        },
        null,
        true
    );

    let test = new CronJob(
        '* * * * *',
        () => {
            console.log('testing')
        },
        null,
        true
    );

    let jobNewsPaper = new CronJob(
        '0 8 * * *',
        () => {
            let newsPaper = new NewspapersFrontPage();
            newsPaper.send();
        },
        null,
        true
    );

    matchThread.start();
    jobNewsPaper.start();
    test.start();
}


start().then(r => console.log('done'));

