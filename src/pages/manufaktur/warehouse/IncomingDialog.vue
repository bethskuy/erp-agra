<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="incoming-dialog column bg-dark-premium">
      <q-form ref="formRef" class="dialog-form column" @submit.prevent="submitForm">
        <q-toolbar class="dialog-header shrink">
          <q-btn flat round dense icon="close" :disable="isSubmitting" v-close-popup color="grey-4">
            <q-tooltip>Tutup</q-tooltip>
          </q-btn>
          <q-toolbar-title class="text-weight-black incoming-title text-center uppercase tracking-widest">
            {{ row ? 'Edit Incoming Material' : 'Entry Incoming Material' }}
            <div class="text-caption incoming-subtitle text-weight-medium text-capitalize">
              Validasi surat jalan, penerimaan aktual, dan kondisi QC material.
            </div>
          </q-toolbar-title>
          <q-btn
            unelevated
            rounded
            icon="save"
            label="Simpan"
            no-caps
            class="text-weight-bold q-px-xl shadow-3 btn-neon-green"
            type="submit"
            :loading="isSubmitting"
          />
        </q-toolbar>

        <q-card-section class="form-body col scroll q-pa-md q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-xl-10">
          <div class="status-strip row items-center q-col-gutter-sm">
            <div class="col-12 col-md">
              <div class="text-caption text-muted-premium text-weight-bold">STATUS VALIDASI SAAT INI</div>
              <div class="row items-center q-gutter-sm">
                <q-badge :color="statusMeta.color" class="status-badge">
                  <q-icon :name="statusMeta.icon" size="14px" class="q-mr-xs" />
                  {{ statusMeta.label }}
                </q-badge>
                <span class="text-caption text-muted-premium">{{ statusMeta.note }}</span>
              </div>
            </div>
            <div class="col-6 col-sm-auto metric-cell">
              <div class="text-caption text-muted-premium">Selisih Qty</div>
              <div
                class="text-subtitle2 text-weight-bolder"
                :class="totalSelisih === 0 ? 'text-positive' : 'text-orange-9'"
              >
                {{ formatNumber(totalSelisih) }}
              </div>
            </div>
            <div class="col-6 col-sm-auto metric-cell">
              <div class="text-caption text-muted-premium">Timestamp</div>
              <div class="text-subtitle2 text-weight-bolder text-neon-cyan">{{ timestampLabel }}</div>
            </div>
          </div>

          <div class="form-section-stack">
            <q-card flat bordered class="form-section-card glass-card rounded-20 shadow-1">
              <q-card-section class="section-head bg-glass-header text-neon-green">
                <q-icon name="description" size="xs" class="q-mr-xs" />
                Informasi Dokumen
              </q-card-section>
              <q-separator dark />
              <q-card-section class="q-pa-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-5">
                    <q-input
                      v-model.trim="form.nomor_surat_jalan"
                      outlined
                      dense
                      dark
                      label="Nomor Surat Jalan *"
                      class="important-field"
                      :rules="[requiredRule]"
                      lazy-rules
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model.trim="form.supplier"
                      outlined
                      dense
                      dark
                      label="Supplier *"
                      :rules="[requiredRule]"
                      lazy-rules
                    />
                  </div>
                  <div class="col-12 col-md-3">
                    <q-input
                      v-model="form.tanggal_masuk"
                      outlined
                      dense
                      readonly
                      dark
                      label="Tanggal Masuk *"
                      :rules="[requiredRule]"
                      lazy-rules
                    >
                      <template #append>
                        <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date v-model="form.tanggal_masuk" mask="YYYY-MM-DD" today-btn>
                              <div class="row items-center justify-end q-pa-sm">
                                <q-btn v-close-popup label="Pilih" color="cyan" flat no-caps />
                              </div>
                            </q-date>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12">
                    <q-file
                      v-model="form.surat_jalan_file"
                      outlined
                      dense
                      clearable
                      counter
                      dark
                      accept=".pdf,application/pdf"
                      :max-file-size="MAX_PDF_SIZE"
                      label="Upload Surat Jalan (PDF)"
                      hint="Format PDF, maksimal 5MB"
                      color="cyan"
                      @rejected="onSuratJalanRejected"
                      @update:model-value="onSuratJalanSelected"
                    >
                      <template #prepend>
                        <q-icon name="picture_as_pdf" color="cyan" />
                      </template>
                    </q-file>
                  </div>

                  <div v-if="suratJalanMeta" class="col-12">
                    <q-card flat bordered class="file-preview-card">
                      <q-card-section class="row items-center q-pa-sm q-col-gutter-sm">
                        <div class="col-auto">
                          <q-avatar size="36px" color="green-1" text-color="green-10" icon="description" />
                        </div>
                        <div class="col min-width-0">
                          <div class="text-weight-bold text-green-10 ellipsis">
                            {{ suratJalanMeta.nama_file }}
                          </div>
                          <div class="text-caption text-grey-7">
                            {{ formatFileSize(suratJalanMeta.ukuran_file) }} ·
                            {{ formatUploadTimestamp(suratJalanMeta.upload_timestamp) }}
                          </div>
                        </div>
                        <div class="col-auto">
                          <q-btn flat round dense color="negative" icon="delete" @click="removeSuratJalanFile">
                            <q-tooltip>Hapus file</q-tooltip>
                          </q-btn>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="form-section-card glass-card rounded-20 shadow-1">
              <q-card-section class="section-head bg-glass-header text-neon-green">
                <div class="row items-center justify-between full-width no-wrap">
                  <div class="row items-center no-wrap">
                    <q-icon name="table_rows" size="xs" class="q-mr-xs" />
                    Detail Material Incoming
                  </div>
                  <q-btn
                    unelevated
                    color="cyan-9"
                    icon="add"
                    label="Tambah Baris Item"
                    no-caps
                    dense
                    class="q-px-md"
                    @click="addItem"
                  />
                </div>
              </q-card-section>
              <q-separator dark />
              <q-card-section class="q-pa-none">
                <div class="incoming-items-table">
                  <table>
                    <thead>
                      <tr>
                        <th style="min-width: 220px">Nama Barang</th>
                        <th style="min-width: 150px">Kategori</th>
                        <th style="min-width: 110px">Satuan</th>
                        <th style="min-width: 120px">Qty SJ</th>
                        <th style="min-width: 120px">Qty Actual</th>
                        <th style="min-width: 90px">Selisih</th>
                        <th style="min-width: 150px">Kondisi</th>
                        <th style="min-width: 120px">Status QC</th>
                        <th style="min-width: 220px">Catatan</th>
                        <th class="text-center" style="width: 56px"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in form.items" :key="item.uid">
                        <td>
                          <q-input
                            v-model.trim="item.nama_barang"
                            dense
                            outlined
                            dark
                            placeholder="Nama barang"
                            :rules="[requiredRule]"
                            lazy-rules
                          />
                        </td>
                        <td>
                          <q-select
                            v-model="item.kategori_material"
                            dense
                            outlined
                            dark
                            emit-value
                            map-options
                            :options="kategoriOptions"
                            :rules="[requiredRule]"
                            lazy-rules
                          />
                        </td>
                        <td>
                          <q-select
                            v-model="item.satuan"
                            dense
                            outlined
                            dark
                            emit-value
                            map-options
                            :options="satuanOptions"
                            :rules="[requiredRule]"
                            lazy-rules
                          />
                        </td>
                        <td>
                          <q-input
                            v-model.number="item.qty_surat_jalan"
                            dense
                            outlined
                            dark
                            type="number"
                            min="0"
                            step="0.01"
                            :rules="[requiredNumberRule, positiveNumberRule]"
                            lazy-rules
                          />
                        </td>
                        <td>
                          <q-input
                            v-model.number="item.qty_actual"
                            dense
                            outlined
                            dark
                            type="number"
                            min="0"
                            step="0.01"
                            :rules="[requiredNumberRule, nonNegativeRule]"
                            lazy-rules
                            @update:model-value="normalizeItemQty(item)"
                          />
                        </td>
                        <td class="text-right">
                          <q-badge
                            outline
                            :color="itemSelisih(item) === 0 ? 'positive' : 'orange-9'"
                            class="qty-badge"
                          >
                            {{ formatNumber(itemSelisih(item)) }}
                          </q-badge>
                        </td>
                        <td>
                          <q-select
                            v-model="item.kondisi_barang"
                            dense
                            outlined
                            dark
                            emit-value
                            map-options
                            :options="kondisiOptions"
                            :rules="[requiredRule]"
                            lazy-rules
                          />
                        </td>
                        <td>
                          <q-badge :color="itemStatusMeta(item).color" class="status-badge">
                            {{ itemStatusMeta(item).label }}
                          </q-badge>
                        </td>
                        <td>
                          <q-input
                            v-model.trim="item.catatan"
                            dense
                            outlined
                            dark
                            placeholder="Catatan item"
                            :rules="[itemCatatanRule(item)]"
                            lazy-rules
                          />
                        </td>
                        <td class="text-center">
                          <q-btn
                            flat
                            round
                            dense
                            color="negative"
                            icon="delete"
                            :disable="form.items.length === 1"
                            @click="removeItem(index)"
                          >
                            <q-tooltip>Hapus item</q-tooltip>
                          </q-btn>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="row items-center justify-end q-pa-md bg-glass-summary">
                  <div class="row q-gutter-md items-center">
                    <div class="summary-pill">
                      <span>Total SJ</span>
                      <strong>{{ formatNumber(totalQtySj) }}</strong>
                    </div>
                    <div class="summary-pill">
                      <span>Total Actual</span>
                      <strong>{{ formatNumber(totalQtyActual) }}</strong>
                    </div>
                    <div class="summary-pill" :class="totalSelisih === 0 ? 'is-ok' : 'is-warning'">
                      <span>Selisih</span>
                      <strong>{{ formatNumber(totalSelisih) }}</strong>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="form-section-card glass-card rounded-20 shadow-1">
              <q-card-section class="section-head bg-glass-header text-neon-green">
                <q-icon name="edit_note" size="xs" class="q-mr-xs" />
                Summary Validasi & Audit
              </q-card-section>
              <q-separator dark />
              <q-card-section class="q-pa-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-4">
                    <q-input
                      v-model.trim="form.checker_qc"
                      outlined
                      dense
                      dark
                      label="Checker QC *"
                      :rules="[requiredRule]"
                      lazy-rules
                    />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input outlined dense readonly dark label="Status Validasi" class="result-field" :model-value="validationStatus" />
                  </div>
                  <div class="col-12 col-md-4">
                    <q-input outlined dense readonly dark label="Timestamp" :model-value="timestampLabel" />
                  </div>
                  <div class="col-12">
                    <q-input
                      v-model.trim="form.catatan"
                      outlined
                      dense
                      dark
                      type="textarea"
                      rows="3"
                      label="Catatan Dokumen"
                      placeholder="Catatan umum incoming, instruksi tindak lanjut, atau informasi audit"
                      lazy-rules
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="sticky-actions">
          <q-btn
            flat
            color="grey-4"
            icon="restart_alt"
            label="Reset"
            no-caps
            :disable="isSubmitting"
            @click="resetForm"
          />
          <q-space />
          <q-btn flat color="grey-4" label="Batal" no-caps :disable="isSubmitting" v-close-popup />
          <q-btn
            unelevated
            icon="save"
            label="Simpan"
            no-caps
            class="text-weight-bold q-px-md btn-neon-green"
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
import { useQuasar } from 'quasar'

