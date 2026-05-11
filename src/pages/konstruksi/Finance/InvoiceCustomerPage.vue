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
              Invoice Customer
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Account Receivable (Piutang Usaha)</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Buat dan kelola tagihan (Invoice) kepada Klien berdasarkan termin proyek atau Surat
              Perintah Kerja (SPK).
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn-dropdown
          color="indigo-10"
          icon="add_circle"
          label="Buat Invoice Baru"
          unelevated
          rounded
          no-caps
          class="q-px-md q-py-sm shadow-premium text-weight-bold"
        >
          <q-list class="bg-white rounded-borders">
            <q-item clickable v-close-popup @click="openAddDialog('manual')" class="hover-blue-btn">
              <q-item-section avatar>
                <q-avatar color="indigo-1" text-color="indigo-10" icon="edit_document" size="sm" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Buat Invoice Manual</q-item-label>
                <q-item-label caption>Input deskripsi tagihan manual</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item
              clickable
              v-close-popup
              @click="openAddDialog('kontrak')"
              class="hover-blue-btn"
            >
              <q-item-section avatar>
                <q-avatar color="green-1" text-color="green-10" icon="assignment" size="sm" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Buat Invoice Kontrak</q-item-label>
                <q-item-label caption>Tarik data dari SPK (BOQ)</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- =====================================================================================
         SUMMARY CARDS / KPI FINANCE
         ===================================================================================== -->
    <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
      <!-- Total Invoice -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="list-card rounded-20 bg-white">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-caption text-grey-6 text-bold tracking-widest uppercase font-10 q-mb-xs"
              >
                TOTAL INVOICE
              </div>
              <div class="text-h5 text-weight-black text-indigo-10">{{ rows.length }}</div>
            </div>
            <div class="col-auto">
              <q-avatar
                size="48px"
                color="indigo-1"
                text-color="indigo-10"
                icon="receipt_long"
                class="shadow-sm rounded-12"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Outstanding (Terkirim / Belum Lunas) -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="list-card rounded-20 bg-white">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-caption text-grey-6 text-bold tracking-widest uppercase font-10 q-mb-xs"
              >
                BELUM DIBAYAR
              </div>
              <div class="text-h5 text-weight-black text-orange-9">
                {{ countByStatus('Terkirim') }}
              </div>
            </div>
            <div class="col-auto">
              <q-avatar
                size="48px"
                color="orange-1"
                text-color="orange-9"
                icon="pending_actions"
                class="shadow-sm rounded-12"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Lunas -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="list-card rounded-20 bg-white">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-caption text-grey-6 text-bold tracking-widest uppercase font-10 q-mb-xs"
              >
                INVOICE LUNAS
              </div>
              <div class="text-h5 text-weight-black text-positive">
                {{ countByStatus('Lunas') }}
              </div>
            </div>
            <div class="col-auto">
              <q-avatar
                size="48px"
                color="green-1"
                text-color="positive"
                icon="task_alt"
                class="shadow-sm rounded-12"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Total Nilai Piutang (Belum Lunas) -->
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat class="list-card rounded-20 bg-indigo-10 text-white">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div
                class="text-caption text-indigo-2 text-bold tracking-widest uppercase font-10 q-mb-xs"
              >
                TOTAL PIUTANG AKTIF
              </div>
              <div class="text-h6 text-weight-black">Rp {{ formatCompact(totalPiutang) }}</div>
            </div>
            <div class="col-auto">
              <q-avatar
                size="48px"
                color="white"
                text-color="indigo-10"
                icon="account_balance_wallet"
                class="shadow-2 rounded-12"
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
          <q-btn flat round icon="refresh" color="indigo-10" @click="fetchData" />
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
            @click="openPreviewDialog(props.row)"
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

            <q-td key="timeline">
              <div class="text-caption text-grey-8 font-11">
                Tgl: <span class="text-weight-bold">{{ formatDateIndo(props.row.tanggal) }}</span>
              </div>
              <div
                class="text-caption font-11"
                :class="isOverdue(props.row) ? 'text-negative text-weight-bold' : 'text-grey-8'"
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
                :color="isOverdue(props.row) ? 'red-2' : getDisplayStatus(props.row).bg"
                :text-color="isOverdue(props.row) ? 'red-10' : getDisplayStatus(props.row).text"
                class="text-weight-bold font-10 uppercase q-ma-none shadow-sm q-px-sm"
              >
                {{ isOverdue(props.row) ? 'JATUH TEMPO' : getDisplayStatus(props.row).label }}
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
                  @click="openPreviewDialog(props.row)"
                  class="hover-blue-btn"
                >
                  <q-tooltip>Lihat Invoice</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="blue-8"
                  icon="edit"
                  size="sm"
                  @click="openEditDialog(props.row)"
                  class="hover-blue-btn"
                >
                  <q-tooltip>Edit Data</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete_outline"
                  size="sm"
                  @click="confirmHapus(props.row)"
                  class="hover-red-btn"
                >
                  <q-tooltip>Hapus</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="request_quote" size="64px" class="q-mb-md" />
            <div class="text-h6 full-width text-center">Data invoice klien belum tersedia.</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- =====================================================================================
         DIALOG ENTRY / EDIT INVOICE (MAXIMIZED)
         ===================================================================================== -->
    <q-dialog
      v-model="showDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <q-toolbar class="bg-white text-indigo-10 q-py-md shadow-2 shrink">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest font-11">
            {{
              isEditMode
                ? 'EDIT INVOICE CUSTOMER'
                : invoiceType === 'kontrak'
                  ? 'BUAT INVOICE BARU (KONTRAK)'
                  : 'BUAT INVOICE BARU (MANUAL)'
            }}
          </q-toolbar-title>
          <q-btn
            unelevated
            color="indigo-10"
            label="SIMPAN INVOICE"
            rounded
            class="q-px-xl text-weight-bold shadow-3"
            @click="simpanInvoice"
            :loading="submitting"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-xl-10">
              <div class="row q-col-gutter-lg">
                <!-- KOLOM KIRI (KLIEN & REFERENSI) -->
                <div class="col-12 col-md-5">
                  <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1">
                    <q-card-section
                      class="bg-indigo-1 q-py-sm text-indigo-10 text-weight-bold flex items-center border-bottom"
                    >
                      <q-icon name="person_pin" class="q-mr-xs" size="sm" /> 1. KEPADA YTH (KLIEN /
                      CUSTOMER)
                    </q-card-section>
                    <q-card-section class="q-pa-lg q-gutter-y-md">
                      <div>
                        <div class="label-req q-mb-xs text-primary">TARIK DATA MASTER KLIEN</div>
                        <q-select
                          outlined
                          dense
                          v-model="form.customer_ref"
                          :options="optCustomer"
                          option-label="nama"
                          placeholder="Pilih Klien..."
                          bg-color="blue-50"
                          clearable
                          use-input
                          @filter="filterCustomer"
                          @update:model-value="onCustomerSelect"
                        >
                          <template v-slot:no-option>
                            <q-item
                              ><q-item-section class="text-grey italic"
                                >Klien tidak ditemukan</q-item-section
                              ></q-item
                            >
                          </template>
                        </q-select>
                      </div>
                      <div>
                        <div class="label-req q-mb-xs">TO (NAMA PERUSAHAAN / KLIEN) *</div>
                        <q-input
                          outlined
                          dense
                          v-model="form.customer_nama"
                          bg-color="white"
                          class="text-weight-bold uppercase"
                        />
                      </div>
                      <div>
                        <div class="label-req q-mb-xs">ADDRESS (ALAMAT TAGIHAN) *</div>
                        <q-input
                          outlined
                          dense
                          type="textarea"
                          rows="2"
                          v-model="form.customer_alamat"
                          bg-color="white"
                        />
                      </div>
                    </q-card-section>
                  </q-card>

                  <q-card flat bordered class="rounded-20 bg-white shadow-1">
                    <q-card-section
                      class="bg-indigo-1 q-py-sm text-indigo-10 text-weight-bold flex items-center border-bottom"
                    >
                      <q-icon name="assignment" class="q-mr-xs" size="sm" /> 2. REFERENSI DOKUMEN &
                      PROYEK
                    </q-card-section>
                    <q-card-section class="q-pa-lg q-gutter-y-md">
                      <div class="row q-col-gutter-md">
                        <div class="col-12">
                          <div class="label-req q-mb-xs">Nomor Invoice *</div>
                          <q-input
                            outlined
                            dense
                            v-model="form.nomor_invoice"
                            bg-color="grey-2"
                            class="text-weight-bold text-indigo-10"
                          />
                        </div>
                        <div class="col-6">
                          <div class="label-req q-mb-xs">Tanggal Invoice *</div>
                          <q-input
                            outlined
                            dense
                            type="date"
                            v-model="form.tanggal"
                            bg-color="white"
                          />
                        </div>
                        <div class="col-6">
                          <div class="label-req q-mb-xs">Jatuh Tempo *</div>
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
                        <div
                          class="label-req q-mb-xs"
                          :class="invoiceType === 'kontrak' ? 'text-green-9' : 'text-primary'"
                        >
                          KAITKAN KE PROYEK
                          {{ invoiceType === 'kontrak' ? '(WAJIB UNTUK TARIK BOQ)' : '(OPSIONAL)' }}
                        </div>
                        <q-select
                          outlined
                          dense
                          v-model="form.proyek_ref"
                          :options="optProyek"
                          option-label="nama"
                          placeholder="Pilih Proyek..."
                          bg-color="blue-50"
                          clearable
                          use-input
                          @filter="filterProyek"
                          @update:model-value="onProyekSelect"
                        >
                          <template v-slot:no-option>
                            <q-item
                              ><q-item-section class="text-grey italic"
                                >Proyek tidak ditemukan</q-item-section
                              ></q-item
                            >
                          </template>
                        </q-select>
                      </div>
                      <div v-if="form.proyek_nama">
                        <div class="label-req q-mb-xs">UNTUK PROYEK / LOKASI</div>
                        <q-input
                          outlined
                          dense
                          v-model="form.proyek_nama"
                          readonly
                          bg-color="grey-2"
                          class="text-weight-bold uppercase"
                        />
                      </div>
                      <div>
                        <div class="label-req q-mb-xs">REFERENSI KONTRAK / SPK</div>
                        <q-input
                          outlined
                          dense
                          v-model="form.spk_nomor"
                          bg-color="white"
                          placeholder="No. SPK / PO Klien"
                        />
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- KOLOM KANAN (RINCIAN TAGIHAN) -->
                <div class="col-12 col-md-7">
                  <q-card
                    flat
                    bordered
                    class="rounded-20 bg-white shadow-1 overflow-hidden q-mb-lg border-indigo-thin"
                  >
                    <q-toolbar class="bg-indigo-10 text-white q-py-sm">
                      <q-icon name="list_alt" class="q-mr-md" />
                      <div class="text-weight-bold uppercase font-11 tracking-widest">
                        3. DESKRIPSI TAGIHAN (TERMIN)
                      </div>
                      <q-space />
                      <q-btn
                        flat
                        dense
                        icon="add"
                        label="Tambah Baris"
                        @click="addItemRow"
                        no-caps
                        class="text-weight-bold bg-indigo-9 rounded-12 q-px-sm"
                      />
                    </q-toolbar>
                    <q-markup-table
                      flat
                      separator="cell"
                      class="invoice-input-table"
                      wrap-cells="false"
                    >
                      <thead>
                        <tr class="bg-blue-grey-1 text-indigo-10">
                          <th width="40" class="text-center">NO</th>
                          <th class="text-left">URAIAN / DESKRIPSI PEKERJAAN</th>
                          <th width="200" class="text-right">NOMINAL (Rp)</th>
                          <th width="40"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, idx) in form.items" :key="idx" class="hover-row">
                          <td
                            class="text-center font-bold text-grey-6"
                            style="vertical-align: top; padding-top: 15px"
                          >
                            {{ idx + 1 }}
                          </td>
                          <td class="q-pa-sm">
                            <q-input
                              borderless
                              dense
                              v-model="item.judul"
                              placeholder="NAMA BARANG ATAU PEKERJAAN..."
                              class="text-weight-bold text-uppercase"
                            />
                            <q-input
                              borderless
                              dense
                              v-model="item.deskripsi"
                              placeholder="Deskripsi Tambahan (Opsional)..."
                              class="text-caption text-grey-7 q-mt-xs"
                              autogrow
                            />
                          </td>
                          <td style="vertical-align: top; padding-top: 10px">
                            <q-input
                              borderless
                              dense
                              type="number"
                              v-model.number="item.nominal"
                              input-class="text-right text-weight-bold text-indigo-10"
                            />
                          </td>
                          <td class="text-center" style="vertical-align: top; padding-top: 15px">
                            <q-btn
                              flat
                              round
                              icon="close"
                              color="grey-5"
                              size="xs"
                              @click="form.items.splice(idx, 1)"
                              class="hover-red-btn"
                            />
                          </td>
                        </tr>
                        <tr v-if="form.items.length === 0">
                          <td colspan="4" class="text-center q-pa-xl text-grey-5 italic">
                            <span v-if="invoiceType === 'kontrak'"
                              >Pilih Proyek di sebelah kiri untuk menarik data BOQ Kontrak secara
                              otomatis.</span
                            >
                            <span v-else
                              >Silakan klik Tambah Baris untuk memasukkan rincian tagihan.</span
                            >
                          </td>
                        </tr>
                      </tbody>
                      <tfoot class="bg-grey-1" v-if="form.items.length > 0">
                        <tr>
                          <td colspan="2" class="text-right text-weight-bold text-blue-grey-9">
                            SUB TOTAL (DPP)
                          </td>
                          <td class="text-right text-weight-bold text-indigo-10 text-subtitle2">
                            Rp {{ calculatedDPP.toLocaleString('id-ID') }}
                          </td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colspan="2" class="text-right text-weight-bold text-blue-grey-9">
                            <div class="row justify-end items-center no-wrap">
                              <span class="q-mr-sm">PPN (+)</span>
                              <q-input
                                dense
                                outlined
                                v-model.number="form.ppn_persen"
                                type="number"
                                style="width: 70px"
                                bg-color="white"
                                suffix="%"
                              />
                            </div>
                          </td>
                          <td class="text-right text-weight-bold text-grey-8">
                            Rp {{ calculatedPPN.toLocaleString('id-ID') }}
                          </td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colspan="2" class="text-right text-weight-bold text-blue-grey-9">
                            <div class="row justify-end items-center no-wrap">
                              <span class="q-mr-sm">PPh Pemotongan (-)</span>
                              <q-input
                                dense
                                outlined
                                v-model.number="form.pph_persen"
                                type="number"
                                style="width: 70px"
                                bg-color="white"
                                suffix="%"
                              />
                            </div>
                          </td>
                          <td class="text-right text-weight-bold text-negative">
                            - Rp {{ calculatedPPH.toLocaleString('id-ID') }}
                          </td>
                          <td></td>
                        </tr>
                        <tr class="bg-indigo-10 text-white">
                          <td
                            colspan="2"
                            class="text-right text-weight-black uppercase tracking-widest text-subtitle2"
                          >
                            TOTAL TAGIHAN / INVOICE
                          </td>
                          <td class="text-right text-weight-black text-h6">
                            Rp {{ calculatedGrandTotal.toLocaleString('id-ID') }}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </q-markup-table>
                  </q-card>

                  <q-card flat bordered class="rounded-20 bg-white shadow-1">
                    <q-card-section
                      class="bg-indigo-1 q-py-sm text-indigo-10 text-weight-bold flex items-center border-bottom"
                    >
                      <q-icon name="account_balance" class="q-mr-xs" size="sm" /> 4. INSTRUKSI
                      PEMBAYARAN
                    </q-card-section>
                    <q-card-section class="q-pa-lg">
                      <div class="row q-col-gutter-md q-mb-md">
                        <div class="col-12 col-md-6">
                          <div class="label-req q-mb-xs">Rekening Pembayaran Perusahaan</div>
                          <q-input
                            outlined
                            dense
                            v-model="form.rek_bank"
                            placeholder="Nama Bank"
                            bg-color="white"
                            class="q-mb-sm text-weight-bold"
                          />
                          <q-input
                            outlined
                            dense
                            v-model="form.rek_nomor"
                            placeholder="No Rekening"
                            bg-color="white"
                            class="text-weight-bold q-mb-sm text-primary"
                          />
                          <q-input
                            outlined
                            dense
                            v-model="form.rek_nama"
                            placeholder="Atas Nama"
                            bg-color="white"
                            class="uppercase text-weight-medium"
                          />
                        </div>
                        <div class="col-12 col-md-6">
                          <div class="label-req q-mb-xs">Catatan Tambahan (Opsional)</div>
                          <q-input
                            outlined
                            dense
                            type="textarea"
                            rows="4"
                            v-model="form.keterangan"
                            bg-color="white"
                            placeholder="Misal: Pembayaran harap ditransfer secara full amount."
                          />
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
         DIALOG PREVIEW INVOICE (PROFESSIONAL PDF LAYOUT - REVISI AKHIR 100% IDENTIK)
         ===================================================================================== -->
    <q-dialog v-model="showPreview" maximized transition-show="fade" transition-hide="fade">
      <q-card class="column no-wrap bg-grey-4">
        <q-toolbar class="bg-white text-indigo-10 q-py-sm no-print shadow-2 shrink">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-weight-bold uppercase tracking-widest font-11"
            >PREVIEW DOKUMEN INVOICE</q-toolbar-title
          >
          <q-space />
          <q-btn-group unelevated rounded class="shadow-2">
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
                <div class="text-weight-bold q-mb-sm" style="font-size: 11.5px">Hormat Kami,</div>

                <!-- TANDA TANGAN DARI APPROVAL -->
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
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()

