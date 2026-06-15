<template>
  <q-page class="bg-page q-pa-md font-pro relative-position">
    <!-- ============================================================ -->
    <!-- LOADING STATE: Saat cek hak akses berlangsung                -->
    <!-- ============================================================ -->
    <div v-if="aksesLoading" class="flex flex-center" style="min-height: 60vh">
      <div class="text-center">
        <q-spinner-orbit color="brand-primary" size="60px" class="q-mb-md" />
        <div class="text-subtitle1 text-blue-grey-7 text-weight-medium">
          Memeriksa hak akses sistem...
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- AKSES DITOLAK: Tampil jika tidak punya izin                  -->
    <!-- ============================================================ -->
    <div v-else-if="!aksesGranted" class="flex flex-center" style="min-height: 60vh">
      <q-card
        flat
        bordered
        class="rounded-borders q-pa-xl text-center shadow-2"
        style="max-width: 420px"
      >
        <q-icon name="lock" color="red-4" size="80px" class="q-mb-md" />
        <div class="text-h6 text-weight-bold text-blue-grey-10 q-mb-sm">Akses Ditolak</div>
        <div class="text-body2 text-grey-7 q-mb-lg">
          Anda tidak memiliki izin untuk mengakses modul
          <strong>Absensi Harian Lepas</strong>. Silakan hubungi administrator untuk pengaturan hak
          akses.
        </div>
        <q-btn
          unelevated
          color="brand-primary"
          icon="arrow_back"
          label="Kembali ke Dashboard"
          rounded
          @click="router.replace('/')"
        />
      </q-card>
    </div>

    <!-- ============================================================ -->
    <!-- KONTEN UTAMA: Hanya tampil jika aksesGranted === true        -->
    <!-- ============================================================ -->
    <template v-else>
      <!-- ======================================================================= -->
      <!-- VIEW 1: DASHBOARD UTAMA DENGAN TAB KONSTRUKSI & MANUFAKTUR             -->
      <!-- ======================================================================= -->
      <div v-if="!selectedProjectId" class="premium-container mx-auto animate-fade-in">
        <!-- HEADER DASHBOARD UTAMA -->
        <div class="row items-center justify-between q-mb-lg">
          <div class="col-12 col-md-8">
            <div class="row items-center no-wrap q-mb-xs">
              <div
                class="ios-icon-box bg-gradient-primary text-white q-mr-sm shadow-md flex-shrink-0"
              >
                <q-icon name="business" size="26px" />
              </div>
              <h4
                class="text-h4 text-weight-black text-brand-primary q-ma-none letter-spacing-tight"
              >
                Absensi Harian Lepas
              </h4>
            </div>
            <div class="text-subtitle1 text-blue-grey-6 q-mt-xs">
              Pilih tipe pekerjaan aktif di bawah ini untuk mengelola absensi harian kelompok mandor
              proyek atau pekerja pabrik.
            </div>
          </div>
        </div>

        <!-- SELEKTOR TAB UTAMA: KONSTRUKSI VS MANUFAKTUR -->
        <q-card flat class="bento-card bg-white q-mb-lg no-print shadow-soft overflow-hidden">
          <q-tabs
            v-model="mainActiveTab"
            dense
            no-caps
            inline-label
            class="text-grey-7 bg-brand-light"
            active-color="brand-primary"
            indicator-color="brand-primary"
            align="left"
            narrow-indicator
          >
            <q-tab
              name="konstruksi"
              icon="architecture"
              label="Proyek Konstruksi"
              class="text-weight-bold q-py-md"
            />
            <q-tab
              name="manufaktur"
              icon="precision_manufacturing"
              label="Pekerjaan Manufaktur"
              class="text-weight-bold q-py-md"
            />
          </q-tabs>
        </q-card>

        <!-- KONTEN TAB UTAMA -->
        <q-tab-panels v-model="mainActiveTab" animated keep-alive class="bg-transparent">
          <!-- TAB 1: PROYEK KONSTRUKSI -->
          <q-tab-panel name="konstruksi" class="q-pa-none">
            <!-- STATS CARDS GRID -->
            <div class="row q-col-gutter-md q-mb-xl">
              <div class="col-12 col-md-4">
                <div
                  class="kpi-box text-white q-pa-md rounded-24 row items-center no-wrap relative-position overflow-hidden cursor-pointer"
                >
                  <div class="decor-circle-1"></div>
                  <div class="col z-content">
                    <div class="text-overline text-brand-light font-bold uppercase tracking-wide">
                      Total Proyek
                    </div>
                    <div class="text-h4 text-weight-black text-white font-mono q-mt-xs">
                      {{ proyekKonstruksiList.length }}
                    </div>
                    <div class="text-caption text-slate-300 q-mt-xs">
                      Proyek konstruksi terintegrasi
                    </div>
                  </div>
                  <div class="bg-white text-brand-primary q-pa-md rounded-16 z-content">
                    <q-icon name="apartment" size="28px" />
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div
                  class="kpi-box text-white q-pa-md rounded-24 row items-center no-wrap relative-position overflow-hidden cursor-pointer"
                >
                  <div class="decor-circle-1"></div>
                  <div class="col z-content">
                    <div class="text-overline text-brand-light font-bold uppercase tracking-wide">
                      Status Kehadiran
                    </div>
                    <div class="text-h4 text-weight-black text-white font-mono q-mt-xs">AKTIF</div>
                    <div class="text-caption text-slate-300 q-mt-xs">
                      Sistem absensi harian siap pakai
                    </div>
                  </div>
                  <div class="bg-white text-brand-primary q-pa-md rounded-16 z-content">
                    <q-icon name="verified_user" size="28px" />
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div
                  class="kpi-box text-white q-pa-md rounded-24 row items-center no-wrap relative-position overflow-hidden cursor-pointer"
                >
                  <div class="decor-circle-1"></div>
                  <div class="col z-content">
                    <div class="text-overline text-brand-light font-bold uppercase tracking-wide">
                      AGRA INTEGRATION
                    </div>
                    <div class="text-subtitle1 text-weight-bold q-mt-xs line-height-tight">
                      Absensi &amp; Payroll Terpusat
                    </div>
                    <div class="text-caption text-slate-300 q-mt-xs">
                      Sinkron dengan modul proyek utama
                    </div>
                  </div>
                  <div class="bg-white text-brand-primary q-pa-md rounded-16 z-content">
                    <q-icon name="sync" size="28px" />
                  </div>
                </div>
              </div>
            </div>

            <!-- SEARCH AREA -->
            <q-card flat class="bento-card bg-white q-pa-md q-mb-lg shadow-soft">
              <q-input
                v-model="filterProyek"
                outlined
                dense
                rounded
                placeholder="Cari Proyek, Klien, atau Lokasi..."
                bg-color="white"
                class="search-input"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="brand-primary" />
                </template>
                <template v-slot:append v-if="filterProyek">
                  <q-icon name="close" @click="filterProyek = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </q-card>

            <!-- GRID DAFTAR PROYEK CONSTRUCT -->
            <div class="row q-col-gutter-lg">
              <div
                v-for="(p, pi) in filteredProyekList"
                :key="p.id"
                class="col-12 col-md-6 col-lg-4"
              >
                <q-card
                  flat
                  class="bento-card bg-white shadow-soft hover-card-premium overflow-hidden relative-position full-height flex column justify-between"
                >
                  <!-- Left accent color bar -->
                  <div
                    class="absolute-left"
                    :style="{ backgroundColor: getMandorColor(pi), width: '5px' }"
                  ></div>

                  <q-card-section class="q-pa-lg">
                    <div class="row items-center justify-between q-mb-md">
                      <q-badge
                        color="brand-light"
                        text-color="brand-primary"
                        class="text-weight-bold q-px-sm q-py-xs rounded-6 font-pro text-11"
                      >
                        <q-icon name="tag" size="10px" class="q-mr-xs" /> PROYEK {{ pi + 1 }}
                      </q-badge>
                      <q-badge
                        color="brand-light"
                        text-color="brand-primary"
                        class="text-weight-bold font-pro text-11"
                        >AKTIF</q-badge
                      >
                    </div>

                    <div
                      class="text-h6 text-weight-black text-blue-grey-10 uppercase line-height-tight q-mb-sm text-ellipsis-2"
                    >
                      {{ p.nama }}
                    </div>

                    <q-separator class="q-my-md opacity-50" />

                    <div class="q-gutter-y-xs text-caption text-blue-grey-6">
                      <div class="row items-center no-wrap">
                        <q-icon name="person" color="brand-primary" class="q-mr-xs" size="16px" />
                        <span class="text-weight-bold text-blue-grey-8 uppercase q-mr-xs"
                          >Klien:</span
                        >
                        <span class="ellipsis col">{{ p.konsumen || 'INTERNAL PROJECT' }}</span>
                      </div>
                      <div class="row items-start no-wrap q-mt-xs">
                        <q-icon
                          name="place"
                          color="brand-primary"
                          class="q-mr-xs q-mt-xs"
                          size="16px"
                        />
                        <span class="text-weight-bold text-blue-grey-8 uppercase q-mr-xs"
                          >Lokasi:</span
                        >
                        <span class="col leading-tight">{{
                          p.alamat || 'Alamat Belum Diatur'
                        }}</span>
                      </div>
                    </div>
                  </q-card-section>

                  <q-card-actions class="q-px-lg q-pb-lg q-pt-none">
                    <q-btn
                      unelevated
                      label="KELOLA ABSENSI PEKERJA"
                      color="brand-primary"
                      icon-right="arrow_forward"
                      class="full-width rounded-12 text-weight-black shadow-soft-primary q-py-sm"
                      @click="selectProject(p)"
                    />
                  </q-card-actions>
                </q-card>
              </div>

              <div
                v-if="filteredProyekList.length === 0"
                class="col-12 text-center q-pa-xl bg-white rounded-24 border border-subtle"
              >
                <q-icon name="sentiment_dissatisfied" size="4em" color="grey-3" />
                <div class="text-blue-grey-5 text-subtitle1 q-mt-md">
                  Proyek tidak ditemukan. Pastikan data master proyek konstruksi terisi.
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- TAB 2: PEKERJAAN MANUFAKTUR (DIRECT MANUAL INPUT MODEL) -->
          <q-tab-panel name="manufaktur" class="q-pa-none">
            <!-- INPUT PEKERJA MANUFAKTUR BARU -->
            <q-card flat class="bento-card bg-white q-pa-lg shadow-soft q-mb-lg">
              <div class="row items-center no-wrap q-mb-md">
                <q-avatar
                  color="brand-light"
                  text-color="brand-primary"
                  size="38px"
                  icon="precision_manufacturing"
                  class="q-mr-sm shadow-sm flex-shrink-0"
                />
                <div>
                  <div class="text-subtitle1 text-weight-black text-blue-grey-10 leading-tight">
                    Direct Input Log Harian Manufaktur
                  </div>
                  <div class="text-caption text-grey-6 text-wrap q-mt-xs">
                    Pencatatan langsung log kehadiran &amp; jam upah buruh pabrik harian lepas.
                  </div>
                </div>
              </div>

              <q-separator class="q-mb-md" />

              <div class="row q-col-gutter-md items-end">
                <q-input
                  v-model="manufakturForm.nama"
                  outlined
                  dense
                  label="Nama Pekerja"
                  class="col-12 col-sm-3 rounded-input"
                  placeholder="Nama lengkap pekerja"
                />
                <q-select
                  v-model="manufakturForm.stasiun"
                  outlined
                  dense
                  :options="stasiunOptions"
                  label="Stasiun Kerja"
                  class="col-12 col-sm-3 rounded-input"
                />
                <q-input
                  v-model.number="manufakturForm.upahJam"
                  type="number"
                  outlined
                  dense
                  prefix="Rp"
                  label="Upah per Jam"
                  class="col-12 col-sm-2 rounded-input"
                />
                <q-input
                  v-model.number="manufakturForm.jamKerja"
                  type="number"
                  outlined
                  dense
                  label="Jam Kerja Aktif"
                  class="col-12 col-sm-2 rounded-input"
                />
                <q-input
                  v-model.number="manufakturForm.lembur"
                  type="number"
                  outlined
                  dense
                  label="Lembur (Jam)"
                  class="col-12 col-sm-1 rounded-input"
                />
                <div class="col-12 col-sm-1">
                  <q-btn
                    unelevated
                    color="brand-primary"
                    icon="add"
                    class="full-width rounded-12 q-py-sm text-weight-bold"
                    @click="addManufakturPekerja"
                  />
                </div>
              </div>
            </q-card>

            <!-- DAFTAR LOG HARIAN AKTIF -->
            <q-card flat class="bento-card bg-white shadow-soft overflow-hidden">
              <div class="q-pa-md bg-slate-50 text-center border-bottom">
                <div class="text-subtitle2 text-weight-bold text-blue-grey-10 q-mb-xs">
                  Rekap Input Berjalan (Hari Ini)
                </div>
                <div class="text-caption text-grey-6 text-weight-medium">
                  Grand Total Upah Manufaktur:
                </div>
                <div class="text-subtitle1 text-weight-black text-brand-primary font-mono q-mt-xs">
                  Rp {{ formatUang(totalUpahManufaktur) }}
                </div>
              </div>

              <div class="q-pa-md">
                <div
                  v-if="manufakturPekerjaList.length === 0"
                  class="text-center q-pa-xl text-grey-5"
                >
                  <q-icon name="playlist_remove" size="4em" />
                  <div class="text-subtitle1 q-mt-sm">
                    Belum ada input log pekerja manufaktur hari ini.
                  </div>
                </div>

                <div v-else style="overflow-x: auto; -webkit-overflow-scrolling: touch">
                  <table class="abs-tbl">
                    <thead>
                      <tr class="bg-slate-50">
                        <th style="width: 40px" class="text-center">#</th>
                        <th>NAMA PEKERJA</th>
                        <th class="text-center">STASIUN KERJA</th>
                        <th class="text-right">UPAH / JAM</th>
                        <th class="text-center">JAM KERJA</th>
                        <th class="text-center">LEMBUR</th>
                        <th class="text-right">TOTAL ESTIMASI UPAH</th>
                        <th style="width: 60px" class="text-center">AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(p, pi) in manufakturPekerjaList" :key="p.id">
                        <td class="text-center text-grey-5 font-mono text-weight-bold">
                          {{ pi + 1 }}
                        </td>
                        <td class="text-weight-bold text-blue-grey-9 uppercase">{{ p.nama }}</td>
                        <td class="text-center">
                          <q-badge
                            color="brand-light"
                            text-color="brand-primary"
                            class="text-weight-bold q-px-sm q-py-xs rounded-6"
                          >
                            {{ p.stasiun }}
                          </q-badge>
                        </td>
                        <td class="text-right font-mono">Rp {{ formatUang(p.upahJam) }}</td>
                        <td class="text-center font-mono">{{ p.jamKerja }} Jam</td>
                        <td class="text-center font-mono text-brand-primary font-bold">
                          {{ p.lembur }} Jam
                        </td>
                        <td class="text-right text-weight-bold text-brand-primary font-mono">
                          Rp {{ formatUang(p.totalUpah) }}
                        </td>
                        <td class="text-center">
                          <q-btn
                            flat
                            dense
                            round
                            icon="close"
                            color="red-4"
                            size="sm"
                            @click="deleteManufakturPekerja(p.id)"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="row justify-end q-mt-lg">
                  <q-btn
                    unelevated
                    color="brand-primary"
                    icon="cloud_upload"
                    label="KIRIM & SIMPAN LOG HARIAN"
                    class="rounded-12 text-weight-black shadow-md q-px-xl q-py-sm"
                  />
                </div>
              </div>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <!-- ======================================================================= -->
      <!-- VIEW 2: FORM MANAGEMEN ABSENSI TERISOLASI PER PROYEK                    -->
      <!-- ======================================================================= -->
      <div v-else class="premium-container mx-auto">
        <!-- BACK NAVIGATION BAR -->
        <div class="row items-center justify-between detail-header-row no-print animate-fade-in">
          <div class="col-12 col-md-8 detail-header-col">
            <div class="row items-center no-wrap">
              <q-btn
                flat
                round
                color="brand-primary"
                icon="arrow_back"
                @click="deselectProject"
                class="q-mr-md bg-white shadow-1"
              />
              <div>
                <div class="row items-center no-wrap q-gutter-x-sm">
                  <span
                    class="text-h5 text-md-h4 text-weight-bolder text-brand-primary leading-tight uppercase font-pro"
                  >
                    Kelola Pekerja &amp; Mandor
                  </span>
                </div>
                <div class="text-body2 text-md-subtitle1 text-grey-7 q-mt-sm text-weight-medium">
                  {{ selectedProjectData?.nama }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TABS NAVIGASI PREMIUM -->
        <q-card flat class="bento-card bg-white q-mb-lg no-print shadow-soft overflow-hidden">
          <q-tabs
            v-model="activeTab"
            dense
            no-caps
            inline-label
            class="text-grey-7 bg-brand-light"
            active-color="brand-primary"
            indicator-color="brand-primary"
            align="left"
            narrow-indicator
            outside-arrows
            mobile-arrows
          >
            <q-tab
              name="mandor"
              icon="groups"
              label="Mandor &amp; Pekerja"
              class="text-weight-bold q-py-sm"
            />
          </q-tabs>
        </q-card>

        <!-- TAB PANELS CONTENT (TERISOLASI) -->
        <q-tab-panels v-model="activeTab" animated keep-alive class="bg-transparent">
          <!-- PANEL 2: MANDOR & PEKERJA (TERISOLASI) -->
          <q-tab-panel name="mandor" class="q-pa-none">
            <!-- Form Tambah Mandor -->
            <q-card flat class="bento-card bg-white q-pa-lg shadow-soft q-mb-lg no-print">
              <div class="text-subtitle1 text-weight-bold text-blue-grey-9 q-mb-md">
                Tambah Kelompok Mandor / Sub-Pekerjaan
              </div>
              <div class="row q-col-gutter-md items-end">
                <q-input
                  v-model="mandorForm.nama"
                  outlined
                  dense
                  label="Nama Mandor / PJ Sub"
                  class="col-12 col-sm-3 rounded-input"
                  placeholder="Contoh: Mandor Andi"
                  hide-bottom-space
                />
                <q-select
                  v-model="mandorForm.spk"
                  outlined
                  dense
                  :options="spkOptions"
                  option-value="id"
                  option-label="nama_kontrak"
                  label="SPK / Kontrak Pekerjaan"
                  class="col-12 col-sm-3 rounded-input"
                  emit-value
                  map-options
                  clearable
                  hide-bottom-space
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey text-caption">
                        Belum ada SPK terdaftar di proyek ini
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
                <q-select
                  v-model="mandorForm.bidang"
                  outlined
                  dense
                  :options="bidangOptions"
                  label="Bidang / Sub Pekerjaan"
                  class="col-12 col-sm-3 rounded-input"
                  hide-bottom-space
                  :disable="!mandorForm.spk"
                />
                <q-input
                  v-model="mandorForm.hp"
                  outlined
                  dense
                  label="No. HP Mandor"
                  class="col-12 col-sm-3 rounded-input"
                  placeholder="Contoh: 0812-xxxx-xxxx"
                  hide-bottom-space
                />
                <div class="col-12">
                  <q-btn
                    unelevated
                    color="brand-primary"
                    icon="person_add"
                    label="Tambah Kelompok Mandor"
                    class="rounded-12 text-weight-bold shadow-premium"
                    style="min-height: 40px"
                    @click="addMandor"
                    :disable="!bisa.buat"
                  />
                </div>
              </div>
            </q-card>

            <!-- List Blok Mandor & Pekerja Di Dalamnya -->
            <div
              v-if="mandors.length === 0"
              class="text-center q-pa-xl bg-white rounded-24 border border-subtle animate-fade-in"
            >
              <q-icon name="group_off" size="4em" color="grey-4" />
              <div class="text-grey-6 text-subtitle1 q-mt-sm">
                Belum ada kelompok mandor terdaftar di proyek ini. Silakan tambahkan di atas.
              </div>
            </div>

            <div
              v-for="(m, mi) in mandors"
              :key="m.id"
              class="mandor-container bg-white q-mb-lg rounded-24 border border-subtle shadow-soft overflow-hidden animate-fade-in"
            >
              <!-- Header Mandor Group -->
              <div
                class="bg-brand-light q-pa-md row items-center justify-between border-bottom mandor-header-row"
              >
                <div class="row items-center no-wrap">
                  <q-avatar
                    size="40px"
                    color="brand-primary"
                    text-color="white"
                    class="q-mr-md text-weight-bold shadow-sm font-pro flex-shrink-0"
                  >
                    {{ mi + 1 }}
                  </q-avatar>
                  <div>
                    <div class="text-subtitle1 text-weight-bold text-blue-grey-10 uppercase">
                      {{ m.nama }}
                    </div>
                    <div class="text-caption text-grey-7 font-medium">
                      BIDANG:
                      <span class="text-weight-bold text-blue-grey-8">{{
                        (m.bidang || 'Umum').toUpperCase()
                      }}</span>
                      <span class="q-mx-xs">•</span> TELP: {{ m.hp || '-' }}
                      <span class="q-mx-xs">•</span> TOTAL:
                      {{ m.pekerja ? m.pekerja.length : 0 }} Pekerja
                      <template v-if="m.spk_nama_kontrak">
                        <span class="q-mx-xs">•</span>
                        <span class="text-brand-primary text-weight-bold">{{
                          m.spk_nama_kontrak
                        }}</span>
                      </template>
                    </div>
                  </div>
                </div>
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="red-5"
                  class="no-print"
                  @click="deleteMandor(m.id)"
                  :disable="!bisa.hapus"
                />
              </div>

              <!-- Body Mandor Group -->
              <div class="q-pa-md">
                <!-- Baris Form Pekerja -->
                <div
                  class="row q-col-gutter-sm items-end q-mb-md no-print form-pekerja-box q-pa-sm rounded-12 border border-dashed"
                >
                  <q-input
                    v-model="pekerjaForms[m.id].nama"
                    outlined
                    dense
                    bg-color="white"
                    label="Nama Pekerja"
                    class="col-12 col-sm-2 rounded-input"
                    placeholder="Nama lengkap pekerja"
                  />
                  <q-select
                    v-model="pekerjaForms[m.id].jabatan"
                    outlined
                    dense
                    bg-color="white"
                    use-input
                    fill-input
                    hide-selected
                    new-value-mode="add-unique"
                    :options="currentOptions"
                    @filter="(val, update) => filterJabatan(val, update, m.id)"
                    @blur="onJabatanBlur(m.id)"
                    @update:model-value="(val) => onJabatanSelected(val, m.id)"
                    label="Jabatan"
                    class="col-12 col-sm-2 rounded-input"
                  />
                  <q-input
                    v-model.number="pekerjaForms[m.id].upahHari"
                    outlined
                    dense
                    bg-color="white"
                    type="number"
                    prefix="Rp"
                    label="Upah Base / Hari"
                    class="col-12 col-sm-2 rounded-input"
                  />
                  <q-input
                    v-model.number="pekerjaForms[m.id].koef"
                    outlined
                    dense
                    bg-color="white"
                    type="number"
                    step="0.05"
                    label="Koef"
                    class="col-12 col-sm-1 rounded-input"
                  />
                  <q-input
                    v-model.number="pekerjaForms[m.id].upahLembur"
                    outlined
                    dense
                    bg-color="white"
                    type="number"
                    prefix="Rp"
                    label="Lembur / Jam"
                    class="col-12 col-sm-2 rounded-input"
                  />
                  <q-input
                    v-model.number="pekerjaForms[m.id].koefLembur"
                    outlined
                    dense
                    bg-color="white"
                    type="number"
                    step="0.05"
                    label="Koef Lembur"
                    class="col-12 col-sm-1 rounded-input"
                  />
                  <div class="col-12 col-sm-2">
                    <q-btn
                      unelevated
                      color="brand-primary"
                      icon="add"
                      label="Tambah"
                      class="w-full rounded-12 q-py-sm text-weight-bold"
                      @click="addPekerja(m.id)"
                      :disable="!bisa.buat"
                    />
                  </div>
                </div>

                <!-- Tabel Pekerja Harian Group Mandor -->
                <div
                  v-if="!m.pekerja || m.pekerja.length === 0"
                  class="text-center text-grey-5 text-caption q-py-md"
                >
                  Belum ada pekerja di dalam kelompok mandor ini.
                </div>
                <div v-else>
                  <!-- Card List for Mobile -->
                  <div v-if="$q.screen.lt.md" class="q-gutter-y-sm">
                    <div
                      v-for="(p, pi) in m.pekerja"
                      :key="p.id"
                      class="worker-card bg-slate-50 q-pa-md rounded-16 border border-subtle relative-position"
                    >
                      <div class="row items-center justify-between q-mb-xs">
                        <div class="row items-center">
                          <div class="text-weight-bold text-blue-grey-5 font-mono q-mr-sm">
                            #{{ pi + 1 }}
                          </div>
                          <div class="text-weight-bold text-blue-grey-10 text-subtitle2 uppercase">
                            {{ p.nama }}
                          </div>
                        </div>
                        <q-btn
                          flat
                          dense
                          round
                          icon="close"
                          color="red-4"
                          size="sm"
                          class="no-print"
                          @click="deletePekerja(m.id, p.id)"
                          :disable="!bisa.hapus"
                        />
                      </div>
                      <div class="row items-center q-gutter-x-sm q-mb-xs">
                        <q-badge
                          color="brand-light"
                          text-color="brand-primary"
                          class="text-weight-bold q-px-sm q-py-xs rounded-6 text-11"
                        >
                          {{ p.jabatan || 'Tukang' }}
                        </q-badge>
                        <q-badge
                          color="brand-light"
                          text-color="brand-primary"
                          class="text-weight-bold q-px-sm q-py-xs rounded-6 text-11"
                        >
                          Koef: {{ (p.koef || 1.0).toFixed(2) }}x
                        </q-badge>
                        <q-badge
                          color="orange-1"
                          text-color="orange-9"
                          class="text-weight-bold q-px-sm q-py-xs rounded-6 text-11"
                        >
                          Lembur: Rp {{ formatUang((p.upahLembur || 25000) * (p.koefLembur || 1.0)) }}/Jam ({{ (p.koefLembur || 1.0).toFixed(2) }}x)
                        </q-badge>
                      </div>
                      <div
                        class="row items-center justify-between text-caption q-mt-sm bg-white q-pa-sm rounded-8 border border-subtle"
                      >
                        <div>
                          <span class="text-grey-6 text-10 block font-bold uppercase"
                            >UPAH BASE</span
                          >
                          <div class="text-weight-medium font-mono text-blue-grey-8">
                            Rp {{ formatUang(p.upahHari) }}
                          </div>
                        </div>
                        <div class="text-right">
                          <span class="text-grey-6 text-10 block font-bold uppercase"
                            >UPAH EFEKTIF</span
                          >
                          <div class="text-weight-bold font-mono text-brand-primary">
                            Rp {{ formatUang((p.upahHari || 0) * (p.koef || 1.0)) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Table View for Desktop -->
                  <div v-else style="overflow-x: auto; -webkit-overflow-scrolling: touch">
                    <table class="abs-tbl">
                      <thead>
                        <tr class="bg-slate-50">
                          <th style="width: 40px" class="text-center">#</th>
                          <th>NAMA PEKERJA</th>
                          <th class="text-center">JABATAN</th>
                          <th class="text-right">UPAH BASE / HARI</th>
                          <th class="text-center">KOEF.</th>
                          <th class="text-right">UPAH EFEKTIF / HARI</th>
                          <th class="text-right">UPAH LEMBUR / JAM</th>
                          <th style="width: 60px" class="text-center no-print">AKSI</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(p, pi) in m.pekerja" :key="p.id">
                          <td class="text-center text-grey-5 text-weight-bold font-mono">
                            {{ pi + 1 }}
                          </td>
                          <td class="text-weight-bold text-blue-grey-9 uppercase">{{ p.nama }}</td>
                          <td class="text-center">
                            <q-badge
                              color="brand-light"
                              text-color="brand-primary"
                              class="text-weight-bold q-px-sm q-py-xs rounded-6"
                            >
                              {{ p.jabatan || 'Tukang' }}
                            </q-badge>
                          </td>
                          <td class="text-right font-mono font-medium">
                            Rp {{ formatUang(p.upahHari) }}
                          </td>
                          <td class="text-center text-weight-bold text-amber-9 font-mono">
                            {{ (p.koef || 1.0).toFixed(2) }}x
                          </td>
                          <td class="text-right text-weight-bold text-brand-primary font-mono">
                            Rp {{ formatUang((p.upahHari || 0) * (p.koef || 1.0)) }}
                          </td>
                          <td class="text-right text-weight-bold text-amber-9 font-mono">
                            Rp {{ formatUang((p.upahLembur || 25000) * (p.koefLembur || 1.0)) }}
                            <div class="text-caption text-grey-5">Base: Rp {{ formatUang(p.upahLembur || 25000) }} ({{ (p.koefLembur || 1.0).toFixed(2) }}x)</div>
                          </td>
                          <td class="text-center no-print">
                            <q-btn
                              flat
                              dense
                              round
                              icon="close"
                              color="red-4"
                              size="sm"
                              @click="deletePekerja(m.id, p.id)"
                              :disable="!bisa.hapus"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </template>
  </q-page>
</template>

<script setup>
/*eslint-disable*/
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useQuasar, date } from 'quasar'
import { useRouter } from 'vue-router'
import { db, auth } from 'src/boot/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const $q = useQuasar()
const router = useRouter()

// ============================================================================
// PERMISSION GUARD — Integrasi Hak Akses (sama dengan halaman lain)
// ============================================================================
const aksesGranted = ref(false)
const aksesLoading = ref(true)

const checkAkses = async (uid) => {
  try {
    const q = query(collection(db, 'karyawan'), where('uid', '==', uid))
    const snap = await getDocs(q)
    if (snap.empty) {
      aksesGranted.value = false
      aksesLoading.value = false
      return
    }

    const karyawan = snap.docs[0].data()
    if (karyawan.is_super_admin === true) {
      aksesGranted.value = true
      aksesLoading.value = false
      return
    }

    const SUPER_ROLES = ['super admin', 'superadmin', 'direktur', 'owner']
    const jabatan = (karyawan.jabatan || '').toLowerCase().trim()
    const role = (karyawan.role || '').toLowerCase().trim()
    if (SUPER_ROLES.includes(jabatan) || SUPER_ROLES.includes(role)) {
      aksesGranted.value = true
      aksesLoading.value = false
      return
    }

    const permissions = karyawan.permissions_detail || []
    const modulAbsensi = permissions.find((m) => m.id === 'absensi')
    if (modulAbsensi && modulAbsensi.isActive) {
      const menuHarianLepas = modulAbsensi.menus?.find(
        (menu) =>
          menu.id === '_absensi_harian_lepas' || menu.id === '_absensi_admin_absensi-harian-lepas',
      )
      if (menuHarianLepas && menuHarianLepas.lihat === true) {
        aksesGranted.value = true
        aksesLoading.value = false
        return
      }
    }

    aksesGranted.value = false
    aksesLoading.value = false
  } catch (e) {
    console.error('Gagal memeriksa hak akses harian lepas:', e)
    aksesGranted.value = false
    aksesLoading.value = false
  }
}

const bisa = ref({ lihat: false, buat: false, ubah: false, hapus: false, approve: false })

const loadDetailPermission = async (uid) => {
  try {
    const q = query(collection(db, 'karyawan'), where('uid', '==', uid))
    const snap = await getDocs(q)
    if (snap.empty) return

    const karyawan = snap.docs[0].data()
    if (
      karyawan.is_super_admin === true ||
      ['super admin', 'superadmin', 'direktur', 'owner'].includes(
        (karyawan.jabatan || '').toLowerCase().trim(),
      )
    ) {
      bisa.value = { lihat: true, buat: true, ubah: true, hapus: true, approve: true }
      return
    }

    const permissions = karyawan.permissions_detail || []
    const modulAbsensi = permissions.find((m) => m.id === 'absensi')
    if (modulAbsensi) {
      const menu = modulAbsensi.menus?.find(
        (m) => m.id === '_absensi_harian_lepas' || m.id === '_absensi_admin_absensi-harian-lepas',
      )
      if (menu) {
        bisa.value = {
          lihat: menu.lihat || false,
          buat: menu.buat || false,
          ubah: menu.ubah || false,
          hapus: menu.hapus || false,
          approve: menu.approve || false,
        }
      }
    }
  } catch (e) {
    console.error('Gagal memuat detail permission harian lepas:', e)
  }
}

// ============================================================================
// INTEGRASI PROYEK MASTER KONSTRUKSI (REAL-TIME LIST)
// ============================================================================
const selectedProjectId = ref('')
const selectedProjectData = ref(null)
const proyekKonstruksiList = ref([])
const filterProyek = ref('')
let unsubProyek = null

const fetchProyekList = () => {
  const q = query(collection(db, 'proyek'), orderBy('createdAt', 'desc'))
  unsubProyek = onSnapshot(
    q,
    (snap) => {
      proyekKonstruksiList.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    },
    (err) => {
      console.error('Error penarikan master proyek:', err)
    },
  )
}

const filteredProyekList = computed(() => {
  if (!filterProyek.value) return proyekKonstruksiList.value
  const f = filterProyek.value.toLowerCase().trim()
  return proyekKonstruksiList.value.filter(
    (p) =>
      (p.nama && p.nama.toLowerCase().includes(f)) ||
      (p.konsumen && p.konsumen.toLowerCase().includes(f)) ||
      (p.alamat && p.alamat.toLowerCase().includes(f)),
  )
})

// Unsubscribe listeners saat berpindah proyek
let unsubSetup = null
let unsubMandors = null

const selectProject = async (proyek) => {
  $q.loading.show({ message: `Membuka Absensi Proyek ${proyek.nama}...` })

  selectedProjectId.value = proyek.id
  selectedProjectData.value = proyek
  activeTab.value = 'mandor' // Langsung buka tab Mandor & Pekerja

  // Bersihkan sisa listener proyek lain
  if (unsubSetup) unsubSetup()
  if (unsubMandors) unsubMandors()

  // 1. Ambil & Listen Setup Proyek Terisolasi (jika belum ada, buat baru otomatis)
  const setupRef = doc(db, 'harian_lepas_setup', proyek.id)
  unsubSetup = onSnapshot(setupRef, async (snap) => {
    if (snap.exists()) {
      projectSetup.value = snap.data()
      if (projectSetup.value.tglAbsen) {
        selectedDate.value = projectSetup.value.tglAbsen
      }
    } else {
      // Inisialisasi default dari properti proyek Konstruksi asli
      const defaultSetup = {
        nama: proyek.nama,
        kode: proyek.id.substring(0, 8).toUpperCase(),
        lokasi: proyek.alamat || '',
        mandorUtama: proyek.konsumen || 'INTERNAL PROJECT',
        mulai: date.formatDate(new Date(), 'YYYY-MM-DD'),
        selesai: '',
        jamKerja: 8,
        lembur: 25000,
        tglAbsen: date.formatDate(new Date(), 'YYYY-MM-DD'),
        projectId: proyek.id,
      }
      await setDoc(setupRef, defaultSetup)
      projectSetup.value = defaultSetup
    }
  })

  // 2. Listen Mandor Terisolasi proyek terpilih
  const qMandor = query(collection(db, 'harian_lepas_mandor'), where('projectId', '==', proyek.id))
  unsubMandors = onSnapshot(qMandor, (snap) => {
    mandors.value = snap.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }))
    syncPekerjaFormsStructure()
  })

  // 3. Tarik data absensi harian harian yang valid
  await loadAttendanceForDate(selectedDate.value)
  // 4. Tarik daftar SPK proyek ini untuk dropdown (tampilkan nama_kontrak saja)
  await fetchSpkOptions(proyek.id)
  $q.loading.hide()
}

