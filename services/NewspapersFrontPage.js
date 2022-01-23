require('dotenv');

const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const bootstrap = require('../bootstrap');


class NewspapersFrontPage {

    constructor() {

        this.newsPapersUrl = [
            'https://www.vercapas.com/capa/a-bola.html',
            'https://www.vercapas.com/capa/o-jogo.html',
            'https://www.vercapas.com/capa/record.html'
        ];

        this.client = bootstrap.client;
    }

    async send() {

        await this.client.login(process.env.TOKEN)

        this.newsPapersUrl.forEach((url) => {
            JSDOM.fromURL(url).then(dom => {
                let serialized = dom.serialize();
                let jsom = new JSDOM(serialized);
                let imgUrl = jsom.window.document.querySelector("section#article span.center_text  img").getAttribute('src');

                if (imgUrl) {
                    let channel = this.client.channels.cache.get(process.env.CHANNEL_DESPORTO);
                    channel.send(imgUrl)
                }
            });
        })
    }
}

module.exports = NewspapersFrontPage
