<template>
  <q-page class="bg-page q-pa-md q-pa-md-lg font-pro relative-position">
    <!-- =====================================================================================
         SCREEN 1: LOCK SCREEN JIKA TIDAK MEMILIKI AKSES LIHAT GUDANG
         ===================================================================================== -->
    <template v-if="!canAction('lihat')">
      <div
        class="row flex-center q-pa-xl text-center font-pro animate-fade content-relative"
        style="min-height: 70vh"
      >
        <div
          class="col-12 col-sm-8 col-md-6 bg-white q-pa-xl rounded-20 shadow-premium border-subtle"
        >
          <q-avatar size="100px" color="red-1" text-color="red-10" icon="lock" class="q-mb-md" />
          <div class="text-h5 text-weight-bold text-blue-grey-10 q-mb-xs">Akses Terbatas</div>
          <div class="text-body2 text-grey-7 q-mb-lg leading-relaxed">
            Maaf, Anda tidak memiliki izin untuk melihat modul Manajemen Gudang & Stok. Silakan
            hubungi Administrator atau Super Admin untuk konfigurasi hak akses Anda.
          </div>
          <q-btn
            label="Kembali ke Beranda"
            color="brand-primary"
            icon="arrow_back"
            rounded
            unelevated
            no-caps
            class="text-white text-weight-bold"
            @click="$router.push('/')"
          />
        </div>
      </div>
    </template>

    <!-- =====================================================================================
         SCREEN 2: KONTEN UTAMA MANAJEMEN GUDANG JIKA AKSES OK
         ===================================================================================== -->
    <template v-else>
      <div class="page-content-wrapper">
        <!-- HEADER SECTION -->
        <div class="row items-center justify-between q-mb-xl animate-fade content-relative">
          <div class="col-12 col-md-8">
            <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
              Manajemen Gudang
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
                {{
                  selectedGudang
                    ? 'Detail Inventaris: ' + selectedGudang.nama
                    : 'Pusat Logistik & Stok Proyek'
                }}
              </span>
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Monitoring ketersediaan material secara real-time di seluruh titik distribusi.
            </div>
          </div>
          <div class="col-12 col-md-auto q-mt-md q-mt-md-none" v-if="selectedGudang">
            <q-btn
              flat
              rounded
              icon="arrow_back"
              label="Kembali ke Daftar Gudang"
              @click="selectedGudang = null"
              color="brand-primary"
              class="bg-white shadow-1 full-width-mobile text-weight-bold"
            />
          </div>
        </div>

        <!-- VIEW 1: GUDANG SELECTOR GRID -->
        <div v-if="!selectedGudang" class="row q-col-gutter-lg animate-fade-up content-relative">
          <!-- Gudang Utama Card -->
          <div class="col-12 col-sm-6 col-md-4">
            <q-card
              flat
              bordered
              class="gudang-card rounded-20 cursor-pointer transition-all hover-shadow relative-position bg-white border-subtle"
              @click="selectGudang({ id: 'UTAMA', nama: 'Gudang Utama' })"
            >
              <!-- NOTIFIKASI GUDANG UTAMA (MUTASI) -->
              <q-badge
                v-if="notifGudang['UTAMA']?.mutasiPending > 0"
                color="red"
                floating
                rounded
                class="q-pa-sm text-weight-bold shadow-2 z-top animate-bounce animate-duration"
                style="top: -5px; right: -5px"
              >
                <q-icon name="move_to_inbox" size="14px" class="q-mr-xs" />
                {{ notifGudang['UTAMA'].mutasiPending }} Request Masuk
              </q-badge>
              <q-badge
                v-if="notifGudang['UTAMA']?.mutasiApproved > 0"
                color="positive"
                floating
                rounded
                class="q-pa-sm text-weight-bold shadow-2 z-top animate-bounce animate-duration"
                style="top: -5px; left: -5px; right: auto"
              >
                <q-icon name="local_shipping" size="14px" class="q-mr-xs" />
                {{ notifGudang['UTAMA'].mutasiApproved }} Brg Datang
              </q-badge>

              <!-- NOTIFIKASI GUDANG UTAMA (PURCHASE REQUEST) -->
              <q-badge
                v-if="notifGudang['UTAMA']?.prApproved > 0"
                color="positive"
                floating
                rounded
                class="q-pa-sm text-weight-bold shadow-2 z-top animate-bounce animate-duration"
                style="bottom: -5px; right: -5px; top: auto"
              >
                <q-icon name="done_all" size="14px" class="q-mr-xs" />
                {{ notifGudang['UTAMA'].prApproved }} PR ACC
              </q-badge>
              <q-badge
                v-if="notifGudang['UTAMA']?.prRejected > 0"
                color="negative"
                floating
                rounded
                class="q-pa-sm text-weight-bold shadow-2 z-top animate-bounce"
                style="bottom: -5px; left: -5px; top: auto; right: auto"
              >
                <q-icon name="cancel" size="14px" class="q-mr-xs" />
                {{ notifGudang['UTAMA'].prRejected }} PR Tolak
              </q-badge>

              <q-card-section class="q-pa-lg text-center">
                <q-avatar
                  size="80px"
                  color="brand-light"
                  text-color="brand-primary"
                  icon="warehouse"
                  class="q-mb-md shadow-2"
                />
                <div class="text-h6 text-weight-bolder text-brand-primary uppercase">
                  Gudang Utama
                </div>
                <div class="text-caption text-grey-6 q-mt-sm">
                  Pusat penyimpanan material inti & alat berat perusahaan.
                </div>
              </q-card-section>
              <q-separator inset />
              <q-card-section
                class="bg-brand-primary text-white text-center q-py-sm print-brand-bg"
              >
                <div class="text-caption text-weight-bold tracking-widest text-white">
                  PILIH LOKASI
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Proyek Gudang Cards -->
          <div v-for="p in listProyek" :key="p.id" class="col-12 col-sm-6 col-md-4">
            <q-card
              flat
              bordered
              class="gudang-card rounded-20 cursor-pointer transition-all hover-shadow relative-position bg-white border-subtle"
              @click="selectGudang({ id: p.id, nama: 'Gudang ' + (p.nama_proyek || p.nama) })"
            >
              <!-- NOTIFIKASI GUDANG PROYEK (MUTASI) -->
              <q-badge
                v-if="notifGudang[p.id]?.mutasiPending > 0"
                color="red"
                floating
                rounded
                class="q-pa-sm text-weight-bold shadow-2 z-top animate-bounce animate-duration"
                style="top: -5px; right: -5px"
              >
                <q-icon name="move_to_inbox" size="14px" class="q-mr-xs" />
                {{ notifGudang[p.id].mutasiPending }} Request Masuk
              </q-badge>
              <q-badge
                v-if="notifGudang[p.id]?.mutasiApproved > 0"
                color="positive"
                floating
                rounded
                class="q-pa-sm text-weight-bold shadow-2 z-top animate-bounce animate-duration"
                style="top: -5px; left: -5px; right: auto"
              >
                <q-icon name="local_shipping" size="14px" class="q-mr-xs" />
                {{ notifGudang[p.id].mutasiApproved }} Brg Datang
              </q-badge>

              <!-- NOTIFIKASI GUDANG PROYEK (PURCHASE REQUEST) -->
              <q-badge
                v-if="notifGudang[p.id]?.prApproved > 0"
                color="positive"
                floating
                rounded
                class="q-pa-sm text-weight-bold shadow-2 z-top animate-bounce animate-duration"
                style="bottom: -5px; right: -5px; top: auto"
              >
                <q-icon name="done_all" size="14px" class="q-mr-xs" />
                {{ notifGudang[p.id].prApproved }} PR ACC
              </q-badge>
              <q-badge
                v-if="notifGudang[p.id]?.prRejected > 0"
                color="negative"
                floating
                rounded
                class="q-pa-sm text-weight-bold shadow-2 z-top animate-bounce"
                style="bottom: -5px; left: -5px; top: auto; right: auto"
              >
                <q-icon name="cancel" size="14px" class="q-mr-xs" />
                {{ notifGudang[p.id].prRejected }} PR Tolak
              </q-badge>

              <q-card-section class="q-pa-lg text-center">
                <q-avatar
                  size="80px"
                  color="brand-light"
                  text-color="brand-primary"
                  icon="construction"
                  class="q-mb-md shadow-2"
                />
                <div class="text-h6 text-weight-bolder text-brand-primary uppercase ellipsis">
                  Gudang {{ p.nama_proyek || p.nama }}
                </div>
                <div class="text-caption text-grey-7 q-mt-sm ellipsis-2-lines">
                  Lokasi: {{ p.lokasi || 'Proyek' }}
                </div>
              </q-card-section>
              <q-separator inset />
              <q-card-section class="bg-brand-primary text-white text-center q-py-sm">
                <div class="text-caption text-weight-bold tracking-widest text-white">
                  DETAIL LOGISTIK
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- VIEW 2: DETAIL STOK GUDANG (RAPID DAN MEMBENTANG HP) -->
        <div v-else class="animate-fade content-relative">
          <!-- SEARCH & ACTIONS CARD -->
          <q-card
            flat
            bordered
            class="q-mb-lg shadow-1 rounded-20 bg-white border-subtle content-relative"
          >
            <q-card-section class="q-py-md">
              <div class="row items-center justify-between q-col-gutter-md">
                <!-- Search Input (Left) -->
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="filter"
                    outlined
                    dense
                    rounded
                    placeholder="Cari item di gudang ini..."
                    bg-color="white"
                    class="search-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" color="brand-primary" />
                    </template>
                    <template v-slot:append v-if="filter">
                      <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
                    </template>
                  </q-input>
                </div>

                <!-- Action Buttons (Right) -->
                <div
                  class="col-12 col-md-8 row items-center justify-end q-col-gutter-md q-mt-sm q-mt-md-none"
                >
                  <!-- 1. Stok Opname -->
                  <div class="col-12 col-sm-auto">
                    <q-btn
                      unelevated
                      color="brand-primary"
                      icon="analytics"
                      label="Stok Opname"
                      @click="goToOpname"
                      rounded
                      class="shadow-premium btn-hover text-weight-bold q-py-sm q-px-md full-width"
                    />
                  </div>

                  <!-- 2. Transaksi Stok -->
                  <div class="col-12 col-sm-auto">
                    <q-btn-dropdown
                      unelevated
                      color="white"
                      text-color="brand-primary"
                      icon="sync_alt"
                      label="Transaksi Stok"
                      class="rounded-12 text-weight-bold shadow-2 full-width"
                    >
                      <q-list style="min-width: 200px" class="q-pa-sm">
                        <q-item
                          clickable
                          v-ripple
                          @click="goToRiwayat"
                          class="rounded-borders hover-blue-btn"
                        >
                          <q-item-section avatar
                            ><q-icon name="history" color="brand-primary"
                          /></q-item-section>
                          <q-item-section class="text-weight-bold"
                            >Riwayat Transaksi</q-item-section
                          >
                        </q-item>
                        <q-separator spaced />
                        <q-item
                          clickable
                          v-ripple
                          @click="goToBarangMasuk"
                          class="rounded-borders bg-green-1 text-green-10 q-mb-xs"
                        >
                          <q-item-section avatar><q-icon name="add_circle" /></q-item-section>
                          <q-item-section class="text-weight-bold">Barang Masuk</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-ripple
                          @click="goToBarangKeluar"
                          class="rounded-borders bg-red-1 text-red-10"
                        >
                          <q-item-section avatar><q-icon name="remove_circle" /></q-item-section>
                          <q-item-section class="text-weight-bold">Barang Keluar</q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                  </div>

                  <!-- 3. Permintaan Barang -->
                  <div class="col-12 col-sm-auto">
                    <q-btn-dropdown
                      unelevated
                      color="brand-light"
                      text-color="brand-primary"
                      icon="shopping_basket"
                      class="rounded-12 text-weight-bold shadow-2 full-width"
                    >
                      <template v-slot:label>
                        <div class="row items-center no-wrap">
                          <span class="q-mr-xs">Permintaan Barang</span>
                          <q-badge
                            color="red"
                            rounded
                            v-if="hasAnyGudangNotif(selectedGudang.id)"
                            class="shadow-1 font-bold animate-bounce"
                          />
                        </div>
                      </template>

                      <q-list style="min-width: 280px" class="q-pa-sm">
                        <!-- Mutasi Internal -->
                        <q-item
                          clickable
                          v-ripple
                          @click="goToDaftarPermintaan"
                          class="rounded-borders q-mb-xs hover-blue-btn"
                        >
                          <q-item-section avatar
                            ><q-icon name="assignment" color="brand-primary"
                          /></q-item-section>
                          <q-item-section>
                            <q-item-label class="text-weight-bold text-brand-primary"
                              >Daftar Permintaan</q-item-label
                            >
                            <q-item-label caption
                              >Pantau antrean request & mutasi stok</q-item-label
                            >
                          </q-item-section>
                          <q-item-section
                            side
                            v-if="
                              notifGudang[selectedGudang.id]?.mutasiPending > 0 ||
                              notifGudang[selectedGudang.id]?.mutasiApproved > 0
                            "
                          >
                            <q-badge
                              color="red"
                              rounded
                              :label="notifGudang[selectedGudang.id].mutasiPending + ' New'"
                              v-if="notifGudang[selectedGudang.id]?.mutasiPending > 0"
                              class="q-mb-xs shadow-1 animate-bounce"
                            />
                            <q-badge
                              color="positive"
                              rounded
                              label="Cek Kiriman"
                              v-if="notifGudang[selectedGudang.id]?.mutasiApproved > 0"
                              class="shadow-1 animate-bounce"
                            />
                          </q-item-section>
                        </q-item>
                        <q-separator spaced />

                        <!-- Permintaan Antar Gudang -->
                        <q-item
                          clickable
                          v-ripple
                          @click="goToPermintaanAntar"
                          class="rounded-borders q-mb-xs hover-blue-btn"
                        >
                          <q-item-section avatar
                            ><q-icon name="swap_horiz" color="orange-9"
                          /></q-item-section>
                          <q-item-section>
                            <q-item-label class="text-weight-bold"
                              >Permintaan Antar Gudang</q-item-label
                            >
                            <q-item-label caption
                              >Request mutasi stok dari gudang lain</q-item-label
                            >
                          </q-item-section>
                        </q-item>

                        <!-- Purchase Request -->
                        <q-item
                          clickable
                          v-ripple
                          @click="goToPurchaseRequest"
                          class="rounded-borders hover-blue-btn"
                        >
                          <q-item-section avatar
                            ><q-icon name="shopping_cart_checkout" color="brand-primary"
                          /></q-item-section>
                          <q-item-section>
                            <q-item-label class="text-weight-bold"
                              >Purchase Request (PR)</q-item-label
                            >
                            <q-item-label caption>Pengajuan pembelian material baru</q-item-label>
                          </q-item-section>
                          <q-item-section
                            side
                            v-if="
                              notifGudang[selectedGudang.id]?.prApproved > 0 ||
                              notifGudang[selectedGudang.id]?.prRejected > 0
                            "
                          >
                            <q-badge
                              color="positive"
                              rounded
                              :label="notifGudang[selectedGudang.id].prApproved + ' ACC'"
                              v-if="notifGudang[selectedGudang.id]?.prApproved > 0"
                              class="q-mb-xs shadow-1 animate-bounce"
                            />
                            <q-badge
                              color="negative"
                              rounded
                              :label="notifGudang[selectedGudang.id].prRejected + ' Ditolak'"
                              v-if="notifGudang[selectedGudang.id]?.prRejected > 0"
                              class="shadow-1 animate-bounce"
                            />
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                  </div>

                  <!-- Export Data -->
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
                        <q-item
                          clickable
                          v-close-popup
                          @click="exportGudangToPDF"
                          class="hover-blue-btn"
                        >
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
                          @click="exportGudangToExcel"
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

                  <!-- Input Stok Manual -->
                  <div class="col-12 col-sm-auto">
                    <q-btn
                      unelevated
                      color="brand-primary"
                      icon="post_add"
                      label="Input Stok Manual"
                      @click="openAddStokDialog"
                      rounded
                      class="shadow-premium btn-hover text-weight-bold q-py-sm q-px-md full-width"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- TABLE INVENTARIS -->
          <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white border-subtle">
            <q-table
              :rows="stokBarangEnriched"
              :columns="columns"
              row-key="id"
              :filter="filter"
              flat
              :loading="loading"
              binary-state-sort
              class="gudang-table"
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

              <template v-slot:body-cell-kode="props">
                <q-td :props="props" class="text-left">
                  <q-badge
                    color="grey-2"
                    text-color="blue-grey-9"
                    class="font-mono text-weight-bold shadow-sm q-px-sm q-py-xs"
                  >
                    {{ props.value }}
                  </q-badge>
                </q-td>
              </template>

              <template v-slot:body-cell-stok="props">
                <q-td :props="props" class="text-center">
                  <q-chip
                    :color="props.value > 10 ? 'green-1' : 'orange-1'"
                    :text-color="props.value > 10 ? 'green-10' : 'orange-10'"
                    class="text-weight-bolder q-px-md"
                    :icon="props.value > 10 ? 'check_circle' : 'warning'"
                  >
                    {{ props.value }}
                  </q-chip>
                </q-td>
              </template>

              <template v-slot:no-data>
                <div class="full-width row flex-center q-pa-xl text-grey-5">
                  <q-icon name="inventory_2" size="64px" class="q-mb-md" />
                  <div class="text-h6 full-width text-center italic">Gudang ini masih kosong</div>
                </div>
              </template>
            </q-table>
          </q-card>
        </div>
      </div>

      <!-- DIALOG TAMBAH STOK MANUAL -->
      <q-dialog
        v-model="dialogStok"
        persistent
        maximized
        transition-show="slide-up"
        transition-hide="slide-down"
      >
        <q-card class="bg-grey-2 column no-wrap relative-position">
          <q-toolbar class="bg-white text-brand-primary q-py-md shadow-2 content-relative">
            <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
            <q-toolbar-title class="text-weight-bold text-center"
              >PENYESUAIAN STOK MANUAL</q-toolbar-title
            >
            <q-btn
              unelevated
              color="brand-primary"
              label="SIMPAN DATA"
              rounded
              class="q-px-xl text-weight-bold shadow-3 text-white"
              @click="stokFormRef.submit()"
            />
          </q-toolbar>

          <q-scroll-area class="col q-pa-lg q-pa-md-xl content-relative">
            <div class="row justify-center">
              <div class="col-12 col-md-8 col-lg-6">
                <q-card flat bordered class="rounded-20 q-pa-xl bg-white shadow-1">
                  <q-form ref="stokFormRef" @submit="simpanStok" class="q-gutter-y-lg">
                    <div
                      class="text-subtitle1 text-brand-primary text-weight-bolder flex items-center"
                    >
                      <q-icon name="location_on" class="q-mr-sm" /> KONFIRMASI PENYIMPANAN
                    </div>

                    <q-input
                      filled
                      v-model="selectedGudang.nama"
                      label="Lokasi Gudang"
                      readonly
                      bg-color="brand-light"
                      class="text-weight-bold"
                    />

                    <q-separator class="q-my-md" />

                    <div
                      class="text-subtitle1 text-brand-primary text-weight-bolder flex items-center"
                    >
                      <q-icon name="inventory" class="q-mr-sm" /> SELEKSI ITEM & JUMLAH
                    </div>

                    <div class="row q-col-gutter-md">
                      <div class="col-12">
                        <q-select
                          outlined
                          v-model="formStok.kategori"
                          :options="kategoriOptions"
                          label="Filter Berdasarkan Kategori"
                          option-label="nama"
                          option-value="nama"
                          emit-value
                          map-options
                          @update:model-value="onKategoriChange"
                          :rules="[(val) => !!val || 'Pilih kategori terlebih dahulu']"
                        />
                      </div>

                      <div class="col-12">
                        <q-select
                          outlined
                          v-model="formStok.barang"
                          :options="filteredBarangOptions"
                          label="Pilih Nama Barang"
                          option-label="display_name"
                          option-value="id"
                          :disable="!formStok.kategori"
                          use-input
                          @filter="filterBarang"
                          @update:model-value="onBarangChange"
                          :rules="[(val) => !!val || 'Pilih barang yang akan ditambah']"
                        >
                          <template v-slot:no-option>
                            <q-item
                              ><q-item-section class="text-grey text-caption"
                                >Tidak ada barang dalam kategori ini</q-item-section
                              ></q-item
                            >
                          </template>
                        </q-select>
                      </div>
                    </div>

                    <div class="row q-col-gutter-md items-center">
                      <div class="col-12 col-sm-6">
                        <q-input
                          outlined
                          dense
                          v-model.number="formStok.jumlah"
                          type="number"
                          label="Kuantitas Tambahan"
                          prefix="+"
                          class="text-h5 text-weight-bolder text-brand-primary"
                          :rules="[
                            (val) => !!val || 'Wajib diisi',
                            (val) => val > 0 || 'Minimal 1',
                          ]"
                        >
                          <template v-slot:append>
                            <q-badge
                              color="brand-light"
                              text-color="brand-primary"
                              class="q-pa-sm text-weight-bold uppercase"
                            >
                              {{ formStok.satuan || 'UNIT' }}
                            </q-badge>
                          </template>
                        </q-input>
                      </div>

                      <div class="col-12 col-sm-6">
                        <div
                          v-if="formStok.barang"
                          class="bg-brand-light q-pa-md rounded-borders border-dashed text-center"
                        >
                          <div class="text-caption text-grey-7">Stok Saat Ini</div>
                          <div class="text-h6 text-brand-primary text-weight-bolder">
                            {{ currentStokValue }} {{ formStok.satuan }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <q-input
                      outlined
                      v-model="formStok.keterangan"
                      type="textarea"
                      label="Catatan / Alasan Penyesuaian"
                      rows="3"
                      placeholder="Contoh: Sisa material proyek..."
                    />
                  </q-form>
                </q-card>
              </div>
            </div>
          </q-scroll-area>
        </q-card>
      </q-dialog>

      <!-- HIDDEN TEMPLATE UNTUK EXPORT PDF LAPORAN GUDANG -->
      <div style="display: none">
        <div id="stok-print-area" class="report-paper">
          <div class="report-header">
            <div class="row no-wrap items-center">
              <div class="col-auto q-mr-md">
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
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>
              <div>
                <h1 class="report-title">LAPORAN STOK INVENTARIS</h1>
                <div class="report-subtitle">
                  Lokasi: {{ selectedGudang?.nama || 'Semua Gudang' }} | Diekspor pada:
                  {{ new Date().toLocaleString('id-ID') }}
                </div>
              </div>
            </div>
          </div>

          <table class="report-table">
            <thead>
              <tr>
                <th style="width: 40px; text-align: center">NO</th>
                <th style="width: 120px; text-align: left">KODE ITEM</th>
                <th style="text-align: left">IDENTITAS MATERIAL</th>
                <th style="width: 120px; text-align: center">KUANTITAS FISIK</th>
                <th style="width: 100px; text-align: center">SATUAN</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in stokBarangEnriched" :key="row.id">
                <td style="text-align: center">{{ idx + 1 }}</td>
                <td style="font-weight: 800; color: #1a237e">{{ row.kode_barang }}</td>
                <td style="font-weight: bold">{{ row.nama_barang }}</td>
                <td style="text-align: center; font-weight: bold; color: #2e7d32">
                  {{ row.jumlah }}
                </td>
                <td style="text-align: center; font-weight: bold; text-transform: uppercase">
                  {{ row.satuan }}
                </td>
              </tr>
              <tr v-if="stokBarangEnriched.length === 0">
                <td colspan="5" style="text-align: center; font-style: italic; color: #888">
                  Gudang ini masih kosong.
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
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { db } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  orderBy,
  where,
  query,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import html2pdf from 'html2pdf.js'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

const listProyek = ref([])
const selectedGudang = ref(null)
const stokBarang = ref([])
const filter = ref('')
const stokFormRef = ref(null)

const dialogStok = ref(false)
const kategoriOptions = ref([])
const masterBarang = ref([])
const filteredBarangOptions = ref([])
const currentStokValue = ref(0)
const loading = ref(false)

// Format: { gudangId: { mutasiPending: 0, mutasiApproved: 0, prApproved: 0, prRejected: 0 } }
const notifGudang = ref({})
const formStok = ref({ kategori: null, barang: null, jumlah: null, satuan: '', keterangan: '' })

let unsubPermintaan = null
let unsubStok = null
let unsubUser = null

const userData = ref(null)

// INTEGRATED REAL-TIME PERMISSION CONTROL (SOP SINGLE MASTER ROW)
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const menu = modulePerm.menus.find((m) => m.id === '_konstruksi_gudang')
  if (!menu) return false
  if (actionType === 'setuju') return menu.approve || false
  return menu[actionType] || false
}

