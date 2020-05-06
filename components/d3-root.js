/*

 ----------------------------------------------------------------------------
 | d3: d3 WebComponents Library                                              |
 |                                                                           |
 | Copyright (c) 2020 M/Gateway Developments Ltd,                            |
 | Redhill, Surrey UK.                                                       |
 | All rights reserved.                                                      |
 |                                                                           |
 | http://www.mgateway.com                                                   |
 | Email: rtweed@mgateway.com                                                |
 |                                                                           |
 |                                                                           |
 | Licensed under the Apache License, Version 2.0 (the "License");           |
 | you may not use this file except in compliance with the License.          |
 | You may obtain a copy of the License at                                   |
 |                                                                           |
 |     http://www.apache.org/licenses/LICENSE-2.0                            |
 |                                                                           |
 | Unless required by applicable law or agreed to in writing, software       |
 | distributed under the License is distributed on an "AS IS" BASIS,         |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  |
 | See the License for the specific language governing permissions and       |
 |  limitations under the License.                                           |
 ----------------------------------------------------------------------------

 21 April 2020

*/

export function load() {

  let componentName = 'd3-root';

  customElements.define(componentName, class d3_root extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' })

      const html = `
<span class="d3-root"></span>
      `;
      this.html = `${html}`;
    }

    loadJS(src, callback) {
      let script = document.createElement("script");
      script.type = "text/javascript";
      script.src = src
      script.onload = function(){
        if (callback) callback(src);
      };
      this.shadowRoot.appendChild(script);
    }

    onLoaded() {
      let readyEvent = new Event('d3Ready');
      let _this = this;
      let prefix = '';
      if (this.context.d3ResourcePath) prefix = this.context.d3ResourcePath;
      if (this.context.paths && this.context.paths.d3) {
        prefix = this.context.paths.d3;
        if (prefix[0] === '.') prefix = prefix.slice(1);
      }
      if (prefix !== '' && prefix.slice(-1) !== '/') prefix = prefix + '/';
      this.loadJS(prefix + 'js/d3.v5.min.js', function() {
        _this.d3 = d3;
        _this.container = d3.select(_this.rootElement);
        document.dispatchEvent(readyEvent);
        _this.ready = true;
      });
    }

    injectXml(xmlString, targetNode) {
      let xml = '<xml>' + xmlString + '</xml>';
      let parser = new DOMParser();
      let dom = parser.parseFromString(xml, 'text/xml');

      function addChildren(element, targetElement) {
        let children = [...element.childNodes];
        children.forEach(function(child) {
          if (child.nodeType === 1) {
            let svgTag = document.createElementNS("http://www.w3.org/2000/svg", child.tagName);
            if (child.hasAttributes()) {
              let attrs = [...child.attributes];
              attrs.forEach(function(attr) {
                svgTag.setAttribute(attr.name, attr.value);
              });
            }
            targetElement.appendChild(svgTag);
            if (child.hasChildNodes()) {
              addChildren(child, svgTag);
            }
          }
          if (child.nodeType === 3) {
            let text = child.data.trim();
            if (text !== '') {
              targetElement.textContent = text;
            }
          }
        });
      }

      addChildren(dom.documentElement, targetNode);
    }

    onReady(fn) {
      document.addEventListener('d3Ready', fn);
      this.removeOnReady = function() {
        document.removeEventListener('d3Ready', fn);
      }
    }

    connectedCallback() {
      this.shadowRoot.innerHTML = this.html; 
      this.rootElement = this.shadowRoot.querySelector('span');
      this.childrenTarget = this.rootElement;
      //this.rootNode = this.getRootNode();
      //console.log('d3 root node:');
      //console.log(this.rootNode);
    }

    disconnectedCallback() {
      console.log('*** d3-root component was removed!');
      if (this.onUnload) this.onUnload();
    }

  });

};