const deselectProject = async () => {
  // Simpan otomatis saat menutup proyek penugasan
  await autoSaveAttendance()

  selectedProjectId.value = ''
  selectedProjectData.value = null

  if (unsubSetup) unsubSetup()
  if (unsubMandors) unsubMandors()

  mandors.value = []
  attendanceData.value = {}
  spkOptions.value = []
}

// --- State Navigasi ---
const mainActiveTab = ref('konstruksi')
const activeTab = ref('mandor')
const selectedDate = ref(date.formatDate(new Date(), 'YYYY-MM-DD'))

// --- Data Master Isolated Proyek ---
const projectSetup = ref({
  nama: '',
  kode: '',
  lokasi: '',
  mandorUtama: '',
  mulai: '',
  selesai: '',
  jamKerja: 8,
  lembur: 25000,
  tglAbsen: '',
  projectId: '',
})
const mandors = ref([])
const attendanceData = ref({}) // Format: { 'YYYY-MM-DD': { mandorId: { pekerjaId: { status, lembur, ket } } } }

// --- Dropdown Master Data Options ---
const spkOptions = ref([]) // SPK list untuk proyek aktif (hanya tampilkan nama_kontrak, bukan nomor_spk)

const fetchSpkOptions = async (projectId) => {
  spkOptions.value = []
  if (!projectId) return
  try {
    const q = query(collection(db, 'spk_customer'), where('projectId', '==', projectId))
    const snap = await getDocs(q)
    spkOptions.value = snap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        nama_kontrak: data.nama_kontrak || '(Tanpa Nama Kontrak)',
        groups: data.groups || [],
      }
    })
  } catch (e) {
    console.error('Gagal memuat daftar SPK:', e)
  }
}
const jabatanOptions = [
  'Tukang',
  'Kepala Tukang',
  'Pekerja / Laden',
  'Operator',
  'Helper',
  'Mandor Lapangan',
]
const currentOptions = ref([...jabatanOptions])

