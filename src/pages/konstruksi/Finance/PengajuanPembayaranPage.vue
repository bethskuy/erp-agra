<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <!-- =====================================================================================
         VIEW 1: LIST PENGAJUAN PEMBAYARAN
         ===================================================================================== -->
    <div v-if="viewMode === 'list'" class="animate-fade">
      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-xl no-print">
        <div class="col-12 col-md-7">
          <div class="row items-center no-wrap">
            <div>
              <div class="text-h4 text-weight-bolder text-teal-10 leading-tight">
                Pengajuan Pembayaran
                <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                  >Payment Request & Disbursement</span
                >
              </div>
              <div class="text-subtitle1 text-grey-7 q-mt-sm">
                Buat permohonan pencairan dana berdasarkan tagihan vendor yang telah diverifikasi
                atau kebutuhan operasional.
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-5 row items-center justify-end q-gutter-md q-mt-md q-mt-md-none">
          <!-- EXPORT DROPDOWN LIST -->
          <q-btn-dropdown
            v-if="canLihat"
            unelevated
            color="white"
            text-color="teal-10"
            icon="ios_share"
            label="Export Data"
            class="rounded-12 text-weight-bold shadow-2"
          >
            <q-list class="bg-white rounded-borders q-py-sm" style="min-width: 200px">
              <q-item clickable v-close-popup @click="exportTablePDF" class="hover-blue-btn">
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
              <q-item clickable v-close-popup @click="exportTableExcel" class="hover-blue-btn">
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

          <!-- TOMBOL BUAT BARU: hanya tampil jika punya izin 'buat' -->
          <q-btn
            v-if="canBuat"
            color="teal-10"
            icon="post_add"
            label="Buat Pengajuan Baru"
            unelevated
            rounded
            no-caps
            class="q-px-lg q-py-sm shadow-premium btn-hover text-weight-bold"
            @click="openAddDialog"
          />
        </div>
      </div>

      <!-- AKSES DITOLAK: tampil jika tidak punya izin lihat sama sekali -->
      <div v-if="!canLihat" class="full-width row flex-center q-pa-xl text-grey-5">
        <div class="text-center">
          <q-icon name="lock" size="64px" color="grey-4" class="q-mb-md" />
          <div class="text-h6 text-grey-6">Anda tidak memiliki akses ke halaman ini.</div>
          <div class="text-caption text-grey-5 q-mt-xs">
            Hubungi administrator untuk meminta akses.
          </div>
        </div>
      </div>

      <template v-if="canLihat">
        <!-- SUMMARY CARDS / KPI -->
        <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print items-stretch">
          <!-- Card 1: TOTAL PENGAJUAN -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-card
              flat
              class="rounded-20 card-teal-gradient text-white transition-all hover-shadow h-full flex column justify-center"
            >
              <q-card-section class="row items-center no-wrap q-pa-md">
                <div class="col">
                  <div
                    class="text-overline leading-none text-weight-bold tracking-widest q-mb-xs"
                    style="color: rgba(255, 255, 255, 0.85)"
                  >
                    TOTAL PENGAJUAN
                  </div>
                  <div class="text-h4 text-weight-bolder text-white">
                    {{ rows.length }}
                  </div>
                </div>
                <div
                  class="bg-white q-pa-md rounded-borders shadow-sm"
                  style="min-width: 56px; text-align: center"
                >
                  <q-icon name="request_page" color="teal-8" size="28px" />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Card 2: MENUNGGU APPROVAL -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-card
              flat
              class="rounded-20 card-orange-gradient text-white transition-all hover-shadow h-full flex column justify-center"
            >
              <q-card-section class="row items-center no-wrap q-pa-md">
                <div class="col">
                  <div
                    class="text-overline leading-none text-weight-bold tracking-widest q-mb-xs"
                    style="color: rgba(255, 255, 255, 0.85)"
                  >
                    MENUNGGU APPROVAL
                  </div>
                  <div class="text-h4 text-weight-bolder text-white">
                    {{ countByStatus('Pending') }}
                  </div>
                </div>
                <div
                  class="bg-white q-pa-md rounded-borders shadow-sm"
                  style="min-width: 56px; text-align: center"
                >
                  <q-icon name="hourglass_empty" color="orange-8" size="28px" />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Card 3: SIAP CAIR (APPROVED) -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-card
              flat
              class="rounded-20 card-green-gradient text-white transition-all hover-shadow h-full flex column justify-center"
            >
              <q-card-section class="row items-center no-wrap q-pa-md">
                <div class="col">
                  <div
                    class="text-overline leading-none text-weight-bold tracking-widest q-mb-xs"
                    style="color: rgba(255, 255, 255, 0.85)"
                  >
                    SIAP CAIR (APPROVED)
                  </div>
                  <div class="text-h4 text-weight-bolder text-white">
                    {{ countByStatus('Approved') }}
                  </div>
                </div>
                <div
                  class="bg-white q-pa-md rounded-borders shadow-sm"
                  style="min-width: 56px; text-align: center"
                >
                  <q-icon name="verified" color="green-8" size="28px" />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Card 4: DANA DIAJUKAN -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-card
              flat
              class="rounded-20 card-blue-gradient text-white transition-all hover-shadow h-full flex column justify-center"
            >
              <q-card-section class="row items-center no-wrap q-pa-md">
                <div class="col">
                  <div
                    class="text-overline leading-none text-weight-bold tracking-widest q-mb-xs"
                    style="color: rgba(255, 255, 255, 0.85)"
                  >
                    DANA DIAJUKAN
                  </div>
                  <div class="text-h5 text-weight-bolder text-white">
                    Rp {{ formatCompact(totalDanaPending) }}
                  </div>
                </div>
                <div
                  class="bg-white q-pa-md rounded-borders shadow-sm"
                  style="min-width: 56px; text-align: center"
                >
                  <q-icon name="account_balance" color="blue-8" size="28px" />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- SEARCH & FILTER AREA -->
        <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print">
          <q-card-section class="q-py-md">
            <div class="row items-center q-col-gutter-md">
              <div class="col-12 col-md-5">
                <q-input
                  v-model="searchQuery"
                  outlined
                  dense
                  rounded
                  placeholder="Cari No. Request atau Supplier..."
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
                <q-tabs
                  v-model="statusFilter"
                  dense
                  class="text-grey-7 bg-grey-1 rounded-12 p-1"
                  active-color="teal-10"
                  indicator-color="transparent"
                  active-bg-color="white"
                  align="justify"
                  narrow-indicator
                >
                  <q-tab name="ALL" label="SEMUA" class="text-weight-bold rounded-12 q-px-md" />
                  <q-tab
                    name="Pending"
                    label="PENDING"
                    class="text-weight-bold rounded-12 q-px-md"
                  />
                  <q-tab
                    name="Approved"
                    label="APPROVED"
                    class="text-weight-bold rounded-12 q-px-md"
                  />
                </q-tabs>
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
              <q-tr :props="props" class="bg-teal-10 text-white">
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
                    <span class="text-weight-bold text-teal-10">{{ props.row.no_request }}</span>
                    <q-badge
                      v-if="
                        (props.row.status === 'Cair' ||
                          props.row.status === 'Approved' ||
                          props.row.status === 'Rejected') &&
                        props.row.creator_read === false
                      "
                      color="positive"
                      class="animate-bounce q-px-xs"
                      style="font-size: 9px"
                      >BARU</q-badge
                    >
                  </div>
                  <div class="text-caption text-grey-6 uppercase font-10 mt-xs">
                    <q-icon
                      :name="props.row.tipe_pengajuan === 'Manual' ? 'edit' : 'receipt'"
                      size="xs"
                      class="q-mr-xs"
                    />
                    {{ props.row.tipe_pengajuan }}
                  </div>
                </q-td>

                <q-td key="vendor">
                  <div class="text-weight-bold text-blue-grey-9 uppercase font-11">
                    {{ props.row.vendor_nama || '-' }}
                  </div>
                  <div class="text-caption text-grey-6 font-10">
                    Bank: {{ props.row.rek_bank }} - {{ props.row.rek_nomor }}
                  </div>
                </q-td>

                <q-td key="nominal" class="text-right">
                  <div class="text-weight-bolder text-teal-10 text-subtitle2">
                    Rp {{ (props.row.nominal || 0).toLocaleString('id-ID') }}
                  </div>
                </q-td>

                <q-td key="timeline" class="text-center">
                  <div class="text-weight-bold text-grey-8 font-11">
                    {{ formatDateIndo(props.row.tanggal_pengajuan) }}
                  </div>
                  <div class="text-caption text-negative font-10">
                    Target Cair: {{ formatDateIndo(props.row.tanggal_dibutuhkan) }}
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
                    <!-- TOMBOL DETAIL: selalu tampil jika canLihat -->
                    <q-btn
                      flat
                      round
                      color="teal-10"
                      icon="visibility"
                      size="sm"
                      @click="openDetail(props.row)"
                    >
                      <q-tooltip>Detail</q-tooltip>
                    </q-btn>

                    <!-- TOMBOL EDIT: hanya jika punya izin 'ubah' dan status Pending -->
                    <q-btn
                      v-if="canUbah && props.row.status === 'Pending'"
                      flat
                      round
                      color="blue-8"
                      icon="edit"
                      size="sm"
                      @click="openEditDialog(props.row)"
                    >
                      <q-tooltip>Edit</q-tooltip>
                    </q-btn>

                    <!-- TOMBOL HAPUS: hanya jika punya izin 'hapus' -->
                    <q-btn
                      v-if="canHapus"
                      flat
                      round
                      color="negative"
                      icon="delete_outline"
                      size="sm"
                      @click="confirmHapus(props.row)"
                    >
                      <q-tooltip>Hapus</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-xl text-grey-5">
                <q-icon name="request_quote" size="64px" class="q-mb-md opacity-50" />
                <div class="text-h6 full-width text-center">Data pengajuan belum tersedia.</div>
              </div>
            </template>
          </q-table>
        </q-card>
      </template>
    </div>

    <!-- =====================================================================================
         VIEW 2: FORM ENTRY PENGAJUAN (VIEW SWITCHER)
         ===================================================================================== -->
    <div v-else-if="viewMode === 'form'" class="animate-fade">
      <div class="row items-center justify-between q-mb-xl no-print">
        <div class="col-12 col-md-8">
          <div class="row items-center no-wrap">
            <q-btn
              flat
              round
              color="teal-10"
              icon="arrow_back"
              @click="viewMode = 'list'"
              class="q-mr-md bg-white shadow-1"
            />
            <div>
              <div class="text-h4 text-weight-bolder text-teal-10 leading-tight uppercase">
                {{ isEditMode ? 'Edit Pengajuan' : 'Buat Pengajuan Baru' }}
              </div>
              <div class="text-subtitle1 text-grey-7 q-mt-sm">
                Isi formulir pencairan dana untuk pembayaran tagihan vendor atau kebutuhan lain.
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-auto q-mt-md q-mt-md-none text-right">
          <q-btn
            unelevated
            color="teal-10"
            icon="send"
            label="SUBMIT PENGAJUAN"
            @click="simpanPengajuan"
            :loading="submitting"
            rounded
            class="q-px-xl text-weight-bold shadow-premium"
          />
        </div>
      </div>

      <div class="row justify-center">
        <div class="col-12 col-xl-10">
          <div class="row q-col-gutter-lg">
            <!-- KOLOM KIRI (METODE & DETAIL PENERIMA) -->
            <div class="col-12 col-md-6">
              <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1">
                <q-card-section
                  class="bg-teal-1 q-py-sm text-teal-10 text-weight-bold flex items-center border-bottom"
                >
                  <q-icon name="settings_suggest" class="q-mr-xs" size="sm" /> 1. METODE & REFERENSI
                </q-card-section>
                <q-card-section class="q-pa-lg q-gutter-y-md">
                  <div>
                    <div class="label-req q-mb-xs">Metode Pengajuan Data</div>
                    <q-btn-toggle
                      v-model="form.tipe_pengajuan"
                      spread
                      class="custom-toggle"
                      no-caps
                      unelevated
                      toggle-color="teal-10"
                      color="white"
                      text-color="grey-7"
                      :options="tipePengajuanOptions"
                      @update:model-value="onTipeChange"
                    />
                  </div>

                  <div v-if="form.tipe_pengajuan === 'Tagihan Supplier'">
                    <div class="label-req q-mb-xs text-primary">
                      Pilih Tagihan Supplier (Outstanding) *
                    </div>
                    <q-select
                      outlined
                      dense
                      v-model="form.tagihan_obj"
                      :options="optTagihanFiltered"
                      option-label="nomor_invoice"
                      placeholder="Cari Tagihan..."
                      bg-color="blue-50"
                      clearable
                      @update:model-value="onTagihanSelect"
                      use-input
                      @filter="filterTagihan"
                    >
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label class="text-weight-bold">{{
                              scope.opt.nomor_invoice
                            }}</q-item-label>
                            <q-item-label caption class="text-negative text-bold"
                              >Sisa: Rp
                              {{
                                (scope.opt.sisa_tagihan || 0).toLocaleString('id-ID')
                              }}</q-item-label
                            >
                            <q-item-label caption
                              >Vendor: {{ scope.opt.supplier_nama }}</q-item-label
                            >
                          </q-item-section>
                        </q-item>
                      </template>
                      <template v-slot:no-option>
                        <q-item
                          ><q-item-section class="text-grey italic"
                            >Tidak ada tagihan outstanding</q-item-section
                          ></q-item
                        >
                      </template>
                    </q-select>
                  </div>

                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <div class="label-req q-mb-xs">No. Request (Auto)</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.no_request"
                        readonly
                        bg-color="grey-2"
                        class="text-weight-bold text-teal-10"
                      />
                    </div>
                    <div class="col-12 col-md-6" v-if="form.tipe_pengajuan === 'Tagihan Supplier'">
                      <div class="label-req q-mb-xs">No. Referensi (Tagihan)</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.tagihan_nomor_invoice"
                        readonly
                        bg-color="grey-2"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1">
                <q-card-section
                  class="bg-teal-1 q-py-sm text-teal-10 text-weight-bold flex items-center border-bottom"
                >
                  <q-icon name="account_balance" class="q-mr-xs" size="sm" /> 2. REKENING PENERIMA
                </q-card-section>
                <q-card-section class="q-pa-lg q-gutter-y-md">
                  <div>
                    <div class="label-req q-mb-xs">Nama Penerima / Vendor *</div>
                    <q-input
                      outlined
                      dense
                      v-model="form.vendor_nama"
                      bg-color="white"
                      class="text-weight-bold uppercase"
                      :readonly="form.tipe_pengajuan === 'Tagihan Supplier'"
                    />
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-4">
                      <div class="label-req q-mb-xs">Bank *</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.rek_bank"
                        bg-color="white"
                        placeholder="Contoh: BCA"
                        class="uppercase text-weight-bold"
                      />
                    </div>
                    <div class="col-12 col-md-8">
                      <div class="label-req q-mb-xs">Nomor Rekening *</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.rek_nomor"
                        bg-color="white"
                        placeholder="12345..."
                        class="text-weight-bold text-primary"
                      />
                    </div>
                    <div class="col-12">
                      <div class="label-req q-mb-xs">Atas Nama Rekening *</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.rek_nama"
                        bg-color="white"
                        placeholder="Sesuai buku tabungan"
                        class="uppercase"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- KOLOM KANAN (NOMINAL & KETERANGAN) -->
            <div class="col-12 col-md-6">
              <q-card flat bordered class="rounded-20 bg-white shadow-1 overflow-hidden q-mb-lg">
                <q-card-section
                  class="bg-teal-10 q-py-sm text-white text-weight-bold flex items-center border-bottom"
                >
                  <q-icon name="payments" class="q-mr-xs" size="sm" /> 3. NOMINAL & JADWAL
                </q-card-section>

                <q-card-section class="q-pa-lg q-gutter-y-md">
                  <div>
                    <div class="label-req q-mb-xs">Nominal Pengajuan (Rp) *</div>
                    <q-input
                      outlined
                      dense
                      type="number"
                      v-model.number="form.nominal"
                      bg-color="white"
                      class="text-weight-bold text-h5 text-teal-10"
                      prefix="Rp"
                    />
                    <div
                      class="text-caption text-negative q-mt-xs font-bold"
                      v-if="form.tipe_pengajuan === 'Tagihan Supplier' && form.tagihan_obj"
                    >
                      Sisa Hutang Max: Rp
                      {{ (form.tagihan_obj.sisa_tagihan || 0).toLocaleString('id-ID') }}
                    </div>
                  </div>

                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <div class="label-req q-mb-xs">Tgl Pengajuan *</div>
                      <q-input
                        outlined
                        dense
                        type="date"
                        v-model="form.tanggal_pengajuan"
                        bg-color="white"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="label-req q-mb-xs text-negative">
                        Tgl Dibutuhkan (Target Cair) *
                      </div>
                      <q-input
                        outlined
                        dense
                        type="date"
                        v-model="form.tanggal_dibutuhkan"
                        bg-color="white"
                      />
                    </div>
                  </div>

                  <div>
                    <div class="label-req q-mb-xs">Tujuan Pembayaran / Keterangan *</div>
                    <q-input
                      outlined
                      dense
                      type="textarea"
                      rows="4"
                      v-model="form.keterangan"
                      bg-color="white"
                      placeholder="Deskripsikan untuk apa dana ini..."
                    />
                  </div>
                </q-card-section>
              </q-card>

              <!-- LAMPIRAN -->
              <q-card flat bordered class="rounded-20 bg-white shadow-1">
                <q-card-section
                  class="bg-teal-1 q-py-sm text-teal-10 text-weight-bold flex items-center border-bottom"
                >
                  <q-icon name="attach_file" class="q-mr-xs" size="sm" /> 4. DOKUMEN LAMPIRAN
                </q-card-section>
                <q-card-section class="q-pa-lg">
                  <div class="row items-center justify-between q-mb-md">
                    <div class="text-caption text-grey-7">
                      Upload bukti pendukung (Kwitansi, Memo, dll).
                    </div>
                    <q-btn
                      round
                      unelevated
                      color="teal-10"
                      icon="add"
                      size="sm"
                      @click="addDocRow"
                    />
                  </div>
                  <div class="bg-teal-50 q-pa-sm rounded-12 border-dashed">
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
                            placeholder="ex: Bukti Transfer"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <q-file outlined dense v-model="item.fileObj" label="Pilih File">
                            <template v-slot:prepend
                              ><q-icon name="attach_file" size="xs"
                            /></template>
                            <template v-slot:append v-if="item.url || item.base64"
                              ><q-icon name="check_circle" color="positive" size="xs"
                            /></template>
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
                      Belum ada dokumen lampiran.
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>
      <div class="q-py-xl"></div>
    </div>

    <!-- =====================================================================================
         VIEW 3: DETAIL PENGAJUAN (READ ONLY)
         ===================================================================================== -->
    <div v-else-if="viewMode === 'detail' && selectedData" class="animate-fade q-pb-xl">
      <!-- Top Action Bar -->
      <div class="row items-center justify-between q-mb-xl no-print">
        <div class="row items-center no-wrap">
          <q-btn
            flat
            round
            color="teal-10"
            icon="arrow_back"
            @click="viewMode = 'list'"
            class="q-mr-md bg-white shadow-1"
          />
          <div>
            <div class="text-overline text-grey-6 text-bold tracking-widest q-mb-xs leading-none">
              DETAIL PENGAJUAN PEMBAYARAN
            </div>
            <div class="text-h5 text-weight-bolder text-teal-10 leading-tight uppercase">
              {{ selectedData.no_request }}
            </div>
          </div>
        </div>
        <div class="row items-center q-gutter-md">
          <q-btn-dropdown
            unelevated
            color="white"
            text-color="teal-10"
            icon="ios_share"
            label="Export Dokumen"
            class="rounded-12 text-weight-bold shadow-2"
          >
            <q-list class="bg-white rounded-borders q-py-sm" style="min-width: 200px">
              <q-item clickable v-close-popup @click="printDetail" class="hover-blue-btn">
                <q-item-section avatar
                  ><q-avatar color="blue-1" text-color="blue-10" icon="print" size="sm"
                /></q-item-section>
                <q-item-section
                  ><q-item-label class="text-weight-bold"
                    >Cetak (Print)</q-item-label
                  ></q-item-section
                >
              </q-item>
              <q-separator class="q-my-sm" />
              <q-item clickable v-close-popup @click="exportDetailPDF" class="hover-blue-btn">
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
              <q-item clickable v-close-popup @click="exportDetailExcel" class="hover-blue-btn">
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
            <div class="bg-teal-10 text-white q-pa-md q-px-lg flex justify-between items-center">
              <div>
                <div class="text-overline text-teal-2 text-bold tracking-widest uppercase q-mb-xs">
                  NOMINAL PENGAJUAN
                </div>
                <div class="text-h3 text-weight-black leading-none">
                  Rp {{ (selectedData.nominal || 0).toLocaleString('id-ID') }}
                </div>
              </div>
              <div class="text-right">
                <q-chip
                  color="white"
                  :text-color="getStatusColor(selectedData.status).text.replace('text-', '')"
                  class="text-weight-bolder font-11 uppercase shadow-sm q-px-md q-py-sm"
                  size="14px"
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

            <!-- DETAIL INFO -->
            <q-card-section class="q-pa-lg bg-white">
              <div class="row q-col-gutter-lg q-mb-md">
                <!-- Informasi Umum -->
                <div class="col-12 col-md-6">
                  <div
                    class="text-weight-bold text-teal-10 q-mb-sm uppercase tracking-widest font-11 border-bottom-subtle q-pb-xs"
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
                      <td class="text-primary">
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

                <!-- Rekening Tujuan -->
                <div class="col-12 col-md-6">
                  <div
                    class="text-weight-bold text-teal-10 q-mb-sm uppercase tracking-widest font-11 border-bottom-subtle q-pb-xs"
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
                      <td class="text-h6 text-teal-10">{{ selectedData.rek_nomor }}</td>
                    </tr>
                    <tr>
                      <td>Atas Nama</td>
                      <td class="uppercase">{{ selectedData.rek_nama }}</td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- Keterangan -->
              <div class="row q-mt-sm">
                <div class="col-12">
                  <div
                    class="text-weight-bold text-teal-10 q-mb-sm uppercase tracking-widest font-11 border-bottom-subtle q-pb-xs"
                  >
                    KETERANGAN / TUJUAN DANA
                  </div>
                  <div
                    class="bg-grey-1 q-pa-sm rounded-12 text-grey-9 leading-relaxed"
                    style="font-size: 12px"
                  >
                    {{ selectedData.keterangan || '-' }}
                  </div>
                </div>
              </div>

              <!-- Alasan Tolak / Catatan Approval -->
              <div
                class="row q-mt-sm"
                v-if="
                  selectedData.status === 'Rejected' ||
                  selectedData.status === 'Approved' ||
                  selectedData.status === 'Cair'
                "
              >
                <div class="col-12">
                  <div
                    v-if="selectedData.status === 'Rejected'"
                    class="bg-red-1 text-red-9 border-red-thin q-pa-sm rounded-12 text-weight-bold font-12"
                  >
                    <q-icon name="warning" size="sm" class="q-mr-sm" /> Alasan Penolakan:
                    {{ selectedData.alasan_reject || '-' }}
                  </div>
                  <div
                    v-if="selectedData.status === 'Approved' || selectedData.status === 'Cair'"
                    class="bg-green-1 text-green-9 border-green-thin q-pa-sm rounded-12 text-weight-bold font-12"
                  >
                    <q-icon name="check_circle" size="sm" class="q-mr-sm" /> Catatan Approval:
                    {{ selectedData.catatan_approval || 'Disetujui tanpa catatan.' }}
                  </div>
                </div>
              </div>

              <!-- BUKTI TRANSFER -->
              <div
                class="row q-mt-md no-print"
                data-html2canvas-ignore="true"
                v-if="
                  selectedData.status === 'Cair' &&
                  (selectedData.bukti_transfer || selectedData.nominal_eksekusi)
                "
              >
                <div class="col-12">
                  <div
                    class="text-weight-bold text-teal-10 q-mb-sm uppercase tracking-widest font-11 border-bottom-subtle q-pb-xs"
                  >
                    BUKTI TRANSFER / REALISASI
                  </div>
                  <div
                    class="bg-blue-50 text-blue-9 border-blue-thin q-pa-sm rounded-12 text-weight-bold q-mb-sm font-12"
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
                    dense
                    separator
                    class="rounded-12 border-subtle"
                    v-if="selectedData.bukti_transfer"
                  >
                    <q-item
                      clickable
                      v-ripple
                      @click="openLink(selectedData.bukti_transfer)"
                      class="q-py-xs hover-bg"
                    >
                      <q-item-section avatar>
                        <q-avatar
                          color="teal-1"
                          text-color="teal-10"
                          icon="receipt_long"
                          size="sm"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold text-subtitle2"
                          >Bukti Transfer (Realisasi)</q-item-label
                        >
                        <q-item-label caption style="font-size: 10px"
                          >Klik untuk mengunduh / melihat file bukti pembayaran</q-item-label
                        >
                      </q-item-section>
                      <q-item-section side>
                        <q-icon name="open_in_new" color="primary" size="xs" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>

              <!-- Dokumen Lampiran -->
              <div
                class="row q-mt-md no-print"
                data-html2canvas-ignore="true"
                v-if="selectedData.lampiran && selectedData.lampiran.length > 0"
              >
                <div class="col-12">
                  <div
                    class="text-weight-bold text-teal-10 q-mb-sm uppercase tracking-widest font-11 border-bottom-subtle q-pb-xs"
                  >
                    DOKUMEN LAMPIRAN PENGAJUAN
                  </div>
                  <q-list dense separator class="rounded-12 border-subtle">
                    <q-item
                      v-for="(doc, dIdx) in selectedData.lampiran"
                      :key="dIdx"
                      clickable
                      v-ripple
                      @click="openLink(doc.url || doc.base64)"
                      class="q-py-xs hover-bg"
                    >
                      <q-item-section avatar>
                        <q-avatar
                          color="teal-1"
                          text-color="teal-10"
                          icon="description"
                          size="sm"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold text-subtitle2">{{
                          doc.label || 'Dokumen ' + (dIdx + 1)
                        }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-icon name="open_in_new" color="primary" size="xs" />
                      </q-item-section>
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
            border-bottom: 3px solid #00796b;
            padding-bottom: 15px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
          "
        >
          <div
            style="
              background-color: #00796b;
              color: white;
              border-radius: 8px;
              padding: 12px;
              margin-right: 15px;
            "
          >
            <q-icon name="request_page" size="32px" />
          </div>
          <div>
            <div
              style="
                font-size: 24px;
                font-weight: 900;
                color: #00796b;
                text-transform: uppercase;
                letter-spacing: 1px;
              "
            >
              Laporan Pengajuan Pembayaran
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
              <td style="text-align: left">
                <div style="font-weight: bold; color: #00695c">{{ row.no_request }}</div>
                <div style="font-size: 9px; color: #666; margin-top: 2px">
                  Ref: {{ row.tagihan_kode || row.tagihan_nomor_invoice || '-' }}
                </div>
              </td>
              <td style="text-align: left">
                <div style="font-weight: bold; text-transform: uppercase">
                  {{ row.vendor_nama }}
                </div>
                <div style="font-size: 9px; color: #666; margin-top: 2px">
                  {{ row.rek_bank }} - {{ row.rek_nomor }}
                </div>
              </td>
              <td style="text-align: right; font-weight: bold">
                {{ (row.nominal || 0).toLocaleString('id-ID') }}
              </td>
              <td style="text-align: left">
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
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db, storage } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  // eslint-disable-next-line no-unused-vars
  getDocs,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const authStore = useAuthStore()

