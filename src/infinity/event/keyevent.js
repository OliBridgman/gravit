(function (_) {
    /**
     * An object representing a key input event.
     * @class IFKeyEvent
     * @extends IFInputEvent
     * @constructor
     * @version 1.0
     */
    function IFKeyEvent() {
    }

    IFObject.inherit(IFKeyEvent, IFInputEvent);

    /**
     * The key for the key event. Might either be one of IFKey.Constant (number)
     * or a String if printable character key
     * @type {String|Number}
     * @version 1.0
     * @see IFKey.Constant
     */
    IFKeyEvent.prototype.key = null;

    /** @override */
    IFKeyEvent.prototype.toString = function () {
        return "[Object IFKeyEvent(" + this._paramsToString() + ")]";
    };

    /** @override */
    IFKeyEvent.prototype.IFKeyEvent = function () {
        return "key=" + this.key;
    }

    _.IFKeyEvent = IFKeyEvent;

    // -----------------------------------------------------------------------------------------------------------------
    // IFKeyEvent.Down
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a key down event.
     * @class IFKeyEvent.Down
     * @extends IFKeyEvent
     * @constructor
     * @version 1.0
     */
    IFKeyEvent.Down = function () {
    }
    IFObject.inherit(IFKeyEvent.Down, IFKeyEvent);


    /** @override */
    IFKeyEvent.Down.prototype.toString = function () {
        return "[Object IFKeyEvent.Down(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFKeyEvent.Release
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a key release event.
     * @class IFKeyEvent.Release
     * @extends IFKeyEvent
     * @constructor
     * @version 1.0
     */
    IFKeyEvent.Release = function () {
    }
    IFObject.inherit(IFKeyEvent.Release, IFKeyEvent);


    /** @override */
    IFKeyEvent.Release.prototype.toString = function () {
        return "[Object IFKeyEvent.Release(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFKeyEvent.Press
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a key press event.
     * @class IFKeyEvent.Press
     * @extends IFKeyEvent
     * @constructor
     * @version 1.0
     */
    IFKeyEvent.Press = function () {
    }
    IFObject.inherit(IFKeyEvent.Press, IFKeyEvent);


    /** @override */
    IFKeyEvent.Press.prototype.toString = function () {
        return "[Object IFKeyEvent.Press(" + this._paramsToString() + ")]";
    };

})(this);