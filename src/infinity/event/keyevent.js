(function (_) {
    /**
     * An object representing a key input event.
     * @class GUIKeyEvent
     * @extends GUIInputEvent
     * @constructor
     * @version 1.0
     */
    function GUIKeyEvent() {
    }

    GObject.inherit(GUIKeyEvent, GUIInputEvent);

    /**
     * The key for the key event. Might either be one of GUIKey.Constant (number)
     * or a String if printable character key
     * @type {String|Number}
     * @version 1.0
     * @see GUIKey.Constant
     */
    GUIKeyEvent.prototype.key = null;

    /** @override */
    GUIKeyEvent.prototype.toString = function () {
        return "[Object GUIKeyEvent(" + this._paramsToString() + ")]";
    };

    /** @override */
    GUIKeyEvent.prototype.GUIKeyEvent = function () {
        return "key=" + this.key;
    }

    _.GUIKeyEvent = GUIKeyEvent;

    // -----------------------------------------------------------------------------------------------------------------
    // GUIKeyEvent.Down
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a key down event.
     * @class GUIKeyEvent.Down
     * @extends GUIKeyEvent
     * @constructor
     * @version 1.0
     */
    GUIKeyEvent.Down = function () {
    }
    GObject.inherit(GUIKeyEvent.Down, GUIKeyEvent);


    /** @override */
    GUIKeyEvent.Down.prototype.toString = function () {
        return "[Object GUIKeyEvent.Down(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GUIKeyEvent.Release
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a key release event.
     * @class GUIKeyEvent.Release
     * @extends GUIKeyEvent
     * @constructor
     * @version 1.0
     */
    GUIKeyEvent.Release = function () {
    }
    GObject.inherit(GUIKeyEvent.Release, GUIKeyEvent);


    /** @override */
    GUIKeyEvent.Release.prototype.toString = function () {
        return "[Object GUIKeyEvent.Release(" + this._paramsToString() + ")]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GUIKeyEvent.Press
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing a key press event.
     * @class GUIKeyEvent.Press
     * @extends GUIKeyEvent
     * @constructor
     * @version 1.0
     */
    GUIKeyEvent.Press = function () {
    }
    GObject.inherit(GUIKeyEvent.Press, GUIKeyEvent);


    /** @override */
    GUIKeyEvent.Press.prototype.toString = function () {
        return "[Object GUIKeyEvent.Press(" + this._paramsToString() + ")]";
    };

})(this);