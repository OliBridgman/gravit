(function (_) {
    /**
     * An editor for an ellipse
     * @param {GXEllipse} ellipse the ellipse this editor works on
     * @class GXEllipseEditor
     * @extends GXPathBaseEditor
     * @constructor
     */
    function GXEllipseEditor(ellipse) {
        GXPathBaseEditor.call(this, ellipse, true);
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
        var bbox = this._getBaseBBox(true, true);

        var annotSize = this._showSegmentDetails() ? GXElementEditor.OPTIONS.annotationSizeRegular
            : GXElementEditor.OPTIONS.annotationSizeSmall;

        var expandSize = annotSize / GXShapeEditor.ANNOTATION_COEFF + GXElementEditor.OPTIONS.annotationSizeSmall;
        return targetTransform.mapRect(bbox).expanded(expandSize, expandSize, expandSize, expandSize);
    };

    /** @override */
    GXEllipseEditor.prototype.movePart = function (partId, partData, position, viewToWorldTransform, ratio) {
        var newPos = viewToWorldTransform.mapPoint(position);
        if (!this.hasFlag(GXElementEditor.Flag.Outline)) {
            this.setFlag(GXElementEditor.Flag.Outline);
        } else {
            this.requestInvalidation();
        }

        this._createPreviewIfNecessary();
        var sourceTransform = this._element.getTransform();
        if (sourceTransform) {
            var sPosition = sourceTransform.inverted().mapPoint(newPos);
        } else {
            var sPosition = newPos;
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
    GXEllipseEditor.prototype._getPartInfoAt = function (location, transform, tolerance) {
        var result = GXShapeEditor.prototype._getPartInfoAt.call(this, location, transform, tolerance);
        if (result) {
            return result;
        }
        // If we have segment details then hit-test 'em
        if (this._showSegmentDetails()) {
            result = null;
            this._iterateArcEnds(false, function (args) {
                if (this._getAnnotationBBox(transform, args.position)
                        .expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {
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

    /** @override */
    GXEllipseEditor.prototype._createPreviewIfNecessary = function () {
        if (!this._elementPreview) {
            this._elementPreview = new GXEllipse();
            this._elementPreview.transferProperties(this._element,
                [GXShape.GeometryProperties, GXEllipse.GeometryProperties], true);
        }
    };

    GXEllipseEditor.prototype._iterateArcEnds = function (paintElement, iterator) {
        var element = paintElement ? this.getPaintElement() : this._element;
        var transform = element.getTransform();
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