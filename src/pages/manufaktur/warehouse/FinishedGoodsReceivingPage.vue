<template>
  <q-page class="fg-page bg-dark-premium q-pa-md q-pa-lg-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder incoming-title">Good Receipt Finished Goods</div>
        <div class="text-subtitle1 incoming-subtitle q-mt-sm">
          Penerimaan barang jadi dari Packing Produksi ke gudang Finished Goods.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <div class="row q-gutter-sm">
          <q-btn
            unelevated
            rounded
            icon="qr_code_scanner"
            label="Scan Barang Masuk"
            no-caps
            class="q-px-lg touch-btn btn-neon-green"
            @click="openInboundScanner"
          />
          <q-btn
            flat
            rounded
            icon="sync"
            label="Refresh"
            no-caps
            class="q-px-lg touch-btn btn-glass"
            :loading="loading"
            @click="subscribeTransfers"
          />
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="card in statCards" :key="card.key" class="col-12 col-sm-6 col-lg-3">
        <q-card flat bordered class="stat-card glass-card">
          <q-card-section class="row items-center no-wrap">
            <q-avatar :color="card.color" text-color="white" :icon="card.icon" size="48px" />
            <div class="q-ml-md col">
              <div class="stat-label">{{ card.label }}</div>
              <div class="stat-value">{{ card.value }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered class="filter-card glass-card q-mb-lg">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-lg-4">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              dark
              debounce="250"
              placeholder="Cari transfer, packing, SPK, PO, customer, produk..."
            >
              <template #prepend>
                <q-icon name="search" color="cyan" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-lg-2">
            <q-select
              v-model="statusFilter"
              :options="statusOptions"
              outlined
              dense
              rounded
              dark
              emit-value
              map-options
              label="Status"
            />
          </div>
          <div class="col-12 col-sm-6 col-lg-2">
            <q-select
              v-model="poFilter"
              :options="poOptions"
              outlined
              dense
              rounded
              dark
              emit-value
              map-options
              label="PO"
            />
          </div>
          <div class="col-12 col-sm-6 col-lg-2">
            <q-select
              v-model="customerFilter"
              :options="customerOptions"
              outlined
              dense
              rounded
              dark
              emit-value
              map-options
              label="Customer"
            />
          </div>
          <div class="col-12 col-sm-6 col-lg-2">
            <q-input v-model="dateFilter" outlined dense rounded dark type="date" label="Tanggal Kirim" />
          </div>
          <div class="col-12">
            <q-chip dense color="cyan-9" text-color="white" class="text-weight-bold q-px-md">
              {{ filteredTransfers.length }} TRANSFER FG
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="table-card glass-card">
      <q-table
        :rows="filteredTransfers"
        :columns="columns"
        row-key="id"
        flat
        dark
        binary-state-sort
        class="fg-table-dark fg-table"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template #header="props">
          <q-tr :props="props" class="table-card-header text-white">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bold">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body="props">
          <q-tr :props="props">
            <q-td key="transfer_no" :props="props" class="text-weight-bold text-neon-cyan">
              {{ props.row.transfer_no || props.row.id }}
            </q-td>
            <q-td key="packing_id" :props="props">{{ props.row.packing_id || '-' }}</q-td>
            <q-td key="spk_no" :props="props">{{ props.row.spk_no || '-' }}</q-td>
            <q-td key="po_no" :props="props">{{ props.row.po_no || '-' }}</q-td>
            <q-td key="customer_name" :props="props">{{ props.row.customer_name || '-' }}</q-td>
            <q-td key="product_name" :props="props">
              <div class="text-weight-bold text-white">{{ props.row.product_name || '-' }}</div>
              <div class="text-caption text-secondary-premium">{{ props.row.product_code || '-' }}</div>
            </q-td>
            <q-td key="qty_sent" :props="props" class="text-weight-bold">
              {{ formatNumber(props.row.qty_sent) }}
            </q-td>
            <q-td key="qty_received" :props="props" class="text-weight-bold text-positive">
              {{ formatNumber(props.row.qty_received) }}
            </q-td>
            <q-td key="total_box" :props="props">{{ formatNumber(props.row.total_box) }}</q-td>
            <q-td key="checker_packing" :props="props">{{ props.row.checker_packing || '-' }}</q-td>
            <q-td key="receiver_name" :props="props">{{ props.row.receiver_name || '-' }}</q-td>
            <q-td key="status" :props="props">
              <q-chip dense square text-color="white" :color="statusMeta(props.row.status).color" class="status-chip">
                {{ statusMeta(props.row.status).label }}
              </q-chip>
            </q-td>
            <q-td key="created_at" :props="props">{{ formatDateTime(props.row.created_at) }}</q-td>
            <q-td key="aksi" :props="props" @click.stop>
              <q-btn
                unelevated
                rounded
                dense
                icon="qr_code_scanner"
                label="Terima Barang"
                no-caps
                class="q-px-sm btn-neon-green"
                :disable="['RECEIVED', 'CANCELLED'].includes(props.row.status)"
                @click="openVerifyDialog(props.row)"
              />
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-secondary-premium q-pa-xl">
            <q-icon name="inventory_2" size="28px" class="q-mr-sm" />
            Belum ada transfer FG dari Packing Produksi.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog
      v-model="verifyDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="verify-dialog column full-height full-width bg-dark-premium">
        <q-card-section class="dialog-header row items-center no-wrap">
          <q-icon name="warehouse" size="28px" class="q-mr-md text-neon-green" />
          <div class="col">
            <div class="text-h6 text-weight-bold text-white">
              {{ activeTransfer?.transfer_no || activeTransfer?.id || '-' }}
            </div>
            <div class="text-caption text-secondary-premium ellipsis">
              {{ activeTransfer?.spk_no || '-' }} | {{ activeTransfer?.po_no || '-' }} |
              {{ activeTransfer?.customer_name || '-' }} | {{ activeTransfer?.product_name || '-' }}
            </div>
          </div>
          <q-chip dense text-color="white" :color="statusMeta(activeTransfer?.status).color" class="q-mr-sm">
            {{ statusMeta(activeTransfer?.status).label }}
          </q-chip>
          <q-btn flat round dense icon="close" v-close-popup color="grey-4" />
        </q-card-section>

        <q-scroll-area class="col dialog-scroll">
          <div class="q-pa-md q-pa-lg-lg">
            <div class="detail-grid q-mb-lg">
              <div v-for="item in transferDetails" :key="item.label" class="detail-cell">
                <div class="detail-label">{{ item.label }}</div>
                <div class="detail-value">{{ item.value }}</div>
              </div>
            </div>

            <q-card flat bordered class="section-card glass-card q-mb-lg">
              <q-card-section class="section-title row items-center justify-between">
                <div class="row items-center">
                  <q-icon name="qr_code_scanner" color="cyan" size="24px" class="q-mr-sm" />
                  <span class="text-neon-green">Scan QR Box</span>
                </div>
                <q-badge color="cyan-9" class="q-px-sm q-py-xs">
                  {{ scannedBoxes.length }} / {{ selectedBoxes.length }} BOX
                </q-badge>
              </q-card-section>
              <q-separator dark />
              <q-card-section>
                <div class="row q-col-gutter-md items-end">
                  <div class="col-12 col-md-3">
                    <q-input
                      v-model="receiverName"
                      outlined
                      dense
                      dark
                      label="Receiver Gudang"
                      autocomplete="off"
                    />
                  </div>
                  <div class="col-12 col-md-7">
                    <q-input
                      ref="scanInputRef"
                      v-model="scanValue"
                      outlined
                      dark
                      label="SCAN QR BOX"
                      input-class="scan-input text-white"
                      autocomplete="off"
                      :disable="scanLoading"
                      @keyup.enter="handleScan"
                    >
                      <template #prepend>
                        <q-icon name="qr_code_2" color="cyan" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-2">
                    <q-btn
                      unelevated
                      icon="done"
                      label="Scan"
                      no-caps
                      class="full-width scan-btn btn-neon-green"
                      :loading="scanLoading"
                      @click="handleScan"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="section-card glass-card">
              <q-card-section class="section-title row items-center">
                <q-icon name="inventory_2" color="cyan" size="24px" class="q-mr-sm" />
                <span class="text-neon-green">Detail Box</span>
              </q-card-section>
              <q-separator dark />
              <q-card-section>
                <div v-if="loadingBoxes" class="q-pa-md">
                  <q-skeleton v-for="item in 4" :key="item" type="rect" height="64px" class="q-mb-sm" />
                </div>
                <div v-else class="box-grid">
                  <div v-for="box in selectedBoxes" :key="box.id" class="box-card">
                    <div class="row items-start no-wrap">
                      <q-avatar
                        :color="isBoxScanned(box) ? 'positive' : 'blue-grey-4'"
                        text-color="white"
                        :icon="isBoxScanned(box) ? 'task_alt' : 'qr_code_2'"
                        size="42px"
                      />
                      <div class="q-ml-md col">
                        <div class="box-title">BOX {{ box.nomor_box || '-' }}</div>
                        <div class="box-code">{{ box.barcode || box.id }}</div>
                        <div class="row q-col-gutter-sm q-mt-sm">
                          <div class="col-6">
                            <div class="mini-label">Qty Isi</div>
                            <div class="mini-value">{{ formatNumber(box.qty_isi ?? box.qty_sent ?? box.qty) }}</div>
                          </div>
                          <div class="col-6">
                            <div class="mini-label">Berat</div>
                            <div class="mini-value">{{ formatNumber(box.berat) }} kg</div>
                          </div>
                          <div class="col-12">
                            <div class="mini-label">Waktu Scan</div>
                            <div class="mini-value">{{ formatDateTime(box.scanned_at) }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-scroll-area>

        <q-card-section class="dialog-footer bg-glass-actions">
          <div class="row q-col-gutter-sm items-center">
            <div class="col-12 col-md">
              <q-input v-model="receivingNote" outlined dense dark label="Catatan penerimaan" />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="rackLocation"
                outlined
                dense
                dark
                label="Lokasi Rak"
                placeholder="RAK-A1 / FG-B2 / PALLET-C3"
              />
            </div>
            <div class="col-12 col-md-auto">
              <q-btn
                outline
                color="orange-9"
                icon="splitscreen"
                label="Simpan Partial"
                no-caps
                class="full-width footer-btn"
                :disable="!scannedBoxes.length || allBoxesScanned"
                :loading="finishLoading"
                @click="finishReceiving(true)"
              />
            </div>
            <div class="col-12 col-md-auto">
              <q-btn
                unelevated
                icon="verified"
                label="Simpan & Masukkan Stok"
                no-caps
                class="full-width footer-btn btn-neon-green"
                :disable="!allBoxesScanned"
                :loading="finishLoading"
                @click="finishReceiving(false)"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { auth } from 'src/boot/firebase'
import { useFinishedGoodsReceiving } from 'src/composables/useFinishedGoods'
import {
  completeFgReceiving,
  FG_TRANSFER_STATUS,
  scanFgTransferBox,
} from 'src/services/finishedGoodsService'

const $q = useQuasar()
const {
  transfers,
  selectedBoxes,
  loading,
  loadingBoxes,
  stats,
  subscribeTransfers,
  subscribeBoxes,
} = useFinishedGoodsReceiving()

const search = ref('')
const statusFilter = ref('all')
const poFilter = ref('all')
const customerFilter = ref('all')
const dateFilter = ref('')
const verifyDialog = ref(false)
const selectedTransferId = ref('')
const scanValue = ref('')
const receiverName = ref('')
const receivingNote = ref('')
const rackLocation = ref('')
const scanLoading = ref(false)
const finishLoading = ref(false)
const scanInputRef = ref(null)

const statusList = [
  { label: 'Transit', value: FG_TRANSFER_STATUS.TRANSIT, color: 'blue-grey-7', icon: 'local_shipping' },
  { label: 'Sedang Verifikasi', value: FG_TRANSFER_STATUS.VERIFYING, color: 'orange-9', icon: 'qr_code_scanner' },
  { label: 'Partial Received', value: FG_TRANSFER_STATUS.PARTIAL_RECEIVED, color: 'amber-9', icon: 'splitscreen' },
]

const statusOptions = computed(() => [
  { label: 'Semua Status', value: 'all' },
  ...statusList.map((status) => ({ label: status.label, value: status.value })),
])

const columns = [
  { name: 'transfer_no', label: 'No Transfer', field: 'transfer_no', align: 'left', sortable: true },
  { name: 'packing_id', label: 'No Packing', field: 'packing_id', align: 'left', sortable: true },
  { name: 'spk_no', label: 'Nomor SPK', field: 'spk_no', align: 'left', sortable: true },
  { name: 'po_no', label: 'Nomor PO', field: 'po_no', align: 'left', sortable: true },
  { name: 'customer_name', label: 'Customer', field: 'customer_name', align: 'left', sortable: true },
  { name: 'product_name', label: 'Nama Produk', field: 'product_name', align: 'left', sortable: true },
  { name: 'qty_sent', label: 'Qty Dikirim', field: 'qty_sent', align: 'right', sortable: true },
  { name: 'qty_received', label: 'Qty Received', field: 'qty_received', align: 'right', sortable: true },
  { name: 'total_box', label: 'Jumlah Koli', field: 'total_box', align: 'right', sortable: true },
  { name: 'checker_packing', label: 'Checker Packing', field: 'checker_packing', align: 'left' },
  { name: 'receiver_name', label: 'Receiver Gudang', field: 'receiver_name', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left', sortable: true },
  { name: 'created_at', label: 'Tanggal Kirim', field: 'created_at', align: 'left', sortable: true },
  { name: 'aksi', label: 'Aksi', field: 'aksi', align: 'center' },
]

const activeTransfer = computed(() =>
  transfers.value.find((transfer) => transfer.id === selectedTransferId.value) || null,
)

const scannedBoxes = computed(() =>
  selectedBoxes.value.filter((box) => box.status === 'SCANNED' || box.scanned_at),
)

const allBoxesScanned = computed(
  () => selectedBoxes.value.length > 0 && scannedBoxes.value.length === selectedBoxes.value.length,
)

const statCards = computed(() => [
  { key: 'transit', label: 'Transit', value: stats.value.transit, color: 'blue-grey-7', icon: 'local_shipping' },
  { key: 'verifying', label: 'Sedang Verifikasi', value: stats.value.verifying, color: 'orange-9', icon: 'qr_code_scanner' },
  { key: 'partial', label: 'Partial Received', value: stats.value.partial, color: 'amber-9', icon: 'splitscreen' },
  { key: 'total', label: 'Transfer Aktif', value: transfers.value.length, color: 'positive', icon: 'inventory_2' },
])

const uniqueOptions = (field) => {
  const values = [...new Set(transfers.value.map((item) => item[field]).filter(Boolean))]
  return [{ label: 'Semua', value: 'all' }, ...values.map((value) => ({ label: value, value }))]
}

const poOptions = computed(() => uniqueOptions('po_no'))
const customerOptions = computed(() => uniqueOptions('customer_name'))

const normalizeDate = (value) => {
  if (!value) return ''
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

const filteredTransfers = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return transfers.value.filter((transfer) => {
    const searchable = [
      transfer.transfer_no,
      transfer.packing_id,
      transfer.spk_no,
      transfer.po_no,
      transfer.customer_name,
      transfer.product_name,
      transfer.checker_packing,
      transfer.receiver_name,
      transfer.transfer_status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    if (keyword && !searchable.includes(keyword)) return false
    if (statusFilter.value !== 'all' && transfer.transfer_status !== statusFilter.value) return false
    if (poFilter.value !== 'all' && transfer.po_no !== poFilter.value) return false
    if (customerFilter.value !== 'all' && transfer.customer_name !== customerFilter.value) return false
    if (dateFilter.value && normalizeDate(transfer.transfer_date || transfer.created_at) !== dateFilter.value) return false
    return true
  })
})

const transferDetails = computed(() => {
  const transfer = activeTransfer.value || {}
  const qtySent = Number(transfer.qty_sent || transfer.qty_packing || 0)
  const qtyReceived = Number(transfer.qty_received || 0)
  return [
    { label: 'Qty Dikirim', value: formatNumber(qtySent) },
    { label: 'Qty Sudah Diterima', value: formatNumber(qtyReceived) },
    { label: 'Qty Remaining', value: formatNumber(Math.max(0, qtySent - qtyReceived)) },
    { label: 'Jumlah Box', value: formatNumber(transfer.total_box || transfer.jumlah_koli) },
    { label: 'Total Berat', value: `${formatNumber(transfer.total_weight)} kg` },
    { label: 'Checker Packing', value: transfer.checker_packing || '-' },
    { label: 'Driver / Pengirim', value: transfer.driver_name || transfer.sender_name || '-' },
    { label: 'Lokasi Rak', value: transfer.rack_location || '-' },
    { label: 'Catatan', value: transfer.note || transfer.catatan_packing || '-' },
  ]
})

const statusMeta = (status) =>
  statusList.find((item) => item.value === status) || {
    label: status || '-',
    color: 'blue-grey-5',
    icon: 'help',
  }

const formatNumber = (value) =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(Number(value || 0))

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const isBoxScanned = (box) => box.status === 'SCANNED' || box.scanned_at

const openVerifyDialog = async (row) => {
  selectedTransferId.value = row.id
  receiverName.value = row.receiver_name || ''
  receivingNote.value = row.receiving_note || ''
  rackLocation.value = row.rack_location || ''
  scanValue.value = ''
  verifyDialog.value = true
  subscribeBoxes(row.id)
  await nextTick()
  scanInputRef.value?.focus?.()
}

const openInboundScanner = () => {
  const transfer = filteredTransfers.value.find(
    (item) => ![FG_TRANSFER_STATUS.RECEIVED, FG_TRANSFER_STATUS.CANCELLED].includes(item.status),
  )
  if (!transfer) {
    $q.notify({ type: 'warning', message: 'Tidak ada transfer FG yang menunggu penerimaan.' })
    return
  }
  openVerifyDialog(transfer)
}

const handleScan = async () => {
  if (!activeTransfer.value?.id) return
  if (!receiverName.value) {
    $q.notify({ type: 'warning', message: 'Receiver gudang wajib diisi.' })
    return
  }
  if (!scanValue.value.trim()) return

  scanLoading.value = true
  try {
    await scanFgTransferBox({
      transferId: activeTransfer.value.id,
      qrValue: scanValue.value,
      receiverName: receiverName.value,
      receiverUserId: auth.currentUser?.uid || '',
    })
    scanValue.value = ''
    $q.notify({ type: 'positive', message: 'Box berhasil diverifikasi.' })
    await nextTick()
    scanInputRef.value?.focus?.()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: error?.message || 'QR box tidak valid.' })
  } finally {
    scanLoading.value = false
  }
}

const finishReceiving = async (allowPartial) => {
  if (!activeTransfer.value?.id) return
  if (!receiverName.value) {
    $q.notify({ type: 'warning', message: 'Receiver gudang wajib diisi.' })
    return
  }

  finishLoading.value = true
  try {
    await completeFgReceiving({
      transferId: activeTransfer.value.id,
      receiverName: receiverName.value,
      receiverUserId: auth.currentUser?.uid || '',
      note: receivingNote.value,
      allowPartial,
      rackLocation: rackLocation.value,
    })
    $q.notify({
      type: 'positive',
      message: allowPartial ? 'Penerimaan partial tersimpan.' : 'Penerimaan FG selesai.',
    })
    verifyDialog.value = false
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: error?.message || 'Gagal menyelesaikan penerimaan.' })
  } finally {
    finishLoading.value = false
  }
}

