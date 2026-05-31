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
         SCREEN 1: LOCK SCREEN JIKA TIDAK MEMILIKI AKSES LIHAT
         ===================================================================================== -->
    <div
      v-if="!canAction('lihat')"
      class="row flex-center q-pa-xl text-center font-pro animate-fade"
      style="min-height: 70vh"
    >
      <div
        class="col-12 col-sm-8 col-md-6 bg-white q-pa-xl rounded-20 shadow-premium border-teal-thin"
      >
        <q-avatar size="100px" color="red-1" text-color="red-10" icon="lock" class="q-mb-md" />
        <div class="text-h5 text-weight-bold text-blue-grey-10 q-mb-xs">Akses Terbatas</div>
        <div class="text-body2 text-grey-7 q-mb-lg leading-relaxed">
          Maaf, Anda tidak memiliki izin untuk melihat modul Approval Invoice. Silakan hubungi
          Administrator atau Super Admin untuk konfigurasi hak akses Anda.
        </div>
        <q-btn
          label="Kembali ke Beranda"
          color="teal-10"
          icon="arrow_back"
          rounded
          unelevated
          no-caps
          @click="$router.push('/manufaktur/dashboard')"
          class="btn-teal-main"
        />
      </div>
    </div>

    <!-- =====================================================================================
         SCREEN 2: KONTEN UTAMA JIKA AKSES OK
         ===================================================================================== -->
    <div v-else>
      <!-- HEADER SECTION (BACK BUTTON TELAH DIHAPUS) -->
      <div class="row items-center justify-between q-mb-xl animate-fade no-print">
        <div class="col-12 col-md-8">
          <div class="row items-center no-wrap">
            <div>
              <div class="text-h4 text-weight-bolder text-teal-10 leading-tight">
                Approval Invoice
                <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
                  Otorisasi Penagihan (AR)
                </span>
              </div>
              <div class="text-subtitle1 text-grey-7 q-mt-sm">
                Tinjau, setujui, atau tolak draf invoice pelanggan sebelum dikirimkan ke pihak
                eksternal.
              </div>
            </div>
          </div>
        </div>

        <!-- ACTION BUTTON: BUAT KWITANSI BARU (MEMBENTANG PADA HP) -->
        <div class="col-12 col-md-auto q-mt-md q-mt-md-none btn-kwitansi-wrapper">
          <q-btn
            color="teal-10"
            icon="receipt"
            label="Buat Kwitansi"
            unelevated
            rounded
            no-caps
            class="q-px-md q-py-sm shadow-premium text-weight-bold btn-teal-main full-width-mobile"
            @click="clickCreateKwitansi"
          />
        </div>
      </div>

      <!-- SUMMARY CARDS / KPI APPROVAL (WARNA WARNI LUCU DAN GORGEOUS SESUAI CONTOH) -->
      <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
        <!-- Menunggu Approval (Gradien Amber/Orange Kreatif) -->
        <div class="col-12 col-sm-4">
          <q-card flat class="list-card rounded-20 card-orange-gradient text-white">
            <q-card-section class="row items-center no-wrap q-pa-md">
              <div class="col">
                <div
                  class="text-caption text-bold tracking-widest uppercase font-10 q-mb-xs"
                  style="color: rgba(255, 255, 255, 0.85)"
                >
                  MENUNGGU REVIEW
                </div>
                <div class="text-h3 text-weight-black">{{ pendingCount }}</div>
              </div>
              <div class="col-auto">
                <q-avatar
                  size="54px"
                  color="white"
                  text-color="orange-9"
                  icon="pending_actions"
                  class="shadow-premium rounded-12"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Disetujui (Gradien Teal Elegan) -->
        <div class="col-12 col-sm-4">
          <q-card flat class="list-card rounded-20 card-teal-gradient text-white">
            <q-card-section class="row items-center no-wrap q-pa-md">
              <div class="col">
                <div
                  class="text-caption text-bold tracking-widest uppercase font-10 q-mb-xs"
                  style="color: rgba(255, 255, 255, 0.85)"
                >
                  INVOICE DISETUJUI
                </div>
                <div class="text-h3 text-weight-black">{{ approvedCount }}</div>
              </div>
              <div class="col-auto">
                <q-avatar
                  size="54px"
                  color="white"
                  text-color="teal-9"
                  icon="fact_check"
                  class="shadow-premium rounded-12"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Ditolak (Gradien Red Coral Tegas) -->
        <div class="col-12 col-sm-4">
          <q-card flat class="list-card rounded-20 card-red-gradient text-white">
            <q-card-section class="row items-center no-wrap q-pa-md">
              <div class="col">
                <div
                  class="text-caption text-bold tracking-widest uppercase font-10 q-mb-xs"
                  style="color: rgba(255, 255, 255, 0.85)"
                >
                  INVOICE DITOLAK
                </div>
                <div class="text-h3 text-weight-black">{{ rejectedCount }}</div>
              </div>
              <div class="col-auto">
                <q-avatar
                  size="54px"
                  color="white"
                  text-color="negative"
                  icon="cancel_presentation"
                  class="shadow-premium rounded-12"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- SEARCH & FILTER AREA -->
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
                <template v-slot:prepend><q-icon name="search" color="teal-10" /></template>
                <template v-slot:append v-if="searchQuery">
                  <q-icon name="close" @click="searchQuery = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </div>
            <q-space />

            <!-- TABS FILTER STATUS & EXPORT DROPDOWN -->
            <div class="col-12 col-md-auto row items-center q-gutter-md">
              <q-tabs
                v-model="tabFilter"
                dense
                class="text-grey-7 bg-grey-1 rounded-12 p-1"
                active-color="teal-10"
                indicator-color="transparent"
                active-bg-color="white"
                align="justify"
                narrow-indicator
              >
                <q-tab name="ALL" label="Semua" class="text-weight-bold rounded-12 q-px-md" />
                <q-tab
                  name="Pending"
                  label="Menunggu"
                  class="text-weight-bold rounded-12 q-px-md"
                />
                <q-tab
                  name="Approved"
                  label="Disetujui"
                  class="text-weight-bold rounded-12 q-px-md"
                />
                <q-tab
                  name="Rejected"
                  label="Ditolak"
                  class="text-weight-bold rounded-12 q-px-md"
                />
              </q-tabs>

              <!-- EXPORT DROPDOWN BUTTON (TEMA TEAL) -->
              <q-btn-dropdown
                unelevated
                rounded
                color="teal-10"
                icon="file_download"
                label="Export Laporan"
                class="shadow-1 font-bold q-px-md btn-teal-main"
              >
                <q-list style="min-width: 180px">
                  <q-item
                    clickable
                    v-ripple
                    @click="exportListToPDF"
                    class="q-py-md hover-teal-btn"
                  >
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
                    class="q-py-md hover-teal-btn"
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

              <q-btn flat round icon="refresh" color="teal-10" @click="fetchData" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- MAIN TABLE DATA (MENGGUNAKAN KOLOM YANG DIKUNCI KHUSUS AGAR INDAH TANPA SCROLLBAR HORIZONTAL) -->
      <q-card
        flat
        bordered
        class="rounded-20 shadow-sm overflow-hidden bg-white no-print border-teal-thin"
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
              @click="openReviewDialog(props.row)"
            >
              <q-td key="invoice">
                <div class="row items-center no-wrap">
                  <q-avatar
                    size="36px"
                    color="teal-1"
                    text-color="teal-10"
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
                <div class="text-weight-bolder text-teal-10 text-subtitle2">
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
                      ? 'teal-9'
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
    </div>

    <!-- =====================================================================================
          DIALOG REVIEW INVOICE (SINKRONISASI TOTAL PREVIEW SAMA PERSIS DENGAN INVOICECUSTOMERPAGE)
          ===================================================================================== -->
    <q-dialog v-model="showReview" maximized transition-show="fade" transition-hide="fade">
      <q-card class="column no-wrap bg-grey-4">
        <q-toolbar class="bg-white text-teal-10 q-py-sm no-print shadow-4 shrink">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-weight-bold uppercase tracking-widest font-11">
            TINJAU DOKUMEN INVOICE
          </q-toolbar-title>
          <q-space />

          <!-- TOMBOL AKSI APPROVAL -->
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
              label="TOLAK"
              class="rounded-12 text-weight-bold q-px-lg shadow-2"
              @click="clickReject(selectedInv)"
              :loading="isProcessing"
            />
            <q-btn
              unelevated
              color="positive"
              icon="check_circle"
              label="SETUJUI INVOICE"
              class="rounded-12 text-weight-bold q-px-lg shadow-2"
              @click="clickApprove(selectedInv)"
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

          <!-- DOWNLOAD PDF SAJA -->
          <q-btn
            color="red-9"
            icon="picture_as_pdf"
            label="Download PDF"
            @click="exportToPDF"
            class="text-weight-bold q-ml-md"
            unelevated
            rounded
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl flex flex-center preview-container">
          <!-- KERTAS PDF INVOICE — IDENTIK SINKRON 100% DENGAN INVOICECUSTOMERPAGE -->
          <div id="invoice-pdf-area" class="letter-paper shadow-24" v-if="selectedInv">
            <!-- GARIS BIRU ATAS -->
            <div
              style="
                height: 6px;
                background-color: #2b579a;
                width: 100%;
                margin-bottom: 16px;
                border-radius: 2px;
              "
            ></div>
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
            <div
              style="height: 3px; background-color: #2b579a; width: 100%; margin-bottom: 25px"
            ></div>
            <div class="row q-col-gutter-lg q-mb-xl">
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
              <div class="col-5 text-right flex column items-end">
                <div
                  class="text-weight-900 text-italic"
                  style="color: #2b579a; font-size: 26px; letter-spacing: 2px; line-height: 1"
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
                </table>
              </div>
            </div>
            <table class="pdf-table full-width">
              <thead>
                <tr>
                  <th width="40" class="text-center">NO</th>
                  <th class="text-center">DESKRIPSI PEKERJAAN / TAGIHAN</th>
                  <th width="160" class="text-center">JUMLAH (IDR)</th>
                </tr>
              </thead>
              <tbody>
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
                    <div class="text-weight-bold">{{ item.judul || item.uraian }}</div>
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
                <tr>
                  <td class="border-top-none border-bottom-none" style="height: 15px"></td>
                  <td class="border-top-none border-bottom-none"></td>
                  <td class="border-top-none border-bottom-none"></td>
                </tr>
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
            <div
              class="bg-grey-2 q-pa-md rounded-borders text-blue-grey-9 q-mb-xl q-mt-md"
              style="font-size: 11px; border: 1px solid #e0e0e0"
            >
              <div class="text-weight-bold q-mb-xs">Terbilang :</div>
              <div># {{ terbilangRupiah(selectedInv.grand_total) }} Rupiah #</div>
            </div>
            <div class="row" style="margin-top: 24px">
              <!-- KIRI: Instruksi Pembayaran -->
              <div style="width: 58%; padding-right: 20px; box-sizing: border-box">
                <div
                  style="
                    color: #2b579a;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.8px;
                    text-transform: uppercase;
                    margin-bottom: 6px;
                  "
                >
                  INSTRUKSI PEMBAYARAN
                </div>
                <div style="font-size: 10px; color: #777; margin-bottom: 8px">
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
                  style="font-size: 9.5px; color: #555; margin-top: 10px"
                  v-if="selectedInv.keterangan"
                >
                  <span style="font-weight: 700">Catatan Tambahan:</span><br />{{
                    selectedInv.keterangan
                  }}
                </div>
              </div>

              <!-- KANAN: Tanda Tangan -->
              <div
                style="
                  width: 42%;
                  box-sizing: border-box;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  text-align: center;
                "
              >
                <!-- Nama PT (menggantikan "Hormat Kami,") -->
                <div
                  style="
                    color: #2b579a;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 48px;
                  "
                >
                  {{ config.nama_pt || 'PT AGRA ABHINAYA PERKASA' }}
                </div>

                <!-- Ruang tanda tangan -->
                <div
                  style="
                    height: 52px;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 6px;
                  "
                >
                  <img
                    v-if="selectedInv.signatureUrl"
                    :src="selectedInv.signatureUrl"
                    style="
                      max-height: 52px;
                      max-width: 180px;
                      object-fit: contain;
                      mix-blend-mode: multiply;
                    "
                  />
                </div>

                <!-- Nama italic + garis bawah -->
                <div
                  style="
                    font-style: italic;
                    font-weight: 700;
                    font-size: 12px;
                    color: #1a1a1a;
                    border-bottom: 1.5px solid #1a1a1a;
                    padding-bottom: 3px;
                    min-width: 180px;
                    margin-bottom: 5px;
                  "
                >
                  {{ selectedInv.ttd_nama || 'Deni Purwanti' }}
                </div>

                <!-- Jabatan -->
                <div style="font-size: 11px; color: #555; font-weight: 400">
                  {{ selectedInv.ttd_jabatan || 'Direktur Utama' }}
                </div>
              </div>
            </div>
            <div style="margin-top: 40px; border-bottom: 6px solid #2b579a"></div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- =====================================================================================
          DIALOG BUAT KWITANSI BARU
          ===================================================================================== -->
    <q-dialog
      v-model="showKwitansiDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-2 column no-wrap font-pro">
        <q-toolbar class="bg-white text-teal-10 q-py-md shadow-2 shrink">
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
                      class="bg-teal-1 q-py-sm text-teal-10 text-weight-bold flex items-center border-bottom"
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
                      class="bg-teal-1 q-py-sm text-teal-10 text-weight-bold flex items-center border-bottom"
                    >
                      <q-icon name="person" class="q-mr-xs" /> 2. INFORMASI PENERIMAAN (AUTO-FILL)
                    </q-card-section>
                    <q-card-section class="q-pa-md q-gutter-y-md text-left">
                      <div>
                        <div class="label-req q-mb-xs text-primary">Cari Data Customer *</div>
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
                            class="text-weight-bold text-teal-10"
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
                      class="bg-teal-1 q-py-sm text-teal-10 text-weight-bold flex items-center border-bottom"
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

                <!-- PREVIEW PRINT KERTAS KANAN -->
                <div class="col-12 col-md-7">
                  <div id="kwitansi-pdf-area" class="letter-paper kwitansi-paper shadow-24">
                    <!-- TOP THICK BLUE BAR -->
                    <div
                      style="
                        height: 10px;
                        background-color: #2b579a;
                        width: 100%;
                        margin-bottom: 15px;
                      "
                    ></div>

                    <!-- KOP SURAT -->
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

                      <!-- Terbilang -->
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

                    <!-- JUMLAH RUPIAH & PENGESAHAN -->
                    <div class="row justify-between items-end q-mt-auto" style="margin-top: 50px">
                      <!-- KOTAK JUMLAH RP -->
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

                      <!-- TANDA TANGAN -->
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

                    <!-- BOTTOM BLUE THICK BAR -->
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

    <!-- HIDDEN TEMPLATE UNTUK EXPORT REKAP DAFTAR INVOICE -->
    <div style="display: none">
      <div id="list-print-area" class="report-paper">
        <div
          class="report-header"
          style="
            background: linear-gradient(90deg, #004d40 0%, #00796b 100%);
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
            border: 1px solid #004d40;
          "
        >
          <thead>
            <tr>
              <th
                style="
                  background-color: #004d40;
                  color: white;
                  padding: 12px 6px;
                  border: 1px solid #004d40;
                  text-align: center;
                  width: 40px;
                  font-weight: 900;
                "
              >
                NO
              </th>
              <th
                style="
                  background-color: #004d40;
                  color: white;
                  padding: 12px 6px;
                  border: 1px solid #004d40;
                  text-align: left;
                  font-weight: 900;
                "
              >
                NO. INVOICE
              </th>
              <th
                style="
                  background-color: #004d40;
                  color: white;
                  padding: 12px 6px;
                  border: 1px solid #004d40;
                  text-align: left;
                  font-weight: 900;
                "
              >
                CUSTOMER / KLIEN
              </th>
              <th
                style="
                  background-color: #004d40;
                  color: white;
                  padding: 12px 6px;
                  border: 1px solid #004d40;
                  text-align: left;
                  font-weight: 900;
                "
              >
                PROYEK & SPK
              </th>
              <th
                style="
                  background-color: #004d40;
                  color: white;
                  padding: 12px 6px;
                  border: 1px solid #004d40;
                  text-align: right;
                  width: 140px;
                  font-weight: 900;
                "
              >
                NOMINAL (Rp)
              </th>
              <th
                style="
                  background-color: #004d40;
                  color: white;
                  padding: 12px 6px;
                  border: 1px solid #004d40;
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
                  color: #004d40;
                  text-align: center;
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
                  color: #004d40;
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
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
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const authStore = useAuthStore()

// State
const rows = ref([])
const loading = ref(true)
const isProcessing = ref(false)
const searchQuery = ref('')
const tabFilter = ref('ALL')
const showReview = ref(false)
const selectedInv = ref(null)

// DEFINISI REAKTIF UNTUK KOLOM (Menjamin Quasar tidak merender raw properties database secara acak)
const columns = ref([
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
])

// High fidelity SVG Vector definitions (Teal & Orange colored templates matching sample images 2 and 3)
const getConstructionSvg = (index) => {
  const svgs = [
    // 1. Hardhat Construction Worker Profile with background gears (Teal/Orange)
    `<svg viewBox="0 0 100 100" style="width: 100%; height: 100%;"><path d="M25,45 C25,25 75,25 75,45 Z" fill="#009688" /><rect x="18" y="42" width="64" height="6" rx="3" fill="#f59e0b" /><path d="M47,20 L53,20 L53,32 L47,32 Z" fill="#f59e0b" /><circle cx="50" cy="58" r="15" fill="#e0f2f1" /><circle cx="76" cy="65" r="9" fill="none" stroke="#ff781e" stroke-width="2.5" stroke-dasharray="3,1.5" /><path d="M28,82 C28,70 72,70 72,82 L72,92 L28,92 Z" fill="#00796b" /></svg>`,
    // 2. Draftsman Caliper Divider / Compass tool (Orange/Teal)
    `<svg viewBox="0 0 100 100" style="width: 100%; height: 100%;"><circle cx="50" cy="15" r="7" fill="#ff781e" /><line x1="50" y1="15" x2="32" y2="86" stroke="#ff781e" stroke-width="5.5" stroke-linecap="round" /><line x1="50" y1="15" x2="68" y2="86" stroke="#ff781e" stroke-width="5.5" stroke-linecap="round" /><line x1="38" y1="52" x2="62" y2="52" stroke="#009688" stroke-width="4.5" stroke-linecap="round" /></svg>`,
    // 3. High-rise Construction Building Grid Block (Teal/Mint)
    `<svg viewBox="0 0 100 100" style="width: 100%; height: 100%;"><rect x="25" y="12" width="50" height="78" rx="6" fill="#0d9488" /><rect x="34" y="22" width="11" height="11" rx="2" fill="#e0f2f1" /><rect x="55" y="22" width="11" height="11" rx="2" fill="#e0f2f1" /><rect x="34" y="42" width="11" height="11" rx="2" fill="#e0f2f1" /><rect x="55" y="42" width="11" height="11" rx="2" fill="#e0f2f1" /><rect x="34" y="62" width="11" height="11" rx="2" fill="#e0f2f1" /><rect x="55" y="62" width="11" height="11" rx="2" fill="#e0f2f1" /></svg>`,
    // 4. Heavy Excavator Crane / Bulldozer (Teal/Teal-dark)
    `<svg viewBox="0 0 100 100" style="width: 100%; height: 100%;"><rect x="18" y="74" width="54" height="13" rx="4" fill="#ff781e" /><circle cx="26" cy="80.5" r="5.5" fill="#1e293b" /><circle cx="45" cy="80.5" r="5.5" fill="#1e293b" /><circle cx="64" cy="80.5" r="5.5" fill="#1e293b" /><path d="M23,48 L46,48 L54,74 L23,74 Z" fill="#009688" /><line x1="46" y1="56" x2="78" y2="26" stroke="#ff781e" stroke-width="6" stroke-linecap="round" /><line x1="78" y1="26" x2="88" y2="52" stroke="#ff781e" stroke-width="4.5" stroke-linecap="round" /><path d="M82,48 L92,48 L87,62 L77,58 Z" fill="#00796b" /></svg>`,
    // 5. Crossed Hammer & Wrench Tool configuration (Mint/Amber)
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
  const size = (24 + Math.random() * 22).toFixed(0) // Estimasi ukuran ideal px
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

// Click Effect States
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

// Prettified Notifications (Posisikan di ATAS TENGAH - position: 'top')
function notify(opts) {
  const defaults = {
    position: 'top', // ATAS TENGAH sesuai permintaan
    timeout: 3000,
    classes: 'notify-modern',
    html: false,
  }

  const typeConfig = {
    positive: {
      color: 'white',
      textColor: 'teal-10',
      icon: 'check_circle',
      badgeColor: 'teal-10',
    },
    negative: {
      color: 'white',
      textColor: 'negative',
      icon: 'error',
      badgeColor: 'negative',
    },
    warning: {
      color: 'white',
      textColor: 'warning',
      icon: 'warning',
      badgeColor: 'warning',
    },
    info: {
      color: 'white',
      textColor: 'info',
      icon: 'info',
      badgeColor: 'info',
    },
  }

  const type = opts.type || 'info'
  const tc = typeConfig[type] || typeConfig.info

  $q.notify({
    ...defaults,
    color: tc.color,
    textColor: tc.textColor,
    icon: opts.icon || tc.icon,
    message: opts.message,
    caption: opts.caption || '',
    multiLine: false,
    actions: opts.actions || [],
    badgeColor: tc.badgeColor,
    ...opts,
  })
}

// Kwitansi Dialog
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

const userData = ref(null)
let unsubInvoice = null
let unsubUser = null

// Real-time Permission Control
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false

  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'manufaktur')
  if (!modulePerm || !modulePerm.isActive) return false

  const menu = modulePerm.menus.find((m) => {
    const idLower = m.id.toLowerCase()
    return idLower.endsWith('approval_invoice') || idLower.endsWith('approval-invoice')
  })
  if (!menu) return false

  if (actionType === 'setuju') return menu.approve || false
  return menu[actionType] || false
}

const showPermissionDenied = () => {
  notify({
    type: 'negative',
    icon: 'lock',
    message: 'Hak Akses Tertutup',
    caption: 'Silakan hubungi Super Admin untuk konfigurasi hak akses.',
    timeout: 3500,
  })
}

// Click Interceptors
const clickCreateKwitansi = () => {
  if (canAction('buat')) openKwitansiDialog()
  else showPermissionDenied()
}

const clickApprove = (row) => {
  if (canAction('setuju')) handleApprove(row)
  else showPermissionDenied()
}

const clickReject = (row) => {
  if (canAction('setuju')) handleReject(row)
  else showPermissionDenied()
}

// Fetch Data (Real-time compatibility)
const fetchData = async () => {
  loading.value = true

  const confSnap = await getDoc(doc(db, 'config_manufaktur', 'perusahaan'))
  if (confSnap.exists()) config.value = confSnap.data()

  const snapCust = await getDocs(
    query(collection(db, 'manufacturing_customers'), where('module', '==', 'manufacturing')),
  )
  masterCustomer.value = snapCust.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((item) => item.module === 'manufacturing')
  optCustomer.value = [...masterCustomer.value]

  const qInv = query(collection(db, 'finance_invoice_customer_manufactur'), orderBy('createdAt', 'desc'))
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

const filteredRows = computed(() => {
  let data = rows.value
  if (tabFilter.value !== 'ALL') data = data.filter((r) => r.approval_status === tabFilter.value)
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

const openReviewDialog = (row) => {
  selectedInv.value = row
  showReview.value = true
}

const handleApprove = (row) => {
  $q.dialog({
    title: '<span class="text-positive text-weight-bold">Konfirmasi Approval</span>',
    message: `Anda akan <b>MENYETUJUI</b> penerbitan Invoice <b>${row.nomor_invoice}</b>. Invoice ini akan diubah statusnya menjadi <b>Terkirim</b>. Lanjutkan?`,
    html: true,
    cancel: { label: 'Batal', flat: true, color: 'grey-7' },
    ok: { label: 'Ya, Setujui', color: 'positive', rounded: true, unelevated: true },
  }).onOk(async () => {
    isProcessing.value = true
    $q.loading.show({ message: 'Menyetujui Invoice...' })
    try {
      await updateDoc(doc(db, 'finance_invoice_customer_manufactur', row.id), {
        approval_status: 'Approved',
        status: 'Terkirim',
        approvedAt: serverTimestamp(),
      })
      selectedInv.value.approval_status = 'Approved'
      notify({
        type: 'positive',
        message: 'Otorisasi Berhasil!',
        caption: 'Invoice telah disetujui untuk diterbitkan.',
      })
      showReview.value = false
    } catch (e) {
      console.error(e)
      notify({ type: 'negative', message: 'Gagal memproses approval.' })
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
    prompt: { model: '', type: 'text', placeholder: 'Alasan penolakan...' },
    cancel: { label: 'Batal', flat: true, color: 'grey-7' },
    ok: { label: 'Tolak', color: 'negative', rounded: true, unelevated: true },
  }).onOk(async (reason) => {
    isProcessing.value = true
    $q.loading.show({ message: 'Menolak Invoice...' })
    try {
      await updateDoc(doc(db, 'finance_invoice_customer_manufactur', row.id), {
        approval_status: 'Rejected',
        reject_reason: reason || 'Ditolak oleh Manajemen',
        status: 'Draft',
        rejectedAt: serverTimestamp(),
      })
      selectedInv.value.approval_status = 'Rejected'
      notify({
        type: 'warning',
        message: 'Invoice Telah Ditolak!',
        caption: 'Status draf invoice dikembalikan ke status Draft.',
      })
      showReview.value = false
    } catch (e) {
      console.error(e)
      notify({ type: 'negative', message: 'Gagal memproses penolakan.' })
    } finally {
      isProcessing.value = false
      $q.loading.hide()
    }
  })
}

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
      const qProj = query(collection(db, 'manufactur_master_proyek'), where('konsumen', '==', val.nama))
      const snapProj = await getDocs(qProj)

      if (!snapProj.empty) {
        const projDoc = snapProj.docs[0]
        kwtForm.value.proyek_nama = projDoc.data().nama_proyek || projDoc.data().nama || ''
        const qSpk = query(collection(db, 'manufactur_master_proyek_spk'), where('projectId', '==', projDoc.id))
        const snapSpk = await getDocs(qSpk)

        if (!snapSpk.empty) {
          const spkData = snapSpk.docs[0].data()
          kwtForm.value.spk_nomor = spkData.nomor_spk || spkData.nomor || ''
          kwtForm.value.nominal = spkData.nilai_total || 0
          kwtForm.value.terbilang = terbilangRupiah(spkData.nilai_total)
          kwtForm.value.untuk_pembayaran = `Nama Kontrak : ${spkData.nama_kontrak || '-'}\nNomor Kontrak : ${spkData.nomor_spk || '-'}`
        } else {
          kwtForm.value.spk_nomor = ''
          kwtForm.value.untuk_pembayaran = ''
          kwtForm.value.nominal = 0
          kwtForm.value.terbilang = 'Nol'
        }
      } else {
        const qSpkDirect = query(
          collection(db, 'manufactur_master_proyek_spk'),
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

const exportListToPDF = () => {
  if (filteredRows.value.length === 0) {
    return notify({ type: 'warning', message: 'Tabel kosong, tidak ada data untuk diekspor.' })
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
        notify({ type: 'positive', message: 'Laporan PDF Berhasil Diunduh!' })
      })
      .catch((err) => {
        console.error(err)
        $q.loading.hide()
      })
  }, 800)
}

const exportListToExcel = () => {
  if (filteredRows.value.length === 0) {
    return notify({ type: 'warning', message: 'Tabel kosong, tidak ada data untuk diekspor.' })
  }
  const now = new Date()
  const exportDate = now.toLocaleString('id-ID')
  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
    <meta charset="utf-8" />
    <style>
      .table-bordered { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 12px; border: 1px solid #00796b; }
      .table-bordered th, .table-bordered td { border: 1px solid #dddddd; padding: 10px; vertical-align: middle; }
      .header-row th { background-color: #004d40; color: #ffffff; font-weight: bold; text-align: left; }
      .title { font-size: 20px; font-weight: bold; color: #004d40; font-family: sans-serif; text-align: center; }
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
          <th width="50" style="text-align: center; background-color: #004d40; color: white;">NO</th>
          <th width="150" style="background-color: #004d40; color: white;">NO. INVOICE</th>
          <th width="200" style="background-color: #004d40; color: white;">CUSTOMER / KLIEN</th>
          <th width="250" style="background-color: #004d40; color: white;">PROYEK</th>
          <th width="180" style="background-color: #004d40; color: white;">SPK / PO NO</th>
          <th width="120" style="background-color: #004d40; color: white;">TANGGAL</th>
          <th width="150" style="text-align: right; background-color: #004d40; color: white;">TOTAL TAGIHAN (Rp)</th>
          <th width="120" style="text-align: center; background-color: #004d40; color: white;">STATUS</th>
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
        <td style="font-weight: bold; color: #004d40;">${row.nomor_invoice}</td>
        <td style="text-transform: uppercase; font-weight: bold;">${row.customer_nama}</td>
        <td>${row.proyek_nama || '-'}</td>
        <td>${row.spk_nomor || '-'}</td>
        <td align="center">${formatDateIndo(row.tanggal)}</td>
        <td align="right" style="font-weight: bold; color: #004d40;">${row.grand_total || 0}</td>
        <td align="center" class="${statusClass}">${row.approval_status || 'Pending'}</td>
      </tr>
    `
  })
  html += `
        <tr>
          <td colspan="6" align="right" style="font-weight: bold; background-color: #f5f5f5;">GRAND TOTAL PIUTANG</td>
          <td align="right" style="font-weight: bold; color: #004d40; font-size: 14px; background-color: #f5f5f5;">${totalAmount}</td>
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

const formatDateIndo = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
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
  return bagi(Math.floor(angka))
    .trim()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

watch(
  () => authStore.user,
  (newUser) => {
    if (unsubUser) unsubUser()
    if (newUser?.email) {
      const qUser = query(collection(db, 'karyawan_manufaktur'), where('email', '==', newUser.email))
      unsubUser = onSnapshot(qUser, (snapshot) => {
        if (!snapshot.empty) {
          userData.value = snapshot.docs[0].data()
        }
      })
    }
  },
  { immediate: true },
)

onMounted(() => {
  fetchData()
  // Start floating icons every 1.5s
  floatingIconInterval = setInterval(spawnFloatingIcon, 1500)
  spawnFloatingIcon()
})

onUnmounted(() => {
  if (unsubInvoice) unsubInvoice()
  if (unsubUser) unsubUser()
  if (floatingIconInterval) clearInterval(floatingIconInterval)
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
  box-shadow: 0 10px 30px rgba(0, 150, 136, 0.15);
}
.border-teal-thin {
  border: 1px solid rgba(0, 150, 136, 0.18) !important;
}

/* =============================================
   TEAL BUTTONS & CUSTOM STYLING
   ============================================= */
.btn-teal-main {
  background: linear-gradient(135deg, #009688 0%, #00acc1 100%) !important;
  color: #fff !important;
  box-shadow: 0 6px 20px rgba(0, 150, 136, 0.3) !important;
  transition: all 0.3s ease !important;
}
.btn-teal-main:hover {
  box-shadow: 0 10px 28px rgba(0, 150, 136, 0.45) !important;
  transform: translateY(-1.5px) !important;
}

/* responsive full width kwitansi on mobile */
@media (max-width: 767px) {
  .btn-kwitansi-wrapper {
    width: 100%;
  }
  .full-width-mobile {
    width: 100% !important;
    justify-content: center !important;
    border-radius: 14px !important;
  }
}

/* =============================================
   WARNA-WARNI KPI GRADIENS (SAMA SEPERTI CONTOH)
   ============================================= */
.card-orange-gradient {
  background: linear-gradient(135deg, #f59e0b 0%, #ff781e 100%) !important;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35) !important;
}
.card-teal-gradient {
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%) !important;
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.35) !important;
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

/* =============================================
   TEAL COMPONENT CUSTOMS
   ============================================= */
.bg-teal-1 {
  background-color: #e0f2f1 !important;
}
.table-header-teal {
  background: linear-gradient(90deg, #00796b 0%, #009688 100%) !important;
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
.search-input :deep(.q-field__control:hover) {
  border-color: #009688 !important;
}

/* =======================================================================
   PDF PREVIEW STYLES (MATCHING 100% TO INVOICECUSTOMERPAGE)
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
   REKAP PDF STYLES
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
  border-bottom: 3px solid #004d40;
  padding-bottom: 15px;
}
.report-title {
  margin: 0;
  color: white !important;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.5px;
  line-height: 1.2;
}
.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}
.report-table th {
  background-color: #004d40;
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

.report-table tr {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}
.pdf-row {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}

/* =======================================================================
   SOP KWITANSI STYLING
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

/* =============================================
   BEAUTIFUL TEAL NOTIFICATIONS
   ============================================= */
:deep(.notify-modern) {
  border-radius: 16px !important;
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 150, 136, 0.08) !important;
  font-family: 'Plus Jakarta Sans', sans-serif !important;
  font-size: 14px !important;
  padding: 12px 18px !important;
  min-width: 280px !important;
  border-left: 4px solid #009688 !important;
}

:deep(.q-notification__message) {
  font-weight: 700 !important;
  font-size: 14px !important;
  line-height: 1.3 !important;
}

:deep(.q-notification__caption) {
  font-size: 12px !important;
  font-weight: 400 !important;
  opacity: 0.75 !important;
  margin-top: 2px !important;
}

:deep(.q-notification__icon) {
  font-size: 22px !important;
  margin-right: 10px !important;
}

.hover-teal-btn {
  transition: 0.3s;
}
.hover-teal-btn:hover {
  background-color: #e0f2f1 !important;
  color: #009688 !important;
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


