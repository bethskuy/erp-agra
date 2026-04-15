<template>
  <q-page class="bg-grey-2 q-pa-md font-pro">
    <div v-if="viewMode === 'list'">
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h5 text-weight-bold text-primary text-uppercase">
            Manajemen Proyek Utama
          </div>
          <div class="text-caption text-grey-7">Daftar proyek aktif PT AGRA.</div>
        </div>
        <div class="col-auto">
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Buat Proyek Baru"
            class="btn-radius shadow-2"
            @click="openAddDialog"
          />
        </div>
      </div>

      <q-card flat bordered class="rounded-borders shadow-1">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          flat
          :loading="loading"
          class="customer-table"
          @row-click="showProjectDetail"
        >
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="q-gutter-xs text-center" @click.stop>
              <q-btn
                flat
                round
                color="blue"
                icon="edit"
                size="sm"
                @click="openEditDialog(props.row)"
              />
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                size="sm"
                @click="hapusProyek(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <div v-else-if="viewMode === 'detail' && currentProject">
      <div class="row items-center q-mb-lg">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="primary"
          @click="viewMode = 'list'"
          class="q-mr-md"
        />
        <div class="col">
          <div class="text-h5 text-weight-bold text-primary text-uppercase">
            {{ currentProject.nama }}
          </div>
          <div class="text-caption text-grey-7">Nomor: {{ currentProject.nomor }}</div>
        </div>
      </div>

      <q-card
        flat
        bordered
        class="bg-white q-pa-lg rounded-borders shadow-1 q-mb-xl row text-center"
      >
        <div class="col-4">
          <div class="text-caption text-grey-7 font-bold uppercase">Customer</div>
          <div class="text-h6 text-weight-bolder">{{ currentProject.konsumen || '-' }}</div>
        </div>
        <div class="col-4">
          <div class="text-caption text-grey-7 font-bold uppercase">Kategori</div>
          <div class="text-h6 text-blue-9 text-weight-bolder">
            {{ currentProject.kategori || '-' }}
          </div>
        </div>
        <div class="col-4">
          <div class="text-caption text-grey-7 font-bold uppercase">Lokasi</div>
          <div class="text-body1">{{ currentProject.alamat || '-' }}</div>
        </div>
      </q-card>

      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6 text-grey-9 text-weight-bold uppercase">
          Daftar Kontrak / SPK Customer
        </div>
        <q-btn
          unelevated
          color="primary"
          icon="add_circle"
          label="TAMBAHKAN SPK & BOQ"
          @click="openAddSpkDialog"
          class="btn-radius shadow-2 q-px-lg"
        />
      </div>

      <q-card flat bordered class="bg-white rounded-borders shadow-1">
        <q-table
          :rows="listSpkProject"
          :columns="spkColumns"
          flat
          separator="horizontal"
          :loading="loadingSpk"
          @row-click="showSpkDetail"
          class="cursor-pointer"
        >
          <template v-slot:body-cell-nilai="props">
            <q-td :props="props" class="text-right text-weight-bold text-primary"
              >Rp {{ formatMoney(props.value) }}</q-td
            >
          </template>
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="text-center q-gutter-x-sm" @click.stop>
              <q-btn
                flat
                round
                color="blue"
                icon="edit"
                size="sm"
                @click="openEditSpkDialog(props.row)"
              />
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                size="sm"
                @click="hapusSpk(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <div v-else-if="viewMode === 'spk_detail' && currentSpk">
      <div class="row items-center q-mb-lg">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="primary"
          @click="viewMode = 'detail'"
          class="q-mr-md"
        />
        <div class="col">
          <div class="text-h5 text-weight-bold text-primary text-uppercase">
            SPK: {{ currentSpk.nomor_spk }}
          </div>
          <div class="text-caption text-grey-7">Rincian Item BOQ & Dokumen Terlampir</div>
        </div>
        <div class="col-auto q-gutter-x-sm">
          <q-btn
            outline
            color="orange-9"
            icon="calculate"
            label="BALANCE ESTIMASI MARGIN"
            class="btn-radius"
          />
          <q-btn
            unelevated
            color="deep-orange"
            icon="grid_on"
            label="BUAT RAB MODAL"
            class="btn-radius shadow-2"
            @click="openRabExcelView"
          />
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card flat bordered class="bg-white rounded-borders q-mb-md">
            <q-toolbar class="bg-blue-1 text-primary">
              <q-toolbar-title class="text-subtitle2 text-bold uppercase"
                >Rincian Item BOQ</q-toolbar-title
              >
            </q-toolbar>
            <q-markup-table flat separator="cell">
              <thead class="bg-blue-5 text-white uppercase font-11">
                <tr>
                  <th>No</th>
                  <th>Item Pekerjaan</th>
                  <th style="width: 100px">Vol</th>
                  <th style="width: 100px">Sat</th>
                  <th class="text-right">Harga Jual</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in currentSpk.boq_items" :key="idx">
                  <td class="text-center">{{ idx + 1 }}</td>
                  <td>{{ item.deskripsi }}</td>
                  <td class="text-center">{{ item.volume }}</td>
                  <td class="text-center uppercase">{{ item.satuan }}</td>
                  <td class="text-right">Rp {{ formatMoney(item.harga_satuan) }}</td>
                  <td class="text-right text-bold text-primary">
                    Rp {{ formatMoney(item.volume * item.harga_satuan) }}
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-grey-2">
                <tr>
                  <td colspan="5" class="text-right text-bold uppercase font-11">
                    Total Nilai Kontrak:
                  </td>
                  <td class="text-right text-h6 text-primary text-weight-bolder">
                    Rp {{ formatMoney(currentSpk.nilai_total) }}
                  </td>
                </tr>
              </tfoot>
            </q-markup-table>
          </q-card>

          <div class="text-subtitle1 text-weight-bold text-primary q-mb-sm uppercase">
            Dokumen Terlampir
          </div>
          <q-card flat bordered class="rounded-borders bg-white q-pa-md shadow-1">
            <div
              v-if="!currentSpk.documents || currentSpk.documents.length === 0"
              class="text-grey-6 italic text-center q-pa-md"
            >
              Belum ada dokumen terlampir.
            </div>
            <div class="row q-col-gutter-sm" v-else>
              <div class="col-12" v-for="(docItem, dIdx) in currentSpk.documents" :key="dIdx">
                <q-item
                  clickable
                  v-ripple
                  bordered
                  class="rounded-borders bg-grey-1 shadow-1"
                  @click="previewDocument(docItem)"
                >
                  <q-item-section avatar
                    ><q-icon name="description" color="primary"
                  /></q-item-section>
                  <q-item-section>
                    <q-item-label class="text-bold text-uppercase">{{
                      docItem.nama_file
                    }}</q-item-label>
                    <q-item-label caption class="text-primary font-bold italic"
                      >Klik di sini untuk review berkas</q-item-label
                    >
                  </q-item-section>
                  <q-item-section side
                    ><q-btn flat round color="primary" icon="visibility" size="sm"
                  /></q-item-section>
                </q-item>
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </div>

    <div v-else-if="viewMode === 'rab_excel' && currentSpk">
      <div class="row items-center q-mb-lg">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="primary"
          @click="viewMode = 'spk_detail'"
          class="q-mr-md"
        />
        <div class="col">
          <div class="text-h5 text-weight-bold text-deep-orange text-uppercase">
            Analisa RAB Modal: {{ currentSpk.nomor_spk }}
          </div>
          <div class="text-caption text-grey-7">
            Tampilan Spreadsheet Analisa Biaya Modal Proyek
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            unelevated
            color="green-9"
            label="SIMPAN ANALISA RAB"
            icon="save"
            :loading="savingRab"
            @click="saveRabModal"
            class="btn-radius shadow-2 q-px-lg"
          />
        </div>
      </div>

      <div class="bg-white rounded-borders shadow-2 overflow-hidden q-mb-xl">
        <div v-for="(boq, bIdx) in currentSpk.boq_items" :key="bIdx" class="q-mb-md">
          <div class="bg-blue-9 text-white q-pa-md row items-center justify-between">
            <div class="text-subtitle1 text-bold uppercase">
              ITEM #{{ bIdx + 1 }}: {{ boq.deskripsi }} (Vol: {{ boq.volume }} {{ boq.satuan }})
            </div>
            <div class="text-subtitle1">
              Total Jual:
              <span class="text-yellow text-bold"
                >Rp {{ formatMoney(boq.volume * boq.harga_satuan) }}</span
              >
            </div>
          </div>

          <q-markup-table flat bordered separator="cell" class="excel-table">
            <thead>
              <tr class="bg-grey-1 text-grey-9 text-uppercase font-11">
                <th style="width: 50px">No</th>
                <th>Deskripsi Kebutuhan Modal (Material/Upah/Alat)</th>
                <th style="width: 100px">Qty</th>
                <th style="width: 100px">Satuan</th>
                <th style="width: 180px">Harga Satuan</th>
                <th style="width: 200px" class="text-right">Total Modal</th>
                <th style="width: 60px">
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="add_box"
                    size="sm"
                    @click="addRabRow(bIdx)"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(rab, rIdx) in boq.rab_modal || (boq.rab_modal = [])" :key="rIdx">
                <td class="text-center">{{ rIdx + 1 }}</td>
                <td>
                  <q-input
                    borderless
                    dense
                    v-model="rab.kebutuhan"
                    placeholder="Material / Tenaga..."
                  />
                </td>
                <td>
                  <q-input
                    borderless
                    dense
                    v-model.number="rab.qty"
                    type="number"
                    class="text-center"
                  />
                </td>
                <td><q-input borderless dense v-model="rab.satuan" class="text-center" /></td>
                <td>
                  <q-input
                    borderless
                    dense
                    v-model.number="rab.harga"
                    type="number"
                    class="text-right"
                  />
                </td>
                <td class="text-right text-bold text-grey-9">
                  Rp {{ formatMoney(rab.qty * rab.harga) }}
                </td>
                <td class="text-center">
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="remove_circle"
                    size="xs"
                    @click="boq.rab_modal.splice(rIdx, 1)"
                  />
                </td>
              </tr>
              <tr class="bg-orange-1">
                <td colspan="5" class="text-right text-bold uppercase font-11">
                  Total Modal Item Pekerjaan Ini:
                </td>
                <td class="text-right text-bold text-deep-orange">
                  Rp {{ formatMoney(sumRabPerItem(boq)) }}
                </td>
                <td></td>
              </tr>
              <tr class="bg-green-1">
                <td colspan="5" class="text-right text-bold uppercase font-11">
                  Estimasi Margin Laba Item Ini:
                </td>
                <td class="text-right text-bold text-green-9">
                  Rp {{ formatMoney(boq.volume * boq.harga_satuan - sumRabPerItem(boq)) }}
                </td>
                <td></td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>

      <q-card flat bordered class="bg-white rounded-borders q-pa-lg shadow-2">
        <div class="row justify-end q-col-gutter-xl text-uppercase">
          <div class="col-auto text-right">
            <div class="text-caption text-grey-7 font-bold">Total Nilai Jual SPK</div>
            <div class="text-h5 text-bold text-primary">
              Rp {{ formatMoney(currentSpk.nilai_total) }}
            </div>
          </div>
          <div class="col-auto text-right">
            <div class="text-caption text-grey-7 font-bold">Grand Total Modal (Estimasi)</div>
            <div class="text-h5 text-bold text-deep-orange">
              Rp {{ formatMoney(grandTotalRab) }}
            </div>
          </div>
          <div class="col-auto text-right border-left q-pl-xl">
            <div class="text-caption text-grey-7 font-bold">Total Estimasi Laba SPK</div>
            <div class="text-h4 text-bold text-green-9">
              Rp {{ formatMoney(currentSpk.nilai_total - grandTotalRab) }}
            </div>
          </div>
        </div>
      </q-card>
    </div>

    <q-dialog v-model="previewDialog" maximized transition-show="scale" transition-hide="scale">
      <q-card class="column no-wrap">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>{{ selectedDoc?.nama_file || 'Preview Dokumen' }}</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section class="col q-pa-none bg-grey-3">
          <iframe
            v-if="selectedDoc?.url"
            :src="selectedDoc.url"
            style="width: 100%; height: 100%; border: none"
          ></iframe>
          <div v-else class="flex flex-center full-height text-h6 text-grey-7 italic">
            Link dokumen tidak valid.
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showAddSpk" maximized transition-show="slide-up">
      <q-card class="bg-grey-1 column no-wrap">
        <q-toolbar class="bg-white text-grey-9 q-py-md shadow-1">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-bold text-center uppercase">{{
            isEditSpkMode ? 'Update SPK & BOQ' : 'Input SPK & BOQ Baru'
          }}</q-toolbar-title>
          <q-btn
            unelevated
            color="primary"
            :label="submittingSpk ? 'MEMPROSES...' : 'SIMPAN SPK'"
            icon="save"
            :loading="submittingSpk"
            @click="saveSpkCustomer"
            class="q-px-lg btn-radius shadow-2"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-lg">
          <div class="row justify-center">
            <div class="col-12 col-lg-10 q-gutter-y-md">
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <q-input
                    outlined
                    dense
                    v-model="formSpk.nomor_spk"
                    label="Nomor SPK *"
                    bg-color="white"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    outlined
                    dense
                    v-model="formSpk.tgl_spk"
                    type="date"
                    label="Tanggal SPK"
                    stack-label
                    bg-color="white"
                  />
                </div>
              </div>

              <q-card flat bordered class="rounded-borders">
                <q-toolbar class="bg-blue-1 text-primary"
                  ><q-toolbar-title class="text-subtitle2 text-bold uppercase"
                    >Input Rincian BOQ</q-toolbar-title
                  ><q-btn flat round icon="add" size="sm" @click="addBoqRow"
                /></q-toolbar>
                <q-markup-table flat separator="cell">
                  <thead>
                    <tr class="bg-blue-5 text-white uppercase font-11">
                      <th>No</th>
                      <th>Item Pekerjaan</th>
                      <th>Qty</th>
                      <th>Sat</th>
                      <th>Harga</th>
                      <th>Total</th>
                      <th style="width: 50px">-</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in formSpk.boq_items" :key="idx">
                      <td class="text-center">{{ idx + 1 }}</td>
                      <td>
                        <q-input
                          borderless
                          dense
                          v-model="item.deskripsi"
                          placeholder="Pekerjaan..."
                        />
                      </td>
                      <td>
                        <q-input
                          borderless
                          dense
                          v-model.number="item.volume"
                          type="number"
                          class="text-center"
                        />
                      </td>
                      <td>
                        <q-input borderless dense v-model="item.satuan" class="text-center" />
                      </td>
                      <td>
                        <q-input
                          borderless
                          dense
                          v-model.number="item.harga_satuan"
                          type="number"
                          class="text-right"
                        />
                      </td>
                      <td class="text-right">
                        Rp {{ formatMoney(item.volume * item.harga_satuan) }}
                      </td>
                      <td class="text-center">
                        <q-btn
                          flat
                          round
                          color="negative"
                          icon="delete"
                          size="sm"
                          @click="formSpk.boq_items.splice(idx, 1)"
                          v-if="formSpk.boq_items.length > 1"
                        />
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-grey-2">
                    <tr>
                      <td colspan="5" class="text-right text-bold uppercase font-11">
                        Subtotal Kontrak:
                      </td>
                      <td class="text-right text-h6 text-primary text-weight-bolder">
                        Rp {{ formatMoney(calculateSubtotalForm) }}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </q-markup-table>
              </q-card>

              <div class="text-subtitle1 text-weight-bold text-primary q-mt-lg uppercase">
                Upload Dokumen Pendukung
              </div>
              <q-card flat bordered class="rounded-borders q-pa-md bg-white shadow-1">
                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-caption italic">
                    Hybrid Mode: Base64 (&lt; 500kb) atau Storage (&gt; 500kb).
                  </div>
                  <q-btn fab-mini color="primary" icon="add" @click="addDocumentRow" />
                </div>
                <div
                  v-for="(docItem, dIdx) in formSpk.documents"
                  :key="dIdx"
                  class="row q-col-gutter-sm items-center q-mb-sm"
                >
                  <div class="col-4">
                    <q-input
                      outlined
                      dense
                      v-model="docItem.nama_file"
                      placeholder="Nama Dokumen"
                      bg-color="white"
                    />
                  </div>
                  <div class="col-7">
                    <div v-if="docItem.url" class="bg-grey-2 q-pa-xs rounded row items-center">
                      <q-icon name="check_circle" color="green" class="q-mx-sm" />
                      <div class="col text-caption text-bold">File Tersimpan</div>
                    </div>
                    <q-file
                      v-else
                      outlined
                      dense
                      v-model="docItem.file_raw"
                      label="Pilih File"
                      bg-color="white"
                      ><template v-slot:prepend><q-icon name="attach_file" /></template
                    ></q-file>
                  </div>
                  <div class="col-1 text-center">
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="formSpk.documents.splice(dIdx, 1)"
                    />
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showAddDialog" persistent maximized transition-show="slide-up">
      <q-card class="column no-wrap shadow-2">
        <q-toolbar class="bg-white text-grey-9 q-py-md bordered-bottom shadow-1">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-bold text-center uppercase">{{
            isEditMode ? 'Update Proyek' : 'Buat Proyek Baru'
          }}</q-toolbar-title>
        </q-toolbar>
        <q-card-section class="col scroll q-pa-xl row justify-center">
          <div class="col-12 col-md-6 q-gutter-y-md">
            <q-input outlined dense v-model="form.nama" label="Nama Proyek *" bg-color="white" />
            <q-select
              outlined
              dense
              v-model="form.kategori"
              :options="optionsKategori"
              label="Kategori *"
              bg-color="white"
              emit-value
              map-options
            />
            <q-select
              outlined
              dense
              v-model="form.konsumen"
              :options="optionsKonsumen"
              label="Customer"
              bg-color="white"
              emit-value
              map-options
            />
            <q-btn
              unelevated
              color="primary"
              label="Simpan Proyek"
              :loading="submitting"
              @click="simpanProyek"
              class="full-width btn-radius shadow-2"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { db, storage } from 'src/boot/firebase'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  where,
} from 'firebase/firestore'

