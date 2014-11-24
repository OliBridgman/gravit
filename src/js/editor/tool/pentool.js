(function (_) {
    /**
     * The pen tool
     * @class GPenTool
     * @extends GPathTool
     * @constructor
     * @version 1.0
     */
    function GPenTool() {
        GPathTool.call(this);
    }

    GObject.inherit(GPenTool, GPathTool);

    /** @override */
    GPenTool.prototype.activate = function (view) {
        GPathTool.prototype.activate.call(this, view);
        view.addEventListener(GMouseEvent.Drag, this._mouseDrag, this);
        view.addEventListener(GMouseEvent.Move, this._mouseMove, this);
    };

    /** @override */
    GPenTool.prototype.deactivate = function (view) {
        GPathTool.prototype.deactivate.call(this, view);
        view.removeEventListener(GMouseEvent.Drag, this._mouseDrag);
        view.removeEventListener(GMouseEvent.Move, this._mouseMove);
    };

    /**
     * @param {GMouseEvent.Down} event
     * @private
     */
    GPenTool.prototype._mouseDown = function (event) {
        var tm = new Date().getTime();
        if (tm - this._mDownTime < GPathTool.DBLCLICKTM) {
            // Double-click
            this._mouseDblClick(event);
            return;
        }

        var anchorPt = null;

        //this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
        this._lastMouseEvent = event;
        this._dragStarted = false;
        this._dragStartPt = null;
        this._mouseMove(event);

        this._mDownTime = tm;
        this._released = false;
        if (ifPlatform.modifiers.optionKey) {
            this._firstAlt = true;
        }
        this._blockDeactivation();
        this._checkMode();

        if (this._mode == GPathTool.Mode.Edit) {
            this._mouseDownOnEdit(event);
        }

        if (this._mode != GPathTool.Mode.Edit) {
            this._renewPreviewLink();
            if (this._newPoint && this._pathEditor) {
                this._updatePoint(event.client);
                if (this._mode == GPathTool.Mode.Append) {
                    var prevPt = this._editPt.getPrevious();
                    if (prevPt) {
                        prevPt.removeFlag(GNode.Flag.Selected);
                        this._editPt.setFlag(GNode.Flag.Selected);
                    }
                } else { // mode == Prepend
                    var nextPt = this._editPt.getNext();
                    if (nextPt) {
                        nextPt.removeFlag(GNode.Flag.Selected);
                        this._editPt.setFlag(GNode.Flag.Selected);
                    }
                }
                this._pathEditor.requestInvalidation();
                if (event.button == GMouseEvent.BUTTON_RIGHT) {
                    if (ifPlatform.modifiers.optionKey) {
                        this._editPt.setProperty('tp', GPathBase.AnchorPoint.Type.Connector);
                    } else {
                        this._editPt.setProperties(['tp', 'cu'], [GPathBase.CornerType.Rounded, true]);
                    }
                } else if (!ifPlatform.modifiers.optionKey){
                    this._closePreviewIfNeeded();
                }
                if (!this._dpathRef.getProperty('closed')) {
                    //TODO: remove handles if clicked to previous point
                } else {
                    if (this._mode == GPathTool.Mode.Append) {
                        this._refPt = this._pathRef.getAnchorPoints().getFirstChild();
                    } else { // this._mode == GPathTool.Mode.Prepend
                        this._refPt = this._pathRef.getAnchorPoints().getLastChild();
                    }
                }
                this._pathEditor.requestInvalidation();
            } else if (this._pathEditor) { // We just switched from Edit mode, end point was clicked
                if (this._mode == GPathTool.Mode.Append) {
                    this._refPt = this._pathRef.getAnchorPoints().getLastChild();
                } else { // this._mode == GPathTool.Mode.Prepend
                    this._refPt = this._pathRef.getAnchorPoints().getFirstChild();
                }
            } else {
                // add new point
                var pt = this._view.getViewTransform().mapPoint(event.client);
                this._editor.getGuides().beginMap();
                pt = this._editor.getGuides().mapPoint(pt, GGuide.DetailMap.Mode.DetailOnFilterOn);
                this._editor.getGuides().finishMap();
                anchorPt = this._constructNewPoint(event, pt);
                if (event.button == GMouseEvent.BUTTON_RIGHT) {
                    if (ifPlatform.modifiers.optionKey) {
                        anchorPt.setProperty('tp', GPathBase.AnchorPoint.Type.Connector);
                    } else {
                        anchorPt.setProperties(['tp', 'cu'], [GPathBase.CornerType.Rounded, true]);
                    }
                }
                this._addPoint(anchorPt, true, false);
            }
        }

        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
    };

    /** overwrite */
    GPenTool.prototype._renewPreviewLink = function () {
        if (!this._pathEditor) {
            this._editPt = null;
            this._newPoint = false;
            this._dpathRef = null;
        } else {
            var newDPathRef = this._pathEditor.getPathPreview(true);
            if (this._editPt) {
                var checkPt;
                if (this._mode == GPathTool.Mode.Append) {
                    checkPt = newDPathRef.getAnchorPoints().getLastChild();
                } else { // this._mode == GPathTool.Mode.Prepend
                    checkPt = newDPathRef.getAnchorPoints().getFirstChild();
                }
                if (this._editPt != checkPt) {
                    this._newPoint = false;
                    this._editPt = null;
                }
            }
            this._dpathRef = newDPathRef;
        }
    };

    GPenTool.prototype._closePreviewIfNeeded = function () {
        if (this._pathRef && this._newPoint &&
            (this._mode == GPathTool.Mode.Append || this._mode == GPathTool.Mode.Prepend)) {

            var anchorPt;
            var otherPt;
            if (this._mode == GPathTool.Mode.Append) {
                anchorPt = this._dpathRef.getAnchorPoints().getLastChild();
                otherPt = this._dpathRef.getAnchorPoints().getFirstChild();
            } else { // this._mode == GPathTool.Mode.Prepend
                anchorPt = this._dpathRef.getAnchorPoints().getFirstChild();
                otherPt = this._dpathRef.getAnchorPoints().getLastChild();
            }

            var location = new GPoint(anchorPt.getProperty('x'), anchorPt.getProperty('y'));
            var transform = this._pathRef.getTransform();
            location = transform ? transform.mapPoint(location) : location;

            if (otherPt && this._pathEditor.hitAnchorPoint(otherPt, location, null, this._scene.getProperty('pickDist')) ) {
                // Close preview path
                this._dpathRef = this._pathEditor.getPathPreview(true);
                if (this._mode == GPathTool.Mode.Append) {
                    this._editPt = this._dpathRef.getAnchorPoints().getFirstChild();
                } else { // this._mode == GPathTool.Mode.Prepend
                    this._editPt = this._dpathRef.getAnchorPoints().getLastChild();
                }
                var tp = this._editPt.getProperty('tp');
                if (!GPathBase.isCornerType(tp)) {
                    this._editPt.setProperty('tp', GPathBase.AnchorPoint.Type.Asymmetric);
                }
                this._editPt.setProperties(['hlx', 'hly'], [null, null]);
                // It is significant to remove auto-handles in separate command here if set
                this._editPt.setProperty('ah', false);
                this._dpathRef.getAnchorPoints().removeChild(anchorPt);
                this._dpathRef.setProperty('closed', true);
                this._pathEditor.requestInvalidation();
                this._editPt.setFlag(GNode.Flag.Selected);
                this._pathEditor.requestInvalidation();
                this._newPoint = false;
            }
        }
    };

    /**
     * @param {GMouseEvent.Move} event
     * @private
     */
    GPenTool.prototype._mouseMove = function (event) {
        var tm = new Date().getTime();
        if (tm - this._mDownTime < GPathTool.DBLCLICKTM) {
            // Double-click
            return;
        }

        var curPt;
        var prevPt = null;
        var anchorPt;

        if (!this._released) {
            if (event.button == GMouseEvent.BUTTON_RIGHT) {
                this._mouseDrag(event);
            }
            return;
        }

        this._lastMouseEvent = event;
        this._checkMode();
        if (this._mode == GPathTool.Mode.Edit) {
            this._setCursorForPosition(null, event.client);
        } else { // _mode == Append || Prepend
            this._renewPreviewLink();
            var newPos = event.client;
            if (!this._newPoint && this._pathEditor) {
                newPos = this._constrainIfNeeded(event.client, this._view.getWorldTransform(), this._pathRef);
                // add new point
                var clickPt = this._view.getViewTransform().mapPoint(newPos);
                this._editor.getGuides().beginMap();
                clickPt = this._editor.getGuides().mapPoint(clickPt, GGuide.DetailMap.Mode.DetailOnFilterOn);
                this._editor.getGuides().finishMap();
                newPos = this._view.getWorldTransform().mapPoint(clickPt);
                anchorPt = this._constructNewPoint(event, clickPt);
                this._addPoint(anchorPt, true, false, true);
            } else if (this._editPt) {
                this._pathEditor.requestInvalidation();
                newPos = this._updatePoint(event.client);
                this._pathEditor.requestInvalidation();
            }
            if (this._editPt) {
                var otherPt;
                if (this._mode == GPathTool.Mode.Append) {
                    otherPt = this._pathRef.getAnchorPoints().getFirstChild();
                } else { // this._mode == GPathTool.Mode.Prepend
                    otherPt = this._pathRef.getAnchorPoints().getLastChild();
                }
                if (this._pathEditor.hitAnchorPoint(otherPt, newPos, this._view.getWorldTransform(), this._scene.getProperty('pickDist'))) {
                    this._setCursorForPosition(GCursor.PenEnd);
                } else {
                    this._setCursorForPosition(GCursor.Pen);
                }
            } else {
                this._setCursorForPosition(null, event.client);
            }
        }
        //this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
    };

    GPenTool.prototype._updateHandles = function (newPos) {
        var tp = this._editPt.getProperty('tp');
        var ptx = this._editPt.getProperty('x');
        var pty = this._editPt.getProperty('y');
        var hlx, hly, hrx, hry;
        if (this._pathEditor.hitAnchorPoint(this._editPt, newPos, this._view.getWorldTransform(), 0) && !this._firstAlt) {
            if (this._mode != GPathTool.Mode.Edit) {
                if (this._mode == GPathTool.Mode.Append) {
                    if (this._editPt.getProperty('hlx') !== null && this._editPt.getProperty('hly') !== null) {
                        this._editPt.setProperties(['tp', 'hrx', 'hry'], [GPathBase.AnchorPoint.Type.Symmetric, null, null]);
                    } else {
                        this._editPt.setProperties(['tp', 'hrx', 'hry'], [GPathBase.AnchorPoint.Type.Asymmetric, null, null]);
                    }
                } else { // _mode == Prepend
                    if (this._editPt.getProperty('hrx') !== null && this._editPt.getProperty('hry') !== null) {
                        this._editPt.setProperties(['tp', 'hlx', 'hly'], [GPathBase.AnchorPoint.Type.Symmetric, null, null]);
                    } else {
                        this._editPt.setProperties(['tp', 'hlx', 'hly'], [GPathBase.AnchorPoint.Type.Asymmetric, null, null]);
                    }
                }
            } else {
                if (!ifPlatform.modifiers.optionKey) {
                    this._editPt.setProperties(['tp', 'hlx', 'hly', 'hrx', 'hry'], [GPathBase.AnchorPoint.Type.Asymmetric, null, null, null, null]);
                } else {
                    this._editPt.setProperties(['tp', 'hrx', 'hry'], [GPathBase.AnchorPoint.Type.Asymmetric, null, null]);
                }
            }
        } else {
            var transformToNewPos = this._pathEditor.getTransformFromNative(this._view.getWorldTransform());
            var transformToNative = transformToNewPos.inverted();
            var newNativePos = transformToNative.mapPoint(newPos);

            if (!this._newPoint && ifPlatform.modifiers.optionKey && this._firstAlt &&
                    tp != GPathBase.AnchorPoint.Type.Connector &&
                    !(this._editPt.getPrevious() == null && this._editPt.getNext() == null)) {

                var dx = newNativePos.getX() - ptx;
                var dy = newNativePos.getY() - pty;
                this._editPt.setProperty('ah', false);
                var hrxOrig = this._dragStartPt.getProperty('hrx');
                hrx = hrxOrig != null ? hrxOrig + dx : newNativePos.getX();
                var hryOrig = this._dragStartPt.getProperty('hry');
                hry = hryOrig != null ? hryOrig + dy : newNativePos.getY();
                this._editPt.setProperty('ah', false);
                this._editPt.setProperties(['tp', 'hrx', 'hry'], [GPathBase.AnchorPoint.Type.Asymmetric, hrx, hry]);

            } else if (tp != GPathBase.AnchorPoint.Type.Connector) {
                this._editPt.setProperty('ah', false);
                var h1x = newNativePos.getX();
                var h1y = newNativePos.getY();
                if (ifPlatform.modifiers.optionKey) {
                    if (this._mode == GPathTool.Mode.Prepend) {
                        this._editPt.setProperties(['tp', 'hlx', 'hly'],
                            [GPathBase.AnchorPoint.Type.Asymmetric, h1x, h1y]);
                    } else { // mode == Append || mode == Edit
                        this._editPt.setProperties(['tp', 'hrx', 'hry'],
                            [GPathBase.AnchorPoint.Type.Asymmetric, h1x, h1y]);
                    }
                } else {
                    var newTp = GPathBase.AnchorPoint.Type.Symmetric;
                    if (this._mode != GPathTool.Mode.Edit && !this._newPoint &&
                        !this._dpathRef.getProperty('closed') &&
                        (this._editPt.getPrevious() == null && this._editPt.getNext() != null ||
                            this._editPt.getPrevious() != null && this._editPt.getNext() == null)) {

                        if (this._mode == GPathTool.Mode.Prepend) {
                            this._editPt.setProperties(['tp', 'hlx', 'hly'], [newTp, h1x, h1y]);
                        } else { // mode == Append
                            this._editPt.setProperties(['tp', 'hrx', 'hry'], [newTp, h1x, h1y]);
                        }
                    } else {
                        var h2x = ptx + ptx - h1x;
                        var h2y = pty + pty - h1y;
                        if (this._mode == GPathTool.Mode.Prepend) {
                            this._editPt.setProperties(['tp', 'hrx', 'hry', 'hlx', 'hly'], [newTp, h2x, h2y, h1x, h1y]);
                        } else {
                            this._editPt.setProperties(['tp', 'hrx', 'hry', 'hlx', 'hly'], [newTp, h1x, h1y, h2x, h2y]);
                        }
                    }
                }
            } else { // tp == GPathBase.AnchorPoint.Type.Connector
                if (this._mode == GPathTool.Mode.Append ||
                        this._mode == GPathTool.Mode.Edit && ifPlatform.modifiers.optionKey) {

                    hlx = null;
                    hly = null;

                    // calculate right handle to be projection of click point to the vector,
                    // connecting previous point and this one
                    var prevPt = this._editPt.getPrevious();
                    if (prevPt) {
                        var prevX = prevPt.getProperty('x');
                        var prevY = prevPt.getProperty('y');
                        var dirLen = Math.sqrt(GMath.ptSqrDist(ptx, pty, prevX, prevY));
                        if (!GMath.isEqualEps(dirLen, 0)) {
                            var ex = (ptx - prevX) / dirLen;
                            var ey = (pty - prevY) / dirLen;
                            var hLen = GMath.vDotProduct(ex, ey, newNativePos.getX() - ptx, newNativePos.getY() - pty);
                            if (hLen > 0) {
                                hrx = ptx + ex * hLen;
                                hry = pty + ey * hLen;
                            } else {
                                hrx = null;
                                hry = null;
                            }
                        } else {
                            hrx = newNativePos.getX();
                            hry = newNativePos.getY();
                        }
                    } else {
                        hrx = newNativePos.getX();
                        hry = newNativePos.getY();
                    }
                    this._editPt.setProperties(['hlx', 'hly', 'hrx', 'hry'], [hlx, hly, hrx, hry]);
                } else if (this._mode == GPathTool.Mode.Prepend) {
                    hrx = null;
                    hry = null;

                    // calculate the left handle to be projection of click point to the vector,
                    // connecting the next point and this one
                    var nextPt = this._editPt.getNext();
                    if (nextPt) {
                        var nextX = nextPt.getProperty('x');
                        var nextY = nextPt.getProperty('y');
                        var dirLen = Math.sqrt(GMath.ptSqrDist(ptx, pty, nextX, nextY));
                        if (!GMath.isEqualEps(dirLen, 0)) {
                            var ex = (ptx - nextX) / dirLen;
                            var ey = (pty - nextY) / dirLen;
                            var hLen = GMath.vDotProduct(ex, ey, newNativePos.getX() - ptx, newNativePos.getY() - pty);
                            if (hLen > 0) {
                                hlx = ptx + ex * hLen;
                                hly = pty + ey * hLen;
                            } else {
                                hlx = null;
                                hly = null;
                            }
                        } else {
                            hlx = newNativePos.getX();
                            hly = newNativePos.getY();
                        }
                    } else {
                        hlx = newNativePos.getX();
                        hly = newNativePos.getY();
                    }
                    this._editPt.setProperties(['hlx', 'hly', 'hrx', 'hry'], [hlx, hly, hrx, hry]);
                }
            }
        }
        this._pathEditor.requestInvalidation();
    };

    /**
     * @param {GMouseEvent.Drag | GMouseEvent.Move} event
     * @private
     */
    GPenTool.prototype._mouseDrag = function (event) {
        if (this._refPt && !this._editPt && !this._released) {
            this._makePointMajor(this._refPt);
            this._editPt = this._pathEditor.getPathPointPreview(this._refPt);
            this._dragStartPt = this._refPt;
            if (event.button == GMouseEvent.BUTTON_LEFT) {
                this._editPt.setProperty('tp', GPathBase.AnchorPoint.Type.Symmetric);
            }
            this._pathEditor.requestInvalidation();
        }
        if (!this._released && this._editPt) {
            this._lastMouseEvent = event;
            this._setCursorForPosition(GCursor.PenDrag);
            if (!this._dragStartPt) {
                this._dragStartPt = this._refPt ? this._refPt : this._editPt;
                if (event.button == GMouseEvent.BUTTON_LEFT && this._editPt.getProperty('tp') != GPathBase.AnchorPoint.Type.Connector) {
                    this._editPt.setProperty('tp', GPathBase.AnchorPoint.Type.Symmetric);
                }
            }
            this._dragStarted = true;
            this._updatePointProperties(event.client);
        }
    };

    /**
     * Constructs new point, specific to Pen Tool, with the given position
     * @param {GMouseEvent} event used to define pressed button
     * @param {GPoint} pt - coordinates to be used for new position in world system
     * @returns {GPath.AnchorPoint} newly created anchor point
     * @private
     */
    GPenTool.prototype._constructNewPoint = function (event, pt) {
        var anchorPt = new GPath.AnchorPoint();
        anchorPt.setProperties(['x', 'y'], [pt.getX(), pt.getY()]);

        return anchorPt;
    };

    /** @override */
    GPenTool.prototype._mouseRelease = function (event) {
        if (!this._released) {
            try {
                var anchorPt;

                this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
                this._released = true;
                if (this._pathEditor && this._mode == GPathTool.Mode.Edit) {
                    if (!this._dragStarted && this._refPt && !this._editPt) {
                        this._mouseNoDragReleaseOnEdit(event.client);
                    } else if (this._dragStarted) {
                        this._updatePointProperties(event.client);
                        if (this._transactionType == GPathTool.Transaction.NoTransaction) {
                            this._startTransaction(GPathTool.Transaction.ModifyPointProperties);
                        }
                        this._pathEditor.applyTransform(this._pathRef);
                        this._commitChanges();
                        this._setCursorForPosition(null, event.client);
                    } else {
                        // NOOP on release
                        this._commitChanges();
                        this._setCursorForPosition(null, event.client);
                    }
                } else if (this._dpathRef) {
                    var newPos = event.client;
                    if (this._dragStarted) {
                        newPos = this._updatePointProperties(event.client);
                    }
                    if (!this._dpathRef.getProperty('closed')) {
                        if (this._newPoint) {
                            this._addPoint(this._editPt, false, true);
                            this._pathEditor.requestInvalidation();
                        }
                        var otherPt;
                        if (this._mode == GPathTool.Mode.Append) {
                            this._refPt = this._pathRef.getAnchorPoints().getLastChild();
                            otherPt = this._pathRef.getAnchorPoints().getFirstChild();
                        } else { // this._mode == GPathTool.Mode.Prepend
                            this._refPt = this._pathRef.getAnchorPoints().getFirstChild();
                            otherPt = this._pathRef.getAnchorPoints().getLastChild();
                        }
                        if (!this._newPoint) {
                            if (this._transactionType == GPathTool.Transaction.NoTransaction) {
                                this._startTransaction(GPathTool.Transaction.ModifyPointProperties);
                            }
                            this._pathEditor.selectOnePoint(this._refPt);
                            this._pathEditor.applyTransform(this._pathRef);
                        }
                        //this._makePointMajor(this._refPt);
                        if (otherPt && otherPt != this._refPt &&
                            this._pathEditor.hitAnchorPoint(otherPt, newPos, this._view.getWorldTransform(), this._scene.getProperty('pickDist'))) {

                            this._setCursorForPosition(GCursor.PenEnd);
                        } else {
                            this._setCursorForPosition(GCursor.Pen);
                        }
                        this._commitChanges();
                    } else {
                        if (this._refPt) {
                            this._startTransaction(GPathTool.Transaction.ModifyPathProperties);
                            this._pathEditor.selectOnePoint(this._refPt);
                            this._pathEditor.applyTransform(this._pathRef);
                            this._pathEditor.requestInvalidation();
                            this._pathRef.setProperty('closed', true);
                            this._pathEditor.setActiveExtendingMode(false);
                        }
                        this._commitChanges();
                        this._mode = GPathTool.Mode.Edit;
                        this._setCursorForPosition(null, event.client);
                    }
                    this._refPt = null;
                }
            } finally {
                this._finishTransaction();
            }
        }
        this._dragStarted = false;
        this._dragStartPt = null;
        this._lastMouseEvent = null;
        this._firstAlt = false;

        this._allowDeactivation();
    };

    /**
     * Sets shoulder length for styled corners equal to the distance between anchor point's position and passed position
     * @param {GPoint} newPos - position, which should be used for shoulder length calculation in view coordinates
     * @private
     */
    GPenTool.prototype._updateShoulders = function(newPos) {
        if (this._mode != GPathTool.Mode.Append && this._mode != GPathTool.Mode.Prepend || !this._editPt) {
            return;
        }
        if (this._pathEditor.hitAnchorPoint(this._editPt, newPos, this._view.getWorldTransform(), 0)) {
            if (this._mode == GPathTool.Mode.Append) {
                this._editPt.setProperty('cr', null);
            } else if (this._mode == GPathTool.Mode.Prepend) {
                this._editPt.setProperty('cl', null);
            }
        } else {
            var transformToNewPos = this._pathEditor.getTransformFromNative(this._view.getWorldTransform());
            var sourcePos = new GPoint(this._editPt.getProperty('x'), this._editPt.getProperty('y'));
            sourcePos = transformToNewPos.mapPoint(sourcePos);
            var newVal = GMath.ptDist(sourcePos.getX(), sourcePos.getY(), newPos.getX(), newPos.getY());

            if (this._mode == GPathTool.Mode.Append) {
                this._editPt.setProperty('cr', newVal);
            } else if (this._mode == GPathTool.Mode.Prepend) {
                this._editPt.setProperty('cl', newVal);
            }
        }
    };

    /**
     * This function should be called only if mouse dragging of a point is started.
     * It updates edited point's handles or shoulders to correspond to new position.
     * Position is constrained and snapped to guides if needed.
     * @param {GPoint} clickPt - new position
     * @returns {GPoint} - modified new position, if it was constrained or snapped to guides
     * @private
     */
    GPenTool.prototype._updatePointProperties = function(clickPt) {
        var newPos = clickPt;

        // No need to check _pathEditor and _editPt for null here,
        // as this function is called only when dragging is started, and they are already checked
        this._pathEditor.requestInvalidation();
        if (this._editPt.getProperty('tp') == GPathBase.CornerType.Rounded) {
            this._updateShoulders(clickPt);
        } else {
            var newPos = this._constrainIfNeeded(
                clickPt, this._view.getWorldTransform(), this._pathRef, this._dragStartPt);

            // Don't perform handles mapping for now
            /*
            this._editor.getGuides().beginMap();

            newPos = this._view.getWorldTransform().mapPoint(
                this._editor.getGuides().mapPoint(
                    this._view.getViewTransform().mapPoint(newPos)));
            */
            this._updateHandles(newPos);
            //this._editor.getGuides().finishMap();
        }

        return newPos;
    };

    /** override */
    GPenTool.prototype.toString = function () {
        return "[Object GPenTool]";
    };

    _.GPenTool = GPenTool;
})(this);
