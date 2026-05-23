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
         VIEW 1: LIST DAFTAR TAGIHAN UTAMA
         ===================================================================================== -->
    <div v-if="viewMode === 'list_proyek'" class="animate-fade content-relative">
      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-xl animate-fade no-print">
        <div class="col-12 col-md-8">
          <div class="row items-center no-wrap">
            <!-- TOMBOL KEMBALI DIHAPUS SESUAI INSTRUKSI -->
            <div>
              <div class="text-h4 text-weight-bolder text-teal-10 leading-tight">
                Monitoring Tagihan
                <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                  >Daftar Seluruh Tagihan Proyek</span
                >
              </div>
              <div class="text-subtitle1 text-grey-7 q-mt-sm">
                Kelola seluruh tagihan masuk, pantau progress pembayaran, dan integrasi dengan
                Master Proyek & AR.
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-auto q-mt-md q-mt-md-none text-right">
          <!-- Tombol BUAT hanya muncul jika izin `buat` = true -->
          <q-btn
            v-if="canCreate"
            unelevated
            icon="add_box"
            label="BUAT TAGIHAN BARU"
            @click="openAddTagihanDialog"
            class="rounded-20 q-px-xl text-weight-bold shadow-premium btn-teal-main"
          />
        </div>
      </div>

      <!-- SUMMARY CARDS / KPI FINANCE (WARNA-WARNI FULL GRADIENT) -->
      <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
        <!-- Tagihan Aktif (Blue Gradient) -->
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
                  TAGIHAN AKTIF
                </div>
                <div class="text-h4 text-weight-bolder q-mt-xs text-white">
                  {{ tagihanAktif.length }}
                  <span class="text-subtitle1 text-weight-medium">Data</span>
                </div>
              </div>
              <div
                class="bg-white q-pa-md rounded-borders shadow-sm"
                style="min-width: 56px; text-align: center"
              >
                <q-icon name="receipt_long" color="blue-8" size="28px" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Tagihan Lunas (Green Gradient) -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card
            flat
            class="list-card rounded-20 card-green-gradient text-white transition-all hover-shadow"
          >
            <q-card-section class="row items-center no-wrap q-pa-md">
              <div class="col">
                <div
                  class="text-overline leading-none text-weight-bold tracking-widest"
                  style="color: rgba(255, 255, 255, 0.85)"
                >
                  TAGIHAN LUNAS
                </div>
                <div class="text-h4 text-weight-bolder q-mt-xs text-white">
                  {{ tagihanLunas.length }}
                  <span class="text-subtitle1 text-weight-medium">Data</span>
                </div>
              </div>
              <div
                class="bg-white q-pa-md rounded-borders shadow-sm"
                style="min-width: 56px; text-align: center"
              >
                <q-icon name="task_alt" color="positive" size="28px" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Jatuh Tempo (Red Gradient) -->
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
                  JATUH TEMPO
                </div>
                <div class="text-h4 text-weight-bolder q-mt-xs text-white">
                  {{ tagihanOverdue.length }}
                  <span class="text-subtitle1 text-weight-medium">Data</span>
                </div>
              </div>
              <div
                class="bg-white q-pa-md rounded-borders shadow-sm"
                style="min-width: 56px; text-align: center"
              >
                <q-icon name="warning" color="negative" size="28px" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Total Outstanding (Orange Gradient) -->
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
                  TOTAL OUTSTANDING
                </div>
                <div class="text-h5 text-weight-bolder q-mt-xs">
                  Rp {{ formatCompact(totalOutstanding) }}
                </div>
              </div>
              <div
                class="bg-white q-pa-md rounded-borders shadow-sm"
                style="min-width: 56px; text-align: center"
              >
                <q-icon name="account_balance_wallet" color="orange-9" size="28px" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- SEARCH & FILTER AREA -->
      <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print border-teal-thin">
        <q-card-section class="q-pa-lg">
          <div class="row items-center q-col-gutter-md q-mb-lg">
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey-7 q-mb-xs text-weight-bold uppercase font-10">
                Pencarian Cepat
              </div>
              <q-input
                v-model="searchQuery"
                outlined
                dense
                rounded
                placeholder="Cari Kode, BAP, SPK atau Nama Proyek..."
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
            <div class="col-12 col-md-auto">
              <div
                class="text-caption text-grey-7 q-mb-xs text-weight-bold uppercase font-10 text-right"
              >
                Filter Pembayaran
              </div>
              <q-btn-toggle
                v-model="statusFilter"
                flat
                rounded
                toggle-color="teal-10"
                color="grey-7"
                class="bg-grey-1 text-weight-bold"
                :options="[
                  { label: 'Semua', value: 'ALL' },
                  { label: 'Belum Lunas', value: 'OUTSTANDING' },
                  { label: 'Lunas', value: 'LUNAS' },
                ]"
              />
            </div>
          </div>

          <div class="row items-end q-col-gutter-md">
            <div class="col-12 col-sm-6 col-md-2">
              <div class="text-subtitle2 q-mb-xs text-weight-bold">Tanggal Awal</div>
              <q-input
                outlined
                dense
                type="date"
                v-model="filterStartDate"
                bg-color="white"
                color="teal-10"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-2">
              <div class="text-subtitle2 q-mb-xs text-weight-bold">Tanggal Akhir</div>
              <q-input
                outlined
                dense
                type="date"
                v-model="filterEndDate"
                bg-color="white"
                color="teal-10"
              />
            </div>
            <div class="col-12 col-sm-12 col-md-6">
              <div class="text-subtitle2 q-mb-xs text-weight-bold">Filter Berdasarkan Proyek</div>
              <q-select
                outlined
                dense
                v-model="filterSelectedProyek"
                :options="optProyekFilter"
                option-label="nama"
                placeholder="Semua Proyek..."
                bg-color="white"
                clearable
                use-input
                color="teal-10"
                @filter="filterProyekDropdown"
              >
                <template v-slot:prepend>
                  <q-icon name="apartment" color="teal-10" />
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-2">
              <q-btn
                flat
                color="grey-7"
                icon="restart_alt"
                label="Reset Filter"
                class="full-width rounded-12 text-weight-bold hover-teal-btn"
                @click="resetFilters"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- MAIN TABLE DATA -->
      <q-card
        flat
        bordered
        class="rounded-20 shadow-sm overflow-hidden bg-white border-teal-thin animate-fade"
      >
        <q-table
          :rows="filteredTagihan"
          :columns="computedColumns"
          row-key="id"
          flat
          :loading="loading"
          :pagination="{ rowsPerPage: 15 }"
          class="finance-table"
        >
          <template v-slot:header="props">
            <q-tr :props="props" class="table-header-teal text-white">
              <q-th width="40" class="text-center text-weight-bold font-11">NO</q-th>
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
              class="hover-bg transition-all"
              :class="canView ? 'cursor-pointer' : ''"
              @click="canView ? openDetail(props.row) : null"
            >
              <q-td class="text-center font-bold text-grey-7">{{ props.rowIndex + 1 }}</q-td>

              <q-td key="kode">
                <div class="text-weight-bold text-teal-10 text-subtitle2">
                  {{ props.row.kode_tagihan }}
                </div>
                <div
                  class="text-caption text-blue-grey-8 uppercase font-bold"
                  :title="props.row.bap_number"
                >
                  BAP: {{ truncateString(props.row.bap_number, 12) }}
                </div>
              </q-td>

              <q-td key="proyek_spk">
                <div
                  class="text-weight-bold text-blue-grey-10 uppercase font-11"
                  :title="props.row.proyek_nama"
                >
                  {{ truncateString(props.row.proyek_nama, 25) }}
                </div>
                <div class="text-caption text-grey-7" :title="props.row.nomor_spk">
                  SPK: {{ truncateString(props.row.nomor_spk, 20) }}
                </div>
              </q-td>

              <q-td key="invoice_ar">
                <div
                  class="text-weight-bold text-teal-10 uppercase"
                  :title="
                    typeof props.row.nomor_invoice_customer === 'object'
                      ? props.row.nomor_invoice_customer?.nomor_invoice
                      : props.row.nomor_invoice_customer
                  "
                >
                  {{
                    typeof props.row.nomor_invoice_customer === 'object'
                      ? truncateString(props.row.nomor_invoice_customer?.nomor_invoice, 18)
                      : truncateString(props.row.nomor_invoice_customer, 18)
                  }}
                </div>
                <div class="text-caption text-grey-7" v-if="props.row.tanggal_faktur">
                  Faktur: {{ formatDateIndo(props.row.tanggal_faktur) }}
                </div>
              </q-td>

              <q-td key="tgl_invoice">
                <div class="text-weight-bold text-grey-9 font-11">
                  {{ formatDateIndo(props.row.tanggal_invoice) }}
                </div>
              </q-td>

              <q-td key="tgl_submit">
                <div class="text-weight-bold text-grey-9 font-11">
                  {{ formatDateIndo(props.row.tanggal_submit) }}
                </div>
              </q-td>

              <q-td key="jatuh_tempo">
                <div class="text-weight-bold text-grey-9 font-11">
                  {{ formatDateIndo(props.row.jatuh_tempo) }}
                </div>
              </q-td>

              <q-td key="tenor" class="text-center">
                <div class="text-weight-bold font-10" :class="calculateTenor(props.row).color">
                  {{ calculateTenor(props.row).text }}
                </div>
              </q-td>

              <q-td key="progress" class="text-center">
                <div class="text-weight-bold text-teal-10">
                  {{ props.row.progress_persen || 0 }}%
                </div>
                <div class="text-caption text-grey-6 uppercase font-10">
                  {{ truncateString(props.row.tahap_ke || props.row.termin, 10) }}
                </div>
              </q-td>

              <q-td key="nominal" class="text-right">
                <div class="text-weight-bold text-teal-10 text-subtitle2">
                  Rp {{ (props.row.net_amount || 0).toLocaleString('id-ID') }}
                </div>
              </q-td>

              <q-td key="status" class="text-center">
                <q-chip
                  dense
                  :color="getStatusColor(props.row.status).bg"
                  :text-color="getStatusColor(props.row.status).text"
                  class="text-weight-bold font-10 uppercase q-px-sm shadow-sm"
                >
                  {{ props.row.status }}
                </q-chip>
              </q-td>

              <!-- Kolom AKSI hanya tampil jika ada minimal 1 izin aksi -->
              <q-td v-if="hasAnyAction" key="aksi" class="text-center" @click.stop>
                <div class="row justify-center q-gutter-xs">
                  <!-- Tombol Lihat: hanya jika canView -->
                  <q-btn
                    v-if="canView"
                    flat
                    round
                    color="teal-10"
                    icon="visibility"
                    size="sm"
                    @click.stop="openDetail(props.row)"
                    class="hover-teal-btn"
                  >
                    <q-tooltip>Lihat Detail Tagihan</q-tooltip>
                  </q-btn>
                  <!-- Tombol Edit: hanya jika canEdit -->
                  <q-btn
                    v-if="canEdit"
                    flat
                    round
                    color="blue-8"
                    icon="edit"
                    size="sm"
                    @click.stop="openEditTagihanDialog(props.row)"
                    class="hover-blue-btn"
                  >
                    <q-tooltip>Edit Tagihan</q-tooltip>
                  </q-btn>
                  <!-- Tombol Hapus: hanya jika canDelete -->
                  <q-btn
                    v-if="canDelete"
                    flat
                    round
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click.stop="deleteTagihan(props.row)"
                    class="hover-red-btn"
                  >
                    <q-tooltip>Hapus Tagihan</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-xl text-grey-5">
              <q-icon name="receipt" size="48px" class="q-mb-md" color="teal-3" />
              <div class="text-h6 full-width text-center">
                Data tidak ditemukan dengan kriteria filter tersebut.
              </div>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- =====================================================================================
         VIEW 2: DETAIL TAGIHAN
         ===================================================================================== -->
    <div
      v-else-if="viewMode === 'detail_tagihan' && selectedTagihan"
      class="animate-fade q-pb-xl content-relative"
    >
      <div class="row items-center justify-between q-mb-xl no-print">
        <div class="row items-center no-wrap">
          <q-btn
            flat
            round
            color="teal-10"
            icon="arrow_back"
            @click="viewMode = 'list_proyek'"
            class="q-mr-md bg-white shadow-1 hover-teal-btn"
          />
          <div>
            <div class="text-overline text-grey-6 text-bold tracking-widest q-mb-xs leading-none">
              INFORMASI DETAIL TAGIHAN PROYEK
            </div>
            <div class="text-h5 text-weight-bolder text-teal-10 leading-tight uppercase">
              Kode: {{ selectedTagihan.kode_tagihan }}
            </div>
          </div>
        </div>
        <div class="row items-center q-gutter-md">
          <q-btn
            unelevated
            color="white"
            text-color="teal-10"
            icon="picture_as_pdf"
            label="EXPORT PDF"
            class="rounded-12 text-weight-bold shadow-2"
            @click="exportToPDF"
          />
        </div>
      </div>

      <div id="invoice-pdf-target" class="bg-transparent">
        <div class="row items-center justify-between q-mb-lg">
          <div>
            <div
              class="text-h4 text-weight-bolder text-indigo-10 uppercase tracking-widest letter-spacing-1"
            >
              RINCIAN TAGIHAN
            </div>
            <div class="text-subtitle1 text-grey-7 font-bold q-mt-xs">
              {{ selectedTagihan.kode_tagihan }}
            </div>
          </div>
          <div>
            <q-chip
              :color="getStatusColor(selectedTagihan.status).bg"
              :text-color="getStatusColor(selectedTagihan.status).text"
              class="text-weight-bolder font-11 uppercase shadow-sm q-px-md q-py-sm"
              size="16px"
            >
              STATUS: {{ selectedTagihan.status }}
            </q-chip>
          </div>
        </div>

        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-7">
            <!-- CARD 1: REFERENSI DOKUMEN & PROYEK -->
            <q-card flat bordered class="rounded-20 shadow-sm q-mb-lg bg-white border-indigo-thin">
              <q-card-section class="bg-indigo-50 text-indigo-10 q-py-sm border-bottom-subtle">
                <div class="text-weight-bold uppercase tracking-widest font-11 flex items-center">
                  <q-icon name="dataset" size="sm" class="q-mr-sm" /> REFERENSI DOKUMEN & PROYEK
                </div>
              </q-card-section>
              <q-card-section class="q-pa-lg">
                <div class="row q-col-gutter-y-lg q-col-gutter-x-md">
                  <div class="col-12 col-sm-6">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      PROYEK TERKAIT
                    </div>
                    <div class="text-subtitle1 text-weight-bold text-indigo-10 uppercase">
                      {{ selectedTagihan.proyek_nama || '-' }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      NOMOR SPK
                    </div>
                    <div class="text-subtitle1 text-weight-bold">
                      {{ selectedTagihan.nomor_spk || '-' }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      NO. BAP
                    </div>
                    <div class="text-subtitle1 text-weight-bold">
                      {{ selectedTagihan.bap_number || '-' }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      REF. INVOICE CUSTOMER
                    </div>
                    <div class="text-subtitle1 text-weight-bold text-primary uppercase">
                      {{
                        typeof selectedTagihan.nomor_invoice_customer === 'object'
                          ? selectedTagihan.nomor_invoice_customer?.nomor_invoice
                          : selectedTagihan.nomor_invoice_customer || '-'
                      }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- CARD 2: DESKRIPSI PEKERJAAN & TIMELINE -->
            <q-card flat bordered class="rounded-20 shadow-sm q-mb-lg bg-white border-indigo-thin">
              <q-card-section class="bg-indigo-50 text-indigo-10 q-py-sm border-bottom-subtle">
                <div class="text-weight-bold uppercase tracking-widest font-11 flex items-center">
                  <q-icon name="timeline" size="sm" class="q-mr-sm" /> DESKRIPSI PEKERJAAN &
                  TIMELINE
                </div>
              </q-card-section>
              <q-card-section class="q-pa-lg">
                <div class="row q-col-gutter-y-lg q-col-gutter-x-md">
                  <div class="col-12 col-sm-3">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      TGL INVOICE
                    </div>
                    <div class="text-subtitle1 text-weight-bold">
                      {{ formatDateIndo(selectedTagihan.tanggal_invoice) }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-3">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      JATUH TEMPO
                    </div>
                    <div class="text-subtitle1 text-weight-bold text-orange-9">
                      {{ formatDateIndo(selectedTagihan.jatuh_tempo) }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-3">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      TGL FAKTUR
                    </div>
                    <div class="text-subtitle1 text-weight-bold">
                      {{ formatDateIndo(selectedTagihan.tanggal_faktur) }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-3">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      TGL SUBMIT
                    </div>
                    <div class="text-subtitle1 text-weight-bold text-negative">
                      {{ formatDateIndo(selectedTagihan.tanggal_submit) }}
                    </div>
                  </div>

                  <div class="col-12"><q-separator class="border-subtle" /></div>

                  <div class="col-12 col-sm-4">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      JENIS PEKERJAAN
                    </div>
                    <div class="text-subtitle1 text-weight-bold">
                      {{ selectedTagihan.jenis_pekerjaan || '-' }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-4">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      TAHAP / TERMIN
                    </div>
                    <div class="text-subtitle1 text-weight-bold">
                      {{ selectedTagihan.tahap_ke || selectedTagihan.termin || '-' }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-4">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      PROGRESS AKTUAL
                    </div>
                    <div class="text-subtitle1 text-weight-bold text-indigo-10">
                      {{ selectedTagihan.progress_persen || 0 }}%
                    </div>
                  </div>

                  <div class="col-12">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      DESKRIPSI PROYEK
                    </div>
                    <div class="text-body2 text-grey-9">
                      {{ selectedTagihan.deskripsi_proyek || '-' }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-5">
            <!-- CARD 3: KEUANGAN -->
            <q-card
              flat
              bordered
              class="rounded-20 shadow-sm bg-white border-indigo-thin overflow-hidden"
            >
              <div class="bg-indigo-10 text-white q-pa-lg text-center">
                <div class="text-overline text-indigo-2 text-bold tracking-widest uppercase">
                  NET AMOUNT TAGIHAN
                </div>
                <div class="text-h3 text-weight-black q-mt-sm">
                  Rp {{ (selectedTagihan.net_amount || 0).toLocaleString('id-ID') }}
                </div>
              </div>

              <q-card-section class="q-pa-lg">
                <div
                  class="text-weight-bold text-indigo-10 q-mb-md uppercase tracking-widest font-11"
                >
                  RINCIAN KALKULASI PAJAK
                </div>

                <div class="row justify-between items-center q-mb-sm">
                  <div class="text-grey-7 font-bold">Nominal (Kotor)</div>
                  <div class="text-weight-bold text-subtitle1">
                    Rp {{ (selectedTagihan.nominal_invoice || 0).toLocaleString('id-ID') }}
                  </div>
                </div>
                <q-separator class="q-my-sm border-subtle" />
                <div class="row justify-between items-center q-mb-sm">
                  <div class="text-grey-7 font-bold">DPP</div>
                  <div class="text-weight-bold text-subtitle1">
                    Rp {{ (selectedTagihan.dpp || 0).toLocaleString('id-ID') }}
                  </div>
                </div>
                <div class="row justify-between items-center q-mb-sm">
                  <div class="text-grey-7 font-bold">
                    PPN ({{ selectedTagihan.ppn_persen || 0 }}%)
                  </div>
                  <div class="text-weight-bold text-subtitle1 text-positive">
                    + Rp
                    {{
                      (selectedTagihan.ppn_nominal || selectedTagihan.ppn || 0).toLocaleString(
                        'id-ID',
                      )
                    }}
                  </div>
                </div>
                <div class="row justify-between items-center q-mb-md">
                  <div class="text-grey-7 font-bold">
                    PPh Potongan ({{ selectedTagihan.pph_persen || 0 }}%)
                  </div>
                  <div class="text-weight-bold text-subtitle1 text-negative">
                    - Rp
                    {{
                      (selectedTagihan.pph_nominal || selectedTagihan.pph || 0).toLocaleString(
                        'id-ID',
                      )
                    }}
                  </div>
                </div>

                <div class="row justify-between items-center q-mt-xl q-mb-sm no-print">
                  <div class="text-weight-bold text-indigo-10 uppercase tracking-widest font-11">
                    STATUS PEMBAYARAN
                  </div>
                  <!-- Tombol Update Pembayaran: hanya jika canApprove -->
                  <q-btn
                    v-if="canApprove && selectedTagihan.status !== 'Lunas'"
                    outline
                    rounded
                    size="sm"
                    color="indigo-10"
                    icon="add"
                    label="Update Pembayaran"
                    @click="openPaymentDialog"
                  />
                </div>
                <div class="row justify-between items-center q-mb-sm">
                  <div class="text-grey-7 font-bold">Telah Dibayar</div>
                  <div class="text-weight-bold text-subtitle1 text-primary">
                    Rp {{ (selectedTagihan.total_dibayar || 0).toLocaleString('id-ID') }}
                  </div>
                </div>
                <div class="row justify-between items-center">
                  <div class="text-grey-7 font-bold">Sisa Tagihan</div>
                  <div
                    class="text-weight-bold text-subtitle1"
                    :class="
                      (selectedTagihan.net_amount || 0) - (selectedTagihan.total_dibayar || 0) > 0
                        ? 'text-negative'
                        : 'text-positive'
                    "
                  >
                    Rp
                    {{
                      (
                        (selectedTagihan.net_amount || 0) - (selectedTagihan.total_dibayar || 0)
                      ).toLocaleString('id-ID')
                    }}
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- CARD 4: LAMPIRAN -->
            <q-card
              v-if="
                selectedTagihan?.dokumen_lampiran && selectedTagihan.dokumen_lampiran.length > 0
              "
              flat
              bordered
              class="rounded-20 shadow-sm bg-white border-indigo-thin q-mt-lg no-print"
            >
              <q-card-section class="bg-indigo-50 text-indigo-10 q-py-sm border-bottom-subtle">
                <div class="text-weight-bold uppercase tracking-widest font-11 flex items-center">
                  <q-icon name="attachment" size="sm" class="q-mr-sm" /> LAMPIRAN DOKUMEN
                </div>
              </q-card-section>
              <q-card-section class="q-pa-md">
                <q-list separator class="rounded-12">
                  <q-item
                    v-for="(doc, dIdx) in selectedTagihan.dokumen_lampiran"
                    :key="dIdx"
                    clickable
                    v-ripple
                    @click="openLink(doc.url)"
                  >
                    <q-item-section avatar>
                      <q-avatar color="indigo-1" text-color="indigo-10" icon="description" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">{{
                        doc.label || 'Dokumen ' + (dIdx + 1)
                      }}</q-item-label>
                      <q-item-label caption>Klik untuk melihat berkas lampiran</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon name="open_in_new" color="grey-6" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>

            <!-- CARD 5: RIWAYAT PEMBAYARAN -->
            <q-card
              flat
              bordered
              class="rounded-20 shadow-sm bg-white border-indigo-thin q-mt-lg no-print"
            >
              <q-card-section class="bg-indigo-50 text-indigo-10 q-py-sm border-bottom-subtle">
                <div class="text-weight-bold uppercase tracking-widest font-11 flex items-center">
                  <q-icon name="history" size="sm" class="q-mr-sm" /> RIWAYAT PEMBAYARAN
                </div>
              </q-card-section>
              <q-card-section class="q-pa-md">
                <q-list
                  separator
                  v-if="
                    selectedTagihan.riwayat_pembayaran &&
                    selectedTagihan.riwayat_pembayaran.length > 0
                  "
                >
                  <q-item v-for="(hist, idx) in selectedTagihan.riwayat_pembayaran" :key="idx">
                    <q-item-section avatar>
                      <q-avatar color="green-1" text-color="positive" icon="payments" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold text-indigo-10"
                        >Rp {{ (hist.nominal || 0).toLocaleString('id-ID') }}</q-item-label
                      >
                      <q-item-label caption>{{
                        hist.catatan || 'Pembayaran Tagihan'
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="row items-center q-gutter-x-sm">
                        <div class="text-caption text-weight-bold text-grey-8">
                          {{ formatDateIndo(hist.tanggal) }}
                        </div>
                        <q-btn
                          v-if="hist.bukti_url"
                          flat
                          round
                          dense
                          icon="receipt"
                          color="primary"
                          size="sm"
                          @click.stop="openLink(hist.bukti_url)"
                        >
                          <q-tooltip>Lihat Bukti Pembayaran</q-tooltip>
                        </q-btn>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
                <div v-else class="text-center text-grey-6 italic q-py-lg">
                  Belum ada riwayat pembayaran yang tercatat.
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- =====================================================================================
         DIALOG BUAT / EDIT TAGIHAN BARU
         ===================================================================================== -->
    <q-dialog
      v-model="showTagihanDialog"
      maximized
      persistent
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <q-toolbar class="toolbar-teal-gradient text-white q-py-md shadow-4 shrink">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-black uppercase">
            {{ isEditTagihanMode ? 'EDIT DATA TAGIHAN SPK' : 'REGISTRASI TAGIHAN SPK BARU' }}
          </q-toolbar-title>
          <q-btn
            unelevated
            color="white"
            text-color="teal-10"
            label="SIMPAN DOKUMEN"
            @click="simpanTagihan"
            :loading="savingTagihan"
            rounded
            class="q-px-xl text-weight-black shadow-2"
          />
        </q-toolbar>

        <q-scroll-area class="col q-pa-md q-pa-lg-xl">
          <div class="row justify-center">
            <div class="col-12 col-md-10 col-xl-8">
              <q-card
                flat
                bordered
                class="rounded-20 bg-white shadow-1 q-pa-lg q-pa-md-xl border-teal-thin"
              >
                <!-- SECTION 1 -->
                <div class="text-overline text-teal-10 text-bold tracking-widest q-mb-sm">
                  1. REFERENSI PROYEK & KONTRAK
                </div>
                <div class="row q-col-gutter-md q-mb-xl">
                  <q-input
                    class="col-12 col-md-6"
                    outlined
                    dense
                    v-model="formTagihan.kode_tagihan"
                    label="Kode Tagihan (Auto Generate)"
                    readonly
                    bg-color="grey-2"
                    color="teal-10"
                  />
                  <q-select
                    class="col-12 col-md-6"
                    outlined
                    dense
                    v-model="formTagihan.proyek_obj"
                    :options="optProyek"
                    option-label="nama"
                    label="Pilih Data Proyek"
                    clearable
                    use-input
                    @filter="filterProyek"
                    @update:model-value="onProyekSelect"
                    bg-color="teal-1"
                    color="teal-10"
                  >
                    <template v-slot:no-option
                      ><q-item
                        ><q-item-section class="text-grey italic"
                          >Proyek tidak ditemukan</q-item-section
                        ></q-item
                      ></template
                    >
                  </q-select>
                  <q-select
                    class="col-12 col-md-6"
                    outlined
                    dense
                    v-model="formTagihan.spk_obj"
                    :options="optSpkFiltered"
                    option-label="nomor_spk"
                    label="Pilih No SPK Proyek"
                    clearable
                    bg-color="teal-1"
                    color="teal-10"
                    :disable="!formTagihan.proyek_id"
                    @update:model-value="onSpkSelect"
                  >
                    <template v-slot:no-option
                      ><q-item
                        ><q-item-section class="text-grey italic"
                          >Tidak ada SPK pada proyek ini</q-item-section
                        ></q-item
                      ></template
                    >
                  </q-select>
                  <q-input
                    class="col-12 col-md-6"
                    outlined
                    dense
                    v-model="formTagihan.bap_number"
                    label="BAP Number"
                    bg-color="white"
                    color="teal-10"
                  />
                  <q-select
                    class="col-12"
                    outlined
                    dense
                    v-model="formTagihan.nomor_invoice_customer"
                    :options="optInvoiceCustomer"
                    option-label="nomor_invoice"
                    label="Tarik Referensi No. Invoice Customer (AR)"
                    clearable
                    use-input
                    @filter="filterInvoiceCust"
                    @update:model-value="onInvoiceSelect"
                    bg-color="teal-1"
                    color="teal-10"
                  >
                    <template v-slot:no-option
                      ><q-item
                        ><q-item-section class="text-grey italic"
                          >Invoice tidak ditemukan atau sudah digunakan</q-item-section
                        ></q-item
                      ></template
                    >
                  </q-select>
                </div>

                <!-- SECTION 2 -->
                <div class="text-overline text-teal-10 text-bold tracking-widest q-mb-sm">
                  2. DETAIL PEKERJAAN & TIMELINE
                </div>
                <div class="row q-col-gutter-md q-mb-xl">
                  <q-input
                    class="col-12 col-md-3"
                    outlined
                    dense
                    type="date"
                    v-model="formTagihan.tanggal_invoice"
                    label="Tanggal Invoice"
                    stack-label
                    bg-color="white"
                    color="teal-10"
                  />
                  <q-input
                    class="col-12 col-md-3"
                    outlined
                    dense
                    type="date"
                    v-model="formTagihan.jatuh_tempo"
                    label="Jatuh Tempo"
                    stack-label
                    bg-color="white"
                    color="teal-10"
                  />
                  <q-input
                    class="col-12 col-md-3"
                    outlined
                    dense
                    type="date"
                    v-model="formTagihan.tanggal_faktur"
                    label="Tanggal Faktur"
                    stack-label
                    bg-color="white"
                    color="teal-10"
                  />
                  <q-input
                    class="col-12 col-md-3"
                    outlined
                    dense
                    type="date"
                    v-model="formTagihan.tanggal_submit"
                    label="Tgl Submit ke Customer"
                    stack-label
                    bg-color="white"
                    color="teal-10"
                  />
                  <q-input
                    class="col-12 col-md-6"
                    outlined
                    dense
                    v-model="formTagihan.jenis_pekerjaan"
                    label="Jenis Pekerjaan"
                    bg-color="white"
                    color="teal-10"
                  />
                  <q-input
                    class="col-12 col-md-6"
                    outlined
                    dense
                    type="number"
                    v-model.number="formTagihan.progress_persen"
                    label="Persentasi Tagihan (%)"
                    bg-color="white"
                    suffix="%"
                    color="teal-10"
                  />
                  <q-input
                    class="col-12"
                    outlined
                    dense
                    type="textarea"
                    rows="2"
                    v-model="formTagihan.deskripsi_proyek"
                    label="Deskripsi Pekerjaan / Proyek"
                    bg-color="white"
                    color="teal-10"
                  />
                </div>

                <!-- SECTION 3 -->
                <div class="text-overline text-teal-10 text-bold tracking-widest q-mb-sm">
                  3. NILAI TAGIHAN & PAJAK
                </div>
                <div class="row q-col-gutter-md q-mb-md">
                  <q-input
                    class="col-12"
                    outlined
                    dense
                    v-model="formTagihan.tahap_ke"
                    label="Tahap Ke (Termin)"
                    bg-color="white"
                    placeholder="Contoh: Tahap 1 / Termin 30%"
                    color="teal-10"
                  />
                  <q-input
                    class="col-12"
                    outlined
                    dense
                    type="number"
                    v-model.number="formTagihan.nominal_invoice"
                    label="Nominal Invoice / Kuitansi (Kotor)"
                    prefix="Rp"
                    bg-color="white"
                    input-class="text-weight-bold"
                    color="teal-10"
                  />
                  <q-input
                    class="col-12"
                    outlined
                    dense
                    type="number"
                    v-model.number="formTagihan.dpp"
                    label="DPP (Dasar Pengenaan Pajak)"
                    prefix="Rp"
                    readonly
                    bg-color="grey-2"
                    color="teal-10"
                  />
                  <q-input
                    class="col-12 col-md-4"
                    outlined
                    dense
                    type="number"
                    v-model.number="formTagihan.ppn_persen"
                    label="Persentase PPN (%)"
                    suffix="%"
                    bg-color="white"
                    color="teal-10"
                  />
                  <q-input
                    class="col-12 col-md-8"
                    outlined
                    dense
                    type="number"
                    v-model.number="formTagihan.ppn_nominal"
                    label="Nominal PPN"
                    prefix="Rp"
                    readonly
                    bg-color="grey-2"
                    color="teal-10"
                  />
                  <q-input
                    class="col-12 col-md-4"
                    outlined
                    dense
                    type="number"
                    v-model.number="formTagihan.pph_persen"
                    label="Persentase PPh (%)"
                    suffix="%"
                    bg-color="white"
                    color="teal-10"
                  />
                  <q-input
                    class="col-12 col-md-8"
                    outlined
                    dense
                    type="number"
                    v-model.number="formTagihan.pph_nominal"
                    label="Nominal PPh (Potongan)"
                    prefix="Rp"
                    readonly
                    bg-color="grey-2"
                    color="teal-10"
                  />
                  <q-input
                    class="col-12 q-mt-sm"
                    outlined
                    dense
                    type="number"
                    v-model.number="formTagihan.net_amount"
                    label="Net Amount (DPP + PPN - PPh)"
                    prefix="Rp"
                    readonly
                    bg-color="green-1"
                    input-class="text-weight-bold text-h5 text-green-10"
                    color="teal-10"
                  />
                </div>

                <!-- SECTION 4 -->
                <q-separator class="q-my-lg border-subtle" />
                <div class="text-overline text-teal-10 text-bold tracking-widest q-mb-sm">
                  4. LAMPIRAN DOKUMEN (OPSIONAL)
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <div
                      v-for="(doc, dIdx) in formTagihan.dokumen_lampiran"
                      :key="dIdx"
                      class="bg-teal-50 q-pa-md q-mb-sm rounded-12 border-dashed-teal"
                    >
                      <div class="row items-center q-col-gutter-md">
                        <div class="col-12 col-md-5">
                          <q-input
                            outlined
                            dense
                            v-model="doc.label"
                            placeholder="Nama / Judul Dokumen..."
                            bg-color="white"
                            color="teal-10"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-file
                            outlined
                            dense
                            v-model="doc.fileRaw"
                            label="Pilih File (PDF/IMG)"
                            @update:model-value="processFile(doc)"
                            bg-color="white"
                            color="teal-10"
                          >
                            <template v-slot:append><q-icon name="cloud_upload" /></template>
                          </q-file>
                          <div
                            v-if="doc.url"
                            class="text-caption text-positive q-mt-xs text-weight-bold"
                          >
                            <q-icon name="check_circle" /> Dokumen berhasil diunggah
                          </div>
                        </div>
                        <div class="col-12 col-md-1 flex flex-center">
                          <q-btn
                            flat
                            round
                            color="negative"
                            icon="delete"
                            size="sm"
                            @click="formTagihan.dokumen_lampiran.splice(dIdx, 1)"
                          />
                        </div>
                      </div>
                    </div>
                    <q-btn
                      outline
                      color="teal-10"
                      icon="add"
                      label="TAMBAH DOKUMEN LAMPIRAN"
                      class="full-width q-mt-sm rounded-12 text-weight-bold dashed-btn-teal"
                      @click="addDocumentRow"
                    />
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </q-scroll-area>
      </q-card>
    </q-dialog>

    <!-- =====================================================================================
         DIALOG UPDATE PEMBAYARAN
         ===================================================================================== -->
    <q-dialog
      v-model="showPaymentDialog"
      maximized
      persistent
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <q-toolbar class="toolbar-teal-gradient text-white q-py-md shadow-4 shrink">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-black uppercase"
            >UPDATE PEMBAYARAN TAGIHAN</q-toolbar-title
          >
          <q-btn
            unelevated
            color="white"
            text-color="teal-10"
            label="SIMPAN PEMBAYARAN"
            @click="savePayment"
            :loading="savingPayment"
            rounded
            class="q-px-xl text-weight-black shadow-2"
          />
        </q-toolbar>

        <q-scroll-area class="col q-pa-md q-pa-lg-xl">
          <div class="row justify-center">
            <div class="col-12 col-md-8 col-xl-6">
              <q-card
                flat
                bordered
                class="rounded-20 bg-white shadow-1 q-pa-lg q-pa-md-xl border-teal-thin"
              >
                <div class="text-overline text-teal-10 text-bold tracking-widest q-mb-sm">
                  RINCIAN PEMBAYARAN
                </div>
                <div class="row q-col-gutter-md q-mb-lg">
                  <q-input
                    class="col-12 col-md-6"
                    outlined
                    dense
                    type="date"
                    v-model="paymentForm.tanggal"
                    label="Tanggal Pembayaran *"
                    stack-label
                    bg-color="white"
                    color="teal-10"
                  />
                  <q-input
                    class="col-12 col-md-6"
                    outlined
                    dense
                    type="number"
                    v-model.number="paymentForm.nominal"
                    label="Nominal Dibayar (Rp) *"
                    prefix="Rp"
                    input-class="text-weight-bold text-teal-10"
                    bg-color="white"
                    color="teal-10"
                  />
                  <q-input
                    class="col-12"
                    outlined
                    dense
                    type="textarea"
                    rows="3"
                    v-model="paymentForm.catatan"
                    label="Catatan / Keterangan (Opsional)"
                    placeholder="Contoh: DP 50% Termin 1..."
                    bg-color="white"
                    color="teal-10"
                  />
                </div>

                <q-separator class="q-my-lg border-subtle" />

                <div class="text-overline text-teal-10 text-bold tracking-widest q-mb-sm">
                  BUKTI PEMBAYARAN / TRANSFER
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <q-file
                      outlined
                      dense
                      v-model="paymentForm.bukti_file"
                      label="Upload Bukti Pembayaran (Foto/PDF)"
                      accept="image/*, .pdf"
                      bg-color="white"
                      class="bg-teal-50"
                      color="teal-10"
                    >
                      <template v-slot:prepend
                        ><q-icon name="cloud_upload" color="teal-10"
                      /></template>
                      <template v-slot:append v-if="paymentForm.bukti_file">
                        <q-icon
                          name="close"
                          @click.stop.prevent="paymentForm.bukti_file = null"
                          class="cursor-pointer"
                        />
                      </template>
                    </q-file>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      Format yang didukung: JPG, PNG, PDF. File akan otomatis tersimpan di Cloud
                      Storage.
                    </div>
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </q-scroll-area>
      </q-card>
    </q-dialog>

    <!-- HIDDEN TEMPLATE UNTUK EXPORT REKAP DAFTAR INVOICE (DENGAN TEMA EXCEL LAMA, TIDAK DIUBAH) -->
    <div style="display: none">
      <!-- NOTE: Ini adalah bagian PDF & HTML yang sengaja saya pertahankan id "list-print-area" dengan background biru indigo sesuai instruksi Anda: "tampilan pdf dan excel nya gausah di ubah ubah yaa" -->
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
              LAPORAN REKAPITULASI TAGIHAN (AR)
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
              Filter Status: {{ statusFilter }} | Diekspor pada:
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
                NO. TAGIHAN & BAP
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
                STATUS
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in filteredTagihan"
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
                <div style="font-weight: bold">{{ row.kode_tagihan }}</div>
                <div style="color: #666; font-size: 10px; margin-top: 2px">
                  BAP: {{ row.bap_number || '-' }}
                </div>
              </td>
              <td style="padding: 10px 6px; border: 1px solid #e0e0e0">
                <div style="font-weight: bold; text-transform: uppercase; color: #333">
                  {{ row.proyek_nama || '-' }}
                </div>
                <div style="color: #666; font-size: 10px; margin-top: 2px">
                  SPK: {{ row.nomor_spk || '-' }}
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
                Rp {{ (row.net_amount || 0).toLocaleString('id-ID') }}
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
                    row.status === 'Lunas'
                      ? '#2e7d32'
                      : row.status === 'Menunggu Pembayaran'
                        ? '#e65100'
                        : '#1565c0',
                }"
              >
                {{ row.status || 'Pending' }}
              </td>
            </tr>
            <tr v-if="filteredTagihan.length === 0">
              <td
                colspan="5"
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
import { db, storage } from 'src/boot/firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore'
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// ============================================================================
// HAK AKSES — dibaca dari Firestore koleksi `karyawan` berdasarkan user login
// ============================================================================
const userPermission = ref({
  lihat: false,
  buat: false,
  ubah: false,
  hapus: false,
  approve: false,
})

const resolvePermission = (karyawanData) => {
  const detail = karyawanData?.permissions_detail
  if (!detail || !Array.isArray(detail)) {
    const hasKonstruksi = karyawanData?.akses?.includes('konstruksi') || false
    userPermission.value = {
      lihat: hasKonstruksi,
      buat: false,
      ubah: false,
      hapus: false,
      approve: false,
    }
    return
  }

  const modulKonstruksi = detail.find((m) => m.id === 'konstruksi')
  if (!modulKonstruksi || !modulKonstruksi.isActive) {
    userPermission.value = { lihat: false, buat: false, ubah: false, hapus: false, approve: false }
    return
  }

  const menuTagihan = modulKonstruksi.menus?.find((menu) => {
    const lbl = (menu.label || '').toLowerCase()
    return lbl.includes('tagihan') && !lbl.includes('supplier')
  })

  if (!menuTagihan) {
    userPermission.value = { lihat: false, buat: false, ubah: false, hapus: false, approve: false }
    return
  }

  userPermission.value = {
    lihat: menuTagihan.lihat || false,
    buat: menuTagihan.buat || false,
    ubah: menuTagihan.ubah || false,
    hapus: menuTagihan.hapus || false,
    approve: menuTagihan.approve || false,
  }
}

const canView = computed(() => userPermission.value.lihat)
const canCreate = computed(() => userPermission.value.buat)
const canEdit = computed(() => userPermission.value.ubah)
const canDelete = computed(() => userPermission.value.hapus)
const canApprove = computed(() => userPermission.value.approve)

const hasAnyAction = computed(() => canView.value || canEdit.value || canDelete.value)

const computedColumns = computed(() => {
  const cols = [...columnsTagihan]
  if (!hasAnyAction.value) {
    return cols.filter((c) => c.name !== 'aksi')
  }
  return cols
})

const loadUserPermission = () => {
  const auth = getAuth()
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      userPermission.value = {
        lihat: false,
        buat: false,
        ubah: false,
        hapus: false,
        approve: false,
      }
      return
    }

    try {
      const q = query(collection(db, 'karyawan'), where('email', '==', user.email))
      const snap = await getDocs(q)

      if (!snap.empty) {
        const karyawanData = snap.docs[0].data()
        resolvePermission(karyawanData)

        onSnapshot(doc(db, 'karyawan', snap.docs[0].id), (docSnap) => {
          if (docSnap.exists()) resolvePermission(docSnap.data())
        })
      } else {
        userPermission.value = {
          lihat: false,
          buat: false,
          ubah: false,
          hapus: false,
          approve: false,
        }
      }
    } catch (err) {
      console.error('Gagal memuat izin pengguna:', err)
      userPermission.value = {
        lihat: false,
        buat: false,
        ubah: false,
        hapus: false,
        approve: false,
      }
    }
  })
}

// ============================================================================
// STATE DATA MASTER
// ============================================================================
const masterProyek = ref([])
const masterSpk = ref([])
const masterTagihan = ref([])
const masterInvoiceCust = ref([])

const viewMode = ref('list_proyek')
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('ALL')
const showTagihanDialog = ref(false)
const isEditTagihanMode = ref(false)
const savingTagihan = ref(false)
const selectedTagihan = ref(null)

const showPaymentDialog = ref(false)
const savingPayment = ref(false)
const paymentForm = ref({
  tanggal: new Date().toISOString().substr(0, 10),
  nominal: 0,
  catatan: '',
  bukti_file: null,
})

const filterStartDate = ref('')
const filterEndDate = ref('')
const filterSelectedProyek = ref(null)
const optProyekFilter = ref([])
const optProyek = ref([])
const optSpkFiltered = ref([])
const optInvoiceCustomer = ref([])

let unsubProyek = null
let unsubSpk = null
let unsubTagihan = null
let unsubInvoiceCust = null

const formTagihan = ref({
  id: null,
  kode_tagihan: '',
  proyek_id: null,
  proyek_nama: '',
  spk_id: null,
  nomor_spk: '',
  bap_number: '',
  nomor_invoice_customer: null,
  tanggal_invoice: new Date().toISOString().substr(0, 10),
  jatuh_tempo: '',
  tanggal_faktur: '',
  tanggal_submit: '',
  jenis_pekerjaan: '',
  deskripsi_proyek: '',
  progress_persen: 0,
  tahap_ke: '',
  nominal_invoice: 0,
  dpp: 0,
  ppn_persen: 11,
  ppn_nominal: 0,
  pph_persen: 0,
  pph_nominal: 0,
  net_amount: 0,
  status: 'Menunggu Pembayaran',
  total_dibayar: 0,
  dokumen_lampiran: [],
  riwayat_pembayaran: [],
})

// Auto-calculate pajak
watch(
  () => [
    formTagihan.value.nominal_invoice,
    formTagihan.value.ppn_persen,
    formTagihan.value.pph_persen,
  ],
  ([nominal, ppn, pph]) => {
    const valNominal = Number(nominal) || 0
    const valPpnPersen = Number(ppn) || 0
    const valPphPersen = Number(pph) || 0

    let valDpp = valNominal
    if (valPpnPersen > 0) valDpp = valNominal / (1 + valPpnPersen / 100)

    const valPpn = (valDpp * valPpnPersen) / 100
    const valPph = (valDpp * valPphPersen) / 100

    formTagihan.value.dpp = Math.round(valDpp)
    formTagihan.value.ppn_nominal = Math.round(valPpn)
    formTagihan.value.pph_nominal = Math.round(valPph)
    formTagihan.value.net_amount = Math.round(valDpp + valPpn - valPph)
  },
)

const generateKodeTagihan = () => {
  const count = masterTagihan.value.length + 1
  const padded = count.toString().padStart(3, '0')
  const year = new Date().getFullYear()
  const month = ('0' + (new Date().getMonth() + 1)).slice(-2)
  return `TG/${year}${month}/${padded}`
}

const truncateString = (str, num) => {
  if (!str) return '-'
  if (str.length <= num) return str
  return str.slice(0, num) + '...'
}

const calculateTenor = (row) => {
  if (row.status === 'Lunas') return { text: 'LUNAS', color: 'text-positive' }
  if (!row.jatuh_tempo || row.jatuh_tempo === '-') return { text: '-', color: 'text-grey-6' }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const jtDate = new Date(row.jatuh_tempo)
  jtDate.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((jtDate - today) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { text: `Telat ${Math.abs(diffDays)} Hari`, color: 'text-negative' }
  if (diffDays === 0) return { text: 'Hari Ini', color: 'text-orange-9' }
  return { text: `${diffDays} Hari Lagi`, color: 'text-positive' }
}

const columnsTagihan = [
  { name: 'kode', align: 'left', label: 'KODE & BAP', field: 'kode_tagihan', sortable: true },
  {
    name: 'proyek_spk',
    align: 'left',
    label: 'PROYEK & SPK',
    field: 'proyek_nama',
    sortable: true,
  },
  { name: 'invoice_ar', align: 'left', label: 'INVOICE & FAKTUR', field: 'nomor_invoice_customer' },
  {
    name: 'tgl_invoice',
    align: 'left',
    label: 'TGL INVOICE',
    field: 'tanggal_invoice',
    sortable: true,
  },
  {
    name: 'tgl_submit',
    align: 'left',
    label: 'TGL SUBMIT',
    field: 'tanggal_submit',
    sortable: true,
  },
  {
    name: 'jatuh_tempo',
    align: 'left',
    label: 'JATUH TEMPO',
    field: 'jatuh_tempo',
    sortable: true,
  },
  { name: 'tenor', align: 'center', label: 'TENOR', field: 'jatuh_tempo', sortable: true },
  {
    name: 'progress',
    align: 'center',
    label: 'PROGRESS',
    field: 'progress_persen',
    sortable: true,
  },
  { name: 'nominal', align: 'right', label: 'NET AMOUNT', field: 'net_amount', sortable: true },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]

// ============================================================================
// HIGH-FIDELITY SVG VECTOR ICONS (CONSTRUCTION THEMED - TEAL & ORANGE)
// ============================================================================
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

// ============================================================================
// COMPUTED
// ============================================================================
const mappedTagihan = computed(() =>
  masterTagihan.value
    .map((t) => ({
      ...t,
      search_string:
        `${t.kode_tagihan} ${t.bap_number} ${t.proyek_nama} ${t.nomor_spk} ${typeof t.nomor_invoice_customer === 'object' ? t.nomor_invoice_customer?.nomor_invoice : t.nomor_invoice_customer}`.toLowerCase(),
    }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)),
)

const tagihanAktif = computed(() =>
  mappedTagihan.value.filter(
    (r) => r.status === 'Menunggu Pembayaran' || r.status === 'Dibayar Sebagian',
  ),
)
const tagihanLunas = computed(() => mappedTagihan.value.filter((r) => r.status === 'Lunas'))
const tagihanOverdue = computed(() => {
  const today = new Date().toISOString().substr(0, 10)
  return mappedTagihan.value.filter(
    (r) => r.jatuh_tempo && r.jatuh_tempo < today && r.status !== 'Lunas',
  )
})
const totalOutstanding = computed(() =>
  tagihanAktif.value.reduce(
    (sum, r) => sum + ((Number(r.net_amount) || 0) - (Number(r.total_dibayar) || 0)),
    0,
  ),
)

const filteredTagihan = computed(() => {
  let result = mappedTagihan.value

  if (statusFilter.value === 'OUTSTANDING') {
    result = result.filter(
      (r) => r.status === 'Menunggu Pembayaran' || r.status === 'Dibayar Sebagian',
    )
  } else if (statusFilter.value === 'LUNAS') {
    result = result.filter((r) => r.status === 'Lunas')
  }

  if (searchQuery.value) {
    const lower = searchQuery.value.toLowerCase()
    result = result.filter((r) => r.search_string.includes(lower))
  }

  if (filterStartDate.value)
    result = result.filter((r) => r.tanggal_invoice >= filterStartDate.value)
  if (filterEndDate.value) result = result.filter((r) => r.tanggal_invoice <= filterEndDate.value)
  if (filterSelectedProyek.value)
    result = result.filter((r) => r.proyek_id === filterSelectedProyek.value.id)

  return result
})

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'ALL'
  filterStartDate.value = ''
  filterEndDate.value = ''
  filterSelectedProyek.value = null
}

const availableInvoiceCust = computed(() => {
  const usedInvoices = masterTagihan.value
    .filter((t) => (isEditTagihanMode.value ? t.id !== formTagihan.value.id : true))
    .map((t) =>
      typeof t.nomor_invoice_customer === 'object'
        ? t.nomor_invoice_customer?.nomor_invoice
        : t.nomor_invoice_customer,
    )
    .filter(Boolean)
  return masterInvoiceCust.value.filter((inv) => !usedInvoices.includes(inv.nomor_invoice))
})

// ============================================================================
// DROPDOWN FILTERS
// ============================================================================
const filterProyek = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    optProyek.value = masterProyek.value.filter((v) => v.nama?.toLowerCase().includes(needle))
  })
}

const filterProyekDropdown = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    optProyekFilter.value = masterProyek.value.filter((v) => v.nama?.toLowerCase().includes(needle))
  })
}

