(function (_) {
    /**
     * An element representing a layer
     * @class IFLayer
     * @extends IFBlock
     * @mixes IFNode.Container
     * @mixes IFElement.Transform
     * @constructor
     */
    function IFLayer() {
        IFBlock.call(this);
        this._setDefaultProperties(IFLayer.VisualProperties, IFLayer.MetaProperties);
    }

    IFNode.inheritAndMix("layer", IFLayer, IFBlock, [IFNode.Container, IFElement.Transform]);

    IFLayer.GUIDE_COLOR_DEFAULT = new IFColor(IFColor.Type.RGB, [0, 255, 255, 100]);

    /**
     * The tp of a layer
     * @enum
     */
    IFLayer.Type = {
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
    IFLayer.VisualProperties = {
        otl: false,
        cls: new IFColor(IFColor.Type.RGB, [0, 168, 255, 100])
    };

    /**
     * The meta properties of a layer with their default values
     */
    IFLayer.MetaProperties = {
        tp: IFLayer.Type.Output
    };

    /**
     * Localized names for IFLayer.Type
     */
    IFLayer.TypeName = {
        'O': new IFLocale.Key(IFLayer, 'tp.output'),
        'D': new IFLocale.Key(IFLayer, 'tp.draft'),
        'G': new IFLocale.Key(IFLayer, 'tp.guide')
    };

    /** @override */
    IFLayer.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFLayer || parent instanceof IFPage || parent instanceof IFScene;
    };

    /** @override */
    IFLayer.prototype.store = function (blob) {
        if (IFBlock.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFLayer.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return value.asString();
                }
                return value;
            });
            
            this.storeProperties(blob, IFLayer.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFLayer.prototype.restore = function (blob) {
        if (IFBlock.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFLayer.VisualProperties, function (property, value) {
                if (property === 'cls' && value) {
                    return IFColor.parseColor(value);
                }
                return value;
            });

            this.restoreProperties(blob, IFLayer.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFLayer.prototype._preparePaint = function (context) {
        if (IFBlock.prototype._preparePaint.call(this, context)) {
            if (this.$tp === IFLayer.Type.Guide) {
                if (!context.configuration.isGuidesVisible(context)) {
                    return false;
                } else if (context.configuration.paintMode !== IFScenePaintConfiguration.PaintMode.Outline && !this.$otl) {
                    // Add otl cls of ourself if not outlined
                    context.outlineColors.push(this.$cls);
                }
            } else if (this.$tp === IFLayer.Type.Draft) {
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
    IFLayer.prototype._finishPaint = function (context) {
        if (this.$tp === IFLayer.Type.Guide && context.configuration.paintMode !== IFScenePaintConfiguration.PaintMode.Outline && !this.$otl) {
            // Remove otl cls of ourself if not outlined
            context.outlineColors.pop();
        } else if (this.$tp === IFLayer.Type.Draft) {
            // TODO : Reset marked draft layers like changed opacity etc.
        }

        IFBlock.prototype._finishPaint.call(this, context);
    };

    /** @override */
    IFLayer.prototype._handleChange = function (change, args) {
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

            if (args.properties.indexOf('value') >= 0) {
                // If we're a guide layer and not outlined then we need a repaint
                if (this.$tp === IFLayer.Type.Guide && !this.$otl) {
                    this._notifyChange(IFElement._Change.InvalidationRequest);
                }
            }
        }

        IFBlock.prototype._handleChange.call(this, change, args);
    };

    _.IFLayer = IFLayer;
})(this);