const filterJabatan = (val, update, mandorId) => {
  update(() => {
    const f = pekerjaForms.value[mandorId]
    if (f) {
      f.typedJabatan = val
    }
    if (val === '') {
      currentOptions.value = jabatanOptions
    } else {
      const needle = val.toLowerCase()
      currentOptions.value = jabatanOptions.filter((v) => v.toLowerCase().indexOf(needle) > -1)
    }
  })
}

const onJabatanBlur = (mandorId) => {
  setTimeout(() => {
    const f = pekerjaForms.value[mandorId]
    if (f && f.typedJabatan) {
      f.jabatan = f.typedJabatan
    }
  }, 100)
}

const onJabatanSelected = (val, mandorId) => {
  const f = pekerjaForms.value[mandorId]
  if (f) {
    f.typedJabatan = ''
  }
}
const MANDOR_COLORS = [
  '#1565c0', // brand-primary
  '#0d9488', // teal
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#4f46e5', // indigo
  '#0284c7', // sky
  '#ec4899', // pink
]

// --- Form Buffer Input State ---
const mandorForm = ref({ nama: '', spk: null, bidang: '', hp: '' })
const pekerjaForms = ref({})

const defaultBidangOptions = [
  'Struktur & Beton',
  'Pasangan & Dinding',
  'Atap',
  'Mekanikal',
  'Elektrikal',
  'Finishing',
  'Lansekap',
  'Umum / Helper',
  'Lainnya',
]

