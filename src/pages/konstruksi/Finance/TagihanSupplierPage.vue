<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <!-- =====================================================================================
         HEADER SECTION
         ===================================================================================== -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div class="row items-center no-wrap">
          <q-btn
            flat
            round
            color="indigo-10"
            icon="arrow_back"
            @click="$router.back()"
            class="q-mr-md bg-white shadow-1"
          />
          <div>
            <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight">
              Tagihan Supplier & Labour
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Manajemen Account Payable (Hutang Usaha)</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Catat dan pantau semua tagihan masuk (invoice) dari vendor maupun pekerja lapangan.
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          v-if="canAction('buat')"
          color="indigo-10"
          icon="add_card"
          label="Registrasi Tagihan Baru"
          unelevated
          rounded
          no-caps
          class="q-px-lg q-py-sm shadow-premium btn-hover text-weight-bold"
          @click="openAddDialog"
        />
      </div>
    </div>

    <!-- =====================================================================================
         SUMMARY CARDS / KPI FINANCE
         ===================================================================================== -->
    <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
      <!-- Total Tagihan Terdaftar -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                TOTAL INVOICE
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-indigo-10">
                {{ rows.length }}
              </div>
            </div>
            <div
              class="bg-indigo-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="receipt_long" color="indigo-10" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tagihan Belum Dibayar (Outstanding) -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                BELUM DIBAYAR
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-orange-9">
                {{ countByStatus('Menunggu Pembayaran') }}
              </div>
            </div>
            <div
              class="bg-orange-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="pending_actions" color="orange-9" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tagihan Jatuh Tempo (Overdue) -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                JATUH TEMPO
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-negative">
                {{ countOverdue() }}
              </div>
            </div>
            <div
              class="bg-red-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="warning" color="negative" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Total Hutang Valuasi -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card
          flat
          class="rounded-20 border-subtle bg-indigo-10 text-white transition-all hover-shadow"
        >
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-overline text-indigo-2 leading-none text-weight-bold tracking-widest"
              >
                TOTAL OUTSTANDING
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs">
                Rp {{ formatCompact(totalOutstandingValuation) }}
              </div>
            </div>
            <div
              class="bg-white q-pa-md rounded-borders shadow-2"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="account_balance_wallet" color="indigo-10" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- =====================================================================================
         SEARCH & FILTER AREA
         ===================================================================================== -->
    <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print">
      <q-card-section class="q-py-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-input
              v-model="searchQuery"
              outlined
              dense
              rounded
              placeholder="Cari No. Invoice atau Supplier..."
              bg-color="white"
              class="search-input"
            >
              <template v-slot:prepend><q-icon name="search" color="primary" /></template>
              <template v-slot:append v-if="searchQuery">
                <q-icon name="close" @click="searchQuery = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
          <q-space />
          <q-btn flat round icon="refresh" color="primary" @click="fetchData" />
        </div>
      </q-card-section>
    </q-card>

    <!-- =====================================================================================
         MAIN TABLE DATA
         ===================================================================================== -->
    <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white no-print">
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        binary-state-sort
        class="finance-table"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-indigo-10 text-white">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bold uppercase font-11 tracking-widest"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr
            :props="props"
            class="hover-bg transition-all cursor-pointer"
            @click="openEditDialog(props.row)"
          >
            <q-td key="invoice">
              <div class="row items-center no-wrap">
                <q-avatar
                  size="36px"
                  color="indigo-1"
                  text-color="indigo-10"
                  icon="receipt"
                  class="q-mr-md shadow-sm"
                />
                <div>
                  <div
                    class="text-weight-bold text-blue-grey-10 text-subtitle2 leading-none q-mb-xs"
                  >
                    {{ props.row.nomor_invoice || 'NO-INV' }}
                  </div>
                  <div class="text-caption text-grey-6 uppercase text-weight-medium">
                    VENDOR: {{ props.row.supplier_nama }}
                  </div>
                </div>
              </div>
            </q-td>

            <q-td key="referensi">
              <div class="text-weight-bold text-blue-grey-9 uppercase font-11">
                {{ props.row.proyek_nama || 'NON-PROYEK' }}
              </div>
              <div class="text-caption text-grey-6" v-if="props.row.po_nomor">
                Ref PO: {{ props.row.po_nomor }}
              </div>
            </q-td>

            <q-td key="timeline">
              <div class="text-caption text-grey-8 font-11">
                Tgl:
                <span class="text-weight-bold">{{
                  formatDateIndo(props.row.tanggal_invoice)
                }}</span>
              </div>
              <div
                class="text-caption font-11"
                :class="
                  isOverdue(props.row.jatuh_tempo, props.row.status)
                    ? 'text-negative text-weight-bold'
                    : 'text-grey-8'
                "
              >
                Tempo:
                <span class="text-weight-bold">{{ formatDateIndo(props.row.jatuh_tempo) }}</span>
              </div>
            </q-td>

            <q-td key="nominal" class="text-right">
              <div class="text-weight-bolder text-indigo-10 text-subtitle2">
                Rp {{ (props.row.grand_total || 0).toLocaleString() }}
              </div>
            </q-td>

            <q-td key="status" class="text-center">
              <q-chip
                dense
                :color="getStatusColor(props.row.status).bg"
                :text-color="getStatusColor(props.row.status).text"
                class="text-weight-bold font-10 uppercase q-ma-none shadow-sm q-px-sm"
              >
                {{ props.row.status }}
              </q-chip>
            </q-td>

            <q-td key="aksi" class="text-center" @click.stop>
              <div class="row justify-center q-gutter-xs">
                <q-btn
                  flat
                  round
                  color="blue-8"
                  icon="edit_note"
                  size="sm"
                  @click="openEditDialog(props.row)"
                >
                  <q-tooltip>Lihat / Edit Detail</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="canAction('hapus')"
                  flat
                  round
                  color="negative"
                  icon="delete_outline"
                  size="sm"
                  @click="confirmHapus(props.row)"
                >
                  <q-tooltip>Hapus Tagihan</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="receipt_long" size="64px" class="q-mb-md" />
            <div class="text-h6 full-width text-center">Data tagihan belum tersedia.</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- =====================================================================================
         DIALOG ENTRY / EDIT TAGIHAN (MAXIMIZED)
         ===================================================================================== -->
    <q-dialog
      v-model="showDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <q-toolbar class="bg-white text-indigo-10 q-py-md shadow-2 shrink">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest font-11">
            {{ isEditMode ? 'EDIT DATA TAGIHAN' : 'ENTRY TAGIHAN SUPPLIER (A/P)' }}
          </q-toolbar-title>
          <q-btn
            unelevated
            color="indigo-10"
            label="SIMPAN DOKUMEN"
            rounded
            class="q-px-xl text-weight-bold shadow-3"
            @click="simpanTagihan"
            :loading="submitting"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-xl-10">
              <div class="row q-col-gutter-lg">
                <!-- KOLOM KIRI -->
                <div class="col-12 col-md-7">
                  <!-- REFERENSI DOKUMEN -->
                  <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1">
                    <q-card-section
                      class="bg-indigo-1 q-py-sm text-indigo-10 text-weight-bold flex items-center border-bottom"
                    >
                      <q-icon name="receipt_long" class="q-mr-xs" size="sm" /> REFERENSI INVOICE &
                      PROYEK
                    </q-card-section>
                    <q-card-section class="q-pa-lg q-gutter-y-md">
                      <!-- Pilihan PO (Auto-fill trigger) -->
                      <div>
                        <div class="label-req q-mb-xs text-primary">
                          Tarik Data dari Purchase Order (Opsional)
                        </div>
                        <q-select
                          outlined
                          dense
                          v-model="form.po_ref"
                          :options="optPO"
                          option-label="nomor"
                          placeholder="Pilih PO jika tagihan ini berdasarkan PO..."
                          bg-color="blue-50"
                          clearable
                          @update:model-value="onPoSelect"
                        >
                          <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                              <q-item-section>
                                <q-item-label class="text-weight-bold">{{
                                  scope.opt.nomor
                                }}</q-item-label>
                                <q-item-label caption
                                  >{{ scope.opt.kepada_yth }} |
                                  {{ scope.opt.proyek_nama }}</q-item-label
                                >
                              </q-item-section>
                            </q-item>
                          </template>
                        </q-select>
                      </div>

                      <div class="row q-col-gutter-md">
                        <div class="col-12 col-md-6">
                          <div class="label-req q-mb-xs">Supplier / Penagih *</div>
                          <q-select
                            outlined
                            dense
                            v-model="form.supplier"
                            :options="optSupplier"
                            option-label="nama"
                            placeholder="Pilih Supplier..."
                            bg-color="white"
                            use-input
                            @filter="filterSupplier"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <div class="label-req q-mb-xs">Dialokasikan Ke Proyek *</div>
                          <q-select
                            outlined
                            dense
                            v-model="form.proyek"
                            :options="optProyek"
                            option-label="nama"
                            placeholder="Pilih Proyek..."
                            bg-color="white"
                          />
                        </div>
                      </div>

                      <div class="row q-col-gutter-md">
                        <div class="col-12 col-md-6">
                          <div class="label-req q-mb-xs">Nomor Invoice Supplier *</div>
                          <q-input
                            outlined
                            dense
                            v-model="form.nomor_invoice"
                            bg-color="white"
                            placeholder="INV-2026/..."
                            class="text-weight-bold"
                          />
                        </div>
                        <div class="col-12 col-md-3">
                          <div class="label-req q-mb-xs">Tgl Invoice *</div>
                          <q-input
                            outlined
                            dense
                            type="date"
                            v-model="form.tanggal_invoice"
                            bg-color="white"
                          />
                        </div>
                        <div class="col-12 col-md-3">
                          <div class="label-req q-mb-xs">Tgl Jatuh Tempo *</div>
                          <q-input
                            outlined
                            dense
                            type="date"
                            v-model="form.jatuh_tempo"
                            bg-color="white"
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- LAMPIRAN -->
                  <q-card flat bordered class="rounded-20 bg-white shadow-1">
                    <q-card-section
                      class="bg-indigo-1 q-py-sm text-indigo-10 text-weight-bold flex items-center border-bottom"
                    >
                      <q-icon name="attach_file" class="q-mr-xs" size="sm" /> DOKUMEN LAMPIRAN
                    </q-card-section>
                    <q-card-section class="q-pa-lg">
                      <div class="row items-center justify-between q-mb-md">
                        <div class="text-caption text-grey-7">
                          Upload invoice asli, faktur pajak, surat jalan, atau BAST.
                        </div>
                        <q-btn
                          round
                          unelevated
                          color="indigo-10"
                          icon="add"
                          size="sm"
                          @click="addDocRow"
                        />
                      </div>

                      <div
                        v-for="(item, index) in form.lampiran"
                        :key="index"
                        class="q-mb-md q-pa-sm bg-grey-1 rounded-borders border-dashed"
                      >
                        <div class="row q-col-gutter-sm items-center">
                          <div class="col-5">
                            <q-input
                              outlined
                              dense
                              v-model="item.label"
                              placeholder="ex: Invoice Asli"
                              bg-color="white"
                            />
                          </div>
                          <div class="col-5">
                            <q-file
                              outlined
                              dense
                              v-model="item.fileObj"
                              label="Pilih File"
                              bg-color="white"
                            >
                              <template v-slot:prepend
                                ><q-icon name="attach_file" size="xs"
                              /></template>
                              <template v-slot:append v-if="item.url || item.base64">
                                <q-icon name="check_circle" color="positive" size="xs" />
                              </template>
                            </q-file>
                          </div>
                          <div class="col-2 text-right">
                            <q-btn
                              flat
                              round
                              dense
                              color="negative"
                              icon="delete_sweep"
                              size="sm"
                              @click="removeDocRow(index)"
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        v-if="!form.lampiran.length"
                        class="text-center q-pa-lg text-grey-5 dashed-box"
                      >
                        Belum ada dokumen yang dilampirkan
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- KOLOM KANAN -->
                <div class="col-12 col-md-5">
                  <q-card
                    flat
                    bordered
                    class="rounded-20 bg-white shadow-1 q-mb-lg overflow-hidden"
                  >
                    <q-card-section
                      class="bg-indigo-10 q-py-sm text-white text-weight-bold flex items-center border-bottom"
                    >
                      <q-icon name="calculate" class="q-mr-xs" size="sm" /> RINCIAN NILAI TAGIHAN
                    </q-card-section>

                    <q-card-section class="q-pa-lg q-gutter-y-md">
                      <div>
                        <div class="label-req q-mb-xs">Uraian / Keterangan Tagihan</div>
                        <q-input
                          outlined
                          dense
                          type="textarea"
                          rows="2"
                          v-model="form.keterangan"
                          bg-color="white"
                          placeholder="Misal: Pembayaran material semen proyek A"
                        />
                      </div>

                      <q-separator class="q-my-md border-subtle" />

                      <div>
                        <div class="label-req q-mb-xs">Nilai Dasar Pengenaan Pajak (DPP) *</div>
                        <q-input
                          outlined
                          dense
                          type="number"
                          v-model.number="form.nilai_dpp"
                          bg-color="white"
                          class="text-weight-bold text-h6"
                          prefix="Rp"
                        />
                      </div>

                      <div class="row q-col-gutter-md">
                        <div class="col-6">
                          <div class="label-req q-mb-xs">PPN (%)</div>
                          <q-input
                            outlined
                            dense
                            type="number"
                            v-model.number="form.ppn_persen"
                            bg-color="white"
                            suffix="%"
                          />
                        </div>
                        <div class="col-6">
                          <div class="label-req q-mb-xs">Nominal PPN (+)</div>
                          <q-input
                            outlined
                            dense
                            v-model="calculatedPpn"
                            readonly
                            bg-color="grey-2"
                            prefix="Rp"
                          />
                        </div>
                      </div>

                      <div class="row q-col-gutter-md">
                        <div class="col-6">
                          <div class="label-req q-mb-xs">PPh (%)</div>
                          <q-input
                            outlined
                            dense
                            type="number"
                            v-model.number="form.pph_persen"
                            bg-color="white"
                            suffix="%"
                          />
                        </div>
                        <div class="col-6">
                          <div class="label-req q-mb-xs">Nominal PPh Potong (-)</div>
                          <q-input
                            outlined
                            dense
                            v-model="calculatedPph"
                            readonly
                            bg-color="grey-2"
                            prefix="Rp"
                          />
                        </div>
                      </div>
                    </q-card-section>

                    <div class="bg-blue-grey-10 text-white q-pa-lg text-right">
                      <div class="text-overline opacity-80 uppercase tracking-widest">
                        GRAND TOTAL TAGIHAN
                      </div>
                      <div class="text-h3 text-weight-black">
                        Rp {{ formatCompact(calculatedGrandTotal) }}
                      </div>
                    </div>
                  </q-card>

                  <q-card flat bordered class="rounded-20 bg-white shadow-1">
                    <q-card-section class="q-pa-lg">
                      <div class="label-req q-mb-sm">Status Tagihan</div>
                      <q-select
                        outlined
                        dense
                        v-model="form.status"
                        :options="['Draft', 'Menunggu Pembayaran', 'Dibayar Sebagian', 'Lunas']"
                        bg-color="white"
                        class="text-weight-bold"
                      >
                        <template v-slot:selected>
                          <q-chip
                            dense
                            :color="getStatusColor(form.status).bg"
                            :text-color="getStatusColor(form.status).text"
                            class="text-weight-bold q-ma-none uppercase font-10"
                          >
                            {{ form.status }}
                          </q-chip>
                        </template>
                      </q-select>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </div>
          <div class="q-py-xl"></div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db, storage } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

