(function (_) {
    /**
     * The base tool for simple shapes based on GShape
     * @param {Boolean} keepRatio if true, the ratio
     * on width/height will be kept if user holds shift-modifier key
     * @param {Boolean} allowFromCenter if true, the drag
     * area will be calculated from center and goes into each
     * direction if user holds option-modifier key
     * @class GShapeTool
     * @extends GTool
     * @constructor
     */
    function GShapeTool(keepRatio, fromCenter) {
        GTool.call(this);
        this._keepRatio = keepRatio;
        this._fromCenter = fromCenter;
    }

    GObject.inherit(GShapeTool, GTool);

    /**
     * Options for shape tools
     * @version 1.0
     */
    GShapeTool.options = {
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
     * @type {GPoint}
     * @private
     */
    GShapeTool.prototype._dragStart = null;

    /**
     * Dragging current position in scene coordinates
     * @type {GPoint}
     * @private
     */
    GShapeTool.prototype._dragCurrent = null;

    /**
     * Whether to keep ratio or not
     * @type {Boolean}
     * @private
     */
    GShapeTool.prototype._keepRatio = false;

    /**
     * Whether to calculate from center or not
     * @type {Boolean}
     * @private
     */
    GShapeTool.prototype._fromCenter = false;

    /**
     * @type {GShape}
     * @private
     */
    GShapeTool.prototype._shape = null;

    /**
     * Current drag area in scene coordinates
     * @type {GRect}
     * @private
     */
    GShapeTool.prototype._dragArea = null;

    /**
     * Current drag line in scene coordinates
     * @type {Array<GPoint>}
     * @private
     */
    GShapeTool.prototype._dragLine = null;

    /**
     * @type {boolean}
     * @private
     */
    GShapeTool.prototype._hasCreatedShape = false;

    /** @override */
    GShapeTool.prototype.getCursor = function () {
        return GCursor.Cross;
    };

    /** @override */
    GShapeTool.prototype.activate = function (view) {
        GTool.prototype.activate.call(this, view);

        view.addEventListener(GMouseEvent.Move, this._mouseMove, this);
        view.addEventListener(GMouseEvent.DragStart, this._mouseDragStart, this);
        view.addEventListener(GMouseEvent.Drag, this._mouseDrag, this);
        view.addEventListener(GMouseEvent.DragEnd, this._mouseDragEnd, this);
        view.addEventListener(GMouseEvent.Down, this._mouseDown, this);
        view.addEventListener(GMouseEvent.Release, this._mouseRelease, this);

        ifPlatform.addEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged, this);
    };

    /** @override */
    GShapeTool.prototype.deactivate = function (view) {
        GTool.prototype.deactivate.call(this, view);

        view.removeEventListener(GMouseEvent.Move, this._mouseMove, this);
        view.removeEventListener(GMouseEvent.DragStart, this._mouseDragStart);
        view.removeEventListener(GMouseEvent.Drag, this._mouseDrag);
        view.removeEventListener(GMouseEvent.DragEnd, this._mouseDragEnd);
        view.removeEventListener(GMouseEvent.Down, this._mouseDown);
        view.removeEventListener(GMouseEvent.Release, this._mouseRelease);

        ifPlatform.removeEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged);
    };

    /** @override */
    GShapeTool.prototype.isDeactivatable = function () {
        // cannot deactivate while dragging
        return this._dragStart ? false : true;
    };

    /** @override */
    GShapeTool.prototype.paint = function (context) {
        if (this._shape) {
            // Alignment here affects ellipses and handles of curves contained in ellipses,
            // but this is not noticeable, as it is a shape creation and line is just 1 pt width at any zoom
            this._paintOutline(context);

            // Paint center cross if desired
            if (this._hasCenterCross()) {
                var geometryBBox = this._shape.getGeometryBBox();
                var crossSizeMax = GShapeTool.options.centerCrossSize * 4;

                if (geometryBBox && !geometryBBox.isEmpty() &&
                    geometryBBox.getWidth() > crossSizeMax && geometryBBox.getHeight() > crossSizeMax) {
                    var cs = GShapeTool.options.centerCrossSize / 2 + 0.5;
                    var cp = geometryBBox.getSide(GRect.Side.CENTER);
                    var cx = Math.floor(cp.getX()) + 0.5;
                    var cy = Math.floor(cp.getY()) + 0.5;

                    context.canvas.strokeLine(cx - cs, cy - cs, cx + cs, cy + cs, 1, context.selectionOutlineColor);
                    context.canvas.strokeLine(cx + cs, cy - cs, cx - cs, cy + cs, 1, context.selectionOutlineColor);
                }
            }
        }
    };

    /** @private */
    GShapeTool.prototype._paintOutline = function (context) {
        context.canvas.putVertices(new GVertexPixelAligner(this._shape));
        context.canvas.strokeVertices(context.selectionOutlineColor);
    };

    /**
     * @param {GMouseEvent.Down} event
     * @private
     */
    GShapeTool.prototype._mouseDown = function (event) {
        // Quit if not hitting the left-mouse-button
        if (event.button !== GMouseEvent.BUTTON_LEFT) {
            return;
        }

        // Let editor do some work for mouse position
        this._editor.updateByMousePosition(event.client, this._view.getWorldTransform());
    };

    /**
     * @param {GMouseEvent.Release} event
     * @private
     */
    GShapeTool.prototype._mouseRelease = function (event) {
        if (!this._hasCreatedShape) {
            var position = this._view.getViewTransform().mapPoint(event.client);
            position = this._editor.getGuides().mapPoint(position);
            this._createShapeManually(position);
        }
        this._hasCreatedShape = false;
    };

    /**
     * @param {GMouseEvent.DragStart} event
     * @private
     */
    GShapeTool.prototype._mouseDragStart = function (event) {
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
     * @param {GMouseEvent.Drag} event
     * @private
     */
    GShapeTool.prototype._mouseDrag = function (event) {
        this._dragCurrent = this._view.getViewTransform().mapPoint(event.client);
        this._invalidateShape();
    };

    /**
     * @param {GMouseEvent.DragEnd} event
     * @private
     */
    GShapeTool.prototype._mouseDragEnd = function (event) {
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
     * @param {GMouseEvent.Move} event
     * @private
     */
    GShapeTool.prototype._mouseMove = function (event) {
        // NO-OP
    };

    /**
     * @param {GUIPlatform.ModifiersChangedEvent} event
     * @private
     */
    GShapeTool.prototype._modifiersChanged = function (event) {
        if ((this._keepRatio && event.changed.shiftKey) ||
                (this._fromCenter && event.changed.optionKey) ||
                event.changed.metaKey) {

            this._invalidateShape();
        }
    };

    /**
     * @private
     */
    GShapeTool.prototype._invalidateShape = function () {
        if (this._dragStart && this._dragCurrent) {
            this._editor.getGuides().beginMap();
            var dragCurrent = this._editor.getGuides().mapPoint(this._dragCurrent);
            this._editor.getGuides().finishMap();
            if (GPoint.equals(this._dragStart, dragCurrent)) {
                this._invalidateShapeArea();
            } else {
                var x0 = this._dragStart.getX();
                var y0 = this._dragStart.getY();
                var x1 = dragCurrent.getX();
                var y1 = dragCurrent.getY();
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

                /** @type GRect */
                var dragArea = null;
                /** @type Array<GPoint> */
                var dragLine = null;

                if (this._fromCenter && ifPlatform.modifiers.optionKey) {
                    dragArea = GRect.fromPoints(new GPoint(x0 - (x1 - x0), y0 - (y1 - y0)), new GPoint(x0 + (x1 - x0), y0 + (y1 - y0)));
                    dragLine = [new GPoint(x0 - (x2 - x0), y0 - (y2 - y0)), new GPoint(x0 + (x2 - x0), y0 + (y2 - y0))];
                }
                else {
                    dragArea = GRect.fromPoints(new GPoint(x0, y0), new GPoint(x1, y1));
                    dragLine = [new GPoint(x0, y0), new GPoint(x2, y2)];
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
     * @param {GShape} shape
     * @private
     */
    GShapeTool.prototype._prepareShapeForAppend = function (shape) {
        // Update shape with scene coordinates before appending
        this._updateShape(shape, this._dragArea, this._dragLine, true);
    };

    /**
     * Called to insert a given shape
     * @param {GShape} shape
     * @private
     */
    GShapeTool.prototype._insertShape = function (shape) {
        // Call editor for new insertion
        this._editor.insertElements([shape]);
    };

    /**
     * @param {GShape} [shape] the shape to invalidate,
     * if not provided defaults to current shape if any
     * @private
     */
    GShapeTool.prototype._invalidateShapeArea = function (shape) {
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
     * @param {GPoint} position the position to create the shape at in scene coordinates
     * @private
     */
    GShapeTool.prototype._createShapeManually = function (position) {
        // NO-OP
    };

    /**
     * Called to create an instance of the shape for this tool
     * @return {GShape}
     * @private
     */
    GShapeTool.prototype._createShape = function () {
        throw new Error("Not Supported.");
    };

    /**
     * Called to update the shape of this tool
     * @param {GShape} shape the shape to update
     * @param {GRect} area the shape area
     * @param {Array<GPoint>} line the shape line
     * @param {Boolean} scene true if coordinates are in scene coordinates,
     * this usually is only the case before the shape gets appended, otherwise
     * if false, the coordinates are in view coordinates
     * @private
     */
    GShapeTool.prototype._updateShape = function (shape, area, line, scene) {
        throw new Error("Not Supported.");
    };

    /**
     * Called to check whether a center cross should be painted or not
     * @return {Boolean} true if a center cross should be painted, false if not (default)
     * @private
     */
    GShapeTool.prototype._hasCenterCross = function () {
        return false;
    };

    /** override */
    GShapeTool.prototype.toString = function () {
        return "[Object GShapeTool]";
    };

    _.GShapeTool = GShapeTool;
})(this);