// Dialog Warning Toast SOP Anti-Bypass
const showPermissionDenied = () => {
  $q.notify({
    html: true,
    message:
      '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Akses Terbatas!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Maaf, Hak Akses Operasional Ditutup! Silakan hubungi Super Admin.</div>',
    color: 'negative',
    icon: 'lock',
    position: 'top',
    timeout: 3000,
    progress: true,
    classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
    actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
  })
}

const goToOpname = () => {
  if (canAction('ubah')) {
    router.push('/konstruksi/gudang/opname/' + selectedGudang.value.id)
  } else {
    showPermissionDenied()
  }
}

const goToRiwayat = () => {
  router.push('/konstruksi/gudang/transaksi?warehouseId=' + selectedGudang.value.id)
}

const goToBarangMasuk = () => {
  if (canAction('buat')) {
    router.push('/konstruksi/gudang/masuk/' + selectedGudang.value.id)
  } else {
    showPermissionDenied()
  }
}

const goToBarangKeluar = () => {
  if (canAction('buat')) {
    router.push('/konstruksi/gudang/keluar/' + selectedGudang.value.id)
  } else {
    showPermissionDenied()
  }
}

const goToDaftarPermintaan = () => {
  router.push('/konstruksi/gudang/permintaan/list?warehouseId=' + selectedGudang.value.id)
}

