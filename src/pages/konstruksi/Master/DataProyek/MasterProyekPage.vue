<template>
  <q-page class="bg-grey-2 q-pa-md font-pro">
    <div v-if="viewMode === 'list'">
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h5 text-weight-bold text-primary text-uppercase">
            Manajemen Proyek Utama
          </div>
          <div class="text-caption text-grey-7">Daftar proyek aktif PT AGRA.</div>
        </div>
        <div class="col-auto">
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Buat Proyek Baru"
            class="btn-radius shadow-2"
            @click="openAddDialog"
          />
        </div>
      </div>

      <q-card flat bordered class="rounded-borders shadow-1">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          flat
          :filter="filter"
          :loading="loading"
          class="customer-table"
          @row-click="showProjectDetail"
        >
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="q-gutter-xs text-center" @click.stop>
              <q-btn
                flat
                round
                color="blue"
                icon="edit"
                size="sm"
                @click="openEditDialog(props.row)"
              />
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                size="sm"
                @click="hapusProyek(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <div v-else-if="viewMode === 'detail' && currentProject">
      <div class="row items-center q-mb-lg">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="primary"
          @click="viewMode = 'list'"
          class="q-mr-md"
        />
        <div class="col">
          <div class="text-h5 text-weight-bold text-primary text-uppercase">
            {{ currentProject.nama }}
          </div>
          <div class="text-caption text-grey-7">Nomor: {{ currentProject.nomor }}</div>
        </div>
      </div>

      <q-card
        flat
        bordered
        class="bg-white q-pa-lg rounded-borders shadow-1 q-mb-xl row text-center"
      >
        <div class="col-4">
          <div class="text-caption text-grey-7 font-bold uppercase">Customer</div>
          <div class="text-h6">{{ currentProject.konsumen || '-' }}</div>
        </div>
        <div class="col-4">
          <div class="text-caption text-grey-7 font-bold uppercase">Kategori</div>
          <div class="text-h6 text-blue-9">{{ currentProject.kategori || '-' }}</div>
        </div>
        <div class="col-4">
          <div class="text-caption text-grey-7 font-bold uppercase">Lokasi</div>
          <div class="text-body1">{{ currentProject.alamat || '-' }}</div>
        </div>
      </q-card>

      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6 text-grey-9 text-weight-bold uppercase">
          Daftar Kontrak / SPK Customer
        </div>
        <q-btn
          unelevated
          color="primary"
          icon="add_circle"
          label="TAMBAHKAN SPK & BOQ"
          @click="openAddSpkDialog"
          class="btn-radius shadow-2 q-px-lg"
        />
      </div>

      <q-card flat bordered class="bg-white rounded-borders shadow-1">
        <q-table
          :rows="listSpkProject"
          :columns="spkColumns"
          flat
          separator="horizontal"
          :loading="loadingSpk"
          @row-click="showSpkDetail"
        >
          <template v-slot:body-cell-nilai="props"
            ><q-td :props="props" class="text-right text-weight-bold text-primary"
              >Rp {{ formatMoney(props.value) }}</q-td
            ></template
          >
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="text-center q-gutter-x-sm" @click.stop>
              <q-btn
                flat
                round
                color="blue"
                icon="edit"
                size="sm"
                @click="showSpkDetail(null, props.row)"
              />
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                size="sm"
                @click="hapusSpk(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <div v-else-if="viewMode === 'spk_detail' && currentSpk">
      <div class="row items-center q-mb-lg">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="primary"
          @click="viewMode = 'detail'"
          class="q-mr-md"
        />
        <div class="col">
          <div class="text-h5 text-weight-bold text-primary text-uppercase">
            SPK: {{ currentSpk.nomor_spk }}
          </div>
          <div class="text-caption text-grey-7">Rincian BOQ & RAB Proyek</div>
        </div>
        <q-btn
          unelevated
          color="green-9"
          icon="save"
          label="SIMPAN PERUBAHAN SPK & RAB"
          @click="saveSpkDetailFinal"
          class="btn-radius shadow-2"
        />
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-8">
          <q-card flat bordered class="bg-white rounded-borders">
            <q-toolbar class="bg-blue-1 text-primary"
              ><q-toolbar-title class="text-subtitle2 text-bold"
                >DETAIL ITEM BOQ JUAL</q-toolbar-title
              ></q-toolbar
            >
            <q-markup-table flat separator="cell">
              <thead class="bg-blue-5 text-white uppercase font-11">
                <tr>
                  <th>Pekerjaan</th>
                  <th style="width: 80px">Vol</th>
                  <th style="width: 80px">Sat</th>
                  <th>Harga Jual</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, idx) in currentSpk.boq_items"
                  :key="idx"
                  :class="activeBoqIndex === idx ? 'bg-blue-1' : ''"
                  @click="activeBoqIndex = idx"
                  class="cursor-pointer"
                >
                  <td><q-input borderless dense v-model="item.deskripsi" /></td>
                  <td>
                    <q-input
                      borderless
                      dense
                      v-model.number="item.volume"
                      type="number"
                      class="text-center"
                    />
                  </td>
                  <td><q-input borderless dense v-model="item.satuan" class="text-center" /></td>
                  <td>
                    <q-input
                      borderless
                      dense
                      v-model.number="item.harga_satuan"
                      type="number"
                      class="text-right"
                    />
                  </td>
                  <td class="text-right text-bold">
                    Rp {{ formatMoney(item.volume * item.harga_satuan) }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card flat bordered class="bg-white rounded-borders">
            <q-toolbar class="bg-orange-1 text-orange-9">
              <q-toolbar-title class="text-subtitle2 text-bold"
                >RAB MODAL ITEM: {{ activeBoqIndex + 1 }}</q-toolbar-title
              >
              <q-btn flat round icon="add" size="sm" @click="addRabRowDetail" />
            </q-toolbar>
            <q-markup-table flat separator="cell" v-if="currentSpk.boq_items[activeBoqIndex]">
              <thead class="bg-orange-5 text-white uppercase font-11">
                <tr>
                  <th>Kebutuhan</th>
                  <th>Qty</th>
                  <th>Total Modal</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(rab, ridx) in currentSpk.boq_items[activeBoqIndex].rab_details"
                  :key="ridx"
                >
                  <td><q-input borderless dense v-model="rab.nama" /></td>
                  <td><q-input borderless dense v-model.number="rab.qty" type="number" /></td>
                  <td><q-input borderless dense v-model.number="rab.harga" type="number" /></td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-card>
        </div>
      </div>
    </div>

    <q-dialog v-model="showAddDialog" persistent maximized transition-show="slide-up">
      <q-card class="bg-grey-1 column no-wrap">
        <q-toolbar class="bg-white text-grey-9 q-py-md bordered-bottom">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-bold text-center uppercase">{{
            isEditMode ? 'Update Proyek' : 'Buat Proyek Baru'
          }}</q-toolbar-title>
          <div style="width: 48px"></div>
        </q-toolbar>
        <q-card-section class="col scroll q-pa-xl row justify-center">
          <div class="col-12 col-md-6 q-gutter-y-md">
            <q-input outlined dense v-model="form.nama" label="Nama Proyek *" bg-color="white" />
            <q-select
              outlined
              dense
              v-model="form.kategori"
              :options="optionsKategori"
              label="Kategori *"
              bg-color="white"
              emit-value
              map-options
            />
            <q-select
              outlined
              dense
              v-model="form.konsumen"
              :options="optionsKonsumen"
              label="Customer"
              bg-color="white"
              emit-value
              map-options
            />
            <q-btn
              unelevated
              color="primary"
              label="Simpan Proyek"
              :loading="submitting"
              @click="simpanProyek"
              class="full-width btn-radius shadow-2"
            />
          </div>
        </q-card-section>
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
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  where,
} from 'firebase/firestore'

