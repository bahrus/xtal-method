# \<xtal-method\>

A significant subset of the web development community is enamored with the concept of bringing the power of  [server-side templating engines](https://www.w3schools.com/asp/razor_cs_loops.asp), combined with [functional concepts](http://fxsl.sourceforge.net/articles/FuncProg/Functional%20Programming.html), to the client.  But which of the competing templating engines to use?  I like the approach adopted by [Skate](https://skatejs.netlify.com/)

>For this reason, Skate provides a hook to inject renderers for any view library

\<xtal-method\> adopts the same philosophy, but sets its aim much lower (and is ultimately helping with a different problem).  It views itself as a helper element web component, similar in concept to \<dom-if\> or \<dom-repeat\> or \<iron-list\>, but where the expression syntax has the full breadth of ES6+ JavaScript (which doesn't currently include JSX, but does include the letter h). For example, it allows you to define the markup based on (tagged) literal templates. 

xtal-method is a ~690B gzipped and minified, dependency free web component.  

With \<xtal-method\>, one pairs up  an input JavaScript object with a functional renderer, and their offspring is HTML (or SVG).  The output of the transformation becomes a child of the element.

\<xtal-method\> only has two key, required properties for anything to happen:  input and renderer.

As the input property of \<xtal-method\> is established and then changes, the renderer generates the html output, and inserts it inside the \<xtal-method\> element instance, or updates the same target element as the input property changes.  A "dom-change" event fires after each DOM update.

The renderer property of \<xtal-method\> is of type function, a function that takes two arguments -- an object or array which needs to be presented, and a formatter function that generates a DOM (or SVG) node tree.  The renderer property can be passed to the element instance via traditional binding:

```html
    <xtal-method input="[[todos]]" renderer="[[todoFormatter]]"></xtal-method>
``` 

## Just don't call me late-to-supper

Usually, giving a semantic name to a custom element is fairly straightforward. Especially if they are visual -- elliptical-chart, mobius-grid, pissed-off-cat -- those are easy to read and comprehend.  But what do you call something that takes an input, a function, and generates an output?

If you don't care for the chemical metaphor used here, you can call it whatever you want.

If you are an Elvis fan, you can use:

```html
<love-me-render input="[[todos]]" renderer="[[todoFormatter]]"></love-me-render>
```

Or maybe you want to code with attitude:

```html
<garbage-in-garbage-out input="[[todos]]" renderer="[[todoFormatter]]"></garbage-in-garbage-out>
```

As long as you stick to lisp-case, you are good!

Ideally, with ES6 Imports, you could just import this js, and extend it:

```JavaScript
customElements.define('love-me-render', class extends XtalMethod{});
```

But because this isn't using ES6 Modules (yet), and I didn't want to pollute the global namespace with the name of this class, you can add the attribute data-as to the script reference:

```JavaScript
<script>
    <script src="path/to/xtal-method.js" data-as="love-me-render"></script>
</script>
```

Even if you give it a new name, the "canonical" name, xtal-method, will still work.  If you are building a reusable component, and that component leverages this one in its template markup, you should stick with the canonical name.  

## Inline Markup

Keeping the markup simple, as shown above, where the renderer function is passed in as a property, will work just fine, except it will force the developer to go on a bit of a scavenger hunt to find where the renderer was set.  The option to define the formatter inline, as shown below, is meant to eliminate that nuisance.



This package also contains a second custom element, xtal-import-export, which allows us to define the renderer (and even the input) inline.

For example, here we see an untagged literal template, with no helper library, being used to set the innerHTML of the element:

```html
            <xtal-method input="[[todos]]">
              <xtal-import-export>
                <script type="module ish">
                    const todoFormatterVulnerableToSecurityHacks = items => `
                    Generated with no helper library:<br>
                    <ul>
    ${items.map(item => `
                        <li>${item.value}</li>
    `).join('')}
                    </ul>
                    `
                    export const renderer = (list, target) => {
                    target.innerHTML = todoFormatterVulernableToSecurityHacks(list);
                    }
                </script>
              </xtal-import-export>
            </xtal-method>
```

xtal-import-export is also similarly renamable.  It is an 840B (gzipped and minified) dependency free web component.

**NB**:  Code like what is shown above is quite vulnerable to hacking, especially if you can't trust the source of the data in your todo list.  If the todo list changes frequently, performance will be sub optimal, at least with current browsers, and it wouldn't integrate nicely with modern binding frameworks.  If these features aren't critical at first (e.g. during the initial prototyping), then it should be possible to switch to one of the more robust solutions mentioned below when the time is right (ideally before it goes to production) witout many changes.

Almost certainly you will want to use a library where such issues are thought through, like [lit-html](https://alligator.io/web-components/lit-html/) or [hyperHTML](https://medium.com/@WebReflection/hyperhtml-a-virtual-dom-alternative-279db455ee0e).  

For example let's see how we can use lit-html to render the to-do list example from the lit-html link above.

```html
<xtal-method input="[[todos]]">
    <xtal-import-export>
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
    </xtal-import-export>
</xtal-method>
                
```



The script tag inside the \<xtal-import-export\> allows us to specify these two properties (and more discussed below) via the **export const =**  syntax.  I.e. all the export const's inside the script tag are used to set properties of the parent elment instance,  \<xtal-method\> in this case.  So you could, if you want, not *just* specify the renderer property, but you could *also* set the initial input property in the same way.  This allows the server to pass the original state as part of the document.  This might be useful for the first paint display, and then the input property of the custom element can change based on ajax calls prompted by user actions for subsequent renders:

```html
<xtal-method>
    <xtal-import-export>
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
    </xtal-import-export>
</xtal-method>
```

Another approach to server-side generated content is discussed farther down.

## Syntax Shenanigans

It is highly desirable that the contents of the script tag **not** be processed by the browser before being manipulated by \<xtal-method\>, as it is a waste of processing and a potential source of unintended side effects (like generating an error in the console when unexpected syntax is encountered).  There are a number of ways this can be done, with the pro's and con's listed below:

1. Wrap the script tag inside a template tag.  \<xtal-method\> supports this.  It is probably my preferred approach, except for one major stumbling block:  It appears that my favorite Polymer component, \<dom-bind\>, purges tags it perceives to be active script tags, if they are inside a template wrapper.  Don't quote me on this, this is simply what I've observed via trial and error.  As the demo relies heavily on dom-bind (so the entire demo can be declarative-ish), and I use this tag repeatedly, this immediately poses a problem in my mind, which is why the following alternatives are listed (and used in the demo).
2. Give the script tag attribute *type* a value no one has heard of, like type="text/lit-html".  No need for the template wrapper, then.  \<xtal-method\> also supports this. The problem is that VS Code / GitHub / WebComponents site stops providing syntax highlighting / basic linting when doing this.  More sophisticated editors, like WebStorm, can be trained to recognize custom attributes via a feature called language injection.  Of course a VS code extension could also be built, but that seems like overkill.  Anyway, despite all these negatives, this solution should work, at least, with a high degree of confidence.
3. Give the script tag attribute *type* a value that the browser will (hopefully) **not** recognize as JavaScript, but your favorite editor / markdown viewer is fooled into thinking **is** JavaScript.  For VS Code, and markdown displays, an example of such a value is (currently) type="module ish", which is shown above. I plan to try this out for a while in different browsers (as they start to support dynamic imports).  Hopefully no one will bring this loophole to the VS Code team's attention (shh!!!).

### Boilerplate Busting with Script inserts

There will tend to be some amount of repetition between instances of this web component, assuming the same rendering library is used more than once.

In particular, the import statements will be the first candidate for sharing.

To share fragments of Javascript, define each shareable fragment within a script tag with a unique id:

```html
  <script type="module ish" id="_root_lit_html">
    const root = 'https://cdn.jsdelivr.net/npm/lit-html/';
  </script>
  <script type="module ish" id="_lit_html">
      const { html, render } = await import(root + 'lit-html.js');
  </script>
  <script type="module ish" id="_lit_repeat">
    const { repeat } = await import(root + 'lib/repeat.js');
  </script>
```

Placing these in one central location, perhaps in the header of index.html (if applicable) seems like a pattern to adopt.  

And then reference it as follows:

```html
<xtal-method input="[[todos]]">
    <xtal-import-export>
    <script type="module ish">
        XtalIMEX.insert(_root_lit_html, _lit_html, _lit_repeat);
        const todoFormatter = items => html`
            <h1>My Todos</h1>
            <ul>
                                                            ${repeat(items, item => item.id,  item => html`
                <li class="${item.done ? 'done' : ''}">
                    ${item.value}
                </li>
                                                            `)}
            </ul>
        `;
        export const renderer = (list, target) => render(todoFormatter(list), target);
    </script>
    </xtal-import-export>
</xtal-method>
```

Note the static method call:  Xtal.insert.  This inserts the inner text of the script tags with the id's _root_lit_html, _lit_html, _lit_repeat defined in the header above.

## Server-side rendering of initial paint

By default, \<xtal-method\> dynamically creates a div element with attribute role="target" as the rendering target, and appends it inside the \<xtal-method\> tag.  This serves as the target element for where to dump the html (or svg) each time the input changes.

However, it may be desirable to improve the time to first paint by generating the initial HTML on the server, and not providing any input object initially, until user interaction requires an update.

In this case, during design time, or when dynamically generating the HTML document, insert the initial html as another inner element within the \<xtal-method\>, starting from a single root tag.  The root tag of that html should have attribute role="target" (and doesn't have to be a div). 

### How does this work, and why should I care?

Because this component manipulates the text of the script tag a bit, and then  does an eval, there is a slight performance hit. The performance hit from eval seems [surprisingly small](https://jsperf.com/function-vs-constructor-vs-eval).  Perhaps the more significant (but still slight) overhead is in applying regular expression / string searches / replaces on the JavaScript code. Note that we are *not* doing any full parsing of the JavaScript.  We're leaving that for the browser.  

Hopefully the benefits in terms of developer productivity outweigh the performance cost (and of course, this needs to be compared to other ways of using functional renderers).

Still, if this performance is a concern, a build process could be established to do that string manipulating during the build / optimization process. Anyway, such a process is also needed to support downstream browsers that don't support dynamic import or ES6. 

More on this topic to come. 

###  Inverse Functional derendering

If SSR is used, and the initial state needs to be something that other components can bind to, typically this would require sending both the formatted HTML *and* the JSON from which the HTML was derived down the wire.  That's an unfortunate hit on performance.

So two additional features are defined for eliminating this performance hit:  reverse-render and the init-state-changed event.

*derender* is a property of type function.  The user specifies a function, which will take the rendered (first paint) html (or svg) and "reverse engineer" the markup, by extracting out the data and turning it into a plain old JavaScript object, which when applying the renderer function would produce the same results.  Mathematically, it is the "inverse" of the renderer function.  The result of applying the derender function is broadcast as a custom event with name "init-state-changed," which hosting web components (Polymer being a prime example here) can listen for and bind to.  The markup can look like this:

```html
<xtal-method input="[[todos]]" init-state="{{originalTodoList}}">
    <xtal-import-export>
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
    </xtal-import-export>
<xtal-method>
```

When *xtal-method* is passed the input object, it checks if it is the same as the init-state object.   If it is, it deletes the init-state property, but doesn't rerender.

## Esoteric arm-chair musings.  Take with a grain of salt, i.e. ignore 

Be aware, however, that there are two distinct ways this feature can be used, and the developer should have a very clear view of what scenario applies to them. 

### Scenario 1.  Non cacheable index.html

I suspect this scenario is rare in practice, but who knows?  Let's say you are a news site, like CNN, highly fluid content, maybe you insist 99% of the content should work without JavaScript.  (They don't really do this.  The stories are in fact encoded in JSON data, not directly in the html.  If you disable JavaScript, you'll see what I mean.  On the other hand, Fox News seems to be 100% HTML.  Are conservatives more progressive?) It might stand to reason, then, that the root url should map to a non cacheable index.html, which isn't a file, but a dynamic stream generated by something like node/express or asp.net or a servlet or php or ... you get the idea.  

Suppose now that you want to have the ability to update certain headlines, or photo captions on the fly.  This would mean that an efficient (re)rendering function / derendering function may be useful.  

In this case, including the renderer / derendering function *inline*, in index.html would be wasteful, as it won't be able to be cached.  So it would be better to use the "traditional" approach mentioned earlier:

```html
    <html>
        <head>
            <script async src="cacheableNewsUpdaterEngine.js"></script>
        </head>
        <body>
            <xtal-method id="NewsUpdateManager">
                <ul role="target">
                    <li role="firstColumn">
                        <div role="topStory">
                        <img role="mainImage" src="someMainImage.png">
                        <span role="summary">Fierce Wildfires feast on Southern California</span>
                    </li>
                    ...
                </ul>
            </xtal-method>
        </body>
    </html>
```

The "cacheableNewsUpdaterEngine.js" is some cacheable script file (or collection of such files).  There are two actors in this dance:  The cacheableNewsUpdateEngine code (the "Manager") and the xtal-method code (the "Component") 

1)  Manager:  Loads the javascript for the xtal-method custom element.
2)  Manager:  Defines functions that can render and derender the content of the news feed.
3)  Manager: Finds the xtal-method element by id, and sets the renderer and derenderer functions.
4)  Manager:  Checks if the init-state property is set of the component.  If not, attaches an event listener for init-state-changed.
5)  Component:  After retrieving the original html, and the derenderer function, the derenderer function examines the original html content, and "derenders" it into a JavaScript array/objects, and that is passed via the init-state-changed event to the listener in step 4.
6)  Manager:  On receiving the init state,  object is placed in Manager's data store.  
7)  Manager:  Sets up a subscription so when the manager's data store is updated, it will update the component's input property. 
8)  Manager: Using some polling or server-sent-events, or websockets, the javascript is informed from the server that there's been an update to the top story but no other changes.  Only the top story update is sent down to the browser.  
9)  Manager:  Updates its store, which then gets passed to the input property of the component.  
10)  Component:  The renderer updates the UI (efficiently) based on the new input.


