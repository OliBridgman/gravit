(function (_) {
    /**
     * A graphic editor keeps track of all editing related stuff for a scene
     * like handling selection, keeping undo/redo information and more.
     * @param {GXScene} scene the scene this editor works on
     * @class GXEditor
     * @extend GEventTarget
     * @constructor
     */
    function GXEditor(scene) {
        this._scene = scene;
        this._scene.__graphic_editor__ = this;
        this._undoStates = [];
        this._redoStates = [];
        this._guides = new GXGuides(this._scene);

        // Subscribe to various scene changes
        this._scene.addEventListener(GXNode.AfterInsertEvent, this._afterNodeInsert, this);
        this._scene.addEventListener(GXNode.BeforeRemoveEvent, this._beforeNodeRemove, this);
        this._scene.addEventListener(GXNode.BeforePropertiesChangeEvent, this._beforePropertiesChange, this);
        this._scene.addEventListener(GXNode.BeforeFlagChangeEvent, this._beforeFlagChange, this);
        this._scene.addEventListener(GXNode.AfterFlagChangeEvent, this._afterFlagChange, this);
        this._scene.addEventListener(GXElement.GeometryChangeEvent, this._geometryChange, this);

        // Try to create internal selection for all selected nodes
        var selectedNodes = this._scene.queryAll(":selected");
        if (selectedNodes && selectedNodes.length) {
            for (var i = 0; i < selectedNodes.length; ++i) {
                this._tryAddToSelection(selectedNodes[i]);
            }
        }

        // Mark first found page on scene as current if there's any
        var firstPage = this._scene.querySingle('page');
        if (firstPage) {
            this.setCurrentPage(firstPage);
        }

        this._currentColor = [new GXColor(GXColor.Type.Black), null];
    };
    GObject.inherit(GXEditor, GEventTarget);

    GXEditor.options = {
        /** Maximum number of undo-steps */
        maxUndoSteps: 10
    };

    /**
     * Current Color Type
     * @enum
     */
    GXEditor.CurrentColorType = {
        Stroke: 0,
        Fill: 1
    };

    /**
     * Get the underlying graphic editor for a given scene
     * @param {GXScene} scene
     * @returns {GXEditor} a graphic editor for the scene
     * or null if it has no such one
     */
    GXEditor.getEditor = function (scene) {
        return scene.__graphic_editor__ ? scene.__graphic_editor__ : null;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXEditor.CurrentLayerChangedEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever the current layer has been changed
     * @class GXEditor.CurrentLayerChangedEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GXEditor.CurrentLayerChangedEvent = function (previousLayer) {
        this.previousLayer = previousLayer;
    };
    GObject.inherit(GXEditor.CurrentLayerChangedEvent, GEvent);

    /** @type {GXLayer} */
    GXEditor.CurrentLayerChangedEvent.prototype.previousLayer = null;

    /** @override */
    GXEditor.CurrentLayerChangedEvent.prototype.toString = function () {
        return "[Event GXEditor.CurrentLayerChangedEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXEditor.CurrentPageChangedEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever the current page has been changed
     * @class GXEditor.CurrentPageChangedEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GXEditor.CurrentPageChangedEvent = function (previousPage) {
        this.previousPage = previousPage;
    };
    GObject.inherit(GXEditor.CurrentPageChangedEvent, GEvent);

    /** @type {GXPage} */
    GXEditor.CurrentPageChangedEvent.prototype.previousPage = null;

    /** @override */
    GXEditor.CurrentPageChangedEvent.prototype.toString = function () {
        return "[Event GXEditor.CurrentPageChangedEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXEditor.CurrentColorChangedEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever a current color has been changed
     * @class GXEditor.CurrentColorChangedEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GXEditor.CurrentColorChangedEvent = function (type, previousColor) {
        this.type = type;
        this.previousColor = previousColor;
    };
    GObject.inherit(GXEditor.CurrentColorChangedEvent, GEvent);

    /** @type {GXEditor.CurrentColorType} */
    GXEditor.CurrentColorChangedEvent.prototype.type = null;

    /** @type {GXColor} */
    GXEditor.CurrentColorChangedEvent.prototype.previousColor = null;

    /** @override */
    GXEditor.CurrentColorChangedEvent.prototype.toString = function () {
        return "[Event GXEditor.CurrentColorChangedEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXEditor.SelectionChangedEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever the selection has been changed
     * @class GXEditor.SelectionChangedEvent
     * @extends GEvent
     * @constructor
     */
    GXEditor.SelectionChangedEvent = function () {
    };
    GObject.inherit(GXEditor.SelectionChangedEvent, GEvent);

    /** @override */
    GXEditor.SelectionChangedEvent.prototype.toString = function () {
        return "[Event GXEditor.SelectionChangedEvent]";
    };

    GXEditor.SELECTION_CHANGED_EVENT = new GXEditor.SelectionChangedEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GXEditor.InvalidationRequestEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for an invalidation request event
     * @param {GXElementEditor} editor the requesting editor
     * @param {*} [args] optional arguments to be passed back to editor
     * @class GXEditor.InvalidationRequestEvent
     * @extends GEvent
     * @constructor
     */
    GXEditor.InvalidationRequestEvent = function (editor, args) {
        this.editor = editor;
        this.args = args;
    };
    GObject.inherit(GXEditor.InvalidationRequestEvent, GEvent);

    /** @type {GXElementEditor} */
    GXEditor.InvalidationRequestEvent.prototype.editor = null;
    /** @type {*} */
    GXEditor.InvalidationRequestEvent.prototype.args = null;

    /** @override */
    GXEditor.InvalidationRequestEvent.prototype.toString = function () {
        return "[Event GXEditor.InvalidationRequestEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXEditor Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {GXScene}
     * @private
     */
    GXEditor.prototype._scene = null;

    /**
     * @type {Array<GXElement>}
     * @private
     */
    GXEditor.prototype._selection = null;

    /**
     * @type {boolean}
     * @private
     */
    GXEditor.prototype._selectionDetail = false;

    /**
     * @type {{actions: Array<{action: Function, revert: Function}>, selection: Array<{element: GXElement, parts: Array<*>}>}}
     * @private
     */
    GXEditor.prototype._transaction = null;

    /**
     * @type {Array<*>}
     * @private
     */
    GXEditor.prototype._undoStates = null;

    /**
     * @type {Array<*>}
     * @private
     */
    GXEditor.prototype._redoStates = null;

    /**
     * @type {GXGuides}
     * @private
     */
    GXEditor.prototype._guides = null;

    /**
     * @type {GXPage}
     * @private
     */
    GXEditor.prototype._currentPage = null;

    /**
     * @type {GXLayer}
     * @private
     */
    GXEditor.prototype._currentLayer = null;

    /**
     * @type {Array<GXColor>}
     * @private
     */
    GXEditor.prototype._currentColor = null;

    /**
     * @returns {GXScene}
     */
    GXEditor.prototype.getScene = function () {
        return this._scene;
    };

    /**
     * Return whether any selection is available or not
     * @return {Boolean} true if a selection is available, false if not
     * @version 1.0
     */
    GXEditor.prototype.hasSelection = function () {
        return this._selection && this._selection.length > 0;
    };

    /**
     * Return the selection array
     * @return {Array<GXElement>} the selection array or null for no selection
     * @version 1.0
     */
    GXEditor.prototype.getSelection = function () {
        return this._selection;
    };

    /**
     * Returns whether selection details are available or not
     * @returns {boolean}
     */
    GXEditor.prototype.hasSelectionDetail = function () {
        return this._selectionDetail;
    };

    /**
     * Assigns whether selection details are available or not
     * @param {Boolean} detail
     */
    GXEditor.prototype.setSelectionDetail = function (detail) {
        if (detail !== this._selectionDetail) {
            this._selectionDetail = detail;

            // Re-flag selection if any
            if (this._selection) {
                for (var i = 0; i < this._selection.length; ++i) {
                    var editor = GXElementEditor.getEditor(this._selection[i]);
                    if (editor) {
                        if (this._selectionDetail) {
                            editor.setFlag(GXElementEditor.Flag.Detail);
                        } else {
                            editor.removeFlag(GXElementEditor.Flag.Detail);
                        }
                    }
                }
            }
        }
    };

    /**
     * Return the editor's guides
     * @returns {GXGuides}
     */
    GXEditor.prototype.getGuides = function () {
        return this._guides;
    };

    /**
     * Return the currently active page if any
     * @return {GXPage}
     */
    GXEditor.prototype.getCurrentPage = function () {
        return this._currentPage;
    };

    /**
     * Set the currently active page
     * @param {GXPage} page
     */
    GXEditor.prototype.setCurrentPage = function (page) {
        if (page !== this._currentPage) {
            if (this._currentPage) {
                this._currentPage.removeFlag(GXNode.Flag.Active);
            }

            var previousPage = this._currentPage;
            this._currentPage = page;

            if (this._currentPage) {
                this._currentPage.setFlag(GXNode.Flag.Active);
            }

            if (this.hasEventListeners(GXEditor.CurrentPageChangedEvent)) {
                this.trigger(new GXEditor.CurrentPageChangedEvent(previousPage));
            }
        }
    };

    /**
     * Return the currently active layer if any
     * @return {GXLayer}
     */
    GXEditor.prototype.getCurrentLayer = function () {
        return this._currentLayer;
    };

    /**
     * Set the currently active layer and moves the current
     * selection into the new current layer
     *
     * @param {GXLayer} layer
     */
    GXEditor.prototype.setCurrentLayer = function (layer) {
        if (layer !== this._currentLayer) {
            var previousLayer = this._currentLayer;

            this._currentLayer = layer;

            if (this._selection && this._currentLayer) {
                // Transfer all selected elements to the new layer if
                // they've resisted on the previous layer
                // TODO : Undo Group

                // Save selection in the order of the model
                var modelSelection = this._scene.queryAll(':selected');

                // Clear our internal selection
                this.clearSelection();

                // Transfer the selection to the new layer
                for (var i = 0; i < modelSelection.length; ++i) {
                    var selNode = modelSelection[i];
                    selNode.getParent().removeChild(selNode);
                    this._currentLayer.appendChild(selNode);
                }

                // Finally re-select again
                this.updateSelection(false, modelSelection);
            }

            if (this.hasEventListeners(GXEditor.CurrentLayerChangedEvent)) {
                this.trigger(new GXEditor.CurrentLayerChangedEvent(previousLayer));
            }
        }
    };

    /**
     * Get a current color for a given type
     * @param {GXEditor.CurrentColorType} type
     */
    GXEditor.prototype.getCurrentColor = function (type) {
        return this._currentColor[type];
    };

    /**
     * Set a current color for a given type
     * @param {GXEditor.CurrentColorType} type
     * @param {GXColor} color
     */
    GXEditor.prototype.setCurrentColor = function (type, color) {
        if (!GXColor.equals(color, this._currentColor[type])) {
            var oldColor = this._currentColor[type];

            // Assign new color
            this._currentColor[type] = color;

            // Trigger event
            if (this.hasEventListeners(GXEditor.CurrentColorChangedEvent)) {
                this.trigger(new GXEditor.CurrentColorChangedEvent(type, oldColor));
            }
        }
    };

    /**
     * Returns a reference to the selected path, if it is the only one selected,
     * or null otherwise
     * @return {GXPath} the selected path
     */
    GXEditor.prototype.getPathSelection = function () {
        var pathRef = null;
        var i;

        if (this.hasSelection()) {
            for (i = 0; i < this._selection.length; ++i) {
                if (this._selection[i] instanceof GXPath) {
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
     * Called to close and detach this editor
     */
    GXEditor.prototype.close = function () {
        delete this._scene.__graphic_editor__;

        this._scene.removeEventListener(GXNode.AfterInsertEvent, this._afterNodeInsert);
        this._scene.removeEventListener(GXNode.BeforeRemoveEvent, this._beforeNodeRemove);
        this._scene.removeEventListener(GXNode.BeforePropertiesChangeEvent, this._beforePropertiesChange);
        this._scene.removeEventListener(GXNode.BeforeFlagChangeEvent, this._beforeFlagChange);
        this._scene.removeEventListener(GXNode.AfterFlagChangeEvent, this._afterFlagChange);
        this._scene.removeEventListener(GXElement.GeometryChangeEvent, this._geometryChange);
    };

    /**
     * Request the invalidation of an editor
     * @param {GXElementEditor} editor the requesting editor
     * @param {*} [args] optional arguments to be passed back to the editor
     */
    GXEditor.prototype.requestInvalidation = function (editor, args) {
        if (this.hasEventListeners(GXEditor.InvalidationRequestEvent)) {
            this.trigger(new GXEditor.InvalidationRequestEvent(editor, args));
        }
    };

    /**
     * Clone current selection (if any) and make it the new selection
     * @param {Boolean} [noTransaction] if true, will not create a
     * transaction (undo/redo), defaults to false
     * @return {Array<GXElement>} the array of clones or null for no clones
     */
    GXEditor.prototype.cloneSelection = function (noTransaction) {
        if (this._selection && this._selection.length > 0) {
            if (!noTransaction) {
                this.beginTransaction();
            }

            try {
                var clonedSelection = [];

                for (var i = 0; i < this._selection.length; ++i) {
                    var selElement = this._selection[i];
                    if (selElement.hasMixin(GXNode.Store)) {
                        var clone = selElement.clone();
                        if (clone) {
                            // Append clone to parent of selected item
                            this._selection[i].getParent().appendChild(clone);

                            // Add clone to new selection
                            clonedSelection.push(clone);
                        }
                    }
                }

                // Update current selection if any
                if (clonedSelection.length > 0) {
                    this.updateSelection(false, clonedSelection);
                    return clonedSelection;
                }
            } finally {
                if (!noTransaction) {
                    // TODO : I18N
                    this.commitTransaction('Clone Selection');
                }
            }
        }
        return null;
    };

    /**
     * Delete current selection (if any)
     * @param {Boolean} [noTransaction] if true, will not create a
     * transaction (undo/redo), defaults to false
     */
    GXEditor.prototype.deleteSelection = function (noTransaction) {
        if (this._selection && this._selection.length > 0) {
            if (!noTransaction) {
                this.beginTransaction();
            }

            try {
                var orderedSelection = GXNode.order(this._selection, true);
                for (var i = 0; i < orderedSelection.length; ++i) {
                    var selElement = orderedSelection[0];
                    selElement.getParent().removeChild(selElement);
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
     * @param {Array<GXElement>} selection the new array of nodes to be selected
     */
    GXEditor.prototype.updateSelection = function (toggle, selection) {
        if (!toggle) {
            // Select new selection if any
            if (selection && selection.length > 0) {
                for (var i = 0; i < selection.length; ++i) {
                    selection[i].setFlag(GXNode.Flag.Selected);
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
                    if (selection[i].hasFlag(GXNode.Flag.Selected)) {
                        selection[i].removeFlag(GXNode.Flag.Selected);
                    } else {
                        selection[i].setFlag(GXNode.Flag.Selected);
                    }
                }
            }
        }
    };

    /**
     * Clears the whole selection if any
     * @param {Array<GXElement>} [exclusion] an array to exclude from removing
     * from the selection or null for none
     */
    GXEditor.prototype.clearSelection = function (exclusion) {
        var index = 0;
        while (this._selection && index < this._selection.length) {
            if (exclusion && exclusion.indexOf(this._selection[index]) >= 0) {
                index++;
                continue;
            }
            this._selection[index].removeFlag(GXNode.Flag.Selected);
        }
    };

    /**
     * Move the selection
     * @param {GPoint} delta the move delta
     * @param {Boolean} align whether to automatically align or not
     * @param {*} [partId] optional id of part that has started the transformation
     * @param {*} [data] optional data of part that has started the transformation
     */
    GXEditor.prototype.moveSelection = function (delta, align, partId, partData) {
        if (align) {
            var selBBox = this._getSelectionBBox(false);

            var transBBox = selBBox.translated(delta.getX(), delta.getY());
            this._guides.beginMap();
            var tl = this._guides.mapPoint(transBBox.getSide(GRect.Side.TOP_LEFT));
            delta = tl.subtract(selBBox.getSide(GRect.Side.TOP_LEFT));
        }

        this.transformSelection(new GTransform(1, 0, 0, 1, delta.getX(), delta.getY()), partId, partData);
        if (align) {
            this._guides.finishMap();
        }
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
    GXEditor.prototype.scaleSelection = function (sx, sy, dx, dy, align, partId, partData) {
        var selBBox = this._getSelectionBBox(false);
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
    GXEditor.prototype.transformSelection = function (transform, partId, partData) {
        if (this._selection && this._selection.length) {
            for (var i = 0; i < this._selection.length; ++i) {
                var item = this._selection[i];
                var editor = GXElementEditor.getEditor(item);
                if (editor) {
                    editor.transform(transform, partId, partData);
                }
            }
        }
    };

    /**
     * Reset the transformation of the selection
     */
    GXEditor.prototype.resetSelectionTransform = function () {
        if (this._selection && this._selection.length) {
            for (var i = 0; i < this._selection.length; ++i) {
                var item = this._selection[i];
                var editor = GXElementEditor.getEditor(item);
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
    GXEditor.prototype.applySelectionTransform = function (cloneSelection, noTransaction) {
        if (this._selection && this._selection.length) {
            // Filter selection by editors that can not be transformed
            // and reset those instead here
            var newSelection = [];
            for (var i = 0; i < this._selection.length; ++i) {
                var item = this._selection[i];
                var editor = GXElementEditor.getEditor(item);
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
                        var editor = GXElementEditor.getEditor(item);
                        if (editor) {
                            var selectionElement = newSelection[i];
                            var elementToApplyTransform = selectionElement;

                            if (cloneSelection) {
                                if (selectionElement.hasMixin(GXNode.Store)) {
                                    elementToApplyTransform = selectionElement.clone();

                                    // Append clone to parent of selected item
                                    selectionElement.getParent().appendChild(elementToApplyTransform);

                                    // Push clone into new selection
                                    clonedSelection.push(elementToApplyTransform);
                                } else {
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
                    if (this._transformBox) {
                        this.updateSelectionTransformBox();
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

    GXEditor.prototype.updateSelectionTransformBox = function () {
        this._transformBox = null;
        if (this.getSelection()) {
            var selBBox = this._getSelectionBBox(false);
            if (selBBox) {
                this._transformBox = new GXTransformBox(selBBox);
            }
        }
    };

    GXEditor.prototype.getTransformBox = function () {
        return this._transformBox;
    };

    GXEditor.prototype.cleanTransformBox = function () {
        this._transformBox = null;
    };

    /**
     * Inserts one or more elements into the right target parent
     * and selects the elements clearing any previous selection
     * This is a shortcut for insertElements([element])
     * @param {Array<GXElement>} elements the elements to be inserted
     * @param {Boolean} noEditor if true, the editor will not be
     * called to handle the newly inserted element. Defaults to false.
     * @param {Boolean} [noTransaction] if true, will not create a
     * transaction (undo/redo), defaults to false
     */
    GXEditor.prototype.insertElements = function (elements, noEditor, noTransaction) {
        // Our target is always the currently active layer
        var target = this.getCurrentPage();// this.getCurrentLayer();

        if (!noTransaction) {
            this.beginTransaction();
        }

        var fillColor = this._currentColor[GXEditor.CurrentColorType.Fill];
        var strokeColor = this._currentColor[GXEditor.CurrentColorType.Stroke];

        try {
            for (var i = 0; i < elements.length; ++i) {
                var element = elements[i];

                // Append new element
                target.appendChild(element);

                if (!noEditor) {
                    // Create a temporary editor for the element to handle it's insertion
                    var editor = GXElementEditor.createEditor(element);
                    if (editor) {
                        editor.handleInsert(fillColor, strokeColor);
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
     * example the currently active page
     * @param {GPoint} position the mouse position
     * @param {GTransform} transform optional transformation for the position
     */
    GXEditor.prototype.updateByMousePosition = function (position, transformation) {
        // TODO : Make this more efficient than hit-testing everything (aka iterate pages instead)
        // Try to update the active page under mouse if any
        var pageHits = this._scene.hitTest(position, transformation, function (hit) {
            return hit instanceof GXPage;
        }.bind(this), false, 1/*one level deep only*/);

        if (pageHits && pageHits.length === 1) {
            this.setCurrentPage(pageHits[0].element);
        }
    };

    /**
     * Begin a new transaction. This will catch all structural
     * modifications including property changes to be replayed
     * as undo / redo states.
     */
    GXEditor.prototype.beginTransaction = function () {
        if (this._transaction) {
            throw new Error('There already is an active transaction.');
        }

        if (!this._transaction) {
            this._transaction = {
                actions: [],
                selection: this._saveSelection(),
                tBox: this._transformBox
            }
        }
    };

    /**
     * Commit the current transaction. If the transaction doesn't
     * include any changes, no undo/redo state will be committed.
     * @param {String} name
     */
    GXEditor.prototype.commitTransaction = function (name) {
        if (!this._transaction) {
            throw new Error('No active transaction to be committed.');
        }

        if (this._transaction.actions.length > 0) {
            var transaction = this._transaction;
            var actions = transaction.actions.slice();
            var selection = transaction.selection ? transaction.selection.slice() : null;
            var tBox = transaction.tBox;
            var newSelection = this._saveSelection();
            var newtBox = this._transformBox;

            // push a new state
            var action = function () {
                for (var i = 0; i < actions.length; ++i) {
                    actions[i].action();
                }
                this._loadSelection(newSelection);
                if (newtBox || this._transformBox != newtBox) {
                    this._transformBox = newtBox;
                    if (newtBox) {
                        this.updateSelectionTransformBox();
                    }
                    gApp.getToolManager().getActiveTool().invalidateArea();
                }
            }.bind(this);

            var revert = function () {
                // Revert needs to play the actions backwards
                for (var i = actions.length - 1; i >= 0; --i) {
                    actions[i].revert();
                }
                this._loadSelection(selection);
                if (tBox || this._transformBox != tBox) {
                    this._transformBox = tBox;
                    if (tBox) {
                        this.updateSelectionTransformBox();
                    }
                    gApp.getToolManager().getActiveTool().invalidateArea();
                }
            }.bind(this);

            this.pushState(action, revert, name);
        }

        this._transaction = null;
    };

    /**
     * Manually push an undo state action
     * @param {Function} action the action to be executed when executing ("redo")
     * @param {Function} revert the action to be executed when undoing
     * @param {String} name a name for the state
     */
    GXEditor.prototype.pushState = function (action, revert, name) {
        if (this._undoStates.length >= GXEditor.options.maxUndoSteps) {
            // Cut undo list of when reaching our undo limit
            this._undoStates.shift();
        }

        this._undoStates.push({
            action: action,
            revert: revert,
            name: name ? name : ""
        });

        // Push a new undo state has to clear out all the redo steps
        this._redoStates = [];
    };

    /**
     * Returns whether at least one undo state is available or not
     * @returns {boolean}
     */
    GXEditor.prototype.hasUndoState = function () {
        return this._undoStates.length > 0;
    };

    /**
     * Returns whether at least one redo state is available or not
     * @returns {boolean}
     */
    GXEditor.prototype.hasRedoState = function () {
        return this._redoStates.length > 0;
    };

    /**
     * Returns the name of the last undo state if any or null for none
     * @returns {String}
     */
    GXEditor.prototype.getUndoStateName = function () {
        if (this._undoStates.length > 0) {
            return this._undoStates[this._undoStates.length - 1].name;
        }
        return null;
    };

    /**
     * Returns the name of the last redo state if any or null for none
     * @returns {String}
     */
    GXEditor.prototype.getRedoStateName = function () {
        if (this._redoStates.length > 0) {
            return this._redoStates[this._redoStates.length - 1].name;
        }
        return null;
    };

    /**
     * Undo the latest state if any
     */
    GXEditor.prototype.undoState = function () {
        if (this._undoStates.length > 0) {
            // Get state and shift it from undo list
            var state = this._undoStates.pop();

            // Move state into redo list
            this._redoStates.push(state);

            // Execute revert action of the state
            state.revert();
        }
    };

    /**
     * Redo the latest state if any
     */
    GXEditor.prototype.redoState = function () {
        if (this._redoStates.length > 0) {
            // Get state and shift it from redo list
            var state = this._redoStates.pop();

            // Move state into undo list
            this._undoStates.push(state);

            // Execute action of the state
            state.action();
        }
    };

    /**
     * @param {GXNode.AfterInsertEvent} evt
     * @private
     */
    GXEditor.prototype._afterNodeInsert = function (evt) {
        // If we have an active transaction, we need to record the action
        if (this._transaction) {
            var node = evt.node;
            var parent = node.getParent();
            var next = node.getNext();

            this._transaction.actions.push({
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

        // If page and we don't have a current one yet, mark it active now
        if (evt.node instanceof GXPage && !this._currentPage) {
            this.setCurrentPage(evt.node);
        }
    };

    /**
     * @param {GXNode.BeforeRemoveEvent} evt
     * @private
     */
    GXEditor.prototype._beforeNodeRemove = function (evt) {
        // If we have an active transaction, we need to record the action
        if (this._transaction) {
            var node = evt.node;
            var parent = node.getParent();
            var next = node.getNext();

            this._transaction.actions.push({
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

        if (evt.node instanceof GXElement) {
            // If element is in selection, unselect it, first
            if (this._selection && this._selection.indexOf(evt.node) >= 0) {
                evt.node.removeFlag(GXNode.Flag.Selected);
            } else {
                // Otherwise ry to close any editors the node may have
                GXElementEditor.closeEditor(evt.node);
            }
        }

        // Handle removing the current page or layer
        // by activating another one
        if (this._currentPage && evt.node === this._currentPage) {
            // Get a flat list of pages and select next/previous one
            var allPages = this._scene.queryAll('page');
            var pageIndex = allPages.indexOf(evt.node);
            if (pageIndex > 0) {
                this.setCurrentPage(allPages[pageIndex - 1]);
            } else if (pageIndex + 1 < allPages.length) {
                this.setCurrentPage(allPages[pageIndex + 1]);
            } else {
                throw new Error('Unexpected: No page available.');
            }
        }
    };

    /**
     * @param {GXNode.BeforePropertiesChangeEvent} evt
     * @private
     */
    GXEditor.prototype._beforePropertiesChange = function (evt) {
        // If we have an active transaction, we need to record the action
        if (this._transaction) {
            var node = evt.node;
            var properties = evt.properties;
            var values = evt.values;
            var oldValues = [];
            for (var i = 0; i < evt.properties.length; ++i) {
                oldValues.push(node.getProperty(evt.properties[i]));
            }

            this._transaction.actions.push({
                action: function () {
                    // Simply assign the property values
                    node.setProperties(properties, values);
                },

                revert: function () {
                    // Simply assign the previous property values
                    node.setProperties(properties, oldValues);
                }
            });
        }
        ;
    };

    /**
     * @param {GXNode.BeforeFlagChangeEvent} evt
     * @private
     */
    GXEditor.prototype._beforeFlagChange = function (evt) {
        if (evt.node instanceof GXElement) {
            if (evt.flag === GXElement.Flag.Hidden) {
                if (evt.set) {
                    // Deselect elements getting hidden
                    evt.node.removeFlag(GXNode.Flag.Selected);
                }
            }
        }
    };

    /**
     * @param {GXNode.AfterFlagChangeEvent} evt
     * @private
     */
    GXEditor.prototype._afterFlagChange = function (evt) {
        if (evt.node instanceof GXElement) {
            if (evt.flag === GXNode.Flag.Selected) {
                if (evt.set) {
                    // Try to add node to the internal selection
                    this._tryAddToSelection(evt.node);
                } else {
                    // Try to remove node from the internal selection
                    this._tryRemoveFromSelection(evt.node);
                }
            } else if (evt.flag == GXNode.Flag.Highlighted) {
                if (evt.set) {
                    var editor = GXElementEditor.openEditor(evt.node);
                    if (editor) {
                        editor.setFlag(GXElementEditor.Flag.Highlighted);
                    }
                } else {
                    var editor = GXElementEditor.openEditor(evt.node);
                    if (editor) {
                        editor.removeFlag(GXElementEditor.Flag.Highlighted);
                    }
                    this._tryCloseEditor(evt.node);
                }
            }
        }
    };

    /**
     * @param {GXElement.GeometryChangeEvent} evt
     * @private
     */
    GXEditor.prototype._geometryChange = function (evt) {
        if (this._selection && this._selection.indexOf(evt.element) >= 0) {
            switch (evt.type) {
                case GXElement.GeometryChangeEvent.Type.Before:
                case GXElement.GeometryChangeEvent.Type.After:
                case GXElement.GeometryChangeEvent.Type.Child:
                    var editor = GXElementEditor.getEditor(evt.element);
                    if (editor) {
                        editor.requestInvalidation();
                    }
                    break;
            }
        }
    };

    /**
     * Try to add a node to internal selection if it is selected
     * @param {GXNode} node
     * @private
     */
    GXEditor.prototype._tryAddToSelection = function (node) {
        if (node instanceof GXElement) {
            if (node.hasFlag(GXNode.Flag.Selected)) {
                // Try to open an editor for the selected node
                var editor = GXElementEditor.openEditor(node);
                if (editor) {
                    editor.setFlag(GXElementEditor.Flag.Selected);

                    if (this._selectionDetail) {
                        editor.setFlag(GXElementEditor.Flag.Detail);
                    }
                }

                // Always add the node to our internal selection array
                if (!this._selection) {
                    this._selection = [];
                }
                this._selection.push(node);

                // Trigger selection change event
                if (this.hasEventListeners(GXEditor.SelectionChangedEvent)) {
                    this.trigger(GXEditor.SELECTION_CHANGED_EVENT);
                }

                // Mark containing layer active if any
                if (node.getParent() instanceof GXLayer) {
                    node.getParent().setFlag(GXNode.Flag.Active);
                }
            }
        }
    };

    /**
     * Try to remove a node from the internal selection
     * @param {GXNode} node
     * @private
     */
    GXEditor.prototype._tryRemoveFromSelection = function (node) {
        if (node instanceof GXElement) {
            // Close the editor for the previously selected node if it has any
            var editor = GXElementEditor.getEditor(node);
            if (editor && editor.hasFlag(GXElementEditor.Flag.Selected)) {
                editor.removeFlag(GXElementEditor.Flag.Selected);
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

                // Trigger selection change event
                if (this.hasEventListeners(GXEditor.SelectionChangedEvent)) {
                    this.trigger(GXEditor.SELECTION_CHANGED_EVENT);
                }

                // Deactivate parent if layer and no other selected
                // item has had the same parent
                if (node.getParent() instanceof GXLayer && !sameParentInSelection) {
                    node.getParent().removeFlag(GXNode.Flag.Active);
                }
            }
        } else if (node instanceof GXNode && node.hasFlag(GXNode.Flag.Selected)) {
            // Trigger selection change event
            if (this.hasEventListeners(GXEditor.SelectionChangedEvent)) {
                this.trigger(GXEditor.SELECTION_CHANGED_EVENT);
            }
        }
    };

    GXEditor.prototype._tryCloseEditor = function (node) {
        var editor = GXElementEditor.getEditor(node);
        if (!editor || editor.hasFlag(GXElementEditor.Flag.Selected) || editor.hasFlag(GXElementEditor.Flag.Highlighted)) {
            // can not close editor in this case(s)
            return;
        }

        // Only close editor if it doesn't have any children
        if (editor.getEditors() == null || editor.getEditors().length == 0) {
            // Save our parent editor
            var parentEditor = editor.getParentEditor();

            // Close our editor now
            GXElementEditor.closeEditor(node);

            // If we have a parent editor, try to close it recursively as well
            if (parentEditor) {
                this._tryCloseEditor(parentEditor.getElement());
            }
        }
    };

    /**
     * Saves and returns the current selection
     * @return {Array<{element: GXElement, parts: Array<*>}>}
     * @private
     */
    GXEditor.prototype._saveSelection = function () {
        if (!this._selection || this._selection.length === 0) {
            return null;
        }

        var result = [];
        for (var i = 0; i < this._selection.length; ++i) {
            var element = this._selection[i];
            var editor = GXElementEditor.getEditor(element);
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
     * @param {Array<{element: GXElement, parts: Array<*>}>} selection
     * @private
     */
    GXEditor.prototype._loadSelection = function (selection) {
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
                    var editor = GXElementEditor.getEditor(selection[i].element);
                    if (editor) {
                        editor.updatePartSelection(false, selection[i].parts);
                    }
                }
            }
        }
    };

    GXEditor.prototype._getSelectionBBox = function (paintBBox) {
        var selBBox = null;
        if (this.getSelection()) {
            for (var i = 0; i < this.getSelection().length; ++i) {
                var bbox = paintBBox ? this.getSelection()[i].getPaintBBox() : this.getSelection()[i].getGeometryBBox();
                if (bbox && !bbox.isEmpty()) {
                    selBBox = selBBox ? selBBox.united(bbox) : bbox;
                }
            }
        }

        return selBBox;
    };

    /** @override */
    GXEditor.prototype.toString = function () {
        return "[Object GXEditor]";
    };

    _.GXEditor = GXEditor;
})(this);