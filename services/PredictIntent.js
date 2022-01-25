require('dotenv');

const uuid = require("uuid");
const dialogflow = require("@google-cloud/dialogflow");
const FootballDataApi = require('./FootballDataApi');
const bootstrap = require('../bootstrap');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;

require('dayjs/locale/pt')

class PredictIntent {

    constructor() {
        this.footballDataApi = new FootballDataApi();
        this.dayjs = bootstrap.dayjs
        this.numberOfRetries = 0;
        this.maxRetries = process.env.MAX_RETRIES
    }

    predict(message) {
        try {
            return this.getMessage(message)
        } catch (e) {
            this.numberOfRetries += 1;
            if (this.numberOfRetries <= this.maxRetries) {
                setTimeout(() => {
                    return this.getMessage(message)
                }, 60000);
            }
        }

    }

    async getMessage(message) {
        const projectId = process.env.PROJECT_ID
        // A unique identifier for the given session
        const sessionId = uuid.v4();

        // Create a new session
        const sessionClient = new dialogflow.SessionsClient();
        const sessionPath = sessionClient.projectAgentSessionPath(
            projectId,
            sessionId
        );

        // The text query request.
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    // The query to send to the dialogflow agent
                    text: message,
                    // The language used by the client (en-US)
                    languageCode: 'pt-PT',
                },
            },
        };

        // Send request and log result
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        let intent = result.intent ? result.intent.displayName : '';
        let score = result.intentDetectionConfidence;
        let response = result.fulfillmentText;

        return this.getPhraseByIntent(intent, response, score);

    }

    getPhraseByIntent(intent, response, score) {

        if (!response || score <= 0.4) {
            return 'Ups não percebi um caralho.';
        }

        if (intent === "next.team.game") {
            return this.getNextTeamGame(response);
        }

        if (intent === "match.streams") {
            return this.findStream(response);
        }

        return response;
    }

    async getNextTeamGame(teamName) {
        let stringSimilarity = require("string-similarity");
        let teams = require('./teams.json');

        let names = [];

        teams.forEach((value, index) => {
            names.push(value.name);
        })

        let bestMatch = stringSimilarity.findBestMatch(teamName, names);

        if (bestMatch.bestMatch.rating <= '0.7') {
            return 'Ainda não conheço essa equipa, se achas que a devia conhecer reage com um like na minha reply';
        }

        let bestMatchName = bestMatch.bestMatch.target;
        let id = 0;

        teams.forEach((value, index) => {
            if (value.name === bestMatchName) {
                id = value.id;
            }
        });

        let from = this.dayjs(new Date()).format('YYYY-MM-DD');
        let to = this.dayjs(new Date()).add(20, 'day').format('YYYY-MM-DD');
        let response = await this.footballDataApi.fetchTeamMatches(from, to, id);

        if ('matches' in response) {
            for (let value of response.matches) {
                if (this.dayjs(new Date).isBefore(this.dayjs(value.utcDate))) {
                    let formattedGameDate = this.dayjs(value.utcDate).format('DD-MM HH:mm');
                    return `O próximo do jogo do ${teamName} é: \n${value.homeTeam.name} vs ${value.awayTeam.name} - ${formattedGameDate}`;
                }
            }
        }
        return 'Não encontrei nenhum jogo';

    }

    async findStream(team) {
        let url = 'http://www.redditsoccerstreams.tv/';
        let stringSimilarity = require("string-similarity");
        let dom = await JSDOM.fromURL(url);
        let serialized = dom.serialize();
        let jsom = new JSDOM(serialized);
        let streams = jsom.window.document.querySelectorAll("tr");

        for (let streamChild of streams) {
            let textGame = streamChild.querySelector('.et4').textContent;
            let gameArray = textGame.split('vs');
            let homeTeamSimilarity = stringSimilarity.compareTwoStrings(team, gameArray[0]);

            let awayTeamSimilarity = '';
            if (gameArray.length >= 2 ) {
                awayTeamSimilarity = stringSimilarity.compareTwoStrings(team, gameArray[1]);
            }

            if (homeTeamSimilarity >= 0.7 || awayTeamSimilarity >= 0.7) {
                let stream = streamChild.querySelector('.et5 a').href;
                if (stream) {
                    return `Encontrei este stream:\n${stream}`;
                }
            }
        }

        return 'Could not find any stream';
    }
}


module.exports = PredictIntent