const $q = useQuasar()
const viewMode = ref('list')
const rows = ref([])
const loading = ref(false)
const showAddDialog = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const showAddSpk = ref(false)
const submittingSpk = ref(false)
const isEditSpkMode = ref(false)
const currentProject = ref(null)
const currentSpk = ref(null)
const listSpkProject = ref([])
const loadingSpk = ref(false)
const optionsKonsumen = ref([])
const optionsKategori = ref([])

const previewDialog = ref(false)
const selectedDoc = ref(null)

// RAB Modal State
const savingRab = ref(false)

const form = ref({ nomor: '', nama: '', kategori: '', konsumen: '', alamat: '', status: 'Aktif' })
const formSpk = ref({ nomor_spk: '', tgl_spk: '', boq_items: [], documents: [] })

const formatMoney = (v) => (v ? v.toLocaleString() : '0')
const calculateSubtotalForm = computed(() => {
  return formSpk.value.boq_items.reduce((sum, item) => sum + item.volume * item.harga_satuan, 0)
})

// RAB Calculations
const sumRabPerItem = (boq) => {
  if (!boq.rab_modal) return 0
  return boq.rab_modal.reduce((sum, r) => sum + r.qty * r.harga, 0)
}
const grandTotalRab = computed(() => {
  if (!currentSpk.value?.boq_items) return 0
  return currentSpk.value.boq_items.reduce((sum, boq) => sum + sumRabPerItem(boq), 0)
})

