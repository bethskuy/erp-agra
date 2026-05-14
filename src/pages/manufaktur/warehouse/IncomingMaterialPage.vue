<template>
  <q-page class="incoming-page bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Incoming Material
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Dashboard Penerimaan Warehouse
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Monitoring barang datang, cek surat jalan, validasi quantity actual, dan pengecekan awal
          incoming.
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          flat
          rounded
          color="green-10"
          icon="sync"
          label="Refresh Data"
          no-caps
          :loading="loading"
          class="bg-white shadow-1"
          @click="loadIncoming"
        />
      </div>
    </div>

    <div class="row q-gutter-md q-mb-lg items-center no-print">
      <q-btn
        unelevated
        color="green-10"
        icon="add_circle"
        label="Incoming Baru"
        no-caps
        rounded
        class="q-px-lg shadow-premium btn-hover"
        @click="openAddDialog"
      />
      <q-btn
        unelevated
        color="white"
        text-color="green-10"
        icon="fact_check"
        label="Monitor QC"
        no-caps
        rounded
        class="q-px-lg shadow-1"
        @click="openQcPage"
      />
      <q-btn
        unelevated
        color="green-1"
        text-color="green-10"
        icon="send"
        label="Distribusi Material"
        no-caps
        rounded
        class="q-px-lg shadow-1"
        @click="scrollToMonitoring"
      />
      <q-space />
      <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
        {{ incomingRows.length }} RECORD
      </q-chip>
    </div>

    <div class="animate-fade-up">
      <div id="incoming-monitoring" class="section-title-row q-mb-sm">
        <div>
          <div class="text-overline text-green-10 text-weight-black">Summary Incoming</div>
          <div class="text-caption text-grey-7">
            Ringkasan dokumen, barang datang, status QC, dan quantity actual.
          </div>
        </div>
      </div>

      <incoming-summary :rows="incomingRows" :loading="loading" />

      <q-card
        flat
        bordered
        class="workflow-card-main q-mb-lg shadow-1 rounded-20 bg-white no-print"
      >
        <q-card-section class="bg-green-10 text-white q-py-sm">
          <div class="text-caption text-weight-bold uppercase tracking-widest">
            Workflow Status Produksi
          </div>
        </q-card-section>
        <q-card-section class="q-pa-md">
          <div class="workflow-strip row q-col-gutter-sm">
            <div v-for="step in workflowSteps" :key="step.status" class="col-12 col-sm-6 col-lg">
              <div class="workflow-step">
                <q-avatar
                  size="34px"
                  color="green-1"
                  text-color="green-10"
                  :icon="step.icon"
                  class="q-mr-sm"
                />
                <div class="col min-width-0">
                  <div class="workflow-label">{{ step.label }}</div>
                  <div class="workflow-caption">{{ step.caption }}</div>
                </div>
                <incoming-status-badge :status="step.badge" dense outline />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="section-title-row q-mb-sm">
        <div>
          <div class="text-overline text-green-10 text-weight-black">Monitoring Incoming</div>
          <div class="text-caption text-grey-7">
            Search, filter, validasi awal, dan riwayat incoming material.
          </div>
        </div>
      </div>

      <incoming-table-page
        class="table-without-summary"
        :rows="incomingRows"
        :loading="loading"
        @refresh="loadIncoming"
        @view="openDetail"
        @edit="openEditDialog"
        @send-to-qc="sendToQc"
        @delete="deleteIncoming"
        @export="exportExcel"
      />
    </div>

    <incoming-dialog
      v-model="showFormDialog"
      :row="selectedRow"
      :submitting="submitting"
      :current-user-name="currentUserName"
      :satuan-material-options="satuanMaterialOptions"
      :kategori-material-options="kategoriMaterialOptions"
      @save="saveIncoming"
    />

    <q-dialog
      v-model="showDetailDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="detail-card column bg-grey-2">
        <q-toolbar class="detail-header shrink">
          <div class="row items-center no-wrap">
            <q-icon name="inventory_2" size="24px" class="q-mr-sm" />
            <div class="col">
              <div class="text-subtitle1 text-weight-bolder uppercase tracking-widest">
                Riwayat Incoming
              </div>
              <div class="text-caption">{{ selectedRow?.nomor_surat_jalan || '-' }}</div>
            </div>
            <q-btn flat round dense icon="close" v-close-popup />
          </div>
        </q-toolbar>

        <q-card-section v-if="selectedRow" class="col scroll q-pa-md q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 detail-paper-shell">
              <div class="row q-col-gutter-md">
                <div class="col-12">
                  <div class="incoming-detail-summary q-mb-lg">
                    <div class="row justify-end q-gutter-sm q-mb-sm no-print detail-pdf-actions">
                      <q-btn
                        unelevated
                        rounded
                        color="white"
                        text-color="green-10"
                        icon="print"
                        label="Cetak PDF"
                        no-caps
                        class="shadow-1 q-px-md"
                        @click="printDetailPdf"
                      />
                      <q-btn
                        unelevated
                        rounded
                        color="green-10"
                        icon="download"
                        label="Download PDF"
                        no-caps
                        class="shadow-1 q-px-md"
                        @click="downloadDetailPdf"
                      />
                    </div>

                    <q-card
                      ref="detailPdfRef"
                      flat
                      bordered
                      class="detail-summary-card rounded-20 bg-white"
                    >
                      <q-card-section class="detail-header-compact">
                        <div class="document-company-row">
                          <div class="document-brand">
                            <div class="company-logo-frame">
                              <img
                                v-if="detailCompanyLogoSrc"
                                :src="detailCompanyLogoSrc"
                                :alt="detailCompanyName"
                                class="company-logo-img"
                              />
                              <div v-else class="company-logo-fallback">LOGO</div>
                            </div>
                            <div class="company-identity">
                              <div class="company-name">{{ detailCompanyName }}</div>
                              <div class="company-subtitle">Dokumen Penerimaan Material</div>
                            </div>
                          </div>
                          <div class="detail-status-wrap">
                            <incoming-status-badge :status="getStatus(selectedRow)" dense />
                            <q-badge
                              v-if="detailHasMaterialShortage"
                              color="orange-8"
                              class="shortage-warning-badge q-ml-sm"
                            >
                              Menunggu Kekurangan Material
                            </q-badge>
                          </div>
                        </div>

                        <div class="document-title-block">
                          <div class="document-title">SURAT PENERIMAAN MATERIAL</div>
                          <div class="document-meta-grid">
                            <div class="document-meta-cell">
                              <div class="document-meta-label">Nomor Surat Jalan</div>
                              <div class="document-number">
                                {{ selectedRow.nomor_surat_jalan || '-' }}
                              </div>
                            </div>
                            <div class="document-meta-cell document-meta-cell--right">
                              <div class="document-meta-label">Tanggal Masuk</div>
                              <div class="document-date">{{ detailIncomingDate }}</div>
                            </div>
                          </div>
                        </div>
                      </q-card-section>

                      <div class="clean-divider"></div>

                      <q-card-section class="detail-section">
                        <div class="document-info-grid">
                          <div class="detail-info-cell">
                            <div class="detail-info-label">Nomor Surat Jalan</div>
                            <div class="detail-info-value">
                              {{ selectedRow.nomor_surat_jalan || '-' }}
                            </div>
                          </div>
                          <div class="detail-info-cell">
                            <div class="detail-info-label">Customer</div>
                            <div class="detail-info-value">{{ detailCustomerName }}</div>
                          </div>
                          <div class="detail-info-cell">
                            <div class="detail-info-label">Checker QC</div>
                            <div class="detail-info-value">{{ detailCheckerName }}</div>
                          </div>
                          <div class="detail-info-cell">
                            <div class="detail-info-label">Tanggal Masuk</div>
                            <div class="detail-info-value">{{ detailIncomingDate }}</div>
                          </div>
                          <div class="detail-info-cell">
                            <div class="detail-info-label">Status Incoming</div>
                            <div class="detail-info-value">
                              {{ statusLabel(getStatus(selectedRow)) }}
                            </div>
                          </div>
                          <div class="detail-info-cell">
                            <div class="detail-info-label">Material Utama</div>
                            <div class="detail-info-value">{{ detailMainMaterial }}</div>
                          </div>
                        </div>
                      </q-card-section>

                      <div class="clean-divider clean-divider--inset"></div>

                      <q-card-section class="detail-section">
                        <div class="section-heading">Daftar Material</div>
                        <q-markup-table flat dense class="pdf-items-table">
                          <thead>
                            <tr>
                              <th class="text-center">No</th>
                              <th class="text-left">Nama Barang</th>
                              <th class="text-left">Kategori</th>
                              <th class="text-left">Satuan</th>
                              <th class="text-right">Qty SJ</th>
                              <th class="text-right">Qty Actual</th>
                              <th class="text-right">Selisih</th>
                              <th class="text-left">Catatan</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="(item, index) in detailItems"
                              :key="`doc-${item.nama_barang}-${index}`"
                            >
                              <td class="text-center">{{ index + 1 }}</td>
                              <td class="text-weight-bold">{{ item.nama_barang || '-' }}</td>
                              <td>{{ item.kategori_material || '-' }}</td>
                              <td>{{ item.satuan || 'PCS' }}</td>
                              <td class="text-right">{{ formatNumber(item.qty_surat_jalan) }}</td>
                              <td class="text-right">{{ formatNumber(item.qty_actual) }}</td>
                              <td class="text-right" :class="detailSelisihClass(item.selisih_qty)">
                                {{ formatNumber(item.selisih_qty) }}
                              </td>
                              <td>{{ item.catatan || '-' }}</td>
                            </tr>
                          </tbody>
                        </q-markup-table>
                      </q-card-section>

                      <div class="clean-divider clean-divider--inset"></div>

                      <q-card-section class="detail-section">
                        <div class="section-heading">Approval Incoming</div>
                        <div class="approval-strip">
                          <div class="approval-column">
                            <div class="approval-role">Dibuat Oleh</div>
                            <div class="approval-signature-line"></div>
                            <div class="approval-name">{{ detailCreatedBy }}</div>
                            <div class="approval-position">Warehouse</div>
                            <div class="approval-timestamp">{{ detailCreatedAt }}</div>
                          </div>
                          <div class="approval-column">
                            <div class="approval-role">Checker QC</div>
                            <div class="approval-signature-line">
                              <img
                                v-if="detailCheckerSignatureSrc"
                                :src="detailCheckerSignatureSrc"
                                alt="Tanda tangan checker"
                                class="incoming-detail-checker-signature-img"
                              />
                            </div>
                            <div class="approval-name">{{ detailCheckerName }}</div>
                            <div class="approval-position">Quality Control</div>
                            <div class="approval-timestamp">{{ detailValidationAt }}</div>
                          </div>
                          <div class="approval-column">
                            <div class="approval-role">Disetujui Oleh</div>
                            <div class="approval-signature-line"></div>
                            <div class="approval-name">{{ detailApprovedBy }}</div>
                            <div class="approval-position">Supervisor / Manager</div>
                            <div class="approval-timestamp">{{ detailApprovedAt }}</div>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <div class="col-12">
                  <q-card flat bordered class="detail-section-card rounded-20 bg-white">
                    <q-card-section class="detail-section-head">
                      <q-icon name="table_rows" size="16px" class="q-mr-sm" />
                      Detail Item Material
                    </q-card-section>
                    <q-separator />
                    <q-card-section class="q-pa-none">
                      <q-markup-table flat dense class="detail-items-table">
                        <thead>
                          <tr>
                            <th class="text-left">Nama Barang</th>
                            <th class="text-left">Kategori</th>
                            <th class="text-left">Satuan</th>
                            <th class="text-right">Qty SJ</th>
                            <th class="text-right">Qty Actual</th>
                            <th class="text-right">Selisih</th>
                            <th class="text-left">Kondisi Awal</th>
                            <th class="text-left">Status Incoming</th>
                            <th class="text-left">Catatan</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(item, index) in detailItems"
                            :key="`${item.nama_barang}-${index}`"
                          >
                            <td class="text-weight-bold text-green-10">
                              {{ item.nama_barang || '-' }}
                            </td>
                            <td>{{ item.kategori_material || '-' }}</td>
                            <td>{{ item.satuan || 'PCS' }}</td>
                            <td class="text-right">{{ formatNumber(item.qty_surat_jalan) }}</td>
                            <td class="text-right">{{ formatNumber(item.qty_actual) }}</td>
                            <td class="text-right" :class="selisihQtyClass(item.selisih_qty)">
                              {{ formatNumber(item.selisih_qty) }}
                            </td>
                            <td>{{ item.kondisi_barang || '-' }}</td>
                            <td>{{ item.status_qc || '-' }}</td>
                            <td>{{ item.catatan || '-' }}</td>
                          </tr>
                        </tbody>
                      </q-markup-table>
                    </q-card-section>
                  </q-card>
                </div>

                <div class="col-12">
                  <q-card flat bordered class="workflow-card rounded-20 shadow-1">
                    <q-card-section>
                      <div class="text-weight-bolder text-green-10 q-mb-sm">
                        Workflow Incoming & QC
                      </div>
                      <q-timeline color="green-10" layout="dense">
                        <q-timeline-entry
                          v-for="entry in workflowHistory"
                          :key="`${entry.status}-${entry.at}`"
                          :title="statusLabel(entry.status)"
                          :subtitle="`${formatDateTime(entry.at)} oleh ${entry.by || '-'}`"
                          :icon="entry.icon"
                        >
                          <div class="text-caption text-grey-7">{{ entry.note || '-' }}</div>
                        </q-timeline-entry>
                      </q-timeline>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions
          align="right"
          class="bg-white q-pa-md shadow-2 shrink detail-actions no-print"
        >
          <q-btn flat color="grey-7" label="Tutup" no-caps v-close-popup />
          <q-btn
            flat
            color="green-10"
            icon="edit_note"
            label="Edit"
            no-caps
            @click="openEditDialog(selectedRow)"
          />
          <q-btn
            v-if="!hasMaterialShortage(selectedRow)"
            unelevated
            color="positive"
            icon="send"
            label="Kirim ke QC"
            no-caps
            :disable="!canSendToQc(selectedRow)"
            @click="sendToQc(selectedRow)"
          />
          <q-btn
            v-if="!hasMaterialShortage(selectedRow)"
            unelevated
            color="green-10"
            icon="send"
            label="Distribusi Material"
            no-caps
            :disable="!canDistributeMaterial(selectedRow)"
            @click="distribusiMaterial(selectedRow)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import html2pdf from 'html2pdf.js'
