(function (_) {
    /**
     * An instance of an opened project
     * @class GProject
     * @extends GEventTarget
     * @constructor
     */
    function GProject(directory, name) {
        this._directory = directory;
        this._name = name;

        // TODO : Load project
    };
    GObject.inherit(GProject, GEventTarget);

    /**
     * The underlying directory
     * @type {*}
     * @private
     */
    GProject.prototype._directory = null;

    /**
     * The name of the project
     * @type {String}
     * @private
     */
    GProject.prototype._name = null;

    /**
     * Returns the directory of the project
     * @returns {*}
     */
    GProject.prototype.getDirectory = function () {
        return this._directory;
    };

    /**
     * Returns the name for the project
     * @return {String}
     */
    GProject.prototype.getName = function () {
        return this._name;
    };

    /**
     * Save the project
     */
    GProject.prototype.save = function () {
        // TODO
    };

    /**
     * Called before this project gets activated
     */
    GProject.prototype.activate = function () {
        // NO-OP
    };

    /**
     * Called before this project gets deactivated
     */
    GProject.prototype.deactivate = function () {
        // NO-OP
    };

    /**
     * Called when this project gets released
     */
    GProject.prototype.release = function () {
        // NO-OP
    };

    _.GProject = GProject;
})(this);
