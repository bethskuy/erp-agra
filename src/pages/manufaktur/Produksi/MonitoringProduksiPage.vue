<template>
  <q-page class="monitoring-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Monitoring Produksi
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Realtime End-to-End Production Flow
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Dashboard terpadu untuk memantau SPK Fabrikasi, routing tahapan, produksi, QC, dan
          finished dalam satu halaman.
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none row q-gutter-sm">
        <q-btn
          unelevated
          color="green-10"
          icon="add"
          label="Tambah SPK Baru"
          no-caps
          class="q-px-lg"
          @click="openReleaseForm"
        />
        <q-btn
          flat
          rounded
          color="green-10"
          icon="sync"
          label="Refresh Data"
          no-caps
          :loading="loading"
          class="bg-white shadow-1 q-px-lg"
          @click="loadMonitoring"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="card in summaryCards" :key="card.title" class="col-12 col-sm-6 col-lg">
        <q-card flat bordered class="summary-card bg-white">
          <q-card-section class="row items-center no-wrap">
            <q-avatar :color="card.color" text-color="white" :icon="card.icon" size="46px" />
            <div class="q-ml-md col">
              <div class="summary-label">{{ card.title }}</div>
              <div class="summary-value">{{ card.value }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-lg">
      <div class="col-12 col-lg-7">
        <q-card flat bordered class="dashboard-card bg-white full-height">
          <q-card-section class="card-header">
            <div>
              <div class="text-overline text-green-10 text-weight-black">Progress Produksi</div>
              <div class="text-caption text-grey-7">Akumulasi progres seluruh SPK aktif.</div>
            </div>
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold">
              {{ averageProgress }}%
            </q-chip>
          </q-card-section>
          <q-card-section>
            <q-linear-progress
              rounded
              size="14px"
              :value="averageProgress / 100"
              :color="averageProgress >= 100 ? 'green-10' : 'orange-9'"
              track-color="green-1"
              class="q-mb-lg"
            />

            <div class="flow-grid">
              <div v-for="stage in flowStages" :key="stage.title" class="flow-stage">
                <q-avatar :icon="stage.icon" color="green-1" text-color="green-10" size="38px" />
                <div class="flow-stage__title">{{ stage.title }}</div>
                <div class="flow-stage__value">{{ stage.value }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-5">
        <q-card flat bordered class="dashboard-card bg-white full-height">
          <q-card-section class="card-header">
            <div>
              <div class="text-overline text-green-10 text-weight-black">Timeline Produksi</div>
              <div class="text-caption text-grey-7">Status terbaru dari flow produksi.</div>
            </div>
          </q-card-section>
          <q-card-section class="timeline-panel">
            <q-timeline color="green-10" layout="dense">
              <q-timeline-entry
                v-for="item in timelineItems"
                :key="`${item.nomor_spk}-${item.status}`"
                :title="item.title"
                :subtitle="item.subtitle"
                :icon="item.icon"
                :color="item.color"
              >
                <div class="text-caption text-grey-7">{{ item.caption }}</div>
              </q-timeline-entry>
            </q-timeline>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <q-input
          v-model="search"
          outlined
          dense
          rounded
          debounce="250"
          placeholder="Cari SPK, produk, customer, line, atau status..."
          bg-color="white"
        >
          <template #prepend>
            <q-icon name="search" color="green-10" />
          </template>
        </q-input>
      </div>

      <div class="col-12 col-md-3">
        <q-select
          v-model="statusFilter"
          :options="statusFilterOptions"
          outlined
          dense
          rounded
          emit-value
          map-options
          label="Filter Status"
          bg-color="white"
        />
      </div>

      <div class="col-12 col-md-auto">
        <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
          {{ filteredRows.length }} SPK
        </q-chip>
      </div>
    </div>

    <q-card flat bordered class="table-card bg-white">
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="nomor_spk"
        flat
        binary-state-sort
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        class="monitoring-table"
      >
        <template #header="props">
          <q-tr :props="props" class="bg-green-10 text-white">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bold uppercase table-head"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body="props">
          <q-tr :props="props" class="monitoring-row">
            <q-td key="nomor_spk" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.nomor_spk }}
            </q-td>
            <q-td key="nama_produk" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.nama_produk }}</div>
              <div class="text-caption text-grey-6">{{ props.row.customer || '-' }}</div>
            </q-td>
            <q-td key="line_produksi" :props="props">
              <div class="text-weight-bold">{{ props.row.tahapan_aktif || '-' }}</div>
              <div class="text-caption text-grey-6">
                Routing {{ props.row.urutan_tahapan || '-' }}
              </div>
            </q-td>
            <q-td key="qty_target" :props="props" class="text-weight-bold">
              {{ formatNumber(props.row.qty_target) }}
            </q-td>
            <q-td key="assigned_team" :props="props">
              <div class="text-weight-bold text-teal-10">{{ props.row.assigned_team || '-' }}</div>
              <div class="text-caption text-grey-7 text-weight-medium">
                {{ props.row.jabatan_tim || '-' }}
              </div>
            </q-td>
            <q-td key="qty_selesai" :props="props" class="text-weight-bold text-positive">
              {{ formatNumber(props.row.qty_selesai) }}
            </q-td>
            <q-td key="qty_reject" :props="props" class="text-weight-bold text-negative">
              {{ formatNumber(props.row.qty_reject) }}
            </q-td>
            <q-td key="progress" :props="props">
              <div class="progress-cell">
                <div class="row items-center justify-between q-mb-xs">
                  <span class="progress-label">Progress</span>
                  <span class="progress-value">{{ props.row.progress }}%</span>
                </div>
                <q-linear-progress
                  rounded
                  size="9px"
                  :value="props.row.progress / 100"
                  :color="progressColor(props.row.progress)"
                  track-color="green-1"
                />
              </div>
            </q-td>
            <q-td key="stage" :props="props">
              <div class="stage-mini">
                <q-icon
                  v-for="stage in props.row.stages"
                  :key="stage.key"
                  :name="stage.icon"
                  :color="stage.done ? 'green-10' : 'grey-5'"
                  size="18px"
                >
                  <q-tooltip>{{ stage.label }}</q-tooltip>
                </q-icon>
              </div>
            </q-td>
            <q-td key="status" :props="props">
              <q-chip
                dense
                square
                text-color="white"
                :color="statusColor(props.row.status)"
                class="status-chip"
              >
                {{ props.row.status }}
              </q-chip>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="monitoring" size="28px" class="q-mr-sm" />
            Belum ada data monitoring produksi.
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- FORM DIALOG TAMBAH SPK BARU (FULLSCREEN & MANUAL - KONEK DATA MASTER) -->
    <q-dialog
      v-model="showReleaseDialog"
      maximized
      persistent
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="release-spk-dialog bg-grey-2 column">
        <!-- HEADER BAR -->
        <q-bar class="bg-white release-spk-bar shadow-1" style="height: 70px; z-index: 10">
          <q-btn flat round dense icon="close" color="grey-7" @click="showReleaseDialog = false" />
          <q-space />
          <div class="release-spk-title text-green-10 text-weight-bold text-h6">
            Form Pembuatan SPK Baru (Manual)
          </div>
          <q-space />
          <q-btn
            unelevated
            color="teal-10"
            icon="save"
            label="Rilis SPK (Release WO)"
            no-caps
            class="q-px-lg text-weight-bold"
            :loading="saving"
            @click="saveSPK"
          />
        </q-bar>

        <!-- INPUT AREA FORM -->
        <q-card-section class="col scroll q-pa-lg">
          <div class="row q-col-gutter-lg justify-center" style="max-width: 1100px; margin: 0 auto">
            <!-- FORM SEBELAH KIRI: DETAIL UTAMA -->
            <div class="col-12 col-md-8">
              <q-card
                flat
                bordered
                class="q-pa-lg bg-white"
                style="border-radius: 12px; border-color: #dfe8df"
              >
                <div class="text-subtitle1 text-weight-bold text-green-10 q-mb-md row items-center">
                  <q-icon name="info" class="q-mr-sm" size="sm" />
                  Informasi Perintah Kerja
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="formSPK.nomor_spk"
                      outlined
                      readonly
                      label="Nomor SPK (Auto)"
                      bg-color="grey-1"
                    />
                  </div>

                  <!-- DROPDOWN CUSTOMER (SINKRON MARKETING/PENAWARAN) -->
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="formSPK.customer"
                      use-input
                      input-debounce="0"
                      @new-value="createValueCustomer"
                      :options="filteredCustomerOptions"
                      @filter="filterCustomer"
                      outlined
                      label="Nama Customer / Perusahaan"
                      placeholder="Pilih atau ketik customer baru..."
                      :rules="[(val) => !!val || 'Nama customer wajib diisi']"
                    />
                  </div>

                  <!-- DROPDOWN PRODUK (SINKRON MASTER PRODUK) -->
                  <div class="col-12">
                    <q-select
                      v-model="selectedProduk"
                      use-input
                      input-debounce="0"
                      @new-value="createValueProduk"
                      :options="filteredProdukOptions"
                      @filter="filterProduk"
                      outlined
                      label="Nama Produk / Item Item Fabrikasi"
                      placeholder="Pilih atau ketik produk baru..."
                      @update:model-value="onProdukSelected"
                      :rules="[(val) => !!val || 'Nama produk wajib diisi']"
                    />
                  </div>

                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model.number="formSPK.qty_target"
                      type="number"
                      outlined
                      label="Total Target Qty"
                      :rules="[(val) => val > 0 || 'Target qty harus lebih dari 0']"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="formSPK.tahapan_fabrikasi"
                      :options="statusOptions"
                      outlined
                      label="Tahapan Produksi Awal"
                    />
                  </div>
                </div>
              </q-card>
            </div>

            <!-- FORM SEBELAH KANAN: ALOKASI TIM & PENJADWALAN -->
            <div class="col-12 col-md-4">
              <q-card
                flat
                bordered
                class="q-pa-lg bg-white q-gutter-md"
                style="border-radius: 12px; border-color: #dfe8df"
              >
                <div class="text-subtitle1 text-weight-bold text-green-10 row items-center">
                  <q-icon name="groups" class="q-mr-sm" size="sm" />
                  Alokasi & Penjadwalan
                </div>

                <!-- DROPDOWN PILIHAN TIM (SINKRON MASTER TIM PRODUKSI MANUFAKTUR) -->
                <q-select
                  v-model="formSPK.assigned_team"
                  use-input
                  input-debounce="0"
                  @new-value="createValueTeam"
                  :options="filteredTeamOptions"
                  @filter="filterTeam"
                  outlined
                  label="Pilih Tim / Operator Produksi"
                  placeholder="Pilih atau ketik tim baru..."
                  :rules="[(val) => !!val || 'Tim pelaksana wajib ditentukan']"
                />

                <!-- INPUT DEADLINE PRODUKSI -->
                <q-input
                  v-model="formSPK.deadline"
                  outlined
                  type="date"
                  label="Deadline Target Selesai"
                  stack-label
                />
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const COLLECTIONS = {
  spk: 'spk_fabrikasi',
  planning: 'planning_produksi_manufaktur',
  line: 'line_produksi_manufaktur',
  qc: 'qc_produksi_manufaktur',
  packing: 'packing_produksi_manufaktur',
  delivery: 'ready_delivery_manufaktur',
}

