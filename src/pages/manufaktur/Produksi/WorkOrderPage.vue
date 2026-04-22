<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-teal-10">Work Order</div>
        <div class="text-subtitle2 text-grey-6">
          Manajemen perintah produksi & kontrol stok otomatis
        </div>
      </div>

      <q-btn
        color="teal-10"
        icon="add"
        label="Tambah WO"
        @click="openTambah"
        class="rounded-borders shadow-sm"
      />
    </div>

    <q-card flat class="rounded-borders shadow-sm">
      <q-table :rows="rows" :columns="columns" row-key="id" flat bordered>
        <template v-slot:body-cell-kode="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              color="teal-10"
              class="text-weight-bold"
              :label="props.value"
              @click="goDetail(props.row)"
            >
              <q-tooltip>Klik untuk detail produksi</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="getStatusColor(props.value)" class="q-pa-xs">
              {{ props.value }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-progress="props">
          <q-td :props="props">
            <q-linear-progress :value="props.value / 100" color="teal" size="10px" rounded />
            <div class="text-caption q-mt-xs">{{ props.value }}%</div>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="q-gutter-xs">
            <q-btn
              v-if="props.row.status !== 'Selesai'"
              dense
              flat
              icon="check_circle"
              color="positive"
              @click="confirmFinish(props.row)"
            >
              <q-tooltip>Selesaikan & Potong Stok</q-tooltip>
            </q-btn>

            <q-btn dense flat icon="visibility" color="teal-10" @click="goDetail(props.row)">
              <q-tooltip>Lihat Detail</q-tooltip>
            </q-btn>
            <q-btn dense flat icon="edit" color="primary" @click="editWO(props.row)" />
            <q-btn dense flat icon="delete" color="negative" @click="hapusWO(props.row.id)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 450px" class="rounded-borders">
        <q-card-section class="bg-teal-10 text-white row items-center">
          <div class="text-h6">{{ isEdit ? 'Edit Work Order' : 'Tambah Work Order' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md q-pt-lg">
          <q-input outlined dense v-model="form.kode" label="Kode WO" placeholder="Contoh: WO223" />
          <q-input
            outlined
            dense
            v-model="form.produk"
            label="Nama Produk"
            placeholder="Harus sama dengan nama di BOM"
          />
          <q-input
            outlined
            dense
            v-model.number="form.jumlah"
            type="number"
            label="Jumlah Produksi"
          />
          <q-input
            outlined
            dense
            v-model="form.tanggal"
            type="date"
            label="Tanggal Perintah"
            stack-label
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Batal" color="grey-7" v-close-popup />
          <q-btn color="teal-10" label="Simpan Data" @click="simpanWO" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  increment,
} from 'firebase/firestore'

const router = useRouter()
const $q = useQuasar()

const columns = [
  { name: 'kode', label: 'Kode WO', field: 'kode', align: 'left', sortable: true },
  { name: 'produk', label: 'Produk', field: 'produk', align: 'left', sortable: true },
  { name: 'jumlah', label: 'Qty', field: 'jumlah', align: 'center' },
  { name: 'tanggal', label: 'Tanggal', field: 'tanggal', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'progress', label: 'Progress', field: 'progress', align: 'center' },
  { name: 'actions', label: 'Aksi', align: 'center' },
]

const rows = ref([])
const dialog = ref(false)
const isEdit = ref(false)
const selectedId = ref(null)

const form = ref({
  kode: '',
  produk: '',
  jumlah: 0,
  tanggal: '',
})

const getData = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'work_orders'))
    rows.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (err) {
    console.error('Gagal ambil WO:', err)
  }
}

const goDetail = (row) => {
  router.push(`/manufaktur/work-order/${row.id}`)
}

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
  try {
    if (isEdit.value) {
      await updateDoc(doc(db, 'work_orders', selectedId.value), { ...form.value })
    } else {
      await addDoc(collection(db, 'work_orders'), {
        ...form.value,
        status: 'Pending',
        progress: 0,
        createdAt: new Date(),
      })
    }
    dialog.value = false
    getData()
    $q.notify({ color: 'positive', icon: 'done', message: 'Berhasil disimpan' })
  } catch {
    $q.notify({ color: 'negative', message: 'Gagal simpan data' })
  }
}

const confirmFinish = (row) => {
  $q.dialog({
    title: 'Selesaikan Produksi?',
    message: `Aksi ini akan menandai WO ${row.kode} selesai dan memotong stok material.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    processFinishProduction(row)
  })
}

const processFinishProduction = async (wo) => {
  $q.loading.show({ message: 'Memproses inventori...' })
  try {
    const q = query(collection(db, 'boms'), where('productName', '==', wo.produk))
    const bomSnap = await getDocs(q)

    if (!bomSnap.empty) {
      const bomData = bomSnap.docs[0].data()
      for (const item of bomData.materials) {
        const materialRef = doc(db, 'materials', item.materialId)
        await updateDoc(materialRef, {
          stok: increment(-(wo.jumlah * item.qty)),
        })
      }
    }

    await updateDoc(doc(db, 'work_orders', wo.id), {
      status: 'Selesai',
      progress: 100,
    })

    $q.notify({ color: 'positive', icon: 'check', message: 'Produksi Selesai & Stok Terpotong!' })
    getData()
  } catch {
    $q.notify({ color: 'negative', message: 'Gagal proses stok' })
  } finally {
    $q.loading.hide()
  }
}

const hapusWO = async (id) => {
  $q.dialog({ title: 'Hapus?', message: 'Data akan hilang permanen.', cancel: true }).onOk(
    async () => {
      try {
        await deleteDoc(doc(db, 'work_orders', id))
        getData()
      } catch (e) {
        console.error(e)
      }
    },
  )
}

const getStatusColor = (status) => {
  if (status === 'Pending') return 'grey-7'
  if (status === 'Proses') return 'orange-9'
  if (status === 'Selesai') return 'positive'
  return 'primary'
}

onMounted(getData)
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
.shadow-sm {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
</style>
