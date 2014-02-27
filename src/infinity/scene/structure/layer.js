(function (_) {
    /**
     * An element representing a layer
     * @class GXLayer
     * @extends GXItemContainer
     * @constructor
     */
    function GXLayer() {
        GXItemContainer.call(this);
        this._setDefaultProperties(GXLayer.VisualProperties, GXLayer.MetaProperties);
    }

    GXNode.inherit("layer", GXLayer, GXItemContainer);

    GXLayer.GUIDE_COLOR_DEFAULT = new GXColor(GXColor.Type.RGB, [0, 255, 255, 100]).asString();

    /**
     * The type of a layer
     * @enum
     */
    GXLayer.Type = {
        /**
         * An output layer, will make it into
         * the actual output
         */
        Output: 'Output',

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
     * The visual properties of a layer with their default values
     */
    GXLayer.VisualProperties = {
        outline: false,
        color: new GXColor(GXColor.Type.RGB, [0, 168, 255, 100]).asString()
    };

    /**
     * The meta properties of a layer with their default values
     */
    GXLayer.MetaProperties = {
        type: GXLayer.Type.Output
    };

    /**
     * Localized names for GXLayer.Type
     */
    GXLayer.TypeName = {
        'O': new GLocale.Key(GXLayer, 'type.output'),
        'D': new GLocale.Key(GXLayer, 'type.draft'),
        'G': new GLocale.Key(GXLayer, 'type.guide')
    };

    /** @override */
    GXLayer.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXLayer || parent instanceof GXPage || parent instanceof GXScene;
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
        if (GXItemContainer.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXLayer.VisualProperties);
            this.storeProperties(blob, GXLayer.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXLayer.prototype.restore = function (blob) {
        if (GXItemContainer.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXLayer.VisualProperties);
            this.restoreProperties(blob, GXLayer.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXLayer.prototype._preparePaint = function (context) {
        if (GXItemContainer.prototype._preparePaint.call(this, context)) {
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

        GXItemContainer.prototype._finishPaint.call(this, context);
    };

    /** @override */
    GXLayer.prototype._handleChange = function (change, args) {
        if (change == GXNode._Change.AfterPropertiesChange) {
            var typeIndex = args.properties.indexOf('type');
            if (typeIndex >= 0) {
                var oldTypeValue = args.values[typeIndex];

                // Switch type from guide <-> * must reset colors if defaults are set
                if (oldTypeValue === GXLayer.Type.Guide && this.$color === GXLayer.GUIDE_COLOR_DEFAULT) {
                    this.$color = GXLayer.VisualProperties.color;
                } else if (this.$type === GXLayer.Type.Guide && this.$color === GXLayer.VisualProperties.color) {
                    this.$color = GXLayer.GUIDE_COLOR_DEFAULT;
                }
                this._notifyChange(GXElement._Change.InvalidationRequest);
            }

            if (args.properties.indexOf('value') >= 0) {
                // If we're a guide layer and not outlined then we need a repaint
                if (this.$type === GXLayer.Type.Guide && !this.$outline) {
                    this._notifyChange(GXElement._Change.InvalidationRequest);
                }
            }
        }

        GXItemContainer.prototype._handleChange.call(this, change, args);
    };

    _.GXLayer = GXLayer;
})(this);