<template>
  <q-page class="bg-grey-2 q-pa-lg font-pro">
    <!-- Header Page -->
    <div class="row items-center q-mb-xl">
      <q-btn flat round color="grey-7" icon="arrow_back" @click="$router.back()" class="q-mr-md" />
      <div>
        <div class="text-h5 text-weight-bold text-indigo-10 text-uppercase letter-spacing-1">
          Penerimaan Barang Masuk
        </div>
        <div class="text-caption text-grey-7">
          Logistik & Penerimaan Material - Gudang ID:
          <q-badge color="grey-3" text-color="grey-9" :label="gudangId || 'UTAMA'" />
        </div>
      </div>
    </div>

    <!-- Form Section -->
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <q-card flat bordered class="rounded-borders shadow-2 bg-white">
          <q-card-section class="q-pa-xl">
            <q-form @submit="prosesBarangMasuk" class="q-gutter-y-lg">
              <!-- Section: Dokumen -->
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-icon name="description" color="indigo-10" size="sm" />
                <div class="text-subtitle1 text-weight-bold text-grey-8">Dokumen Referensi</div>
              </div>

              <q-input
                filled
                v-model="form.noReferensi"
                label="No. PO / Surat Jalan"
                placeholder="Contoh: PO-2023-001 atau SJ-ABC-123"
                lazy-rules
                :rules="[(val) => !!val || 'Nomor referensi wajib diisi']"
              >
                <template v-slot:prepend><q-icon name="tag" color="indigo-10" /></template>
              </q-input>

              <q-separator />

              <!-- Section: Item Barang -->
              <div class="row items-center q-gutter-sm q-mb-sm">
                <q-icon name="inventory_2" color="indigo-10" size="sm" />
                <div class="text-subtitle1 text-weight-bold text-grey-8">Detail Item</div>
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
                    label="Pilih Barang"
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
                          >Barang tidak ditemukan</q-item-section
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
                    label="Jumlah Masuk"
                    type="number"
                    lazy-rules
                    :rules="[(val) => val > 0 || 'Jumlah harus lebih dari 0']"
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
                    <div class="text-caption text-grey-7">Stok Saat Ini</div>
                    <div class="text-h6 text-indigo-10 text-weight-bolder">
                      {{ currentStokValue }} {{ form.satuan }}
                    </div>
                  </div>
                </div>
              </div>

              <q-input
                filled
                v-model="form.catatan"
                label="Catatan Tambahan"
                type="textarea"
                rows="3"
                placeholder="Informasi tambahan mengenai kondisi barang atau pengiriman..."
              />

              <div class="q-mt-xl">
                <q-btn
                  label="Simpan Barang Masuk"
                  type="submit"
                  color="indigo-10"
                  class="full-width rounded-borders text-weight-bold"
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
const form = ref({
  noReferensi: '',
  kategori: null,
  barang: null,
  jumlah: 0,
  catatan: '',
  satuan: '',
})
const kategoriOptions = ref([])
const masterBarang = ref([])
const filteredBarangOptions = ref([])
const currentStokValue = ref(0)

// Fetch master data
const fetchData = async () => {
  const catSnap = await getDocs(collection(db, 'kategori_barang'))
  kategoriOptions.value = catSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  const barSnap = await getDocs(collection(db, 'barang'))
  masterBarang.value = barSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

const onKategoriChange = (val) => {
  form.value.barang = null
  filteredBarangOptions.value = masterBarang.value.filter((b) => b.id_kategori === val)
}

const filterBarang = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    filteredBarangOptions.value = masterBarang.value.filter(
      (b) =>
        b.id_kategori === form.value.kategori && b.nama_barang.toLowerCase().indexOf(needle) > -1,
    )
  })
}

const onBarangChange = async (val) => {
  if (val) {
    form.value.satuan = val.satuan || ''
    // Cek stok real-time di gudang terpilih
    const q = query(
      collection(db, 'stok_barang'),
      where('id_gudang', '==', gudangId),
      where('id_barang', '==', val.id),
    )
    const snap = await getDocs(q)
    currentStokValue.value = snap.empty ? 0 : snap.docs[0].data().jumlah
  }
}

const prosesBarangMasuk = async () => {
  loading.value = true
  try {
    const item = form.value.barang
    const jml = Number(form.value.jumlah)

    // 1. Update atau Create di koleksi 'stok_barang'
    const qStok = query(
      collection(db, 'stok_barang'),
      where('id_gudang', '==', gudangId),
      where('id_barang', '==', item.id),
    )
    const snapStok = await getDocs(qStok)

    if (!snapStok.empty) {
      await updateDoc(doc(db, 'stok_barang', snapStok.docs[0].id), {
        jumlah: increment(jml),
        updated_at: serverTimestamp(),
      })
    } else {
      await addDoc(collection(db, 'stok_barang'), {
        id_gudang: gudangId,
        id_barang: item.id,
        nama_barang: item.nama_barang,
        jumlah: jml,
        satuan: item.satuan,
        created_at: serverTimestamp(),
      })
    }

    // 2. Simpan record di koleksi 'aktivitas' (Mutasi)
    await addDoc(collection(db, 'aktivitas'), {
      id_gudang: gudangId,
      nama_barang: item.nama_barang,
      jumlah: jml,
      tipe: 'MASUK',
      no_referensi: form.value.noReferensi,
      keterangan: form.value.catatan,
      timestamp: serverTimestamp(),
    })

    $q.notify({ type: 'positive', message: 'Stok berhasil masuk!', position: 'top' })
    router.back()
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Gagal update stok: ' + e.message })
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
