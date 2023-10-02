"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const queue_1 = require("./queue");
const node_test_1 = require("node:test");
(0, node_test_1.describe)('queue should', () => {
    (0, vitest_1.test)("Queue 1 item", async () => {
        const ans = await (0, queue_1.queue)({ limit: 1 }, [1, 2, 3].map((i) => async () => i));
        (0, vitest_1.expect)(ans).toEqual([1, 2, 3]);
    });
    (0, vitest_1.test)("Queue 1 length", async () => {
        const ans = await (0, queue_1.queue)({ limit: 1 }, [1].map((i) => async () => i));
        (0, vitest_1.expect)(ans).toEqual([1]);
    });
    (0, vitest_1.test)("Queue 2 length", async () => {
        const ans = await (0, queue_1.queue)({ limit: 2 }, [1].map((i) => async () => i));
        (0, vitest_1.expect)(ans).toEqual([1]);
    });
    (0, vitest_1.test)("Queue delay", async () => {
        const order = [];
        const ans = await (0, queue_1.queue)({ limit: 1 }, [3, 2, 1].map((i) => async () => {
            const done = await new Promise((resolve) => {
                setTimeout(() => resolve(i), i * 100);
            });
            order.push(done);
            return i;
        }));
        (0, vitest_1.expect)(ans).toEqual([3, 2, 1]);
        (0, vitest_1.expect)(order).toEqual([3, 2, 1]);
    });
    (0, vitest_1.test)("Queue delay 2", async () => {
        const order = [];
        const ans = await (0, queue_1.queue)({ limit: 2 }, [3, 2, 1].map((i) => async () => {
            const done = await new Promise((resolve) => {
                setTimeout(() => resolve(i), i * 100);
            });
            order.push(done);
            return i;
        }));
        (0, vitest_1.expect)(ans).toEqual([3, 2, 1]);
        (0, vitest_1.expect)(order).toEqual([2, 3, 1]);
    });
});
(0, node_test_1.describe)('queue and flat should', () => {
    (0, vitest_1.test)('Flat results', async () => {
        (0, vitest_1.expect)(await (0, queue_1.queueAndFlat)({}, [[1, 2], [2, 3], [3, 4]].map((i) => async () => i)))
            .toEqual([1, 2, 2, 3, 3, 4]);
    });
});
//# sourceMappingURL=queue.spec.js.map