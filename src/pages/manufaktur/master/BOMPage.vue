<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-teal-10">Bill of Materials (BOM)</div>
        <div class="text-subtitle2 text-grey-6">Manajemen resep dan struktur produk jadi</div>
      </div>
      <q-btn color="teal-10" icon="add" label="Buat BOM Baru" @click="openDialog" />
    </div>

    <q-card flat class="rounded-borders shadow-sm">
      <q-table :rows="bomRows" :columns="bomColumns" row-key="id" flat bordered shadow-0>
        <template v-slot:body-cell-bahan="props">
          <q-td :props="props">
            <div class="row q-gutter-xs">
              <q-chip
                v-for="(item, index) in props.row.materials"
                :key="index"
                dense
                outline
                color="teal"
                size="sm"
              >
                {{ item.nama }} ({{ item.qty }} {{ item.satuan }})
              </q-chip>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="q-gutter-xs">
            <q-btn dense flat icon="delete" color="negative" @click="confirmDelete(props.row.id)">
              <q-tooltip>Hapus Resep</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 650px" class="rounded-borders">
        <q-card-section class="bg-teal-10 text-white row items-center">
          <div class="text-h6">Konfigurasi Struktur Produk</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md q-pt-lg">
          <q-input
            outlined
            v-model="form.productName"
            label="Nama Produk Jadi"
            placeholder="Contoh: Tank Baja"
            bg-color="white"
          />

          <q-separator class="q-my-md" />

          <div class="row items-center justify-between">
            <div class="text-subtitle1 text-weight-bold text-teal-10">Komposisi Bahan Baku</div>
            <div class="text-caption text-grey-7">*Pastikan stok material tersedia di gudang</div>
          </div>

          <div class="row q-col-gutter-sm items-end">
            <div class="col-6">
              <q-select
                outlined
                v-model="tempMaterial"
                :options="materialOptions"
                option-label="nama"
                label="Pilih Material"
                bg-color="white"
                behavior="menu"
                :loading="loadingMaterials"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      Tidak ada material ditemukan
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-3">
              <q-input
                outlined
                v-model.number="tempQty"
                type="number"
                label="Qty"
                bg-color="white"
              />
            </div>
            <div class="col-3">
              <q-btn
                color="teal-10"
                icon="add"
                label="Tambah"
                class="full-width"
                style="height: 56px"
                @click="addMaterialToBOM"
              />
            </div>
          </div>

          <q-list bordered separator class="rounded-borders bg-white">
            <q-item-label header class="text-weight-bold text-teal-10">Daftar Bahan Terpilih:</q-item-label>
            <q-item v-if="form.materials.length === 0">
              <q-item-section class="text-center text-grey-6 italic">Belum ada bahan ditambahkan</q-item-section>
            </q-item>
            <q-item v-for="(item, index) in form.materials" :key="index">
              <q-item-section avatar>
                <q-avatar color="teal-1" text-color="teal-10" icon="inventory_2" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ item.nama }}</q-item-label>
                <q-item-label caption>{{ item.qty }} {{ item.satuan }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  round
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="removeMaterial(index)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Batal" color="grey-7" v-close-popup />
          <q-btn unelevated color="teal-10" icon="save" label="Simpan Resep BOM" @click="saveBOM" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// State Data
const bomRows = ref([])
const materialOptions = ref([])
const dialog = ref(false)
const loadingMaterials = ref(false)

// State Form
const form = ref({
  productName: '',
  materials: [],
})
const tempMaterial = ref(null)
const tempQty = ref(1)

const bomColumns = [
  { name: 'productName', label: 'NAMA PRODUK', field: 'productName', align: 'left', sortable: true },
  { name: 'bahan', label: 'KOMPOSISI BAHAN (RESEP)', align: 'left' },
  { name: 'actions', label: 'AKSI', align: 'center' },
]

// Ambil data material untuk pilihan di dropdown
const getMaterials = async () => {
  loadingMaterials.value = true
  try {
    const snapshot = await getDocs(collection(db, 'materials'))
    materialOptions.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Gagal load materials:', error)
  } finally {
    loadingMaterials.value = false
  }
}

// Ambil daftar BOM
const getBOMData = async () => {
  try {
    const q = query(collection(db, 'boms'), orderBy('productName', 'asc'))
    const snapshot = await getDocs(q)
    bomRows.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Gagal load BOM data:', error)
  }
}

const addMaterialToBOM = () => {
  if (!tempMaterial.value) {
    $q.notify({ type: 'warning', message: 'Pilih material dulu bang!' })
    return
  }

  const exists = form.value.materials.find((m) => m.materialId === tempMaterial.value.id)
  if (exists) {
    $q.notify({ type: 'warning', message: 'Material ini sudah ada dalam resep!' })
    return
  }

  form.value.materials.push({
    materialId: tempMaterial.value.id,
    nama: tempMaterial.value.nama,
    satuan: tempMaterial.value.satuan,
    qty: tempQty.value,
  })

  tempMaterial.value = null
  tempQty.value = 1
}

const removeMaterial = (index) => {
  form.value.materials.splice(index, 1)
}

const saveBOM = async () => {
  if (!form.value.productName || form.value.materials.length === 0) {
    $q.notify({ color: 'negative', message: 'Nama produk dan bahan minimal harus ada 1!' })
    return
  }

  try {
    $q.loading.show({ message: 'Menyimpan resep...' })
    await addDoc(collection(db, 'boms'), {
      ...form.value,
      createdAt: new Date(),
    })
    $q.notify({ color: 'positive', icon: 'done', message: 'BOM Berhasil Dibuat!' })
    dialog.value = false
    getBOMData()
  } catch (error) {
    console.error('Gagal simpan BOM:', error)
    $q.notify({ color: 'negative', message: 'Gagal menyimpan data' })
  } finally {
    $q.loading.hide()
  }
}

const openDialog = () => {
  form.value = { productName: '', materials: [] }
  tempMaterial.value = null
  tempQty.value = 1
  getMaterials() // Refresh material saat dialog dibuka
  dialog.value = true
}

const confirmDelete = (id) => {
  $q.dialog({
    title: 'Hapus BOM?',
    message: 'Data resep produk akan dihapus permanen.',
    cancel: { color: 'primary', flat: true },
    ok: { color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'boms', id))
      getBOMData()
      $q.notify({ color: 'positive', message: 'BOM berhasil dihapus' })
    } catch (error) {
      console.error(error)
    }
  })
}

onMounted(() => {
  getMaterials()
  getBOMData()
})
</script>

<style scoped>
.rounded-borders { border-radius: 12px; }
.shadow-sm { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); }
</style>
