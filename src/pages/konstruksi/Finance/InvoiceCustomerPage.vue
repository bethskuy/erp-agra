<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-lg-lg font-pro page-wrapper" @click.self="handlePageClick">
    <!-- FLOATING CONSTRUCTION ANIMATION CONTAINER -->
    <div class="floating-hearts-container" aria-hidden="true">
      <span v-for="h in floatingHearts" :key="h.id" class="floating-heart" :style="h.style">{{
        h.icon
      }}</span>
    </div>

    <!-- CLICK CONSTRUCTION EFFECT -->
    <div class="click-hearts-container" aria-hidden="true">
      <span
        v-for="ch in clickHearts"
        :key="ch.id"
        class="click-heart"
        :style="{
          left: ch.x + 'px',
          top: ch.y + 'px',
          '--tx': ch.tx + 'px',
          '--ty': ch.ty + 'px',
          fontSize: ch.size + 'px',
        }"
        >{{ ch.icon }}</span
      >
    </div>

    <!-- =====================================================================================
         SCREEN 1: LOCK SCREEN JIKA TIDAK MEMILIKI AKSES LIHAT
         ===================================================================================== -->

    <template v-if="!canAction('lihat')">
      <div
        class="row flex-center q-pa-xl text-center font-pro animate-fade"
        style="min-height: 70vh"
      >
        <div
          class="col-12 col-sm-8 col-md-6 bg-white q-pa-xl rounded-20 shadow-premium border-teal-thin"
        >
          <q-avatar size="100px" color="teal-1" text-color="teal-10" icon="lock" class="q-mb-md" />
          <div class="text-h5 text-weight-bold text-blue-grey-10 q-mb-xs">Akses Terbatas</div>
          <div class="text-body2 text-grey-7 q-mb-lg leading-relaxed">
            Maaf, Anda tidak memiliki izin untuk melihat modul Invoice Customer. Silakan hubungi
            Administrator atau Super Admin untuk konfigurasi hak akses Anda.
          </div>
          <q-btn
            label="Kembali ke Beranda"
            color="teal-accent"
            icon="arrow_back"
            rounded
            unelevated
            no-caps
            @click="$router.push('/')"
            class="btn-teal-main"
          />
        </div>
      </div>
    </template>

    <!-- =====================================================================================
         SCREEN 2: KONTEN UTAMA JIKA AKSES OK
         ===================================================================================== -->

    <template v-else>
      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-xl animate-fade no-print">
        <div class="col-12 col-md-8">
          <div class="row items-center no-wrap">
            <div>
              <div class="text-h4 text-weight-bolder text-blue-grey-10 leading-tight">
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

        <div class="col-12 col-md-auto q-mt-md q-mt-md-none btn-new-invoice-wrapper">
          <q-btn-dropdown
            icon="add_circle"
            label="Buat Invoice Baru"
            unelevated
            rounded
            no-caps
            class="q-px-md q-py-sm btn-teal-main text-weight-bold btn-new-invoice"
          >
            <q-list class="bg-white rounded-borders">
              <q-item
                clickable
                v-close-popup
                @click="handleCreate('manual')"
                class="hover-teal-btn"
              >
                <q-item-section avatar>
                  <q-avatar color="teal-1" text-color="teal-10" icon="edit_document" size="sm" />
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
                @click="handleCreate('kontrak')"
                class="hover-teal-btn"
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

      <!-- SUMMARY CARDS / KPI FINANCE -->
      <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
        <!-- Total Invoice — Teal/Hijau -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="list-card rounded-20 card-teal-gradient text-white">
            <q-card-section class="row items-center no-wrap q-pa-md">
              <div class="col">
                <div
                  class="text-caption text-weight-bold tracking-widest uppercase font-10 q-mb-xs"
                  style="color: rgba(255, 255, 255, 0.75)"
                >
                  TOTAL INVOICE
                </div>
                <div class="text-h5 text-weight-black">{{ rows.length }}</div>
              </div>
              <div class="col-auto">
                <q-avatar
                  size="48px"
                  color="white"
                  text-color="teal-9"
                  icon="receipt_long"
                  class="shadow-2 rounded-12"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Outstanding — Orange -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="list-card rounded-20 card-orange-gradient text-white">
            <q-card-section class="row items-center no-wrap q-pa-md">
              <div class="col">
                <div
                  class="text-caption text-weight-bold tracking-widest uppercase font-10 q-mb-xs"
                  style="color: rgba(255, 255, 255, 0.75)"
                >
                  MENUNGGU REVIEW
                </div>
                <div class="text-h5 text-weight-black">
                  {{ countByStatus('Terkirim') }}
                </div>
              </div>
              <div class="col-auto">
                <q-avatar
                  size="48px"
                  color="white"
                  text-color="orange-9"
                  icon="pending_actions"
                  class="shadow-2 rounded-12"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Lunas — Teal Darker -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="list-card rounded-20 card-teal-dark-gradient text-white">
            <q-card-section class="row items-center no-wrap q-pa-md">
              <div class="col">
                <div
                  class="text-caption text-weight-bold tracking-widest uppercase font-10 q-mb-xs"
                  style="color: rgba(255, 255, 255, 0.75)"
                >
                  INVOICE DISETUJUI
                </div>
                <div class="text-h5 text-weight-black">
                  {{ countByStatus('Lunas') }}
                </div>
              </div>
              <div class="col-auto">
                <q-avatar
                  size="48px"
                  color="white"
                  text-color="teal-10"
                  icon="task_alt"
                  class="shadow-2 rounded-12"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Total Piutang — Red -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="list-card rounded-20 card-red-gradient text-white">
            <q-card-section class="row items-center no-wrap q-pa-md">
              <div class="col">
                <div
                  class="text-caption text-weight-bold tracking-widest uppercase font-10 q-mb-xs"
                  style="color: rgba(255, 255, 255, 0.75)"
                >
                  INVOICE DITOLAK
                </div>
                <div class="text-h6 text-weight-black">{{ countByApprovalStatus('Rejected') }}</div>
              </div>
              <div class="col-auto">
                <q-avatar
                  size="48px"
                  color="white"
                  text-color="red-9"
                  icon="cancel"
                  class="shadow-2 rounded-12"
                />
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
                placeholder="Cari No. Invoice atau Klien..."
                bg-color="white"
                class="search-input"
                color="teal-9"
              >
                <template v-slot:prepend><q-icon name="search" color="teal-9" /></template>
                <template v-slot:append v-if="searchQuery">
                  <q-icon name="close" @click="searchQuery = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </div>
            <q-space />
            <!-- BUTTON EXPORT TO EXCEL (TEMA INDIGO MODERN) -->
            <q-btn
              unelevated
              rounded
              no-caps
              color="indigo-9"
              icon="grid_on"
              label="Export to Excel"
              class="q-px-md q-py-xs btn-indigo-excel text-weight-bold"
              @click="exportToExcel"
            >
              <q-tooltip>Download Rekap Excel (Tema Blue Indigo)</q-tooltip>
            </q-btn>
            <q-btn flat round icon="refresh" color="teal-9" @click="fetchData" />
          </div>
        </q-card-section>
      </q-card>

      <!-- TABLE DATA INVOICES -->
      <q-card
        flat
        bordered
        class="rounded-20 shadow-sm overflow-hidden bg-white no-print border-teal-thin animate-fade-up"
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
              class="hover-bg transition-all cursor-pointer"
              @click="openPreviewDialog(props.row)"
            >
              <q-td key="invoice">
                <div class="row items-center no-wrap">
                  <q-avatar
                    size="36px"
                    color="teal-1"
                    text-color="teal-9"
                    icon="receipt_long"
                    class="q-mr-md shadow-sm rounded-12"
                  />
                  <div>
                    <div
                      class="text-weight-bold text-blue-grey-10 text-subtitle2 leading-none q-mb-xs flex items-center"
                    >
                      <span>{{ props.row.nomor_invoice }}</span>
                      <q-badge
                        v-if="
                          (props.row.approval_status === 'Approved' ||
                            props.row.approval_status === 'Rejected') &&
                          props.row.creator_read === false
                        "
                        color="positive"
                        class="q-ml-sm animate-bounce"
                        >BARU</q-badge
                      >
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
                <div class="text-weight-bolder text-teal-main text-subtitle2">
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
                    color="teal-9"
                    icon="visibility"
                    size="sm"
                    @click="openPreviewDialog(props.row)"
                    class="hover-teal-btn"
                  >
                    <q-tooltip>Lihat Invoice</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="blue-8"
                    icon="edit"
                    size="sm"
                    @click.stop="handleEdit(props.row)"
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
                    @click.stop="handleDelete(props.row)"
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
              <q-icon name="request_quote" size="64px" class="q-mb-md" color="teal-3" />
              <div class="text-h6 full-width text-center">Data invoice klien belum tersedia.</div>
            </div>
          </template>
        </q-table>
      </q-card>
    </template>

    <!-- =====================================================================================
         DIALOG ENTRY / EDIT INVOICE (MAXIMIZED)
         ===================================================================================== -->

    <q-dialog
      v-model="showDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <q-toolbar class="bg-white text-blue-grey-10 q-py-md shadow-2 shrink">
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
            label="SIMPAN INVOICE"
            rounded
            class="q-px-xl text-weight-bold shadow-3 btn-teal-main"
            @click="simpanInvoice"
            :loading="submitting"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-xl-10">
              <div class="row q-col-gutter-lg">
                <!-- KOLOM KIRI -->
                <div class="col-12 col-md-5">
                  <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1">
                    <q-card-section
                      class="bg-teal-section q-py-sm text-weight-bold flex items-center border-bottom"
                    >
                      <q-icon name="person_pin" class="q-mr-xs" size="sm" color="teal-9" />
                      <span class="text-teal-9">1. KEPADA YTH (KLIEN / CUSTOMER)</span>
                    </q-card-section>
                    <q-card-section class="q-pa-lg q-gutter-y-md">
                      <div>
                        <div class="label-req q-mb-xs text-teal-9">TARIK DATA MASTER KLIEN</div>
                        <q-select
                          outlined
                          dense
                          v-model="form.customer_ref"
                          :options="optCustomer"
                          option-label="nama"
                          :placeholder="form.customer_ref ? '' : 'Pilih Klien...'"
                          bg-color="blue-50"
                          clearable
                          use-input
                          @filter="filterCustomer"
                          @update:model-value="onCustomerSelect"
                          color="teal-9"
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
                          color="teal-9"
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
                          color="teal-9"
                        />
                      </div>
                    </q-card-section>
                  </q-card>

                  <q-card flat bordered class="rounded-20 bg-white shadow-1">
                    <q-card-section
                      class="bg-teal-section q-py-sm text-weight-bold flex items-center border-bottom"
                    >
                      <q-icon name="assignment" class="q-mr-xs" size="sm" color="teal-9" />
                      <span class="text-teal-9">2. REFERENSI DOKUMEN & PROYEK</span>
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
                            class="text-weight-bold text-teal-9"
                            color="teal-9"
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
                            color="teal-9"
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
                            color="teal-9"
                          />
                        </div>
                      </div>
                      <div>
                        <div
                          class="label-req q-mb-xs"
                          :class="invoiceType === 'kontrak' ? 'text-green-9' : 'text-teal-9'"
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
                          :placeholder="form.proyek_ref ? '' : 'Pilih Proyek...'"
                          bg-color="blue-50"
                          clearable
                          use-input
                          @filter="filterProyek"
                          @update:model-value="onProyekSelect"
                          color="teal-9"
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
                          color="teal-9"
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
                          color="teal-9"
                        />
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- KOLOM KANAN -->
                <div class="col-12 col-md-7">
                  <q-card
                    flat
                    bordered
                    class="rounded-20 bg-white shadow-1 overflow-hidden q-mb-lg border-teal-thin"
                  >
                    <q-card-section class="q-pa-none">
                      <q-toolbar class="toolbar-teal-gradient text-white q-py-sm">
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
                          class="text-weight-bold bg-white-10 rounded-12 q-px-sm"
                        />
                      </q-toolbar>

                      <q-markup-table
                        flat
                        separator="cell"
                        class="invoice-input-table"
                        wrap-cells="false"
                      >
                        <thead>
                          <tr class="bg-blue-grey-1 text-blue-grey-10">
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
                                class="text-weight-bold"
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
                                input-class="text-right text-weight-bold text-teal-9"
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
                            <td class="text-right text-weight-bold text-teal-9 text-subtitle2">
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
                                  color="teal-9"
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
                                  color="teal-9"
                                />
                              </div>
                            </td>
                            <td class="text-right text-weight-bold text-negative">
                              - Rp {{ calculatedPPH.toLocaleString('id-ID') }}
                            </td>
                            <td></td>
                          </tr>
                          <tr class="toolbar-teal-gradient text-white">
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
                    </q-card-section>
                  </q-card>

                  <q-card flat bordered class="rounded-20 bg-white shadow-1">
                    <q-card-section
                      class="bg-teal-section q-py-sm text-weight-bold flex items-center border-bottom"
                    >
                      <q-icon name="account_balance" class="q-mr-xs" size="sm" color="teal-9" />
                      <span class="text-teal-9">4. INSTRUKSI PEMBAYARAN</span>
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
                            color="teal-9"
                          />
                          <q-input
                            outlined
                            dense
                            v-model="form.rek_nomor"
                            placeholder="No Rekening"
                            bg-color="white"
                            class="text-weight-bold q-mb-sm text-teal-9"
                            color="teal-9"
                          />
                          <q-input
                            outlined
                            dense
                            v-model="form.rek_nama"
                            placeholder="Atas Nama"
                            bg-color="white"
                            class="uppercase text-weight-medium"
                            color="teal-9"
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
                            color="teal-9"
                          />
                        </div>
                      </div>

                      <!-- TANDA TANGAN -->
                      <q-separator class="q-my-md" />
                      <div class="label-req q-mb-sm text-teal-9">5. PENANDATANGAN DOKUMEN</div>
                      <div class="row q-col-gutter-md">
                        <div class="col-12 col-md-6">
                          <div class="label-req q-mb-xs">Nama Penandatangan *</div>
                          <q-input
                            outlined
                            dense
                            v-model="form.ttd_nama"
                            placeholder="Contoh: Deni Purwanti"
                            bg-color="white"
                            class="text-weight-bold"
                            color="teal-9"
                          >
                            <template v-slot:prepend>
                              <q-icon name="person" color="teal-9" />
                            </template>
                          </q-input>
                        </div>
                        <div class="col-12 col-md-6">
                          <div class="label-req q-mb-xs">Jabatan Penandatangan *</div>
                          <q-input
                            outlined
                            dense
                            v-model="form.ttd_jabatan"
                            placeholder="Contoh: Direktur Utama"
                            bg-color="white"
                            class="text-weight-medium"
                            color="teal-9"
                          >
                            <template v-slot:prepend>
                              <q-icon name="badge" color="teal-9" />
                            </template>
                          </q-input>
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
         DIALOG PREVIEW INVOICE (UNCHANGED - PROFESSIONAL PDF LAYOUT)
         ===================================================================================== -->

    <q-dialog v-model="showPreview" maximized transition-show="fade" transition-hide="fade">
      <q-card class="column no-wrap bg-grey-4">
        <q-toolbar class="bg-white text-blue-grey-10 q-py-sm no-print shadow-2 shrink">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-weight-bold uppercase tracking-widest font-11"
            >PREVIEW DOKUMEN INVOICE</q-toolbar-title
          >
          <q-space />
          <q-btn
            color="red-9"
            icon="picture_as_pdf"
            label="Download PDF"
            @click="exportToPDF"
            class="text-weight-bold shadow-2"
            unelevated
            rounded
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl flex flex-center preview-container">
          <!-- KERTAS PDF INVOICE — TIDAK DIUBAH -->
          <div id="invoice-pdf-area" class="letter-paper shadow-24" v-if="selectedInv">
            <!-- GARIS BIRU ATAS -->
            <div
              style="
                height: 6px;
                background-color: #2b579a;
                width: 100%;
                margin-bottom: 16px;
                border-radius: 2px;
              "
            ></div>
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
            <div
              style="height: 3px; background-color: #2b579a; width: 100%; margin-bottom: 25px"
            ></div>
            <div class="row q-col-gutter-lg q-mb-xl">
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
              <div class="col-5 text-right flex column items-end">
                <div
                  class="text-weight-900 text-italic"
                  style="color: #2b579a; font-size: 26px; letter-spacing: 2px; line-height: 1"
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
                </table>
              </div>
            </div>
            <table class="pdf-table full-width">
              <thead>
                <tr>
                  <th width="40" class="text-center">NO</th>
                  <th class="text-center">DESKRIPSI PEKERJAAN / TAGIHAN</th>
                  <th width="160" class="text-center">JUMLAH (IDR)</th>
                </tr>
              </thead>
              <tbody>
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
                    <div class="text-weight-bold">{{ item.judul || item.uraian }}</div>
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
                <tr>
                  <td class="border-top-none border-bottom-none" style="height: 15px"></td>
                  <td class="border-top-none border-bottom-none"></td>
                  <td class="border-top-none border-bottom-none"></td>
                </tr>
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
            <div
              class="bg-grey-2 q-pa-md rounded-borders text-blue-grey-9 q-mb-xl q-mt-md"
              style="font-size: 11px; border: 1px solid #e0e0e0"
            >
              <div class="text-weight-bold q-mb-xs">Terbilang :</div>
              <div># {{ terbilangRupiah(selectedInv.grand_total) }} Rupiah #</div>
            </div>
            <div class="row" style="margin-top: 24px">
              <!-- KIRI: Pembuat Dokumen -->
              <div style="width: 58%; padding-right: 20px; box-sizing: border-box">
                <div
                  style="
                    color: #2b579a;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.8px;
                    text-transform: uppercase;
                    margin-bottom: 6px;
                  "
                >
                  INSTRUKSI PEMBAYARAN
                </div>
                <div style="font-size: 10px; color: #777; margin-bottom: 8px">
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
                  style="font-size: 9.5px; color: #555; margin-top: 10px"
                  v-if="selectedInv.keterangan"
                >
                  <span style="font-weight: 700">Catatan Tambahan:</span><br />{{
                    selectedInv.keterangan
                  }}
                </div>
              </div>

              <!-- KANAN: Tanda Tangan -->
              <div
                style="
                  width: 42%;
                  box-sizing: border-box;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  text-align: center;
                "
              >
                <div
                  style="
                    color: #2b579a;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 48px;
                  "
                >
                  {{ config.nama_pt || 'PT AGRA ABHINAYA PERKASA' }}
                </div>

                <div
                  style="
                    height: 52px;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 6px;
                  "
                >
                  <img
                    v-if="selectedInv.signatureUrl"
                    :src="selectedInv.signatureUrl"
                    style="
                      max-height: 52px;
                      max-width: 180px;
                      object-fit: contain;
                      mix-blend-mode: multiply;
                    "
                  />
                </div>

                <div
                  style="
                    font-style: italic;
                    font-weight: 700;
                    font-size: 12px;
                    color: #1a1a1a;
                    border-bottom: 1.5px solid #1a1a1a;
                    padding-bottom: 3px;
                    min-width: 180px;
                    margin-bottom: 5px;
                  "
                >
                  {{ selectedInv.ttd_nama || 'Deni Purwanti' }}
                </div>

                <div style="font-size: 11px; color: #555; font-weight: 400">
                  {{ selectedInv.ttd_jabatan || 'Direktur Utama' }}
                </div>
              </div>
            </div>
            <div style="margin-top: 40px; border-bottom: 6px solid #2b579a"></div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
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
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const authStore = useAuthStore()