import { auth, db } from 'src/boot/firebase'
import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'
import IncomingDialog from '../warehouse/IncomingDialog.vue'
import IncomingSummary from './IncomingSummary.vue'
import IncomingTablePage from './IncomingTablePage.vue'
import IncomingStatusBadge from './IncomingStatusBadge.vue'

const COLLECTION_NAME = 'incoming_materials'
const STATUS_DATANG = 'MENUNGGU_VALIDASI'
const STATUS_SEND_TO_QC = 'SEND_TO_QC'
const STATUS_QC_PROCESS = 'QC_PROCESS'
const STATUS_QC_APPROVED = 'QC_APPROVED'
const STATUS_QC_REJECTED = 'QC_REJECTED'
const STATUS_DISTRIBUSI = 'DISTRIBUSI_MATERIAL'
const STATUS_DATA_TIDAK_SESUAI = 'DATA TIDAK SESUAI'

const STATUS_LABEL = {
  [STATUS_DATANG]: 'Barang Datang',
  [STATUS_SEND_TO_QC]: 'Send To QC',
  [STATUS_QC_PROCESS]: 'QC Process',
  [STATUS_QC_APPROVED]: 'QC Approved',
  [STATUS_QC_REJECTED]: 'QC Rejected',
  [STATUS_DISTRIBUSI]: 'Distribusi Material',
  [STATUS_DATA_TIDAK_SESUAI]: 'DATA TIDAK SESUAI',
  BARANG_DATANG: 'Barang Datang',
}

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const incomingRows = ref([])
const loading = ref(true)
const submitting = ref(false)
const showFormDialog = ref(false)
const showDetailDialog = ref(false)
const selectedRow = ref(null)
const detailPdfRef = ref(null)
const incomingQtyInvalid = ref(false)
const companyLogo = ref(null)
const checkerSignature = ref(null)
const masterBarangRows = ref([])
const masterKategoriRows = ref([])
const masterSatuanRows = ref([])
let unsubIncoming = null
let unsubMasterBarang = null
let unsubMasterKategori = null
let unsubMasterSatuan = null
let incomingDialogObserver = null
let incomingDialogWarningShown = false
let incomingQtyValidationFrame = 0
let checkerSignatureCanvas = null
let checkerSignatureDrawing = false
let checkerSignatureHasInk = false
let checkerSignatureLocked = false

const workflowSteps = [
  {
    status: 'barang-datang',
    label: 'Barang Datang',
    caption: 'Dokumen dan material diterima',
    icon: 'local_shipping',
    badge: STATUS_DATANG,
  },
  {
    status: 'send-to-qc',
    label: 'Send To QC',
    caption: 'Incoming siap diperiksa QC',
    icon: 'fact_check',
    badge: STATUS_SEND_TO_QC,
  },
  {
    status: 'qc-process',
    label: 'QC Process',
    caption: 'Pemeriksaan kualitas detail',
    icon: 'rule',
    badge: STATUS_QC_PROCESS,
  },
  {
    status: 'approve-reject',
    label: 'QC Approved',
    caption: 'Keputusan incoming produksi',
    icon: 'verified',
    badge: STATUS_QC_APPROVED,
  },
  {
    status: 'distribusi-material',
    label: 'Distribusi Material',
    caption: 'Material dialokasikan ke produksi/proyek',
    icon: 'send',
    badge: STATUS_DISTRIBUSI,
  },
]

const currentUserName = computed(
  () =>
    authStore.user?.nama ||
    authStore.user?.name ||
    authStore.user?.displayName ||
    auth.currentUser?.displayName ||
    authStore.user?.email ||
    auth.currentUser?.email ||
    'System',
)
const kategoriMaterialOptions = computed(() =>
  masterKategoriRows.value.map((item) => ({
    label: item.nama || item.label || item.value || '-',
    value: item.nama || item.value || item.label || '',
  })),
)
const satuanMaterialOptions = computed(() =>
  masterSatuanRows.value.map((item) => ({
    label: item.nama || item.label || item.value || '-',
    value: item.nama || item.value || item.label || '',
  })),
)

const detailItems = computed(() => (selectedRow.value ? getIncomingItems(selectedRow.value) : []))
const detailHasMaterialShortage = computed(() => hasMaterialShortage(selectedRow.value))
const detailCustomerName = computed(
  () => selectedRow.value?.supplier || selectedRow.value?.asal || '-',
)
const detailCompanyName = computed(
  () =>
    selectedRow.value?.company_name ||
    selectedRow.value?.nama_perusahaan ||
    selectedRow.value?.perusahaan ||
    detailCustomerName.value ||
    'Customer',
)
const detailCompanyLogoSrc = computed(() => getCompanyLogoSrc(getCompanyLogo(selectedRow.value)))
const detailCheckerSignatureSrc = computed(() =>
  getCheckerSignatureSrc(getCheckerSignature(selectedRow.value)),
)
const detailCheckerName = computed(
  () =>
    selectedRow.value?.checker_qc ||
    selectedRow.value?.qc_checker ||
    selectedRow.value?.checker ||
    selectedRow.value?.checker_gudang ||
    '-',
)
const detailMainMaterial = computed(() => {
  const items = detailItems.value
  if (!items.length)
    return selectedRow.value?.nama_barang || selectedRow.value?.nama_material || '-'
  if (items.length > 1) return `${items[0]?.nama_barang || '-'} +${items.length - 1} item`
  return items[0]?.nama_barang || '-'
})
const detailIncomingDate = computed(() =>
  formatDateOnly(
    selectedRow.value?.tanggal_masuk ||
      selectedRow.value?.incoming_timestamp ||
      selectedRow.value?.created_at,
  ),
)
const detailCreatedBy = computed(() =>
  getPersonName(
    selectedRow.value?.created_by || selectedRow.value?.createdBy,
    selectedRow.value?.created_by_name || '-',
  ),
)
const detailApprovedBy = computed(() =>
  getPersonName(
    selectedRow.value?.approved_by || selectedRow.value?.approve_by || selectedRow.value?.approver,
    selectedRow.value?.approved_by_name || selectedRow.value?.approve_nama || '-',
  ),
)
const detailCreatedAt = computed(() =>
  formatDateTime(selectedRow.value?.created_at || selectedRow.value?.incoming_timestamp),
)
const detailValidationAt = computed(() =>
  formatDateTime(
    selectedRow.value?.validated_at ||
      selectedRow.value?.updated_at ||
      selectedRow.value?.incoming_timestamp ||
      selectedRow.value?.created_at,
  ),
)
const detailApprovedAt = computed(() =>
  formatDateTime(
    selectedRow.value?.approved_at ||
      selectedRow.value?.approve_at ||
      selectedRow.value?.approval_at,
  ),
)
const detailPdfFilename = computed(
  () =>
    `Incoming-${String(selectedRow.value?.nomor_surat_jalan || 'material').replace(/[\\/]/g, '-')}.pdf`,
)

