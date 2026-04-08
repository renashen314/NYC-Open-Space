import { readFileSync, writeFileSync } from "fs";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";

const parks = JSON.parse(readFileSync("public/data/Parks_Properties.geojson", "utf-8"));
const parkRestrooms = JSON.parse(readFileSync("raw_data/Public_Restrooms_20260403.geojson", "utf-8"))
  .features.filter((f) => f.properties.location_type === "Park");

console.log(`Checking ${parkRestrooms.length} park restrooms against ${parks.features.length} parks...`);

const lookup = {};
let matched = 0;

for (const restroom of parkRestrooms) {
  for (const park of parks.features) {
    if (booleanPointInPolygon(restroom, park)) {
      const id = park.properties.omppropid;
      if (!lookup[id]) lookup[id] = [];
      lookup[id].push({
        facility_name: restroom.properties.facility_name,
        status: restroom.properties.status,
        open: restroom.properties.open,
        hours_of_operation: restroom.properties.hours_of_operation,
        accessibility: restroom.properties.accessibility,
      });
      matched++;
      break;
    }
  }
}

writeFileSync("public/data/restrooms-by-park.json", JSON.stringify(lookup));
console.log(`Done — ${matched} restrooms matched to ${Object.keys(lookup).length} parks`);
console.log(`Output: public/data/restrooms-by-park.json`);
