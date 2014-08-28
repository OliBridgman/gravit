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
                return $('<input>')
                    .attr('type', 'checkbox')
                    .attr('data-property', property)
                    .on('change', function () {
                        self._assignProperty(property, $(this).is(':checked'));
                    });
            } else if (property === 'ir' || property === 'or') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
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
                    .gCornerType()
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else if (property === 'icr' || property === 'ocr') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
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

        panel
            .css('width', '198px')
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'left': '5px'
                })
                // TODO : I18N
                .text('Points:')
                .append(_createInput('pts')
                    .css({
                        'margin-left': '3px',
                        'width': '48px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'left': '101px'
                })
                .append(_createInput('evenodd'))
                .append($('<span></span>')
                    // TODO : I18N
                    .text(' Even/odd fill')))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '5px'
                })
                .html('<span class="fa fa-stop" style="font-size:11px;transform:rotate(45deg)"></span>')
                .append(_createInput('or')
                    .css({
                        'margin-left': '5px',
                        'width': '48px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '103px'
                })
                .html('<span class="fa fa-circle"></span>')
                .append(_createInput('ir')
                    .css({
                        'margin-left': '3px',
                        'width': '48px'
                    })))
            .append($('<hr>')
                .css({
                    'position': 'absolute',
                    'left': '0px',
                    'right': '0px',
                    'top': '50px'
                }))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '65px',
                    'left': '5px'
                })
                .html('<span class="fa fa-rotate-right"></span>')
                .append(_createInput('oa')
                    .css({
                        'margin-left': '5px',
                        'width': '48px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '65px',
                    'left': '103px'
                })
                .html('<span class="fa fa-rotate-right" style="visibility: hidden"></span>')
                .append(_createInput('ia')
                    .css({
                        'margin-left': '3px',
                        'width': '48px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '90px',
                    'left': '5px'
                })
                .html('<span class="fa fa-square"></span>')
                .append(_createInput('ocr')
                    .css({
                        'margin-left': '5px',
                        'width': '38px'
                    }))
                .append(_createInput('oct')
                    .css('width', '32px')))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '89px',
                    'left': '103px'
                })
                .html('<span class="fa fa-square" style="visibility: hidden"></span>')
                .append(_createInput('icr')
                    .css({
                        'margin-left': '3px',
                        'width': '38px'
                    }))
                .append(_createInput('ict')
                    .css('width', '32px')));
    };

    /** @override */
    GPolygonProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._document.getScene().removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
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