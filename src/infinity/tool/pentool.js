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
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M9.2,21.3l0.7,0.7l-6.5,3.6c0,0-0.5,3.1-1.4,5.7c-0.8,2.2-2.1,3.6-1.4,4.3c0,0,0,0,0.7,0.7\n\tc0.7,0.7,2.1-0.6,4.3-1.4c2.5-0.9,5.6-1.4,5.6-1.4l3.7-6.4l0.7,0.7l2.9-2.1l-7.1-7.1L9.2,21.3z M4.2,26.4l6.5-3.6l3.6,3.6l-3.7,6.4\n\tc-4.8,0.5-8.5,2.8-8.5,2.8l3.2-3.2c0.8,0.5,1.8,0.3,2.4-0.3c0.8-0.8,0.8-2,0-2.8c-0.8-0.8-2-0.8-2.8,0c-0.7,0.7-0.8,1.7-0.4,2.5\n\tl-3.2,3.2C1.4,34.9,3.7,31.2,4.2,26.4z"/>\n</svg>\n';
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
        if (tm - this._mDownTime < GXPathTool.DBLCLICKTM) {
            // Double-click
            return;
        }

        var anchorPt = null;

        //this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
        this._lastMouseEvent = event;
        this._dragStarted = false;
        this._dragStartPt = null;

        if (event.button == GUIMouseEvent.BUTTON_LEFT ||
            event.button == GUIMouseEvent.BUTTON_RIGHT && gPlatform.modifiers.optionKey) {
            this._mouseMove(event);

            this._mDownTime = tm;
            this._released = false;
            this._blockDeactivation();
            this._checkMode();
            this._renewPreviewLink();

            if (this._mode == GXPathTool.Mode.Edit) {
                this._mouseDownOnEdit(event.client);
            }

            if (this._mode != GXPathTool.Mode.Edit) {
                if (this._newPoint && this._pathEditor) {
                    this._updatePoint(event.client);
                    if (this._mode == GXPathTool.Mode.Append) {
                        var prevPt = this._editPt.getPrevious();
                        if (prevPt) {
                            prevPt.removeFlag(GXNode.Flag.Selected);
                            this._editPt.setFlag(GXNode.Flag.Selected);
                        }
                    } else { // mode == Prepend
                        var nextPt = this._editPt.getNext();
                        if (nextPt) {
                            nextPt.removeFlag(GXNode.Flag.Selected);
                            this._editPt.setFlag(GXNode.Flag.Selected);
                        }
                    }
                    this._pathEditor.requestInvalidation();
                    if (event.button == GUIMouseEvent.BUTTON_RIGHT && gPlatform.modifiers.optionKey) {
                        this._editPt.setProperty('tp', 'C');
                    } else if (!gPlatform.modifiers.optionKey){
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
            }
        }
        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
    };

    /** overwrite */
    GXPenTool.prototype._renewPreviewLink = function () {
        if (!this._pathEditor) {
            this._editPt = null;
            this._newPoint = false;
            this._dpathRef = null;
        } else {
            var newDPathRef = this._pathEditor.getPathPreview(true);
            if (this._editPt) {
                var checkPt;
                if (this._mode == GXPathTool.Mode.Append) {
                    checkPt = newDPathRef.getAnchorPoints().getLastChild();
                } else { // this._mode == GXPathTool.Mode.Prepend
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
            var transform = this._pathRef.getTransform();
            location = transform ? transform.mapPoint(location) : location;

            if (otherPt && this._pathEditor.hitAnchorPoint(otherPt, location, null, this._scene.getProperty('pickDist')) ) {
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
                    this._pathEditor.setActiveExtendingMode(false);
                } else {
                    this._dpathRef = this._pathEditor.getPathPreview(true);
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
        if (tm - this._mDownTime < GXPathTool.DBLCLICKTM) {
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

        this._lastMouseEvent = event;
        this._checkMode();
        this._renewPreviewLink();
        if (this._mode == GXPathTool.Mode.Edit) {
            this._setCursorForPosition(null, event.client);
        } else { // _mode == Append || Prepend
            var newPos = event.client;
            if (!this._newPoint && this._pathEditor) {
                newPos = this._constrainIfNeeded(event.client, this._view.getWorldTransform(), this._pathRef);
                // add new point
                var clickPt = this._view.getViewTransform().mapPoint(newPos);
                anchorPt = this._constructNewPoint(event, clickPt);
                this._addPoint(anchorPt, true, false, true);
            } else if (this._editPt) {
                this._pathEditor.requestInvalidation();
                newPos = this._updatePoint(event.client);
                this._pathEditor.requestInvalidation();
            }
            if (this._editPt) {
                var otherPt;
                if (this._mode == GXPathTool.Mode.Append) {
                    otherPt = this._pathRef.getAnchorPoints().getFirstChild();
                } else { // this._mode == GXPathTool.Mode.Prepend
                    otherPt = this._pathRef.getAnchorPoints().getLastChild();
                }
                if (this._pathEditor.hitAnchorPoint(otherPt, newPos, this._view.getWorldTransform(), this._scene.getProperty('pickDist'))) {
                    this._setCursorForPosition(GUICursor.PenEnd);
                } else {
                    this._setCursorForPosition(GUICursor.Pen);
                }
            } else {
                this._setCursorForPosition(null, event.client);
            }
        }
        //this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
    };

    GXPenTool.prototype._updateHandles = function (newPos) {
        var tp = this._editPt.getProperty('tp');
        var ptx = this._editPt.getProperty('x');
        var pty = this._editPt.getProperty('y');
        var hlx, hly, hrx, hry;
        if (this._pathEditor.hitAnchorPoint(this._editPt, newPos, this._view.getWorldTransform(), 0)) {
            if (this._mode != GXPathTool.Mode.Edit) {
                if (this._mode == GXPathTool.Mode.Append) {
                    if (this._editPt.getProperty('hlx') !== null && this._editPt.getProperty('hly') !== null) {
                        this._editPt.setProperties(['tp', 'hrx', 'hry'], ['S', null, null]);
                    } else {
                        this._editPt.setProperties(['tp', 'hrx', 'hry'], ['N', null, null]);
                    }
                } else { // _mode == Prepend
                    if (this._editPt.getProperty('hrx') !== null && this._editPt.getProperty('hry') !== null) {
                        this._editPt.setProperties(['tp', 'hlx', 'hly'], ['S', null, null]);
                    } else {
                        this._editPt.setProperties(['tp', 'hlx', 'hly'], ['N', null, null]);
                    }
                }
            } else {
                if (!gPlatform.modifiers.optionKey) {
                    this._editPt.setProperties(['tp', 'hlx', 'hly', 'hrx', 'hry'], ['N', null, null, null, null]);
                } else {
                    this._editPt.setProperties(['tp', 'hrx', 'hry'], ['N', null, null]);
                }
            }
        } else {
            var transformToNewPos = this._pathEditor.getTransformFromNative(this._view.getWorldTransform());
            var transformToNative = transformToNewPos.inverted();
            var newNativePos = transformToNative.mapPoint(newPos);

            if (this._mode == GXPathTool.Mode.Edit) {
                if (!gPlatform.modifiers.optionKey) {
                    hrx = newNativePos.getX();
                    hry = newNativePos.getY();
                    this._editPt.setProperty('ah', false);
                    hlx = ptx + ptx - hrx;
                    hly = pty + pty - hry;
                    this._editPt.setProperties(['tp', 'hlx', 'hly', 'hrx', 'hry'],
                        ['S', hlx, hly, hrx, hry]);
                } else {
                    var dx = newNativePos.getX() - ptx;
                    var dy = newNativePos.getY() - pty;
                    this._editPt.setProperty('ah', false);
                    var hrxOrig = this._dragStartPt.getProperty('hrx');
                    hrx = hrxOrig != null ? hrxOrig + dx : newNativePos.getX();
                    var hryOrig = this._dragStartPt.getProperty('hry');
                    hry = hryOrig != null ? hryOrig + dy : newNativePos.getY();
                    this._editPt.setProperties(['tp', 'hrx', 'hry'], ['N', hrx, hry]);
                }
            } else if (this._mode == GXPathTool.Mode.Append) {
                if (tp != 'C') {
                    hrx = newNativePos.getX();
                    hry = newNativePos.getY();
                    this._editPt.setProperty('ah', false);
                    if (!gPlatform.modifiers.optionKey) {
                        hlx = ptx + ptx - hrx;
                        hly = pty + pty - hry;
                        this._editPt.setProperties(['tp', 'hlx', 'hly', 'hrx', 'hry'],
                            ['S', hlx, hly, hrx, hry]);
                    } else {
                        this._editPt.setProperties(['hrx', 'hry'], [hrx, hry]);
                    }
                } else {
                    hlx = null;
                    hly = null;

                    // calculate right handle to be projection of click point to the vector,
                    // connecting previous point and this one
                    var prevPt = this._editPt.getPrevious();
                    if (prevPt) {
                        var prevX = prevPt.getProperty('x');
                        var prevY = prevPt.getProperty('y');
                        var dirLen = Math.sqrt(gMath.ptSqrDist(ptx, pty, prevX, prevY));
                        if (!gMath.isEqualEps(dirLen, 0)) {
                            var ex = (ptx - prevX) / dirLen;
                            var ey = (pty - prevY) / dirLen;
                            var hLen = gMath.vDotProduct(ex, ey, newNativePos.getX() - ptx, newNativePos.getY() - pty);
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
                }
            } else { // this._mode == GXPathTool.Mode.Prepend
                if (tp != 'C') {
                    hlx = newNativePos.getX();
                    hly = newNativePos.getY();
                    this._editPt.setProperty('ah', false);
                    if (!gPlatform.modifiers.optionKey) {
                        hrx = ptx + ptx - hlx;
                        hry = pty + pty - hly;
                        this._editPt.setProperties(['tp', 'hlx', 'hly', 'hrx', 'hry'],
                            ['S', hlx, hly, hrx, hry]);
                    } else {
                        this._editPt.setProperties(['hlx', 'hly'], [hlx, hly]);
                    }
                } else {
                    hrx = null;
                    hry = null;

                    // calculate the left handle to be projection of click point to the vector,
                    // connecting the next point and this one
                    var nextPt = this._editPt.getNext();
                    if (nextPt) {
                        var nextX = nextPt.getProperty('x');
                        var nextY = nextPt.getProperty('y');
                        var dirLen = Math.sqrt(gMath.ptSqrDist(ptx, pty, nextX, nextY));
                        if (!gMath.isEqualEps(dirLen, 0)) {
                            var ex = (ptx - nextX) / dirLen;
                            var ey = (pty - nextY) / dirLen;
                            var hLen = gMath.vDotProduct(ex, ey, newNativePos.getX() - ptx, newNativePos.getY() - pty);
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
            this._lastMouseEvent = event;
            this._setCursorForPosition(GUICursor.PenDrag);
            if (!this._dragStartPt) {
                this._dragStartPt = this._refPt ? this._refPt : this._editPt;
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
    };

    /**
     * Constructs new point, specific to Pen Tool, with the given position
     * @param {GUIMouseEvent} event used to define pressed button
     * @param {GPoint} pt - coordinates to be used for new position in world system
     * @returns {GXPath.AnchorPoint} newly created anchor point
     * @private
     */
    GXPenTool.prototype._constructNewPoint = function (event, pt) {
        var anchorPt = new GXPath.AnchorPoint();
        anchorPt.setProperties(['x', 'y'], [pt.getX(), pt.getY()]);

        return anchorPt;
    };

    /** @override */
    GXPenTool.prototype._mouseRelease = function (event) {
        var anchorPt;

        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
        this._released = true;
        if (this._pathEditor && this._mode == GXPathTool.Mode.Edit) {
            if (!this._dragStarted && this._refPt && !this._editPt) {
                this._mouseNoDragReleaseOnEdit(event.client);
            } else if (this._dragStarted) {
                var clickPt = this._constrainIfNeeded(
                    event.client, this._view.getWorldTransform(), this._pathRef, this._dragStartPt);

                this._pathEditor.requestInvalidation();
                this._updateHandles(clickPt);
                this._pathEditor.requestInvalidation();
                this._pathEditor.applyTransform(this._pathRef);
                this._commitChanges();
                this._setCursorForPosition(null, event.client);
            } else {
                // NOOP on release
                this._commitChanges();
                this._setCursorForPosition(null, event.client);
            }
        } else if (this._dpathRef) {
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
                var otherPt;
                if (this._mode == GXPathTool.Mode.Append) {
                    this._refPt = this._pathRef.getAnchorPoints().getLastChild();
                    otherPt = this._pathRef.getAnchorPoints().getFirstChild();
                } else { // this._mode == GXPathTool.Mode.Prepend
                    this._refPt = this._pathRef.getAnchorPoints().getFirstChild();
                    otherPt = this._pathRef.getAnchorPoints().getLastChild();
                }
                if (!this._newPoint) {
                    this._pathEditor.selectOnePoint(this._refPt);
                    this._pathEditor.applyTransform(this._pathRef);
                }
                //this._makePointMajor(this._refPt);
                if (otherPt && otherPt != this._refPt &&
                    this._pathEditor.hitAnchorPoint(otherPt, event.client, this._view.getWorldTransform(), this._scene.getProperty('pickDist'))) {

                    this._setCursorForPosition(GUICursor.PenEnd);
                } else {
                    this._setCursorForPosition(GUICursor.Pen);
                }
                this._commitChanges();
            } else {
                if (this._refPt) {
                    this._pathEditor.selectOnePoint(this._refPt);
                    this._pathEditor.applyTransform(this._pathRef);
                    this._pathEditor.requestInvalidation();
                    this._pathRef.setProperty('closed', true);
                    this._pathEditor.setActiveExtendingMode(false);
                }
                this._commitChanges();
                this._mode = GXPathTool.Mode.Edit;
                this._setCursorForPosition(null, event.client);
            }
            this._refPt = null;
        }
        this._dragStarted = false;
        this._dragStartPt = null;
        this._lastMouseEvent = null;

        this._allowDeactivation();
    };

    /** override */
    GXPenTool.prototype.toString = function () {
        return "[Object GXPenTool]";
    };

    _.GXPenTool = GXPenTool;
})(this);