// ============================================================================
// STATE
// ============================================================================
const rows = ref([])
const loading = ref(true)
const submitting = ref(false)
const searchQuery = ref('')
const showDialog = ref(false)
const showPreview = ref(false)
const isEditMode = ref(false)
const currentInvoiceId = ref(null)
const invoiceType = ref('manual')
const selectedInv = ref(null)
const config = ref({
  kopUrl: '',
  nama_pt: 'PT. AGRA ABHINAYA PERKASA',
  alamat_pt: '',
  slogan_pt: '',
  direktur: 'Deni Purwanti',
})
const masterCustomer = ref([])
const optCustomer = ref([])
const masterProyek = ref([])
const optProyek = ref([])
const userData = ref(null)

let unsubInvoice = null
let unsubUser = null

// ============================================================================
// FLOATING CONSTRUCTION ANIMATION
// ============================================================================
const constructionIcons = ['🏗️', '🪛', '🔧', '⚙️', '🪚', '🔩', '🪜', '🏚️', '🧱', '⛏️', '🦺', '🪝']

const floatingHearts = ref([])
let heartIdCounter = 0

function spawnFloatingHeart() {
  const id = heartIdCounter++
  const left = Math.random() * 95 + '%'
  const duration = (4 + Math.random() * 5).toFixed(2) + 's'
  const delay = (Math.random() * 3).toFixed(2) + 's'
  const size = (10 + Math.random() * 14).toFixed(0) + 'px'
  const icon = constructionIcons[Math.floor(Math.random() * constructionIcons.length)]
  floatingHearts.value.push({
    id,
    icon,
    style: {
      left,
      fontSize: size,
      animationDuration: duration,
      animationDelay: delay,
    },
  })
  setTimeout(
    () => {
      floatingHearts.value = floatingHearts.value.filter((h) => h.id !== id)
    },
    (parseFloat(duration) + parseFloat(delay) + 0.5) * 1000,
  )
}

