export default function pick(path, action) {
  return function (event) {
    let value = path.split('.').reduce((obj, key) => obj?.[key], event);

    if (!action) {
      return value;
    }

    action(value);
  };
}
