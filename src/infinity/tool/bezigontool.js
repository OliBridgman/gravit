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
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path d="M7.8,29.3c-1.8-1.7,4.4-10.8,4.4-10.8l1.3,1.2c-1.3,1.5-2.5,3.6-3.1,4.7c-1,1.8-1.1,2.7-1.1,2.7l6-5.7l3.1,3\n\tC18.5,24.5,9.5,30.7,7.8,29.3z M18.5,33c0,0.8-0.7,1.5-1.5,1.5c-0.7,0-1.2-0.4-1.4-1H7.5v3h-7v-7h3v-8.1c-0.6-0.2-1-0.8-1-1.4\n\tc0-0.8,0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5c0,0.7-0.4,1.2-1,1.4v8.1h3v3h8.1c0.2-0.6,0.8-1,1.4-1C17.8,31.5,18.5,32.2,18.5,33z\n\t M6.5,30.5h-5v5h5V30.5z" stroke="none"/>\n</svg>';
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
    GXBezigonTool.prototype.activate = function (view) {
        GXPathTool.prototype.activate.call(this, view);
        view.addEventListener(GUIMouseEvent.Drag, this._mouseDrag, this);
        view.addEventListener(GUIMouseEvent.Move, this._mouseMove, this);
        this._checkMode();
    };

    /** @override */
    GXBezigonTool.prototype.deactivate = function (view) {
        GXPathTool.prototype.deactivate.call(this, view);
        view.removeEventListener(GUIMouseEvent.Drag, this._mouseDrag);
        view.removeEventListener(GUIMouseEvent.Move, this._mouseMove);
    };

    /**
     * @param {GUIMouseEvent.Down} event
     * @private
     */
    GXBezigonTool.prototype._mouseDown = function (event) {
        var tm = new Date().getTime();
        if (tm - this._mDownTime < GXPathTool.DBLCLICKTM) {
            // Double-click
            this._mouseDblClick(event);
            return;
        }

        this._mDownTime = tm;
        this._lastMouseEvent = event;
        var anchorPt = null;
        var clickPt;
        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
        this._dragStarted = false;
        this._dragStartPt = null;
        this._newPoint = null;
        this._editPt = null;

        if (event.button == GUIMouseEvent.BUTTON_LEFT ||
            event.button == GUIMouseEvent.BUTTON_RIGHT && gPlatform.modifiers.optionKey) {
            this._released = false;

            this._blockDeactivation();
            this._checkMode();
            this._renewPreviewLink();

            if (this._mode == GXPathTool.Mode.Edit) {
                this._mouseDownOnEdit(event.client);
            }

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

                if (otherPt && this._pathEditor.hitAnchorPoint(otherPt, clickPt, this._view.getWorldTransform(), this._scene.getProperty('pickDist'))) {
                    this._setCursorForPosition(GUICursor.PenEnd);
                    this._startTransaction(GXPathTool.Transaction.ModifyPathProperties);
                    // Close path
                    this._pathRef.setProperty('closed', true);
                    this._makePointMajor(otherPt);
                    this._pathEditor.setActiveExtendingMode(false);
                    this._mode = GXPathTool.Mode.Edit;
                    this._editPt = this._pathEditor.getPathPointPreview(otherPt);
                    this._pathEditor.requestInvalidation();
                } else {
                    this._setCursorForPosition(GUICursor.Pen);
                    var prevPt;
                    if (this._pathEditor) {
                        if (this._mode == GXPathTool.Mode.Append) {
                            prevPt = this._pathRef.getAnchorPoints().getLastChild();
                        } else { // this._mode == GXPathTool.Mode.Prepend
                            prevPt = this._pathRef.getAnchorPoints().getFirstChild();
                        }
                    }
                    if (prevPt && this._pathEditor.hitAnchorPoint(prevPt, clickPt, this._view.getWorldTransform(), this._scene.getProperty('pickDist'))) {
                        this._makePointMajor(prevPt);
                        this._editPt = this._pathEditor.getPathPointPreview(prevPt);
                        this._pathEditor.requestInvalidation();
                    } else {
                        // add new point
                        var pt = this._view.getViewTransform().mapPoint(clickPt);
                        this._editor.getGuides().beginMap();
                        pt = this._editor.getGuides().mapPoint(pt);
                        anchorPt = this._constructNewPoint(event, pt);
                        this._addPoint(anchorPt, true, false);
                        this._editor.getGuides().finishMap();
                    }
                }
            }
        }
    };

    /**
     * @param {GUIMouseEvent.Move} event
     * @private
     */
    GXBezigonTool.prototype._mouseMove = function (event) {
        if (!this._released) {
            if (event.button == GUIMouseEvent.BUTTON_RIGHT && gPlatform.modifiers.optionKey) {
                this._mouseDrag(event);
            }
            return;
        }

        this._lastMouseEvent = event;
        this._setCursorForPosition(null, event.client);
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
            this._lastMouseEvent = event;
            this._dragStarted = true;
            this._pathEditor.requestInvalidation();
            var newPos = this._updatePoint(event.client);
            var otherPt;
            if (this._newPoint ||
                this._pathRef.getAnchorPoints().getFirstChild() != this._pathRef.getAnchorPoints().getLastChild()) {

                if (this._editPt == this._dpathRef.getAnchorPoints().getLastChild()) {
                    otherPt = this._pathRef.getAnchorPoints().getFirstChild();
                } else if (this._editPt == this._dpathRef.getAnchorPoints().getFirstChild()) {
                    otherPt = this._pathRef.getAnchorPoints().getLastChild();
                }

                if (otherPt && this._pathEditor.hitAnchorPoint(otherPt, newPos, this._view.getWorldTransform(), this._scene.getProperty('pickDist'))) {
                    this._setCursorForPosition(GUICursor.PenEnd);
                } else {
                    this._setCursorForPosition(GUICursor.Pen);
                }
            } else {
                this._setCursorForPosition(GUICursor.Pen);
            }

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
                anchorPt.setProperty('tp', GXPathBase.AnchorPoint.Type.Symmetric);
            } else {
                anchorPt.setProperty('tp', GXPathBase.AnchorPoint.Type.Asymmetric);
            }
        } else { // BUTTON_RIGHT && this._AltDown
            anchorPt.setProperty('tp', GXPathBase.AnchorPoint.Type.Connector);
        }

        return anchorPt;
    };

    /**
     * For Append and Prepend mode checks if a point, newly added to preview, is the path other end point.
     * And if so, closes the path specific for Bezigon Tool way, and removes that extra point from preview.
     * @private
     */
    GXBezigonTool.prototype._closeIfNeeded = function () {
        if (this._pathRef &&
            (this._newPoint ||
                this._pathRef.getAnchorPoints().getFirstChild() != this._pathRef.getAnchorPoints().getLastChild()) &&
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
            var transform = this._pathRef.getTransform();
            location = transform ? transform.mapPoint(location) : location;

            if (otherPt && this._pathEditor.hitAnchorPoint(otherPt, location, null, this._scene.getProperty('pickDist')) ) {
                if (this._transactionType == GXPathTool.Transaction.NoTransaction) {
                    this._startTransaction(GXPathTool.Transaction.ModifyPathProperties);
                } else {
                    this._transactionType = GXPathTool.Transaction.ModifyPathProperties;
                }
                // Close path
                this._pathRef.beginUpdate();
                this._pathEditor.selectOnePoint(otherPt);
                if (gPlatform.modifiers.optionKey) {
                    otherPt.setProperties(['ah', 'tp'], [false, GXPathBase.AnchorPoint.Type.Asymmetric]);
                }
                if (!otherPt.getProperty('ah')) {
                    otherPt.setProperties(['hlx', 'hly'], [anchorPt.getProperty('hlx'), anchorPt.getProperty('hly')]);
                }
                this._dpathRef.getAnchorPoints().removeChild(anchorPt);
                if (!this._newPoint) {
                    if (this._mode == GXPathTool.Mode.Append) {
                        anchorPt = this._pathRef.getAnchorPoints().getLastChild();
                    } else { // this._mode == GXPathTool.Mode.Prepend
                        anchorPt = this._pathRef.getAnchorPoints().getFirstChild();
                    }
                    this._pathRef.getAnchorPoints().removeChild(anchorPt);
                }
                this._dpathRef.setProperty('closed', true);
                this._pathRef.setProperty('closed', true);
                this._pathRef.endUpdate();
                this._pathEditor.requestInvalidation();
                this._pathEditor.setActiveExtendingMode(false);
                this._newPoint = false;
            }
        }
    };

    /** @override */
    GXBezigonTool.prototype._mouseRelease = function (event) {
        if (!this._released) {
            try {
                this._released = true;
                //this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
                if (this._mode == GXPathTool.Mode.Append || this._mode == GXPathTool.Mode.Prepend) {
                    var newPos = this._updatePoint(event.client);
                    this._closeIfNeeded();
                    if (this._pathRef.getProperty('closed')) {
                        this._setCursorForPosition(GUICursor.PenMinus);
                        this._mode = GXPathTool.Mode.Edit;
                    } else if (this._newPoint) {
                        this._addPoint(this._editPt, false, true);
                        this._setCursorForPosition(GUICursor.Pen);
                    } else if (this._editPt) {
                        if (this._transactionType == GXPathTool.Transaction.NoTransaction) {
                            this._startTransaction(GXPathTool.Transaction.MovePoint);
                        }
                        this._pathEditor.applyTransform(this._pathRef);
                        this._setCursorForPosition(GUICursor.PenEnd);
                    }
                    this._commitChanges();
                    // hit test result becomes invalid if any;
                    //this._lastHitTest = new GXPathTool.LastHitTest();
                } else if (this._mode == GXPathTool.Mode.Edit && (this._editPt || this._refPt)) {
                    if (this._dragStarted && this._editPt) {
                        var newPos = this._updatePoint(event.client);
                        if (this._transactionType == GXPathTool.Transaction.NoTransaction) {
                            this._startTransaction(GXPathTool.Transaction.MovePoint);
                        }
                        this._pathEditor.applyTransform(this._pathRef);
                        this._setCursorForPosition(null, newPos);
                        this._commitChanges();
                        // hit test result becomes invalid if any;
                        //this._lastHitTest = new GXPathTool.LastHitTest();
                    } else {
                        if (this._editPt) { // The case when path has just been closed on mouseDown
                            this._commitChanges();
                        } else { // this._refPt
                            this._mouseNoDragReleaseOnEdit(event.client);
                        }
                    }
                }
                this._dragStarted = false;
                this._dragStartPt = null;
            } finally {
                this._finishTransaction();
            }
        }
        this._lastMouseEvent = null;

        this._allowDeactivation();
    };

    /** override */
    GXBezigonTool.prototype.toString = function () {
        return "[Object GXBezigonTool]";
    };

    _.GXBezigonTool = GXBezigonTool;
})(this);