const bidangOptions = computed(() => {
  if (!mandorForm.value.spk) {
    return []
  }
  const selectedSpk = spkOptions.value.find((s) => s.id === mandorForm.value.spk)
  if (selectedSpk && selectedSpk.groups && selectedSpk.groups.length > 0) {
    const list = []
    const mainGroups = selectedSpk.groups.filter(
      (g) => g.title && g.title.toLowerCase().includes('pekerjaan utama'),
    )
    const targetGroups = mainGroups.length > 0 ? mainGroups : selectedSpk.groups

    targetGroups.forEach((g) => {
      if (g.items) {
        g.items.forEach((item) => {
          if (item.deskripsi && !item.is_header) {
            list.push(item.deskripsi.trim())
          }
        })
      }
    })
    if (list.length > 0) {
      return list
    }
  }
  return []
})

watch(
  () => mandorForm.value.spk,
  (newSpkId) => {
    if (newSpkId) {
      const selectedSpk = spkOptions.value.find((s) => s.id === newSpkId)
      if (selectedSpk && selectedSpk.groups && selectedSpk.groups.length > 0) {
        const list = []
        const mainGroups = selectedSpk.groups.filter(
          (g) => g.title && g.title.toLowerCase().includes('pekerjaan utama'),
        )
        const targetGroups = mainGroups.length > 0 ? mainGroups : selectedSpk.groups

        targetGroups.forEach((g) => {
          if (g.items) {
            g.items.forEach((item) => {
              if (item.deskripsi && !item.is_header) {
                list.push(item.deskripsi.trim())
              }
            })
          }
        })
        if (list.length > 0) {
          if (!list.includes(mandorForm.value.bidang)) {
            mandorForm.value.bidang = list[0]
          }
          return
        }
      }
    }
    mandorForm.value.bidang = ''
  },
)