// State
const rows = ref([])
const loading = ref(true)
const submitting = ref(false)
const searchQuery = ref('')
const showDialog = ref(false)
const isEditMode = ref(false)
// eslint-disable-next-line no-unused-vars
const userData = ref(null)

// Master Data Lists
const optSupplier = ref([])
const allSupplier = ref([])
const optProyek = ref([])
const optPO = ref([])

let unsubTagihan = null

// Form State
const formDefault = {
  id: null,
  nomor_invoice: '',
  tanggal_invoice: new Date().toISOString().substr(0, 10),
  jatuh_tempo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10), // Default 14 hari
  po_ref: null,
  po_nomor: '',
  supplier: null,
  proyek: null,
  nilai_dpp: 0,
  ppn_persen: 0,
  pph_persen: 0,
  keterangan: '',
  status: 'Draft',
  lampiran: [],
}
const form = ref({ ...formDefault })

// Columns
const columns = [
  {
    name: 'invoice',
    align: 'left',
    label: 'NO INVOICE & VENDOR',
    field: 'nomor_invoice',
    sortable: true,
  },
  {
    name: 'referensi',
    align: 'left',
    label: 'PROYEK & REFERENSI',
    field: 'proyek_nama',
    sortable: true,
  },
  { name: 'timeline', align: 'left', label: 'TIMELINE', field: 'tanggal_invoice', sortable: true },
  { name: 'nominal', align: 'right', label: 'NILAI TAGIHAN', field: 'grand_total', sortable: true },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]

