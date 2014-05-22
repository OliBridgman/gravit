(function (_) {

    /**
     * Text properties panel
     * @class GTextProperties
     * @extends EXProperties
     * @constructor
     */
    function GTextProperties() {
        this._text = [];
    };
    GObject.inherit(GTextProperties, EXProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GTextProperties.prototype._panel = null;

    /**
     * @type {EXDocument}
     * @private
     */
    GTextProperties.prototype._document = null;

    /**
     * @type {Array<GXText>}
     * @private
     */
    GTextProperties.prototype._text = null;

    /** @override */
    GTextProperties.prototype.getCategory = function () {
        // TODO : I18N
        return 'Text';
    };

    /** @override */
    GTextProperties.prototype.init = function (panel, controls) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === 'etp') {
                return $('<select></select>')
                    .attr('data-property', 'etp')
                    .css('width', '100%')
                    .append($('<option></option>')
                        .attr('value', GXEllipse.Type.Arc)
                        // TODO : I18N
                        .text('Arc'))
                    .append($('<option></option>')
                        .attr('value', GXEllipse.Type.Chord)
                        // TODO : I18N
                        .text('Chord'))
                    .append($('<option></option>')
                        .attr('value', GXEllipse.Type.Pie)
                        // TODO : I18N
                        .text('Pie'))
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else if (property === 'fi') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '4em')
                    .gAutoBlur()
                    .on('change', function () {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value >= 0) {
                            self._assignProperty(property, value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'lh') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '4em')
                    .gAutoBlur()
                    .on('change', function () {
                        var value = $(this).val();
                        value = !value || value === "" ? null : parseFloat(value);
                        if (value === null || (!isNaN(value) && value > 0)) {
                            self._assignProperty(property, value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        $('<div>Text Properties</div>')
            .appendTo(panel);

        $('<table></table>')
            .addClass('g-form')
            .css('margin', '0px auto')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Size:'))
                .append($('<td></td>')
                    .append(_createInput('fi')))
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Line:'))
                .append($('<td></td>')
                    .append(_createInput('lh'))))
            .appendTo(panel);
    };

    /** @override */
    GTextProperties.prototype.updateFromNode = function (document, elements, node) {
        if (this._document) {
            this._document.getScene().removeEventListener(GXNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
        }

        if (this._text) {
            for (var i = 0; i < this._text.length; ++i) {
                var textEditor = GXElementEditor.getEditor(this._text[0]);
                textEditor.removeEventListener(GXTextEditor.SelectionChangedEvent, this._updateProperties);
            }
        }

        // We'll work on elements, only
        if (node) {
            return false;
        }

        // Collect all text elements
        this._text = [];
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i] instanceof GXText) {
                this._text.push(elements[i]);
            }
        }

        if (this._text.length === elements.length) {
            this._document = document;
            this._document.getScene().addEventListener(GXNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._updateProperties();

            if (this._text) {
                for (var i = 0; i < this._text.length; ++i) {
                    var textEditor = GXElementEditor.getEditor(this._text[0]);
                    textEditor.addEventListener(GXTextEditor.SelectionChangedEvent, this._updateProperties, this);
                }
            }

            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {GXNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GTextProperties.prototype._afterPropertiesChange = function (event) {
        // If properties of first text has changed then update ourself
        if (this._text.length > 0 && this._text[0] === event.node) {
            this._updateProperties();
        }
    };

    /**
     * Defaults to false.
     * @private
     */
    GTextProperties.prototype._updateProperties = function () {
        // We'll always read properties of first text
        var text = this._text[0];
        var textEditor = GXElementEditor.getEditor(text);

        this._panel.find('input[data-property="fi"]').val(
            this._document.getScene().pointToString(textEditor.getProperty('fi')));

        var lh = textEditor.getProperty('lh');
        this._panel.find('input[data-property="lh"]').val(lh !== null ? lh.toString().replace('.', ',') : "");
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GTextProperties.prototype._assignProperty = function (property, value) {
        this._assignProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GTextProperties.prototype._assignProperties = function (properties, values) {
        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            for (var i = 0; i < this._text.length; ++i) {
                var textEditor = GXElementEditor.getEditor(this._text[i]);
                textEditor.setProperties(properties, values);
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Modify Text Properties');
        }
    };

    /** @override */
    GTextProperties.prototype.toString = function () {
        return "[Object GTextProperties]";
    };

    _.GTextProperties = GTextProperties;
})(this);