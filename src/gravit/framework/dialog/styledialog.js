(function (_) {
    /**
     * Style settings dialog
     * @class GStyleDialog
     * @param {IFStyle} style the style this dialog works on
     * @constructor
     */
    function GStyleDialog(style) {
        this._style = style;
    };

    /**
     * @type {IFStyle}
     * @private
     */
    GStyleDialog.prototype._style = null;

    /**
     * Open this dialog
     * @param {Function} callback called when the dialog got closed with
     * a boolean parameter defining whether it was canceled (false) or not (true)
     */
    GStyleDialog.prototype.open = function (callback) {
        var propertySets = this._style.getProperty('ps');

        var _createPropertyInput = function (propertySet) {
            var title = "";

            // TODO : I18N
            switch (propertySet) {
                case IFStyleDefinition.PropertySet.Style:
                    title = "Style Settings";
                    break;
                case IFStyleDefinition.PropertySet.Effects:
                    title = "Effects";
                    break;
                case IFStyleDefinition.PropertySet.Fill:
                    title = "Fill";
                    break;
                case IFStyleDefinition.PropertySet.Border:
                    title = "Border";
                    break;
                case IFStyleDefinition.PropertySet.Text:
                    title = "Text";
                    break;
                case IFStyleDefinition.PropertySet.Paragraph:
                    title = "Paragraph";
                    break;
            }

            return $('<label></label>')
                .css({
                    'display': 'inline-block',
                    'width': '100px'
                })
                .append($('<input>')
                    .attr('type', 'checkbox')
                    .attr('data-property-set', propertySet)
                    .prop('checked', propertySets.indexOf(propertySet) >= 0))
                .append($('<span></span>')
                    .text(title));
        };

        var form = $('<table></table>')
            .addClass('g-form')
            .css({
                //'width:': '350px'
            })
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Style Name:'))
                .append($('<td></td>')
                    .append($('<input>')
                        .attr('data-property', 'name')
                        .css('width', '100%')
                        .val(this._style.getProperty('name')))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Properties:'))
                .append($('<td></td>')
                    .append(_createPropertyInput(IFStyleDefinition.PropertySet.Style))
                    .append(_createPropertyInput(IFStyleDefinition.PropertySet.Effects))
                    .append('<br/>')
                    .append(_createPropertyInput(IFStyleDefinition.PropertySet.Fill))
                    .append(_createPropertyInput(IFStyleDefinition.PropertySet.Border))
                    .append('<br/>')
                    .append(_createPropertyInput(IFStyleDefinition.PropertySet.Text))
                    .append(_createPropertyInput(IFStyleDefinition.PropertySet.Paragraph))));

        vex.dialog.open({
            input: form,
            message: '',
            callback: function (data) {
                if (data) {
                    var ps = [];
                    for (var propertySet in IFStyleDefinition.PropertySet) {
                        if (form.find('[data-property-set="' + propertySet + '"]').is(':checked')) {
                            ps.push(propertySet);
                        }
                    }

                    this._style.setProperties(['name', 'ps'], [form.find('[data-property="name"]').val(), ps]);
                }

                if (callback) {
                    callback(!!data);
                }
            }.bind(this)
        })
    };

    _.GStyleDialog = GStyleDialog;
})(this);
