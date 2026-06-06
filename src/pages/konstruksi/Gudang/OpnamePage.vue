<template>
  <q-page class="bg-page q-pa-md q-pa-md-lg font-pro relative-position">
    <div class="page-content-wrapper">
      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-xl animate-fade">
        <div class="col-12 col-md-8 q-mb-md q-mb-md-none">
          <div class="row items-center no-wrap">
            <q-btn
              flat
              round
              color="brand-primary"
              icon="arrow_back"
              @click="$router.back()"
              class="q-mr-md bg-white shadow-1"
            />
            <div>
              <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
                Stok Opname
                <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                  >Rekonsiliasi Inventaris Fisik</span
                >
              </div>
              <div class="text-subtitle1 text-grey-7 q-mt-sm">
                Gudang ID:
                <q-badge
                  color="brand-light"
                  text-color="brand-primary"
                  class="q-px-sm text-weight-bold"
                  >{{ gudangId || 'UTAMA' }}</q-badge
                >
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="row justify-end">
            <div class="col-12 col-sm-auto">
              <q-btn
                unelevated
                color="brand-primary"
                label="Simpan Rekonsiliasi"
                :loading="loading"
                rounded
                class="full-width q-px-xl text-weight-bold shadow-premium"
                @click="formRef.submit()"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- FORM SECTION -->
      <div class="row justify-center">
        <div class="col-12 col-md-8 col-lg-6">
          <q-card flat bordered class="rounded-20 shadow-premium bg-white overflow-hidden">
            <q-toolbar class="bg-brand-primary text-white q-py-md">
              <q-icon name="analytics" size="sm" class="q-mr-sm" />
              <q-toolbar-title class="text-weight-bold uppercase letter-spacing-1"
                >Form Penyesuaian Stok</q-toolbar-title
              >
            </q-toolbar>

            <q-card-section class="q-pa-xl">
              <q-form ref="formRef" @submit="prosesOpname" class="q-gutter-y-lg">
                <!-- 1. Pemilihan Barang -->
                <div>
                  <div class="label-req q-mb-sm">Identitas Material</div>
                  <q-select
                    outlined
                    v-model="form.barang"
                    label="Cari & Pilih Nama Barang *"
                    :options="daftarBarang"
                    option-label="nama_barang"
                    @update:model-value="onBarangSelect"
                    lazy-rules
                    :rules="[(val) => !!val || 'Pilih item yang akan di-opname']"
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="inventory_2" color="brand-primary" />
                    </template>
                  </q-select>
                </div>

                <!-- 2. Dashboard Perbandingan (Hanya muncul jika barang dipilih) -->
                <transition
                  enter-active-class="animated fadeIn"
                  leave-active-class="animated fadeOut"
                >
                  <div v-if="form.barang" class="row q-col-gutter-md q-mb-md">
                    <div class="col-12 col-sm-4">
                      <div class="comparison-card bg-brand-light">
                        <div class="text-caption text-brand-primary text-weight-bold uppercase">
                          Stok Sistem
                        </div>
                        <div class="text-h5 text-weight-black text-brand-primary">
                          {{ form.stokSistem }}
                        </div>
                        <div class="text-caption text-brand-primary">{{ form.barang.satuan }}</div>
                      </div>
                    </div>
                    <div class="col-12 col-sm-4">
                      <div class="comparison-card bg-grey-2">
                        <div class="text-caption text-grey-8 text-weight-bold uppercase">
                          Stok Fisik
                        </div>
                        <div class="text-h5 text-weight-black text-brand-primary">
                          {{ form.stokFisik }}
                        </div>
                        <div class="text-caption">{{ form.barang.satuan }}</div>
                      </div>
                    </div>
                    <div class="col-12 col-sm-4">
                      <div class="comparison-card" :class="selisihWarna">
                        <div class="text-caption text-weight-bold uppercase">Selisih (GAP)</div>
                        <div class="text-h5 text-weight-black">
                          {{ selisihValue > 0 ? '+' : '' }}{{ selisihValue }}
                        </div>
                        <div class="text-caption">{{ selisihLabel }}</div>
                      </div>
                    </div>
                  </div>
                </transition>

                <!-- 3. Input Hasil Opname -->
                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <div class="label-req q-mb-sm">Hasil Perhitungan Fisik</div>
                    <q-input
                      outlined
                      v-model.number="form.stokFisik"
                      label="Masukkan Jumlah Stok Fisik Terkini *"
                      type="number"
                      lazy-rules
                      :rules="[(val) => val >= 0 || 'Jumlah tidak valid']"
                      class="text-h5 text-weight-bold"
                    >
                      <template v-slot:append>
                        <q-badge
                          color="brand-light"
                          text-color="brand-primary"
                          class="q-pa-sm text-weight-bold uppercase"
                        >
                          {{ form.barang?.satuan || 'Unit' }}
                        </q-badge>
                      </template>
                    </q-input>
                  </div>
                </div>

                <!-- 4. Alasan / Catatan -->
                <div>
                  <div class="label-req q-mb-sm">Justifikasi / Catatan Selisih</div>
                  <q-input
                    outlined
                    v-model="form.catatan"
                    label="Tuliskan alasan perbedaan stok (jika ada)..."
                    type="textarea"
                    rows="3"
                    bg-color="white"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="q-py-xl"></div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const gudangId = route.params.id

