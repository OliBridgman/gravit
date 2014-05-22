(function (_) {

    /**
     * A base geometry based on vertices which is transformable and styleable
     * and may contain other elements as sub-contents
     * @class IFShape
     * @extends IFItem
     * @mixes IFNode.Container
     * @mixes IFElement.Transform
     * @mixes IFElement.Pivot
     * @mixes IFElement.Attributes
     * @mixes IFVertexSource
     * @constructor
     */
    function IFShape() {
        IFItem.call(this);

        // Assign default properties
        this._setDefaultProperties(IFShape.GeometryProperties);
    }

    GObject.inheritAndMix(IFShape, IFItem, [IFNode.Container, IFElement.Transform, IFElement.Pivot, IFElement.Attributes, IFVertexSource]);

    /**
     * The geometry properties of a shape with their default values
     */
    IFShape.GeometryProperties = {
        trf: null
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFShape._Attributes Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class IFShape._Attributes
     * @extends IFAttributes
     * @mixes IFNode.Container
     * @mixes IFAttribute.Render
     * @mixes IFAttributes.Pattern
     * @private
     */
    IFShape._Attributes = function () {
        this._flags |= IFNode.Flag.Shadow;
    }

    IFNode.inheritAndMix("shapeAttrs", IFShape._Attributes, IFAttributes, [IFAttribute.Render, IFAttributes.Pattern]);

    /** @override */
    IFShape._Attributes.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFShape;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFShape Class
    // -----------------------------------------------------------------------------------------------------------------
    /** @override */
    IFShape.prototype.getAttributes = function () {
        var attributes = IFElement.Attributes.prototype.getAttributes.call(this);
        if (!attributes) {
            attributes = new IFShape._Attributes();
            this.appendChild(attributes);
        }
        return attributes;
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
        return parent instanceof IFBlock;
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
    IFShape.prototype.paint = function (context) {
        if (!this.rewindVertices(0)) {
            return;
        }

        if (!this._preparePaint(context)) {
            return;
        }

        // Paint our background before anything else
        this._paintBackground(context);

        if (context.configuration.isOutline(context)) {
            // Outline is painted with non-transformed stroke
            // so we reset transform, transform the vertices
            // ourself and then re-apply the transformation
            var transform = context.canvas.resetTransform();
            var transformedVertices = new IFVertexTransformer(this, transform);
            context.canvas.putVertices(transformedVertices);
            context.canvas.strokeVertices(context.getOutlineColor());
            context.canvas.setTransform(transform);
        }

        // Paint our attributes
        this.getAttributes().render(context, this, this.getGeometryBBox());

        // Paint our foreground
        this._paintForeground(context);

        this._finishPaint(context);
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

    /** @override */
    IFShape.prototype._calculateGeometryBBox = function () {
        return gVertexInfo.calculateBounds(this, true);
    };

    /** @override */
    IFShape.prototype._calculatePaintBBox = function () {
        var source = this.getGeometryBBox();
        if (!source) {
            return null;
        }

        var result = source;
        var attributesBBox = this.getAttributes().getBBox(source);
        if (attributesBBox && !attributesBBox.isEmpty()) {
            result = result.united(attributesBBox);
        }

        return result;
    };

    /** @override */
    IFShape.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, IFShape.GeometryProperties);
        IFItem.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFShape.prototype._detailHitTest = function (location, transform, tolerance, force) {
        // Hit-Test attributes, first
        var attrHit = this.getAttributes().hitTest(this, location, transform, tolerance);

        if (attrHit) {
            return new IFElement.HitResult(this, attrHit);
        } else if (force) {
            // When forced we'll always hit-test our whole "invisible" outline / fill area
            var vertexHit = new IFVertexInfo.HitResult();
            if (gVertexInfo.hitTest(location.getX(), location.getY(), new IFVertexTransformer(this, transform), tolerance, true, vertexHit)) {
                return new IFElement.HitResult(this, vertexHit);
            }
        } else {
            // If we didn't hit an attributes, then hit-test our "invisible" tolerance outline area if any
            if (tolerance) {
                var vertexHit = new IFVertexInfo.HitResult();
                if (gVertexInfo.hitTest(location.getX(), location.getY(), new IFVertexTransformer(this, transform), tolerance, false, vertexHit)) {
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