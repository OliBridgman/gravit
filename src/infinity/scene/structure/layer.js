(function (_) {
    /**
     * An element representing a layer
     * @class GXLayer
     * @extends GXBlock
     * @mixes GXNode.Container
     * @mixes GXElement.Transform
     * @constructor
     */
    function GXLayer() {
        GXBlock.call(this);
        this._setDefaultProperties(GXLayer.VisualProperties, GXLayer.MetaProperties);
    }

    GXNode.inheritAndMix("layer", GXLayer, GXBlock, [GXNode.Container, GXElement.Transform]);

    GXLayer.GUIDE_COLOR_DEFAULT = new GXColor(GXColor.Type.RGB, [0, 255, 255, 100]);

    /**
     * The tp of a layer
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
        otl: false,
        cls: new GXColor(GXColor.Type.RGB, [0, 168, 255, 100])
    };

    /**
     * The meta properties of a layer with their default values
     */
    GXLayer.MetaProperties = {
        tp: GXLayer.Type.Output
    };

    /**
     * Localized names for GXLayer.Type
     */
    GXLayer.TypeName = {
        'O': new GLocale.Key(GXLayer, 'tp.output'),
        'D': new GLocale.Key(GXLayer, 'tp.draft'),
        'G': new GLocale.Key(GXLayer, 'tp.guide')
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
        if (GXBlock.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXLayer.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return value.asString();
                }
                return value;
            });
            
            this.storeProperties(blob, GXLayer.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXLayer.prototype.restore = function (blob) {
        if (GXBlock.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXLayer.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return GXColor.parseColor(value);
                }
                return value;
            });

            this.restoreProperties(blob, GXLayer.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    GXLayer.prototype._preparePaint = function (context) {
        if (GXBlock.prototype._preparePaint.call(this, context)) {
            if (this.$tp === GXLayer.Type.Guide) {
                if (!context.configuration.isGuidesVisible(context)) {
                    return false;
                } else if (context.configuration.paintMode !== GXScenePaintConfiguration.PaintMode.Outline && !this.$otl) {
                    // Add otl cls of ourself if not outlined
                    context.outlineColors.push(GXColor.parseColor(this.$cls).asRGBInt());
                }
            } else if (this.$tp === GXLayer.Type.Draft) {
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
        if (this.$tp === GXLayer.Type.Guide && context.configuration.paintMode !== GXScenePaintConfiguration.PaintMode.Outline && !this.$otl) {
            // Remove otl cls of ourself if not outlined
            context.outlineColors.pop();
        } else if (this.$tp === GXLayer.Type.Draft) {
            // TODO : Reset marked draft layers like changed opacity etc.
        }

        GXBlock.prototype._finishPaint.call(this, context);
    };

    /** @override */
    GXLayer.prototype._handleChange = function (change, args) {
        if (change == GXNode._Change.AfterPropertiesChange) {
            var typeIndex = args.properties.indexOf('tp');
            if (typeIndex >= 0) {
                var oldTypeValue = args.values[typeIndex];

                // Switch tp from guide <-> * must reset colors if defaults are set
                if (oldTypeValue === GXLayer.Type.Guide && this.$cls === GXLayer.GUIDE_COLOR_DEFAULT) {
                    this.$cls = GXLayer.VisualProperties.cls;
                } else if (this.$tp === GXLayer.Type.Guide && this.$cls === GXLayer.VisualProperties.cls) {
                    this.$cls = GXLayer.GUIDE_COLOR_DEFAULT;
                }
                this._notifyChange(GXElement._Change.InvalidationRequest);
            }

            if (args.properties.indexOf('value') >= 0) {
                // If we're a guide layer and not outlined then we need a repaint
                if (this.$tp === GXLayer.Type.Guide && !this.$otl) {
                    this._notifyChange(GXElement._Change.InvalidationRequest);
                }
            }
        }

        GXBlock.prototype._handleChange.call(this, change, args);
    };

    _.GXLayer = GXLayer;
})(this);