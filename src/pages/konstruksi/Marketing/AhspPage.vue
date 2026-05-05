<template>
  <q-page class="bg-blue-grey-1 q-pa-md q-pa-lg-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight">
          Analisa Harga Satuan (AHSP)
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
            >Standard Proyek & Estimasi Biaya</span
          >
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Master data analisa harga pekerjaan sebagai acuan penyusunan RAB dan Penawaran Harga.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          color="indigo-10"
          icon="add_circle"
          label="Buat Analisa Baru"
          unelevated
          rounded
          no-caps
          class="q-px-lg q-py-sm shadow-premium btn-hover"
          @click="openAddDialog"
        />
      </div>
    </div>

    <!-- MAIN LIST TABLE -->
    <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :filter="filter"
        binary-state-sort
        class="ahsp-table"
      >
        <template v-slot:top-right>
          <q-input
            v-model="filter"
            outlined
            dense
            rounded
            placeholder="Cari Uraian Pekerjaan..."
            bg-color="white"
            style="width: 300px"
          >
            <template v-slot:prepend><q-icon name="search" color="primary" /></template>
          </q-input>
        </template>

        <template v-slot:body-cell-total="props">
          <q-td :props="props" class="text-right text-weight-bolder text-indigo-10">
            Rp {{ (props.row.harga_final || 0).toLocaleString() }}
          </q-td>
        </template>

        <template v-slot:body-cell-aksi="props">
          <q-td :props="props" auto-width>
            <div class="row q-gutter-xs">
              <q-btn
                flat
                round
                color="indigo-10"
                icon="edit_note"
                size="sm"
                @click="openEditDialog(props.row)"
              >
                <q-tooltip>Edit Analisa</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="negative"
                icon="delete_outline"
                size="sm"
                @click="confirmHapus(props.row)"
              >
                <q-tooltip>Hapus</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- ENTRY FORM DIALOG (FULLSCREEN PREMIUM) -->
    <q-dialog
      v-model="showDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="column bg-grey-2">
        <!-- Toolbar Header -->
        <q-toolbar class="bg-white text-indigo-10 q-py-md shadow-2 shrink">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest">
            {{ isEditMode ? 'Edit' : 'Entry' }} Analisa Harga Satuan Pekerjaan
          </q-toolbar-title>
          <q-btn
            unelevated
            color="indigo-10"
            label="SIMPAN ANALISA AHSP"
            :loading="submitting"
            @click="saveAhsp"
            rounded
            class="q-px-xl text-weight-bold shadow-3"
          />
        </q-toolbar>

        <!-- Form Content -->
        <q-card-section class="col scroll q-pa-md q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-xl-10">
              <!-- 1. IDENTITAS PEKERJAAN -->
              <q-card flat bordered class="rounded-12 q-mb-lg bg-white shadow-1">
                <q-card-section
                  class="bg-indigo-1 q-py-xs text-indigo-10 text-weight-bold flex items-center border-bottom"
                >
                  <q-icon name="info" class="q-mr-xs" size="xs" /> INFORMASI UTAMA PEKERJAAN
                </q-card-section>
                <q-card-section class="q-pa-md">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-2">
                      <div class="label-req q-mb-xs">Kode Analisa</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.kode"
                        placeholder="Misal: A.2.2.1"
                        bg-color="white"
                      />
                    </div>
                    <div class="col-12 col-md-7">
                      <div class="label-req q-mb-xs">Uraian / Nama Pekerjaan</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.nama"
                        placeholder="Contoh: Pemasangan 1m2 Dinding Bata Merah"
                        bg-color="white"
                      />
                    </div>
                    <div class="col-12 col-md-3">
                      <div class="label-req q-mb-xs">Satuan Pekerjaan</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.satuan"
                        placeholder="m2 / m3 / kg / dll"
                        bg-color="white"
                        class="text-center"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- 2. TRIPLE COMPONENT (TENAGA, BAHAN, ALAT) -->
              <div class="row q-col-gutter-lg">
                <!-- A. TENAGA KERJA -->
                <div class="col-12">
                  <ahsp-component-table
                    title="A. TENAGA KERJA"
                    icon="engineering"
                    color="orange-1"
                    :items="form.tenaga"
                    :options="[]"
                    @add="addItem('tenaga')"
                    @remove="(idx) => removeItem('tenaga', idx)"
                    @calc="calculateGrandTotal"
                  />
                </div>

                <!-- B. BAHAN / MATERIAL -->
                <div class="col-12">
                  <ahsp-component-table
                    title="B. BAHAN / MATERIAL"
                    icon="inventory_2"
                    color="blue-1"
                    :items="form.bahan"
                    :options="allBarang"
                    use-master-barang
                    @add="addItem('bahan')"
                    @remove="(idx) => removeItem('bahan', idx)"
                    @calc="calculateGrandTotal"
                  />
                </div>

                <!-- C. PERALATAN -->
                <div class="col-12">
                  <ahsp-component-table
                    title="C. PERALATAN"
                    icon="construction"
                    color="green-1"
                    :items="form.alat"
                    @add="addItem('alat')"
                    @remove="(idx) => removeItem('alat', idx)"
                    @calc="calculateGrandTotal"
                  />
                </div>
              </div>

              <!-- 3. REKAPITULASI & PROFIT -->
              <div class="row q-mt-xl justify-end">
                <div class="col-12 col-md-5">
                  <q-card
                    flat
                    bordered
                    class="rounded-12 bg-indigo-10 text-white shadow-8 overflow-hidden"
                  >
                    <q-card-section class="q-pa-lg">
                      <div class="row justify-between q-mb-sm opacity-70">
                        <div>Jumlah Harga Tenaga, Bahan & Alat (A+B+C)</div>
                        <div class="text-weight-bold">Rp {{ subtotalBase.toLocaleString() }}</div>
                      </div>
                      <div class="row justify-between items-center q-mb-md">
                        <div class="opacity-70">Overhead & Profit (%)</div>
                        <div style="width: 100px">
                          <q-input
                            v-model.number="form.overhead_p"
                            type="number"
                            dense
                            dark
                            outlined
                            bg-color="white-1"
                            input-class="text-right text-weight-bold"
                            @update:model-value="calculateGrandTotal"
                          />
                        </div>
                      </div>
                      <q-separator dark class="q-my-md opacity-20" />
                      <div class="text-center">
                        <div class="text-overline opacity-60 tracking-widest uppercase">
                          Harga Satuan Pekerjaan (Final)
                        </div>
                        <div class="text-h3 text-weight-black">
                          Rp {{ (form.harga_final || 0).toLocaleString() }}
                        </div>
                        <div class="text-caption opacity-50 italic">
                          Per {{ form.satuan || 'Satuan' }}
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, defineComponent } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'

