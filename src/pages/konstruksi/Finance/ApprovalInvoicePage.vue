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
              Approval Invoice
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Otorisasi Penagihan (AR)</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Tinjau, setujui, atau tolak draf invoice pelanggan sebelum dikirimkan ke pihak
              eksternal.
            </div>
          </div>
        </div>
      </div>

      <!-- NEW ACTION BUTTON: BUAT KWITANSI BARU -->
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none row q-gutter-sm">
        <q-btn
          color="indigo-10"
          icon="receipt"
          label="Buat Kwitansi"
          unelevated
          rounded
          no-caps
          class="q-px-md q-py-sm shadow-premium text-weight-bold btn-hover"
          @click="openKwitansiDialog"
        />
      </div>
    </div>

    <!-- =====================================================================================
         SUMMARY CARDS / KPI APPROVAL
         ===================================================================================== -->
    <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
      <!-- Menunggu Approval -->
      <div class="col-12 col-sm-4">
        <q-card flat class="list-card rounded-20 bg-white">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-caption text-grey-6 text-bold tracking-widest uppercase font-10 q-mb-xs"
              >
                MENUNGGU REVIEW
              </div>
              <div class="text-h4 text-weight-black text-orange-9">{{ pendingCount }}</div>
            </div>
            <div class="col-auto">
              <q-avatar
                size="54px"
                color="orange-1"
                text-color="orange-9"
                icon="pending_actions"
                class="shadow-sm rounded-12"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Disetujui -->
      <div class="col-12 col-sm-4">
        <q-card flat class="list-card rounded-20 bg-white">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-caption text-grey-6 text-bold tracking-widest uppercase font-10 q-mb-xs"
              >
                INVOICE DISETUJUI
              </div>
              <div class="text-h4 text-weight-black text-positive">{{ approvedCount }}</div>
            </div>
            <div class="col-auto">
              <q-avatar
                size="54px"
                color="green-1"
                text-color="positive"
                icon="fact_check"
                class="shadow-sm rounded-12"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Ditolak -->
      <div class="col-12 col-sm-4">
        <q-card flat class="list-card rounded-20 bg-white">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-caption text-grey-6 text-bold tracking-widest uppercase font-10 q-mb-xs"
              >
                INVOICE DITOLAK
              </div>
              <div class="text-h4 text-weight-black text-negative">{{ rejectedCount }}</div>
            </div>
            <div class="col-auto">
              <q-avatar
                size="54px"
                color="red-1"
                text-color="negative"
                icon="cancel_presentation"
                class="shadow-sm rounded-12"
              />
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
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchQuery"
              outlined
              dense
              rounded
              placeholder="Cari No. Invoice atau Klien..."
              bg-color="white"
              class="search-input"
            >
              <template v-slot:prepend><q-icon name="search" color="indigo-10" /></template>
              <template v-slot:append v-if="searchQuery"
                ><q-icon name="close" @click="searchQuery = ''" class="cursor-pointer"
              /></template>
            </q-input>
          </div>
          <q-space />

          <!-- TABS FILTER STATUS & EXPORT DROPDOWN -->
          <div class="col-12 col-md-auto row items-center q-gutter-md">
            <q-tabs
              v-model="tabFilter"
              dense
              class="text-grey-7 bg-grey-1 rounded-12 p-1"
              active-color="indigo-10"
              indicator-color="transparent"
              active-bg-color="white"
              align="justify"
              narrow-indicator
            >
              <q-tab name="ALL" label="Semua" class="text-weight-bold rounded-12 q-px-md" />
              <q-tab name="Pending" label="Menunggu" class="text-weight-bold rounded-12 q-px-md" />
              <q-tab
                name="Approved"
                label="Disetujui"
                class="text-weight-bold rounded-12 q-px-md"
              />
              <q-tab name="Rejected" label="Ditolak" class="text-weight-bold rounded-12 q-px-md" />
            </q-tabs>

            <!-- EXPORT DROPDOWN BUTTON -->
            <q-btn-dropdown
              unelevated
              rounded
              color="indigo-10"
              icon="file_download"
              label="Export Laporan"
              class="shadow-1 font-bold q-px-md btn-hover"
            >
              <q-list style="min-width: 180px">
                <q-item clickable v-ripple @click="exportListToPDF" class="q-py-md hover-blue-btn">
                  <q-item-section avatar>
                    <q-avatar color="red-1" text-color="red-9" icon="picture_as_pdf" size="sm" />
                  </q-item-section>
                  <q-item-section class="text-weight-bold text-red-9">Export PDF</q-item-section>
                </q-item>
                <q-separator />
                <q-item
                  clickable
                  v-ripple
                  @click="exportListToExcel"
                  class="q-py-md hover-blue-btn"
                >
                  <q-item-section avatar>
                    <q-avatar color="green-1" text-color="green-9" icon="table_view" size="sm" />
                  </q-item-section>
                  <q-item-section class="text-weight-bold text-green-9"
                    >Export Excel</q-item-section
                  >
                </q-item>
              </q-list>
            </q-btn-dropdown>

            <q-btn flat round icon="refresh" color="indigo-10" @click="fetchData" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- =====================================================================================
         MAIN TABLE DATA
         ===================================================================================== -->
    <q-card
      flat
      bordered
      class="rounded-20 shadow-sm overflow-hidden bg-white no-print border-indigo-thin"
    >
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
            @click="openReviewDialog(props.row)"
          >
            <q-td key="invoice">
              <div class="row items-center no-wrap">
                <q-avatar
                  size="36px"
                  color="indigo-1"
                  text-color="indigo-10"
                  icon="receipt_long"
                  class="q-mr-md shadow-sm rounded-12"
                />
                <div>
                  <div
                    class="text-weight-bold text-blue-grey-10 text-subtitle2 leading-none q-mb-xs"
                  >
                    {{ props.row.nomor_invoice }}
                  </div>
                  <div class="text-caption text-grey-6 uppercase text-weight-medium">
                    KLIEN:
                    <span class="text-blue-grey-9 text-bold">{{ props.row.customer_nama }}</span>
                  </div>
                </div>
              </div>
            </q-td>

            <q-td key="proyek">
              <div class="text-weight-bold text-blue-grey-9 uppercase font-11">
                {{ props.row.proyek_nama || '-' }}
              </div>
              <div class="text-caption text-grey-6 font-10">
                SPK: {{ props.row.spk_nomor || '-' }}
              </div>
            </q-td>

            <q-td key="nominal" class="text-right">
              <div class="text-weight-bolder text-indigo-10 text-subtitle2">
                Rp {{ (props.row.grand_total || 0).toLocaleString('id-ID') }}
              </div>
              <div class="text-caption text-grey-6 font-10 q-mt-xs">
                {{ formatDateIndo(props.row.tanggal) }}
              </div>
            </q-td>

            <q-td key="status_approval" class="text-center">
              <q-chip
                dense
                :color="getApprovalColor(props.row.approval_status).bg"
                :text-color="getApprovalColor(props.row.approval_status).text"
                class="text-weight-bold font-10 uppercase q-ma-none shadow-sm q-px-md"
              >
                <q-icon
                  :name="getApprovalColor(props.row.approval_status).icon"
                  size="xs"
                  class="q-mr-xs"
                />
                {{ props.row.approval_status || 'Pending' }}
              </q-chip>
            </q-td>

            <q-td key="aksi" class="text-center" @click.stop>
              <q-btn
                unelevated
                rounded
                :color="
                  props.row.approval_status === 'Pending' || !props.row.approval_status
                    ? 'primary'
                    : 'grey-7'
                "
                icon="plagiarism"
                :label="
                  props.row.approval_status === 'Pending' || !props.row.approval_status
                    ? 'Review'
                    : 'Lihat'
                "
                size="sm"
                class="text-weight-bold q-px-md shadow-1"
                @click="openReviewDialog(props.row)"
              />
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="fact_check" size="64px" class="q-mb-md opacity-50" />
            <div class="text-h6 full-width text-center">Data invoice pada filter ini kosong.</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- =====================================================================================
         DIALOG REVIEW INVOICE (TTD REMOVED AS REQUESTED)
         ===================================================================================== -->
    <q-dialog v-model="showReview" maximized transition-show="fade" transition-hide="fade">
      <q-card class="column no-wrap bg-grey-4">
        <q-toolbar class="bg-white text-indigo-10 q-py-sm no-print shadow-4 shrink">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-weight-bold uppercase tracking-widest font-11">
            TINJAU DOKUMEN INVOICE
          </q-toolbar-title>
          <q-space />

          <!-- TOMBOL AKSI APPROVAL (TANDA TANGAN DIHAPUS SEBAGAIMANA GAMBAR 1) -->
          <div
            class="row q-gutter-md items-center"
            v-if="
              selectedInv &&
              (!selectedInv.approval_status || selectedInv.approval_status === 'Pending')
            "
          >
            <q-btn
              unelevated
              color="negative"
              icon="cancel"
              label="TOLAK INVOICE"
              class="rounded-12 text-weight-bold q-px-lg shadow-2 btn-hover"
              @click="handleReject(selectedInv)"
              :loading="isProcessing"
            />
            <q-btn
              unelevated
              color="positive"
              icon="check_circle"
              label="SETUJUI INVOICE"
              class="rounded-12 text-weight-bold q-px-lg shadow-2 btn-hover"
              @click="handleApprove(selectedInv)"
              :loading="isProcessing"
            />
          </div>

          <!-- JIKA SUDAH DIPROSES -->
          <div
            v-else
            class="row items-center text-weight-bold q-pr-md"
            :class="selectedInv?.approval_status === 'Approved' ? 'text-green-6' : 'text-red-6'"
          >
            <q-icon
              :name="selectedInv?.approval_status === 'Approved' ? 'check_circle' : 'cancel'"
              size="sm"
              class="q-mr-sm"
            />
            DOKUMEN INI TELAH DI{{
              selectedInv?.approval_status === 'Approved' ? 'SETUJUI' : 'TOLAK'
            }}
          </div>

          <q-btn-group unelevated rounded class="shadow-2 q-ml-lg">
            <q-btn
              color="primary"
              icon="print"
              label="Cetak"
              @click="printInvoice"
              class="q-px-md"
            />
            <q-btn color="red-9" icon="picture_as_pdf" label="Download PDF" @click="exportToPDF" />
          </q-btn-group>
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl flex flex-center preview-container">
          <!-- KERTAS PDF INVOICE -->
          <div id="invoice-pdf-area" class="letter-paper shadow-24" v-if="selectedInv">
            <!-- HEADER (Logo & PT Name ONLY) -->
            <div class="row no-wrap items-center q-mb-md">
              <img :src="config.kopUrl || 'icons/logo-agra.png'" class="final-kop-img q-mr-md" />
              <div>
                <div
                  class="text-weight-bolder uppercase"
                  style="color: #2b579a; font-size: 20px; letter-spacing: 0.5px"
                >
                  {{ config.nama_pt || 'PT. AGRA ABHINAYA PERKASA' }}
                </div>
                <div
                  style="font-size: 9px; color: #555"
                  class="q-mt-xs text-uppercase text-weight-bold"
                >
                  {{ config.slogan_pt || 'GENERAL CONSTRUCTION AND GENERAL SUPPLY' }}
                </div>
                <div style="font-size: 9px; color: #777" class="q-mt-xs">
                  {{
                    config.alamat_pt ||
                    'Jl. Tegal Danas No. 9A, Sertajaya, Cikarang Timur, Kabupaten Bekasi, Jawa Barat 17530'
                  }}
                </div>
              </div>
            </div>

            <!-- GARIS PEMBATAS HEADER (Biru) -->
            <div
              style="height: 3px; background-color: #2b579a; width: 100%; margin-bottom: 25px"
            ></div>

            <!-- INFO NOMOR, TANGGAL & KLIEN (Layout Rapi) -->
            <div class="row q-col-gutter-lg q-mb-xl">
              <!-- KIRI: Tagihan Kepada, Proyek -->
              <div class="col-7">
                <div
                  class="text-grey-6 text-bold tracking-widest uppercase q-mb-sm"
                  style="font-size: 10px"
                >
                  TAGIHAN KEPADA :
                </div>
                <div
                  class="text-h6 text-weight-bold uppercase"
                  style="color: #2b579a; letter-spacing: 0.5px"
                >
                  {{ selectedInv.customer_nama }}
                </div>
                <div class="text-grey-9 q-mb-lg" style="font-size: 12px; line-height: 1.4">
                  {{ selectedInv.customer_alamat }}
                </div>

                <table class="text-grey-9 text-left" style="font-size: 11px; width: 100%">
                  <tr>
                    <td width="90" class="q-pb-xs">Proyek</td>
                    <td width="15" class="text-center q-pb-xs">:</td>
                    <td class="text-weight-bold uppercase q-pb-xs">
                      {{ selectedInv.proyek_nama || '-' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="q-pb-xs">SPK / PO Ref</td>
                    <td class="q-pb-xs">:</td>
                    <td class="text-weight-bold uppercase q-pb-xs">
                      {{ selectedInv.spk_nomor || '-' }}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- KANAN: Title, Nomor, Tanggal -->
              <div class="col-5 text-right flex column items-end">
                <div
                  class="text-weight-900 text-italic"
                  style="color: #2b579a; font-size: 36px; letter-spacing: 2px; line-height: 1"
                >
                  INVOICE
                </div>
                <div class="text-weight-bold text-grey-9 q-mt-sm q-mb-lg" style="font-size: 14px">
                  # {{ selectedInv.nomor_invoice }}
                </div>

                <table class="text-grey-9" style="font-size: 11px; margin-left: auto">
                  <tr>
                    <td width="80" class="text-left q-pb-xs">Tanggal</td>
                    <td width="15" class="text-center q-pb-xs">:</td>
                    <td class="text-weight-bold text-black text-left q-pb-xs">
                      {{ formatDateIndo(selectedInv.tanggal) }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-left q-pb-xs">Jatuh Tempo</td>
                    <td class="text-center q-pb-xs">:</td>
                    <td class="text-weight-bold text-negative text-left q-pb-xs">
                      {{ formatDateIndo(selectedInv.jatuh_tempo) }}
                    </td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- TABEL TAGIHAN UTAMA -->
            <table class="pdf-table full-width">
              <thead>
                <tr>
                  <th width="40" class="text-center">NO</th>
                  <th class="text-center">DESKRIPSI PEKERJAAN / TAGIHAN</th>
                  <th width="160" class="text-center">JUMLAH (IDR)</th>
                </tr>
              </thead>
              <tbody>
                <!-- Item Rows -->
                <tr v-for="(item, i) in selectedInv.items" :key="i">
                  <td
                    class="text-center text-weight-bold border-bottom-none border-top-none"
                    style="vertical-align: top; padding-top: 10px"
                  >
                    {{ i + 1 }}
                  </td>
                  <td
                    class="q-px-md q-py-sm border-bottom-none border-top-none"
                    style="vertical-align: top"
                  >
                    <div class="text-weight-bold uppercase">{{ item.judul || item.uraian }}</div>
                    <div
                      class="text-grey-8"
                      style="font-size: 10px; margin-top: 4px"
                      v-if="item.deskripsi"
                    >
                      {{ item.deskripsi }}
                    </div>
                  </td>
                  <td
                    class="text-right q-px-md border-bottom-none border-top-none"
                    style="vertical-align: top; padding-top: 10px"
                  >
                    {{ (item.nominal || 0).toLocaleString('id-ID', { minimumFractionDigits: 0 }) }}
                  </td>
                </tr>

                <!-- Blank Filler Row (untuk space ke subtotal) -->
                <tr>
                  <td class="border-top-none border-bottom-none" style="height: 15px"></td>
                  <td class="border-top-none border-bottom-none"></td>
                  <td class="border-top-none border-bottom-none"></td>
                </tr>

                <!-- Subtotals -->
                <tr class="row-calculation">
                  <td
                    class="border-none-right border-bottom-none"
                    style="background: white !important"
                  ></td>
                  <td
                    class="q-px-md q-py-sm text-right border-left-blue text-weight-bold"
                    style="font-size: 10px"
                  >
                    Subtotal (DPP)
                  </td>
                  <td class="text-right q-px-md text-weight-bold">
                    Rp
                    {{
                      (selectedInv.nilai_dpp || 0).toLocaleString('id-ID', {
                        minimumFractionDigits: 0,
                      })
                    }}
                  </td>
                </tr>
                <tr class="row-calculation" v-if="selectedInv.ppn_persen > 0">
                  <td
                    class="border-none-right border-bottom-none border-top-none"
                    style="background: white !important"
                  ></td>
                  <td
                    class="q-px-md q-py-sm text-right border-left-blue text-weight-bold"
                    style="font-size: 10px"
                  >
                    PPN ({{ selectedInv.ppn_persen }}%)
                  </td>
                  <td class="text-right q-px-md text-weight-bold">
                    Rp
                    {{
                      (selectedInv.ppn_nominal || 0).toLocaleString('id-ID', {
                        minimumFractionDigits: 0,
                      })
                    }}
                  </td>
                </tr>
                <tr class="row-calculation" v-if="selectedInv.pph_persen > 0">
                  <td
                    class="border-none-right border-bottom-none border-top-none"
                    style="background: white !important"
                  ></td>
                  <td
                    class="q-px-md q-py-sm text-right border-left-blue text-weight-bold text-negative"
                    style="font-size: 10px"
                  >
                    Potongan PPh ({{ selectedInv.pph_persen }}%)
                  </td>
                  <td class="text-right q-px-md text-weight-bold text-negative">
                    - Rp
                    {{
                      (selectedInv.pph_nominal || 0).toLocaleString('id-ID', {
                        minimumFractionDigits: 0,
                      })
                    }}
                  </td>
                </tr>
                <tr class="row-grand-total">
                  <td
                    colspan="2"
                    class="text-center text-weight-bold uppercase tracking-widest text-subtitle2"
                    style="font-size: 11px"
                  >
                    TOTAL TAGIHAN (GRAND TOTAL)
                  </td>
                  <td class="text-right text-weight-bold q-px-md" style="font-size: 13px">
                    Rp
                    {{
                      (selectedInv.grand_total || 0).toLocaleString('id-ID', {
                        minimumFractionDigits: 0,
                      })
                    }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- TERBILANG -->
            <div
              class="bg-grey-2 q-pa-md rounded-borders text-blue-grey-9 q-mb-xl q-mt-md"
              style="font-size: 11px; border: 1px solid #e0e0e0"
            >
              <div class="text-weight-bold q-mb-xs">Terbilang :</div>
              <div># {{ terbilangRupiah(selectedInv.grand_total) }} Rupiah #</div>
            </div>

            <!-- FOOTER INFO (PEMBAYARAN & TTD) -->
            <div class="row q-col-gutter-xl text-body2">
              <div class="col-7">
                <div
                  class="text-weight-bold uppercase tracking-widest q-mb-sm"
                  style="color: #2b579a; font-size: 11px"
                >
                  INSTRUKSI PEMBAYARAN
                </div>
                <div class="text-grey-7 q-mb-md" style="font-size: 10px">
                  Mohon lakukan pembayaran penuh (full amount) ke rekening berikut:
                </div>

                <table class="bank-table-bordered text-weight-bold text-blue-grey-9">
                  <tr>
                    <td width="90" class="q-px-md bg-grey-2">Bank</td>
                    <td class="text-uppercase" style="color: #2b579a">
                      : {{ selectedInv.rek_bank }}
                    </td>
                  </tr>
                  <tr>
                    <td class="q-px-md bg-grey-2">No. Rekening</td>
                    <td class="text-primary">: {{ selectedInv.rek_nomor }}</td>
                  </tr>
                  <tr>
                    <td class="q-px-md bg-grey-2">Atas Nama</td>
                    <td class="text-uppercase text-grey-8">: {{ selectedInv.rek_nama }}</td>
                  </tr>
                </table>

                <div
                  class="text-grey-8 q-mt-md"
                  style="font-size: 9.5px"
                  v-if="selectedInv.keterangan"
                >
                  <span class="text-bold">Catatan Tambahan:</span><br />{{ selectedInv.keterangan }}
                </div>
              </div>

              <div class="col-5 text-center flex column justify-between items-center pt-lg">
                <div class="text-weight-bold q-mb-xl" style="font-size: 11.5px">Hormat Kami,</div>

                <!-- TANDA TANGAN (KHUSUS UNTUK HALAMAN APPROVAL) -->
                <div
                  class="final-sign-space flex flex-center"
                  style="
                    height: 60px;
                    position: relative;
                    width: 100%;
                    margin-top: -30px;
                    margin-bottom: 10px;
                  "
                >
                  <img
                    v-if="selectedInv.signatureUrl"
                    :src="selectedInv.signatureUrl"
                    style="
                      max-height: 70px;
                      max-width: 200px;
                      object-fit: contain;
                      mix-blend-mode: multiply;
                    "
                  />
                  <div
                    v-else
                    style="height: 60px"
                    class="flex flex-center text-grey-4 italic font-8"
                  >
                    -
                  </div>
                </div>

                <div
                  class="text-weight-bold uppercase q-px-xl q-pb-xs"
                  style="color: #2b579a; border-bottom: 1px solid #2b579a; font-size: 11.5px"
                >
                  {{ config.nama_pt || 'PT AGRA ABHINAYA PERKASA' }}
                </div>
                <div class="text-grey-6 text-bold q-mt-xs" style="font-size: 9.5px">
                  Manajemen Keuangan
                </div>
              </div>
            </div>

            <!-- Bottom Thick Border -->
            <div style="margin-top: 40px; border-bottom: 6px solid #2b579a"></div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- =====================================================================================
         NEW MODAL: DIALOG BUAT KWITANSI BARU (SOP AGRA IDENTIK DENGAN GAMBAR 2)
         ===================================================================================== -->
    <q-dialog
      v-model="showKwitansiDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-2 column no-wrap font-pro">
        <q-toolbar class="bg-white text-indigo-10 q-py-md shadow-2 shrink">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest font-11">
            PENERBITAN KWITANSI RESMI
          </q-toolbar-title>
          <q-btn
            unelevated
            color="red-9"
            icon="picture_as_pdf"
            label="DOWNLOAD KWITANSI"
            rounded
            class="q-px-xl text-weight-bold shadow-3"
            @click="exportKwitansiToPDF"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-md-11 col-lg-10">
              <div class="row q-col-gutter-lg">
                <!-- FORM CONFIG KIRI -->
                <div class="col-12 col-md-5 no-print">
                  <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1">
                    <q-card-section
                      class="bg-indigo-1 q-py-sm text-indigo-10 text-weight-bold flex items-center border-bottom"
                    >
                      <q-icon name="apartment" class="q-mr-xs" /> 1. KOP SURAT PERUSAHAAN
                    </q-card-section>
                    <q-card-section class="q-pa-md q-gutter-y-md text-left">
                      <div>
                        <div class="label-req q-mb-xs">Logo Kop / Kwitansi</div>
                        <q-file
                          outlined
                          dense
                          v-model="tempKopKwt"
                          label="Pilih File Logo..."
                          accept="image/*"
                          @update:model-value="handleKwtLogo"
                          bg-color="white"
                        >
                          <template v-slot:prepend><q-icon name="cloud_upload" /></template>
                        </q-file>
                      </div>
                      <q-input
                        outlined
                        dense
                        v-model="kwtForm.nama_pt"
                        label="Nama Perusahaan (Header)"
                        stack-label
                        bg-color="white"
                      />
                      <q-input
                        outlined
                        dense
                        v-model="kwtForm.slogan_pt"
                        label="Slogan / Bidang Usaha"
                        stack-label
                        bg-color="white"
                      />
                      <q-input
                        outlined
                        dense
                        v-model="kwtForm.alamat_pt"
                        label="Alamat Detail Perusahaan"
                        stack-label
                        bg-color="white"
                      />
                    </q-card-section>
                  </q-card>

                  <q-card flat bordered class="rounded-20 bg-white shadow-1">
                    <q-card-section
                      class="bg-indigo-1 q-py-sm text-indigo-10 text-weight-bold flex items-center border-bottom"
                    >
                      <q-icon name="person" class="q-mr-xs" /> 2. INFORMASI PENERIMAAN (AUTO-FILL)
                    </q-card-section>
                    <q-card-section class="q-pa-md q-gutter-y-md text-left">
                      <div>
                        <div class="label-req q-mb-xs text-primary">Cari Data Customer *</div>
                        <!-- PLACEHOLDER DINAMIS: Otomatis hilang jika customer telah terpilih -->
                        <q-select
                          outlined
                          dense
                          v-model="kwtForm.customer_ref"
                          :options="optCustomer"
                          option-label="nama"
                          :placeholder="kwtForm.customer_ref ? '' : 'Pilih Customer...'"
                          bg-color="blue-50"
                          use-input
                          @filter="filterCustomer"
                          @update:model-value="onKwtCustomerSelect"
                        />
                      </div>
                      <q-input
                        outlined
                        dense
                        v-model="kwtForm.customer_nama"
                        label="Telah Diterima Dari"
                        stack-label
                        bg-color="white"
                        class="text-weight-bold uppercase"
                      />
                      <q-input
                        outlined
                        dense
                        v-model="kwtForm.proyek_nama"
                        label="Nama Proyek (Terisi Otomatis)"
                        stack-label
                        bg-color="grey-2"
                        class="text-weight-bold uppercase"
                      />
                      <q-input
                        outlined
                        dense
                        v-model="kwtForm.spk_nomor"
                        label="Nomor SPK / Rujukan (Terisi Otomatis)"
                        stack-label
                        bg-color="grey-2"
                        class="font-mono text-weight-bold uppercase"
                      />
                      <q-input
                        outlined
                        dense
                        type="textarea"
                        rows="3"
                        v-model="kwtForm.untuk_pembayaran"
                        label="Uraian Untuk Pembayaran"
                        placeholder="Rincian termin, addendum dll..."
                        stack-label
                        bg-color="white"
                      />

                      <div class="row q-col-gutter-sm">
                        <div class="col-6">
                          <q-input
                            outlined
                            dense
                            type="number"
                            v-model.number="kwtForm.nominal"
                            label="Jumlah Rp."
                            stack-label
                            bg-color="white"
                            class="text-weight-bold text-indigo-10"
                            @update:model-value="onNominalKwtChange"
                          />
                        </div>
                        <div class="col-6">
                          <q-input
                            outlined
                            dense
                            v-model="kwtForm.nomor_kwt"
                            label="No. Kwitansi (Override)"
                            stack-label
                            bg-color="white"
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <q-card flat bordered class="rounded-20 q-mt-md bg-white shadow-1">
                    <q-card-section
                      class="bg-indigo-1 q-py-sm text-indigo-10 text-weight-bold flex items-center border-bottom"
                    >
                      <q-icon name="border_color" class="q-mr-xs" /> 3. DATA PENGESAHAN (SIGNATURE)
                    </q-card-section>
                    <q-card-section class="q-pa-md q-gutter-y-md text-left">
                      <div class="row q-col-gutter-sm">
                        <div class="col-6">
                          <q-input
                            outlined
                            dense
                            v-model="kwtForm.tempat_terbit"
                            label="Tempat Terbit"
                            stack-label
                            bg-color="white"
                          />
                        </div>
                        <div class="col-6">
                          <q-input
                            outlined
                            dense
                            type="date"
                            v-model="kwtForm.tanggal"
                            label="Tanggal Kwitansi"
                            stack-label
                            bg-color="white"
                          />
                        </div>
                      </div>
                      <q-input
                        outlined
                        dense
                        v-model="kwtForm.direktur"
                        label="Direktur Utama (Nama)"
                        stack-label
                        bg-color="white"
                        class="text-weight-bold uppercase"
                      />
                    </q-card-section>
                  </q-card>
                </div>

                <!-- PREVIEW PRINT KERTAS KANAN (KEMBAR 100% SEPERTI GAMBAR 2) -->
                <div class="col-12 col-md-7">
                  <div id="kwitansi-pdf-area" class="letter-paper kwitansi-paper shadow-24">
                    <!-- TOP THICK BLUE BAR (SESUAI CONTOH GAMBAR) -->
                    <div
                      style="
                        height: 10px;
                        background-color: #2b579a;
                        width: 100%;
                        margin-bottom: 15px;
                      "
                    ></div>

                    <!-- KOP SURAT (IDENTIK DENGAN INVOICE & KOP RESMI) -->
                    <div class="row no-wrap items-center justify-between">
                      <div class="row no-wrap items-center">
                        <img
                          :src="kwtForm.logoUrl || 'icons/logo-agra.png'"
                          class="final-kop-img q-mr-md"
                        />
                        <div class="text-left">
                          <div
                            class="text-weight-bolder uppercase text-indigo-10 font-14"
                            style="line-height: 1.1"
                          >
                            {{ kwtForm.nama_pt }}
                          </div>
                          <div
                            class="text-pt-tagline italic text-blue-grey-9 q-mt-xs font-9 uppercase text-weight-bold"
                          >
                            {{ kwtForm.slogan_pt }}
                          </div>
                          <div
                            class="q-mt-xs text-grey-7 font-9"
                            style="line-height: 1.3; max-width: 380px"
                          >
                            {{ kwtForm.alamat_pt }}
                          </div>
                        </div>
                      </div>

                      <!-- TITLE KWITANSI SISI KANAN HEADER -->
                      <div class="text-right">
                        <div
                          class="text-weight-black uppercase font-mono tracking-widest text-h5"
                          style="color: #000; font-family: sans-serif"
                        >
                          KWITANSI
                        </div>
                        <div class="text-weight-bold text-caption text-grey-8 q-mt-xs font-mono">
                          {{ kwtForm.nomor_kwt || 'No. Kwitansi' }}
                        </div>
                      </div>
                    </div>

                    <!-- BLUE BORDER DIVIDER -->
                    <div
                      style="
                        height: 3px;
                        background-color: #2b579a;
                        width: 100%;
                        margin-top: 10px;
                        margin-bottom: 20px;
                      "
                    ></div>

                    <!-- KONTEN KWITANSI UTAMA -->
                    <div
                      class="column q-gutter-y-md text-left text-body2"
                      style="
                        font-family: Arial, Helvetica, sans-serif !important;
                        color: #000 !important;
                        font-size: 13.5px;
                      "
                    >
                      <!-- Telah Diterima Dari -->
                      <div class="row no-wrap items-start">
                        <div class="kwt-label text-weight-bold">Telah diterima dari</div>
                        <div class="kwt-separator">:</div>
                        <div class="col text-weight-bold uppercase">
                          {{
                            kwtForm.customer_nama ||
                            '..................................................................'
                          }}
                        </div>
                      </div>

                      <!-- Nama Proyek -->
                      <div class="row no-wrap items-start">
                        <div class="kwt-label text-weight-bold">Nama Proyek</div>
                        <div class="kwt-separator">:</div>
                        <div class="col text-weight-medium uppercase text-grey-9">
                          {{
                            kwtForm.proyek_nama ||
                            '..................................................................'
                          }}
                        </div>
                      </div>

                      <!-- Terbilang (HIGHLIGHT DOUBLE LINES BIRU) -->
                      <div
                        class="kwt-terbilang-container q-py-sm text-weight-bolder text-italic text-indigo-10"
                      >
                        <div class="row no-wrap items-start">
                          <div
                            class="kwt-label-terbilang text-weight-bold text-black"
                            style="font-style: normal"
                          >
                            Terbilang
                          </div>
                          <div
                            class="kwt-separator-terbilang text-black"
                            style="font-style: normal"
                          >
                            :
                          </div>
                          <div class="col" style="color: #2b579a">
                            # {{ kwtForm.terbilang || 'Nol' }} Rupiah #
                          </div>
                        </div>
                      </div>

                      <!-- Untuk Pembayaran -->
                      <div class="row no-wrap items-start">
                        <div class="kwt-label text-weight-bold">Untuk Pembayaran</div>
                        <div class="kwt-separator">:</div>
                        <div
                          class="col leading-relaxed"
                          style="white-space: pre-wrap; font-size: 13px"
                        >
                          {{
                            kwtForm.untuk_pembayaran ||
                            '..................................................................'
                          }}
                        </div>
                      </div>
                    </div>

                    <!-- JUMLAH RUPIAH & PENGESAHAN (BOTTOM) -->
                    <div class="row justify-between items-end q-mt-auto" style="margin-top: 50px">
                      <!-- KOTAK JUMLAH RP (SISI KIRI BAWAH) -->
                      <div
                        class="kwt-amount-box text-weight-black text-h5 text-indigo-10 font-mono"
                      >
                        <div class="row no-wrap items-center">
                          <span
                            style="
                              font-style: italic;
                              font-weight: bold;
                              font-size: 16px;
                              margin-right: 25px;
                              color: #000;
                            "
                            >Jumlah Rp.</span
                          >
                          <span>{{ (kwtForm.nominal || 0).toLocaleString('id-ID') }}</span>
                        </div>
                      </div>

                      <!-- TANDA TANGAN (SISI KANAN BAWAH) -->
                      <div class="text-center font-13" style="width: 250px">
                        <div class="text-weight-bold text-grey-8 font-mono">
                          {{ kwtForm.tempat_terbit }},
                          {{ kwtForm.tanggal ? formatDateIndo(kwtForm.tanggal) : '-' }}
                        </div>
                        <div class="text-weight-bold text-black q-mt-xs q-mb-xl">
                          Diterima oleh,
                        </div>

                        <!-- Signature Space -->
                        <div style="height: 45px"></div>

                        <div
                          class="text-weight-bold text-black text-uppercase font-bold underline"
                          style="
                            border-bottom: 2px solid #000;
                            display: inline-block;
                            min-width: 160px;
                            font-size: 14px;
                          "
                        >
                          {{ kwtForm.direktur }}
                        </div>
                        <div class="text-caption text-weight-bold text-grey-7 q-mt-xs">
                          Direktur Utama
                        </div>
                      </div>
                    </div>

                    <!-- BOTTOM BLUE THICK BAR (PENUTUP) -->
                    <div
                      style="margin-top: 40px; border-bottom: 8px solid #2b579a; width: 100%"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- HIDDEN TEMPLATE UNTUK EXPORT REKAP DAFTAR INVOICE (PORTRAIT, ANTI-CUT, BERWARNA) -->
    <div style="display: none">
      <div id="list-print-area" class="report-paper">
        <div
          class="report-header"
          style="
            background: linear-gradient(90deg, #1a237e 0%, #3949ab 100%);
            padding: 18px;
            border-radius: 12px;
            color: white;
            display: flex;
            align-items: center;
            margin-bottom: 25px;
          "
        >
          <div
            class="report-icon"
            style="
              background-color: rgba(255, 255, 255, 0.2);
              border-radius: 8px;
              width: 45px;
              height: 45px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 15px;
            "
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div>
            <h1
              class="report-title"
              style="
                margin: 0;
                font-size: 20px;
                font-weight: 900;
                letter-spacing: 0.5px;
                color: white !important;
              "
            >
              LAPORAN REKAPITULASI APPROVAL INVOICE
            </h1>
            <div
              class="report-subtitle"
              style="
                font-size: 11px;
                font-weight: bold;
                margin-top: 3px;
                opacity: 0.9;
                color: white !important;
              "
            >
              Filter Status: {{ tabFilter }} | Diekspor pada:
              {{ new Date().toLocaleString('id-ID') }}
            </div>
          </div>
        </div>

        <table
          class="report-table"
          style="
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-top: 15px;
            border: 1px solid #1a237e;
          "
        >
          <thead>
            <tr>
              <th
                style="
                  background-color: #1a237e;
                  color: white;
                  padding: 12px 6px;
                  border: 1px solid #1a237e;
                  text-align: center;
                  width: 40px;
                  font-weight: 900;
                "
              >
                NO
              </th>
              <th
                style="
                  background-color: #1a237e;
                  color: white;
                  padding: 12px 6px;
                  border: 1px solid #1a237e;
                  text-align: left;
                  font-weight: 900;
                "
              >
                NO. INVOICE
              </th>
              <th
                style="
                  background-color: #1a237e;
                  color: white;
                  padding: 12px 6px;
                  border: 1px solid #1a237e;
                  text-align: left;
                  font-weight: 900;
                "
              >
                CUSTOMER / KLIEN
              </th>
              <th
                style="
                  background-color: #1a237e;
                  color: white;
                  padding: 12px 6px;
                  border: 1px solid #1a237e;
                  text-align: left;
                  font-weight: 900;
                "
              >
                PROYEK & SPK
              </th>
              <th
                style="
                  background-color: #1a237e;
                  color: white;
                  padding: 12px 6px;
                  border: 1px solid #1a237e;
                  text-align: right;
                  width: 140px;
                  font-weight: 900;
                "
              >
                NOMINAL (Rp)
              </th>
              <th
                style="
                  background-color: #1a237e;
                  color: white;
                  padding: 12px 6px;
                  border: 1px solid #1a237e;
                  text-align: center;
                  width: 90px;
                  font-weight: 900;
                "
              >
                APPROVAL
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- SAKLEK ANTI-POTONG: Ditambahkan style avoid break agar baris data tidak terpotong di tengah halaman -->
            <tr
              v-for="(row, idx) in filteredRows"
              :key="row.id"
              :style="
                (idx % 2 !== 0 ? 'background-color: #f8f9fa;' : '') +
                ' page-break-inside: avoid; break-inside: avoid;'
              "
              class="pdf-row"
            >
              <td
                style="
                  padding: 10px 6px;
                  border: 1px solid #e0e0e0;
                  text-align: center;
                  font-weight: bold;
                "
              >
                {{ idx + 1 }}
              </td>
              <td
                style="
                  padding: 10px 6px;
                  border: 1px solid #e0e0e0;
                  font-weight: 900;
                  color: #1a237e;
                "
              >
                {{ row.nomor_invoice }}
              </td>
              <td
                style="
                  padding: 10px 6px;
                  border: 1px solid #e0e0e0;
                  font-weight: bold;
                  text-transform: uppercase;
                "
              >
                {{ row.customer_nama }}
              </td>
              <td style="padding: 10px 6px; border: 1px solid #e0e0e0">
                <div style="font-weight: bold; text-transform: uppercase; color: #333">
                  {{ row.proyek_nama || '-' }}
                </div>
                <div style="color: #666; font-size: 10px; margin-top: 2px">
                  SPK: {{ row.spk_nomor || '-' }}
                </div>
              </td>
              <td
                style="
                  padding: 10px 6px;
                  border: 1px solid #e0e0e0;
                  text-align: right;
                  font-weight: 900;
                  color: #1a237e;
                "
              >
                Rp {{ (row.grand_total || 0).toLocaleString('id-ID') }}
              </td>
              <td
                style="
                  padding: 10px 6px;
                  border: 1px solid #e0e0e0;
                  text-align: center;
                  font-weight: 900;
                  text-transform: uppercase;
                  font-size: 11px;
                "
                :style="{
                  color:
                    row.approval_status === 'Approved'
                      ? '#2e7d32'
                      : row.approval_status === 'Rejected'
                        ? '#c62828'
                        : '#e65100',
                }"
              >
                {{ row.approval_status || 'Pending' }}
              </td>
            </tr>
            <tr v-if="filteredRows.length === 0">
              <td
                colspan="6"
                style="
                  padding: 25px;
                  border: 1px solid #e0e0e0;
                  text-align: center;
                  font-style: italic;
                  color: #888;
                "
              >
                Tidak ada data pada filter saat ini.
              </td>
            </tr>
          </tbody>
        </table>

        <div
          style="
            margin-top: 50px;
            text-align: center;
            font-size: 9px;
            color: #888;
            font-style: italic;
          "
        >
          Dokumen ini di-generate secara otomatis oleh Sistem AGRA ERP.
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
// eslint-disable-next-line no-unused-vars
import { ref, onMounted, onUnmounted, computed, reactive } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  getDocs,
  where,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()

// State
const rows = ref([])
const loading = ref(true)
const isProcessing = ref(false)
const searchQuery = ref('')
const tabFilter = ref('ALL') // DEFAULT DIUBAH KE ALL AGAR TIDAK HILANG DARI LIST
const showReview = ref(false)
const selectedInv = ref(null)

// NEW STATES: Kwitansi Dialog
const showKwitansiDialog = ref(false)
const masterCustomer = ref([])
const optCustomer = ref([])
const tempKopKwt = ref(null)

const kwtFormDefault = {
  logoUrl: '',
  nama_pt: 'PT AGRA ABHINAYA PERKASA',
  slogan_pt: 'GENERAL CONSTRUCTION AND GENERAL SUPPLY',
  alamat_pt:
    'Jl. Tegal Danas No. 9A, Sertajaya, Cikarang Timur, Kabupaten Bekasi, Jawa Barat 17530',
  nomor_kwt: '',
  customer_ref: null,
  customer_nama: '',
  proyek_nama: '',
  spk_nomor: '',
  untuk_pembayaran: '',
  nominal: 0,
  terbilang: '',
  tempat_terbit: 'Jakarta',
  tanggal: new Date().toISOString().substr(0, 10),
  direktur: 'Deni Purwanti',
}
const kwtForm = ref({ ...kwtFormDefault })

const config = ref({
  kopUrl: '',
  nama_pt: 'PT. AGRA ABHINAYA PERKASA',
  alamat_pt: '',
  slogan_pt: '',
  direktur: 'Deni Purwanti',
})

let unsubInvoice = null

// Columns
const columns = [
  {
    name: 'invoice',
    align: 'left',
    label: 'NO INVOICE & KLIEN',
    field: 'nomor_invoice',
    sortable: true,
  },
  {
    name: 'proyek',
    align: 'left',
    label: 'REFERENSI PROYEK',
    field: 'proyek_nama',
    sortable: true,
  },
  { name: 'nominal', align: 'right', label: 'GRAND TOTAL', field: 'grand_total', sortable: true },
  {
    name: 'status_approval',
    align: 'center',
    label: 'APPROVAL',
    field: 'approval_status',
    sortable: true,
  },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]

// Fetch Data
const fetchData = async () => {
  loading.value = true

  // Config Kop Surat
  const confSnap = await getDoc(doc(db, 'config', 'perusahaan'))
  if (confSnap.exists()) config.value = confSnap.data()

  // Ambil Data Master Customer untuk dropdown Kwitansi
  const snapCust = await getDocs(collection(db, 'customer'))
  masterCustomer.value = snapCust.docs.map((d) => ({ id: d.id, ...d.data() }))
  optCustomer.value = [...masterCustomer.value]

  // Data Invoice Customer
  const qInv = query(collection(db, 'finance_invoice_customer'), orderBy('createdAt', 'desc'))
  unsubInvoice = onSnapshot(qInv, (snap) => {
    rows.value = snap.docs.map((d) => {
      const data = d.data()
      if (!data.approval_status) data.approval_status = 'Pending'
      return { id: d.id, ...data }
    })
    loading.value = false
  })
}

// KPI Counts
const pendingCount = computed(
  () => rows.value.filter((r) => r.approval_status === 'Pending').length,
)
const approvedCount = computed(
  () => rows.value.filter((r) => r.approval_status === 'Approved').length,
)
const rejectedCount = computed(
  () => rows.value.filter((r) => r.approval_status === 'Rejected').length,
)

// Filters
const filteredRows = computed(() => {
  let data = rows.value

  if (tabFilter.value !== 'ALL') {
    data = data.filter((r) => r.approval_status === tabFilter.value)
  }

  if (searchQuery.value) {
    const lower = searchQuery.value.toLowerCase()
    data = data.filter(
      (r) =>
        r.nomor_invoice?.toLowerCase().includes(lower) ||
        r.customer_nama?.toLowerCase().includes(lower),
    )
  }
  return data
})

// Dialog Review
const openReviewDialog = (row) => {
  selectedInv.value = row
  showReview.value = true
}

// Approval Actions
const handleApprove = (row) => {
  $q.dialog({
    title: '<span class="text-positive text-weight-bold">Konfirmasi Approval</span>',
    message: `Anda akan <b>MENYETUJUI</b> penerbitan Invoice <b>${row.nomor_invoice}</b>. Invoice ini akan diubah statusnya menjadi <b>Terkirim</b>. Lanjutkan?`,
    html: true,
    cancel: { label: 'Batal', flat: true },
    ok: { label: 'Ya, Setujui', color: 'positive', rounded: true, unelevated: true },
  }).onOk(async () => {
    isProcessing.value = true
    $q.loading.show({ message: 'Menyetujui Invoice...' })
    try {
      await updateDoc(doc(db, 'finance_invoice_customer', row.id), {
        approval_status: 'Approved',
        status: 'Terkirim',
        approvedAt: serverTimestamp(),
      })
      selectedInv.value.approval_status = 'Approved'
      $q.notify({ type: 'positive', message: 'Invoice berhasil disetujui!' })
      showReview.value = false
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', message: 'Gagal memproses approval.' })
    } finally {
      isProcessing.value = false
      $q.loading.hide()
    }
  })
}

const handleReject = (row) => {
  $q.dialog({
    title: '<span class="text-negative text-weight-bold">Tolak Invoice</span>',
    message: `Berikan alasan/catatan penolakan untuk <b>${row.nomor_invoice}</b>:`,
    html: true,
    prompt: {
      model: '',
      type: 'text',
      placeholder: 'Alasan penolakan...',
    },
    cancel: { label: 'Batal', flat: true },
    ok: { label: 'Tolak', color: 'negative', rounded: true, unelevated: true },
  }).onOk(async (reason) => {
    isProcessing.value = true
    $q.loading.show({ message: 'Menolak Invoice...' })
    try {
      await updateDoc(doc(db, 'finance_invoice_customer', row.id), {
        approval_status: 'Rejected',
        reject_reason: reason || 'Ditolak oleh Manajemen',
        status: 'Draft',
        rejectedAt: serverTimestamp(),
      })
      selectedInv.value.approval_status = 'Rejected'
      $q.notify({ type: 'warning', message: 'Invoice telah ditolak dan dikembalikan ke Draft.' })
      showReview.value = false
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', message: 'Gagal memproses penolakan.' })
    } finally {
      isProcessing.value = false
      $q.loading.hide()
    }
  })
}

// =============================================================================
// LOGIKA KWITANSI BARU (SOP PENARIKAN AUTO & INTEGRASI)
// =============================================================================
const openKwitansiDialog = () => {
  tempKopKwt.value = null
  const randomNo = Math.floor(100 + Math.random() * 900)
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][
    new Date().getMonth()
  ]
  const year = new Date().getFullYear()

  kwtForm.value = {
    ...kwtFormDefault,
    logoUrl: config.value.kopUrl || '',
    nama_pt: config.value.nama_pt || config.value.nama_perusahaan || kwtFormDefault.nama_pt,
    slogan_pt: config.value.slogan_pt || config.value.slogan_perusahaan || kwtFormDefault.slogan_pt,
    alamat_pt: config.value.alamat_pt || kwtFormDefault.alamat_pt,
    nomor_kwt: `${randomNo}/AAP-KSO/KWT/${roman}/${year}`,
    direktur: config.value.direktur || kwtFormDefault.direktur,
  }
  showKwitansiDialog.value = true
}

const filterCustomer = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    optCustomer.value = masterCustomer.value.filter(
      (v) => v.nama?.toLowerCase().indexOf(needle) > -1,
    )
  })
}

