(function (_) {
    /**
     * The slice tool
     * @class IFSliceTool
     * @extends IFTool
     * @constructor
     */
    function IFSliceTool() {
        IFTool.call(this);
    }

    IFObject.inherit(IFSliceTool, IFTool);

    /**
     * Dragging start position in scene coordinates
     * @type {IFPoint}
     * @private
     */
    IFSliceTool.prototype._dragStart = null;

    /**
     * Dragging current position in scene coordinates
     * @type {IFPoint}
     * @private
     */
    IFSliceTool.prototype._dragCurrent = null;

    /**
     * @type {IFSlice}
     * @private
     */
    IFSliceTool.prototype._slice = null;

    /**
     * Current drag area in scene coordinates
     * @type {IFRect}
     * @private
     */
    IFSliceTool.prototype._dragArea = null;

    /**
     * @type {boolean}
     * @private
     */
    IFSliceTool.prototype._hasCreatedSlice = false;

    /** @override */
    IFSliceTool.prototype.getCursor = function () {
        return IFCursor.Cross;
    };

    /** @override */
    IFSliceTool.prototype.activate = function (view) {
        IFTool.prototype.activate.call(this, view);

        view.addEventListener(GUIMouseEvent.DragStart, this._mouseDragStart, this);
        view.addEventListener(GUIMouseEvent.Drag, this._mouseDrag, this);
        view.addEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd, this);
        view.addEventListener(GUIMouseEvent.Down, this._mouseDown, this);
        view.addEventListener(GUIMouseEvent.Release, this._mouseRelease, this);

        ifPlatform.addEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged, this);
    };

    /** @override */
    IFSliceTool.prototype.deactivate = function (view) {
        IFTool.prototype.deactivate.call(this, view);

        view.removeEventListener(GUIMouseEvent.DragStart, this._mouseDragStart);
        view.removeEventListener(GUIMouseEvent.Drag, this._mouseDrag);
        view.removeEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd);
        view.removeEventListener(GUIMouseEvent.Down, this._mouseDown);
        view.removeEventListener(GUIMouseEvent.Release, this._mouseRelease);

        ifPlatform.removeEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged);
    };

    /** @override */
    IFSliceTool.prototype.isDeactivatable = function () {
        // cannot deactivate while dragging
        return this._dragStart ? false : true;
    };

    /** @override */
    IFSliceTool.prototype.paint = function (context) {
        if (this._slice) {
            var sliceBBox = this._slice.getGeometryBBox();
            var x = Math.floor(sliceBBox.getX()) + 0.5;
            var y = Math.floor(sliceBBox.getY()) + 0.5;

            context.canvas.strokeRect(x, y, sliceBBox.getWidth(), sliceBBox.getHeight(), 1, context.selectionOutlineColor);
        }
    };

    /**
     * @param {GUIMouseEvent.Down} event
     * @private
     */
    IFSliceTool.prototype._mouseDown = function (event) {
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
    IFSliceTool.prototype._mouseRelease = function (event) {
        if (!this._hasCreatedSlice) {
            var position = this._view.getViewTransform().mapPoint(event.client);
            position = this._editor.getGuides().mapPoint(position);
            
            // TODO : Create slice via dialog manually at [position] ?
        }
        this._hasCreatedSlice = false;
    };

    /**
     * @param {GUIMouseEvent.DragStart} event
     * @private
     */
    IFSliceTool.prototype._mouseDragStart = function (event) {
        this._hasCreatedSlice = false;
        this._dragStart = this._view.getViewTransform().mapPoint(event.client);
        this._editor.getGuides().beginMap();
        this._dragStart = this._editor.getGuides().mapPoint(this._dragStart);
        this._editor.getGuides().finishMap();

        // Create our slice when user started dragging
        this._slice = new IFSlice();
        this._invalidateSlice();

        this.updateCursor();
    };

    /**
     * @param {GUIMouseEvent.Drag} event
     * @private
     */
    IFSliceTool.prototype._mouseDrag = function (event) {
        this._dragCurrent = this._view.getViewTransform().mapPoint(event.client);
        this._editor.getGuides().beginMap();
        this._dragCurrent = this._editor.getGuides().mapPoint(this._dragCurrent);
        this._editor.getGuides().finishMap();
        this._invalidateSlice();
    };

    /**
     * @param {GUIMouseEvent.DragEnd} event
     * @private
     */
    IFSliceTool.prototype._mouseDragEnd = function (event) {
        // Reset slice and repaint
        var slice = this._slice;
        this._slice = null;
        this._invalidateSliceArea(slice);

        // Update slice with scene coordinates before appending
        this._updateSlice(slice, this._dragArea, true);

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
     * @param {GUIPlatform.ModifiersChangedEvent} event
     * @private
     */
    IFSliceTool.prototype._modifiersChanged = function (event) {
        if (event.changed.shiftKey || event.changed.optionKey) {
            this._invalidateSlice();
        }
    };

    /**
     * @private
     */
    IFSliceTool.prototype._invalidateSlice = function () {
        if (this._dragStart && this._dragCurrent) {
            if (IFPoint.equals(this._dragStart, this._dragCurrent)) {
                this._invalidateSliceArea();
            } else {
                var x0 = this._dragStart.getX();
                var y0 = this._dragStart.getY();
                var x1 = this._dragCurrent.getX();
                var y1 = this._dragCurrent.getY();

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

                /** @type IFRect */
                var dragArea = null;

                if (ifPlatform.modifiers.optionKey) {
                    dragArea = IFRect.fromPoints(new IFPoint(x0 - (x1 - x0), y0 - (y1 - y0)), new IFPoint(x0 + (x1 - x0), y0 + (y1 - y0)));
                } else {
                    dragArea = IFRect.fromPoints(new IFPoint(x0, y0), new IFPoint(x1, y1));
                }

                // Assign area in scene coordinates
                this._dragArea = dragArea;

                // Convert area into view coordinates before updating the slice
                var worldTransform = this._view.getWorldTransform();
                var dragAreaView = worldTransform.mapRect(dragArea);

                this._invalidateSliceArea();
                this._updateSlice(this._slice, dragAreaView, false);
                this._invalidateSliceArea();
            }
        }
    };
    
    /**
     * @param {IFSlice} [slice] the slice to invalidate,
     * if not provided defaults to current slice if any
     * @private
     */
    IFSliceTool.prototype._invalidateSliceArea = function (slice) {
        slice = slice || this._slice;
        if (slice) {
            var geometryBBox = slice.getGeometryBBox();
            if (geometryBBox && (geometryBBox.getWidth() > 0 || geometryBBox.getHeight() > 0)) {
                this.invalidateArea(geometryBBox.expanded(1, 1, 1, 1));
            }
        }
    };

    /**
     * Called to update the slice of this tool
     * @param {IFSlice} slice the slice to update
     * @param {IFRect} area the slice area
     * @param {Boolean} scene true if coordinates are in scene coordinates,
     * this usually is only the case before the slice gets appended, otherwise
     * if false, the coordinates are in view coordinates
     * @private
     */
    IFSliceTool.prototype._updateSlice = function (slice, area, scene) {
        // Original slice is a in coordinates x,y: [-1, 1]. Transform it to fit into the area:
        slice.setProperty('trf',
            new IFTransform(area.getWidth() / 2, 0, 0, area.getHeight() / 2,
                area.getX() + area.getWidth() / 2, area.getY() + area.getHeight() / 2));
    };

    /** override */
    IFSliceTool.prototype.toString = function () {
        return "[Object IFSliceTool]";
    };

    _.IFSliceTool = IFSliceTool;
})(this);