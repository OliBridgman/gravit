(function (_) {

    /**
     * Layers Palette
     * @class EXLayersPalette
     * @extends EXPalette
     * @constructor
     */
    function EXLayersPalette() {
        EXPalette.call(this);
    };
    GObject.inherit(EXLayersPalette, EXPalette);

    EXLayersPalette.ID = "layers";
    EXLayersPalette.TITLE = new GLocale.Key(EXLayersPalette, "title");

    // -----------------------------------------------------------------------------------------------------------------
    // EXLayersPalette.DocumentState Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @class EXLayersPalette.DocumentState
     * @extends EXPalette.DocumentState
     * @constructor
     */
    EXLayersPalette.DocumentState = function (document) {
        EXPalette.DocumentState.call(this, document);

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
    GObject.inherit(EXLayersPalette.DocumentState, EXPalette.DocumentState);

    /**
     * The container for the layers tree
     * @type {JQuery}
     * @private
     */
    EXLayersPalette.DocumentState.prototype._htmlTreeContainer = null;

    /**
     * A mapping of GXNode to Tree nodes
     * @type {Array<{{node: GXNode, treeId: String}}>}
     * @private
     */
    EXLayersPalette.DocumentState.prototype._treeNodeMap = null;

    /** @override */
    EXLayersPalette.DocumentState.prototype.init = function () {
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

    /** @override */
    EXLayersPalette.DocumentState.prototype.release = function () {
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
    EXLayersPalette.DocumentState.prototype._insertEvent = function (event) {
        if (event.node instanceof GXLayerSet || event.node instanceof GXLayer) {
            this._insertLayerOrSet(event.node);
        }
    };

    /**
     * @param {GXNode.AfterRemoveEvent} event
     * @private
     */
    EXLayersPalette.DocumentState.prototype._removeEvent = function (event) {
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
    EXLayersPalette.DocumentState.prototype._propertiesChangeEvent = function (event) {
        if (event.node instanceof GXLayerSet || event.node instanceof GXLayer) {
            this._updateLayerOrSet(event.node);
        }
    };

    /**
     * @param {GXNode.AfterFlagChangeEvent} event
     * @private
     */
    EXLayersPalette.DocumentState.prototype._flagChangeEvent = function (event) {
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
    EXLayersPalette.DocumentState.prototype._currentLayerChanged = function (event) {
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
    EXLayersPalette.DocumentState.prototype._insertLayerOrSet = function (layerOrSet) {
        // Only add layer/layerSets which have a layerSet as parent
        if (layerOrSet.getParent() instanceof GXLayerSet) {
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
        if (layerOrSet instanceof GXLayerSet) {
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
    EXLayersPalette.DocumentState.prototype._updateLayerOrSet = function (layerOrSet) {
        this._htmlTreeContainer.tree('updateNode', this._getTreeNode(layerOrSet), {
            label: layerOrSet.getProperty('title'),
            layerOrSet: layerOrSet
        });
    };

    /**
     * @param {GXNode} node
     * @return {*}
     * @private
     */
    EXLayersPalette.DocumentState.prototype._getTreeNodeId = function (node) {
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
    EXLayersPalette.DocumentState.prototype._getTreeNode = function (node) {
        return this._htmlTreeContainer.tree('getNodeById', this._getTreeNodeId(node));
    };

    /**
     * @private
     */
    EXLayersPalette.DocumentState.prototype._createListItem = function (node, li) {
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

            //
            // Add lock marker
            //
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

            //
            // Add outline marker
            //
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
    EXLayersPalette.DocumentState.prototype._getMoveTreeNodeInfo = function (position, source, target) {
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
    EXLayersPalette.DocumentState.prototype._canMoveTreeNode = function (moved_node, target_node, position) {
        return this._getMoveTreeNodeInfo(position, moved_node.layerOrSet, target_node.layerOrSet) !== null;
    };

    /**
     * @param event
     * @private
     */
    EXLayersPalette.DocumentState.prototype._moveTreeNode = function (event) {
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
    EXLayersPalette.DocumentState.prototype._clickTreeNode = function (event) {
        event.preventDefault();
        if (event.node && event.node.layerOrSet && event.node.layerOrSet instanceof GXLayer) {
            this.document.getEditor().setCurrentLayer(event.node.layerOrSet);
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // EXLayersPalette Class
    // -----------------------------------------------------------------------------------------------------------------    

    /**
     * @type {JQuery}
     * @private
     */
    EXLayersPalette.prototype._htmlElement = null;

    /** @override */
    EXLayersPalette.prototype.getId = function () {
        return EXLayersPalette.ID;
    };

    /** @override */
    EXLayersPalette.prototype.getTitle = function () {
        return EXLayersPalette.TITLE;
    };

    /** @override */
    EXLayersPalette.prototype.getGroup = function () {
        return EXPalette.GROUP_STRUCTURE;
    };

    /** @override */
    EXLayersPalette.prototype.getShortcut = function () {
        return ['F2'];
    };

    /** @override */
    EXLayersPalette.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /** @override */
    EXLayersPalette.prototype.init = function (htmlElement, menu) {
        EXPalette.prototype.init.call(this, htmlElement, menu);

        this._htmlElement = htmlElement;
        this._htmlElement.append($('<div></div>')
            .addClass('layer-tree-container'));

        //
        // Create Menu
        //
        var newLayerItem = new GUIMenuItem();
        menu.addItem(newLayerItem);
        // TODO : I18N
        newLayerItem.setCaption('Add Layer');
        newLayerItem.addEventListener(GUIMenuItem.UpdateEvent, function () {
            newLayerItem.setEnabled(!!gApp.getActiveDocument());
        }.bind(this));
        newLayerItem.addEventListener(GUIMenuItem.ActivateEvent, function () {
            this._addLayerOrSet(new GXLayer(), gLocale.getValue(GXLayer, "name"));
        }.bind(this));

        var newLayerSetItem = new GUIMenuItem();
        menu.addItem(newLayerSetItem);
        // TODO : I18N
        newLayerSetItem.setCaption('Add Set');
        newLayerSetItem.addEventListener(GUIMenuItem.UpdateEvent, function () {
            newLayerSetItem.setEnabled(!!gApp.getActiveDocument());
        }.bind(this));
        newLayerSetItem.addEventListener(GUIMenuItem.ActivateEvent, function () {
            this._addLayerOrSet(new GXLayerSet(), gLocale.getValue(GXLayerSet, "name"));
        }.bind(this));

        var removeItem = new GUIMenuItem();
        menu.addItem(removeItem);
        // TODO : I18N
        removeItem.setCaption('Remove Layers');
        removeItem.addEventListener(GUIMenuItem.UpdateEvent, function () {
            var currentLayer = gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor().getCurrentLayer() : null;
            removeItem.setEnabled(currentLayer && currentLayer.validateRemoval());
        }.bind(this));
        removeItem.addEventListener(GUIMenuItem.ActivateEvent, function () {
            var currentLayer = gApp.getActiveDocument().getEditor().getCurrentLayer();
            currentLayer.getParent().removeChild(currentLayer);
        }.bind(this));

        menu.addItem(new GUIMenuItem(GUIMenuItem.Type.Divider));

        var _addTypeItem = function (type) {
            var typeItem = new GUIMenuItem();
            menu.addItem(typeItem);
            // TODO : I18N
            typeItem.setCaption('Make ' + gLocale.get(GXLayer.TypeName[type]) + ' Layer');
            typeItem.addEventListener(GUIMenuItem.UpdateEvent, function () {
                var currentLayer = gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor().getCurrentLayer() : null;
                typeItem.setEnabled(currentLayer && currentLayer instanceof GXLayer && currentLayer.getProperty('type') !== type);
                typeItem.setChecked(currentLayer && currentLayer.getProperty('type') === type);
            }.bind(this));
            typeItem.addEventListener(GUIMenuItem.ActivateEvent, function () {
                var currentLayer = gApp.getActiveDocument().getEditor().getCurrentLayer();
                currentLayer.setProperty('type', type);
            }.bind(this));
        };
        _addTypeItem(GXLayer.Type.Vector);
        _addTypeItem(GXLayer.Type.Draft);
        _addTypeItem(GXLayer.Type.Guide);

        menu.addItem(new GUIMenuItem(GUIMenuItem.Type.Divider));

        var lockToLayerItem = new GUIMenuItem();
        menu.addItem(lockToLayerItem);
        // TODO : I18N
        lockToLayerItem.setCaption('Lock to Current Layer');
        lockToLayerItem.addEventListener(GUIMenuItem.UpdateEvent, function () {
            var editor = gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor() : null;
            lockToLayerItem.setEnabled(!!editor);
            lockToLayerItem.setChecked(editor && editor.isLockedToCurrentLayer());
        }.bind(this));
        lockToLayerItem.addEventListener(GUIMenuItem.ActivateEvent, function () {
            var editor = gApp.getActiveDocument().getEditor();
            editor.setLockedToCurrentLayer(!editor.isLockedToCurrentLayer());
        }.bind(this));
    };

    /** @override */
    EXLayersPalette.prototype._createDocumentState = function (document) {
        return new EXLayersPalette.DocumentState(document);
    };

    /** @override */
    EXLayersPalette.prototype._activateDocumentState = function (state) {
        // Attach the state's tree to ourself
        state._htmlTreeContainer.appendTo(this._htmlElement.find('.layer-tree-container'));
    };

    /** @override */
    EXLayersPalette.prototype._deactivateDocumentState = function (state) {
        // Detach the state's tree from ourself
        state._htmlTreeContainer.detach();
    };

    /**
     * @param {GXLayer|GXLayerSet} layerOrSet
     * @param {String} titlePrefix
     * @private
     */
    EXLayersPalette.prototype._addLayerOrSet = function (layerOrSet, titlePrefix) {
        var document = gApp.getActiveDocument();
        var scene = document.getScene();
        var currentLayer = document.getEditor().getCurrentLayer();

        var counter = 1;
        for (; ;) {
            var title = titlePrefix + '-' + counter.toString();
            if (!scene.querySingle(layerOrSet.getNodeName() + '[title="' + title + '"]')) {
                layerOrSet.setProperty('title', title);
                break;
            }
            counter++;
        }

        if (currentLayer) {
            currentLayer.getParent().insertChild(layerOrSet, currentLayer);
        } else {
            document.getScene().getLayerSet().appendChild(layerOrSet);
        }

        if (layerOrSet instanceof GXLayer) {
            document.getEditor().setCurrentLayer(layerOrSet);
        }
    };

    /** @override */
    EXLayersPalette.prototype.toString = function () {
        return "[Object EXLayersPalette]";
    };

    _.EXLayersPalette = EXLayersPalette;
})(this);