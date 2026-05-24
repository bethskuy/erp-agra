<template>
  <q-page class="bg-slate-50 q-pa-md q-pa-lg-xl font-inter">
    <div class="bento-container mx-auto">
      <!-- ========================================== -->
      <!-- BAGIAN ATAS: PROFIL & WAKTU                -->
      <!-- ========================================== -->
      <div class="row q-col-gutter-lg q-mb-lg" v-if="!showCamera">
        <!-- WIDGET 1: PROFIL KARYAWAN -->
        <div class="col-12 col-md-7 col-lg-8 hide-on-mobile">
          <q-card flat class="bento-card bg-white full-height relative-position overflow-hidden">
            <div class="decor-circle-1"></div>
            <q-card-section
              class="q-pa-lg q-pa-md-xl z-content full-height flex column justify-center"
            >
              <div class="row items-center">
                <div class="col-auto q-mr-lg q-mb-sm relative-position">
                  <q-avatar
                    size="84px"
                    :color="getRandomColor(userData.nama)"
                    text-color="white"
                    class="shadow-soft text-weight-bolder text-h4 overflow-hidden"
                  >
                    <q-img
                      v-if="userData.fotoUrl || userData.foto_profil"
                      :src="userData.fotoUrl || userData.foto_profil"
                      class="absolute-full"
                    />
                    <span v-else>{{ getInitial(userData.nama) }}</span>
                  </q-avatar>
                  <q-badge floating color="teal-5" rounded class="status-badge shadow-1" />
                </div>

                <div class="col">
                  <div
                    class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1 q-mb-xs"
                  >
                    Selamat Datang Kembali,
                  </div>
                  <div
                    class="text-h5 text-md-h4 text-weight-bolder text-blue-grey-10 text-capitalize line-height-tight"
                    style="word-wrap: break-word; word-break: break-word"
                  >
                    {{ userData.nama || 'Memuat Data...' }}
                  </div>
                  <div class="row items-center q-mt-sm q-gutter-sm">
                    <q-badge
                      color="indigo-1"
                      text-color="indigo-9"
                      class="text-weight-bold q-px-sm q-py-xs rounded-6"
                    >
                      {{ userData.jabatan || userData.role || 'KARYAWAN' }}
                    </q-badge>
                    <q-badge
                      color="grey-2"
                      text-color="grey-7"
                      class="text-weight-bold q-px-sm q-py-xs rounded-6 ellipsis"
                      style="max-width: 100%"
                    >
                      <q-icon name="mail" size="10px" class="q-mr-xs" />
                      {{ userData.email || 'Memuat email...' }}
                    </q-badge>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- WIDGET 2: JAM "AURORA HOLOGRAPHIC" PREMIUM -->
        <div class="col-12 col-md-5 col-lg-4">
          <q-card
            flat
            class="bento-card aurora-card text-white full-height flex flex-center relative-position overflow-hidden"
          >
            <div class="aurora-bg"></div>
            <div class="glass-layer"></div>

            <q-card-section class="text-center z-content q-pa-lg full-width">
              <div class="row items-center justify-center q-mb-md opacity-80">
                <q-icon name="schedule" size="xs" color="white" class="q-mr-sm" />
                <div class="text-caption text-white text-weight-bold uppercase letter-spacing-2">
                  Waktu Server AGRA
                </div>
              </div>

              <div class="time-wrapper drop-shadow-glow text-white">
                <span class="time-hhmm"
                  >{{ currentHours }}<span class="blink text-blue-2">:</span
                  >{{ currentMinutes }}</span
                >
                <span class="time-ss text-blue-3">{{ currentSeconds }}</span>
              </div>

              <div class="date-chip q-mt-md shadow-2">{{ currentDate }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- BAGIAN TENGAH: RADAR LOKASI & ACTION       -->
      <!-- ========================================== -->
      <div class="row q-col-gutter-lg q-mb-lg flex" v-if="!showCamera">
        <!-- WIDGET 3: RADAR GPS -->
        <div class="col-12 col-md-6 mobile-order-2 desktop-order-1">
          <q-card flat class="bento-card bg-white full-height">
            <q-card-section class="q-pa-lg">
              <div class="row items-center justify-between q-mb-lg">
                <div class="row items-center">
                  <q-icon name="satellite_alt" color="blue-grey-4" size="sm" class="q-mr-sm" />
                  <div class="text-subtitle1 text-weight-bold text-blue-grey-9">
                    Sistem Radar Lokasi
                  </div>
                </div>
                <!-- Tampilan Jam Kerja Shift membaca secara dinamis dari Firestore Karyawan -->
                <q-badge
                  outline
                  color="indigo-5"
                  class="q-px-sm q-py-xs rounded-6 font-mono text-weight-bold bg-indigo-50"
                >
                  <q-icon name="work_outline" size="12px" class="q-mr-xs" /> SHIFT:
                  {{ userData.jam_masuk }} - {{ userData.jam_pulang }}
                </q-badge>
              </div>

              <div
                class="radar-box q-pa-md rounded-16 relative-position overflow-hidden"
                :class="
                  locationData.inRange && !locationData.securityRisk
                    ? 'radar-valid'
                    : 'radar-invalid'
                "
              >
                <div class="row items-start no-wrap">
                  <div class="radar-icon-container q-mr-md q-mt-xs">
                    <div
                      class="icon-pulse-ring"
                      :class="
                        locationData.inRange && !locationData.securityRisk
                          ? 'pulse-green'
                          : 'pulse-red'
                      "
                    ></div>
                    <q-avatar
                      :color="
                        locationData.inRange && !locationData.securityRisk ? 'teal-1' : 'red-1'
                      "
                      :text-color="
                        locationData.inRange && !locationData.securityRisk ? 'teal-6' : 'red-5'
                      "
                      size="48px"
                    >
                      <q-icon
                        :name="
                          locationData.securityRisk
                            ? 'gavel'
                            : locationData.inRange
                              ? 'verified_user'
                              : 'location_off'
                        "
                        size="28px"
                      />
                    </q-avatar>
                  </div>

                  <div class="col">
                    <div
                      class="text-subtitle2 text-weight-bolder q-mb-xs"
                      :class="
                        locationData.inRange && !locationData.securityRisk
                          ? 'text-teal-7'
                          : 'text-red-6'
                      "
                    >
                      {{ locationData.statusText }}
                    </div>
                    <div
                      class="text-caption text-blue-grey-9 text-weight-medium line-height-normal q-mb-sm"
                    >
                      {{ locationData.address || 'Menyelaraskan koordinat satelit...' }}
                    </div>
                    <div
                      class="font-mono text-xs text-blue-grey-5 bg-grey-2 inline-block q-px-sm q-py-xs rounded-6"
                    >
                      {{ locationData.lat }}, {{ locationData.lng }}
                    </div>
                  </div>
                </div>

                <q-separator class="q-my-md opacity-50" />

                <div class="row items-center justify-between q-mb-sm">
                  <div
                    class="text-caption text-weight-bold text-blue-grey-6 uppercase letter-spacing-1"
                  >
                    ZONA TERDETEKSI:
                  </div>
                  <q-badge
                    :color="locationData.inRange ? 'teal-5' : 'red-5'"
                    class="text-weight-bold shadow-1"
                  >
                    {{
                      locationData.inRange
                        ? locationData.matchedLocationName
                        : 'TIDAK ADA ZONA VALID'
                    }}
                  </q-badge>
                </div>

                <div class="row items-center justify-between">
                  <div
                    class="text-caption text-weight-bold text-blue-grey-6 uppercase letter-spacing-1"
                  >
                    KEAMANAN SINYAL:
                  </div>
                  <q-badge
                    :color="locationData.securityRisk ? 'red-6' : 'green-6'"
                    class="text-weight-bold shadow-1"
                  >
                    <q-icon
                      :name="locationData.securityRisk ? 'warning' : 'shield'"
                      size="xs"
                      class="q-mr-xs"
                    />
                    {{ locationData.securityRisk ? 'FAKE GPS TERDETEKSI' : 'AMAN (ENCRYPTED)' }}
                  </q-badge>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- WIDGET 4: TOMBOL AKSI -->
        <div class="col-12 col-md-6 mobile-order-1 desktop-order-2">
          <q-card flat class="bento-card bg-white full-height flex column justify-center">
            <q-card-section class="q-pa-lg">
              <div class="row items-center q-mb-lg">
                <q-icon name="touch_app" color="blue-grey-4" size="sm" class="q-mr-sm" />
                <div class="text-subtitle1 text-weight-bold text-blue-grey-9">Aksi Presensi</div>
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <button
                    v-if="locationData.inRange && !locationData.securityRisk"
                    class="btn-premium btn-clock-in full-width"
                    @click="startAbsensi('in')"
                    :disabled="!isAiReady"
                  >
                    <q-icon name="camera_alt" size="24px" class="q-mb-xs" />
                    <span>CLOCK IN</span>
                  </button>
                  <button v-else class="btn-premium btn-locked full-width" :disabled="true">
                    <q-icon name="lock" size="24px" class="q-mb-xs text-blue-grey-4" />
                    <span class="text-blue-grey-5">TERKUNCI</span>
                  </button>
                </div>

                <div class="col-12 col-sm-6">
                  <button
                    v-if="locationData.inRange && !locationData.securityRisk && documentId"
                    class="btn-premium btn-clock-out full-width"
                    @click="startAbsensi('out')"
                    :disabled="!isAiReady"
                  >
                    <q-icon name="logout" size="24px" class="q-mb-xs" />
                    <span>CLOCK OUT</span>
                  </button>
                  <button v-else class="btn-premium btn-locked full-width" :disabled="true">
                    <q-icon name="lock" size="24px" class="q-mb-xs text-blue-grey-4" />
                    <span class="text-blue-grey-5">OUT TERKUNCI</span>
                  </button>
                </div>
              </div>

              <!-- SENSOR ENGINE & AI STATUS BOARD -->
              <div
                class="row items-center q-mt-md q-pa-sm rounded-8 border-grey"
                :class="isAiReady ? 'bg-teal-50 border-teal-200' : 'bg-orange-50 border-orange-200'"
              >
                <q-icon
                  :name="isAiReady ? 'face' : 'psychology'"
                  :color="isAiReady ? 'teal-6' : 'orange-7'"
                  size="16px"
                  class="q-mr-sm"
                />
                <div
                  class="text-caption text-weight-bold"
                  :class="isAiReady ? 'text-teal-8' : 'text-orange-9'"
                  style="font-size: 11px"
                >
                  {{ aiStatusText }}
                </div>
              </div>

              <q-btn
                flat
                no-caps
                color="primary"
                icon="history_edu"
                label="Sistem Error? Ajukan Absensi Manual"
                class="full-width q-mt-sm text-weight-bold rounded-8 transition-smooth hover-bg"
                @click="router.push('/absensi/manual')"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- BAGIAN BAWAH: RIWAYAT                      -->
      <!-- ========================================== -->
      <div class="row q-col-gutter-lg" v-if="!showCamera">
        <div class="col-12">
          <q-card flat class="bento-card bg-white full-height">
            <q-card-section class="q-pa-lg border-bottom row items-center justify-between">
              <div class="text-subtitle1 text-weight-bold text-blue-grey-9">
                Aktivitas Saya Hari Ini
              </div>
              <q-badge color="indigo-1" text-color="indigo-7" class="text-weight-bold"
                >Log Pribadi</q-badge
              >
            </q-card-section>

            <q-card-section class="q-pa-none">
              <q-list>
                <div v-if="riwayatData.length === 0" class="text-center q-pa-xl">
                  <q-icon name="history_toggle_off" size="4em" color="grey-3" class="q-mb-md" />
                  <div class="text-blue-grey-5 text-weight-medium">
                    Belum ada rekam jejak absensi hari ini.
                  </div>
                </div>

                <q-item
                  v-for="item in riwayatData"
                  :key="item.id"
                  class="q-py-md q-px-lg hover-bg border-bottom-light"
                >
                  <q-item-section avatar>
                    <q-avatar
                      :color="item.status === 'Selesai' ? 'teal-1' : 'orange-1'"
                      size="42px"
                    >
                      <q-icon
                        name="fact_check"
                        :color="item.status === 'Selesai' ? 'teal-6' : 'orange-6'"
                        size="20px"
                      />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold text-blue-grey-9 text-subtitle2">{{
                      item.tanggal
                    }}</q-item-label>
                    <q-item-label caption class="text-blue-grey-5 q-mt-xs flex items-center">
                      <q-icon name="place" size="12px" class="q-mr-xs" />
                      <span class="text-weight-bold text-blue-grey-7">{{ item.nama_tempat }}</span>
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side class="text-right">
                    <div class="text-weight-bold font-mono text-body2">
                      <span :class="item.is_late ? 'text-red-6' : 'text-blue-grey-10'">{{
                        formatWaktu(item.waktu_masuk)
                      }}</span>
                      <span class="text-grey-4 q-mx-xs">━</span>
                      <span class="text-blue-grey-10">{{ formatWaktu(item.waktu_pulang) }}</span>
                    </div>

                    <div class="row q-gutter-x-xs q-mt-sm justify-end">
                      <q-badge
                        v-if="item.is_late"
                        color="red-5"
                        class="rounded-6 shadow-1 text-weight-bold"
                        >TERLAMBAT</q-badge
                      >
                      <q-badge
                        :color="item.status === 'Selesai' ? 'teal-5' : 'orange-5'"
                        class="rounded-6 shadow-1 text-weight-bold"
                        >{{ item.status.toUpperCase() }}</q-badge
                      >
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- MODAL SCREEN ABSEN DIGITAL VERIFICATION    -->
      <!-- ========================================== -->
      <q-slide-transition>
        <div v-if="showCamera" class="row justify-center camera-outer-wrapper">
          <div class="col-12 col-xl-10">
            <q-card flat class="bento-card bg-white overflow-hidden shadow-soft camera-modal-card">
              <div
                class="bg-blue-grey-9 text-white row items-center q-pa-sm q-px-md z-top relative-position camera-header"
              >
                <q-btn
                  icon="arrow_back"
                  flat
                  round
                  dense
                  @click="stopCamera"
                  class="bg-blue-grey-8 transition-smooth hover-scale"
                  size="sm"
                />
                <div
                  class="text-subtitle2 text-weight-bold q-ml-md letter-spacing-1 uppercase text-ellipsis"
                >
                  BIOMETRIK:
                  {{ attendanceMode === 'in' ? 'CLOCK IN (MASUK)' : 'CLOCK OUT (PULANG)' }}
                </div>
              </div>

              <div class="row no-wrap-md camera-row-container">
                <div
                  class="col-12 col-md-7 bg-black relative-position flex flex-center camera-video-container"
                >
                  <video ref="video" autoplay playsinline class="video-stream"></video>
                  <canvas ref="canvas" class="hidden"></canvas>

                  <div class="scanner-overlay" v-if="!capturedImage">
                    <div class="scanner-frame">
                      <div class="corner t-l"></div>
                      <div class="corner t-r"></div>
                      <div class="corner b-l"></div>
                      <div class="corner b-r"></div>
                      <div class="scan-laser"></div>
                    </div>
                    <div class="absolute-bottom text-center q-pb-sm">
                      <q-chip
                        color="primary"
                        text-color="white"
                        class="text-weight-bold shadow-3 bg-opacity-80 text-10"
                      >
                        <q-icon name="face" size="14px" class="q-mr-xs" /> Deteksi Sensor Wajah
                        Aktif
                      </q-chip>
                    </div>
                  </div>

                  <q-img
                    v-if="capturedImage"
                    :src="capturedImage"
                    class="captured-preview absolute-full"
                  />
                </div>

                <div
                  class="col-12 col-md-5 q-pa-sm q-pa-md-md bg-grey-1 flex column justify-between camera-control-panel"
                >
                  <div
                    class="bg-white q-pa-sm q-pa-md-md rounded-12 border-grey shadow-sm info-summary-card"
                  >
                    <div
                      class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1 q-mb-xs font-10"
                    >
                      Informasi Log Presensi
                    </div>

                    <div class="row items-center q-mb-xs">
                      <q-avatar
                        size="28px"
                        color="blue-1"
                        text-color="primary"
                        icon="person"
                        class="q-mr-sm"
                      />
                      <div
                        class="text-weight-bold text-blue-grey-10 text-subtitle2 ellipsis max-w-160"
                      >
                        {{ userData.nama }}
                      </div>
                    </div>

                    <div
                      v-if="isVerifyingFace"
                      class="q-pa-sm rounded-8 text-center text-weight-bold q-mb-md bg-orange-50 text-orange-8 border-orange text-11"
                    >
                      <q-spinner-dots size="1.2em" class="q-mr-xs" /> MENGANALISIS STRUKTUR
                      BIOMETRIK...
                    </div>
                    <div
                      v-else
                      class="q-pa-sm rounded-8 text-center text-weight-bold q-mb-md text-11"
                      :class="
                        isFaceMatched
                          ? 'bg-teal-50 text-teal-8 border-teal'
                          : 'bg-red-50 text-red-8 border-red'
                      "
                    >
                      <q-icon :name="isFaceMatched ? 'verified' : 'lock'" class="q-mr-xs" />
                      {{
                        isFaceMatched ? 'WAJAH COCOK DENGAN DATA HRD' : 'SILAKAN AMBIL FOTO WAJAH'
                      }}
                    </div>

                    <div class="row items-center no-wrap text-11 text-blue-grey-7 q-mb-xs">
                      <q-icon name="place" size="14px" color="teal" class="q-mr-xs" />
                      <div class="ellipsis text-weight-bold">
                        {{ locationData.matchedLocationName }}
                      </div>
                    </div>

                    <div class="text-10 text-blue-grey-5 ellipsis line-height-tight q-pl-sm">
                      {{ locationData.address }}
                    </div>
                  </div>

                  <div class="q-mt-sm">
                    <div v-if="!capturedImage">
                      <q-btn
                        unelevated
                        color="primary"
                        icon="photo_camera"
                        label="PINDAI WAJAH ANDA"
                        class="full-width rounded-12 q-py-sm text-weight-bolder shadow-soft-primary text-subtitle2"
                        @click="takePhoto"
                        :disabled="!isAiReady || isVerifyingFace"
                      />
                    </div>

                    <div v-else class="column q-gutter-y-sm">
                      <q-btn
                        v-if="isFaceMatched"
                        unelevated
                        color="teal-6"
                        :label="attendanceMode === 'in' ? 'KONFIRMASI MASUK' : 'KONFIRMASI PULANG'"
                        class="full-width rounded-12 q-py-sm text-weight-bolder shadow-glow-positive text-subtitle2"
                        icon="send"
                        @click="executeAbsensiAction"
                      />
                      <q-btn
                        v-else
                        disabled
                        color="grey-5"
                        label="AKSES DIKUNCI: WAJAH SALAH"
                        class="full-width rounded-12 q-py-sm text-weight-bolder text-subtitle2"
                        icon="block"
                      />

                      <q-btn
                        outline
                        color="blue-grey-6"
                        label="ULANGI PINDAI"
                        class="full-width rounded-12 q-py-xs text-weight-bold bg-white text-11"
                        @click="ulangiPindai"
                        :disabled="isVerifyingFace"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </q-card>
          </div>
        </div>
      </q-slide-transition>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db, storage } from 'src/boot/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  Timestamp,
} from 'firebase/firestore'
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage'
import { useQuasar, date } from 'quasar'
import { useRouter } from 'vue-router'

