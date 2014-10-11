(function (_) {
    /**
     * An element representing a layer
     * @class IFLayer
     * @extends IFBlock
     * @mixes IFNode.Container
     * @mixes IFElement.Transform
     * @mixes IFElement.Stylable
     * @constructor
     */
    function IFLayer() {
        IFBlock.call(this);
        this._setDefaultProperties(IFLayer.VisualProperties, IFLayer.MetaProperties);
    }

    IFNode.inheritAndMix("layer", IFLayer, IFBlock, [IFNode.Container, IFElement.Transform, IFElement.Stylable]);

    IFLayer.GUIDE_COLOR_DEFAULT = new IFRGBColor([0, 255, 255]);

    /**
     * The tp of a layer
     * @enum
     */
    IFLayer.Type = {
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
     * Localized names for IFLayer.Type
     */
    IFLayer.TypeName = {
        'O': new IFLocale.Key(IFLayer, 'type.output'),
        'D': new IFLocale.Key(IFLayer, 'type.draft'),
        'G': new IFLocale.Key(IFLayer, 'type.guide')
    };

    /**
     * The meta properties of a layer with their default values
     */
    IFLayer.MetaProperties = {
        tp: IFLayer.Type.Output
    };

    /**
     * The visual properties of a layer with their default values
     */
    IFLayer.VisualProperties = {
        // Whether layer is outlined or not
        otl: false,
        // The color of the layer
        cls: new IFRGBColor([0, 168, 255])
    };

    /** @override */
    IFLayer.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFLayer || parent instanceof IFPage;
    };

    /** @override */
    IFLayer.prototype._preparePaint = function (context) {
        if (IFBlock.prototype._preparePaint.call(this, context)) {
            if (this.$tp === IFLayer.Type.Guide) {
                if (!context.configuration.isGuidesVisible(context)) {
                    return false;
                } else if (context.configuration.paintMode !== IFScenePaintConfiguration.PaintMode.Outline && !this.$otl) {
                    // Add outline color if not outline to behave like a guide layer means
                    // to paint everything underneath in outline color
                    context.outlineColors.push(this.$cls);
                }
            } else if (this.$tp === IFLayer.Type.Draft) {
                if (!context.configuration.isAnnotationsVisible(context)) {
                    return false;
                }

                // TODO : Mark draft layers like changing opacity etc.
            }

            if (context.configuration.paintMode !== IFScenePaintConfiguration.PaintMode.Outline && this.$otl) {
                context.outlineColors.push(this.$cls);
            }

            return true;
        }
        return false;
    };

    /** @override */
    IFLayer.prototype._finishPaint = function (context) {
        if (this.$tp === IFLayer.Type.Guide && context.configuration.paintMode !== IFScenePaintConfiguration.PaintMode.Outline && !this.$otl) {
            // Remove outline color if not outlined
            context.outlineColors.pop();
        } else if (this.$tp === IFLayer.Type.Draft) {
            // TODO : Reset marked draft layers like changed opacity etc.
        }

        if (context.configuration.paintMode !== IFScenePaintConfiguration.PaintMode.Outline && this.$otl) {
            context.outlineColors.pop();
        }

        IFBlock.prototype._finishPaint.call(this, context);
    };

    /** @override */
    IFLayer.prototype._paintStyleContent = function (context, contentPaintBBox, styleLayers, orderedEffects, effectCanvas) {
        this._paintChildren(context);
    };

    /** @override */
    IFLayer.prototype._detailHitTest = function (location, transform, tolerance, force) {
        return new IFElement.HitResultInfo(this);
    };

    /** @override */
    IFLayer.prototype._handleChange = function (change, args) {
        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFLayer.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return IFPattern.serialize(value);
                }
                return value;
            });
            this.storeProperties(args, IFLayer.MetaProperties);

            // Store activeness flag which is special to pages and layers
            if (this.hasFlag(IFNode.Flag.Active)) {
                args.__active = true;
            }
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFLayer.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return IFPattern.deserialize(value);
                }
                return value;
            });
            this.restoreProperties(args, IFLayer.MetaProperties);

            // Restore activeness flag which is special to pages and layers
            if (args.__active) {
                this.setFlag(IFNode.Flag.Active);
            }
        }
        
        this._handleVisualChangeForProperties(change, args, IFLayer.VisualProperties);

        if (change == IFNode._Change.AfterPropertiesChange) {
            var typeIndex = args.properties.indexOf('tp');
            if (typeIndex >= 0) {
                var oldTypeValue = args.values[typeIndex];

                // Switch tp from guide <-> * must reset colors if defaults are set
                if (oldTypeValue === IFLayer.Type.Guide && this.$cls === IFLayer.GUIDE_COLOR_DEFAULT) {
                    this.$cls = IFLayer.VisualProperties.cls;
                } else if (this.$tp === IFLayer.Type.Guide && this.$cls === IFLayer.VisualProperties.cls) {
                    this.$cls = IFLayer.GUIDE_COLOR_DEFAULT;
                }
                this._notifyChange(IFElement._Change.InvalidationRequest);
            }
        }

        IFBlock.prototype._handleChange.call(this, change, args);
    };

    _.IFLayer = IFLayer;
})(this);