const formRef = ref(null)
const loading = ref(false)
const form = ref({ barang: null, stokSistem: 0, stokFisik: 0, catatan: '' })
const daftarBarang = ref([])

// Kalkulasi Selisih
const selisihValue = computed(() => {
  if (!form.value.barang) return 0
  return form.value.stokFisik - form.value.stokSistem
})

const selisihLabel = computed(() => {
  const val = selisihValue.value
  if (val === 0) return 'Balance'
  return val > 0 ? 'Surplus' : 'Defisit'
})

const selisihWarna = computed(() => {
  const val = selisihValue.value
  if (val === 0) return 'bg-grey-1 text-grey-7'
  return val > 0 ? 'bg-green-1 text-green-10' : 'bg-red-1 text-red-10'
})

const fetchBarang = async () => {
  $q.loading.show({ message: 'Memuat data inventaris...' })
  try {
    const q = query(collection(db, 'stok_barang'), where('id_gudang', '==', gudangId))
    const snap = await getDocs(q)
    daftarBarang.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (e) {
    console.error(e)
  } finally {
    $q.loading.hide()
  }
}

const onBarangSelect = (val) => {
  form.value.stokSistem = val ? val.jumlah : 0
  form.value.stokFisik = val ? val.jumlah : 0 // Default set ke stok sistem
}

const prosesOpname = async () => {
  loading.value = true
  try {
    // 1. Update jumlah stok menjadi nilai fisik yang baru
    const docRef = doc(db, 'stok_barang', form.value.barang.id)
    await updateDoc(docRef, {
      jumlah: form.value.stokFisik,
      updated_at: serverTimestamp(),
    })

    // 2. Simpan record opname di koleksi 'aktivitas'
    await addDoc(collection(db, 'aktivitas'), {
      id_gudang: gudangId,
      id_barang: form.value.barang.id,
      nama_barang: form.value.barang.nama_barang,
      stok_sebelum: form.value.stokSistem,
      stok_sesudah: form.value.stokFisik,
      selisih: selisihValue.value,
      tipe: 'OPNAME',
      catatan: form.value.catatan,
      timestamp: serverTimestamp(),
    })

    $q.notify({
      type: 'positive',
      message: 'Penyesuaian stok berhasil disimpan!',
      position: 'top',
      icon: 'done_all',
    })
    router.back()
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Gagal simpan opname: ' + e.message })
  } finally {
    loading.value = false
  }
}

onMounted(fetchBarang)
</script>

<style scoped>
.font-pro {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(54, 173, 163, 0.2);
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.uppercase {
  text-transform: uppercase;
}

.label-req {
  font-size: 12px;
  font-weight: 700;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.comparison-card {
  padding: 15px;
  border-radius: 15px;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.btn-hover:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
  transition: 0.3s ease;
}

.animate-fade {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.block {
  display: block;
}

.page-content-wrapper {
  padding: 0 16px;
}
@media (min-width: 768px) {
  .page-content-wrapper {
    padding: 0 24px;
  }
}

/* ===== BRAND COLOR PALETTE ===== */
:root {
  --brand-primary: #36ada3;
  --brand-primary-dark: #1e6e69;
  --brand-primary-light: #e0f5f4;
  --brand-primary-mid: #b2e5e2;
  --brand-danger: #ad3640;
  --brand-danger-dark: #7a2028;
  --brand-danger-light: #f7e0e1;
  --page-bg: #f0fafa;
}

.bg-brand-primary {
  background-color: #36ada3 !important;
}
.bg-brand-light {
  background-color: #e0f5f4 !important;
}
.bg-brand-danger {
  background-color: #ad3640 !important;
}
.text-brand-primary {
  color: #36ada3 !important;
}
.text-brand-teal {
  color: #36ada3 !important;
}
.text-brand-danger {
  color: #ad3640 !important;
}
.bg-page {
  background-color: #f0fafa !important;
}

/* ===== QUASAR COMPONENT DEEP OVERRIDES ===== */
:deep(.q-btn[color='brand-primary']) {
  background: #36ada3 !important;
  color: white !important;
}
:deep(.q-btn--unelevated.q-btn[color='brand-primary']) {
  background: #36ada3 !important;
}
:deep(.q-avatar[color='brand-primary']) {
  background-color: #36ada3 !important;
  color: white !important;
}
:deep(.q-avatar[color='brand-light']) {
  background-color: #e0f5f4 !important;
  color: #1e6e69 !important;
}
:deep(.q-btn[color='brand-danger']) {
  color: #ad3640 !important;
}
:deep(.q-btn--flat[color='brand-danger']) {
  color: #ad3640 !important;
}
:deep(.q-btn--flat[color='brand-primary']) {
  color: #36ada3 !important;
}
:deep(.q-icon[color='brand-primary']),
:deep(.q-field__prepend .q-icon) {
  color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__control) {
  border-color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__label) {
  color: #36ada3 !important;
}
</style>