// INTEGRASI EMAS: Import modul Capacitor Geolocation resmi untuk APK Mobile
import { Geolocation } from '@capacitor/geolocation'

const $q = useQuasar()
const router = useRouter()

// Deklarasi Listener
let timer, unsubMe, unsubAll, unsubUser, unsubLokasi, locationTimer

// State Engine Waktu
const currentHours = ref('')
const currentMinutes = ref('')
const currentSeconds = ref('')
const currentDate = ref('')

const riwayatData = ref([])
const dataSeluruhKaryawan = ref([])

// Profil Karyawan Terintegrasi
const userData = ref({
  nama: 'Memuat...',
  jabatan: 'Staff',
  role: 'Staff',
  email: '',
  fotoUrl: '',
  foto_profil: '',
  foto_registrasi: '',
  nik: '',
  jam_masuk: '08:00',
  jam_pulang: '17:00',
  lokasi_dinas: [],
})

// STATE AI FACE VERIFICATION
const isAiReady = ref(false)
const isFaceMatched = ref(false)
const isVerifyingFace = ref(false)
const aiStatusText = ref('Menginisialisasi modul kecerdasan buatan...')

const attendanceMode = ref('in')

const documentId = ref(null)
const showCamera = ref(false)
const capturedImage = ref(null)
const video = ref(null)
const canvas = ref(null)
const daftarLokasiKantor = ref([])