const goToPermintaanAntar = () => {
  if (canAction('buat')) {
    router.push('/konstruksi/gudang/permintaan-antar/' + selectedGudang.value.id)
  } else {
    showPermissionDenied()
  }
}

const goToPurchaseRequest = () => {
  if (canAction('buat')) {
    router.push('/konstruksi/gudang/purchase-request/' + selectedGudang.value.id)
  } else {
    showPermissionDenied()
  }
}

const columns = [
  { name: 'kode', label: 'KODE ITEM', field: 'kode_barang', align: 'left', sortable: true },
  {
    name: 'nama',
    label: 'IDENTITAS MATERIAL',
    field: 'nama_barang',
    align: 'left',
    sortable: true,
  },
  { name: 'stok', label: 'KUANTITAS FISIK', field: 'jumlah', align: 'center', sortable: true },
  { name: 'satuan', label: 'SATUAN', field: 'satuan', align: 'center' },
]

const stokBarangEnriched = computed(() => {
  return stokBarang.value.map((stok) => {
    const mb = masterBarang.value.find((b) => b.id === stok.id_barang)
    return {
      ...stok,
      kode_barang: mb ? mb.kode : '-',
    }
  })
})

const selectGudang = (gudang) => {
  selectedGudang.value = gudang
  window.scrollTo(0, 0)
}

