<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center">
        <q-icon name="fact_check" size="md" color="orange-9" class="q-mr-sm" />
        <div>
          <div class="text-h5 text-teal-10 text-weight-bold">Quality Control (QC)</div>
          <div class="text-caption text-grey-7">
            Validasi mutu hasil produksi sebelum masuk ke stok gudang
          </div>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="text-center q-pa-sm">
          <div class="text-grey-7">Antrean QC</div>
          <div class="text-h4 text-weight-bold text-orange-9">{{ pendingCount }}</div>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered class="text-center q-pa-sm">
          <div class="text-grey-7">Lulus QC</div>
          <div class="text-h4 text-weight-bold text-green">{{ passCount }}</div>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered class="text-center q-pa-sm">
          <div class="text-grey-7">Reject</div>
          <div class="text-h4 text-weight-bold text-red">{{ failCount }}</div>
        </q-card>
      </div>
    </div>

    <q-table
      flat
      bordered
      :rows="qcRows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      class="rounded-borders shadow-sm bg-white"
    >
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="getStatusColor(props.value)" class="q-pa-xs">
            {{ props.value.toUpperCase() }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-action="props">
        <q-td :props="props" class="q-gutter-sm">
          <q-btn
            v-if="props.row.status === 'pending'"
            color="teal-10"
            label="Proses Uji"
            icon="biotech"
            size="sm"
            unelevated
            @click="openQCForm(props.row)"
          />
          <q-btn v-else flat round color="grey-5" icon="check_circle" size="sm">
            <q-tooltip>Pemeriksaan Selesai</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="formQC" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-teal-10 text-white">
          <div class="text-h6">Pemeriksaan: {{ selectedWO.no_wo }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="qcData.inspector" label="Nama Inspector" outlined dense />
          <q-select
            v-model="qcData.result"
            :options="['Lulus', 'Reject (Buang)']"
            label="Hasil Mutu"
            outlined
            dense
          />
          <q-input v-model="qcData.notes" type="textarea" label="Catatan Teknis" outlined dense />
        </q-card-section>

        <q-card-actions align="right" class="q-pb-md q-px-md">
          <q-btn v-close-popup flat label="Batal" color="grey" />
          <q-btn label="Update Data" color="teal-10" unelevated @click="updateQCStatus" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'

const $q = useQuasar()
const loading = ref(true)
const formQC = ref(false)
const qcRows = ref([])
const selectedWO = ref({})
const qcData = ref({ inspector: '', result: '', notes: '' })

// Hitung statistik otomatis
const pendingCount = computed(() => qcRows.value.filter((r) => r.status === 'pending').length)
const passCount = computed(() => qcRows.value.filter((r) => r.status === 'Lulus').length)
const failCount = computed(() => qcRows.value.filter((r) => r.status === 'Reject (Buang)').length)

const columns = [
  { name: 'no_wo', label: 'No. WO', field: 'no_wo', align: 'left', sortable: true },
  { name: 'product', label: 'Produk', field: 'product_name', align: 'left' },
  { name: 'qty', label: 'Qty', field: 'qty', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'action', label: 'Aksi', field: 'action', align: 'center' },
]

onMounted(() => {
  const q = query(collection(db, 'production_results'), orderBy('createdAt', 'desc'))
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      qcRows.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      console.error('Firestore Error:', err)
      $q.notify({ message: 'Gagal koneksi database', color: 'negative' })
    },
  )
  return () => unsubscribe()
})

const getStatusColor = (status) => {
  if (status === 'pending') return 'orange-9'
  if (status === 'Lulus') return 'green'
  return 'red'
}

const openQCForm = (row) => {
  selectedWO.value = row
  formQC.value = true
}

const updateQCStatus = async () => {
  if (!qcData.value.result || !qcData.value.inspector) {
    $q.notify({ message: 'Lengkapi data!', color: 'warning' })
    return
  }

  try {
    $q.loading.show({ message: 'Menyimpan hasil ke Firebase...' })
    const docRef = doc(db, 'production_results', selectedWO.value.id)
    await updateDoc(docRef, {
      status: qcData.value.result,
      inspector: qcData.value.inspector,
      notes: qcData.value.notes,
      updatedAt: serverTimestamp(),
    })
    $q.notify({ message: 'Hasil QC Berhasil Diupdate!', color: 'teal-10', icon: 'done' })
    formQC.value = false
  } catch (err) {
    console.error('Update Error:', err)
    $q.notify({ message: 'Gagal menyimpan', color: 'negative' })
  } finally {
    $q.loading.hide()
  }
}
</script>
