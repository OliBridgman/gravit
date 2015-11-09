(function (_) {
    /**
     * A page scene
     * @class GPage
     * @extends GCanvas
     * @mixes GNode.Reference
     * @constructor
     */
    function GPage(workspace) {
        GCanvas.call(this, workspace);
        this._setDefaultProperties(GPage.GeometryProperties, GPage.VisualProperties);
    };
    GNode.inheritAndMix("page", GPage, GCanvas, [GNode.Reference]);

    /**
     * The geometry properties of a page with their default values
     */
    GPage.GeometryProperties = {
        /** Master-Page reference */
        msref: null,
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
    GPage.VisualProperties = {
        /** Page background (GPattern) */
        bck: null,
        /** Page background opacity */
        bop: 1.0
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GPage Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Returns whether this page is a master page or not (always returns false if not attached)
     * @returns {boolean}
     */
    GPage.prototype.isMaster = function () {
        return this._workspace ? this._workspace.hasLinks(this) : false;
    };

    /**
     * Returns the master page if attached and the page has a master
     * @returns {GNode.Reference}
     */
    GPage.prototype.getMasterPage = function () {
        var result = this.$msref && this._workspace ? this._workspace.getReference(this.$msref) : null;

        // try to avoid returning ourself
        if (result === this) {
            return null;
        }

        return result;
    };

    /**
     * Returns the page's clip box which always is the page's
     * geometry bbox plus additional bleeding if any
     * @return {GRect}
     */
    GPage.prototype.getPageClipBBox = function () {
        var bbox = this.getGeometryBBox();
        if (bbox && !bbox.isEmpty()) {
            var bl = this.$bl || 0;
            return bbox.expanded(bl, bl, bl, bl);
        }
        return bbox;
    };

    /** @override */
    GPage.prototype._getBitmapPaintArea = function () {
        return this.getPageClipBBox();
    };

    /** @override */
    GPage.prototype._paintToBitmap = function (context) {
        // Enable page clipping
        paintConfig.clipToPage = true;
        return GCanvas.prototype._paintToBitmap(context);
    };

    /** @override */
    GPage.prototype._paint = function (context) {
        var canvas = context.canvas;

        // Figure if we have any contents
        var hasContents = false;
        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof GElement) {
                hasContents = true;
                break;
            }
        }

        // Paint master page if we have any
        var masterPage = this.getMasterPage();

        // Indicates whether page clipped it's contents
        var isClipped = false;

        // Reset canvas transform and save it
        var canvasTransform = canvas.resetTransform();

        // Get page rectangle and transform it into world space
        var pageRect = new GRect(0, 0, this.$w, this.$h);
        var transformedPageRect = canvasTransform.mapRect(pageRect).toAlignedRect();
        var x = transformedPageRect.getX(), y = transformedPageRect.getY(), w = transformedPageRect.getWidth(), h = transformedPageRect.getHeight();

        // Paint background if any and not outlined
        if (!context.configuration.isOutline(context) && this.$bck && this.$bop > 0) {
            var background = context.canvas.createPatternPaint(this.$bck, transformedPageRect);
            if (background) {
                if (background.transform) {
                    var oldTransform = canvas.setTransform(canvas.getTransform(true).preMultiplied(background.transform));
                    canvas.fillRect(0, 0, 1, 1, background.paint, this.$bop);
                    canvas.setTransform(oldTransform);
                } else {
                    canvas.fillRect(x, y, w, h, background.paint, this.$bop);
                }
            }
        }

        // If we have contents test if we shall clip to our extents
        if (hasContents && masterPage || context.configuration.isClipToPage()) {
            // Include bleeding in clipping coordinates if any
            var bl = this.$bl || 0;
            canvas.clipRect(x - bl, y - bl, w + bl * 2, h + bl * 2);
            isClipped = true;
        }

        // Assign original transform again
        canvas.setTransform(canvasTransform);

        // Paint master page if any
        if (masterPage) {
            masterPage.paint(context);
        }

        // Paint contents if any
        if (hasContents) {
            this._paintChildren(context);
        }

        // Reset clipping if we've clipped
        if (isClipped) {
            canvas.resetClip();
        }
    };

    /** @override */
    GPage.prototype._calculateGeometryBBox = function () {
        return new GRect(0, 0, this.$w, this.$h);
    };

    /** @override */
    GPage.prototype._calculatePaintBBox = function () {
        var bbox = this.getGeometryBBox();

        if (this.$bl && this.$bl > 0) {
            bbox = bbox.expanded(this.$bl, this.$bl, this.$bl, this.$bl);
        }

        var superBBox = GCanvas.prototype._calculatePaintBBox.call(this);

        return superBBox ? superBBox.united(bbox) : bbox;
    };

    /** @override */
    GPage.prototype._detailHitTest = function (location, transform, tolerance, force) {
        var geoBox = this.getGeometryBBox();

        if (transform) {
            geoBox = transform.mapRect(geoBox);
        }

        if (geoBox.expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {
            return new GElement.HitResultInfo(this);
        }

        return GCanvas.prototype._detailHitTest.call(this, location, transform, tolerance, force);
    };

    /** @override */
    GPage.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GPage.GeometryProperties);
            this.storeProperties(args, GPage.VisualProperties, function (property, value) {
                if (property === 'bck' && value) {
                    return GPattern.serialize(value);
                }
                return value;
            });
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GPage.GeometryProperties);
            this.restoreProperties(args, GPage.VisualProperties, function (property, value) {
                if (property === 'bck' && value) {
                    return GPattern.deserialize(value);
                }
                return value;
            });
        } else if (change === GElement._Change.WorkspaceAttached) {
            var masterPage = this._workspace.getReference(this.$msref);
            if (masterPage) {
                this._workspace.link(masterPage, this)
            }
        } else if (change === GElement._Change.WorkspaceDetach) {
            var masterPage = this._workspace.getReference(this.$msref);
            if (masterPage) {
                this._workspace.unlink(masterPage, this);
            }
        }

        if (this._handleGeometryChangeForProperties(change, args, GPage.GeometryProperties)) {
            if (args.properties.indexOf('msref') >= 0) {
                var masterPage = this.getMasterPage();
                if (masterPage) {
                    switch (change) {
                        case GNode._Change.BeforePropertiesChange:
                            this._workspace.unlink(masterPage, this);
                            break;
                        case GNode._Change.AfterPropertiesChange:
                            this._workspace.link(masterPage, this);
                            break;
                    }
                }
            }
        }

        this._handleVisualChangeForProperties(change, args, GPage.VisualProperties);

        if (change === GElement._Change.InvalidationRequested) {
            /** @type GRect */
            var area = args;

            // Handle invalidation if we're a master
            if (area && !area.isEmpty() && this.isMaster()) {
                // If the invalidation area intersects with our page clipping box then
                // we need to invalidate the same area on all paintable linked pages as well
                var clipBBox = this.getPageClipBBox();
                if (clipBBox && !clipBBox.isEmpty() && clipBBox.intersectsRect(area)) {
                    this._workspace.visitLinks(this, function (link) {
                        if (link instanceof GPage && link.isPaintable()) {
                            link._requestInvalidationArea(area);
                        }
                    }.bind(this));
                }
            }
        }

        GCanvas.prototype._handleChange.call(this, change, args);
    };

    _.GPage = GPage;
})(this);