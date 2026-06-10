<template>
  <q-page class="bg-page q-pa-md font-pro">
    <div class="page-content-wrapper">
      <!-- =====================================================================================
         VIEW 1: LIST ANTRIAN & RIWAYAT REALISASI
         ===================================================================================== -->
      <div v-if="viewMode === 'list'" class="animate-fade">
        <!-- HEADER SECTION -->
        <div class="row items-center justify-between q-mb-lg no-print">
          <div class="col-12">
            <div class="row items-center no-wrap">
              <div>
                <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
                  Realisasi Pembayaran
                  <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                    >Payment Disbursement Execution</span
                  >
                </div>
                <div class="text-subtitle1 text-grey-7 q-mt-sm">
                  Eksekusi pencairan dana (transfer) untuk pengajuan yang telah disetujui
                  (Approved).
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SUMMARY CARDS / KPI -->
        <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
          <!-- Antrean Cair -->
          <div class="col-12 col-sm-4">
            <q-card
              flat
              class="rounded-20 kpi-card kpi-orange text-white transition-all hover-shadow"
            >
              <q-card-section class="row items-center no-wrap q-pa-lg">
                <div class="col">
                  <div class="text-overline text-white kpi-label tracking-widest q-mb-xs">
                    ANTREAN CAIR
                  </div>
                  <div class="text-h3 text-weight-black">{{ pendingCount }}</div>
                </div>
                <div class="kpi-icon-wrap q-pa-md rounded-borders flex flex-center">
                  <q-icon name="pending_actions" color="white" size="32px" />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Nilai Dana Antrean -->
          <div class="col-12 col-sm-4">
            <q-card
              flat
              class="rounded-20 kpi-card kpi-blue-grey text-white transition-all hover-shadow"
            >
              <q-card-section class="row items-center no-wrap q-pa-lg">
                <div class="col">
                  <div class="text-overline text-white kpi-label tracking-widest q-mb-xs">
                    NILAI DANA ANTREAN
                  </div>
                  <div class="text-h5 text-weight-black q-mt-xs">
                    Rp {{ formatCompact(pendingAmount) }}
                  </div>
                </div>
                <div class="kpi-icon-wrap q-pa-md rounded-borders flex flex-center">
                  <q-icon name="account_balance_wallet" color="white" size="32px" />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Dana Terealisasi -->
          <div class="col-12 col-sm-4">
            <q-card
              flat
              class="rounded-20 kpi-card kpi-brand text-white transition-all hover-shadow"
            >
              <q-card-section class="row items-center no-wrap q-pa-lg">
                <div class="col">
                  <div class="text-overline text-white kpi-label tracking-widest q-mb-xs">
                    DANA TEREALISASI
                  </div>
                  <div class="text-h5 text-weight-black q-mt-xs">
                    Rp {{ formatCompact(realizedAmount) }}
                  </div>
                </div>
                <div class="kpi-icon-wrap q-pa-md rounded-borders flex flex-center">
                  <q-icon name="price_check" color="white" size="32px" />
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
              <div
                class="col-12 col-sm-auto flex items-center justify-center justify-sm-end q-gutter-x-md q-mt-sm q-mt-sm-none"
              >
                <q-tabs
                  v-model="tabFilter"
                  dense
                  class="text-grey-7 bg-grey-1 rounded-12 p-1"
                  active-color="white"
                  active-bg-color="brand-primary"
                  indicator-color="transparent"
                  align="left"
                  narrow-indicator
                >
                  <q-tab
                    name="Approved"
                    label="Antrean Transfer"
                    class="text-weight-bold rounded-12 q-px-md"
                    icon="hourglass_empty"
                  />
                  <q-tab
                    name="Cair"
                    label="Riwayat Realisasi"
                    class="text-weight-bold rounded-12 q-px-md"
                    icon="task_alt"
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
                  <div class="row items-center q-gutter-x-xs no-wrap">
                    <span class="text-weight-bold text-brand-primary">{{
                      props.row.no_request
                    }}</span>
                    <q-badge
                      v-if="props.row.status === 'Approved' && props.row.realizer_read === false"
                      color="positive"
                      class="animate-bounce q-px-xs"
                      style="font-size: 9px"
                      >BARU</q-badge
                    >
                  </div>
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
                  <div class="text-caption text-primary font-10 text-weight-bold">
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

                <q-td key="timeline" class="text-center">
                  <div class="text-weight-bold text-grey-8 font-11">
                    {{ formatDateIndo(props.row.tanggal_dibutuhkan) }}
                  </div>
                  <div class="text-caption text-negative font-10" v-if="tabFilter === 'Approved'">
                    Target Cair
                  </div>
                  <div class="text-caption text-positive font-10" v-else>
                    Tgl Cair:
                    {{
                      formatDateIndo(
                        props.row.realizedAt?.seconds
                          ? new Date(props.row.realizedAt.toDate())
                          : null,
                      )
                    }}
                  </div>
                </q-td>

                <q-td key="status" class="text-center">
                  <q-chip
                    dense
                    :color="getStatusColor(props.row.status).bg"
                    :text-color="getStatusColor(props.row.status).text"
                    class="text-weight-bold font-10 uppercase q-ma-none shadow-sm q-px-sm"
                  >
                    <q-icon
                      :name="getStatusColor(props.row.status).icon"
                      size="xs"
                      class="q-mr-xs"
                    />
                    {{ props.row.status }}
                  </q-chip>
                </q-td>

                <q-td key="aksi" class="text-center" @click.stop>
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
                    <q-btn
                      v-if="props.row.status === 'Approved'"
                      unelevated
                      round
                      color="positive"
                      icon="payments"
                      size="sm"
                      class="shadow-1 q-ml-sm"
                      @click="triggerRealisasi(props.row)"
                    >
                      <q-tooltip>Eksekusi Pembayaran / Cair</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-xl text-grey-5">
                <q-icon name="price_check" size="64px" class="q-mb-md opacity-50" />
                <div class="text-h6 full-width text-center">Tidak ada data di tab ini.</div>
              </div>
            </template>
          </q-table>
        </q-card>
      </div>

      <!-- =====================================================================================
         VIEW 2: DETAIL REALISASI (VIEW SWITCHER)
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
            <q-btn-dropdown
              unelevated
              color="white"
              text-color="brand-primary"
              icon="ios_share"
              label="Export Dokumen"
              class="rounded-12 text-weight-bold shadow-2"
            >
              <q-list class="bg-white rounded-borders q-py-sm" style="min-width: 200px">
                <q-item clickable v-close-popup @click="exportDetailPDF" class="hover-brand-btn">
                  <q-item-section avatar
                    ><q-avatar color="red-1" text-color="red-10" icon="picture_as_pdf" size="sm"
                  /></q-item-section>
                  <q-item-section
                    ><q-item-label class="text-weight-bold"
                      >Download PDF</q-item-label
                    ></q-item-section
                  >
                </q-item>
                <q-separator class="q-my-sm" />
                <q-item clickable v-close-popup @click="exportDetailExcel" class="hover-brand-btn">
                  <q-item-section avatar
                    ><q-avatar color="green-1" text-color="green-10" icon="table_view" size="sm"
                  /></q-item-section>
                  <q-item-section
                    ><q-item-label class="text-weight-bold"
                      >Export Excel</q-item-label
                    ></q-item-section
                  >
                </q-item>
              </q-list>
            </q-btn-dropdown>

            <template v-if="selectedData.status === 'Approved'">
              <q-btn
                unelevated
                color="positive"
                icon="payments"
                label="EKSEKUSI PEMBAYARAN"
                class="rounded-12 text-weight-bold q-px-lg shadow-2"
                @click="triggerRealisasi(selectedData)"
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
              <!-- Header Biru Tua -->
              <div class="bg-brand-primary text-white q-pa-xl flex justify-between items-center">
                <div>
                  <div
                    class="text-overline text-white text-opacity-80 text-bold tracking-widest uppercase q-mb-sm"
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
                      <tr v-if="selectedData.tagihan_nomor_invoice">
                        <td>Ref. Tagihan</td>
                        <td class="text-primary">{{ selectedData.tagihan_nomor_invoice }}</td>
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
                        <td class="uppercase text-primary">{{ selectedData.rek_bank }}</td>
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
                        <span
                          class="text-weight-black text-brand-primary uppercase text-subtitle2"
                          >{{ selectedData.proyek_nama || 'NON-PROYEK' }}</span
                        >
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
                                  class="text-weight-bold text-caption text-brand-primary q-mb-xs font-11"
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
                      class="bg-green-1 text-green-9 border-green-thin q-pa-md rounded-12 text-weight-bold"
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
                          ><q-icon name="open_in_new" color="primary" size="sm"
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
                          ><q-icon name="open_in_new" color="primary" size="sm"
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

      <!-- DIALOG REALISASI (FULLSCREEN / MAXIMIZED) -->
      <q-dialog
        v-model="showRealisasiDialog"
        maximized
        persistent
        transition-show="slide-up"
        transition-hide="slide-down"
      >
        <q-card class="bg-grey-2 column no-wrap">
          <q-toolbar class="bg-brand-primary text-white q-py-md shadow-4 shrink">
            <q-btn flat round dense icon="close" v-close-popup />
            <q-toolbar-title class="text-weight-black uppercase"
              >EKSEKUSI PENCAIRAN DANA</q-toolbar-title
            >
            <q-btn
              unelevated
              color="white"
              text-color="brand-primary"
              label="PROSES REALISASI"
              @click="processRealisasi"
              rounded
              class="q-px-xl text-weight-black shadow-2"
              :loading="isProcessing"
            />
          </q-toolbar>

          <q-scroll-area class="col q-pa-md q-pa-lg-xl">
            <div class="row justify-center">
              <div class="col-12 col-md-8 col-xl-6">
                <q-card flat bordered class="rounded-20 bg-white shadow-1 q-pa-lg q-pa-md-xl">
                  <div class="text-overline text-brand-primary text-bold tracking-widest q-mb-sm">
                    RINCIAN EKSEKUSI PEMBAYARAN
                  </div>
                  <div class="row q-col-gutter-md q-mb-lg">
                    <q-input
                      class="col-12 col-md-6"
                      outlined
                      dense
                      type="date"
                      v-model="realisasiForm.tanggal"
                      label="Tanggal Eksekusi *"
                      stack-label
                      bg-color="white"
                    />
                    <q-input
                      class="col-12 col-md-6"
                      outlined
                      dense
                      type="number"
                      v-model.number="realisasiForm.nominal"
                      label="Nominal Eksekusi (Rp) *"
                      prefix="Rp"
                      input-class="text-weight-bold text-brand-primary"
                      bg-color="white"
                    />
                    <q-input
                      class="col-12"
                      outlined
                      dense
                      type="textarea"
                      rows="3"
                      v-model="realisasiForm.catatan"
                      label="Catatan / Keterangan Tambahan"
                      placeholder="Masukkan catatan jika ada (opsional)..."
                      bg-color="white"
                    />
                  </div>

                  <q-separator class="q-my-lg border-subtle" />

                  <div class="text-overline text-brand-primary text-bold tracking-widest q-mb-sm">
                    BUKTI DOKUMEN / TRANSFER
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12">
                      <q-file
                        outlined
                        dense
                        v-model="realisasiForm.bukti_file"
                        label="Upload Bukti Transfer / Dokumen (JPG, PNG, PDF) *"
                        accept="image/*, .pdf"
                        bg-color="white"
                        class="bg-brand-light"
                      >
                        <template v-slot:prepend
                          ><q-icon name="cloud_upload" color="brand-primary"
                        /></template>
                        <template v-slot:append v-if="realisasiForm.bukti_file">
                          <q-icon
                            name="close"
                            @click.stop.prevent="realisasiForm.bukti_file = null"
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

      <!-- HIDDEN AREA FOR TABLE PDF EXPORT -->
      <div style="position: absolute; top: -9999px; left: -9999px; width: 210mm; z-index: -1">
        <div
          id="table-pdf-export"
          style="padding: 10mm; width: 100%; background: white; font-family: 'Arial', sans-serif"
        >
          <div
            style="
              border-bottom: 3px solid #36ada3;
              padding-bottom: 15px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
            "
          >
            <div
              style="
                background-color: #36ada3;
                color: white;
                border-radius: 8px;
                padding: 12px;
                margin-right: 15px;
              "
            >
              <q-icon name="price_check" size="32px" />
            </div>
            <div>
              <div
                style="
                  font-size: 20px;
                  font-weight: 900;
                  color: #36ada3;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                "
              >
                Laporan Realisasi Pembayaran
              </div>
              <div style="font-size: 11px; color: #666; margin-top: 4px">
                Diekspor pada: {{ new Date().toLocaleString('id-ID') }}
              </div>
            </div>
          </div>
          <table
            style="width: 100%; border-collapse: collapse; font-size: 11px; border: 2px solid #bbb"
          >
            <thead>
              <tr style="background-color: #36ada3; color: white">
                <th
                  style="width: 5%; padding: 10px; text-align: center; border: 1.5px solid #2e8b82"
                >
                  NO
                </th>
                <th
                  style="width: 18%; padding: 10px; text-align: left; border: 1.5px solid #2e8b82"
                >
                  NO REQUEST
                </th>
                <th
                  style="width: 22%; padding: 10px; text-align: left; border: 1.5px solid #2e8b82"
                >
                  VENDOR
                </th>
                <th
                  style="width: 18%; padding: 10px; text-align: right; border: 1.5px solid #2e8b82"
                >
                  NOMINAL
                </th>
                <th
                  style="width: 15%; padding: 10px; text-align: center; border: 1.5px solid #2e8b82"
                >
                  TANGGAL
                </th>
                <th
                  style="width: 10%; padding: 10px; text-align: center; border: 1.5px solid #2e8b82"
                >
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in filteredRows" :key="idx" style="border: 1.5px solid #bbb">
                <td
                  style="
                    text-align: center;
                    padding: 10px;
                    font-weight: bold;
                    border: 1.5px solid #bbb;
                  "
                >
                  {{ idx + 1 }}
                </td>
                <td style="text-align: left; padding: 10px; border: 1.5px solid #bbb">
                  <div style="font-weight: bold; color: #1e6e69">{{ row.no_request }}</div>
                  <div style="font-size: 8px; color: #666; margin-top: 2px">
                    Ref: {{ row.tagihan_kode || row.tagihan_nomor_invoice || '-' }}
                  </div>
                </td>
                <td style="text-align: left; padding: 10px; border: 1.5px solid #bbb">
                  <div style="font-weight: bold">{{ row.vendor_nama }}</div>
                  <div style="font-size: 8px; color: #666; margin-top: 2px">
                    {{ row.rek_bank }} - {{ row.rek_nomor }}
                  </div>
                </td>
                <td
                  style="
                    text-align: right;
                    padding: 10px;
                    font-weight: bold;
                    border: 1.5px solid #bbb;
                  "
                >
                  Rp {{ (row.nominal || 0).toLocaleString('id-ID') }}
                </td>
                <td style="text-align: center; padding: 10px; border: 1.5px solid #bbb">
                  {{
                    row.status === 'Cair'
                      ? formatDateIndo(
                          row.realizedAt?.seconds ? new Date(row.realizedAt.toDate()) : null,
                        )
                      : formatDateIndo(row.tanggal_dibutuhkan)
                  }}
                </td>
                <td
                  style="
                    text-align: center;
                    padding: 10px;
                    font-weight: bold;
                    text-transform: uppercase;
                    border: 1.5px solid #bbb;
                  "
                >
                  {{ row.status }}
                </td>
              </tr>
              <tr v-if="filteredRows.length === 0">
                <td
                  colspan="6"
                  style="
                    text-align: center;
                    padding: 25px;
                    color: #888;
                    font-style: italic;
                    border: 1.5px solid #bbb;
                  "
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
import { db, storage } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
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
const tabFilter = ref('Approved')
const selectedData = ref(null)

