(function (_) {

    /**
     * Align Palette
     * @class GAlignPalette
     * @extends GPalette
     * @constructor
     */
    function GAlignPalette() {
        GPalette.call(this);
    }

    GObject.inherit(GAlignPalette, GPalette);

    GAlignPalette.ID = "align";
    GAlignPalette.TITLE = new GLocale.Key(GAlignPalette, "title");
    
    /** @enum */
    GAlignPalette._AlignTo = {
        Selection: 'selection',
        Layer: 'layer',
        Page: 'page',
        PageMargins: 'page-margins',
        FirstElement: 'first-element',
        LastElement: 'last-element'
    };

    /**
     * @type {JQuery}
     * @private
     */
    GAlignPalette.prototype._htmlElement = null;

    /**
     * @type {GDocument}
     * @private
     */
    GAlignPalette.prototype._document = null;

    /**
     * @type {Array<GElement>}
     * @private
     */
    GAlignPalette.prototype._elements = null;

    /**
     * @type {GAlignPalette._AlignTo}
     * @private
     */
    GAlignPalette.prototype._savedAlignTo = GAlignPalette._AlignTo.Selection;

    /** @override */
    GAlignPalette.prototype.getId = function () {
        return GAlignPalette.ID;
    };

    /** @override */
    GAlignPalette.prototype.getTitle = function () {
        return GAlignPalette.TITLE;
    };

    /** @override */
    GAlignPalette.prototype.getGroup = function () {
        return "modify";
    };


    /** @override */
    GAlignPalette.prototype.isEnabled = function () {
        return this._document !== null && this._elements && this._elements.length > 0;
    };

    /** @override */
    GAlignPalette.prototype.init = function (htmlElement, controls) {
        GPalette.prototype.init.call(this, htmlElement, controls);

        gApp.addEventListener(GApplication.DocumentEvent, this._documentEvent, this);

        this._htmlElement = htmlElement;

        htmlElement
            .css('height', '115px')
            .append($('<div></div>')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'left': '5px'
                })
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Align Left')
                    .attr('data-align', GAlignAction.Type.AlignLeft)
                    .append($('<span></span>')
                        .addClass('fa fa-align-left')))
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Align Center')
                    .attr('data-align', GAlignAction.Type.AlignCenter)
                    .append($('<span></span>')
                        .addClass('fa fa-align-center')))
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Align Right')
                    .attr('data-align', GAlignAction.Type.AlignRight)
                    .append($('<span></span>')
                        .addClass('fa fa-align-right')))
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Justify Horizontal')
                    .attr('data-align', GAlignAction.Type.AlignJustifyHorizontal)
                    .append($('<span></span>')
                        .addClass('fa fa-align-justify fa-rotate-270')))
                .append($('<button></button>')
                    .css('margin-left', '10px')
                    // TODO : I18N
                    .attr('title', 'Distribute Horizontal')
                    .attr('data-dist', GDistributeAction.Type.Horizontal)
                    .append($('<span></span>')
                        .addClass('fa fa-reorder fa-rotate-270')))
                .append($('<input>')
                    // TODO : I18N
                    .attr('title', 'Horizontal Spacing, zero will auto-space')
                    .attr('data-dist', GDistributeAction.Type.Horizontal)
                    .css('width', '38px')
                    .val('0')))
            .append($('<div></div>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '5px'
                })
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Align Top')
                    .attr('data-align', GAlignAction.Type.AlignTop)
                    .append($('<span></span>')
                        .addClass('fa fa-align-right fa-rotate-270')))
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Align Middle')
                    .attr('data-align', GAlignAction.Type.AlignMiddle)
                    .append($('<span></span>')
                        .addClass('fa fa-align-center fa-rotate-270')))
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Align Bottom')
                    .attr('data-align', GAlignAction.Type.AlignBottom)
                    .append($('<span></span>')
                        .addClass('fa fa-align-left fa-rotate-270')))
                .append($('<button></button>')
                    // TODO : I18N
                    .attr('title', 'Justify Vertical')
                    .attr('data-align', GAlignAction.Type.AlignJustifyVertical)
                    .append($('<span></span>')
                        .addClass('fa fa-align-justify')))
                .append($('<button></button>')
                    .css('margin-left', '10px')
                    // TODO : I18N
                    .attr('title', 'Distribute Vertical')
                    .attr('data-dist', GDistributeAction.Type.Vertical)
                    .append($('<span></span>')
                        .addClass('fa fa-reorder')))
                .append($('<input>')
                    // TODO : I18N
                    .attr('title', 'Vertical Spacing, zero will auto-space')
                    .attr('data-dist', GDistributeAction.Type.Vertical)
                    .css('width', '38px')
                    .val('0')))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '65px',
                    'right': '5px'
                })
                // TODO : I18N
                .text('Use Geometry:')
                .append($('<input>')
                    .attr('type', 'checkbox')
                    .attr('data-align-geometry', '')
                    .prop('checked', true)))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '65px',
                    'left': '5px'
                })
                // TODO : I18N
                .text('Align To:')
                .append(($('<select></select>')
                    .css({
                        'width': '90px',
                        'position': 'absolute',
                        'top': '24px',
                        'left': '0px'
                    })
                    .attr('data-option', 'align-to')
                    .append($('<option></option>')
                        .attr('value', GAlignPalette._AlignTo.Selection)
                        // TODO : I18N
                        .text('Selection'))
                    .append($('<option></option>')
                        .attr('value', GAlignPalette._AlignTo.Layer)
                        // TODO : I18N
                        .text('Layer'))
                    .append($('<option></option>')
                        .attr('value', GAlignPalette._AlignTo.Page)
                        // TODO : I18N
                        .text('Page'))
                    .append($('<option></option>')
                        .attr('value', GAlignPalette._AlignTo.PageMargins)
                        // TODO : I18N
                        .text('Page Margins'))
                    .append($('<option></option>')
                        .attr('value', GAlignPalette._AlignTo.FirstElement)
                        // TODO : I18N
                        .text('First Element'))
                    .append($('<option></option>')
                        .attr('value', GAlignPalette._AlignTo.LastElement)
                        // TODO : I18N
                        .text('Last Element'))
                    .on('change', function (evt) {
                        this._savedAlignTo = $(evt.target).val();
                        this._updateStates();
                    }.bind(this)))))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '89px',
                    'right': '5px'
                })
                // TODO : I18N
                .text('Align Selection:')
                .append($('<input>')
                    .attr('type', 'checkbox')
                    .attr('data-align-selection', '')
                    .prop('checked', true)));

        var alignHandler = function (evt) {
            this._executeAction($(evt.target).closest('button').attr('data-align'), 'align');
        }.bind(this);

        var distHandler = function (evt) {
            this._executeAction($(evt.target).closest('button').attr('data-dist'), 'dist')
        }.bind(this);

        htmlElement.find('button[data-align]').each(function (index, element) {
            $(element).on('click', alignHandler);
        });

        htmlElement.find('button[data-dist]').each(function (index, element) {
            $(element).on('click', distHandler);
        });

        htmlElement.find('input[data-dist]').each(function (index, element) {
            $(element).on('keyup', function (evt) {
                if (evt.keyCode === 13) {
                    distHandler.call(this, evt);
                }
            });
        });
    };

    GAlignPalette.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var editor = this._document.getEditor();

            editor.addEventListener(GEditor.SelectionChangedEvent, this._updateFromSelection, this);

            this._updateFromSelection();

            this.trigger(GPalette.UPDATE_EVENT);
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var editor = this._document.getEditor();

            // Unsubscribe from the editor's events
            editor.removeEventListener(GEditor.SelectionChangedEvent, this._updateFromSelection, this);

            this._document = null;
            this._elements = null;

            this.trigger(GPalette.UPDATE_EVENT);
        }
    };

    /**
     * @private
     */
    GAlignPalette.prototype._updateFromSelection = function () {
        this._elements = null;

        var selection = this._document.getEditor().getSelection();

        if (selection) {
            for (var i = 0; i < selection.length; ++i) {
                if (selection[i].hasMixin(GElement.Transform)) {
                    if (!this._elements) {
                        this._elements = [];
                    }
                    this._elements.push(selection[i]);
                }
            }
        }

        // If selection alignment-to is selected and we have only one
        // element available then we (temporarily) switch to align-to page,
        // otherwise we'll reset to our saved align-to selection
        if (this._elements && this._elements.length === 1) {
            this._htmlElement.find('select[data-option="align-to"]').val(GAlignPalette._AlignTo.Page);
        } else {
            this._htmlElement.find('select[data-option="align-to"]').val(this._savedAlignTo)
        }

        this._updateStates();

        this.trigger(GPalette.UPDATE_EVENT);
    };
    
    /**
     * Returns the action args
     * @param {GAlignAction.Type|GDistributeAction.Type} type
     * @param {String} mode - 'align', 'dist'
     * @return {{actionId: String, actionParams: Array<*>}}
     * @private
     */
    GAlignPalette.prototype._getActionArgs = function (type, mode) {
        // Gather our reference box depending on the selection, first
        var referenceBox = null;
        var elements = this._elements.slice();
        var scene = this._document.getScene();
        var activePage = scene.getActivePage();
        var activeLayer = scene.getActiveLayer();
        var alignTo = this._htmlElement.find('select[data-option="align-to"]').val();

        switch (alignTo) {
            case GAlignPalette._AlignTo.Layer:
                referenceBox = activeLayer.getPaintBBox();
                break;
            case GAlignPalette._AlignTo.Page:
                referenceBox = activePage.getGeometryBBox();
                break;
            case GAlignPalette._AlignTo.PageMargins:
                referenceBox = activePage.getGeometryBBox().expanded(
                    -activePage.getProperty('ml'),
                    -activePage.getProperty('mt'),
                    -activePage.getProperty('mr'),
                    -activePage.getProperty('mb'));
                break;
            case GAlignPalette._AlignTo.FirstElement:
                referenceBox = elements[0];
                elements.splice(0);
                break;
            case GAlignPalette._AlignTo.LastElement:
                referenceBox = elements[elements.length - 1];
                elements.splice(elements.length - 1);
                break;
        }

        if (elements.length > 0) {
            var geometry = this._htmlElement.find('input[data-align-geometry]').is(':checked');

            if (mode === 'align') {
                var compound = alignTo !== GAlignPalette._AlignTo.Selection ? this._htmlElement.find('input[data-align-selection]').is(':checked') : false;
                return {
                    actionId: GAlignAction.ID + '.' + type,
                    actionParams: [elements, compound, geometry, referenceBox]
                };
            } else if (mode === 'dist') {
                var spacing = scene.stringToPoint(this._htmlElement.find('input[data-dist="' + type + '"]').val()) || 0;
                return {
                    actionId: GDistributeAction.ID + '.' + type,
                    actionParams: [elements, geometry, referenceBox, spacing]
                };
            } else {
                throw new Error('Unknown align mode: ' + mode);
            }
        }
    };

    /**
     * see _getActionArgs
     * @private
     */
    GAlignPalette.prototype._executeAction = function (type, mode) {
        var actionArgs = this._getActionArgs(type, mode);
        if (actionArgs) {
            gApp.executeAction(actionArgs.actionId, actionArgs.actionParams);
        }
    };

    /**
     * see _getActionArgs
     * @private
     */
    GAlignPalette.prototype._isActionEnabled = function (type, mode) {
        if (!this.isEnabled()) {
            return false;
        }

        var actionArgs = this._getActionArgs(type, mode);
        if (actionArgs) {
            return gApp.canExecuteAction(actionArgs.actionId, actionArgs.actionParams);
        }
        return false;
    };

    /** @private */
    GAlignPalette.prototype._updateStates = function () {
        var alignTo = this._htmlElement.find('select[data-option="align-to"]').val();
        var compoundCtrls = alignTo !== GAlignPalette._AlignTo.Selection && this._elements.length > 1;

        this._htmlElement.find('input[data-align-selection]').prop('disabled', !compoundCtrls);

        this._htmlElement.find('[data-align]').each(function (index, element) {
            var $element = $(element);
            $element.prop('disabled', !this._isActionEnabled($element.attr('data-align'), 'align'));
        }.bind(this));

        this._htmlElement.find('[data-dist]').each(function (index, element) {
            var $element = $(element);
            $element.prop('disabled', !this._isActionEnabled($element.attr('data-dist'), 'dist'));
        }.bind(this));
    };

    /** @override */
    GAlignPalette.prototype.toString = function () {
        return "[Object GAlignPalette]";
    };

    _.GAlignPalette = GAlignPalette;
})(this);