<template>
  <q-page class="bg-page q-pa-md font-pro relative-position">
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
          @click="$router.push('/')"
          class="btn-teal-main"
        />
      </div>
    </div>

    <!-- =====================================================================================
         SCREEN 2: KONTEN UTAMA JIKA AKSES OK
         ===================================================================================== -->
    <template v-else>
      <div class="page-content-wrapper">
        <!-- HEADER SECTION (BACK BUTTON TELAH DIHAPUS) -->
        <div class="row items-center justify-between q-mb-xl animate-fade no-print">
          <div class="col-12">
            <div class="row items-center no-wrap">
              <div>
                <div class="text-h4 text-weight-bolder leading-tight" style="color: #2b908a">
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
            <div class="row items-center justify-between q-col-gutter-md">
              <!-- SEARCH INPUT -->
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

              <!-- RIGHT SIDE CONTROLS (TABS & ACTIONS STACKED ON DESKTOP) -->
              <div class="col-12 col-md-8 column filter-controls-column q-gutter-y-sm">
                <!-- TABS FILTER STATUS (Scrollable on mobile) -->
                <div class="filter-tabs-container">
                  <q-tabs
                    v-model="tabFilter"
                    dense
                    class="text-grey-7 bg-grey-1 rounded-12 p-1"
                    active-color="teal-10"
                    indicator-color="transparent"
                    active-bg-color="white"
                    align="left"
                    arrows
                    outside-arrows
                    style="max-width: 100%"
                  >
                    <q-tab name="ALL" label="Semua" class="text-weight-bold rounded-12 q-px-sm" />
                    <q-tab
                      name="Pending"
                      label="Menunggu"
                      class="text-weight-bold rounded-12 q-px-sm"
                    />
                    <q-tab
                      name="Approved"
                      label="Disetujui"
                      class="text-weight-bold rounded-12 q-px-sm"
                    />
                    <q-tab
                      name="Rejected"
                      label="Ditolak"
                      class="text-weight-bold rounded-12 q-px-sm"
                    />
                  </q-tabs>
                </div>

                <!-- ACTION BUTTONS: EXPORT DROPDOWN, REFRESH -->
                <div class="filter-actions-container">
                  <!-- EXPORT DROPDOWN BUTTON (TEMA TEAL) -->
                  <q-btn-dropdown
                    unelevated
                    rounded
                    color="teal-10"
                    icon="file_download"
                    label="Export Laporan"
                    class="shadow-1 font-bold q-px-md btn-teal-main action-btn-item"
                    no-caps
                  >
                    <q-list style="min-width: 180px">
                      <q-item
                        clickable
                        v-ripple
                        @click="exportListToPDF"
                        class="q-py-md hover-teal-btn"
                      >
                        <q-item-section avatar>
                          <q-avatar
                            color="red-1"
                            text-color="red-9"
                            icon="picture_as_pdf"
                            size="sm"
                          />
                        </q-item-section>
                        <q-item-section class="text-weight-bold text-red-9"
                          >Export PDF</q-item-section
                        >
                      </q-item>
                      <q-separator />
                      <q-item
                        clickable
                        v-ripple
                        @click="exportListToExcel"
                        class="q-py-md hover-teal-btn"
                      >
                        <q-item-section avatar>
                          <q-avatar
                            color="green-1"
                            text-color="green-9"
                            icon="table_view"
                            size="sm"
                          />
                        </q-item-section>
                        <q-item-section class="text-weight-bold text-green-9"
                          >Export Excel</q-item-section
                        >
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>

                  <q-btn
                    flat
                    round
                    icon="refresh"
                    color="teal-10"
                    class="refresh-btn-item"
                    @click="fetchData"
                  />
                </div>
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
                @click="openDetailDialog(props.row)"
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
                        <span class="text-blue-grey-9 text-bold">{{
                          props.row.customer_nama
                        }}</span>
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
                    @click="openDetailDialog(props.row)"
                  />
                </q-td>
              </q-tr>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-xl text-grey-5">
                <q-icon name="fact_check" size="64px" class="q-mb-md opacity-50" />
                <div class="text-h6 full-width text-center">
                  Data invoice pada filter ini kosong.
                </div>
              </div>
            </template>
          </q-table>
        </q-card>
      </div>
    </template>

    <!-- =====================================================================================
          DIALOG REVIEW INVOICE (SINKRONISASI TOTAL PREVIEW SAMA PERSIS DENGAN INVOICECUSTOMERPAGE)
          ===================================================================================== -->
    <q-dialog v-model="showPreview" maximized transition-show="fade" transition-hide="fade">
      <q-card class="column no-wrap bg-grey-4">
        <q-toolbar
          class="bg-white text-teal-10 q-py-sm no-print shadow-4 shrink"
          style="position: sticky; top: 0; z-index: 10; width: 100%"
        >
          <q-btn flat round dense icon="arrow_back" v-close-popup class="q-mr-sm" />
          <q-toolbar-title class="text-weight-bold uppercase tracking-widest font-11 text-teal-9">
            PREVIEW DOKUMEN INVOICE
          </q-toolbar-title>

          <q-space />

          <div class="row items-center q-gutter-sm">
            <!-- DOWNLOAD PDF -->
            <q-btn
              color="red-9"
              icon="picture_as_pdf"
              label="Download PDF"
              @click="exportToPDF"
              class="text-weight-bold"
              unelevated
              rounded
              dense
              no-caps
              style="padding: 4px 12px"
            />
          </div>
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl flex flex-center preview-container">
          <!-- WRAPPER UNTUK PREVIEW LAYAR (DENGAN SHADOW) -->
          <div
            class="invoice-preview-wrapper shadow-24 no-print"
            style="border-radius: 4px; overflow: hidden; margin: 0 auto; width: fit-content"
          >
            <div id="invoice-pdf-area" class="letter-paper" v-if="selectedInv">
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
                <img
                  :src="config.kopUrl || 'icons/logo-agra.png'"
                  class="final-kop-img q-mr-md"
                  style="height: 60px; max-width: 150px; object-fit: contain"
                />
                <div>
                  <div
                    class="text-weight-bolder uppercase"
                    style="color: #2b579a; font-size: 18px; letter-spacing: 0.5px; line-height: 1.2"
                  >
                    {{ config.nama_pt || 'PT. AGRA ABHINAYA PERKASA' }}
                  </div>
                  <div
                    style="font-size: 9.5px; color: #555; letter-spacing: 0.5px"
                    class="q-mt-xs text-uppercase text-weight-bold"
                  >
                    {{ config.slogan_pt || 'GENERAL CONSTRUCTION AND GENERAL SUPPLY' }}
                  </div>
                  <div style="font-size: 10px; color: #666; line-height: 1.3" class="q-mt-xs">
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

              <!-- ROW 1: Kepada & Invoice Header -->
              <div class="row q-col-gutter-lg q-mb-xs">
                <!-- LEFT COLUMN -->
                <div class="col-7 text-left">
                  <div
                    class="text-grey-6 text-bold tracking-widest uppercase q-mb-xs"
                    style="font-size: 10px"
                  >
                    TAGIHAN KEPADA :
                  </div>
                  <div
                    class="text-weight-bold uppercase"
                    style="
                      color: #2b579a;
                      font-size: 14px;
                      letter-spacing: 0.5px;
                      line-height: 1.2;
                      margin-bottom: 2px;
                    "
                  >
                    {{ selectedInv.customer_nama }}
                  </div>
                  <div class="text-grey-9" style="font-size: 11px; line-height: 1.4">
                    {{ selectedInv.customer_alamat }}
                  </div>
                </div>

                <!-- RIGHT COLUMN -->
                <div class="col-5 text-right font-pro">
                  <div
                    class="text-weight-900 text-italic"
                    style="color: #2b579a; font-size: 26px; letter-spacing: 2px; line-height: 1"
                  >
                    INVOICE
                  </div>
                  <div class="text-weight-bold text-grey-9 q-mt-xs" style="font-size: 12px">
                    # {{ selectedInv.nomor_invoice }}
                  </div>
                </div>
              </div>

              <!-- ROW 2: Detail Proyek/SPK & Tanggal/Jatuh Tempo (Aligned Perfectly Side-by-Side) -->
              <div class="row q-col-gutter-lg q-mb-md items-start">
                <!-- LEFT COLUMN -->
                <div class="col-7 text-left">
                  <table
                    class="text-grey-9 text-left"
                    style="
                      font-size: 11px;
                      width: 100%;
                      border-collapse: collapse;
                      line-height: 1.3;
                    "
                  >
                    <tr>
                      <td width="90" style="vertical-align: top; color: #666; padding: 2px 0 6px 0">
                        Proyek
                      </td>
                      <td
                        width="15"
                        class="text-center"
                        style="vertical-align: top; color: #666; padding: 2px 0 6px 0"
                      >
                        :
                      </td>
                      <td
                        class="text-weight-bold uppercase"
                        style="color: #222; vertical-align: top; padding: 2px 0 6px 0"
                      >
                        {{ selectedInv.proyek_nama || '-' }}
                      </td>
                    </tr>
                    <tr>
                      <td style="vertical-align: top; color: #666; padding: 2px 0 0 0">
                        SPK / PO Ref
                      </td>
                      <td
                        class="text-center"
                        style="vertical-align: top; color: #666; padding: 2px 0 0 0"
                      >
                        :
                      </td>
                      <td
                        class="text-weight-bold uppercase"
                        style="color: #222; vertical-align: top; padding: 2px 0 0 0"
                      >
                        {{ selectedInv.spk_nomor || '-' }}
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- RIGHT COLUMN -->
                <div class="col-5 text-right">
                  <table
                    class="text-grey-9"
                    style="
                      font-size: 11px;
                      margin-left: auto;
                      width: fit-content;
                      border-collapse: collapse;
                      line-height: 1.3;
                    "
                  >
                    <tr>
                      <td
                        width="78"
                        class="text-right"
                        style="vertical-align: top; color: #666; padding: 2px 0 6px 0"
                      >
                        Tanggal
                      </td>
                      <td
                        width="12"
                        class="text-center"
                        style="vertical-align: top; color: #666; padding: 2px 0 6px 0"
                      >
                        :
                      </td>
                      <td
                        class="text-weight-bold text-black text-left"
                        style="vertical-align: top; padding: 2px 0 6px 0"
                      >
                        {{ formatDateIndo(selectedInv.tanggal) }}
                      </td>
                    </tr>
                    <tr>
                      <td
                        class="text-right"
                        style="vertical-align: top; color: #666; padding: 2px 0 0 0"
                      >
                        Jatuh Tempo
                      </td>
                      <td
                        class="text-center"
                        style="vertical-align: top; color: #666; padding: 2px 0 0 0"
                      >
                        :
                      </td>
                      <td
                        class="text-weight-bold text-red-9 text-left"
                        style="vertical-align: top; padding: 2px 0 0 0"
                      >
                        {{ formatDateIndo(selectedInv.jatuh_tempo) }}
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
                    <th width="60" class="text-center">VOL</th>
                    <th width="60" class="text-center">SAT</th>
                    <th width="160" class="text-center">JUMLAH (IDR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, i) in selectedInv.items"
                    :key="i"
                    style="border-bottom: 1px solid #dde3ed"
                  >
                    <td
                      class="text-center text-weight-bold q-py-sm"
                      style="vertical-align: top; border-right: 1px solid #dde3ed"
                    >
                      {{ i + 1 }}
                    </td>
                    <td
                      class="q-px-md q-py-sm"
                      style="vertical-align: top; border-right: 1px solid #dde3ed"
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
                      class="text-center q-px-sm q-py-sm"
                      style="vertical-align: top; font-size: 11px; border-right: 1px solid #dde3ed"
                    >
                      {{ item.volume || '' }}
                    </td>
                    <td
                      class="text-center q-px-sm q-py-sm text-weight-bold"
                      style="
                        vertical-align: top;
                        font-size: 11px;
                        color: #2b579a;
                        border-right: 1px solid #dde3ed;
                      "
                    >
                      {{ item.satuan || '' }}
                    </td>
                    <td class="text-right q-px-md q-py-sm" style="vertical-align: top">
                      {{
                        (item.nominal || 0).toLocaleString('id-ID', { minimumFractionDigits: 0 })
                      }}
                    </td>
                  </tr>
                  <tr>
                    <td class="border-top-none border-bottom-none" style="height: 15px"></td>
                    <td class="border-top-none border-bottom-none"></td>
                    <td class="border-top-none border-bottom-none"></td>
                    <td class="border-top-none border-bottom-none"></td>
                    <td class="border-top-none border-bottom-none"></td>
                  </tr>
                  <tr class="row-calculation">
                    <td
                      colspan="3"
                      class="border-none-right border-bottom-none"
                      style="background: white !important"
                    ></td>
                    <td
                      class="q-px-md q-py-xs text-right border-left-blue text-weight-bold"
                      style="font-size: 11px"
                    >
                      Subtotal (DPP)
                    </td>
                    <td class="text-right q-px-md text-weight-bold" style="font-size: 11px">
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
                      colspan="3"
                      class="border-none-right border-bottom-none border-top-none"
                      style="background: white !important"
                    ></td>
                    <td
                      class="q-px-md q-py-xs text-right border-left-blue text-weight-bold"
                      style="font-size: 11px"
                    >
                      PPN ({{ selectedInv.ppn_persen }}%)
                    </td>
                    <td class="text-right q-px-md text-weight-bold" style="font-size: 11px">
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
                      colspan="3"
                      class="border-none-right border-bottom-none border-top-none"
                      style="background: white !important"
                    ></td>
                    <td
                      class="q-px-md q-py-xs text-right border-left-blue text-weight-bold text-negative"
                      style="font-size: 11px"
                    >
                      Potongan PPh ({{ selectedInv.pph_persen }}%)
                    </td>
                    <td
                      class="text-right q-px-md text-weight-bold text-negative"
                      style="font-size: 11px"
                    >
                      - Rp
                      {{
                        (selectedInv.pph_nominal || 0).toLocaleString('id-ID', {
                          minimumFractionDigits: 0,
                        })
                      }}
                    </td>
                  </tr>
                  <tr
                    class="row-grand-total"
                    style="background-color: #2b579a !important; color: white !important"
                  >
                    <td
                      colspan="4"
                      class="text-center text-weight-bold uppercase tracking-widest"
                      style="
                        font-size: 11.5px;
                        padding: 8px 12px;
                        color: white !important;
                        border: 1px solid #2b579a;
                      "
                    >
                      TOTAL TAGIHAN (GRAND TOTAL)
                    </td>
                    <td
                      class="text-right text-weight-black q-px-md"
                      style="
                        font-size: 14px;
                        padding: 8px 12px;
                        color: white !important;
                        border: 1px solid #2b579a;
                      "
                    >
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
                class="bg-grey-2 q-pa-md rounded-borders text-blue-grey-9 q-mb-lg q-mt-md"
                style="font-size: 11px; border: 1px solid #e0e0e0; line-height: 1.4"
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
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- =====================================================================================
         DIALOG DETAIL INVOICE CUSTOMER (READ ONLY WITH APPROVAL ACTIONS)
         ===================================================================================== -->
    <q-dialog
      v-model="showDetailDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-page column no-wrap font-pro" v-if="selectedInv">
        <q-toolbar class="bg-white text-blue-grey-10 q-py-md shadow-2 shrink">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest font-11">
            {{ $q.screen.gt.xs ? 'DETAIL INVOICE CUSTOMER - ' : '' }}{{ selectedInv.nomor_invoice }}
          </q-toolbar-title>

          <div class="row items-center q-gutter-sm">
            <!-- PREVIEW DOKUMEN INVOICE -->
            <q-btn
              unelevated
              color="indigo-9"
              icon="picture_as_pdf"
              :label="$q.screen.gt.sm ? 'PREVIEW DOKUMEN INVOICE' : ($q.screen.gt.xs ? 'PREVIEW' : '')"
              :round="!$q.screen.gt.xs"
              :rounded="$q.screen.gt.xs"
              class="text-weight-bold shadow-premium btn-hover q-mr-sm"
              :class="$q.screen.gt.xs ? 'q-px-md' : ''"
              @click="openPreviewDialog(selectedInv)"
            >
              <q-tooltip v-if="!$q.screen.gt.xs">Preview Dokumen Invoice</q-tooltip>
            </q-btn>

            <!-- TOMBOL AKSI APPROVAL -->
            <template v-if="!selectedInv.approval_status || selectedInv.approval_status === 'Pending'">
              <q-btn
                unelevated
                color="negative"
                icon="cancel"
                :label="$q.screen.gt.xs ? 'Tolak' : ''"
                :round="!$q.screen.gt.xs"
                class="text-weight-bold shadow-2"
                :class="{'rounded-12': $q.screen.gt.xs}"
                @click="clickReject(selectedInv)"
                :loading="isProcessing"
                no-caps
              >
                <q-tooltip v-if="!$q.screen.gt.xs">Tolak Invoice</q-tooltip>
              </q-btn>
              <q-btn
                unelevated
                color="positive"
                icon="check_circle"
                :label="$q.screen.gt.xs ? 'Setujui' : ''"
                :round="!$q.screen.gt.xs"
                class="text-weight-bold shadow-2"
                :class="{'rounded-12': $q.screen.gt.xs}"
                @click="clickApprove(selectedInv)"
                :loading="isProcessing"
                no-caps
              >
                <q-tooltip v-if="!$q.screen.gt.xs">Setujui Invoice</q-tooltip>
              </q-btn>
            </template>

            <!-- JIKA SUDAH DIPROSES -->
            <div
              v-else
              class="row items-center text-weight-bold text-caption q-px-sm"
              :class="selectedInv.approval_status === 'Approved' ? 'text-green-6' : 'text-red-6'"
            >
              <q-icon
                :name="selectedInv.approval_status === 'Approved' ? 'check_circle' : 'cancel'"
                size="sm"
                :class="{'q-mr-xs': $q.screen.gt.xs}"
              />
              <span v-if="$q.screen.gt.xs">{{ selectedInv.approval_status === 'Approved' ? 'DISETUJUI' : 'DITOLAK' }}</span>
              <q-tooltip v-else>{{ selectedInv.approval_status === 'Approved' ? 'DISETUJUI' : 'DITOLAK' }}</q-tooltip>
            </div>
          </div>
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-xl-10">
              <div class="row q-col-gutter-lg">
                <!-- KOLOM KIRI -->
                <div class="col-12 col-md-5">
                  <!-- STATUS CARD -->
                  <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1 border-subtle animate-fade">
                    <q-card-section class="q-pa-lg flex items-center justify-between">
                      <div>
                        <div class="text-caption text-grey-6 text-weight-bold uppercase font-10">STATUS TAGIHAN</div>
                        <div class="text-h6 text-weight-bolder text-brand-primary q-mt-xs">
                          {{ selectedInv.nomor_invoice }}
                        </div>
                      </div>
                      <div>
                        <q-chip
                          dense
                          :color="selectedInv.approval_status === 'Approved' ? 'teal-2' : selectedInv.approval_status === 'Rejected' ? 'red-2' : 'orange-2'"
                          :text-color="selectedInv.approval_status === 'Approved' ? 'teal-9' : selectedInv.approval_status === 'Rejected' ? 'red-9' : 'orange-9'"
                          class="text-weight-bold font-11 uppercase q-px-md q-py-md shadow-sm"
                        >
                          {{ selectedInv.approval_status || 'Pending' }}
                        </q-chip>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- KEPADA KLIEN -->
                  <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1 border-subtle animate-fade">
                    <q-card-section class="bg-teal-1 q-py-sm text-weight-bold flex items-center border-bottom">
                      <q-icon name="person" class="q-mr-xs" size="sm" color="teal-10" />
                      <span class="text-teal-10">1. DETAIL KLIEN / CUSTOMER</span>
                    </q-card-section>
                    <q-card-section class="q-pa-lg q-gutter-y-md">
                      <div>
                        <div class="text-caption text-grey-5 font-10 uppercase text-weight-bold">Nama Klien / Perusahaan</div>
                        <div class="text-weight-bold text-subtitle1 text-blue-grey-9 uppercase q-mt-xs">{{ selectedInv.customer_nama }}</div>
                      </div>
                      <div>
                        <div class="text-caption text-grey-5 font-10 uppercase text-weight-bold">Alamat Tagihan</div>
                        <div class="text-body2 text-grey-8 q-mt-xs leading-relaxed" style="white-space: pre-wrap">{{ selectedInv.customer_alamat }}</div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- REFERENSI DOKUMEN & PROYEK -->
                  <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1 border-subtle animate-fade">
                    <q-card-section class="bg-teal-1 q-py-sm text-weight-bold flex items-center border-bottom">
                      <q-icon name="assignment" class="q-mr-xs" size="sm" color="teal-10" />
                      <span class="text-teal-10">2. REFERENSI DOKUMEN & PROYEK</span>
                    </q-card-section>
                    <q-card-section class="q-pa-lg q-gutter-y-sm">
                      <div class="row q-col-gutter-sm">
                        <div class="col-6">
                          <div class="text-caption text-grey-5 font-10 uppercase text-weight-bold">Tanggal Invoice</div>
                          <div class="text-body2 text-weight-bold text-grey-9 q-mt-xs">{{ formatDateIndo(selectedInv.tanggal) }}</div>
                        </div>
                        <div class="col-6">
                          <div class="text-caption text-grey-5 font-10 uppercase text-weight-bold">Jatuh Tempo</div>
                          <div class="text-body2 text-weight-bold text-red-8 q-mt-xs">{{ formatDateIndo(selectedInv.jatuh_tempo) }}</div>
                        </div>
                      </div>
                      <q-separator class="q-my-sm" />
                      <div>
                        <div class="text-caption text-grey-5 font-10 uppercase text-weight-bold">Nama Proyek / Kontrak</div>
                        <div class="text-body2 text-weight-bold text-grey-9 uppercase q-mt-xs">{{ selectedInv.proyek_nama || '-' }}</div>
                      </div>
                      <div class="q-mt-sm">
                        <div class="text-caption text-grey-5 font-10 uppercase text-weight-bold">Nomor SPK / Rujukan</div>
                        <div class="text-body2 text-weight-bold text-teal-10 uppercase q-mt-xs">{{ selectedInv.spk_nomor || '-' }}</div>
                      </div>
                      <q-separator class="q-my-sm" v-if="selectedInv.approval_status === 'Rejected' && selectedInv.reject_reason" />
                      <div v-if="selectedInv.approval_status === 'Rejected' && selectedInv.reject_reason">
                        <div class="text-caption text-red-5 font-10 uppercase text-weight-bold">Alasan Penolakan</div>
                        <div class="text-body2 text-weight-bold text-red-8 q-mt-xs italic">{{ selectedInv.reject_reason }}</div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- DOKUMEN LAMPIRAN -->
                  <q-card flat bordered class="rounded-20 bg-white shadow-1 border-subtle animate-fade">
                    <q-card-section class="bg-teal-1 q-py-sm text-weight-bold flex items-center border-bottom">
                      <q-icon name="attach_file" class="q-mr-xs" size="sm" color="teal-10" />
                      <span class="text-teal-10">3. DOKUMEN LAMPIRAN & FOTO ({{ (selectedInv.lampiran || []).length }})</span>
                    </q-card-section>
                    <q-card-section class="q-pa-lg">
                      <q-list separator class="rounded-12 border-subtle" v-if="selectedInv.lampiran && selectedInv.lampiran.length > 0">
                        <q-item
                          v-for="(doc, dIdx) in selectedInv.lampiran"
                          :key="dIdx"
                          clickable
                          v-ripple
                          @click="openLink(doc.url || doc.base64)"
                          class="q-py-md hover-bg"
                        >
                          <q-item-section avatar>
                            <q-avatar color="teal-1" text-color="teal-10" icon="description" size="md" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label class="text-weight-bold text-subtitle2">{{ doc.label || 'Dokumen ' + (dIdx + 1) }}</q-item-label>
                            <q-item-label caption style="font-size: 10px">Klik untuk membuka file lampiran</q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-icon name="open_in_new" color="teal-10" size="xs" />
                          </q-item-section>
                        </q-item>
                      </q-list>
                      <div v-else class="text-center q-pa-md text-grey-5 italic font-11">
                        Belum ada dokumen lampiran yang diunggah.
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- KOLOM KANAN -->
                <div class="col-12 col-md-7 animate-fade-up">
                  <!-- ITEMS TABLE -->
                  <q-card flat bordered class="rounded-20 bg-white shadow-1 overflow-hidden q-mb-lg border-subtle">
                    <q-card-section class="q-pa-none">
                      <q-toolbar class="bg-teal-10 text-white q-py-sm">
                        <q-icon name="list_alt" class="q-mr-md" />
                        <div class="text-weight-bold uppercase font-11 tracking-widest">
                          4. DESKRIPSI TAGIHAN (ITEMS)
                        </div>
                      </q-toolbar>

                      <q-markup-table flat separator="cell" class="invoice-input-table">
                        <thead>
                          <tr class="bg-blue-grey-1 text-blue-grey-10">
                            <th width="40" class="text-center">NO</th>
                            <th class="text-left">DESKRIPSI PEKERJAAN / TAGIHAN</th>
                            <th width="80" class="text-center">VOL</th>
                            <th width="80" class="text-center">SATUAN</th>
                            <th width="180" class="text-right">JUMLAH (Rp)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(item, idx) in selectedInv.items" :key="idx" class="hover-row">
                            <td class="text-center text-weight-bold text-grey-6">{{ idx + 1 }}</td>
                            <td class="q-pa-md">
                              <div class="text-weight-bold text-blue-grey-9">{{ item.judul || item.uraian }}</div>
                              <div class="text-caption text-grey-6 q-mt-xs" v-if="item.deskripsi">{{ item.deskripsi }}</div>
                            </td>
                            <td class="text-center text-weight-bold text-grey-8">{{ item.volume }}</td>
                            <td class="text-center text-weight-bold text-teal-10 uppercase">{{ item.satuan }}</td>
                            <td class="text-right text-weight-bold text-grey-9">
                              Rp {{ (item.nominal || 0).toLocaleString('id-ID') }}
                            </td>
                          </tr>
                        </tbody>
                        <tfoot class="bg-grey-1">
                          <tr>
                            <td colspan="4" class="text-right text-weight-bold text-blue-grey-9">SUB TOTAL (DPP)</td>
                            <td class="text-right text-weight-bold text-teal-10 text-subtitle2">
                              Rp {{ (selectedInv.nilai_dpp || 0).toLocaleString('id-ID') }}
                            </td>
                          </tr>
                          <tr v-if="selectedInv.ppn_persen > 0">
                            <td colspan="4" class="text-right text-weight-bold text-blue-grey-9">PPN ({{ selectedInv.ppn_persen }}%)</td>
                            <td class="text-right text-weight-bold text-grey-8">
                              Rp {{ (selectedInv.ppn_nominal || 0).toLocaleString('id-ID') }}
                            </td>
                          </tr>
                          <tr v-if="selectedInv.pph_persen > 0">
                            <td colspan="4" class="text-right text-weight-bold text-blue-grey-9">POTONGAN PPh ({{ selectedInv.pph_persen }}%)</td>
                            <td class="text-right text-weight-bold text-negative">
                              - Rp {{ (selectedInv.pph_nominal || 0).toLocaleString('id-ID') }}
                            </td>
                          </tr>
                          <tr class="bg-teal-10 text-white">
                            <td colspan="4" class="text-right text-weight-black uppercase tracking-widest text-subtitle2">TOTAL TAGIHAN (GRAND TOTAL)</td>
                            <td class="text-right text-weight-black text-h6">
                              Rp {{ (selectedInv.grand_total || 0).toLocaleString('id-ID') }}
                            </td>
                          </tr>
                        </tfoot>
                      </q-markup-table>
                    </q-card-section>
                  </q-card>

                  <!-- INSTRUKSI & BANK -->
                  <q-card flat bordered class="rounded-20 bg-white shadow-1 border-subtle q-mb-lg animate-fade">
                    <q-card-section class="bg-teal-1 q-py-sm text-weight-bold flex items-center border-bottom">
                      <q-icon name="account_balance" class="q-mr-xs" size="sm" color="teal-10" />
                      <span class="text-teal-10">5. INSTRUKSI & INFORMASI BANK</span>
                    </q-card-section>
                    <q-card-section class="q-pa-lg">
                      <div class="row q-col-gutter-md">
                        <div class="col-12 col-md-6">
                          <table class="detail-table full-width">
                            <tr>
                              <td class="text-grey-6 text-weight-bold" width="100">Nama Bank</td>
                              <td class="text-blue-grey-9 text-weight-bold">: {{ selectedInv.rek_bank }}</td>
                            </tr>
                            <tr>
                              <td class="text-grey-6 text-weight-bold">No. Rekening</td>
                              <td class="text-blue-grey-9 text-weight-bold">: {{ selectedInv.rek_nomor }}</td>
                            </tr>
                            <tr>
                              <td class="text-grey-6 text-weight-bold">Atas Nama</td>
                              <td class="text-blue-grey-9 text-weight-bold">: {{ selectedInv.rek_nama }}</td>
                            </tr>
                          </table>
                        </div>
                        <div class="col-12 col-md-6 border-left-subtle">
                          <div class="text-caption text-grey-5 font-10 uppercase text-weight-bold">Catatan Tambahan</div>
                          <div class="text-body2 text-grey-8 q-mt-xs italic" style="white-space: pre-wrap">
                            {{ selectedInv.keterangan || 'Tidak ada catatan tambahan.' }}
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>

                  <!-- PENANDATANGAN -->
                  <q-card flat bordered class="rounded-20 bg-white shadow-1 border-subtle animate-fade">
                    <q-card-section class="bg-teal-1 q-py-sm text-weight-bold flex items-center border-bottom">
                      <q-icon name="border_color" class="q-mr-xs" size="sm" color="teal-10" />
                      <span class="text-teal-10">6. PENANDATANGAN DOKUMEN</span>
                    </q-card-section>
                    <q-card-section class="q-pa-lg">
                      <div class="row q-col-gutter-md">
                        <div class="col-6">
                          <div class="text-caption text-grey-5 font-10 uppercase text-weight-bold">Nama Penandatangan</div>
                          <div class="text-weight-bold text-grey-9 q-mt-xs">{{ selectedInv.ttd_nama || '-' }}</div>
                        </div>
                        <div class="col-6">
                          <div class="text-caption text-grey-5 font-10 uppercase text-weight-bold">Jabatan</div>
                          <div class="text-weight-bold text-grey-8 q-mt-xs">{{ selectedInv.ttd_jabatan || '-' }}</div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </div>
          <div class="q-py-md"></div>
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
const showPreview = ref(false)
const showDetailDialog = ref(false)
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

  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
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

  const confSnap = await getDoc(doc(db, 'config', 'perusahaan'))
  if (confSnap.exists()) config.value = confSnap.data()


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

