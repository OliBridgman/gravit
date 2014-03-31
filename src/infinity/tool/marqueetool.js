(function (_) {
    /**
     * The base marquee select tool
     * @param {GXMarqueeTool._AreaSelector} areaSelector
     * @class GXMarqueeTool
     * @extends GXTool
     * @constructor
     */
    function GXMarqueeTool(areaSelector) {
        GXTool.call(this);
        this._areaSelector = areaSelector;
    };

    GObject.inherit(GXMarqueeTool, GXTool);

    // -----------------------------------------------------------------------------------------------------------------
    // GXMarqueeTool._AreaSelector Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GXMarqueeTool._AreaSelector
     * @private
     */
    GXMarqueeTool._AreaSelector = function () {
        this._vertexContainer = new GXVertexContainer();
        this._pixelTransformer = new GXVertexPixelAligner(this._vertexContainer);
    };

    /**
     * @type {GXVertexContainer}
     * @private
     */
    GXMarqueeTool._AreaSelector.prototype._vertexContainer = null;

    /**
     * @type {GXVertexPixelAligner}
     * @private
     */
    GXMarqueeTool._AreaSelector.prototype._pixelTransformer = null;

    /**
     * Called when this selector should return it's selection area bounds
     * @return {GRect} the area bounds
     */
    GXMarqueeTool._AreaSelector.prototype.getAreaBounds = function () {
        return gVertexInfo.calculateBounds(this._pixelTransformer, false);
    };

    /**
     * Called when this selector should begin selecting
     */
    GXMarqueeTool._AreaSelector.prototype.begin = function () {
        this._vertexContainer.clearVertices();
    };

    /**
     * Called when this selector should finish selecting
     */
    GXMarqueeTool._AreaSelector.prototype.finish = function () {
        // NO-OP
    };

    /**
     * Called when this selector should start on a given position
     * @param {GPoint} pos the current position
     */
    GXMarqueeTool._AreaSelector.prototype.start = function (pos) {
        // NO-OP
    };

    /**
     * Called when this selector should move on a given position
     * @param {GPoint} pos the current position
     */
    GXMarqueeTool._AreaSelector.prototype.move = function (pos) {
        // NO-OP
    };

    /**
     * Called when this selector should paint itself
     * @param {GXPaintContext} context
     */
    GXMarqueeTool._AreaSelector.prototype.paint = function (context) {
        context.canvas.putVertices(this._pixelTransformer);
        context.canvas.strokeVertices(gColor.build(0, 0, 0));
    };


    // -----------------------------------------------------------------------------------------------------------------
    // GXMarqueeTool Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * The current Area-Selector
     * @type {GXMarqueeTool._AreaSelector}
     * @private
     */
    GXMarqueeTool.prototype._areaSelector = null;

    /**
     * The current area selector bounds
     * @type {GRect}
     * @private
     */
    GXMarqueeTool.prototype._areaBounds = null;

    /** @override */
    GXMarqueeTool.prototype.getHint = function () {
        return GXTool.prototype.getHint.call(this)
            .setTitle(new GLocale.Key(GXMarqueeTool, "title"));
    };

    /** @override */
    GXMarqueeTool.prototype.activate = function (view) {
        GXTool.prototype.activate.call(this, view);

        view.addEventListener(GUIMouseEvent.DragStart, this._mouseDragStart, this);
        view.addEventListener(GUIMouseEvent.Drag, this._mouseDrag, this);
        view.addEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd, this);
        view.addEventListener(GUIMouseEvent.Down, this._mouseDown, this);
        view.addEventListener(GUIMouseEvent.Release, this._mouseRelease, this);

        gPlatform.addEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged, this);
    };

    /** @override */
    GXMarqueeTool.prototype.deactivate = function (view) {
        GXTool.prototype.deactivate.call(this, view);

        view.removeEventListener(GUIMouseEvent.DragStart, this._mouseDragStart);
        view.removeEventListener(GUIMouseEvent.Drag, this._mouseDrag);
        view.removeEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd);
        view.removeEventListener(GUIMouseEvent.Down, this._mouseDown);
        view.removeEventListener(GUIMouseEvent.Release, this._mouseRelease);

        gPlatform.removeEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged);
    };

    /** @override */
    GXMarqueeTool.prototype.isDeactivatable = function () {
        // cannot deactivate while dragging
        return !this._areaBounds;
    };

    /** @override */
    GXMarqueeTool.prototype.paint = function (context) {
        if (this._areaBounds) {
            this._areaSelector.paint(context);
        }
    };

    /**
     * @param {GUIMouseEvent.Down} event
     * @private
     */
    GXMarqueeTool.prototype._mouseDown = function (event) {
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
    GXMarqueeTool.prototype._mouseRelease = function (event) {
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
     * @param {GUIMouseEvent.DragStart} event
     * @private
     */
    GXMarqueeTool.prototype._mouseDragStart = function (event) {
        this._areaSelector.begin();
        this._areaSelector.start(event.client);
    };

    /**
     * @param {GUIMouseEvent.Drag} event
     * @private
     */
    GXMarqueeTool.prototype._mouseDrag = function (event) {
        if (this._areaBounds) {
            this.invalidateArea(this._areaBounds);
        }

        this._areaSelector.move(event.client);
        this._updateAreaBoundsAndInvalidate();
    };

    /**
     * @param {GUIMouseEvent.DragEnd} event
     * @private
     */
    GXMarqueeTool.prototype._mouseDragEnd = function (event) {
        if (this._areaBounds) {
            // our area selector selected something
            var collisionArea = new GXVertexTransformer(this._areaSelector._pixelTransformer, this._view.getViewTransform());
            var collisions = this._scene.getCollisions(collisionArea, GXElement.CollisionFlag.GeometryBBox);

            this._editor.updateSelection(gPlatform.modifiers.shiftKey, collisions);
        }
        this._areaSelector.finish();
    };

    /**
     * @param {GUIPlatform.ModifiersChangedEvent} event
     * @private
     */
    GXMarqueeTool.prototype._modifiersChanged = function (event) {
        // TODO
    };

    /**
     * @private
     */
    GXMarqueeTool.prototype._updateAreaBoundsAndInvalidate = function () {
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
    GXMarqueeTool.prototype.toString = function () {
        return "[Object GXMarqueeTool]";
    };

    _.GXMarqueeTool = GXMarqueeTool;
})(this);