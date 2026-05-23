<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="login-page">
        <!-- 3D & Particle Background Canvas -->
        <canvas ref="bgCanvas" id="bg-canvas"></canvas>

        <!-- Landscape Vector Overlay (Pegunungan & Siluet Konstruksi terinspirasi dari image_4321ff.png) -->
        <div class="landscape-overlay">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none" class="landscape-svg">
            <!-- Bukit Belakang -->
            <path
              d="M0,220 Q360,150 720,240 T1440,200 L1440,320 L0,320 Z"
              fill="rgba(21, 26, 66, 0.5)"
            ></path>
            <!-- Bukit Tengah dengan Siluet Crane & Gedung Konstruksi -->
            <path
              d="M0,250 Q480,200 960,270 T1440,240 L1440,320 L0,320 Z"
              fill="rgba(15, 19, 48, 0.8)"
            ></path>
            <!-- Bukit Depan -->
            <path d="M0,280 Q240,250 720,290 T1440,270 L1440,320 L0,320 Z" fill="#0A0D22"></path>
          </svg>

          <!-- Siluet Crane Konstruksi -->
          <div class="crane-silhouette left-crane">
            <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10,120 L15,120 L15,40 L10,120 Z" fill="rgba(99, 102, 241, 0.25)" />
              <path d="M15,120 L20,120 L20,40 L15,120 Z" fill="rgba(99, 102, 241, 0.25)" />
              <path d="M20,40 L15,40 L17.5,120 Z" fill="rgba(99, 102, 241, 0.3)" />
              <path d="M17.5,40 L90,15 L17.5,25 Z" fill="rgba(99, 102, 241, 0.2)" />
              <path d="M17.5,40 L3,28 L17.5,33 Z" fill="rgba(99, 102, 241, 0.2)" />
              <line
                x1="17.5"
                y1="40"
                x2="17.5"
                y2="120"
                stroke="rgba(99, 102, 241, 0.25)"
                stroke-width="2"
              />
              <line
                x1="17.5"
                y1="40"
                x2="90"
                y2="15"
                stroke="rgba(99, 102, 241, 0.25)"
                stroke-width="2.5"
              />
              <line
                x1="3"
                y1="28"
                x2="90"
                y2="15"
                stroke="rgba(99, 102, 241, 0.15)"
                stroke-width="1"
              />
              <!-- Pengait beban -->
              <line
                x1="60"
                y1="23"
                x2="60"
                y2="65"
                stroke="rgba(251, 191, 36, 0.4)"
                stroke-width="1.5"
              />
              <circle cx="60" cy="67" r="2.5" fill="#FBBF24" />
            </svg>
          </div>

          <div class="crane-silhouette right-crane">
            <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10,120 L15,120 L15,30 L10,120 Z" fill="rgba(6, 182, 212, 0.2)" />
              <path d="M15,120 L20,120 L20,30 L15,120 Z" fill="rgba(6, 182, 212, 0.2)" />
              <line
                x1="17.5"
                y1="30"
                x2="17.5"
                y2="120"
                stroke="rgba(6, 182, 212, 0.25)"
                stroke-width="2"
              />
              <line
                x1="17.5"
                y1="30"
                x2="80"
                y2="8"
                stroke="rgba(6, 182, 212, 0.25)"
                stroke-width="2"
              />
              <line
                x1="3"
                y1="18"
                x2="80"
                y2="8"
                stroke="rgba(6, 182, 212, 0.15)"
                stroke-width="1"
              />
              <line
                x1="55"
                y1="14"
                x2="55"
                y2="50"
                stroke="rgba(6, 182, 212, 0.3)"
                stroke-width="1"
              />
            </svg>
          </div>
        </div>

        <!-- Foreground Content -->
        <div class="login-container">
          <!-- MAIN GLASS CARD (Glassmorphism Premium) -->
          <div class="main-glass-card animate-fade-in">
            <div class="card-row">
              <!-- LEFT SIDE: 3D Construction & Analytics View (Terinspirasi dari image_432149.png) -->
              <div class="card-left">
                <!-- Inner Curved Glass Panel for Rocket -->
                <div class="inner-rocket-panel">
                  <canvas ref="analysisCanvas" class="analysis-canvas"></canvas>
                  <div class="rocket-caption">
                    <h2 class="caption-title">AGRA ERP</h2>
                    <p class="caption-sub">
                      Integrated Engineering & Construction Management System
                    </p>
                  </div>
                </div>
              </div>

              <!-- RIGHT SIDE: Quasar Login Form -->
              <div class="card-right">
                <!-- Logo Perusahaan Asli -->
                <div class="logo-wrapper">
                  <div class="logo-circle shadow-lg">
                    <q-img
                      src="icons/logo-agra.png"
                      style="width: 52px; height: 52px"
                      fit="contain"
                    />
                  </div>
                </div>

                <!-- Headers -->
                <div class="header-text">
                  <h1 class="title">Selamat Datang</h1>
                  <p class="subtitle">Silakan masukkan akun Anda</p>
                </div>

                <!-- Form -->
                <q-form @submit.prevent="prosesLogin" class="q-gutter-y-md form-container">
                  <!-- Email Field -->
                  <div>
                    <label class="input-label">Email Address</label>
                    <q-input
                      v-model="email"
                      outlined
                      placeholder="name@company.com"
                      class="custom-input"
                      lazy-rules
                    >
                      <template v-slot:prepend>
                        <q-icon name="alternate_email" color="indigo-10" />
                      </template>
                    </q-input>
                  </div>

                  <!-- Password Field -->
                  <div>
                    <div class="password-label-wrapper">
                      <label class="input-label">Password</label>
                      <a href="#" class="forgot-password">Lupa Password?</a>
                    </div>
                    <q-input
                      v-model="password"
                      :type="showPwd ? 'text' : 'password'"
                      outlined
                      placeholder="••••••••"
                      class="custom-input"
                      lazy-rules
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

                  <!-- Remember Me -->
                  <div class="remember-wrapper">
                    <q-checkbox
                      v-model="rememberMe"
                      label="Ingat saya di perangkat ini"
                      color="indigo-10"
                      class="text-white text-caption text-weight-medium custom-checkbox"
                    />
                  </div>

                  <!-- Submit Button -->
                  <div class="submit-wrapper">
                    <q-btn
                      label="MASUK"
                      type="submit"
                      class="btn-primary full-width text-weight-bold"
                      unelevated
                      :loading="loading"
                    >
                      <template v-slot:loading><q-spinner-dots /></template>
                    </q-btn>
                  </div>
                </q-form>

                <!-- Footer -->
                <div class="footer-text">
                  <p>© 2026 PT AGRA ABHINAYA PERKASA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { auth, db } from 'src/boot/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'

