(function (_) {

    /**
     * Info properties panel
     * @class GInfoProperties
     * @extends GProperties
     * @constructor
     */
    function GInfoProperties() {
        this._elements = [];
    };
    GObject.inherit(GInfoProperties, GProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GInfoProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GInfoProperties.prototype._document = null;

    /**
     * @type {Array<GElement>}
     * @private
     */
    GInfoProperties.prototype._elements = null;

    /**
     * @type {GRect}
     * @private
     */
    GInfoProperties.prototype._elementsBBox = null;

    /**
     * @type {GRect}
     * @private
     */
    GInfoProperties.prototype._firstElementsBBox = null;

    /** @override */
    GInfoProperties.prototype.init = function (panel) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;

            if (property === 'name') {
                return $('<input>')
                    .css('width', '100%')
                    .attr('data-name', '')
                    .on('change', function (evt) {
                        GEditor.tryRunTransaction(self._elements[0], function () {
                            self._elements[0].setProperty('name', $(evt.target).val());
                        }, 'Rename Element');
                    });
            }
            else if (property === 'x' || property === 'y' || property === 'w' || property === 'h') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-dimension', property)
                    .on('change', function (evt) {
                        self._assignDimension(property, $(this).val());
                    });
            }
        }.bind(this);

        panel
            .css('width', '136px')
            .append($('<div></div>')
                .addClass('g-input')
                .css({
                    'position': 'absolute',
                    'left': '5px',
                    'top': '9px',
                    'width': '41px',
                    'height': '41px'
                }))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'left': '51px',
                    'top': '5px',
                    'width': '77px',
                    'text-transform': 'uppercase'
                })
                .attr('data-type', ''))
            .append(_createInput('name')
                .css({
                    'position': 'absolute',
                    'left': '51px',
                    'top': '30px',
                    'width': '77px'
                }))
            .append($('<hr>')
                .css({
                    'position': 'absolute',
                    'left': '0px',
                    'right': '0px',
                    'top': '50px'
                }))
            .append($('<button></button>')
                .css({

                    'position': 'absolute',
                    'left': '5px',
                    'top': '77px',
                    'padding': '0px',
                    'font-size': '10px'
                })
                .on('click', function (evt) {
                    var $me = $(this);
                    $me.toggleClass('g-active', !$me.hasClass('g-active'));
                })
                .addClass('g-flat fa fa-lock')
                // TODO : I18N
                .attr('title', 'Keep Ratio')
                .attr('data-ratio', ''))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'left': '15px',
                    'top': '65px'
                })
                .text('W:')
                .append(_createInput('w')
                    .css({
                        'margin-left': '3px',
                        'width': '38px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'left': '15px',
                    'top': '89px'
                })
                .text('H:')
                .append(_createInput('h')
                    .css({
                        'margin-left': '3px',
                        'width': '38px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'left': '75px',
                    'top': '65px'
                })
                .text('X:')
                .append(_createInput('x')
                    .css({
                        'margin-left': '3px',
                        'width': '41px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'left': '75px',
                    'top': '89px'
                })
                .text('Y:')
                .append(_createInput('y')
                    .css({
                        'margin-left': '3px',
                        'width': '41px'
                    })));
    };

    /** @override */
    GInfoProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._document.getScene().removeEventListener(GElement.GeometryChangeEvent, this._geometryChange, this);
            this._document.getScene().removeEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._document = null;
        }

        // Collect all transformable elements
        this._elements = elements.slice();

        if (this._elements.length > 0) {
            this._document = document;
            this._document.getScene().addEventListener(GElement.GeometryChangeEvent, this._geometryChange, this);
            this._document.getScene().addEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._updateProperties();
            this._updateDimensions();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {GElement.GeometryChangeEvent} event
     * @private
     */
    GInfoProperties.prototype._geometryChange = function (event) {
        if ((event.type === GElement.GeometryChangeEvent.Type.After) ||
            (event.type === GElement.GeometryChangeEvent.Type.Child))
            if (this._elements.indexOf(event.element) >= 0) {
                this._updateDimensions();
            }
    };

    /**
     * @param {GElement.GeometryChangeEvent} event
     * @private
     */
    GInfoProperties.prototype._afterPropertiesChange = function (event) {
        if (this._elements && this._elements.length === 1 && this._elements[0] === event.node && event.properties.indexOf('name') >= 0) {
            this._updateProperties();
        }
    };

    /** @private */
    GInfoProperties.prototype._updateProperties = function () {
        this._panel.find('input[data-apply]').css('display', this._elements.length <= 1 ? 'none' : '');

        this._panel.find('label[data-type]')
            .text(this._elements.length === 1 ? this._elements[0].getNodeNameTranslated() : (this._elements.length.toString() + ' Elements'))

        this._panel.find('input[data-name]')
            .css('visibility', this._elements.length === 1 && this._elements[0] instanceof GBlock ? 'visible' : 'hidden')
            .val(this._elements.length === 1 && this._elements[0] instanceof GBlock ? this._elements[0].getLabel() : '');
    };

    /**
     * @param {Boolean} [noBBoxCalculation] if set, do not recalculate all element's bbox.
     * Defaults to false.
     * @private
     */
    GInfoProperties.prototype._updateDimensions = function (noBBoxCalculation) {
        var _updateDimension = function (dimension, value) {
            this._panel.find('input[data-dimension="' + dimension + '"]')
                .val(value !== null ? this._document.getScene().pointToString(value) : '')
            /** !! */
                .parents('label')
                .css('display', value === null ? 'none' : '');
        }.bind(this);

        if (!noBBoxCalculation) {
            this._elementsBBox = null;
            this._firstElementsBBox = null;
            for (var i = 0; i < this._elements.length; ++i) {
                if (this._elements[i].hasMixin(GElement.Transform)) {
                    var bbox = this._elements[i].getGeometryBBox();
                    if (bbox && !bbox.isEmpty()) {
                        this._elementsBBox = this._elementsBBox ? this._elementsBBox.united(bbox) : bbox;

                        if (!this._firstElementsBBox) {
                            this._firstElementsBBox = bbox;
                        }
                    }
                }
            }

            if (!this._elementsBBox) {
                this._elementsBBox = null;
                this._firstElementsBBox = this._elementsBBox;
            }
        }

        if (!this._firstElementsBBox) {
            this._panel.find('button[data-ratio]').css('display', 'none');
            _updateDimension('x', null);
            _updateDimension('y', null);
            _updateDimension('w', null);
            _updateDimension('h', null);
        } else {
            var applyToSelection = true;// TODO : this._elements.length > 1 && this._panel.find('input[data-apply]').is(':checked');
            var delta = this._getDelta();

            this._panel.find('button[data-ratio]').css('display', '');
            if (applyToSelection) {
                _updateDimension('x', this._elementsBBox.getX() - delta.getX());
                _updateDimension('y', this._elementsBBox.getY() - delta.getY());
                _updateDimension('w', this._elementsBBox.getWidth());
                _updateDimension('h', this._elementsBBox.getHeight());
            } else {
                _updateDimension('x', this._firstElementsBBox.getX() - delta.getX());
                _updateDimension('y', this._firstElementsBBox.getY() - delta.getY());
                _updateDimension('w', this._firstElementsBBox.getWidth());
                _updateDimension('h', this._firstElementsBBox.getHeight());
            }
        }
    };

    /**
     * @private
     */
    GInfoProperties.prototype._assignDimension = function (dimension, valueString) {
        var value = this._document.getScene().stringToPoint(valueString);

        // Check for invalid value and if it is invalid, reset dimension values and return here
        if (value === null || typeof value !== 'number' || ((dimension === 'w' || dimension == 'h') && value <= 0)) {
            this._updateDimensions();
            return;
        }

        // Correct x,y for delta if any
        if (dimension === 'x' || dimension === 'y') {
            var delta = this._getDelta();
            switch (dimension) {
                case 'x':
                    value += delta.getX();
                    break;
                case 'y':
                    value += delta.getY();
                    break;
                default:
                    break;
            }
        }

        var _getTransformation = function (bbox, keepRatio) {
            if (dimension === 'w' || dimension === 'h') {
                var sx = 1;
                var sy = 1;

                switch (dimension) {
                    case 'w':
                        sx = value / bbox.getWidth();
                        if (keepRatio) {
                            sy = sx;
                        }
                        break;
                    case 'h':
                        sy = value / bbox.getHeight();
                        if (keepRatio) {
                            sx = sy;
                        }
                        break;
                    default:
                        break;
                }
                return new GTransform()
                    .translated(-bbox.getX(), -bbox.getY())
                    .scaled(sx, sy)
                    .translated(bbox.getX(), bbox.getY());
            } else {
                switch (dimension) {
                    case 'x':
                        return new GTransform()
                            .translated(value - bbox.getX(), 0);
                    case 'y':
                        return new GTransform()
                            .translated(0, value - bbox.getY());
                    default:
                        break;
                }
            }
        };

        var applyToSelection = true; // TODO : this._elements.length > 1 && this._panel.find('input[data-apply]').is(':checked');
        var keepRatio = this._panel.find('button[data-ratio]').hasClass('g-active');

        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            if (applyToSelection) {
                var transform = _getTransformation(this._elementsBBox, keepRatio);
                for (var i = 0; i < this._elements.length; ++i) {
                    this._elements[i].transform(transform);
                }
            } else {
                for (var i = 0; i < this._elements.length; ++i) {
                    var transform = _getTransformation(this._elements[i].getGeometryBBox(), keepRatio);
                    this._elements[i].transform(transform);
                }
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Change Size');
        }
    };

    /**
     * @returns {GPoint}
     * @private
     */
    GInfoProperties.prototype._getDelta = function () {
        return new GPoint(0, 0);
    }

    /** @override */
    GInfoProperties.prototype.toString = function () {
        return "[Object GInfoProperties]";
    };

    _.GInfoProperties = GInfoProperties;
})(this);