const $q = useQuasar()
const viewMode = ref('list')
const activeBoqIndex = ref(0)
const rows = ref([])
const loading = ref(false)
const filter = ref('')
const showAddDialog = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const submittingSpk = ref(false)
const currentProject = ref(null)
const currentSpk = ref(null) // INI UDAH DIDEFINISIKAN BRE!
const listSpkProject = ref([])
const loadingSpk = ref(false)
const optionsKonsumen = ref([])
const optionsKategori = ref([])

const form = ref({ nomor: '', nama: '', kategori: '', konsumen: '', alamat: '', status: 'Aktif' })
// eslint-disable-next-line no-unused-vars
const showAddSpk = ref(false)
// eslint-disable-next-line no-unused-vars
const formSpk = ref({ id: null, nomor_spk: '', tgl_spk: '', boq_items: [] })

const columns = [
  { name: 'nomor', align: 'left', label: 'ID PROYEK', field: 'nomor', sortable: true },
  { name: 'nama', align: 'left', label: 'NAMA PROYEK', field: 'nama', sortable: true },
  { name: 'customer', align: 'left', label: 'CUSTOMER', field: 'konsumen' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]

const spkColumns = [
  { name: 'no_spk', align: 'left', label: 'NO. SPK', field: 'nomor_spk' },
  { name: 'tgl', align: 'left', label: 'TANGGAL', field: 'tgl_spk' },
  { name: 'nilai', align: 'right', label: 'TOTAL KONTRAK', field: 'nilai_total' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]

const formatMoney = (v) => (v ? v.toLocaleString() : '0')

const showProjectDetail = (evt, row) => {
  currentProject.value = row
  viewMode.value = 'detail'
  fetchSpkByProject(row.id)
}

const showSpkDetail = (evt, row) => {
  currentSpk.value = JSON.parse(JSON.stringify(row)) // FIX ERROR CURRENT SPK
  activeBoqIndex.value = 0
  viewMode.value = 'spk_detail'
}

const fetchProyek = async () => {
  loading.value = true
  const snap = await getDocs(query(collection(db, 'proyek'), orderBy('createdAt', 'desc')))
  rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  loading.value = false
}

const fetchSpkByProject = async (pid) => {
  loadingSpk.value = true
  const q = query(
    collection(db, 'spk_customer'),
    where('projectId', '==', pid),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  listSpkProject.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  loadingSpk.value = false
}

const saveSpkDetailFinal = async () => {
  submittingSpk.value = true
  try {
    const total = currentSpk.value.boq_items.reduce(
      (sum, item) => sum + item.volume * item.harga_satuan,
      0,
    )
    const payload = { ...currentSpk.value, nilai_total: total, updatedAt: serverTimestamp() }
    const sid = payload.id
    delete payload.id
    await updateDoc(doc(db, 'spk_customer', sid), payload) // FUNGSI UPDATEDOC DIPAKAI DISINI!
    $q.notify({ type: 'positive', message: 'SPK & RAB Berhasil Diupdate' })
    fetchSpkByProject(currentProject.value.id)
    viewMode.value = 'detail'
  } catch (e) {
    console.error(e)
  } finally {
    submittingSpk.value = false
  }
}

const simpanProyek = async () => {
  submitting.value = true
  try {
    const p = { ...form.value, updatedAt: serverTimestamp(), createdAt: serverTimestamp() }
    const docId = p.id
    delete p.id
    if (isEditMode.value) {
      await updateDoc(doc(db, 'proyek', docId), p)
    } else {
      await addDoc(collection(db, 'proyek'), p)
    }
    showAddDialog.value = false
    fetchProyek()
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

const addRabRowDetail = () => {
  if (!currentSpk.value.boq_items[activeBoqIndex.value].rab_details)
    currentSpk.value.boq_items[activeBoqIndex.value].rab_details = []
  currentSpk.value.boq_items[activeBoqIndex.value].rab_details.push({
    nama: '',
    qty: 0,
    harga: 0,
    durasi: 1,
  })
}

const openAddDialog = () => {
  isEditMode.value = false
  showAddDialog.value = true
}
const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = { ...row }
  showAddDialog.value = true
}
const hapusProyek = (row) => {
  $q.dialog({ title: 'Hapus', message: `Hapus ${row.nama}?`, cancel: true }).onOk(async () => {
    await deleteDoc(doc(db, 'proyek', row.id))
    fetchProyek()
  })
}
const hapusSpk = (row) => {
  $q.dialog({ title: 'Hapus SPK', cancel: true }).onOk(async () => {
    await deleteDoc(doc(db, 'spk_customer', row.id))
    fetchSpkByProject(currentProject.value.id)
  })
}

onMounted(async () => {
  fetchProyek()
  const c = await getDocs(collection(db, 'customer'))
  optionsKonsumen.value = c.docs.map((d) => d.data().nama)
  const k = await getDocs(collection(db, 'kategori_proyek'))
  optionsKategori.value = k.docs.map((d) => d.data().nama)
})
</script>

<style scoped>
.label-form {
  font-size: 11px;
  font-weight: 700;
  color: #555;
  margin-bottom: 4px;
  text-transform: uppercase;
}
.btn-radius {
  border-radius: 8px;
}
.customer-table :deep(tbody tr) {
  cursor: pointer;
}
.bordered-bottom {
  border-bottom: 1px solid #eee;
}
</style>
