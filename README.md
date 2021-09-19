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

Components should extend the FreactComponent class. The component should also be defined as a custom element in your entry file 

```ts
// index.ts
customElements.define("my-component", MyComponent, { extends: "div" });
```

Props are supported, but they are stored as HTML attributes. This means they should be strings. In the near future I will probably change this behaviour so any type is supported. Non-string primitive types can sort of be worked with through the use of the marshal functionality provided in the Component superclass.

## The Name
The F stands for Freact. It is a portmanteau of Fraser (my name) and React (in which this is pathetically inspired by). The F can also stand for free, in that it is freeing me from using vanilla JS (although this is still Vanilla JS, I emphasize that this is not a framework or a library).