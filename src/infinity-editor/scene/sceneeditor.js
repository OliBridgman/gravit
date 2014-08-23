(function (_) {
    /**
     * The base for a scene editor
     * @param {IFScene} scene the scene this editor works on
     * @class IFSceneEditor
     * @extends IFElementEditor
     * @constructor
     */
    function IFSceneEditor(scene) {
        IFElementEditor.call(this, scene);
    };
    IFObject.inherit(IFSceneEditor, IFElementEditor);
    IFElementEditor.exports(IFSceneEditor, IFScene);

    /**
     * @type {IFTransformBox}
     * @private
     */
    IFSceneEditor.prototype._transformBox = null;

    /**
     * An array of vusial lines ends, which are used to show snap zones
     * @type {Array<Array<IFPoint>>} - line ends in view coordinates
     * @private
     */
    IFSceneEditor.prototype._visuals = null;

    /**
     * Area, which is used for painting and cleaning lines of snap zones
     * @type {IFRect} - visuals area in world coordinates
     * @private
     */
    IFSceneEditor.prototype._visualsArea = null;

    /**
     * The possible modes of transform box functionality
     * @type {{NA: number, PASSIVE: number, TBOXMOVE: number, CNTRMOVE: number, ROTATE: number, RESIZE: number, SKEW: number}}
     */
    IFSceneEditor.TBoxMode = {
        NA : 0,
        PASSIVE: 1,
        TBOXMOVE: 2,
        CNTRMOVE: 3,
        ROTATE: 4,
        RESIZE: 5,
        SKEW: 6
    };

    /**
     * @type {IFSceneEditor.TBoxMode}
     * @private
     */
    IFSceneEditor.prototype._tBoxMode = IFSceneEditor.TBoxMode.NA;

    /**
     * @type {IFElementEditor.PartInfo}
     * @private
     */
    IFSceneEditor.prototype._tBoxData = null;

    /**
     * @type {IFElementEditor.PartInfo}
     * @private
     */
    IFSceneEditor.prototype._mouseInfo = null;

    /** override */
    IFSceneEditor.prototype.paint = function (transform, context) {
        IFElementEditor.prototype.paint.call(this, transform, context);
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
    IFSceneEditor.prototype.getBBox = function (transform) {
        var bbox = IFElementEditor.prototype.getBBox.call(this, transform);
        if (this._transformBox) {
            var transBBox = this._transformBox._calculateGeometryBBox();
            if (transBBox && !transBBox.isEmpty()) {
                transBBox = transform ? transform.mapRect(transBBox) : transBBox;
                transBBox = transBBox.expanded(
                    IFTransformBox.ANNOT_SIZE, IFTransformBox.ANNOT_SIZE, IFTransformBox.ANNOT_SIZE, IFTransformBox.ANNOT_SIZE);
                bbox = bbox ? bbox.united(transBBox) : transBBox;
            }
        }
        return bbox;
    };

    /** override */
    IFSceneEditor.prototype._detach = function () {
        if (this._transformBox) {
            this.setTransformBoxActive(false);
        }
    };

    /**
     * Checks if the transform box is currently active
     * @returns {Boolean}
     */
    IFSceneEditor.prototype.isTransformBoxActive = function () {
        return (this._transformBox != null);
    };

    /**
     * Activates or deactivates the transform box
     * @param {Boolean} activate - when true or not set means activation is needed, when false - deactivation
     * @param {IFPoint} center - transform box center to set
     */
    IFSceneEditor.prototype.setTransformBoxActive = function (activate, center) {
        if (activate || activate === null) {
            if (!this._transformBox) {
                this._element.addEventListener(IFElement.GeometryChangeEvent, this._geometryChange, this);
            }

            this._updateSelectionTransformBox(center);
        } else {
            if (this._transformBox) {
                this._element.removeEventListener(IFElement.GeometryChangeEvent, this._geometryChange, this);

                this.requestInvalidation();
                this._transformBox = null;
                this.requestInvalidation();
            }
        }
    };

    IFSceneEditor.prototype.getTransformBox = function () {
        return this._transformBox;
    };

    IFSceneEditor.prototype.requestInvalidation = function(args) {
        this._getGraphicEditor().requestInvalidation(this, args);
    };

    IFSceneEditor.prototype.getTBoxMode = function () {
        return this._tBoxMode;
    };

    IFSceneEditor.prototype._updateTBoxMode = function(mode) {
        this._tBoxMode = mode;
    };

    IFSceneEditor.prototype.hideTransformBox = function () {
        if (this._transformBox) {
            this._transformBox.hide();
        }
        this.requestInvalidation();
    };

    IFSceneEditor.prototype.showTransformBox = function () {
        if (this._transformBox) {
            this._transformBox.show();
        }
        this.requestInvalidation();
    };

    IFSceneEditor.prototype.getTransformBoxCenter = function () {
        if (this._transformBox) {
            return new IFPoint(this._transformBox.cx, this._transformBox.cy);
        }
        return null;
    };

    IFSceneEditor.prototype._applyTBoxCenterTransform = function () {
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

    IFSceneEditor.prototype.getCursor = function (partInfo) {
        var cursor = IFCursor.Select;

        switch (partInfo.id) {
            case IFTransformBox.INSIDE:
                cursor = IFCursor.SelectCross;
                break;
            case IFTransformBox.OUTSIDE:
                cursor = IFCursor.SelectRotate[partInfo.data];
                break;
            case IFTransformBox.OUTLINE:
                cursor = partInfo.data ? IFCursor.SelectSkewHoriz : IFCursor.SelectSkewVert;
                break;
            case IFTransformBox.Handles.TOP_CENTER:
            case IFTransformBox.Handles.BOTTOM_CENTER:
                cursor = IFCursor.SelectResizeVert;
                break;
            case IFTransformBox.Handles.LEFT_CENTER:
            case IFTransformBox.Handles.RIGHT_CENTER:
                cursor = IFCursor.SelectResizeHoriz;
                break;
            case IFTransformBox.Handles.TOP_LEFT:
            case IFTransformBox.Handles.BOTTOM_RIGHT:
                cursor = IFCursor.SelectResizeUpLeftDownRight;
                break;
            case IFTransformBox.Handles.TOP_RIGHT:
            case IFTransformBox.Handles.BOTTOM_LEFT:
                cursor = IFCursor.SelectResizeUpRightDownLeft;
                break;
            case IFTransformBox.Handles.ROTATION_CENTER:
                cursor = IFCursor.SelectArrowOnly;
                break;
        }

        return cursor;
    };

    IFSceneEditor.prototype.updateTBoxUnderMouse = function (location, transform, view) {
        var pInfo = null;
        if (this._tBoxData) {
            pInfo = new IFElementEditor.PartInfo(this._tBoxData.editor, this._tBoxData.id, this._tBoxData.data);
            if (pInfo.id  == IFTransformBox.OUTSIDE) {
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
        if (this._tBoxMode == IFSceneEditor.TBoxMode.PASSIVE && this._mouseInfo.id == IFTransformBox.INSIDE) {
            var selection = this._getGraphicEditor().getSelection();
            var selBBox = IFElement.prototype.getGroupGeometryBBox(selection);
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

    IFSceneEditor.prototype.getTBoxPartInfoAt = function (location, transform, tolerance) {
        return this._transformBox.getPartInfoAt(location, transform, tolerance);
    };

    IFSceneEditor.prototype.startTBoxTransform = function (partInfo) {
        if (this._visualsArea) {
            this.requestInvalidation();
            //this._element._invalidateArea(this._visualsArea);
            this._visualsArea = null;
        }

        this._tBoxData = new IFElementEditor.PartInfo(partInfo.editor, partInfo.id,
            partInfo.data);

        if (this._tBoxData.id  == IFTransformBox.OUTLINE) {
            this._updateTBoxMode(IFSceneEditor.TBoxMode.SKEW);
        } else if (this._tBoxData.id  == IFTransformBox.OUTSIDE) {
            this._updateTBoxMode(IFSceneEditor.TBoxMode.ROTATE);
        } else if (this._tBoxData.id >= 0 && this._tBoxData.id < IFTransformBox.Handles.ROTATION_CENTER) {
            this._updateTBoxMode(IFSceneEditor.TBoxMode.RESIZE);
        } else if (this._tBoxData.id == IFTransformBox.Handles.ROTATION_CENTER) {
            this._updateTBoxMode(IFSceneEditor.TBoxMode.CNTRMOVE);
        } else {
            this._updateTBoxMode(IFSceneEditor.TBoxMode.TBOXMOVE);
        }

        this.hideTransformBox();
    };

    /**
     * Calculates and makes the on-going transformation of the selection and transform box based on pre-set
     * transform mode, start position of movement and the current position
     * @param {IFPoint} startPos - the start position of movement
     * @param {IFPoint} curPos - the current position
     * @param {Boolean} option - when set and resizing, the resize is center-symmetric
     * @param {Boolean} ratio - when set and rotate/skew - keep ratioStep, when resize - the scale for X and Y are the same
     * @param {Number} ratioStep - when set and ratio, then this step is used for constraint
     */
    IFSceneEditor.prototype.transformTBox = function (startPos, curPos, option, ratio, ratioStep) {
        if (this._tBoxMode != IFSceneEditor.TBoxMode.PASSIVE && this._tBoxMode != IFSceneEditor.TBoxMode.NA) {
            var guides = this._getGraphicEditor().getGuides();
            guides.getShapeBoxGuide().useExclusions(this._getGraphicEditor().getSelection());
            guides.beginMap();
            var rStep = ratioStep;
            if (!rStep && this._tBoxMode == IFSceneEditor.TBoxMode.SKEW) {
                rStep = this._element.getProperty('gridSizeX');
            }
            var transform = this._transformBox.calculateTransformation(this._tBoxData,
                startPos, curPos, guides, option, ratio, rStep);

            guides.finishMap();
            this.requestInvalidation();
            if (this._tBoxMode != IFSceneEditor.TBoxMode.CNTRMOVE) {
                this._transformBox.setTransform(transform);
                this._getGraphicEditor().transformSelection(transform, null, null);
            } else {
                this._transformBox.setCenterTransform(transform);
                this.requestInvalidation();
            }
        }
    };

    IFSceneEditor.prototype.applyTBoxTransform = function (option) {
        if (this._tBoxMode == IFSceneEditor.TBoxMode.CNTRMOVE) {
            this._applyTBoxCenterTransform();
            this.showTransformBox();
        } else {
            this._getGraphicEditor().applySelectionTransform(option);
        }
        this._updateTBoxMode(IFSceneEditor.TBoxMode.PASSIVE);
        this._tBoxData = null;
        this._mouseInfo = null;
    };

    IFSceneEditor.prototype._updateSelectionTransformBox = function (center) {
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
        var selBBox = IFElement.prototype.getGroupGeometryBBox(selection);
        if (selBBox) {
            this._transformBox = new IFTransformBox(selBBox, cx, cy);
        }
        this.requestInvalidation();

        if (this._transformBox) {
            this._updateTBoxMode(IFSceneEditor.TBoxMode.PASSIVE);
        } else {
            this._updateTBoxMode(IFSceneEditor.TBoxMode.NA);
        }
        this._tBoxData = null;
        this._mouseInfo = null;
        if (this._visualsArea) {
            //this._element._invalidateArea(this._visualsArea);
            this._visualsArea = null;
        }
    };

    IFSceneEditor.prototype._geometryChange = function (evt) {
        if (this._transformBox && evt.type == IFElement.GeometryChangeEvent.Type.After &&
                evt.element.hasFlag(IFNode.Flag.Selected)) {

            if (this._transformBox.trf || this._transformBox.cTrf) {
                this._transformBox.applyCenterTransform();
            }
            this._updateSelectionTransformBox();
        }
    };

    IFSceneEditor.prototype._getGraphicEditor = function () {
        return this._element.__graphic_editor__;
    };

    /** @override */
    IFSceneEditor.prototype.toString = function () {
        return "[Object IFSceneEditor]";
    };

    _.IFSceneEditor = IFSceneEditor;
})(this);