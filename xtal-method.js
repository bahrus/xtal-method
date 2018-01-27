(function () {
    /**
    * `xtal-method`
    * Create a localized link between an input object and a functional renderer
    *
    * @customElement
    * @polymer
    * @demo demo/index.html
    */
    class XtalMethod extends HTMLElement {
        constructor() {
            super(...arguments);
            // replaceAll(target: string, search: string, replacement: string) {
            //     //https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
            //     return target.split(search).join(replacement);
            // }
            //regExp = /(.*)export(\s+)const(\s+)[a-zA-Z]+(\s*)=/g;
            this.insertFragmentRegExp = /XtalMethod.insert\((.*)\);/g;
        }
        static get is() {
            return 'xtal-method';
        }
        set renderer(val) {
            this._renderer = val;
            this.render();
        }
        get renderer() {
            return this._renderer;
        }
        _upgradeProperty(prop) {
            if (this.hasOwnProperty(prop)) {
                let value = this[prop];
                delete this[prop];
                this[prop] = value;
            }
        }
        set derenderer(val) {
            this._derenderer = val;
            this.derender();
        }
        get derenderer() {
            return this._derenderer;
        }
        set initState(val) {
            console.log({ initState: val });
            this._initState = val;
            this.dispatchEvent(new CustomEvent('init-state-changed', {
                detail: {
                    value: val
                },
                bubbles: true,
                composed: true
            }));
        }
        get initState() {
            return this._initState;
        }
        set input(val) {
            this._input = val;
            this.render();
        }
        get input() {
            return this._input;
        }
        disconnectedCallback() {
            //this._domObserver.disconnect();
        }
        connectedCallback() {
            this._upgradeProperty('input');
            this._upgradeProperty('renderer');
            this._upgradeProperty('derenderer');
            this.evaluateScriptText();
        }
        derender() {
            if (!this._derenderer)
                return;
            if (!this._target) {
                this._target = this.querySelector('[role="target"]');
                if (!this._target)
                    return; //add mutation observer?     
            }
            this.initState = this._derenderer(this._target);
        }
        render() {
            if (!this._renderer)
                return;
            if (!this._input)
                return;
            if (this._initState === this._input) {
                delete this._initState;
                return;
            }
            if (!this._target) {
                const test = this.querySelector('[role="target"]');
                if (test) {
                    this._target = test;
                }
                else {
                    const de = document.createElement("div");
                    de.setAttribute('role', 'target');
                    this._target = this.appendChild(de);
                    //this._target = this.insertAdjacentElement('beforebegin', de) as HTMLElement;
                }
            }
            this._renderer(this._input, this._target);
            this.dispatchEvent(new CustomEvent('dom-change', {
                bubbles: true,
                composed: true
            }));
        }
        evaluateScriptText() {
            const templateTag = this.querySelector('template');
            let clone;
            if (templateTag) {
                clone = document.importNode(templateTag.content, true);
            }
            else {
                console.error('no template tag found');
            }
            let scriptTag = this.querySelector('script');
            if (!scriptTag && clone) {
                scriptTag = clone.querySelector('script');
            }
            if (!scriptTag) {
                console.error('No script tag  found to apply.');
                return;
            }
            this.applyScript(scriptTag);
        }
        applyScript(scriptTag) {
            const innerText = scriptTag.innerText;
            if (innerText === this._previousEvaluatedText)
                return;
            this._previousEvaluatedText = innerText;
            // let matches;
            // while (matches = this.insertFragmentRegExp.exec(innerText)) {
            //   insertsEliminatedText = insertsEliminatedText.replace('scriptTag=>XtalMethod.insert(scriptTag,' + matches[1] + ');', '');
            //   console.log(matches);
            //   console.log('Middle text is: ' + matches[1]);
            // }
            const splitInsertText = innerText.split(this.insertFragmentRegExp);
            const insertedText = splitInsertText.map((val, idx) => {
                if (idx % 2 === 0)
                    return val;
                let newText = '';
                const ids = val.split(',').forEach(id => {
                    const scriptInclude = window[id.trim()];
                    if (scriptInclude) {
                        newText += scriptInclude.innerHTML;
                    }
                    else {
                        console.error('script tag with selector ' + id + ' not found');
                    }
                });
                return newText;
            });
            const insertsEliminatedText = insertedText.join('');
            //console.log(insertsEliminatedText);
            const splitText = insertsEliminatedText.split('export const ');
            let iPos = 0;
            for (let i = 1, ii = splitText.length; i < ii; i++) {
                const token = splitText[i];
                const iPosOfEq = token.indexOf('=');
                const lhs = token.substr(0, iPosOfEq).trim();
                splitText[i] = 'const ' + lhs + ' = exportconst.' + lhs + ' = ' + token.substr(iPosOfEq + 1);
            }
            const modifiedText = splitText.join('');
            const protectedScript = `[
            async function () {
                const exportconst = {};
                ${modifiedText}
                return exportconst;
            }
            ]`;
            const fnArr = eval(protectedScript);
            const _this = this;
            const exportedSymbols = fnArr[0]().then(exportedSymbols => {
                Object.assign(_this, exportedSymbols);
            }).catch(e => {
                throw e;
            });
            //Object.assign(this, srcObj);
        }
    }
    customElements.define(XtalMethod.is, XtalMethod);
})();
//# sourceMappingURL=xtal-method.js.map