const statusOptions = ['SPK Fabrikasi', 'Routing Tahapan', 'Produksi', 'QC', 'Finished']
const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...statusOptions.map((status) => ({ label: status, value: status })),
]

const $q = useQuasar()
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const statusFilter = ref('all')
const showReleaseDialog = ref(false)
const spkRows = ref([])
const planningRows = ref([])
const lineRows = ref([])
const qcRows = ref([])
const packingRows = ref([])
const deliveryRows = ref([])
let unsubscribers = []

// REAKTIF DATA MASTER
const appId = typeof window !== 'undefined' && window.__app_id ? window.__app_id : 'default-app-id'
const masterCustomerOptions = ref([])
const masterProdukOptions = ref([])
const masterTeamOptions = ref([]) // Sinkron murni dengan Master Tim Produksi

const filteredCustomerOptions = ref([])
const filteredProdukOptions = ref([])
const filteredTeamOptions = ref([])
const selectedProduk = ref(null)

// STATE FORM INPUT MANUAL SPK
const formSPK = ref({
  nomor_spk: '',
  customer: '',
  nama_produk: '',
  qty_target: 1,
  assigned_team: '',
  tahapan_fabrikasi: 'SPK Fabrikasi',
  deadline: '',
})

// MURNI AMBIL DARI DATA MASTER FIREBASE
const customerList = computed(() => {
  return masterCustomerOptions.value
})

