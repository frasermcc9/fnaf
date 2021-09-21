const eventNames = [
  ...new Set(
    [
      ...Object.getOwnPropertyNames(document),
      ...Object.getOwnPropertyNames(
        Object.getPrototypeOf(Object.getPrototypeOf(document))
      ),
      ...Object.getOwnPropertyNames(Object.getPrototypeOf(window)),
    ].filter(
      (k) =>
        k.startsWith("on") &&
        (document[k as keyof Document] == null ||
          typeof document[k as keyof Document] == "function")
    )
  ),
];

export default eventNames;