const onProyekSelect = (val) => {
  if (val) {
    formTagihan.value.proyek_id = val.id
    formTagihan.value.proyek_nama = val.nama
    optSpkFiltered.value = masterSpk.value.filter((s) => s.projectId === val.id)
  } else {
    formTagihan.value.proyek_id = null
    formTagihan.value.proyek_nama = ''
    optSpkFiltered.value = []
  }
  formTagihan.value.spk_id = null
  formTagihan.value.nomor_spk = ''
}

const onSpkSelect = (val) => {
  if (val) {
    formTagihan.value.spk_id = val.id
    formTagihan.value.nomor_spk = val.nomor_spk
  } else {
    formTagihan.value.spk_id = null
    formTagihan.value.nomor_spk = ''
  }
}

const filterInvoiceCust = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    optInvoiceCustomer.value = availableInvoiceCust.value.filter(
      (v) =>
        v.nomor_invoice?.toLowerCase().includes(needle) ||
        v.customer_nama?.toLowerCase().includes(needle),
    )
  })
}

const onInvoiceSelect = (val) => {
  if (val) {
    if (val.tanggal) formTagihan.value.tanggal_invoice = val.tanggal
    if (val.jatuh_tempo) formTagihan.value.jatuh_tempo = val.jatuh_tempo
  } else {
    formTagihan.value.tanggal_invoice = new Date().toISOString().substr(0, 10)
    formTagihan.value.jatuh_tempo = ''
  }
}

