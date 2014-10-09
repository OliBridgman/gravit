(function (_) {
    /**
     * Blur effect
     * @class IFOverlayEffect
     * @extends IFEffect
     * @constructor
     */
    IFOverlayEffect = function () {
        IFEffect.call(this);
        this._setDefaultProperties(IFOverlayEffect.VisualProperties);
    };
    IFNode.inherit('overlayEffect', IFOverlayEffect, IFEffect);

    /**
     * Visual properties of an overlay effect
     */
    IFOverlayEffect.VisualProperties = {
        /** The overlay pattern (IFPattern) */
        pat: IFRGBColor.BLACK,
        /** Overlay opacity */
        opc: 1
    };

    /** @override */
    IFOverlayEffect.prototype.getEffectType = function () {
        return IFEffect.Type.Filter;
    };

    /** @override */
    IFOverlayEffect.prototype.render = function (contents, output, background, scale) {
        if (this.$pat && this.$opc > 0.0) {
            // Fill our whole canvas with the pattern clipped by the source
            contents.fillCanvas(this.$pat, this.$opc, IFPaintCanvas.CompositeOperator.SourceIn);
        }
    };

    /** @override */
    IFOverlayEffect.prototype._handleChange = function (change, args) {
        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFOverlayEffect.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat') {
                        return IFPattern.serialize(value);
                    }
                }
                return value;
            });
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFOverlayEffect.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat') {
                        return IFPattern.deserialize(value);
                    }
                }
            });
        }

        this._handleVisualChangeForProperties(change, args, IFOverlayEffect.VisualProperties);

        IFEffect.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFOverlayEffect.prototype.toString = function () {
        return "[Object IFOverlayEffect]";
    };

    _.IFOverlayEffect = IFOverlayEffect;
})(this);