(function(){var a=document.currentScript.dataset.as,b=a?a:'xtal-method';if(!customElements.get(b)){var c=function(a){function b(){return babelHelpers.classCallCheck(this,b),babelHelpers.possibleConstructorReturn(this,(b.__proto__||Object.getPrototypeOf(b)).apply(this,arguments))}return babelHelpers.inherits(b,a),babelHelpers.createClass(b,[{key:'_upgradeProperty',value:function(a){if(this.hasOwnProperty(a)){var b=this[a];delete this[a],this[a]=b}}},{key:'disconnectedCallback',value:function(){}},{key:'connectedCallback',value:function(){this._upgradeProperty('input'),this._upgradeProperty('renderer'),this._upgradeProperty('derenderer')}},{key:'derender',value:function(){this._derenderer&&(this._target||(this._target=this.querySelector('[role="target"]'),!!this._target))&&(this.initState=this._derenderer(this._target))}},{key:'render',value:function(){if(this._renderer&&this._input){if(this._initState===this._input)return void delete this._initState;if(!this._target){var a=this.querySelector('[role="target"]');if(a)this._target=a;else{var b=document.createElement('div');b.setAttribute('role','target'),this._target=this.appendChild(b)}}this._renderer(this._input,this._target),this.dispatchEvent(new CustomEvent('dom-change',{bubbles:!0,composed:!0}))}}},{key:'renderer',set:function(a){this._renderer=a,this.render()},get:function(){return this._renderer}},{key:'derenderer',set:function(a){this._derenderer=a,this.derender()},get:function(){return this._derenderer}},{key:'initState',set:function(a){this._initState=a,this.dispatchEvent(new CustomEvent('init-state-changed',{detail:{value:a},bubbles:!0,composed:!0}))},get:function(){return this._initState}},{key:'input',set:function(a){this._input=a,this.render()},get:function(){return this._input}}]),b}(HTMLElement);customElements.define(b,c)}})();