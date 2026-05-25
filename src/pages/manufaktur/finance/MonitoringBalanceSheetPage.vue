<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-lg-lg font-pro page-wrapper" @click.self="handlePageClick">
    <!-- FLOATING CONSTRUCTION ICONS CONTAINER -->
    <div class="floating-icons-container" aria-hidden="true">
      <span
        v-for="icon in floatingIcons"
        :key="icon.id"
        class="floating-icon"
        :style="icon.style"
        v-html="icon.svg"
      ></span>
    </div>

    <!-- CLICK EFFECT CONSTRUCTIONS ICONS -->
    <div class="click-icons-container" aria-hidden="true">
      <span
        v-for="ci in clickIcons"
        :key="ci.id"
        class="click-icon"
        :style="{
          left: ci.x + 'px',
          top: ci.y + 'px',
          '--tx': ci.tx + 'px',
          '--ty': ci.ty + 'px',
          width: ci.size + 'px',
          height: ci.size + 'px',
        }"
        v-html="ci.svg"
      ></span>
    </div>

    <!-- =====================================================================================
         HEADER SECTION (TOMBOL KEMBALI DIHAPUS)
         ===================================================================================== -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print content-relative">
      <div class="col-12 col-md-8">
        <div class="row items-center no-wrap">
          <div>
            <div class="text-h4 text-weight-bolder text-teal-10 leading-tight">
              Monitoring Balansheet
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Profit & Loss / Neraca Keuangan Proyek</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Rekapitulasi otomatis nilai kontrak, biaya aktual, hutang berjalan, dan proyeksi laba
              kotor.
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none text-right">
        <div class="text-caption text-grey-6 q-mb-xs uppercase tracking-widest font-bold">
          Engine Status
        </div>
        <q-badge color="teal-10" class="q-px-md q-py-xs text-weight-bold shadow-2 rounded-12">
          <q-icon name="auto_graph" size="xs" class="q-mr-sm" />
          CALCULATING LIVE
        </q-badge>
      </div>
    </div>

    <!-- =====================================================================================
         SUMMARY CARDS / KPI BALANSHEET (FULL GRADIENT WARNA-WARNI INDAH)
         ===================================================================================== -->
    <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print content-relative">
      <!-- Total Nilai Kontrak (Revenue) (Blue Gradient) -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card
          flat
          class="list-card rounded-20 card-blue-gradient text-white transition-all hover-shadow"
        >
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-overline leading-none text-weight-bold tracking-widest"
                style="color: rgba(255, 255, 255, 0.85)"
              >
                TOTAL KONTRAK (REVENUE)
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs text-white">
                Rp {{ formatCompact(kpi.totalKontrak) }}
              </div>
            </div>
            <div
              class="bg-white q-pa-md rounded-borders shadow-sm"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="request_quote" color="blue-8" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Estimasi Modal (RAB) (Orange Gradient) -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card
          flat
          class="list-card rounded-20 card-orange-gradient text-white transition-all hover-shadow"
        >
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-overline leading-none text-weight-bold tracking-widest"
                style="color: rgba(255, 255, 255, 0.85)"
              >
                ESTIMASI MODAL (RAB)
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs text-white">
                Rp {{ formatCompact(kpi.estimasiModal) }}
              </div>
            </div>
            <div
              class="bg-white q-pa-md rounded-borders shadow-sm"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="engineering" color="orange-9" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Pengeluaran Aktual (Red Gradient) -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card
          flat
          class="list-card rounded-20 card-red-gradient text-white transition-all hover-shadow"
        >
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-overline leading-none text-weight-bold tracking-widest"
                style="color: rgba(255, 255, 255, 0.85)"
              >
                PENGELUARAN AKTUAL
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs text-white">
                Rp {{ formatCompact(kpi.actualCost) }}
              </div>
            </div>
            <div
              class="bg-white q-pa-md rounded-borders shadow-sm"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="payments" color="red-9" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Laba Kotor (Gross Profit) (Teal Gradient) -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card
          flat
          class="list-card rounded-20 card-teal-gradient text-white transition-all hover-shadow"
        >
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-overline leading-none text-weight-bold tracking-widest"
                style="color: rgba(255, 255, 255, 0.85)"
              >
                PROYEKSI LABA KOTOR
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs text-white">
                Rp {{ formatCompact(kpi.estimasiProfit) }}
              </div>
            </div>
            <div
              class="bg-white q-pa-md rounded-borders shadow-2"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="insights" color="teal-8" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- =====================================================================================
         SEARCH & FILTER AREA
         ===================================================================================== -->
    <q-card
      flat
      bordered
      class="q-mb-lg shadow-1 rounded-20 bg-white no-print border-teal-thin content-relative"
    >
      <q-card-section class="q-py-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchQuery"
              outlined
              dense
              rounded
              placeholder="Cari Nama Proyek atau Klien..."
              bg-color="white"
              class="search-input"
              color="teal-10"
            >
              <template v-slot:prepend><q-icon name="search" color="teal-10" /></template>
              <template v-slot:append v-if="searchQuery">
                <q-icon name="close" @click="searchQuery = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
          <q-space />
          <div
            class="col-12 col-md-auto text-caption text-grey-6 text-weight-bold tracking-widest uppercase"
          >
            {{ combinedData.length }} Proyek Terevaluasi
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- =====================================================================================
         MAIN TABLE DATA (NERACA PROYEK)
         ===================================================================================== -->
    <q-card
      flat
      bordered
      class="rounded-20 shadow-sm overflow-hidden bg-white no-print border-teal-thin content-relative"
    >
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        binary-state-sort
        class="finance-table"
        :pagination="{ rowsPerPage: 15 }"
        no-data-label="Data finansial proyek tidak ditemukan."
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="table-header-teal text-white">
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
            @click="openDetail(props.row)"
          >
            <q-td key="proyek">
              <div class="text-weight-bold text-blue-grey-10 text-subtitle2 leading-none q-mb-xs">
                {{ props.row.nama }}
              </div>
              <div class="text-caption text-grey-6 uppercase font-10 text-weight-bold">
                KLIEN: {{ props.row.konsumen || 'INTERNAL' }}
              </div>
            </q-td>

            <q-td key="revenue" class="text-right">
              <div class="text-weight-black text-teal-10 text-subtitle2">
                Rp {{ (props.row.total_kontrak || 0).toLocaleString() }}
              </div>
              <div class="text-caption text-grey-6 font-10">Dari {{ props.row.spkCount }} SPK</div>
            </q-td>

            <q-td key="cost" class="text-right">
              <div class="text-weight-bold text-red-9">
                Rp {{ (props.row.actual_cost || 0).toLocaleString() }}
              </div>
              <div class="text-caption text-grey-6 font-10">Realisasi & Hutang</div>
            </q-td>

            <q-td key="profit" class="text-right">
              <div
                class="text-weight-black text-subtitle1"
                :class="props.row.estimasi_profit >= 0 ? 'text-teal-9' : 'text-negative'"
              >
                Rp {{ (props.row.estimasi_profit || 0).toLocaleString() }}
              </div>
            </q-td>

            <q-td key="margin" style="width: 200px">
              <div class="row items-center justify-between font-10 text-weight-bold q-mb-xs">
                <span class="text-grey-7">Margin Target</span>
                <span :class="getMarginPercent(props.row) >= 0 ? 'text-teal-9' : 'text-negative'">
                  {{ getMarginPercent(props.row) }}%
                </span>
              </div>
              <q-linear-progress
                :value="getMarginValue(props.row)"
                size="8px"
                rounded
                :color="getMarginPercent(props.row) >= 0 ? 'teal-10' : 'negative'"
                track-color="grey-3"
              />
            </q-td>

            <q-td key="aksi" class="text-center" @click.stop>
              <q-btn
                flat
                round
                color="teal-10"
                icon="query_stats"
                size="sm"
                @click="openDetail(props.row)"
              >
                <q-tooltip>Analisis Mendalam</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- =====================================================================================
         DIALOG DETAIL BALANSHEET PER PROYEK (FULLSCREEN)
         ===================================================================================== -->
    <q-dialog
      v-model="showDetail"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      backdrop-filter="blur(8px)"
    >
      <q-card class="bg-grey-2 column no-wrap font-pro">
        <q-toolbar class="bg-teal-10 text-white q-py-md shadow-4 shrink no-print">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title>
            <div class="text-weight-bold uppercase tracking-widest font-11">
              Rincian Finansial & Arus Kas
            </div>
            <div class="text-caption opacity-70">Proyek: {{ selectedProject?.nama }}</div>
          </q-toolbar-title>
        </q-toolbar>

        <q-scroll-area class="col q-pa-md q-pa-lg-xl">
          <div class="row justify-center" v-if="selectedProject">
            <div class="col-12 col-xl-10">
              <!-- IDENTITAS PROYEK -->
              <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1 border-teal-thin">
                <q-card-section class="q-pa-lg row items-center justify-between">
                  <div>
                    <div class="text-h4 text-weight-black text-teal-10">
                      {{ selectedProject.nama }}
                    </div>
                    <div
                      class="text-subtitle1 text-grey-7 text-weight-bold uppercase tracking-widest q-mt-xs"
                    >
                      Klien: {{ selectedProject.konsumen || 'Internal' }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div
                      class="text-caption text-grey-6 uppercase tracking-widest font-bold q-mb-xs"
                    >
                      Progres Fisik Pekerjaan
                    </div>
                    <div class="text-h5 text-weight-black text-teal-10">
                      {{ selectedProject.progress || 0 }}%
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <div class="row q-col-gutter-lg items-stretch q-mb-xl">
                <!-- CHART BAR VISUALISASI KEUANGAN -->
                <div class="col-12 col-md-5">
                  <q-card
                    flat
                    bordered
                    class="rounded-20 full-height bg-white shadow-1 border-teal-thin"
                  >
                    <q-card-section
                      class="bg-teal-1 q-py-sm text-teal-10 text-weight-bold flex items-center border-bottom-subtle"
                    >
                      <q-icon name="donut_large" class="q-mr-xs" size="sm" /> KOMPOSISI NERACA
                      KEUANGAN
                    </q-card-section>
                    <q-card-section class="q-pa-lg">
                      <!-- Revenue -->
                      <div class="q-mb-md">
                        <div class="row justify-between items-end q-mb-xs">
                          <span
                            class="text-caption text-weight-bold text-teal-10 uppercase tracking-widest font-10"
                            >Nilai Kontrak (Revenue)</span
                          >
                          <span class="text-weight-bold text-teal-10"
                            >Rp {{ (selectedProject.total_kontrak || 0).toLocaleString() }}</span
                          >
                        </div>
                        <q-linear-progress :value="1" size="16px" rounded color="teal-10" />
                      </div>

                      <!-- RAB -->
                      <div class="q-mb-md">
                        <div class="row justify-between items-end q-mb-xs">
                          <span
                            class="text-caption text-weight-bold text-orange-9 uppercase tracking-widest font-10"
                            >Estimasi Modal (RAB)</span
                          >
                          <span class="text-weight-bold text-orange-9"
                            >Rp {{ (selectedProject.estimasi_modal || 0).toLocaleString() }}</span
                          >
                        </div>
                        <q-linear-progress
                          :value="
                            selectedProject.total_kontrak
                              ? selectedProject.estimasi_modal / selectedProject.total_kontrak
                              : 0
                          "
                          size="16px"
                          rounded
                          color="orange-9"
                          track-color="grey-2"
                        />
                      </div>

                      <!-- Actual Cost (Cash Out + AP) -->
                      <div class="q-mb-md">
                        <div class="row justify-between items-end q-mb-xs">
                          <span
                            class="text-caption text-weight-bold text-red-9 uppercase tracking-widest font-10"
                            >Pengeluaran Aktual & Hutang</span
                          >
                          <span class="text-weight-bold text-red-9"
                            >Rp {{ (selectedProject.actual_cost || 0).toLocaleString() }}</span
                          >
                        </div>
                        <q-linear-progress
                          :value="
                            selectedProject.total_kontrak
                              ? selectedProject.actual_cost / selectedProject.total_kontrak
                              : 0
                          "
                          size="16px"
                          rounded
                          color="red-9"
                          track-color="grey-2"
                        />
                      </div>

                      <q-separator class="q-my-lg border-subtle" />

                      <!-- Margin Profit -->
                      <div>
                        <div class="row justify-between items-end q-mb-xs">
                          <span
                            class="text-caption text-weight-black text-teal-10 uppercase tracking-widest font-10"
                            >Proyeksi Laba Kotor</span
                          >
                          <span class="text-h6 text-weight-black text-teal-10"
                            >Rp {{ (selectedProject.estimasi_profit || 0).toLocaleString() }}</span
                          >
                        </div>
                        <q-linear-progress
                          :value="getMarginValue(selectedProject)"
                          size="20px"
                          rounded
                          color="teal-10"
                          track-color="grey-3"
                        />
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- RINCIAN DANA & HUTANG -->
                <div class="col-12 col-md-7">
                  <q-card
                    flat
                    bordered
                    class="rounded-20 full-height bg-white shadow-1 border-teal-thin"
                  >
                    <q-card-section
                      class="bg-teal-1 q-py-sm text-teal-10 text-weight-bold flex items-center border-bottom-subtle"
                    >
                      <q-icon name="receipt_long" class="q-mr-xs" size="sm" /> KONSOLIDASI TAGIHAN &
                      KAS
                    </q-card-section>
                    <q-card-section class="q-pa-lg q-gutter-y-lg">
                      <div
                        class="bg-grey-1 q-pa-md rounded-12 border-subtle flex items-center justify-between"
                      >
                        <div class="row items-center">
                          <q-avatar
                            color="red-1"
                            text-color="negative"
                            icon="account_balance_wallet"
                            class="q-mr-md"
                          />
                          <div>
                            <div class="text-weight-bold text-blue-grey-10">
                              Dana Kas Keluar (Dibayarkan)
                            </div>
                            <div class="text-caption text-grey-7">
                              Total pembayaran vendor via sistem
                            </div>
                          </div>
                        </div>
                        <div class="text-h6 text-weight-black text-negative">
                          Rp {{ (selectedProject.pengeluaran_aktual || 0).toLocaleString() }}
                        </div>
                      </div>

                      <div
                        class="bg-grey-1 q-pa-md rounded-12 border-subtle flex items-center justify-between"
                      >
                        <div class="row items-center">
                          <q-avatar
                            color="orange-1"
                            text-color="orange-10"
                            icon="pending_actions"
                            class="q-mr-md"
                          />
                          <div>
                            <div class="text-weight-bold text-blue-grey-10">
                              Account Payable (Hutang Berjalan)
                            </div>
                            <div class="text-caption text-grey-7">
                              Tagihan supplier belum dilunasi
                            </div>
                          </div>
                        </div>
                        <div class="text-h6 text-weight-black text-orange-10">
                          Rp {{ (selectedProject.hutang_berjalan || 0).toLocaleString() }}
                        </div>
                      </div>

                      <div
                        class="bg-teal-1 q-pa-md rounded-12 border-teal-thin flex items-center justify-between"
                      >
                        <div class="row items-center">
                          <q-avatar
                            color="white"
                            text-color="teal-10"
                            icon="savings"
                            class="q-mr-md shadow-1"
                          />
                          <div>
                            <div class="text-weight-bold text-teal-10">
                              Sisa Anggaran Proyek (Budget)
                            </div>
                            <div class="text-caption text-teal-8">
                              Kontrak - (Kas Keluar + Hutang)
                            </div>
                          </div>
                        </div>
                        <div class="text-h5 text-weight-black text-teal-10">
                          Rp {{ (selectedProject.sisa_budget || 0).toLocaleString() }}
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <!-- DAFTAR SPK TERKAIT -->
              <q-card
                flat
                bordered
                class="rounded-20 bg-white shadow-1 overflow-hidden border-teal-thin"
              >
                <q-card-section
                  class="bg-teal-10 q-py-sm text-white text-weight-bold flex items-center"
                >
                  <q-icon name="contract" class="q-mr-xs" size="sm" /> SUMBER REVENUE (DAFTAR SPK /
                  KONTRAK)
                </q-card-section>
                <q-markup-table flat separator="cell" class="document-table bg-white">
                  <thead>
                    <tr class="bg-grey-2 text-blue-grey-9 text-bold uppercase font-10">
                      <th class="text-left">NOMOR SPK / KONTRAK</th>
                      <th class="text-left">NAMA PEKERJAAN</th>
                      <th class="text-right">DURASI KONTRAK</th>
                      <th class="text-right">NILAI (REVENUE)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="spk in selectedProject.spk_list" :key="spk.id">
                      <td class="text-weight-bold text-teal-10">{{ spk.nomor_spk }}</td>
                      <td class="text-weight-medium uppercase">{{ spk.nama_kontrak }}</td>
                      <td class="text-right text-grey-7">{{ spk.durasi || '-' }}</td>
                      <td class="text-right text-weight-bold text-teal-10">
                        Rp {{ (spk.nilai_total || 0).toLocaleString() }}
                      </td>
                    </tr>
                    <tr v-if="!selectedProject.spk_list?.length">
                      <td colspan="4" class="text-center q-pa-lg text-grey-5 italic">
                        Belum ada kontrak SPK terdaftar.
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </q-card>

              <div class="q-py-xl"></div>
            </div>
          </div>
        </q-scroll-area>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
/* eslint-disable */
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, onSnapshot, doc, getDocs, query, where } from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

