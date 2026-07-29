(() => {
  'use strict';
  const config=window.SWEATER_SUPABASE_CONFIG;
  if(!config||!window.supabase){console.error('Supabase configuration is unavailable');return}
  const client=window.supabase.createClient(config.url,config.publishableKey,{
    auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
  });
  const CLOUD_KEYS=new Set([
    'sweaterQuoteStudioV3','sweaterQuotationAutosaveV2','sweaterQuoteSequenceV3',
    'sweaterDesignProjectsV3','sweaterDesignAutosaveV3','sweaterCouponAutosaveV2',
    'sweaterQrHistoryV1'
  ]);
  let userId=null,syncing=false;
  const rawSet=localStorage.setItem.bind(localStorage);
  const rawRemove=localStorage.removeItem.bind(localStorage);
  const parse=value=>{try{return JSON.parse(value)}catch(_){return value}};
  const cloudSave=async(key,value)=>{
    if(!userId||syncing||!CLOUD_KEYS.has(key))return;
    const {error}=await client.from('user_data').upsert({user_id:userId,data_key:key,value:parse(value),updated_at:new Date().toISOString()},{onConflict:'user_id,data_key'});
    if(error)console.error('Cloud save failed',error.message);
  };
  const cloudDelete=async key=>{
    if(!userId||syncing||!CLOUD_KEYS.has(key))return;
    const {error}=await client.from('user_data').delete().eq('user_id',userId).eq('data_key',key);
    if(error)console.error('Cloud delete failed',error.message);
  };
  localStorage.setItem=function(key,value){rawSet(key,value);cloudSave(String(key),String(value))};
  localStorage.removeItem=function(key){rawRemove(key);cloudDelete(String(key))};
  async function pull(id){
    const {data,error}=await client.from('user_data').select('data_key,value').eq('user_id',id);
    if(error)throw error;
    syncing=true;
    for(const row of data||[])rawSet(row.data_key,typeof row.value==='string'?row.value:JSON.stringify(row.value));
    syncing=false;
    return data?.length||0;
  }
  async function pushLocal(id){
    const rows=[];
    CLOUD_KEYS.forEach(key=>{const value=localStorage.getItem(key);if(value!==null)rows.push({user_id:id,data_key:key,value:parse(value),updated_at:new Date().toISOString()})});
    if(!rows.length)return;
    const {error}=await client.from('user_data').upsert(rows,{onConflict:'user_id,data_key'});if(error)throw error;
  }
  async function profile(id){
    const {data,error}=await client.from('profiles').select('*').eq('id',id).single();
    if(error)throw error;return data;
  }
  async function trackVisit(id,page){
    const safePage=String(page||'index.html').slice(0,160);
    const [{error:visitError},{error:presenceError}]=await Promise.all([
      client.from('site_visits').insert({user_id:id,page:safePage}),
      client.from('user_presence').upsert({user_id:id,current_page:safePage,last_seen_at:new Date().toISOString()},{onConflict:'user_id'})
    ]);
    if(visitError)console.warn('Visit tracking unavailable',visitError.message);
    if(presenceError)console.warn('Presence tracking unavailable',presenceError.message);
    if(!presenceError){
      const heartbeat=()=>{if(document.visibilityState==='visible')client.from('user_presence').upsert({user_id:id,current_page:safePage,last_seen_at:new Date().toISOString()},{onConflict:'user_id'}).then(()=>{})};
      const timer=setInterval(heartbeat,60000);window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});document.addEventListener('visibilitychange',heartbeat);
    }
  }
  window.SweaterCloud={client,pull,pushLocal,profile,trackVisit,keys:CLOUD_KEYS,setUser:id=>{userId=id},clearUser:()=>{userId=null}};
})();
