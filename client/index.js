const options = {method: "POST"};

//initialise input limit
setInputLimit();

async function dataSize() {
    const size = await fetch("/api/dbsize", options)
        .then(res => res.json())
    return size;
}

function setInputLimit() {
    return dataSize()
        .then(size=> {
            document.getElementById("days").max = parseInt(size.unique_collections);
        })

}

function addColumnHeaders(json, table,container) {
    var columnSet = [],
        tr = document.createElement('tr');
    for(var key in json){
        if(key.toString() !== "timestamp") {
            columnSet.push(key.toString());
            var th = document.createElement('th');
            if (key.toString() === "city"){
                th.appendChild(document.createTextNode(""));
            }
            else {
                th.appendChild(document.createTextNode(key));
            }
            tr.appendChild(th);
        }
    }
    table.appendChild(tr);
    container.appendChild(table);
    return columnSet;
}

function buildHtmlTable(jsonArr,container) {
    var table = document.createElement('table'),
        columns = addColumnHeaders(jsonArr[0], table,container);
    for (var i = 0, maxi = jsonArr.length; i < maxi; ++i) {
        var tr = document.createElement('tr');
        for (var j = 0, maxj = columns.length; j < maxj; ++j) {
            var td = document.createElement('td');
            //cellValue = jsonArr[i][columns[j]];
            if(jsonArr[i][columns[j]] === undefined){
                td.appendChild(document.createTextNode(jsonArr[i]["country"]));
            }else{
                td.appendChild(document.createTextNode(jsonArr[i][columns[j]]));
            }
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    container.appendChild(table);
    return table;
}

async function getData() {
    const days = document.getElementById("days").value;
    var cities = ['Warsaw', 'Lodz', 'Wroclaw', 'Szczecin', 'Rzeszow', 'Krakow', 'Gdansk', 'Suwalki'];
    var data = [];
    for (const city of cities) {
        data.push(await fetch(`/api/average?c=${city}&d=${days}`, options)
            .then(async res => {
                var data = await res.json()
                return data.value
            })
            .catch(err => {
                console.log(err)
            })
        );
    }
    data.push(await fetch(`/api/poland?d=${days}`, options)
        .then(async res => {
            var data = await res.json();
            return data.value
        })
        .catch(err => {
            console.log(err)
        })
    );
    return data;
}
function mergeData(data) {
    var mergerArr = [];
    for(var i =0 ; i<data.length;i++){
        mergerArr.push(data[i][0]);
    }
    return mergerArr;
}
function createTable() {
    const container = document.getElementById("showData");
    const inputField = document.getElementById("days");
    if(!inputField.checkValidity()){
        return;
    }
    setInputLimit()
    container.innerHTML = "";
    return getData()
        .then(data =>{
            buildHtmlTable(data, container);
        } )
        .catch(console.error);
}