<template>
  <q-page class="dept-page font-pro">

    <!-- ═══════ HEADER ═══════ -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-badge">MANUFACTURING</div>
          <h1 class="header-title">Departemen Manufacturing</h1>
          <p class="header-subtitle">
            Pilih departemen untuk masuk ke area monitoring, tracking progress, dan workflow produksi masing-masing.
          </p>
        </div>
        <div class="header-right">
          <q-btn
            unelevated
            no-caps
            class="btn-master"
            icon="settings"
            label="Master Departemen"
            to="/manufaktur/master-produksi/departemen"
          />
        </div>
      </div>
    </div>

    <!-- ═══════ URGENT ALERT BANNER ═══════ -->
    <div v-if="urgentPlanningList.length" class="urgent-banner">
      <div class="urgent-banner-inner">
        <div class="urgent-icon-wrap">
          <q-icon name="warning" size="28px" />
        </div>
        <div class="urgent-content">
          <div class="urgent-title">URGENT PRODUCTION</div>
          <div class="urgent-items">
            <div v-for="(item, idx) in urgentPlanningList" :key="idx" class="urgent-item">
              <span class="urgent-planning">{{ planningNumber(item) }}</span>
              <span class="urgent-sep">·</span>
              <span class="urgent-product">{{ planningProduct(item) }}</span>
              <span class="urgent-sep">·</span>
              <span class="urgent-department">{{ targetDepartment(item) }}</span>
            </div>
          </div>
        </div>
        <div class="urgent-count-badge">{{ urgentPlanningList.length }}</div>
      </div>
    </div>

    <!-- ═══════ SEARCH / FILTER BAR ═══════ -->
    <div class="glass-card filter-card">
      <div class="filter-grid">
        <div class="filter-search">
          <q-input
            v-model="search"
            dense
            rounded
            standout="bg-transparent"
            debounce="250"
            placeholder="Cari departemen, kode, PIC, atau deskripsi..."
            class="search-input"
            input-class="text-white"
          >
            <template #prepend>
              <q-icon name="search" color="cyan" />
            </template>
            <template #append v-if="search">
              <q-icon name="close" class="cursor-pointer text-grey-5" @click="search = ''" />
            </template>
          </q-input>
        </div>
        <div class="filter-select">
          <q-select
            v-model="statusFilter"
            :options="statusFilterOptions"
            dense
            rounded
            standout="bg-transparent"
            emit-value
            map-options
            label="Status"
            class="filter-input"
            label-color="grey-6"
            input-class="text-white"
            popup-content-class="dark-dropdown"
          />
        </div>
        <div class="filter-count">
          <div class="count-chip">
            <q-icon name="corporate_fare" size="16px" />
            <span>{{ filteredDepartments.length }} Departemen</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ LOADING SKELETON ═══════ -->
    <div v-if="loading" class="dept-grid">
      <div v-for="item in 6" :key="item" class="dept-card-wrap">
        <div class="glass-card dept-card dept-card--skeleton">
          <div class="dept-card-header">
            <q-skeleton type="QAvatar" size="48px" />
            <div style="flex:1;">
              <q-skeleton type="text" width="60%" />
              <q-skeleton type="text" width="40%" class="q-mt-xs" />
            </div>
          </div>
          <div class="dept-card-body">
            <q-skeleton type="text" width="80%" />
            <q-skeleton type="text" width="100%" class="q-mt-sm" />
            <q-skeleton type="text" width="60%" class="q-mt-sm" />
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ DEPARTMENT CARDS ═══════ -->
    <div v-else-if="filteredDepartments.length" class="dept-grid">
      <div v-for="departemen in filteredDepartments" :key="departemen.id" class="dept-card-wrap">
        <div
          class="glass-card dept-card"
          :class="{ 'dept-card--urgent': urgentPlanningCount(departemen.id) > 0 }"
          @click="enterDepartment(departemen)"
        >
          <!-- Card Header -->
          <div class="dept-card-header">
            <div class="dept-icon-wrap" :class="departemen.status === 'Aktif' ? 'dept-icon--active' : 'dept-icon--idle'">
              <q-icon :name="departmentIcon(departemen)" size="24px" />
            </div>
            <div class="dept-header-info">
              <div class="dept-name">{{ departemen.nama_departemen || '-' }}</div>
              <div class="dept-code">{{ departemen.kode_departemen || 'Tanpa kode' }}</div>
            </div>
            <div :class="['status-badge', departemen.status === 'Aktif' ? 'status-badge--active' : 'status-badge--idle']">
              <span class="status-dot"></span>
              {{ departemen.status || '-' }}
            </div>
          </div>

          <!-- Urgent Alert Inside Card -->
          <div v-if="urgentPlanningCount(departemen.id)" class="dept-urgent-strip">
            <q-icon name="bolt" size="14px" />
            <span>{{ urgentPlanningCount(departemen.id) }} urgent task{{ urgentPlanningCount(departemen.id) > 1 ? 's' : '' }}</span>
          </div>

          <!-- Card Body — Production Metrics -->
          <div class="dept-card-body">
            <div class="dept-description">
              {{ departemen.deskripsi || 'Departemen produksi manufacturing PT AGRA.' }}
            </div>

            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-label">Active Jobs</div>
                <div class="metric-value metric-value--cyan">{{ planningBaruCount(departemen.id) || 0 }}</div>
              </div>
              <div class="metric-item">
                <div class="metric-label">Total Planning</div>
                <div class="metric-value">{{ planningRowsForDepartment(departemen.id).length }}</div>
              </div>
              <div class="metric-item metric-item--wide">
                <div class="metric-label">Progress</div>
                <div class="metric-progress-row">
                  <q-linear-progress
                    rounded
                    size="8px"
                    :value="departmentProgress(departemen.id) / 100"
                    :color="progressBarColor(departmentProgress(departemen.id))"
                    track-color="grey-10"
                    class="dept-progress-bar"
                  />
                  <span class="metric-pct">{{ departmentProgress(departemen.id) }}%</span>
                </div>
              </div>
            </div>

            <div v-if="departemen.pic" class="dept-pic">
              <q-icon name="person" size="14px" color="cyan" />
              <span>{{ departemen.pic }}</span>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="dept-card-footer">
            <q-btn
              unelevated
              dense
              no-caps
              class="btn-enter"
              icon-right="login"
              label="Masuk Departemen"
              @click.stop="enterDepartment(departemen)"
            />
            <q-btn
              flat
              dense
              no-caps
              class="btn-workload"
              icon="assessment"
              label="Workload"
              @click.stop="enterDepartment(departemen)"
            />
          </div>

          <!-- Glow effect -->
          <div class="dept-card-glow"></div>
        </div>
      </div>
    </div>

    <!-- ═══════ EMPTY STATE ═══════ -->
    <div v-else class="glass-card empty-card">
      <div class="empty-content">
        <div class="empty-icon-wrap">
          <q-icon name="corporate_fare" size="56px" color="grey-7" />
        </div>
        <div class="empty-title">Belum ada departemen yang tersedia</div>
        <div class="empty-desc">Data departemen akan muncul otomatis setelah dibuat di Master Departemen.</div>
        <q-btn
          unelevated
          no-caps
          class="btn-master q-mt-lg"
          icon="add"
          label="Tambah di Master Departemen"
          to="/manufaktur/master-produksi/departemen"
        />
      </div>
    </div>

    <div class="q-py-xl"></div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const MASTER_DEPARTEMEN_COLLECTION = 'manufactur_master_departemen'
