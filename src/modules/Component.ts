export default abstract class FreactComponent<Props = {}, State = {}> {
  private readonly propState: Props;

  private readonly element: HTMLElement;

  private readonly effects: Effect<Props & State>[];
  private readonly state: {
    [K in keyof State]?: State[K];
  };

  constructor(props: Props) {
    this.effects = [];
    this.state = {};
    this.element = document.createElement("div");

    const tempPropState: Partial<Props> = {};
    for (const key in props) {
      const value = props[key];

      tempPropState[key] = value;
    }
    this.propState = tempPropState as Props;

    this.addEffects();
    for (const effect of this.effects) {
      effect.callback();
    }
    this.rerender();
  }

  abstract render(): HTMLElement;

  getProp<T extends keyof Props>(name: T): Props[T] | undefined {
    return this.propState[name];
  }

  getProps(): Partial<Props> {
    return this.propState;
  }

  async rerender() {
    const markup = this.render();
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
    this.element.appendChild(markup);
  }

  addEffects(): void {}

  useEffect(
    callback: () => (() => any) | Promise<() => any> | void | Promise<void>,
    dependencies?: (keyof Props | keyof State)[]
  ) {
    this.effects.push({
      callback,
      dependencies,
    });
  }

  runEffects(change: keyof State | keyof Props) {
    for (const effect of this.effects) {
      if (effect.dependencies === undefined) {
        effect.callback();
      } else if (effect.dependencies.includes(change)) {
        effect.callback();
      }
    }
  }

  useState<T extends keyof State>(
    name: T,
    initial: State[T]
  ): [() => State[T], (newValue: State[T]) => void] {
    const state = this.state[name];
    if (state === undefined) {
      this.state[name] = initial;
    }

    return [
      () => this.state[name]!,
      (val) => {
        this.state[name] = val;
        this.runEffects(name);
        this.rerender();
      },
    ];
  }
}

export type Effect<T> = {
  callback: () => (() => any) | Promise<() => any> | void | Promise<void>;
  dependencies?: (keyof T)[];
};

export type StateStore<S> = {
  [K in keyof S]?: S[K];
};
export type StateStoreValue<V, K extends keyof V> = [V[K], (newValue: V[K]) => void];