let floatingHeartInterval = null

// ============================================================================
// CLICK CONSTRUCTION EFFECT
// ============================================================================
const clickHearts = ref([])

function handlePageClick(e) {
  const count = 4 + Math.floor(Math.random() * 4)
  for (let i = 0; i < count; i++) {
    const id = heartIdCounter++
    const offsetX = (Math.random() - 0.5) * 60
    const offsetY = -(40 + Math.random() * 60)
    const size = 12 + Math.floor(Math.random() * 10)
    const icon = constructionIcons[Math.floor(Math.random() * constructionIcons.length)]
    const heart = {
      id,
      icon,
      x: e.clientX - 8,
      y: e.clientY - 8,
      tx: offsetX,
      ty: offsetY,
      size,
    }
    clickHearts.value.push(heart)
    setTimeout(() => {
      clickHearts.value = clickHearts.value.filter((h) => h.id !== id)
    }, 900)
  }
}

// ============================================================================
// NOTIFY HELPER
// ============================================================================
function notify(opts) {
  const defaults = {
    position: 'top-right',
    timeout: 3000,
    classes: 'notify-modern',
    html: false,
  }

  const typeConfig = {
    positive: {
      color: 'white',
      textColor: 'positive',
      icon: 'check_circle',
      badgeColor: 'positive',
    },
    negative: {
      color: 'white',
      textColor: 'negative',
      icon: 'error',
      badgeColor: 'negative',
    },
    warning: {
      color: 'white',
      textColor: 'warning',
      icon: 'warning',
      badgeColor: 'warning',
    },
    info: {
      color: 'white',
      textColor: 'info',
      icon: 'info',
      badgeColor: 'info',
    },
    teal: {
      color: 'white',
      textColor: 'teal-9',
      icon: 'favorite',
      badgeColor: 'teal-9',
    },
  }

  const type = opts.type || 'info'
  const tc = typeConfig[type] || typeConfig.info

  $q.notify({
    ...defaults,
    color: tc.color,
    textColor: tc.textColor,
    icon: opts.icon || tc.icon,
    message: opts.message,
    caption: opts.caption || '',
    multiLine: false,
    actions: opts.actions || [],
    badgeColor: tc.badgeColor,
    ...opts,
  })
}

