<template>
  <q-page class="standard-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Master Standard Packing Product
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Relasi Produk ke Material Packing
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Standard kemasan per produk untuk forecast PPIC, packing produksi, dan traceability box.
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="add"
          label="Tambah Standard"
          no-caps
          class="q-px-lg"
          @click="openDialog()"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="card in summaryCards" :key="card.title" class="col-12 col-sm-6 col-lg-3">
        <q-card flat bordered class="summary-card bg-white">
          <q-card-section class="row items-center no-wrap">
            <q-avatar :color="card.color" text-color="white" :icon="card.icon" size="46px" />
            <div class="q-ml-md">
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
          <div class="col-12 col-md-8">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari produk, kode, material packing, atau status..."
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="search" color="green-10" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto">
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
              {{ filteredRows.length }} STANDARD
            </q-chip>
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
        class="standard-table"
      >
        <template #header="props">
          <q-tr :props="props" class="bg-green-10 text-white">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-head">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body="props">
          <q-tr :props="props">
            <q-td key="produk" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.product_name || '-' }}</div>
              <div class="text-caption text-grey-6">{{ props.row.product_code || '-' }}</div>
            </q-td>
            <q-td key="material" :props="props">
              {{ props.row.default_packing_material_name || '-' }}
            </q-td>
            <q-td key="qty_per_box" :props="props" class="text-right text-weight-bold">
              {{ formatNumber(props.row.qty_per_box) }}
            </q-td>
            <q-td key="standard_weight_per_box" :props="props" class="text-right">
              {{ formatNumber(props.row.standard_weight_per_box) }} kg
            </q-td>
            <q-td key="bubble_wrap" :props="props">
              <q-chip dense :color="props.row.bubble_wrap_usage ? 'green-10' : 'grey-5'" text-color="white">
                {{ props.row.bubble_wrap_usage ? 'Ya' : 'Tidak' }}
              </q-chip>
            </q-td>
            <q-td key="pallet" :props="props">
              <div>{{ props.row.pallet_configuration?.enabled ? 'Pallet' : 'Non Pallet' }}</div>
              <div v-if="props.row.pallet_configuration?.enabled" class="text-caption text-grey-6">
                {{ formatNumber(props.row.pallet_configuration.boxes_per_pallet) }} box/pallet
              </div>
            </q-td>
            <q-td key="aksi" :props="props">
              <div class="row no-wrap justify-center q-gutter-xs">
                <q-btn flat round dense color="green-10" icon="edit" @click="openDialog(props.row)">
                  <q-tooltip>Edit Standard</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="inventory_2" size="28px" class="q-mr-sm" />
            Belum ada standard packing product.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialog" persistent :maximized="$q.screen.lt.md" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="standard-dialog">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">{{ dialogTitle }}</div>
            <div class="text-caption">Collection: master_standard_packing_product</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="saveStandard">
          <q-card-section class="q-pa-md q-pa-lg-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-select
                  v-model="form.product_id"
                  :options="productOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  use-input
                  input-debounce="200"
                  label="Produk"
                  :rules="[(val) => !!val || 'Produk wajib dipilih']"
                  @filter="filterProducts"
                  @update:model-value="syncProduct"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.default_packing_material_id"
                  :options="packingMaterialOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  use-input
                  input-debounce="200"
                  label="Default Packing Material"
                  :rules="[(val) => !!val || 'Packing material wajib dipilih']"
                  @filter="filterPackingMaterials"
                  @update:model-value="syncPackingMaterial"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.default_packing_material_name"
                  outlined
                  dense
                  readonly
                  bg-color="grey-2"
                  label="Nama Material"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.qty_per_box"
                  outlined
                  dense
                  type="number"
                  min="1"
                  label="Qty per Box"
                  :rules="[(val) => Number(val || 0) > 0 || 'Qty per box wajib lebih dari 0']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.standard_weight_per_box"
                  outlined
                  dense
                  type="number"
                  min="0"
                  suffix="kg"
                  label="Standard Weight per Box"
                  :rules="[(val) => Number(val || 0) >= 0 || 'Berat wajib valid']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-toggle v-model="form.bubble_wrap_usage" color="green-10" label="Bubble Wrap Usage" />
              </div>
              <div class="col-12">
                <q-card flat bordered class="pallet-card">
                  <q-card-section class="row items-center">
                    <q-toggle v-model="form.pallet_configuration.enabled" color="green-10" label="Pallet Configuration" />
                    <q-space />
                    <q-chip dense color="blue-grey-8" text-color="white">
                      {{ form.pallet_configuration.enabled ? 'Aktif' : 'Nonaktif' }}
                    </q-chip>
                  </q-card-section>
                  <q-separator />
                  <q-card-section v-if="form.pallet_configuration.enabled">
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model.number="form.pallet_configuration.boxes_per_pallet"
                          outlined
                          dense
                          type="number"
                          min="1"
                          label="Box per Pallet"
                          :rules="[(val) => Number(val || 0) > 0 || 'Box per pallet wajib lebih dari 0']"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-input
                          v-model.number="form.pallet_configuration.max_weight_per_pallet"
                          outlined
                          dense
                          type="number"
                          min="0"
                          suffix="kg"
                          label="Max Weight per Pallet"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12">
                <q-input v-model="form.notes" outlined dense type="textarea" autogrow label="Catatan Standard" />
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
              label="Simpan Standard"
              no-caps
              type="submit"
              :loading="submitting"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const STANDARD_COLLECTION = 'master_standard_packing_product'
