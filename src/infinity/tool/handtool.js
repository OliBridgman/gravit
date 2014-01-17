(function (_) {
    /**
     * The pan tool
     * @class GXHandTool
     * @extends GXTool
     * @constructor
     * @version 1.0
     */
    function GXHandTool() {
        GXTool.call(this);
    }

    GObject.inherit(GXHandTool, GXTool);

    /**
     * @type {Boolean}
     * @private
     */
    GXHandTool.prototype._panning = false;

    /**
     * @type {Number}
     * @private
     */
    GXHandTool.prototype._deltaX = 0;

    /**
     * @type {Number}
     * @private
     */
    GXHandTool.prototype._deltaY = 0;

    /** @override */
    GXHandTool.prototype.getGroup = function () {
        return 'view';
    };

    /** @override */
    GXHandTool.prototype.getImageClass = function () {
        return 'g-tool-hand';
    };

    /** @override */
    GXHandTool.prototype.getHint = function () {
        return GXTool.prototype.getHint.call(this).setTitle(new GLocale.Key(GXHandTool, "title"));
    };

    /** @override */
    GXHandTool.prototype.getActivationCharacters = function () {
        return ['H'];
    };

    /** @override */
    GXHandTool.prototype.getCursor = function () {
        return this._panning ? GUICursor.HandClosed : GUICursor.HandOpen;
    };

    /** @override */
    GXHandTool.prototype.activate = function (view, layer) {
        GXTool.prototype.activate.call(this, view, layer);

        layer.addEventListener(GUIMouseEvent.DragStart, this._mouseDragStart, this);
        layer.addEventListener(GUIMouseEvent.Drag, this._mouseDrag, this);
        layer.addEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd, this);
    };

    /** @override */
    GXHandTool.prototype.deactivate = function (view, layer) {
        GXTool.prototype.deactivate.call(this, view, layer);

        layer.removeEventListener(GUIMouseEvent.DragStart, this._mouseDragStart);
        layer.removeEventListener(GUIMouseEvent.Drag, this._mouseDrag);
        layer.removeEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd);
    };

    /** @override */
    GXHandTool.prototype.isDeactivatable = function () {
        // cannot deactivate while dragging
        return this._panning ? false : true;
    };

    /** @override */
    GXHandTool.prototype.cancel = function () {
        if (this._panning) {
            this._view.scrollBy(this._deltaX, this._deltaY);
            this._panning = false;
            this.updateCursor();
        }
    }

    /**
     * @param {GUIMouseEvent.DragStart} event
     * @private
     */
    GXHandTool.prototype._mouseDragStart = function (event) {
        this._panning = true;
        this._deltaX = 0;
        this._deltaY = 0;
        this.updateCursor();
    };

    /**
     * @param {GUIMouseEvent.Drag} event
     * @private
     */
    GXHandTool.prototype._mouseDrag = function (event) {
        if (this._panning) {
            this._deltaX += event.clientDelta.getX();
            this._deltaY += event.clientDelta.getY();
            this._view.scrollBy(-event.clientDelta.getX(), -event.clientDelta.getY());
        }
    };

    /**
     * @param {GUIMouseEvent.DragEnd} event
     * @private
     */
    GXHandTool.prototype._mouseDragEnd = function (event) {
        if (this._panning) {
            this._panning = false;
            this.updateCursor();
        }
    };

    /** override */
    GXHandTool.prototype.toString = function () {
        return "[Object GXHandTool]";
    };

    _.GXHandTool = GXHandTool;
})(this);