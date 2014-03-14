(function (_) {
    /**
     * An editor for a polygon
     * @param {GXPolygon} polygon the polygon this editor works on
     * @class GXPolygonEditor
     * @extends GXPathBaseEditor
     * @constructor
     */
    function GXPolygonEditor(polygon) {
        GXPathBaseEditor.call(this, polygon, true);
    };
    GObject.inherit(GXPolygonEditor, GXPathBaseEditor);
    GXElementEditor.exports(GXPolygonEditor, GXPolygon);

    GXPolygonEditor.prototype.INSIDE_PART_ID = gUtil.uuid();
    GXPolygonEditor.prototype.OUTSIDE_PART_ID = gUtil.uuid();

    /** @override */
    GXPolygonEditor.prototype.getBBox = function (transform) {
        // Return our bbox and expand it by the annotation's approx size
        var targetTransform = transform;
        if (this._transform) {
            targetTransform = this._transform.multiplied(transform);
        }
        var bbox = this._getBaseBBox(true, true);

        if (bbox) {
            var annotSize = this._showSegmentDetails() ? GXElementEditor.OPTIONS.annotationSizeRegular
                : GXElementEditor.OPTIONS.annotationSizeSmall;

            var expandSize = annotSize / GXShapeEditor.ANNOTATION_COEFF + GXElementEditor.OPTIONS.annotationSizeSmall;
            return targetTransform.mapRect(bbox).expanded(expandSize, expandSize, expandSize, expandSize);
        } else {
            return null;
        }
    };

    /** @override */
    GXPolygonEditor.prototype.movePart = function (partId, partData, position, viewToWorldTransform, ratio) {
        if (!this.hasFlag(GXElementEditor.Flag.Outline)) {
            this.setFlag(GXElementEditor.Flag.Outline);
        } else {
            this.requestInvalidation();
        }

        var newPos = viewToWorldTransform.mapPoint(position);

        this._createPreviewIfNecessary();

        var center = this._element.getGeometryBBox().getSide(GRect.Side.CENTER);

        var angle = Math.atan2(newPos.getY() - center.getY(), newPos.getX() - center.getX()) - partData;
        var distance = gMath.ptDist(newPos.getX(), newPos.getY(), center.getX(), center.getY());

        var oa = this._element.getProperty('oa');
        var or = this._element.getProperty('or');
        var ia = this._element.getProperty('ia');
        var ir = this._element.getProperty('ir');
        var ia_new = ia;
        var ir_new = ir;
        var oa_new = oa;
        var or_new = or;

        var moveInner = this._partSelection.indexOf(GXPolygonEditor.prototype.INSIDE_PART_ID) >= 0;
        var moveOuter = this._partSelection.indexOf(GXPolygonEditor.prototype.OUTSIDE_PART_ID) >= 0;

        if (this._partSelection.length == 1) {
            if (moveInner) {
                if (!ratio) {
                    ia_new = gMath.normalizeAngleRadians(angle + ia);
                }
                ir_new = distance;
            }

            if (moveOuter) {
                if (!ratio) {
                    oa_new = gMath.normalizeAngleRadians(angle + oa);
                }
                or_new = distance;
            }
        } else if (moveInner && moveOuter) {
            if (partId == GXPolygonEditor.prototype.INSIDE_PART_ID) {
                if (!ratio) {
                    ia_new = gMath.normalizeAngleRadians(angle + ia);
                }
                ir_new = distance;
                var moveX = ir_new * Math.cos(ia_new) - ir * Math.cos(ia);
                var moveY = ir_new * Math.sin(ia_new) - ir * Math.sin(ia);
                var oPt_new = new GPoint(or * Math.cos(oa) + moveX, or * Math.sin(oa) + moveY);
                oa_new = Math.atan2(oPt_new.getY(), oPt_new.getX());
                or_new = gMath.ptDist(oPt_new.getX(), oPt_new.getY(), 0, 0);
            } else if (partId == GXPolygonEditor.prototype.OUTSIDE_PART_ID) {
                if (!ratio) {
                    oa_new = gMath.normalizeAngleRadians(angle + oa);
                }
                or_new = distance;
                var moveX = or_new * Math.cos(oa_new) - or * Math.cos(oa);
                var moveY = or_new * Math.sin(oa_new) - or * Math.sin(oa);
                var iPt_new = new GPoint(ir * Math.cos(ia) + moveX, ir * Math.sin(ia) + moveY);
                ia_new = Math.atan2(iPt_new.getY(), iPt_new.getX());
                ir_new = gMath.ptDist(iPt_new.getX(), iPt_new.getY(), 0, 0);
            }
        }

        this._elementPreview.setProperties(['oa', 'or', 'ia', 'ir'], [oa_new, or_new, ia_new, ir_new]);
        this.requestInvalidation();
    };

    /** @override */
    GXPolygonEditor.prototype.resetPartMove = function (partId, partData) {
        this._elementPreview = null;
        this.removeFlag(GXElementEditor.Flag.Outline);
    };

    /** @override */
    GXPolygonEditor.prototype.applyPartMove = function (partId, partData) {
        var propertyValues = this._elementPreview.getProperties(['oa', 'or', 'ia', 'ir']);
        this.resetPartMove(partId, partData);
        this._element.setProperties(['oa', 'or', 'ia', 'ir'], propertyValues);
    };


    /** @override */
    GXPolygonEditor.prototype.applyTransform = function (element) {
        if (element && this._elementPreview) {
            element.transferProperties(this._elementPreview, [GXShape.GeometryProperties, GXPolygon.GeometryProperties]);
            this.resetTransform();
        } else {
            GXPathBaseEditor.prototype.applyTransform.call(this, element);
        }
    };

    /** @override */
    GXPolygonEditor.prototype._hasCenterCross = function () {
        return true;
    };

    /** @override */
    GXPolygonEditor.prototype._paintCustom = function (transform, context) {
        // If we have segments then paint 'em
        if (this._showSegmentDetails()) {
            var element = this.getPaintElement();
            element.iterateSegments(function (point, inside, angle) {
                var annotation = inside ? GXElementEditor.Annotation.Circle : GXElementEditor.Annotation.Diamond;
                var partId = inside ? GXPolygonEditor.prototype.INSIDE_PART_ID : GXPolygonEditor.prototype.OUTSIDE_PART_ID;
                this._paintAnnotation(context, transform, point, annotation, this._partSelection && this._partSelection.indexOf(partId) >= 0, false);
            }.bind(this), true);
        }
    };

    /** @override */
    GXPolygonEditor.prototype._getPartInfoAt = function (location, transform, tolerance) {
        var result = GXShapeEditor.prototype._getPartInfoAt.call(this, location, transform, tolerance);
        if (result) {
            return result;
        }

        // If we have segment details then hit-test 'em first
        if (this._showSegmentDetails()) {
            var result = null;
            this._element.iterateSegments(function (point, inside, angle) {
                if (this._getAnnotationBBox(transform, point).expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {
                    var partId = inside ? GXPolygonEditor.prototype.INSIDE_PART_ID : GXPolygonEditor.prototype.OUTSIDE_PART_ID;
                    result = new GXElementEditor.PartInfo(this, partId, angle, true, true);
                    return true;
                }
            }.bind(this), true);

            if (result) {
                return result;
            }
        }

        return null;
    };

    /**
     * @returns {Boolean}
     * @private
     */
    GXPolygonEditor.prototype._showSegmentDetails = function () {
        return this._showAnnotations() && this.hasFlag(GXElementEditor.Flag.Detail) && !this._elementPreview;
    };

    /** @override */
    GXPolygonEditor.prototype._createPreviewIfNecessary = function () {
        if (!this._elementPreview) {
            this._elementPreview = new GXPolygon();
            this._elementPreview.transferProperties(this._element,
                [GXShape.GeometryProperties, GXPolygon.GeometryProperties], true);
        }
    };

    /** @override */
    GXPolygonEditor.prototype._getBaseBBox = function (transformed, paintElement) {
        var element = paintElement ? this.getPaintElement() : this._element;
        var minX = null;
        var minY = null;
        var maxX = null;
        var maxY = null;

        element.iterateSegments(function (point, inside, angle) {
            var x = point.getX();
            var y = point.getY();
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
        }.bind(this), transformed ? true : false);

        if (minX != null && minY != null) {
            return new GRect(minX, minY, maxX - minX, maxY - minY);
        }

        return null;
    };

    /** @override */
    GXPolygonEditor.prototype._iterateBaseCorners = function (paintElement, iterator) {
        var element = paintElement ? this.getPaintElement() : this._element;
        var transform = element.getTransform();
        var bbox = this._getBaseBBox(false, paintElement);
        var itArgs = [];
        if (bbox) {
            if (transform) {
                bbox = transform.mapRect(bbox);
            }

            itArgs = [
                {id: GXShapeEditor.PartIds.OrigBaseTopLeft,
                    position: bbox.getSide(GRect.Side.TOP_LEFT)},
                {id: GXShapeEditor.PartIds.OrigBaseTopRight,
                    position: bbox.getSide(GRect.Side.TOP_RIGHT)},
                {id: GXShapeEditor.PartIds.OrigBaseBottomRight,
                    position: bbox.getSide(GRect.Side.BOTTOM_RIGHT)},
                {id: GXShapeEditor.PartIds.OrigBaseBottomLeft,
                    position: bbox.getSide(GRect.Side.BOTTOM_LEFT)}
            ];
        }

        for (var i = 0; i < itArgs.length; ++i) {
            if (iterator(itArgs[i]) === true) {
                break;
            }
        }
    };

    /** @override */
    GXPolygonEditor.prototype._transformBaseBBox = function (transform, partId) {
        var sourceTransform = this._element.getTransform();
        var bbox = this._getBaseBBox(true, false);
        var tl = bbox.getSide(GRect.Side.TOP_LEFT);
        var tr = bbox.getSide(GRect.Side.TOP_RIGHT);
        var br = bbox.getSide(GRect.Side.BOTTOM_RIGHT);
        var bl = bbox.getSide(GRect.Side.BOTTOM_LEFT);
        var width = bbox.getWidth();
        var height = bbox.getHeight();
        var transformToApply = transform;

        if (partId == GXShapeEditor.PartIds.OrigBaseTopLeft) {
            var otl = transform.mapPoint(tl);

            var sTransform = new GTransform(
                1 - otl.subtract(tl).getX() / width, 0,
                0, 1 - otl.subtract(tl).getY() / height,
                0, 0);

            transformToApply = new GTransform(1, 0, 0, 1, -br.getX(), -br.getY()).multiplied(sTransform).translated(br.getX(), br.getY());
        } else if (partId == GXShapeEditor.PartIds.OrigBaseTopRight) {
            var otr = transform.mapPoint(tr);

            var sTransform = new GTransform(
                1 + otr.subtract(tr).getX() / width, 0,
                0, 1 - otr.subtract(tr).getY() / height,
                0, 0);

            transformToApply = new GTransform(1, 0, 0, 1, -bl.getX(), -bl.getY()).multiplied(sTransform).translated(bl.getX(), bl.getY());
        } else if (partId == GXShapeEditor.PartIds.OrigBaseBottomRight) {
            var obr = transform.mapPoint(br);

            var sTransform = new GTransform(
                1 + obr.subtract(br).getX() / width, 0,
                0, 1 + obr.subtract(br).getY() / height,
                0, 0);

            transformToApply = new GTransform(1, 0, 0, 1, -tl.getX(), -tl.getY()).multiplied(sTransform).translated(tl.getX(), tl.getY());
        } else if (partId == GXShapeEditor.PartIds.OrigBaseBottomLeft) {
            var obl = transform.mapPoint(bl);

            var sTransform = new GTransform(
                1 - obl.subtract(bl).getX() / width, 0,
                0, 1 + obl.subtract(bl).getY() / height,
                0, 0);

            transformToApply = new GTransform(1, 0, 0, 1, -tr.getX(), -tr.getY()).multiplied(sTransform).translated(tr.getX(), tr.getY());
        }

        if (sourceTransform) {
            transformToApply = sourceTransform.multiplied(transformToApply);
        }

        this._elementPreview.setProperty('trf', transformToApply);
    };


    /** @override */
    GXPolygonEditor.prototype.toString = function () {
        return "[Object GXPolygonEditor]";
    };

    _.GXPolygonEditor = GXPolygonEditor;
})(this);