// Pastikan ThreeJS terinstal: npm install three
import * as THREE from 'three'

// State Form
const email = ref('refqiobeth345@gmail.com')
const password = ref('')
const showPwd = ref(false)
const rememberMe = ref(true)
const loading = ref(false)

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

// State 3D Canvas
const bgCanvas = ref(null)
const analysisCanvas = ref(null)

let bgAnimationFrameId = null
let analysisAnimationFrameId = null

// Variabel Kontrol Latar Belakang (Bintang & Elemen Konstruksi melayang jauh)
let bgScene, bgCamera, bgRenderer
let bgObjects = []

// Variabel Kontrol Kartu Kiri (Analisis Proyek 3D)
let analScene, analCamera, analRenderer
let blueprintTablet = null
let bulbIdea = null
let waveChart = null
let handWithPen = null
let pieCharts = []
let plusSymbols = []

// Logika Proses Login Asli Milik Anda
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

    let userDataToSave = {}

    if (snapshot.empty) {
      userDataToSave = {
        nama: 'Refqi Obeth Sudiarman',
        email: email.value.toLowerCase(),
        role: 'Super Admin',
        jabatan: 'Super Admin',
        uid: cred.user.uid,
        akses: ['konstruksi', 'absensi', 'manufaktur', 'admin', 'aset'],
      }
      await setDoc(doc(collection(db, 'karyawan')), userDataToSave)
    } else {
      userDataToSave = snapshot.docs[0].data()
    }

    authStore.setLogin(userDataToSave, userDataToSave.akses)
    localStorage.setItem('user_data', JSON.stringify(userDataToSave))

    $q.notify({
      color: 'positive',
      message: 'Login Berhasil! Mengalihkan ke Menu Utama...',
      icon: 'verified',
      position: 'top',
    })

    router.push('/')
  } catch (e) {
    let msg = 'Kredensial tidak valid!'
    if (e.code === 'auth/user-not-found') msg = 'Akun tidak terdaftar!'
    if (e.code === 'auth/wrong-password') msg = 'Password salah!'

    $q.notify({ color: 'negative', message: msg, icon: 'report_problem', position: 'bottom' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initBackground3D()
  initAnalysis3D()
})

onBeforeUnmount(() => {
  if (bgAnimationFrameId) cancelAnimationFrame(bgAnimationFrameId)
  if (analysisAnimationFrameId) cancelAnimationFrame(analysisAnimationFrameId)
  window.removeEventListener('resize', handleResize)
  if (bgRenderer) bgRenderer.dispose()
  if (analRenderer) analRenderer.dispose()
})

// --- 1. LATAR BELAKANG ELEMEN KONSTRUKSI & BINTANG MALAM ---
const initBackground3D = () => {
  const canvas = bgCanvas.value
  if (!canvas) return

  bgScene = new THREE.Scene()
  bgScene.fog = new THREE.FogExp2(0x13173d, 0.015) // Fog tebal untuk atmosfir malam yang indah

  bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  bgCamera.position.z = 20

  bgRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true })
  bgRenderer.setSize(window.innerWidth, window.innerHeight)
  bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // Pencahayaan Malam Bersinar
  const ambient = new THREE.AmbientLight(0xffffff, 0.6)
  bgScene.add(ambient)

  const light1 = new THREE.PointLight(0x06b6d4, 3.5, 80) // Teal
  light1.position.set(-15, 12, 6)
  bgScene.add(light1)

  const light2 = new THREE.PointLight(0xf97316, 2.5, 80) // Orange Hangat
  light2.position.set(15, -12, 6)
  bgScene.add(light2)

  // Palet Warna Ceria & Terang
  const colors = [0x06b6d4, 0xf97316, 0xfbbf24, 0xec4899, 0x3b82f6]

  // Model Elemen Konstruksi Melayang Sangat Jauh
  const createHardHat = (material) => {
    const group = new THREE.Group()
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      material,
    )
    dome.rotation.x = -Math.PI / 2
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.05, 16), material)
    brim.position.y = -0.05
    group.add(dome, brim)
    return group
  }

  // Menyebarkan elemen di seluruh sudut layar secara merata (Menyeluruh)
  const elementCount = 35
  for (let i = 0; i < elementCount; i++) {
    const chosenColor = colors[i % colors.length]
    const mat = new THREE.MeshPhysicalMaterial({
      color: chosenColor,
      metalness: 0.1,
      roughness: 0.2,
      transmission: 0.7,
      opacity: 0.85,
      transparent: true,
      clearcoat: 1.0,
      emissive: chosenColor,
      emissiveIntensity: 0.15,
    })

    let mesh
    if (i % 3 === 0) {
      mesh = createHardHat(mat)
    } else if (i % 3 === 1) {
      // Palu Mini
      mesh = new THREE.Group()
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 12), mat)
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.25, 0.25), mat)
      head.position.y = 0.5
      mesh.add(handle, head)
    } else {
      // Roda Gigi Ringkas
      mesh = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.18, 8, 16), mat)
    }

    // Penyebaran menyeluruh di pinggir layar untuk mengelilingi kartu login
    const side = Math.random() > 0.5 ? 1 : -1
    const vert = Math.random() > 0.5 ? 1 : -1

    // Sumbu X & Y melebar menyeluruh
    const x = side * (Math.random() * 12 + 6.5)
    const y = vert * (Math.random() * 9 + 2)
    let z = (Math.random() - 0.5) * 12 - 3

    // Menghindari penumpukan di bagian tengah kartu
    if (Math.abs(x) < 10 && Math.abs(y) < 8) {
      z = -Math.random() * 6 - 6
    }

    mesh.position.set(x, y, z)
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)

    const scale = Math.random() * 0.25 + 0.7
    mesh.scale.set(scale, scale, scale)

    mesh.userData = {
      rotSpeedX: (Math.random() - 0.5) * 0.005,
      rotSpeedY: (Math.random() - 0.5) * 0.005,
      floatOffset: Math.random() * Math.PI * 2,
      initialY: mesh.position.y,
    }

    bgScene.add(mesh)
    bgObjects.push(mesh)
  }

  // Menambahkan Taburan Bintang Kecil Berkedip di Langit
  const starGeo = new THREE.BufferGeometry()
  const starCount = 120
  const starPositions = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount * 3; i += 3) {
    starPositions[i] = (Math.random() - 0.5) * 50
    starPositions[i + 1] = (Math.random() - 0.5) * 40
    starPositions[i + 2] = (Math.random() - 0.5) * 15 - 5
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.15,
    transparent: true,
    opacity: 0.9,
  })
  const starSystem = new THREE.Points(starGeo, starMat)
  bgScene.add(starSystem)

  animateBackground()
}

