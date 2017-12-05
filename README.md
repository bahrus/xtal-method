# \<xtal-method\>

The \<xtal-method\> web component is a dependency free custom element that allows one to utilize a functional renderer, like [lit-html](https://alligator.io/web-components/lit-html/) or [hyperHTML](https://medium.com/@WebReflection/hyperhtml-a-virtual-dom-alternative-279db455ee0e), without turning the entire application into one giant heap of JavaScript.  

With this component, one creates a localized inline connection between an input JavaScript object and a functional renderer directly in the markup.  The output of the transformation becomes a child of the element.  So everything is together when inspecting the DOM. 

Is a custom element required in order to accomplish the localness feature of \<xtal-method\>?  Alas, no, not when support for support for [import.meta](http://2ality.com/2017/11/import-meta.html) becomes widespread.  I think.  Still, the hope is that this custom element will reduce annoying boilerplate code, as we shall see.  

The (tagged) literal template can be defined via a web component light child (innerHTML of the element):

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



\<xtal-method\> only has two key, required properties for anything to happen:  input and renderer.

As the input property of \<xtal-method\> is established and then changes, the renderer will generate the html output, and insert it inside the \<xtal-method\> element instance, or update the same target element as the input property changes.  A "dom-change" event will fire after each DOM update.

The renderer property of \<xtal-method\> takes two arguments -- an object or array which needs to be presented, and a formatter function that generates a DOM (or SVG) node tree.  The renderer property can be passed to the element instance via traditional binding:

```html
    <xtal-method input="[[todos]]" renderer="[[todoFormatter]]"></xtal-method>
```

This will work just fine, except it will force the developer to go on a scavenger hunt to find where the formatter was set.  The option to define the formatter inline, as shown throughout this discussion, is meant to eliminate that nuisance.

The script tag inside the \<xtal-method\> allows us to specify these two properties (and more discussed below) via the **export const =**  syntax.  I.e. all the export const's inside the script tag are used to set properties of the \<xtal-method\> element instance.  So you could, if you want, not just specify the renderer property, but you could also set the initial input property in the same way.  This allows the server to pass the original state as part of the document.  This might be useful for the first paint display, and then the input property of the custom element can change based on ajax calls prompted by user actions for subsequent renders:

```html
<xtal-method>
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

Another approach to server-side generated content is discussed farther down.

## Syntax Shenanigans

It is highly desired that the contents of the script tag **not** be processed by the browser before being manipulated by the \<xtal-method\> as it is a waste of processing and a potential source of unintended side effects (like generating an error in the console when unexpected syntax is encountered).  There are a number of ways this can be done, with the pro's and con's listed below:

1. Wrap the script tag inside a template tag.  \<xtal-method\> supports this.  It is probably my preferred approach, except for one major stumbling block:  It appears that my favorite Polymer component, \<dom-bind\>, purges tags it perceives to be active script tags, if they are inside a template wrapper.  Don't quote me on this, this is simply what I've observed via trial and error.  As the demo relies heavily on dom-bind (so the entire demo can be declarative-ish), and I use this tag repeatedly, this immediately poses a problem in my mind, which is why the following alternatives are listed (and used in the demo).
2. Give the script tag attribute *type* a value no one has heard of, like type="text/lit-html".  No need for the template wrapper, then.  \<xtal-method\> also supports this. The problem is that VS Code / GitHub / WebComponents site stops providing syntax highlighting / basic linting when doing this.  More sophisticated editors, like WebStorm, can be trained to recognize custom attributes via a feature called language injection.  Of course a VS code extension could also be built, but that seems like overkill.  Anyway, despite all these negatives, this solution should work, at least, with a high degree of confidence.
3. Give the script tag attribute *type* a value that the browser will (hopefully) **not** recognize as JavaScript, but your favorite editor / markdown viewer is fooled into thinking **is** JavaScript.  For VS Code, and markdown displays, an example of such a value is (currently) type="module ish", which is shown above. I plan to try this out for a while in different browsers (as they start to support dynamic imports).  Hopefully no one will bring this loophole to the VS Code team's attention (shh!!!).

### Boilerplate Busting with Script inserts

There will tend to be some amount of repetition between instances of this web component, assuming the same rendering library is used more than once.

In particular, the import statements will be the first candidate for sharing.

To share fragments of Javascript, define each shareable fragment within a script tag with a unique id:

```html
  <script type="module ish" id="root-lit-html">
    const root = 'https://cdn.jsdelivr.net/npm/lit-html/';
  </script>
  <script type="module ish" id="lit-html">
      const { html, render } = await import(root + 'lit-html.js');
  </script>
  <script type="module ish" id="lit-html/lib/repeat">
    const { repeat } = await import(root + 'lib/repeat.js');
  </script>
```

Placing these in one central location, perhaps in the header of index.html (if applicable) seems like a good place to put this.  

And then reference it as follows:

```html
<xtal-method input="[[todos]]">
    <script type="module ish">
        scriptTag=>XtalMethod.insert(scriptTag, '#root-lit-html,#lit-html,#lit-html/lib/repeat'); //https://github.com/mishoo/UglifyJS2/issues/671
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

The second argument, of type string, of 'xtalMethod.insert(),' is an extremely limited pseudo css selector.  To specify multiple script tags by id, use the css comma delimiter.  Fragments will be inserted in the order of the list.

## Server-side rendering of initial paint

By default, \<xtal-method\> dynamically creates a div element with attribute role="target" as the rendering target, and appends it inside the \<xtal-method\> tag.  This serves as the target element for where to dump the html (or svg) each time the input changes.

However, it may be desirable to improve the time to first paint by generating the initial HTML on the server, and not providing any input object initially, until user interaction requires an update.

In this case, during design time, or when dynamically generating the HTML document, insert the initial html as another light child within the \<xtal-method\>, starting from a single root tag.  The root tag of that html should have attribute role="target" (and doesn't have to be a div). 

###  Inverse Functional derendering

If SSR is used, and the initial state needs to be something that other components can bind to, typically this would require sending both the formatted HTML *and* the JSON from which the HTML was derived down the wire.  That's an unfortunate hit on performance.

So two additional features are defined for eliminating this performance hit:  reverse-render and the init-state-changed event.

*derender* is a property of type function.  The user specifies a function, which will take the rendered (first paint) html (or svg) and "reverse engineers" the markup, by extracting out the data and turning it into a plain old JavaScript object, which when applying the renderer function would produce the same results.  Mathematically, it is the "inverse" of the renderer function.  The result of applying the derender function is broadcast as a custom event with name "init-state-changed," which hosting web components (Polymer being a prime example here) can listen for and bind to.  The markup can look like this:

```html
<xtal-method input="[[todos]]" init-state="{{originalTodoList}}">
    <script type="module ish">
        export const derenderer = (serverSideGeneratedHtml) =>{
            const todos = [];
            serverSideGeneratedHTML.querySelectorAll('li').forEach(liEl =>{
                const todo = {
                    value = liEl.innerText
                };
                todos.push(todo);
            });
            return todos;  
        }
    </script>
<xtal-method>
```

When *xtal-method* is passed the input object, it checks if it is the same as the init-state object.   If it is, it deletes the init-state property, but doesn't rerender.

Note that if generating html dynamically, this payload will typically be less cacheable.  In the extreme (but quite common) case that it is never cacheable, embedding the derenderer (and renderer) function as part of the HTML payload is counterproductive from a performance point of view.  In this case, it is best to pass in the derenderer remotely from a cacheable resource.

### How does this work, and why should I care?

Because this component manipulates the text of the script tag a bit, and does an eval, there is a slight performance hit. The performance hit from eval seems [suprisingly small](https://jsperf.com/function-vs-constructor-vs-eval).  Perhaps the more significant (but still slight) overhead is in applying regular expression / string searches / replaces on the JavaScript code. Note that we are *not* doing any full parsing of the JavaScript.  We're leaving that for the browser.  

Hopefully the benefits in terms of developer productivity outweighs the performance cost (and of course, this needs to be compared to other ways of using functional renderers).

Still, if this performance is a concern, a build process could be established to do that string manipulating during the build / optimization process. Anyway, such a process is also needed to support downstream browsers that don't support dynamic import or ES6. 

More on this topic to come. 


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
