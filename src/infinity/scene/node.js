(function (_) {
    /**
     * Base node representing a single item within a scene
     * @class IFNode
     * @extends IFObject
     * @constructor
     * @version 1.0
     */
    function IFNode() {
    };

    IFObject.inherit(IFNode, IFObject);

    /**
     * Nodes's mime-type
     * @type {string}
     */
    IFNode.MIME_TYPE = "application/infinity+node";

    /**
     * IFObject.inherit descendant for nodes
     * @param {String} name the unique name for the node
     * @see IFObject.inherit
     */
    IFNode.inherit = function (name, target, base) {
        IFObject.inherit(target, base);
        IFNode._registerNodeClass(name, target);
    };

    /**
     * IFObject.inheritAndMix descendant for nodes
     * @param {String} name the unique name for the node
     * @see IFObject.inheritAndMix
     */
    IFNode.inheritAndMix = function (name, target, base, mixins) {
        IFObject.inheritAndMix(target, base, mixins);
        IFNode._registerNodeClass(name, target);
    };

    /**
     * Returns the name for a given node or node class
     * @param {Object|Function|Number} node
     */
    IFNode.getName = function (node) {
        return IFNode._nodeClassToNameMap[IFObject.getTypeId(node)];
    };

    /**
     * Called to store a given node into a blob
     * @param {IFNode} node the node to be stored
     * @returns {*} the stored blob for the node or null on failure
     */
    IFNode.store = function (node) {
        if (node.hasMixin(IFNode.Store)) {
            var blob = {
                '@': IFNode._nodeClassToNameMap[IFObject.getTypeId(node)]
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
     * @returns {IFNode} a node instance of the blob-type or
     * null for failure
     */
    IFNode.restore = function (blob) {
        if (!blob || !blob.hasOwnProperty('@')) {
            return null;
        }

        var nodeClass = IFNode._nameToNodeClassMap[blob['@']];
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
     * Serialize a given node or an array of nodes into a string
     * @param {IFNode|Array<IFNode>} node the node to serialize
     * or an array of nodes to serialize
     * @param {Boolean} [beautify] whether to beautify, defaults to false
     * @param {String} serialized json code or null for failure
     */
    IFNode.serialize = function (node, beautify) {
        if (node instanceof Array) {
            var blobs = [];

            for (var i = 0; i < node.length; ++i) {
                var blob = IFNode.store(node[i]);
                if (blob) {
                    blobs.push(blob);
                }
            }

            if (blobs.length > 0) {
                return JSON.stringify(blobs, null, beautify ? 4 : null);
            }
        } else {
            var blob = IFNode.store(node);
            if (blob) {
                return JSON.stringify(blob, null, beautify ? 4 : null);
            }
        }

        return null;
    };

    /**
     * Deserialize a node or any array of nodes from a given json string
     * @param {String} source the json string source to deserialize from
     * @returns {IFNode|Array<IFNode>} the deserialized node
     * or array of nodes or null for failure
     */
    IFNode.deserialize = function (source) {
        if (source) {
            var blob = JSON.parse(source);

            if (blob && blob instanceof Array) {
                var nodes = [];

                for (var i = 0; i < blob.length; ++i) {
                    var node = IFNode.restore(blob[i]);
                    if (node) {
                        nodes.push(node);
                    }
                }

                return nodes && nodes.length > 0 ? nodes : null;
            } else {
                return IFNode.restore(blob);
            }
        }

        return null;
    };

    /**
     * Returns a new array with an ordered direction
     * of a given set of nodes depending on their
     * position in the tree
     * @param {Array<IFNode>} nodes an array of nodes to be ordered
     * @param {Boolean} [reverse] if true, orders the way that
     * parent comes first, last child comes first, otherwise
     * orders that parent comes first, first child comes first,
     * defaults to false
     * @return {Array<IFNode>} A new, ordered array
     */
    IFNode.order = function (nodes, reverse) {
        // TODO : Implement this!!
        return nodes.slice();
    };

    /**
     * Map of node-class type-ids to their names
     * @type {Object}
     * @private
     */
    IFNode._nodeClassToNameMap = {};

    /**
     * Map of names to their node-classes
     * @type {Object}
     * @private
     */
    IFNode._nameToNodeClassMap = {};

    /**
     * Register a name for a node class
     * @param {String} name the unique name to register for the node class
     * @param {Function} clazz the node class to be registered
     * @private
     */
    IFNode._registerNodeClass = function (name, clazz) {
        IFNode._nodeClassToNameMap[IFObject.getTypeId(clazz)] = name;
        IFNode._nameToNodeClassMap[name] = clazz;
    };

    /**
     * Known flags for a node
     * @version 1.0
     */
    IFNode.Flag = {
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
    IFNode._Change = {
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
    // IFNode.BeforeInsertEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a future node insertion sent via a scene
     * @param {IFNode} node the node that will be inserted
     * @class IFNode.BeforeInsertEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    IFNode.BeforeInsertEvent = function (node) {
        this.node = node;
    };
    IFObject.inherit(IFNode.BeforeInsertEvent, GEvent);

    /**
     * The node that has will be inserted
     * @type IFNode
     * @version 1.0
     */
    IFNode.BeforeInsertEvent.prototype.node = null;

    /** @override */
    IFNode.BeforeInsertEvent.prototype.toString = function () {
        return "[Event IFNode.BeforeInsertEvent]";
    };


    // -----------------------------------------------------------------------------------------------------------------
    // IFNode.AfterInsertEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for node insertion sent via a scene
     * @param {IFNode} node the node that was inserted
     * @class IFNode.AfterInsertEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    IFNode.AfterInsertEvent = function (node) {
        this.node = node;
    };
    IFObject.inherit(IFNode.AfterInsertEvent, GEvent);

    /**
     * The node that was inserted
     * @type IFNode
     * @version 1.0
     */
    IFNode.AfterInsertEvent.prototype.node = null;

    /** @override */
    IFNode.AfterInsertEvent.prototype.toString = function () {
        return "[Event IFNode.AfterInsertEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFNode.BeforeRemoveEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a future node removal sent via a scene
     * @param {IFNode} node the node that will be removed
     * @class IFNode.BeforeRemoveEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    IFNode.BeforeRemoveEvent = function (node) {
        this.node = node;
    };
    IFObject.inherit(IFNode.BeforeRemoveEvent, GEvent);

    /**
     * The node that will be removed
     * @type IFNode
     * @version 1.0
     */
    IFNode.BeforeRemoveEvent.prototype.node = null;

    /** @override */
    IFNode.BeforeRemoveEvent.prototype.toString = function () {
        return "[Event IFNode.BeforeRemoveEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFNode.AfterRemoveEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a node removal sent via a scene
     * @param {IFNode} node the node that was removed
     * @class IFNode.AfterRemoveEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    IFNode.AfterRemoveEvent = function (node) {
        this.node = node;
    };
    IFObject.inherit(IFNode.AfterRemoveEvent, GEvent);

    /**
     * The node that was removed
     * @type IFNode
     * @version 1.0
     */
    IFNode.AfterRemoveEvent.prototype.node = null;

    /** @override */
    IFNode.AfterRemoveEvent.prototype.toString = function () {
        return "[Event IFNode.AfterRemoveEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFNode.BeforePropertiesChangeEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a node properties change sent via a scene before the properties will be changed
     * @param {IFNode} node the node which' properties are affected by the change
     * @param {Array<String>} properties the names of the properties affected by the change
     * @param {Array<*>} values the values that will be assigned
     * @class IFNode.BeforePropertiesChangeEvent
     * @extends GEvent
     * @constructor
     */
    IFNode.BeforePropertiesChangeEvent = function (node, properties, values) {
        this.node = node;
        this.properties = properties;
        this.values = values;
    };

    IFObject.inherit(IFNode.BeforePropertiesChangeEvent, GEvent);

    /**
     * The node which' property is affected by the change
     * @type IFNode
     */
    IFNode.BeforePropertiesChangeEvent.prototype.node = null;
    /**
     * The names of the properties affected by the change
     * @type Array<String>
     */
    IFNode.BeforePropertiesChangeEvent.prototype.properties = null;

    /**
     * The values that will be assigned
     * @type Array<*>
     */
    IFNode.BeforePropertiesChangeEvent.prototype.values = null;

    /** @override */
    IFNode.BeforePropertiesChangeEvent.prototype.toString = function () {
        return "[Event IFNode.BeforePropertiesChangeEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFNode.AfterPropertiesChangeEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a node properties change sent via a scene after the property has changed
     * @param {IFNode} node the node which' properties are affected by the change
     * @param {Array<String>} properties the names of the properties affected by the change
     * @param {Array<*>} values the values that the properties previously had have
     * @class IFNode.AfterPropertiesChangeEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    IFNode.AfterPropertiesChangeEvent = function (node, properties, values) {
        this.node = node;
        this.properties = properties;
        this.values = values;
    };

    IFObject.inherit(IFNode.AfterPropertiesChangeEvent, GEvent);

    /**
     * The node which' property is affected by the change
     * @type IFNode
     */
    IFNode.AfterPropertiesChangeEvent.prototype.node = null;
    /**
     * The names of the properties affected by the change
     * @type Array<String>
     */
    IFNode.AfterPropertiesChangeEvent.prototype.properties = null;

    /**
     * The values that the properties previously had have
     * @type Array<*>
     */
    IFNode.AfterPropertiesChangeEvent.prototype.values = null;

    /** @override */
    IFNode.AfterPropertiesChangeEvent.prototype.toString = function () {
        return "[Event IFNode.AfterPropertiesChangeEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFNode.BeforeFlagChangeEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a node flag change sent via a scene before the flag will be changed
     * @param {IFNode} node the node which' flag is affected by the change
     * @param {Number} flag the flag affected by the change
     * @param {Boolean} set whether the flag will be set (true) or cleared/removed (false)
     * @class IFNode.BeforeFlagChangeEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    IFNode.BeforeFlagChangeEvent = function (node, flag, set) {
        this.node = node;
        this.flag = flag;
        this.set = set;
    };

    IFObject.inherit(IFNode.BeforeFlagChangeEvent, GEvent);

    /**
     * The node which' flag is affected by the change
     * @type IFNode
     * @version 1.0
     */
    IFNode.BeforeFlagChangeEvent.prototype.node = null;
    /**
     * The flag affected by the change
     * @type Number
     * @version 1.0
     */
    IFNode.BeforeFlagChangeEvent.prototype.flag = null;

    /**
     * Whether the flag will be set (true) or cleared/removed (false)
     * @type Boolean
     * @version 1.0
     */
    IFNode.BeforeFlagChangeEvent.prototype.set = null;

    /** @override */
    IFNode.BeforeFlagChangeEvent.prototype.toString = function () {
        return "[Event IFNode.BeforeFlagChangeEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFNode.AfterFlagChangeEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for a node flag change sent via a scene after the flag was changed
     * @param {IFNode} node the node which' flag was affected by the change
     * @param {Number} flag the flag affected by the change
     * @param {Boolean} set whether the flag will was set (true) or cleared/removed (false)
     * @class IFNode.AfterFlagChangeEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    IFNode.AfterFlagChangeEvent = function (node, flag, set) {
        this.node = node;
        this.flag = flag;
        this.set = set;
    };

    IFObject.inherit(IFNode.AfterFlagChangeEvent, GEvent);

    /**
     * The node which' flag was affected by the change
     * @type IFNode
     * @version 1.0
     */
    IFNode.AfterFlagChangeEvent.prototype.node = null;
    /**
     * The flag affected by the change
     * @type Number
     * @version 1.0
     */
    IFNode.AfterFlagChangeEvent.prototype.flag = null;

    /**
     * Whether the flag was set (true) or cleared/removed (false)
     * @type Boolean
     * @version 1.0
     */
    IFNode.AfterFlagChangeEvent.prototype.set = null;

    /** @override */
    IFNode.AfterFlagChangeEvent.prototype.toString = function () {
        return "[Event IFNode.AfterFlagChangeEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFNode.Properties Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin to make a node become a container for properties
     * @class IFNode.Properties
     * @mixin
     * @constructor
     * @version 1.0
     */
    IFNode.Properties = function () {
    };

    /**
     * Checks whether a given property is set on this node or not
     * @param {String} property the name of the property
     * @param {Boolean} [custom] whether property is a custom one or not, defaults to false
     * @return {Boolean} true if property is set, false if not
     */
    IFNode.Properties.prototype.hasProperty = function (property, custom) {
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
    IFNode.Properties.prototype.getProperty = function (property, custom, def) {
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
    IFNode.Properties.prototype.getProperties = function (properties, custom, def) {
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
    IFNode.Properties.prototype.setProperty = function (property, value, custom) {
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
    IFNode.Properties.prototype.setProperties = function (properties, values, custom) {
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

            if (!ifUtil.equals(value, oldValue, false)) {
                propertiesToModify.push(properties[i]);
                valuesToModify.push(values[i])
            }
        }

        // Return early if there're no properties to modify
        if (propertiesToModify.length === 0) {
            return false;
        }

        // Construct an event args object as it may be modified
        var changeArgs = {
            properties: propertiesToModify,
            values: valuesToModify
        };

        // Notify before change
        this._notifyChange(IFNode._Change.BeforePropertiesChange, changeArgs);

        // Assign new property values now
        var previousValues = [];
        for (var i = 0; i < propertiesToModify.length; ++i) {
            var propName = (custom ? '@' : '$') + propertiesToModify[i];
            previousValues.push(this[propName]);
            this[propName] = valuesToModify[i];
        }

        // Notify after change
        this._notifyChange(IFNode._Change.AfterPropertiesChange, changeArgs);

        return true;
    };

    /**
     * Store a given set of properties into a given blob
     * @param {*} blob the blob to save into
     * @param {*} properties a hashmap of properties to their default values to be stored
     * @param {Function} [filter] custom filter function (property,value} to return
     * the value to be serialized for a given property
     */
    IFNode.Properties.prototype.storeProperties = function (blob, properties, filter) {
        filter = filter || function (property, value) {
            return value;
        }
        for (var property in properties) {
            var defaultValue = properties[property];
            var value = this['$' + property];
            if (!ifUtil.equals(value, defaultValue, true)) {
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
    IFNode.Properties.prototype.restoreProperties = function (blob, properties, filter) {
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
     * @param {IFNode} node a properties node to transfer from
     * @param {Array<*>} properties array of hashmaps of properties to their default values to be transfered
     * Defaults to false.
     */
    IFNode.Properties.prototype.transferProperties = function (source, properties) {
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
    IFNode.Properties.prototype._setDefaultProperties = function () {
        for (var i = 0; i < arguments.length; ++i) {
            var properties = arguments[i];
            for (var property in properties) {
                this['$' + property] = properties[property];
            }
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFNode.Identity Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin to make a node become identifiable (id)
     * @class IFNode.Identity
     * @mixin
     * @constructor
     * @version 1.0
     */
    IFNode.Identity = function () {
    };

    /**
     * Returns the id of the node
     * @return {String}
     * @version 1.0
     */
    IFNode.Identity.prototype.getId = function () {
        throw new Error("Not Supported.");
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFNode.Tag Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin to make a node become tagable
     * @class IFNode.Tag
     * @mixin
     * @constructor
     * @version 1.0
     */
    IFNode.Tag = function () {
    };

    /**
     * Returns the tags of the node
     * @return {String}
     * @version 1.0
     */
    IFNode.Tag.prototype.getTags = function () {
        throw new Error("Not Supported.");
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFNode.Reference Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin to make a node become referenceable
     * @class IFNode.Reference
     * @mixin
     * @constructor
     */
    IFNode.Reference = function () {
    };

    IFNode.Reference.prototype._referenceId = null;

    /**
     * Returns the reference id of this node used for linking
     * @return {String}
     */
    IFNode.Reference.prototype.getReferenceId = function () {
        if (!this._referenceId) {
            this._referenceId = ifUtil.uuid();
        }
        return this._referenceId;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFNode.Container Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin to make a node become a container for children
     * @class IFNode.Container
     * @mixin
     * @constructor
     * @version 1.0
     */
    IFNode.Container = function () {
    };

    /**
     * @type IFNode
     * @private
     */
    IFNode.Container.prototype._firstChild = null;

    /**
     * @type IFNode
     * @private
     */
    IFNode.Container.prototype._lastChild = null;

    /**
     * Returns an array of all children within this node
     * @param {Boolean} [shadow] if true, returns shadow nodes as well.
     * This defaults to false.
     * @return {Array<IFNode>} array of all children of this node or
     * an empty array if there're no children
     */
    IFNode.Container.prototype.getChildren = function (shadow) {
        var result = [];
        for (var child = this.getFirstChild(shadow); child !== null; child = child.getNext(shadow)) {
            result.push(child);
        }
        return result;
    };

    /**
     * Access the first child of this node if any
     * @param {Boolean} [shadow] if true, returns shadow nodes as well.
     * This defaults to false.
     * @return {IFNode} the first child of this node or null for none
     * @version 1.0
     */
    IFNode.Container.prototype.getFirstChild = function (shadow) {
        if (shadow || !this._firstChild) {
            return this._firstChild;
        } else {
            for (var c = this._firstChild; c != null; c = c._next) {
                if (!c.hasFlag(IFNode.Flag.Shadow)) {
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
     * @return {IFNode} the last child of this node or null for none
     * @version 1.0
     */
    IFNode.Container.prototype.getLastChild = function (shadow) {
        if (shadow || !this._lastChild) {
            return this._lastChild;
        } else {
            for (var c = this._lastChild; c != null; c = c._previous) {
                if (!c.hasFlag(IFNode.Flag.Shadow)) {
                    return c;
                }
            }
            return null;
        }
    };

    /**
     * Append a new node as child to this node
     * @param {IFNode} child the child to append to this one
     */
    IFNode.Container.prototype.appendChild = function (child) {
        this.insertChild(child, null);
    };

    /**
     * Insert a new child at a certain position
     * @param {IFNode} child the child to append to into this one
     * @param {IFNode} reference reference to insert before, can be null to append
     */
    IFNode.Container.prototype.insertChild = function (child, reference) {
        if (child._scene != null) {
            throw new Error("Child is already appended somewhere else");
        }
        if (reference != null && reference.getParent() != this) {
            throw new Error("Reference is not a child of this node");
        }
        if (!child.validateInsertion(this, reference)) {
            throw new Error("Child insertion validation failed.");
        }

        this._notifyChange(IFNode._Change.BeforeChildInsert, child);

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
                    node._setScene(self._scene);
                }, true);
            }
        }

        this._notifyChange(IFNode._Change.AfterChildInsert, child);
    };

    /**
     * Remove an existing child from this node
     * @param {IFNode} child the child to remove from this one
     */
    IFNode.Container.prototype.removeChild = function (child) {
        if (child._parent != this) {
            throw new Error("Child is not a child of this node");
        }
        if (!child.validateRemoval()) {
            throw new Error("Child removal validation failed.");
        }


        this._notifyChange(IFNode._Change.BeforeChildRemove, child);

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
                    node._setScene(null);
                }, true);
            }
        }


        this._notifyChange(IFNode._Change.AfterChildRemove, child);
    };

    /**
     * Remove all children of this node
     * @param {Boolean} [shadow] if true, remove also shadow nodes,
     * defaults to false
     */
    IFNode.Container.prototype.clearChildren = function (shadow) {
        while (this.getFirstChild(shadow)) {
            this.removeChild(this.getFirstChild(shadow));
        }
    };

    /**
     * Gets the index of a child node
     * @param {IFNode} child the child to get an index for
     * @param {Boolean} [shadow] if true, counts also shadow nodes,
     * defaults to false
     * @return {Number} the child index or a value less than zero
     * if child is not a child of this node
     */
    IFNode.Container.prototype.getIndexOfChild = function (child, shadow) {
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
     * @return {IFNode} the child of this node at given index or
     * null if no child was found at the given index
     */
    IFNode.Container.prototype.getChildByIndex = function (childIndex, shadow) {
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
    IFNode.Container.prototype.acceptChildren = function (visitor, shadow) {
        for (var child = this.getFirstChild(shadow); child != null; child = child.getNext(shadow)) {
            if (child.accept(visitor, shadow) === false) {
                return false;
            }
        }
        return true;
    };

    /** @override */
    IFNode.Container.prototype.toString = function () {
        return "[Mixin IFNode.Container]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFNode.Store Mixin
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A mixin to make a node become storable
     * @class IFNode.Store
     * @mixin
     * @constructor
     * @version 1.0
     */
    IFNode.Store = function () {
    };

    /**
     * Called to store this node into a given blob.
     * The caller will already take care about storing any children.
     * @param {*} blob the blob to store into
     * @return {boolean} true if node could be stored, false if not
     */
    IFNode.Store.prototype.store = function (blob) {
        if (this.hasMixin(IFNode.Container)) {
            // Store children
            for (var child = this.getFirstChild(true); child !== null; child = child.getNext(true)) {
                var childBlob = IFNode.store(child);
                if (childBlob) {
                    if (!blob.hasOwnProperty('$')) {
                        blob['$'] = [childBlob];
                    } else {
                        blob['$'].push(childBlob);
                    }
                }
            }
        }

        if (this.hasMixin(IFNode.Properties)) {
            // Store custom properties if any
            for (var property in this) {
                if (this.hasOwnProperty(property) && property.length > 1 && property.charAt(0) === '@') {
                    blob[property] = this[property];
                }
            }
        }

        if (this.hasMixin(IFNode.Reference) && this._referenceId) {
            // Restore referenceId
            blob['#'] = this._referenceId;
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
    IFNode.Store.prototype.restore = function (blob) {
        // Restore children if any
        if (blob.hasOwnProperty('$') && this.hasMixin(IFNode.Container)) {
            var children = blob['$'];
            if (children.length > 0) {
                for (var i = 0; i < children.length; ++i) {
                    var child = IFNode.restore(children[i]);
                    if (child) {
                        this.appendChild(child);
                    }
                }
            }
        }

        if (this.hasMixin(IFNode.Properties)) {
            // Restore custom properties if any
            for (var property in blob) {
                if (blob.hasOwnProperty(property) && property.length > 1 && property.charAt(0) === '@') {
                    this[property] = blob[property];
                }
            }
        }

        if (this.hasMixin(IFNode.Reference) && blob.hasOwnProperty('#')) {
            // Restore referenceId
            this._referenceId = blob['#'];
        }

        // Return true by default
        return true;
    };

    /**
     * Called to clone this node and return a new instance out of it
     * @returns {IFNode}
     */
    IFNode.Store.prototype.clone = function () {
        // Serialize and deserialize ourself
        var serialized = IFNode.serialize(this);
        if (serialized) {
            return IFNode.deserialize(serialized);
        }
        return null;
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFNode
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type IFScene
     * @private
     */
    IFNode.prototype._scene = null;

    /**
     * @type IFNode
     * @private
     */
    IFNode.prototype._parent = null;

    /**
     * @type IFNode
     * @private
     */
    IFNode.prototype._previous = null;

    /**
     * @type IFNode
     * @private
     */
    IFNode.prototype._next = null;

    /**
     * @type Number
     * @private
     */
    IFNode.prototype._flags = 0;

    /**
     * Returns the name of the node type
     * @return {String}
     * @version 1.0
     */
    IFNode.prototype.getNodeName = function () {
        return IFNode.getName(this);
    };

    /**
     * Returns the (translated), human-readable name of the node type
     * @return {String}
     * @version 1.0
     */
    IFNode.prototype.getNodeNameTranslated = function () {
        return ifLocale.getValue(this, "name", this.getNodeName());
    };

    /**
     * Checks if this node is actually attached to a scene or not
     * @return {Boolean} whether the node is attached or not
     * @version 1.0
     */
    IFNode.prototype.isAttached = function () {
        return this._scene != null;
    };

    /**
     * Access the scene of this node
     * @return {IFScene}
     * @version 1.0
     */
    IFNode.prototype.getScene = function () {
        return this._scene;
    };

    /**
     * Access the parent of this node if any
     * @return {IFNode} the parent of this node or null for none
     * @version 1.0
     */
    IFNode.prototype.getParent = function () {
        return this._parent;
    };

    /**
     * Access the previous sibling of this node if any
     * @param {Boolean} [shadow] if true, returns shadow nodes as well.
     * This defaults to false.
     * @return {IFNode} the previous sibling of this node or null for none
     * @version 1.0
     */
    IFNode.prototype.getPrevious = function (shadow) {
        if (shadow || !this._previous) {
            return this._previous;
        } else {
            for (var c = this._previous; c != null; c = c._previous) {
                if (!c.hasFlag(IFNode.Flag.Shadow)) {
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
     * @return {IFNode} the next sibling of this node or null for none
     * @version 1.0
     */
    IFNode.prototype.getNext = function (shadow) {
        if (shadow || !this._next) {
            return this._next;
        } else {
            for (var c = this._next; c != null; c = c._next) {
                if (!c.hasFlag(IFNode.Flag.Shadow)) {
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
     * @return {Array<IFNode>} an array of found nodes or empty
     * array for no match
     * @version 1.0
     */
    IFNode.prototype.getNodesByName = function (nodeName, ignoreSelf) {
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
    IFNode.prototype.queryCount = function (selector) {
        var result = IFSelector.queryAll(selector, this);
        return result ? result.length : 0;
    };

    /**
     * Query for all nodes within this one
     * @param {String} selector a CSS3-compatible selector
     * @returns {Array<IFNode>} all matched nodes or empty array for none
     * @version 1.0
     */
    IFNode.prototype.queryAll = function (selector) {
        return IFSelector.queryAll(selector, this);
    };

    /**
     * Query for a single node within this one
     * @param {String} selector a CSS3-compatible selector
     * @returns {IFNode} a matched node or null for no match
     * @version 1.0
     */
    IFNode.prototype.querySingle = function (selector) {
        var result = IFSelector.querySingle(selector, this);
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
    IFNode.prototype.matches = function (selector) {
        return IFSelector.match(selector, this);
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
    IFNode.prototype.filtered = function (selector) {
        return IFSelector.filter(selector, [this]).length === 1;
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
    IFNode.prototype.accept = function (visitor, shadow) {
        if (shadow || !this.hasFlag(IFNode.Flag.Shadow)) {
            if (visitor.call(null, this) === false) {
                return false;
            }
        }

        if (this.hasMixin(IFNode.Container)) {
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
    IFNode.prototype.hasFlag = function (flag) {
        return (this._flags & flag) != 0;
    };

    /**
     * Set a flag on this node
     * @param {Number} flag the flag to set
     * @version 1.0
     */
    IFNode.prototype.setFlag = function (flag) {
        // Ensure the flag may be modified
        if (this._canModifyFlag(flag, true)) {
            if ((this._flags & flag) == 0) {
                this._notifyChange(IFNode._Change.BeforeFlagChange, {flag: flag, set: true});

                this._flags = this._flags | flag;

                this._notifyChange(IFNode._Change.AfterFlagChange, {flag: flag, set: true});
            }
        }
    };

    /**
     * Remove a flag from this node
     * @param {Number} flag the flag to remove
     * @version 1.0
     */
    IFNode.prototype.removeFlag = function (flag) {
        // Ensure the flag may be modified
        if (this._canModifyFlag(flag, false)) {
            if ((this._flags & flag) != 0) {
                this._notifyChange(IFNode._Change.BeforeFlagChange, {flag: flag, set: false});

                this._flags = this._flags & ~flag;

                this._notifyChange(IFNode._Change.AfterFlagChange, {flag: flag, set: false});
            }
        }
    };

    /**
     * Validates whether this node could be inserted into a given parent
     * @param {IFNode} parent the parent to validate against
     * @param {IFNode} reference optional reference to insert be for,
     * defaults to null meaning to append at the end
     * @return {Boolean} true if node could be inserted, false if not
     */
    IFNode.prototype.validateInsertion = function (parent, reference) {
        // return false by default
        return false;
    };

    /**
     * Validates whether this node can be removed from it's parent.
     * If this node is not attached to a parent, this will always
     * return false
     * @return {Boolean} true if node could be removed, false if not
     */
    IFNode.prototype.validateRemoval = function () {
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
    IFNode.prototype._canModifyFlag = function (flag, set) {
        // by default, we allow everything
        return true;
    };

    /**
     * Block one or more changes
     * @param {Array<Number>} changes the array of changes to be blocked
     * @private
     */
    IFNode.prototype._beginBlockChanges = function (changes) {
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
    IFNode.prototype._endBlockChanges = function (changes) {
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
    IFNode.prototype._beginBlockEvents = function (eventClasses) {
        if (!(this._blockedEvents)) {
            this._blockedEvents = {};
            this._blockedEvents._counter = 0;
        }

        for (var i = 0; i < eventClasses.length; ++i) {
            var event_id = IFObject.getTypeId(eventClasses[i]);
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
    IFNode.prototype._endBlockEvents = function (eventClasses) {
        if (this._blockedEvents) {
            for (var i = 0; i < eventClasses.length; ++i) {
                var event_id = IFObject.getTypeId(eventClasses[i]);
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
    IFNode.prototype._getCompositeEvents = function (structural, properties, flags) {
        var events = [];

        if (structural) {
            events = events.concat([
                IFNode.BeforeInsertEvent,
                IFNode.AfterInsertEvent,
                IFNode.BeforeRemoveEvent,
                IFNode.AfterRemoveEvent
            ]);
        }

        if (properties) {
            events = events.concat([
                IFNode.BeforePropertiesChangeEvent,
                IFNode.AfterPropertiesChangeEvent
            ]);
        }

        if (flags) {
            events = events.concat([
                IFNode.BeforeFlagChangeEvent,
                IFNode.AfterFlagChangeEvent
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
    IFNode.prototype._beginBlockCompositeEvents = function (structural, properties, flags) {
        this._beginBlockEvents(this._getCompositeEvents(structural, properties, flags));
    };

    /**
     * Util function to unblock a composite number of events
     * @param {Boolean} structural unblock structural events (insert, remove)
     * @param {Boolean} [properties] unblock property events
     * @param {Boolean} [flags] unblock flag events
     * @private
     */
    IFNode.prototype._endBlockCompositeEvents = function (structural, properties, flags) {
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
    IFNode.prototype._notifyChange = function (change, args) {
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
    IFNode.prototype._canEventBeSend = function (eventClass) {
        if (!this.isAttached()) {
            return false;
        }

        if (!this._scene.hasEventListeners(eventClass)) {
            return false;
        }

        var event_id = IFObject.getTypeId(eventClass);
        return !this._blockedEvents || !this._blockedEvents[event_id];
    };

    /**
     * @param {IFScene} scene
     * @private
     */
    IFNode.prototype._setScene = function (scene) {
        if (scene !== this._scene) {
            if (this.hasMixin(IFNode.Reference)) {
                if (scene) {
                    scene.addReference(this);
                } else {
                    this._scene.removeReference(this);
                }
            }

            this._scene = scene;
        }
    };

    /**
     * Handle a change
     * @param {Number} change the change we got should handle
     * @param {Object} [args] the arguments for the change, it's value
     * depends on the current change and should be documented
     * within the change constant type
     * @private
     */
    IFNode.prototype._handleChange = function (change, args) {
        if (change == IFNode._Change.BeforeChildInsert) {
            /** @type {IFNode} */
            var child = args;
            if (this._canEventBeSend(IFNode.BeforeInsertEvent)) {
                this._scene.trigger(new IFNode.BeforeInsertEvent(child));
            }
        }
        else if (change == IFNode._Change.AfterChildInsert) {
            /** @type {IFNode} */
            var child = args;
            if (this._canEventBeSend(IFNode.AfterInsertEvent)) {
                this._scene.trigger(new IFNode.AfterInsertEvent(child));
            }
        } else if (change == IFNode._Change.BeforeChildRemove) {
            /** @type {IFNode} */
            var child = args;
            if (this._canEventBeSend(IFNode.BeforeRemoveEvent)) {
                this._scene.trigger(new IFNode.BeforeRemoveEvent(child));
            }
        }
        else if (change == IFNode._Change.AfterChildRemove) {
            /** @type {IFNode} */
            var child = args;
            if (this._canEventBeSend(IFNode.AfterRemoveEvent)) {
                this._scene.trigger(new IFNode.AfterRemoveEvent(child));
            }
        } else if (change == IFNode._Change.BeforePropertiesChange) {
            /** @type {{properties: Array<String>, values: Array<*>}} */
            var propertyArgs = args;
            if (this._canEventBeSend(IFNode.BeforePropertiesChangeEvent)) {
                this._scene.trigger(new IFNode.BeforePropertiesChangeEvent(this, propertyArgs.properties, propertyArgs.values));
            }
        }
        else if (change == IFNode._Change.AfterPropertiesChange) {
            /** @type {{properties: Array<String>, values: Array<*>}} */
            var propertyArgs = args;
            if (this._canEventBeSend(IFNode.AfterPropertiesChangeEvent)) {
                this._scene.trigger(new IFNode.AfterPropertiesChangeEvent(this, propertyArgs.properties, propertyArgs.values));
            }
        } else if (change == IFNode._Change.BeforeFlagChange) {
            /** @type {{flag: Number, set: Boolean}} */
            var flagArgs = args;
            if (this._canEventBeSend(IFNode.BeforeFlagChangeEvent)) {
                this._scene.trigger(new IFNode.BeforeFlagChangeEvent(this, flagArgs.flag, flagArgs.set));
            }
        }
        else if (change == IFNode._Change.AfterFlagChange) {
            /** @type {{flag: Number, set: Boolean}} */
            var flagArgs = args;
            if (this._canEventBeSend(IFNode.AfterFlagChangeEvent)) {
                this._scene.trigger(new IFNode.AfterFlagChangeEvent(this, flagArgs.flag, flagArgs.set));
            }
        }
    };

    _.IFNode = IFNode;
})(this);