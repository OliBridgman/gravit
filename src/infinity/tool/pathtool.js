(function (_) {
    /**
     * The base tool for path creating tools
     * @class GXPathTool
     * @extends GXTool
     * @constructor
     * @version 1.0
     */
    function GXPathTool() {
        GXTool.call(this);
    }

    GObject.inherit(GXPathTool, GXTool);

    /**
     * Reference to the edited path
     * @type {GXPath}
     * @private
     */
    GXPathTool.prototype._pathRef = null;

    /**
     * Reference to the edited path preview
     * @type {GXPath}
     * @private
     */
    GXPathTool.prototype._dpathRef = null;

    /**
     * Indicates if a new point is created for this._editPt
     * @type {Boolean}
     * @private
     */
    GXPathTool.prototype._newPoint = null;

    /**
     * Contains reference to preview anchor point to edit
     * @type {GXPathBase.AnchorPoint}
     * @private
     */
    GXPathTool.prototype._editPt = null;

    /**
     * Contains reference to original path anchor point to edit in place
     * @type {GXPathBase.AnchorPoint}
     * @private
     */
    GXPathTool.prototype._refPt = null;

    /**
     * Contains reference to an editor of the currently edited path
     * @type {GXPathEditor}
     * @private
     */
    GXPathTool.prototype._pathEditor = null;

    /**
     * Indicates if the mouse released (all buttons)
     * @type {boolean}
     * @private
     */
    GXPathTool.prototype._released = true;

    /**
     * Indicates if the mouse drag started (all buttons)
     * @type {boolean}
     * @private
     */
    GXPathTool.prototype._dragStarted = false;

    /**
     * Contains reference to original path anchor point (if exists) for the case when it's preview is moving
     * @type {GXPathBase.AnchorPoint}
     * @private
     */
    GXPathTool.prototype._dragStartPt = null;

    /**
     * Possible working modes of Path Tool
     * @type {{Append: number, Prepend: number, Edit: number}}
     */
    GXPathTool.Mode = {
        Append: 0,
        Prepend: 1,
        Edit: 2
    };

    /**
     * The current working mode
     * @type {GXPathTool.Mode}
     * @private
     */
    GXPathTool.prototype._mode = GXPathTool.Mode.Append;

    /**
     * Time in milliseconds of the last mouse down event since 1 Jan 1970.
     * Used to support properly double-clicks
     * @type {number}
     * @private
     */
    GXPathTool.prototype._mDownTime = 0;

    /** @override */
    GXPathTool.prototype.getHint = function () {
        return GXTool.prototype.getHint.call(this)
            .addKey(GUIKey.Constant.TAB, new GLocale.Key(GXPathTool, "shortcut.tab"));
    };

    /** @override */
    GXPathTool.prototype.getCursor = function () {
        return GUICursor.PenStart;
    };

    /** @override */
    GXPathTool.prototype.activate = function (view, layer) {
        GXTool.prototype.activate.call(this, view, layer);

        layer.addEventListener(GUIMouseEvent.Down, this._mouseDown, this);
        layer.addEventListener(GUIMouseEvent.Release, this._mouseRelease, this);
        layer.addEventListener(GUIMouseEvent.DblClick, this._mouseDblClick, this);
        layer.addEventListener(GUIKeyEvent.Down, this._keyDown, this);

        // Set detail mode for selection for path tool
        this._editor.setSelectionDetail(true);
    };

    /** @override */
    GXPathTool.prototype.deactivate = function (view, layer) {
        // Remove detail mode for selection for path tool
        this._editor.setSelectionDetail(false);

        this._reset();
        GXTool.prototype.deactivate.call(this, view, layer);

        layer.removeEventListener(GUIMouseEvent.Down, this._mouseDown);
        layer.removeEventListener(GUIMouseEvent.Release, this._mouseRelease);
        layer.removeEventListener(GUIMouseEvent.DblClick, this._mouseDblClick);
        layer.removeEventListener(GUIKeyEvent.Down, this._keyDown);
    };

    /**
     * Stores a reference to an editor of the selected path, if any
     * @private
     */
    GXPathTool.prototype._checkPathEditor = function () {
        var path = this._editor.getPathSelection();
        if (path) {
            this._pathEditor = GXElementEditor.openEditor(path);
        }
    };

    /**
     * Defines current working mode
     * @private
     */
    GXPathTool.prototype._checkMode = function () {
        this._checkPathEditor();
        if (!this._pathEditor) {
            this._pathRef = null;
            this._dpathRef = null;
            this._mode = GXPathTool.Mode.Append;
        } else {
            this._pathRef = this._pathEditor.getPath();
            this._dpathRef = this._pathEditor.getPathPreview();
            if (this._pathRef.getProperty('closed')) {
                this._mode = GXPathTool.Mode.Edit;
            } else {
                var selType = this._pathEditor.getPointsSelectionType();
                if (selType == GXPathEditor.PointsSelectionType.No ||
                    selType == GXPathEditor.PointsSelectionType.Several ||
                    selType == GXPathEditor.PointsSelectionType.Middle) {

                    this._mode = GXPathTool.Mode.Edit;
                } else if (selType == GXPathEditor.PointsSelectionType.Last) {
                    this._mode = GXPathTool.Mode.Append;
                } else if (selType == GXPathEditor.PointsSelectionType.First) {
                    this._mode = GXPathTool.Mode.Prepend;
                    // hit test result becomes invalid if any;
                    //this._lastHitTest = new GXPathTool.LastHitTest();
                }
            }
        }
    };

    /**
     * Updates position of edited point, takes into account shiftKey and mode
     * @param {GPoint} clickPt - coordinates to be used for new position in view system
     * @private
     */
    GXPathTool.prototype._updatePoint = function (clickPt) {
        if (this._pathRef && this._editPt) {
            var newPos = this._constrainIfNeeded(clickPt, this._view.getWorldTransform(), this._pathRef);
            this._pathEditor.movePoint(this._editPt, newPos, this._view.getWorldTransform(), this._dragStartPt);
        }
    };

    /**
     * Adds new anchor point to the end of edited path. Creates a new path with one point,
     * if no path is selected for editing
     * @param {GXPathBase.AnchorPoint} anchorPt - new anchor point to add into path in scene or path native coordinates
     * @param {Boolean} draft - indicates if the path itself or path preview should be used for point insertion
     * @param {Boolean} nativeCoord - indicates if the new point already in path native coordinates
     * @private
     */
    GXPathTool.prototype._addPoint = function (anchorPt, draft, nativeCoord) {
        anchorPt.setFlag(GXNode.Flag.Selected);
        if (this._pathEditor && !nativeCoord) {
            var transform = this._pathRef.getProperty('transform');
            if (transform) {
                var location = new GPoint(anchorPt.getProperty('x'), anchorPt.getProperty('y'));
                location = transform.inverted().mapPoint(location);
                anchorPt.setProperties(['x', 'y'], [location.getX(), location.getY()]);
            }
        }
        if (draft) {
            if (!this._pathEditor) {
                this._createAndAppendPath(anchorPt);
                this._pathEditor.selectOnePoint(anchorPt);
                this._checkMode();
                this._editPt = this._dpathRef.getAnchorPoints().getLastChild();
                this._pathEditor.requestInvalidation();
            } else {
                this._pathEditor.requestInvalidation();
                if (this._mode == GXPathTool.Mode.Append) {
                    this._dpathRef.getAnchorPoints().getLastChild().removeFlag(GXNode.Flag.Selected);
                    this._dpathRef.getAnchorPoints().appendChild(anchorPt);
                    this._editPt = this._dpathRef.getAnchorPoints().getLastChild();
                    this._newPoint = true;
                } else if (this._mode == GXPathTool.Mode.Prepend) {
                    this._dpathRef.getAnchorPoints().getFirstChild().removeFlag(GXNode.Flag.Selected);
                    this._dpathRef.getAnchorPoints().insertChild(anchorPt, this._dpathRef.getAnchorPoints().getFirstChild());
                    this._pathEditor.shiftPreviewTable(1);
                    this._editPt = this._dpathRef.getAnchorPoints().getFirstChild();
                    this._newPoint = true;
                }
                this._pathEditor.requestInvalidation();
            }
        } else {
            if (!this._pathEditor) {
                this._createAndAppendPath(anchorPt);
                this._pathEditor.selectOnePoint(anchorPt);
                this._checkMode();
                this._pathEditor.requestInvalidation();
            } else {
                this._pathEditor.requestInvalidation();
                if (this._mode == GXPathTool.Mode.Append) {
                    this._pathRef.getAnchorPoints().appendChild(anchorPt);
                    this._pathEditor.selectOnePoint(anchorPt);
                } else if (this._mode == GXPathTool.Mode.Prepend) {
                    this._pathEditor.releasePathPreview(); // we release preview here, as base path will be modified
                    this._pathEditor.requestInvalidation();
                    this._pathRef.getAnchorPoints().insertChild(
                        anchorPt, this._pathRef.getAnchorPoints().getFirstChild());

                    this._pathEditor.selectOnePoint(anchorPt);
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
    GXPathTool.prototype._commitChanges = function () {
        this._pathRef = null;
        this._dpathRef = null;
        this._pathEditor.requestInvalidation();
        this._pathEditor.releasePathPreview();
        this._pathEditor.requestInvalidation();
        this._newPoint = false;
        this._editPt = null;
        this._refPt = null;
        this._dragStartPt = null;
        this._pathEditor = null;
    };

    /**
     * Updates cursor based on whether the path or an anchor point has been hit
     * The hit test information is taken from this._lastHitTest
     * @private
     */
    GXPathTool.prototype._updateCursor = function () {
        // TODO:
    };

    /**
     * Create a path shape with one point, and adds it for rendering
     * @param {GXPathBase.AnchorPoint} apt - new anchor point to create path from
     * @private
     */
    GXPathTool.prototype._createAndAppendPath = function (apt) {
        var path = new GXPath();
        path.getAnchorPoints().appendChild(apt);
        apt.setFlag(GXNode.Flag.Selected);
        path.setFlag(GXNode.Flag.Selected);
        this._editor.insertElement(path);
        this._pathEditor = GXElementEditor.openEditor(path);
    };

    // TODO: remove it after Pen Tool implementation
    GXPathTool.prototype._convertToConstrain = function (anchorPt, prevPt, origX, origY) {
        var newPt = gMath.convertToConstrain(prevPt.getProperty('x'), prevPt.getProperty('y'), origX, origY);
        anchorPt.setProperties(['x', 'y'], [newPt.getX(), newPt.getY()]);
//        anchorPt.setProperty(GXPathBase.AnchorPoint.PROPERTY_AUTO_HANDLES, true);
    };

    /**
     * @param {GUIMouseEvent.Down} event
     * @private
     */
    GXPathTool.prototype._mouseDown = function (event) {
        this._released = false;
    };

    /**
     * @param {GUIMouseEvent.DblClick} event
     * @private
     */
    GXPathTool.prototype._mouseDblClick = function (event) {
        this._reset();
    };

    /**
     * @param {GUIMouseEvent.Release} event
     * @private
     */
    GXPathTool.prototype._mouseRelease = function (event) {
        this._released = true;
        this._dragStarted = false;
        this._dragStartPt = null;
    };

    /**
     * Reset the tool i.e. when done or canceling
     * @private
     */
    // TODO: remove it after Pen Tool implementation, use commitChanges instead
    GXPathTool.prototype._reset = function () {
        this._dpathRef = null;
        this._pathRef = null;
        this._pathEditor = null;
        this._newPoint = false;
        this._mode = GXPathTool.Mode.Append;
        this._editPt = null;
    };

    /**
     * @param {GUIKeyEvent} event
     * @private
     */
    GXPathTool.prototype._keyDown = function (event) {
        if (event.key === GUIKey.Constant.TAB) {
            this._tabAction();
        }
    };

    /**
     * Finish path editing and deselect a path if TAB is pressed
     * @private
     */
    GXPathTool.prototype._tabAction = function () {
        // Action should be taken only if mouse released
        if (this._released) {
            this._checkMode();
            if (this._pathEditor) {
                this._pathEditor.updatePartSelection(false);
                this._pathRef.removeFlag(GXNode.Flag.Selected);
                this._commitChanges();
            }
        }
    };

    /**
     * If Shift key is pressed, finds the point, which should be used as a base to constrain location with,
     * and calculates a new location
     * @param {GPoint} pt - original point
     * @param {GTransform} transform - a transformation to apply to base point before using it for constraining
     * @param {GXPath} path - a path to look for base point; used only if no orientation point is passed
     * @param {GXPathBase.AnchorPoint} orientPt - orientation anchor point to be used as a base to constrain location with,
     * may be null
     * @returns {GPoint} - original or newly created bounded point
     * @private
     */
    GXPathTool.prototype._constrainIfNeeded = function (pt, transform, path, orientPt) {
        var constrPt = pt;

        if (gPlatform.modifiers.shiftKey) {
            var otherPt = null;
            if (orientPt) {
                otherPt = orientPt;
            } else if (path) {
                if (this._mode == GXPathTool.Mode.Append) {
                    otherPt = path.getAnchorPoints().getLastChild();
                } else if (this._mode == GXPathTool.Mode.Prepend) {
                    otherPt = path.getAnchorPoints().getFirstChild();
                }
            }

            if (otherPt) {
                var basePt = new GPoint(otherPt.getProperty('x'), otherPt.getProperty('y'));
                var transformToApply = path ? path.getProperty('transform') : null;
                if (transform) {
                    transformToApply = transformToApply ? transformToApply.multiplied(transform) : transform;
                }
                basePt = transformToApply ? transformToApply.mapPoint(basePt) : basePt;
                constrPt = gMath.convertToConstrain(
                    basePt.getX(), basePt.getY(), pt.getX(), pt.getY());
            }
        }
        return constrPt;
    };

    /**
     * Makes a point the only selected and updates preview accordingly
     * @param {GXPathBase.AnchorPoint} anchorPt - anchor point, which should be made major
     * @private
     */
    GXPathTool.prototype._makePointMajor = function (anchorPt) {
        this._pathEditor.selectOnePoint(anchorPt);
        this._dpathRef = null;
        this._pathEditor.releasePathPreview();
        this._pathEditor.requestInvalidation();
        this._dpathRef = this._pathEditor.getPathPreview(anchorPt);
    };

    /**
     * In Edit mode hit-tests the path, and then takes appropriate action for mouse down:
     * selects a point for editing or creates a new one, or just updates the working mode
     * @param {GPoint} eventPt - unmodified point of mouse click
     * @private
     */
    GXPathTool.prototype._mouseDownOnEdit = function (eventPt) {
        this._pathEditor.requestInvalidation();
        this._pathEditor.releasePathPreview();
        this._pathEditor.requestInvalidation();

        var partInfo = this._pathEditor.getPartInfoAt(eventPt, this._view.getWorldTransform());
        if (partInfo && partInfo.id.type == GXPathEditor.PartType.Point) {
            var anchorPt = partInfo.id.point;
            if (!this._pathRef.getProperty('closed') && anchorPt === this._pathRef.getAnchorPoints().getLastChild()) {
                this._mode = GXPathTool.Mode.Append;
                this._makePointMajor(anchorPt);
            } else if (!this._pathRef.getProperty('closed') && anchorPt === this._pathRef.getAnchorPoints().getFirstChild()) {
                this._mode = GXPathTool.Mode.Prepend;
                this._makePointMajor(anchorPt);
            } else { // middlePoint
                this._refPt = anchorPt;
            }
        } else if (partInfo && partInfo.id.type == GXPathEditor.PartType.Segment) {
            var anchorPt = this._pathRef.insertHitPoint(partInfo.data.data);
            if (anchorPt) {
                this._makePointMajor(anchorPt);
                this._editPt = this._pathEditor.getPathPointPreview(anchorPt);
                this._pathEditor.requestInvalidation();
                this._mode = GXPathTool.Mode.Edit;
            } else {
                this._pathEditor = null;
                this._pathRef = null;
                this._dpathRef = null;
                this._mode = GXPathTool.Mode.Append;
            }
        } else { // no path hit
            this._pathEditor.updatePartSelection(false);
            this._commitChanges();
            this._mode = GXPathTool.Mode.Append;
        }
    };

    /**
     * Called when mouse is released in Edit mode and no mouse drag was started.
     * Removes handles of the hit anchor point, or the point itself, if it doesn't have handles
     * @private
     */
    GXPathTool.prototype._mouseNoDragReleaseOnEdit = function () {
        if (!this._refPt) {
            return;
        }
        // remove handles or point itself
        if (this._refPt.getProperty('hlx') != null ||
            this._refPt.getProperty('hly') != null ||
            this._refPt.getProperty('hrx') != null ||
            this._refPt.getProperty('hry') != null) {

            this._refPt.setProperties(['ah', 'hlx', 'hly', 'hrx', 'hry'], [false, null, null, null, null]);
            this._makePointMajor(this._refPt);
        } else {
            if (this._pathRef.getAnchorPoints().getFirstChild() != this._pathRef.getAnchorPoints().getLastChild()) {
                this._pathRef.getAnchorPoints().removeChild(this._refPt);
            }
        }
        this._refPt = null;
        this._commitChanges();
    };

    /** override */
    GXPathTool.prototype.toString = function () {
        return "[Object GXPathTool]";
    };

    _.GXPathTool = GXPathTool;
})(this);
