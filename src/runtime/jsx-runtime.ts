import EventNames from "./EventNames";

export { createMultiChildElement as jsxs, createElement as jsx };

function createMultiChildElement(
  type: keyof HTMLElementTagNameMap | FreactComponentConstructor,
  attr: ElementAttributes
): HTMLElement {
  return createElementCommon(type, attr, "multi");
}

function createElement(
  type: keyof HTMLElementTagNameMap | FreactComponentConstructor,
  attr: ElementAttributes
): HTMLElement {
  return createElementCommon(type, attr, "single");
}

function createElementCommon(
  type: keyof HTMLElementTagNameMap | FreactComponentConstructor,
  attr: ElementAttributes,
  mode: "multi" | "single"
): HTMLElement {
  let thisEl: HTMLElement;
  if (typeof type === "string") {
    thisEl = document.createElement(type);
  } else {
    thisEl = new type(attr).element;
  }

  const { children, ...attributes } = attr;

  if (Array.isArray(children)) {
    mode = "multi";
  }

  if (mode === "multi" && children) {
    for (const child of children) {
      if (child instanceof HTMLElement) {
        thisEl.appendChild(child);
      } else {
        thisEl.append(child);
      }
    }
  } else if (children != undefined) {
    if (children instanceof HTMLElement) {
      thisEl.appendChild(children);
    } else {
      thisEl.append(children);
    }
  }

  for (const attribute in attributes) {
    if (EventNames.includes(attribute.toLowerCase())) {
      // Add events
      const eventName = attribute.slice(2).toLowerCase();
      thisEl.addEventListener(eventName, attributes[attribute]);
      continue;
    }
    const [isAttribute, attributeName] = isDomAttribute(attribute);
    if (isAttribute) {
      thisEl.setAttribute(attributeName, attributes[attribute]);
    }
  }

  return thisEl;
}

const isDomAttribute = (attr: string): [boolean, string] => {
  if (attr == "className") {
    return [true, "class"];
  }
  if (attr.startsWith("_")) {
    return [true, attr.slice(1)];
  }

  return [false, ""];
};

interface ElementAttributes {
  children?: FreactElement[] | any;
  [k: string]: any;
}

interface FreactComponentConstructor {
  new (props: any): { element: HTMLElement };
}

export type FreactElement = {
  type: keyof HTMLElementTagNameMap | FreactComponentConstructor;
  children: FreactElement[] | any;
  attributes: { [k: string]: any };
  node: HTMLElement;
  marker: "FreactElement";
};
