import { readFileSync, writeFileSync } from "fs";

const KEEP = [
  "facility_name",
  "location_type",
  "status",
  "open",
  "hours_of_operation",
  "accessibility",
];

const raw = JSON.parse(
  readFileSync("raw_data/Public_Restrooms_20260403.geojson", "utf-8"),
);

raw.features.forEach((f) => {
  f.properties = Object.fromEntries(KEEP.map((k) => [k, f.properties[k]]));
});

writeFileSync(
  "public/data/restrooms.geojson",
  JSON.stringify(raw),
);

console.log(`Done — ${raw.features.length} features written to public/data/restrooms.geojson`);
