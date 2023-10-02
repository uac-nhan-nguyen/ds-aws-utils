"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueAndFlat = exports.queue = void 0;
async function queue(options, callbacks) {
    const limit = options.limit ?? 1;
    let counter = 0;
    let index = 0;
    let complete = 0;
    return new Promise((resolve, reject) => {
        const results = new Array(callbacks.length);
        const next = () => {
            const i = index++;
            if (i >= callbacks.length)
                throw `Invalid index ${i}`;
            callbacks[i]()
                .then((ans) => {
                results[i] = ans;
                complete++;
                if (complete < callbacks.length - limit + 1) {
                    next();
                }
                else if (complete === callbacks.length) {
                    resolve(results);
                }
            })
                .catch(reject);
        };
        while (counter < limit && index <= callbacks.length - 1) {
            counter++;
            next();
        }
    });
}
exports.queue = queue;
async function queueAndFlat(options, callbacks) {
    const ans = await queue(options, callbacks);
    return ans.flat();
}
exports.queueAndFlat = queueAndFlat;
//# sourceMappingURL=queue.js.map