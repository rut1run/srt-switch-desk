'use strict';
(function(root){
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 function gainDb(rms,target=-18){const db=20*Math.log10(Math.max(rms,1e-8));return db<-50?0:clamp(target-db,-24,12);}
 function rectangles(layout){if(layout===2)return [[0,0,.5,1],[.5,0,.5,1]];if(layout===3)return [[0,0,2/3,1],[2/3,0,1/3,.5],[2/3,.5,1/3,.5]];return [[0,0,1,1]];}
 function rms(samples){let sum=0;for(const x of samples)sum+=x*x;return Math.sqrt(sum/Math.max(1,samples.length));}
 const value={clamp,gainDb,rectangles,rms,dbToGain:db=>Math.pow(10,db/20)};
 root.DeskMixMath=value;if(typeof module!=='undefined')module.exports=value;
})(typeof window!=='undefined'?window:globalThis);
