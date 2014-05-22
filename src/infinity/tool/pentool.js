(function (_) {
    /**
     * The pen tool
     * @class IFPenTool
     * @extends IFPathTool
     * @constructor
     * @version 1.0
     */
    function IFPenTool() {
        IFPathTool.call(this);
    }

    IFObject.inherit(IFPenTool, IFPathTool);

    /** @override */
    IFPenTool.prototype.getGroup = function () {
        return 'draw';
    };

    /** @override */
    IFPenTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M9.2,21.3l0.7,0.7l-6.5,3.6c0,0-0.5,3.1-1.4,5.7c-0.8,2.2-2.1,3.6-1.4,4.3c0,0,0,0,0.7,0.7\n\tc0.7,0.7,2.1-0.6,4.3-1.4c2.5-0.9,5.6-1.4,5.6-1.4l3.7-6.4l0.7,0.7l2.9-2.1l-7.1-7.1L9.2,21.3z M4.2,26.4l6.5-3.6l3.6,3.6l-3.7,6.4\n\tc-4.8,0.5-8.5,2.8-8.5,2.8l3.2-3.2c0.8,0.5,1.8,0.3,2.4-0.3c0.8-0.8,0.8-2,0-2.8c-0.8-0.8-2-0.8-2.8,0c-0.7,0.7-0.8,1.7-0.4,2.5\n\tl-3.2,3.2C1.4,34.9,3.7,31.2,4.2,26.4z"/>\n</svg>\n';
    };

    /** @override */
    IFPenTool.prototype.getHint = function () {
        return IFPathTool.prototype.getHint.call(this)
            .addKey(IFKey.Constant.OPTION, new IFLocale.Key(IFPenTool, "shortcut.option"), true)
            .addKey(IFKey.Constant.SHIFT, new IFLocale.Key(IFPenTool, "shortcut.shift"), true)
            .setTitle(new IFLocale.Key(IFPenTool, "title"));
    };

    /** @override */
    IFPenTool.prototype.getActivationCharacters = function () {
        return ['P'];
    };

    /** @override */
    IFPenTool.prototype.activate = function (view) {
        IFPathTool.prototype.activate.call(this, view);
        view.addEventListener(GUIMouseEvent.Drag, this._mouseDrag, this);
        view.addEventListener(GUIMouseEvent.Move, this._mouseMove, this);
    };

    /** @override */
    IFPenTool.prototype.deactivate = function (view) {
        IFPathTool.prototype.deactivate.call(this, view);
        view.removeEventListener(GUIMouseEvent.Drag, this._mouseDrag);
        view.removeEventListener(GUIMouseEvent.Move, this._mouseMove);
    };

    /**
     * @param {GUIMouseEvent.Down} event
     * @private
     */
    IFPenTool.prototype._mouseDown = function (event) {
        var tm = new Date().getTime();
        if (tm - this._mDownTime < IFPathTool.DBLCLICKTM) {
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
        if (gPlatform.modifiers.optionKey) {
            this._firstAlt = true;
        }
        this._blockDeactivation();
        this._checkMode();
        this._renewPreviewLink();

        if (this._mode == IFPathTool.Mode.Edit) {
            this._mouseDownOnEdit(event);
        }

        if (this._mode != IFPathTool.Mode.Edit) {
            if (this._newPoint && this._pathEditor) {
                this._updatePoint(event.client);
                if (this._mode == IFPathTool.Mode.Append) {
                    var prevPt = this._editPt.getPrevious();
                    if (prevPt) {
                        prevPt.removeFlag(IFNode.Flag.Selected);
                        this._editPt.setFlag(IFNode.Flag.Selected);
                    }
                } else { // mode == Prepend
                    var nextPt = this._editPt.getNext();
                    if (nextPt) {
                        nextPt.removeFlag(IFNode.Flag.Selected);
                        this._editPt.setFlag(IFNode.Flag.Selected);
                    }
                }
                this._pathEditor.requestInvalidation();
                if (event.button == GUIMouseEvent.BUTTON_RIGHT) {
                    if (gPlatform.modifiers.optionKey) {
                        this._editPt.setProperty('tp', IFPathBase.AnchorPoint.Type.Connector);
                    } else {
                        this._editPt.setProperties(['tp', 'cu'], [IFPathBase.CornerType.Rounded, true]);
                    }
                } else if (!gPlatform.modifiers.optionKey){
                    this._closePreviewIfNeeded();
                }
                if (!this._dpathRef.getProperty('closed')) {
                    //TODO: remove handles if clicked to previous point
                } else {
                    if (this._mode == IFPathTool.Mode.Append) {
                        this._refPt = this._pathRef.getAnchorPoints().getFirstChild();
                    } else { // this._mode == IFPathTool.Mode.Prepend
                        this._refPt = this._pathRef.getAnchorPoints().getLastChild();
                    }
                }
                this._pathEditor.requestInvalidation();
            } else if (this._pathEditor) { // We just switched from Edit mode, end point was clicked
                if (this._mode == IFPathTool.Mode.Append) {
                    this._refPt = this._pathRef.getAnchorPoints().getLastChild();
                } else { // this._mode == IFPathTool.Mode.Prepend
                    this._refPt = this._pathRef.getAnchorPoints().getFirstChild();
                }
            } else {
                // add new point
                var pt = this._view.getViewTransform().mapPoint(event.client);
                this._editor.getGuides().beginMap();
                pt = this._editor.getGuides().mapPoint(pt);
                anchorPt = this._constructNewPoint(event, pt);
                if (event.button == GUIMouseEvent.BUTTON_RIGHT) {
                    if (gPlatform.modifiers.optionKey) {
                        anchorPt.setProperty('tp', IFPathBase.AnchorPoint.Type.Connector);
                    } else {
                        anchorPt.setProperties(['tp', 'cu'], [IFPathBase.CornerType.Rounded, true]);
                    }
                }
                this._addPoint(anchorPt, true, false);
                this._editor.getGuides().finishMap();
            }
        }

        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
    };

    /** overwrite */
    IFPenTool.prototype._renewPreviewLink = function () {
        if (!this._pathEditor) {
            this._editPt = null;
            this._newPoint = false;
            this._dpathRef = null;
        } else {
            var newDPathRef = this._pathEditor.getPathPreview(true);
            if (this._editPt) {
                var checkPt;
                if (this._mode == IFPathTool.Mode.Append) {
                    checkPt = newDPathRef.getAnchorPoints().getLastChild();
                } else { // this._mode == IFPathTool.Mode.Prepend
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

    IFPenTool.prototype._closePreviewIfNeeded = function () {
        if (this._pathRef && this._newPoint &&
            (this._mode == IFPathTool.Mode.Append || this._mode == IFPathTool.Mode.Prepend)) {

            var anchorPt;
            var otherPt;
            if (this._mode == IFPathTool.Mode.Append) {
                anchorPt = this._dpathRef.getAnchorPoints().getLastChild();
                otherPt = this._dpathRef.getAnchorPoints().getFirstChild();
            } else { // this._mode == IFPathTool.Mode.Prepend
                anchorPt = this._dpathRef.getAnchorPoints().getFirstChild();
                otherPt = this._dpathRef.getAnchorPoints().getLastChild();
            }

            var location = new GPoint(anchorPt.getProperty('x'), anchorPt.getProperty('y'));
            var transform = this._pathRef.getTransform();
            location = transform ? transform.mapPoint(location) : location;

            if (otherPt && this._pathEditor.hitAnchorPoint(otherPt, location, null, this._scene.getProperty('pickDist')) ) {
                // Close preview path
                this._dpathRef = this._pathEditor.getPathPreview(true);
                if (this._mode == IFPathTool.Mode.Append) {
                    this._editPt = this._dpathRef.getAnchorPoints().getFirstChild();
                } else { // this._mode == IFPathTool.Mode.Prepend
                    this._editPt = this._dpathRef.getAnchorPoints().getLastChild();
                }
                var tp = this._editPt.getProperty('tp');
                if (!IFPathBase.isCornerType(tp)) {
                    this._editPt.setProperty('tp', IFPathBase.AnchorPoint.Type.Asymmetric);
                }
                this._editPt.setProperties(['hlx', 'hly'], [null, null]);
                // It is significant to remove auto-handles in separate command here if set
                this._editPt.setProperty('ah', false);
                this._dpathRef.getAnchorPoints().removeChild(anchorPt);
                this._dpathRef.setProperty('closed', true);
                this._pathEditor.requestInvalidation();
                this._editPt.setFlag(IFNode.Flag.Selected);
                this._pathEditor.requestInvalidation();
                this._newPoint = false;
            }
        }
    };

    /**
     * @param {GUIMouseEvent.Move} event
     * @private
     */
    IFPenTool.prototype._mouseMove = function (event) {
        var tm = new Date().getTime();
        if (tm - this._mDownTime < IFPathTool.DBLCLICKTM) {
            // Double-click
            return;
        }

        var curPt;
        var prevPt = null;
        var anchorPt;

        if (!this._released) {
            if (event.button == GUIMouseEvent.BUTTON_RIGHT) {
                this._mouseDrag(event);
            }
            return;
        }

        this._lastMouseEvent = event;
        this._checkMode();
        this._renewPreviewLink();
        if (this._mode == IFPathTool.Mode.Edit) {
            this._setCursorForPosition(null, event.client);
        } else { // _mode == Append || Prepend
            var newPos = event.client;
            if (!this._newPoint && this._pathEditor) {
                newPos = this._constrainIfNeeded(event.client, this._view.getWorldTransform(), this._pathRef);
                // add new point
                var clickPt = this._view.getViewTransform().mapPoint(newPos);
                this._editor.getGuides().beginMap();
                clickPt = this._editor.getGuides().mapPoint(clickPt);
                newPos = this._view.getWorldTransform().mapPoint(clickPt);
                anchorPt = this._constructNewPoint(event, clickPt);
                this._addPoint(anchorPt, true, false, true);
                this._editor.getGuides().finishMap();
            } else if (this._editPt) {
                this._pathEditor.requestInvalidation();
                newPos = this._updatePoint(event.client);
                this._pathEditor.requestInvalidation();
            }
            if (this._editPt) {
                var otherPt;
                if (this._mode == IFPathTool.Mode.Append) {
                    otherPt = this._pathRef.getAnchorPoints().getFirstChild();
                } else { // this._mode == IFPathTool.Mode.Prepend
                    otherPt = this._pathRef.getAnchorPoints().getLastChild();
                }
                if (this._pathEditor.hitAnchorPoint(otherPt, newPos, this._view.getWorldTransform(), this._scene.getProperty('pickDist'))) {
                    this._setCursorForPosition(IFCursor.PenEnd);
                } else {
                    this._setCursorForPosition(IFCursor.Pen);
                }
            } else {
                this._setCursorForPosition(null, event.client);
            }
        }
        //this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
    };

    IFPenTool.prototype._updateHandles = function (newPos) {
        var tp = this._editPt.getProperty('tp');
        var ptx = this._editPt.getProperty('x');
        var pty = this._editPt.getProperty('y');
        var hlx, hly, hrx, hry;
        if (this._pathEditor.hitAnchorPoint(this._editPt, newPos, this._view.getWorldTransform(), 0) && !this._firstAlt) {
            if (this._mode != IFPathTool.Mode.Edit) {
                if (this._mode == IFPathTool.Mode.Append) {
                    if (this._editPt.getProperty('hlx') !== null && this._editPt.getProperty('hly') !== null) {
                        this._editPt.setProperties(['tp', 'hrx', 'hry'], [IFPathBase.AnchorPoint.Type.Symmetric, null, null]);
                    } else {
                        this._editPt.setProperties(['tp', 'hrx', 'hry'], [IFPathBase.AnchorPoint.Type.Asymmetric, null, null]);
                    }
                } else { // _mode == Prepend
                    if (this._editPt.getProperty('hrx') !== null && this._editPt.getProperty('hry') !== null) {
                        this._editPt.setProperties(['tp', 'hlx', 'hly'], [IFPathBase.AnchorPoint.Type.Symmetric, null, null]);
                    } else {
                        this._editPt.setProperties(['tp', 'hlx', 'hly'], [IFPathBase.AnchorPoint.Type.Asymmetric, null, null]);
                    }
                }
            } else {
                if (!gPlatform.modifiers.optionKey) {
                    this._editPt.setProperties(['tp', 'hlx', 'hly', 'hrx', 'hry'], [IFPathBase.AnchorPoint.Type.Asymmetric, null, null, null, null]);
                } else {
                    this._editPt.setProperties(['tp', 'hrx', 'hry'], [IFPathBase.AnchorPoint.Type.Asymmetric, null, null]);
                }
            }
        } else {
            var transformToNewPos = this._pathEditor.getTransformFromNative(this._view.getWorldTransform());
            var transformToNative = transformToNewPos.inverted();
            var newNativePos = transformToNative.mapPoint(newPos);

            if (!this._newPoint && gPlatform.modifiers.optionKey && this._firstAlt &&
                    tp != IFPathBase.AnchorPoint.Type.Connector &&
                    !(this._editPt.getPrevious() == null && this._editPt.getNext() == null)) {

                var dx = newNativePos.getX() - ptx;
                var dy = newNativePos.getY() - pty;
                this._editPt.setProperty('ah', false);
                var hrxOrig = this._dragStartPt.getProperty('hrx');
                hrx = hrxOrig != null ? hrxOrig + dx : newNativePos.getX();
                var hryOrig = this._dragStartPt.getProperty('hry');
                hry = hryOrig != null ? hryOrig + dy : newNativePos.getY();
                this._editPt.setProperty('ah', false);
                this._editPt.setProperties(['tp', 'hrx', 'hry'], [IFPathBase.AnchorPoint.Type.Asymmetric, hrx, hry]);

            } else if (tp != IFPathBase.AnchorPoint.Type.Connector) {
                this._editPt.setProperty('ah', false);
                var h1x = newNativePos.getX();
                var h1y = newNativePos.getY();
                if (gPlatform.modifiers.optionKey) {
                    if (this._mode == IFPathTool.Mode.Prepend) {
                        this._editPt.setProperties(['tp', 'hlx', 'hly'],
                            [IFPathBase.AnchorPoint.Type.Asymmetric, h1x, h1y]);
                    } else { // mode == Append || mode == Edit
                        this._editPt.setProperties(['tp', 'hrx', 'hry'],
                            [IFPathBase.AnchorPoint.Type.Asymmetric, h1x, h1y]);
                    }
                } else {
                    var newTp = IFPathBase.AnchorPoint.Type.Symmetric;
                    if (this._mode != IFPathTool.Mode.Edit && !this._newPoint &&
                        !this._dpathRef.getProperty('closed') &&
                        (this._editPt.getPrevious() == null && this._editPt.getNext() != null ||
                            this._editPt.getPrevious() != null && this._editPt.getNext() == null)) {

                        if (this._mode == IFPathTool.Mode.Prepend) {
                            this._editPt.setProperties(['tp', 'hlx', 'hly'], [newTp, h1x, h1y]);
                        } else { // mode == Append
                            this._editPt.setProperties(['tp', 'hrx', 'hry'], [newTp, h1x, h1y]);
                        }
                    } else {
                        var h2x = ptx + ptx - h1x;
                        var h2y = pty + pty - h1y;
                        if (this._mode == IFPathTool.Mode.Prepend) {
                            this._editPt.setProperties(['tp', 'hrx', 'hry', 'hlx', 'hly'], [newTp, h2x, h2y, h1x, h1y]);
                        } else {
                            this._editPt.setProperties(['tp', 'hrx', 'hry', 'hlx', 'hly'], [newTp, h1x, h1y, h2x, h2y]);
                        }
                    }
                }
            } else { // tp == IFPathBase.AnchorPoint.Type.Connector
                if (this._mode == IFPathTool.Mode.Append ||
                        this._mode == IFPathTool.Mode.Edit && gPlatform.modifiers.optionKey) {

                    hlx = null;
                    hly = null;

                    // calculate right handle to be projection of click point to the vector,
                    // connecting previous point and this one
                    var prevPt = this._editPt.getPrevious();
                    if (prevPt) {
                        var prevX = prevPt.getProperty('x');
                        var prevY = prevPt.getProperty('y');
                        var dirLen = Math.sqrt(ifMath.ptSqrDist(ptx, pty, prevX, prevY));
                        if (!ifMath.isEqualEps(dirLen, 0)) {
                            var ex = (ptx - prevX) / dirLen;
                            var ey = (pty - prevY) / dirLen;
                            var hLen = ifMath.vDotProduct(ex, ey, newNativePos.getX() - ptx, newNativePos.getY() - pty);
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
                } else if (this._mode == IFPathTool.Mode.Prepend) {
                    hrx = null;
                    hry = null;

                    // calculate the left handle to be projection of click point to the vector,
                    // connecting the next point and this one
                    var nextPt = this._editPt.getNext();
                    if (nextPt) {
                        var nextX = nextPt.getProperty('x');
                        var nextY = nextPt.getProperty('y');
                        var dirLen = Math.sqrt(ifMath.ptSqrDist(ptx, pty, nextX, nextY));
                        if (!ifMath.isEqualEps(dirLen, 0)) {
                            var ex = (ptx - nextX) / dirLen;
                            var ey = (pty - nextY) / dirLen;
                            var hLen = ifMath.vDotProduct(ex, ey, newNativePos.getX() - ptx, newNativePos.getY() - pty);
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
     * @param {GUIMouseEvent.Drag | GUIMouseEvent.Move} event
     * @private
     */
    IFPenTool.prototype._mouseDrag = function (event) {
        if (this._refPt && !this._editPt && !this._released) {
            this._makePointMajor(this._refPt);
            this._editPt = this._pathEditor.getPathPointPreview(this._refPt);
            this._dragStartPt = this._refPt;
            if (event.button == GUIMouseEvent.BUTTON_LEFT) {
                this._editPt.setProperty('tp', IFPathBase.AnchorPoint.Type.Symmetric);
            }
            this._pathEditor.requestInvalidation();
        }
        if (!this._released && this._editPt) {
            this._lastMouseEvent = event;
            this._setCursorForPosition(IFCursor.PenDrag);
            if (!this._dragStartPt) {
                this._dragStartPt = this._refPt ? this._refPt : this._editPt;
                if (event.button == GUIMouseEvent.BUTTON_LEFT && this._editPt.getProperty('tp') != IFPathBase.AnchorPoint.Type.Connector) {
                    this._editPt.setProperty('tp', IFPathBase.AnchorPoint.Type.Symmetric);
                }
            }
            this._dragStarted = true;
            this._updatePointProperties(event.client);
        }
    };

    /**
     * Constructs new point, specific to Pen Tool, with the given position
     * @param {GUIMouseEvent} event used to define pressed button
     * @param {GPoint} pt - coordinates to be used for new position in world system
     * @returns {IFPath.AnchorPoint} newly created anchor point
     * @private
     */
    IFPenTool.prototype._constructNewPoint = function (event, pt) {
        var anchorPt = new IFPath.AnchorPoint();
        anchorPt.setProperties(['x', 'y'], [pt.getX(), pt.getY()]);

        return anchorPt;
    };

    /** @override */
    IFPenTool.prototype._mouseRelease = function (event) {
        if (!this._released) {
            try {
                var anchorPt;

                this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
                this._released = true;
                if (this._pathEditor && this._mode == IFPathTool.Mode.Edit) {
                    if (!this._dragStarted && this._refPt && !this._editPt) {
                        this._mouseNoDragReleaseOnEdit(event.client);
                    } else if (this._dragStarted) {
                        this._updatePointProperties(event.client);
                        if (this._transactionType == IFPathTool.Transaction.NoTransaction) {
                            this._startTransaction(IFPathTool.Transaction.ModifyPointProperties);
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
                        if (this._mode == IFPathTool.Mode.Append) {
                            this._refPt = this._pathRef.getAnchorPoints().getLastChild();
                            otherPt = this._pathRef.getAnchorPoints().getFirstChild();
                        } else { // this._mode == IFPathTool.Mode.Prepend
                            this._refPt = this._pathRef.getAnchorPoints().getFirstChild();
                            otherPt = this._pathRef.getAnchorPoints().getLastChild();
                        }
                        if (!this._newPoint) {
                            if (this._transactionType == IFPathTool.Transaction.NoTransaction) {
                                this._startTransaction(IFPathTool.Transaction.ModifyPointProperties);
                            }
                            this._pathEditor.selectOnePoint(this._refPt);
                            this._pathEditor.applyTransform(this._pathRef);
                        }
                        //this._makePointMajor(this._refPt);
                        if (otherPt && otherPt != this._refPt &&
                            this._pathEditor.hitAnchorPoint(otherPt, newPos, this._view.getWorldTransform(), this._scene.getProperty('pickDist'))) {

                            this._setCursorForPosition(IFCursor.PenEnd);
                        } else {
                            this._setCursorForPosition(IFCursor.Pen);
                        }
                        this._commitChanges();
                    } else {
                        if (this._refPt) {
                            this._startTransaction(IFPathTool.Transaction.ModifyPathProperties);
                            this._pathEditor.selectOnePoint(this._refPt);
                            this._pathEditor.applyTransform(this._pathRef);
                            this._pathEditor.requestInvalidation();
                            this._pathRef.setProperty('closed', true);
                            this._pathEditor.setActiveExtendingMode(false);
                        }
                        this._commitChanges();
                        this._mode = IFPathTool.Mode.Edit;
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
    IFPenTool.prototype._updateShoulders = function(newPos) {
        if (this._mode != IFPathTool.Mode.Append && this._mode != IFPathTool.Mode.Prepend || !this._editPt) {
            return;
        }
        if (this._pathEditor.hitAnchorPoint(this._editPt, newPos, this._view.getWorldTransform(), 0)) {
            if (this._mode == IFPathTool.Mode.Append) {
                this._editPt.setProperty('cr', null);
            } else if (this._mode == IFPathTool.Mode.Prepend) {
                this._editPt.setProperty('cl', null);
            }
        } else {
            var transformToNewPos = this._pathEditor.getTransformFromNative(this._view.getWorldTransform());
            var sourcePos = new GPoint(this._editPt.getProperty('x'), this._editPt.getProperty('y'));
            sourcePos = transformToNewPos.mapPoint(sourcePos);
            var newVal = ifMath.ptDist(sourcePos.getX(), sourcePos.getY(), newPos.getX(), newPos.getY());

            if (this._mode == IFPathTool.Mode.Append) {
                this._editPt.setProperty('cr', newVal);
            } else if (this._mode == IFPathTool.Mode.Prepend) {
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
    IFPenTool.prototype._updatePointProperties = function(clickPt) {
        var newPos = clickPt;

        // No need to check _pathEditor and _editPt for null here,
        // as this function is called only when dragging is started, and they are already checked
        this._pathEditor.requestInvalidation();
        if (this._editPt.getProperty('tp') == IFPathBase.CornerType.Rounded) {
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
    IFPenTool.prototype.toString = function () {
        return "[Object IFPenTool]";
    };

    _.IFPenTool = IFPenTool;
})(this);