// --- 2. KARTU SEBELAH KIRI: VISUAL ANALISIS KONSTRUKSI (image_432149.png) ---
const initAnalysis3D = () => {
  const canvas = analysisCanvas.value
  if (!canvas) return

  analScene = new THREE.Scene()

  analCamera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
  analCamera.position.set(0, 1.2, 10.5) // Diarahkan sedikit menunduk agar tablet terlihat perspektif 3D

  analRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true })
  analRenderer.setSize(canvas.clientWidth, canvas.clientHeight)
  analRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // Pencahayaan Studio Khusus Visual Kiri
  const ambient = new THREE.AmbientLight(0xffffff, 0.8)
  analScene.add(ambient)

  const directional = new THREE.DirectionalLight(0xffffff, 0.9)
  directional.position.set(5, 8, 4)
  analScene.add(directional)

  // Cahaya biru pendaran tablet
  const blueGlow = new THREE.PointLight(0x06b6d4, 3, 10)
  blueGlow.position.set(0, 0.5, 1)
  analScene.add(blueGlow)

  // Material Premium Mengkilap Ceria
  const matBlue = new THREE.MeshPhysicalMaterial({
    color: 0x3b82f6,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
  })
  const matTeal = new THREE.MeshPhysicalMaterial({
    color: 0x06b6d4,
    roughness: 0.15,
    clearcoat: 1.0,
  })
  const matYellow = new THREE.MeshPhysicalMaterial({
    color: 0xfbbf24,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
    emissive: 0xfbbf24,
    emissiveIntensity: 0.2,
  })
  const matOrange = new THREE.MeshPhysicalMaterial({
    color: 0xf97316,
    roughness: 0.1,
    clearcoat: 1.0,
  })
  const matSlate = new THREE.MeshPhysicalMaterial({ color: 0x475569, roughness: 0.2 })
  const matPink = new THREE.MeshPhysicalMaterial({ color: 0xec4899, roughness: 0.1 })

  // --- MODEL 1: Tablet Cetak Biru (Blueprint Tablet) ---
  blueprintTablet = new THREE.Group()

  // Frame Tablet (Slate Abu-Abu)
  const frameGeo = new THREE.BoxGeometry(4.8, 0.25, 3.6)
  const frameMesh = new THREE.Mesh(frameGeo, matSlate)
  blueprintTablet.add(frameMesh)

  // Layar Tablet (Teal Bersinar Lembut)
  const screenGeo = new THREE.BoxGeometry(4.5, 0.1, 3.3)
  const screenMesh = new THREE.Mesh(screenGeo, matTeal)
  screenMesh.position.y = 0.1
  blueprintTablet.add(screenMesh)

  // Tombol Kamera Tablet Kecil
  const camButton = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 12), matSlate)
  camButton.position.set(0, 0.1, -1.72)
  blueprintTablet.add(camButton)

  // Posisikan Tablet Miring Nyaman di Dasar Panggung
  blueprintTablet.rotation.set(0.4, -0.4, -0.15)
  blueprintTablet.position.set(-0.2, -1.2, 0)
  analScene.add(blueprintTablet)

  // --- MODEL 2: Lampu Bohlam Ide Melayang (Kuning) ---
  bulbIdea = new THREE.Group()
  // Kepala Kaca Bohlam (Kuning Bulat)
  const bulbHead = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), matYellow)
  // Dudukan Logam Bohlam
  const bulbBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.2, 0.35, 12), matSlate)
  bulbBase.position.y = -0.6
  bulbIdea.add(bulbHead, bulbBase)

  bulbIdea.position.set(-1.8, 0.7, 0.8)
  analScene.add(bulbIdea)

  // --- MODEL 3: Grafik Gelombang Analisis (Wave Chart) ---
  waveChart = new THREE.Group()
  const wavePoints = 24
  const lineRadius = 0.065
  const waveLength = 4.0
  // eslint-disable-next-line no-unused-vars
  const segmentWidth = waveLength / wavePoints

  for (let i = 0; i < wavePoints; i++) {
    // Kurva Sinusoidal Berwarna Orange Cerah
    const x1 = (i / wavePoints) * waveLength - waveLength / 2
    const y1 = Math.sin(i * 0.45) * 0.7
    const x2 = ((i + 1) / wavePoints) * waveLength - waveLength / 2
    const y2 = Math.sin((i + 1) * 0.45) * 0.7

    const distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
    const segmentGeo = new THREE.CylinderGeometry(lineRadius, lineRadius, distance, 8)
    const segment = new THREE.Mesh(segmentGeo, matOrange)

    // Posisikan dan orientasikan silinder sebagai garis segmen grafik
    segment.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0)
    segment.rotation.z = Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2
    waveChart.add(segment)
  }
  waveChart.position.set(0, -0.3, 0.5)
  waveChart.rotation.set(0.2, -0.4, 0)
  analScene.add(waveChart)

  // --- MODEL 4: Bagan Pai Melayang (Pie Charts) ---
  const createPieSlice = (radius, thickness, startAngle, endAngle, material) => {
    // Model Sederhana Donut/Cylinder Pie untuk visual 3D mainan lucu
    const geom = new THREE.CylinderGeometry(radius, radius, thickness, 24)
    return new THREE.Mesh(geom, material)
  }

  const pie1 = createPieSlice(0.55, 0.25, 0, Math.PI, matBlue)
  pie1.position.set(1.6, 1.4, -0.5)
  pie1.rotation.set(0.4, 0.2, 0.3)
  analScene.add(pie1)
  pieCharts.push(pie1)

  const pie2 = createPieSlice(0.35, 0.18, 0, Math.PI, matPink)
  pie2.position.set(1.9, 0.5, 0.8)
  pie2.rotation.set(-0.3, -0.4, 0.2)
  analScene.add(pie2)
  pieCharts.push(pie2)

  // --- MODEL 5: Tangan Penulis 3D Stylized (Lengan Silinder & Pena Panjang) ---
  handWithPen = new THREE.Group()
  // Lengan Baju Biru
  const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.2, 16), matBlue)
  sleeve.rotation.x = Math.PI / 2.5
  sleeve.position.set(0.2, 0, -0.5)

  // Tangan Bulat Lembut (Kuning/Kulit Kartun)
  const handNode = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), matYellow)
  handNode.position.set(0.2, 0.4, 0.1)

  // Pena Gambar Panjang (Slate Abu-Abu dengan Ujung Orange)
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8), matSlate)
  pen.rotation.set(0.8, 0, -0.5)
  pen.position.set(0.35, 0.6, 0.3)

  handWithPen.add(sleeve, handNode, pen)
  handWithPen.position.set(1.2, -0.4, 1.4)
  analScene.add(handWithPen)

  // --- MODEL 6: Simbol Tambah Dekoratif (+) ---
  const createPlusSymbol = (material) => {
    const group = new THREE.Group()
    const horiz = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.1), material)
    const vert = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.1), material)
    group.add(horiz, vert)
    return group
  }

  const plus1 = createPlusSymbol(matBlue)
  plus1.position.set(1.8, 2.2, 0)
  analScene.add(plus1)
  plusSymbols.push(plus1)

  const plus2 = createPlusSymbol(matOrange)
  plus2.position.set(-1.4, -0.3, 1.8)
  analScene.add(plus2)
  plusSymbols.push(plus2)

  animateAnalysis()
}

