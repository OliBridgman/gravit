(function (_) {
    /**
     * The slice tool
     * @class GSliceTool
     * @extends GTool
     * @constructor
     */
    function GSliceTool() {
        GTool.call(this);
    }

    GObject.inherit(GSliceTool, GTool);

    /**
     * Dragging start position in scene coordinates
     * @type {GPoint}
     * @private
     */
    GSliceTool.prototype._dragStart = null;

    /**
     * Dragging current position in scene coordinates
     * @type {GPoint}
     * @private
     */
    GSliceTool.prototype._dragCurrent = null;

    /**
     * @type {GSlice}
     * @private
     */
    GSliceTool.prototype._slice = null;

    /**
     * Current drag area in scene coordinates
     * @type {GRect}
     * @private
     */
    GSliceTool.prototype._dragArea = null;

    /**
     * @type {boolean}
     * @private
     */
    GSliceTool.prototype._hasCreatedSlice = false;

    /** @override */
    GSliceTool.prototype.getCursor = function () {
        return GCursor.Cross;
    };

    /** @override */
    GSliceTool.prototype.activate = function (view) {
        GTool.prototype.activate.call(this, view);

        view.addEventListener(GMouseEvent.DragStart, this._mouseDragStart, this);
        view.addEventListener(GMouseEvent.Drag, this._mouseDrag, this);
        view.addEventListener(GMouseEvent.DragEnd, this._mouseDragEnd, this);
        view.addEventListener(GMouseEvent.Down, this._mouseDown, this);
        view.addEventListener(GMouseEvent.Release, this._mouseRelease, this);

        ifPlatform.addEventListener(GPlatform.ModifiersChangedEvent, this._modifiersChanged, this);
    };

    /** @override */
    GSliceTool.prototype.deactivate = function (view) {
        GTool.prototype.deactivate.call(this, view);

        view.removeEventListener(GMouseEvent.DragStart, this._mouseDragStart);
        view.removeEventListener(GMouseEvent.Drag, this._mouseDrag);
        view.removeEventListener(GMouseEvent.DragEnd, this._mouseDragEnd);
        view.removeEventListener(GMouseEvent.Down, this._mouseDown);
        view.removeEventListener(GMouseEvent.Release, this._mouseRelease);

        ifPlatform.removeEventListener(GPlatform.ModifiersChangedEvent, this._modifiersChanged);
    };

    /** @override */
    GSliceTool.prototype.isDeactivatable = function () {
        // cannot deactivate while dragging
        return this._dragStart ? false : true;
    };

    /** @override */
    GSliceTool.prototype.paint = function (context) {
        if (this._slice) {
            var sliceBBox = this._slice.getGeometryBBox();
            sliceBBox = this._view.getWorldTransform().mapRect(sliceBBox);
            var x = Math.floor(sliceBBox.getX()) + 0.5;
            var y = Math.floor(sliceBBox.getY()) + 0.5;

            context.canvas.strokeRect(x, y, sliceBBox.getWidth(), sliceBBox.getHeight(), 1, context.selectionOutlineColor);
        }
    };

    /**
     * @param {GMouseEvent.Down} event
     * @private
     */
    GSliceTool.prototype._mouseDown = function (event) {
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
    GSliceTool.prototype._mouseRelease = function (event) {
        if (!this._hasCreatedSlice) {
            var position = this._view.getViewTransform().mapPoint(event.client);
            position = this._editor.getGuides().mapPoint(position);
            
            // TODO : Create slice via dialog manually at [position] ?
        }
        this._hasCreatedSlice = false;
    };

    /**
     * @param {GMouseEvent.DragStart} event
     * @private
     */
    GSliceTool.prototype._mouseDragStart = function (event) {
        this._hasCreatedSlice = false;
        this._dragStart = this._view.getViewTransform().mapPoint(event.client);
        this._editor.getGuides().beginMap();
        this._dragStart = this._editor.getGuides().mapPoint(this._dragStart);
        this._editor.getGuides().finishMap();

        // Create our slice when user started dragging
        this._slice = new GSlice();
        this._invalidateSlice();

        this.updateCursor();
    };

    /**
     * @param {GMouseEvent.Drag} event
     * @private
     */
    GSliceTool.prototype._mouseDrag = function (event) {
        this._dragCurrent = this._view.getViewTransform().mapPoint(event.client);
        this._invalidateSlice();
    };

    /**
     * @param {GMouseEvent.DragEnd} event
     * @private
     */
    GSliceTool.prototype._mouseDragEnd = function (event) {
        // Reset slice and repaint
        var slice = this._slice;
        this._slice = null;
        this._invalidateSliceArea(slice);

        // Update slice with scene coordinates before appending
        this._updateSlice(slice, this._dragArea);

        // Clear our stuff
        this._dragStart = null;
        this._dragCurrent = null;
        this._slice = null;
        this._dragArea = null;

        this.updateCursor();

        // Finally insert our slice
        this._editor.insertElements([slice]);
        this._hasCreatedSlice = true;
    };

    /**
     * @param {GPlatform.ModifiersChangedEvent} event
     * @private
     */
    GSliceTool.prototype._modifiersChanged = function (event) {
        if (event.changed.shiftKey || event.changed.optionKey || event.changed.metaKey) {
            this._invalidateSlice();
        }
    };

    /**
     * @private
     */
    GSliceTool.prototype._invalidateSlice = function () {
        if (this._dragStart && this._dragCurrent) {
            this._editor.getGuides().beginMap();
            var dragCurrent = this._editor.getGuides().mapPoint(this._dragCurrent);
            this._editor.getGuides().finishMap();
            if (GPoint.equals(this._dragStart, dragCurrent)) {
                this._invalidateSliceArea();
            } else {
                var x0 = this._dragStart.getX();
                var y0 = this._dragStart.getY();
                var x1 = dragCurrent.getX();
                var y1 = dragCurrent.getY();

                if (ifPlatform.modifiers.shiftKey) {
                    var w = Math.abs(x1 - x0);
                    var h = Math.abs(y1 - y0);
                    var wSign = x1 < x0 ? -1 : 1;
                    var hSign = y1 < y0 ? -1 : 1;

                    if (w >= h) {
                        x1 = x0 + w * wSign;
                        y1 = y0 + w * hSign;
                    } else {
                        x1 = x0 + h * wSign;
                        y1 = y0 + h * hSign;
                    }
                }

                /** @type GRect */
                var dragArea = null;

                if (ifPlatform.modifiers.optionKey) {
                    dragArea = GRect.fromPoints(new GPoint(x0 - (x1 - x0), y0 - (y1 - y0)), new GPoint(x0 + (x1 - x0), y0 + (y1 - y0)));
                } else {
                    dragArea = GRect.fromPoints(new GPoint(x0, y0), new GPoint(x1, y1));
                }

                // Assign area in scene coordinates
                this._dragArea = dragArea;

                this._invalidateSliceArea();
                this._updateSlice(this._slice, dragArea);
                this._invalidateSliceArea();
            }
        }
    };
    
    /**
     * @param {GSlice} [slice] the slice to invalidate,
     * if not provided defaults to current slice if any
     * @private
     */
    GSliceTool.prototype._invalidateSliceArea = function (slice) {
        slice = slice || this._slice;
        if (slice) {
            var geometryBBox = this._view.getWorldTransform().mapRect(slice.getGeometryBBox());
            if (geometryBBox && (geometryBBox.getWidth() > 0 || geometryBBox.getHeight() > 0)) {
                this.invalidateArea(geometryBBox.expanded(1, 1, 1, 1));
            }
        }
    };

    /**
     * Called to update the slice of this tool
     * @param {GSlice} slice the slice to update
     * @param {GRect} area the slice area in scene coordinates
     * @private
     */
    GSliceTool.prototype._updateSlice = function (slice, area) {
        // Original slice is a in coordinates x,y: [-1, 1]. Transform it to fit into the area:
        slice.setProperty('trf',
            new GTransform(area.getWidth() / 2, 0, 0, area.getHeight() / 2,
                area.getX() + area.getWidth() / 2, area.getY() + area.getHeight() / 2));
    };

    /** override */
    GSliceTool.prototype.toString = function () {
        return "[Object GSliceTool]";
    };

    _.GSliceTool = GSliceTool;
})(this);