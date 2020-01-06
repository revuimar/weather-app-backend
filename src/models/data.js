const sql = require('sql');

let stats = sql.define({
    name: 'stats',
    columns: [
        'id',
        'data'
    ]
});