// ============================================================================
// PERMISSION HELPERS
// ============================================================================
const MODULE_ID = 'konstruksi'

const getPembayaranMenuPerm = () => {
  const user = authStore.user

  if (user && ['Super Admin', 'Direktur', 'Finance'].includes(user.role)) {
    return { lihat: true, buat: true, ubah: true, hapus: true, approve: true }
  }

  const detail = userData.value?.permissions_detail
  if (!detail) return null

  const modul = detail.find((m) => m.id === MODULE_ID)
  if (!modul || !modul.isActive) return null

  const menu = modul.menus.find(
    (m) =>
      m.id &&
      (m.id.toLowerCase().includes('pembayaran') || m.id.toLowerCase().includes('pengajuan')),
  )
  return menu || null
}

const canLihat = computed(() => {
  const perm = getPembayaranMenuPerm()
  return perm ? perm.lihat === true : false
})
const canBuat = computed(() => {
  const perm = getPembayaranMenuPerm()
  return perm ? perm.buat === true : false
})
const canUbah = computed(() => {
  const perm = getPembayaranMenuPerm()
  return perm ? perm.ubah === true : false
})
const canHapus = computed(() => {
  const perm = getPembayaranMenuPerm()
  return perm ? perm.hapus === true : false
})

// ============================================================================
// STATE
// ============================================================================
const viewMode = ref('list')
const loading = ref(true)
const submitting = ref(false)