const produkList = computed(() => {
  return masterProdukOptions.value
})

// Dipetakan ke format string murni untuk dropdown, murni data personel real di database Anda
const teamList = computed(() => {
  return masterTeamOptions.value.map((t) => (typeof t === 'object' ? t.label : t))
})

// MEMUAT DATA MASTER SECARA DINAMIS DARI MODUL MANUFAKTUR (RULE 1 & ROOT CHANNELS)
const loadMasterData = async () => {
  try {
    // 1. Ambil data produk murni dari sub-koleksi master_produk manufaktur
    const prodColRef = collection(db, 'artifacts', appId, 'public', 'data', 'master_produk')
    const prodSnap = await getDocs(prodColRef).catch(() => null)

    if (prodSnap && !prodSnap.empty) {
      masterProdukOptions.value = prodSnap.docs.map((doc) => {
        const d = doc.data()
        const label = d.nama_produk || d.nama || d.nama_material || 'Tanpa Nama'
        return { label, value: label }
      })
    } else {
      // Cadangan ke root master_produk jika sub-koleksi belum diinisiasi
      const rootProdSnap = await getDocs(collection(db, 'master_produk')).catch(() => null)
      if (rootProdSnap && !rootProdSnap.empty) {
        masterProdukOptions.value = rootProdSnap.docs.map((doc) => {
          const d = doc.data()
          const label = d.nama_produk || d.nama_material || 'Tanpa Nama'
          return { label, value: label }
        })
      }
    }

    // 2. Ambil data customer dari sub-koleksi customer / penawaran manufaktur
    const custColRef = collection(db, 'artifacts', appId, 'public', 'data', 'customer')
    const custSnap = await getDocs(custColRef).catch(() => null)
    let customersList = []

    if (custSnap && !custSnap.empty) {
      customersList = custSnap.docs.map((doc) => doc.data().nama_customer || doc.data().nama || '')
    } else {
      // Ambil alternatif dari data penawaran_manufaktur
      const penawaranColRef = collection(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'penawaran_manufaktur',
      )
      const penawaranSnap = await getDocs(penawaranColRef).catch(() => null)
      if (penawaranSnap && !penawaranSnap.empty) {
        customersList = penawaranSnap.docs.map((doc) => doc.data().nama_customer)
      }
    }

    if (customersList.length > 0) {
      masterCustomerOptions.value = [...new Set(customersList)].filter(Boolean)
    }

    // 3. Ambil data TIM PRODUKSI (Personel Workshop) secara cerdas & tangguh
    let loadedTeams = []
    const collectionsToTry = [
      'tim_produksi',
      'master_tim_produksi',
      'master_tim',
      'teams',
      'personel_produksi',
      'personil_produksi',
      'tim_produksi_manufaktur',
      'master_tim_produksi_manufaktur',
      'karyawan',
      'karyawan_produksi',
      'operator_produksi',
      'operators',
    ]

    // Coba sub-koleksi artifact (Rule 1)
    for (const colName of collectionsToTry) {
      const artRef = collection(db, 'artifacts', appId, 'public', 'data', colName)
      const snap = await getDocs(artRef).catch(() => null)
      if (snap && !snap.empty) {
        snap.docs.forEach((doc) => {
          const d = doc.data()
          // Sangat penting: Mendeteksi variasi penulisan bahasa Indonesia (personil vs personel)
          const name =
            d.nama_personil ||
            d.nama_personel ||
            d.personil ||
            d.personel ||
            d.nama ||
            d.nama_tim ||
            d.nama_karyawan ||
            d.operator ||
            ''
          const jabatan = d.jabatan || d.skill || d.role || d.posisi || ''
          if (name) {
            loadedTeams.push({ label: name, value: name, jabatan: jabatan })
          }
        })
      }
    }

    // Coba root level (Fallback)
    for (const colName of collectionsToTry) {
      const rootRef = collection(db, colName)
      const snap = await getDocs(rootRef).catch(() => null)
      if (snap && !snap.empty) {
        snap.docs.forEach((doc) => {
          const d = doc.data()
          const name =
            d.nama_personil ||
            d.nama_personel ||
            d.personil ||
            d.personel ||
            d.nama ||
            d.nama_tim ||
            d.nama_karyawan ||
            d.operator ||
            ''
          const jabatan = d.jabatan || d.skill || d.role || d.posisi || ''
          if (name) {
            loadedTeams.push({ label: name, value: name, jabatan: jabatan })
          }
        })
      }
    }

    if (loadedTeams.length > 0) {
      // Bersihkan data duplikasi jika personel ada di beberapa koleksi sekaligus
      const uniqueTeams = []
      const seen = new Set()
      for (const t of loadedTeams) {
        const key = t.label.toLowerCase().trim()
        if (!seen.has(key)) {
          seen.add(key)
          uniqueTeams.push(t)
        }
      }
      masterTeamOptions.value = uniqueTeams
    } else {
      // Fallback terakhir ke karyawan jika tim_produksi benar-benar kosong di database baru
      const karyawanSnap = await getDocs(collection(db, 'karyawan')).catch(() => null)
      if (karyawanSnap && !karyawanSnap.empty) {
        const filtered = karyawanSnap.docs
          .map((doc) => {
            const k = doc.data()
            const name = k.nama_karyawan || k.nama || ''
            const jabatan = k.jabatan || k.departemen || ''
            return name ? { label: name, value: name, jabatan: jabatan } : null
          })
          .filter(Boolean)
        if (filtered.length > 0) {
          masterTeamOptions.value = filtered
        }
      }
    }
  } catch (err) {
    console.error('Gagal memuat database master:', err)
  }
}

