<template>
  <q-page class="q-pa-md warehouse-page bg-dark-premium">
    <!-- Header Page -->
    <div class="row items-center q-mb-md">
      <div>
        <div class="text-h4 text-weight-bolder incoming-title">Outgoing QC (OQC)</div>
        <div class="text-subtitle2 incoming-subtitle">Pengecekan Akhir Barang Keluar</div>
      </div>
      <q-space />
      <q-btn icon="fact_check" label="Input QC" class="btn-neon-green" @click="showForm = true" />
    </div>

    <!-- Data Table -->
    <q-table
      :rows="qcLogs"
      :columns="columns"
      row-key="id"
      flat
      dark
      class="table-card glass-card fg-table-dark"
    />

    <!-- Dialog Input -->
    <q-dialog v-model="showForm" persistent>
      <q-card class="glass-card rack-dialog" style="min-width: 400px">
        <q-card-section class="dialog-header row items-center text-white">
          <div class="text-h6 text-neon-green text-weight-bold">Input Hasil OQC</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="grey-4" />
        </q-card-section>

        <q-card-section class="q-gutter-md q-pa-md">
          <q-input v-model="form.noSJ" label="No. Surat Jalan" outlined dense dark />
          <q-input v-model="form.customer" label="Customer" outlined dense dark />
          <q-input v-model="form.produk" label="Nama Produk" outlined dense dark />
          <q-select
            v-model="form.status"
            :options="['Pass', 'Reject']"
            label="Hasil QC"
            outlined
            dense
            dark
          />
          <q-input v-model="form.checker" label="Nama Checker" outlined dense dark />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions q-pa-md">
          <q-btn flat label="Batal" color="grey-4" v-close-popup />
          <q-btn label="Simpan" class="btn-neon-green" @click="saveQC" />
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
.warehouse-page {
  background-color: #071826;
  min-height: 100vh;
}

.incoming-title {
  color: #F4F7FA !important;
  text-shadow: 0 0 12px rgba(124, 255, 79, 0.18);
}

.incoming-subtitle {
  color: #B8C7D9 !important;
}

.text-neon-green {
  color: #7CFF4F !important;
}

.btn-neon-green {
  background: linear-gradient(135deg, #7CFF4F 0%, #66d93f 100%) !important;
  color: #071826 !important;
  font-weight: 700 !important;
}

.glass-card {
  background: rgba(13, 34, 51, 0.7) !important;
  border: 1px solid rgba(124, 255, 79, 0.08) !important;
  border-radius: 18px !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
}

.dialog-header {
  background: rgba(13, 34, 51, 0.9) !important;
  border-bottom: 1px solid rgba(0, 209, 178, 0.2) !important;
}

.dialog-actions {
  background: rgba(13, 34, 51, 0.9) !important;
  border-top: 1px solid rgba(0, 209, 178, 0.15) !important;
}

/* Table Spacing Alignment (Matching PlanningProduksiPage.vue) */
.table-card {
  margin-top: 20px !important;
  padding: 20px !important;
  border-radius: 18px !important;
  background: rgba(13, 34, 51, 0.85) !important;
  border: 1px solid rgba(124, 255, 79, 0.08) !important;
  overflow: hidden;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.table-card :deep(.q-table thead tr) {
  height: 54px !important;
}

.table-card :deep(.q-table thead th) {
  height: 54px !important;
  font-size: 13px !important;
  letter-spacing: 0.08em !important;
  padding: 0 18px !important;
  vertical-align: middle !important;
  background: rgba(13, 34, 51, 0.9) !important;
}

.table-card :deep(.q-table tbody tr) {
  min-height: 64px !important;
  height: 64px !important;
}

.table-card :deep(.q-table tbody td) {
  padding: 14px 18px !important;
  white-space: normal !important;
  vertical-align: middle !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
}

.table-card :deep(.q-table__bottom) {
  padding: 16px 20px !important;
}

.fg-table-dark :deep(tbody td) {
  color: #F4F7FA !important;
}


.rack-dialog {
  max-width: 92vw;
  width: 420px;
  background: #071826 !important;
  border: 1px solid rgba(124, 255, 79, 0.15) !important;
}
</style>
