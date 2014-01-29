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
    GXBezigonTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path d="M8,29.5c-1.4-1.4,3.5-9,3.5-9l1,1c-1,1.3-2,3-2.4,4c-0.8,1.5-0.9,2.3-0.9,2.3L14,23l2.5,2.5C16.5,25.5,9.3,30.7,8,29.5z\n\t M15.5,32c0,0.8-0.7,1.5-1.5,1.5c-0.7,0-1.2-0.4-1.4-1H7.5v2h-5v-5h2v-5.1c-0.6-0.2-1-0.8-1-1.4c0-0.8,0.7-1.5,1.5-1.5\n\ts1.5,0.7,1.5,1.5c0,0.7-0.4,1.2-1,1.4v5.1h2v2h5.1c0.2-0.6,0.8-1,1.4-1C14.8,30.5,15.5,31.2,15.5,32z M6.5,30.5h-3v3h3V30.5z" stroke="none"/>\n</svg>';
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
        this._dragStartPt = null;
        this._newPoint = null;
        this._editPt = null;

        if (event.button == GUIMouseEvent.BUTTON_LEFT ||
            event.button == GUIMouseEvent.BUTTON_RIGHT && gPlatform.modifiers.optionKey) {

            this._checkMode();

            if (this._mode == GXPathTool.Mode.Edit) {
                this._mouseDownOnEdit(event.client);
            }

            this._updateCursor();
            if (this._mode != GXPathTool.Mode.Edit) {
                clickPt = this._constrainIfNeeded(event.client, this._view.getWorldTransform(), this._pathRef);
                var otherPt;
                if (this._pathEditor) {
                    if (this._mode == GXPathTool.Mode.Append) {
                        otherPt = this._pathRef.getAnchorPoints().getFirstChild();
                    } else { // this._mode == GXPathTool.Mode.Prepend
                        otherPt = this._pathRef.getAnchorPoints().getLastChild();
                    }
                }

                if (otherPt && this._pathEditor.hitAnchorPoint(otherPt, clickPt, this._view.getWorldTransform())) {
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
                    if (prevPt && this._pathEditor.hitAnchorPoint(prevPt, clickPt, this._view.getWorldTransform())) {
                        this._makePointMajor(prevPt);
                        this._mode = GXPathTool.Mode.Edit;
                        this._editPt = this._pathEditor.getPathPointPreview(prevPt);
                        this._pathEditor.requestInvalidation();
                    } else {
                        // add new point
                        var pt = this._view.getViewTransform().mapPoint(clickPt);
                        anchorPt = this._constructNewPoint(event, pt);
                        this._addPoint(anchorPt, true, false);
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
            this._dragStartPt = this._refPt;
            this._pathEditor.requestInvalidation();
            this._refPt = null;
        }
        if (this._editPt && !this._released) {
            this._dragStarted = true;
            this._pathEditor.requestInvalidation();
            this._updatePoint(event.client);
            this._pathEditor.requestInvalidation();
        }
        //this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
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

            var location = new GPoint(anchorPt.getProperty('x'), anchorPt.getProperty('y'));
            var transform = this._pathRef.getProperty('transform');
            location = transform ? transform.mapPoint(location) : location;

            if (otherPt && this._pathEditor.hitAnchorPoint(otherPt, location) ) {
                // Close path
                this._pathRef.beginUpdate();
                this._pathEditor.selectOnePoint(otherPt);
                if (gPlatform.modifiers.optionKey) {
                    otherPt.setProperties(['ah', 'tp'], [false, 'N']);
                }
                if (!otherPt.getProperty('ah')) {
                    otherPt.setProperties(['hlx', 'hly'], [anchorPt.getProperty('hlx'), anchorPt.getProperty('hly')]);
                }
                this._dpathRef.getAnchorPoints().removeChild(anchorPt);
                this._dpathRef.setProperty('closed', true);
                this._pathRef.setProperty('closed', true);
                this._pathRef.endUpdate();
                this._pathEditor.requestInvalidation();
                this._newPoint = false;
            }
        }
    };

    /** @override */
    GXBezigonTool.prototype._mouseRelease = function (event) {
        if (!this._released) {
            this._released = true;
            //this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
            if (this._mode == GXPathTool.Mode.Append || this._mode == GXPathTool.Mode.Prepend) {
                this._updatePoint(event.client);
                if (this._newPoint) {
                    this._closeIfNeeded();
                    if (!this._pathRef.getProperty('closed')) {
                        this._addPoint(this._editPt, false, true);
                    }
                } else if (this._editPt) {
                    this._pathEditor.applyTransform(this._pathRef);
                }
                this._commitChanges();
                // hit test result becomes invalid if any;
                //this._lastHitTest = new GXPathTool.LastHitTest();
            } else if (this._mode == GXPathTool.Mode.Edit && (this._editPt || this._refPt)) {
                if (this._dragStarted && this._editPt) {
                    this._updatePoint(event.client);
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
            this._dragStartPt = null;
        }
    };

    /** override */
    GXBezigonTool.prototype.toString = function () {
        return "[Object GXBezigonTool]";
    };

    _.GXBezigonTool = GXBezigonTool;
})(this);
