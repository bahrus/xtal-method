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
        static get is() {
            return 'xtal-method';
        }

        _rendererObject;
        set rendererObject(val: object){
            this._rendererObject = val;
        }

        _inputObject;
        set inputObject(val: object){
            this._inputObject = val;
            this.render();
        }
        disconnectedCallback() {
            //this._domObserver.disconnect();
        }
        connectedCallback() {
            this.evaluateRendererObject();
        }
        render(){
            if(!this._rendererObject) return;
            if(!this._inputObject) return;
        }
        evaluateRendererObject(){
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
                //console.error(errRoot + 'No script tag  found to apply.' + this._CssSelector);
                return;
            }
        }

        replaceAll(target: string, search: string, replacement: string) {
            //https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
            return target.split(search).join(replacement);
        }

        applyScript(scriptTag: HTMLScriptElement){
            const innerText = scriptTag.innerText;
            if (innerText === this._previousEvaluatedText) return;
            this._previousEvaluatedText = innerText;
            const isIE = (navigator.userAgent.indexOf('Trident') > -1);
            const constOrVar = isIE ? 'var' : 'const';
            let modifiedText = innerText;
            modifiedText = this.replaceAll(modifiedText, 'export const ', 'exportconst.');
            const protectedScript = `
            function (container) {
                ${constOrVar} exportconst = {};
                ${modifiedText}
                container.rendererObject = exportconst;
            `;
            const fn =  eval(protectedScript);
            fn(this);
        }
    }
    customElements.define(XtalMethod.is, XtalMethod);
})();