// tslint:disable-next-line:ban-types
export default function callbackify(func: (...args: any[]) => Promise<any>): Function {
  return (...args: any[]) => {
    const onlyArgs: any[] = [];
    // tslint:disable-next-line:ban-types
    let maybeCallback: Function | null = null;

    for (const arg of args) {
      if (typeof arg === 'function') {
        maybeCallback = arg;
        break;
      }

      onlyArgs.push(arg);
    }

    if (!maybeCallback) {
      throw new Error('Missing callback parameter!');
    }

    const callback = maybeCallback;

    func(...onlyArgs)
      .then((data: any) => callback(null, data))
      .catch((err: any) => callback(err));
  };
}
