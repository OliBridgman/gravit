(function (_) {
    /**
     * The style class
     * @class IFStyle
     * @extends IFNode
     * @mixes IFNode.Store
     * @mixes IFNode.Properties
     * @constructor
     */
    function IFStyle() {
        IFNode.call(this);
        this._setDefaultProperties(IFStyle.VisualProperties, IFStyle.GeometryProperties);
    }

    IFNode.inheritAndMix("style", IFStyle, IFNode, [IFNode.Store, IFNode.Properties]);

    /**
     * The layer of a style rendering
     * @enum
     */
    IFStyle.Layer = {
        /**
         * Background Layer
         */
        Background: 'B',

        /**
         * Content Layer
         */
        Content: 'C',

        /**
         * Foreground Layer
         */
        Foreground: 'F'
    };

    /**
     * Alignment of a stroke
     * @enum
     */
    IFStyle.StrokeAlignment = {
        /**
         * Center alignment
         */
        Center: 'C',

        /**
         * Outside alignment
         */
        Outside: 'O',

        /**
         * Inside alignment
         */
        Inside: 'I'
    };

    /**
     * Visual Properties for a style
     * @enum
     */
    IFStyle.VisualProperties = {
        // Blend Mode
        blm: IFPaintCanvas.BlendMode.Normal,
        // Fill Opacity (= w/o filters)
        fop: 1,
        // Opacity (= total opacity w/ filters)
        opc: 1,
        // Fill pattern (IFPattern)
        fpt: null,
        // Stroke pattern (IFPattern)
        spt: IFColor.BLACK,
    };

    /**
     * Geometry Properties for a style
     * @enum
     */
    IFStyle.GeometryProperties = {
        // Stroke width
        sw: 1,
        // Stroke alignment
        sa: IFStyle.StrokeAlignment.Center,
        // Stroke Line-Caption
        slc: IFPaintCanvas.LineCap.Square,
        // Stroke Line-Join
        slj: IFPaintCanvas.LineJoin.Miter,
        // Stroke Line-Miter-Limit
        slm: 10
    };

    /**
     * Returns if this style has a paintable stroke or not
     * @returns {boolean}
     */
    IFStyle.prototype.hasStroke = function () {
        // TODO : Test stroke pattern opacity
        return !!this.$spt && this.$sw > 0;
    };

    /**
     * Returns if this style has a paintable fill or not
     * @returns {boolean}
     */
    IFStyle.prototype.hasFill = function () {
        // TODO : Test fill pattern opacity
        return !!this.$fpt;
    };

    /**
     * Returns the bounding box of the style
     * @param {IFRect} source the source bbox
     * @param {boolean} [effectsOnly] if set, only
     * effects will be honored
     * @returns {IFRect}
     */
    IFStyle.prototype.getBBox = function (source, effectsOnly) {
        var left = 0;
        var top = 0;
        var right = 0;
        var bottom = 0;

        // Add stroke to paddings
        if (this.hasStroke() && !effectsOnly) {
            if (this.$sa === IFStyle.StrokeAlignment.Center) {
                var sw2 = this.$sw / 2;
                left += sw2;
                top += sw2;
                right += sw2;
                bottom += sw2;
            } else if (this.$sa === IFStyle.StrokeAlignment.Outside) {
                left += this.$sw;
                top += this.$sw;
                right += this.$sw;
                bottom += this.$sw;
            }
        }

        var bbox = source.expanded(left, top, right, bottom);

        // Due to pixel aligning, we may need extra half pixel in some cases
        var paintExtraExpand = [0, 0, 0, 0];
        if (bbox.getX() != Math.floor(bbox.getX())) {
            paintExtraExpand[0] = 0.5;
        }
        if (bbox.getY() != Math.floor(bbox.getY())) {
            paintExtraExpand[1] = 0.5;
        }
        var br = bbox.getSide(IFRect.Side.BOTTOM_RIGHT);
        if (br.getX() != Math.ceil(br.getX())) {
            paintExtraExpand[2] = 0.5;
        }
        if (br.getY() != Math.ceil(br.getY())) {
            paintExtraExpand[3] = 0.5;
        }

        return bbox.expanded(paintExtraExpand[0], paintExtraExpand[1], paintExtraExpand[2], paintExtraExpand[3]);
    };

    /** @override */
    IFStyle.prototype._handleChange = function (change, args) {
        if (change == IFNode._Change.BeforePropertiesChange) {
            if (ifUtil.containsObjectKey(args.properties, IFStyle.GeometryProperties)) {
                if (this._parent && this._parent instanceof IFElement) {
                    this._parent._notifyChange(IFElement._Change.PrepareGeometryUpdate);
                }
            }
        } else if (change == IFNode._Change.AfterPropertiesChange) {
            if (ifUtil.containsObjectKey(args.properties, IFStyle.GeometryProperties)) {
                if (this._parent && this._parent instanceof IFElement) {
                    this._parent._notifyChange(IFElement._Change.FinishGeometryUpdate);
                }
            } else if (ifUtil.containsObjectKey(args.properties, IFStyle.VisualProperties)) {
                if (this._parent && this._parent instanceof IFElement) {
                    this._parent._notifyChange(IFElement._Change.InvalidationRequest);
                }
            }
        } else if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFStyle.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'fpt' || property === 'spt') {
                        return IFPattern.asString(value);
                    }
                }
                return value;
            });

            this.storeProperties(args, IFStyle.GeometryProperties);
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFStyle.VisualProperties, function (property, value) {
                if (value) {
                    if (property === 'fpt' || property === 'spt') {
                        return IFPattern.parsePattern(value);
                    }
                }
                return value;
            });

            this.restoreProperties(args, IFStyle.GeometryProperties);
        }

        IFNode.prototype._handleChange.call(this, change, args);
    };

    _.IFStyle = IFStyle;
})(this);