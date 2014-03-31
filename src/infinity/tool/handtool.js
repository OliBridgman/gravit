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
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M13.7,22.6C10.3,19,7.9,19,7,19.2l-0.4-0.4c-0.1,0-0.5-0.3-1.1-0.3c-0.4,0-0.7,0.1-1,0.4\n\tC4.2,19,4.1,19.2,4,19.4c-0.6-0.3-1.3-0.3-1.8,0.2c-0.3,0.3-0.5,0.7-0.5,1.1c0,0.1,0,0.3,0.1,0.4c-0.2,0.1-0.5,0.2-0.7,0.4\n\tc-0.9,0.7-0.5,1.7-0.2,2.3c2.7,2.6,5.6,5.8,6.1,7c-0.5-0.2-1.4-0.9-1.9-1.4c-1.7-1.4-2.8-2.2-3.6-1.7c-0.6,0.3-0.7,0.8-0.8,1.1\n\tc-0.4,1.5,3.4,5.2,3.6,5.4c1.2,1.3,8.9,2.4,8.9,2.4c0.1,0,0.2,0,0.3-0.1l4.8-3.3c0.1-0.1,0.2-0.2,0.2-0.4\n\tC18.5,32.5,18.7,27.8,13.7,22.6z M13.1,35.5L13.1,35.5c-2.9-0.4-7.4-1.3-8.1-2.1c0,0-0.1-0.1-0.2-0.2c-2.6-2.7-3.6-4.1-3.1-4.6\n\tc0.1-0.1,0.2-0.1,0.4-0.1c0.5,0,1.4,0.7,2.1,1.3L4.4,30c1,0.8,2.1,1.6,2.8,1.6c0.2,0,0.4-0.1,0.5-0.2c0.1-0.1,0.1-0.2,0.1-0.3\n\tc0-1.3-3.2-5.1-6.3-8c-0.2-0.3-0.3-0.7,0-1C1.8,22,2,21.9,2.2,21.9c0.2,0,0.3,0.1,0.4,0.1l4.5,4.3c0.2,0.1,0.4,0.1,0.6,0\n\tc0.1-0.1,0.1-0.1,0.1-0.2c0-0.1-0.1-0.3-0.1-0.3l-4.5-4.3c0,0-0.5-0.4-0.5-0.9c0-0.2,0.1-0.3,0.2-0.4c0.1-0.1,0.3-0.2,0.4-0.2\n\tc0.4,0,0.9,0.4,1.1,0.7L9,25.2c0.2,0.1,0.4,0.1,0.6,0c0.1-0.1,0.1-0.1,0.1-0.2c0-0.1-0.1-0.3-0.1-0.3l-4.6-4.4\n\tc-0.1-0.1-0.1-0.4,0.1-0.6c0.1-0.1,0.3-0.2,0.5-0.2c0.2,0,0.4,0.1,0.4,0.2h0l5,4.3c0.2,0.1,0.4,0.1,0.6,0c0.1-0.1,0.1-0.2,0.1-0.3\n\tc0-0.1-0.1-0.2-0.1-0.3L7.8,20l0.5,0.1c1,0.2,2.6,0.9,4.7,3.1c4,4.2,4.5,8.1,4.5,9.2l0,0.1L13.1,35.5z"/>\n</svg>\n';
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
    GXHandTool.prototype.activate = function (view) {
        GXTool.prototype.activate.call(this, view);

        view.addEventListener(GUIMouseEvent.DragStart, this._mouseDragStart, this);
        view.addEventListener(GUIMouseEvent.Drag, this._mouseDrag, this);
        view.addEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd, this);
    };

    /** @override */
    GXHandTool.prototype.deactivate = function (view) {
        GXTool.prototype.deactivate.call(this, view);

        view.removeEventListener(GUIMouseEvent.DragStart, this._mouseDragStart);
        view.removeEventListener(GUIMouseEvent.Drag, this._mouseDrag);
        view.removeEventListener(GUIMouseEvent.DragEnd, this._mouseDragEnd);
    };

    /** @override */
    GXHandTool.prototype.isDeactivatable = function () {
        // cannot deactivate while dragging
        return this._panning ? false : true;
    };

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