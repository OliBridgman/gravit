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
     * @type {IFRect}
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
     * @type {IFPoint}
     * @private
     */
    IFSelectTool.prototype._keyDelta = null;

    /**
     * The start position of moving
     * @type {IFPoint}
     * @private
     */
    IFSelectTool.prototype._moveStart = null;
    IFSelectTool.prototype._moveStartTransformed = null;

    /**
     * The current position of moving
     * @type {IFPoint}
     * @private
     */
    IFSelectTool.prototype._moveCurrent = null;

    /**
     * An array of vusial lines ends, which are used to show snap zones
     * @type {Array<Array<IFPoint>>} - line ends in view coordinates
     * @private
     */
    IFSelectTool.prototype._visuals = null;

    /**
     * Area, which is used for painting and cleaning lines of snap zones
     * @type {IFRect} - visuals area in view coordinates
     * @private
     */
    IFSelectTool.prototype._visualsArea = null;

    /** @override */
    IFSelectTool.prototype.getCursor = function () {
        return this._editorUnderMouseInfo ? IFCursor.SelectDot : IFCursor.Select;
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
        if (this._visualsArea) {
            this.invalidateArea(this._visualsArea);
            this._visualsArea = null;
        }

        if (this._mode === IFSelectTool._Mode.Transforming) {
            this._closeTransformBox();
        }

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

        IFTool.prototype.deactivate.call(this, view);
    };

    /** @override */
    IFSelectTool.prototype.isDeactivatable = function () {
        // cannot deactivate while having any mode set except
        // if in transforming mode which will de-activate the transform mode
        // in our deactivate event
        return !this._mode || this._mode === IFSelectTool._Mode.Transforming;
    };

    /** @override */
    IFSelectTool.prototype.paint = function (context) {
        if (this._mode == IFSelectTool._Mode.Select && this._hasSelectArea()) {
            var x = Math.floor(this._selectArea.getX()) + 0.5;
            var y = Math.floor(this._selectArea.getY()) + 0.5;
            var w = Math.ceil(this._selectArea.getWidth()) - 1.0;
            var h = Math.ceil(this._selectArea.getHeight()) - 1.0;
            context.canvas.strokeRect(x, y, w, h, 1, context.selectionOutlineColor);
        }
        if (this._visuals) {
            var visLine;
            for (var i = 0; i < this._visuals.length; ++i) {
                visLine = this._visuals[i];
                var pt0 = visLine[0];
                var pt1 = visLine[1];
                context.canvas.strokeLine(Math.floor(pt0.getX()) + 0.5, Math.floor(pt0.getY()) + 0.5,
                    Math.floor(pt1.getX()) + 0.5, Math.floor(pt1.getY()) + 0.5, 1, context.highlightOutlineColor);
            }

            this._visuals = null;
        }
    };

    /**
     * @param {GUIMouseEvent.Move} event
     * @private
     */
    IFSelectTool.prototype._mouseMove = function (event) {
        var sceneEditor = IFElementEditor.getEditor(this._scene);
        if (sceneEditor && sceneEditor.isTransformBoxActive()) {
            this._updateMode(IFSelectTool._Mode.Transforming);
        }
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

        var sceneEditor = IFElementEditor.getEditor(this._scene);
        if (sceneEditor && sceneEditor.isTransformBoxActive()) {
            if (this._mode != IFSelectTool._Mode.Transforming) {
                this._updateMode(IFSelectTool._Mode.Transforming);
            }
            // Transform box always returns non-null partInfo
            this._editorMovePartInfo = sceneEditor.getTBoxPartInfoAt(event.client,
                this._view.getWorldTransform(), this._scene.getProperty('pickDist'));
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
            // Test selection at first, and if hit, leave it as is
            var selection = this._editor.getSelection();
            var selectableElements = [];
            var element;
            var hitRes = null;
            if (selection && selection.length && !stacked) {
                for (var i = 0; i < selection.length && !hitRes; ++i) {
                    if (selection[i] instanceof IFElement) {
                        element = selection[i];
                        hitRes = element.hitTest(event.client, this._view.getWorldTransform(), null,
                            stacked, -1, this._scene.getProperty('pickDist'), true);
                    }
                }
            }
            if (hitRes) {
                selectableElements.push(element);
            } else {
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
                    selection = this._editor.getSelection();
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
        if (this._visualsArea) {
            this.invalidateArea(this._visualsArea);
            this._visualsArea = null;
        }
        var sceneEditor = IFElementEditor.getEditor(this._scene);
        if (sceneEditor && sceneEditor.isTransformBoxActive()) {
            if (this._mode != IFSelectTool._Mode.Transforming) {
                sceneEditor.setTransformBoxActive(false);
                this._updateMode(null);
            }
        } else if (this._mode == IFSelectTool._Mode.Transforming) {
            this._updateMode(null);
        }

        if (this._mode == IFSelectTool._Mode.Move) {
            // Save start
            this._moveStart = event.client;
            this._moveStartTransformed = this._view.getViewTransform().mapPoint(this._moveStart);

            // Switch to moving mode
            this._updateMode(IFSelectTool._Mode.Moving);
        } else if (this._mode == IFSelectTool._Mode.Transforming) {
            this._moveStart = event.client;
            this._moveStartTransformed = this._view.getViewTransform().mapPoint(this._moveStart);
            sceneEditor.startTBoxTransform(this._editorMovePartInfo);
        }
    };

    /**
     * @param {GUIMouseEvent.Drag} event
     * @private
     */
    IFSelectTool.prototype._mouseDrag = function (event) {
        if (this._mode == IFSelectTool._Mode.Transforming) {
            var sceneEditor = IFElementEditor.getEditor(this._scene);
            if (!sceneEditor || !sceneEditor.isTransformBoxActive()) {
                this._updateMode(null);
            }
        }

        if (this._mode == IFSelectTool._Mode.Moving || this._mode == IFSelectTool._Mode.Transforming) {
            // Save current
            this._moveCurrent = event.client;

            // Update transform
            this._updateSelectionTransform();
        } else if (this._mode == IFSelectTool._Mode.Select) {
            if (this._hasSelectArea()) {
                this.invalidateArea(this._selectArea);
            }

            this._selectArea = IFRect.fromPoints(event.clientStart, event.client);

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
                var collisions = this._scene.getCollisions(collisionArea,
                    IFElement.CollisionFlag.GeometryBBox | IFElement.CollisionFlag.Partial);
                var selectableElements = this._getSelectableElements(collisions);

                this._editor.updateSelectionUnderCollision(ifPlatform.modifiers.shiftKey,
                    selectableElements, collisionArea);

                // Invalidate to remove area selector's paint region
                var selectArea = this._selectArea;
                this._selectArea = null;
                this.invalidateArea(selectArea);
            } else {
                this._selectArea = null;
            }
        } else if (this._mode == IFSelectTool._Mode.Transforming) {
            var sceneEditor = IFElementEditor.getEditor(this._scene);
            if (sceneEditor && sceneEditor.isTransformBoxActive()) {
                sceneEditor.applyTBoxTransform(ifPlatform.modifiers.optionKey);
                this.invalidateArea();
            }
        }
    };

    /**
     * @param {GUIMouseEvent.DblClick} event
     * @private
     */
    IFSelectTool.prototype._mouseDblClick = function (event) {
        // Close an existing transform box, first
        if (!this._closeTransformBox()) {
            var openTransformBox = true;

            // Check whether to start inline editing
            if (this._elementUnderMouse) {
                if (this._editor.openInlineEditor(this._elementUnderMouse, this._view, event.client)) {
                    openTransformBox = false;
                }
            }

            if (openTransformBox) {
                this._openTransformBox();
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

                this._keyDelta = this._keyDelta ? this._keyDelta.add(new IFPoint(dx, dy)) : new IFPoint(dx, dy);
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
        var sceneEditor = IFElementEditor.getEditor(this._scene);
        if (sceneEditor && sceneEditor.isTransformBoxActive()) {
            if (this._mode != IFSelectTool._Mode.Transforming) {
                this._updateMode(IFSelectTool._Mode.Transforming);
            }
        } else if (this._mode == IFSelectTool._Mode.Transforming) {
            this._updateMode(null);
        }

        if ((event.changed.shiftKey || event.changed.optionKey || event.changed.metaKey) &&
            (this._mode === IFSelectTool._Mode.Moving || this._mode == IFSelectTool._Mode.Transforming)) {

            this._updateSelectionTransform();
        }
    };

    /**
     * Close the transform box if it is open
     * @return {Boolean} true if a transform box was opened and got
     * closed, false if not
     * @private
     */
    IFSelectTool.prototype._closeTransformBox = function () {
        var sceneEditor = IFElementEditor.getEditor(this._scene);
        if (sceneEditor && sceneEditor.isTransformBoxActive()) {
            sceneEditor.setTransformBoxActive(false);
            this._updateMode(null);
            this.invalidateArea();
            this.updateCursor();
            return true;
        }
        return false;
    };

    /**
     * Open the transform box if it is not yet open
     * @private
     */
    IFSelectTool.prototype._openTransformBox = function () {
        var sceneEditor = IFElementEditor.getEditor(this._scene);
        sceneEditor = sceneEditor ? sceneEditor : IFElementEditor.openEditor(this._scene);
        sceneEditor.setTransformBoxActive(true);
        if (sceneEditor.isTransformBoxActive()) {
            // Switch to transformation mode
            this._updateMode(IFSelectTool._Mode.Transforming);
        }
    };

    /**
     * @private
     */
    IFSelectTool.prototype._updateSelectionTransform = function () {
        if (this._mode == IFSelectTool._Mode.Moving) {
            var position = this._moveCurrent;
            if (this._editorMovePartInfo && this._editorMovePartInfo.isolated) {
                var exclusion = this._editor.getSelection();
                if (this._editorMovePartInfo.id === IFBlockEditor.RESIZE_HANDLE_PART_ID) {
                    exclusion = [];
                    exclusion = exclusion.concat(this._editor.getSelection());
                    var elem = this._editorMovePartInfo.editor.getElement();
                    for (var i = 0; i < exclusion.length && elem != exclusion[i]; ++i) {
                    }
                    if (i < exclusion.length && elem == exclusion[i]) {
                        exclusion = exclusion.splice(i, 1);
                    }
                }
                this._editor.getGuides().getShapeBoxGuide().useExclusions(exclusion);
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
                    this._editor.getGuides().finishMap();

                    var moveDelta = position.subtract(this._moveStartTransformed);
                    if (this._editorMovePartInfo.id.type == IFPathEditor.PartType.Point) {
                        var moveStart = this._editorMovePartInfo.editor.getPointCoord(this._editorMovePartInfo.id.point);
                        moveDelta = position.subtract(moveStart);
                    }
                    this._editor.moveSelection(moveDelta, false,
                        this._editorMovePartInfo ? this._editorMovePartInfo.id : null, this._editorMovePartInfo ? this._editorMovePartInfo.data : null);

                } else {
                    var moveDelta = position.subtract(this._moveStartTransformed);
                    this._editor.moveSelection(moveDelta, true,
                        this._editorMovePartInfo ? this._editorMovePartInfo.id : null,
                        this._editorMovePartInfo ? this._editorMovePartInfo.data : null,
                        this._moveStartTransformed);
                }
            }
        } else if (this._mode == IFSelectTool._Mode.Transforming) {
            var sceneEditor = IFElementEditor.getEditor(this._scene);
            if (sceneEditor && sceneEditor.isTransformBoxActive() && this._moveStart) {
                var moveCurrentTransformed = this._view.getViewTransform().mapPoint(this._moveCurrent);
                sceneEditor.transformTBox(this._moveStartTransformed, moveCurrentTransformed,
                    ifPlatform.modifiers.optionKey, ifPlatform.modifiers.shiftKey);

                this.invalidateArea();
            }
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
     * @param {IFPoint} mouse mouse client coordinates
     * @private
     */
    IFSelectTool.prototype._updateEditorUnderMouse = function (mouse) {
        var hasEditorInfoUnderMouse = false;
        this._visuals = null;

        if (this._mode == IFSelectTool._Mode.Transforming) {
            var sceneEditor = IFElementEditor.getEditor(this._scene);
            if (sceneEditor && sceneEditor.isTransformBoxActive()) {
                if (this._editorUnderMouseInfo) {
                    this._editorUnderMouseInfo = null;
                }
                sceneEditor.updateTBoxUnderMouse(mouse, this._view.getWorldTransform(), this._view);
                hasEditorInfoUnderMouse = true;
            } else {
                this._updateMode(null);
            }
        }

        // Hit-Test editor under mouse if not in any mode
        var partInfo = null;
        if (!this._mode) {
            var docEditor = IFElementEditor.getEditor(this._scene);
            if (docEditor) {
                partInfo = docEditor.getPartInfoAt(mouse, this._view.getWorldTransform(), function (editor) {
                    // Ensure to allow selected editors for part, only
                    return editor.hasFlag(IFElementEditor.Flag.Selected);
                }.bind(this), this._scene.getProperty('pickDist'));

                if (partInfo !== this._editorUnderMouseInfo) {
                    this._editorUnderMouseInfo = partInfo;
                    hasEditorInfoUnderMouse = true;
                    this.updateCursor();
                }
            }
        }

        var bBox = null;
        this._visuals = null;
        if (!this._mode && !partInfo || this._mode == IFSelectTool._Mode.Select) {
            var selection = this._editor.getSelection();
            var selectableElements = [];
            var item;
            var hitRes = null;
            var stacked = false;
            if (selection && selection.length == 1 && selection[0] instanceof IFItem) {
                hitRes = selection[0].hitTest(mouse, this._view.getWorldTransform(), null,
                    stacked, -1, this._scene.getProperty('pickDist'), true);
                if (hitRes) {
                    item = selection[0];
                }
            }
            if (!item) {
                var elementHits = this._scene.hitTest(mouse, this._view.getWorldTransform(), null,
                    stacked, -1, this._scene.getProperty('pickDist'));

                if (elementHits && elementHits.length) {
                    for (var i = 0; i < elementHits.length && !item; ++i) {
                        if (elementHits[i].element instanceof IFItem && !elementHits[i].element.hasFlag(IFNode.Flag.Selected)) {
                            item = elementHits[i].element;
                        }
                    }
                }
            }
            if (item) {
                bBox = item.getGeometryBBox();
                if (bBox && !bBox.isEmpty()) {
                    bBox = this._view.getWorldTransform().mapRect(bBox);
                    var visuals = this._editor.getGuides().getBBoxSnapZones(bBox, mouse);
                    if (visuals && visuals.length) {
                        this._visuals = visuals;
                    }
                }
            }
        }

        if (!hasEditorInfoUnderMouse && this._editorUnderMouseInfo) {
            this._editorUnderMouseInfo = null;
            this.updateCursor();
        }

        var visualsArea = this._visuals ? bBox.expanded(2, 2, 2, 2) : null;
        if (this._visualsArea || visualsArea) {
            if (this._visualsArea) {
                this.invalidateArea(this._visualsArea);
            }
            if (visualsArea) {
                this.invalidateArea(visualsArea);
            }
            this._visualsArea = visualsArea;
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