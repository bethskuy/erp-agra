<template>
  <q-page class="bg-page q-pa-md font-pro relative-position">
    <!-- VIEW MODE: LIST -->
    <div v-if="viewMode === 'LIST'" class="animate-fade page-content-wrapper no-print">
      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-md content-relative">
        <div class="col-12 q-mb-md q-mb-md-none">
          <div class="row items-center no-wrap">
            <q-btn
              flat
              round
              color="brand-primary"
              icon="arrow_back"
              @click="$router.back()"
              class="q-mr-md bg-white shadow-1 transition-all btn-hover"
            />
            <div>
              <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
                Purchase Request (PR)
                <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                  >Permintaan Pengadaan Material Proyek</span
                >
              </div>
              <div class="text-subtitle1 text-grey-7 q-mt-sm">
                Kelola dan pantau seluruh pengajuan belanja material secara profesional.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SEARCH & EXPORT CARD -->
      <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white border-subtle content-relative">
        <q-card-section class="q-py-md">
          <div class="row items-center justify-between q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model="filter"
                outlined
                dense
                rounded
                placeholder="Cari nomor PR atau pemohon..."
                bg-color="white"
                class="search-input"
              >
                <template v-slot:prepend><q-icon name="search" color="brand-primary" /></template>
                <template v-slot:append v-if="filter">
                  <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-auto row items-center justify-end q-col-gutter-md q-mt-sm q-mt-md-none">
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
                    <q-item clickable v-ripple @click="exportListToPDF" class="hover-blue-btn q-py-sm">
                      <q-item-section avatar>
                        <q-avatar color="red-1" text-color="brand-danger" icon="picture_as_pdf" size="sm" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold text-brand-danger">Export PDF</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator class="q-my-sm" />
                    <q-item clickable v-ripple @click="exportListToExcel" class="hover-blue-btn q-py-sm">
                      <q-item-section avatar>
                        <q-avatar color="green-1" text-color="green-9" icon="table_view" size="sm" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold text-green-9">Export Excel</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>

              <!-- REGISTRASI PR / BUAT PENGAJUAN BARU -->
              <div class="col-12 col-sm-auto" v-if="canAction('buat')">
                <q-btn
                  color="brand-primary"
                  icon="add_circle"
                  label="Buat Pengajuan Baru"
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
              @click="openPreview(props.row)"
            >
              <q-td key="nomor" class="text-weight-bolder text-brand-primary">
                {{ props.row.nomor }}
                <!-- BADGE BARU UNTUK DOKUMEN YANG BELUM DIBACA -->
                <q-badge
                  v-if="
                    (props.row.status === 'Approved' || props.row.status === 'Rejected') &&
                    props.row.requester_read === false
                  "
                  color="positive"
                  class="q-ml-sm animate-bounce"
                  >BARU</q-badge
                >
              </q-td>
              <q-td key="project">
                <div class="text-weight-bold text-blue-grey-9 uppercase font-12">
                  {{ props.row.gudang_nama || props.row.proyek_nama || 'UMUM' }}
                </div>
                <div class="text-caption text-grey-6">
                  {{ props.row.requestor_nama || props.row.pemohon?.nama }}
                </div>
                <div
                  v-if="props.row.status === 'Rejected' && props.row.alasan_reject"
                  class="text-brand-danger text-caption italic"
                >
                  <q-icon name="info" size="xs" /> {{ props.row.alasan_reject }}
                </div>
              </q-td>
              <q-td key="total" class="text-right text-weight-bolder">
                <span class="text-caption text-grey-6 q-mr-xs">Rp</span>
                {{ (props.row.total_estimasi || 0).toLocaleString() }}
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
                    color="brand-primary"
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
                    color="brand-danger"
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
        <q-card-section class="col scroll q-pa-none">
          <!-- STICKY TOOLBAR FOR RESPONSIVE SCROLL -->
          <q-toolbar class="bg-brand-primary text-white q-py-md shadow-4 shrink" style="position: sticky; top: 0; z-index: 10; width: 100%;">
            <q-btn flat round dense icon="close" v-close-popup color="white" />
            <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest ellipsis text-subtitle1">
              {{ isEditMode ? 'EDIT' : 'ENTRY' }} PURCHASE REQUEST
            </q-toolbar-title>
            <q-btn
              unelevated
              color="white"
              text-color="brand-primary"
              :label="$q.screen.lt.sm ? (isEditMode ? 'UPDATE' : 'SIMPAN') : (isEditMode ? 'UPDATE PERUBAHAN' : 'SIMPAN SEBAGAI DRAFT')"
              :loading="submitting"
              @click="submitPurchaseRequest"
              rounded
              :class="$q.screen.lt.sm ? 'q-px-md text-weight-bold shadow-premium btn-hover text-caption' : 'q-px-xl text-weight-bold shadow-premium btn-hover'"
            />
          </q-toolbar>

          <div class="q-pa-md q-pa-md-xl">
            <div class="row justify-center">
            <div class="col-12">
              <!-- SECTION 1: IDENTITAS DOKUMEN & TUJUAN -->
              <q-card flat bordered class="rounded-12 q-mb-lg bg-white shadow-1">
                <q-card-section
                  class="bg-brand-light q-py-xs text-brand-primary text-weight-bold flex items-center border-bottom"
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
                        <template v-slot:prepend
                          ><q-icon name="cloud_upload" color="brand-primary"
                        /></template>
                        <template v-slot:append v-if="form.logoUrl"
                          ><q-icon name="check_circle" color="positive"
                        /></template>
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
                        bg-color="grey-2"
                        :readonly="!isEditMode"
                      />
                    </div>

                    <!-- GUDANG / PROJECT SELECTION -->
                    <div class="col-12 col-md-4">
                      <div class="label-req q-mb-xs">GUDANG / PROJECT *</div>
                      <q-select
                        v-if="!warehouseIdContext"
                        outlined
                        dense
                        v-model="selectedWarehouseObj"
                        :options="optGudang"
                        option-label="nama"
                        placeholder="Pilih Gudang/Project..."
                        bg-color="white"
                        @update:model-value="onGudangChange"
                        behavior="menu"
                      >
                        <template v-slot:prepend
                          ><q-icon name="apartment" color="brand-primary"
                        /></template>
                      </q-select>
                      <q-input
                        v-else
                        filled
                        dense
                        v-model="selectedWarehouseName"
                        readonly
                        bg-color="brand-light"
                        class="text-weight-bold"
                      >
                        <template v-slot:prepend
                          ><q-icon name="apartment" color="brand-primary"
                        /></template>
                      </q-input>
                    </div>

                    <!-- REFF SPK (DIFILTER BERDASARKAN PROJECT) -->
                    <div
                      class="col-12 col-md-4"
                      v-if="selectedWarehouseObj?.id !== 'UTAMA' && warehouseIdContext !== 'UTAMA'"
                    >
                      <div class="label-req q-mb-xs">NO. REFF: (SPK PROJECT)</div>
                      <q-select
                        outlined
                        dense
                        v-model="selectedSpk"
                        :options="filteredSpk"
                        option-label="nomor_spk"
                        placeholder="Pilih Reff SPK..."
                        bg-color="white"
                        :loading="loadingSpk"
                        behavior="menu"
                      >
                        <template v-slot:option="scope">
                          <q-item v-bind="scope.itemProps">
                            <q-item-section>
                              <q-item-label class="text-weight-bold">{{
                                scope.opt.nomor_spk
                              }}</q-item-label>
                              <q-item-label caption class="text-uppercase text-brand-teal text-weight-bold">{{
                                scope.opt.nama_kontrak
                              }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey text-caption"
                              >Tidak ada SPK aktif di project ini.</q-item-section
                            >
                          </q-item>
                        </template>
                      </q-select>
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
              <q-card flat bordered class="rounded-12 q-mb-lg bg-white shadow-1 overflow-hidden" style="width: 100%; max-width: 100%;">
                <q-card-section class="bg-brand-light q-py-xs row items-center border-bottom text-brand-primary">
                  <q-icon name="list_alt" class="q-mr-xs" size="xs" color="brand-primary" />
                  <div class="text-weight-bold uppercase font-11">
                    RINCIAN MATERIAL PENGAJUAN
                  </div>
                  <q-space />
                  <q-btn
                    flat
                    dense
                    icon="add_circle"
                    color="brand-primary"
                    label="Tambah Baris"
                    @click="addItemRow"
                    no-caps
                    class="text-weight-bold"
                  />
                </q-card-section>

                <div class="overflow-auto">
                  <q-markup-table flat separator="cell" class="item-entry-table">
                    <thead>
                      <tr class="bg-brand-light text-brand-primary">
                        <th width="40">NO</th>
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
                          <!-- FIX: Menggunakan Placeholder Dinamis agar tulisan "Tulis rincian..." hilang saat terisi -->
                          <q-select
                            dense
                            borderless
                            v-model="item.barang"
                            :options="masterBarang"
                            option-label="nama"
                            :placeholder="item.barang ? '' : 'Tulis rincian...'"
                            use-input
                            new-value-mode="add-unique"
                            @filter="filterMasterBarang"
                            @update:model-value="(val) => onBarangSelect(val, index)"
                            behavior="menu"
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
                        <td class="text-right text-weight-black text-brand-primary bg-brand-light">
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
                        <td colspan="5" class="text-right text-weight-bold uppercase font-11">
                          Total Estimasi Harga
                        </td>
                        <td class="text-right text-weight-bolder text-brand-primary">
                          Rp {{ calculateTotalPR().toLocaleString() }}
                        </td>
                        <td></td>
                      </tr>
                      <tr class="bg-brand-primary text-white">
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
                </div>
              </q-card>

              <!-- SECTION 3: TERMS & SIGNATURE -->
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="rounded-12 bg-white shadow-1 h-full">
                    <q-card-section
                      class="bg-brand-light q-py-xs text-brand-primary text-weight-bold uppercase font-8 border-bottom"
                    >
                      <q-icon name="gavel" class="q-mr-xs" color="brand-primary" /> Syarat & Kondisi
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
                      class="bg-brand-light q-py-xs text-brand-primary text-weight-bold uppercase font-8 border-bottom"
                    >
                      <q-icon name="draw" class="q-mr-xs" color="brand-primary" /> VALIDASI TANDA TANGAN (PREPARED BY)
                    </q-card-section>
                    <q-card-section class="q-pa-md">
                      <q-editor v-model="form.closing" class="q-mb-md" flat bordered dense />

                      <div class="row q-col-gutter-md items-end">
                        <div class="col-12 col-sm-12">
                          <div class="text-caption text-bold text-grey-7 q-mb-xs">
                            REQUESTOR (DATA LOGIN)
                          </div>
                          <div class="row q-col-gutter-sm">
                            <div class="col-6">
                              <q-input
                                outlined
                                dense
                                v-model="form.ttd_nama"
                                label="Nama Penandatangan"
                                readonly
                                bg-color="blue-grey-1"
                              />
                            </div>
                            <div class="col-6">
                              <q-input
                                outlined
                                dense
                                v-model="form.ttd_jabatan"
                                label="Jabatan"
                                readonly
                                bg-color="blue-grey-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <q-separator class="q-my-md" />

                      <div class="row q-col-gutter-lg items-end">
                        <!-- KOLOM STEMPEL -->
                        <div class="col-12 col-sm-6">
                          <div
                            class="text-caption text-bold text-brand-primary q-mb-xs uppercase font-10"
                          >
                            STEMPEL DIVISI / PERUSAHAAN
                          </div>
                          <q-file
                            outlined
                            dense
                            v-model="tempStempelFile"
                            label="Upload Stempel"
                            accept="image/*"
                            @update:model-value="uploadStempel"
                            bg-color="white"
                            class="q-mb-sm"
                          >
                            <template v-slot:prepend
                              ><q-icon name="local_police" color="brand-primary"
                            /></template>
                          </q-file>
                          <q-card
                            v-if="form.stempel_url"
                            flat
                            bordered
                            class="rounded-12 flex flex-center bg-grey-1 relative-position"
                            style="height: 100px"
                          >
                            <q-img :src="form.stempel_url" style="max-height: 80px" fit="contain" />
                            <q-btn
                              flat
                              round
                              dense
                              icon="close"
                              color="red"
                              size="xs"
                              class="absolute-top-right q-ma-xs"
                              @click.stop="form.stempel_url = ''"
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

                        <!-- KOLOM TANDA TANGAN -->
                        <div class="col-12 col-sm-6">
                          <div
                            class="text-caption text-bold text-brand-primary q-mb-xs uppercase font-8 flex items-center justify-between"
                          >
                            <span>Pilih Metode Sign</span>
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
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- SIGNATURE PAD DIALOG -->
    <q-dialog v-model="showPad" persistent backdrop-filter="blur(4px)">
      <q-card style="width: 500px; max-width: 95vw" class="rounded-20 shadow-24">
        <q-card-section class="row items-center q-pb-none bg-brand-primary text-white q-pa-md">
          <div class="text-h6 text-weight-bold uppercase font-11">Gambar Tanda Tangan</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="white" />
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
            color="brand-primary"
            @click="saveManualSignature"
            rounded
            class="q-px-xl text-weight-bold shadow-premium"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- PREVIEW DIALOG -->
    <q-dialog v-model="showPreview" maximized transition-show="fade" transition-hide="fade">
      <q-card class="column no-wrap bg-grey-4">
        <q-card-section class="col scroll q-pa-none">
          <!-- STICKY TOOLBAR FOR RESPONSIVE SCROLL -->
          <q-toolbar class="bg-brand-primary text-white q-py-md no-print shadow-4 shrink" style="position: sticky; top: 0; z-index: 10; width: 100%;">
            <q-btn flat round dense icon="arrow_back" v-close-popup color="white" />
            <q-toolbar-title class="text-weight-bold ellipsis text-subtitle1">
              PREVIEW DOKUMEN RESMI PR
            </q-toolbar-title>
            <q-btn
              color="red-9"
              unelevated
              rounded
              icon="picture_as_pdf"
              :label="$q.screen.lt.sm ? '' : 'Export'"
              @click="exportToPDF"
              class="font-bold shadow-2 text-white"
            />
          </q-toolbar>

          <div class="q-pa-md q-pa-md-xl flex flex-center preview-container">
          <div id="pr-print-area" class="letter-paper shadow-24" v-if="selectedData">
            <div class="row no-wrap items-center">
              <div v-if="selectedData.logoUrl" class="col-auto q-mr-md">
                <img :src="selectedData.logoUrl" class="final-kop-img" />
              </div>
              <div class="col text-left">
                <div class="final-pt-name uppercase">
                  {{ selectedData.nama_pt || 'PT AGRA ABHINAYA PERKASA' }}
                </div>
                <div class="final-pt-tagline italic text-grey-8">
                  {{ selectedData.slogan_pt || 'General Construction and General Supply' }}
                </div>
              </div>
            </div>
            <div class="final-divider"></div>
            <div class="row q-mt-md q-mb-lg text-left doc-meta items-start">
              <div class="col-7">
                <table class="meta-info-table">
                  <tr>
                    <td class="text-bold label-meta">Kepada Yth</td>
                    <td class="meta-separator">:</td>
                    <td class="text-weight-medium">
                      {{ selectedData.kepada_yth || 'Divisi Purchasing / Procurement' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-bold label-meta">Gudang / Project</td>
                    <td class="meta-separator">:</td>
                    <td class="text-weight-bold text-indigo-10 uppercase">
                      {{ selectedData.proyek_nama || selectedData.gudang_nama || 'UMUM' }}
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
                    <td class="text-weight-medium uppercase">
                      {{ selectedData.pemohon?.nama || selectedData.requestor_nama }}
                    </td>
                  </tr>
                </table>
              </div>
              <div class="col-5 text-right">
                <div class="quotation-title-pro uppercase">PURCHASE REQUEST</div>
                <div class="quotation-no-pro text-indigo-10 text-bold font-mono q-mb-md">
                  No. Pr : {{ selectedData.nomor }}
                </div>
                <div class="row no-wrap justify-end">
                  <div class="text-bold q-mr-md">Tanggal</div>
                  <div class="text-weight-bold">
                    : {{ selectedData.kota || 'Bekasi' }},
                    {{ formatIndoDate(selectedData.tanggal || selectedData.timestamp) }}
                  </div>
                </div>
              </div>
            </div>
            <div
              class="doc-intro q-mb-sm text-left leading-relaxed"
              v-html="
                selectedData.introduction ||
                'Bersama surat ini kami mengajukan permintaan pengadaan material untuk kebutuhan proyek sebagai berikut:'
              "
            ></div>
            <table class="final-pro-table full-width">
              <thead>
                <tr>
                  <th width="5%">NO</th>
                  <th class="text-left" width="45%">ITEM DESCRIPTION</th>
                  <th width="10%">QTY</th>
                  <th width="10%">UNIT</th>
                  <th class="text-right" width="15%">est UNIT PRICE</th>
                  <th class="text-right" width="15%">est AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, i) in selectedData.items" :key="i">
                  <td class="text-center font-bold text-grey-8">{{ i + 1 }}</td>
                  <td class="text-left uppercase text-weight-bold">
                    {{ it.nama_barang || it.deskripsi }}
                  </td>
                  <td class="text-center font-bold">{{ it.qty }}</td>
                  <td class="text-center uppercase text-weight-bold">{{ it.satuan }}</td>
                  <td class="text-right">
                    Rp {{ (it.estimasi_harga || it.est_harga || 0).toLocaleString() }}
                  </td>
                  <td class="text-right text-weight-bolder text-indigo-10">
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
                  <td
                    colspan="5"
                    class="text-right text-weight-bolder uppercase tracking-widest"
                    style="font-size: 13px"
                  >
                    GRAND TOTAL AMOUNT
                  </td>
                  <td class="text-right text-white text-weight-bolder" style="font-size: 13px">
                    IDR {{ (selectedData.total_estimasi || 0).toLocaleString() }}
                  </td>
                </tr>
              </tfoot>
            </table>
            <div class="terms-container text-left q-mt-lg">
              <div class="terms-header uppercase">Syarat & Kondisi :</div>
              <div
                class="terms-content-box leading-relaxed"
                v-html="selectedData.terms || selectedData.syarat || '-'"
              ></div>
            </div>

            <!-- CLOSING TEXT MOVED OUTSIDE -->
            <div
              class="text-closing-final q-mt-md q-mb-md text-left"
              v-html="
                selectedData.closing || 'Demikian permintaan ini kami sampaikan, terima kasih.'
              "
            ></div>

            <div class="signature-container text-left">
              <div class="row justify-end">
                <div class="col-5 text-center">
                  <div class="q-mb-xs text-body2 uppercase tracking-widest text-bold">
                    Prepared By,
                  </div>

                  <!-- FINAL SIGNATURE & STEMPEL OVERLAY -->
                  <div class="final-sign-space flex flex-center">
                    <img
                      v-if="selectedData.stempel_url"
                      :src="selectedData.stempel_url"
                      class="img-stempel"
                    />
                    <img
                      v-if="selectedData.signatureUrl"
                      :src="selectedData.signatureUrl"
                      class="img-signature-clean"
                    />
                    <div
                      v-if="!selectedData.signatureUrl && !selectedData.stempel_url"
                      style="height: 100px"
                      class="flex flex-center text-grey-4 italic w-full"
                    >
                      Belum ada pengesahan
                    </div>
                  </div>

                  <div
                    class="text-signer-final text-weight-black underline uppercase text-indigo-10"
                  >
                    {{
                      selectedData.ttd_nama ||
                      selectedData.requestor_nama ||
                      selectedData.pemohon?.nama
                    }}
                  </div>
                  <div
                    class="text-role-final uppercase text-grey-8 text-caption font-bold block q-mt-xs"
                  >
                    {{ selectedData.ttd_jabatan || selectedData.requestor_jabatan || 'Staff' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- HIDDEN TEMPLATE EXPORT PDF LIST -->
    <div style="display: none">
      <div id="pr-list-export" class="report-paper">
        <div
          class="report-header"
          style="background: linear-gradient(90deg, #36ada3 0%, #1e6e69 100%)"
        >
          <div class="row no-wrap items-center">
            <div class="col-auto q-mr-md">
              <div class="report-icon">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
            </div>
            <div>
              <h1 class="report-title">LAPORAN PURCHASE REQUEST (PR)</h1>
              <div class="report-subtitle">
                Diekspor pada: {{ new Date().toLocaleString('id-ID') }}
              </div>
            </div>
          </div>
        </div>

        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center">NO</th>
              <th style="text-align: left">REFERENCE NO</th>
              <th style="text-align: left">PROJECT / GUDANG</th>
              <th style="text-align: left">REQUESTOR</th>
              <th style="width: 150px; text-align: right">EST. AMOUNT (RP)</th>
              <th style="width: 100px; text-align: center">STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in rows" :key="row.id">
              <td style="text-align: center">{{ idx + 1 }}</td>
              <td style="font-weight: 900; color: #36ada3">{{ row.nomor }}</td>
              <td style="font-weight: bold; text-transform: uppercase">
                {{ row.gudang_nama || row.proyek_nama || 'UMUM' }}
              </td>
              <td>
                <div style="color: #444">{{ row.requestor_nama || row.pemohon?.nama }}</div>
              </td>
              <td style="text-align: right; font-weight: 800">
                Rp {{ (row.total_estimasi || 0).toLocaleString() }}
              </td>
              <td style="text-align: center">
                <span class="status-badge" :class="'status-' + (row.status || 'Pending')">
                  {{ row.status || 'Pending' }}
                </span>
              </td>
            </tr>
            <tr v-if="rows.length === 0">
              <td colspan="6" style="text-align: center; color: #888; font-style: italic">
                Belum ada data pengajuan PR.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="q-py-xl no-print"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
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
const warehouseIdContext = route.params.id || route.query.warehouseId // Bersifat fleksibel ambil ID
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
const tempStempelFile = ref(null)
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
  stempel_url: '',
  approve_nama: 'Wartono',
  approve_jabatan: 'Manager Operasional',
  no_reff: '',
  catatan: '',
  status: 'Draft',
}
const form = ref({ ...formDefault })

// --- PERMISSIONS ---
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const targetId = '_konstruksi_gudang'
  const menu = modulePerm.menus.find((m) => m.id === targetId)
  return menu ? menu[actionType] || false : false
}

// MENGHITUNG SPK YANG BERKAITAN DENGAN GUDANG SAJA (MEMORI FILTERING)
const filteredSpk = computed(() => {
  const wId = selectedWarehouseObj.value?.id || warehouseIdContext
  if (!wId || wId === 'UTAMA') return []
  return optSpk.value.filter((s) => s.projectId === wId)
})

const fetchData = async () => {
  loading.value = true
  const confRef = doc(db, 'config', 'perusahaan')
  const configSnap = await getDoc(confRef)
  if (configSnap.exists()) config.value = configSnap.data()

  // FETCH ARRAY (Filter jika masuk dari Gudang/Project tertentu)
  unsubRows = onSnapshot(collection(db, 'permintaan_barang'), (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    rows.value = all
      .filter((it) => it.tipe === 'PURCHASE_REQUEST')
      .filter((it) =>
        warehouseIdContext
          ? it.gudang_id === warehouseIdContext || it.proyek_id === warehouseIdContext
          : true,
      )
      .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
    loading.value = false
  })

  // AMBIL DATA GUDANG / PROYEK DARI DB
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

  // AMBIL DATA MASTER BARANG
  const barSnap = await getDocs(collection(db, 'master_barang'))
  allBarang.value = barSnap.docs
    .map((d) => ({ id: d.id, nama: d.data().nama, unit: d.data().unit }))
    .sort((a, b) => a.nama.localeCompare(b.nama))
  masterBarang.value = [...allBarang.value]

  // --- MENGAMBIL DATA SPK UNTUK DROPDOWN REFF ---
  loadingSpk.value = true
  try {
    const spkSnap = await getDocs(collection(db, 'spk_customer'))
    optSpk.value = spkSnap.docs.map((d) => ({
      id: d.id,
      nomor_spk: d.data().nomor_spk || d.data().nomor || d.id,
      projectId: d.data().projectId,
      nama_kontrak: d.data().nama_kontrak || '-',
      ...d.data(),
    }))
  } catch (err) {
    console.error('Error fetching SPK reference', err)
  } finally {
    loadingSpk.value = false
  }
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

  // FIX: Preservasi Konteks Jika Dibuat Dari Gudang Tertentu
  if (warehouseIdContext) {
    const found = optGudang.value.find((g) => g.id === warehouseIdContext)
    if (found) {
      selectedWarehouseObj.value = found
      selectedWarehouseName.value = found.nama
    }
    const relSpk = optSpk.value.filter((s) => s.projectId === warehouseIdContext)
    if (relSpk.length > 0) {
      selectedSpk.value = relSpk[0]
    } else {
      selectedSpk.value = null
    }
  } else {
    selectedWarehouseObj.value = null
    selectedWarehouseName.value = ''
    selectedSpk.value = null
  }

  tempKopFile.value = null
  tempStempelFile.value = null
  tempSignFile.value = null

  showDialog.value = true
}

const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = JSON.parse(JSON.stringify(row))

  if (row.no_reff) {
    selectedSpk.value = optSpk.value.find((s) => s.nomor_spk === row.no_reff) || null
  } else {
    selectedSpk.value = null
  }

  if (row.gudang_id || row.proyek_id) {
    const found = optGudang.value.find((g) => g.id === (row.gudang_id || row.proyek_id))
    if (found) {
      selectedWarehouseObj.value = found
      selectedWarehouseName.value = found.nama
    }
  }

  tempKopFile.value = null
  tempStempelFile.value = null
  tempSignFile.value = null

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

const openPreview = async (r) => {
  selectedData.value = r
  showPreview.value = true

  if ((r.status === 'Approved' || r.status === 'Rejected') && r.requester_read === false) {
    try {
      await updateDoc(doc(db, 'permintaan_barang', r.id), { requester_read: true })
      const idx = rows.value.findIndex((item) => item.id === r.id)
      if (idx !== -1) rows.value[idx].requester_read = true
    } catch (e) {
      console.error('Gagal update status read:', e)
    }
  }
}

const submitPurchaseRequest = async () => {
  if (!selectedWarehouseObj.value && !selectedWarehouseName.value)
    return $q.notify({ type: 'negative', message: 'Gudang tidak terdeteksi!' })
  if (!form.value.signatureUrl)
    return $q.notify({ type: 'warning', message: 'Tanda tangan wajib diisi!' })

  submitting.value = true
  try {
    const payload = {
      ...form.value,
      tipe: 'PURCHASE_REQUEST',
      gudang_id: selectedWarehouseObj.value?.id || warehouseIdContext || '',
      gudang_nama: selectedWarehouseObj.value?.nama || selectedWarehouseName.value || '',
      proyek_id: selectedWarehouseObj.value?.id || warehouseIdContext || '',
      proyek_nama: selectedWarehouseObj.value?.nama || selectedWarehouseName.value || '',
      no_reff: selectedSpk.value?.nomor_spk || form.value.no_reff || '',
      total_estimasi: calculateTotalPR() || 0,
      pemohon: {
        id: authStore.user?.uid || authStore.user?.id || '',
        nama: authStore.user?.nama || userData.value?.nama || 'Admin',
        email: authStore.user?.email || '',
      },
      updatedAt: serverTimestamp(),
    }

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        payload[key] = ''
      }
    })

    payload.items = payload.items.map((it) => {
      let nm = it.nama_barang
      if (it.barang && typeof it.barang === 'string') nm = it.barang
      else if (it.barang && it.barang.nama) nm = it.barang.nama

      return {
        id_barang: it.id_barang || '',
        nama_barang: nm || it.deskripsi || 'Item Tanpa Nama',
        qty: Number(it.qty) || 1,
        satuan: it.satuan || 'ls',
        estimasi_harga: Number(it.estimasi_harga) || Number(it.est_harga) || 0,
        total: Number(it.total) || 0,
      }
    })

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

const onGudangChange = (val) => {
  if (val) {
    selectedWarehouseName.value = val.nama
    const relSpk = optSpk.value.filter((s) => s.projectId === val.id)
    if (relSpk.length > 0) {
      selectedSpk.value = relSpk[0]
    } else {
      selectedSpk.value = null
    }
  }
}

// --- IMAGE UPLOAD LOGIC ---
const resizeImageToBase64 = (file, maxWidth = 400) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scaleSize = maxWidth / img.width
        canvas.width = maxWidth
        canvas.height = img.height * scaleSize
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/png', 0.8))
      }
    }
    reader.onerror = (error) => reject(error)
  })
}

