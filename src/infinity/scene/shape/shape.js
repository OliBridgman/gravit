(function (_) {

    /**
     * A base geometry based on vertices which is transformable and styleable
     * and may contain other elements as sub-contents
     * @class IFShape
     * @extends IFItem
     * @mixes IFNode.Container
     * @mixes IFElement.Transform
     * @mixes IFElement.Style
     * @mixes IFVertexSource
     * @constructor
     */
    function IFShape() {
        IFItem.call(this);

        // Assign default properties
        this._setDefaultProperties(IFShape.GeometryProperties);
    }

    IFObject.inheritAndMix(IFShape, IFItem, [IFNode.Container, IFElement.Transform, IFElement.Style, IFVertexSource]);

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
                    return IFTransform.serialize(value);
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
                    return IFTransform.deserialize(value);
                }
                return value;
            });
            return true;
        }
        return false;
    };

    /** @override */
    IFShape.prototype._paint = function (context) {
        this._paintStyle(context);
    };

    /** @override */
    IFShape.prototype._paintStyleLayer = function (context, layer) {
        var style = this.getStyle();

        if (layer === IFStyle.Layer.Background) {
            // TODO : Check fill pattern opacity > 0
            if (!context.isOutline() && style.hasFill()) {
                context.canvas.putVertices(this);
                // TODO : Honor fill opacity
                context.canvas.fillVertices(
                    style.getProperty('fpt')
                );
            }
        } else if (layer === IFStyle.Layer.Content) {
            // TODO : Render clipped contents
        } else if (layer === IFStyle.Layer.Foreground) {
            if (!context.isOutline() && style.hasStroke()) {
                context.canvas.putVertices(this);
                // TODO : Honor stroke opacity
                context.canvas.strokeVertices(
                    style.getProperty('spt'),
                    style.getProperty('sw'),
                    style.getProperty('slc'),
                    style.getProperty('slj'),
                    style.getProperty('slm')
                );
            } else if (context.isOutline()) {
                // Outline is painted with non-transformed stroke
                // so we reset transform, transform the vertices
                // ourself and then re-apply the transformation
                var transform = context.canvas.resetTransform();
                var transformedVertices = new IFVertexTransformer(this, transform);
                context.canvas.putVertices(transformedVertices);
                context.canvas.strokeVertices(context.getOutlineColor());
                context.canvas.setTransform(transform);
            }
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

        return this.getStyle().getBBox(source);
    };

    /** @override */
    IFShape.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, IFShape.GeometryProperties);
        IFItem.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFShape.prototype._detailHitTest = function (location, transform, tolerance, force) {
        var style = this.getStyle();

        if (style.hasStroke()) {
            var outlineWidth = style.getProperty('sw') * transform.getScaleFactor() + tolerance * 2;
            var vertexHit = new IFVertexInfo.HitResult();
            if (ifVertexInfo.hitTest(location.getX(), location.getY(), new IFVertexTransformer(this, transform), outlineWidth, false, vertexHit)) {
                return new IFElement.HitResultInfo(this, new IFShape.HitResult(IFShape.HitResult.Type.Stroke, vertexHit));
            }
        }

        if (style.hasFill() || force) {
            var vertexHit = new IFVertexInfo.HitResult();
            if (ifVertexInfo.hitTest(location.getX(), location.getY(), new IFVertexTransformer(this, transform), tolerance, true, vertexHit)) {
                return new IFElement.HitResultInfo(this, new IFShape.HitResult(style.hasFill() ? IFShape.HitResult.Type.Fill : IFShape.HitResult.Type.Other, vertexHit));
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