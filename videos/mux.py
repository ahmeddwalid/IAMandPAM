"""Mux rendered video + narration + burned subtitles into the final MP4."""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
VIDEO = Path(__file__).parent
MEDIA = ROOT / "media" / "videos" / "part1_scenes" / "1080p30" / "Part1All.mp4"
NARRATION = VIDEO / "audio" / "part1_narration.mp3"
SUBS = VIDEO / "audio" / "part1_subtitles.srt"
OUT = ROOT / "static" / "videos" / "part1-what-is-iam-pam.mp4"
POSTER = ROOT / "static" / "videos" / "part1-poster.png"

STYLE = (
    "FontName=DejaVu Sans,FontSize=21,PrimaryColour=&H2A353D,"
    "OutlineColour=&HF2F6F8,BorderStyle=1,Outline=1,Shadow=0,"
    "MarginV=42,Alignment=2"
)

OUT.parent.mkdir(exist_ok=True)

TMP = Path("/tmp/opencode/iam-video")
TMP.mkdir(parents=True, exist_ok=True)
subs_tmp = TMP / "subs.srt"
subs_tmp.write_text(SUBS.read_text())

subprocess.run(
    [
        "ffmpeg", "-y", "-loglevel", "error",
        "-i", str(MEDIA), "-i", str(NARRATION),
        "-vf", f"subtitles={subs_tmp}:force_style='{STYLE}'",
        "-c:v", "libx264", "-crf", "18", "-preset", "medium",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest", "-movflags", "+faststart",
        str(OUT),
    ],
    check=True,
)

subprocess.run(
    [
        "ffmpeg", "-y", "-loglevel", "error",
        "-i", str(MEDIA), "-frames:v", "1",
        "-vf", "scale=960:-1",
        str(POSTER),
    ],
    check=True,
)

probe = subprocess.run(
    ["ffprobe", "-v", "error", "-show_entries",
     "format=duration,size", "-of", "json", str(OUT)],
    capture_output=True, text=True, check=True,
)
print(probe.stdout)
print(f"OUT: {OUT}")
print(f"POSTER: {POSTER}")


if __name__ == "__main__":
    sys.exit(0)