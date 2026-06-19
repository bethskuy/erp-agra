<template>
  <q-page class="bg-page q-pa-md q-pa-lg-lg font-pro">
    <div class="page-content-wrapper">
      <!-- =====================================================================================
         VIEW 1: LIST APPROVAL PENGAJUAN
         ===================================================================================== -->
      <div v-if="viewMode === 'list'" class="animate-fade">
        <!-- HEADER SECTION -->
        <div class="row items-center justify-between q-mb-lg animate-fade no-print">
          <div class="col-12">
            <div class="row items-center no-wrap">
              <div>
                <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
                  Otorisasi Pencairan Dana
                  <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                    >Payment Approval Dashboard</span
                  >
                </div>
                <div class="text-subtitle1 text-grey-7 q-mt-sm">
                  Tinjau, validasi, dan setujui permohonan pencairan dana (Account Payable).
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SUMMARY CARDS / KPI - Gaya gambar keempat -->
        <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
          <!-- Total Pengajuan -->
          <div class="col-12 col-sm-3">
            <q-card
              flat
              class="rounded-20 kpi-card kpi-brand text-white transition-all hover-shadow"
            >
              <q-card-section class="row items-center no-wrap q-pa-lg">
                <div class="col">
                  <div class="text-overline text-white kpi-label tracking-widest q-mb-xs">
                    TOTAL PENGAJUAN
                  </div>
                  <div class="text-h3 text-weight-black">{{ filteredRows.length }}</div>
                </div>
                <div class="kpi-icon-wrap bg-white-10 q-pa-md rounded-borders flex flex-center">
                  <q-icon name="description" color="white" size="32px" />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Menunggu Approval -->
          <div class="col-12 col-sm-3">
            <q-card
              flat
              class="rounded-20 kpi-card kpi-orange text-white transition-all hover-shadow"
            >
              <q-card-section class="row items-center no-wrap q-pa-lg">
                <div class="col">
                  <div class="text-overline text-white kpi-label tracking-widest q-mb-xs">
                    MENUNGGU APPROVAL
                  </div>
                  <div class="text-h3 text-weight-black">{{ pendingCount }}</div>
                </div>
                <div class="kpi-icon-wrap bg-white-10 q-pa-md rounded-borders flex flex-center">
                  <q-icon name="hourglass_empty" color="white" size="32px" />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Siap Cair (Approved) -->
          <div class="col-12 col-sm-3">
            <q-card
              flat
              class="rounded-20 kpi-card kpi-green text-white transition-all hover-shadow"
            >
              <q-card-section class="row items-center no-wrap q-pa-lg">
                <div class="col">
                  <div class="text-overline text-white kpi-label tracking-widest q-mb-xs">
                    SIAP CAIR (APPROVED)
                  </div>
                  <div class="text-h3 text-weight-black">{{ approvedCount }}</div>
                </div>
                <div class="kpi-icon-wrap bg-white-10 q-pa-md rounded-borders flex flex-center">
                  <q-icon name="verified" color="white" size="32px" />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Dana Diajukan -->
          <div class="col-12 col-sm-3">
            <q-card
              flat
              class="rounded-20 kpi-card kpi-blue text-white transition-all hover-shadow"
            >
              <q-card-section class="row items-center no-wrap q-pa-lg">
                <div class="col">
                  <div class="text-overline text-white kpi-label tracking-widest q-mb-xs">
                    DANA DIAJUKAN
                  </div>
                  <div class="text-h5 text-weight-black q-mt-xs">
                    Rp {{ formatCompact(pendingAmount) }}
                  </div>
                </div>
                <div class="kpi-icon-wrap bg-white-10 q-pa-md rounded-borders flex flex-center">
                  <q-icon name="account_balance" color="white" size="32px" />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- SEARCH & FILTER AREA -->
        <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print border-subtle">
          <q-card-section class="q-py-md">
            <div class="row items-center justify-between q-col-gutter-md">
              <div class="col-12 col-sm-5">
                <q-input
                  v-model="searchQuery"
                  outlined
                  dense
                  rounded
                  placeholder="Cari No. Req / Vendor..."
                  bg-color="white"
                  class="search-input"
                  color="brand-primary"
                >
                  <template v-slot:prepend><q-icon name="search" color="brand-primary" /></template>
                  <template v-slot:append v-if="searchQuery">
                    <q-icon name="close" @click="searchQuery = ''" class="cursor-pointer" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-auto">
                <div
                  class="row items-center q-gutter-md justify-center justify-sm-end invoice-actions-container"
                >
                  <div class="text-caption text-grey-6 text-weight-medium total-invoice-text">
                    Total Pengajuan:
                    <span class="text-weight-bold text-brand-primary"
                      >{{ (filteredRows || []).length }} Dokumen</span
                    >
                  </div>

                  <!-- EXPORT DROPDOWN LIST -->
                  <q-btn-dropdown
                    icon="ios_share"
                    label="Export Data"
                    unelevated
                    rounded
                    no-caps
                    class="bg-brand-primary text-white text-weight-bold btn-hover shadow-premium btn-action-invoice w-full sm:w-auto"
                    color="brand-primary"
                  >
                    <q-list class="bg-white rounded-borders">
                      <q-item
                        clickable
                        v-close-popup
                        @click="exportTablePDF"
                        class="hover-brand-btn"
                      >
                        <q-item-section avatar
                          ><q-avatar
                            color="red-1"
                            text-color="red-10"
                            icon="picture_as_pdf"
                            size="sm"
                        /></q-item-section>
                        <q-item-section
                          ><q-item-label class="text-weight-bold"
                            >Download PDF</q-item-label
                          ></q-item-section
                        >
                      </q-item>
                      <q-separator class="q-my-sm" />
                      <q-item
                        clickable
                        v-close-popup
                        @click="exportTableExcel"
                        class="hover-brand-btn"
                      >
                        <q-item-section avatar
                          ><q-avatar
                            color="green-1"
                            text-color="green-10"
                            icon="table_view"
                            size="sm"
                        /></q-item-section>
                        <q-item-section
                          ><q-item-label class="text-weight-bold"
                            >Export Excel</q-item-label
                          ></q-item-section
                        >
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>

                  <!-- BADGE MENUNGGU OTORISASI -->
                  <div class="text-center">
                    <div
                      class="text-caption text-grey-6 q-mb-xs uppercase tracking-widest font-bold"
                    >
                      Menunggu Otorisasi
                    </div>
                    <q-badge
                      color="orange-9"
                      class="q-px-md q-py-xs text-weight-bold shadow-2 rounded-12"
                      style="font-size: 13px"
                    >
                      {{ pendingCount }} Dokumen
                    </q-badge>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- MAIN TABLE -->
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
                @click="openDetail(props.row)"
              >
                <q-td key="request">
                  <div class="text-weight-bold text-brand-primary">{{ props.row.no_request }}</div>
                  <div class="text-caption text-grey-6 font-10 mt-xs">
                    Ref:
                    <span class="text-weight-bold text-blue-grey-8">{{
                      props.row.tagihan_kode || props.row.tagihan_nomor_invoice || '-'
                    }}</span>
                  </div>
                </q-td>

                <q-td key="vendor">
                  <div class="text-weight-bold text-blue-grey-9 uppercase font-11">
                    {{ props.row.vendor_nama || '-' }}
                  </div>
                  <div class="text-caption text-brand-primary font-10 text-weight-bold">
                    {{ props.row.rek_bank }} - {{ props.row.rek_nomor }}
                  </div>
                </q-td>

                <q-td key="nominal" class="text-right">
                  <div class="text-weight-bolder text-brand-primary text-subtitle2">
                    Rp {{ (props.row.nominal || 0).toLocaleString('id-ID') }}
                  </div>
                  <div class="text-caption text-grey-6 font-10">
                    Via {{ props.row.tipe_pengajuan }}
                  </div>
                </q-td>

                <q-td key="pemohon">
                  <div class="text-weight-bold text-grey-8 font-11 uppercase">
                    {{ props.row.pembuat_nama || '-' }}
                  </div>
                  <div class="text-caption text-grey-6 font-10">
                    {{ formatDateIndo(props.row.tanggal_pengajuan) }}
                  </div>
                </q-td>

                <q-td key="status" class="text-center">
                  <q-chip
                    dense
                    :color="getStatusColor(props.row.status).bg"
                    :text-color="getStatusColor(props.row.status).text"
                    class="text-weight-bold font-10 uppercase q-ma-none shadow-sm q-px-md"
                  >
                    <q-icon
                      :name="getStatusColor(props.row.status).icon"
                      size="xs"
                      class="q-mr-xs"
                    />
                    {{ props.row.status }}
                  </q-chip>
                </q-td>

                <q-td key="otorisasi" class="text-center" @click.stop>
                  <div class="row justify-center q-gutter-xs">
                    <q-btn
                      flat
                      round
                      color="grey-7"
                      icon="visibility"
                      size="sm"
                      @click="openDetail(props.row)"
                    >
                      <q-tooltip>Lihat Detail</q-tooltip>
                    </q-btn>

                    <!-- TOMBOL EDIT REVISI NOMINAL -->
                    <q-btn
                      flat
                      round
                      color="brand-primary"
                      icon="edit"
                      size="sm"
                      @click="triggerEdit(props.row)"
                      class="shadow-1"
                    >
                      <q-tooltip>Edit / Revisi Nominal</q-tooltip>
                    </q-btn>

                    <!-- TOMBOL HAPUS -->
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete_outline"
                      size="sm"
                      @click="confirmHapus(props.row)"
                      class="shadow-1"
                    >
                      <q-tooltip>Hapus Pengajuan</q-tooltip>
                    </q-btn>

                    <template v-if="props.row.status === 'Pending'">
                      <q-btn
                        unelevated
                        round
                        color="positive"
                        icon="check"
                        size="sm"
                        class="shadow-1 q-ml-sm"
                        @click="triggerApprove(props.row)"
                      >
                        <q-tooltip>Approve Pencairan</q-tooltip>
                      </q-btn>
                      <q-btn
                        outline
                        round
                        color="negative"
                        icon="close"
                        size="sm"
                        class="q-ml-sm bg-white"
                        @click="triggerReject(props.row)"
                      >
                        <q-tooltip>Tolak Permohonan</q-tooltip>
                      </q-btn>
                    </template>
                  </div>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-xl text-grey-5">
                <q-icon name="fact_check" size="64px" class="q-mb-md opacity-50" />
                <div class="text-h6 full-width text-center">Data antrean approval kosong.</div>
              </div>
            </template>
          </q-table>
        </q-card>
      </div>

      <!-- =====================================================================================
         VIEW 2: DETAIL PENGAJUAN
         ===================================================================================== -->
      <div v-else-if="viewMode === 'detail' && selectedData" class="animate-fade q-pb-xl">
        <!-- Top Action Bar -->
        <div class="row items-center justify-between q-mb-xl no-print">
          <div class="row items-center no-wrap">
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
                DETAIL PENGAJUAN PEMBAYARAN
              </div>
              <div class="text-h5 text-weight-bolder text-brand-primary leading-tight uppercase">
                {{ selectedData.no_request }}
              </div>
            </div>
          </div>
          <div class="row items-center q-gutter-md">
            <template v-if="selectedData.status === 'Pending'">
              <q-btn
                unelevated
                color="negative"
                icon="cancel"
                label="TOLAK"
                class="rounded-12 text-weight-bold q-px-lg shadow-2"
                @click="triggerReject(selectedData)"
              />
              <q-btn
                unelevated
                color="brand-primary"
                icon="check_circle"
                label="SETUJUI PENCAIRAN"
                class="rounded-12 text-weight-bold q-px-lg shadow-2"
                @click="triggerApprove(selectedData)"
              />
            </template>
            <template v-else>
              <q-chip
                :color="getStatusColor(selectedData.status).bg"
                :text-color="getStatusColor(selectedData.status).text.replace('text-', '')"
                class="text-weight-bolder font-11 uppercase shadow-sm q-px-lg q-py-md q-ma-none"
                size="16px"
              >
                <q-icon :name="getStatusColor(selectedData.status).icon" class="q-mr-sm" />
                TELAH DI
                {{
                  selectedData.status === 'Approved'
                    ? 'SETUJUI'
                    : selectedData.status === 'Cair'
                      ? 'CAIRKAN'
                      : 'TOLAK'
                }}
              </q-chip>
            </template>
          </div>
        </div>

        <!-- MAIN CARD DETAIL -->
        <div class="row justify-center">
          <div class="col-12 col-xl-8">
            <q-card
              id="pengajuan-detail-pdf"
              flat
              bordered
              class="rounded-20 shadow-sm bg-white overflow-hidden"
            >
              <!-- Header Teal -->
              <div class="bg-brand-primary text-white q-pa-xl flex justify-between items-center">
                <div>
                  <div
                    class="text-overline text-brand-primary-2 text-bold tracking-widest uppercase q-mb-sm"
                  >
                    NOMINAL PENGAJUAN
                  </div>
                  <div class="text-h2 text-weight-black leading-none">
                    Rp {{ (selectedData.nominal || 0).toLocaleString('id-ID') }}
                  </div>
                </div>
                <div class="text-right">
                  <q-chip
                    color="white"
                    :text-color="getStatusColor(selectedData.status).text.replace('text-', '')"
                    class="text-weight-bolder font-11 uppercase shadow-sm q-px-lg q-py-md"
                    size="18px"
                  >
                    <q-icon :name="getStatusColor(selectedData.status).icon" class="q-mr-sm" />
                    {{
                      selectedData.status === 'Cair'
                        ? 'TELAH DI CAIRKAN'
                        : selectedData.status === 'Rejected'
                          ? 'TELAH DI TOLAK'
                          : selectedData.status
                    }}
                  </q-chip>
                </div>
              </div>

              <q-card-section class="q-pa-xl bg-white">
                <div class="row q-col-gutter-xl q-mb-lg">
                  <div class="col-12 col-md-6">
                    <div
                      class="text-weight-bold text-brand-primary q-mb-lg uppercase tracking-widest font-11 border-bottom-subtle q-pb-sm"
                    >
                      INFORMASI UMUM
                    </div>
                    <table class="detail-table">
                      <tr>
                        <td>Pembuat / User</td>
                        <td class="uppercase">{{ selectedData.pembuat_nama }}</td>
                      </tr>
                      <tr>
                        <td>Tipe Pengajuan</td>
                        <td>{{ selectedData.tipe_pengajuan }}</td>
                      </tr>
                      <tr v-if="selectedData.tagihan_kode || selectedData.tagihan_nomor_invoice">
                        <td>Ref. Tagihan</td>
                        <td class="text-brand-primary">
                          {{ selectedData.tagihan_kode || selectedData.tagihan_nomor_invoice }}
                        </td>
                      </tr>
                      <tr>
                        <td>Tgl Pengajuan</td>
                        <td>{{ formatDateIndo(selectedData.tanggal_pengajuan) }}</td>
                      </tr>
                      <tr>
                        <td class="text-negative">Target Cair</td>
                        <td class="text-negative">
                          {{ formatDateIndo(selectedData.tanggal_dibutuhkan) }}
                        </td>
                      </tr>
                      <tr v-if="selectedData.status === 'Cair'">
                        <td class="text-positive">Tgl Realisasi</td>
                        <td class="text-positive">
                          {{
                            formatDateIndo(
                              selectedData.realizedAt?.seconds
                                ? new Date(selectedData.realizedAt.toDate())
                                : null,
                            )
                          }}
                        </td>
                      </tr>
                    </table>
                  </div>
                  <div class="col-12 col-md-6">
                    <div
                      class="text-weight-bold text-brand-primary q-mb-lg uppercase tracking-widest font-11 border-bottom-subtle q-pb-sm"
                    >
                      REKENING TUJUAN
                    </div>
                    <table class="detail-table">
                      <tr>
                        <td>Vendor / Penerima</td>
                        <td class="uppercase">{{ selectedData.vendor_nama }}</td>
                      </tr>
                      <tr>
                        <td>Bank</td>
                        <td class="uppercase text-brand-primary">{{ selectedData.rek_bank }}</td>
                      </tr>
                      <tr>
                        <td>No. Rekening</td>
                        <td class="text-h6 text-brand-primary">{{ selectedData.rek_nomor }}</td>
                      </tr>
                      <tr>
                        <td>Atas Nama</td>
                        <td class="uppercase">{{ selectedData.rek_nama }}</td>
                      </tr>
                    </table>
                  </div>
                </div>

                <!-- SPK & BOQ DETAILS (READ ONLY) -->
                <div
                  class="row q-mt-lg"
                  v-if="
                    selectedData.proyek_nama ||
                    (selectedData.selected_spk && selectedData.selected_spk.length > 0)
                  "
                >
                  <div class="col-12">
                    <div
                      class="text-weight-bold text-brand-primary q-mb-md uppercase tracking-widest font-11 border-bottom-subtle q-pb-sm"
                    >
                      RINCIAN ALOKASI PROYEK & PEKERJAAN (BOQ)
                    </div>
                    <div class="bg-grey-1 q-pa-lg rounded-12">
                      <div
                        class="row items-center justify-between q-mb-sm q-pb-sm"
                        style="border-bottom: 1px dashed rgba(0, 0, 0, 0.1)"
                      >
                        <span class="text-weight-bold text-grey-7 text-caption">Nama Proyek:</span>
                        <span class="text-weight-black text-indigo-10 uppercase text-subtitle2">{{
                          selectedData.proyek_nama || 'NON-PROYEK'
                        }}</span>
                      </div>

                      <!-- SPK list -->
                      <div
                        v-if="selectedData.selected_spk && selectedData.selected_spk.length > 0"
                        class="q-gutter-y-sm q-mt-xs"
                      >
                        <div
                          v-for="(spkId, idx) in selectedData.selected_spk"
                          :key="idx"
                          class="bg-white q-pa-md rounded-8 border-subtle"
                        >
                          <div
                            class="text-weight-bold text-brand-primary font-12 q-mb-sm flex items-center"
                          >
                            <q-icon name="assignment" class="q-mr-xs" size="16px" />
                            {{ getSpkById(spkId)?.nomor_spk || 'SPK' }} -
                            {{ getSpkById(spkId)?.nama_kontrak || '' }}
                          </div>

                          <div
                            v-if="
                              selectedData.spk_boq_selection &&
                              selectedData.spk_boq_selection[spkId]
                            "
                          >
                            <div
                              v-if="
                                selectedData.spk_boq_selection[spkId].selected_groups &&
                                selectedData.spk_boq_selection[spkId].selected_groups.length
                              "
                              class="q-gutter-y-sm"
                            >
                              <div
                                v-for="(groupTitle, gIdx) in selectedData.spk_boq_selection[spkId]
                                  .selected_groups"
                                :key="gIdx"
                                class="q-pl-md border-left-brand-primary"
                              >
                                <div
                                  class="text-weight-bold text-caption text-indigo-8 q-mb-xs font-11"
                                >
                                  Kategori: {{ groupTitle }}
                                </div>
                                <div
                                  v-if="
                                    selectedData.spk_boq_selection[spkId].selected_items_by_group &&
                                    selectedData.spk_boq_selection[spkId].selected_items_by_group[
                                      groupTitle
                                    ] &&
                                    selectedData.spk_boq_selection[spkId].selected_items_by_group[
                                      groupTitle
                                    ].length
                                  "
                                >
                                  <ul
                                    style="
                                      margin: 0;
                                      padding-left: 20px;
                                      font-size: 11px;
                                      color: #444;
                                      list-style-type: disc;
                                    "
                                  >
                                    <li
                                      v-for="(item, iIdx) in selectedData.spk_boq_selection[spkId]
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row q-mt-lg">
                  <div class="col-12">
                    <div
                      class="text-weight-bold text-brand-primary q-mb-md uppercase tracking-widest font-11 border-bottom-subtle q-pb-sm"
                    >
                      KETERANGAN / TUJUAN DANA
                    </div>
                    <div
                      class="bg-grey-1 q-pa-lg rounded-12 text-grey-9 leading-relaxed"
                      style="font-size: 14px"
                    >
                      {{ selectedData.keterangan || '-' }}
                    </div>
                  </div>
                </div>

                <div
                  class="row q-mt-md"
                  v-if="
                    selectedData.status === 'Rejected' ||
                    selectedData.status === 'Approved' ||
                    selectedData.status === 'Cair'
                  "
                >
                  <div class="col-12">
                    <div
                      v-if="selectedData.status === 'Rejected'"
                      class="bg-red-1 text-red-9 border-red-thin q-pa-md rounded-12 text-weight-bold"
                    >
                      <q-icon name="warning" size="sm" class="q-mr-sm" /> Alasan Penolakan:
                      {{ selectedData.alasan_reject || '-' }}
                    </div>
                    <div
                      v-if="selectedData.status === 'Approved' || selectedData.status === 'Cair'"
                      class="bg-brand-light text-brand-primary-9 border-brand-thin q-pa-md rounded-12 text-weight-bold"
                    >
                      <q-icon name="check_circle" size="sm" class="q-mr-sm" /> Catatan Approval:
                      {{ selectedData.catatan_approval || 'Disetujui tanpa catatan.' }}
                    </div>
                  </div>
                </div>

                <div
                  class="row q-mt-xl"
                  v-if="
                    selectedData.status === 'Cair' &&
                    (selectedData.bukti_transfer || selectedData.nominal_eksekusi)
                  "
                >
                  <div class="col-12">
                    <div
                      class="text-weight-bold text-brand-primary q-mb-md uppercase tracking-widest font-11 border-bottom-subtle q-pb-sm"
                    >
                      BUKTI TRANSFER / REALISASI
                    </div>
                    <div
                      class="bg-blue-50 text-blue-9 border-blue-thin q-pa-md rounded-12 text-weight-bold q-mb-md"
                      v-if="selectedData.nominal_eksekusi || selectedData.catatan_realisasi"
                    >
                      <div class="q-mb-xs">
                        <q-icon name="payments" size="sm" class="q-mr-sm" /> Nominal Realisasi: Rp
                        {{
                          (selectedData.nominal_eksekusi || selectedData.nominal).toLocaleString(
                            'id-ID',
                          )
                        }}
                      </div>
                      <div>
                        <q-icon name="notes" size="sm" class="q-mr-sm" /> Catatan Eksekusi:
                        {{ selectedData.catatan_realisasi || 'Telah dicairkan' }}
                      </div>
                    </div>
                    <q-list
                      separator
                      class="rounded-12 border-subtle"
                      v-if="selectedData.bukti_transfer"
                    >
                      <q-item
                        clickable
                        v-ripple
                        @click="openLink(selectedData.bukti_transfer)"
                        class="q-py-md hover-bg"
                      >
                        <q-item-section avatar
                          ><q-avatar
                            color="brand-light"
                            text-color="brand-primary"
                            icon="receipt_long"
                        /></q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-bold text-subtitle1"
                            >Bukti Transfer (Realisasi)</q-item-label
                          >
                          <q-item-label caption
                            >Klik untuk mengunduh / melihat file bukti pembayaran</q-item-label
                          >
                        </q-item-section>
                        <q-item-section side
                          ><q-icon name="open_in_new" color="brand-primary" size="sm"
                        /></q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </div>

                <div
                  class="row q-mt-xl"
                  v-if="selectedData.lampiran && selectedData.lampiran.length > 0"
                >
                  <div class="col-12">
                    <div
                      class="text-weight-bold text-brand-primary q-mb-md uppercase tracking-widest font-11 border-bottom-subtle q-pb-sm"
                    >
                      DOKUMEN LAMPIRAN PENGAJUAN
                    </div>
                    <q-list separator class="rounded-12 border-subtle">
                      <q-item
                        v-for="(doc, dIdx) in selectedData.lampiran"
                        :key="dIdx"
                        clickable
                        v-ripple
                        @click="openLink(doc.url || doc.base64)"
                        class="q-py-md hover-bg"
                      >
                        <q-item-section avatar
                          ><q-avatar
                            color="brand-light"
                            text-color="brand-primary"
                            icon="description"
                        /></q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-bold text-subtitle1">{{
                            doc.label || 'Dokumen ' + (dIdx + 1)
                          }}</q-item-label>
                        </q-item-section>
                        <q-item-section side
                          ><q-icon name="open_in_new" color="brand-primary" size="sm"
                        /></q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- HIDDEN AREA FOR TABLE PDF EXPORT -->
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
              <q-icon name="fact_check" size="32px" />
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
                Laporan Approval Pembayaran
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
                <th style="width: 20%; text-align: left">NO REQUEST & REF</th>
                <th style="width: 20%; text-align: left">VENDOR & BANK</th>
                <th style="width: 15%; text-align: right">NOMINAL (Rp)</th>
                <th style="width: 25%; text-align: left">PEMOHON & TGL</th>
                <th style="width: 15%; text-align: center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in filteredRows" :key="idx">
                <td style="text-align: center; font-weight: bold">{{ idx + 1 }}</td>
                <td>
                  <div style="font-weight: bold; color: #00695c">{{ row.no_request }}</div>
                  <div style="font-size: 9px; color: #666; margin-top: 2px">
                    Ref: {{ row.tagihan_kode || row.tagihan_nomor_invoice || '-' }}
                  </div>
                </td>
                <td>
                  <div style="font-weight: bold; text-transform: uppercase">
                    {{ row.vendor_nama }}
                  </div>
                  <div style="font-size: 9px; color: #666; margin-top: 2px">
                    {{ row.rek_bank }} - {{ row.rek_nomor }}
                  </div>
                  <div
                    style="
                      font-size: 9px;
                      color: #004d40;
                      margin-top: 4px;
                      font-weight: bold;
                      line-height: 1.2;
                    "
                  >
                    {{ formatSpkBoqText(row) }}
                  </div>
                </td>
                <td style="text-align: right; font-weight: bold">
                  {{ (row.nominal || 0).toLocaleString('id-ID') }}
                </td>
                <td>
                  <div style="font-weight: bold; text-transform: uppercase">
                    {{ row.pembuat_nama }}
                  </div>
                  <div style="font-size: 9px; color: #666; margin-top: 2px">
                    {{ formatDateIndo(row.tanggal_pengajuan) }}
                  </div>
                </td>
                <td
                  style="
                    text-align: center;
                    font-weight: bold;
                    text-transform: uppercase;
                    font-size: 10px;
                  "
                >
                  {{ row.status }}
                </td>
              </tr>
              <tr v-if="filteredRows.length === 0">
                <td
                  colspan="6"
                  style="text-align: center; padding: 20px; color: #888; font-style: italic"
                >
                  Tidak ada data.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const authStore = useAuthStore()

