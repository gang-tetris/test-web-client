'use strict';

class PersonManager {

    constructor(statusBar, panel, portField) {
        this._statusBar = statusBar;
        this._panel = panel;
        this._portField = portField;
        this.checkPorts();
    }

    setPort(port) {
        this._port = port;
    }

    setStatus(description, error, code) {
        this._statusBar.innerHTML = description;
        if (!!code) {
             this._statusBar.innerHTM += `(${code})`;
        } else {
        }
        if (!!error) {
            this._statusBar.className = 'alert alert-danger';
        } else {
            this._statusBar.className = 'alert alert-success';
        }
    }

    loadPerson(name) {
        this.setStatus(`Loading ${name}`);
        var data_file = `http://localhost:${this._port}/${name}`;
        var http_request = new XMLHttpRequest();

        http_request.onreadystatechange = this.gotPerson.bind(
                                                         this, http_request);
        http_request.open('GET', data_file, true);

        http_request.send();
    }

    savePerson(name, age) {
        var data_file = `http://localhost:${this._port}/`;
        var http_request = new XMLHttpRequest();

        http_request.onreadystatechange = this.sentPerson.bind(
                                                          this, http_request);
        http_request.open("POST", data_file, true);
        http_request.setRequestHeader('Content-Type', 'application/json');
        var data = {
            name: name,
            age: age
        };
        http_request.send(JSON.stringify(data));
    }

    gotPerson(http_request) {
        if (http_request.readyState == 4 && http_request.status) {
            this.setStatus(`Parsing GET result`);
            try {
                console.log(http_request.responseText);
                var jsonObj = JSON.parse(http_request.responseText);
                if (jsonObj.success) {
                    this.displayPerson(jsonObj.response.person,
                                       false, http_request.status);
                    this.displayServicesInfo(jsonObj.response);
                } else {
                    this.setStatus(jsonObj.error || "Error occured",
                                   true, http_request.status);
                    this.displayServicesInfo();
                }
            } catch (e) {
                this.setStatus(e.toString(), true, http_request.status);
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
                    this.displayPerson(jsonObj.response.person,
                                       false, http_request.status);
                    this.displayServicesInfo(jsonObj.response);
                } else {
                    this.setStatus(jsonObj.error || "Error occured",
                                   true, http_request.status);
                    this.displayServicesInfo();
                }
            } catch (e) {
                this.setStatus(e.toString(), true, http_request.status);
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
            return;
        }
        Object.keys(response).forEach((key) => {
            if (['rest', 'logic', 'repository'].indexOf(key) > -1) {
                window.document.getElementById(`${key}-service`).innerHTML =
                    response[key];
            }
        });
    }

    checkPorts() {
        var port = 8080;
        this.checkPort(port, [], (err, ports) => {
            this.setPorts(ports);
        });
    }

    setPorts(ports) {
        console.log(`Set ports ${ports}`);
        let port = this._port;
        while (this._portField.firstChild) {
            this._portField.removeChild(this._portField.firstChild);
        }
        ports.forEach((i) => {
            let opt = window.document.createElement("option");
            opt.value = i;
            opt.textContent = i;
            this._portField.appendChild(opt);
        });
        !port && (this._port = port = ports[0]);
        this._portField.value = port;
        setTimeout(this.checkPorts.bind(this), 10000);
    }

    checkPort(port, ports, callback) {
        var data_file = `http://localhost:${port}`;
        var http_request = new XMLHttpRequest();

        http_request.onreadystatechange = () => {
            if (http_request.readyState == 4) {
                if (http_request.status == 200) {
                    ports.push(port);
                }
                if (port > 8089) {
                    return callback(null, ports);
                }
                this.checkPort(port + 1, ports, callback);
            }
        }
        http_request.open("OPTIONS", data_file, true);
        http_request.send();
    }
}

