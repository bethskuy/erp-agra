<template>
  <q-page class="neo-page-bg q-pa-md q-pa-lg font-inter">
    <!-- Decorative Floating Neo-Brutalist Shapes -->
    <div class="neo-decorations-container">
      <div class="neo-shape neo-shape--circle-1"></div>
      <div class="neo-shape neo-shape--circle-2"></div>
      <div class="neo-shape neo-shape--square-1"></div>
      <div class="neo-shape neo-shape--square-2"></div>
      <div class="neo-shape neo-shape--star-1">★</div>
      <div class="neo-shape neo-shape--star-2">★</div>
      <div class="neo-shape neo-shape--triangle-1">▲</div>
      <div class="neo-shape neo-shape--triangle-2">▲</div>
      <div class="neo-shape neo-shape--cross-1">+</div>
      <div class="neo-shape neo-shape--cross-2">+</div>
      <div class="neo-shape neo-shape--cross-3">+</div>
      <div class="neo-shape neo-shape--blob-1"></div>
    </div>

    <div class="premium-container q-mx-auto">
      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-xl header-entrance">
        <div class="col-12 col-md-8">
          <div class="row items-center q-mb-xs">
            <div class="ios-icon-box small bg-blue-50 text-primary q-mr-sm" style="border: 2.5px solid #0f172a; box-shadow: 2.5px 2.5px 0px #0f172a;">
              <q-icon name="history_edu" size="20px" />
            </div>
            <h4 class="text-h4 text-weight-bolder text-blue-grey-10 q-ma-none letter-spacing-tight">
              Pengajuan Absensi Manual
            </h4>
          </div>
          <div class="text-subtitle1 text-blue-grey-7 q-mt-sm line-height-normal text-weight-bold">
            Formulir pelaporan ketidakhadiran akibat kendala sistem, GPS, atau perangkat.
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-xl table-entrance">
        <!-- FORMULIR PENGAJUAN -->
        <div class="col-12 col-lg-7">
          <q-card flat class="neo-card bg-white full-height overflow-hidden">
            <q-card-section class="bg-primary text-white q-pa-lg row items-center" style="border-bottom: 2.5px solid #0f172a;">
              <q-icon name="edit_calendar" size="md" class="q-mr-md opacity-90" />
              <div>
                <div class="text-h6 text-weight-bolder letter-spacing-1">Formulir Manual</div>
                <div class="text-caption text-blue-1 text-weight-bold">
                  Isi data sesuai waktu kehadiran aktual Anda
                </div>
              </div>
            </q-card-section>

            <q-form @submit.prevent="submitManualAbsen" class="q-pa-lg">
              <div class="q-gutter-y-lg">
                <!-- Tanggal -->
                <div>
                  <div
                    class="text-caption text-weight-bolder text-blue-grey-9 uppercase letter-spacing-1 q-mb-sm"
                  >
                    Tanggal Kehadiran
                  </div>
                  <q-input
                    outlined
                    v-model="form.tanggal"
                    type="date"
                    color="primary"
                    class="rounded-input bg-white"
                    :rules="[(val) => !!val || 'Wajib diisi']"
                  />
                </div>

                <!-- Jam Masuk & Pulang -->
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <div
                      class="text-caption text-weight-bolder text-blue-grey-9 uppercase letter-spacing-1 q-mb-sm"
                    >
                      Jam Datang
                    </div>
                    <q-input
                      outlined
                      v-model="form.waktuIn"
                      type="time"
                      color="primary"
                      class="rounded-input bg-white"
                      :rules="[(val) => !!val || 'Wajib diisi']"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <div
                      class="text-caption text-weight-bolder text-blue-grey-9 uppercase letter-spacing-1 q-mb-sm"
                    >
                      Jam Pulang
                    </div>
                    <q-input
                      outlined
                      v-model="form.waktuOut"
                      type="time"
                      color="primary"
                      class="rounded-input bg-white"
                    />
                  </div>
                </div>

                <!-- Alasan -->
                <div>
                  <div
                    class="text-caption text-weight-bolder text-blue-grey-9 uppercase letter-spacing-1 q-mb-sm"
                  >
                    Alasan Kendala
                  </div>
                  <q-input
                    outlined
                    v-model="form.alasan"
                    type="textarea"
                    rows="4"
                    placeholder="Jelaskan mengapa Anda harus absen manual. Contoh: Aplikasi force close, GPS tidak terbaca di lantai 1, dll."
                    color="primary"
                    class="rounded-input bg-white"
                    :rules="[(val) => !!val || 'Alasan wajib diisi']"
                  />
                </div>

                <!-- Lampiran -->
                <div>
                  <div
                    class="text-caption text-weight-bolder text-blue-grey-9 uppercase letter-spacing-1 q-mb-sm"
                  >
                    Foto Bukti / Screenshot (Opsional)
                  </div>
                  <q-file
                    outlined
                    v-model="form.lampiran"
                    placeholder="Klik untuk unggah foto (Maks 5MB)"
                    color="primary"
                    class="rounded-input bg-white"
                    accept="image/*, .pdf"
                    clearable
                    max-file-size="5242880"
                  >
                    <template v-slot:prepend
                      ><q-icon name="cloud_upload" color="blue-grey-9"
                    /></template>
                  </q-file>
                </div>

                <!-- Tombol Submit -->
                <div class="q-pt-md">
                  <q-btn
                    unelevated
                    label="KIRIM PENGAJUAN KE HRD"
                    color="primary"
                    type="submit"
                    class="full-width text-weight-bolder neo-btn text-white q-py-md text-subtitle1"
                    :loading="submitting"
                    icon="send"
                  />
                </div>
              </div>
            </q-form>
          </q-card>
        </div>

        <!-- INFO & PANDUAN -->
        <div class="col-12 col-lg-5">
          <q-card
            flat
            class="neo-card full-height q-pa-lg flex column"
            style="background-color: #eff6ff !important;"
          >
            <q-icon
              name="info"
              color="blue-2"
              size="80px"
              class="absolute-top-right opacity-20 q-ma-md"
            />

            <div class="text-h6 text-primary text-weight-bolder q-mb-lg z-content relative-position">
              Panduan Absensi Manual
            </div>

            <div class="q-gutter-y-md z-content relative-position col">
              <div class="row items-start no-wrap">
                <q-icon name="looks_one" color="blue-8" size="sm" class="q-mr-sm q-mt-xs" />
                <div class="text-blue-grey-9 text-body2 line-height-relaxed text-weight-bold">
                  <strong>Kapan digunakan?</strong> Fitur ini hanya boleh digunakan jika sistem AGRA
                  ERP mengalami error, perangkat Anda rusak, atau GPS tidak terbaca di area kantor.
                </div>
              </div>
              <div class="row items-start no-wrap">
                <q-icon name="looks_two" color="blue-8" size="sm" class="q-mr-sm q-mt-xs" />
                <div class="text-blue-grey-9 text-body2 line-height-relaxed text-weight-bold">
                  <strong>Proses Verifikasi:</strong> Pengajuan ini akan masuk ke daftar
                  <em>Persetujuan Cuti/Izin</em> Admin HRD. Kehadiran Anda baru tercatat jika
                  disetujui.
                </div>
              </div>
              <div class="row items-start no-wrap">
                <q-icon name="looks_3" color="blue-8" size="sm" class="q-mr-sm q-mt-xs" />
                <div class="text-blue-grey-9 text-body2 line-height-relaxed text-weight-bold">
                  <strong>Bukti Kuat:</strong> Sangat disarankan untuk melampirkan screenshot error
                  aplikasi atau foto lokasi Anda sebagai bukti valid.
                </div>
              </div>
            </div>

            <div
              class="bg-white q-pa-md z-content relative-position row items-center q-mt-xl"
              style="border: 2px solid #0f172a; border-radius: 12px; box-shadow: 3px 3px 0px #0f172a;"
            >
              <q-icon name="security" color="primary" size="md" class="q-mr-md" />
              <div class="text-caption text-blue-grey-9 text-weight-bold">
                Penyalahgunaan fitur absensi manual secara sengaja dapat dikenakan sanksi
                indisipliner oleh pihak HRD.
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db, storage } from 'src/boot/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useQuasar, date } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()
const submitting = ref(false)