// DROPDOWN FILTER & HELPER UNTUK CUSTOMER
const filterCustomer = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    filteredCustomerOptions.value = customerList.value.filter(
      (v) => v.toLowerCase().indexOf(needle) > -1,
    )
  })
}

const createValueCustomer = (val, done) => {
  if (val.length > 0) {
    if (!masterCustomerOptions.value.includes(val)) {
      masterCustomerOptions.value.push(val)
    }
    done(val, 'toggle')
  }
}

// DROPDOWN FILTER & HELPER UNTUK PRODUK
const filterProduk = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    filteredProdukOptions.value = produkList.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    )
  })
}

const createValueProduk = (val, done) => {
  if (val.length > 0) {
    const exists = masterProdukOptions.value.some(
      (p) => p.label.toLowerCase() === val.toLowerCase(),
    )
    const newObj = { label: val, value: val }
    if (!exists) {
      masterProdukOptions.value.push(newObj)
    }
    done(newObj, 'toggle')
  }
}

const onProdukSelected = (val) => {
  if (val) {
    formSPK.value.nama_produk = typeof val === 'object' ? val.value : val
  } else {
    formSPK.value.nama_produk = ''
  }
}

// DROPDOWN FILTER & HELPER UNTUK TIM PRODUKSI
const filterTeam = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    filteredTeamOptions.value = teamList.value.filter((v) => v.toLowerCase().indexOf(needle) > -1)
  })
}

