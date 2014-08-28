(function (_) {

    /**
     * Base class for a view
     * @class GView
     * @extends GEventTarget
     * @constructor
     */
    function GView() {
    };
    IFObject.inherit(GView, GEventTarget);

    // -----------------------------------------------------------------------------------------------------------------
    // GView.UpdateEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever the view requires an update like changed
     * title or enabled status
     * @class GView.UpdateEvent
     * @extends GEvent
     * @constructor
     */
    GView.UpdateEvent = function () {
    };
    IFObject.inherit(GView.UpdateEvent, GEvent);

    /** @override */
    GView.UpdateEvent.prototype.toString = function () {
        return "[Object GView.UpdateEvent]";
    };

    GView.UPDATE_EVENT = new GView.UpdateEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GView.DocumentState Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A class that keeps a Palette-State for each document
     * @class GView.DocumentState
     * @constructor
     */
    GView.DocumentState = function (document) {
        this.document = document;
    };

    /**
     * @type {GDocument}
     */
    GView.DocumentState.prototype.document = null;

    /**
     * Called whenever this state gets activated
     */
    GView.DocumentState.prototype.activate = function () {
        // NO-OP
    };

    /**
     * Called whenever this state gets deactivated
     */
    GView.DocumentState.prototype.deactivate = function () {
        // NO-OP
    };

    /**
     * Called when this state gets initialized
     */
    GView.DocumentState.prototype.init = function () {
        // NO-OP
    };

    /**
     * Called when this state gets released
     */
    GView.DocumentState.prototype.release = function () {
        // NO-OP
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GView Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {Array<GView.DocumentState>}
     * @private
     */
    GView.prototype._documentStates = null;

    /**
     * Get the unique id of the view.
     */
    GView.prototype.getId = function () {
        throw new Error("Not Supported");
    };

    /**
     * Get the title of the view
     * @return {String|IFLocale.Key}
     */
    GView.prototype.getTitle = function () {
        throw new Error("Not Supported");
    };

    /**
     * Should create a new state for a given document if desired.
     * @param {GDocument} document
     * @return {GView.DocumentState}
     * @private
     */
    GView.prototype._createDocumentState = function (document) {
        return null;
    };

    /**
     * Called whenever a given document state should be activated
     * @param {GView.DocumentState} state
     * @private
     */
    GView.prototype._activateDocumentState = function (state) {
        // NO-OP
    };

    /**
     * Called whenever a given document state should be deactivated
     * @param {GView.DocumentState} state
     * @private
     */
    GView.prototype._deactivateDocumentState = function (state) {
        // NO-OP
    };

    /**
     * @param {GApplication.DocumentEvent} event
     * @private
     */
    GView.prototype._documentEvent = function (event) {
        switch (event.type) {
            case GApplication.DocumentEvent.Type.Added:
                // Initiate a new state and add it
                var state = this._createDocumentState(event.document);
                if (state) {
                    state.init();
                    if (!this._documentStates) {
                        this._documentStates = [];
                    }

                    this._documentStates.push(state);

                    this.trigger(GView.UPDATE_EVENT);
                }
                break;
            case GApplication.DocumentEvent.Type.Removed:
                // Find and release state
                var state = this._findDocumentState(event.document);
                if (state) {
                    state.release();
                    this._documentStates.splice(this._documentStates.indexOf(state), 1);

                    if (this._documentStates.length === 0) {
                        this._documentStates = null;
                    }

                    this.trigger(GView.UPDATE_EVENT);
                }
                break;
            case GApplication.DocumentEvent.Type.Activated:
                // Find and activate state
                var state = this._findDocumentState(event.document);
                if (state) {
                    state.activate();
                    this._activateDocumentState(state);

                    this.trigger(GView.UPDATE_EVENT);
                }
                break;
            case GApplication.DocumentEvent.Type.Deactivated:
                // Find and deactivate state
                var state = this._findDocumentState(event.document);
                if (state) {
                    state.deactivate();
                    this._deactivateDocumentState(state);

                    this.trigger(GView.UPDATE_EVENT);
                }
                break;

            default:
                break;
        }
    };

    /**
     * @param {GDocument} document
     * @return {GView.DocumentState}
     * @private
     */
    GView.prototype._findDocumentState = function (document) {
        if (!this._documentStates) {
            return null;
        }

        for (var i = 0; i < this._documentStates.length; ++i) {
            if (this._documentStates[i].document === document) {
                return this._documentStates[i];
            }
        }
    };

    /** @override */
    GView.prototype.toString = function () {
        return "[Object GView]";
    };

    _.GView = GView;
})(this);