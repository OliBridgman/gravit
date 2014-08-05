(function (_) {
    /**
     * The base tool for simple shapes based on IFShape
     * @param {Boolean} keepRatio if true, the ratio
     * on width/height will be kept if user holds shift-modifier key
     * @param {Boolean} allowFromCenter if true, the drag
     * area will be calculated from center and goes into each
     * direction if user holds option-modifier key
     * @class IFShapeTool
     * @extends IFTool
     * @constructor
     */
    function IFShapeTool(keepRatio, fromCenter) {
        IFTool.call(this);
        this._keepRatio = keepRatio;
        this._fromCenter = fromCenter;
    }

    IFObject.inherit(IFShapeTool, IFTool);

    /**
     * Options for shape tools
     * @version 1.0
     */
    IFShapeTool.options = {
        /**
         * The size of the center cross if any,
         * should be an even number
         * @type Number
         * @version 1.0
         */
        centerCrossSize: 4
    };

    /**
     * Dragging start position in scene coordinates
     * @type {IFPoint}
     * @private
     */
    IFShapeTool.prototype._dragStart = null;

    /**
     * Dragging current position in scene coordinates
     * @type {IFPoint}
     * @private
     */
    IFShapeTool.prototype._dragCurrent = null;

    /**
     * Whether to keep ratio or not
     * @type {Boolean}
     * @private
     */
    IFShapeTool.prototype._keepRatio = false;

    /**
     * Whether to calculate from center or not
     * @type {Boolean}
     * @private
     */
    IFShapeTool.prototype._fromCenter = false;

    /**
     * @type {IFShape}
     * @private
     */
    IFShapeTool.prototype._shape = null;

    /**
     * Current drag area in scene coordinates
     * @type {IFRect}
     * @private
     */
    IFShapeTool.prototype._dragArea = null;

    /**
     * Current drag line in scene coordinates
     * @type {Array<IFPoint>}
     * @private
     */
    IFShapeTool.prototype._dragLine = null;

    /**
     * @type {boolean}
     * @private
     */
    IFShapeTool.prototype._hasCreatedShape = false;

    /** @override */
    IFShapeTool.prototype.getCursor = function () {
        return IFCursor.Cross;
    };

    /** @override */
    IFShapeTool.prototype.activate = function (view) {
        IFTool.prototype.activate.call(this, view);

        view.addEventListener(GUIMouseEvent.DragStart, this._mouseDragStart, this);
        view.addEventListener(GUIMouseEvent.Drag, this._mouseDrag, this);
        view.addEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd, this);
        view.addEventListener(GUIMouseEvent.Down, this._mouseDown, this);
        view.addEventListener(GUIMouseEvent.Release, this._mouseRelease, this);

        ifPlatform.addEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged, this);
    };

    /** @override */
    IFShapeTool.prototype.deactivate = function (view) {
        IFTool.prototype.deactivate.call(this, view);

        view.removeEventListener(GUIMouseEvent.DragStart, this._mouseDragStart);
        view.removeEventListener(GUIMouseEvent.Drag, this._mouseDrag);
        view.removeEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd);
        view.removeEventListener(GUIMouseEvent.Down, this._mouseDown);
        view.removeEventListener(GUIMouseEvent.Release, this._mouseRelease);

        ifPlatform.removeEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged);
    };

    /** @override */
    IFShapeTool.prototype.isDeactivatable = function () {
        // cannot deactivate while dragging
        return this._dragStart ? false : true;
    };

    /** @override */
    IFShapeTool.prototype.paint = function (context) {
        if (this._shape) {
            // Alignment here affects ellipses and handles of curves contained in ellipses,
            // but this is not noticeable, as it is a shape creation and line is just 1 pt width at any zoom
            this._paintOutline(context);

            // Paint center cross if desired
            if (this._hasCenterCross()) {
                var geometryBBox = this._shape.getGeometryBBox();
                var crossSizeMax = IFShapeTool.options.centerCrossSize * 4;

                if (geometryBBox && !geometryBBox.isEmpty() &&
                    geometryBBox.getWidth() > crossSizeMax && geometryBBox.getHeight() > crossSizeMax) {
                    var cs = IFShapeTool.options.centerCrossSize / 2 + 0.5;
                    var cp = geometryBBox.getSide(IFRect.Side.CENTER);
                    var cx = Math.floor(cp.getX()) + 0.5;
                    var cy = Math.floor(cp.getY()) + 0.5;

                    context.canvas.strokeLine(cx - cs, cy - cs, cx + cs, cy + cs, 1, context.selectionOutlineColor);
                    context.canvas.strokeLine(cx + cs, cy - cs, cx - cs, cy + cs, 1, context.selectionOutlineColor);
                }
            }
        }
    };

    /** @private */
    IFShapeTool.prototype._paintOutline = function (context) {
        context.canvas.putVertices(new IFVertexPixelAligner(this._shape));
        context.canvas.strokeVertices(context.selectionOutlineColor);
    };

    /**
     * @param {GUIMouseEvent.Down} event
     * @private
     */
    IFShapeTool.prototype._mouseDown = function (event) {
        // Quit if not hitting the left-mouse-button
        if (event.button !== GUIMouseEvent.BUTTON_LEFT) {
            return;
        }

        // Let editor do some work for mouse position
        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
    };

    /**
     * @param {GUIMouseEvent.Release} event
     * @private
     */
    IFShapeTool.prototype._mouseRelease = function (event) {
        if (!this._hasCreatedShape) {
            var position = this._view.getViewTransform().mapPoint(event.client);
            position = this._editor.getGuides().mapPoint(position);
            this._createShapeManually(position);
        }
        this._hasCreatedShape = false;
    };

    /**
     * @param {GUIMouseEvent.DragStart} event
     * @private
     */
    IFShapeTool.prototype._mouseDragStart = function (event) {
        this._hasCreatedShape = false;
        this._dragStart = this._view.getViewTransform().mapPoint(event.client);
        this._editor.getGuides().beginMap();
        this._dragStart = this._editor.getGuides().mapPoint(this._dragStart);
        this._editor.getGuides().finishMap();

        // Create our shape when user started dragging
        this._shape = this._createShape();
        this._invalidateShape();

        this.updateCursor();
    };

    /**
     * @param {GUIMouseEvent.Drag} event
     * @private
     */
    IFShapeTool.prototype._mouseDrag = function (event) {
        this._dragCurrent = this._view.getViewTransform().mapPoint(event.client);
        this._editor.getGuides().beginMap();
        this._dragCurrent = this._editor.getGuides().mapPoint(this._dragCurrent);
        this._editor.getGuides().finishMap();
        this._invalidateShape();
    };

    /**
     * @param {GUIMouseEvent.DragEnd} event
     * @private
     */
    IFShapeTool.prototype._mouseDragEnd = function (event) {
        // Reset shape and repaint
        var shape = this._shape;
        this._shape = null;
        this._invalidateShapeArea(shape);

        // Prepare shape for appending
        this._prepareShapeForAppend(shape);

        // Clear our stuff
        this._dragStart = null;
        this._dragCurrent = null;
        this._shape = null;
        this._dragArea = null;
        this._dragLine = null;

        this.updateCursor();

        // Finally insert our shape
        this._insertShape(shape);
        this._hasCreatedShape = true;
    };

    /**
     * @param {GUIPlatform.ModifiersChangedEvent} event
     * @private
     */
    IFShapeTool.prototype._modifiersChanged = function (event) {
        if ((this._keepRatio && event.changed.shiftKey) ||
            (this._fromCenter && event.changed.optionKey)) {
            this._invalidateShape();
        }
    };

    /**
     * @private
     */
    IFShapeTool.prototype._invalidateShape = function () {
        if (this._dragStart && this._dragCurrent) {
            if (IFPoint.equals(this._dragStart, this._dragCurrent)) {
                this._invalidateShapeArea();
            } else {
                var x0 = this._dragStart.getX();
                var y0 = this._dragStart.getY();
                var x1 = this._dragCurrent.getX();
                var y1 = this._dragCurrent.getY();
                var x2 = x1; // for line
                var y2 = y1; // for line

                if (this._keepRatio && ifPlatform.modifiers.shiftKey) {
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

                /** @type IFRect */
                var dragArea = null;
                /** @type Array<IFPoint> */
                var dragLine = null;

                if (this._fromCenter && ifPlatform.modifiers.optionKey) {
                    dragArea = IFRect.fromPoints(new IFPoint(x0 - (x1 - x0), y0 - (y1 - y0)), new IFPoint(x0 + (x1 - x0), y0 + (y1 - y0)));
                    dragLine = [new IFPoint(x0 - (x2 - x0), y0 - (y2 - y0)), new IFPoint(x0 + (x2 - x0), y0 + (y2 - y0))];
                }
                else {
                    dragArea = IFRect.fromPoints(new IFPoint(x0, y0), new IFPoint(x1, y1));
                    dragLine = [new IFPoint(x0, y0), new IFPoint(x2, y2)];
                }

                // Assign area and line in scene coordinates
                this._dragArea = dragArea;
                this._dragLine = dragLine;

                // Convert area and line into view coordinates before updating the shape
                var worldTransform = this._view.getWorldTransform();
                var dragAreaView = worldTransform.mapRect(dragArea);
                var dragLineView = [worldTransform.mapPoint(dragLine[0]), worldTransform.mapPoint(dragLine[1])];

                this._invalidateShapeArea();
                this._updateShape(this._shape, dragAreaView, dragLineView, false);
                this._invalidateShapeArea();
            }
        }
    };

    /**
     * Called to prepare a shape for appending
     * @param {IFShape} shape
     * @private
     */
    IFShapeTool.prototype._prepareShapeForAppend = function (shape) {
        // Update shape with scene coordinates before appending
        this._updateShape(shape, this._dragArea, this._dragLine, true);
    };

    /**
     * Called to insert a given shape
     * @param {IFShape} shape
     * @private
     */
    IFShapeTool.prototype._insertShape = function (shape) {
        // Call editor for new insertion
        this._editor.insertElements([shape]);
    };

    /**
     * @param {IFShape} [shape] the shape to invalidate,
     * if not provided defaults to current shape if any
     * @private
     */
    IFShapeTool.prototype._invalidateShapeArea = function (shape) {
        shape = shape || this._shape;
        if (shape) {
            var geometryBBox = shape.getGeometryBBox();
            if (geometryBBox && (geometryBBox.getWidth() > 0 || geometryBBox.getHeight() > 0)) {
                this.invalidateArea(geometryBBox.expanded(1, 1, 1, 1));
            }
        }
    };

    /**
     * Called to create a shape manually as it has not yet been created via drag
     * @param {IFPoint} position the position to create the shape at in scene coordinates
     * @private
     */
    IFShapeTool.prototype._createShapeManually = function (position) {
        // NO-OP
    };

    /**
     * Called to create an instance of the shape for this tool
     * @return {IFShape}
     * @private
     */
    IFShapeTool.prototype._createShape = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Called to update the shape of this tool
     * @param {IFShape} shape the shape to update
     * @param {IFRect} area the shape area
     * @param {Array<IFPoint>} line the shape line
     * @param {Boolean} scene true if coordinates are in scene coordinates,
     * this usually is only the case before the shape gets appended, otherwise
     * if false, the coordinates are in view coordinates
     * @private
     */
    IFShapeTool.prototype._updateShape = function (shape, area, line, scene) {
        throw new Error("Not Supported.");
    };

    /**
     * Called to check whether a center cross should be painted or not
     * @return {Boolean} true if a center cross should be painted, false if not (default)
     * @private
     */
    IFShapeTool.prototype._hasCenterCross = function () {
        return false;
    };

    /** override */
    IFShapeTool.prototype.toString = function () {
        return "[Object IFShapeTool]";
    };

    _.IFShapeTool = IFShapeTool;
})(this);