const createValueTeam = (val, done) => {
  if (val.length > 0) {
    if (
      !masterTeamOptions.value.some(
        (t) => (typeof t === 'object' ? t.label : t).toLowerCase() === val.toLowerCase(),
      )
    ) {
      masterTeamOptions.value.push({ label: val, value: val, jabatan: 'Operator Baru' })
    }
    done(val, 'toggle')
  }
}

// FUNGSI MEMBUKA FORM DAN GENERATE NOMOR SPK SECARA OTOMATIS
const openReleaseForm = () => {
  const randNum = Math.floor(1000 + Math.random() * 9000)

  // Pre-populate pilihan awal agar user tidak menemui dropdown kosong sesaat setelah dialog dibuka
  filteredCustomerOptions.value = customerList.value
  filteredProdukOptions.value = produkList.value
  filteredTeamOptions.value = teamList.value

  formSPK.value = {
    nomor_spk: `SPK/AGRA/${new Date().getFullYear()}/${randNum}`,
    customer: '',
    nama_produk: '',
    qty_target: 1,
    assigned_team: teamList.value[0] || '',
    tahapan_fabrikasi: 'SPK Fabrikasi',
    deadline: '',
  }
  selectedProduk.value = null
  showReleaseDialog.value = true
}

// FUNGSI SIMPAN SPK SECARA MANUAL KE FIRESTORE
const saveSPK = async () => {
  if (!formSPK.value.nama_produk || !formSPK.value.customer) {
    $q.notify({ type: 'negative', message: 'Lengkapi Nama Produk dan Customer!' })
    return
  }
  if (!formSPK.value.assigned_team) {
    $q.notify({ type: 'negative', message: 'Tentukan pelaksana / Tim Produksi!' })
    return
  }
  if (formSPK.value.qty_target <= 0) {
    $q.notify({ type: 'negative', message: 'Target Qty harus lebih besar dari 0!' })
    return
  }

  saving.value = true
  try {
    // Cari jabatan untuk tim/personel terpilih
    const selectedTeamObj = masterTeamOptions.value.find(
      (t) => (typeof t === 'object' ? t.label : t) === formSPK.value.assigned_team,
    )

    // Default jabatan jika data kosong
    const jabatan_tim =
      selectedTeamObj && typeof selectedTeamObj === 'object'
        ? selectedTeamObj.jabatan || 'Workshop Operator'
        : 'Workshop Operator'

    const payload = {
      nomor_spk: formSPK.value.nomor_spk,
      nama_produk: formSPK.value.nama_produk,
      customer: formSPK.value.customer,
      qty_target: Number(formSPK.value.qty_target),
      qty_selesai: 0,
      qty_reject: 0,
      assigned_team: formSPK.value.assigned_team,
      jabatan_tim: jabatan_tim,
      tahapan_fabrikasi: formSPK.value.tahapan_fabrikasi,
      progress: 0,
      status_pekerjaan: 'SPK Fabrikasi',
      deadline: formSPK.value.deadline,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    }

    // Masukkan data ke koleksi 'spk_fabrikasi'
    await addDoc(collection(db, COLLECTIONS.spk), payload)

    $q.notify({ type: 'positive', message: 'Surat Perintah Kerja (SPK) Berhasil Dirilis!' })
    showReleaseDialog.value = false
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal merilis SPK.' })
  } finally {
    saving.value = false
  }
}

