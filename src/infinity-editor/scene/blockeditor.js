(function (_) {
    /**
     * A base editor for shapes
     * @param {IFBlock} block the block this editor works on
     * @class IFBlockEditor
     * @extends IFElementEditor
     * @constructor
     */
    function IFBlockEditor(block) {
        IFElementEditor.call(this, block);
    };
    IFObject.inherit(IFBlockEditor, IFElementEditor);

    IFBlockEditor.Flag = {
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

    IFBlockEditor.RESIZE_HANDLE_PART_ID = ifUtil.uuid();

    /** @override */
    IFBlockEditor.prototype.getBBoxMargin = function () {
        if (this._showResizeHandles()) {
            return IFElementEditor.OPTIONS.annotationSizeSmall + 1;
        }
        return IFElementEditor.prototype.getBBoxMargin.call(this);
    };

    /** @override */
    IFBlockEditor.prototype.movePart = function (partId, partData, position, viewToWorldTransform, guides, shift, option) {
        IFElementEditor.prototype.movePart.call(this, partId, partData, position, viewToWorldTransform, guides, shift, option);

        if (partId === IFBlockEditor.RESIZE_HANDLE_PART_ID) {
            var newPos = viewToWorldTransform.mapPoint(position);
            newPos = guides.mapPoint(newPos);
            var delta = newPos.subtract(partData.point);
            var sourceBBox = this._element.getGeometryBBox();
            var transform = sourceBBox.getResizeTransform(partData.side, delta.getX(), delta.getY(), shift, option);
            this.transform(transform);
        }
    };

    /** @override */
    IFBlockEditor.prototype.applyPartMove = function (partId, partData) {
        if (partId === IFBlockEditor.RESIZE_HANDLE_PART_ID) {
            this.applyTransform(this._element);
        }
        IFElementEditor.prototype.applyPartMove.call(this, partId, partData);
    };

    /** @override */
    IFBlockEditor.prototype.paint = function (transform, context) {
        if (this.hasFlag(IFElementEditor.Flag.Selected) || this.hasFlag(IFElementEditor.Flag.Highlighted)) {
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
                    this._paintAnnotation(context, transform, point, IFElementEditor.Annotation.Rectangle, false, true);
                }.bind(this), transform);
            }

            // Let descendant classes do some post-painting
            this._postPaint(targetTransform, context);
        }

        // Paint any children editors now
        this._paintChildren(transform, context);
    };

    /** @override */
    IFBlockEditor.prototype._getPartInfoAt = function (location, transform, tolerance) {
        // Hit-Test our resize handles if any
        if (this._showResizeHandles()) {
            var result = null;
            this._iterateResizeHandles(function (point, side) {
                if (this._getAnnotationBBox(transform, point).containsPoint(location)) {
                    result = new IFElementEditor.PartInfo(this, IFBlockEditor.RESIZE_HANDLE_PART_ID, {side: side, point: point}, true, false);
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
     * @param {IFTransform} transform the current transformation in use
     * @param {IFPaintContext} context the paint context to paint on
     * @private
     */
    IFBlockEditor.prototype._prePaint = function (transform, context) {
        // NO-OP
    };

    /**
     * Called for subclasses to do some custom painting on top of the outline
     * @param {IFTransform} transform the current transformation in use
     * @param {IFPaintContext} context the paint context to paint on
     * @private
     */
    IFBlockEditor.prototype._postPaint = function (transform, context) {
        // NO-OP
    };

    /**
     * @returns {Boolean}
     * @private
     */
    IFBlockEditor.prototype._showResizeHandles = function () {
        return this._showAnnotations() && (this.hasFlag(IFBlockEditor.Flag.ResizeEdges) || this.hasFlag(IFBlockEditor.Flag.ResizeCenters));
    };

    /**
     * Iterate all resize handles
     * @param {Function(point: IFPoint, side: IFRect.Side)} iterator
     * the iterator receiving the parameters. If this returns true then the iteration will be stopped.
     * @param {IFTransform} transform - current view transformation to check that shape has enough space
     * to show resize handles
     */
    IFBlockEditor.prototype._iterateResizeHandles = function (iterator, transform) {
        var bbox = this.getPaintElement().getGeometryBBox();

        if (bbox && !bbox.isEmpty()) {
            var sides = [];

            var transformedBBox = transform ? transform.mapRect(bbox) : bbox;

            if (this.hasFlag(IFBlockEditor.Flag.ResizeEdges) &&
                    transformedBBox.getHeight() > (IFElementEditor.OPTIONS.annotationSizeSmall + 2) * 2 &&
                    transformedBBox.getWidth() > (IFElementEditor.OPTIONS.annotationSizeSmall + 2) * 2) {

                sides = sides.concat([IFRect.Side.TOP_LEFT, IFRect.Side.TOP_RIGHT, IFRect.Side.BOTTOM_LEFT, IFRect.Side.BOTTOM_RIGHT]);
            }

            if (this.hasFlag(IFBlockEditor.Flag.ResizeCenters)) {
                if (transformedBBox.getHeight() > (IFElementEditor.OPTIONS.annotationSizeSmall + 2) * 3) {
                    sides = sides.concat([IFRect.Side.RIGHT_CENTER, IFRect.Side.LEFT_CENTER]);
                }
                if (transformedBBox.getWidth() > (IFElementEditor.OPTIONS.annotationSizeSmall + 2) * 3) {
                    sides = sides.concat([IFRect.Side.TOP_CENTER, IFRect.Side.BOTTOM_CENTER]);
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
     * @param {IFTransform} transform the current transformation in use
     * @param {IFPaintContext} context the paint context to paint on
     * @param {IFColor} [color] the color for the outline. If not provided,
     * uses either selection or highlight color depending on the current state.
     * @private
     */
    IFBlockEditor.prototype._paintBBoxOutline = function (transform, context, color) {
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
                if (this.hasFlag(IFElementEditor.Flag.Highlighted)) {
                    color = context.highlightOutlineColor;
                } else {
                    color = context.selectionOutlineColor;
                }
            }

            context.canvas.strokeRect(x + 0.5, y + 0.5, w, h, 1, color);
        }
    };

    /** @override */
    IFBlockEditor.prototype.toString = function () {
        return "[Object IFBlockEditor]";
    };

    _.IFBlockEditor = IFBlockEditor;
})(this);