const workflowHistory = computed(() => {
  const row = selectedRow.value
  if (!row) return []
  const history = Array.isArray(row.history) ? row.history : []
  if (history.length)
    return history.map((entry) => ({ ...entry, icon: workflowIcon(entry.status) }))

  return [
    {
      status: getStatus(row),
      note: 'Status incoming terakhir',
      by: row.updated_by || row.created_by?.nama || '-',
      at: row.updated_at || row.created_at || row.incoming_timestamp,
      icon: workflowIcon(getStatus(row)),
    },
  ]
})

const getStatus = (row) =>
  row?.status_incoming || row?.status_validation || row?.status || STATUS_DATANG
const statusLabel = (status) => STATUS_LABEL[status] || String(status || '-').replace(/_/g, ' ')
const workflowIcon = (status) => {
  const icons = {
    [STATUS_DATANG]: 'local_shipping',
    [STATUS_SEND_TO_QC]: 'send',
    [STATUS_QC_PROCESS]: 'fact_check',
    [STATUS_QC_APPROVED]: 'verified',
    [STATUS_QC_REJECTED]: 'report_problem',
    [STATUS_DISTRIBUSI]: 'send',
    [STATUS_DATA_TIDAK_SESUAI]: 'report_problem',
  }
  return icons[status] || 'task_alt'
}

const getIncomingItems = (row) => {
  if (Array.isArray(row?.items) && row.items.length) {
    return row.items.map((item) => {
      const qtySj = toSafeNumber(item.qty_surat_jalan ?? item.qtySJ ?? item.qty)
      const qtyActual = toSafeNumber(item.qty_actual ?? item.qtyActual ?? item.quantity)
      return {
        ...item,
        nama_barang: item.nama_barang || item.nama_material || item.material || '',
        kategori_material: item.kategori_material || item.tipe_material || '',
        satuan: item.satuan || 'PCS',
        qty_surat_jalan: qtySj,
        qty_actual: qtyActual,
        selisih_qty: qtyActual - qtySj,
        kondisi_barang: item.kondisi_barang || 'BAIK',
        status_qc: item.status_qc || item.qc_status || getStatus(row),
        catatan: item.catatan || item.catatan_incoming || item.defect_note || '',
      }
    })
  }

  const qtySj = toSafeNumber(row?.qty_surat_jalan ?? row?.qty ?? row?.qtySJ ?? row?.quantity)
  const qtyActual = toSafeNumber(row?.qty_actual ?? row?.qtyActual ?? row?.quantity)
  return [
    {
      nama_barang: row?.nama_barang || row?.nama_material || row?.tipe_material || '',
      kategori_material: row?.kategori_material || row?.tipe_material || '',
      satuan: row?.satuan || 'PCS',
      qty_surat_jalan: qtySj,
      qty_actual: qtyActual,
      selisih_qty: qtyActual - qtySj,
      kondisi_barang: row?.kondisi_barang || 'BAIK',
      status_qc: row?.status_qc || row?.qc_status || getStatus(row),
      catatan: row?.catatan || row?.catatan_incoming || row?.defect_note || '',
    },
  ]
}

const getQtySj = (row) =>
  getIncomingItems(row).reduce((sum, item) => sum + toSafeNumber(item.qty_surat_jalan), 0)
const getQtyActual = (row) =>
  getIncomingItems(row).reduce((sum, item) => sum + toSafeNumber(item.qty_actual), 0)
const hasMaterialShortage = (row) =>
  getIncomingItems(row).some(
    (item) => toSafeNumber(item.qty_surat_jalan) > toSafeNumber(item.qty_actual),
  )
const isWorkflowBlockedByShortage = (status) =>
  [
    'VALIDASI_SELESAI',
    STATUS_SEND_TO_QC,
    STATUS_QC_PROCESS,
    STATUS_QC_APPROVED,
    STATUS_DISTRIBUSI,
  ].includes(status)
const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')
const selisihQtyClass = (value) =>
  toSafeNumber(value) < 0 ? 'text-orange-10 text-weight-bold' : ''
const detailSelisihClass = (value) => {
  const selisih = toSafeNumber(value)
  if (selisih < 0) return 'incoming-detail-selisih-minus'
  if (selisih > 0) return 'incoming-detail-selisih-plus'
  return ''
}
const toSafeNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0
  const parsed = Number(String(value).replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}
const parseQtyInput = (value) => toSafeNumber(value)

const getPersonName = (value, fallback = '-') => {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value.nama || value.name || value.displayName || value.email || fallback
}