const locationData = ref({
  lat: '0.0000',
  lng: '0.0000',
  address: '',
  statusText: 'Menghubungkan ke satelit...',
  inRange: false,
  matchedLocationName: 'MENCARI LOKASI',
  securityRisk: false,
})

const lateLimit = computed(() => userData.value.jam_masuk || '08:00')

const ulangiPindai = () => {
  capturedImage.value = null
  isFaceMatched.value = false
}

const updateTime = () => {
  const nowObj = new Date()
  currentHours.value = date.formatDate(nowObj, 'HH')
  currentMinutes.value = date.formatDate(nowObj, 'mm')
  currentSeconds.value = date.formatDate(nowObj, 'ss')
  currentDate.value = date.formatDate(nowObj, 'dddd, DD MMMM YYYY', {
    days: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    months: [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ],
  })
}

const loadFaceApiScript = () => {
  return new Promise((resolve, reject) => {
    if (window.faceapi) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js'
    script.async = true
    script.onload = () => {
      resolve()
    }
    script.onerror = () => {
      reject(new Error('Gagal memuat library AI Face-API dari CDN.'))
    }
    document.head.appendChild(script)
  })
}

const initFaceEngine = async () => {
  try {
    aiStatusText.value = 'Menghubungkan ke server satelit AI...'
    await loadFaceApiScript()

    aiStatusText.value = 'AI sedang mengunduh bobot jaringan dari Cloud...'
    const modelUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'

    await window.faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl)
    await window.faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl)
    await window.faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl)

    isAiReady.value = true
    aiStatusText.value = 'Double-Guard GPS & Pemindai Wajah Biometrik Aktif (Aman)'
  } catch (e) {
    console.error('Gagal memuat AI Engine:', e)
    aiStatusText.value = 'Gagal memuat model AI: ' + e.message
  }
}

