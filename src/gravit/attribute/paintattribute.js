(function (_) {

    /**
     * Base paint attribute
     * @class GPaintAttribute
     * @extends GAttribute
     * @constructor
     */
    function GPaintAttribute() {
    };
    IFObject.inherit(GPaintAttribute, GAttribute);

    /**
     * @type {JQuery}
     * @private
     */
    GPaintAttribute.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GPaintAttribute.prototype._document = null;

    /**
     * @type {GAttribute}
     * @private
     */
    GPaintAttribute.prototype._attribute = null;

    /**
     * @type {Function}
     * @private
     */
    GPaintAttribute.prototype._assign = null;

    /** @override */
    GPaintAttribute.prototype.isCreateable = function (elements, attribute) {
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i].getAttributes().hasMixin(IFAttributes.Pattern)) {
                return true;
            }
        }
        return false;
    };

    /** @override */
    GPaintAttribute.prototype.createAttribute = function (elements, attribute) {
        var targets = null;
        if (attribute && attribute instanceof IFDrawAttribute) {
            targets = [attribute];
        } else {
            targets = [];
            for (var i = 0; i < elements.length; ++i) {
                if (elements[i].getAttributes().hasMixin(IFAttributes.Pattern)) {
                    targets.push(elements[i].getAttributes());
                }
            }
        }

        for (var i = 0; i < targets.length; ++i) {
            var attrClass = this.getAttributeClass();
            targets[i].appendChild(new attrClass());
        }
    };

    /** @override */
    GPaintAttribute.prototype.toString = function () {
        return "[Object GPaintAttribute]";
    };

    _.GPaintAttribute = GPaintAttribute;
})(this);