(function (_) {
    /**
     * An editor for a polygon
     * @param {GPolygon} polygon the polygon this editor works on
     * @class GPolygonEditor
     * @extends GPathBaseEditor
     * @constructor
     */
    function GPolygonEditor(polygon) {
        GPathBaseEditor.call(this, polygon);
        this._flags |= GBlockEditor.Flag.ResizeAll;
    };
    GObject.inherit(GPolygonEditor, GPathBaseEditor);
    GElementEditor.exports(GPolygonEditor, GPolygon);

    GPolygonEditor.INSIDE_PART_ID = GUtil.uuid();
    GPolygonEditor.OUTSIDE_PART_ID = GUtil.uuid();

    /** @override */
    GPolygonEditor.prototype.getBBoxMargin = function () {
        // Don't include annotations when in showSegmentDetails mode here, as they are added in getAnnotBBox
        return GPathBaseEditor.prototype.getBBoxMargin.call(this);
    };

    /** @override */
    GPolygonEditor.prototype.getCustomBBox = function (transform, includeEditorTransform) {
        var bbox = null;
        if (this._showSegmentDetails()) {
            var trf = transform;
            // Use internal transformation if required
            if (includeEditorTransform && this._transform) {
                trf = this._transform.multiplied(transform);
            }

            var _addToBBox = function (other) {
                if (other && !other.isEmpty()) {
                    bbox = bbox ? bbox.united(other) : other;
                }
            };
            this.getPaintElement().iterateSegments(function (point, inside, angle) {
                _addToBBox(this._getAnnotationBBox(trf, point));
            }.bind(this), true);
        }
        return bbox;
    };

    /** @override */
    GPolygonEditor.prototype.movePart = function (partId, partData, position, viewToWorldTransform, guides, shift, option) {
        GPathBaseEditor.prototype.movePart.call(this, partId, partData, position, viewToWorldTransform, guides, shift, option);

        if (partId === GPolygonEditor.INSIDE_PART_ID || partId === GPolygonEditor.OUTSIDE_PART_ID) {
            var newPos = viewToWorldTransform.mapPoint(position);
            newPos = guides.mapPoint(newPos);
            var trf = this._element.getProperty('trf');
            if (trf) {
                newPos = trf.inverted().mapPoint(newPos);
            }

            if (!this._elementPreview) {
                this._elementPreview = new GPolygon();
                this._elementPreview.transferProperties(this._element,
                    [GShape.GeometryProperties, GPolygon.GeometryProperties], true);
            }

            var center = this._element.getCenter(false);
            var angle = Math.atan2(newPos.getY() - center.getY(), newPos.getX() - center.getX()) - partData;
            var distance = GMath.ptDist(newPos.getX(), newPos.getY(), center.getX(), center.getY());

            var oa = this._element.getProperty('oa');
            var or = this._element.getProperty('or');
            var ia = this._element.getProperty('ia');
            var ir = this._element.getProperty('ir');
            var ia_new = ia;
            var ir_new = ir;
            var oa_new = oa;
            var or_new = or;

            var moveInner = this._partSelection.indexOf(GPolygonEditor.INSIDE_PART_ID) >= 0;
            var moveOuter = this._partSelection.indexOf(GPolygonEditor.OUTSIDE_PART_ID) >= 0;

            if (this._partSelection.length == 1) {
                if (moveInner) {
                    if (!shift) {
                        ia_new = GMath.normalizeAngleRadians(angle + ia);
                    }
                    ir_new = distance;
                }

                if (moveOuter) {
                    if (!shift) {
                        oa_new = GMath.normalizeAngleRadians(angle + oa);
                    }
                    or_new = distance;
                }
            } else if (moveInner && moveOuter) {
                if (partId == GPolygonEditor.INSIDE_PART_ID) {
                    if (!shift) {
                        ia_new = GMath.normalizeAngleRadians(angle + ia);
                    }
                    ir_new = distance;
                    var moveX = ir_new * Math.cos(ia_new) - ir * Math.cos(ia);
                    var moveY = ir_new * Math.sin(ia_new) - ir * Math.sin(ia);
                    var oPt_new = new GPoint(or * Math.cos(oa) + moveX, or * Math.sin(oa) + moveY);
                    oa_new = Math.atan2(oPt_new.getY(), oPt_new.getX());
                    or_new = GMath.ptDist(oPt_new.getX(), oPt_new.getY(), 0, 0);
                } else if (partId == GPolygonEditor.OUTSIDE_PART_ID) {
                    if (!shift) {
                        oa_new = GMath.normalizeAngleRadians(angle + oa);
                    }
                    or_new = distance;
                    var moveX = or_new * Math.cos(oa_new) - or * Math.cos(oa);
                    var moveY = or_new * Math.sin(oa_new) - or * Math.sin(oa);
                    var iPt_new = new GPoint(ir * Math.cos(ia) + moveX, ir * Math.sin(ia) + moveY);
                    ia_new = Math.atan2(iPt_new.getY(), iPt_new.getX());
                    ir_new = GMath.ptDist(iPt_new.getX(), iPt_new.getY(), 0, 0);
                }
            }

            this._elementPreview.setProperties(['oa', 'or', 'ia', 'ir'], [oa_new, or_new, ia_new, ir_new]);
            this.requestInvalidation();
        }
    };

    /** @override */
    GPolygonEditor.prototype.applyPartMove = function (partId, partData) {
        if (partId === GPolygonEditor.INSIDE_PART_ID || partId === GPolygonEditor.OUTSIDE_PART_ID) {
            var propertyValues = this._elementPreview.getProperties(['oa', 'or', 'ia', 'ir']);
            this.resetPartMove(partId, partData);
            this._element.setProperties(['oa', 'or', 'ia', 'ir'], propertyValues);
        }
        GPathBaseEditor.prototype.applyPartMove.call(this, partId, partData);
    };


    /** @override */
    GPolygonEditor.prototype.applyTransform = function (element) {
        if (element && this._elementPreview) {
            element.transferProperties(this._elementPreview, [GShape.GeometryProperties, GPolygon.GeometryProperties]);
            this.resetTransform();
        } else {
            GPathBaseEditor.prototype.applyTransform.call(this, element);
        }
    };

    /** @override */
    GPolygonEditor.prototype._hasCenterCross = function () {
        return true;
    };

    /** @override */
    GPolygonEditor.prototype._postPaint = function (transform, context) {
        GPathBaseEditor.prototype._postPaint.call(this, transform, context);
        // If we have segments then paint 'em
        if (this._showSegmentDetails()) {
            var element = this.getPaintElement();
            element.iterateSegments(function (point, inside, angle) {
                var annotation = inside ? GElementEditor.Annotation.Circle : GElementEditor.Annotation.Diamond;
                var partId = inside ? GPolygonEditor.INSIDE_PART_ID : GPolygonEditor.OUTSIDE_PART_ID;
                this._paintAnnotation(context, transform, point, annotation, this._partSelection && this._partSelection.indexOf(partId) >= 0, false);
            }.bind(this), true);
        }
    };

    /** @override */
    GPolygonEditor.prototype._getPartInfoAt = function (location, transform, tolerance) {
        // If we have segment details then hit-test 'em first
        if (this._showSegmentDetails()) {
            var result = null;
            this._element.iterateSegments(function (point, inside, angle) {
                if (this._getAnnotationBBox(transform, point).expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {
                    var partId = inside ? GPolygonEditor.INSIDE_PART_ID : GPolygonEditor.OUTSIDE_PART_ID;
                    result = new GElementEditor.PartInfo(this, partId, angle, true, true);
                    return true;
                }
            }.bind(this), true);

            if (result) {
                return result;
            }
        }

        return GShapeEditor.prototype._getPartInfoAt.call(this, location, transform, tolerance);
    };

    /**
     * @returns {Boolean}
     * @private
     */
    GPolygonEditor.prototype._showSegmentDetails = function () {
        return this._showAnnotations() && this.hasFlag(GElementEditor.Flag.Detail) && !this._elementPreview;
    };

    /** @override */
    GPolygonEditor.prototype.toString = function () {
        return "[Object GPolygonEditor]";
    };

    _.GPolygonEditor = GPolygonEditor;
})(this);