const lakukanFaceMatch = async (rawImgBase64) => {
  const masterFotoUrl = userData.value.foto_registrasi

  if (!masterFotoUrl) {
    $q.notify({
      color: 'negative',
      icon: 'error',
      message:
        'SISTEM DIKUNCI: Anda belum melakukan registrasi wajah biometrik resmi di database HRD!',
      position: 'top',
      timeout: 6000,
    })
    isFaceMatched.value = false
    return false
  }

  try {
    const liveImg = new Image()
    liveImg.src = rawImgBase64
    await new Promise((r) => (liveImg.onload = r))
    const liveDesc = await window.faceapi
      .detectSingleFace(liveImg)
      .withFaceLandmarks()
      .withFaceDescriptor()

    const refImg = new Image()
    refImg.crossOrigin = 'anonymous'
    refImg.src = masterFotoUrl
    await new Promise((res, rej) => {
      refImg.onload = res
      refImg.onerror = () => rej(new Error('Gagal mengunduh foto master HRD.'))
    })
    const refDesc = await window.faceapi
      .detectSingleFace(refImg)
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (!liveDesc) {
      $q.notify({
        color: 'negative',
        message: 'Wajah gagal terdeteksi kamera! Dekatkan wajah Anda ke kamera.',
      })
      isFaceMatched.value = false
      return false
    }

    if (!refDesc) {
      $q.notify({
        color: 'negative',
        message: 'Foto registrasi master tidak valid! Harap hubungi HRD untuk registrasi ulang.',
      })
      isFaceMatched.value = false
      return false
    }

    const distance = window.faceapi.euclideanDistance(liveDesc.descriptor, refDesc.descriptor)
    const matchScore = (1 - distance) * 100

    if (distance < 0.48) {
      isFaceMatched.value = true
      $q.notify({
        color: 'positive',
        icon: 'verified',
        message: `Verifikasi Wajah Berhasil! (Kecocokan: ${matchScore.toFixed(0)}%)`,
        position: 'top',
        timeout: 3000,
      })
      return true
    } else {
      isFaceMatched.value = false
      $q.notify({
        color: 'negative',
        icon: 'block',
        message: `Wajah Tidak Cocok! (Kecocokan: ${matchScore.toFixed(0)}% - Butuh Min. 52%)`,
        position: 'top',
        timeout: 4000,
      })
      return false
    }
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: 'Koneksi AI Terganggu: ' + err.message })
    isFaceMatched.value = false
    return false
  }
}

