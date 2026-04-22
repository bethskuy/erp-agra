<template>
  <q-page class="bg-grey-2 q-pa-lg font-pro">
    <!-- Header Page -->
    <div class="row items-center q-mb-xl">
      <q-btn flat round color="grey-7" icon="arrow_back" @click="$router.back()" class="q-mr-md" />
      <div>
        <div class="text-h5 text-weight-bold text-indigo-10 text-uppercase letter-spacing-1">
          Pengeluaran Barang
        </div>
        <div class="text-caption text-grey-7">
          Distribusi & Alokasi Material - Gudang ID:
          <q-badge color="grey-3" text-color="grey-9" label="UTAMA" />
        </div>
      </div>
    </div>

    <!-- Form Section -->
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <q-card flat bordered class="rounded-borders shadow-2 bg-white">
          <q-card-section class="q-pa-xl">
            <q-form @submit="prosesBarangKeluar" class="q-gutter-y-lg">
              <!-- Section: Tujuan -->
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-icon name="location_on" color="indigo-10" size="sm" />
                <div class="text-subtitle1 text-weight-bold text-grey-8">Tujuan Pengiriman</div>
              </div>

              <q-input
                filled
                v-model="form.noSpk"
                label="No. Proyek / SPK"
                placeholder="Contoh: PRY-2023-05 atau SPK-MND-001"
                lazy-rules
                :rules="[(val) => !!val || 'Nomor SPK/Proyek wajib diisi']"
              >
                <template v-slot:prepend><q-icon name="foundation" color="indigo-10" /></template>
              </q-input>

              <q-separator />

              <!-- Section: Item Barang -->
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-icon name="local_shipping" color="indigo-10" size="sm" />
                <div class="text-subtitle1 text-weight-bold text-grey-8">Detail Alokasi Item</div>
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-select
                    filled
                    v-model="form.kategori"
                    label="Pilih Kategori"
                    :options="kategoriOptions"
                    option-label="nama"
                    option-value="id"
                    emit-value
                    map-options
                    @update:model-value="onKategoriChange"
                    :rules="[(val) => !!val || 'Pilih kategori']"
                  >
                    <template v-slot:prepend><q-icon name="category" color="primary" /></template>
                  </q-select>
                </div>

                <div class="col-12 col-sm-6">
                  <q-select
                    filled
                    v-model="form.barang"
                    label="Pilih Barang Tersedia"
                    :options="filteredBarangOptions"
                    option-label="nama_barang"
                    option-value="id"
                    :disable="!form.kategori"
                    use-input
                    @filter="filterBarang"
                    @update:model-value="onBarangChange"
                    :rules="[(val) => !!val || 'Pilih barang']"
                  >
                    <template v-slot:prepend><q-icon name="reorder" color="primary" /></template>
                    <template v-slot:no-option>
                      <q-item
                        ><q-item-section class="text-grey text-caption"
                          >Barang tidak tersedia di gudang ini</q-item-section
                        ></q-item
                      >
                    </template>
                  </q-select>
                </div>
              </div>

              <div class="row q-col-gutter-md items-center">
                <div class="col-12 col-sm-6">
                  <q-input
                    filled
                    v-model.number="form.jumlah"
                    label="Jumlah Keluar"
                    type="number"
                    lazy-rules
                    :rules="[
                      (val) => val > 0 || 'Jumlah harus lebih dari 0',
                      (val) =>
                        (form.barang && val <= currentStokValue) || 'Melebihi stok yang tersedia!',
                    ]"
                    class="text-h6"
                  >
                    <template v-slot:append>
                      <q-badge color="grey-2" text-color="grey-9" class="q-pa-sm text-weight-bold">
                        {{ form.satuan || '-' }}
                      </q-badge>
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-6" v-if="form.barang">
                  <div class="q-pa-md bg-indigo-1 rounded-borders border-dashed-indigo text-center">
                    <div class="text-caption text-grey-7">Stok Siap Kirim</div>
                    <div class="text-h6 text-indigo-10 text-weight-bolder">
                      {{ currentStokValue }} {{ form.satuan }}
                    </div>
                  </div>
                </div>
              </div>

              <q-input
                filled
                v-model="form.catatan"
                label="Catatan Pengiriman"
                type="textarea"
                rows="3"
                placeholder="Tuliskan detail penerima atau instruksi pengiriman khusus..."
              />

              <div class="q-mt-xl">
                <q-btn
                  label="Proses Barang Keluar"
                  type="submit"
                  color="indigo-10"
                  class="full-width rounded-borders text-weight-bold"
                  size="lg"
                  unelevated
                  icon="send"
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const gudangId = route.params.id

const loading = ref(false)
const form = ref({ noSpk: '', kategori: null, barang: null, jumlah: 0, catatan: '', satuan: '' })
const kategoriOptions = ref([])
const stokBarangList = ref([])
const filteredBarangOptions = ref([])
const currentStokValue = ref(0)

// Fetch stok yang hanya tersedia di gudang ini
const fetchData = async () => {
  // Ambil Kategori
  const catSnap = await getDocs(collection(db, 'kategori_barang'))
  kategoriOptions.value = catSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  // Ambil Stok yang tersedia di gudang ini saja
  const q = query(collection(db, 'stok_barang'), where('id_gudang', '==', gudangId))
  const snap = await getDocs(q)
  stokBarangList.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

const onKategoriChange = (val) => {
  form.value.barang = null
  filteredBarangOptions.value = []

  getDocs(collection(db, 'barang')).then((barSnap) => {
    const masterItems = barSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    const validIds = masterItems.filter((m) => m.id_kategori === val).map((m) => m.id)

    filteredBarangOptions.value = stokBarangList.value.filter((s) => validIds.includes(s.id_barang))
  })
}

const filterBarang = (val, update) => {
  update(() => {
    // Filter lokal sudah ditangani di onKategoriChange
  })
}

const onBarangChange = (val) => {
  if (val) {
    form.value.satuan = val.satuan || ''
    currentStokValue.value = val.jumlah || 0
  }
}

const prosesBarangKeluar = async () => {
  if (form.value.jumlah > currentStokValue.value) {
    $q.notify({ type: 'negative', message: 'Stok tidak mencukupi!' })
    return
  }

  loading.value = true
  try {
    const item = form.value.barang
    const jml = Number(form.value.jumlah)

    // 1. Kurangi stok di koleksi 'stok_barang'
    const docRef = doc(db, 'stok_barang', item.id)
    await updateDoc(docRef, {
      jumlah: increment(-jml),
      updated_at: serverTimestamp(),
    })

    // 2. Simpan record mutasi di koleksi 'aktivitas'
    await addDoc(collection(db, 'aktivitas'), {
      id_gudang: gudangId,
      nama_barang: item.nama_barang,
      jumlah: jml,
      tipe: 'KELUAR',
      no_spk: form.value.noSpk,
      keterangan: form.value.catatan,
      timestamp: serverTimestamp(),
    })

    $q.notify({ type: 'positive', message: 'Barang berhasil dikeluarkan!', position: 'top' })
    router.back()
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Gagal mengeluarkan barang: ' + e.message })
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
.font-pro {
  font-family: 'Inter', sans-serif;
}
.rounded-borders {
  border-radius: 16px;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.border-dashed-indigo {
  border: 2px dashed #e8eaf6;
}
</style>
