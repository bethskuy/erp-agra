<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div v-if="viewMode === 'list'" class="animate-fade">
      <div class="row items-center justify-between q-mb-xl no-print">
        <div class="col-12 col-md-6">
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
                Tagihan Supplier & Labour
                <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                  >Manajemen Account Payable (Hutang Usaha)</span
                >
              </div>
              <div class="text-subtitle1 text-grey-7 q-mt-sm">
                Catat dan pantau semua tagihan masuk (invoice) dari vendor maupun pekerja lapangan.
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-auto q-mt-md q-mt-md-none row q-gutter-sm justify-end">
          <q-btn
            color="red-9"
            icon="picture_as_pdf"
            label="Export PDF"
            unelevated
            rounded
            no-caps
            class="q-px-md q-py-sm shadow-premium text-weight-bold"
            @click="exportTablePDF"
          />
          <q-btn
            color="green-9"
            icon="table_view"
            label="Print Excel"
            unelevated
            rounded
            no-caps
            class="q-px-md q-py-sm shadow-premium text-weight-bold"
            @click="exportTableExcel"
          />
          <q-btn
            v-if="canAction('buat')"
            color="indigo-10"
            icon="add_card"
            label="Registrasi Tagihan Baru"
            unelevated
            rounded
            no-caps
            class="q-px-lg q-py-sm shadow-premium btn-hover text-weight-bold"
            @click="openAddDialog"
          />
        </div>
      </div>

      <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
            <q-card-section class="row items-center no-wrap q-pa-md">
              <div class="col">
                <div
                  class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest"
                >
                  TOTAL INVOICE
                </div>
                <div class="text-h4 text-weight-bolder q-mt-xs text-indigo-10">
                  {{ filteredRows.length }}
                </div>
              </div>
              <div
                class="bg-indigo-1 q-pa-md rounded-borders"
                style="min-width: 56px; text-align: center"
              >
                <q-icon name="receipt_long" color="indigo-10" size="28px" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
            <q-card-section class="row items-center no-wrap q-pa-md">
              <div class="col">
                <div
                  class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest"
                >
                  BELUM DIBAYAR
                </div>
                <div class="text-h4 text-weight-bolder q-mt-xs text-orange-9">
                  {{ countByStatus('Menunggu Pembayaran') + countByStatus('Dibayar Sebagian') }}
                </div>
              </div>
              <div
                class="bg-orange-1 q-pa-md rounded-borders"
                style="min-width: 56px; text-align: center"
              >
                <q-icon name="pending_actions" color="orange-9" size="28px" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
            <q-card-section class="row items-center no-wrap q-pa-md">
              <div class="col">
                <div
                  class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest"
                >
                  JATUH TEMPO
                </div>
                <div class="text-h4 text-weight-bolder q-mt-xs text-negative">
                  {{ countOverdue() }}
                </div>
              </div>
              <div
                class="bg-red-1 q-pa-md rounded-borders"
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
            class="rounded-20 border-subtle bg-indigo-10 text-white transition-all hover-shadow"
          >
            <q-card-section class="row items-center no-wrap q-pa-md">
              <div class="col">
                <div
                  class="text-overline text-indigo-2 leading-none text-weight-bold tracking-widest"
                >
                  TOTAL OUTSTANDING
                </div>
                <div class="text-h5 text-weight-bolder q-mt-xs">
                  Rp {{ formatCompact(totalOutstandingValuation) }}
                </div>
              </div>
              <div
                class="bg-white q-pa-md rounded-borders shadow-2"
                style="min-width: 56px; text-align: center"
              >
                <q-icon name="account_balance_wallet" color="indigo-10" size="28px" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print">
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
              >
                <template v-slot:prepend><q-icon name="search" color="primary" /></template>
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
                toggle-color="indigo-10"
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
              <q-input outlined dense type="date" v-model="filterStartDate" bg-color="white" />
            </div>
            <div class="col-12 col-sm-6 col-md-2">
              <div class="text-subtitle2 q-mb-xs text-weight-bold">Tanggal Akhir</div>
              <q-input outlined dense type="date" v-model="filterEndDate" bg-color="white" />
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
              >
                <template v-slot:prepend>
                  <q-icon name="storefront" color="indigo-10" />
                </template>
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
              >
                <template v-slot:prepend>
                  <q-icon name="apartment" color="indigo-10" />
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-2">
              <q-btn
                flat
                color="grey-7"
                icon="restart_alt"
                label="Reset"
                class="full-width rounded-12 text-weight-bold"
                @click="resetFilters"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white no-print">
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
              @click="openDetail(props.row)"
            >
              <q-td key="kode">
                <div class="text-weight-bold text-indigo-10">
                  {{ props.row.kode_tagihan || '-' }}
                </div>
              </q-td>

              <q-td key="invoice">
                <div class="row items-center no-wrap">
                  <q-avatar
                    size="36px"
                    color="indigo-1"
                    text-color="indigo-10"
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
                    isOverdue(props.row.jatuh_tempo, props.row.status)
                      ? 'text-negative text-weight-bold'
                      : 'text-grey-8'
                  "
                >
                  Tempo:
                  <span class="text-weight-bold">{{ formatDateIndo(props.row.jatuh_tempo) }}</span>
                </div>
              </q-td>

              <q-td key="nominal" class="text-right">
                <div class="text-weight-bolder text-indigo-10 text-subtitle2">
                  Rp {{ (props.row.grand_total || 0).toLocaleString('id-ID') }}
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

              <q-td key="aksi" class="text-center" @click.stop>
                <div class="row justify-center q-gutter-xs">
                  <q-btn
                    flat
                    round
                    color="indigo-10"
                    icon="visibility"
                    size="sm"
                    @click.stop="openDetail(props.row)"
                  >
                    <q-tooltip>Lihat Detail Tagihan</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="blue-8"
                    icon="edit"
                    size="sm"
                    @click.stop="openEditDialog(props.row)"
                  >
                    <q-tooltip>Edit Data</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="canAction('hapus')"
                    flat
                    round
                    color="negative"
                    icon="delete_outline"
                    size="sm"
                    @click.stop="confirmHapus(props.row)"
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
                <div class="text-weight-bolder text-indigo-10 uppercase tracking-widest font-11">
                  Total Nilai Tagihan (Sesuai Filter)
                </div>
                <div
                  class="text-weight-bold text-negative uppercase tracking-widest font-10 q-mt-xs"
                >
                  Total Sisa Hutang (Sesuai Filter)
                </div>
              </q-td>
              <q-td class="text-right">
                <div class="text-weight-black text-indigo-10 text-subtitle2">
                  Rp {{ totalFilteredNominal.toLocaleString('id-ID') }}
                </div>
                <div class="text-weight-bold text-negative font-11 q-mt-xs">
                  Rp {{ totalFilteredOutstanding.toLocaleString('id-ID') }}
                </div>
              </q-td>
              <q-td colspan="2"></q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-xl text-grey-5">
              <q-icon name="receipt_long" size="64px" class="q-mb-md" />
              <div class="text-h6 full-width text-center">
                Data tidak ditemukan dengan kriteria filter tersebut.
              </div>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <div v-else-if="viewMode === 'detail' && selectedTagihan" class="animate-fade q-pb-xl">
      <div class="row items-center justify-between q-mb-xl no-print">
        <div class="row items-center no-wrap">
          <q-btn
            flat
            round
            color="indigo-10"
            icon="arrow_back"
            @click="viewMode = 'list'"
            class="q-mr-md bg-white shadow-1"
          />
          <div>
            <div class="text-overline text-grey-6 text-bold tracking-widest q-mb-xs leading-none">
              INFORMASI DETAIL TAGIHAN SUPPLIER (A/P)
            </div>
            <div class="text-h5 text-weight-bolder text-indigo-10 leading-tight uppercase">
              Kode: {{ selectedTagihan.kode_tagihan }}
            </div>
          </div>
        </div>
        <div class="row items-center q-gutter-md">
          <q-btn
            unelevated
            color="white"
            text-color="indigo-10"
            icon="picture_as_pdf"
            label="CETAK PDF"
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
            <q-card flat bordered class="rounded-20 shadow-sm q-mb-lg bg-white border-indigo-thin">
              <q-card-section class="bg-indigo-50 text-indigo-10 q-py-sm border-bottom-subtle">
                <div class="text-weight-bold uppercase tracking-widest font-11 flex items-center">
                  <q-icon name="dataset" size="sm" class="q-mr-sm" /> REFERENSI DOKUMEN & SUPPLIER
                </div>
              </q-card-section>
              <q-card-section class="q-pa-lg">
                <div class="row q-col-gutter-y-lg q-col-gutter-x-md">
                  <div class="col-12 col-sm-6">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      SUPPLIER / VENDOR
                    </div>
                    <div class="text-subtitle1 text-weight-bold text-indigo-10 uppercase">
                      {{ selectedTagihan.supplier_nama || '-' }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      DIALOKASIKAN KE PROYEK
                    </div>
                    <div class="text-subtitle1 text-weight-bold uppercase">
                      {{ selectedTagihan.proyek_nama || '-' }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-4">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      NOMOR PO
                    </div>
                    <div class="text-subtitle1 text-weight-bold uppercase">
                      {{ selectedTagihan.po_nomor || '-' }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-4">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      NOMOR SPK
                    </div>
                    <div class="text-subtitle1 text-weight-bold uppercase">
                      {{ selectedTagihan.spk_nomor || '-' }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-4">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      NOMINAL PO
                    </div>
                    <div class="text-subtitle1 text-weight-bold text-primary uppercase">
                      Rp {{ (selectedTagihan.nominal_po || 0).toLocaleString('id-ID') }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="rounded-20 shadow-sm q-mb-lg bg-white border-indigo-thin">
              <q-card-section class="bg-indigo-50 text-indigo-10 q-py-sm border-bottom-subtle">
                <div class="text-weight-bold uppercase tracking-widest font-11 flex items-center">
                  <q-icon name="timeline" size="sm" class="q-mr-sm" /> INVOICE SUPPLIER & TIMELINE
                </div>
              </q-card-section>
              <q-card-section class="q-pa-lg">
                <div class="row q-col-gutter-y-lg q-col-gutter-x-md">
                  <div class="col-12 col-sm-4">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      NO. INVOICE
                    </div>
                    <div class="text-subtitle1 text-weight-bold text-indigo-10">
                      {{ selectedTagihan.nomor_invoice || '-' }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-4">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      TGL INVOICE
                    </div>
                    <div class="text-subtitle1 text-weight-bold">
                      {{ formatDateIndo(selectedTagihan.tanggal_invoice) }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-4">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      JATUH TEMPO
                    </div>
                    <div class="text-subtitle1 text-weight-bold text-orange-9">
                      {{ formatDateIndo(selectedTagihan.jatuh_tempo) }}
                    </div>
                  </div>
                  <div class="col-12">
                    <q-separator class="border-subtle" />
                  </div>
                  <div class="col-12">
                    <div
                      class="text-caption text-grey-6 text-bold uppercase tracking-widest q-mb-xs"
                    >
                      DESKRIPSI / KETERANGAN TAGIHAN
                    </div>
                    <div class="text-body2 text-grey-9">
                      {{ selectedTagihan.keterangan || '-' }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card
              v-if="selectedTagihan?.lampiran && selectedTagihan.lampiran.length > 0"
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
                    v-for="(doc, dIdx) in selectedTagihan.lampiran"
                    :key="dIdx"
                    clickable
                    v-ripple
                    @click="openLink(doc.url || doc.base64)"
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
          </div>

          <div class="col-12 col-md-5">
            <q-card
              flat
              bordered
              class="rounded-20 shadow-sm bg-white border-indigo-thin overflow-hidden"
            >
              <div class="bg-indigo-10 text-white q-pa-lg text-center">
                <div class="text-overline text-indigo-2 text-bold tracking-widest uppercase">
                  GRAND TOTAL TAGIHAN
                </div>
                <div class="text-h3 text-weight-black q-mt-sm">
                  Rp {{ (selectedTagihan.grand_total || 0).toLocaleString('id-ID') }}
                </div>
              </div>

              <q-card-section class="q-pa-lg">
                <div
                  class="text-weight-bold text-indigo-10 q-mb-md uppercase tracking-widest font-11"
                >
                  RINCIAN KALKULASI PAJAK
                </div>

                <div class="row justify-between items-center q-mb-sm">
                  <div class="text-grey-7 font-bold">Nominal Invoice</div>
                  <div class="text-weight-bold text-subtitle1">
                    Rp {{ (selectedTagihan.nominal_invoice || 0).toLocaleString('id-ID') }}
                  </div>
                </div>
                <q-separator class="q-my-sm border-subtle" />
                <div class="row justify-between items-center q-mb-sm">
                  <div class="text-grey-7 font-bold">DPP</div>
                  <div class="text-weight-bold text-subtitle1">
                    Rp {{ (selectedTagihan.nilai_dpp || 0).toLocaleString('id-ID') }}
                  </div>
                </div>
                <div class="row justify-between items-center q-mb-sm">
                  <div class="text-grey-7 font-bold">
                    PPN ({{ selectedTagihan.ppn_persen || 0 }}%)
                  </div>
                  <div class="text-weight-bold text-subtitle1 text-positive">
                    + Rp
                    {{ (selectedTagihan.ppn_nominal || 0).toLocaleString('id-ID') }}
                  </div>
                </div>
                <div class="row justify-between items-center q-mb-md">
                  <div class="text-grey-7 font-bold">
                    PPh Potongan ({{ selectedTagihan.pph_persen || 0 }}%)
                  </div>
                  <div class="text-weight-bold text-subtitle1 text-negative">
                    - Rp
                    {{ (selectedTagihan.pph_nominal || 0).toLocaleString('id-ID') }}
                  </div>
                </div>

                <div class="row justify-between items-center q-mt-xl q-mb-sm no-print">
                  <div class="text-weight-bold text-indigo-10 uppercase tracking-widest font-11">
                    STATUS PEMBAYARAN
                  </div>
                  <q-btn
                    v-if="selectedTagihan.status !== 'Lunas'"
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
                      (selectedTagihan.grand_total || 0) - (selectedTagihan.total_dibayar || 0) > 0
                        ? 'text-negative'
                        : 'text-positive'
                    "
                  >
                    Rp
                    {{
                      (
                        (selectedTagihan.grand_total || 0) - (selectedTagihan.total_dibayar || 0)
                      ).toLocaleString('id-ID')
                    }}
                  </div>
                </div>
              </q-card-section>
            </q-card>

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

    <div v-else-if="viewMode === 'form'" class="animate-fade">
      <div class="row items-center justify-between q-mb-xl no-print">
        <div class="col-12 col-md-8">
          <div class="row items-center no-wrap">
            <q-btn
              flat
              round
              color="indigo-10"
              icon="arrow_back"
              @click="viewMode = 'list'"
              class="q-mr-md bg-white shadow-1"
            />
            <div>
              <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight uppercase">
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
            color="indigo-10"
            icon="save"
            label="SIMPAN DOKUMEN"
            @click="simpanTagihan"
            :loading="submitting"
            rounded
            class="q-px-xl text-weight-bold shadow-premium"
          />
        </div>
      </div>

      <div class="row justify-center">
        <div class="col-12 col-xl-10">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-5">
              <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1">
                <q-card-section
                  class="bg-indigo-1 q-py-sm text-indigo-10 text-weight-bold flex items-center border-bottom"
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
                      class="text-weight-bold text-indigo-10"
                    />
                  </div>

                  <div>
                    <div class="label-req q-mb-xs text-primary">Data Purchase Order (Opsional)</div>
                    <q-select
                      outlined
                      dense
                      v-model="form.po_ref"
                      :options="optPO"
                      option-label="nomor"
                      placeholder="Pilih PO..."
                      bg-color="blue-50"
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
                      prefix="Rp"
                      class="text-weight-bold text-grey-9"
                    />
                  </div>

                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <div class="label-req q-mb-xs">Referensi Proyek</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.proyek_nama"
                        readonly
                        bg-color="grey-2"
                        placeholder="Otomatis dari PO..."
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="label-req q-mb-xs">Nomor SPK</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.spk_nomor"
                        readonly
                        bg-color="grey-2"
                        placeholder="Otomatis dari PO..."
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-7">
              <q-card flat bordered class="rounded-20 bg-white shadow-1 overflow-hidden">
                <q-card-section
                  class="bg-indigo-10 q-py-sm text-white text-weight-bold flex items-center border-bottom"
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
                        v-model.number="form.nominal_invoice"
                        bg-color="white"
                        class="text-weight-bold text-h6 text-indigo-10"
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
                        color="indigo-10"
                        icon="add"
                        size="sm"
                        @click="addDocRow"
                      />
                    </div>
                    <div class="text-caption text-grey-7 q-mb-md">
                      Upload invoice asli, faktur pajak, surat jalan, atau BAST.
                    </div>

                    <div class="bg-indigo-50 q-pa-sm rounded-12 border-dashed">
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
                              v-model="item.label"
                              placeholder="ex: Invoice Asli"
                            />
                          </div>
                          <div class="col-12 col-md-6">
                            <q-file outlined dense v-model="item.fileObj" label="Pilih File">
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

    <q-dialog
      v-model="showPaymentDialog"
      maximized
      persistent
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <q-toolbar class="bg-indigo-10 text-white q-py-md shadow-4 shrink">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-black uppercase"> UPDATE PEMBAYARAN </q-toolbar-title>
          <q-btn
            unelevated
            color="white"
            text-color="indigo-10"
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
              <q-card flat bordered class="rounded-20 bg-white shadow-1 q-pa-lg q-pa-md-xl">
                <div class="text-overline text-indigo-10 text-bold tracking-widest q-mb-sm">
                  RINCIAN PEMBAYARAN
                </div>
                <div class="row q-col-gutter-md q-mb-lg">
                  <q-input
                    outlined
                    dense
                    type="date"
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
                    v-model.number="paymentForm.nominal"
                    label="Nominal Dibayar (Rp) *"
                    prefix="Rp"
                    input-class="text-weight-bold text-indigo-10"
                    bg-color="white"
                    class="col-12 col-md-6"
                  />
                  <q-input
                    outlined
                    dense
                    type="textarea"
                    rows="3"
                    v-model="paymentForm.catatan"
                    label="Catatan / Keterangan (Opsional)"
                    placeholder="Contoh: DP 50% Termin 1..."
                    bg-color="white"
                    class="col-12"
                  />
                </div>

                <q-separator class="q-my-lg border-subtle" />

                <div class="text-overline text-indigo-10 text-bold tracking-widest q-mb-sm">
                  BUKTI PEMBAYARAN / TRANSFER
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <q-file
                      outlined
                      dense
                      v-model="paymentForm.bukti_file"
                      label="Upload Bukti Pembayaran (Opsional)"
                      accept="image/*, .pdf"
                      bg-color="white"
                      class="bg-indigo-50"
                    >
                      <template v-slot:prepend>
                        <q-icon name="cloud_upload" color="indigo-10" />
                      </template>
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

    <div style="position: absolute; top: -9999px; left: -9999px; width: 1122px; z-index: -1">
      <div id="table-pdf-export" class="bg-white q-pa-lg">
        <div class="row items-center q-mb-lg border-bottom-subtle q-pb-md">
          <q-avatar
            color="indigo-10"
            text-color="white"
            icon="receipt_long"
            size="48px"
            class="q-mr-md shadow-sm"
          />
          <div>
            <div class="text-h4 text-weight-black text-indigo-10 uppercase tracking-widest">
              Laporan Tagihan Supplier (A/P)
            </div>
            <div class="text-subtitle1 text-grey-8 font-weight-medium q-mt-xs">
              Diekspor pada: {{ new Date().toLocaleString('id-ID') }}
            </div>
          </div>
        </div>
        <table class="pdf-export-table">
          <thead>
            <tr>
              <th width="5%">NO</th>
              <th width="15%">KODE & INVOICE</th>
              <th width="20%">VENDOR</th>
              <th width="20%">PROYEK & PO</th>
              <th width="15%">TIMELINE</th>
              <th width="15%" class="text-right">GRAND TOTAL</th>
              <th width="10%">STATUS</th>
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
                <div class="text-weight-bold uppercase">{{ row.proyek_nama || 'NON-PROYEK' }}</div>
                <div class="text-caption text-grey-7">PO: {{ row.po_nomor || '-' }}</div>
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
              <td colspan="7" class="text-center q-pa-xl text-grey-6 italic">
                Tidak ada data tagihan.
              </td>
            </tr>
            <tr v-if="filteredRows.length > 0" style="background-color: #e8eaf6">
              <td colspan="5" class="text-right">
                <div class="text-weight-bold uppercase" style="color: #1a237e">
                  Total Nilai Tagihan
                </div>
                <div class="text-weight-bold text-negative uppercase q-mt-xs">
                  Total Sisa Hutang
                </div>
              </td>
              <td class="text-right">
                <div class="text-weight-bold text-indigo-10">
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
// eslint-disable-next-line no-unused-vars
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { db, storage } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const authStore = useAuthStore()

// State
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

// Payment Tracking State
const showPaymentDialog = ref(false)
const savingPayment = ref(false)
const paymentForm = ref({
  tanggal: new Date().toISOString().substr(0, 10),
  nominal: 0,
  catatan: '',
  bukti_file: null,
})

// Master Data Lists
const optSupplier = ref([])
const allSupplier = ref([])
const allProyek = ref([])
const optProyek = ref([])
const optProyekFilter = ref([])
const optVendorFilter = ref([])
const optPO = ref([])

let unsubTagihan = null

// Form State
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
  spk_nomor: '',
  ppn_persen: 0,
  pph_persen: 0,
  status: 'Menunggu Pembayaran',
  lampiran: [],
}
const form = ref({ ...formDefault })

// Columns
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

// Generate Kode Tagihan
const generateKodeTagihan = () => {
  const count = rows.value.length + 1
  const padded = count.toString().padStart(3, '0')
  const year = new Date().getFullYear()
  const month = ('0' + (new Date().getMonth() + 1)).slice(-2)
  return `AP/${year}${month}/${padded}`
}

// Fetch Data
const fetchData = async () => {
  loading.value = true

  // Ambil Data Master Supplier
  const snapSupp = await getDocs(collection(db, 'suppliers'))
  allSupplier.value = snapSupp.docs.map((d) => ({ id: d.id, ...d.data() }))
  optSupplier.value = [...allSupplier.value]
  optVendorFilter.value = [...allSupplier.value]

  // Ambil Data Proyek
  const snapProj = await getDocs(collection(db, 'proyek'))
  allProyek.value = snapProj.docs.map((d) => ({ id: d.id, nama: d.data().nama }))
  optProyek.value = [...allProyek.value]
  optProyekFilter.value = [...allProyek.value]

  // Ambil Data PO untuk Referensi
  const snapPo = await getDocs(collection(db, 'purchase_order'))
  optPO.value = snapPo.docs.map((d) => ({ id: d.id, ...d.data() }))

  // Listener Tagihan
  unsubTagihan = onSnapshot(collection(db, 'finance_tagihan'), (snap) => {
    rows.value = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    loading.value = false
  })
}

// Computed Filters & Stats
const filteredRows = computed(() => {
  let result = rows.value

  // 1. Status Filter
  if (statusFilter.value === 'OUTSTANDING') {
    result = result.filter(
      (r) => r.status === 'Menunggu Pembayaran' || r.status === 'Dibayar Sebagian',
    )
  } else if (statusFilter.value === 'LUNAS') {
    result = result.filter((r) => r.status === 'Lunas')
  }

  // 2. Filter Pencarian Teks
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

  // 3. Filter Periode Tanggal
  if (filterStartDate.value) {
    result = result.filter((r) => r.tanggal_invoice >= filterStartDate.value)
  }
  if (filterEndDate.value) {
    result = result.filter((r) => r.tanggal_invoice <= filterEndDate.value)
  }

  // 4. Filter Proyek (Multi-Select)
  if (filterSelectedProyek.value && filterSelectedProyek.value.length > 0) {
    const selectedIds = filterSelectedProyek.value.map((p) => p.id)
    result = result.filter((r) => selectedIds.includes(r.proyek_id))
  }

  // 5. Filter Vendor (Multi-Select)
  if (filterSelectedVendor.value && filterSelectedVendor.value.length > 0) {
    const selectedIds = filterSelectedVendor.value.map((v) => v.id)
    result = result.filter((r) => selectedIds.includes(r.supplier_id))
  }

  return result
})

const totalFilteredNominal = computed(() => {
  return filteredRows.value.reduce((sum, r) => sum + (Number(r.grand_total) || 0), 0)
})

const totalFilteredOutstanding = computed(() => {
  return filteredRows.value
    .filter((r) => r.status !== 'Lunas' && r.status !== 'Draft')
    .reduce((sum, r) => sum + ((Number(r.grand_total) || 0) - (Number(r.total_dibayar) || 0)), 0)
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

const countByStatus = (status) => filteredRows.value.filter((r) => r.status === status).length

const countOverdue = () => {
  const today = new Date().toISOString().substr(0, 10)
  return filteredRows.value.filter((r) => r.jatuh_tempo < today && r.status !== 'Lunas').length
}

const totalOutstandingValuation = computed(() => {
  return totalFilteredOutstanding.value
})

const isOverdue = (dateStr, status) => {
  if (status === 'Lunas') return false
  const today = new Date().toISOString().substr(0, 10)
  return dateStr < today
}

// Dialog & Form Logic
const openDetail = (row) => {
  selectedTagihan.value = row
  viewMode.value = 'detail'
  window.scrollTo(0, 0)
}

const openAddDialog = () => {
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  form.value.kode_tagihan = generateKodeTagihan()
  viewMode.value = 'form'
}

const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = {
    ...JSON.parse(JSON.stringify(row)),
    supplier: row.supplier_id ? { id: row.supplier_id, nama: row.supplier_nama } : null,
    proyek_id: row.proyek_id || null,
    proyek_nama: row.proyek_nama || '',
    spk_nomor: row.spk_nomor || '',
    po_ref: row.po_nomor ? { nomor: row.po_nomor } : null,
    nominal_po: row.nominal_po || 0,
  }
  if (!form.value.kode_tagihan) form.value.kode_tagihan = generateKodeTagihan()
  if (!form.value.nominal_invoice) form.value.nominal_invoice = form.value.nilai_dpp || 0
  viewMode.value = 'form'
}

// Export Logics
const exportTablePDF = () => {
  const element = document.getElementById('table-pdf-export')
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `Laporan_Tagihan_Supplier_${Date.now()}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
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
    const thStyle =
      'background-color: #1a237e; color: #ffffff; font-weight: bold; border: 1px solid #dddddd; padding: 10px; text-align: center; text-transform: uppercase;'
    const tdStyle = 'border: 1px solid #dddddd; padding: 8px; vertical-align: top;'
    const tdNumStyle = tdStyle + ' text-align: right;'
    const tdCenterStyle = tdStyle + ' text-align: center;'

    let tableHtml =
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">'
    tableHtml += '<head><meta charset="utf-8"></head><body>'
    tableHtml +=
      '<h2 style="color: #1a237e; margin-bottom: 5px; font-family: sans-serif;">Laporan Tagihan Supplier (Account Payable)</h2>'
    tableHtml +=
      '<p style="margin-top: 0; font-family: sans-serif;">Diekspor pada: ' +
      new Date().toLocaleString('id-ID') +
      '</p><br>'
    tableHtml += '<table style="border-collapse: collapse; width: 100%; font-family: sans-serif;">'
    tableHtml += '<thead><tr>'
    tableHtml += `<th style="${thStyle}">No</th>`
    tableHtml += `<th style="${thStyle}">Kode Tagihan</th>`
    tableHtml += `<th style="${thStyle}">No Invoice</th>`
    tableHtml += `<th style="${thStyle}">Vendor / Supplier</th>`
    tableHtml += `<th style="${thStyle}">Proyek</th>`
    tableHtml += `<th style="${thStyle}">Referensi PO</th>`
    tableHtml += `<th style="${thStyle}">Tgl Invoice</th>`
    tableHtml += `<th style="${thStyle}">Jatuh Tempo</th>`
    tableHtml += `<th style="${thStyle}">Grand Total (Rp)</th>`
    tableHtml += `<th style="${thStyle}">Status</th>`
    tableHtml += '</tr></thead><tbody>'

    filteredRows.value.forEach((r, index) => {
      tableHtml += `
        <tr>
          <td style="${tdCenterStyle}">${index + 1}</td>
          <td style="${tdStyle}">${r.kode_tagihan || '-'}</td>
          <td style="${tdStyle}">${r.nomor_invoice || '-'}</td>
          <td style="${tdStyle}">${r.supplier_nama || '-'}</td>
          <td style="${tdStyle}">${r.proyek_nama || '-'}</td>
          <td style="${tdStyle}">${r.po_nomor || '-'}</td>
          <td style="${tdCenterStyle}">${formatDateIndo(r.tanggal_invoice)}</td>
          <td style="${tdCenterStyle}">${formatDateIndo(r.jatuh_tempo)}</td>
          <td style="${tdNumStyle}">${r.grand_total || 0}</td>
          <td style="${tdCenterStyle}">${r.status || '-'}</td>
        </tr>
      `
    })

    tableHtml += `
        <tr style="background-color: #f5f5f5;">
          <td colspan="8" style="${tdStyle} text-align: right; font-weight: bold;">TOTAL NILAI TAGIHAN (SESUAI FILTER)</td>
          <td style="${tdNumStyle} font-weight: bold;">${totalFilteredNominal.value}</td>
          <td style="${tdStyle}"></td>
        </tr>
        <tr style="background-color: #ffebee;">
          <td colspan="8" style="${tdStyle} text-align: right; font-weight: bold; color: #c62828;">TOTAL SISA HUTANG (SESUAI FILTER)</td>
          <td style="${tdNumStyle} font-weight: bold; color: #c62828;">${totalFilteredOutstanding.value}</td>
          <td style="${tdStyle}"></td>
        </tr>
    `

    tableHtml += '</tbody></table></body></html>'

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Data_Tagihan_Supplier_${Date.now()}.xls`
    link.click()
    URL.revokeObjectURL(url)

    $q.notify({ type: 'positive', message: 'Data berhasil diekspor ke Excel' })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal mengekspor data ke Excel' })
  }
}

// Real-time Calculations
const calculatedPpn = computed(() => {
  return ((form.value.nominal_invoice || 0) * (form.value.ppn_persen || 0)) / 100
})
const calculatedPph = computed(() => {
  return ((form.value.nominal_invoice || 0) * (form.value.pph_persen || 0)) / 100
})
const calculatedGrandTotal = computed(() => {
  return (form.value.nominal_invoice || 0) + calculatedPpn.value - calculatedPph.value
})

// Auto Fill dari PO
const onPoSelect = (poObj) => {
  if (poObj) {
    form.value.po_nomor = poObj.nomor
    form.value.po_tanggal = poObj.tanggal || ''
    form.value.nominal_po = poObj.grand_total || 0
    form.value.nominal_invoice = poObj.grand_total || 0
    form.value.keterangan = `Tagihan berdasarkan PO: ${poObj.nomor}`
    form.value.spk_nomor = poObj.nomor_spk || poObj.spk_nomor || '-'

    // Auto fill supplier
    const matchedSupp = allSupplier.value.find(
      (s) => s.nama.toLowerCase() === poObj.kepada_yth?.toLowerCase(),
    )
    if (matchedSupp) form.value.supplier = { id: matchedSupp.id, nama: matchedSupp.nama }
    else form.value.supplier = { id: null, nama: poObj.kepada_yth }

    // Auto fill proyek (sebagai readonly data sekarang)
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

// Proses Simpan Database
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
  if (!form.value.nomor_invoice || !form.value.supplier) {
    return $q.notify({
      type: 'warning',
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
      keterangan: form.value.keterangan,
      status: 'Menunggu Pembayaran',
      lampiran: form.value.lampiran,
      updatedAt: serverTimestamp(),
    }

    if (isEditMode.value) {
      await updateDoc(doc(db, 'finance_tagihan', form.value.id), payload)
    } else {
      payload.createdAt = serverTimestamp()
      payload.pembuat = authStore.user?.nama || 'Admin'
      await addDoc(collection(db, 'finance_tagihan'), payload)
    }

    viewMode.value = 'list'
    $q.notify({ type: 'positive', message: 'Tagihan berhasil disimpan!' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan tagihan.' })
  } finally {
    $q.loading.hide()
    submitting.value = false
  }
}

const confirmHapus = (row) => {
  $q.dialog({
    title: 'Hapus Tagihan',
    message: `Hapus invoice ${row.nomor_invoice} secara permanen?`,
    cancel: true,
    ok: { color: 'negative', label: 'Hapus', unelevated: true },
  }).onOk(async () => {
    await deleteDoc(doc(db, 'finance_tagihan', row.id))
    $q.notify({ type: 'positive', message: 'Tagihan terhapus' })
  })
}

// ============================================================================
// LOGIKA PEMBAYARAN (CICILAN / PELUNASAN)
// ============================================================================
const openPaymentDialog = () => {
  paymentForm.value = {
    tanggal: new Date().toISOString().substr(0, 10),
    nominal: 0,
    catatan: '',
    bukti_file: null,
  }
  showPaymentDialog.value = true
}

const savePayment = async () => {
  if (!paymentForm.value.nominal || paymentForm.value.nominal <= 0) {
    return $q.notify({ type: 'warning', message: 'Nominal pembayaran harus lebih besar dari 0' })
  }

  savingPayment.value = true
  let buktiUrl = ''

  try {
    // 1. Upload Bukti Pembayaran (Jika Ada)
    if (paymentForm.value.bukti_file) {
      $q.loading.show({ message: 'Mengunggah bukti pembayaran...' })
      const file = paymentForm.value.bukti_file
      const fRef = storageRef(storage, `finance/pembayaran_tagihan/${Date.now()}_${file.name}`)
      await uploadBytes(fRef, file)
      buktiUrl = await getDownloadURL(fRef)
      $q.loading.hide()
    }

    // 2. Kalkulasi Status & Total
    const newNominal = Number(paymentForm.value.nominal) || 0
    const currentTotal = Number(selectedTagihan.value.total_dibayar) || 0
    const grandTotal = Number(selectedTagihan.value.grand_total) || 0

    const newTotal = currentTotal + newNominal
    let newStatus = 'Menunggu Pembayaran'
    if (newTotal >= grandTotal) {
      newStatus = 'Lunas'
    } else if (newTotal > 0) {
      newStatus = 'Dibayar Sebagian'
    }

    const paymentRecord = {
      id: Date.now().toString(),
      tanggal: paymentForm.value.tanggal,
      nominal: newNominal,
      catatan: paymentForm.value.catatan,
      bukti_url: buktiUrl,
      createdAt: new Date().toISOString(),
    }

    // 3. Simpan ke Firestore
    await updateDoc(doc(db, 'finance_tagihan', selectedTagihan.value.id), {
      total_dibayar: newTotal,
      status: newStatus,
      riwayat_pembayaran: arrayUnion(paymentRecord),
      updatedAt: serverTimestamp(),
    })

    // 4. Update local state untuk reaktif UI (tanpa refresh)
    if (!selectedTagihan.value.riwayat_pembayaran) {
      selectedTagihan.value.riwayat_pembayaran = []
    }
    selectedTagihan.value.total_dibayar = newTotal
    selectedTagihan.value.status = newStatus
    selectedTagihan.value.riwayat_pembayaran.push(paymentRecord)

    $q.notify({ type: 'positive', message: 'Pembayaran berhasil dicatat!' })
    showPaymentDialog.value = false
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Gagal mencatat pembayaran.' })
    $q.loading.hide()
  } finally {
    savingPayment.value = false
  }
}

// Utils
const formatDateIndo = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
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

const exportToPDF = () => {
  $q.notify({
    type: 'info',
    message: 'Gunakan fitur cetak browser (Ctrl+P) untuk menyimpan tampilan rincian ini.',
  })
  window.print()
}

const openLink = (url) => {
  if (url) window.open(url, '_blank')
}

// eslint-disable-next-line no-unused-vars
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  return true
}

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  if (unsubTagihan) unsubTagihan()
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
.border-dashed {
  border: 2px dashed #e0e0e0;
}
.dashed-box {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
}

/* Table Styling */
.finance-table :deep(thead tr th) {
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
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(26, 35, 126, 0.1) !important;
}

.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transition: 0.3s;
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

.label-req {
  font-size: 11px;
  font-weight: 800;
  color: #444;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.block {
  display: block;
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
.bg-blue-50 {
  background-color: #f0f4ff !important;
}
.border-bottom {
  border-bottom: 1px solid #eee;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media print {
  body {
    background: white !important;
  }
  .no-print {
    display: none !important;
  }
}

/* =======================================================================
   TABLE PDF EXPORT STYLES
   ======================================================================= */
.pdf-export-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Plus Jakarta Sans', sans-serif;
  margin-top: 20px;
}
.pdf-export-table th {
  background-color: #1a237e !important;
  color: white !important;
  padding: 12px 8px;
  font-size: 11px;
  text-transform: uppercase;
  border: 1px solid #1a237e;
}
.pdf-export-table td {
  padding: 10px 8px;
  font-size: 11px;
  border: 1px solid #e0e0e0;
  color: #111;
  vertical-align: top;
}
</style>
