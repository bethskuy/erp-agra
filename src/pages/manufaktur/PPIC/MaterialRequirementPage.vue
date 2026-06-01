<template>
  <q-page class="mrp-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Material Requirement Planning
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Kesiapan Material Sebelum Produksi
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Monitoring kebutuhan material berdasarkan Work Order, stok tersedia, kekurangan material,
          dan status pengadaan.
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="add_circle"
          label="Tambah Requirement"
          no-caps
          class="q-px-lg shadow-premium"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="card in summaryCards" :key="card.title" class="col-12 col-sm-6 col-lg-4">
        <q-card flat bordered class="summary-card bg-white">
          <q-card-section class="row items-center no-wrap">
            <q-avatar :color="card.color" text-color="white" :icon="card.icon" size="48px" />
            <div class="q-ml-md col">
              <div class="summary-label">{{ card.title }}</div>
              <div class="summary-value">{{ card.value }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered class="filter-card bg-white q-mb-lg">
      <q-card-section class="q-py-md">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-6">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari nomor PO, produk, atau material..."
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
              label="Filter Status Material"
              bg-color="white"
            />
          </div>

          <div class="col-12 col-md-auto">
            <q-btn
              flat
              round
              color="green-10"
              icon="refresh"
              :loading="loading"
              @click="loadRequirements"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="table-card bg-white">
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        binary-state-sort
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        class="mrp-table"
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
          <q-tr :props="props" class="mrp-row">
            <q-td key="nomor_po" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.nomor_po || props.row.nomor_wo || '-' }}
            </q-td>
            <q-td key="produk" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.produk }}</div>
              <div class="text-caption text-grey-6">{{ props.row.material }}</div>
            </q-td>
            <q-td key="material" :props="props">{{ props.row.material }}</q-td>
            <q-td key="qty_kebutuhan" :props="props" class="text-right text-weight-bold">
              {{ formatNumber(props.row.qty_kebutuhan) }}
            </q-td>
            <q-td key="stok_tersedia" :props="props" class="text-right text-weight-bold">
              {{ formatNumber(props.row.stok_tersedia) }}
            </q-td>
            <q-td key="qty_kurang" :props="props" class="text-right">
              <q-badge
                v-if="props.row.qty_kurang > 0"
                color="negative"
                class="warning-badge q-px-sm q-py-xs"
              >
                Kurang {{ formatNumber(props.row.qty_kurang) }}
              </q-badge>
              <span v-else class="text-positive text-weight-bold">0</span>
            </q-td>
            <q-td key="status_material" :props="props">
              <q-badge
                dense
                :color="statusColor(props.row.status_material)"
                class="status-chip text-white"
              >
                {{ statusLabel(props.row.status_material) }}
              </q-badge>
            </q-td>
            <q-td key="status_pr" :props="props">
              <q-badge
                dense
                :color="statusPrColor(props.row.status_pr)"
                class="status-chip text-white"
              >
                {{ props.row.status_pr || DEFAULT_PR_STATUS }}
              </q-badge>
            </q-td>
            <q-td key="aksi" :props="props" class="text-center">
              <div class="row justify-center q-gutter-xs no-wrap">
                <q-btn
                  v-if="canSendToWarehousePr(props.row)"
                  unelevated
                  dense
                  no-caps
                  color="orange-9"
                  icon="send"
                  label="Kirim ke PR Gudang"
                  class="text-weight-bold"
                  @click="openPrDialog(props.row)"
                >
                  <q-tooltip>Kirim ke Purchase Request Gudang</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="inventory" size="28px" class="q-mr-sm" />
            Belum ada material requirement.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showFormDialog" persistent>
      <q-card class="mrp-dialog">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">{{ formModeLabel }} Material Requirement</div>
            <div class="text-caption">Qty kurang dihitung otomatis dari kebutuhan dan stok.</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="saveRequirement">
          <q-card-section class="q-pa-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nomor_po"
                  outlined
                  dense
                  label="Nomor PO"
                  :rules="[(val) => !!val || 'Nomor PO wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.produk"
                  outlined
                  dense
                  label="Produk"
                  :rules="[(val) => !!val || 'Produk wajib diisi']"
                />
              </div>
              <div class="col-12">
                <q-select
                  v-model="form.material_id"
                  :options="materialOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  option-label="label"
                  option-value="value"
                  label="Material"
                  :loading="loadingMasterMaterial"
                  :rules="[(val) => !!val || 'Material wajib dipilih']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.qty_kebutuhan"
                  outlined
                  dense
                  type="number"
                  min="0"
                  label="Qty Kebutuhan"
                  :rules="[(val) => Number(val) > 0 || 'Qty kebutuhan wajib lebih dari 0']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.stok_tersedia"
                  outlined
                  dense
                  type="number"
                  min="0"
                  label="Stok Tersedia"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  :model-value="calculatedShortage"
                  outlined
                  dense
                  readonly
                  label="Qty Kurang"
                >
                  <template #append>
                    <q-icon
                      :name="calculatedShortage > 0 ? 'warning' : 'check_circle'"
                      :color="calculatedShortage > 0 ? 'negative' : 'positive'"
                    />
                  </template>
                </q-input>
              </div>
              <div class="col-12">
                <q-banner
                  rounded
                  :class="
                    calculatedShortage > 0 ? 'bg-red-1 text-negative' : 'bg-green-1 text-green-10'
                  "
                >
                  <template #avatar>
                    <q-icon :name="calculatedShortage > 0 ? 'warning' : 'verified'" />
                  </template>
                  {{ stockMessage }}
                </q-banner>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="bg-grey-1 q-pa-md">
            <q-btn flat color="grey-7" label="Batal" no-caps v-close-popup />
            <q-btn
              unelevated
              rounded
              color="green-10"
              icon="save"
              label="Simpan Requirement"
              no-caps
              type="submit"
              :loading="submitting"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showPrDialog" maximized persistent>
      <q-card class="pr-dialog column no-wrap">
        <q-toolbar class="bg-white text-green-10 shadow-2">
          <q-btn flat round dense icon="close" color="grey-7" @click="closePrDialog" />
          <q-toolbar-title class="text-weight-bold">Kirim ke PR Gudang</q-toolbar-title>
          <q-btn
            unelevated
            color="green-10"
            icon="send"
            label="Kirim Request"
            no-caps
            class="text-weight-bold gt-xs"
            :loading="submittingPr"
            @click="sendToWarehousePr"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-lg-lg">
          <div class="pr-shell">
            <q-card flat bordered class="bg-white pr-detail-card">
              <q-card-section>
                <div class="text-h6 text-weight-bold text-green-10 q-mb-md">
                  Detail Material Kurang
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="detail-label">Nomor PO</div>
                    <div class="detail-value">
                      {{ selectedPrRow?.nomor_po || selectedPrRow?.nomor_wo || '-' }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="detail-label">Nama Material</div>
                    <div class="detail-value">{{ selectedPrRow?.material || '-' }}</div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="detail-label">Qty Kebutuhan</div>
                    <div class="detail-value">{{ formatNumber(selectedPrRow?.qty_kebutuhan) }}</div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="detail-label">Stok Tersedia</div>
                    <div class="detail-value">{{ formatNumber(selectedPrRow?.stok_tersedia) }}</div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="detail-label">Qty Kurang</div>
                    <div class="detail-value text-negative">
                      {{ formatNumber(selectedPrRow?.qty_kurang) }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="detail-label">Status PR</div>
                    <q-badge
                      :color="statusPrColor(selectedPrRow?.status_pr)"
                      class="text-white text-weight-bold q-px-sm q-py-xs"
                    >
                      {{ selectedPrRow?.status_pr || DEFAULT_PR_STATUS }}
                    </q-badge>
                  </div>
                </div>
              </q-card-section>
              <q-separator />
              <q-card-actions align="right" class="q-pa-md">
                <q-btn flat color="grey-8" label="Batal" no-caps @click="closePrDialog" />
                <q-btn
                  unelevated
                  color="green-10"
                  icon="send"
                  label="Kirim Request"
                  no-caps
                  class="text-weight-bold"
                  :loading="submittingPr"
                  @click="sendToWarehousePr"
                />
              </q-card-actions>
            </q-card>
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
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const COLLECTION_NAME = 'material_requirement_manufaktur'
const MASTER_BARANG_COLLECTION = 'manufactur_master_barang'
const PURCHASE_REQUEST_COLLECTION = 'permintaan_barang_manufaktur'
const PURCHASE_REQUEST_TABLE_COLLECTION = 'purchase_request'
const DEFAULT_PR_STATUS = 'Belum Diajukan'
const PENDING_PR_STATUS = 'Menunggu ACC Atasan'
const statusOptions = [
  { label: 'Material Ready', value: 'Material Ready' },
  { label: 'Material Kurang', value: 'Material Kurang' },
]
const statusFilterOptions = [{ label: 'Semua Status', value: 'all' }, ...statusOptions]

const $q = useQuasar()
const rows = ref([])
const masterMaterials = ref([])
const loading = ref(false)
const loadingMasterMaterial = ref(true)
const submitting = ref(false)
const search = ref('')
const statusFilter = ref('all')
const showFormDialog = ref(false)
const showPrDialog = ref(false)
const selectedPrRow = ref(null)
const editingId = ref(null)
const submittingPr = ref(false)
let unsubscribeRequirements = null
let unsubscribeMasterMaterials = null

const defaultForm = () => ({
  nomor_po: '',
  produk: '',
  material_id: '',
  material: '',
  kode_material: '',
  satuan: '',
  qty_kebutuhan: null,
  stok_tersedia: 0,
})

const form = ref(defaultForm())

const columns = [
  { name: 'nomor_po', align: 'left', label: 'Nomor PO', field: 'nomor_po', sortable: true },
  { name: 'produk', align: 'left', label: 'Produk', field: 'produk', sortable: true },
  { name: 'material', align: 'left', label: 'Material', field: 'material', sortable: true },
  {
    name: 'qty_kebutuhan',
    align: 'right',
    label: 'Qty Kebutuhan',
    field: 'qty_kebutuhan',
    sortable: true,
  },
  {
    name: 'stok_tersedia',
    align: 'right',
    label: 'Stok Tersedia',
    field: 'stok_tersedia',
    sortable: true,
  },
  { name: 'qty_kurang', align: 'right', label: 'Qty Kurang', field: 'qty_kurang', sortable: true },
  {
    name: 'status_material',
    align: 'center',
    label: 'Status Material',
    field: 'status_material',
    sortable: true,
  },
  { name: 'status_pr', align: 'center', label: 'Status PR', field: 'status_pr', sortable: true },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const enrichedRows = computed(() =>
  rows.value.map((row) => {
    const shortage = calculateShortage(row.qty_kebutuhan, row.stok_tersedia)
    return {
      ...row,
      qty_kurang: shortage,
      status_material: deriveStatus(row.qty_kebutuhan, row.stok_tersedia),
      status_pr: row.status_pr || DEFAULT_PR_STATUS,
    }
  }),
)

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return enrichedRows.value.filter((row) => {
    const matchesStatus = statusFilter.value === 'all' || row.status_material === statusFilter.value
    const matchesSearch =
      !keyword ||
      [row.nomor_po, row.nomor_wo, row.produk, row.material, row.status_material, row.status_pr]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesSearch
  })
})

const summaryCards = computed(() => [
  {
    title: 'Material Ready',
    value: enrichedRows.value.filter((row) => row.status_material === 'Material Ready').length,
    icon: 'verified',
    color: 'green-10',
  },
  {
    title: 'Material Kurang',
    value: enrichedRows.value.filter((row) => row.status_material === 'Material Kurang').length,
    icon: 'warning',
    color: 'negative',
  },
  {
    title: 'Menunggu ACC PR',
    value: enrichedRows.value.filter((row) => row.status_pr === PENDING_PR_STATUS).length,
    icon: 'pending_actions',
    color: 'orange-9',
  },
])

const calculatedShortage = computed(() =>
  calculateShortage(form.value.qty_kebutuhan, form.value.stok_tersedia),
)

const stockMessage = computed(() => {
  if (calculatedShortage.value > 0) {
    return `Stok kurang ${formatNumber(calculatedShortage.value)}. Material perlu dipenuhi sebelum produksi dimulai.`
  }
  return 'Stok material mencukupi untuk kebutuhan produksi.'
})

const formModeLabel = computed(() => (editingId.value ? 'Edit' : 'Tambah'))

const materialOptions = computed(() =>
  masterMaterials.value.map((item) => ({
    label: `${item.kode || item.kode_barang || item.kode_material ? `${item.kode || item.kode_barang || item.kode_material} - ` : ''}${item.nama || item.nama_barang || item.nama_material}`,
    value: item.id,
    item,
  })),
)

const selectedMaterial = computed(
  () => materialOptions.value.find((option) => option.value === form.value.material_id)?.item,
)

const calculateShortage = (required, available) =>
  Math.max(Number(required || 0) - Number(available || 0), 0)

const deriveStatus = (required, available) =>
  Number(available || 0) >= Number(required || 0) ? 'Material Ready' : 'Material Kurang'

const canSendToWarehousePr = (row) =>
  row?.status_material === 'Material Kurang' &&
  (row.status_pr || DEFAULT_PR_STATUS) === DEFAULT_PR_STATUS

const statusLabel = (status) => {
  const option = statusOptions.find((item) => item.value === status)
  return option?.label || status || '-'
}

const statusColor = (status) => {
  const colors = {
    'Material Ready': 'green-10',
    'Material Kurang': 'negative',
  }
  return colors[status] || 'grey-6'
}

const statusPrColor = (status = DEFAULT_PR_STATUS) => {
  const colors = {
    'Belum Diajukan': 'grey-7',
    'Menunggu ACC Atasan': 'orange-9',
    Disetujui: 'positive',
    Ditolak: 'negative',
  }
  return colors[status] || 'grey-7'
}

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const buildPayload = () => {
  const qtyKebutuhan = Number(form.value.qty_kebutuhan || 0)
  const stokTersedia = Number(form.value.stok_tersedia || 0)
  const qtyKurang = calculateShortage(qtyKebutuhan, stokTersedia)

  return {
    nomor_po: form.value.nomor_po,
    nomor_wo: form.value.nomor_po,
    produk: form.value.produk,
    material_id: form.value.material_id,
    material:
      selectedMaterial.value?.nama ||
      selectedMaterial.value?.nama_barang ||
      selectedMaterial.value?.nama_material ||
      form.value.material,
    kode_material:
      selectedMaterial.value?.kode ||
      selectedMaterial.value?.kode_barang ||
      selectedMaterial.value?.kode_material ||
      form.value.kode_material,
    satuan: selectedMaterial.value?.unit || selectedMaterial.value?.satuan || form.value.satuan,
    kategori_material: selectedMaterial.value?.kategori || '',
    ukuran_material: selectedMaterial.value?.ukuran || '',
    qty_kebutuhan: qtyKebutuhan,
    stok_tersedia: stokTersedia,
    qty_kurang: qtyKurang,
    status_material: deriveStatus(qtyKebutuhan, stokTersedia),
    status_pr: form.value.status_pr || DEFAULT_PR_STATUS,
    updated_at: serverTimestamp(),
  }
}

const openCreateDialog = () => {
  editingId.value = null
  form.value = defaultForm()
  showFormDialog.value = true
}

const openPrDialog = (row) => {
  selectedPrRow.value = row
  showPrDialog.value = true
}

const closePrDialog = () => {
  showPrDialog.value = false
  selectedPrRow.value = null
}

const saveRequirement = async () => {
  submitting.value = true
  try {
    const payload = buildPayload()

    if (editingId.value) {
      await updateDoc(doc(db, COLLECTION_NAME, editingId.value), payload)
      $q.notify({ type: 'positive', message: 'Material requirement berhasil diperbarui' })
    } else {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...payload,
        created_at: serverTimestamp(),
      })
      $q.notify({ type: 'positive', message: 'Material requirement berhasil dibuat' })
    }

    showFormDialog.value = false
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan material requirement' })
  } finally {
    submitting.value = false
  }
}