const handleLogoChange = async (f) => {
  if (!f) return
  resizeImageToBase64(f, 400).then((res) => {
    form.value.logoUrl = res
    setDoc(doc(db, 'config', 'perusahaan'), { kopUrl: res }, { merge: true })
  })
}
const uploadStempel = (file) => {
  if (!file) return
  resizeImageToBase64(file, 300).then((res) => (form.value.stempel_url = res))
}
const uploadSignatureFile = (file) => {
  if (!file) return
  resizeImageToBase64(file, 300).then((res) => {
    form.value.signatureUrl = res
    $q.notify({ type: 'positive', message: 'Tanda tangan diunggah' })
  })
}

// --- SIGNATURE PAD LOGIC ---
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

// --- TABLE & CALCULATION LOGIC ---
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
    if (typeof v === 'string') {
      form.value.items[idx].id_barang = ''
      form.value.items[idx].nama_barang = v
      form.value.items[idx].satuan = 'ls'
    } else {
      form.value.items[idx].id_barang = v.id || ''
      form.value.items[idx].nama_barang = v.nama || ''
      form.value.items[idx].satuan = v.unit || 'ls'
    }
    calcRow(idx)
  }
}
const filterMasterBarang = (v, u) => {
  u(() => {
    const n = v.toLowerCase()
    masterBarang.value = allBarang.value.filter((x) => x.nama.toLowerCase().includes(n))
  })
}

