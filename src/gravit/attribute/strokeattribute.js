(function (_) {

    /**
     * Stroke attribute
     * @class GStrokeAttribute
     * @extends GPatternAttribute
     * @constructor
     */
    function GStrokeAttribute() {
        GPatternAttribute.call(this);
    };
    GObject.inherit(GStrokeAttribute, GPatternAttribute);

    /** @override */
    GStrokeAttribute.prototype.getAttributeClass = function () {
        return IFStrokeAttribute;
    };

    /** @override */
    GStrokeAttribute.prototype.isCreateable = function () {
        return true;
    };

    /** @override */
    GStrokeAttribute.prototype.init = function (panel) {
        GPatternAttribute.prototype.init.call(this, panel);

        var _createInput = function (property) {
            var self = this;
            if (property === 'sw') {
                return $('<input>')
                    .attr('data-property', property)
                    .attr('type', 'text')
                    .css('width', '3em')
                    .gAutoBlur()
                    .on('change', function () {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (!isNaN(value)) {
                            self._assign([property], [value]);
                        } else {
                            self.updateFromAttribute(self._document, self._attribute, self._assign);
                        }
                    })
            } else if (property === 'sa') {
                return $('<select></select>')
                    .attr('data-property', property)
                    .append($('<option></option>')
                        .attr('value', IFStrokeAttribute.Alignment.Center)
                        // TODO : I18N
                        .text('Center'))
                    .append($('<option></option>')
                        .attr('value', IFStrokeAttribute.Alignment.Inside)
                        // TODO : I18N
                        .text('Inside'))
                    .append($('<option></option>')
                        .attr('value', IFStrokeAttribute.Alignment.Outside)
                        // TODO : I18N
                        .text('Outside'))
                    .on('change', function () {
                        self._assign([property], [$(this).val()]);
                    });
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        panel.find('.g-form')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', '4')
                    .append($('<hr>'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    .text('Width:'))
                .append($('<td></td>')
                    .append(_createInput('sw')))
                .append($('<td></td>')
                    .addClass('label')
                    .text('Align:'))
                .append($('<td></td>')
                    .append(_createInput('sa'))));
    };

    /** @override */
    GStrokeAttribute.prototype.updateFromAttribute = function (document, attribute, assign) {
        GPatternAttribute.prototype.updateFromAttribute.call(this, document, attribute, assign);

        this._panel.find('input[data-property="sw"]').val(document.getScene().pointToString(attribute.getProperty('sw')));
        this._panel.find('select[data-property="sa"]').val(attribute.getProperty('sa'));
    };

    /** @override */
    GStrokeAttribute.prototype.toString = function () {
        return "[Object GStrokeAttribute]";
    };

    _.GStrokeAttribute = GStrokeAttribute;
})(this);