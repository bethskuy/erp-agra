<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-teal-10">Penerimaan Barang</div>
        <div class="text-subtitle2 text-grey-6">
          Input stok masuk untuk memperbarui inventori bahan baku secara otomatis
        </div>
      </div>
      <q-btn
        color="teal-10"
        icon="add_box"
        label="Terima Barang Baru"
        @click="openDialog"
        class="rounded-borders shadow-sm"
      />
    </div>

    <q-card flat class="rounded-borders shadow-sm">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :loading="loading"
        no-data-label="Belum ada histori barang masuk"
      >
        <template v-slot:body-cell-jumlah="props">
          <q-td :props="props">
            <q-badge color="teal-1" text-color="teal-10" class="text-weight-bold q-pa-sm">
              + {{ props.value }} {{ props.row.satuan }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-tanggal="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ formatDate(props.value) }}</div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 450px" class="rounded-borders">
        <q-card-section class="bg-teal-10 text-white row items-center">
          <div class="text-h6">Form Input Barang Masuk</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md q-pt-lg">
          <q-select
            outlined
            dense
            v-model="selectedMaterial"
            :options="materialOptions"
            label="Pilih Material / Bahan Baku"
            option-label="nama"
            option-value="id"
            emit-value
            map-options
            bg-color="white"
          >
            <template v-slot:prepend>
              <q-icon name="inventory_2" color="teal-10" />
            </template>
          </q-select>

          <q-input
            outlined
            dense
            v-model.number="form.jumlah"
            type="number"
            label="Jumlah (Qty) Masuk"
            bg-color="white"
          />

          <q-input
            outlined
            dense
            v-model="form.supplier"
            label="Nama Supplier"
            placeholder="Contoh: PT. Sumber Makmur"
            bg-color="white"
          />

          <q-input
            outlined
            dense
            v-model="form.keterangan"
            label="Keterangan / No. Surat Jalan"
            type="textarea"
            rows="2"
            bg-color="white"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Batal" color="grey-7" v-close-popup />
          <q-btn
            color="teal-10"
            label="Simpan & Update Stok"
            @click="simpanBarangMasuk"
            icon="save"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  increment,
  query,
  orderBy,
} from 'firebase/firestore'

const $q = useQuasar()
const loading = ref(false)
const dialog = ref(false)
const rows = ref([])
const materialOptions = ref([])
const selectedMaterial = ref(null)

const form = ref({
  jumlah: 0,
  supplier: '',
  keterangan: '',
})

const columns = [
  { name: 'tanggal', label: 'Waktu Terima', field: 'tanggal', align: 'left', sortable: true },
  { name: 'nama_material', label: 'Nama Material', field: 'nama_material', align: 'left' },
  { name: 'jumlah', label: 'Qty Masuk', field: 'jumlah', align: 'center' },
  { name: 'supplier', label: 'Supplier', field: 'supplier', align: 'left' },
  { name: 'keterangan', label: 'Keterangan', field: 'keterangan', align: 'left' },
]

// 1. Ambil Data Histori dari Firebase
const getData = async () => {
  loading.value = true
  try {
    const q = query(collection(db, 'barang_masuk'), orderBy('tanggal', 'desc'))
    const snap = await getDocs(q)
    rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    console.error('Gagal memuat histori barang masuk')
  } finally {
    loading.value = false
  }
}

// 2. Ambil Daftar Material untuk Pilihan di Dropdown
const getMaterials = async () => {
  try {
    const snap = await getDocs(collection(db, 'materials'))
    materialOptions.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    console.error('Gagal memuat daftar material')
  }
}

const openDialog = () => {
  form.value = { jumlah: 0, supplier: '', keterangan: '' }
  selectedMaterial.value = null
  dialog.value = true
}

// 3. Simpan Transaksi & Update Stok di Master Material
const simpanBarangMasuk = async () => {
  if (!selectedMaterial.value || form.value.jumlah <= 0) {
    $q.notify({ color: 'negative', message: 'Pilih material dan isi jumlah dengan benar!' })
    return
  }

  $q.loading.show({ message: 'Sedang memperbarui inventori...' })

  try {
    const materialData = materialOptions.value.find((m) => m.id === selectedMaterial.value)

    // A. Simpan ke koleksi 'barang_masuk'
    await addDoc(collection(db, 'barang_masuk'), {
      materialId: selectedMaterial.value,
      nama_material: materialData.nama,
      satuan: materialData.satuan,
      jumlah: form.value.jumlah,
      supplier: form.value.supplier,
      keterangan: form.value.keterangan,
      tanggal: new Date(),
    })

    // B. Update stok di koleksi 'materials' menggunakan Firestore Increment
    const materialRef = doc(db, 'materials', selectedMaterial.value)
    await updateDoc(materialRef, {
      stok: increment(form.value.jumlah),
    })

    $q.notify({
      color: 'positive',
      icon: 'check_circle',
      message: `Stok ${materialData.nama} berhasil ditambah!`,
    })

    dialog.value = false
    getData() // Refresh tabel
  } catch {
    $q.notify({ color: 'negative', message: 'Terjadi kesalahan sistem saat update stok' })
  } finally {
    $q.loading.hide()
  }
}

// Fungsi Format Tanggal agar lebih cantik
const formatDate = (val) => {
  if (!val) return '-'
  const dateObj = val.toDate ? val.toDate() : new Date(val)
  return dateObj.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  getData()
  getMaterials()
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
.shadow-sm {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
/* Style tambahan biar tabel lebih bersih */
.q-table__card {
  border-radius: 12px;
}
</style>
