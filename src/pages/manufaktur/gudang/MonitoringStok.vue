<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-teal-10">Stok Gudang Utama</div>
        <div class="text-subtitle2 text-grey-6">Monitoring Bahan Baku & Material Produksi</div>
      </div>

      <div class="row q-gutter-sm">
        <q-btn outline color="teal-10" icon="download" label="Export Report" />
        <q-btn color="teal-10" icon="add" label="Terima Barang Baru" @click="openDialog" />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-card class="bg-white q-pa-md shadow-sm rounded-borders">
          <div class="text-grey-7 text-subtitle2">Total Item Material</div>
          <div class="text-h4 text-weight-bold">{{ materials.length }}</div>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card class="bg-negative text-white q-pa-md shadow-sm rounded-borders">
          <div class="text-subtitle2 opacity-80">Stok Kritis (Butuh Reorder)</div>
          <div class="text-h4 text-weight-bold">{{ criticalCount }}</div>
        </q-card>
      </div>
    </div>

    <q-card flat class="rounded-borders shadow-sm">
      <q-table
        :rows="materials"
        :columns="columns"
        row-key="id"
        flat
        :filter="filter"
      >
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Cari Material...">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:body-cell-stok="props">
          <q-td :props="props">
            <q-chip
              :color="props.row.stok < 10 ? 'negative' : 'teal-2'"
              :text-color="props.row.stok < 10 ? 'white' : 'teal-10'"
              class="text-weight-bold"
            >
              {{ props.row.stok }} {{ props.row.satuan }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="props.row.stok < 10 ? 'negative' : 'positive'">
              {{ props.row.stok < 10 ? 'Kritis' : 'Aman' }}
            </q-badge>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-teal-10 text-white">
          <div class="text-h6">Input Barang Masuk</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select outlined v-model="form.id" :options="materials" option-label="nama" option-value="id" emit-value map-options label="Pilih Material" />
          <q-input outlined v-model.number="form.tambah" type="number" label="Jumlah Masuk" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Batal" v-close-popup />
          <q-btn color="teal-10" label="Update Stok" @click="updateStok" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const materials = ref([])
const filter = ref('')
const dialog = ref(false)
const form = ref({ id: '', tambah: 0 })

const columns = [
  { name: 'nama', label: 'Nama Material', field: 'nama', align: 'left', sortable: true },
  { name: 'satuan', label: 'Satuan', field: 'satuan', align: 'left' },
  { name: 'stok', label: 'Jumlah Stok', field: 'stok', align: 'center', sortable: true },
  { name: 'status', label: 'Status', align: 'center' }
]

// Realtime monitoring dari Firebase
const loadMaterials = () => {
  onSnapshot(collection(db, 'materials'), (snap) => {
    materials.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })
}

const criticalCount = computed(() => {
  return materials.value.filter(m => m.stok < 10).length
})

const openDialog = () => {
  form.value = { id: '', tambah: 0 }
  dialog.value = true
}

const updateStok = async () => {
  if (!form.value.id || form.value.tambah <= 0) return

  const ref = doc(db, 'materials', form.value.id)
  await updateDoc(ref, { stok: increment(form.value.tambah) })

  $q.notify({ type: 'positive', message: 'Stok berhasil ditambah!' })
  dialog.value = false
}

onMounted(loadMaterials)
</script>
