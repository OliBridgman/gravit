(function (_) {

    /**
     * Blur attribute
     * @class GBlurAttribute
     * @extends GDrawAttribute
     * @constructor
     */
    function GBlurAttribute() {
        GDrawAttribute.call(this);
    };
    IFObject.inherit(GBlurAttribute, GDrawAttribute);

    /** @override */
    GBlurAttribute.prototype.getAttributeClass = function () {
        return IFBlurAttribute;
    };

    /** @override */
    GBlurAttribute.prototype.init = function (panel) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === 'r') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '5em')
                    .gAutoBlur()
                    .on('change', function () {
                        // TODO
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value > 0) {
                            self._assign([property], [value]);
                        } else {
                            self.updateFromAttribute(self._document, self._attribute, self._assign);
                        }
                    });
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        $('<table></table>')
            .addClass('g-form')
            .css('width', '100%')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    .text('Radius:'))
                .append($('<td></td>')
                    .append(_createInput('r'))))
            .appendTo(panel);
    };

    /** @override */
    GBlurAttribute.prototype.updateFromAttribute = function (document, attribute, assign) {
        this._document = document;
        this._attribute = attribute;
        this._assign = assign;

        this._panel.find('input[data-property="r"]').val(
            this._document.getScene().pointToString(attribute.getProperty('r')));
    };

    /** @override */
    GBlurAttribute.prototype.toString = function () {
        return "[Object GBlurAttribute]";
    };

    _.GBlurAttribute = GBlurAttribute;
})(this);