
const log=(function(){try{return console.log}catch(e){return function(){}}}());

const time = () => (new Date()).toISOString().substring(0, 19).replace('T', ' ')

module.exports = (...args) => {
    log.call(this, time(), ...args.map(a => a + ''));
}