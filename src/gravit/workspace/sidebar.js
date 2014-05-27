(function (_) {
    /**
     * The global idebar class
     * @class GSidebar
     * @constructor
     * @version 1.0
     */
    function GSidebar(htmlElement) {
        this._htmlElement = htmlElement;
        this._htmlElement.append($('<div></div>')
            .addClass('structure-tree-container'));
        this._documentStates = [];
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GSidebar.DocumentState Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @class GSidebar.DocumentState
     * @constructor
     */
    GSidebar.DocumentState = function (document) {
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
        this._treeNodeMap = [];
    };

    /**
     * @type {GDocument}
     */
    GSidebar.DocumentState.prototype.document = null;

    /**
     * The container for the structure tree
     * @type {JQuery}
     * @private
     */
    GSidebar.DocumentState.prototype._htmlTreeContainer = null;

    /**
     * A mapping of IFBlock to Tree nodes
     * @type {Array<{{block: IFBlock, treeId: String}}>}
     * @private
     */
    GSidebar.DocumentState.prototype._treeNodeMap = null;

    GSidebar.DocumentState.prototype.init = function () {
        var scene = this.document.getScene();

        // Subscribe to the document scene's events
        scene.addEventListener(IFNode.AfterInsertEvent, this._afterInsert, this);
        scene.addEventListener(IFNode.AfterRemoveEvent, this._afterRemove, this);
        scene.addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
        scene.addEventListener(IFNode.AfterFlagChangeEvent, this._afterFlagChange, this);

        // Add our root
        this._insertBlock(scene);
    };

    GSidebar.DocumentState.prototype.release = function () {
        var scene = this.document.getScene();

        // Unsubscribe from the document scene's events
        scene.removeEventListener(IFNode.AfterInsertEvent, this._afterInsert);
        scene.removeEventListener(IFNode.AfterRemoveEvent, this._afterRemove);
        scene.removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
        scene.removeEventListener(IFNode.AfterFlagChangeEvent, this._afterFlagChange);
    };

    /**
     * @param {IFNode.AfterInsertEvent} event
     * @private
     */
    GSidebar.DocumentState.prototype._afterInsert = function (event) {
        if (event.node instanceof IFBlock) {
            this._insertBlock(event.node);
        }
    };

    /**
     * @param {IFNode.AfterRemoveEvent} event
     * @private
     */
    GSidebar.DocumentState.prototype._afterRemove = function (event) {
        if (event.node instanceof IFBlock) {
            var treeNode = this._getTreeNode(event.node);

            if (treeNode) {
                // Remove the tree node, first
                this._htmlTreeContainer.tree('removeNode', treeNode);

                // Iterate node and remove all tree mappings
                event.node.accept(function (node) {
                    if (node instanceof IFBlock) {
                        for (var i = 0; i < this._treeNodeMap.length; ++i) {
                            if (this._treeNodeMap[i].block === node) {
                                this._treeNodeMap.splice(i, 1);
                                break;
                            }
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
    GSidebar.DocumentState.prototype._afterPropertiesChange = function (event) {
        if (event.node instanceof IFBlock) {
            this._updateBlockProperties(event.node);
        }
    };

    /**
     * @param {IFNode.AfterFlagChangeEvent} event
     * @private
     */
    GSidebar.DocumentState.prototype._afterFlagChange = function (event) {
        if (event.node instanceof IFBlock) {
            this._updateBlockProperties(event.node);
        }
    };

    /**
     * @param {IFBlock} block
     * @return {*}
     * @private
     */
    GSidebar.DocumentState.prototype._getTreeNodeId = function (block) {
        for (var i = 0; i < this._treeNodeMap.length; ++i) {
            if (this._treeNodeMap[i].block === block) {
                return this._treeNodeMap[i].treeId;
            }
        }
    };

    /**
     * @param {IFBlock} block
     * @return {*}
     * @private
     */
    GSidebar.DocumentState.prototype._getTreeNode = function (block) {
        return this._htmlTreeContainer.tree('getNodeById', this._getTreeNodeId(block));
    };

    /**
     * @private
     */
    GSidebar.DocumentState.prototype._createListItem = function (node, li) {
        if (node.block) {
            var block = node.block;
            var scene = this.document.getScene();
            var editor = this.document.getEditor();

            // Mark with active / selected classes if available whereas
            // selected takes higher precedence than being active
            li.removeClass('jqtree-selected');
            li.removeClass('jqtree-active');

            if (block.hasFlag(IFNode.Flag.Selected)) {
                li.addClass('jqtree-selected');
            } else {
                if (block.hasFlag(IFNode.Flag.Active)) {
                    li.addClass('jqtree-active');
                }
            }
        }
    };

    /**
     * @param event
     * @return {{parent: IFNode, before: IFNode, source: IFNode}} the result of the move
     * or null if the actual move is not allowed
     * @private
     */
    GSidebar.DocumentState.prototype._getMoveTreeNodeInfo = function (position, source, target) {
        if (source && target && position !== 'none') {
            var parent = null;
            var before = null;

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
    GSidebar.DocumentState.prototype._canMoveTreeNode = function (moved_node, target_node, position) {
        return this._getMoveTreeNodeInfo(position, moved_node.block, target_node.block) !== null;
    };

    /**
     * @param event
     * @private
     */
    GSidebar.DocumentState.prototype._moveTreeNode = function (event) {
        event.preventDefault();

        var moveInfo = this._getMoveTreeNodeInfo(event.move_info.position,
            event.move_info.moved_node.block, event.move_info.target_node.block);

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
    GSidebar.DocumentState.prototype._clickTreeNode = function (event) {
        event.preventDefault();

        if (event.node && event.node.block) {
            var block = event.node.block;
            this.document.getEditor().updateSelection(gPlatform.modifiers.metaKey, [block]);

        }
    };

    /**
     * @param {IFBlock} block
     * @private
     */
    GSidebar.DocumentState.prototype._updateBlockProperties = function (block) {
        var treeNode = this._getTreeNode(block);
        if (treeNode) {
            this._htmlTreeContainer.tree('updateNode', treeNode, {
                label: block.getLabel(),
                block: block
            });
        }
    };

    /**
     * @param {IFBlock} block
     * @private
     */
    GSidebar.DocumentState.prototype._insertBlock = function (block) {
        // Recursively add blocks
        block.accept(function (node) {
            if (node instanceof IFBlock) {
                // Create an unique treeId for the new block
                var treeId = gUtil.uuid();

                // Insert into tree
                var nextTreeNode = node.getNext() ? this._getTreeNode(node.getNext()) : null;
                if (nextTreeNode) {
                    this._htmlTreeContainer.tree('addNodeBefore', { id: treeId, block: node }, nextTreeNode);
                } else {
                    var parentTreeNode = node.getParent() ? this._getTreeNode(node.getParent()) : null;
                    this._htmlTreeContainer.tree('appendNode', { id: treeId, block: node }, parentTreeNode);
                }

                // Insert the mapping
                this._treeNodeMap.push({
                    block: node,
                    treeId: treeId
                });

                // Make an initial update
                this._updateBlockProperties(node);
            }
        }.bind(this));
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GSidebar Class
    // -----------------------------------------------------------------------------------------------------------------    

    /**
     * @type {HTMLDivElement}
     * @private
     */
    GSidebar.prototype._htmlElement = null;

    /**
     * @type {Array<GSidebar.DocumentState>}
     * @private
     */
    GSidebar.prototype._documentStates = null;

    /**
     * Called from the workspace to initialize
     */
    GSidebar.prototype.init = function () {
        gApp.addEventListener(GApplication.DocumentEvent, this._documentEvent, this);
    };

    /**
     * Called from the workspace to relayout
     */
    GSidebar.prototype.relayout = function () {
        // NO-OP
    };

    /**
     * @param {GApplication.DocumentEvent} event
     * @private
     */
    GSidebar.prototype._documentEvent = function (event) {
        switch (event.type) {
            case GApplication.DocumentEvent.Type.Added:
                // Initiate a new state and add it
                var state = new GSidebar.DocumentState(event.document);
                state.init();
                this._documentStates.push(state);
                break;
            case GApplication.DocumentEvent.Type.Removed:
                // Find and release state
                var state = this._findDocumentState(event.document);
                if (state) {
                    state.release();
                    this._documentStates.splice(this._documentStates.indexOf(state), 1);
                }
                break;
            case GApplication.DocumentEvent.Type.Activated:
                // Find and activate state
                var state = this._findDocumentState(event.document);
                if (state) {
                    //state.activate();
                    // Attach the state's tree to ourself
                    state._htmlTreeContainer.appendTo(this._htmlElement.find('.structure-tree-container'));
                }
                break;
            case GApplication.DocumentEvent.Type.Deactivated:
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
     * @param {GDocument} document
     * @return {GSidebar.DocumentState}
     * @private
     */
    GSidebar.prototype._findDocumentState = function (document) {
        for (var i = 0; i < this._documentStates.length; ++i) {
            if (this._documentStates[i].document === document) {
                return this._documentStates[i];
            }
        }
    };

    _.GSidebar = GSidebar;
})(this);