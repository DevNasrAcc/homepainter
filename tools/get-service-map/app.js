const fs = require('fs');
const MongoClient = require('../../server-src/node_modules/mongodb').MongoClient;
const assert = require('assert');

let silent = false;
for (let j = 0; j < process.argv.length; j++) {
    if(process.argv[j] === '--silent')
        silent = true;
}

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'homepainter';

// Create a new MongoClient
const client = new MongoClient(url);

// Use connect method to connect to the Server
client.connect(function(err, client) {
    assert.equal(null, err);

    if(!silent)
        console.log("Connected correctly to server");

    const db = client.db(dbName);

    simplePipeline(db, function(documents) {
        client.close();

        let cities = [];
        let zips = [];

        for(let i = 0; i < documents.length; i++) {
            zips.push(documents[i].zipCode);
            cities = cities.concat(documents[i].cities);
        }

        // dedupe and sort
        zips = zips.sort().filter((item, pos, ary) => !pos || item !== ary[pos - 1]);
        cities = cities.sort().filter((item, pos, ary) => !pos || item !== ary[pos - 1]);

        fs.writeFile("zips.txt", zips, function(err, data) {
            if (err) console.error(err);

            if(!silent)
                console.log("Successfully Written to File.");
        });

        fs.writeFile("cities.txt", cities, function(err, data) {
            if (err) console.error(err);

            if(!silent)
                console.log("Successfully Written to File.");
        });
    });
});

function simplePipeline(db, callback) {
    const collection = db.collection( 'locationdatas' );
    collection.aggregate(
        [ { $match: { serviced: true } }, { $project: { zipCode: '$zipCode', cities : '$city' } } ],
        function(err, cursor) {
            assert.equal(err, null);

            cursor.toArray(function(err, documents) {
                callback(documents);
            });
        }
    );
}