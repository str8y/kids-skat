# Hilfsprogramm für scripts/piper.ts: liest Aufträge als JSON von stdin
# ([{"text": ..., "out": ".../x.mp3"}, ...]) und schreibt MP3-Dateien.
import io, json, subprocess, sys, wave
from piper import PiperVoice, SynthesisConfig

model, length_scale, bitrate = sys.argv[1], float(sys.argv[2]), sys.argv[3]
voice = PiperVoice.load(model)
cfg = SynthesisConfig(length_scale=length_scale)
jobs = json.load(sys.stdin)
for i, job in enumerate(jobs, 1):
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        voice.synthesize_wav(job["text"], w, syn_config=cfg)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", "-", "-ac", "1", "-codec:a", "libmp3lame", "-b:a", bitrate, job["out"]],
        input=buf.getvalue(), check=True,
    )
    if i % 50 == 0 or i == len(jobs):
        print(f"  {i}/{len(jobs)}", flush=True)
