(function (_) {
    /**
     * The global panels class
     * @class GPanels
     * @constructor
     */
    function GPanels(htmlElement) {
        this._htmlElement = htmlElement;
    };

    /**
     * @type {JQuery}
     * @private
     */
    GPanels.prototype._htmlElement = null;

    /**
     * @type {Array<{{container: JQuery, panel: GPanel}}>}
     * @private
     */
    GPanels.prototype._panels = null;

    /**
     * @type {String}
     * @private
     */
    GPanels.prototype._activePanel = null;

    /**
     * @returns {String} the id of the active panel or null for none
     */
    GPanels.prototype.getActivePanel = function () {
        return this._activePanel;
    };

    /**
     * Set an active panel
     * @param {String} panelId
     */
    GPanels.prototype.setActivePanel = function (panelId) {
        if (panelId !== this._activePanel) {
            for (var i = 0; i < this._panels.length; ++i) {
                var panel = this._panels[i];
                var id = panel.panel.getId();

                if (id === panelId) {
                    panel.container.css('display', '');
                    panel.tab.addClass('g-active');
                    panel.panel.activate();
                } else {
                    panel.container.css('display', 'none');
                    panel.tab.removeClass('g-active');
                    if (id === this._activePanel) {
                        panel.panel.deactivate();
                    }
                }
            }

            this._activePanel = panelId;
        }
    };

    /**
     * Enable or disable a panel
     * @param {String} panelId
     * @param {Boolean} enabled
     */
    GPanels.prototype.setPanelEnabled = function (panelId, enabled) {
        var panelInfo = this._getPanelInfo(panelId);
        if (panelInfo) {
            if (enabled) {
                panelInfo.container.find('.g-disabled-overlay').remove();
                panelInfo.container.removeClass('g-disabled');
            } else {
                var overlay = panelInfo.container.find('.g-disabled-overlay');

                if (overlay.length === 0) {
                    overlay = $('<div></div>')
                        .addClass('g-disabled-overlay')
                        .appendTo(panelInfo.container);
                }

                panelInfo.container.addClass('g-disabled');
            }
        }
    };

    /**
     * Called from the workspace to initialize
     */
    GPanels.prototype.init = function () {
        this._panels = [];

        var panelsTabs = $('<div></div>')
            .addClass('panels-tabs')
            .appendTo(this._htmlElement);

        var panelsFrame = $('<div></div>')
            .addClass('panels-frame')
            .appendTo(this._htmlElement);

        var _addPanelInfo = function (panel) {
            var tab = $('<button></button>')
                .addClass('panel-tab')
                .attr('data-panel-id', panel.getId())
                .text(ifLocale.get(panel.getTitle()))
                .on('click', function (evt) {
                    this.setActivePanel($(evt.target).attr('data-panel-id'));
                }.bind(this))
                .appendTo(panelsTabs);

            var container = $('<div></div>')
                .addClass('panel-container panel-' + panel.getId())
                .css('display', 'none')
                .appendTo(panelsFrame);

            panel.init(container);

            this.setPanelEnabled(panel.getId(), panel.isEnabled());

            this._panels.push({
                tab: tab,
                container: container,
                panel: panel
            });

            // Add update listener to panel
            panel.addEventListener(GView.UpdateEvent, function () {
                this.setPanelEnabled(panel.getId(), panel.isEnabled());
            }.bind(this));
        }.bind(this);

        if (gravit.panels) {
            for (var i = 0; i < gravit.panels.length; ++i) {
                var panel = gravit.panels[i];

                _addPanelInfo(panel);

                // Activate the first panel found
                if (!this._activePanel) {
                    this.setActivePanel(panel.getId());
                }
            }
        }
    };

    /**
     * Called from the workspace to relayout
     */
    GPanels.prototype.relayout = function () {
        // NO-OP
    };

    /** @private */
    GPanels.prototype._getPanelInfo = function (panelId) {
        for (var i = 0; i < this._panels.length; ++i) {
            var panel = this._panels[i].panel;
            if (panel.getId() === panelId) {
                return this._panels[i];
            }
        }
    };

    _.GPanels = GPanels;
})(this);