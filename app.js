mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_TOKEN;

// ---------- Map config ---------- //
const INIT_CENTER = [-73.97, 40.68];
const INIT_ZOOM = 11;

const map = new mapboxgl.Map({
  container: "map",
  center: INIT_CENTER,
  zoom: INIT_ZOOM,
  style: "mapbox://styles/renashen314/cluefsed800gz01ql7gbs4lef/draft",
});

map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
  }),
);

// ---------- Sources & layers ---------- //
map.on("load", () => {
  map.addSource("borough-boundaries", {
    type: "geojson",
    data: "/data/borough-boundaries.geojson",
    promoteId: "boro_code",
  });

  map.addSource("Parks_Properties", {
    type: "geojson",
    data: "/data/Parks_Properties.geojson",
    promoteId: "omppropid",
  });

  map.addSource("basketball-courts", {
    type: "geojson",
    data: "/data/basketball-court.geojson",
  });

  map.addLayer(
    {
      id: "basketball-courts",
      type: "circle",
      source: "basketball-courts",
      paint: {
        "circle-color": "orange",
        "circle-radius": {
          base: 3,
          stops: [
            [12, 4],
            [22, 180],
          ],
        },
        "circle-opacity": 0.7,
      },
      layout: { visibility: "none" },
    },
    "road-label-simple",
  );

  map.addLayer(
    {
      id: "nyc-parks",
      type: "fill",
      source: "Parks_Properties",
      paint: {
        "fill-color": "#00b5c9",
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          0.6,
          0.2,
        ],
      },
      layout: { visibility: "visible" },
    },
    "road-label-simple",
  );

  map.addLayer(
    {
      id: "borough-boundaries-fill",
      type: "fill",
      source: "borough-boundaries",
      paint: {
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          0.5,
          0.2,
        ],
        "fill-color": [
          "match",
          ["get", "boro_code"],
          "1",
          "green",
          "2",
          "purple",
          "3",
          "orange",
          "4",
          "yellow",
          "5",
          "pink",
          "steelblue",
        ],
      },
      layout: { visibility: "none" },
    },
    "road-label-simple",
  );

  map.addLayer(
    {
      id: "borough-boundaries-line",
      type: "line",
      source: "borough-boundaries",
      paint: {
        "line-color": "black",
        "line-width": 1,
      },
      layout: { visibility: "none" },
    },
    "road-label-simple",
  );
});

// ---------- Click handlers ---------- //
map.on("click", (e) => {
  const selectedPark = map.queryRenderedFeatures(e.point, {
    layers: ["nyc-parks"],
  });
  if (selectedPark.length !== 0) {
    const { name311, typecategory, subcategory, location } =
      selectedPark[0].properties;
    document.getElementById("pd").innerHTML = `
      <h3>${name311}</h3>
      <p><em><strong>Type:</strong> ${typecategory} <strong>Subcategory:</strong> ${subcategory}</em></p>
      <p><strong>Location:</strong> ${location}</p>
    `;
    document.getElementById("pd").style.color = "green";
  }
});

// ---------- Hover effects ---------- //
let hoveredParkId = null;
map.on("mouseover", "nyc-parks", (e) => {
  if (e.features.length > 0) {
    if (hoveredParkId !== null) {
      map.setFeatureState(
        { source: "Parks_Properties", id: hoveredParkId },
        { hover: false },
      );
    }
    hoveredParkId = e.features[0].id;
    map.setFeatureState(
      { source: "Parks_Properties", id: hoveredParkId },
      { hover: true },
    );
  }
});
map.on("mouseleave", "nyc-parks", () => {
  if (hoveredParkId !== null) {
    map.setFeatureState(
      { source: "Parks_Properties", id: hoveredParkId },
      { hover: false },
    );
  }
  hoveredParkId = null;
});

// ---------- Controls ---------- //
document.querySelector("#reset").addEventListener("click", () => {
  map.flyTo({ center: INIT_CENTER, zoom: INIT_ZOOM });
});

function toggleLayer(checked, ...layerIds) {
  const visibility = checked ? "visible" : "none";
  layerIds.forEach((id) => map.setLayoutProperty(id, "visibility", visibility));
}

document
  .querySelector("#toggle-boroughs")
  .addEventListener("change", function () {
    toggleLayer(
      this.checked,
      "borough-boundaries-fill",
      "borough-boundaries-line",
    );
  });

document
  .querySelector("#toggle-basketball")
  .addEventListener("change", function () {
    toggleLayer(this.checked, "basketball-courts");
  });

// ---------- Legend ---------- //
const layers = ["Public Parks", "Basketball Courts"];
const colors = ["#00b5c9", "orange"];
const legend = document.getElementById("legend");

layers.forEach((layer, i) => {
  const item = document.createElement("div");
  const key = document.createElement("span");
  key.className = "legend-key";
  key.style.backgroundColor = colors[i];

  const value = document.createElement("span");
  value.textContent = layer;

  item.appendChild(key);
  item.appendChild(value);
  legend.appendChild(item);
});

map.getCanvas().style.cursor = "default";