const viewMode = ref('list')
const loading = ref(true)
const isProcessing = ref(false)
const rows = ref([])
const searchQuery = ref('')
const statusFilter = ref('Semua Status')
const selectedData = ref(null)

let unsubData = null
let unsubAllSpk = null
const allSpk = ref([])

// ─── Columns ───────────────────────────────────────────────────────────────
const getSpkById = (id) => {
  const targetId = typeof id === 'object' && id !== null ? id.id : id
  return allSpk.value.find((s) => s.id === targetId)
}

const formatSpkBoqText = (row) => {
  if (!row) return '-'
  const parts = []
  if (row.proyek_nama) {
    parts.push(`Proyek: ${row.proyek_nama}`)
  }
  if (row.selected_spk && row.selected_spk.length > 0) {
    row.selected_spk.forEach((spkId) => {
      const spk = getSpkById(spkId)
      const spkLabel = spk ? spk.nomor_spk || spk.nama_kontrak || spkId : spkId
      let spkPart = `SPK: ${spkLabel}`

      const selection = row.spk_boq_selection?.[spkId]
      if (selection && selection.selected_groups && selection.selected_groups.length > 0) {
        const boqParts = []
        selection.selected_groups.forEach((groupTitle) => {
          const items = selection.selected_items_by_group?.[groupTitle]
          if (items && items.length > 0) {
            const itemTexts = items.map((itemObj) => {
              return typeof itemObj === 'object' && itemObj !== null
                ? itemObj.deskripsi || itemObj
                : itemObj
            })
            boqParts.push(`${groupTitle} (${itemTexts.join(', ')})`)
          } else {
            boqParts.push(groupTitle)
          }
        })
        spkPart += ` [BOQ: ${boqParts.join('; ')}]`
      }
      parts.push(spkPart)
    })
  }
  return parts.length > 0 ? parts.join(' | ') : '-'
}

