
const path          = require('path');

const fs            = require('fs');

const shell         = require('shelljs');

const auth          = require('basic-auth');

const express       = require('express');

const bodyParser    = require('body-parser');

// https://stackoverflow.com/a/23613092
const serveIndex    = require('serve-index')

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

const now = () => (new Date()).toISOString().substring(0, 19).replace('T', ' ');

const file = path.resolve(__dirname, process.env.FILE);

const db = storeCreator(file);

(function () {

    let readWithDelay;

    let p = '';

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

                    p.raw = data.raw;

                    if (tmp.list[p.port]) {

                        p = {
                            ...tmp.list[p.port],
                            ...p,
                        };
                    }

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

                db.write(tmp);
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

app.use(bodyParser.json())

app.all('/data', (req, res) => {

    res.setHeader('Content-type', 'application/json; charset=utf-8');

    const data = db.read();

    data.now = (new Date()).toISOString().substring(0, 16).replace('T', ' ');

    // res.setHeader('Allow', 'POST')

    return res.end(JSON.stringify(data));
});

app.post('/save-comment', (req, res) => {

    res.setHeader('Content-type', 'application/json; charset=utf-8');

    const debug = {};

    const json = req.body;

    debug.body = json;

    const data = db.read();

    debug.dbBefore = JSON.parse(JSON.stringify(data));

    if (data.list && data.list[json.port]) {

        data.list[json.port].comment = json.comment;
    }

    debug.dbAfter = JSON.parse(JSON.stringify(data));

    const write = db.write(data);

    return res.end(JSON.stringify({ok: true, debug, write}));
});

const web = path.resolve(__dirname, 'public');

app.use(express.static(web, { // http://expressjs.com/en/resources/middleware/serve-static.html
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
}), serveIndex(web, {'icons': true})); // https://stackoverflow.com/a/23613092

app.listen(process.env.PORT, process.env.HOST, () => {

    tlog(`\n 🌎  Server is running ` + `${process.env.HOST}:${process.env.PORT}\n`);

});