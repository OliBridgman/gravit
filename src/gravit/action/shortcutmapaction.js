(function (_) {

    /**
     * Action for showing the shortcut map
     * @class EXShortcutMapAction
     * @extends GUIAction
     * @constructor
     */
    function EXShortcutMapAction() {
    };
    GObject.inherit(EXShortcutMapAction, GUIAction);

    EXShortcutMapAction.ID = 'help.shortcutmap';
    EXShortcutMapAction.TITLE = new GLocale.Key(EXShortcutMapAction, "title");

    /**
     * @override
     */
    EXShortcutMapAction.prototype.getId = function () {
        return EXShortcutMapAction.ID;
    };

    /**
     * @override
     */
    EXShortcutMapAction.prototype.getTitle = function () {
        return EXShortcutMapAction.TITLE;
    };

    /**
     * @override
     */
    EXShortcutMapAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_HELP;
    };

    /**
     * @override
     */
    EXShortcutMapAction.prototype.getGroup = function () {
        return "help";
    };

    /**
     * @override
     */
    EXShortcutMapAction.prototype.isEnabled = function () {
        return true;
    };

    /**
     * @override
     */
    EXShortcutMapAction.prototype.execute = function () {
        var shortcutMaps = [
            {
                // TODO : I18N
                title: 'Actions',
                map: []
            },
            {
                // TODO: I18N
                title: 'Tools',
                map: []
            }
        ];

        // Add actions to shortcut maps
        var actions = [];
        for (var i = 0; i < gApp.getActions().length; ++i) {
            if (gApp.getActions()[i].isAvailable()) {
                actions.push(gApp.getActions()[i]);
            }
        }

        var lastActionCategory = null;
        var lastHint = null;
        for (var i = 0; i <= actions.length; ++i) {
            var action = null, category = null;

            if (i < actions.length) {
                action = actions[i];

                category = gLocale.get(action.getCategory());

                if (!category) {
                    continue;
                }
            }

            if (lastActionCategory != category || i >= actions.length) {
                if (lastHint) {
                    var actionHint = lastHint.asHtml();
                    if (actionHint && lastHint.getKeys()) {
                        shortcutMaps[0].map.push(lastHint);
                    }
                }

                if (i < actions.length) {
                    lastHint = new GUIHint();
                    lastHint.setTitle(action.getCategory());
                    lastActionCategory = category;
                }
            }

            if (i >= actions.length) {
                break;
            }

            var actionShortcut = action.getShortcut();
            if (!actionShortcut) {
                continue;
            }

            lastHint.addKey(actionShortcut, action.getTitle());
        }

        // Add tools to shorcut maps
        var toolCount = gApp.getToolManager().getToolCount();
        for (var i = 0; i < toolCount; ++i) {
            var toolInstance = gApp.getToolManager().getTool(i);
            var toolHint = toolInstance.getHint() ? toolInstance.getHint() : null;
            if (toolHint) {
                shortcutMaps[1].map.push(toolHint);
            }
        }

        var dlg = new GUIShortcutsDialog();
        dlg.setMaps(shortcutMaps);
        dlg.open();
    };

    /** @override */
    EXShortcutMapAction.prototype.toString = function () {
        return "[Object EXShortcutMapAction]";
    };

    _.EXShortcutMapAction = EXShortcutMapAction;
})(this);