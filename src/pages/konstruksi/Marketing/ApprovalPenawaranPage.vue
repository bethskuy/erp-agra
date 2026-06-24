<template>
  <q-page class="bg-page q-pa-md font-pro relative-position">
    <div class="page-content-wrapper">
      <!-- =====================================================================================
         VIEW 1: LIST DOKUMEN PENAWARAN (APPROVAL QUEUE)
         ===================================================================================== -->
      <div v-if="viewMode === 'list'" class="animate-fade">
        <!-- HEADER SECTION -->
        <div class="row items-center justify-between q-mb-md no-print content-relative">
          <div class="col-12 col-md-8 q-mb-md q-mb-md-none">
            <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
              Approval Penawaran
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Otorisasi & Histori Quotation</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Tinjau rincian biaya dan berikan otorisasi digital untuk penawaran harga klien.
            </div>
          </div>
          <div class="col-12 col-md-auto text-left text-md-right">
            <div class="text-caption text-grey-6 q-mb-xs">Menunggu Persetujuan</div>
            <q-badge color="orange-9" class="q-px-md q-py-xs text-weight-bold shadow-1">
              {{ rows.filter((r) => r.status === 'Pending').length }} Dokumen
            </q-badge>
          </div>
        </div>

        <!-- SEARCH & SUMMARY CARD -->
        <q-card
          flat
          bordered
          class="q-mb-lg shadow-1 rounded-20 bg-white no-print content-relative border-subtle"
        >
          <q-card-section class="q-py-md">
            <div class="row items-center justify-between q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="filter"
                  outlined
                  dense
                  rounded
                  placeholder="Cari No. Quotation atau Nama Klien..."
                  bg-color="white"
                  class="search-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" color="brand-primary" />
                  </template>
                  <template v-slot:append v-if="filter">
                    <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-auto row items-center justify-end">
                <q-btn flat round icon="refresh" color="brand-primary" @click="fetchApprovalData" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- TABLE LIST SECTION -->
        <q-card
          flat
          bordered
          class="rounded-20 shadow-sm overflow-hidden bg-white no-print content-relative border-subtle"
        >
          <q-table
            :rows="rows"
            :columns="columns"
            row-key="id"
            flat
            :loading="loading"
            :filter="filter"
            binary-state-sort
            class="approval-table"
          >
            <!-- Custom Header -->
            <template v-slot:header="props">
              <q-tr :props="props" class="bg-brand-primary text-white">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="text-weight-bold"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <!-- Custom Body -->
            <template v-slot:body="props">
              <q-tr
                :props="props"
                class="hover-bg transition-all cursor-pointer"
                @click="openDetail(props.row)"
              >
                <q-td key="nomor" class="text-weight-bolder text-brand-primary">
                  {{ props.row.nomor }}
                </q-td>
                <q-td key="judul_penawaran">
                  <div class="text-weight-bold text-blue-grey-9 text-uppercase">
                    {{ props.row.judul_penawaran || '-' }}
                  </div>
                </q-td>
                <q-td key="nama_customer" class="text-weight-bold text-blue-grey-9 uppercase">
                  {{ props.row.nama_customer }}
                </q-td>
                <q-td key="total_harga" class="text-right text-weight-bolder text-brand-primary">
                  <span class="text-caption text-grey-6 q-mr-xs">IDR</span>
                  {{ Math.round(props.row.total_harga || 0).toLocaleString() }}
                </q-td>
                <q-td key="status" class="text-center">
                  <q-chip
                    text-color="white"
                    size="sm"
                    class="text-weight-bold shadow-sm"
                    :color="getStatusColor(props.row.status)"
                  >
                    {{ props.row.status }}
                  </q-chip>
                </q-td>
                <q-td key="aksi" class="text-center" @click.stop>
                  <div class="row justify-center q-gutter-xs">
                    <template v-if="props.row.status === 'Pending'">
                      <q-btn
                        v-if="canAction('approve')"
                        unelevated
                        rounded
                        color="positive"
                        icon="check"
                        :label="$q.screen.gt.xs ? 'Approve' : ''"
                        size="sm"
                        class="q-px-sm"
                        @click="handleApproval(props.row, 'Approved')"
                      />
                      <q-btn
                        v-if="canAction('approve') || canAction('ubah')"
                        outline
                        rounded
                        color="negative"
                        icon="close"
                        :label="$q.screen.gt.xs ? 'Reject' : ''"
                        size="sm"
                        class="q-px-sm"
                        @click="promptReject(props.row)"
                      />
                    </template>
                    <q-btn
                      flat
                      round
                      color="grey-6"
                      icon="visibility"
                      size="sm"
                      @click="openDetail(props.row)"
                    />
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card>
      </div>
      <!-- END OF VIEW 1 -->

      <!-- =====================================================================================
         VIEW 2: DETAIL PENAWARAN (INFORMATIVE VIEW FOR APPROVER)
         ===================================================================================== -->
      <div v-else-if="viewMode === 'detail' && selectedData" class="animate-fade q-pb-xl">
        <!-- Top Action Bar -->
        <div class="row items-center justify-between q-col-gutter-y-md q-mb-xl no-print">
          <div class="col-12 col-sm-auto row items-center no-wrap">
            <q-btn
              flat
              round
              color="brand-primary"
              icon="arrow_back"
              @click="viewMode = 'list'"
              class="q-mr-md bg-white shadow-1"
            />
            <div>
              <div class="text-overline text-grey-6 text-bold tracking-widest q-mb-xs leading-none">
                DETAIL PENAWARAN HARGA
              </div>
              <div class="text-h5 text-weight-bolder text-brand-primary leading-tight uppercase">
                {{ selectedData.nomor }}
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-auto row items-center q-col-gutter-sm q-mt-xs q-mt-sm-none">
            <!-- Approve/Reject buttons if status is Pending -->
            <template v-if="selectedData.status === 'Pending'">
              <div class="col-12 col-sm-auto" v-if="canAction('approve')">
                <q-btn
                  unelevated
                  color="positive"
                  icon="check"
                  label="APPROVE"
                  class="rounded-12 text-weight-bold q-py-sm q-px-md shadow-2 text-white full-width"
                  @click="handleApproval(selectedData, 'Approved')"
                />
              </div>
              <div class="col-12 col-sm-auto" v-if="canAction('approve') || canAction('ubah')">
                <q-btn
                  outline
                  color="negative"
                  icon="close"
                  label="REJECT"
                  class="rounded-12 text-weight-bold q-py-sm q-px-md shadow-2 bg-white full-width"
                  @click="promptReject(selectedData)"
                />
              </div>
            </template>

            <div class="col-12 col-sm-auto">
              <!-- Button to open official document preview -->
              <q-btn
                unelevated
                color="indigo-10"
                icon="visibility"
                label="PREVIEW DOKUMEN RESMI"
                class="rounded-12 text-weight-bold q-py-sm q-px-md shadow-2 text-white full-width"
                @click="openDocumentPreview"
              />
            </div>
          </div>
        </div>

        <div class="row q-col-gutter-lg">
          <!-- Left Column: General Info & Terms -->
          <div class="col-12 col-md-5">
            <!-- GENERAL INFO CARD -->
            <q-card flat bordered class="rounded-20 bg-white q-mb-lg shadow-sm border-subtle">
              <q-card-section
                class="bg-brand-light q-py-md text-brand-primary text-weight-bold flex items-center border-bottom"
              >
                <q-icon name="info" class="q-mr-sm" size="sm" />
                INFORMASI UMUM
              </q-card-section>
              <q-card-section class="q-pa-lg">
                <table class="detail-table full-width">
                  <tr>
                    <td class="text-weight-bold text-grey-6 py-2">Judul Penawaran</td>
                    <td class="text-weight-bold text-blue-grey-9 text-right py-2 uppercase">
                      {{ selectedData.judul_penawaran || '-' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-weight-bold text-grey-6 py-2">Klien / Customer</td>
                    <td class="text-weight-bold text-blue-grey-9 text-right py-2 uppercase">
                      {{ selectedData.nama_customer }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-weight-bold text-grey-6 py-2">Ditujukan (Attn)</td>
                    <td class="text-weight-medium text-grey-8 text-right py-2">
                      {{ selectedData.attn || '-' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-weight-bold text-grey-6 py-2">Tanggal Terbit</td>
                    <td class="text-weight-medium text-grey-8 text-right py-2">
                      {{ formatDateIndo(selectedData.tanggal) }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-weight-bold text-grey-6 py-2">Lokasi Terbit</td>
                    <td class="text-weight-medium text-grey-8 text-right py-2">
                      {{ selectedData.kota }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-weight-bold text-grey-6 py-2">Perusahaan Pengirim</td>
                    <td class="text-weight-medium text-grey-8 text-right py-2 uppercase">
                      {{ selectedData.nama_pt }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-weight-bold text-grey-6 py-2">Status Penawaran</td>
                    <td class="text-right py-2">
                      <q-chip
                        text-color="white"
                        size="sm"
                        class="text-weight-bold shadow-sm"
                        :color="getStatusColor(selectedData.status)"
                      >
                        {{ selectedData.status || 'Draft' }}
                      </q-chip>
                    </td>
                  </tr>
                  <tr v-if="selectedData.analisa_harga_url">
                    <td class="text-weight-bold text-grey-6 py-2">Analisa Pendukung</td>
                    <td class="text-right py-2">
                      <q-btn
                        flat
                        dense
                        color="brand-primary"
                        icon="cloud_download"
                        label="Unduh Berkas"
                        @click="openAnalisaFile(selectedData.analisa_harga_url)"
                        class="text-weight-bold"
                      />
                    </td>
                  </tr>
                </table>
              </q-card-section>
            </q-card>

            <!-- TERMS & CONDITIONS CARD -->
            <q-card flat bordered class="rounded-20 bg-white shadow-sm border-subtle">
              <q-card-section
                class="bg-brand-light q-py-md text-brand-primary text-weight-bold flex items-center border-bottom"
              >
                <q-icon name="gavel" class="q-mr-sm" size="sm" />
                SYARAT & KETENTUAN
              </q-card-section>
              <q-card-section class="q-pa-lg">
                <div
                  class="bg-grey-1 q-pa-md rounded-12 text-grey-9 text-body2 leading-relaxed"
                  v-html="selectedData.terms || '-'"
                ></div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Right Column: Work Items Summary -->
          <div class="col-12 col-md-7">
            <!-- ITEMS SUMMARY CARD -->
            <q-card flat bordered class="rounded-20 bg-white q-mb-lg shadow-sm border-subtle">
              <q-card-section
                class="bg-brand-light q-py-md text-brand-primary text-weight-bold flex items-center border-bottom"
              >
                <q-icon name="list_alt" class="q-mr-sm" size="sm" />
                RINCIAN PEKERJAAN
              </q-card-section>
              <q-card-section class="q-pa-none">
                <q-markup-table flat separator="horizontal" class="no-border">
                  <thead>
                    <tr class="bg-grey-1 text-grey-7 text-weight-bold">
                      <th class="text-center" style="width: 50px">NO</th>
                      <th class="text-left">URAIAN PEKERJAAN</th>
                      <th class="text-center" style="width: 80px">QTY</th>
                      <th class="text-center" style="width: 80px">SAT</th>
                      <th class="text-right" style="width: 150px">HARGA SATUAN</th>
                      <th class="text-right" style="width: 150px">TOTAL HARGA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in selectedData.items" :key="idx">
                      <td class="text-center text-grey-6 font-bold">{{ idx + 1 }}</td>
                      <td class="text-left uppercase text-weight-medium text-blue-grey-9">
                        {{ item.deskripsi }}
                      </td>
                      <td class="text-center text-grey-8">{{ item.qty }}</td>
                      <td class="text-center uppercase text-grey-8">{{ item.satuan }}</td>
                      <td class="text-right text-grey-8">
                        Rp {{ Math.round(item.harga || 0).toLocaleString() }}
                      </td>
                      <td class="text-right text-weight-bold text-brand-primary">
                        Rp {{ Math.round(item.total || 0).toLocaleString() }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-grey-1 font-pro">
                    <tr>
                      <td
                        colspan="5"
                        class="text-right text-weight-bold text-grey-7 text-caption py-2"
                      >
                        SUBTOTAL PEKERJAAN
                      </td>
                      <td class="text-right text-weight-bold text-brand-primary py-2">
                        Rp
                        {{
                          Math.round(
                            selectedData.items.reduce((a, b) => a + (b.total || 0), 0),
                          ).toLocaleString()
                        }}
                      </td>
                    </tr>
                    <tr v-if="selectedData.tax_rate > 0">
                      <td
                        colspan="5"
                        class="text-right text-weight-bold text-grey-7 text-caption py-2"
                      >
                        TAX ({{ selectedData.tax_rate }}%)
                      </td>
                      <td class="text-right text-weight-bold text-brand-primary py-2">
                        Rp
                        {{
                          Math.round(
                            (selectedData.items.reduce((a, b) => a + (b.total || 0), 0) *
                              selectedData.tax_rate) /
                              100,
                          ).toLocaleString()
                        }}
                      </td>
                    </tr>
                    <tr v-if="selectedData.biaya_lain > 0">
                      <td
                        colspan="5"
                        class="text-right text-weight-bold text-grey-7 text-caption py-2"
                      >
                        {{ selectedData.biaya_lain_label || 'BIAYA LAIN' }}
                      </td>
                      <td class="text-right text-weight-bold text-brand-primary py-2">
                        Rp {{ Math.round(selectedData.biaya_lain || 0).toLocaleString() }}
                      </td>
                    </tr>
                    <tr class="bg-brand-primary text-white">
                      <td
                        colspan="5"
                        class="text-right text-weight-bold text-subtitle1 text-white py-3"
                      >
                        GRAND TOTAL AMOUNT
                      </td>
                      <td class="text-right text-weight-bolder text-subtitle1 text-white py-3">
                        Rp {{ Math.round(selectedData.total_harga || 0).toLocaleString() }}
                      </td>
                    </tr>
                  </tfoot>
                </q-markup-table>
              </q-card-section>
            </q-card>

            <!-- SIGNATURE & STATUS CARD -->
            <q-card flat bordered class="rounded-20 bg-white shadow-sm border-subtle">
              <q-card-section
                class="bg-brand-light q-py-md text-brand-primary text-weight-bold flex items-center border-bottom"
              >
                <q-icon name="draw" class="q-mr-sm" size="sm" />
                PENGESAHAN & DOKUMEN
              </q-card-section>
              <q-card-section class="q-pa-lg">
                <div class="row q-col-gutter-md items-center">
                  <div class="col-12 col-sm-6 text-left">
                    <div class="text-caption text-grey-6 text-bold uppercase font-8">
                      Penandatangan
                    </div>
                    <div class="text-subtitle1 text-weight-bold text-blue-grey-9 uppercase">
                      {{ selectedData.ttd_nama || '-' }}
                    </div>
                    <div class="text-caption text-grey-7 uppercase font-bold">
                      {{ selectedData.ttd_jabatan || '-' }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-6 text-right">
                    <div class="row justify-end q-gutter-md">
                      <q-card
                        v-if="selectedData.signatureUrl"
                        flat
                        bordered
                        class="rounded-12 bg-grey-1 relative-position flex flex-center"
                        style="width: 140px; height: 75px"
                      >
                        <img
                          :src="selectedData.signatureUrl"
                          style="max-height: 60px; max-width: 120px; object-fit: contain"
                        />
                      </q-card>
                      <q-card
                        v-if="selectedData.stempelUrl"
                        flat
                        bordered
                        class="rounded-12 bg-grey-1 relative-position flex flex-center"
                        style="width: 140px; height: 75px"
                      >
                        <img
                          :src="selectedData.stempelUrl"
                          style="max-height: 60px; max-width: 120px; object-fit: contain"
                        />
                      </q-card>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- PREVIEW & APPROVAL DIALOG -->
      <q-dialog v-model="showPreview" maximized transition-show="fade" transition-hide="fade">
        <q-card class="column no-wrap bg-grey-4 relative-position">
          <!-- TOOLBAR: RESPONSIVE DESIGN -->
          <q-toolbar
            class="bg-white text-indigo-10 q-py-md no-print shadow-2 shrink content-relative"
          >
            <q-btn flat round dense icon="arrow_back" v-close-popup color="grey-7" />
            <q-toolbar-title class="text-weight-bold text-indigo-10"
              >PREVIEW DOKUMEN RESMI</q-toolbar-title
            >

            <q-space class="lt-sm" />

            <!-- TOMBOL LIHAT DOKUMEN ANALISA (BISA PDF, WORD, EXCEL) -->
            <q-btn
              v-if="selectedData?.analisa_harga_url"
              color="indigo-10"
              icon="description"
              :label="$q.screen.gt.xs ? 'Lihat Dokumen Analisa' : ''"
              unelevated
              class="q-mr-md text-white text-weight-bold q-px-md"
              @click="openAnalisaFile(selectedData.analisa_harga_url)"
            >
              <q-tooltip>Unduh/Buka Berkas Analisa Pendukung (PDF/Word/Excel)</q-tooltip>
            </q-btn>

            <!-- GROUP TOMBOL PDF -->
            <q-btn-group unelevated rounded class="q-mr-xs q-mr-md-md shadow-1">
              <q-btn
                color="red-9"
                icon="picture_as_pdf"
                label="Export PDF"
                @click="exportToPDF"
                class="q-px-md text-weight-bold text-white"
              />
            </q-btn-group>

            <!-- Action Approve -->
            <template v-if="selectedData?.status === 'Pending'">
              <q-btn
                v-if="canAction('approve')"
                unelevated
                color="positive"
                icon="check"
                label="APPROVE"
                @click="handleApproval(selectedData, 'Approved')"
                class="text-weight-bold text-white q-px-md"
              />
            </template>
          </q-toolbar>

          <!-- CONTAINER SURAT (WARNA TULISAN INDIGO TIDAK DIGANGGU GUGAT SESUAI REQUEST) -->
          <q-card-section class="col scroll q-pa-md preview-container content-relative bg-grey-3">
            <div id="quotation-print" class="letter-paper shadow-24" v-if="selectedData">
              <div id="quotation-header" class="quotation-header">
                <!-- Kop Surat -->
                <div class="row no-wrap items-center">
                  <div v-if="config.kopUrl" class="col-auto q-mr-md q-mr-md-xl">
                    <img :src="config.kopUrl" class="final-kop-img" />
                  </div>
                  <div class="col text-left">
                    <div class="final-pt-name uppercase">{{ selectedData.nama_pt }}</div>
                    <div class="final-pt-tagline italic text-grey-8">
                      {{ selectedData.tagline_pt }}
                    </div>
                  </div>
                </div>
                <div class="final-divider"></div>
              </div>

              <!-- Meta Dokumen -->
              <div class="row justify-between items-start q-mt-lg q-mb-md text-left">
                <div class="col-7">
                  <div class="label-grey-pro uppercase">KEPADA YTH :</div>
                  <div class="client-name-pro uppercase">{{ selectedData.nama_customer }}</div>
                  <div class="text-body2 text-weight-medium">Di Tempat</div>

                  <!-- ATTN PLACEMENT: EXACTLY BELOW "DI TEMPAT" -->
                  <div
                    v-if="selectedData.attn"
                    class="text-body2 text-weight-medium q-mt-xs text-grey-9"
                  >
                    Attn: {{ selectedData.attn }}
                  </div>
                </div>
                <div class="col-5 text-right">
                  <div class="quotation-title-pro uppercase">Quotation</div>
                  <div class="quotation-no-pro text-indigo-10 font-bold">
                    {{ selectedData.nomor }}
                  </div>
                  <div class="text-date-pro">
                    {{ selectedData.kota }}, {{ formatDateIndo(selectedData.tanggal) }}
                  </div>
                </div>
              </div>

              <!-- Content -->
              <div
                class="text-body2 q-mb-md text-left leading-relaxed"
                v-html="selectedData.introduction"
              ></div>

              <table class="final-pro-table">
                <thead>
                  <tr>
                    <th width="40">NO</th>
                    <th class="text-left">DESCRIPTION OF WORKS</th>
                    <th width="60">QTY</th>
                    <th width="60">UNIT</th>
                    <th width="120">UNIT PRICE</th>
                    <th width="140">TOTAL AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(it, i) in selectedData.items" :key="i">
                    <td class="text-center font-bold text-grey-7">{{ i + 1 }}</td>
                    <td class="text-left uppercase text-weight-medium">{{ it.deskripsi }}</td>
                    <td class="text-center">{{ it.qty }}</td>
                    <td class="text-center uppercase text-caption">{{ it.satuan }}</td>
                    <td class="text-right">
                      {{ Math.round(it.harga || 0).toLocaleString('id-ID') }}
                    </td>
                    <td class="text-right text-weight-bolder text-indigo-10 bg-indigo-0">
                      {{ Math.round(it.total || 0).toLocaleString('id-ID') }}
                    </td>
                  </tr>
                </tbody>
                <tfoot class="final-table-footer">
                  <tr class="row-calculation">
                    <td colspan="5" class="text-right text-bold uppercase">Subtotal Pekerjaan</td>
                    <td class="text-right text-bold text-indigo-10 font-11">
                      IDR
                      {{
                        Math.round(
                          selectedData.items.reduce((a, b) => a + (b.total || 0), 0),
                        ).toLocaleString('id-ID')
                      }}
                    </td>
                  </tr>
                  <tr class="row-calculation" v-if="selectedData.tax_rate > 0">
                    <td colspan="5" class="text-right text-bold uppercase italic text-grey-7">
                      Tax ({{ selectedData.tax_rate }}%)
                    </td>
                    <td class="text-right text-weight-bold font-11 text-indigo-10">
                      IDR
                      {{
                        Math.round(
                          (selectedData.items.reduce((a, b) => a + (b.total || 0), 0) *
                            selectedData.tax_rate) /
                            100,
                        ).toLocaleString('id-ID')
                      }}
                    </td>
                  </tr>
                  <tr class="row-calculation" v-if="selectedData.biaya_lain > 0">
                    <td colspan="5" class="text-right text-bold uppercase text-grey-7">
                      {{ selectedData.biaya_lain_label || 'BIAYA LAIN' }}
                    </td>
                    <td class="text-right text-weight-bold font-11 text-indigo-10">
                      IDR {{ Math.round(selectedData.biaya_lain || 0).toLocaleString('id-ID') }}
                    </td>
                  </tr>
                  <!-- SINKRONISASI BANNER GRAND TOTAL DUA NADA WARNA ELEGAN -->
                  <tr class="row-grand-total">
                    <td
                      colspan="5"
                      class="text-right text-bold uppercase tracking-extra-wide text-white border-none-pro bg-indigo-left"
                    >
                      Grand Total Amount
                    </td>
                    <td class="text-right text-white text-bold border-none-pro bg-indigo-right">
                      IDR {{ Math.round(selectedData.total_harga || 0).toLocaleString('id-ID') }}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <!-- Terms -->
              <div class="terms-container text-left q-mt-lg">
                <div class="terms-header uppercase">Syarat & Kondisi Pembayaran :</div>
                <div
                  class="terms-content-box leading-relaxed text-body2"
                  v-html="selectedData.terms"
                ></div>
              </div>

              <!-- CLOSING MESSAGE (DIPINDAHKAN DI BAWAH SYARAT DAN KONDISI - SESUAI GAMBAR 3) -->
              <div
                class="text-closing-final text-left q-mt-lg text-body2 leading-relaxed text-grey-9"
                v-html="selectedData.closing"
              ></div>

              <!-- Signature Area -->
              <div class="signature-container text-left q-mt-xl">
                <div class="row q-mt-md justify-end">
                  <div class="col-6 text-right">
                    <div class="q-mb-xs text-body2 uppercase">Hormat Kami,</div>
                    <div class="text-weight-bold text-indigo-10 uppercase q-mb-xs">
                      {{ selectedData.nama_pt }}
                    </div>

                    <!-- Area Signature menggunakan absolute positioning fix bug HTML2CANVAS -->
                    <div class="final-sign-space flex flex-center relative-position">
                      <img
                        v-if="selectedData.stempelUrl"
                        :src="selectedData.stempelUrl"
                        class="img-stempel"
                      />
                      <img
                        v-if="selectedData.signatureUrl"
                        :src="selectedData.signatureUrl"
                        class="img-signature"
                      />
                      <q-btn
                        v-if="selectedData.signatureUrl"
                        flat
                        round
                        dense
                        icon="close"
                        color="negative"
                        size="xs"
                        class="absolute-top-right q-ma-xs no-print"
                        style="z-index: 10"
                        @click.stop="clearPreviewSignature"
                      />
                      <q-btn
                        v-if="!selectedData.signatureUrl"
                        outline
                        rounded
                        no-caps
                        color="brand-primary"
                        icon="draw"
                        label="Ttd"
                        class="no-print q-px-lg q-py-sm text-weight-bold"
                        style="font-size: 16px; min-width: 120px"
                        @click="openSignaturePadFromPreview"
                      />
                    </div>

                    <div class="text-signer-final text-weight-bolder uppercase text-indigo-10">
                      {{ selectedData.ttd_nama }}
                    </div>
                    <div class="text-role-final uppercase text-grey-8 text-caption font-bold block">
                      {{ selectedData.ttd_jabatan }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="q-py-xl no-print"></div>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- SIGNATURE PAD DIALOG -->
      <q-dialog v-model="showPad" persistent backdrop-filter="blur(4px)">
        <q-card style="width: 850px; max-width: 95vw" class="rounded-20 shadow-24">
          <q-card-section class="row items-center q-pb-none bg-brand-primary text-white q-pa-md">
            <div class="text-h6 text-weight-bold uppercase font-10">Tanda Tangan Pengesahan</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section class="q-pa-lg">
            <!-- Pengatur Ketebalan Pen -->
            <div class="row items-center q-col-gutter-md q-mb-md">
              <div class="col-auto text-weight-bold text-grey-8 font-10">KETEBALAN PENA:</div>
              <div class="col">
                <q-slider
                  v-model="penThickness"
                  :min="1"
                  :max="10"
                  :step="0.5"
                  label
                  color="brand-primary"
                  class="q-px-sm"
                />
              </div>
              <div class="col-auto text-caption text-grey-6 text-weight-bold" style="width: 50px">
                {{ penThickness }} px
              </div>
            </div>

            <div class="signature-pad-wrapper shadow-inner bg-white border-dashed">
              <canvas ref="signatureCanvas" class="signature-canvas"></canvas>
            </div>
          </q-card-section>
          <q-card-actions
            class="q-pa-md bg-grey-1 row justify-between items-center full-width q-col-gutter-sm"
          >
            <!-- Left Side: Upload File button with hidden file picker -->
            <div class="col-12 col-sm-auto text-center text-sm-left relative-position">
              <q-btn
                outline
                rounded
                no-caps
                color="indigo-10"
                icon="file_upload"
                label="Upload File"
                class="text-weight-bold full-width"
              >
                <q-file
                  v-model="tempPreviewSignFile"
                  borderless
                  dense
                  class="absolute-full opacity-0 cursor-pointer"
                  accept="image/*"
                  @update:model-value="uploadSignatureFromPad"
                />
              </q-btn>
            </div>
            <!-- Right Side: Reset & Simpan & Pasang buttons -->
            <div
              class="col-12 col-sm-auto row items-center justify-center justify-sm-end q-gutter-sm"
            >
              <q-btn
                flat
                label="RESET"
                color="grey-7"
                @click="clearPad"
                rounded
                class="text-weight-bold"
              />
              <q-btn
                unelevated
                label="SIMPAN & PASANG"
                color="brand-primary"
                @click="saveManualSignature"
                rounded
                class="q-px-lg text-weight-bold text-white shadow-1"
              />
            </div>
          </q-card-actions>
        </q-card>
      </q-dialog>

      <div class="q-py-xl"></div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'
import html2canvas from 'html2canvas'
import SignaturePad from 'signature_pad'

const $q = useQuasar()
const authStore = useAuthStore()
const rows = ref([])
const loading = ref(true)
const filter = ref('')
const showPreview = ref(false)
const selectedData = ref(null)
const viewMode = ref('list')
const config = ref({ kopUrl: '' })
const userData = ref(null)

// Signature pad states
const showPad = ref(false)
const signatureCanvas = ref(null)
const penThickness = ref(5)
const isSigningFromPreview = ref(false)
const tempPreviewSignFile = ref(null)
let signaturePad = null

let unsubUser = null
let unsubApproval = null

const columns = [
  { name: 'nomor', align: 'left', label: 'REFERENCE NO', field: 'nomor', sortable: true },
  {
    name: 'judul_penawaran',
    align: 'left',
    label: 'JUDUL PENAWARAN',
    field: 'judul_penawaran',
    sortable: true,
  },
  {
    name: 'nama_customer',
    align: 'left',
    label: 'CLIENT NAME',
    field: 'nama_customer',
    sortable: true,
  },
  {
    name: 'total_harga',
    align: 'right',
    label: 'AMOUNT (IDR)',
    field: 'total_harga',
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'ACTIONS', field: 'id' },
]

const getStatusColor = (status) => {
  switch (status) {
    case 'Approved':
      return 'positive'
    case 'Rejected':
      return 'negative'
    case 'Pending':
      return 'orange-9'
    default:
      return 'blue-grey-6'
  }
}

const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const targetId = '_konstruksi_marketing_approval-penawaran'
  const menu = modulePerm.menus.find((m) => m.id === targetId)
  return menu ? menu[actionType] || false : false
}

const fetchApprovalData = () => {
  loading.value = true
  try {
    getDoc(doc(db, 'config', 'perusahaan')).then((confSnap) => {
      if (confSnap.exists()) config.value = confSnap.data()
    })

    const q = query(
      collection(db, 'penawaran'),
      where('status', 'in', ['Pending', 'Approved', 'Rejected']),
    )
    unsubApproval = onSnapshot(
      q,
      (snap) => {
        rows.value = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))
        loading.value = false
      },
      (err) => {
        console.error(err)
        loading.value = false
      },
    )
  } catch (e) {
    console.error(e)
  }
}

const handleApproval = (row, status, alasan = null) => {
  $q.dialog({
    title:
      '<div class="text-h5 text-weight-bolder text-brand-primary q-mb-sm">Konfirmasi Otorisasi</div>',
    message: `Apakah Anda yakin ingin memperbarui status dokumen ini menjadi <b class="${status === 'Approved' ? 'text-positive' : 'text-negative'}">${status}</b>?`,
    html: true,
    cancel: {
      label: 'Batal',
      color: 'grey-7',
      outline: true,
      rounded: true,
      unelevated: true,
      class: 'q-px-lg text-weight-bold text-uppercase',
    },
    ok: {
      label: 'Ya, Proses',
      color: status === 'Approved' ? 'positive' : 'negative',
      unelevated: true,
      rounded: true,
      class: 'q-px-lg text-weight-bold text-uppercase shadow-2',
    },
    class: 'rounded-20 q-pa-md shadow-premium bg-white',
    persistent: true,
  }).onOk(async () => {
    try {
      $q.loading.show()
      const data = {
        status: status,
        updatedAt: serverTimestamp(),
        processedAt: serverTimestamp(),
        marketing_read: false,
      }
      if (status === 'Rejected' && alasan) data.alasan_reject = alasan
      await updateDoc(doc(db, 'penawaran', row.id), data)
      showPreview.value = false

      $q.notify({
        html: true,
        message: `<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Otorisasi Berhasil!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Status dokumen penawaran diperbarui menjadi <b>${status}</b>.</div>`,
        color: status === 'Approved' ? 'positive' : 'negative',
        icon: status === 'Approved' ? 'verified' : 'cancel',
        position: 'top',
        timeout: 4000,
        progress: true,
        classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
        actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
      })
    } catch (e) {
      console.error(e)
    } finally {
      $q.loading.hide()
    }
  })
}

const promptReject = (row) => {
  $q.dialog({
    title:
      '<div class="text-h5 text-weight-bolder text-negative q-mb-sm">Penolakan Penawaran</div>',
    message: 'Berikan alasan singkat atau instruksi revisi untuk marketing:',
    html: true,
    prompt: {
      model: '',
      type: 'textarea',
      placeholder: 'Contoh: Harga material terlalu tinggi, sesuaikan dengan budget...',
    },
    cancel: {
      label: 'Batal',
      color: 'grey-7',
      outline: true,
      rounded: true,
      unelevated: true,
      class: 'q-px-lg text-weight-bold text-uppercase',
    },
    ok: {
      label: 'Reject Dokumen',
      color: 'negative',
      unelevated: true,
      rounded: true,
      class: 'q-px-lg text-weight-bold text-uppercase shadow-2',
    },
    class: 'rounded-20 q-pa-md shadow-premium bg-white',
    persistent: true,
  }).onOk((a) => handleApproval(row, 'Rejected', a))
}

const openDetail = (row) => {
  selectedData.value = row
  viewMode.value = 'detail'
  window.scrollTo(0, 0)
}

const openDocumentPreview = () => {
  showPreview.value = true
}

const openAnalisaFile = (url) => {
  if (url) window.open(url, '_blank')
}

const formatDateIndo = (d) =>
  d
    ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

const waitForNextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()))

const exportToPDF = async () => {
  $q.loading.show({ message: 'Menyiapkan Dokumen PDF...' })

  const element = document.getElementById('quotation-print')
  if (!element || !selectedData.value?.nomor) {
    $q.loading.hide()
    return $q.notify({ type: 'negative', message: 'Dokumen belum siap untuk diekspor.' })
  }

  const body = document.body
  const headerEl = document.getElementById('quotation-header')
  const original = {
    headerDisplay: headerEl?.style?.display || '',
  }
  let headerParent = null
  let headerNextSibling = null
  if (headerEl) {
    headerParent = headerEl.parentNode
    headerNextSibling = headerEl.nextSibling
  }

  try {
    body.classList.add('is-exporting')
    await nextTick()
    await waitForNextFrame()

    // Margin base (mm)
    const marginLeft = 15
    const marginRight = 15
    const marginBottom = 15
    const headerYmm = 15
    let marginTop = 15

    let headerImgData = null
    let headerHeightMm = 0
    if (headerEl) {
      const headerCanvas = await html2canvas(headerEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })
      headerImgData = headerCanvas.toDataURL('image/png')

      // Hapus sementara header dari DOM agar tidak menyisakan ruang kosong di halaman 1
      if (headerParent) {
        headerParent.removeChild(headerEl)
      }

      const img = new Image()
      img.src = headerImgData
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      const a4WidthMm = 210
      const headerWidthMm = a4WidthMm - marginLeft - marginRight
      headerHeightMm = (img.height / img.width) * headerWidthMm
      marginTop = headerYmm + headerHeightMm + 2

      await nextTick()
      await waitForNextFrame()
    }

    const opt = {
      margin: [marginTop, marginRight, marginBottom, marginLeft],
      filename: `Quotation_${selectedData.value.nomor.replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: {
        mode: ['css', 'legacy'],
        avoid: ['tr', '.terms-container', '.signature-container', '.final-sign-space'],
      },
    }

    const worker = html2pdf().set(opt).from(element).toPdf()
    const pdf = await worker.get('pdf')

    if (headerImgData) {
      const pageWidth = pdf.internal.pageSize.getWidth()
      const headerWidthMm = pageWidth - marginLeft - marginRight
      const pageCount = pdf.getNumberOfPages()

      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.addImage(
          headerImgData,
          'PNG',
          marginLeft,
          headerYmm,
          headerWidthMm,
          headerHeightMm,
          undefined,
          'FAST',
        )
      }
    }

    pdf.save(opt.filename)
    $q.notify({ type: 'positive', message: 'PDF Berhasil Diekspor!' })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal export PDF: ' + (e?.message || e) })
  } finally {
    if (headerEl && headerParent) {
      if (headerNextSibling) {
        headerParent.insertBefore(headerEl, headerNextSibling)
      } else {
        headerParent.appendChild(headerEl)
      }
      headerEl.style.display = original.headerDisplay
    }
    body.classList.remove('is-exporting')
    $q.loading.hide()
  }
}

watch(penThickness, (val) => {
  if (signaturePad) {
    const data = signaturePad.toData()
    const targetMin = val * 0.7
    const targetMax = val * 1.6
    data.forEach((stroke) => {
      stroke.minWidth = targetMin
      stroke.maxWidth = targetMax
    })
    signaturePad.minWidth = targetMin
    signaturePad.maxWidth = targetMax
    signaturePad.clear()
    signaturePad.fromData(data)
  }
})

watch(showPad, async (v) => {
  if (v) {
    await nextTick()
    const c = signatureCanvas.value
    if (!c) return
    const r = Math.max(window.devicePixelRatio || 1, 1)
    c.width = c.offsetWidth * r
    c.height = c.offsetHeight * r
    c.getContext('2d').scale(r, r)
    signaturePad = new SignaturePad(c, {
      penColor: '#000000',
      minWidth: penThickness.value * 0.7,
      maxWidth: penThickness.value * 1.6,
    })
  }
})
const clearPad = () => signaturePad?.clear()

const openSignaturePadFromPreview = () => {
  isSigningFromPreview.value = true
  showPad.value = true
}

const saveManualSignature = async () => {
  if (!signaturePad || signaturePad.isEmpty()) return
  const base64 = signaturePad.toDataURL()

  if (isSigningFromPreview.value) {
    if (!selectedData.value || !selectedData.value.id) return
    $q.loading.show({ message: 'Menyimpan tanda tangan...' })
    try {
      // 1. Simpan ke penawaran
      await updateDoc(doc(db, 'penawaran', selectedData.value.id), {
        signatureUrl: base64,
        updatedAt: serverTimestamp(),
      })
      selectedData.value.signatureUrl = base64

      // 2. Simpan ke profil karyawan
      if (userData.value?.id) {
        await updateDoc(doc(db, 'karyawan', userData.value.id), {
          signatureUrl: base64,
        })
      }

      $q.notify({ type: 'positive', message: 'Tanda tangan berhasil dipasang!' })
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', message: 'Gagal menyimpan tanda tangan: ' + e.message })
    } finally {
      $q.loading.hide()
      isSigningFromPreview.value = false
      showPad.value = false
    }
  }
}

const clearPreviewSignature = () => {
  if (!selectedData.value || !selectedData.value.id) return
  $q.dialog({
    title: 'Hapus Tanda Tangan',
    message: 'Apakah Anda yakin ingin menghapus tanda tangan dari dokumen ini?',
    cancel: { flat: true, label: 'Batal', color: 'grey-7' },
    ok: {
      unelevated: true,
      rounded: true,
      label: 'Ya, Hapus',
      color: 'negative',
      class: 'text-weight-bold',
    },
  }).onOk(async () => {
    $q.loading.show({ message: 'Menghapus tanda tangan...' })
    try {
      await updateDoc(doc(db, 'penawaran', selectedData.value.id), {
        signatureUrl: '',
        updatedAt: serverTimestamp(),
      })
      selectedData.value.signatureUrl = ''
      $q.notify({ type: 'positive', message: 'Tanda tangan berhasil dihapus!' })
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', message: 'Gagal menghapus tanda tangan: ' + e.message })
    } finally {
      $q.loading.hide()
    }
  })
}

const uploadSignatureFromPad = (file) => {
  if (!file) return

  if (isSigningFromPreview.value) {
    if (!selectedData.value || !selectedData.value.id) return
    $q.loading.show({ message: 'Mengompres & mengunggah tanda tangan...' })
    resizeImageToBase64(file, 400)
      .then(async (base64) => {
        try {
          // 1. Simpan ke penawaran
          await updateDoc(doc(db, 'penawaran', selectedData.value.id), {
            signatureUrl: base64,
            updatedAt: serverTimestamp(),
          })
          selectedData.value.signatureUrl = base64

          // 2. Simpan ke profil karyawan
          if (userData.value?.id) {
            await updateDoc(doc(db, 'karyawan', userData.value.id), {
              signatureUrl: base64,
            })
          }

          $q.notify({ type: 'positive', message: 'Tanda tangan berhasil diunggah & dipasang!' })
        } catch (e) {
          console.error(e)
          $q.notify({ type: 'negative', message: 'Gagal menyimpan tanda tangan: ' + e.message })
        } finally {
          $q.loading.hide()
          tempPreviewSignFile.value = null
          showPad.value = false
        }
      })
      .catch((err) => {
        console.error(err)
        $q.loading.hide()
        $q.notify({ type: 'negative', message: 'Gagal mengompres gambar.' })
      })
  }
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
        const scale = maxWidth / img.width
        canvas.width = maxWidth
        canvas.height = img.height * scale
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/png', 0.8))
      }
    }
    reader.onerror = (err) => reject(err)
  })
}

onMounted(() => {
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) {
        userData.value = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
      }
    })
  }
  fetchApprovalData()
})

onUnmounted(() => {
  if (unsubUser) unsubUser()
  if (unsubApproval) unsubApproval()
})
</script>

<style>
/* =======================================================================
   ANIMASI BACKGROUND GLOBAL STYLES
   ======================================================================= */
/* =======================================================================
   MODE KHUSUS SAAT EXPORT PDF GLOBAL STYLES
   ======================================================================= */
body.is-exporting .no-print {
  display: none !important;
}
body.is-exporting .letter-paper {
  display: block !important;
  width: 180mm !important;
  min-height: auto !important;
  padding: 0mm !important;
  overflow: visible !important;
  box-shadow: none !important;
  font-size: 11px !important;
  line-height: 1.3 !important;
}
body.is-exporting .letter-paper .quotation-header {
  height: 80px !important;
  min-height: 80px !important;
  max-height: 80px !important;
  overflow: hidden !important;
}
body.is-exporting .letter-paper .final-kop-img {
  height: 60px !important;
}
body.is-exporting .letter-paper .final-pt-name {
  font-size: 21px !important;
}
body.is-exporting .letter-paper .quotation-title-pro {
  font-size: 22px !important;
}
body.is-exporting .letter-paper .final-divider {
  margin-top: 8px !important;
}
body.is-exporting .letter-paper .final-pro-table th {
  padding: 4px !important;
  font-size: 9px !important;
}
body.is-exporting .letter-paper .final-pro-table td {
  padding: 4px !important;
  font-size: 10.5px !important;
}
body.is-exporting .letter-paper .bg-indigo-left,
body.is-exporting .letter-paper .bg-indigo-right {
  padding: 8px 12px !important;
  font-size: 12px !important;
}
body.is-exporting .letter-paper .terms-header {
  padding: 4px 8px !important;
  font-size: 9.5px !important;
}
body.is-exporting .letter-paper .terms-content-box {
  padding: 6px 10px !important;
}
body.is-exporting .letter-paper .terms-content-box,
body.is-exporting .letter-paper .terms-content-box * {
  font-size: 11px !important;
}
body.is-exporting .letter-paper .final-sign-space {
  height: 100px !important;
  width: 150px !important;
  margin-bottom: 8px !important;
}
body.is-exporting .letter-paper .img-stempel {
  width: 80px !important;
  bottom: 4px !important;
}
body.is-exporting .letter-paper .img-signature {
  width: 120px !important;
  bottom: 0 !important;
}

/* Tighten spacing utility Quasar hanya saat export */
body.is-exporting .letter-paper .q-mt-lg {
  margin-top: 6px !important;
}
body.is-exporting .letter-paper .q-mt-xl {
  margin-top: 8px !important;
}
body.is-exporting .letter-paper .q-mt-md {
  margin-top: 4px !important;
}
body.is-exporting .letter-paper .q-mb-md {
  margin-bottom: 4px !important;
}
body.is-exporting .letter-paper .terms-container {
  margin-top: 6px !important;
}
body.is-exporting .letter-paper .text-closing-final {
  margin-top: 16px !important;
}
body.is-exporting .letter-paper .signature-container {
  margin-top: 30px !important;
  margin-bottom: 0px !important;
}
body.is-exporting .letter-paper .signature-container .q-mt-md {
  margin-top: 0px !important;
}
body.is-exporting .letter-paper .row.justify-between {
  margin-top: 4px !important;
  margin-bottom: 4px !important;
}
</style>

<style scoped>
/* ===== LOCAL STYLES SCOPED ===== */
.bg-page {
  background-color: #f8fcfb;
}

.font-pro {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-12 {
  border-radius: 12px;
}
.detail-table {
  width: 100%;
  border-collapse: collapse;
}
.detail-table tr td {
  padding: 10px 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
}
.detail-table tr:last-child td {
  border-bottom: none;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(54, 173, 163, 0.15);
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
.font-8 {
  font-size: 9px;
}

/* OVERRIDE WARNA LAMA (INDIGO) MENJADI BRAND COLOR BARU (TEAL) */
.bg-brand-primary,
:deep(.bg-brand-primary) {
  background-color: #36ada3 !important;
}
.text-brand-primary,
:deep(.text-brand-primary) {
  color: #36ada3 !important;
}
.bg-brand-light {
  background-color: #e6f5f4 !important;
}
.text-brand-secondary {
  color: #2a8b83 !important;
}
.border-brand-thin {
  border: 2px solid #b2e5e2 !important;
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-white-2 {
  border: 2px solid rgba(255, 255, 255, 0.4);
}

/* QUASAR COMPONENT OVERRIDES */
:deep(.q-btn.bg-brand-primary) {
  background-color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__control) {
  border-color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__label) {
  color: #36ada3 !important;
}
:deep(.q-icon[color='brand-primary']),
:deep(.q-field__prepend .q-icon) {
  color: #36ada3 !important;
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}

/* Table Styling */
.approval-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}
.hover-bg:hover {
  background-color: #e6f5f4 !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Document Preview Paper - optimized for A4 */
.letter-paper {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    sans-serif !important;
  font-size: 14px; /* Base font size untuk selaras */
  background: white;
  width: min(210mm, 100%);
  min-height: 297mm;
  padding: 15mm;
  margin: 0 auto;
  color: #1a1a1a;
  line-height: 1.4;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Scaling surat untuk mobile agar pas di layar */
@media (max-width: 768px) {
  .preview-container {
    padding: 10px !important;
    overflow-x: auto !important;
  }
  .letter-paper {
    width: 210mm !important;
    max-width: 210mm !important;
    margin: 0 auto !important;
    /* Gunakan zoom agar layout sesungguhnya ikut mengecil tanpa terpotong (Chrome/Safari) */
    zoom: calc((100vw - 20px) / 794);
    /* Fallback untuk browser yang belum support zoom sempurna */
    -moz-transform: scale(calc((100vw - 20px) / 794));
    -moz-transform-origin: top center;
    transform: scale(calc((100vw - 20px) / 794));
    transform-origin: top center;
  }
}

.final-kop-img {
  height: 70px;
  width: auto;
  object-fit: contain;
}
.final-pt-name {
  font-size: 24px;
  font-weight: 900;
  color: #1a237e;
  letter-spacing: -0.5px;
  line-height: 1.1;
}
.final-pt-tagline {
  font-size: 11px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.final-divider {
  height: 3px;
  background: #1a237e;
  margin-top: 15px;
  border-bottom: 1px solid #1a237e;
}

.client-name-pro {
  font-size: 18px;
  font-weight: 900;
  color: #1a237e;
  margin: 2px 0;
}
.quotation-title-pro {
  font-size: 26px;
  font-weight: 900;
  color: #1a237e;
  letter-spacing: 6px;
  border-bottom: 1.5px solid #eee;
  margin-bottom: 5px;
  display: inline-block;
}
.quotation-no-pro {
  font-size: 13px;
  font-weight: 800;
  margin: 2px 0;
}
.label-grey-pro {
  color: #888;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}
.text-date-pro {
  font-size: 12px;
  color: #444;
  font-weight: 600;
}

.final-pro-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 5px;
  border: 1px solid #1a237e;
}
.final-pro-table th {
  background: #1a237e !important;
  color: white !important;
  padding: 8px 7px;
  font-size: 10px;
  font-weight: 900;
  border: 1px solid white;
  text-align: center;
}
.final-pro-table td {
  padding: 7px;
  border: 1px solid #ddd;
  font-size: 11.5px;
  color: #222;
}

.row-calculation {
  background: #f8f9fa !important;
}
.row-calculation td {
  padding: 6px 12px !important;
  border: 1px solid #ddd !important;
  font-size: 10.5px;
}

/* SINKRONISASI STYLE GRAND TOTAL BLUE INDIGO DENGAN DUA NADA WARNA ELEGAN */
.row-grand-total {
  background-color: #1a237e !important;
}

.bg-indigo-left {
  background-color: #1a237e !important;
  padding: 16px 20px !important;
  font-size: 14px !important;
  letter-spacing: 0.1em;
}

.bg-indigo-right {
  background-color: #151b68 !important;
  padding: 16px 20px !important;
  font-size: 14px !important;
  min-width: 180px;
}

.border-none-pro {
  border: none !important;
}

.terms-container {
  border: 1.5px solid #1a237e;
  margin-top: 15px;
  border-radius: 2px;
  overflow: hidden;
}
.terms-header {
  background: #1a237e;
  padding: 6px 10px;
  font-weight: 900;
  color: white;
  font-size: 10.5px;
  letter-spacing: 0.5px;
}
.terms-content-box {
  padding: 8px 12px;
  color: #333;
}

/* Signature Area Styles - MATCH WITH PenawaranPage for Safe PDF Export */
.signature-container {
  margin-top: 40px; /* Diubah dari auto agar naik ke atas mendekati teks closing */
  padding-top: 5px;
  margin-bottom: 40px;
}
.final-sign-space {
  position: relative;
  height: 120px;
  width: 200px; /* Dipersempit agar pas dengan lebar nama di bawahnya */
  margin-left: auto;
  margin-right: 0;
  margin-bottom: 10px;
}
.img-stempel {
  position: absolute;
  width: 110px;
  height: auto;
  left: 38%; /* Diposisikan sedikit ke kiri agar bertumpuk dengan tanda tangan secara natural */
  transform: translateX(-50%);
  bottom: 5px;
  z-index: 2;
}
.img-signature {
  position: absolute;
  width: 160px;
  height: auto;
  left: 62%; /* Mengimbangi ekor tanda tangan agar lingkarannya pas di tengah nama */
  transform: translateX(-50%);
  bottom: 0;
  z-index: 1;
}
.text-signer-final {
  font-size: 14px;
  font-weight: 900;
  display: inline-block;
  padding: 0 5px;
}
.text-role-final {
  font-size: 11px;
  margin-top: 4px;
}

.terms-container,
.signature-container,
.final-sign-space {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Mode khusus saat export PDF diatur secara global di blok <style> di atas */

.shrink {
  flex: 0 0 auto;
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.content-relative {
  position: relative;
  z-index: 1;
}

.bg-indigo-0 {
  background-color: rgba(26, 35, 126, 0.03);
}

/* ===== CLICK SPAWN ICONS ===== */
.click-spawn-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.spawned-icon {
  position: absolute;
  color: var(--rand-color);
  transform-origin: center;
  pointer-events: none;
  animation: spawnBurst 1.4s ease-out forwards;
}

@keyframes spawnBurst {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 1;
  }
  40% {
    transform: translate(-50%, -100%) scale(1.2) rotate(var(--rand-rotate));
    opacity: 0.9;
  }
  100% {
    transform: translate(-50%, -180%) scale(0.5) rotate(calc(var(--rand-rotate) * 1.5));
    opacity: 0;
  }
}

.spawn-enter-active,
.spawn-leave-active {
  transition: all 1.4s ease;
}

@media print {
  @page {
    size: A4;
    margin: 0;
  }
  body {
    background: white !important;
    overflow: visible !important;
  }
  ::-webkit-scrollbar {
    display: none !important;
  }
  * {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
  .no-print {
    display: none !important;
  }
  .q-dialog__inner--maximized {
    padding: 0 !important;
    overflow: visible !important;
  }
  .q-card.column.no-wrap {
    height: auto !important;
    overflow: visible !important;
    display: block !important;
    box-shadow: none !important;
  }
  .preview-container {
    padding: 0 !important;
    overflow: visible !important;
    display: block !important;
  }
  .letter-paper {
    transform: scale(1) !important;
    margin: 0 !important;
    width: 210mm !important;
    min-height: 297mm !important;
    padding: 15mm !important;
    page-break-after: always;
    overflow: visible !important;
  }
  .final-pro-table th,
  .row-grand-total,
  .bg-indigo-left,
  .terms-header {
    background-color: #1a237e !important;
    color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .bg-indigo-right {
    background-color: #151b68 !important;
    color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .row-calculation {
    background-color: #f8f9fa !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}

/* ═══ SIGNATURE PAD ══════════════════════════════════════════════════════════ */
.signature-pad-wrapper {
  border: 2px dashed #36ada3;
  border-radius: 12px;
  height: 400px;
  width: 100%;
}
@media (max-width: 599px) {
  .signature-pad-wrapper {
    height: 180px;
  }
}
.signature-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
</style>
