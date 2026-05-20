<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-lg-lg font-pro relative-position" @click="handlePageClick">
    <!-- FLOATING BACKGROUND ICONS -->
    <div class="floating-background no-print">
      <q-icon
        v-for="icon in floatingIcons"
        :key="icon.id"
        :name="icon.name"
        class="floating-icon"
        :style="{
          color: icon.color,
          fontSize: icon.size,
          left: icon.left,
          '--drift': icon.drift,
          '--rotation': icon.rotation,
          animationDuration: icon.duration,
          animationDelay: icon.delay,
        }"
      />
    </div>

    <!-- CLICK SPARKLES / CONSTRUCTION ICONS -->
    <div class="click-spawns-container no-print">
      <q-icon
        v-for="spawn in clickSpawns"
        :key="spawn.id"
        :name="spawn.name"
        class="click-spawn-icon"
        :style="{
          color: spawn.color,
          fontSize: spawn.size,
          left: spawn.left,
          top: spawn.top,
          '--tx': spawn.tx,
          '--ty': spawn.ty,
          '--rot': spawn.rot,
        }"
      />
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
            class="bg-theme-primary text-white"
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
        <div class="col-12 col-md-7">
          <div class="row items-center no-wrap">
            <q-btn
              flat
              round
              class="q-mr-md bg-white shadow-1 text-theme-primary"
              icon="arrow_back"
              @click="$router.back()"
            />
            <div>
              <div class="text-h4 text-weight-bolder leading-tight text-theme-primary">
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

        <!-- BUTTONS & THEME COLOR WHEEL SELECTOR -->
        <div class="col-12 col-md-5 q-mt-md q-mt-md-none text-right">
          <div class="row q-col-gutter-sm justify-end items-center">
            <!-- Tombol Color Wheel Ubah Tema Bebas -->
            <div class="col-auto">
              <q-btn
                flat
                round
                size="md"
                class="bg-white shadow-1 text-theme-primary"
                icon="palette"
              >
                <q-tooltip>Ubah Warna Tema</q-tooltip>
                <q-menu
                  anchor="bottom right"
                  self="top right"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <div class="q-pa-md text-center" style="min-width: 250px">
                    <div class="text-subtitle2 text-weight-black text-grey-8 q-mb-xs">
                      Ubah Warna Tema
                    </div>
                    <div class="text-caption text-grey-6 q-mb-md">Pilih warna kesukaan Anda</div>

                    <q-color
                      v-model="customThemeColor"
                      no-header
                      no-footer
                      class="my-picker"
                      @update:model-value="onThemeColorPicked"
                    />

                    <!-- Swatch / Pilihan Siap Pakai -->
                    <div class="row q-col-gutter-xs q-mt-md justify-center">
                      <div v-for="color in presetColors" :key="color" class="col-auto">
                        <q-btn
                          round
                          size="xs"
                          :style="{ backgroundColor: color }"
                          @click="setPresetColor(color)"
                        >
                          <q-icon
                            name="done"
                            size="10px"
                            color="white"
                            v-if="customThemeColor === color"
                          />
                        </q-btn>
                      </div>
                    </div>
                  </div>
                </q-menu>
              </q-btn>
            </div>

            <!-- Buat Uraian Pekerjaan Button (Membentang di HP, Normal di Laptop) -->
            <div class="col-12 col-sm-auto">
              <q-btn
                v-if="canAction('buat')"
                icon="add_circle"
                label="Buat Uraian Pekerjaan"
                unelevated
                rounded
                no-caps
                class="q-px-lg q-py-sm shadow-premium btn-hover text-weight-bold bg-theme-primary text-white"
                :class="{ 'full-width': $q.screen.lt.sm }"
                @click="openMasterDialog(null)"
              />
            </div>
          </div>
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
                  <q-icon name="search" class="text-theme-primary" />
                </template>
                <template v-slot:append v-if="filter">
                  <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </div>
            <q-space />
            <div class="col-12 col-md-auto text-caption text-grey-6">
              Total Uraian:
              <span class="text-weight-bold text-theme-primary">{{ rows.length }} Record</span>
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
            <q-tr :props="props" class="text-white bg-theme-primary">
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
                    class="q-mr-md shadow-sm bg-theme-light text-theme-primary"
                    icon="folder"
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
                <div class="text-weight-bolder text-subtitle2 text-theme-primary">
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
                    class="text-theme-primary"
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
          <q-toolbar class="bg-white q-py-md shadow-2 shrink text-theme-primary">
            <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
            <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest font-11">
              {{ isEditMaster ? 'EDIT URAIAN PEKERJAAN' : 'BUAT URAIAN BARU' }}
            </q-toolbar-title>
            <q-btn
              unelevated
              label="SIMPAN"
              rounded
              class="q-px-lg text-weight-bold shadow-3 bg-theme-primary text-white"
              @click="saveMaster"
              :loading="submitting"
            />
          </q-toolbar>

          <q-card-section class="scroll q-pa-lg">
            <q-card flat bordered class="rounded-16 bg-white shadow-1 q-pa-lg">
              <div
                class="text-subtitle2 text-weight-black q-mb-lg flex items-center text-theme-primary"
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
          <q-toolbar class="bg-white q-py-sm q-py-md-md shadow-2 shrink text-theme-primary">
            <q-btn flat round dense icon="arrow_back" v-close-popup color="grey-7" />
            <q-toolbar-title
              class="text-weight-bold uppercase tracking-widest font-10 text-subtitle2 text-sm-subtitle1"
            >
              <span class="gt-xs">Detail Uraian: </span>{{ selectedItem?.nama_uraian }}
            </q-toolbar-title>

            <!-- Excel Export Button on details (Standard National SNI AHSP, styled in classic Indigo) -->
            <q-btn
              v-if="selectedItem"
              color="green-9"
              icon="description"
              label="Export Excel"
              @click="exportToExcel(selectedItem)"
              rounded
              unelevated
              class="q-mr-sm text-weight-bold shadow-3"
            />

            <q-btn
              v-if="canAction('ubah')"
              unelevated
              :label="$q.screen.gt.xs ? 'Simpan Analisa' : 'Simpan'"
              @click="saveDetailChanges"
              rounded
              class="q-px-md q-px-sm-xl text-weight-bold shadow-3 bg-theme-primary text-white"
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
                  <q-card-section class="row items-center q-pa-md q-pa-sm-lg bg-theme-light">
                    <div
                      class="col-12 col-md-auto text-weight-black text-subtitle1 text-sm-h6 uppercase tracking-widest q-mb-md q-mb-md-none text-theme-primary"
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
                        icon="title"
                        :label="$q.screen.gt.xs ? 'Tambah Judul Kategori' : 'Judul'"
                        @click="addTitleRow"
                        no-caps
                        outline
                        rounded
                        class="col col-sm-auto bg-white text-weight-bold text-theme-primary"
                        :style="{ borderColor: 'var(--theme-primary)' }"
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
                      <tr :class="sub.isTitle ? 'bg-theme-light border-title' : 'hover-row'">
                        <template v-if="sub.isTitle">
                          <td
                            class="text-center text-weight-black text-subtitle1 text-theme-primary"
                          >
                            {{ getTitleIndex(idx) }}
                          </td>
                          <td colspan="6">
                            <q-input
                              v-model="sub.uraian"
                              dense
                              borderless
                              :readonly="!canAction('ubah')"
                              class="text-weight-black text-subtitle2 text-sm-subtitle1 uppercase text-theme-primary"
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
                          <td
                            class="text-right text-weight-bold bg-theme-light-soft text-theme-primary"
                          >
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
                        <td class="text-right text-weight-black text-theme-primary">
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
                      <tr class="text-white bg-theme-primary">
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
          <q-toolbar class="bg-white q-py-sm no-print shadow-2 shrink text-theme-primary">
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

              <!-- GREEN EXCEL BUTTON ON EXPORT VIEW (DETIL) -->
              <q-btn
                color="green-9"
                icon="description"
                label="Export Excel"
                @click="exportToExcel(previewItem)"
                class="q-px-md text-weight-bold"
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
                  <div class="final-pt-name uppercase text-theme-primary">
                    {{ config.nama_pt || 'PT AGRA ABHINAYA PERKASA' }}
                  </div>
                  <div class="final-pt-tagline italic text-grey-8">
                    {{ config.slogan_pt || 'General Construction and General Supply' }}
                  </div>
                </div>
              </div>

              <div class="final-divider bg-theme-primary"></div>

              <!-- JUDUL DOKUMEN -->
              <div class="row justify-end q-mt-md">
                <div class="col-auto text-right">
                  <div
                    class="quotation-title-pro uppercase tracking-widest text-theme-primary border-theme-primary"
                  >
                    ANALISA HARGA SATUAN
                  </div>
                  <div class="quotation-no-pro text-bold font-mono text-theme-primary">
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
                      <td class="text-weight-bold uppercase text-theme-primary">
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
                    <th width="40" class="text-center bg-theme-primary">NO</th>
                    <th class="text-left bg-theme-primary">URAIAN PEKERJAAN</th>
                    <th width="80" class="text-center bg-theme-primary">KODE</th>
                    <th width="80" class="text-center bg-theme-primary">SATUAN</th>
                    <th width="90" class="text-center bg-theme-primary">KOEFISIEN</th>
                    <th width="130" class="text-right bg-theme-primary">HARGA SATUAN</th>
                    <th width="140" class="text-right bg-theme-primary">JUMLAH HARGA</th>
                  </tr>
                </thead>

                <tbody v-for="(sub, idx) in previewItem.details" :key="sub.id || idx">
                  <!-- BARIS JUDUL KATEGORI -->
                  <tr v-if="sub.isTitle" class="bg-grey-2">
                    <td class="text-center text-weight-bold text-theme-primary">
                      {{ getTitleIndex(idx, previewItem.details) }}
                    </td>
                    <td colspan="6" class="text-weight-bold uppercase text-theme-primary">
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
                    <td class="text-right text-weight-bold text-theme-primary">
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
                    <td class="text-right text-weight-bold text-theme-primary">
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
                  <tr class="row-grand-total bg-theme-primary">
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
                  <div class="text-weight-bolder underline uppercase text-theme-primary">
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
                  <div class="text-weight-bolder underline uppercase text-theme-primary">
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
              border-bottom: 3px solid var(--theme-primary);
              padding-bottom: 15px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
            "
          >
            <div
              style="
                background-color: var(--theme-primary);
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
                  color: var(--theme-primary);
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
              <tr style="background-color: var(--theme-primary); color: white">
                <th style="width: 5%; text-align: center; padding: 10px">NO</th>
                <th style="width: 15%; text-align: left; padding: 10px">KODE</th>
                <th style="width: 45%; text-align: left; padding: 10px">URAIAN PEKERJAAN</th>
                <th style="width: 15%; text-align: center; padding: 10px">SATUAN</th>
                <th style="width: 20%; text-align: right; padding: 10px">ESTIMASI HARGA TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in rows" :key="idx">
                <td
                  style="
                    text-align: center;
                    font-weight: bold;
                    border: 1px solid #ddd;
                    padding: 8px;
                  "
                >
                  {{ idx + 1 }}
                </td>
                <td
                  style="
                    text-align: left;
                    font-weight: bold;
                    font-family: monospace;
                    border: 1px solid #ddd;
                    padding: 8px;
                  "
                >
                  {{ row.kode || '-' }}
                </td>
                <td
                  style="
                    text-align: left;
                    font-weight: bold;
                    color: var(--theme-primary);
                    text-transform: uppercase;
                    border: 1px solid #ddd;
                    padding: 8px;
                  "
                >
                  {{ row.nama_uraian }}
                </td>
                <td style="text-align: center; border: 1px solid #ddd; padding: 8px">
                  {{ row.satuan || '-' }}
                </td>
                <td
                  style="
                    text-align: right;
                    font-weight: bold;
                    color: var(--theme-primary);
                    border: 1px solid #ddd;
                    padding: 8px;
                  "
                >
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

    <!-- =====================================================================================
         INTERACTIVE CUSTOM DELETE CONFIRMATION DIALOG (PIXEL PERFECT TO REFERENCED IMAGE)
         ===================================================================================== -->
    <q-dialog v-model="showDeleteConfirmationDialog" persistent backdrop-filter="blur(4px)">
      <q-card
        style="width: 450px; max-width: 95vw; border-radius: 8px"
        class="q-pa-md font-pro bg-white overflow-hidden"
      >
        <!-- Title matching image_287dc4.png -->
        <q-card-section class="q-pb-none q-pt-sm">
          <div
            class="text-h6 text-weight-bold text-red-10"
            style="font-size: 20px; letter-spacing: -0.3px"
          >
            Konfirmasi Hapus
          </div>
        </q-card-section>

        <!-- Message matching image_287dc4.png -->
        <q-card-section class="q-py-md text-grey-8" style="font-size: 15px; line-height: 1.6">
          Apakah Anda yakin ingin menghapus uraian
          <span class="text-weight-bold text-grey-10"
            ><b>{{ itemToDelete?.nama_uraian }}</b></span
          >
          secara permanen?
        </q-card-section>

        <!-- Buttons matching image_287dc4.png -->
        <q-card-actions
          align="right"
          class="q-pt-none q-pb-sm row no-wrap justify-end items-center q-gutter-x-sm"
        >
          <q-btn
            flat
            label="BATAL"
            color="grey-7"
            v-close-popup
            class="text-weight-bold"
            style="letter-spacing: 0.5px; padding: 8px 16px; font-size: 14px"
          />
          <q-btn
            unelevated
            label="YA, HAPUS"
            color="red-10"
            class="text-weight-bold text-white q-px-lg shadow-1"
            style="border-radius: 20px; padding: 8px 24px; font-size: 14px; letter-spacing: 0.5px"
            @click="executeHapus"
            :loading="deleting"
          />
        </q-card-actions>
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
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
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
  overhead: 15,
  status: 'Pending',
}

