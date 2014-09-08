(function (_) {
    /**
     * The global sidebars class
     * @class GSidebars
     * @constructor
     */
    function GSidebars(htmlElement) {
        this._htmlElement = htmlElement;
    };

    /**
     * @type {JQuery}
     * @private
     */
    GSidebars.prototype._htmlElement = null;

    /**
     * @type {Array<{{container: JQuery, sidebar: GSidebar}}>}
     * @private
     */
    GSidebars.prototype._sidebars = null;

    /**
     * @type {String}
     * @private
     */
    GSidebars.prototype._activeSidebar = null;

    /**
     * @returns {String} the id of the active sidebar or null for none
     */
    GSidebars.prototype.getActiveSidebar = function () {
        return this._activeSidebar;
    };

    /**
     * Set an active sidebar
     * @param {String} sidebarId
     */
    GSidebars.prototype.setActiveSidebar = function (sidebarId) {
        if (sidebarId !== this._activeSidebar) {
            for (var i = 0; i < this._sidebars.length; ++i) {
                var sidebar = this._sidebars[i];
                var id = sidebar.sidebar.getId();

                if (id === sidebarId) {
                    sidebar.container.css('display', '');
                    sidebar.sidebar.activate();
                } else {
                    sidebar.container.css('display', 'none');
                    if (id === this._activeSidebar) {
                        sidebar.sidebar.deactivate();
                    }
                }
            }

            this._activeSidebar = sidebarId;
        }
    };

    /**
     * Enable or disable a sidebar
     * @param {String} sidebarId
     * @param {Boolean} enabled
     */
    GSidebars.prototype.setSidebarEnabled = function (sidebarId, enabled) {
        var sidebarInfo = this._getSidebarInfo(sidebarId);
        if (sidebarInfo) {
            if (enabled) {
                sidebarInfo.container.find('.g-disabled-overlay').remove();
                sidebarInfo.container.removeClass('g-disabled');
            } else {
                var overlay = sidebarInfo.container.find('.g-disabled-overlay');

                if (overlay.length === 0) {
                    overlay = $('<div></div>')
                        .addClass('g-disabled-overlay')
                        .appendTo(sidebarInfo.container);
                }

                sidebarInfo.container.addClass('g-disabled');
            }
        }
    };

    /**
     * Called from the workspace to initialize
     */
    GSidebars.prototype.init = function () {
        this._sidebars = [];

        var _addSidebarInfo = function (sidebar) {
            var container = $('<div></div>')
                .addClass('sidebar-container sidebar-' + sidebar.getId())
                .css('display', 'none')
                .appendTo(this._htmlElement);

            sidebar.init(container);

            this.setSidebarEnabled(sidebar.getId(), sidebar.isEnabled());

            this._sidebars.push({
                container: container,
                sidebar: sidebar
            });

            // Add update listener to sidebar
            sidebar.addEventListener(GView.UpdateEvent, function () {
                this.setSidebarEnabled(sidebar.getId(), sidebar.isEnabled());
            }.bind(this));
        }.bind(this);

        if (gravit.sidebars) {
            for (var i = 0; i < gravit.sidebars.length; ++i) {
                var sidebar = gravit.sidebars[i];

                _addSidebarInfo(sidebar);
            }
        }
    };

    /**
     * Called from the workspace to relayout
     */
    GSidebars.prototype.relayout = function () {
        // NO-OP
    };

    /** @private */
    GSidebars.prototype._getSidebarInfo = function (sidebarId) {
        for (var i = 0; i < this._sidebars.length; ++i) {
            var sidebar = this._sidebars[i].sidebar;
            if (sidebar.getId() === sidebarId) {
                return this._sidebars[i];
            }
        }
    };

    _.GSidebars = GSidebars;
})(this);