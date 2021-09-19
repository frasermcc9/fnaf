import { setAttributes } from "../modules/Attributes";

export { createMultiChildElement as jsxs, createElement as jsx };

function createMultiChildElement(
  type: keyof HTMLElementTagNameMap | FreactComponentConstructor,
  attr: ElementAttributes
): FreactElement {
  return createElementCommon(type, attr, "multi");
}

function createElement(
  type: keyof HTMLElementTagNameMap | FreactComponentConstructor,
  attr: ElementAttributes
): FreactElement {
  return createElementCommon(type, attr, "single");
}

function createElementCommon(
  type: keyof HTMLElementTagNameMap | FreactComponentConstructor,
  attr: ElementAttributes,
  mode: "multi" | "single"
): FreactElement {
  let thisEl: HTMLElement;
  if (typeof type === "string") {
    thisEl = document.createElement(type);
  } else {
    thisEl = new type();
  }

  const { children, ...attributes } = attr;

  if (Array.isArray(children)) {
    mode = "multi";
  }

  if (mode === "multi" && children) {
    for (const child of children) {
      if (isFreactElement(child)) {
        const node = child.node;
        thisEl.appendChild(node);
      } else {
        thisEl.append(child);
      }
    }
  } else if (children) {
    if (isFreactElement(children)) {
      const node = children.node;
      thisEl.appendChild(node);
    } else {
      thisEl.append(children);
    }
  }

  const attributesToSet: any = {};
  for (const attribute in attributes) {
    if (eventNames.includes(attribute.toLowerCase())) {
      const eventName = attribute.slice(2).toLowerCase();
      thisEl.addEventListener(eventName, attributes[attribute]);
    } else {
      attributesToSet[attribute] = attributes[attribute];
    }
  }

  setAttributes(thisEl, attributesToSet);

  return {
    type,
    attributes,
    children: children ?? [],
    node: thisEl,
    marker: "FreactElement",
  };
}

function isFreactElement(el: any): el is FreactElement {
  return (el as FreactElement).marker === "FreactElement";
}

interface ElementAttributes {
  children?: FreactElement[] | any;
  [k: string]: any;
}

interface FreactComponentConstructor {
  new (): HTMLElement;
}

export type FreactElement = {
  type: keyof HTMLElementTagNameMap | FreactComponentConstructor;
  children: FreactElement[] | any;
  attributes: { [k: string]: any };
  node: HTMLElement;
  marker: "FreactElement";
};

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
