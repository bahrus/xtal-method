# \<xtal-method\>

<xtal-method>
<template>
</xtal-method>

The \<xtal-method\> web component (with no dependencies) allows one to utilize a functional renderer, like [lit-html](https://alligator.io/web-components/lit-html/) or [hyperHTML](https://medium.com/@WebReflection/hyperhtml-a-virtual-dom-alternative-279db455ee0e), without turning the entire application into one giant heap of JavaScript.  

With this component, one creates a localized link between an input object and a functional renderer.  The (tagged) literal template can be defined within the web component light children itself:

```html
<xtal-method input="[[todos]]">
    <template>
    <script type="text/ecmascript">
        const root = 'http://cdn.jsdelivr.net/npm/lit-html/';
        const { repeat } = await import(root + 'lib/repeat.js');
        const { html, render } = await import(root + 'lit-html.js');
        const todo = items => {
            return html`
                        <h1>My Todos</h1>
                        <ul>
                                                                                    ${repeat(items, item => item.id,item => html`
                          <li class="${item.done ? 'done' : ''}">${item.value}</li>
                                                                                    `)}
                        </ul>
                        `;
        };
        export const renderer = (list, target) => render(todo(list), target);

    </script>
    </template>
</xtal-method>
                
```

\<xtal-method\> only recognizes two properties currently:  input and renderer.

As the input property of \<xtal-method\> changes, the renderer will generate the html output, and insert it adjacent to the \<xtal-method\> element instance.

The script tag inside the \<xtal-method\> will apply all the export const's to the xtal-method tag.  So the initial input property can also be specified  (server-side generated)  within the script tag.  This might be useful for the first paint display, and then the input property of the custom element can change based on ajax calls prompted by user actions for subsequent renders:

```html
<xtal-method input="[[todos]]">
    <script type="text/ecmascript">
        const root = 'http://cdn.jsdelivr.net/npm/lit-html/';
        const { repeat } = await import(root + 'lib/repeat.js');
        const { html, render } = await import(root + 'lit-html.js');
        const todo = items => {
            return html`
                        <h1>My Todos</h1>
                        <ul>
                                                                                    ${repeat(items, item => item.id,item => html`
                          <li class="${item.done ? 'done' : ''}">${item.value}</li>
                                                                                    `)}
                        </ul>
                        `;
        };
        export const renderer = (list, target) => render(todo(list), target);

        //server-side generated?
        export const input = [
            { "id": 1, "value": "Sweep the floor", "done": false },
            { "id": 2, "value": "Prepare fancy salad", "done": true },
            { "id": 3, "value": "Get a funky haircut", "done": false }
        ]
    </script>
</xtal-method>
```

## Install the Polymer-CLI

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) installed. Then run `polymer serve` to serve your element locally.

## Viewing Your Element

```
$ polymer serve
```

## Running Tests

```
$ polymer test
```

Your application is already set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester). Run `polymer test` to run your application's test suite locally.
