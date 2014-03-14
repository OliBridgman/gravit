(function (_) {
    /**
     * A base editor for shapes
     * @param {GXShape} shape the shape this editor works on
     * @param {Boolean} supportBBoxResize - if true, enable resizing by BBox corner points movement
     * @class GXShapeEditor
     * @extends GXElementEditor
     * @constructor
     */
    function GXShapeEditor(shape, supportBBoxResize) {
        this._supportBBoxResize = supportBBoxResize;
        GXElementEditor.call(this, shape);
    };
    GObject.inherit(GXShapeEditor, GXElementEditor);

    GXShapeEditor.PartIds = {
        OrigBaseTopLeft: gUtil.uuid(),
        OrigBaseTopRight: gUtil.uuid(),
        OrigBaseBottomRight: gUtil.uuid(),
        OrigBaseBottomLeft: gUtil.uuid()
    };

    /**
     * Coefficient to be used for calculation of annotation paint size
     * @type {Number}
     */
    GXShapeEditor.ANNOTATION_COEFF = Math.cos(Math.PI / 4);

    /**
     * Indicates if true, enable shape resizing by BBox corner points movement
     * @type {Boolean}
     * @private
     */
    GXShapeEditor.prototype._supportBBoxResize = null;

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

            if (this._supportBBoxResize && this._showAnnotations()) {
                // paint base annotations
                this._iterateBaseCorners(true, function (args) {
                    this._paintAnnotation(context, transform, args.position,
                        GXElementEditor.Annotation.Rectangle, false, true);
                    return false;
                }.bind(this));
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
        this._elementPreview = null;

        // Need to invalidate if not having the outline flag
        // which will be removed in the super call and make
        // the invalidation, instead
        if (!this.hasFlag(GXElementEditor.Flag.Outline)) {
            this.requestInvalidation();
        }

        GXElementEditor.prototype.resetTransform.call(this);
    };

    /** @override */
    GXShapeEditor.prototype.canApplyTransform = function () {
        return this._elementPreview || this._transform && !this._transform.isIdentity();
    };

    /** @override */
    GXShapeEditor.prototype.transform = function (transform, partId, partData) {
        if (partId && this._supportBBoxResize &&
                (partId === GXShapeEditor.PartIds.OrigBaseTopLeft ||
                partId === GXShapeEditor.PartIds.OrigBaseTopRight ||
                partId === GXShapeEditor.PartIds.OrigBaseBottomRight ||
                partId === GXShapeEditor.PartIds.OrigBaseBottomLeft)) {

            this.requestInvalidation();
            this._createPreviewIfNecessary();
            this._transformBaseBBox(transform, partId);
            this.requestInvalidation();
        } else {
            GXElementEditor.prototype.transform.call(this, transform, partId, partData);
        }
    };

    /** @override */
    GXShapeEditor.prototype.resetPartMove = function (partId, partData) {
        this._elementPreview = null;
        this.removeFlag(GXElementEditor.Flag.Outline);
    };

    /** @override */
    GXShapeEditor.prototype.acceptDrop = function (position, type, source, hitData) {
        if (GXElementEditor.prototype.acceptDrop.call(this, position, type, source, hitData) === false) {
            // TODO : Styles are supposed to gain their own editors so this should become obsolete
            // TODO : Also support dropping GXSwatch
            if (type === GXElementEditor.DropType.Color) {
                var editor = GXEditor.getEditor(this.getElement().getScene());

                // Either drop on an existing style that was hit if it is a fill style or set the fill on the root styleset of the shape
                editor.beginTransaction();
                try {
                    if (hitData && hitData instanceof GXStyle.HitResult && hitData.style instanceof GXPaintFillStyle) {
                        hitData.style.setColor(source);
                    } else {
                        this.getElement().getStyle(true).setAreaColor(source);
                    }
                } finally {
                    // TODO : I18N
                    editor.commitTransaction('Drop Color');
                }
                return true;
            }
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
            var center = targetTransform.mapPoint(new GPoint(0, 0));
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

    /**
     * Called for subclasses to create specific shape preview
     * @private
     */
    GXShapeEditor.prototype._createPreviewIfNecessary = function () {
        // NO-OP
    };

    /**
     * Iterates over shape's base corners, and call iterator for them until it returns true
     * @param {Boolean} [paintElement] if true, use element's preview, if it exists, for iteration over corners
     * @param {Function([id: GXShapeEditor.PartIds, position: GPoint])} [iterator] - function to call for each corner.
     * If this returns true then the iteration will be stopped.
     * @private
     */
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

    /**
     * Returns bounding box without added annotations
     * @param {Boolean} transformed - if true, calculate element's bbox with internal transformation applied
     * @param {Boolean} paintElement - use element's preview if it exists
     * @returns {GRect} bounding box
     * @private
     */
    GXShapeEditor.prototype._getBaseBBox = function (transformed, paintElement) {
        if (!transformed) {
            return GRect(-1, -1, 2, 2);
        }

        var minX = null;
        var minY = null;
        var maxX = null;
        var maxY = null;

        this._iterateBaseCorners(paintElement, function (args) {
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

    /**
     * Apply a transformation to shape based on the transformation of base corner points
     * @param {GTransform} [transform] - a transformation to apply to corner point
     * @param {GXShapeEditor.PartIds} [partId] id of the base corner that initiated the transform
     * @private
     */
    GXShapeEditor.prototype._transformBaseBBox = function (transform, partId) {
        var sourceTransform = this._element.getTransform();
        var translation = transform.getTranslation();
        if (translation.getX() != 0 || translation.getY() != 0) {
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

        this._elementPreview.setProperty('trf', transformToApply);
    };

    /** @override */
    GXShapeEditor.prototype.toString = function () {
        return "[Object GXShapeEditor]";
    };

    _.GXShapeEditor = GXShapeEditor;
})(this);