// ============================================================================
// LAMPIRAN
// ============================================================================
const addDocumentRow = () => {
  if (!formTagihan.value.dokumen_lampiran) formTagihan.value.dokumen_lampiran = []
  formTagihan.value.dokumen_lampiran.push({ label: '', fileRaw: null, url: '' })
}

const processFile = async (docObj) => {
  const file = docObj.fileRaw
  if (!file) return
  $q.loading.show({ message: 'Mengunggah dokumen...' })
  try {
    const fRef = sRef(storage, `monitoring_tagihan_docs/${Date.now()}_${file.name}`)
    await uploadBytes(fRef, file)
    docObj.url = await getDownloadURL(fRef)
    $q.notify({ type: 'positive', position: 'top', message: 'Dokumen berhasil diunggah' })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', position: 'top', message: 'Gagal mengunggah dokumen' })
  } finally {
    $q.loading.hide()
  }
}

const openLink = (url) => {
  if (url) window.open(url, '_blank')
}

// ============================================================================
// FIREBASE DATA FETCHING
// ============================================================================
const fetchData = () => {
  loading.value = true

  unsubProyek = onSnapshot(collection(db, 'proyek'), (snap) => {
    masterProyek.value = snap.docs.map((d) => ({ ...d.data(), id: d.id }))
    optProyek.value = [...masterProyek.value]
    optProyekFilter.value = [...masterProyek.value]
  })

  unsubSpk = onSnapshot(collection(db, 'spk_customer'), (snap) => {
    masterSpk.value = snap.docs.map((d) => ({ ...d.data(), id: d.id }))
  })

  unsubTagihan = onSnapshot(collection(db, 'monitoring_tagihan_spk'), (snap) => {
    masterTagihan.value = snap.docs.map((d) => ({ ...d.data(), id: d.id }))
    loading.value = false
  })

  unsubInvoiceCust = onSnapshot(collection(db, 'finance_invoice_customer'), (snap) => {
    masterInvoiceCust.value = snap.docs.map((d) => ({ ...d.data(), id: d.id }))
    optInvoiceCustomer.value = availableInvoiceCust.value
  })
}

