(function (_) {
    /**
     * The pan tool
     * @class GHandTool
     * @extends GTool
     * @constructor
     * @version 1.0
     */
    function GHandTool() {
        GTool.call(this);
    }

    GObject.inherit(GHandTool, GTool);

    /**
     * @type {Boolean}
     * @private
     */
    GHandTool.prototype._panning = false;

    /** @override */
    GHandTool.prototype.getCursor = function () {
        return this._panning ? GCursor.HandClosed : GCursor.HandOpen;
    };

    /** @override */
    GHandTool.prototype.activate = function (view) {
        GTool.prototype.activate.call(this, view);

        view.addEventListener(GMouseEvent.DragStart, this._mouseDragStart, this);
        view.addEventListener(GMouseEvent.Drag, this._mouseDrag, this);
        view.addEventListener(GMouseEvent.DragEnd, this._mouseDragEnd, this);
    };

    /** @override */
    GHandTool.prototype.deactivate = function (view) {
        GTool.prototype.deactivate.call(this, view);

        view.removeEventListener(GMouseEvent.DragStart, this._mouseDragStart);
        view.removeEventListener(GMouseEvent.Drag, this._mouseDrag);
        view.removeEventListener(GMouseEvent.DragEnd, this._mouseDragEnd);
    };

    /** @override */
    GHandTool.prototype.isDeactivatable = function () {
        // cannot deactivate while dragging
        return this._panning ? false : true;
    };

    /**
     * @param {GMouseEvent.DragStart} event
     * @private
     */
    GHandTool.prototype._mouseDragStart = function (event) {
        this._panning = true;
        this.updateCursor();
    };

    /**
     * @param {GMouseEvent.Drag} event
     * @private
     */
    GHandTool.prototype._mouseDrag = function (event) {
        if (this._panning) {
            this._view.scrollBy(-event.clientDelta.getX(), -event.clientDelta.getY());
        }
    };

    /**
     * @param {GMouseEvent.DragEnd} event
     * @private
     */
    GHandTool.prototype._mouseDragEnd = function (event) {
        if (this._panning) {
            this._panning = false;
            this.updateCursor();
        }
    };

    /** override */
    GHandTool.prototype.toString = function () {
        return "[Object GHandTool]";
    };

    _.GHandTool = GHandTool;
})(this);