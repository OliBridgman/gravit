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
            if (this._mode == GXPathTool.Mode.Append) {
                anchorPt = this._constructNewPoint(event, clickPt);
                this._newPoint = anchorPt;
                anchorPt.setFlag(GXNode.Flag.Selected);
                if (this._gpathRef) {
                    this._gpathRef.resetSelectedPts();
                    this._dpathRef.appendAnchorPoint(anchorPt);
                    this._updatedVertices();
                }
            }
        }
    };

    GXBezigonTool.prototype._mouseDblClick = function (event) {
        var anchorPt;

        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());

        if (this._mode == GXPathTool.Mode.Append) {
            anchorPt = this._constructNewPoint(event);
            if (this._gpathRef) {
                this._dpathRef.appendAnchorPoint(anchorPt);
                this._closeIfNeeded();
                this._updatedVertices();
            } else {
                this._createAndAppendPath(anchorPt);
            }
            this._gpathRef.commitDraft();
            this._gpathRef.resetSelectedPts();
            this._gpathRef.removeFlag(GXNode.Flag.Selected);
        }

        this._reset();
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

        curPt = this._view.getViewTransform().mapPoint(event.client);
        this._checkMode();
        this._makeHitTest(curPt);
        this._updateCursor();
    };

    /**
     * @param {GUIMouseEvent.Drag} event
     * @private
     */
    GXBezigonTool.prototype._mouseDrag = function (event) {
        var pt = this._view.getViewTransform().mapPoint(event.client);
        this._dragStarted = true;
        this._updatePoint(pt);
        this._updatedVertices();
        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
    };

    GXBezigonTool.prototype._updatePoint = function (pt) {
        var anchorPt;
        var otherPt;
        var dx, dy;
        var hval;

        if (this._dpathRef) {
            if (this._mode == GXPathTool.Mode.Append && this._newPoint) {
                anchorPt = this._dpathRef.getLastChild();
                otherPt = anchorPt.getPrevious();
            } else if (this._mode == GXPathTool.Mode.Edit && this._editPt) {
                anchorPt = this._editPt;
            }

            this._gpathRef.beginUpdate();
            if (gPlatform.modifiers.shiftKey && otherPt) {
                this._convertToConstrain(anchorPt, otherPt, pt.getX(), pt.getY());
            } else if (anchorPt) {
                if (anchorPt.getProperty(GXPath.AnchorPoint.PROPERTY_AUTO_HANDLES) ||
                    anchorPt.getProperty(GXPath.AnchorPoint.PROPERTY_CTYPE) == GXPath.AnchorPoint.CType.Connector) {
                    anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_X, pt.getX());
                    anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_Y, pt.getY());
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
            }
            this._gpathRef.endUpdate();
        }
    };

    GXBezigonTool.prototype._constructNewPoint = function (event, pt) {
        var anchorPt = null;
        var clickPt;
        var otherPt = null;

        if (pt) {
            clickPt = pt;
        } else {
            clickPt = this._view.getViewTransform().mapPoint(event.client);
        }
        anchorPt = new GXPath.AnchorPoint(clickPt);

        if (gPlatform.modifiers.shiftKey && this._gpathRef) {
            if (this._mode == GXPathTool.Mode.Append) {
                otherPt = this._dpathRef.getLastChild();
            }
            if (otherPt) {
                this._convertToConstrain(anchorPt, otherPt, clickPt.getX(), clickPt.getY());
            }
        }

        anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_AUTO_HANDLES, true);

        if (event.button == GUIMouseEvent.BUTTON_LEFT) {
            if (gPlatform.modifiers.optionKey) {
                anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Smooth);
            } else {
                anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Regular);
            }
        } else { // BUTTON_RIGHT && this._AltDown
            anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Connector);
        }

        return anchorPt;
    };

    GXBezigonTool.prototype._closeIfNeeded = function () {
        var vpt;
        var anchorPt;
        var otherPt;
        var px, py;

        if (this._gpathRef && this._mode == GXPathTool.Mode.Append) {
            vpt = new GXVertex();
            anchorPt = this._dpathRef.getLastChild();
            otherPt = this._dpathRef.getFirstChild();
            otherPt.vertexCoord(vpt);
            px = anchorPt.getProperty(GXPath.AnchorPoint.PROPERTY_X);
            py = anchorPt.getProperty(GXPath.AnchorPoint.PROPERTY_Y);
            if (gMath.isEqualEps(px - vpt.x, 0, this._hitRaduis) &&
                gMath.isEqualEps(py - vpt.y, 0, this._hitRaduis)) {

                this._gpathRef.beginUpdate();
                if (gPlatform.modifiers.optionKey) {
                    otherPt.setProperty(GXPath.AnchorPoint.PROPERTY_AUTO_HANDLES, false);
                    otherPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Regular);
                }
                if (!otherPt.getProperty(GXPath.AnchorPoint.PROPERTY_AUTO_HANDLES)) {
                    otherPt.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_X,
                        anchorPt.getProperty(GXPath.AnchorPoint.PROPERTY_HPREV_X));
                    otherPt.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_Y,
                        anchorPt.getProperty(GXPath.AnchorPoint.PROPERTY_HPREV_Y));
                }
                this._dpathRef.removeAnchorPoint(anchorPt);
                this._gpathRef.setProperty(GXPath.PROPERTY_CLOSED, true);
                this._gpathRef.endUpdate();
            }
        }
    };

    /** @override */
    GXBezigonTool.prototype._mouseRelease = function (event) {
        var anchorPt;
        var clickPt;
        var otherPt;

        this._released = true;

        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
        if (this._newPoint && this._mode == GXPathTool.Mode.Append) {
            if (!this._gpathRef) {
                anchorPt = this._constructNewPoint(event);
                this._createAndAppendPath(anchorPt);
            } else {
                clickPt = this._view.getViewTransform().mapPoint(event.client);
                this._updatePoint(clickPt);
                this._closeIfNeeded();
                this._updatedVertices();
                this._gpathRef.commitDraft();
                // hit test result becomes invalid if any;
                this._lastHitTest = new GXPathTool.LastHitTest();
            }
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
        this._dragStarted = false;
    };

    /** override */
    GXBezigonTool.prototype.toString = function () {
        return "[Object GXBezigonTool]";
    };

    _.GXBezigonTool = GXBezigonTool;
})(this);
