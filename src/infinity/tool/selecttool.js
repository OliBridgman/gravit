(function (_) {
    /**
     * The mighty (base) selection tool
     * @class GXSelectTool
     * @extends GXTool
     * @constructor
     * @version 1.0
     */
    function GXSelectTool() {
        GXTool.call(this);
    };

    GObject.inherit(GXSelectTool, GXTool);

    /**
     * @enum
     * @private
     */
    GXSelectTool._Mode = {
        /** Any action was canceled */
        Canceled: 0,
        /** Selecting something */
        Select: 1,
        /** Prepared for moving */
        Move: 2,
        /** Actually moving something */
        Moving: 3
    };

    /**
     * The current selection area
     * @type {GRect}
     * @private
     */
    GXSelectTool.prototype._selectArea = null;

    /**
     * The current mode
     * @type {Number}
     * @see GXSelectTool._Mode
     * @private
     */
    GXSelectTool.prototype._mode = null;

    /**
     * An editor part that is under mouse if not moving / dragging
     * @type {*}
     * @private
     */
    GXSelectTool.prototype._editorUnderMouseInfo = null;

    /**
     * An editor part that triggered a move
     * @type {*}
     * @private
     */
    GXSelectTool.prototype._editorMovePartInfo = null;

    /**
     * The current key delta
     * @type {GPoint}
     * @private
     */
    GXSelectTool.prototype._keyDelta = null;

    /**
     * The start position of moving
     * @type {GPoint}
     * @private
     */
    GXSelectTool.prototype._moveStart = null;
    GXSelectTool.prototype._moveStartTransformed = null;

    /**
     * The current position of moving
     * @type {GPoint}
     * @private
     */
    GXSelectTool.prototype._moveCurrent = null;

    /** @override */
    GXSelectTool.prototype.getHint = function () {
        return GXTool.prototype.getHint.call(this)
            .addKey(GUIKey.Constant.SHIFT, new GLocale.Key(GXSelectTool, "shortcut.shift"), true)
            .addKey(GUIKey.Constant.META, new GLocale.Key(GXSelectTool, "shortcut.meta"), true)
            .addKey(GUIKey.Constant.OPTION, new GLocale.Key(GXSelectTool, "shortcut.option"), true)
            .addKey(GUIKey.Constant.UP, new GLocale.Key(GXSelectTool, "shortcut.up"), false)
            .addKey(GUIKey.Constant.DOWN, new GLocale.Key(GXSelectTool, "shortcut.down"), false)
            .addKey(GUIKey.Constant.LEFT, new GLocale.Key(GXSelectTool, "shortcut.left"), false)
            .addKey(GUIKey.Constant.RIGHT, new GLocale.Key(GXSelectTool, "shortcut.right"), false);
    };

    /** @override */
    GXSelectTool.prototype.getCursor = function () {
        if (this._editorUnderMouseInfo) {
            return GUICursor.SelectDot;
        } else {
            return GUICursor.Select;
        }
    };

    /** @override */
    GXSelectTool.prototype.activate = function (view, layer) {
        GXTool.prototype.activate.call(this, view, layer);

        layer.addEventListener(GUIMouseEvent.DragStart, this._mouseDragStart, this);
        layer.addEventListener(GUIMouseEvent.Drag, this._mouseDrag, this);
        layer.addEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd, this);
        layer.addEventListener(GUIMouseEvent.Down, this._mouseDown, this);
        layer.addEventListener(GUIMouseEvent.Release, this._mouseRelease, this);
        layer.addEventListener(GUIMouseEvent.Move, this._mouseMove, this);
        layer.addEventListener(GUIKeyEvent.Down, this._keyDown, this);
        layer.addEventListener(GUIKeyEvent.Release, this._keyRelease, this);

        gPlatform.addEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged, this);
    };

    /** @override */
    GXSelectTool.prototype.deactivate = function (view, layer) {
        GXTool.prototype.deactivate.call(this, view, layer);

        layer.removeEventListener(GUIMouseEvent.DragStart, this._mouseDragStart);
        layer.removeEventListener(GUIMouseEvent.Drag, this._mouseDrag);
        layer.removeEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd);
        layer.removeEventListener(GUIMouseEvent.Down, this._mouseDown);
        layer.removeEventListener(GUIMouseEvent.Release, this._mouseRelease);
        layer.removeEventListener(GUIMouseEvent.Move, this._mouseMove);
        layer.removeEventListener(GUIKeyEvent.Down, this._keyDown);
        layer.removeEventListener(GUIKeyEvent.Release, this._keyRelease);

        gPlatform.removeEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged);
    };

    /** @override */
    GXSelectTool.prototype.isDeactivatable = function () {
        // cannot deactivate while having any mode set
        return !this._mode;
    };

    /** @override */
    GXSelectTool.prototype.cancel = function () {
        if (this._mode != GXSelectTool._Mode.Canceled) {
            var oldMode = this._mode;
            this._updateMode(GXSelectTool._Mode.Canceled);

            if (oldMode == GXSelectTool._Mode.Select) {
                if (this._hasSelectArea()) {
                    var selectArea = this._selectArea;
                    this._selectArea = null;
                    this.invalidateArea(selectArea);
                } else {
                    this._selectArea = null;
                }
            } else if (oldMode == GXSelectTool._Mode.Moving) {
                if (this._editorMovePartInfo && this._editorMovePartInfo.isolated) {
                    this._editorMovePartInfo.editor.resetPartMove(this._editorMovePartInfo.id, this._editorMovePartInfo.data);
                } else {
                    this._editor.resetSelectionTransform();
                }
            }
        }
    };

    /** @override */
    GXSelectTool.prototype.paint = function (context) {
        if (this._mode == GXSelectTool._Mode.Select && this._hasSelectArea()) {
            var x = Math.floor(this._selectArea.getX()) + 0.5;
            var y = Math.floor(this._selectArea.getY()) + 0.5;
            var w = Math.ceil(this._selectArea.getWidth()) - 1.0;
            var h = Math.ceil(this._selectArea.getHeight()) - 1.0;
            context.canvas.strokeRect(x, y, w, h, 1, context.selectionOutlineColor);
        }
    };

    /**
     * @param {GUIMouseEvent.Move} event
     * @private
     */
    GXSelectTool.prototype._mouseMove = function (event) {
        this._updateEditorUnderMouse(event.client);
    };

    /**
     * @param {GUIMouseEvent.Down} event
     * @private
     */
    GXSelectTool.prototype._mouseDown = function (event) {
        // Quit if not hitting the left-mouse-button
        if (event.button !== GUIMouseEvent.BUTTON_LEFT) {
            return;
        }

        // Let editor do some work for mouse position
        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());

        // Reset to select mode here
        this._updateMode(GXSelectTool._Mode.Select);

        // We're doing a stacked hit-test when the meta is key is hold down and
        // when our manager has no temporary tool as in such case, we've been
        // activated temporarily with the meta key and should ignore the meta key.
        // When this is the case, we'll ignore hit-testing the editor(s) at all
        // and instead, go straight to hit-testing elements instead
        var stacked = gPlatform.modifiers.metaKey && this._manager.getTemporaryActiveTool() == null;

        if (!stacked) {
            // Try to get a part of an editor, first
            var docEditor = GXElementEditor.getEditor(this._scene);
            if (docEditor) {
                var partInfo = docEditor.getPartInfoAt(event.client, this._view.getWorldTransform(), function (editor) {
                    // Ensure to allow selected editors for part, only
                    return editor.hasFlag(GXElementEditor.Flag.Selected);
                }.bind(this), this._scene.getProperty('pickDist'));

                if (partInfo) {
                    var editor = partInfo.editor;
                    var partId = partInfo.id;
                    var selectable = partInfo.selectable;

                    // Only update part selection if we're either holding shift
                    // or when we didn't actually retreieve an already selected part
                    if (gPlatform.modifiers.shiftKey || (!editor.isPartSelected(partId) && selectable)) {
                        editor.updatePartSelection(gPlatform.modifiers.shiftKey, [partId]);
                    }

                    // Save the editor part that initiated the movement
                    if (!selectable || editor.isPartSelected(partId)) {
                        this._editorMovePartInfo = partInfo;
                    }

                    // Set mode to move
                    this._updateMode(GXSelectTool._Mode.Move);
                }
            }
        }

        // If we didn't receive an editor part then do our regular stuff here
        if (this._mode === GXSelectTool._Mode.Select) {
            var elementHits = this._scene.hitTest(event.client, this._view.getWorldTransform(), function (hit) {
                // Ensure to to allow only nodes that are selectable in editor
                return this._editor.isSelectable(hit);
            }.bind(this), stacked, -1, this._scene.getProperty('pickDist'));

            if (elementHits) {
                // The element hit array can only contain more than one hit
                // if we're in stacked mode, otherwise it will always contain
                // approximately one (the topmost) hit element so it is safe
                // to check for the length here and act differently
                if (elementHits.length > 1) {
                    // Iterate all of our hits and select either one deeper than
                    // than the current selection or start from the beginning
                    var lastSelIndex = null;
                    for (var i = 0; i < elementHits.length; ++i) {
                        if (elementHits[i].element.hasFlag(GXNode.Flag.Selected)) {
                            lastSelIndex = i;
                        }
                    }

                    if (lastSelIndex == null || lastSelIndex + 1 >= elementHits.length) {
                        // Start from the beginning
                        this._editor.updateSelection(gPlatform.modifiers.shiftKey, [elementHits[0].element]);
                    } else {
                        // Select next in order
                        this._editor.updateSelection(gPlatform.modifiers.shiftKey, [elementHits[lastSelIndex + 1].element]);
                    }

                } else {
                    var hitElement = elementHits[0].element;

                    if (gPlatform.modifiers.shiftKey || !hitElement.hasFlag(GXNode.Flag.Selected)) {
                        // Only update selection if we're either holding shift
                        // or when we didn't actually hit an already selected node
                        this._editor.updateSelection(gPlatform.modifiers.shiftKey, [hitElement]);
                    } else if (hitElement.hasFlag(GXNode.Flag.Selected)) {
                        // As element is already selected we need to ensure to properly
                        // clear all selected parts as that is the default behavior
                        var editor = GXElementEditor.getEditor(hitElement);
                        if (editor) {
                            editor.updatePartSelection(false, null);
                        }
                    }

                    // Switch to move mode if there's any selection in editor
                    var selection = this._editor.getSelection();
                    if (selection && selection.length > 0) {
                        this._updateMode(GXSelectTool._Mode.Move);
                    }
                }
            } else {
                // No hit at all so update without any nodes
                this._editor.updateSelection(gPlatform.modifiers.shiftKey, []);
            }
        }
    };

    /**
     * @param {GUIMouseEvent.Release} event
     * @private
     */
    GXSelectTool.prototype._mouseRelease = function (event) {
        // Reset some stuff in any case
        this._editorMovePartInfo = null;
        this._moveStart = null;
        this._moveStartTransformed = null;
        this._moveCurrent = null;
        this._updateMode(null);
        this._updateEditorUnderMouse(event.client);
    };

    /**
     * @param {GUIMouseEvent.DragStart} event
     * @private
     */
    GXSelectTool.prototype._mouseDragStart = function (event) {
        if (this._mode == GXSelectTool._Mode.Move) {
            // Save start
            this._moveStart = event.client;
            this._moveStartTransformed = this._view.getViewTransform().mapPoint(this._moveStart);

            // Switch to moving mode
            this._updateMode(GXSelectTool._Mode.Moving);
        }
    };

    /**
     * @param {GUIMouseEvent.Drag} event
     * @private
     */
    GXSelectTool.prototype._mouseDrag = function (event) {
        if (this._mode == GXSelectTool._Mode.Moving) {
            // Save current
            this._moveCurrent = event.client;

            // Update transform
            this._updateSelectionTransform();
        } else if (this._mode == GXSelectTool._Mode.Select) {
            if (this._hasSelectArea()) {
                this.invalidateArea(this._selectArea);
            }

            this._selectArea = GRect.fromPoints(event.clientStart, event.client);

            if (this._hasSelectArea()) {
                this.invalidateArea(this._selectArea);
            }
        }
    };

    /**
     * @param {GUIMouseEvent.DragEnd} event
     * @private
     */
    GXSelectTool.prototype._mouseDragEnd = function (event) {
        if (this._mode == GXSelectTool._Mode.Moving) {
            if (this._editorMovePartInfo && this._editorMovePartInfo.isolated) {
                this._editor.beginTransaction();
                try {
                    this._editorMovePartInfo.editor.applyPartMove(this._editorMovePartInfo.id, this._editorMovePartInfo.data);
                } finally {
                    var nodeNameTranslated = this._editorMovePartInfo.editor.getElement().getNodeNameTranslated();

                    // TODO : I18N
                    if (!nodeNameTranslated) {
                        nodeNameTranslated = 'Element';
                    }
                    this._editor.commitTransaction('Modify ' + nodeNameTranslated);
                }
            } else if (this._editorMovePartInfo && this._editorMovePartInfo.shapeOnly){
                // TODO: add clone logic, or Alt support + Shift support
                this._editor.beginTransaction();
                try {
                    this._editorMovePartInfo.editor.applyTransform(this._editorMovePartInfo.editor.getElement(),
                        this._editorMovePartInfo.id);
                } finally {
                    var nodeNameTranslated = this._editorMovePartInfo.editor.getElement().getNodeNameTranslated();

                    // TODO : I18N
                    if (!nodeNameTranslated) {
                        nodeNameTranslated = 'Element';
                    }
                    this._editor.commitTransaction('Transform ' + nodeNameTranslated);
                }
            } else {
                // Holding option key when we've transformed the whole selection
                // will actually clone the current selection and apply the transformation
                // to the new selection so we'll do that here
                this._editor.applySelectionTransform(gPlatform.modifiers.optionKey);
            }
        } else if (this._mode == GXSelectTool._Mode.Select) {
            // Check if we've selected an area
            if (this._hasSelectArea()) {
                // our area selector selected something
                var mappedSelectArea = this._view.getViewTransform().mapRect(this._selectArea);
                var x0 = mappedSelectArea.getX(), y0 = mappedSelectArea.getY();
                var x2 = x0 + mappedSelectArea.getWidth(), y2 = y0 + mappedSelectArea.getHeight();
                var collisionArea = new GXVertexContainer(5);
                collisionArea.modifyVertex(GXVertex.Command.Move, x0, y0, 0);
                collisionArea.modifyVertex(GXVertex.Command.Line, x2, y0, 1);
                collisionArea.modifyVertex(GXVertex.Command.Line, x2, y2, 2);
                collisionArea.modifyVertex(GXVertex.Command.Line, x0, y2, 3);
                collisionArea.modifyVertex(GXVertex.Command.Close, 0, 0, 4);
                var collisions = this._scene.getCollisions(collisionArea, GXElement.CollisionFlag.GeometryBBox);

                this._editor.updateSelection(gPlatform.modifiers.shiftKey, collisions);

                // Invalidate to remove area selector's paint region
                var selectArea = this._selectArea;
                this._selectArea = null;
                this.invalidateArea(selectArea);
            } else {
                this._selectArea = null;
            }
        }
    };

    /**
     * @param {GUIKeyEvent} evt
     * @private
     */
    GXSelectTool.prototype._keyDown = function (evt) {
        if (evt.key === GUIKey.Constant.UP || evt.key === GUIKey.Constant.DOWN ||
            evt.key === GUIKey.Constant.LEFT || evt.key === GUIKey.Constant.RIGHT) {

            // Shift selection if any
            if (this._editor.hasSelection() && (!this._mode || this._mode === GXSelectTool._Mode.Moving)) {
                if (this._mode !== GXSelectTool._Mode.Moving) {
                    this._updateMode(GXSelectTool._Mode.Moving);
                }

                var crDistance = gPlatform.modifiers.shiftKey ?
                    this._scene.getProperty('crDistBig') : this._scene.getProperty('crDistSmall');

                var dx = 0;
                var dy = 0;
                switch (evt.key) {
                    case GUIKey.Constant.UP:
                        dy -= crDistance;
                        break;
                    case GUIKey.Constant.DOWN:
                        dy += crDistance;
                        break;
                    case GUIKey.Constant.LEFT:
                        dx -= crDistance;
                        break;
                    case GUIKey.Constant.RIGHT:
                        dx += crDistance;
                        break;
                    default:
                        break;
                }

                this._keyDelta = this._keyDelta ? this._keyDelta.add(new GPoint(dx, dy)) : new GPoint(dx, dy);
                this._editor.moveSelection(this._keyDelta, false);
            }
        }
    };

    /**
     * @param {GUIKeyEvent} evt
     * @private
     */
    GXSelectTool.prototype._keyRelease = function (evt) {
        if (evt.key === GUIKey.Constant.UP || evt.key === GUIKey.Constant.DOWN ||
            evt.key === GUIKey.Constant.LEFT || evt.key === GUIKey.Constant.RIGHT) {

            // Apply transformation applied through keys if any and reset it
            if (this._keyDelta) {
                this._editor.applySelectionTransform();
                this._keyDelta = null;
                this._updateMode(null);
            }
        }
    };

    /**
     * @param {GUIPlatform.ModifiersChangedEvent} event
     * @private
     */
    GXSelectTool.prototype._modifiersChanged = function (event) {
        if (event.changed.shiftKey && this._mode === GXSelectTool._Mode.Moving) {
            this._updateSelectionTransform();
        }
    };

    /**
     * @private
     */
    GXSelectTool.prototype._updateSelectionTransform = function () {
        var position = this._editor.getGuides().mapPoint(this._moveCurrent);
        if (this._editorMovePartInfo && this._editorMovePartInfo.isolated) {
            this._editorMovePartInfo.editor.movePart(this._editorMovePartInfo.id, this._editorMovePartInfo.data,
                position, this._view.getViewTransform(), gPlatform.modifiers.shiftKey);
        } else if (this._editorMovePartInfo && this._editorMovePartInfo.shapeOnly){
            position = this._view.getViewTransform().mapPoint(position);
            var moveDelta = position.subtract(this._moveStartTransformed);
            this._editorMovePartInfo.editor.transform(new GTransform(1, 0, 0, 1, moveDelta.getX(), moveDelta.getY()),
                this._editorMovePartInfo.id, this._editorMovePartInfo.data);
        } else {
            if (gPlatform.modifiers.shiftKey) {
                // Calculate move delta by locking our vector to 45° steps starting with constraint
                var crConstraint = this._scene.getProperty('crConstraint');
                position = gMath.convertToConstrain(this._moveStart.getX(), this._moveStart.getY(),
                    position.getX(), position.getY(), crConstraint);
            }

            position = this._view.getViewTransform().mapPoint(position);
            var moveDelta = position.subtract(this._moveStartTransformed);

            this._editor.moveSelection(moveDelta, true,
                this._editorMovePartInfo ? this._editorMovePartInfo.id : null, this._editorMovePartInfo ? this._editorMovePartInfo.data : null);
        }
    };

    /**
     * Called to update the current mode
     * @param {GXSelectTool._Mode} mode
     * @private
     */
    GXSelectTool.prototype._updateMode = function (mode) {
        if (mode !== this._mode) {
            this._mode = mode;
        }
    };

    /**
     * Updates the editor under given mouse client coordinates
     * @param {GPoint} mouse mouse client coordinates
     * @private
     */
    GXSelectTool.prototype._updateEditorUnderMouse = function (mouse) {
        var hasEditorInfoUnderMouse = false;

        // Hit-Test editor under mouse if not in any mode
        if (!this._mode) {
            var docEditor = GXElementEditor.getEditor(this._scene);
            if (docEditor) {
                var partInfo = docEditor.getPartInfoAt(mouse, this._view.getWorldTransform(), function (editor) {
                    // Ensure to allow selected editors for part, only
                    return editor.hasFlag(GXElementEditor.Flag.Selected);
                }.bind(this), this._scene.getProperty('pickDist'));

                if (partInfo !== this._editorUnderMouseInfo) {
                    this._editorUnderMouseInfo = partInfo;
                    hasEditorInfoUnderMouse = true;
                    this.updateCursor();
                }
            }
        }

        if (!hasEditorInfoUnderMouse && this._editorUnderMouseInfo) {
            this._editorUnderMouseInfo = null;
            this.updateCursor();
        }
    };

    /** @private **/
    GXSelectTool.prototype._hasSelectArea = function () {
        return (this._selectArea && (this._selectArea.getHeight() > 0 || this._selectArea.getWidth() > 0));
    };

    /** override */
    GXSelectTool.prototype.toString = function () {
        return "[Object GXSelectTool]";
    };

    _.GXSelectTool = GXSelectTool;
})(this);