import{XtalMethod}from'./xtal-method.js';class XtalIMEX extends XtalMethod{constructor(){super(...arguments),this.insertFragmentRegExp=/XtalIMEX.insert\((.*)\);/g}static get is(){return'xtal-im-ex'}evaluateScriptText(){let a=this.querySelector('script');return a?void this.applyScript(a):void setTimeout(()=>{this.evaluateScriptText()},100)}applyScript(a){const b=a.innerText;if(b===this._previousEvaluatedText)return;this._previousEvaluatedText=b;const c=b.split(this.insertFragmentRegExp),d=c.map((a,b)=>{if(0===b%2)return a;let c='';a.split(',').forEach((a)=>{const b=window[a.trim()];b?c+=b.innerHTML:console.error('script tag with selector '+a+' not found')});return c}),e=d.join(''),f=e.split('export const ');let g=0;for(let b=1,c=f.length;b<c;b++){const a=f[b],c=a.indexOf('='),d=a.substr(0,c).trim();f[b]='const '+d+' = exportconst.'+d+' = '+a.substr(c+1)}const h=f.join(''),i=-1<h.indexOf('await ')?'async':'',j=`[
            ${i} function () {
                const exportconst = {};
                ${h}
                return exportconst;
            }
            ]`,k=eval(j),l=this;if(i){k[0]().then((a)=>{Object.assign(l,a)}).catch((a)=>{throw a})}else Object.assign(l,k[0]())}connectedCallback(){this.evaluateScriptText()}}customElements.define(XtalIMEX.is,XtalIMEX);