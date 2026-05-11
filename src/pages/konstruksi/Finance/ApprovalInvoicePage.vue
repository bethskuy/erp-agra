<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
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
            @click="$router.back()"
            class="q-mr-md bg-white shadow-1"
          />
          <div>
            <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight">
              Approval Invoice
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Otorisasi Penagihan (AR)</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Tinjau, setujui, atau tolak draf invoice pelanggan sebelum dikirimkan ke pihak
              eksternal.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- =====================================================================================
         SUMMARY CARDS / KPI APPROVAL
         ===================================================================================== -->
    <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
      <!-- Menunggu Approval -->
      <div class="col-12 col-sm-4">
        <q-card flat class="list-card rounded-20 bg-white">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-caption text-grey-6 text-bold tracking-widest uppercase font-10 q-mb-xs"
              >
                MENUNGGU REVIEW
              </div>
              <div class="text-h4 text-weight-black text-orange-9">{{ pendingCount }}</div>
            </div>
            <div class="col-auto">
              <q-avatar
                size="54px"
                color="orange-1"
                text-color="orange-9"
                icon="pending_actions"
                class="shadow-sm rounded-12"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Disetujui -->
      <div class="col-12 col-sm-4">
        <q-card flat class="list-card rounded-20 bg-white">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-caption text-grey-6 text-bold tracking-widest uppercase font-10 q-mb-xs"
              >
                INVOICE DISETUJUI
              </div>
              <div class="text-h4 text-weight-black text-positive">{{ approvedCount }}</div>
            </div>
            <div class="col-auto">
              <q-avatar
                size="54px"
                color="green-1"
                text-color="positive"
                icon="fact_check"
                class="shadow-sm rounded-12"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Ditolak -->
      <div class="col-12 col-sm-4">
        <q-card flat class="list-card rounded-20 bg-white">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-caption text-grey-6 text-bold tracking-widest uppercase font-10 q-mb-xs"
              >
                INVOICE DITOLAK
              </div>
              <div class="text-h4 text-weight-black text-negative">{{ rejectedCount }}</div>
            </div>
            <div class="col-auto">
              <q-avatar
                size="54px"
                color="red-1"
                text-color="negative"
                icon="cancel_presentation"
                class="shadow-sm rounded-12"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- =====================================================================================
         SEARCH & FILTER AREA
         ===================================================================================== -->
    <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print">
      <q-card-section class="q-py-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-input
              v-model="searchQuery"
              outlined
              dense
              rounded
              placeholder="Cari No. Invoice atau Klien..."
              bg-color="white"
              class="search-input"
            >
              <template v-slot:prepend><q-icon name="search" color="indigo-10" /></template>
              <template v-slot:append v-if="searchQuery"
                ><q-icon name="close" @click="searchQuery = ''" class="cursor-pointer"
              /></template>
            </q-input>
          </div>
          <q-space />
          <!-- TABS FILTER STATUS -->
          <div class="col-12 col-md-auto">
            <q-tabs
              v-model="tabFilter"
              dense
              class="text-grey-7 bg-grey-1 rounded-12 p-1"
              active-color="indigo-10"
              indicator-color="transparent"
              active-bg-color="white"
              align="justify"
              narrow-indicator
            >
              <q-tab name="ALL" label="Semua" class="text-weight-bold rounded-12 q-px-md" />
              <q-tab name="Pending" label="Menunggu" class="text-weight-bold rounded-12 q-px-md" />
              <q-tab
                name="Approved"
                label="Disetujui"
                class="text-weight-bold rounded-12 q-px-md"
              />
              <q-tab name="Rejected" label="Ditolak" class="text-weight-bold rounded-12 q-px-md" />
            </q-tabs>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- =====================================================================================
         MAIN TABLE DATA
         ===================================================================================== -->
    <q-card
      flat
      bordered
      class="rounded-20 shadow-sm overflow-hidden bg-white no-print border-indigo-thin"
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
            @click="openReviewDialog(props.row)"
          >
            <q-td key="invoice">
              <div class="row items-center no-wrap">
                <q-avatar
                  size="36px"
                  color="indigo-1"
                  text-color="indigo-10"
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
              <div class="text-weight-bolder text-indigo-10 text-subtitle2">
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
                    ? 'primary'
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

    <!-- =====================================================================================
         DIALOG REVIEW INVOICE (PROFESSIONAL PDF LAYOUT - IDENTIK INVOICE CUSTOMER)
         ===================================================================================== -->
    <q-dialog v-model="showReview" maximized transition-show="fade" transition-hide="fade">
      <q-card class="column no-wrap bg-grey-4">
        <q-toolbar class="bg-white text-indigo-10 q-py-sm no-print shadow-4 shrink">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-weight-bold uppercase tracking-widest font-11">
            TINJAU DOKUMEN INVOICE
          </q-toolbar-title>
          <q-space />

          <!-- TOMBOL AKSI APPROVAL (MUNCUL JIKA PENDING) -->
          <div
            class="row q-gutter-md items-center"
            v-if="
              selectedInv &&
              (!selectedInv.approval_status || selectedInv.approval_status === 'Pending')
            "
          >
            <!-- TOMBOL TANDA TANGAN -->
            <q-btn-dropdown
              color="primary"
              icon="draw"
              label="Tanda Tangan"
              unelevated
              rounded
              class="shadow-2 text-weight-bold q-px-md"
            >
              <q-list class="q-pa-sm" style="min-width: 220px">
                <q-item
                  clickable
                  v-ripple
                  v-close-popup
                  @click="showPad = true"
                  class="rounded-borders"
                >
                  <q-item-section avatar><q-icon name="gesture" color="primary" /></q-item-section>
                  <q-item-section class="text-weight-medium">Gurat Digital</q-item-section>
                </q-item>
                <q-item clickable v-ripple class="rounded-borders relative-position">
                  <q-item-section avatar><q-icon name="upload" color="primary" /></q-item-section>
                  <q-item-section class="text-weight-medium">Upload File (.png)</q-item-section>
                  <q-file
                    v-model="tempSignFile"
                    borderless
                    dense
                    class="absolute-full opacity-0 cursor-pointer"
                    accept="image/*"
                    @update:model-value="uploadSignatureFile"
                  />
                </q-item>
              </q-list>
            </q-btn-dropdown>

            <q-btn
              unelevated
              color="negative"
              icon="cancel"
              label="TOLAK"
              class="rounded-12 text-weight-bold q-px-lg shadow-2"
              @click="handleReject(selectedInv)"
              :loading="isProcessing"
            />
            <q-btn
              unelevated
              color="positive"
              icon="check_circle"
              label="SETUJUI INVOICE"
              class="rounded-12 text-weight-bold q-px-lg shadow-2"
              @click="handleApprove(selectedInv)"
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

          <q-btn-group unelevated rounded class="shadow-2 q-ml-lg">
            <q-btn
              color="primary"
              icon="print"
              label="Cetak"
              @click="printInvoice"
              class="q-px-md"
            />
            <q-btn color="red-9" icon="picture_as_pdf" label="Download PDF" @click="exportToPDF" />
          </q-btn-group>
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl flex flex-center preview-container">
          <!-- KERTAS PDF INVOICE (IDENTIK DENGAN SCREENSHOT REFERENSI GAMBAR PERTAMA) -->
          <div id="invoice-pdf-area" class="letter-paper shadow-24" v-if="selectedInv">
            <!-- HEADER (Logo & PT Name ONLY) -->
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

            <!-- GARIS PEMBATAS HEADER (Biru) -->
            <div
              style="height: 3px; background-color: #2b579a; width: 100%; margin-bottom: 25px"
            ></div>

            <!-- INFO NOMOR, TANGGAL & KLIEN (Layout Rapi) -->
            <div class="row q-col-gutter-lg q-mb-xl">
              <!-- KIRI: Tagihan Kepada, Proyek -->
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

              <!-- KANAN: Title, Nomor, Tanggal -->
              <div class="col-5 text-right flex column items-end">
                <div
                  class="text-weight-900 text-italic"
                  style="color: #2b579a; font-size: 36px; letter-spacing: 2px; line-height: 1"
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
                  <tr>
                    <td class="text-left q-pb-xs">Jatuh Tempo</td>
                    <td class="text-center q-pb-xs">:</td>
                    <td class="text-weight-bold text-negative text-left q-pb-xs">
                      {{ formatDateIndo(selectedInv.jatuh_tempo) }}
                    </td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- TABEL TAGIHAN UTAMA -->
            <table class="pdf-table full-width">
              <thead>
                <tr>
                  <th width="40" class="text-center">NO</th>
                  <th class="text-center">DESKRIPSI PEKERJAAN / TAGIHAN</th>
                  <th width="160" class="text-center">JUMLAH (IDR)</th>
                </tr>
              </thead>
              <tbody>
                <!-- Item Rows -->
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
                    <div class="text-weight-bold uppercase">{{ item.judul || item.uraian }}</div>
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

                <!-- Blank Filler Row (untuk space ke subtotal) -->
                <tr>
                  <td class="border-top-none border-bottom-none" style="height: 15px"></td>
                  <td class="border-top-none border-bottom-none"></td>
                  <td class="border-top-none border-bottom-none"></td>
                </tr>

                <!-- Subtotals -->
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

            <!-- TERBILANG -->
            <div
              class="bg-grey-2 q-pa-md rounded-borders text-blue-grey-9 q-mb-xl q-mt-md"
              style="font-size: 11px; border: 1px solid #e0e0e0"
            >
              <div class="text-weight-bold q-mb-xs">Terbilang :</div>
              <div># {{ terbilangRupiah(selectedInv.grand_total) }} Rupiah #</div>
            </div>

            <!-- FOOTER INFO (PEMBAYARAN & TTD) -->
            <div class="row q-col-gutter-xl text-body2">
              <div class="col-7">
                <div
                  class="text-weight-bold uppercase tracking-widest q-mb-sm"
                  style="color: #2b579a; font-size: 11px"
                >
                  INSTRUKSI PEMBAYARAN
                </div>
                <div class="text-grey-7 q-mb-md" style="font-size: 10px">
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
                  class="text-grey-8 q-mt-md"
                  style="font-size: 9.5px"
                  v-if="selectedInv.keterangan"
                >
                  <span class="text-bold">Catatan Tambahan:</span><br />{{ selectedInv.keterangan }}
                </div>
              </div>

              <div class="col-5 text-center flex column justify-between items-center pt-lg">
                <div class="text-weight-bold q-mb-xl" style="font-size: 11.5px">Hormat Kami,</div>

                <!-- TANDA TANGAN (KHUSUS UNTUK HALAMAN APPROVAL) -->
                <div
                  class="final-sign-space flex flex-center"
                  style="
                    height: 60px;
                    position: relative;
                    width: 100%;
                    margin-top: -30px;
                    margin-bottom: 10px;
                  "
                >
                  <img
                    v-if="selectedInv.signatureUrl"
                    :src="selectedInv.signatureUrl"
                    style="
                      max-height: 70px;
                      max-width: 200px;
                      object-fit: contain;
                      mix-blend-mode: multiply;
                    "
                  />
                  <div
                    v-else
                    style="height: 60px"
                    class="flex flex-center text-grey-4 italic font-8"
                  >
                    -
                  </div>
                </div>

                <div
                  class="text-weight-bold uppercase q-px-xl q-pb-xs"
                  style="color: #2b579a; border-bottom: 1px solid #2b579a; font-size: 11.5px"
                >
                  {{ config.nama_pt || 'PT AGRA ABHINAYA PERKASA' }}
                </div>
                <div class="text-grey-6 text-bold q-mt-xs" style="font-size: 9.5px">
                  Manajemen Keuangan
                </div>
              </div>
            </div>

            <!-- Bottom Thick Border -->
            <div style="margin-top: 40px; border-bottom: 6px solid #2b579a"></div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- SIGNATURE PAD DIALOG -->
    <q-dialog v-model="showPad" persistent backdrop-filter="blur(4px)">
      <q-card style="width: 500px; max-width: 95vw" class="rounded-20 shadow-24">
        <q-card-section class="row items-center q-pb-none bg-indigo-10 text-white q-pa-md">
          <div class="text-h6 text-weight-bold uppercase" style="font-size: 14px">
            Tanda Tangan Dokumen
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <div class="signature-pad-wrapper shadow-inner bg-white border-subtle">
            <canvas ref="signatureCanvas" class="signature-canvas"></canvas>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Reset" color="grey-7" @click="clearPad" rounded />
          <q-btn
            unelevated
            label="Simpan & Pasang"
            color="indigo-10"
            @click="saveManualSignature"
            rounded
            class="q-px-xl text-weight-bold"
            :loading="submittingSign"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
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
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import html2pdf from 'html2pdf.js'
import SignaturePad from 'signature_pad'

