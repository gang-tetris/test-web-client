'use strict';

class PersonManager {

    constructor(statusBar) {
        this._statusBar = statusBar;
    }

    setStatus(description) {
        this._statusBar.innerHTML = description;
    }

    loadPerson(name) {
        this.setStatus(`Loading ${name}`);
        var data_file = `http://localhost:8080/${name}`;
        var http_request = new XMLHttpRequest();
        http_request = new XMLHttpRequest();

        http_request.onreadystatechange = this.gotPerson.bind(this,
                                                              http_request);
        http_request.open("GET", data_file, true);
        http_request.send();
    }

    savePerson(name, age) {
        var data_file = `http://localhost:8080/`;
        var http_request = new XMLHttpRequest();
        http_request = new XMLHttpRequest();

        http_request.onreadystatechange = this.sentPerson.bind(this,
                                                               http_request);
        http_request.open("POST", data_file, true);
        http_request.setRequestHeader('Content-Type', 'application/json');
        http_request.send(JSON.stringify({
            name: name,
            age: age
        }));
    }

    gotPerson(http_request) {
        if (http_request.readyState == 4){
            this.setStatus(`Parsing GET result`);
            console.log(http_request.responseText);
            var jsonObj = JSON.parse(http_request.responseText);
            if (jsonObj.success) {
                this.setStatus(jsonObj.response);
            } else {
                this.setStatus(jsonObj.error || "Error occured");
            }
        }
    }

    sentPerson(http_request) {
        if (http_request.readyState == 4){
            console.log(`Response is ${http_request}`);
            this.response = http_request;
            console.log(`Response is ${http_request.responseText}`);
            var jsonObj = JSON.parse(http_request.responseText);
            if (jsonObj.success) {
                let person = jsonObj.person;
                this.setStatus(`<div>Name: ${person.name}</div>
                                <div>Age: ${person.age}</div>
                                <div>UUID: ${person.id}</div>`);
            } else {
                this.setStatus(jsonObj.error || "Error occured");
            }
        }
    }
}

