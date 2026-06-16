<template>
  <q-page class="bg-page q-pa-md font-pro relative-position">
    <div class="page-content-wrapper animate-fade">
      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-md no-print content-relative">
        <div class="col-12 q-mb-md q-mb-md-none">
          <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
            Manajemen Penawaran
            <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
              >Quotation & Commercial Bidding</span
            >
          </div>
          <div class="text-subtitle1 text-grey-7 q-mt-sm">
            Kelola seluruh dokumen penawaran harga kepada klien secara terstruktur dan profesional.
          </div>
        </div>
      </div>

      <!-- SEARCH & SUMMARY CARD -->
      <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print content-relative">
        <q-card-section class="q-py-md">
          <div class="row items-center justify-between q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model="filter"
                outlined
                dense
                rounded
                placeholder="Cari No. Referensi atau Nama Klien..."
                bg-color="white"
                class="search-input"
              >
                <template v-slot:prepend><q-icon name="search" color="brand-primary" /></template>
                <template v-slot:append v-if="filter">
                  <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </div>

            <div
              class="col-12 col-md-auto row items-center justify-end q-col-gutter-md q-mt-sm q-mt-md-none"
            >
              <div
                class="col-12 col-md-auto text-caption text-grey-6 text-weight-medium text-center text-md-right"
              >
                Total Dokumen:
                <span class="text-weight-bold text-brand-primary">{{ rows.length }} Record</span>
              </div>

              <!-- EXPORT DROPDOWN LIST -->
              <div class="col-12 col-sm-auto">
                <q-btn-dropdown
                  unelevated
                  color="white"
                  text-color="brand-primary"
                  icon="ios_share"
                  label="Export Data"
                  class="rounded-12 text-weight-bold shadow-2 full-width"
                >
                  <q-list class="bg-white rounded-borders q-py-sm" style="min-width: 200px">
                    <q-item clickable v-close-popup @click="exportListToPDF" class="hover-blue-btn">
                      <q-item-section avatar>
                        <q-avatar
                          color="red-1"
                          text-color="red-10"
                          icon="picture_as_pdf"
                          size="sm"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold">Download PDF</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator class="q-my-sm" />
                    <q-item
                      clickable
                      v-close-popup
                      @click="exportListToExcel"
                      class="hover-blue-btn"
                    >
                      <q-item-section avatar>
                        <q-avatar
                          color="green-1"
                          text-color="green-10"
                          icon="table_view"
                          size="sm"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold">Export Excel</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>

              <!-- BUAT PENAWARAN BARU -->
              <div class="col-12 col-sm-auto" v-if="canAction('buat')">
                <q-btn
                  color="brand-primary"
                  icon="add_circle"
                  label="Buat Penawaran Baru"
                  unelevated
                  rounded
                  no-caps
                  class="shadow-premium btn-hover text-weight-bold q-py-sm q-px-md full-width"
                  @click="openAddDialog"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- TABLE SECTION -->
      <q-card
        flat
        bordered
        class="rounded-20 shadow-sm overflow-hidden bg-white no-print content-relative"
      >
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          flat
          :loading="loading"
          :filter="filter"
          binary-state-sort
          class="penawaran-table"
        >
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-brand-primary text-white">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bold uppercase font-10"
                >{{ col.label }}</q-th
              >
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr
              :props="props"
              class="hover-bg transition-all cursor-pointer"
              @click="openPreview(props.row)"
            >
              <q-td key="nomor" class="text-weight-bolder text-brand-primary">
                <div class="row items-center q-gutter-x-sm">
                  <span>{{ props.row.nomor }}</span>
                  <q-badge
                    v-if="
                      props.row.marketing_read === false &&
                      (props.row.status === 'Approved' || props.row.status === 'Rejected')
                    "
                    color="pink-13"
                    class="animate-pulse q-px-xs"
                    >BARU</q-badge
                  >
                </div>
              </q-td>
              <q-td key="nama_customer">
                <div class="text-weight-bold text-blue-grey-9 uppercase">
                  {{ props.row.nama_customer }}
                </div>
                <div
                  v-if="props.row.status === 'Rejected' && props.row.alasan_reject"
                  class="text-negative text-caption row items-center q-gutter-xs"
                >
                  <q-icon name="info" size="12px" />
                  <span class="text-italic">{{ props.row.alasan_reject }}</span>
                </div>
              </q-td>
              <q-td key="total_harga" class="text-right text-weight-bold">
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
                  {{ props.row.status || 'Draft' }}
                </q-chip>
              </q-td>
              <q-td key="aksi" class="text-center" @click.stop>
                <div class="row justify-center q-gutter-xs">
                  <q-btn
                    v-if="
                      canAction('ubah') &&
                      props.row.is_revised &&
                      props.row.status !== 'Pending' &&
                      props.row.status !== 'Approved'
                    "
                    flat
                    round
                    color="orange-9"
                    icon="send"
                    size="sm"
                    @click="ajukanPenawaran(props.row)"
                  >
                    <q-tooltip>Ajukan Approval</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="props.row.status !== 'Approved' && canAction('ubah')"
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
                    v-if="canAction('hapus')"
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
        </q-table>
      </q-card>

      <!-- FORM ENTRY DIALOG -->
      <q-dialog
        v-model="showDialog"
        persistent
        maximized
        transition-show="slide-up"
        transition-hide="slide-down"
      >
        <q-card class="column bg-grey-2 relative-position">

          <q-toolbar class="bg-white text-brand-primary q-py-md shadow-2 shrink content-relative">
            <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
            <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest"
              >ENTRY PENAWARAN HARGA</q-toolbar-title
            >
            <q-btn
              unelevated
              color="brand-primary"
              label="SIMPAN PENAWARAN"
              :loading="submitting"
              @click="simpanPenawaran"
              rounded
              class="q-px-xl text-weight-bold shadow-3 text-white"
            />
          </q-toolbar>

          <q-card-section class="col scroll q-pa-lg q-pa-md-xl content-relative">
            <div class="row justify-center">
              <div class="col-12 col-lg-10">
                <!-- SECTION 1: HEADER & CUSTOMER -->
                <q-card
                  flat
                  bordered
                  class="rounded-12 q-mb-lg bg-white shadow-1 border-brand-thin"
                >
                  <q-card-section
                    class="bg-brand-light q-py-xs text-brand-primary text-weight-bold flex items-center border-bottom"
                  >
                    <q-icon name="description" class="q-mr-xs" size="xs" /> IDENTITAS DOKUMEN &
                    KLIEN
                  </q-card-section>
                  <q-card-section class="row q-col-gutter-lg q-pa-lg">
                    <div class="col-12 col-md-4">
                      <div class="label-req q-mb-xs">LOGO PENAWARAN</div>
                      <q-file
                        outlined
                        v-model="tempKopFile"
                        label="Upload Kop/Logo"
                        accept="image/*"
                        @update:model-value="uploadKopPermanen"
                        bg-color="white"
                      >
                        <template v-slot:prepend
                          ><q-icon name="cloud_upload" color="brand-primary"
                        /></template>
                      </q-file>
                    </div>
                    <div class="col-12 col-md-4">
                      <div class="label-req q-mb-xs">Nama Perusahaan (Pengirim)</div>
                      <q-input outlined dense v-model="form.nama_pt" bg-color="white" />
                    </div>
                    <div class="col-12 col-md-4">
                      <div class="label-req q-mb-xs">Nomor Referensi</div>
                      <q-input outlined dense v-model="form.nomor" bg-color="white" />
                    </div>
                    <div class="col-12 col-md-4">
                      <div class="label-req q-mb-xs">Pilih Customer / Klien *</div>
                      <q-select
                        outlined
                        dense
                        v-model="selectedCustomer"
                        :options="optCustomer"
                        option-label="nama"
                        placeholder="Cari Customer..."
                        @update:model-value="onCustomerChange"
                        bg-color="white"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <div class="label-req q-mb-xs">Attn (Ditujukan Kepada)</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.attn"
                        placeholder="Contoh: Bpk. John Doe / Tim Pengadaan"
                        bg-color="white"
                      />
                    </div>
                    <div class="col-12 col-md-2">
                      <div class="label-req q-mb-xs">Lokasi Terbit</div>
                      <q-input outlined dense v-model="form.kota" bg-color="white" />
                    </div>
                    <div class="col-12 col-md-2">
                      <div class="label-req q-mb-xs">Tanggal Dokumen</div>
                      <q-input outlined dense v-model="form.tanggal" type="date" bg-color="white" />
                    </div>
                    <div class="col-12">
                      <q-separator class="q-my-sm" />
                      <div class="label-req q-mb-xs text-brand-primary">
                        DOKUMEN ANALISA HARGA (REFERENSI APPROVAL)
                      </div>
                      <q-file
                        outlined
                        dense
                        v-model="analisaFile"
                        label="Upload Dokumen Analisa (PDF, Word, Excel)"
                        accept=".pdf, .doc, .docx, .xls, .xlsx"
                        bg-color="brand-light"
                      >
                        <template v-slot:prepend
                          ><q-icon name="attach_file" color="brand-primary"
                        /></template>
                        <template v-slot:append v-if="form.analisa_harga_url">
                          <q-icon name="check_circle" color="positive" />
                        </template>
                        <template v-slot:hint
                          >Dukung format PDF, Word, atau Excel sebagai acuan persetujuan
                          margin.</template
                        >
                      </q-file>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- SECTION 2: ITEMS TABLE -->
                <q-card
                  flat
                  bordered
                  class="rounded-12 q-mb-lg bg-white shadow-1 overflow-hidden border-brand-thin"
                >
                  <q-card-section class="bg-brand-light q-py-xs row items-center border-bottom">
                    <q-icon name="list_alt" class="q-mr-xs" color="brand-primary" size="xs" />
                    <div class="text-weight-bold text-brand-primary uppercase font-10">
                      RINCIAN PEKERJAAN & MATERIAL
                    </div>
                    <q-space />
                    <q-btn
                      flat
                      dense
                      icon="add_circle"
                      color="brand-primary"
                      label="Tambah Baris"
                      @click="addDetailItem"
                      no-caps
                      class="text-weight-bold"
                    />
                  </q-card-section>

                  <q-markup-table flat separator="cell" class="entry-table">
                    <thead>
                      <tr class="bg-brand-light text-brand-primary">
                        <th width="50">NO</th>
                        <th class="text-left">DESKRIPSI PEKERJAAN</th>
                        <th width="100">QTY</th>
                        <th width="100">UNIT</th>
                        <th width="180">HARGA SATUAN</th>
                        <th width="180">TOTAL AMOUNT</th>
                        <th width="50"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in form.items" :key="index">
                        <td class="text-center text-grey-6 font-bold">{{ index + 1 }}</td>
                        <td>
                          <q-input
                            v-model="item.deskripsi"
                            dense
                            borderless
                            placeholder="Tulis rincian..."
                          />
                        </td>
                        <td>
                          <q-input
                            v-model.number="item.qty"
                            type="number"
                            dense
                            borderless
                            @update:model-value="calcRow(index)"
                            input-class="text-center font-bold"
                          />
                        </td>
                        <td>
                          <q-input
                            v-model="item.satuan"
                            dense
                            borderless
                            input-class="text-center uppercase"
                          />
                        </td>
                        <td>
                          <q-input
                            v-model.number="item.harga"
                            type="number"
                            dense
                            borderless
                            @update:model-value="calcRow(index)"
                            prefix="Rp"
                            input-class="text-right"
                          />
                        </td>
                        <td class="text-right text-weight-bolder text-brand-primary bg-indigo-0">
                          Rp {{ (item.total || 0).toLocaleString() }}
                        </td>
                        <td class="text-center">
                          <q-btn
                            flat
                            round
                            color="negative"
                            icon="remove_circle"
                            size="xs"
                            @click="removeDetailItem(index)"
                            :disable="form.items.length === 1"
                          />
                        </td>
                      </tr>
                    </tbody>
                    <tfoot class="bg-grey-1">
                      <tr>
                        <td
                          colspan="5"
                          class="text-right text-weight-bold uppercase font-10 text-grey-7"
                        >
                          Subtotal Pekerjaan
                        </td>
                        <td class="text-right text-weight-bolder text-brand-primary">
                          Rp {{ subtotal.toLocaleString() }}
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <td colspan="4"></td>
                        <td
                          class="text-right text-weight-bold text-caption uppercase italic text-grey-7"
                        >
                          Tax Rate (%)
                        </td>
                        <td class="text-right">
                          <q-input
                            v-model.number="form.tax_rate"
                            type="number"
                            dense
                            borderless
                            input-class="text-right text-weight-bold"
                            suffix="%"
                            @update:model-value="updateGrandTotal"
                          />
                        </td>
                        <td></td>
                      </tr>
                      <tr>
                        <td colspan="4"></td>
                        <td>
                          <q-input
                            v-model="form.biaya_lain_label"
                            dense
                            borderless
                            input-class="text-right text-weight-bold uppercase text-caption"
                            placeholder="BIAYA LAIN"
                          />
                        </td>
                        <td class="text-right">
                          <q-input
                            v-model.number="form.biaya_lain"
                            type="number"
                            dense
                            borderless
                            input-class="text-right text-weight-bold text-brand-primary"
                            prefix="Rp"
                            @update:model-value="updateGrandTotal"
                          />
                        </td>
                        <td></td>
                      </tr>

                      <!-- ═══════════════════════════════════════════════════════
                         GRAND TOTAL ROW — tampilkan nilai asli (bisa desimal)
                         Tombol sihir 🪄 di samping untuk bulatkan ke ribuan
                         ═══════════════════════════════════════════════════════ -->
                      <tr class="bg-brand-primary text-white">
                        <td
                          colspan="5"
                          class="text-right text-weight-bolder text-h6 uppercase tracking-widest text-white"
                        >
                          Grand Total Amount
                        </td>
                        <td class="text-right text-h6 text-weight-bolder text-white">
                          Rp
                          {{
                            (form.total_harga || 0).toLocaleString('id-ID', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })
                          }}
                        </td>
                        <td class="text-center">
                          <!-- ✅ TOMBOL BULAT KE RIBUAN — tooltip menjelaskan cara kerjanya -->
                          <q-btn
                            flat
                            round
                            dense
                            color="white"
                            icon="auto_fix_high"
                            @click="roundToThousand"
                          >
                            <q-tooltip
                              class="bg-dark text-white text-caption"
                              anchor="top middle"
                              self="bottom middle"
                            >
                              <div class="text-weight-bold q-mb-xs">
                                🪄 Bulatkan ke Ribuan Terdekat
                              </div>
                              <div>Contoh: Rp 555.164.972,5 → Rp 555.164.000</div>
                            </q-tooltip>
                          </q-btn>
                        </td>
                      </tr>
                    </tfoot>
                  </q-markup-table>
                </q-card>

                <!-- SECTION 3: TERMS & SIGNATURE -->
                <div class="row q-col-gutter-lg">
                  <div class="col-12 col-md-6">
                    <q-card
                      flat
                      bordered
                      class="rounded-12 bg-white shadow-1 h-full border-brand-thin"
                    >
                      <q-card-section
                        class="bg-brand-light q-py-xs text-brand-primary text-weight-bold uppercase font-8 border-bottom"
                      >
                        <q-icon name="gavel" class="q-mr-xs" /> Syarat & Kondisi
                      </q-card-section>
                      <q-editor v-model="form.terms" min-height="15rem" flat />
                    </q-card>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-card
                      flat
                      bordered
                      class="rounded-12 bg-white shadow-1 h-full border-brand-thin"
                    >
                      <q-card-section
                        class="bg-brand-light q-py-xs text-brand-primary text-weight-bold uppercase font-8 border-bottom"
                      >
                        <q-icon name="draw" class="q-mr-xs" /> Pengesahan (TTD)
                      </q-card-section>
                      <q-card-section class="q-pa-md">
                        <q-editor v-model="form.closing" class="q-mb-md" flat bordered dense />
                        <div class="row q-col-gutter-sm q-mb-md">
                          <div class="col-12 col-sm-6">
                            <div class="label-req q-mb-xs">NAMA PENANDATANGAN</div>
                            <q-input outlined dense v-model="form.ttd_nama" bg-color="white" />
                          </div>
                          <div class="col-12 col-sm-6">
                            <div class="label-req q-mb-xs">JABATAN RESMI</div>
                            <q-input outlined dense v-model="form.ttd_jabatan" bg-color="white" />
                          </div>
                        </div>
                        <q-separator class="q-mb-md" />
                        <div class="row q-col-gutter-lg items-end">
                          <div class="col-12 col-sm-6">
                            <div class="label-req q-mb-xs text-brand-primary">
                              STEMPEL PERUSAHAAN
                            </div>
                            <q-file
                              outlined
                              dense
                              v-model="stempelFile"
                              label="Upload File Stempel"
                              accept="image/*"
                              bg-color="white"
                              class="q-mb-sm"
                            >
                              <template v-slot:prepend
                                ><q-icon name="local_post_office" color="brand-primary"
                              /></template>
                              <template v-slot:append v-if="form.stempelUrl">
                                <q-icon name="check_circle" color="positive" />
                              </template>
                            </q-file>
                            <q-card
                              v-if="form.stempelUrl"
                              flat
                              bordered
                              class="rounded-12 flex flex-center bg-grey-1 relative-position"
                              style="height: 100px"
                            >
                              <q-img
                                :src="form.stempelUrl"
                                style="max-height: 80px"
                                fit="contain"
                              />
                              <q-btn
                                flat
                                round
                                dense
                                icon="close"
                                color="red"
                                size="xs"
                                class="absolute-top-right q-ma-xs"
                                @click.stop="form.stempelUrl = ''"
                              />
                            </q-card>
                            <div
                              v-else
                              class="rounded-12 flex flex-center border-dashed bg-grey-2 text-grey-5 text-caption font-bold"
                              style="height: 100px"
                            >
                              Belum Ada Stempel
                            </div>
                          </div>
                          <div class="col-12 col-sm-6">
                            <div
                              class="text-caption text-bold text-brand-primary q-mb-xs uppercase font-8 flex items-center justify-between"
                            >
                              <span>Metode Sign</span>
                              <q-btn-dropdown
                                flat
                                dense
                                color="brand-primary"
                                icon="settings"
                                label="Metode"
                                no-caps
                                size="sm"
                                class="rounded-borders"
                              >
                                <q-list class="q-pa-sm" style="min-width: 180px">
                                  <q-item clickable v-ripple v-close-popup @click="showPad = true">
                                    <q-item-section avatar
                                      ><q-icon name="gesture" color="brand-primary"
                                    /></q-item-section>
                                    <q-item-section>Gurat Manual</q-item-section>
                                  </q-item>
                                  <q-item clickable v-ripple class="relative-position">
                                    <q-item-section avatar
                                      ><q-icon name="upload" color="brand-primary"
                                    /></q-item-section>
                                    <q-item-section>Upload Gambar</q-item-section>
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
                            </div>
                            <q-card
                              flat
                              bordered
                              class="rounded-12 flex flex-center bg-grey-1 cursor-pointer hover-shadow transition-all relative-position"
                              style="height: 100px"
                              @click="showPad = true"
                            >
                              <q-img
                                v-if="form.signatureUrl"
                                :src="form.signatureUrl"
                                style="max-height: 80px"
                                fit="contain"
                              />
                              <div v-else class="column items-center text-grey-6">
                                <q-icon name="draw" size="md" />
                                <div class="text-caption font-bold uppercase font-8">
                                  Belum Tanda Tangan
                                </div>
                              </div>
                              <q-btn
                                v-if="form.signatureUrl"
                                flat
                                round
                                dense
                                icon="close"
                                color="red"
                                size="xs"
                                class="absolute-top-right q-ma-xs"
                                @click.stop="form.signatureUrl = ''"
                              />
                            </q-card>
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

      <!-- SIGNATURE PAD DIALOG -->
      <q-dialog v-model="showPad" persistent backdrop-filter="blur(4px)">
        <q-card style="width: 850px; max-width: 95vw" class="rounded-20 shadow-24">
          <q-card-section class="row items-center q-pb-none bg-brand-primary text-white q-pa-md">
            <div class="text-h6 text-weight-bold uppercase font-10">Tanda Tangan Pengesahan</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section class="q-pa-lg">
            <div class="signature-pad-wrapper shadow-inner bg-white border-dashed">
              <canvas ref="signatureCanvas" class="signature-canvas"></canvas>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md bg-grey-1">
            <q-btn flat label="Reset" color="grey-7" @click="clearPad" rounded />
            <q-btn
              unelevated
              label="Simpan & Pasang"
              color="brand-primary"
              @click="saveManualSignature"
              rounded
              class="q-px-xl text-weight-bold text-white"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- PREVIEW DIALOG -->
      <q-dialog v-model="showPreview" maximized transition-show="fade" transition-hide="fade">
        <q-card class="column no-wrap bg-grey-4 relative-position">
          <q-toolbar
            class="bg-white text-indigo-10 q-py-md no-print shadow-2 shrink content-relative"
          >
            <q-btn flat round dense icon="arrow_back" v-close-popup color="grey-7" />
            <q-toolbar-title class="text-weight-bold text-indigo-10"
              >PREVIEW DOKUMEN RESMI</q-toolbar-title
            >
            <q-btn-group unelevated rounded class="shadow-2">
              <q-btn
                v-if="selectedData?.analisa_harga_url"
                color="indigo-10"
                icon="description"
                label="Lihat Analisa"
                class="q-px-md text-white"
                @click="openAnalisaLink(selectedData.analisa_harga_url)"
              >
                <q-tooltip>Unduh/Buka Berkas Analisa Pendukung (PDF/Word/Excel)</q-tooltip>
              </q-btn>
              <q-btn
                color="red-9"
                icon="picture_as_pdf"
                label="Export PDF"
                @click="exportToPDF"
                class="q-px-md text-weight-bold text-white"
              />
            </q-btn-group>
          </q-toolbar>
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
                  <div
                    v-if="selectedData.attn"
                    class="text-body2 text-weight-medium q-mt-xs text-grey-9"
                  >
                    Attn: {{ selectedData.attn }}
                  </div>
                </div>
                <div class="col-5 text-right">
                  <div class="quotation-title-pro uppercase">QUOTATION</div>
                  <div class="quotation-no-pro text-indigo-10 font-bold">
                    {{ selectedData.nomor }}
                  </div>
                  <div class="text-date-pro">
                    {{ selectedData.kota }}, {{ formatIndoDate(selectedData.tanggal) }}
                  </div>
                </div>
              </div>
              <!-- Introduction -->
              <div
                class="text-body2 q-mb-md text-left leading-relaxed"
                v-html="selectedData.introduction"
              ></div>
              <!-- Table -->
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
              <!-- Closing -->
              <div
                class="text-closing-final text-left q-mt-lg text-body2 leading-relaxed text-grey-9"
                v-html="selectedData.closing"
              ></div>
              <!-- Signature -->
              <div class="signature-container text-left q-mt-xl">
                <div class="row q-mt-lg justify-end">
                  <div class="col-6 text-right">
                    <div class="q-mb-xs text-body2 uppercase">Hormat Kami,</div>
                    <div class="text-weight-bold text-indigo-10 uppercase q-mb-xs">
                      {{ selectedData.nama_pt }}
                    </div>
                    <div class="final-sign-space">
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
                      <div
                        v-if="!selectedData.signatureUrl"
                        class="text-caption text-grey-4 italic w-full text-center"
                        style="padding-top: 30px"
                      >
                        Belum ditandatangani
                      </div>
                    </div>
                    <div
                      class="text-signer-final text-weight-bolder underline uppercase text-indigo-10"
                    >
                      {{ selectedData.ttd_nama }}
                    </div>
                    <div class="text-role-final uppercase text-grey-8 text-caption font-bold block">
                      {{ selectedData.ttd_jabatan }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- HIDDEN HTML TEMPLATE FOR PDF LIST EXPORT -->
      <div style="display: none">
        <div id="list-print-area" class="report-paper">
          <div class="report-header">
            <div class="report-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div>
              <h1 class="report-title">LAPORAN REKAPITULASI PENAWARAN (QUOTATION)</h1>
              <div class="report-subtitle">
                Diekspor pada: {{ formatIndoDate(new Date()) }},
                {{ new Date().toLocaleTimeString('id-ID') }}
              </div>
            </div>
          </div>
          <table class="report-table">
            <thead>
              <tr>
                <th style="width: 40px; text-align: center">NO</th>
                <th style="text-align: left">KODE REFERENSI</th>
                <th style="text-align: left">KLIEN / CUSTOMER</th>
                <th style="text-align: left">LOKASI & TANGGAL</th>
                <th style="text-align: right">GRAND TOTAL</th>
                <th style="text-align: center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in rows" :key="row.id">
                <td style="text-align: center">{{ idx + 1 }}</td>
                <td style="font-weight: 800">{{ row.nomor }}</td>
                <td style="text-transform: uppercase">{{ row.nama_customer }}</td>
                <td>
                  <div style="color: #444">Loc: {{ row.kota }}</div>
                  <div style="color: #d32f2f; font-size: 10px">
                    Dt: {{ formatIndoDate(row.tanggal) }}
                  </div>
                </td>
                <td style="text-align: right; font-weight: 800">
                  Rp {{ Math.round(row.total_harga || 0).toLocaleString() }}
                </td>
                <td style="text-align: center; text-transform: uppercase">
                  {{ row.status || 'Draft' }}
                </td>
              </tr>
              <tr class="report-total-row">
                <td colspan="4">TOTAL NILAI PENAWARAN (PADA LAYAR)</td>
                <td style="color: #1a237e">
                  Rp
                  {{
                    Math.round(rows.reduce((a, b) => a + (b.total_harga || 0), 0)).toLocaleString()
                  }}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="q-py-xl"></div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { db, storage } from 'src/boot/firebase'
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'
import html2canvas from 'html2canvas'
import SignaturePad from 'signature_pad'

const $q = useQuasar()
const authStore = useAuthStore()

const rows = ref([])
const loading = ref(true)
const submitting = ref(false)
const showDialog = ref(false)
const isEditMode = ref(false)
const filter = ref('')
const showPreview = ref(false)
const selectedData = ref(null)
const optCustomer = ref([])
const selectedCustomer = ref(null)
const tempKopFile = ref(null)
const analisaFile = ref(null)
const config = ref({ kopUrl: '' })
const userData = ref(null)
let unsubscribeUser = null

// Signature & Stempel
const showPad = ref(false)
const signatureCanvas = ref(null)
const tempSignFile = ref(null)
const stempelFile = ref(null)
let signaturePad = null

// Form default
const formDefault = {
  nomor: '',
  kota: 'Bekasi',
  tanggal: new Date().toISOString().substr(0, 10),
  nama_pt: 'PT AGRA ABHINAYA PERKASA',
  tagline_pt: 'General Construction and General Supply',
  customer_id: '',
  nama_customer: '',
  attn: '',
  introduction: 'Bersama surat ini kami mengajukan penawaran harga sebagai berikut:',
  items: [{ deskripsi: '', qty: 1, satuan: 'ls', harga: 0, total: 0 }],
  terms: '<ul><li>Uang Muka : 30%</li><li>Berlaku 14 Hari</li></ul>',
  closing: 'Demikian penawaran ini kami sampaikan, terima kasih.',
  ttd_nama: '',
  ttd_jabatan: '',
  status: 'Draft',
  is_revised: true,
  tax_rate: 0,
  biaya_lain: 0,
  biaya_lain_label: 'BIAYA LAIN',
  total_harga: 0,
  analisa_harga_url: '',
  signatureUrl: '',
  stempelUrl: '',
  marketing_read: true,
}

const form = ref({ ...formDefault })

// ── COMPUTED ────────────────────────────────────────────────────────────────
const subtotal = computed(() => form.value.items.reduce((sum, item) => sum + (item.total || 0), 0))

// ── KALKULASI GRAND TOTAL (nilai asli, bisa desimal) ────────────────────────
const updateGrandTotal = () => {
  const taxAmount = subtotal.value * ((form.value.tax_rate || 0) / 100)
  form.value.total_harga = subtotal.value + taxAmount + (form.value.biaya_lain || 0)
}

// ============================================================================
// ✅ FUNGSI BULATKAN KE RIBUAN TERDEKAT (KE BAWAH)
//
// Logika: Math.floor(x / 1000) * 1000
//
// Contoh:
//   555.164.972,5  →  Math.floor(555164972.5 / 1000) * 1000
//                  =  Math.floor(555164.9725) * 1000
//                  =  555164 * 1000
//                  =  555.164.000  ✅
//
//   123.456.789    →  123.456.000  ✅
//   99.999,99      →  99.000       ✅
// ============================================================================
const roundToThousand = () => {
  const current = form.value.total_harga || 0
  const rounded = Math.floor(current / 1000) * 1000

  // Simpan nilai lama untuk ditampilkan di notifikasi
  const formattedBefore = current.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  const formattedAfter = rounded.toLocaleString('id-ID')

  form.value.total_harga = rounded

  $q.notify({
    type: 'positive',
    icon: 'auto_fix_high',
    message: 'Grand Total Dibulatkan!',
    caption: `Rp ${formattedBefore}  →  Rp ${formattedAfter}`,
    position: 'top',
    timeout: 4000,
    html: false,
  })
}

// ── COLUMNS ──────────────────────────────────────────────────────────────────
const columns = [
  { name: 'nomor', align: 'left', label: 'REFERENCE NO', field: 'nomor', sortable: true },
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
  { name: 'aksi', align: 'center', label: 'ACTIONS', field: 'aksi' },
]

const getStatusColor = (status) => {
  switch (status) {
    case 'Approved':
      return 'positive'
    case 'Rejected':
      return 'negative'
    case 'Pending':
      return 'orange-8'
    default:
      return 'blue-grey-6'
  }
}

// ── PERMISSION ───────────────────────────────────────────────────────────────
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (userData.value?.is_super_admin === true) return true
  const jabatan = (userData.value?.jabatan || '').toLowerCase()
  if (['super admin', 'superadmin', 'direktur'].includes(jabatan)) return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const menu = modulePerm.menus.find((m) => m.id === '_konstruksi_marketing_penawaran')
  return menu ? menu[actionType] || false : false
}

