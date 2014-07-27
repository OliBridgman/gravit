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
            this._updateSelectionTransformBox(center);
        } else {
            this.requestInvalidation();
            this._transformBox = null;
            this.requestInvalidation();
        }
    };

    IFSceneEditor.prototype.getTransformBox = function () {
        return this._transformBox;
    };

    IFSceneEditor.prototype.requestInvalidation = function(args) {
        this._getGraphicEditor().requestInvalidation(this, args);
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

    IFSceneEditor.prototype.applyTransformBoxTransform = function () {
        if (this._transformBox) {
            this._transformBox.applyTransform();
            this.requestInvalidation();
            this._updateSelectionTransformBox();
        }
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