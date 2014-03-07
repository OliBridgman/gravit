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
            .addClass('structure-tree-container'));
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
            .addClass('structure-tree')
            .tree({
                data: [],
                dragAndDrop: true,
                autoOpen: true,
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
        this._treeItemMap = [];
    };

    /**
     * @type {EXDocument}
     */
    EXSidebar.DocumentState.prototype.document = null;

    /**
     * The container for the structure tree
     * @type {JQuery}
     * @private
     */
    EXSidebar.DocumentState.prototype._htmlTreeContainer = null;

    /**
     * A mapping of GXItem to Tree nodes
     * @type {Array<{{item: GXNode, treeId: String}}>}
     * @private
     */
    EXSidebar.DocumentState.prototype._treeItemMap = null;

    EXSidebar.DocumentState.prototype.init = function () {
        var scene = this.document.getScene();
        var editor = this.document.getEditor();

        // Subscribe to the document scene's events
        scene.addEventListener(GXNode.AfterInsertEvent, this._afterInsert, this);
        scene.addEventListener(GXNode.AfterRemoveEvent, this._afterRemove, this);
        scene.addEventListener(GXNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
        scene.addEventListener(GXNode.AfterFlagChangeEvent, this._afterFlagChange, this);

        // Add our root
        this._insertItem(scene);
    };

    EXSidebar.DocumentState.prototype.release = function () {
        var scene = this.document.getScene();
        var editor = this.document.getEditor();

        // Unsubscribe from the document scene's events
        scene.removeEventListener(GXNode.AfterInsertEvent, this._afterInsert);
        scene.removeEventListener(GXNode.AfterRemoveEvent, this._afterRemove);
        scene.removeEventListener(GXNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
        scene.removeEventListener(GXNode.AfterFlagChangeEvent, this._afterFlagChange);
    };

    /**
     * @param {GXNode.AfterInsertEvent} event
     * @private
     */
    EXSidebar.DocumentState.prototype._afterInsert = function (event) {
        if (event.node instanceof GXItem) {
            this._insertItem(event.node);
        }
    };

    /**
     * @param {GXNode.AfterRemoveEvent} event
     * @private
     */
    EXSidebar.DocumentState.prototype._afterRemove = function (event) {
        if (event.node instanceof GXItem) {
            var treeNode = this._getTreeNode(event.node);

            if (treeNode) {
                // Remove the tree node, first
                this._htmlTreeContainer.tree('removeNode', treeNode);

                // Iterate node and remove all tree mappings
                event.node.accept(function (node) {
                    if (node instanceof GXItem) {
                        for (var i = 0; i < this._treeItemMap.length; ++i) {
                            if (this._treeItemMap[i].item === node) {
                                this._treeItemMap.splice(i, 1);
                                break;
                            }
                        }
                    }
                }.bind(this));
            }
        }
    };

    /**
     * @param {GXNode.AfterPropertiesChangeEvent} event
     * @private
     */
    EXSidebar.DocumentState.prototype._afterPropertiesChange = function (event) {
        if (event.node instanceof GXItem) {
            this._updateItemProperties(event.node);
        }
    };

    /**
     * @param {GXNode.AfterFlagChangeEvent} event
     * @private
     */
    EXSidebar.DocumentState.prototype._afterFlagChange = function (event) {
        if (event.node instanceof GXItem) {
            this._updateItemProperties(event.node);
        }
    };

    /**
     * @param {GXItem} item
     * @return {*}
     * @private
     */
    EXSidebar.DocumentState.prototype._getTreeNodeId = function (item) {
        for (var i = 0; i < this._treeItemMap.length; ++i) {
            if (this._treeItemMap[i].item === item) {
                return this._treeItemMap[i].treeId;
            }
        }
    };

    /**
     * @param {GXItem} item
     * @return {*}
     * @private
     */
    EXSidebar.DocumentState.prototype._getTreeNode = function (item) {
        return this._htmlTreeContainer.tree('getNodeById', this._getTreeNodeId(item));
    };

    /**
     * @private
     */
    EXSidebar.DocumentState.prototype._createListItem = function (node, li) {
        if (node.item) {
            var item = node.item;
            var scene = this.document.getScene();
            var editor = this.document.getEditor();

            // Mark with active / selected classes if available whereas
            // selected takes higher precedence than being active
            li.removeClass('jqtree-selected');
            li.removeClass('jqtree-active');

            if (item.hasFlag(GXNode.Flag.Selected)) {
                li.addClass('jqtree-selected');
            } else {
                if (item.hasFlag(GXNode.Flag.Active)) {
                    li.addClass('jqtree-active');
                }
            }
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
                if (!target.hasMixin(GXNode.Container)) {
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
    EXSidebar.DocumentState.prototype._canMoveTreeNode = function (moved_node, target_node, position) {
        return this._getMoveTreeNodeInfo(position, moved_node.item, target_node.item) !== null;
    };

    /**
     * @param event
     * @private
     */
    EXSidebar.DocumentState.prototype._moveTreeNode = function (event) {
        event.preventDefault();

        var moveInfo = this._getMoveTreeNodeInfo(event.move_info.position,
            event.move_info.moved_node.item, event.move_info.target_node.item);

        if (moveInfo) {
            var editor = this.document.getEditor();
            editor.beginTransaction();
            try {
                moveInfo.source.getParent().removeChild(moveInfo.source);
                moveInfo.parent.insertChild(moveInfo.source, moveInfo.before);
            } finally {
                // TODO : I18N
                editor.commitTransaction('Drag Item(s)');
            }
        }
    };

    /**
     * @param event
     * @private
     */
    EXSidebar.DocumentState.prototype._clickTreeNode = function (event) {
        event.preventDefault();

        if (event.node && event.node.item) {
            var item = event.node.item;
            //item.setFlag(GXNode.Flag.Selected);

            this.document.getEditor().updateSelection(gPlatform.modifiers.metaKey, [item]);

        }
    };

    /**
     * @param {GXItem} item
     * @private
     */
    EXSidebar.DocumentState.prototype._updateItemProperties = function (item) {
        var treeNode = this._getTreeNode(item);
        if (treeNode) {
            this._htmlTreeContainer.tree('updateNode', treeNode, {
                label: item.getItemName(),
                item: item
            });
        }
    };

    /**
     * @param {GXItem} item
     * @private
     */
    EXSidebar.DocumentState.prototype._insertItem = function (item) {
        // Recursively add items
        item.accept(function (node) {
            if (node instanceof GXItem) {
                // Create an unique treeId for the new item
                var treeId = gUtil.uuid();

                // Insert into tree
                var nextTreeNode = node.getNext() ? this._getTreeNode(node.getNext()) : null;
                if (nextTreeNode) {
                    this._htmlTreeContainer.tree('addNodeBefore', { id: treeId, item: node }, nextTreeNode);
                } else {
                    var parentTreeNode = node.getParent() ? this._getTreeNode(node.getParent()) : null;
                    this._htmlTreeContainer.tree('appendNode', { id: treeId, item: node }, parentTreeNode);
                }

                // Insert the mapping
                this._treeItemMap.push({
                    item: node,
                    treeId: treeId
                });

                // Make an initial update
                this._updateItemProperties(node);
            }
        }.bind(this));
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
                    state._htmlTreeContainer.appendTo(this._htmlElement.find('.structure-tree-container'));
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