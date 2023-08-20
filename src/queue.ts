export async function queue<T>(
  options: {
    limit?: number
  },
  callbacks: (() => Promise<T>)[],
): Promise<T[]> {
  const limit = options.limit ?? 1;
  let counter = 0;
  let index = 0;
  let complete = 0;

  return new Promise((resolve, reject) => {
    const results = new Array(callbacks.length);

    const next = () => {
      const i = index++;
      if (i >= callbacks.length) throw `Invalid index ${i}`;
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

export async function queueAndFlat<T>(
  options: {
    limit?: number,
  },
  callbacks: (() => Promise<T[]>)[],
): Promise<T[]> {
  const ans = await queue(options, callbacks);
  return ans.flat();
}

