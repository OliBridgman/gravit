(function (_) {

    /**
     * Object Palette
     * @class GPropertiesPalette
     * @extends GPalette
     * @constructor
     */
    function GPropertiesPalette() {
        GPalette.call(this);
        this._propertyPanels = [];
    }

    IFObject.inherit(GPropertiesPalette, GPalette);

    GPropertiesPalette.ID = "properties";
    GPropertiesPalette.TITLE = new IFLocale.Key(GPropertiesPalette, "title");

    // -----------------------------------------------------------------------------------------------------------------
    // GPropertiesPalette.DocumentState Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @class GPropertiesPalette.DocumentState
     * @extends GPalette.DocumentState
     * @constructor
     */
    GPropertiesPalette.DocumentState = function (document, propertyPanels) {
        GPalette.DocumentState.call(this, document);
        this._propertyPanels = propertyPanels;
        this._objectTree = null;
    };
    IFObject.inherit(GPropertiesPalette.DocumentState, GPalette.DocumentState);

    /**
     * The property panels
     * @type {Array<{{category: JQuery, panel: JQuery, properties: GProperties}}>}
     * @private
     */
    GPropertiesPalette.DocumentState.prototype._propertyPanels = null;

    /**
     * The container for the object tree
     * @type {JQuery}
     * @private
     */
    GPropertiesPalette.DocumentState.prototype._objectTree = null;

    /**
     * A mapping of IFNode to Tree nodes
     * @type {Array<{{node: IFNode, treeId: String}}>}
     * @private
     */
    GPropertiesPalette.DocumentState.prototype._treeNodeMap = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GPropertiesPalette.DocumentState.prototype._elements = null;

    /** @override */
    GPropertiesPalette.DocumentState.prototype.init = function () {
        var scene = this.document.getScene();

        // Subscribe to the document scene's events
        scene.addEventListener(IFNode.AfterInsertEvent, this._afterInsert, this);
        scene.addEventListener(IFNode.AfterRemoveEvent, this._afterRemove, this);
        scene.addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
        scene.addEventListener(IFNode.AfterFlagChangeEvent, this._afterFlagChange, this);
    };

    /** @override */
    GPropertiesPalette.DocumentState.prototype.release = function () {
        var scene = this.document.getScene();

        // Unsubscribe from the document scene's events
        scene.removeEventListener(IFNode.AfterInsertEvent, this._afterInsert);
        scene.removeEventListener(IFNode.AfterRemoveEvent, this._afterRemove);
        scene.removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
        scene.removeEventListener(IFNode.AfterFlagChangeEvent, this._afterFlagChange);
    };

    /** @override */
    GPropertiesPalette.DocumentState.prototype.activate = function () {
        if (!this._objectTree) {
            // First time activation
            this._objectTree = $('<div></div>')
                .addClass('object-tree')
                .tree({
                    data: [],
                    dragAndDrop: true,
                    openFolderDelay: 0,
                    slide: false,
                    onIsMoveHandle: function ($element) {
                        return ($element.is('.jqtree-title'));
                    }/*,
                     onCreateLi: this._createListItem.bind(this)*/,
                    onCanMoveTo: this._canMoveTreeNode.bind(this)
                })
                .on('tree.click', this._clickTreeNode.bind(this))
                .on('tree.move', this._moveTreeNode.bind(this))

            this._updateFromSelection();
        }

        var editor = this.document.getEditor();

        // Subscribe to the editor's events
        editor.addEventListener(IFEditor.SelectionChangedEvent, this._updateFromSelection, this);

        // Update property panels
        this._updatePropertyPanels();
    };

    /** @override */
    GPropertiesPalette.DocumentState.prototype.deactivate = function () {
        var editor = this.document.getEditor();

        // Unsubscribe from the editor's events
        editor.addEventListener(IFEditor.SelectionChangedEvent, this._updateFromSelection, this);

        // Remove all property panels
        for (var i = 0; i < this._propertyPanels.length; ++i) {
            var propertyPanel = this._propertyPanels[i];
            propertyPanel.category.css('display', 'none');
            propertyPanel.panel.css('display', 'none');
            propertyPanel.panel.attr('data-available', 'false');
        }
    };

    /**
     * @param {IFNode.AfterInsertEvent} event
     * @private
     */
    GPropertiesPalette.DocumentState.prototype._afterInsert = function (event) {
        if (event.node instanceof IFAttribute) {
            // Check if attribute is owned by any of our elements
            var ownerElement = event.node.getOwnerElement();
            if (this._elements && ownerElement) {
                for (var i = 0; i < this._elements.length; ++i) {
                    if (this._elements[i] === ownerElement) {
                        this._insertAttributeNode(event.node, true);
                    }
                }
            }
        }
    };

    /**
     * @param {IFNode.AfterRemoveEvent} event
     * @private
     */
    GPropertiesPalette.DocumentState.prototype._afterRemove = function (event) {
        if (event.node instanceof IFAttribute) {
            var treeNode = this._getTreeNode(event.node);

            if (treeNode) {
                // If it is the selected node, then select root, first
                var selectedNode = this._objectTree.tree('getSelectedNode');
                if (selectedNode === treeNode) {
                    this._objectTree.tree('selectNode', this._objectTree.tree('getNodeById', '#'));
                    this._updatePropertyPanels();
                }

                // Remove the tree node, first
                this._objectTree.tree('removeNode', treeNode);

                // Iterate node and remove all tree mappings
                event.node.accept(function (node) {
                    for (var i = 0; i < this._treeNodeMap.length; ++i) {
                        if (this._treeNodeMap[i].node === node) {
                            this._treeNodeMap.splice(i, 1);
                            break;
                        }
                    }
                }.bind(this));
            }
        }
    };

    /**
     * @param {IFNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GPropertiesPalette.DocumentState.prototype._afterPropertiesChange = function (event) {
        // TODO
    };

    /**
     * @param {IFNode.AfterFlagChangeEvent} event
     * @private
     */
    GPropertiesPalette.DocumentState.prototype._afterFlagChange = function (event) {
        // TODO
    };

    /**
     * @param event
     * @return {{parent: IFNode, before: IFNode, source: IFNode}} the result of the move
     * or null if the actual move is not allowed
     * @private
     */
    GPropertiesPalette.DocumentState.prototype._getMoveTreeNodeInfo = function (position, source, target) {
        // special case: no target means root element
        if (!target) {
            target = this._elements[0];
        }

        if (source && target && position !== 'none') {
            var parent = null;
            var before = null;

            // Special case when source is attribute and target element
            if (source instanceof IFAttribute && target instanceof IFElement) {
                if (!target.hasMixin(IFElement.Attributes)) {
                    return null;
                }
                target = target.getAttributes();
            }

            if (position === 'inside') {
                if (!target.hasMixin(IFNode.Container)) {
                    return null;
                }
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
    GPropertiesPalette.DocumentState.prototype._canMoveTreeNode = function (moved_node, target_node, position) {
        // TODO : Support multiple elements drag'drop one day..
        if (this._elements.length > 1) {
            return null;
        }

        return this._getMoveTreeNodeInfo(position, moved_node.node, target_node.node) !== null;
    };

    /**
     * @param event
     * @private
     */
    GPropertiesPalette.DocumentState.prototype._moveTreeNode = function (event) {
        event.preventDefault();

        var moveInfo = this._getMoveTreeNodeInfo(event.move_info.position,
            event.move_info.moved_node.node, event.move_info.target_node.node);

        if (moveInfo) {
            var editor = this.document.getEditor();
            editor.beginTransaction();
            try {
                var selectedNode = this._objectTree.tree('getSelectedNode');
                var restoreSourceSelection = false;
                if (selectedNode && selectedNode.node == moveInfo.source) {
                    restoreSourceSelection = true;
                }

                moveInfo.source.getParent().removeChild(moveInfo.source);
                moveInfo.parent.insertChild(moveInfo.source, moveInfo.before);

                if (restoreSourceSelection) {
                    this._objectTree.tree('selectNode', this._getTreeNode(moveInfo.source));
                    this._updatePropertyPanels();
                }
            } finally {
                // TODO : I18N
                editor.commitTransaction('Drag Properties');
            }
        }
    };

    /**
     * @param event
     * @private
     */
    GPropertiesPalette.DocumentState.prototype._clickTreeNode = function (event) {
        event.preventDefault();

        if (event.node) {
            //event.node.setFlag(IFNode.Flag.Selected);
            this._objectTree.tree('selectNode', event.node);
            this._updatePropertyPanels();
        }
    };

    /**
     * @private
     */
    GPropertiesPalette.DocumentState.prototype._updateFromSelection = function () {
        var elements = this.document.getEditor().getSelection();

        // If there's no selection, select the scene
        if (!elements || elements.length === 0) {
            elements = [this.document.getScene()];
        }

        this._objectTree.tree('selectNode', null);
        this._objectTree.tree('loadData', []);
        this._treeNodeMap = [];
        this._elements = elements;

        // Insert our selection as root node(s)
        var rootLabel = elements[0].getNodeNameTranslated();
        if (elements.length > 1) {
            // TODO : I18N
            rootLabel = elements.length.toString() + ' Objects';
        } else if (elements[0] instanceof IFBlock) {
            rootLabel = elements[0].getLabel();
        }

        this._objectTree.tree('appendNode', { id: '#', label: rootLabel });

        // Iterate attributes
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i] instanceof IFElement && elements[i].hasMixin(IFElement.Attributes)) {
                this._insertAttributeNode(elements[i].getAttributes());
            }
        }

        // Select root node by default
        this._objectTree.tree('selectNode', this._objectTree.tree('getNodeById', '#'));
        this._updatePropertyPanels();
    };

    /** @private */
    GPropertiesPalette.DocumentState.prototype._updatePropertyPanels = function () {
        var activeNode = null;
        var selectedTreeNode = this._objectTree.tree('getSelectedNode');
        if (selectedTreeNode !== null && selectedTreeNode.id !== '#'/*root*/) {
            activeNode = selectedTreeNode.node;
        }

        var lastVisiblePropertyPanel = null;
        for (var i = 0; i < this._propertyPanels.length; ++i) {
            var propertyPanel = this._propertyPanels[i];
            var available = !this._elements || this._elements.length === 0 ?
                false : propertyPanel.properties.updateFromNode(this.document, this._elements, activeNode);

            propertyPanel.panel.removeClass('last-visible');
            if (available) {
                propertyPanel.category.css('display', '');

                if (propertyPanel.category.attr('data-expanded') == 'true') {
                    propertyPanel.panel.css('display', '');
                }

                propertyPanel.panel.attr('data-available', 'true');

                lastVisiblePropertyPanel = propertyPanel;
            } else {
                propertyPanel.category.css('display', 'none');
                propertyPanel.panel.css('display', 'none');
                propertyPanel.panel.attr('data-available', 'false');
            }
        }

        if (lastVisiblePropertyPanel) {
            lastVisiblePropertyPanel.panel.addClass('last-visible');
        }
    };

    /** @private */
    GPropertiesPalette.DocumentState.prototype._insertAttributeNode = function (attribute, select) {
        var canAdd = true;
        var forceAddChildren = false;

        // Avoid to add root attribute but force children
        if (attribute.getParent() instanceof IFElement) {
            canAdd = false;
            forceAddChildren = true;
        }

        if (canAdd && this._elements.length > 1) {
            // TODO :
            // For multiple element selection we'll only pick up
            // attribute on the root that are contained
            // TODO : Take care on attribute references

            var treeRoot = this._objectTree.tree('getNodeById', '#');
            // Iterate existing attribute nodes on root
            if (treeRoot && treeRoot.children) {
                for (var i = 0; i < treeRoot.children.length; i++) {
                    var node = treeRoot.children[i];
                    if (node.node.constructor === attribute.constructor) {
                        canAdd = false;
                        break;
                    }
                }
            }
        }

        if (canAdd) {
            // Create an unique treeId for the new attribute
            var treeId = gUtil.uuid();

            // Insert into tree
            var nextTreeNode = attribute.getNext() ? this._getTreeNode(attribute.getNext()) : null;
            if (nextTreeNode) {
                this._objectTree.tree('addNodeBefore', { id: treeId, node: attribute }, nextTreeNode);
            } else {
                var parentTreeNode = null;
                var parent = attribute.getParent();
                if (parent) {
                    parentTreeNode = this._getTreeNode(attribute.getParent());
                }
                if (!parentTreeNode) {
                    // No parent found then root to root node
                    parentTreeNode = this._objectTree.tree('getNodeById', '#');
                }
                this._objectTree.tree('appendNode', { id: treeId, node: attribute }, parentTreeNode);
            }

            // Insert the mapping
            this._treeNodeMap.push({
                node: attribute,
                treeId: treeId
            });

            // Make an initial update
            this._updateNodeProperties(attribute);

            var newNode = this._getTreeNode(attribute);

            // Open the parent if any
            if (newNode.parent) {
                this._objectTree.tree('openNode', newNode.parent, false);
            }

            // Select it by default if desired
            if (select) {
            this._objectTree.tree('selectNode', newNode);
            this._updatePropertyPanels();
            }
        }

        // Add children (if any)
        if ((canAdd || forceAddChildren) && attribute.hasMixin(IFNode.Container)) {
            for (var child = attribute.getFirstChild(); child !== null; child = child.getNext()) {
                if (child instanceof IFAttribute) {
                    this._insertAttributeNode(child);
                }
            }
        }

        if (canAdd) {
            // Open the node by default
            this._objectTree.tree('openNode', this._getTreeNode(attribute), false);
        }
    };

    /**
     * @param {IFNode} node
     * @private
     */
    GPropertiesPalette.DocumentState.prototype._updateNodeProperties = function (node) {
        var treeNode = this._getTreeNode(node);
        if (treeNode) {
            this._objectTree.tree('updateNode', treeNode, {
                label: node.getNodeNameTranslated(),
                node: node
            });
        }
    };

    /**
     * @param {IFNode} node
     * @return {*}
     * @private
     */
    GPropertiesPalette.DocumentState.prototype._getTreeNodeId = function (node) {
        for (var i = 0; i < this._treeNodeMap.length; ++i) {
            if (this._treeNodeMap[i].node === node) {
                return this._treeNodeMap[i].treeId;
            }
        }
    };

    /**
     * @param {IFNode} node
     * @return {*}
     * @private
     */
    GPropertiesPalette.DocumentState.prototype._getTreeNode = function (node) {
        return this._objectTree.tree('getNodeById', this._getTreeNodeId(node));
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GPropertiesPalette Class
    // -----------------------------------------------------------------------------------------------------------------    

    /**
     * @type {JQuery}
     * @private
     */
    GPropertiesPalette.prototype._htmlElement = null;

    /**
     * The property panels
     * @type {Array<{{category: JQuery, panel: JQuery, properties: GProperties}}>}
     * @private
     */
    GPropertiesPalette.prototype._propertyPanels = null;

    /** @override */
    GPropertiesPalette.prototype.getId = function () {
        return GPropertiesPalette.ID;
    };

    /** @override */
    GPropertiesPalette.prototype.getTitle = function () {
        return GPropertiesPalette.TITLE;
    };

    /** @override */
    GPropertiesPalette.prototype.getGroup = function () {
        return GPalette.GROUP_PROPERTIES;
    };

    /**
     * @override
     */
    GPropertiesPalette.prototype.getShortcut = function () {
        return [IFKey.Constant.META, 'F3'];
    };

    /** @override */
    GPropertiesPalette.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /** @override */
    GPropertiesPalette.prototype.init = function (htmlElement, menu) {
        GPalette.prototype.init.call(this, htmlElement, menu);

        this._htmlElement = htmlElement;

        var propertiesPanels = $('<div></div>')
            .addClass('properties-panels')
            .appendTo(this._htmlElement);

        var _addPropertiesPanel = function (properties) {
            // Create panel
            var panel = $('<div></div>')
                .css('display', 'none')
                .attr('data-available', 'false')
                .addClass('properties-panel-content');

            // Append category
            var category = $('<div></div>')
                .addClass('properties-panel-category')
                .css('display', 'none')
                .attr('data-expanded', 'true')
                .append($('<div></div>')
                    .addClass('title')
                    .append($('<i></i>')
                        .addClass('fa fa-caret-down'))
                    .append($('<span></span>')
                        .text(ifLocale.get(properties.getCategory())))
                    .on('click', function () {
                        if (panel.attr('data-available') === 'true') {
                            var me = $(this);
                            var icon = me.find('i.fa');
                            if (panel.css('display') !== 'none') {
                                panel.css('display', 'none');
                                icon.attr('class', 'fa fa-caret-right');
                                me.attr('data-expanded', 'false');
                            } else {
                                panel.css('display', '');
                                icon.attr('class', 'fa fa-caret-down');
                                me.attr('data-expanded', 'true');
                            }
                        }
                    }))
                .append($('<div></div>')
                    .addClass('controls'))
                .appendTo(propertiesPanels);

            // Init properties
            properties.init(panel, category.find('.controls'), menu);

            // Append panel
            panel.appendTo(propertiesPanels);

            this._propertyPanels.push({
                category: category,
                panel: panel,
                properties: properties
            })
        }.bind(this);

        // Initialize our properties panels
        for (var i = 0; i < gravit.properties.length; ++i) {
            _addPropertiesPanel(gravit.properties[i]);
        }
    };

    /** @override */
    GPropertiesPalette.prototype._createDocumentState = function (document) {
        return new GPropertiesPalette.DocumentState(document, this._propertyPanels);
    };

    /** @override */
    GPropertiesPalette.prototype._activateDocumentState = function (state) {
        // Attach the state's tree to ourself
        state._objectTree.prependTo(this._htmlElement);
    };

    /** @override */
    GPropertiesPalette.prototype._deactivateDocumentState = function (state) {
        // Detach the state's tree from ourself
        state._objectTree.detach();
    };

    /** @override */
    GPropertiesPalette.prototype.toString = function () {
        return "[Object GPropertiesPalette]";
    };

    _.GPropertiesPalette = GPropertiesPalette;
})(this);