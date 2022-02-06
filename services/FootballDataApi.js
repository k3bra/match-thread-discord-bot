const bootstrap = require('../bootstrap');
require('dotenv');

class FootballDataApi {

    constructor() {
        this.dayjs = bootstrap.dayjs;
        this.axiosInstance = bootstrap.axiosInstance;
    }

    async fetchTeamMatches(from, to, id) {
        try {
            const resp = await this.axiosInstance.get(`v2/teams/${id}/matches`, {params: {dateFrom: from, dateTo: to}});

            if (resp.data === undefined) {
                return [];
            }

            return resp.data;
        } catch (err) {
            // Handle Error Here
            console.error(err);
        }
    }


    async fetchMatches(date) {
        try {
            const resp = await this.axiosInstance.get('v2/matches', {params: {utcDate: date}});

            if (resp.data === undefined) {
                return [];
            }

            return resp.data;
        } catch (err) {
            // Handle Error Here
            console.error(err);
        }
    }
}

module.exports = FootballDataApi