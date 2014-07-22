(function (_) {

    /**
     * A base geometry based on vertices which is transformable and styleable
     * and may contain other elements as sub-contents
     * @class IFShape
     * @extends IFItem
     * @mixes IFNode.Container
     * @mixes IFElement.Transform
     * @mixes IFElement.Pivot
     * @mixes IFElement.Style
     * @mixes IFVertexSource
     * @constructor
     */
    function IFShape() {
        IFItem.call(this);

        // Assign default properties
        this._setDefaultProperties(IFShape.GeometryProperties);
    }

    IFObject.inheritAndMix(IFShape, IFItem, [IFNode.Container, IFElement.Transform, IFElement.Pivot, IFElement.Style, IFVertexSource]);

    /**
     * The geometry properties of a shape with their default values
     */
    IFShape.GeometryProperties = {
        trf: null
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFShape._StyleSet Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class IFShape._StyleSet
     * @extends IFStyleSet
     * @private
     */
    IFShape._StyleSet = function () {
        this._flags |= IFNode.Flag.Shadow;
    }

    IFNode.inherit("shpStylSet", IFShape._StyleSet, IFStyleSet);

    /** @override */
    IFShape._StyleSet.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFShape;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFShape Class
    // -----------------------------------------------------------------------------------------------------------------
    /** @override */
    IFShape.prototype.getStyleSet = function () {
        var styleSet = IFElement.Style.prototype.getStyleSet.call(this);
        if (!styleSet) {
            styleSet = new IFShape._StyleSet();
            this.appendChild(styleSet);
        }
        return styleSet;
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
    IFShape.prototype.store = function (blob) {
        if (IFItem.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFShape.GeometryProperties, function (property, value) {
                if (property === 'trf' && value) {
                    return GTransform.serialize(value);
                }
                return value;
            });
            return true;
        }
        return false;
    };

    /** @override */
    IFShape.prototype.restore = function (blob) {
        if (IFItem.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFShape.GeometryProperties, function (property, value) {
                if (property === 'trf' && value) {
                    return GTransform.deserialize(value);
                }
                return value;
            });
            return true;
        }
        return false;
    };

    /** @override */
    IFShape.prototype._paint = function (context, style, styleIndex) {
        if (!this.rewindVertices(0)) {
            return;
        }

        // Paint our background before anything else
        this._paintBackground(context);

        // Handle different painting routes depending on outline mode
        if (context.configuration.isOutline(context)) {
            // Outline is painted with non-transformed stroke
            // so we reset transform, transform the vertices
            // ourself and then re-apply the transformation
            var transform = context.canvas.resetTransform();
            var transformedVertices = new IFVertexTransformer(style ? style.createVertexSource(this) : this, transform);
            context.canvas.putVertices(transformedVertices);
            context.canvas.strokeVertices(context.getOutlineColor());
            context.canvas.setTransform(transform);

            // Paint contents
            this._paintContents(context);
        } else if (style) {
            // Iterate all (visible) paints
            var paints = null;
            for (var entry = style.getActualStyle().getFirstChild(); entry !== null; entry = entry.getNext()) {
                if (entry instanceof IFPaintEntry && entry.getProperty('vs') === true) {
                    if (!paints) {
                        paints = [];
                    }
                    paints.push(entry);
                }
            }

            if (paints) {
                // Create vertex source and put 'em onto canvas
                var vertexSource = style.createVertexSource(this);
                context.canvas.putVertices(vertexSource);

                var paintBBox = style.getBBox(this.getGeometryBBox());

                // Paint all paints npw
                for (var i = 0; i < paints.length; ++i) {
                    var paint = paints[i];

                    // Check whether to create a separate canvas
                    if (paint.isSeparate()) {
                        // Create temporary canvas
                        var paintCanvas = context.canvas.createCanvas(paintBBox);

                        // Put our vertex source onto it
                        paintCanvas.putVertices(vertexSource);

                        // Paint
                        paint.paint(paintCanvas, paintBBox);

                        // Draw the temporary canvas back
                        context.canvas.drawCanvas(paintCanvas, 0, 0, paint.getPaintOpacity(), paint.getPaintCmpOrBlend());
                    } else {
                        // Regular painting on main canvas
                        paint.paint(context.canvas, paintBBox);
                    }
                }
            }
        }

        // Paint our foreground
        this._paintForeground(context);
    };

    /**
     * Called to paint any backgrounds painted at
     * first before any styling and contents
     * @param {IFPaintContext} context
     * @private
     */
    IFShape.prototype._paintBackground = function (context) {
        // NO-OP
    };

    /**
     * Called to paint the foreground painted after
     * any styling and everything else
     * @param {IFPaintContext} context
     * @private
     */
    IFShape.prototype._paintForeground = function (context) {
    };

    /**
     * Paint and clip any contents of this shape
     * @param {IFPaintContext} context
     * @private
     */
    IFShape.prototype._paintContents = function (context) {
        // Paint our contents if any and clip 'em to ourself
        var oldContentsCanvas = null;
        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof IFElement) {
                // Create temporary canvas if none yet
                if (!oldContentsCanvas) {
                    oldContentsCanvas = context.canvas;
                    context.canvas = oldContentsCanvas.createCanvas(this.getGeometryBBox());
                }

                child.render(context);
            }
        }

        // If we have a old contents canvas, clip our contents and swap canvas back
        if (oldContentsCanvas) {
            context.canvas.putVertices(this);
            context.canvas.fillVertices(IFColor.BLACK, 1, IFPaintCanvas.CompositeOperator.DestinationIn);
            oldContentsCanvas.drawCanvas(context.canvas);
            context.canvas = oldContentsCanvas;
        }
    };

    /** @override */
    IFShape.prototype.renderStyle = function (context, style, styleIndex) {
        IFElement.Style.prototype.renderStyle.call(this, context, style, styleIndex);

        // Render our contents here and clip' em if any after first style
        if (styleIndex === 0) {
            this._paintContents(context);
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

        return this.getStyleSet().getBBox(source);
    };

    /** @override */
    IFShape.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, IFShape.GeometryProperties);
        IFItem.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFShape.prototype._detailHitTest = function (location, transform, tolerance, force) {
        // Hit-Test styles, first
        var styleHit = this.getStyleSet().hitTest(this, location, transform, tolerance);

        if (styleHit) {
            return new IFElement.HitResult(this, styleHit);
        } else if (force) {
            // When forced we'll always hit-test our whole "invisible" outline / fill area
            var vertexHit = new IFVertexInfo.HitResult();
            if (ifVertexInfo.hitTest(location.getX(), location.getY(), new IFVertexTransformer(this, transform), tolerance, true, vertexHit)) {
                return new IFElement.HitResult(this, vertexHit);
            }
        } else {
            // If we didn't hit a style entry, then hit-test our "invisible" tolerance outline area if any
            if (tolerance) {
                var vertexHit = new IFVertexInfo.HitResult();
                if (ifVertexInfo.hitTest(location.getX(), location.getY(), new IFVertexTransformer(this, transform), tolerance, false, vertexHit)) {
                    return new IFElement.HitResult(this, vertexHit);
                }
            }
        }
        return null;
    };

    /**
     * Returns a center of the shape in world coordinates. Shape's internal transformation is applied if needed
     * @param {Boolean} includeTransform - whether to apply shape's internal transformation
     * @returns {GPoint}
     */
    IFShape.prototype.getCenter = function (includeTransform) {
        var center = new GPoint(0, 0);
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