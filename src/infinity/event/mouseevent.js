(function (_) {
    /**
     * An object representing a mouse input event.
     * @class GUIMouseEvent
     * @extends GUIInputEvent
     * @constructor
     * @version 1.0
     */
    function GUIMouseEvent() {
    }

    GObject.inherit(GUIMouseEvent, GUIInputEvent);

    /**
     * Constant defining the left mouse button
     * @type {Number}
     * @version 1.0
     */
    GUIMouseEvent.BUTTON_LEFT = 0;

    /**
     * Constant defining the middle mouse button
     * @type {Number}
     * @version 1.0
     */
    GUIMouseEvent.BUTTON_MIDDLE = 1;

    /**
     * Constant defining the right mouse button
     * @type {Number}
     * @version 1.0
     */
    GUIMouseEvent.BUTTON_RIGHT = 2;

    /**
     * Tests and returns whether a given event class is a drag event or not
     * @param {Function|GUIMouseEvent} event the event class or event instance to test
     * @returns {Boolean} true if event is a drag event, false if not
     * @version 1.0
     */
    GUIMouseEvent.isDragEvent = function (event) {
        return ((event instanceof GUIMouseEvent &&
            (event instanceof GUIMouseEvent.DragStart || event instanceof GUIMouseEvent.Drag || event instanceof GUIMouseEvent.DragEnd)) ||
            (event == GUIMouseEvent.DragStart || event == GUIMouseEvent.Drag || event == GUIMouseEvent.DragEnd));
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GUIMouseEvent Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * The position of the cursor in client (widget) -coordinates
     * @type {GPoint}
     * @version 1.0
     */
    GUIMouseEvent.prototype.client = 0;

    /**
     * The mouse button number held down
     * @type {Number}
     * @version 1.0
     */
    GUIMouseEvent.prototype.button = 0;

    /** @override */
    GUIMouseEvent.prototype.toString = function () {
        return "[Object GUIMouseEvent(" + this._paramsToString() + ")]";
    };

    /** @override */
    GUIMouseEvent.prototype._paramsToString = function () {
        return "client=" + this.client.toString() + ", " + GUIInputEvent.prototype._paramsToString.call(this);
    }

    _.GUIMouseEvent = GUIMouseEvent;

    // -----------------------------------------------------------------------------------------------------------------
    // GUIMouseEvent.Move
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse move event.
     * Note that this will always be fired before any drag events.
     * @class GUIMouseEvent.Move
     * @extends GUIMouseEvent
     * @constructor
     * @version 1.0
     */
    GUIMouseEvent.Move = function () {
    }
    GObject.inherit(GUIMouseEvent.Move, GUIMouseEvent);


    /** @override */
    GUIMouseEvent.Move.prototype.toString = function () {
        return "[Object GUIMouseEvent.Move(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GUIMouseEvent.Enter
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse enter event.
     * @class GUIMouseEvent.Enter
     * @extends GUIMouseEvent
     * @constructor
     * @version 1.0
     */
    GUIMouseEvent.Enter = function () {
    }
    GObject.inherit(GUIMouseEvent.Enter, GUIMouseEvent);


    /** @override */
    GUIMouseEvent.Enter.prototype.toString = function () {
        return "[Object GUIMouseEvent.Enter(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GUIMouseEvent.Leave
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse leave event.
     * @class GUIMouseEvent.Leave
     * @extends GUIMouseEvent
     * @constructor
     * @version 1.0
     */
    GUIMouseEvent.Leave = function () {
    }
    GObject.inherit(GUIMouseEvent.Leave, GUIMouseEvent);


    /** @override */
    GUIMouseEvent.Leave.prototype.toString = function () {
        return "[Object GUIMouseEvent.Leave(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GUIMouseEvent.Down
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse down event.
     * Note that this will always be fired before any drag events.
     * @class GUIMouseEvent.Down
     * @extends GUIMouseEvent
     * @constructor
     * @version 1.0
     */
    GUIMouseEvent.Down = function () {
    }
    GObject.inherit(GUIMouseEvent.Down, GUIMouseEvent);


    /** @override */
    GUIMouseEvent.Down.prototype.toString = function () {
        return "[Object GUIMouseEvent.Down(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GUIMouseEvent.Release
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse release (up) event.
     * Note that this will always be fired before any drag events.
     * @class GUIMouseEvent.Release
     * @extends GUIMouseEvent
     * @constructor
     * @version 1.0
     */
    GUIMouseEvent.Release = function () {
    }
    GObject.inherit(GUIMouseEvent.Release, GUIMouseEvent);


    /** @override */
    GUIMouseEvent.Release.prototype.toString = function () {
        return "[Object GUIMouseEvent.Release(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GUIMouseEvent.Click
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse click event.
     * @class GUIMouseEvent.Click
     * @extends GUIMouseEvent
     * @constructor
     * @version 1.0
     */
    GUIMouseEvent.Click = function () {
    }
    GObject.inherit(GUIMouseEvent.Click, GUIMouseEvent);


    /** @override */
    GUIMouseEvent.Click.prototype.toString = function () {
        return "[Object GUIMouseEvent.Click(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GUIMouseEvent.DblClick
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse double-click event.
     * @class GUIMouseEvent.DblClick
     * @extends GUIMouseEvent
     * @constructor
     * @version 1.0
     */
    GUIMouseEvent.DblClick = function () {
    }
    GObject.inherit(GUIMouseEvent.DblClick, GUIMouseEvent);

    /** @override */
    GUIMouseEvent.DblClick.prototype.toString = function () {
        return "[Object GUIMouseEvent.DblClick(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GUIMouseEvent.DragStart
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse drag-start event
     * Note that this will always be fired after a GUIMouseEvent.Move event.
     * @class GUIMouseEvent.DragStart
     * @extends GUIMouseEvent
     * @constructor
     * @version 1.0
     */
    GUIMouseEvent.DragStart = function () {
    }
    GObject.inherit(GUIMouseEvent.DragStart, GUIMouseEvent);

    /** @override */
    GUIMouseEvent.DragStart.prototype.toString = function () {
        return "[Object GUIMouseEvent.DragStart(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GUIMouseEvent.Drag
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse drag (move) event
     * Note that this will always be fired after a GUIMouseEvent.Move event.
     * @class GUIMouseEvent.Drag
     * @extends GUIMouseEvent
     * @constructor
     * @version 1.0
     */
    GUIMouseEvent.Drag = function () {
    }
    GObject.inherit(GUIMouseEvent.Drag, GUIMouseEvent);

    /**
     * The drag start position in client (widget) -coordinates
     * @type {GPoint}
     * @version 1.0
     */
    GUIMouseEvent.prototype.clientStart = 0;

    /**
     * The drag subtract (current to previous pos) in client (widget) -coordinates
     * @type {GPoint}
     * @version 1.0
     */
    GUIMouseEvent.prototype.clientDelta = 0;

    /** @override */
    GUIMouseEvent.Drag.prototype.toString = function () {
        return "[Object GUIMouseEvent.Drag(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GUIMouseEvent.DragEnd
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse drag-end event
     * Note that this will always be fired after a GUIMouseEvent.Release event.
     * @class GUIMouseEvent.DragEnd
     * @extends GUIMouseEvent.Drag
     * @constructor
     * @version 1.0
     */
    GUIMouseEvent.DragEnd = function () {
    }
    GObject.inherit(GUIMouseEvent.DragEnd, GUIMouseEvent.Drag);

    /** @override */
    GUIMouseEvent.DragEnd.prototype.toString = function () {
        return "[Object GUIMouseEvent.DragEnd(" + this._paramsToString() + ")]";
    };

})(this);