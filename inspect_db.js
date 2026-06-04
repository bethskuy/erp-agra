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
  console.log('--- finance_pengajuan_pembayaran ---');
  const pengajuanSnap = await getDocs(collection(db, 'finance_pengajuan_pembayaran'));
  pengajuanSnap.forEach(doc => {
    const data = doc.data();
    console.log({
      id: doc.id,
      no_request: data.no_request,
      tipe_pengajuan: data.tipe_pengajuan,
      tagihan_id: data.tagihan_id,
      tagihan_nomor_invoice: data.tagihan_nomor_invoice,
      status: data.status,
      vendor_nama: data.vendor_nama,
      nominal: data.nominal
    });
  });

  console.log('\n--- finance_tagihan ---');
  const tagihanSnap = await getDocs(collection(db, 'finance_tagihan'));
  tagihanSnap.forEach(doc => {
    const data = doc.data();
    console.log({
      id: doc.id,
      kode_tagihan: data.kode_tagihan,
      nomor_invoice: data.nomor_invoice,
      supplier_nama: data.supplier_nama,
      status: data.status,
      grand_total: data.grand_total,
      total_dibayar: data.total_dibayar
    });
  });
}

run().catch(console.error);