const columns = [
  { name: 'nomor_spk', align: 'left', label: 'Nomor SPK', field: 'nomor_spk', sortable: true },
  {
    name: 'nama_produk',
    align: 'left',
    label: 'Material / Produk',
    field: 'nama_produk',
    sortable: true,
  },
  {
    name: 'line_produksi',
    align: 'left',
    label: 'Tahapan Hack',
    field: 'tahapan_aktif',
    sortable: true,
  },
  { name: 'qty_target', align: 'right', label: 'Qty Target', field: 'qty_target', sortable: true },
  {
    name: 'assigned_team',
    align: 'left',
    label: 'Assigned Operator',
    field: 'assigned_team',
    sortable: true,
  },
  {
    name: 'qty_selesai',
    align: 'right',
    label: 'Qty Selesai',
    field: 'qty_selesai',
    sortable: true,
  },
  { name: 'qty_reject', align: 'right', label: 'Reject QC', field: 'qty_reject', sortable: true },
  {
    name: 'progress',
    align: 'left',
    label: 'Progress Produksi',
    field: 'progress',
    sortable: true,
  },
  { name: 'stage', align: 'center', label: 'Flow' },
  { name: 'status', align: 'center', label: 'Status Realtime', field: 'status', sortable: true },
]

const monitoringRows = computed(() => {
  const map = new Map()
  const ensureRow = (source) => {
    const key = source.nomor_spk || source.id
    if (!key) return null
    if (!map.has(key)) {
      map.set(key, {
        nomor_spk: key,
        nama_produk: source.nama_produk || source.nama_material || '-',
        customer: source.customer || '',
        line_produksi: source.line_produksi || source.tahapan_fabrikasi || '',
        tahapan_aktif: source.tahapan_fabrikasi || source.line_produksi || '',
        urutan_tahapan: Number(source.urutan_tahapan || 0),
        assigned_team: source.tim_produksi || source.assigned_team || '',
        jabatan_tim: source.jabatan_tim || source.jabatan_tim_produksi || '',
        qty_target: Number(source.qty_target || 0),
        qty_selesai: Number(source.qty_selesai || source.qty_packing || source.qty_ready || 0),
        qty_reject: Number(source.qty_reject || source.reject_qty || 0),
        spk: null,
        planning: null,
        line: null,
        qc: null,
        packing: null,
        delivery: null,
      })
    }
    const row = map.get(key)
    row.nama_produk =
      row.nama_produk !== '-' ? row.nama_produk : source.nama_produk || source.nama_material || '-'
    row.customer = row.customer || source.customer || ''
    row.line_produksi = row.line_produksi || source.line_produksi || source.tahapan_fabrikasi || ''
    row.tahapan_aktif = row.tahapan_aktif || source.tahapan_fabrikasi || source.line_produksi || ''
    row.urutan_tahapan = row.urutan_tahapan || Number(source.urutan_tahapan || 0)
    row.assigned_team = row.assigned_team || source.tim_produksi || source.assigned_team || ''
    row.jabatan_tim = row.jabatan_tim || source.jabatan_tim || source.jabatan_tim_produksi || ''
    row.qty_target = row.qty_target || Number(source.qty_target || source.qty_approved_qc || 0)
    row.qty_selesai =
      row.qty_selesai || Number(source.qty_selesai || source.qty_packing || source.qty_ready || 0)
    row.qty_reject = row.qty_reject || Number(source.qty_reject || source.reject_qty || 0)
    return row
  }

  spkRows.value.forEach((item) => {
    const row = ensureRow(item)
    if (row) row.spk = item
  })
  planningRows.value.forEach((item) => {
    const row = ensureRow(item)
    if (row) row.planning = item
  })
  lineRows.value.forEach((item) => {
    const row = ensureRow(item)
    if (row) row.line = item
  })
  qcRows.value.forEach((item) => {
    const row = ensureRow(item)
    if (row) row.qc = item
  })
  packingRows.value.forEach((item) => {
    const row = ensureRow(item)
    if (row) row.packing = item
  })
  deliveryRows.value.forEach((item) => {
    const row = ensureRow(item)
    if (row) row.delivery = item
  })

  return Array.from(map.values()).map((row) => {
    const status = realtimeStatus(row)
    const progress = productionProgress(row)
    return {
      ...row,
      status,
      progress,
      stages: buildStages(row),
    }
  })
})

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return monitoringRows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'all' || row.status === statusFilter.value
    const matchesSearch =
      !keyword ||
      [
        row.nomor_spk,
        row.nama_produk,
        row.customer,
        row.line_produksi,
        row.tahapan_aktif,
        row.assigned_team,
        row.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    return matchesStatus && matchesSearch
  })
})

