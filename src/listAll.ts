export const listAll = async <T, R>(
  callback: (next: string | undefined) => Promise<R>,
  getter: (response: R) => { NextToken: string | undefined, Items: T[] | undefined },
): Promise<T[]> => {
  let nextToken: string | undefined = undefined;
  let ans: T[] = [];

  do {
    const response0 = await callback(nextToken);
    const response = getter(response0);
    if (response.Items) {
      ans.push(...response.Items);
    }
    nextToken = response.NextToken;
  } while (nextToken != null)
  return ans;
}