const userData = ref(null)
let unsubUser = null

const rows = ref([])
const optTagihan = ref([])
const optTagihanFiltered = ref([])
const searchQuery = ref('')
const statusFilter = ref('ALL')
const isEditMode = ref(false)
const selectedData = ref(null)

let unsubData = null
let unsubTagihan = null

const formDefault = {
  id: null,
  no_request: '',
  tipe_pengajuan: 'Manual',
  tagihan_obj: null,
  tagihan_id: null,
  tagihan_nomor_invoice: '',
  vendor_nama: '',
  rek_bank: '',
  rek_nomor: '',
  rek_nama: '',
  nominal: 0,
  tanggal_pengajuan: new Date().toISOString().substr(0, 10),
  tanggal_dibutuhkan: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
  keterangan: '',
  status: 'Pending',
  lampiran: [],
}
const form = ref({ ...formDefault })

const hasAccessTagihanSupplier = computed(() => {
  const user = authStore.user
  if (!user) return false
  if (['Super Admin', 'Direktur', 'Finance'].includes(user.role)) return true

  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === MODULE_ID)
  if (!modulePerm || !modulePerm.isActive) return false

  const menu = modulePerm.menus.find(
    (m) => m.id && (m.id.includes('tagihan-supplier') || m.id.includes('tagihan_supplier')),
  )
  return menu ? menu.lihat || menu.buat || menu.edit || menu.approve : false
})