// ── FETCH DATA ────────────────────────────────────────────────────────────────
const fetchData = async () => {
  loading.value = true
  try {
    const configSnap = await getDoc(doc(db, 'config', 'perusahaan'))
    if (configSnap.exists()) config.value = configSnap.data()

    let isInitialLoad = true
    onSnapshot(collection(db, 'penawaran'), (snap) => {
      if (!isInitialLoad) {
        snap.docChanges().forEach((change) => {
          if (change.type === 'modified') {
            const newData = change.doc.data()
            const oldData = rows.value.find((r) => r.id === change.doc.id)
            if (oldData && oldData.status !== newData.status) {
              if (newData.status === 'Approved') {
                $q.notify({
                  type: 'positive',
                  icon: 'verified',
                  message: 'PENAWARAN APPROVED!',
                  caption: `Dokumen No. ${newData.nomor} telah disetujui.`,
                  position: 'top-right',
                  timeout: 6000,
                  classes: 'shadow-10',
                })
              } else if (newData.status === 'Rejected') {
                $q.notify({
                  type: 'negative',
                  icon: 'cancel',
                  message: 'PENAWARAN DITOLAK!',
                  caption: `Dokumen No. ${newData.nomor} dikembalikan. Alasan: ${newData.alasan_reject || 'Tidak ada alasan.'}`,
                  position: 'top-right',
                  timeout: 8000,
                  classes: 'shadow-10',
                })
              }
            }
          }
        })
      }
      rows.value = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))
      isInitialLoad = false
      loading.value = false
    })

    const snapC = await getDocs(collection(db, 'customer'))
    optCustomer.value = snapC.docs.map((d) => ({ id: d.id, nama: d.data().nama }))
  } catch (e) {
    console.error(e)
    loading.value = false
  }
}