const buildWarehousePrPayload = (row) => ({
  nomor: `PR-${Date.now()}`,
  no_reff: row.nomor_po || row.nomor_wo || '',
  nomor_po: row.nomor_po || row.nomor_wo || '',
  pemohon: 'PPIC',
  id_gudang: 'UTAMA',
  gudang_tujuan: 'Gudang Utama',
  status: 'Pending',
  status_pr: PENDING_PR_STATUS,
  gudang_status: 'PR_PENDING_APPROVAL',
  workflow_status: 'PENDING_APPROVAL',
  approval_sync_status: 'Pending',
  source: 'MATERIAL_REQUIREMENT',
  material_requirement_id: row.id,
  items: [
    {
      id_barang: row.material_id || '',
      kode_barang: row.kode_material || '',
      nama_barang: row.material || '',
      qty: Number(row.qty_kurang || 0),
      jumlah: Number(row.qty_kurang || 0),
      satuan: row.satuan || '',
      keterangan: `Kekurangan material dari PO ${row.nomor_po || row.nomor_wo || '-'}`,
    },
  ],
  created_at: serverTimestamp(),
  updated_at: serverTimestamp(),
})

const sendToWarehousePr = async () => {
  if (!selectedPrRow.value) return
  submittingPr.value = true
  try {
    const row = selectedPrRow.value
    const payload = buildWarehousePrPayload(row)
    await Promise.all([
      addDoc(collection(db, PURCHASE_REQUEST_COLLECTION), payload),
      addDoc(collection(db, PURCHASE_REQUEST_TABLE_COLLECTION), payload),
    ])
    await updateDoc(doc(db, COLLECTION_NAME, row.id), {
      status_pr: PENDING_PR_STATUS,
      pr_sent_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
    $q.notify({
      type: 'positive',
      message: 'Material berhasil dikirim ke Purchase Request Gudang',
    })
    closePrDialog()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal mengirim material ke Purchase Request Gudang' })
  } finally {
    submittingPr.value = false
  }
}

const loadRequirements = () => {
  loading.value = true
  if (unsubscribeRequirements) unsubscribeRequirements()

  const requirementQuery = query(collection(db, COLLECTION_NAME), orderBy('updated_at', 'desc'))
  unsubscribeRequirements = onSnapshot(
    requirementQuery,
    (snapshot) => {
      rows.value = snapshot.docs.map((requirementDoc) => ({
        id: requirementDoc.id,
        ...requirementDoc.data(),
      }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat material requirement' })
    },
  )
}

const loadMasterMaterials = () => {
  loadingMasterMaterial.value = true
  unsubscribeMasterMaterials = onSnapshot(
    query(collection(db, MASTER_BARANG_COLLECTION), orderBy('nama', 'asc')),
    (snapshot) => {
      masterMaterials.value = snapshot.docs
        .map((materialDoc) => ({ id: materialDoc.id, ...materialDoc.data() }))
        .filter((item) => item.status !== 'Nonaktif' && item.status_aktif !== 'Nonaktif')
      loadingMasterMaterial.value = false
    },
    (error) => {
      console.error(error)
      loadingMasterMaterial.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat data barang' })
    },
  )
}

onMounted(() => {
  loadRequirements()
  loadMasterMaterials()
})

onUnmounted(() => {
  if (unsubscribeRequirements) unsubscribeRequirements()
  if (unsubscribeMasterMaterials) unsubscribeMasterMaterials()
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

.shadow-premium {
  box-shadow: 0 10px 30px rgba(27, 94, 32, 0.15);
}

.summary-card,
.filter-card,
.table-card,
.mrp-dialog,
.stock-dialog {
  border-color: #dfe8df;
  border-radius: 20px;
  overflow: hidden;
}

.summary-label {
  color: #667085;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.summary-value {
  color: #1b5e20;
  font-size: 30px;
  font-weight: 900;
  line-height: 1;
  margin-top: 5px;
}

.mrp-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}

.table-head {
  text-transform: uppercase;
}

.mrp-row {
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.mrp-row:hover {
  background: rgba(27, 94, 32, 0.04);
}

.status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  min-width: 132px;
  justify-content: center;
}

.warning-badge {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
}

.dialog-header {
  background: #1b5e20;
  color: #ffffff;
  padding: 16px 20px;
}

.mrp-dialog {
  max-width: 95vw;
  width: 760px;
}

.stock-dialog {
  max-width: 95vw;
  width: 680px;
}

.stock-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stock-metric {
  background: #f8fbf8;
  border: 1px solid #dfe8df;
  border-radius: 14px;
  padding: 16px;
}

.stock-metric--warning {
  background: #fff3f3;
  border-color: #f3c4c4;
}

.metric-label {
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.metric-value {
  color: #1b5e20;
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
  margin-top: 8px;
}

.stock-metric--warning .metric-value {
  color: #c10015;
}

@media (max-width: 599px) {
  .stock-grid {
    grid-template-columns: 1fr;
  }
}
</style>