const toDate = (value) => {
  if (!value) return null
  if (value.toDate) return value.toDate()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const normalizeDate = (value) => {
  const date = toDate(value)
  if (date) return date.toISOString().slice(0, 10)
  if (typeof value === 'string') return value.slice(0, 10)
  return ''
}

const formatDateTime = (value) => {
  const date = toDate(value)
  if (!date) return '-'
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const buildAuditEntry = (status, note = '') => ({
  status,
  note,
  by: currentUserName.value,
  at: new Date().toISOString(),
})

const normalizeIncomingRow = (id, data) => {
  const items = getIncomingItems(data)
  const qtySj = getQtySj({ ...data, items })
  const qtyActual = getQtyActual({ ...data, items })
  const material =
    data.material || data.nama_barang || data.nama_material || data.tipe_material || ''
  const checker = data.checker_qc || data.qc_checker || data.checker || data.checker_gudang || ''
  const shortage = hasMaterialShortage({ ...data, items })
  const currentStatus = getStatus(data)
  const status =
    shortage && isWorkflowBlockedByShortage(currentStatus) ? STATUS_DATANG : currentStatus

  return {
    id,
    ...data,
    items,
    material_shortage: shortage,
    shortage_warning: shortage ? 'Menunggu Kekurangan Material' : '',
    supplier: data.supplier || data.asal || '',
    material: material || items[0]?.nama_barang || '',
    nama_barang: material || items[0]?.nama_barang || '',
    nama_material: material || items[0]?.nama_barang || '',
    qty: qtySj,
    qty_surat_jalan: qtySj,
    qty_actual: qtyActual,
    selisih_qty: qtyActual - qtySj,
    checker: checker,
    checker_qc: checker,
    qc_checker: checker,
    status: status,
    status_incoming: status,
    status_validation: status,
    tanggal_masuk:
      data.tanggal_masuk || normalizeDate(data.created_at) || new Date().toISOString().slice(0, 10),
  }
}

const loadIncoming = () => {
  loading.value = true
  if (unsubIncoming) unsubIncoming()

  unsubIncoming = onSnapshot(
    query(collection(db, COLLECTION_NAME), orderBy('created_at', 'desc')),
    (snapshot) => {
      incomingRows.value = snapshot.docs.map((docSnap) =>
        normalizeIncomingRow(docSnap.id, docSnap.data()),
      )
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat incoming material' })
    },
  )
}

const openAddDialog = () => {
  selectedRow.value = null
  companyLogo.value = null
  checkerSignature.value = null
  checkerSignatureLocked = false
  showFormDialog.value = true
}

const openEditDialog = (row) => {
  if (!row) return
  selectedRow.value = row
  companyLogo.value = getCompanyLogo(row)
  checkerSignature.value = getCheckerSignature(row)
  checkerSignatureLocked = Boolean(getCheckerSignature(row))
  showDetailDialog.value = false
  showFormDialog.value = true
}

const openDetail = (row) => {
  selectedRow.value = row
  showDetailDialog.value = true
}

const scrollToMonitoring = () => {
  document
    .getElementById('incoming-monitoring')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const getIncomingDialog = () => document.querySelector('.incoming-dialog')
const getFieldLabel = (field) => field?.querySelector('.q-field__label')?.textContent?.trim() || ''
const getCompanyLogo = (row) =>
  row?.company_logo || row?.company_logo_base64 || row?.logo_perusahaan || null
const getCompanyLogoSrc = (logo = companyLogo.value) =>
  typeof logo === 'string' ? logo : logo?.base64 || logo?.url || ''
const getCheckerSignature = (row) =>
  row?.checker_signature || row?.checker_signature_base64 || row?.tanda_tangan_checker || null
const getCheckerSignatureSrc = (signature = checkerSignature.value) =>
  typeof signature === 'string' ? signature : signature?.base64 || signature?.url || ''
const getMasterBarangName = (item = {}) =>
  item.nama || item.nama_barang || item.nama_material || item.material || ''
const resolveMasterName = (rows, value) => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const matched = rows.find(
    (row) => row.id === raw || String(row.nama || '').toLowerCase() === raw.toLowerCase(),
  )
  return matched?.nama || raw
}
const getMasterBarangCategory = (item = {}) =>
  resolveMasterName(
    masterKategoriRows.value,
    item.kategori || item.kategori_barang || item.kategori_material || item.category,
  )
const getMasterBarangUnit = (item = {}) =>
  resolveMasterName(
    masterSatuanRows.value,
    item.unit || item.satuan || item.satuan_barang || item.uom,
  )
const getMasterBarangLabel = (item = {}) => {
  const code = item.kode || item.kode_barang || item.sku || ''
  const name = getMasterBarangName(item)
  return [code, name].filter(Boolean).join(' - ') || '-'
}
const findMasterBarang = (value) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
  if (!normalized) return null
  return masterBarangRows.value.find((item) =>
    [getMasterBarangLabel(item), getMasterBarangName(item), item.kode, item.kode_barang, item.sku]
      .filter(Boolean)
      .some((entry) => String(entry).trim().toLowerCase() === normalized),
  )
}

const loadMasterReferences = () => {
  if (unsubMasterBarang) unsubMasterBarang()
  if (unsubMasterKategori) unsubMasterKategori()
  if (unsubMasterSatuan) unsubMasterSatuan()

  unsubMasterBarang = onSnapshot(
    query(collection(db, 'manufactur_master_barang'), orderBy('nama', 'asc')),
    (snapshot) => {
      masterBarangRows.value = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      nextTick(() => {
        const dialog = getIncomingDialog()
        if (dialog) injectMasterBarangControls(dialog)
      })
    },
    (error) => {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal memuat Master Data Barang' })
    },
  )

  unsubMasterKategori = onSnapshot(
    query(collection(db, 'manufactur_master_kategori_barang'), orderBy('nama', 'asc')),
    (snapshot) => {
      masterKategoriRows.value = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
    },
    (error) => {
      console.error(error)
    },
  )

  unsubMasterSatuan = onSnapshot(
    query(collection(db, 'manufactur_master_satuan'), orderBy('nama', 'asc')),
    (snapshot) => {
      masterSatuanRows.value = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
    },
    (error) => {
      console.error(error)
    },
  )
}

const setNativeInputValue = (input, value) => {
  if (!input) return
  input.value = value || ''
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const setQuasarFieldReadonly = (field, readonly = true) => {
  const input = field?.querySelector('input')
  if (!input) return
  input.readOnly = readonly
  input.setAttribute('aria-readonly', readonly ? 'true' : 'false')
  field.classList.toggle('incoming-readonly-field', readonly)
}

const relabelIncomingDialog = (dialog) => {
  Array.from(dialog.querySelectorAll('.q-field__label')).forEach((label) => {
    const text = label.textContent?.trim()
    if (text === 'Supplier *') label.textContent = 'Customer *'
    if (text === 'Supplier') label.textContent = 'Customer'
  })
  Array.from(dialog.querySelectorAll('input')).forEach((input) => {
    if (input.placeholder?.includes('Supplier'))
      input.placeholder = input.placeholder.replace(/Supplier/g, 'Customer')
  })
  dialog.querySelectorAll('.incoming-logo-label').forEach((label) => {
    label.textContent = 'Logo Customer'
  })
  dialog.querySelectorAll('.incoming-logo-caption').forEach((caption) => {
    caption.textContent = 'Format JPG atau PNG. Logo akan tampil di detail dan PDF incoming.'
  })
}

const formatDateOnly = (value) => {
  const date = toDate(value)
  if (!date) return '-'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const setCompanyLogoPreview = () => {
  const preview = document.getElementById('incoming-company-logo-preview')
  const placeholder = document.getElementById('incoming-company-logo-placeholder')
  const src = getCompanyLogoSrc()
  if (!preview || !placeholder) return
  preview.src = src
  preview.style.display = src ? 'block' : 'none'
  placeholder.style.display = src ? 'none' : 'flex'
}

const handleCompanyLogoSelected = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    event.target.value = ''
    $q.notify({ type: 'warning', message: 'Logo perusahaan harus format JPG atau PNG' })
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    companyLogo.value = {
      name: file.name,
      type: file.type,
      size: file.size,
      base64: String(reader.result || ''),
      uploaded_at: new Date().toISOString(),
    }
    setCompanyLogoPreview()
  }
  reader.readAsDataURL(file)
}

const setCheckerSignaturePreview = () => {
  const preview = document.getElementById('incoming-checker-signature-preview')
  const placeholder = document.getElementById('incoming-checker-signature-placeholder')
  const src = getCheckerSignatureSrc()
  if (!preview || !placeholder) return
  preview.src = src
  preview.style.display = src ? 'block' : 'none'
  placeholder.style.display = src || checkerSignatureHasInk ? 'none' : 'flex'
}

const syncCheckerSignaturePadState = () => {
  const wrapper = document.getElementById('incoming-checker-signature-pad')
  const saveButton = document.getElementById('incoming-checker-signature-save')
  const editButton = document.getElementById('incoming-checker-signature-edit')
  const canvas = document.getElementById('incoming-checker-signature-canvas')
  wrapper?.classList.toggle('is-signature-locked', checkerSignatureLocked)
  if (saveButton) saveButton.style.display = checkerSignatureLocked ? 'none' : 'inline-flex'
  if (editButton) editButton.style.display = checkerSignatureLocked ? 'inline-flex' : 'none'
  if (canvas) canvas.setAttribute('aria-readonly', checkerSignatureLocked ? 'true' : 'false')
  setCheckerSignaturePreview()
}

const getCheckerSignatureCanvasContext = (canvas = checkerSignatureCanvas) => {
  const context = canvas?.getContext('2d')
  if (!canvas || !context) return null
  context.lineWidth = 2.4
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.strokeStyle = '#18231d'
  return context
}

const resizeCheckerSignatureCanvas = (canvas) => {
  if (!canvas) return
  const width = 320
  const height = 120
  const ratio = window.devicePixelRatio || 1
  if (canvas.width === width * ratio && canvas.height === height * ratio) return
  canvas.width = width * ratio
  canvas.height = height * ratio
  const context = getCheckerSignatureCanvasContext(canvas)
  context?.scale(ratio, ratio)

  const src = getCheckerSignatureSrc()
  if (!src) return
  const image = new Image()
  image.onload = () => {
    context?.clearRect(0, 0, width, height)
    context?.drawImage(image, 0, 0, width, height)
    checkerSignatureHasInk = true
    setCheckerSignaturePreview()
  }
  image.src = src
}

const getSignaturePointerPosition = (event) => {
  const canvas = checkerSignatureCanvas
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()
  return {
    x: (event.clientX - rect.left) * (320 / (rect.width || 320)),
    y: (event.clientY - rect.top) * (120 / (rect.height || 120)),
  }
}

const startCheckerSignatureDraw = (event) => {
  if (checkerSignatureLocked) return
  const context = getCheckerSignatureCanvasContext()
  const position = getSignaturePointerPosition(event)
  if (!context || !position) return
  event.preventDefault()
  checkerSignatureDrawing = true
  checkerSignatureHasInk = true
  context.beginPath()
  context.moveTo(position.x, position.y)
  setCheckerSignaturePreview()
}

const drawCheckerSignature = (event) => {
  if (!checkerSignatureDrawing || checkerSignatureLocked) return
  const context = getCheckerSignatureCanvasContext()
  const position = getSignaturePointerPosition(event)
  if (!context || !position) return
  event.preventDefault()
  context.lineTo(position.x, position.y)
  context.stroke()
  setCheckerSignaturePreview()
}

const stopCheckerSignatureDraw = () => {
  checkerSignatureDrawing = false
}

const clearCheckerSignaturePad = () => {
  const canvas = checkerSignatureCanvas
  const context = getCheckerSignatureCanvasContext(canvas)
  if (!canvas || !context) return
  context.clearRect(0, 0, 320, 120)
  checkerSignature.value = null
  checkerSignatureHasInk = false
  checkerSignatureLocked = false
  checkerSignatureDrawing = false
  setCheckerSignaturePreview()
  syncCheckerSignaturePadState()
}

const captureCheckerSignaturePad = ({ lock = false, notify = false } = {}) => {
  const canvas = checkerSignatureCanvas
  if (!canvas || !checkerSignatureHasInk) return getCheckerSignatureSrc()
  const base64 = canvas.toDataURL('image/png')
  checkerSignature.value = {
    name: 'tanda-tangan-checker.png',
    type: 'image/png',
    base64,
    saved_at: new Date().toISOString(),
  }
  if (lock) checkerSignatureLocked = true
  checkerSignatureDrawing = false
  setCheckerSignaturePreview()
  syncCheckerSignaturePadState()
  if (notify) $q.notify({ type: 'positive', message: 'Tanda tangan checker disimpan' })
  return base64
}

const saveCheckerSignaturePad = () => {
  if (!checkerSignatureCanvas || !checkerSignatureHasInk) {
    $q.notify({ type: 'warning', message: 'Tanda tangan checker belum diisi' })
    return
  }
  captureCheckerSignaturePad({ lock: true, notify: true })
}

const editCheckerSignaturePad = () => {
  checkerSignatureLocked = false
  checkerSignatureDrawing = false
  syncCheckerSignaturePadState()
}

const bindCheckerSignaturePad = () => {
  const canvas = document.getElementById('incoming-checker-signature-canvas')
  if (!canvas || canvas.dataset.bound === 'true') return
  checkerSignatureCanvas = canvas
  checkerSignatureHasInk = Boolean(getCheckerSignatureSrc())
  checkerSignatureLocked = checkerSignatureLocked || checkerSignatureHasInk
  canvas.dataset.bound = 'true'
  canvas.style.touchAction = 'none'
  resizeCheckerSignatureCanvas(canvas)
  canvas.addEventListener('pointerdown', startCheckerSignatureDraw)
  canvas.addEventListener('pointermove', drawCheckerSignature)
  canvas.addEventListener('pointerup', stopCheckerSignatureDraw)
  canvas.addEventListener('pointerleave', stopCheckerSignatureDraw)
  canvas.addEventListener('pointercancel', stopCheckerSignatureDraw)
  document
    .getElementById('incoming-checker-signature-clear')
    ?.addEventListener('click', clearCheckerSignaturePad)
  document
    .getElementById('incoming-checker-signature-save')
    ?.addEventListener('click', saveCheckerSignaturePad)
  document
    .getElementById('incoming-checker-signature-edit')
    ?.addEventListener('click', editCheckerSignaturePad)
  setCheckerSignaturePreview()
  syncCheckerSignaturePadState()
}

const unbindCheckerSignaturePad = () => {
  const canvas = checkerSignatureCanvas
  canvas?.removeEventListener('pointerdown', startCheckerSignatureDraw)
  canvas?.removeEventListener('pointermove', drawCheckerSignature)
  canvas?.removeEventListener('pointerup', stopCheckerSignatureDraw)
  canvas?.removeEventListener('pointerleave', stopCheckerSignatureDraw)
  canvas?.removeEventListener('pointercancel', stopCheckerSignatureDraw)
  document
    .getElementById('incoming-checker-signature-clear')
    ?.removeEventListener('click', clearCheckerSignaturePad)
  document
    .getElementById('incoming-checker-signature-save')
    ?.removeEventListener('click', saveCheckerSignaturePad)
  document
    .getElementById('incoming-checker-signature-edit')
    ?.removeEventListener('click', editCheckerSignaturePad)
  if (canvas) canvas.dataset.bound = 'false'
  checkerSignatureCanvas = null
  checkerSignatureDrawing = false
}

const injectCompanyLogoUploader = (dialog) => {
  if (dialog.querySelector('#incoming-company-logo-upload')) {
    setCompanyLogoPreview()
    return
  }

  const documentSection = dialog.querySelector(
    '.form-section-card .q-card__section:last-child .row',
  )
  if (!documentSection) return

  const wrapper = document.createElement('div')
  wrapper.id = 'incoming-company-logo-upload'
  wrapper.className = 'col-12'
  wrapper.innerHTML = `
    <div class="incoming-logo-upload">
      <div class="incoming-logo-preview-box">
        <img id="incoming-company-logo-preview" alt="Logo perusahaan" />
        <div id="incoming-company-logo-placeholder">LOGO</div>
      </div>
      <div class="incoming-logo-actions">
        <div class="incoming-logo-label">Logo Customer</div>
        <div class="incoming-logo-caption">Format JPG atau PNG. Logo akan tampil di detail dan PDF incoming.</div>
        <label class="incoming-logo-button">
          Upload Logo
          <input id="incoming-company-logo-input" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" />
        </label>
      </div>
    </div>
  `
  documentSection.appendChild(wrapper)
  wrapper
    .querySelector('#incoming-company-logo-input')
    ?.addEventListener('change', handleCompanyLogoSelected)
  setCompanyLogoPreview()
}

const injectCheckerSignaturePad = (dialog) => {
  if (dialog.querySelector('#incoming-checker-signature-pad')) {
    bindCheckerSignaturePad()
    setCheckerSignaturePreview()
    return
  }

  const checkerField = Array.from(dialog.querySelectorAll('.q-field')).find((field) =>
    ['Checker QC *', 'Checker QC'].includes(getFieldLabel(field)),
  )
  const checkerColumn = checkerField?.closest('.col-12')
  if (!checkerColumn) return

  const wrapper = document.createElement('div')
  wrapper.id = 'incoming-checker-signature-pad'
  wrapper.className = 'col-12'
  wrapper.innerHTML = `
    <div class="incoming-signature-upload">
      <div class="incoming-signature-heading">
        <div class="incoming-signature-label">Tanda Tangan Checker</div>
        <div class="incoming-signature-caption">Gambar tanda tangan langsung dengan mouse atau touchpad.</div>
      </div>
      <div class="incoming-signature-pad-box">
        <canvas id="incoming-checker-signature-canvas" aria-label="Tanda tangan checker"></canvas>
        <div id="incoming-checker-signature-placeholder">TTD</div>
      </div>
      <div class="incoming-signature-actions">
        <button id="incoming-checker-signature-clear" class="incoming-signature-button incoming-signature-button--light" type="button">
          Clear
        </button>
        <button id="incoming-checker-signature-edit" class="incoming-signature-button incoming-signature-button--light" type="button">
          Edit TTD
        </button>
        <button id="incoming-checker-signature-save" class="incoming-signature-button" type="button">
          Simpan TTD
        </button>
      </div>
      <img id="incoming-checker-signature-preview" alt="Preview tanda tangan checker" />
    </div>
  `
  checkerColumn.insertAdjacentElement('afterend', wrapper)
  bindCheckerSignaturePad()
  setCheckerSignaturePreview()
}

const applyMasterBarangToRow = (row, barang) => {
  if (!row || !barang) return
  const namaInput = row.querySelector('td:nth-child(1) .q-field input')
  const kategoriInput = row.querySelector('td:nth-child(2) .q-field input')
  const satuanInput = row.querySelector('td:nth-child(3) .q-field input')
  const nama = getMasterBarangName(barang)
  const kategori = getMasterBarangCategory(barang)
  const satuan = getMasterBarangUnit(barang)

  setNativeInputValue(namaInput, nama)
  setNativeInputValue(kategoriInput, kategori)
  setNativeInputValue(satuanInput, satuan)
  row.dataset.masterBarangId = barang.id || ''
  row.dataset.masterBarangKode = barang.kode || barang.kode_barang || barang.sku || ''
}

const injectMasterBarangControls = (dialog) => {
  const rows = Array.from(dialog.querySelectorAll('.incoming-items-table tbody tr'))
  rows.forEach((row, index) => {
    const namaCell = row.querySelector('td:nth-child(1)')
    const namaField = namaCell?.querySelector('.q-field')
    const namaInput = namaField?.querySelector('input')
    const kategoriField = row.querySelector('td:nth-child(2) .q-field')
    const satuanField = row.querySelector('td:nth-child(3) .q-field')
    if (!namaCell || !namaField || !namaInput) return

    setQuasarFieldReadonly(namaField, true)
    setQuasarFieldReadonly(kategoriField, true)
    setQuasarFieldReadonly(satuanField, true)
    namaField.classList.add('incoming-master-hidden-field')

    let picker = namaCell.querySelector('.incoming-master-barang-picker')
    if (!picker) {
      const listId = `incoming-master-barang-list-${index}-${Date.now()}`
      picker = document.createElement('div')
      picker.className = 'incoming-master-barang-picker'
      picker.innerHTML = `
        <input
          class="incoming-master-barang-search"
          list="${listId}"
          placeholder="Cari / pilih barang dari Master Data Barang"
          autocomplete="off"
        />
        <datalist id="${listId}" class="incoming-master-barang-list"></datalist>
      `
      namaCell.insertBefore(picker, namaField)

      const searchInput = picker.querySelector('.incoming-master-barang-search')
      const applySelected = () => {
        const selected = findMasterBarang(searchInput.value)
        if (!selected) return
        searchInput.value = getMasterBarangLabel(selected)
        applyMasterBarangToRow(row, selected)
        validateIncomingDialogQty()
      }
      searchInput.addEventListener('change', applySelected)
      searchInput.addEventListener('blur', applySelected)
    }

    const searchInput = picker.querySelector('.incoming-master-barang-search')
    const dataList = picker.querySelector('datalist')
    const currentBarang = findMasterBarang(namaInput.value)
    if (searchInput && !searchInput.value && currentBarang)
      searchInput.value = getMasterBarangLabel(currentBarang)
    if (dataList) {
      const optionsHtml = masterBarangRows.value
        .map(
          (barang) =>
            `<option value="${getMasterBarangLabel(barang).replace(/"/g, '&quot;')}"></option>`,
        )
        .join('')
      if (dataList.innerHTML !== optionsHtml) dataList.innerHTML = optionsHtml
    }
  })
}

const updateIncomingDialogStatus = (dialog, invalid, shortage, totalSj, totalActual) => {
  const statusField = Array.from(dialog.querySelectorAll('.q-field')).find(
    (field) => getFieldLabel(field) === 'Status Validasi',
  )
  const statusInput = statusField?.querySelector('input')
  if (!statusInput) return
  const nextStatus = invalid
    ? STATUS_DATA_TIDAK_SESUAI
    : shortage
      ? STATUS_DATANG
      : totalSj === totalActual
        ? 'VALIDASI_SELESAI'
        : 'PARTIAL'
  if (statusInput.value !== nextStatus) statusInput.value = nextStatus
}

const updateIncomingDialogShortageWarning = (dialog, shortage) => {
  const statusField = Array.from(dialog.querySelectorAll('.q-field')).find(
    (field) => getFieldLabel(field) === 'Status Validasi',
  )
  const statusColumn = statusField?.closest('.col-12')
  if (!statusColumn) return
  let badge = statusColumn.querySelector('.incoming-shortage-warning-badge')
  if (!shortage) {
    badge?.remove()
    return
  }
  if (!badge) {
    badge = document.createElement('div')
    badge.className = 'incoming-shortage-warning-badge'
    badge.textContent = 'Menunggu Kekurangan Material'
    statusColumn.appendChild(badge)
  }
}

const updateIncomingDialogSaveButtons = (dialog, invalid) => {
  Array.from(dialog.querySelectorAll('button')).forEach((button) => {
    if (button.textContent?.trim() !== 'Simpan') return
    if (button.disabled !== invalid) button.disabled = invalid
    const ariaDisabled = invalid ? 'true' : 'false'
    if (button.getAttribute('aria-disabled') !== ariaDisabled)
      button.setAttribute('aria-disabled', ariaDisabled)
    if (button.classList.contains('disabled') !== invalid)
      button.classList.toggle('disabled', invalid)
    if (button.classList.contains('q-btn--disable') !== invalid)
      button.classList.toggle('q-btn--disable', invalid)
  })
}

const setSelisihBadgeTone = (badge, selisih) => {
  if (!badge) return
  const isMinus = selisih < 0
  badge.classList.toggle('selisih-minus-badge', isMinus)
  badge.style.backgroundColor = isMinus ? '#fff3e0' : ''
  badge.style.border = isMinus ? '1px solid #ffb74d' : ''
  badge.style.color = isMinus ? '#e65100' : ''
}

const validateIncomingDialogQty = () => {
  const dialog = getIncomingDialog()
  if (!dialog) return

  let invalid = false
  let shortage = false
  let totalSj = 0
  let totalActual = 0

  dialog.querySelectorAll('.incoming-items-table tbody tr').forEach((row) => {
    const qtySjInput = row.querySelector('td:nth-child(4) input')
    const qtyActualInput = row.querySelector('td:nth-child(5) input')
    const qtyActualField = qtyActualInput?.closest('.q-field')
    const selisihBadge = row.querySelector('td:nth-child(6) .q-badge')
    const qtySj = parseQtyInput(qtySjInput?.value)
    const qtyActual = parseQtyInput(qtyActualInput?.value)
    const isOverflow = qtyActual > qtySj
    const isShortage = qtyActual < qtySj
    const selisih = qtySj || qtyActual ? qtyActual - qtySj : 0

    totalSj += qtySj
    totalActual += qtyActual
    invalid = invalid || isOverflow
    shortage = shortage || isShortage
    qtyActualField?.classList.toggle('qty-actual-overflow-field', isOverflow)
    if (selisihBadge) {
      const selisihLabel = formatNumber(selisih)
      if (selisihBadge.textContent?.trim() !== selisihLabel) selisihBadge.textContent = selisihLabel
      setSelisihBadgeTone(selisihBadge, selisih)
    }
  })

  incomingQtyInvalid.value = invalid
  updateIncomingDialogStatus(dialog, invalid, shortage, totalSj, totalActual)
  updateIncomingDialogShortageWarning(dialog, shortage)
  updateIncomingDialogSaveButtons(dialog, invalid)

  if (invalid && !incomingDialogWarningShown) {
    incomingDialogWarningShown = true
    $q.notify({ type: 'warning', message: 'Qty actual melebihi Qty Surat Jalan' })
  }
  if (!invalid) incomingDialogWarningShown = false
}

const scheduleIncomingDialogQtyValidation = () => {
  if (incomingQtyValidationFrame) return
  incomingQtyValidationFrame = window.requestAnimationFrame(() => {
    incomingQtyValidationFrame = 0
    validateIncomingDialogQty()
  })
}

const bindIncomingDialogQtyValidation = () => {
  const dialog = getIncomingDialog()
  if (!dialog) return
  relabelIncomingDialog(dialog)
  injectCompanyLogoUploader(dialog)
  injectCheckerSignaturePad(dialog)
  injectMasterBarangControls(dialog)
  validateIncomingDialogQty()
  incomingDialogObserver?.disconnect()
  const itemTableBody = dialog.querySelector('.incoming-items-table tbody')
  incomingDialogObserver = new MutationObserver(() => {
    relabelIncomingDialog(dialog)
    injectCheckerSignaturePad(dialog)
    injectMasterBarangControls(dialog)
    scheduleIncomingDialogQtyValidation()
  })
  if (itemTableBody) incomingDialogObserver.observe(itemTableBody, { childList: true })
  dialog.addEventListener('input', scheduleIncomingDialogQtyValidation, true)
}

const cleanupIncomingDialogQtyValidation = () => {
  const dialog = getIncomingDialog()
  dialog?.removeEventListener('input', scheduleIncomingDialogQtyValidation, true)
  dialog
    ?.querySelector('#incoming-company-logo-input')
    ?.removeEventListener('change', handleCompanyLogoSelected)
  unbindCheckerSignaturePad()
  incomingDialogObserver?.disconnect()
  incomingDialogObserver = null
  if (incomingQtyValidationFrame) {
    window.cancelAnimationFrame(incomingQtyValidationFrame)
    incomingQtyValidationFrame = 0
  }
  incomingQtyInvalid.value = false
  incomingDialogWarningShown = false
}

const buildPayload = (form) => {
  const checkerSignatureBase64 = captureCheckerSignaturePad()
  const items = getIncomingItems(form).map((item) => ({
    ...item,
    qty_surat_jalan: toSafeNumber(item.qty_surat_jalan),
    qty_actual: toSafeNumber(item.qty_actual),
    selisih_qty:
      toSafeNumber(item.qty_surat_jalan) || toSafeNumber(item.qty_actual)
        ? toSafeNumber(item.qty_actual) - toSafeNumber(item.qty_surat_jalan)
        : 0,
  }))
  const qtySj = getQtySj({ ...form, items })
  const qtyActual = getQtyActual({ ...form, items })
  const material = form.nama_barang || form.material || form.nama_material || ''
  const checker = form.checker_qc || form.qc_checker || form.checker || currentUserName.value
  const hasQtyActualOverflow = items.some(
    (item) => toSafeNumber(item.qty_actual) > toSafeNumber(item.qty_surat_jalan),
  )
  const hasQtyActualShortage = items.some(
    (item) => toSafeNumber(item.qty_actual) < toSafeNumber(item.qty_surat_jalan),
  )
  const autoStatus = hasQtyActualOverflow
    ? STATUS_DATA_TIDAK_SESUAI
    : hasQtyActualShortage
      ? STATUS_DATANG
      : form.status_incoming || form.status_validation || STATUS_DATANG

  return {
    ...form,
    items,
    nomor_surat_jalan: form.nomor_surat_jalan || '',
    supplier: form.supplier || form.asal || '',
    asal: form.supplier || form.asal || '',
    company_name:
      form.company_name ||
      form.nama_perusahaan ||
      form.perusahaan ||
      form.supplier ||
      form.asal ||
      '',
    material: material || items[0]?.nama_barang || '',
    nama_barang: material || items[0]?.nama_barang || '',
    nama_material: material || items[0]?.nama_barang || '',
    qty: qtySj,
    qty_surat_jalan: qtySj,
    qty_actual: qtyActual,
    quantity: qtyActual,
    selisih_qty: qtyActual - qtySj,
    checker,
    checker_qc: checker,
    qc_checker: checker,
    status: autoStatus,
    status_incoming: autoStatus,
    status_validation: autoStatus,
    status_validasi: hasQtyActualOverflow
      ? STATUS_DATA_TIDAK_SESUAI
      : hasQtyActualShortage
        ? 'Menunggu Kekurangan Material'
        : qtyActual === qtySj
          ? 'Sesuai'
          : 'Selisih',
    material_shortage: hasQtyActualShortage,
    shortage_warning: hasQtyActualShortage ? 'Menunggu Kekurangan Material' : '',
    company_logo: companyLogo.value,
    company_logo_base64: getCompanyLogoSrc(),
    checker_signature: checkerSignature.value,
    checker_signature_base64: checkerSignatureBase64,
    tanda_tangan_checker: checkerSignatureBase64,
    updated_by: currentUserName.value,
    updated_at: serverTimestamp(),
  }
}

const validatePayload = (payload) => {
  if (!payload.nomor_surat_jalan) return 'Nomor surat jalan wajib diisi'
  if (!payload.supplier) return 'Customer wajib diisi'
  if (!payload.material) return 'Material wajib diisi'
  if (payload.qty_surat_jalan <= 0) return 'Qty surat jalan wajib lebih dari 0'
  if (payload.qty_actual < 0) return 'Qty actual tidak boleh minus'
  if (
    payload.items.some((item) => toSafeNumber(item.qty_actual) > toSafeNumber(item.qty_surat_jalan))
  ) {
    return 'Qty actual melebihi Qty Surat Jalan'
  }
  if (!payload.checker_qc) return 'Checker QC wajib diisi'
  return ''
}

const saveIncoming = async ({ form }) => {
  const payload = buildPayload(form)
  const errorMessage = validatePayload(payload)
  if (errorMessage) {
    $q.notify({ type: 'warning', message: errorMessage })
    return
  }
  if (incomingQtyInvalid.value) return

  submitting.value = true
  try {
    if (selectedRow.value?.id) {
      await updateDoc(doc(db, COLLECTION_NAME, selectedRow.value.id), {
        ...payload,
        history: [
          ...(selectedRow.value.history || []),
          buildAuditEntry(payload.status_incoming, 'Incoming diperbarui'),
        ],
      })
      $q.notify({ type: 'positive', message: 'Incoming material diperbarui' })
    } else {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...payload,
        status: STATUS_DATANG,
        status_incoming: STATUS_DATANG,
        status_validation: STATUS_DATANG,
        created_at: serverTimestamp(),
        created_by: {
          uid: authStore.user?.uid || auth.currentUser?.uid || '',
          nama: currentUserName.value,
          email: authStore.user?.email || auth.currentUser?.email || '',
        },
        history: [buildAuditEntry(STATUS_DATANG, 'Barang datang dan dokumen incoming dibuat')],
      })
      $q.notify({ type: 'positive', message: 'Incoming material disimpan' })
    }

    showFormDialog.value = false
    selectedRow.value = null
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan incoming material' })
  } finally {
    submitting.value = false
  }
}

