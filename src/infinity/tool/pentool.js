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
    GXPenTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M17.2,25.8l-5.7-5.7l-1.8,2.4l0.4,0.4l-5,2.8c-0.3,1.7-1.2,3.6-1.9,4.9c-0.7,1.6-1.2,2.7-0.6,3.2\nl0.7,0.7c0.2,0.2,0.3,0.2,0.6,0.2c0.6,0,1.4-0.4,2.5-0.9c1.3-0.6,3.3-1.4,5-1.8l2.8-4.9l0.3,0.3L17.2,25.8z M10.9,31.4\nc-1.7,0.4-3.3,1.1-4.6,1.7c-0.9,0.4-1.7,0.7-2.1,0.7L7,31.1c0.6,0.3,1.3,0.1,1.8-0.4c0.6-0.6,0.6-1.5,0-2.1c-0.6-0.6-1.5-0.6-2.1,0\nC6.2,29,6,29.8,6.3,30.4l-2.8,2.8c-0.1-0.3,0.2-1.3,0.6-2.2c0.6-1.3,1.5-2.8,1.8-4.5l5-2.8l2.8,2.8L10.9,31.4z"/>\n</svg>\n';
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
                    if (event.button == GUIMouseEvent.BUTTON_RIGHT && gPlatform.modifiers.optionKey) {
                        this._editPt.setProperty('tp', 'C');
                    } else {
                        this._closeIfNeeded(true); // close preview
                    }
                    if (!this._dpathRef.getProperty('closed')) {
                        //TODO: remove handles if clicked to previous point
                    } else {
                        if (this._mode == GXPathTool.Mode.Append) {
                            this._refPt = this._pathRef.getAnchorPoints().getFirstChild();
                        } else { // this._mode == GXPathTool.Mode.Prepend
                            this._refPt = this._pathRef.getAnchorPoints().getLastChild();
                        }
                    }
                    this._pathEditor.requestInvalidation();
                } else if (this._pathEditor) { // We just switched from Edit mode, end point was clicked
                    if (this._mode == GXPathTool.Mode.Append) {
                        this._refPt = this._pathRef.getAnchorPoints().getLastChild();
                    } else { // this._mode == GXPathTool.Mode.Prepend
                        this._refPt = this._pathRef.getAnchorPoints().getFirstChild();
                    }
                } else {
                    // add new point
                    var pt = this._view.getViewTransform().mapPoint(event.client);
                    anchorPt = this._constructNewPoint(event, pt);
                    this._addPoint(anchorPt, true, false);
                }

                /* Some code still needed for reference
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
                if (!draft) {
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
                } else {
                    this._pathEditor.extendPreviewToFull();
                    this._dpathRef = this._pathEditor.getPathPreview();
                    if (this._mode == GXPathTool.Mode.Append) {
                        this._editPt = this._dpathRef.getAnchorPoints().getFirstChild();
                    } else { // this._mode == GXPathTool.Mode.Prepend
                        this._editPt = this._dpathRef.getAnchorPoints().getLastChild();
                    }
                    this._editPt.setProperties(['tp', 'hlx', 'hly'], ['N', null, null]);
                    // It is significant to remove auto-handles in separate command here if set
                    this._editPt.setProperty('ah', false);
                    this._dpathRef.getAnchorPoints().removeChild(anchorPt);
                    this._dpathRef.setProperty('closed', true);
                    this._pathEditor.requestInvalidation();
                    this._editPt.setFlag(GXNode.Flag.Selected);
                    this._pathEditor.requestInvalidation();
                }
                this._newPoint = false;
            }
        }
    };

    /**
     * @param {GUIMouseEvent.Move} event
     * @private
     */
    GXPenTool.prototype._mouseMove = function (event) {
        var tm = new Date().getTime();
        if (tm - this._mDownTime < 300) {
            // Double-click
            return;
        }

        var curPt;
        var prevPt = null;
        var anchorPt;

        if (!this._released) {
            if (event.button == GUIMouseEvent.BUTTON_RIGHT && gPlatform.modifiers.optionKey) {
                this._mouseDrag(event);
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
        }
        //this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
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
        // TODO: implement
        return;

        /* Some code still needed for reference
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
        */
    };

    GXPenTool.prototype._updateHandles = function (newPos) {
        var transformToNewPos = this._pathEditor.getTransformFromNative(this._view.getWorldTransform());
        var transformToNative = transformToNewPos.inverted();
        var newNativePos = transformToNative.mapPoint(newPos);

        var tp = this._editPt.getProperty('tp');
        var ptx = this._editPt.getProperty('x');
        var pty = this._editPt.getProperty('y');
        var hlx, hly, hrx, hry;
        if (this._mode == GXPathTool.Mode.Append || this._mode == GXPathTool.Mode.Edit) {
            if (tp != 'C' || this._mode == GXPathTool.Mode.Edit) {
                hrx = newNativePos.getX();
                hry = newNativePos.getY();
                hlx = ptx + ptx - hrx;
                hly = pty + pty - hry;
                this._editPt.setProperties(['tp', 'hlx', 'hly', 'hrx', 'hry'],
                    ['S', hlx, hly, hrx, hry]);
            } else {
                // TODO: make projection instead of rotation, look at old _rightDrag
                hrx = newNativePos.getX();
                hry = newNativePos.getY();
                hlx = null;
                hly = null;
                this._editPt.setProperties(['hlx', 'hly', 'hrx', 'hry'],
                    [hlx, hly, hrx, hry]);
            }
        } else { // this._mode == GXPathTool.Mode.Prepend
            if (tp != 'C') {
                hlx = newNativePos.getX();
                hly = newNativePos.getY();
                hrx = ptx + ptx - hlx;
                hry = pty + pty - hly;
                this._editPt.setProperties(['tp', 'hlx', 'hly', 'hrx', 'hry'],
                    ['S', hlx, hly, hrx, hry]);
            } else {
                // TODO: make projection instead of rotation, look at old _rightDrag
                hlx = newNativePos.getX();
                hly = newNativePos.getY();
                hrx = null;
                hry = null;
                this._editPt.setProperties(['hlx', 'hly', 'hrx', 'hry'],
                    [hlx, hly, hrx, hry]);
            }
        }
        this._pathEditor.requestInvalidation();
    };

    /**
     * @param {GUIMouseEvent.Drag | GUIMouseEvent.Move} event
     * @private
     */
    GXPenTool.prototype._mouseDrag = function (event) {
        if (this._refPt && !this._editPt && !this._released) {
            this._makePointMajor(this._refPt);
            this._editPt = this._pathEditor.getPathPointPreview(this._refPt);
            this._dragStartPt = this._refPt;
            if (event.button == GUIMouseEvent.BUTTON_LEFT) {
                this._editPt.setProperty('tp', 'S');
            }
            this._pathEditor.requestInvalidation();
        }
        if (!this._released && this._editPt) {
            if (!this._dragStartPt) {
                this._dragStartPt = this._editPt;
                if (event.button == GUIMouseEvent.BUTTON_LEFT && this._editPt.getProperty('tp') != 'C') {
                    this._editPt.setProperty('tp', 'S');
                }
            }
            this._dragStarted = true;
            var clickPt = this._constrainIfNeeded(
                event.client, this._view.getWorldTransform(), this._pathRef, this._dragStartPt);

            this._pathEditor.requestInvalidation();
            this._updateHandles(clickPt);
            this._pathEditor.requestInvalidation();
        }
        return;

        /* Some code still needed for reference
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
        */
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
            if (!this._dragStarted && this._refPt && !this._editPt) {
                this._mouseNoDragReleaseOnEdit();
            } else if (this._dragStarted) {
                var clickPt = this._constrainIfNeeded(
                    event.client, this._view.getWorldTransform(), this._pathRef, this._dragStartPt);

                this._pathEditor.requestInvalidation();
                this._updateHandles(clickPt);
                this._pathEditor.requestInvalidation();
                this._pathEditor.applyTransform(this._pathRef);
                this._commitChanges();
            } else {
                // NOOP on release
                this._commitChanges();
            }
        } else if (this._dpathRef) { // the path is openned and mode is Append
            if (this._dragStarted) {
                var clickPt = this._constrainIfNeeded(
                    event.client, this._view.getWorldTransform(), this._pathRef, this._dragStartPt);

                this._pathEditor.requestInvalidation();
                this._updateHandles(clickPt);
                this._pathEditor.requestInvalidation();
            }
            if (!this._dpathRef.getProperty('closed')) {
                if (this._newPoint) {
                    this._addPoint(this._editPt, false, true);
                    this._pathEditor.requestInvalidation();
                }
                    if (this._mode == GXPathTool.Mode.Append) {
                        this._refPt = this._pathRef.getAnchorPoints().getLastChild();
                    } else { // this._mode == GXPathTool.Mode.Prepend
                        this._refPt = this._pathRef.getAnchorPoints().getFirstChild();
                    }
                if (!this._newPoint) {
                this._pathEditor.selectOnePoint(this._refPt);
                this._pathEditor.applyTransform(this._pathRef);

                }
                //this._makePointMajor(this._refPt);
                this._commitChanges();
            } else {
                if (this._mode == GXPathTool.Mode.Append) {
                    this._refPt = this._pathRef.getAnchorPoints().getFirstChild();
                } else { // this._mode == GXPathTool.Mode.Prepend
                    this._refPt = this._pathRef.getAnchorPoints().getLastChild();
                }
                this._pathEditor.requestInvalidation();
                this._pathRef.setProperty('closed', true);
                this._pathEditor.selectOnePoint(this._refPt);
                this._pathEditor.applyTransform(this._pathRef);
                this._pathEditor.requestInvalidation();
                this._commitChanges();
                this._mode = GXPathTool.Mode.Edit;
            }
            this._refPt = null;
        }
        this._dragStarted = false;
        this._dragStartPt = null;
    };

    GXPenTool.prototype._mouseDblClick = function (event) {
        this._checkMode();
        if (this._pathEditor) {
            this._pathEditor.updatePartSelection(false);
            this._commitChanges();
        }
    };

    /** override */
    GXPenTool.prototype.toString = function () {
        return "[Object GXPenTool]";
    };

    _.GXPenTool = GXPenTool;
})(this);