const userData = ref({ nama: 'USER' })

const form = ref({
  tanggal: date.formatDate(Date.now(), 'YYYY-MM-DD'),
  waktuIn: '',
  waktuOut: '',
  alasan: '',
  lampiran: null,
})

const submitManualAbsen = async () => {
  submitting.value = true
  try {
    const namaKaryawan = (userData.value.nama || 'USER').toUpperCase()

    // 1. Upload file bukti (jika ada)
    let finalDocUrl = ''
    if (form.value.lampiran) {
      $q.loading.show({ message: 'Mengunggah bukti...' })
      const file = form.value.lampiran
      const extension = file.name.split('.').pop()
      const fileName = `MANUAL_ABSEN_${namaKaryawan}_${Date.now()}.${extension}`

      const sRef = storageRef(storage, `lampiran_pengajuan/${fileName}`)
      await uploadBytes(sRef, file)
      finalDocUrl = await getDownloadURL(sRef)
      $q.loading.hide()
    }

    // 2. Format alasan dengan Jam Masuk/Pulang
    const outTime = form.value.waktuOut ? form.value.waktuOut : 'Belum Pulang'
    const combinedAlasan = `[Jam Masuk: ${form.value.waktuIn} | Jam Pulang: ${outTime}] - Alasan: ${form.value.alasan}`

    // 3. Simpan ke koleksi 'pengajuan'
    await addDoc(collection(db, 'pengajuan'), {
      nama_karyawan: namaKaryawan,
      jenis_pengajuan: 'Absensi Manual',
      tanggal_mulai: form.value.tanggal,
      tanggal_selesai: form.value.tanggal,
      alasan: combinedAlasan,
      dokumen_url: finalDocUrl,
      status_approval: 'Pending',
      created_at: serverTimestamp(),
    })

    $q.notify({
      color: 'positive',
      message: 'Pengajuan Absensi Manual Berhasil Dikirim ke HRD!',
      icon: 'check_circle',
      classes: 'rounded-12 text-weight-bold',
    })

    // Kembali ke Dashboard setelah sukses
    setTimeout(() => {
      router.push('/absensi/dashboard')
    }, 1500)
  } catch (e) {
    if ($q.loading.isActive) $q.loading.hide()
    $q.notify({ color: 'negative', message: e.message || 'Gagal mengirim pengajuan.' })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  const saved = localStorage.getItem('user_data')
  if (saved) {
    userData.value = JSON.parse(saved)
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap');

/* GLOBAL TYPOGRAPHY */
.font-inter {
  font-family: 'Inter', sans-serif;
}
.text-h4, h4 {
  font-weight: 850 !important;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.letter-spacing-tight {
  letter-spacing: -0.5px;
}
.line-height-normal {
  line-height: 1.4;
}
.line-height-relaxed {
  line-height: 1.6;
}
.uppercase {
  text-transform: uppercase;
}

/* LAYOUTING & NEO-BRUTALIST CORE */
.premium-container {
  max-width: 1200px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.neo-page-bg {
  background-color: #f1f5f9;
  background-image: radial-gradient(#cbd5e1 2px, transparent 2px);
  background-size: 24px 24px;
  position: relative;
  min-height: 100vh;
}

.neo-card {
  background: #ffffff !important;
  border: 3px solid #0f172a !important;
  box-shadow: 6px 6px 0px #0f172a !important;
  border-radius: 20px !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.neo-card:hover {
  transform: translateY(-2px) translateX(2px);
  box-shadow: 8px 8px 0px #0f172a !important;
}

.neo-btn {
  border: 2.5px solid #0f172a !important;
  box-shadow: 3.5px 3.5px 0px #0f172a !important;
  border-radius: 12px;
  font-weight: 700;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.neo-btn:hover {
  transform: translateY(-1px) translateX(1px);
  box-shadow: 2.5px 2.5px 0px #0f172a !important;
}

.neo-btn:active {
  transform: translateY(2px) translateX(2px);
  box-shadow: 0px 0px 0px #0f172a !important;
}

/* Floating Shapes Background Styling */
.neo-decorations-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.neo-shape {
  position: absolute;
  user-select: none;
  transition: all 0.3s ease;
}

/* 1. Circle 1 - Indigo/Blue */
.neo-shape--circle-1 {
  width: 180px;
  height: 180px;
  border: 3px solid rgba(59, 130, 246, 0.25);
  background: rgba(59, 130, 246, 0.07);
  box-shadow: 5px 5px 0px rgba(59, 130, 246, 0.12);
  top: 8%;
  left: -20px;
  animation: drift-wobble-1 25s ease-in-out infinite;
}

/* 2. Circle 2 - Pink/Rose */
.neo-shape--circle-2 {
  width: 140px;
  height: 140px;
  border: 3px solid rgba(244, 63, 94, 0.25);
  background: rgba(244, 63, 94, 0.07);
  box-shadow: 5px 5px 0px rgba(244, 63, 94, 0.12);
  top: 52%;
  right: 6%;
  animation: drift-wobble-2 22s ease-in-out infinite reverse;
}

/* 3. Square 1 - Orange */
.neo-shape--square-1 {
  width: 130px;
  height: 130px;
  border: 3px solid rgba(245, 158, 11, 0.25);
  background: rgba(245, 158, 11, 0.07);
  box-shadow: 5px 5px 0px rgba(245, 158, 11, 0.12);
  top: 65%;
  right: -30px;
  animation: drift-wobble-2 30s ease-in-out infinite;
}

/* 4. Square 2 - Lime */
.neo-shape--square-2 {
  width: 110px;
  height: 110px;
  border: 3px solid rgba(132, 204, 22, 0.25);
  background: rgba(132, 204, 22, 0.07);
  box-shadow: 4px 4px 0px rgba(132, 204, 22, 0.12);
  top: 22%;
  left: 15%;
  animation: drift-wobble-1 27s ease-in-out infinite;
}

/* 5. Star 1 - Purple */
.neo-shape--star-1 {
  font-size: 130px;
  color: rgba(168, 85, 247, 0.22);
  text-shadow: 4px 4px 0px rgba(168, 85, 247, 0.12);
  top: 3%;
  right: 15%;
  animation: drift-diagonal-1 28s ease-in-out infinite reverse;
}

/* 6. Star 2 - Yellow */
.neo-shape--star-2 {
  font-size: 90px;
  color: rgba(234, 179, 8, 0.24);
  text-shadow: 3px 3px 0px rgba(234, 179, 8, 0.14);
  top: 85%;
  right: 25%;
  animation: drift-diagonal-2 20s ease-in-out infinite;
}

/* 7. Triangle 1 - Cyan */
.neo-shape--triangle-1 {
  font-size: 100px;
  color: rgba(6, 182, 212, 0.22);
  text-shadow: 4px 4px 0px rgba(6, 182, 212, 0.12);
  top: 40%;
  left: 8%;
  animation: drift-wobble-2 24s ease-in-out infinite reverse;
}

/* 8. Triangle 2 - Amber/Gold */
.neo-shape--triangle-2 {
  font-size: 80px;
  color: rgba(245, 158, 11, 0.22);
  text-shadow: 3px 3px 0px rgba(245, 158, 11, 0.12);
  top: 12%;
  left: 35%;
  animation: drift-diagonal-1 23s ease-in-out infinite;
}

/* 9. Cross 1 - Emerald Green */
.neo-shape--cross-1 {
  font-size: 110px;
  color: rgba(16, 185, 129, 0.22);
  text-shadow: 4px 4px 0px rgba(16, 185, 129, 0.12);
  top: 30%;
  right: 25%;
  animation: drift-diagonal-1 22s ease-in-out infinite;
}

/* 10. Cross 2 - Red/Rose */
.neo-shape--cross-2 {
  font-size: 90px;
  color: rgba(239, 68, 68, 0.22);
  text-shadow: 4px 4px 0px rgba(239, 68, 68, 0.12);
  top: 75%;
  left: 2%;
  animation: drift-diagonal-2 26s ease-in-out infinite;
}

/* 11. Cross 3 - Deep Indigo */
.neo-shape--cross-3 {
  font-size: 100px;
  color: rgba(99, 102, 241, 0.22);
  text-shadow: 4px 4px 0px rgba(99, 102, 241, 0.12);
  top: 90%;
  left: 40%;
  animation: drift-wobble-1 29s ease-in-out infinite;
}

/* 12. Blob 1 - Teal Organic Morphing Blob */
.neo-shape--blob-1 {
  width: 160px;
  height: 160px;
  border: 3px solid rgba(20, 184, 166, 0.25);
  background: rgba(20, 184, 166, 0.07);
  box-shadow: 5px 5px 0px rgba(20, 184, 166, 0.12);
  top: 48%;
  left: 42%;
  animation: drift-blob 32s ease-in-out infinite;
}

/* KEYFRAMES FOR ORGANIC DRIFTING */
@keyframes drift-wobble-1 {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    border-radius: 50% 50% 50% 50%;
  }
  25% {
    transform: translate(50px, -40px) scale(1.05) rotate(90deg);
    border-radius: 46% 54% 48% 52%;
  }
  50% {
    transform: translate(20px, -80px) scale(0.95) rotate(180deg);
    border-radius: 54% 46% 52% 48%;
  }
  75% {
    transform: translate(-40px, -30px) scale(1.02) rotate(270deg);
    border-radius: 48% 52% 54% 46%;
  }
  100% {
    transform: translate(0, 0) scale(1) rotate(360deg);
    border-radius: 50% 50% 50% 50%;
  }
}

@keyframes drift-wobble-2 {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    border-radius: 8px;
  }
  33% {
    transform: translate(-60px, -30px) scale(1.08) rotate(120deg);
    border-radius: 14px 8px 14px 8px;
  }
  66% {
    transform: translate(30px, -70px) scale(0.92) rotate(240deg);
    border-radius: 8px 14px 8px 14px;
  }
  100% {
    transform: translate(0, 0) scale(1) rotate(360deg);
    border-radius: 8px;
  }
}

@keyframes drift-diagonal-1 {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  50% {
    transform: translate(45px, 60px) rotate(180deg) scale(1.05);
  }
  100% {
    transform: translate(0, 0) rotate(360deg) scale(1);
  }
}

@keyframes drift-diagonal-2 {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  50% {
    transform: translate(-50px, -60px) rotate(-180deg) scale(0.95);
  }
  100% {
    transform: translate(0, 0) rotate(-360deg) scale(1);
  }
}

@keyframes drift-blob {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  }
  33% {
    transform: translate(40px, -50px) scale(1.06) rotate(120deg);
    border-radius: 70% 30% 52% 48% / 60% 40% 70% 30%;
  }
  66% {
    transform: translate(-30px, 30px) scale(0.94) rotate(240deg);
    border-radius: 50% 50% 30% 70% / 50% 60% 40% 60%;
  }
  100% {
    transform: translate(0, 0) scale(1) rotate(360deg);
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  }
}

/* Entrance animation classes */
.header-entrance {
  animation: brutalist-bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.table-entrance {
  opacity: 0;
  animation: brutalist-bounce-in 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.15s forwards;
}

@keyframes brutalist-bounce-in {
  0% {
    opacity: 0;
    transform: translateY(35px);
  }
  60% {
    opacity: 1;
    transform: translateY(-6px);
  }
  80% {
    transform: translateY(2px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* APPLE-STYLE ICONS */
.ios-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ios-icon-box.small {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

/* CUSTOM INPUTS */
.rounded-input :deep(.q-field__control) {
  border-radius: 10px !important;
  border: 2.5px solid #0f172a !important;
  box-shadow: 2.5px 2.5px 0px #0f172a !important;
  background-color: #ffffff !important;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.rounded-input :deep(.q-field__control:hover),
.rounded-input :deep(.q-field__focused .q-field__control) {
  transform: translateY(-1px) translateX(1px);
  box-shadow: 3.5px 3.5px 0px #0f172a !important;
  border-color: #0f172a !important;
}
.rounded-input :deep(.q-field__native),
.rounded-input :deep(.q-field__input) {
  color: #0f172a !important;
  font-weight: 700 !important;
}
.rounded-input :deep(.q-field__marginal) {
  color: #0f172a !important;
}
</style>