// =====================================================================================
// DATA & STATE KHUSUS MODUL HARIAN LEPAS MANUFAKTUR
// =====================================================================================
const stasiunOptions = [
  'Assembly',
  'Fabrication',
  'Welding',
  'Quality Control',
  'Packing',
  'Logistics',
]
const manufakturForm = ref({
  nama: '',
  stasiun: 'Assembly',
  upahJam: 20000,
  jamKerja: 8,
  lembur: 0,
})
const manufakturPekerjaList = ref([
  {
    id: 'MFG-1',
    nama: 'ACHMAD FAUZI',
    stasiun: 'Assembly',
    upahJam: 22000,
    jamKerja: 8,
    lembur: 2,
    totalUpah: 220000,
  },
  {
    id: 'MFG-2',
    nama: 'SUTRISNO',
    stasiun: 'Quality Control',
    upahJam: 25000,
    jamKerja: 8,
    lembur: 0,
    totalUpah: 200000,
  },
])

const addManufakturPekerja = () => {
  if (!manufakturForm.value.nama) {
    $q.notify({ type: 'warning', message: 'Nama pekerja manufaktur wajib diisi!' })
    return
  }
  const baseUpah = manufakturForm.value.upahJam * manufakturForm.value.jamKerja
  const lemburUpah = manufakturForm.value.lembur * (manufakturForm.value.upahJam * 1.5)
  manufakturPekerjaList.value.push({
    id: 'MFG-' + Date.now(),
    nama: manufakturForm.value.nama.toUpperCase(),
    stasiun: manufakturForm.value.stasiun,
    upahJam: manufakturForm.value.upahJam,
    jamKerja: manufakturForm.value.jamKerja,
    lembur: manufakturForm.value.lembur,
    totalUpah: Math.round(baseUpah + lemburUpah),
  })
  manufakturForm.value.nama = ''
  $q.notify({ type: 'positive', message: 'Pekerja manufaktur berhasil ditambahkan!' })
}

const deleteManufakturPekerja = (id) => {
  manufakturPekerjaList.value = manufakturPekerjaList.value.filter((p) => p.id !== id)
  $q.notify({ type: 'info', message: 'Pekerja berhasil dihapus dari antrean.' })
}

const totalUpahManufaktur = computed(() => {
  return manufakturPekerjaList.value.reduce((sum, p) => sum + p.totalUpah, 0)
})

// --- Report/Rekap State ---
const reportGenerated = ref(false)
const rekapRange = ref({
  dari: date.formatDate(new Date(), 'YYYY-MM-DD'),
  sampai: date.formatDate(new Date(), 'YYYY-MM-DD'),
  mandorId: '',
})
const reportData = ref([])
const kpiSummary = ref({ totalPekerja: 0, totalHadir: 0, totalAlpha: 0, totalUpah: 0 })

// --- Computed Option Rekap ---
const rekapMandorOptions = computed(() => {
  const defaults = [{ label: 'Semua Kelompok Mandor', value: '' }]
  mandors.value.forEach((m) => {
    defaults.push({ label: m.nama.toUpperCase(), value: m.id })
  })
  return defaults
})

// =====================================================================================
// MANAJEMEN CORE DATA & SYNC CLOUD TERISOLASI
// =====================================================================================
const loadAttendanceForDate = async (dateStr) => {
  if (!dateStr || !selectedProjectId.value) return
  const idAbsen = `${selectedProjectId.value}_${dateStr}`
  try {
    const docSnap = await getDoc(doc(db, 'harian_lepas_absen', idAbsen))
    if (docSnap.exists()) {
      attendanceData.value[dateStr] = docSnap.data().absen || {}
    } else {
      attendanceData.value[dateStr] = {}
    }
  } catch (e) {
    console.error('Gagal memuat absensi:', e)
  }
}

watch(selectedDate, async (newVal) => {
  if (newVal && selectedProjectId.value) {
    await loadAttendanceForDate(newVal)
  }
})