// ── LIFECYCLE ─────────────────────────────────────────────────────────────────
onMounted(() => {
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubscribeUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) {
        userData.value = snapshot.docs[0].data()
        formDefault.ttd_nama = userData.value.nama || ''
        formDefault.ttd_jabatan = userData.value.jabatan || ''
      }
    })
  }
  fetchData()
})
onUnmounted(() => {
  if (unsubscribeUser) unsubscribeUser()
})

// ── SIGNATURE PAD ─────────────────────────────────────────────────────────────
watch(showPad, async (v) => {
  if (v) {
    await nextTick()
    const c = signatureCanvas.value
    const r = Math.max(window.devicePixelRatio || 1, 1)
    c.width = c.offsetWidth * r
    c.height = c.offsetHeight * r
    c.getContext('2d').scale(r, r)
    signaturePad = new SignaturePad(c, { penColor: '#000000', minWidth: 3.5, maxWidth: 8.0 })
  }
})
const clearPad = () => signaturePad?.clear()
const saveManualSignature = () => {
  if (!signaturePad || signaturePad.isEmpty()) return
  form.value.signatureUrl = signaturePad.toDataURL()
  showPad.value = false
}

// ── IMAGE HELPERS ─────────────────────────────────────────────────────────────
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
const uploadSignatureFile = (file) => {
  if (!file) return
  resizeImageToBase64(file, 400).then((base64) => {
    form.value.signatureUrl = base64
    $q.notify({ type: 'positive', message: 'Tanda tangan berhasil diunggah' })
  })
}

