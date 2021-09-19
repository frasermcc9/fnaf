import { FreactElement } from "../runtime/jsx-runtime";
import { getProps, registerEvent } from "./Attributes";

type BaseConstructor<P> = {
  props?: (keyof P)[];
  marshaller?: FreactMartial<P>;
  listeners?: FreactListener;
};

export default abstract class FreactComponent<
  Props,
  State = {}
> extends HTMLDivElement {
  private readonly marshaller;
  private readonly propState: Partial<Props>;
  private readonly listeners: FreactListener;

  private readonly effects: Effect<Props>[];
  private readonly state: {
    [K in keyof State]?: State[K];
  };

  constructor({
    props = [],
    marshaller = {},
    listeners = {},
  }: BaseConstructor<Props>) {
    super();

    this.marshaller = marshaller;
    this.propState = {};
    this.listeners = listeners;

    this.effects = [];
    this.state = {};

    const stringifiedProps = getProps(this, ...props);
    for (const keyUntyped in stringifiedProps) {
      const key = keyUntyped as keyof Props;
      const prop = stringifiedProps[key];

      if (!prop) {
        this.propState[key] = undefined;
        continue;
      }

      const attributeMartial = this.marshaller[key];
      if (attributeMartial?.unmarshal) {
        const typedProp = attributeMartial.unmarshal(prop);
        this.propState[key] = typedProp;
      } else {
        console.warn(
          `Cannot unmarshal value ${prop} for ${key} as there is no unmarshaller.`
        );
        this.propState[key] = prop as any;
      }
    }

    this.addEffects();

    const run = async () => {
      const promises = [];
      for (const effect of this.effects) {
        if (
          effect.dependencies === undefined ||
          effect.dependencies.length === 0
        ) {
          promises.push(effect.callback());
        }
      }
      await Promise.all(promises);
      await this.rerender();
    };
    run();
  }

  abstract render(): Promise<FreactElement | FreactElement>;

  private internalAttachListeners = (): void => {
    const listeners = this.listeners;

    for (const qs in listeners) {
      const events = listeners[qs] as any as Partial<HTMLElementEventMap>;
      for (const eventUntyped in events) {
        const event = eventUntyped as keyof HTMLElementEventMap;
        const callback = events[event];
        const target = this.querySelectorAll<HTMLElement>(qs);
        target.forEach((t) => registerEvent(t, event, callback as any));
      }
    }
  };

  async setProp<T extends keyof Props>(name: T, newValue: Props[T]) {
    let strName: string, strVal: string;
    if (typeof name !== "string") {
      console.warn(
        `Suspicious name for prop ${name} in ${this.constructor.name} that is not a string`
      );
      strName = name + "";
    } else {
      strName = name;
    }

    if (typeof newValue !== "string") {
      const marshaller = this.marshaller[name];
      if (marshaller?.marshal) {
        strVal = marshaller.marshal(newValue);
      } else {
        console.warn(
          `Value ${newValue} for ${name} of ${this.constructor.name} is not a string, and is not marshalled.`
        );
        strVal = newValue + "";
      }
    } else {
      strVal = newValue;
    }

    super.setAttribute(strName, strVal);
    await this.rerender();
  }

  getProp<T extends keyof Props>(name: T): Props[T] | undefined {
    return this.propState[name];
  }

  getProps(): Partial<Props> {
    return this.propState;
  }

  async attributeChangedCallback<T extends keyof Props>(
    name: T,
    oldValue: string,
    newValue: string
  ) {
    if (oldValue === newValue) {
      return;
    }

    const attributeMartial = this.marshaller[name];

    if (attributeMartial?.unmarshal) {
      const typed = attributeMartial.unmarshal(newValue);
      this.propState[name] = typed;
    } else {
      if (!["undefined", "string"].includes(typeof this.propState[name])) {
        console.warn(
          `Suspicious lack of unmarshaller for ${name} in ${
            this.constructor.name
          }, was of type ${typeof this.propState[name]}`
        );
      }

      this.propState[name] = newValue as any;
    }

    for (const effect of this.effects) {
      if (
        effect.dependencies === undefined ||
        effect.dependencies.includes(name)
      ) {
        effect.callback();
      }
    }

    await this.rerender();
  }

  async rerender() {
    const markup = await this.render();
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }
    this.appendChild(markup.node);

    this.internalAttachListeners();
  }

  addEffects(): void {}

  useEffect(
    callback: () => (() => any) | Promise<() => any> | void | Promise<void>,
    dependencies?: (keyof Props)[]
  ) {
    this.effects.push({
      callback,
      dependencies,
    });
  }

  useState<T extends keyof State>(
    name: T,
    initial: State[T]
  ): [() => State[T], (newValue: State[T]) => void] {
    const state = this.state[name];
    if (!state) {
      this.state[name] = initial;
    }

    return [
      () => this.state[name]!,
      (val) => {
        this.state[name] = val;
        this.rerender();
      },
    ];
  }
}

export type FreactListener = {
  [qs: string]: {
    [K in keyof HTMLElementEventMap]?: (ev: HTMLElementEventMap[K]) => any;
  };
};

export type StringMarshal<T> = (s: T) => string;
export type StringUnmarshal<T> = (s: string) => T;
export type FreactMartial<T> = {
  [K in keyof T]?: {
    marshal?: StringMarshal<T[K]>;
    unmarshal?: StringUnmarshal<T[K]>;
  };
};

export type Effect<T> = {
  callback: () => (() => any) | Promise<() => any> | void | Promise<void>;
  dependencies?: (keyof T)[];
};

export type StateStore<S> = {
  [K in keyof S]?: S[K];
};
export type StateStoreValue<V, K extends keyof V> = [
  V[K],
  (newValue: V[K]) => void
];
