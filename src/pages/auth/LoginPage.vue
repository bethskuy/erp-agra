<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="login-page flex flex-center font-pro">
        <!-- BACKGROUND DECORATION -->
        <div class="login-bg-overlay"></div>
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>

        <q-card class="login-card shadow-24 overflow-hidden animate-fade-in">
          <div class="row no-wrap full-height">
            <!-- LEFT PANEL: BRANDING (Hidden on Mobile) -->
            <div
              class="col-md-6 gt-sm bg-indigo-10 relative-position overflow-hidden flex flex-center"
            >
              <div class="branding-overlay"></div>
              <div class="z-top text-center q-pa-xl text-white">
                <q-avatar size="100px" class="q-mb-lg shadow-10 bg-white">
                  <q-img src="icons/logo-agra.png" style="width: 70px" />
                </q-avatar>
                <div class="text-h3 text-weight-black tracking-tighter leading-none">
                  AGRA <span class="text-weight-light opacity-70">ERP</span>
                </div>
                <div class="text-subtitle1 q-mt-md opacity-80 text-weight-medium">
                  Integrated Engineering & Construction Management System
                </div>
                <div class="q-mt-xl"></div>
              </div>
              <!-- Subtle pattern -->
              <q-icon
                name="architecture"
                size="400px"
                class="absolute-bottom-right text-white opacity-10 q-mr-n-xl q-mb-n-xl"
              />
            </div>

            <!-- RIGHT PANEL: LOGIN FORM -->
            <div class="col-12 col-md-6 flex flex-center bg-white">
              <q-card-section class="full-width q-pa-xl">
                <!-- Logo for Mobile -->
                <div class="lt-md text-center q-mb-xl">
                  <div class="text-h4 text-weight-black text-indigo-10">AGRA ERP</div>
                  <div class="text-caption text-grey-7">Sign in to your account</div>
                </div>

                <div class="text-h5 text-weight-bold text-blue-grey-10 q-mb-xs gt-sm">
                  Selamat Datang
                </div>
                <div class="text-body2 text-grey-7 q-mb-xl gt-sm">Silakan masukkan akun Anda</div>

                <q-form @submit.prevent="prosesLogin" class="q-gutter-y-lg">
                  <div>
                    <div
                      class="text-caption text-weight-bold text-grey-7 q-mb-xs uppercase tracking-widest"
                    >
                      Email Address
                    </div>
                    <q-input
                      v-model="email"
                      outlined
                      rounded
                      placeholder="name@company.com"
                      class="custom-input shadow-inner-soft"
                    >
                      <template v-slot:prepend>
                        <q-icon name="alternate_email" color="indigo-10" />
                      </template>
                    </q-input>
                  </div>

                  <div>
                    <div class="row items-center justify-between q-mb-xs">
                      <div
                        class="text-caption text-weight-bold text-grey-7 uppercase tracking-widest"
                      >
                        Password
                      </div>
                      <a
                        href="#"
                        class="text-caption text-primary text-weight-bold no-decoration hover-underline"
                        >Lupa Password?</a
                      >
                    </div>
                    <q-input
                      v-model="password"
                      :type="showPwd ? 'text' : 'password'"
                      outlined
                      rounded
                      placeholder="••••••••"
                      class="custom-input shadow-inner-soft"
                    >
                      <template v-slot:prepend>
                        <q-icon name="lock" color="indigo-10" />
                      </template>
                      <template v-slot:append>
                        <q-btn
                          flat
                          round
                          dense
                          :icon="showPwd ? 'visibility' : 'visibility_off'"
                          color="grey-6"
                          @click="showPwd = !showPwd"
                        />
                      </template>
                    </q-input>
                  </div>

                  <div class="row items-center q-mb-sm">
                    <q-checkbox
                      v-model="rememberMe"
                      label="Ingat saya di perangkat ini"
                      color="indigo-10"
                      class="text-grey-8 text-caption"
                    />
                  </div>

                  <q-btn
                    label="MASUK"
                    type="submit"
                    color="indigo-10"
                    class="full-width q-py-md text-weight-black shadow-10 rounded-25 btn-login"
                    unelevated
                    :loading="loading"
                  >
                    <template v-slot:loading>
                      <q-spinner-dots />
                    </template>
                  </q-btn>
                </q-form>

                <div class="q-mt-xl text-center text-caption text-grey-6">
                  © 2026 PT AGRA ABHINAYA PERKASA
                </div>
              </q-card-section>
            </div>
          </div>
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
const showPwd = ref(false)
const rememberMe = ref(true)
const loading = ref(false)

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

const prosesLogin = async () => {
  if (!email.value || !password.value) {
    $q.notify({ type: 'warning', message: 'Email dan Password wajib diisi!' })
    return
  }

  loading.value = true
  try {
    const cred = await signInWithEmailAndPassword(auth, email.value, password.value)

    const q = query(collection(db, 'karyawan'), where('email', '==', email.value.toLowerCase()))
    let snapshot = await getDocs(q)

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

    $q.notify({
      color: 'positive',
      message: 'Login Berhasil! Mengalihkan...',
      icon: 'verified',
      position: 'top',
    })

    router.push('/')
  } catch (e) {
    let msg = 'Kredensial tidak valid!'
    if (e.code === 'auth/user-not-found') msg = 'Akun tidak terdaftar!'
    if (e.code === 'auth/wrong-password') msg = 'Password salah!'

    $q.notify({
      color: 'negative',
      message: msg,
      icon: 'report_problem',
      position: 'bottom',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800;900&display=swap');

.font-pro {
  font-family:
    'Inter',
    -apple-system,
    sans-serif;
}

.login-page {
  background-color: #f8fafd;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
}

/* Background Blobs */
.blob {
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(26, 35, 126, 0.08) 0%, transparent 70%);
  filter: blur(60px);
  z-index: 0;
}
.blob-1 {
  top: -100px;
  left: -100px;
}
.blob-2 {
  bottom: -100px;
  right: -100px;
}

.login-bg-overlay {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(at 0% 0%, hsla(210, 100%, 98%, 1) 0, transparent 50%),
    radial-gradient(at 100% 0%, hsla(215, 100%, 98%, 1) 0, transparent 50%);
  z-index: 0;
}

.login-card {
  width: 950px;
  max-width: 95vw;
  height: 600px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.branding-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(26, 35, 126, 0.95) 0%, rgba(13, 71, 161, 0.8) 100%);
  z-index: 1;
}

.z-top {
  position: relative;
  z-index: 5;
}

/* Custom Inputs */
.custom-input :deep(.q-field__control) {
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}
.custom-input :deep(.q-field__control:hover) {
  border-color: #1a237e;
  background-color: #fff;
}
.custom-input :deep(.q-field--focused .q-field__control) {
  border-color: #1a237e;
  background-color: #fff;
  box-shadow: 0 0 0 4px rgba(26, 35, 126, 0.1);
}

.rounded-25 {
  border-radius: 25px;
}
.btn-login {
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
}
.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(26, 35, 126, 0.3);
  filter: brightness(1.1);
}

.no-decoration {
  text-decoration: none;
}
.hover-underline:hover {
  text-decoration: underline;
}

.leading-none {
  line-height: 1;
}
.tracking-widest {
  letter-spacing: 0.15em;
}
.opacity-70 {
  opacity: 0.7;
}
.opacity-80 {
  opacity: 0.8;
}
.opacity-10 {
  opacity: 0.1;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive Mobile */
@media (max-width: 1023px) {
  .login-card {
    height: auto;
    width: 400px;
    border-radius: 25px;
  }
}
</style>
