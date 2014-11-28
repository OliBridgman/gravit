(function (_) {
    /**
     * Blur effect
     * @class GOverlayEffect
     * @extends GEffect
     * @constructor
     */
    GOverlayEffect = function () {
        GEffect.call(this);
        this._setDefaultProperties(GOverlayEffect.VisualProperties);
    };
    GNode.inherit('overlayEffect', GOverlayEffect, GEffect);

    GOverlayEffect.equals = function (left, right) {
        if (left instanceof GOverlayEffect && right instanceof  GOverlayEffect) {
            return left.arePropertiesEqual(right, Object.keys(GOverlayEffect.VisualProperties));
        }
        return false;
    };

    /**
     * Visual properties of an overlay effect
     */
    GOverlayEffect.VisualProperties = {
        /** The overlay pattern (GPattern) */
        pat: GRGBColor.BLACK,
        /** Overlay opacity */
        opc: 0.5
    };

    /** @override */
    GOverlayEffect.prototype.getEffectType = function () {
        return GEffect.Type.Filter;
    };

    /** @override */
    GOverlayEffect.prototype.render = function (contents, output, background, scale) {
        if (this.$pat && this.$opc > 0.0) {
            // Fill our whole canvas with the overlay pattern clipped by the source
            var overlayRect = contents.getTransform(false).inverted().mapRect(new GRect(0, 0, contents.getWidth(), contents.getHeight()));
            var overlay = contents.createPatternPaint(this.$pat, overlayRect);
            if (overlay) {
                if (overlay.transform) {
                    var oldTransform = contents.setTransform(contents.getTransform(true).preMultiplied(overlay.transform));
                    contents.fillRect(0, 0, 1, 1, overlay.paint, this.$opc, GPaintCanvas.CompositeOperator.SourceAtTop);
                    contents.setTransform(oldTransform);
                } else {
                    contents.fillRect(overlayRect.getX(), overlayRect.getY(), overlayRect.getWidth(), overlayRect.getHeight(), overlay.paint, this.$opc, GPaintCanvas.CompositeOperator.SourceAtTop);
                }
            }
        }
    };

    /** @override */
    GOverlayEffect.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GOverlayEffect.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat') {
                        return GPattern.serialize(value);
                    }
                }
                return value;
            });
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GOverlayEffect.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'pat') {
                        return GPattern.deserialize(value);
                    }
                }
                return value;
            });
        }

        this._handleVisualChangeForProperties(change, args, GOverlayEffect.VisualProperties);

        GEffect.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GOverlayEffect.prototype.toString = function () {
        return "[Object GOverlayEffect]";
    };

    _.GOverlayEffect = GOverlayEffect;
})(this);