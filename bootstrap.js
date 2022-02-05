
const Discord = require("discord.js");
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
require("dotenv").config();
const NodeCache = require("node-cache");
const myCache = new NodeCache({stdTTL: 0, checkperiod: 172800});
const axios = require("axios");
const dayjs = require("dayjs");
const axiosInstance = axios.create({
    baseURL: process.env.FOOTBALL_DATA_URL,
    timeout: 10000,
    headers: {'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY}
})

module.exports = {
    'client': client,
    'dayjs': dayjs,
    'axiosInstance': axiosInstance,
    'myCache':myCache
}