const columns = [
  { name: 'nomor', align: 'left', label: 'ID PROYEK', field: 'nomor' },
  { name: 'nama', align: 'left', label: 'NAMA PROYEK', field: 'nama' },
  { name: 'customer', align: 'left', label: 'CUSTOMER', field: 'konsumen' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]

const spkColumns = [
  { name: 'no_spk', align: 'left', label: 'NO. SPK', field: 'nomor_spk' },
  { name: 'tgl', align: 'left', label: 'TANGGAL', field: 'tgl_spk' },
  { name: 'nilai', align: 'right', label: 'TOTAL KONTRAK', field: 'nilai_total' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]

// CORE FUNCTIONS
const previewDocument = (docItem) => {
  if (docItem && docItem.url) {
    selectedDoc.value = docItem
    previewDialog.value = true
  } else {
    $q.notify({ type: 'warning', message: 'Dokumen tidak ditemukan atau link rusak.' })
  }
}

const showProjectDetail = (evt, row) => {
  currentProject.value = row
  viewMode.value = 'detail'
  fetchSpkByProject(row.id)
}
const showSpkDetail = (evt, row) => {
  currentSpk.value = JSON.parse(JSON.stringify(row))
  viewMode.value = 'spk_detail'
}

// RAB MODAL FUNCTIONS
const openRabExcelView = () => {
  // Pastikan setiap item memiliki array rab_modal
  currentSpk.value.boq_items.forEach((item) => {
    if (!item.rab_modal) item.rab_modal = []
  })
  viewMode.value = 'rab_excel'
}

const addRabRow = (bIdx) => {
  currentSpk.value.boq_items[bIdx].rab_modal.push({ kebutuhan: '', qty: 0, satuan: '', harga: 0 })
}

const saveRabModal = async () => {
  savingRab.value = true
  try {
    const spkId = currentSpk.value.id
    const payload = JSON.parse(JSON.stringify(currentSpk.value))
    delete payload.id
    payload.updatedAt = serverTimestamp()
    payload.total_modal_estimasi = grandTotalRab.value

    await updateDoc(doc(db, 'spk_customer', spkId), payload)
    $q.notify({ type: 'positive', message: 'Analisa RAB Modal Berhasil Disimpan!' })
    viewMode.value = 'spk_detail'
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal Simpan RAB.' })
  } finally {
    savingRab.value = false
  }
}

// HYBRID STORAGE LOGIC
const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (e) => reject(e)
  })
}