// State
const rows = ref([])
const loading = ref(true)
const submitting = ref(false)
const searchQuery = ref('')
const showDialog = ref(false)
const showPreview = ref(false)
const isEditMode = ref(false)
const invoiceType = ref('manual') // 'manual' atau 'kontrak'
const selectedInv = ref(null)

const config = ref({
  kopUrl: '',
  nama_pt: 'PT. AGRA ABHINAYA PERKASA',
  alamat_pt: '',
  slogan_pt: '',
  direktur: 'Deni Purwanti',
})

// Master Data Lists (untuk Auto-Fill)
const masterCustomer = ref([])
const optCustomer = ref([])

const masterProyek = ref([])
const optProyek = ref([])

let unsubInvoice = null

// Form State
const formDefault = {
  id: null,
  nomor_invoice: '',
  tanggal: new Date().toISOString().substr(0, 10),
  jatuh_tempo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
  customer_ref: null,
  customer_nama: '',
  customer_alamat: '',
  proyek_ref: null,
  proyek_nama: '',
  spk_nomor: '',
  items: [],
  ppn_persen: 11, // Default PPN
  pph_persen: 0,
  rek_bank: 'BANK MANDIRI',
  rek_nomor: '1234567890',
  rek_nama: 'PT AGRA ABHINAYA PERKASA',
  keterangan: '',
  status: 'Draft',
}
const form = ref({ ...formDefault })

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
  { name: 'timeline', align: 'left', label: 'TIMELINE', field: 'tanggal', sortable: true },
  { name: 'nominal', align: 'right', label: 'TOTAL PIUTANG', field: 'grand_total', sortable: true },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]

