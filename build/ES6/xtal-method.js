(function(){const a=document.currentScript.dataset.as,b='xtal-method',c=a?a:b;if(!customElements.get(c)){class a extends HTMLElement{set renderer(a){this._renderer=a,this.render()}get renderer(){return this._renderer}_upgradeProperty(a){if(this.hasOwnProperty(a)){let b=this[a];delete this[a],this[a]=b}}set derenderer(a){this._derenderer=a,this.derender()}get derenderer(){return this._derenderer}set initState(a){this._initState=a,this.dispatchEvent(new CustomEvent('init-state-changed',{detail:{value:a},bubbles:!0,composed:!0}))}get initState(){return this._initState}set input(a){this._input=a,this.render()}get input(){return this._input}disconnectedCallback(){}connectedCallback(){this._upgradeProperty('input'),this._upgradeProperty('renderer'),this._upgradeProperty('derenderer')}derender(){this._derenderer&&(this._target||(this._target=this.querySelector('[role="target"]'),!!this._target))&&(this.initState=this._derenderer(this._target))}render(){if(this._renderer&&this._input){if(this._initState===this._input)return void delete this._initState;if(!this._target){const a=this.querySelector('[role="target"]');if(a)this._target=a;else{const a=document.createElement('div');a.setAttribute('role','target'),this._target=this.appendChild(a)}}this._renderer(this._input,this._target),this.dispatchEvent(new CustomEvent('dom-change',{bubbles:!0,composed:!0}))}}}if(customElements.define(b,a),b!==c){customElements.define(c,class extends a{})}}})();