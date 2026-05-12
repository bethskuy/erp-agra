<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <!-- =====================================================================================
         VIEW 1: LIST DAFTAR TAGIHAN UTAMA
         ===================================================================================== -->
    <div v-if="viewMode === 'list_proyek'" class="animate-fade">
      <!-- HEADER SECTION -->
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
          <q-btn
            unelevated
            color="indigo-10"
            icon="add_box"
            label="BUAT TAGIHAN BARU"
            @click="openAddTagihanDialog"
            class="rounded-20 q-px-xl text-weight-bold shadow-premium"
          />
        </div>
      </div>

      <!-- SUMMARY CARDS / KPI FINANCE -->
      <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
            <q-card-section class="row items-center no-wrap q-pa-md">
              <div class="col">
                <div
                  class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest"
                >
                  TAGIHAN AKTIF
                </div>
                <div class="text-h4 text-weight-bolder q-mt-xs text-indigo-10">
                  {{ tagihanAktif.length }}
                  <span class="text-subtitle1 text-weight-medium">Data</span>
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
                  TAGIHAN LUNAS
                </div>
                <div class="text-h4 text-weight-bolder q-mt-xs text-positive">
                  {{ tagihanLunas.length }}
                  <span class="text-subtitle1 text-weight-medium">Data</span>
                </div>
              </div>
              <div
                class="bg-green-1 q-pa-md rounded-borders"
                style="min-width: 56px; text-align: center"
              >
                <q-icon name="task_alt" color="positive" size="28px" />
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
                  {{ tagihanOverdue.length }}
                  <span class="text-subtitle1 text-weight-medium">Data</span>
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
                  Rp {{ formatCompact(totalOutstanding) }}
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

      <!-- SEARCH & FILTER AREA -->
      <q-card
        flat
        bordered
        class="q-mb-lg shadow-1 rounded-20 bg-white no-print border-indigo-thin"
      >
        <q-card-section class="q-py-md">
          <div class="row items-center q-col-gutter-md">
            <div class="col-12 col-md-5">
              <q-input
                v-model="searchQuery"
                outlined
                dense
                rounded
                placeholder="Cari Kode, BAP, SPK atau Proyek..."
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
        </q-card-section>
      </q-card>

      <!-- MAIN TABLE DATA (DAFTAR TAGIHAN) -->
      <q-card
        flat
        bordered
        class="rounded-20 shadow-sm overflow-hidden bg-white border-indigo-thin animate-fade"
      >
        <q-table
          :rows="filteredTagihan"
          :columns="columnsTagihan"
          row-key="id"
          flat
          :loading="loading"
          :pagination="{ rowsPerPage: 15 }"
          class="finance-table"
        >
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-blue-grey-10 text-white">
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
              class="hover-bg transition-all cursor-pointer"
              @click="openDetail(props.row)"
            >
              <q-td class="text-center font-bold text-grey-7">{{ props.rowIndex + 1 }}</q-td>

              <q-td key="kode">
                <div class="text-weight-bold text-indigo-10 text-subtitle2">
                  {{ props.row.kode_tagihan }}
                </div>
                <div class="text-caption text-blue-grey-8 uppercase font-bold">
                  BAP: {{ props.row.bap_number || '-' }}
                </div>
              </q-td>

              <q-td key="proyek_spk">
                <div class="text-weight-bold text-blue-grey-10 uppercase">
                  {{ props.row.proyek_nama || '-' }}
                </div>
                <div class="text-caption text-grey-7">SPK: {{ props.row.nomor_spk || '-' }}</div>
              </q-td>

              <q-td key="invoice_ar">
                <div class="text-weight-bold text-primary uppercase">
                  {{
                    typeof props.row.nomor_invoice_customer === 'object'
                      ? props.row.nomor_invoice_customer?.nomor_invoice
                      : props.row.nomor_invoice_customer || '-'
                  }}
                </div>
                <div class="text-caption text-grey-7">
                  Faktur: {{ formatDateIndo(props.row.tanggal_faktur) }}
                </div>
              </q-td>

              <q-td key="timeline">
                <div class="text-caption text-grey-8">
                  Inv:
                  <span class="text-bold">{{ formatDateIndo(props.row.tanggal_invoice) }}</span>
                </div>
                <div class="text-caption text-grey-8">
                  Submit:
                  <span class="text-bold">{{ formatDateIndo(props.row.tanggal_submit) }}</span>
                </div>
              </q-td>

              <q-td key="progress" class="text-center">
                <div class="text-weight-bold text-indigo-10">
                  {{ props.row.progress_persen || 0 }}%
                </div>
                <div class="text-caption text-grey-6 uppercase">
                  {{ props.row.tahap_ke || props.row.termin || '-' }}
                </div>
              </q-td>

              <q-td key="nominal" class="text-right">
                <div class="text-weight-bold text-indigo-10 text-subtitle1">
                  Rp {{ (props.row.net_amount || 0).toLocaleString('id-ID') }}
                </div>
                <div class="text-caption text-grey-6">Net Amount</div>
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
                    @click.stop="openEditTagihanDialog(props.row)"
                  >
                    <q-tooltip>Edit Tagihan</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click.stop="deleteTagihan(props.row)"
                  >
                    <q-tooltip>Hapus Tagihan</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-xl text-grey-5">
              <q-icon name="receipt" size="48px" class="q-mb-md" />
              <div class="text-h6 full-width text-center">Belum ada tagihan yang diregistrasi.</div>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- =====================================================================================
         VIEW 2: DETAIL TAGIHAN (DASHBOARD LAYOUT / VIEW SWITCHER)
         ===================================================================================== -->
    <div v-else-if="viewMode === 'detail_tagihan' && selectedTagihan" class="animate-fade q-pb-xl">
      <!-- Top Action Bar -->
      <div class="row items-center justify-between q-mb-xl no-print">
        <div class="row items-center no-wrap">
          <q-btn
            flat
            round
            color="indigo-10"
            icon="arrow_back"
            @click="viewMode = 'list_proyek'"
            class="q-mr-md bg-white shadow-1"
          />
          <div>
            <div class="text-overline text-grey-6 text-bold tracking-widest q-mb-xs leading-none">
              INFORMASI DETAIL TAGIHAN PROYEK
            </div>
            <div class="text-h5 text-weight-bolder text-indigo-10 leading-tight uppercase">
              Kode: {{ selectedTagihan.kode_tagihan }}
            </div>
          </div>
        </div>
      </div>

      <!-- MAIN CONTENT WRAPPER -->
      <div id="invoice-pdf-target" class="bg-transparent">
        <!-- HEADER RINCIAN & STATUS -->
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
          <!-- KOLOM KIRI: REFERENSI & TIMELINE -->
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

                  <div class="col-12">
                    <q-separator class="border-subtle" />
                  </div>

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

          <!-- KOLOM KANAN: FINANCIAL SUMMARY & LAMPIRAN -->
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

                <div
                  class="q-mt-xl text-weight-bold text-indigo-10 q-mb-md uppercase tracking-widest font-11"
                >
                  STATUS PEMBAYARAN
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

            <!-- CARD 4: LAMPIRAN (NON-PRINT) -->
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
          </div>
        </div>
      </div>
    </div>

    <!-- =====================================================================================
         DIALOG BUAT / EDIT TAGIHAN BARU (FULLSCREEN)
         ===================================================================================== -->
    <q-dialog
      v-model="showTagihanDialog"
      maximized
      persistent
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <!-- HEADER DIALOG FULLSCREEN -->
        <q-toolbar class="bg-indigo-10 text-white q-py-md shadow-4 shrink">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-black uppercase">
            {{ isEditTagihanMode ? 'EDIT DATA TAGIHAN SPK' : 'REGISTRASI TAGIHAN SPK BARU' }}
          </q-toolbar-title>
          <q-btn
            unelevated
            color="white"
            text-color="indigo-10"
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
              <q-card flat bordered class="rounded-20 bg-white shadow-1 q-pa-lg q-pa-md-xl">
                <!-- SECTION 1: REFERENSI PROYEK & KONTRAK -->
                <div class="text-overline text-indigo-10 text-bold tracking-widest q-mb-sm">
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
                    bg-color="blue-50"
                  >
                    <template v-slot:no-option>
                      <q-item
                        ><q-item-section class="text-grey italic"
                          >Proyek tidak ditemukan</q-item-section
                        ></q-item
                      >
                    </template>
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
                    bg-color="blue-50"
                    :disable="!formTagihan.proyek_id"
                    @update:model-value="onSpkSelect"
                  >
                    <template v-slot:no-option>
                      <q-item
                        ><q-item-section class="text-grey italic"
                          >Tidak ada SPK pada proyek ini</q-item-section
                        ></q-item
                      >
                    </template>
                  </q-select>

                  <q-input
                    class="col-12 col-md-6"
                    outlined
                    dense
                    v-model="formTagihan.bap_number"
                    label="BAP Number"
                    bg-color="white"
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
                    bg-color="blue-50"
                  >
                    <template v-slot:no-option>
                      <q-item
                        ><q-item-section class="text-grey italic"
                          >Invoice tidak ditemukan atau sudah digunakan</q-item-section
                        ></q-item
                      >
                    </template>
                  </q-select>
                </div>

                <!-- SECTION 2: DETAIL PEKERJAAN & TIMELINE -->
                <div class="text-overline text-indigo-10 text-bold tracking-widest q-mb-sm">
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
                  />

                  <q-input
                    class="col-12 col-md-6"
                    outlined
                    dense
                    v-model="formTagihan.jenis_pekerjaan"
                    label="Jenis Pekerjaan"
                    bg-color="white"
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
                  />
                </div>

                <!-- SECTION 3: NILAI TAGIHAN & PAJAK -->
                <div class="text-overline text-indigo-10 text-bold tracking-widest q-mb-sm">
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
                  />

                  <!-- NOMINAL INVOICE KOTOR -->
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
                  />

                  <!-- DPP OTOMATIS -->
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
                  />

                  <!-- Kalkulasi Otomatis PPN -->
                  <q-input
                    class="col-12 col-md-4"
                    outlined
                    dense
                    type="number"
                    v-model.number="formTagihan.ppn_persen"
                    label="Persentase PPN (%)"
                    suffix="%"
                    bg-color="white"
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
                  />

                  <!-- Kalkulasi Otomatis PPh -->
                  <q-input
                    class="col-12 col-md-4"
                    outlined
                    dense
                    type="number"
                    v-model.number="formTagihan.pph_persen"
                    label="Persentase PPh (%)"
                    suffix="%"
                    bg-color="white"
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
                  />

                  <!-- Net Amount -->
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
                  />
                </div>

                <!-- SECTION 4: LAMPIRAN DOKUMEN DINAMIS -->
                <q-separator class="q-my-lg border-subtle" />
                <div class="text-overline text-indigo-10 text-bold tracking-widest q-mb-sm">
                  4. LAMPIRAN DOKUMEN (OPSIONAL)
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <div
                      v-for="(doc, dIdx) in formTagihan.dokumen_lampiran"
                      :key="dIdx"
                      class="bg-indigo-50 q-pa-md q-mb-sm rounded-12 border-dashed"
                    >
                      <div class="row items-center q-col-gutter-md">
                        <div class="col-12 col-md-5">
                          <q-input
                            outlined
                            dense
                            v-model="doc.label"
                            placeholder="Nama / Judul Dokumen (Contoh: Bukti BAP)..."
                            bg-color="white"
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
                      color="indigo-10"
                      icon="add"
                      label="TAMBAH DOKUMEN LAMPIRAN"
                      class="full-width q-mt-sm rounded-12 text-weight-bold dashed-btn"
                      @click="addDocumentRow"
                    />
                  </div>
                </div>

                <!-- SECTION 5: STATUS PEMBAYARAN (Hanya Edit Mode) -->
                <template v-if="isEditTagihanMode">
                  <q-separator class="q-my-xl border-subtle" />
                  <div class="text-overline text-indigo-10 text-bold tracking-widest q-mb-sm">
                    5. STATUS PEMBAYARAN
                  </div>
                  <div class="row q-col-gutter-md">
                    <q-select
                      class="col-12 col-md-6"
                      outlined
                      dense
                      v-model="formTagihan.status"
                      :options="['Menunggu Pembayaran', 'Dibayar Sebagian', 'Lunas']"
                      label="Update Status"
                      bg-color="white"
                    />
                    <q-input
                      v-if="
                        formTagihan.status === 'Dibayar Sebagian' || formTagihan.status === 'Lunas'
                      "
                      class="col-12 col-md-6"
                      outlined
                      dense
                      type="number"
                      v-model.number="formTagihan.total_dibayar"
                      label="Nominal Telah Dibayar"
                      prefix="Rp"
                      bg-color="white"
                    />
                  </div>
                </template>
              </q-card>
            </div>
          </div>
        </q-scroll-area>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { db, storage } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// State Data Master (Koleksi Firebase)