// Generate No Invoice Otomatis
const generateNoInvoice = () => {
  const nextNum = rows.value.length + 1
  const padded = nextNum.toString().padStart(3, '0')
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][
    new Date().getMonth()
  ]
  const year = new Date().getFullYear()
  return `INV-${padded}/AAP/${roman}/${year}`
}

// Fetch Data
const fetchData = async () => {
  loading.value = true

  // Config Kop Surat
  const confSnap = await getDoc(doc(db, 'config', 'perusahaan'))
  if (confSnap.exists()) config.value = confSnap.data()

  // Data Customer (Klien)
  const snapCust = await getDocs(collection(db, 'customer'))
  masterCustomer.value = snapCust.docs.map((d) => ({ id: d.id, ...d.data() }))
  optCustomer.value = [...masterCustomer.value]

  // Data Proyek
  const snapProj = await getDocs(collection(db, 'proyek'))
  masterProyek.value = snapProj.docs.map((d) => ({
    id: d.id,
    nama: d.data().nama,
    konsumen: d.data().konsumen,
  }))
  optProyek.value = [...masterProyek.value]

  // Data Invoice Customer
  const qInv = query(collection(db, 'finance_invoice_customer'), orderBy('createdAt', 'desc'))
  unsubInvoice = onSnapshot(qInv, (snap) => {
    rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    loading.value = false
  })
}

