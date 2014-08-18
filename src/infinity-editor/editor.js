(function (_) {
    /**
     * A graphic editor keeps track of all editing related stuff for a scene
     * like handling selection, keeping undo/redo information and more.
     * @param {IFScene} scene the scene this editor works on
     * @class IFEditor
     * @extend GEventTarget
     * @constructor
     */
    function IFEditor(scene) {
        this._scene = scene;
        this._scene.__graphic_editor__ = this;
        this._transactionStack = [];
        this._undoStates = [];
        this._redoStates = [];
        this._guides = new IFGuides(this._scene);

        // Subscribe to various scene changes
        this._scene.addEventListener(IFNode.AfterInsertEvent, this._afterNodeInsert, this);
        this._scene.addEventListener(IFNode.BeforeRemoveEvent, this._beforeNodeRemove, this);
        this._scene.addEventListener(IFNode.BeforePropertiesChangeEvent, this._beforePropertiesChange, this);
        this._scene.addEventListener(IFNode.BeforeFlagChangeEvent, this._beforeFlagChange, this);
        this._scene.addEventListener(IFNode.AfterFlagChangeEvent, this._afterFlagChange, this);
        this._scene.addEventListener(IFElement.GeometryChangeEvent, this._geometryChange, this);

        // Try to create internal selection for all selected nodes
        var selectedNodes = this._scene.queryAll(":selected");
        if (selectedNodes && selectedNodes.length) {
            for (var i = 0; i < selectedNodes.length; ++i) {
                this._tryAddToSelection(selectedNodes[i]);
            }
        }
    };
    IFObject.inherit(IFEditor, GEventTarget);

    IFEditor.options = {
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
     * @param {IFScene} scene
     * @returns {IFEditor} a graphic editor for the scene
     * or null if it has no such one
     */
    IFEditor.getEditor = function (scene) {
        return scene.__graphic_editor__ ? scene.__graphic_editor__ : null;
    };

    /**
     * Runs + commits a transaction on an editor. If there's no editor for a
     * given source, the action will still be ran but without any
     * transactions at all
     * @param {IFNode} source the source to get an editor from
     * @param {Function} action the actual action to be ran
     * @param {String} name the name of the transaction when committed
     */
    IFEditor.tryRunTransaction = function (source, action, name) {
        var editor = IFEditor.getEditor(source.getScene());
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
    // IFEditor.SelectionChangedEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever the selection has been changed
     * @class IFEditor.SelectionChangedEvent
     * @extends GEvent
     * @constructor
     */
    IFEditor.SelectionChangedEvent = function () {
    };
    IFObject.inherit(IFEditor.SelectionChangedEvent, GEvent);

    /** @override */
    IFEditor.SelectionChangedEvent.prototype.toString = function () {
        return "[Event IFEditor.SelectionChangedEvent]";
    };

    IFEditor.SELECTION_CHANGED_EVENT = new IFEditor.SelectionChangedEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // IFEditor.InlineEditorEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event providing inline editor events
     * @class IFEditor.InlineEditorEvent
     * @extends GEvent
     * @constructor
     */
    IFEditor.InlineEditorEvent = function (editor, type) {
        this.editor = editor;
        this.type = type;
    };
    IFObject.inherit(IFEditor.InlineEditorEvent, GEvent);

    /**
     * Enum of inline editor event types
     * @enum
     */
    IFEditor.InlineEditorEvent.Type = {
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
     * @type {IFElementEditor}
     */
    IFEditor.InlineEditorEvent.prototype.editor = null;

    /**
     * @type {IFEditor.InlineEditorEvent.Type}
     */
    IFEditor.InlineEditorEvent.prototype.type = null;

    /** @override */
    IFEditor.InlineEditorEvent.prototype.toString = function () {
        return "[Event IFEditor.InlineEditorEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFEditor.InvalidationRequestEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for an invalidation request event
     * @param {IFElementEditor} editor the requesting editor
     * @param {*} [args] optional arguments to be passed back to editor
     * @class IFEditor.InvalidationRequestEvent
     * @extends GEvent
     * @constructor
     */
    IFEditor.InvalidationRequestEvent = function (editor, args) {
        this.editor = editor;
        this.args = args;
    };
    IFObject.inherit(IFEditor.InvalidationRequestEvent, GEvent);

    /** @type {IFElementEditor} */
    IFEditor.InvalidationRequestEvent.prototype.editor = null;
    /** @type {*} */
    IFEditor.InvalidationRequestEvent.prototype.args = null;

    /** @override */
    IFEditor.InvalidationRequestEvent.prototype.toString = function () {
        return "[Event IFEditor.InvalidationRequestEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFEditor Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {IFScene}
     * @private
     */
    IFEditor.prototype._scene = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    IFEditor.prototype._selection = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    IFEditor.prototype._lastCloneSelection = null;

    /**
     * @type {Array<*>}
     * @private
     */
    IFEditor.prototype._storedSelection = null;

    /**
     * @type {Array<{{page: IFPage, selection: Array<*>}}>}
     * @private
     */
    IFEditor.prototype._pageSelections = null;

    /**
     * @type {number}
     * @private
     */
    IFEditor.prototype._selectionUpdateCounter = 0;

    /**
     * @type {boolean}
     * @private
     */
    IFEditor.prototype._selectionDetail = false;

    /**
     * @type {Array<{{actions: Array<{action: Function, revert: Function}>, selection: Array<{element: IFElement, parts: Array<*>}>}}>}
     * @private
     */
    IFEditor.prototype._transactionStack = null;

    /**
     * @type {Array<*>}
     * @private
     */
    IFEditor.prototype._undoStates = null;

    /**
     * @type {Array<*>}
     * @private
     */
    IFEditor.prototype._redoStates = null;

    /**
     * @type {IFGuides}
     * @private
     */
    IFEditor.prototype._guides = null;

    /**
     * @type {IFNode}
     * @private
     */
    IFEditor.prototype._currentInlineEditorNode = null;
    /**
     * @returns {IFScene}
     */
    IFEditor.prototype.getScene = function () {
        return this._scene;
    };

    /**
     * Return whether any selection is available or not
     * @return {Boolean} true if a selection is available, false if not
     * @version 1.0
     */
    IFEditor.prototype.hasSelection = function () {
        return this._selection && this._selection.length > 0;
    };

    /**
     * Return the selection array
     * @return {Array<IFElement>} the selection array or null for no selection
     * @version 1.0
     */
    IFEditor.prototype.getSelection = function () {
        return this._selection;
    };

    /**
     * Return the copy of the selection array. Elements in this copy has canvas-relative positions.
     * @return {Array<IFElement>} the selection array copy or null for no selection
     */
    IFEditor.prototype.getSelectionCopy = function () {
        var selectionCopy = null;
        if (this._selection && this._selection.length > 0) {
            selectionCopy = [];

            for (var i = 0; i < this._selection.length; ++i) {
                var element = this._selection[i];
                if (element instanceof IFBlock) {
                    var page = element.getPage();
                    var copyElem = element.clone();
                    if (copyElem) {
                        copyElem.transform(
                            new IFTransform(1, 0, 0, 1, -page.getProperty('x'), -page.getProperty('y')));
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
    IFEditor.prototype.hasSelectionDetail = function () {
        return this._selectionDetail;
    };

    /**
     * Assigns whether selection details are available or not
     * @param {Boolean} detail
     */
    IFEditor.prototype.setSelectionDetail = function (detail) {
        if (detail !== this._selectionDetail) {
            this._selectionDetail = detail;

            // Re-flag selection if any
            if (this._selection) {
                for (var i = 0; i < this._selection.length; ++i) {
                    var editor = IFElementEditor.getEditor(this._selection[i]);
                    if (editor) {
                        if (this._selectionDetail) {
                            editor.setFlag(IFElementEditor.Flag.Detail);
                        } else {
                            editor.removeFlag(IFElementEditor.Flag.Detail);
                        }
                    }
                }
            }
        }
    };

    /**
     * Return the editor's guides
     * @returns {IFGuides}
     */
    IFEditor.prototype.getGuides = function () {
        return this._guides;
    };

    /**
     * Returns a reference to the selected path, if it is the only one selected,
     * or null otherwise
     * @return {IFPath} the selected path
     */
    IFEditor.prototype.getPathSelection = function () {
        var pathRef = null;
        var i;

        if (this.hasSelection()) {
            for (i = 0; i < this._selection.length; ++i) {
                if (this._selection[i] instanceof IFPath) {
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

    /**
     * Called to release and detach this editor
     */
    IFEditor.prototype.release = function () {
        delete this._scene.__graphic_editor__;

        this._scene.removeEventListener(IFNode.AfterInsertEvent, this._afterNodeInsert);
        this._scene.removeEventListener(IFNode.BeforeRemoveEvent, this._beforeNodeRemove);
        this._scene.removeEventListener(IFNode.BeforePropertiesChangeEvent, this._beforePropertiesChange);
        this._scene.removeEventListener(IFNode.BeforeFlagChangeEvent, this._beforeFlagChange);
        this._scene.removeEventListener(IFNode.AfterFlagChangeEvent, this._afterFlagChange);
        this._scene.removeEventListener(IFElement.GeometryChangeEvent, this._geometryChange);
    };

    /**
     * Request the invalidation of an editor
     * @param {IFElementEditor} editor the requesting editor
     * @param {*} [args] optional arguments to be passed back to the editor
     */
    IFEditor.prototype.requestInvalidation = function (editor, args) {
        if (this.hasEventListeners(IFEditor.InvalidationRequestEvent)) {
            this.trigger(new IFEditor.InvalidationRequestEvent(editor, args));
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
     * @return {Array<IFElement>} the array of clones or null for no clones
     */
    IFEditor.prototype.cloneSelection = function (shift, history) {
        if (this._selection && this._selection.length > 0) {
            /** Array<{{element: IFElement, transform: IFTransform}}> */
            var elementsToClone = [];

            for (var i = 0; i < this._selection.length; ++i) {
                var element = this._selection[i];
                if (element.hasMixin(IFNode.Store)) {
                    elementsToClone.push({
                        element: element,
                        transform: shift ? new IFTransform(1, 0, 0, 1, IFEditor.options.cloneShift, IFEditor.options.cloneShift) : null
                    });
                }
            }

            var clonedSelection = [];

            if (history) {
                if (this._lastCloneSelection) {
                    for (var i = 0; i < this._lastCloneSelection.length; ++i) {
                        var source = this._lastCloneSelection[i];
                        var target = elementsToClone[i].element;
                        if (source.hasMixin(IFElement.Transform) && target.hasMixin(IFElement.Transform)) {
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
                    if (transform && clone.hasMixin(IFElement.Transform)) {
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
     * delete IFItem based classes so that layers and/or pages
     * are not accidently deleted. Note also that this will not
     * delete items that are locked
     * @param {Boolean} [noTransaction] if true, will not create a
     * transaction (undo/redo), defaults to false
     */
    IFEditor.prototype.deleteSelection = function (noTransaction) {
        if (this._selection && this._selection.length > 0) {
            if (!noTransaction) {
                this.beginTransaction();
            }

            try {
                // copy and order selection
                var orderedSelection = IFNode.order(this._selection.slice(), true);

                // clear selection before deleting it
                this.clearSelection();

                // now delete
                for (var i = 0; i < orderedSelection.length; ++i) {
                    var selElement = orderedSelection[i];
                    if (selElement instanceof IFItem && !selElement.hasFlag(IFElement.Flag.Locked)) {
                        selElement.getParent().removeChild(selElement);
                    }
                }
            } finally {
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
     * @param {Array<IFElement>} selection the new array of nodes to be selected
     */
    IFEditor.prototype.updateSelection = function (toggle, selection) {
        this._beginSelectionUpdate();
        try {
            if (!toggle) {
                // Select new selection if any
                if (selection && selection.length > 0) {
                    for (var i = 0; i < selection.length; ++i) {
                        selection[i].setFlag(IFNode.Flag.Selected);
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
                        if (selection[i].hasFlag(IFNode.Flag.Selected)) {
                            selection[i].removeFlag(IFNode.Flag.Selected);
                        } else {
                            selection[i].setFlag(IFNode.Flag.Selected);
                        }
                    }
                }
            }
        } finally {
            this._finishSelectionUpdate();
        }
    };

    /**
     * Clears the whole selection if any
     * @param {Array<IFElement>} [exclusion] an array to exclude from removing
     * from the selection or null for none
     */
    IFEditor.prototype.clearSelection = function (exclusion) {
        if (ifUtil.equals(exclusion, this._selection)) {
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
                this._selection[index].removeFlag(IFNode.Flag.Selected);
            }
        } finally {
            this._finishSelectionUpdate();
        }
    };

    /**
     * Temporarily store the current selection
     */
    IFEditor.prototype.storeSelection = function () {
        if (this._scene.getProperty('singlePage')) {
            this._savePageSelection(this._scene.getActivePage(), true/*no-overwrite*/);
        } else {
            this._storedSelection = this._saveSelection();
        }
    };

    /**
     * Restore a temporarily stored selection
     */
    IFEditor.prototype.restoreSelection = function () {
        if (this._scene.getProperty('singlePage')) {
            this._restorePageSelection(this._scene.getActivePage());
        } else {
            this._loadSelection(this._storedSelection);
        }
    };

    /**
     * Move the selection
     * @param {IFPoint} delta the move delta
     * @param {Boolean} align whether to automatically align or not
     * @param {*} [partId] optional id of part that has started the transformation
     * @param {*} [data] optional data of part that has started the transformation
     * @param {IFPoint} startPos - movement start position, needed when align is true only
     */
    IFEditor.prototype.moveSelection = function (delta, align, partId, partData, startPos) {
        var translation = delta;
        if (align && startPos && this._selection.length == 1) {
            var selBBox = IFElement.prototype.getGroupGeometryBBox(this._selection);
            var side = selBBox.getClosestSideName(startPos);
            var sidePos = selBBox.getSide(side);
            var newSidePos = sidePos.add(delta);
            this._guides.getShapeBoxGuide().useExclusions(this._selection);
            this._guides.beginMap();
            newSidePos = this._guides.mapPoint(newSidePos);
            this._guides.finishMap();
            translation = newSidePos.subtract(sidePos);
        }

        this.transformSelection(new IFTransform(1, 0, 0, 1, translation.getX(), translation.getY()), partId, partData);
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
    IFEditor.prototype.scaleSelection = function (sx, sy, dx, dy, align, partId, partData) {
        var selBBox = IFElement.prototype.getGroupGeometryBBox(this._selection);
        if (selBBox) {
            // TODO : Align support
            var tl = selBBox.getSide(IFRect.Side.TOP_LEFT);
            var br = selBBox.getSide(IFRect.Side.BOTTOM_RIGHT);
            var cnt = selBBox.getSide(IFRect.Side.CENTER);
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

            var transform = new IFTransform(1, 0, 0, 1, -tx, -ty)
                .multiplied(new IFTransform(sx, 0, 0, sy, 0, 0))
                .multiplied(new IFTransform(1, 0, 0, 1, tx, ty));

            this.transformSelection(transform, partId, partData);
        }
    };

    /**
     * Transform the selection
     * @param {IFTransform} transform the transform to be used
     * @param {*} [part] optional id of part that has started the transformation
     * @param {*} [partId] optional data of part that has started the transformation
     */
    IFEditor.prototype.transformSelection = function (transform, partId, partData) {
        if (this._selection && this._selection.length) {
            for (var i = 0; i < this._selection.length; ++i) {
                var item = this._selection[i];
                var editor = IFElementEditor.getEditor(item);
                if (editor) {
                    editor.transform(transform, partId, partData);
                }
            }
        }
    };

    /**
     * Reset the transformation of the selection
     */
    IFEditor.prototype.resetSelectionTransform = function () {
        if (this._selection && this._selection.length) {
            for (var i = 0; i < this._selection.length; ++i) {
                var item = this._selection[i];
                var editor = IFElementEditor.getEditor(item);
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
    IFEditor.prototype.applySelectionTransform = function (cloneSelection, noTransaction) {
        if (this._selection && this._selection.length) {
            // Filter selection by editors that can not be transformed
            // and reset those instead here
            var newSelection = [];
            for (var i = 0; i < this._selection.length; ++i) {
                var item = this._selection[i];
                var editor = IFElementEditor.getEditor(item);
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
                        var editor = IFElementEditor.getEditor(item);
                        if (editor) {
                            var selectionElement = newSelection[i];
                            var elementToApplyTransform = selectionElement;

                            if (cloneSelection) {
                                if (selectionElement.hasMixin(IFNode.Store)) {
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
                                if (selectionElement.hasFlag(IFElement.Flag.Locked)) {
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
     * @param {Array<IFElement>} elements the elements to be inserted
     * @param {Boolean} noInitial if true, the editor will not be
     * called to handle the newly inserted element to assign some defaults.
     * Defaults to false.
     * @param {Boolean} [noTransaction] if true, will not create a
     * transaction (undo/redo), defaults to false
     */
    IFEditor.prototype.insertElements = function (elements, noInitial, noTransaction) {
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
                    var editor = IFElementEditor.createEditor(element);
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
     * Does various work when the mouse was pressed somewhere to update for
     * example the currently active page. Does nothing on single page mode
     * @param {IFPoint} position the mouse position
     * @param {IFTransform} transform optional transformation for the position
     */
    IFEditor.prototype.updateByMousePosition = function (position, transformation) {
        if (this._scene.getProperty('singlePage') === false) {
            // TODO : Make this more efficient than hit-testing everything (aka iterate pages instead)
            // Try to update the active page under mouse if any
            var pageHits = this._scene.hitTest(position, transformation, function (hit) {
                return hit instanceof IFPage;
            }.bind(this), false, 1/*one level deep only*/);

            if (pageHits && pageHits.length === 1) {
                for (var child = this._scene.getFirstChild(); child !== null; child = child.getNext()) {
                    if (child instanceof IFPage) {
                        if (child === pageHits[0].element) {
                            child.setFlag(IFNode.Flag.Active);
                        } else {
                            child.removeFlag(IFNode.Flag.Active);
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
    IFEditor.prototype.beginTransaction = function () {
        var sceneEditor = IFElementEditor.getEditor(this._scene);
        this._transactionStack.push({
            actions: [],
            selection: this._saveSelection(),
            transformBoxCenter: sceneEditor ? sceneEditor.getTransformBoxCenter() : null
        });
    };

    IFEditor.prototype._transactionRedo = function (data) {
        for (var i = 0; i < data.actions.length; ++i) {
            data.actions[i].action();
        }

        this._loadSelection(data.newSelection);

        var sceneEditor = IFElementEditor.getEditor(this._scene);
        if (data.newTransformBoxCenter || sceneEditor && sceneEditor.isTransformBoxActive()) {
            if (data.newTransformBoxCenter) {
                sceneEditor.setTransformBoxActive(true, data.newTransformBoxCenter);
            } else {
                sceneEditor.setTransformBoxActive(false);
            }
        }
    };

    IFEditor.prototype._transactionUndo = function (data) {
        // Revert needs to play the actions backwards
        for (var i = data.actions.length - 1; i >= 0; --i) {
            data.actions[i].revert();
        }

        this._loadSelection(data.selection);

        var sceneEditor = IFElementEditor.getEditor(this._scene);
        if (data.transformBoxCenter || sceneEditor && sceneEditor.isTransformBoxActive()) {
            if (data.transformBoxCenter) {
                sceneEditor.setTransformBoxActive(true, data.transformBoxCenter);
            } else {
                sceneEditor.setTransformBoxActive(false);
            }
        }
    };

    IFEditor.prototype._transactionMerge = function (previousData, data) {
        if (IFEditor.options.smartUndoPropertyMerge) {
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
    IFEditor.prototype.commitTransaction = function (name) {
        if (!this._transactionStack.length) {
            throw new Error('Nothing to commit, transaction stack is empty.');
        }

        var transaction = this._transactionStack.pop();
        if (transaction.actions.length > 0) {
            var sceneEditor = IFElementEditor.getEditor(this._scene);
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
    IFEditor.prototype.pushState = function (name, action, revert, data, merge) {
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

        if (this._undoStates.length >= IFEditor.options.maxUndoSteps) {
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
    IFEditor.prototype.hasUndoState = function () {
        return this._undoStates.length > 0;
    };

    /**
     * Returns whether at least one redo state is available or not
     * @returns {boolean}
     */
    IFEditor.prototype.hasRedoState = function () {
        return this._redoStates.length > 0;
    };

    /**
     * Returns the name of the last undo state if any or null for none
     * @returns {String}
     */
    IFEditor.prototype.getUndoStateName = function () {
        if (this._undoStates.length > 0) {
            return this._undoStates[this._undoStates.length - 1].name;
        }
        return null;
    };

    /**
     * Returns the name of the last redo state if any or null for none
     * @returns {String}
     */
    IFEditor.prototype.getRedoStateName = function () {
        if (this._redoStates.length > 0) {
            return this._redoStates[this._redoStates.length - 1].name;
        }
        return null;
    };

    /**
     * Undo the latest state if any
     */
    IFEditor.prototype.undoState = function () {
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
    IFEditor.prototype.redoState = function () {
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
    IFEditor.prototype.isInlineEditing = function () {
        return !!this._currentInlineEditorNode;
    };

    /**
     * Called to open an inline editor for a given node and view
     * @param {IFNode} node
     * @param {IFEditorView} view
     * @param {IFPoint} [position] optional position in screen cordinates,
     * defaults to null
     * @return {Boolean} true if an inline editor was opened, false if not
     */
    IFEditor.prototype.openInlineEditor = function (node, view, position) {
        this.closeInlineEditor();

        var editor = IFElementEditor.getEditor(node);
        if (editor && editor.canInlineEdit()) {
            if (this.hasEventListeners(IFEditor.InlineEditorEvent)) {
                this.trigger(new IFEditor.InlineEditorEvent(editor, IFEditor.InlineEditorEvent.Type.BeforeOpen));
            }

            editor.beginInlineEdit(view, view._htmlElement);
            editor.adjustInlineEditForView(view, position);

            this._currentInlineEditorNode = node;

            if (this.hasEventListeners(IFEditor.InlineEditorEvent)) {
                this.trigger(new IFEditor.InlineEditorEvent(editor, IFEditor.InlineEditorEvent.Type.AfterOpen));
            }

            return true;
        }

        return false;
    };

    /**
     * Called to update any active inline editor for a given view
     * @param {IFEditorView} view
     */
    IFEditor.prototype.updateInlineEditorForView = function (view) {
        if (this._currentInlineEditorNode) {
            var editor = IFElementEditor.getEditor(this._currentInlineEditorNode);
            if (editor && editor.isInlineEdit()) {
                editor.adjustInlineEditForView(view);
            }
        }
    };

    /**
     * Called to close any active inline editor
     * @return {Boolean} true if an inline editor was closed, false if not
     */
    IFEditor.prototype.closeInlineEditor = function () {
        if (this._currentInlineEditorNode) {
            return this._finishEditorInlineEdit(this._currentInlineEditorNode);
        }
        return false;
    };

    /**
     * @param {IFNode.AfterInsertEvent} evt
     * @private
     */
    IFEditor.prototype._afterNodeInsert = function (evt) {
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
     * @param {IFNode.BeforeRemoveEvent} evt
     * @private
     */
    IFEditor.prototype._beforeNodeRemove = function (evt) {
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

        if (evt.node instanceof IFElement) {
            // If element is in selection, unselect it, first
            if (this._selection && this._selection.indexOf(evt.node) >= 0) {
                evt.node.removeFlag(IFNode.Flag.Selected);
            } else {
                // Otherwise try to close any editors the node may have
                this._closeEditor(evt.node);
            }
        }

        if (evt.node instanceof IFPage && this._scene.getProperty('singlePage') === true) {
            // Remove saved page selection when removing the page and singlePage mode is turned on
            this._removePageSelection(evt.node);
        }
    };

    /**
     * @param {IFNode.BeforePropertiesChangeEvent} evt
     * @private
     */
    IFEditor.prototype._beforePropertiesChange = function (evt) {
        // If we have an active transaction, we need to record the action
        if (this._transactionStack.length) {
            var node = evt.node;
            var properties = evt.properties;
            var values = evt.values;
            var oldValues = [];
            for (var i = 0; i < evt.properties.length; ++i) {
                oldValues.push(node.getProperty(evt.properties[i]));
            }

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
     * @param {IFNode.BeforeFlagChangeEvent} evt
     * @private
     */
    IFEditor.prototype._beforeFlagChange = function (evt) {
        if (evt.node instanceof IFElement) {
            if (evt.flag === IFElement.Flag.Hidden) {
                if (evt.set) {
                    // Deselect elements getting hidden
                    evt.node.removeFlag(IFNode.Flag.Selected);
                }
            }
        }
    };

    /**
     * @param {IFNode.AfterFlagChangeEvent} evt
     * @private
     */
    IFEditor.prototype._afterFlagChange = function (evt) {
        if (evt.node instanceof IFElement) {
            if (evt.flag === IFNode.Flag.Selected) {
                if (evt.set) {
                    // Try to add node to the internal selection
                    this._tryAddToSelection(evt.node);
                } else {
                    // Try to remove node from the internal selection
                    this._tryRemoveFromSelection(evt.node);
                }
            } else if (evt.flag == IFNode.Flag.Highlighted) {
                if (evt.set) {
                    var editor = IFElementEditor.openEditor(evt.node);
                    if (editor) {
                        editor.setFlag(IFElementEditor.Flag.Highlighted);
                    }
                } else {
                    var editor = IFElementEditor.openEditor(evt.node);
                    if (editor) {
                        editor.removeFlag(IFElementEditor.Flag.Highlighted);
                    }
                    this._tryCloseEditor(evt.node);
                }
            } else if (evt.flag == IFNode.Flag.Active) {
                // In single page mode we'll save & restore page selections
                if (evt.node instanceof IFPage && this._scene.getProperty('singlePage') === true) {
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
     * @param {IFElement.GeometryChangeEvent} evt
     * @private
     */
    IFEditor.prototype._geometryChange = function (evt) {
        if (this._selection && this._selection.indexOf(evt.element) >= 0) {
            switch (evt.type) {
                case IFElement.GeometryChangeEvent.Type.Before:
                case IFElement.GeometryChangeEvent.Type.After:
                case IFElement.GeometryChangeEvent.Type.Child:
                    var editor = IFElementEditor.getEditor(evt.element);
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
    IFEditor.prototype._beginSelectionUpdate = function () {
        this._selectionUpdateCounter += 1;
    };

    /**
     * @private
     */
    IFEditor.prototype._finishSelectionUpdate = function () {
        if (--this._selectionUpdateCounter === 0) {
            this._updatedSelection();
        }
    };

    /**
     * @private
     */
    IFEditor.prototype._updatedSelection = function () {
        if (this._selectionUpdateCounter === 0) {
            // Clear last clone selection
            this._lastCloneSelection = null;

            // Trigger selection change event
            if (this.hasEventListeners(IFEditor.SelectionChangedEvent)) {
                this.trigger(IFEditor.SELECTION_CHANGED_EVENT);
            }
        }
    };

    /**
     * Try to add a node to internal selection if it is selected
     * @param {IFNode} node
     * @private
     */
    IFEditor.prototype._tryAddToSelection = function (node) {
        if (node instanceof IFElement) {
            if (node.hasFlag(IFNode.Flag.Selected)) {
                // Try to open an editor for the selected node
                var editor = IFElementEditor.openEditor(node);
                if (editor) {
                    editor.setFlag(IFElementEditor.Flag.Selected);

                    if (this._selectionDetail) {
                        editor.setFlag(IFElementEditor.Flag.Detail);
                    }
                }

                // Always add the node to our internal selection array
                if (!this._selection) {
                    this._selection = [];
                }
                this._selection.push(node);

                this._updatedSelection();
            }
        }
    };

    /**
     * Try to remove a node from the internal selection
     * @param {IFNode} node
     * @private
     */
    IFEditor.prototype._tryRemoveFromSelection = function (node) {
        if (node instanceof IFElement) {
            // Close the editor for the previously selected node if it has any
            var editor = IFElementEditor.getEditor(node);
            if (editor && editor.hasFlag(IFElementEditor.Flag.Selected)) {
                editor.removeFlag(IFElementEditor.Flag.Selected);
                this._tryCloseEditor(node);
            }

            // Always remove the node from our selection array if we find it
            if (this._selection) {
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
    };

    IFEditor.prototype._tryCloseEditor = function (node) {
        var editor = IFElementEditor.getEditor(node);
        if (!editor || editor.hasFlag(IFElementEditor.Flag.Selected) || editor.hasFlag(IFElementEditor.Flag.Highlighted)) {
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

    IFEditor.prototype._finishEditorInlineEdit = function (node) {
        var editor = IFElementEditor.getEditor(node);
        if (editor && editor.isInlineEdit()) {
            if (this.hasEventListeners(IFEditor.InlineEditorEvent)) {
                this.trigger(new IFEditor.InlineEditorEvent(editor, IFEditor.InlineEditorEvent.Type.BeforeClose));
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

            if (this.hasEventListeners(IFEditor.InlineEditorEvent)) {
                this.trigger(new IFEditor.InlineEditorEvent(editor, IFEditor.InlineEditorEvent.Type.AfterClose));
            }

            return true;
        }
        return false;
    };

    IFEditor.prototype._closeEditor = function (node) {
        this._finishEditorInlineEdit(node);
        IFElementEditor.closeEditor(node);
    };

    /**
     * Save the selection for a given page
     * @param {IFPage} page
     * @param {Boolean} [noOverwrite] if set, won't overwrite
     * the saved selection for the page on page change
     * @param {Boolean} [checkOverwrite] if set, will not store
     * the page selection if it has the noOverwrite flag set to true
     * @private
     */
    IFEditor.prototype._savePageSelection = function (page, noOverwrite, checkOverwrite) {
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
     * @param {IFPage} page
     * @private
     */
    IFEditor.prototype._restorePageSelection = function (page) {
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
     * @param {IFPage} page
     * @private
     */
    IFEditor.prototype._removePageSelection = function (page) {
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
     * @return {Array<{element: IFElement, parts: Array<*>}>}
     * @private
     */
    IFEditor.prototype._saveSelection = function () {
        if (!this._selection || this._selection.length === 0) {
            return null;
        }

        var result = [];
        for (var i = 0; i < this._selection.length; ++i) {
            var element = this._selection[i];
            var editor = IFElementEditor.getEditor(element);
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
     * @param {Array<{element: IFElement, parts: Array<*>}>} selection
     * @private
     */
    IFEditor.prototype._loadSelection = function (selection) {
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
                    var editor = IFElementEditor.getEditor(selection[i].element);
                    if (editor) {
                        editor.updatePartSelection(false, selection[i].parts);
                    }
                }
            }
        }
    };

    /** @override */
    IFEditor.prototype.toString = function () {
        return "[Object IFEditor]";
    };

    _.IFEditor = IFEditor;
})(this);