const applyWatermark = (base64Image, isClockIn = true) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = base64Image
    img.onload = () => {
      const wCanvas = document.createElement('canvas')
      wCanvas.width = img.width
      wCanvas.height = img.height
      const ctx = wCanvas.getContext('2d')

      ctx.drawImage(img, 0, 0)

      const padding = Math.max(12, img.width * 0.035)
      const watermarkHeight = img.height * 0.2
      const startY = img.height - watermarkHeight

      const grad = ctx.createLinearGradient(0, startY, 0, img.height)
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)')
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.75)')
      ctx.fillStyle = grad
      ctx.fillRect(0, startY, img.width, watermarkHeight)

      const mapSize = Math.max(55, img.height * 0.13)
      const mapX = padding
      const mapY = img.height - mapSize - padding

      ctx.save()
      ctx.shadowColor = 'rgba(0,0,0,0.4)'
      ctx.shadowBlur = 6
      ctx.fillStyle = '#e2e8f0'
      ctx.beginPath()
      ctx.arc(mapX + mapSize / 2, mapY + mapSize / 2, mapSize / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(mapX + mapSize / 2, mapY + mapSize / 2, mapSize / 3, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(mapX, mapY + mapSize / 2)
      ctx.lineTo(mapX + mapSize, mapY + mapSize / 2)
      ctx.moveTo(mapX + mapSize / 2, mapY)
      ctx.lineTo(mapX + mapSize / 2, mapY + mapSize)
      ctx.stroke()

      const pinX = mapX + mapSize / 2
      const pinY = mapY + mapSize / 2
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(pinX, pinY, 4, 0, Math.PI * 2)
      ctx.fill()

      const textX = mapX + mapSize + 15
      let textY = mapY - 4
      const fontSize = Math.max(10, Math.floor(img.width * 0.028))

      ctx.textBaseline = 'top'
      ctx.fillStyle = '#ffffff'

      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1

      ctx.font = `bold ${fontSize}px sans-serif`
      const formattedNow = date.formatDate(new Date(), 'DD MMM YYYY HH.mm.ss')
      ctx.fillText(formattedNow, textX, textY)

      textY += fontSize + 4
      ctx.font = `${fontSize - 1}px sans-serif`
      ctx.fillText(
        locationData.value.matchedLocationName || 'PT AGRA ABHINAYA PERKASA',
        textX,
        textY,
      )

      textY += fontSize + 3
      ctx.font = `${fontSize - 2}px sans-serif`
      const addrParts = locationData.value.address
        ? locationData.value.address.split(',')
        : ['Deltamas, Cikarang', 'Bekasi, Jawa Barat']
      ctx.fillText((addrParts[0] || '').trim(), textX, textY)

      textY += fontSize + 2
      const line4Str = `${(addrParts[1] || '').trim()}, ${(addrParts[2] || '').trim()}`
      ctx.fillText(line4Str, textX, textY)

      textY += fontSize + 2
      ctx.font = `italic ${fontSize - 2}px sans-serif`
      ctx.fillText(
        `GPS: ${locationData.value.lat}, ${locationData.value.lng} (${isClockIn ? 'CLOCK IN' : 'CLOCK OUT'})`,
        textX,
        textY,
      )

      resolve(wCanvas.toDataURL('image/jpeg', 0.9))
    }
  })
}

const takePhoto = async () => {
  const ctx = canvas.value.getContext('2d')
  canvas.value.width = video.value.videoWidth
  canvas.value.height = video.value.videoHeight
  ctx.drawImage(video.value, 0, 0)

  const rawImg = canvas.value.toDataURL('image/jpeg')
  capturedImage.value = rawImg

  isVerifyingFace.value = true
  const isMatched = await lakukanFaceMatch(rawImg)
  isVerifyingFace.value = false

  if (isMatched) {
    const watermarkedImg = await applyWatermark(rawImg, attendanceMode.value === 'in')
    capturedImage.value = watermarkedImg
  } else {
    capturedImage.value = null
  }
}

const getInitial = (name) => {
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
}

const getRandomColor = (name) => {
  if (!name) return 'primary'
  const colors = ['blue-6', 'teal-5', 'indigo-5', 'deep-purple-5', 'cyan-7']
  return colors[name.length % colors.length]
}

const getAddressName = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
    )
    const d = await res.json()
    locationData.value.address = d.display_name.split(',').slice(0, 4).join(', ')
  } catch {
    locationData.value.address = 'Gagal memuat koordinat jalan'
  }
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

