(function (_) {
    /**
     * IFObject is the base object for everything and all
     * @class IFObject
     * @constructor
     * @version 1.0
     */
    function IFObject() {
    }

    // -----------------------------------------------------------------------------------------------------------------
    // IFObject.getTypeId Function
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Tries to gather the type id of a given object
     * @param {Object|Function|Number} object
     * @return {Number} the type id or null if none was found
     */
    IFObject.getTypeId = function (object) {
        if (typeof object === 'number') {
            return object;
        } else if (typeof object === 'function' && object.prototype.hasOwnProperty('__gtype_id__')) {
            return object.prototype.__gtype_id__;
        } else if (object && typeof object.__gtype_id__ === 'number') {
            return object.__gtype_id__;
        } else {
            return null;
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFObject.getName Function
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Tries to gather the name of a given source. Falls back to the toString() method.
     * @param {Object|Function|Number} object
     * @return {String} the name of the object or null for none
     */
    IFObject.getName = function (object) {
        if (object) {
            if (typeof object == 'object') {
                object = object.constructor;
            }

            if (object && typeof object == 'function') {
                var funcNameRegex = /function (.{1,})\(/;
                var results = (funcNameRegex).exec(object.toString());
                return (results && results.length > 1) ? results[1] : "anonymous";
            }

            return object.toString();
        } else {
            return "<null>";
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFObject.inherit Function
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Inherit from another base including fixing the constructor
     * @param {Object} target the class that should be inherited into
     * @param {Object} base the base the other class should inherit from
     * @version 1.0
     */
    IFObject.inherit = function (target, base) {
        target.prototype = Object.create(base.prototype);
        target.prototype.__gtype_id__ = IFObject._internalTypeIdCounter++;
        target.prototype.constructor = target;

        // Delete any existing mixins property to avoid writing to the same
        delete target.prototype.__gmixins__;

        // Ensure to inherit mixins as well
        if (base.prototype.__gmixins__) {
            target.prototype.__gmixins__ = {};
            for (var mixin_id in base.prototype.__gmixins__) {
                target.prototype.__gmixins__[mixin_id] = true;
            }
        }

        // Mix properties of constructor here as they may contain constants and the such
        if (base != IFObject) {
            for (var prop in base) {
                if (prop && prop.length > 0 && prop !== "constructor" && prop != "__gmixins__" && prop != "toString" && prop.charAt(0) != "_" && !target[prop]) {
                    target[prop] = base[prop];
                }
            }
        }
    };

    /**
     * Mixin classes together
     * @param {Object} target the class to be mixed into
     * @param {Array} mixins array if mixins to mix into
     * @version 1.0
     */
    IFObject.mix = function (target, mixins) {
        IFObject.inheritAndMix(target, null, mixins);
    };

    /**
     * Mixin classes than inherit whereas the inheriting class has the "last word"
     * @param {Object} target the target class to add the mixins to and to inherit into
     * @param {Object} base the base class to inherit from
     * @param {Array} [mixins] array if mixins to mix into
     * @version 1.0
     */
    IFObject.inheritAndMix = function (target, base, mixins) {
        // Inherit from base (if any), first
        if (base) {
            this.inherit(target, base);
        }

        if (mixins) {
            if (!target.prototype.__gmixins__) {
                target.prototype.__gmixins__ = {};
            }

            for (var i = 0; i < mixins.length; ++i) {
                var mixinPrototype = mixins[i].prototype;

                for (var prop in mixinPrototype) {
                    if (prop && prop !== "constructor" && prop != "toString" && prop != "__gmixins__" && prop != "__gtype_id__" && prop != "hasMixin") {
                        if (prop in target.prototype) {
                            throw new Error("Mixin " + mixinPrototype + " may not override " + prop + " in " + target.prototype);
                        }
                        target.prototype[prop] = mixinPrototype[prop];
                    }
                }

                if (!mixinPrototype.__gtype_id__) {
                    mixinPrototype.__gtype_id__ = IFObject._internalTypeIdCounter++;
                }

                target.prototype.__gmixins__[mixinPrototype.__gtype_id__] = true;

                // If the mixin prototype has by itself mixins, ensure to add their references
                if (mixinPrototype.__gmixins__) {
                    for (var mixin_id in mixinPrototype.__gmixins__) {
                        target.prototype.__gmixins__[mixin_id] = true;
                    }
                }
            }
        }
    };

    /**
     * @type {Number}
     * @private
     */
    IFObject._internalTypeIdCounter = 0;

    /**
     * @type {Number}
     * @private
     */
    IFObject.prototype.__gtype_id__ = -1;

    /**
     * @type {Object}
     * @private
     */
    IFObject.prototype.__gmixins__ = null;

    /**
     * Returns whether the instance contains a given mixin
     * @param {Object} mixin the mixin to check for
     * @return {Boolean} true if this instance contains the given mixin
     * @version 1.0
     */
    IFObject.prototype.hasMixin = function (mixin) {
        return this.__gmixins__ && this.__gmixins__[mixin.prototype.__gtype_id__] ? true : false;
    };

    /** @override */
    IFObject.prototype.toString = function () {
        var cname = this.constructor.toString().match(/^function ([^\(]*)/);
        return "[Object " + (cname ? cname[1] : 'object') + "]";
    };

    _.IFObject = IFObject;

})(this);