const columns = [
  { name: 'request', align: 'left', label: 'NO. REQUEST', field: 'no_request', sortable: true },
  {
    name: 'vendor',
    align: 'left',
    label: 'VENDOR / PENERIMA',
    field: 'vendor_nama',
    sortable: true,
  },
  { name: 'nominal', align: 'right', label: 'NOMINAL DIAJUKAN', field: 'nominal', sortable: true },
  { name: 'pemohon', align: 'left', label: 'PEMOHON', field: 'pembuat_nama', sortable: true },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'otorisasi', align: 'center', label: 'OTORISASI', field: 'id' },
]

// ─── Fetch Data ────────────────────────────────────────────────────────────
const fetchData = () => {
  loading.value = true
  const qPengajuan = query(
    collection(db, 'finance_pengajuan_pembayaran'),
    orderBy('createdAt', 'desc'),
  )
  unsubData = onSnapshot(
    qPengajuan,
    (snap) => {
      rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (error) => {
      console.error('Error fetching pengajuan:', error)
      loading.value = false
    },
  )

  if (unsubAllSpk) unsubAllSpk()
  unsubAllSpk = onSnapshot(collection(db, 'spk_customer'), (snap) => {
    allSpk.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })
}

// ─── KPI ───────────────────────────────────────────────────────────────────
const pendingCount = computed(() => rows.value.filter((r) => r.status === 'Pending').length)
const approvedCount = computed(() => rows.value.filter((r) => r.status === 'Approved').length)
const pendingAmount = computed(() =>
  rows.value.filter((r) => r.status === 'Pending').reduce((sum, r) => sum + (r.nominal || 0), 0),
)

const filteredRows = computed(() => {
  let res = rows.value.filter((r) => r.status !== 'Draft')
  if (statusFilter.value !== 'Semua Status')
    res = res.filter((r) => r.status === statusFilter.value)
  if (searchQuery.value) {
    const lower = searchQuery.value.toLowerCase()
    res = res.filter(
      (r) =>
        r.no_request?.toLowerCase().includes(lower) || r.vendor_nama?.toLowerCase().includes(lower),
    )
  }
  return res
})

// ─── Interaction ───────────────────────────────────────────────────────────
const openDetail = async (row) => {
  selectedData.value = row
  viewMode.value = 'detail'
  window.scrollTo(0, 0)

  // Fallback: If project details are missing but it's a Tagihan Supplier request, fetch them from the tagihan doc!
  if ((!row.proyek_nama || !row.selected_spk || row.selected_spk.length === 0) && row.tagihan_id) {
    try {
      const tagihanSnap = await getDoc(doc(db, 'finance_tagihan', row.tagihan_id))
      if (tagihanSnap.exists()) {
        const tData = tagihanSnap.data()
        selectedData.value.proyek_id = tData.proyek_id || null
        selectedData.value.proyek_nama = tData.proyek_nama || ''
        selectedData.value.selected_spk = tData.selected_spk || []
        selectedData.value.spk_boq_selection = tData.spk_boq_selection || {}
      }
    } catch (e) {
      console.error('Gagal mengambil detail proyek dari tagihan fallback:', e)
    }
  }
}

// ─── APPROVE ──────────────────────────────────────────────────────────────
const triggerApprove = (row) => {
  $q.dialog({
    title: '<span style="color:#1e6e69;font-weight:900;font-size:18px">✅ Setujui Pengajuan</span>',
    message: `<div style="font-size:14px">Berikan catatan persetujuan untuk pencairan dana <b style="color:#1e6e69">${row.no_request}</b> <span style="color:#888">(Opsional)</span>:</div>`,
    html: true,
    prompt: { model: '', type: 'textarea', placeholder: 'Catatan approval / instruksi...' },
    cancel: { label: 'Batal', flat: true, color: 'grey' },
    ok: { label: '✅  Setujui Pencairan', color: 'brand-primary', rounded: true, unelevated: true },
  }).onOk(async (notes) => {
    isProcessing.value = true
    try {
      await updateDoc(doc(db, 'finance_pengajuan_pembayaran', row.id), {
        status: 'Approved',
        catatan_approval: notes || 'Disetujui',
        approvedAt: serverTimestamp(),
        approvedBy: authStore.user?.nama || 'Otorisator',
        creator_read: false,
      })
      
      let updatedTagihan = false
      if (row.tagihan_id) {
        try {
          await updateDoc(doc(db, 'finance_tagihan', row.tagihan_id), {
            status: 'Menunggu Pembayaran',
            creator_read: false,
            updatedAt: serverTimestamp(),
          })
          updatedTagihan = true
        } catch (e) {
          console.error('Failed to update tagihan status on approve by ID:', e)
        }
      }

      const identifiers = [row.tagihan_nomor_invoice, row.tagihan_kode, row.tagihan_id].filter(
        Boolean,
      )
      if (!updatedTagihan && identifiers.length > 0) {
        for (const ident of identifiers) {
          try {
            const qTag = query(
              collection(db, 'finance_tagihan'),
              where('nomor_invoice', '==', ident),
            )
            const snapTag = await getDocs(qTag)
            for (const docRef of snapTag.docs) {
              await updateDoc(doc(db, 'finance_tagihan', docRef.id), {
                status: 'Menunggu Pembayaran',
                creator_read: false,
                updatedAt: serverTimestamp(),
              })
              updatedTagihan = true
            }
          } catch (e) {
            console.error('Failed to update tagihan status on approve by nomor_invoice:', e)
          }
        }

        if (!updatedTagihan) {
          for (const ident of identifiers) {
            try {
              const qTag = query(
                collection(db, 'finance_tagihan'),
                where('kode_tagihan', '==', ident),
              )
              const snapTag = await getDocs(qTag)
              for (const docRef of snapTag.docs) {
                await updateDoc(doc(db, 'finance_tagihan', docRef.id), {
                  status: 'Menunggu Pembayaran',
                  creator_read: false,
                  updatedAt: serverTimestamp(),
                })
                updatedTagihan = true
              }
            } catch (e) {
              console.error('Failed to update tagihan status on approve by kode_tagihan:', e)
            }
          }
        }
      }

      if (selectedData.value && selectedData.value.id === row.id) {
        selectedData.value.status = 'Approved'
        selectedData.value.catatan_approval = notes
      }
      $q.notify({
        type: 'positive',
        message: '✅  Pengajuan berhasil disetujui!',
        caption: `${row.no_request} telah di-approve`,
        icon: 'verified',
        color: 'brand-primary-dark',
        position: 'top-right',
        timeout: 3500,
        progress: true,
        actions: [{ icon: 'close', color: 'white', round: true }],
        classes: 'notif-premium',
      })
    } catch (e) {
      console.error(e)
      $q.notify({
        type: 'negative',
        message: 'Gagal memproses persetujuan.',
        icon: 'error',
        position: 'top-right',
        timeout: 3000,
        progress: true,
      })
    } finally {
      isProcessing.value = false
    }
  })
}

// ─── REJECT ────────────────────────────────────────────────────────────────
const triggerReject = (row) => {
  $q.dialog({
    title: '<span style="color:#c62828;font-weight:900;font-size:18px">❌ Tolak Pengajuan</span>',
    message: `<div style="font-size:14px">Berikan alasan penolakan untuk request <b style="color:#c62828">${row.no_request}</b>:</div>`,
    html: true,
    prompt: { model: '', type: 'textarea', placeholder: 'Alasan penolakan...' },
    cancel: { label: 'Batal', flat: true, color: 'grey' },
    ok: { label: '❌  Tolak Permohonan', color: 'negative', rounded: true, unelevated: true },
  }).onOk(async (reason) => {
    isProcessing.value = true
    try {
      await updateDoc(doc(db, 'finance_pengajuan_pembayaran', row.id), {
        status: 'Rejected',
        alasan_reject: reason || 'Ditolak oleh Otorisator',
        rejectedAt: serverTimestamp(),
        rejectedBy: authStore.user?.nama || 'Admin',
      })
      let updatedTagihan = false
      if (row.tagihan_id) {
        try {
          await updateDoc(doc(db, 'finance_tagihan', row.tagihan_id), {
            status: 'Ditolak',
            creator_read: false,
            updatedAt: serverTimestamp(),
          })
          updatedTagihan = true
        } catch (e) {
          console.error('Failed to reset tagihan status on reject by ID:', e)
        }
      }

      const identifiers = [row.tagihan_nomor_invoice, row.tagihan_kode, row.tagihan_id].filter(
        Boolean,
      )
      if (!updatedTagihan && identifiers.length > 0) {
        for (const ident of identifiers) {
          try {
            const qTag = query(
              collection(db, 'finance_tagihan'),
              where('nomor_invoice', '==', ident),
            )
            const snapTag = await getDocs(qTag)
            for (const docRef of snapTag.docs) {
              await updateDoc(doc(db, 'finance_tagihan', docRef.id), {
                status: 'Ditolak',
                creator_read: false,
                updatedAt: serverTimestamp(),
              })
              updatedTagihan = true
            }
          } catch (e) {
            console.error('Failed to reset tagihan status on reject by nomor_invoice:', e)
          }
        }

        if (!updatedTagihan) {
          for (const ident of identifiers) {
            try {
              const qTag = query(
                collection(db, 'finance_tagihan'),
                where('kode_tagihan', '==', ident),
              )
              const snapTag = await getDocs(qTag)
              for (const docRef of snapTag.docs) {
                await updateDoc(doc(db, 'finance_tagihan', docRef.id), {
                  status: 'Ditolak',
                  creator_read: false,
                  updatedAt: serverTimestamp(),
                })
                updatedTagihan = true
              }
            } catch (e) {
              console.error('Failed to reset tagihan status on reject by kode_tagihan:', e)
            }
          }
        }
      }
      if (selectedData.value && selectedData.value.id === row.id) {
        selectedData.value.status = 'Rejected'
        selectedData.value.alasan_reject = reason
      }
      $q.notify({
        type: 'warning',
        message: '❌  Pengajuan telah ditolak.',
        caption: `${row.no_request} — ${reason || 'Ditolak'}`,
        icon: 'cancel',
        color: 'deep-orange-9',
        position: 'top-right',
        timeout: 3500,
        progress: true,
        actions: [{ icon: 'close', color: 'white', round: true }],
        classes: 'notif-premium',
      })
    } catch (e) {
      console.error(e)
      $q.notify({
        type: 'negative',
        message: 'Gagal memproses penolakan.',
        icon: 'error',
        position: 'top-right',
        timeout: 3000,
        progress: true,
      })
    } finally {
      isProcessing.value = false
    }
  })
}

// ─── EDIT NOMINAL ──────────────────────────────────────────────────────────
const triggerEdit = (row) => {
  $q.dialog({
    title:
      '<span style="color:#1e6e69;font-weight:900;font-size:18px">✏️ Revisi Nominal Dana</span>',
    message: `<div style="font-size:14px">Masukkan nominal baru untuk <b style="color:#1e6e69">${row.no_request}</b>.<br/><span style="color:#888">Nominal saat ini: <b>Rp ${(row.nominal || 0).toLocaleString('id-ID')}</b></span></div>`,
    html: true,
    prompt: {
      model: String(row.nominal || ''),
      type: 'number',
      placeholder: 'Nominal baru (Rp)...',
      attrs: { min: 0 },
    },
    cancel: { label: 'Batal', flat: true, color: 'grey' },
    ok: { label: '💾  Simpan Perubahan', color: 'brand-primary', rounded: true, unelevated: true },
  }).onOk(async (newNominal) => {
    const parsed = parseFloat(newNominal)
    if (isNaN(parsed) || parsed <= 0) {
      $q.notify({
        type: 'negative',
        message: 'Nominal tidak valid. Harus lebih dari 0.',
        icon: 'error_outline',
        position: 'top-right',
        timeout: 3000,
      })
      return
    }
    isProcessing.value = true
    try {
      await updateDoc(doc(db, 'finance_pengajuan_pembayaran', row.id), {
        nominal: parsed,
        nominal_revised: true,
        revisedAt: serverTimestamp(),
        revisedBy: authStore.user?.nama || 'Admin',
      })
      if (selectedData.value && selectedData.value.id === row.id) {
        selectedData.value.nominal = parsed
      }
      $q.notify({
        message: `💾  Nominal berhasil direvisi!`,
        caption: `${row.no_request} → Rp ${parsed.toLocaleString('id-ID')}`,
        icon: 'edit_note',
        color: 'brand-primary-dark',
        position: 'top-right',
        timeout: 3500,
        progress: true,
        actions: [{ icon: 'close', color: 'white', round: true }],
        classes: 'notif-premium',
      })
    } catch (e) {
      console.error(e)
      $q.notify({
        type: 'negative',
        message: 'Gagal menyimpan revisi nominal.',
        icon: 'error',
        position: 'top-right',
        timeout: 3000,
      })
    } finally {
      isProcessing.value = false
    }
  })
}

const confirmHapus = (row) => {
  $q.dialog({
    title: 'Hapus Pengajuan',
    message: `Hapus request ${row.no_request} secara permanen?`,
    cancel: true,
    ok: { color: 'negative', label: 'Hapus', unelevated: true },
  }).onOk(async () => {
    isProcessing.value = true
    try {
      // Revert tagihan status if the request was linked to a tagihan
      const tagihanId = row.tagihan_id || null
      const nomorInvoice = row.tagihan_nomor_invoice || null
      const kodeTagihan = row.tagihan_kode || null

      let updatedTagihan = false
      if (tagihanId) {
        try {
          await updateDoc(doc(db, 'finance_tagihan', tagihanId), {
            status: 'Draft',
            updatedAt: serverTimestamp(),
          })
          updatedTagihan = true
        } catch (e) {
          console.error('Failed to reset tagihan on delete by ID:', e)
        }
      }

      const identifiers = [nomorInvoice, kodeTagihan, tagihanId].filter(Boolean)
      if (!updatedTagihan && identifiers.length > 0) {
        for (const ident of identifiers) {
          try {
            const qTag = query(
              collection(db, 'finance_tagihan'),
              where('nomor_invoice', '==', ident),
            )
            const snapTag = await getDocs(qTag)
            for (const docRef of snapTag.docs) {
              await updateDoc(doc(db, 'finance_tagihan', docRef.id), {
                status: 'Draft',
                updatedAt: serverTimestamp(),
              })
              updatedTagihan = true
            }
          } catch (e) {
            console.error('Failed to reset tagihan on delete by nomor_invoice:', e)
          }
        }

        if (!updatedTagihan) {
          for (const ident of identifiers) {
            try {
              const qTag = query(
                collection(db, 'finance_tagihan'),
                where('kode_tagihan', '==', ident),
              )
              const snapTag = await getDocs(qTag)
              for (const docRef of snapTag.docs) {
                await updateDoc(doc(db, 'finance_tagihan', docRef.id), {
                  status: 'Draft',
                  updatedAt: serverTimestamp(),
                })
                updatedTagihan = true
              }
            } catch (e) {
              console.error('Failed to reset tagihan on delete by kode_tagihan:', e)
            }
          }
        }
      }

      await deleteDoc(doc(db, 'finance_pengajuan_pembayaran', row.id))

      $q.notify({
        type: 'positive',
        message: 'Data berhasil dihapus.',
        timeout: 2500,
      })
    } catch (error) {
      console.error(error)
      $q.notify({
        type: 'negative',
        message: 'Gagal menghapus pengajuan.',
        timeout: 3000,
      })
    } finally {
      isProcessing.value = false
    }
  })
}

// ─── Utilities ─────────────────────────────────────────────────────────────
const formatDateIndo = (d) => {
  if (!d) return '-'
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
    case 'Pending':
      return { bg: 'orange-1', text: 'text-orange-9', icon: 'hourglass_empty' }
    case 'Approved':
      return { bg: 'brand-light', text: 'text-brand-primary', icon: 'verified' }
    case 'Rejected':
      return { bg: 'red-1', text: 'text-negative', icon: 'cancel' }
    case 'Cair':
      return { bg: 'blue-1', text: 'text-primary', icon: 'payments' }
    default:
      return { bg: 'grey-2', text: 'text-grey-8', icon: 'info' }
  }
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
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: 'Gagal membuka dokumen internal.',
        position: 'top-right',
      })
    }
  } else {
    window.open(url, '_blank')
  }
}

