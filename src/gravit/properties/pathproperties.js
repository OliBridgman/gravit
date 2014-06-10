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
    GPathProperties.prototype.getCategory = function () {
        // TODO : I18N
        return 'Path';
    };

    /** @override */
    GPathProperties.prototype.init = function (panel, controls) {
        this._panel = panel;

        var _createPathInput = function (property) {
            var self = this;
            if (property === 'evenodd' || property === 'closed') {
                return $('<label></label>')
                    .append($('<input>')
                        .attr('type', 'checkbox')
                        .attr('data-path-property', property)
                        .on('change', function () {
                            self._assignPathProperty(property, $(this).is(':checked'));
                        }))
                    .append($('<span></span>')
                        // TODO : I18N
                        .html('&nbsp;' + (property === 'evenodd' ? 'Even/odd' : 'Closed')))
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
                    .css('width', '5em')
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
                    .css('width', '100%')
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
                return $('<label></label>')
                    .append($('<input>')
                        .attr('type', 'checkbox')
                        .attr('data-point-property', property)
                        .on('change', function () {
                            self._assignPointProperty(property, $(this).is(':checked'));
                        }))
                    .append($('<span></span>')
                        // TODO : I18N
                        .html('&nbsp;Automatic'))
            } else if (property === 'cu') {
                return $('<button></button>')
                    .addClass('g-flat')
                    .attr('data-point-property', property)
                    .append($('<span></span>')
                        .addClass('fa fa-lock fa-fw'))
                    .on('click', function () {
                        self._assignPointProperty(property, !$(this).hasClass('g-active'));
                        self._updatePointProperties();
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
                    .html('&nbsp;'))
                .append($('<td></td>')
                    .append(_createPathInput('evenodd')))
                .append($('<td></td>')
                    .addClass('label')
                    .html('&nbsp;'))
                .append($('<td></td>')
                    .append(_createPathInput('closed'))))
            .append($('<tr></tr>')
                .attr('data-point-property', '_row')
                .append($('<td></td>')
                    .attr('colspan', 4)
                    .append($('<h1></h1>')
                        .addClass('g-divider')
                        .text('Anchor Point'))))
            .append($('<tr></tr>')
                .attr('data-point-property', '_row')
                .append($('<td></td>')
                    .addClass('label')
                    .text('X:'))
                .append($('<td></td>')
                    .append(_createPointInput('x')
                        // TODO : I18N
                        .attr('title', 'Horizontal Position of Point')))
                .append($('<td></td>')
                    .addClass('label')
                    .text('Y:'))
                .append($('<td></td>')
                    .append(_createPointInput('y')
                        // TODO : I18N
                        .attr('title', 'Vertical Position of Point'))))
            .append($('<tr></tr>')
                .attr('data-point-property', '_row')
                .append($('<td></td>')
                    .addClass('label')
                    .text('Handles:'))
                .append($('<td></td>')
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Clear Left Handle')
                        .append($('<span></span>')
                            .addClass('fa fa-arrow-right fa-fw'))
                        .on('click', function () {
                            this._assignPointProperties(['hlx', 'hly'], [null, null]);
                        }.bind(this)))
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Clear Right Handle')
                        .append($('<span></span>')
                            .addClass('fa fa-arrow-left fa-fw'))
                        .on('click', function () {
                            this._assignPointProperties(['hrx', 'hry'], [null, null]);
                        }.bind(this)))
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Clear Handles')
                        .append($('<span></span>')
                            .addClass('fa fa-ban fa-fw'))
                        .on('click', function () {
                            this._assignPointProperties(['hlx', 'hly', 'hrx', 'hry'], [null, null, null, null]);
                        }.bind(this))))
                .append($('<td></td>')
                    .attr('colspan', '2')
                    .css('text-align', 'right')
                    .append(_createPointInput('ah')
                        // TODO : I18N
                        .attr('title', 'Toggle automatic calculation of handles'))))
            .append($('<tr></tr>')
                .attr('data-point-property', '_row')
                .append($('<td></td>')
                    .attr('colspan', 4)
                    .append($('<hr>'))))
            .append($('<tr></tr>')
                .attr('data-point-property', '_row')
                .append($('<td></td>')
                    .addClass('label')
                    .text('Type:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createPointInput('type'))))
            .append($('<tr></tr>')
                .attr('data-point-property', '_row')
                .append($('<td></td>')
                    .addClass('label')
                    .text('Smooth:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createPointInput('cl')
                        // TODO : I18N
                        .attr('title', 'Left Smoothness'))
                    .append(_createPointInput('cu')
                        // TODO : I18N
                        .attr('title', 'Toggle Lock of Left & Right Smoothness'))
                    .append(_createPointInput('cr')
                        // TODO : I18N
                        .attr('title', 'Right Smoothness'))))
            .appendTo(panel);
    };

    /** @override */
    GPathProperties.prototype.updateFromNode = function (document, elements, node) {
        if (this._document) {
            this._document.getScene().removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document.getScene().removeEventListener(IFElement.AfterFlagChangeEvent, this._afterFlagChange);
            this._document = null;
        }

        // We'll work on elements, only
        if (node) {
            return false;
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