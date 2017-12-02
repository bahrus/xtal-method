# \<xtal-method\>

<xtal-method>
<template>
</xtal-method>

The \<xtal-method\> web component (with no dependencies) allows one to utilize a functional renderer, like lit-html or HyperHTML, without turning the entire application into one giant heap of JavaScript.  

With this component, one creates a localized link between an input object and a functional renderer.  The (tagged) literal template can be defined within the web component light children itself:

```html
            <xtal-method input="[[todos]]">
              <script type="application/lit-html">
                const root = 'http://cdn.jsdelivr.net/npm/lit-html/';
                const { repeat } = await import(root + 'lib/repeat.js');
                const { html, render } = await import(root + 'lit-html.js');
                const todo = items => {
                    return html`
                                <h1>My Todos</h1>
                                <ul>
                                    ${repeat(
                        items,
                        item => item.id,
                        item => html`
                                        <li class="${item.done ? 'done' : ''}">${item.value}</li>
                                    `
                    )}
                                </ul>
                                `;
                };
                export const renderer = (list, target) => render(todo(list), target);
            </script>
        </xtal-method>
                
```
As the input property of \<xtal-method\> changes, the renderer will generate the html output, and insert it adjacent to the \<xtal-method\> element instance.


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
