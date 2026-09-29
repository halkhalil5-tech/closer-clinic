#!/bin/zsh
# Composite + two-pass encode. Phone layer = tour + kept encounter spans + scorecard.
set -e
cd "$(dirname "$0")"
node -e "
const T=require('./timeline.json');
const parts=[];
parts.push('[0:v]trim='+T.phOn+':'+T.phOff+',setpts=PTS-STARTPTS[s0]');
T.segs.forEach((g,i)=>parts.push('[1:v]trim='+g[0]+':'+g[1]+',setpts=PTS-STARTPTS[e'+i+']'));
parts.push('[1:v]trim='+(T.scOn-0.3)+':'+(T.scOn-0.3+T.SC_LEN)+',setpts=PTS-STARTPTS[sc]');
const labels='[s0]'+T.segs.map((_,i)=>'[e'+i+']').join('')+'[sc]';
const fc=parts.join(';')+';'+labels+'concat=n='+(T.segs.length+2)+':v=1[ph]';
require('fs').writeFileSync('phone.fc', fc);
console.log('PH_ON='+T.phOn, 'TEND='+T.T_END, 'TOTAL='+T.TOTAL);
" > .tlvars
source .tlvars
ffmpeg -y -hide_banner -loglevel error -i rawtour/tour.webm -i rawenc/encounter.webm \
 -filter_complex "$(cat phone.fc)" -map "[ph]" -an -c:v libx264 -preset veryfast -crf 16 -pix_fmt yuv420p phone.mp4
echo "phone layer: $(ffprobe -v error -show_entries format=duration -of csv=p=0 phone.mp4)s"

FC="[1:v]scale=434:940:flags=lanczos,setsar=1,setpts=PTS+${PH_ON}/TB,format=rgba,\
fade=t=in:st=${PH_ON}:d=0.5:alpha=1,fade=t=out:st=$(echo "$TEND-0.5"|bc):d=0.5:alpha=1[ph];\
[0:v][ph]overlay=1316:70:eof_action=pass[o];\
[o]drawbox=x=1315:y=69:w=436:h=942:color=0x2EC4A5@0.28:t=2:enable='between(t,$(echo "$PH_ON+0.4"|bc),${TEND})'[o2];\
[o2]fade=t=in:st=0:d=0.6,fade=t=out:st=$(echo "$TOTAL-0.9"|bc):d=0.8,format=yuv420p[v]"

for PASS in 1 2; do
  if [ $PASS = 1 ]; then A="-an"; OUT="-f null /dev/null"; else A="-map 2:a -c:a aac -b:a 128k"; OUT="-movflags +faststart demo-podiatry-shockwave.mp4"; fi
  ffmpeg -y -hide_banner -loglevel error -i bg/track.webm -i phone.mp4 -i track.m4a \
   -filter_complex "$FC" -map "[v]" ${=A} \
   -t $TOTAL -r 30 -c:v libx264 -preset slow -b:v 545k -pass $PASS -passlogfile cc2p ${=OUT}
done
ffprobe -v error -show_entries format=duration,size:stream=width,height -of default=nw=1 demo-podiatry-shockwave.mp4