const $q = useQuasar()
const MAX_PDF_SIZE = 5 * 1024 * 1024

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
      { label: 'KG', value: 'KG' },
      { label: 'M3', value: 'M3' },
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
const defaultSatuan = () => satuanOptions.value[0]?.value || ''

const today = () => new Date().toISOString().slice(0, 10)

const createItem = (overrides = {}) => ({
  uid: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  nama_barang: '',
  kategori_material: 'RAW_MATERIAL',
  satuan: defaultSatuan(),
  qty_surat_jalan: null,
  qty_actual: null,
  kondisi_barang: 'BAIK',
  status_qc: 'OK',
  catatan: '',
  ...overrides,
})

const defaultForm = () => ({
  nomor_surat_jalan: '',
  supplier: '',
  checker_qc: props.currentUserName,
  catatan: '',
  tanggal_masuk: today(),
  surat_jalan_file: null,
  surat_jalan_pdf: null,
  items: [createItem()],
})

const form = ref(defaultForm())

const requiredRule = (value) => !!String(value ?? '').trim() || 'Field wajib diisi'
const requiredNumberRule = (value) => value !== null && value !== '' && Number.isFinite(Number(value)) || 'Field wajib diisi'
const positiveNumberRule = (value) => Number(value || 0) > 0 || 'Qty surat jalan wajib lebih dari 0'
const nonNegativeRule = (value) => Number(value || 0) >= 0 || 'Qty actual tidak boleh minus'

