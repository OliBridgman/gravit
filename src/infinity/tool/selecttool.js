(function (_) {
    /**
     * The mighty (base) selection tool
     * @class IFSelectTool
     * @extends IFTool
     * @constructor
     * @version 1.0
     */
    function IFSelectTool() {
        IFTool.call(this);
    };

    IFObject.inherit(IFSelectTool, IFTool);

    /**
     * @enum
     * @private
     */
    IFSelectTool._Mode = {
        /** Selecting something */
        Select: 1,
        /** Prepared for moving */
        Move: 2,
        /** Actually moving something */
        Moving: 3,
        /** Transforming via transform box */
        Transforming: 4
    };

    /**
     * The current selection area
     * @type {GRect}
     * @private
     */
    IFSelectTool.prototype._selectArea = null;

    /**
     * The current mode
     * @type {Number}
     * @see IFSelectTool._Mode
     * @private
     */
    IFSelectTool.prototype._mode = null;

    /**
     * An element that was hit when the the mouse was down
     * and no editor part has been hit. This will not be cleared
     * before the next mouse down signal.
     * @type {IFElement}
     * @private
     */
    IFSelectTool.prototype._elementUnderMouse = null;

    /**
     * An editor part that is under mouse if not moving / dragging
     * @type {*}
     * @private
     */
    IFSelectTool.prototype._editorUnderMouseInfo = null;

    /**
     * An editor part that triggered a move
     * @type {*}
     * @private
     */
    IFSelectTool.prototype._editorMovePartInfo = null;

    /**
     * The current key delta
     * @type {GPoint}
     * @private
     */
    IFSelectTool.prototype._keyDelta = null;

    /**
     * The start position of moving
     * @type {GPoint}
     * @private
     */
    IFSelectTool.prototype._moveStart = null;
    IFSelectTool.prototype._moveStartTransformed = null;

    /**
     * The current position of moving
     * @type {GPoint}
     * @private
     */
    IFSelectTool.prototype._moveCurrent = null;

    /** @override */
    IFSelectTool.prototype.getHint = function () {
        return IFTool.prototype.getHint.call(this)
            .addKey(IFKey.Constant.SHIFT, new IFLocale.Key(IFSelectTool, "shortcut.shift"), true)
            .addKey(IFKey.Constant.META, new IFLocale.Key(IFSelectTool, "shortcut.meta"), true)
            .addKey(IFKey.Constant.OPTION, new IFLocale.Key(IFSelectTool, "shortcut.option"), true)
            .addKey(IFKey.Constant.UP, new IFLocale.Key(IFSelectTool, "shortcut.up"), false)
            .addKey(IFKey.Constant.DOWN, new IFLocale.Key(IFSelectTool, "shortcut.down"), false)
            .addKey(IFKey.Constant.LEFT, new IFLocale.Key(IFSelectTool, "shortcut.left"), false)
            .addKey(IFKey.Constant.RIGHT, new IFLocale.Key(IFSelectTool, "shortcut.right"), false);
    };

    /** @override */
    IFSelectTool.prototype.getCursor = function () {
        var cursor = IFCursor.Select;
        if (this._editorUnderMouseInfo) {
            if (this._mode == IFSelectTool._Mode.Transforming) {
                switch (this._editorUnderMouseInfo.id) {
                    case IFTransformBox.INSIDE:
                        cursor = IFCursor.SelectCross;
                        break;
                    case IFTransformBox.OUTSIDE:
                        if (this._editor.isTransformBoxActive()) {
                            cursor = IFCursor.SelectRotate[this._editorUnderMouseInfo.data];
                        }
                        break;
                    case IFTransformBox.OUTLINE:
                        cursor = this._editorUnderMouseInfo.data ? IFCursor.SelectSkewHoriz : IFCursor.SelectSkewVert;
                        break;
                    case IFTransformBox.Handles.TOP_CENTER:
                    case IFTransformBox.Handles.BOTTOM_CENTER:
                        cursor = IFCursor.SelectResizeVert;
                        break;
                    case IFTransformBox.Handles.LEFT_CENTER:
                    case IFTransformBox.Handles.RIGHT_CENTER:
                        cursor = IFCursor.SelectResizeHoriz;
                        break;
                    case IFTransformBox.Handles.TOP_LEFT:
                    case IFTransformBox.Handles.BOTTOM_RIGHT:
                        cursor = IFCursor.SelectResizeUpLeftDownRight;
                        break;
                    case IFTransformBox.Handles.TOP_RIGHT:
                    case IFTransformBox.Handles.BOTTOM_LEFT:
                        cursor = IFCursor.SelectResizeUpRightDownLeft;
                        break;
                    case IFTransformBox.Handles.ROTATION_CENTER:
                        cursor = IFCursor.SelectArrowOnly;
                        break;
                }
            } else {
                cursor = IFCursor.SelectDot;
            }
        }
        return cursor;
    };

    /** @override */
    IFSelectTool.prototype.activate = function (view) {
        IFTool.prototype.activate.call(this, view);

        view.addEventListener(GUIMouseEvent.DragStart, this._mouseDragStart, this);
        view.addEventListener(GUIMouseEvent.Drag, this._mouseDrag, this);
        view.addEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd, this);
        view.addEventListener(GUIMouseEvent.Down, this._mouseDown, this);
        view.addEventListener(GUIMouseEvent.Release, this._mouseRelease, this);
        view.addEventListener(GUIMouseEvent.Move, this._mouseMove, this);
        view.addEventListener(GUIMouseEvent.DblClick, this._mouseDblClick, this);
        view.addEventListener(GUIKeyEvent.Down, this._keyDown, this);
        view.addEventListener(GUIKeyEvent.Release, this._keyRelease, this);

        ifPlatform.addEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged, this);
    };

    /** @override */
    IFSelectTool.prototype.deactivate = function (view) {
        IFTool.prototype.deactivate.call(this, view);

        view.removeEventListener(GUIMouseEvent.DragStart, this._mouseDragStart);
        view.removeEventListener(GUIMouseEvent.Drag, this._mouseDrag);
        view.removeEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd);
        view.removeEventListener(GUIMouseEvent.Down, this._mouseDown);
        view.removeEventListener(GUIMouseEvent.Release, this._mouseRelease);
        view.removeEventListener(GUIMouseEvent.Move, this._mouseMove);
        view.removeEventListener(GUIMouseEvent.DblClick, this._mouseDblClick);
        view.removeEventListener(GUIKeyEvent.Down, this._keyDown);
        view.removeEventListener(GUIKeyEvent.Release, this._keyRelease);

        ifPlatform.removeEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged);
    };

    /** @override */
    IFSelectTool.prototype.isDeactivatable = function () {
        // cannot deactivate while having any mode set
        return !this._mode;
    };

    /** @override */
    IFSelectTool.prototype.paint = function (context) {
        if (this._mode == IFSelectTool._Mode.Select && this._hasSelectArea()) {
            var x = Math.floor(this._selectArea.getX()) + 0.5;
            var y = Math.floor(this._selectArea.getY()) + 0.5;
            var w = Math.ceil(this._selectArea.getWidth()) - 1.0;
            var h = Math.ceil(this._selectArea.getHeight()) - 1.0;
            context.canvas.strokeRect(x, y, w, h, 1, context.selectionOutlineColor);
        } else if (this._editor.isTransformBoxActive()) {
            this._editor.getTransformBox().paint(context, this._view.getWorldTransform());
        }
    };

    /**
     * @param {GUIMouseEvent.Move} event
     * @private
     */
    IFSelectTool.prototype._mouseMove = function (event) {
        this._updateEditorUnderMouse(event.client);
    };

    /**
     * @param {GUIMouseEvent.Down} event
     * @private
     */
    IFSelectTool.prototype._mouseDown = function (event) {
        // Quit if not hitting the left-mouse-button
        if (event.button !== GUIMouseEvent.BUTTON_LEFT) {
            return;
        }

        // If we have an inline editor, close it and be done with
        // it here to keep the original selection
        if (this._editor.closeInlineEditor()) {
            return;
        }

        this._elementUnderMouse = null;

        // Let editor do some work for mouse position
        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());

        if (this._mode == IFSelectTool._Mode.Transforming) {
            if (!this._editor.isTransformBoxActive()) {
                this._editor.setTransformBoxActive(true);
            }
            if (this._editor.isTransformBoxActive()) {
                // Transform box always returns non-null partInfo
                this._editorMovePartInfo = this._editor.getTransformBox().getPartInfoAt(event.client,
                    this._view.getWorldTransform(), this._scene.getProperty('pickDist'));
            }
        } else {
            // Reset to select mode here
            this._updateMode(IFSelectTool._Mode.Select);

            // We're doing a stacked hit-test when the meta is key is hold down and
            // when our manager has no temporary tool as in such case, we've been
            // activated temporarily with the meta key and should ignore the meta key.
            // When this is the case, we'll ignore hit-testing the editor(s) at all
            // and instead, go straight to hit-testing elements instead
            var stacked = ifPlatform.modifiers.metaKey && this._manager.getTemporaryActiveTool() == null;

            if (!stacked) {
                // Try to get a part of an editor, first
                var docEditor = IFElementEditor.getEditor(this._scene);
                if (docEditor) {
                    var partInfo = docEditor.getPartInfoAt(event.client, this._view.getWorldTransform(), function (editor) {
                        // Ensure to allow selected editors for part, only
                        return editor.hasFlag(IFElementEditor.Flag.Selected);
                    }.bind(this), this._scene.getProperty('pickDist'));

                    if (partInfo) {
                        var editor = partInfo.editor;
                        var partId = partInfo.id;
                        var selectable = partInfo.selectable;

                        // Only update part selection if we're either holding shift
                        // or when we didn't actually retreieve an already selected part
                        if (ifPlatform.modifiers.shiftKey || (!editor.isPartSelected(partId) && selectable)) {
                            editor.updatePartSelection(ifPlatform.modifiers.shiftKey, [partId]);
                        }

                        // Save the editor part that initiated the movement
                        if (!selectable || editor.isPartSelected(partId)) {
                            this._editorMovePartInfo = partInfo;
                        }

                        // Set mode to move
                        this._updateMode(IFSelectTool._Mode.Move);
                    }
                }
            }
        }

        // If we didn't receive an editor part then do our regular stuff here
        if (this._mode === IFSelectTool._Mode.Select) {
            var selectableElements = [];

            var elementHits = this._scene.hitTest(event.client, this._view.getWorldTransform(), null,
                stacked, -1, this._scene.getProperty('pickDist'));

            // Convert element hits if any into an array of pure elements
            // and gather the selectable elements from it
            if (elementHits) {
                var elements = [];
                for (var i = 0; i < elementHits.length; ++i) {
                    elements.push(elementHits[i].element);
                }
                selectableElements = this._getSelectableElements(elements);
            }

            if (selectableElements.length > 0) {
                // The element hit array can only contain more than one hit
                // if we're in stacked mode, otherwise it will always contain
                // approximately one (the topmost) hit element so it is safe
                // to check for the length here and act differently
                if (selectableElements.length > 1) {
                    // Iterate all of our hits and select either one deeper than
                    // than the current selection or start from the beginning
                    var lastSelIndex = null;
                    for (var i = 0; i < selectableElements.length; ++i) {
                        if (selectableElements[i].hasFlag(IFNode.Flag.Selected)) {
                            lastSelIndex = i;
                        }
                    }

                    if (lastSelIndex == null || lastSelIndex + 1 >= selectableElements.length) {
                        // Start from the beginning
                        this._editor.updateSelection(ifPlatform.modifiers.shiftKey, [selectableElements[0]]);
                    } else {
                        // Select next in order
                        this._editor.updateSelection(ifPlatform.modifiers.shiftKey, [selectableElements[lastSelIndex + 1]]);
                    }

                } else {
                    this._elementUnderMouse = selectableElements[0];

                    if (ifPlatform.modifiers.shiftKey || !this._elementUnderMouse.hasFlag(IFNode.Flag.Selected)) {
                        // Only update selection if we're either holding shift
                        // or when we didn't actually hit an already selected node
                        this._editor.updateSelection(ifPlatform.modifiers.shiftKey, [this._elementUnderMouse]);
                    } else if (this._elementUnderMouse.hasFlag(IFNode.Flag.Selected)) {
                        // As element is already selected we need to ensure to properly
                        // clear all selected parts as that is the default behavior
                        var editor = IFElementEditor.getEditor(this._elementUnderMouse);
                        if (editor) {
                            editor.updatePartSelection(false, null);
                        }
                    }

                    // Switch to move mode if there's any selection in editor
                    var selection = this._editor.getSelection();
                    if (selection && selection.length > 0) {
                        this._updateMode(IFSelectTool._Mode.Move);
                    }
                }
            } else {
                // No hit at all so update without any nodes
                this._editor.updateSelection(ifPlatform.modifiers.shiftKey, []);
            }
        }
    };

    /**
     * @param {GUIMouseEvent.Release} event
     * @private
     */
    IFSelectTool.prototype._mouseRelease = function (event) {
        // Reset some stuff in any case
        this._editorMovePartInfo = null;
        this._moveStart = null;
        this._moveStartTransformed = null;
        this._moveCurrent = null;
        if (this._mode != IFSelectTool._Mode.Transforming) {
            this._updateMode(null);
        }
        this._updateEditorUnderMouse(event.client);
    };

    /**
     * @param {GUIMouseEvent.DragStart} event
     * @private
     */
    IFSelectTool.prototype._mouseDragStart = function (event) {
        if (this._mode == IFSelectTool._Mode.Move) {
            // Save start
            this._moveStart = event.client;
            this._moveStartTransformed = this._view.getViewTransform().mapPoint(this._moveStart);

            // Switch to moving mode
            this._updateMode(IFSelectTool._Mode.Moving);
        } else if (this._mode == IFSelectTool._Mode.Transforming) {
            this._moveStart = event.client;
            this._moveStartTransformed = this._view.getViewTransform().mapPoint(this._moveStart);
            if (this._editor.isTransformBoxActive()) {
                this._editor.getTransformBox().hide();
            }
            this.invalidateArea();
        }
    };

    /**
     * @param {GUIMouseEvent.Drag} event
     * @private
     */
    IFSelectTool.prototype._mouseDrag = function (event) {
        if (this._mode == IFSelectTool._Mode.Moving || this._mode == IFSelectTool._Mode.Transforming) {
            // Save current
            this._moveCurrent = event.client;

            // Update transform
            this._updateSelectionTransform();
        } else if (this._mode == IFSelectTool._Mode.Select) {
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
    IFSelectTool.prototype._mouseDragEnd = function (event) {
        if (this._mode == IFSelectTool._Mode.Moving) {
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
            } else {
                // Holding option key when we've transformed the whole selection
                // will actually clone the current selection and apply the transformation
                // to the new selection so we'll do that here
                this._editor.applySelectionTransform(ifPlatform.modifiers.optionKey);
            }
        } else if (this._mode == IFSelectTool._Mode.Select) {
            // Check if we've selected an area
            if (this._hasSelectArea()) {
                // our area selector selected something
                var mappedSelectArea = this._view.getViewTransform().mapRect(this._selectArea);
                var x0 = mappedSelectArea.getX(), y0 = mappedSelectArea.getY();
                var x2 = x0 + mappedSelectArea.getWidth(), y2 = y0 + mappedSelectArea.getHeight();
                var collisionArea = new IFVertexContainer();
                collisionArea.addVertex(IFVertex.Command.Move, x0, y0);
                collisionArea.addVertex(IFVertex.Command.Line, x2, y0);
                collisionArea.addVertex(IFVertex.Command.Line, x2, y2);
                collisionArea.addVertex(IFVertex.Command.Line, x0, y2);
                collisionArea.addVertex(IFVertex.Command.Close, 0, 0);
                var collisions = this._scene.getCollisions(collisionArea, IFElement.CollisionFlag.GeometryBBox);
                var selectableElements = this._getSelectableElements(collisions);

                this._editor.updateSelection(ifPlatform.modifiers.shiftKey, selectableElements);

                // Invalidate to remove area selector's paint region
                var selectArea = this._selectArea;
                this._selectArea = null;
                this.invalidateArea(selectArea);
            } else {
                this._selectArea = null;
            }
        } else if (this._mode == IFSelectTool._Mode.Transforming) {
            if (ifPlatform.modifiers.optionKey && !(this._editorMovePartInfo.id >= 0 && this._editorMovePartInfo.id < 9)) {

                this._editor.applySelectionTransform(true);
            } else if (this._editorMovePartInfo.id == IFTransformBox.Handles.ROTATION_CENTER &&
                    this._editor.isTransformBoxActive()){

                this._editor.beginTransaction();
                try {
                    this._editor.getTransformBox().applyTransform();
                    this._editor.getTransformBox().show();
                } finally {
                    // TODO : I18N
                    this._editor.commitTransaction('Move');
                }
            } else {
                this._editor.applySelectionTransform();
            }
            this.invalidateArea();
        }
    };

    /**
     * @private
     */
    IFSelectTool.prototype._mouseDblClick = function () {
        var openTransformBox = true;

        // Close an existing transform box, first
        if (this._editor.isTransformBoxActive()) {
            this._editor.setTransformBoxActive(false);
            this._updateMode(null);
            this.invalidateArea();
            openTransformBox = false;
        }

        // Check whether to start inline editing
        if (this._elementUnderMouse) {
            var editor = IFElementEditor.getEditor(this._elementUnderMouse);
            if (editor && editor.canInlineEdit()) {
                if (this._editor.openInlineEditor(this._elementUnderMouse, this._view)) {
                    openTransformBox = false;
                }
            }
        }

        if (openTransformBox) {
            this._editor.setTransformBoxActive(true);
            if (this._editor.isTransformBoxActive()) {
                // Switch to transformation mode
                this._updateMode(IFSelectTool._Mode.Transforming);
                this.invalidateArea();
            }
        }
    };

    /**
     * @param {GUIKeyEvent} evt
     * @private
     */
    IFSelectTool.prototype._keyDown = function (evt) {
        if (evt.key === IFKey.Constant.UP || evt.key === IFKey.Constant.DOWN ||
            evt.key === IFKey.Constant.LEFT || evt.key === IFKey.Constant.RIGHT) {

            // Shift selection if any
            if (this._editor.hasSelection() && (!this._mode || this._mode === IFSelectTool._Mode.Moving)) {
                if (this._mode !== IFSelectTool._Mode.Moving) {
                    this._updateMode(IFSelectTool._Mode.Moving);
                }

                var crDistance = ifPlatform.modifiers.shiftKey ?
                    this._scene.getProperty('crDistBig') : this._scene.getProperty('crDistSmall');

                var dx = 0;
                var dy = 0;
                switch (evt.key) {
                    case IFKey.Constant.UP:
                        dy -= crDistance;
                        break;
                    case IFKey.Constant.DOWN:
                        dy += crDistance;
                        break;
                    case IFKey.Constant.LEFT:
                        dx -= crDistance;
                        break;
                    case IFKey.Constant.RIGHT:
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
    IFSelectTool.prototype._keyRelease = function (evt) {
        if (evt.key === IFKey.Constant.UP || evt.key === IFKey.Constant.DOWN ||
            evt.key === IFKey.Constant.LEFT || evt.key === IFKey.Constant.RIGHT) {

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
    IFSelectTool.prototype._modifiersChanged = function (event) {
        if ((event.changed.shiftKey || event.changed.optionKey) &&
            (this._mode === IFSelectTool._Mode.Moving || this._mode == IFSelectTool._Mode.Transforming)) {

            this._updateSelectionTransform();
        }
    };

    /**
     * @private
     */
    IFSelectTool.prototype._updateSelectionTransform = function () {
        if (this._mode == IFSelectTool._Mode.Moving) {
            var position = this._moveCurrent;
            if (this._editorMovePartInfo && this._editorMovePartInfo.isolated) {
                this._editor.getGuides().beginMap();
                this._editorMovePartInfo.editor.movePart(this._editorMovePartInfo.id, this._editorMovePartInfo.data,
                    position, this._view.getViewTransform(), this._editor.getGuides(), ifPlatform.modifiers.shiftKey, ifPlatform.modifiers.optionKey);
                this._editor.getGuides().finishMap();
            } else {
                if (ifPlatform.modifiers.shiftKey) {
                    // Calculate move delta by locking our vector to 45° steps starting with constraint
                    var crConstraint = this._scene.getProperty('crConstraint');
                    position = ifMath.convertToConstrain(this._moveStart.getX(), this._moveStart.getY(),
                        position.getX(), position.getY(), crConstraint);
                }

                position = this._view.getViewTransform().mapPoint(position);
                if (this._editorMovePartInfo && this._editorMovePartInfo.id &&
                    (this._editorMovePartInfo.id.type == IFPathEditor.PartType.Point ||
                        this._editorMovePartInfo.id.type == IFPathEditor.PartType.Segment)) {

                    this._editor.getGuides().beginMap();
                    position = this._editor.getGuides().mapPoint(position);

                    var moveDelta = position.subtract(this._moveStartTransformed);
                    if (this._editorMovePartInfo.id.type == IFPathEditor.PartType.Point) {
                        var moveStart = this._editorMovePartInfo.editor.getPointCoord(this._editorMovePartInfo.id.point);
                        moveDelta = position.subtract(moveStart);
                    }
                    this._editor.moveSelection(moveDelta, false,
                        this._editorMovePartInfo ? this._editorMovePartInfo.id : null, this._editorMovePartInfo ? this._editorMovePartInfo.data : null);

                    this._editor.getGuides().finishMap();
                } else {
                    var moveDelta = position.subtract(this._moveStartTransformed);
                    this._editor.moveSelection(moveDelta, true,
                        this._editorMovePartInfo ? this._editorMovePartInfo.id : null, this._editorMovePartInfo ? this._editorMovePartInfo.data : null);
                }
            }
        } else if (this._mode == IFSelectTool._Mode.Transforming) {
            if (this._editor.isTransformBoxActive() && this._moveStart) {
                var moveCurrentTransformed = this._view.getViewTransform().mapPoint(this._moveCurrent);
                this._editor.getGuides().beginMap();
                var transform = this._editor.getTransformBox().calculateTransformation(this._editorMovePartInfo,
                    this._moveStartTransformed, moveCurrentTransformed, this._editor.getGuides(),
                    ifPlatform.modifiers.optionKey, ifPlatform.modifiers.shiftKey);

                if (this._editorMovePartInfo.id != IFTransformBox.Handles.ROTATION_CENTER) {
                    this._editor.getTransformBox().setTransform(transform);
                    this._editor.transformSelection(transform, null, null);
                } else {
                    this._editor.getTransformBox().setCenterTransform(transform);
                }
                this._editor.getGuides().finishMap();
            }
            this.invalidateArea();
        }
    };

    /**
     * Called to update the current mode
     * @param {IFSelectTool._Mode} mode
     * @private
     */
    IFSelectTool.prototype._updateMode = function (mode) {
        if (mode !== this._mode) {
            this._mode = mode;
        }
    };

    /**
     * Updates the editor under given mouse client coordinates
     * @param {GPoint} mouse mouse client coordinates
     * @private
     */
    IFSelectTool.prototype._updateEditorUnderMouse = function (mouse) {
        var hasEditorInfoUnderMouse = false;

        // Hit-Test editor under mouse if not in any mode
        if (!this._mode) {
            var docEditor = IFElementEditor.getEditor(this._scene);
            if (docEditor) {
                var partInfo = docEditor.getPartInfoAt(mouse, this._view.getWorldTransform(), function (editor) {
                    // Ensure to allow selected editors for part, only
                    return editor.hasFlag(IFElementEditor.Flag.Selected);
                }.bind(this), this._scene.getProperty('pickDist'));

                if (partInfo !== this._editorUnderMouseInfo) {
                    this._editorUnderMouseInfo = partInfo;
                    hasEditorInfoUnderMouse = true;
                    this.updateCursor();
                }
            }
        } else if (this._mode == IFSelectTool._Mode.Transforming && this._editor.isTransformBoxActive()) {
            var partInfo;
            if (this._editorMovePartInfo) {
                partInfo = new IFElementEditor.PartInfo(this._editorMovePartInfo.editor, this._editorMovePartInfo.id,
                    this._editorMovePartInfo.data);
            } else {
                partInfo = this._editor.getTransformBox().getPartInfoAt(mouse,
                    this._view.getWorldTransform(), this._scene.getProperty('pickDist'));
            }
            if (partInfo.id  == IFTransformBox.OUTSIDE) {
                partInfo.data = this._editor.getTransformBox().getRotationSegment(
                    mouse, this._view.getWorldTransform());
            }
            if (!this._editorUnderMouseInfo || this._editorUnderMouseInfo.id !== partInfo.id ||
                    this._editorUnderMouseInfo.data !== partInfo.data) {

                this._editorUnderMouseInfo = partInfo;
                this.updateCursor();
            }
            hasEditorInfoUnderMouse = true;
        }

        if (!hasEditorInfoUnderMouse && this._editorUnderMouseInfo) {
            this._editorUnderMouseInfo = null;
            this.updateCursor();
        }
    };

    /**
     * Iterate and returns an array of selectable elements from
     * an source array of elements in their original order
     * @param {Array<IFElement>} elements source array of elements
     * @returns {Array<IFElement>} array of selectable elements or
     * an empty array for none
     * @private
     */
    IFSelectTool.prototype._getSelectableElements = function (elements) {
        var selectableElements = [];
        for (var i = 0; i < elements.length; ++i) {
            var selectableElement = this._getSelectableElement(elements[i]);
            if (selectableElement && selectableElements.indexOf(selectableElement) < 0) {
                selectableElements.push(selectableElement);
            }
        }
        return selectableElements;
    };

    /**
     * Returns the selectable element out of an given one or null
     * if the given one is not selectable at all.
     * @param {IFElement} element
     * @return {IFElement}
     * @private
     */
    IFSelectTool.prototype._getSelectableElement = function (element) {
        // By default, we allow only items to be selected.
        // Furthermore, we'll iterate up until we'll find the root
        // item residing within anything else than another item
        for (var p = element; p !== null; p = p.getParent()) {
            if (p instanceof IFItem && (!p.getParent() || !(p.getParent() instanceof IFItem))) {
                return p;
            }
        }

        return null;
    };

    /** @private **/
    IFSelectTool.prototype._hasSelectArea = function () {
        return (this._selectArea && (this._selectArea.getHeight() > 0 || this._selectArea.getWidth() > 0));
    };

    /** override */
    IFSelectTool.prototype.toString = function () {
        return "[Object IFSelectTool]";
    };

    _.IFSelectTool = IFSelectTool;
})(this);