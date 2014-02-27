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
            .addClass('structure-tree')
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

        // Add our document root

        // Subscribe to the editor's events
        //editor.addEventListener(GXEditor.CurrentLayerChangedEvent, this._currentLayerChanged, this);

        // Add the root layerSet
        //this._insertLayerOrSet(scene.getLayerSet());
    };

    EXSidebar.DocumentState.prototype.release = function () {
        var scene = this.document.getScene();
        var editor = this.document.getEditor();

        // Unsubscribe from the document scene's events
        scene.removeEventListener(GXNode.AfterInsertEvent, this._insertEvent);
        scene.removeEventListener(GXNode.AfterRemoveEvent, this._removeEvent);
        scene.removeEventListener(GXNode.AfterPropertiesChangeEvent, this._propertiesChangeEvent);
        scene.removeEventListener(GXNode.AfterFlagChangeEvent, this._flagChangeEvent);
    };

    /**
     * @param {GXNode.AfterInsertEvent} event
     * @private
     */
    EXSidebar.DocumentState.prototype._insertEvent = function (event) {
        // NO-OP
    };

    /**
     * @param {GXNode.AfterRemoveEvent} event
     * @private
     */
    EXSidebar.DocumentState.prototype._removeEvent = function (event) {
        // NO-OP
    };

    /**
     * @param {GXNode.AfterPropertiesChangeEvent} event
     * @private
     */
    EXSidebar.DocumentState.prototype._propertiesChangeEvent = function (event) {
        // NO-OP
    };

    /**
     * @param {GXNode.AfterFlagChangeEvent} event
     * @private
     */
    EXSidebar.DocumentState.prototype._flagChangeEvent = function (event) {
        // NO-OP
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
        // NO-OP
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