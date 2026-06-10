<template>
  <q-page class="bg-slate-50 q-pa-md q-pa-lg font-inter">
    <div class="premium-container q-mx-auto">
      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-xl">
        <div class="col-12 col-md-8">
          <div class="row items-center q-mb-xs">
            <div class="ios-icon-box small bg-blue-50 text-primary q-mr-sm">
              <q-icon name="history_edu" size="20px" />
            </div>
            <h4 class="text-h4 text-weight-bolder text-blue-grey-10 q-ma-none letter-spacing-tight">
              Pengajuan Absensi Manual
            </h4>
          </div>
          <div class="text-subtitle1 text-blue-grey-6 q-mt-sm line-height-normal">
            Formulir pelaporan ketidakhadiran akibat kendala sistem, GPS, atau perangkat.
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-xl">
        <!-- FORMULIR PENGAJUAN -->
        <div class="col-12 col-lg-7">
          <q-card flat class="bento-card bg-white full-height overflow-hidden shadow-soft">
            <q-card-section class="bg-primary text-white q-pa-lg row items-center">
              <q-icon name="edit_calendar" size="md" class="q-mr-md opacity-80" />
              <div>
                <div class="text-h6 text-weight-bold letter-spacing-1">Formulir Manual</div>
                <div class="text-caption text-blue-2">
                  Isi data sesuai waktu kehadiran aktual Anda
                </div>
              </div>
            </q-card-section>

            <q-form @submit.prevent="submitManualAbsen" class="q-pa-lg">
              <div class="q-gutter-y-lg">
                <!-- Tanggal -->
                <div>
                  <div
                    class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                  >
                    Tanggal Kehadiran
                  </div>
                  <q-input
                    outlined
                    v-model="form.tanggal"
                    type="date"
                    color="primary"
                    class="rounded-input bg-grey-1"
                    :rules="[(val) => !!val || 'Wajib diisi']"
                  />
                </div>

                <!-- Jam Masuk & Pulang -->
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <div
                      class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                    >
                      Jam Datang
                    </div>
                    <q-input
                      outlined
                      v-model="form.waktuIn"
                      type="time"
                      color="primary"
                      class="rounded-input bg-grey-1"
                      :rules="[(val) => !!val || 'Wajib diisi']"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <div
                      class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                    >
                      Jam Pulang
                    </div>
                    <q-input
                      outlined
                      v-model="form.waktuOut"
                      type="time"
                      color="primary"
                      class="rounded-input bg-grey-1"
                    />
                  </div>
                </div>

                <!-- Alasan -->
                <div>
                  <div
                    class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
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
                    class="rounded-input bg-grey-1"
                    :rules="[(val) => !!val || 'Alasan wajib diisi']"
                  />
                </div>

                <!-- Lampiran -->
                <div>
                  <div
                    class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                  >
                    Foto Bukti / Screenshot (Opsional)
                  </div>
                  <q-file
                    outlined
                    v-model="form.lampiran"
                    placeholder="Klik untuk unggah foto (Maks 5MB)"
                    color="primary"
                    class="rounded-input bg-grey-1"
                    accept="image/*, .pdf"
                    clearable
                    max-file-size="5242880"
                  >
                    <template v-slot:prepend
                      ><q-icon name="cloud_upload" color="primary"
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
                    class="full-width text-weight-bolder rounded-12 q-py-md shadow-soft-primary transition-smooth text-subtitle1"
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
            class="bento-card bg-blue-50 border-blue-100 full-height q-pa-lg flex column"
          >
            <q-icon
              name="info"
              color="blue-3"
              size="80px"
              class="absolute-top-right opacity-20 q-ma-md"
            />

            <div class="text-h6 text-primary text-weight-bold q-mb-lg z-content relative-position">
              Panduan Absensi Manual
            </div>

            <div class="q-gutter-y-md z-content relative-position col">
              <div class="row items-start no-wrap">
                <q-icon name="looks_one" color="blue-8" size="sm" class="q-mr-sm q-mt-xs" />
                <div class="text-blue-grey-8 text-body2 line-height-relaxed">
                  <strong>Kapan digunakan?</strong> Fitur ini hanya boleh digunakan jika sistem AGRA
                  ERP mengalami error, perangkat Anda rusak, atau GPS tidak terbaca di area kantor.
                </div>
              </div>
              <div class="row items-start no-wrap">
                <q-icon name="looks_two" color="blue-8" size="sm" class="q-mr-sm q-mt-xs" />
                <div class="text-blue-grey-8 text-body2 line-height-relaxed">
                  <strong>Proses Verifikasi:</strong> Pengajuan ini akan masuk ke daftar
                  <em>Persetujuan Cuti/Izin</em> Admin HRD. Kehadiran Anda baru tercatat jika
                  disetujui.
                </div>
              </div>
              <div class="row items-start no-wrap">
                <q-icon name="looks_3" color="blue-8" size="sm" class="q-mr-sm q-mt-xs" />
                <div class="text-blue-grey-8 text-body2 line-height-relaxed">
                  <strong>Bukti Kuat:</strong> Sangat disarankan untuk melampirkan screenshot error
                  aplikasi atau foto lokasi Anda sebagai bukti valid.
                </div>
              </div>
            </div>

            <div
              class="bg-white q-pa-md rounded-12 border-blue-100 q-mt-xl z-content relative-position row items-center"
            >
              <q-icon name="security" color="primary" size="md" class="q-mr-md" />
              <div class="text-caption text-blue-grey-7 text-weight-medium">
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
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

.premium-container {
  max-width: 1200px;
  width: 100%;
}
.bento-card {
  border-radius: 24px;
  border: 1px solid #f1f5f9;
}
.bg-slate-50 {
  background-color: #f8fafc;
}
.border-blue-100 {
  border: 1px solid #dbeafe;
}
.z-content {
  position: relative;
  z-index: 2;
}
.opacity-20 {
  opacity: 0.2;
}
.opacity-80 {
  opacity: 0.8;
}

.shadow-soft {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05) !important;
}
.shadow-soft-primary {
  box-shadow: 0 8px 24px -8px rgba(25, 118, 210, 0.5) !important;
}
.rounded-12 {
  border-radius: 12px;
}

.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.rounded-input :deep(.q-field__control) {
  border-radius: 12px;
}

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
</style>