// ============================================================================
// CRUD TAGIHAN
// ============================================================================
const openDetail = (row) => {
  if (!canView.value) return
  selectedTagihan.value = row
  viewMode.value = 'detail_tagihan'
  window.scrollTo(0, 0)
}

const openAddTagihanDialog = () => {
  if (!canCreate.value)
    return $q.notify({
      type: 'negative',
      position: 'top',
      message: 'Anda tidak memiliki izin untuk membuat tagihan.',
    })
  isEditTagihanMode.value = false
  formTagihan.value = {
    id: null,
    kode_tagihan: generateKodeTagihan(),
    proyek_id: null,
    proyek_nama: '',
    spk_id: null,
    nomor_spk: '',
    bap_number: '',
    nomor_invoice_customer: null,
    tanggal_invoice: new Date().toISOString().substr(0, 10),
    jatuh_tempo: '',
    tanggal_faktur: '',
    tanggal_submit: '',
    jenis_pekerjaan: '',
    deskripsi_proyek: '',
    progress_persen: 0,
    tahap_ke: '',
    nominal_invoice: 0,
    dpp: 0,
    ppn_persen: 11,
    ppn_nominal: 0,
    pph_persen: 0,
    pph_nominal: 0,
    net_amount: 0,
    status: 'Menunggu Pembayaran',
    total_dibayar: 0,
    proyek_obj: null,
    spk_obj: null,
    dokumen_lampiran: [],
    riwayat_pembayaran: [],
  }
  showTagihanDialog.value = true
}

