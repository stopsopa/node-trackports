
const delay = (time, data) =>
    new Promise(
        resolve => time ? setTimeout(resolve, time, data) : resolve(data)
    )
;

/**
 * Promise.reject('test')
 *     .then(...then(10000))
 *     .catch(data => console.log(data))
 * ;
 * Promise.resolve('test')
 *     .then(...then(10000))
 *     .then(data => console.log(data))
 * ;
 * @param time
 */

delay.reject    = (time, data) =>
    new Promise(
        (resolve, reject) => time ? setTimeout(reject, time, data) : reject(data)
    )
;

delay.then      = time => ([
    data => delay(time, data),
    data => delay.reject(time, data)
]);

module.exports = delay;
