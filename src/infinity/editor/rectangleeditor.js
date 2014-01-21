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

    /** @override */
    GXRectangleEditor.prototype.getBBox = function (transform) {
        if (this._showSegmentDetails()) {
            // Return our bbox and expand it by the annotation's approx size
            var targetTransform = transform;
            if (this._transform) {
                targetTransform = this._transform.multiplied(transform);
            }
            var bbox = this.getPaintElement().getGeometryBBox();
            return targetTransform.mapRect(bbox).expanded(
                GXElementEditor.OPTIONS.annotationSizeRegular,
                GXElementEditor.OPTIONS.annotationSizeRegular,
                GXElementEditor.OPTIONS.annotationSizeRegular,
                GXElementEditor.OPTIONS.annotationSizeRegular);
        } else {
            return GXPathBaseEditor.prototype.getBBox.call(this, transform);
        }
    };

    /** @override */
    GXRectangleEditor.prototype.movePart = function (partId, partData, position, ratio) {
        if (!this.hasFlag(GXElementEditor.Flag.Outline)) {
            this.setFlag(GXElementEditor.Flag.Outline);
        } else {
            this.requestInvalidation();
        }

        if (!this._elementPreview) {
            this._elementPreview = new GXRectangle();
            this._elementPreview.transferProperties(this._element, [GXShape.GeometryProperties, GXRectangle.GeometryProperties]);
        }

        // TODO : Implement this

        this.requestInvalidation();
    };

    /** @override */
    GXRectangleEditor.prototype.resetPartMove = function (partId, partData) {
        this._elementPreview = null;
        this.removeFlag(GXElementEditor.Flag.Outline);
    };

    /** @override */
    GXRectangleEditor.prototype.applyPartMove = function (partId, partData) {
        // TODO : Implement this properly
        //var propertyValues = this._elementPreview.getProperties(['sa', 'ea']);
        this.resetPartMove(partId, partData);
        //this._element.setProperties(['sa', 'ea'], propertyValues);
    };

    /** @override */
    GXRectangleEditor.prototype._hasCenterCross = function () {
        return true;
    };

    /** @override */
    GXRectangleEditor.prototype._paintCustom = function (transform, context) {
        // If we have segments then paint 'em
        if (this._showSegmentDetails()) {
            // TODO : Paint corner annotations
            /*
            this._element.iterateSegments(function (point, inside, angle) {
                var annotation = inside ? GXElementEditor.Annotation.Circle : GXElementEditor.Annotation.Diamond;
                var partId = inside ? GXRectangleEditor.prototype.START_ANGLE_PART_ID : GXRectangleEditor.prototype.END_ANGLE_PART_ID;
                this._paintAnnotation(context, transform, point, annotation, this._partSelection && this._partSelection.indexOf(partId) >= 0, false);
            }.bind(this), true);
            */
        }
    };

    /** @override */
    GXRectangleEditor.prototype._getPartInfoAt = function (location, transform) {
        // If we have segment details then hit-test 'em first
        if (this._showSegmentDetails()) {
            var result = null;
            var pickDist = this._element.getScene() ? this._element.getScene().getProperty('pickDist') / 2 : 1.5;

            // TODO : Get corners part info
            /*
            this._element.iterateSegments(function (point, inside, angle) {
                if (this._getAnnotationBBox(transform, point).expanded(pickDist, pickDist, pickDist, pickDist).containsPoint(location)) {
                    var partId = inside ? GXRectangleEditor.prototype.START_ANGLE_PART_ID : GXRectangleEditor.prototype.END_ANGLE_PART_ID;
                    result = new GXElementEditor.PartInfo(this, partId, angle, true, true);
                    return true;
                }
            }.bind(this), true);
            */

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
    GXRectangleEditor.prototype._showSegmentDetails = function () {
        return this._showAnnotations() && this.hasFlag(GXElementEditor.Flag.Detail) && !this._elementPreview;
    };

    /** @override */
    GXRectangleEditor.prototype.toString = function () {
        return "[Object GXRectangleEditor]";
    };

    _.GXRectangleEditor = GXRectangleEditor;
})(this);