<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-teal-10">Work Order</div>
        <div class="text-subtitle2 text-grey-6">
          Manajemen perintah produksi & kontrol stok otomatis
        </div>
      </div>

      <q-btn color="primary" icon="add" label="Tambah WO" @click="openTambah" />
    </div>

    <q-card flat class="rounded-borders shadow-sm">
      <q-table :rows="rows" :columns="columns" row-key="id" flat bordered>
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="getStatusColor(props.value)">
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

            <q-btn dense flat icon="visibility" color="primary" @click="goDetail(props.row)" />
            <q-btn dense flat icon="edit" color="primary" @click="editWO(props.row)" />
            <q-btn dense flat icon="delete" color="negative" @click="hapusWO(props.row.id)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ isEdit ? 'Edit Work Order' : 'Tambah Work Order' }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-sm">
          <q-input outlined v-model="form.kode" label="Kode WO" />
          <q-input
            outlined
            v-model="form.produk"
            label="Nama Produk (Sama dengan Nama di BOM)"
            placeholder="Contoh: Helm Full Face"
          />
          <q-input outlined v-model.number="form.jumlah" type="number" label="Jumlah Produksi" />
          <q-input outlined v-model="form.tanggal" type="date" label="Tanggal" stack-label />
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
import { useQuasar } from 'quasar'

// FIREBASE
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
  { name: 'kode', label: 'Kode WO', field: 'kode', align: 'left' },
  { name: 'produk', label: 'Produk', field: 'produk', align: 'left' },
  { name: 'jumlah', label: 'Jumlah', field: 'jumlah', align: 'center' },
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

// MENGAMBIL DATA DARI FIREBASE
const getData = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'work_orders'))
    rows.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Gagal mengambil data WO:', error)
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
    $q.notify({ color: 'positive', message: 'Data berhasil disimpan' })
  } catch (error) {
    console.error('Gagal simpan WO:', error)
    $q.notify({ color: 'negative', message: 'Gagal menyimpan data' })
  }
}

// 🔥 LOGIKA INTI: PROSES SELESAI & POTONG STOK
const confirmFinish = (row) => {
  $q.dialog({
    title: 'Selesaikan Produksi?',
    message: `Aksi ini akan menandai WO selesai dan memotong stok material di inventori secara otomatis.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    processFinishProduction(row)
  })
}

const processFinishProduction = async (wo) => {
  $q.loading.show({ message: 'Menghubungkan ke inventori...' })
  try {
    // 1. Cari resep di koleksi BOM berdasarkan nama produk
    const bomRef = collection(db, 'boms')
    const q = query(bomRef, where('productName', '==', wo.produk))
    const bomSnap = await getDocs(q)

    if (bomSnap.empty) {
      $q.notify({
        color: 'warning',
        icon: 'warning',
        message: 'BOM tidak ditemukan! Status diupdate tanpa potong stok.',
      })
    } else {
      const bomData = bomSnap.docs[0].data()

      // 2. Loop setiap bahan di resep dan kurangi stok di Master Material
      for (const item of bomData.materials) {
        const materialRef = doc(db, 'materials', item.materialId)
        await updateDoc(materialRef, {
          // Stok berkurang = -(jumlah produksi WO * kebutuhan bahan di BOM)
          stok: increment(-(wo.jumlah * item.qty)),
        })
      }
    }

    // 3. Update status WO menjadi Selesai & Progress 100%
    await updateDoc(doc(db, 'work_orders', wo.id), {
      status: 'Selesai',
      progress: 100,
    })

    $q.notify({
      color: 'positive',
      icon: 'done',
      message: 'Produksi Selesai & Stok Berhasil Dipotong!',
    })
    getData()
  } catch (error) {
    console.error('Gagal proses selesai:', error)
    $q.notify({ color: 'negative', message: 'Gagal memproses pemotongan stok' })
  } finally {
    $q.loading.hide()
  }
}

const hapusWO = async (id) => {
  try {
    await deleteDoc(doc(db, 'work_orders', id))
    getData()
    $q.notify({ color: 'positive', message: 'Work Order dihapus' })
  } catch (error) {
    console.error('Gagal hapus WO:', error)
  }
}

const getStatusColor = (status) => {
  if (status === 'Pending') return 'grey'
  if (status === 'Proses') return 'orange'
  if (status === 'Selesai') return 'positive'
  return 'blue'
}

onMounted(() => {
  getData()
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
.shadow-sm {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
