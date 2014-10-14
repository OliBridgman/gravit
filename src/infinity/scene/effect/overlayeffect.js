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

    IFOverlayEffect.equals = function (left, right) {
        if (left instanceof IFOverlayEffect && right instanceof  IFOverlayEffect) {
            return left.arePropertiesEqual(right, Object.keys(IFOverlayEffect.VisualProperties));
        }
        return false;
    };

    /**
     * Visual properties of an overlay effect
     */
    IFOverlayEffect.VisualProperties = {
        /** The overlay pattern (IFPattern) */
        pat: IFRGBColor.BLACK,
        /** Overlay opacity */
        opc: 0.5
    };

    /** @override */
    IFOverlayEffect.prototype.getEffectType = function () {
        return IFEffect.Type.Filter;
    };

    /** @override */
    IFOverlayEffect.prototype.render = function (contents, output, background, scale) {
        if (this.$pat && this.$opc > 0.0) {
            // Fill our whole canvas with the overlay pattern clipped by the source
            var overlayRect = contents.getTransform(false).inverted().mapRect(new IFRect(0, 0, contents.getWidth(), contents.getHeight()));
            var overlay = this.$pat.createPaint(contents, overlayRect);
            if (overlay && overlay.paint) {
                if (overlay.transform) {
                    var oldTransform = contents.setTransform(contents.getTransform(true).preMultiplied(overlay.transform));
                    contents.fillRect(0, 0, 1, 1, overlay.paint, this.$opc, IFPaintCanvas.CompositeOperator.SourceAtTop);
                    contents.setTransform(oldTransform);
                } else {
                    contents.fillRect(overlayRect.getX(), overlayRect.getY(), overlayRect.getWidth(), overlayRect.getHeight(), overlay.paint, this.$opc, IFPaintCanvas.CompositeOperator.SourceAtTop);
                }
            }
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
                return value;
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