"""Generate TTS narration per scene: mp3 chunks, word-boundary subtitles,
per-scene durations, and a combined narration track with subtitle offsets."""

import asyncio
import json
import subprocess
import sys
from pathlib import Path

import edge_tts

GAP = 0.45  # seconds of silence between scene chunks

VIDEO = "part1"
SCRIPT = Path(__file__).parent / "scripts" / f"{VIDEO}.json"
AUDIO = Path(__file__).parent / "audio"
AUDIO.mkdir(exist_ok=True)


def duration_of(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


async def synth(chunk: dict, index: int, voice: str) -> float:
    mp3 = AUDIO / f"{VIDEO}_scene{index:02d}.mp3"
    srt = AUDIO / f"{VIDEO}_scene{index:02d}.srt"
    if mp3.exists():
        return duration_of(mp3)
    communicate = edge_tts.Communicate(chunk["narration"], voice)
    await communicate.save(str(mp3), str(srt))
    return duration_of(mp3)


def parse_srt(path: Path, offset: float) -> list:
    """edge-tts writes a JSONL of SentenceBoundary/WordBoundary events."""
    cues = []
    for line in path.read_text().splitlines():
        event = json.loads(line)
        if event.get("type") not in ("SentenceBoundary", "WordBoundary"):
            continue
        start = event["offset"] / 1_000_000
        end = start + event["duration"] / 1_000_000
        cues.append((start + offset, end + offset, event["text"]))
    return cues


def fmt_ts(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main() -> None:
    data = json.loads(SCRIPT.read_text())
    durations = {}
    offsets = []
    cursor = 0.0

    for i, chunk in enumerate(data["scenes"]):
        d = asyncio.run(synth(chunk, i, data.get("voice", "en-US-GuyNeural")))
        durations[chunk["id"]] = round(d, 3)
        offsets.append((chunk["id"], cursor))
        cursor += d + GAP

    (AUDIO / f"{VIDEO}_durations.json").write_text(
        json.dumps(durations, indent=2))

    all_cues = []
    parts = []
    for i, chunk in enumerate(data["scenes"]):
        srt = AUDIO / f"{VIDEO}_scene{i:02d}.srt"
        all_cues.extend(parse_srt(srt, offsets[i][1]))
        parts.append(str(AUDIO / f"{VIDEO}_scene{i:02d}.mp3"))

    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i",
         "concat:" + "|".join(parts),
         "-af", f"apad=pad_dur={GAP}", str(AUDIO / f"{VIDEO}_narration.mp3")],
        check=True,
    )

    all_cues.sort(key=lambda c: c[0])
    lines = []
    for n, (start, end, text) in enumerate(all_cues, 1):
        lines.append(f"{n}\n{fmt_ts(start)} --> {fmt_ts(end)}\n{text}\n")
    (AUDIO / f"{VIDEO}_subtitles.srt").write_text("\n".join(lines))

    print(f"narration total: {cursor - GAP:.1f}s across "
          f"{len(data['scenes'])} scenes")
    for cid, off in offsets:
        print(f"  {cid:10s} start={off:6.2f}s dur={durations[cid]:5.2f}s")


if __name__ == "__main__":
    sys.exit(main())