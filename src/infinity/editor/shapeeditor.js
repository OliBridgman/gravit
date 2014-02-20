(function (_) {
    /**
     * A base editor for shapes
     * @param {GXShape} shape the shape this editor works on
     * @class GXShapeEditor
     * @extends GXElementEditor
     * @constructor
     */
    function GXShapeEditor(shape) {
        GXElementEditor.call(this, shape);
    };
    GObject.inherit(GXShapeEditor, GXElementEditor);

    GXShapeEditor.PartIds = {
        OrigBaseTopLeft: gUtil.uuid(),
        OrigBaseTopRight: gUtil.uuid(),
        OrigBaseBottomRight: gUtil.uuid(),
        OrigBaseBottomLeft: gUtil.uuid()
    };

    /** @override */
    GXShapeEditor.prototype.paint = function (transform, context) {
        if (this.hasFlag(GXElementEditor.Flag.Selected) || this.hasFlag(GXElementEditor.Flag.Highlighted)) {
            var targetTransform = transform;
            var element = this.getPaintElement();

            // Pre-multiply internal transformation if any
            if (this._transform) {
                targetTransform = this._transform.multiplied(transform);
            }

            // Work in transformed coordinates to avoid scaling outline
            var transformer = new GXVertexTransformer(element, targetTransform);

            // Add vertices with pixel alignment for (hopefully) sharper outlines
            context.canvas.putVertices(new GXVertexPixelAligner(transformer));

            // Paint either outlined or highlighted (highlighted has a higher precedence)
            if (this.hasFlag(GXElementEditor.Flag.Highlighted)) {
                context.canvas.strokeVertices(context.highlightOutlineColor, 2);
            } else {
                context.canvas.strokeVertices(context.selectionOutlineColor, 1);
            }

            // Let sub classes paint custom stuff here
            this._paintCustom(targetTransform, context);

            // Paint center cross if desired + selected + in detail mode
            if (this.hasFlag(GXElementEditor.Flag.Selected) && this.hasFlag(GXElementEditor.Flag.Detail) && this._hasCenterCross()) {
                this._paintCenterCross(targetTransform, context);
            }
        }

        // Paint any children editors now
        this._paintChildren(transform, context);
    };

    /** @override */
    GXShapeEditor.prototype.resetTransform = function () {
        this.releaseElementPreview();

        // Need to invalidate if not having the outline flag
        // which will be removed in the super call and make
        // the invalidation, instead
        if (!this.hasFlag(GXElementEditor.Flag.Outline)) {
            this.requestInvalidation();
        }

        GXElementEditor.prototype.resetTransform.call(this);
    };

    /** @override */
    GXShapeEditor.prototype.resetPartMove = function (partId, partData) {
        this.releaseElementPreview();
        this.removeFlag(GXElementEditor.Flag.Outline);
    };

    /** @override */
    GXShapeEditor.prototype.acceptDrop = function (position, type, source) {
        if (GXElementEditor.prototype.acceptDrop.call(this, position, type, source) === false) {
            // We can handle colors so check for a color
            if (type === GXElementEditor.DropType.Color) {
                this.getElement().getStyle().getFirstChild().__setFill(source ? source.asString() : null);
                //this.getElement().setProperty('color', source ? source.asString() : null);
                return true;
            }
            return false;
        }
        return true;
    };

    /**
     * Called to check whether a center cross should be painted or not
     * @return {Boolean} true if a center cross should be painted, false if not (default)
     * @private
     */
    GXShapeEditor.prototype._hasCenterCross = function () {
        return false;
    };

    /**
     * Called for subclasses to do some custom painting on top of the outline
     * @param {GTransform} transform the current transformation in use
     * @param {GXPaintContext} context the paint context to paint on
     * @private
     */
    GXShapeEditor.prototype._paintCustom = function (transform, context) {
        // NO-OP
    };

    GXShapeEditor.prototype._paintCenterCross = function (transform, context) {
        var element = this.getPaintElement();
        var sourceTransform = element.getTransform();
        var targetTransform = sourceTransform ? sourceTransform : new GTransform(1, 0, 0, 1, 0, 0);
        targetTransform = transform ? targetTransform.multiplied(transform) : targetTransform;
        var crossHalfSizeMax = GXElementEditor.OPTIONS.centerCrossSize * 2;
        var tMatrix = targetTransform.getMatrix();

        if (Math.abs(tMatrix[0]) > crossHalfSizeMax && Math.abs(tMatrix[3]) > crossHalfSizeMax) {
            var center = targetTransform.mapPoint(new GPoint(0,0));
            var cx = Math.floor(center.getX()) + 0.5;
            var cy = Math.floor(center.getY()) + 0.5;
            var cs = GXElementEditor.OPTIONS.centerCrossSize / 2;
            context.canvas.strokeLine(cx - cs, cy - cs, cx + cs, cy + cs, 1, context.selectionOutlineColor);
            context.canvas.strokeLine(cx + cs, cy - cs, cx - cs, cy + cs, 1, context.selectionOutlineColor);
        }
    };

    /** @override */
    GXShapeEditor.prototype._getPartInfoAt = function (location, transform, tolerance) {
        var result = null;
        if (this._showAnnotations()) {
            var _isInAnnotationBBox = function (position, smallAnnotation) {
                if (position) {
                    return this._getAnnotationBBox(transform, position, smallAnnotation)
                        .expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location);
                } else {
                    return false;
                }
            }.bind(this);

            this._iterateBaseCorners(false, function (args) {
                var isolated = false;
                var selectable = false;

                if (_isInAnnotationBBox(args.position, true)) {
                    result = new GXElementEditor.PartInfo(
                        this, args.id,
                        null, isolated, selectable);
                    return true;
                }

                return false;
            }.bind(this));

            if (result) {
                return result;
            } else if (this.hasFlag(GXElementEditor.Flag.Detail)) {
            }
        }
        return result;
    };

    GXShapeEditor.prototype._iterateBaseCorners = function (paintElement, iterator) {
        var element = paintElement ? this.getPaintElement() : this._element;
        var transform = element.getTransform();
        transform = transform ? transform : new GTransform(1, 0, 0, 1, 0, 0);
        var itArgs = [
            {id: GXShapeEditor.PartIds.OrigBaseTopLeft,
             position: transform.mapPoint(new GPoint(-1, -1))},
            {id: GXShapeEditor.PartIds.OrigBaseTopRight,
             position: transform.mapPoint(new GPoint(1, -1))},
            {id: GXShapeEditor.PartIds.OrigBaseBottomRight,
             position: transform.mapPoint(new GPoint(1, 1))},
            {id: GXShapeEditor.PartIds.OrigBaseBottomLeft,
             position: transform.mapPoint(new GPoint(-1, 1))}
        ];

        for (var i = 0; i < itArgs.length; ++i) {
            if (iterator(itArgs[i]) === true) {
                break;
            }
        }
    };

    GXShapeEditor.prototype._getBaseBBox = function () {
        var minX = null;
        var minY = null;
        var maxX = null;
        var maxY = null;

        this._iterateBaseCorners(true, function(args) {
            var x = args.position.getX();
            var y = args.position.getY();
            if (minX == null || x < minX) {
                minX = x;
            }
            if (maxX == null || x > maxX) {
                maxX = x;
            }

            if (minY == null || y < minY) {
                minY = y;
            }
            if (maxY == null || y > maxY) {
                maxY = y;
            }
            return false;
        });

        if (minX != null && minY != null) {
            return new GRect(minX, minY, maxX - minX, maxY - minY);
        }

        return null;
    };

    GXShapeEditor.prototype._transformBaseBBox = function (transform, partId) {
        var sourceTransform = this._element.getTransform();
        var translation = transform.getTranslation();
        if (translation.getX() != 0  || translation.getY() != 0) {
            if (sourceTransform) {
                var sTranslation = sourceTransform.getTranslation();
                var oTranslation = sourceTransform.translated(-sTranslation.getX(), -sTranslation.getY())
                    .inverted().mapPoint(translation);
            } else {
                var oTranslation = translation;
            }
            if (partId == GXShapeEditor.PartIds.OrigBaseTopLeft) {
                var transformToApply = new GTransform(
                    1 - oTranslation.getX() / 2, 0,
                    0, 1 - oTranslation.getY() / 2,
                    oTranslation.getX() / 2, oTranslation.getY() / 2);
            } else if (partId == GXShapeEditor.PartIds.OrigBaseTopRight) {
                var transformToApply = new GTransform(
                    1 + oTranslation.getX() / 2, 0,
                    0, 1 - oTranslation.getY() / 2,
                    oTranslation.getX() / 2, oTranslation.getY() / 2);
            } else if (partId == GXShapeEditor.PartIds.OrigBaseBottomRight) {
                var transformToApply = new GTransform(
                    1 + oTranslation.getX() / 2, 0,
                    0, 1 + oTranslation.getY() / 2,
                    oTranslation.getX() / 2, oTranslation.getY() / 2);
            } else if (partId == GXShapeEditor.PartIds.OrigBaseBottomLeft) {
                var transformToApply = new GTransform(
                    1 - oTranslation.getX() / 2, 0,
                    0, 1 + oTranslation.getY() / 2,
                    oTranslation.getX() / 2, oTranslation.getY() / 2);
            }
            if (sourceTransform) {
                transformToApply = transformToApply.multiplied(sourceTransform);
            }
        } else {
            transformToApply = transform.multiplied(sourceTransform);
        }

        this._elementPreview.setProperty('transform', transformToApply);
    };

    /** @override */
    GXShapeEditor.prototype.toString = function () {
        return "[Object GXShapeEditor]";
    };

    _.GXShapeEditor = GXShapeEditor;
})(this);