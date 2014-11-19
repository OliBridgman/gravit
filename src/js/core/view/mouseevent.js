(function (_) {
    /**
     * An object representing a mouse input event.
     * @class GMouseEvent
     * @extends GInputEvent
     * @constructor
     * @version 1.0
     */
    function GMouseEvent() {
    }

    GObject.inherit(GMouseEvent, GInputEvent);

    /**
     * Constant defining the left mouse button
     * @type {Number}
     * @version 1.0
     */
    GMouseEvent.BUTTON_LEFT = 0;

    /**
     * Constant defining the middle mouse button
     * @type {Number}
     * @version 1.0
     */
    GMouseEvent.BUTTON_MIDDLE = 1;

    /**
     * Constant defining the right mouse button
     * @type {Number}
     * @version 1.0
     */
    GMouseEvent.BUTTON_RIGHT = 2;

    /**
     * Tests and returns whether a given event class is a drag event or not
     * @param {Function|GMouseEvent} event the event class or event instance to test
     * @returns {Boolean} true if event is a drag event, false if not
     * @version 1.0
     */
    GMouseEvent.isDragEvent = function (event) {
        return ((event instanceof GMouseEvent &&
            (event instanceof GMouseEvent.DragStart || event instanceof GMouseEvent.Drag || event instanceof GMouseEvent.DragEnd)) ||
            (event == GMouseEvent.DragStart || event == GMouseEvent.Drag || event == GMouseEvent.DragEnd));
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GMouseEvent Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * The position of the cursor in client (widget) -coordinates
     * @type {GPoint}
     * @version 1.0
     */
    GMouseEvent.prototype.client = 0;

    /**
     * The mouse button number held down
     * @type {Number}
     * @version 1.0
     */
    GMouseEvent.prototype.button = 0;

    /** @override */
    GMouseEvent.prototype.toString = function () {
        return "[Object GMouseEvent(" + this._paramsToString() + ")]";
    };

    /** @override */
    GMouseEvent.prototype._paramsToString = function () {
        return "client=" + this.client.toString() + ", " + GInputEvent.prototype._paramsToString.call(this);
    }

    _.GMouseEvent = GMouseEvent;

    // -----------------------------------------------------------------------------------------------------------------
    // GMouseEvent.Move
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse move event.
     * Note that this will always be fired before any drag events.
     * @class GMouseEvent.Move
     * @extends GMouseEvent
     * @constructor
     * @version 1.0
     */
    GMouseEvent.Move = function () {
    }
    GObject.inherit(GMouseEvent.Move, GMouseEvent);


    /** @override */
    GMouseEvent.Move.prototype.toString = function () {
        return "[Object GMouseEvent.Move(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GMouseEvent.Enter
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse enter event.
     * @class GMouseEvent.Enter
     * @extends GMouseEvent
     * @constructor
     * @version 1.0
     */
    GMouseEvent.Enter = function () {
    }
    GObject.inherit(GMouseEvent.Enter, GMouseEvent);


    /** @override */
    GMouseEvent.Enter.prototype.toString = function () {
        return "[Object GMouseEvent.Enter(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GMouseEvent.Leave
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse leave event.
     * @class GMouseEvent.Leave
     * @extends GMouseEvent
     * @constructor
     * @version 1.0
     */
    GMouseEvent.Leave = function () {
    }
    GObject.inherit(GMouseEvent.Leave, GMouseEvent);


    /** @override */
    GMouseEvent.Leave.prototype.toString = function () {
        return "[Object GMouseEvent.Leave(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GMouseEvent.Down
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse down event.
     * Note that this will always be fired before any drag events.
     * @class GMouseEvent.Down
     * @extends GMouseEvent
     * @constructor
     * @version 1.0
     */
    GMouseEvent.Down = function () {
    }
    GObject.inherit(GMouseEvent.Down, GMouseEvent);


    /** @override */
    GMouseEvent.Down.prototype.toString = function () {
        return "[Object GMouseEvent.Down(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GMouseEvent.Release
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse release (up) event.
     * Note that this will always be fired before any drag events.
     * @class GMouseEvent.Release
     * @extends GMouseEvent
     * @constructor
     * @version 1.0
     */
    GMouseEvent.Release = function () {
    }
    GObject.inherit(GMouseEvent.Release, GMouseEvent);


    /** @override */
    GMouseEvent.Release.prototype.toString = function () {
        return "[Object GMouseEvent.Release(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GMouseEvent.Click
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse click event.
     * @class GMouseEvent.Click
     * @extends GMouseEvent
     * @constructor
     * @version 1.0
     */
    GMouseEvent.Click = function () {
    }
    GObject.inherit(GMouseEvent.Click, GMouseEvent);


    /** @override */
    GMouseEvent.Click.prototype.toString = function () {
        return "[Object GMouseEvent.Click(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GMouseEvent.DblClick
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse double-click event.
     * @class GMouseEvent.DblClick
     * @extends GMouseEvent
     * @constructor
     * @version 1.0
     */
    GMouseEvent.DblClick = function () {
    }
    GObject.inherit(GMouseEvent.DblClick, GMouseEvent);

    /** @override */
    GMouseEvent.DblClick.prototype.toString = function () {
        return "[Object GMouseEvent.DblClick(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GMouseEvent.DragStart
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse drag-start event
     * Note that this will always be fired after a GMouseEvent.Move event.
     * @class GMouseEvent.DragStart
     * @extends GMouseEvent
     * @constructor
     * @version 1.0
     */
    GMouseEvent.DragStart = function () {
    }
    GObject.inherit(GMouseEvent.DragStart, GMouseEvent);

    /** @override */
    GMouseEvent.DragStart.prototype.toString = function () {
        return "[Object GMouseEvent.DragStart(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GMouseEvent.Drag
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse drag (move) event
     * Note that this will always be fired after a GMouseEvent.Move event.
     * @class GMouseEvent.Drag
     * @extends GMouseEvent
     * @constructor
     * @version 1.0
     */
    GMouseEvent.Drag = function () {
    }
    GObject.inherit(GMouseEvent.Drag, GMouseEvent);

    /**
     * The drag start position in client (widget) -coordinates
     * @type {GPoint}
     * @version 1.0
     */
    GMouseEvent.prototype.clientStart = 0;

    /**
     * The drag subtract (current to previous pos) in client (widget) -coordinates
     * @type {GPoint}
     * @version 1.0
     */
    GMouseEvent.prototype.clientDelta = 0;

    /** @override */
    GMouseEvent.Drag.prototype.toString = function () {
        return "[Object GMouseEvent.Drag(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GMouseEvent.DragEnd
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse drag-end event
     * Note that this will always be fired after a GMouseEvent.Release event.
     * @class GMouseEvent.DragEnd
     * @extends GMouseEvent.Drag
     * @constructor
     * @version 1.0
     */
    GMouseEvent.DragEnd = function () {
    }
    GObject.inherit(GMouseEvent.DragEnd, GMouseEvent.Drag);

    /** @override */
    GMouseEvent.DragEnd.prototype.toString = function () {
        return "[Object GMouseEvent.DragEnd(" + this._paramsToString() + ")]";
    };

})(this);