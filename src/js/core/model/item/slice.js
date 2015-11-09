(function (_) {
    /**
     * An element representing a slice
     * @class GSlice
     * @extends GItem
     * @mixes GElement.Transform
     * @constructor
     */
    function GSlice() {
        GItem.call(this);
        this._setDefaultProperties(GSlice.VisualProperties, GSlice.GeometryProperties, GSlice.MetaProperties);
    }

    GNode.inheritAndMix("slice", GSlice, GItem, [GElement.Transform]);

    /**
     * The meta properties of a slice with their default values
     */
    GSlice.MetaProperties = {
        // Whether to trim on exporting or not
        trm: true
    };

    /**
     * The geometry properties of a slice with their default values
     */
    GSlice.GeometryProperties = {
        trf: null
    };

    /**
     * The visual properties of a slice with their default values
     */
    GSlice.VisualProperties = {
        // The color of the slice
        cls: new GRGBColor([0, 116, 217])
    };

    /** @override */
    GSlice.prototype.getTransform = function () {
        return this.$trf;
    };

    /** @override */
    GSlice.prototype.setTransform = function (transform) {
        this.setProperty('trf', transform);
    };

    /** @override */
    GSlice.prototype.transform = function (transform) {
        if (transform && !transform.isIdentity()) {
            this.setProperty('trf', this.$trf ? this.$trf.multiplied(transform) : transform);
        }
        GElement.Transform.prototype._transformChildren.call(this, transform);
    };

    /** @override */
    GSlice.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GLayer;
    };

    /** @override */
    GSlice.prototype._paintToBitmap = function (context) {
        if (!this._scene) {
            throw new Error('Not part of a scene.');
        }

        // Paint scene and not ourself
        this._scene.paint(context);

        var bitmap = context.canvas.getBitmap();

        // Clip bitmap if necessary
        if (this.getProperty('trm')) {
            bitmap.trim();
        }

        return bitmap;
    };

    /** @override */
    GSlice.prototype._paint = function (context) {
        if (context.configuration.isSlicesVisible(context)) {
            var sourceBBox = new GRect(-1, -1, 2, 2);
            sourceBBox = this.$trf ? this.$trf.mapRect(sourceBBox) : sourceBBox;

            if (context.configuration.isOutline(context)) {
                var transform = context.canvas.resetTransform();
                var transformedRect = transform ? transform.mapRect(sourceBBox) : sourceBBox;
                context.canvas.strokeRect(transformedRect.getX(), transformedRect.getY(),
                    transformedRect.getWidth(), transformedRect.getHeight(), 1, context.getOutlineColor());
                context.canvas.setTransform(transform);
            } else {
                var transformedRect = sourceBBox;
                context.canvas.fillRect(transformedRect.getX(), transformedRect.getY(),
                    transformedRect.getWidth(), transformedRect.getHeight(), this.$cls, 0.5);
            }
        }
    };

    /** @override */
    GSlice.prototype._calculateGeometryBBox = function () {
        var rect = new GRect(-1, -1, 2, 2);
        return this.$trf ? this.$trf.mapRect(rect) : rect;
    };

    /** @override */
    GSlice.prototype._calculatePaintBBox = function () {
        return this.getGeometryBBox();
    };

    /** @override */
    GSlice.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GSlice.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return GPattern.serialize(value);
                }
                return value;
            });

            this.storeProperties(args, GSlice.GeometryProperties, function (property, value) {
                if (property === 'trf' && value) {
                    return GTransform.serialize(value);
                }
                return value;
            });

            this.storeProperties(args, GSlice.MetaProperties);
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GSlice.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return GPattern.deserialize(value);
                }
                return value;
            });

            this.restoreProperties(args, GSlice.GeometryProperties, function (property, value) {
                if (property === 'trf' && value) {
                    return GTransform.deserialize(value);
                }
                return value;
            });

            this.restoreProperties(args, GSlice.MetaProperties);
        }
        
        this._handleGeometryChangeForProperties(change, args, GSlice.GeometryProperties);
        this._handleVisualChangeForProperties(change, args, GSlice.VisualProperties);
        
        GItem.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GSlice.prototype._detailHitTest = function (location, transform, tolerance, force) {
        return new GElement.HitResultInfo(this);
    };

    _.GSlice = GSlice;
})(this);