// --- 3. ANIMATION LOOPS ---
let bgTime = 0
const animateBackground = () => {
  bgAnimationFrameId = requestAnimationFrame(animateBackground)
  bgTime += 0.005

  bgObjects.forEach((obj) => {
    obj.rotation.x += obj.userData.rotSpeedX
    obj.rotation.y += obj.userData.rotSpeedY
    // Ayunan naik turun melayang lembut
    obj.position.y = obj.userData.initialY + Math.sin(bgTime * 1.4 + obj.userData.floatOffset) * 0.8
  })

  if (bgRenderer && bgScene && bgCamera) {
    bgRenderer.render(bgScene, bgCamera)
  }
}

let analTime = 0
const animateAnalysis = () => {
  analysisAnimationFrameId = requestAnimationFrame(animateAnalysis)
  analTime += 0.012

  // Animasi Melayang Manis Tablet Blueprint
  if (blueprintTablet) {
    blueprintTablet.position.y = -1.25 + Math.sin(analTime * 1.2) * 0.1
    blueprintTablet.rotation.y = -0.4 + Math.sin(analTime * 0.4) * 0.05
  }

  // Animasi Berputar & Mengayun Lembut Bohlam Ide
  if (bulbIdea) {
    bulbIdea.position.y = 0.7 + Math.cos(analTime * 1.5) * 0.15
    bulbIdea.rotation.y += 0.008
  }

  // Animasi Grafik Gelombang Berkelok (Giggle Wave Effect)
  if (waveChart) {
    waveChart.rotation.z = Math.sin(analTime * 0.8) * 0.06
    waveChart.position.y = -0.3 + Math.sin(analTime * 1.5) * 0.08
  }

  // Animasi Menggambar Tangan Stylized
  if (handWithPen) {
    handWithPen.position.x = 1.25 + Math.sin(analTime * 1.3) * 0.18
    handWithPen.position.y = -0.4 + Math.cos(analTime * 1.1) * 0.12
  }

  // Animasi Berputar Bagan Pai
  pieCharts.forEach((pie, idx) => {
    pie.rotation.y += 0.008 * (idx + 1)
    pie.position.y += Math.sin(analTime * 1.5 + idx) * 0.003
  })

  // Animasi Berdenyut Simbol Tambah (+)
  plusSymbols.forEach((plus, idx) => {
    plus.rotation.z += 0.012 * (idx + 1)
    plus.scale.setScalar(0.9 + Math.sin(analTime * 2 + idx) * 0.15)
  })

  if (analRenderer && analScene && analCamera) {
    analRenderer.render(analScene, analCamera)
  }
}