### Scenario 2.

A cacheable template of static markup needs to insert some dynamic content inside a div, perhaps based on some user input (like filters).  Then we need to update that content a little as the user edits things.  

Since the template is cacheable, we can now feel free to inline the renderer and derenderer functions near the element right next to the div that contains the dynamic html.

But is there really any advantage of having a derenderer?  I.e. in this scenario, is it faster to let the server build the html, and extract out the json from the html using a derenderer, or take the more traditional approach of the server generating json, and the client generating the html? 

From a code maintenance point of view, it's almost certainly easier to do it all in the client.  I.e. stick with JSON.  This is probably the biggest explanation for why we had a stampede of logic flowing from the server to the client since 2005, and API's turned pure JSON-based.  Until Twitter [spotted the problem](https://blog.twitter.com/engineering/en_us/a/2012/improving-performance-on-twittercom.html), AirBNB coined isomorphism, and later PWA's all made us start to rethink this. 

So if we are targeting mobile devices, and performance is of utmost concern, which is better?

The answer would depend on so many scenarios, but I look at it this way:

1)  The server is likely to spend an equivalent amount of time generating either format.  HTML might be a little more verbose than JSON, but then it can be compressed more efficiently, and streamed. So it is probably a wash.
2)  The CPU on the client will be about the same (just a guess, probably depends on a lot of things).
3)  Tie breaker:  If the server sends html, we can display that immediately, then yield the thread, then (even in a separate worker thread if we really want to complicate things) apply the inverse function to form the initial state. We only need that inital state if other pieces of the page are binding to it.  So why add extra work if it may not be needed?  We know the HTML is needed, but the initial state might not be. 

