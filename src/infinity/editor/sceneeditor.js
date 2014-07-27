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

    IFSceneEditor.prototype._tBoxData = null;
    IFSceneEditor.prototype._mouseInfo = null;

    IFSceneEditor.prototype._detach = function () {
        if (this._transformBox) {
            this.setTransformBoxActive(false);
        }
    };

    IFSceneEditor.prototype.paint = function (transform, context) {
        IFElementEditor.prototype.paint.call(this, transform, context);
        if (this._transformBox) {
            this._transformBox.paint(transform, context);
        }
    };

    IFSceneEditor.prototype.getBBox = function (transform) {
        var bbox = IFElementEditor.prototype.getBBox.call(this, transform);
        if (this._transformBox) {
            var transBBox = this._transformBox._calculateGeometryBBox();
            if (transBBox && !transBBox.isEmpty()) {
                transBBox = transform ? transform.mapRect(transBBox) : transBBox;
                transBBox = transBBox.expanded(IFTransformBox.ANNOT_SIZE);
                bbox = bbox ? bbox.united(transBBox) : transBBox;
            }
        }
        return bbox;
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
            var cx = this._transformBox.getProperty('cx');
            var cy = this._transformBox.getProperty('cy');
            return new IFPoint(cx,cy);
        }
        return null;
    };

    IFSceneEditor.prototype._applyTBoxCenterTransform = function () {
        if (this._transformBox && (this._transformBox.getProperty('trf') || this._transformBox.getProperty('cTrf'))) {
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

    IFSceneEditor.prototype.updateTBoxCursorForView = function (location, transform, view) {
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
    };

    IFSceneEditor.prototype.getTBoxPartInfoAt = function (location, transform, tolerance) {
        return this._transformBox.getPartInfoAt(location, transform, tolerance);
    };

    IFSceneEditor.prototype.startTBoxTransform = function (partInfo) {
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

    IFSceneEditor.prototype.transformTBox = function (startPos, curPos, option, ratio) {
        if (this._tBoxMode != IFSceneEditor.TBoxMode.PASSIVE && this._tBoxMode != IFSceneEditor.TBoxMode.NA) {
            var guides = this._getGraphicEditor().getGuides();
            guides.beginMap();
            var transform = this._transformBox.calculateTransformation(this._tBoxData,
                startPos, curPos, guides, option, ratio);

            if (this._tBoxMode != IFSceneEditor.TBoxMode.CNTRMOVE) {
                this._transformBox.setTransform(transform);
                this._getGraphicEditor().transformSelection(transform, null, null);
            } else {
                this._transformBox.setCenterTransform(transform);
                this.requestInvalidation();
            }
            guides.finishMap();
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
            cx = this._transformBox.getProperty('cx');
            cy = this._transformBox.getProperty('cy');
        }
        this._transformBox = null;
        if (this._getGraphicEditor().getSelection()) {
            var selBBox = this._getGraphicEditor().getSelectionBBox(false);
            if (selBBox) {
                this._transformBox = new IFTransformBox(selBBox, cx, cy);
            }
        }
        this.requestInvalidation();

        if (this._transformBox) {
            this._updateTBoxMode(IFSceneEditor.TBoxMode.PASSIVE);
        } else {
            this._updateTBoxMode(IFSceneEditor.TBoxMode.NA);
        }
        this._tBoxData = null;
        this._mouseInfo = null;
    };

    IFSceneEditor.prototype._geometryChange = function (evt) {
        if (this._transformBox) {
            if (this._transformBox.getProperty('trf') || this._transformBox.getProperty('cTrf')) {
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