onMounted(subscribeTransfers)
</script>

<style scoped>
.bg-dark-premium {
  background-color: #071826 !important;
}

.incoming-title {
  color: #F4F7FA !important;
  text-shadow: 0 0 12px rgba(124, 255, 79, 0.18);
}

.incoming-subtitle {
  color: #B8C7D9 !important;
}

.text-neon-cyan {
  color: #00D1B2 !important;
}

.text-neon-green {
  color: #7CFF4F !important;
}

.text-secondary-premium {
  color: #B8C7D9 !important;
}

.btn-glass {
  background: rgba(13, 34, 51, 0.5) !important;
  border: 1px solid rgba(0, 209, 178, 0.25) !important;
  color: #00D1B2 !important;
  font-weight: 700 !important;
}
.btn-glass:hover {
  background: rgba(0, 209, 178, 0.1) !important;
  box-shadow: 0 0 12px rgba(0, 209, 178, 0.2);
}

.btn-neon-green {
  background: linear-gradient(135deg, #7CFF4F 0%, #66d93f 100%) !important;
  color: #071826 !important;
  font-weight: 700 !important;
}

.glass-card {
  background: rgba(13, 34, 51, 0.7) !important;
  border: 1px solid rgba(124, 255, 79, 0.08) !important;
  border-radius: 18px !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
}

.bg-glass-actions {
  background: rgba(13, 34, 51, 0.95) !important;
  border-top: 1px solid rgba(0, 209, 178, 0.15) !important;
  box-shadow: 0 -8px 20px rgba(0, 0, 0, 0.3) !important;
}

.touch-btn,
.footer-btn {
  min-height: 44px;
}

.scan-btn {
  min-height: 56px;
}

.stat-card,
.section-card {
  border-color: rgba(124, 255, 79, 0.08) !important;
  border-radius: 16px;
  overflow: hidden;
}

/* Table Spacing Alignment (Matching PlanningProduksiPage.vue) */
.table-card {
  margin-top: 20px !important;
  padding: 20px !important;
  border-radius: 18px !important;
  background: rgba(13, 34, 51, 0.85) !important;
  border: 1px solid rgba(124, 255, 79, 0.08) !important;
  overflow: hidden;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.table-card :deep(.q-table thead tr) {
  height: 54px !important;
}

.table-card :deep(.q-table thead th) {
  height: 54px !important;
  font-size: 13px !important;
  letter-spacing: 0.08em !important;
  padding: 0 18px !important;
  vertical-align: middle !important;
}

.table-card :deep(.q-table tbody tr) {
  min-height: 64px !important;
  height: 64px !important;
}

.table-card :deep(.q-table tbody td) {
  padding: 14px 18px !important;
  white-space: normal !important;
  vertical-align: middle !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
}

.table-card :deep(.q-table__bottom) {
  padding: 16px 20px !important;
}

.filter-card {
  padding: 16px 20px !important;
  margin-bottom: 16px !important;
  border-color: rgba(124, 255, 79, 0.08) !important;
  border-radius: 16px;
  overflow: hidden;
}

.filter-card :deep(.q-card__section) {
  padding: 0 !important;
}


.stat-label,
.detail-label,
.mini-label {
  color: #8CA3B8 !important;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.stat-value {
  color: #FFFFFF !important;
  font-size: 30px;
  font-weight: 900;
  line-height: 1;
  margin-top: 5px;
}

.fg-table {
  max-height: 68vh;
}

.fg-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  position: sticky;
  top: 0;
  z-index: 2;
}

.status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  min-width: 126px;
  justify-content: center;
}

