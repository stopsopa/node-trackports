
const shell   = require('shelljs');

module.exports = () => new Promise((res, rej) => {
    shell.exec('netstat -ntpl', {
        silent: true,
    }, (code, stdout, stderr) => {

        const data = {
            code,
            stdout,
            stderr,
        };

        (code === 0) ? res(data) : rej({
            level: 'track.js',
            error: data
        });
    });
});
