<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <!-- =====================================================================================
         HEADER SECTION
         ===================================================================================== -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div>
          <div class="text-h4 text-weight-bolder text-teal-10 leading-tight">
            Monitoring Pengeluaran
            <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
              Cash Disbursement &amp; Expense Ledger
            </span>
          </div>
          <div class="text-subtitle1 text-grey-7 q-mt-sm">
            Pantau seluruh arus kas keluar dari pengajuan pembayaran yang telah disetujui dan
            direalisasikan.
          </div>
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none row items-center q-gutter-md justify-end">
        <!-- TOMBOL EXPORT -->
        <q-btn-dropdown
          unelevated
          color="white"
          text-color="teal-10"
          icon="ios_share"
          label="Export Data"
          class="rounded-12 text-weight-bold shadow-2"
        >
          <q-list class="bg-white rounded-borders q-py-sm" style="min-width: 200px">
            <q-item clickable v-close-popup @click="exportTablePDF" class="hover-blue-btn">
              <q-item-section avatar>
                <q-avatar color="red-1" text-color="red-10" icon="picture_as_pdf" size="sm" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Download PDF</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator class="q-my-sm" />
            <q-item clickable v-close-popup @click="exportTableExcel" class="hover-blue-btn">
              <q-item-section avatar>
                <q-avatar color="green-1" text-color="green-10" icon="table_view" size="sm" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Export Excel</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- STATUS AUTO-SYNC -->
        <div class="text-right">
          <div class="text-caption text-grey-6 q-mb-xs uppercase tracking-widest font-bold">
            Status Buku Kas
          </div>
          <q-badge color="positive" class="q-px-md q-py-xs text-weight-bold shadow-2 rounded-12">
            <q-icon name="sync" size="xs" class="q-mr-sm animate-spin-slow" />
            AUTO-SYNC AKTIF
          </q-badge>
        </div>
      </div>
    </div>

    <!-- =====================================================================================
         (1) WIDGET RINGKASAN: 3 STAT CARDS UTAMA (Disetujui, Terealisasi, Outstanding)
         ===================================================================================== -->
    <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
      <!-- Card 1: Total Disetujui -->
      <div class="col-12 col-sm-4">
        <q-card flat class="rounded-20 kpi-card kpi-teal text-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-lg">
            <div class="col">
              <div class="text-overline text-white kpi-label tracking-widest q-mb-xs">
                TOTAL DISETUJUI
              </div>
              <div class="text-h5 text-weight-black q-mt-xs">
                Rp {{ formatCompact(totalDisetujui) }}
              </div>
              <div class="text-caption text-white opacity-70 q-mt-xs">
                {{ approvedExpenses.length }} transaksi approved
              </div>
            </div>
            <div class="kpi-icon-wrap q-pa-md rounded-borders flex flex-center">
              <q-icon name="verified" color="white" size="32px" />
            </div>
          </q-card-section>
          <!-- Progress bar mini -->
          <div class="q-px-lg q-pb-md">
            <div class="kpi-bar-track">
              <div class="kpi-bar-fill bg-white" style="width: 100%"></div>
            </div>
          </div>
        </q-card>
      </div>

      <!-- Card 2: Total Terealisasi (Cair) -->
      <div class="col-12 col-sm-4">
        <q-card flat class="rounded-20 kpi-card kpi-green text-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-lg">
            <div class="col">
              <div class="text-overline text-white kpi-label tracking-widest q-mb-xs">
                TOTAL TEREALISASI
              </div>
              <div class="text-h5 text-weight-black q-mt-xs">
                Rp {{ formatCompact(totalTerealisasi) }}
              </div>
              <div class="text-caption text-white opacity-70 q-mt-xs">
                {{ cairExpenses.length }} transaksi telah cair
              </div>
            </div>
            <div class="kpi-icon-wrap q-pa-md rounded-borders flex flex-center">
              <q-icon name="price_check" color="white" size="32px" />
            </div>
          </q-card-section>
          <!-- Progress bar realisasi -->
          <div class="q-px-lg q-pb-md">
            <div class="kpi-bar-track">
              <div class="kpi-bar-fill bg-white" :style="{ width: realisasiPct + '%' }"></div>
            </div>
            <div class="text-caption text-white opacity-70 q-mt-xs text-right">
              {{ realisasiPct }}% dari total disetujui
            </div>
          </div>
        </q-card>
      </div>

      <!-- Card 3: Outstanding (Approved belum Cair) -->
      <div class="col-12 col-sm-4">
        <q-card flat class="rounded-20 kpi-card kpi-orange text-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-lg">
            <div class="col">
              <div class="text-overline text-white kpi-label tracking-widest q-mb-xs">
                OUTSTANDING (ANTREAN)
              </div>
              <div class="text-h5 text-weight-black q-mt-xs">
                Rp {{ formatCompact(totalOutstanding) }}
              </div>
              <div class="text-caption text-white opacity-70 q-mt-xs">
                {{ outstandingExpenses.length }} pengajuan belum cair
              </div>
            </div>
            <div class="kpi-icon-wrap q-pa-md rounded-borders flex flex-center">
              <q-icon name="pending_actions" color="white" size="32px" />
            </div>
          </q-card-section>
          <!-- Progress bar outstanding -->
          <div class="q-px-lg q-pb-md">
            <div class="kpi-bar-track">
              <div class="kpi-bar-fill bg-white" :style="{ width: outstandingPct + '%' }"></div>
            </div>
            <div class="text-caption text-white opacity-70 q-mt-xs text-right">
              {{ outstandingPct }}% masih perlu direalisasi
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <!-- =====================================================================================
         KPI SEKUNDER: Baris info tambahan (Volume, Bulan Ini, Rata-rata)
         ===================================================================================== -->
    <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
      <!-- Card 1: Total Pengeluaran -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 kpi-card kpi-sec-red text-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline kpi-sec-label tracking-widest q-mb-xs">
                TOTAL PENGELUARAN
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs">
                Rp {{ formatCompact(totalPengeluaran) }}
              </div>
              <div class="text-caption opacity-70 q-mt-xs">Semua realisasi</div>
            </div>
            <div class="kpi-sec-icon-wrap">
              <q-icon name="trending_down" color="white" size="26px" />
            </div>
          </q-card-section>
          <div class="q-px-md q-pb-md">
            <div class="kpi-bar-track">
              <div class="kpi-bar-fill bg-white" style="width: 100%"></div>
            </div>
          </div>
        </q-card>
      </div>

      <!-- Card 2: Pengeluaran Bulan Ini -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card
          flat
          class="rounded-20 kpi-card kpi-sec-amber text-white transition-all hover-shadow"
        >
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline kpi-sec-label tracking-widest q-mb-xs">
                BULAN INI ({{ currentMonthName }})
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs">
                Rp {{ formatCompact(pengeluaranBulanIni) }}
              </div>
              <div class="text-caption opacity-70 q-mt-xs">Periode berjalan</div>
            </div>
            <div class="kpi-sec-icon-wrap">
              <q-icon name="date_range" color="white" size="26px" />
            </div>
          </q-card-section>
          <div class="q-px-md q-pb-md">
            <div class="kpi-bar-track">
              <div
                class="kpi-bar-fill bg-white"
                :style="{
                  width: totalPengeluaran
                    ? Math.min(Math.round((pengeluaranBulanIni / totalPengeluaran) * 100), 100) +
                      '%'
                    : '0%',
                }"
              ></div>
            </div>
          </div>
        </q-card>
      </div>

      <!-- Card 3: Volume Transaksi -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card
          flat
          class="rounded-20 kpi-card kpi-sec-teal text-white transition-all hover-shadow"
        >
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline kpi-sec-label tracking-widest q-mb-xs">
                VOLUME TRANSAKSI
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs">
                {{ approvedExpenses.length }}
                <span class="text-subtitle1 text-weight-medium opacity-80">TRX</span>
              </div>
              <div class="text-caption opacity-70 q-mt-xs">Total semua status</div>
            </div>
            <div class="kpi-sec-icon-wrap">
              <q-icon name="receipt" color="white" size="26px" />
            </div>
          </q-card-section>
          <div class="q-px-md q-pb-md">
            <div class="kpi-bar-track">
              <div class="kpi-bar-fill bg-white" style="width: 100%"></div>
            </div>
          </div>
        </q-card>
      </div>

      <!-- Card 4: Rata-rata per Transaksi -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card
          flat
          class="rounded-20 kpi-card kpi-sec-slate text-white transition-all hover-shadow"
        >
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline kpi-sec-label tracking-widest q-mb-xs">
                RATA-RATA / TRANSAKSI
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs">
                Rp {{ formatCompact(rataRataPengeluaran) }}
              </div>
              <div class="text-caption opacity-70 q-mt-xs">Per realisasi cair</div>
            </div>
            <div class="kpi-sec-icon-wrap">
              <q-icon name="analytics" color="white" size="26px" />
            </div>
          </q-card-section>
          <div class="q-px-md q-pb-md">
            <div class="kpi-bar-track">
              <div class="kpi-bar-fill bg-white" style="width: 65%"></div>
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <!-- =====================================================================================
         (2) WIDGET DISTRIBUSI PENGELUARAN PER DIVISI (Mini Horizontal Bar Chart)
         ===================================================================================== -->
    <q-card flat bordered class="rounded-20 shadow-sm bg-white q-mb-lg no-print">
      <q-card-section
        class="bg-teal-1 q-py-sm text-teal-10 text-weight-bold flex items-center border-bottom"
      >
        <q-icon name="donut_small" class="q-mr-xs" size="sm" />
        DISTRIBUSI PENGELUARAN PER DIVISI / TIPE
      </q-card-section>
      <q-card-section class="q-pa-lg">
        <!-- Pesan jika belum ada data -->
        <div v-if="distribusiDivisi.length === 0" class="text-center q-pa-xl text-grey-5">
          <q-icon name="bar_chart" size="48px" class="q-mb-sm opacity-50" />
          <div>Belum ada data pengeluaran untuk divisualisasikan.</div>
        </div>

        <!-- Bar Chart Horizontal per Divisi -->
        <div v-else class="q-gutter-y-md">
          <div v-for="(divisi, idx) in distribusiDivisi" :key="idx">
            <div class="row items-center q-col-gutter-md no-wrap">
              <!-- Label Divisi -->
              <div class="col-12 col-md-3">
                <div class="text-weight-bold text-blue-grey-9 font-11 uppercase truncate-label">
                  {{ divisi.label }}
                </div>
                <div class="text-caption text-grey-6">{{ divisi.count }} transaksi</div>
              </div>
              <!-- Bar Progress (Pure CSS, tanpa library chart) -->
              <div class="col">
                <div class="dist-bar-track">
                  <div
                    class="dist-bar-fill"
                    :class="distBarColors[idx % distBarColors.length]"
                    :style="{ width: divisi.pct + '%' }"
                  >
                    <span class="dist-bar-label"> {{ divisi.pct }}% </span>
                  </div>
                </div>
              </div>
              <!-- Nominal -->
              <div class="col-12 col-md-3 text-right">
                <div class="text-weight-bolder text-negative font-11">
                  Rp {{ formatCompact(divisi.total) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- =====================================================================================
         (4) FILTER INTERAKTIF & PENCARIAN LANJUTAN
         ===================================================================================== -->
    <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print border-teal-thin">
      <q-card-section class="q-py-md">
        <div class="row items-center q-col-gutter-md">
          <!-- Pencarian Lanjutan -->
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchQuery"
              outlined
              dense
              rounded
              placeholder="Cari Vendor, No. Voucher, Invoice..."
              bg-color="white"
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
              <template v-slot:append v-if="searchQuery">
                <q-icon name="close" @click="searchQuery = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>

          <!-- Filter Status Realisasi -->
          <div class="col-12 col-md-auto">
            <q-tabs
              v-model="statusRealisasiFilter"
              dense
              class="text-grey-7 bg-grey-1 rounded-12"
              active-color="white"
              active-bg-color="teal-10"
              indicator-color="transparent"
              align="left"
              narrow-indicator
            >
              <q-tab name="ALL" label="Semua Status" class="text-weight-bold rounded-12 q-px-md" />
              <q-tab name="Cair" label="Sudah Cair" class="text-weight-bold rounded-12 q-px-md" />
              <q-tab
                name="Approved"
                label="Belum Cair"
                class="text-weight-bold rounded-12 q-px-md"
              />
            </q-tabs>
          </div>

          <!-- Filter Metode Bayar -->
          <div class="col-12 col-md-auto">
            <q-select
              v-model="metodeFilter"
              :options="metodeOptions"
              outlined
              dense
              rounded
              label="Metode Bayar"
              bg-color="white"
              style="min-width: 180px"
              class="text-weight-bold"
              color="teal"
              emit-value
              map-options
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- =====================================================================================
         MAIN TABLE DATA (KAS KELUAR)
         ===================================================================================== -->
    <q-card
      flat
      bordered
      class="rounded-20 shadow-sm overflow-hidden bg-white no-print border-teal-thin"
    >
      <q-table
        :rows="filteredExpenses"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        binary-state-sort
        class="finance-table"
        :pagination="{ rowsPerPage: 15 }"
        no-data-label="Belum ada catatan pengeluaran kas."
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-teal-10 text-white">
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
            @click="openVoucher(props.row)"
          >
            <!-- KOLOM WAKTU & BKK -->
            <q-td key="waktu">
              <div class="text-weight-bold text-blue-grey-10 text-subtitle2 leading-none q-mb-xs">
                {{ formatDateIndo(props.row.approvedAt || props.row.createdAt) }}
              </div>
              <div class="text-caption text-teal-8 font-10 uppercase text-weight-bold">
                {{ generateNomorBKK(props.row) }}
              </div>
              <div class="text-caption text-grey-6 font-10">
                REQ: {{ props.row.no_request || props.row.nomor_req || '-' }}
              </div>
            </q-td>

            <!-- KOLOM PENERIMA -->
            <q-td key="penerima">
              <div class="text-weight-bold text-teal-10 uppercase font-11">
                {{ props.row.vendor_nama || props.row.supplier_nama || '-' }}
              </div>
              <div class="text-caption text-grey-7 font-10">
                Inv Ref: {{ props.row.tagihan_nomor_invoice || props.row.nomor_invoice || '-' }}
              </div>
              <div class="text-caption text-grey-6 font-10">
                {{ props.row.rek_bank }} - {{ props.row.rek_nomor }}
              </div>
            </q-td>

            <!-- KOLOM METODE -->
            <q-td key="metode" class="text-center">
              <q-chip
                dense
                :color="getMetodeColor(props.row.tipe_pengajuan || props.row.metode_bayar).bg"
                :text-color="
                  getMetodeColor(props.row.tipe_pengajuan || props.row.metode_bayar).text
                "
                class="text-weight-bold font-10 uppercase q-ma-none shadow-sm q-px-sm"
              >
                <q-icon
                  :name="getMetodeColor(props.row.tipe_pengajuan || props.row.metode_bayar).icon"
                  class="q-mr-xs"
                  size="12px"
                />
                {{ props.row.tipe_pengajuan || props.row.metode_bayar || '-' }}
              </q-chip>
            </q-td>

            <!-- KOLOM KETERANGAN -->
            <q-td key="keperluan" class="text-left" style="max-width: 250px">
              <div class="text-body2 text-blue-grey-8 ellipsis-2-lines italic">
                "{{ props.row.keterangan || props.row.keperluan || '-' }}"
              </div>
            </q-td>

            <!-- KOLOM NOMINAL -->
            <q-td key="nominal" class="text-right">
              <div class="text-weight-black text-negative text-subtitle1">
                - Rp
                {{
                  (props.row.nominal || props.row.nominal_pengajuan || 0).toLocaleString('id-ID')
                }}
              </div>
            </q-td>

            <!-- KOLOM STATUS REALISASI -->
            <q-td key="status_realisasi" class="text-center">
              <q-chip
                dense
                :color="props.row.status === 'Cair' ? 'green-1' : 'orange-1'"
                :text-color="props.row.status === 'Cair' ? 'text-positive' : 'text-orange-9'"
                class="text-weight-bold font-10 uppercase q-ma-none shadow-sm q-px-sm"
              >
                <q-icon
                  :name="props.row.status === 'Cair' ? 'task_alt' : 'hourglass_empty'"
                  size="xs"
                  class="q-mr-xs"
                />
                {{ props.row.status === 'Cair' ? 'SUDAH CAIR' : 'BELUM CAIR' }}
              </q-chip>
            </q-td>

            <!-- KOLOM AKSI -->
            <q-td key="aksi" class="text-center" @click.stop>
              <q-btn
                flat
                round
                color="teal-10"
                icon="receipt_long"
                size="sm"
                @click="openVoucher(props.row)"
              >
                <q-tooltip>Lihat Voucher BKK</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="receipt_long" size="64px" class="q-mb-md opacity-50" />
            <div class="text-h6 full-width text-center">Belum ada catatan pengeluaran kas.</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- =====================================================================================
         DIALOG VOUCHER BUKTI KAS KELUAR (BKK) - FULLSCREEN - EXPORTABLE PDF
         ===================================================================================== -->
    <q-dialog
      v-model="showVoucher"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      backdrop-filter="blur(8px)"
    >
      <q-card class="bg-grey-3 column no-wrap">
        <!-- Toolbar Dialog -->
        <q-toolbar class="bg-teal-10 text-white q-py-md shadow-4 shrink no-print">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title>
            <div class="text-weight-bold uppercase tracking-widest font-11">
              Arsip Dokumen Keuangan
            </div>
            <div class="text-caption opacity-70">Bukti Kas Keluar (BKK)</div>
          </q-toolbar-title>
          <q-btn
            unelevated
            color="white"
            text-color="teal-10"
            icon="print"
            label="CETAK / PDF BUKTI"
            class="q-mr-md text-weight-black rounded-12 shadow-2"
            @click="exportVoucherToPDF"
          />
        </q-toolbar>

        <q-scroll-area class="col q-pa-md q-pa-lg-xl flex flex-center">
          <div class="row justify-center">
            <div class="col-12 col-md-11 col-xl-8">
              <!-- ==============================================================
                   (3) VOUCHER BKK - LAYOUT SETENGAH A4 (CETAK FISIK)
                   Mengandung:
                   - Nomor BKK Otomatis
                   - Fungsi Terbilang Bahasa Indonesia
                   - Grid Tanda Tangan 4 Kolom
                   ============================================================== -->
              <div id="voucher-pdf-target" class="voucher-paper shadow-24" v-if="selectedVoucher">
                <!-- === KOP SURAT / HEADER DOKUMEN === -->
                <div class="row items-start justify-between q-mb-md border-bottom-thick q-pb-md">
                  <div class="row items-center no-wrap">
                    <!-- Logo Perusahaan (gunakan fallback jika tidak ada) -->
                    <img
                      :src="compConfig.kopUrl || '/icons/logo-agra.png'"
                      class="voucher-logo q-mr-md"
                      @error="$event.target.style.display = 'none'"
                    />
                    <div class="column">
                      <div
                        class="text-h6 text-weight-black text-teal-10 tracking-tighter leading-none"
                      >
                        {{ compConfig.nama_perusahaan || 'PT AGRA ABHINAYA PERKASA' }}
                      </div>
                      <div class="text-caption text-grey-8 font-bold uppercase tracking-widest">
                        {{
                          compConfig.slogan_perusahaan || 'General Construction & General Supplier'
                        }}
                      </div>
                      <div class="text-caption text-grey-6 q-mt-xs">
                        {{ compConfig.alamat || '-' }}
                      </div>
                    </div>
                  </div>
                  <!-- Judul & Nomor BKK -->
                  <div class="text-right">
                    <div
                      class="text-h5 text-weight-black text-teal-10 uppercase tracking-widest leading-none"
                    >
                      BUKTI KAS KELUAR
                    </div>
                    <div class="text-subtitle2 text-weight-bold text-grey-8 font-mono q-mt-xs">
                      <!-- (3) Nomor BKK Otomatis: format BKK/TAHUN/BULAN/ID -->
                      No: {{ generateNomorBKK(selectedVoucher) }}
                    </div>
                  </div>
                </div>

                <!-- === INFO TRANSAKSI (2 KOLOM) === -->
                <div class="row q-col-gutter-lg q-mb-md">
                  <!-- Kolom Kiri: Penerima, Invoice, Metode, Rekening -->
                  <div class="col-7">
                    <table class="voucher-info-table full-width">
                      <tr>
                        <td width="145" class="text-grey-7 font-bold">Dibayarkan Kepada</td>
                        <td width="12">:</td>
                        <td class="text-weight-bolder text-uppercase text-subtitle2">
                          {{ selectedVoucher.vendor_nama || selectedVoucher.supplier_nama }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-grey-7 font-bold">Referensi Invoice</td>
                        <td>:</td>
                        <td class="text-weight-bold">
                          {{
                            selectedVoucher.tagihan_nomor_invoice ||
                            selectedVoucher.nomor_invoice ||
                            '-'
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-grey-7 font-bold">Metode Pembayaran</td>
                        <td>:</td>
                        <td class="text-weight-bold text-primary">
                          {{
                            selectedVoucher.tipe_pengajuan ||
                            selectedVoucher.metode_bayar ||
                            'Transfer Bank'
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-grey-7 font-bold">Rekening Tujuan</td>
                        <td>:</td>
                        <td class="text-weight-bold">
                          {{ selectedVoucher.rek_bank }} - {{ selectedVoucher.rek_nomor }}<br />
                          <span class="text-caption italic">
                            A/N: {{ selectedVoucher.rek_nama || '-' }}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </div>
                  <!-- Kolom Kanan: Tanggal, Pemohon, Otorisator -->
                  <div class="col-5">
                    <table class="voucher-info-table full-width">
                      <tr>
                        <td width="120" class="text-grey-7 font-bold">Tgl Pembayaran</td>
                        <td width="12">:</td>
                        <td class="text-weight-bold">
                          {{
                            formatDateIndo(selectedVoucher.approvedAt || selectedVoucher.updatedAt)
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-grey-7 font-bold">Tgl Pengajuan</td>
                        <td>:</td>
                        <td class="text-weight-bold">
                          {{ formatDateIndo(selectedVoucher.tanggal_pengajuan) }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-grey-7 font-bold">Target Cair</td>
                        <td>:</td>
                        <td class="text-weight-bold text-negative">
                          {{ formatDateIndo(selectedVoucher.tanggal_dibutuhkan) }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-grey-7 font-bold">Pemohon (Req)</td>
                        <td>:</td>
                        <td class="text-weight-bold">
                          {{ selectedVoucher.pembuat_nama || selectedVoucher.pemohon || '-' }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-grey-7 font-bold">Otorisator</td>
                        <td>:</td>
                        <td class="text-weight-bold">
                          {{ selectedVoucher.approvedBy || '-' }}
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>

                <!-- === URAIAN / KEPERLUAN === -->
                <div class="voucher-box q-mb-md">
                  <div class="voucher-box-header">URAIAN / KEPERLUAN PEMBAYARAN</div>
                  <div
                    class="voucher-box-content text-body2 leading-relaxed italic text-blue-grey-9"
                  >
                    "{{ selectedVoucher.keterangan || selectedVoucher.keperluan || '-' }}"
                  </div>
                </div>

                <!-- === NOMINAL BESAR + TERBILANG === -->
                <div class="q-mb-md">
                  <table
                    style="
                      width: 100%;
                      border-collapse: collapse;
                      border: 2px solid #00695c;
                      border-radius: 8px;
                      overflow: hidden;
                    "
                  >
                    <tr>
                      <td
                        style="
                          background: #eceff1;
                          padding: 10px 16px;
                          font-weight: 800;
                          text-transform: uppercase;
                          color: #37474f;
                          font-size: 11px;
                          letter-spacing: 1px;
                          width: 40%;
                        "
                      >
                        TOTAL DIBAYARKAN
                      </td>
                      <td
                        style="
                          background: #00695c;
                          color: white;
                          font-size: 20px;
                          font-weight: 900;
                          padding: 10px 16px;
                          text-align: right;
                        "
                      >
                        Rp
                        {{
                          (
                            selectedVoucher.nominal_eksekusi ||
                            selectedVoucher.nominal ||
                            0
                          ).toLocaleString('id-ID')
                        }}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colspan="2"
                        style="
                          border-top: 1px solid #c5cae9;
                          padding: 8px 16px;
                          font-size: 11px;
                          font-style: italic;
                          color: #37474f;
                        "
                      >
                        <!-- (3) Fungsi Terbilang Bahasa Indonesia -->
                        Terbilang:
                        <strong
                          >{{
                            convertToTerbilang(
                              selectedVoucher.nominal_eksekusi || selectedVoucher.nominal || 0,
                            )
                          }}
                          Rupiah</strong
                        >
                      </td>
                    </tr>
                  </table>
                  <div class="text-right q-mt-xs text-caption text-grey-6 italic">
                    Telah diverifikasi dan disetujui sesuai dengan bukti invoice yang sah.
                  </div>
                </div>

                <!-- === (3) GRID TANDA TANGAN 4 KOLOM (FORMAL AKUNTANSI) === -->
                <div class="ttd-grid">
                  <!-- Kolom 1: Disetujui Oleh (Direktur/Pimpinan) -->
                  <div class="ttd-col">
                    <div class="ttd-role">Disetujui Oleh,</div>
                    <div class="ttd-jabatan text-caption text-grey-6">(Direktur / Pimpinan)</div>
                    <div class="ttd-area"></div>
                    <div class="ttd-name">
                      {{ selectedVoucher.approvedBy || '.......................' }}
                    </div>
                    <div class="ttd-role-label">Finance / Direksi</div>
                  </div>

                  <!-- Kolom 2: Diperiksa Oleh (Accounting / Internal Audit) -->
                  <div class="ttd-col">
                    <div class="ttd-role">Diperiksa Oleh,</div>
                    <div class="ttd-jabatan text-caption text-grey-6">(Accounting / Audit)</div>
                    <div class="ttd-area"></div>
                    <div class="ttd-name">.......................<br /></div>
                    <div class="ttd-role-label">Accounting Staff</div>
                  </div>

                  <!-- Kolom 3: Dibayarkan Oleh (Kasir / Finance) -->
                  <div class="ttd-col">
                    <div class="ttd-role">Dibayarkan Oleh,</div>
                    <div class="ttd-jabatan text-caption text-grey-6">(Kasir / Finance)</div>
                    <div class="ttd-area"></div>
                    <div class="ttd-name">.......................<br /></div>
                    <div class="ttd-role-label">Finance / Kasir</div>
                  </div>

                  <!-- Kolom 4: Diterima Oleh (Penerima Dana / Vendor) -->
                  <div class="ttd-col">
                    <div class="ttd-role">Diterima Oleh,</div>
                    <div class="ttd-jabatan text-caption text-grey-6">(Penerima Dana)</div>
                    <div class="ttd-area"></div>
                    <div class="ttd-name">
                      {{
                        selectedVoucher.vendor_nama ||
                        selectedVoucher.supplier_nama ||
                        '.......................'
                      }}
                    </div>
                    <div class="ttd-role-label">Vendor / TTD & Cap</div>
                  </div>
                </div>

                <!-- Footer Dokumen -->
                <div
                  class="q-mt-md text-center text-grey-4 text-caption font-bold tracking-widest uppercase"
                  style="font-size: 9px; border-top: 1px dashed #ccc; padding-top: 8px"
                >
                  Sistem Informasi Keuangan Agra ERP • Dokumen Resmi • Dicetak
                  {{ new Date().toLocaleDateString('id-ID') }}
                </div>
              </div>
              <!-- END voucher-pdf-target -->

              <!-- Tombol Buka Lampiran (UI Only, tidak ikut cetak) -->
              <div
                class="q-mt-lg text-center no-print"
                v-if="
                  selectedVoucher &&
                  (selectedVoucher.lampiran?.length > 0 || selectedVoucher.bukti_transfer)
                "
              >
                <q-btn
                  outline
                  color="teal-10"
                  icon="attachment"
                  label="Buka Lampiran / Bukti Transfer"
                  class="bg-white rounded-12 text-weight-bold shadow-1"
                  @click="
                    openLink(selectedVoucher.bukti_transfer || selectedVoucher.lampiran?.[0]?.url)
                  "
                />
              </div>
            </div>
          </div>
        </q-scroll-area>
      </q-card>
    </q-dialog>

    <!-- HIDDEN AREA PDF EXPORT TABLE -->
    <div style="position: absolute; top: -9999px; left: -9999px; width: 297mm; z-index: -1">
      <div id="table-pdf-export" class="landscape-paper">
        <div
          style="
            border-bottom: 3px solid #00695c;
            padding-bottom: 15px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
          "
        >
          <div
            style="
              background-color: #00695c;
              color: white;
              border-radius: 8px;
              padding: 12px;
              margin-right: 15px;
            "
          >
            <span style="font-size: 24px">💸</span>
          </div>
          <div>
            <div
              style="
                font-size: 24px;
                font-weight: 900;
                color: #00695c;
                text-transform: uppercase;
                letter-spacing: 1px;
              "
            >
              Laporan Monitoring Pengeluaran Kas
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 4px">
              Diekspor pada: {{ new Date().toLocaleString('id-ID') }}
            </div>
          </div>
        </div>
        <table class="report-table" style="width: 100%; border-collapse: collapse">
          <thead>
            <tr>
              <th style="width: 5%; text-align: center">NO</th>
              <th style="width: 12%; text-align: left">NO BKK</th>
              <th style="width: 20%; text-align: left">VENDOR / PENERIMA</th>
              <th style="width: 13%; text-align: left">METODE</th>
              <th style="width: 20%; text-align: left">KETERANGAN</th>
              <th style="width: 15%; text-align: right">NOMINAL (Rp)</th>
              <th style="width: 15%; text-align: center">STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in filteredExpenses" :key="idx">
              <td style="text-align: center; font-weight: bold">{{ idx + 1 }}</td>
              <td>
                <div style="font-weight: bold; color: #00695c">{{ generateNomorBKK(row) }}</div>
                <div style="font-size: 9px; color: #666; margin-top: 2px">
                  REQ: {{ row.no_request }}
                </div>
              </td>
              <td>
                <div style="font-weight: bold; text-transform: uppercase">
                  {{ row.vendor_nama || row.supplier_nama }}
                </div>
                <div style="font-size: 9px; color: #666; margin-top: 2px">
                  {{ row.rek_bank }} - {{ row.rek_nomor }}
                </div>
              </td>
              <td>{{ row.tipe_pengajuan || row.metode_bayar || '-' }}</td>
              <td style="font-size: 10px; font-style: italic">
                {{ (row.keterangan || row.keperluan || '-').substring(0, 80) }}
              </td>
              <td style="text-align: right; font-weight: bold">
                {{ (row.nominal || row.nominal_pengajuan || 0).toLocaleString('id-ID') }}
              </td>
              <td
                style="
                  text-align: center;
                  font-weight: bold;
                  text-transform: uppercase;
                  font-size: 10px;
                "
              >
                {{ row.status === 'Cair' ? 'SUDAH CAIR' : 'BELUM CAIR' }}
              </td>
            </tr>
            <tr v-if="filteredExpenses.length === 0">
              <td
                colspan="7"
                style="text-align: center; padding: 20px; color: #888; font-style: italic"
              >
                Tidak ada data.
              </td>
            </tr>
            <!-- Baris Total -->
            <tr v-if="filteredExpenses.length > 0">
              <td
                colspan="5"
                style="
                  text-align: right;
                  font-weight: 900;
                  font-size: 12px;
                  padding: 10px;
                  background: #eceff1;
                "
              >
                GRAND TOTAL PENGELUARAN
              </td>
              <td
                style="
                  text-align: right;
                  font-weight: 900;
                  font-size: 12px;
                  padding: 10px;
                  background: #00695c;
                  color: white;
                "
              >
                {{
                  filteredExpenses
                    .reduce((s, r) => s + (r.nominal || r.nominal_pengajuan || 0), 0)
                    .toLocaleString('id-ID')
                }}
              </td>
              <td style="background: #eceff1"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, onSnapshot, query, orderBy, where, getDoc, doc } from 'firebase/firestore'
import { useQuasar } from 'quasar'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()

// ============================================================================
// STATE
// ============================================================================
/** Data mentah dari Firestore: semua pengajuan yang Approved atau Cair */
const expenses = ref([])
const loading = ref(true)
const searchQuery = ref('')
const metodeFilter = ref('ALL')
const statusRealisasiFilter = ref('ALL')
const showVoucher = ref(false)
const selectedVoucher = ref(null)
const compConfig = ref({
  kopUrl: '',
  nama_perusahaan: '',
  slogan_perusahaan: '',
  alamat: '',
})

let unsubExpenses = null

// ============================================================================
// OPSI FILTER
// ============================================================================
const metodeOptions = [
  { label: 'Semua Metode', value: 'ALL' },
  { label: 'Tagihan Supplier', value: 'Tagihan Supplier' },
  { label: 'Manual', value: 'Manual' },
  { label: 'Transfer Bank', value: 'Transfer Bank' },
  { label: 'Tunai / Cash', value: 'Tunai / Cash' },
]

// Warna bar distribusi divisi (dirotasi)
const distBarColors = [
  'bg-teal-6',
  'bg-teal-6',
  'bg-orange-6',
  'bg-blue-7',
  'bg-purple-6',
  'bg-green-7',
  'bg-red-6',
  'bg-cyan-7',
]

// ============================================================================
// KOLOM TABEL
// ============================================================================
const columns = [
  { name: 'waktu', align: 'left', label: 'WAKTU & NO BKK', field: 'approvedAt', sortable: true },
  {
    name: 'penerima',
    align: 'left',
    label: 'PENERIMA (VENDOR)',
    field: 'vendor_nama',
    sortable: true,
  },
  { name: 'metode', align: 'center', label: 'METODE', field: 'tipe_pengajuan', sortable: true },
  {
    name: 'keperluan',
    align: 'left',
    label: 'URAIAN TRANSAKSI',
    field: 'keterangan',
    sortable: true,
  },
  { name: 'nominal', align: 'right', label: 'KAS KELUAR (IDR)', field: 'nominal', sortable: true },
  {
    name: 'status_realisasi',
    align: 'center',
    label: 'STATUS CAIR',
    field: 'status',
    sortable: true,
  },
  { name: 'aksi', align: 'center', label: 'VOUCHER', field: 'id' },
]

// ============================================================================
// FETCH DATA DARI FIRESTORE
// ============================================================================
const fetchData = async () => {
  loading.value = true

  // Ambil konfigurasi profil perusahaan untuk kop surat
  try {
    const confSnap = await getDoc(doc(db, 'config', 'perusahaan'))
    if (confSnap.exists()) compConfig.value = confSnap.data()
  } catch (e) {
    console.warn('Config perusahaan tidak ditemukan:', e)
  }

  /**
   * Ambil semua pengajuan yang statusnya 'Approved' ATAU 'Cair'.
   * - 'Approved' = sudah disetujui tapi belum ditransfer (outstanding)
   * - 'Cair'     = sudah ditransfer/terealisasi
   * Ini menggabungkan data dari alur Approval + Realisasi.
   */
  const qPengajuan = query(
    collection(db, 'finance_pengajuan_pembayaran'),
    where('status', 'in', ['Approved', 'Cair']),
    orderBy('createdAt', 'desc'),
  )

  unsubExpenses = onSnapshot(
    qPengajuan,
    (snap) => {
      expenses.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      console.error('Listen Error MonitoringPengeluaran:', err)
      loading.value = false
    },
  )
}

// ============================================================================
// COMPUTED: KPI UTAMA (WIDGET RINGKASAN)
// ============================================================================

/** Semua transaksi yang sudah pernah disetujui (Approved + Cair) */
const approvedExpenses = computed(() => expenses.value)

/** Transaksi yang sudah cair/terealisasi */
const cairExpenses = computed(() => expenses.value.filter((r) => r.status === 'Cair'))

/** Transaksi yang sudah disetujui tapi belum dicairkan */
const outstandingExpenses = computed(() => expenses.value.filter((r) => r.status === 'Approved'))

/** Total nominal semua pengajuan yang approved (termasuk yang belum cair) */
const totalDisetujui = computed(() =>
  approvedExpenses.value.reduce((s, r) => s + (r.nominal || 0), 0),
)

/** Total nominal yang sudah cair/terealisasi */
const totalTerealisasi = computed(() =>
  cairExpenses.value.reduce((s, r) => s + (r.nominal_eksekusi || r.nominal || 0), 0),
)

/** Total outstanding: disetujui belum dicairkan */
const totalOutstanding = computed(() =>
  outstandingExpenses.value.reduce((s, r) => s + (r.nominal || 0), 0),
)

/** Persentase realisasi dari total disetujui */
const realisasiPct = computed(() => {
  if (!totalDisetujui.value) return 0
  return Math.round((totalTerealisasi.value / totalDisetujui.value) * 100)
})

/** Persentase outstanding dari total disetujui */
const outstandingPct = computed(() => {
  if (!totalDisetujui.value) return 0
  return Math.round((totalOutstanding.value / totalDisetujui.value) * 100)
})

/** Total pengeluaran (hanya yang sudah benar-benar cair) */
const totalPengeluaran = computed(() => totalTerealisasi.value)

/** Pengeluaran bulan berjalan */
const currentMonthName = computed(() =>
  new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
)

const pengeluaranBulanIni = computed(() => {
  const prefix = new Date().toISOString().slice(0, 7) // 'YYYY-MM'
  return cairExpenses.value
    .filter((r) => {
      let d = ''
      if (r.realizedAt?.toDate) d = r.realizedAt.toDate().toISOString()
      else if (r.approvedAt?.toDate) d = r.approvedAt.toDate().toISOString()
      else if (r.approvedAt) d = new Date(r.approvedAt).toISOString()
      return d.startsWith(prefix)
    })
    .reduce((s, r) => s + (r.nominal_eksekusi || r.nominal || 0), 0)
})

/** Rata-rata per transaksi yang sudah cair */
const rataRataPengeluaran = computed(() => {
  if (!cairExpenses.value.length) return 0
  return Math.round(totalTerealisasi.value / cairExpenses.value.length)
})

// ============================================================================
// COMPUTED: DISTRIBUSI PENGELUARAN PER DIVISI / TIPE PENGAJUAN
// ============================================================================
/**
 * Menghitung distribusi pengeluaran berdasarkan tipe_pengajuan sebagai proxy divisi.
 * Dalam implementasi nyata, bisa diganti dengan field 'divisi' atau 'kategori'.
 */
const distribusiDivisi = computed(() => {
  if (!approvedExpenses.value.length) return []

  // Kelompokkan berdasarkan tipe_pengajuan atau vendor (proxy divisi)
  const map = {}
  for (const r of approvedExpenses.value) {
    const key = r.tipe_pengajuan || 'Lainnya'
    if (!map[key]) map[key] = { total: 0, count: 0 }
    map[key].total += r.nominal || 0
    map[key].count += 1
  }

  const grandTotal = approvedExpenses.value.reduce((s, r) => s + (r.nominal || 0), 0)

  return Object.entries(map)
    .map(([label, data]) => ({
      label,
      total: data.total,
      count: data.count,
      pct: grandTotal ? Math.round((data.total / grandTotal) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
})

// ============================================================================
// COMPUTED: FILTER DATA TABEL
// ============================================================================
const filteredExpenses = computed(() => {
  let res = expenses.value

  // Filter status realisasi
  if (statusRealisasiFilter.value !== 'ALL') {
    res = res.filter((r) => r.status === statusRealisasiFilter.value)
  }

  // Filter metode bayar
  if (metodeFilter.value !== 'ALL') {
    res = res.filter((r) => (r.tipe_pengajuan || r.metode_bayar || '').includes(metodeFilter.value))
  }

  // Pencarian teks
  if (searchQuery.value) {
    const lower = searchQuery.value.toLowerCase()
    res = res.filter(
      (r) =>
        r.no_request?.toLowerCase().includes(lower) ||
        r.vendor_nama?.toLowerCase().includes(lower) ||
        r.supplier_nama?.toLowerCase().includes(lower) ||
        r.tagihan_nomor_invoice?.toLowerCase().includes(lower) ||
        r.nomor_invoice?.toLowerCase().includes(lower),
    )
  }

  return res
})

// ============================================================================
// ACTIONS
// ============================================================================
const openVoucher = (row) => {
  selectedVoucher.value = row
  showVoucher.value = true
}

const openLink = (url) => {
  if (!url) {
    $q.notify({ type: 'warning', message: 'Tautan dokumen tidak tersedia.', position: 'top-right' })
    return
  }
  if (url.startsWith('data:')) {
    try {
      const arr = url.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) u8arr[n] = bstr.charCodeAt(n)
      const blob = new Blob([u8arr], { type: mime })
      window.open(URL.createObjectURL(blob), '_blank')
      // eslint-disable-next-line no-unused-vars
    } catch (_err) {
      $q.notify({ type: 'negative', message: 'Gagal membuka dokumen.', position: 'top-right' })
    }
  } else {
    window.open(url, '_blank')
  }
}

// ============================================================================
// UTILITAS: FORMAT TANGGAL
// ============================================================================
const formatDateIndo = (d) => {
  if (!d) return '-'
  const date = d?.toDate ? d.toDate() : new Date(d)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ============================================================================
// UTILITAS: FORMAT ANGKA KOMPAK
// ============================================================================
const formatCompact = (num) => {
  if (!num) return '0'
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + ' M'
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + ' Jt'
  return num.toLocaleString('id-ID')
}

// ============================================================================
// UTILITAS: WARNA METODE BAYAR
// ============================================================================
const getMetodeColor = (metode) => {
  if (!metode) return { bg: 'grey-2', text: 'grey-7', icon: 'payments' }
  const m = metode.toLowerCase()
  if (m.includes('tagihan') || m.includes('supplier'))
    return { bg: 'teal-1', text: 'teal-9', icon: 'receipt_long' }
  if (m.includes('transfer') || m.includes('bank'))
    return { bg: 'blue-1', text: 'primary', icon: 'account_balance' }
  if (m.includes('tunai') || m.includes('cash'))
    return { bg: 'green-1', text: 'positive', icon: 'local_atm' }
  return { bg: 'purple-1', text: 'purple-9', icon: 'money' }
}

// ============================================================================
// (3) UTILITAS: GENERATE NOMOR BKK OTOMATIS
// Format: BKK/[TAHUN]/[BULAN]/[ID Unik]
// ============================================================================
const generateNomorBKK = (row) => {
  if (!row) return '-'
  let date
  if (row.approvedAt?.toDate) {
    date = row.approvedAt.toDate()
  } else if (row.approvedAt) {
    date = new Date(row.approvedAt)
  } else if (row.createdAt?.toDate) {
    date = row.createdAt.toDate()
  } else {
    date = new Date()
  }

  const tahun = date.getFullYear()
  const bulan = String(date.getMonth() + 1).padStart(2, '0')

  // Ambil 4 karakter terakhir ID dokumen sebagai nomor urut
  const idSuffix = (row.id || '0000').slice(-4).toUpperCase()

  return `BKK/${tahun}/${bulan}/${idSuffix}`
}

// ============================================================================
// (3) UTILITAS: KONVERSI ANGKA KE TERBILANG BAHASA INDONESIA
// ============================================================================
const convertToTerbilang = (angka) => {
  const satuan = [
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
    'Dua Belas',
    'Tiga Belas',
    'Empat Belas',
    'Lima Belas',
    'Enam Belas',
    'Tujuh Belas',
    'Delapan Belas',
    'Sembilan Belas',
  ]

  /** Rekursif untuk angka < 1.000 */
  const ratusan = (n) => {
    if (n < 20) return satuan[n]
    if (n < 100) {
      const puluh = Math.floor(n / 10)
      const sisa = n % 10
      return (puluh === 1 ? 'Sepuluh' : satuan[puluh] + ' Puluh') + (sisa ? ' ' + satuan[sisa] : '')
    }
    const ratus = Math.floor(n / 100)
    const sisa = n % 100
    const prefixRatus = ratus === 1 ? 'Seratus' : satuan[ratus] + ' Ratus'
    return prefixRatus + (sisa ? ' ' + ratusan(sisa) : '')
  }

  if (!angka || angka === 0) return 'Nol'

  angka = Math.round(angka) // Bulatkan ke bilangan bulat

  let hasil = ''
  let negatif = false

  if (angka < 0) {
    negatif = true
    angka = Math.abs(angka)
  }

  if (angka >= 1_000_000_000_000) {
    hasil += ratusan(Math.floor(angka / 1_000_000_000_000)) + ' Triliun '
    angka %= 1_000_000_000_000
  }
  if (angka >= 1_000_000_000) {
    hasil += ratusan(Math.floor(angka / 1_000_000_000)) + ' Miliar '
    angka %= 1_000_000_000
  }
  if (angka >= 1_000_000) {
    hasil += ratusan(Math.floor(angka / 1_000_000)) + ' Juta '
    angka %= 1_000_000
  }
  if (angka >= 1_000) {
    const ribuan = Math.floor(angka / 1_000)
    hasil += (ribuan === 1 ? 'Seribu' : ratusan(ribuan) + ' Ribu') + ' '
    angka %= 1_000
  }
  if (angka > 0) {
    hasil += ratusan(angka)
  }

  return (negatif ? 'Minus ' : '') + hasil.trim()
}

// ============================================================================
// EXPORT: VOUCHER KE PDF
// ============================================================================
const exportVoucherToPDF = () => {
  const element = document.getElementById('voucher-pdf-target')
  if (!element) return

  const reqNo = generateNomorBKK(selectedVoucher.value).replace(/\//g, '-')
  const opt = {
    margin: 10,
    filename: `${reqNo}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2.5, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' },
  }

  $q.loading.show({ message: 'Mencetak Voucher Bukti Kas Keluar...' })
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => {
      $q.loading.hide()
      $q.notify({
        type: 'positive',
        position: 'top-right',
        icon: 'picture_as_pdf',
        message: 'Voucher BKK berhasil diunduh!',
        timeout: 2500,
      })
    })
}

// ============================================================================
// EXPORT: LIST TABLE KE PDF
// ============================================================================
const exportTablePDF = () => {
  const e = document.getElementById('table-pdf-export')
  if (!e) return
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `Monitoring_Pengeluaran_${Date.now()}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
  }
  $q.loading.show({ message: 'Mengekspor PDF...' })
  html2pdf()
    .set(opt)
    .from(e)
    .save()
    .then(() => {
      $q.loading.hide()
      $q.notify({
        type: 'positive',
        position: 'top-right',
        icon: 'picture_as_pdf',
        message: 'PDF berhasil diunduh.',
        timeout: 2500,
      })
    })
}

// ============================================================================
// EXPORT: LIST TABLE KE EXCEL (HTML-based .xls)
// ============================================================================
const exportTableExcel = () => {
  try {
    const thStyle =
      'background-color: #00695c; color: #ffffff; font-weight: bold; border: 1px solid #dddddd; padding: 10px;'
    const tdStyle = 'border: 1px solid #dddddd; padding: 8px; vertical-align: top;'
    const tdNumStyle = tdStyle + ' text-align: right;'
    const tdCenterStyle = tdStyle + ' text-align: center;'

    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" '
    html +=
      'xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">'
    html += '<head><meta charset="utf-8"></head><body>'
    html +=
      '<h2 style="color:#00695c;font-family:sans-serif">Laporan Monitoring Pengeluaran Kas</h2>'
    html +=
      '<p style="font-family:sans-serif">Diekspor pada: ' +
      new Date().toLocaleString('id-ID') +
      '</p><br>'
    html += '<table style="border-collapse:collapse;width:100%;font-family:sans-serif">'
    html += '<thead><tr>'
    ;[
      'No',
      'No BKK',
      'No Request',
      'Vendor / Penerima',
      'Bank',
      'No Rekening',
      'Tipe/Metode',
      'Keterangan',
      'Tgl Disetujui',
      'Nominal (Rp)',
      'Status',
    ].forEach((h) => {
      html += `<th style="${thStyle}">${h}</th>`
    })
    html += '</tr></thead><tbody>'

    let total = 0
    filteredExpenses.value.forEach((r, i) => {
      total += r.nominal || r.nominal_pengajuan || 0
      html += `<tr>
        <td style="${tdCenterStyle}">${i + 1}</td>
        <td style="${tdStyle}">${generateNomorBKK(r)}</td>
        <td style="${tdStyle}">${r.no_request || '-'}</td>
        <td style="${tdStyle}">${r.vendor_nama || r.supplier_nama || '-'}</td>
        <td style="${tdCenterStyle}">${r.rek_bank || '-'}</td>
        <td style="${tdStyle} mso-number-format:'\\@';">${r.rek_nomor || '-'}</td>
        <td style="${tdCenterStyle}">${r.tipe_pengajuan || r.metode_bayar || '-'}</td>
        <td style="${tdStyle}">${(r.keterangan || r.keperluan || '-').replace(/\n/g, '<br>')}</td>
        <td style="${tdCenterStyle}">${formatDateIndo(r.approvedAt || r.createdAt)}</td>
        <td style="${tdNumStyle}">${r.nominal || r.nominal_pengajuan || 0}</td>
        <td style="${tdCenterStyle}">${r.status === 'Cair' ? 'SUDAH CAIR' : 'BELUM CAIR'}</td>
      </tr>`
    })

    html += `<tr>
      <td colspan="9" style="${tdStyle} text-align:right; font-weight:bold; background:#eceff1">GRAND TOTAL</td>
      <td style="${tdNumStyle} font-weight:bold; background:#00695c; color:white">${total.toLocaleString('id-ID')}</td>
      <td style="${tdStyle}"></td>
    </tr>`
    html += '</tbody></table></body></html>'

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Monitoring_Pengeluaran_${Date.now()}.xls`
    link.click()
    URL.revokeObjectURL(url)

    $q.notify({
      type: 'positive',
      position: 'top-right',
      icon: 'table_view',
      message: 'Data berhasil diekspor ke Excel.',
      timeout: 2500,
    })
  } catch (err) {
    console.error(err)
    $q.notify({
      type: 'negative',
      position: 'top-right',
      message: 'Gagal mengekspor Excel.',
      timeout: 3000,
    })
  }
}

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(() => {
  fetchData()
})
onUnmounted(() => {
  if (unsubExpenses) unsubExpenses()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

/* ─── BASE ───────────────────────────────────────────────── */
.font-pro {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-12 {
  border-radius: 12px;
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-indigo-thin {
  border: 1px solid rgba(0, 105, 92, 0.1);
}
.border-bottom {
  border-bottom: 1px solid #eee;
}
.border-bottom-thick {
  border-bottom: 3px solid #00695c;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(0, 105, 92, 0.15);
}
.leading-tight {
  line-height: 1.2;
}
.leading-none {
  line-height: 1.1;
}
.leading-relaxed {
  line-height: 1.6;
}
.font-11 {
  font-size: 11px;
}
.font-10 {
  font-size: 10px;
}
.font-bold {
  font-weight: 700;
}
.tracking-widest {
  letter-spacing: 0.15em;
}
.tracking-tighter {
  letter-spacing: -1px;
}
.font-mono {
  font-family: 'Courier New', monospace;
}
.opacity-50 {
  opacity: 0.5;
}
.opacity-70 {
  opacity: 0.7;
}
.uppercase {
  text-transform: uppercase;
}
.italic {
  font-style: italic;
}
.truncate-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ─── KPI CARDS ──────────────────────────────────────────── */
.kpi-card {
  border: none !important;
}
.kpi-indigo {
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%) !important;
  box-shadow: 0 8px 24px rgba(0, 105, 92, 0.35) !important;
}
.kpi-green {
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%) !important;
  box-shadow: 0 8px 24px rgba(46, 125, 50, 0.35) !important;
}
.kpi-orange {
  background: linear-gradient(135deg, #fb8c00 0%, #e65100 100%) !important;
  box-shadow: 0 8px 24px rgba(230, 81, 0, 0.35) !important;
}
.kpi-label {
  font-size: 10px;
  letter-spacing: 0.12em;
  opacity: 0.9;
}
.kpi-icon-wrap {
  background: rgba(255, 255, 255, 0.18) !important;
  border-radius: 12px !important;
  min-width: 56px;
  text-align: center;
}

/* Mini progress bar dalam KPI card */
.kpi-bar-track {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 99px;
  height: 5px;
  width: 100%;
}
.kpi-bar-fill {
  height: 5px;
  border-radius: 99px;
  transition: width 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* ─── DISTRIBUSI CHART HORIZONTAL ───────────────────────── */
.dist-bar-track {
  background: #f0f0f0;
  border-radius: 99px;
  height: 22px;
  width: 100%;
  overflow: hidden;
  position: relative;
}
.dist-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.9s cubic-bezier(0.25, 0.8, 0.25, 1);
  min-width: 30px;
  display: flex;
  align-items: center;
  position: relative;
}
.dist-bar-label {
  position: absolute;
  right: 8px;
  color: white;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

/* ─── TABLE ──────────────────────────────────────────────── */
.finance-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 16px;
}
.hover-bg:hover {
  background-color: rgba(0, 137, 123, 0.03) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(0, 105, 92, 0.1) !important;
}
.hover-blue-btn:hover {
  background-color: #e0f2f1 !important;
  color: #00695c !important;
}

/* ─── ANIMASI ────────────────────────────────────────────── */
.animate-fade {
  animation: fadeIn 0.6s ease-out;
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
.animate-spin-slow {
  animation: spin 4s linear infinite;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

/* ─── SEARCH ─────────────────────────────────────────────── */
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}

/* ─── DIALOG TABS ────────────────────────────────────────── */
.p-1 {
  padding: 4px;
}

/* ─── VOUCHER BKK (TARGET PDF / CETAK) ──────────────────── */
/*
 * Ukuran A5 Portrait (148mm x 210mm) — cukup untuk voucher kas keluar.
 * Padding 12mm di semua sisi agar aman untuk cetak fisik.
 */
.voucher-paper {
  background: white;
  width: 100%;
  max-width: 148mm;
  min-height: 200mm;
  padding: 12mm;
  margin: 0 auto;
  color: black;
  box-sizing: border-box;
  font-family: 'Plus Jakarta Sans', Arial, sans-serif;
}

.voucher-logo {
  height: 48px;
  object-fit: contain;
  max-width: 120px;
}

.voucher-info-table {
  border-collapse: collapse;
}
.voucher-info-table td {
  padding: 4px 0;
  vertical-align: top;
  font-size: 12px;
}

.voucher-box {
  border: 1.5px solid #cfd8dc;
  border-radius: 6px;
  overflow: hidden;
}
.voucher-box-header {
  background: #eceff1;
  padding: 6px 12px;
  font-weight: 800;
  color: #37474f;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.voucher-box-content {
  padding: 10px 12px;
  font-size: 12px;
}

/* Grid Tanda Tangan 4 Kolom */
.ttd-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 16px;
  border-top: 1px solid #e0e0e0;
  padding-top: 12px;
}
.ttd-col {
  text-align: center;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px 4px 6px;
  background: #fafafa;
}
.ttd-role {
  font-weight: 700;
  font-size: 11px;
  color: #37474f;
}
.ttd-jabatan {
  font-size: 9px;
  color: #9e9e9e;
  margin-top: 2px;
  min-height: 14px;
}
.ttd-area {
  height: 52px;
  border-bottom: 1.5px solid #00695c;
  margin: 8px 10px 6px;
}
.ttd-name {
  font-weight: 800;
  font-size: 10px;
  text-transform: uppercase;
  color: #00695c;
  min-height: 16px;
  word-break: break-word;
}
.ttd-role-label {
  font-size: 9px;
  color: #757575;
  margin-top: 2px;
  font-style: italic;
}

/* ─── PDF LANDSCAPE TABLE ────────────────────────────────── */
.landscape-paper {
  background: white;
  width: 297mm;
  min-height: 210mm;
  padding: 10mm 15mm;
  margin: 0;
  color: #1a1a1a;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
}
.report-table th {
  background-color: #00695c !important;
  color: white !important;
  padding: 10px;
  font-size: 11px;
  border: 1px solid #00695c;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.report-table td {
  padding: 8px 10px;
  font-size: 11px;
  border: 1px solid #ddd;
  color: #333;
  vertical-align: middle;
}
.report-table tr:nth-child(even) td {
  background-color: #f9f9f9 !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ─── PRINT MEDIA ────────────────────────────────────────── */
@media print {
  body {
    background: white !important;
  }
  .no-print {
    display: none !important;
  }
  .voucher-paper {
    box-shadow: none !important;
    margin: 0 !important;
    max-width: 148mm !important;
    padding: 12mm !important;
  }
}
</style>
