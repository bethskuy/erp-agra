<template>
  <q-page class="bg-page q-pa-md font-pro page-wrapper">
    <div class="page-content-wrapper">
      <div v-if="viewMode === 'list'" class="animate-fade content-relative">
        <div class="row items-center justify-between q-mb-xl no-print q-col-gutter-sm">
          <div class="col-12 col-md-8">
            <div class="row items-center no-wrap">
              <div>
                <div class="text-h4 text-weight-bolder title-teal-custom leading-tight">
                  Tagihan Supplier & Labour
                  <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                    >Manajemen Account Payable (Hutang Usaha)</span
                  >
                </div>
                <div class="text-subtitle1 text-grey-7 q-mt-sm">
                  Catat dan pantau semua tagihan masuk (invoice) dari vendor maupun pekerja
                  lapangan.
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-auto text-center text-md-right btn-buat-container">
            <div class="flex items-center justify-center justify-md-end q-gutter-sm q-mt-sm q-mt-md-none">
              <!-- EXPORT DROPDOWN LIST -->
              <q-btn-dropdown
                unelevated
                rounded
                no-caps
                color="indigo-9"
                icon="grid_on"
                label="Export Data"
                class="text-weight-bold shadow-1 q-px-md"
              >
                <q-list class="bg-white rounded-borders">
                  <q-item
                    clickable
                    v-close-popup
                    @click="exportTablePDF"
                    class="hover-teal-btn"
                  >
                    <q-item-section avatar>
                      <q-avatar color="red-1" text-color="red-10" icon="picture_as_pdf" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">Download PDF</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item
                    clickable
                    v-close-popup
                    @click="exportTableExcel"
                    class="hover-teal-btn"
                  >
                    <q-item-section avatar>
                      <q-avatar color="green-1" text-color="green-10" icon="table_view" size="sm" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">Export Excel</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>

              <!-- Tombol Buat: hanya tampil jika canCreate -->
              <q-btn
                v-if="canCreate"
                color="teal-10"
                icon="add_card"
                label="Registrasi Tagihan Baru"
                unelevated
                rounded
                no-caps
                class="q-px-lg q-py-sm shadow-premium btn-teal-main text-weight-bold"
                @click="openAddDialog"
              />
            </div>
          </div>
        </div>

        <!-- KPI CARDS (FULL GRADIENT COLORED) -->
        <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
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
                    TOTAL INVOICE
                  </div>
                  <div class="text-h4 text-weight-bolder q-mt-xs text-white">
                    {{ filteredRows.length }}
                  </div>
                </div>
                <div
                  class="bg-white q-pa-md rounded-borders shadow-sm"
                  style="min-width: 56px; text-align: center"
                >
                  <q-icon name="receipt_long" color="teal-8" size="28px" />
                </div>
              </q-card-section>
            </q-card>
          </div>

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
                    BELUM DIBAYAR
                  </div>
                  <div class="text-h4 text-weight-bolder q-mt-xs text-white">
                    {{ countOutstanding() }}
                  </div>
                </div>
                <div
                  class="bg-white q-pa-md rounded-borders shadow-sm"
                  style="min-width: 56px; text-align: center"
                >
                  <q-icon name="pending_actions" color="blue-8" size="28px" />
                </div>
              </q-card-section>
            </q-card>
          </div>

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
                    {{ countOverdue() }}
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
                    Rp {{ formatCompact(totalOutstandingValuation) }}
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

        <!-- FILTER AREA -->
        <q-card
          flat
          bordered
          class="q-mb-lg shadow-1 rounded-20 bg-white no-print border-teal-thin"
        >
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
                  placeholder="Cari Kode Tagihan, No. Invoice atau Supplier..."
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
              <div class="col-12 col-sm-6 col-md-3">
                <div class="text-subtitle2 q-mb-xs text-weight-bold">Filter Vendor</div>
                <q-select
                  outlined
                  dense
                  v-model="filterSelectedVendor"
                  :options="optVendorFilter"
                  option-label="nama"
                  :placeholder="
                    filterSelectedVendor && filterSelectedVendor.length > 0 ? '' : 'Pilih Vendor...'
                  "
                  bg-color="white"
                  clearable
                  use-input
                  multiple
                  use-chips
                  @filter="filterVendorDropdown"
                  color="teal-10"
                >
                  <template v-slot:prepend><q-icon name="storefront" color="teal-10" /></template>
                </q-select>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="text-subtitle2 q-mb-xs text-weight-bold">Filter Proyek</div>
                <q-select
                  outlined
                  dense
                  v-model="filterSelectedProyek"
                  :options="optProyekFilter"
                  option-label="nama"
                  :placeholder="
                    filterSelectedProyek && filterSelectedProyek.length > 0 ? '' : 'Pilih Proyek...'
                  "
                  bg-color="white"
                  clearable
                  use-input
                  multiple
                  use-chips
                  @filter="filterProyekDropdown"
                  color="teal-10"
                >
                  <template v-slot:prepend><q-icon name="apartment" color="teal-10" /></template>
                </q-select>
              </div>
              <div class="col-12 col-md-2">
                <q-btn
                  flat
                  color="grey-7"
                  icon="restart_alt"
                  label="Reset"
                  class="full-width rounded-12 text-weight-bold hover-teal-btn"
                  @click="resetFilters"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- MAIN TABLE -->
        <q-card
          flat
          bordered
          class="rounded-20 shadow-sm overflow-hidden bg-white no-print content-relative border-teal-thin animate-fade"
        >
          <q-table
            :rows="filteredRows"
            :columns="computedColumns"
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
                class="hover-bg transition-all"
                :class="canView ? 'cursor-pointer' : ''"
                @click="canView ? openDetail(props.row) : null"
              >
                <q-td key="kode">
                  <div class="text-weight-bold text-teal-10">
                    {{ props.row.kode_tagihan || '-' }}
                  </div>
                </q-td>

                <q-td key="invoice">
                  <div class="row items-center no-wrap">
                    <q-avatar
                      size="36px"
                      color="teal-1"
                      text-color="teal-10"
                      icon="receipt"
                      class="q-mr-md shadow-sm"
                    />
                    <div>
                      <div
                        class="text-weight-bold text-blue-grey-10 text-subtitle2 leading-none q-mb-xs"
                      >
                        {{ props.row.nomor_invoice || 'NO-INV' }}
                      </div>
                      <div class="text-caption text-grey-6 uppercase text-weight-medium">
                        VENDOR: {{ props.row.supplier_nama }}
                      </div>
                    </div>
                  </div>
                </q-td>

                <q-td key="referensi">
                  <div class="text-weight-bold text-blue-grey-9 uppercase font-11">
                    {{ props.row.proyek_nama || 'NON-PROYEK' }}
                  </div>
                  <div class="text-caption text-grey-6" v-if="props.row.po_nomor">
                    Ref PO: {{ props.row.po_nomor }}
                  </div>
                  <div class="text-caption text-grey-6" v-if="props.row.spk_nomor">
                    SPK: {{ props.row.spk_nomor }}
                  </div>
                </q-td>

                <q-td key="timeline">
                  <div class="text-caption text-grey-8 font-11">
                    Tgl:
                    <span class="text-weight-bold">{{
                      formatDateIndo(props.row.tanggal_invoice)
                    }}</span>
                  </div>
                  <div
                    class="text-caption font-11"
                    :class="
                      isOverdue(props.row.jatuh_tempo, props.row)
                        ? 'text-negative text-weight-bold'
                        : 'text-grey-8'
                    "
                  >
                    Tempo:
                    <span class="text-weight-bold">{{
                      formatDateIndo(props.row.jatuh_tempo)
                    }}</span>
                  </div>
                </q-td>

                <q-td key="nominal" class="text-right">
                  <div class="text-weight-bolder text-teal-10 text-subtitle2">
                    Rp {{ props.row.grand_total.toLocaleString('id-ID') }}
                  </div>
                  <div class="text-caption text-grey-7">
                    Telah dibayar:
                    <span class="text-weight-bold text-primary"
                      >Rp {{ props.row.total_dibayar.toLocaleString('id-ID') }}</span
                    >
                  </div>
                  <div
                    class="text-caption"
                    :class="props.row.sisa_tagihan > 0 ? 'text-negative' : 'text-positive'"
                  >
                    Sisa:
                    <span class="text-weight-bold"
                      >Rp {{ props.row.sisa_tagihan.toLocaleString('id-ID') }}</span
                    >
                  </div>
                </q-td>

                <q-td key="status" class="text-center">
                  <q-chip
                    dense
                    :color="getStatusColor(props.row.status).bg"
                    :text-color="getStatusColor(props.row.status).text"
                    class="text-weight-bold font-10 uppercase q-ma-none shadow-sm q-px-sm"
                  >
                    {{ props.row.status }}
                  </q-chip>
                </q-td>

                <!-- Kolom AKSI hanya tampil jika ada minimal 1 izin -->
                <q-td v-if="hasAnyAction" key="aksi" class="text-center" @click.stop>
                  <div class="row justify-center q-gutter-xs">
                    <!-- Lihat: hanya jika canView -->
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
                    <!-- Edit: hanya jika canEdit -->
                    <q-btn
                      v-if="canEdit"
                      flat
                      round
                      color="blue-8"
                      icon="edit"
                      size="sm"
                      @click.stop="openEditDialog(props.row)"
                      class="hover-blue-btn"
                    >
                      <q-tooltip>Edit Data</q-tooltip>
                    </q-btn>
                    <!-- Hapus: hanya jika canDelete -->
                    <q-btn
                      v-if="canDelete"
                      flat
                      round
                      color="negative"
                      icon="delete_outline"
                      size="sm"
                      @click.stop="confirmHapus(props.row)"
                      class="hover-red-btn"
                    >
                      <q-tooltip>Hapus Tagihan</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:bottom-row>
              <q-tr class="bg-red-1" v-if="filteredRows.length > 0">
                <q-td colspan="4" class="text-right">
                  <div class="text-weight-bolder text-teal-10 uppercase tracking-widest font-11">
                    Total Nilai Tagihan (Sesuai Filter)
                  </div>
                  <div
                    class="text-weight-bold text-negative uppercase tracking-widest font-10 q-mt-xs"
                  >
                    Total Sisa Hutang (Sesuai Filter)
                  </div>
                </q-td>
                <q-td class="text-right">
                  <div class="text-weight-black text-teal-10 text-subtitle2">
                    Rp {{ totalFilteredNominal.toLocaleString('id-ID') }}
                  </div>
                  <div class="text-weight-bold text-negative font-11 q-mt-xs">
                    Rp {{ totalFilteredOutstanding.toLocaleString('id-ID') }}
                  </div>
                </q-td>
                <q-td :colspan="hasAnyAction ? 2 : 1"></q-td>
              </q-tr>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-xl text-grey-5">
                <q-icon name="receipt_long" size="64px" class="q-mb-md" color="teal-3" />
                <div class="text-h6 full-width text-center">
                  Data tidak ditemukan dengan kriteria filter tersebut.
                </div>
              </div>
            </template>
          </q-table>
        </q-card>
      </div>

      <!-- =====================================================================================
         VIEW DETAIL
         ===================================================================================== -->
      <div
        v-else-if="viewMode === 'detail' && selectedTagihan"
        class="animate-fade q-pb-xl content-relative"
      >
        <div class="row items-center justify-between q-mb-xl no-print">
          <div class="row items-center no-wrap">
            <q-btn
              flat
              round
              color="teal-10"
              icon="arrow_back"
              @click="viewMode = 'list'"
              class="q-mr-md bg-white shadow-1 hover-teal-btn"
            />
            <div>
              <div class="text-overline text-grey-6 text-bold tracking-widest q-mb-xs leading-none">
                INFORMASI DETAIL TAGIHAN SUPPLIER (A/P)
              </div>
              <div class="text-h5 text-weight-bolder text-teal-10 leading-tight uppercase">
                Kode: {{ selectedTagihan.kode_tagihan }}
              </div>
            </div>
          </div>
        </div>

        <!-- KERTAS INVOICE (DESAIN PREMIUM DENGAN TEMA TEAL DAN LEBIH INFORMATIF) -->
        <div id="invoice-pdf-target" class="bg-transparent font-pro">
          <div class="row items-center justify-between q-mb-lg no-print">
            <div>
              <div
                class="text-h4 text-weight-bolder text-teal-10 uppercase tracking-widest letter-spacing-1"
              >
                RINCIAN TAGIHAN
              </div>
              <div class="text-subtitle1 text-grey-7 font-bold q-mt-xs">
                {{ selectedTagihan.kode_tagihan }}
              </div>
            </div>
            <q-chip
              :color="getStatusColor(selectedTagihan.status).bg"
              :text-color="getStatusColor(selectedTagihan.status).text"
              class="text-weight-bolder font-11 uppercase shadow-sm q-px-md q-py-sm"
              size="16px"
            >
              STATUS: {{ selectedTagihan.status }}
            </q-chip>
          </div>

          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-7">
              <!-- CARD: REFERENSI DOKUMEN & SUPPLIER -->
              <q-card
                flat
                bordered
                class="rounded-20 shadow-sm q-mb-lg bg-white border-teal-thin"
              >
                <q-card-section class="bg-teal-section text-teal-10 q-py-sm border-bottom-subtle">
                  <div class="text-weight-bold uppercase tracking-widest font-11 flex items-center">
                    <q-icon name="dataset" size="sm" class="q-mr-sm" /> REFERENSI DOKUMEN & SUPPLIER
                  </div>
                </q-card-section>
                <q-card-section class="q-pa-lg">
                  <div class="row q-col-gutter-md">
                    <!-- SUPPLIER -->
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md rounded-12 bg-grey-1 border-subtle row items-center no-wrap h-full">
                        <q-avatar color="teal-1" text-color="teal-9" icon="store" class="q-mr-md" />
                        <div>
                          <div class="text-caption text-grey-6 text-bold uppercase tracking-widest font-10">SUPPLIER / VENDOR</div>
                          <div class="text-subtitle1 text-weight-bolder text-teal-10 uppercase leading-tight q-mt-xs">
                            {{ selectedTagihan.supplier_nama || '-' }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- PROYEK -->
                    <div class="col-12 col-sm-6">
                      <div class="q-pa-md rounded-12 bg-grey-1 border-subtle row items-center no-wrap h-full">
                        <q-avatar color="teal-1" text-color="teal-9" icon="apartment" class="q-mr-md" />
                        <div>
                          <div class="text-caption text-grey-6 text-bold uppercase tracking-widest font-10">DIALOKASIKAN KE PROYEK</div>
                          <div class="text-subtitle1 text-weight-bolder text-grey-8 uppercase leading-tight q-mt-xs">
                            {{ selectedTagihan.proyek_nama || '-' }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- NOMOR PO -->
                    <div class="col-12 col-sm-4">
                      <div class="q-pa-md rounded-12 bg-grey-1 border-subtle row items-center no-wrap h-full">
                        <q-avatar color="teal-1" text-color="teal-9" icon="shopping_bag" class="q-mr-md" size="32px" />
                        <div>
                          <div class="text-caption text-grey-6 text-bold uppercase tracking-widest font-10">NOMOR PO</div>
                          <div class="text-subtitle2 text-weight-bolder text-grey-8 uppercase leading-tight q-mt-xs">
                            {{ selectedTagihan.po_nomor || '-' }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- NOMOR SPK -->
                    <div class="col-12 col-sm-4">
                      <div class="q-pa-md rounded-12 bg-grey-1 border-subtle row items-center no-wrap h-full">
                        <q-avatar color="teal-1" text-color="teal-9" icon="assignment" class="q-mr-md" size="32px" />
                        <div>
                          <div class="text-caption text-grey-6 text-bold uppercase tracking-widest font-10">NOMOR SPK</div>
                          <div class="text-subtitle2 text-weight-bolder text-grey-8 uppercase leading-tight q-mt-xs">
                            {{ selectedTagihan.spk_nomor || '-' }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- NOMINAL PO -->
                    <div class="col-12 col-sm-4">
                      <div class="q-pa-md rounded-12 bg-grey-1 border-subtle row items-center no-wrap h-full">
                        <q-avatar color="teal-1" text-color="teal-9" icon="payments" class="q-mr-md" size="32px" />
                        <div>
                          <div class="text-caption text-grey-6 text-bold uppercase tracking-widest font-10">NOMINAL PO</div>
                          <div class="text-subtitle2 text-weight-bolder text-teal-8 leading-tight q-mt-xs">
                            Rp {{ (selectedTagihan.nominal_po || 0).toLocaleString('id-ID') }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- CARD: SPK & BOQ DETAILS -->
              <q-card
                v-if="selectedTagihan.selected_spk && selectedTagihan.selected_spk.length > 0"
                flat
                bordered
                class="rounded-20 shadow-sm q-mb-lg bg-white border-teal-thin"
              >
                <q-card-section class="bg-teal-section text-teal-10 q-py-sm border-bottom-subtle">
                  <div class="text-weight-bold uppercase tracking-widest font-11 flex items-center">
                    <q-icon name="description" size="sm" class="q-mr-sm" /> DETAIL SPK & BOQ
                  </div>
                </q-card-section>
                <q-card-section class="q-pa-lg q-gutter-y-md">
                  <div
                    v-for="(spkId, idx) in selectedTagihan.selected_spk"
                    :key="idx"
                    class="q-pa-md rounded-12 bg-grey-1 border-subtle border-left-teal"
                  >
                    <div class="text-weight-black text-teal-10 q-mb-sm row items-center font-13">
                      <q-icon name="assignment" size="18px" color="teal-8" class="q-mr-xs" />
                      {{ getSpkById(spkId)?.nomor_spk || 'SPK' }}
                      <span class="text-weight-medium text-grey-7 q-ml-xs">— {{ getSpkById(spkId)?.nama_kontrak || '' }}</span>
                    </div>
                    
                    <div
                      v-if="
                        selectedTagihan.spk_boq_selection &&
                        selectedTagihan.spk_boq_selection[spkId]
                      "
                      class="q-pl-md q-mt-sm border-left-dashed"
                    >
                      <div
                        v-if="
                          selectedTagihan.spk_boq_selection[spkId].selected_groups &&
                          selectedTagihan.spk_boq_selection[spkId].selected_groups.length
                        "
                        class="q-gutter-y-sm"
                      >
                        <div
                          v-for="(groupTitle, gIdx) in selectedTagihan.spk_boq_selection[spkId]
                            .selected_groups"
                          :key="gIdx"
                          class="bg-white q-pa-md rounded-8 border-subtle"
                        >
                          <div class="text-weight-black text-caption text-teal-9 q-mb-xs uppercase tracking-wider font-10">
                            Kategori: {{ groupTitle }}
                          </div>
                          <div
                            v-if="
                              selectedTagihan.spk_boq_selection[spkId].selected_items_by_group &&
                              selectedTagihan.spk_boq_selection[spkId].selected_items_by_group[
                                groupTitle
                              ] &&
                              selectedTagihan.spk_boq_selection[spkId].selected_items_by_group[
                                groupTitle
                              ].length
                            "
                          >
                            <div class="row q-col-gutter-xs q-mt-xs">
                              <div
                                v-for="(item, iIdx) in selectedTagihan.spk_boq_selection[spkId]
                                  .selected_items_by_group[groupTitle]"
                                :key="iIdx"
                                class="col-12 flex items-center q-py-xs"
                                style="font-size: 11.5px; color: #444;"
                              >
                                <q-icon name="subdirectory_arrow_right" size="14px" color="teal-6" class="q-mr-xs" />
                                <span class="text-weight-bold text-grey-9">{{ item }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- CARD: TIMELINE -->
              <q-card
                flat
                bordered
                class="rounded-20 shadow-sm q-mb-lg bg-white border-teal-thin"
              >
                <q-card-section class="bg-teal-section text-teal-10 q-py-sm border-bottom-subtle">
                  <div class="text-weight-bold uppercase tracking-widest font-11 flex items-center">
                    <q-icon name="timeline" size="sm" class="q-mr-sm" /> INVOICE SUPPLIER & TIMELINE
                  </div>
                </q-card-section>
                <q-card-section class="q-pa-lg">
                  <div class="row q-col-gutter-md">
                    <!-- INVOICE -->
                    <div class="col-12 col-sm-4">
                      <div class="q-pa-md rounded-12 bg-grey-1 border-subtle row items-center no-wrap h-full">
                        <q-avatar color="teal-1" text-color="teal-9" icon="receipt" class="q-mr-md" size="32px" />
                        <div>
                          <div class="text-caption text-grey-6 text-bold uppercase tracking-widest font-10">NO. INVOICE</div>
                          <div class="text-subtitle2 text-weight-bold text-teal-10 leading-tight q-mt-xs">
                            {{ selectedTagihan.nomor_invoice || '-' }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- TGL INVOICE -->
                    <div class="col-12 col-sm-4">
                      <div class="q-pa-md rounded-12 bg-grey-1 border-subtle row items-center no-wrap h-full">
                        <q-avatar color="teal-1" text-color="teal-9" icon="calendar_month" class="q-mr-md" size="32px" />
                        <div>
                          <div class="text-caption text-grey-6 text-bold uppercase tracking-widest font-10">TGL INVOICE</div>
                          <div class="text-subtitle2 text-weight-bold text-grey-8 leading-tight q-mt-xs">
                            {{ formatDateIndo(selectedTagihan.tanggal_invoice) }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- JATUH TEMPO -->
                    <div class="col-12 col-sm-4">
                      <div class="q-pa-md rounded-12 bg-grey-1 border-subtle row items-center no-wrap h-full">
                        <q-avatar color="red-1" text-color="negative" icon="event_busy" class="q-mr-md" size="32px" />
                        <div>
                          <div class="text-caption text-grey-6 text-bold uppercase tracking-widest font-10">JATUH TEMPO</div>
                          <div class="text-subtitle2 text-weight-bold text-negative leading-tight q-mt-xs">
                            {{ formatDateIndo(selectedTagihan.jatuh_tempo) }}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="col-12"><q-separator class="border-subtle q-my-xs" /></div>
                    
                    <!-- KETERANGAN -->
                    <div class="col-12">
                      <div class="q-pa-md rounded-12 bg-grey-1 border-subtle">
                        <div class="text-caption text-grey-6 text-bold uppercase tracking-widest font-10 row items-center">
                          <q-icon name="notes" size="sm" color="teal-8" class="q-mr-xs" />
                          DESKRIPSI / KETERANGAN TAGIHAN
                        </div>
                        <div class="text-body2 text-grey-9 q-mt-sm font-13" style="line-height: 1.6">
                          {{ selectedTagihan.keterangan || '-' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- CARD: LAMPIRAN -->
              <q-card
                v-if="selectedTagihan?.lampiran && selectedTagihan.lampiran.length > 0"
                flat
                bordered
                class="rounded-20 shadow-sm bg-white border-teal-thin q-mt-lg no-print"
              >
                <q-card-section class="bg-teal-section text-teal-10 q-py-sm border-bottom-subtle">
                  <div class="text-weight-bold uppercase tracking-widest font-11 flex items-center">
                    <q-icon name="attachment" size="sm" class="q-mr-sm" /> LAMPIRAN DOKUMEN
                  </div>
                </q-card-section>
                <q-card-section class="q-pa-md">
                  <q-list separator class="rounded-12 overflow-hidden border-subtle bg-grey-1">
                    <q-item
                      v-for="(doc, dIdx) in selectedTagihan.lampiran"
                      :key="dIdx"
                      clickable
                      v-ripple
                      @click="openLink(doc.url || doc.base64)"
                      class="q-py-md hover-bg"
                    >
                      <q-item-section avatar>
                        <q-avatar color="teal-1" text-color="teal-10" icon="description" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold text-grey-9">{{
                          doc.label || 'Dokumen ' + (dIdx + 1)
                        }}</q-item-label>
                        <q-item-label caption>Klik untuk melihat berkas lampiran</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-icon name="open_in_new" color="teal" size="xs" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-5">
              <!-- CARD: KEUANGAN -->
              <q-card
                flat
                bordered
                class="rounded-20 shadow-sm bg-white border-teal-thin overflow-hidden"
              >
                <div class="bg-teal-gradient text-white q-pa-lg text-center">
                  <div class="text-overline text-teal-1 text-bold tracking-widest uppercase opacity-90">
                    GRAND TOTAL TAGIHAN
                  </div>
                  <div class="text-h3 text-weight-black q-mt-sm">
                    Rp {{ (selectedTagihan.grand_total || 0).toLocaleString('id-ID') }}
                  </div>
                </div>

                <q-card-section class="q-pa-lg">
                  <div
                    class="text-weight-bold text-teal-10 q-mb-md uppercase tracking-widest font-11 row items-center"
                  >
                    <q-icon name="calculate" size="16px" class="q-mr-xs" /> RINCIAN KALKULASI PAJAK
                  </div>

                  <div class="row justify-between items-center q-mb-sm font-13">
                    <div class="text-grey-7 text-weight-medium">Nominal Invoice</div>
                    <div class="text-weight-bold text-grey-9">
                      Rp {{ (selectedTagihan.nominal_invoice || 0).toLocaleString('id-ID') }}
                    </div>
                  </div>
                  <q-separator class="q-my-sm border-subtle" />
                  <div class="row justify-between items-center q-mb-sm font-13">
                    <div class="text-grey-7 text-weight-medium">DPP</div>
                    <div class="text-weight-bold text-grey-9">
                      Rp {{ (selectedTagihan.nilai_dpp || 0).toLocaleString('id-ID') }}
                    </div>
                  </div>
                  <div class="row justify-between items-center q-mb-sm font-13">
                    <div class="text-grey-7 text-weight-medium">
                      PPN ({{ selectedTagihan.ppn_persen || 0 }}%)
                    </div>
                    <div class="text-weight-bold text-positive">
                      + Rp {{ (selectedTagihan.ppn_nominal || 0).toLocaleString('id-ID') }}
                    </div>
                  </div>
                  <div class="row justify-between items-center q-mb-md font-13">
                    <div class="text-grey-7 text-weight-medium">
                      PPh Potongan ({{ selectedTagihan.pph_persen || 0 }}%)
                    </div>
                    <div class="text-weight-bold text-negative">
                      - Rp {{ (selectedTagihan.pph_nominal || 0).toLocaleString('id-ID') }}
                    </div>
                  </div>

                  <q-separator class="q-my-lg border-subtle" />

                  <div class="row justify-between items-center q-mb-sm no-print">
                    <div class="text-weight-bold text-teal-10 uppercase tracking-widest font-11 row items-center">
                      <q-icon name="account_balance_wallet" size="16px" class="q-mr-xs" /> STATUS PEMBAYARAN
                    </div>
                    <div class="row q-gutter-sm">
                      <!-- Tombol Ajukan Tagihan -->
                      <q-btn
                        v-if="canEdit && selectedTagihan.status === 'Draft'"
                        unelevated
                        rounded
                        size="xs"
                        color="teal-10"
                        icon="send"
                        label="Ajukan"
                        class="q-px-sm"
                        @click="ajukanTagihan"
                      />
                      <!-- Tombol Update Pembayaran -->
                      <q-btn
                        v-if="
                          (canApprove || canEdit) &&
                          selectedTagihan.status !== 'Lunas' &&
                          selectedTagihan.status !== 'Draft'
                        "
                        outline
                        rounded
                        size="xs"
                        color="teal-10"
                        icon="add"
                        label="Update Bayar"
                        class="q-px-sm"
                        @click="openPaymentDialog"
                      />
                    </div>
                  </div>

                  <!-- PROGRESS BAR PEMBAYARAN -->
                  <div class="q-mb-md">
                    <div class="row justify-between text-caption text-grey-6 q-mb-xs font-10">
                      <span>Progres Pelunasan</span>
                      <span class="text-weight-bold text-teal-10">
                        {{ ((selectedTagihan.total_dibayar || 0) / (selectedTagihan.grand_total || 1) * 100).toFixed(0) }}%
                      </span>
                    </div>
                    <q-linear-progress
                      :value="(selectedTagihan.total_dibayar || 0) / (selectedTagihan.grand_total || 1)"
                      color="teal"
                      track-color="teal-1"
                      rounded
                      size="8px"
                    />
                  </div>

                  <div class="row justify-between items-center q-mb-xs font-13">
                    <div class="text-grey-7 text-weight-medium">Telah Dibayar</div>
                    <div class="text-weight-bolder text-teal-8">
                      Rp {{ selectedTagihan.total_dibayar.toLocaleString('id-ID') }}
                    </div>
                  </div>
                  <div class="row justify-between items-center font-13">
                    <div class="text-grey-7 text-weight-medium">Sisa Tagihan</div>
                    <div
                      class="text-weight-bolder"
                      :class="selectedTagihan.sisa_tagihan > 0 ? 'text-negative' : 'text-positive'"
                    >
                      Rp {{ selectedTagihan.sisa_tagihan.toLocaleString('id-ID') }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- CARD: RIWAYAT PEMBAYARAN -->
              <q-card
                flat
                bordered
                class="rounded-20 shadow-sm bg-white border-teal-thin q-mt-lg no-print"
              >
                <q-card-section class="bg-teal-section text-teal-10 q-py-sm border-bottom-subtle">
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
                    class="rounded-12 overflow-hidden border-subtle bg-grey-1"
                  >
                    <q-item v-for="(hist, idx) in selectedTagihan.riwayat_pembayaran" :key="idx" class="q-py-md">
                      <q-item-section avatar>
                        <q-avatar color="teal-1" text-color="teal-9" icon="payments" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bolder text-teal-10"
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
                            icon="open_in_new"
                            color="teal"
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
         VIEW FORM ENTRY / EDIT
         ===================================================================================== -->
      <div v-else-if="viewMode === 'form'" class="animate-fade content-relative">
        <div class="row items-center justify-between q-mb-xl no-print">
          <div class="col-12 col-md-8">
            <div class="row items-center no-wrap">
              <q-btn
                flat
                round
                color="teal-10"
                icon="arrow_back"
                @click="viewMode = 'list'"
                class="q-mr-md bg-white shadow-1 hover-teal-btn"
              />
              <div>
                <div class="text-h4 text-weight-bolder text-teal-10 leading-tight uppercase">
                  {{ isEditMode ? 'Edit Data Tagihan' : 'Entry Tagihan Supplier (A/P)' }}
                </div>
                <div class="text-subtitle1 text-grey-7 q-mt-sm">
                  Isi formulir tagihan dari vendor dengan lengkap dan benar sesuai dokumen asli.
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-auto q-mt-md q-mt-md-none text-right">
            <q-btn
              unelevated
              color="teal-10"
              icon="save"
              label="SIMPAN DOKUMEN"
              @click="simpanTagihan"
              :loading="submitting"
              rounded
              class="q-px-xl text-weight-bold shadow-premium btn-teal-main"
            />
          </div>
        </div>

        <div class="row justify-center">
          <div class="col-12 col-xl-10">
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-5">
                <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1 border-teal-thin">
                  <q-card-section
                    class="bg-teal-section q-py-sm text-teal-10 text-weight-bold flex items-center border-bottom"
                  >
                    <q-icon name="receipt_long" class="q-mr-xs" size="sm" /> REFERENSI PO & SUPPLIER
                  </q-card-section>
                  <q-card-section class="q-pa-lg q-gutter-y-md">
                    <div>
                      <div class="label-req q-mb-xs">Kode Tagihan Supplier (Auto Generate)</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.kode_tagihan"
                        readonly
                        bg-color="grey-2"
                        color="teal-10"
                        class="text-weight-bold text-teal-10"
                      />
                    </div>
                    <div>
                      <div class="label-req q-mb-xs text-primary">
                        Data Purchase Order (Opsional)
                      </div>
                      <q-select
                        outlined
                        dense
                        v-model="form.po_ref"
                        :options="optPO"
                        option-label="nomor"
                        placeholder="Pilih PO..."
                        bg-color="blue-50"
                        color="teal-10"
                        clearable
                        @update:model-value="onPoSelect"
                      >
                        <template v-slot:option="scope">
                          <q-item v-bind="scope.itemProps">
                            <q-item-section>
                              <q-item-label class="text-weight-bold">{{
                                scope.opt.nomor
                              }}</q-item-label>
                              <q-item-label caption
                                >{{ scope.opt.kepada_yth }} |
                                {{ scope.opt.proyek_nama }}</q-item-label
                              >
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>
                    <div>
                      <div class="label-req q-mb-xs">Tanggal PO</div>
                      <q-input
                        outlined
                        dense
                        type="date"
                        v-model="form.po_tanggal"
                        readonly
                        color="teal-10"
                        bg-color="grey-2"
                      />
                    </div>
                    <div>
                      <div class="label-req q-mb-xs">Supplier / Penagih *</div>
                      <q-select
                        outlined
                        dense
                        v-model="form.supplier"
                        :options="optSupplier"
                        option-label="nama"
                        bg-color="white"
                        color="teal-10"
                        use-input
                        @filter="filterSupplier"
                      />
                    </div>
                    <div>
                      <div class="label-req q-mb-xs">Nominal PO</div>
                      <q-input
                        outlined
                        dense
                        type="number"
                        v-model.number="form.nominal_po"
                        readonly
                        bg-color="grey-2"
                        color="teal-10"
                        prefix="Rp"
                        class="text-weight-bold text-grey-9"
                      />
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-12">
                        <div class="label-req q-mb-xs">Referensi Proyek</div>
                        <!--
                        ✅ MENYEMATKAN emit-value & map-options AGAR PROYEK ID
                        DITRANSMISIKAN SEBAGAI STRING, BUKAN SEBAGAI OBJEK
                      -->
                        <q-select
                          outlined
                          dense
                          v-model="form.proyek_id"
                          :options="allProyek"
                          option-label="nama"
                          option-value="id"
                          emit-value
                          map-options
                          placeholder="Pilih Proyek..."
                          bg-color="white"
                          color="teal-10"
                          clearable
                          @update:model-value="onProyekSelect"
                        >
                          <template v-slot:selected-item="scope">
                            <q-item-section>
                              <q-item-label>{{ scope.opt.nama }}</q-item-label>
                            </q-item-section>
                          </template>
                          <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                              <q-item-section>
                                <q-item-label>{{ scope.opt.nama }}</q-item-label>
                              </q-item-section>
                            </q-item>
                          </template>
                        </q-select>
                      </div>
                    </div>
                    <div v-if="form.proyek_id">
                      <div class="label-req q-mb-xs">Pilih SPK (Bisa Lebih dari 1)</div>
                      <!--
                      ✅ MENYEMATKAN emit-value & map-options AGAR SPK ID
                      DITRANSMISIKAN SEBAGAI STRING DALAM ARRAY form.selected_spk
                    -->
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
                        bg-color="white"
                        color="teal-10"
                        clearable
                        use-chips
                      >
                        <template v-slot:option="scope">
                          <q-item v-bind="scope.itemProps">
                            <q-item-section>
                              <q-item-label class="text-weight-bold">
                                {{
                                  scope.opt.nomor_spk ||
                                  scope.opt.nama_kontrak ||
                                  `SPK: ${scope.opt.id}`
                                }}
                              </q-item-label>
                              <q-item-label caption>{{
                                scope.opt.nama_kontrak || scope.opt.id
                              }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                        <template v-slot:selected-item="scope">
                          <q-item-section>
                            <q-item-label>{{
                              scope.opt.nomor_spk ||
                              scope.opt.nama_kontrak ||
                              `SPK: ${scope.opt.id}`
                            }}</q-item-label>
                          </q-item-section>
                        </template>
                      </q-select>
                    </div>
                    <div
                      v-if="form.selected_spk && form.selected_spk.length && form.spk_boq_selection"
                    >
                      <div class="label-req q-mb-xs">Pilih Detail BOQ per SPK</div>
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
                            <div class="label-req q-mb-xs">Pilih Kategori BOQ</div>
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
                              bg-color="white"
                              color="teal-10"
                              clearable
                              use-chips
                              use-input
                            />
                            <div
                              v-if="form.spk_boq_selection[spkId].selected_groups.length"
                              class="q-mt-md"
                            >
                              <div class="label-req q-mb-xs">Pilih Item BOQ</div>
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
                                      form.spk_boq_selection[spkId].selected_items_by_group[
                                        groupTitle
                                      ]
                                    "
                                    :options="getSpkBoqGroupItems(spkId, groupTitle)"
                                    option-label="deskripsi"
                                    option-value="deskripsi"
                                    placeholder="Pilih Item..."
                                    bg-color="white"
                                    color="teal-10"
                                    clearable
                                    use-chips
                                    use-input
                                  />
                                </div>
                              </div>
                            </div>
                          </template>
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-7">
                <q-card
                  flat
                  bordered
                  class="rounded-20 bg-white shadow-1 overflow-hidden border-teal-thin"
                >
                  <q-card-section
                    class="bg-teal-10 q-py-sm text-white text-weight-bold flex items-center border-bottom"
                  >
                    <q-icon name="calculate" class="q-mr-xs" size="sm" /> RINCIAN INVOICE SUPPLIER
                  </q-card-section>

                  <q-card-section class="q-pa-lg q-gutter-y-md">
                    <div>
                      <div class="label-req q-mb-xs">Nomor Invoice Supplier *</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.nomor_invoice"
                        bg-color="white"
                        color="teal-10"
                        placeholder="INV-..."
                        class="text-weight-bold"
                      />
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-6">
                        <div class="label-req q-mb-xs">Tgl Invoice *</div>
                        <q-input
                          outlined
                          dense
                          type="date"
                          color="teal-10"
                          v-model="form.tanggal_invoice"
                          bg-color="white"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <div class="label-req q-mb-xs">Nominal Invoice (Rp) *</div>
                        <q-input
                          outlined
                          dense
                          type="number"
                          color="teal-10"
                          v-model.number="form.nominal_invoice"
                          bg-color="white"
                          class="text-weight-bold text-h6 text-teal-10"
                          prefix="Rp"
                        />
                      </div>
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-6">
                        <div class="label-req q-mb-xs">Tgl Jatuh Tempo *</div>
                        <q-input
                          outlined
                          dense
                          type="date"
                          color="teal-10"
                          v-model="form.jatuh_tempo"
                          bg-color="white"
                        />
                      </div>
                    </div>
                    <div>
                      <div class="label-req q-mb-xs">Deskripsi Tagihan</div>
                      <q-input
                        outlined
                        dense
                        type="textarea"
                        rows="3"
                        color="teal-10"
                        v-model="form.keterangan"
                        bg-color="white"
                        placeholder="Misal: Pembayaran material semen proyek A..."
                      />
                    </div>

                    <q-separator class="q-my-lg border-subtle" />

                    <div>
                      <div class="row items-center justify-between q-mb-sm">
                        <div class="label-req">DOKUMEN LAMPIRAN</div>
                        <q-btn
                          round
                          unelevated
                          color="teal-10"
                          icon="add"
                          size="sm"
                          @click="addDocRow"
                        />
                      </div>
                      <div class="text-caption text-grey-7 q-mb-md">
                        Upload invoice asli, faktur pajak, surat jalan, atau BAST.
                      </div>
                      <div class="bg-teal-50 q-pa-sm rounded-12 border-dashed-teal">
                        <div
                          v-for="(item, index) in form.lampiran"
                          :key="index"
                          class="q-mb-sm q-pa-sm bg-white rounded-borders shadow-1"
                        >
                          <div class="row q-col-gutter-sm items-center">
                            <div class="col-12 col-md-5">
                              <q-input
                                outlined
                                dense
                                color="teal-10"
                                v-model="item.label"
                                placeholder="ex: Invoice Asli"
                              />
                            </div>
                            <div class="col-12 col-md-6">
                              <q-file
                                outlined
                                dense
                                color="teal-10"
                                v-model="item.fileObj"
                                label="Pilih File"
                              >
                                <template v-slot:prepend
                                  ><q-icon name="attach_file" size="xs"
                                /></template>
                                <template v-slot:append v-if="item.url || item.base64">
                                  <q-icon name="check_circle" color="positive" size="xs" />
                                </template>
                              </q-file>
                            </div>
                            <div class="col-12 col-md-1 text-center">
                              <q-btn
                                flat
                                round
                                dense
                                color="negative"
                                icon="delete"
                                size="sm"
                                @click="removeDocRow(index)"
                              />
                            </div>
                          </div>
                        </div>
                        <div
                          v-if="!form.lampiran.length"
                          class="text-center q-pa-md text-grey-5 italic"
                        >
                          Belum ada dokumen yang dilampirkan
                        </div>
                      </div>
                    </div>

                    <q-separator class="q-my-lg border-subtle" />

                    <div class="row q-col-gutter-md">
                      <div class="col-6">
                        <div class="label-req q-mb-xs">PPN (%)</div>
                        <q-input
                          outlined
                          dense
                          type="number"
                          color="teal-10"
                          v-model.number="form.ppn_persen"
                          bg-color="white"
                          suffix="%"
                        />
                      </div>
                      <div class="col-6">
                        <div class="label-req q-mb-xs">Nominal PPN (+)</div>
                        <q-input
                          outlined
                          dense
                          v-model="calculatedPpn"
                          readonly
                          color="teal-10"
                          bg-color="grey-2"
                          prefix="Rp"
                        />
                      </div>
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-6">
                        <div class="label-req q-mb-xs">PPh (%)</div>
                        <q-input
                          outlined
                          dense
                          type="number"
                          color="teal-10"
                          v-model.number="form.pph_persen"
                          bg-color="white"
                          suffix="%"
                        />
                      </div>
                      <div class="col-6">
                        <div class="label-req q-mb-xs">Nominal PPh Potong (-)</div>
                        <q-input
                          outlined
                          dense
                          color="teal-10"
                          v-model="calculatedPph"
                          readonly
                          bg-color="grey-2"
                          prefix="Rp"
                        />
                      </div>
                    </div>
                  </q-card-section>

                  <div class="bg-blue-grey-10 text-white q-pa-lg text-right">
                    <div class="text-overline opacity-80 uppercase tracking-widest">
                      GRAND TOTAL TAGIHAN
                    </div>
                    <div class="text-h3 text-weight-black">
                      Rp {{ formatCompact(calculatedGrandTotal) }}
                    </div>
                  </div>
                </q-card>
              </div>
            </div>
          </div>
        </div>
        <div class="q-py-xl"></div>
      </div>
    </div>

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
          <q-toolbar-title class="text-weight-black uppercase">UPDATE PEMBAYARAN</q-toolbar-title>
          <q-btn
            unelevated
            color="white"
            text-color="teal-10"
            label="SIMPAN PEMBAYARAN"
            class="q-px-xl text-weight-black shadow-2"
            rounded
            @click="savePayment"
            :loading="savingPayment"
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
                    outlined
                    dense
                    type="date"
                    color="teal-10"
                    v-model="paymentForm.tanggal"
                    label="Tanggal Pembayaran *"
                    stack-label
                    bg-color="white"
                    class="col-12 col-md-6"
                  />
                  <q-input
                    outlined
                    dense
                    type="number"
                    color="teal-10"
                    v-model.number="paymentForm.nominal"
                    label="Nominal Dibayar (Rp) *"
                    prefix="Rp"
                    input-class="text-weight-bold text-teal-10"
                    bg-color="white"
                    class="col-12 col-md-6"
                  />
                  <q-input
                    outlined
                    dense
                    type="textarea"
                    color="teal-10"
                    rows="3"
                    v-model="paymentForm.catatan"
                    label="Catatan / Keterangan (Opsional)"
                    placeholder="Contoh: DP 50% Termin 1..."
                    bg-color="white"
                    class="col-12"
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
                      color="teal-10"
                      v-model="paymentForm.bukti_file"
                      label="Upload Bukti Pembayaran (Foto/PDF)"
                      accept="image/*, .pdf"
                      bg-color="white"
                      class="bg-teal-50"
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

    <!-- Hidden PDF Export Table -->
    <div style="position: absolute; top: -9999px; left: -9999px; width: 794px; z-index: -1">
      <div id="table-pdf-export" class="bg-white q-pa-lg">
        <div class="row items-center q-mb-lg border-bottom-subtle q-pb-md">
          <q-avatar
            color="teal-10"
            text-color="white"
            icon="receipt_long"
            size="48px"
            class="q-mr-md shadow-sm"
          />
          <div>
            <div class="text-h4 text-weight-black text-teal-10 uppercase tracking-widest">
              Laporan Tagihan Supplier (A/P)
            </div>
            <div class="text-subtitle1 text-grey-8 font-weight-medium q-mt-xs">
              Diekspor pada: {{ new Date().toLocaleString('id-ID') }}
            </div>
          </div>
        </div>

        <!-- 3-COLUMN SUMMARY TABLE (PDF) -->
        <div style="margin-bottom: 25px; display: flex;">
          <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 10px; border: 1.5px solid #004d40; table-layout: fixed;">
            <thead>
              <tr style="background-color: #00796b; color: white;">
                <th width="40%" style="padding: 8px; text-align: left; font-weight: bold; border: 1px solid #004d40; text-transform: uppercase;">STATUS TAGIHAN</th>
                <th width="20%" style="padding: 8px; text-align: center; font-weight: bold; border: 1px solid #004d40; text-transform: uppercase;">JUMLAH DOKUMEN</th>
                <th width="40%" style="padding: 8px; text-align: right; font-weight: bold; border: 1px solid #004d40; text-transform: uppercase;">TOTAL NOMINAL</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background-color: #fff8e1;">
                <td style="padding: 8px; border: 1px solid #ffb300; font-weight: bold; color: #b78103;">Sedang Diajukan</td>
                <td style="padding: 8px; border: 1px solid #ffb300; text-align: center; font-weight: bold; color: #b78103;">{{ summaryDiajukan.count }}</td>
                <td style="padding: 8px; border: 1px solid #ffb300; text-align: right; font-weight: bold; color: #b78103;">Rp {{ summaryDiajukan.total.toLocaleString('id-ID') }}</td>
              </tr>
              <tr style="background-color: #ffebee;">
                <td style="padding: 8px; border: 1px solid #ef5350; font-weight: bold; color: #c62828;">Ditolak</td>
                <td style="padding: 8px; border: 1px solid #ef5350; text-align: center; font-weight: bold; color: #c62828;">{{ summaryDitolak.count }}</td>
                <td style="padding: 8px; border: 1px solid #ef5350; text-align: right; font-weight: bold; color: #c62828;">Rp {{ summaryDitolak.total.toLocaleString('id-ID') }}</td>
              </tr>
              <tr style="background-color: #e8f5e9;">
                <td style="padding: 8px; border: 1px solid #66bb6a; font-weight: bold; color: #2e7d32;">Sudah Cair (Lunas / Sebagian)</td>
                <td style="padding: 8px; border: 1px solid #66bb6a; text-align: center; font-weight: bold; color: #2e7d32;">{{ summarySudahCair.count }}</td>
                <td style="padding: 8px; border: 1px solid #66bb6a; text-align: right; font-weight: bold; color: #2e7d32;">Rp {{ summarySudahCair.total.toLocaleString('id-ID') }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <table class="pdf-export-table">
          <thead>
            <tr>
              <th width="5%">NO</th>
              <th width="12%">KODE & INVOICE</th>
              <th width="15%">VENDOR</th>
              <th width="15%">PROYEK & PO</th>
              <th width="25%">DETAIL BOQ & SPK</th>
              <th width="12%">TIMELINE</th>
              <th width="11%" class="text-right">GRAND TOTAL</th>
              <th width="5%">STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in filteredRows" :key="idx">
              <td class="text-center font-bold">{{ idx + 1 }}</td>
              <td>
                <div class="text-weight-bold">{{ row.kode_tagihan || '-' }}</div>
                <div class="text-caption text-grey-7">{{ row.nomor_invoice || '-' }}</div>
              </td>
              <td class="text-weight-bold uppercase">{{ row.supplier_nama || '-' }}</td>
              <td>
                <div class="text-weight-bold uppercase">
                  {{ row.proyek_nama || 'NON-PROYEK' }}
                </div>
                <div class="text-caption text-grey-7">PO: {{ row.po_nomor || '-' }}</div>
              </td>
              <td>
                <div v-if="row.selected_spk && row.selected_spk.length > 0">
                  <div v-for="(spkId, sIdx) in row.selected_spk" :key="sIdx" class="q-mb-sm">
                    <div class="text-weight-bold font-10 text-teal-10">
                      SPK: {{ getSpkById(spkId)?.nomor_spk || spkId }}
                    </div>
                    <div v-if="row.spk_boq_selection && row.spk_boq_selection[spkId]">
                      <div
                        v-for="(groupTitle, gIdx) in row.spk_boq_selection[spkId].selected_groups"
                        :key="gIdx"
                        class="q-pl-sm q-mt-xs"
                      >
                        <div class="text-weight-medium font-9 text-grey-9">
                          Kategori: {{ groupTitle }}
                        </div>
                        <ul
                          style="
                            margin: 0;
                            padding-left: 15px;
                            font-size: 9px;
                            color: #555;
                            list-style-type: disc;
                          "
                        >
                          <li
                            v-for="(item, iIdx) in row.spk_boq_selection[spkId]
                              .selected_items_by_group[groupTitle]"
                            :key="iIdx"
                          >
                            {{ item }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-grey-6 italic font-9">-</div>
              </td>
              <td>
                <div class="font-10">Inv: {{ formatDateIndo(row.tanggal_invoice) }}</div>
                <div class="font-10 text-negative">JT: {{ formatDateIndo(row.jatuh_tempo) }}</div>
              </td>
              <td class="text-right text-weight-bold">
                Rp {{ (row.grand_total || 0).toLocaleString('id-ID') }}
              </td>
              <td class="text-center">
                <div style="font-size: 10px; font-weight: bold; text-transform: uppercase">
                  {{ row.status }}
                </div>
              </td>
            </tr>
            <tr v-if="filteredRows.length === 0">
              <td colspan="8" class="text-center q-pa-xl text-grey-6 italic">
                Tidak ada data tagihan.
              </td>
            </tr>
            <tr v-if="filteredRows.length > 0" style="background-color: #e0f2f1">
              <td colspan="6" class="text-right">
                <div class="text-weight-bold uppercase" style="color: #004d40">
                  Total Nilai Tagihan
                </div>
                <div class="text-weight-bold text-negative uppercase q-mt-xs">
                  Total Sisa Hutang
                </div>
              </td>
              <td class="text-right">
                <div class="text-weight-bold text-teal-10">
                  Rp {{ totalFilteredNominal.toLocaleString('id-ID') }}
                </div>
                <div class="text-weight-bold text-negative q-mt-xs">
                  Rp {{ totalFilteredOutstanding.toLocaleString('id-ID') }}
                </div>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>

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
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const authStore = useAuthStore()

// ============================================================================
// HAK AKSES
// ============================================================================
const currentUserData = ref(null)

const userPermission = ref({
  lihat: false,
  buat: false,
  ubah: false,
  hapus: false,
  approve: false,
})

const SUPER_ROLES = ['super admin', 'superadmin', 'direktur', 'owner']
const isSuperAdmin = computed(() => {
  // Lapis 1: Cek flag is_super_admin dari Firestore (paling reliable)
  if (currentUserData.value?.is_super_admin === true) return true

  // Lapis 2: Cek jabatan dari userData Firestore (realtime)
  const jabatan = (currentUserData.value?.jabatan || '').toLowerCase().trim()
  if (jabatan && SUPER_ROLES.includes(jabatan)) return true

  // Lapis 3: Fallback ke authStore role (untuk kompatibilitas)
  const roleFromAuth = (authStore.user?.role || '').toLowerCase().trim()
  if (roleFromAuth && SUPER_ROLES.includes(roleFromAuth)) return true

  return false
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

  // Cari menu dengan ID standar terlebih dahulu, fallback ke pencarian string label
  const menuTagihanSupplier = modulKonstruksi.menus?.find(
    (menu) => menu.id === '_konstruksi_finance_tagihan-supplier'
  ) || modulKonstruksi.menus?.find((menu) => {
    const lbl = (menu.label || '').toLowerCase()
    return lbl.includes('tagihan') && lbl.includes('supplier')
  })

  if (!menuTagihanSupplier) {
    userPermission.value = { lihat: false, buat: false, ubah: false, hapus: false, approve: false }
    return
  }

  userPermission.value = {
    lihat: menuTagihanSupplier.lihat || false,
    buat: menuTagihanSupplier.buat || false,
    ubah: menuTagihanSupplier.ubah || false,
    hapus: menuTagihanSupplier.hapus || false,
    approve: menuTagihanSupplier.approve || false,
  }
}

const canView = computed(() => isSuperAdmin.value || userPermission.value.lihat)
const canCreate = computed(() => isSuperAdmin.value || userPermission.value.buat)
const canEdit = computed(() => isSuperAdmin.value || userPermission.value.ubah)
const canDelete = computed(() => isSuperAdmin.value || userPermission.value.hapus)
const canApprove = computed(() => isSuperAdmin.value || userPermission.value.approve)

const hasAnyAction = computed(() => canView.value || canEdit.value || canDelete.value)

const computedColumns = computed(() => {
  const cols = [...columns]
  if (!hasAnyAction.value) return cols.filter((c) => c.name !== 'aksi')
  return cols
})

const loadUserPermission = () => {
  const auth = getAuth()
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      currentUserData.value = null
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
        currentUserData.value = karyawanData
        resolvePermission(karyawanData)
        onSnapshot(doc(db, 'karyawan', snap.docs[0].id), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data()
            currentUserData.value = data
            resolvePermission(data)
          }
        })
      } else {
        currentUserData.value = null
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
      currentUserData.value = null
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
// STATE
// ============================================================================
const viewMode = ref('list')
const rows = ref([])
const loading = ref(true)
const submitting = ref(false)
const searchQuery = ref('')
const statusFilter = ref('ALL')
const filterStartDate = ref('')
const filterEndDate = ref('')
const filterSelectedProyek = ref([])
const filterSelectedVendor = ref([])
const isEditMode = ref(false)
const selectedTagihan = ref(null)

const showPaymentDialog = ref(false)
const savingPayment = ref(false)
const paymentForm = ref({
  tanggal: new Date().toISOString().substr(0, 10),
  nominal: 0,
  catatan: '',
  bukti_file: null,
})

const optSupplier = ref([])
const allSupplier = ref([])
const allProyek = ref([])
const allSpk = ref([])
const optProyek = ref([])
const optProyekFilter = ref([])
const optVendorFilter = ref([])
const optPO = ref([])

let unsubTagihan = null
let unsubAllSpk = null
let unsubPengajuan = null

const formDefault = {
  id: null,
  kode_tagihan: '',
  po_ref: null,
  po_nomor: '',
  po_tanggal: '',
  nominal_po: 0,
  supplier: null,
  nomor_invoice: '',
  tanggal_invoice: new Date().toISOString().substr(0, 10),
  nominal_invoice: 0,
  jatuh_tempo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
  keterangan: '',
  proyek_id: null,
  proyek_nama: '',
  selected_spk: [],
  spk_boq_selection: {},
  ppn_persen: 0,
  pph_persen: 0,
  status: 'Sedang Diajukan',
  lampiran: [],
}
const form = ref({ ...formDefault })

const columns = [
  { name: 'kode', align: 'left', label: 'KODE TAGIHAN', field: 'kode_tagihan', sortable: true },
  {
    name: 'invoice',
    align: 'left',
    label: 'NO INVOICE & VENDOR',
    field: 'nomor_invoice',
    sortable: true,
  },
  {
    name: 'referensi',
    align: 'left',
    label: 'PROYEK & REFERENSI PO',
    field: 'proyek_nama',
    sortable: true,
  },
  { name: 'timeline', align: 'left', label: 'TIMELINE', field: 'tanggal_invoice', sortable: true },
  { name: 'nominal', align: 'right', label: 'NILAI TAGIHAN', field: 'grand_total', sortable: true },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]

// ============================================================================
// FETCH DATA
// ============================================================================
const syncExistingTagihanStatus = async () => {
  try {
    const pengajuanSnap = await getDocs(collection(db, 'finance_pengajuan_pembayaran'))
    const pengajuans = pengajuanSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    const tagihanSnap = await getDocs(collection(db, 'finance_tagihan'))
    const tagihans = tagihanSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    for (const tagihan of tagihans) {
      const tagihanIdentifiers = [tagihan.id, tagihan.kode_tagihan, tagihan.nomor_invoice].filter(
        Boolean,
      )

      // Find ALL related pengajuan, then pick the LATEST one
      const relatedPengajuanList = pengajuans.filter((p) => {
        const pengajuanRefs = [p.tagihan_id, p.tagihan_nomor_invoice, p.tagihan_kode].filter(
          Boolean,
        )
        return pengajuanRefs.some((ref) => tagihanIdentifiers.includes(ref))
      })
      relatedPengajuanList.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
      )
      const relatedPengajuan = relatedPengajuanList.length > 0 ? relatedPengajuanList[0] : null

      let newStatus = 'Draft'

      if (relatedPengajuan) {
        if (relatedPengajuan.status === 'Rejected') {
          newStatus = 'Ditolak'
        } else if (relatedPengajuan.status === 'Approved') {
          newStatus = 'Menunggu Pembayaran'
        } else if (relatedPengajuan.status === 'Cair') {
          newStatus = 'Menunggu Pembayaran'
        } else if (relatedPengajuan.status === 'Pending') {
          newStatus = 'Sedang Diajukan'
        } else {
          newStatus = 'Sedang Diajukan'
        }
      }

      // Check payment status overrides
      const grandTotal = Number(tagihan.grand_total) || 0
      const totalDibayar = Number(tagihan.total_dibayar) || 0
      const sisaTagihan = grandTotal - totalDibayar

      if (sisaTagihan <= 0 && grandTotal > 0) {
        newStatus = 'Lunas'
      } else if (totalDibayar > 0) {
        newStatus = 'Dibayar Sebagian'
      }

      if (tagihan.status !== newStatus) {
        console.log(
          `Syncing tagihan ${tagihan.nomor_invoice} from '${tagihan.status}' to '${newStatus}'`,
        )
        await updateDoc(doc(db, 'finance_tagihan', tagihan.id), {
          status: newStatus,
          updatedAt: serverTimestamp(),
        })
      }
    }
  } catch (e) {
    console.error('Error syncing existing tagihan status:', e)
  }
}

const generateKodeTagihan = () => {
  const count = rows.value.length + 1
  const padded = count.toString().padStart(3, '0')
  const year = new Date().getFullYear()
  const month = ('0' + (new Date().getMonth() + 1)).slice(-2)
  return `AP/${year}${month}/${padded}`
}

// Store pengajuan pembayaran data
const pengajuanPembayaranData = ref([])
// Store raw tagihan data
const rawTagihanData = ref([])

// Function to process tagihan data with statuses
const processTagihanData = () => {
  rows.value = rawTagihanData.value
    .map((data) => {
      const grandTotal = Number(data.grand_total) || 0
      const totalDibayar = Number(data.total_dibayar) || 0
      const sisaTagihan = grandTotal - totalDibayar

      // Find ALL pengajuan related to this tagihan, then pick the LATEST one
      const relatedPengajuanList = pengajuanPembayaranData.value.filter(
        (p) =>
          p.tagihan_id === data.id ||
          p.tagihan_nomor_invoice === data.nomor_invoice ||
          (p.tagihan_kode && p.tagihan_kode === data.kode_tagihan),
      )
      // Sort by createdAt descending (newest first) to get the most recent pengajuan
      relatedPengajuanList.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
      )
      const relatedPengajuan = relatedPengajuanList.length > 0 ? relatedPengajuanList[0] : null

      let status = data.status || 'Draft'

      if (relatedPengajuan) {
        if (relatedPengajuan.status === 'Rejected') {
          status = 'Ditolak'
        } else if (relatedPengajuan.status === 'Approved') {
          status = 'Menunggu Pembayaran'
        } else if (relatedPengajuan.status === 'Cair') {
          status = 'Menunggu Pembayaran'
        } else if (relatedPengajuan.status === 'Pending') {
          status = 'Sedang Diajukan'
        } else {
          status = 'Sedang Diajukan'
        }
      }

      if (sisaTagihan <= 0) {
        status = 'Lunas'
      } else if (totalDibayar > 0 && status !== 'Lunas') {
        status = 'Dibayar Sebagian'
      } else if (!relatedPengajuan && status === 'Draft') {
        status = 'Draft'
      } else if (!relatedPengajuan && status !== 'Draft') {
        // If status was set by a previous sync (e.g. 'Sedang Diajukan') but no pengajuan exists now, keep stored status
        // unless it's clearly stale
        const validStoredStatuses = ['Menunggu Pembayaran', 'Sedang Diajukan', 'Ditolak']
        if (!validStoredStatuses.includes(status)) {
          status = data.status || 'Draft'
        }
      }

      return {
        id: data.id,
        ...data,
        grand_total: grandTotal,
        total_dibayar: totalDibayar,
        sisa_tagihan: sisaTagihan,
        status: status,
      }
    })
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}

const fetchData = async () => {
  loading.value = true

  const snapSupp = await getDocs(collection(db, 'suppliers'))
  allSupplier.value = snapSupp.docs.map((d) => ({ id: d.id, ...d.data() }))
  optSupplier.value = [...allSupplier.value]
  optVendorFilter.value = [...allSupplier.value]

  const snapProj = await getDocs(collection(db, 'proyek'))
  allProyek.value = snapProj.docs.map((d) => ({ id: d.id, nama: d.data().nama, ...d.data() }))
  optProyek.value = [...allProyek.value]
  optProyekFilter.value = [...allProyek.value]

  // Listen to SPK updates
  if (unsubAllSpk) unsubAllSpk()
  unsubAllSpk = onSnapshot(collection(db, 'spk_customer'), (snap) => {
    allSpk.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  const snapPo = await getDocs(collection(db, 'purchase_order'))
  optPO.value = snapPo.docs.map((d) => ({ id: d.id, ...d.data() }))

  // Listen to pengajuan pembayaran
  if (unsubPengajuan) unsubPengajuan()
  unsubPengajuan = onSnapshot(collection(db, 'finance_pengajuan_pembayaran'), (snap) => {
    pengajuanPembayaranData.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    // Re-process tagihan data when pengajuan changes
    processTagihanData()
  })

  // Listen to tagihan
  if (unsubTagihan) unsubTagihan()
  unsubTagihan = onSnapshot(collection(db, 'finance_tagihan'), (snap) => {
    rawTagihanData.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    // Process tagihan data when tagihan changes
    processTagihanData()
    loading.value = false
  })
}

// ============================================================================
// COMPUTED FILTERS & STATS
// ============================================================================
const filteredRows = computed(() => {
  let result = rows.value

  if (statusFilter.value === 'OUTSTANDING') {
    result = result.filter((r) => r.sisa_tagihan > 0)
  } else if (statusFilter.value === 'LUNAS') {
    result = result.filter((r) => r.sisa_tagihan <= 0)
  }

  if (searchQuery.value) {
    const lower = searchQuery.value.toLowerCase()
    result = result.filter(
      (r) =>
        r.kode_tagihan?.toLowerCase().includes(lower) ||
        r.nomor_invoice?.toLowerCase().includes(lower) ||
        r.supplier_nama?.toLowerCase().includes(lower) ||
        r.proyek_nama?.toLowerCase().includes(lower),
    )
  }

  if (filterStartDate.value)
    result = result.filter((r) => r.tanggal_invoice >= filterStartDate.value)
  if (filterEndDate.value) result = result.filter((r) => r.tanggal_invoice <= filterEndDate.value)

  if (filterSelectedProyek.value && filterSelectedProyek.value.length > 0) {
    const selectedIds = filterSelectedProyek.value.map((p) => p.id)
    result = result.filter((r) => selectedIds.includes(r.proyek_id))
  }

  if (filterSelectedVendor.value && filterSelectedVendor.value.length > 0) {
    const selectedIds = filterSelectedVendor.value.map((v) => v.id)
    result = result.filter((r) => selectedIds.includes(r.supplier_id))
  }

  return result
})

const totalFilteredNominal = computed(() =>
  filteredRows.value.reduce((sum, r) => sum + (Number(r.grand_total) || 0), 0),
)

const totalFilteredOutstanding = computed(() =>
  filteredRows.value.filter((r) => r.sisa_tagihan > 0).reduce((sum, r) => sum + r.sisa_tagihan, 0),
)

const summaryDiajukan = computed(() => {
  const items = filteredRows.value.filter((r) => r.status === 'Sedang Diajukan')
  return {
    count: items.length,
    total: items.reduce((sum, r) => sum + (Number(r.grand_total) || 0), 0),
  }
})

const summaryDitolak = computed(() => {
  const items = filteredRows.value.filter((r) => r.status === 'Ditolak')
  return {
    count: items.length,
    total: items.reduce((sum, r) => sum + (Number(r.grand_total) || 0), 0),
  }
})

const summarySudahCair = computed(() => {
  const items = filteredRows.value.filter((r) => r.status === 'Lunas' || r.status === 'Dibayar Sebagian')
  return {
    count: items.length,
    total: items.reduce((sum, r) => sum + (Number(r.total_dibayar) || 0), 0),
  }
})


// ✅ SPK Options: Dibangun secara kokoh dan toleran terhadap format ID string maupun objek
const currentSpkOptions = computed(() => {
  if (!form.value.proyek_id) return []

  // Mengekstrak ID Proyek murni (mengatasi Quasar object binding vs string ID)
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

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'ALL'
  filterStartDate.value = ''
  filterEndDate.value = ''
  filterSelectedProyek.value = []
  filterSelectedVendor.value = []
}

const filterProyekDropdown = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    optProyekFilter.value = allProyek.value.filter((v) => v.nama?.toLowerCase().includes(needle))
  })
}

const filterVendorDropdown = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    optVendorFilter.value = allSupplier.value.filter((v) => v.nama?.toLowerCase().includes(needle))
  })
}

const countOutstanding = () => filteredRows.value.filter((r) => r.sisa_tagihan > 0).length

const countOverdue = () => {
  const today = new Date().toISOString().substr(0, 10)
  return filteredRows.value.filter((r) => r.jatuh_tempo < today && r.sisa_tagihan > 0).length
}

const totalOutstandingValuation = computed(() => totalFilteredOutstanding.value)

const isOverdue = (dateStr, row) => {
  if (row.sisa_tagihan <= 0) return false
  const today = new Date().toISOString().substr(0, 10)
  return dateStr < today
}

// ============================================================================
// WATCHERS UNTUK REAKTIVITAS SPK & BOQ
// ============================================================================
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

      // Sinkronisasi otomatis input nomor SPK jika tidak memakai PO
      if (!form.value.po_ref) {
        const spkNames = newVal.map((spkId) => {
          const spkObj = getSpkById(spkId)
          return spkObj ? spkObj.nomor_spk || spkObj.nama_kontrak || spkId : spkId
        })
        form.value.spk_nomor = spkNames.join(', ')
      }
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

// ============================================================================
// DIALOG & FORM LOGIC
// ============================================================================
const openDetail = async (row) => {
  if (!canView.value) return
  selectedTagihan.value = row
  viewMode.value = 'detail'
  window.scrollTo(0, 0)
  if (row.status === 'Ditolak' && row.creator_read === false) {
    try {
      await updateDoc(doc(db, 'finance_tagihan', row.id), { creator_read: true })
    } catch (e) {
      console.error(e)
    }
  }
}

const openAddDialog = () => {
  if (!canCreate.value)
    return $q.notify({
      type: 'negative',
      position: 'top',
      message: 'Anda tidak memiliki izin untuk membuat tagihan.',
    })
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  form.value.kode_tagihan = generateKodeTagihan()
  viewMode.value = 'form'
}

const openEditDialog = async (row) => {
  if (!canEdit.value)
    return $q.notify({
      type: 'negative',
      position: 'top',
      message: 'Anda tidak memiliki izin untuk mengedit tagihan.',
    })
  isEditMode.value = true
  form.value = {
    ...JSON.parse(JSON.stringify(row)),
    supplier: row.supplier_id ? { id: row.supplier_id, nama: row.supplier_nama } : null,
    proyek_id: row.proyek_id || null,
    proyek_nama: row.proyek_nama || '',
    spk_nomor: row.spk_nomor || '',
    po_ref: row.po_nomor ? { nomor: row.po_nomor } : null,
    nominal_po: row.nominal_po || 0,
    selected_spk: row.selected_spk || [],
    spk_boq_selection: row.spk_boq_selection || {},
  }
  if (!form.value.kode_tagihan) form.value.kode_tagihan = generateKodeTagihan()
  if (!form.value.nominal_invoice) form.value.nominal_invoice = form.value.nilai_dpp || 0
  viewMode.value = 'form'

  if (row.status === 'Ditolak' && row.creator_read === false) {
    try {
      await updateDoc(doc(db, 'finance_tagihan', row.id), { creator_read: true })
    } catch (e) {
      console.error(e)
    }
  }
}

// ============================================================================
// EXPORTING AND PRINTING (RETAIN ORIGINAL THEME)
// ============================================================================
const exportTablePDF = () => {
  const element = document.getElementById('table-pdf-export')
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `Laporan_Tagihan_Supplier_${Date.now()}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  $q.loading.show({ message: 'Menyiapkan Laporan PDF...' })
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => $q.loading.hide())
}

const exportTableExcel = () => {
  try {
    // Calculate statistics based on current filtered items
    const diajukanList = filteredRows.value.filter(r => r.status === 'Sedang Diajukan')
    const diajukanCount = diajukanList.length
    const diajukanSum = diajukanList.reduce((sum, r) => sum + (Number(r.grand_total) || 0), 0)

    const ditolakList = filteredRows.value.filter(r => r.status === 'Ditolak')
    const ditolakCount = ditolakList.length
    const ditolakSum = ditolakList.reduce((sum, r) => sum + (Number(r.grand_total) || 0), 0)

    const sudahCairList = filteredRows.value.filter(r => r.status === 'Lunas' || r.status === 'Dibayar Sebagian')
    const sudahCairCount = sudahCairList.length
    const sudahCairSum = sudahCairList.reduce((sum, r) => sum + (Number(r.total_dibayar) || 0), 0)

    const thStyle =
      'background-color: #00796b; color: #ffffff; font-weight: bold; border: 1px solid #004d40; padding: 10px; text-align: center; text-transform: uppercase;'
    const tdStyle =
      'border: 1px solid #dddddd; padding: 8px; vertical-align: top; white-space: pre-wrap;'
    const tdNumStyle =
      'border: 1px solid #dddddd; padding: 8px; vertical-align: top; text-align: right;'
    const tdCenterStyle =
      'border: 1px solid #dddddd; padding: 8px; vertical-align: top; text-align: center;'

    let tableHtml =
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">'
    tableHtml += '<head><meta charset="utf-8"></head><body>'
    tableHtml +=
      '<h2 style="color: #00796b; margin-bottom: 5px; font-family: sans-serif;">Laporan Tagihan Supplier (Account Payable)</h2>'
    tableHtml +=
      '<p style="margin-top: 0; font-family: sans-serif; color: #555555;">Diekspor pada: ' +
      new Date().toLocaleString('id-ID') +
      '</p><br>'

    // 3-COLUMN SUMMARY TABLE IN EXCEL
    tableHtml += '<table style="border-collapse: collapse; width: 45%; font-family: sans-serif; margin-bottom: 20px;">'
    tableHtml += `
      <thead>
        <tr style="background-color: #004d40; color: #ffffff; font-weight: bold; border: 1.5px solid #00332c;">
          <th style="padding: 10px; border: 1px solid #00332c; text-align: left;">STATUS TAGIHAN</th>
          <th style="padding: 10px; border: 1px solid #00332c; text-align: center;">JUMLAH DOKUMEN</th>
          <th style="padding: 10px; border: 1px solid #00332c; text-align: right;">TOTAL NOMINAL</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background-color: #fff8e1;">
          <td style="padding: 8px; border: 1px solid #ffb300; font-weight: bold; color: #b78103;">Sedang Diajukan</td>
          <td style="padding: 8px; border: 1px solid #ffb300; text-align: center; font-weight: bold; color: #b78103;">${diajukanCount}</td>
          <td style="padding: 8px; border: 1px solid #ffb300; text-align: right; font-weight: bold; color: #b78103;">Rp ${diajukanSum.toLocaleString('id-ID')}</td>
        </tr>
        <tr style="background-color: #ffebee;">
          <td style="padding: 8px; border: 1px solid #ef5350; font-weight: bold; color: #c62828;">Ditolak</td>
          <td style="padding: 8px; border: 1px solid #ef5350; text-align: center; font-weight: bold; color: #c62828;">${ditolakCount}</td>
          <td style="padding: 8px; border: 1px solid #ef5350; text-align: right; font-weight: bold; color: #c62828;">Rp ${ditolakSum.toLocaleString('id-ID')}</td>
        </tr>
        <tr style="background-color: #e8f5e9;">
          <td style="padding: 8px; border: 1px solid #66bb6a; font-weight: bold; color: #2e7d32;">Sudah Cair (Lunas / Sebagian)</td>
          <td style="padding: 8px; border: 1px solid #66bb6a; text-align: center; font-weight: bold; color: #2e7d32;">${sudahCairCount}</td>
          <td style="padding: 8px; border: 1px solid #66bb6a; text-align: right; font-weight: bold; color: #2e7d32;">Rp ${sudahCairSum.toLocaleString('id-ID')}</td>
        </tr>
      </tbody>
    </table><br>
    `

    tableHtml +=
      '<table style="border-collapse: collapse; width: 100%; font-family: sans-serif;"><thead><tr>'
    tableHtml += `<th style="${thStyle}">No</th><th style="${thStyle}">Kode Tagihan</th><th style="${thStyle}">No Invoice</th><th style="${thStyle}">Vendor / Supplier</th><th style="${thStyle}">Proyek</th><th style="${thStyle}">Referensi PO</th><th style="${thStyle}">Detail BOQ & SPK</th><th style="${thStyle}">Tgl Invoice</th><th style="${thStyle}">Jatuh Tempo</th><th style="${thStyle}">Grand Total (Rp)</th><th style="${thStyle}">Status</th>`
    tableHtml += '</tr></thead><tbody>'

    filteredRows.value.forEach((r, index) => {
      const boqDetailsText = formatSpkBoqText(r)
      const rowBg = index % 2 === 0 ? 'background-color: #ffffff;' : 'background-color: #f2faf9;'
      const dynamicTdStyle = `${tdStyle} ${rowBg}`
      const dynamicTdNumStyle = `${tdNumStyle} ${rowBg}`
      const dynamicTdCenterStyle = `${tdCenterStyle} ${rowBg}`

      let statusBgColor = '#eeeeee'
      let statusTextColor = '#616161'
      if (r.status === 'Ditolak') {
        statusBgColor = '#ffebee'
        statusTextColor = '#c62828'
      } else if (r.status === 'Sedang Diajukan') {
        statusBgColor = '#fff8e1'
        statusTextColor = '#b78103'
      } else if (r.status === 'Menunggu Pembayaran') {
        statusBgColor = '#fff3e0'
        statusTextColor = '#ef6c00'
      } else if (r.status === 'Dibayar Sebagian') {
        statusBgColor = '#e3f2fd'
        statusTextColor = '#1565c0'
      } else if (r.status === 'Lunas') {
        statusBgColor = '#e8f5e9'
        statusTextColor = '#2e7d32'
      }
      const dynamicStatusStyle = `${tdCenterStyle} background-color: ${statusBgColor}; color: ${statusTextColor}; font-weight: bold;`

      tableHtml += `<tr><td style="${dynamicTdCenterStyle}">${index + 1}</td><td style="${dynamicTdStyle}">${r.kode_tagihan || '-'}</td><td style="${dynamicTdStyle}">${r.nomor_invoice || '-'}</td><td style="${dynamicTdStyle}">${r.supplier_nama || '-'}</td><td style="${dynamicTdStyle}">${r.proyek_nama || '-'}</td><td style="${dynamicTdStyle}">${r.po_nomor || '-'}</td><td style="${dynamicTdStyle}">${boqDetailsText}</td><td style="${dynamicTdCenterStyle}">${formatDateIndo(r.tanggal_invoice)}</td><td style="${dynamicTdCenterStyle}">${formatDateIndo(r.jatuh_tempo)}</td><td style="${dynamicTdNumStyle}">${r.grand_total || 0}</td><td style="${dynamicStatusStyle}">${r.status || '-'}</td></tr>`
    })

    tableHtml += `<tr style="background-color: #e0f2f1;"><td colspan="9" style="${tdStyle} text-align: right; font-weight: bold; color: #004d40;">TOTAL NILAI TAGIHAN (SESUAI FILTER)</td><td style="${tdNumStyle} font-weight: bold; color: #004d40;">Rp ${totalFilteredNominal.value.toLocaleString('id-ID')}</td><td style="${tdStyle}"></td></tr>`
    tableHtml += `<tr style="background-color: #ffebee;"><td colspan="9" style="${tdStyle} text-align: right; font-weight: bold; color: #c62828;">TOTAL SISA HUTANG (SESUAI FILTER)</td><td style="${tdNumStyle} font-weight: bold; color: #c62828;">Rp ${totalFilteredOutstanding.value.toLocaleString('id-ID')}</td><td style="${tdStyle}"></td></tr>`
    tableHtml += '</tbody></table></body></html>'

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Data_Tagihan_Supplier_${Date.now()}.xls`
    link.click()
    URL.revokeObjectURL(url)
    $q.notify({ type: 'positive', position: 'top', message: 'Data berhasil diekspor ke Excel' })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', position: 'top', message: 'Gagal mengekspor data ke Excel' })
  }
}

// ============================================================================
// COMPUTED KALKULASI PAJAK
// ============================================================================
const calculatedPpn = computed(
  () => ((form.value.nominal_invoice || 0) * (form.value.ppn_persen || 0)) / 100,
)
const calculatedPph = computed(
  () => ((form.value.nominal_invoice || 0) * (form.value.pph_persen || 0)) / 100,
)
const calculatedGrandTotal = computed(
  () => (form.value.nominal_invoice || 0) + calculatedPpn.value - calculatedPph.value,
)

// ============================================================================
// PO AUTO-FILL
// ============================================================================
const onPoSelect = (poObj) => {
  if (poObj) {
    form.value.po_nomor = poObj.nomor
    form.value.po_tanggal = poObj.tanggal || ''
    form.value.nominal_po = poObj.grand_total || 0
    form.value.nominal_invoice = poObj.grand_total || 0
    form.value.keterangan = `Tagihan berdasarkan PO: ${poObj.nomor}`
    form.value.spk_nomor = poObj.nomor_spk || poObj.spk_nomor || '-'
    const matchedSupp = allSupplier.value.find(
      (s) => s.nama.toLowerCase() === poObj.kepada_yth?.toLowerCase(),
    )
    if (matchedSupp) form.value.supplier = { id: matchedSupp.id, nama: matchedSupp.nama }
    else form.value.supplier = { id: null, nama: poObj.kepada_yth }
    form.value.proyek_nama = poObj.proyek_nama || '-'
    form.value.proyek_id = poObj.proyek_id || null
  } else {
    form.value.po_nomor = ''
    form.value.po_tanggal = ''
    form.value.nominal_po = 0
    form.value.nominal_invoice = 0
    form.value.keterangan = ''
    form.value.supplier = null
    form.value.proyek_nama = ''
    form.value.proyek_id = null
    form.value.spk_nomor = ''
  }
}

const filterSupplier = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    optSupplier.value = allSupplier.value.filter((v) => v.nama?.toLowerCase().includes(needle))
  })
}

const addDocRow = () => form.value.lampiran.push({ label: '', url: '', base64: '', fileObj: null })
const removeDocRow = (i) => form.value.lampiran.splice(i, 1)

// ============================================================================
// SIMPAN TAGIHAN
// ============================================================================
const processHybridUpload = async (file, pathName) => {
  if (!file) return null
  if (file.size <= 512000) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
    })
  } else {
    const sRef = storageRef(storage, `finance/tagihan/${Date.now()}_${pathName}`)
    const snap = await uploadBytes(sRef, file)
    return await getDownloadURL(snap.ref)
  }
}