// ── ITEM CALCULATION ──────────────────────────────────────────────────────────
const calcRow = (idx) => {
  const it = form.value.items[idx]
  it.total = (it.qty || 0) * (it.harga || 0)
  updateGrandTotal()
}

// ── SIMPAN ────────────────────────────────────────────────────────────────────
const simpanPenawaran = async () => {
  if (!form.value.customer_id)
    return $q.notify({ message: 'Pilih Customer!', color: 'negative', position: 'top' })

  // Selalu simpan grand total sebagai integer bulat ke ribuan
  form.value.total_harga = Math.floor((form.value.total_harga || 0) / 1000) * 1000

  submitting.value = true
  try {
    if (analisaFile.value) {
      const fileName = `analysis_${Date.now()}_${analisaFile.value.name}`
      const aRef = storageRef(storage, `quotations/analysis/${fileName}`)
      const uploadSnap = await uploadBytes(aRef, analisaFile.value)
      form.value.analisa_harga_url = await getDownloadURL(uploadSnap.ref)
    }
    if (stempelFile.value) {
      form.value.stempelUrl = await resizeImageToBase64(stempelFile.value, 300)
    }

    const payload = {
      ...form.value,
      updatedAt: serverTimestamp(),
      is_revised: true,
      status: form.value.status || 'Draft',
      alasan_reject: '',
      marketing_read: true,
    }
    const docId = payload.id
    delete payload.id

    if (isEditMode.value && docId) await updateDoc(doc(db, 'penawaran', docId), payload)
    else {
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'penawaran'), payload)
    }

    showDialog.value = false
    analisaFile.value = null
    stempelFile.value = null
    tempSignFile.value = null

    $q.notify({
      html: true,
      message:
        '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Sinkronisasi Berhasil!</div><div class="text-caption q-mt-xs" style="opacity:0.85">Data Penawaran Berhasil Disimpan!</div>',
      color: 'positive',
      icon: 'task_alt',
      position: 'top',
      timeout: 4000,
      progress: true,
      classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
      actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
    })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan data: ' + e.message })
  }
  submitting.value = false
}

