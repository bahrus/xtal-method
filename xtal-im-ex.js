import { XtalMethod } from './xtal-method.js';
/**
* `xtal-im-ex`
* Set properties of a parent custom element using ES6 module notation
*
* @customElement
* @polymer
* @demo demo/index.html
*/
class XtalIMEX extends XtalMethod {
    constructor() {
        super(...arguments);
        this.insertFragmentRegExp = /XtalIMEX.insert\((.*)\);/g;
    }
    static get is() {
        return 'xtal-im-ex';
    }
    evaluateScriptText() {
        let scriptTag = this.querySelector('script');
        if (!scriptTag) {
            setTimeout(() => {
                this.evaluateScriptText();
            }, 100);
            return;
        }
        this.applyScript(scriptTag);
    }
    applyScript(scriptTag) {
        const innerText = scriptTag.innerText;
        if (innerText === this._previousEvaluatedText)
            return;
        this._previousEvaluatedText = innerText;
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
        //const async = modifiedText.indexOf('await ') > -1 ? 'async' : '';
        const async = 'async';
        const protectedScript = `(
            ${async} function () {
                const exportconst = {};
                ${modifiedText}
                return exportconst;
            }
            )`;
        const fnArr = eval(protectedScript);
        const target = this;
        if (async) {
            const exportedSymbols = fnArr().then(exportedSymbols => {
                Object.assign(target, exportedSymbols);
            }).catch(e => {
                throw e;
            });
        }
        else {
            Object.assign(target, fnArr[0]());
        }
        //Object.assign(this, srcObj);
    }
    connectedCallback() {
        this.evaluateScriptText();
    }
}
customElements.define(XtalIMEX.is, XtalIMEX);
//# sourceMappingURL=xtal-im-ex.js.map