#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');

function readAuth(){
  const p = path.join(process.env.HOME,'.openclaw','agents','main','agent','auth-profiles.json');
  try{ return JSON.parse(fs.readFileSync(p,'utf8')); }catch(e){return null}
}

function post(body, key){
  return new Promise((resolve,reject)=>{
    const data = JSON.stringify(body);
    const req = https.request({
      hostname:'api.moonshot.ai',
      path:'/v1/chat/completions',
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Content-Length':Buffer.byteLength(data),
        'Authorization':'Bearer '+key
      }
    }, res=>{
      let out='';
      res.on('data',c=>out+=c);
      res.on('end',()=>{
        try{ resolve(JSON.parse(out)); }catch(e){ resolve({raw:out}); }
      });
    });
    req.on('error',reject);
    req.write(data); req.end();
  });
}

async function main(){
  const auth = readAuth();
  if(!auth || !auth.profiles || !auth.profiles['kimi:default']){
    console.error('No kimi:default profile found in auth-profiles.json');
    process.exit(2);
  }
  const key = auth.profiles['kimi:default'].key;
  const args = process.argv.slice(2);
  const userPrompt = args.join(' ') || 'Say hello from Kimi via adapter.';
  const body = {
    model: 'kimi-k2-0905-preview',
    messages:[
      {role:'system', content:'You are an adapter for OpenClaw.'},
      {role:'user', content: userPrompt}
    ]
  };
  try{
    const r = await post(body,key);
    if(r && r.choices && r.choices[0] && r.choices[0].message){
      console.log(r.choices[0].message.content);
    } else {
      console.log(JSON.stringify(r));
    }
  }catch(e){
    console.error('Request failed:',e.message||e);
    process.exit(1);
  }
}

main();