// ── AJUKAN ────────────────────────────────────────────────────────────────────
const ajukanPenawaran = (row) => {
  $q.dialog({
    title:
      '<div class="text-h5 text-weight-bolder text-brand-primary q-mb-sm">Konfirmasi Pengajuan</div>',
    message: 'Ajukan penawaran ini ke pimpinan untuk diperiksa (Pending)?',
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
      label: 'Ya, Ajukan',
      color: 'teal-9',
      textColor: 'white',
      unelevated: true,
      rounded: true,
      class: 'q-px-lg text-weight-bold text-uppercase shadow-2',
    },
    class: 'rounded-20 q-pa-md shadow-premium bg-white',
    persistent: true,
  }).onOk(async () => {
    await updateDoc(doc(db, 'penawaran', row.id), {
      status: 'Pending',
      is_revised: false,
      updatedAt: serverTimestamp(),
    })
    $q.notify({
      html: true,
      message:
        '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Pengajuan Sukses!</div><div class="text-caption q-mt-xs" style="opacity:0.85">Penawaran sedang menunggu persetujuan pimpinan.</div>',
      color: 'info',
      icon: 'info',
      position: 'top',
      timeout: 4500,
      progress: true,
      classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
      actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
    })
  })
}

// ── EDIT / ADD ────────────────────────────────────────────────────────────────
const openEditDialog = async (row) => {
  isEditMode.value = true
  form.value = JSON.parse(JSON.stringify(row))
  if (!form.value.attn) form.value.attn = ''
  selectedCustomer.value = { id: row.customer_id, nama: row.nama_customer }
  analisaFile.value = null
  stempelFile.value = null
  tempSignFile.value = null
  showDialog.value = true
  if (row.marketing_read === false)
    await updateDoc(doc(db, 'penawaran', row.id), { marketing_read: true })
}