const openEditTagihanDialog = (row) => {
  if (!canEdit.value)
    return $q.notify({
      type: 'negative',
      position: 'top',
      message: 'Anda tidak memiliki izin untuk mengedit tagihan.',
    })
  isEditTagihanMode.value = true
  formTagihan.value = {
    ...row,
    tahap_ke: row.tahap_ke || row.termin || '',
    ppn_persen: row.ppn_persen !== undefined ? row.ppn_persen : 11,
    ppn_nominal: row.ppn_nominal || row.ppn || 0,
    pph_persen: row.pph_persen !== undefined ? row.pph_persen : 0,
    pph_nominal: row.pph_nominal || row.pph || 0,
    dokumen_lampiran: row.dokumen_lampiran || [],
    riwayat_pembayaran: row.riwayat_pembayaran || [],
  }

  if (row.proyek_id) {
    const proj = masterProyek.value.find((p) => p.id === row.proyek_id)
    if (proj) {
      formTagihan.value.proyek_obj = proj
      optSpkFiltered.value = masterSpk.value.filter((s) => s.projectId === proj.id)
    }
  }

  if (row.spk_id) {
    const spk = masterSpk.value.find((s) => s.id === row.spk_id)
    if (spk) formTagihan.value.spk_obj = spk
  }

  if (typeof row.nomor_invoice_customer === 'string') {
    const inv = masterInvoiceCust.value.find((i) => i.nomor_invoice === row.nomor_invoice_customer)
    if (inv) formTagihan.value.nomor_invoice_customer = inv
  }

  showTagihanDialog.value = true
}

