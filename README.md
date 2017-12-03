# \<xtal-method\>

The \<xtal-method\> web component is a dependency free custom element that allows one to utilize a functional renderer, like [lit-html](https://alligator.io/web-components/lit-html/) or [hyperHTML](https://medium.com/@WebReflection/hyperhtml-a-virtual-dom-alternative-279db455ee0e), without turning the entire application into one giant heap of JavaScript.  

With this component, one creates a localized inline connection between an input JavaScript object and a functional renderer directly in the markup.  The (tagged) literal template can be defined via web component light child:

```html
<xtal-method input="[[todos]]">
    <script type="module ish">
        const root = 'http://cdn.jsdelivr.net/npm/lit-html/';
        const { repeat } = await import(root + 'lib/repeat.js');
        const { html, render } = await import(root + 'lit-html.js');
        const todoFormatter = items => html`
            <h1>My Todos</h1>
            <ul>
                                                                        ${repeat(items, item => item.id,  item => html`
                <li class="${item.done ? 'done' : ''}">${item.value}</li>
                                                                        `)}
            </ul>
        `;
        export const renderer = (list, target) => render(todoFormatter(list), target);

    </script>
</xtal-method>
                
```

\<xtal-method\> only recognizes two properties currently:  input and renderer.

As the input property of \<xtal-method\> changes, the renderer will generate the html output, and insert it adjacent to the \<xtal-method\> element instance.

The script tag inside the \<xtal-method\> will apply all the export const's to the xtal-method tag.  So the initial input property can also be specified  (server-side generated)  within the script tag.  This might be useful for the first paint display, and then the input property of the custom element can change based on ajax calls prompted by user actions for subsequent renders:

```html
<xtal-method input="[[todos]]">
    <script type="module ish">
        const root = 'https://cdn.jsdelivr.net/npm/lit-html/';
        const { repeat } = await import(root + 'lib/repeat.js');
        const { html, render } = await import(root + 'lit-html.js');
        const todoFormatter = items => html`
            <h1>My Todos</h1>
            <ul>
                                                                        ${repeat(items, item => item.id,  item => html`
                <li class="${item.done ? 'done' : ''}">${item.value}</li>
                                                                        `)}
            </ul>
        `;
        export const renderer = (list, target) => render(todoFormatter(list), target);

        //server-side generated?
        export const input = [
            { "id": 1, "value": "Sweep the floor", "done": false },
            { "id": 2, "value": "Prepare fancy salad", "done": true },
            { "id": 3, "value": "Get a funky haircut", "done": false }
        ]
    </script>
</xtal-method>
```

## Syntax Notes

It is highly desired that the contents of the script tag not be processed by the browser before being manipulated by the \<xtal-method\> as it is a waste of processing and a potential source of unintended side effects (like introducing a bunch of global variables).  There are a number of ways this can be done, with the pro's and con's listed below:

1. Wrap the script tag inside a template tag.  \<xtal-method\> supports this.  It is probably my preferred approach, except for one major stumbling block:  It appears that my favorite Polymer component, \<dom-bind\>, purges tags it perceives to be active script tags, even if they are inside a template wrapper.  Don't quote me on this, this is simply what I've observed via trial and error.  As the demo relies heavily on dom-bind (so the entire demo can be declarative), this immediately posed a problem, which is why the following alternatives are listed.
2. Give the script tag attribute *type* a value no one has heard of, like type="text/lit-html".  No need for the template wrapper, then.  \<xtal-method\> also supports this. The problem is that VS Code stops providing syntax highlighting / basic linting when doing this.  But it works with a high degree of confidence.
3. Give the script tag attribute *type* a value that the browser will (hopefully) not recognize as JavaScript, but your favorite editor is fooled into thinking it is JavaScript.  For VS Code, such a value is (currently) type="module ish", which is shown above. I plan to try this out for a while in different browsers (as they start to support dynamic imports).  Hopefully no one will bring this loophole to the VS Code editor's attention (shh!!!).

### Boilerplate Busting

There will tend to be some amount of repetition between instances of this web component, assuming the same rendering library is used more than once.

In particular, the import statements will be the first candidate for sharing.

To share fragments of Javascript, define a fragment of JavaScript thusly:

```html
<script type="module ish" id="lit-html-imports">
    const root = 'https://cdn.jsdelivr.net/npm/lit-html/';
    const { repeat } = await import(root + 'lib/repeat.js');
    const { html, render } = await import(root + 'lit-html.js');
</script>
```

(Place in header of index.html?)

And then reference it as follows:

```html
<xtal-method input="[[todos]]">
    <script type="module ish">
        xtal_in_hash_import('#lit-html-imports');
        const todoFormatter = items => html`
            <h1>My Todos</h1>
            <ul>
                                                                        ${repeat(items, item => item.id,  item => html`
                <li class="${item.done ? 'done' : ''}">${item.value}</li>
                                                                        `)}
            </ul>
        `;
        export const renderer = (list, target) => render(todoFormatter(list), target);

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