const openAddDialog = () => {
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  form.value.nomor = `${(rows.value.length + 1).toString().padStart(3, '0')}/AAP-QUOT/IV/2026`
  selectedCustomer.value = null
  if (userData.value) {
    form.value.ttd_nama = userData.value.nama
    form.value.ttd_jabatan = userData.value.jabatan
  }
  analisaFile.value = null
  stempelFile.value = null
  tempSignFile.value = null
  showDialog.value = true
}

const addDetailItem = () => {
  form.value.items.push({ deskripsi: '', qty: 1, satuan: 'ls', harga: 0, total: 0 })
  updateGrandTotal()
}
const removeDetailItem = (idx) => {
  if (form.value.items.length > 1) {
    form.value.items.splice(idx, 1)
    updateGrandTotal()
  }
}
const onCustomerChange = (val) => {
  if (val) {
    form.value.customer_id = val.id
    form.value.nama_customer = val.nama
  }
}

// ── HAPUS ─────────────────────────────────────────────────────────────────────
const confirmHapus = (row) => {
  $q.dialog({
    title: '<div class="text-h5 text-weight-bolder text-negative q-mb-sm">Konfirmasi Hapus</div>',
    message: `Apakah Anda yakin ingin menghapus dokumen <b>${row.nomor}</b> secara permanen?<br/><span class="text-grey-7 text-caption block q-mt-xs">Data yang dihapus tidak dapat dikembalikan lagi.</span>`,
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
      label: 'Ya, Hapus',
      color: 'negative',
      unelevated: true,
      rounded: true,
      class: 'q-px-lg text-weight-bold text-uppercase shadow-2',
    },
    class: 'rounded-20 q-pa-md shadow-premium bg-white',
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'penawaran', row.id))
      $q.notify({
        html: true,
        message:
          '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Data Terhapus!</div><div class="text-caption q-mt-xs" style="opacity:0.85">Dokumen penawaran telah ditarik secara permanen dari sistem.</div>',
        color: 'negative',
        icon: 'delete_forever',
        position: 'top',
        timeout: 4000,
        progress: true,
        classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
        actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
      })
    } catch (e) {
      console.error(e)
    }
  })
}

