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
        static get is() {
            return 'xtal-method';
        }
        set rendererObject(val) {
            this._rendererObject = val;
        }
        set inputObject(val) {
            this._inputObject = val;
            this.render();
        }
        disconnectedCallback() {
            //this._domObserver.disconnect();
        }
        connectedCallback() {
            this.evaluateRendererObject();
        }
        render() {
            if (!this._rendererObject)
                return;
            if (!this._inputObject)
                return;
            if (!this._target) {
                const de = document.createElement("div");
                this._target = this.insertAdjacentElement('beforebegin', de);
            }
            this._rendererObject.render(this._inputObject, this._target);
        }
        evaluateRendererObject() {
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
                //console.error(errRoot + 'No script tag  found to apply.' + this._CssSelector);
                return;
            }
            this.applyScript(scriptTag);
        }
        // replaceAll(target: string, search: string, replacement: string) {
        //     //https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
        //     return target.split(search).join(replacement);
        // }
        // regExp = /(.*)export(\s+)const(\s+)[a-zA-Z]+(\s*)=/g;
        applyScript(scriptTag) {
            const innerText = scriptTag.innerText;
            if (innerText === this._previousEvaluatedText)
                return;
            this._previousEvaluatedText = innerText;
            //const isIE = (navigator.userAgent.indexOf('Trident') > -1);
            //const constOrVar = isIE ? 'var' : 'const';
            //let modifiedText = innerText;
            // const splitHash = innerText.split(this.regExp);
            // const test2 = this.regExp.exec(modifiedText);
            // //this.regExp.
            // debugger;
            // modifiedText = this.replaceAll(modifiedText, 'export const ', 'exportconst.');
            const splitText = innerText.split('export const ');
            let iPos = 0;
            //let modifiedText = splitText[0];
            for (let i = 1, ii = splitText.length; i < ii; i += 2) {
                const token = splitText[i];
                const iPosOfEq = token.indexOf('=');
                const lhs = token.substr(0, iPosOfEq).trim();
                splitText[i] = 'const ' + lhs + ' = exportconstant.' + lhs + ' = ' + token.substr(iPosOfEq + 1);
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
            const exportedSymbols = fnArr[0]().then(exportedSymbols => {
                debugger;
            }).catch(e => {
                throw e;
            });
            debugger;
            //Object.assign(this, srcObj);
        }
    }
    customElements.define(XtalMethod.is, XtalMethod);
})();
//# sourceMappingURL=xtal-method.js.map