// State Mentah dari Database
const rawProyek = ref([])
const rawSpk = ref([])
const rawTagihan = ref([])
const rawPengeluaran = ref([])

const loading = ref(true)
const searchQuery = ref('')
const showDetail = ref(false)
const selectedProject = ref(null)

let unsubProyek = null
let unsubSpk = null
let unsubTagihan = null
let unsubPengeluaran = null

const columns = [
  { name: 'proyek', align: 'left', label: 'IDENTITAS PROYEK', field: 'nama', sortable: true },
  {
    name: 'revenue',
    align: 'right',
    label: 'REVENUE (KONTRAK)',
    field: 'total_kontrak',
    sortable: true,
  },
  { name: 'cost', align: 'right', label: 'ACTUAL COST', field: 'actual_cost', sortable: true },
  {
    name: 'profit',
    align: 'right',
    label: 'GROSS PROFIT',
    field: 'estimasi_profit',
    sortable: true,
  },
  { name: 'margin', align: 'center', label: 'MARGIN (%)', field: 'margin', sortable: false },
  { name: 'aksi', align: 'center', label: 'DETAIL', field: 'id' },
]

// High-fidelity SVG Vector definitions (Teal & Orange colored templates)
const getConstructionSvg = (index) => {
  const svgs = [
    `<svg viewBox="0 0 100 100" style="width: 100%; height: 100%;"><path d="M25,45 C25,25 75,25 75,45 Z" fill="#009688" /><rect x="18" y="42" width="64" height="6" rx="3" fill="#f59e0b" /><path d="M47,20 L53,20 L53,32 L47,32 Z" fill="#f59e0b" /><circle cx="50" cy="58" r="15" fill="#e0f2f1" /><circle cx="76" cy="65" r="9" fill="none" stroke="#ff781e" stroke-width="2.5" stroke-dasharray="3,1.5" /><path d="M28,82 C28,70 72,70 72,82 L72,92 L28,92 Z" fill="#00796b" /></svg>`,
    `<svg viewBox="0 0 100 100" style="width: 100%; height: 100%;"><circle cx="50" cy="15" r="7" fill="#ff781e" /><line x1="50" y1="15" x2="32" y2="86" stroke="#ff781e" stroke-width="5.5" stroke-linecap="round" /><line x1="50" y1="15" x2="68" y2="86" stroke="#ff781e" stroke-width="5.5" stroke-linecap="round" /><line x1="38" y1="52" x2="62" y2="52" stroke="#009688" stroke-width="4.5" stroke-linecap="round" /></svg>`,
    `<svg viewBox="0 0 100 100" style="width: 100%; height: 100%;"><rect x="25" y="12" width="50" height="78" rx="6" fill="#0d9488" /><rect x="34" y="22" width="11" height="11" rx="2" fill="#e0f2f1" /><rect x="55" y="22" width="11" height="11" rx="2" fill="#e0f2f1" /><rect x="34" y="42" width="11" height="11" rx="2" fill="#e0f2f1" /><rect x="55" y="42" width="11" height="11" rx="2" fill="#e0f2f1" /><rect x="34" y="62" width="11" height="11" rx="2" fill="#e0f2f1" /><rect x="55" y="62" width="11" height="11" rx="2" fill="#e0f2f1" /></svg>`,
    `<svg viewBox="0 0 100 100" style="width: 100%; height: 100%;"><rect x="18" y="74" width="54" height="13" rx="4" fill="#ff781e" /><circle cx="26" cy="80.5" r="5.5" fill="#1e293b" /><circle cx="45" cy="80.5" r="5.5" fill="#1e293b" /><circle cx="64" cy="80.5" r="5.5" fill="#1e293b" /><path d="M23,48 L46,48 L54,74 L23,74 Z" fill="#009688" /><line x1="46" y1="56" x2="78" y2="26" stroke="#ff781e" stroke-width="6" stroke-linecap="round" /><line x1="78" y1="26" x2="88" y2="52" stroke="#ff781e" stroke-width="4.5" stroke-linecap="round" /><path d="M82,48 L92,48 L87,62 L77,58 Z" fill="#00796b" /></svg>`,
    `<svg viewBox="0 0 100 100" style="width: 100%; height: 100%;"><g transform="rotate(45, 50, 50)"><rect x="44" y="12" width="12" height="76" rx="4" fill="#009688" /><circle cx="50" cy="15" r="13" fill="#009688" /><polygon points="50,15 41,4 59,4 50,15" fill="#e0f2f1" /><circle cx="50" cy="85" r="9" fill="#00796b" /></g><g transform="rotate(-45, 50, 50)"><rect x="45" y="18" width="10" height="68" rx="2.5" fill="#ff781e" /><rect x="28" y="10" width="44" height="16" rx="3.5" fill="#78350f" /><path d="M66,13 C73,13 77,23 77,23 L66,23 Z" fill="#78350f" /></g></svg>`,
  ]
  return svgs[index % svgs.length]
}

