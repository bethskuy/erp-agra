<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <!-- HEADER -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-teal-10">Production Steps</div>
        <div class="text-subtitle2 text-grey-6">Detail proses produksi</div>
      </div>

      <q-btn color="primary" icon="add" label="Tambah Step" @click="openDialog" />
    </div>

    <!-- TABLE -->
    <q-card flat class="rounded-borders shadow-sm">
      <q-table :rows="rows" :columns="columns" row-key="id">
        <!-- STATUS -->
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="getStatusColor(props.value)">
              {{ props.value }}
            </q-badge>
          </q-td>
        </template>

        <!-- ACTION -->
        <template v-slot:body-cell-actions="props">
          <q-td>
            <q-btn dense flat icon="delete" color="negative" @click="hapusStep(props.row.id)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- DIALOG -->
    <q-dialog v-model="dialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Tambah Production Step</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="form.work_order_id"
            :options="woOptions"
            label="Pilih Work Order"
            option-label="kode"
            option-value="id"
            emit-value
            map-options
          />

          <q-input v-model="form.nama_step" label="Nama Step" />

          <q-select v-model="form.status" :options="statusOptions" label="Status" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Batal" v-close-popup />
          <q-btn color="primary" label="Simpan" @click="simpanStep" />
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

const statusOptions = ['Pending', 'Proses', 'Selesai']

const form = ref({
  work_order_id: '',
  nama_step: '',
  status: 'Pending',
})

// ================= TABLE =================
const columns = [
  { name: 'wo', label: 'Work Order', field: 'wo' },
  { name: 'nama_step', label: 'Step', field: 'nama_step' },
  { name: 'status', label: 'Status', field: 'status' },
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

// ================= REALTIME STEP =================
const getSteps = () => {
  onSnapshot(collection(db, 'production_steps'), (snapshot) => {
    rows.value = snapshot.docs.map((doc) => {
      const data = doc.data()

      const wo = woOptions.value.find((w) => w.id === data.work_order_id)

      return {
        id: doc.id,
        ...data,
        wo: wo ? wo.kode : '-',
      }
    })
  })
}

// ================= HITUNG PROGRESS WO =================
const hitungProgressWO = async (woId) => {
  const q = query(collection(db, 'production_steps'), where('work_order_id', '==', woId))

  const snapshot = await getDocs(q)

  let total = 0

  snapshot.forEach((doc) => {
    const status = doc.data().status

    if (status === 'Pending') total += 0
    if (status === 'Proses') total += 50
    if (status === 'Selesai') total += 100
  })

  const count = snapshot.size || 1
  const progress = Math.round(total / count)

  await updateDoc(doc(db, 'work_orders', woId), {
    progress,
  })
}

// ================= TAMBAH =================
const openDialog = () => {
  form.value = {
    work_order_id: '',
    nama_step: '',
    status: 'Pending',
  }
  dialog.value = true
}

// ================= SIMPAN =================
const simpanStep = async () => {
  await addDoc(collection(db, 'production_steps'), form.value)

  await hitungProgressWO(form.value.work_order_id)

  dialog.value = false

  $q.notify({
    type: 'positive',
    message: 'Step berhasil ditambahkan 🔥',
  })
}

// ================= DELETE =================
const hapusStep = async (id) => {
  const q = await getDocs(collection(db, 'production_steps'))

  let woId = null

  q.forEach((d) => {
    if (d.id === id) {
      woId = d.data().work_order_id
    }
  })

  await deleteDoc(doc(db, 'production_steps', id))

  if (woId) {
    await hitungProgressWO(woId)
  }

  $q.notify({
    type: 'negative',
    message: 'Step dihapus 🗑️',
  })
}

// ================= COLOR =================
const getStatusColor = (status) => {
  if (status === 'Pending') return 'grey'
  if (status === 'Proses') return 'orange'
  if (status === 'Selesai') return 'positive'
}

// ================= LOAD =================
onMounted(async () => {
  await getWO()
  getSteps()
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
</style>
