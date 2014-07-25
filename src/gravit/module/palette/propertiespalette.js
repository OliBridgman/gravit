(function (_) {

    /**
     * Object Palette
     * @class GPropertiesPalette
     * @extends GPalette
     * @constructor
     */
    function GPropertiesPalette() {
        GPalette.call(this);
        this._propertyPanels = [];
    }

    IFObject.inherit(GPropertiesPalette, GPalette);

    GPropertiesPalette.ID = "properties";
    GPropertiesPalette.TITLE = new IFLocale.Key(GPropertiesPalette, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GPropertiesPalette.prototype._htmlElement = null;

    /**
     * The property panels
     * @type {Array<{{category: JQuery, panel: JQuery, properties: GProperties}}>}
     * @private
     */
    GPropertiesPalette.prototype._propertyPanels = null;

    /**
     * @type {EXDocument}
     * @private
     */
    GPropertiesPalette.prototype._document = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GPropertiesPalette.prototype._elements = null;

    /** @override */
    GPropertiesPalette.prototype.getId = function () {
        return GPropertiesPalette.ID;
    };

    /** @override */
    GPropertiesPalette.prototype.getTitle = function () {
        return GPropertiesPalette.TITLE;
    };

    /** @override */
    GPropertiesPalette.prototype.getGroup = function () {
        return "properties";
    };

    /** @override */
    GPropertiesPalette.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /** @override */
    GPropertiesPalette.prototype.init = function (htmlElement, controls) {
        GPalette.prototype.init.call(this, htmlElement, controls);

        this._htmlElement = htmlElement;

        var propertiesPanels = $('<div></div>')
            .addClass('properties-panels')
            .appendTo(this._htmlElement);

        var _addPropertiesPanel = function (properties) {
            // Create panel
            var panel = $('<div></div>')
                .css('display', 'none')
                .attr('data-available', 'false')
                .addClass('properties-panel-content');

            // Append category
            var category = $('<div></div>')
                .addClass('properties-panel-category')
                .css('display', 'none')
                .attr('data-expanded', 'true')
                .append($('<div></div>')
                    .addClass('title')
                    .append($('<i></i>')
                        .addClass('fa fa-angle-down'))
                    .append($('<span></span>')
                        .text(ifLocale.get(properties.getCategory())))
                    .on('click', function () {
                        if (panel.attr('data-available') === 'true') {
                            var category = $(this).parents('.properties-panel-category');
                            var icon = category.find('i.fa');
                            if (panel.css('display') !== 'none') {
                                panel.css('display', 'none');
                                icon.attr('class', 'fa fa-angle-right');
                                category.attr('data-expanded', 'false');
                            } else {
                                panel.css('display', '');
                                icon.attr('class', 'fa fa-angle-down');
                                category.attr('data-expanded', 'true');
                            }
                        }
                    }))
                .append($('<div></div>')
                    .addClass('controls'))
                .appendTo(propertiesPanels);

            // Init properties
            properties.init(panel, category.find('.controls'));

            // Append panel
            panel.appendTo(propertiesPanels);

            this._propertyPanels.push({
                category: category,
                panel: panel,
                properties: properties
            })
        }.bind(this);

        // Initialize our properties panels
        for (var i = 0; i < gravit.properties.length; ++i) {
            _addPropertiesPanel(gravit.properties[i]);
        }
    };

    /** @override */
    GPropertiesPalette.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var scene = this._document.getScene();
            var editor = this._document.getEditor();

            editor.addEventListener(IFEditor.SelectionChangedEvent, this._updateFromSelection, this);
            scene.addEventListener(IFNode.AfterFlagChangeEvent, this._afterFlagChange, this);

            this._updateFromSelection();

            this.trigger(GPalette.UPDATE_EVENT);
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var scene = this._document.getScene();
            var editor = this._document.getEditor();

            // Unsubscribe from the editor's events
            editor.addEventListener(IFEditor.SelectionChangedEvent, this._updateFromSelection, this);
            scene.removeEventListener(IFNode.AfterFlagChangeEvent, this._afterFlagChange, this);

            this._document = null;
            this._elements = null;

            this._updatePropertyPanels();

            this.trigger(GPalette.UPDATE_EVENT);
        }
    };

    /**
     * @private
     */
    GPropertiesPalette.prototype._updateFromSelection = function () {
        this._elements = this._document.getEditor().getSelection();

        // If there's no selection, select the scene
        if (!this._elements || this._elements.length === 0) {
            this._elements = [this._document.getScene()];
        }

        this._updatePropertyPanels();
    };

    /**
     * @private
     */
    GPropertiesPalette.prototype._afterFlagChange = function (evt) {
        // Special case - if element's consists of scene only and
        // some element's activeness changes, trigger an update property
        // panels as some panel do some special handling for this case
        if (evt.flag === IFNode.Flag.Active && this._elements && this._elements.length === 1 && this._elements[0] instanceof IFScene) {
            this._updatePropertyPanels();
        }
    };

    /** @private */
    GPropertiesPalette.prototype._updatePropertyPanels = function () {
        var lastVisiblePropertyPanel = null;
        for (var i = 0; i < this._propertyPanels.length; ++i) {
            var propertyPanel = this._propertyPanels[i];
            var available = !this._elements || this._elements.length === 0 ?
                false : propertyPanel.properties.update(this._document, this._elements);

            propertyPanel.panel.removeClass('last-visible');
            if (available) {
                propertyPanel.category.css('display', '');

                if (propertyPanel.category.attr('data-expanded') == 'true') {
                    propertyPanel.panel.css('display', '');
                }

                propertyPanel.panel.attr('data-available', 'true');

                lastVisiblePropertyPanel = propertyPanel;
            } else {
                propertyPanel.category.css('display', 'none');
                propertyPanel.panel.css('display', 'none');
                propertyPanel.panel.attr('data-available', 'false');
            }
        }

        if (lastVisiblePropertyPanel) {
            lastVisiblePropertyPanel.panel.addClass('last-visible');
        }
    };

    /** @override */
    GPropertiesPalette.prototype.toString = function () {
        return "[Object GPropertiesPalette]";
    };

    _.GPropertiesPalette = GPropertiesPalette;
})(this);