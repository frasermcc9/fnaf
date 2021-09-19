/**
 * Get the specified attributes from an HTML element
 * @param component the component to get the attributes from
 * @param props rest parameter of strings, indicating the names of the attributes
 * @returns An object keyed with the strings in props, and valued with the values given in the HTML tag.
 */
export const getProps = <T extends string | number | symbol>(
  component: HTMLElement,
  ...props: T[]
): { [key in T]?: string | null } => {
  const result: { [key in T]?: string | null } = {};
  for (const prop of props) {
    const value = component.getAttribute(prop + "");
    result[prop] = value;
  }
  return result;
};

export const setAttributes = <T extends {}>(el: HTMLElement, attrs: T) => {
  for (const key in attrs) {
    if (key === "className") {
      el.setAttribute("class", attrs[key] + "");
      continue;
    }
    el.setAttribute(key, attrs[key] + "");
  }
};

export const registerEvent = <E extends keyof HTMLElementEventMap>(
  applyTo?: HTMLElement | null,
  event?: E,
  callback?: (this: HTMLElement, ev: HTMLElementEventMap[E]) => any
) => {
  if (!applyTo || !event || !callback) return;
  applyTo.addEventListener(event, callback);
};
