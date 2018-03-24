(function () {
    
    const t = (document.currentScript as HTMLScriptElement).dataset.as;
    const tagName = t ? t : 'xtal-method'; 
    if(customElements.get(tagName)) return;
    /**
    * `xtal-method`
    * Create a localized link between an input object and a functional renderer
    *
    * @customElement
    * @polymer
    * @demo demo/index.html
    */
    class XtalMethod extends HTMLElement {

        _target: HTMLElement;
        _renderer : (formatter, target) => any;
        set renderer(val: (formatter, target) => any){
            this._renderer = val;
            this.render();
        }
        get renderer(){
            return this._renderer;
        }

        _upgradeProperty(prop) {
            if (this.hasOwnProperty(prop)) {
                let value = this[prop];
                delete this[prop];
                this[prop] = value;
            }
        }

        _derenderer: (element: HTMLElement) => any;
        set derenderer(val: (element: HTMLElement) => any){
            this._derenderer = val;
            this.derender();
        }
        get derenderer(){
            return this._derenderer;
        }

        _initState: any;
        set initState(val: any){
            this._initState = val;
            this.dispatchEvent(new CustomEvent('init-state-changed', {
                detail:{
                    value: val
                },
                bubbles: true,
                composed: true
              } as CustomEventInit));
        }
        get initState(){
            return this._initState;
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
            this._upgradeProperty('input');
            this._upgradeProperty('renderer');
            this._upgradeProperty('derenderer');
            
        }

        derender(){
            if(!this._derenderer) return;
            if(!this._target){
                this._target =  this.querySelector('[role="target"]');
                if(!this._target) return; //add mutation observer?     
            }
            this.initState = this._derenderer(this._target);
        }
        render(){
            if(!this._renderer) return;
            if(!this._input) return;
            if(this._initState === this._input){
                delete this._initState;
                return;
            }
            if(!this._target){
                const test = this.querySelector('[role="target"]');
                if(test){
                    this._target = test as HTMLElement;
                }else{
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
              } as CustomEventInit));
        }



    }
    customElements.define(tagName, XtalMethod);
})();