const tipePengajuanOptions = computed(() => {
  const options = []
  if (hasAccessTagihanSupplier.value) {
    options.push({ label: 'Tarik Tagihan Supplier (Auto)', value: 'Tagihan Supplier' })
  }
  options.push({ label: 'Input Manual', value: 'Manual' })
  return options
})

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
  {
    name: 'nominal',
    align: 'right',
    label: 'NOMINAL DIAJUKAN',
    field: 'nominal',
    sortable: true,
  },
  {
    name: 'timeline',
    align: 'center',
    label: 'TGL PENGAJUAN',
    field: 'tanggal_pengajuan',
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]

const generateNoRequest = () => {
  const count = rows.value.length + 1
  const padded = count.toString().padStart(3, '0')
  const year = new Date().getFullYear()
  const month = ('0' + (new Date().getMonth() + 1)).slice(-2)
  return `REQ/${year}${month}/${padded}`
}

const fetchData = async () => {
  loading.value = true
  const user = authStore.user

  const qPengajuan = query(
    collection(db, 'finance_pengajuan_pembayaran'),
    where('pembuat_email', '==', user?.email || 'anonymous'),
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

  const qTagihan = query(collection(db, 'finance_tagihan'))
  unsubTagihan = onSnapshot(qTagihan, (snap) => {
    optTagihan.value = snap.docs
      .map((d) => {
        const t = d.data()
        const grand = Number(t.grand_total) || 0
        const dibayar = Number(t.total_dibayar) || 0
        return { id: d.id, ...t, sisa_tagihan: grand - dibayar }
      })
      .filter((t) => t.sisa_tagihan > 0) // Hanya tagihan yang masih punya sisa hutang
    optTagihanFiltered.value = [...optTagihan.value]
  })
}

const filteredRows = computed(() => {
  let res = rows.value
  if (statusFilter.value !== 'ALL') {
    res = res.filter((r) => r.status === statusFilter.value)
  }
  if (searchQuery.value) {
    const lower = searchQuery.value.toLowerCase()
    res = res.filter(
      (r) =>
        r.no_request?.toLowerCase().includes(lower) ||
        r.vendor_nama?.toLowerCase().includes(lower) ||
        r.tagihan_nomor_invoice?.toLowerCase().includes(lower),
    )
  }
  return res
})

const countByStatus = (status) => rows.value.filter((r) => r.status === status).length
const totalDanaPending = computed(() =>
  rows.value.filter((r) => r.status === 'Pending').reduce((sum, r) => sum + (r.nominal || 0), 0),
)

const onTipeChange = (val) => {
  if (val === 'Manual') {
    form.value.tagihan_obj = null
    form.value.tagihan_id = null
    form.value.tagihan_nomor_invoice = ''
    form.value.vendor_nama = ''
    form.value.nominal = 0
    form.value.keterangan = ''
  }
}

const onTagihanSelect = (val) => {
  if (val) {
    form.value.tagihan_id = val.id
    form.value.tagihan_nomor_invoice = val.nomor_invoice
    form.value.vendor_nama = val.supplier_nama || ''
    form.value.nominal = val.sisa_tagihan || 0
    form.value.keterangan = `Pembayaran untuk Tagihan Supplier: ${val.nomor_invoice}. Sisa hutang: Rp ${val.sisa_tagihan.toLocaleString('id-ID')}`
  } else {
    onTipeChange('Manual')
  }
}

const filterTagihan = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    optTagihanFiltered.value = optTagihan.value.filter(
      (v) =>
        v.nomor_invoice?.toLowerCase().includes(needle) ||
        v.supplier_nama?.toLowerCase().includes(needle),
    )
  })
}