// --- EXPORT & PDF PREVIEW LOGIC ---
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

const exportToPDF = () => {
  $q.loading.show({ message: 'Generating PDF...' })
  
  const element = document.getElementById('pr-print-area')
  if (!element || !selectedData.value?.nomor) {
    $q.loading.hide()
    return $q.notify({ type: 'negative', message: 'Dokumen belum siap untuk diekspor.' })
  }

  const opt = {
    margin: 0,
    filename: `PR_${selectedData.value.nomor.replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      width: 794,
      windowWidth: 794
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }

  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => {
      $q.loading.hide()
      $q.notify({ type: 'positive', message: 'PDF Berhasil Terunduh!', position: 'top' })
    })
    .catch((err) => {
      $q.loading.hide()
      $q.notify({ type: 'negative', message: 'Gagal export PDF: ' + err.message })
    })
}

const exportListToPDF = () => {
  $q.loading.show({ message: 'Generating Colorful PDF Report...' })
  setTimeout(() => {
    const element = document.getElementById('pr-list-export')
    const opt = {
      margin: [15, 15, 15, 15],
      filename: `Laporan_PR_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    }
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        $q.loading.hide()
        $q.notify({ type: 'positive', message: 'Laporan PDF Berhasil Diunduh!', position: 'top' })
      })
  }, 800)
}