const processHybridUpload = async (docArray) => {
  const result = []
  for (const dItem of docArray) {
    if (dItem.file_raw) {
      const fileSize = dItem.file_raw.size / 1024
      if (fileSize < 500) {
        const b64 = await getBase64(dItem.file_raw)
        result.push({ nama_file: dItem.nama_file || dItem.file_raw.name, url: b64 })
      } else {
        const fRef = storageRef(storage, `spk_documents/${Date.now()}_${dItem.file_raw.name}`)
        const task = await uploadBytes(fRef, dItem.file_raw)
        const dURL = await getDownloadURL(task.ref)
        result.push({ nama_file: dItem.nama_file || dItem.file_raw.name, url: dURL })
      }
    } else if (dItem.url) {
      result.push({ nama_file: dItem.nama_file, url: dItem.url })
    }
  }
  return result
}

const saveSpkCustomer = async () => {
  if (!formSpk.value.nomor_spk) return
  submittingSpk.value = true
  try {
    const finalDocs = await processHybridUpload(formSpk.value.documents)
    const total = calculateSubtotalForm.value
    const payload = JSON.parse(JSON.stringify(formSpk.value))
    payload.nilai_total = total
    payload.projectId = currentProject.value.id
    payload.updatedAt = serverTimestamp()
    payload.documents = finalDocs.map((d) => {
      const cleanDoc = { ...d }
      if (Object.prototype.hasOwnProperty.call(cleanDoc, 'file_raw')) delete cleanDoc.file_raw
      return cleanDoc
    })

    const spkId = payload.id
    delete payload.id
    if (isEditSpkMode.value) {
      await updateDoc(doc(db, 'spk_customer', spkId), payload)
    } else {
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'spk_customer'), payload)
    }
    showAddSpk.value = false
    fetchSpkByProject(currentProject.value.id)
    $q.notify({ type: 'positive', message: 'Data SPK Berhasil Disimpan.' })
  } catch (e) {
    console.error(e)
  } finally {
    submittingSpk.value = false
  }
}