const hasAnyGudangNotif = (gudangId) => {
  if (!notifGudang.value[gudangId]) return false
  const n = notifGudang.value[gudangId]
  return n.mutasiPending > 0 || n.mutasiApproved > 0 || n.prApproved > 0 || n.prRejected > 0
}

const fetchMasterData = async () => {
  try {
    const catSnap = await getDocs(query(collection(db, 'kategori_barang'), orderBy('nama', 'asc')))
    kategoriOptions.value = catSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    const barSnap = await getDocs(query(collection(db, 'master_barang'), orderBy('nama', 'asc')))
    masterBarang.value = barSnap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        kode: data.kode || '-',
        nama_barang: data.nama,
        merk: data.merk || '',
        id_kategori: data.kategori,
        satuan: data.unit,
        display_name: data.kode
          ? `[${data.kode}] ${data.nama}` + (data.merk ? ' - ' + data.merk : '')
          : data.nama + (data.merk ? ' - ' + data.merk : ''),
      }
    })
  } catch (err) {
    console.error(err)
  }
}

const fetchProyek = async () => {
  try {
    const snap = await getDocs(collection(db, 'proyek'))
    listProyek.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    listenNotifikasiGlobal()
  } catch (err) {
    console.error(err)
  }
}

const listenNotifikasiGlobal = () => {
  if (unsubPermintaan) unsubPermintaan()
  unsubPermintaan = onSnapshot(collection(db, 'permintaan_barang'), (snap) => {
    const counts = { UTAMA: { mutasiPending: 0, mutasiApproved: 0, prApproved: 0, prRejected: 0 } }
    listProyek.value.forEach(
      (p) => (counts[p.id] = { mutasiPending: 0, mutasiApproved: 0, prApproved: 0, prRejected: 0 }),
    )

    const myUid = authStore.user?.uid
    const myEmail = authStore.user?.email
    const isAdmin = authStore.user?.role === 'Super Admin' || authStore.user?.role === 'Admin'

    snap.docs.forEach((doc) => {
      const data = doc.data()

      if (data.tipe === 'ANTAR_GUDANG') {
        if (data.status === 'Pending' && data.dari_gudang?.id) {
          if (!counts[data.dari_gudang.id])
            counts[data.dari_gudang.id] = {
              mutasiPending: 0,
              mutasiApproved: 0,
              prApproved: 0,
              prRejected: 0,
            }
          counts[data.dari_gudang.id].mutasiPending++
        }
        if (data.status === 'Approved' && data.requester_read === false && data.ke_gudang?.id) {
          if (!counts[data.ke_gudang.id])
            counts[data.ke_gudang.id] = {
              mutasiPending: 0,
              mutasiApproved: 0,
              prApproved: 0,
              prRejected: 0,
            }
          counts[data.ke_gudang.id].mutasiApproved++
        }
      }

      if (data.tipe === 'PURCHASE_REQUEST') {
        const gId = data.gudang_id || data.proyek_id
        if (gId && counts[gId]) {
          const isMilikku = data.pemohon?.id === myUid || data.pemohon?.email === myEmail || isAdmin

          if (data.status === 'Approved' && data.requester_read === false && isMilikku) {
            counts[gId].prApproved++
          }
          if (data.status === 'Rejected' && data.requester_read === false && isMilikku) {
            counts[gId].prRejected++
          }
        }
      }
    })
    notifGudang.value = counts
  })
}