// ─── Export ────────────────────────────────────────────────────────────────
const exportTablePDF = () => {
  const e = document.getElementById('table-pdf-export')
  if (!e) return
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `Daftar_Approval_Pembayaran_${Date.now()}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
  }
  $q.loading.show({ message: 'Mengekspor PDF...' })
  html2pdf()
    .set(opt)
    .from(e)
    .save()
    .then(() => $q.loading.hide())
}

const exportTableExcel = () => {
  try {
    let csv = `NO REQUEST,REF TAGIHAN,VENDOR/PENERIMA,BANK,NO REKENING,ALOKASI PROYEK & BOQ,PEMOHON,TGL PENGAJUAN,TARGET CAIR,NOMINAL,STATUS,CATATAN/ALASAN\n`
    filteredRows.value.forEach((r) => {
      csv += `"${r.no_request}","${r.tagihan_kode || r.tagihan_nomor_invoice || '-'}","${r.vendor_nama}","${r.rek_bank}","${r.rek_nomor}","${formatSpkBoqText(r).replace(/"/g, '""')}","${r.pembuat_nama}","${formatDateIndo(r.tanggal_pengajuan)}","${formatDateIndo(r.tanggal_dibutuhkan)}","${r.nominal}","${r.status}","${(r.catatan_approval || r.alasan_reject || '').replace(/"/g, '""').replace(/\n/g, ' ')}"\n`
    })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Daftar_Approval_Pembayaran_${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
    $q.notify({
      type: 'positive',
      message: 'Data list berhasil diekspor ke Excel (CSV)',
      position: 'top-right',
      progress: true,
    })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Gagal mengekspor data list', position: 'top-right' })
  }
}

// eslint-disable-next-line no-unused-vars
const exportDetailPDF = () => {
  const e = document.getElementById('pengajuan-detail-pdf')
  if (!e) return
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `Detail_Approval_${selectedData.value.no_request.replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 3, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  $q.loading.show({ message: 'Mengekspor PDF...' })
  html2pdf()
    .set(opt)
    .from(e)
    .save()
    .then(() => $q.loading.hide())
}

// eslint-disable-next-line no-unused-vars
const exportDetailExcel = () => {
  try {
    let csv = `NO REQUEST,TIPE PENGAJUAN,REF TAGIHAN,VENDOR/PENERIMA,BANK,NO REKENING,ATAS NAMA,ALOKASI PROYEK & BOQ,TGL PENGAJUAN,TARGET CAIR,TGL REALISASI,NOMINAL,STATUS,KETERANGAN,CATATAN APPROVAL\n`
    const r = selectedData.value
    csv += `"${r.no_request}","${r.tipe_pengajuan}","${r.tagihan_kode || r.tagihan_nomor_invoice || '-'}","${r.vendor_nama}","${r.rek_bank}","${r.rek_nomor}","${r.rek_nama}","${formatSpkBoqText(r).replace(/"/g, '""')}","${formatDateIndo(r.tanggal_pengajuan)}","${formatDateIndo(r.tanggal_dibutuhkan)}","${formatDateIndo(r.realizedAt?.seconds ? new Date(r.realizedAt.toDate()) : null)}","${r.nominal}","${r.status}","${(r.keterangan || '').replace(/"/g, '""').replace(/\n/g, ' ')}","${(r.catatan_approval || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Detail_Approval_${r.no_request.replace(/\//g, '-')}.csv`
    link.click()
    URL.revokeObjectURL(url)
    $q.notify({
      type: 'positive',
      message: 'Data detail berhasil diekspor ke Excel (CSV)',
      position: 'top-right',
      progress: true,
    })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Gagal mengekspor data detail', position: 'top-right' })
  }
}

onMounted(() => {
  fetchData()
})
onUnmounted(() => {
  if (unsubData) unsubData()
  if (unsubAllSpk) unsubAllSpk()
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
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.border-red-thin {
  border: 1px solid rgba(229, 57, 53, 0.2);
}
.border-brand-thin {
  border: 1px solid rgba(54, 173, 163, 0.2);
}
.border-blue-thin {
  border: 1px solid rgba(25, 118, 210, 0.18);
}
.border-left-brand-primary {
  border-left: 3px solid #36ada3;
}

/* PAGE BACKGROUND */
.bg-teal-page {
  background: linear-gradient(135deg, #e0f2f1 0%, #f1f8e9 50%, #e8f5e9 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* ─── KPI CARDS ──────────────────────────────────────────────────── */
.kpi-card {
  border: none !important;
}
.kpi-brand {
  background: linear-gradient(135deg, #36ada3 0%, #1e6e69 100%) !important;
}
.kpi-orange {
  background: linear-gradient(135deg, #fb8c00 0%, #e65100 100%) !important;
}
.kpi-green {
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%) !important;
}
.kpi-blue {
  background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%) !important;
}
.kpi-label {
  font-size: 10px;
  letter-spacing: 0.12em;
  opacity: 0.9;
}
.kpi-icon-wrap {
  background: rgba(255, 255, 255, 0.18) !important;
  border-radius: 12px !important;
}

/* ─── TABLE ──────────────────────────────────────────────────────── */
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
  background-color: rgba(54, 173, 163, 0.04) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(30, 110, 105, 0.18) !important;
}
.hover-brand-btn:hover {
  background-color: #e0f7f6 !important;
  color: #1e6e69 !important;
}

/* ─── ANIMATIONS ─────────────────────────────────────────────────── */
.animate-fade {
  animation: fadeIn 0.5s ease-out;
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

/* ─── SEARCH ─────────────────────────────────────────────────────── */
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}

/* ─── DETAIL TABLE ───────────────────────────────────────────────── */
.detail-table {
  width: 100%;
  border-collapse: collapse;
}
.detail-table td {
  padding: 12px 0;
  font-size: 13px;
  border-bottom: 1px solid #f5f5f5;
}
.detail-table tr:last-child td {
  border-bottom: none;
}
.detail-table td:first-child {
  width: 40%;
  color: #666;
  font-weight: 500;
}
.detail-table td:last-child {
  color: #111;
  font-weight: 700;
}

/* ─── MISC ───────────────────────────────────────────────────────── */
.opacity-50 {
  opacity: 0.5;
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

/* ─── FLOATING ICONS ─────────────────────────────────────────────── */
.floating-icons-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.float-icon {
  position: absolute;
  bottom: -60px;
  animation: floatUp linear infinite;
}
@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-110vh) rotate(30deg) scale(1.2);
    opacity: 0;
  }
}

/* ─── BURST ICONS ────────────────────────────────────────────────── */
.burst-icon-group {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
}
.burst-icon {
  position: absolute;
  animation: burstAnim 0.9s ease-out forwards;
}
@keyframes burstAnim {
  0% {
    transform: translate(0, 0) scale(0.5);
    opacity: 1;
  }
  70% {
    opacity: 0.9;
  }
  100% {
    transform: translate(var(--dx), var(--dy)) scale(1.3);
    opacity: 0;
  }
}
.burst-enter-active,
.burst-leave-active {
  transition: opacity 0.9s;
}
.burst-leave-to {
  opacity: 0;
}

/* ─── GLOBAL NOTIFY PREMIUM ──────────────────────────────────────── */
:deep(.notif-premium) {
  border-radius: 14px !important;
  font-weight: 600 !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18) !important;
  font-size: 14px !important;
}

/* ─── PDF EXPORT ─────────────────────────────────────────────────── */
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
  background-color: #2b579a !important;
  color: white !important;
  padding: 10px;
  font-size: 11px;
  border: 1px solid #2b579a;
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
  #pengajuan-detail-pdf {
    box-shadow: none !important;
    margin: 0 !important;
  }
}
</style>
