import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBPa0MrS83QbGXDo1QpHqaiQ2Bo-9XBDQE',
  authDomain: 'agra-erp.firebaseapp.com',
  projectId: 'agra-erp',
  storageBucket: 'agra-erp.firebasestorage.app',
  messagingSenderId: '304254078698',
  appId: '1:304254078698:web:8447ad308fd09ec307d193',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log('--- harian_lepas_absen ---');
  const snap = await getDocs(collection(db, 'harian_lepas_absen'));
  snap.forEach(doc => {
    console.log(doc.id, JSON.stringify(doc.data(), null, 2));
  });

  console.log('\n--- harian_lepas_mandor ---');
  const mSnap = await getDocs(collection(db, 'harian_lepas_mandor'));
  mSnap.forEach(doc => {
    console.log(doc.id, JSON.stringify(doc.data(), null, 2));
  });
}

run().catch(console.error);