const openAddDialog = () => {
  if (!canBuat.value) {
    $q.notify({
      type: 'negative',
      position: 'top',
      icon: 'lock',
      message: 'Anda tidak memiliki izin membuat pengajuan.',
      caption: 'Hubungi administrator untuk mendapatkan akses.',
      classes: 'notify-styled',
      timeout: 3000,
    })
    return
  }
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  form.value.no_request = generateNoRequest()
  form.value.tipe_pengajuan = hasAccessTagihanSupplier.value ? 'Tagihan Supplier' : 'Manual'
  viewMode.value = 'form'
}

const openEditDialog = (row) => {
  if (!canUbah.value) {
    $q.notify({
      type: 'negative',
      position: 'top',
      icon: 'lock',
      message: 'Anda tidak memiliki izin mengubah pengajuan.',
      caption: 'Hubungi administrator untuk mendapatkan akses.',
      timeout: 3000,
    })
    return
  }
  isEditMode.value = true
  form.value = { ...JSON.parse(JSON.stringify(row)) }
  if (row.tipe_pengajuan === 'Tagihan Supplier' && row.tagihan_id) {
    form.value.tagihan_obj = optTagihan.value.find((t) => t.id === row.tagihan_id) || {
      nomor_invoice: row.tagihan_nomor_invoice,
    }
  }
  viewMode.value = 'form'
}

