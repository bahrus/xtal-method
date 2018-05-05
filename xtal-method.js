const disabled = 'disabled';
/**
* `xtal-method`
* Create a localized link between an input object and a functional renderer
*
* @customElement
* @polymer
* @demo demo/index.html
*/
export class XtalMethod extends HTMLElement {
    get target() {
        return this._target;
    }
    set target(val) {
        this._target = val;
    }
    get disabled() {
        return this.hasAttribute(disabled);
    }
    set disabled(val) {
        if (val) {
            this.setAttribute(disabled, '');
        }
        else {
            this.removeAttribute(disabled);
        }
    }
    set renderer(val) {
        this._renderer = val;
        this.render();
    }
    get renderer() {
        return this._renderer;
    }
    static get is() { return 'xtal-method'; }
    static get observedAttributes() {
        return [disabled];
    }
    _upgradeProperties(props) {
        props.forEach(prop => {
            if (this.hasOwnProperty(prop)) {
                let value = this[prop];
                delete this[prop];
                this[prop] = value;
            }
        });
    }
    set derenderer(val) {
        this._derenderer = val;
        this.derender();
    }
    get derenderer() {
        return this._derenderer;
    }
    set initState(val) {
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
        this._upgradeProperties(['input', 'renderer', 'derenderer', 'target', disabled]);
    }
    changedAttributeCallback(name, oldVal, newVal) {
        switch (name) {
            case 'disabled':
                this.derender();
                this.render();
                break;
        }
    }
    derender() {
        if (!this._derenderer || this.disabled)
            return;
        if (!this._target) {
            this._target = this.querySelector('[role="target"]');
            if (!this._target)
                return; //add mutation observer?     
        }
        this.initState = this._derenderer(this._target);
    }
    render() {
        if (!this._renderer || !this._input || this.disabled)
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
            }
        }
        this._renderer(this._input, this._target);
    }
}
if (!customElements.get(XtalMethod.is)) {
    customElements.define(XtalMethod.is, XtalMethod);
}
//# sourceMappingURL=xtal-method.js.map