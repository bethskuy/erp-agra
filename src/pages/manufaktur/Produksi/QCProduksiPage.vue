<template>
  <q-page class="qc-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-xl">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          QC Produksi
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Validasi Hasil Produksi
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Pemeriksaan hasil produksi sebelum proses packing dan delivery, lengkap dengan status QC,
          checker, quantity reject, dan catatan validasi.
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
          class="bg-white shadow-1 q-px-lg"
          @click="loadQcRows"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="card in summaryCards" :key="card.title" class="col-12 col-sm-6 col-lg-3">
        <q-card
          flat
          bordered
          class="summary-card bg-white cursor-pointer"
          :class="{ 'summary-card--active': activeStatusTab === card.tab }"
          @click="activeStatusTab = card.tab"
        >
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
          <div class="col-12 col-md-8">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari SPK, produk, departemen, operator, atau status QC..."
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="search" color="green-10" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-auto">
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
              {{ currentTabRows.length }} QC
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="table-card bg-white">
      <div class="sticky-tabs bg-white">
        <q-tabs
          v-model="activeStatusTab"
          dense
          active-color="green-10"
          indicator-color="green-10"
          align="justify"
          class="text-grey-7"
          mobile-arrows
        >
          <q-tab
            v-for="tab in statusTabs"
            :key="tab.name"
            :name="tab.name"
            :icon="tab.icon"
            :label="tab.label"
          />
        </q-tabs>
      </div>

      <q-separator />

      <q-tab-panels
        v-model="activeStatusTab"
        animated
        swipeable
        transition-prev="fade"
        transition-next="fade"
        class="bg-white"
      >
        <q-tab-panel v-for="tab in statusTabs" :key="tab.name" :name="tab.name" class="q-pa-none">
          <q-table
            :rows="rowsByStatus[tab.name]"
            :columns="columnsByStatus[tab.name]"
            row-key="id"
            flat
            binary-state-sort
            :loading="loading"
            :pagination="{ rowsPerPage: 10 }"
            class="qc-table"
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
              <q-tr :props="props" class="qc-row">
                <q-td key="no_spk" :props="props" class="text-weight-bolder text-green-10">
                  {{ props.row.no_spk || props.row.nomor_spk || '-' }}
                </q-td>
                <q-td key="nomor_po" :props="props" class="text-weight-bold">
                  {{ props.row.nomor_po || '-' }}
                </q-td>
                <q-td key="customer" :props="props">
                  {{ props.row.customer || props.row.customer_nama || props.row.nama_customer || '-' }}
                </q-td>
                <q-td key="nama_produk" :props="props" class="text-weight-bold text-green-10">
                  {{ props.row.nama_produk || '-' }}
                </q-td>
                <q-td key="departemen_asal" :props="props">{{ props.row.departemen_asal || '-' }}</q-td>
                <q-td key="qty_produksi_awal" :props="props" class="text-weight-bold">
                  {{ formatNumber(qtyProduksiAwalFrom(props.row)) }}
                </q-td>
                <q-td v-if="tab.name === 'pending_qc'" key="qty_pending_qc" :props="props" class="text-weight-bold text-orange-9">
                  {{ formatNumber(qtyPendingQcFrom(props.row)) }}
                </q-td>
                <q-td
                  v-if="['approved', 're_qc'].includes(tab.name)"
                  key="qty_approved"
                  :props="props"
                  class="text-weight-bold text-green-10"
                >
                  {{ formatNumber(qtyApprovedFrom(props.row)) }}
                </q-td>
                <q-td v-if="['rework', 're_qc'].includes(tab.name)" key="qty_rework" :props="props" class="text-weight-bold text-purple-8">
                  {{ formatNumber(props.row.qty_rework) }}
                </q-td>
                <q-td v-if="['reject', 're_qc'].includes(tab.name)" key="qty_reject" :props="props" class="text-weight-bold text-negative">
                  {{ formatNumber(props.row.qty_reject) }}
                </q-td>
                <q-td v-if="tab.name === 'pending_qc'" key="operator" :props="props">{{ props.row.operator || '-' }}</q-td>
                <q-td v-if="tab.name === 'pending_qc'" key="tanggal_finish" :props="props">
                  {{ formatDateTime(props.row.tanggal_finish) }}
                </q-td>
                <q-td v-if="tab.name === 'approved'" key="checker_qc" :props="props">{{ props.row.checker_qc || '-' }}</q-td>
                <q-td v-if="tab.name === 'approved'" key="tanggal_qc" :props="props">
                  {{ formatDateTime(props.row.tanggal_qc) }}
                </q-td>
                <q-td v-if="tab.name === 'reject'" key="foto_reject" :props="props">
                  <q-img
                    v-if="props.row.foto_reject_base64"
                    :src="props.row.foto_reject_base64"
                    class="reject-thumb"
                    fit="cover"
                  />
                  <span v-else class="text-grey-6">-</span>
                </q-td>
                <q-td v-if="tab.name === 'reject'" key="catatan_qc" :props="props">
                  <div class="note-cell">{{ props.row.catatan_qc || '-' }}</div>
                </q-td>
                <q-td v-if="tab.name === 'rework'" key="status_rework" :props="props">
                  <q-badge color="purple-7" class="q-px-sm q-py-xs">
                    {{ props.row.status_rework || props.row.status_perbaikan || 'Menunggu Rework' }}
                  </q-badge>
                </q-td>
                <q-td v-if="tab.name === 'rework'" key="departemen_rework" :props="props">
                  {{ props.row.departemen_tujuan_rework || props.row.departemen_rework || props.row.departemen_asal || '-' }}
                </q-td>
                <q-td key="aksi" :props="props" @click.stop>
                  <div class="row no-wrap justify-center q-gutter-xs">
                    <q-btn
                      v-if="tab.name === 'pending_qc'"
                      unelevated
                      rounded
                      dense
                      color="green-10"
                      icon="fact_check"
                      label="Jalankan QC"
                      no-caps
                      class="action-btn"
                      :loading="updatingId === props.row.id"
                      @click="openQcDialog(props.row)"
                    />
                    <q-btn
                      v-if="tab.name === 'reject'"
                      unelevated
                      rounded
                      dense
                      color="purple-7"
                      icon="send"
                      label="Kirim Rework"
                      no-caps
                      class="action-btn"
                      :loading="updatingId === props.row.id"
                      @click="sendToRework(props.row)"
                    />
                    <q-btn
                      v-if="tab.name === 'rework'"
                      unelevated
                      rounded
                      dense
                      color="orange-9"
                      icon="task_alt"
                      label="Selesai Rework"
                      no-caps
                      class="action-btn"
                      :loading="updatingId === props.row.id"
                      @click="finishRework(props.row)"
                    />
                    <q-btn
                      v-if="tab.name === 're_qc'"
                      unelevated
                      rounded
                      dense
                      color="green-10"
                      icon="fact_check"
                      label="QC Ulang"
                      no-caps
                      class="action-btn"
                      :loading="updatingId === props.row.id"
                      @click="openQcDialog(props.row)"
                    />
                    <q-btn
                      v-if="tab.name !== 'pending_qc'"
                      flat
                      round
                      dense
                      color="green-10"
                      icon="visibility"
                      @click="openDetailDialog(props.row)"
                    >
                      <q-tooltip>Detail QC</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </q-tr>
            </template>

            <template #no-data>
              <div class="full-width row flex-center text-grey-7 q-pa-xl">
                <q-icon :name="tab.icon" size="28px" class="q-mr-sm" />
                Belum ada data {{ tab.label.toLowerCase() }}.
              </div>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <q-dialog
      v-model="qcDialog"
      persistent
      :maximized="$q.screen.lt.md"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="qc-dialog column">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">{{ dialogTitle }}</div>
            <div class="text-caption">{{ selectedRow?.no_spk || selectedRow?.nomor_spk || '-' }}</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-form class="column col no-wrap" @submit.prevent="submitQcAction">
          <q-scroll-area class="col qc-dialog-scroll">
            <div class="q-pa-md q-pa-lg-lg">
              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-md-6">
                  <div class="detail-label">No SPK</div>
                  <div class="detail-value">{{ selectedRow?.no_spk || selectedRow?.nomor_spk || '-' }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="detail-label">Nomor PO</div>
                  <div class="detail-value">{{ selectedRow?.nomor_po || '-' }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="detail-label">Customer</div>
                  <div class="detail-value">
                    {{ selectedRow?.customer || selectedRow?.customer_nama || selectedRow?.nama_customer || '-' }}
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="detail-label">Produk</div>
                  <div class="detail-value">{{ selectedRow?.nama_produk || '-' }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="detail-label">Departemen Asal</div>
                  <div class="detail-value">{{ selectedRow?.departemen_asal || '-' }}</div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="detail-label">Operator</div>
                  <div class="detail-value">{{ selectedRow?.operator || '-' }}</div>
                </div>
              </div>

              <div class="row q-col-gutter-md q-mb-lg">
                <div class="col-12 col-md-6">
                  <q-input
                    :model-value="formatNumber(qtyProduksiAwalFrom(selectedRow))"
                    outlined
                    dense
                    readonly
                    label="Qty Produksi Awal"
                    bg-color="grey-2"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model.number="qtyApprovedInput"
                    outlined
                    dense
                    type="number"
                    min="0"
                    label="Qty Approved"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    :model-value="formatNumber(qtyReworkPreview)"
                    outlined
                    dense
                    readonly
                    label="Qty Rework"
                    bg-color="purple-1"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model.number="qtyReject" outlined dense type="number" min="0" label="Qty Reject" />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    :model-value="formatNumber(qtyPendingQcFrom(selectedRow))"
                    outlined
                    dense
                    readonly
                    label="Qty Pending QC"
                    bg-color="orange-1"
                  />
                </div>
              </div>

              <q-card flat bordered class="q-mb-lg">
                <q-card-section class="bg-green-1 text-green-10 text-weight-bold">
                  Checklist QC
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <q-inner-loading :showing="loadingMasterQc" />
                  <q-list v-if="filteredChecklist.length" separator>
                    <q-item v-for="item in filteredChecklist" :key="item.id">
                      <q-item-section avatar>
                        <q-checkbox
                          :model-value="!!checklistState[item.id]"
                          color="green-10"
                          @update:model-value="(val) => setChecklistChecked(item.id, val)"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold text-green-10">
                          {{ item.nama_pengecekan }}
                        </q-item-label>
                        <q-item-label caption>
                          {{ item.parameter || '-' }} | Toleransi: {{ item.toleransi || '-' }}
                          <span v-if="item.tipe_pemeriksaan"> | Tipe: {{ item.tipe_pemeriksaan }}</span>
                          <span v-if="item.wajib_foto_reject"> | Wajib foto reject</span>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <div v-else class="text-grey-7 q-pa-md text-center">
                    Belum ada checklist QC aktif untuk departemen atau kategori produk ini.
                  </div>
                </q-card-section>
              </q-card>

              <q-input
                v-model="qcNote"
                outlined
                type="textarea"
                autogrow
                label="Catatan QC"
                :rules="[(val) => !!val || 'Catatan QC wajib diisi']"
              />

              <q-file
                v-model="rejectPhotoFile"
                outlined
                dense
                accept="image/*"
                label="Upload Foto Reject"
                class="q-mt-md"
                clearable
              >
                <template #prepend>
                  <q-icon name="photo_camera" color="green-10" />
                </template>
              </q-file>
            </div>
          </q-scroll-area>

          <q-card-actions align="right" class="qc-dialog-footer bg-grey-1 q-pa-md">
            <q-btn flat color="grey-7" label="Batal" no-caps v-close-popup :class="{ 'full-width': $q.screen.lt.md }" />
            <q-btn
              unelevated
              rounded
              color="green-10"
              icon="fact_check"
              label="Simpan Hasil QC"
              no-caps
              type="submit"
              :loading="!!updatingId"
              :class="{ 'full-width': $q.screen.lt.md }"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="detailDialog" :maximized="$q.screen.lt.md" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="detail-dialog">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">Detail QC Produksi</div>
            <div class="text-caption">{{ detailRow?.no_spk || detailRow?.nomor_spk || '-' }}</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md q-pa-lg-lg">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="detail-label">Nomor PO</div>
              <div class="detail-value">{{ detailRow?.nomor_po || '-' }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Customer</div>
              <div class="detail-value">{{ detailRow?.customer || detailRow?.customer_nama || detailRow?.nama_customer || '-' }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Produk</div>
              <div class="detail-value">{{ detailRow?.nama_produk || '-' }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Status QC</div>
              <q-chip dense text-color="white" :color="statusColor(detailRow?.status_qc)" class="status-chip">
                {{ statusLabel(detailRow?.status_qc) }}
              </q-chip>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Checker</div>
              <div class="detail-value">{{ detailRow?.checker_qc || '-' }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="detail-label">Tanggal QC</div>
              <div class="detail-value">{{ formatDateTime(detailRow?.tanggal_qc) }}</div>
            </div>
            <div class="col-12 col-md-4">
              <div class="detail-label">Qty Produksi Awal</div>
              <div class="detail-value">{{ formatNumber(qtyProduksiAwalFrom(detailRow)) }}</div>
            </div>
            <div class="col-12 col-md-4">
              <div class="detail-label">Qty Approved</div>
              <div class="detail-value">{{ formatNumber(qtyApprovedFrom(detailRow)) }}</div>
            </div>
            <div class="col-12 col-md-4">
              <div class="detail-label">Qty Reject</div>
              <div class="detail-value text-negative">{{ formatNumber(detailRow?.qty_reject) }}</div>
            </div>
            <div class="col-12 col-md-4">
              <div class="detail-label">Qty Rework</div>
              <div class="detail-value text-purple-8">{{ formatNumber(detailRow?.qty_rework) }}</div>
            </div>
            <div class="col-12">
              <div class="detail-label">Catatan QC</div>
              <div class="note-box">{{ detailRow?.catatan_qc || '-' }}</div>
            </div>
            <div v-if="detailRow?.foto_reject_base64" class="col-12">
              <div class="detail-label q-mb-sm">Foto Reject</div>
              <q-img :src="detailRow.foto_reject_base64" class="detail-photo" fit="contain" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Notify, useQuasar } from 'quasar'
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { useAuthStore } from 'src/stores/auth'

const COLLECTION_NAME = 'qc_produksi_manufaktur'
const PRODUCTION_COLLECTION = 'manufactur_departemen_produksi'
const FINISHED_GOODS_COLLECTION = 'manufactur_master_barang'
const REWORK_COLLECTION = 'manufactur_rework_queue'
const PRODUCTION_REWORK_QUEUE_COLLECTION = 'produksi_rework_queue'
const DEPARTEMENT_NOTIFICATION_COLLECTION = 'manufactur_departemen_notifications'
const PACKING_COLLECTION = 'packing_queue'
const PO_CUSTOMER_COLLECTION = 'manufacturing_po_customer'
const SPK_SUBCOLLECTION = 'spk'
const statusTabs = [
  { name: 'pending_qc', label: 'Pending QC', icon: 'pending_actions' },
  { name: 'approved', label: 'Approved', icon: 'verified' },
  { name: 'reject', label: 'Reject', icon: 'cancel' },
  { name: 'rework', label: 'Rework', icon: 'restart_alt' },
  { name: 're_qc', label: 'Re-QC', icon: 'published_with_changes' },
]

const $q = useQuasar()
const authStore = useAuthStore()
const rows = ref([])
const masterQcChecklist = ref([])
const loading = ref(false)
const loadingMasterQc = ref(true)
const search = ref('')
const activeStatusTab = ref('pending_qc')
const qcDialog = ref(false)
const detailDialog = ref(false)
const selectedRow = ref(null)
const detailRow = ref(null)
const checklistState = ref({})
const qtyApprovedInput = ref(0)
const qtyReject = ref(0)
const qcNote = ref('')
const rejectPhotoFile = ref(null)
const updatingId = ref(null)
let unsubscribeQc = null
let unsubscribeMasterQc = null

const baseColumns = [
  { name: 'no_spk', align: 'left', label: 'No SPK', field: 'no_spk', sortable: true },
  { name: 'nomor_po', align: 'left', label: 'Nomor PO', field: 'nomor_po', sortable: true },
  { name: 'customer', align: 'left', label: 'Customer', field: 'customer', sortable: true },
  { name: 'nama_produk', align: 'left', label: 'Nama Produk', field: 'nama_produk', sortable: true },
  { name: 'departemen_asal', align: 'left', label: 'Departemen Asal', field: 'departemen_asal', sortable: true },
  { name: 'qty_produksi_awal', align: 'right', label: 'Qty Produksi Awal', field: 'qty_produksi_awal', sortable: true },
]

const columnsByStatus = {
  pending_qc: [
    ...baseColumns,
    { name: 'qty_pending_qc', align: 'right', label: 'Qty Pending QC', field: 'qty_pending_qc', sortable: true },
    { name: 'operator', align: 'left', label: 'Operator', field: 'operator', sortable: true },
    { name: 'tanggal_finish', align: 'left', label: 'Tanggal Finish', field: 'tanggal_finish', sortable: true },
    { name: 'aksi', align: 'center', label: 'Aksi' },
  ],
  approved: [
    ...baseColumns,
    { name: 'qty_approved', align: 'right', label: 'Qty Approved', field: 'qty_approved', sortable: true },
    { name: 'checker_qc', align: 'left', label: 'Checker QC', field: 'checker_qc', sortable: true },
    { name: 'tanggal_qc', align: 'left', label: 'Tanggal QC', field: 'tanggal_qc', sortable: true },
    { name: 'aksi', align: 'center', label: 'Detail' },
  ],
  reject: [
    ...baseColumns,
    { name: 'qty_reject', align: 'right', label: 'Qty Reject', field: 'qty_reject', sortable: true },
    { name: 'foto_reject', align: 'center', label: 'Foto Reject' },
    { name: 'catatan_qc', align: 'left', label: 'Catatan Reject', field: 'catatan_qc', sortable: true },
    { name: 'aksi', align: 'center', label: 'Detail' },
  ],
  rework: [
    ...baseColumns,
    { name: 'qty_rework', align: 'right', label: 'Qty Rework', field: 'qty_rework', sortable: true },
    { name: 'status_rework', align: 'left', label: 'Status Perbaikan', field: 'status_rework', sortable: true },
    { name: 'departemen_rework', align: 'left', label: 'Departemen Rework' },
    { name: 'aksi', align: 'center', label: 'Detail' },
  ],
  re_qc: [
    ...baseColumns,
    { name: 'qty_approved', align: 'right', label: 'Qty Approved', field: 'qty_approved', sortable: true },
    { name: 'qty_reject', align: 'right', label: 'Qty Reject', field: 'qty_reject', sortable: true },
    { name: 'qty_rework', align: 'right', label: 'Qty Rework', field: 'qty_rework', sortable: true },
    { name: 'aksi', align: 'center', label: 'Aksi' },
  ],
}

const matchesSearch = (row) => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return true
  return [
    row.nomor_spk,
    row.no_spk,
    row.nomor_po,
    row.customer,
    row.customer_nama,
    row.nama_customer,
    row.nama_produk,
    row.departemen_asal,
    row.operator,
    row.checker_qc,
    row.catatan_qc,
    row.status_rework,
    row.status_perbaikan,
    normalizeQcStatus(row.status_qc),
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(keyword))
}

const rowsByStatus = computed(() => ({
  pending_qc: rows.value.filter(
    (row) => normalizeQcStatus(row.status_qc) === 'pending_qc' && qtyPendingQcFrom(row) > 0 && matchesSearch(row),
  ),
  approved: rows.value.filter((row) => qtyApprovedFrom(row) > 0 && matchesSearch(row)),
  reject: rows.value.filter(
    (row) =>
      Number(row.qty_reject || 0) > 0 &&
      !['rework', 're_qc'].includes(normalizeQcStatus(row.status_qc)) &&
      matchesSearch(row),
  ),
  rework: rows.value.filter((row) => normalizeQcStatus(row.status_qc) === 'rework' && matchesSearch(row)),
  re_qc: rows.value.filter((row) => normalizeQcStatus(row.status_qc) === 're_qc' && qtyPendingQcFrom(row) > 0 && matchesSearch(row)),
}))

const currentTabRows = computed(() => rowsByStatus.value[activeStatusTab.value] || [])

const openDetailDialog = (row) => {
  detailRow.value = row
  detailDialog.value = true
}

const summaryCards = computed(() => [
  {
    title: 'Pending QC',
    value: rows.value.filter((row) => normalizeQcStatus(row.status_qc) === 'pending_qc' && qtyPendingQcFrom(row) > 0).length,
    icon: 'pending_actions',
    color: 'orange-9',
    tab: 'pending_qc',
  },
  {
    title: 'Approved',
    value: rows.value.filter((row) => qtyApprovedFrom(row) > 0).length,
    icon: 'verified',
    color: 'green-10',
    tab: 'approved',
  },
  {
    title: 'Reject',
    value: rows.value.filter(
      (row) => Number(row.qty_reject || 0) > 0 && !['rework', 're_qc'].includes(normalizeQcStatus(row.status_qc)),
    ).length,
    icon: 'cancel',
    color: 'negative',
    tab: 'reject',
  },
  {
    title: 'Rework',
    value: rows.value.filter((row) => normalizeQcStatus(row.status_qc) === 'rework').length,
    icon: 'restart_alt',
    color: 'purple-7',
    tab: 'rework',
  },
  {
    title: 'Re-QC',
    value: rows.value.filter((row) => normalizeQcStatus(row.status_qc) === 're_qc').length,
    icon: 'published_with_changes',
    color: 'orange-9',
    tab: 're_qc',
  },
])

const dialogTitle = computed(() =>
  normalizeQcStatus(selectedRow.value?.status_qc) === 're_qc' ? 'QC Ulang Produksi' : 'Jalankan QC Produksi',
)

const normalizeQcStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase()
  if (normalized === 'menunggu_qc' || normalized === 'qc process' || normalized === 'qc_process') return 'pending_qc'
  if (normalized === 'qc_approved' || normalized === 'approved') return 'approved'
  if (normalized === 'qc_rejected' || normalized === 'qc_reject' || normalized === 'reject') return 'reject'
  if (normalized === 'qc_rework' || normalized === 'rework') return 'rework'
  if (normalized === 're-qc' || normalized === 're_qc' || normalized === 'pending_qc_ulang') return 're_qc'
  if (normalized === 'selesai' || normalized === 'qc_selesai' || normalized === 'done' || normalized === 'completed') return 'selesai'
  return normalized || 'pending_qc'
}

const statusLabel = (status) => {
  const normalized = normalizeQcStatus(status)
  if (normalized === 'pending_qc') return 'Pending QC'
  if (normalized === 'approved') return 'Approved'
  if (normalized === 'reject') return 'Reject'
  if (normalized === 'rework') return 'Rework'
  if (normalized === 're_qc') return 'Re-QC'
  if (normalized === 'selesai') return 'Selesai'
  return status || 'Pending QC'
}

const currentCheckerName = computed(
  () => authStore.user?.displayName || authStore.user?.email || 'Checker QC',
)

const statusColor = (status) => {
  const normalized = normalizeQcStatus(status)
  const colors = {
    pending_qc: 'orange-9',
    approved: 'green-10',
    reject: 'negative',
    rework: 'purple-7',
    re_qc: 'orange-9',
    selesai: 'positive',
  }
  return colors[normalized] || 'grey-6'
}

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const qtyProduksiAwalFrom = (row = {}) =>
  Number(row?.qty_produksi_awal ?? row?.qty_produksi ?? row?.qty_hasil_jadi ?? 0)

const qtyApprovedFrom = (row = {}) => {
  const qtyApproved = row?.qty_approved ?? row?.qty_approved_qc
  if (qtyApproved !== undefined && qtyApproved !== null && qtyApproved !== '') return Number(qtyApproved || 0)
  return Math.max(0, qtyProduksiAwalFrom(row) - Number(row?.qty_reject || 0))
}

const qtyPendingQcFrom = (row = {}) => {
  const pending = row?.qty_pending_qc
  if (pending !== undefined && pending !== null && pending !== '') return Math.max(0, Number(pending || 0))
  const status = normalizeQcStatus(row?.status_qc)
  if (status === 'selesai') return 0
  if (status === 're_qc') return Number(row?.qty_rework || row?.qty_reject || 0)
  return Math.max(0, qtyProduksiAwalFrom(row) - qtyApprovedFrom(row) - Number(row?.qty_reject || 0))
}

const qtyReworkPreview = computed(() => {
  const status = normalizeQcStatus(selectedRow.value?.status_qc)
  if (status === 're_qc' && Number(qtyReject.value || 0) === 0) return 0
  return Number(qtyReject.value || 0)
})

const firstFilled = (...values) => values.find((value) => String(value || '').trim()) || ''

const customerValueFrom = (row = {}) => (typeof row.customer === 'object' ? row.customer?.nama : row.customer)

const customerNameFrom = (row = {}) =>
  firstFilled(customerValueFrom(row), row.customer_nama, row.nama_customer, row.customerName, row.kepada_yth, row.konsumen)

const nomorPoFrom = (row = {}) =>
  firstFilled(row.nomor_po, row.no_po, row.po_number, row.nomor_po_customer, row.no_po_customer, row.po_customer)

const resolvePoRelation = async (relation) => {
  const sourceCollection = relation.po_source_collection || PO_CUSTOMER_COLLECTION
  const poId = relation.po_source_document_id || relation.po_id || relation.po_customer_id || relation.id_po_customer
  if ((relation.customer && relation.nomor_po) || !poId) return relation

  try {
    const poSnap = await getDoc(doc(db, sourceCollection, poId))
    if (!poSnap.exists()) return relation
    const po = poSnap.data()
    return {
      ...relation,
      nomor_po: relation.nomor_po || nomorPoFrom(po) || poSnap.id,
      customer: relation.customer || customerNameFrom(po),
      customer_id: relation.customer_id || po.customer_id || po.id_customer || po.customerId || null,
      po_id: relation.po_id || poId,
      po_source_collection: sourceCollection,
      po_source_document_id: relation.po_source_document_id || poId,
    }
  } catch (error) {
    console.error('[QCProduksi] Gagal mengambil relasi PO Customer', { relation, error })
    return relation
  }
}

const resolveProductionRelation = async (row = {}) => {
  let relation = {
    nomor_spk: row.nomor_spk || row.no_spk || '',
    no_spk: row.no_spk || row.nomor_spk || '',
    nomor_po: nomorPoFrom(row),
    customer: customerNameFrom(row),
    customer_id: row.customer_id || row.id_customer || row.customerId || null,
    po_id: row.po_id || row.po_customer_id || row.id_po_customer || null,
    po_source_collection: row.po_source_collection || PO_CUSTOMER_COLLECTION,
    po_source_document_id: row.po_source_document_id || row.po_id || row.po_customer_id || row.id_po_customer || null,
  }

  if ((!relation.nomor_po || !relation.customer) && relation.nomor_spk) {
    try {
      const spkSnap = await getDocs(
        query(collectionGroup(db, SPK_SUBCOLLECTION), where('nomor_spk', '==', relation.nomor_spk)),
      )
      const spkData = spkSnap.docs[0]?.data() || {}
      relation = {
        ...relation,
        nomor_po: relation.nomor_po || nomorPoFrom(spkData),
        customer: relation.customer || customerNameFrom(spkData),
        customer_id: relation.customer_id || spkData.customer_id || spkData.id_customer || spkData.customerId || null,
        po_id: relation.po_id || spkData.po_id || spkData.po_customer_id || spkData.id_po_customer || null,
        po_source_collection: spkData.po_source_collection || relation.po_source_collection,
        po_source_document_id:
          relation.po_source_document_id ||
          spkData.po_source_document_id ||
          spkData.po_id ||
          spkData.po_customer_id ||
          spkData.id_po_customer ||
          null,
      }
    } catch (error) {
      console.error('[QCProduksi] Gagal mengambil relasi SPK Produksi', { row, error })
    }
  }

  return resolvePoRelation(relation)
}

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = value?.seconds ? new Date(value.seconds * 1000) : new Date(value)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const setChecklistChecked = (id, value) => {
  checklistState.value = { ...checklistState.value, [id]: value }
}

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    if (!file) return resolve('')
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const openQcDialog = (row) => {
  if (normalizeQcStatus(row.status_qc) === 'selesai' || qtyPendingQcFrom(row) <= 0) {
    $q.notify({ type: 'warning', message: 'QC sudah selesai untuk item ini.' })
    return
  }
  selectedRow.value = row
  checklistState.value = Object.fromEntries(
    filteredChecklist.value.map((item) => [
      item.id,
      row.checklist_results?.some?.((result) => result.id === item.id && result.checked) || false,
    ]),
  )
  qtyApprovedInput.value = 0
  qtyReject.value = 0
  qcNote.value = row.catatan_qc || ''
  rejectPhotoFile.value = null
  qcDialog.value = true
}

const normalizeFilterValue = (value) => String(value || '').trim().toLowerCase()

const scopeMatches = (masterValue, rowValue) => {
  const master = normalizeFilterValue(masterValue)
  const current = normalizeFilterValue(rowValue)
  if (!master) return true
  if (!current) return false
  return master === current || master.includes(current) || current.includes(master)
}

const filteredChecklist = computed(() => {
  const departemenId =
    selectedRow.value?.departemen_id ||
    selectedRow.value?.departemen_path_id ||
    selectedRow.value?.current_departemen_id ||
    selectedRow.value?.tujuan_departemen?.id ||
    ''
  const kategoriId =
    selectedRow.value?.kategori_id ||
    selectedRow.value?.kategori_produk_id ||
    selectedRow.value?.kategori_barang_id ||
    ''
  const departemenText = selectedRow.value?.departemen_asal || selectedRow.value?.departemen || ''
  const kategoriText =
    selectedRow.value?.kategori_produk ||
    selectedRow.value?.kategori ||
    selectedRow.value?.kategori_barang ||
    selectedRow.value?.jenis_produk ||
    ''

  const matched = masterQcChecklist.value.filter((item) => {
    const departemenMatch = item.departemen_id
      ? item.departemen_id === departemenId
      : scopeMatches(item.departemen_terkait, departemenText)
    const kategoriMatch = item.kategori_id
      ? item.kategori_id === kategoriId
      : scopeMatches(item.kategori_produk, kategoriText)
    return departemenMatch && kategoriMatch
  })

  return matched.sort((a, b) => Number(a.urutan_checklist || 0) - Number(b.urutan_checklist || 0))
})

const updateQcWorkflowStatus = async (row, payload, successMessage) => {
  if (!row?.id) return
  updatingId.value = row.id
  try {
    const productionSourceId = row.production_source_id || row.production_id || row.source_id || ''
    const productionRef = productionSourceId ? doc(db, PRODUCTION_COLLECTION, productionSourceId) : null
    const productionSnap = productionRef ? await getDoc(productionRef) : null
    const batch = writeBatch(db)
    batch.update(doc(db, COLLECTION_NAME, row.id), {
      qty_produksi_awal: qtyProduksiAwalFrom(row),
      qty_approved: qtyApprovedFrom(row),
      qty_approved_qc: qtyApprovedFrom(row),
      ...payload,
      updated_at: serverTimestamp(),
    })

    if (row.rework_queue_id) {
      batch.set(
        doc(db, PRODUCTION_REWORK_QUEUE_COLLECTION, row.rework_queue_id),
        {
          qc_queue_id: row.id,
          production_source_id: row.production_source_id || row.production_id || row.source_id || row.id || '',
          no_spk: row.no_spk || row.nomor_spk || '',
          nomor_spk: row.nomor_spk || row.no_spk || '',
          nama_produk: row.nama_produk || '',
          produk: row.nama_produk || '',
          kode_produk: row.kode_produk || '',
          departemen_asal: row.departemen_asal || '',
          departemen_id: row.departemen_id || '',
          qty_produksi_awal: qtyProduksiAwalFrom(row),
          qty_approved: qtyApprovedFrom(row),
          qty_passed: qtyApprovedFrom(row),
          qty_rework: Number(row.qty_rework || row.qty_reject || 0),
          qty_reject: Number(row.qty_reject || 0),
          status_qc: payload.status_qc || row.status_qc || '',
          status_rework: payload.status_rework || row.status_rework || '',
          updated_at: serverTimestamp(),
        },
        { merge: true },
      )
    }

    if (productionRef && productionSnap?.exists()) {
      batch.update(productionRef, {
        status_produksi: payload.status_qc === 're_qc' ? 'pending_qc_ulang' : payload.status_qc || row.status_qc,
        status: payload.status_qc === 're_qc' ? 'pending_qc_ulang' : payload.status_qc || row.status_qc,
        status_qc: payload.status_qc || row.status_qc,
        qty_approved_qc: qtyApprovedFrom(row),
        qty_rework_qc: Number(row.qty_rework || row.qty_reject || 0),
        qty_reject_qc: Number(row.qty_reject || 0),
        updated_at: serverTimestamp(),
      })
    }

    await batch.commit()
    $q.notify({ type: 'positive', message: successMessage })
  } catch (error) {
    console.error('[QCProduksi] Gagal mengubah workflow QC', { row, payload, error })
    $q.notify({ type: 'negative', message: 'Gagal mengubah workflow QC.' })
  } finally {
    updatingId.value = null
  }
}

const sendToRework = (row) =>
  updateQcWorkflowStatus(
    row,
    {
      status_qc: 'rework',
      status_rework: 'menunggu_rework',
      qty_rework: Number(row.qty_rework || row.qty_reject || 0),
    },
    'Barang reject dikirim ke antrean rework.',
  )

const finishRework = (row) =>
  updateQcWorkflowStatus(
    row,
    {
      status_qc: 're_qc',
      status_rework: 'pending_qc_ulang',
      qty_rework: Number(row.qty_rework || row.qty_reject || 0),
      qty_pending_qc: Number(row.qty_rework || row.qty_reject || 0),
      rework_finished_at: serverTimestamp(),
    },
    'Rework selesai dan masuk antrean QC ulang.',
  )

const submitQcAction = async () => {
  if (!selectedRow.value?.id) return
  const qtyProduksi = qtyProduksiAwalFrom(selectedRow.value)
  const currentStatus = normalizeQcStatus(selectedRow.value.status_qc)
  if (currentStatus === 'selesai' || qtyPendingQcFrom(selectedRow.value) <= 0) {
    $q.notify({ type: 'warning', message: 'QC sudah selesai untuk item ini.' })
    return
  }

  let isReQc = currentStatus === 're_qc'
  let currentQtyApproved = qtyApprovedFrom(selectedRow.value)
  let currentQtyReject = Number(selectedRow.value.qty_reject || 0)
  let currentQtyRework = Number(selectedRow.value.qty_rework || 0)
  let currentQtyPendingQc = qtyPendingQcFrom(selectedRow.value)
  const inputQtyApproved = Number(qtyApprovedInput.value || 0)
  const inputQtyReject = Number(qtyReject.value || 0)
  const qtyChecked = inputQtyApproved + inputQtyReject

  if ([inputQtyApproved, inputQtyReject].some((qty) => qty < 0)) {
    $q.notify({
      type: 'warning',
      message: 'Qty QC tidak boleh kurang dari 0.',
    })
    return
  }

  if (qtyChecked <= 0) {
    $q.notify({
      type: 'warning',
      message: 'Qty approved atau reject wajib diisi.',
    })
    return
  }

  if (qtyChecked > currentQtyPendingQc) {
    $q.notify({
      type: 'warning',
      message: 'Qty QC melebihi sisa pending QC',
    })
    return
  }

  let nextQtyPendingQc = Math.max(0, currentQtyPendingQc - qtyChecked)
  let nextQtyApproved = currentQtyApproved + inputQtyApproved
  let nextQtyReject = isReQc
    ? Math.max(0, currentQtyReject - qtyChecked + inputQtyReject)
    : currentQtyReject + inputQtyReject
  let nextQtyRework = isReQc
    ? Math.max(0, currentQtyRework - qtyChecked + inputQtyReject + nextQtyPendingQc)
    : currentQtyRework + inputQtyReject
  let nextStatus = nextQtyPendingQc === 0 ? 'selesai' : isReQc ? 're_qc' : 'pending_qc'
  let monitoringStatus = nextStatus === 'selesai' ? 'qc_selesai' : nextStatus
  let hasRejectOrRework = nextQtyRework > 0

  const checklistResults = filteredChecklist.value.map((item) => ({
    id: item.id,
    kode_qc: item.kode_qc || '',
    nama_pengecekan: item.nama_pengecekan || '',
    parameter: item.parameter || '',
    toleransi: item.toleransi || '',
    satuan_id: item.satuan_id || '',
    departemen_id: item.departemen_id || '',
    kategori_id: item.kategori_id || '',
    tipe_pemeriksaan: item.tipe_pemeriksaan || '',
    wajib_foto_reject: !!item.wajib_foto_reject,
    urutan_checklist: Number(item.urutan_checklist || 0),
    checked: !!checklistState.value[item.id],
  }))
  const allChecklistPassed = checklistResults.length
    ? checklistResults.every((item) => item.checked)
    : true
  if (!allChecklistPassed && inputQtyReject <= 0) {
    $q.notify({
      type: 'warning',
      message: 'Checklist belum lolos. Isi Qty Reject untuk barang yang tidak lolos QC.',
    })
    return
  }

  const productionSourceId =
    selectedRow.value.production_source_id ||
    selectedRow.value.production_id ||
    selectedRow.value.source_id ||
    selectedRow.value.id ||
    ''
  let reworkQueueId = selectedRow.value.rework_queue_id || ''
  updatingId.value = selectedRow.value.id

  try {
    const rejectPhotoBase64 = await fileToBase64(rejectPhotoFile.value)
    const relation = await resolveProductionRelation(selectedRow.value)
    const qcRef = doc(db, COLLECTION_NAME, selectedRow.value.id)
    const qcSnap = await getDoc(qcRef)
    const freshRow = qcSnap.exists() ? { ...selectedRow.value, ...qcSnap.data() } : selectedRow.value
    const freshStatus = normalizeQcStatus(freshRow.status_qc)
    currentQtyPendingQc = qtyPendingQcFrom(freshRow)
    if (freshStatus === 'selesai' || currentQtyPendingQc <= 0) {
      $q.notify({ type: 'warning', message: 'QC sudah selesai untuk item ini.' })
      return
    }
    if (qtyChecked > currentQtyPendingQc) {
      $q.notify({ type: 'warning', message: 'Qty QC melebihi sisa pending QC' })
      return
    }

    isReQc = freshStatus === 're_qc'
    currentQtyApproved = qtyApprovedFrom(freshRow)
    currentQtyReject = Number(freshRow.qty_reject || 0)
    currentQtyRework = Number(freshRow.qty_rework || 0)
    nextQtyPendingQc = Math.max(0, currentQtyPendingQc - qtyChecked)
    nextQtyApproved = currentQtyApproved + inputQtyApproved
    nextQtyReject = isReQc
      ? Math.max(0, currentQtyReject - qtyChecked + inputQtyReject)
      : currentQtyReject + inputQtyReject
    nextQtyRework = isReQc
      ? Math.max(0, currentQtyRework - qtyChecked + inputQtyReject + nextQtyPendingQc)
      : currentQtyRework + inputQtyReject
    nextStatus = nextQtyPendingQc === 0 ? 'selesai' : isReQc ? 're_qc' : 'pending_qc'
    monitoringStatus = nextStatus === 'selesai' ? 'qc_selesai' : nextStatus
    hasRejectOrRework = nextQtyRework > 0
    const statusForStorage = nextStatus === 'selesai' ? 'SELESAI' : nextStatus
    const previousApproved = qcSnap.exists() ? qtyApprovedFrom(qcSnap.data()) : currentQtyApproved
    const approvedDelta = Math.max(0, nextQtyApproved - previousApproved)
    const newReworkRef =
      hasRejectOrRework && !reworkQueueId ? doc(collection(db, PRODUCTION_REWORK_QUEUE_COLLECTION)) : null
    if (newReworkRef) reworkQueueId = newReworkRef.id
    const qcPayload = {
      no_spk: selectedRow.value.no_spk || selectedRow.value.nomor_spk || '',
      nomor_spk: selectedRow.value.nomor_spk || selectedRow.value.no_spk || '',
      nomor_po: relation.nomor_po || '',
      customer: relation.customer || '',
      customer_nama: relation.customer || '',
      customer_id: relation.customer_id || null,
      po_id: relation.po_id || null,
      po_source_collection: relation.po_source_collection || PO_CUSTOMER_COLLECTION,
      po_source_document_id: relation.po_source_document_id || relation.po_id || null,
      nama_produk: selectedRow.value.nama_produk || '',
      kode_produk: selectedRow.value.kode_produk || '',
      produk_id: selectedRow.value.produk_id || '',
      departemen_asal: selectedRow.value.departemen_asal || '',
      departemen_id: selectedRow.value.departemen_id || '',
      kategori_id: selectedRow.value.kategori_id || '',
      kategori_produk: selectedRow.value.kategori_produk || selectedRow.value.kategori || '',
      operator: selectedRow.value.operator || '',
      qty_produksi_awal: qtyProduksi,
      qty_produksi: qtyProduksi,
      qty_pending_qc: nextQtyPendingQc,
      qty_checked: qtyChecked,
      status_qc: statusForStorage,
      status_rework: hasRejectOrRework ? 'menunggu_rework' : 'selesai',
      rework_queue_id: reworkQueueId,
      checklist_results: checklistResults,
      qty_approved: nextQtyApproved,
      qty_approved_qc: nextQtyApproved,
      qty_passed: nextQtyApproved,
      qty_lolos: nextQtyApproved,
      qty_rework: nextQtyRework,
      qty_reject: nextQtyReject,
      checker_qc: currentCheckerName.value,
      catatan_qc: qcNote.value,
      foto_reject_base64: rejectPhotoBase64 || selectedRow.value.foto_reject_base64 || '',
      tanggal_qc: serverTimestamp(),
      updated_at: serverTimestamp(),
    }

    const batch = writeBatch(db)
    batch.set(
      qcRef,
      qcSnap.exists()
        ? qcPayload
        : {
            ...qcPayload,
            production_source_id: productionSourceId,
            source_type: selectedRow.value.source_type || 'production',
            created_at: serverTimestamp(),
          },
      { merge: true },
    )

    if (reworkQueueId) {
      const reworkRef = doc(db, PRODUCTION_REWORK_QUEUE_COLLECTION, reworkQueueId)
      const reworkSnap = await getDoc(reworkRef)
      if (reworkSnap.exists()) {
        batch.update(reworkRef, {
          status_rework: nextQtyRework > 0 ? 'menunggu_rework' : 'selesai',
          qc_ulang_result_id: selectedRow.value.id,
          qc_ulang_status: nextStatus,
          qty_pending_qc: nextQtyPendingQc,
          qty_approved: nextQtyApproved,
          qty_passed: nextQtyApproved,
          qty_rework: nextQtyRework,
          qty_reject: nextQtyReject,
          completed_at: nextQtyRework <= 0 ? serverTimestamp() : null,
          updated_at: serverTimestamp(),
        })
      }
    }

    if (productionSourceId) {
      const productionRef = doc(db, PRODUCTION_COLLECTION, productionSourceId)
      const productionSnap = await getDoc(productionRef)
      if (productionSnap.exists()) {
        batch.update(productionRef, {
          status_produksi: nextStatus === 'selesai' ? 'qc_selesai' : monitoringStatus,
          status: nextStatus === 'selesai' ? 'qc_selesai' : monitoringStatus,
          status_qc: monitoringStatus,
          qty_pending_qc: nextQtyPendingQc,
          qty_good: nextQtyApproved,
          qty_reject: nextQtyReject,
          qty_lolos_qc: nextQtyApproved,
          qty_passed_qc: nextQtyApproved,
          qty_approved_qc: nextQtyApproved,
          qty_rework_qc: nextQtyRework,
          qty_reject_qc: nextQtyReject,
          qc_queue_id: selectedRow.value.id,
          qc_checked_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        })
      }
    }

    if (nextQtyApproved > 0) {
      const fgId = selectedRow.value.produk_id || selectedRow.value.kode_produk || selectedRow.value.id
      if (approvedDelta > 0) {
        batch.set(
          doc(db, FINISHED_GOODS_COLLECTION, fgId),
          {
            nama: selectedRow.value.nama_produk || '',
            nama_barang: selectedRow.value.nama_produk || '',
            kode: selectedRow.value.kode_produk || fgId,
            kode_barang: selectedRow.value.kode_produk || fgId,
            jenis_material: 'bahan_jadi',
            tipe_material: 'bahan_jadi',
            kategori: 'bahan_jadi',
            satuan: selectedRow.value.satuan || 'Unit',
            stok_tersedia: increment(approvedDelta),
            stok: increment(approvedDelta),
            updated_at: serverTimestamp(),
          },
          { merge: true },
        )
      }

      const packingRef = doc(db, PACKING_COLLECTION, selectedRow.value.id)
      const packingSnap = await getDoc(packingRef)
      const currentPacking = packingSnap.exists() ? packingSnap.data() : {}
      const currentPackingQty = Number(currentPacking.qty_packing || 0)

      batch.set(
        packingRef,
        {
          qc_queue_id: selectedRow.value.id,
          production_source_id: productionSourceId,
          nomor_spk: selectedRow.value.nomor_spk || selectedRow.value.no_spk || '',
          no_spk: selectedRow.value.no_spk || selectedRow.value.nomor_spk || '',
          nomor_po: relation.nomor_po || '',
          nama_produk: selectedRow.value.nama_produk || selectedRow.value.produk || '',
          kode_produk: selectedRow.value.kode_produk || '',
          produk_id: selectedRow.value.produk_id || '',
          customer: relation.customer || '',
          customer_nama: relation.customer || '',
          customer_id: relation.customer_id || null,
          po_id: relation.po_id || null,
          po_source_collection: relation.po_source_collection || PO_CUSTOMER_COLLECTION,
          po_source_document_id: relation.po_source_document_id || relation.po_id || null,
          qty_approved_qc: nextQtyApproved,
          qty_approved: nextQtyApproved,
          qty_reject: nextQtyReject,
          departemen:
            selectedRow.value.departemen_asal ||
            selectedRow.value.departemen ||
            selectedRow.value.tujuan_departemen?.nama_departemen ||
            '',
          departemen_asal:
            selectedRow.value.departemen_asal ||
            selectedRow.value.departemen ||
            selectedRow.value.tujuan_departemen?.nama_departemen ||
            '',
          departemen_id:
            selectedRow.value.departemen_id ||
            selectedRow.value.tujuan_departemen?.id ||
            '',
          operator: selectedRow.value.operator || '',
          tanggal_produksi:
            selectedRow.value.tanggal_produksi ||
            selectedRow.value.tanggal_finish ||
            selectedRow.value.tanggal_selesai ||
            selectedRow.value.created_at ||
            null,
          tanggal_finish: selectedRow.value.tanggal_finish || null,
          status_qc: 'APPROVED',
          qty_packing: currentPackingQty,
          qty_sisa_packing: Math.max(0, nextQtyApproved - currentPackingQty),
          status_packing: currentPacking.status_packing || 'PENDING_PACKING',
          queue_status: currentPacking.queue_status || 'PACKING_QUEUE',
          source_type: 'qc_approved',
          created_at: currentPacking.created_at || serverTimestamp(),
          updated_at: serverTimestamp(),
        },
        { merge: true },
      )
    }

    if (hasRejectOrRework && newReworkRef) {
      const reworkPayload = {
        qc_queue_id: selectedRow.value.id,
        production_source_id: productionSourceId,
        no_spk: selectedRow.value.no_spk || selectedRow.value.nomor_spk || '',
        nomor_spk: selectedRow.value.nomor_spk || selectedRow.value.no_spk || '',
        produk: selectedRow.value.nama_produk || '',
        nama_produk: selectedRow.value.nama_produk || '',
        kode_produk: selectedRow.value.kode_produk || '',
        departemen_asal: selectedRow.value.departemen_asal || '',
        departemen_id: selectedRow.value.departemen_id || '',
        qty_produksi_awal: qtyProduksi,
        qty_pending_qc: nextQtyPendingQc,
        qty_good: nextQtyApproved,
        qty_approved: nextQtyApproved,
        qty_passed: nextQtyApproved,
        qty_rework: nextQtyRework,
        qty_reject: nextQtyReject,
        satuan: selectedRow.value.satuan || 'Unit',
        alasan_reject: qcNote.value || 'QC Reject: Produk/SPK perlu rework.',
        catatan_qc: `${qcNote.value || ''}${qcNote.value ? '\n' : ''}Perlu perbaikan ulang dari QC`,
        foto_reject_base64: rejectPhotoBase64 || selectedRow.value.foto_reject_base64 || '',
        tanggal_qc: serverTimestamp(),
        tanggal_reject: serverTimestamp(),
        status_rework: 'menunggu_rework',
        status_qc: monitoringStatus,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      }

      batch.set(newReworkRef, reworkPayload)
      batch.set(doc(collection(db, REWORK_COLLECTION)), {
        ...reworkPayload,
        status_rework: nextStatus,
      })

      batch.set(doc(collection(db, DEPARTEMENT_NOTIFICATION_COLLECTION)), {
        type: 'qc_reject',
        title: 'QC Reject',
        message: 'QC Reject: Produk/SPK perlu rework.',
        no_spk: selectedRow.value.no_spk || selectedRow.value.nomor_spk || '',
        produk: selectedRow.value.nama_produk || '',
        departemen_id: selectedRow.value.departemen_id || '',
        departemen_asal: selectedRow.value.departemen_asal || '',
        qc_queue_id: selectedRow.value.id,
        production_source_id: productionSourceId,
        is_read: false,
        status: 'unread',
        created_at: serverTimestamp(),
      })
    }

    await batch.commit()
    qcDialog.value = false
    $q.notify({ type: 'positive', message: `Status QC diperbarui: ${statusLabel(nextStatus)}` })
  } catch (error) {
    console.error(error)
    console.error('[QCProduksi] Gagal menyimpan hasil QC', {
      error,
      selectedRow: selectedRow.value,
      qtyProduksi,
      nextQtyApproved,
      nextQtyRework,
      nextQtyReject,
    })
    Notify.create({
      type: 'negative',
      message: 'Gagal menyimpan hasil QC',
    })
  } finally {
    updatingId.value = null
  }
}

const loadQcRows = () => {
  loading.value = true
  if (unsubscribeQc) unsubscribeQc()

  const qcQuery = query(collection(db, COLLECTION_NAME), orderBy('updated_at', 'desc'))
  unsubscribeQc = onSnapshot(
    qcQuery,
    (snapshot) => {
      rows.value = snapshot.docs.map((qcDoc) => ({
        ...(() => {
          const data = qcDoc.data()
          return {
            id: qcDoc.id,
            status_qc: 'pending_qc',
            qty_produksi_awal: 0,
            qty_pending_qc: 0,
            qty_produksi: 0,
            qty_reject: 0,
            qty_approved: 0,
            qty_approved_qc: 0,
            qty_lolos: 0,
            qty_passed: 0,
            qty_rework: 0,
            ...data,
            nomor_po: nomorPoFrom(data),
            customer: customerNameFrom(data),
          }
        })(),
      }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat QC produksi' })
    },
  )
}

const loadMasterQcChecklist = () => {
  loadingMasterQc.value = true
  unsubscribeMasterQc = onSnapshot(
    query(collection(db, 'master_qc_checklist'), orderBy('nama_pengecekan', 'asc')),
    (snapshot) => {
      masterQcChecklist.value = snapshot.docs
        .map((qcDoc) => ({ id: qcDoc.id, ...qcDoc.data() }))
        .filter((item) => item.status === 'Aktif')
      loadingMasterQc.value = false
    },
    (error) => {
      console.error(error)
      loadingMasterQc.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat master QC checklist' })
    },
  )
}

onMounted(() => {
  loadQcRows()
  loadMasterQcChecklist()
})

onUnmounted(() => {
  if (unsubscribeQc) unsubscribeQc()
  if (unsubscribeMasterQc) unsubscribeMasterQc()
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
.qc-dialog,
.detail-dialog {
  border-color: #dfe8df;
  border-radius: 20px;
  overflow: hidden;
}

.summary-card {
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.summary-card:hover,
.summary-card--active {
  border-color: #1b5e20;
  box-shadow: 0 14px 30px rgba(27, 94, 32, 0.12);
  transform: translateY(-2px);
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

.qc-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}

.sticky-tabs {
  position: sticky;
  top: 0;
  z-index: 3;
}

.sticky-tabs :deep(.q-tab) {
  min-height: 48px;
}

.table-head {
  text-transform: uppercase;
}

.qc-row {
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.qc-row:hover {
  background: rgba(27, 94, 32, 0.04);
}

.note-cell {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-box {
  background: #f8fbf8;
  border: 1px solid #dfe8df;
  border-radius: 12px;
  color: #344054;
  margin-top: 6px;
  min-height: 44px;
  padding: 12px;
  white-space: pre-wrap;
}

.reject-thumb {
  border: 1px solid #dfe8df;
  border-radius: 8px;
  height: 48px;
  width: 64px;
}

.detail-photo {
  background: #f8fbf8;
  border: 1px solid #dfe8df;
  border-radius: 12px;
  height: min(46vh, 360px);
}

.status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  min-width: 112px;
  justify-content: center;
}

.action-btn {
  min-width: 92px;
}

.dialog-header {
  background: #1b5e20;
  color: #ffffff;
  padding: 16px 20px;
}

.qc-dialog {
  height: min(92vh, 760px);
  max-height: min(92vh, 760px);
  max-width: 95vw;
  width: 760px;
}

.detail-dialog {
  max-height: min(92vh, 760px);
  max-width: 95vw;
  width: 760px;
}

.qc-dialog-scroll {
  min-height: 0;
}

.qc-dialog-footer {
  bottom: 0;
  box-shadow: 0 -8px 20px rgba(15, 60, 45, 0.08);
  flex-shrink: 0;
  position: sticky;
  z-index: 2;
}

.detail-label {
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.detail-value {
  color: #1b5e20;
  font-size: 14px;
  font-weight: 900;
  margin-top: 4px;
}

@media (max-width: 1023px) {
  .qc-dialog,
  .detail-dialog {
    border-radius: 0;
    height: 100%;
    max-height: 100%;
    max-width: 100%;
    width: 100%;
  }

  .qc-dialog-footer {
    padding-bottom: max(16px, env(safe-area-inset-bottom)) !important;
  }

  .sticky-tabs {
    top: 0;
  }
}

@media (max-width: 599px) {
  .sticky-tabs :deep(.q-tab) {
    min-width: 132px;
  }

  .summary-value {
    font-size: 26px;
  }
}
</style>