const simpanTagihan = async () => {
  if (!isEditMode.value && !canCreate.value)
    return $q.notify({
      type: 'negative',
      position: 'top',
      message: 'Anda tidak memiliki izin untuk membuat tagihan.',
    })
  if (isEditMode.value && !canEdit.value)
    return $q.notify({
      type: 'negative',
      position: 'top',
      message: 'Anda tidak memiliki izin untuk mengedit tagihan.',
    })

  if (!form.value.nomor_invoice || !form.value.supplier) {
    return $q.notify({
      type: 'warning',
      position: 'top',
      message: 'Nomor Invoice dan Supplier wajib diisi!',
    })
  }

  $q.loading.show({ message: 'Menyimpan dokumen tagihan...' })
  submitting.value = true

  try {
    for (let item of form.value.lampiran) {
      if (item.fileObj) {
        const result = await processHybridUpload(item.fileObj, item.label || 'Lampiran')
        if (result.startsWith('http')) {
          item.url = result
          item.base64 = ''
        } else {
          item.base64 = result
          item.url = ''
        }
        delete item.fileObj
      }
    }

    let targetStatus = 'Sedang Diajukan'
    if (isEditMode.value) {
      const currentStatus = form.value.status
      if (currentStatus === 'Draft' || currentStatus === 'Ditolak' || !currentStatus) {
        targetStatus = 'Sedang Diajukan'
      } else {
        targetStatus = currentStatus
      }
    }

    const payload = {
      kode_tagihan: form.value.kode_tagihan,
      nomor_invoice: form.value.nomor_invoice,
      tanggal_invoice: form.value.tanggal_invoice,
      jatuh_tempo: form.value.jatuh_tempo,
      supplier_id: form.value.supplier?.id || null,
      supplier_nama: form.value.supplier?.nama || '',
      proyek_id: form.value.proyek_id || null,
      proyek_nama: form.value.proyek_nama || '',
      spk_nomor: form.value.spk_nomor || '',
      po_nomor: form.value.po_nomor || '',
      po_tanggal: form.value.po_tanggal || '',
      nominal_po: form.value.nominal_po || 0,
      nominal_invoice: form.value.nominal_invoice,
      nilai_dpp: form.value.nominal_invoice,
      ppn_persen: form.value.ppn_persen,
      ppn_nominal: calculatedPpn.value,
      pph_persen: form.value.pph_persen,
      pph_nominal: calculatedPph.value,
      grand_total: calculatedGrandTotal.value,
      total_dibayar: isEditMode.value ? Number(form.value.total_dibayar) || 0 : 0,
      keterangan: form.value.keterangan,
      status: targetStatus,
      lampiran: form.value.lampiran,
      selected_spk: form.value.selected_spk || [],
      spk_boq_selection: form.value.spk_boq_selection || {},
      updatedAt: serverTimestamp(),
    }

    let tagihanId = form.value.id
    if (isEditMode.value) {
      await updateDoc(doc(db, 'finance_tagihan', tagihanId), payload)
    } else {
      payload.createdAt = serverTimestamp()
      payload.pembuat = authStore.user?.nama || 'Admin'
      const docRef = await addDoc(collection(db, 'finance_tagihan'), payload)
      tagihanId = docRef.id
    }

    // Synchronize to finance_pengajuan_pembayaran
    const selectedSupplierId = form.value.supplier?.id || null
    const matchedSupp = allSupplier.value.find((s) => s.id === selectedSupplierId)
    const reqBank = matchedSupp?.rek_bank || ''
    const reqNomor = matchedSupp?.rek_nomor || ''
    const reqNama = matchedSupp?.rek_nama || ''

    let reqStatus = 'Pending'
    if (targetStatus === 'Menunggu Pembayaran' || targetStatus === 'Dibayar Sebagian') {
      reqStatus = 'Approved'
    } else if (targetStatus === 'Lunas') {
      reqStatus = 'Cair'
    } else if (targetStatus === 'Ditolak') {
      reqStatus = 'Rejected'
    } else if (targetStatus === 'Sedang Diajukan') {
      reqStatus = 'Pending'
    }

    const reqPayload = {
      tipe_pengajuan: 'Tagihan Supplier',
      tagihan_id: tagihanId,
      tagihan_nomor_invoice: form.value.nomor_invoice,
      tagihan_kode: form.value.kode_tagihan,
      proyek_id: form.value.proyek_id || null,
      proyek_nama: form.value.proyek_nama || '',
      selected_spk: form.value.selected_spk || [],
      spk_boq_selection: form.value.spk_boq_selection || {},
      vendor_nama: form.value.supplier?.nama || '',
      rek_bank: reqBank,
      rek_nomor: reqNomor,
      rek_nama: reqNama,
      nominal: calculatedGrandTotal.value,
      tanggal_pengajuan: form.value.tanggal_invoice || new Date().toISOString().substr(0, 10),
      tanggal_dibutuhkan: form.value.jatuh_tempo || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
      keterangan: form.value.keterangan || '',
      lampiran: form.value.lampiran || [],
      status: reqStatus,
      updatedAt: serverTimestamp(),
      approver_read: false,
      creator_read: true,
      realizer_read: false,
      realized_approved_read: true,
    }

    const qReq = query(
      collection(db, 'finance_pengajuan_pembayaran'),
      where('tagihan_id', '==', tagihanId)
    )
    const snapReq = await getDocs(qReq)
    if (!snapReq.empty) {
      await updateDoc(doc(db, 'finance_pengajuan_pembayaran', snapReq.docs[0].id), reqPayload)
    } else {
      const generateNoRequestHelper = async () => {
        const snap = await getDocs(collection(db, 'finance_pengajuan_pembayaran'))
        const count = snap.size + 1
        const padded = count.toString().padStart(3, '0')
        const year = new Date().getFullYear()
        const month = ('0' + (new Date().getMonth() + 1)).slice(-2)
        return `REQ/${year}${month}/${padded}`
      }
      reqPayload.no_request = await generateNoRequestHelper()
      reqPayload.createdAt = serverTimestamp()
      reqPayload.pembuat_id = authStore.user?.uid || ''
      reqPayload.pembuat_email = authStore.user?.email || ''
      reqPayload.pembuat_nama = authStore.user?.nama || 'User'
      await addDoc(collection(db, 'finance_pengajuan_pembayaran'), reqPayload)
    }

    viewMode.value = 'list'
    $q.notify({ type: 'positive', position: 'top', message: 'Tagihan berhasil disimpan!' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', position: 'top', message: 'Gagal menyimpan tagihan.' })
  } finally {
    $q.loading.hide()
    submitting.value = false
  }
}

const confirmHapus = (row) => {
  if (!canDelete.value)
    return $q.notify({
      type: 'negative',
      position: 'top',
      message: 'Anda tidak memiliki izin untuk menghapus tagihan.',
    })
  $q.dialog({
    title: 'Hapus Tagihan',
    message: `Hapus invoice ${row.nomor_invoice} secara permanen?`,
    cancel: true,
    ok: { color: 'negative', label: 'Hapus', unelevated: true },
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'finance_tagihan', row.id))
      const q = query(
        collection(db, 'finance_pengajuan_pembayaran'),
        where('tagihan_id', '==', row.id)
      )
      const snap = await getDocs(q)
      for (const d of snap.docs) {
        await deleteDoc(doc(db, 'finance_pengajuan_pembayaran', d.id))
      }
      $q.notify({ type: 'positive', position: 'top', message: 'Tagihan terhapus' })
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', position: 'top', message: 'Gagal menghapus tagihan.' })
    }
  })
}

