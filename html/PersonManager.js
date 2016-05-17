'use strict';

class PersonManager {

    constructor(statusBar, panel, portField, historyPanel) {
        this._statusBar = statusBar;
        this._panel = panel;
        this._portField = portField;
        this._historyPanel = historyPanel;

        this._history = [];
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
        var url = `http://localhost:${this._port}/${name}`;
        var http_request = new XMLHttpRequest();

        var historyEntry = this.addHistoryEntry({
            type: 'request',
            method: 'GET',
            url: url,
            data: {
                name: name
            }
        });
        http_request.onreadystatechange = this.gotPerson.bind(this,
                                               http_request, historyEntry);
        http_request.open('GET', url, true);

        http_request.send();
    }

    savePerson(name, age) {
        var url = `http://localhost:${this._port}/`;
        var http_request = new XMLHttpRequest();

        var data = {
            name: name,
            age: age
        };
        var historyEntry = this.addHistoryEntry({
            type: 'request',
            method: 'POST',
            url: url,
            data: data
        });

        http_request.onreadystatechange = this.sentPerson.bind(this,
                                               http_request, historyEntry);
        http_request.open("POST", url, true);
        http_request.setRequestHeader('Content-Type', 'application/json');
        http_request.send(JSON.stringify(data));
    }

    gotPerson(http_request, historyEntry) {
        if (http_request.readyState == 4 && http_request.status) {
            this.setStatus(`Parsing GET result`);
            try {
                console.log(http_request.responseText);
                var jsonObj = JSON.parse(http_request.responseText);
                if (jsonObj.success) {
                    this.displayPerson(jsonObj.response.person,
                                       false, http_request.status);
                    this.displayServicesInfo(jsonObj.response);
                    this.setHistoryEntryState(historyEntry, true);
                } else {
                    this.setStatus(jsonObj.error || "Error occured",
                                   true, http_request.status);
                    this.displayServicesInfo();
                    this.setHistoryEntryState(historyEntry, false);
                }
            } catch (e) {
                this.setStatus(e.toString(), true, http_request.status);
                this.displayServicesInfo();
                this.setHistoryEntryState(historyEntry, false);
            }
        }
    }

    sentPerson(http_request, historyEntry) {
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
                    this.setHistoryEntryState(historyEntry, true);
                } else {
                    this.setStatus(jsonObj.error || "Error occured",
                                   true, http_request.status);
                    this.displayServicesInfo();
                    this.setHistoryEntryState(historyEntry, false);
                }
            } catch (e) {
                this.setStatus(e.toString(), true, http_request.status);
                this.displayServicesInfo();
                this.setHistoryEntryState(historyEntry, false);
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
        var url = `http://localhost:${port}`;
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
        http_request.open("OPTIONS", url, true);
        http_request.send();
    }

    addHistoryEntry(entry) {
        this._history.push(entry);
        var content = '';
        if (entry.type === 'request') {
            if (entry.method === 'GET') {
                content = `${entry.method} => ${entry.url}`;
            } else if (entry.method === 'POST') {
                content = `${entry.method} => ${entry.url}
                          (${entry.data.name}, ${entry.data.age})`;
            }
        }
        var id = `history-${this._history.length-1}`;
        var newItem = document.createElement("li");
        newItem.id = id;
        var textnode = document.createTextNode(content);
        newItem.appendChild(textnode);
        this._historyPanel.insertBefore(newItem, this._historyPanel.childNodes[0]);
        
        window.document.getElementById(id).onclick = this.restoreHistoryEntry.bind(this, this._history.length-1);
        return this._history.length-1;
    }

    setHistoryEntryState(number, success) {
        var id = `history-${number}`;
        var className = 'list-group-item-' + (success? 'success' : 'danger');
        window.document.getElementById(id).className = className;
    }

    restoreHistoryEntry(number) {
        console.log(`Entry ${JSON.stringify(this._history[number])}`);
        if ('name' in this._history[number].data) {
            window.document.getElementById('name').value =
                this._history[number].data.name;
        }
        if ('age' in this._history[number].data) {
            window.document.getElementById('age').value =
                this._history[number].data.age;
        }
    }
}

