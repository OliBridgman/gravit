(function (_) {
    /**
     * Base node
     * @class GNode
     * @extends GObject
     * @constructor
     * @version 1.0
     */
    function GNode() {
    };

    GObject.inherit(GNode, GObject);

    /**
     * Nodes's mime-type
     * @type {string}
     */
    GNode.MIME_TYPE = "application/infinity+node";

    /**
     * GObject.inherit descendant for nodes
     * @param {String} name the unique name for the node
     * @see GObject.inherit
     */
    GNode.inherit = function (name, target, base) {
        GObject.inherit(target, base);
        GNode._registerNodeClass(name, target);
    };

    /**
     * GObject.inheritAndMix descendant for nodes
     * @param {String} name the unique name for the node
     * @see GObject.inheritAndMix
     */
    GNode.inheritAndMix = function (name, target, base, mixins) {
        GObject.inheritAndMix(target, base, mixins);
        GNode._registerNodeClass(name, target);
    };

    /**
     * Returns the name for a given node or node class
     * @param {Object|Function|Number} node
     */
    GNode.getName = function (node) {
        return GNode._nodeClassToNameMap[GObject.getTypeId(node)];
    };

    /**
     * Called to store a given node into a blob
     * @param {GNode} node the node to be stored
     * @returns {*} the stored blob for the node or null on failure
     */
    GNode.store = function (node) {
        if (node.hasMixin(GNode.Store)) {
            var blob = {
                '@': GNode._nodeClassToNameMap[GObject.getTypeId(node)]
            };

            node._notifyChange(GNode._Change.PrepareStore, blob);

            if (node.hasMixin(GNode.Container)) {
                // Store children
                for (var child = node.getFirstChild(); child !== null; child = child.getNext()) {
                    var childBlob = GNode.store(child);
                    if (childBlob) {
                        if (!blob.hasOwnProperty('$')) {
                            blob['$'] = [childBlob];
                        } else {
                            blob['$'].push(childBlob);
                        }
                    }
                }
            }

            if (node.hasMixin(GNode.Properties)) {
                // Store custom properties if any
                for (var property in node) {
                    if (node.hasOwnProperty(property) && property.length > 1 && property.charAt(0) === '@') {
                        blob[property] = node[property];
                    }
                }
            }

            if (node.hasMixin(GNode.Reference) && node._referenceId) {
                // Restore referenceId
                blob['#'] = node._referenceId;
            }

            node._notifyChange(GNode._Change.Store, blob);

            return blob;
        }
        return null;
    };

    /**
     * Restore a node from a given blob
     * @param {*} blob the blob to restore from
     * @returns {GNode} a node instance of the blob-type or
     * null for failure
     */
    GNode.restore = function (blob) {
        if (!blob || !blob.hasOwnProperty('@')) {
            return null;
        }

        var nodeClass = GNode._nameToNodeClassMap[blob['@']];
        if (!nodeClass) {
            return null;
        }

        // Create our node instance now and let it restore
        var node = new nodeClass();

        GNode.restoreInstance(blob, node);

        return node;
    };

    /**
     * Restore an existing node instance from a given blob
     * @param {*} blob the blob to restore from
     * @param {GNode} node the instance to be restored
     */
    GNode.restoreInstance = function (blob, node) {
        node._notifyChange(GNode._Change.PrepareRestore, blob);

        // Restore children if any
        if (blob.hasOwnProperty('$') && node.hasMixin(GNode.Container)) {
            var children = blob['$'];
            if (children.length > 0) {
                for (var i = 0; i < children.length; ++i) {
                    var child = GNode.restore(children[i]);
                    if (child) {
                        node.appendChild(child);
                    }
                }
            }
        }

        if (node.hasMixin(GNode.Properties)) {
            // Restore custom properties if any
            for (var property in blob) {
                if (blob.hasOwnProperty(property) && property.length > 1 && property.charAt(0) === '@') {
                    node[property] = blob[property];
                }
            }
        }

        if (node.hasMixin(GNode.Reference) && blob.hasOwnProperty('#')) {
            // Restore referenceId
            node._referenceId = blob['#'];
        }

        node._notifyChange(GNode._Change.Restore, blob);
    };

    /**
     * Serialize a given node or an array of nodes into a string
     * @param {GNode|Array<GNode>} node the node to serialize
     * or an array of nodes to serialize
     * @param {Boolean} [beautify] whether to beautify, defaults to false
     * @param {String} serialized json code or null for failure
     */
    GNode.serialize = function (node, beautify) {
        if (node instanceof Array) {
            var blobs = [];

            for (var i = 0; i < node.length; ++i) {
                var blob = GNode.store(node[i]);
                if (blob) {
                    blobs.push(blob);
                }
            }

            if (blobs.length > 0) {
                return JSON.stringify(blobs, null, beautify ? 4 : null);
            }
        } else {
            var blob = GNode.store(node);
            if (blob) {
                return JSON.stringify(blob, null, beautify ? 4 : null);
            }
        }

        return null;
    };

    /**
     * Deserialize a node or any array of nodes from a given json string
     * @param {String} source the json string source to deserialize from
     * @returns {GNode|Array<GNode>} the deserialized node
     * or array of nodes or null for failure
     */
    GNode.deserialize = function (source) {
        if (source) {
            var blob = JSON.parse(source);

            if (blob && blob instanceof Array) {
                var nodes = [];

                for (var i = 0; i < blob.length; ++i) {
                    var node = GNode.restore(blob[i]);
                    if (node) {
                        nodes.push(node);
                    }
                }

                return nodes && nodes.length > 0 ? nodes : null;
            } else {
                return GNode.restore(blob);
            }
        }

        return null;
    };

    /**
     * Returns a new array with an ordered direction
     * of a given set of nodes depending on their
     * position in the tree
     * @param {Array<GNode>} nodes an array of nodes to be ordered
     * @param {Boolean} [reverse] if true, orders the way that
     * parent comes first, last child comes first, otherwise
     * orders that parent comes first, first child comes first,
     * defaults to false
     * @return {Array<GNode>} A new, ordered array
     */
    GNode.order = function (nodes, reverse) {
        var nodesAr = nodes ? nodes.slice() : null;
        if (nodes && nodes.length > 1) {
            // As we don't have element's indexes inside the tree or any values to compare the nodes between each other,
            // anyway we will end up with the O(nodes.length * tree.numNodes) sort
            var topParent = null;
            for (var parent = nodes[0]; parent !== null; parent = parent.getParent()) {
                topParent = parent;
            }

            if (topParent !== null) {
                var orderedAr = [];
                topParent.accept(function (node) {
                    if (!nodesAr.length) {
                        return false;
                    }
                    var idx = 0;
                    var found = false;
                    for (var i = 0; i < nodesAr.length && !found; ++i) {
                        if (nodesAr[i] === node) {
                            orderedAr.push(node);
                            idx = i;
                            found = true;
                        }
                    }
                    if (found) {
                        nodesAr.splice(idx, 1);
                    }
                    return true;
                }, reverse);
                return orderedAr;
            }
        }
        return nodesAr;
    };

    /**
     * Map of node-class type-ids to their names
     * @type {Object}
     * @private
     */
    GNode._nodeClassToNameMap = {};

    /**
     * Map of names to their node-classes
     * @type {Object}
     * @private
     */
    GNode._nameToNodeClassMap = {};

    /**
     * Register a name for a node class
     * @param {String} name the unique name to register for the node class
     * @param {Function} clazz the node class to be registered
     * @private
     */
    GNode._registerNodeClass = function (name, clazz) {
        GNode._nodeClassToNameMap[GObject.getTypeId(clazz)] = name;
        GNode._nameToNodeClassMap[name] = clazz;
    };

    /**
     * Known flags for a node
     * @version 1.0
     */
    GNode.Flag = {
        /**
         * Flag marking a node to be selected
         * @type {Number}
         * @version 1.0
         */
        Selected: 1 << 1,

        /**
         * Flag marking a node to be highlighted
         * @type {Number}
         * @version 1.0
         */
        Highlighted: 1 << 2,

        /**
         * Flag marking a node to be active
         * @type {Number}
         * @version 1.0
         */
        Active: 1 << 3,

        /**
         * Flag marking a node to be expanded
         * @type {Number}
         * @version 1.0
         */
        Expanded: 1 << 4
    };

    /**
     * @enum
     * @private
     */
    GNode._Change = {
        /**
         * A child is about to be inserted.
         * args = child that will be inserted
         * @type {Number}
         */
        BeforeChildInsert: 1,

        /**
         * A child has been inserted.
         * args = child that was inserted
         * @type {Number}
         */
        AfterChildInsert: 2,

        /**
         * A child is about to be removed
         * args = child that will be removed
         * @type {Number}
         */
        BeforeChildRemove: 10,

        /**
         * A child has been removed
         * args = child that was removed
         * @type {Number}
         */
        AfterChildRemove: 11,

        /**
         * The properties of a node are about to be changed
         * args = {
         *   {Array<String>} properties - the names of the properties that will be changed
         *   {Array<Object>} values - the new values for the properties that'll be assigned
         * }
         * @type {Number}
         */
        BeforePropertiesChange: 20,

        /**
         * The properties of a node have been changed
         * args = {
         *   {Array<String>} properties - the names of the properties that were changed
         *   {Array<Object>} values - the old values the properties had have before assignment
         * }
         * @type {Number}
         */
        AfterPropertiesChange: 21,

        /**
         * A flag of a node is about to be changed
         * args = {
         *   {Number} flag - the flag that is about to be changed
         *   {Boolean} set - whether it will be set (true) or cleared/removed (false)
         * }
         * @type {Number}
         */
        BeforeFlagChange: 30,

        /**
         * A flag of a node has been changed
         * args = {
         *   {Number} flag - the flag that was changed
         *   {Boolean} set - whether it will was set (true) or cleared/removed (false)
         * }
         * @type {Number}
         */
        AfterFlagChange: 31,

        /**
         * Called when the node got attached to a parent
         * @type {Number}
         */
        ParentAttached: 40,

        /**
         * Called before the node gets detached from it's parent
         * args = none
         * @type {Number}
         */
        ParentDetach: 41,

        /**
         * Called before storing a node into a given blob.
         * args = the blob to store into
         * @type {Number}
         */
        PrepareStore: 50,

        /**
         * Called to store a node into a given blob.
         * The caller will already take care about storing any children.
         * args = the blob to store into
         * @type {Number}
         */
        Store: 51,

        /**
         * Called before restoring a node from a given blob.
         * args = the blob to restore from
         * @type {Number}
         */
        PrepareRestore: 52,

        /**
         * Called to restore a node from a given blob.
         * The caller will already take care about restoring any children.
         * args = the blob to restore from
         * @type {Number}
         */
        Restore: 53,

        /**
         * Called when the node got attached to a workspace
         * @type {Number}
         */
        WorkspaceAttached: 60,

        /**
         * Called before the node gets detached from it's workspace
         * args = none
         * @type {Number}
         */
        WorkspaceDetach: 61
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GNode.BeforeInsertEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a future node insertion
     * @param {GNode} node the node that will be inserted
     * @class GNode.BeforeInsertEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GNode.BeforeInsertEvent = function (node) {
        this.node = node;
    };
    GObject.inherit(GNode.BeforeInsertEvent, GEvent);

    /**
     * The node that has will be inserted
     * @type GNode
     * @version 1.0
     */
    GNode.BeforeInsertEvent.prototype.node = null;

    /** @override */
    GNode.BeforeInsertEvent.prototype.toString = function () {
        return "[Event GNode.BeforeInsertEvent]";
    };


    // -----------------------------------------------------------------------------------------------------------------
    // GNode.AfterInsertEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for node insertion
     * @param {GNode} node the node that was inserted
     * @class GNode.AfterInsertEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GNode.AfterInsertEvent = function (node) {
        this.node = node;
    };
    GObject.inherit(GNode.AfterInsertEvent, GEvent);

    /**
     * The node that was inserted
     * @type GNode
     * @version 1.0
     */
    GNode.AfterInsertEvent.prototype.node = null;

    /** @override */
    GNode.AfterInsertEvent.prototype.toString = function () {
        return "[Event GNode.AfterInsertEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GNode.BeforeRemoveEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a future node removal
     * @param {GNode} node the node that will be removed
     * @class GNode.BeforeRemoveEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GNode.BeforeRemoveEvent = function (node) {
        this.node = node;
    };
    GObject.inherit(GNode.BeforeRemoveEvent, GEvent);

    /**
     * The node that will be removed
     * @type GNode
     * @version 1.0
     */
    GNode.BeforeRemoveEvent.prototype.node = null;

    /** @override */
    GNode.BeforeRemoveEvent.prototype.toString = function () {
        return "[Event GNode.BeforeRemoveEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GNode.AfterRemoveEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a node removal
     * @param {GNode} node the node that was removed
     * @class GNode.AfterRemoveEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GNode.AfterRemoveEvent = function (node) {
        this.node = node;
    };
    GObject.inherit(GNode.AfterRemoveEvent, GEvent);

    /**
     * The node that was removed
     * @type GNode
     * @version 1.0
     */
    GNode.AfterRemoveEvent.prototype.node = null;

    /** @override */
    GNode.AfterRemoveEvent.prototype.toString = function () {
        return "[Event GNode.AfterRemoveEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GNode.BeforePropertiesChangeEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a node properties change before the properties will be changed
     * @param {GNode} node the node which' properties are affected by the change
     * @param {Array<String>} properties the names of the properties affected by the change
     * @param {Array<*>} values the values that will be assigned
     * @class GNode.BeforePropertiesChangeEvent
     * @extends GEvent
     * @constructor
     */
    GNode.BeforePropertiesChangeEvent = function (node, properties, values) {
        this.node = node;
        this.properties = properties;
        this.values = values;
    };

    GObject.inherit(GNode.BeforePropertiesChangeEvent, GEvent);

    /**
     * The node which' property is affected by the change
     * @type GNode
     */
    GNode.BeforePropertiesChangeEvent.prototype.node = null;
    /**
     * The names of the properties affected by the change
     * @type Array<String>
     */
    GNode.BeforePropertiesChangeEvent.prototype.properties = null;

    /**
     * The values that will be assigned
     * @type Array<*>
     */
    GNode.BeforePropertiesChangeEvent.prototype.values = null;

    /** @override */
    GNode.BeforePropertiesChangeEvent.prototype.toString = function () {
        return "[Event GNode.BeforePropertiesChangeEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GNode.AfterPropertiesChangeEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a node properties change after the property has changed
     * @param {GNode} node the node which' properties are affected by the change
     * @param {Array<String>} properties the names of the properties affected by the change
     * @param {Array<*>} values the values that the properties previously had have
     * @class GNode.AfterPropertiesChangeEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GNode.AfterPropertiesChangeEvent = function (node, properties, values) {
        this.node = node;
        this.properties = properties;
        this.values = values;
    };

    GObject.inherit(GNode.AfterPropertiesChangeEvent, GEvent);

    /**
     * The node which' property is affected by the change
     * @type GNode
     */
    GNode.AfterPropertiesChangeEvent.prototype.node = null;
    /**
     * The names of the properties affected by the change
     * @type Array<String>
     */
    GNode.AfterPropertiesChangeEvent.prototype.properties = null;

    /**
     * The values that the properties previously had have
     * @type Array<*>
     */
    GNode.AfterPropertiesChangeEvent.prototype.values = null;

    /** @override */
    GNode.AfterPropertiesChangeEvent.prototype.toString = function () {
        return "[Event GNode.AfterPropertiesChangeEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GNode.BeforeFlagChangeEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a node flag change before the flag will be changed
     * @param {GNode} node the node which' flag is affected by the change
     * @param {Number} flag the flag affected by the change
     * @param {Boolean} set whether the flag will be set (true) or cleared/removed (false)
     * @class GNode.BeforeFlagChangeEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GNode.BeforeFlagChangeEvent = function (node, flag, set) {
        this.node = node;
        this.flag = flag;
        this.set = set;
    };

    GObject.inherit(GNode.BeforeFlagChangeEvent, GEvent);

    /**
     * The node which' flag is affected by the change
     * @type GNode
     * @version 1.0
     */
    GNode.BeforeFlagChangeEvent.prototype.node = null;
    /**
     * The flag affected by the change
     * @type Number
     * @version 1.0
     */
    GNode.BeforeFlagChangeEvent.prototype.flag = null;

    /**
     * Whether the flag will be set (true) or cleared/removed (false)
     * @type Boolean
     * @version 1.0
     */
    GNode.BeforeFlagChangeEvent.prototype.set = null;

    /** @override */
    GNode.BeforeFlagChangeEvent.prototype.toString = function () {
        return "[Event GNode.BeforeFlagChangeEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GNode.AfterFlagChangeEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a node flag change after the flag was changed
     * @param {GNode} node the node which' flag was affected by the change
     * @param {Number} flag the flag affected by the change
     * @param {Boolean} set whether the flag will was set (true) or cleared/removed (false)
     * @class GNode.AfterFlagChangeEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GNode.AfterFlagChangeEvent = function (node, flag, set) {
        this.node = node;
        this.flag = flag;
        this.set = set;
    };

    GObject.inherit(GNode.AfterFlagChangeEvent, GEvent);

    /**
     * The node which' flag was affected by the change
     * @type GNode
     * @version 1.0
     */
    GNode.AfterFlagChangeEvent.prototype.node = null;
    /**
     * The flag affected by the change
     * @type Number
     * @version 1.0
     */
    GNode.AfterFlagChangeEvent.prototype.flag = null;

    /**
     * Whether the flag was set (true) or cleared/removed (false)
     * @type Boolean
     * @version 1.0
     */
    GNode.AfterFlagChangeEvent.prototype.set = null;

    /** @override */
    GNode.AfterFlagChangeEvent.prototype.toString = function () {
        return "[Event GNode.AfterFlagChangeEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GNode.Properties Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin to make a node become a container for properties
     * @class GNode.Properties
     * @mixin
     * @constructor
     * @version 1.0
     */
    GNode.Properties = function () {
    };

    /**
     * Returns whether a given set of properties equals the same property values in another node
     * @param {GNode} other the other node to compare to
     * @param {Array<String>} properties the property names
     * @param {Boolean} [custom] whether properties are custom one or not, defaults to false
     * @return {*} the property or null if it is not set
     */
    GNode.Properties.prototype.arePropertiesEqual = function (other, properties, custom) {
        for (var i = 0; i < properties.length; ++i) {
            var property = properties[i];
            var myHasProp = this.hasProperty(property, custom);
            var otHasProp = other.hasProperty(property, custom);

            if (myHasProp) {
                if (!otHasProp) {
                    return false;
                } else if (!GUtil.equals(this.getProperty(property, custom), other.getProperty(property, custom))) {
                    return false;
                }
            } else {
                if (otHasProp) {
                    return false;
                }
            }
        }
        return true;
    };

    /**
     * Checks whether a given property is set on this node or not
     * @param {String} property the name of the property
     * @param {Boolean} [custom] whether property is a custom one or not, defaults to false
     * @return {Boolean} true if property is set, false if not
     */
    GNode.Properties.prototype.hasProperty = function (property, custom) {
        var propName = (custom ? '@' : '$') + property;
        return this.hasOwnProperty(propName);
    };

    /**
     * Returns a given property if it is set
     * @param {String} property the name of the property
     * @param {Boolean} [custom] whether property is a custom one or not, defaults to false
     * @param {*} [def] a default value to be returned if property is not set, defaults to null
     * @return {*} the property or null if it is not set
     */
    GNode.Properties.prototype.getProperty = function (property, custom, def) {
        var propName = (custom ? '@' : '$') + property;
        return this.hasOwnProperty(propName) ? this[propName] : def;
    };

    /**
     * Returns multiple properties in the given order. If there's no such
     * property set, the result will contain null values for those properties
     * @param {Array<String>} properties the property names
     * @param {Boolean} [custom] whether properties are a custom ones or not, defaults to false
     * @param {Array<*>} [def] default values for properties not found, defaults to null
     * @return {Array<*>} the property values in the order of the property names
     */
    GNode.Properties.prototype.getProperties = function (properties, custom, def) {
        var result = [];

        for (var i = 0; i < properties.length; ++i) {
            var defVal = def && def.length > i ? def[i] : null;
            result.push(this.getProperty(properties[i], custom, defVal));
        }

        return result;
    };

    /**
     * This is the same as calling setProperties([property], [value])
     * @param {String} property the name of the property
     * @param {*} value the new value of the property
     * @param {Boolean} [custom] whether property is a custom one or not, defaults to false
     * Defaults to false.
     * @param {Boolean} [force] if set, the property will always be set even if
     * it's value hasn't been changed. Defaults to false.
     * @see setProperties
     */
    GNode.Properties.prototype.setProperty = function (property, value, custom, force) {
        return this.setProperties([property], [value], custom, force);
    };

    /**
     * Assigns one or more properties a new values
     * @param {Array<String>} properties the property names in the same order as values
     * @param {Array<*>} values the new values in the same order as property names
     * @param {Boolean} [custom] whether properties are a custom ones or not, defaults to false
     * Defaults to false.
     * @param {Boolean} [force] if set, the properties will always be set even if
     * it's value hasn't been changed. Defaults to false.
     * @return {Boolean} true if at least one property has been modified, false if not (i.e. because
     * the property was already set to the specified value)
     */
    GNode.Properties.prototype.setProperties = function (properties, values, custom, force) {
        if (properties.length !== values.length) {
            throw new Error('Properties length does not match values length');
        }

        // First we'll iterate and collect all properties requiring a modification
        var propertiesToModify = [];
        var valuesToModify = [];
        for (var i = 0; i < properties.length; ++i) {
            var value = values[i];
            var propName = (custom ? '@' : '$') + properties[i];
            var oldValue = this[propName];

            if (force || !GUtil.equals(value, oldValue, false)) {
                propertiesToModify.push(properties[i]);
                valuesToModify.push(values[i])
            }
        }

        // Return early if there're no properties to modify
        if (propertiesToModify.length === 0) {
            return false;
        }

        // Notify before change
        this._notifyChange(GNode._Change.BeforePropertiesChange, {
            properties: propertiesToModify,
            values: valuesToModify
        });

        // Assign new property values now
        var previousValues = [];
        for (var i = 0; i < propertiesToModify.length; ++i) {
            var propName = (custom ? '@' : '$') + propertiesToModify[i];
            previousValues.push(this[propName]);
            this[propName] = valuesToModify[i];
        }

        // Notify after change
        this._notifyChange(GNode._Change.AfterPropertiesChange, {
            properties: propertiesToModify,
            values: previousValues
        });

        return true;
    };

    /**
     * Store a given set of properties into a given blob
     * @param {*} blob the blob to save into
     * @param {*} properties a hashmap of properties to their default values to be stored
     * @param {Function} [filter] custom filter function (property,value} to return
     * the value to be serialized for a given property
     */
    GNode.Properties.prototype.storeProperties = function (blob, properties, filter) {
        filter = filter || function (property, value) {
            return value;
        }
        for (var property in properties) {
            var defaultValue = properties[property];
            var value = this['$' + property];
            if (!GUtil.equals(value, defaultValue, true)) {
                var myValue = filter(property, value);
                blob[property] = myValue;
            }
        }
    };

    /**
     * Restore a given set of properties from a given blob. If the blob
     * doesn't contain a given property, the default value will be used instead.
     * @param {*} blob the blob to restore from
     * @param {*} properties a hashmap of properties to their default values to be restored
     * @param {Function} [filter] custom filter function (property,value} to return
     * the value to be deserialized for a given property
     */
    GNode.Properties.prototype.restoreProperties = function (blob, properties, filter) {
        filter = filter || function (property, value) {
            return value;
        }

        var propertiesToSet = [];
        var valuesToSet = [];

        for (var property in properties) {
            propertiesToSet.push(property);

            if (blob.hasOwnProperty(property)) {
                valuesToSet.push(filter(property, blob[property]));
            } else {
                valuesToSet.push(properties[property]);
            }
        }

        this.setProperties(propertiesToSet, valuesToSet, false);
    };

    /**
     * Transfers a given set of properties from a given source node. If the source
     * doesn't contain a given property, the default value will be used instead.
     * @param {GNode} node a properties node to transfer from
     * @param {Array<*>} properties array of hashmaps of properties to their default values to be transfered
     * Defaults to false.
     */
    GNode.Properties.prototype.transferProperties = function (source, properties) {
        var propertiesToSet = [];
        var valuesToSet = [];

        for (var i = 0; i < properties.length; ++i) {
            for (var property in properties[i]) {
                propertiesToSet.push(property);

                if (source.hasProperty(property)) {
                    valuesToSet.push(source.getProperty(property));
                } else {
                    valuesToSet.push(properties[i][property]);
                }
            }
        }

        this.setProperties(propertiesToSet, valuesToSet, false);
    };

    /**
     * Assign default properties on this node.
     * Provide a varArg with hashmaps of property-name to default value mappings.
     */
    GNode.Properties.prototype._setDefaultProperties = function () {
        for (var i = 0; i < arguments.length; ++i) {
            var properties = arguments[i];
            for (var property in properties) {
                this['$' + property] = properties[property];
            }
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GNode.Identity Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin to make a node become identifiable (id)
     * @class GNode.Identity
     * @mixin
     * @constructor
     * @version 1.0
     */
    GNode.Identity = function () {
    };

    /**
     * Returns the id of the node
     * @return {String}
     * @version 1.0
     */
    GNode.Identity.prototype.getId = function () {
        throw new Error("Not Supported.");
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GNode.Tag Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin to make a node become tagable
     * @class GNode.Tag
     * @mixin
     * @constructor
     * @version 1.0
     */
    GNode.Tag = function () {
    };

    /**
     * Returns the tags of the node
     * @return {String}
     * @version 1.0
     */
    GNode.Tag.prototype.getTags = function () {
        throw new Error("Not Supported.");
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GNode.Reference Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin to make a node become referenceable
     * @class GNode.Reference
     * @mixin
     * @constructor
     */
    GNode.Reference = function () {
    };

    GNode.Reference.prototype._referenceId = null;

    /**
     * Returns the reference id of this node used for linking
     * @return {String}
     */
    GNode.Reference.prototype.getReferenceId = function () {
        if (!this._referenceId) {
            this._referenceId = GUtil.uuid();
        }
        return this._referenceId;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GNode.Container Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin to make a node become a container for children
     * @class GNode.Container
     * @mixin
     * @constructor
     * @version 1.0
     */
    GNode.Container = function () {
    };

    /**
     * @type GNode
     * @private
     */
    GNode.Container.prototype._firstChild = null;

    /**
     * @type GNode
     * @private
     */
    GNode.Container.prototype._lastChild = null;

    /**
     * Returns an array of all children within this node
     * @return {Array<GNode>} array of all children of this node or
     * an empty array if there're no children
     */
    GNode.Container.prototype.getChildren = function () {
        var result = [];
        for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
            result.push(child);
        }
        return result;
    };

    /**
     * Access the first child of this node if any
     * @return {GNode} the first child of this node or null for none
     */
    GNode.Container.prototype.getFirstChild = function () {
        return this._firstChild;
    };

    /**
     * Access the last child of this node if any
     * @return {GNode} the last child of this node or null for none
     */
    GNode.Container.prototype.getLastChild = function () {
        return this._lastChild;
    };

    /**
     * Append a new node as child to this node
     * @param {GNode} child the child to append to this one
     */
    GNode.Container.prototype.appendChild = function (child) {
        this.insertChild(child, null);
    };

    /**
     * Insert a new child at a certain position
     * @param {GNode} child the child to append to into this one
     * @param {GNode} reference reference to insert before, can be null to append
     */
    GNode.Container.prototype.insertChild = function (child, reference) {
        if (child._parent != null) {
            throw new Error("Child is already appended somewhere else");
        }
        if (reference != null && reference.getParent() != this) {
            throw new Error("Reference is not a child of this node");
        }
        if (!child.validateInsertion(this, reference)) {
            throw new Error("Child insertion validation failed.");
        }

        this._notifyChange(GNode._Change.BeforeChildInsert, child);

        // Link our new child now
        if (reference != null) {
            child._setNext(reference);
            child._setPrevious(reference._previous);
            reference._setPrevious(child);
            if (child._previous == null) {
                this._firstChild = child;
            } else {
                child._previous._setNext(child);
            }
        }
        else {
            if (this._lastChild != null) {
                child._setPrevious(this._lastChild);
                this._lastChild._setNext(child);
                this._lastChild = child;
            }
            child._setNext(null);
        }

        if (this._firstChild == null) {
            this._firstChild = child;
            child._setPrevious(null);
            child._setNext(null);
        }

        if (child._next == null) {
            this._lastChild = child;
        }

        child._setParent(this);

        this._notifyChange(GNode._Change.AfterChildInsert, child);
    };

    /**
     * Remove an existing child from this node
     * @param {GNode} child the child to remove from this one
     */
    GNode.Container.prototype.removeChild = function (child) {
        if (child._parent != this) {
            throw new Error("Child is not a child of this node");
        }
        if (!child.validateRemoval()) {
            throw new Error("Child removal validation failed.");
        }


        this._notifyChange(GNode._Change.BeforeChildRemove, child);

        if (this._firstChild == child) {
            this._firstChild = child._next;
        }
        if (this._lastChild == child) {
            this._lastChild = child._previous;
        }
        if (child._previous != null) {
            child._previous._setNext(child._next);
        }
        if (child._next != null) {
            child._next._setPrevious(child._previous);
        }

        child._setParent(null);
        child._setPrevious(null);
        child._setNext(null);

        if (this._workspace) {
            if (child.hasMixin(GNode.Container)) {
                for (var n = child.getFirstChild(); !!n; n = n.getNext()) {
                    n._setWorkspace(null);
                }
            }
        }

        this._notifyChange(GNode._Change.AfterChildRemove, child);
    };

    /**
     * Remove all children of this node
     */
    GNode.Container.prototype.clearChildren = function () {
        while (this.getFirstChild()) {
            this.removeChild(this.getFirstChild());
        }
    };

    /**
     * Gets the index of a child node
     * @param {GNode} child the child to get an index for
     * @return {Number} the child index or a value less than zero
     * if child is not a child of this node
     */
    GNode.Container.prototype.getIndexOfChild = function (child) {
        if (child._parent === this) {
            var index = 0;
            for (var node = this.getFirstChild(); node !== null; node = node.getNext()) {
                if (node === child) {
                    return index;
                }
                index++;
            }
        }

        return -1;
    };

    /**
     * Gets a child of this node by a given index
     * @param {Number} childIndex the index to get a child for
     * @return {GNode} the child of this node at given index or
     * null if no child was found at the given index
     */
    GNode.Container.prototype.getChildByIndex = function (childIndex) {
        var index = 0;
        for (var node = this.getFirstChild(); node !== null; node = node.getNext()) {
            if (index === childIndex) {
                return node;
            }
            index++;
        }

        return null;
    };

    /**
     * Accept a visitor on this container's children
     * @param {Function} visitor
     * @param {Boolean} reverse - walk through children in reverse order
     * @return {Boolean}
     * @version 1.0
     */
    GNode.Container.prototype.acceptChildren = function (visitor, reverse) {
        if (reverse) {
            for (var child = this.getLastChild(); child != null; child = child.getPrevious()) {
                if (child.accept(visitor, reverse) === false) {
                    return false;
                }
            }
        } else {
            for (var child = this.getFirstChild(); child != null; child = child.getNext()) {
                if (child.accept(visitor, reverse) === false) {
                    return false;
                }
            }
        }
        return true;
    };

    /**
     * Accept a visitor on this container's children
     * @param {Function} visitor
     * @param {Boolean} reverse - walk through children in reverse order
     * @return {Boolean}
     * @version 1.0
     */
    GNode.Container.prototype.acceptChildrenAny = function (visitor, reverse) {
        var res = false;
        if (reverse) {
            for (var child = this.getLastChild(); child != null; child = child.getPrevious()) {
                if (child.acceptAny(visitor, reverse) === true) {
                    res = true;
                }
            }
        } else {
            for (var child = this.getFirstChild(); child != null; child = child.getNext()) {
                if (child.acceptAny(visitor, reverse) === true) {
                    res = true;
                }
            }
        }
        return res;
    };

    /** @override */
    GNode.Container.prototype.toString = function () {
        return "[Mixin GNode.Container]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GNode.Store Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin to make a node become storable
     * @class GNode.Store
     * @mixin
     * @constructor
     * @version 1.0
     */
    GNode.Store = function () {
    };

    /**
     * Called to clone this node and return a new instance out of it
     * @returns {GNode}
     */
    GNode.Store.prototype.clone = function () {
        // Serialize and deserialize ourself
        var serialized = GNode.serialize(this);
        if (serialized) {
            var result = GNode.deserialize(serialized);

            // Make sure to reset referenceid on referenceables
            if (result.hasMixin(GNode.Reference)) {
                result._referenceId = null;
            }

            return result;
        }
        return null;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GNode
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type GWorkspace
     * @private
     */
    GNode.prototype._workspace = null;

    /**
     * @type GNode
     * @private
     */
    GNode.prototype._parent = null;

    /**
     * @type GNode
     * @private
     */
    GNode.prototype._previous = null;

    /**
     * @type GNode
     * @private
     */
    GNode.prototype._next = null;

    /**
     * @type Number
     * @private
     */
    GNode.prototype._flags = 0;

    /**
     * Returns the name of the node type
     * @return {String}
     * @version 1.0
     */
    GNode.prototype.getNodeName = function () {
        return GNode.getName(this);
    };

    /**
     * Returns the (translated), human-readable name of the node type
     * @return {String}
     * @version 1.0
     */
    GNode.prototype.getNodeNameTranslated = function () {
        return ifLocale.getValue(this, "name", this.getNodeName());
    };

    /**
     * Access the workspace of this node
     * @return {GGworkspace}
     * @version 1.0
     */
    GNode.prototype.getWorkspace = function () {
        return this._workspace;
    };

    /**
     * Access the parent of this node if any
     * @return {GNode} the parent of this node or null for none
     * @version 1.0
     */
    GNode.prototype.getParent = function () {
        return this._parent;
    };

    /**
     * Access the previous sibling of this node if any
     * @return {GNode} the previous sibling of this node or null for none
     */
    GNode.prototype.getPrevious = function () {
        return this._previous;
    };

    /**
     * Access the next sibling of this node if any
     * @return {GNode} the next sibling of this node or null for none
     */
    GNode.prototype.getNext = function () {
        return this._next;
    };

    /**
     * Return all nodes within this one (if any) recursively
     * with a given name or all for pseudo-selector '*'
     * @param {String} nodeName either null or '*' for all or
     * a specific nodeName to look for
     * @return {Array<GNode>} an array of found nodes or empty
     * array for no match
     * @version 1.0
     */
    GNode.prototype.getNodesByName = function (nodeName, ignoreSelf) {
        var result = [];
        this.accept(function (node) {
            if (!nodeName || nodeName == '*' || nodeName === node.getNodeName()) {
                if (node !== this) {
                    result.push(node);
                }
            }
        }.bind(this));
        return result;
    };

    /**
     * Query for all nodes within this one and return their sum
     * @param {String} selector a CSS3-compatible selector
     * @returns {Number} the count, zero for none
     */
    GNode.prototype.queryCount = function (selector) {
        var result = GSelector.queryAll(selector, this);
        return result ? result.length : 0;
    };

    /**
     * Query for all nodes within this one
     * @param {String} selector a CSS3-compatible selector
     * @returns {Array<GNode>} all matched nodes or empty array for none
     * @version 1.0
     */
    GNode.prototype.queryAll = function (selector) {
        return GSelector.queryAll(selector, this);
    };

    /**
     * Query for a single node within this one
     * @param {String} selector a CSS3-compatible selector
     * @returns {GNode} a matched node or null for no match
     * @version 1.0
     */
    GNode.prototype.querySingle = function (selector) {
        var result = GSelector.querySingle(selector, this);
        return result ? result : null;
    };

    /**
     * Tests whether this node matches a certain selector. Matching
     * is done by querying the actual structure (expensive) and comparing
     * the result wether this node is part of it
     * @param {String} selector a CSS3-compatible selector
     * @returns {Boolean} true if this node matches the given selector, false if not
     * @see filtered
     */
    GNode.prototype.matches = function (selector) {
        return GSelector.match(selector, this);
    };

    /**
     * Tests whether this node is filtered by a given selector.
     * In the opposite to the matches function, this will not actually
     * query the structure but simply iterate each selector part and
     * try to match it onto this node.
     * @param {String} selector a CSS3-compatible selector
     * @returns {Boolean} true if this node matches the given selector, false if not
     * @see matches
     */
    GNode.prototype.filtered = function (selector) {
        return GSelector.filter(selector, [this]).length === 1;
    };

    /**
     * Accept a visitor
     * @param {Function} visitor a visitor function called for each visit retrieving the current
     * node as first parameter. The function may return a boolean value indicating whether to
     * return visiting (true) or whether to cancel visiting (false). Not returning anything or
     * returning anything else than a Boolean will be ignored.
     * @param {Boolean} reverse - walk through children in reverse order
     * @return {Boolean} result of visiting (false = canceled, true = went through)
     */
    GNode.prototype.accept = function (visitor, reverse) {
        if (visitor.call(null, this) === false) {
            return false;
        }

        if (this.hasMixin(GNode.Container)) {
            return this.acceptChildren(visitor, reverse);
        }

        return true;
    };

    /**
     * Accept a visitor
     * @param {Function} visitor a visitor function called for each visit retrieving the current
     * node as first parameter. The function may return a boolean value indicating whether to
     * return visiting (true) or whether to cancel visiting (false). Not returning anything or
     * returning anything else than a Boolean will be ignored.
     * @param {Boolean} reverse - walk through children in reverse order
     * @return {Boolean} result of visiting (false = canceled, true = went through)
     */
    GNode.prototype.acceptAny = function (visitor, reverse) {
        if (visitor.call(null, this) === false) {
            return false;
        }

        if (this.hasMixin(GNode.Container)) {
            return this.acceptChildrenAny(visitor, reverse);
        }

        return true;
    };

    /**
     * Checks whether this node has a certain flag setup
     * @param {Number} flag
     * @returns {Boolean}
     * @version 1.0
     */
    GNode.prototype.hasFlag = function (flag) {
        return (this._flags & flag) != 0;
    };

    /**
     * Set a flag on this node
     * @param {Number} flag the flag to set
     * @version 1.0
     */
    GNode.prototype.setFlag = function (flag) {
        // Ensure the flag may be modified
        if (this._canModifyFlag(flag, true)) {
            if ((this._flags & flag) == 0) {
                this._notifyChange(GNode._Change.BeforeFlagChange, {flag: flag, set: true});

                this._flags = this._flags | flag;

                this._notifyChange(GNode._Change.AfterFlagChange, {flag: flag, set: true});
            }
        }
    };

    /**
     * Remove a flag from this node
     * @param {Number} flag the flag to remove
     * @version 1.0
     */
    GNode.prototype.removeFlag = function (flag) {
        // Ensure the flag may be modified
        if (this._canModifyFlag(flag, false)) {
            if ((this._flags & flag) != 0) {
                this._notifyChange(GNode._Change.BeforeFlagChange, {flag: flag, set: false});

                this._flags = this._flags & ~flag;

                this._notifyChange(GNode._Change.AfterFlagChange, {flag: flag, set: false});
            }
        }
    };

    /**
     * Called to assign this node from another one to make
     * it equal. This is i.e. called when a node's type has
     * been changed.
     * @param {GNode} other
     */
    GNode.prototype.assignFrom = function (other) {
        if (this.hasMixin(GNode.Reference) && other.hasMixin(GNode.Reference)) {
            this._referenceId = other._referenceId;
        }
    };

    /**
     * Validates whether this node could be inserted into a given parent
     * @param {GNode} parent the parent to validate against
     * @param {GNode} reference optional reference to insert be for,
     * defaults to null meaning to append at the end
     * @return {Boolean} true if node could be inserted, false if not
     */
    GNode.prototype.validateInsertion = function (parent, reference) {
        // return false by default
        return false;
    };

    /**
     * Validates whether this node can be removed from it's parent.
     * If this node is not attached to a parent, this will always
     * return false
     * @return {Boolean} true if node could be removed, false if not
     */
    GNode.prototype.validateRemoval = function () {
        // return true by default
        return true;
    };

    /**
     * Called to check if a flag can be set/cleared
     * @param {Number} flag the flag that should be set or cleared
     * @param {Boolean} set true if flag should be set, false if should be cleared
     * @return {Boolean} true if flag can be set/cleared, false if not
     * @private
     */
    GNode.prototype._canModifyFlag = function (flag, set) {
        // by default, we allow everything
        return true;
    };

    /**
     * Block one or more changes
     * @param {Array<Number>} changes the array of changes to be blocked
     * @private
     */
    GNode.prototype._beginBlockChanges = function (changes) {
        if (!(this._blockedChanges)) {
            this._blockedChanges = {};
            this._blockedChanges._counter = 0;
        }

        for (var i = 0; i < changes.length; ++i) {
            var change = changes[i];
            if (change in this._blockedChanges) {
                this._blockedChanges[change]++;
            } else {
                this._blockedChanges[change] = 1;
            }
            this._blockedChanges._counter++;
        }
    };

    /**
     * Finish blocking one or more changes
     * @param {Array<Number>} changes the array of changes to be unblocked
     * @private
     */
    GNode.prototype._endBlockChanges = function (changes) {
        if (this._blockedChanges) {
            for (var i = 0; i < changes.length; ++i) {
                var change = changes[i];
                if (change in this._blockedChanges) {
                    if (--this._blockedChanges[change] == 0) {
                        if (--this._blockedChanges._counter == 0) {
                            delete this._blockedChanges;
                        }
                    }
                }
            }
        }
    };

    /**
     * Block one or more events
     * @param {Array<*>} eventClasses the array of event classes to be blocked
     * @private
     */
    GNode.prototype._beginBlockEvents = function (eventClasses) {
        if (!(this._blockedEvents)) {
            this._blockedEvents = {};
            this._blockedEvents._counter = 0;
        }

        for (var i = 0; i < eventClasses.length; ++i) {
            var event_id = GObject.getTypeId(eventClasses[i]);
            if (event_id in this._blockedEvents) {
                this._blockedEvents[event_id]++;
            } else {
                this._blockedEvents[event_id] = 1;
            }
            this._blockedEvents._counter++;
        }
    };

    /**
     * Finish blocking one or more events.
     * @param {Array<*>} eventClasses the array of event classes to be unblocked
     * @private
     */
    GNode.prototype._endBlockEvents = function (eventClasses) {
        if (this._blockedEvents) {
            for (var i = 0; i < eventClasses.length; ++i) {
                var event_id = GObject.getTypeId(eventClasses[i]);
                if (event_id in this._blockedEvents) {
                    if (--this._blockedEvents[event_id] == 0) {
                        if (--this._blockedEvents._counter == 0) {
                            delete this._blockedEvents;
                        }
                    }
                }
            }
        }
    };

    /**
     * Util function to return a composite array of events
     * @param {Boolean} structural structural events (insert, remove)
     * @param {Boolean} [properties] property events
     * @param {Boolean} [flags] flag events
     * @private
     */
    GNode.prototype._getCompositeEvents = function (structural, properties, flags) {
        var events = [];

        if (structural) {
            events = events.concat([
                GNode.BeforeInsertEvent,
                GNode.AfterInsertEvent,
                GNode.BeforeRemoveEvent,
                GNode.AfterRemoveEvent
            ]);
        }

        if (properties) {
            events = events.concat([
                GNode.BeforePropertiesChangeEvent,
                GNode.AfterPropertiesChangeEvent
            ]);
        }

        if (flags) {
            events = events.concat([
                GNode.BeforeFlagChangeEvent,
                GNode.AfterFlagChangeEvent
            ]);
        }

        return events;
    };

    /**
     * Util function to block a composite number of events
     * @param {Boolean} structural block structural events (insert, remove)
     * @param {Boolean} [properties] block property events
     * @param {Boolean} [flags] block flag events
     * @private
     */
    GNode.prototype._beginBlockCompositeEvents = function (structural, properties, flags) {
        this._beginBlockEvents(this._getCompositeEvents(structural, properties, flags));
    };

    /**
     * Util function to unblock a composite number of events
     * @param {Boolean} structural unblock structural events (insert, remove)
     * @param {Boolean} [properties] unblock property events
     * @param {Boolean} [flags] unblock flag events
     * @private
     */
    GNode.prototype._endBlockCompositeEvents = function (structural, properties, flags) {
        this._endBlockEvents(this._getCompositeEvents(structural, properties, flags));
    };

    /**
     * Notify about a change and handle it if not blocked
     * @param {Number} change the change we got notified
     * @param {Object} [args] the arguments for the change, it's value
     * depends on the current change and should be documented
     * within the change constant type
     * @return {Boolean} true if handled, false if blocked
     * @private
     */
    GNode.prototype._notifyChange = function (change, args) {
        if (!this._blockedChanges || !this._blockedChanges[change]) {
            this._handleChange(change, args);
            return true;
        }
        return false;
    };

    /**
     * Returns whether a given event can be send
     * @param eventClass
     * @returns {Boolean}
     * @private
     */
    GNode.prototype._canEventBeSend = function (eventClass) {
        var event_id = GObject.getTypeId(eventClass);
        return !this._blockedEvents || !this._blockedEvents[event_id];
    };

    /**
     * Sends an event by bubbling it up to each parent
     * @param {GEvent} event
     * @private
     */
    GNode.prototype._sendEvent = function (event) {
        for (var p = this; !!p; p = p.getParent()) {
            if (p instanceof GEventTarget ||  p.hasMixin(GEventTarget)) {
                if (p.hasEventListeners(event.constructor)) {
                    p.trigger(event);
                }
            }
        }
    };

    /**
     * @param {GWorkspace} workspace
     * @private
     */
    GNode.prototype._setWorkspace = function (workspace) {
        if (workspace !== this._workspace) {
            if (this._workspace) {
                this._notifyChange(GNode._Change.WorkspaceDetach);

                if (this.hasMixin(GNode.Reference)) {
                    this._workspace.removeReference(this);
                }

                this._workspace = null;
            }

            this._workspace = workspace;

            if (this._workspace) {
                if (this.hasMixin(GNode.Reference)) {
                    this._workspace.addReference(this);
                }

                this._notifyChange(GNode._Change.WorkspaceAttached);
            }
        }
    };

    /**
     * @param {GNode} parent
     * @private
     */
    GNode.prototype._attachToParent = function (parent) {
        if (parent._workspace) {
            this.accept(function (node) {
                node._setWorkspace(parent._workspace);
            });
        }
    };

    /**
     * @param {GNode} parent
     * @private
     */
    GNode.prototype._detachFromParent = function (parent) {
        if (parent._workspace) {
            this.accept(function (node) {
                node._setWorkspace(null);
            });
        }
    };

    /**
     * @param {GNode} parent
     * @private
     */
    GNode.prototype._setParent = function (parent) {
        if (this._parent !== parent) {
            if (this._parent) {
                this._notifyChange(GNode._Change.ParentDetach);
                this._detachFromParent(this._parent);
            }

            this._parent = parent;

            if (this._parent) {
                this._attachToParent(this._parent);
                this._notifyChange(GNode._Change.ParentAttached);
            }
        }
    };

    /**
     * @param {GNode} previous
     * @private
     */
    GNode.prototype._setPrevious = function (previous) {
        this._previous = previous;
    };

    /**
     * @param {GNode} next
     * @private
     */
    GNode.prototype._setNext = function (next) {
        this._next = next;
    };

    /**
     * Handle a change
     * @param {Number} change the change we got should handle
     * @param {Object} [args] the arguments for the change, it's value
     * depends on the current change and should be documented
     * within the change constant type
     * @private
     */
    GNode.prototype._handleChange = function (change, args) {
        if (change == GNode._Change.BeforeChildInsert) {
            /** @type {GNode} */
            var child = args;
            if (this._canEventBeSend(GNode.BeforeInsertEvent)) {
                this._sendEvent(new GNode.BeforeInsertEvent(child));
            }
        }
        else if (change == GNode._Change.AfterChildInsert) {
            /** @type {GNode} */
            var child = args;
            if (this._canEventBeSend(GNode.AfterInsertEvent)) {
                this._sendEvent(new GNode.AfterInsertEvent(child));
            }
        } else if (change == GNode._Change.BeforeChildRemove) {
            /** @type {GNode} */
            var child = args;
            if (this._canEventBeSend(GNode.BeforeRemoveEvent)) {
                this._sendEvent(new GNode.BeforeRemoveEvent(child));
            }
        }
        else if (change == GNode._Change.AfterChildRemove) {
            /** @type {GNode} */
            var child = args;
            if (this._canEventBeSend(GNode.AfterRemoveEvent)) {
                this._sendEvent(new GNode.AfterRemoveEvent(child));
            }
        } else if (change == GNode._Change.BeforePropertiesChange) {
            /** @type {{properties: Array<String>, values: Array<*>}} */
            var propertyArgs = args;
            if (this._canEventBeSend(GNode.BeforePropertiesChangeEvent)) {
                this._sendEvent(new GNode.BeforePropertiesChangeEvent(this, propertyArgs.properties, propertyArgs.values));
            }
        }
        else if (change == GNode._Change.AfterPropertiesChange) {
            /** @type {{properties: Array<String>, values: Array<*>}} */
            var propertyArgs = args;
            if (this._canEventBeSend(GNode.AfterPropertiesChangeEvent)) {
                this._sendEvent(new GNode.AfterPropertiesChangeEvent(this, propertyArgs.properties, propertyArgs.values));
            }
        } else if (change == GNode._Change.BeforeFlagChange) {
            /** @type {{flag: Number, set: Boolean}} */
            var flagArgs = args;
            if (this._canEventBeSend(GNode.BeforeFlagChangeEvent)) {
                this._sendEvent(new GNode.BeforeFlagChangeEvent(this, flagArgs.flag, flagArgs.set));
            }
        }
        else if (change == GNode._Change.AfterFlagChange) {
            /** @type {{flag: Number, set: Boolean}} */
            var flagArgs = args;
            if (this._canEventBeSend(GNode.AfterFlagChangeEvent)) {
                this._sendEvent(new GNode.AfterFlagChangeEvent(this, flagArgs.flag, flagArgs.set));
            }
        }
    };

    _.GNode = GNode;
})(this);