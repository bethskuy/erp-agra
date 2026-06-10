<template>
  <q-page class="bg-page q-pa-md font-pro">
    <div class="page-content-wrapper">
      <div class="row items-center justify-between q-mb-lg no-print">
        <div class="col-12">
          <div class="row items-center no-wrap">
            <div>
              <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
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
        </div>
      </div>

      <!-- KPI CARDS UTAMA (3 card) -->
      <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
        <div class="col-12 col-sm-4">
          <q-card flat class="rounded-20 kpi-card kpi-brand text-white transition-all hover-shadow">
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
            <div class="q-px-lg q-pb-md">
              <div class="kpi-bar-track">
                <div class="kpi-bar-fill bg-white" style="width: 100%"></div>
              </div>
            </div>
          </q-card>
        </div>

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

        <div class="col-12 col-sm-4">
          <q-card
            flat
            class="rounded-20 kpi-card kpi-orange text-white transition-all hover-shadow"
          >
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

      <!-- KPI SEKUNDER (4 card) -->
      <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card
            flat
            class="rounded-20 kpi-card kpi-sec-red text-white transition-all hover-shadow"
          >
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

      <!-- DISTRIBUSI PENGELUARAN PER DIVISI -->
      <q-card flat bordered class="rounded-20 shadow-sm bg-white q-mb-lg no-print">
        <q-card-section
          class="bg-teal-1 q-py-sm text-teal-10 text-weight-bold flex items-center border-bottom"
        >
          <q-icon name="donut_small" class="q-mr-xs" size="sm" />
          DISTRIBUSI PENGELUARAN PER DIVISI / TIPE
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <div v-if="distribusiDivisi.length === 0" class="text-center q-pa-xl text-grey-5">
            <q-icon name="bar_chart" size="48px" class="q-mb-sm opacity-50" />
            <div>Belum ada data pengeluaran untuk divisualisasikan.</div>
          </div>
          <div v-else class="q-gutter-y-md">
            <div v-for="(divisi, idx) in distribusiDivisi" :key="idx">
              <div class="row items-center q-col-gutter-md no-wrap">
                <div class="col-12 col-md-3">
                  <div class="text-weight-bold text-blue-grey-9 font-11 uppercase truncate-label">
                    {{ divisi.label }}
                  </div>
                  <div class="text-caption text-grey-6">{{ divisi.count }} transaksi</div>
                </div>
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

      <!-- FILTER -->
      <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print border-subtle">
        <q-card-section class="q-py-md">
          <div class="row items-center justify-between q-col-gutter-md">
            <div class="col-12 col-md-5">
              <q-input
                v-model="searchQuery"
                outlined
                dense
                rounded
                placeholder="Cari Vendor, No. Voucher, Invoice..."
                bg-color="white"
                class="search-input"
                color="brand-primary"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="brand-primary" />
                </template>
                <template v-slot:append v-if="searchQuery">
                  <q-icon name="close" @click="searchQuery = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </div>
            <div
              class="col-12 col-md-auto flex items-center justify-center justify-sm-end q-gutter-x-md q-mt-sm q-mt-sm-none"
            >
              <q-tabs
                v-model="statusRealisasiFilter"
                dense
                class="text-grey-7 bg-grey-1 rounded-12 p-1"
                active-color="white"
                active-bg-color="brand-primary"
                indicator-color="transparent"
                align="left"
                narrow-indicator
              >
                <q-tab
                  name="ALL"
                  label="Semua Status"
                  class="text-weight-bold rounded-12 q-px-md"
                />
                <q-tab name="Cair" label="Sudah Cair" class="text-weight-bold rounded-12 q-px-md" />
                <q-tab
                  name="Approved"
                  label="Belum Cair"
                  class="text-weight-bold rounded-12 q-px-md"
                />
              </q-tabs>

              <q-btn-dropdown
                unelevated
                color="white"
                text-color="brand-primary"
                icon="ios_share"
                label="Export Data"
                class="rounded-12 text-weight-bold shadow-2"
              >
                <q-list class="bg-white rounded-borders q-py-sm" style="min-width: 200px">
                  <q-item clickable v-close-popup @click="exportTablePDF" class="hover-brand-btn">
                    <q-item-section avatar>
                      <q-avatar color="red-1" text-color="red-10" icon="picture_as_pdf" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">Download PDF</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator class="q-my-sm" />
                  <q-item clickable v-close-popup @click="exportTableExcel" class="hover-brand-btn">
                    <q-item-section avatar>
                      <q-avatar color="green-1" text-color="green-10" icon="table_view" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">Export Excel</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <q-btn
                unelevated
                color="brand-primary"
                text-color="white"
                icon="add_circle"
                label="Pengeluaran Manual"
                class="rounded-12 text-weight-bold shadow-2 btn-pengeluaran-manual"
                @click="openAddManualDialog"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- MAIN TABLE -->
      <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white no-print">
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
            <q-tr :props="props" class="bg-brand-primary text-white">
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

              <q-td key="keperluan" class="text-left" style="max-width: 250px">
                <div class="text-body2 text-blue-grey-8 ellipsis-2-lines italic">
                  "{{ props.row.keterangan || props.row.keperluan || '-' }}"
                </div>
              </q-td>

              <q-td key="nominal" class="text-right">
                <div class="text-weight-black text-negative text-subtitle1">
                  - Rp
                  {{
                    (props.row.nominal || props.row.nominal_pengajuan || 0).toLocaleString('id-ID')
                  }}
                </div>
              </q-td>

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

              <q-td key="aksi" class="text-center" @click.stop>
                <q-btn
                  flat
                  round
                  color="brand-primary"
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

      <!-- DIALOG VOUCHER BKK -->
      <q-dialog
        v-model="showVoucher"
        maximized
        transition-show="slide-up"
        transition-hide="slide-down"
        backdrop-filter="blur(8px)"
      >
        <q-card class="bg-grey-3 column no-wrap">
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
                <div id="voucher-pdf-target" class="voucher-paper shadow-24" v-if="selectedVoucher">
                  <div class="row items-start justify-between q-mb-md border-bottom-thick q-pb-md">
                    <div class="row items-center no-wrap">
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
                            compConfig.slogan_perusahaan ||
                            'General Construction & General Supplier'
                          }}
                        </div>
                        <div class="text-caption text-grey-6 q-mt-xs">
                          {{ compConfig.alamat || '-' }}
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div
                        class="text-h5 text-weight-black text-teal-10 uppercase tracking-widest leading-none"
                      >
                        BUKTI KAS KELUAR
                      </div>
                      <div class="text-subtitle2 text-weight-bold text-grey-8 font-mono q-mt-xs">
                        No: {{ generateNomorBKK(selectedVoucher) }}
                      </div>
                    </div>
                  </div>

                  <div class="row q-col-gutter-lg q-mb-md">
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
                    <div class="col-5">
                      <table class="voucher-info-table full-width">
                        <tr>
                          <td width="120" class="text-grey-7 font-bold">Tgl Pembayaran</td>
                          <td width="12">:</td>
                          <td class="text-weight-bold">
                            {{
                              formatDateIndo(
                                selectedVoucher.approvedAt || selectedVoucher.updatedAt,
                              )
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

                  <div class="voucher-box q-mb-md">
                    <div class="voucher-box-header">URAIAN / KEPERLUAN PEMBAYARAN</div>
                    <div
                      class="voucher-box-content text-body2 leading-relaxed italic text-blue-grey-9"
                    >
                      "{{ selectedVoucher.keterangan || selectedVoucher.keperluan || '-' }}"
                    </div>
                  </div>

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

                  <div class="ttd-grid">
                    <div class="ttd-col">
                      <div class="ttd-role">Disetujui Oleh,</div>
                      <div class="ttd-jabatan text-caption text-grey-6">(Direktur / Pimpinan)</div>
                      <div class="ttd-area"></div>
                      <div class="ttd-name">
                        {{ selectedVoucher.approvedBy || '.......................' }}
                      </div>
                      <div class="ttd-role-label">Finance / Direksi</div>
                    </div>
                    <div class="ttd-col">
                      <div class="ttd-role">Diperiksa Oleh,</div>
                      <div class="ttd-jabatan text-caption text-grey-6">(Accounting / Audit)</div>
                      <div class="ttd-area"></div>
                      <div class="ttd-name">.......................</div>
                      <div class="ttd-role-label">Accounting Staff</div>
                    </div>
                    <div class="ttd-col">
                      <div class="ttd-role">Dibayarkan Oleh,</div>
                      <div class="ttd-jabatan text-caption text-grey-6">(Kasir / Finance)</div>
                      <div class="ttd-area"></div>
                      <div class="ttd-name">.......................</div>
                      <div class="ttd-role-label">Finance / Kasir</div>
                    </div>
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

                  <div
                    class="q-mt-md text-center text-grey-4 text-caption font-bold tracking-widest uppercase"
                    style="font-size: 9px; border-top: 1px dashed #ccc; padding-top: 8px"
                  >
                    Sistem Informasi Keuangan Agra ERP • Dokumen Resmi • Dicetak
                    {{ new Date().toLocaleDateString('id-ID') }}
                  </div>
                </div>

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

      <!-- DIALOG INPUT PENGELUARAN MANUAL -->
      <q-dialog v-model="showAddDialog" persistent backdrop-filter="blur(8px)">
        <q-card style="width: 700px; max-width: 90vw" class="rounded-20 font-pro">
          <q-card-section class="bg-teal-10 text-white q-py-md">
            <div class="row items-center justify-between">
              <div class="text-h6 text-weight-bold">Input Pengeluaran Manual</div>
              <q-btn flat round dense icon="close" v-close-popup />
            </div>
          </q-card-section>

          <q-card-section class="q-pa-lg scroll" style="max-height: 70vh">
            <div class="q-gutter-y-md">
              <!-- 1. DETAIL PENERIMA -->
              <div class="text-subtitle2 text-teal-10 text-weight-bold uppercase tracking-wider">
                1. Detail Penerima & Pembayaran
              </div>

              <div>
                <div class="text-caption text-grey-8 font-bold q-mb-xs">
                  Nama Penerima / Vendor *
                </div>
                <q-input
                  outlined
                  dense
                  v-model="form.vendor_nama"
                  placeholder="Contoh: Toko Bangunan Jaya"
                  class="text-weight-bold uppercase"
                />
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <div class="text-caption text-grey-8 font-bold q-mb-xs">Bank / Cash *</div>
                  <q-input
                    outlined
                    dense
                    v-model="form.rek_bank"
                    placeholder="BCA / Mandiri / Tunai"
                    class="uppercase text-weight-bold"
                  />
                </div>
                <div class="col-12 col-md-8">
                  <div class="text-caption text-grey-8 font-bold q-mb-xs">
                    Nomor Rekening (Gunakan '-' jika tunai) *
                  </div>
                  <q-input
                    outlined
                    dense
                    v-model="form.rek_nomor"
                    placeholder="12345678 atau -"
                    class="text-weight-bold text-primary"
                  />
                </div>
                <div class="col-12">
                  <div class="text-caption text-grey-8 font-bold q-mb-xs">Atas Nama Rekening</div>
                  <q-input
                    outlined
                    dense
                    v-model="form.rek_nama"
                    placeholder="Sesuai rekening atau nama penerima"
                    class="uppercase"
                  />
                </div>
              </div>

              <q-separator class="q-my-md" />

              <!-- 2. NOMINAL & URAIAN -->
              <div class="text-subtitle2 text-teal-10 text-weight-bold uppercase tracking-wider">
                2. Jumlah & Keperluan
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-8 font-bold q-mb-xs">
                    Nominal Pengeluaran (Rp) *
                  </div>
                  <q-input
                    outlined
                    dense
                    type="number"
                    v-model.number="form.nominal"
                    class="text-weight-bold text-teal-10"
                    prefix="Rp"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-8 font-bold q-mb-xs">Tanggal Pembayaran *</div>
                  <q-input outlined dense type="date" v-model="form.tanggal_pembayaran" />
                </div>
              </div>

              <div>
                <div class="text-caption text-grey-8 font-bold q-mb-xs">
                  Uraian / Keterangan Keperluan *
                </div>
                <q-input
                  outlined
                  dense
                  type="textarea"
                  rows="3"
                  v-model="form.keterangan"
                  placeholder="Deskripsikan secara lengkap pengeluaran kas ini..."
                />
              </div>

              <q-separator class="q-my-md" />

              <!-- 3. ALOKASI PROYEK & SPK/BOQ -->
              <div class="text-subtitle2 text-teal-10 text-weight-bold uppercase tracking-wider">
                3. Alokasi Proyek & Pekerjaan (Opsional)
              </div>

              <div>
                <div class="text-caption text-grey-8 font-bold q-mb-xs">Alokasi Proyek</div>
                <q-select
                  outlined
                  dense
                  v-model="form.proyek_id"
                  :options="allProyek"
                  option-label="nama"
                  option-value="id"
                  emit-value
                  map-options
                  placeholder="Pilih Proyek jika untuk proyek tertentu..."
                  clearable
                  @update:model-value="onProyekSelect"
                />
              </div>

              <div v-if="form.proyek_id">
                <div class="text-caption text-grey-8 font-bold q-mb-xs">
                  Pilih SPK (Bisa Lebih dari 1)
                </div>
                <q-select
                  outlined
                  dense
                  multiple
                  v-model="form.selected_spk"
                  :options="currentSpkOptions"
                  option-label="nomor_spk"
                  option-value="id"
                  emit-value
                  map-options
                  placeholder="Pilih SPK..."
                  clearable
                  use-chips
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label class="text-weight-bold">
                          {{
                            scope.opt.nomor_spk || scope.opt.nama_kontrak || `SPK: ${scope.opt.id}`
                          }}
                        </q-item-label>
                        <q-item-label caption>{{
                          scope.opt.nama_kontrak || scope.opt.id
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <div v-if="form.proyek_id && form.selected_spk && form.selected_spk.length > 0">
                <div class="text-caption text-grey-8 font-bold q-mb-sm">
                  Detail Kategori & Item BOQ per SPK
                </div>
                <div class="q-gutter-y-md">
                  <div
                    v-for="(spkId, idx) in form.selected_spk"
                    :key="idx"
                    class="bg-grey-1 q-pa-md rounded-12"
                  >
                    <div class="text-weight-bold text-teal-10 q-mb-sm">
                      {{ getSpkById(spkId)?.nomor_spk || 'SPK' }} -
                      {{ getSpkById(spkId)?.nama_kontrak || '' }}
                    </div>
                    <template v-if="form.spk_boq_selection[spkId]">
                      <div class="text-caption text-grey-8 font-bold q-mb-xs">
                        Pilih Kategori BOQ
                      </div>
                      <q-select
                        outlined
                        dense
                        multiple
                        emit-value
                        map-options
                        v-model="form.spk_boq_selection[spkId].selected_groups"
                        :options="getSpkBoqGroups(spkId)"
                        option-label="title"
                        option-value="title"
                        placeholder="Pilih Kategori..."
                        clearable
                        use-chips
                      />

                      <div
                        v-if="form.spk_boq_selection[spkId].selected_groups.length"
                        class="q-mt-md"
                      >
                        <div class="text-caption text-grey-8 font-bold q-mb-xs">Pilih Item BOQ</div>
                        <div class="q-gutter-y-sm">
                          <div
                            v-for="(groupTitle, gIdx) in form.spk_boq_selection[spkId]
                              .selected_groups"
                            :key="gIdx"
                            class="bg-white q-pa-sm rounded-8"
                          >
                            <div class="text-weight-bold text-caption q-mb-xs">
                              {{ groupTitle }}
                            </div>
                            <q-select
                              outlined
                              dense
                              multiple
                              emit-value
                              map-options
                              v-model="
                                form.spk_boq_selection[spkId].selected_items_by_group[groupTitle]
                              "
                              :options="getSpkBoqGroupItems(spkId, groupTitle)"
                              option-label="deskripsi"
                              option-value="deskripsi"
                              placeholder="Pilih Item..."
                              clearable
                              use-chips
                            />
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-pa-md bg-grey-1">
            <q-btn
              flat
              label="Batal"
              color="grey-7"
              v-close-popup
              class="rounded-12 text-weight-bold"
            />
            <q-btn
              unelevated
              label="Simpan Pengeluaran"
              color="teal-10"
              :loading="submitting"
              @click="simpanManualExpense"
              class="rounded-12 text-weight-bold q-px-lg"
            />
          </q-card-actions>
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
  where,
  getDoc,
  doc,
  addDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const authStore = useAuthStore()

// State for manual expense dialog
const showAddDialog = ref(false)
const submitting = ref(false)

const allProyek = ref([])
const allSpk = ref([])
let unsubSpk = null

const formDefault = {
  vendor_nama: '',
  rek_bank: '',
  rek_nomor: '',
  rek_nama: '',
  nominal: 0,
  tanggal_pembayaran: new Date().toISOString().substring(0, 10),
  keterangan: '',
  proyek_id: null,
  proyek_nama: '',
  selected_spk: [],
  spk_boq_selection: {},
}
const form = ref({ ...formDefault })

const getSpkById = (id) => {
  const targetId = typeof id === 'object' && id !== null ? id.id : id
  return allSpk.value.find((s) => s.id === targetId)
}

const currentSpkOptions = computed(() => {
  if (!form.value.proyek_id) return []

  const targetProjId =
    typeof form.value.proyek_id === 'object' && form.value.proyek_id !== null
      ? form.value.proyek_id.id
      : form.value.proyek_id

  return allSpk.value.filter((s) => {
    const spkProjId = s.projectId || s.proyek_id || s.proyek || s.proyekId
    const spkProjIdString =
      typeof spkProjId === 'object' && spkProjId !== null ? spkProjId.id : spkProjId
    return spkProjIdString === targetProjId
  })
})

const getSpkBoqGroups = (spkId) => {
  const spk = getSpkById(spkId)
  if (!spk || !spk.groups) return []
  return spk.groups
}

const getSpkBoqGroupItems = (spkId, groupTitle) => {
  const spk = getSpkById(spkId)
  if (!spk || !spk.groups) return []
  const group = spk.groups.find((g) => g.title === groupTitle)
  return group?.items?.filter((i) => !i.is_header) || []
}

const onProyekSelect = (proyekId) => {
  form.value.selected_spk = []
  form.value.spk_boq_selection = {}

  if (proyekId) {
    const matchedProyek = allProyek.value.find((p) => p.id === proyekId)
    form.value.proyek_nama = matchedProyek ? matchedProyek.nama : ''
  } else {
    form.value.proyek_nama = ''
  }
}

watch(
  () => form.value.selected_spk,
  (newVal) => {
    if (!form.value.spk_boq_selection) {
      form.value.spk_boq_selection = {}
    }
    if (newVal && Array.isArray(newVal)) {
      newVal.forEach((spkId) => {
        const idString = typeof spkId === 'object' && spkId !== null ? spkId.id : spkId
        if (!form.value.spk_boq_selection[idString]) {
          form.value.spk_boq_selection[idString] = {
            selected_groups: [],
            selected_items_by_group: {},
          }
        }
      })
    }
  },
  { immediate: true, deep: true },
)

watch(
  () => form.value.spk_boq_selection,
  (newVal) => {
    if (!newVal) return
    Object.keys(newVal).forEach((spkId) => {
      const spkSelection = newVal[spkId]
      if (spkSelection && spkSelection.selected_groups) {
        if (!spkSelection.selected_items_by_group) {
          spkSelection.selected_items_by_group = {}
        }
        spkSelection.selected_groups.forEach((groupTitle) => {
          if (!spkSelection.selected_items_by_group[groupTitle]) {
            spkSelection.selected_items_by_group[groupTitle] = []
          }
        })
      }
    })
  },
  { deep: true },
)

const openAddManualDialog = () => {
  form.value = JSON.parse(JSON.stringify(formDefault))
  form.value.tanggal_pembayaran = new Date().toISOString().substring(0, 10)
  showAddDialog.value = true
}

const generateNoRequestManual = () => {
  const count = expenses.value.length + 1
  const padded = count.toString().padStart(3, '0')
  const year = new Date().getFullYear()
  const month = ('0' + (new Date().getMonth() + 1)).slice(-2)
  return `REQ-MAN/${year}${month}/${padded}`
}

const simpanManualExpense = async () => {
  if (
    !form.value.vendor_nama ||
    !form.value.rek_bank ||
    !form.value.nominal ||
    !form.value.tanggal_pembayaran ||
    !form.value.keterangan
  ) {
    $q.notify({
      type: 'warning',
      position: 'top',
      icon: 'edit_note',
      message: 'Data belum lengkap!',
      caption: 'Harap lengkapi Nama Penerima, Bank/Cash, Nominal, Tanggal, dan Keterangan.',
      timeout: 3500,
    })
    return
  }

  submitting.value = true
  $q.loading.show({ message: 'Menyimpan pengeluaran manual...' })

  try {
    const noRequest = generateNoRequestManual()
    const payload = {
      no_request: noRequest,
      tipe_pengajuan: 'Manual',
      tagihan_id: null,
      tagihan_nomor_invoice: '',
      proyek_id: form.value.proyek_id || null,
      proyek_nama: form.value.proyek_nama || '',
      selected_spk: form.value.selected_spk || [],
      spk_boq_selection: form.value.spk_boq_selection || {},
      vendor_nama: form.value.vendor_nama,
      rek_bank: form.value.rek_bank,
      rek_nomor: form.value.rek_nomor || '-',
      rek_nama: form.value.rek_nama || '-',
      nominal: form.value.nominal,
      nominal_eksekusi: form.value.nominal,
      tanggal_pengajuan: form.value.tanggal_pembayaran,
      tanggal_dibutuhkan: form.value.tanggal_pembayaran,
      keterangan: form.value.keterangan,
      lampiran: [],
      status: 'Cair',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      approvedAt: serverTimestamp(),
      realizedAt: serverTimestamp(),
      approver_read: true,
      creator_read: true,
      realizer_read: true,
      realized_approved_read: true,
      approvedBy: authStore.user?.nama || 'System',
      pembuat_id: authStore.user?.uid || '',
      pembuat_email: authStore.user?.email || '',
      pembuat_nama: authStore.user?.nama || 'User',
    }

    await addDoc(collection(db, 'finance_pengajuan_pembayaran'), payload)

    $q.notify({
      type: 'positive',
      position: 'top',
      icon: 'check_circle',
      message: 'Pengeluaran manual berhasil disimpan!',
      timeout: 3500,
    })
    showAddDialog.value = false
  } catch (error) {
    console.error('Error simpanManualExpense:', error)
    $q.notify({
      type: 'negative',
      position: 'top',
      icon: 'error',
      message: 'Gagal menyimpan pengeluaran manual.',
      timeout: 4000,
    })
  } finally {
    submitting.value = false
    $q.loading.hide()
  }
}

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

// eslint-disable-next-line no-unused-vars
const metodeOptions = [
  { label: 'Semua Metode', value: 'ALL' },
  { label: 'Tagihan Supplier', value: 'Tagihan Supplier' },
  { label: 'Manual', value: 'Manual' },
  { label: 'Transfer Bank', value: 'Transfer Bank' },
  { label: 'Tunai / Cash', value: 'Tunai / Cash' },
]

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

const fetchData = async () => {
  loading.value = true
  try {
    const confSnap = await getDoc(doc(db, 'config', 'perusahaan'))
    if (confSnap.exists()) compConfig.value = confSnap.data()
  } catch (e) {
    console.warn('Config perusahaan tidak ditemukan:', e)
  }

  try {
    const snapProj = await getDocs(collection(db, 'proyek'))
    allProyek.value = snapProj.docs.map((d) => ({ id: d.id, nama: d.data().nama, ...d.data() }))
  } catch (error) {
    console.error('Error fetching proyek:', error)
  }

  if (unsubSpk) unsubSpk()
  unsubSpk = onSnapshot(collection(db, 'spk_customer'), (snap) => {
    allSpk.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

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

const approvedExpenses = computed(() => expenses.value)
const cairExpenses = computed(() => expenses.value.filter((r) => r.status === 'Cair'))
const outstandingExpenses = computed(() => expenses.value.filter((r) => r.status === 'Approved'))
const totalDisetujui = computed(() =>
  approvedExpenses.value.reduce((s, r) => s + (r.nominal || 0), 0),
)
const totalTerealisasi = computed(() =>
  cairExpenses.value.reduce((s, r) => s + (r.nominal_eksekusi || r.nominal || 0), 0),
)
const totalOutstanding = computed(() =>
  outstandingExpenses.value.reduce((s, r) => s + (r.nominal || 0), 0),
)
const realisasiPct = computed(() => {
  if (!totalDisetujui.value) return 0
  return Math.round((totalTerealisasi.value / totalDisetujui.value) * 100)
})
const outstandingPct = computed(() => {
  if (!totalDisetujui.value) return 0
  return Math.round((totalOutstanding.value / totalDisetujui.value) * 100)
})
const totalPengeluaran = computed(() => totalTerealisasi.value)
const currentMonthName = computed(() =>
  new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
)

const pengeluaranBulanIni = computed(() => {
  const prefix = new Date().toISOString().slice(0, 7)
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

const rataRataPengeluaran = computed(() => {
  if (!cairExpenses.value.length) return 0
  return Math.round(totalTerealisasi.value / cairExpenses.value.length)
})

const distribusiDivisi = computed(() => {
  if (!approvedExpenses.value.length) return []
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

const filteredExpenses = computed(() => {
  let res = expenses.value
  if (statusRealisasiFilter.value !== 'ALL')
    res = res.filter((r) => r.status === statusRealisasiFilter.value)
  if (metodeFilter.value !== 'ALL')
    res = res.filter((r) => (r.tipe_pengajuan || r.metode_bayar || '').includes(metodeFilter.value))
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
      window.open(URL.createObjectURL(new Blob([u8arr], { type: mime })), '_blank')
      // eslint-disable-next-line no-unused-vars
    } catch (_err) {
      $q.notify({ type: 'negative', message: 'Gagal membuka dokumen.', position: 'top-right' })
    }
  } else {
    window.open(url, '_blank')
  }
}

const formatDateIndo = (d) => {
  if (!d) return '-'
  const date = d?.toDate ? d.toDate() : new Date(d)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatCompact = (num) => {
  if (!num) return '0'
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + ' M'
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + ' Jt'
  return num.toLocaleString('id-ID')
}

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

const generateNomorBKK = (row) => {
  if (!row) return '-'
  let date
  if (row.approvedAt?.toDate) date = row.approvedAt.toDate()
  else if (row.approvedAt) date = new Date(row.approvedAt)
  else if (row.createdAt?.toDate) date = row.createdAt.toDate()
  else date = new Date()
  const tahun = date.getFullYear()
  const bulan = String(date.getMonth() + 1).padStart(2, '0')
  const idSuffix = (row.id || '0000').slice(-4).toUpperCase()
  return `BKK/${tahun}/${bulan}/${idSuffix}`
}

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
  const ratusan = (n) => {
    if (n < 20) return satuan[n]
    if (n < 100) {
      const p = Math.floor(n / 10)
      const s = n % 10
      return (p === 1 ? 'Sepuluh' : satuan[p] + ' Puluh') + (s ? ' ' + satuan[s] : '')
    }
    const r = Math.floor(n / 100)
    const s = n % 100
    return (r === 1 ? 'Seratus' : satuan[r] + ' Ratus') + (s ? ' ' + ratusan(s) : '')
  }
  if (!angka || angka === 0) return 'Nol'
  angka = Math.round(angka)
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
    const r = Math.floor(angka / 1_000)
    hasil += (r === 1 ? 'Seribu' : ratusan(r) + ' Ribu') + ' '
    angka %= 1_000
  }
  if (angka > 0) hasil += ratusan(angka)
  return (negatif ? 'Minus ' : '') + hasil.trim()
}

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

const exportTableExcel = () => {
  try {
    const thStyle =
      'background-color: #00695c; color: #ffffff; font-weight: bold; border: 1px solid #dddddd; padding: 10px;'
    const tdStyle = 'border: 1px solid #dddddd; padding: 8px; vertical-align: top;'
    const tdNumStyle = tdStyle + ' text-align: right;'
    const tdCenterStyle = tdStyle + ' text-align: center;'
    let html =
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body>'
    html +=
      '<h2 style="color:#00695c;font-family:sans-serif">Laporan Monitoring Pengeluaran Kas</h2>'
    html +=
      '<p style="font-family:sans-serif">Diekspor pada: ' +
      new Date().toLocaleString('id-ID') +
      '</p><br>'
    html += '<table style="border-collapse:collapse;width:100%;font-family:sans-serif"><thead><tr>'
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
      html += `<tr><td style="${tdCenterStyle}">${i + 1}</td><td style="${tdStyle}">${generateNomorBKK(r)}</td><td style="${tdStyle}">${r.no_request || '-'}</td><td style="${tdStyle}">${r.vendor_nama || r.supplier_nama || '-'}</td><td style="${tdCenterStyle}">${r.rek_bank || '-'}</td><td style="${tdStyle} mso-number-format:'\\@';">${r.rek_nomor || '-'}</td><td style="${tdCenterStyle}">${r.tipe_pengajuan || r.metode_bayar || '-'}</td><td style="${tdStyle}">${(r.keterangan || r.keperluan || '-').replace(/\n/g, '<br>')}</td><td style="${tdCenterStyle}">${formatDateIndo(r.approvedAt || r.createdAt)}</td><td style="${tdNumStyle}">${r.nominal || r.nominal_pengajuan || 0}</td><td style="${tdCenterStyle}">${r.status === 'Cair' ? 'SUDAH CAIR' : 'BELUM CAIR'}</td></tr>`
    })
    html += `<tr><td colspan="9" style="${tdStyle} text-align:right;font-weight:bold;background:#eceff1">GRAND TOTAL</td><td style="${tdNumStyle} font-weight:bold;background:#00695c;color:white">${total.toLocaleString('id-ID')}</td><td style="${tdStyle}"></td></tr>`
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

onMounted(() => {
  fetchData()
})
onUnmounted(() => {
  if (unsubExpenses) unsubExpenses()
  if (unsubSpk) unsubSpk()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

@media (max-width: 599px) {
  .btn-pengeluaran-manual {
    width: 100% !important;
    display: block;
  }
}

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
.border-teal-thin {
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

/* ─── KPI CARDS UTAMA ────────────────────────────────────── */
.kpi-card {
  border: none !important;
}

/* Card 1: Total Disetujui — brand */
.kpi-brand {
  background: linear-gradient(135deg, #36ada3 0%, #1e6e69 100%) !important;
}
/* Card 2: Total Terealisasi — hijau */
.kpi-green {
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%) !important;
  box-shadow: 0 8px 24px rgba(46, 125, 50, 0.4) !important;
}
/* Card 3: Outstanding — oranye */
.kpi-orange {
  background: linear-gradient(135deg, #fb8c00 0%, #e65100 100%) !important;
  box-shadow: 0 8px 24px rgba(230, 81, 0, 0.4) !important;
}

.kpi-label {
  font-size: 10px;
  letter-spacing: 0.12em;
  opacity: 0.9;
}
.kpi-icon-wrap {
  background: rgba(255, 255, 255, 0.15) !important;
  border-radius: 12px !important;
  min-width: 56px;
  text-align: center;
}

/* ─── KPI CARDS SEKUNDER ─────────────────────────────────── */
/* Card 1: Total Pengeluaran — merah */
.kpi-sec-red {
  background: linear-gradient(135deg, #e53935 0%, #b71c1c 100%) !important;
  box-shadow: 0 8px 24px rgba(183, 28, 28, 0.38) !important;
}
/* Card 2: Bulan Ini — amber/kuning */
.kpi-sec-amber {
  background: linear-gradient(135deg, #ffb300 0%, #e65100 100%) !important;
  box-shadow: 0 8px 24px rgba(230, 81, 0, 0.35) !important;
}
/* Card 3: Volume Transaksi — teal gelap */
.kpi-sec-teal {
  background: linear-gradient(135deg, #00acc1 0%, #006064 100%) !important;
  box-shadow: 0 8px 24px rgba(0, 96, 100, 0.38) !important;
}
/* Card 4: Rata-rata — slate/biru abu */
.kpi-sec-slate {
  background: linear-gradient(135deg, #546e7a 0%, #263238 100%) !important;
  box-shadow: 0 8px 24px rgba(38, 50, 56, 0.4) !important;
}

.kpi-sec-label {
  font-size: 10px;
  letter-spacing: 0.1em;
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.9);
}
.kpi-sec-icon-wrap {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  padding: 10px;
  min-width: 46px;
  text-align: center;
}

/* Mini progress bar */
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

/* ─── DISTRIBUSI CHART ───────────────────────────────────── */
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
  background-color: rgba(43, 87, 154, 0.03) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(30, 110, 105, 0.18) !important;
}
.hover-brand-btn:hover {
  background-color: #e0f7f6 !important;
  color: #1e6e69 !important;
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

.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.p-1 {
  padding: 4px;
}

/* ─── VOUCHER BKK ────────────────────────────────────────── */
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

/* ─── PDF EXPORT ─────────────────────────────────────────── */
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
