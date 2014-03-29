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
        this._flags |= GXBlockEditor.Flag.ResizeAll;
    };
    GObject.inherit(GXRectangleEditor, GXPathBaseEditor);
    GXElementEditor.exports(GXRectangleEditor, GXRectangle);

    GXRectangleEditor.LEFT_SHOULDER_PART_ID = gUtil.uuid();
    GXRectangleEditor.RIGHT_SHOULDER_PART_ID = gUtil.uuid();
    GXRectangleEditor.ANY_SHOULDER_PART_ID = gUtil.uuid();

    /** @override */
    GXEllipseEditor.prototype.getBBoxMargin = function () {
        var source = GXPathBaseEditor.prototype.getBBoxMargin.call(this);
        if (this._showSegmentDetails()) {
            return Math.max(GXElementEditor.OPTIONS.annotationSizeRegular + 1, source);
        }
        return source;
    };

    /** @override */
    GXRectangleEditor.prototype.movePart = function (partId, partData, position, viewToWorldTransform, shift, option) {
        GXPathBaseEditor.prototype.movePart.call(this, partId, partData, position, viewToWorldTransform, shift, option);

        if (partId.id === GXRectangleEditor.LEFT_SHOULDER_PART_ID ||
                partId.id === GXRectangleEditor.RIGHT_SHOULDER_PART_ID ||
                partId.id === GXRectangleEditor.ANY_SHOULDER_PART_ID) {

            var newPos = viewToWorldTransform.mapPoint(position);

            if (!this._elementPreview) {
                this._elementPreview = new GXRectangle();
                this._elementPreview.transferProperties(this._element,
                    [GXShape.GeometryProperties, GXRectangle.GeometryProperties], true);
            }

            var sourceTransform = this._element.getTransform();
            var sourcePosition = new GPoint(partId.ap.getProperty('x'), partId.ap.getProperty('y'));
            if (sourceTransform) {
                sourcePosition = sourceTransform.mapPoint(sourcePosition);
            }
            var newLVal = null;
            var newRVal = null;

            if (partId.id == GXRectangleEditor.LEFT_SHOULDER_PART_ID ||
                    partId.id === GXRectangleEditor.ANY_SHOULDER_PART_ID) {

                var nearPt = this._element.getAnchorPoints().getPreviousPoint(partId.ap);
                var nearLPosition = new GPoint(nearPt.getProperty('x'), nearPt.getProperty('y'));
                nearLPosition = sourceTransform ? sourceTransform.mapPoint(nearLPosition) : nearLPosition;

                var newLShoulderPt = gMath.getVectorProjection(sourcePosition.getX(), sourcePosition.getY(),
                    nearLPosition.getX(), nearLPosition.getY(), newPos.getX(), newPos.getY(), true);

                newLVal = gMath.ptDist(newLShoulderPt.getX(), newLShoulderPt.getY(),
                    sourcePosition.getX(), sourcePosition.getY());
            }
            if (partId.id === GXRectangleEditor.RIGHT_SHOULDER_PART_ID ||
                    partId.id === GXRectangleEditor.ANY_SHOULDER_PART_ID) {

                var nearPt = this._element.getAnchorPoints().getNextPoint(partId.ap);
                var nearRPosition = new GPoint(nearPt.getProperty('x'), nearPt.getProperty('y'));
                nearRPosition = sourceTransform ? sourceTransform.mapPoint(nearRPosition) : nearRPosition;

                var newRShoulderPt = gMath.getVectorProjection(sourcePosition.getX(), sourcePosition.getY(),
                    nearRPosition.getX(), nearRPosition.getY(), newPos.getX(), newPos.getY(), true);

                newRVal = gMath.ptDist(newRShoulderPt.getX(), newRShoulderPt.getY(),
                    sourcePosition.getX(), sourcePosition.getY());
            }

            var newVal;
            if (newRVal !== null && newLVal !== null) {
                if (newRVal > newLVal) {
                    newVal = newRVal;
                } else {
                    newVal = newLVal;
                }
            } else if (newRVal !== null) {
                newVal = newRVal;
            } else {
                newVal = newLVal;
            }

            var element = this.getPaintElement();
            // We do not apply element's transform to shoulders when generating vertices,
            // assign new value directly to preview corner shoulder without any further transforms
            var prefix = GXRectangle.getGeometryPropertiesSidePrefix(partId.side);
            if (shift) {
                this.getPaintElement().setProperties([prefix + '_sx', prefix + '_sy'], [newVal, newVal]);
            } else if (partId.id == GXRectangleEditor.LEFT_SHOULDER_PART_ID ||
                    partId.id === GXRectangleEditor.ANY_SHOULDER_PART_ID && newVal == newLVal) {

                this.getPaintElement().setProperty(prefix + '_sx', newVal);
            } else { // right shoulder
                this.getPaintElement().setProperty(prefix + '_sy', newVal);
            }

            this.requestInvalidation();
        }
    };

    /** @override */
    GXRectangleEditor.prototype.applyPartMove = function (partId, partData) {
        if (partId.id === GXRectangleEditor.LEFT_SHOULDER_PART_ID ||
                partId.id === GXRectangleEditor.RIGHT_SHOULDER_PART_ID ||
                partId.id === GXRectangleEditor.ANY_SHOULDER_PART_ID) {

            this._element.transferProperties(this._elementPreview, [GXRectangle.GeometryProperties]);
        }
        GXPathBaseEditor.prototype.applyPartMove.call(this, partId, partData);
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
    GXRectangleEditor.prototype._postPaint = function (transform, context) {
        GXPathBaseEditor.prototype._postPaint.call(this, transform, context);
        // If we have segments then paint 'em
        if (this._showSegmentDetails()) {
            this.getPaintElement().iterateSegments(function (point, side, ct, sl, sr, idx) {
                var element = this.getPaintElement();
                var leftPartId = {id: GXRectangleEditor.LEFT_SHOULDER_PART_ID, side: side};
                var rightPartId = {id: GXRectangleEditor.RIGHT_SHOULDER_PART_ID, side: side};
                var anyPartId = {id: GXRectangleEditor.ANY_SHOULDER_PART_ID, side: side};

                if (sl != 0 || sr != 0) {
                    var anchorPt = element.getAnchorPoints().getChildByIndex(idx);
                    var sourceTransform = element.getTransform();
                    var leftShoulder = sourceTransform ?
                        anchorPt.getLeftShoulderPointTransformed(sourceTransform, true) :
                        anchorPt.getLeftShoulderPoint(true);

                    if (!leftShoulder) {
                        leftShoulder = new GPoint(anchorPt.getProperty('x'), anchorPt.getProperty('y'));
                        leftShoulder = sourceTransform ? sourceTransform.mapPoint(leftShoulder) : leftShoulder;
                    }

                    this._paintAnnotation(context, transform, leftShoulder, GXElementEditor.Annotation.Diamond,
                        this.isPartSelected(leftPartId), false);

                    var rightShoulder = sourceTransform ?
                        anchorPt.getRightShoulderPointTransformed(sourceTransform, true) :
                        anchorPt.getRightShoulderPoint(true);

                    if (!rightShoulder) {
                        rightShoulder = new GPoint(anchorPt.getProperty('x'), anchorPt.getProperty('y'));
                        rightShoulder = sourceTransform ? sourceTransform.mapPoint(rightShoulder) : rightShoulder;
                    }

                    this._paintAnnotation(context, transform, rightShoulder, GXElementEditor.Annotation.Diamond,
                        this.isPartSelected(rightPartId), false);
                } else {
                    this._paintAnnotation(context, transform, point, GXElementEditor.Annotation.Diamond,
                        this.isPartSelected(leftPartId) || this.isPartSelected(rightPartId) ||
                            this.isPartSelected(anyPartId), false);
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
    GXRectangleEditor.prototype._getPartInfoAt = function (location, transform, tolerance) {
        // If we have segment details then hit-test 'em first
        if (this._showSegmentDetails()) {
            var result = null;
            this.getPaintElement().iterateSegments(function (point, side, ct, sl, sr, idx) {
                var element = this.getPaintElement();
                var anchorPt = element.getAnchorPoints().getChildByIndex(idx);
                if (sl != 0 || sr != 0) {
                    var sourceTransform = element.getTransform();
                    var leftShoulder = sourceTransform ?
                        anchorPt.getLeftShoulderPointTransformed(sourceTransform, true) :
                        anchorPt.getLeftShoulderPoint(true);

                    if (!leftShoulder) {
                        leftShoulder = new GPoint(anchorPt.getProperty('x'), anchorPt.getProperty('y'));
                        leftShoulder = sourceTransform ? sourceTransform.mapPoint(leftShoulder) : leftShoulder;
                    }

                    if (this._getAnnotationBBox(transform, leftShoulder)
                        .expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {
                        result = new GXElementEditor.PartInfo(this,
                            {id: GXRectangleEditor.LEFT_SHOULDER_PART_ID, side: side,
                                ap: anchorPt, point: leftShoulder},
                            null, true, true);
                        return true;
                    }

                    var rightShoulder = sourceTransform ?
                        anchorPt.getRightShoulderPointTransformed(sourceTransform, true) :
                        anchorPt.getRightShoulderPoint(true);

                    if (!rightShoulder) {
                        rightShoulder = new GPoint(anchorPt.getProperty('x'), anchorPt.getProperty('y'));
                        rightShoulder = sourceTransform ? sourceTransform.mapPoint(rightShoulder) : rightShoulder;
                    }

                    if (this._getAnnotationBBox(transform, rightShoulder)
                        .expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {
                        result = new GXElementEditor.PartInfo(this,
                            {id: GXRectangleEditor.RIGHT_SHOULDER_PART_ID, side: side,
                                ap: anchorPt, point: rightShoulder},
                            null, true, true);
                        return true;
                    }
                } else {
                    if (this._getAnnotationBBox(transform, point, true)
                        .expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {

                        result = new GXElementEditor.PartInfo(this,
                            {id: GXRectangleEditor.ANY_SHOULDER_PART_ID, side: side, ap: anchorPt, point: point},
                            null, true, true);
                        return true;
                    }
                }
            }.bind(this), true);

            if (result) {
                return result;
            }
        }

        return GXPathBaseEditor.prototype._getPartInfoAt.call(this, location, transform, tolerance);
    };

    /**
     * @returns {Boolean}
     * @private
     */
    GXRectangleEditor.prototype._showSegmentDetails = function () {
        return this._showAnnotations() && this.hasFlag(GXElementEditor.Flag.Detail) && !this._elementPreview;
    };

    /** @override */
    GXRectangleEditor.prototype.toString = function () {
        return "[Object GXRectangleEditor]";
    };

    _.GXRectangleEditor = GXRectangleEditor;
})(this);