// --- INNER COMPONENT FOR REUSABLE TABLES ---
const AhspComponentTable = defineComponent({
  name: 'AhspComponentTable',
  props: ['title', 'icon', 'color', 'items', 'options', 'useMasterBarang'],
  emits: ['add', 'remove', 'calc'],
  template: `
    <q-card flat bordered class="rounded-12 bg-white shadow-1 overflow-hidden">
      <q-card-section :class="'bg-' + color" class="q-py-xs row items-center border-bottom">
        <q-icon :name="icon" class="q-mr-xs" size="xs" color="indigo-10" />
        <div class="text-weight-bold text-indigo-10 uppercase font-8">{{ title }}</div>
        <q-space />
        <q-btn flat dense icon="add_circle" color="primary" label="Tambah Baris" @click="$emit('add')" no-caps class="text-weight-bold" />
      </q-card-section>
      <q-markup-table flat separator="cell" class="item-entry-table">
        <thead>
          <tr class="bg-grey-1 text-grey-8">
            <th width="50">NO</th>
            <th class="text-left">URAIAN KOMPONEN</th>
            <th width="120">SATUAN</th>
            <th width="120">KOEFISIEN</th>
            <th width="180">HARGA SATUAN (RP)</th>
            <th width="180">SUBTOTAL</th>
            <th width="40"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in items" :key="idx">
            <td class="text-center text-grey-6 text-bold">{{ idx + 1 }}</td>
            <td>
              <q-select
                v-if="useMasterBarang"
                v-model="item.obj"
                :options="options"
                option-label="nama"
                dense borderless
                placeholder="Cari material..."
                @update:model-value="(val) => { item.nama = val.nama; item.satuan = val.unit; $emit('calc') }"
              />
              <q-input v-else v-model="item.nama" dense borderless placeholder="Tulis uraian..." />
            </td>
            <td><q-input v-model="item.satuan" dense borderless input-class="text-center uppercase font-8" /></td>
            <td><q-input v-model.number="item.koef" type="number" dense borderless input-class="text-center text-bold text-primary" @update:model-value="$emit('calc')" /></td>
            <td><q-input v-model.number="item.harga" type="number" dense borderless input-class="text-right" @update:model-value="$emit('calc')" /></td>
            <td class="text-right text-weight-bold text-indigo-10 bg-indigo-0">
               Rp {{ ((item.koef || 0) * (item.harga || 0)).toLocaleString() }}
            </td>
            <td class="text-center"><q-btn flat round color="negative" icon="remove_circle" size="xs" @click="$emit('remove', idx)" /></td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-card>
  `,
})

