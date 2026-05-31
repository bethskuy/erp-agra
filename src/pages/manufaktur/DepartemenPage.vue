<template>
  <q-page class="departemen-page bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <div class="row items-center justify-between q-mb-xl animate-fade">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Departemen Manufacturing
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Workflow & Monitoring Produksi
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Pilih departemen untuk masuk ke area monitoring, tracking progress, dan workflow produksi
          masing-masing.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="settings"
          label="Master Departemen"
          no-caps
          class="full-width-mobile q-px-lg shadow-2"
          to="/manufaktur/master-produksi/departemen"
        />
      </div>
    </div>

    <q-card flat bordered class="filter-card q-mb-lg bg-white">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-7">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari departemen, kode, PIC, atau deskripsi..."
              bg-color="white"
              class="search-input"
            >
              <template #prepend>
                <q-icon name="search" color="green-10" />
              </template>
              <template #append v-if="search">
                <q-icon name="close" class="cursor-pointer" @click="search = ''" />
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
              label="Status"
            />
          </div>
          <div class="col-12 col-md-auto">
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
              {{ filteredDepartments.length }} DEPARTEMEN
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div v-if="loading" class="row q-col-gutter-lg">
      <div v-for="item in 6" :key="item" class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="department-card rounded-20 bg-white">
          <q-card-section class="q-pa-lg text-center">
            <q-skeleton type="QAvatar" size="80px" class="q-mx-auto q-mb-md" />
            <q-skeleton type="text" width="60%" class="q-mx-auto" />
            <q-skeleton type="text" width="82%" class="q-mx-auto q-mt-sm" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-else-if="filteredDepartments.length" class="row q-col-gutter-lg animate-fade-up">
      <div v-for="departemen in filteredDepartments" :key="departemen.id" class="col-12 col-sm-6 col-md-4">
        <q-card
          flat
          bordered
          class="department-card rounded-20 cursor-pointer transition-all hover-shadow bg-white"
          @click="enterDepartment(departemen)"
        >
          <q-card-section class="q-pa-lg text-center">
            <q-avatar
              size="80px"
              :color="departemen.status === 'Aktif' ? 'green-1' : 'grey-3'"
              :text-color="departemen.status === 'Aktif' ? 'green-10' : 'grey-7'"
              :icon="departmentIcon(departemen)"
              class="q-mb-md shadow-2"
            />
            <div class="text-h6 text-weight-bolder text-green-10 uppercase ellipsis">
              {{ departemen.nama_departemen || '-' }}
            </div>
            <div class="text-caption text-grey-6 q-mt-xs">
              {{ departemen.kode_departemen || 'Tanpa kode' }}
            </div>
            <div class="department-description text-caption text-grey-7 q-mt-sm">
              {{ departemen.deskripsi || 'Departemen produksi manufacturing PT AGRA.' }}
            </div>
            <div v-if="departemen.pic" class="q-mt-md">
              <q-chip dense square color="green-1" text-color="green-10" icon="person">
                {{ departemen.pic }}
              </q-chip>
            </div>
            <q-badge
              v-if="spkMasukCount(departemen.id)"
              color="orange-9"
              floating
              class="department-spk-badge text-weight-bold"
            >
              {{ spkMasukCount(departemen.id) }} SPK baru
            </q-badge>
            <q-badge
              v-if="planningBaruCount(departemen.id)"
              color="primary"
              floating
              class="department-planning-badge text-weight-bold"
            >
              {{ planningBaruCount(departemen.id) }} planning
            </q-badge>
          </q-card-section>

          <q-separator inset />

          <q-card-section class="department-card__footer bg-green-10 text-white q-py-sm">
            <div class="row items-center justify-between no-wrap">
              <q-chip
                dense
                square
                text-color="white"
                :color="departemen.status === 'Aktif' ? 'positive' : 'grey-7'"
                class="status-chip"
              >
                {{ departemen.status || '-' }}
              </q-chip>
              <q-btn
                flat
                dense
                no-caps
                color="white"
                icon-right="login"
                label="Masuk Departemen"
                @click.stop="enterDepartment(departemen)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card v-else flat bordered class="empty-card rounded-20 bg-white">
      <q-card-section class="q-pa-xl text-center">
        <q-avatar size="88px" color="green-1" text-color="green-10" icon="corporate_fare" />
        <div class="text-h6 text-weight-bold text-green-10 q-mt-md">
          Belum ada departemen yang tersedia
        </div>
        <div class="text-body2 text-grey-7 q-mt-sm">
          Data departemen akan muncul otomatis setelah dibuat di Master Departemen.
        </div>
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="add"
          label="Tambah di Master Departemen"
          no-caps
          class="q-mt-lg"
          to="/manufaktur/master-produksi/departemen"
        />
      </q-card-section>
    </q-card>

    <div class="q-py-xl"></div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { collection, collectionGroup, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const MASTER_DEPARTEMEN_COLLECTION = 'manufactur_master_departemen'
const PLANNING_COLLECTION = 'planning_produksi_manufaktur'
const SPK_SUBCOLLECTION = 'spk'

const $q = useQuasar()
const router = useRouter()
const departments = ref([])
const spkRows = ref([])
const planningRows = ref([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref('Semua')
let unsubscribeDepartments = null
let unsubscribeSpk = null
let unsubscribePlanning = null

const statusFilterOptions = [
  { label: 'Semua Status', value: 'Semua' },
  { label: 'Aktif', value: 'Aktif' },
  { label: 'Nonaktif', value: 'Nonaktif' },
]

const filteredDepartments = computed(() => {
  const term = search.value.toLowerCase().trim()

  return departments.value.filter((departemen) => {
    const matchesStatus =
      statusFilter.value === 'Semua' || departemen.status === statusFilter.value
    const matchesSearch =
      !term ||
      [
        departemen.kode_departemen,
        departemen.nama_departemen,
        departemen.pic,
        departemen.deskripsi,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)

    return matchesStatus && matchesSearch
  })
})

const departmentIcon = (departemen) => {
  const text = `${departemen.nama_departemen || ''} ${departemen.kode_departemen || ''}`.toLowerCase()

  if (text.includes('qc') || text.includes('quality')) return 'fact_check'
  if (text.includes('gudang') || text.includes('warehouse')) return 'warehouse'
  if (text.includes('packing')) return 'inventory_2'
  if (text.includes('maintenance') || text.includes('mtc')) return 'handyman'
  if (text.includes('produksi') || text.includes('production')) return 'precision_manufacturing'

  return 'corporate_fare'
}

const spkMasukCount = (departemenId) =>
  spkRows.value.filter(
    (spk) =>
      spk.status === 'Menunggu Produksi' &&
      (spk.departemen_path_id === departemenId || spk.departemen_id === departemenId),
  ).length

const planningBaruCount = (departemenId) =>
  planningRows.value.filter((planning) => {
    const status = planning.status_planning || planning.status
    return (
      planning.is_new !== false &&
      status !== 'Selesai' &&
      (planning.departemen_id === departemenId || planning.tujuan_departemen?.id === departemenId)
    )
  }).length

const enterDepartment = (departemen) => {
  router.push({
    name: 'manufaktur-departemen-detail',
    params: { id: departemen.id },
    query: {
      nama_departemen: departemen.nama_departemen || '',
      kode: departemen.kode_departemen || '',
    },
  })
}

onMounted(() => {
  loading.value = true
  unsubscribeDepartments = onSnapshot(
    query(collection(db, MASTER_DEPARTEMEN_COLLECTION), orderBy('created_at', 'desc')),
    (snapshot) => {
      departments.value = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat departemen manufacturing.' })
    },
  )

  unsubscribeSpk = onSnapshot(
    collectionGroup(db, SPK_SUBCOLLECTION),
    (snapshot) => {
      spkRows.value = snapshot.docs.map((spkDoc) => ({
        id: spkDoc.id,
        departemen_path_id: spkDoc.ref.parent.parent?.id || '',
        ...spkDoc.data(),
      }))
    },
    (error) => {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal memuat badge SPK departemen.' })
    },
  )

  unsubscribePlanning = onSnapshot(
    query(collection(db, PLANNING_COLLECTION), orderBy('created_at', 'desc')),
    (snapshot) => {
      planningRows.value = snapshot.docs.map((planningDoc) => ({
        id: planningDoc.id,
        ...planningDoc.data(),
      }))
    },
    (error) => {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal memuat badge planning produksi.' })
    },
  )
})

onUnmounted(() => {
  if (unsubscribeDepartments) unsubscribeDepartments()
  if (unsubscribeSpk) unsubscribeSpk()
  if (unsubscribePlanning) unsubscribePlanning()
})
</script>

<style scoped>
.font-pro {
  font-family:
    'Inter',
    -apple-system,
    sans-serif;
}

.rounded-20 {
  border-radius: 20px;
}

.filter-card,
.department-card,
.empty-card {
  border-color: rgba(15, 60, 45, 0.1);
}

.department-card {
  min-height: 292px;
  overflow: hidden;
  position: relative;
}

.department-spk-badge {
  right: 12px;
  top: 12px;
}

.department-planning-badge {
  right: 12px;
  top: 42px;
}

.department-card__footer {
  min-height: 52px;
}

.department-description {
  min-height: 38px;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.hover-shadow:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
}

.transition-all {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.status-chip {
  min-width: 72px;
  justify-content: center;
}

.search-input :deep(.q-field__control) {
  border-radius: 30px;
}

.animate-fade {
  animation: fadeIn 0.8s ease-out;
}

.animate-fade-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

.block {
  display: block;
}

.uppercase {
  text-transform: uppercase;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 599px) {
  .full-width-mobile {
    width: 100%;
  }

  .department-card__footer .q-btn {
    font-size: 12px;
  }
}
</style>
