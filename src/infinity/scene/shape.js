(function (_) {

    /**
     * A base geometry based on vertices which is transformable and styleable
     * and may contain other elements as sub-contents
     * @class GXShape
     * @extends GXElement
     * @mixes GXElement.Transform
     * @mixes GXElement.Pivot
     * @mixes GXNode.Properties
     * @mixes GXNode.Container
     * @mixes GXNode.Store
     * @mixes GXVertexSource
     * @constructor
     */
    function GXShape() {
        this._setDefaultProperties(GXShape.GeometryProperties);
        this._style = new GXStyle();
    }

    GObject.inheritAndMix(GXShape, GXElement, [GXElement.Transform, GXElement.Pivot, GXNode.Properties, GXNode.Container, GXNode.Store, GXVertexSource]);

    /**
     * The geometry properties of a shape with their default values
     */
    GXShape.GeometryProperties = {
        transform: null
    };

    /**
     * The root style of the shape
     * @type {GXStyle}
     * @private
     */
    GXShape.prototype._style = null;

    /** @override */
    GXShape.prototype.transform = function (transform) {
        if (transform && !transform.isIdentity()) {
            this.setProperty('transform', this.$transform ? this.$transform.multiplied(transform) : transform);
        }
    };

    /** @override */
    GXShape.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GXLayer || parent instanceof GXShapeSet;
    };

    /** @override */
    GXShape.prototype.store = function (blob) {
        if (GXNode.Store.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXShape.GeometryProperties, function (property, value) {
                if (property === 'transform' && value) {
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
        if (GXNode.Store.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXShape.GeometryProperties, true, function (property, value) {
                if (property === 'transform' && value) {
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
        } else {
            // Paint our styling
            this._style.paint(context, this);
        }

        // Paint contents if any
        var fc = this.getFirstChild();
        if (fc && fc instanceof GXElement) {
            context.canvas.clipVertices();
            this._paintForeground(context);
            context.canvas.resetClip();
        }

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
     * any styling. By default this paints the contents
     * @param {GXPaintContext} context
     * @private
     */
    GXShape.prototype._paintForeground = function (context) {
        this._paintChildren(context);
    };

    /** @override */
    GXShape.prototype._calculateGeometryBBox = function () {
        return gVertexInfo.calculateBounds(this, true);
    };

    /** @override */
    GXShape.prototype._calculatePaintBBox = function () {
        var paintBBox = this.getGeometryBBox();
        // TODO : FIX THIS, STYLES SHOULD EXTEND PAINTBOX
        if (paintBBox) {
            paintBBox = paintBBox.expanded(2, 2, 2, 2);
        }
        return paintBBox;
    };

    /** @override */
    GXShape.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, GXShape.GeometryProperties);
        GXElement.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GXShape.prototype._detailHitTest = function (location, transform) {
        var pickDist = this.isAttached() ? this._scene.getProperty('pickDist') : 3;

        // TODO : Make correct vertex hit test here including style and document distance info
        // and return correct hit information from style and path etc. Do also correctly include
        // transformation info for outline width calculation
        var outlineWidth = 1 * transform.getScaleFactor() + (pickDist * 2);
        var hitResult = new GXVertexInfo.HitResult();
        if (gVertexInfo.hitTest(location.getX(), location.getY(), new GXVertexTransformer(this, transform), outlineWidth, true, hitResult)) {
            return new GXElement.HitResult(this);
        }
        return null;
    };

    /** @override */
    GXShape.prototype.toString = function () {
        return "[GXShape]";
    };

    _.GXShape = GXShape;
})(this);