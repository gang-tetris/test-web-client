'use strict';

class PersonManager {

    constructor(statusBar, panel) {
        this._statusBar = statusBar;
        this._panel = panel;
    }

    setStatus(description, error) {
        this._statusBar.innerHTML = description;
        if (!!error) {
            this._statusBar.className = 'alert alert-danger';
        } else {
            this._statusBar.className = 'alert alert-success';
        }
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
            try {
                console.log(http_request.responseText);
                var jsonObj = JSON.parse(http_request.responseText);
                if (jsonObj.success) {
                    this.displayPerson(jsonObj.response.person);
                    this.displayServicesInfo(jsonObj.response);
                } else {
                    this.setStatus(jsonObj.error || "Error occured", true);
                    this.displayServicesInfo();
                }
            } catch (e) {
                this.setStatus(e.toString(), true);
                this.displayServicesInfo();
            }
        }
    }

    sentPerson(http_request) {
        if (http_request.readyState == 4){
            this.setStatus(`Parsing POST result`);
            try {
                this.response = http_request;
                console.log(`Response is ${http_request.responseText}`);
                var jsonObj = JSON.parse(http_request.responseText);
                if (jsonObj.success) {
                    this.displayPerson(jsonObj.response.person);
                    this.displayServicesInfo(jsonObj.response);
                } else {
                    this.setStatus(jsonObj.error || "Error occured", true);
                    this.displayServicesInfo();
                }
            } catch (e) {
                this.setStatus(e.toString(), true);
                this.displayServicesInfo();
            }
        }
    }

    displayPerson(person) {
        this.setStatus(`<div>Name: ${person.name}</div>
                        <div>Age: ${person.age}</div>
                        <div>UUID: ${person.id}</div>`);
    }

    displayServicesInfo(response) {
        if (!response) {
            ['rest', 'logic', 'repository'].forEach((key) => {
                window.document.getElementById(`${key}-service`).innerHTML = '';
            })
        }
        Object.keys(response).forEach((key) => {
            if (['rest', 'logic', 'repository'].indexOf(key) > -1) {
                window.document.getElementById(`${key}-service`).innerHTML =
                    response[key];
            }
        });
    }
}

