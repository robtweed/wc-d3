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

 5 May 2020

*/

export function load() {

  let componentName = 'd3-vertical-hierarchy-node';
  let counter = -1;
  let id_prefix = componentName + '-';
  let id;

  customElements.define(componentName, class d3_vertical_hierarchy_node extends HTMLElement {
    constructor() {
      super();

      counter++;
      id = id_prefix + counter;

      const html = `
<g id="${id}" class="node" transform="translate(0,0)" cursor="pointer" style="font: 12px sans-serif;" opacity="0">
  <rect class="node-rect" width="342" height="146" x="-171" y="-73" rx="5" stroke-width="1" cursor="pointer" stroke="rgba(15,140,121,1)" style="fill: rgb(51, 182, 2);"></rect>
  <foreignObject class="node-foreign-object" width="342" height="146" x="-171" y="-73"></foreignObject>
</g>
      `;
      this.html = `${html}`;

      const childButtonXml = `
<g class="node-button-g" transform="translate(0,73)" opacity="1">
  <circle class="node-button-circle" r="16" stroke-width="1" fill="#fafafa" stroke="rgba(15,140,121,1)"></circle>
  <text class="node-button-text" pointer-events="none" text-anchor="middle" alignment-baseline="middle" fill="#2C3E50" font-size="26" y="0">+</text>
</g>
      `;
      this.childButtonXml = `${childButtonXml}`;

      const actionButtonXml = `
<g class="node-action-button-g" transform="translate(0,0)" opacity="1">
  <circle class="node-action-button-circle" r="16" stroke-width="1" fill="yellow" stroke="rgba(15,140,121,1)"></circle>
  <text class="node-action-button-text" pointer-events="none" text-anchor="middle" alignment-baseline="middle" fill="#2C3E50" font-size="30" y="0">?</text>
</g>
      `;
      this.actionButtonXml = `${actionButtonXml}`;

      const linkXml = `
<path class="link" id="link-${id}"  fill="none" stroke-width="5" stroke="rgba(220,189,207,1)" opacity="0"></path>
      `;
      this.linkXml = `${linkXml}`;

    }

    setState(state) {
      if (state.name) {
        this.name = state.name;
      }
      if (state.data) {
        this.data = state.data;
      }
      if (state.parent_node) {
        this.parent_node = state.parent_node;
      }
      if (state.duration) {
        this.duration = state.duration;
      }
      if (state.node_position) {
        //console.log('setting ' + this.name + ' position to ' + JSON.stringify(state.node_position));
        this.x = state.node_position.x;
        this.y = state.node_position.y;
      }  
      if (state.width) {
        this.width = state.width;
        this.rectTag.setAttribute('width', state.width);
        this.rectTag.setAttribute('x', -(state.width / 2));
        this.foTarget.setAttribute('width', state.width);
        this.foTarget.setAttribute('x', -(state.width / 2));

        if (this.actionButton) {
          let translate = 'translate(' + ((this.width / 2) - 20) + ',' + ((this.height / 2) -20) + ')';
          this.actionButton.setAttribute('transform', translate);
        }

      }      
      if (state.height) {
        this.height = state.height;
        this.rectTag.setAttribute('height', state.height);
        this.rectTag.setAttribute('y', -(state.height / 2));

        this.foTarget.setAttribute('height', state.height);
        this.foTarget.setAttribute('y', -(state.height / 2));
        let translate;
        if (this.childrenButton) {
          translate = 'translate(0,' + (this.height / 2) + ')';
          this.childrenButton.setAttribute('transform', translate);
        }

        if (this.actionButton) {
          translate = 'translate(' + ((this.width / 2) - 20) + ',' + ((this.height / 2) -20) + ')';
          this.actionButton.setAttribute('transform', translate);
        }
      } 
      if (state.borderRadius) {
        this.borderRadius = state.borderRadius;
        this.rectTag.setAttribute('rx', state.borderRadius);
      }
      if (state.borderWidth) {
        this.borderWidth = state.borderWidth;
        this.rectTag.setAttribute('stroke-width', state.borderWidth);
        if (this.actionButtonCircle) {
          this.actionButtonCircle.setAttribute('stroke-width', state.borderWidth);
        }
        if (this.childrenButtonCircle) {
          this.childrenButtonCircle.setAttribute('stroke-width', state.borderWidth);
        }
      }
      if (state.borderColor) {
        this.borderColor = state.borderColor;
        let rgb = 'rgba(' + state.borderColor.red + ',' + state.borderColor.green + ',' + state.borderColor.blue + ',' + state.borderColor.alpha + ')';
        this.rectTag.setAttribute('stroke', rgb);
        if (this.actionButtonCircle) {
          this.actionButtonCircle.setAttribute('stroke', rgb);
        }
        if (this.childrenButtonCircle) {
          this.childrenButtonCircle.setAttribute('stroke', state.rgb);
        }
      }
      if (state.backgroundColor) {
        let rgb = 'fill: rgb(' + state.backgroundColor.red + ',' + state.backgroundColor.green + ',' + state.backgroundColor.blue + ');';
        this.rectTag.setAttribute('style', rgb);
      }
      if (state.actionButtonColor) {
        if (this.actionButtonCircle) {
          let rgb = 'fill: rgb(' + state.actionButtonColor.red + ',' + state.actionButtonColor.green + ',' + state.actionButtonColor.blue + ');';
          this.actionButtonCircle.setAttribute('fill', rgb);
        }
      }
      if (state.hasChildNodes) {
        this.d3_root.injectXml(this.childButtonXml, this.rootElement);
        this.childrenButton = this.rootElement.querySelector('.node-button-g');
        this.childrenButtonCircle = this.childrenButton.querySelector('circle');
        this.childrenButtonText = this.childrenButton.querySelector('text');
        let translate = 'translate(0,' + (this.height / 2) + ')';
        if (this.data && this.data.moreSiblings) {
          translate = 'translate(' + (this.width / 2) + ',0)';
        }
        if (this.data && this.data.morePreviousSiblings) {
          translate = 'translate(' + (-this.width / 2) + ',0)';
        }
        this.childrenButton.setAttribute('transform', translate);
        this.childrenButtonCircle.setAttribute('stroke-width', this.borderWidth);
        let rgb = 'rgba(' + this.borderColor.red + ',' + this.borderColor.green + ',' + this.borderColor.blue + ',' + this.borderColor.alpha + ')';
        this.childrenButtonCircle.setAttribute('stroke', rgb);
      }
      if (state.allowEdits === false) {
        this.allowEdits = false;
        if (this.actionButton) {
          this.actionButton.setAttribute('opacity', 0);
        }
      }
      if (state.allowEdits === true) {
        this.allowEdits = true;
        if (this.actionButton) {
          this.actionButton.setAttribute('opacity', 1);
        }
      }

    }

    addActionBtnTooltip(text) {
      const xml = `
        <g class="tooltip" transform="translate(-30,30)" opacity="0.9">
            <rect rx="5" class="tooltip-box" width="100" height="34"></rect>
            <text class="tooltip-text" x="15" y="24" style="font-size: 22px">${text}</text>
        </g>
      `;
      this.d3_root.injectXml(xml, this.actionButton);
      let textNode = this.actionButton.querySelector('.tooltip-text');
      let boxNode = this.actionButton.querySelector('.tooltip-box');
      boxNode.setAttribute('width', textNode.getBBox().width + 30);
    }

    childButtonStatus() {
      if (this.childrenButtonText.textContent === '+') return 'expand';
      return 'collapse';
    }

    setChildButtonToExpand() {
      this.childrenButtonText.textContent = '+';
    }

    setChildButtonToCollapse() {
      this.childrenButtonText.textContent = '-';
    }

    render() {
      //console.log('rendering ' + this.name);
      // set the starting point for the transition as that of the parent node
      let startX;
      let startY;

      if (this.parent_node) {
        startX = this.parent_node.x;
        startY = this.parent_node.y;
      }
      else {
        startX = 0;
        startY = 0;
      }
      let translate = 'translate(' + startX + ',' + startY + ')';
      //console.log('start translate at ' + translate);
      this.rootElement.setAttribute('transform', translate);
      this.expand();
    }

    expand() {
      let _this = this;
      let translate;
      if (this.parent_node) {
        // bring it back to its parent position
        translate = 'translate(' + this.parent_node.x + ',' + this.parent_node.y + ')';
        this.rootElement.setAttribute('transform', translate);
      }
      // then animate it down to its proper position
      translate = 'translate(' + this.x + ',' + this.y + ')';
      //console.log('expand ' + this.name + ' to translate ' + translate);

      if (this.d3_link) {
        this.d3_link.transition()
        .duration(this.duration)
        .attr('opacity', 1)
        .attr('d', this.root.diagonal(this, this.parent_node));
      }

      this.d3_node.transition()
      .attr('opacity', 0)
      .duration(this.duration)
      .attr('transform', translate)
      .attr('opacity', 1)

      this.visible = true;
    }

    collapse() {
      let _this = this;

      this.d3_link.transition()
      .duration(this.duration)
      .attr('d', this.root.diagonal(this.parent_node, this.parent_node))
      .attr('opacity', 0)

      let translate = 'translate(' + this.parent_node.x + ',' + this.parent_node.y + ')';
      let translate2 =  'translate(-1000,-100)';
      this.d3_node.transition()
      .attr('opacity', 1)
      .duration(this.duration)
      .attr('transform', translate)
      .attr('opacity', 0)
      .on('end', function() {
        // move it safely out of the way to ensure the parent's button isn't confused
        translate = 'translate(-1000,-100)';
        _this.rootElement.setAttribute('transform', translate);
      })
      this.visible = false;
    }

    addLinkToParent(parent_node) {
      this.d3_root.injectXml(this.linkXml, this.pathTarget);
      this.link = this.pathTarget.querySelector('#link-' + id);
      this.link.parentNode.removeChild(this.link);
      this.pathTarget.insertBefore(this.link, this.pathTarget.childNodes[0]);
      let path = this.root.diagonal(parent_node, parent_node);
      this.link.setAttribute('d', path);
      this.d3_link = d3.select(this.link);
    }

    onLoaded() {
      // render the node using the SVG
      this.root = this.getParentComponent('d3-vertical-hierarchy-root');
      this.d3_root = this.root.d3_root;
      this.d3_root.injectXml(this.html, this.root.childrenTarget);

      this.rootElement = this.root.childrenTarget.querySelector('#' + id);
      this.foTarget = this.rootElement.querySelector('foreignObject');
      this.rectTag = this.rootElement.querySelector('rect');
      this.d3_node = d3.select(this.rootElement);
      this.pathTarget = this.root.pathTarget;

      this.d3_root.injectXml(this.actionButtonXml, this.rootElement);
      this.actionButton = this.rootElement.querySelector('.node-action-button-g');
      this.actionButtonCircle = this.actionButton.querySelector('circle');
      this.actionButtonText = this.actionButton.querySelector('text');
      let translate = 'translate(' + ((this.width / 2) - 20) + ',' + ((this.height / 2) -20) + ')';
      this.actionButton.setAttribute('transform', translate);
      let _this = this;
      let fn = function(e) {
        e.stopPropagation();
        if (_this.allowEdits === false) return;
        if (_this.onActionBtnClick) {
          // override and use custom action button handler
          _this.onActionBtnClick.call(_this);
          return;
        }
        _this.root.showModal(e.clientX, e.clientY, _this);
        if (_this.onShowModal) _this.onShowModal.call(_this);
      };
      this.addHandler(fn, this.actionButton);

    }

    connectedCallback() {
      this.x = 0;
      this.y = 0;
      this.height = 146;
      this.width = 342;
      this.duration = 600;
      this.borderRadius = 5;
      this.borderWidth = 1;
      this.borderColor = {
        red: 15,
        green: 140,
        blue: 121,
        alpha: 1
      };
      this.data = {};
      this.child_nodes = [];
      this.visible = false;
    }

    disconnectedCallback() {
      //console.log('d3-vertical-hierarchy-node component was removed!');
      // remove from parent's array of child nodes
      let node;
      //console.log('removing node ' + this.name + ' from parent');
      if (this.parent_node && this.parent_node.child_nodes) {
        //console.log('currently ' + this.parent_node.child_nodes.length + ' nodes in parent array');
        for (var i = 0; i < this.parent_node.child_nodes.length; i++) {
          node = this.parent_node.child_nodes[i];
          //console.log('found ' + node.name);
          if (node.name === this.name) {
            //console.log(node.name + ' removed from parent');
            this.parent_node.child_nodes.splice(i, 1);
            break;
          }
        }
      }
      // remove SVG markup for nodes and links
      this.rootElement.parentNode.removeChild(this.rootElement);
      if (this.link) {
        this.link.parentNode.removeChild(this.link);
      }

      if (this.onUnload) this.onUnload();
    }

  });
}
