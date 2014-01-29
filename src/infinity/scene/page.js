(function (_) {
    /**
     * An element representing a page
     * @class GXPage
     * @extends GXElement
     * @mixes GXNode.Properties
     * @mixes GXNode.Store
     * @constructor
     */
    function GXPage() {
        GXGroup.call(this);
        this._setDefaultProperties(GXPage.GeometryProperties, GXPage.VisualProperties, GXPage.MetaProperties);
    };
    GXNode.inheritAndMix("page", GXPage, GXElement, [GXNode.Properties, GXNode.Store]);

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
        color: new GXColor(GXColor.Type.RGB, [255, 255, 255, 100]).asString()
    };

    /**
     * The meta properties of a page with their default values
     */
    GXPage.MetaProperties = {
        title: null
    };

    /**
     * @type {Number}
     */
    GXPage.SHADOW_SIZE = 3;

    /**
     * @type {Number}
     */
    GXPage.SHADOW_COLOR = gColor.build(0, 0, 0, 60);

    // -----------------------------------------------------------------------------------------------------------------
    // GXPage Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Returns whether a given element is part of this page
     * @param {GXElement} element the element to test against
     * @param {Boolean} inside if true, element need to be fully
     * enclosed by the page , otherwise it is enough it intersects
     * with with the page. Defaults to false.
     * @return {Boolean} true if element is part of this page, false if not
     */
    GXPage.prototype.isPagePart = function (element, inside) {
        var paintBBox = element.getPaintBBox();
        var myBBox = this.getGeometryBBox();

        if (myBBox && !myBBox.isEmpty() && paintBBox && !paintBBox.isEmpty()) {
            return inside ? myBBox.intersectsRect(paintBBox) : myBBox.containsRect(paintBBox);
        }

        return false;
    };

    /**
     * Returns all elements that are part of this page
     * @param {Boolean} inside if true, matches need to be fully
     * enclosed by the page to be returned, otherwise it is enough
     * when they're intersecting with the page. Defaults to false.
     * @return {Array<GXElement>} an array of elements that are part
     * of this page in their natural order. May return an empty array.
     */
    GXPage.prototype.getPageParts = function (inside) {
        if (!this.isAttached()) {
            throw new Error('This function requires an attached scene.');
        }

        var myBBox = this.getGeometryBBox();
        if (myBBox && !myBBox.isEmpty()) {
            return this._scene.getElementsByBBox(this.getGeometryBBox(), inside);
        }

        return [];
    };

    /** @override */
    GXPage.prototype.store = function (blob) {
        if (GXNode.Store.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXPage.GeometryProperties);
            this.storeProperties(blob, GXPage.VisualProperties);
            this.storeProperties(blob, GXPage.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXPage.prototype.restore = function (blob) {
        if (GXNode.Store.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXPage.GeometryProperties, true);
            this.restoreProperties(blob, GXPage.VisualProperties, true);
            this.restoreProperties(blob, GXPage.MetaProperties, true);
            return true;
        }
        return false;
    };

    /** @override */
    GXPage.prototype.paint = function (context, noDecoration) {
        if (!this._preparePaint(context)) {
            return;
        }

        // Paint page outline if decorated
        // Reset canvas transform and save it
        var canvasTransform = context.canvas.resetTransform();

        // Get page & margin rectangle and transform it into world space
        var pageRect = new GRect(this.$x, this.$y, this.$w, this.$h);
        var transformedRect = canvasTransform.mapRect(pageRect).toAlignedRect();
        var x = transformedRect.getX(), y = transformedRect.getY(), w = transformedRect.getWidth(), h = transformedRect.getHeight();

        var marginRect = pageRect.expanded(
            -(this.$ml ? this.$ml : 0),
            -(this.$mt ? this.$mt : 0),
            -(this.$mr ? this.$mr : 0),
            -(this.$mb ? this.$mb : 0)
        );
        var transformedMarginRect = canvasTransform.mapRect(marginRect).toAlignedRect();
        var mx = transformedMarginRect.getX(), my = transformedMarginRect.getY(), mw = transformedMarginRect.getWidth(), mh = transformedMarginRect.getHeight();

        // Paint decoration (shadow + outline)
        if (!noDecoration) {
            for (var i = GXPage.SHADOW_SIZE; i >= 1; --i) {
                var color = gColor.setAlpha(GXPage.SHADOW_COLOR, gColor.getAlpha(GXPage.SHADOW_COLOR) * (GXPage.SHADOW_SIZE + 1.0 - i) / GXPage.SHADOW_SIZE);
                context.canvas.fillRect(x + i - 1, y + i - 1, w + 2, h + 2, color);
            }
        }

        // Paint outline
        context.canvas.fillRect(x - 1, y - 1, w + 2, h + 2, gColor.build(0, 0, 0));

        // Paint inner fill either with color if any or as checkboard patterns for transparency (none)
        if (this.$color) {
            context.canvas.fillRect(x, y, w, h, GXColor.parseColor(this.$color).asRGBInt());
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

        // Paint Grid if any
        if (this.$gc && this.$gc > 1 && this.$gb && this.$gb > 0 && context.configuration.isPageGutterVisible(context)) {
            var columnWidth = (-this.$gc * this.$gw + this.$w + this.$gw) / this.$gc;
            var gx1 = marginRect.getX();
            var gy1 = marginRect.getY();
            var gx2 = marginRect.getX() + marginRect.getWidth();
            var gy2 = marginRect.getY() + marginRect.getHeight();

            var rowCount = 0;
            for (var cy = gy1; cy <= gy2; cy += this.$gb) {
                var isGutterRow = this.$gr && this.$gr > 0 && rowCount === this.$gr;
                if (isGutterRow) {
                    rowCount = 0;
                } else {
                    rowCount++;
                }

                for (var cx = gx1; cx <= gx2; cx += columnWidth + this.$gw) {
                    var cr = canvasTransform.mapRect(new GRect(cx, cy, columnWidth, this.$gb)).intersected(transformedMarginRect);
                    ;
                    var gr = canvasTransform.mapRect(new GRect(cx + columnWidth, cy, this.$gw, this.$gb)).intersected(transformedMarginRect);
                    // Paint column
                    context.canvas.fillRect(cr.getX(), cr.getY(), cr.getWidth(), cr.getHeight(), gColor.setAlpha(context.configuration.pageGutterColor, isGutterRow ? 30 : 60));

                    if (!isGutterRow) {
                        // Paint gutter
                        context.canvas.fillRect(gr.getX(), gr.getY(), gr.getWidth(), gr.getHeight(), gColor.setAlpha(context.configuration.pageGutterColor, 30));
                    }
                }

                // Paint row divider
                var rr = canvasTransform.mapRect(new GRect(gx1, cy + this.$gb, gx2 - gx1, 1)).intersected(transformedMarginRect);
                ;
                context.canvas.fillRect(rr.getX(), rr.getY(), rr.getWidth(), 1, context.configuration.pageGutterColor);
            }
        }

        // Paint margin on top if desired
        if (this._hasMargin() && context.configuration.isPageMarginVisible(context)) {
            context.canvas.strokeRect(mx + 0.5, my + 0.5, mw, mh, 1.0, context.configuration.pageMarginColor);
        }

        // Assign original transform again
        context.canvas.setTransform(canvasTransform);

        this._finishPaint(context);
    };

    /** @override */
    GXPage.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXPageSet;
    };

    /** @override */
    GXPage.prototype._calculateGeometryBBox = function () {
        return new GRect(this.$x, this.$y, this.$w, this.$h);
    };

    /** @override */
    GXPage.prototype._calculatePaintBBox = function () {
        var paintBBox = new GRect(this.$x, this.$y, this.$w, this.$h);

        // translate by border-offset (1)
        paintBBox = paintBBox.translated(-1, -1);
        // Add shadow sizes + border*2
        var sx = (GXPage.SHADOW_SIZE + 2) / paintBBox.getWidth();
        var sy = (GXPage.SHADOW_SIZE + 2) / paintBBox.getHeight();
        paintBBox = paintBBox.scaledAt(1.0 + sx, 1.0 + sy, paintBBox.getSide(GRect.Side.TOP_LEFT));

        return paintBBox;
    };

    /** @override */
    GXPage.prototype._detailHitTest = function (location, transform) {
        var geoBox = this.getGeometryBBox();
        if (transform) {
            geoBox = transform.mapRect(geoBox);
        }
        if (geoBox.containsPoint(location)) {
            return new GXElement.HitResult(this);
        }
        return null;
    };

    /** @override */
    GXPage.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, GXPage.GeometryProperties);
        this._handleVisualChangeForProperties(change, args, GXPage.VisualProperties);
        GXElement.prototype._handleChange.call(this, change, args);
    };

    /**
     * @returns {Boolean}
     * @private
     */
    GXPage.prototype._hasMargin = function () {
        return (this.$ml !== null && this.$ml > 0.0) ||
            (this.$mt !== null && this.$mt > 0.0) ||
            (this.$mr !== null && this.$mr > 0.0) ||
            (this.$mb !== null && this.$mb > 0.0);
    };

    _.GXPage = GXPage;
})(this);