const openDetail = async (row) => {
  selectedData.value = row
  viewMode.value = 'detail'
  window.scrollTo(0, 0)

  if (
    (row.status === 'Cair' || row.status === 'Approved' || row.status === 'Rejected') &&
    row.creator_read === false
  ) {
    try {
      await updateDoc(doc(db, 'finance_pengajuan_pembayaran', row.id), {
        creator_read: true,
      })
      row.creator_read = true
      const idx = rows.value.findIndex((item) => item.id === row.id)
      if (idx !== -1) {
        rows.value[idx].creator_read = true
      }
    } catch (e) {
      console.error('Gagal mengupdate status baca pengajuan:', e)
    }
  }
}

const addDocRow = () => form.value.lampiran.push({ label: '', url: '', base64: '', fileObj: null })
const removeDocRow = (i) => form.value.lampiran.splice(i, 1)

const processHybridUpload = async (file, pathName) => {
  if (!file) return null
  if (file.size <= 512000) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
    })
  } else {
    const sRef = storageRef(storage, `finance/pengajuan/${Date.now()}_${pathName}`)
    const snap = await uploadBytes(sRef, file)
    return await getDownloadURL(snap.ref)
  }
}

const simpanPengajuan = async () => {
  if (!canBuat.value && !canUbah.value) {
    $q.notify({
      type: 'negative',
      position: 'top',
      icon: 'lock',
      message: 'Anda tidak memiliki izin menyimpan pengajuan.',
      timeout: 3000,
    })
    return
  }

  if (
    !form.value.vendor_nama ||
    !form.value.rek_bank ||
    !form.value.rek_nomor ||
    !form.value.nominal
  ) {
    $q.notify({
      type: 'warning',
      position: 'top',
      icon: 'edit_note',
      message: 'Data belum lengkap!',
      caption: 'Lengkapi Nama Vendor, Bank, No Rekening, dan Nominal.',
      timeout: 3500,
    })
    return
  }
  if (
    form.value.tipe_pengajuan === 'Tagihan Supplier' &&
    (!form.value.tagihan_id || !form.value.tagihan_nomor_invoice)
  ) {
    $q.notify({
      type: 'warning',
      position: 'top',
      icon: 'receipt_long',
      message: 'Tagihan belum dipilih!',
      caption: 'Anda memilih metode Tarik Tagihan. Harap pilih Tagihan Supplier.',
      timeout: 3500,
    })
    return
  }

  submitting.value = true
  $q.loading.show({ message: 'Memproses pengajuan...' })

  try {
    for (let item of form.value.lampiran) {
      if (item.fileObj) {
        const result = await processHybridUpload(item.fileObj, item.label || 'Doc')
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
      no_request: form.value.no_request,
      tipe_pengajuan: form.value.tipe_pengajuan,
      tagihan_id: form.value.tagihan_id || null,
      tagihan_nomor_invoice: form.value.tagihan_nomor_invoice || '',
      vendor_nama: form.value.vendor_nama,
      rek_bank: form.value.rek_bank,
      rek_nomor: form.value.rek_nomor,
      rek_nama: form.value.rek_nama,
      nominal: form.value.nominal,
      tanggal_pengajuan: form.value.tanggal_pengajuan,
      tanggal_dibutuhkan: form.value.tanggal_dibutuhkan,
      keterangan: form.value.keterangan,
      lampiran: form.value.lampiran,
      status: form.value.status,
      updatedAt: serverTimestamp(),
      approver_read: false,
      creator_read: true,
      realizer_read: false,
      realized_approved_read: true,
    }

    if (isEditMode.value) {
      payload.status = 'Pending'
      payload.approver_read = false
      await updateDoc(doc(db, 'finance_pengajuan_pembayaran', form.value.id), payload)
    } else {
      payload.createdAt = serverTimestamp()
      payload.pembuat_id = authStore.user?.uid || ''
      payload.pembuat_email = authStore.user?.email || ''
      payload.pembuat_nama = authStore.user?.nama || 'User'
      await addDoc(collection(db, 'finance_pengajuan_pembayaran'), payload)
    }

    $q.notify({
      type: 'positive',
      position: 'top',
      icon: 'check_circle',
      message: 'Pengajuan berhasil dikirim!',
      caption: 'Menunggu proses approval dari atasan.',
      timeout: 3500,
    })
    viewMode.value = 'list'
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      position: 'top',
      icon: 'error',
      message: 'Terjadi kesalahan sistem.',
      caption: 'Silakan coba lagi atau hubungi administrator.',
      timeout: 4000,
    })
  } finally {
    submitting.value = false
    $q.loading.hide()
  }
}

