#!/bin/sh
ffmpeg -y -hide_banner -loglevel error \
 -i bg/track.webm -i raw/walkthrough.webm -i track.m4a \
 -filter_complex "\
[1:v]scale=434:940:flags=lanczos,setsar=1,format=rgba,fade=t=in:st=2.0:d=0.5:alpha=1,fade=t=out:st=55.0:d=0.5:alpha=1[ph];\
[0:v][ph]overlay=1316:70[o];\
[o]drawbox=x=1315:y=69:w=436:h=942:color=0x2EC4A5@0.28:t=2:enable='between(t,2.4,55.2)'[o2];\
[o2]fps=30,zoompan=z='1+0.55*clip((on/30-26)/2\,0\,1)-0.55*clip((on/30-32.6)/1\,0\,1)+0.030*(1-cos(2*PI*(on/30)/8))/2+0.055*clip((on/30-55.4)/4.4\,0\,1)':x='max(0\,min(iw-iw/zoom\,(1533-573*clip((on/30-55.2)/1\,0\,1))-(iw/zoom)/2))':y='max(0\,min(ih-ih/zoom\,540-(ih/zoom)/2))':d=1:s=1920x1080:fps=30[oz];\
[oz]fade=t=in:st=0:d=0.5,fade=t=out:st=59.3:d=0.7,format=yuv420p[v];\
[2:a]afade=t=out:st=59.3:d=0.7[a]" \
 -map "[v]" -map "[a]" -t 60 -r 30 -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p \
 -c:a aac -b:a 192k -movflags +faststart closer-clinic-60s.mp4
