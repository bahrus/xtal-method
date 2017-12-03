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
        //_domObserver: MutationObserver;
        _previousEvaluatedText: string;
        _target: HTMLDivElement;
        static get is() {
            return 'xtal-method';
        }

        _renderer;
        set renderer(val: object){
            this._renderer = val;
            this.render();
        }
        get renderer(){
            return this._renderer;
        }

        _input;
        set input(val: object){
            this._input = val;
            this.render();
        }
        get input(){
            return this._input;
        }
        disconnectedCallback() {
            //this._domObserver.disconnect();
        }
        connectedCallback() {
            //setTimeout(() =>{
                this.evaluateScriptText();
            //}, 10000);
            
        }
        render(){
            if(!this._renderer) return;
            if(!this._input) return;
            if(!this._target){
                const de = document.createElement("div");
                this._target = this.insertAdjacentElement('beforebegin', de) as HTMLDivElement;
            }
            this._renderer(this._input, this._target);
        }
        static import(scriptTag: HTMLScriptElement, cssSelector: string){
            debugger;
        }
        evaluateScriptText(){
            const templateTag = this.querySelector('template') as HTMLTemplateElement;
            let clone: DocumentFragment;
            if (templateTag) {
                clone = document.importNode(templateTag.content, true) as HTMLDocument;
            }else{
                console.error('no template tag found');
            }
            let scriptTag = this.querySelector('script');
            if (!scriptTag && clone) {
                scriptTag = clone.querySelector('script');
            }
            if (!scriptTag ) {
                console.error('No script tag  found to apply.' );
                return;
            }
            this.applyScript(scriptTag);
        }

        // replaceAll(target: string, search: string, replacement: string) {
        //     //https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
        //     return target.split(search).join(replacement);
        // }
        // regExp = /(.*)export(\s+)const(\s+)[a-zA-Z]+(\s*)=/g;
        
        applyScript(scriptTag: HTMLScriptElement){
            const innerText = scriptTag.innerText;
            if (innerText === this._previousEvaluatedText) return;
            this._previousEvaluatedText = innerText;
            //const isIE = (navigator.userAgent.indexOf('Trident') > -1);
            //const constOrVar = isIE ? 'var' : 'const';
            //let modifiedText = innerText;
            // const splitHash = innerText.split(this.regExp);
            // const test2 = this.regExp.exec(modifiedText);
            // //this.regExp.
            // debugger;
            // modifiedText = this.replaceAll(modifiedText, 'export const ', 'exportconst.');
            const splitText = innerText.replace('alert', '//alert').split('export const ');
            let iPos = 0;
            
            for(let i = 1, ii = splitText.length; i < ii; i++){
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
            const fnArr =  eval(protectedScript);
            const _this = this;
            const exportedSymbols = fnArr[0]().then(exportedSymbols =>{
                Object.assign(_this, exportedSymbols);
            }).catch(e =>{
                throw e;
            })
            //Object.assign(this, srcObj);
        }
    }
    customElements.define(XtalMethod.is, XtalMethod);
})();