// Filters & KPI
const filteredRows = computed(() => {
  if (!searchQuery.value) return rows.value
  const lower = searchQuery.value.toLowerCase()
  return rows.value.filter(
    (r) =>
      r.nomor_invoice?.toLowerCase().includes(lower) ||
      r.customer_nama?.toLowerCase().includes(lower),
  )
})

const countByStatus = (status) => rows.value.filter((r) => r.status === status).length
const totalPiutang = computed(() =>
  rows.value
    .filter((r) => r.status !== 'Lunas' && r.status !== 'Draft')
    .reduce((sum, r) => sum + (r.grand_total || 0), 0),
)
const isOverdue = (row) => {
  if (row.status === 'Lunas') return false
  const today = new Date().toISOString().substr(0, 10)
  return row.jatuh_tempo < today
}

// Filtering Function untuk Search di Dropdown
const filterCustomer = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    optCustomer.value = masterCustomer.value.filter(
      (v) => v.nama.toLowerCase().indexOf(needle) > -1,
    )
  })
}

const filterProyek = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    optProyek.value = masterProyek.value.filter((v) => v.nama.toLowerCase().indexOf(needle) > -1)
  })
}

// Auto Fills Handlers
const onCustomerSelect = (val) => {
  if (val) {
    form.value.customer_nama = val.nama || ''
    form.value.customer_alamat = val.alamat || val.alamat_perusahaan || ''
  } else {
    form.value.customer_nama = ''
    form.value.customer_alamat = ''
  }
}