const summaryCards = computed(() => [
  {
    title: 'Produksi Hack',
    value: monitoringRows.value.filter((row) =>
      ['SPK Fabrikasi', 'Routing Tahapan', 'Produksi', 'QC'].includes(row.status),
    ).length,
    icon: 'precision_manufacturing',
    color: 'green-10',
  },
  {
    title: 'SPK Fabrikasi',
    value: spkRows.value.length,
    icon: 'description',
    color: 'blue-grey-7',
  },
  {
    title: 'QC Pending',
    value: qcRows.value.filter((row) => ['MENUNGGU_QC', 'QC_PROCESS'].includes(row.status_qc))
      .length,
    icon: 'pending_actions',
    color: 'orange-9',
  },
  {
    title: 'Reject QC',
    value: formatNumber(qcRows.value.reduce((sum, row) => sum + Number(row.qty_reject || 0), 0)),
    icon: 'report_problem',
    color: 'negative',
  },
  {
    title: 'Packing Process',
    value: packingRows.value.filter((row) => row.status_packing === 'PACKING_PROCESS').length,
    icon: 'inventory_2',
    color: 'blue-grey-7',
  },
  {
    title: 'Ready Delivery',
    value: deliveryRows.value.filter((row) => row.status_delivery === 'READY_DELIVERY').length,
    icon: 'local_shipping',
    color: 'positive',
  },
])

const flowStages = computed(() => [
  {
    title: 'Quotation Approved',
    value: spkRows.value.filter((row) => row.status_pekerjaan === 'Quotation Approved').length,
    icon: 'verified',
  },
  { title: 'SPK Fabrikasi', value: spkRows.value.length, icon: 'description' },
  {
    title: 'Routing Tahapan',
    value: spkRows.value.filter((row) => row.tahapan_fabrikasi_id).length,
    icon: 'route',
  },
  {
    title: 'Produksi',
    value:
      spkRows.value.filter((row) => row.status_pekerjaan === 'Produksi').length +
      lineRows.value.length,
    icon: 'precision_manufacturing',
  },
  { title: 'QC', value: qcRows.value.length, icon: 'fact_check' },
  {
    title: 'Finished',
    value:
      spkRows.value.filter((row) => row.status_pekerjaan === 'Finished').length +
      deliveryRows.value.length,
    icon: 'inventory',
  },
])

const averageProgress = computed(() => {
  if (!monitoringRows.value.length) return 0
  const total = monitoringRows.value.reduce((sum, row) => sum + row.progress, 0)
  return Math.round(total / monitoringRows.value.length)
})

const timelineItems = computed(() =>
  monitoringRows.value.slice(0, 6).map((row) => ({
    nomor_spk: row.nomor_spk,
    title: `${row.nomor_spk} - ${row.status}`,
    subtitle: row.nama_produk || '-',
    caption: `${row.tahapan_aktif || 'Tahapan belum ditentukan'} | ${row.assigned_team || 'Tim belum ditentukan'} | Progress ${row.progress}%`,
    icon: statusIcon(row.status),
    color: statusColor(row.status),
  })),
)

const realtimeStatus = (row) => {
  if (row.spk?.status_pekerjaan) return row.spk.status_pekerjaan
  if (row.delivery?.status_delivery === 'DELIVERED') return 'Delivered'
  if (row.delivery?.status_delivery === 'READY_DELIVERY') return 'Ready Delivery'
  if (row.delivery?.status_delivery === 'WAITING_PICKUP') return 'Ready Delivery'
  if (row.packing?.status_packing === 'READY_DELIVERY') return 'Ready Delivery'
  if (row.packing?.status_packing === 'PACKING_PROCESS') return 'Packing'
  if (row.qc?.status_qc === 'QC_APPROVED') return 'Packing'
  if (row.qc?.status_qc === 'QC_PROCESS' || row.qc?.status_qc === 'MENUNGGU_QC') return 'QC'
  if (row.line?.status === 'On Progress' || row.planning?.status === 'On Progress')
    return 'On Progress'
  return 'SPK Fabrikasi'
}

const productionProgress = (row) => {
  if (row.spk) return Math.min(Math.max(Number(row.spk.progress || 0), 0), 100)
  if (row.status === 'Delivered') return 100
  if (row.status === 'Finished') return 100
  if (row.status === 'Ready Delivery') return 90
  if (row.status === 'Packing') return 75
  if (row.status === 'QC') return 60
  const target = Number(row.qty_target || 0)
  if (target) return Math.min(55, Math.round((Number(row.qty_selesai || 0) / target) * 55))
  if (row.status === 'On Progress') return 35
  return row.planning ? 15 : 0
}

const buildStages = (row) => [
  { key: 'quotation', label: 'Quotation Approved', icon: 'verified', done: !!row.spk },
  { key: 'spk', label: 'SPK Fabrikasi', icon: 'description', done: !!row.spk },
  { key: 'routing', label: 'Routing Tahapan', icon: 'route', done: !!row.tahapan_aktif },
  {
    key: 'produksi',
    label: 'Produksi',
    icon: 'precision_manufacturing',
    done: !!row.line || ['Produksi', 'QC', 'Finished'].includes(row.status),
  },
  {
    key: 'qc',
    label: 'QC',
    icon: 'fact_check',
    done: !!row.qc || ['QC', 'Finished'].includes(row.status),
  },
  {
    key: 'finished',
    label: 'Finished',
    icon: 'inventory',
    done: row.status === 'Finished' || !!row.delivery,
  },
]

