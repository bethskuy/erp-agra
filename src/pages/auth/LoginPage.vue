<template>
  <q-layout>
    <q-page-container>
      <q-page class="bg-primary flex flex-center">
        <q-card style="width: 350px; border-radius: 15px">
          <q-card-section class="text-center q-pa-lg">
            <div class="text-h4 text-weight-bold text-primary">AGRA ERP</div>
          </q-card-section>
          <q-card-section class="q-px-lg">
            <q-input v-model="email" label="Email" outline class="q-mb-md" dense />
            <q-input
              v-model="password"
              type="password"
              label="Password"
              outline
              class="q-mb-lg"
              dense
            />
            <q-btn
              label="Login"
              color="primary"
              class="full-width"
              @click="prosesLogin"
              :loading="loading"
            />
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { auth, db } from 'src/boot/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'

const email = ref('refqiobeth345@gmail.com')
const password = ref('')
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

const prosesLogin = async () => {
  loading.value = true
  try {
    const cred = await signInWithEmailAndPassword(auth, email.value, password.value)

    // Cari data di Firestore
    const q = query(collection(db, 'karyawan'), where('email', '==', email.value.toLowerCase()))
    let snapshot = await getDocs(q)

    // PINTU DARURAT: Jika data belum ada, buatkan otomatis
    if (snapshot.empty) {
      const dataBaru = {
        nama: 'Refqiobeth Developer',
        email: email.value.toLowerCase(),
        role: 'Super Admin',
        uid: cred.user.uid,
        akses: ['konstruksi', 'absensi', 'manufaktur', 'admin'],
      }
      await setDoc(doc(collection(db, 'karyawan')), dataBaru)
      authStore.setLogin(dataBaru, dataBaru.akses)
    } else {
      authStore.setLogin(snapshot.docs[0].data(), snapshot.docs[0].data().akses)
    }

    router.push('/')
  } catch (e) {
    $q.notify({ color: 'negative', message: e.message })
  } finally {
    loading.value = false
  }
}
</script>