// ============================================================================
// FORM DEFAULT
// ============================================================================
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
  ppn_persen: 11,
  pph_persen: 0,
  rek_bank: 'BANK MANDIRI',
  rek_nomor: '1234567890',
  rek_nama: 'PT AGRA ABHINAYA PERKASA',
  keterangan: '',
  status: 'Draft',
  ttd_nama: 'Deni Purwanti',
  ttd_jabatan: 'Direktur Utama',
}

const form = ref({ ...formDefault })

// ============================================================================
// PERMISSION CONTROL
// ============================================================================
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const menu = modulePerm.menus.find((m) => {
    const idLower = m.id.toLowerCase()
    return (
      (idLower.endsWith('_invoice') || idLower === '_konstruksi_invoice') &&
      !idLower.includes('approval')
    )
  })
  if (!menu) return false
  if (actionType === 'setuju') return menu.approve || false
  return menu[actionType] || false
}

const showPermissionDenied = () => {
  notify({
    type: 'negative',
    icon: 'lock',
    message: 'Akses Ditolak',
    caption: 'Anda tidak memiliki izin. Hubungi Super Admin.',
    timeout: 3500,
  })
}

// ============================================================================
// INTERCEPTS
// ============================================================================
const handleCreate = (type) => {
  if (canAction('buat')) {
    openAddDialog(type)
  } else {
    showPermissionDenied()
  }
}
const handleEdit = (row) => {
  if (canAction('ubah')) {
    openEditDialog(row)
  } else {
    showPermissionDenied()
  }
}
const handleDelete = (row) => {
  if (canAction('hapus')) {
    confirmHapus(row)
  } else {
    showPermissionDenied()
  }
}

