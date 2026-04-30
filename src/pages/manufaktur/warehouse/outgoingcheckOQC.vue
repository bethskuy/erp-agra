<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- Header Page -->
    <div class="row items-center q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-deep-orange-9">Outgoing QC (OQC)</div>
        <div class="text-subtitle2 text-grey-6">Pengecekan Akhir Barang Keluar</div>
      </div>
      <q-space />
      <q-btn color="deep-orange-9" icon="fact_check" label="Input QC" @click="showForm = true" />
    </div>

    <!-- Data Table -->
    <q-table
      :rows="qcLogs"
      :columns="columns"
      row-key="id"
      flat
      bordered
      class="bg-white rounded-borders shadow-sm"
    />

    <!-- Dialog Input -->
    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">Input Hasil OQC</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="form.noSJ" label="No. Surat Jalan" outlined dense />
          <q-input v-model="form.customer" label="Customer" outlined dense />
          <q-input v-model="form.produk" label="Nama Produk" outlined dense />
          <q-select
            v-model="form.status"
            :options="['Pass', 'Reject']"
            label="Hasil QC"
            outlined
            dense
          />
          <q-input v-model="form.checker" label="Nama Checker" outlined dense />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Batal" v-close-popup />
          <q-btn color="deep-orange-9" label="Simpan" @click="saveQC" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore'
import { useQuasar } from 'quasar'

// State & Variables
const $q = useQuasar()
const showForm = ref(false)
const qcLogs = ref([])
const form = ref({
  noSJ: '',
  customer: '',
  produk: '',
  status: 'Pass',
  checker: '',
})

const columns = [
  { name: 'sj', label: 'No. SJ', field: 'noSJ', align: 'left' },
  { name: 'customer', label: 'Customer', field: 'customer', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'checker', label: 'Checker', field: 'checker', align: 'left' },
]

// Fetch Data Realtime
const loadQCData = () => {
  const q = query(collection(db, 'outgoing_qc'), orderBy('created_at', 'desc'))
  onSnapshot(q, (snap) => {
    qcLogs.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })
}

// Fungsi Simpan (Fix Try-Catch & ESLint)
const saveQC = async () => {
  if (!form.value.noSJ) {
    $q.notify({ type: 'warning', message: 'No. Surat Jalan harus diisi' })
    return
  }

  $q.loading.show()
  try {
    await addDoc(collection(db, 'outgoing_qc'), {
      ...form.value,
      created_at: new Date(),
    })

    // Reset form & tutup dialog
    showForm.value = false
    form.value = { noSJ: '', customer: '', produk: '', status: 'Pass', checker: '' }

    $q.notify({ type: 'positive', message: 'Data OQC Tersimpan!' })
  } catch (error) {
    console.error('Error saving data:', error)
    $q.notify({ type: 'negative', message: 'Gagal Simpan Data!' })
  } finally {
    $q.loading.hide()
  }
}

onMounted(loadQCData)
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
.shadow-sm {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
</style>
