(function (_) {

    /**
     * Shadow attribute
     * @class GShadowAttribute
     * @extends GDrawAttribute
     * @constructor
     */
    function GShadowAttribute() {
    };
    IFObject.inherit(GShadowAttribute, GDrawAttribute);

    /**
     * @type {JQuery}
     * @private
     */
    GShadowAttribute.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GShadowAttribute.prototype._document = null;

    /**
     * @type {GAttribute}
     * @private
     */
    GShadowAttribute.prototype._attribute = null;

    /**
     * @type {Function}
     * @private
     */
    GShadowAttribute.prototype._assign = null;

    /** @override */
    GShadowAttribute.prototype.getAttributeClass = function () {
        return IFShadowAttribute;
    };

    /** @override */
    GShadowAttribute.prototype.init = function (panel) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === 'x' || property === 'y' || property === 'r') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '5em')
                    .gAutoBlur()
                    .on('change', function () {
                        // TODO
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number') {
                            self._assign([property], [value]);
                        } else {
                            self.updateFromAttribute(self._document, self._attribute, self._assign);
                        }
                    });
            } else if (property === 'cls') {
                return $('<button></button>')
                    .attr('data-property', property)
                    .gColorButton({
                        clearColor: true
                    })
                    .on('change', function (evt, color) {
                        self._assign([property], [color]);
                    }.bind(this));
            } else if (property === 'ko') {
                return $('<label></label>')
                    .append($('<input>')
                        .attr('type', 'checkbox')
                        .attr('data-property', property)
                        .on('change', function () {
                            self._assign([property], [$(this).is(':checked')]);
                        }))
                    .append($('<span></span>')
                        // TODO : I18N
                        .html('&nbsp;Knock-out'))
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
                    .text('X:'))
                .append($('<td></td>')
                    .append(_createInput('x')))
                .append($('<td></td>')
                    .addClass('label')
                    .text('Y:'))
                .append($('<td></td>')
                    .append(_createInput('y'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    .text('Radius:'))
                .append($('<td></td>')
                    .append(_createInput('r')))
                .append($('<td></td>')
                    .addClass('label')
                    .text('Color:'))
                .append($('<td></td>')
                    .append(_createInput('cls'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    .html('&nbsp;'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('ko'))))
            .appendTo(panel);
    };

    /** @override */
    GShadowAttribute.prototype.updateFromAttribute = function (document, attribute, assign) {
        this._document = document;
        this._attribute = attribute;
        this._assign = assign;

        this._panel.find('input[data-property="x"]').val(
            this._document.getScene().pointToString(attribute.getProperty('x')));
        this._panel.find('input[data-property="y"]').val(
            this._document.getScene().pointToString(attribute.getProperty('y')));
        this._panel.find('input[data-property="r"]').val(
            this._document.getScene().pointToString(attribute.getProperty('r')));
        this._panel.find('[data-property="cls"]').gColorButton('value', attribute.getProperty('cls'));
        this._panel.find('input[data-property="ko"]').prop('checked', attribute.getProperty('ko'));
    };

    /** @override */
    GShadowAttribute.prototype.toString = function () {
        return "[Object GShadowAttribute]";
    };

    _.GShadowAttribute = GShadowAttribute;
})(this);