const masterProyek = ref([])
const masterSpk = ref([])
const masterTagihan = ref([])
const masterInvoiceCust = ref([])

// State UI General
const viewMode = ref('list_proyek')
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('ALL')
const showTagihanDialog = ref(false)
const isEditTagihanMode = ref(false)
const savingTagihan = ref(false)
const selectedTagihan = ref(null)

// State Dropdown
const optProyek = ref([])
const optSpkFiltered = ref([])
const optInvoiceCustomer = ref([])

let unsubProyek = null
let unsubSpk = null
let unsubTagihan = null
let unsubInvoiceCust = null

// Form State Lengkap
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
})

// Auto-calculate Kalkulasi Pajak & Net Amount berdasarkan Nominal Invoice (Kotor)
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

    // Menghitung DPP dari Nominal Kotor (Kotor = DPP + PPN)
    let valDpp = valNominal
    if (valPpnPersen > 0) {
      valDpp = valNominal / (1 + valPpnPersen / 100)
    }

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

// Columns List Tagihan
const columnsTagihan = [
  {
    name: 'kode',
    align: 'left',
    label: 'KODE TAGIHAN & BAP',
    field: 'kode_tagihan',
    sortable: true,
  },
  {
    name: 'proyek_spk',
    align: 'left',
    label: 'PROYEK & SPK',
    field: 'proyek_nama',
    sortable: true,
  },
  {
    name: 'invoice_ar',
    align: 'left',
    label: 'INVOICE (AR) & FAKTUR',
    field: 'nomor_invoice_customer',
  },
  {
    name: 'timeline',
    align: 'left',
    label: 'TGL INV & SUBMIT',
    field: 'tanggal_invoice',
    sortable: true,
  },
  {
    name: 'progress',
    align: 'center',
    label: 'PROGRESS & TAHAP',
    field: 'progress_persen',
    sortable: true,
  },
  { name: 'nominal', align: 'right', label: 'NET AMOUNT', field: 'net_amount', sortable: true },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]