.verify-dialog {
  border-radius: 0;
  height: 100%;
  max-height: 100%;
  max-width: 100%;
  width: 100%;
}

.dialog-header {
  background: rgba(13, 34, 51, 0.9) !important;
  border-bottom: 1px solid rgba(0, 209, 178, 0.2) !important;
  padding: 14px 18px;
}

.dialog-scroll {
  min-height: 0;
}

.dialog-footer {
  bottom: 0;
  flex-shrink: 0;
  position: sticky;
  z-index: 2;
}

.detail-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.detail-cell {
  background: rgba(13, 34, 51, 0.5) !important;
  border: 1px solid rgba(124, 255, 79, 0.08) !important;
  border-radius: 12px;
  padding: 12px;
}

.detail-value {
  color: #00D1B2 !important;
  font-size: 17px;
  font-weight: 900;
  line-height: 1.2;
  margin-top: 4px;
  word-break: break-word;
}

.section-title {
  color: #7CFF4F !important;
  font-size: 14px;
  font-weight: 900;
  padding: 12px 16px;
}

.scan-input {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0;
}

.box-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.box-card {
  background: rgba(13, 34, 51, 0.4) !important;
  border: 1px solid rgba(0, 209, 178, 0.15) !important;
  border-radius: 12px;
  padding: 12px;
}

.box-title {
  color: #00D1B2 !important;
  font-size: 15px;
  font-weight: 900;
}

.box-code {
  color: #8CA3B8 !important;
  font-size: 11px;
  font-weight: 700;
  word-break: break-word;
}

.mini-value {
  color: #F4F7FA !important;
  font-size: 13px;
  font-weight: 800;
}

.table-card-header {
  background: rgba(124, 255, 79, 0.06) !important;
  border-bottom: 1px solid rgba(124, 255, 79, 0.15) !important;
}

.fg-table-dark :deep(thead tr th) {
  background: rgba(13, 34, 51, 0.9) !important;
  color: #EAF2FF !important;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
}

.fg-table-dark :deep(tbody td) {
  color: #F4F7FA !important;
}

@media (max-width: 1023px) {
  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dialog-footer {
    padding-bottom: max(16px, env(safe-area-inset-bottom)) !important;
  }
}

@media (max-width: 599px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .stat-value {
    font-size: 26px;
  }
}
</style>