const exportListToExcel = () => {
  const now = new Date()
  const exportDate = now.toLocaleString('id-ID')

  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
    <meta charset="utf-8" />
    <style>
      .table-bordered { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 12px; }
      .table-bordered th, .table-bordered td { border: 1px solid #dddddd; padding: 10px; vertical-align: middle; }
      .header-row th { background-color: #36ada3; color: #ffffff; font-weight: bold; text-align: left; }
      .title { font-size: 18px; font-weight: bold; color: #36ada3; font-family: sans-serif; }
      .subtitle { font-size: 12px; color: #666666; font-family: sans-serif; }
      .status-approved { color: #2e7d32; font-weight: bold; background-color: #e8f5e9; }
      .status-pending { color: #e65100; font-weight: bold; background-color: #fff3e0; }
      .status-rejected { color: #c62828; font-weight: bold; background-color: #ffebee; }
    </style>
    </head>
    <body>
      <div class="title">LAPORAN PURCHASE REQUEST (PR) - PENGADAAN MATERIAL</div>
      <div class="subtitle">Diekspor pada: ${exportDate}</div>
      <br>
      <table class="table-bordered">
        <tr class="header-row">
          <th width="50" style="text-align: center;">NO</th>
          <th width="150">REFERENCE NO</th>
          <th width="250">PROJECT / GUDANG</th>
          <th width="200">REQUESTOR</th>
          <th width="150" style="text-align: right;">EST. AMOUNT (RP)</th>
          <th width="120" style="text-align: center;">STATUS</th>
        </tr>
  `

  let totalAmount = 0
  rows.value.forEach((row, idx) => {
    totalAmount += row.total_estimasi || 0
    const statusClass =
      row.status === 'Approved'
        ? 'status-approved'
        : row.status === 'Rejected'
          ? 'status-rejected'
          : 'status-pending'

    html += `
      <tr>
        <td align="center">${idx + 1}</td>
        <td style="font-weight: bold; color: #36ada3;">${row.nomor}</td>
        <td style="text-transform: uppercase;">${row.gudang_nama || row.proyek_nama || 'UMUM'}</td>
        <td>${row.requestor_nama || row.pemohon?.nama}</td>
        <td align="right" style="font-weight: bold;">${row.total_estimasi || 0}</td>
        <td align="center" class="${statusClass}">${row.status || 'Pending'}</td>
      </tr>
    `
  })

  html += `
        <tr>
          <td colspan="4" align="right" style="font-weight: bold; background-color: #f5f5f5;">GRAND TOTAL ESTIMASI</td>
          <td align="right" style="font-weight: bold; color: #36ada3; font-size: 14px; background-color: #f5f5f5;">${totalAmount}</td>
          <td style="background-color: #f5f5f5;"></td>
        </tr>
      </table>
    </body>
    </html>
  `

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Laporan_PR_${Date.now()}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
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
.bg-brand-primary {
  background-color: #36ada3 !important;
}
.text-brand-primary {
  color: #36ada3 !important;
}
.bg-brand-light {
  background-color: #e0f5f4 !important;
}
.text-brand-teal {
  color: #36ada3 !important;
}
.bg-brand-danger {
  background-color: #ad3640 !important;
}
.text-brand-danger {
  color: #ad3640 !important;
}
.bg-brand-primary.q-btn {
  background-color: #36ada3 !important;
  color: white !important;
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
  box-shadow: 0 10px 30px rgba(54, 173, 163, 0.2);
}
.uppercase {
  text-transform: uppercase;
}
.overflow-auto {
  overflow-x: auto !important;
  max-width: 100% !important;
  width: 100% !important;
  display: block;
}
.overflow-x-hidden {
  overflow-x: hidden !important;
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
.item-entry-table :deep(table) {
  min-width: 800px !important;
}
.item-entry-table :deep(thead th) {
  padding: 12px;
  font-weight: 800;
}
.item-entry-table :deep(tbody td) {
  border-bottom: 1px solid #f0f0f0;
}
.signature-pad-wrapper {
  border: 2px dashed #36ada3;
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
  font-size: 12px;
  color: #111;
}
.letter-paper {
  background: white;
  width: 210mm;
  min-width: 210mm;
  flex-shrink: 0;
  min-height: 296mm;
  padding: 15mm 20mm;
  margin: 0 auto;
  color: #1a1a1a;
  line-height: 1.5;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.preview-container {
  width: 100%;
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch;
  display: flex !important;
  justify-content: flex-start !important;
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
  background: #1a237e;
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
  font-size: 12px;
  color: #333;
}
.doc-intro {
  font-size: 12px;
}
.text-closing-final {
  font-size: 12px;
}
.signature-container {
  margin-top: 15px;
  padding-top: 15px;
}

/* FIX STEMPEL & SIGNATURE CSS Absolute Positioning */
.final-sign-space {
  position: relative;
  height: 120px;
  width: 250px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 10px;
}
.img-stempel {
  position: absolute;
  width: 110px;
  height: auto;
  left: 50%;
  bottom: 15px;
  transform: translateX(-50%);
  z-index: 2;
  opacity: 0.95;
}
.img-signature-clean {
  position: absolute;
  max-height: 100px;
  max-width: 180px;
  left: 50%;
  bottom: 5px;
  transform: translateX(-50%);
  z-index: 1;
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
  background-color: rgba(54, 173, 163, 0.06) !important;
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

/* HIDDEN EXPORT PDF DESIGN */
.report-paper {
  font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif;
  color: #333;
  padding: 10px;
  background: white;
}
.report-header {
  background: linear-gradient(90deg, #36ada3 0%, #1e6e69 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 25px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.report-icon {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.report-title {
  margin: 0;
  color: white;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 1px;
}
.report-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  margin-top: 4px;
}
.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.report-table th {
  background-color: #36ada3;
  color: white;
  padding: 12px;
  border: 1px solid #e0e0e0;
  text-transform: uppercase;
  font-weight: 800;
  font-size: 11px;
}
.report-table td {
  padding: 12px;
  border: 1px solid #e0e0e0;
  vertical-align: middle;
}
.report-table tr:nth-child(even) {
  background-color: #f8f9fa;
}

/* Status Badges for PDF */
.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 10px;
  text-transform: uppercase;
}
.status-Approved {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}
.status-Pending {
  background-color: #fff3e0;
  color: #e65100;
  border: 1px solid #ffe0b2;
}
.status-Rejected {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
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

/* ===== QUASAR COMPONENT DEEP OVERRIDES ===== */
/* Primary buttons and elements */
:deep(.q-btn[color='brand-primary']) {
  background: #36ada3 !important;
  color: white !important;
}
:deep(.q-btn--unelevated.q-btn[color='brand-primary']) {
  background: #36ada3 !important;
}
:deep(.q-avatar[color='brand-primary']) {
  background-color: #36ada3 !important;
  color: white !important;
}
:deep(.q-avatar[color='brand-light']) {
  background-color: #e0f5f4 !important;
  color: #1e6e69 !important;
}
:deep(.q-btn[color='brand-danger']) {
  color: #ad3640 !important;
}
:deep(.q-btn--flat[color='brand-danger']) {
  color: #ad3640 !important;
}
:deep(.q-btn--flat[color='brand-primary']) {
  color: #36ada3 !important;
}
:deep(.q-icon[color='brand-primary']),
:deep(.q-field__prepend .q-icon) {
  color: #36ada3 !important;
}
:deep(.q-expansion-item .q-item__section--avatar .q-icon) {
  color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__control) {
  border-color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__label) {
  color: #36ada3 !important;
}
:deep(.hover-blue-btn:hover) {
  background-color: #e0f5f4 !important;
  color: #1e6e69 !important;
}
</style>