// Floating Icons States
const floatingIcons = ref([])
let iconIdCounter = 0

function spawnFloatingIcon() {
  const id = iconIdCounter++
  const left = Math.random() * 95 + '%'
  const duration = (5 + Math.random() * 6).toFixed(2) + 's'
  const delay = (Math.random() * 3).toFixed(2) + 's'
  const size = (24 + Math.random() * 22).toFixed(0)
  const svgContent = getConstructionSvg(id)

  floatingIcons.value.push({
    id,
    svg: svgContent,
    style: {
      left,
      width: size + 'px',
      height: size + 'px',
      animationDuration: duration,
      animationDelay: delay,
    },
  })
  setTimeout(
    () => {
      floatingIcons.value = floatingIcons.value.filter((i) => i.id !== id)
    },
    (parseFloat(duration) + parseFloat(delay) + 0.5) * 1000,
  )
}

let floatingIconInterval = null

// Click Icons States
const clickIcons = ref([])

function handlePageClick(e) {
  const count = 4 + Math.floor(Math.random() * 4)
  for (let i = 0; i < count; i++) {
    const id = iconIdCounter++
    const offsetX = (Math.random() - 0.5) * 100
    const offsetY = -(60 + Math.random() * 80)
    const size = 26 + Math.floor(Math.random() * 18)
    const svgContent = getConstructionSvg(id)

    const icon = {
      id,
      svg: svgContent,
      x: e.clientX - size / 2,
      y: e.clientY - size / 2,
      tx: offsetX,
      ty: offsetY,
      size,
    }
    clickIcons.value.push(icon)
    setTimeout(() => {
      clickIcons.value = clickIcons.value.filter((i) => i.id !== id)
    }, 1000)
  }
}