const onProyekSelect = async (val) => {
  if (val) {
    form.value.proyek_nama = val.nama || ''
    form.value.spk_nomor = 'Mencari referensi SPK...'
    try {
      const spkSnap = await getDocs(
        query(collection(db, 'spk_customer'), where('projectId', '==', val.id)),
      )
      if (!spkSnap.empty) {
        const spkData = spkSnap.docs[0].data()
        form.value.spk_nomor = spkData.nomor_spk || spkData.nomor || ''

        // AUTO FILL BOQ KONTRAK
        if (invoiceType.value === 'kontrak') {
          form.value.items = [] // Reset
          if (spkData.groups) {
            spkData.groups.forEach((g) => {
              g.items.forEach((item) => {
                if (!item.is_header && item.volume * item.harga_satuan > 0) {
                  form.value.items.push({
                    judul: item.deskripsi,
                    deskripsi: '',
                    nominal: item.volume * item.harga_satuan,
                  })
                }
              })
            })
          }
          if (form.value.items.length === 0) {
            $q.notify({
              type: 'info',
              message: 'Tidak ada item BOQ dengan nilai > 0 di kontrak ini.',
            })
          } else {
            $q.notify({
              type: 'positive',
              message: `Berhasil menarik ${form.value.items.length} item dari BOQ Kontrak.`,
            })
          }
        }
      } else {
        form.value.spk_nomor = ''
        if (invoiceType.value === 'kontrak') form.value.items = []
      }
    } catch (e) {
      console.error(e)
      form.value.spk_nomor = ''
    }
  } else {
    form.value.proyek_nama = ''
    form.value.spk_nomor = ''
    if (invoiceType.value === 'kontrak') form.value.items = []
  }
}

