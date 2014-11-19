(function (_) {
    /**
     * The base for a scene editor
     * @param {GScene} scene the scene this editor works on
     * @class GSceneEditor
     * @extends GElementEditor
     * @constructor
     */
    function GSceneEditor(scene) {
        GElementEditor.call(this, scene);
    };
    GObject.inherit(GSceneEditor, GElementEditor);
    GElementEditor.exports(GSceneEditor, GScene);

    /**
     * @type {GTransformBox}
     * @private
     */
    GSceneEditor.prototype._transformBox = null;

    /**
     * An array of vusial lines ends, which are used to show snap zones
     * @type {Array<Array<GPoint>>} - line ends in view coordinates
     * @private
     */
    GSceneEditor.prototype._visuals = null;

    /**
     * Area, which is used for painting and cleaning lines of snap zones
     * @type {GRect} - visuals area in world coordinates
     * @private
     */
    GSceneEditor.prototype._visualsArea = null;

    /**
     * The possible modes of transform box functionality
     * @type {{NA: number, PASSIVE: number, TBOXMOVE: number, CNTRMOVE: number, ROTATE: number, RESIZE: number, SKEW: number}}
     */
    GSceneEditor.TBoxMode = {
        NA : 0,
        PASSIVE: 1,
        TBOXMOVE: 2,
        CNTRMOVE: 3,
        ROTATE: 4,
        RESIZE: 5,
        SKEW: 6
    };

    /**
     * @type {GSceneEditor.TBoxMode}
     * @private
     */
    GSceneEditor.prototype._tBoxMode = GSceneEditor.TBoxMode.NA;

    /**
     * @type {GElementEditor.PartInfo}
     * @private
     */
    GSceneEditor.prototype._tBoxData = null;

    /**
     * @type {GElementEditor.PartInfo}
     * @private
     */
    GSceneEditor.prototype._mouseInfo = null;

    /** override */
    GSceneEditor.prototype.paint = function (transform, context) {
        GElementEditor.prototype.paint.call(this, transform, context);
        if (this._transformBox) {
            this._transformBox.paint(transform, context);

            if (this._visuals) {
                var visLine;
                for (var i = 0; i < this._visuals.length; ++i) {
                    visLine = this._visuals[i];
                    var pt0 = visLine[0];
                    var pt1 = visLine[1];
                    context.canvas.strokeLine(Math.floor(pt0.getX()) + 0.5, Math.floor(pt0.getY()) + 0.5,
                        Math.floor(pt1.getX()) + 0.5, Math.floor(pt1.getY()) + 0.5, 1, context.highlightOutlineColor);
                }

                this._visuals = null;
            }
        }
    };

    /** override */
    GSceneEditor.prototype.getBBox = function (transform) {
        var bbox = GElementEditor.prototype.getBBox.call(this, transform);
        if (this._transformBox) {
            var transBBox = this._transformBox._calculateGeometryBBox();
            if (transBBox && !transBBox.isEmpty()) {
                transBBox = transform ? transform.mapRect(transBBox) : transBBox;
                transBBox = transBBox.expanded(
                    GTransformBox.ANNOT_SIZE, GTransformBox.ANNOT_SIZE, GTransformBox.ANNOT_SIZE, GTransformBox.ANNOT_SIZE);
                bbox = bbox ? bbox.united(transBBox) : transBBox;
            }
        }
        return bbox;
    };

    /** override */
    GSceneEditor.prototype._detach = function () {
        if (this._transformBox) {
            this.setTransformBoxActive(false);
        }
    };

    /**
     * Checks if the transform box is currently active
     * @returns {Boolean}
     */
    GSceneEditor.prototype.isTransformBoxActive = function () {
        return (this._transformBox != null);
    };

    /**
     * Activates or deactivates the transform box
     * @param {Boolean} activate - when true or not set means activation is needed, when false - deactivation
     * @param {GPoint} center - transform box center to set
     */
    GSceneEditor.prototype.setTransformBoxActive = function (activate, center) {
        if (activate || activate === null) {
            if (!this._transformBox) {
                this._element.addEventListener(GElement.GeometryChangeEvent, this._geometryChange, this);
            }

            this._updateSelectionTransformBox(center);
        } else {
            if (this._transformBox) {
                this._element.removeEventListener(GElement.GeometryChangeEvent, this._geometryChange, this);

                this.requestInvalidation();
                this._transformBox = null;
                this.requestInvalidation();
            }
        }
    };

    GSceneEditor.prototype.getTransformBox = function () {
        return this._transformBox;
    };

    GSceneEditor.prototype.requestInvalidation = function(args) {
        this._getGraphicEditor().requestInvalidation(this, args);
    };

    GSceneEditor.prototype.getTBoxMode = function () {
        return this._tBoxMode;
    };

    GSceneEditor.prototype._updateTBoxMode = function(mode) {
        this._tBoxMode = mode;
    };

    GSceneEditor.prototype.hideTransformBox = function () {
        if (this._transformBox) {
            this._transformBox.hide();
        }
        this.requestInvalidation();
    };

    GSceneEditor.prototype.showTransformBox = function () {
        if (this._transformBox) {
            this._transformBox.show();
        }
        this.requestInvalidation();
    };

    GSceneEditor.prototype.getTransformBoxCenter = function () {
        if (this._transformBox) {
            return new GPoint(this._transformBox.cx, this._transformBox.cy);
        }
        return null;
    };

    GSceneEditor.prototype._applyTBoxCenterTransform = function () {
        if (this._transformBox && (this._transformBox.trf || this._transformBox.cTrf)) {
            this._getGraphicEditor().beginTransaction();
            try {
                this._transformBox.applyCenterTransform();
            } finally {
                // TODO : I18N
                this._getGraphicEditor().commitTransaction('Move');
            }
            this.requestInvalidation();
        }
    };

    GSceneEditor.prototype.getCursor = function (partInfo) {
        var cursor = GCursor.Select;

        switch (partInfo.id) {
            case GTransformBox.INSIDE:
                cursor = GCursor.SelectCross;
                break;
            case GTransformBox.OUTSIDE:
                cursor = GCursor.SelectRotate[partInfo.data];
                break;
            case GTransformBox.OUTLINE:
                cursor = partInfo.data ? GCursor.SelectSkewHoriz : GCursor.SelectSkewVert;
                break;
            case GTransformBox.Handles.TOP_CENTER:
            case GTransformBox.Handles.BOTTOM_CENTER:
                cursor = GCursor.SelectResizeVert;
                break;
            case GTransformBox.Handles.LEFT_CENTER:
            case GTransformBox.Handles.RIGHT_CENTER:
                cursor = GCursor.SelectResizeHoriz;
                break;
            case GTransformBox.Handles.TOP_LEFT:
            case GTransformBox.Handles.BOTTOM_RIGHT:
                cursor = GCursor.SelectResizeUpLeftDownRight;
                break;
            case GTransformBox.Handles.TOP_RIGHT:
            case GTransformBox.Handles.BOTTOM_LEFT:
                cursor = GCursor.SelectResizeUpRightDownLeft;
                break;
            case GTransformBox.Handles.ROTATION_CENTER:
                cursor = GCursor.SelectArrowOnly;
                break;
        }

        return cursor;
    };

    GSceneEditor.prototype.updateTBoxUnderMouse = function (location, transform, view) {
        var pInfo = null;
        if (this._tBoxData) {
            pInfo = new GElementEditor.PartInfo(this._tBoxData.editor, this._tBoxData.id, this._tBoxData.data);
            if (pInfo.id  == GTransformBox.OUTSIDE) {
                pInfo.data = this._transformBox.getRotationSegment(location, transform);
            }
        } else {
            pInfo = this._transformBox.getPartInfoAt(location, transform, this._element.getProperty('pickDist'));
        }

        if (!this._mouseInfo || this._mouseInfo.id != pInfo.id || this._mouseInfo.data != pInfo.data) {
            this._mouseInfo = pInfo;
            view.setCursor(this.getCursor(this._mouseInfo));
        }
        var bBox = null;
        this._visuals = null;
        if (this._tBoxMode == GSceneEditor.TBoxMode.PASSIVE && this._mouseInfo.id == GTransformBox.INSIDE) {
            var selection = this._getGraphicEditor().getSelection();
            var selBBox = GElement.prototype.getGroupGeometryBBox(selection);
            if (selBBox && !selBBox.isEmpty()) {
                bBox = transform.mapRect(selBBox);
                var visuals = this._getGraphicEditor().getGuides().getBBoxSnapZones(bBox, location);
                if (visuals && visuals.length) {
                    this._visuals = visuals;
                }
            }
        }

        var visualsArea = this._visuals ? bBox.expanded(2, 2, 2, 2) : null;
        visualsArea = visualsArea ? view.getViewTransform().mapRect(visualsArea) : null;
        if (this._visualsArea || visualsArea) {
            if (this._visualsArea) {
                //this._element._invalidateArea(this._visualsArea);
                //this.requestInvalidation();
            }
            if (visualsArea) {
                //this._element._invalidateArea(visualsArea);
                //this.requestInvalidation();
            }
            this.requestInvalidation();
            this._visualsArea = visualsArea;
            this.requestInvalidation();
        }
    };

    GSceneEditor.prototype.getTBoxPartInfoAt = function (location, transform, tolerance) {
        return this._transformBox.getPartInfoAt(location, transform, tolerance);
    };

    GSceneEditor.prototype.startTBoxTransform = function (partInfo) {
        if (this._visualsArea) {
            this.requestInvalidation();
            //this._element._invalidateArea(this._visualsArea);
            this._visualsArea = null;
        }

        this._tBoxData = new GElementEditor.PartInfo(partInfo.editor, partInfo.id,
            partInfo.data);

        if (this._tBoxData.id  == GTransformBox.OUTLINE) {
            this._updateTBoxMode(GSceneEditor.TBoxMode.SKEW);
        } else if (this._tBoxData.id  == GTransformBox.OUTSIDE) {
            this._updateTBoxMode(GSceneEditor.TBoxMode.ROTATE);
        } else if (this._tBoxData.id >= 0 && this._tBoxData.id < GTransformBox.Handles.ROTATION_CENTER) {
            this._updateTBoxMode(GSceneEditor.TBoxMode.RESIZE);
        } else if (this._tBoxData.id == GTransformBox.Handles.ROTATION_CENTER) {
            this._updateTBoxMode(GSceneEditor.TBoxMode.CNTRMOVE);
        } else {
            this._updateTBoxMode(GSceneEditor.TBoxMode.TBOXMOVE);
        }

        this.hideTransformBox();
    };

    /**
     * Calculates and makes the on-going transformation of the selection and transform box based on pre-set
     * transform mode, start position of movement and the current position
     * @param {GPoint} startPos - the start position of movement
     * @param {GPoint} curPos - the current position
     * @param {Boolean} option - when set and resizing, the resize is center-symmetric
     * @param {Boolean} ratio - when set and rotate/skew - keep ratioStep, when resize - the scale for X and Y are the same
     * @param {Number} ratioStep - when set and ratio, then this step is used for constraint
     */
    GSceneEditor.prototype.transformTBox = function (startPos, curPos, option, ratio, ratioStep) {
        if (this._tBoxMode != GSceneEditor.TBoxMode.PASSIVE && this._tBoxMode != GSceneEditor.TBoxMode.NA) {
            var guides = this._getGraphicEditor().getGuides();
            guides.getShapeBoxGuide().useExclusions(this._getGraphicEditor().getSelection());
            guides.beginMap();
            var rStep = ratioStep;
            if (!rStep && this._tBoxMode == GSceneEditor.TBoxMode.SKEW) {
                rStep = this._element.getProperty('gridSizeX');
            }
            var transform = this._transformBox.calculateTransformation(this._tBoxData,
                startPos, curPos, guides, option, ratio, rStep);

            guides.finishMap();
            this.requestInvalidation();
            if (this._tBoxMode != GSceneEditor.TBoxMode.CNTRMOVE) {
                this._transformBox.setTransform(transform);
                this._getGraphicEditor().transformSelection(transform, null, null);
            } else {
                this._transformBox.setCenterTransform(transform);
                this.requestInvalidation();
            }
        }
    };

    GSceneEditor.prototype.applyTBoxTransform = function (option) {
        if (this._tBoxMode == GSceneEditor.TBoxMode.CNTRMOVE) {
            this._applyTBoxCenterTransform();
            this.showTransformBox();
        } else {
            this._getGraphicEditor().applySelectionTransform(option);
        }
        this._updateTBoxMode(GSceneEditor.TBoxMode.PASSIVE);
        this._tBoxData = null;
        this._mouseInfo = null;
    };

    GSceneEditor.prototype._updateSelectionTransformBox = function (center) {
        this.requestInvalidation();
        var cx = null;
        var cy = null;
        if (center) {
            cx = center.getX();
            cy = center.getY();
        } else if (this._transformBox) {
            cx = this._transformBox.cx;
            cy = this._transformBox.cy;
        }
        this._transformBox = null;
        var selection = this._getGraphicEditor().getSelection();
        var selBBox = GElement.prototype.getGroupGeometryBBox(selection);
        if (selBBox) {
            this._transformBox = new GTransformBox(selBBox, cx, cy);
        }
        this.requestInvalidation();

        if (this._transformBox) {
            this._updateTBoxMode(GSceneEditor.TBoxMode.PASSIVE);
        } else {
            this._updateTBoxMode(GSceneEditor.TBoxMode.NA);
        }
        this._tBoxData = null;
        this._mouseInfo = null;
        if (this._visualsArea) {
            //this._element._invalidateArea(this._visualsArea);
            this._visualsArea = null;
        }
    };

    GSceneEditor.prototype._geometryChange = function (evt) {
        if (this._transformBox && evt.type == GElement.GeometryChangeEvent.Type.After &&
                evt.element.hasFlag(GNode.Flag.Selected)) {

            if (this._transformBox.trf || this._transformBox.cTrf) {
                this._transformBox.applyCenterTransform();
            }
            this._updateSelectionTransformBox();
        }
    };

    GSceneEditor.prototype._getGraphicEditor = function () {
        return this._element.__graphic_editor__;
    };

    /** @override */
    GSceneEditor.prototype.toString = function () {
        return "[Object GSceneEditor]";
    };

    _.GSceneEditor = GSceneEditor;
})(this);