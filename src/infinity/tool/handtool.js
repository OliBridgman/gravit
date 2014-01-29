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
    GXHandTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M12.8,34.9c0,0-5.9-0.9-6.8-1.9c-0.2-0.2-3.1-3.1-2.8-4.2c0.1-0.2,0.2-0.6,0.6-0.8\nc0.6-0.3,1.4,0.2,2.8,1.3C7,29.7,7.7,30.3,8,30.4C7.7,29.5,5.5,27,3.4,25c-0.3-0.4-0.5-1.2,0.1-1.8C3.7,23.1,3.9,23,4,22.9\nc0-0.1,0-0.2-0.1-0.3c0-0.3,0.1-0.6,0.4-0.8c0.4-0.4,1-0.4,1.4-0.2c0.1-0.1,0.2-0.3,0.3-0.4c0.2-0.2,0.5-0.3,0.8-0.3\nc0.5,0,0.8,0.2,0.9,0.3l0.3,0.3c0.7-0.2,2.6-0.2,5.2,2.6c3.8,4.1,3.7,7.7,3.7,7.9c0,0.1-0.1,0.3-0.2,0.3l-3.7,2.5\nC13,34.9,12.9,34.9,12.8,34.9z M4.1,28.9c-0.5,0.6,2.3,3.4,2.5,3.6c0.5,0.6,3.8,1.2,6.1,1.6l3.4-2.3c0-0.8-0.4-3.8-3.4-7.1\nC11,23,9.8,22.4,9.1,22.3l2.5,2.2c0.2,0.2,0.2,0.4,0,0.6c-0.2,0.2-0.4,0.2-0.6,0l-3.8-3.3l0,0c0,0-0.3-0.3-0.6,0\nc-0.1,0.1-0.1,0.3-0.1,0.3l3.5,3.4c0.1,0.1,0.2,0.4,0,0.6c-0.2,0.2-0.4,0.2-0.6,0L6,22.8c-0.2-0.2-0.7-0.7-1-0.4\nc-0.3,0.3,0.1,0.7,0.3,0.8l3.5,3.4c0.1,0.1,0.2,0.4,0,0.6c-0.2,0.2-0.4,0.2-0.6,0l-3.5-3.4c-0.1-0.1-0.3-0.2-0.6,0.1\nc-0.2,0.2,0,0.5,0,0.6c2.4,2.3,5.5,5.9,4.7,6.6C8.2,31.7,7,30.8,6,30C5.4,29.5,4.4,28.6,4.1,28.9z"/>\n</svg>\n';
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