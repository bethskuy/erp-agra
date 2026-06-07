<template>
  <q-page
    class="bg-blue-grey-1 q-pa-md q-pa-lg-lg font-pro page-wrapper"
    @click.self="handlePageClick"
  >
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

    <!-- ══════════════════════════════════════════════
         HEADER (TOMBOL KEMBALI HILANG & MENUNGGU DIHAPUS)
         ══════════════════════════════════════════════ -->
    <div class="row items-center justify-between q-mb-lg animate-fade no-print content-relative">
      <div class="col-12">
        <div class="text-h4 text-weight-bolder text-teal-10 leading-tight">
          Approval PO Material
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Otorisasi & Kendali Dokumen PO
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Tinjau, setujui, atau tolak Purchase Order Material yang telah diajukan oleh tim
          pengadaan.
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════
         STATS CARDS (FULL GRADIENT WARNA-WARNI INDAH)
         ══════════════════════════════════════════════ -->
    <div class="row q-col-gutter-md q-mb-lg animate-fade no-print content-relative">
      <!-- Total PO -->
      <div class="col-6 col-md-3">
        <q-card
          flat
          class="list-card rounded-16 card-teal-gradient text-white transition-all hover-shadow"
        >
          <q-card-section class="q-pa-md">
            <div class="row items-center no-wrap">
              <q-avatar
                color="white"
                text-color="teal-10"
                icon="description"
                size="44px"
                class="q-mr-md shadow-sm"
              />
              <div>
                <div class="text-h5 text-weight-black text-white">
                  {{ rows.length }}
                </div>
                <div
                  class="text-caption text-weight-bold uppercase tracking-widest"
                  style="color: rgba(255, 255, 255, 0.85)"
                >
                  TOTAL PO
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Menunggu -->
      <div class="col-6 col-md-3">
        <q-card
          flat
          class="list-card rounded-16 card-orange-gradient text-white transition-all hover-shadow"
        >
          <q-card-section class="q-pa-md">
            <div class="row items-center no-wrap">
              <q-avatar
                color="white"
                text-color="orange-9"
                icon="hourglass_empty"
                size="44px"
                class="q-mr-md shadow-sm"
              />
              <div>
                <div class="text-h5 text-weight-black text-white">
                  {{ pendingCount }}
                </div>
                <div
                  class="text-caption text-weight-bold uppercase tracking-widest"
                  style="color: rgba(255, 255, 255, 0.85)"
                >
                  MENUNGGU
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Disetujui -->
      <div class="col-6 col-md-3">
        <q-card
          flat
          class="list-card rounded-16 card-green-gradient text-white transition-all hover-shadow"
        >
          <q-card-section class="q-pa-md">
            <div class="row items-center no-wrap">
              <q-avatar
                color="white"
                text-color="positive"
                icon="check_circle"
                size="44px"
                class="q-mr-md shadow-sm"
              />
              <div>
                <div class="text-h5 text-weight-black text-white">
                  {{ rows.filter((r) => r.status === 'Approved').length }}
                </div>
                <div
                  class="text-caption text-weight-bold uppercase tracking-widest"
                  style="color: rgba(255, 255, 255, 0.85)"
                >
                  DISETUJUI
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Ditolak -->
      <div class="col-6 col-md-3">
        <q-card
          flat
          class="list-card rounded-16 card-red-gradient text-white transition-all hover-shadow"
        >
          <q-card-section class="q-pa-md">
            <div class="row items-center no-wrap">
              <q-avatar
                color="white"
                text-color="negative"
                icon="cancel"
                size="44px"
                class="q-mr-md shadow-sm"
              />
              <div>
                <div class="text-h5 text-weight-black text-white">
                  {{ rows.filter((r) => r.status === 'Rejected').length }}
                </div>
                <div
                  class="text-caption text-weight-bold uppercase tracking-widest"
                  style="color: rgba(255, 255, 255, 0.85)"
                >
                  DITOLAK
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════
         FILTER & SEARCH BAR
         ══════════════════════════════════════════════ -->
    <q-card
      flat
      bordered
      class="q-mb-lg shadow-1 rounded-20 bg-white no-print border-teal-thin content-relative"
    >
      <q-card-section class="q-py-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-input
              v-model="filter"
              outlined
              dense
              rounded
              placeholder="Cari No. PO, Supplier Material, atau Produksi..."
              bg-color="white"
              color="teal-10"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="teal-10" />
              </template>
              <template v-slot:append v-if="filter">
                <q-icon name="close" class="cursor-pointer" @click="filter = ''" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-auto">
            <q-btn-toggle
              v-model="filterStatus"
              unelevated
              rounded
              no-caps
              toggle-color="teal-10"
              color="white"
              text-color="grey-7"
              class="shadow-1 border-teal-thin"
              :options="[
                { label: 'Semua', value: 'all' },
                { label: 'Menunggu', value: 'Submitted' },
                { label: 'Disetujui', value: 'Approved' },
                { label: 'Ditolak', value: 'Rejected' },
              ]"
            />
          </div>

          <q-space />
          <div class="col-auto">
            <q-btn flat round icon="refresh" color="teal-10" @click="fetchData">
              <q-tooltip>Refresh Data</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- ══════════════════════════════════════════════
         TABLE PO LIST
         ══════════════════════════════════════════════ -->
    <q-card
      flat
      bordered
      class="rounded-20 shadow-sm overflow-hidden bg-white border-teal-thin no-print content-relative"
    >
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :filter="filter"
        binary-state-sort
        class="approval-po-table"
        :pagination="{ rowsPerPage: 10 }"
      >
        <!-- Header -->
        <template v-slot:header="props">
          <q-tr :props="props" class="table-header-teal text-white">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bold uppercase font-10"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Body -->
        <template v-slot:body="props">
          <q-tr
            :props="props"
            class="hover-bg transition-all cursor-pointer"
            @click="openPreview(props.row)"
          >
            <!-- No PO -->
            <q-td key="nomor" class="text-weight-bolder text-teal-10">
              {{ props.row.nomor }}
              <div class="text-caption text-grey-5">
                {{ formatDateIndo(props.row.submitted_at || props.row.createdAt) }}
              </div>
            </q-td>

            <!-- Supplier Material / Produksi -->
            <q-td key="supplier">
              <div class="text-weight-bold text-blue-grey-9 uppercase">
                {{ props.row.kepada_yth }}
              </div>
              <div class="text-caption text-grey-6 italic">
                Produksi: {{ props.row.proyek_nama || '-' }}
              </div>
            </q-td>

            <!-- Pengaju -->
            <q-td key="submitted_by">
              <div class="row items-center no-wrap">
                <q-avatar
                  size="28px"
                  color="teal-1"
                  text-color="teal-10"
                  icon="person"
                  class="q-mr-sm"
                />
                <div>
                  <div class="text-weight-bold text-blue-grey-8" style="font-size: 12px">
                    {{ props.row.submitted_by || props.row.prepared_by || '-' }}
                  </div>
                  <div class="text-caption text-grey-5">Pengaju</div>
                </div>
              </div>
            </q-td>

            <!-- Grand Total -->
            <q-td key="grand_total" class="text-right text-weight-bolder">
              <span class="text-caption text-grey-6 q-mr-xs">IDR</span>
              {{ (props.row.grand_total || 0).toLocaleString('id-ID') }}
            </q-td>

            <!-- Status -->
            <q-td key="status" class="text-center">
              <q-chip
                text-color="white"
                size="sm"
                class="text-weight-bold shadow-sm"
                :color="getStatusColor(props.row.status)"
                :icon="getStatusIcon(props.row.status)"
              >
                {{ getStatusLabel(props.row.status) }}
              </q-chip>
              <div
                v-if="props.row.status === 'Rejected' && props.row.alasan_reject"
                class="text-negative text-caption q-mt-xs"
                style="font-size: 10px; max-width: 160px"
              >
                {{ props.row.alasan_reject }}
              </div>
            </q-td>

            <!-- Aksi -->
            <q-td key="aksi" class="text-center" @click.stop>
              <div class="row justify-center items-center q-gutter-xs no-wrap">
                <!-- Lihat Detail -->
                <q-btn
                  flat
                  round
                  color="teal-10"
                  icon="visibility"
                  size="sm"
                  @click="openPreview(props.row)"
                  class="hover-teal-btn"
                >
                  <q-tooltip>Lihat Detail PO</q-tooltip>
                </q-btn>

                <!-- Approve (hanya jika status Submitted) -->
                <q-btn
                  v-if="props.row.status === 'Submitted' && canAction('approve')"
                  unelevated
                  rounded
                  color="positive"
                  icon="check_circle"
                  label="Approve"
                  size="sm"
                  no-caps
                  class="q-px-sm text-weight-bold"
                  @click="handleApproval(props.row, 'Approved')"
                >
                  <q-tooltip>Setujui PO</q-tooltip>
                </q-btn>

                <!-- Reject (hanya jika status Submitted) -->
                <q-btn
                  v-if="props.row.status === 'Submitted' && canAction('approve')"
                  outline
                  rounded
                  color="negative"
                  icon="cancel"
                  label="Tolak"
                  size="sm"
                  no-caps
                  class="q-px-sm text-weight-bold"
                  @click="promptReject(props.row)"
                >
                  <q-tooltip>Tolak PO</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <div class="text-center">
              <q-icon name="inbox" size="64px" class="q-mb-md opacity-50" color="teal-3" />
              <div class="text-h6 text-weight-bold text-teal-10">Tidak Ada Data PO</div>
              <div class="text-subtitle2 q-mt-xs text-grey-6">
                {{
                  filterStatus !== 'all'
                    ? 'Tidak ada PO dengan status ini.'
                    : 'Belum ada Purchase Order Material yang diajukan.'
                }}
              </div>
            </div>
          </div>
        </template>

        <!-- Loading -->
        <template v-slot:loading>
          <q-inner-loading showing color="teal-10" />
        </template>
      </q-table>
    </q-card>

    <!-- ══════════════════════════════════════════════
         DIALOG: PREVIEW DETAIL PO + APPROVAL ACTION (CETAK DIHAPUS, STATUS NAVBAR DIHAPUS)
         ══════════════════════════════════════════════ -->
    <q-dialog v-model="showPreview" maximized transition-show="fade" transition-hide="fade">
      <q-card class="column no-wrap bg-grey-4 font-pro">
        <!-- Toolbar Preview (Tombol Cetak dan Status Badge Dihapus) -->
        <q-toolbar class="bg-white text-teal-10 q-py-sm no-print shadow-2 shrink">
          <q-btn flat round dense icon="arrow_back" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold uppercase tracking-widest font-11">
            DETAIL PURCHASE ORDER
          </q-toolbar-title>
          <q-space />

          <!-- Action buttons di toolbar (hanya jika Submitted) -->
          <template v-if="selectedPo?.status === 'Submitted' && canAction('approve')">
            <q-btn
              unelevated
              rounded
              color="positive"
              icon="check_circle"
              label="APPROVE"
              class="text-weight-bold q-px-lg q-mr-sm shadow-3"
              @click="handleApproval(selectedPo, 'Approved')"
            />
            <q-btn
              outline
              rounded
              color="negative"
              icon="cancel"
              label="TOLAK"
              class="text-weight-bold q-px-lg q-mr-md"
              @click="promptReject(selectedPo)"
            />
          </template>

          <q-btn
            color="red-9"
            icon="picture_as_pdf"
            label="PDF"
            @click="exportToPDF"
            unelevated
            rounded
            class="q-px-lg text-weight-bold"
          />
        </q-toolbar>

        <!-- Preview Content -->
        <q-card-section class="col scroll q-pa-md q-pa-md-xl flex flex-center preview-container">
          <div id="po-approval-print-area" class="po-print-container shadow-24" v-if="selectedPo">
            <!-- KOP SURAT (DIPERTAHANKAN WARNA ASLI DOKUMEN PERUSAHAAN) -->
            <div class="row no-wrap items-center q-mb-sm">
              <div class="col-auto q-mr-md">
                <img :src="selectedPo.logoUrl || 'icons/logo-agra.png'" class="po-logo" />
              </div>
              <div class="col text-left q-pl-md">
                <div class="po-company-name">
                  {{ selectedPo.nama_pt || 'PT AGRA ABHINAYA PERKASA' }}
                </div>
                <div class="po-company-slogan">
                  {{ selectedPo.slogan_pt || 'General Construction and General Supply' }}
                </div>
              </div>
            </div>

            <div class="po-divider"></div>

            <!-- JUDUL & NOMOR (BADGE STATUS "MENUNGGU" DIHAPUS) -->
            <div class="text-right q-mb-md">
              <div class="po-title">PURCHASE ORDER</div>
              <div class="po-no">
                No. PO :
                <span class="text-indigo-10 font-mono font-bold">{{ selectedPo.nomor }}</span>
              </div>
            </div>

            <!-- META INFO KIRI & KANAN (PERBAIKAN JARAK KANAN RAPAT) -->
            <div class="row justify-between q-col-gutter-md q-mb-md po-meta">
              <div class="col-7 text-left">
                <div class="po-meta-label">KEPADA YTH :</div>
                <div class="text-indigo-10 text-h6 text-weight-bolder q-mb-xs uppercase">
                  {{ selectedPo.kepada_yth }}
                </div>
                <div class="row no-wrap q-mt-xs">
                  <div class="col-auto q-mr-sm font-bold text-grey-8">Address :</div>
                  <div class="col text-blue-grey-10 text-weight-medium">
                    {{ selectedPo.alamat_supplier || '-' }}
                  </div>
                </div>
                <div class="row no-wrap q-mt-sm">
                  <div class="col-auto q-mr-sm font-bold text-grey-8">
                    Attn &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
                  </div>
                  <div class="col text-blue-grey-10 text-weight-bold">
                    {{ selectedPo.attn_supplier || '-' }}
                  </div>
                </div>
              </div>

              <!-- META KANAN (Diperdekat jaraknya dengan auto sizing) -->
              <div class="col-5">
                <table
                  class="meta-info-table-right"
                  style="
                    margin-left: auto;
                    border-collapse: collapse;
                    font-size: 11.5px;
                    color: #111;
                  "
                >
                  <tr>
                    <td
                      class="text-bold text-left text-grey-7"
                      style="padding: 2px 8px 2px 0; white-space: nowrap"
                    >
                      Tanggal
                    </td>
                    <td style="text-align: center; padding: 2px 4px">:</td>
                    <td
                      class="text-left text-weight-bold text-black"
                      style="padding: 2px 0 2px 4px"
                    >
                      {{ formatDateIndo(selectedPo.tanggal) }}
                    </td>
                  </tr>
                  <tr v-if="selectedPo.proyek_nama">
                    <td
                      class="text-bold text-left text-grey-7"
                      style="padding: 2px 8px 2px 0; white-space: nowrap"
                    >
                      Produksi
                    </td>
                    <td style="text-align: center; padding: 2px 4px">:</td>
                    <td
                      class="text-left text-weight-bold uppercase text-black"
                      style="padding: 2px 0 2px 4px"
                    >
                      {{ selectedPo.proyek_nama }}
                    </td>
                  </tr>
                  <tr v-if="selectedPo.no_spk">
                    <td
                      class="text-bold text-left text-grey-7"
                      style="padding: 2px 8px 2px 0; white-space: nowrap"
                    >
                      No. SPK
                    </td>
                    <td style="text-align: center; padding: 2px 4px">:</td>
                    <td class="text-left font-bold text-black" style="padding: 2px 0 2px 4px">
                      {{ selectedPo.no_spk }}
                    </td>
                  </tr>
                  <tr>
                    <td
                      class="text-bold text-left text-grey-7"
                      style="padding: 2px 8px 2px 0; white-space: nowrap"
                    >
                      Pengaju
                    </td>
                    <td style="text-align: center; padding: 2px 4px">:</td>
                    <td
                      class="text-left text-weight-bold text-indigo-10"
                      style="padding: 2px 0 2px 4px"
                    >
                      {{ selectedPo.submitted_by || selectedPo.prepared_by || '-' }}
                    </td>
                  </tr>
                  <tr v-if="selectedPo.approved_at">
                    <td
                      class="text-bold text-left text-grey-7"
                      style="padding: 2px 8px 2px 0; white-space: nowrap"
                    >
                      Tgl Disetujui
                    </td>
                    <td style="text-align: center; padding: 2px 4px">:</td>
                    <td class="text-left text-positive font-bold" style="padding: 2px 0 2px 4px">
                      {{ formatDateIndo(selectedPo.approved_at) }}
                    </td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- TABEL ITEMS -->
            <table class="po-table">
              <thead>
                <tr>
                  <th width="5%">NO</th>
                  <th class="text-left" width="42%">ITEM DESCRIPTION</th>
                  <th width="10%">QTY</th>
                  <th width="10%">SATUAN</th>
                  <th class="text-right" width="16%">UNIT PRICE (Rp)</th>
                  <th class="text-right" width="17%">AMOUNT (Rp)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in selectedPo.items" :key="i">
                  <td class="text-center text-weight-bold">{{ i + 1 }}</td>
                  <td class="text-left text-weight-bold uppercase">
                    {{ item.nama_barang }}
                    <div v-if="item.desc" class="text-caption text-grey-6 font-normal lowercase">
                      {{ item.desc }}
                    </div>
                  </td>
                  <td class="text-center text-weight-bold">{{ item.qty }}</td>
                  <td class="text-center uppercase">{{ item.satuan }}</td>
                  <td class="text-right">
                    {{
                      (item.harga_satuan || 0).toLocaleString('id-ID', { minimumFractionDigits: 2 })
                    }}
                  </td>
                  <td class="text-right text-weight-bold">
                    {{
                      ((item.qty || 0) * (item.harga_satuan || 0)).toLocaleString('id-ID', {
                        minimumFractionDigits: 2,
                      })
                    }}
                  </td>
                </tr>
                <tr v-if="!selectedPo.items || selectedPo.items.length === 0">
                  <td colspan="6" class="text-center text-grey-5 italic q-pa-lg">Tidak ada item</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="row-calculation">
                  <td colspan="5" class="text-right font-bold">Subtotal</td>
                  <td class="text-right font-bold">
                    {{
                      selectedPo.total_amount?.toLocaleString('id-ID', { minimumFractionDigits: 2 })
                    }}
                  </td>
                </tr>
                <tr class="row-calculation" v-if="selectedPo.mobdemob">
                  <td colspan="5" class="text-right font-bold">Mobdemob / Lainnya</td>
                  <td class="text-right font-bold">
                    {{ selectedPo.mobdemob?.toLocaleString('id-ID', { minimumFractionDigits: 2 }) }}
                  </td>
                </tr>
                <tr class="po-grand-total">
                  <td
                    colspan="5"
                    class="text-right text-weight-bold text-h6 uppercase tracking-widest"
                    style="font-size: 14px"
                  >
                    Grand Total
                  </td>
                  <td class="text-right text-white text-bold text-subtitle1">
                    {{
                      selectedPo.grand_total?.toLocaleString('id-ID', { minimumFractionDigits: 2 })
                    }}
                  </td>
                </tr>
              </tfoot>
            </table>

            <!-- SYARAT & KETENTUAN -->
            <div class="po-terms-box q-mt-lg" v-if="selectedPo.syarat_kondisi">
              <div class="po-terms-title">Syarat Dan Kondisi</div>
              <div
                class="po-terms-content leading-relaxed"
                v-html="selectedPo.syarat_kondisi"
              ></div>
            </div>

            <div class="po-terms-box q-mt-sm" v-if="selectedPo.sistem_pembayaran">
              <div class="po-terms-title">Sistem Pembayaran</div>
              <div
                class="po-terms-content leading-relaxed"
                v-html="selectedPo.sistem_pembayaran"
              ></div>
            </div>

            <div class="q-mt-md text-left text-body2 italic text-grey-8" v-if="selectedPo.closing">
              {{ selectedPo.closing }}
            </div>

            <!-- ALASAN REJECT -->
            <div
              v-if="selectedPo.status === 'Rejected' && selectedPo.alasan_reject"
              class="reject-reason-box q-mt-lg"
            >
              <div class="reject-reason-title">
                <q-icon name="cancel" class="q-mr-xs" /> ALASAN PENOLAKAN
              </div>
              <div class="reject-reason-content">{{ selectedPo.alasan_reject }}</div>
            </div>

            <!-- TANDA TANGAN (TERPISAH INDAH TIDAK MENYATU LAGI) -->
            <div
              class="row justify-between text-center q-mt-xl po-signature"
              style="font-size: 13px"
            >
              <div class="col-4 q-px-md">
                <div class="font-bold q-mb-xl">Prepared By</div>
                <div style="height: 55px"></div>
                <div
                  style="
                    max-width: 180px;
                    margin: 0 auto;
                    border-top: 2px solid #1a237e;
                    padding-top: 5px;
                  "
                  class="font-bold uppercase text-indigo-10"
                >
                  {{ selectedPo.prepared_by || '..............................' }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">Pengaju</div>
              </div>
              <div class="col-4 q-px-md">
                <div class="font-bold q-mb-xl">Checked By</div>
                <div style="height: 55px"></div>
                <div
                  style="
                    max-width: 180px;
                    margin: 0 auto;
                    border-top: 2px solid #1a237e;
                    padding-top: 5px;
                  "
                  class="font-bold uppercase text-indigo-10"
                >
                  {{
                    selectedPo.checked_by ||
                    selectedPo.requested_by ||
                    '..............................'
                  }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">Pemeriksa</div>
              </div>
              <div class="col-4 q-px-md">
                <div class="font-bold q-mb-xl">Approved By</div>
                <div style="height: 55px" class="flex flex-center">
                  <div
                    v-if="selectedPo.status === 'Approved' && selectedPo.approved_by_nama"
                    class="text-positive text-weight-bold"
                    style="font-size: 11px"
                  >
                    ✓ {{ selectedPo.approved_by_nama }}
                  </div>
                </div>
                <div
                  style="
                    max-width: 180px;
                    margin: 0 auto;
                    border-top: 2px solid #1a237e;
                    padding-top: 5px;
                  "
                  class="font-bold uppercase text-indigo-10"
                  :class="selectedPo.status === 'Approved' ? 'text-positive border-pos' : ''"
                >
                  {{
                    selectedPo.approved_by ||
                    selectedPo.approved_supplier ||
                    '..............................'
                  }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">Penyetuju</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { serverTimestamp } from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useManufactureApprovalStore } from 'src/stores/manufactureApprovalStore'
import html2pdf from 'html2pdf.js'

// ── Init ──────────────────────────────────────────────────────────────────
const $q = useQuasar()
const authStore = useAuthStore()
const approvalStore = useManufactureApprovalStore()

const manufactureApprovalPO = Object.freeze({
  namespace: 'manufactureApprovalPO',
})

const rows = computed(() => approvalStore.purchaseOrders)
const loading = ref(true)
const filter = ref('')
const filterStatus = ref('all')
const showPreview = ref(false)
const selectedPo = ref(null)
const userData = ref(null)

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

// ── Columns ───────────────────────────────────────────────────────────────
const columns = [
  { name: 'nomor', align: 'left', label: 'NO. PO', field: 'nomor', sortable: true },
  {
    name: 'supplier',
    align: 'left',
    label: 'SUPPLIER MATERIAL / PRODUKSI',
    field: 'kepada_yth',
    sortable: true,
  },
  { name: 'submitted_by', align: 'left', label: 'PENGAJU', field: 'submitted_by', sortable: true },
  {
    name: 'grand_total',
    align: 'right',
    label: 'GRAND TOTAL (IDR)',
    field: 'grand_total',
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'AKSI' },
]

// ── Permission check ──────────────────────────────────────────────────────
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'manufaktur')
  const menu = modulePerm?.menus.find((m) => m.id === '_manufaktur_pembelian_pesanan')
  return menu ? menu[actionType] || false : false
}

// ── Computed ─────────────────────────────────────────────────────────────
const filteredRows = computed(() => {
  if (filterStatus.value === 'all') return rows.value
  return rows.value.filter((r) => r.status === filterStatus.value)
})

const pendingCount = computed(() => rows.value.filter((r) => r.status === 'Submitted').length)

// eslint-disable-next-line no-unused-vars
const stats = computed(() => [
  {
    label: 'Total PO',
    value: rows.value.length,
    icon: 'description',
    gradientClass: 'card-teal-gradient',
  },
  {
    label: 'Menunggu',
    value: rows.value.filter((r) => r.status === 'Submitted').length,
    icon: 'hourglass_empty',
    gradientClass: 'card-orange-gradient',
  },
  {
    label: 'Disetujui',
    value: rows.value.filter((r) => r.status === 'Approved').length,
    icon: 'check_circle',
    gradientClass: 'card-green-gradient',
  },
  {
    label: 'Ditolak',
    value: rows.value.filter((r) => r.status === 'Rejected').length,
    icon: 'cancel',
    gradientClass: 'card-red-gradient',
  },
])

// ── Helpers ───────────────────────────────────────────────────────────────
const getStatusColor = (s) =>
  s === 'Approved'
    ? 'positive'
    : s === 'Rejected'
      ? 'negative'
      : s === 'Submitted'
        ? 'orange-9'
        : s === 'Ordered'
          ? 'teal-10'
          : 'blue-grey-5'

const getStatusIcon = (s) =>
  s === 'Approved'
    ? 'check_circle'
    : s === 'Rejected'
      ? 'cancel'
      : s === 'Submitted'
        ? 'hourglass_empty'
        : s === 'Ordered'
          ? 'local_shipping'
          : 'help_outline'

const getStatusLabel = (s) =>
  s === 'Approved'
    ? 'Disetujui'
    : s === 'Rejected'
      ? 'Ditolak'
      : s === 'Submitted'
        ? 'Menunggu'
        : s === 'Ordered'
          ? 'Dipesan'
          : s || 'Draft'

const formatDateIndo = (d) => {
  if (!d) return '-'
  const dateObj = d?.toDate ? d.toDate() : new Date(d)
  if (isNaN(dateObj)) return '-'
  return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Fetch Data ────────────────────────────────────────────────────────────
const fetchData = () => {
  loading.value = true
  try {
    approvalStore.bindPurchaseOrders()
  } catch (error) {
    console.error(error)
    approvalStore.purchaseOrders = []
  } finally {
    loading.value = false
  }
}

// ── Open Preview ──────────────────────────────────────────────────────────
const openPreview = (row) => {
  selectedPo.value = row
  showPreview.value = true
}

// ── Approval Handler ──────────────────────────────────────────────────────
const handleApproval = (row, status, alasan = null) => {
  const isApprove = status === 'Approved'

  $q.dialog({
    title: isApprove ? 'Setujui Purchase Order Material?' : 'Tolak Purchase Order Material?',
    message: isApprove
      ? `PO <b>${row.nomor}</b> akan disetujui and supplier material <b>${row.kepada_yth}</b> dapat dihubungi. Lanjutkan?`
      : `PO <b>${row.nomor}</b> akan ditolak dengan alasan yang diberikan.`,
    html: true,
    cancel: { flat: true, label: 'Batal', color: 'grey-7' },
    ok: {
      unelevated: true,
      rounded: true,
      label: isApprove ? 'Ya, Setujui' : 'Ya, Tolak',
      color: isApprove ? 'positive' : 'negative',
      class: 'text-weight-bold',
    },
  }).onOk(async () => {
    $q.loading.show({ message: isApprove ? 'Menyetujui PO...' : 'Menolak PO...' })
    try {
      const payload = {
        status,
        updatedAt: serverTimestamp(),
        approved_by_nama: userData.value?.nama || authStore.user?.email || 'Admin',
        approved_by_jabatan: userData.value?.jabatan || '',
      }

      if (isApprove) {
        payload.approved_at = serverTimestamp()
      } else {
        payload.rejected_at = serverTimestamp()
        if (alasan) payload.alasan_reject = alasan
      }

      await approvalStore.approvePurchaseOrder(row, status, {
        ...payload,
        namespace: manufactureApprovalPO.namespace,
        alasan_reject: alasan || '',
      })

      if (selectedPo.value?.id === row.id) {
        selectedPo.value = { ...selectedPo.value, ...payload, status }
      }

      $q.notify({
        type: isApprove ? 'positive' : 'negative',
        message: isApprove
          ? `PO ${row.nomor} berhasil disetujui!`
          : `PO ${row.nomor} telah ditolak.`,
        position: 'top',
        timeout: 3500,
        icon: isApprove ? 'check_circle' : 'cancel',
      })
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', message: 'Gagal memproses: ' + e.message })
    } finally {
      $q.loading.hide()
    }
  })
}

// ── Reject Prompt ─────────────────────────────────────────────────────────
const promptReject = (row) => {
  $q.dialog({
    title: 'Alasan Penolakan PO',
    message: 'Berikan alasan penolakan Purchase Order Material ini:',
    prompt: {
      model: '',
      type: 'textarea',
      outlined: true,
      color: 'negative',
      placeholder: 'Contoh: Harga tidak sesuai RAB, supplier material tidak terdaftar, dll...',
    },
    cancel: { flat: true, label: 'Batal', color: 'grey-7' },
    ok: {
      unelevated: true,
      rounded: true,
      label: 'Tolak PO',
      color: 'negative',
      class: 'text-weight-bold',
    },
  }).onOk((alasan) => {
    if (!alasan || !alasan.trim()) {
      $q.notify({ type: 'warning', message: 'Alasan penolakan wajib diisi!', position: 'top' })
      return
    }
    handleApproval(row, 'Rejected', alasan.trim())
  })
}

// ── Print & PDF ───────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const printPage = () => window.print()

const exportToPDF = () => {
  if (!selectedPo.value) return
  $q.loading.show({ message: 'Membuat PDF...' })
  const element = document.getElementById('po-approval-print-area')
  const opt = {
    margin: 0,
    filename: `PO_${(selectedPo.value.nomor || 'PO').replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 3, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => {
      $q.loading.hide()
      $q.notify({ type: 'positive', message: 'PDF berhasil diunduh!', position: 'top' })
    })
}

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(() => {
  userData.value = authStore.user || null
  fetchData()
  // Start floating icons
  floatingIconInterval = setInterval(spawnFloatingIcon, 1500)
  spawnFloatingIcon()
})

onUnmounted(() => {
  approvalStore.unbind()
  if (floatingIconInterval) clearInterval(floatingIconInterval)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.font-pro {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-16 {
  border-radius: 16px;
}
.rounded-12 {
  border-radius: 12px;
}
.uppercase {
  text-transform: uppercase;
}
.font-10 {
  font-size: 10px;
}
.font-11 {
  font-size: 11px;
}
.font-bold {
  font-weight: bold;
}
.tracking-widest {
  letter-spacing: 0.12em;
}
.leading-tight {
  line-height: 1.2;
}
.opacity-50 {
  opacity: 0.5;
}
.shadow-premium {
  box-shadow: 0 4px 15px rgba(0, 150, 136, 0.2);
}

/* ── Teal tokens ── */
.text-teal-10 {
  color: #009688 !important;
}
.bg-teal-10 {
  background-color: #009688 !important;
}
.bg-teal-1 {
  background-color: #e0f2f1 !important;
}
.border-teal-thin {
  border: 1px solid rgba(0, 150, 136, 0.18) !important;
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

/* ── Stat cards (image_40d807.png Style) ── */
.card-teal-gradient {
  background: linear-gradient(135deg, #0d9488 0%, #08665c 100%) !important;
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.35) !important;
}
.card-blue-gradient {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
  box-shadow: 0 8px 24px rgba(3, 105, 161, 0.35) !important;
}
.card-green-gradient {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%) !important;
  box-shadow: 0 8px 24px rgba(4, 120, 87, 0.35) !important;
}
.card-orange-gradient {
  background: linear-gradient(135deg, #f59e0b 0%, #ff781e 100%) !important;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35) !important;
}
.card-red-gradient {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%) !important;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.35) !important;
}

.list-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: all 0.3s ease;
}
.list-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2) !important;
}

/* ── Table ── */
.approval-po-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
}
.approval-po-table :deep(tbody tr td) {
  padding: 12px 16px;
}

.hover-bg:hover {
  background-color: rgba(0, 150, 136, 0.04) !important;
}
.transition-all {
  transition: all 0.25s ease;
}

/* ── Animations ── */
.animate-fade {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ════════════════════════════════════════════════
   PO PRINT CONTAINER
════════════════════════════════════════════════ */
.po-print-container {
  background: white;
  width: 210mm;
  min-height: 297mm;
  padding: 10mm 20mm 15mm; /* Dikoreksi margin top agar rada keatasan */
  margin: 0 auto;
  color: #000;
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.45;
  box-sizing: border-box;
}

.po-logo {
  height: 60px;
  object-fit: contain;
}

.po-company-name {
  font-size: 20px;
  font-weight: 900;
  color: #1a237e;
  margin-bottom: 2px;
}
.po-company-slogan {
  font-size: 11px;
  font-weight: 700;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.po-divider {
  height: 3px;
  background: #1a237e;
  margin: 10px 0 10px; /* Dikoreksi margin agar rada keatasan */
}

.po-title {
  font-size: 18px;
  font-weight: 900;
  color: #1a237e;
  letter-spacing: 1.5px;
  margin-bottom: 4px;
}
.po-no {
  font-size: 12px;
  font-weight: 800;
  color: #000;
}

/* Status badge di cetak */
.status-badge-print {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.status-submitted {
  background: #ff6f00;
  color: #fff;
}
.status-approved {
  background: #1b5e20;
  color: #fff;
}
.status-rejected {
  background: #b71c1c;
  color: #fff;
}
.status-ordered {
  background: #006064;
  color: #fff;
}
.status-draft {
  background: #546e7a;
  color: #fff;
}

.po-meta {
  font-size: 12.5px; /* Sedikit diperbesar agar nyaman dibaca */
  color: #111;
  margin-top: -10px; /* Margin ditarik keatas agar seksi seimbang */
}
.po-meta-label {
  color: #555;
  font-size: 10.5px;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: bold;
}

/* ── PO Table ── */
.po-table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 16px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
}
.po-table th {
  background: #1a237e !important;
  color: white !important;
  font-size: 10px;
  font-weight: 800;
  padding: 9px 8px;
  border: 1px solid #ccc;
  text-transform: uppercase;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.po-table td {
  font-size: 11.5px;
  padding: 7px 8px;
  border: 1px solid #ddd;
  color: #111;
}
.po-table tfoot td {
  padding: 8px;
  border: 1px solid #ccc;
}

.row-calculation {
  background: #f5f5f5 !important;
}
.row-calculation td {
  padding: 8px 12px;
  font-size: 12px;
}

.po-grand-total td {
  background: #1a237e !important;
  color: white !important;
  font-weight: 900;
  font-size: 14px;
  border: 1px solid #1a237e !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Terms box ── */
.po-terms-box {
  border: 1.5px solid #1a237e;
  border-radius: 4px;
  overflow: hidden;
  page-break-inside: avoid;
  margin-bottom: 8px;
}
.po-terms-title {
  background: #1a237e !important;
  color: white !important;
  font-size: 10px;
  font-weight: 800;
  padding: 6px 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.po-terms-content {
  padding: 8px 10px;
  font-size: 11px;
  color: #000;
}
.po-terms-content p,
.po-terms-content ol,
.po-terms-content ul {
  margin: 0 0 4px;
  padding-left: 16px;
}

/* ── Reject box ── */
.reject-reason-box {
  border: 1.5px solid #b71c1c;
  border-radius: 4px;
  overflow: hidden;
  page-break-inside: avoid;
}
.reject-reason-title {
  background: #b71c1c !important;
  color: white !important;
  font-size: 10px;
  font-weight: 800;
  padding: 6px 10px;
  text-transform: uppercase;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.reject-reason-content {
  padding: 8px 10px;
  font-size: 11px;
  color: #b71c1c;
  font-weight: 600;
}

/* ── Signature (TERPISAH INDAH TIDAK MENYATU LAGI) ── */
.po-signature {
  page-break-inside: avoid;
}
.sig-line {
  border-top: 2px solid #1a237e;
  padding-top: 5px;
  display: block; /* Menggunakan block agar terpusat rapi di grid */
  max-width: 180px;
  margin: 0 auto;
  font-size: 12px;
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

/* ── Print Media ── */
@media print {
  @page {
    size: A4;
    margin: 0;
  }
  body {
    background: white !important;
  }
  .no-print {
    display: none !important;
  }
  .po-print-container {
    box-shadow: none !important;
    margin: 0 !important;
    width: 210mm !important;
  }
  .po-table th,
  .po-grand-total td,
  .po-terms-title,
  .reject-reason-title {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .row-calculation {
    background: #f5f5f5 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
