<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
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
            @click="router.back()"
            class="q-mr-md bg-white shadow-1 transition-all btn-hover"
          />
          <div>
            <div
              class="text-h4 text-weight-bolder text-indigo-10 leading-tight uppercase tracking-widest"
            >
              Riwayat Transaksi
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
                Log Mutasi Aset • Gudang:
                {{ warehouseId === 'UTAMA' ? 'Pusat (Utama)' : warehouseName || 'Lokasi Proyek' }}
              </span>
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Menampilkan seluruh rekam jejak material khusus untuk lokasi gudang ini secara
              real-time.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- =====================================================================================
         FILTER & SUMMARY CARD
         ===================================================================================== -->
    <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print border-subtle">
      <q-card-section class="q-py-md">
        <div class="row items-center q-col-gutter-md">
          <!-- Search Bar -->
          <div class="col-12 col-md-4">
            <q-input
              v-model="filter"
              outlined
              dense
              rounded
              placeholder="Cari Nama Barang, No. Ref, atau SPK..."
              bg-color="white"
              class="search-input shadow-inner-soft"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Type Filter Toggle -->
          <div class="col-12 col-md-auto">
            <q-btn-toggle
              v-model="typeFilter"
              flat
              rounded
              toggle-color="indigo-10"
              color="grey-7"
              class="bg-grey-1"
              :options="[
                { label: 'Semua', value: 'ALL' },
                { label: 'Masuk', value: 'MASUK' },
                { label: 'Keluar', value: 'KELUAR' },
                { label: 'Opname', value: 'OPNAME' },
              ]"
            />
          </div>

          <q-space />

          <!-- EXPORT DROPDOWN & BADGE RECORD -->
          <div class="col-12 col-md-auto row items-center justify-end q-gutter-sm">
            <q-btn-dropdown
              unelevated
              rounded
              color="indigo-10"
              icon="file_download"
              label="Export Laporan"
              class="shadow-1 font-bold q-px-md btn-hover"
            >
              <q-list style="min-width: 180px">
                <q-item clickable v-ripple @click="exportHistoryToPDF" class="q-py-md hover-bg">
                  <q-item-section avatar>
                    <q-avatar color="red-1" text-color="red-9" icon="picture_as_pdf" size="sm" />
                  </q-item-section>
                  <q-item-section class="text-weight-bold text-red-9">Export PDF</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-ripple @click="exportHistoryToExcel" class="q-py-md hover-bg">
                  <q-item-section avatar>
                    <q-avatar color="green-1" text-color="green-9" icon="table_view" size="sm" />
                  </q-item-section>
                  <q-item-section class="text-weight-bold text-green-9"
                    >Export Excel</q-item-section
                  >
                </q-item>
              </q-list>
            </q-btn-dropdown>

            <q-badge
              color="indigo-10"
              class="q-px-md q-py-xs text-weight-bold shadow-2 animate-fade"
            >
              {{ filteredRows.length }} RECORD LOKASI INI
            </q-badge>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- =====================================================================================
         MAIN TABLE SECTION (STRICT FILTER)
         ===================================================================================== -->
    <q-card
      flat
      bordered
      class="rounded-20 shadow-premium overflow-hidden bg-white no-print border-indigo-thin"
    >
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :filter="filter"
        binary-state-sort
        class="history-table"
        :pagination="{ rowsPerPage: 15 }"
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
            @click="openDetail(props.row)"
          >
            <q-td key="tipe" class="text-center">
              <q-chip
                :color="getTipeColor(props.row.tipe)"
                text-color="white"
                size="sm"
                class="text-weight-bold uppercase shadow-sm"
                :icon="getTipeIcon(props.row.tipe)"
              >
                {{ props.row.tipe }}
              </q-chip>
            </q-td>

            <q-td key="nama_barang">
              <div
                class="text-weight-black text-blue-grey-10 text-subtitle2 uppercase leading-none"
              >
                {{ props.row.nama_barang }}
              </div>
              <div class="text-caption text-grey-5 q-mt-xs font-mono uppercase">
                CODE: {{ props.row.kode_barang || 'MATERIAL' }}
              </div>
            </q-td>

            <q-td key="jumlah" class="text-center">
              <div class="text-weight-black text-h6" :class="getAmountColor(props.row.tipe)">
                {{ props.row.tipe === 'KELUAR' ? '-' : props.row.tipe === 'MASUK' ? '+' : ''
                }}{{ props.row.jumlah }}
              </div>
              <div class="text-caption text-grey-5 uppercase text-weight-bold">
                {{ props.row.satuan || 'UNIT' }}
              </div>
            </q-td>

            <q-td key="timestamp">
              <div class="text-weight-medium text-blue-grey-9">
                {{ formatDate(props.row.timestamp) }}
              </div>
              <div class="text-caption text-grey-5 italic font-11">
                Pukul {{ formatTime(props.row.timestamp) }}
              </div>
            </q-td>

            <q-td key="ref" class="text-indigo-9 text-weight-bold">
              {{ props.row.no_referensi || '-' }}
            </q-td>

            <q-td key="no_spk" class="text-primary text-weight-bolder">
              {{ props.row.no_spk || '-' }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- =====================================================================================
         DETAIL DIALOG (DENGAN RE-PRINT IDENTIK)
         ===================================================================================== -->
    <q-dialog
      v-model="showDetailDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      backdrop-filter="blur(8px)"
    >
      <q-card class="column no-wrap overflow-hidden bg-grey-2" v-if="selectedItem">
        <q-toolbar class="bg-indigo-10 text-white q-py-md shadow-4 shrink no-print">
          <q-icon name="assignment" size="sm" class="q-mr-sm" />
          <q-toolbar-title class="text-weight-bold uppercase letter-spacing-1">
            Detail Transaksi & Arsip Digital
          </q-toolbar-title>

          <!-- TOMBOL RE-PRINT IDENTIK -->
          <q-btn
            v-if="selectedItem.tipe === 'KELUAR'"
            color="red-9"
            icon="picture_as_pdf"
            label="RE-PRINT SURAT JALAN"
            unelevated
            rounded
            class="q-px-xl q-py-md text-weight-black shadow-10 q-mr-md animate-bounce-subtle"
            @click="exportDetailToPDF"
          />

          <q-btn icon="close" flat round dense v-close-popup />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-md-11 col-lg-10">
              <!-- STATUS HEADER -->
              <div class="row justify-between items-end q-mb-xl animate-fade">
                <div class="column">
                  <div
                    class="text-overline text-grey-6 uppercase tracking-widest font-black leading-none q-mb-sm"
                  >
                    Status Klasifikasi
                  </div>
                  <q-chip
                    :color="getTipeColor(selectedItem.tipe)"
                    text-color="white"
                    class="text-weight-black q-px-xl q-py-lg shadow-5"
                  >
                    <q-icon :name="getTipeIcon(selectedItem.tipe)" class="q-mr-md" />{{
                      selectedItem.tipe
                    }}
                    MATERIAL
                  </q-chip>
                </div>
                <div class="text-right">
                  <div
                    class="text-overline text-grey-6 uppercase tracking-widest font-black leading-none q-mb-xs"
                  >
                    Waktu Sinkronisasi
                  </div>
                  <div class="text-h4 text-weight-black text-blue-grey-10">
                    {{ formatDate(selectedItem.timestamp) }}
                  </div>
                  <div class="text-subtitle1 text-primary text-weight-bold">
                    Pukul {{ formatTime(selectedItem.timestamp) }} WIB
                  </div>
                </div>
              </div>

              <!-- LOGISTICS METADATA -->
              <q-card
                flat
                bordered
                class="rounded-20 bg-white shadow-premium border-indigo-thin overflow-hidden q-mb-xl"
              >
                <q-card-section
                  class="bg-indigo-1 q-pa-md text-weight-black text-indigo-10 uppercase tracking-widest flex items-center"
                >
                  <q-icon name="folder_shared" class="q-mr-sm" /> Rincian Administrasi
                </q-card-section>
                <q-card-section class="q-pa-lg">
                  <div class="row q-col-gutter-xl text-left">
                    <div class="col-12 col-sm-4">
                      <div class="text-overline text-grey-5 font-bold leading-none q-mb-xs">
                        No. Surat Jalan / Ref
                      </div>
                      <div class="text-h6 text-weight-black text-indigo-10">
                        {{ selectedItem.no_referensi || '-' }}
                      </div>
                    </div>
                    <div class="col-12 col-sm-4 border-left-gt-xs">
                      <div class="text-overline text-grey-5 font-bold leading-none q-mb-xs">
                        No. SPK Terkait
                      </div>
                      <div class="text-h6 text-weight-bold text-primary">
                        {{ selectedItem.no_spk || '-' }}
                      </div>
                    </div>
                    <div class="col-12 col-sm-4 border-left-gt-xs">
                      <div class="text-overline text-grey-5 font-bold leading-none q-mb-xs">
                        UP (Attention)
                      </div>
                      <div class="text-h6 text-weight-bold text-blue-grey-10 uppercase">
                        {{ selectedItem.penerima_up || '-' }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- TABLE ITEM -->
              <div
                class="text-h6 text-weight-black text-indigo-10 uppercase q-mb-md flex items-center letter-spacing-1"
              >
                <q-icon name="list_alt" class="q-mr-sm" color="indigo-10" />
                Rincian Material & Keterangan Item
              </div>
              <q-card
                flat
                bordered
                class="rounded-20 overflow-hidden shadow-sm bg-white border-subtle q-mb-md"
              >
                <q-markup-table flat separator="cell" class="perfectionist-table">
                  <thead>
                    <tr class="bg-blue-grey-10 text-white text-bold uppercase font-11">
                      <th width="60">NO</th>
                      <th class="text-left" width="180">KODE BARANG</th>
                      <th class="text-left">NAMA MATERIAL / ITEM</th>
                      <th width="100">QTY</th>
                      <th width="100">SATUAN</th>
                      <th class="text-left">KETERANGAN (NOTE ITEM)</th>
                    </tr>
                  </thead>
                  <tbody class="text-blue-grey-10">
                    <tr v-for="(it, i) in groupedItems" :key="i">
                      <td class="text-center font-black">{{ i + 1 }}</td>
                      <td class="text-weight-bold text-grey-7 font-mono uppercase">
                        {{ it.kode_barang || 'MATERIAL' }}
                      </td>
                      <td class="text-weight-black uppercase text-subtitle2">
                        {{ it.nama_barang }}
                      </td>
                      <td
                        class="text-center text-weight-black text-h5"
                        :class="getAmountColor(it.tipe)"
                      >
                        {{ it.jumlah }}
                      </td>
                      <td class="text-center text-weight-bold uppercase text-caption">
                        {{ it.satuan || 'UNIT' }}
                      </td>
                      <td class="italic text-weight-bolder text-primary bg-blue-grey-1">
                        {{ it.keterangan || '-' }}
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </q-card>

              <!-- CATATAN UMUM -->
              <div class="q-mb-xl">
                <q-card flat bordered class="rounded-20 bg-white shadow-sm border-subtle">
                  <q-card-section
                    class="bg-grey-1 q-pa-sm text-weight-bold text-blue-grey-8 uppercase text-caption q-px-md tracking-widest flex items-center"
                  >
                    <q-icon name="comment" class="q-mr-xs" /> Catatan Umum / Instruksi Transaksi
                  </q-card-section>
                  <q-card-section class="q-pa-lg text-left">
                    <div class="text-body1 text-blue-grey-9 italic leading-relaxed">
                      "{{
                        selectedItem.catatan_umum ||
                        'Tidak ada catatan tambahan untuk pengiriman ini.'
                      }}"
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- DOCUMENTATION GALLERY -->
              <div class="q-mb-xl" v-if="selectedItem.dokumentasi_urls?.length">
                <div
                  class="text-h6 text-indigo-10 text-weight-black uppercase q-mb-md flex items-center letter-spacing-1"
                >
                  <q-icon name="camera_alt" class="q-mr-sm" size="md" /> Dokumentasi Lampiran
                  Digital
                </div>
                <div class="row q-col-gutter-lg">
                  <div
                    class="col-12 col-sm-6 col-md-4"
                    v-for="(doc, uIdx) in selectedItem.dokumentasi_urls"
                    :key="uIdx"
                  >
                    <q-card
                      flat
                      bordered
                      class="rounded-20 bg-white shadow-premium hover-shadow transition-all overflow-hidden border-subtle"
                    >
                      <q-card-section class="q-pa-sm">
                        <div
                          v-if="doc.mimeType?.includes('image')"
                          class="q-mb-sm overflow-hidden rounded-borders"
                        >
                          <q-img
                            :src="doc.url"
                            class="cursor-pointer"
                            style="height: 200px"
                            fit="cover"
                            @click="openLink(doc.url)"
                          />
                        </div>
                        <div
                          v-else
                          class="flex flex-center q-pa-lg bg-grey-2 rounded-borders q-mb-sm"
                          style="height: 200px"
                        >
                          <q-icon name="description" size="80px" color="blue-grey-4" />
                        </div>
                        <div
                          class="text-center text-weight-bold text-blue-grey-9 q-mt-sm ellipsis q-px-md"
                        >
                          {{ doc.label || 'Lampiran Transaksi' }}
                        </div>
                        <q-btn
                          unelevated
                          color="indigo-10"
                          class="full-width q-mt-md rounded-borders text-weight-black shadow-2"
                          icon="open_in_new"
                          label="LIHAT BERKAS"
                          @click="openLink(doc.url)"
                        />
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>

              <div class="q-py-xl"></div>
            </div>
          </div>
        </q-card-section>

        <q-separator />
        <div
          class="bg-white q-pa-md text-center text-grey-5 text-caption uppercase letter-spacing-1 font-black"
        >
          Agra ERP Logistics • Internal Transaction Audit Log • Secured Document
        </div>
      </q-card>
    </q-dialog>

    <!-- =============================================================================
         HIDDEN PDF TEMPLATE UNTUK EXPORT LIST LAPORAN BERWARNA
         ============================================================================= -->
    <div style="display: none">
      <div id="history-print-area" class="report-paper">
        <div
          class="report-header"
          style="
            background: linear-gradient(90deg, #1a237e 0%, #3949ab 100%);
            padding: 20px;
            border-radius: 12px;
            color: white;
            display: flex;
            align-items: center;
            margin-bottom: 25px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          "
        >
          <div
            class="report-icon"
            style="
              background: rgba(255, 255, 255, 0.2);
              padding: 12px;
              border-radius: 8px;
              margin-right: 15px;
            "
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <path d="M12 18v-6"></path>
              <path d="M9 15l3 3 3-3"></path>
            </svg>
          </div>
          <div>
            <h1
              class="report-title"
              style="
                margin: 0;
                font-size: 24px;
                font-weight: 900;
                letter-spacing: 1px;
                text-transform: uppercase;
              "
            >
              LAPORAN RIWAYAT TRANSAKSI
            </h1>
            <div
              class="report-subtitle"
              style="font-size: 13px; margin-top: 6px; opacity: 0.9; font-weight: bold"
            >
              Gudang:
              {{ warehouseId === 'UTAMA' ? 'Pusat (Utama)' : warehouseName || 'Semua Lokasi' }} |
              Filter: {{ typeFilter }} | Diekspor pada: {{ new Date().toLocaleString('id-ID') }}
            </div>
          </div>
        </div>

        <table
          class="report-table"
          style="
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-top: 15px;
            border: 1px solid #1a237e;
          "
        >
          <thead style="display: table-header-group">
            <tr>
              <th
                style="
                  background-color: #1a237e;
                  color: white;
                  padding: 12px 8px;
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
                  padding: 12px 8px;
                  border: 1px solid #1a237e;
                  text-align: center;
                  width: 100px;
                  font-weight: 900;
                "
              >
                TRANSAKSI
              </th>
              <th
                style="
                  background-color: #1a237e;
                  color: white;
                  padding: 12px 8px;
                  border: 1px solid #1a237e;
                  text-align: left;
                  font-weight: 900;
                "
              >
                IDENTITAS MATERIAL
              </th>
              <th
                style="
                  background-color: #1a237e;
                  color: white;
                  padding: 12px 8px;
                  border: 1px solid #1a237e;
                  text-align: center;
                  width: 80px;
                  font-weight: 900;
                "
              >
                VOL
              </th>
              <th
                style="
                  background-color: #1a237e;
                  color: white;
                  padding: 12px 8px;
                  border: 1px solid #1a237e;
                  text-align: left;
                  width: 120px;
                  font-weight: 900;
                "
              >
                WAKTU
              </th>
              <th
                style="
                  background-color: #1a237e;
                  color: white;
                  padding: 12px 8px;
                  border: 1px solid #1a237e;
                  text-align: left;
                  width: 120px;
                  font-weight: 900;
                "
              >
                REFERENSI
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- FIX ROW POTONGAN: Tambahkan style khusus break-inside avoid di setiap TR -->
            <tr
              v-for="(row, idx) in filteredRows"
              :key="idx"
              :style="
                (idx % 2 !== 0 ? 'background-color: #f8f9fa;' : '') +
                ' page-break-inside: avoid; break-inside: avoid;'
              "
              class="pdf-row"
            >
              <td
                style="
                  padding: 10px 8px;
                  border: 1px solid #e0e0e0;
                  text-align: center;
                  font-weight: bold;
                "
              >
                {{ idx + 1 }}
              </td>
              <td
                style="
                  padding: 10px 8px;
                  border: 1px solid #e0e0e0;
                  text-align: center;
                  font-weight: 900;
                  text-transform: uppercase;
                "
                :style="
                  row.tipe === 'MASUK'
                    ? 'color: #2e7d32;'
                    : row.tipe === 'KELUAR'
                      ? 'color: #e65100;'
                      : 'color: #1a237e;'
                "
              >
                {{ row.tipe }}
              </td>
              <td
                style="
                  padding: 10px 8px;
                  border: 1px solid #e0e0e0;
                  font-weight: 900;
                  text-transform: uppercase;
                  color: #222;
                "
              >
                {{ row.nama_barang }}
                <div
                  style="
                    font-size: 10px;
                    color: #666;
                    font-family: monospace;
                    font-weight: normal;
                    margin-top: 2px;
                  "
                >
                  CODE: {{ row.kode_barang || 'MATERIAL' }}
                </div>
              </td>
              <td
                style="
                  padding: 10px 8px;
                  border: 1px solid #e0e0e0;
                  text-align: center;
                  font-weight: 900;
                  font-size: 14px;
                "
                :style="
                  row.tipe === 'MASUK'
                    ? 'color: #2e7d32;'
                    : row.tipe === 'KELUAR'
                      ? 'color: #e65100;'
                      : 'color: #1a237e;'
                "
              >
                {{ row.tipe === 'KELUAR' ? '-' : row.tipe === 'MASUK' ? '+' : '' }}{{ row.jumlah }}
                <div
                  style="
                    font-size: 9px;
                    color: #666;
                    font-weight: bold;
                    margin-top: 2px;
                    text-transform: uppercase;
                  "
                >
                  {{ row.satuan || 'UNIT' }}
                </div>
              </td>
              <td
                style="padding: 10px 8px; border: 1px solid #e0e0e0; font-weight: bold; color: #444"
              >
                {{ formatDate(row.timestamp) }}
                <div style="font-size: 10px; color: #888; font-weight: normal; margin-top: 2px">
                  {{ formatTime(row.timestamp) }} WIB
                </div>
              </td>
              <td
                style="
                  padding: 10px 8px;
                  border: 1px solid #e0e0e0;
                  font-weight: bold;
                  color: #1a237e;
                "
              >
                {{ row.no_referensi || '-' }}
                <div style="font-size: 10px; color: #666; font-weight: normal; margin-top: 2px">
                  SPK: {{ row.no_spk || '-' }}
                </div>
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
                Tidak ada data riwayat transaksi.
              </td>
            </tr>
          </tbody>
        </table>

        <div
          style="
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #888;
            font-style: italic;
          "
        >
          Dokumen ini di-generate secara otomatis oleh Sistem AGRA ERP.
        </div>
      </div>
    </div>

    <!-- =============================================================================
         HIDDEN PDF TEMPLATE (RE-PRINT SURAT JALAN / BARANG KELUAR)
         ============================================================================= -->
    <div style="position: absolute; left: -9999px; top: -9999px">
      <div id="sj-reprint-target" class="perfectionist-paper">
        <!-- Kop Surat (Ditarik dari Master Perusahaan) -->
        <div class="row no-wrap items-center q-mb-md" v-if="selectedItem">
          <div class="col-auto">
            <img src="icons/logo-agra.png" class="final-kop-img q-mr-md" />
          </div>
          <div class="col text-left">
            <div class="text-pt-pro leading-none">
              {{ compConfig.nama_perusahaan || 'PT AGRA ABHINAYA PERKASA' }}
            </div>
            <div class="text-pt-tagline italic text-blue-grey-9 text-weight-bold">
              {{ compConfig.slogan_perusahaan || 'General Construction & General Supplier' }}
            </div>
          </div>
        </div>

        <div class="pro-divider-thick q-mb-md"></div>

        <!-- Judul & Nomor SJ -->
        <div class="row justify-end q-mb-lg" v-if="selectedItem">
          <div class="col-auto text-right">
            <div
              class="text-h3 text-weight-black text-indigo-10 uppercase tracking-widest leading-none"
            >
              SURAT JALAN
            </div>
            <div class="text-subtitle1 text-weight-bold q-mt-xs">
              No. Surat Jalan :
              <span class="text-primary font-mono">{{ selectedItem.no_referensi }}</span>
            </div>
          </div>
        </div>

        <!-- Meta Dokumen (SINKRON DENGAN DATA INPUT) -->
        <div
          class="row q-col-gutter-xl q-mb-lg text-left"
          style="font-size: 13.5px"
          v-if="selectedItem"
        >
          <div class="col-6">
            <div class="text-weight-black uppercase q-mb-xs text-grey-7">KEPADA YTH :</div>
            <div class="text-h6 text-weight-black text-indigo-10 q-mb-xs uppercase">
              {{ selectedItem.tujuan_nama || 'PIHAK PENERIMA' }}
            </div>
            <div class="row no-wrap q-mt-xs">
              <div class="col-auto q-mr-sm font-bold text-grey-8">Lokasi :</div>
              <div class="col underline-dotted text-blue-grey-10 text-weight-bold">
                {{ selectedItem.tujuan_alamat || warehouseName || 'LOKASI PROYEK' }}
              </div>
            </div>
            <div class="row no-wrap q-mt-sm">
              <div class="col-auto q-mr-sm font-bold text-grey-8">Up :</div>
              <div class="col underline-dotted text-blue-grey-10 text-weight-bold">
                {{ selectedItem.penerima_up || '...........................................' }}
              </div>
            </div>
          </div>
          <div class="col-6 text-right">
            <div class="row justify-end q-mb-xs">
              <div class="col-5 text-weight-black italic text-grey-6 text-left font-pro">
                No Reff (SPK)
              </div>
              <div class="col-7 text-weight-bold text-left">
                : {{ selectedItem.no_spk || 'INTERNAL_LOGISTICS' }}
              </div>
            </div>
            <div class="row justify-end q-mb-xs">
              <div class="col-5 text-weight-black italic text-grey-6 text-left font-pro">
                Tanggal
              </div>
              <div class="col-7 text-left">: {{ formatDate(selectedItem.timestamp) }}</div>
            </div>
            <div class="row justify-end q-mb-xs">
              <div class="col-5 text-weight-black italic text-grey-6 text-left font-pro">
                Ekspedisi
              </div>
              <div class="col-7 text-left">: Driver Internal</div>
            </div>
          </div>
        </div>

        <!-- Table Rincian (IDENTIK) -->
        <table class="perfectionist-table full-width" v-if="selectedItem">
          <thead>
            <tr>
              <th width="45">NO</th>
              <th class="text-left">ITEM DESCRIPTION / MATERIAL NAME</th>
              <th width="80">QTY</th>
              <th width="90">SATUAN</th>
              <th class="text-left">KETERANGAN</th>
            </tr>
          </thead>
          <tbody>
            <!-- FIX ROW POTONGAN: Tambahkan style khusus break-inside avoid -->
            <tr
              v-for="(it, i) in groupedItems"
              :key="i"
              style="page-break-inside: avoid; break-inside: avoid"
            >
              <td class="text-center font-bold">{{ i + 1 }}</td>
              <td class="text-weight-black uppercase text-left">{{ it.nama_barang }}</td>
              <td class="text-center text-weight-black">{{ it.jumlah }}</td>
              <td class="text-center uppercase font-bold">{{ it.satuan }}</td>
              <!-- Keterangan Item (Seperti 'uhuy', 'segar', dll) -->
              <td class="text-left text-blue-grey-8 italic">{{ it.keterangan || '-' }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-grey-1">
              <td colspan="2" class="text-right text-weight-black uppercase">
                TOTAL ITEM TERKIRIM
              </td>
              <td class="text-center text-weight-black text-h6">{{ groupedItems.length }}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>

        <!-- Catatan Bawah Surat (IDENTIK) -->
        <div class="q-mt-md q-mb-xl text-left" v-if="selectedItem">
          <div class="text-weight-black italic q-mb-xs">Instruksi Khusus :</div>
          <div
            class="q-pa-md border-black-solid"
            style="min-height: 80px; font-size: 12.5px; white-space: pre-wrap; line-height: 1.6"
          >
            {{
              selectedItem.catatan_umum ||
              'Barang dikirim dalam kondisi baik, tersegel, dan sesuai rincian di atas.'
            }}
          </div>
        </div>

        <!-- Signature Area (IDENTIK) -->
        <div
          class="row justify-between text-center q-mt-xl"
          style="font-size: 14px"
          v-if="selectedItem"
        >
          <div class="col-3">
            <div class="text-weight-black q-mb-xl">Petugas Gudang</div>
            <div style="height: 60px"></div>
            <div class="text-weight-black underline text-indigo-10 uppercase">
              Petugas Terotorisasi
            </div>
            <div class="text-caption text-bold text-grey-8 uppercase">
              ( {{ warehouseName || selectedItem.id_gudang }} )
            </div>
          </div>
          <div class="col-3">
            <div class="text-weight-black q-mb-xl">Pihak Pengirim</div>
            <div style="height: 60px"></div>
            <div class="text-weight-black">(..............................)</div>
            <div class="text-caption text-bold text-grey-8 uppercase">Driver / Kurir</div>
          </div>
          <div class="col-3">
            <div class="text-weight-black q-mb-xl">Pihak Penerima</div>
            <div style="height: 60px"></div>
            <div class="text-weight-black">(..............................)</div>
            <div class="text-caption text-bold text-grey-8 uppercase">Nama Jelas & Cap</div>
          </div>
        </div>

        <div class="q-mt-xl text-center text-grey-5 italic" style="font-size: 9.5px">
          Secured Digital Archive • Reprinded via Agra ERP v4.1.2 • Original Hash Verified
        </div>
      </div>
    </div>

    <div class="q-py-xl no-print"></div>
  </q-page>
</template>

<script setup>
/**
 * =====================================================================================
 * RIWAYAT TRANSAKSI - SAKLEK GUDANG & IDENTIK RE-PRINT MASTERPIECE
 * =====================================================================================
 */
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  getDocs,
  getDoc,
  doc,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import html2pdf from 'html2pdf.js'

// --- INITIALIZATION ---
const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const riwayatList = ref([])
const filter = ref('')
const loading = ref(true)
const typeFilter = ref('ALL')

// State Detail & Grouping
const showDetailDialog = ref(false)
const selectedItem = ref(null)
const groupedItems = ref([])
const compConfig = ref({ nama_perusahaan: '', slogan_perusahaan: '' })
const warehouseName = ref('')

// Tangkap ID Gudang secara reaktif (Obat Anti-Nyampur)
const warehouseId = computed(() => route.query.warehouseId || null)

const columns = [
  { name: 'tipe', label: 'TRANSAKSI', field: 'tipe', align: 'center', sortable: true },
  {
    name: 'nama_barang',
    label: 'IDENTITAS MATERIAL',
    field: 'nama_barang',
    align: 'left',
    sortable: true,
  },
  { name: 'jumlah', label: 'VOL', field: 'jumlah', align: 'center', sortable: true },
  { name: 'timestamp', label: 'WAKTU', field: 'timestamp', align: 'left', sortable: true },
  { name: 'ref', label: 'DOK. REFERENSI', field: 'no_referensi', align: 'left', sortable: true },
  { name: 'no_spk', label: 'NO. SPK', field: 'no_spk', align: 'left', sortable: true },
]

// Computed Logic Filter Tipe (Memory Based for Strict Separation)
const filteredRows = computed(() => {
  let data = riwayatList.value
  if (typeFilter.value !== 'ALL') data = data.filter((it) => it.tipe === typeFilter.value)
  return data
})

const getTipeColor = (t) => (t === 'MASUK' ? 'positive' : t === 'KELUAR' ? 'orange-8' : 'indigo-8')
const getTipeIcon = (t) => (t === 'MASUK' ? 'download' : t === 'KELUAR' ? 'upload' : 'analytics')
const getAmountColor = (t) =>
  t === 'MASUK' ? 'text-green-9' : t === 'KELUAR' ? 'text-orange-9' : 'text-indigo-9'

const formatDate = (ts) => {
  if (!ts) return '-'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// --- LOGIKA EXPORT PDF & EXCEL UNTUK LIST TABLE BERWARNA ---
const exportHistoryToPDF = () => {
  if (filteredRows.value.length === 0) {
    return $q.notify({ type: 'warning', message: 'Tabel kosong, tidak ada data untuk diekspor.' })
  }

  $q.loading.show({ message: 'Membuat Laporan PDF Berwarna...' })
  setTimeout(() => {
    const element = document.getElementById('history-print-area')
    const gdgName =
      warehouseId.value === 'UTAMA' ? 'Utama' : warehouseName.value.replace(/\s+/g, '_') || 'All'

    const opt = {
      margin: [15, 10, 15, 10], // Margin disesuaikan
      filename: `Riwayat_Transaksi_${gdgName}_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2.5, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      // FIX POTONGAN: Tambahkan target spesifik untuk dicegah terpotong
      pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.pdf-row', 'thead'] },
    }

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        $q.loading.hide()
        $q.notify({ type: 'positive', message: 'PDF Laporan Berhasil Diunduh!', position: 'top' })
      })
      .catch((err) => {
        console.error(err)
        $q.loading.hide()
      })
  }, 800)
}

const exportHistoryToExcel = () => {
  if (filteredRows.value.length === 0) {
    return $q.notify({ type: 'warning', message: 'Tabel kosong, tidak ada data untuk diekspor.' })
  }

  const exportDate = new Date().toLocaleString('id-ID')
  const gdgName =
    warehouseId.value === 'UTAMA' ? 'Gudang Utama' : warehouseName.value || 'Semua Lokasi'

  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
    <meta charset="utf-8" />
    <style>
      .table-bordered { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 13px; margin-top: 15px; border: 1px solid #1a237e; }
      .table-bordered th, .table-bordered td { border: 1px solid #dddddd; padding: 12px; }
      .header-row th { background-color: #1a237e; color: #ffffff; font-weight: bold; text-align: center; text-transform: uppercase; font-size: 12px; border: 1px solid #1a237e; }
      .title { font-size: 22px; font-weight: bold; color: #1a237e; font-family: sans-serif; text-align: center; letter-spacing: 1px; }
      .subtitle { font-size: 12px; color: #666666; font-family: sans-serif; text-align: center; margin-bottom: 25px; font-weight: bold; }
    </style>
    </head>
    <body>
      <div class="title">LAPORAN RIWAYAT TRANSAKSI MATERIAL</div>
      <div class="subtitle">Lokasi: ${gdgName} | Filter: ${typeFilter.value} | Diekspor pada: ${exportDate}</div>
      <br/>
      <table class="table-bordered">
        <tr class="header-row">
          <th width="50">NO</th>
          <th width="120">TRANSAKSI</th>
          <th width="150">KODE BARANG</th>
          <th width="300" style="text-align: left;">NAMA MATERIAL</th>
          <th width="100">VOL (QTY)</th>
          <th width="100">SATUAN</th>
          <th width="180">WAKTU TRANSAKSI</th>
          <th width="200">NO REFERENSI</th>
          <th width="200">NO SPK</th>
        </tr>
  `

  filteredRows.value.forEach((row, idx) => {
    const bgRow = idx % 2 === 0 ? '#ffffff' : '#f8f9fa'
    const tipeColor =
      row.tipe === 'MASUK' ? '#2e7d32' : row.tipe === 'KELUAR' ? '#e65100' : '#1a237e'
    const prefix = row.tipe === 'MASUK' ? '+' : row.tipe === 'KELUAR' ? '-' : ''

    html += `
      <tr style="background-color: ${bgRow};">
        <td align="center" style="font-weight: bold;">${idx + 1}</td>
        <td align="center" style="font-weight: 900; color: ${tipeColor}; text-transform: uppercase;">${row.tipe}</td>
        <td align="center" style="font-family: monospace; font-weight: bold; color: #555;">${row.kode_barang || 'MATERIAL'}</td>
        <td align="left" style="font-weight: 900; text-transform: uppercase; color: #222;">${row.nama_barang}</td>
        <td align="center" style="font-weight: 900; color: ${tipeColor}; font-size: 15px;">${prefix}${row.jumlah}</td>
        <td align="center" style="text-transform: uppercase; font-weight: bold; color: #444;">${row.satuan || 'UNIT'}</td>
        <td align="center" style="font-weight: bold; color: #444;">${formatDate(row.timestamp)} ${formatTime(row.timestamp)}</td>
        <td align="center" style="font-weight: bold; color: #1a237e;">${row.no_referensi || '-'}</td>
        <td align="center" style="font-weight: bold; color: #1a237e;">${row.no_spk || '-'}</td>
      </tr>
    `
  })

  html += `
      </table>
    </body>
    </html>
  `

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Riwayat_Transaksi_${gdgName.replace(/\s+/g, '_')}_${Date.now()}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// --- LOGIKA OPEN DETAIL & FETCH SEMUA ITEM DALAM SATU SJ ---
const openDetail = async (row) => {
  selectedItem.value = row
  groupedItems.value = [row]

  if (row.no_referensi && row.no_referensi !== '-') {
    $q.loading.show({ message: 'Mensinkronisasi rincian surat jalan...' })
    try {
      // SAKLEK! Cari seluruh rincian barang yang NO REF-nya sama di GUDANG yang sama
      const qGroup = query(
        collection(db, 'aktivitas'),
        where('no_referensi', '==', row.no_referensi),
        where('id_gudang', '==', row.id_gudang),
      )
      const snap = await getDocs(qGroup)
      if (!snap.empty) {
        groupedItems.value = snap.docs.map((d) => d.data())
      }

      // Ambil Branding Terakhir (Untuk Kop PDF)
      const confSnap = await getDoc(doc(db, 'config', 'perusahaan'))
      if (confSnap.exists()) compConfig.value = confSnap.data()
    } catch (err) {
      console.error('Group Fetch Error:', err)
    } finally {
      $q.loading.hide()
    }
  }

  showDetailDialog.value = true
}

const openLink = (u) => u && window.open(u, '_blank')

// --- EKSPOR ULANG KE PDF (RE-PRINT) - SINKRON DENGAN BARANG KELUAR ---
const exportDetailToPDF = () => {
  const element = document.getElementById('sj-reprint-target')
  const filename = `REPRINT-${selectedItem.value.no_referensi.replace(/\//g, '-')}.pdf`

  const opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2.5,
      useCORS: true,
      letterRendering: true,
      scrollX: 0,
      scrollY: 0,
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', 'thead', 'tbody', '.pdf-row'] },
  }

  $q.loading.show({ message: 'Menyiapkan salinan resmi Surat Jalan...' })
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => {
      $q.loading.hide()
      $q.notify({ type: 'positive', message: 'PDF Salinan berhasil diunduh!' })
    })
}

// --- LOGIKA UTAMA: REAL-TIME LISTENER (SAKLEK GUDANG) ---
let unsub = null
const refreshListener = async () => {
  if (unsub) unsub()
  loading.value = true

  // Ambil Nama Gudang untuk UI
  if (warehouseId.value === 'UTAMA') {
    warehouseName.value = 'Gudang Utama'
  } else if (warehouseId.value) {
    const pSnap = await getDoc(doc(db, 'proyek', warehouseId.value))
    warehouseName.value = pSnap.exists()
      ? 'Gudang ' + (pSnap.data().nama_proyek || pSnap.data().nama)
      : ''
  }

  // Tarik data dan filter di memori agar bener-bener akurat (Saklek Filter)
  const q = query(collection(db, 'aktivitas'), orderBy('timestamp', 'desc'))

  unsub = onSnapshot(
    q,
    (snapshot) => {
      const allData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      // FILTER SAKLEK: Perbandingan ID String absolut
      if (warehouseId.value) {
        riwayatList.value = allData.filter(
          (log) => String(log.id_gudang) === String(warehouseId.value),
        )
      } else {
        riwayatList.value = allData
      }

      loading.value = false
    },
    (err) => {
      console.error('Firestore Strict Filter Error:', err)
      loading.value = false
    },
  )
}

// Pantau perubahan warehouseId
watch(
  warehouseId,
  () => {
    refreshListener()
  },
  { immediate: true },
)

onMounted(() => {
  // handled by watch
})
</script>

<style scoped>
/* =====================================================================================
   CSS PERFECTIONIST STANDARDS
   ===================================================================================== */
.font-pro {
  font-family:
    'Inter',
    -apple-system,
    sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-borders {
  border-radius: 12px;
}
.shadow-premium {
  box-shadow: 0 15px 45px rgba(26, 35, 126, 0.12);
}
.border-indigo-thin {
  border: 1px solid rgba(26, 35, 126, 0.1);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.history-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
}
.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.03) !important;
}
.transition-all {
  transition: all 0.3s ease;
}
.btn-hover:hover {
  transform: translateY(-4px);
  filter: brightness(1.1);
}

.perfectionist-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e0e0e0;
  margin-top: 5px;
}
.perfectionist-table th {
  font-size: 11px;
  letter-spacing: 0.1em;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.perfectionist-table td {
  padding: 15px;
  border: 1px solid #f0f0f0;
}

.animate-fade {
  animation: fadeIn 0.8s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-bounce-subtle {
  animation: bounceSubtle 2s infinite;
}
@keyframes bounceSubtle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* PDF A4 LAYOUT STYLING (IDENTIK KEMBAR 100%) */
.perfectionist-paper {
  background: white !important;
  width: 210mm;
  min-height: 297mm;
  padding: 15mm 15mm;
  margin: 0 auto;
  color: black !important;
  box-sizing: border-box;
  position: relative;
}

.final-kop-img {
  height: 80px;
  width: auto;
  max-width: 280px;
  display: block;
  object-fit: contain;
}
.text-pt-pro {
  font-size: 26px;
  font-weight: 900;
  color: #1a237e !important;
  letter-spacing: -1.5px;
}
.text-pt-tagline {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #444 !important;
}
.pro-divider-thick {
  height: 4px;
  background: #000 !important;
  border-bottom: 1.5px solid #000 !important;
}

.perfectionist-table {
  border-collapse: collapse;
  border: 2.5px solid #000 !important;
}
.perfectionist-table th,
.perfectionist-table td {
  border: 1.5px solid #000 !important;
  padding: 12px 10px;
  font-size: 13px;
  color: black !important;
}
.perfectionist-table th {
  background: #f2f2f2 !important;
  font-weight: 900;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.underline-dotted {
  border-bottom: 1.5px dotted #000;
}
.border-black-solid {
  border: 1.5px solid #000;
}
.uppercase {
  text-transform: uppercase;
}
.tracking-widest {
  letter-spacing: 0.15em;
}
.font-11 {
  font-size: 11px;
}
.shrink {
  flex: 0 0 auto;
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}

/* HIDDEN EXPORT PDF (LIST) DESIGN */
.report-paper {
  font-family: 'Inter', Helvetica, Arial, sans-serif;
  color: #333;
  padding: 10px;
  background: white;
}

/* FIX ROW PDF TERPOTONG: Beri instruksi paksa css dan hindari page-break */
.report-table {
  page-break-inside: auto;
}
.report-table tr {
  page-break-inside: avoid !important;
  page-break-after: auto !important;
  break-inside: avoid !important;
}
.pdf-row {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}
</style>