// ============================================================================
// COMPUTED MAPPINGS (Murni Daftar Tagihan Berbentuk Tabel Tunggal)
// ============================================================================
const mappedTagihan = computed(() => {
  return masterTagihan.value
    .map((t) => {
      return {
        ...t,
        search_string:
          `${t.kode_tagihan} ${t.bap_number} ${t.proyek_nama} ${t.nomor_spk} ${typeof t.nomor_invoice_customer === 'object' ? t.nomor_invoice_customer?.nomor_invoice : t.nomor_invoice_customer}`.toLowerCase(),
      }
    })
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
})

// KPI Computed
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

// Pencarian
const filteredTagihan = computed(() => {
  let result = mappedTagihan.value

  if (statusFilter.value === 'OUTSTANDING')
    result = result.filter(
      (r) => r.status === 'Menunggu Pembayaran' || r.status === 'Dibayar Sebagian',
    )
  else if (statusFilter.value === 'LUNAS') result = result.filter((r) => r.status === 'Lunas')

  if (searchQuery.value) {
    const lower = searchQuery.value.toLowerCase()
    result = result.filter((r) => r.search_string.includes(lower))
  }
  return result
})

// Menghitung Invoice Customer yang tersedia (Belum pernah digunakan di Tagihan manapun)
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

