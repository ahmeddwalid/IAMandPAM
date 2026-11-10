#!/usr/bin/env bash
# Publish the encoded episodes to the GitHub release the site streams from, and
# copy their poster frames into the site. Re-encoding is a separate step:
# scripts/encode-series.sh writes the MP4s and JPGs into the masters folder.
set -euo pipefail

SRC="/home/ahmed/Projects/IAM and PAM/Gemini NotebookLM Videos/web"
REPO="ahmeddwalid/IAMandPAM"
TAG="video-series-v1"
POSTERS="/home/ahmed/Projects/IAM and PAM/static/videos/series"

if [ ! -d "$SRC" ]; then
  echo "nothing to publish: $SRC does not exist" >&2
  exit 1
fi

mkdir -p "$POSTERS"

shopt -s nullglob
videos=("$SRC"/*.mp4)
posters=("$SRC"/*.jpg)

if [ ${#videos[@]} -eq 0 ]; then
  echo "nothing to publish: no MP4 files in $SRC" >&2
  exit 1
fi

gh release upload "$TAG" "${videos[@]}" --repo "$REPO" --clobber

cp "${posters[@]}" "$POSTERS"/
echo "published ${#videos[@]} videos to $REPO@$TAG and copied ${#posters[@]} posters"