const PLANNING_COLLECTION = 'mf_production_planning'

const $q = useQuasar()
const router = useRouter()
const departments = ref([])
const planningRows = ref([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref('Semua')
let unsubscribeDepartments = null
let unsubscribePlanning = null

const statusFilterOptions = [
  { label: 'Semua Status', value: 'Semua' },
  { label: 'Aktif', value: 'Aktif' },
  { label: 'Nonaktif', value: 'Nonaktif' },
]

const filteredDepartments = computed(() => {
  const term = search.value.toLowerCase().trim()

  return departments.value
    .filter((departemen) => {
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
    .sort(compareDepartmentsByPlanningWorkload)
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

const normalizeStatus = (status) => String(status || '').trim().toLowerCase()

const normalizePriority = (priority) => {
  const normalized = String(priority || '').trim().toLowerCase()
  if (normalized === 'urgent') return 'Urgent'
  if (normalized === 'high') return 'High'
  if (normalized === 'low') return 'Low'
  return 'Medium'
}

const priorityRank = (priority) => {
  const normalized = normalizePriority(priority)
  if (normalized === 'Urgent') return 0
  if (normalized === 'High') return 1
  if (normalized === 'Medium') return 2
  return 3
}

const timestampOf = (value) => {
  if (!value) return Number.MAX_SAFE_INTEGER
  const rawDate = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  const time = rawDate.getTime()
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time
}

const routeStepForDepartment = (planning, departemenId) =>
  Array.isArray(planning.route_departemen)
    ? planning.route_departemen.find((item) => item.id === departemenId || item.value === departemenId)
    : null

const assignedToDepartment = (planning, departemenId) =>
  Array.isArray(planning.assigned_departments) &&
  planning.assigned_departments.some(
    (item) =>
      item.department_id === departemenId ||
      item.departemen_id === departemenId ||
      item.id === departemenId ||
      item.value === departemenId,
  )

const planningMatchesDepartment = (planning, departemenId) => {
  if (!departemenId) return false
  if (routeStepForDepartment(planning, departemenId)) return true
  if (assignedToDepartment(planning, departemenId)) return true
  return (
    planning.departemen_id === departemenId ||
    planning.current_departemen_id === departemenId ||
    planning.tujuan_departemen?.id === departemenId
  )
}

const isActivePlanning = (planning) =>
  !['done', 'finished', 'selesai', 'cancelled', 'batal'].includes(
    normalizeStatus(planning.planning_status || planning.status_planning || planning.status),
  )

const isUrgentPlanning = (planning) => planning.isUrgent === true

const planningRowsForDepartment = (departemenId) =>
  planningRows.value.filter(
    (planning) => isActivePlanning(planning) && planningMatchesDepartment(planning, departemenId),
  )

const planningBaruCount = (departemenId) =>
  planningRowsForDepartment(departemenId).filter((planning) => {
    const routeStep = routeStepForDepartment(planning, departemenId)
    return routeStep ? routeStep.is_new !== false : planning.is_new !== false
  }).length

const urgentPlanningCount = (departemenId) =>
  planningRowsForDepartment(departemenId).filter(isUrgentPlanning).length

const nearestDeadlineForDepartment = (departemenId) =>
  planningRowsForDepartment(departemenId).reduce(
    (nearest, planning) => Math.min(nearest, timestampOf(planning.deadline)),
    Number.MAX_SAFE_INTEGER,
  )

function compareDepartmentsByPlanningWorkload(a, b) {
  const urgentDiff = urgentPlanningCount(b.id) - urgentPlanningCount(a.id)
  if (urgentDiff !== 0) return urgentDiff

  const priorityDiff =
    Math.min(
      ...planningRowsForDepartment(a.id).map((row) =>
        isUrgentPlanning(row) ? 0 : priorityRank(row.priority || row.prioritas),
      ),
      3,
    ) -
    Math.min(
      ...planningRowsForDepartment(b.id).map((row) =>
        isUrgentPlanning(row) ? 0 : priorityRank(row.priority || row.prioritas),
      ),
      3,
    )
  if (priorityDiff !== 0) return priorityDiff

  const nearestDiff = nearestDeadlineForDepartment(a.id) - nearestDeadlineForDepartment(b.id)
  if (nearestDiff !== 0) return nearestDiff

  return String(a.nama_departemen || '').localeCompare(String(b.nama_departemen || ''))
}

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

// ─── Additional computed/helpers for the new UI ───
const urgentPlanningList = computed(() =>
  planningRows.value
    .filter((planning) => isActivePlanning(planning) && isUrgentPlanning(planning))
    .sort((a, b) => timestampOf(a.deadline) - timestampOf(b.deadline)),
)

const departmentProgress = (departemenId) => {
  const rows = planningRowsForDepartment(departemenId)
  if (!rows.length) return 0
  const doneCount = rows.filter((r) =>
    ['done', 'finished', 'selesai'].includes(normalizeStatus(r.planning_status || r.status)),
  ).length
  return rows.length > 0 ? Math.round((doneCount / rows.length) * 100) : 0
}

const progressBarColor = (pct) => {
  if (pct >= 100) return 'green-8'
  if (pct >= 60) return 'cyan'
  if (pct >= 30) return 'orange-8'
  return 'red-8'
}

const formatProducts = (products) => {
  if (!Array.isArray(products) || !products.length) return ''
  return products
    .slice(0, 2)
    .map((p) => p.product_name || p.name || p.nama_produk || '-')
    .join(', ')
}

const planningNumber = (planning) =>
  planning.nomor_planning ||
  planning.no_planning ||
  planning.planning_number ||
  planning.nomor_spk ||
  planning.id ||
  '-'

const planningProduct = (planning) =>
  formatProducts(planning.products) ||
  planning.nama_produk ||
  planning.product_name ||
  planning.product ||
  '-'

const firstDepartmentName = (departments) => {
  if (!Array.isArray(departments) || !departments.length) return ''
  const department = departments[0]
  return (
    department.department_name ||
    department.departemen_nama ||
    department.nama_departemen ||
    department.name ||
    department.label ||
    ''
  )
}

const targetDepartment = (planning) =>
  planning.current_departemen_nama ||
  planning.departemen_nama ||
  planning.tujuan_departemen?.nama_departemen ||
  planning.tujuan_departemen?.name ||
  firstDepartmentName(planning.route_departemen) ||
  firstDepartmentName(planning.assigned_departments) ||
  '-'

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
  if (unsubscribePlanning) unsubscribePlanning()
})
</script>

<style scoped>
/* ═══════ BASE ═══════ */
.font-pro {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.dept-page {
  background: #071826;
  min-height: 100vh;
  padding: 28px 32px;
}

/* ═══════ HEADER ═══════ */
.page-header {
  margin-bottom: 28px;
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.header-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  background: rgba(0, 209, 178, 0.12);
  border: 1px solid rgba(0, 209, 178, 0.25);
  color: #00D1B2;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
  margin-bottom: 10px;
}

.header-title {
  margin: 0;
  font-size: 32px;
  font-weight: 900;
  color: #F4F7FA;
  line-height: 1.1;
  text-shadow: 0 0 12px rgba(124, 255, 79, 0.18);
}

.header-subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  color: #B8C7D9;
  line-height: 1.5;
  max-width: 520px;
}

.btn-master {
  background: linear-gradient(135deg, #00D1B2 0%, #00b89c 100%);
  color: #071826;
  font-weight: 700;
  border-radius: 14px;
  padding: 10px 24px;
  font-size: 13px;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.btn-master:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 209, 178, 0.3);
}

/* ═══════ URGENT BANNER ═══════ */
.urgent-banner {
  margin-bottom: 20px;
  animation: urgentPulse 3s ease-in-out infinite;
}

@keyframes urgentPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.92; }
}

.urgent-banner-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(211, 47, 47, 0.15) 0%, rgba(211, 47, 47, 0.08) 100%);
  border: 1px solid rgba(255, 82, 82, 0.35);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.urgent-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 82, 82, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FF5252;
  flex-shrink: 0;
}

