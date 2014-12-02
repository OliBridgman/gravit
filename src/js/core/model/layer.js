(function (_) {
    /**
     * An element representing a layer
     * @class GLayer
     * @extends GBlock
     * @mixes GNode.Container
     * @mixes GElement.Transform
     * @mixes GElement.Stylable
     * @constructor
     */
    function GLayer() {
        GBlock.call(this);
        this._setDefaultProperties(GLayer.VisualProperties, GLayer.MetaProperties);
    }

    GNode.inheritAndMix("layer", GLayer, GBlock, [GNode.Container, GElement.Transform, GElement.Stylable]);

    GLayer.GUIDE_COLOR_DEFAULT = new GRGBColor([0, 255, 255]);

    /**
     * The tp of a layer
     * @enum
     */
    GLayer.Type = {
        /**
         * An output layer, will make it into
         * the actual output
         */
        Output: 'O',

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
     * Localized names for GLayer.Type
     */
    GLayer.TypeName = {
        'O': new GLocale.Key(GLayer, 'type.output'),
        'D': new GLocale.Key(GLayer, 'type.draft'),
        'G': new GLocale.Key(GLayer, 'type.guide')
    };

    /**
     * The meta properties of a layer with their default values
     */
    GLayer.MetaProperties = {
        tp: GLayer.Type.Output
    };

    /**
     * The visual properties of a layer with their default values
     */
    GLayer.VisualProperties = {
        // Whether layer is outlined or not
        otl: false,
        // The color of the layer
        cls: new GRGBColor([0, 168, 255])
    };

    /** @override */
    GLayer.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GLayer || parent instanceof GScene;
    };

    /** @override */
    GLayer.prototype._preparePaint = function (context) {
        if (GBlock.prototype._preparePaint.call(this, context)) {
            if (this.$tp === GLayer.Type.Guide) {
                if (!context.configuration.isGuidesVisible(context)) {
                    return false;
                } else if (context.configuration.paintMode !== GScenePaintConfiguration.PaintMode.Outline && !this.$otl) {
                    // Add outline color if not outline to behave like a guide layer means
                    // to paint everything underneath in outline color
                    context.outlineColors.push(this.$cls);
                }
            } else if (this.$tp === GLayer.Type.Draft) {
                if (!context.configuration.isAnnotationsVisible(context)) {
                    return false;
                }

                // TODO : Mark draft layers like changing opacity etc.
            }

            if (context.configuration.paintMode !== GScenePaintConfiguration.PaintMode.Outline && this.$otl) {
                context.outlineColors.push(this.$cls);
            }

            return true;
        }
        return false;
    };

    /** @override */
    GLayer.prototype._finishPaint = function (context) {
        if (this.$tp === GLayer.Type.Guide && context.configuration.paintMode !== GScenePaintConfiguration.PaintMode.Outline && !this.$otl) {
            // Remove outline color if not outlined
            context.outlineColors.pop();
        } else if (this.$tp === GLayer.Type.Draft) {
            // TODO : Reset marked draft layers like changed opacity etc.
        }

        if (context.configuration.paintMode !== GScenePaintConfiguration.PaintMode.Outline && this.$otl) {
            context.outlineColors.pop();
        }

        GBlock.prototype._finishPaint.call(this, context);
    };

    /** @override */
    GLayer.prototype._paintStyleContent = function (context, contentPaintBBox, styleLayers, orderedEffects, effectCanvas) {
        this._paintChildren(context);
    };

    /** @override */
    GLayer.prototype._detailHitTest = function (location, transform, tolerance, force) {
        return new GElement.HitResultInfo(this);
    };

    /** @override */
    GLayer.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GLayer.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return GPattern.serialize(value);
                }
                return value;
            });
            this.storeProperties(args, GLayer.MetaProperties);

            // Store activeness flag which is special to pages and layers
            if (this.hasFlag(GNode.Flag.Active)) {
                args.__active = true;
            }
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GLayer.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return GPattern.deserialize(value);
                }
                return value;
            });
            this.restoreProperties(args, GLayer.MetaProperties);

            // Restore activeness flag which is special to pages and layers
            if (args.__active) {
                this.setFlag(GNode.Flag.Active);
            }
        }
        
        this._handleVisualChangeForProperties(change, args, GLayer.VisualProperties);

        if (change == GNode._Change.AfterPropertiesChange) {
            var typeIndex = args.properties.indexOf('tp');
            if (typeIndex >= 0) {
                var oldTypeValue = args.values[typeIndex];

                // Switch tp from guide <-> * must reset colors if defaults are set
                if (oldTypeValue === GLayer.Type.Guide && this.$cls === GLayer.GUIDE_COLOR_DEFAULT) {
                    this.$cls = GLayer.VisualProperties.cls;
                } else if (this.$tp === GLayer.Type.Guide && this.$cls === GLayer.VisualProperties.cls) {
                    this.$cls = GLayer.GUIDE_COLOR_DEFAULT;
                }
                this._notifyChange(GElement._Change.InvalidationRequest);
            }
        }

        GBlock.prototype._handleChange.call(this, change, args);
    };

    _.GLayer = GLayer;
})(this);