// Fetch Data
const fetchData = async () => {
  loading.value = true

  // Ambil Data Master Supplier
  const snapSupp = await getDocs(collection(db, 'suppliers'))
  allSupplier.value = snapSupp.docs.map((d) => ({ id: d.id, ...d.data() }))
  optSupplier.value = [...allSupplier.value]

  // Ambil Data Proyek
  const snapProj = await getDocs(collection(db, 'proyek'))
  optProyek.value = snapProj.docs.map((d) => ({ id: d.id, nama: d.data().nama }))

  // Ambil Data PO untuk Referensi
  const snapPo = await getDocs(collection(db, 'purchase_order'))
  optPO.value = snapPo.docs.map((d) => ({ id: d.id, ...d.data() }))

  // Listener Tagihan
  unsubTagihan = onSnapshot(collection(db, 'finance_tagihan'), (snap) => {
    rows.value = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    loading.value = false
  })
}

// Computed Filters & Stats
const filteredRows = computed(() => {
  if (!searchQuery.value) return rows.value
  const lower = searchQuery.value.toLowerCase()
  return rows.value.filter(
    (r) =>
      r.nomor_invoice?.toLowerCase().includes(lower) ||
      r.supplier_nama?.toLowerCase().includes(lower),
  )
})

const countByStatus = (status) => rows.value.filter((r) => r.status === status).length

