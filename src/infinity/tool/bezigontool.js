(function (_) {
    /**
     * The bezigon tool
     * @class GXBezigonTool
     * @extends GXPathTool
     * @constructor
     * @version 1.0
     */
    function GXBezigonTool() {
        GXPathTool.call(this);
    }

    GObject.inherit(GXBezigonTool, GXPathTool);

    /** @override */
    GXBezigonTool.prototype.getGroup = function () {
        return 'draw';
    };

    /** @override */
    GXBezigonTool.prototype.getImageClass = function () {
        return 'g-tool-bezigon';
    };

    /** @override */
    GXBezigonTool.prototype.getHint = function () {
        return GXPathTool.prototype.getHint.call(this)
            .addKey(GUIKey.Constant.OPTION, new GLocale.Key(GXBezigonTool, "shortcut.option"), true)
            .addKey(GUIKey.Constant.SHIFT, new GLocale.Key(GXBezigonTool, "shortcut.shift"), true)
            .setTitle(new GLocale.Key(GXBezigonTool, "title"));
    };

    /** @override */
    GXBezigonTool.prototype.getActivationCharacters = function () {
        return ['B', '8'];
    };

    /** @override */
    GXBezigonTool.prototype.activate = function (view, layer) {
        GXPathTool.prototype.activate.call(this, view, layer);
        layer.addEventListener(GUIMouseEvent.Drag, this._mouseDrag, this);
        layer.addEventListener(GUIMouseEvent.Move, this._mouseMove, this);
    };

    /** @override */
    GXBezigonTool.prototype.deactivate = function (view, layer) {
        GXPathTool.prototype.deactivate.call(this, view, layer);
        layer.removeEventListener(GUIMouseEvent.Drag, this._mouseDrag);
        layer.removeEventListener(GUIMouseEvent.Move, this._mouseMove);
    };

    /**
     * @param {GUIMouseEvent.Down} event
     * @private
     */
    GXBezigonTool.prototype._mouseDown = function (event) {
        var tm = new Date().getTime();
        if (tm - this._mDownTime < 300) {
            // Double-click
            return;
        }

        this._mDownTime = tm;
        this._released = false;
        var anchorPt = null;
        var clickPt;
        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
        this._dragStarted = false;
        this._newPoint = null;
        this._editPt = null;

        // TODO: honor path.$transform in _addPoint, _updatePoint, _constrainIfNeeded, hitAnchorPoint

        if (event.button == GUIMouseEvent.BUTTON_LEFT ||
            event.button == GUIMouseEvent.BUTTON_RIGHT && gPlatform.modifiers.optionKey) {

            this._checkMode();

            if (this._mode == GXPathTool.Mode.Edit) {
                this._mouseDownOnEdit(event.client);
            }

            this._updateCursor();
            if (this._mode != GXPathTool.Mode.Edit) {
                clickPt = this._view.getViewTransform().mapPoint(event.client);
                clickPt = this._constrainIfNeeded(clickPt, this._pathRef);
                var otherPt;
                if (this._pathEditor) {
                    if (this._mode == GXPathTool.Mode.Append) {
                        otherPt = this._pathRef.getAnchorPoints().getFirstChild();
                    } else { // this._mode == GXPathTool.Mode.Prepend
                        otherPt = this._pathRef.getAnchorPoints().getLastChild();
                    }
                }

                if (otherPt && this._pathEditor.hitAnchorPoint(otherPt, clickPt)) {
                    // Close path
                    this._pathRef.setProperty('closed', true);
                    this._makePointMajor(otherPt);
                    this._mode = GXPathTool.Mode.Edit;
                    this._editPt = this._pathEditor.getPathPointPreview(otherPt);
                    this._pathEditor.requestInvalidation();
                } else {
                    var prevPt;
                    if (this._pathEditor) {
                        if (this._mode == GXPathTool.Mode.Append) {
                            prevPt = this._pathRef.getAnchorPoints().getLastChild();
                        } else { // this._mode == GXPathTool.Mode.Prepend
                            prevPt = this._pathRef.getAnchorPoints().getFirstChild();
                        }
                    }
                    if (prevPt && this._pathEditor.hitAnchorPoint(prevPt, clickPt)) {
                        this._makePointMajor(prevPt);
                        this._mode = GXPathTool.Mode.Edit;
                        this._editPt = this._pathEditor.getPathPointPreview(prevPt);
                        this._pathEditor.requestInvalidation();
                    } else {
                        // add new point
                        anchorPt = this._constructNewPoint(event, clickPt);
                        this._addPoint(anchorPt, true);
                    }
                }
            }
        }
    };

    /**
     * @param {GUIMouseEvent.DblClick} event
     * @private
     */
    GXBezigonTool.prototype._mouseDblClick = function (event) {
        this._checkMode();
        if (this._pathEditor) {
            this._pathEditor.updatePartSelection(false);
            this._commitChanges();
        }
        return;

//        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
//        this._reset();
    };

    /**
     * @param {GUIMouseEvent.Move} event
     * @private
     */
    GXBezigonTool.prototype._mouseMove = function (event) {
        var curPt;

        if (!this._released) {
            if (event.button == GUIMouseEvent.BUTTON_RIGHT && gPlatform.modifiers.optionKey) {
                this._mouseDrag(event);
            }
            return;
        }
/*
        curPt = this._view.getViewTransform().mapPoint(event.client);
        this._checkMode();
        this._makeHitTest(curPt);
        this._updateCursor();    */
    };

    /**
     * @param {GUIMouseEvent.Drag | GUIMouseEvent.Move} event
     * @private
     */
    GXBezigonTool.prototype._mouseDrag = function (event) {
        if (this._refPt && !this._released) {
            this._makePointMajor(this._refPt);
            this._editPt = this._pathEditor.getPathPointPreview(this._refPt);
            this._pathEditor.requestInvalidation();
            this._refPt = null;
        }
        if (this._editPt && !this._released) {
            var pt = this._view.getViewTransform().mapPoint(event.client);
            this._dragStarted = true;
            this._pathEditor.requestInvalidation();
            this._updatePoint(pt);
            this._pathEditor.requestInvalidation();
        }
        //this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
    };

    /**
     * Updates position of edited point, takes into account shiftKey and mode
     * @param {GPoint} pt - coordinates to be used for new position in world system
     * @private
     */
    GXBezigonTool.prototype._updatePoint = function (pt) {
        if (this._dpathRef && this._editPt) {
            var newPos = this._constrainIfNeeded(pt, this._pathRef);

            if (this._editPt.getProperty('ah')) {
                this._editPt.setProperties(['x', 'y'], [newPos.getX(), newPos.getY()]);
            } else {
                var dx = newPos.getX() - this._editPt.getProperty('x');
                var dy = newPos.getY() - this._editPt.getProperty('y');

                var hval = this._editPt.getProperty('hlx');
                if (hval != null) {
                    hval += dx;
                }
                var hlx = hval;
                hval = this._editPt.getProperty('hly');
                if (hval != null) {
                    hval += dy;
                }
                var hly = hval;
                hval = this._editPt.getProperty('hrx');
                if (hval != null) {
                    hval += dx;
                }
                var hrx = hval;
                hval = this._editPt.getProperty('hry');
                if (hval != null) {
                    hval += dy;
                }
                var hry = hval;

                this._editPt.setProperties(['x', 'y', 'hlx', 'hly', 'hrx', 'hry'], [newPos.getX(), newPos.getY(),
                    hlx, hly, hrx, hry]);
            }
        }
    };

    /**
     * Constructs new point, specific to Bezigon Tool, with the given position
     * @param {GUIMouseEvent} event used to define pressed button
     * @param {GPoint} pt - coordinates to be used for new position in world system
     * @returns {GXPath.AnchorPoint} newly created anchor point
     * @private
     */
    GXBezigonTool.prototype._constructNewPoint = function (event, pt) {
        var anchorPt = new GXPath.AnchorPoint();
        anchorPt.setProperties(['x', 'y', 'ah'], [pt.getX(), pt.getY(), true]);

        if (event.button == GUIMouseEvent.BUTTON_LEFT) {
            if (gPlatform.modifiers.optionKey) {
                anchorPt.setProperty('tp', 'S');
            } else {
                anchorPt.setProperty('tp', 'N');
            }
        } else { // BUTTON_RIGHT && this._AltDown
            anchorPt.setProperty('tp', 'C');
        }

        return anchorPt;
    };

    /**
     * For Append and Prepend mode checks if a point, newly added to preview, is the path other end point.
     * And if so, closes the path specific for Bezigon Tool way, and removes that extra point from preview.
     * @private
     */
    GXBezigonTool.prototype._closeIfNeeded = function () {
        if (this._pathRef && this._newPoint &&
            (this._mode == GXPathTool.Mode.Append || this._mode == GXPathTool.Mode.Prepend)) {

            var anchorPt;
            var otherPt;
            if (this._mode == GXPathTool.Mode.Append) {
                anchorPt = this._dpathRef.getAnchorPoints().getLastChild();
                otherPt = this._pathRef.getAnchorPoints().getFirstChild();
            } else { // this._mode == GXPathTool.Mode.Prepend
                anchorPt = this._dpathRef.getAnchorPoints().getFirstChild();
                otherPt = this._pathRef.getAnchorPoints().getLastChild();
            }

            if (otherPt && this._pathEditor.hitAnchorPoint(
                    otherPt, new GPoint(anchorPt.getProperty('x'), anchorPt.getProperty('y'))) ) {

                // Close path
                this._pathRef.beginUpdate();
                this._pathEditor.selectOnePoint(otherPt);
                if (gPlatform.modifiers.optionKey) {
                    otherPt.setProperties(['ah', 'tp'], [false, 'N']);
                }
                if (!otherPt.getProperty('ah')) {
                    otherPt.setProperties(['hlx', 'hly'], [anchorPt.getProperty('hlx') ,anchorPt.getProperty('hly')]);
                }
                this._dpathRef.getAnchorPoints().removeChild(anchorPt);
                this._pathRef.setProperty('closed', true);
                this._pathRef.endUpdate();
                this._pathEditor.requestInvalidation();
            }
        }
    };

    /** @override */
    GXBezigonTool.prototype._mouseRelease = function (event) {
        if (!this._released) {
            this._released = true;
            //this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
            if (this._mode == GXPathTool.Mode.Append || this._mode == GXPathTool.Mode.Prepend) {
                var clickPt = this._view.getViewTransform().mapPoint(event.client);
                this._updatePoint(clickPt);
                if (this._newPoint) {
                    this._closeIfNeeded();
                    if (!this._pathRef.getProperty('closed')) {
                        this._addPoint(this._editPt, false);
                    }
                } else if (this._editPt) {
                    this._pathEditor.applyTransform(this._pathRef);
                }
                this._commitChanges();
                // hit test result becomes invalid if any;
                //this._lastHitTest = new GXPathTool.LastHitTest();
            } else if (this._mode == GXPathTool.Mode.Edit && (this._editPt || this._refPt)) {
                if (this._dragStarted && this._editPt) {
                    clickPt = this._view.getViewTransform().mapPoint(event.client);
                    this._updatePoint(clickPt);
                    this._pathEditor.applyTransform(this._pathRef);
                    this._commitChanges();
                    // hit test result becomes invalid if any;
                    //this._lastHitTest = new GXPathTool.LastHitTest();
                } else {
                    if (this._editPt) { // The case when path has just been closed on mouseDown
                        this._commitChanges();
                    } else { // this._refPt
                        this._mouseNoDragReleaseOnEdit();
                    }
                }
            }
            this._dragStarted = false;
        }
    };

    /** override */
    GXBezigonTool.prototype.toString = function () {
        return "[Object GXBezigonTool]";
    };

    _.GXBezigonTool = GXBezigonTool;
})(this);
