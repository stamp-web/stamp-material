var editor = require('./country-editor.po.js');

describe('create country tests', function() {
    it('Basic creation and validation', function() {
        editor.show();
        expect(editor.saveButton.isEnabled()).toBe(false);
        expect(editor.isValid()).toBe(false);
        editor.setName('Test Country');
        editor.setDescription('This is a description');
        expect(editor.updateImages.isPresent()).toBe(false);
        expect(editor.isValid()).toBe(true);
        expect(editor.saveButton.isEnabled()).toBe(true);
    });
});
