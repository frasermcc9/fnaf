# FNAF

## Freact is Not a Framework (or Library)

My lecturers kept saying no frameworks or libraries. I was like, "I don't know what to do." So I made this, which is specifically not a library or framework.

## Do Not Use This

There is no reason to. Unless you aren't allowed to use a framework for some reason. Then you probably still shouldn't use this, but I won't stop you.

## Usage

Use a babel loader in webpack to transpile the code. FNAF uses JSX, so needs the transform JSX babel plugin.

```js
// babelrc.js
{
  "plugins": [
    [
      "@babel/plugin-transform-react-jsx",
      {
        "runtime": "automatic",
        "importSource": "/node_modules/fnaf/dist/runtime" // important
      }
    ]
  ],
  "presets": ["@babel/preset-typescript"]
}
```

Components should extend the FreactComponent class. FreactComponent is generic.
The first generic argument should be an interface of the component props. The
second argument is an interface representing the object state. See the example
at the bottom of the readme.

## The Name

The F stands for Freact. It is a portmanteau of Fraser (my name) and React (in
which this is pathetically inspired by). The F can also stand for free, in that
it is freeing me from using vanilla JS (although this is still Vanilla JS, I
emphasize that this is not a framework or a library).

## Example

```tsx
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
```