const statusColor = (status) => {
  const colors = {
    'SPK Fabrikasi': 'green-10',
    'Routing Tahapan': 'deep-purple-6',
    Produksi: 'orange-9',
    Finished: 'positive',
    Waiting: 'blue-grey-6',
    'On Progress': 'orange-9',
    QC: 'deep-purple-6',
    Packing: 'blue-grey-7',
    'Ready Delivery': 'green-10',
    Delivered: 'positive',
  }
  return colors[status] || 'grey-6'
}

const statusIcon = (status) => {
  const icons = {
    'SPK Fabrikasi': 'description',
    'Routing Tahapan': 'route',
    Produksi: 'precision_manufacturing',
    Finished: 'inventory',
    Waiting: 'hourglass_empty',
    'On Progress': 'precision_manufacturing',
    QC: 'fact_check',
    Packing: 'inventory_2',
    'Ready Delivery': 'local_shipping',
    Delivered: 'verified',
  }
  return icons[status] || 'monitoring'
}

const progressColor = (value) => {
  if (value >= 90) return 'green-10'
  if (value >= 60) return 'green-7'
  if (value >= 30) return 'orange-9'
  return 'blue-grey-6'
}

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const subscribeCollection = (collectionName, targetRef) => {
  const collectionQuery = query(collection(db, collectionName), orderBy('updated_at', 'desc'))
  return onSnapshot(
    collectionQuery,
    (snapshot) => {
      targetRef.value = snapshot.docs.map((itemDoc) => ({
        id: itemDoc.id,
        ...itemDoc.data(),
      }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: `Gagal memuat ${collectionName}` })
    },
  )
}

const loadMonitoring = () => {
  loading.value = true
  unsubscribers.forEach((unsubscribe) => unsubscribe())
  unsubscribers = [
    subscribeCollection(COLLECTIONS.spk, spkRows),
    subscribeCollection(COLLECTIONS.planning, planningRows),
    subscribeCollection(COLLECTIONS.line, lineRows),
    subscribeCollection(COLLECTIONS.qc, qcRows),
    subscribeCollection(COLLECTIONS.packing, packingRows),
    subscribeCollection(COLLECTIONS.delivery, deliveryRows),
  ]
}

onMounted(() => {
  loadMonitoring()
  loadMasterData()
})

onUnmounted(() => {
  unsubscribers.forEach((unsubscribe) => unsubscribe())
})
</script>

<style scoped>
.font-pro {
  font-family:
    'Inter',
    -apple-system,
    sans-serif;
}

.leading-tight {
  line-height: 1.15;
}

.summary-card,
.dashboard-card,
.filter-card,
.table-card {
  border-color: #dfe8df;
  border-radius: 20px;
  overflow: hidden;
}

.summary-label {
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.summary-value {
  color: #1b5e20;
  font-size: 28px;
  font-weight: 900;
  line-height: 1;
  margin-top: 5px;
}

.card-header {
  align-items: center;
  border-bottom: 1px solid #edf1f0;
  display: flex;
  justify-content: space-between;
  padding: 14px 18px;
}

.flow-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.flow-stage {
  align-items: center;
  background: #f7fbf8;
  border: 1px solid #dfe8df;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  min-height: 112px;
  padding: 14px 10px;
  text-align: center;
}

.flow-stage__title {
  color: #1f2a24;
  font-size: 11px;
  font-weight: 900;
  line-height: 1.2;
  margin-top: 9px;
}

.flow-stage__value {
  color: #1b5e20;
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
  margin-top: 8px;
}

.timeline-panel {
  max-height: 284px;
  overflow-y: auto;
}

.monitoring-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}

.table-head {
  text-transform: uppercase;
}

.monitoring-row {
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.monitoring-row:hover {
  background: rgba(27, 94, 32, 0.04);
}

.progress-cell {
  min-width: 160px;
}

.progress-label {
  color: #667085;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.progress-value {
  color: #1b5e20;
  font-size: 11px;
  font-weight: 900;
}

.stage-mini {
  display: inline-flex;
  gap: 7px;
}

.status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  min-width: 104px;
  justify-content: center;
}

.release-spk-bar {
  height: 56px;
  padding: 0 16px;
}

.release-spk-title {
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
}

@media (max-width: 1023px) {
  .flow-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 599px) {
  .flow-grid {
    grid-template-columns: 1fr;
  }
}
</style>