// FIREBASE FETCH
const fetchProyek = async () => {
  loading.value = true
  const snap = await getDocs(query(collection(db, 'proyek'), orderBy('createdAt', 'desc')))
  rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  loading.value = false
}

const fetchSpkByProject = async (pid) => {
  loadingSpk.value = true
  const q = query(
    collection(db, 'spk_customer'),
    where('projectId', '==', pid),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  listSpkProject.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  loadingSpk.value = false
}

const openAddSpkDialog = () => {
  isEditSpkMode.value = false
  formSpk.value = {
    nomor_spk: '',
    tgl_spk: '',
    boq_items: [{ deskripsi: 'Pekerjaan', volume: 1, satuan: 'ls', harga_satuan: 0 }],
    documents: [],
  }
  showAddSpk.value = true
}

const openEditSpkDialog = (row) => {
  isEditSpkMode.value = true
  formSpk.value = JSON.parse(JSON.stringify(row))
  showAddSpk.value = true
}

const simpanProyek = async () => {
  submitting.value = true
  try {
    const p = { ...form.value, updatedAt: serverTimestamp() }
    const dId = p.id
    delete p.id
    if (isEditMode.value) {
      await updateDoc(doc(db, 'proyek', dId), p)
    } else {
      p.createdAt = serverTimestamp()
      await addDoc(collection(db, 'proyek'), p)
    }
    showAddDialog.value = false
    fetchProyek()
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

const openAddDialog = () => {
  isEditMode.value = false
  form.value = { nomor: '', nama: '', kategori: '', konsumen: '', alamat: '' }
  showAddDialog.value = true
}
const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = { ...row }
  showAddDialog.value = true
}

const hapusProyek = (row) => {
  $q.dialog({ title: 'Hapus Proyek', message: `Hapus ${row.nama}?`, cancel: true }).onOk(
    async () => {
      await deleteDoc(doc(db, 'proyek', row.id))
      fetchProyek()
    },
  )
}
const hapusSpk = (row) => {
  $q.dialog({ title: 'Hapus SPK', message: `Hapus SPK ${row.nomor_spk}?`, cancel: true }).onOk(
    async () => {
      await deleteDoc(doc(db, 'spk_customer', row.id))
      fetchSpkByProject(currentProject.value.id)
    },
  )
}

const addDocumentRow = () => formSpk.value.documents.push({ nama_file: '', file_raw: null })
const addBoqRow = () =>
  formSpk.value.boq_items.push({ deskripsi: '', volume: 0, satuan: '', harga_satuan: 0 })

onMounted(() => {
  fetchProyek()
  getDocs(collection(db, 'customer')).then(
    (c) => (optionsKonsumen.value = c.docs.map((d) => d.data().nama)),
  )
  getDocs(collection(db, 'kategori_proyek')).then(
    (k) => (optionsKategori.value = k.docs.map((d) => d.data().nama)),
  )
})
</script>

<style scoped>
.btn-radius {
  border-radius: 8px;
}
.customer-table :deep(tbody tr) {
  cursor: pointer;
}
.font-11 {
  font-size: 11px;
}
.excel-table :deep(td) {
  padding: 0 !important;
}
.excel-table :deep(.q-field--borderless .q-field__control) {
  padding: 0 8px;
  height: 40px;
}
.border-left {
  border-left: 2px solid #ddd;
}
.bordered-bottom {
  border-bottom: 1px solid #eee;
}
</style>
