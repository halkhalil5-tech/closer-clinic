#!/bin/sh
# 9:16: the phone carries the frame; brand ground fills the rest.
ffmpeg -y -hide_banner -loglevel error \
 -loop 1 -framerate 30 -t 61 -i cards/plain.png -i raw/walkthrough.webm -i track.m4a \
 -filter_complex "\
[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[bg];\
[1:v]scale=722:1562:flags=lanczos,setsar=1[ph];\
[bg][ph]overlay=(W-w)/2:(H-h)/2:shortest=1[o];\
[o]drawbox=x=178:y=178:w=724:h=1564:color=0x2EC4A5@0.26:t=2[o2];\
[o2]fade=t=in:st=0:d=0.5,fade=t=out:st=59.3:d=0.7,format=yuv420p[v];\
[2:a]afade=t=out:st=59.3:d=0.7[a]" \
 -map "[v]" -map "[a]" -t 60 -r 30 -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
 -c:a aac -b:a 192k -movflags +faststart closer-clinic-60s-vertical.mp4