const countOverdue = () => {
  const today = new Date().toISOString().substr(0, 10)
  return rows.value.filter((r) => r.jatuh_tempo < today && r.status !== 'Lunas').length
}

const totalOutstandingValuation = computed(() => {
  return rows.value
    .filter((r) => r.status !== 'Lunas' && r.status !== 'Draft')
    .reduce((sum, r) => sum + (r.grand_total || 0), 0)
})

const isOverdue = (dateStr, status) => {
  if (status === 'Lunas') return false
  const today = new Date().toISOString().substr(0, 10)
  return dateStr < today
}

// Dialog & Form Logic
const openAddDialog = () => {
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  showDialog.value = true
}

const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = {
    ...JSON.parse(JSON.stringify(row)),
    supplier: row.supplier_id ? { id: row.supplier_id, nama: row.supplier_nama } : null,
    proyek: row.proyek_id ? { id: row.proyek_id, nama: row.proyek_nama } : null,
    po_ref: row.po_nomor ? { nomor: row.po_nomor } : null,
  }
  showDialog.value = true
}

// Real-time Calculations
const calculatedPpn = computed(() => {
  return ((form.value.nilai_dpp || 0) * (form.value.ppn_persen || 0)) / 100
})
const calculatedPph = computed(() => {
  return ((form.value.nilai_dpp || 0) * (form.value.pph_persen || 0)) / 100
})
const calculatedGrandTotal = computed(() => {
  return (form.value.nilai_dpp || 0) + calculatedPpn.value - calculatedPph.value
})