// ============================================================================
// COLUMNS
// ============================================================================
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

const generateNoInvoice = () => {
  const nextNum = rows.value.length + 1
  const padded = nextNum.toString().padStart(3, '0')
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][
    new Date().getMonth()
  ]
  const year = new Date().getFullYear()
  return `INV-${padded}/AAP/${roman}/${year}`
}

// ============================================================================
// FETCH DATA
// ============================================================================
const fetchData = async () => {
  loading.value = true
  const confSnap = await getDoc(doc(db, 'config', 'perusahaan'))
  if (confSnap.exists()) config.value = confSnap.data()

  const snapCust = await getDocs(collection(db, 'customer'))
  masterCustomer.value = snapCust.docs.map((d) => ({ id: d.id, ...d.data() }))
  optCustomer.value = [...masterCustomer.value]

  const snapProj = await getDocs(collection(db, 'proyek'))
  masterProyek.value = snapProj.docs.map((d) => ({
    id: d.id,
    nama: d.data().nama,
    konsumen: d.data().konsumen,
  }))
  optProyek.value = [...masterProyek.value]

  const qInv = query(collection(db, 'finance_invoice_customer'), orderBy('createdAt', 'desc'))
  unsubInvoice = onSnapshot(qInv, (snap) => {
    rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    loading.value = false
  })
}

// ============================================================================
// COMPUTED
// ============================================================================
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
const countByApprovalStatus = (status) =>
  rows.value.filter((r) => r.approval_status === status).length

// eslint-disable-next-line no-unused-vars
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

// ============================================================================
// FILTER DROPDOWNS
// ============================================================================
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

// ============================================================================
// AUTO FILLS
// ============================================================================
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
        if (invoiceType.value === 'kontrak') {
          form.value.items = []
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
            notify({ type: 'info', message: 'Tidak ada item BOQ dengan nilai > 0 di kontrak ini.' })
          } else {
            notify({
              type: 'positive',
              message: `${form.value.items.length} item BOQ berhasil ditarik dari kontrak.`,
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

// ============================================================================
// DIALOGS
// ============================================================================
const openAddDialog = (type) => {
  invoiceType.value = type
  isEditMode.value = false
  currentInvoiceId.value = null
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
  currentInvoiceId.value = row.id
  invoiceType.value = 'manual'
  form.value = { ...JSON.parse(JSON.stringify(row)) }
  form.value.items.forEach((it) => {
    if (!it.judul) it.judul = it.uraian || ''
    if (!it.deskripsi) it.deskripsi = ''
  })
  showDialog.value = true
}

const openPreviewDialog = async (row) => {
  selectedInv.value = row
  showPreview.value = true
  if (
    (row.approval_status === 'Approved' || row.approval_status === 'Rejected') &&
    row.creator_read === false
  ) {
    try {
      await updateDoc(doc(db, 'finance_invoice_customer', row.id), { creator_read: true })
      const idx = rows.value.findIndex((item) => item.id === row.id)
      if (idx !== -1) {
        rows.value[idx].creator_read = true
      }
    } catch (e) {
      console.error('Gagal memperbarui status baca invoice:', e)
    }
  }
}

// ============================================================================
// CALCULATOR
// ============================================================================
const addItemRow = () => form.value.items.push({ judul: '', deskripsi: '', nominal: 0 })
const calculatedDPP = computed(() =>
  form.value.items.reduce((sum, item) => sum + (item.nominal || 0), 0),
)
const calculatedPPN = computed(() => calculatedDPP.value * (form.value.ppn_persen / 100))
const calculatedPPH = computed(() => calculatedDPP.value * (form.value.pph_persen / 100))
const calculatedGrandTotal = computed(
  () => calculatedDPP.value + calculatedPPN.value - calculatedPPH.value,
)

// ============================================================================
// SAVE
// ============================================================================
const simpanInvoice = async () => {
  if (!form.value.customer_nama || form.value.items.length === 0) {
    return notify({
      type: 'warning',
      message: 'Data belum lengkap!',
      caption: 'Nama klien dan minimal 1 item tagihan wajib diisi.',
    })
  }
  if (isEditMode.value) {
    if (!canAction('ubah')) {
      showPermissionDenied()
      return
    }
  } else {
    if (!canAction('buat')) {
      showPermissionDenied()
      return
    }
  }

  $q.loading.show({ message: 'Menyiapkan berkas pengiriman...' })
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
      ttd_nama: form.value.ttd_nama || '',
      ttd_jabatan: form.value.ttd_jabatan || '',
      updatedAt: serverTimestamp(),
      creator_id: authStore.user?.uid || authStore.user?.id || '',
      creator_read: false,
    }
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) payload[key] = ''
    })

    if (isEditMode.value && currentInvoiceId.value) {
      if (form.value.approval_status === 'Rejected') payload.approval_status = 'Pending'
      await updateDoc(doc(db, 'finance_invoice_customer', currentInvoiceId.value), payload)
    } else {
      payload.createdAt = serverTimestamp()
      payload.approval_status = 'Pending'
      payload.status = 'Draft'
      await addDoc(collection(db, 'finance_invoice_customer'), payload)
    }

    showDialog.value = false
    notify({
      type: 'positive',
      message: 'Invoice berhasil diterbitkan!',
      caption: 'Data telah tersimpan dengan aman.',
    })
  } catch (error) {
    console.error(error)
    notify({
      type: 'negative',
      message: 'Gagal menyimpan invoice.',
      caption: 'Silakan coba lagi atau hubungi admin.',
    })
  } finally {
    $q.loading.hide()
    submitting.value = false
  }
}

