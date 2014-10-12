(function (_) {

    /**
     * A base geometry based on vertices which is transformable and styleable
     * and may contain other elements as sub-contents
     * @class IFShape
     * @extends IFItem
     * @mixes IFNode.Container
     * @mixes IFElement.Transform
     * @mixes IFElement.Stylable
     * @mixes IFVertexSource
     * @constructor
     */
    function IFShape() {
        IFItem.call(this);
        this._setDefaultProperties(IFShape.GeometryProperties);
    }

    IFObject.inheritAndMix(IFShape, IFItem, [IFNode.Container, IFElement.Transform, IFElement.Stylable, IFVertexSource]);

    /**
     * The geometry properties of a shape with their default values
     */
    IFShape.GeometryProperties = {
        trf: null
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFShape.HitResult Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class IFShape.HitResult
     * @param {IFShape.HitResult.Type} type
     * @param {IFVertexInfo.HitResult} vertexHit
     * @constructor
     */
    IFShape.HitResult = function (type, vertexHit) {
        this.type = type;
        this.vertex = vertexHit;
    };

    /**
     * @enum
     */
    IFShape.HitResult.Type = {
        Stroke: 0,
        Fill: 1,
        Outline: 2,
        Other: 3
    };

    /**
     * @type {IFShape.HitResult.Type}
     */
    IFShape.HitResult.prototype.type = null;

    /**
     * @type {IFVertexInfo.HitResult}
     */
    IFShape.HitResult.prototype.vertexHit = null;

    // -----------------------------------------------------------------------------------------------------------------
    // IFShape Class
    // -----------------------------------------------------------------------------------------------------------------

    /** @override */
    IFShape.prototype.assignFrom = function (other) {
        IFBlock.prototype.assignFrom.call(this, other);

        if (other instanceof IFShape) {
            this.transferProperties(other, [IFShape.GeometryProperties]);
        }
    };

    /** @override */
    IFShape.prototype.getStylePropertySets = function () {
        return IFElement.Stylable.prototype.getStylePropertySets.call(this)
            .concat(IFStylable.PropertySet.Fill, IFStylable.PropertySet.Border);
    };

    /** @override */
    IFShape.prototype.getTransform = function () {
        return this.$trf;
    };

    /** @override */
    IFShape.prototype.setTransform = function (transform) {
        this.setProperty('trf', transform);
    };

    /** @override */
    IFShape.prototype.transform = function (transform) {
        if (transform && !transform.isIdentity()) {
            this.setProperty('trf', this.$trf ? this.$trf.multiplied(transform) : transform);
        }
        IFElement.Transform.prototype._transformChildren.call(this, transform);
    };

    /** @override */
    IFShape.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFLayer || parent instanceof IFShapeSet || parent instanceof IFShape;
    };

    /** @override */
    IFShape.prototype._paintStyleLayer = function (context, layer) {
        if (layer === IFStylable.StyleLayer.Fill) {
            this._paintFill(context);
            this._paintContents(context);
        } else if (layer === IFStylable.StyleLayer.Border) {
            this._paintBorder(context);
        }
    };

    /** @override */
    IFShape.prototype._isSeparateStylePaintLayer = function (context, layer) {
        var result = IFElement.Stylable.prototype._isSeparateStylePaintLayer.call(this, context, layer);
        if (result) {
            return true;
        }

        if (layer === IFStylable.StyleLayer.Border && this.hasStyleBorder()) {
            // If we're not having a center-aligned border then
            // we need a separate canvas here
            if (this.$_ba !== IFStylable.BorderAlignment.Center) {
                return true;
            }

            // Having a scale of !== 0 always requires a separate canvas
            return this.$_bsx !== 1.0 || this.$_bsy !== 1.0;
        }
    };

    /** @override */
    IFShape.prototype._calculateGeometryBBox = function () {
        return ifVertexInfo.calculateBounds(this, true);
    };

    /** @override */
    IFShape.prototype._calculatePaintBBox = function () {
        var source = this.getGeometryBBox();
        if (!source) {
            return null;
        }

        var effects = this.getEffects();

        var paintBBox = source;

        if (this.hasStyleFill()) {
            // Unite with fill bbox and fill effects
            var fillPaintBBox = effects.getEffectsBBox(source, IFStylable.StyleLayer.Fill);
            paintBBox = paintBBox.united(fillPaintBBox);
        }

        if (this.hasStyleBorder()) {
            var borderBBox = source;

            // Apply border padding
            var borderPadding = this.getStyleBorderPadding();
            if (borderPadding) {
                if (this._requireMiterLimitApproximation() && this.$_blj === IFPaintCanvas.LineJoin.Miter && this.$_bml > 0) {
                    borderPadding *= this.$_bml;
                }

                borderBBox = borderBBox.expanded(borderPadding, borderPadding, borderPadding, borderPadding);
            }

            // Unite with border bbox and border effects
            var borderPaintBBox = effects.getEffectsBBox(borderBBox, IFStylable.StyleLayer.Border);
            paintBBox = paintBBox.united(borderPaintBBox);
        }

        // Apply shape effect bbopx
        paintBBox = effects.getEffectsBBox(paintBBox);

        // We need to iterate up and expand our effects-bbox
        // by the effects of our parents
        for (var stylable = this; stylable !== null; stylable = stylable.getParent()) {
            if (!stylable.hasMixin(IFStylable) || stylable.getStylePropertySets().indexOf(IFStylable.PropertySet.Effects) < 0) {
                break;
            }

            paintBBox = stylable.getEffects().getEffectsBBox(paintBBox);
        }

        return paintBBox;
    };

    /**
     * Whether this kind of shape requires approximation of
     * the miter limit when calculating the style bounding box or not.
     * @returns {boolean}
     * @private
     */
    IFShape.prototype._requireMiterLimitApproximation = function () {
        return false;
    };

    /**
     * Paint the shape fill
     * @param {IFPaintContext} context
     * @private
     */
    IFShape.prototype._paintFill = function (context) {
        if (!context.configuration.isOutline(context) && this.hasStyleFill()) {
            var fill = this._createFillPaint(context, this.getGeometryBBox());
            if (fill && fill.paint) {
                var canvas = context.canvas;
                canvas.putVertices(this);

                if (fill.transform) {
                    var oldTransform = canvas.setTransform(canvas.getTransform(true).preMultiplied(fill.transform));
                    canvas.fillVertices(fill.paint, this.$_fop);
                    canvas.setTransform(oldTransform);
                } else {
                    canvas.fillVertices(fill.paint, this.$_fop);
                }
            }
        }
    };

    /**
     * Paint the shape contents
     * @param {IFPaintContext} context
     * @private
     */
    IFShape.prototype._paintContents = function (context) {
        // Paint contents if there're any
        // TODO : Check intersection of children paintbbox and if it is
        // fully contained by this shape then don't clip
        // Paint our contents if any and clip 'em to ourself
        // TODO : Use clipPath() when supporting AA in chrome instead
        // of composite painting and separate canvas!!
        var oldContentsCanvas = null;
        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof IFElement) {
                // Create temporary canvas if none yet
                if (!oldContentsCanvas) {
                    oldContentsCanvas = context.pushCanvas(context.canvas.createCanvas(this.getGeometryBBox()));
                }

                child.paint(context);
            }
        }

        // If we have a old contents canvas, clip our contents and swap canvas back
        if (oldContentsCanvas) {
            context.canvas.putVertices(this);
            context.canvas.fillVertices(IFRGBColor.BLACK, 1, IFPaintCanvas.CompositeOperator.DestinationIn);
            oldContentsCanvas.drawCanvas(context.canvas);
            context.canvas.finish();
            context.popCanvas();
        }
    };


    /**
     * Paint the shape border
     * @param {IFPaintContext} context
     * @private
     */
    IFShape.prototype._paintBorder = function (context) {
        var outline = context.configuration.isOutline(context);
        if (!outline && this.hasStyleBorder()) {
            var borderBBox = this.getGeometryBBox();
            var borderPadding = this.getStyleBorderPadding();
            if (borderPadding) {
                borderBBox = borderBBox.expanded(borderPadding, borderPadding, borderPadding, borderPadding);
            }
            var border = this._createBorderPaint(context, borderBBox);

            if (border && border.paint) {
                var canvas = context.canvas;
                var borderWidth = this.$_bw;

                // Except center alignment we need to double the border width
                // as we're gonna clip half away
                if (this.$_ba !== IFStylable.BorderAlignment.Center) {
                    borderWidth *= 2;
                }

                context.canvas.putVertices(this);

                if (border.transform) {
                    // If any scale factor is != 1.0 we need to fill the whole area
                    // and clip our border away to ensure border width consistency
                    if (this.$_bsx !== 1.0 || this.$_bsy !== 1.0) {
                        // Fill everything with the border.paint, then clip with the border
                        var oldTransform = canvas.setTransform(canvas.getTransform(true).multiplied(border.transform));
                        var patternFillArea = border.transform.inverted().mapRect(borderBBox);
                        canvas.fillRect(patternFillArea.getX(), patternFillArea.getY(), patternFillArea.getWidth(), patternFillArea.getHeight(), border.paint, this.$_bop);
                        canvas.setTransform(oldTransform);
                        canvas.strokeVertices(border.paint, borderWidth, this.$_blc, this.$_blj, this.$_bml, 1, IFPaintCanvas.CompositeOperator.DestinationIn);
                    } else {
                        var oldTransform = canvas.setTransform(canvas.getTransform(true).multiplied(border.transform));
                        canvas.strokeVertices(border.paint, borderWidth / border.transform.getScaleFactor(), this.$_blc, this.$_blj, this.$_bml, this.$_bop);
                        canvas.setTransform(oldTransform);
                    }
                } else {
                    canvas.strokeVertices(border.paint, borderWidth, this.$_blc, this.$_blj, this.$_bml, this.$_bop);
                }

                // TODO : Use clipPath() when supporting AA in chrome instead
                // of composite painting and separate canvas!!
                // Depending on the border alignment we might need to clip now
                if (this.$_ba === IFStylable.BorderAlignment.Inside) {
                    canvas.fillVertices(IFRGBColor.BLACK, 1, IFPaintCanvas.CompositeOperator.DestinationIn);
                } else if (this.$_ba === IFStylable.BorderAlignment.Outside) {
                    canvas.fillVertices(IFRGBColor.BLACK, 1, IFPaintCanvas.CompositeOperator.DestinationOut);
                }
            }
        } else if (outline) {
            // Outline is painted with non-transformed border
            // so we reset transform, transform the vertices
            // ourself and then re-apply the transformation
            var transform = context.canvas.resetTransform();
            var transformedVertices = new IFVertexTransformer(this, transform);
            context.canvas.putVertices(transformedVertices);
            context.canvas.strokeVertices(context.getOutlineColor());
            context.canvas.setTransform(transform);
        }
    };

    /** @override */
    IFShape.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, IFShape.GeometryProperties);

        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFShape.GeometryProperties, function (property, value) {
                if (property === 'trf' && value) {
                    return IFTransform.serialize(value);
                }
                return value;
            });
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFShape.GeometryProperties, function (property, value) {
                if (property === 'trf' && value) {
                    return IFTransform.deserialize(value);
                }
                return value;
            });
        }

        IFItem.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFShape.prototype._invalidateGeometryForChildUpdate = function () {
        // NO-OP as we're independant from our children's geometry
    };

    /** @override */
    IFShape.prototype._detailHitTest = function (location, transform, tolerance, force) {
        if (this.hasStyleBorder()) {
            var outlineWidth = this.$_bw * transform.getScaleFactor() + tolerance * 2;
            var vertexHit = new IFVertexInfo.HitResult();
            if (ifVertexInfo.hitTest(location.getX(), location.getY(), new IFVertexTransformer(this, transform), outlineWidth, false, vertexHit)) {
                return new IFElement.HitResultInfo(this, new IFShape.HitResult(IFShape.HitResult.Type.Border, vertexHit));
            }
        }

        if (this.hasStyleFill() || force) {
            var vertexHit = new IFVertexInfo.HitResult();
            if (ifVertexInfo.hitTest(location.getX(), location.getY(), new IFVertexTransformer(this, transform), tolerance, true, vertexHit)) {
                return new IFElement.HitResultInfo(this, new IFShape.HitResult(this.hasStyleFill() ? IFShape.HitResult.Type.Fill : IFShape.HitResult.Type.Other, vertexHit));
            }
        }

        if (tolerance) {
            var vertexHit = new IFVertexInfo.HitResult();
            if (ifVertexInfo.hitTest(location.getX(), location.getY(), new IFVertexTransformer(this, transform), transform.getScaleFactor() + tolerance * 2, false, vertexHit)) {
                return new IFElement.HitResultInfo(this, new IFShape.HitResult(IFShape.HitResult.Type.Outline, vertexHit));
            }
        }

        return null;
    };

    /**
     * Returns a center of the shape in world coordinates. Shape's internal transformation is applied if needed
     * @param {Boolean} includeTransform - whether to apply shape's internal transformation
     * @returns {IFPoint}
     */
    IFShape.prototype.getCenter = function (includeTransform) {
        var center = new IFPoint(0, 0);
        if (includeTransform && this.$trf) {
            center = this.$trf.mapPoint(center);
        }
        return center;
    };

    /**
     * Returns shape's internal half width before applying any transformations
     * @returns {Number}
     */
    IFShape.prototype.getOrigHalfWidth = function () {
        return 1.0;
    };

    /**
     * Returns shape's internal half width before applying any transformations
     * @returns {Number}
     */
    IFShape.prototype.getOrigHalfHeight = function () {
        return 1.0;
    };

    /** @override */
    IFShape.prototype.toString = function () {
        return "[IFShape]";
    };

    _.IFShape = IFShape;
})(this);