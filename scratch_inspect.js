import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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

console.log('Querying Firestore...');
const q = query(
  collection(db, 'pengajuan'),
  where('nama_karyawan', '==', 'REFQI OBETH SUDIARMAN SIPAHUTAR')
);

try {
  const snap = await getDocs(q);
  console.log(`Found ${snap.size} documents:`);
  snap.forEach(doc => {
    console.log(doc.id, JSON.stringify(doc.data(), null, 2));
  });
} catch (error) {
  console.error('Error querying:', error);
}
console.log('Done');
process.exit(0);