// Auto-save data absensi saat berpindah tab atau tanggal aktif
const autoSaveAttendance = async () => {
  if (!selectedProjectId.value) return
  const targetDate = selectedDate.value
  const dayData = attendanceData.value[targetDate]
  if (!dayData || Object.keys(dayData).length === 0) return

  const idAbsen = `${selectedProjectId.value}_${targetDate}`
  try {
    await setDoc(doc(db, 'harian_lepas_absen', idAbsen), {
      tanggal: targetDate,
      projectId: selectedProjectId.value,
      absen: dayData,
      updated_at: serverTimestamp(),
    })
  } catch (e) {
    console.warn('[AutoSave] Gagal menyimpan absensi:', e)
  }
}

watch(activeTab, async (newTab, oldTab) => {
  if (oldTab === 'absen') {
    await autoSaveAttendance()
  }
})

const syncPekerjaFormsStructure = () => {
  mandors.value.forEach((m) => {
    if (!pekerjaForms.value[m.id]) {
      pekerjaForms.value[m.id] = {
        nama: '',
        jabatan: 'Tukang',
        typedJabatan: '',
        upahHari: 150000,
        koef: 1.0,
        upahLembur: projectSetup.value.lembur || 25000,
        koefLembur: 1.0
      }
    }
  })
}

// =====================================================================================
// LOGIKA AKSI TAB 1: SETUP (TERISOLASI)
// =====================================================================================
const saveSetup = async () => {
  if (!selectedProjectId.value) return
  if (projectSetup.value.tglAbsen) {
    selectedDate.value = projectSetup.value.tglAbsen
  }
  $q.loading.show({ message: 'Menyimpan pengaturan proyek...' })
  try {
    await setDoc(doc(db, 'harian_lepas_setup', selectedProjectId.value), projectSetup.value)
    $q.notify({ type: 'positive', message: 'Setup konfigurasi proyek berhasil diperbarui!' })
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Gagal menyimpan pengaturan: ' + e.message })
  } finally {
    $q.loading.hide()
  }
}

// =====================================================================================
// LOGIKA AKSI TAB 2: MANAJEMEN GRUP MANDOR & PEKERJA (TERISOLASI)
// =====================================================================================
const addMandor = async () => {
  if (!selectedProjectId.value) return
  if (!mandorForm.value.nama) {
    $q.notify({ type: 'warning', message: 'Nama mandor wajib diisi!' })
    return
  }

  // Cari detail SPK yang dipilih (hanya ambil nama_kontrak, TIDAK simpan nomor_spk)
  const spkTerpilih = mandorForm.value.spk
    ? spkOptions.value.find((s) => s.id === mandorForm.value.spk)
    : null

  const id = 'MND-' + Date.now()
  $q.loading.show({ message: 'Menambahkan mandor...' })
  try {
    await setDoc(doc(db, 'harian_lepas_mandor', id), {
      nama: mandorForm.value.nama.trim().toUpperCase(),
      bidang: mandorForm.value.bidang,
      hp: mandorForm.value.hp.trim(),
      spk_id: spkTerpilih?.id || '',
      spk_nama_kontrak: spkTerpilih?.nama_kontrak || '', // Hanya simpan nama kontrak, bukan nomor SPK
      pekerja: [],
      projectId: selectedProjectId.value, // ISOLASI PENANDA PROYEK
      created_at: serverTimestamp(),
    })

    mandorForm.value = { nama: '', spk: null, bidang: '', hp: '' }
    $q.notify({ type: 'positive', message: 'Kelompok mandor baru sukses didaftarkan!' })
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Gagal menambahkan mandor: ' + e.message })
  } finally {
    $q.loading.hide()
  }
}

const deleteMandor = (id) => {
  $q.dialog({
    title: 'Hapus Grup Mandor',
    message:
      'Tindakan ini akan menghapus mandor beserta seluruh data pekerja harian lepas di dalamnya. Lanjutkan?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    $q.loading.show({ message: 'Menghapus mandor...' })
    try {
      await deleteDoc(doc(db, 'harian_lepas_mandor', id))
      $q.notify({ type: 'info', message: 'Grup mandor berhasil dibersihkan permanen.' })
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Gagal menghapus mandor: ' + e.message })
    } finally {
      $q.loading.hide()
    }
  })
}

const addPekerja = async (mandorId) => {
  const f = pekerjaForms.value[mandorId]
  if (!f || !f.nama) {
    $q.notify({ type: 'warning', message: 'Nama lengkap pekerja lepas wajib diisi!' })
    return
  }

  const m = mandors.value.find((m) => m.id === mandorId)
  if (!m) return

  const pekerjaBaru = [
    ...(m.pekerja || []),
    {
      id: 'PKR-' + Date.now() + Math.floor(Math.random() * 100),
      nama: f.nama.trim().toUpperCase(),
      jabatan: f.jabatan,
      upahHari: parseInt(f.upahHari) || 0,
      koef: parseFloat(f.koef) || 1.0,
      upahLembur: parseInt(f.upahLembur) || 0,
      koefLembur: parseFloat(f.koefLembur) || 1.0,
    },
  ]

  $q.loading.show({ message: 'Menambahkan pekerja...' })
  try {
    await updateDoc(doc(db, 'harian_lepas_mandor', mandorId), { pekerja: pekerjaBaru })
    f.nama = ''
    f.typedJabatan = ''
    $q.notify({
      type: 'positive',
      message: 'Pekerja harian lepas berhasil dimasukkan ke dalam grup!',
    })
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Gagal menambahkan pekerja: ' + e.message })
  } finally {
    $q.loading.hide()
  }
}

const deletePekerja = (mandorId, pekerjaId) => {
  const m = mandors.value.find((m) => m.id === mandorId)
  if (!m) return

  $q.dialog({
    title: 'Hapus Pekerja',
    message: 'Apakah Anda yakin ingin menghapus pekerja ini dari daftar penugasan kelompok?',
    cancel: true,
  }).onOk(async () => {
    const pekerjaBaru = m.pekerja.filter((p) => p.id !== pekerjaId)
    $q.loading.show({ message: 'Menghapus pekerja...' })
    try {
      await updateDoc(doc(db, 'harian_lepas_mandor', mandorId), { pekerja: pekerjaBaru })
      $q.notify({ type: 'info', message: 'Pekerja berhasil dikeluarkan dari kelompok.' })
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Gagal mengeluarkan pekerja: ' + e.message })
    } finally {
      $q.loading.hide()
    }
  })
}

// =====================================================================================
// LOGIKA AKSI TAB 3: INPUT ABSENSI HARIAN REAKTIF MATRIKS (TERISOLASI)
// =====================================================================================
const onDateChange = async (val) => {
  await autoSaveAttendance()
  selectedDate.value = val
}

const getAttendanceState = (mandorId, pekerjaId) => {
  const tgl = selectedDate.value
  if (!attendanceData.value[tgl]) attendanceData.value[tgl] = {}
  if (!attendanceData.value[tgl][mandorId]) attendanceData.value[tgl][mandorId] = {}
  if (!attendanceData.value[tgl][mandorId][pekerjaId]) {
    attendanceData.value[tgl][mandorId][pekerjaId] = { status: 'hadir', lembur: 0, ket: '' }
  }
  return attendanceData.value[tgl][mandorId][pekerjaId]
}

const calculateRowDailyWage = (pekerja, state) => {
  const base = pekerja.upahHari || 0
  const k = pekerja.koef || 1.0
  let upahDinas = 0

  if (state.status === 'hadir') upahDinas = base * k
  else if (state.status === 'setengah') upahDinas = base * k * 0.5

  const rateLembur =
    pekerja.upahLembur !== undefined ? pekerja.upahLembur : projectSetup.value.lembur || 25000
  const kl = pekerja.koefLembur || 1.0
  const totalLembur = (parseFloat(state.lembur) || 0) * rateLembur * kl

  return Math.round(upahDinas + totalLembur)
}

const calculateMandorDailyTotal = (mandorId) => {
  const m = mandors.value.find((m) => m.id === mandorId)
  if (!m || !m.pekerja) return 0

  let total = 0
  m.pekerja.forEach((p) => {
    const st = getAttendanceState(mandorId, p.id)
    total += calculateRowDailyWage(p, st)
  })
  return total
}

const recalculateRowWage = (mandorId, pekerjaId) => {}

const saveAttendanceLog = async () => {
  if (!selectedProjectId.value) return
  const targetDate = selectedDate.value
  if (!attendanceData.value[targetDate]) {
    $q.notify({ type: 'warning', message: 'Tidak ada data absensi untuk disimpan!' })
    return
  }

  const idAbsen = `${selectedProjectId.value}_${targetDate}`
  $q.loading.show({ message: 'Menyimpan log absensi ke cloud...' })
  try {
    await setDoc(doc(db, 'harian_lepas_absen', idAbsen), {
      tanggal: targetDate,
      projectId: selectedProjectId.value,
      absen: attendanceData.value[targetDate],
      updated_at: serverTimestamp(),
    })
    $q.notify({
      type: 'positive',
      icon: 'cloud_done',
      message: `Seluruh log absensi tanggal ${targetDate} sukses disimpan!`,
    })
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Gagal menyimpan log absensi: ' + e.message })
  } finally {
    $q.loading.hide()
  }
}

