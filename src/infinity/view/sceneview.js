(function (_) {
    /**
     * GXSceneView is a widget to render a scene
     * @param {GXScene} [scene] the scene this view is bound too, defaults to null
     * @class GXSceneView
     * @extends GUIPanel
     * @constructor
     * @version 1.0
     */
    function GXSceneView(scene) {
        this._updateViewTransforms();
        this.setViewMargin(null);
        GUIPanel.apply(this, arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : null);

        this._layerMap = {};

        // TODO : Move all transformation / view stuff into viewConfiguration!!
        this._viewConfiguration = new GXScenePaintConfiguration();

        // Add our content layer
        this.addLayer(GXSceneView.Layer.Content, this._viewConfiguration)
            .paint = this._paintContentLayer.bind(this);

        if (scene) {
            this.setScene(scene);
        }
    }

    GObject.inherit(GXSceneView, GUIPanel);

    /**
     * Global view options
     * @type {Object}
     * @version 1.0
     */
    GXSceneView.options = {
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
        maxZoomFactor: 512.0
    };

    /**
     * Enumeration of known layers within a a view.
     * @enum
     */
    GXSceneView.Layer = {
        /**
         * The content layer
         * @type {Number}
         * @version 1.0
         */
        Content: 0
    };

    /**
     * @type {GXScene}
     * @private
     */
    GXSceneView.prototype._scene = null;

    /**
     * @type {{}}
     * @private
     */
    GXSceneView.prototype._layerMap = null;

    /**
     * @type {GXSceneViewCanvas}
     * @private
     */
    GXSceneView.prototype._pixelContentCanvas = null;

    /**
     * An array of layers
     * @type {Array<GXSceneViewLayer>}
     * @private
     */
    GXSceneView.prototype._layers = null;

    /**
     * Left, top, right, bottom margins
     * @type {Array<Number>}
     * @private
     */
    GXSceneView.prototype._viewMargin = null;

    /**
     * The current horizontal scroll of this view
     * @type Number
     * @private
     */
    GXSceneView.prototype._scrollX = 0.0;

    /**
     * The current vertical scroll of this view
     * @type Number
     * @private
     */
    GXSceneView.prototype._scrollY = 0.0;

    /**
     * The current zoom of this view
     * @type Number
     * @private
     */
    GXSceneView.prototype._zoom = 1.0;

    /**
     * World to view transformation
     * @type {GTransform}
     * @private
     */
    GXSceneView.prototype._worldToViewTransform = null;

    /**
     * View to world transform
     * @type {GTransform}
     * @private
     */
    GXSceneView.prototype._viewToWorldTransform = null;

    /**
     * @type {GXScenePaintConfiguration}
     * @private
     */
    GXSceneView.prototype._viewConfiguration = null;

    /** @override */
    GXSceneView.prototype.resize = function (width, height) {
        GUIPanel.prototype.resize.call(this, width, height);
        if (this._pixelContentCanvas) {
            this._pixelContentCanvas.resize(width, height);
        }
    };

    /**
     * Return the scene this view is rendering
     * @returns {GXScene}
     */
    GXSceneView.prototype.getScene = function () {
        return this._scene;
    };

    /**
     * Assign the scene this view is rendering
     * @param {GXScene} scene
     */
    GXSceneView.prototype.setScene = function (scene) {
        if (scene != this._scene) {
            if (this._scene) {
                this._scene.removeEventListener(GXScene.InvalidationRequestEvent, this._sceneInvalidationRequest);
            }

            this._scene = scene;

            if (this._scene) {
                this._scene.addEventListener(GXScene.InvalidationRequestEvent, this._sceneInvalidationRequest, this);

                // We'll be doing a reasonable default view setup depending on the scene's settings
                if (scene.getProperty('screen')) {
                    // screen mode
                    this._viewConfiguration.singlePageMode = true;
                    this._viewConfiguration.pixelMode = true;
                } else {
                    // print mode
                    this._viewConfiguration.singlePageMode = false;
                    this._viewConfiguration.pixelMode = false;
                }
            }

            if (!this._updateViewTransforms()) {
                this.invalidate();
            }
        }
    };

    /**
     * @return {GXScenePaintConfiguration}
     */
    GXSceneView.prototype.getViewConfiguration = function () {
        return this._viewConfiguration;
    };

    /**
     * Get the current view margins
     * @return {Array<Number>} Left, top, right, bottom
     * @version 1.0
     */
    GXSceneView.prototype.getViewMargin = function () {
        return this._viewMargin;
    };

    /**
     * Set the current view margins
     * @param {Array<Number>} margin Left, top, right, bottom
     * @version 1.0
     */
    GXSceneView.prototype.setViewMargin = function (margin) {
        this._viewMargin = [0, 0, 0, 0];
        if (margin && margin.length > 0) {
            for (var i = 0; i < Math.min(4, margin.length); ++i) {
                this._viewMargin[i] = margin[i];
            }
        }
    };

    /**
     * @return {Number} The current horizontal scroll position of this view
     * @version 1.0
     */
    GXSceneView.prototype.getScrollX = function () {
        return this._scrollX;
    };

    /**
     * @return {Number} The current vertical scroll position of this view
     * @version 1.0
     */
    GXSceneView.prototype.getScrollY = function () {
        return this._scrollY;
    };

    /**
     * @return {Number} The current zoom of this view
     * @version 1.0
     */
    GXSceneView.prototype.getZoom = function () {
        return this._zoom;
    };

    /**
     * Returns the current transformation used for transforming
     * world coordinates into view coordinates
     * @returns {GTransform}
     */
    GXSceneView.prototype.getWorldTransform = function () {
        return this._worldToViewTransform;
    };

    /**
     * Returns the current transformation used for transforming
     * view coordinates into world coordinates
     * @returns {GTransform}
     */
    GXSceneView.prototype.getViewTransform = function () {
        return this._viewToWorldTransform;
    };

    /**
     * Returns the view's center point taking the margin into account
     * @return {GPoint}
     */
    GXSceneView.prototype.getViewCenter = function () {
        var cx = this.getWidth() + this._viewMargin[0] - this._viewMargin[2];
        var cy = this.getHeight() + this._viewMargin[1] - this._viewMargin[3];
        return new GPoint(cx / 2.0, cy / 2.0);
    };

    /**
     * Returns the view's height taking the margin into account
     * @return {Number}
     */
    GXSceneView.prototype.getViewHeight = function () {
        return this.getHeight() - this._viewMargin[1] - this._viewMargin[3];
    };

    /**
     * Returns the view's width taking the margin into account
     * @return {Number}
     */
    GXSceneView.prototype.getViewWidth = function () {
        return this.getWidth() - this._viewMargin[0] - this._viewMargin[2];
    };

    /**
     * Transform the current view
     * @param {Number} scrollX the horizontal scrolling
     * @param {Number} scrollY the vertical scrolling
     * @param {Number} zoom the zoom
     */
    GXSceneView.prototype.transform = function (scrollX, scrollY, zoom) {
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
    GXSceneView.prototype.zoomAtCenter = function (center, zoom) {
        var viewCenter = this.getViewCenter();
        var viewWorldCenter = this._worldToViewTransform.mapPoint(center);
        var normalizedZoom = Math.min(GXSceneView.options.maxZoomFactor, Math.max(zoom, GXSceneView.options.minZoomFactor));
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
     * @version 1.0
     */
    GXSceneView.prototype.zoomAt = function (pos, zoom) {
        var viewCenter = this.getViewCenter();
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
    GXSceneView.prototype.zoomAll = function (rect, reverse) {
        var center = rect.getSide(GRect.Side.CENTER);
        var width = rect.getWidth();
        var height = rect.getHeight();

        var sx = width / this.getViewWidth();
        var sy = height / this.getViewHeight();

        if (reverse) {
            var viewRect = this._worldToViewTransform.mapRect(new GRect(center.getX() - width / 2, center.getY() - height / 2, width, height));
            var invZoom = this._zoom * Math.min(1.0, Math.max(viewRect.getWidth() / this.getViewWidth(), viewRect.getHeight() / this.getViewHeight()));
            this.zoomAtCenter(center, invZoom);
        } else {
            this.zoomAtCenter(center, 1.0 / Math.max(sx, sy));
        }
    };

    /**
     * Scroll the view by a given subtract value
     * @param {Number} dx horizontal subtract
     * @param {Number} dy vertical subtract
     * @version 1.0
     */
    GXSceneView.prototype.scrollBy = function (dx, dy) {
        if (dx != 0 || dy != 0) {
            this._scrollX = this._scrollX + dx;
            this._scrollY = this._scrollY + dy;
            this._updateViewTransforms();
        }
    };

    /**
     * Called to invalidate all layers
     * @param {GRect} [area] the area to invalidate in view-
     * coordinates. If null then this clears the whole dirty areas
     * and requests a full repaint. Defaults to null.
     * @return {Boolean} true if any invalidation ocurred, false if not
     * @version 1.0
     */
    GXSceneView.prototype.invalidate = function (area) {
        var result = false;
        if (this._layers) {
            for (var i = 0; i < this._layers.length; ++i) {
                result = this._layers[i].invalidate(area) || result;
            }
        }
        return result;
    };

    /**
     * Update view transforms and update all other necessary things like
     * scrollbars and virtual space as well as do a repaint if anything has changed
     * @private
     */
    GXSceneView.prototype._updateViewTransforms = function () {
        // Calculate new view/scene mapping transformations
        var worldToViewTransform = new GTransform().scaled(this._zoom, this._zoom).translated(-this._scrollX, -this._scrollY);
        if (!GTransform.equals(worldToViewTransform, this._worldToViewTransform)) {
            this._worldToViewTransform = worldToViewTransform;
            this._viewToWorldTransform = worldToViewTransform.inverted();
            // Invalidate everything
            this.invalidate();
        }
    };

    /** @override */
    GXSceneView.prototype.focus = function () {
        // Try to focus the first available layer of the view
        for (var i = this._layers.length - 1; i >= 0; --i) {
            if (this._layers[i].focus()) {
                return true;
            }
        }
        return false;
    };


    /**
     * Get the layer for a specific type
     * @param {Number} layerType The type of the layer
     * @return {GXSceneViewLayer}
     */
    GXSceneView.prototype.getLayer = function (layerType) {
        return this._layerMap.hasOwnProperty(layerType) ? this._layerMap[layerType] : null;
    };

    /**
     * Add a new layer to this scene view
     * @param {Number} layerType The type of the layer. This will also
     * define the insertion position of the layer.
     * @param {GXPaintConfiguration} [configuration] optional paint
     * configuration for the layer
     * @return {GXSceneViewLayer}
     */
    GXSceneView.prototype.addLayer = function (layerType, configuration) {
        if (this._layerMap.hasOwnProperty(layerType)) {
            throw new Error('Layer already added.');
        }

        if (this._layers == null) {
            this._layers = [];
        }

        // find the closest insertion index
        var index = layerType;
        for (var lt in this._layerMap) {
            if (lt > layerType) {
                index = this._layers.indexOf(this._layerMap[lt]);
                break;
            }
        }

        var layer = new GXSceneViewLayer(configuration);

        if (index >= this._layers.length) {
            this._layers.push(layer);
        } else {
            this._layers.splice(index, 0, layer);
        }

        this.addWidget(layer, GUIPanel.Align.CLIENT, true);

        this._layerMap[layerType] = layer

        return layer;
    };

    /**
     * Event listener for scene's repaintRequest
     * @param {GXScene.InvalidationRequestEvent} event the invalidation request event
     * @private
     */
    GXSceneView.prototype._sceneInvalidationRequest = function (event) {
        var area = event.area;
        if (area) {
            // Ensure to map the scene area into view coordinates, first
            // TODO : How to handle view margins!?
            area = this._worldToViewTransform.mapRect(area);
        }

        // Invalidate our content layer
        this._layerMap[GXSceneView.Layer.Content].invalidate(area);
    };

    /**
     * Called when a known layer-type should be painted
     * @param {GXPaintContext} context
     * @private
     */
    GXSceneView.prototype._paintContentLayer = function (context) {
        if (this._scene) {
            // For single page mode we'll limit to the active page (or first one if there's no active one)
            var targetPage = null;
            if (this._viewConfiguration.singlePageMode) {
                targetPage = this._scene.getPageSet().querySingle("page:active");
                if (!targetPage) {
                    targetPage = this._scene.getPageSet().getFirstChild();
                }
            }

            // Before any painting we need to convert our dirty matcher's
            // dirty regions back into scene coordinates in any case
            if (context.dirtyMatcher) {
                context.dirtyMatcher.transform(this._viewToWorldTransform);
            }

            // Fill Canvas with pasteboard color in either single page mode or output paint mode
            if (this._viewConfiguration.paintMode === GXScenePaintConfiguration.PaintMode.Output || targetPage) {
                context.canvas.fillRect(0, 0, context.canvas.getWidth(), context.canvas.getHeight(), this._viewConfiguration.pasteboardColor);
            }

            // Paint either target page and/or pageSet before anything else
            var oldCanvasTransform = context.canvas.setTransform(this._worldToViewTransform);
            if (targetPage) {
                targetPage.paint(context, true);
            } else {
                this._scene.getPageSet().paint(context);
            }
            context.canvas.setTransform(oldCanvasTransform);

            // Handle rendering in pixel mode but only if we're not at 100%
            if (this._isPixelMode()) {
                // Create and size our pixel content canvas
                if (!this._pixelContentCanvas) {
                    this._pixelContentCanvas = new GXSceneViewCanvas();
                    this._pixelContentCanvas.resize(context.canvas.getWidth(), context.canvas.getHeight());
                }

                // Pixel content canvas always renders at scale = 100%
                this._pixelContentCanvas.prepare(context.dirtyMatcher ? context.dirtyMatcher.getDirtyRectangles() : null);
                this._pixelContentCanvas.setTransform(new GTransform());

                // Save source canvas, exchange it with pixel content canvas and paint the scene
                var sourceCanvas = context.canvas;
                context.canvas = this._pixelContentCanvas;
                this._scene.paint(context, targetPage);
                this._pixelContentCanvas.finish();

                // Now render our pixel content canvas at the given scale on our source canvas
                sourceCanvas.setTransform(this._worldToViewTransform);
                sourceCanvas.drawImage(this._pixelContentCanvas, 0, 0, true);

                // Finally reset our source canvas
                context.canvas = sourceCanvas;
            } else {
                // Render regular vectors
                this._pixelContentCanvas = null;
                context.canvas.setTransform(this._worldToViewTransform);
                this._scene.paint(context, targetPage);
            }
        }
    };

    /**
     * Returns whether we're rendering in pixel mode or not
     * @returns {Boolean}
     * @private
     */
    GXSceneView.prototype._isPixelMode = function () {
        return this._viewConfiguration.pixelMode && !gMath.isEqualEps(this._zoom, 1.0);
    };

    /** @override */
    GXSceneView.prototype.toString = function () {
        return "[Object GXSceneView]";
    };

    _.GXSceneView = GXSceneView;

})(this);