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
        this._lastHitTest = new GXPathTool.LastHitTest();
    }

    GObject.inherit(GXPathTool, GXTool);

    // -----------------------------------------------------------------------------------------------------------------
    // GXPathTool.LastHitTest Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A class to keep the last hit test
     * @class GXPathTool.LastHitTest
     * @constructor
     * @version 1.0
     */
    GXPathTool.LastHitTest = function () {
    };

    GXPathTool.LastHitTest.prototype.hitResult = null;

    GXPathTool.LastHitTest.prototype.testX = null;
    GXPathTool.LastHitTest.prototype.testY = null;
    GXPathTool.LastHitTest.HitType = {
        AnyPt: 0,
        FirstAPt: 1,
        LastAPt: 2,
        MiddleAPt: 3
    };

    GXPathTool.LastHitTest.prototype.hitType = null;

    GXPathTool.LastHitTest.prototype.getMiddleAPt = function (pathRef) {
        var aPt;
        var aptc;

        if (this.hitType != GXPathTool.LastHitTest.HitType.MiddleAPt) {
            return null;
        }

        aptc = new GXVertex();
        for (aPt = pathRef.getFirstChild(); aPt != null; aPt = aPt.getNext()) {
            aPt.vertexCoord(aptc);
            if (aptc.x == this.hitResult.x && aptc.y == this.hitResult.y) {
                break;
            }
        }

        return aPt;
    };

    GXPathTool.LastHitTest.prototype.getAnyPtAPrev = function (pathRef) {
        var idx = 1;
        var aPt = pathRef.getFirstChild();
        while (aPt != null && idx < this.hitResult.segment) {
            aPt = aPt.getNext();
            idx++;
        }

        return aPt;
    };

    GXPathTool.prototype._lastHitTest = null;

    /**
     * The distance to be used for hit-testing points and curves
     * @type {number}
     * @private
     */
    GXPathTool.prototype._hitRaduis = 2.0;

    /**
     * Reference to the edited path
     * @type {GXPath}
     * @private
     */
    GXPathTool.prototype._gpathRef = null;
    GXPathTool.prototype._pathRef = null;
    GXPathTool.prototype._dpathRef = null;

    /**
     * @type {GXVertexPixelAligner}
     * @private
     */
    GXPathTool.prototype._pixelTransformer = null;
    GXPathTool.prototype._dpixelTransformer = null;

    /**
     * @type {GRect}
     * @private
     */
    GXPathTool.prototype._paintArea = null;

    /**
     * Indicates if a new point is created for this._editPt
     * @type {Boolean}
     * @private
     */
    GXPathTool.prototype._newPoint = null;

    /**
     * Contains reference to preview anchor point to edit
     * @type {GXPath.AnchorPoint}
     * @private
     */
    GXPathTool.prototype._editPt = null;

    /**
     * Contains reference to original path anchor point to edit in place
     * @type {GXPath.AnchorPoint}
     * @private
     */
    GXPathTool.prototype._refPt = null;

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

    GXPathTool.Mode = {
        Append: 0,
        Prepend: 1,
        Edit: 2
    };

    GXPathTool.prototype._mode = GXPathTool.Mode.Append;
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
    };

    /** @override */
    GXPathTool.prototype.deactivate = function (view, layer) {
        this._reset();
        GXTool.prototype.deactivate.call(this, view, layer);

        layer.removeEventListener(GUIMouseEvent.Down, this._mouseDown);
        layer.removeEventListener(GUIMouseEvent.Release, this._mouseRelease);
        layer.removeEventListener(GUIMouseEvent.DblClick, this._mouseDblClick);
        layer.removeEventListener(GUIKeyEvent.Down, this._keyDown);
    };

    /** @override */
    GXPathTool.prototype.paint = function (context) {
        if (this._paintArea) {
            context.canvas.putVertices(this._dpixelTransformer);
            context.canvas.strokeVertices(context.selectionOutlineColor);
        }
    };

    /**
     * Called to let the path tool know that it's vertices container has been modified
     * @private
     */
    GXPathTool.prototype._updatedVertices = function () {
        var paintArea = null;

        if (this._dpathRef && this._dpathRef.getFirstChild()) {
            paintArea = gVertexInfo.calculateBounds(this._dpixelTransformer, true);

            if (paintArea && paintArea.isEmpty()) {
                paintArea = null;
            } else if (paintArea) {
                // expand for outline stroke width
                paintArea = paintArea.expanded(1, 1, 1, 1);
            }
        }
        if (paintArea == null && this._paintArea ||
            paintArea && this._paintArea == null ||
            paintArea && paintArea != this._paintArea) {

            if (this._paintArea) {
                this.invalidateArea(this._paintArea);
            }

            this._paintArea = paintArea;

            if (this._paintArea) {
                this.invalidateArea(this._paintArea);
            }
        }
    };

    GXPathTool.prototype._checkPathEditor = function () {
        var path = this._editor.getPathSelection();
        if (path) {
            this._pathEditor = GXElementEditor.openEditor(path);
        }
    };

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

    GXPathTool.prototype._addPoint = function (anchorPt, draft) {
        anchorPt.setFlag(GXNode.Flag.Selected);
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
                } else if (this._mode == GXPathTool.Mode.Prepend) {
                    this._dpathRef.getAnchorPoints().getFirstChild().removeFlag(GXNode.Flag.Selected);
                    this._dpathRef.getAnchorPoints().insertChild(anchorPt, this._dpathRef.getAnchorPoints().getFirstChild());
                    this._editPt = this._dpathRef.getAnchorPoints().getFirstChild();
                }
                this._pathEditor.requestInvalidation();
                this._newPoint = true;
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
                } else if (this._mode == GXPathTool.Mode.Prepend) {
                    this._pathRef.getAnchorPoints().insertChild(anchorPt, this._pathRef.getAnchorPoints().getFirstChild());
                }
                this._pathEditor.selectOnePoint(anchorPt);
                this._pathEditor.requestInvalidation();
            }
        }
    };

    GXPathTool.prototype._commitChanges = function () {
        this._pathRef = null;
        this._dpathRef = null;
        this._pathEditor.requestInvalidation();
        this._pathEditor.releasePathPreview();
        this._pathEditor.requestInvalidation();
        this._newPoint = false;
        this._editPt = null;
        this._refPt = null;
        this._pathEditor = null;
    };

    /**
     * Hit tests the selected path, stores the result in this._lastHitTest
     * @param {GPoint} [pt] current mouse point coordinates
     * @return {GXVertexInfo.HitResult} or null, if no hit
     * @private
     */
    GXPathTool.prototype._makeHitTest = function (pt) {
        var hitRes;
        var apt;

        hitRes = new GXVertexInfo.HitResult();
        if (this._gpathRef &&
            gVertexInfo.hitTest(pt.getX(), pt.getY(), this._pathRef, this._hitRaduis * 2, false, hitRes)) {

            this._lastHitTest.hitResult = hitRes;
            this._lastHitTest.testX = pt.getX();
            this._lastHitTest.testY = pt.getY();
            if (this._lastHitTest.hitResult.slope == 0 || this._lastHitTest.hitResult.slope == 1) {
                if (this._gpathRef.getProperty(GXPath.PROPERTY_CLOSED)) {
                    this._lastHitTest.hitType = GXPathTool.LastHitTest.HitType.MiddleAPt;
                } else {
                    apt = new GXVertex();
                    this._pathRef.getLastChild().vertexCoord(apt);
                    if (apt.x == this._lastHitTest.hitResult.x && apt.y == this._lastHitTest.hitResult.y) {
                        this._lastHitTest.hitType = GXPathTool.LastHitTest.HitType.LastAPt;
                    } else {
                        this._pathRef.getFirstChild().vertexCoord(apt);
                        if (apt.x == this._lastHitTest.hitResult.x && apt.y == this._lastHitTest.hitResult.y) {
                            this._lastHitTest.hitType = GXPathTool.LastHitTest.HitType.FirstAPt;
                        } else {
                            this._lastHitTest.hitType = GXPathTool.LastHitTest.HitType.MiddleAPt;
                        }
                    }
                }
            } else {
                this._lastHitTest.hitType = GXPathTool.LastHitTest.HitType.AnyPt;
            }
        } else {
            this._lastHitTest.hitResult = null;
            this._lastHitTest.testX = null;
            this._lastHitTest.testY = null;
            this._lastHitTest.hitType = null;
        }
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
     * Create a path shape and add it, based on the current
     * vertex container
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

    GXPathTool.prototype._convertToConstrain = function (anchorPt, prevPt, origX, origY) {
        var newPt = gMath.convertToConstrain(prevPt.getProperty('x'), prevPt.getProperty('y'), origX, origY);
        anchorPt.setProperties(['x', 'y'], [newPt.getX(), newPt.getY()]);
//        anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_AUTO_HANDLES, true);
    };

    /**
     * @param {GUIMouseEvent.Down} event
     * @private
     */
    GXPathTool.prototype._mouseDown = function (event) {
        this._released = false;
    };

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
    };

    /**
     * Reset the tool i.e. when done or canceling
     * @private
     */
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
                this._pathEditor = null;
                //this._reset();
            }
        }
    };

    GXPathTool.prototype._constrainIfNeeded = function (pt, path, orientPt) {
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
                constrPt = gMath.convertToConstrain(
                    otherPt.getProperty('x'), otherPt.getProperty('y'), pt.getX(), pt.getY());
            }
        }
        return constrPt;
    };

    GXPathTool.prototype.splitAtSlope = function (aPrev, aNext, slope, pathRef) {
        var newAPt;
        var p1x, c1x, c2x, p2x, p1y, c1y, c2y, p2y;
        var ctrls1X = new Float64Array(4);
        var ctrls1Y = new Float64Array(4);
        var ctrls2X = new Float64Array(4);
        var ctrls2Y = new Float64Array(4);
        var vt;

        p1x = aPrev.getProperty(GXPath.AnchorPoint.PROPERTY_X);
        p1y = aPrev.getProperty(GXPath.AnchorPoint.PROPERTY_Y);
        c1x = aPrev.getProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_X);
        c1y = aPrev.getProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_Y);
        if (c1x == null || c1y == null) {
            c1x = p1x;
            c1y = p1y;
        }
        p2x = aNext.getProperty(GXPath.AnchorPoint.PROPERTY_X);
        p2y = aNext.getProperty(GXPath.AnchorPoint.PROPERTY_Y);
        c2x = aNext.getProperty(GXPath.AnchorPoint.PROPERTY_HPREV_X);
        c2y = aNext.getProperty(GXPath.AnchorPoint.PROPERTY_HPREV_Y);
        if (c2x == null || c2y == null) {
            c2x = p2x;
            c2y = p2y;
        }

        // If line
        if (gMath.isEqualEps(c1x, p1x) && gMath.isEqualEps(c1y, p1y) &&
            gMath.isEqualEps(c2x, p2x) && gMath.isEqualEps(c2y, p2y)) {

            vt = new GPoint(p1x + slope * (p2x - p1x), p1y + slope * (p2y - p1y));
            newAPt = new GXPath.AnchorPoint(vt, GXPath.AnchorPoint.CType.Regular);
            pathRef.insertChild(newAPt, aNext);
        } else { // curve
            gMath.getCtrlPtsCasteljau(p1x, c1x, c2x, p2x, slope, 1, ctrls1X);
            gMath.getCtrlPtsCasteljau(p1y, c1y, c2y, p2y, slope, 1, ctrls1Y);
            gMath.getCtrlPtsCasteljau(p1x, c1x, c2x, p2x, slope, 2, ctrls2X);
            gMath.getCtrlPtsCasteljau(p1y, c1y, c2y, p2y, slope, 2, ctrls2Y);

            if (gMath.isEqualEps(ctrls1X[1], p1x) && gMath.isEqualEps(ctrls1Y[1], p1y)) {
                aPrev.setProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_X, null);
                aPrev.setProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_Y, null);
            } else {
                aPrev.setProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_X, ctrls1X[1]);
                aPrev.setProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_Y, ctrls1Y[1]);
            }

            vt = new GPoint(ctrls1X[3], ctrls1Y[3]);
            newAPt = new GXPath.AnchorPoint(vt, GXPath.AnchorPoint.CType.Regular);
            pathRef.insertChild(newAPt, aNext);
            if (gMath.isEqualEps(ctrls1X[2], ctrls1X[3]) && gMath.isEqualEps(ctrls1Y[2], ctrls1Y[3])) {
                newAPt.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_X, null);
                newAPt.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_Y, null);
            } else {
                newAPt.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_X, ctrls1X[2]);
                newAPt.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_Y, ctrls1Y[2]);
            }
            if (gMath.isEqualEps(ctrls2X[0], ctrls2X[1]) && gMath.isEqualEps(ctrls2Y[0], ctrls2Y[1])) {
                newAPt.setProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_X, null);
                newAPt.setProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_Y, null);
            } else {
                newAPt.setProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_X, ctrls2X[1]);
                newAPt.setProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_Y, ctrls2Y[1]);
            }

            if (gMath.isEqualEps(ctrls2X[2], ctrls2X[3]) && gMath.isEqualEps(ctrls2Y[2], ctrls2Y[3])) {
                aNext.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_X, null);
                aNext.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_Y, null);
            } else {
                aNext.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_X, ctrls2X[2]);
                aNext.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_Y, ctrls2Y[2]);
            }
        }

        return newAPt;
    };

    GXPathTool.prototype._makePointMajor = function (anchorPt) {
        this._pathEditor.selectOnePoint(anchorPt);
        this._dpathRef = this._pathEditor.releasePathPreview();
        this._pathEditor.requestInvalidation();
        this._dpathRef = this._pathEditor.getPathPreview(anchorPt);
    };

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
            // TODO
            // TEMP start
            this._pathEditor = null;
            this._pathRef = null;
            this._dpathRef = null;
            this._mode = GXPathTool.Mode.Append;
            // TEMP end
        } else { // no path hit
            this._pathEditor.updatePartSelection(false);
            this._commitChanges();
            this._mode = GXPathTool.Mode.Append;
        }
        return;


        var aPrev = null;
        var aNext = null;

        if (!this._lastHitTest.hitResult || !gMath.isEqualEps(this._lastHitTest.testX, clickPt.getX()) || !gMath.isEqualEps(this._lastHitTest.testY, clickPt.getY())) {

            this._makeHitTest(clickPt);
        }

        if (this._lastHitTest.hitResult) {
            if (this._lastHitTest.hitType == GXPathTool.LastHitTest.HitType.LastAPt ||
                this._lastHitTest.hitType == GXPathTool.LastHitTest.HitType.FirstAPt) {

                if (this._lastHitTest.hitType == GXPathTool.LastHitTest.HitType.FirstAPt) {
                    this._gpathRef.switchOrient();
                    // hit test result becomes invalid if any;
                    this._lastHitTest = new GXPathTool.LastHitTest();
                }

                this._mode = GXPathTool.Mode.Append;
                this._gpathRef.resetSelectedPts();
                this._newPoint = this._dpathRef.getLastChild();
                this._newPoint.setFlag(GXNode.Flag.Selected);
                this._updatedVertices();
                return;
            } else if (this._lastHitTest.hitType == GXPathTool.LastHitTest.HitType.MiddleAPt) {
                this._editPt = this._lastHitTest.getMiddleAPt(this._pathRef);
                this._gpathRef.resetSelectedPts();
                if (this._editPt) {
                    this._editPt.setFlag(GXNode.Flag.Selected);
                    this._gpathRef.setWorkingPath(this._dpathRef);
                    this._updatedVertices();
                } else {
                    this._gpathRef.removeFlag(GXNode.Flag.Selected);
                    this._reset(); // sets mode to Append
                }
            } else { // this._lastHitTest.hitType == GXPathTool.LastHitTest.HitType.AnyPt
                aPrev = this._lastHitTest.getAnyPtAPrev(this._pathRef);
                aNext = aPrev ? aPrev.getNext() : null;
                if (!aPrev || !aNext) {
                    this._gpathRef.resetSelectedPts();
                    this._gpathRef.removeFlag(GXNode.Flag.Selected);
                    this._reset(); // sets mode to Append
                } else {
                    this._gpathRef.beginUpdate();
                    aPrev.setProperty(GXPath.AnchorPoint.PROPERTY_AUTO_HANDLES, false);
                    aNext.setProperty(GXPath.AnchorPoint.PROPERTY_AUTO_HANDLES, false);

                    this._editPt = this.splitAtSlope(
                        aPrev, aNext, this._lastHitTest.hitResult.slope, this._pathRef);

                    this._gpathRef.resetSelectedPts();
                    this._editPt.setFlag(GXNode.Flag.Selected);
                    this._gpathRef.setWorkingPath(this._dpathRef);
                    this._gpathRef.endUpdate();
                    this._updatedVertices();
                }
            }
        } else {
            this._gpathRef.resetSelectedPts();
            this._gpathRef.removeFlag(GXNode.Flag.Selected);
            this._reset(); // sets mode to Append
        }
    };

    GXPathTool.prototype._mouseNoDragReleaseOnEdit = function () {
        if (!this._refPt) {
            return;
        }
        /*
        this._gpathRef.commitDraft();
        // hit test result becomes invalid if any;
        this._lastHitTest = new GXPathTool.LastHitTest();
        this._gpathRef.setWorkingPath(this._pathRef);
        */
        // remove handles or point itself
        if (this._refPt.getProperty('hlx') != null ||
            this._refPt.getProperty('hly') != null ||
            this._refPt.getProperty('hrx') != null ||
            this._refPt.getProperty('hry') != null) {

            this._refPt.setProperties(['ah', 'hlx', 'hly', 'hrx', 'hry'], [false, null, null, null, null]);
            this._makePointMajor(this._refPt);
        } else {
            this._pathRef.getAnchorPoints().removeChild(this._refPt);
            //this._updatedVertices();
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