const $q = useQuasar()

// State
const rows = ref([])
const loading = ref(true)
const isProcessing = ref(false)
const searchQuery = ref('')
const tabFilter = ref('ALL') // DEFAULT DIUBAH KE ALL AGAR TIDAK HILANG DARI LIST
const showReview = ref(false)
const selectedInv = ref(null)

const config = ref({
  kopUrl: '',
  nama_pt: 'PT. AGRA ABHINAYA PERKASA',
  alamat_pt: '',
  slogan_pt: '',
  direktur: 'Deni Purwanti',
})

let unsubInvoice = null

// Signature State
const showPad = ref(false)
const signatureCanvas = ref(null)
let signaturePad = null
const tempSignFile = ref(null)
const submittingSign = ref(false)

// Columns
const columns = [
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
]

// Fetch Data
const fetchData = async () => {
  loading.value = true

  // Config Kop Surat
  const confSnap = await getDoc(doc(db, 'config', 'perusahaan'))
  if (confSnap.exists()) config.value = confSnap.data()

  // Data Invoice Customer
  const qInv = query(collection(db, 'finance_invoice_customer'), orderBy('createdAt', 'desc'))
  unsubInvoice = onSnapshot(qInv, (snap) => {
    rows.value = snap.docs.map((d) => {
      const data = d.data()
      // Jika approval_status belum ada (invoice lama), anggap 'Pending'
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

// Filters
const filteredRows = computed(() => {
  let data = rows.value

  if (tabFilter.value !== 'ALL') {
    data = data.filter((r) => r.approval_status === tabFilter.value)
  }

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

// Dialog Review
const openReviewDialog = (row) => {
  selectedInv.value = row
  showReview.value = true
}

// Tanda Tangan Logics
watch(showPad, async (v) => {
  if (v) {
    await nextTick()
    const c = signatureCanvas.value
    if (c) {
      const r = Math.max(window.devicePixelRatio || 1, 1)
      c.width = c.offsetWidth * r
      c.height = c.offsetHeight * r
      c.getContext('2d').scale(r, r)
      signaturePad = new SignaturePad(c, { penColor: '#000000' })
    }
  }
})

const clearPad = () => signaturePad?.clear()

const saveManualSignature = async () => {
  if (!signaturePad || signaturePad.isEmpty()) {
    return $q.notify({ type: 'warning', message: 'Silakan goreskan tanda tangan!' })
  }
  submittingSign.value = true
  $q.loading.show({ message: 'Menyimpan tanda tangan...' })
  try {
    const base64 = signaturePad.toDataURL('image/png')
    await updateDoc(doc(db, 'finance_invoice_customer', selectedInv.value.id), {
      signatureUrl: base64,
      updatedAt: serverTimestamp(),
    })
    selectedInv.value.signatureUrl = base64

    const idx = rows.value.findIndex((r) => r.id === selectedInv.value.id)
    if (idx !== -1) rows.value[idx].signatureUrl = base64

    showPad.value = false
    $q.notify({ type: 'positive', message: 'Tanda tangan berhasil dipasang!' })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan tanda tangan' })
  } finally {
    submittingSign.value = false
    $q.loading.hide()
  }
}

const uploadSignatureFile = (file) => {
  if (!file) return
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = async () => {
    $q.loading.show({ message: 'Mengunggah tanda tangan...' })
    try {
      await updateDoc(doc(db, 'finance_invoice_customer', selectedInv.value.id), {
        signatureUrl: reader.result,
        updatedAt: serverTimestamp(),
      })
      selectedInv.value.signatureUrl = reader.result

      const idx = rows.value.findIndex((r) => r.id === selectedInv.value.id)
      if (idx !== -1) rows.value[idx].signatureUrl = reader.result

      $q.notify({ type: 'positive', message: 'Tanda tangan diunggah' })
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', message: 'Gagal mengunggah tanda tangan' })
    } finally {
      $q.loading.hide()
      tempSignFile.value = null
    }
  }
}

// Approval Actions
const handleApprove = (row) => {
  // Fungsi Helper untuk memproses approval
  const processApproval = async () => {
    isProcessing.value = true
    try {
      await updateDoc(doc(db, 'finance_invoice_customer', row.id), {
        approval_status: 'Approved',
        status: 'Terkirim', // Auto update client status
        approvedAt: serverTimestamp(),
      })
      selectedInv.value.approval_status = 'Approved'
      $q.notify({ type: 'positive', message: 'Invoice berhasil disetujui!' })
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', message: 'Gagal memproses approval.' })
    } finally {
      isProcessing.value = false
    }
  }

  // Cek apakah tanda tangan ada
  if (!row.signatureUrl) {
    // Jika tidak ada tanda tangan: Tampilkan Dialog Warning
    $q.dialog({
      title: '<span class="text-warning text-weight-bold">Approval Tanpa Tanda Tangan</span>',
      message: `Anda belum membubuhkan tanda tangan. Apakah Anda yakin menyetujui penerbitan Invoice <b>${row.nomor_invoice}</b> tanpa tanda tangan?`,
      html: true,
      cancel: { label: 'Batal', flat: true },
      ok: { label: 'Ya, Setujui', color: 'warning', rounded: true, unelevated: true },
    }).onOk(processApproval)
  } else {
    // Jika sudah ada tanda tangan: Tampilkan Dialog Success Normal
    $q.dialog({
      title: '<span class="text-positive text-weight-bold">Konfirmasi Approval</span>',
      message: `Anda akan <b>MENYETUJUI</b> penerbitan Invoice <b>${row.nomor_invoice}</b>. Invoice ini akan diubah statusnya menjadi <b>Terkirim</b>. Lanjutkan?`,
      html: true,
      cancel: { label: 'Batal', flat: true },
      ok: { label: 'Ya, Setujui', color: 'positive', rounded: true, unelevated: true },
    }).onOk(processApproval)
  }
}

const handleReject = (row) => {
  $q.dialog({
    title: '<span class="text-negative text-weight-bold">Tolak Invoice</span>',
    message: `Berikan alasan/catatan penolakan untuk <b>${row.nomor_invoice}</b>:`,
    html: true,
    prompt: {
      model: '',
      type: 'text',
      placeholder: 'Alasan penolakan...',
    },
    cancel: { label: 'Batal', flat: true },
    ok: { label: 'Tolak', color: 'negative', rounded: true, unelevated: true },
  }).onOk(async (reason) => {
    isProcessing.value = true
    try {
      await updateDoc(doc(db, 'finance_invoice_customer', row.id), {
        approval_status: 'Rejected',
        reject_reason: reason || 'Ditolak oleh Manajemen',
        status: 'Draft', // Kembalikan ke draft agar bisa direvisi
        rejectedAt: serverTimestamp(),
      })
      selectedInv.value.approval_status = 'Rejected'
      $q.notify({ type: 'warning', message: 'Invoice telah ditolak dan dikembalikan ke Draft.' })
      showReview.value = false
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', message: 'Gagal memproses penolakan.' })
    } finally {
      isProcessing.value = false
    }
  })
}

// --- UTILS (FORMAT & TERBILANG) ---
const formatDateIndo = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// eslint-disable-next-line no-unused-vars
const formatCompact = (num) => {
  if (!num) return '0'
  if (num >= 1000000000) return (num / 1000000000).toFixed(2).replace(/\.00$/, '') + ' M'
  if (num >= 1000000) return (num / 1000000).toFixed(2).replace(/\.00$/, '') + ' Jt'
  return num.toLocaleString('id-ID')
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

// Algoritma Terbilang Rupiah
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
  let str = bagi(Math.floor(angka)).trim()
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// PDF EXPORT
const printInvoice = () => window.print()
const exportToPDF = () => {
  const e = document.getElementById('invoice-pdf-area')
  const opt = {
    margin: 0,
    filename: `INVOICE_${selectedInv.value.nomor_invoice.replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 3, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  $q.loading.show({ message: 'Mengekspor Invoice PDF...' })
  html2pdf()
    .set(opt)
    .from(e)
    .save()
    .then(() => $q.loading.hide())
}

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  if (unsubInvoice) unsubInvoice()
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
  box-shadow: 0 10px 30px rgba(26, 35, 126, 0.15);
}
.border-indigo-thin {
  border: 1px solid rgba(26, 35, 126, 0.1);
}

.list-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}
.list-card:hover {
  border-color: #1a237e;
  box-shadow: 0 12px 25px rgba(26, 35, 126, 0.12);
  transform: translateY(-3px);
  transition: all 0.3s ease;
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
  background-color: rgba(26, 35, 126, 0.03) !important;
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

/* SIGNATURE PAD */
.signature-pad-wrapper {
  border: 2px dashed #1a237e;
  border-radius: 12px;
  height: 200px;
  width: 100%;
}
.signature-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
.font-8 {
  font-size: 8px;
}
.opacity-0 {
  opacity: 0;
}

/* =======================================================================
   PDF PREVIEW STYLES (CLEAN & PROFESSIONAL BLUE INVOICE)
   ======================================================================= */
.letter-paper {
  background: white;
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

/* Border utilities untuk tabel subtotal */
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
.no-padding {
  padding: 0 !important;
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