// INTEGRASI EMAS: Logika pengolahan koordinat reaktif yang bersih & aman (Bebas Duplikasi)
const processCoordinates = (lat, lng, accuracy, mocked = false) => {
  const isSuspicious =
    mocked === true || accuracy === 10 || accuracy === 5 || accuracy === 1 || accuracy === 100

  if (isSuspicious) {
    locationData.value.securityRisk = true
    locationData.value.inRange = false
    locationData.value.lat = lat.toFixed(5)
    locationData.value.lng = lng.toFixed(5)
    locationData.value.statusText = 'TERDETEKSI FAKE GPS / LOKASI PALSU'
    locationData.value.matchedLocationName = 'AKSES DITOLAK'
    return
  }

  locationData.value.securityRisk = false
  locationData.value.lat = lat.toFixed(5)
  locationData.value.lng = lng.toFixed(5)

  let foundMatch = false
  let matchedName = 'TIDAK TERDETEKSI'

  let assignedLocs = []
  if (userData.value.lokasi_dinas) {
    assignedLocs = Array.isArray(userData.value.lokasi_dinas)
      ? userData.value.lokasi_dinas.map((l) => l.toUpperCase())
      : [userData.value.lokasi_dinas.toUpperCase()]
  }

  for (const loc of daftarLokasiKantor.value) {
    if (assignedLocs.length > 0 && !assignedLocs.includes(loc.nama_lokasi.toUpperCase())) {
      continue
    }
    const distance = calculateDistance(lat, lng, loc.latitude, loc.longitude)
    if (distance <= loc.radius) {
      foundMatch = true
      matchedName = loc.nama_lokasi
      break
    }
  }

  locationData.value.inRange = foundMatch
  locationData.value.matchedLocationName = matchedName

  if (foundMatch) {
    locationData.value.statusText = 'LOKASI VALID & COCOK'
  } else {
    if (assignedLocs.length > 0) {
      locationData.value.statusText = `WAJIB DI AREA PENUGASAN: ${assignedLocs.join(' / ')}`
    } else {
      locationData.value.statusText = 'DI LUAR AREA KANTOR / PROYEK'
    }
  }
  getAddressName(lat, lng)
}

// INTEGRASI EMAS: Fallback browser Geolocation (Jika tes di localhost/Chrome web)
const fallbackWebGeolocation = () => {
  if (!navigator.geolocation) {
    locationData.value.statusText = 'GPS TIDAK DIDUKUNG BROWSER'
    return
  }
  navigator.geolocation.getCurrentPosition(
    (p) => {
      const isMocked = p.coords.mocked === true
      processCoordinates(p.coords.latitude, p.coords.longitude, p.coords.accuracy, isMocked)
    },
    () => {
      locationData.value.statusText = 'IZINKAN GPS BROWSER!'
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
  )
}

// INTEGRASI EMAS: Logika asinkron pendeteksi lokasi dengan deteksi cerdas Capacitor Native APK + Web Fallback
const detectLocation = async () => {
  // Mengecek apakah aplikasi berjalan di dalam platform Capacitor asli (APK HP)
  const isCapacitor =
    typeof window !== 'undefined' &&
    window.Capacitor &&
    window.Capacitor.isPluginAvailable('Geolocation')

  if (isCapacitor) {
    try {
      // Membuka Dialog Izin Native Android/OS HP bawaan secara resmi
      const permission = await Geolocation.requestPermissions()

      if (permission.location === 'granted') {
        const posisi = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
        })
        const isMocked = posisi.coords.mocked || false
        processCoordinates(
          posisi.coords.latitude,
          posisi.coords.longitude,
          posisi.coords.accuracy,
          isMocked,
        )
      } else {
        locationData.value.statusText = 'IZINKAN LOKASI DI SETTING HP ANDA!'
        $q.notify({
          color: 'negative',
          icon: 'warning',
          message: 'Izin Lokasi Ditolak. Harap izinkan akses GPS di pengaturan aplikasi HP Anda.',
          position: 'top',
        })
      }
    } catch (e) {
      console.warn('Native Capacitor Geolocation gagal, dialihkan ke Web Fallback:', e)
      fallbackWebGeolocation()
    }
  } else {
    // Mode testing lokal via Web Browser normal
    fallbackWebGeolocation()
  }
}

const startAbsensi = (mode) => {
  if (locationData.value.securityRisk || !locationData.value.inRange) return

  attendanceMode.value = mode

  if (mode === 'in') {
    const timeStr = `${currentHours.value}:${currentMinutes.value}`
    if (timeStr > lateLimit.value) {
      $q.notify({
        color: 'red-6',
        icon: 'warning',
        message: `Waktu presensi sudah melebihi ${lateLimit.value}. Log tersimpan sebagai Terlambat.`,
        position: 'top',
      })
    }
  } else {
    if (!documentId.value) {
      $q.notify({
        color: 'red-6',
        icon: 'warning',
        message: 'Gagal mendeteksi dokumen masuk hari ini. Silakan hubungi admin.',
      })
      return
    }
  }

  showCamera.value = true
  setTimeout(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
      if (video.value) video.value.srcObject = s
    })
  }, 100)
}

const stopCamera = () => {
  if (video.value?.srcObject) video.value.srcObject.getTracks().forEach((t) => t.stop())
  showCamera.value = false
  capturedImage.value = null
  isFaceMatched.value = false
  isVerifyingFace.value = false
}

const executeAbsensiAction = async () => {
  if (attendanceMode.value === 'in') {
    await saveAbsensi()
  } else {
    await saveAbsensiOut()
  }
}

const saveAbsensi = async () => {
  if (!locationData.value.inRange || locationData.value.securityRisk || !isFaceMatched.value) return

  $q.loading.show({ message: 'Menyimpan berkas presensi masuk...' })
  try {
    const formattedName = (userData.value.nama || 'USER').toUpperCase()
    const nowObj = new Date()
    const timeStr = `${nowObj.getHours().toString().padStart(2, '0')}:${nowObj.getMinutes().toString().padStart(2, '0')}`

    const isLate = timeStr > lateLimit.value

    let fotoUrl = null
    if (capturedImage.value) {
      const fRef = storageRef(storage, `absensi/${formattedName}_IN_${Date.now()}.jpg`)
      await uploadString(fRef, capturedImage.value, 'data_url')
      fotoUrl = await getDownloadURL(fRef)
    }

    await addDoc(collection(db, 'absensi'), {
      nama_karyawan: formattedName,
      waktu_masuk: serverTimestamp(),
      waktu_pulang: null,
      tanggal: currentDate.value,
      status: 'Hadir',
      nama_tempat: locationData.value.matchedLocationName,
      alamat_lengkap: locationData.value.address,
      koordinat: `${locationData.value.lat}, ${locationData.value.lng}`,
      foto_masuk: fotoUrl,
      is_late: isLate,
    })

    $q.notify({
      color: 'positive',
      message: 'Clock-In Sukses! Selamat bekerja.',
      icon: 'check_circle',
    })
    stopCamera()
  } catch {
    $q.notify({ color: 'negative', message: 'Koneksi gagal, coba lagi.' })
  } finally {
    $q.loading.hide()
  }
}

