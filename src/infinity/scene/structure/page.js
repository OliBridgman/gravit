(function (_) {
    /**
     * An element representing a page
     * @class IFPage
     * @extends IFBlock
     * @mixes IFNode.Container
     * @constructor
     */
    function IFPage() {
        IFBlock.call(this);
        this._setDefaultProperties(IFPage.GeometryProperties, IFPage.VisualProperties);
    };
    IFNode.inheritAndMix("page", IFPage, IFBlock, [IFNode.Container]);

    /**
     * The geometry properties of a page with their default values
     */
    IFPage.GeometryProperties = {
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
    IFPage.VisualProperties = {
        cls: null
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFPage Class
    // -----------------------------------------------------------------------------------------------------------------
    /** @override */
    IFPage.prototype.store = function (blob) {
        if (IFBlock.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFPage.GeometryProperties);
            this.storeProperties(blob, IFPage.VisualProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFPage.prototype.restore = function (blob) {
        if (IFBlock.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFPage.GeometryProperties);
            this.restoreProperties(blob, IFPage.VisualProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFPage.prototype._paint = function (context, style, styleIndex) {
        // Indicates whether page clipped it's contents
        var hasClipped = false;

        // Figure if we have any contents
        var hasContents = false;
        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof IFElement) {
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

        // If we have contents and are in output mode we'll clip to our page extents
        if (hasContents && context.configuration.paintMode === IFScenePaintConfiguration.PaintMode.Output) {
            // Include bleeding in clipping coordinates if any
            var bl = this.$bl || 0;
            context.canvas.clipRect(x - bl, y - bl, w + bl * 2, h + bl * 2);
            hasClipped = true;
        }

        // Assign original transform again
        context.canvas.setTransform(canvasTransform);

        // Render contents if any
        if (hasContents) {
            this._renderChildren(context);
        }

        // Reset clipping if we've clipped
        if (hasClipped) {
            context.canvas.resetClip();
        }
    };

    /** @override */
    IFPage.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFScene;
    };

    /** @override */
    IFPage.prototype._calculateGeometryBBox = function () {
        return new GRect(this.$x, this.$y, this.$w, this.$h);
    };

    /** @override */
    IFPage.prototype._calculatePaintBBox = function () {
        var bbox = this.getGeometryBBox();

        if (this.$bl && this.$bl > 0) {
            bbox = bbox.expanded(this.$bl, this.$bl, this.$bl, this.$bl);
        }

        var superBBox = IFBlock.prototype._calculatePaintBBox.call(this);

        return superBBox ? superBBox.united(bbox) : bbox;
    };

    /** @override */
    IFPage.prototype._detailHitTest = function (location, transform, tolerance, force) {
        var geoBox = this.getGeometryBBox();

        if (transform) {
            geoBox = transform.mapRect(geoBox);
        }

        if (geoBox.expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {
            return new IFBlock.HitResult(this);
        }

        return IFBlock.prototype._detailHitTest.call(this, location, transform, tolerance, force);;
    };

    /** @override */
    IFPage.prototype._handleChange = function (change, args) {
        if (this._handleGeometryChangeForProperties(change, args, IFPage.GeometryProperties)) {
            if (change === IFNode._Change.BeforePropertiesChange) {
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
                            if (child instanceof IFElement && child.hasMixin(IFElement.Transform)) {
                                child.transform(transform);
                            }
                        }
                    }
                }
            }
        }

        this._handleVisualChangeForProperties(change, args, IFPage.VisualProperties);
        IFBlock.prototype._handleChange.call(this, change, args);
    };

    _.IFPage = IFPage;
})(this);