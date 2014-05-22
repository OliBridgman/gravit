(function (_) {

    /**
     * Base draw attribute
     * @class GDrawAttribute
     * @extends GAttribute
     * @constructor
     */
    function GDrawAttribute() {
    };
    IFObject.inherit(GDrawAttribute, GAttribute);

    /**
     * @type {JQuery}
     * @private
     */
    GDrawAttribute.prototype._panel = null;

    /**
     * @type {EXDocument}
     * @private
     */
    GDrawAttribute.prototype._document = null;

    /**
     * @type {GAttribute}
     * @private
     */
    GDrawAttribute.prototype._attribute = null;

    /**
     * @type {Function}
     * @private
     */
    GDrawAttribute.prototype._assign = null;

    /** @override */
    GDrawAttribute.prototype.isCreateable = function (elements, attribute) {
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i].getAttributes().hasMixin(IFAttributes.Render)) {
                return true;
            }
        }
        return false;
    };

    /** @override */
    GDrawAttribute.prototype.createAttribute = function (elements, attribute) {
        var targets = null;
        if (attribute && (attribute instanceof IFPaintAttribute || attribute instanceof IFDrawAttribute)) {
            targets = [attribute];
        } else {
            targets = [];
            for (var i = 0; i < elements.length; ++i) {
                if (elements[i].getAttributes().hasMixin(IFAttributes.Render)) {
                    targets.push(elements[i].getAttributes());
                }
            }
        }

        for (var i = 0; i < targets.length; ++i) {
            var target = targets[i];
            var attrClass = this.getAttributeClass();
            var newAttr = new attrClass();

            if (target instanceof IFAttributes) {
                var elementsToMove = [];

                for (var child = target.getFirstChild(); child !== null; child = child.getNext()) {
                    if (child instanceof IFPaintAttribute || child instanceof IFDrawAttribute) {
                        elementsToMove.push(child);
                    }
                }

                for (var i = 0; i < elementsToMove.length; ++i) {
                    var child = elementsToMove[i];
                    target.removeChild(child);
                    newAttr.appendChild(child);
                }

                target.appendChild(newAttr);
            } else {
                target.getParent().insertChild(newAttr, target);
                target.getParent().removeChild(target);
                newAttr.appendChild(target);
            }
        }
    };

    /** @override */
    GDrawAttribute.prototype.toString = function () {
        return "[Object GDrawAttribute]";
    };

    _.GDrawAttribute = GDrawAttribute;
})(this);