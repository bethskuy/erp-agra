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
              Pengajuan Pembayaran
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Payment Request & Disbursement</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Buat permohonan pencairan dana berdasarkan tagihan vendor yang telah diverifikasi.
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          v-if="canAction('buat')"
          color="indigo-10"
          icon="payments"
          label="Buat Pengajuan Baru"
          unelevated
          rounded
          no-caps
          class="q-px-lg q-py-sm shadow-premium btn-hover text-weight-bold"
          @click="openAddDialog"
        />
      </div>
    </div>

    <!-- =====================================================================================
         SUMMARY CARDS / KPI FINANCE
         ===================================================================================== -->
    <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
      <!-- Total Pengajuan -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                TOTAL PENGAJUAN
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-indigo-10">
                {{ rows.length }}
              </div>
            </div>
            <div
              class="bg-indigo-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="request_quote" color="indigo-10" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Menunggu Approval -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                MENUNGGU APPROVAL
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-orange-9">
                {{ countByStatus('Menunggu Approval') }}
              </div>
            </div>
            <div
              class="bg-orange-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="hourglass_empty" color="orange-9" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Siap Dicairkan (Approved) -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest">
                SIAP CAIR (APPROVED)
              </div>
              <div class="text-h4 text-weight-bolder q-mt-xs text-positive">
                {{ countByStatus('Disetujui') }}
              </div>
            </div>
            <div
              class="bg-green-1 q-pa-md rounded-borders"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="verified" color="positive" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Total Dana Diajukan -->
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
                DANA DIAJUKAN (PENDING)
              </div>
              <div class="text-h5 text-weight-bolder q-mt-xs">
                Rp {{ formatCompact(totalDanaPending) }}
              </div>
            </div>
            <div
              class="bg-white q-pa-md rounded-borders shadow-2"
              style="min-width: 56px; text-align: center"
            >
              <q-icon name="account_balance" color="indigo-10" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- =====================================================================================
         SEARCH & FILTER AREA
         ===================================================================================== -->
    <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print border-subtle">
      <q-card-section class="q-py-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-4">
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
            <q-btn-toggle
              v-model="statusFilter"
              flat
              rounded
              toggle-color="indigo-10"
              color="grey-7"
              class="bg-grey-1"
              :options="[
                { label: 'Semua', value: 'ALL' },
                { label: 'Pending', value: 'Menunggu Approval' },
                { label: 'Approved', value: 'Disetujui' },
              ]"
            />
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
            @click="openPreview(props.row)"
          >
            <q-td key="nomor_req">
              <div class="row items-center no-wrap">
                <q-avatar
                  size="36px"
                  color="indigo-1"
                  text-color="indigo-10"
                  icon="send"
                  class="q-mr-md shadow-sm"
                />
                <div>
                  <div
                    class="text-weight-bold text-blue-grey-10 text-subtitle2 leading-none q-mb-xs"
                  >
                    {{ props.row.nomor_req }}
                  </div>
                  <div class="text-caption text-grey-6 uppercase text-weight-medium">
                    REF: {{ props.row.nomor_invoice || 'TANPA INVOICE' }}
                  </div>
                </div>
              </div>
            </q-td>

            <q-td key="tujuan">
              <div class="text-weight-bold text-blue-grey-9 uppercase font-11">
                {{ props.row.supplier_nama || 'NON-VENDOR' }}
              </div>
              <div class="text-caption text-grey-6">
                Ke: {{ props.row.rek_bank }} - {{ props.row.rek_nomor }}
              </div>
            </q-td>

            <q-td key="nominal" class="text-right">
              <div class="text-weight-bolder text-indigo-10 text-subtitle2">
                Rp {{ (props.row.nominal_pengajuan || 0).toLocaleString() }}
              </div>
              <div class="text-caption text-grey-6 font-10">Via {{ props.row.metode_bayar }}</div>
            </q-td>

            <q-td key="tanggal">
              <div class="text-weight-medium text-blue-grey-9 font-11">
                {{ formatDateIndo(props.row.tanggal_pengajuan) }}
              </div>
            </q-td>

            <q-td key="status" class="text-center">
              <q-chip
                dense
                :color="getStatusColor(props.row.status).bg"
                :text-color="getStatusColor(props.row.status).text"
                class="text-weight-bold font-10 uppercase q-ma-none shadow-sm q-px-sm"
              >
                <q-icon :name="getStatusColor(props.row.status).icon" class="q-mr-xs" size="10px" />
                {{ props.row.status }}
              </q-chip>
            </q-td>

            <q-td key="aksi" class="text-center" @click.stop>
              <div class="row justify-center q-gutter-xs">
                <q-btn
                  v-if="props.row.status === 'Draft' || props.row.status === 'Ditolak'"
                  flat
                  round
                  color="blue-8"
                  icon="edit_note"
                  size="sm"
                  @click="openEditDialog(props.row)"
                >
                  <q-tooltip>Edit Draft</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="grey-6"
                  icon="visibility"
                  size="sm"
                  @click="openPreview(props.row)"
                >
                  <q-tooltip>Lihat Detail</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="canAction('hapus') && props.row.status !== 'Disetujui'"
                  flat
                  round
                  color="negative"
                  icon="delete_outline"
                  size="sm"
                  @click="confirmHapus(props.row)"
                >
                  <q-tooltip>Batalkan/Hapus</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="request_quote" size="64px" class="q-mb-md" />
            <div class="text-h6 full-width text-center">Data pengajuan belum tersedia.</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- =====================================================================================
         DIALOG ENTRY / EDIT PENGAJUAN (MAXIMIZED)
         ===================================================================================== -->
    <q-dialog
      v-model="showDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      backdrop-filter="blur(4px)"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <q-toolbar class="bg-white text-indigo-10 q-py-md shadow-2 shrink">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest font-11">
            {{ isEditMode ? 'EDIT DATA PENGAJUAN' : 'FORM PENGAJUAN PEMBAYARAN BARU' }}
          </q-toolbar-title>
          <q-btn
            unelevated
            color="indigo-10"
            label="KIRIM PENGAJUAN"
            rounded
            icon-right="send"
            class="q-px-xl text-weight-bold shadow-3"
            @click="simpanPengajuan"
            :loading="submitting"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-xl-10">
              <!-- STEP 1: PILIH TAGIHAN -->
              <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1 border-indigo-thin">
                <q-card-section
                  class="bg-indigo-1 q-py-sm text-indigo-10 text-weight-bold flex items-center border-bottom"
                >
                  <q-icon name="receipt_long" class="q-mr-xs" size="sm" /> 1. SUMBER TAGIHAN
                  (INVOICE REFERENCE)
                </q-card-section>
                <q-card-section class="q-pa-lg">
                  <div class="row q-col-gutter-lg items-start">
                    <div class="col-12 col-md-6">
                      <div class="label-req q-mb-xs text-primary">
                        Tarik Data Invoice Belum Lunas *
                      </div>
                      <q-select
                        outlined
                        dense
                        v-model="form.tagihan_ref"
                        :options="optTagihan"
                        option-label="nomor_invoice"
                        placeholder="Pilih Invoice yang akan dibayar..."
                        bg-color="blue-50"
                        clearable
                        @update:model-value="onTagihanSelect"
                        :rules="[(val) => !!val || 'Pilih invoice referensi']"
                      >
                        <template v-slot:option="scope">
                          <q-item v-bind="scope.itemProps">
                            <q-item-section>
                              <q-item-label class="text-weight-bold">{{
                                scope.opt.nomor_invoice
                              }}</q-item-label>
                              <q-item-label caption>{{ scope.opt.supplier_nama }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-badge
                                color="orange-1"
                                text-color="orange-9"
                                class="text-weight-bold"
                              >
                                Sisa: Rp
                                {{
                                  formatCompact(
                                    scope.opt.grand_total - (scope.opt.total_dibayar || 0),
                                  )
                                }}
                              </q-badge>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>

                      <div class="row q-col-gutter-sm q-mt-sm">
                        <div class="col-6">
                          <q-input
                            outlined
                            dense
                            v-model="form.nomor_req"
                            label="No. Pengajuan (Auto)"
                            readonly
                            bg-color="grey-2"
                            class="text-weight-bold"
                          />
                        </div>
                        <div class="col-6">
                          <q-input
                            outlined
                            dense
                            type="date"
                            v-model="form.tanggal_pengajuan"
                            label="Tgl Pengajuan"
                            bg-color="white"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="col-12 col-md-6">
                      <!-- Rincian Sisa Tagihan Panel -->
                      <div
                        class="bg-grey-1 q-pa-md rounded-12 border-subtle h-full"
                        v-if="form.tagihan_ref"
                      >
                        <div
                          class="text-caption text-weight-bold text-grey-6 uppercase tracking-widest q-mb-sm"
                        >
                          Rincian Hutang Invoice
                        </div>
                        <div class="row justify-between q-mb-xs">
                          <div class="text-body2 text-grey-8">Total Nilai Invoice</div>
                          <div class="text-body2 text-weight-bold">
                            Rp {{ (form.tagihan_ref.grand_total || 0).toLocaleString() }}
                          </div>
                        </div>
                        <div class="row justify-between q-mb-xs border-bottom q-pb-xs">
                          <div class="text-body2 text-grey-8">Telah Dibayar (Termin Sblmnya)</div>
                          <div class="text-body2 text-weight-bold text-negative">
                            - Rp {{ (form.tagihan_ref.total_dibayar || 0).toLocaleString() }}
                          </div>
                        </div>
                        <div class="row justify-between q-mt-sm">
                          <div class="text-subtitle2 text-indigo-10 font-bold uppercase">
                            Sisa Harus Dibayar
                          </div>
                          <div class="text-subtitle1 text-weight-black text-indigo-10">
                            Rp {{ (form.sisa_tagihan || 0).toLocaleString() }}
                          </div>
                        </div>
                      </div>
                      <div
                        v-else
                        class="flex flex-center h-full bg-grey-1 rounded-12 border-dashed text-grey-5 italic"
                      >
                        Pilih invoice untuk melihat sisa tagihan.
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <div class="row q-col-gutter-lg">
                <!-- STEP 2: DETAIL PENGAJUAN -->
                <div class="col-12 col-md-7">
                  <q-card
                    flat
                    bordered
                    class="rounded-20 bg-white shadow-1 border-indigo-thin h-full"
                  >
                    <q-card-section
                      class="bg-indigo-1 q-py-sm text-indigo-10 text-weight-bold flex items-center border-bottom"
                    >
                      <q-icon name="payments" class="q-mr-xs" size="sm" /> 2. DETAIL NOMINAL &
                      METODE PEMBAYARAN
                    </q-card-section>
                    <q-card-section class="q-pa-lg q-gutter-y-md">
                      <div class="row q-col-gutter-md">
                        <div class="col-12 col-sm-6">
                          <div class="label-req q-mb-xs">Nominal Diajukan (Rp) *</div>
                          <q-input
                            outlined
                            dense
                            type="number"
                            v-model.number="form.nominal_pengajuan"
                            bg-color="white"
                            class="text-weight-black text-h6 text-primary"
                            prefix="Rp"
                            :rules="[
                              (val) => val > 0 || 'Nominal harus lebih dari 0',
                              (val) =>
                                !form.sisa_tagihan ||
                                val <= form.sisa_tagihan ||
                                'Melebihi sisa tagihan!',
                            ]"
                          />
                          <div
                            class="text-caption text-orange-9 font-bold"
                            v-if="form.sisa_tagihan && form.nominal_pengajuan < form.sisa_tagihan"
                          >
                            * Pembayaran ini berupa cicilan/parsial.
                          </div>
                        </div>
                        <div class="col-12 col-sm-6">
                          <div class="label-req q-mb-xs">Metode Pembayaran</div>
                          <q-select
                            outlined
                            dense
                            v-model="form.metode_bayar"
                            :options="['Transfer Bank', 'Tunai / Cash', 'Cek / Giro', 'Lainnya']"
                            bg-color="white"
                          />
                        </div>
                      </div>

                      <q-separator class="q-my-md border-subtle" />

                      <div class="row q-col-gutter-md">
                        <div class="col-12 col-md-6">
                          <div class="label-req q-mb-xs">Ditujukan Kepada (Vendor/Supplier)</div>
                          <q-input
                            outlined
                            dense
                            v-model="form.supplier_nama"
                            bg-color="grey-2"
                            readonly
                            class="text-weight-bold uppercase"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <div class="label-req q-mb-xs">Bank Tujuan Transfer</div>
                          <q-input
                            outlined
                            dense
                            v-model="form.rek_bank"
                            bg-color="white"
                            placeholder="BCA / Mandiri / dll"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <div class="label-req q-mb-xs">Nomor Rekening Tujuan</div>
                          <q-input
                            outlined
                            dense
                            v-model="form.rek_nomor"
                            bg-color="white"
                            class="text-weight-bold text-primary"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <div class="label-req q-mb-xs">Atas Nama Rekening</div>
                          <q-input
                            outlined
                            dense
                            v-model="form.rek_nama"
                            bg-color="white"
                            class="uppercase"
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- STEP 3: CATATAN & LAMPIRAN -->
                <div class="col-12 col-md-5">
                  <q-card
                    flat
                    bordered
                    class="rounded-20 bg-white shadow-1 border-indigo-thin h-full"
                  >
                    <q-card-section
                      class="bg-indigo-1 q-py-sm text-indigo-10 text-weight-bold flex items-center border-bottom"
                    >
                      <q-icon name="subject" class="q-mr-xs" size="sm" /> 3. JUSTIFIKASI & LAMPIRAN
                    </q-card-section>
                    <q-card-section class="q-pa-lg q-gutter-y-md">
                      <div>
                        <div class="label-req q-mb-xs">Keperluan / Keterangan Pembayaran</div>
                        <q-input
                          outlined
                          dense
                          type="textarea"
                          rows="3"
                          v-model="form.keperluan"
                          bg-color="white"
                          placeholder="Contoh: Pelunasan invoice material semen tahap 1..."
                        />
                      </div>

                      <q-separator class="border-subtle" />

                      <div>
                        <div class="label-req q-mb-xs">Dokumen Pendukung Tambahan (Opsional)</div>
                        <q-file
                          outlined
                          dense
                          v-model="buktiFile"
                          label="Upload Bukti / Memo"
                          accept=".pdf, image/*"
                          bg-color="white"
                        >
                          <template v-slot:prepend
                            ><q-icon name="cloud_upload" color="primary"
                          /></template>
                          <template v-slot:append v-if="form.lampiran_url">
                            <q-icon name="check_circle" color="positive" size="xs" />
                          </template>
                        </q-file>
                        <div class="text-caption text-grey-6 q-mt-xs italic">
                          Invoice asli sudah terlampir otomatis dari data tagihan. Gunakan ini jika
                          ada memo tambahan.
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </div>
          <div class="q-py-xl"></div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- =====================================================================================
         PREVIEW DIALOG (RINGKASAN PENGAJUAN)
         ===================================================================================== -->
    <q-dialog v-model="showPreview" transition-show="scale" transition-hide="scale">
      <q-card style="width: 600px; max-width: 95vw" class="rounded-20 shadow-24 overflow-hidden">
        <q-toolbar class="bg-indigo-10 text-white q-py-md">
          <q-icon name="request_quote" size="sm" class="q-mr-sm" />
          <q-toolbar-title class="text-weight-bold text-subtitle1 uppercase tracking-widest"
            >Detail Pengajuan Dana</q-toolbar-title
          >
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pa-lg bg-grey-1" v-if="selectedData">
          <div class="row justify-between items-center q-mb-lg border-bottom-subtle q-pb-md">
            <div>
              <div class="text-caption text-grey-6 uppercase tracking-widest font-bold">
                Nomor Pengajuan
              </div>
              <div class="text-h6 text-weight-black text-indigo-10">
                {{ selectedData.nomor_req }}
              </div>
            </div>
            <div class="text-right">
              <q-chip
                dense
                :color="getStatusColor(selectedData.status).bg"
                :text-color="getStatusColor(selectedData.status).text"
                class="text-weight-bold font-11 uppercase q-ma-none shadow-sm"
              >
                <q-icon
                  :name="getStatusColor(selectedData.status).icon"
                  class="q-mr-xs"
                  size="12px"
                />
                {{ selectedData.status }}
              </q-chip>
              <div class="text-caption text-grey-6 q-mt-xs">
                {{ formatDateIndo(selectedData.tanggal_pengajuan) }}
              </div>
            </div>
          </div>

          <div class="q-pa-md bg-white rounded-12 shadow-sm border-subtle q-mb-md">
            <div class="text-overline text-primary uppercase font-bold q-mb-sm">
              Detail Pembayaran
            </div>
            <div class="row q-col-gutter-y-sm">
              <div class="col-12 row justify-between">
                <span class="text-grey-7">Ditujukan Ke</span>
                <span class="text-weight-bold uppercase">{{ selectedData.supplier_nama }}</span>
              </div>
              <div class="col-12 row justify-between">
                <span class="text-grey-7">Metode</span>
                <span class="text-weight-bold">{{ selectedData.metode_bayar }}</span>
              </div>
              <div
                class="col-12 row justify-between"
                v-if="selectedData.metode_bayar.includes('Transfer')"
              >
                <span class="text-grey-7">Rekening Tujuan</span>
                <span class="text-weight-bold text-indigo-10"
                  >{{ selectedData.rek_bank }} - {{ selectedData.rek_nomor }}<br /><span
                    class="text-caption text-grey-7"
                    >a/n {{ selectedData.rek_nama }}</span
                  ></span
                >
              </div>
              <div class="col-12 q-mt-sm q-pt-sm border-top-subtle">
                <div class="text-grey-7 q-mb-xs">Keperluan:</div>
                <div class="text-weight-medium text-blue-grey-9 italic">
                  "{{ selectedData.keperluan || '-' }}"
                </div>
              </div>
            </div>
          </div>

          <div
            class="q-pa-md bg-indigo-1 rounded-12 border-indigo-thin flex justify-between items-center"
          >
            <div>
              <div class="text-caption text-indigo-10 uppercase tracking-widest font-bold">
                Nominal Pencairan
              </div>
              <div class="text-caption text-grey-7">Ref: {{ selectedData.nomor_invoice }}</div>
            </div>
            <div class="text-h5 text-weight-black text-indigo-10">
              Rp {{ (selectedData.nominal_pengajuan || 0).toLocaleString() }}
            </div>
          </div>

          <!-- Jika ada lampiran -->
          <div class="q-mt-lg text-center" v-if="selectedData.lampiran_url">
            <q-btn
              outline
              color="indigo-10"
              icon="download"
              label="Unduh Lampiran Memo"
              rounded
              no-caps
              @click="openLink(selectedData.lampiran_url)"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
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
  query,
  where,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

