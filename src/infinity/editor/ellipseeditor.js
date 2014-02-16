(function (_) {
    /**
     * An editor for an ellipse
     * @param {GXEllipse} ellipse the ellipse this editor works on
     * @class GXEllipseEditor
     * @extends GXPathBaseEditor
     * @constructor
     */
    function GXEllipseEditor(ellipse) {
        GXPathBaseEditor.call(this, ellipse);
    };
    GObject.inherit(GXEllipseEditor, GXPathBaseEditor);
    GXElementEditor.exports(GXEllipseEditor, GXEllipse);

    GXEllipseEditor.prototype.START_ANGLE_PART_ID = gUtil.uuid();
    GXEllipseEditor.prototype.END_ANGLE_PART_ID = gUtil.uuid();

    /** @override */
    GXEllipseEditor.prototype.getBBox = function (transform) {
        // Return our bbox and expand it by the annotation's approx size
        var targetTransform = transform;
        if (this._transform) {
            targetTransform = this._transform.multiplied(transform);
        }

        var bbox = this._getBaseBBox();

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
    GXEllipseEditor.prototype.movePart = function (partId, partData, position, ratio) {
        if (!this.hasFlag(GXElementEditor.Flag.Outline)) {
            this.setFlag(GXElementEditor.Flag.Outline);
        } else {
            this.requestInvalidation();
        }

        this._createEllipsePreviewIfNecessary();
        var sourceTransform = this._element.getProperty('transform');
        if (sourceTransform) {
            var sPosition = sourceTransform.inverted().mapPoint(position);
        } else {
            var sPosition = position;
        }
        var angle = Math.atan2(sPosition.getY(), sPosition.getX());
        var sa = this._element.getProperty('sa');
        var ea = this._element.getProperty('ea');
        if (partId == GXEllipseEditor.prototype.START_ANGLE_PART_ID) {
            var aDelta = angle - sa;
        } else { // end angle
            var aDelta = angle - ea;
        }

        var moveStart = this._partSelection.indexOf(GXEllipseEditor.prototype.START_ANGLE_PART_ID) >= 0;
        var moveEnd = this._partSelection.indexOf(GXEllipseEditor.prototype.END_ANGLE_PART_ID) >= 0;

        if (moveStart || moveEnd) {
            this._elementPreview.setProperties(['sa', 'ea'],
                [moveStart ? gMath.normalizeAngleRadians(sa + aDelta) : sa,
                    moveEnd ? gMath.normalizeAngleRadians(ea + aDelta) : ea]);

            this.requestInvalidation();
        }
    };

    /** @override */
    GXEllipseEditor.prototype.applyPartMove = function (partId, partData) {
        var propertyValues = this._elementPreview.getProperties(['sa', 'ea']);
        this.resetPartMove(partId, partData);
        this._element.setProperties(['sa', 'ea'], propertyValues);
    };

    /** @override */
    GXEllipseEditor.prototype.transform = function (transform, partId, partData) {
        if (partId) {
            this.requestInvalidation();
            this._createEllipsePreviewIfNecessary();
            var sourceTransform = this._element.getProperty('transform');
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
            this.requestInvalidation();
        } else {
            GXPathBaseEditor.prototype.transform.call(this, transform, partId, partData);
        }
    };

    /** @override */
    GXEllipseEditor.prototype.applyTransform = function (element) {
        if (element && this._elementPreview) {
            element.transferProperties(this._elementPreview, [GXShape.GeometryProperties, GXEllipse.GeometryProperties]);
            this.resetTransform();
        } else {
            GXPathBaseEditor.prototype.applyTransform.call(this, element);
        }
    };

    /** @override */
    GXEllipseEditor.prototype._hasCenterCross = function () {
        return true;
    };

    /** @override */
    GXEllipseEditor.prototype._paintCustom = function (transform, context) {
        // paint base annotations anyway
        this._iterateBaseCorners(true, function (args) {
            this._paintAnnotation(context, transform, args.position,
                GXElementEditor.Annotation.Rectangle, false, true);
            return false;
        }.bind(this));
        // If we have segments then paint 'em
        if (this._showSegmentDetails()) {
            this._iterateArcEnds(true, function (args) {
                var annotation = (args.id == GXEllipseEditor.prototype.START_ANGLE_PART_ID)
                    ? GXElementEditor.Annotation.Diamond
                    : GXElementEditor.Annotation.Circle;

                var selected = (this._partSelection && this._partSelection.indexOf(args.id) >= 0);
                this._paintAnnotation(context, transform, args.position, annotation, selected, false);
                return false;
            }.bind(this));
        }
    };

    /** @override */
    GXEllipseEditor.prototype._getPartInfoAt = function (location, transform) {
        var result = GXShapeEditor.prototype._getPartInfoAt.call(this, location, transform);
        if (result) {
            return result;
        }
        // If we have segment details then hit-test 'em
        if (this._showSegmentDetails()) {
            result = null;
            var pickDist = this._element.getScene() ? this._element.getScene().getProperty('pickDist') / 2 : 1.5;

            this._iterateArcEnds(false, function (args) {
                if (this._getAnnotationBBox(transform, args.position)
                        .expanded(pickDist, pickDist, pickDist, pickDist).containsPoint(location)) {
                    result = new GXElementEditor.PartInfo(this, args.id, null, true, true);
                    return true;
                }
                return false;
            }.bind(this));

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
    GXEllipseEditor.prototype._showSegmentDetails = function () {
        return this._showAnnotations() && this.hasFlag(GXElementEditor.Flag.Detail) && !this._elementPreview;
    };

    GXEllipseEditor.prototype._createEllipsePreviewIfNecessary = function () {
        if (!this._elementPreview) {
            this._elementPreview = new GXEllipse();
            this._elementPreview.transferProperties(this._element, [GXShape.GeometryProperties, GXEllipse.GeometryProperties]);
        }
    };

    GXEllipseEditor.prototype._iterateArcEnds = function (paintElement, iterator) {
        var element = paintElement ? this.getPaintElement() : this._element;
        var transform = element.getProperty('transform');
        var startA = element.getProperty('sa');
        var endA = element.getProperty('ea');
        transform = transform ? transform : new GTransform(1, 0, 0, 1, 0, 0);
        var itArgs = [
            {id: GXEllipseEditor.prototype.START_ANGLE_PART_ID,
                position: transform.mapPoint(new GPoint(Math.cos(startA), Math.sin(startA)))},
            {id: GXEllipseEditor.prototype.END_ANGLE_PART_ID,
                position: transform.mapPoint(new GPoint(Math.cos(endA), Math.sin(endA)))}
        ];

        for (var i = 0; i < itArgs.length; ++i) {
            if (iterator(itArgs[i]) === true) {
                break;
            }
        }
    };

    /** @override */
    GXEllipseEditor.prototype.toString = function () {
        return "[Object GXEllipseEditor]";
    };

    _.GXEllipseEditor = GXEllipseEditor;
})(this);