// ── PREVIEW ───────────────────────────────────────────────────────────────────
const openPreview = async (row) => {
  selectedData.value = row
  showPreview.value = true
  if (row.marketing_read === false)
    await updateDoc(doc(db, 'penawaran', row.id), { marketing_read: true })
}
const openAnalisaLink = (url) => {
  if (url) window.open(url, '_blank')
}

// ── UTILS ─────────────────────────────────────────────────────────────────────
const formatIndoDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

const waitForNextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()))

// ── EXPORT PDF ────────────────────────────────────────────────────────────────
const exportToPDF = async () => {
  $q.loading.show({ message: 'Merender Dokumen & Mengamankan PDF...' })

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
      // Render header jadi gambar sekali, untuk ditempel di tiap halaman PDF.
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

      // Hitung tinggi header dalam mm untuk menyisihkan margin atas di tiap halaman
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

    // Save lewat pdf instance supaya header sudah tertempel.
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

const exportListToPDF = () => {
  $q.loading.show({ message: 'Generating PDF Laporan...' })
  setTimeout(() => {
    const element = document.getElementById('list-print-area')
    const opt = {
      margin: [10, 10, 10, 10],
      filename: 'Laporan_Rekap_Penawaran.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    }
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => $q.loading.hide())
  }, 1000)
}

const exportListToExcel = () => {
  const now = new Date()
  const exportDate = `${formatIndoDate(now)}, ${now.toLocaleTimeString('id-ID')}`
  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8" /><style>
      .table-bordered{border-collapse:collapse;width:100%;font-family:sans-serif;font-size:12px}
      .table-bordered th,.table-bordered td{border:1px solid #ddd;padding:6px}
      .header-row th{background-color:#1a237e;color:#fff;font-weight:bold;text-align:center}
      .title{font-size:16px;font-weight:bold;color:#1a237e;font-family:sans-serif}
      .subtitle{font-size:11px;color:#333;font-family:sans-serif}
      .total-row td{background-color:#fce4e4;color:#d32f2f;font-weight:bold;text-align:right}
    </style></head><body>
    <div class="title">Laporan Rekapitulasi Penawaran (Quotation)</div>
    <div class="subtitle">Diekspor pada: ${exportDate}</div><br>
    <table class="table-bordered">
      <tr class="header-row">
        <th width="40">No</th><th width="150">Kode Referensi</th><th width="200">Klien</th>
        <th width="120">Lokasi</th><th width="150">Tanggal</th>
        <th width="150">Grand Total (Rp)</th><th width="120">Status</th>
      </tr>`
  let totalValue = 0
  rows.value.forEach((row, idx) => {
    totalValue += row.total_harga || 0
    html += `<tr>
      <td align="center">${idx + 1}</td><td>${row.nomor}</td>
      <td>${row.nama_customer}</td><td>${row.kota}</td>
      <td align="center">${formatIndoDate(row.tanggal)}</td>
      <td align="right">${Math.round(row.total_harga || 0)}</td>
      <td align="center">${row.status || 'Draft'}</td>
    </tr>`
  })
  html += `<tr class="total-row"><td colspan="5">TOTAL</td>
    <td>${Math.round(totalValue)}</td><td></td></tr>
    </table></body></html>`

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Laporan_Penawaran_${Date.now()}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const uploadKopPermanen = async (file) => {
  if (!file) return
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = async () => {
    try {
      await setDoc(doc(db, 'config', 'perusahaan'), { kopUrl: reader.result }, { merge: true })
      config.value.kopUrl = reader.result
      $q.notify({ color: 'positive', message: 'Logo Perusahaan Diperbarui!', position: 'top' })
    } catch (e) {
      console.error(e)
    }
  }
}
</script>

<style>
/* =======================================================================
   MODE KHUSUS SAAT EXPORT PDF GLOBAL STYLES
   ======================================================================= */
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
  font-size: 10px !important;
}
body.is-exporting .letter-paper .final-sign-space {
  height: 60px !important;
  margin-bottom: 2px !important;
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
/* ═══ BASE ═══════════════════════════════════════════════════════════════════ */
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
.shadow-premium {
  box-shadow: 0 10px 30px rgba(54, 173, 163, 0.15);
}
.block {
  display: block;
}
.uppercase {
  text-transform: uppercase;
}
.tracking-widest {
  letter-spacing: 0.15em;
}
.tracking-extra-wide {
  letter-spacing: 0.25em;
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
.opacity-0 {
  opacity: 0;
}
.border-dashed {
  border: 1px dashed #ccc;
}
.border-bottom {
  border-bottom: 1px solid #f0f0f0;
}
.leading-relaxed {
  line-height: 1.6;
}
.h-full {
  height: 100%;
}
@media (min-width: 600px) {
  .border-left-sm {
    border-left: 1px solid #e0e0e0;
  }
}

.label-req {
  font-size: 11px;
  font-weight: 800;
  color: #444;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* ═══ BRAND ══════════════════════════════════════════════════════════════════ */
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
.border-brand-thin {
  border: 2px solid #b2e5e2 !important;
}
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

/* ═══ ANIMATE ════════════════════════════════════════════════════════════════ */
.animate-fade {
  animation: fadeIn 0.35s ease-out;
}
.animate-pulse {
  animation: pulse 1.5s infinite;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* ═══ TABLE ══════════════════════════════════════════════════════════════════ */
.penawaran-table :deep(thead tr th) {
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
.entry-table :deep(thead th) {
  padding: 12px;
}
.entry-table :deep(tbody td) {
  padding: 0 8px;
  height: 48px;
  border-bottom: 1px solid #f0f0f0;
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.bg-indigo-0 {
  background-color: rgba(26, 35, 126, 0.03);
}
.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transition: 0.3s;
}

/* ═══ SIGNATURE PAD ══════════════════════════════════════════════════════════ */
.signature-pad-wrapper {
  border: 2px dashed #36ada3;
  border-radius: 12px;
  height: 400px;
  width: 100%;
}
.signature-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

/* ═══ LETTER PAPER (PREVIEW / PDF) ══════════════════════════════════════════ */
.letter-paper {
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif !important;
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

/* ═══ PREVIEW TABLE ══════════════════════════════════════════════════════════ */
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

.row-calculation {
  background: #f8f9fa !important;
}
.row-calculation td {
  padding: 6px 12px !important;
  border: 1px solid #ddd !important;
  font-size: 10.5px;
}
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

/* ═══ TERMS & SIGNATURE ══════════════════════════════════════════════════════ */
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
.signature-container {
  margin-top: 40px; /* Diubah agar naik ke atas mendekati teks closing */
  padding-top: 5px;
  margin-bottom: 40px;
}

/* Hindari pemotongan elemen penting saat export multi-page */
.final-pro-table thead {
  display: table-header-group;
}
.final-pro-table tfoot {
  display: table-footer-group;
}
.final-pro-table tr,
.final-pro-table td,
.final-pro-table th {
  break-inside: avoid;
  page-break-inside: avoid;
}
.terms-container,
.signature-container,
.final-sign-space {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Mode khusus saat export PDF diatur secara global di blok <style> di atas */
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
  border-bottom: 2px solid #1a237e;
  display: inline-block;
  padding: 0 5px;
}
.text-role-final {
  font-size: 11px;
  margin-top: 4px;
}

/* ═══ REPORT ═════════════════════════════════════════════════════════════════ */
.report-paper {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #333;
}
.report-header {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
}
.report-icon {
  background-color: #1a237e;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}
.report-title {
  margin: 0;
  color: #1a237e;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 1px;
}
.report-subtitle {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}
.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}
.report-table th {
  background-color: #1a237e;
  color: white;
  padding: 10px;
  border: 1px solid #ddd;
  border-left: 1px solid white;
}
.report-table td {
  padding: 10px;
  border: 1px solid #ddd;
}
.report-total-row td {
  background-color: #f0f4f8;
  text-align: right;
  font-weight: 900;
  color: #d32f2f;
  border: 1px solid #ddd;
  padding: 12px 10px;
}

/* ═══ CLICK SPAWN ════════════════════════════════════════════════════════════ */
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
.shrink {
  flex: 0 0 auto;
}
.border-white-2 {
  border: 2px solid rgba(255, 255, 255, 0.4);
}
.content-relative {
  position: relative;
  z-index: 1;
}

/* ═══ MISC ═══════════════════════════════════════════════════════════════════ */
.hover-shadow:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

/* ═══ PRINT ══════════════════════════════════════════════════════════════════ */
@media print {
  @page {
    size: A4;
    margin: 0;
  }
  body {
    background: white !important;
    overflow: visible !important;
    height: auto !important;
  }
  ::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
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
    position: relative !important;
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
    min-height: auto !important;
  }
  .letter-paper {
    box-shadow: none !important;
    margin: 0 !important;
    width: 210mm !important;
    height: auto !important;
    min-height: auto !important;
    padding: 12mm !important;
    page-break-after: auto;
    overflow: visible !important;
    position: relative !important;
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
  .text-indigo-10 {
    color: #1a237e !important;
  }
}
</style>