// Auto Fill dari PO
const onPoSelect = (poObj) => {
  if (poObj) {
    form.value.po_nomor = poObj.nomor
    form.value.nilai_dpp = poObj.grand_total || 0 // Default narik grand_total PO sbg DPP tagihan awal
    form.value.keterangan = `Tagihan berdasarkan PO: ${poObj.nomor}`

    // Auto fill supplier
    const matchedSupp = allSupplier.value.find(
      (s) => s.nama.toLowerCase() === poObj.kepada_yth?.toLowerCase(),
    )
    if (matchedSupp) form.value.supplier = { id: matchedSupp.id, nama: matchedSupp.nama }
    else form.value.supplier = { id: null, nama: poObj.kepada_yth }

    // Auto fill proyek
    const matchedProj = optProyek.value.find(
      (p) => p.nama.toLowerCase() === poObj.proyek_nama?.toLowerCase(),
    )
    if (matchedProj) form.value.proyek = matchedProj
  } else {
    form.value.po_nomor = ''
  }
}

const filterSupplier = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    optSupplier.value = allSupplier.value.filter((v) => v.nama?.toLowerCase().includes(needle))
  })
}

const addDocRow = () => form.value.lampiran.push({ label: '', url: '', base64: '', fileObj: null })
const removeDocRow = (i) => form.value.lampiran.splice(i, 1)

// Proses Simpan Database
const processHybridUpload = async (file, pathName) => {
  if (!file) return null
  if (file.size <= 512000) {
    // < 500kb save as base64 to save storage requests
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
    })
  } else {
    const sRef = storageRef(storage, `finance/tagihan/${Date.now()}_${pathName}`)
    const snap = await uploadBytes(sRef, file)
    return await getDownloadURL(snap.ref)
  }
}

