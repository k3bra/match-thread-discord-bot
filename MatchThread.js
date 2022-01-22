const bootstrap = require('./bootstrap');
require('dotenv');

class MatchThread {

    constructor() {
        this.dayjs = bootstrap.dayjs;
        this.axiosInstance = bootstrap.axiosInstance;
        this.client = bootstrap.client;
        this.cache = bootstrap.myCache;
    }

    send() {
        this.fetchMatches().then((response) => {
            try {
                if ('matches' in response) {
                    this.sendMessage(response.matches);
                }
            } catch (err) {
                console.log(err)
            }
        });
    }

    fetchMatches = async () => {
        try {
            let today = this.dayjs(new Date()).format('YYYY-MM-DD');
            const resp = await this.axiosInstance.get('v2/matches', {params: {dateFrom: today, dateTo: today}});

            if (resp.data === undefined) {
                return [];
            }

            return resp.data;
        } catch (err) {
            // Handle Error Here
            console.error(err);
        }
    };

    async sendMessage(matches) {
        await this.client.login(process.env.TOKEN)

        matches.forEach((element) => {
            let gameDate = this.dayjs(element.utcDate);
            let fromDate = this.dayjs(new Date()).subtract(10, 'minutes');
            let toDate = this.dayjs(new Date()).add(1, 'hour');

            if (this.cache.get(element.id) === undefined && gameDate.isAfter(fromDate) && gameDate.isBefore(toDate)) {
                let formattedGameDate = this.dayjs(element.utcDate).format('DD-MM-YYYY HH:mm');
                let message = `${element.competition.name}: ${element.homeTeam.name} vs ${element.awayTeam.name} - ${formattedGameDate}`

                this.cache.set(element.id, {game: message}, 10000);

                let channel = this.client.channels.cache.get(process.env.CHANNEL_ID);
                channel.send(message);
            }

        });
    }

}

module.exports = MatchThread