So based on this analysis, the advantage seems to go with generating html on the server, at least the first time.

Now, if we do need to bind on the client, and we cause incremental changes to the state, all within the browser, we have an efficient way of updating the UI, with the help of a smart renderer like lit-html or hyperHTML.

But what if we want to get a whole new batch of data from the server?  Does it improve perforance if we get the data in JSON format from the server after the first batch, rather than HTML?

Typically, if we are talking about a list, the data won't change that much.  The whole point of fancy renderers is they outperform setting innerHTML directly, as they can efficiently update only those parts that change.  So here I suspect one would want to switch to the more traditional approach, and retrieve JSON.

To help manage this complex song and dance, xtal-method will expose to its peers whether the content displayed is the original content or not.  This will allow other elemnts to know whether to retrieve HTML vs JSON should they agree that this analysis makes sense.

That markup could look as follows:

```html
<xtal-method>
    <xtal-import-export>
    <script type="module ish">
        
        XtalIMEX.insert(_root_lit_html, _lit_html, _lit_repeat); 
        const todoFormatter = items => html`
            <h1>My Todos</h1>
            <ul>
${repeat(items, item => item.id,  item => html`
                <li class="${item.done ? 'done' : ''}">${item.value}</li>
`)}
            </ul>
        `;
        export const renderer = (list, target) => render(todoFormatter(list), target);
        export const derenderer = el =>{
            const todos = [];
            el.querySelectorAll('li').forEach(element => {
                todos.push({
                    id: element.id,
                    value: element.innerText
                });
            });
            return todos;
        }
    </script>
    </xtal-import-export>
    <xtal-fetch fetch href="api/myTodos" role="target" as="text" insert-results>
    </xtal-fetch>
</xtal-method>
```  

What this example illustrates, though, is that we need to know *when* to do the derender.  One could use a mutation observer, but I think it is better to rely on a specific event from the custom element that retrieves the html.  It seems that Polymer has standardized on ["dom-change"](https://github.com/Polymer/polymer/blob/master/lib/elements/dom-repeat.html#L522) as the name for this event.  So the derenderer function will apply whenever it encounters the dom change event.
 




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
