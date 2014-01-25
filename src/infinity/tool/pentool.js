(function (_) {
    /**
     * The pen tool
     * @class GXPenTool
     * @extends GXPathTool
     * @constructor
     * @version 1.0
     */
    function GXPenTool() {
        GXPathTool.call(this);
    }

    GObject.inherit(GXPenTool, GXPathTool);

    /** @override */
    GXPenTool.prototype.getGroup = function () {
        return 'draw';
    };

    /** @override */
    GXPenTool.prototype.getImageClass = function () {
        return 'g-tool-pen';
    };

    /** @override */
    GXPenTool.prototype.getHint = function () {
        return GXPathTool.prototype.getHint.call(this)
            .addKey(GUIKey.Constant.OPTION, new GLocale.Key(GXPenTool, "shortcut.option"), true)
            .addKey(GUIKey.Constant.SHIFT, new GLocale.Key(GXPenTool, "shortcut.shift"), true)
            .setTitle(new GLocale.Key(GXPenTool, "title"));
    };

    /** @override */
    GXPenTool.prototype.getActivationCharacters = function () {
        return ['P'];
    };

    /** @override */
    GXPenTool.prototype.activate = function (view, layer) {
        GXPathTool.prototype.activate.call(this, view, layer);
        layer.addEventListener(GUIMouseEvent.Drag, this._mouseDrag, this);
        layer.addEventListener(GUIMouseEvent.Move, this._mouseMove, this);
    };

    /** @override */
    GXPenTool.prototype.deactivate = function (view, layer) {
        GXPathTool.prototype.deactivate.call(this, view, layer);
        layer.removeEventListener(GUIMouseEvent.Drag, this._mouseDrag);
        layer.removeEventListener(GUIMouseEvent.Move, this._mouseMove);
    };

    /**
     * @param {GUIMouseEvent.Down} event
     * @private
     */
    GXPenTool.prototype._mouseDown = function (event) {
        var tm = new Date().getTime();
        if (tm - this._mDownTime < 300) {
            // Double-click
            return;
        }

        this._mDownTime = tm;

        var anchorPt = null;
        var clickPt;
        var pt;
        var px, py, hx, hy;
        var firstPt;
        var fv;

        //this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
        this._released = false;
        this._dragStarted = false;
        this._dragStartPt = null;

        if (event.button == GUIMouseEvent.BUTTON_LEFT ||
            event.button == GUIMouseEvent.BUTTON_RIGHT && gPlatform.modifiers.optionKey) {

            this._checkMode();

            if (this._mode == GXPathTool.Mode.Edit) {
                this._mouseDownOnEdit(event.client);
            }

            this._updateCursor();
            if (this._mode != GXPathTool.Mode.Edit) {
                if (this._newPoint && this._pathEditor) {
                    this._updatePoint(event.client);
                    // TODO: update point type
                    this._closeIfNeeded(true); // close preview
                    if (!this._pathRef.getProperty('closed')) {
                        //TODO: remove handles if clicked to previous point
                    } else {
                        // TODO: switch refPoint
                        if (this._mode == GXPathTool.Mode.Append) {
                            this._refPt = this._pathRef.getAnchorPoints().getFirstChild();
                        } else { // this._mode == GXPathTool.Mode.Prepend
                            this._refPt = this._pathRef.getAnchorPoints().getLastChild();
                        }
                    }
                    this._pathEditor.requestInvalidation();
                } else {
                    // add new point
                    var pt = this._view.getViewTransform().mapPoint(event.client);
                    anchorPt = this._constructNewPoint(event, pt);
                    this._addPoint(anchorPt, true, false);
                }

                /*
                if (this._gpathRef) {
                    this._gpathRef.resetSelectedPts();
                    anchorPt = this._dpathRef.getLastChild();
                    this._gpathRef.beginUpdate();
                } else {
                    anchorPt = new GXPath.AnchorPoint(clickPt);
                }
                anchorPt.setFlag(GXNode.Flag.Selected);

                px = clickPt.getX();
                py = clickPt.getY();
                this._newPoint = anchorPt;

                if (event.button == GUIMouseEvent.BUTTON_LEFT) {
                    if (gPlatform.modifiers.shiftKey && this._gpathRef) {
                        this._convertToConstrain(anchorPt, this._pathRef.getLastChild(), px, py);
                    }
                    if (!gPlatform.modifiers.optionKey) {
                        this._closeIfNeeded();
                    }
                } else { // BUTTON_RIGHT && AltDown
                    anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Connector);
                    pt = anchorPt.getPrevious();
                    if (pt && pt.getProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_X) != null) {
                        hx = px + (pt.getProperty(GXPath.AnchorPoint.PROPERTY_X) - px) * GXPath.AnchorPoint.HANDLE_COEFF;
                        hy = py + (pt.getProperty(GXPath.AnchorPoint.PROPERTY_Y) - py) * GXPath.AnchorPoint.HANDLE_COEFF;
                        if (!gMath.isEqualEps(px - hx, 0) || !gMath.isEqualEps(py - hy, 0)) {
                            anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_X, hx);
                            anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_Y, hy);
                        }
                    }
                }

                if (this._gpathRef) {
                    this._gpathRef.endUpdate();
                    this._updatedVertices();
                }
                */
            }
        }
        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
    };

    GXPenTool.prototype._closeIfNeeded = function (draft) {
        var vpt;
        var anchorPt;
        var otherPt;
        var px, py;
        return;
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
                otherPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Regular);
                otherPt.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_X, null);
                otherPt.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_Y, null);
                this._dpathRef.removeAnchorPoint(anchorPt);
                this._gpathRef.setProperty(GXPath.PROPERTY_CLOSED, true);
                // hit test result becomes invalid if any;
                this._lastHitTest = new GXPathTool.LastHitTest();
                this._mode = GXPathTool.Mode.Edit;
                this._newPoint = null;
                this._gpathRef.resetSelectedPts();
                this._editPt = this._dpathRef.getFirstChild();
                this._editPt.setFlag(GXNode.Flag.Selected);
                this._gpathRef.endUpdate();
            }
        }
    };

    /**
     * @param {GUIMouseEvent.Move} event
     * @private
     */
    GXPenTool.prototype._mouseMove = function (event) {
        var curPt;
        var prevPt = null;
        var anchorPt;

        if (!this._released) {
            if (event.button == GUIMouseEvent.BUTTON_RIGHT && gPlatform.modifiers.optionKey) {
                this._rightDrag(event);
            }
            return;
        }

        this._checkMode();
        if (this._mode == GXPathTool.Mode.Edit) {
            //this._makeHitTest(curPt);
            //this._updateCursor();
        } else { // _mode == Append || Prepend
            if (!this._newPoint && this._pathEditor) {
                var clickPt = this._constrainIfNeeded(event.client, this._view.getWorldTransform(), this._pathRef);
                // add new point
                clickPt = this._view.getViewTransform().mapPoint(clickPt);
                anchorPt = this._constructNewPoint(event, clickPt);
                this._addPoint(anchorPt, true, false);
            } else if (this._editPt) {
                this._pathEditor.requestInvalidation();
                this._updatePoint(event.client);
                this._pathEditor.requestInvalidation();
            }
        /*
        curPt = this._view.getViewTransform().mapPoint(event.client);

        if (this._mode == GXPathTool.Mode.Edit) {
            this._makeHitTest(curPt);
            this._updateCursor();
        } else { // _mode == Append
            if (this._gpathRef) {
                prevPt = this._dpathRef.getLastChild().getPrevious();
            }

            if (prevPt) {
                anchorPt = this._dpathRef.getLastChild();
                this._gpathRef.beginUpdate();
                if (gPlatform.modifiers.shiftKey) {
                    this._convertToConstrain(anchorPt, prevPt, curPt.getX(), curPt.getY());
                } else {
                    anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_X, curPt.getX());
                    anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_Y, curPt.getY());
                }
                this._gpathRef.endUpdate();
                this._updatedVertices();
            }
        }

        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
        */
        }
    };


    /**
     * @param {GUIMouseEvent.Move} event with right mouse button pressed
     * @private
     */
    GXPenTool.prototype._rightDrag = function (event) {
        var clickPt;
        var anchorPt;
        var vertexPt = new GXVertex();
        var dirLen, hLen;
        var prevPt;
        var vPrev = new GXVertex();
        var ex, ey;

        this._dragStarted = true;
        if (!this._dragStartPt) {
            this._dragStartPt = this._editPt;
        }
        return;


        if (this._gpathRef) {
            if (this._mode == GXPathTool.Mode.Append) {
                anchorPt = this._dpathRef.getLastChild();
            } else if (this._editPt) { // && this._mode == GXPathTool.Mode.Edit
                anchorPt = this._editPt;
            }
            this._gpathRef.beginUpdate();
        } else if (this._newPoint) { // assume this._mode == GXPathTool.Mode.Append
            anchorPt = this._newPoint;
        }

        if (!anchorPt) {
            return;
        }

        anchorPt.vertexCoord(vertexPt);
        clickPt = this._view.getViewTransform().mapPoint(event.client);

        anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Connector);
        anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_X, null);
        anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_Y, null);

        // calculate right handle to be projection of click point to the vector,
        // connecting previous point and this one
        prevPt = anchorPt.getPrevious();
        if (prevPt && !(gMath.isEqualEps(clickPt.getX() - vertexPt.x, 0) && gMath.isEqualEps(clickPt.getY() - vertexPt.y, 0))) {

            prevPt.vertexCoord(vPrev);
            dirLen = Math.sqrt(gMath.ptSqrDist(vertexPt.x, vertexPt.y, vPrev.x, vPrev.y));
            if (!gMath.isEqualEps(dirLen, 0)) {
                ex = (vertexPt.x - vPrev.x) / dirLen;
                ey = (vertexPt.y - vPrev.y) / dirLen;
                hLen = gMath.vDotProduct(ex, ey, clickPt.getX() - vertexPt.x, clickPt.getY() - vertexPt.y);
                if (hLen > 0) {
                    anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_X, vertexPt.x + ex * hLen);
                    anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_Y, vertexPt.y + ey * hLen);
                }
            }
        }

        if (this._gpathRef) {
            this._gpathRef.endUpdate();
            this._updatedVertices();
        }

        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
    };

    GXPenTool.prototype._updateHandles = function (newPos) {
        var transformToNewPos = this._pathEditor.getTransformFromNative(this._view.getWorldTransform());
        var transformToNative = transformToNewPos.inverted();
        var newNativePos = transformToNative.mapPoint(newPos);

        var tp = this._editPt.getProperty('tp');
        var ptx = this._editPt.getProperty('x');
        var pty = this._editPt.getProperty('y');
        var hlx, hly, hrx, hry;
        if (this._mode == GXPathTool.Mode.Append) {
            if (tp != 'C') {
                hrx = newNativePos.getX();
                hry = newNativePos.getY();
                hlx = ptx + ptx - hrx;
                hly = pty + pty - hry;
                this._editPt.setProperties(['tp', 'hlx', 'hly', 'hrx', 'hry'],
                    ['S', hlx, hly, hrx, hry]);
            }
            // TODO: make for connector point
        } else { // this._mode == GXPathTool.Mode.Prepend
            if (tp != 'C') {
                hlx = newNativePos.getX();
                hly = newNativePos.getY();
                hrx = ptx + ptx - hlx;
                hry = pty + pty - hly;
                this._editPt.setProperties(['tp', 'hlx', 'hly', 'hrx', 'hry'],
                    ['S', hlx, hly, hrx, hry]);
            }
        }
        this._pathEditor.requestInvalidation();
    };

    /**
     * @param {GUIMouseEvent.Drag} event
     * @private
     */
    GXPenTool.prototype._mouseDrag = function (event) {
        if (!this._released && this._editPt) {
            if (!this._dragStarted) {
                this._dragStartPt = this._editPt;
                // TODO: update point type
            }
            this._dragStarted = true;
            var clickPt = this._constrainIfNeeded(
                event.client, this._view.getWorldTransform(), this._pathRef, this._dragStartPt);

            this._pathEditor.requestInvalidation();
            this._updateHandles(clickPt);
            this._pathEditor.requestInvalidation();
        }
        return;

        var clickPt;
        var anchorPt;
        var vertexPt = new GXVertex();
        var handlePt;

        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
        this._dragStarted = true;

        if (this._gpathRef) {
            if (this._mode == GXPathTool.Mode.Append) {
                anchorPt = this._dpathRef.getLastChild();
            } else if (this._editPt) { // && this._mode == GXPathTool.Mode.Edit
                anchorPt = this._editPt;
            }
            this._gpathRef.setWorkingPath(this._dpathRef);
            this._gpathRef.beginUpdate();
        } else if (this._newPoint) {  // assume this._mode == GXPathTool.Mode.Append
            anchorPt = this._newPoint;
        }

        if (!anchorPt) {
            return;
        }

        anchorPt.vertexCoord(vertexPt);
        clickPt = this._view.getViewTransform().mapPoint(event.client);

        if (gPlatform.modifiers.shiftKey) {
            handlePt = gMath.convertToConstrain(vertexPt.x, vertexPt.y,
                clickPt.getX(), clickPt.getY());
        } else {
            handlePt = clickPt;
        }

        if (gMath.isEqualEps(handlePt.getX() - vertexPt.x, 0) && gMath.isEqualEps(handlePt.getY() - vertexPt.y, 0)) {
            if (anchorPt.getProperty(GXPath.AnchorPoint.PROPERTY_CTYPE) == GXPath.AnchorPoint.CType.Regular) {
                anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_X, null);
                anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_Y, null);
            } else {
                anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Regular);
                anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_X, null);
                anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_Y, null);
                anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_X, null);
                anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_Y, null);
            }
        } else {
            anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_X, handlePt.getX());
            anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HNEXT_Y, handlePt.getY());
            if (!gPlatform.modifiers.optionKey) {
                // we need to construct the left handle to be in line with the right one
                anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_X, vertexPt.x + vertexPt.x - handlePt.getX());
                anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_HPREV_Y, vertexPt.y + vertexPt.y - handlePt.getY());
                anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Smooth);
            }
        }

        if (this._gpathRef) {
            this._gpathRef.endUpdate();
            this._updatedVertices();
        }
    };

    /**
     * Constructs new point, specific to Pen Tool, with the given position
     * @param {GUIMouseEvent} event used to define pressed button
     * @param {GPoint} pt - coordinates to be used for new position in world system
     * @returns {GXPath.AnchorPoint} newly created anchor point
     * @private
     */
    GXPenTool.prototype._constructNewPoint = function (event, pt) {
        var anchorPt = null;
        //if (event.button == GUIMouseEvent.BUTTON_LEFT ||
        //    event.button == GUIMouseEvent.BUTTON_RIGHT && gPlatform.modifiers.optionKey) {

            anchorPt = new GXPath.AnchorPoint();
            anchorPt.setProperties(['x', 'y'], [pt.getX(), pt.getY()]);

       //     if (event.button == GUIMouseEvent.BUTTON_RIGHT && gPlatform.modifiers.optionKey) {
         //       anchorPt.setProperty('tp', 'C');
        //    }
        //}

        return anchorPt;
    };

    /** @override */
    GXPenTool.prototype._mouseRelease = function (event) {
        var anchorPt;

        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
        this._released = true;
        if (this._pathEditor && this._mode == GXPathTool.Mode.Edit) {
            if (!this._dragStarted && this._editPt) {
                this._mouseNoDragReleaseOnEdit();
            } else if (this._dragStarted) {
                // TODO: apply
                this._commitChanges();
            } else {
                // NOOP
                this._commitChanges();
            }
        } else { // no new path is created yet, or it is openned and mode is Append
            if (this._newPoint) {
                if (this._dragStarted) {
                    // TODO: apply
                }
                if (!this._dpathRef.getProperty('closed')) {
                    this._addPoint(this._editPt, false, true);
                    //this._pathEditor.requestInvalidation();
                    if (this._mode == GXPathTool.Mode.Append) {
                        this._refPt = this._pathRef.getAnchorPoints().getLastChild();
                    } else { // this._mode == GXPathTool.Mode.Prepend
                        this._refPt = this._pathRef.getAnchorPoints().getFirstChild();
                    }
                } else {
                    if (this._mode == GXPathTool.Mode.Append) {
                        this._refPt = this._pathRef.getAnchorPoints().getFirstChild();
                    } else { // this._mode == GXPathTool.Mode.Prepend
                        this._refPt = this._pathRef.getAnchorPoints().getLastChild();
                    }
                }
                this._makePointMajor(this._refPt);
                this._mode = GXPathTool.Mode.Edit;
                this._commitChanges();
                /*
                if (!this._gpathRef) {
                    this._createAndAppendPath(this._newPoint);
                }
                this._gpathRef.commitDraft();
                // hit test result becomes invalid if any;
                this._lastHitTest = new GXPathTool.LastHitTest();
                anchorPt = this._constructNewPoint(event);
                if (anchorPt) {
                    this._dpathRef.appendAnchorPoint(anchorPt);
                }
                this._updatedVertices();
                */
            }

            this._newPoint = null;
        }
        this._dragStarted = false;
        this._dragStartPt = null;
    };

    /** @override */
    GXPenTool.prototype._tabAction = function () {
        var prevPt = null;

        // Action should be taken only if mouse released
        if (this._released) {
            this._checkMode();
            if (this._gpathRef && this._mode == GXPathTool.Mode.Append) {
                prevPt = this._dpathRef.getLastChild().getPrevious();
                if (prevPt) {
                    this._dpathRef.removeAnchorPoint(this._dpathRef.getLastChild());
                    this._updatedVertices();
                }
                this._gpathRef.commitDraft();
                this._gpathRef.removeFlag(GXNode.Flag.Selected);
                this._reset();
            }
        }
    };

    GXPenTool.prototype._mouseDblClick = function (event) {
        this._checkMode();
        if (this._pathEditor) {
            this._pathEditor.updatePartSelection(false);
            this._commitChanges();
        }
        return;

        /*var anchorPt;

        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());

        if (this._gpathRef && this._mode == GXPathTool.Mode.Append) {
            this._closeIfNeeded(false);
            this._gpathRef.commitDraft();
            this._updatedVertices();
            this._gpathRef.resetSelectedPts();
            this._gpathRef.removeFlag(GXNode.Flag.Selected);
        }

        this._reset();*/
    };

    /** override */
    GXPenTool.prototype.toString = function () {
        return "[Object GXPenTool]";
    };

    _.GXPenTool = GXPenTool;
})(this);