const canSendToQc = (row) => {
  if (!row?.id) return false
  return getStatus(row) === STATUS_DATANG && !hasMaterialShortage(row)
}

const canDistributeMaterial = (row) => {
  if (!row?.id) return false
  return getStatus(row) === STATUS_QC_APPROVED && !hasMaterialShortage(row)
}

const openQcPage = () => {
  router.push({ name: 'manufaktur-qc-incoming' })
}

const sendToQc = (row) => {
  if (hasMaterialShortage(row)) {
    $q.notify({ type: 'warning', message: 'Menunggu Kekurangan Material' })
    return
  }
  if (!canSendToQc(row)) return
  $q.dialog({
    title: 'Kirim ke QC',
    message: `Kirim incoming ${row.nomor_surat_jalan || '-'} ke halaman QC?`,
    cancel: true,
    ok: { color: 'green-10', unelevated: true, label: 'Kirim ke QC' },
  }).onOk(async () => {
    await updateWorkflow(
      row,
      STATUS_SEND_TO_QC,
      'Incoming dikirim ke QC untuk pengecekan kualitas detail',
    )
  })
}

const deleteIncoming = (row) => {
  if (!row?.id) return
  $q.dialog({
    title: 'Hapus Incoming',
    message: `Hapus permanen incoming ${row.nomor_surat_jalan || '-'}? Data yang dihapus tidak dapat dikembalikan.`,
    cancel: true,
    ok: { color: 'negative', unelevated: true, label: 'Hapus' },
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, row.id))
      if (selectedRow.value?.id === row.id) {
        showDetailDialog.value = false
        selectedRow.value = null
      }
      $q.notify({ type: 'positive', message: 'Incoming material berhasil dihapus' })
    } catch (error) {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal menghapus incoming material' })
    }
  })
}

