var MaterialTheme = function() {

    this.buttonText = function(text) {
        return by.buttonText(text.toUpperCase());
    }
}

module.exports = new MaterialTheme();