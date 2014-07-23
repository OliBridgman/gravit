(function (_) {

    /**
     * Action for deleting the active page
     * @class GDeletePageAction
     * @extends GAction
     * @constructor
     */
    function GDeletePageAction() {
    };
    IFObject.inherit(GDeletePageAction, GAction);

    GDeletePageAction.ID = 'modify.delete-page';
    GDeletePageAction.TITLE = new IFLocale.Key(GDeletePageAction, "title");

    /**
     * @override
     */
    GDeletePageAction.prototype.getId = function () {
        return GDeletePageAction.ID;
    };

    /**
     * @override
     */
    GDeletePageAction.prototype.getTitle = function () {
        return GDeletePageAction.TITLE;
    };

    /**
     * @override
     */
    GDeletePageAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_MODIFY;
    };

    /**
     * @override
     */
    GDeletePageAction.prototype.getGroup = function () {
        return "page";
    };

    /**
     * @param {IFPage} [page] the page to be removed, if null takes the active one
     * @override
     */
    GDeletePageAction.prototype.isEnabled = function (page) {
        if (!page) {
            page = gApp.getActiveDocument() ? gApp.getActiveDocument().getScene().getActivePage() : null;
        }

        return !!page;
    };

    /**
     * @param {IFPage} [page] the page to be removed, if null takes the active one
     * @override
     */
    GDeletePageAction.prototype.execute = function (page) {
        var page = page || gApp.getActiveDocument().getScene().getActivePage();
        var scene = page.getScene();

        if (!scene) {
            throw new Error('No scene on page.');
        }

        // Figure other page either previous or next one
        var otherPage = null;

        for (var node = page.getPrevious(); node !== null; node = node.getPrevious()) {
            if (node instanceof IFPage) {
                otherPage = node;
                break;
            }
        }

        if (!otherPage) {
            for (var node = page.getNext(); node !== null; node = node.getNext()) {
                if (node instanceof IFPage) {
                    otherPage = node;
                    break;
                }
            }
        }

        // If there's no other page, stop here as we need at least one page in the scene
        if (!otherPage) {
            // TODO : I18N
            alert('Unable to delete - the document needs to contain at least one page.');
            return;
        }

        // If page is active, de-activate it first and activate the other one
        if (page.hasFlag(IFNode.Flag.Active)) {
            scene.setActivePage(otherPage);
        }

        // Finally we can remove the page
        // TODO : I18N
        IFEditor.tryRunTransaction(scene, function () {
            page.getParent().removeChild(page);
        }, 'Delete Page');
    };

    /** @override */
    GDeletePageAction.prototype.toString = function () {
        return "[Object GDeletePageAction]";
    };

    _.GDeletePageAction = GDeletePageAction;
})(this);