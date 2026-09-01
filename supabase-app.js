(() => {
  'use strict';

  const VERSION='12.18.0';
  const base=`https://www.gstatic.com/firebasejs/${VERSION}`;
  const CLOUD_KEYS=new Set([
    'sweaterQuoteStudioV3','sweaterQuotationAutosaveV2','sweaterQuotationAutosaveV3','sweaterQuoteSequenceV3',
    'sweaterDesignProjectsV3','sweaterDesignAutosaveV3','sweaterCouponAutosaveV2','sweaterQrHistoryV1','sweaterAffiliatePosterV1'
  ]);
  const downloadUrls=new Map();
  let userId=null,syncing=false,api=null;

  const rawSet=localStorage.setItem.bind(localStorage);
  const rawRemove=localStorage.removeItem.bind(localStorage);
  const parse=value=>{try{return JSON.parse(value)}catch(_){return value}};
  const clean=value=>{
    if(value===undefined)return null;
    if(value===null||typeof value!=='object')return value;
    if(value instanceof Date)return value.toISOString();
    if(Array.isArray(value))return value.map(clean);
    return Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined).map(([k,v])=>[k,clean(v)]));
  };
  const publicUser=user=>user?{id:user.uid,uid:user.uid,email:user.email||'',name:user.displayName||'',displayName:user.displayName||'',photoURL:user.photoURL||'',email_confirmed_at:user.emailVerified?new Date().toISOString():null}:null;
  const sessionFor=user=>user?{user:publicUser(user),access_token:'firebase-session'}:null;

  const ready=(async()=>{
    const config=window.SWEATER_FIREBASE_CONFIG;
    if(!config)throw new Error('إعداد Firebase غير متاح');
    const [core,authApi,dbApi,storageApi]=await Promise.all([
      import(`${base}/firebase-app.js`),
      import(`${base}/firebase-auth.js`),
      import(`${base}/firebase-firestore.js`),
      import(`${base}/firebase-storage.js`)
    ]);
    const app=core.getApps().find(item=>item.name==='[DEFAULT]')||core.initializeApp(config);
    const auth=authApi.getAuth(app);
    await authApi.setPersistence(auth,authApi.browserLocalPersistence);
    const db=dbApi.getFirestore(app);
    const storage=storageApi.getStorage(app);
    const waitForUser=()=>new Promise(resolve=>{
      const stop=authApi.onAuthStateChanged(auth,user=>{stop();resolve(user||null)});
    });
    api={core,authApi,dbApi,storageApi,app,auth,db,storage,waitForUser};
    return api;
  })();

  const run=fn=>ready.then(()=>fn(api));
  const getAll=async table=>run(async({db,dbApi})=>{
    const snap=await dbApi.getDocs(dbApi.collection(db,table));
    return snap.docs.map(doc=>({id:doc.id,...doc.data()}));
  });
  const byFilters=(rows,filters)=>rows.filter(row=>filters.every(({op,key,value})=>{
    const current=row[key];
    if(op==='eq')return String(current??'')===String(value??'');
    if(op==='gte')return String(current??'')>=String(value??'');
    return true;
  }));
  const docIdFor=(table,row)=>{
    if(row?.id!=null&&String(row.id))return String(row.id);
    if(table==='user_presence'&&row?.user_id)return String(row.user_id);
    if(table==='user_data'&&row?.user_id&&row?.data_key)return `${row.user_id}__${row.data_key}`;
    if(table==='site_config')return 'global';
    return crypto.randomUUID();
  };

  class QueryBuilder{
    constructor(table){this.table=table;this.filters=[];this.sort=null;this.max=null;this.columns='*';this.action='select';this.payload=null;this.options={};this.singleKind='';}
    select(columns='*',options={}){this.columns=columns||'*';this.options={...this.options,...options};return this}
    eq(key,value){this.filters.push({op:'eq',key,value});return this}
    gte(key,value){this.filters.push({op:'gte',key,value});return this}
    order(key,{ascending=true}={}){this.sort={key,ascending};return this}
    limit(value){this.max=Number(value)||null;return this}
    insert(payload){this.action='insert';this.payload=payload;return this}
    upsert(payload,options={}){this.action='upsert';this.payload=payload;this.options={...this.options,...options};return this}
    update(payload){this.action='update';this.payload=payload;return this}
    delete(){this.action='delete';return this}
    maybeSingle(){this.singleKind='maybe';return this}
    single(){this.singleKind='single';return this}
    then(resolve,reject){return this.execute().then(resolve,reject)}
    async execute(){
      try{
        let data=null,count=null;
        if(this.action==='select'){
          let rows=byFilters(await getAll(this.table),this.filters);
          if(this.sort)rows.sort((a,b)=>{
            const av=a[this.sort.key]??'',bv=b[this.sort.key]??'';
            return (av>bv?1:av<bv?-1:0)*(this.sort.ascending?1:-1);
          });
          if(this.max)rows=rows.slice(0,this.max);
          count=rows.length;
          if(this.options.head)data=null;
          else data=rows;
        }else if(this.action==='insert'||this.action==='upsert'){
          const list=Array.isArray(this.payload)?this.payload:[this.payload];
          data=await run(async({db,dbApi})=>{
            const saved=[];
            for(const source of list){
              const row=clean(source||{}),id=docIdFor(this.table,row);
              await dbApi.setDoc(dbApi.doc(db,this.table,id),{...row,id},{merge:this.action==='upsert'});
              saved.push({...row,id});
            }
            return saved;
          });
        }else{
          const rows=byFilters(await getAll(this.table),this.filters);
          data=await run(async({db,dbApi})=>{
            const changed=[];
            for(const row of rows){
              const ref=dbApi.doc(db,this.table,String(row.id));
              if(this.action==='delete')await dbApi.deleteDoc(ref);
              else{
                const next={...row,...clean(this.payload||{}),id:row.id};
                await dbApi.setDoc(ref,next,{merge:true});
                changed.push(next);
              }
            }
            return changed;
          });
        }
        if(this.singleKind){
          const row=Array.isArray(data)?data[0]||null:data;
          if(this.singleKind==='single'&&!row)return {data:null,error:new Error('لم يتم العثور على السجل'),count};
          return {data:row,error:null,count};
        }
        return {data,error:null,count};
      }catch(error){
        console.error(`Firebase operation failed: ${this.table}`,error);
        return {data:null,error,count:null};
      }
    }
  }

  const auth={
    async getSession(){const user=await run(({waitForUser})=>waitForUser());return {data:{session:sessionFor(user)},error:null}},
    async getUser(){const user=await run(({waitForUser})=>waitForUser());return {data:{user:publicUser(user)},error:null}},
    async signInWithPassword({email,password}){
      try{
        const credential=await run(({auth,authApi})=>authApi.signInWithEmailAndPassword(auth,email,password));
        return {data:{user:publicUser(credential.user),session:sessionFor(credential.user)},error:null};
      }catch(error){return {data:{user:null,session:null},error}}
    },
    async signInWithGoogle(){
      try{
        const credential=await run(async({auth,authApi})=>{
          const provider=new authApi.GoogleAuthProvider();
          provider.setCustomParameters({hd:'sweater.sa',prompt:'select_account'});
          return authApi.signInWithPopup(auth,provider);
        });
        const email=String(credential.user.email||'').trim().toLowerCase();
        if(!email.endsWith('@sweater.sa')){
          await run(({auth,authApi})=>authApi.signOut(auth));
          const error=new Error('الدخول متاح فقط لحسابات @sweater.sa');
          error.code='auth/unauthorized-domain-account';
          throw error;
        }
        return {data:{user:publicUser(credential.user),session:sessionFor(credential.user)},error:null};
      }catch(error){return {data:{user:null,session:null},error}}
    },
    async signOut(){try{await run(({auth,authApi})=>authApi.signOut(auth));return {error:null}}catch(error){return {error}}},
    async resetPasswordForEmail(email){
      try{await run(({auth,authApi})=>authApi.sendPasswordResetEmail(auth,email));return {data:{},error:null}}
      catch(error){return {data:null,error}}
    }
  };

  async function manageEmployee(body={}){
    const action=body.action;
    if(action==='create'){
      return run(async({core,authApi,dbApi,db})=>{
        const secondary=core.initializeApp(window.SWEATER_FIREBASE_CONFIG,`employee-${Date.now()}`);
        try{
          const secondaryAuth=authApi.getAuth(secondary);
          const credential=await authApi.createUserWithEmailAndPassword(secondaryAuth,String(body.email||'').trim().toLowerCase(),String(body.password||''));
          const uid=credential.user.uid;
          const profile={
            id:uid,uid,email:String(body.email||'').trim().toLowerCase(),
            full_name:body.name||'',username:body.username||'',department:body.department||'',
            role:body.role==='admin'?'admin':'employee',status:body.status||'active',
            created_at:new Date().toISOString(),updated_at:new Date().toISOString()
          };
          await Promise.all([
            dbApi.setDoc(dbApi.doc(db,'users',uid),profile,{merge:true}),
            dbApi.setDoc(dbApi.doc(db,'profiles',uid),profile,{merge:true})
          ]);
          return {user:{id:uid,email:profile.email}};
        }finally{
          try{await authApi.signOut(authApi.getAuth(secondary))}catch(_){}
          try{await core.deleteApp(secondary)}catch(_){}
        }
      });
    }
    const id=String(body.id||'');
    if(!id)throw new Error('معرّف الموظف غير موجود');
    return run(async({db,dbApi})=>{
      if(action==='delete'){
        await Promise.allSettled([
          dbApi.deleteDoc(dbApi.doc(db,'users',id)),
          dbApi.deleteDoc(dbApi.doc(db,'profiles',id))
        ]);
        return {deleted:true,id};
      }
      if(action==='update'){
        const patch=clean({
          full_name:body.name,username:body.username,department:body.department,
          role:body.role==='admin'?'admin':'employee',status:body.status||'active',
          updated_at:new Date().toISOString()
        });
        await Promise.all([
          dbApi.setDoc(dbApi.doc(db,'users',id),patch,{merge:true}),
          dbApi.setDoc(dbApi.doc(db,'profiles',id),patch,{merge:true})
        ]);
        return {updated:true,id};
      }
      throw new Error('عملية الموظف غير مدعومة');
    });
  }

  const functions={
    async invoke(name,{body}={}){
      try{
        if(name==='manage-employee')return {data:await manageEmployee(body),error:null};
        if(name==='content-writer')return {data:{error:'كاتب المحتوى يحتاج تفعيل Firebase Functions قبل استخدامه.'},error:null};
        return {data:null,error:new Error('الخدمة غير متاحة')};
      }catch(error){return {data:null,error}}
    }
  };

  const storage={
    from(bucket){
      return {
        async upload(path,file,options={}){
          try{
            const result=await run(async({storage,storageApi})=>{
              const ref=storageApi.ref(storage,path);
              const snapshot=await storageApi.uploadBytes(ref,file,{contentType:options.contentType||file.type,cacheControl:options.cacheControl||'3600'});
              const url=await storageApi.getDownloadURL(snapshot.ref);
              downloadUrls.set(path,url);
              return {path,fullPath:snapshot.ref.fullPath};
            });
            return {data:result,error:null};
          }catch(error){return {data:null,error}}
        },
        getPublicUrl(path){return {data:{publicUrl:downloadUrls.get(path)||''}}}
      };
    }
  };

  const client={
    auth,functions,storage,
    from:table=>new QueryBuilder(table),
    channel(){
      let listener=null,table='';
      return {
        on(_event,settings,callback){table=settings?.table||'';listener=callback;return this},
        subscribe(){
          if(table&&listener)run(({db,dbApi})=>dbApi.onSnapshot(dbApi.collection(db,table),snap=>{
            snap.docChanges().forEach(change=>listener({eventType:change.type,new:{id:change.doc.id,...change.doc.data()},old:{id:change.doc.id}}));
          })).catch(()=>{});
          return this;
        }
      };
    }
  };

  const cloudSave=async(key,value)=>{
    if(!userId||syncing||!CLOUD_KEYS.has(key))return;
    await run(({db,dbApi})=>dbApi.setDoc(
      dbApi.doc(db,'users',userId,'data',String(key)),
      {value:parse(value),data_key:String(key),user_id:userId,updated_at:new Date().toISOString()},
      {merge:true}
    ));
  };
  const cloudDelete=async key=>{
    if(!userId||syncing||!CLOUD_KEYS.has(key))return;
    await run(({db,dbApi})=>dbApi.deleteDoc(dbApi.doc(db,'users',userId,'data',String(key))));
  };
  localStorage.setItem=function(key,value){rawSet(key,value);cloudSave(String(key),String(value)).catch(console.warn)};
  localStorage.removeItem=function(key){rawRemove(key);cloudDelete(String(key)).catch(console.warn)};

  async function pull(id){
    const nested=await run(async({db,dbApi})=>{
      const snap=await dbApi.getDocs(dbApi.collection(db,'users',id,'data'));
      return snap.docs.map(item=>({data_key:item.id,...item.data()}));
    });
    let rows=nested;
    if(!rows.length){
      rows=await run(async({db,dbApi})=>{
        const legacyQuery=dbApi.query(
          dbApi.collection(db,'user_data'),
          dbApi.where('user_id','==',id)
        );
        const snap=await dbApi.getDocs(legacyQuery);
        return snap.docs.map(item=>({id:item.id,...item.data()}));
      });
    }
    syncing=true;
    for(const row of rows)rawSet(row.data_key,typeof row.value==='string'?row.value:JSON.stringify(row.value));
    syncing=false;
    return rows.length;
  }
  async function pushLocal(id){
    for(const key of CLOUD_KEYS){
      const value=localStorage.getItem(key);
      if(value!==null)await run(({db,dbApi})=>dbApi.setDoc(
        dbApi.doc(db,'users',id,'data',key),
        {value:parse(value),data_key:key,user_id:id,updated_at:new Date().toISOString()},
        {merge:true}
      ));
    }
  }
  async function profile(id){
    return run(async({db,dbApi})=>{
      let snap=await dbApi.getDoc(dbApi.doc(db,'users',id));
      if(!snap.exists())snap=await dbApi.getDoc(dbApi.doc(db,'profiles',id));
      if(!snap.exists())throw new Error('ملف الحساب غير موجود');
      return {id:snap.id,...snap.data()};
    });
  }
  async function trackVisit(id,page){
    const safePage=String(page||'index.html').slice(0,160),now=new Date().toISOString();
    await Promise.allSettled([
      run(({db,dbApi})=>dbApi.setDoc(dbApi.doc(db,'site_visits',crypto.randomUUID()),{id:crypto.randomUUID(),user_id:id,page:safePage,visited_at:now})),
      run(({db,dbApi})=>dbApi.setDoc(dbApi.doc(db,'user_presence',id),{id,user_id:id,current_page:safePage,last_seen_at:now},{merge:true}))
    ]);
    const heartbeat=()=>{if(document.visibilityState==='visible')run(({db,dbApi})=>dbApi.setDoc(dbApi.doc(db,'user_presence',id),{id,user_id:id,current_page:safePage,last_seen_at:new Date().toISOString()},{merge:true})).catch(()=>{})};
    const timer=setInterval(heartbeat,60000);
    window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
    document.addEventListener('visibilitychange',heartbeat);
  }

  window.SweaterCloud={client,pull,pushLocal,profile,trackVisit,keys:CLOUD_KEYS,setUser:id=>{userId=id},clearUser:()=>{userId=null},provider:'firebase',ready};
  window.SweaterCloudReady=ready;
  ready.catch(error=>console.error('Firebase startup failed',error));
})();
