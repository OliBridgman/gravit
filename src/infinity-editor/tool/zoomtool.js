(function (_) {
    /**
     * The zoom tool
     * @class GZoomTool
     * @extends GTool
     * @constructor
     * @version 1.0
     */
    function GZoomTool() {
        GTool.call(this);
    }

    GObject.inherit(GZoomTool, GTool);

    /**
     * Global zoom tool options
     * @type {Object}
     * @version 1.0
     */
    GZoomTool.options = {
        /**
         * The zoom step for zooming in/out. For example,
         * a value of 2.0 doubles the current zoom for each zoom-in
         * and halfs the current zoom for each zoom-out
         * @type {Number}
         * @version 1.0
         */
        zoomStep: 2.0
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GZoomTool
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * -2 = zoom out max, -1 = zoom out, 0 = no zoom, +1 = zoom in, +2 = zoom in max
     * @type {Number}
     * @private
     */
    GZoomTool.prototype._zoomMode = false;

    /**
     * @type {GRect}
     * @private
     */
    GZoomTool.prototype._dragArea = null;

    /** @override */
    GZoomTool.prototype.getCursor = function () {
        switch (this._zoomMode) {
            case -2:
            case -1:
                return GCursor.ZoomMinus;
            case +1:
            case +2:
                return GCursor.ZoomPlus;
            default:
                return GCursor.ZoomNone;
        }
    };

    /** @override */
    GZoomTool.prototype.activate = function (view) {
        GTool.prototype.activate.call(this, view);

        this._updateMode();

        view.addEventListener(GMouseEvent.DragStart, this._mouseDragStart, this);
        view.addEventListener(GMouseEvent.Drag, this._mouseDrag, this);
        view.addEventListener(GMouseEvent.DragEnd, this._mouseDragEnd, this);
        view.addEventListener(GMouseEvent.Release, this._mouseRelease, this);

        ifPlatform.addEventListener(GPlatform.ModifiersChangedEvent, this._modifiersChanged, this);
    };

    /** @override */
    GZoomTool.prototype.deactivate = function (view) {
        GTool.prototype.deactivate.call(this, view);

        view.removeEventListener(GMouseEvent.DragStart, this._mouseDragStart);
        view.removeEventListener(GMouseEvent.Drag, this._mouseDrag);
        view.removeEventListener(GMouseEvent.DragEnd, this._mouseDragEnd);
        view.removeEventListener(GMouseEvent.Release, this._mouseRelease);

        ifPlatform.removeEventListener(GPlatform.ModifiersChangedEvent, this._modifiersChanged);
    };

    /** @override */
    GZoomTool.prototype.isDeactivatable = function () {
        // cannot deactivate while dragging
        return this._dragArea ? false : true;
    };

    /** @override */
    GZoomTool.prototype.paint = function (context) {
        if (this._hasDragArea()) {
            var x = Math.floor(this._dragArea.getX()) + 0.5;
            var y = Math.floor(this._dragArea.getY()) + 0.5;
            var w = Math.ceil(this._dragArea.getWidth()) - 1.0;
            var h = Math.ceil(this._dragArea.getHeight()) - 1.0;
            context.canvas.strokeRect(x, y, w, h);
        }
    };

    /**
     * @param {GMouseEvent.DragStart} event
     * @private
     */
    GZoomTool.prototype._mouseDragStart = function (event) {
        // NO-OP
    };

    /**
     * @param {GMouseEvent.Drag} event
     * @private
     */
    GZoomTool.prototype._mouseDrag = function (event) {
        if (this._zoomMode != 0) {
            if (this._hasDragArea()) {
                this.invalidateArea(this._dragArea);
            }

            this._dragArea = GRect.fromPoints(event.clientStart, event.client);

            if (this._hasDragArea()) {
                this.invalidateArea(this._dragArea);
            }
        }
    };

    /**
     * @param {GMouseEvent.DragEnd} event
     * @private
     */
    GZoomTool.prototype._mouseDragEnd = function (event) {
        if (this._zoomMode != 0) {
            if (this._dragArea && !this._dragArea.isEmpty()) {
                // No need for additional invalidation as we're about to zoom which invalidates everything anyway
                var zoomRect = this._view.getViewTransform().mapRect(this._dragArea);
                this._view.zoomAll(zoomRect, this._zoomMode < 0 /*reverse*/);
                this._updateMode();
            } else if (this._hasDragArea()) {
                this.invalidateArea(this._dragArea);
            }
        }
    };

    /**
     * @param {GMouseEvent.Release} event
     * @private
     */
    GZoomTool.prototype._mouseRelease = function (event) {
        if (!this._dragArea || (this._dragArea && this._dragArea.isEmpty())) {
            var newZoom = null;
            switch (this._zoomMode) {
                case -2:
                    newZoom = GSceneWidget.options.minZoomFactor;
                    break;
                case -1:
                    newZoom = this._view.getZoom() / GZoomTool.options.zoomStep;
                    break;
                case +1:
                    newZoom = this._view.getZoom() * GZoomTool.options.zoomStep;
                    break;
                case +2:
                    newZoom = GSceneWidget.options.maxZoomFactor;
                    break;
                default:
                    break;
            }
            if (newZoom != null) {
                var zoomPoint = this._view.getViewTransform().mapPoint(event.client);
                this._view.zoomAt(zoomPoint, newZoom);
                this._updateMode();
            }
        }
        this._dragArea = null;
    };

    /**
     * @param {GPlatform.ModifiersChangedEvent} event
     * @private
     */
    GZoomTool.prototype._modifiersChanged = function (event) {
        this._updateMode();
    };

    GZoomTool.prototype._updateMode = function () {
        var newMode = 0;
        if (ifPlatform.modifiers.optionKey) {
            newMode = -1;
            if (ifPlatform.modifiers.shiftKey) {
                newMode = -2;
            }
        } else {
            newMode = +1;
            if (ifPlatform.modifiers.shiftKey) {
                newMode = +2;
            }
        }

        // Normalize zoom mode
        if (newMode < 0 && this._view.getZoom() <= GSceneWidget.options.minZoomFactor) {
            newMode = 0;
        } else if (newMode > 0 && this._view.getZoom() >= GSceneWidget.options.maxZoomFactor) {
            newMode = 0;
        }

        if (newMode != this._zoomMode) {
            this._zoomMode = newMode;
            this.updateCursor();
        }
    };

    /**
     * @private
     */
    GZoomTool.prototype._hasDragArea = function () {
        return (this._dragArea && (this._dragArea.getHeight() > 0 || this._dragArea.getWidth() > 0));
    };

    /** override */
    GZoomTool.prototype.toString = function () {
        return "[Object GZoomTool]";
    };

    _.GZoomTool = GZoomTool;
})(this);