const ajukanTagihan = async () => {
  if (!canEdit.value)
    return $q.notify({
      type: 'negative',
      position: 'top',
      message: 'Anda tidak memiliki izin untuk mengajukan tagihan.',
    })
  try {
    await updateDoc(doc(db, 'finance_tagihan', selectedTagihan.value.id), {
      status: 'Menunggu Pembayaran',
      updatedAt: serverTimestamp(),
    })
    // Sync payment request status to Approved
    const q = query(
      collection(db, 'finance_pengajuan_pembayaran'),
      where('tagihan_id', '==', selectedTagihan.value.id)
    )
    const snap = await getDocs(q)
    for (const d of snap.docs) {
      await updateDoc(doc(db, 'finance_pengajuan_pembayaran', d.id), {
        status: 'Approved',
        updatedAt: serverTimestamp(),
      })
    }
    selectedTagihan.value.status = 'Menunggu Pembayaran'
    $q.notify({ type: 'positive', position: 'top', message: 'Tagihan berhasil diajukan!' })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', position: 'top', message: 'Gagal mengajukan tagihan.' })
  }
}

// ============================================================================
// PEMBAYARAN
// ============================================================================
const openPaymentDialog = () => {
  if (!canApprove.value && !canEdit.value)
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
  if (!canApprove.value && !canEdit.value)
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
      const fRef = storageRef(storage, `finance/pembayaran_tagihan/${Date.now()}_${file.name}`)
      await uploadBytes(fRef, file)
      buktiUrl = await getDownloadURL(fRef)
      $q.loading.hide()
    }

    const newNominal = Number(paymentForm.value.nominal) || 0
    const currentTotal = Number(selectedTagihan.value.total_dibayar) || 0
    const grandTotal = Number(selectedTagihan.value.grand_total) || 0
    const newTotal = currentTotal + newNominal

    let newStatus = 'Menunggu Pembayaran'
    if (newTotal >= grandTotal) newStatus = 'Lunas'
    else if (newTotal > 0) newStatus = 'Dibayar Sebagian'

    const paymentRecord = {
      id: Date.now().toString(),
      tanggal: paymentForm.value.tanggal,
      nominal: newNominal,
      catatan: paymentForm.value.catatan,
      bukti_url: buktiUrl,
      createdAt: new Date().toISOString(),
    }

    await updateDoc(doc(db, 'finance_tagihan', selectedTagihan.value.id), {
      total_dibayar: newTotal,
      status: newStatus,
      riwayat_pembayaran: arrayUnion(paymentRecord),
      updatedAt: serverTimestamp(),
    })

    if (newStatus === 'Lunas') {
      const q = query(
        collection(db, 'finance_pengajuan_pembayaran'),
        where('tagihan_id', '==', selectedTagihan.value.id)
      )
      const snap = await getDocs(q)
      for (const d of snap.docs) {
        await updateDoc(doc(db, 'finance_pengajuan_pembayaran', d.id), {
          status: 'Cair',
          updatedAt: serverTimestamp(),
        })
      }
    }

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
// UTILS
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
    case 'Draft':
      return { bg: 'grey-3', text: 'grey-8' }
    case 'Ditolak':
      return { bg: 'red-2', text: 'red-9' }
    case 'Sedang Diajukan':
      return { bg: 'amber-2', text: 'amber-9' }
    case 'Menunggu Pembayaran':
      return { bg: 'orange-2', text: 'orange-9' }
    case 'Dibayar Sebagian':
      return { bg: 'blue-2', text: 'blue-9' }
    case 'Lunas':
      return { bg: 'green-2', text: 'green-9' }
    default:
      return { bg: 'grey-3', text: 'grey-8' }
  }
}