const saveAbsensiOut = async () => {
  if (
    !documentId.value ||
    locationData.value.securityRisk ||
    !locationData.value.inRange ||
    !isFaceMatched.value
  )
    return

  $q.loading.show({ message: 'Menyimpan bukti presensi pulang...' })
  try {
    const formattedName = (userData.value.nama || 'USER').toUpperCase()

    let fotoPulangUrl = null
    if (capturedImage.value) {
      const fRef = storageRef(storage, `absensi/${formattedName}_OUT_${Date.now()}.jpg`)
      await uploadString(fRef, capturedImage.value, 'data_url')
      fotoPulangUrl = await getDownloadURL(fRef)
    }

    await updateDoc(doc(db, 'absensi', documentId.value), {
      waktu_pulang: serverTimestamp(),
      status: 'Selesai',
      koordinat_pulang: `${locationData.value.lat}, ${locationData.value.lng}`,
      nama_tempat_pulang: locationData.value.matchedLocationName,
      foto_pulang: fotoPulangUrl,
    })

    $q.notify({
      color: 'primary',
      message: 'Clock-Out Sukses! Selamat beristirahat di rumah.',
      icon: 'logout',
    })
    stopCamera()
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: 'Gagal memproses pengakhiran shift.' })
  } finally {
    $q.loading.hide()
  }
}

const formatWaktu = (ts) => (ts ? date.formatDate(ts.toDate(), 'HH:mm') : '--:--')

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  initFaceEngine()

  unsubLokasi = onSnapshot(collection(db, 'lokasi_kantor'), (snap) => {
    daftarLokasiKantor.value = snap.docs.map((docItem) => docItem.data())
    detectLocation()
  })
  locationTimer = setInterval(detectLocation, 30000)

  const saved = localStorage.getItem('user_data')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      userData.value = { ...userData.value, email: parsed.email || '', nama: parsed.nama || 'User' }

      if (userData.value.email) {
        const qUser = query(collection(db, 'karyawan'), where('email', '==', userData.value.email))
        unsubUser = onSnapshot(qUser, (snap) => {
          if (!snap.empty) {
            const data = snap.docs[0].data()

            let initialLocs = data.lokasi_dinas || []
            if (typeof initialLocs === 'string') {
              initialLocs = initialLocs ? [initialLocs] : []
            }

            userData.value = {
              ...userData.value,
              nama: data.nama || userData.value.nama,
              jabatan: data.jabatan || data.role,
              foto_profil: data.foto_profil || data.fotoUrl || '',
              foto_registrasi: data.foto_registrasi || '',
              nik: data.nik || '',
              jam_masuk: data.jam_masuk || '08:00',
              jam_pulang: data.jam_pulang || '17:00',
              lokasi_dinas: initialLocs,
            }
            detectLocation()
          }
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  const searchName = (userData.value.nama || 'USER').toUpperCase()
  unsubMe = onSnapshot(
    query(
      collection(db, 'absensi'),
      where('nama_karyawan', '==', searchName),
      orderBy('waktu_masuk', 'desc'),
      limit(5),
    ),
    (snap) => {
      riwayatData.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const active = riwayatData.value.find(
        (a) => a.tanggal === currentDate.value && a.status === 'Hadir',
      )
      documentId.value = active ? active.id : null
    },
  )

  unsubAll = onSnapshot(
    query(
      collection(db, 'absensi'),
      where('waktu_masuk', '>=', Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)))),
      orderBy('waktu_masuk', 'desc'),
    ),
    (snap) => {
      dataSeluruhKaryawan.value = snap.docs.map((d, i) => ({
        no: i + 1,
        nama_karyawan: d.data().nama_karyawan,
        checkin: formatWaktu(d.data().waktu_masuk),
      }))
    },
  )
})

onUnmounted(() => {
  clearInterval(timer)
  clearInterval(locationTimer)
  if (unsubMe) unsubMe()
  if (unsubAll) unsubAll()
  if (unsubUser) unsubUser()
  if (unsubLokasi) unsubLokasi()
})
</script>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
.font-mono {
  font-family: monospace;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.letter-spacing-2 {
  letter-spacing: 2px;
}
.line-height-tight {
  line-height: 1.1;
}
.line-height-normal {
  line-height: 1.4;
}
.uppercase {
  text-transform: uppercase;
}
.bento-container {
  max-width: 1400px;
}
.bento-card {
  border-radius: 24px;
  border: 1px solid #f1f5f9;
}
.bg-slate-50 {
  background-color: #f8fafc;
}
.border-bottom {
  border-bottom: 1px solid #f1f5f9;
}
.border-bottom-light {
  border-bottom: 1px solid #f8fafc;
}
.border-top {
  border-top: 1px solid #f1f5f9;
}
.border-grey {
  border: 1px solid #e2e8f0;
}
.border-teal {
  border: 1px solid #14b8a6;
}
.border-red {
  border: 1px solid #ef4444;
}
.border-orange {
  border: 1px solid #f97316;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.text-xs {
  font-size: 11px;
}
.shadow-soft {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05) !important;
}
.shadow-soft-primary {
  box-shadow: 0 8px 24px -8px rgba(25, 118, 210, 0.5) !important;
}
.shadow-glow-positive {
  box-shadow: 0 8px 24px -8px rgba(0, 150, 136, 0.6) !important;
}
.rounded-24 {
  border-radius: 24px;
}
.rounded-16 {
  border-radius: 16px;
}
.rounded-12 {
  border-radius: 12px;
}
.rounded-8 {
  border-radius: 8px;
}
.rounded-6 {
  border-radius: 6px;
}

