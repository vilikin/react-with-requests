export const delayedReject = (value, delayMillis) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(value);
    }, delayMillis);
  });

export const delayedResolve = (value, delayMillis) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, delayMillis);
  });
