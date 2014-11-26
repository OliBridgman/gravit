(function (_) {
    /**
     * A graphic editor keeps track of all editing related stuff for a scene
     * like handling selection, keeping undo/redo information and more.
     * @param {GScene} scene the scene this editor works on
     * @class GEditor
     * @extend GEventTarget
     * @constructor
     */
    function GEditor(scene) {
        this._scene = scene;
        this._scene.__graphic_editor__ = this;
        this._transactionStack = [];
        this._undoStates = [];
        this._redoStates = [];
        this._guides = new GGuides(this._scene);

        // Subscribe to various scene changes
        this._scene.addEventListener(GNode.AfterInsertEvent, this._afterNodeInsert, this);
        this._scene.addEventListener(GNode.BeforeRemoveEvent, this._beforeNodeRemove, this);
        this._scene.addEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
        this._scene.addEventListener(GNode.BeforeFlagChangeEvent, this._beforeFlagChange, this);
        this._scene.addEventListener(GNode.AfterFlagChangeEvent, this._afterFlagChange, this);
        this._scene.addEventListener(GElement.GeometryChangeEvent, this._geometryChange, this);

        // Try to create internal selection for all selected nodes
        var selectedNodes = this._scene.queryAll(":selected");
        if (selectedNodes && selectedNodes.length) {
            for (var i = 0; i < selectedNodes.length; ++i) {
                this._tryAddToSelection(selectedNodes[i]);
            }
        }
    };
    GObject.inherit(GEditor, GEventTarget);

    GEditor.options = {
        /** Maximum number of undo-steps */
        maxUndoSteps: 20,
        /**
         * Specifies whether changing the exact properties will
         * be merged into a previous undo step with the same
         * properties. This will only work if the current and
         * the previous undo steps do not include *any* other changes
         * and when each step has the same action name
         */
        smartUndoPropertyMerge: true,

        /**
         * The default units to shift when cloning the selection
         */
        cloneShift: 10
    };

    /**
     * Get the underlying graphic editor for a given scene
     * @param {GScene} scene
     * @returns {GEditor} a graphic editor for the scene
     * or null if it has no such one
     */
    GEditor.getEditor = function (scene) {
        return scene.__graphic_editor__ ? scene.__graphic_editor__ : null;
    };

    /**
     * Runs + commits a transaction on an editor. If there's no editor for a
     * given source, the action will still be ran but without any
     * transactions at all
     * @param {GNode} source the source to get an editor from
     * @param {Function} action the actual action to be ran
     * @param {String} name the name of the transaction when committed
     */
    GEditor.tryRunTransaction = function (source, action, name) {
        var editor = GEditor.getEditor(source.getScene());
        if (editor) {
            editor.beginTransaction();
        }

        try {
            action();
        } finally {
            if (editor) {
                editor.commitTransaction(name);
            }
        }
    };
    
    // -----------------------------------------------------------------------------------------------------------------
    // GEditor.FileDropEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever a blob was dropped
     * @class GEditor.FileDropEvent
     * @extends GEvent
     * @constructor
     */
    GEditor.FileDropEvent = function (file, position) {
        this.file = file;
        this.position = position;
    };
    GObject.inherit(GEditor.FileDropEvent, GEvent);

    /**
     * Dropped file
     * @type {File}
     */
    GEditor.FileDropEvent.file = null;

    /**
     * Drop target position in scene coordinates
     * @type {GPoint}
     */
    GEditor.FileDropEvent.position = null;

    /** @override */
    GEditor.FileDropEvent.prototype.toString = function () {
        return "[Event GEditor.FileDropEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GEditor.SelectionChangedEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever the selection has been changed
     * @class GEditor.SelectionChangedEvent
     * @extends GEvent
     * @constructor
     */
    GEditor.SelectionChangedEvent = function () {
    };
    GObject.inherit(GEditor.SelectionChangedEvent, GEvent);

    /** @override */
    GEditor.SelectionChangedEvent.prototype.toString = function () {
        return "[Event GEditor.SelectionChangedEvent]";
    };

    GEditor.SELECTION_CHANGED_EVENT = new GEditor.SelectionChangedEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GEditor.InlineEditorEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event providing inline editor events
     * @class GEditor.InlineEditorEvent
     * @extends GEvent
     * @constructor
     */
    GEditor.InlineEditorEvent = function (editor, type) {
        this.editor = editor;
        this.type = type;
    };
    GObject.inherit(GEditor.InlineEditorEvent, GEvent);

    /**
     * Enum of inline editor event types
     * @enum
     */
    GEditor.InlineEditorEvent.Type = {
        /**
         * Inline editor is about to be opened
         */
        BeforeOpen: 0,

        /**
         * Inline editor has been opened
         */
        AfterOpen: 1,

        /**
         * Inline editor is about to close
         */
        BeforeClose: 10,

        /**
         * Inline editor has been closed
         */
        AfterClose: 11,

        /**
         * Some selection in inline editor has been changed
         */
        SelectionChanged: 100
    };

    /**
     * @type {GElementEditor}
     */
    GEditor.InlineEditorEvent.prototype.editor = null;

    /**
     * @type {GEditor.InlineEditorEvent.Type}
     */
    GEditor.InlineEditorEvent.prototype.type = null;

    /** @override */
    GEditor.InlineEditorEvent.prototype.toString = function () {
        return "[Event GEditor.InlineEditorEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GEditor.InvalidationRequestEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for an invalidation request event
     * @param {GElementEditor} editor the requesting editor
     * @param {*} [args] optional arguments to be passed back to editor
     * @class GEditor.InvalidationRequestEvent
     * @extends GEvent
     * @constructor
     */
    GEditor.InvalidationRequestEvent = function (editor, args) {
        this.editor = editor;
        this.args = args;
    };
    GObject.inherit(GEditor.InvalidationRequestEvent, GEvent);

    /** @type {GElementEditor} */
    GEditor.InvalidationRequestEvent.prototype.editor = null;
    /** @type {*} */
    GEditor.InvalidationRequestEvent.prototype.args = null;

    /** @override */
    GEditor.InvalidationRequestEvent.prototype.toString = function () {
        return "[Event GEditor.InvalidationRequestEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GEditor Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {GScene}
     * @private
     */
    GEditor.prototype._scene = null;

    /**
     * @type {Array<GElement>}
     * @private
     */
    GEditor.prototype._selection = null;

    /**
     * @type {Array<GElement>}
     * @private
     */
    GEditor.prototype._lastCloneSelection = null;

    /**
     * @type {Array<*>}
     * @private
     */
    GEditor.prototype._storedSelection = null;

    /**
     * @type {Array<{{page: GPage, selection: Array<*>}}>}
     * @private
     */
    GEditor.prototype._pageSelections = null;

    /**
     * @type {number}
     * @private
     */
    GEditor.prototype._selectionUpdateCounter = 0;

    /**
     * @type {boolean}
     * @private
     */
    GEditor.prototype._selectionDetail = false;

    /**
     * @type {Array<{{actions: Array<{action: Function, revert: Function}>, selection: Array<{element: GElement, parts: Array<*>}>}}>}
     * @private
     */
    GEditor.prototype._transactionStack = null;

    /**
     * @type {Array<*>}
     * @private
     */
    GEditor.prototype._undoStates = null;

    /**
     * @type {Array<*>}
     * @private
     */
    GEditor.prototype._redoStates = null;

    /**
     * @type {GGuides}
     * @private
     */
    GEditor.prototype._guides = null;

    /**
     * @type {GNode}
     * @private
     */
    GEditor.prototype._currentInlineEditorNode = null;
    /**
     * @returns {GScene}
     */
    GEditor.prototype.getScene = function () {
        return this._scene;
    };

    /**
     * Return whether any selection is available or not
     * @return {Boolean} true if a selection is available, false if not
     * @version 1.0
     */
    GEditor.prototype.hasSelection = function () {
        return this._selection && this._selection.length > 0;
    };

    /**
     * Return the united selection bounding box
     * @param {Boolean} [geometryBBox] if true, uses geometry bboxes,
     * otherwises uses paint bboxes. Defaults to false.
     * @return {GRect} the selection bbox or null for no selection
     */
    GEditor.prototype.getSelectionBBox = function (geometryBBox) {
        if (this.hasSelection()) {
            var result = null;
            for (var i = 0; i < this._selection.length; ++i) {
                var bbox = geometryBBox ? this._selection[i].getGeometryBBox() : this._selection[i].getPaintBBox();
                if (bbox && !bbox.isEmpty()) {
                    result = result ? result.united(bbox) : new GRect(bbox.getX(), bbox.getY(), bbox.getWidth(), bbox.getHeight());
                }
            }
            return result;
        }
        return null;
    };

    /**
     * Return the selection array
     * @return {Array<GElement>} the selection array or null for no selection
     * @version 1.0
     */
    GEditor.prototype.getSelection = function () {
        return this._selection;
    };

    /**
     * Return the copy of the selection array. Elements in this copy has canvas-relative positions.
     * @return {Array<GElement>} the selection array copy or null for no selection
     */
    GEditor.prototype.getSelectionCopy = function () {
        var selectionCopy = null;
        if (this._selection && this._selection.length > 0) {
            selectionCopy = [];

            for (var i = 0; i < this._selection.length; ++i) {
                var element = this._selection[i];
                if (element instanceof GBlock) {
                    var page = element.getPage();
                    var copyElem = element.clone();
                    if (copyElem) {
                        copyElem.transform(
                            new GTransform(1, 0, 0, 1, -page.getProperty('x'), -page.getProperty('y')));
                        selectionCopy.push(copyElem);
                    }
                }
            }

            if (!selectionCopy.length) {
                selectionCopy = null;
            }
        }
        return selectionCopy;
    };

    /**
     * Returns whether selection details are available or not
     * @returns {boolean}
     */
    GEditor.prototype.hasSelectionDetail = function () {
        return this._selectionDetail;
    };

    /**
     * Assigns whether selection details are available or not
     * @param {Boolean} detail
     */
    GEditor.prototype.setSelectionDetail = function (detail) {
        if (detail !== this._selectionDetail) {
            this._selectionDetail = detail;

            // Re-flag selection if any
            if (this._selection) {
                for (var i = 0; i < this._selection.length; ++i) {
                    var editor = GElementEditor.getEditor(this._selection[i]);
                    if (editor) {
                        if (this._selectionDetail) {
                            editor.setFlag(GElementEditor.Flag.Detail);
                        } else {
                            editor.removeFlag(GElementEditor.Flag.Detail);
                        }
                    }
                }
            }
        }
    };

    /**
     * Return the editor's guides
     * @returns {GGuides}
     */
    GEditor.prototype.getGuides = function () {
        return this._guides;
    };

    /**
     * Returns a reference to the selected path, if it is the only one selected,
     * or null otherwise
     * @return {GPath} the selected path
     */
    GEditor.prototype.getPathSelection = function () {
        var pathRef = null;
        var i;

        if (this.hasSelection()) {
            for (i = 0; i < this._selection.length; ++i) {
                if (this._selection[i] instanceof GPath || this._selection[i] instanceof GCompoundPath) {
                    if (pathRef) {
                        pathRef = null;
                        break;
                    } else {
                        pathRef = this._selection[i];
                    }
                } else {
                    if (pathRef) {
                        pathRef = null;
                        break;
                    }
                }
            }
        }

        return pathRef;
    };

    GEditor.prototype.getAlignExclusions = function (clone) {
        var res = null;
        if (this._selection && this._selection.length) {
            var alignExclusions = [];
            if (!clone) {
                alignExclusions = this._selection.slice();
            }
            for (var i = 0; i < this._selection.length; ++i) {
                var item = this._selection[i];
                if (item instanceof GNode.Container) {
                    item.acceptChildrenAny(function (node) {
                        if (!(node instanceof GElement)) {
                            return false;
                        }
                        alignExclusions.push(node);
                    }.bind(this));
                }
            }
            if (alignExclusions.length) {
                res = alignExclusions;
            }
        }
        return res;
    };

    /**
     * Called to release and detach this editor
     */
    GEditor.prototype.release = function () {
        delete this._scene.__graphic_editor__;

        this._scene.removeEventListener(GNode.AfterInsertEvent, this._afterNodeInsert, this);
        this._scene.removeEventListener(GNode.BeforeRemoveEvent, this._beforeNodeRemove, this);
        this._scene.removeEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
        this._scene.removeEventListener(GNode.BeforeFlagChangeEvent, this._beforeFlagChange, this);
        this._scene.removeEventListener(GNode.AfterFlagChangeEvent, this._afterFlagChange, this);
        this._scene.removeEventListener(GElement.GeometryChangeEvent, this._geometryChange, this);
    };

    /**
     * Request the invalidation of an editor
     * @param {GElementEditor} editor the requesting editor
     * @param {*} [args] optional arguments to be passed back to the editor
     */
    GEditor.prototype.requestInvalidation = function (editor, args) {
        if (this.hasEventListeners(GEditor.InvalidationRequestEvent)) {
            this.trigger(new GEditor.InvalidationRequestEvent(editor, args));
        }
    };

    /**
     * Clone current selection (if any) and make it the new selection. Note that
     * this will not create an undo step, this would have to be done manually.
     * @param {Boolean} [shift] if true, shifts the new selection a bit from
     * the original source
     * @param {Boolean} [history] if set to true (defaults to false), will re-apply
     * the transformation done on a previous cloned selection if the current selection
     * is still the same as the previous one and has not been cleared in the meantime
     * @return {Array<GElement>} the array of clones or null for no clones
     */
    GEditor.prototype.cloneSelection = function (shift, history) {
        if (this._selection && this._selection.length > 0) {
            /** Array<{{element: GElement, transform: GTransform}}> */
            var elementsToClone = [];

            for (var i = 0; i < this._selection.length; ++i) {
                var element = this._selection[i];
                if (element.hasMixin(GNode.Store)) {
                    elementsToClone.push({
                        element: element,
                        transform: shift ? new GTransform(1, 0, 0, 1, GEditor.options.cloneShift, GEditor.options.cloneShift) : null
                    });
                }
            }

            var clonedSelection = [];

            if (history) {
                if (this._lastCloneSelection) {
                    for (var i = 0; i < this._lastCloneSelection.length; ++i) {
                        var source = this._lastCloneSelection[i];
                        var target = elementsToClone[i].element;
                        if (source.hasMixin(GElement.Transform) && target.hasMixin(GElement.Transform)) {
                            var sourceTransform = source.getTransform();
                            var targetTransform = target.getTransform();
                            if (targetTransform) {
                                var newTransform = sourceTransform ? targetTransform.preMultiplied(sourceTransform.inverted()) : targetTransform;
                                if (!newTransform.isIdentity()) {
                                    elementsToClone[i].transform = newTransform;
                                }
                            }
                        }
                    }
                }
            }


            for (var i = 0; i < elementsToClone.length; ++i) {
                var element = elementsToClone[i].element;
                var transform = elementsToClone[i].transform;

                var clone = element.clone();
                if (clone) {
                    // Append clone to parent of selected item
                    element.getParent().appendChild(clone);

                    // Transform clone if desired
                    if (transform && clone.hasMixin(GElement.Transform)) {
                        clone.transform(transform);
                    }

                    // Add clone to new selection
                    clonedSelection.push(clone);
                }
            }

            // Update current selection if any
            if (clonedSelection.length > 0) {
                this.updateSelection(false, clonedSelection);
            }

            if (history) {
                this._lastCloneSelection = [];
                for (var i = 0; i < elementsToClone.length; ++i) {
                    this._lastCloneSelection.push(elementsToClone[i].element);
                }
            }

            return clonedSelection;
        }
        return null;
    };

    /**
     * Delete current selection (if any). Note that this will only
     * delete GItem based classes so that layers and/or pages
     * are not accidently deleted. Note also that this will not
     * delete items that are locked
     * @param {Boolean} [noTransaction] if true, will not create a
     * transaction (undo/redo), defaults to false
     */
    GEditor.prototype.deleteSelection = function (noTransaction) {
        if (this._selection && this._selection.length > 0) {
            if (!noTransaction) {
                this.beginTransaction();
            }

            this._beginSelectionUpdate();
            try {
                // copy and order selection
                var orderedSelection = GNode.order(this._selection.slice(), true);

                // now delete
                for (var i = 0; i < orderedSelection.length; ++i) {
                    var selElement = orderedSelection[i];
                    if (selElement instanceof GItem && !selElement.hasFlag(GElement.Flag.Locked)) {
                        var elemEditor = GElementEditor.getEditor(selElement);
                        if (elemEditor && elemEditor.isDeletePartsAllowed()) {
                            elemEditor.deletePartsSelected();
                        } else {
                            selElement.removeFlag(GNode.Flag.Selected);
                            selElement.getParent().removeChild(selElement);
                        }
                    }
                }
            } finally {
                this._finishSelectionUpdate();
                if (!noTransaction) {
                    // TODO : I18N
                    this.commitTransaction('Delete Selection');
                }
            }
        }
        return null;
    };

    /**
     * Update the current selection
     * @param {boolean} toggle if true then this will merge/united the
     * current selection with the new one, otherwise the current selection
     * will be replaced with the new one
     * @param {Array<GElement>} selection the new array of nodes to be selected
     */
    GEditor.prototype.updateSelection = function (toggle, selection) {
        this._beginSelectionUpdate();
        try {
            if (!toggle) {
                // Select new selection if any
                if (selection && selection.length > 0) {
                    for (var i = 0; i < selection.length; ++i) {
                        selection[i].setFlag(GNode.Flag.Selected);
                    }
                }

                // Clear selection except for the selected ones
                this.clearSelection(selection);
            } else {
                // We do toggle the current selection here which
                // means to either add to current selection or remove
                // from it
                if (selection && selection.length) {
                    for (var i = 0; i < selection.length; ++i) {
                        // Simply invert our selection flag at this point
                        if (selection[i].hasFlag(GNode.Flag.Selected)) {
                            selection[i].removeFlag(GNode.Flag.Selected);
                        } else {
                            selection[i].setFlag(GNode.Flag.Selected);
                        }
                    }
                }
            }
        } finally {
            this._finishSelectionUpdate();
        }
    };

    /**
     * Update the current selection based on collision area
     * @param {boolean} toggle if true then this will merge/united the
     * current selection with the new one, otherwise the current selection
     * will be replaced with the new one
     * @param {Array<GElement>} selection the new array of nodes to be selected
     * @param {GVertexSource} collisionArea
     */
    GEditor.prototype.updateSelectionUnderCollision = function (toggle, selection, collisionArea) {
        this._beginSelectionUpdate();
        try {
            var selectionForUpdate = [];
            var selectionToRemember = [];
            for (var i = 0; i < selection.length; ++i) {
                var element = selection[i];
                var addForFurtherUpdate = true;
                var elemEditor = GElementEditor.openEditor(element);
                if (!elemEditor || !elemEditor.isPartSelectionUnderCollisionAllowed()) {
                    if (element.isFullUnderCollision(collisionArea)) {
                        selectionForUpdate.push(element);
                    }
                } else {
                    if (elemEditor.updatePartSelectionUnderCollision(toggle, collisionArea)) {
                        selectionToRemember.push(element);
                    }
                }
            }

            if (selectionToRemember && selectionToRemember.length) {
                if (!this._selection) {
                    this._selection = [];
                }
                if (toggle) {
                    for (var i = 0; i < selectionToRemember.length; ++i) {
                        if (this._selection.indexOf(selectionToRemember[i]) < 0) {
                            this._tryAddToSelection(selectionToRemember[i]);
                        }
                    }
                    this.updateSelection(toggle, selectionForUpdate);
                } else {
                    selectionForUpdate = selectionForUpdate.concat(selectionToRemember);
                    this.updateSelection(toggle, selectionForUpdate);
                }
            } else {
                this.updateSelection(toggle, selectionForUpdate);
            }
        } finally {
            this._finishSelectionUpdate();
        }
    };

    /**
     * Clears the whole selection if any
     * @param {Array<GElement>} [exclusion] an array to exclude from removing
     * from the selection or null for none
     */
    GEditor.prototype.clearSelection = function (exclusion) {
        if (GUtil.equals(exclusion, this._selection)) {
            return;
        }

        this._beginSelectionUpdate();
        try {
            var index = 0;
            while (this._selection && index < this._selection.length) {
                if (exclusion && exclusion.indexOf(this._selection[index]) >= 0) {
                    index++;
                    continue;
                }
                this._selection[index].removeFlag(GNode.Flag.Selected);
            }
        } finally {
            this._finishSelectionUpdate();
        }
    };

    /**
     * Temporarily store the current selection
     */
    GEditor.prototype.storeSelection = function () {
        if (this._scene.getProperty('singlePage')) {
            this._savePageSelection(this._scene.getActivePage(), true/*no-overwrite*/);
        } else {
            this._storedSelection = this._saveSelection();
        }
    };

    /**
     * Restore a temporarily stored selection
     */
    GEditor.prototype.restoreSelection = function () {
        if (this._scene.getProperty('singlePage')) {
            this._restorePageSelection(this._scene.getActivePage());
        } else {
            this._loadSelection(this._storedSelection);
        }
    };

    /**
     * Move the selection
     * @param {GPoint} delta the move delta
     * @param {Boolean} align whether to automatically align or not
     * @param {*} [partId] optional id of part that has started the transformation
     * @param {*} [data] optional data of part that has started the transformation
     * @param {GPoint} startPos - movement start position, needed when align is true only
     * @paream {Boolean} clone - if true, don't use selection exclusion when snapping, as the selection is clonned
     */
    GEditor.prototype.moveSelection = function (delta, align, partId, partData, startPos, clone) {
        var translation = delta;
        if (align) {
            var alignExclusions = this.getAlignExclusions(clone);
            if (alignExclusions) {
                this._guides.useExclusions(alignExclusions);
            }
            if (this.hasSelectionDetail() && startPos && this._selection.length == 1) {
                var selBBox = this._selection[0].getGeometryBBox();
                var side = selBBox.getClosestSideName(startPos);
                var sidePos = selBBox.getSide(side);
                var newSidePos = sidePos.add(delta);
                this._guides.beginMap();
                newSidePos = this._guides.mapPoint(newSidePos, GGuide.DetailMap.Mode.DetailOnFilterOn);
                this._guides.finishMap();
                translation = newSidePos.subtract(sidePos);
            } else {
                var selBBox = GElement.prototype.getGroupGeometryBBox(this._selection);
                if (selBBox && !selBBox.isEmpty()) {
                    var newSelBBox = selBBox.translated(delta.getX(), delta.getY());
                    this._guides.beginMap();
                    newSelBBox = this._guides.mapRect(newSelBBox);
                    this._guides.finishMap();
                    var tl = selBBox.getSide(GRect.Side.TOP_LEFT);
                    var newTL = newSelBBox.getSide(GRect.Side.TOP_LEFT);
                    translation = newTL.subtract(tl);
                }
            }
        }

        this.transformSelection(new GTransform(1, 0, 0, 1, translation.getX(), translation.getY()), partId, partData);
    };

    /**
     * Scale the selection
     * @param {Number} sx horizontal scale factor
     * @param {Number} sy vertical scale factor
     * @param {Number} dx horizontal scale direction (-1 = left, 0 = both, 1 = right}
     * @param {Number} dy vertical scale direction (-1 = top, 0 = both, 1 = bottom}
     * @param {Boolean} align whether to automatically align or not
     * @param {*} [partId] optional id of part that has started the transformation
     * @param {*} [partData] optional data of part that has started the transformation
     */
    GEditor.prototype.scaleSelection = function (sx, sy, dx, dy, align, partId, partData) {
        var selBBox = GElement.prototype.getGroupGeometryBBox(this._selection);
        if (selBBox) {
            // TODO : Align support
            var tl = selBBox.getSide(GRect.Side.TOP_LEFT);
            var br = selBBox.getSide(GRect.Side.BOTTOM_RIGHT);
            var cnt = selBBox.getSide(GRect.Side.CENTER);
            var tx, ty;
            if (dx < 0) {
                tx = br.getX();
            } else if (dx > 0) {
                tx = tl.getX();
            } else { // tx == 0
                tx = cnt.getX();
            }
            if (dy < 0) {
                ty = br.getY();
            } else if (dy > 0) {
                ty = tl.getY();
            } else { // ty == 0
                ty = cnt.getY();
            }

            var transform = new GTransform(1, 0, 0, 1, -tx, -ty)
                .multiplied(new GTransform(sx, 0, 0, sy, 0, 0))
                .multiplied(new GTransform(1, 0, 0, 1, tx, ty));

            this.transformSelection(transform, partId, partData);
        }
    };

    /**
     * Transform the selection
     * @param {GTransform} transform the transform to be used
     * @param {*} [part] optional id of part that has started the transformation
     * @param {*} [partId] optional data of part that has started the transformation
     */
    GEditor.prototype.transformSelection = function (transform, partId, partData) {
        if (this._selection && this._selection.length) {
            for (var i = 0; i < this._selection.length; ++i) {
                var item = this._selection[i];
                var editor = GElementEditor.getEditor(item);
                if (editor) {
                    editor.transform(transform, partId, partData);
                }
            }
        }
    };

    /**
     * Reset the transformation of the selection
     */
    GEditor.prototype.resetSelectionTransform = function () {
        if (this._selection && this._selection.length) {
            for (var i = 0; i < this._selection.length; ++i) {
                var item = this._selection[i];
                var editor = GElementEditor.getEditor(item);
                if (editor) {
                    editor.resetTransform();
                }
            }
        }
    };

    /**
     * Apply the current selection transformation. If clone is set
     * to true then the current selection will be applied to a clone
     * of the current selection and made selected whereas the original
     * selection keeps untouched
     * @param {Boolean} [cloneSelection] whether to apply to a clone or not,
     * defaults to false if not provided
     * @param {Boolean} [noTransaction] if true, will not create a
     * transaction (undo/redo), defaults to false
     */
    GEditor.prototype.applySelectionTransform = function (cloneSelection, noTransaction) {
        if (this._selection && this._selection.length) {
            // Filter selection by editors that can not be transformed
            // and reset those instead here
            var newSelection = [];
            for (var i = 0; i < this._selection.length; ++i) {
                var item = this._selection[i];
                var editor = GElementEditor.getEditor(item);
                if (editor) {
                    if (!editor.canApplyTransform()) {
                        // Reset editor transformation
                        editor.resetTransform();
                    } else {
                        // Push item to array of new selection
                        newSelection.push(item);
                    }
                }
            }

            if (newSelection && newSelection.length > 0) {
                if (!noTransaction) {
                    this.beginTransaction();
                }

                try {
                    var clonedSelection = [];
                    for (var i = 0; i < newSelection.length; ++i) {
                        var item = newSelection[i];
                        var editor = GElementEditor.getEditor(item);
                        if (editor) {
                            var selectionElement = newSelection[i];
                            var elementToApplyTransform = selectionElement;

                            if (cloneSelection) {
                                if (selectionElement.hasMixin(GNode.Store)) {
                                    elementToApplyTransform = selectionElement.clone();

                                    // Append clone to parent of selected item
                                    selectionElement.getParent().appendChild(elementToApplyTransform);

                                    // Push clone into new selection
                                    clonedSelection.push(elementToApplyTransform);
                                } else {
                                    elementToApplyTransform = null;
                                }
                            } else {
                                // Avoid transform when locked
                                if (selectionElement.hasFlag(GElement.Flag.Locked)) {
                                    elementToApplyTransform = null;
                                }
                            }

                            if (elementToApplyTransform) {
                                editor.applyTransform(elementToApplyTransform);
                            } else {
                                editor.resetTransform();
                            }
                        }
                    }

                    // Update current selection if we cloned it
                    if (clonedSelection.length > 0) {
                        this.updateSelection(false, clonedSelection);
                    }
                } finally {
                    if (!noTransaction) {
                        // TODO : I18N
                        this.commitTransaction(cloneSelection ? 'Transform & Clone Selection' : 'Transform Selection');
                    }
                }
            }
        }
    };

    /**
     * Inserts one or more elements into the right target parent
     * and selects the elements clearing any previous selection
     * This is a shortcut for insertElements([element])
     * @param {Array<GElement>} elements the elements to be inserted
     * @param {Boolean} noInitial if true, the editor will not be
     * called to handle the newly inserted element to assign some defaults.
     * Defaults to false.
     * @param {Boolean} [noTransaction] if true, will not create a
     * transaction (undo/redo), defaults to false
     */
    GEditor.prototype.insertElements = function (elements, noInitial, noTransaction) {
        // Our target is always the currently active layer
        var target = this._scene.querySingle('page:active layer:active');
        if (!target) {
            throw new Error('No active page/layer.');
        }

        if (!noTransaction) {
            this.beginTransaction();
        }

        try {
            for (var i = 0; i < elements.length; ++i) {
                var element = elements[i];

                // Append new element
                target.appendChild(element);

                if (!noInitial) {
                    // Create a temporary editor for the element to handle it's insertion
                    var editor = GElementEditor.createEditor(element);
                    if (editor) {
                        editor.initialSetup();
                    }
                }
            }

            // Select all inserted elements
            this.updateSelection(false, elements);
        } finally {
            if (!noTransaction) {
                // TODO : I18N
                this.commitTransaction('Insert Element(s)');
            }
        }
    };

    /**
     * Convert selected PathBase descendant shapes into Path elements
     * @param {Boolean} [noTransaction] if true, will not create a
     * transaction (undo/redo), defaults to false
     */
    GEditor.prototype.convertSelectionToPaths = function (noTransaction) {
        var shapesToTransform = [];
        var newSelection = [];
        if (this._selection && this._selection.length) {
            for (var i = 0; i < this._selection.length; ++i) {
                var elem = this._selection[i];
                if (elem instanceof GPathBase && !(elem instanceof GPath) || elem.hasMixin(GVertexSource)) {
                    shapesToTransform.push(elem);
                } else {
                    newSelection.push(elem);
                }
            }
        }
        if (shapesToTransform.length) {
            if (!noTransaction) {
                this.beginTransaction();
            }
            this._beginSelectionUpdate();
            try {
                this.updateSelection(false, shapesToTransform);
                for (var i = 0; i < shapesToTransform.length; ++i) {
                    var shape = shapesToTransform[i];
                    shape.removeFlag(GNode.Flag.Selected);
                    var parent = shape.getParent();
                    var next = shape.getNext(true);
                    parent.removeChild(shape);

                    var path = null;
                    if (shape instanceof GPathBase) {
                        var anchorPoints = shape.clearAnchorPoints();
                        path = new GPath(shape.getProperty('closed'), shape.getProperty('evenodd'), anchorPoints);
                    } else if (shape.hasMixin(GVertexSource)) {
                        path = GPathBase.createPathFromVertexSource(shape);
                    }

                    if (path) {
                        path.assignFrom(shape);
                        shape = null;
                        parent.insertChild(path, next);
                        newSelection.push(path);
                    }
                }
                shapesToTransform = null;
                this.updateSelection(false, newSelection);
            } finally {
                this._finishSelectionUpdate();
                if (!noTransaction) {
                    // TODO : I18N
                    this.commitTransaction('Convert to Path(s)');
                }
            }
        }
    };

    /**
     * Does various work when the mouse was pressed somewhere to update for
     * example the currently active page. Does nothing on single page mode
     * @param {GPoint} position the mouse position
     * @param {GTransform} transform optional transformation for the position
     */
    GEditor.prototype.updateByMousePosition = function (position, transformation) {
        if (this._scene.getProperty('singlePage') === false) {
            // TODO : Make this more efficient than hit-testing everything (aka iterate pages instead)
            // Try to update the active page under mouse if any
            var pageHits = this._scene.hitTest(position, transformation, function (hit) {
                return hit instanceof GPage;
            }.bind(this), false, 1/*one level deep only*/);

            if (pageHits && pageHits.length === 1) {
                for (var child = this._scene.getFirstChild(); child !== null; child = child.getNext()) {
                    if (child instanceof GPage) {
                        if (child === pageHits[0].element) {
                            child.setFlag(GNode.Flag.Active);
                        } else {
                            child.removeFlag(GNode.Flag.Active);
                        }
                    }
                }
            }
        }
    };

    /**
     * Begin a new transaction. This will catch all structural
     * modifications including property changes to be replayed
     * as undo / redo states.
     */
    GEditor.prototype.beginTransaction = function () {
        var sceneEditor = GElementEditor.getEditor(this._scene);
        this._transactionStack.push({
            actions: [],
            selection: this._saveSelection(),
            transformBoxCenter: sceneEditor ? sceneEditor.getTransformBoxCenter() : null
        });
    };

    GEditor.prototype._transactionRedo = function (data) {
        for (var i = 0; i < data.actions.length; ++i) {
            data.actions[i].action();
        }

        this._loadSelection(data.newSelection);

        var sceneEditor = GElementEditor.getEditor(this._scene);
        if (data.newTransformBoxCenter || sceneEditor && sceneEditor.isTransformBoxActive()) {
            if (data.newTransformBoxCenter) {
                sceneEditor.setTransformBoxActive(true, data.newTransformBoxCenter);
            } else {
                sceneEditor.setTransformBoxActive(false);
            }
        }
    };

    GEditor.prototype._transactionUndo = function (data) {
        // Revert needs to play the actions backwards
        for (var i = data.actions.length - 1; i >= 0; --i) {
            data.actions[i].revert();
        }

        this._loadSelection(data.selection);

        var sceneEditor = GElementEditor.getEditor(this._scene);
        if (data.transformBoxCenter || sceneEditor && sceneEditor.isTransformBoxActive()) {
            if (data.transformBoxCenter) {
                sceneEditor.setTransformBoxActive(true, data.transformBoxCenter);
            } else {
                sceneEditor.setTransformBoxActive(false);
            }
        }
    };

    GEditor.prototype._transactionMerge = function (previousData, data) {
        if (GEditor.options.smartUndoPropertyMerge) {
            if (data.actions.length === 1 && previousData.actions.length === 1) {
                var action = data.actions[0];
                var previousAction = previousData.actions[0];

                if (action.isPropertyChangeAction &&
                    previousAction.isPropertyChangeAction &&
                    action.node === previousAction.node &&
                    action.properties.length === previousAction.properties.length) {
                    // If the properties are equal then we can merge
                    var propertiesAreEqual = true;

                    for (var i = 0; i < previousAction.properties.length; ++i) {
                        var property = previousAction.properties[i];
                        if (action.properties.indexOf(property) < 0) {
                            propertiesAreEqual = false;
                            break;
                        }
                    }

                    if (propertiesAreEqual) {
                        // Merge new values in their order
                        for (var i = 0; i < action.properties.length; ++i) {
                            var property = action.properties[i];
                            previousAction.values[previousAction.properties.indexOf(property)] = action.values[i];
                        }

                        return true;
                    }
                }
            }
        }

        return false;
    };

    /**
     * Commit the current transaction. If the transaction doesn't
     * include any changes, no undo/redo state will be committed.
     * @param {String} name
     */
    GEditor.prototype.commitTransaction = function (name) {
        if (!this._transactionStack.length) {
            throw new Error('Nothing to commit, transaction stack is empty.');
        }

        var transaction = this._transactionStack.pop();
        if (transaction.actions.length > 0) {
            var sceneEditor = GElementEditor.getEditor(this._scene);
            var data = {
                actions: transaction.actions.slice(),
                selection: transaction.selection ? transaction.selection.slice() : null,
                newSelection: this._saveSelection(),
                transformBoxCenter: transaction.transformBoxCenter,
                newTransformBoxCenter: sceneEditor ? sceneEditor.getTransformBoxCenter() : null
            };

            this.pushState(name, this._transactionRedo.bind(this), this._transactionUndo.bind(this), data, this._transactionMerge.bind(this));
        }
    };

    /**
     * Manually push an undo state action
     * @param {String} name a name for the state
     * @param {Function(data)} action the action to be executed when executing ("redo")
     * @param {Function(data)} revert the action to be executed when undoing
     * @param {*} data data of the state that'll be pushed to the action and revert functions
     * @param {Function(data, previousData)} [merge] the function to be called to merge the given
     * undo state data with the previous steps' one. If this returns true, the previous undo
     * state is assumed to be merged and the new one will be not added.
     */
    GEditor.prototype.pushState = function (name, action, revert, data, merge) {
        // Try a merge, first
        if (merge && data && this._undoStates.length > 0) {
            var lastUndoState = this._undoStates[this._undoStates.length - 1];
            if (lastUndoState.data && lastUndoState.name === name) {
                if (merge(lastUndoState.data, data)) {
                    // Merged so return here
                    return;
                }
            }
        }

        if (this._undoStates.length >= GEditor.options.maxUndoSteps) {
            // Cut undo list of when reaching our undo limit
            this._undoStates.shift();
        }

        this._undoStates.push({
            name: name ? name : "",
            action: action,
            revert: revert,
            data: data
        });

        // Push a new undo state has to clear out all the redo steps
        this._redoStates = [];
    };

    /**
     * Returns whether at least one undo state is available or not
     * @returns {boolean}
     */
    GEditor.prototype.hasUndoState = function () {
        return this._undoStates.length > 0;
    };

    /**
     * Returns whether at least one redo state is available or not
     * @returns {boolean}
     */
    GEditor.prototype.hasRedoState = function () {
        return this._redoStates.length > 0;
    };

    /**
     * Returns the name of the last undo state if any or null for none
     * @returns {String}
     */
    GEditor.prototype.getUndoStateName = function () {
        if (this._undoStates.length > 0) {
            return this._undoStates[this._undoStates.length - 1].name;
        }
        return null;
    };

    /**
     * Returns the name of the last redo state if any or null for none
     * @returns {String}
     */
    GEditor.prototype.getRedoStateName = function () {
        if (this._redoStates.length > 0) {
            return this._redoStates[this._redoStates.length - 1].name;
        }
        return null;
    };

    /**
     * Undo the latest state if any
     */
    GEditor.prototype.undoState = function () {
        if (this._undoStates.length > 0) {
            // Get state and shift it from undo list
            var state = this._undoStates.pop();

            // Move state into redo list
            this._redoStates.push(state);

            // Execute revert action of the state
            state.revert(state.data);
        }
    };

    /**
     * Redo the latest state if any
     */
    GEditor.prototype.redoState = function () {
        if (this._redoStates.length > 0) {
            // Get state and shift it from redo list
            var state = this._redoStates.pop();

            // Move state into undo list
            this._undoStates.push(state);

            // Execute action of the state
            state.action(state.data);
        }
    };

    /**
     * Checks and returns if there's an active inline editing editor or not
     * @returns {boolean}
     */
    GEditor.prototype.isInlineEditing = function () {
        return !!this._currentInlineEditorNode;
    };

    /**
     * Called to open an inline editor for a given node and view
     * @param {GNode} node
     * @param {GEditorWidget} view
     * @param {GPoint} [position] optional position in screen cordinates,
     * defaults to null
     * @return {Boolean} true if an inline editor was opened, false if not
     */
    GEditor.prototype.openInlineEditor = function (node, view, position) {
        this.closeInlineEditor();

        var editor = GElementEditor.getEditor(node);
        if (editor && editor.canInlineEdit()) {
            if (this.hasEventListeners(GEditor.InlineEditorEvent)) {
                this.trigger(new GEditor.InlineEditorEvent(editor, GEditor.InlineEditorEvent.Type.BeforeOpen));
            }

            editor.beginInlineEdit(view, view._htmlElement);
            editor.adjustInlineEditForView(view, position);

            this._currentInlineEditorNode = node;

            if (this.hasEventListeners(GEditor.InlineEditorEvent)) {
                this.trigger(new GEditor.InlineEditorEvent(editor, GEditor.InlineEditorEvent.Type.AfterOpen));
            }

            return true;
        }

        return false;
    };

    /**
     * Called to update any active inline editor for a given view
     * @param {GEditorWidget} view
     */
    GEditor.prototype.updateInlineEditorForView = function (view) {
        if (this._currentInlineEditorNode) {
            var editor = GElementEditor.getEditor(this._currentInlineEditorNode);
            if (editor && editor.isInlineEdit()) {
                editor.adjustInlineEditForView(view);
            }
        }
    };

    /**
     * Called to close any active inline editor
     * @return {Boolean} true if an inline editor was closed, false if not
     */
    GEditor.prototype.closeInlineEditor = function () {
        if (this._currentInlineEditorNode) {
            return this._finishEditorInlineEdit(this._currentInlineEditorNode);
        }
        return false;
    };

    /**
     * @param {GNode.AfterInsertEvent} evt
     * @private
     */
    GEditor.prototype._afterNodeInsert = function (evt) {
        // If we have an active transaction, we need to record the action
        if (this._transactionStack.length) {
            var node = evt.node;
            var parent = node.getParent();
            var next = node.getNext();

            this._transactionStack[this._transactionStack.length - 1].actions.push({
                action: function () {
                    // Simply re-insert the node
                    parent.insertChild(node, next);
                },

                revert: function () {
                    // Simply remove the node
                    parent.removeChild(node);
                }
            });
        }
        ;

        // Try to add newly inserted node into internal selection
        this._tryAddToSelection(evt.node);
    };

    /**
     * @param {GNode.BeforeRemoveEvent} evt
     * @private
     */
    GEditor.prototype._beforeNodeRemove = function (evt) {
        // If we have an active transaction, we need to record the action
        if (this._transactionStack.length) {
            var node = evt.node;
            var parent = node.getParent();
            var next = node.getNext();

            this._transactionStack[this._transactionStack.length - 1].actions.push({
                action: function () {
                    // Simply remove the node
                    parent.removeChild(node);
                },

                revert: function () {
                    // Simply re-insert the node
                    parent.insertChild(node, next);
                }
            });
        }

        if (evt.node instanceof GElement) {
            // If element is in selection, unselect it, first
            if (this._selection && this._selection.indexOf(evt.node) >= 0) {
                evt.node.removeFlag(GNode.Flag.Selected);
            } else {
                // Otherwise try to close any editors the node may have
                this._closeEditor(evt.node);
            }
        }

        if (evt.node instanceof GPage && this._scene.getProperty('singlePage') === true) {
            // Remove saved page selection when removing the page and singlePage mode is turned on
            this._removePageSelection(evt.node);
        }
    };

    /**
     * @param {GNode.AfterPropertiesChangeEvent} evt
     * @private
     */
    GEditor.prototype._afterPropertiesChange = function (evt) {
        // If we have an active transaction, we need to record the action
        if (this._transactionStack.length) {
            var node = evt.node;
            var properties = evt.properties;
            var values = node.getProperties(evt.properties);
            var oldValues = evt.values.slice();

            this._transactionStack[this._transactionStack.length - 1].actions.push({
                isPropertyChangeAction: true,
                node: node,
                properties: properties.slice(),
                values: values.slice(),
                oldValues: oldValues,

                action: function () {
                    // Simply assign the property values
                    node.setProperties(this.properties, this.values);
                },

                revert: function () {
                    // Simply assign the previous property values
                    node.setProperties(this.properties, this.oldValues);
                }
            });
        }
    };

    /**
     * @param {GNode.BeforeFlagChangeEvent} evt
     * @private
     */
    GEditor.prototype._beforeFlagChange = function (evt) {
        if (evt.node instanceof GElement) {
            if (evt.flag === GElement.Flag.Hidden) {
                if (evt.set) {
                    // Deselect elements getting hidden
                    evt.node.removeFlag(GNode.Flag.Selected);
                }
            }
        }
    };

    /**
     * @param {GNode.AfterFlagChangeEvent} evt
     * @private
     */
    GEditor.prototype._afterFlagChange = function (evt) {
        if (evt.node instanceof GElement) {
            if (evt.flag === GNode.Flag.Selected) {
                if (evt.set) {
                    // Try to add node to the internal selection
                    this._tryAddToSelection(evt.node);
                } else {
                    // Try to remove node from the internal selection
                    this._tryRemoveFromSelection(evt.node);
                }
            } else if (evt.flag == GNode.Flag.Highlighted) {
                if (evt.set) {
                    var editor = GElementEditor.openEditor(evt.node);
                    if (editor) {
                        editor.setFlag(GElementEditor.Flag.Highlighted);
                    }
                } else {
                    var editor = GElementEditor.openEditor(evt.node);
                    if (editor) {
                        editor.removeFlag(GElementEditor.Flag.Highlighted);
                    }
                    this._tryCloseEditor(evt.node);
                }
            } else if (evt.flag == GNode.Flag.Active) {
                // In single page mode we'll save & restore page selections
                if (evt.node instanceof GPage && this._scene.getProperty('singlePage') === true) {
                    if (evt.set) {
                        this._restorePageSelection(evt.node);
                    } else {
                        this._savePageSelection(evt.node, false, true/*check-overwrite*/);
                    }
                }
            }
        }
    };

    /**
     * @param {GElement.GeometryChangeEvent} evt
     * @private
     */
    GEditor.prototype._geometryChange = function (evt) {
        if (this._selection && this._selection.indexOf(evt.element) >= 0) {
            switch (evt.type) {
                case GElement.GeometryChangeEvent.Type.Before:
                case GElement.GeometryChangeEvent.Type.After:
                case GElement.GeometryChangeEvent.Type.Child:
                    var editor = GElementEditor.getEditor(evt.element);
                    if (editor) {
                        editor.requestInvalidation();
                    }
                    break;
            }
        }
    };

    /**
     * @private
     */
    GEditor.prototype._beginSelectionUpdate = function () {
        this._selectionUpdateCounter += 1;
    };

    /**
     * @private
     */
    GEditor.prototype._finishSelectionUpdate = function () {
        if (--this._selectionUpdateCounter === 0) {
            this._updatedSelection();
        }
    };

    /**
     * @private
     */
    GEditor.prototype._updatedSelection = function () {
        if (this._selectionUpdateCounter === 0) {
            // Clear last clone selection
            this._lastCloneSelection = null;

            // Trigger selection change event
            if (this.hasEventListeners(GEditor.SelectionChangedEvent)) {
                this.trigger(GEditor.SELECTION_CHANGED_EVENT);
            }
        }
    };

    /**
     * Try to add a node to internal selection if it is selected
     * @param {GNode} node
     * @private
     */
    GEditor.prototype._tryAddToSelection = function (node) {
        if (node instanceof GElement) {
            if (node.hasFlag(GNode.Flag.Selected)) {
                // Try to open an editor for the selected node
                var editor = GElementEditor.openEditor(node);
                if (editor) {
                    editor.setFlag(GElementEditor.Flag.Selected);

                    if (this._selectionDetail) {
                        editor.setFlag(GElementEditor.Flag.Detail);
                    }

                    // Add the node to our internal selection array
                    if (editor.validateSelectionChange()) {
                        if (!this._selection) {
                            this._selection = [];
                        }
                        this._selection.push(node);

                        this._updatedSelection();

                    }
                }
            }
        }
    };

    /**
     * Try to remove a node from the internal selection
     * @param {GNode} node
     * @private
     */
    GEditor.prototype._tryRemoveFromSelection = function (node) {
        if (node instanceof GElement) {
            // Close the editor for the previously selected node if it has any
            var editor = GElementEditor.getEditor(node);
            if (editor && editor.hasFlag(GElementEditor.Flag.Selected)) {
                var selectionChangeAllowed = editor.validateSelectionChange();
                editor.removeFlag(GElementEditor.Flag.Selected);
                this._tryCloseEditor(node);

                // Remove the node from our selection array if we find it
                if (this._selection && selectionChangeAllowed) {
                    var sameParentInSelection = false;
                    var removeIndex = -1;

                    // Iterate through selection
                    for (var i = 0; i < this._selection.length; ++i) {
                        var selNode = this._selection[i];
                        if (selNode === node) {
                            removeIndex = i;
                        } else if (selNode.getParent() === node.getParent()) {
                            sameParentInSelection = true;
                        }
                    }

                    // Remove from selection
                    this._selection.splice(removeIndex, 1);
                    if (this._selection.length == 0) {
                        this._selection = null;
                    }
                    this._updatedSelection();
                }
            }
        }
    };

    GEditor.prototype._tryCloseEditor = function (node) {
        var editor = GElementEditor.getEditor(node);
        if (!editor || editor.hasFlag(GElementEditor.Flag.Selected) || editor.hasFlag(GElementEditor.Flag.Highlighted)) {
            // can not close editor in this case(s)
            return;
        }

        // Only close editor if it doesn't have any children
        if (editor.getEditors() == null || editor.getEditors().length == 0) {
            // Save our parent editor
            var parentEditor = editor.getParentEditor();

            // Close our editor now
            this._closeEditor(node);

            // If we have a parent editor, try to close it recursively as well
            if (parentEditor) {
                this._tryCloseEditor(parentEditor.getElement());
            }
        }
    };

    GEditor.prototype._finishEditorInlineEdit = function (node) {
        var editor = GElementEditor.getEditor(node);
        if (editor && editor.isInlineEdit()) {
            if (this.hasEventListeners(GEditor.InlineEditorEvent)) {
                this.trigger(new GEditor.InlineEditorEvent(editor, GEditor.InlineEditorEvent.Type.BeforeClose));
            }

            var editText = null;
            this.beginTransaction();
            try {
                editText = editor.finishInlineEdit();
            } finally {
                // TODO : I18N
                this.commitTransaction(editText ? editText : 'Inline Editing');
            }

            if (node === this._currentInlineEditorNode) {
                this._currentInlineEditorNode = null;
            }

            if (this.hasEventListeners(GEditor.InlineEditorEvent)) {
                this.trigger(new GEditor.InlineEditorEvent(editor, GEditor.InlineEditorEvent.Type.AfterClose));
            }

            return true;
        }
        return false;
    };

    GEditor.prototype._closeEditor = function (node) {
        this._finishEditorInlineEdit(node);
        GElementEditor.closeEditor(node);
    };

    /**
     * Save the selection for a given page
     * @param {GPage} page
     * @param {Boolean} [noOverwrite] if set, won't overwrite
     * the saved selection for the page on page change
     * @param {Boolean} [checkOverwrite] if set, will not store
     * the page selection if it has the noOverwrite flag set to true
     * @private
     */
    GEditor.prototype._savePageSelection = function (page, noOverwrite, checkOverwrite) {
        if (!this._pageSelections) {
            this._pageSelections = [];
        }

        // Try to overwrite an existing selection
        for (var i = 0; i < this._pageSelections.length; ++i) {
            var sel = this._pageSelections[i];
            if (sel.page === page) {
                if (!checkOverwrite || !sel.noOverwrite) {
                    sel.selection = this._saveSelection();
                    sel.noOverwrite = noOverwrite;
                }

                // done here
                return;
            }
        }

        // Create new selection storage for page when coming here
        this._pageSelections.push({
            page: page,
            selection: this._saveSelection()
        });
    };

    /**
     * Restore the selection for a given page
     * @param {GPage} page
     * @private
     */
    GEditor.prototype._restorePageSelection = function (page) {
        if (this._pageSelections) {
            for (var i = 0; i < this._pageSelections.length; ++i) {
                var sel = this._pageSelections[i];
                if (sel.page === page) {
                    this._loadSelection(sel.selection);
                    // done here
                    return;
                }
            }
        }

        // No selection for page available so clear the current one
        this.clearSelection();
    };

    /**
     * Remove the stored selection for a given page
     * @param {GPage} page
     * @private
     */
    GEditor.prototype._removePageSelection = function (page) {
        if (this._pageSelections) {
            for (var i = 0; i < this._pageSelections.length; ++i) {
                var sel = this._pageSelections[i];
                if (sel.page === page) {
                    this._pageSelections.splice(i, 1);
                    break;
                }
            }
        }
    };

    /**
     * Saves and returns the current selection
     * @return {Array<{element: GElement, parts: Array<*>}>}
     * @private
     */
    GEditor.prototype._saveSelection = function () {
        if (!this._selection || this._selection.length === 0) {
            return null;
        }

        var result = [];
        for (var i = 0; i < this._selection.length; ++i) {
            var element = this._selection[i];
            var editor = GElementEditor.getEditor(element);
            var parts = editor ? editor.getPartSelection() : null;
            result.push({
                element: element,
                parts: parts ? parts.slice() : null
            })
        }

        return result;
    };

    /**
     * Loads a saved selection
     * @param {Array<{element: GElement, parts: Array<*>}>} selection
     * @private
     */
    GEditor.prototype._loadSelection = function (selection) {
        if (!selection || selection.length === 0) {
            this.clearSelection();
        } else {
            var newSelection = [];

            for (var i = 0; i < selection.length; ++i) {
                newSelection.push(selection[i].element);
            }

            this.updateSelection(false, newSelection);

            // Iterate selection again and assign part selections if any
            for (var i = 0; i < selection.length; ++i) {
                if (selection[i].parts) {
                    var editor = GElementEditor.getEditor(selection[i].element);
                    if (editor) {
                        editor.updatePartSelection(false, selection[i].parts);
                    }
                }
            }
        }
    };

    /** @override */
    GEditor.prototype.toString = function () {
        return "[Object GEditor]";
    };

    _.GEditor = GEditor;
})(this);