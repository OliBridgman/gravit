(function (_) {
    /**
     * The global idebar class
     * @class EXSidebar
     * @constructor
     * @version 1.0
     */
    function EXSidebar(htmlElement) {
        this._htmlElement = htmlElement;
        this._htmlElement.append($('<div></div>')
            .addClass('layer-tree-container'));
        this._documentStates = [];
    };

    // -----------------------------------------------------------------------------------------------------------------
    // EXSidebar.DocumentState Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @class EXSidebar.DocumentState
     * @constructor
     */
    EXSidebar.DocumentState = function (document) {
        this.document = document;

        // Initiate our tree container widget
        this._htmlTreeContainer = $('<div></div>')
            .addClass('layer-tree')
            .tree({
                data: [],
                dragAndDrop: true,
                openFolderDelay: 0,
                slide: false,
                onIsMoveHandle: function ($element) {
                    return ($element.is('.jqtree-title'));
                },
                onCreateLi: this._createListItem.bind(this),
                onCanMoveTo: this._canMoveTreeNode.bind(this)
            })
            .on('tree.click', this._clickTreeNode.bind(this))
            .on('tree.move', this._moveTreeNode.bind(this));

        // Create empty tree node mapping table
        this._treeNodeMap = [];
    };

    /**
     * @type {EXDocument}
     */
    EXSidebar.DocumentState.prototype.document = null;

    /**
     * The container for the layers tree
     * @type {JQuery}
     * @private
     */
    EXSidebar.DocumentState.prototype._htmlTreeContainer = null;

    /**
     * A mapping of GXNode to Tree nodes
     * @type {Array<{{node: GXNode, treeId: String}}>}
     * @private
     */
    EXSidebar.DocumentState.prototype._treeNodeMap = null;

    EXSidebar.DocumentState.prototype.init = function () {
        var scene = this.document.getScene();
        var editor = this.document.getEditor();

        // Subscribe to the document scene's events
        scene.addEventListener(GXNode.AfterInsertEvent, this._insertEvent, this);
        scene.addEventListener(GXNode.AfterRemoveEvent, this._removeEvent, this);
        scene.addEventListener(GXNode.AfterPropertiesChangeEvent, this._propertiesChangeEvent, this);
        scene.addEventListener(GXNode.AfterFlagChangeEvent, this._flagChangeEvent, this);

        // Subscribe to the editor's events
        editor.addEventListener(GXEditor.CurrentLayerChangedEvent, this._currentLayerChanged, this);

        // Add the root layerSet
        this._insertLayerOrSet(scene.getLayerSet());
    };

    EXSidebar.DocumentState.prototype.release = function () {
        var scene = this.document.getScene();
        var editor = this.document.getEditor();

        // Unsubscribe from the document scene's events
        scene.removeEventListener(GXNode.AfterInsertEvent, this._insertEvent);
        scene.removeEventListener(GXNode.AfterRemoveEvent, this._removeEvent);
        scene.removeEventListener(GXNode.AfterPropertiesChangeEvent, this._propertiesChangeEvent);
        scene.removeEventListener(GXNode.AfterFlagChangeEvent, this._flagChangeEvent);

        // Unsubscribe from the editor's events
        editor.addEventListener(GXEditor.CurrentLayerChangedEvent, this._currentLayerChanged, this);
    };

    /**
     * @param {GXNode.AfterInsertEvent} event
     * @private
     */
    EXSidebar.DocumentState.prototype._insertEvent = function (event) {
        //if (event.node instanceof GXLayerSet || event.node instanceof GXLayer) {
        this._insertLayerOrSet(event.node);
        //}
    };

    /**
     * @param {GXNode.AfterRemoveEvent} event
     * @private
     */
    EXSidebar.DocumentState.prototype._removeEvent = function (event) {
        if (event.node instanceof GXLayerSet || event.node instanceof GXLayer) {
            var _removeMapping = function (layerOrSet) {
                for (var i = 0; i < this._treeNodeMap.length; ++i) {
                    if (this._treeNodeMap[i].node === layerOrSet) {
                        this._treeNodeMap.splice(i, 1);
                        break;
                    }
                }

                // For layerSets we'll remove the sublayer mappings, too
                if (layerOrSet instanceof GXLayerSet) {
                    for (var layer = layerOrSet.getFirstChild(); layer !== null; layer = layer.getNext()) {
                        _removeMapping(layer);
                    }
                }
            }.bind(this);

            // Remove Tree Node, first
            this._htmlTreeContainer.tree('removeNode', this._getTreeNode(event.node));

            // Remove all tree node mappings noew
            _removeMapping(event.node);
        }
    };

    /**
     * @param {GXNode.AfterPropertiesChangeEvent} event
     * @private
     */
    EXSidebar.DocumentState.prototype._propertiesChangeEvent = function (event) {
        if (event.node instanceof GXLayerSet || event.node instanceof GXLayer) {
            this._updateLayerOrSet(event.node);
        }
    };

    /**
     * @param {GXNode.AfterFlagChangeEvent} event
     * @private
     */
    EXSidebar.DocumentState.prototype._flagChangeEvent = function (event) {
        if (event.node instanceof GXLayerSet || event.node instanceof GXLayer) {
            if (event.flag === GXNode.Flag.Active) {
                this._updateLayerOrSet(event.node);
            }
        }
    };

    /**
     * @param {GXEditor.CurrentLayerChangedEvent} event
     * @private
     */
    EXSidebar.DocumentState.prototype._currentLayerChanged = function (event) {
        if (event.previousLayer) {
            this._updateLayerOrSet(event.previousLayer);
        }
        var currentLayer = this.document.getEditor().getCurrentLayer();
        if (currentLayer) {
            this._updateLayerOrSet(currentLayer);
        }
    };

    /**
     * @param {GXLayerSet|GXLayer} layerOrSet
     * @private
     */
    EXSidebar.DocumentState.prototype._insertLayerOrSet = function (layerOrSet) {
        // Only add layer/layerSets which have a layerSet as parent
        //if (layerOrSet.getParent() instanceof GXLayerSet) {
        if (layerOrSet instanceof GXElement) {
            // Create an unique treeId for the new layer/layerSet
            var treeId = gUtil.uuid();

            // Either insert before or append
            var nextNode = layerOrSet.getNext() ? this._getTreeNode(layerOrSet.getNext()) : null;
            if (nextNode) {
                this._htmlTreeContainer.tree('addNodeBefore', { id: treeId, layerOrSet: layerOrSet }, nextNode);
            } else {
                var parentTreeNode = layerOrSet.getParent() === layerOrSet.getScene().getLayerSet() ? null : this._getTreeNode(layerOrSet.getParent());
                this._htmlTreeContainer.tree('appendNode', { id: treeId, layerOrSet: layerOrSet }, parentTreeNode);
            }

            // Insert the mapping
            this._treeNodeMap.push({
                node: layerOrSet,
                treeId: treeId
            });

            // Make an initial update
            this._updateLayerOrSet(layerOrSet);
        }

        // For layerSets we'll add the sublayers
        if (layerOrSet.hasMixin(GXNode.Container)) {
            // We'll always add layers in reverse order to have the topmost layer being on top
            for (var layer = layerOrSet.getFirstChild(); layer !== null; layer = layer.getNext()) {
                this._insertLayerOrSet(layer);
            }
        }
    };

    /**
     * @param {GXLayerSet|GXLayer} layerOrSet
     * @private
     */
    EXSidebar.DocumentState.prototype._updateLayerOrSet = function (layerOrSet) {
        this._htmlTreeContainer.tree('updateNode', this._getTreeNode(layerOrSet), {
            label: layerOrSet instanceof GXLayerBase ? layerOrSet.getProperty('title') : layerOrSet.getNodeNameTranslated(),
            layerOrSet: layerOrSet
        });
    };

    /**
     * @param {GXNode} node
     * @return {*}
     * @private
     */
    EXSidebar.DocumentState.prototype._getTreeNodeId = function (node) {
        for (var i = 0; i < this._treeNodeMap.length; ++i) {
            if (this._treeNodeMap[i].node === node) {
                return this._treeNodeMap[i].treeId;
            }
        }
    };

    /**
     * @param {GXNode} node
     * @return {*}
     * @private
     */
    EXSidebar.DocumentState.prototype._getTreeNode = function (node) {
        return this._htmlTreeContainer.tree('getNodeById', this._getTreeNodeId(node));
    };

    /**
     * @private
     */
    EXSidebar.DocumentState.prototype._createListItem = function (node, li) {
        if (node.layerOrSet) {
            var layerOrSet = node.layerOrSet;
            var scene = this.document.getScene();
            var editor = this.document.getEditor();

            // Mark our list element selected if either our layer has the active flag
            // or the editor doesn't have a selection and our layer is the current one
            if (layerOrSet.hasFlag(GXNode.Flag.Active) || (!editor.hasSelection() && layerOrSet === editor.getCurrentLayer())) {
                li.addClass('jqtree-selected');
            } else {
                li.removeClass('jqtree-selected');
            }

            // Attach an auto-input for editing the layer's title
            li.find('.jqtree-title')
                .gAutoSize({
                    getter: function () {
                        return layerOrSet.getProperty('title');
                    },
                    setter: function (value) {
                        if (value && value.trim() !== "") {
                            layerOrSet.setProperty('title', value.trim());
                        }
                    }
                });

            // Hacky: Clicking on a li element should kill any active input editor
            li.on('click', function () {
                this._htmlTreeContainer.find('.jqtree-title').each(function () {
                    $(this).gAutoSize('finish');
                });
            }.bind(this));

            // Gather our container for insertions
            var container = li.find('div.jqtree-element');

            // Iterate parents up and collect information about them
            var parentHidden = false;
            var parentLocked = false;
            var parentOutlined = false;

            for (var p = layerOrSet.getParent(); p !== null; p = p.getParent()) {
                if (p.hasMixin(GXNode.Properties)) {
                    // Stop on root layerSet
                    if (p === scene.getLayerSet()) {
                        break;
                    }

                    // Query information
                    parentHidden = p.getProperty('visible') === false || parentHidden;
                    //parentLocked = p.hasFlag(GXNode.Flag.Locked.Flag.Hidden) || parentHidden;
                    parentOutlined = p.getProperty('outline') === true || parentOutlined;

                    // Append a hidden toggler to ensure proper spacing
                    container.prepend($('<a class="jqtree_common jqtree-toggler" style="visibility: hidden;">▼</a>'));
                }
            }

            //
            // Add folder marker if any
            //
            if (layerOrSet instanceof GXLayerSet) {
                $('<span></span>')
                    .addClass('layer-icon fa fa-folder-o')
                    // TODO : I18N
                    .attr('title', 'Layer-Set')
                    .insertBefore(container.find('.jqtree-title'));
            }

            //
            // Add visibility marker
            //
            if (node.layerOrSet instanceof GXLayerBase) {
                var isHidden = parentHidden || layerOrSet.getProperty('visible') === false;
                $('<span></span>')
                    .addClass('layer-icon layer-icon-action fa')
                    .addClass(isHidden ? 'layer-icon-light fa-eye-slash' : 'fa-eye')
                    // TODO : I18N
                    .attr('title', 'Click to show/hide layer')
                    .on('click', function (evt) {
                        evt.stopPropagation();
                        evt.preventDefault();

                        layerOrSet.setProperty('visible', !layerOrSet.getProperty('visible'));
                    })
                    .prependTo(container);
            }

            //
            // Add lock marker
            //
            if (node.layerOrSet instanceof GXLayerBase) {
                var isLocked = parentLocked;// || layerOrSet.getProperty(GXLayer.PROPERTY_LOCKED) === false;
                $('<span></span>')
                    .addClass('layer-icon layer-icon-action fa')
                    .addClass(isLocked ? 'fa-lock' : 'layer-icon-light fa-unlock-alt')
                    // TODO : I18N
                    .attr('title', 'Click to lock/unlock layer')
                    .on('click', function (evt) {
                        evt.stopPropagation();
                        evt.preventDefault();

                        //layerOrSet.setProperty(GXLayer.PROPERTY_LOCKED, !layerOrSet.getProperty(GXLayer.PROPERTY_LOCKED));
                    })
                    .appendTo(container);
            }

            //
            // Add outline marker
            //
            if (node.layerOrSet instanceof GXLayerBase) {
                var isOutline = parentOutlined || layerOrSet.getProperty('outline') === true;
                $('<span></span>')
                    .addClass('layer-icon layer-icon-action fa')
                    .addClass(isOutline ? 'fa-circle-o' : 'layer-icon-light fa-circle')
                    // TODO : I18N
                    .attr('title', 'Click to show/hide outline of layer')
                    .on('click', function (evt) {
                        evt.stopPropagation();
                        evt.preventDefault();

                        layerOrSet.setProperty('outline', !layerOrSet.getProperty('outline'));
                    })
                    .appendTo(container);
            }

            //
            // Add color marker
            //
            $('<span></span>')
                .addClass('layer-color')
                .gColorBox()
                .gColorBox('value', GXColor.parseColor(layerOrSet.getProperty('color')))
                .on('change', function (evt, color) {
                    if (layerOrSet instanceof GXLayerSet) {
                        var myColor = GXColor.parseColor(layerOrSet.getProperty('color'));

                        // TODO : Undo group

                        // Apply color to all child layers recursively that
                        // do have the same color as our layer
                        layerOrSet.acceptChildren(function (node) {
                            if (node instanceof GXLayerBase) {
                                var childColor = GXColor.parseColor(node.getProperty('color'));
                                if (GXColor.equals(childColor, myColor)) {
                                    node.setProperty('color', color.asString());
                                }
                            }
                        });
                    } else {
                        layerOrSet.setProperty('color', color.asString());
                    }
                })
                .appendTo(container);
        }
    };

    /**
     * @param event
     * @return {{parent: GXNode, before: GXNode, source: GXNode}} the result of the move
     * or null if the actual move is not allowed
     * @private
     */
    EXSidebar.DocumentState.prototype._getMoveTreeNodeInfo = function (position, source, target) {
        if (source && target && position !== 'none') {
            var parent = null;
            var before = null;

            if (position === 'inside') {
                parent = target;
                before = target.getFirstChild();
            } else if (position === 'before') {
                parent = target.getParent();
                before = target;
            } else if (position == 'after') {
                parent = target.getParent();
                before = target.getNext();
            }

            if (source.validateInsertion(parent, before)) {
                return {
                    parent: parent,
                    before: before,
                    source: source
                };
            }
        }

        return null;
    };

    /**
     * @param event
     * @private
     */
    EXSidebar.DocumentState.prototype._canMoveTreeNode = function (moved_node, target_node, position) {
        return this._getMoveTreeNodeInfo(position, moved_node.layerOrSet, target_node.layerOrSet) !== null;
    };

    /**
     * @param event
     * @private
     */
    EXSidebar.DocumentState.prototype._moveTreeNode = function (event) {
        event.preventDefault();

        var moveInfo = this._getMoveTreeNodeInfo(event.move_info.position,
            event.move_info.moved_node.layerOrSet, event.move_info.target_node.layerOrSet);

        if (moveInfo) {
            // TODO : UNDO-GROUP HERE

            // Save and reset if layer is current layer
            var wasCurrentLayer = moveInfo.source === this.document.getEditor().getCurrentLayer();

            moveInfo.source.getParent().removeChild(moveInfo.source);
            moveInfo.parent.insertChild(moveInfo.source, moveInfo.before);

            if (wasCurrentLayer) {
                this.document.getEditor().setCurrentLayer(moveInfo.source);
            }
        }
    };

    /**
     * @param event
     * @private
     */
    EXSidebar.DocumentState.prototype._clickTreeNode = function (event) {
        event.preventDefault();
        if (event.node && event.node.layerOrSet && event.node.layerOrSet instanceof GXLayer) {
            this.document.getEditor().setCurrentLayer(event.node.layerOrSet);
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // EXSidebar Class
    // -----------------------------------------------------------------------------------------------------------------    

    /**
     * @type {HTMLDivElement}
     * @private
     */
    EXSidebar.prototype._htmlElement = null;

    /**
     * @type {Array<EXSidebar.DocumentState>}
     * @private
     */
    EXSidebar.prototype._documentStates = null;

    /**
     * Called from the workspace to initialize
     */
    EXSidebar.prototype.init = function () {
        gApp.addEventListener(EXApplication.DocumentEvent, this._documentEvent, this);
    };

    /**
     * Called from the workspace to relayout
     */
    EXSidebar.prototype.relayout = function () {
        // NO-OP
    };

    /**
     * @param {EXApplication.DocumentEvent} event
     * @private
     */
    EXSidebar.prototype._documentEvent = function (event) {
        switch (event.type) {
            case EXApplication.DocumentEvent.Type.Added:
                // Initiate a new state and add it
                var state = new EXSidebar.DocumentState(event.document);
                state.init();
                this._documentStates.push(state);
                break;
            case EXApplication.DocumentEvent.Type.Removed:
                // Find and release state
                var state = this._findDocumentState(event.document);
                if (state) {
                    state.release();
                    this._documentStates.splice(this._documentStates.indexOf(state), 1);
                }
                break;
            case EXApplication.DocumentEvent.Type.Activated:
                // Find and activate state
                var state = this._findDocumentState(event.document);
                if (state) {
                    //state.activate();
                    // Attach the state's tree to ourself
                    state._htmlTreeContainer.appendTo(this._htmlElement.find('.layer-tree-container'));
                }
                break;
            case EXApplication.DocumentEvent.Type.Deactivated:
                // Find and deactivate state
                var state = this._findDocumentState(event.document);
                if (state) {
                    //state.deactivate();
                    // Detach the state's tree from ourself
                    state._htmlTreeContainer.detach();
                }
                break;

            default:
                break;
        }
    };

    /**
     * @param {EXDocument} document
     * @return {EXSidebar.DocumentState}
     * @private
     */
    EXSidebar.prototype._findDocumentState = function (document) {
        for (var i = 0; i < this._documentStates.length; ++i) {
            if (this._documentStates[i].document === document) {
                return this._documentStates[i];
            }
        }
    };

    _.EXSidebar = EXSidebar;
})(this);