(function (_) {
    /**
     * The base marquee select tool
     * @param {GMarqueeTool._AreaSelector} areaSelector
     * @class GMarqueeTool
     * @extends GTool
     * @constructor
     */
    function GMarqueeTool(areaSelector) {
        GTool.call(this);
        this._areaSelector = areaSelector;
    };

    GObject.inherit(GMarqueeTool, GTool);

    // -----------------------------------------------------------------------------------------------------------------
    // GMarqueeTool._AreaSelector Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GMarqueeTool._AreaSelector
     * @private
     */
    GMarqueeTool._AreaSelector = function () {
        this._vertexContainer = new GVertexContainer();
        this._pixelTransformer = new GVertexPixelAligner(this._vertexContainer);
    };

    /**
     * @type {GVertexContainer}
     * @private
     */
    GMarqueeTool._AreaSelector.prototype._vertexContainer = null;

    /**
     * @type {GVertexPixelAligner}
     * @private
     */
    GMarqueeTool._AreaSelector.prototype._pixelTransformer = null;

    /**
     * Called when this selector should return it's selection area bounds
     * @return {GRect} the area bounds
     */
    GMarqueeTool._AreaSelector.prototype.getAreaBounds = function () {
        return ifVertexInfo.calculateBounds(this._pixelTransformer, false);
    };

    /**
     * Called when this selector should begin selecting
     */
    GMarqueeTool._AreaSelector.prototype.begin = function () {
        this._vertexContainer.clearVertices();
    };

    /**
     * Called when this selector should finish selecting
     */
    GMarqueeTool._AreaSelector.prototype.finish = function () {
        // NO-OP
    };

    /**
     * Called when this selector should start on a given position
     * @param {GPoint} pos the current position
     */
    GMarqueeTool._AreaSelector.prototype.start = function (pos) {
        // NO-OP
    };

    /**
     * Called when this selector should move on a given position
     * @param {GPoint} pos the current position
     */
    GMarqueeTool._AreaSelector.prototype.move = function (pos) {
        // NO-OP
    };

    /**
     * Called when this selector should paint itself
     * @param {GPaintContext} context
     */
    GMarqueeTool._AreaSelector.prototype.paint = function (context) {
        context.canvas.putVertices(this._pixelTransformer);
        context.canvas.strokeVertices(GRGBColor.BLACK);
    };


    // -----------------------------------------------------------------------------------------------------------------
    // GMarqueeTool Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * The current Area-Selector
     * @type {GMarqueeTool._AreaSelector}
     * @private
     */
    GMarqueeTool.prototype._areaSelector = null;

    /**
     * The current area selector bounds
     * @type {GRect}
     * @private
     */
    GMarqueeTool.prototype._areaBounds = null;

    /** @override */
    GMarqueeTool.prototype.activate = function (view) {
        GTool.prototype.activate.call(this, view);

        view.addEventListener(GMouseEvent.DragStart, this._mouseDragStart, this);
        view.addEventListener(GMouseEvent.Drag, this._mouseDrag, this);
        view.addEventListener(GMouseEvent.DragEnd, this._mouseDragEnd, this);
        view.addEventListener(GMouseEvent.Down, this._mouseDown, this);
        view.addEventListener(GMouseEvent.Release, this._mouseRelease, this);

        ifPlatform.addEventListener(GPlatform.ModifiersChangedEvent, this._modifiersChanged, this);
    };

    /** @override */
    GMarqueeTool.prototype.deactivate = function (view) {
        GTool.prototype.deactivate.call(this, view);

        view.removeEventListener(GMouseEvent.DragStart, this._mouseDragStart);
        view.removeEventListener(GMouseEvent.Drag, this._mouseDrag);
        view.removeEventListener(GMouseEvent.DragEnd, this._mouseDragEnd);
        view.removeEventListener(GMouseEvent.Down, this._mouseDown);
        view.removeEventListener(GMouseEvent.Release, this._mouseRelease);

        ifPlatform.removeEventListener(GPlatform.ModifiersChangedEvent, this._modifiersChanged);
    };

    /** @override */
    GMarqueeTool.prototype.isDeactivatable = function () {
        // cannot deactivate while dragging
        return !this._areaBounds;
    };

    /** @override */
    GMarqueeTool.prototype.paint = function (context) {
        if (this._areaBounds) {
            this._areaSelector.paint(context);
        }
    };

    /**
     * @param {GMouseEvent.Down} event
     * @private
     */
    GMarqueeTool.prototype._mouseDown = function (event) {
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
    GMarqueeTool.prototype._mouseRelease = function (event) {
        if (!this._areaBounds || this._areaBounds.isEmpty()) {
            this._editor.clearSelection();
        } else if (this._areaBounds && !this._areaBounds.isEmpty()) {
            // Invalidate to remove area selector's paint region
            var bounds = this._areaBounds;
            this._areaBounds = null; // reset to prevent repainting
            this.invalidateArea(bounds);
        } else {
            this._areaBounds = null;
        }
    };

    /**
     * @param {GMouseEvent.DragStart} event
     * @private
     */
    GMarqueeTool.prototype._mouseDragStart = function (event) {
        this._areaSelector.begin();
        this._areaSelector.start(event.client);
    };

    /**
     * @param {GMouseEvent.Drag} event
     * @private
     */
    GMarqueeTool.prototype._mouseDrag = function (event) {
        if (this._areaBounds) {
            this.invalidateArea(this._areaBounds);
        }

        this._areaSelector.move(event.client);
        this._updateAreaBoundsAndInvalidate();
    };

    /**
     * @param {GMouseEvent.DragEnd} event
     * @private
     */
    GMarqueeTool.prototype._mouseDragEnd = function (event) {
        if (this._areaBounds) {
            // our area selector selected something
            var collisionArea = new GVertexTransformer(this._areaSelector._pixelTransformer, this._view.getViewTransform());
            var collisionsAcceptor = function (element) {
                // By default, we allow only items to be selected.
                return (element instanceof GItem);
            };
            var collisions = this._scene.getCollisions(collisionArea,
                GElement.CollisionFlag.GeometryBBox | GElement.CollisionFlag.Partial, collisionsAcceptor);

            this._editor.updateSelectionUnderCollision(ifPlatform.modifiers.shiftKey, collisions, collisionArea);
        }
        this._areaSelector.finish();
    };

    /**
     * @param {GPlatform.ModifiersChangedEvent} event
     * @private
     */
    GMarqueeTool.prototype._modifiersChanged = function (event) {
        // TODO
    };

    /**
     * @private
     */
    GMarqueeTool.prototype._updateAreaBoundsAndInvalidate = function () {
        this._areaBounds = this._areaSelector.getAreaBounds();
        if (this._areaBounds && this._areaBounds.isEmpty()) {
            this._areaBounds = null;
        }

        if (this._areaBounds) {
            // Accreditate for 1px tolerance (AA)
            this._areaBounds = this._areaBounds.expanded(1, 1, 1, 1);

            this.invalidateArea(this._areaBounds);
        }
    };

    /** override */
    GMarqueeTool.prototype.toString = function () {
        return "[Object GMarqueeTool]";
    };

    _.GMarqueeTool = GMarqueeTool;
})(this);