const copyYesterdayAttendance = async () => {
  if (!selectedProjectId.value) return
  const targetDate = selectedDate.value
  const d = new Date(targetDate)
  d.setUTCDate(d.getUTCDate() - 1)
  const kemarinStr = d.toISOString().split('T')[0]

  const idAbsenKemarin = `${selectedProjectId.value}_${kemarinStr}`
  const idAbsenHariIni = `${selectedProjectId.value}_${targetDate}`

  $q.loading.show({ message: `Menyalin log dari ${kemarinStr}...` })
  try {
    const kemarinSnap = await getDoc(doc(db, 'harian_lepas_absen', idAbsenKemarin))
    if (!kemarinSnap.exists()) {
      $q.notify({
        type: 'negative',
        message: `Gagal menyalin: Data log hari kemarin (${kemarinStr}) tidak ditemukan di cloud!`,
      })
      return
    }

    const dataKemarin = kemarinSnap.data().absen || {}
    attendanceData.value[targetDate] = JSON.parse(JSON.stringify(dataKemarin))

    await setDoc(doc(db, 'harian_lepas_absen', idAbsenHariIni), {
      tanggal: targetDate,
      projectId: selectedProjectId.value,
      absen: attendanceData.value[targetDate],
      updated_at: serverTimestamp(),
    })

    $q.notify({
      type: 'positive',
      icon: 'file_copy',
      message: `Berhasil menduplikasi skema log kehadiran dari tanggal ${kemarinStr}!`,
    })
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Gagal menyalin log: ' + e.message })
  } finally {
    $q.loading.hide()
  }
}

// =====================================================================================
// LOGIKA AKSI TAB 4: COMPILING & RENDER REKAPITULASI (TERISOLASI DI MEMORI JAVASCRIPT)
// =====================================================================================
const generateReportData = async () => {
  if (!selectedProjectId.value) return
  const dari = rekapRange.value.dari
  const sampai = rekapRange.value.sampai

  if (!dari || !sampai) {
    $q.notify({ type: 'warning', message: 'Tentukan rentang batas tanggal rekap!' })
    return
  }

  $q.loading.show({ message: 'Mengunduh data rekap kehadiran dari cloud...' })
  try {
    if (activeTab.value === 'absen') {
      await autoSaveAttendance()
    }

    // Sesuai Aturan Firestore Rule 2: Gunakan penarikan query sederhana berbasis projectId saja
    const q = query(
      collection(db, 'harian_lepas_absen'),
      where('projectId', '==', selectedProjectId.value),
    )
    const snap = await getDocs(q)

    // Siapkan list array tanggal range rekap
    const dateList = []
    let curTemp = new Date(dari)
    const endTemp = new Date(sampai)
    while (curTemp <= endTemp) {
      dateList.push(curTemp.toISOString().split('T')[0])
      curTemp.setUTCDate(curTemp.getUTCDate() + 1)
    }

    // Inisialisasi reset memori
    dateList.forEach((tglStr) => {
      if (!attendanceData.value[tglStr]) attendanceData.value[tglStr] = {}
    })

    // Filter secara instan tanggal range di memori JavaScript (Rule 2 Compliance)
    let docsFound = 0
    snap.forEach((docItem) => {
      const data = docItem.data()
      if (data.tanggal && data.absen && data.tanggal >= dari && data.tanggal <= sampai) {
        attendanceData.value[data.tanggal] = data.absen
        docsFound++
      }
    })

    if (docsFound === 0) {
      $q.notify({
        type: 'warning',
        icon: 'info',
        message: 'Tidak ditemukan log absensi di cloud pada periode ini.',
        timeout: 4000,
      })
    }

    const filteredMandors = rekapRange.value.mandorId
      ? mandors.value.filter((m) => m.id === rekapRange.value.mandorId)
      : mandors.value

    let totalHadirCount = 0
    let totalAlphaCount = 0
    let totalUpahAll = 0
    const computedReport = []

    filteredMandors.forEach((m) => {
      if (!m.pekerja || m.pekerja.length === 0) return

      const pekerjaSummaryRows = []
      let subtotalMandorUpah = 0
      let subHadir = 0,
        subSetengah = 0,
        subIzin = 0,
        subSakit = 0,
        subAlpha = 0,
        subLibur = 0,
        subLembur = 0

      m.pekerja.forEach((p) => {
        const pStats = {
          hadir: 0,
          setengah: 0,
          izin: 0,
          sakit: 0,
          alpha: 0,
          libur: 0,
          lemburJam: 0,
          upahTotal: 0,
        }

        dateList.forEach((tgl) => {
          const log = attendanceData.value[tgl]?.[m.id]?.[p.id]
          if (!log) return

          pStats[log.status]++
          pStats.lemburJam += parseFloat(log.lembur) || 0
          const wage = calculateRowDailyWage(p, log)
          pStats.upahTotal += wage

          if (log.status === 'hadir' || log.status === 'setengah') {
            totalHadirCount++
            if (log.status === 'hadir') subHadir++
            else subSetengah++
          }
          if (log.status === 'alpha') {
            totalAlphaCount++
            subAlpha++
          }
          if (log.status === 'izin') subIzin++
          if (log.status === 'sakit') subSakit++
          if (log.status === 'libur') subLibur++
        })

        subtotalMandorUpah += pStats.upahTotal
        subLembur += pStats.lemburJam
        totalUpahAll += pStats.upahTotal

        pekerjaSummaryRows.push({
          id: p.id,
          nama: p.nama,
          jabatan: p.jabatan || 'Tukang',
          ...pStats,
        })
      })

      computedReport.push({
        id: m.id,
        nama: m.nama,
        bidang: m.bidang || 'Umum / Helper',
        pekerja: pekerjaSummaryRows,
        subtotalUpah: subtotalMandorUpah,
        totalHadir: subHadir,
        totalSetengah: subSetengah,
        totalIzin: subIzin,
        totalSakit: subSakit,
        totalAlpha: subAlpha,
        totalLibur: subLibur,
        totalLembur: subLembur,
      })
    })

    kpiSummary.value = {
      totalPekerja: Object.keys(
        filteredMandors.reduce((acc, m) => {
          m.pekerja?.forEach((p) => (acc[p.id] = true))
          return acc
        }, {}),
      ).length,
      totalHadir: totalHadirCount,
      totalAlpha: totalAlphaCount,
      totalUpah: totalUpahAll,
    }

    reportData.value = computedReport
    reportGenerated.value = true
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Gagal menyusun rekap: ' + e.message })
  } finally {
    $q.loading.hide()
  }
}

// =====================================================================================
// UTILITY HELPERS SYSTEM
// =====================================================================================
const getMandorColor = (index) => MANDOR_COLORS[index % MANDOR_COLORS.length]
const formatUang = (val) => (val ? Math.round(val).toLocaleString('id-ID') : '0')
const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : 'P')

const getNamaHari = (dateStr) => {
  if (!dateStr) return '-'
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const d = new Date(dateStr + 'T00:00:00')
  return days[d.getDay()]
}

const formatTanggalIndo = (dateStr) => {
  if (!dateStr) return 'Pilih Tanggal'
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Ags',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ]
  return `${parts[2]} ${months[parseInt(parts[1]) - 1]} ${parts[0]}`
}

const getStatusClass = (st) => {
  const map = {
    hadir: 's-hadir',
    setengah: 's-setengah',
    izin: 's-izin',
    sakit: 's-sakit',
    alpha: 's-alpha',
    libur: 's-libur',
  }
  return map[st] || 's-hadir'
}

const triggerPrint = () => {
  window.print()
}

// --- Lifecycle Hook ---
onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      router.replace('/login')
      return
    }
    await checkAkses(user.uid)
    await loadDetailPermission(user.uid)

    if (!aksesGranted.value) {
      $q.notify({
        type: 'negative',
        icon: 'lock',
        message: 'Izin ditolak. Dialihkan ke dashboard...',
        position: 'top',
        timeout: 3000,
      })
      setTimeout(() => router.replace('/'), 1500)
      return
    }

    // Jalankan feed daftar proyek master Konstruksi secara real-time
    fetchProyekList()
  })
})

