
const path          = require('path');

const fs            = require('fs');

const shell         = require('shelljs');

const auth          = require('basic-auth');

const express       = require('express');

const tlog          = require('./lib/tlog');

const delay         = require('./lib/delay');

const parse         = require('./lib/parse');

const storeCreator  = require('./lib/storeCreator');

const app           = express();

if ( ! shell.which(`netstat`) ) {

    throw `Sorry, this script requires netstat`;
}

if ( ! process.env.PORT ) {

    throw `process.env.PORT is not defined`;
}

if ( ! process.env.HOST ) {

    throw `process.env.HOST is not defined`;
}

if ( ! process.env.USERNAME ) {

    throw `process.env.USERNAME is not defined`;
}

if ( ! process.env.PASSWORD ) {

    throw `process.env.PASSWORD is not defined`;
}

if ( ! process.env.INTERVAL_MS ) {

    throw `process.env.INTERVAL_MS is not defined`;
}

const interval = parseInt(process.env.INTERVAL_MS, 10);

// if (process.env.INTERVAL_MS < 10000) {
//
//     throw `process.env.INTERVAL_MS cant be smaller than 10000 miliseconds, currently is: ${process.env.INTERVAL_MS}`;
// }

if ( ! process.env.FILE ) {

    throw `process.env.FILE is not defined`;
}

const file = path.resolve(__dirname, process.env.FILE);

const db = storeCreator(file);

(function () {

    let readWithDelay;

    let p = '';

    const now = () => (new Date()).toISOString().substring(0, 19).replace('T', ' ');

    const read = () => {

        return parse()
            .then(data => {

                const tmp = db.read();

                if ( ! tmp.list) {

                    tmp.list = {};
                }

                // tlog(JSON.stringify(data.result, null, 4))

                data.result.forEach(p => {

                    p.lastTimeParsed = now();

                    tmp.list[p.port] = p;
                });

                const pp = data.result.map(p => p.port).join(' ');

                if (p === pp) {

                    process.stdout.write('.');
                }
                else {

                    process.stdout.write("\n");

                    tlog(":" + pp);

                    p = pp;
                }

                db.write(data);
            })
            .then(() => readWithDelay())
            .catch(e => {
                tlog('catch error', e)
            })
        ;
    };

    readWithDelay = () => delay(interval).then(() => read());

    read();
}());

app.all('/ping', (req, res) => {
    res.end('ok')
});

app.use((req, res, next) => {

    const credentials = auth(req);

    if (!credentials || credentials.name !== process.env.USERNAME || credentials.pass !== process.env.PASSWORD) {

        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="User and password please"')
        return res.end('Access denied');
    }

    next()
});

app.use(express.static(path.resolve(__dirname, 'public'), { // http://expressjs.com/en/resources/middleware/serve-static.html
    // maxAge: 60 * 60 * 24 * 1000 // in milliseconds
    // maxAge: '356 days', // in milliseconds max-age=30758400
    // setHeaders: (res, path) => {
    //
    //     if (/\.bmp$/i.test(path)) { // for some reason by default express.static sets here Content-Type: image/x-ms-bmp
    //
    //         res.setHeader('Content-type', 'image/bmp')
    //     }
    //
    //     // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
    //     // res.setHeader('Cache-Control', 'public, no-cache, max-age=30758400')
    //     // res.setHeader('Cache-Control', 'public, only-if-cached')
    // }
}));

app.all('/data', (req, res) => {

    res.setHeader('Content-type', 'application/json; charset=utf-8');

    return res.end(JSON.stringify(db.read()));
});

app.listen(process.env.PORT, process.env.HOST, () => {

    tlog(`\n 🌎  Server is running ` + `${process.env.HOST}:${process.env.PORT}\n`)
});