const exportGudangToPDF = () => {
  $q.loading.show({ message: 'Generating Professional PDF Laporan...' })
  setTimeout(() => {
    const element = document.getElementById('stok-print-area')
    const gdgNama = selectedGudang.value?.nama.replace(/\s+/g, '_') || 'All'

    const opt = {
      margin: [15, 15, 15, 15],
      filename: `Laporan_Stok_${gdgNama}_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        $q.loading.hide()
        $q.notify({
          html: true,
          message:
            '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">PDF Diunduh!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Laporan PDF Gudang berhasil disimpan ke perangkat Anda.</div>',
          color: 'positive',
          icon: 'task_alt',
          position: 'top',
          timeout: 4000,
          progress: true,
          classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
          actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
        })
      })
  }, 500)
}

const exportGudangToExcel = () => {
  const now = new Date()
  const exportDate = now.toLocaleString('id-ID')
  const gudangName = selectedGudang.value?.nama || 'Semua Gudang'

  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
    <meta charset="utf-8" />
    <style>
      .table-bordered { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 12px; }
      .table-bordered th, .table-bordered td { border: 1px solid #dddddd; padding: 8px; }
      .header-row th { background-color: #36ada3; color: #ffffff; font-weight: bold; text-align: left; }
      .title { font-size: 18px; font-weight: bold; color: #36ada3; font-family: sans-serif; }
      .subtitle { font-size: 12px; color: #666666; font-family: sans-serif; }
    </style>
    </head>
    <body>
      <div class="title">LAPORAN STOK INVENTARIS - ${gudangName.toUpperCase()}</div>
      <div class="subtitle">Diekspor pada: ${exportDate}</div>
      <br>
      <table class="table-bordered">
        <tr class="header-row">
          <th width="50" style="text-align: center;">NO</th>
          <th width="150">KODE ITEM</th>
          <th width="300">IDENTITAS MATERIAL</th>
          <th width="120" style="text-align: center;">KUANTITAS FISIK</th>
          <th width="120" style="text-align: center;">SATUAN</th>
        </tr>
  `

  stokBarangEnriched.value.forEach((row, idx) => {
    html += `
      <tr>
        <td align="center">${idx + 1}</td>
        <td style="font-weight: bold; color: #36ada3;">${row.kode_barang}</td>
        <td>${row.nama_barang}</td>
        <td align="center" style="font-weight: bold; color: #2e7d32;">${row.jumlah}</td>
        <td align="center" style="text-transform: uppercase;">${row.satuan}</td>
      </tr>
    `
  })

  html += `
      </table>
    </body>
    </html>
  `

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Laporan_Stok_${gudangName.replace(/ /g, '_')}_${Date.now()}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const openAddStokDialog = async () => {
  if (canAction('buat')) {
    formStok.value = { kategori: null, barang: null, jumlah: null, satuan: '', keterangan: '' }
    currentStokValue.value = 0
    $q.loading.show({ message: 'Menyiapkan database barang...' })
    await fetchMasterData()
    $q.loading.hide()
    dialogStok.value = true
  } else {
    showPermissionDenied()
  }
}

const onKategoriChange = (val) => {
  formStok.value.barang = null
  formStok.value.satuan = ''
  currentStokValue.value = 0
  filteredBarangOptions.value = masterBarang.value.filter((b) => b.id_kategori === val)
}

const filterBarang = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    filteredBarangOptions.value = masterBarang.value.filter(
      (b) =>
        b.id_kategori === formStok.value.kategori &&
        b.display_name.toLowerCase().indexOf(needle) > -1,
    )
  })
}

const onBarangChange = (val) => {
  if (val) {
    formStok.value.satuan = val.satuan || ''
    const existing = stokBarang.value.find((s) => s.id_barang === val.id)
    currentStokValue.value = existing ? existing.jumlah : 0
  }
}

const simpanStok = async () => {
  if (!selectedGudang.value || !formStok.value.barang) return
  if (!canAction('buat')) {
    showPermissionDenied()
    return
  }
  $q.loading.show({ message: 'Mensinkronisasi stok...' })
  try {
    const idGudang = selectedGudang.value.id
    const idBarang = formStok.value.barang.id
    const namaBarang = formStok.value.barang.display_name
    const tambahan = Number(formStok.value.jumlah)

    const qStok = query(
      collection(db, 'stok_barang'),
      where('id_gudang', '==', idGudang),
      where('id_barang', '==', idBarang),
    )
    const stokSnap = await getDocs(qStok)

    if (!stokSnap.empty) {
      await updateDoc(doc(db, 'stok_barang', stokSnap.docs[0].id), {
        jumlah: Number(stokSnap.docs[0].data().jumlah) + tambahan,
        updated_at: serverTimestamp(),
      })
    } else {
      await addDoc(collection(db, 'stok_barang'), {
        id_gudang: idGudang,
        id_barang: idBarang,
        nama_barang: formStok.value.barang.nama_barang,
        jumlah: tambahan,
        satuan: formStok.value.satuan,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
    }

    await addDoc(collection(db, 'aktivitas'), {
      id_gudang: idGudang,
      nama_barang: namaBarang,
      tipe: 'MASUK',
      jumlah: tambahan,
      keterangan: formStok.value.keterangan || 'Penambahan stok manual',
      timestamp: serverTimestamp(),
    })

    $q.notify({
      html: true,
      message:
        '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Sinkronisasi Berhasil!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Stok gudang telah berhasil diperbarui dan dicatatkan di database.</div>',
      color: 'positive',
      icon: 'task_alt',
      position: 'top',
      timeout: 4000,
      progress: true,
      classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
      actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
    })

    dialogStok.value = false
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Gagal: ' + error.message })
  } finally {
    $q.loading.hide()
  }
}

watch(selectedGudang, (newVal) => {
  if (unsubStok) unsubStok()
  if (newVal) {
    loading.value = true
    unsubStok = onSnapshot(
      query(collection(db, 'stok_barang'), where('id_gudang', '==', newVal.id)),
      (snap) => {
        stokBarang.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        loading.value = false
      },
      (err) => {
        console.error(err)
        loading.value = false
      },
    )
  }
})

// Real-time listener hak akses user dengan watcher untuk menangani load async secara aman
watch(
  () => authStore.user,
  (newUser) => {
    if (unsubUser) unsubUser()
    if (newUser?.email) {
      const qUser = query(collection(db, 'karyawan'), where('email', '==', newUser.email))
      unsubUser = onSnapshot(qUser, (snapshot) => {
        if (!snapshot.empty) {
          userData.value = snapshot.docs[0].data()
        }
      })
    }
  },
  { immediate: true },
)

onMounted(() => {
  fetchProyek()
  fetchMasterData()
})

onUnmounted(() => {
  if (unsubPermintaan) unsubPermintaan()
  if (unsubStok) unsubStok()
  if (unsubUser) unsubUser()
})
</script>

<style scoped>
/* ===== GLOBAL THEME ORIGNAL CODES ===== */
.font-pro {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    sans-serif;
}
.font-mono {
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.5px;
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
.hover-shadow:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
}
.transition-all {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.border-dashed {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
}
.gudang-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
}
.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transition: 0.3s;
}

/* RESPONSIVENESS: TOMBOL-TOMBOL MEMBENTANG PENUH DI HP */
@media (max-width: 599px) {
  .full-width-mobile {
    width: 100% !important;
    display: block !important;
  }
  .q-btn.full-width {
    width: 100% !important;
  }
}

.animate-fade {
  animation: fadeIn 0.8s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-up {
  animation: fadeInUp 0.8s ease-out forwards;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
    transform: translateY(-5px);
  }
}
.tracking-widest {
  letter-spacing: 0.15em;
}
.block {
  display: block;
}
.uppercase {
  text-transform: uppercase;
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.z-top {
  z-index: 10;
}

/* REPORT EXPORT STYLES (HIDDEN) */
.report-paper {
  font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif;
  color: #333;
  padding: 10px;
  background: white;
}
.report-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 3px solid #36ada3;
  padding-bottom: 15px;
}
.report-icon {
  background-color: #36ada3;
  border-radius: 8px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.report-title {
  margin: 0;
  color: #36ada3;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.5px;
  line-height: 1.2;
}
.report-subtitle {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
  font-weight: bold;
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
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-white-2 {
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.shrink {
  flex: 0 0 auto;
}
.content-relative {
  position: relative;
  z-index: 1;
}

.hover-blue-btn:hover {
  background-color: #e0f5f4 !important;
  color: #1e6e69 !important;
}

.page-content-wrapper {
  padding: 0 16px;
}
@media (min-width: 768px) {
  .page-content-wrapper {
    padding: 0 24px;
  }
}

/* ===== BRAND COLOR PALETTE ===== */
:root {
  --brand-primary: #36ada3;
  --brand-primary-dark: #1e6e69;
  --brand-primary-light: #e0f5f4;
  --brand-primary-mid: #b2e5e2;
  --brand-danger: #ad3640;
  --brand-danger-dark: #7a2028;
  --brand-danger-light: #f7e0e1;
  --page-bg: #f0fafa;
}

.bg-brand-primary {
  background-color: #36ada3 !important;
}
.bg-brand-light {
  background-color: #e0f5f4 !important;
}
.bg-brand-danger {
  background-color: #ad3640 !important;
}
.text-brand-primary {
  color: #36ada3 !important;
}
.text-brand-teal {
  color: #36ada3 !important;
}
.text-brand-danger {
  color: #ad3640 !important;
}
.bg-page {
  background-color: #f0fafa !important;
}

/* ===== QUASAR COMPONENT DEEP OVERRIDES ===== */
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
:deep(.q-field--focused .q-field__control) {
  border-color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__label) {
  color: #36ada3 !important;
}
</style>
