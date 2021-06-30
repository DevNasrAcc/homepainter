(function () {
  'use strict';

  const fs = require('fs');
  const path = require('path');
  const join = path.join;
  require('../mongooseConnector')(start);
  const constants = require('../../server-src/src/config/constants');
  const LocationData = require('../../server-src/src/dbsmodel/locationData/locationData');

  const dotEnv = require('../../server-src/node_modules/dotenv')
      .config({
        path: path.join(__dirname, '..', '..', 'server-src', '.env')
      });

  if(dotEnv.error)
    throw dotEnv.error;

  let silent = false;
  for (let j = 0; j < process.argv.length; j++) {
    if(process.argv[j] === '--silent')
      silent = true;
  }

  async function start() {
    const data = fs.readFileSync(join(__dirname, './free-zipcode-database.csv'), 'utf8');
    const lines = data.split('\n');
    const devZipCodes = [50010, 50011, 50014];
    const servicedZipCodes = require('./zipcode-array.json');

    const zipTaxData = fs.readFileSync(join(__dirname, './TAXRATES_ZIP5_IA201905.csv'), 'utf8');
    const taxLines = zipTaxData.split('\n');
    let zipTax = {};
    /* for each row, r, in taxLines, zipTax[r.zipcode] = r.EstimatedCombinedRate */
    for (let i = 1; i < taxLines.length; i++) {
      const data = taxLines[i].split(',');
      zipTax[data[1]] = data[4];
    }

    if(!silent)
      console.log(lines.length);

    for (let i = 1; i < lines.length; i++) {
      const data = lines[i].split(',');

      if (data[2] !== 'IA')
        continue;

      // if in development, only upload pre-assigned zip codes.
      if (process.env.NODE_ENV === 'development' && devZipCodes.indexOf(parseInt(data[0])) < 0) {
        continue;
      }

      data[1] = data[1].toLowerCase();

      const dbsData = {
        zipCode: data[0],
        depositPercent: 0.1,
        salesTaxRate: parseInt(data[0]) in zipTax ? zipTax[data[0]] : 7, //if zipCode exists as a field in zipTax, then salesTaxRate = zipTax[zipCode]
        city: data[1],
        state: data[2],
        country: data[3],
        serviced: servicedZipCodes.indexOf(parseInt(data[0])) >= 0,
        laborRate: 17,
        markup: 2.575,
        house: {
          livingRoom: {
            size: [
              {
                name: "small",
                length: 10,
                width: 10,
                prepHours: 0.25,
                label: "10'x10' or less"
              },
              {
                name: "medium",
                length: 15,
                width: 15,
                prepHours: 0.5,
                label: "10'x10' to 15'x15'"
              },
              {
                name: "large",
                length: 20,
                width: 20,
                prepHours: 1,
                label: "15'x15' to 20'x20'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1
          },
          bedRoom: {
            size: [
              {
                name: "small",
                length: 10,
                width: 10,
                prepHours: 0.25,
                label: "10'x10' or less"
              },
              {
                name: "medium",
                length: 15,
                width: 15,
                prepHours: 0.5,
                label: "10'x10' to 15'x15'"
              },
              {
                name: "large",
                length: 20,
                width: 20,
                prepHours: 1,
                label: "15'x15' to 20'x20'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1
          },
          bathroom: {
            size: [
              {
                name: "small",
                length: 5,
                width: 5,
                prepHours: 0.15,
                label: "5'x5' to less"
              },
              {
                name: "medium",
                length: 5,
                width: 8,
                prepHours: 0.25,
                label: "5'x5' to 5'x8'"
              },
              {
                name: "large",
                length: 8,
                width: 10,
                prepHours: 0.75,
                label: "5'x8' to 8'x10'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1.1
          },
          diningRoom: {
            size: [
              {
                name: "small",
                length: 10,
                width: 10,
                prepHours: 0.25,
                label: "10'x10' or less"
              },
              {
                name: "medium",
                length: 15,
                width: 15,
                prepHours: 0.5,
                label: "10'x10' to 15'x15'"
              },
              {
                name: "large",
                length: 20,
                width: 20,
                prepHours: 1,
                label: "15'x15' to 20'x20'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1
          },
          kitchen: {
            size: [
              {
                name: "small",
                length: 7,
                width: 10,
                prepHours: 0.25,
                label: "7'x10' or less"
              },
              {
                name: "medium",
                length: 12,
                width: 12,
                prepHours: 0.5,
                label: "7'x10' to 12'x12'"
              },
              {
                name: "large",
                length: 15,
                width: 15,
                prepHours: 1,
                label: "12'x12' to 15'x15'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1.1
          },
          laundryRoom: {
            size: [
              {
                name: "small",
                length: 3,
                width: 5,
                prepHours: 0.15,
                label: "3'x5' or less"
              },
              {
                name: "medium",
                length: 5,
                width: 5,
                prepHours: 0.25,
                label: "3'x5' to 5'x5'"
              },
              {
                name: "large",
                length: 10,
                width: 10,
                prepHours: 0.5,
                label: "5'x5' to 10'x10'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1
          },
          entryway: {
            size: [
              {
                name: "small",
                length: 4,
                width: 6,
                prepHours: 0.15,
                label: "4'x6' or less"
              },
              {
                name: "medium",
                length: 6,
                width: 10,
                prepHours: 0.25,
                label: "4'x6' to 6'x10'"
              },
              {
                name: "large",
                length: 10,
                width: 10,
                prepHours: 0.3,
                label: "6'x10' to 10'x10'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1
          },
          hallway: {
            size: [
              {
                name: "small",
                length: 4,
                width: 6,
                prepHours: 0.15,
                label: "4'x6' or less"
              },
              {
                name: "medium",
                length: 4,
                width: 10,
                prepHours: 0.25,
                label: "4'x6' to 4'x10'"
              },
              {
                name: "large",
                length: 5,
                width: 15,
                prepHours: 0.3,
                label: "4'x10' to 5'x15'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1
          },
          stairway: {
            size: [
              {
                name: "small",
                length: 10,
                width: 10,
                prepHours: 0.15,
                label: "10'x10' or less"
              },
              {
                name: "medium",
                length: 15,
                width: 15,
                prepHours: 0.25,
                label: "10'x10' to 15'x15'"
              },
              {
                name: "large",
                length: 20,
                width: 20,
                prepHours: 0.3,
                label: "15'x15' to 20'x20'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1.1
          },
          sunRoom: {
            size: [
              {
                name: "small",
                length: 7,
                width: 10,
                prepHours: 0.25,
                label: "7'x10' or less"
              },
              {
                name: "medium",
                length: 12,
                width: 12,
                prepHours: 0.5,
                label: "7'x10' to 12'x12'"
              },
              {
                name: "large",
                length: 15,
                width: 15,
                prepHours: 1,
                label: "12'x12' to 15'x15'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1.1
          },
          garage: {
            size: [
              {
                name: "small",
                length: 12,
                width: 20,
                prepHours: 0.25,
                label: "12'x20' or less"
              },
              {
                name: "medium",
                length: 20,
                width: 20,
                prepHours: 0.5,
                label: "12'x20' to 20'x20'"
              },
              {
                name: "large",
                length: 32,
                width: 20,
                prepHours: 1,
                label: "20'x20' to 32'x20'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1
          },
          other: {
            size: [
              {
                name: "small",
                length: 10,
                width: 10,
                prepHours: 0.25,
                label: "10'x10' or less"
              },
              {
                name: "medium",
                length: 15,
                width: 15,
                prepHours: 0.5,
                label: "10'x10' to 15'x15'"
              },
              {
                name: "large",
                length: 20,
                width: 20,
                prepHours: 1,
                label: "15'x15' to 20'x20'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1.1
          }
        },
        townhouse: {
          livingRoom: {
            size: [
              {
                name: "small",
                length: 10,
                width: 10,
                prepHours: 0.25,
                label: "10'x10' or less"
              },
              {
                name: "medium",
                length: 15,
                width: 15,
                prepHours: 0.5,
                label: "10'x10' to 15'x15'"
              },
              {
                name: "large",
                length: 20,
                width: 20,
                prepHours: 1,
                label: "15'x15' to 20'x20'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1
          },
          bedRoom: {
            size: [
              {
                name: "small",
                length: 10,
                width: 10,
                prepHours: 0.25,
                label: "10'x10' or less"
              },
              {
                name: "medium",
                length: 15,
                width: 15,
                prepHours: 0.5,
                label: "10'x10' to 15'x15'"
              },
              {
                name: "large",
                length: 20,
                width: 20,
                prepHours: 1,
                label: "15'x15' to 20'x20'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1
          },
          bathroom: {
            size: [
              {
                name: "small",
                length: 5,
                width: 5,
                prepHours: 0.15,
                label: "5'x5' to less"
              },
              {
                name: "medium",
                length: 5,
                width: 8,
                prepHours: 0.25,
                label: "5'x5' to 5'x8'"
              },
              {
                name: "large",
                length: 8,
                width: 10,
                prepHours: 0.75,
                label: "5'x8' to 8'x10'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1.1
          },
          diningRoom: {
            size: [
              {
                name: "small",
                length: 10,
                width: 10,
                prepHours: 0.25,
                label: "10'x10' or less"
              },
              {
                name: "medium",
                length: 15,
                width: 15,
                prepHours: 0.5,
                label: "10'x10' to 15'x15'"
              },
              {
                name: "large",
                length: 20,
                width: 20,
                prepHours: 1,
                label: "15'x15' to 20'x20'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1
          },
          kitchen: {
            size: [
              {
                name: "small",
                length: 7,
                width: 10,
                prepHours: 0.25,
                label: "7'x10' or less"
              },
              {
                name: "medium",
                length: 12,
                width: 12,
                prepHours: 0.5,
                label: "7'x10' to 12'x12'"
              },
              {
                name: "large",
                length: 15,
                width: 15,
                prepHours: 1,
                label: "12'x12' to 15'x15'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1.1
          },
          laundryRoom: {
            size: [
              {
                name: "small",
                length: 3,
                width: 5,
                prepHours: 0.15,
                label: "3'x5' or less"
              },
              {
                name: "medium",
                length: 5,
                width: 5,
                prepHours: 0.25,
                label: "3'x5' to 5'x5'"
              },
              {
                name: "large",
                length: 10,
                width: 10,
                prepHours: 0.5,
                label: "5'x5' to 10'x10'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1
          },
          entryway: {
            size: [
              {
                name: "small",
                length: 4,
                width: 6,
                prepHours: 0.15,
                label: "4'x6' or less"
              },
              {
                name: "medium",
                length: 6,
                width: 10,
                prepHours: 0.25,
                label: "4'x6' to 6'x10'"
              },
              {
                name: "large",
                length: 10,
                width: 10,
                prepHours: 0.3,
                label: "6'x10' to 10'x10'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1
          },
          hallway: {
            size: [
              {
                name: "small",
                length: 4,
                width: 6,
                prepHours: 0.15,
                label: "4'x6' or less"
              },
              {
                name: "medium",
                length: 4,
                width: 10,
                prepHours: 0.25,
                label: "4'x6' to 4'x10'"
              },
              {
                name: "large",
                length: 5,
                width: 15,
                prepHours: 0.3,
                label: "4'x10' to 5'x15'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1
          },
          stairway: {
            size: [
              {
                name: "small",
                length: 10,
                width: 10,
                prepHours: 0.15,
                label: "10'x10' or less"
              },
              {
                name: "medium",
                length: 15,
                width: 15,
                prepHours: 0.25,
                label: "10'x10' to 15'x15'"
              },
              {
                name: "large",
                length: 20,
                width: 20,
                prepHours: 0.3,
                label: "15'x15' to 20'x20'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1.1
          },
          sunRoom: {
            size: [
              {
                name: "small",
                length: 7,
                width: 10,
                prepHours: 0.25,
                label: "7'x10' or less"
              },
              {
                name: "medium",
                length: 12,
                width: 12,
                prepHours: 0.5,
                label: "7'x10' to 12'x12'"
              },
              {
                name: "large",
                length: 15,
                width: 15,
                prepHours: 1,
                label: "12'x12' to 15'x15'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1.1
          },
          garage: {
            size: [
              {
                name: "small",
                length: 12,
                width: 20,
                prepHours: 0.25,
                label: "12'x20' or less"
              },
              {
                name: "medium",
                length: 20,
                width: 20,
                prepHours: 0.5,
                label: "12'x20' to 20'x20'"
              },
              {
                name: "large",
                length: 32,
                width: 20,
                prepHours: 1,
                label: "20'x20' to 32'x20'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1
          },
          other: {
            size: [
              {
                name: "small",
                length: 10,
                width: 10,
                prepHours: 0.25,
                label: "10'x10' or less"
              },
              {
                name: "medium",
                length: 15,
                width: 15,
                prepHours: 0.5,
                label: "10'x10' to 15'x15'"
              },
              {
                name: "large",
                length: 20,
                width: 20,
                prepHours: 1,
                label: "15'x15' to 20'x20'"
              }
            ],
            height: [
              {
                name: "average",
                height: 10,
                label: "10' or less"
              },
              {
                name: "aboveAverage",
                height: 14,
                label: "11' to 14'"
              },
              {
                name: "vaulted",
                height: 17,
                label: "15' to 17'"
              }
            ],
            paintingPrimingTimeMultiplier: 1.1
          }
        },
        decorDetails: {
          cabinetDoor: {
            prepUnitsPerHour: 1.21,
            primingUnitsPerHour: 8,
            primingUnitsPerGallon: 10,
            paintingUnitsPerHour: 8,
            paintingUnitsPerGallon: 10,
            itemMarkup: 1.5
          },
          cabinetDrawer: {
            prepUnitsPerHour: 3.15,
            primingUnitsPerHour: 13,
            primingUnitsPerGallon: 30,
            paintingUnitsPerHour: 13,
            paintingUnitsPerGallon: 30,
            itemMarkup: 1.5
          },
          ceiling: {
            prepUnitsPerHour: 0,
            primingUnitsPerHour: 125,
            primingUnitsPerGallon: 350,
            paintingUnitsPerHour: 125,
            paintingUnitsPerGallon: 350,
            itemMarkup: 1
          },
          crownMolding: {
            prepUnitsPerHour: 0,
            primingUnitsPerHour: 125,
            primingUnitsPerGallon: 600,
            paintingUnitsPerHour: 125,
            paintingUnitsPerGallon: 600,
            itemMarkup: 1
          },
          wall: {
            prepUnitsPerHour: 0,
            primingUnitsPerHour: 125,
            primingUnitsPerGallon: 350,
            paintingUnitsPerHour: 125,
            paintingUnitsPerGallon: 350,
            itemMarkup: 1
          },
          accentWall: {
            prepUnitsPerHour: 0,
            primingUnitsPerHour: 125,
            primingUnitsPerGallon: 350,
            paintingUnitsPerHour: 125,
            paintingUnitsPerGallon: 350,
            itemMarkup: 1
          },
          door: {
            prepUnitsPerHour: 0,
            primingUnitsPerHour: 2,
            primingUnitsPerGallon: 7,
            paintingUnitsPerHour: 1.5,
            paintingUnitsPerGallon: 7,
            itemMarkup: 1
          },
          doorFrame: {
            prepUnitsPerHour: 0,
            primingUnitsPerHour: 2,
            primingUnitsPerGallon: 17,
            paintingUnitsPerHour: 2,
            paintingUnitsPerGallon: 17,
            itemMarkup: 1
          },
          baseboard: {
            prepUnitsPerHour: 0,
            primingUnitsPerHour: 125,
            primingUnitsPerGallon: 600,
            paintingUnitsPerHour: 100,
            paintingUnitsPerGallon: 600,
            itemMarkup: 1
          },
          window: {
            prepUnitsPerHour: 0,
            primingUnitsPerHour: 5,
            primingUnitsPerGallon: 40,
            paintingUnitsPerHour: 4,
            paintingUnitsPerGallon: 40,
            itemMarkup: 1
          },
          fireplaceMantel: {
            prepUnitsPerHour: 0,
            primingUnitsPerHour: 2.5,
            primingUnitsPerGallon: 10,
            paintingUnitsPerHour: 2,
            paintingUnitsPerGallon: 10,
            itemMarkup: 1
          }
        },
        schemaVersion: constants.schemaVersion
      };

      try {
        let locationData = await LocationData.findOne({
          zipCode: data[0]
        });

        if (!locationData) {
          locationData = new LocationData(dbsData);
        } else if (locationData.city.indexOf(data[1]) < 0) {
          locationData.city.push(data[1]);
        }

        await locationData.save();
      } catch (e) {
        console.dir(e);
      }
    }

    if(!silent)
      console.log('done');

    process.exit(0);
  }

})();
