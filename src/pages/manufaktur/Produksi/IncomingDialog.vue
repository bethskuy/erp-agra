<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="incoming-dialog column bg-grey-2">
      <q-form ref="formRef" class="dialog-form column" @submit.prevent="submitForm">
        <q-toolbar class="dialog-header shrink">
          <q-btn flat round dense icon="close" :disable="isSubmitting" v-close-popup color="grey-7">
            <q-tooltip>Tutup</q-tooltip>
          </q-btn>
          <q-toolbar-title class="text-weight-black text-green-10 text-center uppercase tracking-widest">
            {{ row ? 'Edit Incoming Material' : 'Entry Incoming Material' }}
            <div class="text-caption text-grey-6 text-weight-medium text-capitalize">
              Validasi surat jalan, penerimaan aktual, dan kondisi QC material.
            </div>
          </q-toolbar-title>
          <q-btn
            unelevated
            rounded
            color="green-10"
            icon="save"
            label="Simpan"
            no-caps
            class="text-weight-bold q-px-xl shadow-3"
            type="submit"
            :loading="isSubmitting"
          />
        </q-toolbar>

        <q-card-section class="form-body col scroll q-pa-md q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-xl-10">
          <div class="status-strip row items-center q-col-gutter-sm">
            <div class="col-12 col-sm">
              <div class="text-caption text-grey-7 text-weight-bold">STATUS VALIDASI</div>
              <div class="row items-center q-gutter-sm">
                <q-badge :color="statusMeta.color" class="status-badge">
                  <q-icon :name="statusMeta.icon" size="14px" class="q-mr-xs" />
                  {{ statusMeta.label }}
                </q-badge>
                <span class="text-caption text-grey-7">{{ statusMeta.note }}</span>
              </div>
            </div>
            <div class="col-6 col-sm-auto metric-cell">
              <div class="text-caption text-grey-7">Selisih</div>
              <div class="text-subtitle2 text-weight-bolder" :class="selisihQty === 0 ? 'text-positive' : 'text-orange-10'">
                {{ formatNumber(selisihQty) }}
              </div>
            </div>
            <div class="col-6 col-sm-auto metric-cell">
              <div class="text-caption text-grey-7">Timestamp</div>
              <div class="text-subtitle2 text-weight-bolder text-green-10">{{ timestampLabel }}</div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <q-card flat bordered class="form-section-card rounded-20 shadow-1 bg-white">
            <q-card-section class="section-head bg-green-1 text-green-10">
              <q-icon name="description" size="xs" class="q-mr-xs" />
              IDENTITAS DOKUMEN & MATERIAL
            </q-card-section>
            <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model.trim="form.nomor_surat_jalan"
                outlined
                dense
                label="Nomor Surat Jalan *"
                :rules="[requiredRule]"
                lazy-rules
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model.trim="form.supplier"
                outlined
                dense
                label="Supplier *"
                :rules="[requiredRule]"
                lazy-rules
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.tanggal_masuk"
                outlined
                dense
                readonly
                label="Tanggal Masuk *"
                :rules="[requiredRule]"
                lazy-rules
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="form.tanggal_masuk" mask="YYYY-MM-DD" today-btn>
                        <div class="row items-center justify-end q-pa-sm">
                          <q-btn v-close-popup label="Pilih" color="green-10" flat no-caps />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-5">
              <q-input
                v-model.trim="form.nama_barang"
                outlined
                dense
                label="Nama Barang *"
                :rules="[requiredRule]"
                lazy-rules
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.kategori_material"
                outlined
                dense
                emit-value
                map-options
                label="Kategori Material *"
                :options="kategoriOptions"
                :rules="[requiredRule]"
                lazy-rules
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="form.satuan"
                outlined
                dense
                emit-value
                map-options
                label="Satuan *"
                :options="satuanOptions"
                :rules="[requiredRule]"
                lazy-rules
              />
            </div>

            <div class="col-12 col-sm-6 col-md-3">
              <q-input
                v-model.number="form.qty_surat_jalan"
                outlined
                dense
                min="0"
                step="0.01"
                type="number"
                label="Qty Surat Jalan *"
                :rules="[requiredNumberRule, positiveNumberRule]"
                lazy-rules
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input
                v-model.number="form.qty_actual"
                outlined
                dense
                min="0"
                step="0.01"
                type="number"
                label="Qty Actual *"
                :rules="[requiredNumberRule, nonNegativeRule]"
                lazy-rules
                @update:model-value="normalizeActualQty"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input
                outlined
                dense
                readonly
                label="Selisih Qty"
                :model-value="formatNumber(selisihQty)"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-input
                outlined
                dense
                readonly
                label="Status Validation"
                :model-value="validationStatus"
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                v-model.trim="form.checker_qc"
                outlined
                dense
                label="Checker QC *"
                :rules="[requiredRule]"
                lazy-rules
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.kondisi_barang"
                outlined
                dense
                emit-value
                map-options
                label="Kondisi Barang *"
                :options="kondisiOptions"
                :rules="[requiredRule]"
                lazy-rules
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input outlined dense readonly label="Auto Timestamp" :model-value="timestampLabel" />
            </div>

            <div class="col-12">
              <q-input
                v-model.trim="form.catatan"
                outlined
                dense
                type="textarea"
                rows="3"
                :label="form.kondisi_barang === 'RUSAK' ? 'Catatan *' : 'Catatan'"
                placeholder="Catatan checker, temuan selisih, atau informasi penerimaan material"
                :rules="[catatanRule]"
                lazy-rules
              />
            </div>
          </div>
            </q-card-section>
          </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="sticky-actions">
          <q-btn
            flat
            color="grey-7"
            icon="restart_alt"
            label="Reset"
            no-caps
            :disable="isSubmitting"
            @click="resetForm"
          />
          <q-space />
          <q-btn flat color="grey-7" label="Batal" no-caps :disable="isSubmitting" v-close-popup />
          <q-btn
            unelevated
            color="green-10"
            icon="save"
            label="Simpan"
            no-caps
            class="text-weight-bold q-px-md"
            type="submit"
            :loading="isSubmitting"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  row: {
    type: Object,
    default: null,
  },
  submitting: {
    type: Boolean,
    default: false,
  },
  currentUserName: {
    type: String,
    default: '',
  },
  kategoriMaterialOptions: {
    type: Array,
    default: () => [
      { label: 'Raw Material', value: 'RAW_MATERIAL' },
      { label: 'Packaging', value: 'PACKAGING' },
      { label: 'Consumable', value: 'CONSUMABLE' },
      { label: 'Sparepart', value: 'SPAREPART' },
      { label: 'Work In Process', value: 'WIP' },
    ],
  },
  satuanMaterialOptions: {
    type: Array,
    default: () => [
      { label: 'PCS', value: 'PCS' },
      { label: 'KG', value: 'KG' },
      { label: 'METER', value: 'METER' },
      { label: 'LITER', value: 'LITER' },
      { label: 'BOX', value: 'BOX' },
      { label: 'ROLL', value: 'ROLL' },
    ],
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const formRef = ref(null)
const localSubmitting = ref(false)
const timestamp = ref(new Date())

const kondisiOptions = [
  { label: 'Baik', value: 'BAIK' },
  { label: 'Kurang / Perlu Review', value: 'KURANG' },
  { label: 'Barang Rusak', value: 'RUSAK' },
]

const kategoriOptions = computed(() => props.kategoriMaterialOptions)
const satuanOptions = computed(() => props.satuanMaterialOptions)
const isSubmitting = computed(() => props.submitting || localSubmitting.value)

const today = () => new Date().toISOString().slice(0, 10)

const defaultForm = () => ({
  nomor_surat_jalan: '',
  supplier: '',
  nama_barang: '',
  kategori_material: 'RAW_MATERIAL',
  qty_surat_jalan: null,
  qty_actual: null,
  satuan: 'PCS',
  checker_qc: props.currentUserName,
  kondisi_barang: 'BAIK',
  catatan: '',
  tanggal_masuk: today(),
})

const form = ref(defaultForm())

const requiredRule = (value) => !!String(value ?? '').trim() || 'Field wajib diisi'
const requiredNumberRule = (value) => value !== null && value !== '' && Number.isFinite(Number(value)) || 'Field wajib diisi'
const positiveNumberRule = (value) => Number(value || 0) > 0 || 'Qty surat jalan wajib lebih dari 0'
const nonNegativeRule = (value) => Number(value || 0) >= 0 || 'Qty actual tidak boleh minus'
const catatanRule = (value) =>
  form.value.kondisi_barang !== 'RUSAK' || !!String(value ?? '').trim() || 'Catatan wajib untuk barang rusak'

const qtySuratJalan = computed(() => Number(form.value.qty_surat_jalan || 0))
const qtyActual = computed(() => Number(form.value.qty_actual || 0))
const selisihQty = computed(() => qtyActual.value - qtySuratJalan.value)

const validationStatus = computed(() => {
  if (form.value.kondisi_barang === 'RUSAK') return 'INCOMING_REJECT'
  if (qtyActual.value < qtySuratJalan.value) return 'PARTIAL'
  if (qtyActual.value === qtySuratJalan.value) return 'VALIDASI_SELESAI'
  return 'PARTIAL'
})

const statusMeta = computed(() => {
  const meta = {
    VALIDASI_SELESAI: {
      label: 'Validasi Selesai',
      color: 'green-10',
      icon: 'verified',
      note: 'Qty surat jalan sesuai dengan qty actual.',
    },
    PARTIAL: {
      label: 'Partial',
      color: 'orange-9',
      icon: 'rule',
      note: 'Terdapat selisih qty dan perlu tindak lanjut produksi.',
    },
    INCOMING_REJECT: {
      label: 'Incoming Reject',
      color: 'negative',
      icon: 'report_problem',
      note: 'Barang rusak, incoming harus direview QC.',
    },
  }

  return meta[validationStatus.value]
})

const timestampLabel = computed(() =>
  timestamp.value.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
)

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const normalizeActualQty = () => {
  if (Number(form.value.qty_actual || 0) < 0) {
    form.value.qty_actual = 0
  }
}

const hydrateForm = () => {
  const row = props.row
  timestamp.value = new Date()
  form.value = row
    ? {
        ...defaultForm(),
        ...row,
        nomor_surat_jalan: row.nomor_surat_jalan || row.noSuratJalan || '',
        supplier: row.supplier || row.asal || '',
        nama_barang: row.nama_barang || row.nama_material || row.tipe_material || '',
        kategori_material: row.kategori_material || row.tipe_material || 'RAW_MATERIAL',
        qty_surat_jalan: Number(row.qty_surat_jalan ?? row.qtySJ ?? 0),
        qty_actual: Number(row.qty_actual ?? row.qtyActual ?? row.quantity ?? 0),
        satuan: row.satuan || 'PCS',
        checker_qc: row.checker_qc || row.qc_checker || row.checker_gudang || props.currentUserName,
        kondisi_barang: row.kondisi_barang || (row.status_incoming === 'INCOMING_REJECT' ? 'RUSAK' : 'BAIK'),
        catatan: row.catatan || row.catatan_incoming || row.defect_note || '',
        tanggal_masuk: row.tanggal_masuk || today(),
      }
    : defaultForm()

  nextTick(() => formRef.value?.resetValidation())
}

const resetForm = () => {
  hydrateForm()
}

const submitForm = async () => {
  normalizeActualQty()
  const valid = await formRef.value?.validate()
  if (!valid) return

  localSubmitting.value = true
  const payload = {
    ...form.value,
    qty_surat_jalan: qtySuratJalan.value,
    qty_actual: qtyActual.value,
    selisih_qty: selisihQty.value,
    status_validation: validationStatus.value,
    status_incoming: validationStatus.value,
    incoming_timestamp: timestamp.value.toISOString(),

    // Backward-compatible aliases for the existing incoming material page.
    asal: form.value.supplier,
    nama_material: form.value.nama_barang,
    tipe_material: form.value.kategori_material,
    quantity: qtyActual.value,
    qc_checker: form.value.checker_qc,
    checker_gudang: form.value.checker_qc,
    qc_status: form.value.kondisi_barang === 'RUSAK' ? 'NG' : 'OK',
    status_qc: form.value.kondisi_barang === 'RUSAK' ? 'NG' : 'OK',
    qty_ok: form.value.kondisi_barang === 'RUSAK' ? 0 : qtyActual.value,
    qty_ng: form.value.kondisi_barang === 'RUSAK' ? qtyActual.value : 0,
    catatan_incoming: form.value.catatan,
    defect_note: form.value.kondisi_barang === 'RUSAK' ? form.value.catatan : '',
  }

  emit('save', { form: payload })
  window.setTimeout(() => {
    localSubmitting.value = false
  }, 350)
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) hydrateForm()
  },
)

