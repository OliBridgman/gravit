(function (_) {
    /**
     * Style settings dialog
     * @class GStyleDialog
     * @param {GStyle} style the style this dialog works on
     * @constructor
     */
    function GStyleDialog(style) {
        this._style = style;
    };

    /**
     * @type {GStyle}
     * @private
     */
    GStyleDialog.prototype._style = null;

    /**
     * Open this dialog
     * @param {Function(result, assign)} callback called when the dialog got closed with
     * a boolean parameter defining whether it was canceled (false) or not (true).
     * Note that you must call the assign function to ensure the changes get
     * actually assigned to the style.
     */
    GStyleDialog.prototype.open = function (callback) {
        var propertySets = this._style.getProperty('ps');

        var _createPropertyInput = function (propertySet) {
            var title = "";

            // TODO : I18N
            switch (propertySet) {
                case GStylable.PropertySet.Style:
                    title = "Style Settings";
                    break;
                case GStylable.PropertySet.Effects:
                    title = "Effects";
                    break;
                case GStylable.PropertySet.Fill:
                    title = "Fill";
                    break;
                case GStylable.PropertySet.Border:
                    title = "Border";
                    break;
                case GStylable.PropertySet.Text:
                    title = "Text";
                    break;
                case GStylable.PropertySet.Paragraph:
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
                    .append(_createPropertyInput(GStylable.PropertySet.Style))
                    .append(_createPropertyInput(GStylable.PropertySet.Effects))
                    .append('<br/>')
                    .append(_createPropertyInput(GStylable.PropertySet.Fill))
                    .append(_createPropertyInput(GStylable.PropertySet.Border))
                    .append('<br/>')
                    .append(_createPropertyInput(GStylable.PropertySet.Text))
                    .append(_createPropertyInput(GStylable.PropertySet.Paragraph))));

        vex.dialog.open({
            input: form,
            message: '',
            callback: function (data) {
                var assign = function () {
                    var ps = [];
                    for (var propertySet in GStylable.PropertySet) {
                        var propertySetVal = GStylable.PropertySet[propertySet];
                        if (form.find('[data-property-set="' + propertySetVal + '"]').is(':checked')) {
                            ps.push(propertySetVal);
                        }
                    }

                    this._style.setProperties(['name', 'ps'], [form.find('[data-property="name"]').val(), ps]);
                }.bind(this)

                if (callback) {
                    callback(!!data, assign);
                }
            }.bind(this)
        })
    };

    _.GStyleDialog = GStyleDialog;
})(this);
