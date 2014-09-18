(function () {
    gDevelopment.tests.push({
        title: 'Serialize Scene',
        test: function () {
            vex.dialog.prompt({
                message: 'Serializd JSON String:',
                value: IFNode.serialize(gApp.getActiveDocument().getScene())
            });
        }
    });
})();
