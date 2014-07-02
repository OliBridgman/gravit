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
            if (property === 'vb') {
                return $('<select></select>')
                    .attr('data-property', property)
                    .append($('<option></option>')
                        .attr('value', IFText.VerticalBox.Auto)
                        // TODO : I18N
                        .text('Auto'))
                    .append($('<option></option>')
                        .attr('value', IFText.VerticalBox.Fixed)
                        // TODO : I18N
                        .text('Fixed'))
                    .append($('<option></option>')
                        .attr('value', IFText.VerticalBox.Center)
                        // TODO : I18N
                        .text('Centered'))
                    .append($('<option></option>')
                        .attr('value', IFText.VerticalBox.Bottom)
                        // TODO : I18N
                        .text('Bottom'))
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else if (property === 'aw') {

                return $('<div></div>')
                    .css('width', '8em')
                    .addClass('g-switch')
                    .append($('<label></label>')
                        .append($('<input>')
                            .attr('type', 'checkbox')
                            .attr('data-property', property)
                            .on('change', function () {
                                self._assignProperty(property, $(this).is(':checked'));
                            }))
                        .append($('<span></span>')
                            .addClass('switch')
                            .attr({
                                // TODO : I18N
                                'data-on': 'Auto Width',
                                'data-off': 'Fixed Width'
                            })));
            } else if (property === 'ff') {
                var select = $('<select></select>')
                    .css('width', '100%')
                    .attr('data-property', property)
                    .append(
                        $('<option></option>')
                            .attr('value', '')
                            .text(''))
                    .on('change', function () {
                        var val = $(this).val();
                        self._assignProperty(property, val === '' ? null : val);
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
            } else if (property === 'fi' || property === 'ws' || property === 'cs' || property === 'in' || property === 'cg' ||
                property === 'mt' || property === 'mb' || property === 'ml' || property === 'mr') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '4em')
                    .on('change', function () {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value === null || (typeof value === 'number' && value >= 0)) {
                            self._assignProperty(property, value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'fw') {
                var select = $('<select></select>')
                    .attr('data-property', property)
                    .append(
                        $('<option></option>')
                            .attr('value', '')
                            .text(''))
                    .on('change', function () {
                        var val = $(this).val();
                        self._assignProperty(property, val === '' ? null : val);
                    });

                for (var i = 100; i <= 900; i += 100) {
                    $('<option></option>')
                        .attr('value', i)
                        .text(ifLocale.get(IFFont.WeightName[i]))
                        .appendTo(select);
                }

                return select;
            } else if (property === 'fs') {
                return $('<select></select>')
                    .attr('data-property', property)
                    .append($('<option></option>')
                        .attr('value', '')
                        .text(''))
                    .append($('<option></option>')
                        .attr('value', IFFont.Style.Normal)
                        // TODO : I18N
                        .text('Normal'))
                    .append($('<option></option>')
                        .attr('value', IFFont.Style.Italic)
                        // TODO : I18N
                        .text('Italic'))
                    .on('change', function () {
                        var val = $(this).val();
                        self._assignProperty(property, val === '' ? null : val);
                    });
            } else if (property === 'fc') {
                return $('<button></button>')
                    .attr('data-property', property)
                    .gColorButton({
                        allowClear: true,
                        scene: this._document.getScene()
                    })
                    .on('colorchange', function (evt, color) {
                        self._assignProperty(property, color);
                    });
            } else if (property === 'al') {
                return $('<select></select>')
                    .attr('data-property', property)
                    .append($('<option></option>')
                        .attr('value', '')
                        .text(''))
                    .append($('<option></option>')
                        .attr('value', IFText.Paragraph.Alignment.Left)
                        // TODO : I18N
                        .text('Left'))
                    .append($('<option></option>')
                        .attr('value', IFText.Paragraph.Alignment.Center)
                        // TODO : I18N
                        .text('Center'))
                    .append($('<option></option>')
                        .attr('value', IFText.Paragraph.Alignment.Right)
                        // TODO : I18N
                        .text('Right'))
                    .append($('<option></option>')
                        .attr('value', IFText.Paragraph.Alignment.Justify)
                        // TODO : I18N
                        .text('Justify'))
                    .on('change', function () {
                        var val = $(this).val();
                        self._assignProperty(property, val === '' ? null : val);
                    });
            } else if (property === 'wm') {
                return $('<select></select>')
                    .attr('data-property', property)
                    .append($('<option></option>')
                        .attr('value', '')
                        .text(''))
                    .append($('<option></option>')
                        .attr('value', IFText.Paragraph.WrapMode.None)
                        // TODO : I18N
                        .text('None'))
                    .append($('<option></option>')
                        .attr('value', IFText.Paragraph.WrapMode.Words)
                        // TODO : I18N
                        .text('Words'))
                    .append($('<option></option>')
                        .attr('value', IFText.Paragraph.WrapMode.All)
                        // TODO : I18N
                        .text('All'))
                    .on('change', function () {
                        var val = $(this).val();
                        self._assignProperty(property, val === '' ? null : val);
                    });
            } else if (property === 'lh') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '4em')
                    .on('change', function () {
                        var value = $(this).val();
                        value = !value || value === "" ? null : IFLength.parseEquationValue(value);
                        if (value === null || value > 0) {
                            self._assignProperty(property, value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'cc') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '4em')
                    .on('change', function () {
                        var value = $(this).val();
                        value = !value || value === "" ? null : parseInt(value);
                        if (value === null || value > 1) {
                            self._assignProperty(property, value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        $('<table></table>')
            .addClass('g-form')
            .css('margin', '0px auto')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Box:'))
                .append($('<td></td>')
                    .append(_createInput('vb')))
                .append($('<td></td>')
                    .attr('colspan', '2')
                    .append(_createInput('aw'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', 4)
                    .append($('<hr>'))))
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
                    .text('Style:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('fw'))
                    .append(_createInput('fs'))
                    /*.append(_createInput('fc'))*/))
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
                    .text('Space:'))
                .append($('<td></td>')
                    .append(_createInput('ws')
                        .css('width', '1.5em')
                        // TODO : I18N
                        .attr('title', 'Word Spacing'))
                    .append(_createInput('cs')
                        .css('width', '1.5em')
                        // TODO : I18N
                        .attr('title', 'Character Spacing'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', 4)
                    .append($('<h1></h1>')
                        .addClass('g-divider')
                        .text('Paragraph'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Columns:'))
                .append($('<td></td>')
                    .append(_createInput('cc')))
                .append($('<td></td>')
                    .addClass('label')
                    .text('Gap:'))
                .append($('<td></td>')
                    .append(_createInput('cg'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Align:'))
                .append($('<td></td>')
                    .append(_createInput('al')))
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Wrap:'))
                .append($('<td></td>')
                    .append(_createInput('wm'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Indent:'))
                .append($('<td></td>')
                    .append(_createInput('in')))
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Line:'))
                .append($('<td></td>')
                    .append(_createInput('lh'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', 4)
                    .append($('<hr>'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Top:'))
                .append($('<td></td>')
                    .append(_createInput('mt')))
                .append($('<td></td>')
                    .addClass('label')
                    .text('Bottom:'))
                .append($('<td></td>')
                    .append(_createInput('mb'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Left:'))
                .append($('<td></td>')
                    .append(_createInput('ml')))
                .append($('<td></td>')
                    .addClass('label')
                    .text('Right:'))
                .append($('<td></td>')
                    .append(_createInput('mr'))))
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
        if (this._text.length > 0 && (this._text[0] === event.node || this._text[0].getContent() === event.node)) {
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
            case IFEditor.InlineEditorEvent.Type.AfterClose:
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

        // Text
        this._panel.find('select[data-property="vb"]')
            .prop('disabled', this._textEditor && this._textEditor.isInlineEdit())
            .val(propertySource.getProperty('vb'));
        this._panel.find('input[data-property="aw"]')
            .prop('disabled', this._textEditor && this._textEditor.isInlineEdit())
            .prop('checked', propertySource.getProperty('aw'));

        // Text
        var fontFamily = propertySource.getProperty('ff', true);

        this._panel.find('select[data-property="ff"]').val(propertySource.getProperty('ff'));
        this._panel.find('input[data-property="fi"]')
            .val(this._document.getScene().pointToString(propertySource.getProperty('fi')));

        var weightSelect = this._panel.find('select[data-property="fw"]');
        weightSelect.val(propertySource.getProperty('fw'));
        var fontWeights = ifFont.getWeights(fontFamily);
        for (var i = 100; i <= 900; i += 100) {
            weightSelect.find('[value="' + i + '"]').prop('disabled', !fontWeights || fontWeights.indexOf(i) < 0);
        }

        var styleSelect = this._panel.find('select[data-property="fs"]');
        styleSelect.val(propertySource.getProperty('fs'));
        var fontStyles = ifFont.getStyles(fontFamily);
        styleSelect.find('option').each(function (index, option) {
            var $option = $(option);
            var value = $option.attr('value');
            if (value !== '') {
                $option.prop('disabled', fontStyles.indexOf(value) < 0);
            }
        });

        //this._panel.find('[data-property="fc"]').gColorButton('value', propertySource.getProperty('fc'));

        this._panel.find('input[data-property="ws"]').val(
            this._document.getScene().pointToString(propertySource.getProperty('ws')));
        this._panel.find('input[data-property="cs"]').val(
            this._document.getScene().pointToString(propertySource.getProperty('cs')));


        // Paragraph
        this._panel.find('input[data-property="cc"]').val(propertySource.getProperty('cc'));
        this._panel.find('input[data-property="cg"]')
            .val(this._document.getScene().pointToString(propertySource.getProperty('cg')));

        this._panel.find('select[data-property="al"]').val(propertySource.getProperty('al'));
        this._panel.find('select[data-property="wm"]').val(propertySource.getProperty('wm'));

        this._panel.find('input[data-property="in"]')
            .val(this._document.getScene().pointToString(propertySource.getProperty('in')));

        var lh = propertySource.getProperty('lh');
        this._panel.find('input[data-property="lh"]').val(lh !== null ? ifUtil.formatNumber(lh) : "");

        this._panel.find('input[data-property="mt"]')
            .val(this._document.getScene().pointToString(propertySource.getProperty('mt')));
        this._panel.find('input[data-property="mr"]')
            .val(this._document.getScene().pointToString(propertySource.getProperty('mr')));
        this._panel.find('input[data-property="mb"]')
            .val(this._document.getScene().pointToString(propertySource.getProperty('mb')));
        this._panel.find('input[data-property="ml"]')
            .val(this._document.getScene().pointToString(propertySource.getProperty('ml')));
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