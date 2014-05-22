(function (_) {
    /**
     * An editor for an ellipse
     * @param {IFEllipse} ellipse the ellipse this editor works on
     * @class IFEllipseEditor
     * @extends IFPathBaseEditor
     * @constructor
     */
    function IFEllipseEditor(ellipse) {
        IFPathBaseEditor.call(this, ellipse);
        this._flags |= IFBlockEditor.Flag.ResizeAll;
    };
    IFObject.inherit(IFEllipseEditor, IFPathBaseEditor);
    IFElementEditor.exports(IFEllipseEditor, IFEllipse);

    IFEllipseEditor.START_ANGLE_PART_ID = gUtil.uuid();
    IFEllipseEditor.END_ANGLE_PART_ID = gUtil.uuid();

    /** @override */
    IFEllipseEditor.prototype.getBBoxMargin = function () {
        var source = IFPathBaseEditor.prototype.getBBoxMargin.call(this);
        if (this._showSegmentDetails()) {
            return Math.max(IFElementEditor.OPTIONS.annotationSizeRegular + 1, source);
        }
        return source;
    };

    /** @override */
    IFEllipseEditor.prototype.getCustomBBox = function (transform, includeEditorTransform) {
        var bbox = null;
        if (this.hasFlag(IFElementEditor.Flag.Selected) && this.hasFlag(IFElementEditor.Flag.Detail)) {
            // Don't include individual annotations here,
            // as they are added all together in getBBoxMargin(),
            // but add center cross, as it may be outside of ellipse arc or chord
            var trf = transform;
            // Use internal transformation if required
            if (includeEditorTransform && this._transform) {
                trf = this._transform.multiplied(transform);
            }

            var center = this.getPaintElement().getCenter(true);
            bbox = gAnnotation.getAnnotationBBox(trf, center, IFElementEditor.OPTIONS.centerCrossSize * 2);
        }
        return bbox;
    };

    /** @override */
    IFEllipseEditor.prototype.movePart = function (partId, partData, position, viewToWorldTransform, guides, shift, option) {
        IFPathBaseEditor.prototype.movePart.call(this, partId, partData, position, viewToWorldTransform, guides, shift, option);
        if (partId === IFEllipseEditor.START_ANGLE_PART_ID || partId === IFEllipseEditor.END_ANGLE_PART_ID) {
            var newPos = viewToWorldTransform.mapPoint(position);

            if (!this._elementPreview) {
                this._elementPreview = new IFEllipse();
                this._elementPreview.transferProperties(this._element,
                    [IFShape.GeometryProperties, IFEllipse.GeometryProperties], true);
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
            if (partId == IFEllipseEditor.START_ANGLE_PART_ID) {
                var aDelta = angle - sa;
            } else { // end angle
                var aDelta = angle - ea;
            }

            var moveStart = this._partSelection.indexOf(IFEllipseEditor.START_ANGLE_PART_ID) >= 0;
            var moveEnd = this._partSelection.indexOf(IFEllipseEditor.END_ANGLE_PART_ID) >= 0;

            if (moveStart || moveEnd) {
                this._elementPreview.setProperties(['sa', 'ea'],
                    [moveStart ? ifMath.normalizeAngleRadians(sa + aDelta) : sa,
                        moveEnd ? ifMath.normalizeAngleRadians(ea + aDelta) : ea]);

                this.requestInvalidation();
            }
        }
    };

    /** @override */
    IFEllipseEditor.prototype.applyPartMove = function (partId, partData) {
        if (partId === IFEllipseEditor.START_ANGLE_PART_ID || partId === IFEllipseEditor.END_ANGLE_PART_ID) {
            var propertyValues = this._elementPreview.getProperties(['sa', 'ea']);
            this.resetPartMove(partId, partData);
            this._element.setProperties(['sa', 'ea'], propertyValues);
        }
        IFPathBaseEditor.prototype.applyPartMove.call(this, partId, partData);
    };

    /** @override */
    IFEllipseEditor.prototype.applyTransform = function (element) {
        if (element && this._elementPreview) {
            element.transferProperties(this._elementPreview, [IFShape.GeometryProperties, IFEllipse.GeometryProperties]);
            this.resetTransform();
        } else {
            IFPathBaseEditor.prototype.applyTransform.call(this, element);
        }
    };

    /** @override */
    IFEllipseEditor.prototype._hasCenterCross = function () {
        return true;
    };

    /** @override */
    IFEllipseEditor.prototype._postPaint = function (transform, context) {
        IFPathBaseEditor.prototype._postPaint.call(this, transform, context);
        // If we have segments then paint 'em
        if (this._showSegmentDetails()) {
            this._iterateArcEnds(true, function (args) {
                var annotation = (args.id == IFEllipseEditor.START_ANGLE_PART_ID)
                    ? IFElementEditor.Annotation.Diamond
                    : IFElementEditor.Annotation.Circle;

                var selected = (this._partSelection && this._partSelection.indexOf(args.id) >= 0);
                this._paintAnnotation(context, transform, args.position, annotation, selected, false);
                return false;
            }.bind(this));
        }
    };

    /** @override */
    IFEllipseEditor.prototype._getPartInfoAt = function (location, transform, tolerance) {
        // If we have segment details then hit-test 'em
        if (this._showSegmentDetails()) {
            result = null;
            this._iterateArcEnds(false, function (args) {
                if (this._getAnnotationBBox(transform, args.position)
                    .expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {
                    result = new IFElementEditor.PartInfo(this, args.id, null, true, true);
                    return true;
                }
                return false;
            }.bind(this));

            if (result) {
                return result;
            }
        }

        return IFShapeEditor.prototype._getPartInfoAt.call(this, location, transform, tolerance);
    };

    /**
     * @returns {Boolean}
     * @private
     */
    IFEllipseEditor.prototype._showSegmentDetails = function () {
        return this._showAnnotations() && this.hasFlag(IFElementEditor.Flag.Detail) && !this._elementPreview;
    };

    IFEllipseEditor.prototype._iterateArcEnds = function (paintElement, iterator) {
        var element = paintElement ? this.getPaintElement() : this._element;
        var transform = element.getTransform();
        var startA = element.getProperty('sa');
        var endA = element.getProperty('ea');
        transform = transform ? transform : new GTransform(1, 0, 0, 1, 0, 0);
        var itArgs = [
            {id: IFEllipseEditor.START_ANGLE_PART_ID,
                position: transform.mapPoint(new GPoint(Math.cos(startA), Math.sin(startA)))},
            {id: IFEllipseEditor.END_ANGLE_PART_ID,
                position: transform.mapPoint(new GPoint(Math.cos(endA), Math.sin(endA)))}
        ];

        for (var i = 0; i < itArgs.length; ++i) {
            if (iterator(itArgs[i]) === true) {
                break;
            }
        }
    };

    /** @override */
    IFEllipseEditor.prototype.toString = function () {
        return "[Object IFEllipseEditor]";
    };

    _.IFEllipseEditor = IFEllipseEditor;
})(this);