const confirmHapus = (row) => {
  if (!canHapus.value) {
    $q.notify({
      type: 'negative',
      position: 'top',
      icon: 'lock',
      message: 'Anda tidak memiliki izin menghapus pengajuan.',
      timeout: 3000,
    })
    return
  }
  $q.dialog({
    title: 'Hapus Pengajuan',
    message: `Hapus request ${row.no_request} secara permanen?`,
    cancel: true,
    ok: { color: 'negative', label: 'Hapus', unelevated: true },
  }).onOk(async () => {
    await deleteDoc(doc(db, 'finance_pengajuan_pembayaran', row.id))
    $q.notify({
      type: 'positive',
      position: 'top',
      icon: 'delete_forever',
      message: 'Data berhasil dihapus.',
      timeout: 2500,
    })
  })
}

// Utilities
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
      return { bg: 'green-1', text: 'text-positive', icon: 'verified' }
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
    $q.notify({
      type: 'warning',
      position: 'top',
      icon: 'link_off',
      message: 'Tautan dokumen tidak tersedia.',
      timeout: 2500,
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
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      const blob = new Blob([u8arr], { type: mime })
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
    } catch (e) {
      console.error('Error parsing base64 URL:', e)
      $q.notify({
        type: 'negative',
        position: 'top',
        icon: 'error',
        message: 'Gagal membuka dokumen internal.',
        timeout: 3000,
      })
    }
  } else {
    const link = document.createElement('a')
    link.href = url
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// ============================================================================
// EXPORT METHODS
// ============================================================================
const exportTablePDF = () => {
  const e = document.getElementById('table-pdf-export')
  if (!e) return
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `Daftar_Pengajuan_Pembayaran_${Date.now()}.pdf`,
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
        position: 'top',
        icon: 'picture_as_pdf',
        message: 'PDF berhasil diunduh.',
        timeout: 2500,
      })
    })
}

const exportTableExcel = () => {
  try {
    const thStyle =
      'background-color: #00695c; color: #ffffff; font-weight: bold; border: 1px solid #dddddd; padding: 10px; text-align: center; text-transform: uppercase;'
    const tdStyle = 'border: 1px solid #dddddd; padding: 8px; vertical-align: top;'
    const tdNumStyle = tdStyle + ' text-align: right;'
    const tdCenterStyle = tdStyle + ' text-align: center;'

    let tableHtml =
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">'
    tableHtml += '<head><meta charset="utf-8"></head><body>'
    tableHtml +=
      '<h2 style="color: #00695c; margin-bottom: 5px; font-family: sans-serif;">Laporan Pengajuan Pembayaran</h2>'
    tableHtml +=
      '<p style="margin-top: 0; font-family: sans-serif;">Diekspor pada: ' +
      new Date().toLocaleString('id-ID') +
      '</p><br>'
    tableHtml += '<table style="border-collapse: collapse; width: 100%; font-family: sans-serif;">'
    tableHtml += '<thead><tr>'
    tableHtml += `<th style="${thStyle}">No</th>`
    tableHtml += `<th style="${thStyle}">No Request</th>`
    tableHtml += `<th style="${thStyle}">Ref Tagihan</th>`
    tableHtml += `<th style="${thStyle}">Vendor / Penerima</th>`
    tableHtml += `<th style="${thStyle}">Bank</th>`
    tableHtml += `<th style="${thStyle}">No Rekening</th>`
    tableHtml += `<th style="${thStyle}">Pemohon</th>`
    tableHtml += `<th style="${thStyle}">Tgl Pengajuan</th>`
    tableHtml += `<th style="${thStyle}">Target Cair</th>`
    tableHtml += `<th style="${thStyle}">Nominal (Rp)</th>`
    tableHtml += `<th style="${thStyle}">Status</th>`
    tableHtml += `<th style="${thStyle}">Keterangan</th>`
    tableHtml += '</tr></thead><tbody>'

    let totalNominal = 0

    filteredRows.value.forEach((r, index) => {
      totalNominal += Number(r.nominal) || 0
      tableHtml += `
        <tr>
          <td style="${tdCenterStyle}">${index + 1}</td>
          <td style="${tdStyle}">${r.no_request || '-'}</td>
          <td style="${tdStyle}">${r.tagihan_kode || r.tagihan_nomor_invoice || '-'}</td>
          <td style="${tdStyle}">${r.vendor_nama || '-'}</td>
          <td style="${tdCenterStyle}">${r.rek_bank || '-'}</td>
          <td style="${tdStyle} mso-number-format:'\\@';">${r.rek_nomor || '-'}</td>
          <td style="${tdStyle}">${r.pembuat_nama || '-'}</td>
          <td style="${tdCenterStyle}">${formatDateIndo(r.tanggal_pengajuan)}</td>
          <td style="${tdCenterStyle}">${formatDateIndo(r.tanggal_dibutuhkan)}</td>
          <td style="${tdNumStyle}">${r.nominal || 0}</td>
          <td style="${tdCenterStyle}">${r.status || '-'}</td>
          <td style="${tdStyle}">${(r.keterangan || '-').replace(/\n/g, '<br>')}</td>
        </tr>
      `
    })

    tableHtml += `
        <tr style="background-color: #f5f5f5;">
          <td colspan="9" style="${tdStyle} text-align: right; font-weight: bold;">TOTAL NOMINAL PENGAJUAN</td>
          <td style="${tdNumStyle} font-weight: bold;">${totalNominal}</td>
          <td colspan="2" style="${tdStyle}"></td>
        </tr>
    `
    tableHtml += '</tbody></table></body></html>'

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Data_Pengajuan_Pembayaran_${Date.now()}.xls`
    link.click()
    URL.revokeObjectURL(url)

    $q.notify({
      type: 'positive',
      position: 'top',
      icon: 'table_view',
      message: 'Data berhasil diekspor ke Excel.',
      timeout: 2500,
    })
  } catch (err) {
    console.error(err)
    $q.notify({
      type: 'negative',
      position: 'top',
      icon: 'error',
      message: 'Gagal mengekspor data list.',
      timeout: 3000,
    })
  }
}

const printDetail = () => window.print()

const exportDetailPDF = () => {
  const e = document.getElementById('pengajuan-detail-pdf')
  if (!e) return
  const opt = {
    margin: [5, 5, 5, 5],
    filename: `Detail_Pengajuan_${selectedData.value.no_request.replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
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
        position: 'top',
        icon: 'picture_as_pdf',
        message: 'PDF berhasil diunduh.',
        timeout: 2500,
      })
    })
}