const onKwtCustomerSelect = async (val) => {
  if (val) {
    kwtForm.value.customer_nama = val.nama || ''
    $q.loading.show({ message: 'Mencari rujukan kontrak & proyek...' })
    try {
      // 1. CARI PROYEK KLIEN YANG KONSUMENNYA COCOK
      const qProj = query(collection(db, 'proyek'), where('konsumen', '==', val.nama))
      const snapProj = await getDocs(qProj)

      if (!snapProj.empty) {
        const projDoc = snapProj.docs[0]
        kwtForm.value.proyek_nama = projDoc.data().nama_proyek || projDoc.data().nama || ''

        // 2. CARI SPK AKTIF UNTUK PROYEK INI
        const qSpk = query(collection(db, 'spk_customer'), where('projectId', '==', projDoc.id))
        const snapSpk = await getDocs(qSpk)

        if (!snapSpk.empty) {
          const spkData = snapSpk.docs[0].data()
          kwtForm.value.spk_nomor = spkData.nomor_spk || spkData.nomor || ''
          kwtForm.value.nominal = spkData.nilai_total || 0
          kwtForm.value.terbilang = terbilangRupiah(spkData.nilai_total)

          // Auto Mapping: Untuk Pembayaran
          kwtForm.value.untuk_pembayaran = `Nama Kontrak : ${spkData.nama_kontrak || '-'}\nNomor Kontrak : ${spkData.nomor_spk || '-'}`
        } else {
          kwtForm.value.spk_nomor = ''
          kwtForm.value.untuk_pembayaran = ''
          kwtForm.value.nominal = 0
          kwtForm.value.terbilang = 'Nol'
        }
      } else {
        // 3. CARI SPK DIRECT JIKA PROYEK TIDAK DITEMUKAN
        const qSpkDirect = query(
          collection(db, 'spk_customer'),
          where('customer_nama', '==', val.nama),
        )
        const snapSpkDirect = await getDocs(qSpkDirect)
        if (!snapSpkDirect.empty) {
          const spkData = snapSpkDirect.docs[0].data()
          kwtForm.value.proyek_nama = spkData.nama_kontrak || '-'
          kwtForm.value.spk_nomor = spkData.nomor_spk || spkData.nomor || ''
          kwtForm.value.nominal = spkData.nilai_total || 0
          kwtForm.value.terbilang = terbilangRupiah(spkData.nilai_total)
          kwtForm.value.untuk_pembayaran = `Nama Kontrak : ${spkData.nama_kontrak || '-'}\nNomor Kontrak : ${spkData.nomor_spk || '-'}`
        } else {
          kwtForm.value.proyek_nama = ''
          kwtForm.value.spk_nomor = ''
          kwtForm.value.untuk_pembayaran = ''
          kwtForm.value.nominal = 0
          kwtForm.value.terbilang = 'Nol'
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      $q.loading.hide()
    }
  } else {
    kwtForm.value.customer_nama = ''
    kwtForm.value.proyek_nama = ''
    kwtForm.value.spk_nomor = ''
    kwtForm.value.untuk_pembayaran = ''
    kwtForm.value.nominal = 0
    kwtForm.value.terbilang = 'Nol'
  }
}

const onNominalKwtChange = (val) => {
  kwtForm.value.terbilang = terbilangRupiah(Number(val) || 0)
}

const resizeImageToBase64 = (file, maxWidth = 400) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scaleSize = maxWidth / img.width
        canvas.width = maxWidth
        canvas.height = img.height * scaleSize
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/png', 0.8))
      }
    }
    reader.onerror = (error) => reject(error)
  })
}