const simpanTagihan = async () => {
  if (!formTagihan.value.proyek_nama) {
    return $q.notify({ type: 'warning', position: 'top', message: 'Data proyek wajib diisi' })
  }

  if (!isEditTagihanMode.value && !canCreate.value) {
    return $q.notify({
      type: 'negative',
      position: 'top',
      message: 'Anda tidak memiliki izin untuk membuat tagihan.',
    })
  }
  if (isEditTagihanMode.value && !canEdit.value) {
    return $q.notify({
      type: 'negative',
      position: 'top',
      message: 'Anda tidak memiliki izin untuk mengedit tagihan.',
    })
  }

  savingTagihan.value = true
  try {
    const payload = { ...formTagihan.value, updatedAt: serverTimestamp() }
    delete payload.id
    delete payload.proyek_obj
    delete payload.spk_obj
    if (payload.dokumen_lampiran) payload.dokumen_lampiran.forEach((d) => delete d.fileRaw)
    if (payload.nomor_invoice_customer?.nomor_invoice) {
      payload.nomor_invoice_customer = payload.nomor_invoice_customer.nomor_invoice
    }
    if (payload.status === 'Lunas') payload.total_dibayar = payload.net_amount

    if (isEditTagihanMode.value) {
      if (!formTagihan.value.id)
        return $q.notify({
          type: 'negative',
          position: 'top',
          message: 'Gagal: ID tidak ditemukan.',
        })
      await updateDoc(doc(db, 'monitoring_tagihan_spk', formTagihan.value.id), payload)
      $q.notify({ type: 'positive', position: 'top', message: 'Tagihan berhasil diperbarui' })
    } else {
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'monitoring_tagihan_spk'), payload)
      $q.notify({ type: 'positive', position: 'top', message: 'Tagihan berhasil ditambahkan' })
    }
    showTagihanDialog.value = false
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', position: 'top', message: 'Terjadi kesalahan' })
  } finally {
    savingTagihan.value = false
  }
}

