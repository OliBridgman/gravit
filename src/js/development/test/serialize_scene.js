(function () {
    gDevelopment.tests.push({
        title: 'Serialize Scene',
        test: function () {
            var jsonCode = GNode.serialize(gApp.getActiveDocument().getScene());

            vex.dialog.prompt({
                message: 'Serialized JSON String:',
                value: GUtil.replaceAll(jsonCode, '"', '&quot;')
            });
        }
    });
})();