const masterForm = ref({ ...masterFormDefault })
const selectedItem = ref(null)
const detailList = ref([])
const previewItem = ref(null)
const overheadPercent = ref(15)

// Dynamic Color Wheel State & Preset Color Palettes
const customThemeColor = ref('#1a237e') // Default Indigo
const presetColors = [
  '#1a237e', // Indigo
  '#005b52', // Forest Teal
  '#2e7d32', // Emerald Green
  '#c62828', // Crimson Red
  '#ef6c00', // Warning Orange
  '#6a1b9a', // Deep Purple
  '#00838f', // Cyan Dark
  '#37474f', // Slate Dark
]

const onThemeColorPicked = (val) => {
  localStorage.setItem('ahsppage_custom_theme', val)
  applyDynamicTheme(val)
}

const setPresetColor = (color) => {
  customThemeColor.value = color
  onThemeColorPicked(color)
}

// Function to automatically calculate variations and load styles dynamically
const applyDynamicTheme = (hexColor) => {
  const root = document.documentElement
  root.style.setProperty('--theme-primary', hexColor)

  // Create hover variation
  const primaryHover = adjustColorBrightness(hexColor, -15)
  root.style.setProperty('--theme-primary-hover', primaryHover)

  // Create light pastel variation (e.g. for folder background)
  const lightBg = adjustColorBrightness(hexColor, 80, true)
  root.style.setProperty('--theme-light', lightBg)

  // Create light soft transparency tint
  const lightSoftBg = hexToRGBA(hexColor, 0.05)
  root.style.setProperty('--theme-light-soft', lightSoftBg)
}