const handleKwtLogo = (file) => {
  if (!file) return
  resizeImageToBase64(file, 300).then((base64) => {
    kwtForm.value.logoUrl = base64
  })
}

const exportKwitansiToPDF = () => {
  const e = document.getElementById('kwitansi-pdf-area')
  const filename = `KWITANSI_${kwtForm.value.nomor_kwt.replace(/\//g, '-')}.pdf`
  const opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 3, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  $q.loading.show({ message: 'Mengekspor Kwitansi Resmi PDF...' })
  html2pdf()
    .set(opt)
    .from(e)
    .save()
    .then(() => $q.loading.hide())
}

// =============================================================================
// LOGIKA EXPORT REKAPITULASI DAFTAR APPROVAL (PDF & EXCEL BERWARNA)
// =============================================================================
const exportListToPDF = () => {
  if (filteredRows.value.length === 0) {
    return $q.notify({ type: 'warning', message: 'Tabel kosong, tidak ada data untuk diekspor.' })
  }

  $q.loading.show({ message: 'Mengonversi Laporan Rekap (PDF Portrait)...' })
  setTimeout(() => {
    const element = document.getElementById('list-print-area')
    const opt = {
      margin: [15, 12, 15, 12],
      filename: `Laporan_Approval_Invoice_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2.5, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.pdf-row', 'thead', 'tbody'] },
    }
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        $q.loading.hide()
        $q.notify({ type: 'positive', message: 'Laporan PDF Berhasil Diunduh!', position: 'top' })
      })
      .catch((err) => {
        console.error(err)
        $q.loading.hide()
      })
  }, 800)
}

const exportListToExcel = () => {
  if (filteredRows.value.length === 0) {
    return $q.notify({ type: 'warning', message: 'Tabel kosong, tidak ada data untuk diekspor.' })
  }

  const now = new Date()
  const exportDate = now.toLocaleString('id-ID')

  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
    <meta charset="utf-8" />
    <style>
      .table-bordered { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 12px; border: 1px solid #1a237e; }
      .table-bordered th, .table-bordered td { border: 1px solid #dddddd; padding: 10px; vertical-align: middle; }
      .header-row th { background-color: #1a237e; color: #ffffff; font-weight: bold; text-align: left; }
      .title { font-size: 20px; font-weight: bold; color: #1a237e; font-family: sans-serif; text-align: center; }
      .subtitle { font-size: 12px; color: #666666; font-family: sans-serif; text-align: center; }
      .status-approved { color: #2e7d32; font-weight: bold; background-color: #e8f5e9; }
      .status-pending { color: #e65100; font-weight: bold; background-color: #fff3e0; }
      .status-rejected { color: #c62828; font-weight: bold; background-color: #ffebee; }
    </style>
    </head>
    <body>
      <div class="title">LAPORAN REKAPITULASI APPROVAL INVOICE CUSTOMER</div>
      <div class="subtitle">Filter Status: ${tabFilter.value} | Diekspor pada: ${exportDate}</div>
      <br>
      <table class="table-bordered">
        <tr class="header-row">
          <th width="50" style="text-align: center; background-color: #1a237e; color: white;">NO</th>
          <th width="150" style="background-color: #1a237e; color: white;">NO. INVOICE</th>
          <th width="200" style="background-color: #1a237e; color: white;">CUSTOMER / KLIEN</th>
          <th width="250" style="background-color: #1a237e; color: white;">PROYEK</th>
          <th width="180" style="background-color: #1a237e; color: white;">SPK / PO NO</th>
          <th width="120" style="background-color: #1a237e; color: white;">TANGGAL</th>
          <th width="150" style="text-align: right; background-color: #1a237e; color: white;">TOTAL TAGIHAN (Rp)</th>
          <th width="120" style="text-align: center; background-color: #1a237e; color: white;">STATUS</th>
        </tr>
  `

  let totalAmount = 0
  filteredRows.value.forEach((row, idx) => {
    totalAmount += row.grand_total || 0
    const bgRow = idx % 2 === 0 ? '#ffffff' : '#f8f9fa'
    const statusClass =
      row.approval_status === 'Approved'
        ? 'status-approved'
        : row.approval_status === 'Rejected'
          ? 'status-rejected'
          : 'status-pending'

    html += `
      <tr style="background-color: ${bgRow};">
        <td align="center" style="font-weight: bold;">${idx + 1}</td>
        <td style="font-weight: bold; color: #1a237e;">${row.nomor_invoice}</td>
        <td style="text-transform: uppercase; font-weight: bold;">${row.customer_nama}</td>
        <td>${row.proyek_nama || '-'}</td>
        <td>${row.spk_nomor || '-'}</td>
        <td align="center">${formatDateIndo(row.tanggal)}</td>
        <td align="right" style="font-weight: bold; color: #1a237e;">${row.grand_total || 0}</td>
        <td align="center" class="${statusClass}">${row.approval_status || 'Pending'}</td>
      </tr>
    `
  })

  html += `
        <tr>
          <td colspan="6" align="right" style="font-weight: bold; background-color: #f5f5f5;">GRAND TOTAL PIUTANG</td>
          <td align="right" style="font-weight: bold; color: #1a237e; font-size: 14px; background-color: #f5f5f5;">${totalAmount}</td>
          <td style="background-color: #f5f5f5;"></td>
        </tr>
      </table>
    </body>
    </html>
  `

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Laporan_Approval_Invoice_${Date.now()}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// --- UTILS (FORMAT & TERBILANG) ---
const formatDateIndo = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const getApprovalColor = (status) => {
  switch (status) {
    case 'Pending':
      return { bg: 'orange-1', text: 'orange-10', icon: 'pending' }
    case 'Approved':
      return { bg: 'green-1', text: 'green-10', icon: 'check_circle' }
    case 'Rejected':
      return { bg: 'red-1', text: 'red-10', icon: 'cancel' }
    default:
      return { bg: 'orange-1', text: 'orange-10', icon: 'pending' }
  }
}

// Algoritma Terbilang Rupiah
const terbilangRupiah = (angka) => {
  if (!angka) return 'Nol'
  const bilangan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ]
  const bagi = (num) => {
    if (num < 12) return bilangan[num]
    if (num < 20) return bilangan[num - 10] + ' Belas'
    if (num < 100) return bilangan[Math.floor(num / 10)] + ' Puluh ' + bilangan[num % 10]
    if (num < 200) return 'Seratus ' + bagi(num - 100)
    if (num < 1000) return bilangan[Math.floor(num / 100)] + ' Ratus ' + bagi(num % 100)
    if (num < 2000) return 'Seribu ' + bagi(num - 1000)
    if (num < 1000000) return bagi(Math.floor(num / 1000)) + ' Ribu ' + bagi(num % 1000)
    if (num < 1000000000) return bagi(Math.floor(num / 1000000)) + ' Juta ' + bagi(num % 1000000)
    if (num < 1000000000000)
      return bagi(Math.floor(num / 1000000000)) + ' Miliar ' + bagi(num % 1000000000)
    return 'Angka terlalu besar'
  }
  let str = bagi(Math.floor(angka)).trim()
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// PDF EXPORT SINGLE INVOICE
const printInvoice = () => window.print()
const exportToPDF = () => {
  const e = document.getElementById('invoice-pdf-area')
  const opt = {
    margin: 0,
    filename: `INVOICE_${selectedInv.value.nomor_invoice.replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 3, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  $q.loading.show({ message: 'Mengekspor Invoice PDF...' })
  html2pdf()
    .set(opt)
    .from(e)
    .save()
    .then(() => $q.loading.hide())
}

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  if (unsubInvoice) unsubInvoice()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.font-pro {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.text-weight-900 {
  font-weight: 900;
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
.border-indigo-thin {
  border: 1px solid rgba(26, 35, 126, 0.1);
}

.list-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}
.list-card:hover {
  border-color: #1a237e;
  box-shadow: 0 12px 25px rgba(26, 35, 126, 0.12);
  transform: translateY(-3px);
  transition: all 0.3s ease;
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
  background-color: rgba(26, 35, 126, 0.03) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
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

.search-input :deep(.q-field__control) {
  border-radius: 30px;
}

/* =======================================================================
   PDF PREVIEW STYLES (CLEAN & PROFESSIONAL BLUE INVOICE / KWITANSI)
   ======================================================================= */
.letter-paper {
  background: white !important;
  width: 210mm;
  min-height: 296mm;
  padding: 15mm 20mm;
  margin: 0 auto;
  color: #1a1a1a;
  line-height: 1.5;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
}
.final-kop-img {
  height: 60px;
  width: auto;
  object-fit: contain;
}

.pdf-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-family: Arial, Helvetica, sans-serif;
}
.pdf-table th {
  background: #2b579a !important;
  color: white !important;
  padding: 6px 8px;
  font-size: 10px;
  font-weight: bold;
  border: 1px solid #2b579a;
  text-align: center;
}
.pdf-table td {
  padding: 4px 8px;
  border: 1px solid #2b579a;
  font-size: 11px;
  color: #111;
}

/* Border utilities untuk tabel subtotal */
.border-left-blue {
  border-left: 1px solid #2b579a !important;
}
.border-top-none {
  border-top: none !important;
}
.border-bottom-none {
  border-bottom: none !important;
}
.border-none-right {
  border-right: none !important;
}
.no-padding {
  padding: 0 !important;
}

.bank-table-bordered {
  border-collapse: collapse;
  width: 100%;
  max-width: 380px;
}
.bank-table-bordered td {
  border: 1px solid #2b579a !important;
  padding: 6px 12px;
  font-size: 10.5px;
}

/* =======================================================================
   REKAP PDF STYLES (HIDDEN TEMPLATE LIST IN PORTRAIT)
   ======================================================================= */
.report-paper {
  font-family: 'Inter', Helvetica, Arial, sans-serif;
  color: #333;
  padding: 10px;
  background: white;
}
.report-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 3px solid #1a237e;
  padding-bottom: 15px;
}
.report-icon {
  background-color: #1a237e;
  border-radius: 8px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.report-title {
  margin: 0;
  color: white !important;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.5px;
  line-height: 1.2;
}
.report-subtitle {
  color: rgba(255, 255, 255, 0.95) !important;
  font-size: 12px;
  margin-top: 4px;
  font-weight: bold;
}
.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}
.report-table th {
  background-color: #1a237e;
  color: white;
  padding: 12px;
  border: 1px solid #e0e0e0;
  text-transform: uppercase;
  font-weight: 800;
}
.report-table td {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
}
.report-table tr:nth-child(even) {
  background-color: #f8f9fa;
}

/* SAKLEK ANTI-POTONG: Baris rekap tidak terpotong halaman */
.report-table tr {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
  page-break-after: auto !important;
}
.pdf-row {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}

/* =======================================================================
   SOP KWITANSI STYLING (IDENTIK KEMBAR 100% GAMBAR 2)
   ======================================================================= */
.kwitansi-paper {
  font-family: Arial, Helvetica, sans-serif !important;
  color: #000 !important;
  font-size: 14px;
}
.kwt-label {
  width: 180px;
  color: #333 !important;
  font-size: 13.5px;
}
.kwt-separator {
  width: 25px;
  font-weight: bold;
}
.kwt-terbilang-container {
  border-top: 1.5px solid #2b579a !important;
  border-bottom: 1.5px solid #2b579a !important;
  font-size: 14px;
  line-height: 1.5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.kwt-label-terbilang {
  width: 180px;
  font-size: 14px;
}
.kwt-separator-terbilang {
  width: 25px;
  font-weight: bold;
}
.kwt-amount-box {
  border: 2px solid #2b579a !important;
  padding: 10px 25px;
  min-width: 320px;
  background-color: #f8fafc !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.bg-blue-50 {
  background-color: #f0f4ff !important;
}
.label-req {
  font-size: 11px;
  font-weight: 800;
  color: #444;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.border-bottom {
  border-bottom: 1px solid #edf2f7;
}
.btn-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(26, 35, 126, 0.3) !important;
}

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
  .letter-paper {
    box-shadow: none !important;
    margin: 0 !important;
    width: 210mm !important;
  }
  .pdf-table th {
    background-color: #2b579a !important;
    color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .row-calculation {
    background-color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .bg-grey-1 {
    background-color: #f5f5f5 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .bg-grey-2 {
    background-color: #eeeeee !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