watch(
  () => props.currentUserName,
  () => {
    if (!props.row) hydrateForm()
  },
)
</script>

<style scoped>
.incoming-dialog {
  overflow: hidden;
}

.dialog-header {
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(27, 94, 32, 0.12);
  padding: 14px 18px;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.form-body {
  background: #f1f5f2;
}

.status-strip {
  background: #ffffff;
  border: 1px solid #dfe8df;
  border-radius: 20px;
  box-shadow: 0 5px 16px rgba(27, 94, 32, 0.08);
  margin-bottom: 16px;
  padding: 14px 16px;
}

.status-badge {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  padding: 6px 10px;
}

.metric-cell {
  border-left: 1px solid #e7ece7;
  min-width: 120px;
  padding-left: 14px;
}

.sticky-actions {
  background: #ffffff;
  bottom: 0;
  box-shadow: 0 -6px 18px rgba(26, 54, 40, 0.12);
  padding: 12px 18px;
  z-index: 2;
}

.form-section-card {
  border-color: #dfe8df;
  overflow: hidden;
}

.section-head {
  align-items: center;
  display: flex;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.8px;
  padding: 8px 12px;
}

.rounded-20 {
  border-radius: 20px;
}

.tracking-widest {
  letter-spacing: 0.9px;
}

:deep(.q-field--dense .q-field__control),
:deep(.q-field--dense .q-field__marginal) {
  min-height: 38px;
}

@media (max-width: 700px) {
  .metric-cell {
    border-left: 0;
    padding-left: 0;
  }

  .sticky-actions {
    gap: 8px;
  }
}
</style>
