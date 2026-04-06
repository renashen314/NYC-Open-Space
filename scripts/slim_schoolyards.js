import { readFileSync, writeFileSync } from "fs";

const KEEP = [
  // Requested
  "address",
  "location",
  // GIS features
  "gispropnum",
  "acres",
  "borough",
  "zipcode",
];

const raw = JSON.parse(
  readFileSync("raw_data/Schoolyard_to_Playgrounds_20260406.geojson", "utf-8"),
);

raw.features.forEach((f) => {
  f.properties = Object.fromEntries(KEEP.map((k) => [k, f.properties[k]]));
});

writeFileSync(
  "public/data/schoolyards.geojson",
  JSON.stringify(raw),
);

console.log(`Done — ${raw.features.length} features written to public/data/schoolyards.geojson`);
