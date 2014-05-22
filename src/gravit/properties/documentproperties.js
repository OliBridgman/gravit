(function (_) {

    /**
     * Document properties panel
     * @class GDocumentProperties
     * @extends EXProperties
     * @constructor
     */
    function GDocumentProperties() {
    };
    GObject.inherit(GDocumentProperties, EXProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GDocumentProperties.prototype._panel = null;

    /**
     * @type {EXDocument}
     * @private
     */
    GDocumentProperties.prototype._document = null;

    /** @override */
    GDocumentProperties.prototype.getCategory = function () {
        // TODO : I18N
        return 'Document';
    };

    /** @override */
    GDocumentProperties.prototype.init = function (panel, controls) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === 'unit') {
                return $('<select></select>')
                    .attr('data-property', property)
                    .css('width', '100%')
                    .gUnit()
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else if (property === 'gridSizeX' || property === 'gridSizeY') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '3em')
                    .gAutoBlur()
                    .on('change', function () {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value >= 1) {
                            self._assignProperty(property, value < 0 ? 0 : value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'gridActive') {
                return $('<label></label>')
                    .append($('<input>')
                        .attr('type', 'checkbox')
                        .attr('data-property', property)
                        .on('change', function () {
                            self._assignProperty(property, $(this).is(':checked'));
                        }))
                    .append($('<span></span>')
                        // TODO : I18N
                        .html('&nbsp;Active'))
            } else if (property === 'crDistSmall' || property === 'crDistBig') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '3em')
                    .gAutoBlur()
                    .on('change', function () {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value >= 1) {
                            self._assignProperty(property, value < 0 ? 0 : value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'crConstraint') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '3em')
                    .gAutoBlur()
                    .on('change', function () {
                        var angle = GXLength.parseEquationValue($(this).val());
                        if (angle !== null) {
                            angle = gMath.normalizeAngleRadians(gMath.toRadians(angle));
                            self._assignProperty(property, angle);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'snapDist' || property === 'pickDist') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '3em')
                    .gAutoBlur()
                    .on('change', function () {
                        var value = parseInt($(this).val());
                        if (!isNaN(value)) {
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
                    .text('Unit:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('unit'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', 4)
                    .append($('<h1></h1>')
                        .addClass('g-divider')
                        // TODO : I18N
                        .text('Grid'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Size:'))
                .append($('<td></td>')
                    .append(_createInput('gridSizeX')
                        .css('margin-right', '3px')
                        // TODO : I18N
                        .attr('title', 'Horizontal Grid-Size'))
                    .append(_createInput('gridSizeY')
                        // TODO : I18N
                        .attr('title', 'Vertical Grid-Size')))
                .append($('<td></td>')
                    .attr('colspan', '2')
                    .css('text-align', 'right')
                    .append(_createInput('gridActive'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', 4)
                    .append($('<h1></h1>')
                        .addClass('g-divider')
                        // TODO : I18N
                        .text('Cursor & Distances'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Cursor:'))
                .append($('<td></td>')
                    .append(_createInput('crDistSmall')
                        .css('margin-right', '3px')
                        // TODO : I18N
                        .attr('title', 'Small Distance when moving via Arrow-Keys'))
                    .append(_createInput('crDistBig')
                        // TODO : I18N
                        .attr('title', 'Large Distance when moving via Arrow-Keys')))
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('°'))
                .append($('<td></td>')
                    .append(_createInput('crConstraint')
                        // TODO : I18N
                        .attr('title', 'Constraints when moving via Shift in Degrees'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .html('<span class="fa fa-arrows"></span> / <span class="fa fa-magnet"></span>'))
                .append($('<td></td>')
                    .attr('colspan', '4')
                    .append(_createInput('pickDist')
                        // TODO : I18N
                        .attr('title', 'Pick Distance in Pixels')
                        .css('margin-right', '3px'))
                    .append(_createInput('snapDist')
                        // TODO : I18N
                        .attr('title', 'Snap Distance in Pixels'))))
            .appendTo(panel);
    };

    /** @override */
    GDocumentProperties.prototype.updateFromNode = function (document, elements, node) {
        if (this._document) {
            this._document.getScene().removeEventListener(GXNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
        }

        // We'll work on elements, only
        if (node) {
            return false;
        }

        if (elements.length === 1 && elements[0] instanceof GXScene) {
            this._document = document;
            this._document.getScene().addEventListener(GXNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._updateProperties();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {GXNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GDocumentProperties.prototype._afterPropertiesChange = function (event) {
        if (event.node === this._document.getScene()) {
            this._updateProperties();
        }
    };

    /**
     * @private
     */
    GDocumentProperties.prototype._updateProperties = function () {
        var scene = this._document.getScene();
        this._panel.find('select[data-property="unit"]').val(scene.getProperty('unit'));
        this._panel.find('input[data-property="gridSizeX"]').val(scene.pointToString(scene.getProperty('gridSizeX')));
        this._panel.find('input[data-property="gridSizeY"]').val(scene.pointToString(scene.getProperty('gridSizeY')));
        this._panel.find('input[data-property="gridActive"]').prop('checked', scene.getProperty('gridActive'));
        this._panel.find('input[data-property="crDistSmall"]').val(scene.pointToString(scene.getProperty('crDistSmall')));
        this._panel.find('input[data-property="crDistBig"]').val(scene.pointToString(scene.getProperty('crDistBig')));
        this._panel.find('input[data-property="crConstraint"]').val(
            gMath.round(gMath.toDegrees(scene.getProperty('crConstraint')), 2).toString().replace('.', ','));
        this._panel.find('input[data-property="snapDist"]').val(scene.pointToString(scene.getProperty('snapDist')));
        this._panel.find('input[data-property="pickDist"]').val(scene.pointToString(scene.getProperty('pickDist')));
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GDocumentProperties.prototype._assignProperty = function (property, value) {
        this._assignProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GDocumentProperties.prototype._assignProperties = function (properties, values) {
        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            this._document.getScene().setProperties(properties, values);
        } finally {
            // TODO : I18N
            editor.commitTransaction('Modify Document Properties');
        }
    };

    /** @override */
    GDocumentProperties.prototype.toString = function () {
        return "[Object GDocumentProperties]";
    };

    _.GDocumentProperties = GDocumentProperties;
})(this);