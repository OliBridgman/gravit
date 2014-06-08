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

    // -----------------------------------------------------------------------------------------------------------------
    // GPropertiesPalette.DocumentState Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @class GPropertiesPalette.DocumentState
     * @extends GPalette.DocumentState
     * @constructor
     */
    GPropertiesPalette.DocumentState = function (document, propertyPanels) {
        GPalette.DocumentState.call(this, document);
        this._propertyPanels = propertyPanels;
    };
    IFObject.inherit(GPropertiesPalette.DocumentState, GPalette.DocumentState);

    /**
     * The property panels
     * @type {Array<{{category: JQuery, panel: JQuery, properties: GProperties}}>}
     * @private
     */
    GPropertiesPalette.DocumentState.prototype._propertyPanels = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GPropertiesPalette.DocumentState.prototype._elements = null;

    /** @override */
    GPropertiesPalette.DocumentState.prototype.init = function () {
        // NO-OP
    };

    /** @override */
    GPropertiesPalette.DocumentState.prototype.release = function () {
        // NO-OP
    };

    /** @override */
    GPropertiesPalette.DocumentState.prototype.activate = function () {
            var editor = this.document.getEditor();

        // Subscribe to the editor's events
        editor.addEventListener(IFEditor.SelectionChangedEvent, this._updateFromSelection, this);

        // Update property panels
        this._updateFromSelection();
        this._updatePropertyPanels();
    };

    /** @override */
    GPropertiesPalette.DocumentState.prototype.deactivate = function () {
        var editor = this.document.getEditor();

        // Unsubscribe from the editor's events
        editor.addEventListener(IFEditor.SelectionChangedEvent, this._updateFromSelection, this);

        // Remove all property panels
        for (var i = 0; i < this._propertyPanels.length; ++i) {
            var propertyPanel = this._propertyPanels[i];
            propertyPanel.category.css('display', 'none');
            propertyPanel.panel.css('display', 'none');
            propertyPanel.panel.attr('data-available', 'false');
        }
    };

    /**
     * @private
     */
    GPropertiesPalette.DocumentState.prototype._updateFromSelection = function () {
        this._elements = this.document.getEditor().getSelection();

        // If there's no selection, select the scene
        if (!this._elements || this._elements.length === 0) {
            this._elements = [this.document.getScene()];
        }

        this._updatePropertyPanels();
    };

    /** @private */
    GPropertiesPalette.DocumentState.prototype._updatePropertyPanels = function () {
        var lastVisiblePropertyPanel = null;
        for (var i = 0; i < this._propertyPanels.length; ++i) {
            var propertyPanel = this._propertyPanels[i];
            var available = !this._elements || this._elements.length === 0 ?
                false : propertyPanel.properties.updateFromNode(this.document, this._elements);

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

    // -----------------------------------------------------------------------------------------------------------------
    // GPropertiesPalette Class
    // -----------------------------------------------------------------------------------------------------------------    

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

    /**
     * @override
     */
    GPropertiesPalette.prototype.getShortcut = function () {
        return [IFKey.Constant.META, 'F3'];
    };

    /** @override */
    GPropertiesPalette.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /** @override */
    GPropertiesPalette.prototype.init = function (htmlElement, menu) {
        GPalette.prototype.init.call(this, htmlElement, menu);

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
                        .addClass('fa fa-caret-down'))
                    .append($('<span></span>')
                        .text(ifLocale.get(properties.getCategory())))
                    .on('click', function () {
                        if (panel.attr('data-available') === 'true') {
                            var category = $(this).parents('.properties-panel-category');
                            var icon = category.find('i.fa');
                            if (panel.css('display') !== 'none') {
                                panel.css('display', 'none');
                                icon.attr('class', 'fa fa-caret-right');
                                category.attr('data-expanded', 'false');
                            } else {
                                panel.css('display', '');
                                icon.attr('class', 'fa fa-caret-down');
                                category.attr('data-expanded', 'true');
                            }
                        }
                    }))
                .append($('<div></div>')
                    .addClass('controls'))
                .appendTo(propertiesPanels);

            // Init properties
            properties.init(panel, category.find('.controls'), menu);

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
    GPropertiesPalette.prototype._createDocumentState = function (document) {
        return new GPropertiesPalette.DocumentState(document, this._propertyPanels);
    };

    /** @override */
    GPropertiesPalette.prototype.toString = function () {
        return "[Object GPropertiesPalette]";
    };

    _.GPropertiesPalette = GPropertiesPalette;
})(this);