// Dialogs
const openAddDialog = (type) => {
  invoiceType.value = type
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  form.value.nomor_invoice = generateNoInvoice()

  if (config.value.rek_bank) {
    form.value.rek_bank = config.value.rek_bank
    form.value.rek_nomor = config.value.rek_nomor
    form.value.rek_nama = config.value.rek_nama
  }
  showDialog.value = true
}

const openEditDialog = (row) => {
  isEditMode.value = true
  invoiceType.value = 'manual'
  form.value = { ...JSON.parse(JSON.stringify(row)) }
  // Compatibility check for old data without 'judul'
  form.value.items.forEach((it) => {
    if (!it.judul) it.judul = it.uraian || ''
    if (!it.deskripsi) it.deskripsi = ''
  })
  showDialog.value = true
}

const openPreviewDialog = (row) => {
  selectedInv.value = row
  showPreview.value = true
}

// Calculator
const addItemRow = () => form.value.items.push({ judul: '', deskripsi: '', nominal: 0 })
const calculatedDPP = computed(() =>
  form.value.items.reduce((sum, item) => sum + (item.nominal || 0), 0),
)
const calculatedPPN = computed(() => calculatedDPP.value * (form.value.ppn_persen / 100))
const calculatedPPH = computed(() => calculatedDPP.value * (form.value.pph_persen / 100))
const calculatedGrandTotal = computed(
  () => calculatedDPP.value + calculatedPPN.value - calculatedPPH.value,
)