// --- HELPER FUNGSI KALKULASI RAB/MODAL SPK ---
const getSpkModal = (spkList) => {
  let total = 0
  spkList.forEach((spk) => {
    ;(spk.groups || []).forEach((g) => {
      ;(g.items || []).forEach((item) => {
        ;(item.rab_modal || []).forEach((rab) => {
          const qty = Number(rab.unit) || 0
          const pmk = Number(rab.pemakaian) || 1
          const dur = Number(rab.durasi) || 1
          const harga = Number(rab.harga) || 0
          total += qty * pmk * dur * harga
        })
      })
    })
  })
  return total
}

// --- FETCH DATA MURNI REAL-TIME ---
const fetchData = () => {
  loading.value = true

  // 1. Ambil Proyek
  unsubProyek = onSnapshot(collection(db, 'manufactur_master_proyek'), (snap) => {
    rawProyek.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    loading.value = false // Setidaknya proyek sudah load
  })

  // 2. Ambil SPK (Untuk Revenue & Estimasi Modal)
  unsubSpk = onSnapshot(collection(db, 'manufactur_master_proyek_spk'), (snap) => {
    rawSpk.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // 3. Ambil Tagihan Supplier
  unsubTagihan = onSnapshot(collection(db, 'monitoring_tagihan_spk_manufactur'), (snap) => {
    rawTagihan.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // 4. Ambil Pengeluaran Kas (Hanya yang DISETUJUI / Aktual)
  unsubPengeluaran = onSnapshot(collection(db, 'finance_pengajuan_pembayaran_manufactur'), (snap) => {
    rawPengeluaran.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })
}

// --- CORE LOGIC: DATA KONSOLIDASI BALANSHEET ---
const combinedData = computed(() => {
  return rawProyek.value
    .map((p) => {
      // A. REVENUE & ESTIMASI MODAL DARI SPK
      const spks = rawSpk.value.filter((s) => s.projectId === p.id)
      const total_kontrak = spks.reduce((sum, s) => sum + (s.nilai_total || 0), 0)
      const estimasi_modal = getSpkModal(spks)

      // B. HUTANG (A/P) DARI TAGIHAN
      const projectTags = rawTagihan.value.filter((t) => t.proyek_id === p.id)
      const tagihanIds = projectTags.map((t) => t.id)

      const hutang_berjalan = projectTags
        .filter((t) => t.status !== 'Lunas' && t.status !== 'Draft')
        .reduce((sum, t) => sum + ((t.net_amount || 0) - (t.total_dibayar || 0)), 0)

      // C. PENGELUARAN KAS AKTUAL
      const projectPays = rawPengeluaran.value.filter(
        (pay) => pay.status === 'Disetujui' && tagihanIds.includes(pay.tagihan_id),
      )
      const pengeluaran_aktual = projectPays.reduce(
        (sum, pay) => sum + (pay.nominal_pengajuan || 0),
        0,
      )

      // D. KALKULASI FINAL
      const actual_cost = pengeluaran_aktual + hutang_berjalan
      const estimasi_profit = total_kontrak - actual_cost
      const sisa_budget = total_kontrak - actual_cost

      return {
        ...p,
        total_kontrak,
        estimasi_modal,
        pengeluaran_aktual,
        hutang_berjalan,
        estimasi_profit,
        actual_cost,
        sisa_budget,
        spkCount: spks.length,
        spk_list: spks,
      }
    })
    .sort((a, b) => b.total_kontrak - a.total_kontrak)
})

// --- COMPUTED FILTERS & KPI ---
const filteredRows = computed(() => {
  if (!searchQuery.value) return combinedData.value
  const lower = searchQuery.value.toLowerCase()
  return combinedData.value.filter(
    (r) => r.nama?.toLowerCase().includes(lower) || r.konsumen?.toLowerCase().includes(lower),
  )
})

const kpi = computed(() => {
  let tk = 0
  let em = 0
  let ac = 0
  let ep = 0
  combinedData.value.forEach((p) => {
    tk += p.total_kontrak || 0
    em += p.estimasi_modal || 0
    ac += p.actual_cost || 0
    ep += p.estimasi_profit || 0
  })
  return { totalKontrak: tk, estimasiModal: em, actualCost: ac, estimasiProfit: ep }
})

// --- ACTIONS & UTILS ---
const openDetail = (row) => {
  selectedProject.value = row
  showDetail.value = true
}

const getMarginPercent = (row) => {
  if (!row.total_kontrak) return 0
  return ((row.estimasi_profit / row.total_kontrak) * 100).toFixed(1)
}

const getMarginValue = (row) => {
  if (!row.total_kontrak) return 0
  let val = row.estimasi_profit / row.total_kontrak
  if (val < 0) val = 0
  if (val > 1) val = 1
  return val
}

const formatCompact = (num) => {
  if (!num) return '0'
  if (num >= 1000000000) return (num / 1000000000).toFixed(2).replace(/\.00$/, '') + ' M'
  if (num >= 1000000) return (num / 1000000).toFixed(2).replace(/\.00$/, '') + ' Jt'
  return num.toLocaleString('id-ID')
}

onMounted(() => {
  fetchData()
  floatingIconInterval = setInterval(spawnFloatingIcon, 1500)
  spawnFloatingIcon()
})

onUnmounted(() => {
  if (unsubProyek) unsubProyek()
  if (unsubSpk) unsubSpk()
  if (unsubTagihan) unsubTagihan()
  if (unsubPengeluaran) unsubPengeluaran()
  if (floatingIconInterval) clearInterval(floatingIconInterval)
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
  box-shadow: 0 10px 30px rgba(0, 150, 136, 0.15); /* Teal accent shadow */
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-teal-thin {
  border: 1px solid rgba(0, 150, 136, 0.18) !important;
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

/* =============================================
   TEAL COMPONENT CUSTOMS
   ============================================= */
.text-teal-10 {
  color: #009688 !important;
}
.bg-teal-10 {
  background-color: #009688 !important;
}
.bg-teal-1 {
  background-color: #e0f2f1 !important;
}
.table-header-teal {
  background: linear-gradient(90deg, #00796b 0%, #009688 100%) !important;
}
.hover-teal-btn {
  transition: 0.3s;
}
.hover-teal-btn:hover {
  background-color: #e0f2f1 !important;
  color: #009688 !important;
}

.finance-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
}
.hover-bg:hover {
  background-color: rgba(0, 150, 136, 0.04) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* =============================================
   WARNA-WARNI GRADIEN KPI
   ============================================= */
.card-blue-gradient {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
  box-shadow: 0 8px 24px rgba(3, 105, 161, 0.35) !important;
}
.card-orange-gradient {
  background: linear-gradient(135deg, #f59e0b 0%, #ff781e 100%) !important;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35) !important;
}
.card-red-gradient {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%) !important;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.35) !important;
}
.card-teal-gradient {
  background: linear-gradient(135deg, #0d9488 0%, #08665c 100%) !important;
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.35) !important;
}

.list-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: all 0.3s ease;
}
.list-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2) !important;
}
.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(0, 150, 136, 0.15) !important;
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
.opacity-70 {
  opacity: 0.7;
}
.leading-none {
  line-height: 1.1;
}
.leading-relaxed {
  line-height: 1.6;
}

.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.search-input :deep(.q-field__control:hover),
.search-input :deep(.q-field__control.q-field--focused .q-field__control-container) {
  border-color: #009688 !important;
}

/* Table in dialog styling */
.document-table {
  :deep(thead tr th) {
    font-weight: 800;
    font-size: 10px;
    padding: 12px;
    letter-spacing: 1px;
  }
  :deep(tbody tr td) {
    font-size: 13px;
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
  }
}

.shrink {
  flex: 0 0 auto;
}

/* =======================================================================
   INTERACTIVE FLOATING & CLICK HIGH-FIDELITY VECTOR ICONS
   ======================================================================= */
.page-wrapper {
  position: relative;
  overflow: hidden;
}

.floating-icons-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.floating-icon {
  position: absolute;
  bottom: -60px;
  opacity: 0;
  animation: floatUpAnimation linear forwards;
  will-change: transform, opacity;
  user-select: none;
}

@keyframes floatUpAnimation {
  0% {
    transform: translateY(0) rotate(-15deg) scale(0.65);
    opacity: 0;
  }
  15% {
    opacity: 0.7;
  }
  70% {
    opacity: 0.45;
  }
  90% {
    opacity: 0.15;
  }
  100% {
    transform: translateY(-112vh) rotate(20deg) scale(1.15);
    opacity: 0;
  }
}

.click-icons-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: visible;
}

.click-icon {
  position: fixed;
  opacity: 1;
  animation: clickIconAnimation 0.9s ease-out forwards;
  will-change: transform, opacity;
  user-select: none;
}

@keyframes clickIconAnimation {
  0% {
    transform: translate(0, 0) scale(1.1);
    opacity: 1;
  }
  45% {
    transform: translate(var(--tx), var(--ty)) scale(1.35);
    opacity: 0.85;
  }
  100% {
    transform: translate(var(--tx), calc(var(--ty) - 35px)) scale(0.35);
    opacity: 0;
  }
}

.content-relative {
  position: relative;
  z-index: 1;
}

@media print {
  body {
    background: white !important;
  }
  .no-print {
    display: none !important;
  }
}
</style>


