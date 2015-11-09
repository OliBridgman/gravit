(function (_) {
    /**
     * Instance of a platform implementation
     * @class GPlatform
     * @extends GObject
     * @mixes GEventTarget
     * @constructor
     * @version 1.0
     */
    function GPlatform() {
        document.addEventListener("keydown", function (event) {
            if (!document.activeElement ||
                ((!$(document.activeElement).is(":input") ||
                $(document.activeElement).is(":button")) &&
                !document.activeElement.isContentEditable)) {
                this._updateModifiers(event);
            }
        }.bind(this), true);
        document.addEventListener("keyup", function (event) {
            this._updateModifiers(event);
        }.bind(this), true);
    }

    GObject.inheritAndMix(GPlatform, GObject, [GEventTarget]);

    // -----------------------------------------------------------------------------------------------------------------
    // GPlatform.Modifiers Class
    // -----------------------------------------------------------------------------------------------------------------
    GPlatform.Modifiers = function () {
    };

    /**
     * Whether the meta-key is held down or not (command on mac, ctrl on others)
     * @type {Boolean}
     * @version 1.0
     */
    GPlatform.Modifiers.metaKey = false;

    /**
     * Whether the shift-key is held down or not
     * @type {Boolean}
     * @version 1.0
     */
    GPlatform.Modifiers.shiftKey = false;

    /**
     * Whether the option-key is held down or not
     * @type {Boolean}
     * @version 1.0
     */
    GPlatform.Modifiers.optionKey = false;

    /**
     * Whether the space-key is held down or not
     * @type {Boolean}
     * @version 1.0
     */
    GPlatform.Modifiers.spaceKey = false;

    /** @override */
    GPlatform.Modifiers.prototype.toString = function () {
        return "[Object GPlatform.Modifiers]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GPlatform.ModifiersChangedEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An object representing an event when one or more modifiers have been changed globally
     * @class GPlatform.ModifiersChangedEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     * @see GPlatform.modifiers
     */
    GPlatform.ModifiersChangedEvent = function () {
        this.changed = new GPlatform.Modifiers();
    }
    GObject.inherit(GPlatform.ModifiersChangedEvent, GEvent);

    /**
     * The modifiers that have been changed
     * @type {GPlatform.Modifiers}
     * @version 1.0
     */
    GPlatform.ModifiersChangedEvent.prototype.changed = null;

    /** @override */
    GPlatform.ModifiersChangedEvent.prototype.toString = function () {
        return "[Object GPlatform.ModifiersChangedEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GPlatform Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * The globally accessible active modifiers
     * @type {GPlatform.Modifiers}
     * @version 1.0
     */
    GPlatform.prototype.modifiers = new GPlatform.Modifiers();

    /**
     * Cached modifiers changed event
     * @type {GPlatform.ModifiersChangedEvent}
     * @private
     */
    GPlatform.prototype._modifiersChangedEventCache = new GPlatform.ModifiersChangedEvent();

    /**
     * Schedule a new frame callback
     * @param {Function} callback the callback to be executed
     * @return {Object} an scheduleId which can be used to cancel the request
     * @version 1.0
     */
    GPlatform.prototype.scheduleFrame = function (callback) {
        return window.requestAnimationFrame(callback);
    };

    /**
     * Cancel a scheduled frame
     * @param {Object} scheduleId the id retrieved when calling scheduleFrame
     * @version 1.0
     */
    GPlatform.prototype.cancelFrame = function (scheduleId) {
        window.cancelRequestAnimationFrame(scheduleId);
    };

    /**
     * @param {KeyboardEvent} event
     * @private
     */
    GPlatform.prototype._updateModifiers = function (event) {
        var optionKey = false;
        var shiftKey = false;
        var metaKey = false;
        var spaceKey = false;

        var _evMetaKey  = (GSystem.operatingSystem !== GSystem.OperatingSystem.OSX_IOS || GSystem.hardware !== GSystem.Hardware.Desktop) ? event.ctrlKey : event.metaKey;

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
            if (this.hasEventListeners(GPlatform.ModifiersChangedEvent)) {
                this._modifiersChangedEventCache.changed.metaKey = metaKey;
                this._modifiersChangedEventCache.changed.optionKey = optionKey;
                this._modifiersChangedEventCache.changed.shiftKey = shiftKey;
                this._modifiersChangedEventCache.changed.spaceKey = spaceKey;
                this.trigger(this._modifiersChangedEventCache);
            }
        }
    };

    _.GPlatform = GPlatform;
    _.ifPlatform = new GPlatform();

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