// Save Action
const simpanInvoice = async () => {
  if (!form.value.customer_nama || form.value.items.length === 0) {
    return $q.notify({
      type: 'warning',
      message: 'Nama klien dan minimal 1 item tagihan wajib diisi!',
    })
  }

  $q.loading.show({ message: 'Menyimpan Invoice...' })
  submitting.value = true

  try {
    const payload = {
      nomor_invoice: form.value.nomor_invoice,
      tanggal: form.value.tanggal,
      jatuh_tempo: form.value.jatuh_tempo,
      customer_nama: form.value.customer_nama,
      customer_alamat: form.value.customer_alamat,
      proyek_nama: form.value.proyek_nama,
      spk_nomor: form.value.spk_nomor,
      items: form.value.items,
      nilai_dpp: calculatedDPP.value,
      ppn_persen: form.value.ppn_persen,
      ppn_nominal: calculatedPPN.value,
      pph_persen: form.value.pph_persen,
      pph_nominal: calculatedPPH.value,
      grand_total: calculatedGrandTotal.value,
      rek_bank: form.value.rek_bank,
      rek_nomor: form.value.rek_nomor,
      rek_nama: form.value.rek_nama,
      keterangan: form.value.keterangan,
      status: form.value.status || 'Draft',
      updatedAt: serverTimestamp(),
    }

    if (isEditMode.value) {
      if (form.value.approval_status === 'Rejected') {
        payload.approval_status = 'Pending'
      }
      await updateDoc(doc(db, 'finance_invoice_customer', form.value.id), payload)
    } else {
      payload.createdAt = serverTimestamp()
      payload.approval_status = 'Pending'
      payload.status = 'Draft'
      await addDoc(collection(db, 'finance_invoice_customer'), payload)
    }

    showDialog.value = false
    $q.notify({ type: 'positive', message: 'Invoice berhasil diterbitkan!' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan invoice.' })
  } finally {
    $q.loading.hide()
    submitting.value = false
  }
}

const confirmHapus = (row) => {
  $q.dialog({
    title: 'Hapus Invoice',
    message: `Hapus invoice ${row.nomor_invoice} secara permanen?`,
    cancel: true,
    ok: { color: 'negative', label: 'Hapus', unelevated: true },
  }).onOk(async () => {
    await deleteDoc(doc(db, 'finance_invoice_customer', row.id))
    $q.notify({ type: 'positive', message: 'Invoice terhapus' })
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
    case 'Terkirim':
      return { bg: 'orange-2', text: 'orange-9' }
    case 'Dibayar Sebagian':
      return { bg: 'blue-2', text: 'blue-9' }
    case 'Lunas':
      return { bg: 'green-2', text: 'green-9' }
    default:
      return { bg: 'grey-3', text: 'grey-8' }
  }
}

const getDisplayStatus = (row) => {
  // Jika invoice terkirim dan sudah mendapatkan Approval, tampilkan sebagai "Approved"
  if (row.status === 'Terkirim' && row.approval_status === 'Approved') {
    return { label: 'Approved', bg: 'green-2', text: 'green-9' }
  }
  // Jika ditolak, tampilkan label Ditolak/Rejected
  if (row.status === 'Draft' && row.approval_status === 'Rejected') {
    return { label: 'Rejected', bg: 'red-2', text: 'red-9' }
  }

  // Jika tidak, tampilkan status asli
  const base = getStatusColor(row.status)
  return { label: row.status, bg: base.bg, text: base.text }
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
  // Capitalize first letter of each word to match corporate style
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
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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

.invoice-input-table :deep(thead th) {
  font-weight: 800;
  font-size: 11px;
  padding: 12px;
}
.invoice-input-table :deep(tbody td) {
  border-bottom: 1px solid #f0f0f0;
  padding: 8px;
}
.hover-row:hover {
  background-color: #f8faff !important;
}

.search-input :deep(.q-field__control) {
  border-radius: 30px;
}

/* =======================================================================
   PDF PREVIEW STYLES (CLEAN & PROFESSIONAL BLUE INVOICE - REVISI IDENTIK)
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
