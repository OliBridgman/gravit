(function (_) {
    /**
     * An editor for an rectangle
     * @param {GXRectangle} rectangle the rectangle this editor works on
     * @class GXRectangleEditor
     * @extends GXPathBaseEditor
     * @constructor
     */
    function GXRectangleEditor(rectangle) {
        GXPathBaseEditor.call(this, rectangle);
    };
    GObject.inherit(GXRectangleEditor, GXPathBaseEditor);
    GXElementEditor.exports(GXRectangleEditor, GXRectangle);

    GXRectangleEditor.prototype.LEFT_SHOULDER_PART_ID = gUtil.uuid();
    GXRectangleEditor.prototype.RIGHT_SHOULDER_PART_ID = gUtil.uuid();

    /** @override */
    GXRectangleEditor.prototype.getBBox = function (transform) {
        // Return our bbox and expand it by the annotation's approx size
        var targetTransform = transform;
        if (this._transform) {
            targetTransform = this._transform.multiplied(transform);
        }
        var bbox = this.getPaintElement().getGeometryBBox();
        // Return our bbox and expand it by the annotation's approx size
        if (this._showSegmentDetails()) {
            return targetTransform.mapRect(bbox).expanded(
                GXElementEditor.OPTIONS.annotationSizeRegular,
                GXElementEditor.OPTIONS.annotationSizeRegular,
                GXElementEditor.OPTIONS.annotationSizeRegular,
                GXElementEditor.OPTIONS.annotationSizeRegular);
        } else {
            return targetTransform.mapRect(bbox).expanded(
                GXElementEditor.OPTIONS.annotationSizeSmall,
                GXElementEditor.OPTIONS.annotationSizeSmall,
                GXElementEditor.OPTIONS.annotationSizeSmall,
                GXElementEditor.OPTIONS.annotationSizeSmall);
        }
    };

    /** @override */
    GXRectangleEditor.prototype.movePart = function (partId, partData, position, ratio) {
        if (!this.hasFlag(GXElementEditor.Flag.Outline)) {
            this.setFlag(GXElementEditor.Flag.Outline);
        } else {
            this.requestInvalidation();
        }
        this._createPreviewIfNecessary();
        var sourceTransform = this._element.getProperty('transform');
        var sourcePosition = new GPoint(partId.ap.getProperty('x'), partId.ap.getProperty('y'));
        if (partId.id == GXRectangleEditor.prototype.LEFT_SHOULDER_PART_ID) {
            var nearPt = this._element.getAnchorPoints().getPreviousPoint(partId.ap);
        } else {
            var nearPt = this._element.getAnchorPoints().getNextPoint(partId.ap);
        }
        var nearPosition = new GPoint(nearPt.getProperty('x'), nearPt.getProperty('y'));

        if (sourceTransform) {
            sourcePosition = sourceTransform.mapPoint(sourcePosition);
            nearPosition = sourceTransform.mapPoint(nearPosition);
        }

        var newShoulderPt = gMath.getVectorProjection(sourcePosition.getX(), sourcePosition.getY(),
            nearPosition.getX(), nearPosition.getY(), position.getX(), position.getY(), true);

        var newVal = gMath.ptDist(newShoulderPt.getX(), newShoulderPt.getY(),
            partId.point.getX(), partId.point.getY());

        var element = this.getPaintElement();
        // We do not apply element's transform to shoulders when generating vertices,
        // assign new value directly to preview corner shoulder without any further transforms
        var prefix = GXRectangle.getGeometryPropertiesSidePrefix(partId.side);
        if (ratio || this.getPaintElement().isUniformCorner(partId.side)) {
            this.getPaintElement().setProperties([prefix + '_sx', prefix + '_sy'], [newVal, newVal]);
        } else if (partId.id == GXPathEditor.PartType.LeftShoulder) {
            this.getPaintElement().setProperty(prefix + '_sx', newVal);
        } else { // right shoulder
            this.getPaintElement().setProperty(prefix + '_sy', newVal);
        }

        this.requestInvalidation();
    };

    /** @override */
    GXRectangleEditor.prototype.resetPartMove = function (partId, partData) {
        this._elementPreview = null;
        this.removeFlag(GXElementEditor.Flag.Outline);
    };

    /** @override */
    GXRectangleEditor.prototype.applyPartMove = function (partId, partData) {
        if (this._elementPreview) {
            this._element.transferProperties(this._elementPreview, [GXRectangle.GeometryProperties]);
            this.resetPartMove();
        }
    };

    /** @override */
    GXRectangleEditor.prototype.transform = function (transform, partId, partData) {
        if (partId) {
            this.requestInvalidation();
            this._createPreviewIfNecessary();
            if (partId === GXShapeEditor.PartIds.OrigBaseTopLeft ||
                partId === GXShapeEditor.PartIds.OrigBaseTopRight ||
                partId === GXShapeEditor.PartIds.OrigBaseBottomRight ||
                partId === GXShapeEditor.PartIds.OrigBaseBottomLeft) {

                this._transformBaseBBox(transform, partId);
            }
            this.requestInvalidation();
        } else {
            GXPathBaseEditor.prototype.transform.call(this, transform, partId, partData);
        }
    };

    /** @override */
    GXRectangleEditor.prototype.applyTransform = function (element) {
        if (element && this._elementPreview) {
            element.transferProperties(this._elementPreview, [GXShape.GeometryProperties, GXRectangle.GeometryProperties]);
            this.resetTransform();
        } else {
            GXPathBaseEditor.prototype.applyTransform.call(this, element);
        }
    };

    /** @override */
    GXRectangleEditor.prototype._hasCenterCross = function () {
        return true;
    };

    /** @override */
    GXRectangleEditor.prototype._paintCustom = function (transform, context) {
        // paint base annotations anyway
        this._iterateBaseCorners(true, function (args) {
            this._paintAnnotation(context, transform, args.position,
                GXElementEditor.Annotation.Rectangle, false, true);
            return false;
        }.bind(this));

        // If we have segments then paint 'em
        if (this._showSegmentDetails()) {
            this.getPaintElement().iterateSegments(function(point, side, ct, sl, sr, idx) {
                if (ct != GXPathBase.CornerType.Regular) {
                    var element = this.getPaintElement();
                    var leftPartId = {id: GXRectangleEditor.prototype.LEFT_SHOULDER_PART_ID, side: side};
                    var rightPartId = {id: GXRectangleEditor.prototype.RIGHT_SHOULDER_PART_ID, side: side};

                    if (sl != 0 && sr != 0) {
                        var anchorPt = element.getAnchorPoints().getChildByIndex(idx);
                        var sourceTransform = element.getProperty('transform');
                        var leftShoulder = sourceTransform ?
                            anchorPt.getLeftShoulderPointTransformed(sourceTransform) :
                            anchorPt.getLeftShoulderPoint();

                        this._paintAnnotation(context, transform, leftShoulder, GXElementEditor.Annotation.Diamond,
                            this.isPartSelected(leftPartId), false);

                        var rightShoulder = sourceTransform ?
                            anchorPt.getRightShoulderPointTransformed(sourceTransform) :
                            anchorPt.getRightShoulderPoint();

                        this._paintAnnotation(context, transform, rightShoulder, GXElementEditor.Annotation.Diamond,
                            this.isPartSelected(rightPartId), false);
                    } else {
                        this._paintAnnotation(context, transform, point, GXElementEditor.Annotation.Diamond,
                            this.isPartSelected(leftPartId) || this.isPartSelected(rightPartId), false);
                    }

                }
            }.bind(this), true);
        }
    };

    /** @override */
    GXRectangleEditor.prototype._partIdAreEqual = function (a, b) {
        var eqs = (a === b) || (a.id === b.id);
        if (eqs && a.id) {
            eqs = (a.side === b.side);
        }
        return eqs;
    };

    /** @override */
    GXRectangleEditor.prototype._getPartInfoAt = function (location, transform) {
        // If we have segment details then hit-test 'em first
        if (this._showSegmentDetails()) {
            result = null;
            var pickDist = this._element.getScene() ? this._element.getScene().getProperty('pickDist') / 2 : 1.5;

            this.getPaintElement().iterateSegments(function(point, side, ct, sl, sr, idx) {
                if (ct != GXPathBase.CornerType.Regular) {
                    var element = this.getPaintElement();
                    var anchorPt = element.getAnchorPoints().getChildByIndex(idx);
                    if (sl != 0 && sr != 0) {
                        var sourceTransform = element.getProperty('transform');
                        var leftShoulder = sourceTransform ?
                            anchorPt.getLeftShoulderPointTransformed(sourceTransform) :
                            anchorPt.getLeftShoulderPoint();

                        if (this._getAnnotationBBox(transform, leftShoulder)
                            .expanded(pickDist, pickDist, pickDist, pickDist).containsPoint(location)) {
                            result = new GXElementEditor.PartInfo(this,
                                {id: GXRectangleEditor.prototype.LEFT_SHOULDER_PART_ID, side: side,
                                    ap: anchorPt, point: leftShoulder},
                                null, true, true);
                            return true;
                        }

                        var rightShoulder = sourceTransform ?
                            anchorPt.getRightShoulderPointTransformed(sourceTransform) :
                            anchorPt.getRightShoulderPoint();

                        if (this._getAnnotationBBox(transform, rightShoulder)
                            .expanded(pickDist, pickDist, pickDist, pickDist).containsPoint(location)) {
                            result = new GXElementEditor.PartInfo(this,
                                {id: GXRectangleEditor.prototype.RIGHT_SHOULDER_PART_ID, side: side,
                                    ap: anchorPt, point: rightShoulder},
                                null, true, true);
                            return true;
                        }
                    } else {
                        if (this._getAnnotationBBox(transform, point, true)
                                .expanded(pickDist, pickDist, pickDist, pickDist).containsPoint(location)) {

                            result = new GXElementEditor.PartInfo(this,
                                {id: GXRectangleEditor.prototype.LEFT_SHOULDER_PART_ID, side: side, ap: anchorPt, point: point},
                                null, true, true);
                            return true;
                        }
                    }

                }
            }.bind(this), true);

            if (result) {
                return result;
            }
        }
        var result = GXShapeEditor.prototype._getPartInfoAt.call(this, location, transform);
        if (result) {
            return result;
        }

        return null;
    };

    /**
     * @returns {Boolean}
     * @private
     */
    GXRectangleEditor.prototype._showSegmentDetails = function () {
        return this._showAnnotations() && this.hasFlag(GXElementEditor.Flag.Detail) && !this._elementPreview;
    };

    GXRectangleEditor.prototype._createPreviewIfNecessary = function () {
        if (!this._elementPreview) {
            this._elementPreview = new GXRectangle();
            this._elementPreview.transferProperties(this._element, [GXShape.GeometryProperties, GXRectangle.GeometryProperties]);
        }
    };

    /** @override */
    GXRectangleEditor.prototype.toString = function () {
        return "[Object GXRectangleEditor]";
    };

    _.GXRectangleEditor = GXRectangleEditor;
})(this);