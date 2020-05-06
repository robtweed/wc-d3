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

 6 May 2020

*/

export function load() {

  let componentName = 'd3-vertical-hierarchy-root';
  let counter = -1;
  let id_prefix = componentName + '-';
  let id;

  customElements.define(componentName, class d3_vertical_hierarchy extends HTMLElement {
    constructor() {
      super();
      //this.attachShadow({ mode: 'open' })

      counter++;
      id = id_prefix + counter;

      const html = `
<style>
  .modal {
    display: none; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 1; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100% ;/* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0,0,0); /* Fallback color */
    background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
  }
  .modal-content {
    background-color: #fefefe;
    position: relative;
    left: 300px;
    top:100px;
    height: 2%;
    padding: 0px;
    border: 1px solid #888;
    width: 10%;
  }

  /*the container must be positioned relative:*/
  .custom-select {
    position: relative;
    font-family: Arial;
  }

  .custom-select select {
    display: none; /*hide original SELECT element:*/
  }

  .select-selected {
    background-color: DodgerBlue;
  }

  /*style the arrow inside the select element:*/
  .select-selected:after {
    position: absolute;
    content: "";
    top: 14px;
    right: 10px;
    width: 0;
    height: 0;
    border: 6px solid transparent;
    border-color: #fff transparent transparent transparent;
  }

  /*point the arrow upwards when the select box is open (active):*/
  .select-selected.select-arrow-active:after {
    border-color: transparent transparent #fff transparent;
    top: 7px;
  }

  /*style the items (options), including the selected item:*/
  .select-items div,.select-selected {
    color: #ffffff;
    padding: 8px 16px;
    border: 1px solid transparent;
    border-color: transparent transparent rgba(0, 0, 0, 0.1) transparent;
    cursor: pointer;
    user-select: none;
  }

  /*style items (options):*/
  .select-items {
    position: absolute;
    background-color: DodgerBlue;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 99;
  }

  /*hide the items when the select box is closed:*/
  .select-hide {
    display: none;
  }

  .select-items div:hover, .same-as-selected {
    background-color: rgba(0, 0, 0, 0.1);
  }


.node-action-button-g .tooltip {visibility: hidden}

.node-action-button-g:hover .tooltip {
    visibility: visible;
}
.tooltip text {
    fill: black;
    font-size: 12px;
    font-family: sans-serif;
}
.tooltip rect {
    fill: yellow;
    stroke: blue;
}

</style>
<div id="${id}" class="chart-container" style="padding-top:10px; height:1200px "></div>
<div class="modal">
  <div class="modal-content">
    <div class="custom-select" style="width:200px;">
      <div class="select-selected">Select action:</div>
      <div class="select-items select-hide"></div>
    </div>
  </div>
</div>
      `;
      this.html = `${html}`;
    }

    addClass(cls) {
      this.rootElement.classList.add(cls);
    }

    removeClass(cls) {
      this.rootElement.classList.remove(cls);
    }

    setState(state) {
      if (state.name) {
        this.name = state.name;
      }
      if (state.cls) {
        let _this = this;
        state.cls.split(' ').forEach(function(cls) {
          _this.addClass(cls);
        });
      }
      if (state.zoomFactor) {
        changeZoomFactor(state.zoomFactor);
      }
    }

    changeZoomFactor(zoomFactor) {
      this.zoomFactor = zoomFactor;
      if (this.gCenterGroupTag) {
        let translate = 'translate(' + (this.svgWidth / 2) + ',' + (this.height / 2) + ') scale(' + this.zoomFactor + ')';
        this.gCenterGroupTag.setAttribute('transform', translate);
      }
    }

    showModal(x, y, node) {
      if (typeof x !== 'undefined') {
        this.modalContentTag.style.left = x + 'px';
      }
      if (typeof y !== 'undefined') {
        this.modalContentTag.style.top = y + 'px';
      }
      this.modalTag.style.display = 'block';
      this.node_context = node;

      // make all options visible by default
      for (let value in this.selectOptions) {
        this.selectOptions[value].removeAttribute('style');
      }
    }
 
    isModalVisible() {
      let display = this.modalTag.style.display;
      if (display === 'none') return false;
      return true;
    }

    hideModal() {
      this.modalTag.style.display = 'none';
    }

    setSelectedValue(value) {
      this.selectedTag.setAttribute('value', value);
    }

    addSvg() {
      let svg = `
  <svg class="svg-chart-container" width="1635" height="1949" font-family="Helvetica" cursor="move" style="background-color: rgb(250, 250, 250);">
    <g class="chart" transform="translate(0,0)">
      <g class="center-group" transform="translate(817.5,73) scale(0.6)">
      </g>
    </g>
    <defs class="filter-defs">
      <filter class="shadow-filter-element" id="ID375428-drop-shadow" y="-50%" x="-50%" height="200%" width="200%">
        <feGaussianBlur class="feGaussianBlur-element" in="SourceAlpha" stdDeviation="3.1" result="blur"></feGaussianBlur>
          <feOffset class="feOffset-element" in="blur" result="offsetBlur" dx="4.28" dy="4.48" x="8" y="8"></feOffset>
          <feFlood class="feFlood-element" in="offsetBlur" flood-color="black" flood-opacity="0.3" result="offsetColor"></feFlood>
         <feComposite class="feComposite-element" in="offsetColor" in2="offsetBlur" operator="in" result="offsetBlur"></feComposite>
        <feMerge class="feMerge-element">
          <feMergeNode class="feMergeNode-blur" in="offsetBlur"></feMergeNode>
          <feMergeNode class="feMergeNode-graphic" in="SourceGraphic"></feMergeNode>
        </feMerge>
      </filter>
    </defs>
  </svg>
      `;
      this.d3_root.injectXml(svg, this.rootElement);
    }

    hideOption(value) {
      let option = this.selectOptions[value];
      if (option) option.style = 'display: none';
    }

    showOption(value) {
      let option = this.selectOptions[value];
      if (option) option.removeAttribute('style');
    }

    addOptions(optionArr) {

      this.selectOptions = {};
      let _this = this;
      optionArr.forEach(function(option) {
        let div = document.createElement('div');
        div.classList.add('select-option');
        div.setAttribute('value', option.value);
        div.textContent = option.text;
        _this.selectTag.appendChild(div);
        _this.selectOptions[option.value] = div;
        let fn = function(e) {
          e.stopPropagation();
          let value = e.target.getAttribute('value');
          _this.setSelectedValue(value);
          _this.hideModal();
          _this.closeSelect();

          // perform action based on value....
          //console.log('Invoking action ' + value);
          //console.log(_this.node_context.data);
          if (option.handler) option.handler.call(_this.node_context);
        };
        _this.addHandler(fn, div);
      });
    }

    onLoaded() {

      let readyEvent = new Event('rootReady');

      let _this = this;
      this.addSvg();

      this.svgTag = this.rootElement.querySelector('svg');
      this.gChartTag = this.svgTag.querySelector('.chart');
      this.gCenterGroupTag = this.gChartTag.querySelector('.center-group');
      this.pathTarget = this.gCenterGroupTag;
      //this.imageDefsTag = this.svgTag.querySelector('.image-defs');
      this.filterDefsTag = this.svgTag.querySelector('.filter-defs');
      this.childrenTarget = this.gCenterGroupTag;

      let fn = function(e) {
        /*when the select box is clicked, close any other select boxes,
        and open/close the current select box:*/
        e.stopPropagation();
        _this.selectTag.classList.toggle("select-hide");
        _this.selectedTag.classList.toggle("select-arrow-active");
      };
      this.addHandler(fn, this.selectedTag);

      let closeModalFn = function() {
        if (_this.isModalVisible()) {
          //_this.hideModal();
          _this.closeSelect();
          _this.hideModal();
        }
      };
      this.addHandler(closeModalFn, document);

      let d3Fn = function() {
        _this.container = _this.d3_root.container;
        _this.d3 = {
          centerG: _this.container.select('.center-group')
        };

        let zoom = d3.zoom().on("zoom", function(d) {
          _this.zoom(d)
        });

        d3.select(_this.svgTag).call(zoom);


        let rootNode = _this.container.select('.chart-container');
        let rootRect = rootNode.node().getBoundingClientRect();
        if (rootRect.width > 0) _this.svgWidth = rootRect.width;
        _this.svgTag.setAttribute('width', _this.svgWidth);
        _this.svgTag.setAttribute('height', _this.svgHeight);
        let translate = 'translate(' + (_this.svgWidth / 2) + ',' + (_this.height / 2) + ') scale(' + _this.zoomFactor + ')';
        _this.gCenterGroupTag.setAttribute('transform', translate);

        _this.calc = {
          chartLeftMargin: _this.marginLeft,
          chartTopMargin: _this.marginTop,
          chartWidth: _this.svgWidth - _this.marginRight - _this.marginLeft,
          chartHeight: _this.svgHeight - _this.marginBottom - _this.marginTop,
        };

        _this.depth = _this.height + 100;  
        _this.treemap = d3.tree()
         .size([_this.calc.chartWidth, _this.calc.chartHeight])
         .nodeSize([_this.width + 100, _this.height + _this.depth])

        document.dispatchEvent(readyEvent);
      };
      this.d3_root.onReady(d3Fn);
      this.isReady = true;
    }

    zoom() {

      // Get d3 event's transform object
      const transform = d3.event.transform;
      // Reposition and rescale chart accordingly
      this.gChartTag.setAttribute('transform', transform);
    }

    resetView() {
      this.gChartTag.setAttribute('transform', 'translate(0,0)');
    }

    clearDown(from_node, leaveParent) {
      // remove all existing nodes

      if (!this.topNode) return;

      let _this = this;
      let clearAll = false;
      if (!from_node) {
        from_node = this.topNode;
        clearAll = true;
      }

      function deleteChildNodes(node) {
        if (node.child_nodes) {
          let childNodes = node.child_nodes.slice(0);
          childNodes.forEach(function(childNode) {
            deleteChildNodes(childNode);
            childNode.remove();
            _this.removeFromNodeArray(childNode)
          });
        }
      }
      deleteChildNodes(from_node);
      if (!leaveParent) {
        from_node.remove();
        this.removeFromNodeArray(from_node)
      }
      if (clearAll) {
        delete this.topNode;
        this.nodeArray = [];
      }
      this.resetView();
    }

    render() {
      let _this = this;

      this.calculateNodePositions();
      //console.log('nodeArray: ' + JSON.stringify(this.nodeArray, null, 2));

      this.nodeArray.forEach(function(record) {
        //console.log('selected record ' + JSON.stringify(record, null, 2));
        let node = _this.getComponentByName('d3-vertical-hierarchy-node', 'node-' + record.id, _this.rootElement);
        //console.log('node:');
        //console.log(node);
        //console.log('current position: ' + node.x + ',' + node.y);
        if (node.visible && node.x === _this.positions[record.id].x && node.y === _this.positions[record.id].y) {
          // node already visible and at same position, so don't re-render
          return;
        }
        node.setState({
          node_position: _this.positions[record.id]
        });
        node.render();
      });
    }

    onReady(fn) {
      if (this.isReady) {
        fn();
      }
      else {
        document.addEventListener('rootReady', fn);
        this.removeOnReady = function() {
          document.removeEventListener('rootReady', fn);
        }
      }
    }

    appendNodeData(dataArray) {
      // data element objects should contain:
      //  {id: n, parent: parentId or '' for top node}

      let _this = this;
      dataArray.forEach(function(record) {
        _this.nodeArray.push(record);
      });
    }

    removeFromNodeArray(node) {
      let _this = this;
      for (var i = 0; i < this.nodeArray.length; i++) {
        if (this.nodeArray[i].id === node.data.id) {
          this.nodeArray.splice(i, 1);
          return;
        }
      }
    }

    calculateNodePositions() {

      let root = d3.stratify()
        .id(function(d) { return d.id; })
        .parentId(function(d) { return d.parent; })
      (this.nodeArray);

      let results = this.treemap(root);
      this.positions = {};
      let _this = this;

      function getPositions(obj) {
        obj.children.forEach(function(child) {
          _this.positions[child.id] = {
            x: child.x,
            y: child.depth * (_this.height + 100)
          };
          if (child.children) {
            getPositions(child);
          }
        });
      };
      this.positions[results.id] = {
        x: results.x,
        y: results.y
      };
      if (results.children) {
        getPositions(results);
      }
    }

    diagonal(fromNode, toNode) {

      // Calculate some variables based on source and target (s,t) coordinates
      const x = fromNode.x;
      const y = fromNode.y;
      const ex = toNode.x;
      const ey = toNode.y;
      let xrvs = ex - x < 0 ? -1 : 1;
      let yrvs = ey - y < 0 ? -1 : 1;
      let rdef = 35;
      let rInitial = Math.abs(ex - x) / 2 < rdef ? Math.abs(ex - x) / 2 : rdef;
      let r = Math.abs(ey - y) / 2 < rInitial ? Math.abs(ey - y) / 2 : rInitial;
      let h = Math.abs(ey - y) / 2 - r;
      let w = Math.abs(ex - x) - r * 2;

      // Build the path
      const path = `
             M ${x} ${y}
             L ${x} ${y+h*yrvs}
             C  ${x} ${y+h*yrvs+r*yrvs} ${x} ${y+h*yrvs+r*yrvs} ${x+r*xrvs} ${y+h*yrvs+r*yrvs}
             L ${x+w*xrvs+r*xrvs} ${y+h*yrvs+r*yrvs}
             C ${ex}  ${y+h*yrvs+r*yrvs} ${ex}  ${y+h*yrvs+r*yrvs} ${ex} ${ey-h*yrvs}
             L ${ex} ${ey}
      `;
      return path;
  }

    closeSelect() {
      this.selectedTag.classList.remove('select-arrow-active');
      this.selectTag.classList.add('select-hide');
    }

    connectedCallback() {
      //this.shadowRoot.innerHTML = this.html;
      this.innerHTML = this.html; 
      //this.rootElement = this.shadowRoot.querySelector('.chart-container');
      this.rootElement = this.getElementsByClassName('chart-container')[0];

      //this.modalTag = this.shadowRoot.querySelector('.modal');
      this.modalTag = this.getElementsByClassName('modal')[0];
      this.modalContentTag = this.modalTag.querySelector('.modal-content');
      this.customSelectTag = this.modalTag.querySelector('.custom-select');
      this.selectTag = this.modalTag.querySelector('.select-items');
      this.selectedTag = this.modalTag.querySelector('.select-selected');
      this.name = this.rootElement.id;

      this.d3_root = this.getRootNode().host;

      this.svgWidth = window.innerWidth;
      this.marginLeft = 0;
      this.marginRight = 0;
      this.svgHeight = window.innerWidth;
      this.marginTop = 0;
      this.marginBottom = 0;
      this.depth = 180;
      this.height = 146;
      this.width = 342;
      this.nodeArray = [];
      this.positions = {};
      this.zoomFactor = 0.6;
    }

    disconnectedCallback() {
      //console.log('*** d3-vertical-hierarchy component was removed!');
      this.removeOnReady();
      if (this.onUnload) this.onUnload();
    }

  });
}
