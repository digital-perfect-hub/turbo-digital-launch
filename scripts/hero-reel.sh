#!/usr/bin/env bash
# Baut die Hero-Filme der Premium-Startseite: je Format EIN durchgehender Film, in dem fünf Filme ineinander überblenden
# (18 Bilder = 0,75 s bei 24 Bildern pro Sekunde). Der Film beginnt 0,75 s nach dem Anfang des ersten Films und endet mit
# der Überblendung zurück auf dessen erste 0,75 s: Das letzte Bild ist das erste, die Schleife hat keinen Sprung.
# Dazu das erste Bild als Standbild und sehr kleine Fassungen (240 x 426) der Creator-Clips für den Bilderring.
#
# Die Zeiten in src/components/premium-home/content.ts (HERO_WIDE, HERO_TALL: cue, start, wrap, duration) folgen aus den
# Bildzahlen hier. Wer Filme tauscht oder ihre Länge ändert, rechnet sie neu und prüft die Schlüsselbilder mit ffprobe.
#
# Aufruf: scripts/hero-reel.sh <Ordner mit den Originalen aus Creator Studio> <Zielordner>   (ffmpeg über $FFMPEG, sonst "ffmpeg")
# Originale (nicht im Repository): vm1 Maria am Bergsee, vm2 Maria im Loft, vm3 Maria im Café, vm4 Maria im Studio,
# vm5 Maria am Gipfel, vm6 Maria in der Altstadt, vl1 Laura Neonnacht, vl2 Laura im Gym, vl3 Laura am Strand,
# vl4 Laura im Büro, vy2 Maya knetet Teig, f1 Vulkan, f2 Alpen (alle .mp4, 24 Bilder pro Sekunde).
set -euo pipefail
SRC="$1"
OUT="$2"
FF="${FFMPEG:-ffmpeg}"
mkdir -p "$OUT"
SKIP=0.35
X264="-c:v libx264 -preset veryslow -pix_fmt yuv420p -profile:v high -movflags +faststart -an -r 24 -g 96 -keyint_min 24 -x264-params ref=3:bframes=3:aq-mode=3"
NORM="fps=24,setsar=1,format=yuv420p"
XF="xfade=transition=fade:duration=0.75"

# Hochformat: Café (150 Bilder), Vulkan (184), Strand (150), Alpen (184), Gipfel (150) -> 728 Bilder = 30,333 s
TALL="scale=720:1280:flags=lanczos,$NORM"
"$FF" -v error -y -ss $SKIP -i "$SRC/vm3.mp4" -ss $SKIP -i "$SRC/f1.mp4" -ss $SKIP -i "$SRC/vl3.mp4" -ss $SKIP -i "$SRC/f2.mp4" -ss $SKIP -i "$SRC/vm5.mp4" -filter_complex "
[0:v]$TALL,trim=end_frame=150,setpts=PTS-STARTPTS,split[a][b];
[a]trim=start_frame=18,setpts=PTS-STARTPTS,settb=AVTB[m0];
[b]trim=end_frame=18,setpts=PTS-STARTPTS,settb=AVTB[h0];
[1:v]crop=810:1440:875:0,$TALL,trim=end_frame=184,setpts=PTS-STARTPTS,settb=AVTB[m1];
[2:v]$TALL,trim=end_frame=150,setpts=PTS-STARTPTS,settb=AVTB[m2];
[3:v]crop=810:1440:875:0,$TALL,trim=end_frame=184,setpts=PTS-STARTPTS,settb=AVTB[m3];
[4:v]$TALL,trim=end_frame=150,setpts=PTS-STARTPTS,settb=AVTB[m4];
[m0][m1]$XF:offset=4.75[x1];
[x1][m2]$XF:offset=11.666667[x2];
[x2][m3]$XF:offset=17.166667[x3];
[x3][m4]$XF:offset=24.083333[x4];
[x4][h0]$XF:offset=29.583333,fps=24[out]" -map "[out]" $X264 -level:v 3.1 -crf 29 -maxrate 1500k -bufsize 3000k -force_key_frames 5.5,12.416667,17.916667,24.833333 "$OUT/hero-reel-tall.mp4"
"$FF" -v error -y -ss $SKIP -i "$SRC/vm3.mp4" -vf "$TALL,select=eq(n\,18)" -frames:v 1 -c:v libwebp -quality 74 "$OUT/hero-reel-tall.webp"

# Querformat: Bergsee, Vulkan, Neonnacht, Alpen, Loft (je 184 Bilder) -> 830 Bilder = 34,583 s
WIDE="scale=1600:900:flags=lanczos,$NORM"
"$FF" -v error -y -ss $SKIP -i "$SRC/vm1.mp4" -ss $SKIP -i "$SRC/f1.mp4" -ss $SKIP -i "$SRC/vl1.mp4" -ss $SKIP -i "$SRC/f2.mp4" -ss $SKIP -i "$SRC/vm2.mp4" -filter_complex "
[0:v]$WIDE,trim=end_frame=184,setpts=PTS-STARTPTS,split[a][b];
[a]trim=start_frame=18,setpts=PTS-STARTPTS,settb=AVTB[m0];
[b]trim=end_frame=18,setpts=PTS-STARTPTS,settb=AVTB[h0];
[1:v]$WIDE,trim=end_frame=184,setpts=PTS-STARTPTS,settb=AVTB[m1];
[2:v]$WIDE,trim=end_frame=184,setpts=PTS-STARTPTS,settb=AVTB[m2];
[3:v]$WIDE,trim=end_frame=184,setpts=PTS-STARTPTS,settb=AVTB[m3];
[4:v]$WIDE,trim=end_frame=184,setpts=PTS-STARTPTS,settb=AVTB[m4];
[m0][m1]$XF:offset=6.166667[x1];
[x1][m2]$XF:offset=13.083333[x2];
[x2][m3]$XF:offset=20[x3];
[x3][m4]$XF:offset=26.916667[x4];
[x4][h0]$XF:offset=33.833333,fps=24[out]" -map "[out]" $X264 -level:v 4.0 -crf 29 -maxrate 2400k -bufsize 4800k -force_key_frames 6.916667,13.833333,20.75,27.666667 "$OUT/hero-reel-wide.mp4"
"$FF" -v error -y -ss $SKIP -i "$SRC/vm1.mp4" -vf "$WIDE,select=eq(n\,18)" -frames:v 1 -c:v libwebp -quality 74 "$OUT/hero-reel-wide.webp"

# Bilderring: dieselben Creator-Clips sehr klein, damit mehrere zugleich laufen können, ohne ein Telefon zu belasten.
for pair in "vm3 maria-cafe" "vm4 maria-studio" "vm5 maria-gipfel" "vm6 maria-altstadt" "vl3 laura-strand" "vl2 laura-gym" "vl4 laura-buero" "vy2 maya-teig"; do
  set -- $pair
  "$FF" -v error -y -ss $SKIP -i "$SRC/$1.mp4" -vf "scale=240:426:flags=lanczos,$NORM" $X264 -level:v 3.0 -crf 31 -maxrate 260k -bufsize 520k "$OUT/$2-ring.mp4"
done
ls -la "$OUT"
