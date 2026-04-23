<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center">
        <q-icon name="request_quote" size="md" color="blue-8" class="q-mr-sm" />
        <div>
          <div class="text-h5 text-teal-10 text-weight-bold">Material Request (MR)</div>
          <div class="text-caption text-grey-7">
            Permintaan pengambilan bahan baku untuk kebutuhan produksi
          </div>
        </div>
      </div>
      <q-btn
        color="blue-8"
        icon="add"
        label="Buat Request Baru"
        unelevated
        @click="openRequestForm"
      />
    </div>

    <q-card flat bordered class="q-mb-md">
      <q-card-section class="row q-col-gutter-sm items-center">
        <div class="col-12 col-md-4">
          <q-input v-model="search" dense outlined placeholder="Cari No. MR atau No. WO...">
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-12 col-md-2">
          <q-select
            v-model="filterStatus"
            :options="['Semua', 'Pending', 'Disetujui', 'Ditolak']"
            dense
            outlined
            label="Status"
          />
        </div>
      </q-card-section>
    </q-card>

    <q-table
      flat
      bordered
      :rows="filteredRows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      class="rounded-borders shadow-sm bg-white"
    >
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-chip :color="getStatusColor(props.value)" text-color="white" size="sm" dense>
            {{ props.value }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-action="props">
        <q-td :props="props" class="q-gutter-sm">
          <q-btn flat round color="blue-8" icon="visibility" size="sm">
            <q-tooltip>Detail Request</q-tooltip>
          </q-btn>
          <q-btn
            v-if="props.row.status === 'Pending'"
            flat
            round
            color="green"
            icon="check_circle"
            size="sm"
            @click="approveRequest(props.row)"
          >
            <q-tooltip>Setujui & Potong Stok</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="formRequest" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="bg-blue-8 text-white row items-center">
          <div class="text-h6">Form Permintaan Bahan Baku</div>
          <q-spacer />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md q-pt-lg">
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-select
                outlined
                dense
                v-model="newReq.wo_id"
                :options="['WO-2026-001', 'WO-2026-002']"
                label="Pilih Work Order"
              />
            </div>
            <div class="col-6">
              <q-input
                outlined
                dense
                v-model="newReq.date"
                label="Tanggal Dibutuhkan"
                type="date"
                stack-label
              />
            </div>
          </div>

          <q-separator label="Daftar Barang" />

          <div class="bg-grey-1 q-pa-sm rounded-borders">
            <div
              class="row q-col-gutter-sm items-center q-mb-sm"
              v-for="(item, index) in newReq.items"
              :key="index"
            >
              <div class="col-5">
                <q-select
                  outlined
                  dense
                  v-model="item.material"
                  :options="['Semen (kg)', 'Besi D16 (btg)', 'Pasir (m3)']"
                  label="Material"
                />
              </div>
              <div class="col-4">
                <q-input outlined dense v-model.number="item.qty" type="number" label="Jumlah" />
              </div>
              <div class="col-2">
                <q-btn flat round color="red" icon="delete" @click="removeItem(index)" />
              </div>
            </div>
            <q-btn
              flat
              color="blue-8"
              icon="add"
              label="Tambah Material"
              @click="addItem"
              class="full-width"
            />
          </div>

          <q-input
            outlined
            dense
            v-model="newReq.notes"
            type="textarea"
            label="Keterangan Tambahan (Contoh: Untuk Pengecoran Lantai 2)"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pb-md q-px-md">
          <q-btn v-close-popup flat label="Batal" color="grey" />
          <q-btn label="Kirim Permintaan" color="blue-8" unelevated @click="submitRequest" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
// Firebase Imports
import { db } from 'src/boot/firebase'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'

const $q = useQuasar()
const search = ref('')
const filterStatus = ref('Semua')
const formRequest = ref(false)
const loading = ref(true)
const requestRows = ref([])

const columns = [
  { name: 'date', label: 'Tanggal Butuh', field: 'date', align: 'left', sortable: true },
  { name: 'no_mr', label: 'ID Transaksi', field: 'id', align: 'left' },
  { name: 'wo_ref', label: 'Referensi WO', field: 'wo_id', align: 'left' },
  { name: 'notes', label: 'Keterangan', field: 'notes', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'action', label: 'Opsi', field: 'action', align: 'center' },
]

// Fetch data secara realtime dari Firebase
onMounted(() => {
  const q = query(collection(db, 'material_requests'), orderBy('createdAt', 'desc'))
  onSnapshot(q, (snapshot) => {
    requestRows.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    loading.value = false
  })
})

const filteredRows = computed(() => {
  let rows = requestRows.value
  if (filterStatus.value !== 'Semua') {
    rows = rows.filter((r) => r.status === filterStatus.value)
  }
  if (search.value) {
    rows = rows.filter(
      (r) =>
        r.wo_id.toLowerCase().includes(search.value.toLowerCase()) ||
        r.id.toLowerCase().includes(search.value.toLowerCase()),
    )
  }
  return rows
})

const newReq = ref({
  wo_id: '',
  date: '',
  items: [{ material: '', qty: 0 }],
  notes: '',
})

const getStatusColor = (status) => {
  if (status === 'Pending') return 'orange-9'
  if (status === 'Disetujui') return 'green'
  return 'red'
}

const openRequestForm = () => {
  formRequest.value = true
}

const addItem = () => {
  newReq.value.items.push({ material: '', qty: 0 })
}

const removeItem = (index) => {
  newReq.value.items.splice(index, 1)
}

// SIMPAN KE FIREBASE
const submitRequest = async () => {
  if (!newReq.value.wo_id || !newReq.value.date) {
    $q.notify({ message: 'Lengkapi data permintaan!', color: 'negative' })
    return
  }

  try {
    $q.loading.show({ message: 'Menyimpan ke Cloud Firestore...' })

    await addDoc(collection(db, 'material_requests'), {
      wo_id: newReq.value.wo_id,
      date: newReq.value.date,
      items: newReq.value.items,
      notes: newReq.value.notes,
      status: 'Pending',
      createdAt: serverTimestamp(),
    })

    $q.notify({
      message: 'Permintaan material berhasil disimpan di Firebase',
      color: 'blue-8',
      icon: 'cloud_done',
    })

    formRequest.value = false
    newReq.value = { wo_id: '', date: '', items: [{ material: '', qty: 0 }], notes: '' }
  } catch (error) {
    $q.notify({ message: 'Gagal: ' + error.message, color: 'negative' })
  } finally {
    $q.loading.hide()
  }
}

// UPDATE STATUS DI FIREBASE
const approveRequest = (row) => {
  $q.dialog({
    title: 'Konfirmasi Persetujuan',
    message: `Setujui permintaan untuk ${row.wo_id}? Stok gudang akan divalidasi.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const docRef = doc(db, 'material_requests', row.id)
      await updateDoc(docRef, {
        status: 'Disetujui',
        approvedAt: serverTimestamp(),
      })

      $q.notify({
        message: 'Request disetujui & Status diperbarui di Firebase',
        color: 'green',
        icon: 'check',
      })
    } catch (error) {
      $q.notify({ message: 'Gagal update: ' + error.message, color: 'negative' })
    }
  })
}
</script>