const deleteTagihan = (row) => {
  if (!canDelete.value)
    return $q.notify({
      type: 'negative',
      position: 'top',
      message: 'Anda tidak memiliki izin untuk menghapus tagihan.',
    })
  if (!row?.id)
    return $q.notify({ type: 'negative', position: 'top', message: 'ID Dokumen tidak valid.' })

  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Apakah Anda yakin ingin menghapus tagihan ${row.kode_tagihan} secara permanen?`,
    cancel: true,
    ok: { color: 'negative', unelevated: true, label: 'Ya, Hapus' },
  }).onOk(async () => {
    $q.loading.show({ message: 'Menghapus data tagihan...' })
    try {
      await deleteDoc(doc(db, 'monitoring_tagihan_spk', row.id))
      $q.notify({ type: 'positive', position: 'top', message: 'Data tagihan berhasil dihapus!' })
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', position: 'top', message: 'Gagal menghapus data.' })
    } finally {
      $q.loading.hide()
    }
  })
}

// ============================================================================
// PEMBAYARAN
// ============================================================================
const openPaymentDialog = () => {
  if (!canApprove.value)
    return $q.notify({
      type: 'negative',
      position: 'top',
      message: 'Anda tidak memiliki izin untuk mengupdate pembayaran.',
    })
  paymentForm.value = {
    tanggal: new Date().toISOString().substr(0, 10),
    nominal: 0,
    catatan: '',
    bukti_file: null,
  }
  showPaymentDialog.value = true
}

const savePayment = async () => {
  if (!canApprove.value)
    return $q.notify({
      type: 'negative',
      position: 'top',
      message: 'Anda tidak memiliki izin untuk mengupdate pembayaran.',
    })
  if (!paymentForm.value.nominal || paymentForm.value.nominal <= 0) {
    return $q.notify({
      type: 'warning',
      position: 'top',
      message: 'Nominal pembayaran harus lebih besar dari 0',
    })
  }

  savingPayment.value = true
  let buktiUrl = ''

  try {
    if (paymentForm.value.bukti_file) {
      $q.loading.show({ message: 'Mengunggah bukti pembayaran...' })
      const file = paymentForm.value.bukti_file
      const fRef = sRef(storage, `monitoring_tagihan_pembayaran/${Date.now()}_${file.name}`)
      await uploadBytes(fRef, file)
      buktiUrl = await getDownloadURL(fRef)
      $q.loading.hide()
    }

    const newNominal = Number(paymentForm.value.nominal) || 0
    const currentTotal = Number(selectedTagihan.value.total_dibayar) || 0
    const netAmount = Number(selectedTagihan.value.net_amount) || 0
    const newTotal = currentTotal + newNominal

    let newStatus = 'Menunggu Pembayaran'
    if (newTotal >= netAmount) newStatus = 'Lunas'
    else if (newTotal > 0) newStatus = 'Dibayar Sebagian'

    const paymentRecord = {
      id: Date.now().toString(),
      tanggal: paymentForm.value.tanggal,
      nominal: newNominal,
      catatan: paymentForm.value.catatan,
      bukti_url: buktiUrl,
      createdAt: new Date().toISOString(),
    }

    await updateDoc(doc(db, 'monitoring_tagihan_spk', selectedTagihan.value.id), {
      total_dibayar: newTotal,
      status: newStatus,
      riwayat_pembayaran: arrayUnion(paymentRecord),
      updatedAt: serverTimestamp(),
    })

    if (!selectedTagihan.value.riwayat_pembayaran) selectedTagihan.value.riwayat_pembayaran = []
    selectedTagihan.value.total_dibayar = newTotal
    selectedTagihan.value.status = newStatus
    selectedTagihan.value.riwayat_pembayaran.push(paymentRecord)

    $q.notify({ type: 'positive', position: 'top', message: 'Pembayaran berhasil dicatat!' })
    showPaymentDialog.value = false
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', position: 'top', message: 'Gagal mencatat pembayaran.' })
    $q.loading.hide()
  } finally {
    savingPayment.value = false
  }
}

// ============================================================================
// UTILITIES
// ============================================================================
const formatDateIndo = (d) => {
  if (!d || d === '-') return '-'
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatCompact = (num) => {
  if (!num) return '0'
  if (num >= 1000000000) return (num / 1000000000).toFixed(2).replace(/\.00$/, '') + ' M'
  if (num >= 1000000) return (num / 1000000).toFixed(2).replace(/\.00$/, '') + ' Jt'
  return num.toLocaleString('id-ID')
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Menunggu Pembayaran':
      return { bg: 'orange-1', text: 'orange-10' }
    case 'Dibayar Sebagian':
      return { bg: 'blue-1', text: 'blue-10' }
    case 'Lunas':
      return { bg: 'green-2', text: 'green-10' }
    default:
      return { bg: 'grey-2', text: 'grey-8' }
  }
}

const exportToPDF = () => {
  $q.notify({
    type: 'info',
    position: 'top',
    message: 'Gunakan fitur cetak browser (Ctrl+P) untuk menyimpan tampilan dashboard.',
  })
  window.print()
}

onMounted(() => {
  loadUserPermission()
  fetchData()
  // Start floating icons every 1.5s
  floatingIconInterval = setInterval(spawnFloatingIcon, 1500)
  spawnFloatingIcon()
})

onUnmounted(() => {
  if (unsubProyek) unsubProyek()
  if (unsubSpk) unsubSpk()
  if (unsubTagihan) unsubTagihan()
  if (unsubInvoiceCust) unsubInvoiceCust()
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
  box-shadow: 0 10px 30px rgba(0, 150, 136, 0.15); /* Diubah jadi tone Teal */
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-dashed-teal {
  border: 2px dashed #009688;
}
.dashed-btn-teal {
  border: 2px dashed #009688;
}
.border-teal-thin {
  border: 1px solid rgba(0, 150, 136, 0.18) !important;
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
.hover-teal-btn {
  transition: 0.3s;
}
.hover-teal-btn:hover {
  background-color: #e0f2f1 !important;
  color: #009688 !important;
}
.hover-blue-btn {
  transition: 0.3s;
}
.hover-blue-btn:hover {
  background-color: #e8eaf6 !important;
  color: #1a237e !important;
}
.hover-red-btn {
  transition: 0.3s;
}
.hover-red-btn:hover {
  background-color: #ffebee !important;
  color: #d32f2f !important;
}
.table-header-teal {
  background: linear-gradient(90deg, #00796b 0%, #009688 100%) !important;
}
.toolbar-teal-gradient {
  background: linear-gradient(90deg, #009688 0%, #00acc1 100%) !important;
}

/* =============================================
   WARNA-WARNI GRADIEN KPI BARU (IDENTIK GAMBAR)
   ============================================= */
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
.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(0, 150, 136, 0.1) !important;
}

.animate-fade {
  animation: fadeIn 0.4s ease-out;
}
.animate-fade-up {
  animation: fadeUp 0.6s ease-out both;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
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

/* =======================================================================
   PDF PREVIEW STYLES (DIPERTAHANKAN WARNA ASLI BLUE-INDIGO)
   ======================================================================= */
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