// Dropdown Filters
const filterProyek = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    optProyek.value = masterProyek.value.filter((v) => v.nama?.toLowerCase().includes(needle))
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
// LOGIKA DOKUMEN LAMPIRAN (FILE UPLOAD)
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
    $q.notify({ type: 'positive', message: 'Dokumen berhasil diunggah' })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Gagal mengunggah dokumen' })
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
    masterProyek.value = snap.docs.map((d) => ({ ...d.data(), id: d.id })) // PERBAIKAN: id.d.id di akhir
    optProyek.value = [...masterProyek.value]
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
// ADD / EDIT / DETAIL TAGIHAN LOGIC
// ============================================================================
const openDetail = (row) => {
  selectedTagihan.value = row
  viewMode.value = 'detail_tagihan'
  window.scrollTo(0, 0)
}

const openAddTagihanDialog = () => {
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
  }
  showTagihanDialog.value = true
}

const openEditTagihanDialog = (row) => {
  isEditTagihanMode.value = true
  formTagihan.value = {
    ...row,
    tahap_ke: row.tahap_ke || row.termin || '',
    ppn_persen: row.ppn_persen !== undefined ? row.ppn_persen : 11,
    ppn_nominal: row.ppn_nominal || row.ppn || 0,
    pph_persen: row.pph_persen !== undefined ? row.pph_persen : 0,
    pph_nominal: row.pph_nominal || row.pph || 0,
    dokumen_lampiran: row.dokumen_lampiran || [],
  }

  // Set Proyek Select
  if (row.proyek_id) {
    const proj = masterProyek.value.find((p) => p.id === row.proyek_id)
    if (proj) {
      formTagihan.value.proyek_obj = proj
      optSpkFiltered.value = masterSpk.value.filter((s) => s.projectId === proj.id)
    }
  }

  // Set SPK Select
  if (row.spk_id) {
    const spk = masterSpk.value.find((s) => s.id === row.spk_id)
    if (spk) formTagihan.value.spk_obj = spk
  }

  // Set Invoice Customer Select
  if (typeof row.nomor_invoice_customer === 'string') {
    const inv = masterInvoiceCust.value.find((i) => i.nomor_invoice === row.nomor_invoice_customer)
    if (inv) formTagihan.value.nomor_invoice_customer = inv
  }

  showTagihanDialog.value = true
}

