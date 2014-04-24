(function (_) {

    /**
     * A shadow render attribute
     * @class IFShadowAttribute
     * @extends IFEffectAttribute
     * @mixes GXNode.Properties
     * @constructor
     */
    function IFShadowAttribute() {
        IFEffectAttribute.call(this);
        this._setDefaultProperties(IFShadowAttribute.GeometryProperties, IFShadowAttribute.VisualProperties);
    }

    GXNode.inheritAndMix("shadowAttr", IFShadowAttribute, IFEffectAttribute, [GXNode.Properties]);

    /**
     * Geometry properties
     */
    IFShadowAttribute.GeometryProperties = {
        // The radius of the shadow
        r: 5,
        // The horizontal shift of the shadow
        x: 0,
        // The vertical shift of the shadow
        y: 0
    };

    /**
     * Visual properties
     */
    IFShadowAttribute.VisualProperties = {
        // The color of the shadow
        cls: GXColor.parseCSSColor('rgba(0,0,0,0.5)'),
        // Whether to knock-out contents or not
        ko: false
    };

    /** @override */
    IFShadowAttribute.prototype._getCanvasExtents = function (context, source, bbox) {
        var source = this.getBBox(bbox);
        return source.expanded(this.$x, this.$y, -this.$x, -this.$y);
    };

    /** @override */
    IFShadowAttribute.prototype._renderEffect = function (context, source, bbox) {
        var tint = this.$cls ? this.$cls.asRGB() : null;
        if (tint) {
            tint[3] = tint[3] / 100.0;
        }
        context.canvas.runFilter('stackBlur', null, [this.$r, tint]);

        return new GPoint(this.$x, this.$y);
    };

    /** @override */
    IFShadowAttribute.prototype._renderOverlay = function (context, source, bbox) {
        if (!this.$ko) {
            this._renderContents(context, source, bbox);
        }
    };

    /** @override */
    IFShadowAttribute.prototype.store = function (blob) {
        if (IFEffectAttribute.prototype.store.call(this, blob)) {
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
        if (IFEffectAttribute.prototype.restore.call(this, blob)) {
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
        IFEffectAttribute.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFShadowAttribute.prototype._getBBoxPadding = function () {
        return [
            this.$r * 2 - this.$x,
            this.$r * 2 - this.$y,
            this.$r * 2 + this.$x,
            this.$r * 2 + this.$y
        ];
    };

    /** @override */
    IFShadowAttribute.prototype.toString = function () {
        return "[IFShadowAttribute]";
    };

    _.IFShadowAttribute = IFShadowAttribute;
})(this);