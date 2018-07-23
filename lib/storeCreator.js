
const fs            = require('fs');

// const tlog          = require('./tlog');

module.exports = file => {

    if ( ! fs.existsSync(file) ) {

        fs.writeFileSync(file, '');
    }

    if ( ! fs.existsSync(file) ) {

        throw `Can't create file '${file}'`;
    }

    let raw     = fs.readFileSync(file).toString();

    let state;

    try {
        state = JSON.parse(raw) || {};
    }
    catch (e) {
        state = {};
    }

    const tool = {
        read    : () => state,
        write   : data => {

            state       = data;

            const tmp   = JSON.stringify(state, null, 4);

            if (raw !== tmp) {

                raw     = tmp;

                fs.writeFileSync(file, tmp);
            }

            return tool;
        }
    };

    return tool;
};