const distribusiMaterial = (row) => {
  if (hasMaterialShortage(row)) {
    $q.notify({ type: 'warning', message: 'Menunggu Kekurangan Material' })
    return
  }
  if (!canDistributeMaterial(row)) return
  $q.dialog({
    title: 'Distribusi Material',
    message:
      'Tandai incoming ini sebagai material yang sudah didistribusikan ke produksi / proyek?',
    cancel: true,
    ok: { color: 'green-10', unelevated: true, label: 'Distribusikan' },
  }).onOk(async () => {
    await updateWorkflow(row, STATUS_DISTRIBUSI, 'Material didistribusikan ke produksi / proyek', {
      distribution_status: 'DONE',
      distribution_target: row.distribution_target || row.alokasi || 'Produksi / Proyek',
      distribution_at: serverTimestamp(),
      distribution_by: currentUserName.value,
    })
  })
}

const updateWorkflow = async (row, status, note, extraPayload = {}) => {
  if (hasMaterialShortage(row) && isWorkflowBlockedByShortage(status)) {
    $q.notify({ type: 'warning', message: 'Menunggu Kekurangan Material' })
    return
  }
  try {
    await updateDoc(doc(db, COLLECTION_NAME, row.id), {
      status,
      status_incoming: status,
      status_validation: status,
      updated_at: serverTimestamp(),
      updated_by: currentUserName.value,
      last_status_at: serverTimestamp(),
      distribution_history:
        status === STATUS_DISTRIBUSI
          ? [
              ...(row.distribution_history || []),
              {
                at: new Date().toISOString(),
                by: currentUserName.value,
                status,
                note,
                target:
                  extraPayload.distribution_target ||
                  row.distribution_target ||
                  'Produksi / Proyek',
              },
            ]
          : row.distribution_history || [],
      history: [...(row.history || []), buildAuditEntry(status, note)],
      ...extraPayload,
    })
    showDetailDialog.value = false
    $q.notify({ type: 'positive', message: `Status diperbarui: ${statusLabel(status)}` })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal update workflow incoming' })
  }
}

