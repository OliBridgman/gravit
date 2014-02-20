(function (_) {
    /**
     * An element representing an abstract layer
     * @class GXLayerBase
     * @extends GXGroup
     * @mixes GXNode.Properties
     * @mixes GXNode.Store
     * @constructor
     */
    function GXLayerBase() {
        GXGroup.call(this);
        this._setDefaultProperties(GXLayerBase.MetaProperties);
    }

    GObject.inheritAndMix(GXLayerBase, GXGroup, [GXNode.Properties, GXNode.Store]);

    /**
     * The meta properties of a layer base and their defaults
     */
    GXLayerBase.MetaProperties = {
        title: null,
        visible: true,
        outline: false,
        color: new GXColor(GXColor.Type.RGB, [0, 168, 255, 100]).asString()
    };

    /** @override */
    GXLayerBase.prototype.store = function (blob) {
        if (GXNode.Store.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXLayerBase.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXLayerBase.prototype.restore = function (blob) {
        if (GXNode.Store.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXLayerBase.MetaProperties, true);
            return true;
        }
        return false;
    };

    /** @override */
    GXLayerBase.prototype._preparePaint = function (context) {
        if (GXGroup.prototype._preparePaint.call(this, context)) {
            // Add default outline-color if we're outlined
            if (this.$outline) {
                context.outlineColors.push(context.getOutlineColor());
            }

            return true;
        }
        return false;
    };

    /** @override */
    GXLayerBase.prototype._finishPaint = function (context) {
        // Pop outline color if we're set to outline
        if (this.$outline) {
            context.outlineColors.pop();
        }

        GXGroup.prototype._finishPaint.call(this, context);
    };

    /** @override */
    GXLayerBase.prototype._handleChange = function (change, args) {
        if (change == GXNode._Change.AfterPropertiesChange) {
            if (args.properties.indexOf('outline') >= 0) {
                this._notifyChange(GXElement._Change.InvalidationRequest);
            }
        }

        GXElement.prototype._handleChange.call(this, change, args);
    };

    _.GXLayerBase = GXLayerBase;
})(this);