const getSpkById = (id) => {
  const targetId = typeof id === 'object' && id !== null ? id.id : id
  return allSpk.value.find((s) => s.id === targetId)
}

const formatSpkBoqText = (row) => {
  if (!row.selected_spk || !row.selected_spk.length) return '-'

  const parts = []
  row.selected_spk.forEach((spkId) => {
    const spkObj = getSpkById(spkId)
    const spkNo = spkObj ? spkObj.nomor_spk || spkObj.nama_kontrak || spkId : spkId
    let spkText = `SPK: ${spkNo}`

    const selection = row.spk_boq_selection?.[spkId]
    if (selection && selection.selected_groups && selection.selected_groups.length) {
      const groupParts = []
      selection.selected_groups.forEach((groupTitle) => {
        const items = selection.selected_items_by_group?.[groupTitle] || []
        if (items.length) {
          groupParts.push(`  Kategori: ${groupTitle}\n    - ${items.join('\n    - ')}`)
        } else {
          groupParts.push(`  Kategori: ${groupTitle}`)
        }
      })
      spkText += `\n` + groupParts.join('\n')
    }
    parts.push(spkText)
  })

  return parts.join('\n\n')
}

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
  // Reset array SPK terpilih dan struktur filter ketika proyek berubah
  form.value.selected_spk = []
  form.value.spk_boq_selection = {}

  if (proyekId) {
    const matchedProyek = allProyek.value.find((p) => p.id === proyekId)
    form.value.proyek_nama = matchedProyek ? matchedProyek.nama : ''
  } else {
    form.value.proyek_nama = ''
  }
}