// ============================================================================
// APPROVAL
// ============================================================================
// eslint-disable-next-line no-unused-vars
const approveInvoice = async (row) => {
  if (!canAction('setuju')) {
    showPermissionDenied()
    return
  }
  $q.loading.show({ message: 'Menyetujui Invoice...' })
  try {
    await updateDoc(doc(db, 'finance_invoice_customer', row.id), {
      approval_status: 'Approved',
      status: 'Terkirim',
      updatedAt: serverTimestamp(),
    })
    selectedInv.value.approval_status = 'Approved'
    selectedInv.value.status = 'Terkirim'
    notify({
      type: 'positive',
      message: 'Invoice disetujui!',
      caption: 'Status invoice diperbarui menjadi Terkirim.',
    })
  } catch (e) {
    console.error(e)
    notify({ type: 'negative', message: 'Gagal menyetujui invoice.' })
  } finally {
    $q.loading.hide()
  }
}

// eslint-disable-next-line no-unused-vars
const unapproveInvoice = async (row) => {
  if (!canAction('setuju')) {
    showPermissionDenied()
    return
  }
  $q.loading.show({ message: 'Membatalkan persetujuan...' })
  try {
    await updateDoc(doc(db, 'finance_invoice_customer', row.id), {
      approval_status: 'Pending',
      status: 'Draft',
      updatedAt: serverTimestamp(),
    })
    selectedInv.value.approval_status = 'Pending'
    selectedInv.value.status = 'Draft'
    notify({
      type: 'warning',
      message: 'Persetujuan dibatalkan.',
      caption: 'Invoice dikembalikan ke status Draft.',
    })
  } catch (e) {
    console.error(e)
    notify({ type: 'negative', message: 'Gagal membatalkan persetujuan.' })
  } finally {
    $q.loading.hide()
  }
}

const confirmHapus = (row) => {
  if (!canAction('hapus')) {
    showPermissionDenied()
    return
  }
  $q.dialog({
    title: 'Hapus Invoice',
    message: `Hapus invoice <b>${row.nomor_invoice}</b> secara permanen? Tindakan ini tidak dapat dibatalkan.`,
    html: true,
    cancel: { label: 'Batal', flat: true, color: 'grey-7' },
    ok: { color: 'negative', label: 'Ya, Hapus', unelevated: true, rounded: true },
  }).onOk(async () => {
    await deleteDoc(doc(db, 'finance_invoice_customer', row.id))
    notify({ type: 'positive', message: 'Invoice berhasil dihapus.' })
  })
}

// ============================================================================
// UTILS
// ============================================================================
const formatDateIndo = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// eslint-disable-next-line no-unused-vars
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
      return { bg: 'teal-2', text: 'teal-9' }
    default:
      return { bg: 'grey-3', text: 'grey-8' }
  }
}

const getDisplayStatus = (row) => {
  if (row.status === 'Terkirim' && row.approval_status === 'Approved')
    return { label: 'Approved', bg: 'teal-2', text: 'teal-9' }
  if (row.status === 'Draft' && row.approval_status === 'Rejected')
    return { label: 'Rejected', bg: 'red-2', text: 'red-9' }
  const base = getStatusColor(row.status)
  return { label: row.status, bg: base.bg, text: base.text }
}

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

// ============================================================================
// PDF
// ============================================================================
// eslint-disable-next-line no-unused-vars
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

