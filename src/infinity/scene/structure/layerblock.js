(function (_) {
    /**
     * An element representing a layer block which is the base for layers, layerSets etc.
     * @class IFLayerBlock
     * @extends IFBlock
     * @mixes IFNode.Container
     * @mixes IFElement.Transform
     * @constructor
     */
    function IFLayerBlock() {
        IFBlock.call(this);
        this._setDefaultProperties(IFLayerBlock.VisualProperties, IFLayerBlock.MetaProperties);
    }

    IFObject.inheritAndMix(IFLayerBlock, IFBlock, [IFNode.Container, IFElement.Transform]);

    IFLayerBlock.GUIDE_COLOR_DEFAULT = new IFColor(IFColor.Type.RGB, [0, 255, 255, 100]);

    /**
     * The tp of a layer
     * @enum
     */
    IFLayerBlock.Type = {
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
     * Localized names for IFLayerBlock.Type
     */
    IFLayerBlock.TypeName = {
        'O': new IFLocale.Key(IFLayerBlock, 'type.output'),
        'D': new IFLocale.Key(IFLayerBlock, 'type.draft'),
        'G': new IFLocale.Key(IFLayerBlock, 'type.guide')
    };

    /**
     * The meta properties of a layer with their default values
     */
    IFLayerBlock.MetaProperties = {
        tp: IFLayerBlock.Type.Output
    };

    /**
     * The visual properties of a layer with their default values
     */
    IFLayerBlock.VisualProperties = {
        // Whether layer is outlined or not
        otl: false,
        // The color of the layer
        cls: new IFColor(IFColor.Type.RGB, [0, 168, 255, 100])
    };

    /** @override */
    IFLayerBlock.prototype.store = function (blob) {
        if (IFBlock.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFLayerBlock.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return value.asString();
                }
                return value;
            });
            this.storeProperties(blob, IFLayerBlock.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFLayerBlock.prototype.restore = function (blob) {
        if (IFBlock.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFLayerBlock.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return IFColor.parseColor(value);
                }
                return value;
            });
            this.restoreProperties(blob, IFLayerBlock.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFLayerBlock.prototype._preparePaint = function (context) {
        if (IFBlock.prototype._preparePaint.call(this, context)) {
            if (this.$tp === IFLayerBlock.Type.Guide) {
                if (!context.configuration.isGuidesVisible(context)) {
                    return false;
                } else if (context.configuration.paintMode !== IFScenePaintConfiguration.PaintMode.Outline && !this.$otl) {
                    // Add outline color if not outline to behave like a guide layer means
                    // to paint everything underneath in outline color
                    context.outlineColors.push(this.$cls);
                }
            } else if (this.$tp === IFLayerBlock.Type.Draft) {
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
    IFLayerBlock.prototype._finishPaint = function (context) {
        if (this.$tp === IFLayerBlock.Type.Guide && context.configuration.paintMode !== IFScenePaintConfiguration.PaintMode.Outline && !this.$otl) {
            // Remove outline color if not outlined
            context.outlineColors.pop();
        } else if (this.$tp === IFLayerBlock.Type.Draft) {
            // TODO : Reset marked draft layers like changed opacity etc.
        }

        if (context.configuration.paintMode !== IFScenePaintConfiguration.PaintMode.Outline && this.$otl) {
            context.outlineColors.pop();
        }

        IFBlock.prototype._finishPaint.call(this, context);
    };

    /** @override */
    IFLayerBlock.prototype._handleChange = function (change, args) {
        this._handleVisualChangeForProperties(change, args, IFLayerBlock.VisualProperties);

        if (change == IFNode._Change.AfterPropertiesChange) {
            var typeIndex = args.properties.indexOf('tp');
            if (typeIndex >= 0) {
                var oldTypeValue = args.values[typeIndex];

                // Switch tp from guide <-> * must reset colors if defaults are set
                if (oldTypeValue === IFLayerBlock.Type.Guide && this.$cls === IFLayerBlock.GUIDE_COLOR_DEFAULT) {
                    this.$cls = IFLayerBlock.VisualProperties.cls;
                } else if (this.$tp === IFLayerBlock.Type.Guide && this.$cls === IFLayerBlock.VisualProperties.cls) {
                    this.$cls = IFLayerBlock.GUIDE_COLOR_DEFAULT;
                }
                this._notifyChange(IFElement._Change.InvalidationRequest);
            }
        }

        IFBlock.prototype._handleChange.call(this, change, args);
    };

    _.IFLayerBlock = IFLayerBlock;
})(this);