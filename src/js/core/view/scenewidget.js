(function (_) {
    /**
     * GSceneWidget is a widget to paint a scene
     * @param {GScene} [scene] the scene this view is bound too, defaults to null
     * @class GSceneWidget
     * @extends GWidget
     * @constructor
     */
    function GSceneWidget(scene) {
        this._updateViewTransforms(true);
        GWidget.apply(this, arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : null);

        this._scene = scene;

        this._viewOffset = [0, 0, 0, 0];
        this._viewMargin = [0, 0, 0, 0];

        // TODO : Move all transformation / view stuff into viewConfiguration!!
        if (!this._viewConfiguration) {
            this._viewConfiguration = new GScenePaintConfiguration();
        }

        // Initialize our stages
        this._initStages();
    }

    GObject.inherit(GSceneWidget, GWidget);

    /**
     * Global view options
     * @type {Object}
     * @version 1.0
     */
    GSceneWidget.options = {
        /**
         * The smallest zoom factor allowed whereas 0 = 0% and 1.0 = 100%
         * @type {Number}
         * @version 1.0
         */
        minZoomFactor: 0.05,

        /**
         * The largest zoom factor allowed whereas 0 = 0% and 1.0 = 100%
         * @type {Number}
         * @version 1.0
         */
        maxZoomFactor: 512.0,

        /**
         * Either fit's the active page in screen (true)
         * or just centers it at 100% when there's no
         * saved view configuration for the page
         */
        defaultFitActivePage: false
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GSceneWidget.TransformEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An event whenever the view's transformation has changed
     * @class GSceneWidget.TransformEvent
     * @extends GEvent
     * @constructor
     */
    GSceneWidget.TransformEvent = function () {
    };
    GObject.inherit(GSceneWidget.TransformEvent, GEvent);

    /** @override */
    GSceneWidget.TransformEvent.prototype.toString = function () {
        return "[Object GSceneWidget.TransformEvent]";
    };

    GSceneWidget.TRANSFORMEVENT = new GSceneWidget.TransformEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GSceneWidget Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {GScene}
     * @private
     */
    GSceneWidget.prototype._scene = null;

    /**
     * An array of stages
     * @type {Array<GStage>}
     * @private
     */
    GSceneWidget.prototype._stages = null;

    /**
     * Left, top, right, bottom offsets
     * @type {Array<Number>}
     * @private
     */
    GSceneWidget.prototype._viewOffset = null;

    /**
     * Left, top, right, bottom margins
     * @type {Array<Number>}
     * @private
     */
    GSceneWidget.prototype._viewMargin = null;

    /**
     * The current horizontal scroll of this view
     * @type Number
     * @private
     */
    GSceneWidget.prototype._scrollX = 0;

    /**
     * The current vertical scroll of this view
     * @type Number
     * @private
     */
    GSceneWidget.prototype._scrollY = 0;

    /**
     * The current zoom of this view
     * @type Number
     * @private
     */
    GSceneWidget.prototype._zoom = 1.0;

    /**
     * World to view transformation
     * @type {GTransform}
     * @private
     */
    GSceneWidget.prototype._worldToViewTransform = null;

    /**
     * View to world transform
     * @type {GTransform}
     * @private
     */
    GSceneWidget.prototype._viewToWorldTransform = null;

    /**
     * @type {GScenePaintConfiguration}
     * @private
     */
    GSceneWidget.prototype._viewConfiguration = null;

    /** @override */
    GSceneWidget.prototype.resize = function (width, height) {
        GWidget.prototype.resize.call(this, width, height);

        // Resize stages if any
        if (this._stages) {
            for (var i = 0; i < this._stages.length; ++i) {
                this._stages[i].resize(this.getWidth(), this.getHeight());
            }
        }
    };

    /**
     * Return the scene this view is painting
     * @returns {GScene}
     */
    GSceneWidget.prototype.getScene = function () {
        return this._scene;
    };

    /**
     * @return {GScenePaintConfiguration}
     */
    GSceneWidget.prototype.getViewConfiguration = function () {
        return this._viewConfiguration;
    };

    /**
     * Get the current view offset
     * @return {Array<Number>} Left, top, right, bottom
     */
    GSceneWidget.prototype.getViewOffset = function () {
        return this._viewOffset;
    };

    /**
     * Set the current view offset
     * @param {Array<Number>} Offset Left, top, right, bottom
     */
    GSceneWidget.prototype.setViewOffset = function (offset) {
        this._viewOffset = [0, 0, 0, 0];
        if (offset && offset.length > 0) {
            for (var i = 0; i < Math.min(4, offset.length); ++i) {
                this._viewOffset[i] = offset[i];
            }

            // Let each stage update it's view area
            if (this._stages) {
                for (var i = 0; i < this._stages.length; ++i) {
                    this._stages[i].updateViewArea();
                }
            }
        }
    };

    /**
     * Get the current view margins
     * @return {Array<Number>} Left, top, right, bottom
     * @version 1.0
     */
    GSceneWidget.prototype.getViewMargin = function () {
        return this._viewMargin;
    };

    /**
     * Set the current view margins
     * @param {Array<Number>} margin Left, top, right, bottom
     * @version 1.0
     */
    GSceneWidget.prototype.setViewMargin = function (margin) {
        this._viewMargin = [0, 0, 0, 0];
        if (margin && margin.length > 0) {
            for (var i = 0; i < Math.min(4, margin.length); ++i) {
                this._viewMargin[i] = margin[i];
                this.invalidate();
            }
        }
    };

    /**
     * @return {Number} The current horizontal scroll position of this view
     * @version 1.0
     */
    GSceneWidget.prototype.getScrollX = function () {
        return this._scrollX;
    };

    /**
     * @return {Number} The current vertical scroll position of this view
     * @version 1.0
     */
    GSceneWidget.prototype.getScrollY = function () {
        return this._scrollY;
    };

    /**
     * @return {Number} The current zoom of this view
     * @version 1.0
     */
    GSceneWidget.prototype.getZoom = function () {
        return this._zoom;
    };

    /**
     * Returns the current transformation used for transforming
     * world coordinates into view coordinates
     * @returns {GTransform}
     */
    GSceneWidget.prototype.getWorldTransform = function () {
        return this._worldToViewTransform;
    };

    /**
     * Returns the current transformation used for transforming
     * view coordinates into world coordinates
     * @returns {GTransform}
     */
    GSceneWidget.prototype.getViewTransform = function () {
        return this._viewToWorldTransform;
    };

    /**
     * Returns the actual viewBox honoring offset and optional margin
     * @param {Boolean} [noMargin] whether to ignore margin or not,
     * defaults to false (= include margin)
     * @returns {GRect}
     */
    GSceneWidget.prototype.getViewBox = function (noMargin) {
        var xOffset = this._viewOffset[0] + (!noMargin ? this._viewMargin[0] : 0);
        var yOffset = this._viewOffset[1] + (!noMargin ? this._viewMargin[1] : 0);
        return new GRect(
            xOffset,
            yOffset,
            this.getWidth() - (this._viewOffset[2] + (!noMargin ? this._viewMargin[2] : 0) + xOffset),
            this.getHeight() - (this._viewOffset[3] + (!noMargin ? this._viewMargin[3] : 0) + yOffset)
        );
    };

    /**
     * Transform the current view
     * @param {Number} scrollX the horizontal scrolling
     * @param {Number} scrollY the vertical scrolling
     * @param {Number} zoom the zoom
     */
    GSceneWidget.prototype.transform = function (scrollX, scrollY, zoom) {
        this._scrollX = scrollX;
        this._scrollY = scrollY;
        this._zoom = zoom;
        this._updateViewTransforms();
    };

    /**
     * Zoom and center to a given point
     * @param {GPoint} center the center point for the view in world coordinates
     * which will become the new center point
     * @param {Number} [zoom] the new zoom, defaults to current zoom
     * @version 1.0
     */
    GSceneWidget.prototype.zoomAtCenter = function (center, zoom) {
        zoom = zoom || this._zoom;
        var viewCenter = this.getViewBox().getSide(GRect.Side.CENTER);
        var viewWorldCenter = this._worldToViewTransform.mapPoint(center);
        var normalizedZoom = Math.min(GSceneWidget.options.maxZoomFactor, Math.max(zoom, GSceneWidget.options.minZoomFactor));
        if (normalizedZoom == this._zoom && GPoint.equals(viewWorldCenter, viewCenter)) {
            return;
        }

        // Calculate new scroll position & zoom
        var tmpTransform = new GTransform()
            .translated(-center.getX(), -center.getY())
            .scaled(normalizedZoom, normalizedZoom)
            .translated(viewCenter.getX(), viewCenter.getY());

        var matrix = tmpTransform.getMatrix();
        this._scrollX = -matrix[4];
        this._scrollY = -matrix[5];
        this._zoom = normalizedZoom;

        this._updateViewTransforms();
    };

    /**
     * Zoom at a specific point
     * @param {GPoint} pos the point to zoom at in world coordinates
     * @param {Number} zoom the new zoom value
     */
    GSceneWidget.prototype.zoomAt = function (pos, zoom) {
        var viewCenter = this.getViewBox().getSide(GRect.Side.CENTER);
        var viewWorldCenter = this._viewToWorldTransform.mapPoint(viewCenter);
        var deltaPos = viewWorldCenter.subtract(pos);
        var zoomDelta = zoom / this._zoom;
        this.zoomAtCenter(new GPoint(pos.getX() + (deltaPos.getX() / zoomDelta), pos.getY() + (deltaPos.getY() / zoomDelta)), zoom);
    };

    /**
     * Zoom to fit all in a given rect whereas the center of the rect
     * becomes the new center of the view
     * @param {GRect} rect
     * @param {Boolean} [reverse] if set, the reverse action will be taken so
     * that the view is zoomed out onto the given rect. Defaults to false
     */
    GSceneWidget.prototype.zoomAll = function (rect, reverse) {
        var center = rect.getSide(GRect.Side.CENTER);
        var width = rect.getWidth();
        var height = rect.getHeight();
        var vbox = this.getViewBox();

        if (reverse) {
            var viewRect = this._worldToViewTransform.mapRect(new GRect(center.getX() - width / 2, center.getY() - height / 2, width, height));
            var invZoom = this._zoom * Math.min(1.0, Math.max(viewRect.getWidth() / vbox.getWidth(), viewRect.getHeight() / vbox.getHeight()));
            this.zoomAtCenter(center, invZoom);
        } else {
            this.zoomAtCenter(center, 1.0 / Math.max(width / vbox.getWidth(), height / vbox.getHeight()));
        }
    };

    /**
     * Scroll the view by a given subtract value
     * @param {Number} dx horizontal subtract
     * @param {Number} dy vertical subtract
     * @version 1.0
     */
    GSceneWidget.prototype.scrollBy = function (dx, dy) {
        if (dx != 0 || dy != 0) {
            this._scrollX = this._scrollX + dx;
            this._scrollY = this._scrollY + dy;
            this._updateViewTransforms();
        }
    };

    /**
     * Called to invalidate all stages
     * @param {GRect} [area] the area to invalidate in view-
     * coordinates. If null then this clears the whole dirty areas
     * and requests a full repaint. Defaults to null.
     * @return {Boolean} true if any invalidation ocurred, false if not
     * @version 1.0
     */
    GSceneWidget.prototype.invalidate = function (area) {
        var result = false;
        if (this._stages) {
            for (var i = 0; i < this._stages.length; ++i) {
                result = this._stages[i].invalidate(area) || result;
            }
        }
        return result;
    };

    /**
     * Add a stage
     * @param {GStage} stage
     * @returns {GStage} the provided stage
     * @private
     */
    GSceneWidget.prototype.addStage = function (stage) {
        if (this._stages == null) {
            this._stages = [];
        }

        this._stages.push(stage);

        var stageElement = stage._canvas._canvasContext.canvas;
        stageElement.style.position = 'absolute';
        stageElement.style.cursor = 'inherit';
        stage.resize(this.getWidth(), this.getHeight());
        this._htmlElement.appendChild(stageElement);

        return stage;
    };

    /**
     * Retrieve a stage
     * @param {GStage} stageClass
     * @returns {GStage}
     */
    GSceneWidget.prototype.getStage = function (stageClass) {
        if (this._stages) {
            for (var i = 0; i < this._stages.length; ++i) {
                if (stageClass.prototype.isPrototypeOf(this._stages[i])) {
                    return this._stages[i];
                }
            }
        }
        return null;
    };

    /**
     * Called to release this view
     */
    GSceneWidget.prototype.release = function () {
        if (this._stages) {
            for (var i = 0; i < this._stages.length; ++i) {
                this._stages[i].release();
            }
        }
    };

    /**
     * Update view transforms and update all other necessary things like
     * scrollbars and virtual space as well as do a repaint if anything has changed
     * @param {Boolean} [noEvent] optional, specifies whether to send an event or not
     * @private
     */
    GSceneWidget.prototype._updateViewTransforms = function (noEvent) {
        // Calculate new view/scene mapping transformations. Make sure to round scrolling values to avoid floating point issues
        // TODO : Correct the zoom values to fixed values to avoid floating point errors during rendering!?
        this._scrollX = Math.round(this._scrollX);
        this._scrollY = Math.round(this._scrollY);

        var worldToViewTransform = new GTransform().scaled(this._zoom, this._zoom).translated(-this._scrollX, -this._scrollY);
        if (!GTransform.equals(worldToViewTransform, this._worldToViewTransform)) {
            this._worldToViewTransform = worldToViewTransform;
            this._viewToWorldTransform = worldToViewTransform.inverted();
            // Invalidate everything
            this.invalidate();

            if (!noEvent && this.hasEventListeners(GSceneWidget.TransformEvent)) {
                this.trigger(GSceneWidget.TRANSFORMEVENT);
            }
        }
    };

    /**
     * Called to init/add all stages
     * @private
     */
    GSceneWidget.prototype._initStages = function () {
        this.addStage(new GSceneStage(this));
    };

    /** @override */
    GSceneWidget.prototype.toString = function () {
        return "[Object GSceneWidget]";
    };

    _.GSceneWidget = GSceneWidget;

})(this);