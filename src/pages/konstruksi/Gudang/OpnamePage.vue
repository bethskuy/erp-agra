<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center q-mb-lg">
      <q-btn flat icon="arrow_back" label="Kembali" @click="$router.back()" class="q-mr-sm" />
      <div>
        <div class="text-h5 text-weight-bold text-primary">Stok Opname</div>
        <div class="text-caption text-grey-7">
          Penyesuaian stok fisik di Gudang ID: {{ gudangId }}
        </div>
      </div>
    </div>

    <div class="row justify-center">
      <div class="col-12 col-md-6">
        <q-card flat bordered class="rounded-borders shadow-2">
          <q-card-section class="q-pa-lg">
            <q-form @submit="prosesOpname" class="q-gutter-md">
              <q-select
                outlined
                v-model="form.barang"
                label="Pilih Barang"
                :options="daftarBarang"
                option-label="nama_barang"
                @update:model-value="onBarangSelect"
                lazy-rules
                :rules="[(val) => !!val || 'Pilih barang']"
              />

              <q-input
                v-if="form.barang"
                outlined
                disable
                v-model.number="form.stokSistem"
                label="Stok di Sistem"
                type="number"
              />

              <q-input
                outlined
                v-model.number="form.stokFisik"
                label="Stok Fisik (Hasil Opname)"
                type="number"
                lazy-rules
                :rules="[(val) => val >= 0 || 'Jumlah tidak valid']"
              />

              <q-input
                outlined
                v-model="form.catatan"
                label="Catatan / Alasan Selisih"
                type="textarea"
              />

              <div class="q-mt-lg">
                <q-btn
                  label="Simpan Hasil Opname"
                  type="submit"
                  color="primary"
                  class="full-width"
                  size="lg"
                  unelevated
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
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
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const gudangId = route.params.id

const form = ref({ barang: null, stokSistem: 0, stokFisik: 0, catatan: '' })
const daftarBarang = ref([])

const fetchBarang = async () => {
  const q = query(collection(db, 'stok_barang'), where('id_gudang', '==', gudangId))
  const snap = await getDocs(q)
  daftarBarang.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

const onBarangSelect = (val) => {
  form.value.stokSistem = val ? val.jumlah : 0
}

const prosesOpname = async () => {
  try {
    // 1. Update jumlah stok menjadi nilai fisik yang baru
    const docRef = doc(db, 'stok_barang', form.value.barang.id)
    await updateDoc(docRef, { jumlah: form.value.stokFisik })

    // 2. Simpan record opname di koleksi 'aktivitas'
    await addDoc(collection(db, 'aktivitas'), {
      id_gudang: gudangId,
      nama_barang: form.value.barang.nama_barang,
      stok_sebelum: form.value.stokSistem,
      stok_sesudah: form.value.stokFisik,
      tipe: 'OPNAME',
      catatan: form.value.catatan,
      timestamp: serverTimestamp(),
    })

    $q.notify({ type: 'positive', message: 'Data opname berhasil disimpan!' })
    router.back()
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Gagal simpan opname: ' + e.message })
  }
}

onMounted(fetchBarang)
</script>

<style scoped>
.rounded-borders {
  border-radius: 16px;
}
</style>
