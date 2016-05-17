'use strict';

window.onload = () => {
    var statusBar = window.document.getElementById('status');
    var panel = window.document.getElementById('manager-panel');
    var portField = window.document.getElementById('port');
    var historyPanel = window.document.getElementById('history');

    var personManager = new PersonManager(statusBar, panel, portField,
                                          historyPanel);
    var personNameField = window.document.getElementById('name');
    var personAgeField = window.document.getElementById('age');

    window.document.getElementById('loader').onclick = () => {
        personManager.loadPerson(personNameField.value);
    }
    window.document.getElementById('saver').onclick = () => {
        personManager.savePerson(personNameField.value, personAgeField.value);
    }
    portField.onchange = () => {
        personManager.setPort(portField.value);
    }
}

