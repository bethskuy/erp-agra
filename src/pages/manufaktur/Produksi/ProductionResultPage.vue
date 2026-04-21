<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <!-- HEADER -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-teal-10">Production Result</div>
        <div class="text-subtitle2 text-grey-6">Hasil produksi</div>
      </div>

      <q-btn color="primary" icon="add" label="Tambah Hasil" @click="openDialog" />
    </div>

    <!-- TABLE -->
    <q-card flat class="rounded-borders shadow-sm">
      <q-table :rows="rows" :columns="columns" row-key="id">
        <!-- EMPTY -->
        <template v-slot:no-data>
          <div class="full-width text-center q-pa-md text-grey">Belum ada hasil produksi 🚧</div>
        </template>

        <!-- ACTION -->
        <template v-slot:body-cell-actions="props">
          <q-td>
            <q-btn dense flat icon="delete" color="negative" @click="hapusData(props.row.id)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- DIALOG -->
    <q-dialog v-model="dialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Input Hasil Produksi</div>
        </q-card-section>

        <q-card-section>
          <!-- PILIH WO -->
          <q-select
            v-model="form.work_order_id"
            :options="woOptions"
            label="Pilih Work Order"
            option-label="kode"
            option-value="id"
            emit-value
            map-options
          />

          <q-input v-model.number="form.jumlah_hasil" type="number" label="Jumlah Hasil" />

          <q-input v-model="form.keterangan" label="Keterangan" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Batal" v-close-popup />
          <q-btn color="primary" label="Simpan" @click="simpanData" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

// 🔥 FIREBASE
import { db } from 'src/boot/firebase'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs,
  query,
  where,
  updateDoc,
} from 'firebase/firestore'

const $q = useQuasar()

// ================= STATE =================
const dialog = ref(false)
const rows = ref([])
const woOptions = ref([])

const form = ref({
  work_order_id: '',
  jumlah_hasil: 0,
  keterangan: '',
})

// ================= TABLE =================
const columns = [
  { name: 'wo', label: 'Work Order', field: 'wo' },
  { name: 'jumlah_hasil', label: 'Jumlah Hasil', field: 'jumlah_hasil' },
  { name: 'keterangan', label: 'Keterangan', field: 'keterangan' },
  { name: 'actions', label: 'Aksi', field: 'actions' },
]

// ================= GET WO =================
const getWO = async () => {
  const snapshot = await getDocs(collection(db, 'work_orders'))

  woOptions.value = snapshot.docs.map((doc) => ({
    id: doc.id,
    kode: doc.data().kode,
  }))
}

// ================= GET DATA =================
const getData = () => {
  onSnapshot(collection(db, 'production_results'), (snapshot) => {
    rows.value = snapshot.docs.map((docSnap) => {
      const data = docSnap.data()

      const wo = woOptions.value.find((w) => w.id === data.work_order_id)

      return {
        id: docSnap.id,
        ...data,
        wo: wo ? wo.kode : '-',
      }
    })
  })
}

// ================= OPEN =================
const openDialog = () => {
  form.value = {
    work_order_id: '',
    jumlah_hasil: 0,
    keterangan: '',
  }
  dialog.value = true
}

// ================= SIMPAN (ANTI DOUBLE) =================
const simpanData = async () => {
  if (!form.value.work_order_id) {
    $q.notify({
      type: 'negative',
      message: 'Pilih Work Order dulu!',
    })
    return
  }

  // 🔥 CEK DATA EXIST
  const q = query(
    collection(db, 'production_results'),
    where('work_order_id', '==', form.value.work_order_id),
  )

  const snapshot = await getDocs(q)

  if (!snapshot.empty) {
    // ✅ UPDATE (bukan tambah baru)
    const docId = snapshot.docs[0].id

    await updateDoc(doc(db, 'production_results', docId), {
      jumlah_hasil: form.value.jumlah_hasil,
      keterangan: form.value.keterangan,
    })

    $q.notify({
      type: 'info',
      message: 'Data diupdate (tidak duplicate) 🔄',
    })
  } else {
    // ✅ INSERT
    await addDoc(collection(db, 'production_results'), form.value)

    $q.notify({
      type: 'positive',
      message: 'Hasil produksi ditambahkan 🔥',
    })
  }

  dialog.value = false
}

// ================= DELETE =================
const hapusData = async (id) => {
  await deleteDoc(doc(db, 'production_results', id))

  $q.notify({
    type: 'negative',
    message: 'Data dihapus 🗑️',
  })
}

// ================= LOAD =================
onMounted(async () => {
  await getWO()
  getData()
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
</style>