const simpanTagihan = async () => {
  if (!formTagihan.value.proyek_nama) {
    return $q.notify({ type: 'warning', message: 'Data proyek wajib diisi' })
  }

  savingTagihan.value = true
  try {
    const payload = {
      ...formTagihan.value,
      updatedAt: serverTimestamp(),
    }

    // CLEANUP PAYLOAD SEBELUM DISIMPAN KE FIREBASE
    delete payload.id // <--- MENCEGAH ID FIREBASE TERTIMPA NULL
    delete payload.proyek_obj
    delete payload.spk_obj

    if (payload.dokumen_lampiran) {
      payload.dokumen_lampiran.forEach((d) => delete d.fileRaw)
    }

    if (payload.nomor_invoice_customer && payload.nomor_invoice_customer.nomor_invoice) {
      payload.nomor_invoice_customer = payload.nomor_invoice_customer.nomor_invoice
    }

    if (payload.status === 'Lunas') {
      payload.total_dibayar = payload.net_amount
    }

    if (isEditTagihanMode.value) {
      if (!formTagihan.value.id) {
        $q.notify({ type: 'negative', message: 'Gagal memperbarui: ID tidak ditemukan.' })
        return
      }
      await updateDoc(doc(db, 'monitoring_tagihan_spk', formTagihan.value.id), payload)
      $q.notify({ type: 'positive', message: 'Tagihan berhasil diperbarui' })
    } else {
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'monitoring_tagihan_spk'), payload)
      $q.notify({ type: 'positive', message: 'Tagihan berhasil ditambahkan' })
    }
    showTagihanDialog.value = false
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Terjadi kesalahan' })
  } finally {
    savingTagihan.value = false
  }
}

const deleteTagihan = (row) => {
  if (!row || !row.id) {
    $q.notify({ type: 'negative', message: 'ID Dokumen tidak valid atau rusak.' })
    return
  }

  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Apakah Anda yakin ingin menghapus tagihan ${row.kode_tagihan} secara permanen?`,
    cancel: true,
    ok: { color: 'negative', unelevated: true, label: 'Ya, Hapus' },
  }).onOk(async () => {
    $q.loading.show({ message: 'Menghapus data tagihan...' })
    try {
      await deleteDoc(doc(db, 'monitoring_tagihan_spk', row.id))
      $q.notify({ type: 'positive', message: 'Data tagihan berhasil dihapus!' })
    } catch (e) {
      console.error('Error saat menghapus: ', e)
      $q.notify({
        type: 'negative',
        message: 'Gagal menghapus data. Periksa koneksi atau izin akses.',
      })
    } finally {
      $q.loading.hide()
    }
  })
}

// ============================================================================
// UTILITIES
// ============================================================================
const formatDateIndo = (d) => {
  if (!d || d === '-') return '-'
  const date = new Date(d)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
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

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  if (unsubProyek) unsubProyek()
  if (unsubSpk) unsubSpk()
  if (unsubTagihan) unsubTagihan()
  if (unsubInvoiceCust) unsubInvoiceCust()
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
  border: 2px dashed #1a237e;
}
.dashed-btn {
  border: 2px dashed #1a237e;
}
.border-indigo-thin {
  border: 1px solid rgba(26, 35, 126, 0.1);
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
  background-color: rgba(25, 118, 210, 0.03) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(26, 35, 126, 0.1) !important;
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
</style>
