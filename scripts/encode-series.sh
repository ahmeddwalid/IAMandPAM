#!/usr/bin/env bash
# Re-encode the NotebookLM masters into web versions. The output stays in the
# gitignored masters folder: the MP4s are published as release assets by
# scripts/publish-series.sh, and only their posters are committed to the site.
set -euo pipefail

SRC="/home/ahmed/Projects/IAM and PAM/Gemini NotebookLM Videos"
OUT="$SRC/web"
mkdir -p "$OUT"

encode() {
  local src="$1" slug="$2"
  local target="$OUT/$slug.mp4"
  if [ -f "$target" ]; then
    echo "skip $slug"
    return
  fi
  echo "encoding $slug"
  ffmpeg -v error -stats -i "$SRC/$src" \
    -c:v libx264 -preset slow -crf 24 -profile:v high -level 4.0 -pix_fmt yuv420p \
    -c:a aac -b:a 96k -ac 1 \
    -movflags +faststart \
    "$target"

  local duration
  duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$target")
  local poster_ts
  poster_ts=$(awk -v d="$duration" 'BEGIN { printf "%.1f", d * 0.12 }')
  ffmpeg -v error -ss "$poster_ts" -i "$target" -frames:v 1 -q:v 3 "$OUT/$slug.jpg" -y
  echo "done $slug ($(du -m "$target" | cut -f1) MB)"
}

encode "Architecting_IAM__Scaling_Identity_from_Single_User_to_Enterpri.mp4" "iam-enterprise-scale"
encode "Architecting_Identity__Finding_Your_Vendor_Fit.mp4" "vendor-fit"
encode "Architecting_the_IAM_Stack.mp4" "iam-stack"
encode "Hands-On_Labs__Learning_Identity_by_Building.mp4" "hands-on-labs"
encode "Insight_Engine__Architecting_the_Zero-Trust_Enterprise (1).mp4" "zero-trust"
encode "Interview_Preparation__Frameworks_for_Success.mp4" "interview-preparation"
encode "Scenarios___Troubleshooting__Real-World_Identity_Operations.mp4" "scenarios-troubleshooting"
encode "The_2026_Identity_Security_Blueprint__Matching_the_Right_Stack_ (1).mp4" "identity-blueprint"
encode "The_IAM_Workflow_Multiplier.mp4" "iam-workflow"
encode "فك_شفرة_أمن_الهوية (1).mp4" "identity-security-ar"

echo "all done"
du -sh "$OUT"
