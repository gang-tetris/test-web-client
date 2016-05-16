'use strict';

window.onload = () => {
    var statusBar = window.document.getElementById('status');
    var personManager = new PersonManager(statusBar);
    var personNameField = window.document.getElementById('name');
    var personAgeField = window.document.getElementById('age');
    window.document.getElementById('loader').onclick = () => {
        personManager.loadPerson(personNameField.value);
    }
    window.document.getElementById('saver').onclick = () => {
        personManager.savePerson(personNameField.value, personAgeField.value);
    }
}

