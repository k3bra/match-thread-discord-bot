const bootstrap = require('../bootstrap');
const FootballDataApi = require('./FootballDataApi');
require('dotenv');

class MatchThread {

    constructor(client) {
        this.dayjs = bootstrap.dayjs;
        this.client = client;
        this.cache = bootstrap.myCache;

        this.numberOfRetries = 0;

        this.maxRetries = process.env.MAX_RETRIES

        this.whiteListedTeamNames = [
            'Porto',
            'Benfica',
            'Sporting Clube de Portugal',
            'Juventus',
            'Manchester',
            'City',
            'Liverpool FC',
            'Roma',
            'Wolverhampton',
            'Braga',
            'Barcelona',
            'Chelsea',
            'Inter',
        ]
    }

    send() {
        try {
            this.fetchMatches().then((response) => {
                if ('matches' in response) {
                    this.sendMessage(response.matches);
                }
            })
        } catch (e) {
            this.numberOfRetries += 1;
            if (this.numberOfRetries <= this.maxRetries) {
                setTimeout(() => {
                    console.log('trying again');
                    this.send()
                }, 60000);
            }
        }
    }

    fetchMatches = async () => {
        let footballDataApi = new FootballDataApi();
        let today = this.dayjs(new Date()).format('YYYY-MM-DD');
        const resp = await footballDataApi.fetchMatches(today, today);

        if (resp === undefined) {
            return [];
        }
        return resp;
    };

    async sendMessage(matches) {
        matches.forEach((element) => {
            let gameDate = this.dayjs(element.utcDate);
            let fromDate = this.dayjs(new Date()).subtract(10, 'minutes');
            let toDate = this.dayjs(new Date()).add(1, 'hour');

            if (this.isWhiteListed(element.homeTeam.name, element.awayTeam.name)
                && this.cache.get(element.id) === undefined
                && gameDate.isAfter(fromDate) && gameDate.isBefore(toDate)
            ) {
                let formattedGameDate = this.dayjs(element.utcDate).format('DD-MM-YYYY HH:mm');
                let message = `${element.competition.name}: ${element.homeTeam.name} vs ${element.awayTeam.name} - ${formattedGameDate}`

                this.cache.set(element.id, {game: message}, 10000);

                let channel = this.client.channels.cache.get(process.env.CHANNEL_ID);
                channel.send(message);
            }
        });
    }

    isWhiteListed(homeTeam, awayteam) {
        for (let whiteListedTeam of this.whiteListedTeamNames) {
            if (homeTeam.includes(whiteListedTeam) || awayteam.includes(whiteListedTeam)) {
                return true;
            }
        }

        return false;
    }
}

module.exports = MatchThread