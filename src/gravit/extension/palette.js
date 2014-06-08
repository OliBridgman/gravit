(function (_) {

    /**
     * Base class for an palette
     * @class GPalette
     * @extends GEventTarget
     * @constructor
     */
    function GPalette() {
        this._documentStates = [];
    };
    IFObject.inherit(GPalette, GEventTarget);

    // -----------------------------------------------------------------------------------------------------------------
    // GPalette.UpdateEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever the palette requires an update like changed
     * title or enabled status
     * @class GPalette.UpdateEvent
     * @extends GEvent
     * @constructor
     */
    GPalette.UpdateEvent = function () {
    };
    IFObject.inherit(GPalette.UpdateEvent, GEvent);

    /** @override */
    GPalette.UpdateEvent.prototype.toString = function () {
        return "[Object GPalette.UpdateEvent]";
    };

    GPalette.UPDATE_EVENT = new GPalette.UpdateEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GPalette.DocumentState Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A class that keeps a Palette-State for each document
     * @class GPalette.DocumentState
     * @constructor
     */
    GPalette.DocumentState = function (document) {
        this.document = document;
    };

    /**
     * @type {GDocument}
     */
    GPalette.DocumentState.prototype.document = null;

    /**
     * Called whenever this state gets activated
     */
    GPalette.DocumentState.prototype.activate = function () {
        // NO-OP
    };

    /**
     * Called whenever this state gets deactivated
     */
    GPalette.DocumentState.prototype.deactivate = function () {
        // NO-OP
    };

    /**
     * Called when this state gets initialized
     */
    GPalette.DocumentState.prototype.init = function () {
        // NO-OP
    };

    /**
     * Called when this state gets released
     */
    GPalette.DocumentState.prototype.release = function () {
        // NO-OP
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GPalette Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {Array<GPalette.DocumentState>}
     * @private
     */
    GPalette.prototype._documentStates = null;

    /**
     * Get the unique id of the palette.
     */
    GPalette.prototype.getId = function () {
        throw new Error("Not Supported");
    };

    /**
     * Get the title of the palette
     * @return {String|IFLocale.Key}
     */
    GPalette.prototype.getTitle = function () {
        throw new Error("Not Supported");
    };

    /**
     * Get the default group of the palette, null for none
     * @return {String}
     */
    GPalette.prototype.getGroup = function () {
        return null;
    };

    /**
     * Get the default shortcut of the palette to activate it
     * @return {Array<Number>}
     * @version 1.0
     */
    GPalette.prototype.getShortcut = function () {
        return null;
    };

    /**
     * Whether the palette is enabled or. Note that this
     * will only disable the palette's panel so if the
     * palette provides a custom menu, the enabled status
     * of those needs to be manually managed by the palette.
     * @return {Boolean}
     */
    GPalette.prototype.isEnabled = function () {
        return true;
    };

    /**
     * Called to let the palette initialize on a given panel
     * and within a given menu if any
     * @param {HTMLDivElement} htmlElement the panel
     * @param {GUIMenu} menu the menu
     * @version 1.0
     */
    GPalette.prototype.init = function (htmlElement, menu) {
        gApp.addEventListener(GApplication.DocumentEvent, this._documentEvent, this);
    };

    /**
     * Should create a new state for a given document if desired.
     * @param {GDocument} document
     * @return {GPalette.DocumentState}
     * @private
     */
    GPalette.prototype._createDocumentState = function (document) {
        return null;
    };

    /**
     * Called whenever a given document state should be activated
     * @param {GPalette.DocumentState} state
     * @private
     */
    GPalette.prototype._activateDocumentState = function (state) {
        // NO-OP
    };

    /**
     * Called whenever a given document state should be deactivated
     * @param {GPalette.DocumentState} state
     * @private
     */
    GPalette.prototype._deactivateDocumentState = function (state) {
        // NO-OP
    };

    /**
     * @param {GApplication.DocumentEvent} event
     * @private
     */
    GPalette.prototype._documentEvent = function (event) {
        switch (event.type) {
            case GApplication.DocumentEvent.Type.Added:
                // Initiate a new state and add it
                var state = this._createDocumentState(event.document);
                if (state) {
                    state.init();
                    this._documentStates.push(state);

                    this.trigger(GPalette.UPDATE_EVENT);
                }
                break;
            case GApplication.DocumentEvent.Type.Removed:
                // Find and release state
                var state = this._findDocumentState(event.document);
                if (state) {
                    state.release();
                    this._documentStates.splice(this._documentStates.indexOf(state), 1);

                    this.trigger(GPalette.UPDATE_EVENT);
                }
                break;
            case GApplication.DocumentEvent.Type.Activated:
                // Find and activate state
                var state = this._findDocumentState(event.document);
                if (state) {
                    state.activate();
                    this._activateDocumentState(state);

                    this.trigger(GPalette.UPDATE_EVENT);
                }
                break;
            case GApplication.DocumentEvent.Type.Deactivated:
                // Find and deactivate state
                var state = this._findDocumentState(event.document);
                if (state) {
                    state.deactivate();
                    this._deactivateDocumentState(state);

                    this.trigger(GPalette.UPDATE_EVENT);
                }
                break;

            default:
                break;
        }
    };

    /**
     * @param {GDocument} document
     * @return {GPalette.DocumentState}
     * @private
     */
    GPalette.prototype._findDocumentState = function (document) {
        for (var i = 0; i < this._documentStates.length; ++i) {
            if (this._documentStates[i].document === document) {
                return this._documentStates[i];
            }
        }
    };

    /** @override */
    GPalette.prototype.toString = function () {
        return "[Object GPalette]";
    };

    _.GPalette = GPalette;
})(this);