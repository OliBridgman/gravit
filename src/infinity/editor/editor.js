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

        // Mark first found page on scene as current if there's any
        var firstPage = this._scene.querySingle('page');
        if (firstPage) {
            this.setCurrentPage(firstPage);
        }

        this._currentColor = [new IFColor(IFColor.Type.Black), null];
    };
    GObject.inherit(IFEditor, GEventTarget);

    IFEditor.options = {
        /** Maximum number of undo-steps */
        maxUndoSteps: 10
    };

    /**
     * Current Color Type
     * @enum
     */
    IFEditor.CurrentColorType = {
        Stroke: 0,
        Fill: 1
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

    // -----------------------------------------------------------------------------------------------------------------
    // IFEditor.CurrentLayerChangedEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever the current layer has been changed
     * @class IFEditor.CurrentLayerChangedEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    IFEditor.CurrentLayerChangedEvent = function (previousLayer) {
        this.previousLayer = previousLayer;
    };
    GObject.inherit(IFEditor.CurrentLayerChangedEvent, GEvent);

    /** @type {IFLayer} */
    IFEditor.CurrentLayerChangedEvent.prototype.previousLayer = null;

    /** @override */
    IFEditor.CurrentLayerChangedEvent.prototype.toString = function () {
        return "[Event IFEditor.CurrentLayerChangedEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFEditor.CurrentPageChangedEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever the current page has been changed
     * @class IFEditor.CurrentPageChangedEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    IFEditor.CurrentPageChangedEvent = function (previousPage) {
        this.previousPage = previousPage;
    };
    GObject.inherit(IFEditor.CurrentPageChangedEvent, GEvent);

    /** @type {IFPage} */
    IFEditor.CurrentPageChangedEvent.prototype.previousPage = null;

    /** @override */
    IFEditor.CurrentPageChangedEvent.prototype.toString = function () {
        return "[Event IFEditor.CurrentPageChangedEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFEditor.CurrentColorChangedEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever a current color has been changed
     * @class IFEditor.CurrentColorChangedEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    IFEditor.CurrentColorChangedEvent = function (type, previousColor) {
        this.type = type;
        this.previousColor = previousColor;
    };
    GObject.inherit(IFEditor.CurrentColorChangedEvent, GEvent);

    /** @type {IFEditor.CurrentColorType} */
    IFEditor.CurrentColorChangedEvent.prototype.type = null;

    /** @type {IFColor} */
    IFEditor.CurrentColorChangedEvent.prototype.previousColor = null;

    /** @override */
    IFEditor.CurrentColorChangedEvent.prototype.toString = function () {
        return "[Event IFEditor.CurrentColorChangedEvent]";
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
    GObject.inherit(IFEditor.SelectionChangedEvent, GEvent);

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
    GObject.inherit(IFEditor.InlineEditorEvent, GEvent);

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
    GObject.inherit(IFEditor.InvalidationRequestEvent, GEvent);

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
     * @type {boolean}
     * @private
     */
    IFEditor.prototype._selectionDetail = false;

    /**
     * @type {{actions: Array<{action: Function, revert: Function}>, selection: Array<{element: IFElement, parts: Array<*>}>}}
     * @private
     */
    IFEditor.prototype._transaction = null;

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
     * @type {IFPage}
     * @private
     */
    IFEditor.prototype._currentPage = null;

    /**
     * @type {IFLayer}
     * @private
     */
    IFEditor.prototype._currentLayer = null;

    /**
     * @type {Array<IFColor>}
     * @private
     */
    IFEditor.prototype._currentColor = null;

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
     * Return the currently active page if any
     * @return {IFPage}
     */
    IFEditor.prototype.getCurrentPage = function () {
        return this._currentPage;
    };

    /**
     * Set the currently active page
     * @param {IFPage} page
     */
    IFEditor.prototype.setCurrentPage = function (page) {
        if (page !== this._currentPage) {
            if (this._currentPage) {
                this._currentPage.removeFlag(IFNode.Flag.Active);
            }

            var previousPage = this._currentPage;
            this._currentPage = page;

            if (this._currentPage) {
                this._currentPage.setFlag(IFNode.Flag.Active);
            }

            if (this.hasEventListeners(IFEditor.CurrentPageChangedEvent)) {
                this.trigger(new IFEditor.CurrentPageChangedEvent(previousPage));
            }
        }
    };

    /**
     * Return the currently active layer if any
     * @return {IFLayer}
     */
    IFEditor.prototype.getCurrentLayer = function () {
        return this._currentLayer;
    };

    /**
     * Set the currently active layer and moves the current
     * selection into the new current layer
     *
     * @param {IFLayer} layer
     */
    IFEditor.prototype.setCurrentLayer = function (layer) {
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

            if (this.hasEventListeners(IFEditor.CurrentLayerChangedEvent)) {
                this.trigger(new IFEditor.CurrentLayerChangedEvent(previousLayer));
            }
        }
    };

    /**
     * Get a current color for a given type
     * @param {IFEditor.CurrentColorType} type
     */
    IFEditor.prototype.getCurrentColor = function (type) {
        return this._currentColor[type];
    };

    /**
     * Set a current color for a given type
     * @param {IFEditor.CurrentColorType} type
     * @param {IFColor} color
     */
    IFEditor.prototype.setCurrentColor = function (type, color) {
        if (!IFColor.equals(color, this._currentColor[type])) {
            var oldColor = this._currentColor[type];

            // Assign new color
            this._currentColor[type] = color;

            // Trigger event
            if (this.hasEventListeners(IFEditor.CurrentColorChangedEvent)) {
                this.trigger(new IFEditor.CurrentColorChangedEvent(type, oldColor));
            }
        }
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
     * Called to close and detach this editor
     */
    IFEditor.prototype.close = function () {
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
     * Clone current selection (if any) and make it the new selection
     * @param {Boolean} [noTransaction] if true, will not create a
     * transaction (undo/redo), defaults to false
     * @return {Array<IFElement>} the array of clones or null for no clones
     */
    IFEditor.prototype.cloneSelection = function (noTransaction) {
        if (this._selection && this._selection.length > 0) {
            if (!noTransaction) {
                this.beginTransaction();
            }

            try {
                var clonedSelection = [];

                for (var i = 0; i < this._selection.length; ++i) {
                    var selElement = this._selection[i];
                    if (selElement.hasMixin(IFNode.Store)) {
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
    IFEditor.prototype.deleteSelection = function (noTransaction) {
        if (this._selection && this._selection.length > 0) {
            if (!noTransaction) {
                this.beginTransaction();
            }

            try {
                var orderedSelection = IFNode.order(this._selection, true);
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
     * @param {Array<IFElement>} selection the new array of nodes to be selected
     */
    IFEditor.prototype.updateSelection = function (toggle, selection) {
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
    };

    /**
     * Clears the whole selection if any
     * @param {Array<IFElement>} [exclusion] an array to exclude from removing
     * from the selection or null for none
     */
    IFEditor.prototype.clearSelection = function (exclusion) {
        var index = 0;
        while (this._selection && index < this._selection.length) {
            if (exclusion && exclusion.indexOf(this._selection[index]) >= 0) {
                index++;
                continue;
            }
            this._selection[index].removeFlag(IFNode.Flag.Selected);
        }
    };

    /**
     * Move the selection
     * @param {GPoint} delta the move delta
     * @param {Boolean} align whether to automatically align or not
     * @param {*} [partId] optional id of part that has started the transformation
     * @param {*} [data] optional data of part that has started the transformation
     */
    IFEditor.prototype.moveSelection = function (delta, align, partId, partData) {
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
    IFEditor.prototype.scaleSelection = function (sx, sy, dx, dy, align, partId, partData) {
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

    IFEditor.prototype.updateSelectionTransformBox = function () {
        this._transformBox = null;
        if (this.getSelection()) {
            var selBBox = this._getSelectionBBox(false);
            if (selBBox) {
                this._transformBox = new IFTransformBox(selBBox);
            }
        }
    };

    IFEditor.prototype.getTransformBox = function () {
        return this._transformBox;
    };

    IFEditor.prototype.cleanTransformBox = function () {
        this._transformBox = null;
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
        var target = this.getCurrentPage();// this.getCurrentLayer();

        if (!noTransaction) {
            this.beginTransaction();
        }

        var fillColor = this._currentColor[IFEditor.CurrentColorType.Fill];
        var strokeColor = this._currentColor[IFEditor.CurrentColorType.Stroke];

        try {
            for (var i = 0; i < elements.length; ++i) {
                var element = elements[i];

                // Append new element
                target.appendChild(element);

                if (!noInitial) {
                    // Create a temporary editor for the element to handle it's insertion
                    var editor = IFElementEditor.createEditor(element);
                    if (editor) {
                        editor.initialSetup(fillColor, strokeColor);
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
    IFEditor.prototype.updateByMousePosition = function (position, transformation) {
        // TODO : Make this more efficient than hit-testing everything (aka iterate pages instead)
        // Try to update the active page under mouse if any
        var pageHits = this._scene.hitTest(position, transformation, function (hit) {
            return hit instanceof IFPage;
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
    IFEditor.prototype.beginTransaction = function () {
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
    IFEditor.prototype.commitTransaction = function (name) {
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
    IFEditor.prototype.pushState = function (action, revert, name) {
        if (this._undoStates.length >= IFEditor.options.maxUndoSteps) {
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
            state.revert();
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
            state.action();
        }
    };
    
    /**
     * Called to open an inline editor for a given node and view
     * @param {IFNode} node
     * @param {IFEditorView} view
     * @return {Boolean} true if an inline editor was opened, false if not
     */
    IFEditor.prototype.openInlineEditor = function (node, view) {
        this.closeInlineEditor();
        
        var editor = IFElementEditor.getEditor(node);
        if (editor && editor.canInlineEdit()) {
            if (this.hasEventListeners(IFEditor.InlineEditorEvent)) {
                this.trigger(new IFEditor.InlineEditorEvent(editor, IFEditor.InlineEditorEvent.Type.BeforeOpen));
            }
            
            editor.beginInlineEdit(view, view._htmlElement);
            editor.adjustInlineEditForView(view);
            
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
     */
    IFEditor.prototype.closeInlineEditor = function () {
        if (this._currentInlineEditorNode) {
            this._finishEditorInlineEdit(this._currentInlineEditorNode);
        }
    };

    /**
     * @param {IFNode.AfterInsertEvent} evt
     * @private
     */
    IFEditor.prototype._afterNodeInsert = function (evt) {
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
        if (evt.node instanceof IFPage && !this._currentPage) {
            this.setCurrentPage(evt.node);
        }
    };

    /**
     * @param {IFNode.BeforeRemoveEvent} evt
     * @private
     */
    IFEditor.prototype._beforeNodeRemove = function (evt) {
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

        if (evt.node instanceof IFElement) {
            // If element is in selection, unselect it, first
            if (this._selection && this._selection.indexOf(evt.node) >= 0) {
                evt.node.removeFlag(IFNode.Flag.Selected);
            } else {
                // Otherwise try to close any editors the node may have
                this._closeEditor(evt.node);
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
     * @param {IFNode.BeforePropertiesChangeEvent} evt
     * @private
     */
    IFEditor.prototype._beforePropertiesChange = function (evt) {
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

                // Trigger selection change event
                if (this.hasEventListeners(IFEditor.SelectionChangedEvent)) {
                    this.trigger(IFEditor.SELECTION_CHANGED_EVENT);
                }

                // Mark containing layer active if any
                if (node.getParent() instanceof IFLayer) {
                    node.getParent().setFlag(IFNode.Flag.Active);
                }
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

                // Trigger selection change event
                if (this.hasEventListeners(IFEditor.SelectionChangedEvent)) {
                    this.trigger(IFEditor.SELECTION_CHANGED_EVENT);
                }

                // Deactivate parent if layer and no other selected
                // item has had the same parent
                if (node.getParent() instanceof IFLayer && !sameParentInSelection) {
                    node.getParent().removeFlag(IFNode.Flag.Active);
                }
            }
        } else if (node instanceof IFNode && node.hasFlag(IFNode.Flag.Selected)) {
            // Trigger selection change event
            if (this.hasEventListeners(IFEditor.SelectionChangedEvent)) {
                this.trigger(IFEditor.SELECTION_CHANGED_EVENT);
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
        }
    };

    IFEditor.prototype._closeEditor = function (node) {
        this._finishEditorInlineEdit(node);
        IFElementEditor.closeEditor(node);
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

    IFEditor.prototype._getSelectionBBox = function (paintBBox) {
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
    IFEditor.prototype.toString = function () {
        return "[Object IFEditor]";
    };

    _.IFEditor = IFEditor;
})(this);