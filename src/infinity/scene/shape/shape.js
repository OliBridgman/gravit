(function (_) {

    /**
     * A base geometry based on vertices which is transformable and styleable
     * and may contain other elements as sub-contents
     * @class GXShape
     * @extends GXItem
     * @mixes GXNode.Container
     * @mixes GXElement.Transform
     * @mixes GXElement.Pivot
     * @mixes GXElement.Attributes
     * @mixes GXVertexSource
     * @constructor
     */
    function GXShape() {
        GXItem.call(this);

        // Assign default properties
        this._setDefaultProperties(GXShape.GeometryProperties);
    }

    GObject.inheritAndMix(GXShape, GXItem, [GXNode.Container, GXElement.Transform, GXElement.Pivot, GXElement.Attributes, GXVertexSource]);

    /**
     * The geometry properties of a shape with their default values
     */
    GXShape.GeometryProperties = {
        trf: null
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXShape._Attributes Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GXShape._Attributes
     * @extends IFAttributes
     * @mixes GXNode.Container
     * @mixes IFAttribute.Render
     * @mixes IFAttributes.Pattern
     * @private
     */
    GXShape._Attributes = function () {
        this._flags |= GXNode.Flag.Shadow;
    }

    GXNode.inheritAndMix("shapeAttrs", GXShape._Attributes, IFAttributes, [IFAttribute.Render, IFAttributes.Pattern]);

    /** @override */
    GXShape._Attributes.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXShape;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXShape Class
    // -----------------------------------------------------------------------------------------------------------------
    /** @override */
    GXShape.prototype.getAttributes = function () {
        var attributes = GXElement.Attributes.prototype.getAttributes.call(this);
        if (!attributes) {
            attributes = new GXShape._Attributes();
            this.appendChild(attributes);
        }
        return attributes;
    };

    /** @override */
    GXShape.prototype.getTransform = function () {
        return this.$trf;
    };

    /** @override */
    GXShape.prototype.setTransform = function (transform) {
        this.setProperty('trf', transform);
    };

    /** @override */
    GXShape.prototype.transform = function (transform) {
        if (transform && !transform.isIdentity()) {
            this.setProperty('trf', this.$trf ? this.$trf.multiplied(transform) : transform);
        }
        GXElement.Transform.prototype._transformChildren.call(this, transform);
    };

    /** @override */
    GXShape.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXBlock;
    };

    /** @override */
    GXShape.prototype.store = function (blob) {
        if (GXItem.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXShape.GeometryProperties, function (property, value) {
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
    GXShape.prototype.restore = function (blob) {
        if (GXItem.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXShape.GeometryProperties, function (property, value) {
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
    GXShape.prototype.paint = function (context) {
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
            var transformedVertices = new GXVertexTransformer(this, transform);
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
     * @param {GXPaintContext} context
     * @private
     */
    GXShape.prototype._paintBackground = function (context) {
        // NO-OP
    };

    /**
     * Called to paint the foreground painted after
     * any styling and everything else
     * @param {GXPaintContext} context
     * @private
     */
    GXShape.prototype._paintForeground = function (context) {
    };

    /** @override */
    GXShape.prototype._calculateGeometryBBox = function () {
        return gVertexInfo.calculateBounds(this, true);
    };

    /** @override */
    GXShape.prototype._calculatePaintBBox = function () {
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
    GXShape.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, GXShape.GeometryProperties);
        GXItem.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GXShape.prototype._detailHitTest = function (location, transform, tolerance, force) {
        // Hit-Test attributes, first
        var attrHit = this.getAttributes().hitTest(this, location, transform, tolerance);

        if (attrHit) {
            return new GXElement.HitResult(this, attrHit);
        } else if (force) {
            // When forced we'll always hit-test our whole "invisible" outline / fill area
            var vertexHit = new GXVertexInfo.HitResult();
            if (gVertexInfo.hitTest(location.getX(), location.getY(), new GXVertexTransformer(this, transform), tolerance, true, vertexHit)) {
                return new GXElement.HitResult(this, vertexHit);
            }
        } else {
            // If we didn't hit an attributes, then hit-test our "invisible" tolerance outline area if any
            if (tolerance) {
                var vertexHit = new GXVertexInfo.HitResult();
                if (gVertexInfo.hitTest(location.getX(), location.getY(), new GXVertexTransformer(this, transform), tolerance, false, vertexHit)) {
                    return new GXElement.HitResult(this, vertexHit);
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
    GXShape.prototype.getCenter = function (includeTransform) {
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
    GXShape.prototype.getOrigHalfWidth = function () {
        return 1.0;
    };

    /**
     * Returns shape's internal half width before applying any transformations
     * @returns {Number}
     */
    GXShape.prototype.getOrigHalfHeight = function () {
        return 1.0;
    };

    /** @override */
    GXShape.prototype.toString = function () {
        return "[GXShape]";
    };

    _.GXShape = GXShape;
})(this);