// State
const rows = ref([])
const loading = ref(true)
const submitting = ref(false)
const searchQuery = ref('')
const statusFilter = ref('ALL')
const showDialog = ref(false)
const showPreview = ref(false)
const isEditMode = ref(false)
const selectedData = ref(null)

// Data References
const optTagihan = ref([])
const buktiFile = ref(null)

let unsubPengajuan = null

// Form State
const formDefault = {
  id: null,
  nomor_req: '',
  tanggal_pengajuan: new Date().toISOString().substr(0, 10),
  tagihan_ref: null,
  tagihan_id: '',
  nomor_invoice: '',
  sisa_tagihan: 0,
  nominal_pengajuan: 0,
  metode_bayar: 'Transfer Bank',
  supplier_nama: '',
  rek_bank: '',
  rek_nomor: '',
  rek_nama: '',
  keperluan: '',
  lampiran_url: '',
  status: 'Menunggu Approval',
}
const form = ref({ ...formDefault })

// Columns
const columns = [
  {
    name: 'nomor_req',
    align: 'left',
    label: 'NO. REQUEST & REF',
    field: 'nomor_req',
    sortable: true,
  },
  {
    name: 'tujuan',
    align: 'left',
    label: 'VENDOR / PENERIMA',
    field: 'supplier_nama',
    sortable: true,
  },
  {
    name: 'nominal',
    align: 'right',
    label: 'NOMINAL DIAJUKAN',
    field: 'nominal_pengajuan',
    sortable: true,
  },
  {
    name: 'tanggal',
    align: 'left',
    label: 'TGL PENGAJUAN',
    field: 'tanggal_pengajuan',
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]

// Fetch Data
const fetchData = async () => {
  loading.value = true

  // Ambil Data Tagihan yang belum lunas (Outstanding)
  const snapTagihan = await getDocs(
    query(
      collection(db, 'finance_tagihan'),
      where('status', 'in', ['Menunggu Pembayaran', 'Dibayar Sebagian']),
    ),
  )
  optTagihan.value = snapTagihan.docs.map((d) => ({ id: d.id, ...d.data() }))

  // Listener Pengajuan Pembayaran
  unsubPengajuan = onSnapshot(collection(db, 'finance_pengajuan_pembayaran'), (snap) => {
    rows.value = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    loading.value = false
  })
}

// Computed Filters & Stats
const filteredRows = computed(() => {
  let result = rows.value

  if (statusFilter.value !== 'ALL') {
    result = result.filter((r) => r.status === statusFilter.value)
  }

  if (searchQuery.value) {
    const lower = searchQuery.value.toLowerCase()
    result = result.filter(
      (r) =>
        r.nomor_req?.toLowerCase().includes(lower) ||
        r.supplier_nama?.toLowerCase().includes(lower),
    )
  }
  return result
})

const countByStatus = (status) => rows.value.filter((r) => r.status === status).length

const totalDanaPending = computed(() => {
  return rows.value
    .filter((r) => r.status === 'Menunggu Approval')
    .reduce((sum, r) => sum + (r.nominal_pengajuan || 0), 0)
})

// Dialog & Form Logic
const generateNoReq = () => {
  const now = new Date()
  const yymm =
    now.getFullYear().toString().slice(-2) + (now.getMonth() + 1).toString().padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `PAY-${yymm}/${random}`
}

const openAddDialog = () => {
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  form.value.nomor_req = generateNoReq()
  buktiFile.value = null
  showDialog.value = true
}

const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = {
    ...JSON.parse(JSON.stringify(row)),
    tagihan_ref: row.tagihan_id ? optTagihan.value.find((t) => t.id === row.tagihan_id) : null,
  }
  buktiFile.value = null
  showDialog.value = true
}

