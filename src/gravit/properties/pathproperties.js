(function (_) {

    /**
     * Path properties panel
     * @class GPathProperties
     * @extends GProperties
     * @constructor
     */
    function GPathProperties() {
        this._pathes = [];
    };
    IFObject.inherit(GPathProperties, GProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GPathProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GPathProperties.prototype._document = null;

    /**
     * @type {Array<IFPath>}
     * @private
     */
    GPathProperties.prototype._pathes = null;

    /**
     * @type {Array<IFPathBase.AnchorPoint>}
     * @private
     */
    GPathProperties.prototype._points = null;

    /** @override */
    GPathProperties.prototype.init = function (panel, controls) {
        this._panel = panel;

        var _createPathInput = function (property) {
            var self = this;
            if (property === 'evenodd' || property === 'closed') {
                return $('<input>')
                    .attr('type', 'checkbox')
                    .attr('data-path-property', property)
                    .on('change', function () {
                        self._assignPathProperty(property, $(this).is(':checked'));
                    });
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        var _createPointInput = function (property) {
            var self = this;
            if (property === 'x' || property === 'y' || property === 'cl' || property === 'cr') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-point-property', property)
                    .on('change', function (evt) {
                        var value = self._document.getScene().stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value >= 0) {
                            self._assignPointProperty(property, value);
                        } else {
                            self._updatePointProperties();
                        }
                    });
            } else if (property === 'type') {
                return $('<select></select>')
                    .attr('data-point-property', property)
                    .append($('<optgroup></optgroup>')
                        // TODO : I18N
                        .attr('label', 'Curve')
                        .append($('<option></option>')
                            .attr('value', IFPathBase.AnchorPoint.Type.Symmetric)
                            // TODO : I18N
                            .text('Symmetric'))
                        .append($('<option></option>')
                            .attr('value', IFPathBase.AnchorPoint.Type.Asymmetric)
                            // TODO : I18N
                            .text('Asymmetric'))
                        .append($('<option></option>')
                            .attr('value', IFPathBase.AnchorPoint.Type.Mirror)
                            // TODO : I18N
                            .text('Mirror'))
                        .append($('<option></option>')
                            .attr('value', IFPathBase.AnchorPoint.Type.Connector)
                            // TODO : I18N
                            .text('Connector')))
                    .append($('<optgroup></optgroup>')
                        // TODO : I18N
                        .attr('label', 'Corner'))
                    .gCornerType()
                    .on('change', function () {
                        var val = $(this).val();
                        if (val === '-') {
                            val = IFPathBase.CornerType.Rounded;
                        }
                        self._assignPointProperty('tp', val);
                    });
            } else if (property === 'ah') {
                return $('<input>')
                    .attr('type', 'checkbox')
                    .attr('data-point-property', property)
                    .on('change', function () {
                        self._assignPointProperty(property, $(this).is(':checked'));
                    });
            } else if (property === 'cu') {
                return $('<button></button>')
                    .addClass('g-flat')
                    .attr('data-point-property', property)
                    .on('click', function () {
                        self._assignPointProperty(property, !$(this).hasClass('g-active'));
                        self._updatePointProperties();
                    })
                    .append($('<span></span>')
                        .addClass('fa fa-lock'));
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        panel
            .css('width', '210px')
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'left': '5px'
                })
                // TODO : I18N
                .text('Closed:')
                .append(_createPathInput('closed')))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'left': '75px'
                })
                // TODO : I18N
                .text('Even/odd Fill:')
                .append(_createPathInput('evenodd')))
            .append($('<label></label>')
                .attr('data-point-property', '_row')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '5px'
                })
                .text('X:')
                .append(_createPointInput('x')
                    .css({
                        'margin-left': '3px',
                        'width': '38px'
                    })))
            .append($('<label></label>')
                .attr('data-point-property', '_row')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '65px'
                })
                .text('Y:')
                .append(_createPointInput('y')
                    .css({
                        'margin-left': '3px',
                        'width': '38px'
                    })))
            .append($('<div></div>')
                .attr('data-point-property', '_row')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '125px'
                })
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Clear Left Handle')
                    .on('click', function () {
                        this._assignPointProperties(['hlx', 'hly'], [null, null]);
                    }.bind(this))
                    .append($('<span></span>')
                        .addClass('fa fa-forward')))
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Clear Right Handle')
                    .on('click', function () {
                        this._assignPointProperties(['hrx', 'hry'], [null, null]);
                    }.bind(this))
                    .append($('<span></span>')
                        .addClass('fa fa-backward')))
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Clear Handles')
                    .on('click', function () {
                        this._assignPointProperties(['hlx', 'hly', 'hrx', 'hry'], [null, null, null, null]);
                    }.bind(this))
                    .append($('<span></span>')
                        .addClass('fa fa-times'))))
            .append($('<hr>')
                .css({
                    'position': 'absolute',
                    'left': '0px',
                    'right': '0px',
                    'top': '50px'
                }))
            .append($('<label></label>')
                .attr('data-point-property', '_row')
                .css({
                    'position': 'absolute',
                    'top': '65px',
                    'left': '5px'
                })
                .append(_createPointInput('type')
                    .css('width', '100px')))
            .append($('<label></label>')
                .attr('data-point-property', '_row')
                .css({
                    'position': 'absolute',
                    'top': '65px',
                    'left': '110px'
                })
                // TODO : I18N
                .text('Auto Handles:')
                .append(_createPointInput('ah')))
            .append($('<label></label>')
                .attr('data-point-property', '_row')
                .css({
                    'position': 'absolute',
                    'top': '89px',
                    'left': '5px'
                })
                .append(_createPointInput('cl')
                    .css('width', '38px')
                    // TODO : I18N
                    .attr('title', 'Left Smoothness'))
                .append(_createPointInput('cu')
                    .css('width', '18px')
                    // TODO : I18N
                    .attr('title', 'Toggle Lock of Left & Right Smoothness'))
                .append(_createPointInput('cr')
                    .css('width', '38px')
                    // TODO : I18N
                    .attr('title', 'Right Smoothness')));
    };

    /** @override */
    GPathProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._document.getScene().removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document.getScene().removeEventListener(IFElement.AfterFlagChangeEvent, this._afterFlagChange);
            this._document = null;
        }

        // Collect all path elements and their selected anchor points
        this._pathes = [];
        this._points = [];
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i] instanceof IFPath) {
                var path = elements[i];

                this._pathes.push(elements[i]);

                for (var ap = path.getAnchorPoints().getFirstChild(); ap !== null; ap = ap.getNext()) {
                    if (ap.hasFlag(IFNode.Flag.Selected)) {
                        this._points.push(ap);
                    }
                }
            }
        }

        if (this._pathes.length === elements.length) {
            this._document = document;
            this._document.getScene().addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._document.getScene().addEventListener(IFElement.AfterFlagChangeEvent, this._afterFlagChange, this);
            this._updatePathProperties();
            this._updatePointProperties();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {IFNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GPathProperties.prototype._afterPropertiesChange = function (event) {
        // If properties of first path has changed then update ourself
        if (this._pathes.length > 0 && this._pathes[0] === event.node) {
            this._updatePathProperties();
        }
        // If properties of first anchor point has changed then update ourself
        if (this._points.length > 0 && this._points[0] === event.node) {
            this._updatePointProperties();
        }
    };

    /**
     * @param {IFElement.AfterFlagChangeEvent} event
     * @private
     */
    GPathProperties.prototype._afterFlagChange = function (event) {
        if (event.flag === IFNode.Flag.Selected && event.node instanceof IFPathBase.AnchorPoint) {
            var path = event.node.getParent().getParent();
            if (path && this._pathes.indexOf(path) >= 0) {
                if (event.set) {
                    this._points.push(event.node);
                } else {
                    this._points.splice(this._points.indexOf(event.node), 1);
                }
                this._updatePointProperties();
            }
        }
    };

    /**
     * @private
     */
    GPathProperties.prototype._updatePathProperties = function () {
        // We'll always read properties of first path
        var path = this._pathes[0];
        this._panel.find('input[data-path-property="evenodd"]').prop('checked', path.getProperty('evenodd'));
        this._panel.find('input[data-path-property="closed"]').prop('checked', path.getProperty('closed'));
    };

    /**
     * @private
     */
    GPathProperties.prototype._updatePointProperties = function () {
        // We'll always read properties of first anchor point if any
        var point = this._points.length > 0 ? this._points[0] : null;

        if (point) {
            this._panel.find('[data-point-property]').css('visibility', '');
            this._panel.find('input[data-point-property="x"]').val(
                this._document.getScene().pointToString(point.getProperty('x')));
            this._panel.find('input[data-point-property="y"]').val(
                this._document.getScene().pointToString(point.getProperty('y')));
            this._panel.find('input[data-point-property="ah"]').prop('checked', point.getProperty('ah'));

            var isCorner = true;
            var apType = point.getProperty('tp');
            for (var p in IFPathBase.AnchorPoint.Type) {
                if (IFPathBase.AnchorPoint.Type[p] === apType) {
                    isCorner = false;
                    break;
                }
            }

            this._panel.find('select[data-point-property="type"]').val(apType);

            this._panel.find('input[data-point-property="cl"]')
                .prop('disabled', !isCorner)
                .val(this._document.getScene().pointToString(point.getProperty('cl')));
            this._panel.find('input[data-point-property="cr"]')
                .prop('disabled', !isCorner || point.getProperty('cu'))
                .val(this._document.getScene().pointToString(point.getProperty('cr')));
            this._panel.find('button[data-point-property="cu"]')
                .prop('disabled', !isCorner)
                .toggleClass('g-active', point.getProperty('cu'));
        } else {
            this._panel.find('[data-point-property]').css('visibility', 'hidden');
        }
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GPathProperties.prototype._assignPathProperty = function (property, value) {
        this._assignPathProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GPathProperties.prototype._assignPathProperties = function (properties, values) {
        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            for (var i = 0; i < this._pathes.length; ++i) {
                this._pathes[i].setProperties(properties, values);
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Modify Path Properties');
        }
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GPathProperties.prototype._assignPointProperty = function (property, value) {
        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            for (var i = 0; i < this._points.length; ++i) {
                var point = this._points[i];
                if (property === 'x') {
                    var dx = value - point.getProperty('x');
                    var hlx = point.getProperty('hlx') ? point.getProperty('hlx') + dx : null;
                    var hrx = point.getProperty('hrx') ? point.getProperty('hrx') + dx : null;
                    point.setProperties(['x', 'hlx', 'hrx'], [value, hlx, hrx]);
                } else if (property === 'y') {
                    var dy = value - point.getProperty('y');
                    var hly = point.getProperty('hly') ? point.getProperty('hly') + dy : null;
                    var hry = point.getProperty('hry') ? point.getProperty('hry') + dy : null;
                    point.setProperties(['y', 'hly', 'hry'], [value, hly, hry]);
                } else {
                    point.setProperties([property], [value]);
                }
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Modify Point Properties');
        }
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GPathProperties.prototype._assignPointProperties = function (properties, values) {
        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            for (var i = 0; i < this._points.length; ++i) {
                this._points[i].setProperties(properties, values);
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Modify Point Properties');
        }
    };

    /** @override */
    GPathProperties.prototype.toString = function () {
        return "[Object GPathProperties]";
    };

    _.GPathProperties = GPathProperties;
})(this);