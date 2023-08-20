import {expect, test} from 'vitest'
import {queue, queueAndFlat} from "./queue";
import {describe} from "node:test";

describe('queue should', () => {
  test("Queue 1 item", async () => {
    const ans = await queue(
      {limit: 1},
      [1, 2, 3].map((i) => async () => i)
    );
    expect(ans).toEqual([1, 2, 3]);
  });

  test("Queue 1 length", async () => {
    const ans = await queue(
      {limit: 1},
      [1].map((i) => async () => i)
    );
    expect(ans).toEqual([1]);
  });

  test("Queue 2 length", async () => {
    const ans = await queue(
      {limit: 2},
      [1].map((i) => async () => i)
    );
    expect(ans).toEqual([1]);
  });

  test("Queue delay", async () => {
    const order: number[] = [];
    const ans = await queue(
      {limit: 1},
      [3, 2, 1].map((i) => async () => {
        const done = await new Promise<number>((resolve) => {
          setTimeout(() => resolve(i), i * 100);
        });
        order.push(done);
        return i;
      })
    );
    expect(ans).toEqual([3, 2, 1]);
    expect(order).toEqual([3, 2, 1]);
  });

  test("Queue delay 2", async () => {
    const order: number[] = [];
    const ans = await queue(
      {limit: 2},
      [3, 2, 1].map((i) => async () => {
        const done = await new Promise<number>((resolve) => {
          setTimeout(() => resolve(i), i * 100);
        });
        order.push(done);
        return i;
      })
    );
    expect(ans).toEqual([3, 2, 1]);
    expect(order).toEqual([2, 3, 1]);
  });
})

describe('queue and flat should', () => {
  test('Flat results', async () => {
    expect(await queueAndFlat({}, [[1, 2], [2, 3], [3, 4]].map((i) => async () => i)))
      .toEqual([1,2,2,3,3,4])
  })
})