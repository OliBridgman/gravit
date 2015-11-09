(function (_) {
    /**
     * An editor for an ellipse
     * @param {GEllipse} ellipse the ellipse this editor works on
     * @class GEllipseEditor
     * @extends GPathBaseEditor
     * @constructor
     */
    function GEllipseEditor(ellipse) {
        GPathBaseEditor.call(this, ellipse);
        this._flags |= GBlockEditor.Flag.ResizeAll;
    };
    GObject.inherit(GEllipseEditor, GPathBaseEditor);
    GElementEditor.exports(GEllipseEditor, GEllipse);

    GEllipseEditor.START_ANGLE_PART_ID = GUtil.uuid();
    GEllipseEditor.END_ANGLE_PART_ID = GUtil.uuid();

    /** @override */
    GEllipseEditor.prototype.getBBoxMargin = function () {
        var source = GPathBaseEditor.prototype.getBBoxMargin.call(this);
        if (this._showSegmentDetails()) {
            return Math.max(GElementEditor.OPTIONS.annotationSizeRegular + 1, source);
        }
        return source;
    };

    /** @override */
    GEllipseEditor.prototype.getCustomBBox = function (transform, includeEditorTransform) {
        var bbox = null;
        if (this.hasFlag(GElementEditor.Flag.Selected) && this.hasFlag(GElementEditor.Flag.Detail)) {
            // Don't include individual annotations here,
            // as they are added all together in getBBoxMargin(),
            // but add center cross, as it may be outside of ellipse arc or chord
            var trf = transform;
            // Use internal transformation if required
            if (includeEditorTransform && this._transform) {
                trf = this._transform.multiplied(transform);
            }

            var center = this.getPaintElement().getCenter(true);
            bbox = ifAnnotation.getAnnotationBBox(trf, center, GElementEditor.OPTIONS.centerCrossSize * 2);
        }
        return bbox;
    };

    /** @override */
    GEllipseEditor.prototype.movePart = function (partId, partData, position, viewToWorldTransform, guides, shift, option) {
        GPathBaseEditor.prototype.movePart.call(this, partId, partData, position, viewToWorldTransform, guides, shift, option);
        if (partId === GEllipseEditor.START_ANGLE_PART_ID || partId === GEllipseEditor.END_ANGLE_PART_ID) {
            var newPos = viewToWorldTransform.mapPoint(position);

            if (!this._elementPreview) {
                this._elementPreview = new GEllipse();
                this._elementPreview.transferProperties(this._element,
                    [GShape.GeometryProperties, GEllipse.GeometryProperties], true);
            }

            var sourceTransform = this._element.getTransform();
            if (sourceTransform) {
                var sPosition = sourceTransform.inverted().mapPoint(newPos);
            } else {
                var sPosition = newPos;
            }
            var angle = Math.atan2(sPosition.getY(), sPosition.getX());
            var sa = this._element.getProperty('sa');
            var ea = this._element.getProperty('ea');
            if (partId == GEllipseEditor.START_ANGLE_PART_ID) {
                var aDelta = angle - sa;
            } else { // end angle
                var aDelta = angle - ea;
            }

            var moveStart = this._partSelection.indexOf(GEllipseEditor.START_ANGLE_PART_ID) >= 0;
            var moveEnd = this._partSelection.indexOf(GEllipseEditor.END_ANGLE_PART_ID) >= 0;

            if (moveStart || moveEnd) {
                this._elementPreview.setProperties(['sa', 'ea'],
                    [moveStart ? GMath.normalizeAngleRadians(sa + aDelta) : sa,
                        moveEnd ? GMath.normalizeAngleRadians(ea + aDelta) : ea]);

                this.requestInvalidation();
            }
        }
    };

    /** @override */
    GEllipseEditor.prototype.applyPartMove = function (partId, partData) {
        if (partId === GEllipseEditor.START_ANGLE_PART_ID || partId === GEllipseEditor.END_ANGLE_PART_ID) {
            var propertyValues = this._elementPreview.getProperties(['sa', 'ea']);
            this.resetPartMove(partId, partData);
            this._element.setProperties(['sa', 'ea'], propertyValues);
        }
        GPathBaseEditor.prototype.applyPartMove.call(this, partId, partData);
    };

    /** @override */
    GEllipseEditor.prototype.applyTransform = function (element) {
        if (element && this._elementPreview) {
            element.transferProperties(this._elementPreview, [GShape.GeometryProperties, GEllipse.GeometryProperties]);
            this.resetTransform();
        } else {
            GPathBaseEditor.prototype.applyTransform.call(this, element);
        }
    };

    /** @override */
    GEllipseEditor.prototype._hasCenterCross = function () {
        return true;
    };

    /** @override */
    GEllipseEditor.prototype._postPaint = function (transform, context) {
        GPathBaseEditor.prototype._postPaint.call(this, transform, context);
        // If we have segments then paint 'em
        if (this._showSegmentDetails()) {
            this._iterateArcEnds(true, function (args) {
                var annotation = (args.id == GEllipseEditor.START_ANGLE_PART_ID)
                    ? GElementEditor.Annotation.Diamond
                    : GElementEditor.Annotation.Circle;

                var selected = (this._partSelection && this._partSelection.indexOf(args.id) >= 0);
                this._paintAnnotation(context, transform, args.position, annotation, selected, false);
                return false;
            }.bind(this));
        }
    };

    /** @override */
    GEllipseEditor.prototype._getPartInfoAt = function (location, transform, tolerance) {
        // If we have segment details then hit-test 'em
        if (this._showSegmentDetails()) {
            result = null;
            this._iterateArcEnds(false, function (args) {
                if (this._getAnnotationBBox(transform, args.position)
                    .expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {
                    result = new GElementEditor.PartInfo(this, args.id, null, true, true);
                    return true;
                }
                return false;
            }.bind(this));

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
    GEllipseEditor.prototype._showSegmentDetails = function () {
        return this._showAnnotations() && this.hasFlag(GElementEditor.Flag.Detail) && !this._elementPreview;
    };

    GEllipseEditor.prototype._iterateArcEnds = function (paintElement, iterator) {
        var element = paintElement ? this.getPaintElement() : this._element;
        var transform = element.getTransform();
        var startA = element.getProperty('sa');
        var endA = element.getProperty('ea');
        transform = transform ? transform : new GTransform(1, 0, 0, 1, 0, 0);
        var itArgs = [
            {id: GEllipseEditor.START_ANGLE_PART_ID,
                position: transform.mapPoint(new GPoint(Math.cos(startA), Math.sin(startA)))},
            {id: GEllipseEditor.END_ANGLE_PART_ID,
                position: transform.mapPoint(new GPoint(Math.cos(endA), Math.sin(endA)))}
        ];

        for (var i = 0; i < itArgs.length; ++i) {
            if (iterator(itArgs[i]) === true) {
                break;
            }
        }
    };

    /** @override */
    GEllipseEditor.prototype.toString = function () {
        return "[Object GEllipseEditor]";
    };

    _.GEllipseEditor = GEllipseEditor;
})(this);