onUnmounted(() => {
  if (unsubProyek) unsubProyek()
  if (unsubSetup) unsubSetup()
  if (unsubMandors) unsubMandors()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

/* ===== BRAND COLOR PALETTE ===== */
:root {
  --brand-primary: #1565c0;
  --brand-primary-dark: #0d47a1;
  --brand-primary-light: #e3f2fd;
  --brand-primary-mid: #90caf9;
  --brand-danger: #ad3640;
  --brand-danger-dark: #7a2028;
  --brand-danger-light: #f7e0e1;
  --page-bg: #f0fafa;
}

/* Quasar color overrides via CSS */
.bg-brand-primary {
  background-color: #1565c0 !important;
}
.bg-brand-light {
  background-color: #e3f2fd !important;
}
.bg-brand-danger {
  background-color: #ad3640 !important;
}
.text-brand-primary {
  color: #1565c0 !important;
}
.text-brand-teal {
  color: #1565c0 !important;
}
.text-brand-danger {
  color: #ad3640 !important;
}
.bg-page {
  background-color: #f0fafa !important;
}
.bg-page.q-page {
  padding: 24px !important;
}
@media (max-width: 599px) {
  .bg-page.q-page {
    padding: 16px !important;
  }
}

/* Override Quasar btn colors */
.q-btn[color='brand-primary'],
.bg-brand-primary.q-btn {
  background-color: #1565c0 !important;
  color: white !important;
}

.font-pro {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    sans-serif;
}
.font-mono {
  font-family: 'JetBrains Mono', monospace;
}
.uppercase {
  text-transform: uppercase;
}
.tracking-wide {
  letter-spacing: 0.5px;
}
.letter-spacing-tight {
  letter-spacing: -0.5px;
}
.border-bottom {
  border-bottom: 1px solid #f1f5f9;
}
.rounded-input :deep(.q-field__control) {
  border-radius: 12px;
}

/* SHADOWS & CARDS */
.bento-card {
  border-radius: 24px;
  border: 1px solid #f1f5f9;
}
.shadow-soft {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.04) !important;
}
.shadow-soft-primary {
  box-shadow: 0 8px 24px -8px rgba(21, 101, 192, 0.4) !important;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(21, 101, 192, 0.2);
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-16 {
  border-radius: 16px;
}
.rounded-12 {
  border-radius: 12px;
}
.rounded-8 {
  border-radius: 8px;
}
.rounded-6 {
  border-radius: 6px;
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

/* PREMIUM TABLE MATRIX STYLE */
.abs-tbl-wrap {
  width: 100%;
}
table.abs-tbl {
  width: 100%;
  border-collapse: collapse;
}
table.abs-tbl th {
  background-color: #1565c0 !important;
  color: #ffffff !important;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 14px 12px;
  border: none;
  border-bottom: 2px solid #0d47a1;
  text-align: left;
}
table.abs-tbl td {
  padding: 14px 12px;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  vertical-align: middle;
  color: #334155;
  font-size: 13px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
table.abs-tbl tr {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
table.abs-tbl tr:hover {
  background-color: rgba(21, 101, 192, 0.04);
}

.form-pekerja-box {
  background-color: rgba(227, 242, 253, 0.2) !important;
  border: 1px dashed rgba(21, 101, 192, 0.3) !important;
}

/* INTERACTIVE DROPDOWN STATUS BADGES */
.status-sel {
  appearance: none;
  -webkit-appearance: none;
  text-align: center;
  font-size: 12px;
  cursor: pointer;
  border-radius: 30px !important;
  padding: 8px 32px 8px 16px !important;
  outline: none;
  transition: all 0.2s ease;
  width: 150px;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px;
}
.s-hadir {
  background-color: #f0fdf4 !important;
  color: #16a34a !important;
  border: 1.5px solid #bbf7d0 !important;
}
.s-setengah {
  background-color: #f0fdfa !important;
  color: #0d9488 !important;
  border: 1.5px solid #99f6e4 !important;
}
.s-izin {
  background-color: #f0f9ff !important;
  color: #0284c7 !important;
  border: 1.5px solid #bae6fd !important;
}
.s-sakit {
  background-color: #fffbeb !important;
  color: #d97706 !important;
  border: 1.5px solid #fde68a !important;
}
.s-alpha {
  background-color: #fef2f2 !important;
  color: #dc2626 !important;
  border: 1.5px solid #fecaca !important;
}
.s-libur {
  background-color: #faf5ff !important;
  color: #7c3aed !important;
  border: 1.5px solid #e9d5ff !important;
}

/* REKAP BREAKDOWN GRID */
table.rekap-tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
table.rekap-tbl th {
  font-size: 11px;
  color: #475569;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 10px;
  border-bottom: 2px solid #e2e8f0;
  text-align: left;
}
table.rekap-tbl td {
  padding: 12px 10px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}
.rekap-foot td {
  background-color: #f8fafc;
  font-weight: 800;
  color: #1e293b;
  border-top: 2px solid #cbd5e1;
}

.indicator-bar {
  width: 6px;
  height: 32px;
  border-radius: 4px;
}
.kpi-box {
  background: rgba(21, 101, 192, 0.85) !important;
  backdrop-filter: blur(12px) saturate(190%);
  -webkit-backdrop-filter: blur(12px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 8px 32px 0 rgba(21, 101, 192, 0.25) !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 100%;
  border-radius: 36px !important;
}
.kpi-box:hover {
  transform: translateY(-4px);
  background: rgba(21, 101, 192, 0.95) !important;
  box-shadow: 0 12px 40px 0 rgba(21, 101, 192, 0.35) !important;
}
.kpi-box:active {
  transform: translateY(2px) scale(0.98);
  box-shadow: 0 4px 16px 0 rgba(21, 101, 192, 0.2) !important;
  transition: all 0.1s ease;
}

/* APPLE-STYLE ICONS */
.ios-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ios-icon-box.small {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.total-mandor {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 0 4px;
  font-size: 13px;
  color: #64748b;
}
.total-mandor strong {
  color: #d97706;
  font-size: 16px;
  font-family: monospace;
}

.decor-circle-1 {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
  top: -150px;
  right: -50px;
  border-radius: 50%;
  z-index: 0;
}

.animate-fade-in {
  animation: fadeInUp 0.4s ease-out;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* PREMIUM HOVER CARD EFFECT */
.hover-card-premium {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid #f1f5f9;
}
.hover-card-premium:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 36px -8px rgba(21, 101, 192, 0.15) !important;
  border-color: rgba(21, 101, 192, 0.3);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
}

.search-input :deep(.q-field__control) {
  border-radius: 30px;
}

/* ===== DEEP COMPONENT OVERRIDES ===== */
:deep(.q-btn[color='brand-primary']) {
  background: #1565c0 !important;
  color: white !important;
}
:deep(.q-btn--unelevated.q-btn[color='brand-primary']) {
  background: #1565c0 !important;
}
:deep(.q-avatar[color='brand-primary']) {
  background-color: #1565c0 !important;
  color: white !important;
}
:deep(.q-avatar[color='brand-light']) {
  background-color: #e3f2fd !important;
  color: #0d47a1 !important;
}
:deep(.q-btn[color='brand-danger']) {
  color: #ad3640 !important;
}
:deep(.q-btn--unelevated.q-btn[color='brand-danger']) {
  background: #ad3640 !important;
  color: white !important;
}
:deep(.q-btn--flat[color='brand-danger']) {
  color: #ad3640 !important;
}
:deep(.q-btn--flat[color='brand-primary']) {
  color: #1565c0 !important;
}
:deep(.q-icon[color='brand-primary']),
:deep(.q-field__prepend .q-icon) {
  color: #1565c0 !important;
}
:deep(.q-field--focused .q-field__control) {
  border-color: #1565c0 !important;
}
:deep(.q-field--focused .q-field__label) {
  color: #1565c0 !important;
}

/* ===== RESPONSIVE SPACING & PADDING ===== */
.detail-header-row {
  margin-bottom: 16px;
}
.detail-header-col {
  margin-bottom: 12px;
}
.mandor-header-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (min-width: 600px) {
  .detail-header-row {
    margin-bottom: 40px;
  }
  .detail-header-col {
    margin-bottom: 0;
  }
}

/* PRINT MEDIA FRIENDLY RE-STYLING */
@media print {
  .no-print,
  .q-header,
  .q-drawer,
  .q-btn,
  q-tabs {
    display: none !important;
  }
  body,
  .q-page,
  .premium-container {
    background: #fff !important;
    color: #000 !important;
    padding: 0 !important;
    margin: 0 !important;
    max-width: 100% !important;
  }
  .bento-card,
  .mandor-container,
  .card {
    border: 1px solid #94a3b8 !important;
    box-shadow: none !important;
    background: #fff !important;
    margin-bottom: 20px !important;
    page-break-inside: avoid;
  }
  .bg-slate-50 {
    background-color: #f1f5f9 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  table.abs-tbl th,
  table.rekap-tbl th {
    background-color: #f1f5f9 !important;
    color: #000 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .status-sel {
    border: none !important;
    background: transparent !important;
    color: #000 !important;
    font-weight: bold !important;
    padding: 0 !important;
    appearance: normal;
    -webkit-appearance: normal;
  }
  .tech-progress-track {
    display: none !important;
  }
}

.border-subtle {
  border-color: #f1f5f9 !important;
}

.legend-badge {
  font-size: 10px !important;
}
@media (min-width: 400px) {
  .legend-badge {
    font-size: 11px !important;
  }
}
@media (min-width: 600px) {
  .legend-badge {
    font-size: 12px !important;
  }
}

.kpi-val {
  font-size: 1.25rem;
  line-height: 1.5rem;
}
@media (min-width: 400px) {
  .kpi-val {
    font-size: 1.5rem;
    line-height: 1.8rem;
  }
}
@media (min-width: 600px) {
  .kpi-val {
    font-size: 1.95rem;
    line-height: 2.2rem;
  }
}

@media (max-width: 599px) {
  .mobile-action-buttons {
    display: flex !important;
    width: 100% !important;
    gap: 8px !important;
  }
  .mobile-btn {
    flex: 1 1 0% !important;
    font-size: 11px !important;
    padding: 8px 10px !important;
    min-height: 40px;
  }
  .mobile-print-btn {
    flex: 0 0 auto !important;
    min-height: 40px;
  }
}

.text-wrap {
  white-space: normal !important;
  word-break: break-word !important;
}

.premium-container {
  max-width: 1200px;
  width: 100%;
}
</style>
