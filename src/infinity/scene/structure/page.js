(function (_) {
    /**
     * An element representing a page
     * @class GXPage
     * @extends GXItemContainer
     * @constructor
     */
    function GXPage() {
        GXItemContainer.call(this);
        this._setDefaultProperties(GXPage.GeometryProperties, GXPage.VisualProperties);
    };
    GXNode.inherit("page", GXPage, GXItemContainer);

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
        mb: 0,
        /** Grid (baseline, gutter width, columns, rows)  */
        gb: 0,
        gw: 0,
        gc: 0,
        gr: 0
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
        if (GXItemContainer.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXPage.GeometryProperties);
            this.storeProperties(blob, GXPage.VisualProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXPage.prototype.restore = function (blob) {
        if (GXItemContainer.prototype.restore.call(this, blob)) {
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

        // Paint inner fill either with cls if any or as checkboard patterns for transparency (none)
        if (this.$cls) {
            context.canvas.fillRect(x, y, w, h, this.$cls);
        } else {
            // TODO : Cache pattern
            var cs = context.canvas.createCanvas();
            cs.resize(16, 16);
            cs.fillRect(0, 0, 16, 16, context.configuration.transparentColor);
            cs.fillRect(0, 0, 8, 8, gColor.build(255, 255, 255));
            cs.fillRect(8, 8, 8, 8, gColor.build(255, 255, 255));

            var pt = context.canvas.createPattern(cs, GXPaintCanvas.RepeatMode.Both);

            context.canvas.fillRect(x, y, w, h, pt);
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

        var superBBox = GXItemContainer.prototype._calculatePaintBBox.call(this);

        return superBBox ? superBBox.united(bbox) : bbox;
    };

    /** @override */
    GXPage.prototype._detailHitTest = function (location, transform, tolerance, force) {
        var geoBox = this.getGeometryBBox();

        if (transform) {
            geoBox = transform.mapRect(geoBox);
        }

        if (geoBox.expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {
            return new GXItemContainer.HitResult(this);
        }

        return GXItemContainer.prototype._detailHitTest.call(this, location, transform, tolerance, force);;
    };

    /** @override */
    GXPage.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, GXPage.GeometryProperties);
        this._handleVisualChangeForProperties(change, args, GXPage.VisualProperties);
        GXItemContainer.prototype._handleChange.call(this, change, args);
    };

    _.GXPage = GXPage;
})(this);