const openPreview = (row) => {
  selectedData.value = row
  showPreview.value = true
}

const openLink = (url) => {
  if (url) window.open(url, '_blank')
}

// Auto Fill dari Tagihan yang dipilih
const onTagihanSelect = async (invObj) => {
  if (invObj) {
    form.value.tagihan_id = invObj.id
    form.value.nomor_invoice = invObj.nomor_invoice

    // Kalkulasi sisa tagihan = grand_total - total_dibayar
    const totalDibayar = invObj.total_dibayar || 0
    form.value.sisa_tagihan = invObj.grand_total - totalDibayar

    // Default nominal pengajuan di-set full sisa tagihan
    form.value.nominal_pengajuan = form.value.sisa_tagihan

    form.value.keperluan = `Pembayaran tagihan Invoice: ${invObj.nomor_invoice}`
    form.value.supplier_nama = invObj.supplier_nama || ''

    // Tarik info bank dari master supplier (kalau ada)
    if (invObj.supplier_id) {
      try {
        const suppDoc = await getDocs(
          query(collection(db, 'suppliers'), where('__name__', '==', invObj.supplier_id)),
        )
        if (!suppDoc.empty) {
          const sData = suppDoc.docs[0].data()
          form.value.rek_bank = sData.rek_bank || ''
          form.value.rek_nomor = sData.rek_nomor || ''
          form.value.rek_nama = sData.rek_nama || ''
        }
      } catch (e) {
        console.error('Gagal tarik info bank supplier', e)
      }
    }
  } else {
    form.value.tagihan_id = ''
    form.value.sisa_tagihan = 0
    form.value.nominal_pengajuan = 0
    form.value.supplier_nama = ''
    form.value.rek_bank = ''
    form.value.rek_nomor = ''
    form.value.rek_nama = ''
  }
}

