<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center q-mb-lg">
      <q-btn flat icon="arrow_back" label="Kembali" @click="$router.back()" class="q-mr-sm" />
      <div>
        <div class="text-h5 text-weight-bold text-orange">Barang Keluar</div>
        <div class="text-caption text-grey-7">
          Output material ke proyek dari Gudang ID: {{ gudangId }}
        </div>
      </div>
    </div>

    <div class="row justify-center">
      <div class="col-12 col-md-6">
        <q-card flat bordered class="rounded-borders shadow-2">
          <q-card-section class="q-pa-lg">
            <q-form @submit="prosesBarangKeluar" class="q-gutter-md">
              <q-input
                outlined
                v-model="form.noSpk"
                label="No. Proyek / SPK"
                lazy-rules
                :rules="[(val) => !!val || 'Wajib diisi']"
              />

              <q-select
                outlined
                v-model="form.barang"
                label="Pilih Barang"
                :options="daftarBarang"
                option-label="nama_barang"
                lazy-rules
                :rules="[(val) => !!val || 'Pilih barang']"
              />

              <q-input
                outlined
                v-model.number="form.jumlah"
                label="Jumlah Keluar"
                type="number"
                :hint="form.barang ? 'Stok tersedia: ' + form.barang.jumlah : ''"
                lazy-rules
                :rules="[
                  (val) => val > 0 || 'Jumlah harus lebih dari 0',
                  (val) =>
                    (form.barang && val <= form.barang.jumlah) || 'Jumlah melebihi stok tersedia!',
                ]"
              />

              <q-input outlined v-model="form.catatan" label="Catatan Pengiriman" type="textarea" />

              <div class="q-mt-lg">
                <q-btn
                  label="Simpan Barang Keluar"
                  type="submit"
                  color="orange"
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
  increment,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const gudangId = route.params.id

const form = ref({ noSpk: '', barang: null, jumlah: 0, catatan: '' })
const daftarBarang = ref([])

const fetchBarang = async () => {
  const q = query(collection(db, 'stok_barang'), where('id_gudang', '==', gudangId))
  const snap = await getDocs(q)
  daftarBarang.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

const prosesBarangKeluar = async () => {
  try {
    // 1. Kurangi stok menggunakan angka negatif (increment -jumlah)
    const docRef = doc(db, 'stok_barang', form.value.barang.id)
    await updateDoc(docRef, { jumlah: increment(-form.value.jumlah) })

    // 2. Simpan record mutasi di koleksi 'aktivitas'
    await addDoc(collection(db, 'aktivitas'), {
      id_gudang: gudangId,
      nama_barang: form.value.barang.nama_barang,
      jumlah: form.value.jumlah,
      tipe: 'KELUAR',
      no_spk: form.value.noSpk,
      timestamp: serverTimestamp(),
    })

    $q.notify({ type: 'positive', message: 'Barang berhasil dikeluarkan!' })
    router.back()
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Gagal mengeluarkan barang: ' + e.message })
  }
}

onMounted(fetchBarang)
</script>

<style scoped>
.rounded-borders {
  border-radius: 16px;
}
</style>
