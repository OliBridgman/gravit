(function () {
    gDevelopment.tests.push({
        title: 'Serialize Scene',
        test: function () {
            prompt('JSON-String:', IFNode.serialize(gApp.getActiveDocument().getScene()));
        }
    });
})();
