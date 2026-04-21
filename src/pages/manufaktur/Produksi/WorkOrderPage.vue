<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <!-- HEADER -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-teal-10">Work Order</div>
        <div class="text-subtitle2 text-grey-6">Manajemen perintah produksi</div>
      </div>

      <q-btn color="primary" icon="add" label="Tambah WO" @click="openTambah" />
    </div>

    <!-- TABLE -->
    <q-card flat class="rounded-borders shadow-sm">
      <q-table :rows="rows" :columns="columns" row-key="id" flat bordered>
        <!-- STATUS -->
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="getStatusColor(props.value)">
              {{ props.value }}
            </q-badge>
          </q-td>
        </template>

        <!-- PROGRESS -->
        <template v-slot:body-cell-progress="props">
          <q-td :props="props">
            <q-linear-progress :value="props.row.progress / 100" color="teal" size="10px" rounded />
            <div class="text-caption q-mt-xs">{{ props.row.progress }}%</div>
          </q-td>
        </template>

        <!-- ACTION -->
        <template v-slot:body-cell-actions="props">
          <q-td>
            <!-- 🔥 DETAIL -->
            <q-btn dense flat icon="visibility" color="primary" @click="goDetail(props.row.id)" />

            <!-- EDIT -->
            <q-btn dense flat icon="edit" color="warning" @click="editWO(props.row)" />

            <!-- DELETE -->
            <q-btn dense flat icon="delete" color="negative" @click="hapusWO(props.row.id)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- DIALOG -->
    <q-dialog v-model="dialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ isEdit ? 'Edit Work Order' : 'Tambah Work Order' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.kode" label="Kode WO" />
          <q-input v-model="form.produk" label="Produk" />
          <q-input v-model.number="form.jumlah" type="number" label="Jumlah Order" />
          <q-input v-model="form.tanggal" type="date" label="Tanggal" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Batal" v-close-popup />
          <q-btn color="primary" label="Simpan" @click="simpanWO" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// FIREBASE
import { db } from 'src/boot/firebase'
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'

const router = useRouter()

// ================= TABLE =================
const columns = [
  { name: 'kode', label: 'Kode WO', field: 'kode' },
  { name: 'produk', label: 'Produk', field: 'produk' },
  { name: 'jumlah', label: 'Jumlah', field: 'jumlah' },
  { name: 'tanggal', label: 'Tanggal', field: 'tanggal' },
  { name: 'status', label: 'Status', field: 'status' },
  { name: 'progress', label: 'Progress', field: 'progress' },
  { name: 'actions', label: 'Aksi', field: 'actions' },
]

const rows = ref([])

// ================= STATE =================
const dialog = ref(false)
const isEdit = ref(false)
const selectedId = ref(null)

const form = ref({
  kode: '',
  produk: '',
  jumlah: 0,
  tanggal: '',
})

// ================= GET DATA =================
const getData = async () => {
  const woSnap = await getDocs(collection(db, 'work_orders'))
  const resultSnap = await getDocs(collection(db, 'production_results'))

  const results = resultSnap.docs.map((d) => d.data())

  rows.value = woSnap.docs.map((docSnap) => {
    const data = docSnap.data()

    // 🔥 TOTAL HASIL PRODUKSI
    const totalHasil = results
      .filter((r) => r.work_order_id === docSnap.id)
      .reduce((sum, r) => sum + Number(r.jumlah_hasil || 0), 0)

    // 🔥 PROGRESS REAL ERP
    let progress = 0
    if (data.jumlah > 0) {
      progress = Math.min(100, Math.round((totalHasil / data.jumlah) * 100))
    }

    // 🔥 STATUS AUTO
    let status = 'Pending'
    if (progress > 0) status = 'Proses'
    if (progress >= 100) status = 'Selesai'

    return {
      id: docSnap.id,
      ...data,
      progress,
      status,
    }
  })
}

// ================= NAVIGATE =================
const goDetail = (id) => {
  router.push(`/manufaktur/work-order/${id}`)
}

// ================= CRUD =================
const openTambah = () => {
  form.value = { kode: '', produk: '', jumlah: 0, tanggal: '' }
  isEdit.value = false
  dialog.value = true
}

const editWO = (row) => {
  form.value = { ...row }
  selectedId.value = row.id
  isEdit.value = true
  dialog.value = true
}

const simpanWO = async () => {
  if (isEdit.value) {
    await updateDoc(doc(db, 'work_orders', selectedId.value), form.value)
  } else {
    await addDoc(collection(db, 'work_orders'), {
      ...form.value,
    })
  }

  dialog.value = false
  getData()
}

const hapusWO = async (id) => {
  await deleteDoc(doc(db, 'work_orders', id))
  getData()
}

// ================= COLOR =================
const getStatusColor = (status) => {
  if (status === 'Pending') return 'grey'
  if (status === 'Proses') return 'orange'
  if (status === 'Selesai') return 'positive'
}

// ================= LOAD =================
onMounted(() => {
  getData()
})
</script>
