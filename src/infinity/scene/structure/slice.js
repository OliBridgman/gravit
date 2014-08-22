(function (_) {
    /**
     * An element representing a slice
     * @class IFSlice
     * @extends IFItem
     * @mixes IFElement.Transform
     * @constructor
     */
    function IFSlice() {
        IFItem.call(this);
        this._setDefaultProperties(IFSlice.VisualProperties, IFSlice.GeometryProperties, IFSlice.MetaProperties);
    }

    IFNode.inheritAndMix("slice", IFSlice, IFItem, [IFElement.Transform]);

    /**
     * The meta properties of a slice with their default values
     */
    IFSlice.MetaProperties = {
        // Whether to trim on exporting or not
        trm: true
    };

    /**
     * The geometry properties of a slice with their default values
     */
    IFSlice.GeometryProperties = {
        trf: null
    };

    /**
     * The visual properties of a slice with their default values
     */
    IFSlice.VisualProperties = {
        // The color of the slice
        cls: new IFColor(IFColor.Type.RGB, [0, 116, 217, 100])
    };

    /** @override */
    IFSlice.prototype.getTransform = function () {
        return this.$trf;
    };

    /** @override */
    IFSlice.prototype.setTransform = function (transform) {
        this.setProperty('trf', transform);
    };

    /** @override */
    IFSlice.prototype.transform = function (transform) {
        if (transform && !transform.isIdentity()) {
            this.setProperty('trf', this.$trf ? this.$trf.multiplied(transform) : transform);
        }
        IFElement.Transform.prototype._transformChildren.call(this, transform);
    };

    /** @override */
    IFSlice.prototype.store = function (blob) {
        if (IFItem.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFSlice.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return value.asString();
                }
                return value;
            });

            this.storeProperties(blob, IFSlice.GeometryProperties, function (property, value) {
                if (property === 'trf' && value) {
                    return IFTransform.serialize(value);
                }
                return value;
            });

            this.storeProperties(blob, IFSlice.MetaProperties);

            return true;
        }
        return false;
    };

    /** @override */
    IFSlice.prototype.restore = function (blob) {
        if (IFItem.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFSlice.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return IFColor.parseColor(value);
                }
                return value;
            });

            this.restoreProperties(blob, IFSlice.GeometryProperties, function (property, value) {
                if (property === 'trf' && value) {
                    return IFTransform.deserialize(value);
                }
                return value;
            });

            this.restoreProperties(blob, IFSlice.MetaProperties);

            return true;
        }
        return false;
    };

    /** @override */
    IFSlice.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFLayer;
    };

    /** @override */
    IFPage.prototype._renderToBitmap = function (context) {
        // Render scene and not ourself
        this.getScene().render(context);

        var bitmap = context.canvas.getBitmap();

        // Clip bitmap if necessary
        if (this.getProperty('trm')) {
            bitmap.trim();
        }

        return bitmap;
    };

    /** @override */
    IFSlice.prototype._paint = function (context) {
        if (context.configuration.isSlicesVisible(context)) {
            var sourceBBox = new IFRect(-1, -1, 2, 2);
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
    IFSlice.prototype._calculateGeometryBBox = function () {
        var rect = new IFRect(-1, -1, 2, 2);
        return this.$trf ? this.$trf.mapRect(rect) : rect;
    };

    /** @override */
    IFSlice.prototype._calculatePaintBBox = function () {
        return this.getGeometryBBox();
    };

    /** @override */
    IFSlice.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, IFSlice.GeometryProperties);
        this._handleVisualChangeForProperties(change, args, IFSlice.VisualProperties);
        IFItem.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFSlice.prototype._detailHitTest = function (location, transform, tolerance, force) {
        return new IFItem.HitResult(this);
    };

    _.IFSlice = IFSlice;
})(this);