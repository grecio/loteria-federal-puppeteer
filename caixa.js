const fs = require('fs');
const puppeteer = require('puppeteer');


const defaultViewport = {
    deviceScaleFactor: 1,
    hasTouch: false,
    height: 1024,
    isLandscape: false,
    isMobile: false,
    width: 1280
};


try {

    (async () => {

        let browser = await puppeteer.launch({
            headless: false, // launch headful mode
            slowMo: 0, // slow down puppeteer script so that it's easier to follow visually
            devtools: false,
            ignoreHTTPSErrors: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--proxy-server="direct://"',
                '--proxy-bypass-list=*',
                '--disable-web-security',
                '--lang=pt-BR,pt'
            ]
        });

        const page = await browser.newPage();
        var urlAtual = '';

        await page.setViewport(defaultViewport);

        page.on('response', response => {

            if (response.status() === 200) {

                response.text().then(function (payload) {

                    var data = JSON.parse(payload);
                    var _premios =  [];

                    for (let i = 0; i < data.premios.length; i++) {
                        
                        _premios.push({
                            bilhete: data.premios[i].bilhete,
                            faixa: data.premios[i].faixa,
                            valor: data.premios[i].valor
                        });
                    }

                    var logger = fs.createWriteStream('log.txt', {
                        flags: 'a'
                    })


                    logger.write(JSON.stringify({
                        concurso: data.concurso,
                        data: data.data,
                        premios: _premios
                    })+'\n');

                    logger.end();

                })
            }

        })

        for (let sorteio = 5289; sorteio <= 5364; sorteio++) {

            let url = 'http://loterias.caixa.gov.br/wps/portal/loterias/landing/federal/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbz8vTxNDRy9_Y2NQ13CDA0MzIAKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wBmoxN_FydLAGAgNTKEK8DkRrACPGwpyQyMMMj0VAYe29yM!/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0J0VSC0AC4GLFAD20G0/res/id=buscaResultado/c=cacheLevelPage/=/?timestampAjax=1550963931453&concurso=' + sorteio;

            await page.goto(url, {
                waitUntil: ['networkidle2', 'load', 'domcontentloaded']
            });
        }

    })();

} catch (error) {
    console.log(error);
}

