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

        // Mark active page and layer if any
        if (this._scene.getPageSet().getFirstChild()) {
            this.setCurrentPage(this._scene.getPageSet().getFirstChild());
        }

        if (this._scene.getLayerSet().getLastChild()) {
            this.setCurrentLayer(this._scene.getLayerSet().getLastChild());
        } else {
            throw new Error('Missing active layer.');
        }

        this._currentColor = [new GXColor(GXColor.Type.Black), null];
    };
    GObject.inherit(GXEditor, GEventTarget);

    GXEditor.options = {
        /** Maximum number of undo-steps */
        maxUndoSteps : 10
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
     * @type {String}
     * @private
     */
    GXEditor.prototype._selectQuery = null;

    /**
     * @type {{nodes: Array<GXNode>, states: Array<*>}}
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
     * @type {boolean}
     * @private
     */
    GXEditor.prototype._lockedToCurrentPage = false;

    /**
     * @type {boolean}
     * @private
     */
    GXEditor.prototype._lockedToCurrentLayer = false;

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
     * Returns the current select query
     * @returns {boolean}
     */
    GXEditor.prototype.getSelectQuery = function () {
        return this._selectQuery;
    };

    /**
     * Assigns the current select query
     * @param {String} query the query what is selectable,
     * may also be null to switch to default selection mode
     */
    GXEditor.prototype.setSelectQuery = function (query) {
        if (query !== this._selectQuery) {
            this._selectQuery = query;
            this._updateSelectionForSelectable();
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

            this._updateSelectionForSelectable();

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

            this._updateSelectionForSelectable();

            if (this.hasEventListeners(GXEditor.CurrentLayerChangedEvent)) {
                this.trigger(new GXEditor.CurrentLayerChangedEvent(previousLayer));
            }
        }
    };

    /**
     * Returns whether the editor is locked to the current page
     * which will i.e. allow selection only within the current page
     * @param locked
     */
    GXEditor.prototype.isLockedToCurrentPage = function () {
        return this._lockedToCurrentPage;
    };

    /**
     * Assign whether the editor is locked to the current page
     * which will i.e. allow selection only within the current page
     * @param locked
     */
    GXEditor.prototype.setLockedToCurrentLayer = function (locked) {
        if (locked !== this._lockedToCurrentPage) {
            this._lockedToCurrentPage = locked;
            if (locked) {
                this._updateSelectionForSelectable();
            }
        }
    };

    /**
     * Returns whether the editor is locked to the current layer
     * which will i.e. allow selection only within the current layer
     * @param locked
     */
    GXEditor.prototype.isLockedToCurrentLayer = function () {
        return this._lockedToCurrentLayer;
    };

    /**
     * Assign whether the editor is locked to the current layer
     * which will i.e. allow selection only within the current layer
     * @param locked
     */
    GXEditor.prototype.setLockedToActiveLayer = function (locked) {
        if (locked !== this._lockedToCurrentLayer) {
            this._lockedToCurrentLayer = locked;
            if (locked) {
                this._updateSelectionForSelectable();
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
            this._currentColor = color;

            // Assign to selection if any and assignable
            // TODO

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
        this._scene.removeEventListener(GXNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
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
     * Evaluates whether a given node is selectable or not under
     * the current conditions of the editor
     * @param {GXNode} node the node to test for selectable
     * @return {Boolean} true if node is selectable, false if not
     */
    GXEditor.prototype.isSelectable = function (node) {
        var inclusionQuery = null;
        var exclusionQuery = null;

        if (this._selectQuery && this._selectQuery.trim() !== "") {
            inclusionQuery = this._selectQuery;
        } else {
            // By default we'll exclude pages, layers and scene
            exclusionQuery = 'scene,page,layer';
        }

        if (inclusionQuery && !node.filtered(inclusionQuery)) {
            return false;
        }

        if (exclusionQuery && node.filtered(exclusionQuery)) {
            return false;
        }

        if (this.isLockedToCurrentPage() && this.getCurrentPage()) {
            if (node instanceof GXElement && !this.getCurrentPage().isPagePart(node)) {
                return false;
            }
        }

        if (this.isLockedToCurrentLayer() && this.getCurrentLayer()) {
            var foundLayer = false;

            for (var p = node.getParent(); p !== null; p = p.getParent()) {
                if (p instanceof GXLayer && p === this.getCurrentLayer()) {
                    foundLayer = true;
                    break;
                }
            }

            if (!foundLayer) {
                return false;
            }
        }

        return true;
    };

    /**
     * Clone current selection (if any) and make it the new selection
     * @return {Array<GXElement>} the array of clones or null for no clones
     */
    GXEditor.prototype.cloneSelection = function () {
        if (this._selection && this._selection.length > 0) {
            // TODO : Begin Undo Group
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

            // TODO : End Undo Group
        }
        return null;
    };

    /**
     * Update the current selection
     * @param {boolean} toggle if true then this will merge/united the
     * current selection with the new one, otherwise the current selection
     * will be replaced with the new one
     * @param {Array<GXElement>} selection the new array of nodes to be selected
     * @param {Boolean} [noFilter] if true, the selection will not be filtered
     * by the current conditions. Defaults to false
     */
    GXEditor.prototype.updateSelection = function (toggle, selection, noFilter) {
        if (!noFilter && selection && selection.length > 0) {
            var tmpSelection = [];

            for (var i = 0; i < selection.length; ++i) {
                if (this.isSelectable(selection[i])) {
                    tmpSelection.push(selection[i]);
                }
            }

            selection = tmpSelection;
        }

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
        // TODO : FIX THIS!!!
        if (align) {
            var selBBox = null;

            for (var i = 0; i < this.getSelection().length; ++i) {
                var bbox = this.getSelection()[i].getPaintBBox();
                if (bbox && !bbox.isEmpty()) {
                    selBBox = selBBox ? selBBox.united(bbox) : bbox;
                }
            }

            transBBox = selBBox.translated(delta.getX(), delta.getY());
            var tl = this._guides.mapPoint(transBBox.getSide(GRect.Side.TOP_LEFT));
            delta = tl.subtract(selBBox.getSide(GRect.Side.TOP_LEFT));
        }

        // TODO : Align support
        this.transformSelection(new GTransform(1, 0, 0, 1, delta.getX(), delta.getY()), partId, partData);
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
        // TODO : Align support
        //this.transformSelection(new GTransform(1, 0, 0, 1, x, y), partId, partData);
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
     */
    GXEditor.prototype.applySelectionTransform = function (cloneSelection) {
        // TODO : Begin Undo Group

        if (this._selection && this._selection.length) {
            var clonedSelection = [];

            for (var i = 0; i < this._selection.length; ++i) {
                var item = this._selection[i];
                var editor = GXElementEditor.getEditor(item);
                if (editor) {
                    var selectionElement = this._selection[i];
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
        }

        // TODO : Finish Undo Group
    };

    /**
     * Insert an element and handle it's insertion.
     * This is a shortcut for insertElements([element])
     * @param {GXElement} element the element to be inserted
     * @see insertElements
     */
    GXEditor.prototype.insertElement = function (element) {
        this.insertElements([element]);
    };

    /**
     * Inserts one or more elements into the right target parent
     * and selects the elements clearing any previous selection
     * This is a shortcut for insertElements([element])
     * @param {Array<GXElement>} elements the elements to be inserted
     * @param {Boolean} noDefaults if true, no defaults like default style
     * will be applied. This defaults to false.
     */
    GXEditor.prototype.insertElements = function (elements, noDefaults) {
        // Our target is always the currently active layer
        var target = this.getCurrentLayer();

        this.executeTransaction(function () {
            for (var i = 0; i < elements.length; ++i) {
                var element = elements[i];

                if (!noDefaults) {
                    // TODO : Apply current styles / effects
                }

                // Append new element
                target.appendChild(element);
            }

            // Select all inserted elements
            this.updateSelection(false, elements);
        }.bind(this), elements, 'Insert Element(s)');
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
     * Immediately execute a transaction. This is equal to calling
     * beginTransaction(nodes) followed by commitTransaction(action, name).
     *
     * @param {Function} action the action to be executed when comitting
     * @param {Array<GXNode>} [nodes] the affected nodes, if null, the selection
     * is taken as reference
     * @param {String} name the name of the newly created state
     */
    GXEditor.prototype.executeTransaction = function (action, nodes, name) {
        this.beginTransaction(nodes);
        this.commitTransaction(action, name);
    };

    /**
     * Begin a new transaction. This will store all properties and structural
     * information on a given set of nodes. This needs to be finished be a call
     * to either commitTransaction or rollbackTransaction or revertTransaction.
     * There can only be once active transaction at a given time.
     * @param {Array<GXNode>} [nodes] the affected nodes, if null, the selection
     * is taken as reference
     */
    GXEditor.prototype.beginTransaction = function (nodes) {
        if (this._transaction) {
            throw new Error('There already is an active transaction.');
        }

        var nodes = nodes ? nodes : this._selection;
        if (!nodes || nodes.length === 0) {
            throw new Error('No active nodes for state');
        }

        this._transaction = {
            nodes : nodes,
            states : [],
            revert : function () {
                for (var i = 0; i < this.states.length; ++i) {
                    var state = this.states[i];
                    var node = state.node;

                    if (node.hasMixin(GXNode.Properties)) {
                        node.setPropertiesMap(state.properties, false);
                        node.setPropertiesMap(state.customProperties, true);
                    }

                    if (state.parent !== node.getParent() || state.next !== node.getNext()) {
                        if (state.parent === null && node.getParent() !== null) {
                            node.getParent().removeChild(node);
                        }
                    }
                }
            }
        };

        for (var i = 0; i < nodes.length; ++i) {
            var node = nodes[i];
            var state = {
                node : node,
                parent : node.getParent(),
                next : node.getNext()
            };

            if (node.hasMixin(GXNode.Properties)) {
                state.properties = node.getPropertiesMap(false);
                state.customProperties = node.getPropertiesMap(true);
            }

            this._transaction.states.push(state);
        }
    };

    /**
     * Commit the active transaction by storing the saved state and
     * executing a given action. This will also store the active
     * selection if any and revert to it when reseting to the state.
     * @param {Function} action the action to be executed when comitting
     * @param {String} name the name of the newly created state
     */
    GXEditor.prototype.commitTransaction = function (action, name) {
        if (!this._transaction) {
            throw new Error('No active transaction available.');
        }

        var transaction = this._transaction;
        var selection = this._selection ? this._selection.slice() : [];
        this._transaction = null;

        var revert = function () {
            transaction.revert();
            this.updateSelection(false, selection);
        }.bind(this);

        this.pushState(action, revert, name);
    };

    /**
     * Rollback the active transaction which will reset everything to
     * the state it was when beginTransaction was called.
     */
    GXEditor.prototype.rollbackTransaction = function () {
        if (!this._transaction) {
            throw new Error('No active transaction available.');
        }
        this._transaction.revert();
        this._transaction = null;
    };

    /**
     * Revert the active transaction which will leave any changes
     * as is but clear the current transaction.
     */
    GXEditor.prototype.revertTransaction = function () {
        if (!this._transaction) {
            throw new Error('No active transaction available.');
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
            action : action,
            revert : revert,
            name : name ? name : ""
        });

        action();
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
        // If page and we don't have a current one yet, mark it active now
        if (evt.node instanceof GXPage && !this._currentPage) {
            this.setCurrentPage(evt.node);
        }

        // Try to add newly inserted node into internal selection
        this._tryAddToSelection(evt.node);
    };

    /**
     * @param {GXNode.BeforeRemoveEvent} evt
     * @private
     */
    GXEditor.prototype._beforeNodeRemove = function (evt) {
        // Try to remove node from internal selection, first
        this._tryRemoveFromSelection(evt.node);

        if (evt.node instanceof GXElement) {
            // Try to close any editors the node may have
            GXElementEditor.closeEditor(evt.node);
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
        } else if (this._currentLayer && evt.node === this._currentLayer) {
            // Get a flat list of layers and select next/previous one
            var allLayers = this._scene.queryAll('layer');
            var layerIndex = allLayers.indexOf(evt.node);
            if (layerIndex > 0) {
                this.setCurrentLayer(allLayers[layerIndex - 1]);
            } else if (layerIndex + 1 < allLayers.length) {
                this.setCurrentLayer(allLayers[layerIndex + 1]);
            } else {
                throw new Error('Unexpected: No layer available.');
            }
        }
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
     * Updates the current selection if any and clears it depending
     * on the current selection settings like query, locking etc.
     * @private
     */
    GXEditor.prototype._updateSelectionForSelectable = function () {
        if (this._selection) {
            var markedForExclusion = [];
            var clearCount = 0;

            for (var i = 0; i < this._selection.length; ++i) {
                if (this.isSelectable(this._selection[i])) {
                    markedForExclusion.push(this._selection[i]);
                } else {
                    clearCount += 1;
                }
            }

            if (clearCount > 0) {
                this.clearSelection(markedForExclusion)
            }
        }
    };

    /** @override */
    GXEditor.prototype.toString = function () {
        return "[Object GXEditor]";
    };

    _.GXEditor = GXEditor;
})(this);