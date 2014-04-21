(function (_) {

    /**
     * Attributes that render children of the element
     * @class IFShadowAttribute
     * @extends IFAttribute
     * @mixes GXNode.Container
     * @mixes GXNode.Properties
     * @mixes IFAttribute.Render
     * @constructor
     */
    function IFShadowAttribute() {
        IFAttribute.call(this);
        this._setDefaultProperties(IFShadowAttribute.GeometryProperties, IFShadowAttribute.VisualProperties);
    }

    GXNode.inheritAndMix("shadowAttr", IFShadowAttribute, IFAttribute, [GXNode.Properties, GXNode.Container, IFAttribute.Render]);

    /**
     * Geometry properties
     */
    IFShadowAttribute.GeometryProperties = {
        // The radius of the shadow
        r: 5,
        // The horizontal shift of the shadow
        dx: 10,
        // The vertical shift of the shadow
        dy: 10
    };

    /**
     * Visual properties
     */
    IFShadowAttribute.VisualProperties = {
        // The color of the shadow
        cls: GXColor.parseCSSColor('rgba(0,0,0,0.5)')
    };

    /** @override */
    IFShadowAttribute.prototype.render = function (context, source, bbox) {
        // Create a temporary canvas for our contents for later clipping
        var oldCanvas = context.canvas;
        context.canvas = oldCanvas.createCanvas(bbox.expanded(this.$r, this.$r, this.$r, this.$r));
        try {
            // Render original content, first
            IFAttribute.Render.prototype.render.call(this, context, source, bbox);

            // Blur content and tint it
            var tint = this.$cls ? this.$cls.asRGB() : null;
            if (tint) {
                tint[3] = tint[3] / 100.0;
            }

            context.canvas.runFilter('stackBlur', null, [this.$r, tint]);

            // Paint shadow canvas back with offset
            var canvasTransform = oldCanvas.getTransform();
            var delta = canvasTransform.mapPoint(new GPoint(this.$dx, this.$dy)).subtract(canvasTransform.mapPoint(new GPoint(0, 0)));
            oldCanvas.drawCanvas(context.canvas, delta.getX(), delta.getY());
        } finally {
            context.canvas = oldCanvas;
        }

        // Call original painting to overpaint shadow
        IFAttribute.Render.prototype.render.call(this, context, source, bbox);
    };

    /** @override */
    IFShadowAttribute.prototype.getBBox = function (source) {
        return source.expanded(this.$r - this.$dx , this.$r - this.$dy, this.$r + this.$dx, this.$r + this.$dy);
    };

    /** @override */
    IFShadowAttribute.prototype.store = function (blob) {
        if (IFAttribute.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFShadowAttribute.GeometryProperties);
            this.storeProperties(blob, IFShadowAttribute.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return value.asString();
                }
                return value;
            });
            return true;
        }
        return false;
    };

    /** @override */
    IFShadowAttribute.prototype.restore = function (blob) {
        if (IFAttribute.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFShadowAttribute.GeometryProperties);
            this.restoreProperties(blob, IFShadowAttribute.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return GXColor.parseColor(value);
                }
                return value;
            });
            return true;
        }
        return false;
    };

    /** @override */
    IFShadowAttribute.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, IFShadowAttribute.GeometryProperties);
        this._handleVisualChangeForProperties(change, args, IFShadowAttribute.VisualProperties);
        IFAttribute.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFShadowAttribute.prototype.toString = function () {
        return "[IFShadowAttribute]";
    };

    _.IFShadowAttribute = IFShadowAttribute;
})(this);