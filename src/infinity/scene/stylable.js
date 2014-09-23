(function (_) {
    /**
     * Mixin to mark something containing a style
     * @class IFStylable
     * @constructor
     * @mixin
     */
    IFStylable = function () {
    };

    /**
     * The layer of a style
     * @enum
     */
    IFStylable.Layer = {
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
     * The property set of a style
     * @enum
     */
    IFStylable.PropertySet = {
        Style: 'S',
        Effects: 'E',
        Fill: 'F',
        Border: 'B',
        Text: 'T',
        Paragraph: 'P'
    };

    /**
     * Alignment of a border
     * @enum
     */
    IFStylable.BorderAlignment = {
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
     * Alignment of a paragraph
     * @enum
     */
    IFStylable.ParagraphAlignment = {
        Left: 'l',
        Center: 'c',
        Right: 'r',
        Justify: 'j'
    };

    /**
     * Wrap-Mode of a paragraph
     * @enum
     */
    IFStylable.ParagraphWrapMode = {
        /**
         * No word-break
         */
        None: 'n',

        /**
         * Break after words only
         */
        Words: 'w',

        /**
         * Break anywhere including characters
         */
        All: 'a'
    };

    /**
     * Visual Properties for a style
     * @enum
     */
    IFStylable.VisualStyleProperties = {
        /** Internal default style marker */
        _sdf: null,
        /** Blend Mode (IFPaintCanvas.BlendMode|'mask') */
        _sbl: IFPaintCanvas.BlendMode.Normal,
        /** Fill Opacity (= w/o effects) */
        _sfop: 1,
        /** Opacity (= total opacity w/ effects) */
        _stop: 1
    };

    /**
     * Geometry Properties for effects
     * @enum
     */
    IFStylable.GeometryFilterProperties = {
        /** Blurs ({}) */
        _eblr: null
    };

    /**
     * Visual Properties for a style fill
     * @enum
     */
    IFStylable.VisualFillProperties = {
        /** Fill pattern (IFPattern) */
        _fpt: null,
        /** Fill opacity */
        _fop: 1,
        /** Horizontal Fill translation (0..1) % */
        _ftx: 0,
        /** Vertical Fill translation (0..1) % */
        _fty: 0,
        /** Horizontal Fill Scalation (0..1) % */
        _fsx: 1,
        /** Vertical Fill Scalation (0..1) % */
        _fsy: 1,
        /** Fill Rotation in radians */
        _frt: 0
    };

    /**
     * Visual Properties for a style border
     * @enum
     */
    IFStylable.VisualBorderProperties = {
        /** Border opacity */
        _bop: 1,
        /** Horizontal Border translation (0..1) % */
        _btx: 0,
        /** Vertical Border translation (0..1) % */
        _bty: 0,
        /** Horizontal Border Scalation (0..1) % */
        _bsx: 1,
        /** Vertical Border Scalation (0..1) % */
        _bsy: 1,
        /** Border Rotation in radians */
        _brt: 0
    };

    /**
     * Geometry Properties for a style border
     * @enum
     */
    IFStylable.GeometryBorderProperties = {
        /** Border pattern (IFPattern) */
        _bpt: null,
        /** Border Width */
        _bw: 1,
        /** Border Alignment */
        _ba: IFStylable.BorderAlignment.Center,
        /** Line-Caption */
        _blc: IFPaintCanvas.LineCap.Square,
        /** Line-Join */
        _blj: IFPaintCanvas.LineJoin.Miter,
        /** Miter-Limit */
        _bml: 3
    };

    /**
     * Geometry Properties for a style text
     * @enum
     */
    IFStylable.GeometryTextProperties = {
        /** The font family */
        _tff: 'Open Sans',
        /** The font size */
        _tfi: 20,
        /** The font-weight (IFFont.Weight) */
        _tfw: IFFont.Weight.Regular,
        /** The font-style (IFFont.Style) */
        _tfs: IFFont.Style.Normal,
        /** The character spacing */
        _tcs: null,
        /** The word spacing */
        _tws: null
    };

    /**
     * Geometry Properties for a style paragraph
     * @enum
     */
    IFStylable.GeometryParagraphProperties = {
        /** Column count */
        _pcc: null,
        /** Column gap */
        _pcg: null,
        /** Wrap-Mode of a paragraph (IFStylable.ParagraphWrapMode) */
        _pwm: IFStylable.ParagraphWrapMode.Words,
        /** The paragraph's alignment (IFStylable.ParagraphAlignment) */
        _pal: null,
        /** The first line intendation */
        _pin: null,
        /** The line height whereas 1 = 100% */
        _plh: 1
    };

    /**
     * The property-sets this stylable supports
     * @returns {Array<IFStylable.PropertySet>} list of supported
     * property sets
     * @private
     */
    IFStylable.prototype.getStylePropertySets = function () {
        return [IFStylable.PropertySet.Style, IFStylable.PropertySet.Effects];
    };

    /**
     * Assign style from a source style
     * @param {IFStylable} source
     * @param {*} [diffProperties] If provided, should contain property->value
     * entries that are used for comparing whether to assign a property value or not.
     * If the property value to be assigned doesn't equal the one in this parameter,
     * it will not be overwritten. If this is provided, also only the given properties
     * will be assigned, all others will be ignored.
     */
    IFStylable.prototype.assignStyleFrom = function (source, diffProperties) {
        // Collect union property sets
        var sourcePS = source.getStylePropertySets();
        var myPS = this.getStylePropertySets();
        var unionPS = [];

        for (var i = 0; i < sourcePS.length; ++i) {
            var ps = sourcePS[i];
            for (var j = 0; j < myPS.length; ++j) {
                if (myPS[j] === ps) {
                    unionPS.push(ps);
                    break;
                }
            }
        }

        if (unionPS.length > 0) {
            var propertySets = [];
            for (var i = 0; i < unionPS.length; ++i) {
                switch (unionPS[i]) {
                    case IFStylable.PropertySet.Style:
                        propertySets.push(IFStylable.VisualStyleProperties);
                        break;
                    case IFStylable.PropertySet.Fill:
                        propertySets.push(IFStylable.VisualFillProperties);
                        break;
                    case IFStylable.PropertySet.Border:
                        propertySets.push(IFStylable.VisualBorderProperties);
                        propertySets.push(IFStylable.GeometryBorderProperties);
                        break;
                    case IFStylable.PropertySet.Text:
                        propertySets.push(IFStylable.GeometryTextProperties);
                        break;
                    case IFStylable.PropertySet.Paragraph:
                        propertySets.push(IFStylable.GeometryParagraphProperties);
                        break;
                }
            }

            var sourceProperties = [];
            for (var p = 0; p < propertySets.length; ++p) {
                var propertySet = propertySets[p];
                for (var property in propertySet) {
                    var addProperty = true;

                    if (diffProperties) {
                        // Only assign property if it is contained in diff properties and
                        // when it has the same value as in diff properties
                        var myPropVal = this.getProperty(property);
                        var diffPropVal = diffProperties[property];
                        var srcPropVal = source.getProperty(property);
                        addProperty = diffProperties.hasOwnProperty(property) && (ifUtil.equals(myPropVal, diffPropVal) || ifUtil.equals(myPropVal, srcPropVal));
                    }

                    if (addProperty && property !== '_sdf') {
                        sourceProperties.push(property);
                    }
                }
            }

            if (sourceProperties.length > 0) {
                var sourceValues = source.getProperties(sourceProperties);
                this.setProperties(sourceProperties, sourceValues, false, true /*force*/);
            }
        }
    };

    /**
     * Returns whether a paintable border is available or not
     * @returns {boolean}
     */
    IFStylable.prototype.hasStyleBorder = function () {
        return !!this.$_bpt && this.$_bw > 0.0 && this.$_bop > 0.0;
    };

    /**
     * Returns whether a paintable fill is available or not
     * @returns {boolean}
     */
    IFStylable.prototype.hasStyleFill = function (stylable) {
        return !!this.$_fpt && this.$_fop > 0.0;
    };

    /**
     * Returns the required padding for the currently setup border
     * @returns {Number}
     */
    IFStylable.prototype.getStyleBorderPadding = function () {
        // Padding depends on border-width and alignment and miter limit if miter join is used
        if (this.$_ba === IFStylable.BorderAlignment.Center) {
            return this.$_bw / 2;
        } else if (this.$_ba === IFStylable.BorderAlignment.Outside) {
            return this.$_bw;
        }
        return 0;
    }

    /**
     * Returns the painted style bounding box
     * @param {IFRect} source the source bbox
     * @param {Boolean} [miterLimitApproximation] if true, takes the miter limit
     * into account calculating a bigger style bbox than it actually might be.
     * @returns {IFRect}
     */
    IFStylable.prototype.getStyleBBox = function (source, miterLimitApproximation) {
        var propertySets = this.getStylePropertySets();

        var left = 0;
        var top = 0;
        var right = 0;
        var bottom = 0;

        // Add border to paddings
        if (this.hasStyleBorder() && propertySets.indexOf(IFStylable.PropertySet.Border) >= 0) {
            var borderPadding = this.getStyleBorderPadding();
            if (borderPadding) {
                if (miterLimitApproximation && this.$_blj === IFPaintCanvas.LineJoin.Miter && this.$_bml > 0) {
                    borderPadding *= this.$_bml;
                }

                left += borderPadding;
                top += borderPadding;
                right += borderPadding;
                bottom += borderPadding;
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

    /**
     * Set the style default properties
     */
    IFStylable.prototype._setStyleDefaultProperties = function () {
        var propertySets = this.getStylePropertySets();

        if (propertySets.indexOf(IFStylable.PropertySet.Style) >= 0) {
            this._setDefaultProperties(IFStylable.VisualStyleProperties);
        }

        if (propertySets.indexOf(IFStylable.PropertySet.Fill) >= 0) {
            this._setDefaultProperties(IFStylable.VisualFillProperties);
        }

        if (propertySets.indexOf(IFStylable.PropertySet.Border) >= 0) {
            this._setDefaultProperties(IFStylable.VisualBorderProperties, IFStylable.GeometryBorderProperties);
        }

        if (propertySets.indexOf(IFStylable.PropertySet.Text) >= 0) {
            this._setDefaultProperties(IFStylable.GeometryTextProperties);
        }

        if (propertySets.indexOf(IFStylable.PropertySet.Paragraph) >= 0) {
            this._setDefaultProperties(IFStylable.GeometryParagraphProperties);
        }
    };

    /**
     * Change handler for styles
     * @param {Number} change
     * @param {*} args
     */
    IFStylable.prototype._handleStyleChange = function (change, args) {
        if (change === IFNode._Change.BeforePropertiesChange) {
            var propertySets = this.getStylePropertySets();
            if ((propertySets.indexOf(IFStylable.PropertySet.Border) >= 0 && ifUtil.containsObjectKey(args.properties, IFStylable.GeometryBorderProperties)) ||
                (propertySets.indexOf(IFStylable.PropertySet.Text) >= 0 && ifUtil.containsObjectKey(args.properties, IFStylable.GeometryTextProperties)) ||
                (propertySets.indexOf(IFStylable.PropertySet.Paragraph) >= 0 && ifUtil.containsObjectKey(args.properties, IFStylable.GeometryParagraphProperties))) {
                this._stylePrepareGeometryChange();
            }
        } else if (change === IFNode._Change.AfterPropertiesChange) {
            var propertySets = this.getStylePropertySets();
            if ((propertySets.indexOf(IFStylable.PropertySet.Border) >= 0 && ifUtil.containsObjectKey(args.properties, IFStylable.GeometryBorderProperties)) ||
                (propertySets.indexOf(IFStylable.PropertySet.Text) >= 0 && ifUtil.containsObjectKey(args.properties, IFStylable.GeometryTextProperties)) ||
                (propertySets.indexOf(IFStylable.PropertySet.Paragraph) >= 0 && ifUtil.containsObjectKey(args.properties, IFStylable.GeometryParagraphProperties))) {
                this._styleFinishGeometryChange();
                this._stylePropertiesUpdated(args.properties, args.values);
            } else if ((propertySets.indexOf(IFStylable.PropertySet.Style) >= 0 && ifUtil.containsObjectKey(args.properties, IFStylable.VisualStyleProperties)) ||
                (propertySets.indexOf(IFStylable.PropertySet.Fill) >= 0 && ifUtil.containsObjectKey(args.properties, IFStylable.VisualFillProperties)) ||
                (propertySets.indexOf(IFStylable.PropertySet.Border) >= 0 && ifUtil.containsObjectKey(args.properties, IFStylable.VisualBorderProperties))) {
                this._styleRepaint();
                this._stylePropertiesUpdated(args.properties, args.values);
            }
        } else if (change === IFNode._Change.Store) {
            var propertySets = this.getStylePropertySets();

            if (propertySets.indexOf(IFStylable.PropertySet.Style) >= 0) {
                this.storeProperties(args, IFStylable.VisualStyleProperties);
            }

            if (propertySets.indexOf(IFStylable.PropertySet.Fill) >= 0) {
                this.storeProperties(args, IFStylable.VisualFillProperties, function (property, value) {
                    if (value) {
                        if (property === '_fpt') {
                            return IFPattern.asString(value);
                        }
                    }
                    return value;
                });
            }

            if (propertySets.indexOf(IFStylable.PropertySet.Border) >= 0) {
                this.storeProperties(args, IFStylable.VisualBorderProperties);
                this.storeProperties(args, IFStylable.GeometryBorderProperties, function (property, value) {
                    if (value) {
                        if (property === '_bpt') {
                            return IFPattern.asString(value);
                        }
                    }
                    return value;
                });
            }

            if (propertySets.indexOf(IFStylable.PropertySet.Text) >= 0) {
                this.storeProperties(args, IFStylable.GeometryTextProperties);
            }

            if (propertySets.indexOf(IFStylable.PropertySet.Paragraph) >= 0) {
                this.storeProperties(args, IFStylable.GeometryParagraphProperties);
            }
        } else if (change === IFNode._Change.Restore) {
            var propertySets = this.getStylePropertySets();

            if (propertySets.indexOf(IFStylable.PropertySet.Style) >= 0) {
                this.restoreProperties(args, IFStylable.VisualStyleProperties);
            }

            if (propertySets.indexOf(IFStylable.PropertySet.Fill) >= 0) {
                this.restoreProperties(args, IFStylable.VisualFillProperties, function (property, value) {
                    if (value) {
                        if (property === '_fpt') {
                            return IFPattern.parsePattern(value);
                        }
                    }
                    return value;
                });
            }

            if (propertySets.indexOf(IFStylable.PropertySet.Border) >= 0) {
                this.restoreProperties(args, IFStylable.VisualBorderProperties);
                this.restoreProperties(args, IFStylable.GeometryBorderProperties, function (property, value) {
                    if (value) {
                        if (property === '_bpt') {
                            return IFPattern.parsePattern(value);
                        }
                    }
                    return value;
                });
            }

            if (propertySets.indexOf(IFStylable.PropertySet.Text) >= 0) {
                this.restoreProperties(args, IFStylable.GeometryTextProperties);
            }

            if (propertySets.indexOf(IFStylable.PropertySet.Paragraph) >= 0) {
                this.restoreProperties(args, IFStylable.GeometryParagraphProperties);
            }
        }
    };

    /** @private */
    IFStylable.prototype._stylePrepareGeometryChange = function () {
        // NO-OP
    };

    /** @private */
    IFStylable.prototype._styleFinishGeometryChange = function () {
        // NO-OP
    };

    /** @private */
    IFStylable.prototype._styleRepaint = function () {
        // NO-OP
    };

    /** @private */
    IFStylable.prototype._stylePropertiesUpdated = function (properties, previousValues) {
        // NO-OP
    };

    /** @override */
    IFStylable.prototype.toString = function () {
        return "[Mixin IFStylable]";
    };

    _.IFStylable = IFStylable;
})(this);