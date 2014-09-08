(function (_) {
    /**
     * An object representing a mouse input event.
     * @class IFMouseEvent
     * @extends IFInputEvent
     * @constructor
     * @version 1.0
     */
    function IFMouseEvent() {
    }

    IFObject.inherit(IFMouseEvent, IFInputEvent);

    /**
     * Constant defining the left mouse button
     * @type {Number}
     * @version 1.0
     */
    IFMouseEvent.BUTTON_LEFT = 0;

    /**
     * Constant defining the middle mouse button
     * @type {Number}
     * @version 1.0
     */
    IFMouseEvent.BUTTON_MIDDLE = 1;

    /**
     * Constant defining the right mouse button
     * @type {Number}
     * @version 1.0
     */
    IFMouseEvent.BUTTON_RIGHT = 2;

    /**
     * Tests and returns whether a given event class is a drag event or not
     * @param {Function|IFMouseEvent} event the event class or event instance to test
     * @returns {Boolean} true if event is a drag event, false if not
     * @version 1.0
     */
    IFMouseEvent.isDragEvent = function (event) {
        return ((event instanceof IFMouseEvent &&
            (event instanceof IFMouseEvent.DragStart || event instanceof IFMouseEvent.Drag || event instanceof IFMouseEvent.DragEnd)) ||
            (event == IFMouseEvent.DragStart || event == IFMouseEvent.Drag || event == IFMouseEvent.DragEnd));
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFMouseEvent Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * The position of the cursor in client (widget) -coordinates
     * @type {IFPoint}
     * @version 1.0
     */
    IFMouseEvent.prototype.client = 0;

    /**
     * The mouse button number held down
     * @type {Number}
     * @version 1.0
     */
    IFMouseEvent.prototype.button = 0;

    /** @override */
    IFMouseEvent.prototype.toString = function () {
        return "[Object IFMouseEvent(" + this._paramsToString() + ")]";
    };

    /** @override */
    IFMouseEvent.prototype._paramsToString = function () {
        return "client=" + this.client.toString() + ", " + IFInputEvent.prototype._paramsToString.call(this);
    }

    _.IFMouseEvent = IFMouseEvent;

    // -----------------------------------------------------------------------------------------------------------------
    // IFMouseEvent.Move
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse move event.
     * Note that this will always be fired before any drag events.
     * @class IFMouseEvent.Move
     * @extends IFMouseEvent
     * @constructor
     * @version 1.0
     */
    IFMouseEvent.Move = function () {
    }
    IFObject.inherit(IFMouseEvent.Move, IFMouseEvent);


    /** @override */
    IFMouseEvent.Move.prototype.toString = function () {
        return "[Object IFMouseEvent.Move(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFMouseEvent.Enter
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse enter event.
     * @class IFMouseEvent.Enter
     * @extends IFMouseEvent
     * @constructor
     * @version 1.0
     */
    IFMouseEvent.Enter = function () {
    }
    IFObject.inherit(IFMouseEvent.Enter, IFMouseEvent);


    /** @override */
    IFMouseEvent.Enter.prototype.toString = function () {
        return "[Object IFMouseEvent.Enter(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFMouseEvent.Leave
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse leave event.
     * @class IFMouseEvent.Leave
     * @extends IFMouseEvent
     * @constructor
     * @version 1.0
     */
    IFMouseEvent.Leave = function () {
    }
    IFObject.inherit(IFMouseEvent.Leave, IFMouseEvent);


    /** @override */
    IFMouseEvent.Leave.prototype.toString = function () {
        return "[Object IFMouseEvent.Leave(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFMouseEvent.Down
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse down event.
     * Note that this will always be fired before any drag events.
     * @class IFMouseEvent.Down
     * @extends IFMouseEvent
     * @constructor
     * @version 1.0
     */
    IFMouseEvent.Down = function () {
    }
    IFObject.inherit(IFMouseEvent.Down, IFMouseEvent);


    /** @override */
    IFMouseEvent.Down.prototype.toString = function () {
        return "[Object IFMouseEvent.Down(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFMouseEvent.Release
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse release (up) event.
     * Note that this will always be fired before any drag events.
     * @class IFMouseEvent.Release
     * @extends IFMouseEvent
     * @constructor
     * @version 1.0
     */
    IFMouseEvent.Release = function () {
    }
    IFObject.inherit(IFMouseEvent.Release, IFMouseEvent);


    /** @override */
    IFMouseEvent.Release.prototype.toString = function () {
        return "[Object IFMouseEvent.Release(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFMouseEvent.Click
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse click event.
     * @class IFMouseEvent.Click
     * @extends IFMouseEvent
     * @constructor
     * @version 1.0
     */
    IFMouseEvent.Click = function () {
    }
    IFObject.inherit(IFMouseEvent.Click, IFMouseEvent);


    /** @override */
    IFMouseEvent.Click.prototype.toString = function () {
        return "[Object IFMouseEvent.Click(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFMouseEvent.DblClick
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse double-click event.
     * @class IFMouseEvent.DblClick
     * @extends IFMouseEvent
     * @constructor
     * @version 1.0
     */
    IFMouseEvent.DblClick = function () {
    }
    IFObject.inherit(IFMouseEvent.DblClick, IFMouseEvent);

    /** @override */
    IFMouseEvent.DblClick.prototype.toString = function () {
        return "[Object IFMouseEvent.DblClick(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFMouseEvent.DragStart
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse drag-start event
     * Note that this will always be fired after a IFMouseEvent.Move event.
     * @class IFMouseEvent.DragStart
     * @extends IFMouseEvent
     * @constructor
     * @version 1.0
     */
    IFMouseEvent.DragStart = function () {
    }
    IFObject.inherit(IFMouseEvent.DragStart, IFMouseEvent);

    /** @override */
    IFMouseEvent.DragStart.prototype.toString = function () {
        return "[Object IFMouseEvent.DragStart(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFMouseEvent.Drag
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse drag (move) event
     * Note that this will always be fired after a IFMouseEvent.Move event.
     * @class IFMouseEvent.Drag
     * @extends IFMouseEvent
     * @constructor
     * @version 1.0
     */
    IFMouseEvent.Drag = function () {
    }
    IFObject.inherit(IFMouseEvent.Drag, IFMouseEvent);

    /**
     * The drag start position in client (widget) -coordinates
     * @type {IFPoint}
     * @version 1.0
     */
    IFMouseEvent.prototype.clientStart = 0;

    /**
     * The drag subtract (current to previous pos) in client (widget) -coordinates
     * @type {IFPoint}
     * @version 1.0
     */
    IFMouseEvent.prototype.clientDelta = 0;

    /** @override */
    IFMouseEvent.Drag.prototype.toString = function () {
        return "[Object IFMouseEvent.Drag(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFMouseEvent.DragEnd
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a mouse drag-end event
     * Note that this will always be fired after a IFMouseEvent.Release event.
     * @class IFMouseEvent.DragEnd
     * @extends IFMouseEvent.Drag
     * @constructor
     * @version 1.0
     */
    IFMouseEvent.DragEnd = function () {
    }
    IFObject.inherit(IFMouseEvent.DragEnd, IFMouseEvent.Drag);

    /** @override */
    IFMouseEvent.DragEnd.prototype.toString = function () {
        return "[Object IFMouseEvent.DragEnd(" + this._paramsToString() + ")]";
    };

})(this);