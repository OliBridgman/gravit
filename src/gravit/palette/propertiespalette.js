(function (_) {

    /**
     * Object Palette
     * @class EXPropertiesPalette
     * @extends EXPalette
     * @constructor
     */
    function EXPropertiesPalette() {
        EXPalette.call(this);

        this._propertyPanels = [];
    };
    GObject.inherit(EXPropertiesPalette, EXPalette);

    EXPropertiesPalette.ID = "properties";
    EXPropertiesPalette.TITLE = new GLocale.Key(EXPropertiesPalette, "title");

    // -----------------------------------------------------------------------------------------------------------------
    // EXPropertiesPalette.DocumentState Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @class EXPropertiesPalette.DocumentState
     * @extends EXPalette.DocumentState
     * @constructor
     */
    EXPropertiesPalette.DocumentState = function (document, propertyPanels) {
        EXPalette.DocumentState.call(this, document);

        this._propertyPanels = propertyPanels;

        // Initiate our tree container widget
        this._htmlTreeContainer = $('<div></div>')
            .addClass('object-tree')
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
            .on('tree.select', this._selectTreeNode.bind(this))
            .on('tree.move', this._moveTreeNode.bind(this));

        // Create empty tree node mapping table
        this._treeNodeMap = [];
    };
    GObject.inherit(EXPropertiesPalette.DocumentState, EXPalette.DocumentState);

    /**
     * The property panels
     * @type {Array<{{category: JQuery, panel: JQuery, properties: EXProperties}}>}
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._propertyPanels = null;

    /**
     * The container for the pages tree
     * @type {JQuery}
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._htmlTreeContainer = null;

    /**
     * A mapping of GXNode to Tree nodes
     * @type {Array<{{node: GXNode, treeId: String}}>}
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._treeNodeMap = null;

    /** @override */
    EXPropertiesPalette.DocumentState.prototype.init = function () {
        var scene = this.document.getScene();

        // Subscribe to the document scene's events
        scene.addEventListener(GXNode.AfterInsertEvent, this._insertEvent, this);
        scene.addEventListener(GXNode.AfterRemoveEvent, this._removeEvent, this);
        scene.addEventListener(GXNode.AfterPropertiesChangeEvent, this._propertiesChangeEvent, this);
        scene.addEventListener(GXNode.AfterFlagChangeEvent, this._flagChangeEvent, this);
    };

    /** @override */
    EXPropertiesPalette.DocumentState.prototype.release = function () {
        var scene = this.document.getScene();

        // Unsubscribe from the document scene's events
        scene.removeEventListener(GXNode.AfterInsertEvent, this._insertEvent);
        scene.removeEventListener(GXNode.AfterRemoveEvent, this._removeEvent);
        scene.removeEventListener(GXNode.AfterPropertiesChangeEvent, this._propertiesChangeEvent);
        scene.removeEventListener(GXNode.AfterFlagChangeEvent, this._flagChangeEvent);
    };

    /** @override */
    EXPropertiesPalette.DocumentState.prototype.activate = function () {
        var editor = this.document.getEditor();

        // Subscribe to the editor's events
        editor.addEventListener(GXEditor.SelectionChangedEvent, this._selectionChanged, this);

        // Update from current selection
        this._updateFromSelection();
    };

    /** @override */
    EXPropertiesPalette.DocumentState.prototype.deactivate = function () {
        var editor = this.document.getEditor();

        // Unsubscribe from the editor's events
        editor.addEventListener(GXEditor.SelectionChangedEvent, this._selectionChanged, this);

        // Clear properties panels
        this._updatePropertiesPanels(null);
    };

    /**
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._updateFromSelection = function () {
        var selectedNode = this._htmlTreeContainer.tree('getSelectedNode');
        var nodes = null;

        if (selectedNode.node) {
            // TODO
        } else {
            nodes = this.document.getEditor().getSelection();
        }

        this._updatePropertiesPanels(nodes);
    };

    /**
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._updatePropertiesPanels = function (nodes) {
        for (var i = 0; i < this._propertyPanels.length; ++i) {
            var propertyPanel = this._propertyPanels[i];
            var available = !nodes || nodes.length === 0 ? false : propertyPanel.properties.updateFromNodes(this.document, nodes);

            if (available) {
                propertyPanel.category.css('display', '');

                if (propertyPanel.category.attr('data-expanded') == 'true') {
                    propertyPanel.panel.css('display', '');
                }

                propertyPanel.panel.attr('data-available', 'true');
            } else {
                propertyPanel.category.css('display', 'none');
                propertyPanel.panel.css('display', 'none');
                propertyPanel.panel.attr('data-available', 'false');
            }
        }
    }

    /**
     * @param {GXNode.AfterInsertEvent} event
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._insertEvent = function (event) {
        // If node has a selected parent then try to insert it
        for (var p = event.node.getParent(); p !== null; p = p.getParent()) {
            if (p.hasFlag(GXNode.Flag.Selected)) {
                this._tryInsertNode(event.node);
            }
        }
    };

    /**
     * @param {GXNode.AfterRemoveEvent} event
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._removeEvent = function (event) {
        // If we have a tree-node mapping for the node then remove it and
        // and the mappings for all of it's children
        var treeNode = this._getTreeNode(event.node);
        if (treeNode) {
            this._htmlTreeContainer.tree('removeNode', treeNode);

            event.node.accept(function (node) {
                for (var i = 0; i < this._treeNodeMap.length; ++i) {
                    if (this._treeNodeMap[i].node === node) {
                        this._treeNodeMap.splice(i, 1);
                        break;
                    }
                }
            }.bind(this));
        }
    };

    /**
     * @param {GXNode.AfterPropertiesChangeEvent} event
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._propertiesChangeEvent = function (event) {
        var treeNode = this._getTreeNode(event.node);
        if (treeNode) {
            this._updateNode(event.node);
        }
    };

    /**
     * @param {GXNode.AfterFlagChangeEvent} event
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._flagChangeEvent = function (event) {
        // Ignored
    };

    /**
     * @param {GXEditor.CurrentPageChangedEvent} event
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._selectionChanged = function (event) {
        // Clear tree, first
        this._treeNodeMap = [];
        this._htmlTreeContainer.tree('loadData', []);

        var selection = this.document.getEditor().getSelection();
        if (selection) {
            var label = selection.length === 1 ? selection[0].getNodeNameTranslated() : selection.length.toString() + ' Objects';
            this._htmlTreeContainer.tree('appendNode', { id: 0, node: null, label: label });

            // Select root node by default
            this._htmlTreeContainer.tree('selectNode', this._getTreeRootNode());
        } else {
            this._updateFromSelection();
        }
    };

    /**
     * @param {GXNode} node
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._tryInsertNode = function (node) {
        // TODO
    };

    /**
     * @param {GXNode} node
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._updateNode = function (node) {
        this._htmlTreeContainer.tree('updateNode', this._getTreeNode(node), {
            label: 'TEST',
            node: node
        });
    };

    /**
     * @param {GXNode} node
     * @return {*}
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._getTreeNodeId = function (node) {
        for (var i = 0; i < this._treeNodeMap.length; ++i) {
            if (this._treeNodeMap[i].node === node) {
                return this._treeNodeMap[i].treeId;
            }
        }
        return null;
    };

    /**
     * @param {GXNode} node
     * @return {*}
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._getTreeNode = function (node) {
        var nodeId = this._getTreeNodeId(node);
        if (nodeId) {
            return this._htmlTreeContainer.tree('getNodeById', nodeId);
        }
        return null;
    };

    /**
     * @return {*}
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._getTreeRootNode = function () {
        return this._htmlTreeContainer.tree('getNodeById', 0);
    };

    /**
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._createListItem = function (node, li) {
        // TODO
    };

    /**
     * @param event
     * @return {{parent: GXNode, before: GXNode, source: GXNode}} the result of the move
     * or null if the actual move is not allowed
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._getMoveTreeNodeInfo = function (position, source, target) {
        if (source && target && position !== 'none') {
            var parent = null;
            var before = null;

            if (position === 'inside') {
                parent = target;
                before = target instanceof GXPageSet ? target.getFirstChild() : null;
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
    EXPropertiesPalette.DocumentState.prototype._canMoveTreeNode = function (moved_node, target_node, position) {
        if (moved_node.node && target_node.node) {
            return this._getMoveTreeNodeInfo(position, moved_node.node, target_node.node) !== null;
        }
    };

    /**
     * @param event
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._moveTreeNode = function (event) {
        event.preventDefault();

        var moveInfo = this._getMoveTreeNodeInfo(event.move_info.position,
            event.move_info.moved_node.node, event.move_info.target_node.node);

        if (moveInfo) {
            // TODO : UNDO-GROUP HERE

            moveInfo.source.getParent().removeChild(moveInfo.source);
            moveInfo.parent.insertChild(moveInfo.source, moveInfo.before);
        }
    };

    /**
     * @param event
     * @private
     */
    EXPropertiesPalette.DocumentState.prototype._selectTreeNode = function (event) {
        this._updateFromSelection();
    };

    // -----------------------------------------------------------------------------------------------------------------
    // EXPropertiesPalette Class
    // -----------------------------------------------------------------------------------------------------------------    

    /**
     * @type {JQuery}
     * @private
     */
    EXPropertiesPalette.prototype._htmlElement = null;

    /**
     * The property panels
     * @type {Array<{{category: JQuery, panel: JQuery, properties: EXProperties}}>}
     * @private
     */
    EXPropertiesPalette.prototype._propertyPanels = null;

    /** @override */
    EXPropertiesPalette.prototype.getId = function () {
        return EXPropertiesPalette.ID;
    };

    /** @override */
    EXPropertiesPalette.prototype.getTitle = function () {
        return EXPropertiesPalette.TITLE;
    };

    /** @override */
    EXPropertiesPalette.prototype.getGroup = function () {
        return EXPalette.GROUP_PROPERTIES;
    };

    /**
     * @override
     */
    EXPropertiesPalette.prototype.getShortcut = function () {
        return [GUIKey.Constant.META, 'F3'];
    };

    /** @override */
    EXPropertiesPalette.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /** @override */
    EXPropertiesPalette.prototype.init = function (htmlElement, menu) {
        EXPalette.prototype.init.call(this, htmlElement, menu);

        this._htmlElement = htmlElement;
        this._htmlElement.append($('<div></div>')
            .addClass('object-tree-container'));

        var propertiesPanels = $('<div></div>')
            .addClass('properties-panels')
            .appendTo(this._htmlElement);

        var _addPropertiesPanel = function (properties) {
            // Init panel
            var panel = $('<div></div>')
                .css('display', 'none')
                .attr('data-available', 'false')
                .addClass('properties-panel-content');

            properties.init(panel, null/*TODO:MENU*/);

            // Append category
            var category = $('<div></div>')
                .addClass('properties-panel-category')
                .css('display', 'none')
                .attr('data-expanded', 'true')
                .append($('<i></i>')
                    .addClass('fa fa-caret-down'))
                .append($('<span></span>')
                    .text(gLocale.get(properties.getCategory())))
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
                })
                .appendTo(propertiesPanels);

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
    EXPropertiesPalette.prototype._createDocumentState = function (document) {
        return new EXPropertiesPalette.DocumentState(document, this._propertyPanels);
    };

    /** @override */
    EXPropertiesPalette.prototype._activateDocumentState = function (state) {
        // Attach the state's tree to ourself
        state._htmlTreeContainer.appendTo(this._htmlElement.find('.object-tree-container'));
    };

    /** @override */
    EXPropertiesPalette.prototype._deactivateDocumentState = function (state) {
        // Detach the state's tree from ourself
        state._htmlTreeContainer.detach();
    };

    /** @override */
    EXPropertiesPalette.prototype.toString = function () {
        return "[Object EXPropertiesPalette]";
    };

    _.EXPropertiesPalette = EXPropertiesPalette;
})(this);