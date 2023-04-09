/* eslint-disable @typescript-eslint/no-explicit-any */
export const promisify = <T extends (...args: any[]) => any>(fn: T) => {
  return (...args: Parameters<T>) =>
    new Promise<ReturnType<T>>((resolve, reject) => {
      fn(...args, (err: any, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
};
/* eslint-enable */