// --- MAIN SETUP ---
const $q = useQuasar()
const rows = ref([])
const loading = ref(true)
const submitting = ref(false)
const filter = ref('')
const showDialog = ref(false)
const isEditMode = ref(false)
const allBarang = ref([])

const formDefault = {
  kode: '',
  nama: '',
  satuan: 'm2',
  tenaga: [{ nama: 'Tukang Gali', satuan: 'OH', koef: 1, harga: 0 }],
  bahan: [],
  alat: [],
  overhead_p: 10,
  harga_final: 0,
}
const form = ref({ ...formDefault })

const subtotalBase = computed(() => {
  const sum = (arr) => arr.reduce((s, it) => s + (it.koef || 0) * (it.harga || 0), 0)
  return sum(form.value.tenaga) + sum(form.value.bahan) + sum(form.value.alat)
})

const calculateGrandTotal = () => {
  const base = subtotalBase.value
  const profit = base * (form.value.overhead_p / 100)
  form.value.harga_final = Math.round(base + profit)
}

const fetchData = async () => {
  loading.value = true
  // 1. Listen AHSP List
  onSnapshot(query(collection(db, 'master_ahsp'), orderBy('nama', 'asc')), (snap) => {
    rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    loading.value = false
  })
  // 2. Fetch Master Barang for Dropdown
  const barSnap = await getDocs(collection(db, 'master_barang'))
  allBarang.value = barSnap.docs.map((d) => ({
    id: d.id,
    nama: d.data().nama,
    unit: d.data().unit,
  }))
}

const openAddDialog = () => {
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  showDialog.value = true
}

const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = JSON.parse(JSON.stringify(row))
  showDialog.value = true
}

const addItem = (type) => {
  form.value[type].push({ nama: '', satuan: '', koef: 0, harga: 0 })
}

const removeItem = (type, idx) => {
  form.value[type].splice(idx, 1)
  calculateGrandTotal()
}

const saveAhsp = async () => {
  if (!form.value.nama || !form.value.kode) {
    $q.notify({ type: 'warning', message: 'Lengkapi Nama & Kode Analisa!' })
    return
  }

  submitting.value = true
  try {
    const payload = {
      ...form.value,
      updatedAt: serverTimestamp(),
      total_harga: form.value.harga_final,
    }

    // Clean Proxies
    const cleanArr = (arr) =>
      arr.map((it) => {
        // eslint-disable-next-line no-unused-vars
        const { obj, ...clean } = it
        return clean
      })
    payload.tenaga = cleanArr(payload.tenaga)
    payload.bahan = cleanArr(payload.bahan)
    payload.alat = cleanArr(payload.alat)

    if (isEditMode.value && form.value.id) {
      await updateDoc(doc(db, 'master_ahsp', form.value.id), payload)
    } else {
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'master_ahsp'), payload)
    }

    showDialog.value = false
    $q.notify({ type: 'positive', message: 'Data AHSP Berhasil Disimpan!' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  } finally {
    submitting.value = false
  }
}

const confirmHapus = (row) => {
  $q.dialog({
    title: 'Hapus AHSP?',
    message: `Anda yakin menghapus analisa ${row.nama}?`,
    cancel: true,
  }).onOk(async () => {
    await deleteDoc(doc(db, 'master_ahsp', row.id))
  })
}

onMounted(fetchData)

const columns = [
  { name: 'kode', align: 'left', label: 'KODE', field: 'kode', sortable: true },
  { name: 'nama', align: 'left', label: 'URAIAN PEKERJAAN', field: 'nama', sortable: true },
  { name: 'satuan', align: 'center', label: 'SATUAN', field: 'satuan' },
  {
    name: 'total',
    align: 'right',
    label: 'HARGA SATUAN (A+B+C + Profit)',
    field: 'harga_final',
    sortable: true,
  },
  { name: 'aksi', align: 'center', label: 'OPSI' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
.font-pro {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-12 {
  border-radius: 12px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(25, 118, 210, 0.15);
}
.ahsp-table :deep(thead tr th) {
  background-color: #f8fafd;
  color: #546e7a;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 16px;
}
.item-entry-table :deep(thead th) {
  padding: 10px;
  font-weight: 800;
  font-size: 10px;
}
.item-entry-table :deep(tbody td) {
  border-bottom: 1px solid #f0f0f0;
}
.label-req {
  font-size: 11px;
  font-weight: 800;
  color: #444;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.bg-indigo-0 {
  background-color: rgba(26, 35, 126, 0.02);
}
.white-1 {
  background-color: rgba(255, 255, 255, 0.1) !important;
}
.border-bottom {
  border-bottom: 1px solid #eee;
}
.shrink {
  flex: 0 0 auto;
}
.animate-fade {
  animation: fadeIn 0.6s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
