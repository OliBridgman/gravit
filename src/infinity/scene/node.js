(function (_) {
    /**
     * Base node representing a single item within a scene
     * @class GXNode
     * @extends GObject
     * @constructor
     * @version 1.0
     */
    function GXNode() {
    };

    GObject.inherit(GXNode, GObject);

    /**
     * Nodes's mime-type
     * @type {string}
     */
    GXNode.MIME_TYPE = "application/infinity+node";

    /**
     * GObject.inherit descendant for nodes
     * @param {String} name the unique name for the node
     * @see GObject.inherit
     */
    GXNode.inherit = function (name, target, base) {
        GObject.inherit(target, base);
        GXNode._registerNodeClass(name, target);
    };

    /**
     * GObject.inheritAndMix descendant for nodes
     * @param {String} name the unique name for the node
     * @see GObject.inheritAndMix
     */
    GXNode.inheritAndMix = function (name, target, base, mixins) {
        GObject.inheritAndMix(target, base, mixins);
        GXNode._registerNodeClass(name, target);
    };

    /**
     * Returns the name for a given node or node class
     * @param {Object|Function|Number} node
     */
    GXNode.getName = function (node) {
        return GXNode._nodeClassToNameMap[GObject.getTypeId(node)];
    };

    /**
     * Called to store a given node into a blob
     * @param {GXNode} node the node to be stored
     * @returns {*} the stored blob for the node or null on failure
     */
    GXNode.store = function (node) {
        if (node.hasMixin(GXNode.Store)) {
            var blob = {
                '@': GXNode._nodeClassToNameMap[GObject.getTypeId(node)]
            };

            if (node.store(blob)) {
                return blob;
            }
        }
        return null;
    };

    /**
     * Restore a node from a given blob
     * @param {*} blob the blob to restore from
     * @returns {GXNode} a node instance of the blob-type or
     * null for failure
     */
    GXNode.restore = function (blob) {
        if (!blob || !blob.hasOwnProperty('@')) {
            return null;
        }

        var nodeClass = GXNode._nameToNodeClassMap[blob['@']];
        if (!nodeClass) {
            return null;
        }

        // Create our node instance now and let it restore
        var node = new nodeClass();
        if (!node || !node.restore(blob)) {
            return null;
        }

        return node;
    };

    /**
     * Serialize a given node into a string
     * @param {GXNode} node the node to serialize
     * @param {Boolean} [beautify] whether to beautify, defaults to false
     * @param {String} serialized json code or null for failure
     */
    GXNode.serialize = function (node, beautify) {
        var blob = GXNode.store(node);
        if (blob) {
            return JSON.stringify(blob, null, beautify ? 4 : null);
        }
        return null;
    };

    /**
     * Deserialize a node from a given json string
     * @param {String} source the json string source to deserialize from
     * @returns {GXNode} the deserialized node or null for failure
     */
    GXNode.deserialize = function (source) {
        if (source) {
            var blob = JSON.parse(source);
            if (blob) {
                return GXNode.restore(blob);
            }
        }

        return null;
    };

    /**
     * Map of node-class type-ids to their names
     * @type {Object}
     * @private
     */
    GXNode._nodeClassToNameMap = {};

    /**
     * Map of names to their node-classes
     * @type {Object}
     * @private
     */
    GXNode._nameToNodeClassMap = {};

    /**
     * Register a name for a node class
     * @param {String} name the unique name to register for the node class
     * @param {Function} clazz the node class to be registered
     * @private
     */
    GXNode._registerNodeClass = function (name, clazz) {
        GXNode._nodeClassToNameMap[GObject.getTypeId(clazz)] = name;
        GXNode._nameToNodeClassMap[name] = clazz;
    };

    /**
     * Known flags for a node
     * @version 1.0
     */
    GXNode.Flag = {
        /**
         * Flag marking a node to be a shadow which means
         * that if not explicitely requesting, the user
         * won't see the node when iterating the model
         * @type {Number}
         * @version 1.0
         */
        Shadow: 1 << 0,

        /**
         * Flag marking a node to be selected
         * @type {Number}
         * @version 1.0
         */
        Selected: 1 << 10,

        /**
         * Flag marking a node to be highlighted
         * @type {Number}
         * @version 1.0
         */
        Highlighted: 1 << 11,

        /**
         * Flag marking a node to be active
         * @type {Number}
         * @version 1.0
         */
        Active: 1 << 12
    };

    /**
     * @enum
     * @private
     */
    GXNode._Change = {
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
        AfterFlagChange: 31
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXNode.BeforeInsertEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a future node insertion sent via a scene
     * @param {GXNode} node the node that will be inserted
     * @class GXNode.BeforeInsertEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GXNode.BeforeInsertEvent = function (node) {
        this.node = node;
    };
    GObject.inherit(GXNode.BeforeInsertEvent, GEvent);

    /**
     * The node that has will be inserted
     * @type GXNode
     * @version 1.0
     */
    GXNode.BeforeInsertEvent.prototype.node = null;

    /** @override */
    GXNode.BeforeInsertEvent.prototype.toString = function () {
        return "[Event GXNode.BeforeInsertEvent]";
    };


    // -----------------------------------------------------------------------------------------------------------------
    // GXNode.AfterInsertEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for node insertion sent via a scene
     * @param {GXNode} node the node that was inserted
     * @class GXNode.AfterInsertEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GXNode.AfterInsertEvent = function (node) {
        this.node = node;
    };
    GObject.inherit(GXNode.AfterInsertEvent, GEvent);

    /**
     * The node that was inserted
     * @type GXNode
     * @version 1.0
     */
    GXNode.AfterInsertEvent.prototype.node = null;

    /** @override */
    GXNode.AfterInsertEvent.prototype.toString = function () {
        return "[Event GXNode.AfterInsertEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXNode.BeforeRemoveEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a future node removal sent via a scene
     * @param {GXNode} node the node that will be removed
     * @class GXNode.BeforeRemoveEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GXNode.BeforeRemoveEvent = function (node) {
        this.node = node;
    };
    GObject.inherit(GXNode.BeforeRemoveEvent, GEvent);

    /**
     * The node that will be removed
     * @type GXNode
     * @version 1.0
     */
    GXNode.BeforeRemoveEvent.prototype.node = null;

    /** @override */
    GXNode.BeforeRemoveEvent.prototype.toString = function () {
        return "[Event GXNode.BeforeRemoveEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXNode.AfterRemoveEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a node removal sent via a scene
     * @param {GXNode} node the node that was removed
     * @class GXNode.AfterRemoveEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GXNode.AfterRemoveEvent = function (node) {
        this.node = node;
    };
    GObject.inherit(GXNode.AfterRemoveEvent, GEvent);

    /**
     * The node that was removed
     * @type GXNode
     * @version 1.0
     */
    GXNode.AfterRemoveEvent.prototype.node = null;

    /** @override */
    GXNode.AfterRemoveEvent.prototype.toString = function () {
        return "[Event GXNode.AfterRemoveEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXNode.BeforePropertiesChangeEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a node properties change sent via a scene before the properties will be changed
     * @param {GXNode} node the node which' properties are affected by the change
     * @param {Array<String>} properties the names of the properties affected by the change
     * @param {Array<*>} values the values that will be assigned
     * @class GXNode.BeforePropertiesChangeEvent
     * @extends GEvent
     * @constructor
     */
    GXNode.BeforePropertiesChangeEvent = function (node, properties, values) {
        this.node = node;
        this.properties = properties;
        this.values = values;
    };

    GObject.inherit(GXNode.BeforePropertiesChangeEvent, GEvent);

    /**
     * The node which' property is affected by the change
     * @type GXNode
     */
    GXNode.BeforePropertiesChangeEvent.prototype.node = null;
    /**
     * The names of the properties affected by the change
     * @type Array<String>
     */
    GXNode.BeforePropertiesChangeEvent.prototype.properties = null;

    /**
     * The values that will be assigned
     * @type Array<*>
     */
    GXNode.BeforePropertiesChangeEvent.prototype.values = null;

    /** @override */
    GXNode.BeforePropertiesChangeEvent.prototype.toString = function () {
        return "[Event GXNode.BeforePropertiesChangeEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXNode.AfterPropertiesChangeEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a node properties change sent via a scene after the property has changed
     * @param {GXNode} node the node which' properties are affected by the change
     * @param {Array<String>} properties the names of the properties affected by the change
     * @param {Array<*>} values the values that the properties previously had have
     * @class GXNode.AfterPropertiesChangeEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GXNode.AfterPropertiesChangeEvent = function (node, properties, values) {
        this.node = node;
        this.properties = properties;
        this.values = values;
    };

    GObject.inherit(GXNode.AfterPropertiesChangeEvent, GEvent);

    /**
     * The node which' property is affected by the change
     * @type GXNode
     */
    GXNode.AfterPropertiesChangeEvent.prototype.node = null;
    /**
     * The names of the properties affected by the change
     * @type Array<String>
     */
    GXNode.AfterPropertiesChangeEvent.prototype.properties = null;

    /**
     * The values that the properties previously had have
     * @type Array<*>
     */
    GXNode.AfterPropertiesChangeEvent.prototype.values = null;

    /** @override */
    GXNode.AfterPropertiesChangeEvent.prototype.toString = function () {
        return "[Event GXNode.AfterPropertiesChangeEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXNode.BeforeFlagChangeEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a node flag change sent via a scene before the flag will be changed
     * @param {GXNode} node the node which' flag is affected by the change
     * @param {Number} flag the flag affected by the change
     * @param {Boolean} set whether the flag will be set (true) or cleared/removed (false)
     * @class GXNode.BeforeFlagChangeEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GXNode.BeforeFlagChangeEvent = function (node, flag, set) {
        this.node = node;
        this.flag = flag;
        this.set = set;
    };

    GObject.inherit(GXNode.BeforeFlagChangeEvent, GEvent);

    /**
     * The node which' flag is affected by the change
     * @type GXNode
     * @version 1.0
     */
    GXNode.BeforeFlagChangeEvent.prototype.node = null;
    /**
     * The flag affected by the change
     * @type Number
     * @version 1.0
     */
    GXNode.BeforeFlagChangeEvent.prototype.flag = null;

    /**
     * Whether the flag will be set (true) or cleared/removed (false)
     * @type Boolean
     * @version 1.0
     */
    GXNode.BeforeFlagChangeEvent.prototype.set = null;

    /** @override */
    GXNode.BeforeFlagChangeEvent.prototype.toString = function () {
        return "[Event GXNode.BeforeFlagChangeEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXNode.AfterFlagChangeEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a node flag change sent via a scene after the flag was changed
     * @param {GXNode} node the node which' flag was affected by the change
     * @param {Number} flag the flag affected by the change
     * @param {Boolean} set whether the flag will was set (true) or cleared/removed (false)
     * @class GXNode.AfterFlagChangeEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GXNode.AfterFlagChangeEvent = function (node, flag, set) {
        this.node = node;
        this.flag = flag;
        this.set = set;
    };

    GObject.inherit(GXNode.AfterFlagChangeEvent, GEvent);

    /**
     * The node which' flag was affected by the change
     * @type GXNode
     * @version 1.0
     */
    GXNode.AfterFlagChangeEvent.prototype.node = null;
    /**
     * The flag affected by the change
     * @type Number
     * @version 1.0
     */
    GXNode.AfterFlagChangeEvent.prototype.flag = null;

    /**
     * Whether the flag was set (true) or cleared/removed (false)
     * @type Boolean
     * @version 1.0
     */
    GXNode.AfterFlagChangeEvent.prototype.set = null;

    /** @override */
    GXNode.AfterFlagChangeEvent.prototype.toString = function () {
        return "[Event GXNode.AfterFlagChangeEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXNode.Properties Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin to make a node become a container for properties
     * @class GXNode.Properties
     * @mixin
     * @constructor
     * @version 1.0
     */
    GXNode.Properties = function () {
    };

    /**
     * Checks whether a given property is set on this node or not
     * @param {String} property the name of the property
     * @param {Boolean} [custom] whether property is a custom one or not, defaults to false
     * @return {Boolean} true if property is set, false if not
     */
    GXNode.Properties.prototype.hasProperty = function (property, custom) {
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
    GXNode.Properties.prototype.getProperty = function (property, custom, def) {
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
    GXNode.Properties.prototype.getProperties = function (properties, custom, def) {
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
     * @see setProperties
     */
    GXNode.Properties.prototype.setProperty = function (property, value, custom) {
        return this.setProperties([property], [value], custom);
    };

    /**
     * Assigns one or more properties a new values
     * @param {Array<String>} properties the property names in the same order as values
     * @param {Array<*>} values the new values in the same order as property names
     * @param {Boolean} [custom] whether properties are a custom ones or not, defaults to false
     * Defaults to false.
     * @return {Boolean} true if at least one property has been modified, false if not (i.e. because
     * the property was already set to the specified value)
     */
    GXNode.Properties.prototype.setProperties = function (properties, values, custom) {
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

            if (!gUtil.equals(value, oldValue, true)) {
                propertiesToModify.push(properties[i]);
                valuesToModify.push(values[i])
            }
        }

        // Return early if there're no properties to modify
        if (propertiesToModify.length === 0) {
            return false;
        }

        this._notifyChange(GXNode._Change.BeforePropertiesChange, {properties: propertiesToModify, values: valuesToModify});

        // Assign new property values now
        var previousValues = [];
        for (var i = 0; i < propertiesToModify.length; ++i) {
            var propName = (custom ? '@' : '$') + propertiesToModify[i];
            previousValues.push(this[propName]);
            this[propName] = valuesToModify[i];
        }

        this._notifyChange(GXNode._Change.AfterPropertiesChange, {properties: propertiesToModify, values: previousValues});

        return true;
    };

    /**
     * Store a given set of properties into a given blob
     * @param {*} blob the blob to save into
     * @param {*} properties a hashmap of properties to their default values to be stored
     * @param {Function} [filter] custom filter function (property,value} to return
     * the value to be serialized for a given property
     */
    GXNode.Properties.prototype.storeProperties = function (blob, properties, filter) {
        filter = filter || function (property, value) {
            return value;
        }
        for (var property in properties) {
            var defaultValue = properties[property];
            var myValue = filter(property, this['$' + property]);
            if (!gUtil.equals(myValue, defaultValue, true)) {
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
    GXNode.Properties.prototype.restoreProperties = function (blob, properties, filter) {
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
     * @param {GXNode} node a properties node to transfer from
     * @param {Array<*>} properties array of hashmaps of properties to their default values to be transfered
     * Defaults to false.
     */
    GXNode.Properties.prototype.transferProperties = function (source, properties) {
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
    GXNode.Properties.prototype._setDefaultProperties = function () {
        for (var i = 0; i < arguments.length; ++i) {
            var properties = arguments[i];
            for (var property in properties) {
                this['$' + property] = properties[property];
            }
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXNode.Identity Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin to make a node become identifiable (id)
     * @class GXNode.Identity
     * @mixin
     * @constructor
     * @version 1.0
     */
    GXNode.Identity = function () {
    };

    /**
     * Returns the id of the node
     * @return {String}
     * @version 1.0
     */
    GXNode.Identity.prototype.getId = function () {
        throw new Error("Not Supported.");
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXNode.Tag Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin to make a node become tagable
     * @class GXNode.Tag
     * @mixin
     * @constructor
     * @version 1.0
     */
    GXNode.Tag = function () {
    };

    /**
     * Returns the tags of the node
     * @return {String}
     * @version 1.0
     */
    GXNode.Tag.prototype.getTags = function () {
        throw new Error("Not Supported.");
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXNode.Container Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin to make a node become a container for children
     * @class GXNode.Container
     * @mixin
     * @constructor
     * @version 1.0
     */
    GXNode.Container = function () {
    };

    /**
     * @type GXNode
     * @private
     */
    GXNode.Container.prototype._firstChild = null;

    /**
     * @type GXNode
     * @private
     */
    GXNode.Container.prototype._lastChild = null;

    /**
     * Access the first child of this node if any
     * @param {Boolean} [shadow] if true, returns shadow nodes as well.
     * This defaults to false.
     * @return {GXNode} the first child of this node or null for none
     * @version 1.0
     */
    GXNode.Container.prototype.getFirstChild = function (shadow) {
        if (shadow || !this._firstChild) {
            return this._firstChild;
        } else {
            for (var c = this._firstChild; c != null; c = c._next) {
                if (!c.hasFlag(GXNode.Flag.Shadow)) {
                    return c;
                }
            }
            return null;
        }
    };

    /**
     * Access the last child of this node if any
     * @param {Boolean} [shadow] if true, returns shadow nodes as well.
     * This defaults to false.
     * @return {GXNode} the last child of this node or null for none
     * @version 1.0
     */
    GXNode.Container.prototype.getLastChild = function (shadow) {
        if (shadow || !this._lastChild) {
            return this._lastChild;
        } else {
            for (var c = this._lastChild; c != null; c = c._previous) {
                if (!c.hasFlag(GXNode.Flag.Shadow)) {
                    return c;
                }
            }
            return null;
        }
    };

    /**
     * Append a new node as child to this node
     * @param {GXNode} child the child to append to this one
     */
    GXNode.Container.prototype.appendChild = function (child) {
        this.insertChild(child, null);
    };

    /**
     * Insert a new child at a certain position
     * @param {GXNode} child the child to append to into this one
     * @param {GXNode} reference reference to insert before, can be null to append
     */
    GXNode.Container.prototype.insertChild = function (child, reference) {
        if (child._scene != null) {
            throw new Error("Child is already appended somewhere else");
        }
        if (reference != null && reference.getParent() != this) {
            throw new Error("Reference is not a child of this node");
        }
        if (!child.validateInsertion(this, reference)) {
            throw new Error("Child insertion validation failed.");
        }

        this._notifyChange(GXNode._Change.BeforeChildInsert, child);

        // Link our new child now
        child._parent = this;
        if (reference != null) {
            child._next = reference;
            child._previous = reference._previous;
            reference._previous = child;
            if (child._previous == null) {
                this._firstChild = child;
            } else {
                child._previous._next = child;
            }
        }
        else {
            if (this._lastChild != null) {
                child._previous = this._lastChild;
                this._lastChild._next = child;
                this._lastChild = child;
            }
            child._next = null;
        }

        if (this._firstChild == null) {
            this._firstChild = child;
            child._previous = null;
            child._next = null;
        }

        if (child._next == null) {
            this._lastChild = child;
        }

        // If attached, attach all children recursively
        if (this.isAttached()) {
            var self = this;
            if (child.accept) {
                child.accept(function (node) {
                    // Assign this scene to the node
                    node._scene = self._scene;
                }, true);
            }
        }

        this._notifyChange(GXNode._Change.AfterChildInsert, child);
    };

    /**
     * Remove an existing child from this node
     * @param {GXNode} child the child to remove from this one
     */
    GXNode.Container.prototype.removeChild = function (child) {
        if (child._parent != this) {
            throw new Error("Child is not a child of this node");
        }
        if (!child.validateRemoval()) {
            throw new Error("Child removal validation failed.");
        }


        this._notifyChange(GXNode._Change.BeforeChildRemove, child);

        if (this._firstChild == child) {
            this._firstChild = child._next;
        }
        if (this._lastChild == child) {
            this._lastChild = child._previous;
        }
        if (child._previous != null) {
            child._previous._next = child._next;
        }
        if (child._next != null) {
            child._next._previous = child._previous;
        }

        child._parent = null;
        child._previous = null;
        child._next = null;

        // If attached, detach all children recursively
        if (this.isAttached()) {
            if (child.accept) {
                child.accept(function (node) {
                    node._scene = null;
                }, true);
            }
        }


        this._notifyChange(GXNode._Change.AfterChildRemove, child);
    };

    /**
     * Remove all children of this node
     * @param {Boolean} [shadow] if true, remove also shadow nodes,
     * defaults to false
     */
    GXNode.Container.prototype.clearChildren = function (shadow) {
        while (this.getFirstChild(shadow)) {
            this.removeChild(this.getFirstChild(shadow));
        }
    };

    /**
     * Gets the index of a child node
     * @param {GXNode} child the child to get an index for
     * @param {Boolean} [shadow] if true, counts also shadow nodes,
     * defaults to false
     * @return {Number} the child index or a value less than zero
     * if child is not a child of this node
     */
    GXNode.Container.prototype.getIndexOfChild = function (child, shadow) {
        if (child._parent === this) {
            var index = 0;
            for (var node = this.getFirstChild(shadow); node !== null; node = node.getNext(shadow)) {
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
     * @param {Boolean} [shadow] if true, counts also shadow nodes,
     * defaults to false
     * @return {GXNode} the child of this node at given index or
     * null if no child was found at the given index
     */
    GXNode.Container.prototype.getChildByIndex = function (childIndex, shadow) {
        var index = 0;
        for (var node = this.getFirstChild(shadow); node !== null; node = node.getNext(shadow)) {
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
     * @param {Boolean} [shadow] if true, visits shadow nodes as well.
     * This defaults to false.
     * @return {Boolean}
     * @version 1.0
     */
    GXNode.Container.prototype.acceptChildren = function (visitor, shadow) {
        for (var child = this.getFirstChild(shadow); child != null; child = child.getNext(shadow)) {
            if (child.accept(visitor, shadow) === false) {
                return false;
            }
        }
        return true;
    };

    /** @override */
    GXNode.Container.prototype.toString = function () {
        return "[Mixin GXNode.Container]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXNode.Store Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin to make a node become storable
     * @class GXNode.Store
     * @mixin
     * @constructor
     * @version 1.0
     */
    GXNode.Store = function () {
    };

    /**
     * Called to store this node into a given blob.
     * The caller will already take care about storing any children.
     * @param {*} blob the blob to store into
     * @return {boolean} true if node could be stored, false if not
     */
    GXNode.Store.prototype.store = function (blob) {
        if (this.hasMixin(GXNode.Container)) {
            // Store children
            for (var child = this.getFirstChild(); child !== null; child = child.getNext()) {
                var childBlob = GXNode.store(child);
                if (childBlob) {
                    if (!blob.hasOwnProperty('$')) {
                        blob['$'] = [childBlob];
                    } else {
                        blob['$'].push(childBlob);
                    }
                }
            }
        }

        if (this.hasMixin(GXNode.Properties)) {
            // Store custom properties if any
            for (var property in this) {
                if (this.hasOwnProperty(property) && property.length > 1 && property.charAt(0) === '@') {
                    blob[property] = this[property];
                }
            }
        }

        // Return true by default
        return true;
    };

    /**
     * Called to restore this node from a given blob.
     * The caller will already take care about restoring any children.
     * @param {*} blob the blob to restore from
     * @return {boolean} true if node could be restored, false if not
     */
    GXNode.Store.prototype.restore = function (blob) {
        // Restore children if any
        if (blob.hasOwnProperty('$') && this.hasMixin(GXNode.Container)) {
            var children = blob['$'];
            if (children.length > 0) {
                for (var i = 0; i < children.length; ++i) {
                    var child = GXNode.restore(children[i]);
                    if (child) {
                        this.appendChild(child);
                    }
                }
            }
        }

        if (this.hasMixin(GXNode.Properties)) {
            // Restore custom properties if any
            for (var property in blob) {
                if (blob.hasOwnProperty(property) && property.length > 1 && property.charAt(0) === '@') {
                    this[property] = blob[property];
                }
            }
        }

        // Return true by default
        return true;
    };

    /**
     * Called to clone this node and return a new instance out of it
     * @returns {GXNode}
     */
    GXNode.Store.prototype.clone = function () {
        // Serialize and deserialize ourself
        var serialized = GXNode.serialize(this);
        if (serialized) {
            return GXNode.deserialize(serialized);
        }
        return null;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXNode
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type GXScene
     * @private
     */
    GXNode.prototype._scene = null;

    /**
     * @type GXNode
     * @private
     */
    GXNode.prototype._parent = null;

    /**
     * @type GXNode
     * @private
     */
    GXNode.prototype._previous = null;

    /**
     * @type GXNode
     * @private
     */
    GXNode.prototype._next = null;

    /**
     * @type Number
     * @private
     */
    GXNode.prototype._flags = 0;

    /**
     * Returns the name of the node type
     * @return {String}
     * @version 1.0
     */
    GXNode.prototype.getNodeName = function () {
        return GXNode.getName(this);
    };

    /**
     * Returns the (translated), human-readable name of the node type
     * @return {String}
     * @version 1.0
     */
    GXNode.prototype.getNodeNameTranslated = function () {
        return gLocale.getValue(this, "name", this.getNodeName());
    };

    /**
     * Checks if this node is actually attached to a scene or not
     * @return {Boolean} whether the node is attached or not
     * @version 1.0
     */
    GXNode.prototype.isAttached = function () {
        return this._scene != null;
    };

    /**
     * Access the scene of this node
     * @return {GXScene}
     * @version 1.0
     */
    GXNode.prototype.getScene = function () {
        return this._scene;
    };

    /**
     * Access the parent of this node if any
     * @return {GXNode} the parent of this node or null for none
     * @version 1.0
     */
    GXNode.prototype.getParent = function () {
        return this._parent;
    };

    /**
     * Access the previous sibling of this node if any
     * @param {Boolean} [shadow] if true, returns shadow nodes as well.
     * This defaults to false.
     * @return {GXNode} the previous sibling of this node or null for none
     * @version 1.0
     */
    GXNode.prototype.getPrevious = function (shadow) {
        if (shadow || !this._previous) {
            return this._previous;
        } else {
            for (var c = this._previous; c != null; c = c._previous) {
                if (!c.hasFlag(GXNode.Flag.Shadow)) {
                    return c;
                }
            }
            return null;
        }
    };

    /**
     * Access the next sibling of this node if any
     * @param {Boolean} [shadow] if true, returns shadow nodes as well.
     * This defaults to false.
     * @return {GXNode} the next sibling of this node or null for none
     * @version 1.0
     */
    GXNode.prototype.getNext = function (shadow) {
        if (shadow || !this._next) {
            return this._next;
        } else {
            for (var c = this._next; c != null; c = c._next) {
                if (!c.hasFlag(GXNode.Flag.Shadow)) {
                    return c;
                }
            }
            return null;
        }
    };

    /**
     * Return all nodes within this one (if any) recursively
     * with a given name or all for pseudo-selector '*'
     * @param {String} nodeName either null or '*' for all or
     * a specific nodeName to look for
     * @return {Array<GXNode>} an array of found nodes or empty
     * array for no match
     * @version 1.0
     */
    GXNode.prototype.getNodesByName = function (nodeName, ignoreSelf) {
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
     * Query for all nodes within this one
     * @param {String} selector a CSS3-compatible selector
     * @returns {Array<GXNode>} all matched nodes or empty array for none
     * @version 1.0
     */
    GXNode.prototype.queryAll = function (selector) {
        return GXSelector.queryAll(selector, this);
    };

    /**
     * Query for a single node within this one
     * @param {String} selector a CSS3-compatible selector
     * @returns {GXNode} a matched node or null for no match
     * @version 1.0
     */
    GXNode.prototype.querySingle = function (selector) {
        var result = GXSelector.querySingle(selector, this);
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
    GXNode.prototype.matches = function (selector) {
        return GXSelector.match(selector, this);
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
    GXNode.prototype.filtered = function (selector) {
        return GXSelector.filter(selector, [this]).length === 1;
    };

    /**
     * Accept a visitor
     * @param {Function} visitor a visitor function called for each visit retrieving the current
     * node as first parameter. The function may return a boolean value indicating whether to
     * return visiting (true) or whether to cancel visiting (false). Not returning anything or
     * returning anything else than a Boolean will be ignored.
     * @param {Boolean} [shadow] if true, visits shadow nodes as well.
     * This defaults to false.
     * @return {Boolean} result of visiting (false = canceled, true = went through)
     * @version 1.0
     */
    GXNode.prototype.accept = function (visitor, shadow) {
        if (shadow || !this.hasFlag(GXNode.Flag.Shadow)) {
            if (visitor.call(null, this) === false) {
                return false;
            }
        }

        if (this.hasMixin(GXNode.Container)) {
            return this.acceptChildren(visitor, shadow);
        }

        return true;
    };

    /**
     * Checks whether this node has a certain flag setup
     * @param {Number} flag
     * @returns {Boolean}
     * @version 1.0
     */
    GXNode.prototype.hasFlag = function (flag) {
        return (this._flags & flag) != 0;
    };

    /**
     * Set a flag on this node
     * @param {Number} flag the flag to set
     * @version 1.0
     */
    GXNode.prototype.setFlag = function (flag) {
        // Ensure the flag may be modified
        if (this._canModifyFlag(flag, true)) {
            if ((this._flags & flag) == 0) {
                this._notifyChange(GXNode._Change.BeforeFlagChange, {flag: flag, set: true});

                this._flags = this._flags | flag;

                this._notifyChange(GXNode._Change.AfterFlagChange, {flag: flag, set: true});
            }
        }
    };

    /**
     * Remove a flag from this node
     * @param {Number} flag the flag to remove
     * @version 1.0
     */
    GXNode.prototype.removeFlag = function (flag) {
        // Ensure the flag may be modified
        if (this._canModifyFlag(flag, false)) {
            if ((this._flags & flag) != 0) {
                this._notifyChange(GXNode._Change.BeforeFlagChange, {flag: flag, set: false});

                this._flags = this._flags & ~flag;

                this._notifyChange(GXNode._Change.AfterFlagChange, {flag: flag, set: false});
            }
        }
    };

    /**
     * Validates whether this node could be inserted into a given parent
     * @param {GXNode} parent the parent to validate against
     * @param {GXNode} reference optional reference to insert be for,
     * defaults to null meaning to append at the end
     * @return {Boolean} true if node could be inserted, false if not
     */
    GXNode.prototype.validateInsertion = function (parent, reference) {
        // return false by default
        return false;
    };

    /**
     * Validates whether this node can be removed from it's parent.
     * If this node is not attached to a parent, this will always
     * return false
     * @return {Boolean} true if node could be removed, false if not
     */
    GXNode.prototype.validateRemoval = function () {
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
    GXNode.prototype._canModifyFlag = function (flag, set) {
        // by default, we allow everything
        return true;
    };

    /**
     * Block one or more changes
     * @param {Array<Number>} changes the array of changes to be blocked
     * @private
     */
    GXNode.prototype._beginBlockChanges = function (changes) {
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
    GXNode.prototype._endBlockChanges = function (changes) {
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
    GXNode.prototype._beginBlockEvents = function (eventClasses) {
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
    GXNode.prototype._endBlockEvents = function (eventClasses) {
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
    GXNode.prototype._getCompositeEvents = function (structural, properties, flags) {
        var events = [];

        if (structural) {
            events = events.concat([
                GXNode.BeforeInsertEvent,
                GXNode.AfterInsertEvent,
                GXNode.BeforeRemoveEvent,
                GXNode.AfterRemoveEvent
            ]);
        }

        if (properties) {
            events = events.concat([
                GXNode.BeforePropertiesChangeEvent,
                GXNode.AfterPropertiesChangeEvent
            ]);
        }

        if (flags) {
            events = events.concat([
                GXNode.BeforeFlagChangeEvent,
                GXNode.AfterFlagChangeEvent
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
    GXNode.prototype._beginBlockCompositeEvents = function (structural, properties, flags) {
        this._beginBlockEvents(this._getCompositeEvents(structural, properties, flags));
    };

    /**
     * Util function to unblock a composite number of events
     * @param {Boolean} structural unblock structural events (insert, remove)
     * @param {Boolean} [properties] unblock property events
     * @param {Boolean} [flags] unblock flag events
     * @private
     */
    GXNode.prototype._endBlockCompositeEvents = function (structural, properties, flags) {
        this._endBlockEvents(this._getCompositeEvents(structural, properties, flags));
    };

    /**
     * Notify about a change and handle it if not blocked
     * @param {Number} change the change we got notified
     * @param {Object} [args] the arguments for the change, it's value
     * depends on the current change and should be documented
     * within the change constant type
     * @private
     */
    GXNode.prototype._notifyChange = function (change, args) {
        if (!this._blockedChanges || !this._blockedChanges[change]) {
            this._handleChange(change, args);
        }
    };

    /**
     * Returns whether a given event can be send which is only the case
     * when the node is attached, the scene has a listener for the event
     * and the event is not blocked
     * @param eventClass
     * @returns {Boolean}
     * @private
     */
    GXNode.prototype._canEventBeSend = function (eventClass) {
        if (!this.isAttached()) {
            return false;
        }

        if (!this._scene.hasEventListeners(eventClass)) {
            return false;
        }

        var event_id = GObject.getTypeId(eventClass);
        return !this._blockedEvents || !this._blockedEvents[event_id];
    };

    /**
     * Handle a change
     * @param {Number} change the change we got should handle
     * @param {Object} [args] the arguments for the change, it's value
     * depends on the current change and should be documented
     * within the change constant type
     * @private
     */
    GXNode.prototype._handleChange = function (change, args) {
        if (change == GXNode._Change.BeforeChildInsert) {
            /** @type {GXNode} */
            var child = args;
            if (this._canEventBeSend(GXNode.BeforeInsertEvent)) {
                this._scene.trigger(new GXNode.BeforeInsertEvent(child));
            }
        }
        else if (change == GXNode._Change.AfterChildInsert) {
            /** @type {GXNode} */
            var child = args;
            if (this._canEventBeSend(GXNode.AfterInsertEvent)) {
                this._scene.trigger(new GXNode.AfterInsertEvent(child));
            }
        } else if (change == GXNode._Change.BeforeChildRemove) {
            /** @type {GXNode} */
            var child = args;
            if (this._canEventBeSend(GXNode.BeforeRemoveEvent)) {
                this._scene.trigger(new GXNode.BeforeRemoveEvent(child));
            }
        }
        else if (change == GXNode._Change.AfterChildRemove) {
            /** @type {GXNode} */
            var child = args;
            if (this._canEventBeSend(GXNode.AfterRemoveEvent)) {
                this._scene.trigger(new GXNode.AfterRemoveEvent(child));
            }
        } else if (change == GXNode._Change.BeforePropertiesChange) {
            /** @type {{properties: Array<String>, values: Array<*>}} */
            var propertyArgs = args;
            if (this._canEventBeSend(GXNode.BeforePropertiesChangeEvent)) {
                this._scene.trigger(new GXNode.BeforePropertiesChangeEvent(this, propertyArgs.properties, propertyArgs.values));
            }
        }
        else if (change == GXNode._Change.AfterPropertiesChange) {
            /** @type {{properties: Array<String>, values: Array<*>}} */
            var propertyArgs = args;
            if (this._canEventBeSend(GXNode.AfterPropertiesChangeEvent)) {
                this._scene.trigger(new GXNode.AfterPropertiesChangeEvent(this, propertyArgs.properties, propertyArgs.values));
            }
        } else if (change == GXNode._Change.BeforeFlagChange) {
            /** @type {{flag: Number, set: Boolean}} */
            var flagArgs = args;
            if (this._canEventBeSend(GXNode.BeforeFlagChangeEvent)) {
                this._scene.trigger(new GXNode.BeforeFlagChangeEvent(this, flagArgs.flag, flagArgs.set));
            }
        }
        else if (change == GXNode._Change.AfterFlagChange) {
            /** @type {{flag: Number, set: Boolean}} */
            var flagArgs = args;
            if (this._canEventBeSend(GXNode.AfterFlagChangeEvent)) {
                this._scene.trigger(new GXNode.AfterFlagChangeEvent(this, flagArgs.flag, flagArgs.set));
            }
        }
    };

    _.GXNode = GXNode;
})(this);