.urgent-content {
  flex: 1;
  min-width: 0;
}

.urgent-title {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1.2px;
  color: #FF5252;
  margin-bottom: 6px;
}

.urgent-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.urgent-item {
  font-size: 13px;
  color: #F4F7FA;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.urgent-planning {
  font-weight: 700;
  color: #FF8A80;
}

.urgent-sep {
  color: #4a5568;
}

.urgent-product {
  color: #B0BEC5;
}

.urgent-department {
  color: #FF5252;
  font-weight: 700;
  font-size: 12px;
}

.urgent-count-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 82, 82, 0.25);
  color: #FF5252;
  font-size: 18px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ═══════ GLASS CARD ═══════ */
.glass-card {
  background: rgba(13, 34, 51, 0.7);
  border: 1px solid rgba(124, 255, 79, 0.08);
  border-radius: 18px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* ═══════ FILTER BAR ═══════ */
.filter-card {
  padding: 16px 20px;
  margin-bottom: 24px;
}

.filter-grid {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.filter-search {
  flex: 2;
  min-width: 200px;
}

.filter-select {
  flex: 1;
  min-width: 160px;
}

.search-input :deep(.q-field__control) {
  background: rgba(124, 255, 79, 0.04);
  border: 1px solid rgba(124, 255, 79, 0.1);
  border-radius: 14px;
}

.search-input :deep(.q-field__control):hover,
.search-input :deep(.q-field__control.q-field__control--focused) {
  border-color: rgba(0, 209, 178, 0.4);
}

.filter-input :deep(.q-field__control) {
  background: rgba(124, 255, 79, 0.04);
  border: 1px solid rgba(124, 255, 79, 0.1);
  border-radius: 14px;
}

.filter-count {
  flex-shrink: 0;
}

.count-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  background: rgba(0, 209, 178, 0.1);
  border: 1px solid rgba(0, 209, 178, 0.2);
  color: #00D1B2;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* ═══════ DEPARTMENT GRID ═══════ */
.dept-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  animation: fadeInUp 0.6s ease-out;
}

@media (max-width: 1023px) {
  .dept-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 599px) {
  .dept-page {
    padding: 16px;
  }

  .dept-grid {
    grid-template-columns: 1fr;
  }

  .header-content {
    flex-direction: column;
  }

  .header-title {
    font-size: 24px;
  }

  .btn-master {
    width: 100%;
  }
}

/* ═══════ DEPARTMENT CARD ═══════ */
.dept-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.dept-card:hover {
  transform: translateY(-6px);
  border-color: rgba(124, 255, 79, 0.2);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(124, 255, 79, 0.06);
}

.dept-card--urgent {
  border-color: rgba(255, 82, 82, 0.25);
}

.dept-card--urgent:hover {
  border-color: rgba(255, 82, 82, 0.4);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(255, 82, 82, 0.1);
}

.dept-card-glow {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 255, 79, 0.06) 0%, transparent 70%);
  pointer-events: none;
  transition: all 0.4s ease;
}