.decor-circle-1 {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
  top: -150px;
  right: -50px;
  border-radius: 50%;
  z-index: 0;
}
.status-badge {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 18px;
  height: 18px;
  border: 3px solid white;
}
.aurora-card {
  background: #0f172a;
}
.aurora-bg {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(56, 189, 248, 0.35),
    rgba(99, 102, 241, 0.15),
    transparent 60%
  );
  animation: rotateAurora 15s linear infinite;
}
@keyframes rotateAurora {
  100% {
    transform: rotate(360deg);
  }
}
.glass-layer {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
}
.drop-shadow-glow {
  text-shadow: 0 4px 30px rgba(56, 189, 248, 0.4);
}
.time-wrapper {
  display: flex;
  align-items: baseline;
  justify-content: center;
  line-height: 1;
}
.time-hhmm {
  font-size: 5rem;
  font-weight: 900;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: -3px;
}
.time-ss {
  font-size: 2.2rem;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  margin-left: 8px;
}
.blink {
  animation: blinker 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes blinker {
  50% {
    opacity: 0;
  }
}
.date-chip {
  display: inline-block;
  padding: 8px 20px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.radar-box {
  border: 1px solid #f1f5f9;
  background: #fafafa;
}
.radar-valid {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.radar-invalid {
  background: #fef2f2;
  border-color: #fecaca;
}
.radar-icon-container {
  position: relative;
}
.icon-pulse-ring {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  z-index: 0;
}
.pulse-green {
  animation: pulseGreen 2s infinite;
}
.pulse-red {
  animation: pulseRed 2s infinite;
}
@keyframes pulseGreen {
  0% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.6);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 15px rgba(20, 184, 166, 0);
  }
  100% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(20, 184, 166, 0);
  }
}
@keyframes pulseRed {
  0% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 15px rgba(239, 68, 68, 0);
  }
  100% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.btn-premium {
  border: none;
  border-radius: 16px;
  padding: 16px 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-clock-in {
  background: #0d9488;
  color: white;
  box-shadow: 0 8px 25px -8px rgba(13, 148, 136, 0.6);
}
.btn-clock-in:hover {
  background: #0f766e;
  transform: translateY(-3px);
  box-shadow: 0 12px 30px -8px rgba(13, 148, 136, 0.8);
}
.btn-clock-out {
  background: #ef4444;
  color: white;
  box-shadow: 0 8px 25px -8px rgba(239, 68, 68, 0.6);
}
.btn-clock-out:hover {
  background: #dc2626;
  transform: translateY(-3px);
  box-shadow: 0 12px 30px -8px rgba(239, 68, 68, 0.8);
}
.btn-locked {
  background: #f8fafc;
  color: #94a3b8;
  border: 2px dashed #cbd5e1;
  box-shadow: none;
  cursor: not-allowed;
}

.hover-bg {
  transition: background 0.3s;
}
.hover-bg:hover {
  background: #f8fafc;
}
.z-content {
  position: relative;
  z-index: 1;
}
.video-stream {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}
.scanner-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;
}
.scanner-frame .corner {
  position: absolute;
  width: 40px;
  height: 40px;
  border-color: #00e676;
  border-style: solid;
}
.corner.t-l {
  top: 0;
  left: 0;
  border-width: 4px 0 0 4px;
}
.corner.t-r {
  top: 0;
  right: 0;
  border-width: 4px 4px 0 0;
}
.corner.b-l {
  bottom: 0;
  left: 0;
  border-width: 0 0 4px 4px;
}
.corner.b-r {
  bottom: 0;
  right: 0;
  border-width: 0 4px 4px 0;
}
@keyframes scan-laser {
  0% {
    top: 5%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 95%;
    opacity: 0;
  }
}
.scan-laser {
  position: absolute;
  left: 5%;
  width: 90%;
  height: 2px;
  background: #00e676;
  box-shadow: 0 0 15px 2px #00e676;
  animation: scan-laser 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.captured-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.bg-opacity-80 {
  background: rgba(0, 77, 64, 0.8) !important;
}

/* =======================================================================
   REVISI RESPONSIF LAYOUT MOBILE - ZERO-SCROLL SINGLE PANEL CONFIG
   ======================================================================= */
@media (max-width: 767px) {
  .camera-outer-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background: #f1f5f9;
    padding: 0 !important;
    margin: 0 !important;
    overflow: hidden;
  }

  .camera-outer-wrapper > div {
    height: 100% !important;
    width: 100% !important;
  }

  .camera-modal-card {
    border-radius: 0 !important;
    height: 100vh !important;
    max-height: 100vh !important;
    display: flex;
    flex-direction: column;
    margin: 0 !important;
    border: none !important;
  }

  .camera-header {
    padding: 10px 16px !important;
    flex: none;
  }

  .camera-row-container {
    flex-direction: column !important;
    flex-wrap: nowrap !important;
    flex: 1;
    overflow: hidden;
    display: flex !important;
  }

  .camera-video-container {
    height: 42vh !important;
    min-height: 180px !important;
    max-height: 240px !important;
    flex: none !important;
    background: #000000 !important;
  }

  .video-stream,
  .captured-preview {
    height: 100% !important;
    width: 100% !important;
    object-fit: contain !important;
    background: #000000 !important;
  }

  .camera-control-panel {
    padding: 12px !important;
    flex: 1;
    display: flex !important;
    flex-direction: column !important;
    flex-wrap: nowrap !important;
    justify-content: space-between !important;
    background-color: #f8fafc !important;
    overflow: hidden;
  }

  .info-summary-card {
    padding: 8px 12px !important;
    border-radius: 12px !important;
    margin-bottom: 0 !important;
    border: 1px solid #e2e8f0;
    background: white;
  }

  .info-summary-card .text-subtitle2 {
    font-size: 13px !important;
  }

  .font-10 {
    font-size: 9px !important;
  }

  .text-11 {
    font-size: 10px !important;
    padding: 4px !important;
  }

  .text-10 {
    font-size: 9px !important;
  }

  .q-mt-sm {
    margin-top: 8px !important;
  }

  .text-subtitle2 {
    font-size: 13px !important;
  }
}

@media (max-width: 1023px) {
  .hide-on-mobile {
    display: none !important;
  }
}
@media (max-width: 1023px) {
  .mobile-order-1 {
    order: 1 !important;
  }
  .mobile-order-2 {
    order: 2 !important;
  }
}
@media (min-width: 1024px) {
  .desktop-order-1 {
    order: 1 !important;
  }
  .desktop-order-2 {
    order: 2 !important;
  }
}
</style>
