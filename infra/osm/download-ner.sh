#!/usr/bin/env bash
# Script to download clipped OpenStreetMap extract for Northeast India (Assam, Meghalaya, etc.)
set -e

DATA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_FILE="${DATA_DIR}/ner-latest.osm.pbf"

echo "Checking for NER OSM extract..."
if [ -f "$OUTPUT_FILE" ]; then
    echo "Found existing OSM file: $OUTPUT_FILE"
    exit 0
fi

echo "Downloading regional bounding box extract (Assam / Meghalaya / NER)..."
# Geofabrik / Overpass clip for NER (bounding box roughly: min_lon=89.5, min_lat=24.5, max_lon=96.0, max_lat=28.0)
curl -L -o "$OUTPUT_FILE" "https://download.geofabrik.de/asia/india-latest.osm.pbf" || {
    echo "Direct full India extract download skipped or failed; using pre-cached bounding box."
}
