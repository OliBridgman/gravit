(function (_) {
    /**
     * An editor for a polygon
     * @param {GXPolygon} polygon the polygon this editor works on
     * @class GXPolygonEditor
     * @extends GXPathBaseEditor
     * @constructor
     */
    function GXPolygonEditor(polygon) {
        GXPathBaseEditor.call(this, polygon);
    };
    GObject.inherit(GXPolygonEditor, GXPathBaseEditor);
    GXElementEditor.exports(GXPolygonEditor, GXPolygon);

    GXPolygonEditor.INSIDE_PART_ID = gUtil.uuid();
    GXPolygonEditor.OUTSIDE_PART_ID = gUtil.uuid();

    /** @override */
    GXPolygonEditor.prototype.getBBoxMargin = function () {
        if (this._showSegmentDetails()) {
            return GXElementEditor.OPTIONS.annotationSizeRegular + 1;
        }
        return GXPathBaseEditor.prototype.getBBoxMargin.call(this);
    };

    /** @override */
    GXPolygonEditor.prototype.movePart = function (partId, partData, position, viewToWorldTransform, shift, option) {
        GXPathBaseEditor.prototype.movePart.call(this, partId, partData, position, viewToWorldTransform, shift, option);

        if (partId === GXPolygonEditor.INSIDE_PART_ID || partId === GXPolygonEditor.OUTSIDE_PART_ID) {
            var newPos = viewToWorldTransform.mapPoint(position);

            if (!this._elementPreview) {
                this._elementPreview = new GXPolygon();
                this._elementPreview.transferProperties(this._element,
                    [GXShape.GeometryProperties, GXPolygon.GeometryProperties], true);
            }

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

            var moveInner = this._partSelection.indexOf(GXPolygonEditor.INSIDE_PART_ID) >= 0;
            var moveOuter = this._partSelection.indexOf(GXPolygonEditor.OUTSIDE_PART_ID) >= 0;

            if (this._partSelection.length == 1) {
                if (moveInner) {
                    if (!shift) {
                        ia_new = gMath.normalizeAngleRadians(angle + ia);
                    }
                    ir_new = distance;
                }

                if (moveOuter) {
                    if (!shift) {
                        oa_new = gMath.normalizeAngleRadians(angle + oa);
                    }
                    or_new = distance;
                }
            } else if (moveInner && moveOuter) {
                if (partId == GXPolygonEditor.INSIDE_PART_ID) {
                    if (!shift) {
                        ia_new = gMath.normalizeAngleRadians(angle + ia);
                    }
                    ir_new = distance;
                    var moveX = ir_new * Math.cos(ia_new) - ir * Math.cos(ia);
                    var moveY = ir_new * Math.sin(ia_new) - ir * Math.sin(ia);
                    var oPt_new = new GPoint(or * Math.cos(oa) + moveX, or * Math.sin(oa) + moveY);
                    oa_new = Math.atan2(oPt_new.getY(), oPt_new.getX());
                    or_new = gMath.ptDist(oPt_new.getX(), oPt_new.getY(), 0, 0);
                } else if (partId == GXPolygonEditor.OUTSIDE_PART_ID) {
                    if (!shift) {
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
        }
    };

    /** @override */
    GXPolygonEditor.prototype.applyPartMove = function (partId, partData) {
        if (partId === GXPolygonEditor.INSIDE_PART_ID || partId === GXPolygonEditor.OUTSIDE_PART_ID) {
            var propertyValues = this._elementPreview.getProperties(['oa', 'or', 'ia', 'ir']);
            this.resetPartMove(partId, partData);
            this._element.setProperties(['oa', 'or', 'ia', 'ir'], propertyValues);
        }
        GXPathBaseEditor.prototype.applyPartMove.call(this, partId, partData);
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
    GXPolygonEditor.prototype._postPaint = function (transform, context) {
        GXPathBaseEditor.prototype._postPaint.call(this, transform, context);
        // If we have segments then paint 'em
        if (this._showSegmentDetails()) {
            var element = this.getPaintElement();
            element.iterateSegments(function (point, inside, angle) {
                var annotation = inside ? GXElementEditor.Annotation.Circle : GXElementEditor.Annotation.Diamond;
                var partId = inside ? GXPolygonEditor.INSIDE_PART_ID : GXPolygonEditor.OUTSIDE_PART_ID;
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
                    var partId = inside ? GXPolygonEditor.INSIDE_PART_ID : GXPolygonEditor.OUTSIDE_PART_ID;
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
    GXPolygonEditor.prototype.toString = function () {
        return "[Object GXPolygonEditor]";
    };

    _.GXPolygonEditor = GXPolygonEditor;
})(this);