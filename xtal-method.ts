
const disabled = 'disabled';
const input = 'input';
/**
* `xtal-method`
* Create a localized link between an input object and a functional renderer
*
* @customElement
* @polymer
* @demo demo/index.html
*/
export class XtalMethod extends HTMLElement {

    _target: HTMLElement;
    get target() {
        return this._target;
    }
    set target(val) {
        this._target = val;
    }
    get disabled() {
        return this.hasAttribute(disabled)
    }
    set disabled(val) {
        if (val) {
            this.setAttribute(disabled, '');
        } else {
            this.removeAttribute(disabled);
        }
    }
    _renderer: (formatter, target) => any;
    set renderer(val: (formatter, target) => any) {
        this._renderer = val;
        this.render();
    }
    get renderer() {
        return this._renderer;
    }
    static get is() { return 'xtal-method'; }
    static get observedAttributes(){
        return [disabled, input];
    }

    _upgradeProperties(props: string[]) {
        props.forEach(prop => {
            if (this.hasOwnProperty(prop)) {
                let value = this[prop];
                delete this[prop];
                this[prop] = value;
            }
        })

    }

    _derenderer: (element: HTMLElement) => any;
    set derenderer(val: (element: HTMLElement) => any) {
        this._derenderer = val;
        this.derender();
    }
    get derenderer() {
        return this._derenderer;
    }

    _initState: any;
    set initState(val: any) {
        this._initState = val;
        this.dispatchEvent(new CustomEvent('init-state-changed', {
            detail: {
                value: val
            },
            bubbles: true,
            composed: true
        } as CustomEventInit));
    }
    get initState() {
        return this._initState;
    }

    _input;
    set input(val: object) {
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
        this._upgradeProperties(['input', 'renderer', 'derenderer', 'target', disabled])

    }
    changedAttributeCallback(name: string, oldVal: string, newVal: string){
        switch(name){
            case 'disabled':
                this.derender();
                this.render();
                break;
            case 'input':
                this.input =  JSON.parse(newVal);
                break;
        }
    }

    derender() {
        if (!this._derenderer || this.disabled) return;
        if (!this._target) {
            this._target = this.querySelector('[role="target"]');
            if (!this._target) return; //add mutation observer?     
        }
        this.initState = this._derenderer(this._target);
    }
    render() {
        if (!this._renderer || !this._input || this.disabled) return;
        if (this._initState === this._input) {
            delete this._initState;
            return;
        }
        if (!this._target) {
            const test = this.querySelector('[role="target"]');
            if (test) {
                this._target = test as HTMLElement;
            } else {
                const de = document.createElement("div");
                de.setAttribute('role', 'target');
                this._target = this.appendChild(de);
            }

        }
        this._renderer(this._input, this._target);
    }



}

if (!customElements.get(XtalMethod.is)) {
    customElements.define(XtalMethod.is, XtalMethod);
}