// eslint-disable-next-line no-unused-vars
const exportToPDF = () => {
  $q.notify({
    type: 'info',
    position: 'top',
    message: 'Gunakan fitur cetak browser (Ctrl+P) untuk menyimpan rincian ini.',
  })
  window.print()
}

const openLink = (url) => {
  if (url) window.open(url, '_blank')
}

// Koleksi data SPK internal

onMounted(() => {
  loadUserPermission()
  fetchData()
  syncExistingTagihanStatus()
})

onUnmounted(() => {
  if (unsubTagihan) unsubTagihan()
  if (unsubAllSpk) unsubAllSpk()
  if (unsubPengajuan) unsubPengajuan()
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
  box-shadow: 0 10px 30px rgba(0, 150, 136, 0.15);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-dashed {
  border: 2px dashed #009688;
}
.dashed-btn-teal {
  border: 2px dashed #009688;
}.border-teal-thin {
  border: 1px solid rgba(0, 150, 136, 0.18) !important;
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.bg-teal-gradient {
  background: linear-gradient(135deg, #00796b 0%, #009688 100%) !important;
}
.border-left-teal {
  border-left: 4px solid #009688 !important;
}
.border-left-dashed {
  border-left: 2px dashed rgba(0, 150, 136, 0.3) !important;
}
.font-13 {
  font-size: 13px;
}

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
  box-shadow: 0 8px 24px rgba(185, 28, 28, 0.35) !important;
}

.bg-teal-section {
  background-color: #f2faf9 !important;
}

.list-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: all 0.3s ease;
}
.list-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2) !important;
}

