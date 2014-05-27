(function (_) {
    /**
     * Instance of a platform implementation
     * @class GUIPlatform
     * @extends IFObject
     * @mixes GEventTarget
     * @constructor
     * @version 1.0
     */
    function GUIPlatform() {
        document.addEventListener("keydown", function (event) {
            if (!document.activeElement || (!$(document.activeElement).is(":input") && !document.activeElement.isContentEditable)) {
                this._updateModifiers(event);
            }
        }.bind(this), true);
        document.addEventListener("keyup", function (event) {
            this._updateModifiers(event);
        }.bind(this), true);
    }

    IFObject.inheritAndMix(GUIPlatform, IFObject, [GEventTarget]);

    // -----------------------------------------------------------------------------------------------------------------
    // GUIPlatform.Modifiers Class
    // -----------------------------------------------------------------------------------------------------------------
    GUIPlatform.Modifiers = function () {
    };

    /**
     * Whether the meta-key is held down or not (command on mac, ctrl on others)
     * @type {Boolean}
     * @version 1.0
     */
    GUIPlatform.Modifiers.metaKey = false;

    /**
     * Whether the shift-key is held down or not
     * @type {Boolean}
     * @version 1.0
     */
    GUIPlatform.Modifiers.shiftKey = false;

    /**
     * Whether the option-key is held down or not
     * @type {Boolean}
     * @version 1.0
     */
    GUIPlatform.Modifiers.optionKey = false;

    /**
     * Whether the space-key is held down or not
     * @type {Boolean}
     * @version 1.0
     */
    GUIPlatform.Modifiers.spaceKey = false;

    /** @override */
    GUIPlatform.Modifiers.prototype.toString = function () {
        return "[Object GUIPlatform.Modifiers]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GUIPlatform.ModifiersChangedEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing an event when one or more modifiers have been changed globally
     * @class GUIPlatform.ModifiersChangedEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     * @see GUIPlatform.modifiers
     */
    GUIPlatform.ModifiersChangedEvent = function () {
        this.changed = new GUIPlatform.Modifiers();
    }
    IFObject.inherit(GUIPlatform.ModifiersChangedEvent, GEvent);

    /**
     * The modifiers that have been changed
     * @type {GUIPlatform.Modifiers}
     * @version 1.0
     */
    GUIPlatform.ModifiersChangedEvent.prototype.changed = null;

    /** @override */
    GUIPlatform.ModifiersChangedEvent.prototype.toString = function () {
        return "[Object GUIPlatform.ModifiersChangedEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GUIPlatform Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * The globally accessible active modifiers
     * @type {GUIPlatform.Modifiers}
     * @version 1.0
     */
    GUIPlatform.prototype.modifiers = new GUIPlatform.Modifiers();

    /**
     * Cached modifiers changed event
     * @type {GUIPlatform.ModifiersChangedEvent}
     * @private
     */
    GUIPlatform.prototype._modifiersChangedEventCache = new GUIPlatform.ModifiersChangedEvent();

    /**
     * Schedule a new frame callback
     * @param {Function} callback the callback to be executed
     * @return {Object} an scheduleId which can be used to cancel the request
     * @version 1.0
     */
    GUIPlatform.prototype.scheduleFrame = function (callback) {
        return window.requestAnimationFrame(callback);
    };

    /**
     * Cancel a scheduled frame
     * @param {Object} scheduleId the id retrieved when calling scheduleFrame
     * @version 1.0
     */
    GUIPlatform.prototype.cancelFrame = function (scheduleId) {
        window.cancelRequestAnimationFrame(scheduleId);
    };

    /**
     * @param {KeyboardEvent} event
     * @private
     */
    GUIPlatform.prototype._updateModifiers = function (event) {
        var optionKey = false;
        var shiftKey = false;
        var metaKey = false;
        var spaceKey = false;

        var _evMetaKey  = (ifSystem.operatingSystem !== IFSystem.OperatingSystem.OSX_IOS || ifSystem.hardware !== IFSystem.Hardware.Desktop) ? event.ctrlKey : event.metaKey;

        // Update global modifiers
        if (_evMetaKey != this.modifiers.metaKey) {
            metaKey = true;
            this.modifiers.metaKey = _evMetaKey;
        }

        if (event.altKey != this.modifiers.optionKey) {
            optionKey = true;
            this.modifiers.optionKey = event.altKey;
        }

        if (event.shiftKey != this.modifiers.shiftKey) {
            shiftKey = true;
            this.modifiers.shiftKey = event.shiftKey;
        }

        // Add some 'fake' modifier keys here
        var eventSpaceKey = event.type === 'keydown' && event.keyCode === 32 ? true :
            (event.type === 'keyup' && event.keyCode === 32 ? false : this.modifiers.spaceKey);

        if (eventSpaceKey != this.modifiers.spaceKey) {
            spaceKey = true;
            this.modifiers.spaceKey = eventSpaceKey;
        }

        if (metaKey || optionKey || shiftKey || metaKey || spaceKey) {
            if (this.hasEventListeners(GUIPlatform.ModifiersChangedEvent)) {
                this._modifiersChangedEventCache.changed.metaKey = metaKey;
                this._modifiersChangedEventCache.changed.optionKey = optionKey;
                this._modifiersChangedEventCache.changed.shiftKey = shiftKey;
                this._modifiersChangedEventCache.changed.spaceKey = spaceKey;
                this.trigger(this._modifiersChangedEventCache);
            }
        }
    };

    _.GUIPlatform = GUIPlatform;
    _.gPlatform = new GUIPlatform();

    /**
     * Fixture for the various requestAnimationFrame implementations on the browsers
     */
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
})(this);