"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueAndFlat = void 0;
async function queueAndFlat(limit, promises) {
    let counter = 0;
    let index = 0;
    let complete = 0;
    return new Promise((resolve, reject) => {
        const results = new Array(promises.length);
        const next = () => {
            const i = index++;
            if (i >= promises.length)
                throw `Invalid index ${i}`;
            promises[i]()
                .then((ans) => {
                results[i] = ans;
                complete++;
                if (complete < promises.length - limit + 1) {
                    next();
                }
                else if (complete === promises.length) {
                    resolve(results.flat());
                }
            })
                .catch(reject);
        };
        while (counter < limit && index <= promises.length - 1) {
            counter++;
            next();
        }
    });
}
exports.queueAndFlat = queueAndFlat;
//# sourceMappingURL=queue.js.map