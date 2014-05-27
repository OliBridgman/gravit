(function (_) {
    /**
     * The base tool for path creating tools
     * @class IFPathTool
     * @extends IFTool
     * @constructor
     * @version 1.0
     */
    function IFPathTool() {
        IFTool.call(this);
    }

    IFObject.inherit(IFPathTool, IFTool);

    /**
     * Reference to the edited path
     * @type {IFPath}
     * @private
     */
    IFPathTool.prototype._pathRef = null;

    /**
     * Reference to the edited path preview
     * @type {IFPath}
     * @private
     */
    IFPathTool.prototype._dpathRef = null;

    /**
     * Indicates if a new point is created for this._editPt
     * @type {Boolean}
     * @private
     */
    IFPathTool.prototype._newPoint = null;

    /**
     * Contains reference to preview anchor point to edit
     * @type {IFPathBase.AnchorPoint}
     * @private
     */
    IFPathTool.prototype._editPt = null;

    /**
     * Contains reference to original path anchor point to edit in place
     * @type {IFPathBase.AnchorPoint}
     * @private
     */
    IFPathTool.prototype._refPt = null;

    /**
     * Contains reference to an editor of the currently edited path
     * @type {IFPathEditor}
     * @private
     */
    IFPathTool.prototype._pathEditor = null;

    /**
     * Indicates if the mouse released (all buttons)
     * @type {boolean}
     * @private
     */
    IFPathTool.prototype._released = true;

    /**
     * Indicates if the mouse drag started (all buttons)
     * @type {boolean}
     * @private
     */
    IFPathTool.prototype._dragStarted = false;

    /**
     * Contains reference to original path anchor point (if exists) for the case when it's preview is moving
     * @type {IFPathBase.AnchorPoint}
     * @private
     */
    IFPathTool.prototype._dragStartPt = null;

    /**
     * Indicates if option key is pressed the first time with current mouse down.
     * This makes difference when updating point's existing handles with the pen tool
     * @type {boolean}
     * @private
     */
    IFPathTool.prototype._firstAlt = false;

    /**
     * Possible transaction types
     * @enum
     */
    IFPathTool.Transaction = {
        NoTransaction: 0,
        InsertPoint: 1,
        AppendPoint: 2,
        MovePoint: 3,
        DeletePoint: 4,
        ModifyPointProperties: 5,
        ModifyPathProperties: 6,
        InsertElement: 7
    };

    /**
     * Stores transaction type between transaction begin and end, or indicates that no transaction is started
     * @type {IFPathTool.Transaction}
     * @private
     */
    IFPathTool.prototype._transactionType = IFPathTool.Transaction.NoTransaction;

    /**
     * Possible working modes of Path Tool
     * @type {{Append: number, Prepend: number, Edit: number}}
     */
    IFPathTool.Mode = {
        Append: 0,
        Prepend: 1,
        Edit: 2
    };

    /**
     * The current working mode
     * @type {IFPathTool.Mode}
     * @private
     */
    IFPathTool.prototype._mode = IFPathTool.Mode.Append;

    /**
     * Time in milliseconds of the last mouse down event since 1 Jan 1970.
     * Used to support properly double-clicks
     * @type {number}
     * @private
     */
    IFPathTool.prototype._mDownTime = 0;

    /**
     * Time in milliseconds, which is used to distinguish two single clicks from double-click
     * @type {number}
     */
    IFPathTool.DBLCLICKTM = 300;

    /**
     * Current active cursor
     * @type {IFCursor}
     * @private
     */
    IFPathTool.prototype._cursor = null;

    /**
     * Stores the details of the last mouse event, which leaves tool in the state, when it may be needed to
     * update point's properties is Shift key goes down or up
     * @type {GUIMouseEvent}
     * @private
     */
    IFPathTool.prototype._lastMouseEvent = null;

    /**
     * Indicates if deactivation will not break internal tool's logic
     * Deactivation is not allowed while mouse is pressed.
     * @type {boolean}
     * @private
     */
    IFPathTool.prototype._deactivationAllowed = true;

    /** @override */
    IFPathTool.prototype.getHint = function () {
        return IFTool.prototype.getHint.call(this)
            .addKey(IFKey.Constant.TAB, new IFLocale.Key(IFPathTool, "shortcut.tab"));
    };

    /** @override */
    IFPathTool.prototype.getCursor = function () {
        return this._cursor;
    };

    /** @override */
    IFPathTool.prototype.activate = function (view) {
        IFTool.prototype.activate.call(this, view);

        view.addEventListener(GUIMouseEvent.Down, this._mouseDown, this);
        view.addEventListener(GUIMouseEvent.Release, this._mouseRelease, this);
        view.addEventListener(GUIKeyEvent.Down, this._keyDown, this);
        gPlatform.addEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged, this);

        this._cursor = IFCursor.PenStart;
        this._transactionType = IFPathTool.Transaction.NoTransaction;
        this._initialSelectCorrection();
    };

    /** @override */
    IFPathTool.prototype.deactivate = function (view) {
        if (this._newPoint || this._dpathRef) {
            this._pathEditor.requestInvalidation();
            this._pathEditor.releasePathPreview();
            this._pathEditor.requestInvalidation();
        }
        this._finishTransaction();
        this._allowDeactivation();
        this._reset();
        IFTool.prototype.deactivate.call(this, view);

        view.removeEventListener(GUIMouseEvent.Down, this._mouseDown);
        view.removeEventListener(GUIMouseEvent.Release, this._mouseRelease);
        view.removeEventListener(GUIKeyEvent.Down, this._keyDown);
        gPlatform.removeEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged);
    };

    /** @override */
    IFPathTool.prototype.isDeactivatable = function () {
        return this._deactivationAllowed;
    };

    /**
     * Remove deactivation blocking flag if any
     * @private
     */
    IFPathTool.prototype._allowDeactivation = function () {
        this._deactivationAllowed = true;
    };

    /**
     * Mark that deactivation should be blocked
     * @private
     */
    IFPathTool.prototype._blockDeactivation = function () {
        this._deactivationAllowed = false;
    };

    /**
     * Stores a reference to an editor of the selected path, if any
     * @private
     */
    IFPathTool.prototype._checkPathEditor = function () {
        var path = this._editor.getPathSelection();
        if (path) {
            this._pathEditor = IFElementEditor.openEditor(path);
            this._pathEditor.setFlag(IFElementEditor.Flag.Detail);
        }
    };

    /**
     * Defines current working mode
     * @private
     */
    IFPathTool.prototype._checkMode = function () {
        this._checkPathEditor();
        if (!this._pathEditor) {
            this._mode = IFPathTool.Mode.Append;
            this._pathRef = null;
        } else {
            this._pathRef = this._pathEditor.getPath();
            if (this._pathRef.getProperty('closed')) {
                this._mode = IFPathTool.Mode.Edit;
            } else {
                var selType = this._pathEditor.getPointsSelectionType();
                if (selType == IFPathEditor.PointsSelectionType.No ||
                    selType == IFPathEditor.PointsSelectionType.Several ||
                    selType == IFPathEditor.PointsSelectionType.Middle) {

                    this._mode = IFPathTool.Mode.Edit;
                } else if (selType == IFPathEditor.PointsSelectionType.Last) {
                    this._mode = IFPathTool.Mode.Append;
                } else if (selType == IFPathEditor.PointsSelectionType.First) {
                    this._mode = IFPathTool.Mode.Prepend;
                }
            }
        }
    };

    /**
     * Reset selected path points if needed and set selection to the last point,
     * if selection was changed by temporary tool, and the path continued extension is indicated in path editor
     * @private
     */
    IFPathTool.prototype._initialSelectCorrection = function () {
        this._checkPathEditor();
        if (this._pathEditor) {
            this._pathRef = this._pathEditor.getPath();
            if (this._pathRef.getProperty('closed')) {
                this._pathEditor.setActiveExtendingMode(false);
            } else if (this._pathEditor.isActiveExtendingMode()) {
                var selType = this._pathEditor.getPointsSelectionType();
                if (selType != IFPathEditor.PointsSelectionType.Last &&
                        selType != IFPathEditor.PointsSelectionType.First) {

                    this._pathEditor.selectOnePoint(this._pathRef.getAnchorPoints().getLastChild());
                }
                this._cursor = IFCursor.Pen;
            }
        }
    };

    /**
     * Updates internal links to path preview to be consistent with currently edited path
     * @private
     */
    IFPathTool.prototype._renewPreviewLink = function () {
        if (!this._pathEditor) {
            this._dpathRef = null;
        } else {
            this._dpathRef = this._pathEditor.getPathPreview();
        }
    };

    /**
     * Updates position of edited point, takes into account shiftKey and mode
     * @param {GPoint} clickPt - coordinates to be used for new position in view system
     * @private
     */
    IFPathTool.prototype._updatePoint = function (clickPt) {
        var newPos = null;
        if (this._pathRef && this._editPt) {
            if (this._mode != IFPathTool.Mode.Edit) {
                newPos = this._constrainIfNeeded(clickPt, this._view.getWorldTransform(), this._pathRef);
            } else {
                newPos = this._constrainIfNeeded(clickPt, this._view.getWorldTransform(),
                    this._pathRef, this._dpathRef.getAnchorPoints().getPreviousPoint(this._editPt));
            }
            this._editor.getGuides().beginMap();

            newPos = this._view.getWorldTransform().mapPoint(
                this._editor.getGuides().mapPoint(
                    this._view.getViewTransform().mapPoint(newPos)));

            this._pathEditor.movePoint(this._editPt, newPos, this._view.getWorldTransform(), this._dragStartPt);
            this._editor.getGuides().finishMap();
        }
        return newPos;
    };

    /**
     * Adds new anchor point to the end of edited path. Creates a new path with one point,
     * if no path is selected for editing
     * @param {IFPathBase.AnchorPoint} anchorPt - new anchor point to add into path in scene or path native coordinates
     * @param {Boolean} draft - indicates if the path itself or path preview should be used for point insertion
     * @param {Boolean} nativeCoord - indicates if the new point already in path native coordinates
     * @param {Boolean} oldPreviewSelection - if set, don't update previous preview point
     * @private
     */
    IFPathTool.prototype._addPoint = function (anchorPt, draft, nativeCoord, oldPreviewSelection) {
        if (!oldPreviewSelection) {
            anchorPt.setFlag(IFNode.Flag.Selected);
        }
        if (this._pathEditor && !nativeCoord) {
            var transform = this._pathRef.getTransform();
            if (transform) {
                var location = new GPoint(anchorPt.getProperty('x'), anchorPt.getProperty('y'));
                location = transform.inverted().mapPoint(location);
                anchorPt.setProperties(['x', 'y'], [location.getX(), location.getY()]);
            }
        }
        if (draft) {
            if (!this._pathEditor) {
                this._startTransaction(IFPathTool.Transaction.InsertElement);
                this._createAndAppendPath(anchorPt);
                this._pathEditor.selectOnePoint(anchorPt);
                this._checkMode();
                this._renewPreviewLink();
                this._editPt = this._dpathRef.getAnchorPoints().getLastChild();
                this._pathEditor.requestInvalidation();
                this._pathEditor.setActiveExtendingMode(true);
            } else {
                this._pathEditor.requestInvalidation();
                if (this._mode == IFPathTool.Mode.Append) {
                    if (!oldPreviewSelection) {
                        this._dpathRef.getAnchorPoints().getLastChild().removeFlag(IFNode.Flag.Selected);
                    }
                    this._dpathRef.getAnchorPoints().appendChild(anchorPt);
                    this._editPt = this._dpathRef.getAnchorPoints().getLastChild();
                    this._newPoint = true;
                    this._pathEditor.setActiveExtendingMode(true);
                } else if (this._mode == IFPathTool.Mode.Prepend) {
                    if (!oldPreviewSelection) {
                        this._dpathRef.getAnchorPoints().getFirstChild().removeFlag(IFNode.Flag.Selected);
                    }
                    this._dpathRef.getAnchorPoints().insertChild(anchorPt, this._dpathRef.getAnchorPoints().getFirstChild());
                    this._pathEditor.shiftPreviewTable(1);
                    this._editPt = this._dpathRef.getAnchorPoints().getFirstChild();
                    this._newPoint = true;
                    this._pathEditor.setActiveExtendingMode(true);
                }
                this._pathEditor.requestInvalidation();
            }
        } else {
            if (!this._pathEditor) {
                this._startTransaction(IFPathTool.Transaction.InsertElement);
                this._createAndAppendPath(anchorPt);
                this._pathEditor.selectOnePoint(anchorPt);
                this._checkMode();
                this._renewPreviewLink();
                this._pathEditor.requestInvalidation();
                this._pathEditor.setActiveExtendingMode(true);
            } else {
                this._pathEditor.requestInvalidation();
                if (this._mode == IFPathTool.Mode.Append) {
                    this._pathEditor.releasePathPreview(); // we release preview here, as base path will be modified
                    this._pathEditor.requestInvalidation();
                    this._startTransaction(IFPathTool.Transaction.AppendPoint);
                    this._pathRef.getAnchorPoints().appendChild(anchorPt);
                    this._pathEditor.selectOnePoint(anchorPt);
                    this._pathEditor.setActiveExtendingMode(true);
                } else if (this._mode == IFPathTool.Mode.Prepend) {
                    this._pathEditor.releasePathPreview(); // we release preview here, as base path will be modified
                    this._pathEditor.requestInvalidation();
                    this._startTransaction(IFPathTool.Transaction.AppendPoint);
                    this._pathRef.getAnchorPoints().insertChild(anchorPt, this._pathRef.getAnchorPoints().getFirstChild());

                    this._pathEditor.selectOnePoint(anchorPt);
                    this._pathEditor.setActiveExtendingMode(true);
                }
                this._pathEditor.requestInvalidation();
            }
        }
    };

    /**
     * Used at the end of any of edit action. Releases path preview, invalidates area
     * and cleans all the saved data relevant to edited path
     * @private
     */
    IFPathTool.prototype._commitChanges = function () {
        this._pathEditor.requestInvalidation();
        this._pathEditor.releasePathPreview();
        this._pathEditor.requestInvalidation();
        this._reset();
    };

    /**
     * Create a path shape with one point, and adds it for rendering
     * @param {IFPathBase.AnchorPoint} apt - new anchor point to create path from
     * @private
     */
    IFPathTool.prototype._createAndAppendPath = function (apt) {
        var path = new IFPath();
        path.getAnchorPoints().appendChild(apt);
        apt.setFlag(IFNode.Flag.Selected);
        path.setFlag(IFNode.Flag.Selected);
        this._editor.insertElements([path], false, true);
        this._checkPathEditor();
    };

    /**
     * @param {GUIMouseEvent.Down} event
     * @private
     */
    IFPathTool.prototype._mouseDown = function (event) {
        this._released = false;
    };

    /**
     * @param {GUIMouseEvent.DblClick} event
     * @private
     */
    IFPathTool.prototype._mouseDblClick = function (event) {
        this._lastMouseEvent = null;
        this._checkMode();
        if (this._pathEditor) {
            this._pathEditor.updatePartSelection(false);
            this._pathEditor.setActiveExtendingMode(false);
            this._commitChanges();
        }
        this._mode = IFPathTool.Mode.Edit;
        this._setCursorForPosition(null, event.client);
        //this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
    };

    /**
     * @param {GUIMouseEvent.Release} event
     * @private
     */
    IFPathTool.prototype._mouseRelease = function (event) {
        this._released = true;
        this._dragStarted = false;
        this._dragStartPt = null;
    };

    /**
     * Reset the tool i.e. when done or canceling
     * @private
     */
    IFPathTool.prototype._reset = function () {
        if (this._pathEditor) {
            this._pathEditor.removeFlag(IFElementEditor.Flag.Detail);
        }
        this._dpathRef = null;
        this._pathRef = null;
        this._pathEditor = null;
        this._newPoint = false;
        this._editPt = null;
        this._dragStartPt = null;
        this._refPt = null;
    };

    /**
     * @param {GUIKeyEvent} event
     * @private
     */
    IFPathTool.prototype._keyDown = function (event) {
        if (event.key === IFKey.Constant.TAB) {
            this._lastMouseEvent = null;
            this._tabAction();
        }
    };

    /**
     * @param {GUIPlatform.ModifiersChangedEvent} event
     * @private
     */
    IFPathTool.prototype._modifiersChanged = function (event) {
        if (event.changed.shiftKey && this._lastMouseEvent) {
            if (!this._released) {
                this._mouseDrag(this._lastMouseEvent);
            } else {
                this._mouseMove(this._lastMouseEvent);
            }
        }
        if (event.changed.optionKey) {
            this._firstAlt = false;
            if (!this._released) {
                if (gPlatform.modifiers.optionKey) {
                    this._firstAlt = !this._dragStarted;
                }
                this._mouseDrag(this._lastMouseEvent);
            }
        }
    };

    /**
     * Finish path editing and deselect a path if TAB is pressed
     * @private
     */
    IFPathTool.prototype._tabAction = function () {
        // Action should be taken only if mouse released
        if (this._released) {
            this._checkMode();
            if (this._pathEditor) {
                this._pathEditor.updatePartSelection(false);
                this._pathEditor.setActiveExtendingMode(false);
                this._pathRef.removeFlag(IFNode.Flag.Selected);
                this._commitChanges();
            }
            this._setCursorForPosition(IFCursor.PenStart);
        }
    };

    /**
     * If Shift key is pressed, finds the point, which should be used as a base to constrain location with,
     * and calculates a new location
     * @param {GPoint} pt - original point
     * @param {GTransform} transform - a transformation to apply to base point before using it for constraining
     * @param {IFPath} path - a path to look for base point; used only if no orientation point is passed
     * @param {IFPathBase.AnchorPoint} orientPt - orientation anchor point to be used as a base to constrain location with,
     * may be null
     * @returns {GPoint} - original or newly created bounded point
     * @private
     */
    IFPathTool.prototype._constrainIfNeeded = function (pt, transform, path, orientPt) {
        var constrPt = pt;

        if (gPlatform.modifiers.shiftKey) {
            var otherPt = null;
            if (orientPt) {
                otherPt = orientPt;
            } else if (path) {
                if (this._mode == IFPathTool.Mode.Append) {
                    otherPt = path.getAnchorPoints().getLastChild();
                } else if (this._mode == IFPathTool.Mode.Prepend) {
                    otherPt = path.getAnchorPoints().getFirstChild();
                }
            }

            if (otherPt) {
                constrPt = this._pathEditor.constrainPosition(pt, transform, otherPt);
            }
        }
        return constrPt;
    };

    /**
     * Makes a point the only selected and updates preview accordingly
     * @param {IFPathBase.AnchorPoint} anchorPt - anchor point, which should be made major
     * @private
     */
    IFPathTool.prototype._makePointMajor = function (anchorPt) {
        this._pathEditor.selectOnePoint(anchorPt);
        this._dpathRef = null;
        this._pathEditor.releasePathPreview();
        this._pathEditor.requestInvalidation();
        this._dpathRef = this._pathEditor.getPathPreview(false, anchorPt);
    };

    /**
     * Starts transaction, if it was not started earlier, updates this._transactionType
     * @param {IFPathTool.Transaction} transactionType - transaction type of the current transaction to be set
     * @private
     */
    IFPathTool.prototype._startTransaction = function (transactionType) {
        if (this._transactionType == IFPathTool.Transaction.NoTransaction) {
            this._editor.beginTransaction();
        }
        this._transactionType = transactionType;
    };

    /**
     * Commit transaction if it was started, sets this._transactionType to IFPathTool.Transaction.NoTransaction
     * @private
     */
    IFPathTool.prototype._finishTransaction = function () {
        try {
            switch (this._transactionType) {
                case IFPathTool.Transaction.AppendPoint:
                    // TODO : I18N
                    this._editor.commitTransaction('Append Point');
                    break;
                case IFPathTool.Transaction.InsertElement:
                    // TODO : I18N
                    this._editor.commitTransaction('Insert Element(s)');
                    break;
                case IFPathTool.Transaction.InsertPoint:
                    // TODO : I18N
                    this._editor.commitTransaction('Insert Point');
                    break;
                case IFPathTool.Transaction.MovePoint:
                    // TODO : I18N
                    this._editor.commitTransaction('Move Point');
                    break;
                case IFPathTool.Transaction.DeletePoint:
                    // TODO : I18N
                    this._editor.commitTransaction('Delete Point');
                    break;
                case IFPathTool.Transaction.ModifyPointProperties:
                    // TODO : I18N
                    this._editor.commitTransaction('Modify Point Properties');
                    break;
                case IFPathTool.Transaction.ModifyPathProperties:
                    // TODO : I18N
                    this._editor.commitTransaction('Modify Path Properties');
                    break;
            }
        } finally {
            this._transactionType = IFPathTool.Transaction.NoTransaction;
        }
    };

    /**
     * In Edit mode hit-tests the path, and then takes appropriate action for mouse down:
     * selects a point for editing or creates a new one, or just updates the working mode
     * @param {GUIMouseEvent.Down} event
     * @param {Function} customizer - a function to make tool-specific actions after new point has been created,
     * accepts (IFPathBase.AnchorPoint) a new point as a parameter
     * @private
     */
    IFPathTool.prototype._mouseDownOnEdit = function (event, customizer) {
        var eventPt = event.client;
        this._pathEditor.requestInvalidation();
        this._pathEditor.releasePathPreview();
        this._pathEditor.requestInvalidation();

        var partInfo = this._pathEditor.getPartInfoAt(eventPt, this._view.getWorldTransform(), null, this._scene.getProperty('pickDist'));
        if (partInfo && partInfo.id.type == IFPathEditor.PartType.Point) {
            var anchorPt = partInfo.id.point;
            if (!this._pathRef.getProperty('closed') && anchorPt === this._pathRef.getAnchorPoints().getLastChild()) {
                this._mode = IFPathTool.Mode.Append;
                this._makePointMajor(anchorPt);
            } else if (!this._pathRef.getProperty('closed') && anchorPt === this._pathRef.getAnchorPoints().getFirstChild()) {
                this._mode = IFPathTool.Mode.Prepend;
                this._makePointMajor(anchorPt);
            } else { // middlePoint
                this._refPt = anchorPt;
                if (this._refPt.getProperty('hlx') !== null && this._refPt.getProperty('hly') !== null ||
                    this._refPt.getProperty('hrx') !== null && this._refPt.getProperty('hry') !== null) {

                    this._setCursorForPosition(IFCursor.PenModify);
                } else {
                    this._setCursorForPosition(IFCursor.PenMinus);
                }
            }
        } else if (partInfo && partInfo.id.type == IFPathEditor.PartType.Segment &&
                partInfo.data.type == IFPathEditor.SegmentData.HitRes) {

            this._setCursorForPosition(IFCursor.PenPlus);
            this._startTransaction(IFPathTool.Transaction.InsertPoint);
            var anchorPt = this._pathRef.insertHitPoint(partInfo.data.hitRes);
            if (anchorPt) {
                if (event.button == GUIMouseEvent.BUTTON_RIGHT && gPlatform.modifiers.optionKey) {
                    var tp = anchorPt.getProperty('tp');
                    if (tp == IFPathBase.AnchorPoint.Type.Asymmetric) {
                        anchorPt.setProperty('tp', IFPathBase.AnchorPoint.Type.Connector);
                    }
                }
                if (customizer) {
                    customizer(anchorPt);
                }
                this._makePointMajor(anchorPt);
                this._refPt = anchorPt;
                this._editPt = this._pathEditor.getPathPointPreview(anchorPt);
                this._pathEditor.requestInvalidation();
                this._mode = IFPathTool.Mode.Edit;
            } else {
                this._finishTransaction();
                this._reset();
                this._mode = IFPathTool.Mode.Append;
            }
        } else { // no path hit
            this._setCursorForPosition(IFCursor.PenStart);
            this._pathEditor.updatePartSelection(false);
            this._commitChanges();
            this._mode = IFPathTool.Mode.Append;
        }
    };

    /**
     * Called when mouse is released in Edit mode and no mouse drag was started.
     * Removes handles of the hit anchor point, or the point itself, if it doesn't have handles
     * @private
     */
    IFPathTool.prototype._mouseNoDragReleaseOnEdit = function (clickPt) {
        if (!this._refPt) {
            return;
        }
        // remove handles or point itself
        if (this._refPt.getProperty('hlx') != null ||
            this._refPt.getProperty('hly') != null ||
            this._refPt.getProperty('hrx') != null ||
            this._refPt.getProperty('hry') != null) {

            if (this._transactionType == IFPathTool.Transaction.NoTransaction) {
                this._startTransaction(IFPathTool.Transaction.ModifyPointProperties);
            }
            this._refPt.setProperties(['ah', 'hlx', 'hly', 'hrx', 'hry'], [false, null, null, null, null]);
            this._makePointMajor(this._refPt);
            this._setCursorForPosition(IFCursor.PenMinus);
        } else {
            if (this._pathRef.getAnchorPoints().getFirstChild() != this._pathRef.getAnchorPoints().getLastChild()) {
                if (this._transactionType == IFPathTool.Transaction.NoTransaction) {
                    this._startTransaction(IFPathTool.Transaction.DeletePoint);
                } else {
                    this._transactionType = IFPathTool.Transaction.DeletePoint;
                }
                this._pathRef.getAnchorPoints().removeChild(this._refPt);
            }
            this._setCursorForPosition(null, clickPt);
        }
        this._refPt = null;
        this._commitChanges();
    };

    IFPathTool.prototype._setCursorForPosition = function (cursor, clickPt) {
        if (cursor !== null) {
            this._cursor = cursor;
        } else if (clickPt) {
            if (!this._pathEditor) {
                this._checkPathEditor();
            }
            if (this._pathEditor) {
                var partInfo = this._pathEditor.getPartInfoAt(clickPt, this._view.getWorldTransform(), null, this._scene.getProperty('pickDist'));
                if (partInfo && partInfo.id.type == IFPathEditor.PartType.Point) {
                    var anchorPt = partInfo.id.point;
                    var pathRef = this._pathEditor.getPath();
                    if (!pathRef.getProperty('closed') &&
                        (anchorPt === pathRef.getAnchorPoints().getFirstChild() ||
                            anchorPt === pathRef.getAnchorPoints().getLastChild())) {

                        if (this._mode == IFPathTool.Mode.Append &&
                            anchorPt === pathRef.getAnchorPoints().getFirstChild() ||
                            this._mode == IFPathTool.Mode.Prepend &&
                                anchorPt === pathRef.getAnchorPoints().getLastChild()) {

                            this._cursor = IFCursor.PenEnd;
                        } else {
                            this._cursor = IFCursor.Pen;
                        }
                    } else { // middlePoint
                        if (this._mode == IFPathTool.Mode.Edit) {
                            if (anchorPt.getProperty('hlx') !== null && anchorPt.getProperty('hly') !== null ||
                                anchorPt.getProperty('hrx') !== null && anchorPt.getProperty('hry') !== null) {

                                this._cursor = IFCursor.PenModify;
                            } else {
                                this._cursor = IFCursor.PenMinus;
                            }
                        } else {
                            this._cursor = IFCursor.Pen;
                        }
                    }
                } else if (this._mode == IFPathTool.Mode.Edit) {
                    if (partInfo && partInfo.id.type == IFPathEditor.PartType.Segment) {
                        this._cursor = IFCursor.PenPlus;
                    } else { // no path hit
                        this._cursor = IFCursor.PenStart;
                    }
                } else {
                    this._cursor = IFCursor.Pen;
                }
            } else {
                this._cursor = IFCursor.PenStart;
            }
        } else {
            this._cursor = IFCursor.PenStart;
        }

        this.updateCursor();
    };

    /** override */
    IFPathTool.prototype.toString = function () {
        return "[Object IFPathTool]";
    };

    _.IFPathTool = IFPathTool;
})(this);
