(function (_) {

    /**
     * Polygon properties panel
     * @class GPolygonProperties
     * @extends GProperties
     * @constructor
     */
    function GPolygonProperties() {
        this._polygons = [];
    };
    IFObject.inherit(GPolygonProperties, GProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GPolygonProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GPolygonProperties.prototype._document = null;

    /**
     * @type {Array<IFPolygon>}
     * @private
     */
    GPolygonProperties.prototype._polygons = null;

    /** @override */
    GPolygonProperties.prototype.getCategory = function () {
        // TODO : I18N
        return 'Polygon';
    };

    /** @override */
    GPolygonProperties.prototype.init = function (panel, controls) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === 'pts') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', 'pts')
                    .css('width', '3em')
                    .on('change', function () {
                        var points = parseInt($(this).val());
                        if (!isNaN(points)) {
                            var innerAngle = ifMath.normalizeAngleRadians(
                                self._polygons[0].getProperty('oa') + Math.PI / points);

                            self._assignProperties([property, 'ia'],
                                [ifMath.normalizeValue(points, 2, 360), innerAngle]);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'evenodd') {
                return $('<div></div>')
                    .css('width', '6em')
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
                                'data-on': 'Even Fill',
                                'data-off': 'Odd Fill'
                            })));
            } else if (property === 'ir' || property === 'or') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '5em')
                    .on('change', function () {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value >= 0) {
                            self._assignProperty(property, value);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'ia' || property === 'oa') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '4em')
                    .on('change', function () {
                        var angle = IFLength.parseEquationValue($(this).val());
                        if (angle !== null) {
                            angle = ifMath.normalizeAngleRadians(ifMath.toRadians(angle));
                            self._assignProperty(property, ifMath.PI2 - angle);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else if (property === 'ict' || property === 'oct') {
                return $('<select></select>')
                    .attr('data-property', property)
                    .css('width', '6em')
                    .gCornerType()
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else if (property === 'icr' || property === 'ocr') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '4em')
                    .on('change', function (evt) {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value >= 0) {
                            self._assignProperty(property, value < 0 ? 0 : value);
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
                    .text('Points:'))
                .append($('<td></td>')
                    .append(_createInput('pts')))
                .append($('<td></td>')
                    .html('&nbsp;'))
                .append($('<td></td>')
                    .append(_createInput('evenodd'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', 4)
                    .append($('<hr>'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Radius:'))
                .append($('<td></td>')
                    .append(_createInput('or')
                        // TODO : I18N
                        .attr('title', 'Outside Radius')))
                .append($('<td></td>')
                    .addClass('label')
                    .html('<i class="fa fa-circle"></i>'))
                .append($('<td></td>')
                    .append(_createInput('ir')
                        // TODO : I18N
                        .attr('title', 'Inside Radius'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Angle:'))
                .append($('<td></td>')
                    .append(_createInput('oa')
                        // TODO : I18N
                        .attr('title', 'Outside Angle')))
                .append($('<td></td>')
                    .addClass('label')
                    .html('&nbsp;'))
                .append($('<td></td>')
                    .append(_createInput('ia')
                        // TODO : I18N
                        .attr('title', 'Inside Angle'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', 4)
                    .append($('<hr>'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    .text('Corner:'))
                .append($('<td></td>')
                    .append(_createInput('oct')
                        // TODO : I18N
                        .attr('title', 'Outside Corner-Type')))
                .append($('<td></td>')
                    .addClass('label')
                    .html('<i class="fa fa-circle"></i>'))
                .append($('<td></td>')
                    .append(_createInput('ict')
                        // TODO : I18N
                        .attr('title', 'Inside Corner-Type'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Smooth:'))
                .append($('<td></td>')
                    .append(_createInput('ocr')
                        // TODO : I18N
                        .attr('title', 'Outside Corner-Smoothness')))
                .append($('<td></td>')
                    .addClass('label')
                    .html('&nbsp;'))
                .append($('<td></td>')
                    .append(_createInput('icr')
                        // TODO : I18N
                        .attr('title', 'Inside Corner-Smoothness'))))
            .appendTo(panel);
    };

    /** @override */
    GPolygonProperties.prototype.updateFromNode = function (document, elements, node) {
        if (this._document) {
            this._document.getScene().removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
        }

        // We'll work on elements, only
        if (node) {
            return false;
        }

        // Collect all polygon elements
        this._polygons = [];
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i] instanceof IFPolygon) {
                this._polygons.push(elements[i]);
            }
        }

        if (this._polygons.length === elements.length) {
            this._document = document;
            this._document.getScene().addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
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
    GPolygonProperties.prototype._afterPropertiesChange = function (event) {
        // If properties of first polygon has changed then update ourself
        if (this._polygons.length > 0 && this._polygons[0] === event.node) {
            this._updateProperties();
        }
    };

    /**
     * @private
     */
    GPolygonProperties.prototype._updateProperties = function () {
        // We'll always read properties of first polygon
        var polygon = this._polygons[0];
        this._panel.find('input[data-property="pts"]').val(polygon.getProperty('pts'));
        this._panel.find('input[data-property="evenodd"]').prop('checked', polygon.getProperty('evenodd'));
        this._panel.find('input[data-property="or"]').val(
            this._document.getScene().pointToString(polygon.getProperty('or')));
        this._panel.find('input[data-property="ir"]').val(
            this._document.getScene().pointToString(polygon.getProperty('ir')));
        this._panel.find('input[data-property="oa"]').val(
            ifUtil.formatNumber(ifMath.toDegrees(ifMath.PI2 - polygon.getProperty('oa')), 2));
        this._panel.find('input[data-property="ia"]').val(
            ifUtil.formatNumber(ifMath.toDegrees(ifMath.PI2 - polygon.getProperty('ia')), 2));
        this._panel.find('select[data-property="oct"]').val(polygon.getProperty('oct'));
        this._panel.find('select[data-property="ict"]').val(polygon.getProperty('ict'));
        this._panel.find('input[data-property="ocr"]').val(
            this._document.getScene().pointToString(polygon.getProperty('ocr')));
        this._panel.find('input[data-property="icr"]').val(
            this._document.getScene().pointToString(polygon.getProperty('icr')));
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GPolygonProperties.prototype._assignProperty = function (property, value) {
        this._assignProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GPolygonProperties.prototype._assignProperties = function (properties, values) {
        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            for (var i = 0; i < this._polygons.length; ++i) {
                this._polygons[i].setProperties(properties, values);
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Modify Polygon Properties');
        }
    };

    /** @override */
    GPolygonProperties.prototype.toString = function () {
        return "[Object GPolygonProperties]";
    };

    _.GPolygonProperties = GPolygonProperties;
})(this);