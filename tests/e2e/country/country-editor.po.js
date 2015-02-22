var Material = require('../material/material-theme.js');

var CountryEditor = function() {
    this.nameInput = element(by.model('model.name'));
    this.descriptionInput = element(by.model('model.description'));
    this.updateImages = element(by.model('modifyStamps'));
    this.saveButton = element(Material.buttonText('Save'));
    this.cancelButton = element(Material.buttonText('Cancel'));

    this.show = function(id) {
        var path = '#!/country-edit';
        if( id ) {
            path += '?id=' + id;
        }
        browser.get(path);
    };

    this.isValid = function( ) {

        return element(by.css('form.ng-valid')).isPresent();
    }

    this.setName = function(name) {
        this.nameInput.sendKeys(name);
    };

    this.setDescription = function(desc) {
        this.descriptionInput.sendKeys(desc);
    };


};

module.exports = new CountryEditor();