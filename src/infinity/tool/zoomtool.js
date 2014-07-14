(function (_) {
    /**
     * The zoom tool
     * @class IFZoomTool
     * @extends IFTool
     * @constructor
     * @version 1.0
     */
    function IFZoomTool() {
        IFTool.call(this);
    }

    IFObject.inherit(IFZoomTool, IFTool);

    /**
     * Global zoom tool options
     * @type {Object}
     * @version 1.0
     */
    IFZoomTool.options = {
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
    // IFZoomTool
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * -2 = zoom out max, -1 = zoom out, 0 = no zoom, +1 = zoom in, +2 = zoom in max
     * @type {Number}
     * @private
     */
    IFZoomTool.prototype._zoomMode = false;

    /**
     * @type {GRect}
     * @private
     */
    IFZoomTool.prototype._dragArea = null;

    /** @override */
    IFZoomTool.prototype.getCursor = function () {
        switch (this._zoomMode) {
            case -2:
            case -1:
                return IFCursor.ZoomMinus;
            case +1:
            case +2:
                return IFCursor.ZoomPlus;
            default:
                return IFCursor.ZoomNone;
        }
    };

    /** @override */
    IFZoomTool.prototype.activate = function (view) {
        IFTool.prototype.activate.call(this, view);

        this._updateMode();

        view.addEventListener(GUIMouseEvent.DragStart, this._mouseDragStart, this);
        view.addEventListener(GUIMouseEvent.Drag, this._mouseDrag, this);
        view.addEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd, this);
        view.addEventListener(GUIMouseEvent.Release, this._mouseRelease, this);

        ifPlatform.addEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged, this);
    };

    /** @override */
    IFZoomTool.prototype.deactivate = function (view) {
        IFTool.prototype.deactivate.call(this, view);

        view.removeEventListener(GUIMouseEvent.DragStart, this._mouseDragStart);
        view.removeEventListener(GUIMouseEvent.Drag, this._mouseDrag);
        view.removeEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd);
        view.removeEventListener(GUIMouseEvent.Release, this._mouseRelease);

        ifPlatform.removeEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged);
    };

    /** @override */
    IFZoomTool.prototype.isDeactivatable = function () {
        // cannot deactivate while dragging
        return this._dragArea ? false : true;
    };

    /** @override */
    IFZoomTool.prototype.paint = function (context) {
        if (this._hasDragArea()) {
            var x = Math.floor(this._dragArea.getX()) + 0.5;
            var y = Math.floor(this._dragArea.getY()) + 0.5;
            var w = Math.ceil(this._dragArea.getWidth()) - 1.0;
            var h = Math.ceil(this._dragArea.getHeight()) - 1.0;
            context.canvas.strokeRect(x, y, w, h);
        }
    };

    /**
     * @param {GUIMouseEvent.DragStart} event
     * @private
     */
    IFZoomTool.prototype._mouseDragStart = function (event) {
        // NO-OP
    };

    /**
     * @param {GUIMouseEvent.Drag} event
     * @private
     */
    IFZoomTool.prototype._mouseDrag = function (event) {
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
     * @param {GUIMouseEvent.DragEnd} event
     * @private
     */
    IFZoomTool.prototype._mouseDragEnd = function (event) {
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
     * @param {GUIMouseEvent.Release} event
     * @private
     */
    IFZoomTool.prototype._mouseRelease = function (event) {
        if (!this._dragArea || (this._dragArea && this._dragArea.isEmpty())) {
            var newZoom = null;
            switch (this._zoomMode) {
                case -2:
                    newZoom = IFView.options.minZoomFactor;
                    break;
                case -1:
                    newZoom = this._view.getZoom() / IFZoomTool.options.zoomStep;
                    break;
                case +1:
                    newZoom = this._view.getZoom() * IFZoomTool.options.zoomStep;
                    break;
                case +2:
                    newZoom = IFView.options.maxZoomFactor;
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
     * @param {GUIPlatform.ModifiersChangedEvent} event
     * @private
     */
    IFZoomTool.prototype._modifiersChanged = function (event) {
        this._updateMode();
    };

    IFZoomTool.prototype._updateMode = function () {
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
        if (newMode < 0 && this._view.getZoom() <= IFView.options.minZoomFactor) {
            newMode = 0;
        } else if (newMode > 0 && this._view.getZoom() >= IFView.options.maxZoomFactor) {
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
    IFZoomTool.prototype._hasDragArea = function () {
        return (this._dragArea && (this._dragArea.getHeight() > 0 || this._dragArea.getWidth() > 0));
    };

    /** override */
    IFZoomTool.prototype.toString = function () {
        return "[Object IFZoomTool]";
    };

    _.IFZoomTool = IFZoomTool;
})(this);