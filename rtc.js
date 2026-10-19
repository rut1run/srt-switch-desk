'use strict';
// One full ICE offer avoids trickle-ICE proxy complexity. Media remains peer-to-peer.
window.DeskRTC=class DeskRTC {
 constructor(video,url,onStatus=()=>{}){this.video=video;this.url=url;this.onStatus=onStatus;this.closed=false;this.generation=0;this.connect();}
 async connect(){if(this.closed)return;const gen=++this.generation;this.onStatus('接続中…');this.abort=new AbortController();const pc=new RTCPeerConnection({iceServers:[],bundlePolicy:'max-bundle'});this.pc=pc;const stream=new MediaStream();this.video.srcObject=stream;
 const current=()=>!this.closed&&this.generation===gen;
 pc.ontrack=e=>{if(!current())return;stream.addTrack(e.track);try{e.receiver.jitterBufferTarget=0;e.receiver.playoutDelayHint=0;}catch{}this.video.play().catch(()=>this.onStatus('クリックして音声を再生'));};
 pc.onconnectionstatechange=()=>{if(!current())return;if(pc.connectionState==='connected')this.onStatus('connected');else if(['failed','disconnected'].includes(pc.connectionState))this.retry();};
 pc.addTransceiver('video',{direction:'recvonly'});pc.addTransceiver('audio',{direction:'recvonly'});
 try{await pc.setLocalDescription(await pc.createOffer());await new Promise(resolve=>{if(pc.iceGatheringState==='complete')return resolve();const timer=setTimeout(done,1800);function done(){clearTimeout(timer);pc.removeEventListener('icegatheringstatechange',check);resolve();}function check(){if(pc.iceGatheringState==='complete')done();}pc.addEventListener('icegatheringstatechange',check);});if(!current())return;
 const timer=setTimeout(()=>this.abort.abort(),12000);let r;try{r=await fetch(this.url,{method:'POST',headers:{'Content-Type':'application/sdp'},body:pc.localDescription.sdp,signal:this.abort.signal});}finally{clearTimeout(timer);}
 if(!r.ok)throw Error(r.status===404?'映像を待っています':'WebRTC接続を再試行中…');const location=r.headers.get('Location');const session=location?new URL(location,this.url).href:null;if(!current()){if(session)fetch(session,{method:'DELETE',keepalive:true}).catch(()=>{});return;}this.session=session;await pc.setRemoteDescription({type:'answer',sdp:await r.text()});
 this.watchdog=setTimeout(()=>{if(current()&&pc.connectionState!=='connected')this.retry();},10000);
 }catch(e){if(current()){this.onStatus(e.message);this.retry();}}
 }
 release(){clearTimeout(this.watchdog);this.abort?.abort();this.pc?.close();if(this.session){fetch(this.session,{method:'DELETE',keepalive:true}).catch(()=>{});this.session=null;}}
 retry(){if(this.closed||this.retryTimer)return;this.generation++;this.release();this.onStatus('再接続中…');this.retryTimer=setTimeout(()=>{this.retryTimer=null;this.connect();},1000);}
 destroy(){this.closed=true;this.generation++;clearTimeout(this.retryTimer);this.release();this.video.srcObject=null;}
};