const showRealisasiDialog = ref(false)
const realisasiForm = ref({
  tanggal: new Date().toISOString().substr(0, 10),
  nominal: 0,
  catatan: '',
  bukti_file: null,
})

let unsubData = null
let unsubAllSpk = null
const allSpk = ref([])

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
  {
    name: 'request',
    align: 'left',
    label: 'NO. REQUEST & REF',
    field: 'no_request',
    sortable: true,
  },
  {
    name: 'vendor',
    align: 'left',
    label: 'VENDOR / PENERIMA',
    field: 'vendor_nama',
    sortable: true,
  },
  { name: 'nominal', align: 'right', label: 'NOMINAL DIAJUKAN', field: 'nominal', sortable: true },
  {
    name: 'timeline',
    align: 'center',
    label: 'TIMELINE',
    field: 'tanggal_dibutuhkan',
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]

const fetchData = () => {
  loading.value = true
  const qPengajuan = query(
    collection(db, 'finance_pengajuan_pembayaran'),
    where('status', 'in', ['Approved', 'Cair']),
  )
  unsubData = onSnapshot(
    qPengajuan,
    (snap) => {
      let result = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      result.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      rows.value = result
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

const pendingCount = computed(() => rows.value.filter((r) => r.status === 'Approved').length)
const pendingAmount = computed(() =>
  rows.value.filter((r) => r.status === 'Approved').reduce((sum, r) => sum + (r.nominal || 0), 0),
)
const realizedAmount = computed(() =>
  rows.value.filter((r) => r.status === 'Cair').reduce((sum, r) => sum + (r.nominal || 0), 0),
)

const filteredRows = computed(() => {
  let res = rows.value.filter((r) => r.status === tabFilter.value)
  if (searchQuery.value) {
    const lower = searchQuery.value.toLowerCase()
    res = res.filter(
      (r) =>
        r.no_request?.toLowerCase().includes(lower) ||
        r.vendor_nama?.toLowerCase().includes(lower) ||
        r.tagihan_kode?.toLowerCase().includes(lower) ||
        r.tagihan_nomor_invoice?.toLowerCase().includes(lower),
    )
  }
  return res
})

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

const triggerRealisasi = async (row) => {
  selectedData.value = row
  realisasiForm.value = {
    tanggal: new Date().toISOString().substr(0, 10),
    nominal: row.nominal || 0,
    catatan: '',
    bukti_file: null,
  }
  showRealisasiDialog.value = true
}

const processRealisasi = async () => {
  if (!realisasiForm.value.bukti_file) {
    return $q.notify({
      type: 'warning',
      message: '⚠️ Harap unggah bukti dokumen/transfer terlebih dahulu!',
      icon: 'upload_file',
      color: 'orange-9',
      position: 'top-right',
      timeout: 3500,
      progress: true,
      classes: 'notif-premium',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
  }
  if (!realisasiForm.value.nominal || realisasiForm.value.nominal <= 0) {
    return $q.notify({
      type: 'warning',
      message: '⚠️ Nominal eksekusi tidak boleh kosong!',
      icon: 'money_off',
      color: 'orange-9',
      position: 'top-right',
      timeout: 3500,
      progress: true,
      classes: 'notif-premium',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
  }

  isProcessing.value = true
  $q.loading.show({ message: 'Mengunggah bukti transfer & Memproses pencairan...' })

  try {
    const file = realisasiForm.value.bukti_file
    const fRef = storageRef(storage, `finance/bukti_transfer/${Date.now()}_${file.name}`)
    await uploadBytes(fRef, file)
    const url = await getDownloadURL(fRef)

    const updateData = {
      status: 'Cair',
      bukti_transfer: url,
      realizedAt: serverTimestamp(),
      realizedBy: authStore.user?.nama || 'Finance Admin',
      tanggal_eksekusi: realisasiForm.value.tanggal,
      nominal_eksekusi: realisasiForm.value.nominal,
      catatan_realisasi: realisasiForm.value.catatan,
      realizer_read: true,
      creator_read: false,
      realized_approved_read: false,
    }

    await updateDoc(doc(db, 'finance_pengajuan_pembayaran', selectedData.value.id), updateData)

    let tagihanDocRef = null
    let tagihanData = null

    if (selectedData.value.tagihan_id) {
      try {
        const docRef = doc(db, 'finance_tagihan', selectedData.value.tagihan_id)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          tagihanDocRef = docRef
          tagihanData = snap.data()
        }
      } catch (e) {
        console.error('Error fetching tagihan by ID:', e)
      }
    }

    const idents = [
      selectedData.value.tagihan_nomor_invoice,
      selectedData.value.tagihan_kode,
      selectedData.value.tagihan_id,
    ].filter(Boolean)
    if (!tagihanDocRef && idents.length > 0) {
      for (const ident of idents) {
        try {
          const q = query(collection(db, 'finance_tagihan'), where('nomor_invoice', '==', ident))
          const snap = await getDocs(q)
          if (!snap.empty) {
            tagihanDocRef = doc(db, 'finance_tagihan', snap.docs[0].id)
            tagihanData = snap.docs[0].data()
            break
          }
        } catch (e) {
          console.error('Error finding tagihan by nomor_invoice:', e)
        }
      }

      if (!tagihanDocRef) {
        for (const ident of idents) {
          try {
            const q = query(collection(db, 'finance_tagihan'), where('kode_tagihan', '==', ident))
            const snap = await getDocs(q)
            if (!snap.empty) {
              tagihanDocRef = doc(db, 'finance_tagihan', snap.docs[0].id)
              tagihanData = snap.docs[0].data()
              break
            }
          } catch (e) {
            console.error('Error finding tagihan by kode_tagihan:', e)
          }
        }
      }
    }

    if (tagihanDocRef && tagihanData) {
      const currentTotalDibayar = Number(tagihanData.total_dibayar || 0)
      const grandTotal = Number(tagihanData.grand_total || 0)
      const newTotalDibayar = currentTotalDibayar + realisasiForm.value.nominal

      let newStatus = 'Lunas'
      if (newTotalDibayar >= grandTotal) {
        newStatus = 'Lunas'
      } else if (newTotalDibayar > 0) {
        newStatus = 'Dibayar Sebagian'
      } else {
        newStatus = 'Menunggu Pembayaran'
      }

      await updateDoc(tagihanDocRef, {
        status: newStatus,
        total_dibayar: newTotalDibayar,
        updatedAt: serverTimestamp(),
      })
    }

    if (selectedData.value) {
      selectedData.value.status = 'Cair'
      selectedData.value.bukti_transfer = url
      selectedData.value.tanggal_eksekusi = realisasiForm.value.tanggal
      selectedData.value.nominal_eksekusi = realisasiForm.value.nominal
      selectedData.value.catatan_realisasi = realisasiForm.value.catatan
      selectedData.value.realizer_read = true
    }

    $q.notify({
      message: '💸 Dana berhasil direalisasikan!',
      caption: `${selectedData.value?.no_request} — Rp ${realisasiForm.value.nominal.toLocaleString('id-ID')} telah dicairkan`,
      icon: 'task_alt',
      color: 'positive',
      position: 'top-right',
      timeout: 4000,
      progress: true,
      classes: 'notif-premium',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
    showRealisasiDialog.value = false
    viewMode.value = 'list'
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: '❌ Gagal memproses realisasi.',
      caption: 'Periksa koneksi dan coba lagi.',
      icon: 'error',
      position: 'top-right',
      timeout: 4000,
      progress: true,
      classes: 'notif-premium',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
  } finally {
    isProcessing.value = false
    $q.loading.hide()
  }
}

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
    case 'Approved':
      return { bg: 'orange-1', text: 'text-orange-9', icon: 'hourglass_empty' }
    case 'Cair':
      return { bg: 'blue-1', text: 'text-primary', icon: 'task_alt' }
    default:
      return { bg: 'grey-2', text: 'text-grey-8', icon: 'info' }
  }
}

const openLink = (url) => {
  if (!url) {
    $q.notify({
      type: 'warning',
      message: 'Tautan dokumen tidak tersedia.',
      icon: 'link_off',
      position: 'top-right',
      timeout: 2500,
      progress: true,
    })
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
    } catch (e) {
      console.error('Error parsing base64 URL:', e)
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

const exportTablePDF = () => {
  const e = document.getElementById('table-pdf-export')
  if (!e) return
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `Laporan_Realisasi_${tabFilter.value}_${Date.now()}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
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
    let csv = `NO REQUEST,REF TAGIHAN,VENDOR/PENERIMA,BANK,NO REKENING,ALOKASI PROYEK & BOQ,NOMINAL,TGL CAIR/TARGET,STATUS,CATATAN APPROVAL\n`
    filteredRows.value.forEach((r) => {
      csv += `"${r.no_request}","${r.tagihan_kode || r.tagihan_nomor_invoice || '-'}","${r.vendor_nama}","${r.rek_bank}","${r.rek_nomor}","${formatSpkBoqText(r).replace(/"/g, '""')}","${r.nominal}","${r.status === 'Cair' ? formatDateIndo(r.realizedAt?.seconds ? new Date(r.realizedAt.toDate()) : null) : formatDateIndo(r.tanggal_dibutuhkan)}","${r.status}","${(r.catatan_approval || '').replace(/"/g, '""').replace(/\n/g, ' ')}"\n`
    })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Laporan_Realisasi_${tabFilter.value}_${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
    $q.notify({
      message: '📊 Data berhasil diekspor ke Excel!',
      caption: `File CSV tersimpan di folder unduhan Anda`,
      icon: 'table_view',
      color: 'positive',
      position: 'top-right',
      timeout: 3500,
      progress: true,
      classes: 'notif-premium',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
  } catch (err) {
    console.error(err)
    $q.notify({
      type: 'negative',
      message: 'Gagal mengekspor data list',
      position: 'top-right',
      timeout: 3000,
      progress: true,
    })
  }
}

const exportDetailPDF = () => {
  const e = document.getElementById('pengajuan-detail-pdf')
  if (!e) return
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `Detail_Realisasi_${selectedData.value.no_request.replace(/\//g, '-')}.pdf`,
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

const exportDetailExcel = () => {
  try {
    let csv = `NO REQUEST,TIPE PENGAJUAN,REF TAGIHAN,VENDOR/PENERIMA,BANK,NO REKENING,ATAS NAMA,ALOKASI PROYEK & BOQ,TGL PENGAJUAN,TARGET CAIR,TGL REALISASI,NOMINAL,STATUS,KETERANGAN,CATATAN APPROVAL\n`
    const r = selectedData.value
    csv += `"${r.no_request}","${r.tipe_pengajuan}","${r.tagihan_kode || r.tagihan_nomor_invoice || '-'}","${r.vendor_nama}","${r.rek_bank}","${r.rek_nomor}","${r.rek_nama}","${formatSpkBoqText(r).replace(/"/g, '""')}","${formatDateIndo(r.tanggal_pengajuan)}","${formatDateIndo(r.tanggal_dibutuhkan)}","${formatDateIndo(r.realizedAt?.seconds ? new Date(r.realizedAt.toDate()) : null)}","${r.nominal}","${r.status}","${(r.keterangan || '').replace(/"/g, '""').replace(/\n/g, ' ')}","${(r.catatan_approval || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Detail_Realisasi_${r.no_request.replace(/\//g, '-')}.csv`
    link.click()
    URL.revokeObjectURL(url)
    $q.notify({
      message: '📊 Detail berhasil diekspor ke Excel!',
      caption: `${r.no_request} — file CSV siap diunduh`,
      icon: 'table_view',
      color: 'positive',
      position: 'top-right',
      timeout: 3500,
      progress: true,
      classes: 'notif-premium',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
  } catch (err) {
    console.error(err)
    $q.notify({
      type: 'negative',
      message: 'Gagal mengekspor data detail',
      position: 'top-right',
      timeout: 3000,
      progress: true,
    })
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
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.border-red-thin {
  border: 1px solid rgba(229, 57, 53, 0.15);
}
.border-green-thin {
  border: 1px solid rgba(76, 175, 80, 0.15);
}
.border-blue-thin {
  border: 1px solid rgba(25, 118, 210, 0.15);
}
.border-left-brand-primary {
  border-left: 3px solid #36ada3;
}
.border-dashed {
  border: 2px dashed #e0e0e0;
}

/* ─── KPI CARDS ──────────────────────────────────────────── */
.kpi-card {
  border: none !important;
}
.kpi-orange {
  background: linear-gradient(135deg, #fb8c00 0%, #e65100 100%) !important;
}
.kpi-blue-grey {
  background: linear-gradient(135deg, #546e7a 0%, #37474f 100%) !important;
}
.kpi-brand {
  background: linear-gradient(135deg, #36ada3 0%, #1e6e69 100%) !important;
}
.kpi-label {
  font-size: 10px;
  letter-spacing: 0.12em;
  opacity: 0.9;
}
.kpi-icon-wrap {
  background: rgba(255, 255, 255, 0.15) !important;
  border-radius: 12px !important;
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
  background-color: rgba(54, 173, 163, 0.03) !important;
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

/* ─── BADGE BARU ─────────────────────────────────────────── */
.animate-bounce {
  animation: bounce 1.5s infinite;
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* ─── ANIMATIONS ─────────────────────────────────────────── */
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

/* ─── SEARCH ─────────────────────────────────────────────── */
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}

/* ─── MISC ───────────────────────────────────────────────── */
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
.leading-relaxed {
  line-height: 1.6;
}

/* ─── DETAIL TABLE ───────────────────────────────────────── */
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

/* ─── GLOBAL NOTIFY PREMIUM ──────────────────────────────── */
:deep(.notif-premium) {
  border-radius: 14px !important;
  font-weight: 600 !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18) !important;
  font-size: 14px !important;
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
