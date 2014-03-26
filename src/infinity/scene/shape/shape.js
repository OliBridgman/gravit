(function (_) {

    /**
     * A base geometry based on vertices which is transformable and styleable
     * and may contain other elements as sub-contents
     * @class GXShape
     * @extends GXItem
     * @mixes GXNode.Container
     * @mixes GXElement.Transform
     * @mixes GXElement.Pivot
     * @mixes GXVertexSource
     * @constructor
     */
    function GXShape() {
        GXItem.call(this);
        this._setDefaultProperties(GXShape.GeometryProperties);
    }
    GObject.inheritAndMix(GXShape, GXItem, [GXNode.Container, GXElement.Transform, GXElement.Pivot, GXVertexSource]);

    /**
     * The geometry properties of a shape with their default values
     */
    GXShape.GeometryProperties = {
        trf: null
    };
    // -----------------------------------------------------------------------------------------------------------------
    // GXShape Class
    // -----------------------------------------------------------------------------------------------------------------

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
    GXShape.prototype.paint = function (context, style) {
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
            var styles = this.getStyles();
            if (styles && styles.length) {
                for (var i = 0; i < styles.length; ++i) {
                    styles[i].paint(context, this);
                }
            }
        }

        // Paint contents if any
        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            if (child instanceof GXElement) {
                context.canvas.clipVertices();
                this._paintForeground(context);
                context.canvas.resetClip();
                break;
            }
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
        var source = this.getGeometryBBox();
        if (!source) {
            return null;
        }


        var result = source;
        var styles = this.getStyles();
        if (styles && styles.length) {
            for (var i = 0; i < styles.length; ++i) {
                var styleBBox = styles[i].getBBox(source);
                if (styleBBox && !styleBBox.isEmpty()) {
                    result = result.united(styleBBox);
                }
            }
        }

        // Extend our bbox a bit to honor aa-pixels
        if (result) {
            return result.expanded(2, 2, 2, 2);
        }

        return null;
    };

    /** @override */
    GXShape.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, GXShape.GeometryProperties);
        GXItem.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GXShape.prototype._detailHitTest = function (location, transform, tolerance, force) {
        var styleHit = null;

        var styles = this.getStyles();
        if (styles && styles.length) {
            for (var i = styles.length - 1; i >= 0; --i) {
                styleHit = styles[i].hitTest(this, location, transform, tolerance);
                if (styleHit) {
                    break;
                }
            }
        }

        if (styleHit) {
            return new GXElement.HitResult(this, styleHit);
        } else if (force) {
            // When forced we'll always hit-test our whole "invisible" outline / fill area
            var vertexHit = new GXVertexInfo.HitResult();
            if (gVertexInfo.hitTest(location.getX(), location.getY(), new GXVertexTransformer(this, transform), tolerance, true, vertexHit)) {
                return new GXElement.HitResult(this, vertexHit);
            }
        } else {
            // If we didn't hit a style, then hit-test our "invisible" tolerance outline area if any
            if (tolerance) {
                var vertexHit = new GXVertexInfo.HitResult();
                if (gVertexInfo.hitTest(location.getX(), location.getY(), new GXVertexTransformer(this, transform), tolerance, false, vertexHit)) {
                    return new GXElement.HitResult(this, vertexHit);
                }
            }
        }
        return null;
    };

    /** @override */
    GXShape.prototype.toString = function () {
        return "[GXShape]";
    };

    _.GXShape = GXShape;
})(this);