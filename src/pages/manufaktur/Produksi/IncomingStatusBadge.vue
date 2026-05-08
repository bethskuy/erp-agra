<template>
  <q-badge
    :color="color"
    :outline="outline"
    class="incoming-status-badge"
    :class="{ 'is-dense': dense, 'is-outline': outline }"
  >
    <q-icon :name="icon" :size="dense ? '13px' : '15px'" class="status-icon" />
    <span>{{ label }}</span>
    <q-tooltip>{{ tooltip }}</q-tooltip>
  </q-badge>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'MENUNGGU_VALIDASI',
  },
  dense: {
    type: Boolean,
    default: false,
  },
  outline: {
    type: Boolean,
    default: false,
  },
})

const STATUS_META = {
  DRAFT: {
    label: 'Draft',
    color: 'blue-grey-5',
    icon: 'edit_document',
    tooltip: 'Data incoming masih draft dan belum dikirim validasi.',
  },
  MENUNGGU_VALIDASI: {
    label: 'Menunggu Validasi',
    color: 'blue-grey-7',
    icon: 'hourglass_empty',
    tooltip: 'Incoming material menunggu proses validasi.',
  },
  VALIDASI_QC: {
    label: 'Validasi QC',
    color: 'cyan-8',
    icon: 'fact_check',
    tooltip: 'Material sedang dalam pemeriksaan QC.',
  },
  VALIDASI_SELESAI: {
    label: 'Validasi Selesai',
    color: 'positive',
    icon: 'verified',
    tooltip: 'Incoming material sudah selesai divalidasi.',
  },
  PARTIAL: {
    label: 'Partial',
    color: 'orange-9',
    icon: 'rule',
    tooltip: 'Qty actual belum sesuai penuh dengan surat jalan.',
  },
  HOLD: {
    label: 'Hold',
    color: 'amber-10',
    icon: 'pause_circle',
    tooltip: 'Incoming material ditahan sementara untuk review.',
  },
  INCOMING_REJECT: {
    label: 'Incoming Reject',
    color: 'negative',
    icon: 'report_problem',
    tooltip: 'Incoming material ditolak karena tidak memenuhi validasi.',
  },
}

const STATUS_ALIASES = {
  BARANG_DATANG: 'MENUNGGU_VALIDASI',
  VALIDASI_GUDANG: 'MENUNGGU_VALIDASI',
  QC_PENDING: 'VALIDASI_QC',
  QC_OK: 'VALIDASI_SELESAI',
  QC_NG: 'INCOMING_REJECT',
  MASUK_GUDANG: 'VALIDASI_SELESAI',
  SELESAI: 'VALIDASI_SELESAI',
  PENDING_QC: 'VALIDASI_QC',
  REJECT: 'INCOMING_REJECT',
  Reject: 'INCOMING_REJECT',
  Sesuai: 'VALIDASI_SELESAI',
  Selisih: 'PARTIAL',
}

const normalizedStatus = computed(() => {
  const value = props.status || 'UNKNOWN'
  return STATUS_ALIASES[value] || value
})

const fallbackMeta = computed(() => ({
  label: normalizedStatus.value === 'UNKNOWN' ? 'Unknown' : normalizedStatus.value.replace(/_/g, ' '),
  color: 'grey-7',
  icon: 'help_outline',
  tooltip: `Status incoming tidak dikenal: ${props.status || '-'}`,
}))

const meta = computed(() => STATUS_META[normalizedStatus.value] || fallbackMeta.value)
const color = computed(() => meta.value.color)
const icon = computed(() => meta.value.icon)
const label = computed(() => meta.value.label.toUpperCase())
const tooltip = computed(() => meta.value.tooltip)
</script>

<style scoped>
.incoming-status-badge {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-size: 11px;
  font-weight: 900;
  gap: 5px;
  letter-spacing: 0.45px;
  line-height: 1;
  min-height: 28px;
  padding: 6px 10px;
  box-shadow: 0 3px 10px rgba(27, 94, 32, 0.1);
  white-space: nowrap;
}

.incoming-status-badge.is-dense {
  font-size: 10px;
  min-height: 22px;
  padding: 4px 8px;
}

.incoming-status-badge.is-outline {
  background: #ffffff;
  box-shadow: none;
}

.status-icon {
  flex: 0 0 auto;
}
</style>