.dept-card:hover .dept-card-glow {
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(124, 255, 79, 0.1) 0%, transparent 70%);
}

/* Card Header */
.dept-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 0;
}

.dept-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.dept-icon--active {
  background: rgba(124, 255, 79, 0.12);
  color: #7CFF4F;
  box-shadow: 0 0 16px rgba(124, 255, 79, 0.1);
}

.dept-icon--idle {
  background: rgba(107, 130, 153, 0.15);
  color: #8CA3B8;
}

.dept-card:hover .dept-icon--active {
  box-shadow: 0 0 24px rgba(124, 255, 79, 0.2);
}

.dept-header-info {
  flex: 1;
  min-width: 0;
}

.dept-name {
  font-size: 16px;
  font-weight: 800;
  color: #F4F7FA;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dept-code {
  font-size: 11px;
  color: #8CA3B8;
  margin-top: 2px;
  font-weight: 600;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}

.status-badge--active {
  background: rgba(124, 255, 79, 0.1);
  color: #7CFF4F;
  border: 1px solid rgba(124, 255, 79, 0.2);
}

.status-badge--idle {
  background: rgba(107, 130, 153, 0.1);
  color: #8CA3B8;
  border: 1px solid rgba(107, 130, 153, 0.2);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-badge--active .status-dot {
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(124, 255, 79, 0.4); }
  50% { opacity: 0.8; box-shadow: 0 0 0 4px rgba(124, 255, 79, 0); }
}

