<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade">
      <div class="col-12 col-md-8">
        <div class="row items-center no-wrap">
          <q-btn
            flat
            round
            color="green-10"
            icon="arrow_back"
            @click="$router.back()"
            class="q-mr-md bg-white shadow-1"
          />
          <div>
            <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
              Stok Opname
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Rekonsiliasi Inventaris Fisik</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Gudang ID:
              <q-badge color="green-1" text-color="green-10" class="q-px-sm text-weight-bold">{{
                gudangId || 'UTAMA'
              }}</q-badge>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FORM SECTION -->
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <q-card flat bordered class="rounded-20 shadow-premium bg-white overflow-hidden">
          <q-toolbar class="bg-green-10 text-white q-py-md">
            <q-icon name="analytics" size="sm" class="q-mr-sm" />
            <q-toolbar-title class="text-weight-bold uppercase letter-spacing-1"
              >Form Penyesuaian Stok</q-toolbar-title
            >
          </q-toolbar>

          <q-card-section class="q-pa-xl">
            <q-form @submit="prosesOpname" class="q-gutter-y-lg">
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
                    <q-icon name="inventory_2" color="green-10" />
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
                    <div class="comparison-card bg-green-1">
                      <div class="text-caption text-green-9 text-weight-bold uppercase">
                        Stok Sistem
                      </div>
                      <div class="text-h5 text-weight-black">{{ form.stokSistem }}</div>
                      <div class="text-caption">{{ form.barang.satuan }}</div>
                    </div>
                  </div>
                  <div class="col-12 col-sm-4">
                    <div class="comparison-card bg-grey-2">
                      <div class="text-caption text-grey-8 text-weight-bold uppercase">
                        Stok Fisik
                      </div>
                      <div class="text-h5 text-weight-black text-green-10">{{ form.stokFisik }}</div>
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
                        color="grey-3"
                        text-color="grey-9"
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

              <!-- Submit Button -->
              <div class="q-mt-xl">
                <q-btn
                  label="Simpan Rekonsiliasi Stok"
                  type="submit"
                  color="green-10"
                  class="full-width rounded-20 q-py-md text-weight-bold shadow-6 btn-hover"
                  size="lg"
                  unelevated
                  icon="check_circle"
                  :loading="loading"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="q-py-xl"></div>
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
  return val > 0 ? 'bg-green-1 text-green-10' : 'bg-green-1 text-green-10'
})

const fetchBarang = async () => {
  $q.loading.show({ message: 'Memuat data inventaris...' })
  try {
    const q = query(collection(db, 'stok_barang_manufaktur'), where('id_gudang', '==', gudangId))
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
    const docRef = doc(db, 'stok_barang_manufaktur', form.value.barang.id)
    await updateDoc(docRef, {
      jumlah: form.value.stokFisik,
      updated_at: serverTimestamp(),
    })

    // 2. Simpan record opname di koleksi 'aktivitas_manufaktur'
    await addDoc(collection(db, 'aktivitas_manufaktur'), {
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
    'Inter',
    -apple-system,
    sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(25, 118, 210, 0.15);
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
</style>
