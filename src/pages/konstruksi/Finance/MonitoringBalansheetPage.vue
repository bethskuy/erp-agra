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
            color="green-10"
            icon="arrow_back"
            @click="$router.back()"
            class="q-mr-md bg-white shadow-1"
          />
          <div>
            <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
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
        <q-badge color="green-10" class="q-px-md q-py-xs text-weight-bold shadow-2 rounded-12">
          <q-icon name="auto_graph" size="xs" class="q-mr-sm" />
          CALCULATING LIVE
        </q-badge>
      </div>
    </div>

    <!-- =====================================================================================
         SUMMARY CARDS / KPI BALANSHEET
         ===================================================================================== -->
    <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
      <!-- Total Nilai Kontrak (Revenue) -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-green-thin bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                TOTAL KONTRAK (REVENUE)
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs text-indigo-10">
                Rp {{ formatCompact(kpi.totalKontrak) }}
              </div>
            </div>
            <div
              class="bg-indigo-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="request_quote" color="indigo-10" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Estimasi Modal (RAB) -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-green-thin bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                ESTIMASI MODAL (RAB)
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs text-orange-9">
                Rp {{ formatCompact(kpi.estimasiModal) }}
              </div>
            </div>
            <div
              class="bg-orange-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="engineering" color="orange-9" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Pengeluaran Aktual + Hutang Berjalan -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-green-thin bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                PENGELUARAN AKTUAL
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs text-red-9">
                Rp {{ formatCompact(kpi.actualCost) }}
              </div>
            </div>
            <div
              class="bg-red-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="payments" color="red-9" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Laba Kotor (Gross Profit) -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card
          flat
          class="rounded-20 border-green-thin bg-green-10 text-white transition-all hover-shadow"
        >
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-green-2 leading-none text-weight-bold tracking-widest">
                PROYEKSI LABA KOTOR
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs">
                Rp {{ formatCompact(kpi.estimasiProfit) }}
              </div>
            </div>
            <div
              class="bg-white q-pa-md rounded-borders shadow-2"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="insights" color="green-10" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- =====================================================================================
         SEARCH & FILTER AREA
         ===================================================================================== -->
    <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print border-green-thin">
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
            >
              <template v-slot:prepend><q-icon name="search" color="green-10" /></template>
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
      class="rounded-20 shadow-sm overflow-hidden bg-white no-print border-green-thin"
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
          <q-tr :props="props" class="bg-green-10 text-white">
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
              <div class="text-weight-black text-indigo-10 text-subtitle2">
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
                :class="props.row.estimasi_profit >= 0 ? 'text-green-9' : 'text-negative'"
              >
                Rp {{ (props.row.estimasi_profit || 0).toLocaleString() }}
              </div>
            </q-td>

            <q-td key="margin" style="width: 200px">
              <div class="row items-center justify-between font-10 text-weight-bold q-mb-xs">
                <span class="text-grey-7">Margin Target</span>
                <span :class="getMarginPercent(props.row) >= 0 ? 'text-green-9' : 'text-negative'">
                  {{ getMarginPercent(props.row) }}%
                </span>
              </div>
              <q-linear-progress
                :value="getMarginValue(props.row)"
                size="8px"
                rounded
                :color="getMarginPercent(props.row) >= 0 ? 'green-10' : 'negative'"
                track-color="grey-3"
              />
            </q-td>

            <q-td key="aksi" class="text-center" @click.stop>
              <q-btn
                flat
                round
                color="green-10"
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
      <q-card class="bg-grey-2 column no-wrap">
        <q-toolbar class="bg-green-10 text-white q-py-md shadow-4 shrink no-print">
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
              <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1 border-green-thin">
                <q-card-section class="q-pa-lg row items-center justify-between">
                  <div>
                    <div class="text-h4 text-weight-black text-blue-grey-10">
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
                    <div class="text-h5 text-weight-black text-indigo-10">
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
                    class="rounded-20 full-height bg-white shadow-1 border-green-thin"
                  >
                    <q-card-section
                      class="bg-green-1 q-py-sm text-green-10 text-weight-bold flex items-center border-bottom-subtle"
                    >
                      <q-icon name="donut_large" class="q-mr-xs" size="sm" /> KOMPOSISI NERACA
                      KEUANGAN
                    </q-card-section>
                    <q-card-section class="q-pa-lg">
                      <!-- Revenue -->
                      <div class="q-mb-md">
                        <div class="row justify-between items-end q-mb-xs">
                          <span
                            class="text-caption text-weight-bold text-indigo-10 uppercase tracking-widest font-10"
                            >Nilai Kontrak (Revenue)</span
                          >
                          <span class="text-weight-bold text-indigo-10"
                            >Rp {{ (selectedProject.total_kontrak || 0).toLocaleString() }}</span
                          >
                        </div>
                        <q-linear-progress :value="1" size="16px" rounded color="indigo-10" />
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

                      <!-- Aktual Cost (Cash Out + AP) -->
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
                            class="text-caption text-weight-black text-green-10 uppercase tracking-widest font-10"
                            >Proyeksi Laba Kotor</span
                          >
                          <span class="text-h6 text-weight-black text-green-10"
                            >Rp {{ (selectedProject.estimasi_profit || 0).toLocaleString() }}</span
                          >
                        </div>
                        <q-linear-progress
                          :value="getMarginValue(selectedProject)"
                          size="20px"
                          rounded
                          color="green-10"
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
                    class="rounded-20 full-height bg-white shadow-1 border-green-thin"
                  >
                    <q-card-section
                      class="bg-green-1 q-py-sm text-green-10 text-weight-bold flex items-center border-bottom-subtle"
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
                        class="bg-indigo-1 q-pa-md rounded-12 border-indigo-thin flex items-center justify-between"
                      >
                        <div class="row items-center">
                          <q-avatar
                            color="white"
                            text-color="indigo-10"
                            icon="savings"
                            class="q-mr-md shadow-1"
                          />
                          <div>
                            <div class="text-weight-bold text-indigo-10">
                              Sisa Anggaran Proyek (Budget)
                            </div>
                            <div class="text-caption text-indigo-8">
                              Kontrak - (Kas Keluar + Hutang)
                            </div>
                          </div>
                        </div>
                        <div class="text-h5 text-weight-black text-indigo-10">
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
                class="rounded-20 bg-white shadow-1 overflow-hidden border-green-thin"
              >
                <q-card-section
                  class="bg-blue-grey-10 q-py-sm text-white text-weight-bold flex items-center"
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
                      <td class="text-weight-bold text-primary">{{ spk.nomor_spk }}</td>
                      <td class="text-weight-medium uppercase">{{ spk.nama_kontrak }}</td>
                      <td class="text-right text-grey-7">{{ spk.durasi || '-' }}</td>
                      <td class="text-right text-weight-bold text-indigo-10">
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db } from 'src/boot/firebase'
// eslint-disable-next-line no-unused-vars
import { collection, onSnapshot, query } from 'firebase/firestore'

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
  unsubProyek = onSnapshot(collection(db, 'proyek'), (snap) => {
    rawProyek.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    loading.value = false // Setidaknya proyek sudah load
  })

  // 2. Ambil SPK (Untuk Revenue & Estimasi Modal)
  unsubSpk = onSnapshot(collection(db, 'spk_customer'), (snap) => {
    rawSpk.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // 3. Ambil Tagihan Supplier (Untuk mengaitkan proyek & menghitung hutang berjalan)
  unsubTagihan = onSnapshot(collection(db, 'finance_tagihan'), (snap) => {
    rawTagihan.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // 4. Ambil Pengeluaran Kas (Hanya yang DISETUJUI / Aktual)
  unsubPengeluaran = onSnapshot(collection(db, 'finance_pengajuan_pembayaran'), (snap) => {
    // Ambil semua, filter "Disetujui" di logic
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
      // Cari tagihan yang ditujukan untuk proyek ini
      const projectTags = rawTagihan.value.filter((t) => t.proyek_id === p.id)
      const tagihanIds = projectTags.map((t) => t.id)

      // Hutang Berjalan = Tagihan Aktif (Bukan Lunas, Bukan Draft) di mana Total < GrandTotal
      const hutang_berjalan = projectTags
        .filter((t) => t.status !== 'Lunas' && t.status !== 'Draft')
        .reduce((sum, t) => sum + ((t.grand_total || 0) - (t.total_dibayar || 0)), 0)

      // C. PENGELUARAN KAS AKTUAL
      // Cari pembayaran yang Disetujui, berdasarkan tagihanId proyek ini
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
      const sisa_budget = total_kontrak - actual_cost // Secara fundamental sama dgn profit cash basis

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
        spk_list: spks, // Simpan ke objek untuk ditampilkan di detail
      }
    })
    .sort((a, b) => b.total_kontrak - a.total_kontrak) // Urutkan berdasarkan proyek terbesar
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
  // Memastikan value Linear Progress antara 0 - 1
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
})

onUnmounted(() => {
  if (unsubProyek) unsubProyek()
  if (unsubSpk) unsubSpk()
  if (unsubTagihan) unsubTagihan()
  if (unsubPengeluaran) unsubPengeluaran()
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
  box-shadow: 0 10px 30px rgba(26, 35, 126, 0.15);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-green-thin {
  border: 1px solid rgba(27, 94, 32, 0.1);
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
  background-color: rgba(27, 94, 32, 0.03) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(27, 94, 32, 0.15) !important;
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
</style>
