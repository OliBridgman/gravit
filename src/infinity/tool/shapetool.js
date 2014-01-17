(function (_) {
    /**
     * The base tool for simple shapes based on GXShape
     * @param {Boolean} keepRatio if true, the ratio
     * on width/height will be kept if user holds shift-modifier key
     * @param {Boolean} allowFromCenter if true, the drag
     * area will be calculated from center and goes into each
     * direction if user holds option-modifier key
     * @class GXShapeTool
     * @extends GXTool
     * @constructor
     */
    function GXShapeTool(keepRatio, fromCenter) {
        GXTool.call(this);
        this._keepRatio = keepRatio;
        this._fromCenter = fromCenter;
    }

    GObject.inherit(GXShapeTool, GXTool);

    /**
     * Options for shape tools
     * @version 1.0
     */
    GXShapeTool.options = {
        /**
         * The size of the center cross if any,
         * should be an even number
         * @type Number
         * @version 1.0
         */
        centerCrossSize: 4
    };

    /**
     * @type {GPoint}
     * @private
     */
    GXShapeTool.prototype._dragStart = null;

    /**
     * @type {GPoint}
     * @private
     */
    GXShapeTool.prototype._dragCurrent = null;

    /**
     * @type {Boolean}
     * @private
     */
    GXShapeTool.prototype._dragCanceled = false;

    /**
     * @type {Boolean}
     * @private
     */
    GXShapeTool.prototype._keepRatio = false;

    /**
     * @type {Boolean}
     * @private
     */
    GXShapeTool.prototype._fromCenter = false;

    /**
     * @type {GXShape}
     * @private
     */
    GXShapeTool.prototype._shape = null;

    /**
     * @type {GRect}
     * @private
     */
    GXShapeTool.prototype._dragArea = null;

    /**
     * @type {Array<GPoint>}
     * @private
     */
    GXShapeTool.prototype._dragLine = null;

    /** @override */
    GXShapeTool.prototype.getHint = function () {
        var hint = GXTool.prototype.getHint.call(this);

        if (this._keepRatio) {
            hint.addKey(GUIKey.Constant.SHIFT, new GLocale.Key(GXShapeTool, "shortcut.shift"), true);
        }
        if (this._fromCenter) {
            hint.addKey(GUIKey.Constant.OPTION, new GLocale.Key(GXShapeTool, "shortcut.option"), true);
        }

        return hint;
    };

    /** @override */
    GXShapeTool.prototype.getCursor = function () {
        return GUICursor.Cross;
    };

    /** @override */
    GXShapeTool.prototype.activate = function (view, layer) {
        GXTool.prototype.activate.call(this, view, layer);

        layer.addEventListener(GUIMouseEvent.DragStart, this._mouseDragStart, this);
        layer.addEventListener(GUIMouseEvent.Drag, this._mouseDrag, this);
        layer.addEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd, this);
        layer.addEventListener(GUIMouseEvent.Down, this._mouseDown, this);

        gPlatform.addEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged, this);
    };

    /** @override */
    GXShapeTool.prototype.deactivate = function (view, layer) {
        GXTool.prototype.deactivate.call(this, view, layer);

        layer.removeEventListener(GUIMouseEvent.DragStart, this._mouseDragStart);
        layer.removeEventListener(GUIMouseEvent.Drag, this._mouseDrag);
        layer.removeEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd);
        layer.removeEventListener(GUIMouseEvent.Down, this._mouseDown);

        gPlatform.removeEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged);
    };

    /** @override */
    GXShapeTool.prototype.isDeactivatable = function () {
        // cannot deactivate while dragging
        return this._dragStart ? false : true;
    };

    /** @override */
    GXShapeTool.prototype.cancel = function () {
        if (!this._dragCanceled) {
            this._dragCanceled = true;
            if (this._shape) {
                var shape = this._shape;
                this._shape = null; // reset to prevent repainting
                this._invalidateShapeArea(shape);
            }
        }
    };

    /** @override */
    GXShapeTool.prototype.paint = function (context) {
        if (this._shape) {
            // Paint outline of shape
            context.canvas.putVertices(new GXVertexPixelAligner(this._shape));
            context.canvas.strokeVertices(context.selectionOutlineColor);

            // Paint center cross if desired
            if (this._paintCenterCross()) {
                var geometryBBox = this._shape.getGeometryBBox();
                var crossSizeMax = GXShapeTool.options.centerCrossSize * 4;

                if (geometryBBox && !geometryBBox.isEmpty() &&
                    geometryBBox.getWidth() > crossSizeMax && geometryBBox.getHeight() > crossSizeMax) {
                    var cs = GXShapeTool.options.centerCrossSize / 2 + 0.5;
                    var cp = geometryBBox.getSide(GRect.Side.CENTER);
                    var cx = Math.floor(cp.getX()) + 0.5;
                    var cy = Math.floor(cp.getY()) + 0.5;

                    context.canvas.strokeLine(cx - cs, cy - cs, cx + cs, cy + cs, 1, context.selectionOutlineColor);
                    context.canvas.strokeLine(cx + cs, cy - cs, cx - cs, cy + cs, 1, context.selectionOutlineColor);
                }
            }
        }
    };

    /**
     * @param {GUIMouseEvent.Down} event
     * @private
     */
    GXShapeTool.prototype._mouseDown = function (event) {
        // Quit if not hitting the left-mouse-button
        if (event.button !== GUIMouseEvent.BUTTON_LEFT) {
            return;
        }

        // Let editor do some work for mouse position
        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
    };

    /**
     * @param {GUIMouseEvent.DragStart} event
     * @private
     */
    GXShapeTool.prototype._mouseDragStart = function (event) {
        this._dragStart = event.client;
        this._dragCanceled = false;

        // Create our shape when user started dragging
        this._shape = this._createShape();
        this._invalidateShape();
    };

    /**
     * @param {GUIMouseEvent.Drag} event
     * @private
     */
    GXShapeTool.prototype._mouseDrag = function (event) {
        if (!this._dragCanceled) {
            this._dragCurrent = event.client;
            this._invalidateShape();
        }
    };

    /**
     * @param {GUIMouseEvent.DragEnd} event
     * @private
     */
    GXShapeTool.prototype._mouseDragEnd = function (event) {
        if (!this._dragCanceled) {
            // Reset shape and repaint
            var shape = this._shape;
            this._shape = null;
            this._invalidateShapeArea(shape);

            // Append shape now
            this._appendShape(shape);
        }
        this._dragStart = null;
        this._dragCurrent = null;
        this._shape = null;
        this._dragArea = null;
        this._dragLine = null;
    };

    /**
     * @param {GUIPlatform.ModifiersChangedEvent} event
     * @private
     */
    GXShapeTool.prototype._modifiersChanged = function (event) {
        if ((this._keepRatio && event.changed.shiftKey) ||
            (this._fromCenter && event.changed.optionKey)) {
            this._invalidateShape();
        }
    };

    /**
     * @private
     */
    GXShapeTool.prototype._invalidateShape = function () {
        if (this._dragStart && this._dragCurrent) {
            if (GPoint.equals(this._dragStart, this._dragCurrent)) {
                this._invalidateShapeArea();
            } else {
                var x0 = this._dragStart.getX();
                var y0 = this._dragStart.getY();
                var x1 = this._dragCurrent.getX();
                var y1 = this._dragCurrent.getY();
                var x2 = x1; // for line
                var y2 = y1; // for line

                if (this._keepRatio && gPlatform.modifiers.shiftKey) {
                    var w = Math.abs(x1 - x0);
                    var h = Math.abs(y1 - y0);
                    var wSign = x1 < x0 ? -1 : 1;
                    var hSign = y1 < y0 ? -1 : 1;

                    if (w >= h) {
                        x1 = x0 + w * wSign;
                        y1 = y0 + w * hSign;
                        y2 = (w < 2.0 * h) ? y1 : y0;
                    } else {
                        x1 = x0 + h * wSign;
                        y1 = y0 + h * hSign;
                        x2 = (h < 2.0 * w) ? x1 : x0;
                    }
                }

                /** @type GRect */
                var dragArea = null;
                /** @type Array<GPoint> */
                var dragLine = null;

                if (this._fromCenter && gPlatform.modifiers.optionKey) {
                    dragArea = GRect.fromPoints(new GPoint(x0 - (x1 - x0), y0 - (y1 - y0)), new GPoint(x0 + (x1 - x0), y0 + (y1 - y0)));
                    dragLine = [new GPoint(x0 - (x2 - x0), y0 - (y2 - y0)), new GPoint(x0 + (x2 - x0), y0 + (y2 - y0))];
                }
                else {
                    dragArea = GRect.fromPoints(new GPoint(x0, y0), new GPoint(x1, y1));
                    dragLine = [new GPoint(x0, y0), new GPoint(x2, y2)];
                }

                this._dragArea = dragArea;
                this._dragLine = dragLine;

                this._invalidateShapeArea();
                this._updateShape(this._shape, dragArea, dragLine);
                this._invalidateShapeArea();
            }
        }
    };

    /**
     * Called to append a given shape
     * @param {GXShape} shape
     * @private
     */
    GXShapeTool.prototype._appendShape = function (shape) {
        // Let the tool calculate the parameters in scene coordinates
        var transform = this._view.getViewTransform();
        var dragArea = transform.mapRect(this._dragArea);
        var dragLine = [transform.mapPoint(this._dragLine[0]), transform.mapPoint(this._dragLine[1])];

        // Update shape with scene coordinates
        this._updateShape(shape, dragArea, dragLine);

        // Call editor for new insertion
        this._editor.insertElement(shape);
    };

    /**
     * @param {GXShape} [shape] the shape to invalidate,
     * if not provided defaults to current shape if any
     * @private
     */
    GXShapeTool.prototype._invalidateShapeArea = function (shape) {
        shape = shape || this._shape;
        if (shape) {
            var geometryBBox = shape.getGeometryBBox();
            if (geometryBBox && (geometryBBox.getWidth() > 0 || geometryBBox.getHeight() > 0)) {
                this.invalidateArea(geometryBBox.expanded(1, 1, 1, 1));
            }
        }
    };

    /**
     * Called to create an instance of the shape for this tool
     * @return {GXShape}
     * @private
     */
    GXShapeTool.prototype._createShape = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Called to update the shape of this tool
     * @param {GXShape} shape the shape to update
     * @param {GRect} area the shape area
     * @param {Array<GPoint>} line the shape line
     * @private
     */
    GXShapeTool.prototype._updateShape = function (shape, area, line) {
        throw new Error("Not Supported.");
    };

    /**
     * Called to check whether a center cross should be painted or not
     * @return {Boolean} true if a center cross should be painted, false if not (default)
     * @private
     */
    GXShapeTool.prototype._paintCenterCross = function () {
        return false;
    };

    /** override */
    GXShapeTool.prototype.toString = function () {
        return "[Object GXShapeTool]";
    };

    _.GXShapeTool = GXShapeTool;
})(this);