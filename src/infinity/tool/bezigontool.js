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
        var anchorPt = null;
        var clickPt;

        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
        this._released = false;
        this._dragStarted = false;
        this._newPoint = null;
        this._editPt = null;

        if (event.button == GUIMouseEvent.BUTTON_LEFT ||
            event.button == GUIMouseEvent.BUTTON_RIGHT && gPlatform.modifiers.optionKey) {

            this._checkMode();
            clickPt = this._view.getViewTransform().mapPoint(event.client);

            if (this._mode == GXPathTool.Mode.Edit) {
                this._mouseDownOnEdit(clickPt);
            }

            this._updateCursor();
            if (this._mode != GXPathTool.Mode.Edit) {
                anchorPt = this._constructNewPoint(this._dpathRef, event, clickPt);
                this._addPoint(anchorPt, true);
            }
        }
    };

    GXBezigonTool.prototype._mouseDblClick = function (event) {
        // do not check mode here, as it has been just checked on _mouseDown
        if (this._mode != GXPathTool.Mode.Edit) {
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
     * @param {GUIMouseEvent.Drag} event
     * @private
     */
    GXBezigonTool.prototype._mouseDrag = function (event) {
        if (this._editPt) {
            var pt = this._view.getViewTransform().mapPoint(event.client);
            this._dragStarted = true;
            this._pathEditor.requestInvalidation();
            this._updatePoint(pt);
            this._pathEditor.requestInvalidation();
        }
        //this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
    };

    GXBezigonTool.prototype._updatePoint = function (pt) {
        var anchorPt;
        var otherPt;
        var dx, dy;
        var hval;

        if (this._dpathRef) {
            //if (this._mode == GXPathTool.Mode.Append && this._newPoint) {
             //   anchorPt = this._dpathRef.getLastChild();
            //    otherPt = anchorPt.getPrevious();
            //} else if (this._mode == GXPathTool.Mode.Edit && this._editPt) {
                anchorPt = this._editPt;
            //}

            this._dpathRef.beginUpdate();
            //if (gPlatform.modifiers.shiftKey && otherPt) {
            //    this._convertToConstrain(anchorPt, otherPt, pt.getX(), pt.getY());
            //} else if (anchorPt) {
                if (anchorPt.getProperty('ah') ||
                    anchorPt.getProperty('tp') == 'C') {
                    anchorPt.setProperties(['x', 'y'], [pt.getX(), pt.getY()]);
                } else {
                    dx = pt.getX() - anchorPt.getProperty(GXPath.AnchorPoint.PROPERTY_X);
                    dy = pt.getY() - anchorPt.getProperty(GXPath.AnchorPoint.PROPERTY_Y);
                    anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_X, pt.getX());
                    anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_Y, pt.getY());

                    hval = anchorPt.getProperty(GXPath.AnchorPoint.PROPERTY_HPREV_X);
                    if (hval != null) {
                        anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_X, hval + dx);
                    }
                    hval = anchorPt.getProperty(GXPath.AnchorPoint.PROPERTY_HPREV_Y);
                    if (hval != null) {
                        anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_Y, hval + dy);
                    }
                    hval = anchorPt.getProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_X);
                    if (hval != null) {
                        anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_X, hval + dx);
                    }
                    hval = anchorPt.getProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_Y);
                    if (hval != null) {
                        anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_Y, hval + dy);
                    }
                }
            //}
            this._dpathRef.endUpdate();
        }
    };

    GXBezigonTool.prototype._constructNewPoint = function (path, event, pt) {
        var anchorPt = null;
        var clickPt;
        var otherPt = null;

        if (pt) {
            clickPt = pt;
        } else {
            clickPt = this._view.getViewTransform().mapPoint(event.client);
        }
        anchorPt = new GXPath.AnchorPoint();
        anchorPt.setProperties(['x', 'y'], [clickPt.getX(), clickPt.getY()]);

        if (gPlatform.modifiers.shiftKey && path) {
            if (this._mode == GXPathTool.Mode.Append) {
                otherPt = path.getLastChild();
            } else if (this._mode == GXPathTool.Mode.Prepend) {
                otherPt = path.getFirstChild();
            }
            if (otherPt) {
                this._convertToConstrain(anchorPt, otherPt, clickPt.getX(), clickPt.getY());
            }
        }

        anchorPt.setProperty('ah', true);

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
            var vpt = new GXVertex();
            vpt.x = otherPt.getProperty('x');
            vpt.y = otherPt.getProperty('y');
            var px = anchorPt.getProperty('x');
            var py = anchorPt.getProperty('y');
            if (gMath.isEqualEps(px - vpt.x, 0, this._hitRaduis) &&
                gMath.isEqualEps(py - vpt.y, 0, this._hitRaduis)) {

                this._pathRef.beginUpdate();
                this._pathEditor.updatePartSelection(false, [{type: GXPathEditor.PartType.Point, point: otherPt}]);
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
        this._released = true;
        this._dragStarted = false;
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
            //
            //this._updatedVertices();

            // hit test result becomes invalid if any;
            //this._lastHitTest = new GXPathTool.LastHitTest();

            if (this._gpathRef && this._gpathRef.getProperty(GXPath.PROPERTY_CLOSED)) {
                this._gpathRef.resetSelectedPts();
                this._gpathRef.removeFlag(GXNode.Flag.Selected);
                this._reset();
            }
        } else if (this._mode == GXPathTool.Mode.Edit && this._editPt) {
            if (this._dragStarted) {
                clickPt = this._view.getViewTransform().mapPoint(event.client);
                this._updatePoint(clickPt);
                this._updatedVertices();
                this._gpathRef.commitDraft();
                // hit test result becomes invalid if any;
                this._lastHitTest = new GXPathTool.LastHitTest();
            } else {
                this._mouseNoDragReleaseOnEdit();
            }
        }

        this._newPoint = null;
        this._editPt = null;
    };

    /** override */
    GXBezigonTool.prototype.toString = function () {
        return "[Object GXBezigonTool]";
    };

    _.GXBezigonTool = GXBezigonTool;
})(this);
