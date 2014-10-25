(function (_) {

    /**
     * Layers Palette
     * @class GLayersPalette
     * @extends GPalette
     * @constructor
     */
    function GLayersPalette() {
        GPalette.call(this);
    }

    GObject.inherit(GLayersPalette, GPalette);

    GLayersPalette.ID = "layers";
    GLayersPalette.TITLE = new GLocale.Key(GLayersPalette, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GLayersPalette.prototype._layersTree = null;

    /**
     * @type {Array<*>}
     * @private
     */
    GLayersPalette.prototype._layersTreeNodeMap = null;

    /**
     * @type {JQuery}
     * @private
     */
    GLayersPalette.prototype._layerAddControl = null;

    /**
     * @type {JQuery}
     * @private
     */
    GLayersPalette.prototype._layerDeleteControl = null;

    /** @override */
    GLayersPalette.prototype.getId = function () {
        return GLayersPalette.ID;
    };

    /** @override */
    GLayersPalette.prototype.getTitle = function () {
        return GLayersPalette.TITLE;
    };

    /** @override */
    GLayersPalette.prototype.getGroup = function () {
        return "structure";
    };

    /** @override */
    GLayersPalette.prototype.isEnabled = function () {
        return this._document !== null;
    };

    /** @override */
    GLayersPalette.prototype.isAutoSize = function () {
        return true;
    };

    /** @override */
    GLayersPalette.prototype.init = function (htmlElement, controls) {
        GPalette.prototype.init.call(this, htmlElement, controls);

        this._layersTree = $('<div></div>')
            .addClass('g-list layers')
            .tree({
                data: [],
                dragAndDrop: true,
                openFolderDelay: 500,
                closedIcon: $('<span class="fa fa-caret-right"></span>'),
                openedIcon: $('<span class="fa fa-caret-down"></span>'),
                slide: false,
                selectable: false,
                onIsMoveHandle: function ($element) {
                    return ($element.is('.jqtree-title'));
                },
                onCreateLi: this._createLayerTreeItem.bind(this),
                onCanMoveTo: this._canMoveLayerTreeNode.bind(this)
            })
            .on('tree.open', function (evt) {
                if (evt.node.layerOrItem) {
                    evt.node.layerOrItem.setFlag(GNode.Flag.Expanded);
                }
            }.bind(this))
            .on('tree.close', function (evt) {
                if (evt.node.layerOrItem) {
                    evt.node.layerOrItem.removeFlag(GNode.Flag.Expanded);
                }
            }.bind(this))
            .on('tree.click', this._clickLayerTreeNode.bind(this))
            .on('tree.move', this._moveLayerTreeNode.bind(this))
            .appendTo(htmlElement);

        this._layerAddControl =
            $('<button></button>')
                // TODO : I18N
                .attr('title', 'Add Layer')
                .on('click', function () {
                    gApp.executeAction(GAddLayerAction.ID);
                }.bind(this))
                .append($('<span></span>')
                    .addClass('fa fa-plus'))
                .appendTo(controls);

        this._layerDeleteControl =
            $('<button></button>')
                // TODO : I18N
                .attr('title', 'Delete Layer')
                .on('click', function () {
                    gApp.executeAction(GDeleteLayerAction.ID);
                }.bind(this))
                .append($('<span></span>')
                    .addClass('fa fa-trash-o'))
                .appendTo(controls);
    };

    /** @override */
    GLayersPalette.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var scene = this._document.getScene();
            scene.addEventListener(GNode.AfterInsertEvent, this._afterNodeInsert, this);
            scene.addEventListener(GNode.BeforeRemoveEvent, this._beforeNodeRemove, this);
            scene.addEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            scene.addEventListener(GNode.AfterFlagChangeEvent, this._afterFlagChange, this);
            this._clear();
            this.trigger(GPalette.UPDATE_EVENT);
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var scene = this._document.getScene();
            this._document = null;
            scene.removeEventListener(GNode.AfterInsertEvent, this._afterNodeInsert, this);
            scene.removeEventListener(GNode.BeforeRemoveEvent, this._beforeNodeRemove, this);
            scene.removeEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            scene.removeEventListener(GNode.AfterFlagChangeEvent, this._afterFlagChange, this);
            this._clear();
            this.trigger(GPalette.UPDATE_EVENT);
        }
    };

    /** @private */
    GLayersPalette.prototype._clear = function () {
        // Clear layer tree and mark root opened afterwards (!!)
        this._layersTree.tree('loadData', []);
        this._layersTree.tree('getTree').is_open = true;

        this._layersTreeNodeMap = [];

        if (this._document) {
            var activePage = this._document.getScene().getActivePage();
            if (activePage) {
                for (var child = activePage.getFirstChild(); child !== null; child = child.getNext()) {
                    if (child instanceof GLayer) {
                        this._insertLayer(child);
                    }
                }
            }
        }
    };

    /** @private */
    GLayersPalette.prototype._insertLayer = function (layerOrItem) {
        // Create an unique treeId for the new tree node
        var treeId = GUtil.uuid();

        // Either insert before or insert first but ensure to reverse order (last=top)
        var previousNode = layerOrItem.getPrevious() ? this._getLayerTreeNode(layerOrItem.getPrevious()) : null;
        if (previousNode) {
            this._layersTree.tree('addNodeBefore', { id: treeId, layerOrItem: layerOrItem }, previousNode);
        } else {
            var parent = layerOrItem.getParent();
            var parentTreeNode = !parent || parent instanceof GPage ? null : this._getLayerTreeNode(parent);
            var addBeforeNode =  null;

            if (parentTreeNode) {
                if (parentTreeNode.children && parentTreeNode.children.length) {
                    addBeforeNode = parentTreeNode.children[0];
                }
            } else {
                var root = this._layersTree.tree('getTree');
                if (root && root.children && root.children.length) {
                    addBeforeNode = root.children[0];
                }
            }

            if (addBeforeNode) {
                this._layersTree.tree('addNodeBefore', { id: treeId, layerOrItem: layerOrItem }, addBeforeNode);
            } else {
                this._layersTree.tree('appendNode', {id: treeId, layerOrItem: layerOrItem}, parentTreeNode);
            }
        }

        // Insert the mapping
        this._layersTreeNodeMap.push({
            node: layerOrItem,
            treeId: treeId
        });

        // Make an initial update
        this._updateLayer(layerOrItem);

        // Iterate children and add them as well
        if (layerOrItem.hasMixin(GNode.Container)) {
            for (var child = layerOrItem.getFirstChild(); child !== null; child = child.getNext()) {
                if (child instanceof GLayer || child instanceof GItem) {
                    this._insertLayer(child);
                }
            }
        }

        // Gather the new treenode for our node
        var treeNode = this._getLayerTreeNode(layerOrItem);

        // Select if item and selected
        if (layerOrItem instanceof GItem && layerOrItem.hasFlag(GNode.Flag.Selected)) {
            this._layersTree.tree('selectNode', treeNode);
        }

        // Open entry if collapsed
        if (layerOrItem.hasFlag(GNode.Flag.Expanded)) {
            this._layersTree.tree('openNode', treeNode, false);
        }
    };

    /** @private */
    GLayersPalette.prototype._updateLayer = function (layerOrItem) {
        // Gather a tree node for the item
        var treeNode = this._getLayerTreeNode(layerOrItem);

        if (treeNode) {
            // Call an update for the node
            var label = layerOrItem.getLabel();

            this._layersTree.tree('updateNode', treeNode, label);
        }
    };

    /** @private */
    GLayersPalette.prototype._removeLayer = function (layerOrItem) {
        var treeNode = this._getLayerTreeNode(layerOrItem);
        if (treeNode) {
            this._layersTree.tree('removeNode', treeNode);

            // Visit to remove each mapping as well
            layerOrItem.accept(function (node) {
                if (node instanceof GLayer || node instanceof GItem) {
                    for (var i = 0; i < this._layersTreeNodeMap.length; ++i) {
                        if (this._layersTreeNodeMap[i].node === node) {
                            this._layersTreeNodeMap.splice(i, 1);
                            break;
                        }
                    }
                }
            }.bind(this));
        }
    };

    /**
     * @param {GNode.AfterInsertEvent} event
     * @private
     */
    GLayersPalette.prototype._afterNodeInsert = function (event) {
        if (event.node instanceof GLayer || event.node instanceof GItem) {
            var activePage = this._document.getScene().getActivePage();
            if (event.node.getPage() === activePage) {
                this._insertLayer(event.node);
            }
        }
    };

    /**
     * @param {GNode.BeforeRemoveEvent} event
     * @private
     */
    GLayersPalette.prototype._beforeNodeRemove = function (event) {
        if (event.node instanceof GLayer || event.node instanceof GItem) {
            this._removeLayer(event.node);

            // If parent has no more children then update it accordingly
            var parent = event.node.getParent();

            if (parent instanceof GLayer || parent instanceof GItem) {
                var hasChildren = false;
                for (var child = parent.getFirstChild(); child !== null; child = child.getNext()) {
                    if ((child instanceof GLayer || child instanceof GItem) && child !== event.node) {
                        hasChildren = true;
                        break;
                    }
                }

                if (!hasChildren) {
                    parent.removeFlag(GNode.Flag.Expanded);
                    this._updateLayer(parent);
                }
            }
        }
    };

    /**
     * @param {GNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GLayersPalette.prototype._afterPropertiesChange = function (event) {
        if (event.node instanceof GLayer || event.node instanceof GItem) {
            this._updateLayer(event.node);
        }
    };

    /**
     * @param {GNode.AfterFlagChangeEvent} event
     * @private
     */
    GLayersPalette.prototype._afterFlagChange = function (event) {
        if (event.node instanceof GPage && event.flag === GNode.Flag.Active && event.set) {
            // Page activeness change requires clearing layers
            this._clear();
        } else if (event.node instanceof GLayer && (event.flag === GNode.Flag.Active || event.flag === GNode.Flag.Selected || event.flag === GNode.Flag.Expanded)) {
            this._updateLayer(event.node);
        } else if (event.node instanceof GItem && event.flag === GNode.Flag.Selected) {
            this._updateLayer(event.node);
        } else if ((event.node instanceof GLayer || event.node instanceof GItem) && (event.flag === GElement.Flag.Hidden || event.flag === GElement.Flag.Locked)) {
            this._updateLayer(event.node);
        }
    };

    /** @private */
    GLayersPalette.prototype._clickLayerTreeNode = function (evt) {
        if (evt.node.layerOrItem) {
            if (evt.node.layerOrItem instanceof GLayer) {
                this._document.getScene().setActiveLayer(evt.node.layerOrItem);
            } else if (evt.node.layerOrItem instanceof GItem) {
                if (ifPlatform.modifiers.shiftKey || !evt.node.layerOrItem.hasFlag(GNode.Flag.Selected)) {
                    // Add element to selection
                    this._document.getEditor().updateSelection(ifPlatform.modifiers.shiftKey, [evt.node.layerOrItem]);
                } else if (evt.node.layerOrItem.hasFlag(GNode.Flag.Selected)) {
                    // Clear selection leaving only the one element
                    this._document.getEditor().clearSelection([evt.node.layerOrItem]);
                }
            }
        }
    };

    /** @private */
    GLayersPalette.prototype._createLayerTreeItem = function (node, li) {
        if (node.layerOrItem) {
            var layerOrItem = node.layerOrItem;

            // Iterate parents up and collect some information
            var itemLevel = 0;
            var parentHidden = false;
            var parentLocked = false;
            var parentOutlined = false;

            for (var p = layerOrItem.getParent(); p !== null; p = p.getParent()) {
                // Stop on page root
                if (p instanceof GPage) {
                    break;
                }

                // Query information
                parentHidden = p.getProperty('visible') === false || parentHidden;
                parentLocked = p.getProperty('locked') === true || parentLocked;

                if (p instanceof GLayer) {
                    parentOutlined = p.getProperty('otl') === true || parentOutlined;
                }

                itemLevel += 1;
            }

            var isHidden = parentHidden || layerOrItem.getProperty('visible') === false;
            var isLocked = parentLocked || layerOrItem.getProperty('locked') === true;
            var isOutlined = parentOutlined || (layerOrItem instanceof GLayer && layerOrItem.getProperty('otl'));

            // Gather a reference to the element container
            var container = li.find('div.jqtree-element');
            var title = container.find('> .jqtree-title');

            // First, we'll make our title editable and toogle active/selected
            container
                .toggleClass('g-active', layerOrItem.hasFlag(GNode.Flag.Active))
                .toggleClass('g-selected', layerOrItem.hasFlag(GNode.Flag.Selected))
                .gAutoEdit({
                    selector: '> .jqtree-title'
                })
                .on('submitvalue', function (evt, value) {
                    // TODO : I18M
                    if (value && value.trim() !== '') {
                        GEditor.tryRunTransaction(layerOrItem, function () {
                            layerOrItem.setProperty('name', value);
                        }, 'Rename Layer/Item');
                    }
                });

            // Prepend level spacers
            for (var i = 0; i < itemLevel; ++i) {
                $('<span></span>')
                    .addClass('layer-spacer')
                    .prependTo(container);
            }

            // Figure an icon for the item if any
            var icon = null;
            if (layerOrItem instanceof GLayer) {
                icon = layerOrItem.hasFlag(GNode.Flag.Expanded) ? 'folder-open' : 'folder';
            } else if (layerOrItem instanceof GSlice) {
                icon = 'crop';
            } else if (layerOrItem instanceof GShape) {
                if (layerOrItem instanceof GText) {
                    icon = 'font';
                } else if (layerOrItem instanceof GImage) {
                    icon = 'image';
                } else if (layerOrItem instanceof GEllipse) {
                    icon = 'circle';
                } else if (layerOrItem instanceof GRectangle) {
                    icon = 'stop';
                } else if (layerOrItem instanceof GPath || layerOrItem instanceof GCompoundPath) {
                    icon = 'pencil';
                } else if (layerOrItem instanceof GPolygon) {
                    icon = 'star';
                }
            }

            if (icon) {
                $('<span></span>')
                    .addClass('layer-icon fa fa-' + icon)
                    .insertBefore(title);
            }

            // Prepend locked and visibility markers
            $('<span></span>')
                .addClass('layer-lock fa fa-fw fa-' + (isLocked ? 'lock' : 'unlock'))
                .toggleClass('layer-default', !isLocked)
                // TODO : I18N
                .attr('title', 'Toggle Lock')
                .on('click', function (evt) {
                    evt.stopPropagation();
                    if (!parentLocked) {
                        // TODO : I18N
                        GEditor.tryRunTransaction(layerOrItem, function () {
                            layerOrItem.setProperty('locked', !layerOrItem.getProperty('locked'));
                        }, 'Toggle Layer Locked');
                    }
                })
                .prependTo(container);

            $('<span></span>')
                .addClass('layer-visibility fa fa-' + (isHidden ? 'eye-slash' : 'eye'))
                .toggleClass('layer-default', !isHidden)
                // TODO : I18N
                .attr('title', 'Toggle Visibility')
                .on('click', function (evt) {
                    evt.stopPropagation();
                    if (!parentHidden) {
                        var show = !layerOrItem.getProperty('visible');

                        // Remove highlight when made invisible
                        if (!show) {
                            layerOrItem.removeFlag(GNode.Flag.Highlighted);
                        }

                        // TODO : I18N
                        GEditor.tryRunTransaction(layerOrItem, function () {
                            layerOrItem.setProperty('visible', show);
                        }, 'Toggle Layer Visibility');

                        // Show highlight when made visible
                        if (show) {
                            layerOrItem.setFlag(GNode.Flag.Highlighted);
                        }
                    }
                })
                .on('mouseenter', function (evt) {
                    if (!layerOrItem.hasFlag(GElement.Flag.Hidden)) {
                        layerOrItem.setFlag(GNode.Flag.Highlighted);
                    }
                })
                .on('mouseleave', function (evt) {
                    if (!layerOrItem.hasFlag(GElement.Flag.Hidden)) {
                        layerOrItem.removeFlag(GNode.Flag.Highlighted);
                    }
                })
                .prependTo(container);

            // Do some special handling for layers
            if (layerOrItem instanceof GLayer) {
                // Add layer-type as data-attribute for custom styling
                container.attr('data-layer-type', layerOrItem.getProperty('tp'));

                // Don't add outline for guide layers
                if (layerOrItem.getProperty('tp') !== GLayer.Type.Guide) {
                    $('<span></span>')
                        .addClass('layer-outline fa fa-' + (isOutlined ? 'circle-o' : 'circle'))
                        .toggleClass('layer-default', !isOutlined)
                        // TODO : I18N
                        .attr('title', 'Toggle Outline')
                        .on('click', function (evt) {
                            evt.stopPropagation();
                            if (!parentHidden) {
                                // TODO : I18N
                                GEditor.tryRunTransaction(layerOrItem, function () {
                                    layerOrItem.setProperty('otl', !layerOrItem.getProperty('otl'));
                                }, 'Toggle Layer Outline');
                            }
                        })
                        .appendTo(container);
                }

                var patternChange = function (evt, color) {
                    // TODO : I18N
                    GEditor.tryRunTransaction(layerOrItem, function () {
                        var myColor = layerOrItem.getProperty('cls');
                        layerOrItem.setProperty('cls', color);

                        // Apply color to all child layers recursively that
                        // do have the same color as our layer
                        layerOrItem.acceptChildren(function (node) {
                            if (node instanceof GLayer) {
                                var childColor = node.getProperty('cls');
                                if (GUtil.equals(childColor, myColor)) {
                                    node.setProperty('cls', color);
                                }
                            }
                        });
                    }, 'Change Layer Color');
                }

                $('<span></span>')
                    .addClass('layer-color')
                    .gPatternTarget()
                    .gPatternTarget('types', [GColor])
                    .gPatternTarget('value', layerOrItem.getProperty('cls'))
                    .css('background',  GPattern.asCSSBackground(layerOrItem.getProperty('cls')))
                    .on('click', function (evt) {
                        evt.stopPropagation();

                        var $target = $(evt.target);

                        $.gPatternPicker.open({
                            target: $target,
                            scene: this._document.getScene(),
                            types: [GColor],
                            value: $target.gPatternTarget('value'),
                            changeCallback: patternChange
                        });
                    }.bind(this))
                    .on('patternchange', patternChange)
                    .appendTo(container);
            }
        }
    };

    /** @private */
    GLayersPalette.prototype._canMoveLayerTreeNode = function (moved_node, target_node, position) {
        return this._getLayerTreeNodeMoveInfo(position, moved_node.layerOrItem, target_node.layerOrItem) !== null;
    };

    /** @private */
    GLayersPalette.prototype._moveLayerTreeNode = function (event) {
        event.preventDefault();

        var moveInfo = this._getLayerTreeNodeMoveInfo(event.move_info.position,
            event.move_info.moved_node.layerOrItem, event.move_info.target_node.layerOrItem);

        if (moveInfo) {
            // TODO : I18N
            GEditor.tryRunTransaction(this._document.getScene(), function () {
                moveInfo.source.getParent().removeChild(moveInfo.source);
                moveInfo.parent.insertChild(moveInfo.source, moveInfo.before);

                // Having dragged something inside requires to expand parent(s) and update 'em'
                var rootParent = null;
                for (var parent = moveInfo.parent; parent !== null; parent = parent.getParent()) {
                    if (parent instanceof GPage) {
                        break;
                    }

                    parent.setFlag(GNode.Flag.Expanded);
                    rootParent = parent;
                }

                this._updateLayer(rootParent);
            }.bind(this), 'Move Layer/Item');
        }
    };

    /**
     * @param event
     * @return {{parent: GNode, before: GNode, source: GNode}} the result of the move
     * or null if the actual move is not allowed
     * @private
     */
    GLayersPalette.prototype._getLayerTreeNodeMoveInfo = function (position, source, target) {
        target = target || this._document.getScene().getActivePage();

        if (source && target && position !== 'none') {
            var parent = null;
            var before = null;

            if (position === 'inside') {
                parent = target;
                before = null;
            } else if (position == 'after') {
                parent = target.getParent();
                before = target;
            }

            if (before === source) {
                // we can not insert before ourself
                return null;
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
     * @param {GNode} node
     * @return {*}
     * @private
     */
    GLayersPalette.prototype._getLayerTreeNodeId = function (node) {
        if (this._layersTreeNodeMap) {
            for (var i = 0; i < this._layersTreeNodeMap.length; ++i) {
                if (this._layersTreeNodeMap[i].node === node) {
                    return this._layersTreeNodeMap[i].treeId;
                }
            }
        }
    };

    /**
     * @param {GNode} node
     * @return {*}
     * @private
     */
    GLayersPalette.prototype._getLayerTreeNode = function (node) {
        return this._layersTree.tree('getNodeById', this._getLayerTreeNodeId(node));
    };

    /** @override */
    GLayersPalette.prototype.toString = function () {
        return "[Object GLayersPalette]";
    };

    _.GLayersPalette = GLayersPalette;
})(this);