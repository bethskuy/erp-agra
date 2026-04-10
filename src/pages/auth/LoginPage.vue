<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="bg-primary flex flex-center">
        <q-card style="width: 350px; border-radius: 15px">
          <q-card-section class="text-center q-pa-lg">
            <div class="text-h4 text-weight-bold text-primary">AGRA ERP</div>
            <div class="text-subtitle2 text-grey-7">Construction & Absensi</div>
          </q-card-section>

          <q-card-section class="q-px-lg">
            <q-input v-model="email" label="Email" outline class="q-mb-md" dense>
              <template v-slot:prepend><q-icon name="email" /></template>
            </q-input>

            <q-input
              v-model="password"
              type="password"
              label="Password"
              outline
              class="q-mb-lg"
              dense
            >
              <template v-slot:prepend><q-icon name="lock" /></template>
            </q-input>

            <q-btn
              label="Login"
              color="primary"
              class="full-width q-py-sm"
              rounded
              unelevated
              :loading="loading"
              @click="prosesLogin"
            />
          </q-card-section>

          <q-card-section class="text-center q-pb-lg">
            <div class="text-caption text-grey">Project KKP - Agra Group</div>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { auth } from 'src/boot/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const email = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()
const $q = useQuasar()

const prosesLogin = async () => {
  if (!email.value || !password.value) {
    $q.notify({ color: 'warning', message: 'Email & Password wajib diisi!' })
    return
  }

  loading.value = true
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    $q.notify({ color: 'positive', message: 'Berhasil Masuk!', icon: 'check' })
    router.push('/')
  } catch (error) {
    $q.notify({ color: 'negative', message: 'Gagal: ' + error.message, icon: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Memastikan warna background login full biru */
.bg-primary {
  background: #1976d2 !important;
}
</style>
