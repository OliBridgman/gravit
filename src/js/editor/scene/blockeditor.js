(function (_) {
    /**
     * A base editor for shapes
     * @param {GBlock} block the block this editor works on
     * @class GBlockEditor
     * @extends GElementEditor
     * @constructor
     */
    function GBlockEditor(block) {
        GElementEditor.call(this, block);
    };
    GObject.inherit(GBlockEditor, GElementEditor);

    GBlockEditor.Flag = {
        /**
         * The editor supports edge resize handles
         * @type Number
         */
        ResizeEdges: 1 << 10,

        /**
         * The editor supports center resize handles
         * @type Number
         */
        ResizeCenters: 1 << 11,

        /**
         * The editor supports all resize handles
         * @type Number
         */
        ResizeAll: (1 << 10) | (1 << 11)
    };

    GBlockEditor.RESIZE_HANDLE_PART_ID = GUtil.uuid();

    /** @override */
    GBlockEditor.prototype.getBBoxMargin = function () {
        if (this._showResizeHandles()) {
            return GElementEditor.OPTIONS.annotationSizeSmall + 1;
        }
        return GElementEditor.prototype.getBBoxMargin.call(this);
    };

    /** @override */
    GBlockEditor.prototype.movePart = function (partId, partData, position, viewToWorldTransform, guides, shift, option) {
        GElementEditor.prototype.movePart.call(this, partId, partData, position, viewToWorldTransform, guides, shift, option);

        if (partId === GBlockEditor.RESIZE_HANDLE_PART_ID) {
            var newPos = viewToWorldTransform.mapPoint(position);
            newPos = guides.mapPoint(newPos);
            var delta = newPos.subtract(partData.point);
            var sourceBBox = this._element.getGeometryBBox();
            var transform = sourceBBox.getResizeTransform(partData.side, delta.getX(), delta.getY(), shift, option);
            this.transform(transform);
        }
    };

    /** @override */
    GBlockEditor.prototype.applyPartMove = function (partId, partData) {
        if (partId === GBlockEditor.RESIZE_HANDLE_PART_ID) {
            this.applyTransform(this._element);
        }
        GElementEditor.prototype.applyPartMove.call(this, partId, partData);
    };

    /** @override */
    GBlockEditor.prototype.paint = function (transform, context) {
        if (this.hasFlag(GElementEditor.Flag.Selected) || this.hasFlag(GElementEditor.Flag.Highlighted)) {
            var targetTransform = transform;

            // Pre-multiply internal transformation if any
            if (this._transform) {
                targetTransform = this._transform.multiplied(transform);
            }

            // Let descendant classes do some pre-painting
            this._prePaint(targetTransform, context);

            // Paint resize handles if desired
            if (this._showResizeHandles()) {
                this._iterateResizeHandles(function (point, side) {
                    this._paintAnnotation(context, transform, point, GElementEditor.Annotation.Rectangle, false, true);
                }.bind(this), transform);
            }

            // Let descendant classes do some post-painting
            this._postPaint(targetTransform, context);
        }

        // Paint any children editors now
        this._paintChildren(transform, context);
    };

    /** @override */
    GBlockEditor.prototype._getPartInfoAt = function (location, transform, tolerance) {
        // Hit-Test our resize handles if any
        if (this._showResizeHandles()) {
            var result = null;
            this._iterateResizeHandles(function (point, side) {
                if (this._getAnnotationBBox(transform, point).containsPoint(location)) {
                    result = new GElementEditor.PartInfo(this, GBlockEditor.RESIZE_HANDLE_PART_ID, {side: side, point: point}, true, false);
                    return true;
                }
            }.bind(this), transform);

            if (result) {
                return result;
            }
        }

        return null;
    };

    /**
     * Called for subclasses to do some custom painting beneath of the outline
     * @param {GTransform} transform the current transformation in use
     * @param {GPaintContext} context the paint context to paint on
     * @private
     */
    GBlockEditor.prototype._prePaint = function (transform, context) {
        // NO-OP
    };

    /**
     * Called for subclasses to do some custom painting on top of the outline
     * @param {GTransform} transform the current transformation in use
     * @param {GPaintContext} context the paint context to paint on
     * @private
     */
    GBlockEditor.prototype._postPaint = function (transform, context) {
        // NO-OP
    };

    /**
     * @returns {Boolean}
     * @private
     */
    GBlockEditor.prototype._showResizeHandles = function () {
        return this._showAnnotations() && (this.hasFlag(GBlockEditor.Flag.ResizeEdges) || this.hasFlag(GBlockEditor.Flag.ResizeCenters));
    };

    /**
     * Iterate all resize handles
     * @param {Function(point: GPoint, side: GRect.Side)} iterator
     * the iterator receiving the parameters. If this returns true then the iteration will be stopped.
     * @param {GTransform} transform - current view transformation to check that shape has enough space
     * to show resize handles
     */
    GBlockEditor.prototype._iterateResizeHandles = function (iterator, transform) {
        var bbox = this.getPaintElement().getGeometryBBox();

        if (bbox && !bbox.isEmpty()) {
            var sides = [];

            var transformedBBox = transform ? transform.mapRect(bbox) : bbox;

            if (this.hasFlag(GBlockEditor.Flag.ResizeEdges) &&
                    transformedBBox.getHeight() > (GElementEditor.OPTIONS.annotationSizeSmall + 2) * 2 &&
                    transformedBBox.getWidth() > (GElementEditor.OPTIONS.annotationSizeSmall + 2) * 2) {

                sides = sides.concat([GRect.Side.TOP_LEFT, GRect.Side.TOP_RIGHT, GRect.Side.BOTTOM_LEFT, GRect.Side.BOTTOM_RIGHT]);
            }

            if (this.hasFlag(GBlockEditor.Flag.ResizeCenters)) {
                if (transformedBBox.getHeight() > (GElementEditor.OPTIONS.annotationSizeSmall + 2) * 3) {
                    sides = sides.concat([GRect.Side.RIGHT_CENTER, GRect.Side.LEFT_CENTER]);
                }
                if (transformedBBox.getWidth() > (GElementEditor.OPTIONS.annotationSizeSmall + 2) * 3) {
                    sides = sides.concat([GRect.Side.TOP_CENTER, GRect.Side.BOTTOM_CENTER]);
                }
            }

            for (var i = 0; i < sides.length; ++i) {
                var side = sides[i];
                var point = bbox.getSide(side);
                if (iterator(point, side) === true) {
                    break;
                }
            }
        }
    };

    /**
     * Paint bbox outline of underlying element
     * @param {GTransform} transform the current transformation in use
     * @param {GPaintContext} context the paint context to paint on
     * @param {GColor} [color] the color for the outline. If not provided,
     * uses either selection or highlight color depending on the current state.
     * @private
     */
    GBlockEditor.prototype._paintBBoxOutline = function (transform, context, color) {
        // Calculate transformed geometry bbox
        var sourceRect = this._element.getGeometryBBox();
        var transformedRect = transform.mapRect(sourceRect);

        if (transformedRect && !transformedRect.isEmpty()) {
            // Ensure to pixel-align the rect
            var x = Math.floor(transformedRect.getX());
            var y = Math.floor(transformedRect.getY());
            var w = Math.ceil(transformedRect.getX() + transformedRect.getWidth()) - x;
            var h = Math.ceil(transformedRect.getY() + transformedRect.getHeight()) - y;


            if (!color) {
                if (this.hasFlag(GElementEditor.Flag.Highlighted)) {
                    color = context.highlightOutlineColor;
                } else {
                    color = context.selectionOutlineColor;
                }
            }

            context.canvas.strokeRect(x + 0.5, y + 0.5, w, h, 1, color);
        }
    };

    /** @override */
    GBlockEditor.prototype.toString = function () {
        return "[Object GBlockEditor]";
    };

    _.GBlockEditor = GBlockEditor;
})(this);