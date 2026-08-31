(() => {
  'use strict';
  const VERSION='12.18.0';
  const base=`https://www.gstatic.com/firebasejs/${VERSION}`;
  window.SweaterFirebaseReady=(async()=>{
    const config=window.SWEATER_FIREBASE_CONFIG;
    if(!config)throw new Error('Firebase configuration is unavailable');
    const [core,authApi,dbApi,storageApi]=await Promise.all([
      import(`${base}/firebase-app.js`),
      import(`${base}/firebase-auth.js`),
      import(`${base}/firebase-firestore.js`),
      import(`${base}/firebase-storage.js`)
    ]);
    const firebaseApp=core.initializeApp(config);
    const auth=authApi.getAuth(firebaseApp);
    await authApi.setPersistence(auth,authApi.browserLocalPersistence);
    const db=dbApi.getFirestore(firebaseApp);
    const storage=storageApi.getStorage(firebaseApp);

    const waitForUser=()=>new Promise(resolve=>{
      const stop=authApi.onAuthStateChanged(auth,user=>{stop();resolve(user||null)});
    });
    const profile=async uid=>{
      const snapshot=await dbApi.getDoc(dbApi.doc(db,'users',uid));
      return snapshot.exists()?{id:snapshot.id,...snapshot.data()}:null;
    };
    const saveProfile=(uid,value,merge=true)=>dbApi.setDoc(
      dbApi.doc(db,'users',uid),
      {...value,updatedAt:dbApi.serverTimestamp()},
      {merge}
    );
    const loadUserData=async uid=>{
      const snapshot=await dbApi.getDocs(dbApi.collection(db,'users',uid,'data'));
      return snapshot.docs.map(item=>({data_key:item.id,...item.data()}));
    };
    const saveUserData=(uid,key,value)=>dbApi.setDoc(
      dbApi.doc(db,'users',uid,'data',String(key)),
      {value,updatedAt:dbApi.serverTimestamp()},
      {merge:true}
    );
    const deleteUserData=(uid,key)=>dbApi.deleteDoc(dbApi.doc(db,'users',uid,'data',String(key)));
    const loadSiteConfig=async()=>{
      const snapshot=await dbApi.getDoc(dbApi.doc(db,'site','config'));
      return snapshot.exists()?snapshot.data().value||{}:{};
    };
    const saveSiteConfig=value=>dbApi.setDoc(
      dbApi.doc(db,'site','config'),
      {value,updatedAt:dbApi.serverTimestamp()},
      {merge:true}
    );

    const api={
      app:firebaseApp,auth,db,storage,authApi,dbApi,storageApi,
      waitForUser,profile,saveProfile,loadUserData,saveUserData,deleteUserData,
      loadSiteConfig,saveSiteConfig,
      signIn:(email,password)=>authApi.signInWithEmailAndPassword(auth,email,password),
      signOut:()=>authApi.signOut(auth),
      resetPassword:email=>authApi.sendPasswordResetEmail(auth,email)
    };
    window.SweaterFirebase=api;
    return api;
  })().catch(error=>{
    console.error('Firebase startup failed',error);
    throw error;
  });
})();