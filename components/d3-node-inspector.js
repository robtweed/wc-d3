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

export function node_inspector_assembly(QEWD, state) {

  function appendNode() {
    console.log('action button (append node) clicked for ' + this.name);

    let body_prompt = 'You must define the subscripts and value for the new node below the node you selected that has path:  ' + JSON.stringify(this.data.path);
    if (!this.parent_node) {
      body_prompt = 'You must define the subscripts and value for the new node below this top Global Node';
    }

    let prompts = {
      header: 'Append a New Global Storage Node',
      body: body_prompt,
      form: true
    };
    let _this = this;
    let actionFn = async function() {

      let form = _this.getComponentByName('adminui-form', 'node-inspector-confirm-modal');
      let path = form.fieldValues.path;

      if (!path || path === '') {
        return toastr.error('Empty or missing path');
      }

      if (!form.fieldValues.value) {
        return toastr.error('You must define a value');
      }

      if (path.includes(',')) {
        path = path.split(',');
        for (let i = 0; i < path.length; i++) {
          if (path[i] === '') {
            return toastr.error('Invalid path: it cannot include an empty string');
          }
          path[i] = path[i].trim();
          if (path[i][0] === '"') {
            path[i] = path[i].slice(1);
          }
          if (path[i][path[i].length - 1] === '"') {
            path[i] = path[i].slice(0, -1);
          }
        }
      }
      else {
        path = [path];
      }

      let responseObj = await QEWD.reply({
        type: 'createNode',
        params: {
          documentName: _this.data.documentName,
          path: _this.data.path,
          subPath: path,
          value: form.fieldValues.value
        }
      });
      if (responseObj.message.error) {
        toastr.error(responseObj.message.error);
        _this.root.confirmModal.hide();
      }
      else {
        toastr.warning('The new Global Storage node was created');
        _this.root.confirmModal.hide();
        // need to delete this node and its children from display and force a re-render
        _this.root.clearDown(_this, true);
        _this.setChildButtonToExpand();
        _this.childrenButtonHandler();  // simulate clicking the child button to refetch child nodes
      }

    };

    let cancelFn = function() {
      toastr.success('Action was cancelled');
    };

    this.root.confirmModal.setProperties(prompts, actionFn, cancelFn);
    this.root.confirmModal.show();
  }

  function deleteNode() {
    console.log('action button (delete node) clicked for ' + this.name);

    let prompts = {
      header: 'Delete Global Storage Node',
      body: 'You are about to delete the Global Storage node with path ' + JSON.stringify(this.data.path) + '. Are you sure you want to do this?'
    };
    let _this = this;

    let actionFn = async function() {
      let responseObj = await QEWD.reply({
        type: 'deleteNode',
        params: {
          documentName: _this.data.documentName,
          path: _this.data.path
        }
      });
      if (responseObj.message.error) {
        toastr.error(responseObj.message.error);
        _this.root.confirmModal.hide();
      }
      else {
        toastr.warning('The Global Storage node was deleted');
        _this.root.confirmModal.hide();
        // need to delete this node and its children from display and force a re-render
        _this.root.clearDown(_this);
        _this.root.render();
      }
    };

    let cancelFn = function() {
      toastr.success('Action was cancelled');
    };

    this.root.confirmModal.setProperties(prompts, actionFn, cancelFn);
    this.root.confirmModal.show();
  }

  let component = {
    componentName: 'd3-root',
    children: [
      {
        componentName: 'd3-vertical-hierarchy-root',
        state: {
          name: 'node-inspector'
        },
        hooks: ['initialise']
      }
    ]
  };

  let createNode =  function(data, name) {
    return {
      componentName: 'd3-vertical-hierarchy-node',
      state: {
        name: name,
        data: data
      },
      hooks: ['loadNode']
    };
  };

  let confirmModal = {
    componentName: 'adminui-modal-root',
    state: {
      name: 'node-inspector-confirm-modal'
    },
    hooks: ['augmentProperties'],
    children: [
      {
        componentName: 'adminui-modal-header',
        state: {
          name: 'node-inspector-confirm-modal',
          title: 'Unspecified Action'
        },
        children: [
          {
            componentName: 'adminui-modal-close-button',
          }
        ]
      },
      {
        componentName: 'adminui-modal-body',
        state: {
          name: 'node-inspector-confirm-modal'
        },
        children: [
          {
            componentName: 'adminui-div',
            state: {
              name: 'node-inspector-confirm-modal',
              text: 'Are you sure you want to do this?'
            }
          },
          {
            componentName: 'adminui-form',
            state: {
              name: 'node-inspector-confirm-modal',
              cls: 'user'
            },
            children: [
              {
                componentName: 'adminui-div',
                state: {
                  markup: '<hr />'
                }
              },
              {
                componentName: 'adminui-form-field',
                state: {
                  label: 'Subscript(s):',
                  placeholder: 'Enter one or more subscripts...',
                  name: 'path',
                  focus: true
                }
              },
              {
                componentName: 'adminui-form-field',
                state: {
                  label: 'Value:',
                  placeholder: 'Enter value of data node',
                  name: 'value'
                }
              }
            ]
          }
        ]
      },
      {
        componentName: 'adminui-modal-footer',
        children: [
          {
            componentName: 'adminui-modal-cancel-button',
            state: {
              name: 'node-inspector-confirm-modal'
            }
          },
          {
            componentName: 'adminui-button',
            state: {
              name: 'node-inspector-confirm-modal',
              text: 'Yes',
              colour: 'danger',
              cls: 'btn-block'
            },
          }
        ]
      }
    ]
  };


  let hooks = {
    'adminui-modal-root': {
      augmentProperties: function() {
        let _this = this;
        this.setProperties = function(prompts, actionMethod, cancelMethod) {
          let header = _this.getComponentByName('adminui-modal-header', 'node-inspector-confirm-modal');
          let div = _this.getComponentByName('adminui-div', 'node-inspector-confirm-modal');
          let form = _this.getComponentByName('adminui-form', 'node-inspector-confirm-modal');

          if (prompts.header) {
            header.setState({
              title: prompts.header
            });
          }
          if (prompts.body) {
            div.setState({
              text: prompts.body
            });
            form.hide();
          }
          if (prompts.form) {
            form.show();
          }

          let button = _this.getComponentByName('adminui-button', 'node-inspector-confirm-modal');
          if (prompts.form) {
            button.setState({
              text: 'Save'
            });
          }
          else {
            button.setState({
              text: 'Yes'
            });
          }
          button.onUnload(); // remove any existing handler
          button.addHandler(actionMethod);

          let cancelBtn = _this.getComponentByName('adminui-modal-cancel-button', 'node-inspector-confirm-modal');
          if (cancelBtn.removeOnCancelled) cancelBtn.removeOnCancelled();
          cancelBtn.onCancelled(cancelMethod);
        };
      }
    },
    'd3-vertical-hierarchy-root': {
      initialise: function() {

        console.log('node inspector initialise');

        // add generic confirmation modal

        let _this = this;

        let modal = this.getComponentByName('adminui-modal-root', 'node-inspector-confirm-modal');
        if (!modal) {
          // add modal for confirming actions
          this.loadGroup(confirmModal, document.getElementsByTagName('body')[0], this.context, function() {
            _this.confirmModal = _this.getComponentByName('adminui-modal-root', 'node-inspector-confirm-modal');
          });
        }

        console.log('initialising vertical hierarchy root');

        // Fetch top-level document node

        this.getTopNode = async function(documentName) {

          let responseObj = await QEWD.reply({
            type: 'getDocumentNode',
            params: {
              documentName: documentName
            }
          });
          if (responseObj.message.error) {
            toastr.error(responseObj.message.error)
          }
          else {
            let data = responseObj.message.node;
            _this.idCounter = responseObj.message.idCounter;
            let node = createNode(data, 'node-' + data.id);
            _this.loadGroup(node, _this.childrenTarget, _this.context, function() {
              let node_component = _this.getComponentByName('d3-vertical-hierarchy-node', 'node-' + data.id, _this.rootElement);
              _this.topNode = node_component;
              node_component.parent_node = false;

              let allowEdits = state.allowEdits;

              if (documentName === 'qs') allowEdits = false;

              if (!data.leafNode && node_component.childButtonStatus() === 'expand') {
                allowEdits = false;
              }
              node_component.setState({
                allowEdits: allowEdits
              });

              node_component.onActionBtnClick = appendNode;
              node_component.actionButtonText.textContent = '+';
              node_component.addActionBtnTooltip('Append a new Global Node');

              // disable delete option for top node
              node_component.onShowModal = function() {
                this.root.hideOption('delete');
              };
              let nodes = [{id: data.id, parent: ''}];
              _this.appendNodeData(nodes);
              _this.render();
            });
          }
        };

        console.log('this.getTopNode created');

        /*
        if (this.isReady) {
          console.log('already ready');
          fn();
        }
        else {
          console.log('waiting until ready');
          this.onReady(fn);
        }
        this.renderDocumentNode = function(state) {
          hooks['d3-vertical-hierarchy-root'].initialise.call(this, state);
        }
        */
      }
    },
    'd3-vertical-hierarchy-node': {
      loadNode: function() {

        let html;
        let backgroundColor;

        if (!this.data.parent) {
          this.x = 0;
          this.y = 0;
        }

        if (!this.data.parent && !this.data.leafNode) {
          // top global node with children
          backgroundColor = {
            red: 250,
            green: 70,
            blue: 70
          };
          html = `
<div>
  <br />
  <br />
  <br />
  <center>
    <div class="node-text" style="font-size:20px;font-weight:bold; color: white">${this.data.documentName}</div>
  </center>
</div>
          `;
          this.foTarget.innerHTML = html;
        }

        let _this = this;

        if (this.data.leafNode) {
          // leaf node (including a global with only a value against global name)
          html = `
<div>
  <br />
  <br />
  <center>
    <div>
      <div class="node-text-key" style="font-size:20px;font-weight:bold; color: white">${this.data.subscript}</div>
    </div>
    <br />
    <hr />
    <br />
    <div>
      <div class="node-text-value" style="font-size:16px;font-weight:bold;color: yellow">${this.data.value}</div>
    </div>
  </center>
</div>
          `;
          this.foTarget.innerHTML = html;
        }
        else {
          // intermediate node - but not applicable to top node

          if (this.data.parent) {

            this.x = this.data.parent.x;
            this.y = this.data.parent.y;

            if (this.data.moreSiblings || _this.data.morePreviousSiblings) {
              backgroundColor = {
                red: 255,
                green: 178,
                blue: 102
              };
              html = `
<div>
  <br />
  <br />
  <br />
  <br />
  <center>
    <div class="node-text" style="font-size:20px;font-weight:bold; color: black">${this.data.subscript}</div>
    <hr />
    <br />
    <div style="font-size:22px;font-weight:bold; color: black">or from: <input class="custom-seed" id="seed-' + node.nodeId + '" type="text"></div>
  </center>
</div>
              `;
            }
            else {
              backgroundColor = {
                red: 31,
                green: 182,
                blue: 208
              };
              html = `
<div>
  <br />
  <br />
  <br />
  <center>
    <div class="node-text-key" style="font-size:20px;font-weight:bold; color: white">${this.data.subscript}</div>
  </center>
</div>
              `;
            }
            this.foTarget.innerHTML = html;
            this.seedInput = this.foTarget.querySelector('.custom-seed');
            if (this.seedInput) console.log('**** custom-seed input found ***');
          }

          // add child show/hide button
          this.setState({
            hasChildNodes: true
          });
          //let root = this.getParentComponent('d3-vertical-hierarchy-root');

          this.childrenButtonHandler = async function() {

            if (_this.childButtonStatus() === 'expand') {
              if (_this.child_nodes.length === 0) {

                // children haven't yet been fetched from database

                let parentId = _this.data.id;
                let seed = _this.data.seed;
                if (_this.data.moreSiblings || _this.data.morePreviousSiblings) {
                  parentId = _this.data.parent;
                  if (_this.seedInput && _this.seedInput.value && _this.seedInput.value !== '') {
                    seed = _this.seedInput.value;
                  }
                }

                let responseObj = await QEWD.reply({
                  type: 'getChildNodes',
                  params: {
                    documentName: _this.data.documentName,
                    path: _this.data.path,
                    parentId: parentId,
                    idCounter: _this.root.idCounter,
                    moreSiblings: _this.data.moreSiblings,
                    morePreviousSiblings: _this.data.morePreviousSiblings,
                    seed: seed
                  }
                });
                if (responseObj.message.error) {
                  toastr.error(responseObj.message.error);
                }
                else {
                  // render the newly-fetched child records as nodes
  
                  let parent_node = _this;

                  if (_this.data.moreSiblings || _this.data.morePreviousSiblings) {

                    // set the parent to the parent of the more siblings node
                    parent_node = _this.parent_node;

                    // remove the parent's currently-displayed nodes
                    
                    // first make a clone of the parent array

                    //console.log('clicked the moreSiblings node');
                    //console.log('parent_node.child_nodes array: length = ' + parent_node.child_nodes.length);

                    let node_array = parent_node.child_nodes.slice(0);

                    node_array.forEach(function(node) {
                      node.remove();
                      _this.root.removeFromNodeArray(node);
                    });

                    //console.log('****** parent nodes removed ********');
                
                  }

                  // update the idCounter

                  _this.root.idCounter = responseObj.message.idCounter;

                  let data = responseObj.message.nodes;
                  let nodes = [];
                  let noOfNodes = data.length;
                  let count = 0;
                  data.forEach(function(record) {
                    nodes.push({
                      id: record.id,
                      parent: record.parent
                    });

                    // add the node's component
 
                    let nodeAssembly = createNode(record, 'node-' + record.id);
                    _this.loadGroup(nodeAssembly, _this.root.childrenTarget, _this.context, function() {
                      let node_component = _this.getComponentByName('d3-vertical-hierarchy-node', 'node-' + record.id, _this.root.rootElement);
                      node_component.parent_node = parent_node;
                      if (!record.leafNode) {
                        node_component.onActionBtnClick = appendNode;
                        node_component.actionButtonText.textContent = '+';
                        node_component.addActionBtnTooltip('Append a new Global Node');

                        /*
                        node_component.onShowModal = function() {
                          this.root.hideOption('delete');
                        };
                        */
                      }
                      else {
                        node_component.onActionBtnClick = deleteNode;
                        node_component.actionButtonText.textContent = 'X';
                        node_component.addActionBtnTooltip('Delete this Global Node');

                        /*
                        node_component.onShowModal = function() {
                          this.root.hideOption('append');
                        };
                        */
                      }
                      let allowEdits = state.allowEdits;
                      if (_this.data.documentName === 'qs') allowEdits = false;

                      if (!record.leafNode && _this.childButtonStatus() === 'expand') {
                        allowEdits = false;
                      }
                      node_component.setState({
                        allowEdits: allowEdits
                      });

                      node_component.addLinkToParent(parent_node);
                      parent_node.child_nodes.push(node_component);
                      count++;
                      if (count === noOfNodes) {
                        allowEdits = state.allowEdits;
                        if (_this.data.documentName === 'qs') allowEdits = false;
                        _this.root.appendNodeData(nodes);
                        _this.root.render();
                        parent_node.setChildButtonToCollapse();
                        parent_node.setState({
                          allowEdits: allowEdits
                        });
                      }
                    });
                  });
                }
              }
              else {
                // child nodes have already been fetched, so just bring them back into view

                function resetNodes(parentNode) {
                  if (parentNode.child_nodes && parentNode.child_nodes.length > 0 && parentNode.childButtonStatus() === 'collapse') {
                    parentNode.child_nodes.forEach(function(child) {
                      _this.root.nodeArray.push({
                        id: child.data.id,
                        parent: child.data.parent
                      });
                      resetNodes(child);
                    });
                  }
                }

                _this.setChildButtonToCollapse();
                _this.setState({
                  allowEdits: state.allowEdits
                });
                resetNodes(_this);
                _this.root.render();
              }
            }
            else {
              // collapse and hide child nodes

              function collapseChildNodes(parentNode, collapseThis) {
                if (parentNode.child_nodes) {
                  parentNode.child_nodes.forEach(function(child) {
                    collapseChildNodes(child);
                    child.collapse();
                    _this.root.removeFromNodeArray(child);
                  });
                }
              }
              collapseChildNodes(_this, false);
              _this.setChildButtonToExpand();
              _this.setState({
                allowEdits: false
              });

              // redraw hiearchy in case positions of visible nodes will have changed
              _this.root.render();
            }
          };
          this.addHandler(this.childrenButtonHandler, this.childrenButton);
        }

        /*

        // Don't allow subscript editing for now

        let keyDiv = this.foTarget.querySelector('.node-text-key');

        if (keyDiv && state.allowEdits !== false) {
          let keyFn = function(e) {

            console.log('subscript text clicked for ' + _this.name);
            e.stopPropagation();

            let parent = keyDiv.parentNode;
            let input = document.createElement('input');
            input.type = 'text';
            input.value = keyDiv.textContent;
            let originalValue = input.value;
            input.style = 'font-size: 20pt';

            let kpfn =  function(e){
              if(e.which == 13) {
                e.preventDefault();
                fn(e);
              }
            };
            input.addEventListener('keypress', kpfn);

            let clickfn = function(e) {
              e.preventDefault();
              e.stopPropagation();
              console.log('input clicked');
            };
            input.addEventListener('click', clickfn);

            let fn = function(e) {
              if (e) {
                e.stopPropagation();
              }
              input.removeEventListener('change', fn);
              input.removeEventListener('click', clickfn);
              input.removeEventListener('keypress', kpfn);
              let newValue = input.value;
              keyDiv.textContent = newValue;
              parent.appendChild(keyDiv);
              parent.removeChild(input);

              // now change the subscript value of the global node at the back-end

              if (newValue !== originalValue) {
                console.log('subscript value was changed');
              }
            };
            input.addEventListener('change', fn);
            _this.updateSubscript = fn;

            parent.appendChild(input);
            parent.removeChild(keyDiv);

          }
          this.addHandler(keyFn, keyDiv);

          let nodeFn = function(e) {
            console.log('node ' + _this.name + ' clicked');
            let input = _this.foTarget.querySelector('input');
            if (input) {
              _this.updateSubscript();
            }
          };
          this.addHandler(nodeFn);
        }
        */


        let valueDiv = this.foTarget.querySelector('.node-text-value');

        if (valueDiv && state.allowEdits !== false) {
          let valueFn = function(e) {

            console.log('value text clicked for ' + _this.name);
            e.stopPropagation();

            let parent = valueDiv.parentNode;
            let input = document.createElement('input');
            input.type = 'text';
            input.value = valueDiv.textContent;
            let originalValue = input.value;
            input.style = 'font-size: 20pt';

            let kpfn =  function(e){
              if(e.which == 13) {
                e.preventDefault();
                fn(e);
              }
            };
            input.addEventListener('keypress', kpfn);

            let clickfn = function(e) {
              e.preventDefault();
              e.stopPropagation();
              //console.log('input clicked');
            };
            input.addEventListener('click', clickfn);

            let fn = function(e) {
              if (e) {
                e.stopPropagation();
              }
              input.removeEventListener('change', fn);
              input.removeEventListener('click', clickfn);
              input.removeEventListener('keypress', kpfn);
              let newValue = input.value;
              valueDiv.textContent = newValue;
              parent.appendChild(valueDiv);
              parent.removeChild(input);

              // now change the subscript value of the global node at the back-end

              if (newValue !== originalValue) {
                console.log('subscript value was changed');
                let prompts = {
                  header: 'Global Storage Node Value Change',
                  body: 'You are about to change the value of this Global Storage node from "' + originalValue + '" to "' + newValue + '". Are you sure you want to do this?'
                };
                let actionFn = async function() {
                  let responseObj = await QEWD.reply({
                    type: 'changeNodeValue',
                    params: {
                      documentName: _this.data.documentName,
                      path: _this.data.path,
                      value: newValue
                    }
                  });
                  if (responseObj.message.error) {
                    toastr.error(responseObj.message.error);
                    _this.root.confirmModal.hide();
                  }
                  else {
                    toastr.success('The value of the Global Storage node was changed');
                    _this.root.confirmModal.hide();
                  }
                };
                let cancelFn = function() {
                  valueDiv.textContent = originalValue;
                };
                _this.root.confirmModal.setProperties(prompts, actionFn, cancelFn);
                _this.root.confirmModal.show();
              }
            };
            input.addEventListener('change', fn);
            _this.updateValue = fn;

            parent.appendChild(input);
            parent.removeChild(valueDiv);

          }
          this.addHandler(valueFn, valueDiv);

          let nodeFn = function(e) {
            console.log('node ' + _this.name + ' clicked');
            let input = _this.foTarget.querySelector('input');
            if (input) {
              _this.updateValue();
            }
          };
          this.addHandler(nodeFn);

        }

        this.setState({
          node_position: {x: this.x, y: this.y},
          backgroundColor: backgroundColor
        });
      }
    }
  };

  return {component, hooks};

};