// ============================================================================
// DYNAMIC EXCELJS LOADER
// ============================================================================
const loadExcelJS = () => {
  return new Promise((resolve, reject) => {
    if (window.ExcelJS) {
      resolve(window.ExcelJS)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js'
    script.onload = () => resolve(window.ExcelJS)
    script.onerror = () => reject(new Error('Gagal mengunduh modul ExcelJS'))
    document.head.appendChild(script)
  })
}

// ============================================================================
// EXPORT TO EXCEL (PROFESSIONAL BLUE INDIGO THEME)
// ============================================================================
const exportToExcel = async () => {
  $q.loading.show({ message: 'Menyiapkan berkas Rekap Excel...' })
  try {
    const ExcelJS = await loadExcelJS()
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Rekap Invoice')

    worksheet.views = [{ showGridLines: true }]

    worksheet.mergeCells('B2:M2')
    const titleCell = worksheet.getCell('B2')
    titleCell.value = 'REKAPITULASI PIUTANG & INVOICE CUSTOMER'
    titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF1E3BB3' } }
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' }

    worksheet.mergeCells('B3:M3')
    const ptCell = worksheet.getCell('B3')
    ptCell.value = config.value.nama_pt || 'PT. AGRA ABHINAYA PERKASA'
    ptCell.font = {
      name: 'Segoe UI',
      size: 11,
      italic: true,
      bold: true,
      color: { argb: 'FF475569' },
    }
    ptCell.alignment = { vertical: 'middle', horizontal: 'left' }

    worksheet.mergeCells('B4:M4')
    const dateCell = worksheet.getCell('B4')
    const tglHariIni = formatDateIndo(new Date().toISOString().substr(0, 10))
    dateCell.value = `Tanggal Unduh: s.d. ${tglHariIni}`
    dateCell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF64748B' } }
    dateCell.alignment = { vertical: 'middle', horizontal: 'left' }

    worksheet.getRow(2).height = 25
    worksheet.getRow(3).height = 18
    worksheet.getRow(4).height = 18

    const headerRowIndex = 6
    const headers = [
      { name: 'NO', width: 6 },
      { name: 'NOMOR INVOICE', width: 25 },
      { name: 'TANGGAL INVOICE', width: 18 },
      { name: 'JATUH TEMPO', width: 18 },
      { name: 'NAMA KLIEN / CUSTOMER', width: 32 },
      { name: 'NAMA PROYEK', width: 32 },
      { name: 'NOMOR SPK / PO', width: 22 },
      { name: 'DPP / SUB TOTAL', width: 20 },
      { name: 'PPN NOMINAL', width: 16 },
      { name: 'PPH POTONGAN', width: 16 },
      { name: 'GRAND TOTAL', width: 22 },
      { name: 'STATUS', width: 16 },
    ]

    const headerRow = worksheet.getRow(headerRowIndex)
    headerRow.height = 30

    headers.forEach((h, colIdx) => {
      const colNum = colIdx + 2
      const cell = headerRow.getCell(colNum)
      cell.value = h.name
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3BB3' },
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF1E3BB3' } },
        left: { style: 'thin', color: { argb: 'FF1E3BB3' } },
        bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } },
        right: { style: 'thin', color: { argb: 'FF1E3BB3' } },
      }
    })

    let currentRowIndex = 7
    const dataRows = filteredRows.value

    dataRows.forEach((item, index) => {
      const row = worksheet.getRow(currentRowIndex)
      row.height = 24

      const isEven = index % 2 === 1
      const rowBgColor = isEven ? 'FFF4F7FF' : 'FFFFFFFF'

      const values = [
        index + 1,
        item.nomor_invoice || '-',
        formatDateIndo(item.tanggal),
        formatDateIndo(item.jatuh_tempo),
        item.customer_nama || '-',
        item.proyek_nama || '-',
        item.spk_nomor || '-',
        Number(item.nilai_dpp || 0),
        Number(item.ppn_nominal || 0),
        Number(item.pph_nominal || 0),
        Number(item.grand_total || 0),
        getDisplayStatus(item).label || item.status,
      ]

      values.forEach((val, colIdx) => {
        const colNum = colIdx + 2
        const cell = row.getCell(colNum)
        cell.value = val

        cell.font = { name: 'Segoe UI', size: 9.5 }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowBgColor },
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        }

        if (colNum === 2) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' }
        } else if ([3, 4, 5].includes(colNum)) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' }
        } else if ([6, 7, 8].includes(colNum)) {
          cell.alignment = { vertical: 'middle', horizontal: 'left' }
        } else if ([9, 10, 11, 12].includes(colNum)) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' }
          cell.numFormat = '"Rp"#,##0'
        } else if (colNum === 13) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' }
          const statusLabel = String(val).toUpperCase()
          let bgHex = 'FFF3F4F6'
          let textHex = 'FF374151'

          if (statusLabel === 'LUNAS' || statusLabel === 'APPROVED') {
            bgHex = 'FFE6F9F0'
            textHex = 'FF0E6245'
          } else if (statusLabel === 'TERKIRIM') {
            bgHex = 'FFFEF3C7'
            textHex = 'FF92400E'
          } else if (statusLabel === 'DRAFT' || statusLabel === 'PENDING') {
            bgHex = 'FFF3F4F6'
            textHex = 'FF4B5563'
          } else if (statusLabel === 'REJECTED' || statusLabel === 'JATUH TEMPO') {
            bgHex = 'FFFEE2E2'
            textHex = 'FF991B1B'
          }

          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: bgHex },
          }
          cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: textHex } }
        }
      })

      currentRowIndex++
    })

    const totalRowIndex = currentRowIndex
    const totalRow = worksheet.getRow(totalRowIndex)
    totalRow.height = 28

    worksheet.mergeCells(`B${totalRowIndex}:H${totalRowIndex}`)
    const totalLabelCell = totalRow.getCell(2)
    totalLabelCell.value = 'TOTAL REKAPITULASI'
    totalLabelCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF1E3BB3' } }
    totalLabelCell.alignment = { vertical: 'middle', horizontal: 'right' }

    for (let col = 2; col <= 13; col++) {
      const cell = totalRow.getCell(col)
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEBF0FF' },
      }
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF1E3BB3' } },
        left: { style: 'thin', color: { argb: 'FF1E3BB3' } },
        bottom: { style: 'medium', color: { argb: 'FF1E3BB3' } },
        right: { style: 'thin', color: { argb: 'FF1E3BB3' } },
      }
    }

    const startRow = 7
    const endRow = totalRowIndex - 1

    const sumColumns = [
      { colNum: 9, colLetter: 'I' },
      { colNum: 10, colLetter: 'J' },
      { colNum: 11, colLetter: 'K' },
      { colNum: 12, colLetter: 'L' },
    ]

    sumColumns.forEach((sc) => {
      const cell = totalRow.getCell(sc.colNum)
      cell.value = {
        formula: `=SUM(${sc.colLetter}${startRow}:${sc.colLetter}${endRow})`,
      }
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF1E3BB3' } }
      cell.alignment = { vertical: 'middle', horizontal: 'right' }
      cell.numFormat = '"Rp"#,##0'
    })

    headers.forEach((h, colIdx) => {
      const colNum = colIdx + 2
      const worksheetColumn = worksheet.getColumn(colNum)
      let maxLen = h.width || 12

      worksheetColumn.eachCell({ includeEmpty: true }, (cell) => {
        if (cell.row >= 6 && cell.value) {
          let textVal = ''
          if (typeof cell.value === 'object' && cell.value.formula) {
            textVal = 'Rp 999.999.999.999'
          } else {
            textVal = cell.value.toString()
          }
          if (textVal.length > maxLen) {
            maxLen = textVal.length
          }
        }
      })
      worksheetColumn.width = maxLen + 3
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const today = new Date().toISOString().split('T')[0]
    const fileName = `Rekap_Invoice_${today}.xlsx`

    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(link.href)

    notify({
      type: 'positive',
      message: 'Rekap Excel Berhasil Diunduh!',
      caption: `Disimpan dengan nama: ${fileName}`,
      icon: 'grid_on',
    })
  } catch (err) {
    console.error(err)
    notify({
      type: 'negative',
      message: 'Gagal mengekspor data ke Excel.',
      caption: err.message || 'Silakan coba lagi beberapa saat.',
    })
  } finally {
    $q.loading.hide()
  }
}

// ============================================================================
// LIFECYCLE
// ============================================================================
watch(
  () => authStore.user,
  (newUser) => {
    if (unsubUser) unsubUser()
    if (newUser?.email) {
      const qUser = query(collection(db, 'karyawan'), where('email', '==', newUser.email))
      unsubUser = onSnapshot(qUser, (snapshot) => {
        if (!snapshot.empty) userData.value = snapshot.docs[0].data()
      })
    }
  },
  { immediate: true },
)

onMounted(() => {
  fetchData()
  floatingHeartInterval = setInterval(spawnFloatingHeart, 1200)
  spawnFloatingHeart()
})

