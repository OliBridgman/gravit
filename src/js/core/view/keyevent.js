(function (_) {
    /**
     * An object representing a key input event.
     * @class GKeyEvent
     * @extends GInputEvent
     * @constructor
     * @version 1.0
     */
    function GKeyEvent() {
    }

    GObject.inherit(GKeyEvent, GInputEvent);

    /**
     * The key for the key event. Might either be one of GKey.Constant (number)
     * or a String if printable character key
     * @type {String|Number}
     * @version 1.0
     * @see GKey.Constant
     */
    GKeyEvent.prototype.key = null;

    /** @override */
    GKeyEvent.prototype.toString = function () {
        return "[Object GKeyEvent(" + this._paramsToString() + ")]";
    };

    /** @override */
    GKeyEvent.prototype.GKeyEvent = function () {
        return "key=" + this.key;
    }

    _.GKeyEvent = GKeyEvent;

    // -----------------------------------------------------------------------------------------------------------------
    // GKeyEvent.Down
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a key down event.
     * @class GKeyEvent.Down
     * @extends GKeyEvent
     * @constructor
     * @version 1.0
     */
    GKeyEvent.Down = function () {
    }
    GObject.inherit(GKeyEvent.Down, GKeyEvent);


    /** @override */
    GKeyEvent.Down.prototype.toString = function () {
        return "[Object GKeyEvent.Down(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GKeyEvent.Release
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a key release event.
     * @class GKeyEvent.Release
     * @extends GKeyEvent
     * @constructor
     * @version 1.0
     */
    GKeyEvent.Release = function () {
    }
    GObject.inherit(GKeyEvent.Release, GKeyEvent);


    /** @override */
    GKeyEvent.Release.prototype.toString = function () {
        return "[Object GKeyEvent.Release(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GKeyEvent.Press
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a key press event.
     * @class GKeyEvent.Press
     * @extends GKeyEvent
     * @constructor
     * @version 1.0
     */
    GKeyEvent.Press = function () {
    }
    GObject.inherit(GKeyEvent.Press, GKeyEvent);


    /** @override */
    GKeyEvent.Press.prototype.toString = function () {
        return "[Object GKeyEvent.Press(" + this._paramsToString() + ")]";
    };

})(this);