const openDetailDialog = (row) => {
  selectedInv.value = row
  showDetailDialog.value = true
}

const openPreviewDialog = (row) => {
  selectedInv.value = row
  showPreview.value = true
}

const openLink = (url) => {
  if (!url) {
    $q.notify({
      type: 'warning',
      position: 'top',
      icon: 'link_off',
      message: 'Tautan dokumen tidak tersedia.',
      timeout: 2500,
    })
    return
  }
  if (url.startsWith('data:')) {
    try {
      const arr = url.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      const blob = new Blob([u8arr], { type: mime })
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
    } catch (e) {
      console.error('Error parsing base64 URL:', e)
      $q.notify({
        type: 'negative',
        position: 'top',
        icon: 'error',
        message: 'Gagal membuka dokumen internal.',
        timeout: 3000,
      })
    }
  } else {
    const link = document.createElement('a')
    link.href = url
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
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
      await updateDoc(doc(db, 'finance_invoice_customer', row.id), {
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
      showDetailDialog.value = false
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
      await updateDoc(doc(db, 'finance_invoice_customer', row.id), {
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
      showDetailDialog.value = false
    } catch (e) {
      console.error(e)
      notify({ type: 'negative', message: 'Gagal memproses penolakan.' })
    } finally {
      isProcessing.value = false
      $q.loading.hide()
    }
  })
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
      const qUser = query(collection(db, 'karyawan'), where('email', '==', newUser.email))
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
})

onUnmounted(() => {
  if (unsubInvoice) unsubInvoice()
  if (unsubUser) unsubUser()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.filter-controls-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (min-width: 1024px) {
  .filter-controls-column {
    align-items: flex-end;
  }
}

.filter-tabs-container {
  display: flex;
  justify-content: center;
  width: 100%;
}
.filter-actions-container {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  width: 100%;
}
@media (min-width: 1024px) {
  .filter-tabs-container {
    justify-content: flex-end;
    width: auto;
  }
  .filter-actions-container {
    justify-content: flex-end;
    width: auto;
  }
}

@media (max-width: 1023px) {
  .filter-actions-container {
    flex-direction: column;
    width: 100%;
  }
  .action-btn-item {
    width: 100% !important;
    max-width: 400px;
  }
  .action-btn-item :deep(.q-btn) {
    width: 100% !important;
  }
  .refresh-btn-item {
    align-self: center;
  }
}

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
   PAGE CONTENT WRAPPER
   ======================================================================= */
.page-content-wrapper {
  padding: 0 16px;
}
@media (min-width: 768px) {
  .page-content-wrapper {
    padding: 0 20px;
  }
}
@media (min-width: 1200px) {
  .page-content-wrapper {
    padding: 0 24px;
  }
}

/* =======================================================================
   PDF PREVIEW STYLES (MATCHING 100% TO INVOICECUSTOMERPAGE)
   ======================================================================= */
.preview-container {
  overflow-x: auto !important;
  display: flex !important;
  justify-content: center !important;
  align-items: flex-start !important;
}
@media (max-width: 820px) {
  .preview-container {
    justify-content: flex-start !important;
    padding: 8px !important;
  }
}
.invoice-preview-wrapper {
  flex-shrink: 0 !important;
}
.a4-paper {
  background: white !important;
  width: 210mm;
  min-width: 210mm;
  flex-shrink: 0 !important;
  height: 297mm;
  min-height: 297mm;
  padding: 20mm 20mm;
  margin: 0 auto;
  color: #1a1a1a;
  line-height: 1.5;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
}
.letter-paper {
  background: white !important;
  width: 210mm;
  min-width: 210mm;
  flex-shrink: 0 !important;
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
  font-size: 14px !important;
}
.kwt-label {
  width: 180px;
  color: #000 !important;
  font-size: 14px !important;
}
.kwt-separator {
  width: 25px;
  font-weight: bold;
  font-size: 14px !important;
}
.kwt-terbilang-container {
  border-top: 1.5px solid #2b579a !important;
  border-bottom: 1.5px solid #2b579a !important;
  font-size: 14px !important;
  line-height: 1.6;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.kwt-label-terbilang {
  width: 180px;
  font-size: 14px !important;
  color: #000 !important;
}
.kwt-separator-terbilang {
  width: 25px;
  font-weight: bold;
  font-size: 14px !important;
}
.kwt-amount-box {
  border: 2px solid #2b579a !important;
  padding: 10px 25px;
  min-width: 320px;
  background-color: #f8fafc !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  font-size: 20px !important;
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
  .letter-paper,
  .a4-paper {
    box-shadow: none !important;
    margin: 0 !important;
    width: 210mm !important;
    height: 297mm !important;
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