const itemCatatanRule = (item) => (value) =>
  item.kondisi_barang !== 'RUSAK' || !!String(value ?? '').trim() || 'Catatan wajib untuk barang rusak'

const itemQtySj = (item) => Number(item?.qty_surat_jalan || 0)
const itemQtyActual = (item) => Number(item?.qty_actual || 0)
const itemSelisih = (item) => itemQtyActual(item) - itemQtySj(item)

const totalQtySj = computed(() => form.value.items.reduce((sum, item) => sum + itemQtySj(item), 0))
const totalQtyActual = computed(() => form.value.items.reduce((sum, item) => sum + itemQtyActual(item), 0))
const totalSelisih = computed(() => totalQtyActual.value - totalQtySj.value)
const rejectItemCount = computed(() => form.value.items.filter((item) => item.kondisi_barang === 'RUSAK').length)
const partialItemCount = computed(() =>
  form.value.items.filter((item) => item.kondisi_barang !== 'RUSAK' && itemSelisih(item) !== 0).length,
)

const validationStatus = computed(() => {
  if (rejectItemCount.value > 0) return 'INCOMING_REJECT'
  if (partialItemCount.value > 0 || totalSelisih.value !== 0) return 'PARTIAL'
  return 'VALIDASI_SELESAI'
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

const suratJalanMeta = computed(() => form.value.surat_jalan_pdf)
const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')
const formatFileSize = (size) => {
  const bytes = Number(size || 0)
  if (!bytes) return '-'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
const formatUploadTimestamp = (value) => {
  if (!value) return 'Belum tersimpan'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Belum tersimpan'
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const buildSuratJalanMeta = (file) => ({
  nama_file: file.name,
  ukuran_file: file.size,
  tipe_file: file.type || 'application/pdf',
  local_reference: file.name,
  url: '',
  upload_timestamp: new Date().toISOString(),
})

const notifyInvalidFile = (message) => {
  $q.notify({ type: 'negative', message })
}

const onSuratJalanRejected = (entries = []) => {
  const failed = entries[0]
  if (failed?.failedPropValidation === 'max-file-size') {
    notifyInvalidFile('Ukuran Surat Jalan maksimal 5MB')
    return
  }
  notifyInvalidFile('File Surat Jalan harus berformat PDF')
}

const onSuratJalanSelected = (file) => {
  if (!file) {
    form.value.surat_jalan_pdf = null
    return
  }

  const isPdf = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf')
  if (!isPdf) {
    form.value.surat_jalan_file = null
    form.value.surat_jalan_pdf = null
    notifyInvalidFile('File Surat Jalan harus berformat PDF')
    return
  }

  if (file.size > MAX_PDF_SIZE) {
    form.value.surat_jalan_file = null
    form.value.surat_jalan_pdf = null
    notifyInvalidFile('Ukuran Surat Jalan maksimal 5MB')
    return
  }

  form.value.surat_jalan_pdf = buildSuratJalanMeta(file)
}

const removeSuratJalanFile = () => {
  form.value.surat_jalan_file = null
  form.value.surat_jalan_pdf = null
}

const itemStatusMeta = (item) => {
  if (item.kondisi_barang === 'RUSAK') return { label: 'NG', color: 'negative', status: 'NG' }
  if (itemSelisih(item) !== 0) return { label: 'REVIEW', color: 'orange-9', status: 'REVIEW' }
  return { label: 'OK', color: 'green-10', status: 'OK' }
}

const normalizeItemQty = (item) => {
  if (Number(item.qty_actual || 0) < 0) item.qty_actual = 0
}

const normalizeItem = (item = {}) =>
  createItem({
    nama_barang: item.nama_barang || item.nama_material || item.material || '',
    kategori_material: item.kategori_material || item.tipe_material || 'RAW_MATERIAL',
    satuan: item.satuan || defaultSatuan(),
    qty_surat_jalan: Number(item.qty_surat_jalan ?? item.qtySJ ?? item.qty ?? 0),
    qty_actual: Number(item.qty_actual ?? item.qtyActual ?? item.quantity ?? 0),
    kondisi_barang: item.kondisi_barang || (item.status_qc === 'NG' ? 'RUSAK' : 'BAIK'),
    status_qc: item.status_qc || item.qc_status || 'OK',
    catatan: item.catatan || item.catatan_incoming || item.defect_note || '',
  })

const getRowItems = (row) => {
  if (Array.isArray(row?.items) && row.items.length) return row.items.map(normalizeItem)
  if (!row) return [createItem()]
  return [
    normalizeItem({
      nama_barang: row.nama_barang || row.nama_material || row.tipe_material || '',
      kategori_material: row.kategori_material || row.tipe_material || 'RAW_MATERIAL',
      satuan: row.satuan || defaultSatuan(),
      qty_surat_jalan: Number(row.qty_surat_jalan ?? row.qtySJ ?? row.qty ?? 0),
      qty_actual: Number(row.qty_actual ?? row.qtyActual ?? row.quantity ?? 0),
      kondisi_barang: row.kondisi_barang || (row.status_incoming === 'INCOMING_REJECT' ? 'RUSAK' : 'BAIK'),
      catatan: row.catatan || row.catatan_incoming || row.defect_note || '',
    }),
  ]
}

const addItem = () => {
  form.value.items.push(createItem({ kategori_material: form.value.items.at(-1)?.kategori_material || 'RAW_MATERIAL' }))
}

const removeItem = (index) => {
  if (form.value.items.length > 1) form.value.items.splice(index, 1)
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
        checker_qc: row.checker_qc || row.qc_checker || row.checker_gudang || props.currentUserName,
        catatan: row.catatan || row.catatan_incoming || row.defect_note || '',
        tanggal_masuk: row.tanggal_masuk || today(),
        surat_jalan_file: null,
        surat_jalan_pdf: row.surat_jalan_pdf || row.surat_jalan_file_metadata || null,
        items: getRowItems(row),
      }
    : defaultForm()

  nextTick(() => formRef.value?.resetValidation())
}

const resetForm = () => {
  hydrateForm()
}

const submitForm = async () => {
  form.value.items.forEach(normalizeItemQty)
  const valid = await formRef.value?.validate()
  if (!valid) return

  localSubmitting.value = true
  const formPayload = { ...form.value }
  delete formPayload.surat_jalan_file
  const items = form.value.items.map((item, index) => ({
    ...item,
    no: index + 1,
    qty_surat_jalan: itemQtySj(item),
    qty_actual: itemQtyActual(item),
    selisih_qty: itemSelisih(item),
    status_qc: itemStatusMeta(item).status,
    qc_status: itemStatusMeta(item).status,
  }))
  const firstItem = items[0] || createItem()
  const payload = {
    ...formPayload,
    items,
    total_items: items.length,
    qty_surat_jalan: totalQtySj.value,
    qty_actual: totalQtyActual.value,
    selisih_qty: totalSelisih.value,
    status_validation: validationStatus.value,
    status_incoming: validationStatus.value,
    incoming_timestamp: timestamp.value.toISOString(),
    surat_jalan_pdf: form.value.surat_jalan_pdf,
    surat_jalan_file_metadata: form.value.surat_jalan_pdf,
    nama_barang: firstItem.nama_barang,
    kategori_material: firstItem.kategori_material,
    satuan: firstItem.satuan,
    kondisi_barang: rejectItemCount.value > 0 ? 'RUSAK' : 'BAIK',

    // Backward-compatible aliases for the existing incoming material page.
    asal: form.value.supplier,
    nama_material: firstItem.nama_barang,
    tipe_material: firstItem.kategori_material,
    quantity: totalQtyActual.value,
    qc_checker: form.value.checker_qc,
    checker_gudang: form.value.checker_qc,
    qc_status: rejectItemCount.value > 0 ? 'NG' : partialItemCount.value > 0 ? 'REVIEW' : 'OK',
    status_qc: rejectItemCount.value > 0 ? 'NG' : partialItemCount.value > 0 ? 'REVIEW' : 'OK',
    qty_ok: items
      .filter((item) => item.status_qc === 'OK')
      .reduce((sum, item) => sum + Number(item.qty_actual || 0), 0),
    qty_ng: items
      .filter((item) => item.status_qc === 'NG')
      .reduce((sum, item) => sum + Number(item.qty_actual || 0), 0),
    catatan_incoming: form.value.catatan,
    defect_note: items
      .filter((item) => item.status_qc === 'NG')
      .map((item) => item.catatan)
      .filter(Boolean)
      .join('; '),
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

.text-neon-green {
  color: #7CFF4F !important;
}

.text-neon-cyan {
  color: #00D1B2 !important;
}

.text-muted-premium {
  color: #8CA3B8 !important;
}

.text-secondary-premium {
  color: #B8C7D9 !important;
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

.bg-glass-header {
  background: rgba(124, 255, 79, 0.06) !important;
  border-bottom: 1px solid rgba(124, 255, 79, 0.15) !important;
}

.bg-glass-summary {
  background: rgba(0, 209, 178, 0.05) !important;
  border-top: 1px solid rgba(0, 209, 178, 0.15) !important;
}

.incoming-dialog {
  overflow: hidden;
}

.dialog-header {
  background: rgba(13, 34, 51, 0.9) !important;
  border-bottom: 1px solid rgba(0, 209, 178, 0.2) !important;
  padding: 14px 18px;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.form-body {
  background: #071826 !important;
}

.status-strip {
  background: rgba(13, 34, 51, 0.7) !important;
  border: 1px solid rgba(124, 255, 79, 0.08) !important;
  border-radius: 20px;
  box-shadow: 0 5px 16px rgba(0, 209, 178, 0.08);
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
  border-left: 1px solid rgba(0, 209, 178, 0.15) !important;
  min-width: 120px;
  padding-left: 14px;
}

.sticky-actions {
  background: rgba(13, 34, 51, 0.95) !important;
  border-top: 1px solid rgba(0, 209, 178, 0.15) !important;
  bottom: 0;
  box-shadow: 0 -6px 18px rgba(0, 0, 0, 0.3) !important;
  padding: 12px 18px;
  z-index: 2;
}

.form-section-card {
  border-color: rgba(124, 255, 79, 0.08) !important;
  overflow: hidden;
}

.form-section-stack {
  display: grid;
  gap: 14px;
}

.incoming-items-table {
  overflow-x: auto;
}

.incoming-items-table table {
  border-collapse: collapse;
  min-width: 1320px;
  width: 100%;
}

.incoming-items-table th {
  background: rgba(13, 34, 51, 0.9) !important;
  color: #EAF2FF !important;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 10px 8px;
  text-align: left;
  text-transform: uppercase;
}

.incoming-items-table td {
  border-bottom: 1px solid rgba(0, 209, 178, 0.12) !important;
  padding: 8px;
  vertical-align: top;
}

.incoming-items-table :deep(.q-field--dense .q-field__bottom) {
  padding-top: 2px;
}

.qty-badge {
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  margin-top: 8px;
  min-width: 58px;
  padding: 5px 8px;
}

.summary-pill {
  align-items: center;
  background: rgba(13, 34, 51, 0.6) !important;
  border: 1px solid rgba(0, 209, 178, 0.15) !important;
  border-radius: 10px;
  display: flex;
  gap: 8px;
  min-height: 34px;
  padding: 6px 10px;
}

.summary-pill span {
  color: #8CA3B8 !important;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.summary-pill strong {
  color: #FFFFFF !important;
  font-size: 14px;
}

.summary-pill.is-warning strong {
  color: #FFA940 !important;
}

.file-preview-card {
  background: rgba(13, 34, 51, 0.5) !important;
  border-color: rgba(0, 209, 178, 0.2) !important;
  border-radius: 12px;
}

.min-width-0 {
  min-width: 0;
}

.section-head {
  align-items: center;
  display: flex;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.4px;
  padding: 10px 14px;
  text-transform: uppercase;
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

:deep(.important-field .q-field__control) {
  background: rgba(0, 209, 178, 0.04) !important;
  border-color: rgba(0, 209, 178, 0.3) !important;
}

:deep(.result-field .q-field__control) {
  background: rgba(13, 34, 51, 0.5) !important;
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
