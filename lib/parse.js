

const track = require('./track');

const tlog = require('./tlog');

module.exports = () => track()
    .then(ret => {

        const raw = ret.stdout + '';

        let parsed = raw.split("\n");

        parsed.shift();
        parsed.shift();

        parsed = parsed.map(n => n.trim());
        parsed = parsed.map(n => n.split(/[\s\n]+/));
        parsed = parsed.filter(n => n.length === 7);

        const result = parsed.reduce((acc, val) => {

            val[6] = (val[6] || '').trim();

            if (val[6] === '-') {

                val[6] = process.env.PORT + '/this server';
            }

            const proc = val[6].match(/^(\d+)\/(.*)$/) || ['','',''];

            // if (proc === null) {
            //
            //     tlog('is null')
            //
            //     console.log(JSON.stringify(val));
            //     console.log(raw)
            //
            //     process.exit(1);
            // }

            const k = {
                port    : parseInt(val[3].replace(/^.*?(\d+)$/, '$1'), 10) || false,
                pid     : parseInt(proc[1], 10) || false,
                proc    : proc[2] || false,
            };

            k.pid && k.proc && k.port && acc.push(k);

            return acc;

        }, []);

        // tlog('content', `\n\n\n\n:`, JSON.stringify(result, null, 4));

        return {
            raw,
            result
        }
    })
;