// Color calculations utility
const hexToRGBA = (hex, alpha) => {
  let r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const adjustColorBrightness = (hex, percent, makeLightBg = false) => {
  let R = parseInt(hex.substring(1, 3), 16)
  let G = parseInt(hex.substring(3, 5), 16)
  let B = parseInt(hex.substring(5, 7), 16)

  if (makeLightBg) {
    // Elegant pastel mixing (85% White, 15% Base Color)
    R = Math.round(R * 0.15 + 255 * 0.85)
    G = Math.round(G * 0.15 + 255 * 0.85)
    B = Math.round(B * 0.15 + 255 * 0.85)
  } else {
    R = parseInt((R * (100 + percent)) / 100)
    G = parseInt((G * (100 + percent)) / 100)
    B = parseInt((B * (100 + percent)) / 100)

    R = R < 255 ? R : 255
    G = G < 255 ? G : 255
    B = B < 255 ? B : 255
    R = R > 0 ? R : 0
    G = G > 0 ? G : 0
    B = B > 0 ? B : 0
  }

  const rHex = R.toString(16).padStart(2, '0')
  const gHex = G.toString(16).padStart(2, '0')
  const bHex = B.toString(16).padStart(2, '0')

  return `#${rHex}${gHex}${bHex}`
}

// Custom Delete Dialog State
const showDeleteConfirmationDialog = ref(false)
const itemToDelete = ref(null)
const deleting = ref(false)

// Floating Background & Click Spawn Icon System matching image_28ede3.png
const floatingIcons = ref([])
const clickSpawns = ref([])

// Accurate construction icons matching image_28ede3.png style
const iconTemplates = [
  'engineering',
  'construction',
  'handyman',
  'architecture',
  'home_repair_service',
  'plumbing',
  'format_paint',
  'hardware',
  'build',
  'foundation',
  'roller_shades',
  'square_foot',
  'layers',
  'miscellaneous_services',
  'precision_manufacturing',
]

// Energetic and vivid construction color palette (Red, Orange, Yellow, Green, Cyan, Teal, Slate)
const iconColors = [
  '#e53935',
  '#d81b60',
  '#8e24aa',
  '#5e35b1',
  '#3949ab',
  '#1e88e5',
  '#039be5',
  '#00acc1',
  '#00897b',
  '#43a047',
  '#7cb342',
  '#ffb300',
  '#fb8c00',
  '#f4511e',
]

let floatInterval = null

const spawnFloatingIcon = () => {
  if (floatingIcons.value.length > 25) {
    floatingIcons.value.shift()
  }
  const randomIcon = iconTemplates[Math.floor(Math.random() * iconTemplates.length)]
  const randomColor = iconColors[Math.floor(Math.random() * iconColors.length)]
  const size = Math.floor(Math.random() * 22) + 18 // 18px to 40px for clarity
  const left = Math.random() * 95
  const duration = Math.random() * 8 + 7 // Slow, elegant floating pace
  const delay = Math.random() * 2
  const drift = Math.random() * 120 - 60 + 'px'
  const rotation = Math.random() * 360 - 180 + 'deg'

  floatingIcons.value.push({
    id: Date.now() + Math.random(),
    name: randomIcon,
    color: randomColor,
    size: size + 'px',
    left: left + 'vw',
    duration: duration + 's',
    delay: delay + 's',
    drift: drift,
    rotation: rotation,
  })
}

// Clicking a blank space spawns a cluster stack bubble of icons, matching image_28ede3.png
const handlePageClick = (e) => {
  const interactiveTags = ['BUTTON', 'INPUT', 'A', 'I', 'TD', 'TH', 'TEXTAREA', 'SELECT', 'SPAN']
  if (
    interactiveTags.includes(e.target.tagName) ||
    e.target.closest('.q-btn') ||
    e.target.closest('.q-field') ||
    e.target.closest('.q-dialog') ||
    e.target.closest('.q-table') ||
    e.target.closest('.q-menu')
  ) {
    return
  }

  const x = e.clientX
  const y = e.clientY

  // Spawn cluster group of 7 stacked colorful construction tools
  for (let i = 0; i < 7; i++) {
    const angle = (i * (360 / 7) + Math.random() * 20) * (Math.PI / 180)
    const distance = Math.random() * 80 + 40
    const tx = Math.cos(angle) * distance + 'px'
    const ty = Math.sin(angle) * distance - 110 + 'px' // Float upward drift
    const rot = Math.random() * 240 - 120 + 'deg'
    const size = Math.floor(Math.random() * 16) + 18 + 'px'
    const randomIcon = iconTemplates[Math.floor(Math.random() * iconTemplates.length)]
    const randomColor = iconColors[Math.floor(Math.random() * iconColors.length)]

    clickSpawns.value.push({
      id: Date.now() + Math.random(),
      name: randomIcon,
      color: randomColor,
      size: size,
      left: x + 'px',
      top: y + 'px',
      tx: tx,
      ty: ty,
      rot: rot,
    })
  }

  // Clear memory of particles smoothly
  setTimeout(() => {
    if (clickSpawns.value.length > 50) {
      clickSpawns.value.splice(0, 14)
    }
  }, 1600)
}

// SUCCESS TOAST NOTIFICATION (PIXEL PERFECT TO image_287a07.png)
const showSuccessToast = (message, title = 'Sinkronisasi Berhasil!') => {
  $q.notify({
    message: `
      <div class="row no-wrap items-center q-py-xs toast-body-custom">
        <div class="col-auto q-mr-md flex flex-center">
          <i class="q-icon notranslate material-icons text-white" style="font-size: 26px;">check_circle_outline</i>
        </div>
        <div class="col text-left">
          <div class="text-weight-bolder text-white" style="font-size: 15px; letter-spacing: -0.2px;">${title}</div>
          <div class="text-caption text-white opacity-90 q-mt-xs" style="font-size: 12.5px;">${message}</div>
        </div>
      </div>
    `,
    html: true,
    color: 'positive',
    textColor: 'white',
    position: 'top',
    timeout: 3500,
    classes: 'custom-premium-toast-success shadow-12',
    actions: [{ icon: 'close', color: 'white', flat: true, round: true, handler: () => {} }],
  })
}

// DELETE TOAST NOTIFICATION (PIXEL PERFECT TO image_287d64.png)
const showDeleteToast = (message, title = 'Data Terhapus!') => {
  $q.notify({
    message: `
      <div class="row no-wrap items-center q-py-xs toast-body-custom">
        <div class="col-auto q-mr-md flex flex-center">
          <i class="q-icon notranslate material-icons text-white" style="font-size: 26px;">delete_sweep</i>
        </div>
        <div class="col text-left">
          <div class="text-weight-bolder text-white" style="font-size: 15px; letter-spacing: -0.2px;">${title}</div>
          <div class="text-caption text-white opacity-90 q-mt-xs" style="font-size: 12.5px;">${message}</div>
        </div>
      </div>
    `,
    html: true,
    color: 'negative',
    textColor: 'white',
    position: 'top',
    timeout: 3500,
    classes: 'custom-premium-toast-danger shadow-12',
    actions: [{ icon: 'close', color: 'white', flat: true, round: true, handler: () => {} }],
  })
}

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
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false

  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false

  const menu = modulePerm.menus.find((m) => m.id.toLowerCase().includes('ahsp'))
  if (!menu) return false

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

  // Load Saved Dynamic Color Theme
  const savedTheme = localStorage.getItem('ahsppage_custom_theme') || '#1a237e'
  customThemeColor.value = savedTheme
  applyDynamicTheme(savedTheme)

  // Spawning initial particles floating elements
  for (let i = 0; i < 8; i++) {
    spawnFloatingIcon()
  }
  floatInterval = setInterval(spawnFloatingIcon, 1800)

  // Real-time access privileges track
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
  if (floatInterval) clearInterval(floatInterval)
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
      showSuccessToast(
        'Data rincian analisa telah tersimpan di database.',
        'Sinkronisasi Berhasil!',
      )
    } else {
      payload.details = []
      payload.status = 'Pending'
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'master_ahsp_v2'), payload)
      showSuccessToast('Analisa Uraian Master baru berhasil didaftarkan.', 'Sinkronisasi Berhasil!')
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
    showSuccessToast(
      'Perubahan rincian detail analisa berhasil diselaraskan.',
      'Sinkronisasi Berhasil!',
    )
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
    showSuccessToast('Otorisasi berkas pekerjaan konstruksi disetujui.', 'Sinkronisasi Berhasil!')
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