const getDetailPdfElement = () => detailPdfRef.value?.$el || detailPdfRef.value

const printDetailPdf = () => {
  if (!getDetailPdfElement()) {
    $q.notify({ type: 'warning', message: 'Preview surat belum siap dicetak' })
    return
  }
  window.print()
}

const downloadDetailPdf = async () => {
  const source = getDetailPdfElement()
  if (!source) {
    $q.notify({ type: 'warning', message: 'Preview surat belum siap diunduh' })
    return
  }

  try {
    await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: detailPdfFilename.value,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .from(source)
      .save()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal export PDF incoming' })
  }
}

const exportExcel = () => {
  $q.notify({ type: 'info', message: 'Export Excel incoming material belum diaktifkan' })
}

watch(showFormDialog, (isOpen) => {
  if (isOpen) {
    nextTick(bindIncomingDialogQtyValidation)
    return
  }
  cleanupIncomingDialogQtyValidation()
})

onMounted(() => {
  loadIncoming()
  loadMasterReferences()
})

onUnmounted(() => {
  if (unsubIncoming) unsubIncoming()
  if (unsubMasterBarang) unsubMasterBarang()
  if (unsubMasterKategori) unsubMasterKategori()
  if (unsubMasterSatuan) unsubMasterSatuan()
  cleanupIncomingDialogQtyValidation()
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

.shadow-premium {
  box-shadow: 0 10px 30px rgba(27, 94, 32, 0.15);
}

.tracking-widest {
  letter-spacing: 0.9px;
}

.leading-tight {
  line-height: 1.15;
}

.workflow-card-main {
  border-color: #dfe8df;
  overflow: hidden;
}

.workflow-step {
  align-items: center;
  background: #f7fbf8;
  border: 1px solid #dfe8df;
  border-radius: 14px;
  display: flex;
  min-height: 72px;
  padding: 12px;
  transition: all 0.2s ease;
}

.workflow-step:hover {
  background: #edf7f3;
  transform: translateY(-1px);
}

.workflow-label {
  color: #1f2a24;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.2;
}

.workflow-caption {
  color: #667085;
  font-size: 11px;
  line-height: 1.2;
  margin-top: 2px;
}

.table-without-summary :deep(.incoming-summary) {
  display: none;
}

.section-title-row {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.min-width-0 {
  min-width: 0;
}

.detail-card {
  overflow: hidden;
}

.detail-paper-shell {
  max-width: 100%;
}

.detail-header {
  background: #1b5e20;
  color: #ffffff;
  padding: 14px 18px;
}

.status-panel,
.workflow-card {
  background: #f7faf8;
  border-radius: 8px;
}

.detail-section-card {
  border-color: #dfe8df;
  border-radius: 10px;
  height: 100%;
  overflow: hidden;
}

.detail-section-head {
  align-items: center;
  background: #e8f5e9;
  color: #1b5e20;
  display: flex;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.4px;
  padding: 10px 14px;
  text-transform: uppercase;
}

.label-meta {
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.field-value {
  color: #1f2a24;
  font-size: 14px;
  font-weight: 800;
}

:global(.incoming-detail-summary) {
  margin: 0 auto 18px;
  max-width: 794px;
  overflow: visible;
  width: 794px;
}

:global(.incoming-detail-summary .detail-summary-card) {
  background: #ffffff;
  border: 1px solid #d4ded6;
  border-radius: 10px;
  box-shadow: 0 16px 34px rgba(18, 61, 30, 0.1);
  color: #18231d;
  margin: 0 auto;
  min-height: 1123px;
  overflow: visible;
  width: 794px;
}

:global(.incoming-detail-summary .detail-header-compact) {
  padding: 28px 34px 20px;
}

:global(.incoming-detail-summary .document-company-row) {
  align-items: center;
  border-bottom: 2px solid #1b5e20;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) auto;
  padding-bottom: 18px;
}

:global(.incoming-detail-summary .document-brand) {
  align-items: center;
  display: flex;
  gap: 16px;
  min-width: 0;
}

:global(.incoming-detail-summary .company-logo-frame) {
  align-items: center;
  background: #ffffff;
  border: 1px solid #d4ded6;
  border-radius: 8px;
  display: flex;
  flex: 0 0 74px;
  height: 74px;
  justify-content: center;
  overflow: hidden;
  width: 74px;
}

:global(.incoming-detail-summary .company-logo-img) {
  height: 100%;
  object-fit: contain;
  padding: 6px;
  width: 100%;
}

:global(.incoming-detail-summary .company-name) {
  color: #123d1e;
  font-family: 'Inter', Arial, sans-serif;
  font-size: 18px;
  font-weight: 950;
  line-height: 1.2;
  text-transform: uppercase;
}

:global(.incoming-detail-summary .company-subtitle) {
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  margin-top: 4px;
}

:global(.incoming-detail-summary .detail-status-badge) {
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.35px;
  padding: 5px 10px;
}

.shortage-warning-badge,
:global(.incoming-dialog .incoming-shortage-warning-badge) {
  align-items: center;
  background: #fff7ed;
  border: 1px solid #fdba74;
  border-radius: 999px;
  color: #c2410c;
  display: inline-flex;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.25px;
  margin-top: 6px;
  padding: 4px 9px;
  text-transform: uppercase;
}

:global(.incoming-detail-summary .document-title-block) {
  border-top: 0;
  margin-top: 22px;
  padding-top: 0;
}

:global(.incoming-detail-summary .document-title) {
  color: #123d1e;
  font-family: 'Times New Roman', Georgia, serif;
  font-size: 23px;
  font-weight: 900;
  letter-spacing: 1px;
  line-height: 1.25;
  text-align: center;
}

:global(.incoming-detail-summary .document-meta-grid) {
  border: 1px solid #c8d8ca;
  border-radius: 8px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 18px;
  overflow: hidden;
}

:global(.incoming-detail-summary .document-meta-cell) {
  background: #fbfdfb;
  padding: 11px 14px;
}

:global(.incoming-detail-summary .document-meta-cell + .document-meta-cell) {
  border-left: 1px solid #c8d8ca;
}

:global(.incoming-detail-summary .document-meta-label),
:global(.incoming-detail-summary .detail-info-label) {
  color: #5f6f65;
  font-family: 'Inter', Arial, sans-serif;
  font-size: 9.5px;
  font-weight: 900;
  letter-spacing: 0.45px;
  text-transform: uppercase;
}

:global(.incoming-detail-summary .document-number),
:global(.incoming-detail-summary .document-date),
:global(.incoming-detail-summary .detail-info-value) {
  color: #18231d;
  font-size: 13px;
  font-weight: 850;
  line-height: 1.35;
  margin-top: 4px;
}

:global(.incoming-detail-summary .clean-divider) {
  background: #dce7de;
  height: 1px;
  margin: 0 34px;
}

:global(.incoming-detail-summary .detail-section) {
  padding: 18px 34px;
}

:global(.incoming-detail-summary .document-info-grid) {
  border: 1px solid #c8d8ca;
  border-radius: 8px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
}

:global(.incoming-detail-summary .detail-info-cell) {
  background: #ffffff;
  border-bottom: 1px solid #c8d8ca;
  border-right: 1px solid #c8d8ca;
  min-height: 68px;
  padding: 12px 14px;
}

:global(.incoming-detail-summary .detail-info-cell:nth-child(3n)) {
  border-right: 0;
}

:global(.incoming-detail-summary .detail-info-cell:nth-last-child(-n + 3)) {
  border-bottom: 0;
}

:global(.incoming-detail-summary .section-heading) {
  color: #123d1e;
  font-family: 'Inter', Arial, sans-serif;
  font-size: 12px;
  font-weight: 950;
  letter-spacing: 0.45px;
  margin-bottom: 10px;
  text-transform: uppercase;
}

:global(.incoming-detail-summary .pdf-items-table) {
  border: 1px solid #204d2b;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
}

:global(.incoming-detail-summary .pdf-items-table table) {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
}

:global(.incoming-detail-summary .pdf-items-table thead tr th) {
  background: #1b5e20;
  border: 1px solid #204d2b;
  color: #ffffff;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.35px;
  padding: 7px 6px;
  text-transform: uppercase;
  white-space: normal;
}

:global(.incoming-detail-summary .pdf-items-table tbody td) {
  border: 1px solid #d2ded4;
  color: #1f2a24;
  font-size: 10px;
  line-height: 1.35;
  padding: 7px 6px;
  vertical-align: top;
  white-space: normal;
  word-break: break-word;
}

:global(.incoming-detail-summary .pdf-items-table tbody tr:nth-child(even)) {
  background: #f8fbf8;
}

:global(.incoming-detail-summary .incoming-detail-selisih-minus) {
  color: #c2410c !important;
  font-weight: 900;
}

:global(.incoming-detail-summary .incoming-detail-selisih-plus) {
  color: #1b5e20 !important;
  font-weight: 900;
}

:global(.incoming-detail-summary .approval-strip) {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding-top: 6px;
}

:global(.incoming-detail-summary .approval-column) {
  background: #ffffff;
  border: 1px solid #d7e2d9;
  border-radius: 8px;
  height: 182px;
  overflow: hidden;
  padding: 12px 10px 10px;
  text-align: center;
}

:global(.incoming-detail-summary .approval-role) {
  color: #123d1e;
  font-size: 10px;
  font-weight: 950;
  letter-spacing: 0.45px;
  text-transform: uppercase;
}

:global(.incoming-detail-summary .approval-signature-line) {
  align-items: center;
  border-bottom: 1px solid #18231d;
  display: flex;
  justify-content: center;
  margin: 12px auto 10px;
  min-height: 76px;
  position: relative;
  width: min(150px, 100%);
}

:global(.incoming-detail-summary .approval-name) {
  color: #18231d;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.3;
}

:global(.incoming-detail-summary .approval-position),
:global(.incoming-detail-summary .approval-timestamp) {
  color: #667085;
  font-size: 9.5px;
  font-weight: 700;
  line-height: 1.35;
}

@media (max-width: 900px) {
  :global(.incoming-detail-summary) {
    transform: scale(calc((100vw - 32px) / 794));
    transform-origin: top center;
  }
}

@media print {
  :global(body),
  :global(.q-page),
  :global(.q-layout),
  :global(.q-dialog__inner),
  :global(.q-card) {
    background: #ffffff !important;
  }

  :global(.no-print),
  :global(.q-dialog__backdrop),
  .detail-header,
  .detail-actions,
  .detail-section-card,
  .workflow-card {
    display: none !important;
  }

  :global(.q-dialog__inner) {
    display: block !important;
    height: auto !important;
    inset: auto !important;
    max-height: none !important;
    max-width: none !important;
    overflow: visible !important;
    padding: 0 !important;
    position: static !important;
    width: auto !important;
  }

  .detail-card {
    background: #ffffff !important;
    box-shadow: none !important;
    display: block !important;
    height: auto !important;
    overflow: visible !important;
  }

  .detail-paper-shell {
    max-width: none !important;
    width: 100% !important;
  }

  :global(.incoming-detail-summary) {
    margin: 0 auto !important;
    max-width: 794px !important;
    transform: none !important;
    width: 794px !important;
  }

  :global(.incoming-detail-summary .detail-summary-card) {
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    min-height: 1123px !important;
    overflow: visible !important;
    width: 794px !important;
  }

  :global(.incoming-detail-summary .pdf-items-table thead tr th) {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  @page {
    margin: 10mm;
    size: A4 portrait;
  }
}

.btn-hover {
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.btn-hover:hover {
  transform: translateY(-1px);
}

:global(.incoming-dialog .qty-actual-overflow-field .q-field__control) {
  background: #fff5f5;
}

:global(.incoming-dialog .qty-actual-overflow-field .q-field__control::before),
:global(.incoming-dialog .qty-actual-overflow-field .q-field__control::after) {
  border-color: #c10015 !important;
}

:global(.incoming-dialog .qty-actual-overflow-field input) {
  color: #c10015;
  font-weight: 800;
}

:global(.incoming-dialog .incoming-logo-upload) {
  align-items: center;
  background: #f7fbf8;
  border: 1px solid #dfe8df;
  border-radius: 12px;
  display: flex;
  gap: 14px;
  padding: 12px;
}

:global(.incoming-dialog .incoming-logo-preview-box) {
  align-items: center;
  background: #ffffff;
  border: 1px dashed #b9cbbb;
  border-radius: 10px;
  display: flex;
  flex: 0 0 96px;
  height: 72px;
  justify-content: center;
  overflow: hidden;
  width: 96px;
}

:global(.incoming-dialog #incoming-company-logo-preview) {
  display: none;
  height: 100%;
  object-fit: contain;
  padding: 6px;
  width: 100%;
}

:global(.incoming-dialog #incoming-company-logo-placeholder) {
  align-items: center;
  color: #1b5e20;
  display: flex;
  font-size: 12px;
  font-weight: 900;
  height: 100%;
  justify-content: center;
  letter-spacing: 0.8px;
  width: 100%;
}

:global(.incoming-dialog .incoming-logo-actions) {
  min-width: 0;
}

:global(.incoming-dialog .incoming-logo-label) {
  color: #1f2a24;
  font-size: 13px;
  font-weight: 900;
  line-height: 1.2;
}

:global(.incoming-dialog .incoming-logo-caption) {
  color: #667085;
  font-size: 11px;
  line-height: 1.3;
  margin: 3px 0 8px;
}

:global(.incoming-dialog .incoming-logo-button) {
  align-items: center;
  background: #1b5e20;
  border-radius: 999px;
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  font-size: 12px;
  font-weight: 800;
  min-height: 30px;
  padding: 6px 14px;
}

:global(.incoming-dialog .incoming-logo-button input) {
  display: none;
}

:global(.incoming-dialog .incoming-signature-upload) {
  align-items: stretch;
  background: #f7fbf8;
  border: 1px solid #dfe8df;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 348px;
  padding: 12px;
  width: min(100%, 348px);
}

:global(.incoming-dialog .incoming-signature-heading) {
  min-width: 0;
}

:global(.incoming-dialog .incoming-signature-pad-box) {
  align-items: center;
  background: #ffffff;
  border: 1px solid #cfded2;
  border-radius: 8px;
  box-shadow: inset 0 1px 2px rgba(27, 94, 32, 0.04);
  display: flex;
  height: 120px;
  justify-content: center;
  overflow: hidden;
  position: relative;
  max-width: 320px;
  width: 100%;
}

:global(.incoming-dialog #incoming-checker-signature-canvas) {
  cursor: crosshair;
  display: block;
  height: 120px;
  max-width: 320px;
  width: 100%;
}

:global(.incoming-dialog #incoming-checker-signature-preview) {
  display: none;
  background: #ffffff;
  border: 1px solid #cfded2;
  border-radius: 8px;
  height: 120px;
  max-width: 320px;
  object-fit: contain;
  padding: 8px;
  width: min(100%, 320px);
}

:global(.incoming-dialog #incoming-checker-signature-placeholder) {
  align-items: center;
  color: #1b5e20;
  display: flex;
  font-size: 12px;
  font-weight: 900;
  height: 100%;
  justify-content: center;
  letter-spacing: 0.8px;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
}

:global(.incoming-dialog .incoming-signature-actions) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

:global(.incoming-dialog .incoming-signature-label) {
  color: #1f2a24;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.2;
}

:global(.incoming-dialog .incoming-signature-caption) {
  color: #667085;
  font-size: 10.5px;
  line-height: 1.3;
  margin: 2px 0 7px;
}

:global(.incoming-dialog .incoming-signature-button) {
  align-items: center;
  background: #1b5e20;
  border: 1px solid #1b5e20;
  border-radius: 999px;
  color: #ffffff;
  cursor: pointer;
  display: inline-flex;
  font-size: 11px;
  font-weight: 800;
  min-height: 28px;
  padding: 5px 12px;
}

:global(.incoming-dialog .incoming-signature-button--light) {
  background: #ffffff;
  color: #1b5e20;
}

:global(.incoming-dialog #incoming-checker-signature-edit) {
  display: none;
}

:global(.incoming-dialog .is-signature-locked .incoming-signature-pad-box) {
  display: none;
}

:global(.incoming-dialog .is-signature-locked #incoming-checker-signature-preview) {
  display: block !important;
}

:global(.incoming-detail-summary .approval-signature-line) {
  justify-content: center;
  position: relative;
}

:global(.incoming-detail-summary .incoming-detail-checker-signature-img) {
  display: block;
  background: transparent;
  height: auto;
  margin: 0 auto 4px;
  max-height: 70px;
  max-width: 140px;
  object-fit: contain;
}

:global(.incoming-dialog .incoming-master-hidden-field) {
  display: none;
}

:global(.incoming-dialog .incoming-master-barang-picker) {
  width: 100%;
}

:global(.incoming-dialog .incoming-master-barang-search) {
  background: #ffffff;
  border: 1px solid rgba(27, 94, 32, 0.24);
  border-radius: 4px;
  color: #1f2a24;
  font-size: 12px;
  font-weight: 700;
  min-height: 40px;
  outline: none;
  padding: 0 12px;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
  width: 100%;
}

:global(.incoming-dialog .incoming-master-barang-search:focus) {
  border-color: #1b5e20;
  box-shadow: 0 0 0 2px rgba(27, 94, 32, 0.12);
}

:global(.incoming-dialog .incoming-readonly-field .q-field__control) {
  background: #f6f8f6;
  pointer-events: none;
}

:global(.incoming-dialog .incoming-readonly-field input) {
  color: #526159;
  cursor: not-allowed;
  font-weight: 800;
}

@media (max-width: 599px) {
  :global(.incoming-dialog .incoming-logo-upload) {
    align-items: flex-start;
    flex-direction: column;
  }

  :global(.incoming-dialog .incoming-signature-upload) {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
