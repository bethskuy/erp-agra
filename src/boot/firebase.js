import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBPa0MrS83QbGXDo1QpHqaiQ2Bo-9XBDQE',
  authDomain: 'agra-erp.firebaseapp.com',
  projectId: 'agra-erp',
  storageBucket: 'agra-erp.firebasestorage.app',
  messagingSenderId: '304254078698',
  appId: '1:304254078698:web:8447ad308fd09ec307d193',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db }