// ============================================================================
// STANDAR NASIONAL INDONESIA (SNI) EXCEL GENERATOR (ALWAYS THEMED IN BLUE INDIGO)
// ============================================================================
const exportToExcel = (item) => {
  if (!item) return

  // Standard national Excel theme color remains strictly Blue Indigo ('#1a237e') as requested
  const excelPrimaryColor = '#1a237e'

  let htmlContent = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>AHSP - ${item.kode || 'SNI'}</x:Name>
            <x:WorksheetOptions>
              <x:DisplayGridlines/>
            </x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
      .text-center { text-align: center; }
      .text-left { text-align: left; }
      .text-right { text-align: right; }
      .font-bold { font-weight: bold; }
      .header-title { font-size: 16px; font-weight: bold; text-align: center; color: ${excelPrimaryColor}; text-transform: uppercase; }
      .header-subtitle { font-size: 10px; text-align: center; color: #555555; font-style: italic; }
      .meta-label { font-weight: bold; width: 140px; font-size: 11px; }
      .meta-val { font-size: 11px; }
      .ahsp-table { border-collapse: collapse; width: 100%; margin-top: 15px; }
      .ahsp-table th { background-color: ${excelPrimaryColor}; color: #ffffff; border: 1px solid #000000; padding: 10px; font-size: 10px; font-weight: bold; }
      .ahsp-table td { border: 1px solid #000000; padding: 6px 8px; font-size: 10px; }
      .bg-category { background-color: #e8eaf6; font-weight: bold; text-transform: uppercase; }
      .bg-subtotal { background-color: #f5f5f5; font-weight: bold; font-style: italic; }
      .bg-total-d { background-color: #eeeeee; font-weight: bold; }
      .bg-total-e { background-color: #eeeeee; font-weight: bold; }
      .bg-grand-total { background-color: ${excelPrimaryColor}; color: #ffffff; font-weight: bold; font-size: 11px; }
      .rupiah-format { mso-number-format: '\\"Rp\\"\\#\\,\\#\\#0\\.00'; }
      .decimal-format { mso-number-format: '0\\.0000'; }
    </style>
  </head>
  <body>
    <!-- KOP SURAT PERUSAHAAN -->
    <table style="width: 100%;">
      <tr>
        <td colspan="7" class="header-title">${config.value.nama_pt || 'PT AGRA ABHINAYA PERKASA'}</td>
      </tr>
      <tr>
        <td colspan="7" class="header-subtitle">${config.value.slogan_pt || 'General Construction and General Supply'}</td>
      </tr>
      <tr>
        <td colspan="7" style="border-bottom: 2px solid #333333; height: 5px;"></td>
      </tr>
      <tr style="height: 15px;"><td></td></tr>
      <tr>
        <td colspan="7" style="font-size: 13px; font-weight: bold; text-align: center; text-decoration: underline;">ANALISA HARGA SATUAN PEKERJAAN (AHSP)</td>
      </tr>
      <tr>
        <td colspan="7" class="text-center" style="font-size: 10px; font-weight: bold;">KODE STANDAR: ${item.kode || '-'}</td>
      </tr>
      <tr style="height: 15px;"><td></td></tr>
    </table>

    <!-- META DATA AHSP -->
    <table style="width: 100%;">
      <tr>
        <td class="meta-label">Uraian Pekerjaan</td>
        <td>:</td>
        <td colspan="5" class="meta-val" style="font-weight: bold; color: ${excelPrimaryColor}; text-transform: uppercase;">${item.nama_uraian}</td>
      </tr>
      <tr>
        <td class="meta-label">Satuan Pekerjaan</td>
        <td>:</td>
        <td colspan="5" class="meta-val" style="font-weight: bold; text-transform: uppercase;">${item.satuan || '-'}</td>
      </tr>
    </table>

    <!-- TABEL UTAMA AHSP SNI -->
    <table class="ahsp-table">
      <thead>
        <tr>
          <th style="width: 40px;">NO</th>
          <th style="width: 320px;">URAIAN PEKERJAAN</th>
          <th style="width: 90px;">KODE</th>
          <th style="width: 70px;">SATUAN</th>
          <th style="width: 90px;">KOEFISIEN</th>
          <th style="width: 120px;">HARGA SATUAN (Rp)</th>
          <th style="width: 140px;">JUMLAH HARGA (Rp)</th>
        </tr>
      </thead>
      <tbody>
  `

  const details = item.details || []
  details.forEach((sub, idx) => {
    if (sub.isTitle) {
      htmlContent += `
        <tr class="bg-category">
          <td class="text-center" style="font-weight: bold;">${getTitleIndex(idx, details)}</td>
          <td colspan="6" style="font-weight: bold;">${sub.uraian}</td>
        </tr>
      `
    } else {
      const koef = sub.koef || 0
      const harga = sub.harga || 0
      const total = koef * harga
      htmlContent += `
        <tr>
          <td class="text-center">${getSubIndex(idx, details)}</td>
          <td style="padding-left: 15px;">${sub.uraian}</td>
          <td class="text-center" style="mso-number-format:'\\@';">${sub.kode || '-'}</td>
          <td class="text-center">${sub.satuan || '-'}</td>
          <td class="text-center decimal-format">${koef}</td>
          <td class="text-right rupiah-format">${harga}</td>
          <td class="text-right rupiah-format" style="font-weight: bold;">${total}</td>
        </tr>
      `
    }

    // Insert Category Subtotals
    if (!sub.isTitle && (idx === details.length - 1 || details[idx + 1].isTitle)) {
      htmlContent += `
        <tr class="bg-subtotal">
          <td colspan="6" class="text-right" style="font-weight: bold;">Jumlah ${getGroupName(idx, details)} (${getTitleIndexForSubtotal(idx, details)})</td>
          <td class="text-right rupiah-format" style="font-weight: bold;">${getGroupSubtotal(idx, details)}</td>
        </tr>
      `
    }
  })

  // Calculations for Summary
  const dasar = calculateDasar(item)
  const overheadPct = item.overhead !== undefined ? Number(item.overhead) : 15
  const overheadVal = dasar * (overheadPct / 100)
  const grandTotal = dasar + overheadVal

  htmlContent += `
        <!-- SUMMARY ROW D -->
        <tr class="bg-total-d">
          <td class="text-center" style="font-weight: bold;">D</td>
          <td colspan="5" class="text-left" style="font-weight: bold; text-transform: uppercase;">JUMLAH HARGA TENAGA, BAHAN DAN PERALATAN (A+B+C)</td>
          <td class="text-right rupiah-format" style="font-weight: bold;">${dasar}</td>
        </tr>
        <!-- SUMMARY ROW E -->
        <tr class="bg-total-e">
          <td class="text-center" style="font-weight: bold;">E</td>
          <td colspan="5" class="text-left" style="font-weight: bold; text-transform: uppercase;">OVERHEAD + PROFIT (${overheadPct}% * D)</td>
          <td class="text-right rupiah-format" style="font-weight: bold;">${overheadVal}</td>
        </tr>
        <!-- GRAND TOTAL F -->
        <tr class="bg-grand-total">
          <td class="text-center" style="font-weight: bold; border-bottom: 3px double #000;">F</td>
          <td colspan="5" class="text-left" style="font-weight: bold; text-transform: uppercase; border-bottom: 3px double #000;">HARGA SATUAN PEKERJAAN (D+E)</td>
          <td class="text-right rupiah-format" style="font-weight: bold; border-bottom: 3px double #000;">${grandTotal}</td>
        </tr>
      </tbody>
    </table>

    <br/><br/>
    <!-- SIGNATURE BLOCKS -->
    <table style="width: 100%; text-align: center; font-size: 10px;">
      <tr>
        <td colspan="2" style="font-weight: bold; width: 33%;">Dibuat Oleh,</td>
        <td colspan="3" style="font-weight: bold; width: 33%;">Diperiksa Oleh,</td>
        <td colspan="2" style="font-weight: bold; width: 34%;">Disetujui Oleh,</td>
      </tr>
      <tr style="height: 45px;"><td colspan="7"></td></tr>
      <tr>
        <td colspan="2" style="font-weight: bold; text-decoration: underline; text-transform: uppercase;">Estimator / Engineering</td>
        <td colspan="3" style="font-weight: bold; text-decoration: underline; text-transform: uppercase;">Site Manager</td>
        <td colspan="2" style="font-weight: bold; text-decoration: underline; text-transform: uppercase;">Project Manager / Direksi</td>
      </tr>
    </table>
  </body>
  </html>
  `

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute(
    'download',
    `AHSP_NASIONAL_${item.kode || 'SNI'}_${item.nama_uraian.replace(/\s+/g, '_')}.xls`,
  )
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  showSuccessToast(
    'Pemberkasan ekspor Excel standar nasional rampung disiapkan.',
    'Sinkronisasi Berhasil!',
  )
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

// Custom Delete Dialog Trigger
const confirmHapus = (item) => {
  if (!canAction('hapus')) {
    $q.notify({
      type: 'negative',
      message: 'Anda tidak memiliki hak akses untuk menghapus data ini!',
    })
    return
  }
  itemToDelete.value = item
  showDeleteConfirmationDialog.value = true
}

// Custom Delete Action Execution
const executeHapus = async () => {
  if (!itemToDelete.value) return
  deleting.value = true
  try {
    await deleteDoc(doc(db, 'master_ahsp_v2', itemToDelete.value.id))
    showDeleteConfirmationDialog.value = false
    showDeleteToast(
      'Satuan unit material telah ditarik secara permanen dari sistem.',
      'Data Terhapus!',
    )
    itemToDelete.value = null
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal menghapus: ' + e.message })
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

/* Dynamic Theme Variable Declarations */
:root {
  --theme-primary: #1a237e;
  --theme-primary-hover: #0f175f;
  --theme-light: #e8eaf6;
  --theme-light-hover: #c5cae9;
  --theme-light-soft: rgba(26, 35, 126, 0.02);
}

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

/* THEME DYNAMIC ASSIGNMENT */
.bg-theme-primary {
  background-color: var(--theme-primary) !important;
  color: white !important;
}
.text-theme-primary {
  color: var(--theme-primary) !important;
}
.bg-theme-light {
  background-color: var(--theme-light) !important;
}
.text-theme-light {
  color: var(--theme-light) !important;
}
.bg-theme-light-soft {
  background-color: var(--theme-light-soft) !important;
}
.border-theme-primary {
  border-color: var(--theme-primary) !important;
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
  background-color: var(--theme-light-soft) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* INNER TABLE (INPUT AHSP) */
.ahsp-input-table :deep(thead tr th) {
  background-color: var(--theme-primary) !important;
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
  border-top: 2px solid var(--theme-primary) !important;
  border-bottom: 2px solid var(--theme-primary) !important;
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
  background-color: var(--theme-light) !important;
  color: var(--theme-primary) !important;
}
.hover-red-btn {
  transition: 0.3s;
}
.hover-red-btn:hover {
  background-color: #ffebee !important;
  color: #d32f2f !important;
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
  border: 1px solid rgba(0, 0, 0, 0.08);
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
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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
  margin-top: 15px;
}
.quotation-title-pro {
  font-size: 20px;
  font-weight: 900;
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
}

/* =======================================================================
   TOAST STYLING (PIXEL PERFECT ACCORDING TO REFERENCE IMAGES)
   ======================================================================= */
:deep(.custom-premium-toast-success) {
  background-color: #21ba45 !important; /* Rich Green matching image_287a07.png */
  color: white !important;
  border-radius: 6px !important;
  padding: 12px 18px !important;
  min-width: 380px;
  max-width: 95vw;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15) !important;
  position: relative;
  overflow: hidden;
}

:deep(.custom-premium-toast-success)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.45);
  animation: toastProgress 3.5s linear forwards;
}

:deep(.custom-premium-toast-danger) {
  background-color: #c10015 !important; /* Rich Crimson Red matching image_287d64.png */
  color: white !important;
  border-radius: 6px !important;
  padding: 12px 18px !important;
  min-width: 380px;
  max-width: 95vw;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15) !important;
  position: relative;
  overflow: hidden;
}

:deep(.custom-premium-toast-danger)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.45);
  animation: toastProgress 3.5s linear forwards;
}

:deep(.toast-body-custom) {
  font-family: 'Plus Jakarta Sans', sans-serif;
  line-height: 1.4;
}

@keyframes toastProgress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* =======================================================================
   FLOATING CONSTRUCTION BACKGROUND ICONS SYSTEM
   ======================================================================= */
.floating-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.floating-icon {
  position: absolute;
  pointer-events: none;
  opacity: 0.15;
  animation: floatUp 10s linear infinite;
}
@keyframes floatUp {
  0% {
    transform: translateY(105vh) translateX(0) rotate(0deg);
    opacity: 0;
  }
  15% {
    opacity: 0.15;
  }
  85% {
    opacity: 0.15;
  }
  100% {
    transform: translateY(-15vh) translateX(var(--drift)) rotate(var(--rotation));
    opacity: 0;
  }
}

/* CLICK PARTICLE SPAWNS SYSTEM */
.click-spawns-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 99999;
}
.click-spawn-icon {
  position: fixed;
  pointer-events: none;
  z-index: 99999;
  animation: burstOut 1.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
}
@keyframes burstOut {
  0% {
    transform: translate(-50%, -50%) scale(0.4);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(1.3);
    opacity: 0;
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
  .row-grand-total td {
    background-color: var(--theme-primary) !important;
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
