(function () {
    gDevelopment.tests.push({
        title: 'Serialize Scene',
        test: function () {
            var jsonCode = IFNode.serialize(gApp.getActiveDocument().getScene());

            vex.dialog.prompt({
                message: 'Serializd JSON String:',
                value: IFUtil.replaceAll(jsonCode, '"', '&quot;')
            });
        }
    });
})();