onUnmounted(() => {
  if (unsubInvoice) unsubInvoice()
  if (unsubUser) unsubUser()
  if (floatingHeartInterval) clearInterval(floatingHeartInterval)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

/* =============================================
   BASE & TYPOGRAPHY
   ============================================= */
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

/* =============================================
   TEAL THEME VARIABLES & UTILITIES
   ============================================= */
:root {
  --teal-main: #009688;
  --teal-light: #e0f2f1;
  --teal-soft: #b2dfdb;
  --teal-glow: rgba(0, 150, 136, 0.18);
}

.text-teal-main {
  color: #009688 !important;
}
.text-teal-9 {
  color: #00695c !important;
}
.border-teal-thin {
  border: 1px solid rgba(0, 150, 136, 0.18) !important;
}

/* =============================================
   TEAL BUTTON — MAIN CTA
   ============================================= */
.btn-teal-main {
  background: linear-gradient(135deg, #009688 0%, #26a69a 100%) !important;
  color: #fff !important;
  box-shadow: 0 6px 20px rgba(0, 150, 136, 0.3) !important;
  transition:
    box-shadow 0.25s ease,
    transform 0.2s ease !important;
}
.btn-teal-main:hover {
  box-shadow: 0 10px 28px rgba(0, 150, 136, 0.42) !important;
  transform: translateY(-1px) !important;
}

/* =============================================
   BLUE INDIGO EXCEL BUTTON
   ============================================= */
.btn-indigo-excel {
  background: linear-gradient(135deg, #1e3bb3 0%, #4f46e5 100%) !important;
  color: #fff !important;
  box-shadow: 0 4px 14px rgba(30, 59, 179, 0.25) !important;
  transition: all 0.3s ease !important;
}
.btn-indigo-excel:hover {
  box-shadow: 0 8px 22px rgba(30, 59, 179, 0.4) !important;
  transform: translateY(-1px) !important;
}

/* Full-width on mobile */
@media (max-width: 767px) {
  .btn-new-invoice-wrapper {
    width: 100%;
  }
  .btn-new-invoice {
    width: 100% !important;
    justify-content: center !important;
    border-radius: 14px !important;
  }
}

/* =============================================
   KPI CARD GRADIENTS
   ============================================= */

/* Card 1: Teal/Hijau — Total Invoice */
.card-teal-gradient {
  background: linear-gradient(135deg, #26a69a 0%, #009688 60%, #00796b 100%) !important;
}

/* Card 2: Orange — Menunggu Review */
.card-orange-gradient {
  background: linear-gradient(135deg, #ffa726 0%, #fb8c00 60%, #e65100 100%) !important;
}

/* Card 3: Teal Darker — Invoice Disetujui */
.card-teal-dark-gradient {
  background: linear-gradient(135deg, #00897b 0%, #00695c 60%, #004d40 100%) !important;
}

/* Card 4: Red — Invoice Ditolak */
.card-red-gradient {
  background: linear-gradient(135deg, #ef5350 0%, #e53935 60%, #b71c1c 100%) !important;
}

/* =============================================
   TEAL SECTION HEADER
   ============================================= */
.bg-teal-section {
  background-color: #e0f2f1 !important;
}

/* =============================================
   TABLE HEADER TEAL
   ============================================= */
.table-header-teal {
  background: linear-gradient(90deg, #009688 0%, #26a69a 100%) !important;
}
.finance-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
}

/* =============================================
   TOOLBAR TEAL GRADIENT (dialog)
   ============================================= */
.toolbar-teal-gradient {
  background: linear-gradient(90deg, #009688 0%, #26a69a 100%) !important;
}

/* =============================================
   CARDS & SHADOWS
   ============================================= */
.shadow-premium {
  box-shadow: 0 10px 30px rgba(0, 150, 136, 0.15);
}
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.list-card {
  border: none !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
.list-card:hover {
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  transform: translateY(-4px);
}

/* =============================================
   TABLE ROWS
   ============================================= */
.hover-bg:hover {
  background-color: rgba(0, 150, 136, 0.03) !important;
}
.hover-row:hover {
  background-color: #f0faf9 !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* =============================================
   HOVER BUTTONS
   ============================================= */
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

/* =============================================
   SEARCH INPUT
   ============================================= */
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.search-input :deep(.q-field__control:hover),
.search-input :deep(.q-field__control.q-field--focused .q-field__control-container) {
  border-color: #009688 !important;
}

/* =============================================
   ANIMATIONS
   ============================================= */
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

/* =============================================
   FLOATING HEARTS
   ============================================= */
.page-wrapper {
  position: relative;
  overflow: hidden;
}

.floating-hearts-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.floating-heart {
  position: absolute;
  bottom: -30px;
  opacity: 0;
  animation: floatUp linear forwards;
  will-change: transform, opacity;
  user-select: none;
}

@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(-10deg) scale(0.7);
    opacity: 0;
  }
  10% {
    opacity: 0.55;
  }
  60% {
    opacity: 0.35;
  }
  90% {
    opacity: 0.1;
  }
  100% {
    transform: translateY(-110vh) rotate(15deg) scale(1.1);
    opacity: 0;
  }
}

/* =============================================
   CLICK HEARTS
   ============================================= */
.click-hearts-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: visible;
}

.click-heart {
  position: fixed;
  opacity: 1;
  animation: clickHeartAnim 0.85s ease-out forwards;
  will-change: transform, opacity;
  user-select: none;
}

@keyframes clickHeartAnim {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  40% {
    transform: translate(var(--tx), var(--ty)) scale(1.3);
    opacity: 0.85;
  }
  100% {
    transform: translate(var(--tx), calc(var(--ty) - 30px)) scale(0.5);
    opacity: 0;
  }
}

/* =============================================
   BEAUTIFUL NOTIFICATIONS
   ============================================= */
:deep(.notify-modern) {
  border-radius: 16px !important;
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 150, 136, 0.08) !important;
  font-family: 'Plus Jakarta Sans', sans-serif !important;
  font-size: 14px !important;
  padding: 12px 18px !important;
  min-width: 280px !important;
  border-left: 4px solid #009688 !important;
}

:deep(.q-notification__message) {
  font-weight: 700 !important;
  font-size: 14px !important;
  line-height: 1.3 !important;
}

:deep(.q-notification__caption) {
  font-size: 12px !important;
  font-weight: 400 !important;
  opacity: 0.75 !important;
  margin-top: 2px !important;
}

:deep(.q-notification__icon) {
  font-size: 22px !important;
  margin-right: 10px !important;
}

/* =============================================
   LABELS
   ============================================= */
.label-req {
  font-size: 11px;
  font-weight: 800;
  color: #444;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* =============================================
   INVOICE INPUT TABLE
   ============================================= */
.invoice-input-table :deep(thead th) {
  font-weight: 800;
  font-size: 11px;
  padding: 12px;
}
.invoice-input-table :deep(tbody td) {
  border-bottom: 1px solid #f0f0f0;
  padding: 8px;
}

/* =============================================
   PDF PREVIEW STYLES (UNCHANGED)
   ============================================= */
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
