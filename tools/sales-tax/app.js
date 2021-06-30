(async function() {
    'use strict';

    const request = require('request-promise-native');

    const address = {
        streetAddress: '2717 sw prairie trail parkway',
        city: 'Ankeny',
        state: 'IA',
        zipCode: '50023'
    };

    const findAddressCandidates = {
        uri: 'https://geoservices.iowa.gov/arcgis/rest/services/location/UnitedStates/GeocodeServer/findAddressCandidates'
            + `?address=${address.streetAddress}`
            + `&city=${address.city}`
            + `&zip_code=${address.zipCode}`
            + `&state=${address.state}`
            + '&category='
            + '&outFields=*'
            + '&f=json'
            + '&sensor=false',
        headers: { 'contentType': 'application/json' },
        json: true // Automatically parses the JSON string in the response
    };

    const findAddressCandidatesResp = await request(findAddressCandidates);
    const wkid = findAddressCandidatesResp.spatialReference.wkid;
    const geometry = findAddressCandidatesResp.candidates[0].location;
    geometry.spatialReference = { wkid: wkid };

    const query = {
        uri: 'https://geoservices.iowa.gov/arcgis/rest/services/revenue/SalesTaxRates/FeatureServer/1/query'
            + '?f=json'
            + `&where=`
            + `&returnGeometry=true`
            + `&spatialRel=esriSpatialRelIntersects`
            + `&geometry=${encodeURIComponent(JSON.stringify(geometry))}`
            + '&geometryType=esriGeometryPoint'
            + `&inSR=${wkid}`
            + '&outFields=*'
            + `&outSR=${wkid}`,
        headers: { 'contentType': 'application/json' },
        json: true // Automatically parses the JSON string in the response
    };
    const queryResp = await request(query);

    const iowaSalesTax = 6;
    const localSalesTax = queryResp.features.length === 0
        ? 0
        : queryResp.features[0].attributes.taxrate * 100;

    const total = iowaSalesTax + localSalesTax;

    console.log('-------------------------------');
    console.log('|  Iowa Sales Tax   |  %s.00\%  |', iowaSalesTax);
    console.log('|  Local Sales Tax  |  %s.00\%  |', localSalesTax);
    console.log('-------------------------------');
    console.log('|  Total Sales Tax  |  %s.00\%  |', total);
    console.log('-------------------------------');

    process.exit(0);
})();