.finance-table :deep(.q-table__middle) {
  max-height: 65vh;
  overflow: auto;
}

/* Custom scrollbar for table container to make it easy to drag and see at any page height */
.finance-table :deep(.q-table__middle)::-webkit-scrollbar {
  height: 10px;
  width: 10px;
}

.finance-table :deep(.q-table__middle)::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 6px;
}

.finance-table :deep(.q-table__middle)::-webkit-scrollbar-thumb {
  background: #009688;
  border-radius: 6px;
  border: 2px solid #f1f1f1;
}

.finance-table :deep(.q-table__middle)::-webkit-scrollbar-thumb:hover {
  background: #00796b;
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

.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.search-input :deep(.q-field__control:hover),
.search-input :deep(.q-field__control.q-field--focused .q-field__control-container) {
  border-color: #009688 !important;
}

.content-relative {
  position: relative;
  z-index: 1;
}

.title-teal-custom {
  color: #2ca599 !important;
}

.page-wrapper {
  background-color: #f6f8fa !important;
}

.page-content-wrapper {
  padding: 0 16px;
}
@media (min-width: 768px) {
  .page-content-wrapper {
    padding: 0 24px;
  }
}

/* =======================================================================
   PDF EXPORT STYLES (ORIGINAL INDIGO THEME)
   ======================================================================= */
@media print {
  @page {
    size: A4 portrait;
    margin: 15mm;
  }

  body,
  html {
    background: #ffffff !important;
    background-color: #ffffff !important;
    color: #000000 !important;
    font-family: 'Plus Jakarta Sans', Arial, sans-serif !important;
  }

  /* Sembunyikan elemen Quasar & UI non-print */
  .q-header,
  .q-footer,
  .q-drawer,
  .q-drawer-container,
  .no-print,
  .layout-bg,
  .layout-glow,
  .layout-grid,
  .q-notifications,
  button,
  .q-btn {
    display: none !important;
    height: 0 !important;
    width: 0 !important;
    overflow: hidden !important;
    opacity: 0 !important;
  }

  /* Override Layout Quasar agar mengalir alami saat cetak */
  .q-layout,
  .q-page-container,
  .q-page,
  .app-layout {
    background: #ffffff !important;
    background-color: #ffffff !important;
    min-height: auto !important;
    height: auto !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
    display: block !important;
    position: relative !important;
  }

  /* Optimasi print target */
  #invoice-pdf-target {
    width: 100% !important;
    max-width: 210mm !important;
    margin: 0 auto !important;
    padding: 0 !important;
    background: #ffffff !important;
    background-color: #ffffff !important;
    color: #000000 !important;
    display: block !important;
  }

  /* Optimasi card & hilangkan shadow */
  #invoice-pdf-target .q-card {
    box-shadow: none !important;
    border: 1px solid #e0e0e0 !important;
    background: #ffffff !important;
    background-color: #ffffff !important;
    margin-bottom: 20px !important;
    page-break-inside: avoid !important;
    border-radius: 12px !important;
  }

  /* Paksa background color muncul di print */
  #invoice-pdf-target .bg-teal-section {
    background-color: #f2faf9 !important;
    color: #00796b !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  #invoice-pdf-target .bg-teal-10 {
    background-color: #00796b !important;
    color: #ffffff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  #invoice-pdf-target .bg-teal-gradient {
    background-color: #00796b !important;
    color: #ffffff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }


  #invoice-pdf-target .bg-blue-grey-10 {
    background-color: #263238 !important;
    color: #ffffff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  #invoice-pdf-target .bg-grey-1 {
    background-color: #f8f9fa !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  #invoice-pdf-target .bg-white {
    background-color: #ffffff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Chip Status */
  #invoice-pdf-target .q-chip {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    border: 1px solid currentColor !important;
  }

  /* Force Grid Row & Columns agar layout 2 kolom rapi di A4 portrait */
  #invoice-pdf-target .row {
    display: flex !important;
    flex-flow: row wrap !important;
    margin-right: -10px !important;
    margin-left: -10px !important;
  }

  #invoice-pdf-target .col-12 {
    flex: 0 0 100% !important;
    max-width: 100% !important;
    padding: 0 10px !important;
  }

  #invoice-pdf-target .col-md-7 {
    flex: 0 0 58.33333% !important;
    max-width: 58.33333% !important;
    padding: 0 10px !important;
  }

  #invoice-pdf-target .col-md-5 {
    flex: 0 0 41.66667% !important;
    max-width: 41.66667% !important;
    padding: 0 10px !important;
  }

  #invoice-pdf-target .col-sm-6 {
    flex: 0 0 50% !important;
    max-width: 50% !important;
    padding: 0 10px !important;
  }

  #invoice-pdf-target .col-sm-4 {
    flex: 0 0 33.33333% !important;
    max-width: 33.33333% !important;
    padding: 0 10px !important;
  }

  #invoice-pdf-target .q-separator {
    background-color: #e0e0e0 !important;
    height: 1px !important;
    margin: 15px 0 !important;
  }
}

.pdf-export-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Plus Jakarta Sans', sans-serif;
  margin-top: 20px;
  table-layout: fixed;
  word-wrap: break-word;
}
.pdf-export-table th {
  background-color: #00796b !important;
  color: white !important;
  padding: 8px 4px;
  font-size: 9px;
  text-transform: uppercase;
  border: 1px solid #004d40;
}
.pdf-export-table td {
  padding: 8px 4px;
  font-size: 8px;
  border: 1px solid #e0e0e0;
  color: #111;
  vertical-align: top;
  word-break: break-word;
}
</style>
