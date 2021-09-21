import { FreactComponent } from ".";

class Root extends FreactComponent<
  {},
  { total: { count: number }; user: any }
> {
  addEffects() {
    // Creates stateful data named "user". The return array is destructured
    // into two functions. The first function gets the value, the second is
    // a setter used to change the state.
    const [_getUser, setUser] = this.useState("user", {});
    // The useState function accepts the name of the state, and a value
    // representing the initial state. If this state does not yet exist,
    // it will be given the initial.
    const [getTotal] = this.useState("total", { count: 0 });

    // will run whenever "total" changes.
    this.useEffect(() => {
      console.log(getTotal());
    }, ["total"]);

    // will run whenever the component is loaded
    this.useEffect(() => {
      (async () => {
        const data = await fetch(
          "https://random-data-api.com/api/users/random_user"
        );
        const user = await data.json();
        setUser(user);
      })();
    }, []);
  }

  render() {
    const [getTotal, setTotal] = this.useState("total", { count: 0 });
    const [getUser] = this.useState("user", {});

    const total = getTotal();
    const user = getUser();

    return (
      <div>
        <h1>Hello World</h1>
        <p>This is a paragraph</p>
        <Counter total={total} />
        <button
          className="text-xl shadow rounded bg-blue-400"
          onClick={() => setTotal({ count: total.count + 1 })}
        >
          Click me!
        </button>
        <div>
          <div>{user.first_name}</div>
        </div>
      </div>
    );
  }
}

class Counter extends FreactComponent<{ total: { count: number } }> {
  render(): HTMLElement {
    const count = this.getProp("total");
    return <div>{count?.count}</div>;
  }
}

document.getElementById("root")?.appendChild(<Root />);
