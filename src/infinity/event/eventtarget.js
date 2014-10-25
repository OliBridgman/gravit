(function (_) {
    /**
     * A mixin representing the target of an event.
     * @class GEventTarget
     * @mixin
     * @constructor
     * @version 1.0
     */
    function GEventTarget() {
    }

    /**
     * @type Object
     * @private
     */
    GEventTarget.prototype._listeners = null;

    /**
     * Add a new listener for a specific eventClass to this object
     * @param {*} eventClass the eventClass to register the listener for
     * @param {Function} listener the listener function to be called
     * @param {Object} [target] optional target ("this") for the listener
     * @param {Array} [args] optional arguments to be prepended to the listener call
     * @version 1.0
     */
    GEventTarget.prototype.addEventListener = function (eventClass, listener, target, args) {
        var event_id = GObject.getTypeId(eventClass);

        if (!this._listeners) {
            this._listeners = {};
        }

        // Save the original listener for later removal identification
        var sourceListener = listener;

        // Check if we shall bind the listener
        if (target || args) {
            /** @type Array */
            var argArray = args ? args.slice() : [];
            argArray.unshift(target ? target : listener);
            listener = Function.prototype.bind.apply(listener, argArray);
        }

        if (!(event_id in this._listeners)) {
            this._listeners[event_id] = {
                eventClass: eventClass,
                listeners: []
            };
        }

        this._listeners[event_id].listeners.push({listener: listener, sourceListener: sourceListener, target: target});
    };

    /**
     * Remove a listener for a specific eventClass from this object
     * @param {*} eventClass the constructor of the eventClass to unregister for
     * @param {Function} listener the listener function to be removed
     * @param {Object} [target] optional target ("this") for the listener
     * @version 1.0
     */
    GEventTarget.prototype.removeEventListener = function (eventClass, listener, target) {
        var event_id = GObject.getTypeId(eventClass);

        if (this._listeners && event_id in this._listeners) {
            var array = this._listeners[event_id].listeners;
            for (var i = 0; i < array.length; ++i) {
                if (array[i].sourceListener == listener && (!target || array[i].target === target)) {
                    array.splice(i, 1);
                    --i;
                }
            }
            if (array.length == 0) {
                delete this._listeners[event_id];
            }
        }
    };

    /**
     * Checks and returns whether there's at least one listener registered
     * for a specific eventClass
     * @param {*} eventClass the constructor of the eventClass to check for
     * @returns {Boolean} true if there's at least one listener, false if not
     * @version 1.0
     */
    GEventTarget.prototype.hasEventListeners = function (eventClass) {
        var event_id = GObject.getTypeId(eventClass);
        return this._listeners && event_id in this._listeners ? true : false;
    };

    /**
     * Trigger an event for this object. Note: You should always check if there
     * is an event listener registered for the given event before triggering.
     * @param {GEvent} event the event to trigger
     * @see hasEventListeners
     * @version 1.0
     */
    GEventTarget.prototype.trigger = function (event) {
        if (this._listeners) {
            var event_id = GObject.getTypeId(event);
            if (event_id in this._listeners) {
                var array = this._listeners[event_id].listeners;
                for (var i = 0; i < array.length; ++i) {
                    var listenerObj = array[i];
                    listenerObj.listener.call(this, event);
                }
            }
        }
    };

    _.GEventTarget = GEventTarget;
})(this);