const simpanPengajuan = async () => {
  if (!form.value.tagihan_id || form.value.nominal_pengajuan <= 0) {
    return $q.notify({
      type: 'warning',
      message: 'Invoice referensi dan nominal wajib diisi dengan benar!',
    })
  }

  if (form.value.nominal_pengajuan > form.value.sisa_tagihan) {
    return $q.notify({
      type: 'negative',
      message: 'Nominal pengajuan tidak boleh melebihi sisa hutang!',
    })
  }

  $q.loading.show({ message: 'Mengirim pengajuan pembayaran...' })
  submitting.value = true

  try {
    let finalUrl = form.value.lampiran_url

    // Upload memo/bukti tambahan jika ada
    if (buktiFile.value) {
      const fileName = `pay_req_${Date.now()}_${buktiFile.value.name}`
      const fileRef = storageRef(storage, `finance/pengajuan/${fileName}`)
      const uploadSnap = await uploadBytes(fileRef, buktiFile.value)
      finalUrl = await getDownloadURL(uploadSnap.ref)
    }

    const payload = {
      nomor_req: form.value.nomor_req,
      tanggal_pengajuan: form.value.tanggal_pengajuan,
      tagihan_id: form.value.tagihan_id,
      nomor_invoice: form.value.nomor_invoice,
      sisa_tagihan: form.value.sisa_tagihan, // Snapshot saat diajukan
      nominal_pengajuan: form.value.nominal_pengajuan,
      metode_bayar: form.value.metode_bayar,
      supplier_nama: form.value.supplier_nama,
      rek_bank: form.value.rek_bank,
      rek_nomor: form.value.rek_nomor,
      rek_nama: form.value.rek_nama,
      keperluan: form.value.keperluan,
      lampiran_url: finalUrl,
      status: 'Menunggu Approval', // Force status ke Menunggu Approval
      updatedAt: serverTimestamp(),
    }

    if (isEditMode.value) {
      await updateDoc(doc(db, 'finance_pengajuan_pembayaran', form.value.id), payload)
    } else {
      payload.createdAt = serverTimestamp()
      payload.pemohon = authStore.user?.nama || 'Admin Finance'
      await addDoc(collection(db, 'finance_pengajuan_pembayaran'), payload)
    }

    showDialog.value = false
    $q.notify({
      type: 'positive',
      message: 'Pengajuan pembayaran berhasil dikirim ke antrean Approval!',
    })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan pengajuan.' })
  } finally {
    $q.loading.hide()
    submitting.value = false
  }
}

