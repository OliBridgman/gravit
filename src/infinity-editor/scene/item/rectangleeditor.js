(function (_) {
    /**
     * An editor for an rectangle
     * @param {GRectangle} rectangle the rectangle this editor works on
     * @class GRectangleEditor
     * @extends GPathBaseEditor
     * @constructor
     */
    function GRectangleEditor(rectangle) {
        GPathBaseEditor.call(this, rectangle);
        this._flags |= GBlockEditor.Flag.ResizeAll;
    };
    GObject.inherit(GRectangleEditor, GPathBaseEditor);
    GElementEditor.exports(GRectangleEditor, GRectangle);

    GRectangleEditor.LEFT_SHOULDER_PART_ID = GUtil.uuid();
    GRectangleEditor.RIGHT_SHOULDER_PART_ID = GUtil.uuid();
    GRectangleEditor.ANY_SHOULDER_PART_ID = GUtil.uuid();

    /** @override */
    GEllipseEditor.prototype.getBBoxMargin = function () {
        var source = GPathBaseEditor.prototype.getBBoxMargin.call(this);
        if (this._showSegmentDetails()) {
            return Math.max(GElementEditor.OPTIONS.annotationSizeRegular + 1, source);
        }
        return source;
    };

    /** @override */
    GRectangleEditor.prototype.movePart = function (partId, partData, position, viewToWorldTransform, guides, shift, option) {
        GPathBaseEditor.prototype.movePart.call(this, partId, partData, position, viewToWorldTransform, guides, shift, option);

        if (partId.id === GRectangleEditor.LEFT_SHOULDER_PART_ID ||
                partId.id === GRectangleEditor.RIGHT_SHOULDER_PART_ID ||
                partId.id === GRectangleEditor.ANY_SHOULDER_PART_ID) {

            var newPos = viewToWorldTransform.mapPoint(position);

            if (!this._elementPreview) {
                this._elementPreview = new GRectangle();
                this._elementPreview.transferProperties(this._element,
                    [GShape.GeometryProperties, GRectangle.GeometryProperties], true);
            }

            var sourceTransform = this._element.getTransform();
            var sourcePosition = new GPoint(partId.ap.getProperty('x'), partId.ap.getProperty('y'));
            if (sourceTransform) {
                sourcePosition = sourceTransform.mapPoint(sourcePosition);
            }
            var newLVal = null;
            var newRVal = null;

            if (partId.id == GRectangleEditor.LEFT_SHOULDER_PART_ID ||
                    partId.id === GRectangleEditor.ANY_SHOULDER_PART_ID) {

                var nearPt = this._element.getAnchorPoints().getPreviousPoint(partId.ap);
                var nearLPosition = new GPoint(nearPt.getProperty('x'), nearPt.getProperty('y'));
                nearLPosition = sourceTransform ? sourceTransform.mapPoint(nearLPosition) : nearLPosition;

                var newLShoulderPt = GMath.getVectorProjection(sourcePosition.getX(), sourcePosition.getY(),
                    nearLPosition.getX(), nearLPosition.getY(), newPos.getX(), newPos.getY(), true);

                newLVal = GMath.ptDist(newLShoulderPt.getX(), newLShoulderPt.getY(),
                    sourcePosition.getX(), sourcePosition.getY());
            }
            if (partId.id === GRectangleEditor.RIGHT_SHOULDER_PART_ID ||
                    partId.id === GRectangleEditor.ANY_SHOULDER_PART_ID) {

                var nearPt = this._element.getAnchorPoints().getNextPoint(partId.ap);
                var nearRPosition = new GPoint(nearPt.getProperty('x'), nearPt.getProperty('y'));
                nearRPosition = sourceTransform ? sourceTransform.mapPoint(nearRPosition) : nearRPosition;

                var newRShoulderPt = GMath.getVectorProjection(sourcePosition.getX(), sourcePosition.getY(),
                    nearRPosition.getX(), nearRPosition.getY(), newPos.getX(), newPos.getY(), true);

                newRVal = GMath.ptDist(newRShoulderPt.getX(), newRShoulderPt.getY(),
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
            var prefix = GRectangle.getGeometryPropertiesSidePrefix(partId.side);
            if (shift) {
                this.getPaintElement().setProperties([prefix + '_sx', prefix + '_sy'], [newVal, newVal]);
            } else if (partId.id == GRectangleEditor.LEFT_SHOULDER_PART_ID ||
                    partId.id === GRectangleEditor.ANY_SHOULDER_PART_ID && newVal == newLVal) {

                this.getPaintElement().setProperty(prefix + '_sx', newVal);
            } else { // right shoulder
                this.getPaintElement().setProperty(prefix + '_sy', newVal);
            }

            this.requestInvalidation();
        }
    };

    /** @override */
    GRectangleEditor.prototype.applyPartMove = function (partId, partData) {
        if (partId.id === GRectangleEditor.LEFT_SHOULDER_PART_ID ||
                partId.id === GRectangleEditor.RIGHT_SHOULDER_PART_ID ||
                partId.id === GRectangleEditor.ANY_SHOULDER_PART_ID) {

            this._element.transferProperties(this._elementPreview, [GRectangle.GeometryProperties]);
        }
        GPathBaseEditor.prototype.applyPartMove.call(this, partId, partData);
    };

    /** @override */
    GRectangleEditor.prototype.applyTransform = function (element) {
        if (element && this._elementPreview) {
            element.transferProperties(this._elementPreview, [GShape.GeometryProperties, GRectangle.GeometryProperties]);
            this.resetTransform();
        } else {
            GPathBaseEditor.prototype.applyTransform.call(this, element);
        }
    };

    /** @override */
    GRectangleEditor.prototype._hasCenterCross = function () {
        return true;
    };

    /** @override */
    GRectangleEditor.prototype._postPaint = function (transform, context) {
        GPathBaseEditor.prototype._postPaint.call(this, transform, context);
        // If we have segments then paint 'em
        if (this._showSegmentDetails()) {
            this.getPaintElement().iterateSegments(function (point, side, ct, sl, sr, idx) {
                var element = this.getPaintElement();
                var leftPartId = {id: GRectangleEditor.LEFT_SHOULDER_PART_ID, side: side};
                var rightPartId = {id: GRectangleEditor.RIGHT_SHOULDER_PART_ID, side: side};
                var anyPartId = {id: GRectangleEditor.ANY_SHOULDER_PART_ID, side: side};

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

                    this._paintAnnotation(context, transform, leftShoulder, GElementEditor.Annotation.Diamond,
                        this.isPartSelected(leftPartId), false);

                    var rightShoulder = sourceTransform ?
                        anchorPt.getRightShoulderPointTransformed(sourceTransform, true) :
                        anchorPt.getRightShoulderPoint(true);

                    if (!rightShoulder) {
                        rightShoulder = new GPoint(anchorPt.getProperty('x'), anchorPt.getProperty('y'));
                        rightShoulder = sourceTransform ? sourceTransform.mapPoint(rightShoulder) : rightShoulder;
                    }

                    this._paintAnnotation(context, transform, rightShoulder, GElementEditor.Annotation.Diamond,
                        this.isPartSelected(rightPartId), false);
                } else {
                    this._paintAnnotation(context, transform, point, GElementEditor.Annotation.Diamond,
                        this.isPartSelected(leftPartId) || this.isPartSelected(rightPartId) ||
                            this.isPartSelected(anyPartId), false);
                }
            }.bind(this), true);
        }
    };

    /** @override */
    GRectangleEditor.prototype._partIdAreEqual = function (a, b) {
        var eqs = (a === b) || (a.id === b.id);
        if (eqs && a.id) {
            eqs = (a.side === b.side);
        }
        return eqs;
    };

    /** @override */
    GRectangleEditor.prototype._getPartInfoAt = function (location, transform, tolerance) {
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
                        result = new GElementEditor.PartInfo(this,
                            {id: GRectangleEditor.LEFT_SHOULDER_PART_ID, side: side,
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
                        result = new GElementEditor.PartInfo(this,
                            {id: GRectangleEditor.RIGHT_SHOULDER_PART_ID, side: side,
                                ap: anchorPt, point: rightShoulder},
                            null, true, true);
                        return true;
                    }
                } else {
                    if (this._getAnnotationBBox(transform, point, true)
                        .expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {

                        result = new GElementEditor.PartInfo(this,
                            {id: GRectangleEditor.ANY_SHOULDER_PART_ID, side: side, ap: anchorPt, point: point},
                            null, true, true);
                        return true;
                    }
                }
            }.bind(this), true);

            if (result) {
                return result;
            }
        }

        return GPathBaseEditor.prototype._getPartInfoAt.call(this, location, transform, tolerance);
    };

    /**
     * @returns {Boolean}
     * @private
     */
    GRectangleEditor.prototype._showSegmentDetails = function () {
        return this._showAnnotations() && this.hasFlag(GElementEditor.Flag.Detail) && !this._elementPreview;
    };

    /** @override */
    GRectangleEditor.prototype.toString = function () {
        return "[Object GRectangleEditor]";
    };

    _.GRectangleEditor = GRectangleEditor;
})(this);