const exportDetailExcel = () => {
  try {
    const thStyle =
      'background-color: #00695c; color: #ffffff; font-weight: bold; border: 1px solid #dddddd; padding: 10px; text-align: left;'
    const tdStyle = 'border: 1px solid #dddddd; padding: 8px; vertical-align: top;'

    let tableHtml =
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">'
    tableHtml += '<head><meta charset="utf-8"></head><body>'
    tableHtml +=
      '<h2 style="color: #00695c; margin-bottom: 5px; font-family: sans-serif;">Detail Pengajuan Pembayaran</h2>'
    tableHtml +=
      '<p style="margin-top: 0; font-family: sans-serif;">Diekspor pada: ' +
      new Date().toLocaleString('id-ID') +
      '</p><br>'

    const r = selectedData.value
    tableHtml +=
      '<table style="border-collapse: collapse; width: 100%; font-family: sans-serif; max-width: 800px;">'

    const addRow = (label, value) => {
      tableHtml += `<tr><th style="${thStyle} width: 250px;">${label}</th><td style="${tdStyle}">${value || '-'}</td></tr>`
    }

    addRow('NO REQUEST', r.no_request)
    addRow('TIPE PENGAJUAN', r.tipe_pengajuan)
    addRow('REF TAGIHAN / INVOICE', r.tagihan_kode || r.tagihan_nomor_invoice)
    addRow('VENDOR / PENERIMA', r.vendor_nama)
    addRow('BANK', r.rek_bank)
    tableHtml += `<tr><th style="${thStyle}">NO REKENING</th><td style="${tdStyle} mso-number-format:'\\@';">${r.rek_nomor || '-'}</td></tr>`
    addRow('ATAS NAMA', r.rek_nama)
    addRow('PEMOHON', r.pembuat_nama)
    addRow('TGL PENGAJUAN', formatDateIndo(r.tanggal_pengajuan))
    addRow('TARGET CAIR', formatDateIndo(r.tanggal_dibutuhkan))
    addRow(
      'TGL REALISASI (CAIR)',
      formatDateIndo(r.realizedAt?.seconds ? new Date(r.realizedAt.toDate()) : null),
    )
    addRow('NOMINAL PENGAJUAN', 'Rp ' + (r.nominal || 0).toLocaleString('id-ID'))
    addRow(
      'NOMINAL EKSEKUSI',
      r.nominal_eksekusi ? 'Rp ' + r.nominal_eksekusi.toLocaleString('id-ID') : '-',
    )
    addRow('STATUS', r.status)
    addRow('KETERANGAN / TUJUAN', (r.keterangan || '').replace(/\n/g, '<br>'))
    addRow(
      'CATATAN APPROVAL / REALISASI',
      (r.catatan_approval || r.catatan_realisasi || r.alasan_reject || '').replace(/\n/g, '<br>'),
    )

    tableHtml += '</table></body></html>'

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Detail_Pengajuan_${r.no_request.replace(/\//g, '-')}.xls`
    link.click()
    URL.revokeObjectURL(url)

    $q.notify({
      type: 'positive',
      position: 'top',
      icon: 'table_view',
      message: 'Data detail berhasil diekspor ke Excel.',
      timeout: 2500,
    })
  } catch (err) {
    console.error(err)
    $q.notify({
      type: 'negative',
      position: 'top',
      icon: 'error',
      message: 'Gagal mengekspor data detail.',
      timeout: 3000,
    })
  }
}

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(() => {
  fetchData()
  const email = authStore.user?.email
  if (email) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', email))
    unsubUser = onSnapshot(qUser, (s) => {
      if (!s.empty) {
        userData.value = s.docs[0].data()
      }
    })
  }
})

onUnmounted(() => {
  if (unsubData) unsubData()
  if (unsubTagihan) unsubTagihan()
  if (unsubUser) unsubUser()
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
  box-shadow: 0 10px 30px rgba(0, 121, 107, 0.15);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.border-bottom {
  border-bottom: 1px solid #eee;
}
.border-dashed {
  border: 2px dashed #e0e0e0;
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

/* =============================================
   GRADIENT KPI CARDS
   ============================================= */
.card-teal-gradient {
  background: linear-gradient(135deg, #009688 0%, #00695c 100%) !important;
  box-shadow: 0 8px 24px rgba(0, 121, 107, 0.35) !important;
}
.card-orange-gradient {
  background: linear-gradient(135deg, #fb8c00 0%, #e65100 100%) !important;
  box-shadow: 0 8px 24px rgba(230, 81, 0, 0.35) !important;
}
.card-green-gradient {
  background: linear-gradient(135deg, #43a047 0%, #1b5e20 100%) !important;
  box-shadow: 0 8px 24px rgba(27, 94, 32, 0.35) !important;
}
.card-blue-gradient {
  background: linear-gradient(135deg, #0288d1 0%, #01579b 100%) !important;
  box-shadow: 0 8px 24px rgba(1, 87, 155, 0.35) !important;
}

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
  background-color: rgba(0, 121, 107, 0.03) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2) !important;
}
.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transition: 0.3s;
}
.hover-blue-btn:hover {
  background-color: #e8eaf6 !important;
  color: #00695c !important;
}

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
.custom-toggle {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-weight: 600;
}
.h-full {
  height: 100%;
  display: flex;
  flex-direction: column;
}
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
  background-color: #00796b !important;
  color: white !important;
  padding: 10px;
  font-size: 11px;
  border: 1px solid #00796b;
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