/* Urgent Strip */
.dept-urgent-strip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 10px 20px 0;
  padding: 6px 12px;
  border-radius: 10px;
  background: rgba(255, 82, 82, 0.12);
  border: 1px solid rgba(255, 82, 82, 0.2);
  color: #FF5252;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

/* Card Body */
.dept-card-body {
  padding: 16px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dept-description {
  font-size: 12px;
  color: #B8C7D9;
  line-height: 1.5;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  min-height: 36px;
}

/* Metrics */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.metric-item {
  padding: 10px 12px;
  background: rgba(7, 24, 38, 0.6);
  border: 1px solid rgba(124, 255, 79, 0.06);
  border-radius: 12px;
}

.metric-item--wide {
  grid-column: 1 / -1;
}

.metric-label {
  font-size: 10px;
  font-weight: 700;
  color: #8CA3B8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 22px;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1;
}

.metric-value--cyan {
  color: #00D1B2;
}

.metric-progress-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dept-progress-bar {
  flex: 1;
}

.metric-pct {
  font-size: 14px;
  font-weight: 800;
  color: #F4F7FA;
  min-width: 38px;
  text-align: right;
}

/* PIC */
.dept-pic {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 10px;
  background: rgba(0, 209, 178, 0.08);
  border: 1px solid rgba(0, 209, 178, 0.12);
  font-size: 12px;
  font-weight: 600;
  color: #B0BEC5;
  align-self: flex-start;
}

/* Card Footer */
.dept-card-footer {
  padding: 14px 20px;
  border-top: 1px solid rgba(124, 255, 79, 0.06);
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-enter {
  background: linear-gradient(135deg, #7CFF4F 0%, #5ae030 100%);
  color: #071826;
  font-weight: 700;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 12px;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.btn-enter:hover {
  box-shadow: 0 4px 20px rgba(124, 255, 79, 0.3);
  transform: translateY(-1px);
}

.btn-workload {
  color: #8CA3B8;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.btn-workload:hover {
  color: #00D1B2;
  background: rgba(0, 209, 178, 0.08);
}

/* ═══════ EMPTY STATE ═══════ */
.empty-card {
  margin-top: 40px;
}

.empty-content {
  padding: 60px 32px;
  text-align: center;
}

.empty-icon-wrap {
  width: 96px;
  height: 96px;
  border-radius: 28px;
  background: rgba(107, 130, 153, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.empty-title {
  font-size: 20px;
  font-weight: 800;
  color: #F4F7FA;
}

.empty-desc {
  font-size: 14px;
  color: #8CA3B8;
  margin-top: 8px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* ═══════ SKELETON ═══════ */
.dept-card--skeleton {
  cursor: default;
  pointer-events: none;
}

.dept-card--skeleton .dept-card-header {
  padding: 20px;
}

.dept-card--skeleton .dept-card-body {
  padding: 0 20px 20px;
}

/* ═══════ ANIMATIONS ═══════ */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ═══════ DARK DROPDOWN (for Quasar popups) ═══════ */
:deep(.dark-dropdown) {
  background: #0d2233 !important;
  border: 1px solid rgba(124, 255, 79, 0.1);
}

:deep(.dark-dropdown .q-item) {
  color: #B0BEC5;
}

:deep(.dark-dropdown .q-item--active),
:deep(.dark-dropdown .q-item:hover) {
  background: rgba(124, 255, 79, 0.08);
  color: #7CFF4F;
}

/* ═══════ QUASAR SKELETON OVERRIDES ═══════ */
:deep(.q-skeleton) {
  background: rgba(124, 255, 79, 0.05) !important;
}

:deep(.q-skeleton--anim-wave::after) {
  background: linear-gradient(90deg, transparent, rgba(124, 255, 79, 0.04), transparent) !important;
}
</style>
