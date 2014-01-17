(function (_) {
    /**
     * An element representing a layer which can also have child layers
     * @class GXLayer
     * @extends GXLayerBase
     * @constructor
     */
    function GXLayer() {
        GXLayerBase.call(this);
        this._setDefaultProperties(GXLayer.MetaProperties);
    }

    GXNode.inherit("layer", GXLayer, GXLayerBase);

    GXLayer.GUIDE_COLOR_DEFAULT = new GXColor(GXColor.Type.RGB, [0, 255, 255, 100]).asString();

    /**
     * The type of a layer
     * @enum
     */
    GXLayer.Type = {
        /**
         * A vector layer consisting of vector shapes,
         * will make it into the output
         */
        Vector: 'V',

        /**
         * A draft layer consisting of vector shapes
         * but won't make it into the output
         */
        Draft: 'D',

        /**
         * A guide layer consisting of vector shapes
         * but won't make it into the output and is
         * the source of snapping / guides
         */
        Guide: 'G'
    };

    /**
     * The meta properties of a layer and their defaults
     */
    GXLayer.MetaProperties = {
        type: GXLayer.Type.Vector
    };

    /**
     * Localized names for GXLayer.Type
     */
    GXLayer.TypeName = {
        'V': new GLocale.Key(GXLayer, 'type.vector'),
        'D': new GLocale.Key(GXLayer, 'type.draft'),
        'G': new GLocale.Key(GXLayer, 'type.guide')
    };

    /** @override */
    GXLayer.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXLayerSet;
    };

    /** @override */
    GXLayer.prototype.validateRemoval = function () {
        // Layer can only be removed if it is not the last one
        // within the overall scene
        // TODO : Fix this, this is very costly!!
        return this.getScene().queryAll('layer').length > 1;
    };

    /** @override */
    GXLayer.prototype.store = function (blob) {
        if (GXLayerBase.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXLayer.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXLayer.prototype.restore = function (blob) {
        if (GXLayerBase.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXLayer.MetaProperties, true);
            return true;
        }
        return false;
    };

    /** @override */
    GXLayer.prototype._preparePaint = function (context) {
        if (GXLayerBase.prototype._preparePaint.call(this, context)) {
            if (this.$type === GXLayer.Type.Guide) {
                if (!context.configuration.isGuidesVisible(context)) {
                    return false;
                } else if (context.configuration.paintMode !== GXScenePaintConfiguration.PaintMode.Outline && !this.$outline) {
                    // Add outline color of ourself if not outlined
                    context.outlineColors.push(GXColor.parseColor(this.$color).asRGBInt());
                }
            } else if (this.$type === GXLayer.Type.Draft) {
                if (!context.configuration.isAnnotationsVisible(context)) {
                    return false;
                }

                // TODO : Mark draft layers like changing opacity etc.
            }

            return true;
        }
        return false;
    };

    /** @override */
    GXLayer.prototype._finishPaint = function (context) {
        if (this.$type === GXLayer.Type.Guide && context.configuration.paintMode !== GXScenePaintConfiguration.PaintMode.Outline && !this.$outline) {
            // Remove outline color of ourself if not outlined
            context.outlineColors.pop();
        } else if (this.$type === GXLayer.Type.Draft) {
            // TODO : Reset marked draft layers like changed opacity etc.
        }

        GXLayerBase.prototype._finishPaint.call(this, context);
    };

    /** @override */
    GXLayer.prototype._handleChange = function (change, args) {
        if (change == GXNode._Change.AfterPropertiesChange) {
            var typeIndex = args.properties.indexOf('type');
            if (typeIndex >= 0) {
                var oldTypeValue = args.values[typeIndex];

                // Switch type from guide <-> * must reset colors if defaults are set
                if (oldTypeValue === GXLayer.Type.Guide && this.$color === GXLayer.GUIDE_COLOR_DEFAULT) {
                    this.$color = GXLayerBase.MetaProperties.color;
                } else if (this.$type === GXLayer.Type.Guide && this.$color === GXLayerBase.MetaProperties.color) {
                    this.$color = GXLayer.GUIDE_COLOR_DEFAULT;
                }
                this._notifyChange(GXElement._Change.InvalidationRequest);
            }

            if (args.properties.indexOf('color') >= 0) {
                // If we're a guide layer and not outlined then we need a repaint
                if (this.$type === GXLayer.Type.Guide && !this.$outline) {
                    this._notifyChange(GXElement._Change.InvalidationRequest);
                }
            }
        }

        GXLayerBase.prototype._handleChange.call(this, change, args);
    };

    _.GXLayer = GXLayer;
})(this);