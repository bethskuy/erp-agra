<template>
  <q-page class="bg-blue-grey-1 q-pa-md q-pa-md-lg font-pro">
    <!-- VIEW MODE: LIST -->
    <div v-if="viewMode === 'LIST'" class="animate-fade no-print">
      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-xl">
        <div class="col-12 col-md-8">
          <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight">
            Purchase Request (PR)
            <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
              >Permintaan Pengadaan Material Proyek</span
            >
          </div>
          <div class="text-subtitle1 text-grey-7 q-mt-sm">
            Kelola dan pantau seluruh pengajuan belanja material secara profesional.
          </div>
        </div>
        <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
          <q-btn
            v-if="canAction('buat')"
            color="indigo-10"
            icon="add_circle"
            label="Buat Pengajuan Baru"
            unelevated
            rounded
            no-caps
            class="q-px-lg q-py-sm shadow-premium btn-hover"
            @click="openAddDialog"
          />
        </div>
      </div>

      <!-- SEARCH & SUMMARY CARD -->
      <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white">
        <q-card-section class="q-py-md">
          <div class="row items-center q-col-gutter-md">
            <div class="col-12 col-md-5">
              <q-input
                v-model="filter"
                outlined
                dense
                rounded
                placeholder="Cari nomor PR atau pemohon..."
                bg-color="white"
              >
                <template v-slot:prepend><q-icon name="search" color="primary" /></template>
              </q-input>
            </div>
            <q-space />
            <div class="col-12 col-md-auto text-caption text-grey-6">
              Total Dokumen:
              <span class="text-weight-bold text-indigo-10">{{ rows.length }} Record</span>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- TABLE SECTION -->
      <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          flat
          :loading="loading"
          :filter="filter"
          binary-state-sort
          class="pr-table"
        >
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-indigo-10 text-white">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bold uppercase font-10"
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
              <q-td key="nomor" class="text-weight-bolder text-indigo-10">{{
                props.row.nomor
              }}</q-td>
              <q-td key="gudang">
                <div class="text-weight-bold text-blue-grey-9 uppercase">
                  {{ props.row.proyek_nama }}
                </div>
                <div class="text-caption text-grey-6">{{ props.row.pemohon?.nama }}</div>
                <div
                  v-if="props.row.status === 'Rejected' && props.row.alasan_reject"
                  class="text-negative text-caption italic"
                >
                  <q-icon name="info" size="xs" /> {{ props.row.alasan_reject }}
                </div>
              </q-td>
              <q-td key="total" class="text-right text-weight-bold">
                Rp {{ (props.row.total_estimasi || 0).toLocaleString() }}
              </q-td>
              <q-td key="status" class="text-center">
                <q-chip
                  :color="getStatusColor(props.row.status)"
                  text-color="white"
                  size="sm"
                  class="text-weight-bold shadow-sm"
                >
                  {{ props.row.status || 'Draft' }}
                </q-chip>
              </q-td>
              <q-td key="aksi" class="text-center" @click.stop>
                <div class="row justify-center q-gutter-xs">
                  <!-- ACTION: AJUKAN APPROVAL -->
                  <q-btn
                    v-if="
                      canAction('ubah') &&
                      (props.row.status === 'Draft' || props.row.status === 'Rejected')
                    "
                    flat
                    round
                    color="orange-9"
                    icon="send"
                    size="sm"
                    @click="ajukanPR(props.row)"
                  >
                    <q-tooltip>Ajukan Approval</q-tooltip>
                  </q-btn>

                  <!-- ACTION: EDIT DRAFT -->
                  <q-btn
                    v-if="
                      canAction('ubah') &&
                      props.row.status !== 'Approved' &&
                      props.row.status !== 'Ordered'
                    "
                    flat
                    round
                    color="blue-8"
                    icon="edit_note"
                    size="sm"
                    @click="openEditDialog(props.row)"
                  >
                    <q-tooltip>Edit Draft</q-tooltip>
                  </q-btn>

                  <!-- ACTION: HAPUS -->
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
    </div>

    <!-- ENTRY FORM DIALOG -->
    <q-dialog
      v-model="showDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="column bg-grey-2">
        <q-toolbar class="bg-white text-indigo-10 q-py-md shadow-2 shrink">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest">
            {{ isEditMode ? 'EDIT' : 'ENTRY' }} PURCHASE REQUEST
          </q-toolbar-title>
          <q-btn
            unelevated
            color="indigo-10"
            :label="isEditMode ? 'UPDATE PERUBAHAN' : 'SIMPAN SEBAGAI DRAFT'"
            :loading="submitting"
            @click="submitPurchaseRequest"
            rounded
            class="q-px-xl text-weight-bold shadow-3"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12">
              <!-- SECTION 1: IDENTITAS DOKUMEN & TUJUAN -->
              <q-card flat bordered class="rounded-12 q-mb-lg bg-white shadow-1">
                <q-card-section
                  class="bg-indigo-1 q-py-xs text-indigo-10 text-weight-bold flex items-center border-bottom"
                >
                  <q-icon name="description" class="q-mr-xs" size="xs" /> IDENTITAS DOKUMEN & TUJUAN
                </q-card-section>
                <q-card-section class="q-pa-md">
                  <div class="row q-col-gutter-sm">
                    <div class="col-12 col-md-4">
                      <div class="label-req q-mb-xs">LOGO DOKUMEN</div>
                      <q-file
                        outlined
                        dense
                        v-model="tempKopFile"
                        label="Upload Logo/Kop"
                        accept="image/*"
                        @update:model-value="handleLogoChange"
                        bg-color="white"
                      >
                        <template v-slot:prepend><q-icon name="cloud_upload" /></template>
                      </q-file>
                    </div>
                    <div class="col-12 col-md-4">
                      <div class="label-req q-mb-xs">Nama Perusahaan (Pengirim)</div>
                      <q-input outlined dense v-model="form.nama_pt" bg-color="white" />
                    </div>
                    <div class="col-12 col-md-4">
                      <div class="label-req q-mb-xs">NOMOR REFERENSI (Auto)</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.nomor"
                        bg-color="white"
                        :readonly="!isEditMode"
                      />
                    </div>

                    <div class="col-12 col-md-4">
                      <div class="label-req q-mb-xs">GUDANG / PROJECT (Contextual) *</div>
                      <q-input
                        filled
                        dense
                        v-model="selectedWarehouseName"
                        readonly
                        bg-color="indigo-1"
                        class="text-weight-bold"
                      >
                        <template v-slot:prepend
                          ><q-icon name="apartment" color="indigo-10"
                        /></template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <div class="label-req q-mb-xs">NO. REFF: (SPK PROJECT)</div>
                      <q-select
                        outlined
                        dense
                        v-model="selectedSpk"
                        :options="optSpk"
                        option-label="nomor_spk"
                        placeholder="Pilih Reff SPK..."
                        bg-color="white"
                        :loading="loadingSpk"
                      />
                    </div>
                    <div class="col-12 col-md-2">
                      <div class="label-req q-mb-xs">Lokasi Terbit</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.kota"
                        bg-color="white"
                        placeholder="Bekasi"
                      />
                    </div>
                    <div class="col-12 col-md-2">
                      <div class="label-req q-mb-xs">Tanggal Dokumen</div>
                      <q-input outlined dense v-model="form.tanggal" type="date" bg-color="white" />
                    </div>

                    <div class="col-12">
                      <div class="label-req q-mb-xs q-mt-sm">KEPADA YTH (MANUAL)</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.kepada_yth"
                        placeholder="Contoh: Divisi Purchasing / Procurement"
                        bg-color="white"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- SECTION 2: RINCIAN MATERIAL PENGAJUAN -->
              <q-card flat bordered class="rounded-12 q-mb-lg bg-white shadow-1 overflow-hidden">
                <q-card-section class="bg-blue-grey-1 q-py-xs row items-center border-bottom">
                  <q-icon name="list_alt" class="q-mr-xs" size="xs" />
                  <div class="text-weight-bold text-blue-grey-10 uppercase font-8">
                    RINCIAN MATERIAL PENGAJUAN
                  </div>
                  <q-space />
                  <q-btn
                    flat
                    dense
                    icon="add_circle"
                    color="primary"
                    label="Tambah Baris"
                    @click="addItemRow"
                    no-caps
                    class="text-weight-bold"
                  />
                </q-card-section>

                <q-markup-table flat separator="cell" class="item-entry-table">
                  <thead>
                    <tr class="bg-indigo-1 text-indigo-10">
                      <th width="50">NO</th>
                      <th class="text-left">DESCRIPTION OF MATERIAL</th>
                      <th width="80">QTY</th>
                      <th width="80">UNIT</th>
                      <th width="150">est UNIT PRICE</th>
                      <th width="180">est AMOUNT</th>
                      <th width="40"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in form.items" :key="index">
                      <td class="text-center text-grey-6 text-bold">{{ index + 1 }}</td>
                      <td>
                        <q-select
                          dense
                          borderless
                          v-model="item.barang"
                          :options="masterBarang"
                          option-label="nama"
                          placeholder="Tulis rincian..."
                          use-input
                          @filter="filterMasterBarang"
                          @update:model-value="(val) => onBarangSelect(val, index)"
                        />
                      </td>
                      <td>
                        <q-input
                          v-model.number="item.qty"
                          type="number"
                          dense
                          borderless
                          input-class="text-center text-bold"
                          @update:model-value="calcRow(index)"
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
                          v-model.number="item.estimasi_harga"
                          type="number"
                          dense
                          borderless
                          input-class="text-right"
                          prefix="Rp"
                          @update:model-value="calcRow(index)"
                        />
                      </td>
                      <td class="text-right text-weight-black text-indigo-10 bg-indigo-0">
                        Rp {{ (item.total || 0).toLocaleString() }}
                      </td>
                      <td class="text-center">
                        <q-btn
                          flat
                          round
                          color="negative"
                          icon="remove_circle"
                          size="xs"
                          @click="removeItemRow(index)"
                          :disable="form.items.length === 1"
                        />
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-grey-1">
                    <tr>
                      <td colspan="5" class="text-right text-weight-bold uppercase font-10">
                        Total Estimasi Harga
                      </td>
                      <td class="text-right text-weight-bolder text-indigo-10">
                        Rp {{ calculateTotalPR().toLocaleString() }}
                      </td>
                      <td></td>
                    </tr>
                    <tr class="bg-indigo-10 text-white">
                      <td
                        colspan="5"
                        class="text-right text-weight-bolder text-h6 uppercase tracking-widest"
                      >
                        Grand Total Amount
                      </td>
                      <td class="text-right text-h6 text-weight-bolder">
                        Rp {{ calculateTotalPR().toLocaleString() }}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </q-markup-table>
              </q-card>

              <!-- SECTION 3: TERMS & SIGNATURE -->
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="rounded-12 bg-white shadow-1 h-full">
                    <q-card-section
                      class="bg-grey-1 q-py-xs text-indigo-10 text-weight-bold uppercase font-8 border-bottom"
                    >
                      <q-icon name="gavel" class="q-mr-xs" /> Syarat & Kondisi
                    </q-card-section>
                    <q-editor v-model="form.terms" min-height="10rem" flat />

                    <q-separator />

                    <div class="q-pa-md">
                      <div class="label-req q-mb-xs">CATATAN UMUM</div>
                      <q-input
                        outlined
                        v-model="form.catatan"
                        type="textarea"
                        rows="2"
                        placeholder="Catatan tambahan..."
                      />
                    </div>
                  </q-card>
                </div>

                <div class="col-12 col-md-6">
                  <q-card flat bordered class="rounded-12 bg-white shadow-1">
                    <q-card-section
                      class="bg-grey-1 q-py-xs text-indigo-10 text-weight-bold uppercase font-8 border-bottom"
                    >
                      <q-icon name="draw" class="q-mr-xs" /> VALIDASI TANDA TANGAN (PREPARED BY)
                    </q-card-section>
                    <q-card-section class="q-pa-md">
                      <q-editor v-model="form.closing" class="q-mb-md" flat bordered dense />

                      <div class="row q-col-gutter-md items-end">
                        <div class="col-12 col-sm-6">
                          <div class="text-caption text-bold text-grey-7 q-mb-xs">
                            REQUESTOR (DATA LOGIN)
                          </div>
                          <q-input
                            outlined
                            dense
                            v-model="form.ttd_nama"
                            label="Nama Penandatangan"
                            readonly
                            bg-color="blue-grey-1"
                          />
                          <q-input
                            outlined
                            dense
                            v-model="form.ttd_jabatan"
                            label="Jabatan"
                            readonly
                            bg-color="blue-grey-1"
                            class="q-mt-sm"
                          />
                        </div>
                        <div class="col-12 col-sm-6">
                          <div
                            class="text-caption text-bold text-primary q-mb-xs uppercase font-8 flex items-center justify-between"
                          >
                            <span>Pilih Metode Sign</span>
                            <q-btn-dropdown
                              flat
                              dense
                              color="primary"
                              icon="settings"
                              label="Metode"
                              no-caps
                              size="sm"
                              class="rounded-borders"
                            >
                              <q-list class="q-pa-sm" style="min-width: 180px">
                                <q-item clickable v-ripple v-close-popup @click="showPad = true">
                                  <q-item-section avatar
                                    ><q-icon name="gesture" color="indigo-10"
                                  /></q-item-section>
                                  <q-item-section>Gurat Manual</q-item-section>
                                </q-item>
                                <q-item clickable v-ripple class="relative-position">
                                  <q-item-section avatar
                                    ><q-icon name="upload" color="indigo-10"
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
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- SIGNATURE PAD DIALOG -->
    <q-dialog v-model="showPad" persistent backdrop-filter="blur(4px)">
      <q-card style="width: 500px; max-width: 95vw" class="rounded-20 shadow-24">
        <q-card-section class="row items-center q-pb-none bg-indigo-10 text-white q-pa-md">
          <div class="text-h6 text-weight-bold uppercase font-10">Tanda Tangan Prepared By</div>
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
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- PREVIEW DIALOG -->
    <q-dialog v-model="showPreview" maximized transition-show="fade" transition-hide="fade">
      <q-card class="column no-wrap bg-grey-4">
        <q-toolbar class="bg-white text-indigo-10 q-py-md no-print shadow-2 shrink">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-weight-bold">PREVIEW DOKUMEN RESMI PR</q-toolbar-title>
          <q-btn-group unelevated rounded class="shadow-2">
            <q-btn color="primary" icon="print" label="Cetak" @click="printPage" class="q-px-md" />
            <q-btn color="red-9" icon="picture_as_pdf" label="PDF" @click="exportToPDF" />
          </q-btn-group>
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl flex flex-center">
          <div id="pr-print-area" class="letter-paper shadow-24" v-if="selectedData">
            <div class="row no-wrap items-center">
              <div v-if="selectedData.logoUrl" class="col-auto q-mr-xl">
                <img :src="selectedData.logoUrl" class="final-kop-img" />
              </div>
              <div class="col text-left">
                <div class="final-pt-name uppercase">{{ selectedData.nama_pt }}</div>
                <div class="final-pt-tagline italic text-grey-8">{{ selectedData.slogan_pt }}</div>
              </div>
            </div>
            <div class="final-divider"></div>
            <div class="row justify-end q-mt-md">
              <div class="col-auto text-right">
                <div class="quotation-title-pro uppercase">PURCHASE REQUEST</div>
                <div class="quotation-no-pro text-indigo-10 text-bold font-mono">
                  No. Pr : {{ selectedData.nomor }}
                </div>
              </div>
            </div>
            <div class="row q-mt-md q-mb-lg text-left text-body2">
              <div class="col-7">
                <table class="meta-info-table">
                  <tr>
                    <td class="text-bold label-meta">Kepada Yth</td>
                    <td class="meta-separator">:</td>
                    <td class="text-weight-medium">{{ selectedData.kepada_yth }}</td>
                  </tr>
                  <tr>
                    <td class="text-bold label-meta">Gudang / Project</td>
                    <td class="meta-separator">:</td>
                    <td class="text-weight-bold text-indigo-10 uppercase">
                      {{ selectedData.proyek_nama }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-bold label-meta">No. Reff</td>
                    <td class="meta-separator">:</td>
                    <td>{{ selectedData.no_reff || '-' }}</td>
                  </tr>
                  <tr>
                    <td class="text-bold label-meta">Requestor</td>
                    <td class="meta-separator">:</td>
                    <td class="text-weight-medium uppercase">{{ selectedData.pemohon?.nama }}</td>
                  </tr>
                </table>
              </div>
              <div class="col-5 text-right">
                <div class="row no-wrap justify-end">
                  <div class="text-bold q-mr-md">Tanggal</div>
                  <div class="text-weight-bold">
                    : {{ selectedData.kota }}, {{ formatIndoDate(selectedData.tanggal) }}
                  </div>
                </div>
              </div>
            </div>
            <div
              class="text-body2 q-mb-sm text-left leading-relaxed"
              v-html="selectedData.introduction"
            ></div>
            <table class="final-pro-table full-width">
              <thead>
                <tr>
                  <th width="40">NO</th>
                  <th>ITEM DESCRIPTION</th>
                  <th width="60">QTY</th>
                  <th width="60">UNIT</th>
                  <th width="120">est UNIT PRICE</th>
                  <th width="140">est AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, i) in selectedData.items" :key="i">
                  <td class="text-center font-bold text-grey-7">{{ i + 1 }}</td>
                  <td class="text-left uppercase text-weight-medium">{{ it.nama_barang }}</td>
                  <td class="text-center font-bold">{{ it.qty }}</td>
                  <td class="text-center uppercase text-caption text-bold">{{ it.satuan }}</td>
                  <td class="text-right">Rp {{ (it.estimasi_harga || 0).toLocaleString() }}</td>
                  <td class="text-right text-weight-bolder text-indigo-10 bg-indigo-0">
                    Rp {{ (it.total || 0).toLocaleString() }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="row-calculation">
                  <td colspan="5" class="text-right text-bold uppercase">Subtotal Amount</td>
                  <td class="text-right text-bold text-indigo-10">
                    IDR {{ (selectedData.total_estimasi || 0).toLocaleString() }}
                  </td>
                </tr>
                <tr class="row-grand-total">
                  <td colspan="5" class="text-right text-bold text-h6 uppercase tracking-widest">
                    Grand Total Amount
                  </td>
                  <td class="text-right text-white text-bold text-h5">
                    IDR {{ (selectedData.total_estimasi || 0).toLocaleString() }}
                  </td>
                </tr>
              </tfoot>
            </table>
            <div class="terms-container text-left q-mt-lg">
              <div class="terms-header uppercase">Syarat & Kondisi :</div>
              <div
                class="terms-content-box leading-relaxed font-11"
                v-html="selectedData.terms"
              ></div>
            </div>
            <div class="signature-container text-left q-mt-xl">
              <div class="text-closing-final q-mb-md font-11" v-html="selectedData.closing"></div>
              <div class="row q-mt-lg justify-end">
                <div class="col-5 text-center">
                  <div class="q-mb-xs text-body2 uppercase tracking-widest text-bold">
                    Prepared By,
                  </div>
                  <div class="final-sign-space flex flex-center">
                    <img
                      v-if="selectedData.signatureUrl"
                      :src="selectedData.signatureUrl"
                      class="img-signature-clean"
                    />
                    <div v-else style="height: 100px" class="flex flex-center text-grey-4 italic">
                      Belum ditandatangani
                    </div>
                  </div>
                  <div
                    class="text-signer-final text-weight-black underline uppercase text-indigo-10"
                  >
                    {{ selectedData.ttd_nama }}
                  </div>
                  <div
                    class="text-role-final uppercase text-grey-8 text-caption font-bold block q-mt-xs"
                  >
                    {{ selectedData.ttd_jabatan }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// eslint-disable-next-line no-unused-vars
import { db, storage } from 'src/boot/firebase'
import {
  collection,
  getDocs,
  addDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore'
// eslint-disable-next-line no-unused-vars
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'
import SignaturePad from 'signature_pad'

// --- INITIALIZATION ---
const $q = useQuasar()
const route = useRoute()
// eslint-disable-next-line no-unused-vars
const router = useRouter()
const authStore = useAuthStore()
const viewMode = ref('LIST')
const warehouseIdContext = route.params.id
const selectedWarehouseName = ref('Memuat...')
const selectedWarehouseObj = ref(null)
const showDialog = ref(false)
const showPreview = ref(false)
const showPad = ref(false)
const isEditMode = ref(false)
const loading = ref(true)
const submitting = ref(false)
const loadingSpk = ref(false)
const filter = ref('')
const rows = ref([])
const optGudang = ref([])
const optSpk = ref([])
const selectedSpk = ref(null)
const masterBarang = ref([])
const allBarang = ref([])
const selectedData = ref(null)
const tempKopFile = ref(null)
// eslint-disable-next-line no-unused-vars
const analisaFile = ref(null)
const tempSignFile = ref(null)
const signatureCanvas = ref(null)
let signaturePad = null
const config = ref({ kopUrl: '', nama_pt: '', slogan_pt: '' })
const userData = ref(null)
let unsubUser = null
let unsubRows = null

const formDefault = {
  nomor: '',
  kota: 'Bekasi',
  tanggal: new Date().toISOString().substr(0, 10),
  nama_pt: 'PT AGRA ABHINAYA PERKASA',
  slogan_pt: 'General Construction and General Supply',
  logoUrl: '',
  kepada_yth: 'Divisi Purchasing / Procurement',
  introduction:
    'Bersama surat ini kami mengajukan permintaan pengadaan material untuk kebutuhan proyek sebagai berikut:',
  items: [
    {
      barang: null,
      id_barang: '',
      nama_barang: '',
      qty: 1,
      satuan: 'ls',
      estimasi_harga: 0,
      total: 0,
    },
  ],
  terms:
    '<ul><li>Material akan dikirim segera setelah PR disetujui.</li><li>Kualitas barang dicek saat kedatangan.</li></ul>',
  closing: 'Demikian permintaan ini kami sampaikan, terima kasih.',
  ttd_nama: '',
  ttd_jabatan: '',
  signatureUrl: '',
  approve_nama: 'Wartono',
  approve_jabatan: 'Manager Operasional',
  no_reff: '',
  catatan: '',
  status: 'Draft',
}
const form = ref({ ...formDefault })

// --- PERMISSIONS (Like PenawaranPage) ---
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const targetId = '_konstruksi_gudang_permintaan' // Sesuaikan dengan ID menu gudang/PR lo
  const menu = modulePerm.menus.find((m) => m.id === targetId)
  return menu ? menu[actionType] || false : false
}

const fetchData = async () => {
  loading.value = true
  const confRef = doc(db, 'config', 'perusahaan')
  const configSnap = await getDoc(confRef)
  if (configSnap.exists()) config.value = configSnap.data()

  unsubRows = onSnapshot(collection(db, 'permintaan_barang'), (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    rows.value = all
      .filter((it) => it.tipe === 'PURCHASE_REQUEST')
      .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
    loading.value = false
  })

  const projSnap = await getDocs(collection(db, 'proyek'))
  const list = [
    { id: 'UTAMA', nama: 'Gudang Utama Center' },
    ...projSnap.docs.map((d) => ({
      id: d.id,
      nama: 'Gudang ' + (d.data().nama_proyek || d.data().nama),
    })),
  ]
  optGudang.value = list
  const found = list.find((g) => g.id === warehouseIdContext)
  if (found) {
    selectedWarehouseObj.value = found
    selectedWarehouseName.value = found.nama
  }

  const barSnap = await getDocs(collection(db, 'master_barang'))
  allBarang.value = barSnap.docs
    .map((d) => ({ id: d.id, nama: d.data().nama, unit: d.data().unit }))
    .sort((a, b) => a.nama.localeCompare(b.nama))
  masterBarang.value = [...allBarang.value]
}

const fetchCurrentUser = () => {
  const email = authStore.user?.email
  if (!email) return
  const qKaryawan = query(collection(db, 'karyawan'), where('email', '==', email))
  unsubUser = onSnapshot(qKaryawan, (snap) => {
    if (!snap.empty) {
      userData.value = snap.docs[0].data()
      if (!isEditMode.value) {
        form.value.ttd_nama = userData.value.nama
        form.value.ttd_jabatan = userData.value.jabatan
      }
    }
  })
}

// --- WORKFLOW ACTIONS ---
const openAddDialog = () => {
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  form.value.nomor =
    'PR/AAP/' +
    (new Date().getMonth() + 1).toString().padStart(2, '0') +
    '/' +
    Date.now().toString().slice(-4)
  form.value.logoUrl = config.value.kopUrl || ''
  form.value.nama_pt = config.value.nama_pt || 'PT AGRA ABHINAYA PERKASA'
  if (userData.value) {
    form.value.ttd_nama = userData.value.nama
    form.value.ttd_jabatan = userData.value.jabatan
  }
  showDialog.value = true
}

const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = JSON.parse(JSON.stringify(row))
  showDialog.value = true
}

const ajukanPR = (row) => {
  $q.dialog({
    title: 'Ajukan Approval',
    message: `Kirim Purchase Request ${row.nomor} untuk diperiksa pimpinan?`,
    cancel: true,
    ok: { color: 'orange-9', unelevated: true, label: 'Ya, Kirim' },
  }).onOk(async () => {
    try {
      await updateDoc(doc(db, 'permintaan_barang', row.id), {
        status: 'Pending',
        updatedAt: serverTimestamp(),
      })
      $q.notify({ type: 'positive', message: 'Berhasil dikirim ke antrean approval.' })
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Gagal: ' + e.message })
    }
  })
}

const submitPurchaseRequest = async () => {
  if (!selectedWarehouseObj.value)
    return $q.notify({ type: 'negative', message: 'Gudang tidak terdeteksi!' })
  if (!form.value.signatureUrl)
    return $q.notify({ type: 'warning', message: 'Tanda tangan wajib diisi!' })

  submitting.value = true
  try {
    const payload = {
      ...form.value,
      tipe: 'PURCHASE_REQUEST',
      proyek_id: selectedWarehouseObj.value.id,
      proyek_nama: selectedWarehouseObj.value.nama,
      no_reff: selectedSpk.value?.nomor_spk || form.value.no_reff || '',
      total_estimasi: calculateTotalPR(),
      pemohon: { id: authStore.user?.uid, nama: authStore.user?.nama },
      updatedAt: serverTimestamp(),
    }

    payload.items = payload.items.map((it) => ({
      id_barang: it.id_barang,
      nama_barang: it.nama_barang,
      qty: it.qty,
      satuan: it.satuan,
      estimasi_harga: it.estimasi_harga,
      total: it.qty * it.estimasi_harga,
    }))

    const docId = payload.id
    if (isEditMode.value && docId) {
      delete payload.id
      await updateDoc(doc(db, 'permintaan_barang', docId), payload)
    } else {
      payload.timestamp = serverTimestamp()
      payload.status = 'Draft'
      await addDoc(collection(db, 'permintaan_barang'), payload)
    }

    showDialog.value = false
    $q.notify({
      type: 'positive',
      message: `PR Berhasil ${isEditMode.value ? 'Diupdate' : 'Disimpan sebagai Draft'}!`,
    })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  } finally {
    submitting.value = false
  }
}

// --- SIGNATURE LOGIC ---
watch(showPad, async (v) => {
  if (v) {
    await nextTick()
    const c = signatureCanvas.value
    const r = Math.max(window.devicePixelRatio || 1, 1)
    c.width = c.offsetWidth * r
    c.height = c.offsetHeight * r
    c.getContext('2d').scale(r, r)
    signaturePad = new SignaturePad(c, { penColor: '#000000' })
  }
})
const clearPad = () => signaturePad?.clear()
const saveManualSignature = () => {
  if (!signaturePad || signaturePad.isEmpty()) return
  form.value.signatureUrl = signaturePad.toDataURL()
  showPad.value = false
}
const uploadSignatureFile = (file) => {
  if (!file) return
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    form.value.signatureUrl = reader.result
    $q.notify({ type: 'positive', message: 'Tanda tangan diunggah' })
  }
}
const handleLogoChange = async (f) => {
  if (!f) return
  const r = new FileReader()
  r.readAsDataURL(f)
  r.onload = async () => {
    form.value.logoUrl = r.result
    await setDoc(doc(db, 'config', 'perusahaan'), { kopUrl: r.result }, { merge: true })
  }
}
const calcRow = (idx) => {
  const it = form.value.items[idx]
  it.total = (it.qty || 0) * (it.estimasi_harga || 0)
}
const calculateTotalPR = () => form.value.items.reduce((s, it) => s + (it.total || 0), 0)
const addItemRow = () =>
  form.value.items.push({
    barang: null,
    id_barang: '',
    nama_barang: '',
    qty: 1,
    satuan: 'ls',
    estimasi_harga: 0,
    total: 0,
  })
