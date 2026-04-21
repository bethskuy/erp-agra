<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-teal-10">Material Inventory</div>
        <div class="text-subtitle2 text-grey-6">Manajemen aset bahan baku produksi real-time</div>
      </div>

      <div class="row q-gutter-sm">
        <q-btn outline color="teal-10" icon="download" label="Export CSV" />
        <q-btn color="teal-10" icon="add" label="Tambah Material" @click="openDialog" />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-card flat class="bg-white q-pa-md rounded-borders shadow-sm">
          <div class="text-grey-7">Total Item</div>
          <div class="text-h5 text-weight-bold">{{ rows.length }} SKU</div>
        </q-card>
      </div>
      <div class="col-12 col-md-3">
        <q-card flat class="bg-red-1 q-pa-md rounded-borders shadow-sm">
          <div class="text-red-7">Stok Kritis</div>
          <div class="text-h5 text-weight-bold text-red-9">{{ lowStockCount }} Item</div>
        </q-card>
      </div>
    </div>

    <q-card flat class="rounded-borders shadow-sm">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:body-cell-stok="props">
          <q-td :props="props">
            <q-badge :color="props.row.stok <= (props.row.minStok || 0) ? 'red' : 'green'">
              {{ props.row.stok }} {{ props.row.satuan }}
            </q-badge>
            <div
              v-if="props.row.stok <= (props.row.minStok || 0)"
              class="text-caption text-red text-weight-bold"
            >
              Harus Restock!
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-harga="props">
          <q-td :props="props">
            Rp {{ props.row.harga ? props.row.harga.toLocaleString() : 0 }}
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="q-gutter-xs">
            <q-btn dense flat icon="edit" color="primary" @click="editMaterial(props.row)">
              <q-tooltip>Edit Data</q-tooltip>
            </q-btn>
            <q-btn dense flat icon="delete" color="negative" @click="confirmDelete(props.row.id)">
              <q-tooltip>Hapus</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 450px" class="rounded-borders">
        <q-card-section class="bg-teal-10 text-white">
          <div class="text-h6">
            <q-icon name="inventory_2" class="q-mr-sm" />
            {{ isEdit ? 'Update Data Material' : 'Registrasi Material Baru' }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md q-pt-lg">
          <q-input outlined v-model="form.nama" label="Nama Material" />

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input outlined v-model.number="form.stok" type="number" label="Stok Awal" />
            </div>
            <div class="col-6">
              <q-input outlined v-model.number="form.minStok" type="number" label="Minimal Stok" />
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input outlined v-model="form.satuan" label="Satuan" />
            </div>
            <div class="col-6">
              <q-input
                outlined
                v-model.number="form.harga"
                type="number"
                label="Harga per Satuan"
                prefix="Rp"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Batal" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            color="teal-10"
            icon="save"
            label="Simpan Data"
            @click="simpanMaterial"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const columns = [
  { name: 'nama', label: 'MATERIAL NAME', field: 'nama', align: 'left', sortable: true },
  { name: 'stok', label: 'CURRENT STOCK', field: 'stok', align: 'center', sortable: true },
  { name: 'harga', label: 'UNIT PRICE (Rp)', field: 'harga', align: 'right', sortable: true },
  { name: 'satuan', label: 'UoM', field: 'satuan', align: 'left' },
  { name: 'actions', label: 'OPERATIONS', field: 'actions', align: 'center' },
]

const rows = ref([])
const dialog = ref(false)
const isEdit = ref(false)
const selectedId = ref(null)

const form = ref({
  nama: '',
  stok: 0,
  minStok: 5,
  satuan: '',
  harga: 0,
})

const lowStockCount = computed(() => {
  return rows.value.filter((item) => item.stok <= (item.minStok || 0)).length
})

const getData = async () => {
  $q.loading.show({ message: 'Menghubungkan ke server...' })
  try {
    const snapshot = await getDocs(collection(db, 'materials'))
    rows.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: 'Gagal sinkronisasi data' })
  } finally {
    $q.loading.hide()
  }
}

const openDialog = () => {
  form.value = { nama: '', stok: 0, minStok: 5, satuan: '', harga: 0 }
  isEdit.value = false
  dialog.value = true
}

const editMaterial = (row) => {
  form.value = { ...row }
  selectedId.value = row.id
  isEdit.value = true
  dialog.value = true
}

const simpanMaterial = async () => {
  if (!form.value.nama) return

  try {
    const payload = {
      nama: form.value.nama,
      stok: Number(form.value.stok),
      minStok: Number(form.value.minStok),
      satuan: form.value.satuan,
      harga: Number(form.value.harga),
      updatedAt: new Date(),
    }

    if (isEdit.value) {
      await updateDoc(doc(db, 'materials', selectedId.value), payload)
      $q.notify({ color: 'positive', message: 'Update Berhasil' })
    } else {
      await addDoc(collection(db, 'materials'), payload)
      $q.notify({ color: 'positive', message: 'Data Tersimpan' })
    }

    dialog.value = false
    getData()
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: 'Gagal memproses data' })
  }
}

const confirmDelete = (id) => {
  $q.dialog({
    title: 'Hapus Material?',
    message: 'Data akan dihapus permanen dari sistem.',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    hapusMaterial(id)
  })
}

const hapusMaterial = async (id) => {
  try {
    await deleteDoc(doc(db, 'materials', id))
    $q.notify({ color: 'positive', icon: 'delete', message: 'Terhapus' })
    getData()
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: 'Gagal menghapus' })
  }
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}
</style>
