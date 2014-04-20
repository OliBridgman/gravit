(function (_) {
    /**
     * An element representing a page
     * @class GXPage
     * @extends GXBlock
     * @mixes GXNode.Container
     * @constructor
     */
    function GXPage() {
        GXBlock.call(this);
        this._setDefaultProperties(GXPage.GeometryProperties, GXPage.VisualProperties);
    };
    GXNode.inheritAndMix("page", GXPage, GXBlock, [GXNode.Container]);

    /**
     * The geometry properties of a page with their default values
     */
    GXPage.GeometryProperties = {
        /** Page position */
        x: 0,
        y: 0,
        /** Page size */
        w: 0,
        h: 0,
        /** Additional bleeding */
        bl: 0,
        /** Margins (left, top, right, bottom, column, row) */
        ml: 0,
        mt: 0,
        mr: 0,
        mb: 0
    };

    /**
     * The visual properties of a page with their default values
     */
    GXPage.VisualProperties = {
        cls: new GXColor(GXColor.Type.RGB, [255, 255, 255, 100])
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXPage Class
    // -----------------------------------------------------------------------------------------------------------------
    /** @override */
    GXPage.prototype.store = function (blob) {
        if (GXBlock.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXPage.GeometryProperties);
            this.storeProperties(blob, GXPage.VisualProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXPage.prototype.restore = function (blob) {
        if (GXBlock.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXPage.GeometryProperties);
            this.restoreProperties(blob, GXPage.VisualProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXPage.prototype.paint = function (context) {
        if (!this._preparePaint(context)) {
            return;
        }

        // Indicates whether page clipped it's contents
        var hasClipped = false;

        // Figure if we have any contents
        var hasContents = false;
        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof GXElement) {
                hasContents = true;
                break;
            }
        }

        // Reset canvas transform and save it
        var canvasTransform = context.canvas.resetTransform();

        // Get page rectangle and transform it into world space
        var pageRect = new GRect(this.$x, this.$y, this.$w, this.$h);
        var transformedPageRect = canvasTransform.mapRect(pageRect).toAlignedRect();
        var x = transformedPageRect.getX(), y = transformedPageRect.getY(), w = transformedPageRect.getWidth(), h = transformedPageRect.getHeight();

        // Paint page if it has any color
        if (this.$cls) {
            context.canvas.fillRect(x, y, w, h, this.$cls);
        }

        // If we have contents and are in output mode we'll clip to our page extents
        if (hasContents && context.configuration.paintMode === GXScenePaintConfiguration.PaintMode.Output) {
            // Include bleeding in clipping coordinates if any
            var bl = this.$bl || 0;
            context.canvas.clipRect(x - bl, y - bl, w + bl * 2, h + bl * 2);
            hasClipped = true;
        }

        // Assign original transform again
        context.canvas.setTransform(canvasTransform);

        // Paint contents if any
        if (hasContents) {
            this._paintChildren(context);
        }

        // Reset clipping if we've clipped
        if (hasClipped) {
            context.canvas.resetClip();
        }

        this._finishPaint(context);
    };

    /** @override */
    GXPage.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXScene;
    };

    /** @override */
    GXPage.prototype._calculateGeometryBBox = function () {
        return new GRect(this.$x, this.$y, this.$w, this.$h);
    };

    /** @override */
    GXPage.prototype._calculatePaintBBox = function () {
        var bbox = this.getGeometryBBox();

        if (this.$bl && this.$bl > 0) {
            bbox = bbox.expanded(this.$bl, this.$bl, this.$bl, this.$bl);
        }

        var superBBox = GXBlock.prototype._calculatePaintBBox.call(this);

        return superBBox ? superBBox.united(bbox) : bbox;
    };

    /** @override */
    GXPage.prototype._detailHitTest = function (location, transform, tolerance, force) {
        var geoBox = this.getGeometryBBox();

        if (transform) {
            geoBox = transform.mapRect(geoBox);
        }

        if (geoBox.expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {
            return new GXBlock.HitResult(this);
        }

        return GXBlock.prototype._detailHitTest.call(this, location, transform, tolerance, force);;
    };

    /** @override */
    GXPage.prototype._handleChange = function (change, args) {
        if (this._handleGeometryChangeForProperties(change, args, GXPage.GeometryProperties)) {
            if (change === GXNode._Change.BeforePropertiesChange) {
                // Check for position change in page
                var xIndex = args.properties.indexOf('x');
                var yIndex = args.properties.indexOf('y');
                if (xIndex >= 0 || yIndex >= 0) {
                    // Changing x and/or y requires translating all direct children
                    var dx = xIndex >= 0 ? args.values[xIndex] - this.$x : 0;
                    var dy = yIndex >= 0 ? args.values[yIndex] - this.$y : 0;

                    if (dx !== 0 || dy !== 0) {
                        var transform = new GTransform(1, 0, 0, 1, dx, dy);
                        for (var child = this.getFirstChild(true); child != null; child = child.getNext(true)) {
                            if (child instanceof GXElement && child.hasMixin(GXElement.Transform)) {
                                child.transform(transform);
                            }
                        }
                    }
                }
            }
        }

        this._handleVisualChangeForProperties(change, args, GXPage.VisualProperties);
        GXBlock.prototype._handleChange.call(this, change, args);
    };

    _.GXPage = GXPage;
})(this);