const removeItemRow = (idx) => {
  if (form.value.items.length > 1) form.value.items.splice(idx, 1)
}
const onBarangSelect = (v, idx) => {
  if (v) {
    form.value.items[idx].id_barang = v.id
    form.value.items[idx].nama_barang = v.nama
    form.value.items[idx].satuan = v.unit
    calcRow(idx)
  }
}
const filterMasterBarang = (v, u) => {
  u(() => {
    const n = v.toLowerCase()
    masterBarang.value = allBarang.value.filter((x) => x.nama.toLowerCase().includes(n))
  })
}
const getStatusColor = (s) =>
  s === 'Approved'
    ? 'positive'
    : s === 'Rejected'
      ? 'negative'
      : s === 'Ordered'
        ? 'indigo-10'
        : s === 'Pending'
          ? 'orange-8'
          : 'blue-grey-6'
const openPreview = (r) => {
  selectedData.value = r
  showPreview.value = true
}
const printPage = () => window.print()
const exportToPDF = () => {
  const e = document.getElementById('pr-print-area')
  const o = {
    margin: 0,
    filename: `PR_${selectedData.value.nomor}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2.5, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  html2pdf().set(o).from(e).save()
}
const confirmHapus = (r) => {
  $q.dialog({ title: 'Hapus PR?', cancel: true }).onOk(async () => {
    await deleteDoc(doc(db, 'permintaan_barang', r.id))
  })
}
const formatIndoDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''
onMounted(() => {
  fetchData()
  fetchCurrentUser()
})
onUnmounted(() => {
  if (unsubUser) unsubUser()
  if (unsubRows) unsubRows()
})

const columns = [
  { name: 'nomor', align: 'left', label: 'REFERENCE NO', field: 'nomor', sortable: true },
  { name: 'gudang', align: 'left', label: 'PROJECT / REQUESTOR', field: 'proyek_nama' },
  {
    name: 'total',
    align: 'right',
    label: 'EST. AMOUNT (RP)',
    field: 'total_estimasi',
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  { name: 'aksi', align: 'center', label: 'ACTIONS' },
]
</script>

<style scoped>
.font-pro {
  font-family:
    'Inter',
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
  box-shadow: 0 10px 30px rgba(25, 118, 210, 0.15);
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
.label-req {
  font-size: 11px;
  font-weight: 800;
  color: #444;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.item-entry-table :deep(thead th) {
  padding: 12px;
  font-weight: 800;
}
.item-entry-table :deep(tbody td) {
  border-bottom: 1px solid #f0f0f0;
}
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
.final-pro-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  border: 1.5px solid #1a237e;
}
.final-pro-table th {
  background: #1a237e !important;
  color: white !important;
  padding: 10px 8px;
  font-size: 10px;
  font-weight: 900;
  text-align: center;
  border: 1px solid #1a237e;
}
.final-pro-table td {
  padding: 8px 10px;
  border: 1px solid #ddd;
  font-size: 11.5px;
  color: #111;
}
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
}
.final-kop-img {
  height: 75px;
  width: auto;
  object-fit: contain;
}
.final-pt-name {
  font-size: 24px;
  font-weight: 900;
  color: #1a237e;
  letter-spacing: -1px;
  line-height: 1;
}
.final-pt-tagline {
  font-size: 10px;
  color: #555;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 2px;
}
.final-divider {
  height: 4px;
  background: #1a237e;
  margin-top: 15px;
  border-bottom: 1px solid #1a237e;
}
.quotation-title-pro {
  font-size: 20px;
  font-weight: 900;
  color: #1a237e;
  letter-spacing: 2px;
  border-bottom: 2px solid #f0f0f0;
  display: inline-block;
  padding-bottom: 2px;
}
.quotation-no-pro {
  font-size: 12px;
  font-weight: 800;
  margin-top: 4px;
}
.meta-info-table {
  border-collapse: collapse;
  width: 100%;
}
.meta-info-table td {
  padding: 3px 0;
  font-size: 12px;
  vertical-align: top;
}
.label-meta {
  width: 125px;
  color: #555;
}
.meta-separator {
  width: 15px;
  text-align: center;
}
.label-grey-pro {
  color: #888;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  margin-bottom: 4px;
}
.client-name-pro {
  font-size: 18px;
  font-weight: 900;
  color: #1a237e;
  margin-bottom: 2px;
}
.text-date-pro {
  font-size: 12px;
  color: #444;
  font-weight: 700;
}
.row-calculation {
  background: #f9fafb !important;
}
.row-calculation td {
  padding: 6px 12px !important;
  border: 1px solid #ddd !important;
  font-size: 10.5px;
}
.row-grand-total {
  background: #1a237e !important;
}
.row-grand-total td {
  padding: 12px 12px !important;
  color: white !important;
  border: 1px solid #1a237e !important;
}
.terms-container {
  border: 1.5px solid #1a237e;
  margin-top: 20px;
  border-radius: 4px;
  overflow: hidden;
}
.terms-header {
  background: #1a237e;
  padding: 6px 12px;
  font-weight: 900;
  color: white;
  font-size: 10.5px;
  letter-spacing: 1px;
}
.terms-content-box {
  padding: 8px 12px;
  font-size: 10.5px;
  color: #333;
}
.signature-container {
  margin-top: auto;
  padding-top: 30px;
}
.final-sign-space {
  height: 90px;
  position: relative;
}
.img-signature-clean {
  max-height: 80px;
  max-width: 200px;
  object-fit: contain;
  mix-blend-mode: multiply;
  filter: contrast(1.1) brightness(0.95);
}
.text-signer-final {
  font-size: 14px;
  font-weight: 900;
  color: #1a237e;
  border-bottom: 2.5px solid #1a237e;
  display: inline-block;
  padding: 0 8px;
  min-width: 170px;
}
.text-role-final {
  font-size: 10.5px;
  margin-top: 4px;
  font-weight: 700;
  color: #444;
}
.underline {
  text-decoration: none;
}
.bg-indigo-0 {
  background-color: rgba(26, 35, 126, 0.03);
}
.opacity-0 {
  opacity: 0;
}
.pr-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 16px;
}
.hover-bg:hover {
  background-color: rgba(26, 35, 126, 0.03) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.animate-fade {
  animation: fadeIn 0.6s ease-out;
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
  .final-pro-table th,
  .row-grand-total,
  .terms-header {
    background-color: #1a237e !important;
    color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .row-calculation {
    background-color: #f9fafb !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
