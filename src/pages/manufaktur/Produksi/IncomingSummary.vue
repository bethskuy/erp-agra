<template>
  <div class="incoming-summary row q-col-gutter-md q-mb-lg">
    <div v-for="card in cards" :key="card.key" class="col-12 col-sm-6 col-lg">
      <q-card flat bordered class="summary-card rounded-20 shadow-1 bg-white">
        <q-card-section class="summary-content">
          <div class="row items-start no-wrap">
            <div class="summary-icon" :class="`summary-icon--${card.tone}`">
              <q-icon :name="card.icon" size="22px" />
            </div>

            <div class="col min-width-0">
              <div class="row items-center justify-between no-wrap q-gutter-sm">
                <div class="summary-label">{{ card.label }}</div>
                <q-chip dense square :color="card.color" text-color="white" class="summary-chip">
                  {{ card.chip }}
                </q-chip>
              </div>

              <template v-if="loading">
                <q-skeleton type="text" width="72px" height="34px" class="q-mt-sm" />
                <q-skeleton type="text" width="120px" height="16px" />
              </template>
              <template v-else>
                <div class="summary-value">{{ card.value }}</div>
                <div class="summary-caption">{{ card.caption }}</div>
              </template>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const getStatus = (row) => row?.status || row?.status_validation || row?.status_incoming || row?.status_qc || ''
const getQtyIncoming = (row) => Number(row?.qty_actual ?? row?.qty ?? row?.qty_surat_jalan ?? row?.quantity ?? 0)

const isPendingQc = (row) =>
  [
    'MENUNGGU_VALIDASI',
    'BARANG_DATANG',
    'VALIDASI_GUDANG',
    'QC_PENDING',
    'PARTIAL',
    'PENDING_QC',
  ].includes(getStatus(row))

const isReject = (row) =>
  ['INCOMING_REJECT', 'QC_NG', 'Reject', 'REJECT'].includes(getStatus(row)) || Number(row?.qty_ng || 0) > 0

const isDone = (row) => ['VALIDASI_SELESAI', 'SELESAI', 'QC_OK', 'Sesuai', 'DONE'].includes(getStatus(row))

const stats = computed(() =>
  props.rows.reduce(
    (acc, row) => {
      acc.total += 1
      if (isPendingQc(row) && !isReject(row) && !isDone(row)) acc.pendingQc += 1
      if (isReject(row)) acc.reject += 1
      if (isDone(row)) acc.done += 1
      acc.qtyIncoming += getQtyIncoming(row)
      return acc
    },
    {
      total: 0,
      pendingQc: 0,
      reject: 0,
      done: 0,
      qtyIncoming: 0,
    },
  ),
)

const cards = computed(() => [
  {
    key: 'total',
    label: 'Total Incoming',
    value: formatNumber(stats.value.total),
    caption: 'Dokumen material masuk',
    chip: 'ALL',
    icon: 'inventory_2',
    color: 'green-10',
    tone: 'green',
  },
  {
    key: 'pending',
    label: 'Pending QC',
    value: formatNumber(stats.value.pendingQc),
    caption: 'Menunggu validasi checker',
    chip: 'QC',
    icon: 'pending_actions',
    color: 'orange-9',
    tone: 'orange',
  },
  {
    key: 'reject',
    label: 'Reject',
    value: formatNumber(stats.value.reject),
    caption: 'Material tidak lolos incoming',
    chip: 'NG',
    icon: 'report_problem',
    color: 'negative',
    tone: 'red',
  },
  {
    key: 'done',
    label: 'Selesai',
    value: formatNumber(stats.value.done),
    caption: 'Incoming tervalidasi',
    chip: 'OK',
    icon: 'verified',
    color: 'positive',
    tone: 'teal',
  },
  {
    key: 'quantity',
    label: 'Qty Incoming',
    value: formatNumber(stats.value.qtyIncoming),
    caption: 'Total quantity actual',
    chip: 'QTY',
    icon: 'bar_chart',
    color: 'blue-grey-8',
    tone: 'slate',
  },
])
</script>

<style scoped>
.incoming-summary {
  align-items: stretch;
}

.summary-card {
  border-color: #dfe8df;
  height: 100%;
  min-height: 112px;
  transition: all 0.2s ease;
}

.summary-card:hover {
  box-shadow: 0 10px 28px rgba(27, 94, 32, 0.12);
  transform: translateY(-1px);
}

.summary-content {
  padding: 16px;
}

.summary-icon {
  align-items: center;
  border-radius: 14px;
  display: flex;
  flex: 0 0 42px;
  height: 42px;
  justify-content: center;
  margin-right: 12px;
  width: 42px;
}

.summary-icon--green {
  background: #e8f3eb;
  color: #1b5e20;
}

.summary-icon--orange {
  background: #fff4e5;
  color: #e65100;
}

.summary-icon--red {
  background: #fdecec;
  color: #c62828;
}

.summary-icon--teal {
  background: #e5f4f1;
  color: #00796b;
}

.summary-icon--slate {
  background: #edf1f4;
  color: #37474f;
}

.summary-label {
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  line-height: 1.2;
  text-transform: uppercase;
}

.summary-chip {
  border-radius: 4px;
  font-size: 10px;
  font-weight: 800;
  margin: 0;
  min-height: 20px;
  padding: 0 7px;
}

.summary-value {
  color: #1b5e20;
  font-size: 25px;
  font-weight: 950;
  line-height: 1.1;
  margin-top: 8px;
}

.summary-caption {
  color: #667085;
  font-size: 12px;
  line-height: 1.3;
  margin-top: 4px;
}

.min-width-0 {
  min-width: 0;
}

.rounded-20 {
  border-radius: 20px;
}

@media (max-width: 1023px) {
  .summary-value {
    font-size: 23px;
  }
}
</style>