const confirmHapus = (row) => {
  $q.dialog({
    title: 'Batalkan Pengajuan',
    message: `Hapus/batalkan pengajuan ${row.nomor_req}?`,
    cancel: true,
    ok: { color: 'negative', label: 'Hapus', unelevated: true },
  }).onOk(async () => {
    await deleteDoc(doc(db, 'finance_pengajuan_pembayaran', row.id))
    $q.notify({ type: 'positive', message: 'Pengajuan dibatalkan' })
  })
}

// Utils
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
    case 'Draft':
      return { bg: 'grey-3', text: 'grey-8', icon: 'edit' }
    case 'Menunggu Approval':
      return { bg: 'orange-2', text: 'orange-9', icon: 'hourglass_empty' }
    case 'Disetujui':
      return { bg: 'green-2', text: 'green-9', icon: 'verified' }
    case 'Ditolak':
      return { bg: 'red-2', text: 'red-9', icon: 'cancel' }
    default:
      return { bg: 'grey-3', text: 'grey-8', icon: 'info' }
  }
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
  box-shadow: 0 10px 30px rgba(26, 35, 126, 0.15);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-indigo-thin {
  border: 1px solid rgba(26, 35, 126, 0.1);
}
.border-dashed {
  border: 2px dashed #e0e0e0;
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
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.border-top-subtle {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}
.h-full {
  height: 100%;
}
</style>
