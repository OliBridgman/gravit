(function (_) {

    /**
     * Properties Panel
     * @class GPropertiesPanel
     * @extends GPanel
     * @constructor
     */
    function GPropertiesPanel() {
        GPanel.call(this);
        this._propertyPanels = [];
    }

    IFObject.inherit(GPropertiesPanel, GPanel);

    GPropertiesPanel.ID = "properties";
    GPropertiesPanel.TITLE = new IFLocale.Key(GPropertiesPanel, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GPropertiesPanel.prototype._htmlElement = null;

    /**
     * The property panels
     * @type {Array<{{panel: JQuery, properties: GProperties}}>}
     * @private
     */
    GPropertiesPanel.prototype._propertyPanels = null;

    /**
     * @type {GDocument}
     * @private
     */
    GPropertiesPanel.prototype._document = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GPropertiesPanel.prototype._elements = null;

    /** @override */
    GPropertiesPanel.prototype.getId = function () {
        return GPropertiesPanel.ID;
    };

    /** @override */
    GPropertiesPanel.prototype.getTitle = function () {
        return GPropertiesPanel.TITLE;
    };

    /** @override */
    GPropertiesPanel.prototype.init = function (htmlElement, controls) {
        GPanel.prototype.init.call(this, htmlElement, controls);

        this._htmlElement = htmlElement;

        var propertiesPanels = $('<div></div>')
            .addClass('properties-panels')
            .appendTo(this._htmlElement);

        var _addPropertiesPanel = function (properties) {
            // Create panel
            var panel = $('<div></div>')
                .css('display', 'none')
                .addClass('properties-panel-content');

            // Init properties
            properties.init(panel);

            // Append panel
            panel.appendTo(propertiesPanels);

            this._propertyPanels.push({
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
    GPropertiesPanel.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var scene = this._document.getScene();
            var editor = this._document.getEditor();

            editor.addEventListener(IFEditor.SelectionChangedEvent, this._updateFromSelection, this);
            scene.addEventListener(IFNode.AfterFlagChangeEvent, this._afterFlagChange, this);

            this._updateFromSelection();

            this.trigger(GPanel.UPDATE_EVENT);
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var scene = this._document.getScene();
            var editor = this._document.getEditor();

            // Unsubscribe from the editor's events
            editor.removeEventListener(IFEditor.SelectionChangedEvent, this._updateFromSelection, this);
            scene.removeEventListener(IFNode.AfterFlagChangeEvent, this._afterFlagChange, this);

            this._document = null;
            this._elements = null;

            this._updatePropertyPanels();

            this.trigger(GPanel.UPDATE_EVENT);
        }
    };

    /**
     * @private
     */
    GPropertiesPanel.prototype._updateFromSelection = function () {
        this._elements = this._document.getEditor().getSelection();

        // If there's no selection, select the active page if any
        if (!this._elements || this._elements.length === 0) {
            var activePage = this._document.getScene().getActivePage();
            if (activePage) {
                this._elements = [activePage];
            }
        }

        this._updatePropertyPanels();
    };

    /**
     * @private
     */
    GPropertiesPanel.prototype._afterFlagChange = function (evt) {
        // Special case - if element's consists of scene only and
        // some element's activeness changes, trigger an update property
        // panels as some panel do some special handling for this case
        if (evt.flag === IFNode.Flag.Active && this._elements && this._elements.length === 1 && this._elements[0] instanceof IFScene) {
            this._updatePropertyPanels();
        }
    };

    /** @private */
    GPropertiesPanel.prototype._updatePropertyPanels = function () {
        for (var i = 0; i < this._propertyPanels.length; ++i) {
            var propertyPanel = this._propertyPanels[i];
            var available = !this._elements || this._elements.length === 0 ?
                false : propertyPanel.properties.update(this._document, this._elements);

            if (available) {
                propertyPanel.panel.css('display', '');
            } else {
                propertyPanel.panel.css('display', 'none');
            }
        }
    };

    /** @override */
    GPropertiesPanel.prototype.toString = function () {
        return "[Object GPropertiesPanel]";
    };

    _.GPropertiesPanel = GPropertiesPanel;
})(this);