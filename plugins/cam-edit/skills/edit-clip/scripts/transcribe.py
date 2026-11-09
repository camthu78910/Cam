"""Chuyen giong noi thanh chu co moc thoi gian tung tu, va tao edit.json nhap (chi co phu de).

python3 transcribe.py <video> <thu-muc-ra> [--model small] [--lang vi]
Ra: words.json (tung tu) va edit.json (captions da gom dong, cards rong) de Claude sua tiep.
"""
import argparse, json, os, sys

MAX_WORDS, MAX_DUR, GAP = 4, 1.8, 0.35


def group(words):
    """Gom tu thanh dong phu de: toi da 4 tu / 1,8 s, ngat khi ngung noi > 0,35 s hoac gap dau cau."""
    lines, cur = [], []
    for w in words:
        if cur and (len(cur) >= MAX_WORDS or w["end"] - cur[0]["start"] > MAX_DUR or w["start"] - cur[-1]["end"] > GAP):
            lines.append(cur); cur = []
        cur.append(w)
        if w["word"].rstrip()[-1:] in ".,!?;:":
            lines.append(cur); cur = []
    if cur:
        lines.append(cur)
    return [{"start": round(l[0]["start"], 2), "end": round(l[-1]["end"], 2),
             "text": " ".join(x["word"].strip().strip(".,!?;:") for x in l).strip()} for l in lines]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video"); ap.add_argument("out")
    ap.add_argument("--model", default="small"); ap.add_argument("--lang", default="vi")
    a = ap.parse_args()
    from faster_whisper import WhisperModel
    model = WhisperModel(a.model, device="auto", compute_type="int8")
    # Giai ma am thanh bang ffmpeg (16 kHz mono) thay vi PyAV, tranh loi lech phien ban
    import subprocess, numpy as np
    pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", a.video, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
                         capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    segs, _ = model.transcribe(audio, language=a.lang, word_timestamps=True, vad_filter=True)
    words = [{"start": w.start, "end": w.end, "word": w.word} for s in segs for w in (s.words or [])]
    if not words:
        sys.exit("Khong nghe ra loi noi nao.")
    os.makedirs(a.out, exist_ok=True)
    json.dump(words, open(os.path.join(a.out, "words.json"), "w"), ensure_ascii=False, indent=1)
    edit = {"captions": group(words), "cards": []}
    json.dump(edit, open(os.path.join(a.out, "edit.json"), "w"), ensure_ascii=False, indent=1)
    print(f"{len(words)} tu, {len(edit['captions'])} dong phu de -> {a.out}")


if __name__ == "__main__":
    if sys.argv[1:] == ["--selftest"]:
        w = lambda s, e, t: {"start": s, "end": e, "word": t}
        g = group([w(0, .2, "một"), w(.2, .4, "hai,"), w(.5, .7, "ba"), w(1.5, 1.7, "bốn")])
        assert [x["text"] for x in g] == ["một hai", "ba", "bốn"], g
        print("selftest ok")
    else:
        main()
