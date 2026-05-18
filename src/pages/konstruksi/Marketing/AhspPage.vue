<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <!-- =====================================================================================
         SCREEN 1: LOCK SCREEN JIKA TIDAK MEMILIKI AKSES LIHAT
         ===================================================================================== -->
    <template v-if="!canAction('lihat')">
      <div
        class="row flex-center q-pa-xl text-center font-pro animate-fade"
        style="min-height: 70vh"
      >
        <div
          class="col-12 col-sm-8 col-md-6 bg-white q-pa-xl rounded-20 shadow-premium border-subtle"
        >
          <q-avatar size="100px" color="red-1" text-color="red-10" icon="lock" class="q-mb-md" />
          <div class="text-h5 text-weight-bold text-blue-grey-10 q-mb-xs">Akses Terbatas</div>
          <div class="text-body2 text-grey-7 q-mb-lg leading-relaxed">
            Maaf, Anda tidak memiliki izin untuk melihat modul Analisa Harga Satuan (AHSP). Silakan
            hubungi Administrator atau Super Admin untuk konfigurasi hak akses Anda.
          </div>
          <q-btn
            label="Kembali ke Beranda"
            color="indigo-10"
            icon="arrow_back"
            rounded
            unelevated
            no-caps
            @click="$router.push('/')"
          />
        </div>
      </div>
    </template>

    <!-- =====================================================================================
         SCREEN 2: KONTEN UTAMA AHSP JIKA MEMILIKI AKSES LIHAT
         ===================================================================================== -->
    <template v-else>
      <!-- HEADER SECTION -->
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
                Analisa Harga Satuan (AHSP)
                <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
                  Manajemen Uraian & Detail Pekerjaan
                </span>
              </div>
              <div class="text-subtitle1 text-grey-7 q-mt-sm">
                Kelola standarisasi harga, koefisien material, dan tenaga kerja secara terpusat.
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-auto q-mt-md q-mt-md-none text-right">
          <q-btn
            v-if="canAction('buat')"
            color="indigo-10"
            icon="add_circle"
            label="Buat Uraian Pekerjaan"
            unelevated
            rounded
            no-caps
            class="q-px-lg q-py-sm shadow-premium btn-hover text-weight-bold"
            @click="openMasterDialog(null)"
          />
        </div>
      </div>

      <!-- SEARCH & SUMMARY CARD -->
      <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print">
        <q-card-section class="q-py-md">
          <div class="row items-center q-col-gutter-md">
            <div class="col-12 col-md-5">
              <q-input
                v-model="filter"
                outlined
                dense
                rounded
                placeholder="Cari Kode atau Nama Uraian Pekerjaan..."
                bg-color="white"
                class="search-input"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="primary" />
                </template>
                <template v-slot:append v-if="filter">
                  <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </div>
            <q-space />
            <div class="col-12 col-md-auto text-caption text-grey-6">
              Total Uraian:
              <span class="text-weight-bold text-indigo-10">{{ rows.length }} Record</span>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- DAFTAR URAIAN UTAMA (TABLE VIEW) -->
      <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white no-print">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          flat
          :loading="loading"
          :filter="filter"
          binary-state-sort
          class="ahsp-main-table"
          :pagination="{ rowsPerPage: 15 }"
        >
          <!-- Custom Header -->
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-indigo-10 text-white">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bold uppercase tracking-widest font-11"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <!-- Custom Body -->
          <template v-slot:body="props">
            <q-tr
              :props="props"
              class="hover-bg transition-all cursor-pointer"
              @click="openDetailDialog(props.row)"
            >
              <q-td key="kode" class="text-weight-bold text-grey-7 font-mono uppercase">
                {{ props.row.kode || '-' }}
              </q-td>

              <q-td key="nama_uraian">
                <div class="row items-center no-wrap">
                  <q-avatar
                    size="36px"
                    color="indigo-1"
                    text-color="indigo-10"
                    icon="folder"
                    class="q-mr-md shadow-sm"
                  />
                  <div>
                    <div class="text-weight-bold text-subtitle2 text-blue-grey-10 uppercase">
                      {{ props.row.nama_uraian }}
                    </div>
                    <div class="text-caption text-grey-6 text-weight-medium">
                      {{ props.row.details?.length || 0 }} Baris Item Analisa
                    </div>
                  </div>
                </div>
              </q-td>

              <q-td key="satuan" class="text-center">
                <q-badge outline color="blue-grey-4" class="text-weight-bold uppercase">
                  {{ props.row.satuan || '-' }}
                </q-badge>
                <!-- Badge Status Otorisasi Approved -->
                <q-badge
                  v-if="props.row.status === 'Approved'"
                  color="positive"
                  class="q-ml-xs text-weight-bold"
                >
                  APPROVED
                </q-badge>
              </q-td>

              <q-td key="harga" class="text-right">
                <div class="text-weight-bolder text-indigo-10 text-subtitle2">
                  Rp
                  {{
                    hitungTotalUraian(props.row).toLocaleString('id-ID', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  }}
                </div>
              </q-td>

              <q-td key="aksi" class="text-center" @click.stop>
                <div class="row justify-center q-gutter-sm">
                  <q-btn
                    v-if="canAction('lihat')"
                    flat
                    round
                    color="indigo-10"
                    icon="visibility"
                    size="sm"
                    @click.stop="openPreview(props.row)"
                  >
                    <q-tooltip>Preview Dokumen</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="canAction('ubah')"
                    flat
                    round
                    color="blue-8"
                    icon="edit"
                    size="sm"
                    @click.stop="openMasterDialog(props.row)"
                  >
                    <q-tooltip>Edit Uraian</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="canAction('hapus')"
                    flat
                    round
                    color="negative"
                    icon="delete_outline"
                    size="sm"
                    @click.stop="confirmHapus(props.row)"
                  >
                    <q-tooltip>Hapus</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>

          <!-- Empty State -->
          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-xl text-grey-5">
              <q-icon name="folder_off" size="64px" class="q-mb-md opacity-50" /><br />
              <div class="text-h6 full-width text-center">Belum ada uraian pekerjaan.</div>
              <div class="text-body2 q-mt-sm">Klik "Buat Uraian Pekerjaan" untuk memulai.</div>
            </div>
          </template>
        </q-table>
      </q-card>

      <!-- DIALOG 1: BUAT / EDIT URAIAN MASTER -->
      <q-dialog v-model="showMasterDialog" persistent backdrop-filter="blur(4px)">
        <q-card style="width: 500px; max-width: 95vw" class="rounded-20 shadow-24 bg-grey-2">
          <q-toolbar class="bg-white text-indigo-10 q-py-md shadow-2 shrink">
            <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
            <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest font-11">
              {{ isEditMaster ? 'EDIT URAIAN PEKERJAAN' : 'BUAT URAIAN BARU' }}
            </q-toolbar-title>
            <q-btn
              unelevated
              color="indigo-10"
              label="SIMPAN"
              rounded
              class="q-px-lg text-weight-bold shadow-3"
              @click="saveMaster"
              :loading="submitting"
            />
          </q-toolbar>

          <q-card-section class="scroll q-pa-lg">
            <q-card flat bordered class="rounded-16 bg-white shadow-1 q-pa-lg">
              <div
                class="text-subtitle2 text-weight-black text-indigo-10 q-mb-lg flex items-center"
              >
                <q-icon name="info" class="q-mr-sm" size="sm" /> INFORMASI DASAR AHSP
              </div>
              <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-12">
                  <div
                    class="text-caption text-weight-bold text-grey-7 q-mb-xs uppercase tracking-widest font-10"
                  >
                    Nama Uraian Utama *
                  </div>
                  <q-input
                    v-model="masterForm.nama_uraian"
                    outlined
                    dense
                    placeholder="Contoh: Pekerjaan Tanah / Struktur"
                    autofocus
                    class="text-weight-bold"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <div
                    class="text-caption text-weight-bold text-grey-7 q-mb-xs uppercase tracking-widest font-10"
                  >
                    Nomor / Kode Dokumen
                  </div>
                  <q-input
                    v-model="masterForm.kode"
                    outlined
                    dense
                    placeholder="A.2.2.1"
                    class="text-weight-medium"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <div
                    class="text-caption text-weight-bold text-grey-7 q-mb-xs uppercase tracking-widest font-10"
                  >
                    Satuan Pekerjaan
                  </div>
                  <q-input
                    v-model="masterForm.satuan"
                    outlined
                    dense
                    placeholder="m2, ls, unit..."
                    class="text-weight-medium"
                  />
                </div>
              </div>
            </q-card>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- DIALOG 2: DETAIL DINAMIS SUB-URAIAN (EXCEL-LIKE INPUT) -->
      <q-dialog
        v-model="showDetailDialog"
        maximized
        transition-show="slide-up"
        transition-hide="slide-down"
      >
        <q-card class="column bg-grey-2">
          <q-toolbar class="bg-white text-indigo-10 q-py-sm q-py-md-md shadow-2 shrink">
            <q-btn flat round dense icon="arrow_back" v-close-popup color="grey-7" />
            <q-toolbar-title
              class="text-weight-bold uppercase tracking-widest font-10 text-subtitle2 text-sm-subtitle1"
            >
              <span class="gt-xs">Detail Uraian: </span>{{ selectedItem?.nama_uraian }}
            </q-toolbar-title>
            <q-btn
              v-if="canAction('ubah')"
              unelevated
              color="indigo-10"
              :label="$q.screen.gt.xs ? 'Simpan Analisa' : 'Simpan'"
              @click="saveDetailChanges"
              rounded
              class="q-px-md q-px-sm-xl text-weight-bold shadow-3"
              :loading="submitting"
            />
          </q-toolbar>

          <q-card-section class="col scroll q-pa-sm q-pa-md-xl">
            <div class="row justify-center">
              <div class="col-12 col-xl-10">
                <q-card
                  flat
                  bordered
                  class="rounded-16 bg-white overflow-hidden shadow-1 border-indigo-thin"
                >
                  <q-card-section class="bg-indigo-1 row items-center q-pa-md q-pa-sm-lg">
                    <div
                      class="col-12 col-md-auto text-weight-black text-indigo-10 text-subtitle1 text-sm-h6 uppercase tracking-widest q-mb-md q-mb-md-none"
                    >
                      {{ selectedItem?.nama_uraian }}
                      <span v-if="selectedItem?.satuan" class="text-grey-6 text-subtitle2"
                        >/ {{ selectedItem.satuan }}</span
                      >
                    </div>
                    <q-space class="gt-sm" />
                    <div class="col-12 col-md-auto row q-gutter-sm">
                      <q-btn
                        v-if="canAction('ubah')"
                        color="indigo-10"
                        icon="title"
                        :label="$q.screen.gt.xs ? 'Tambah Judul Kategori' : 'Judul'"
                        @click="addTitleRow"
                        no-caps
                        outline
                        rounded
                        class="col col-sm-auto bg-white text-weight-bold"
                      />
                      <q-btn
                        v-if="canAction('ubah')"
                        color="primary"
                        icon="add"
                        :label="$q.screen.gt.xs ? 'Tambah Sub-Uraian' : 'Sub-Uraian'"
                        @click="addSubRow"
                        no-caps
                        outline
                        rounded
                        class="col col-sm-auto bg-white text-weight-bold"
                      />
                    </div>
                  </q-card-section>

                  <q-markup-table flat separator="cell" class="ahsp-input-table" wrap-cells="false">
                    <thead>
                      <tr>
                        <th style="min-width: 50px" class="text-center">NO</th>
                        <th style="min-width: 250px" class="text-left">URAIAN PEKERJAAN</th>
                        <th style="min-width: 100px" class="text-center">KODE</th>
                        <th style="min-width: 100px" class="text-center">SATUAN</th>
                        <th style="min-width: 100px" class="text-center">KOEFISIEN</th>
                        <th style="min-width: 150px" class="text-right">HARGA SATUAN</th>
                        <th style="min-width: 160px" class="text-right">JUMLAH HARGA</th>
                        <th style="min-width: 50px"></th>
                      </tr>
                    </thead>

                    <tbody v-for="(sub, idx) in detailList" :key="sub.id || idx">
                      <tr :class="sub.isTitle ? 'bg-indigo-50 border-title' : 'hover-row'">
                        <template v-if="sub.isTitle">
                          <td class="text-center text-weight-black text-subtitle1 text-indigo-10">
                            {{ getTitleIndex(idx) }}
                          </td>
                          <td colspan="6">
                            <q-input
                              v-model="sub.uraian"
                              dense
                              borderless
                              :readonly="!canAction('ubah')"
                              class="text-weight-black text-subtitle2 text-sm-subtitle1 text-indigo-10 uppercase"
                              placeholder="Ketik Judul Kategori (misal: Tenaga Kerja)..."
                            />
                          </td>
                          <td class="text-center">
                            <q-btn
                              v-if="canAction('ubah')"
                              flat
                              round
                              color="negative"
                              icon="delete"
                              size="xs"
                              @click="removeSubRow(idx)"
                            />
                          </td>
                        </template>
                        <template v-else>
                          <td class="text-center text-weight-bold text-grey-7">
                            {{ getSubIndex(idx) }}
                          </td>
                          <td>
                            <q-input
                              v-model="sub.uraian"
                              dense
                              borderless
                              :readonly="!canAction('ubah')"
                              placeholder="Nama pekerjaan..."
                              class="text-weight-medium"
                            />
                          </td>
                          <td>
                            <q-input
                              v-model="sub.kode"
                              dense
                              borderless
                              :readonly="!canAction('ubah')"
                              input-class="text-center text-grey-8 uppercase"
                              placeholder="-"
                            />
                          </td>
                          <td>
                            <q-input
                              v-model="sub.satuan"
                              dense
                              borderless
                              :readonly="!canAction('ubah')"
                              input-class="text-center text-weight-bold uppercase text-primary"
                              placeholder="m2/OH/.."
                            />
                          </td>
                          <td>
                            <q-input
                              v-model.number="sub.koef"
                              type="number"
                              dense
                              borderless
                              :readonly="!canAction('ubah')"
                              input-class="text-center text-weight-bold"
                            />
                          </td>
                          <td>
                            <q-input
                              v-model.number="sub.harga"
                              type="number"
                              dense
                              borderless
                              :readonly="!canAction('ubah')"
                              input-class="text-right"
                              prefix="Rp"
                            />
                          </td>
                          <td class="text-right text-weight-bold text-indigo-10 bg-indigo-0">
                            Rp
                            {{
                              ((sub.koef || 0) * (sub.harga || 0)).toLocaleString('id-ID', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            }}
                          </td>
                          <td class="text-center">
                            <q-btn
                              v-if="canAction('ubah')"
                              flat
                              round
                              color="grey-5"
                              icon="close"
                              size="xs"
                              @click="removeSubRow(idx)"
                              class="hover-red-btn"
                            />
                          </td>
                        </template>
                      </tr>

                      <!-- SUBTOTAL KATEGORI ROW -->
                      <tr
                        v-if="
                          !sub.isTitle &&
                          (idx === detailList.length - 1 || detailList[idx + 1].isTitle)
                        "
                        class="bg-grey-1"
                      >
                        <td colspan="6" class="text-right text-weight-bold text-blue-grey-9">
                          Jumlah {{ getGroupName(idx) }} ({{ getTitleIndexForSubtotal(idx) }})
                        </td>
                        <td class="text-right text-weight-black text-indigo-10">
                          Rp
                          {{
                            getGroupSubtotal(idx).toLocaleString('id-ID', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          }}
                        </td>
                        <td></td>
                      </tr>
                    </tbody>

                    <tbody v-if="detailList.length === 0">
                      <tr>
                        <td colspan="8" class="text-center q-pa-xl text-grey-5 italic">
                          <q-icon
                            name="post_add"
                            size="48px"
                            class="q-mb-sm opacity-50"
                          /><br />Belum ada rincian data.
                        </td>
                      </tr>
                    </tbody>

                    <tfoot v-if="detailList.length > 0">
                      <!-- D: JUMLAH A+B+C -->
                      <tr class="bg-blue-grey-1 text-blue-grey-9">
                        <td class="text-center text-weight-bold">D</td>
                        <td
                          colspan="5"
                          class="text-left text-weight-bold uppercase tracking-widest text-caption"
                        >
                          JUMLAH HARGA TENAGA, BAHAN DAN PERALATAN (A+B+C)
                        </td>
                        <td class="text-right text-weight-bold text-subtitle2">
                          Rp
                          {{
                            totalCurrentDetail.toLocaleString('id-ID', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          }}
                        </td>
                        <td></td>
                      </tr>
                      <!-- E: OVERHEAD & PROFIT -->
                      <tr class="bg-blue-grey-1 text-blue-grey-9">
                        <td class="text-center text-weight-bold">E</td>
                        <td
                          colspan="5"
                          class="text-left text-weight-bold uppercase tracking-widest text-caption"
                        >
                          <div class="row items-center no-wrap">
                            <span class="q-mr-sm">OVERHEAD + PROFIT (</span>
                            <q-input
                              v-model.number="overheadPercent"
                              type="number"
                              dense
                              borderless
                              hide-bottom-space
                              :readonly="!canAction('ubah')"
                              input-class="text-center text-weight-bolder text-primary"
                              class="input-overhead shadow-sm"
                            />
                            <span class="q-ml-sm">% * D)</span>
                          </div>
                        </td>
                        <td class="text-right text-weight-bold text-subtitle2">
                          Rp
                          {{
                            overheadValue.toLocaleString('id-ID', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          }}
                        </td>
                        <td></td>
                      </tr>
                      <!-- F: GRAND TOTAL -->
                      <tr class="bg-indigo-10 text-white">
                        <td class="text-center text-weight-bolder">F</td>
                        <td
                          colspan="5"
                          class="text-left text-weight-bolder text-uppercase tracking-widest text-subtitle2"
                        >
                          HARGA SATUAN PEKERJAAN (D+E)
                        </td>
                        <td class="text-right text-weight-black text-h6">
                          Rp
                          {{
                            grandTotalDetail.toLocaleString('id-ID', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          }}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </q-markup-table>
                </q-card>
              </div>
            </div>
            <div class="q-py-xl"></div>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- DIALOG 3: PREVIEW DOKUMEN CETAK (PROFESSIONAL PDF LAYOUT) -->
      <q-dialog v-model="showPreviewDialog" maximized transition-show="fade" transition-hide="fade">
        <q-card class="column no-wrap bg-grey-4">
          <q-toolbar class="bg-white text-indigo-10 q-py-sm no-print shadow-2 shrink">
            <q-btn flat round dense icon="arrow_back" v-close-popup />
            <q-toolbar-title class="text-weight-bold uppercase tracking-widest font-11"
              >PREVIEW DOKUMEN AHSP</q-toolbar-title
            >
            <q-space />
            <q-btn-group unelevated rounded class="shadow-2">
              <!-- TOMBOL UNTUK SETUJUI (APPROVE) DOKUMEN AHSP -->
              <q-btn
                v-if="canAction('setuju') && previewItem?.status !== 'Approved'"
                color="positive"
                icon="check_circle"
                label="Setujui Analisa"
                class="q-px-md text-weight-bold"
                @click="approveAhsp(previewItem)"
              />
              <q-btn
                color="primary"
                icon="print"
                label="Cetak"
                @click="printPage"
                class="q-px-md"
              />
              <q-btn color="red-9" icon="picture_as_pdf" label="Export PDF" @click="exportToPDF" />
            </q-btn-group>
          </q-toolbar>

          <q-card-section class="col scroll q-pa-md q-pa-md-xl flex flex-center preview-container">
            <!-- AREA CETAK PDF AHSP (MENGGUNAKAN STANDAR LETTER-PAPER) -->
            <div id="ahsp-print-area" class="letter-paper shadow-24" v-if="previewItem">
              <!-- KOP SURAT -->
              <div class="row no-wrap items-center">
                <div class="col-auto q-mr-xl">
                  <img :src="config.kopUrl || 'icons/logo-agra.png'" class="final-kop-img" />
                </div>
                <div class="col text-left">
                  <div class="final-pt-name uppercase">
                    {{ config.nama_pt || 'PT AGRA ABHINAYA PERKASA' }}
                  </div>
                  <div class="final-pt-tagline italic text-grey-8">
                    {{ config.slogan_pt || 'General Construction and General Supply' }}
                  </div>
                </div>
              </div>

              <div class="final-divider"></div>

              <!-- JUDUL DOKUMEN -->
              <div class="row justify-end q-mt-md">
                <div class="col-auto text-right">
                  <div class="quotation-title-pro uppercase tracking-widest">
                    ANALISA HARGA SATUAN
                  </div>
                  <div class="quotation-no-pro text-indigo-10 text-bold font-mono">
                    KODE AHSP : {{ previewItem.kode || '-' }}
                  </div>
                </div>
              </div>

              <!-- META INFO PEKERJAAN -->
              <div class="row q-mt-md q-mb-lg text-left text-body2">
                <div class="col-12 col-md-8">
                  <table class="meta-info-table">
                    <tr>
                      <td class="text-bold label-meta">Uraian Pekerjaan</td>
                      <td class="meta-separator">:</td>
                      <td class="text-weight-bold text-indigo-10 uppercase">
                        {{ previewItem.nama_uraian }}
                      </td>
                    </tr>
                    <tr>
                      <td class="text-bold label-meta">Satuan</td>
                      <td class="meta-separator">:</td>
                      <td class="text-weight-bold uppercase">{{ previewItem.satuan || '-' }}</td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- TABEL UTAMA AHSP -->
              <table class="final-pro-table full-width q-mb-xl">
                <thead>
                  <tr>
                    <th width="40" class="text-center">NO</th>
                    <th class="text-left">URAIAN PEKERJAAN</th>
                    <th width="80" class="text-center">KODE</th>
                    <th width="80" class="text-center">SATUAN</th>
                    <th width="90" class="text-center">KOEFISIEN</th>
                    <th width="130" class="text-right">HARGA SATUAN</th>
                    <th width="140" class="text-right">JUMLAH HARGA</th>
                  </tr>
                </thead>

                <tbody v-for="(sub, idx) in previewItem.details" :key="sub.id || idx">
                  <!-- BARIS JUDUL KATEGORI -->
                  <tr v-if="sub.isTitle" class="bg-grey-2">
                    <td class="text-center text-weight-bold text-indigo-10">
                      {{ getTitleIndex(idx, previewItem.details) }}
                    </td>
                    <td colspan="6" class="text-weight-bold uppercase text-indigo-10">
                      {{ sub.uraian }}
                    </td>
                  </tr>

                  <!-- BARIS ITEM -->
                  <tr v-else>
                    <td class="text-center text-grey-7">
                      {{ getSubIndex(idx, previewItem.details) }}
                    </td>
                    <td class="q-pl-md">{{ sub.uraian }}</td>
                    <td class="text-center">{{ sub.kode || '-' }}</td>
                    <td class="text-center uppercase">{{ sub.satuan || '-' }}</td>
                    <td class="text-center text-weight-medium">
                      {{
                        (sub.koef || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 3,
                          maximumFractionDigits: 4,
                        })
                      }}
                    </td>
                    <td class="text-right">
                      {{
                        (sub.harga || 0).toLocaleString('id-ID', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      }}
                    </td>
                    <td class="text-right text-weight-bold text-indigo-10">
                      {{
                        ((sub.koef || 0) * (sub.harga || 0)).toLocaleString('id-ID', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      }}
                    </td>
                  </tr>

                  <!-- BARIS SUBTOTAL -->
                  <tr
                    v-if="
                      !sub.isTitle &&
                      (idx === previewItem.details.length - 1 ||
                        previewItem.details[idx + 1].isTitle)
                    "
                    class="row-calculation"
                  >
                    <td colspan="6" class="text-right text-weight-bold text-blue-grey-9">
                      Jumlah {{ getGroupName(idx, previewItem.details) }} ({{
                        getTitleIndexForSubtotal(idx, previewItem.details)
                      }})
                    </td>
                    <td class="text-right text-weight-bold text-indigo-10">
                      {{
                        getGroupSubtotal(idx, previewItem.details).toLocaleString('id-ID', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      }}
                    </td>
                  </tr>
                </tbody>

                <!-- FOOTER PDF REKAPITULASI D, E, F -->
                <tfoot>
                  <tr class="row-calculation">
                    <td class="text-center text-weight-bold">D</td>
                    <td
                      colspan="5"
                      class="text-left text-weight-bold uppercase tracking-widest text-caption"
                    >
                      JUMLAH HARGA TENAGA, BAHAN DAN PERALATAN (A+B+C)
                    </td>
                    <td class="text-right text-weight-bold">
                      Rp.
                      {{
                        calculateDasar(previewItem).toLocaleString('id-ID', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      }}
                    </td>
                  </tr>
                  <tr class="row-calculation">
                    <td class="text-center text-weight-bold">E</td>
                    <td
                      colspan="5"
                      class="text-left text-weight-bold uppercase tracking-widest text-caption"
                    >
                      OVERHEAD + PROFIT ({{
                        previewItem.overhead !== undefined ? previewItem.overhead : 15
                      }}% * D)
                    </td>
                    <td class="text-right text-weight-bold">
                      Rp.
                      {{
                        calculateOverhead(previewItem).toLocaleString('id-ID', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      }}
                    </td>
                  </tr>
                  <tr class="row-grand-total">
                    <td class="text-center text-weight-bold text-white">F</td>
                    <td
                      colspan="5"
                      class="text-left text-weight-bold uppercase tracking-widest text-subtitle2"
                    >
                      HARGA SATUAN PEKERJAAN (D+E)
                    </td>
                    <td class="text-right text-weight-black text-subtitle1">
                      Rp.
                      {{
                        hitungTotalUraian(previewItem).toLocaleString('id-ID', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      }}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <!-- AREA TANDA TANGAN -->
              <div class="row justify-between text-center q-mt-xl pt-lg" style="font-size: 13px">
                <div class="col-4">
                  <div class="text-weight-bold q-mb-xl">Dibuat Oleh,</div>
                  <div style="height: 60px"></div>
                  <div class="text-weight-bolder underline text-indigo-10 uppercase">
                    Estimator / Engineering
                  </div>
                </div>
                <div class="col-4">
                  <div class="text-weight-bold q-mb-xl">Diperiksa Oleh,</div>
                  <div style="height: 60px"></div>
                  <div class="text-weight-bolder underline text-blue-grey-10 uppercase">
                    Site Manager
                  </div>
                </div>
                <div class="col-4">
                  <div class="text-weight-bold q-mb-xl">Disetujui Oleh,</div>
                  <div style="height: 60px"></div>
                  <div class="text-weight-bolder underline text-indigo-10 uppercase">
                    Project Manager / Direksi
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- =====================================================================================
           HIDDEN AREA FOR PDF LIST EXPORT (BERWARNA & RAPI - DATA AHSP REVISI)
           ===================================================================================== -->
      <div style="position: absolute; top: -9999px; left: -9999px; width: 297mm; z-index: -1">
        <div id="table-pdf-export" class="landscape-paper">
          <div
            style="
              border-bottom: 3px solid #1a237e;
              padding-bottom: 15px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
            "
          >
            <div
              style="
                background-color: #1a237e;
                color: white;
                border-radius: 8px;
                padding: 12px;
                margin-right: 15px;
              "
            >
              <q-icon name="corporate_fare" size="32px" />
            </div>
            <div>
              <div
                style="
                  font-size: 24px;
                  font-weight: 900;
                  color: #1a237e;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                "
              >
                Database Analisa Harga Satuan Pekerjaan (AHSP)
              </div>
              <div style="font-size: 12px; color: #666; margin-top: 4px">
                Diekspor pada: {{ new Date().toLocaleString('id-ID') }} | PT. Agra Abhinaya Perkasa
              </div>
            </div>
          </div>

          <table class="pdf-export-table" style="width: 100%; border-collapse: collapse">
            <thead>
              <tr>
                <th style="width: 5%; text-align: center">NO</th>
                <th style="width: 15%; text-align: left">KODE</th>
                <th style="width: 45%; text-align: left">URAIAN PEKERJAAN</th>
                <th style="width: 15%; text-align: center">SATUAN</th>
                <th style="width: 20%; text-align: right">ESTIMASI HARGA TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in rows" :key="idx">
                <td style="text-align: center; font-weight: bold">{{ idx + 1 }}</td>
                <td style="text-align: left; font-weight: bold; font-family: monospace">
                  {{ row.kode || '-' }}
                </td>
                <td
                  style="
                    text-align: left;
                    font-weight: bold;
                    color: #1a237e;
                    text-transform: uppercase;
                  "
                >
                  {{ row.nama_uraian }}
                </td>
                <td style="text-align: center">{{ row.satuan || '-' }}</td>
                <td style="text-align: right; font-weight: bold; color: #1a237e">
                  Rp
                  {{
                    hitungTotalUraian(row).toLocaleString('id-ID', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  }}
                </td>
              </tr>
              <tr v-if="rows.length === 0">
                <td
                  colspan="5"
                  style="text-align: center; padding: 20px; color: #888; font-style: italic"
                >
                  Tidak ada data.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
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
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  // eslint-disable-next-line no-unused-vars
  getDoc,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const authStore = useAuthStore()

const rows = ref([])
const loading = ref(true)
const submitting = ref(false)

const filter = ref('')
const showMasterDialog = ref(false)
const showDetailDialog = ref(false)
const showPreviewDialog = ref(false)

const isEditMaster = ref(false)
let unsubscribeData = null
let unsubUser = null

const masterFormDefault = {
  id: null,
  nama_uraian: '',
  satuan: '',
  kode: '',
  overhead: 15, // Default Overhead 15%
  status: 'Pending',
}

const masterForm = ref({ ...masterFormDefault })
const selectedItem = ref(null)
const detailList = ref([])
const previewItem = ref(null)
const overheadPercent = ref(15)

const config = ref({
  kopUrl: '',
  nama_pt: 'PT AGRA ABHINAYA PERKASA',
  slogan_pt: 'General Construction and General Supply',
})

const userData = ref(null)

// ============================================================================
// INTEGRATED DYNAMIC PERMISSION CONTROL
// ============================================================================
const canAction = (actionType) => {
  // 1. Super Admin otomatis lolos tanpa limitasi
  if (authStore.user?.role === 'Super Admin') return true

  // 2. Jika profile karyawan belum termuat, blokir semua akses modifikasi (aman)
  if (!userData.value?.permissions_detail) return false

  // 3. Ambil data izin modul 'konstruksi'
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false

  // 4. Cari sub-menu 'AHSP'
  const menu = modulePerm.menus.find((m) => m.id.toLowerCase().includes('ahsp'))
  if (!menu) return false

  // 5. Mapping nama parameter pemanggil ke skema matrix AksesPage.vue
  if (actionType === 'setuju') return menu.approve || false
  return menu[actionType] || false
}

const columns = [
  { name: 'kode', align: 'left', label: 'KODE', field: 'kode', sortable: true },
  {
    name: 'nama_uraian',
    align: 'left',
    label: 'URAIAN PEKERJAAN',
    field: 'nama_uraian',
    sortable: true,
  },
  { name: 'satuan', align: 'center', label: 'SATUAN', field: 'satuan', sortable: true },
  {
    name: 'harga',
    align: 'right',
    label: 'ESTIMASI HARGA TOTAL',
    field: (row) => hitungTotalUraian(row),
    sortable: true,
  },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]

const fetchData = async () => {
  const cSnap = await getDocs(collection(db, 'config'))
  cSnap.forEach((d) => {
    if (d.id === 'perusahaan') config.value = d.data()
  })

  unsubscribeData = onSnapshot(
    query(collection(db, 'master_ahsp_v2'), orderBy('createdAt', 'desc')),
    (snap) => {
      rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
  )
}

onMounted(async () => {
  await fetchData()

  // Pantau Hak Akses User Aktif secara Real-time
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) {
        userData.value = snapshot.docs[0].data()
      }
    })
  }
})

onUnmounted(() => {
  if (unsubscribeData) unsubscribeData()
  if (unsubUser) unsubUser()
})

// --- LOGIC MASTER (BUAT/EDIT) ---
const openMasterDialog = (item) => {
  if (item && item.id) {
    if (!canAction('ubah')) {
      $q.notify({
        type: 'negative',
        message: 'Anda tidak memiliki hak akses untuk mengubah data ini!',
      })
      return
    }
    isEditMaster.value = true
    masterForm.value = { ...masterFormDefault, ...item }
  } else {
    if (!canAction('buat')) {
      $q.notify({
        type: 'negative',
        message: 'Anda tidak memiliki hak akses untuk membuat data baru!',
      })
      return
    }
    isEditMaster.value = false
    masterForm.value = { ...masterFormDefault }
  }
  showMasterDialog.value = true
}

const saveMaster = async () => {
  if (isEditMaster.value) {
    if (!canAction('ubah')) {
      $q.notify({
        type: 'negative',
        message: 'Anda tidak memiliki hak akses untuk mengubah data ini!',
      })
      return
    }
  } else {
    if (!canAction('buat')) {
      $q.notify({
        type: 'negative',
        message: 'Anda tidak memiliki hak akses untuk membuat data baru!',
      })
      return
    }
  }

  if (!masterForm.value.nama_uraian) {
    $q.notify({ type: 'warning', message: 'Nama Uraian Utama wajib diisi!', position: 'top' })
    return
  }
  submitting.value = true
  try {
    const payload = {
      nama_uraian: masterForm.value.nama_uraian,
      satuan: masterForm.value.satuan || '',
      kode: masterForm.value.kode || '',
      overhead: masterForm.value.overhead !== undefined ? masterForm.value.overhead : 15,
      updatedAt: serverTimestamp(),
    }

    if (isEditMaster.value && masterForm.value.id) {
      await updateDoc(doc(db, 'master_ahsp_v2', masterForm.value.id), payload)
      $q.notify({ type: 'positive', message: 'Data Uraian berhasil diperbarui!', position: 'top' })
    } else {
      payload.details = []
      payload.status = 'Pending'
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'master_ahsp_v2'), payload)
      $q.notify({ type: 'positive', message: 'Uraian baru berhasil dibuat!', position: 'top' })
    }
    showMasterDialog.value = false
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan: ' + e.message })
  } finally {
    submitting.value = false
  }
}

// --- LOGIC DETAIL ---
const openDetailDialog = (item) => {
  selectedItem.value = item
  overheadPercent.value = item.overhead !== undefined ? Number(item.overhead) : 15
  detailList.value = item.details
    ? JSON.parse(JSON.stringify(item.details)).map((d) => ({
        ...d,
        id: d.id || Date.now() + Math.random(),
      }))
    : []
  showDetailDialog.value = true
}

const addTitleRow = () => {
  if (!canAction('ubah')) {
    $q.notify({
      type: 'negative',
      message: 'Anda tidak memiliki hak akses untuk mengubah rincian!',
    })
    return
  }
  detailList.value.push({
    id: Date.now() + Math.random(),
    isTitle: true,
    uraian: '',
    kode: '',
    satuan: '',
    koef: 0,
    harga: 0,
  })
}

const addSubRow = () => {
  if (!canAction('ubah')) {
    $q.notify({
      type: 'negative',
      message: 'Anda tidak memiliki hak akses untuk mengubah rincian!',
    })
    return
  }
  detailList.value.push({
    id: Date.now() + Math.random(),
    isTitle: false,
    uraian: '',
    kode: '',
    satuan: '',
    koef: 0,
    harga: 0,
  })
}

const removeSubRow = (idx) => {
  if (!canAction('ubah')) {
    $q.notify({
      type: 'negative',
      message: 'Anda tidak memiliki hak akses untuk mengubah rincian!',
    })
    return
  }
  detailList.value.splice(idx, 1)
}

const saveDetailChanges = async () => {
  if (!canAction('ubah')) {
    $q.notify({
      type: 'negative',
      message: 'Anda tidak memiliki hak akses untuk mengubah rincian!',
    })
    return
  }
  submitting.value = true
  try {
    await updateDoc(doc(db, 'master_ahsp_v2', selectedItem.value.id), {
      details: detailList.value,
      overhead: overheadPercent.value,
      updatedAt: serverTimestamp(),
    })
    showDetailDialog.value = false
    $q.notify({
      type: 'positive',
      message: 'Rincian Analisa berhasil diperbarui!',
      position: 'top',
    })
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

// --- PREVIEW LOGIC (PROFESSIONAL PDF & APPROVAL SETUJU) ---
const openPreview = (item) => {
  previewItem.value = item
  showPreviewDialog.value = true
}

const approveAhsp = async (item) => {
  if (!canAction('setuju')) {
    $q.notify({
      type: 'negative',
      message: 'Anda tidak memiliki hak akses untuk menyetujui data ini!',
    })
    return
  }
  $q.loading.show({ message: 'Menyetujui Analisa Harga...' })
  try {
    await updateDoc(doc(db, 'master_ahsp_v2', item.id), {
      status: 'Approved',
      updatedAt: serverTimestamp(),
    })
    previewItem.value.status = 'Approved'
    $q.notify({ type: 'positive', message: 'Analisa Harga Satuan berhasil disetujui!' })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal menyetujui data.' })
  } finally {
    $q.loading.hide()
  }
}

const printPage = () => window.print()

const exportToPDF = () => {
  const element = document.getElementById('ahsp-print-area')
  const opt = {
    margin: 0,
    filename: `AHSP_${previewItem.value.kode || previewItem.value.nama_uraian}.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 3, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  $q.loading.show({ message: 'Membuat dokumen PDF...' })
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => $q.loading.hide())
}

// --- SMART CALCULATIONS ---
const totalCurrentDetail = computed(() => {
  return detailList.value.reduce((sum, item) => {
    if (item.isTitle) return sum
    return sum + (item.koef || 0) * (item.harga || 0)
  }, 0)
})

const overheadValue = computed(() => {
  return totalCurrentDetail.value * (overheadPercent.value / 100)
})

const grandTotalDetail = computed(() => {
  return totalCurrentDetail.value + overheadValue.value
})

const calculateDasar = (item) => {
  if (!item || !item.details) return 0
  return item.details.reduce((sum, sub) => {
    if (sub.isTitle) return sum
    return sum + (sub.koef || 0) * (sub.harga || 0)
  }, 0)
}

const calculateOverhead = (item) => {
  const dasar = calculateDasar(item)
  const overhead = item.overhead !== undefined ? Number(item.overhead) : 15
  return dasar * (overhead / 100)
}

const hitungTotalUraian = (item) => {
  const dasar = calculateDasar(item)
  const overhead = item.overhead !== undefined ? Number(item.overhead) : 15
  return dasar + dasar * (overhead / 100)
}

const getTitleIndex = (idx, list = detailList.value) => {
  let count = 0
  for (let i = 0; i <= idx; i++) {
    if (list[i] && list[i].isTitle) count++
  }
  return String.fromCharCode(64 + count) // 65 = 'A'
}

const getTitleIndexForSubtotal = (idx, list = detailList.value) => {
  let count = 0
  for (let i = 0; i <= idx; i++) {
    if (list[i] && list[i].isTitle) count++
  }
  return String.fromCharCode(64 + count) // 65 = 'A'
}

const getSubIndex = (idx, list = detailList.value) => {
  let count = 0
  for (let i = idx; i >= 0; i--) {
    if (list[i] && list[i].isTitle) break
    count++
  }
  return count
}

const getGroupName = (idx, list = detailList.value) => {
  for (let i = idx; i >= 0; i--) {
    if (list[i] && list[i].isTitle) return list[i].uraian || 'Kategori'
  }
  return 'Pekerjaan'
}

const getGroupSubtotal = (idx, list = detailList.value) => {
  let total = 0
  for (let i = idx; i >= 0; i--) {
    if (list[i] && list[i].isTitle) break
    total += list[i] ? (list[i].koef || 0) * (list[i].harga || 0) : 0
  }
  return total
}

const confirmHapus = (item) => {
  if (!canAction('hapus')) {
    $q.notify({
      type: 'negative',
      message: 'Anda tidak memiliki hak akses untuk menghapus data ini!',
    })
    return
  }
  $q.dialog({
    title: '<span class="text-negative text-weight-bold">Konfirmasi Hapus</span>',
    message: `Apakah Anda yakin ingin menghapus uraian <b>${item.nama_uraian}</b> secara permanen?`,
    html: true,
    cancel: { label: 'Batal', flat: true, color: 'grey-7' },
    persistent: true,
    ok: { label: 'Ya, Hapus', color: 'negative', unelevated: true, rounded: true },
  }).onOk(async () => {
    await deleteDoc(doc(db, 'master_ahsp_v2', item.id))
    $q.notify({ type: 'positive', message: 'Uraian Analisa berhasil dihapus!' })
  })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.font-pro {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.rounded-12 {
  border-radius: 12px;
}
.rounded-16 {
  border-radius: 16px;
}
.rounded-20 {
  border-radius: 20px;
}

.shadow-premium {
  box-shadow: 0 10px 25px rgba(26, 35, 126, 0.15);
}

/* TABLE UTAMA */
.ahsp-main-table :deep(thead tr th) {
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

/* INNER TABLE (INPUT AHSP) */
.ahsp-input-table :deep(thead tr th) {
  background-color: #1a237e !important;
  color: white !important;
  font-weight: 800;
  font-size: 11px;
  padding: 12px;
  letter-spacing: 0.5px;
}
.ahsp-input-table :deep(tbody tr td) {
  padding: 4px 12px;
  font-size: 13.5px;
  border-bottom: 1px solid #f0f0f0;
}
.ahsp-input-table :deep(tfoot tr td) {
  padding: 8px 12px;
}
.border-title {
  border-top: 2px solid #1a237e !important;
  border-bottom: 2px solid #1a237e !important;
}
.hover-row:hover {
  background-color: #f8faff !important;
}

.input-overhead :deep(.q-field__control) {
  min-height: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 6px;
  background: white;
}

/* BUTTONS & UTILS */
.btn-hover:hover {
  filter: brightness(1.15);
  transform: translateY(-2px);
  transition: all 0.3s ease;
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

.bg-indigo-0 {
  background-color: rgba(26, 35, 126, 0.02);
}
.font-10 {
  font-size: 10px;
}
.font-11 {
  font-size: 11px;
}
.tracking-widest {
  letter-spacing: 0.15em;
}
.opacity-50 {
  opacity: 0.5;
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.1);
}
.border-top-subtle {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.uppercase {
  text-transform: uppercase;
}

.animate-fade {
  animation: fadeIn 0.6s ease-out;
}
.animate-fade-up {
  animation: fadeUp 0.6s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-input :deep(.q-field__control) {
  border-radius: 30px;
}

/* =======================================================================
   PREVIEW DOC (PROFESSIONAL PDF LAYOUT)
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

.final-pro-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  border: 1px solid #ccc;
}
.final-pro-table th {
  background: #1a237e !important;
  color: white !important;
  padding: 10px 8px;
  font-size: 10px;
  font-weight: 900;
  border: 1px solid #ccc;
}
.final-pro-table td {
  padding: 8px 10px;
  border: 1px solid #ccc;
  font-size: 11.5px;
  color: #111;
}
.row-calculation td {
  padding: 8px 12px !important;
  border: 1px solid #ccc !important;
  font-size: 11px;
  background: #f9fafb;
}
.row-grand-total td {
  padding: 12px 12px !important;
  color: white !important;
  border: 1px solid #1a237e !important;
  background: #1a237e;
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
  .row-grand-total td {
    background-color: #1a237e !important;
    color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .row-calculation,
  .row-calculation td {
    background-color: #f9fafb !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
