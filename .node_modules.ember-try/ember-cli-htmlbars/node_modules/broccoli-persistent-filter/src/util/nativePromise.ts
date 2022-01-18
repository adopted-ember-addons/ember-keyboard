export default async function nativePromise<T>(promise: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    promise.then(resolve, reject);
  });
}