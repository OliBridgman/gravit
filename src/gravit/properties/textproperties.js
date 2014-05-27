(function (_) {

    /**
     * Text properties panel
     * @class GTextProperties
     * @extends GProperties
     * @constructor
     */
    function GTextProperties() {
        this._text = [];
    };
    IFObject.inherit(GTextProperties, GProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GTextProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GTextProperties.prototype._document = null;

    /**
     * @type {Array<IFText>}
     * @private
     */
    GTextProperties.prototype._text = null;

    /**
     * @type {IFTextEditor}
     * @private
     */
    GTextProperties.prototype._textEditor = null;

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
            if (property === 'ff') {
                var select = $('<select></select>')
                    .css('width', '100%')
                    .attr('data-property', property)
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });

                // Add typefaces
                var families = ifFont.getFamilies();
                for (var i = 0; i < families.length; ++i) {
                    $('<option></option>')
                        .attr('value', families[i])
                        .text(families[i])
                        .appendTo(select);
                }

                return select;
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
                        value = !value || value === "" ? null : IFLength.parseEquationValue(value);
                        if (value === null || value > 0) {
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
                    .text('Face:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('ff'))))
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
            this._document.getScene().removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document.getEditor().removeEventListener(IFEditor.InlineEditorEvent, this._inlineEditorEvent);
            this._document = null;
        }

        // We'll work on elements, only
        if (node) {
            return false;
        }

        // Collect all text elements
        this._text = [];
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i] instanceof IFText) {
                this._text.push(elements[i]);
            }
        }

        if (this._text.length === elements.length) {
            this._document = document;
            this._document.getScene().addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._document.getEditor().addEventListener(IFEditor.InlineEditorEvent, this._inlineEditorEvent, this);
            this._updateProperties();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {IFNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GTextProperties.prototype._afterPropertiesChange = function (event) {
        // If properties of first text has changed then update ourself
        if (this._text.length > 0 && this._text[0] === event.node) {
            this._updateProperties();
        }
    };

    /**
     * @param {IFEditor.InlineEditorEvent} event
     * @private
     */
    GTextProperties.prototype._inlineEditorEvent = function (event) {
        switch (event.type) {
            case IFEditor.InlineEditorEvent.Type.AfterOpen:
                this._textEditor = event.editor;
                this._updateProperties();
                break;
            case IFEditor.InlineEditorEvent.Type.BeforeClose:
                this._textEditor = null;
                this._updateProperties();
                break;
            case IFEditor.InlineEditorEvent.Type.SelectionChanged:
                this._updateProperties();
                break;
            default:
                break;
        }
    };

    /**
     * Defaults to false.
     * @private
     */
    GTextProperties.prototype._updateProperties = function () {
        // Read properties from active editor or first text' editor
        var propertySource = this._textEditor ? this._textEditor : IFElementEditor.getEditor(this._text[0]);

        this._panel.find('input[data-property="fi"]').val(
            this._document.getScene().pointToString(propertySource.getProperty('fi')));

        var lh = propertySource.getProperty('lh');
        this._panel.find('input[data-property="lh"]').val(lh !== null ? gUtil.formatNumber(lh) : "");
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
        if (this._textEditor) {
            this._textEditor.setProperties(properties, values);
        } else {
            var editor = this._document.getEditor();
            editor.beginTransaction();
            try {
                for (var i = 0; i < this._text.length; ++i) {
                    var textEditor = IFElementEditor.getEditor(this._text[i]);
                    textEditor.setProperties(properties, values);
                }
            } finally {
                // TODO : I18N
                editor.commitTransaction('Modify Text Properties');
            }
        }
    };

    /** @override */
    GTextProperties.prototype.toString = function () {
        return "[Object GTextProperties]";
    };

    _.GTextProperties = GTextProperties;
})(this);