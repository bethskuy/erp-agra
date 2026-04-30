<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row items-center q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-teal-10">Incoming Material</div>
        <div class="text-subtitle2 text-grey-6">Flow: Material Datang -> Incoming QC</div>
      </div>
      <q-space />
      <q-btn color="teal-10" icon="inventory" label="Cek Barang Datang" @click="showForm = true" />
    </div>

    <!-- Tabel Sesuai Kertas: Qty SJ vs Actual -->
    <q-table :rows="materials" :columns="columns" flat bordered class="bg-white shadow-sm">
      <template v-slot:body-cell-actual="props">
        <q-td
          :props="props"
          :class="
            props.row.qtyActual < props.row.qtySJ ? 'bg-red-1 text-negative' : 'text-positive'
          "
        >
          {{ props.value }}
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-teal-10 text-white">
          <div class="text-h6">Form Kedatangan Barang</div>
        </q-card-section>

        <q-card-section class="q-gutter-md q-pt-md">
          <q-input v-model="form.noSuratJalan" label="Nomor Surat Jalan" outlined dense />
          <div class="row q-col-gutter-sm">
            <q-input
              v-model.number="form.qtySJ"
              type="number"
              label="QTY Surat Jalan"
              class="col-6"
              outlined
              dense
            />
            <q-input
              v-model.number="form.qtyActual"
              type="number"
              label="Actual Barang Datang"
              class="col-6"
              outlined
              dense
            />
          </div>
          <q-select
            v-model="form.kesesuaian"
            :options="['Sesuai', 'Tidak Sesuai (Kurang)', 'Tidak Sesuai (Rusak)']"
            label="Kesesuaian Surat Jalan"
            outlined
            dense
          />
          <q-input v-model="form.checker" label="Nama Pemeriksa (QC)" outlined dense />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Batal" v-close-popup />
          <q-btn color="teal-10" label="Simpan ke Log Produksi" @click="saveIncoming" />
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

const $q = useQuasar()
const showForm = ref(false)
const materials = ref([])
const form = ref({ noSuratJalan: '', qtySJ: 0, qtyActual: 0, kesesuaian: 'Sesuai', checker: '' })

const columns = [
  {
    name: 'tgl',
    label: 'Tgl Masuk',
    field: 'created_at',
    format: (v) => v?.toDate().toLocaleDateString(),
  },
  { name: 'sj', label: 'No. SJ', field: 'noSuratJalan', align: 'left' },
  { name: 'qtysj', label: 'QTY Surat Jalan', field: 'qtySJ', align: 'center' },
  { name: 'actual', label: 'Actual Datang', field: 'qtyActual', align: 'center' },
  { name: 'status', label: 'Kesesuaian', field: 'kesesuaian', align: 'left' },
  { name: 'qc', label: 'Checker', field: 'checker', align: 'left' },
]

const saveIncoming = async () => {
  try {
    await addDoc(collection(db, 'incoming_materials'), { ...form.value, created_at: new Date() })
    showForm.value = false
    $q.notify({ type: 'positive', message: 'Data Material Datang Berhasil Disimpan' })
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  onSnapshot(query(collection(db, 'incoming_materials'), orderBy('created_at', 'desc')), (snap) => {
    materials.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })
})
</script>