const handleResize = () => {
  // Update Background Renderer
  if (bgCamera && bgRenderer) {
    bgCamera.aspect = window.innerWidth / window.innerHeight
    bgCamera.updateProjectionMatrix()
    bgRenderer.setSize(window.innerWidth, window.innerHeight)
  }

  // Update Rocket/Analysis Panel Kiri Renderer
  const rCanvas = analysisCanvas.value
  if (rCanvas && analCamera && analRenderer) {
    analCamera.aspect = rCanvas.clientWidth / rCanvas.clientHeight
    analCamera.updateProjectionMatrix()
    analRenderer.setSize(rCanvas.clientWidth, rCanvas.clientHeight)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.login-page {
  font-family:
    'Inter',
    -apple-system,
    sans-serif;
  /* Latar belakang malam biru ungu eksotis terinspirasi dari image_4321ff.png */
  background: linear-gradient(180deg, #18193f 0%, #111330 45%, #080a1a 100%);
  position: relative;
  overflow: hidden;
  min-height: 100vh;
}

#bg-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Landscape SVG di bagian bawah halaman */
.landscape-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 280px;
  z-index: 2;
  pointer-events: none;
}

.landscape-svg {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Siluet Crane Konstruksi di Bukit Latar Belakang */
.crane-silhouette {
  position: absolute;
  bottom: 40px;
  width: 130px;
  height: 150px;
  opacity: 0.85;
}

.left-crane {
  left: 10%;
}

.right-crane {
  right: 12%;
  transform: scaleX(-1); /* Hadap berlawanan */
}

.login-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

/* MAIN GLASS CARD (Glassmorphism Premium) */
.main-glass-card {
  width: 1000px;
  max-width: 95vw;
  background: rgba(255, 255, 255, 0.12); /* Transparansi murni */
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow:
    0 30px 70px -15px rgba(5, 5, 20, 0.5),
    0 0 40px rgba(99, 102, 241, 0.2),
    inset 0 0 25px rgba(255, 255, 255, 0.15);
  border-radius: 2.25rem;
  overflow: hidden;
  z-index: 20;
}

.card-row {
  display: flex;
  flex-direction: row;
  width: 100%;
  min-height: 620px;
}

/* SISI KIRI: Panel 3D Analisis Proyek */
.card-left {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.75rem;
  position: relative;
}

.inner-rocket-panel {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 1.75rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  position: relative;
}

.analysis-canvas {
  width: 100%;
  flex-grow: 1;
  max-height: 420px;
}

.rocket-caption {
  padding: 1.5rem;
  text-align: center;
  z-index: 10;
}

.caption-title {
  font-size: 1.75rem;
  font-weight: 900;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.03em;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.caption-sub {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.4;
}

/* SISI KANAN: Formulir Login Quasar */
.card-right {
  width: 50%;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Logo Styles */
.logo-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.25rem;
}
.logo-circle {
  width: 4.5rem;
  height: 4.5rem;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 12px 24px rgba(26, 35, 126, 0.25);
}

/* Text Headers (Putih Kontras Ceria) */
.header-text {
  text-align: center;
  margin-bottom: 2rem;
}
.title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}
.subtitle {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
}

/* Form Styles */
.form-container {
  margin-top: 1rem;
}
.input-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
  margin-left: 0.25rem;
}
.password-label-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  margin-left: 0.25rem;
}
.forgot-password {
  font-size: 0.75rem;
  font-weight: 700;
  color: #60a5fa;
  text-decoration: none;
  transition: opacity 0.2s;
}
.forgot-password:hover {
  text-decoration: underline;
  opacity: 0.9;
}

/* Input Kaca Khusus agar Teks Tetap Terbaca Sangat Jelas */
.custom-input :deep(.q-field__control) {
  background-color: rgba(255, 255, 255, 0.92);
  border-radius: 0.85rem;
  transition: all 0.3s ease;
}
.custom-input :deep(.q-field__control:before),
.custom-input :deep(.q-field__control:after) {
  border-color: transparent !important;
}
.custom-input :deep(.q-field--focused .q-field__control) {
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.35);
  border: 1px solid #6366f1;
}

.remember-wrapper {
  margin-top: 0.25rem;
}

.custom-checkbox :deep(.q-checkbox__label) {
  color: rgba(255, 255, 255, 0.85) !important;
}

/* Tombol Masuk Gradasi Neon Elegan */
.submit-wrapper {
  padding-top: 0.5rem;
}
.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
  color: white;
  border-radius: 9999px;
  padding: 0.85rem 0;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(99, 102, 241, 0.55);
  filter: brightness(1.1);
}

.footer-text {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
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

/* Media Query untuk Responsivitas Mobile (Cukup Formulir Login & Background 3D) */
@media (max-width: 900px) {
  .main-glass-card {
    max-width: 440px;
    width: 100%;
    border-radius: 1.75rem;
  }
  .card-row {
    flex-direction: column;
    min-height: auto;
  }
  .card-left {
    display: none; /* Sembunyikan panel roket/analisis kiri sepenuhnya di HP */
  }
  .card-right {
    width: 100%;
    padding: 2.25rem 1.5rem;
  }
  .landscape-overlay {
    height: 180px;
  }
  .crane-silhouette {
    width: 80px;
    height: 90px;
    bottom: 20px;
  }
}
</style>