const PRODUCT_COLLECTION = 'manufactur_master_barang'
const PACKING_MATERIAL_COLLECTION = 'master_packing_material'

const $q = useQuasar()
const rows = ref([])
const productRows = ref([])
const packingMaterialRows = ref([])
const filteredProductOptions = ref([])
const filteredPackingMaterialOptions = ref([])
const loading = ref(true)
const submitting = ref(false)
const search = ref('')
const dialog = ref(false)
const selectedRow = ref(null)
let unsubscribeRows = null
let unsubscribeProducts = null
let unsubscribePackingMaterials = null

const defaultForm = () => ({
  product_id: '',
  product_code: '',
  product_name: '',
  default_packing_material_id: '',
  default_packing_material_name: '',
  qty_per_box: 1,
  bubble_wrap_usage: false,
  standard_weight_per_box: 0,
  pallet_configuration: {
    enabled: false,
    boxes_per_pallet: 20,
    max_weight_per_pallet: 0,
  },
  notes: '',
})

const form = ref(defaultForm())

const columns = [
  { name: 'produk', align: 'left', label: 'Produk', field: 'product_name', sortable: true },
  { name: 'material', align: 'left', label: 'Default Packing Material', field: 'default_packing_material_name', sortable: true },
  { name: 'qty_per_box', align: 'right', label: 'Qty per Box', field: 'qty_per_box', sortable: true },
  { name: 'standard_weight_per_box', align: 'right', label: 'Std Weight / Box', field: 'standard_weight_per_box', sortable: true },
  { name: 'bubble_wrap', align: 'center', label: 'Bubble Wrap', field: 'bubble_wrap_usage', sortable: true },
  { name: 'pallet', align: 'left', label: 'Pallet', field: 'pallet_configuration' },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const dialogTitle = computed(() => (selectedRow.value ? 'Edit Standard Packing Product' : 'Tambah Standard Packing Product'))

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const normalizeText = (value) => String(value || '').trim().toLowerCase()

const productLabel = (product) =>
  `${product.nama_material || product.nama_produk || product.nama || '-'}${product.kode_material || product.kode_produk || product.kode ? ` - ${product.kode_material || product.kode_produk || product.kode}` : ''}`

const packingMaterialLabel = (material) =>
  `${material.nama_material || '-'} - stok ${formatNumber(material.stok)} ${material.satuan || ''}`

const productOptions = computed(() => filteredProductOptions.value)
const packingMaterialOptions = computed(() => filteredPackingMaterialOptions.value)

const resetOptions = () => {
  filteredProductOptions.value = productRows.value.map((product) => ({
    label: productLabel(product),
    value: product.id,
  }))
  filteredPackingMaterialOptions.value = packingMaterialRows.value
    .filter((material) => material.aktif !== false)
    .map((material) => ({
      label: packingMaterialLabel(material),
      value: material.id,
    }))
}

const filterProducts = (val, update) => {
  update(() => {
    const keyword = normalizeText(val)
    filteredProductOptions.value = productRows.value
      .filter((product) => !keyword || normalizeText(productLabel(product)).includes(keyword))
      .map((product) => ({ label: productLabel(product), value: product.id }))
  })
}

const filterPackingMaterials = (val, update) => {
  update(() => {
    const keyword = normalizeText(val)
    filteredPackingMaterialOptions.value = packingMaterialRows.value
      .filter((material) => material.aktif !== false)
      .filter((material) => !keyword || normalizeText(packingMaterialLabel(material)).includes(keyword))
      .map((material) => ({ label: packingMaterialLabel(material), value: material.id }))
  })
}

const summaryCards = computed(() => [
  { title: 'Produk', value: productRows.value.length, icon: 'category', color: 'green-10' },
  { title: 'Standard', value: rows.value.length, icon: 'rule', color: 'blue-grey-7' },
  { title: 'Belum Standard', value: Math.max(0, productRows.value.length - rows.value.length), icon: 'warning', color: 'orange-9' },
  { title: 'Bubble Wrap', value: rows.value.filter((row) => row.bubble_wrap_usage).length, icon: 'layers', color: 'teal-8' },
])

const filteredRows = computed(() => {
  const keyword = normalizeText(search.value)
  return rows.value.filter((row) => {
    if (!keyword) return true
    return [
      row.product_code,
      row.product_name,
      row.default_packing_material_name,
      row.bubble_wrap_usage ? 'bubble wrap' : '',
      row.pallet_configuration?.enabled ? 'pallet' : '',
    ]
      .filter(Boolean)
      .some((value) => normalizeText(value).includes(keyword))
  })
})

const syncProduct = (productId) => {
  const product = productRows.value.find((item) => item.id === productId)
  form.value.product_code = product?.kode_material || product?.kode_produk || product?.kode || ''
  form.value.product_name = product?.nama_material || product?.nama_produk || product?.nama || ''
}

const syncPackingMaterial = (materialId) => {
  const material = packingMaterialRows.value.find((item) => item.id === materialId)
  form.value.default_packing_material_name = material?.nama_material || ''
}

const openDialog = (row = null) => {
  selectedRow.value = row
  form.value = row
    ? {
        ...defaultForm(),
        ...row,
        pallet_configuration: {
          ...defaultForm().pallet_configuration,
          ...(row.pallet_configuration || {}),
        },
      }
    : defaultForm()
  resetOptions()
  dialog.value = true
}

const payloadFromForm = () => ({
  product_id: form.value.product_id,
  product_code: form.value.product_code || '',
  product_name: form.value.product_name || '',
  default_packing_material_id: form.value.default_packing_material_id,
  default_packing_material_name: form.value.default_packing_material_name || '',
  qty_per_box: Number(form.value.qty_per_box || 0),
  bubble_wrap_usage: !!form.value.bubble_wrap_usage,
  standard_weight_per_box: Number(form.value.standard_weight_per_box || 0),
  pallet_configuration: {
    enabled: !!form.value.pallet_configuration.enabled,
    boxes_per_pallet: Number(form.value.pallet_configuration.boxes_per_pallet || 0),
    max_weight_per_pallet: Number(form.value.pallet_configuration.max_weight_per_pallet || 0),
  },
  notes: form.value.notes || '',
  updated_at: serverTimestamp(),
})

const saveStandard = async () => {
  submitting.value = true
  try {
    const payload = payloadFromForm()
    const standardRef = doc(db, STANDARD_COLLECTION, payload.product_id)
    const productRef = doc(db, PRODUCT_COLLECTION, payload.product_id)
    await setDoc(
      standardRef,
      {
        ...payload,
        created_at: selectedRow.value?.created_at || serverTimestamp(),
      },
      { merge: true },
    )
    await setDoc(
      productRef,
      {
        packing_standard: {
          material_id: payload.default_packing_material_id,
          material: payload.default_packing_material_name,
          qty_per_box: payload.qty_per_box,
          bubble_wrap: payload.bubble_wrap_usage,
          pallet_required: payload.pallet_configuration.enabled,
          pallet_configuration: payload.pallet_configuration,
          standard_weight_per_box: payload.standard_weight_per_box,
        },
        updated_at: serverTimestamp(),
      },
      { merge: true },
    )
    dialog.value = false
    $q.notify({ type: 'positive', message: 'Standard packing product berhasil disimpan.' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan standard packing product.' })
  } finally {
    submitting.value = false
  }
}

const loadRows = () => {
  loading.value = true
  unsubscribeRows = onSnapshot(
    query(collection(db, STANDARD_COLLECTION), orderBy('product_name', 'asc')),
    (snapshot) => {
      rows.value = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat standard packing product.' })
    },
  )
  unsubscribeProducts = onSnapshot(
    query(collection(db, PRODUCT_COLLECTION), orderBy('nama', 'asc')),
    (snapshot) => {
      productRows.value = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .filter((item) => String(item.status || item.status_aktif || 'Aktif').toLowerCase() !== 'nonaktif')
      resetOptions()
    },
    (error) => {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal memuat master produk.' })
    },
  )
  unsubscribePackingMaterials = onSnapshot(
    query(collection(db, PACKING_MATERIAL_COLLECTION), orderBy('nama_material', 'asc')),
    (snapshot) => {
      packingMaterialRows.value = snapshot.docs.map((item) => ({
        id: item.id,
        stok: 0,
        aktif: true,
        ...item.data(),
      }))
      resetOptions()
    },
    (error) => {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal memuat master packing material.' })
    },
  )
}

onMounted(loadRows)

onUnmounted(() => {
  if (unsubscribeRows) unsubscribeRows()
  if (unsubscribeProducts) unsubscribeProducts()
  if (unsubscribePackingMaterials) unsubscribePackingMaterials()
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
.filter-card,
.table-card,
.standard-dialog,
.pallet-card {
  border-color: #dfe8df;
  border-radius: 16px;
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

.standard-table :deep(thead tr th) {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.5px;
  padding: 14px 16px;
  text-transform: uppercase;
}

.dialog-header {
  background: #1b5e20;
  color: #ffffff;
  padding: 16px 20px;
}

.standard-dialog {
  max-width: 95vw;
  width: 880px;
}

@media (max-width: 1023px) {
  .standard-dialog {
    border-radius: 0;
  }
}
</style>
