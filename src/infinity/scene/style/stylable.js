(function (_) {
    /**
     * Mixin to mark something being stylable
     * @class IFStylable
     * @constructor
     * @mixin
     */
    IFStylable = function () {
    };

    // --------------------------------------------------------------------------------------------
    // IFStylable Mixin
    // --------------------------------------------------------------------------------------------
    /**
     * The property-sets this stylable supports
     * @returns {Array<IFStyleDefinition.PropertySet>} list of supported
     * property sets
     * @private
     */
    IFStylable.prototype.getStylePropertySets = function () {
        return [IFStyleDefinition.PropertySet.Style, IFStyleDefinition.PropertySet.Effects];
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
                    case IFStyleDefinition.PropertySet.Style:
                        propertySets.push(IFStyleDefinition.VisualStyleProperties);
                        break;
                    case IFStyleDefinition.PropertySet.Fill:
                        propertySets.push(IFStyleDefinition.VisualFillProperties);
                        break;
                    case IFStyleDefinition.PropertySet.Border:
                        propertySets.push(IFStyleDefinition.VisualBorderProperties);
                        propertySets.push(IFStyleDefinition.GeometryBorderProperties);
                        break;
                    case IFStyleDefinition.PropertySet.Text:
                        propertySets.push(IFStyleDefinition.GeometryTextProperties);
                        break;
                    case IFStyleDefinition.PropertySet.Paragraph:
                        propertySets.push(IFStyleDefinition.GeometryParagraphProperties);
                        break;
                }
            }

            var sourceProperties = [];
            for (var p = 0; p < propertySets.length; ++p) {
                var propertySet = propertySets[p];
                for (var property in propertySet) {
                    if (diffProperties) {
                        // Only assign property if it is contained in diff properties and
                        // when it has the same value as in diff properties
                        if (diffProperties.hasOwnProperty(property) && ifUtil.equals(this.getProperty(property), diffProperties[property])) {
                            sourceProperties.push(property);
                        }
                    } else {
                        sourceProperties.push(property);
                    }
                }
            }

            if (sourceProperties.length > 0) {
                var sourceValues = source.getProperties(sourceProperties);
                this.setProperties(sourceProperties, sourceValues);
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
        if (this.$_ba === IFStyleDefinition.BorderAlignment.Center) {
            var val = this.$_bw / 2;
            if (this.$_blj == IFPaintCanvas.LineJoin.Miter) {
                val *= 2;
            }
            return val;
        } else if (this.$_ba === IFStyleDefinition.BorderAlignment.Outside) {
            var val = this.$_bw;
            if (this.$_blj == IFPaintCanvas.LineJoin.Miter) {
                val *= 2;
            }
            return val;
        }
        return 0;
    }

    /**
     * Returns the painted style bounding box
     * @param {IFRect} source the source bbox
     * @returns {IFRect}
     */
    IFStylable.prototype.getStyleBBox = function (source) {
        var propertySets = this.getStylePropertySets();

        var left = 0;
        var top = 0;
        var right = 0;
        var bottom = 0;

        // Add border to paddings
        if (this.hasStyleBorder() && propertySets.indexOf(IFStyleDefinition.PropertySet.Border) >= 0) {
            var borderPadding = this.getStyleBorderPadding();
            if (borderPadding) {
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

        if (propertySets.indexOf(IFStyleDefinition.PropertySet.Style) >= 0) {
            this._setDefaultProperties(IFStyleDefinition.VisualStyleProperties);
        }

        if (propertySets.indexOf(IFStyleDefinition.PropertySet.Fill) >= 0) {
            this._setDefaultProperties(IFStyleDefinition.VisualFillProperties);
        }

        if (propertySets.indexOf(IFStyleDefinition.PropertySet.Border) >= 0) {
            this._setDefaultProperties(IFStyleDefinition.VisualBorderProperties, IFStyleDefinition.GeometryBorderProperties);
        }

        if (propertySets.indexOf(IFStyleDefinition.PropertySet.Text) >= 0) {
            this._setDefaultProperties(IFStyleDefinition.GeometryTextProperties);
        }

        if (propertySets.indexOf(IFStyleDefinition.PropertySet.Paragraph) >= 0) {
            this._setDefaultProperties(IFStyleDefinition.GeometryParagraphProperties);
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
            if ((propertySets.indexOf(IFStyleDefinition.PropertySet.Border) >= 0 && ifUtil.containsObjectKey(args.properties, IFStyleDefinition.GeometryBorderProperties)) ||
                (propertySets.indexOf(IFStyleDefinition.PropertySet.Text) >= 0 && ifUtil.containsObjectKey(args.properties, IFStyleDefinition.GeometryTextProperties)) ||
                (propertySets.indexOf(IFStyleDefinition.PropertySet.Paragraph) >= 0 && ifUtil.containsObjectKey(args.properties, IFStyleDefinition.GeometryParagraphProperties))) {
                this._stylePrepareGeometryChange();
            }
        } else if (change === IFNode._Change.AfterPropertiesChange) {
            var propertySets = this.getStylePropertySets();
            if ((propertySets.indexOf(IFStyleDefinition.PropertySet.Border) >= 0 && ifUtil.containsObjectKey(args.properties, IFStyleDefinition.GeometryBorderProperties)) ||
                (propertySets.indexOf(IFStyleDefinition.PropertySet.Text) >= 0 && ifUtil.containsObjectKey(args.properties, IFStyleDefinition.GeometryTextProperties)) ||
                (propertySets.indexOf(IFStyleDefinition.PropertySet.Paragraph) >= 0 && ifUtil.containsObjectKey(args.properties, IFStyleDefinition.GeometryParagraphProperties))) {
                this._styleFinishGeometryChange();
                this._stylePropertiesUpdated(args.properties, args.values);
            } else if ((propertySets.indexOf(IFStyleDefinition.PropertySet.Style) >= 0 && ifUtil.containsObjectKey(args.properties, IFStyleDefinition.VisualStyleProperties)) ||
                (propertySets.indexOf(IFStyleDefinition.PropertySet.Fill) >= 0 && ifUtil.containsObjectKey(args.properties, IFStyleDefinition.VisualFillProperties)) ||
                (propertySets.indexOf(IFStyleDefinition.PropertySet.Border) >= 0 && ifUtil.containsObjectKey(args.properties, IFStyleDefinition.VisualBorderProperties))) {
                this._styleRepaint();
                this._stylePropertiesUpdated(args.properties, args.values);
            }
        } else if (change === IFNode._Change.Store) {
            var propertySets = this.getStylePropertySets();

            if (propertySets.indexOf(IFStyleDefinition.PropertySet.Style) >= 0) {
                this.storeProperties(args, IFStyleDefinition.VisualStyleProperties);
            }

            if (propertySets.indexOf(IFStyleDefinition.PropertySet.Fill) >= 0) {
                this.storeProperties(args, IFStyleDefinition.VisualFillProperties, function (property, value) {
                    if (value) {
                        if (property === '_fpt') {
                            return IFPattern.asString(value);
                        }
                    }
                    return value;
                });
            }

            if (propertySets.indexOf(IFStyleDefinition.PropertySet.Border) >= 0) {
                this.storeProperties(args, IFStyleDefinition.VisualBorderProperties);
                this.storeProperties(args, IFStyleDefinition.GeometryBorderProperties, function (property, value) {
                    if (value) {
                        if (property === '_bpt') {
                            return IFPattern.asString(value);
                        }
                    }
                    return value;
                });
            }

            if (propertySets.indexOf(IFStyleDefinition.PropertySet.Text) >= 0) {
                this.storeProperties(args, IFStyleDefinition.GeometryTextProperties);
            }

            if (propertySets.indexOf(IFStyleDefinition.PropertySet.Paragraph) >= 0) {
                this.storeProperties(args, IFStyleDefinition.GeometryParagraphProperties);
            }
        } else if (change === IFNode._Change.Restore) {
            var propertySets = this.getStylePropertySets();

            if (propertySets.indexOf(IFStyleDefinition.PropertySet.Style) >= 0) {
                this.restoreProperties(args, IFStyleDefinition.VisualStyleProperties);
            }

            if (propertySets.indexOf(IFStyleDefinition.PropertySet.Fill) >= 0) {
                this.restoreProperties(args, IFStyleDefinition.VisualFillProperties, function (property, value) {
                    if (value) {
                        if (property === '_fpt') {
                            return IFPattern.parsePattern(value);
                        }
                    }
                    return value;
                });
            }

            if (propertySets.indexOf(IFStyleDefinition.PropertySet.Border) >= 0) {
                this.restoreProperties(args, IFStyleDefinition.VisualBorderProperties);
                this.restoreProperties(args, IFStyleDefinition.GeometryBorderProperties, function (property, value) {
                    if (value) {
                        if (property === '_bpt') {
                            return IFPattern.parsePattern(value);
                        }
                    }
                    return value;
                });
            }

            if (propertySets.indexOf(IFStyleDefinition.PropertySet.Text) >= 0) {
                this.restoreProperties(args, IFStyleDefinition.GeometryTextProperties);
            }

            if (propertySets.indexOf(IFStyleDefinition.PropertySet.Paragraph) >= 0) {
                this.restoreProperties(args, IFStyleDefinition.GeometryParagraphProperties);
            }
        }
    };

    /**
     * Called to paint with style
     * @param {IFPaintContext} context the context to be used for drawing
     * @param {IFRect} contentPaintBBox the paint bbox used for drawing this stylable
     */
    IFStylable.prototype._paintStyle = function (context, contentPaintBBox) {
        if (this.$_stop > 0.0) {
            if (this.$_stop !== 1.0 || this.$_sbl !== IFPaintCanvas.BlendMode.Normal && !context.configuration.isOutline(context)) {
                // We need to paint on a separate canvas here
                var sourceCanvas = context.canvas;
                var styleCanvas = this._createStyleCanvas(context, contentPaintBBox);
                context.canvas = styleCanvas;
                try {
                    this._paintStyleLayers(context, contentPaintBBox);

                    if (this.$_sbl === 'mask') {
                        var area = this._getStyleMaskClipArea();
                        if (area) {
                            sourceCanvas.clipRect(area.getX(), area.getY(), area.getWidth(), area.getHeight());
                        }
                        try {
                            sourceCanvas.drawCanvas(styleCanvas, 0, 0, this.$_stop, IFPaintCanvas.CompositeOperator.DestinationIn);
                        } finally {
                            if (area) {
                                sourceCanvas.resetClip();
                            }
                        }
                    } else {
                        sourceCanvas.drawCanvas(styleCanvas, 0, 0, this.$_stop, this.$_sbl);
                    }

                    styleCanvas.finish();
                } finally {
                    context.canvas = sourceCanvas;
                }
            } else {
                this._paintStyleLayers(context, contentPaintBBox);
            }
        }
    };

    /**
     * Called to paint the style layers
     * @param {IFPaintContext} context the context to be used for drawing
     * @param {IFRect} contentPaintBBox the source bbox used for drawing
     */
    IFStylable.prototype._paintStyleLayers = function (context, contentPaintBBox) {
        for (var i = 0; i < IFStyleDefinition.LAYER_ORDER.length; ++i) {
            var layer = IFStyleDefinition.LAYER_ORDER[i];
            if (this._isSeparateStyleLayer(context, layer)) {
                var sourceCanvas = context.canvas;
                var styleCanvas = this._createStyleCanvas(context, contentPaintBBox);
                context.canvas = styleCanvas;
                try {
                    this._paintStyleLayer(context, layer);
                    sourceCanvas.drawCanvas(styleCanvas);
                    styleCanvas.finish();
                } finally {
                    context.canvas = sourceCanvas;
                }
            } else {
                this._paintStyleLayer(context, layer);
            }
        }
    };

    /**
     * Called whenever this should paint a specific style layer
     * @param {IFPaintContext} context the context to be used for drawing
     * @param {IFStyleDefinition.Layer} layer the actual layer to be painted
     */
    IFStylable.prototype._paintStyleLayer = function (context, layer) {
        // NO-OP
    };

    /**
     * Called to test whether a given style layer requires a separate canvas or not
     * @param {IFPaintContext} context the context to be used for drawing
     * @param {IFStyleDefinition.Layer} layer the actual layer to be painted
     * @return {Boolean} true if layer is separated, false if not
     */
    IFStylable.prototype._isSeparateStyleLayer = function (context, layer) {
        return false;
    };

    /**
     * Should return the clip-area for masked styles
     * @param {IFPaintContext} context
     * @return {IFRect}
     * @private
     */
    IFStylable.prototype._getStyleMaskClipArea = function (context) {
        return null;
    };

    /**
     * Create and return the fill paint pattern used for painting
     * @return {{paint: *, transform: IFTransform}}
     * @private
     */
    IFStylable.prototype._createFillPaint = function (canvas, bbox) {
        if (this.$_fpt) {
            return this._createPatternPaint(canvas, this.$_fpt, bbox, this.$_ftx, this.$_fty, this.$_fsx, this.$_fsy, this.$_frt);
        }
        return null;
    };

    /**
     * Create and return the border paint pattern used for painting
     * @return {{paint: *, transform: IFTransform}}
     * @private
     */
    IFStylable.prototype._createBorderPaint = function (canvas, bbox) {
        if (this.$_bpt) {
            return this._createPatternPaint(canvas, this.$_bpt, bbox, this.$_btx, this.$_bty, this.$_bsx, this.$_bsy, this.$_brt);
        }
        return null;
    };

    /**
     * @return {{paint: *, transform: IFTransform}}
     * @private
     */
    IFStylable.prototype._createPatternPaint = function (canvas, pattern, bbox, tx, ty, sx, sy, rt) {
        var result = {
            paint: null,
            transform: null
        };

        if (pattern instanceof IFColor) {
            result.paint = pattern;
        } else if (pattern instanceof IFGradient) {
            var gradient = null;

            if (pattern.getType() === IFGradient.Type.Linear) {
                result.paint = canvas.createLinearGradient(-0.5, 0, 0.5, 0, pattern);
            } else if (pattern.getType() === IFGradient.Type.Radial) {
                result.paint = canvas.createRadialGradient(0, 0, 0.5, pattern);
            }

            var left = bbox.getX();
            var top = bbox.getY();
            var width = bbox.getWidth();
            var height = bbox.getHeight();

            result.transform = IFTransform()
                .scaled(sx, sy)
                .rotated(rt)
                .translated(tx, ty)
                .scaled(width, height)
                .translated(left, top);
        }

        return result;
    };

    /**
     * Creates a temporary canvas for style drawing. This function will actually
     * honor the Fast-Paint-Mode and if set, will return a canvas that paints at
     * 100% instead.
     * @param {IFPaintContext} context the paint context in use
     * @param {IFRect} extents the extents for the temporary canvas
     * @return {IFPaintCanvas}
     * @private
     */
    IFStylable.prototype._createStyleCanvas = function (context, extents) {
        if (context.configuration.paintMode === IFScenePaintConfiguration.PaintMode.Fast) {
            var result = new IFPaintCanvas();
            result.resize(extents.getWidth(), extents.getHeight());
            result.prepare();

            var topLeft = extents.getSide(IFRect.Side.TOP_LEFT);
            result.setOrigin(topLeft);
            result.setOffset(topLeft);

            // TODO : Support clipping dirty areas

            return result;
        } else {
            return context.canvas.createCanvas(extents, true);
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