const simpanTagihan = async () => {
  if (!form.value.nomor_invoice || !form.value.supplier || !form.value.proyek) {
    return $q.notify({
      type: 'warning',
      message: 'Nomor Invoice, Supplier, dan Proyek wajib diisi!',
    })
  }

  $q.loading.show({ message: 'Menyimpan dokumen tagihan...' })
  submitting.value = true

  try {
    // Process uploads
    for (let item of form.value.lampiran) {
      if (item.fileObj) {
        const result = await processHybridUpload(item.fileObj, item.label || 'Lampiran')
        if (result.startsWith('http')) {
          item.url = result
          item.base64 = ''
        } else {
          item.base64 = result
          item.url = ''
        }
        delete item.fileObj
      }
    }

    const payload = {
      nomor_invoice: form.value.nomor_invoice,
      tanggal_invoice: form.value.tanggal_invoice,
      jatuh_tempo: form.value.jatuh_tempo,
      supplier_id: form.value.supplier?.id || null,
      supplier_nama: form.value.supplier?.nama || '',
      proyek_id: form.value.proyek?.id || null,
      proyek_nama: form.value.proyek?.nama || '',
      po_nomor: form.value.po_nomor || '',
      nilai_dpp: form.value.nilai_dpp,
      ppn_persen: form.value.ppn_persen,
      ppn_nominal: calculatedPpn.value,
      pph_persen: form.value.pph_persen,
      pph_nominal: calculatedPph.value,
      grand_total: calculatedGrandTotal.value,
      keterangan: form.value.keterangan,
      status: form.value.status,
      lampiran: form.value.lampiran,
      updatedAt: serverTimestamp(),
    }

    if (isEditMode.value) {
      await updateDoc(doc(db, 'finance_tagihan', form.value.id), payload)
    } else {
      payload.createdAt = serverTimestamp()
      payload.pembuat = authStore.user?.nama || 'Admin'
      await addDoc(collection(db, 'finance_tagihan'), payload)
    }

    showDialog.value = false
    $q.notify({ type: 'positive', message: 'Tagihan berhasil disimpan!' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan tagihan.' })
  } finally {
    $q.loading.hide()
    submitting.value = false
  }
}

const confirmHapus = (row) => {
  $q.dialog({
    title: 'Hapus Tagihan',
    message: `Hapus invoice ${row.nomor_invoice} secara permanen?`,
    cancel: true,
    ok: { color: 'negative', label: 'Hapus', unelevated: true },
  }).onOk(async () => {
    await deleteDoc(doc(db, 'finance_tagihan', row.id))
    $q.notify({ type: 'positive', message: 'Tagihan terhapus' })
  })
}

// Utils
const formatDateIndo = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatCompact = (num) => {
  if (!num) return '0'
  if (num >= 1000000000) return (num / 1000000000).toFixed(2).replace(/\.00$/, '') + ' M'
  if (num >= 1000000) return (num / 1000000).toFixed(2).replace(/\.00$/, '') + ' Jt'
  return num.toLocaleString('id-ID')
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Draft':
      return { bg: 'grey-3', text: 'grey-8' }
    case 'Menunggu Pembayaran':
      return { bg: 'orange-2', text: 'orange-9' }
    case 'Dibayar Sebagian':
      return { bg: 'blue-2', text: 'blue-9' }
    case 'Lunas':
      return { bg: 'green-2', text: 'green-9' }
    default:
      return { bg: 'grey-3', text: 'grey-8' }
  }
}

// eslint-disable-next-line no-unused-vars
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  return true // Simplify for this layout unless user permissions are strictly mapped
}

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  if (unsubTagihan) unsubTagihan()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

.font-pro {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-12 {
  border-radius: 12px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(25, 118, 210, 0.15);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-dashed {
  border: 2px dashed #e0e0e0;
}
.dashed-box {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
}

/* Table Styling */
.finance-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
}
.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.03) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(26, 35, 126, 0.1) !important;
}

.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transition: 0.3s;
}

.animate-fade {
  animation: fadeIn 0.8s ease-out;
}
.animate-fade-up {
  animation: fadeUp 0.6s ease-out both;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.label-req {
  font-size: 11px;
  font-weight: 800;
  color: #444;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.block {
  display: block;
}
.uppercase {
  text-transform: uppercase;
}
.font-11 {
  font-size: 11px;
}
.font-10 {
  font-size: 10px;
}
.tracking-widest {
  letter-spacing: 0.15em;
}
.opacity-80 {
  opacity: 0.8;
}
.bg-blue-50 {
  background-color: #f0f4ff !important;
}
.border-bottom {
  border-bottom: 1px solid #eee;
}
</style>
