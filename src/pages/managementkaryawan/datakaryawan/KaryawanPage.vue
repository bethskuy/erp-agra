<template>
  <q-page class="karyawan-page font-pro">
    <!-- =====================================================================================
         VIEW 1: DAFTAR KARYAWAN (LIST VIEW)
         ===================================================================================== -->
    <template v-if="currentView === 'list'">
      <!-- HEADER DATABASE -->
      <div class="row items-center justify-between q-mb-md q-mb-md-lg no-print animate-fade">
        <div class="col-12 col-md-auto q-mb-md q-mb-md-none">
          <div class="text-h4 text-weight-bolder text-pink-7 font-pro">
            Database Karyawan 🧸
          </div>
          <div class="text-caption text-md-subtitle2 text-pink-5">
            Manajemen data, berkas legalitas, dan profil biometrik karyawan AGRA
          </div>
        </div>

        <div class="col-12 col-md-auto row q-gutter-sm no-wrap-md">
          <!-- Tombol Export -->
          <q-btn-dropdown
            outline
            color="pink-6"
            label="Export Master"
            icon="download"
            class="col col-md-auto cute-btn-main font-pro"
          >
            <q-list>
              <q-item clickable v-ripple @click="exportToExcel">
                <q-item-section avatar>
                  <q-icon name="description" color="green-8" />
                </q-item-section>
                <q-item-section class="text-weight-bold text-pink-7">Excel (.xlsx)</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="exportToPDF">
                <q-item-section avatar>
                  <q-icon name="picture_as_pdf" color="red-8" />
                </q-item-section>
                <q-item-section class="text-weight-bold text-pink-7">PDF (.pdf)</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn
            color="pink-6"
            label="Tambah Karyawan 🧸"
            icon="add"
            @click="openDialog"
            unelevated
            class="col col-md-auto cute-btn-pink text-weight-bold font-pro"
          />
        </div>
      </div>

      <!-- FILTER & SEARCH AREA -->
      <q-card flat class="cute-search-card q-mb-md no-print animate-fade font-pro">
        <q-card-section class="q-py-sm">
          <div class="row items-center q-col-gutter-sm q-col-gutter-md-md">
            <div class="col-12 col-md-5">
              <q-input
                v-model="filter"
                outlined
                dense
                rounded
                placeholder="Cari NIK, Nama, atau Jabatan..."
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="pink-6" />
                </template>
                <template v-slot:append v-if="filter">
                  <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </div>
            <q-space class="gt-sm" />
            <div class="col-12 col-md-auto text-center text-md-right text-caption text-pink-5 text-weight-bold">
              Total:
              <span class="text-weight-bold text-pink-7 font-pro" style="font-size: 15px;">{{ karyawanList.length }}</span> Karyawan
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- TABLE LIST KARYAWAN -->
      <div class="mac-card q-mb-lg no-print animate-fade-up">
        <div class="mac-header">
          <div class="dots-row">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <div class="mac-title">📂 DATABASE KARYAWAN 📂</div>
        </div>
        <q-table
          :rows="karyawanList"
          :columns="columns"
          row-key="id"
          flat
          :filter="filter"
          :loading="loading"
          binary-state-sort
          class="karyawan-table"
          :pagination="{ rowsPerPage: 10 }"
        >
          <!-- Custom Header -->
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-blue-grey-10 text-white">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bold uppercase font-11 tracking-wider text-left"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <!-- Row Desktop -->
          <template v-slot:body="props">
            <q-tr
              :props="props"
              class="hover-bg transition-all cursor-pointer"
              @click="viewDetail(props.row)"
            >
              <q-td key="nik" :props="props" class="text-weight-medium text-primary">
                {{ props.row.nik }}
              </q-td>
              <q-td key="nama" :props="props" class="text-weight-bold uppercase text-slate-800">
                {{ props.row.nama }}
              </q-td>
              <q-td key="jabatan" :props="props">
                <div class="row items-center q-gutter-xs">
                  <q-badge
                    color="blue-1"
                    text-color="blue-grey-10"
                    class="q-px-sm q-py-xs text-weight-bold shadow-sm border-subtle"
                  >
                    {{ props.row.jabatan }}
                  </q-badge>
                  <q-badge
                    v-if="props.row.divisi"
                    color="indigo-10"
                    text-color="white"
                    class="q-px-sm q-py-xs text-weight-bold shadow-sm"
                  >
                    {{ props.row.divisi }}
                  </q-badge>

                  <template v-if="Array.isArray(props.row.lokasi_dinas)">
                    <q-badge
                      v-for="loc in props.row.lokasi_dinas"
                      :key="loc"
                      color="teal-1"
                      text-color="teal-10"
                      class="q-px-sm q-py-xs text-weight-bold shadow-sm border-subtle q-mr-xs"
                    >
                      <q-icon name="place" size="10px" class="q-mr-xs" />
                      {{ loc }}
                    </q-badge>
                  </template>
                  <template v-else-if="props.row.lokasi_dinas">
                    <q-badge
                      color="teal-1"
                      text-color="teal-10"
                      class="q-px-sm q-py-xs text-weight-bold shadow-sm border-subtle"
                    >
                      <q-icon name="place" size="10px" class="q-mr-xs" />
                      {{ props.row.lokasi_dinas }}
                    </q-badge>
                  </template>

                  <!-- REINSTATED: Badge Status Bypass AI di Tabel Grid Utama -->
                  <q-badge
                    v-if="props.row.is_face_recognition_mandatory === false"
                    color="deep-orange-1"
                    text-color="deep-orange-9"
                    class="q-px-sm q-py-xs text-weight-bold shadow-sm border-subtle"
                  >
                    <q-icon name="no_photography" size="10px" class="q-mr-xs" /> BYPASS AI
                  </q-badge>
                </div>
              </q-td>

              <q-td key="actions" :props="props" auto-width @click.stop>
                <q-btn
                  flat
                  round
                  color="blue-8"
                  icon="edit"
                  size="sm"
                  @click="editKaryawan(props.row)"
                />
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="deleteKaryawan(props.row)"
                />
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-xl text-grey-6">
              <q-icon name="sentiment_dissatisfied" size="48px" class="q-mr-sm" />
              <div class="text-h6">Data tidak ditemukan</div>
            </div>
          </template>
        </q-table>
      </div>
    </template>

    <!-- =====================================================================================
         VIEW 2: DETAIL PROFIL LENGKAP & DIGITAL ID ACCESS BADGE (SINKRON MASTER DATA)
         ===================================================================================== -->
    <template v-else-if="currentView === 'detail'">
      <!-- TOP NAVIGATION BAR -->
      <div class="row items-center justify-between q-mb-lg no-print animate-fade">
        <q-btn
          flat
          icon="arrow_back"
          label="Kembali ke List"
          @click="currentView = 'list'"
          color="pink-6"
          class="cute-btn-main font-pro"
        />
        <q-space />
        <q-btn
          unelevated
          icon="print"
          label="Cetak ID Card Karyawan"
          class="cute-btn-pink font-pro q-px-lg"
          @click="cetakIdCardLokal"
        />
      </div>

      <div class="row q-col-gutter-lg justify-center animate-fade-up" v-if="selectedKaryawan">
        <!-- ID CARD PREVIEW (KOLOM KIRI: SINKRON FOTO PROFIL SOSIAL & LINGKARAN SEMPURNA) -->
        <div class="col-12 col-md-4 flex flex-center">
          <div class="column items-center full-width">
            <div
              class="text-subtitle1 text-weight-bolder text-pink-7 q-mb-sm text-center uppercase tracking-wide font-pro"
            >
              Access Badge Resmi Perusahaan
            </div>

            <div id="digital-id-card-badge" class="id-card-container shadow-24 relative-position">
              <div class="lanyard-hole"></div>

              <div class="id-card-header text-center column flex-center font-pro">
                <q-icon name="corporate_fare" size="28px" class="q-mb-xs" />
                <div class="id-company-title">PT AGRA ABHINAYA PERKASA</div>
                <div class="id-company-sub">Sistem Integrasi ERP Cloud</div>
              </div>

              <!-- Foto pada ID Card ditarik dari foto profil sosial (fotoUrl), serta didesain bulat sempurna (border-radius 50%) -->
              <div class="id-card-photo-box flex flex-center relative-position">
                <img
                  :src="
                    selectedKaryawan.fotoUrl ||
                    selectedKaryawan.foto_profil ||
                    'https://cdn.quasar.dev/img/avatar.png'
                  "
                  class="id-photo-element"
                />
                <div class="id-lock-tag font-pro">
                  <q-icon name="verified" size="10px" class="q-mr-xs" />BIOMETRIC VALID
                </div>
              </div>

              <div class="id-card-info text-center font-pro">
                <div class="id-employee-name uppercase">{{ selectedKaryawan.nama }}</div>
                <div class="id-employee-job">{{ selectedKaryawan.jabatan }}</div>
                <q-badge
                  color="pink-6"
                  text-color="white"
                  class="q-px-sm text-weight-bold text-overline font-mono q-mt-xs"
                >
                  {{ selectedKaryawan.divisi || 'STAFF' }}
                </q-badge>
              </div>

              <!-- QR Code Absensi Otomatis dari NIK -->
              <div class="id-card-qr-box text-center column flex-center">
                <div class="qr-white-wrapper shadow-soft">
                  <img
                    :src="
                      'https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=db2777&data=' +
                      selectedKaryawan.nik
                    "
                    class="qr-element"
                  />
                </div>
                <div class="id-employee-nik font-mono">{{ selectedKaryawan.nik }}</div>
              </div>

              <div class="id-card-footer text-center font-pro">KARTU IDENTITAS DIGITAL RESMI PERUSAHAAN</div>
            </div>
          </div>
        </div>

        <!-- DETAILS BIODATA TABS -->
        <div class="col-12 col-md-8">
          <div class="mac-card overflow-hidden">
            <div class="mac-header">
              <div class="dots-row">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <div class="mac-title">🧸 DATA DETAIL PROFIL 🧸</div>
            </div>
            <!-- Header Nama & Avatar Hero -->
            <div
              class="saas-gradient-primary relative-position flex items-end q-px-lg q-py-md text-white"
            >
              <div class="row items-center q-col-gutter-md">
                <div class="col-auto">
                  <q-avatar size="64px" class="border-white-5">
                    <img
                      :src="
                        selectedKaryawan.fotoUrl ||
                        selectedKaryawan.foto_profil ||
                        'https://cdn.quasar.dev/img/avatar.png'
                      "
                      alt="Avatar"
                    />
                  </q-avatar>
                </div>
                <div class="col">
                  <div class="text-h5 text-weight-bolder uppercase">
                    {{ selectedKaryawan.nama }}
                  </div>
                  <div class="text-caption text-blue-1 opacity-80">
                    {{ selectedKaryawan.jabatan }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab Selector Asli -->
            <q-tabs
              v-model="tab"
              dense
              class="text-pink-4 bg-pink-1/10 border-bottom-subtle"
              active-color="pink-7"
              indicator-color="pink-7"
              align="justify"
              narrow-indicator
            >
              <q-tab name="personal" label="Personal" class="text-weight-bold font-pro" />
              <q-tab name="kepegawaian" label="Kepegawaian" class="text-weight-bold" />
              <q-tab name="bpjs" label="BPJS & Rekening" class="text-weight-bold" />
              <q-tab name="dokumen" label="Dokumen" class="text-weight-bold" />
            </q-tabs>

            <!-- Tab Panels Asli -->
            <q-tab-panels v-model="tab" animated class="q-pa-md">
              <!-- PANEL 1: PERSONAL -->
              <q-tab-panel name="personal">
                <table class="detail-table">
                  <tbody>
                    <tr>
                      <td>Tempat, Tanggal Lahir</td>
                      <td class="text-weight-bold">
                        {{ selectedKaryawan.kotaLahir || '-' }},
                        {{ formatDateIndo(selectedKaryawan.tglLahir) }}
                      </td>
                    </tr>
                    <tr>
                      <td>No. Telepon / HP</td>
                      <td class="text-weight-bold text-primary">
                        {{ selectedKaryawan.hp || '-' }}
                      </td>
                    </tr>
                    <tr>
                      <td>Email Login</td>
                      <td class="text-weight-bold">{{ selectedKaryawan.email || '-' }}</td>
                    </tr>
                    <tr>
                      <td>Alamat Domisili</td>
                      <td class="text-slate-600 leading-relaxed">
                        {{ selectedKaryawan.alamat || 'Alamat belum diunggah.' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </q-tab-panel>

              <!-- PANEL 2: KEPEGAWAIAN -->
              <q-tab-panel name="kepegawaian">
                <table class="detail-table">
                  <tbody>
                    <tr>
                      <td>Tanggal Bergabung</td>
                      <td class="text-weight-bold">
                        {{ formatDateIndo(selectedKaryawan.tglMasuk) }}
                      </td>
                    </tr>
                    <tr>
                      <td>Posisi / Jabatan</td>
                      <td>
                        <q-badge
                          color="indigo-1"
                          text-color="indigo-10"
                          class="q-px-md q-py-xs text-weight-bold rounded-pill"
                        >
                          {{ selectedKaryawan.jabatan }}
                        </q-badge>
                      </td>
                    </tr>
                    <tr>
                      <td>Divisi Kerja</td>
                      <td class="text-weight-bold uppercase">
                        {{ selectedKaryawan.divisi || '-' }}
                      </td>
                    </tr>
                    <tr>
                      <td>Masa Kerja (Tenure)</td>
                      <td class="text-weight-bold text-teal-7">
                        {{ calculateTenorDays(selectedKaryawan.tglMasuk) }}
                      </td>
                    </tr>

                    <!-- REINSTATED: MENAMPILKAN STATUS BYPASS DI DETAIL PROFILE -->
                    <tr>
                      <td>Metode Presensi Wajah</td>
                      <td>
                        <q-badge
                          :color="
                            selectedKaryawan.is_face_recognition_mandatory !== false
                              ? 'teal-6'
                              : 'deep-orange-7'
                          "
                          class="q-px-md q-py-xs text-weight-bold rounded-6 shadow-sm"
                        >
                          <q-icon
                            :name="
                              selectedKaryawan.is_face_recognition_mandatory !== false
                                ? 'face'
                                : 'no_photography'
                            "
                            class="q-mr-xs"
                          />
                          {{
                            selectedKaryawan.is_face_recognition_mandatory !== false
                              ? 'WAJIB VERIFIKASI AI'
                              : 'BYPASS AI AKTIF (CUKUP FOTO BIASA)'
                          }}
                        </q-badge>
                      </td>
                    </tr>

                    <tr>
                      <td>Jam Dinas / Shift Kerja</td>
                      <td>
                        <template
                          v-if="
                            Array.isArray(selectedKaryawan.jadwal_harian) &&
                            selectedKaryawan.jadwal_harian.length
                          "
                        >
                          <div class="q-gutter-y-xs">
                            <div
                              v-for="j in selectedKaryawan.jadwal_harian"
                              :key="j.hari"
                              class="row items-center q-gutter-xs"
                            >
                              <q-badge
                                :color="j.aktif ? 'orange-1' : 'grey-2'"
                                :text-color="j.aktif ? 'orange-9' : 'grey-5'"
                                class="q-px-sm q-py-xs text-weight-bold"
                                style="min-width: 52px; font-size: 11px"
                                >{{ j.hari }}</q-badge
                              >
                              <span
                                v-if="j.aktif"
                                class="text-weight-bold text-blue-grey-8"
                                style="font-size: 12px"
                              >
                                <q-icon
                                  name="schedule"
                                  size="12px"
                                  class="q-mr-xs text-orange-7"
                                />{{ j.jam_masuk }} – {{ j.jam_pulang }}
                              </span>
                              <span v-else class="text-grey-5 text-caption">Libur</span>
                            </div>
                          </div>
                        </template>
                        <template v-else>
                          <q-badge
                            color="orange-1"
                            text-color="orange-9"
                            class="q-px-md q-py-xs text-weight-bolder rounded-6"
                          >
                            <q-icon name="schedule" size="14px" class="q-mr-xs" />{{
                              selectedKaryawan.jam_masuk || '08:00'
                            }}
                            - {{ selectedKaryawan.jam_pulang || '17:00' }}
                          </q-badge>
                        </template>
                      </td>
                    </tr>
                    <tr>
                      <td>Lokasi Dinas Penugasan</td>
                      <td>
                        <div class="row q-gutter-xs">
                          <template v-if="Array.isArray(selectedKaryawan.lokasi_dinas)">
                            <q-badge
                              color="teal-1"
                              text-color="teal-9"
                              class="q-px-md q-py-xs text-weight-bolder rounded-6"
                              v-for="loc in selectedKaryawan.lokasi_dinas"
                              :key="loc"
                            >
                              <q-icon name="place" size="14px" class="q-mr-xs" />{{ loc }}
                            </q-badge>
                            <span
                              v-if="selectedKaryawan.lokasi_dinas.length === 0"
                              class="text-grey-6"
                              >Belum Ditugaskan</span
                            >
                          </template>
                          <template v-else-if="selectedKaryawan.lokasi_dinas">
                            <q-badge
                              color="teal-1"
                              text-color="teal-9"
                              class="q-px-md q-py-xs text-weight-bolder rounded-6"
                            >
                              <q-icon name="place" size="14px" class="q-mr-xs" />{{
                                selectedKaryawan.lokasi_dinas
                              }}
                            </q-badge>
                          </template>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>Manajemen Shift Dinas</td>
                      <td>
                        <q-btn
                          unelevated
                          color="primary"
                          icon="edit_calendar"
                          label="ATUR SHIFT & LOKASI"
                          size="sm"
                          class="rounded-8 text-weight-bold q-px-md"
                          @click="openShiftDialog(selectedKaryawan)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </q-tab-panel>

              <!-- PANEL 3: BPJS & REKENING -->
              <q-tab-panel name="bpjs">
                <table class="detail-table">
                  <tbody>
                    <tr>
                      <td>BPJS Kesehatan</td>
                      <td class="text-weight-bold font-mono">
                        {{ selectedKaryawan.bpjs_kesehatan || 'Belum Terdaftar' }}
                      </td>
                    </tr>
                    <tr>
                      <td>BPJS Ketenagakerjaan</td>
                      <td class="text-weight-bold font-mono">
                        {{ selectedKaryawan.bpjs_ketenagakerjaan || 'Belum Terdaftar' }}
                      </td>
                    </tr>
                    <tr>
                      <td>Nama Bank</td>
                      <td class="text-weight-bold uppercase text-primary">
                        {{ selectedKaryawan.nama_bank || '-' }}
                      </td>
                    </tr>
                    <tr>
                      <td>Nomor Rekening</td>
                      <td class="text-weight-bold font-mono text-h6 text-indigo-10">
                        {{ selectedKaryawan.no_rekening || '-' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </q-tab-panel>

              <!-- PANEL 4: DOKUMEN -->
              <q-tab-panel name="dokumen">
                <q-list separator class="bg-white">
                  <q-item
                    v-for="(docItem, i) in selectedKaryawan.docs"
                    :key="i"
                    clickable
                    v-ripple
                    @click="openLink(docItem.url)"
                    class="q-py-md saas-hover-row"
                  >
                    <q-item-section avatar>
                      <q-avatar
                        color="indigo-50"
                        text-color="primary"
                        icon="insert_drive_file"
                        size="sm"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold text-slate-800 text-subtitle2">{{
                        docItem.name || 'Dokumen ' + (i + 1)
                      }}</q-item-label>
                      <q-item-label caption class="font-10 text-slate-400"
                        >Klik untuk melihat berkas lampiran resmi</q-item-label
                      >
                    </q-item-section>
                    <q-item-section side
                      ><q-icon name="open_in_new" color="grey-6" size="xs"
                    /></q-item-section>
                  </q-item>
                </q-list>
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
      </div>
      <div class="q-py-md"></div>
    </template>

    <!-- =====================================================================================
         VIEW 3: FORM REGISTRASI / EDIT (DENGAN INTEGRASI SHIFT DINAMIS)
         ===================================================================================== -->
    <template v-else-if="currentView === 'form'">
      <div class="row items-center justify-between q-mb-xl animate-fade">
        <div class="row items-center no-wrap">
          <q-btn
            flat
            round
            icon="arrow_back"
            @click="currentView = 'list'"
            class="q-mr-md cute-btn-main"
          />
          <div>
            <div
              class="text-overline text-pink-4 text-bold tracking-widest q-mb-xs leading-none font-pro"
            >
              DATABASE KARYAWAN
            </div>
            <div class="text-h4 text-weight-bolder text-pink-7 leading-tight uppercase font-pro">
              {{ form.id ? 'Perbarui Data Karyawan' : 'Registrasi Baru 🧸' }}
            </div>
          </div>
        </div>
        <q-btn
          label="SIMPAN DATA 🧸"
          @click="saveKaryawan"
          unelevated
          class="cute-btn-pink q-px-xl q-py-sm text-weight-bold"
          :loading="submitting"
        />
      </div>

      <div class="row justify-center animate-fade-up">
        <div class="col-12 col-lg-10">
          <div class="row q-col-gutter-lg">
            <!-- INPUT KOLOM KIRI (7/12) -->
            <div class="col-12 col-md-7">
              <!-- CARD 1: INFORMASI PERSONAL -->
              <q-card flat class="cute-form-card q-pa-lg q-mb-lg">
                <div class="row items-center q-mb-lg border-bottom-subtle q-pb-md">
                  <q-avatar
                    size="36px"
                    color="blue-1"
                    text-color="indigo-10"
                    icon="person"
                    class="q-mr-sm rounded-8 shadow-sm"
                  />
                  <div>
                    <div
                      class="text-subtitle1 text-weight-bold text-slate-800 leading-none q-mb-xs"
                    >
                      Informasi Personal
                    </div>
                    <div class="text-caption text-grey-6 leading-none">
                      Biodata dasar, kontak, dan jabatan karyawan
                    </div>
                  </div>
                </div>

                <div class="row q-col-gutter-md">
                  <q-input
                    class="col-12"
                    outlined
                    v-model="form.nik"
                    label="NIK otomatis"
                    readonly
                    bg-color="grey-1"
                    dense
                  />
                  <q-input class="col-12" outlined v-model="form.nama" label="Nama Lengkap" dense />
                  <q-input
                    class="col-12 q-col-sm-6"
                    outlined
                    v-model="form.hp"
                    label="No Handphone"
                    dense
                  />
                  <q-select
                    class="col-12 col-sm-6"
                    outlined
                    v-model="form.jabatan"
                    :options="filteredJabatanOptions"
                    label="Jabatan"
                    emit-value
                    map-options
                    dense
                  />
                  <q-input
                    class="col-6"
                    outlined
                    v-model="form.kotaLahir"
                    label="Tempat Lahir"
                    dense
                  />
                  <q-input
                    class="col-6"
                    outlined
                    v-model="form.tglLahir"
                    type="date"
                    stack-label="Tgl Lahir"
                    label="Tgl Lahir"
                    dense
                  />
                  <q-input
                    class="col-12"
                    outlined
                    v-model="form.alamat"
                    type="textarea"
                    label="Alamat Lengkap Domisili"
                    autogrow
                    dense
                  />
                </div>
              </q-card>

              <!-- CARD 2: KEPEGAWAIAN & SHIFT DINAMIS -->
              <q-card flat class="cute-form-card q-pa-lg q-mb-lg">
                <div class="row items-center q-mb-lg border-bottom-subtle q-pb-md">
                  <q-avatar
                    size="36px"
                    color="teal-50"
                    text-color="teal-8"
                    icon="calendar_today"
                    class="q-mr-sm rounded-8 shadow-sm"
                  />
                  <div>
                    <div
                      class="text-subtitle1 text-weight-bold text-slate-800 leading-none q-mb-xs"
                    >
                      Mulai Kerja &amp; Shift Dinas
                    </div>
                    <div class="text-caption text-grey-6 leading-none">
                      Tanggal bergabung resmi dan jam kerja shift karyawan
                    </div>
                  </div>
                </div>
                <div class="row q-col-gutter-md">
                  <q-input
                    class="col-12 q-mb-xs"
                    outlined
                    v-model="form.tglMasuk"
                    type="date"
                    stack-label="Mulai Kerja"
                    label="Mulai Kerja"
                    dense
                  />
                  <div class="col-12 col-sm-6">
                    <div
                      class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-xs"
                      style="font-size: 11px"
                    >
                      Jam Masuk Shift *
                    </div>
                    <q-input
                      outlined
                      v-model="form.jam_masuk"
                      type="time"
                      dense
                      :rules="[(val) => !!val || 'Jam masuk wajib diisi']"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <div
                      class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-xs"
                      style="font-size: 11px"
                    >
                      Jam Pulang Shift *
                    </div>
                    <q-input
                      outlined
                      v-model="form.jam_pulang"
                      type="time"
                      dense
                      :rules="[(val) => !!val || 'Jam pulang wajib diisi']"
                    />
                  </div>
                  <div class="col-12">
                    <div
                      class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-xs"
                      style="font-size: 11px"
                    >
                      Lokasi Dinas Penugasan (Bisa Pilih Beberapa) *
                    </div>
                    <q-select
                      outlined
                      v-model="form.lokasi_dinas"
                      :options="lokasiOptions"
                      emit-value
                      map-options
                      multiple
                      use-chips
                      dense
                      placeholder="Pilih satu atau beberapa lokasi dinas GPS"
                      :rules="[
                        (val) => (val && val.length > 0) || 'Lokasi dinas penugasan wajib diisi',
                      ]"
                    >
                      <template v-slot:prepend
                        ><q-icon name="place" color="blue-grey-4"
                      /></template>
                    </q-select>
                  </div>
                </div>
              </q-card>

              <!-- CARD 3: BPJS & REKENING -->
              <q-card flat class="cute-form-card q-pa-lg q-mb-lg">
                <div class="row items-center q-mb-lg border-bottom-subtle q-pb-md">
                  <q-avatar
                    size="36px"
                    color="orange-50"
                    text-color="orange-9"
                    icon="account_balance_wallet"
                    class="q-mr-sm rounded-8 shadow-sm"
                  />
                  <div>
                    <div
                      class="text-subtitle1 text-weight-bold text-slate-800 leading-none q-mb-xs"
                    >
                      BPJS &amp; Rekening Bank
                    </div>
                    <div class="text-caption text-grey-6 leading-none">
                      Informasi jaminan sosial dan payroll transfer
                    </div>
                  </div>
                </div>
                <div class="row q-col-gutter-md">
                  <q-input
                    class="col-12 col-sm-6"
                    outlined
                    v-model="form.bpjs_kesehatan"
                    label="Nomor BPJS Kesehatan"
                    dense
                  />
                  <q-input
                    class="col-12 col-sm-6"
                    outlined
                    v-model="form.bpjs_ketenagakerjaan"
                    label="Nomor BPJS Ketenagakerjaan"
                    dense
                  />
                  <q-input
                    class="col-12 col-sm-6"
                    outlined
                    v-model="form.nama_bank"
                    label="Nama Bank Transfer (Cth: BCA, Mandiri)"
                    dense
                  />
                  <q-input
                    class="col-12 col-sm-6"
                    outlined
                    v-model="form.no_rekening"
                    label="Nomor Rekening Bank"
                    dense
                  />
                </div>
              </q-card>

              <!-- CARD 4: AKUN SISTEM -->
              <q-card flat class="cute-form-card q-pa-lg q-mb-lg">
                <div class="row items-center q-mb-lg border-bottom-subtle q-pb-md">
                  <q-avatar
                    size="36px"
                    color="blue-1"
                    text-color="indigo-10"
                    icon="vpn_key"
                    class="q-mr-sm rounded-8 shadow-sm"
                  />
                  <div>
                    <div
                      class="text-subtitle1 text-weight-bold text-slate-800 leading-none q-mb-xs"
                    >
                      Akun Sistem
                    </div>
                    <div class="text-caption text-grey-6 leading-none">
                      Kredensial login sistem ERP perusahaan
                    </div>
                  </div>
                </div>
                <div class="row q-col-gutter-md">
                  <q-input
                    class="col-12 col-sm-6"
                    outlined
                    v-model="form.email"
                    label="Email Login"
                    :readonly="!!form.id"
                    dense
                  />
                  <q-input
                    class="col-12 col-sm-6"
                    outlined
                    v-model="form.password"
                    label="Password"
                    type="password"
                    dense
                    :rules="[
                      (val) => {
                        if (isEditMode) {
                          return !val || val.length >= 6 || 'Password minimal 6 karakter'
                        } else {
                          if (!val) return 'Password wajib diisi'
                          return val.length >= 6 || 'Password minimal 6 karakter'
                        }
                      }
                    ]"
                  />
                </div>
              </q-card>
            </div>

            <!-- INPUT KOLOM KANAN (5/12) -->
            <div class="col-12 col-md-5">
              <q-card flat class="cute-form-card q-pa-lg q-mb-lg">
                <!-- Divisi -->
                <div class="row items-center q-mb-lg border-bottom-subtle q-pb-md">
                  <q-avatar
                    size="36px"
                    color="indigo-50"
                    text-color="indigo-10"
                    icon="business"
                    class="q-mr-sm rounded-8 shadow-sm"
                  />
                  <div>
                    <div
                      class="text-subtitle1 text-weight-bold text-slate-800 leading-none q-mb-xs"
                    >
                      Divisi
                    </div>
                    <div class="text-caption text-grey-6 leading-none">
                      Divisi operasional bisnis internal
                    </div>
                  </div>
                </div>
                <q-select
                  outlined
                  v-model="form.divisi"
                  :options="divOptions"
                  label="Pilih Divisi Kerja *"
                  dense
                  @update:model-value="onDivisiChange"
                  :rules="[(val) => !!val || 'Pilih divisi kerja']"
                />

                <!-- Foto Profil Biasa -->
                <div class="row items-center q-mb-md q-mt-md">
                  <q-avatar
                    size="36px"
                    color="teal-50"
                    text-color="teal-8"
                    icon="image"
                    class="q-mr-sm rounded-8 shadow-sm"
                  />
                  <div class="text-subtitle1 text-weight-bold text-slate-800">
                    Foto Profil Sosial
                  </div>
                </div>
                <q-file
                  outlined
                  v-model="fotoFile"
                  label="Pilih Foto Profil"
                  accept="image/*"
                  dense
                  class="q-mb-md"
                />

                <!-- Foto Registrasi Biometrik Absen -->
                <div class="row items-center q-mb-md q-mt-lg">
                  <q-avatar
                    size="36px"
                    color="orange-50"
                    text-color="orange-8"
                    icon="face"
                    class="q-mr-sm rounded-8 shadow-sm"
                  />
                  <div class="text-subtitle1 text-weight-bold text-slate-800">
                    Foto Registrasi Absen &amp; AI Setting
                  </div>
                </div>

                <!-- REINSTATED: SAKELAR INTEGRASI BYPASS FILTER AI ABSENSI PAK HAFIDZ -->
                <div
                  class="row items-center justify-between q-mb-md q-pa-sm rounded-12 bg-orange-50/40 border border-orange-200 animate-fade"
                >
                  <div class="col q-pr-sm">
                    <div class="text-subtitle2 text-weight-bold text-orange-9 leading-none q-mb-xs">
                      Wajib Validasi AI Wajah
                    </div>
                    <div class="text-caption text-grey-7" style="font-size: 11px; line-height: 1.3">
                      Jika dimatikan, buruh bebas absen foto biasa (Bypass Match Score AI). Solusi
                      cepat kendala device!
                    </div>
                  </div>
                  <q-toggle v-model="form.is_face_recognition_mandatory" color="orange-8" />
                </div>

                <div
                  v-if="form.foto_registrasi && !fotoRegistrasiFile"
                  class="text-center q-pa-md rounded-12 border-subtle bg-slate-50 q-mb-sm"
                >
                  <q-img
                    :src="form.foto_registrasi"
                    style="max-width: 130px; border-radius: 12px"
                    class="shadow-sm q-mb-xs"
                  />
                  <div class="text-caption text-weight-bold text-red-7 q-mb-xs">
                    <q-icon name="lock" class="q-mr-xs" /> SYSTEM LOCKED: DATABASE ACUAN AI
                  </div>
                  <div class="text-caption text-grey-6">
                    Foto terpasang. Upload baru di bawah untuk mengganti.
                  </div>
                </div>

                <div
                  v-if="fotoRegistrasiFile"
                  class="text-center q-pa-sm rounded-12 border-subtle bg-orange-1 q-mb-sm"
                >
                  <q-img
                    :src="fotoRegistrasiPreview"
                    style="max-width: 130px; border-radius: 12px"
                    class="shadow-sm q-mb-xs"
                  />
                  <div class="text-caption text-weight-bold text-orange-8">
                    <q-icon name="autorenew" class="q-mr-xs" /> Foto baru siap diupload
                  </div>
                </div>

                <q-file
                  outlined
                  v-model="fotoRegistrasiFile"
                  :label="
                    form.foto_registrasi
                      ? 'Ganti Foto Registrasi Wajah'
                      : 'Upload Foto Registrasi Wajah Resmi'
                  "
                  accept="image/*"
                  dense
                  class="q-mb-md"
                  :rules="[
                    (val) =>
                      !!(val || form.foto_registrasi) ||
                      'Foto registrasi wajah wajib diunggah untuk basis database AI absensi!',
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon
                      :name="form.foto_registrasi ? 'autorenew' : 'upload'"
                      color="orange-8"
                    />
                  </template>
                </q-file>

                <div class="row items-center q-mb-md q-mt-lg">
                  <q-avatar
                    size="36px"
                    color="purple-50"
                    text-color="purple-8"
                    icon="attach_file"
                    class="q-mr-sm rounded-8 shadow-sm"
                  />
                  <div class="text-subtitle1 text-weight-bold text-slate-800">
                    Arsip Berkas Pelengkap
                  </div>
                </div>
                <div
                  v-for="(item, index) in docList"
                  :key="index"
                  class="row q-col-gutter-xs q-mb-sm items-center"
                >
                  <q-input class="col-5" outlined v-model="item.name" label="Nama" dense />
                  <q-file class="col-5" outlined v-model="item.file" label="File" dense />
                  <div class="col-2 text-right">
                    <q-btn
                      color="negative"
                      icon="delete"
                      @click="docList.splice(index, 1)"
                      dense
                      flat
                      round
                      size="sm"
                    />
                  </div>
                </div>
                <q-btn
                  color="primary"
                  label="Tambah Dokumen"
                  icon="add_circle"
                  @click="docList.push({ name: '', file: null })"
                  outline
                  size="sm"
                  class="full-width q-mt-sm"
                />
              </q-card>
            </div>
          </div>
        </div>
      </div>
      <div class="q-py-xl"></div>
    </template>

    <template v-else-if="currentView === 'public-profile'">
      <div class="fixed-full bg-slate-100 flex flex-center q-pa-md z-max overflow-y-auto font-pro">
        <div
          class="absolute-top bg-white q-py-md q-px-lg shadow-sm flex items-center justify-between full-width no-print border-bottom-subtle"
        >
          <div class="row items-center q-gutter-sm">
            <q-icon name="verified_user" color="teal-7" size="sm" />
            <span class="text-subtitle2 text-weight-bold text-blue-grey-10"
              >PORTAL VERIFIKASI RESMI</span
            >
          </div>
          <div class="text-caption text-weight-bold text-indigo-10">PT AGRA ABHINAYA PERKASA</div>
        </div>

        <div v-if="loading" class="text-center">
          <q-spinner-oval color="primary" size="50px" />
          <div class="text-subtitle2 q-mt-md text-grey-7">
            Menghubungkan ke database terenkripsi AGRA...
          </div>
        </div>

        <div
          v-else-if="publicKaryawan"
          class="q-mt-xl text-center animate-fade-up"
          style="max-width: 450px; width: 100%"
        >
          <q-card flat bordered class="rounded-24 shadow-24 bg-white overflow-hidden border-subtle">
            <div class="bg-teal-50 q-py-md q-px-lg flex flex-center border-bottom-subtle">
              <div class="row items-center q-gutter-md text-teal-10">
                <q-icon name="check_circle" size="md" />
                <div class="text-left">
                  <div class="text-subtitle2 text-weight-bolder leading-none">
                    KARYAWAN TERVERIFIKASI
                  </div>
                  <div class="text-caption text-weight-medium">
                    Tercatat Aktif di Database Cloud ERP
                  </div>
                </div>
              </div>
            </div>

            <div class="q-pt-xl q-pb-md flex flex-center">
              <div class="profile-verified-photo-box shadow-md">
                <img
                  :src="publicKaryawan.fotoUrl || 'https://cdn.quasar.dev/img/avatar.png'"
                  class="profile-verified-img"
                />
              </div>
            </div>

            <q-card-section class="q-px-lg q-pt-none">
              <div class="text-h5 text-weight-bolder text-blue-grey-10 uppercase q-mb-xs">
                {{ publicKaryawan.nama }}
              </div>
              <div class="text-subtitle2 text-weight-bold text-indigo-10 q-mb-md">
                {{ publicKaryawan.jabatan }}
              </div>
              <q-separator inset class="q-my-md" />

              <div class="text-left q-gutter-y-sm">
                <div class="row items-center justify-between q-py-xs border-bottom-subtle">
                  <span class="text-caption text-grey-6 font-weight-bold"
                    >Nomor Induk Karyawan (NIK)</span
                  >
                  <span class="text-body2 text-weight-bold font-mono text-indigo-10">{{
                    publicKaryawan.nik
                  }}</span>
                </div>
                <div class="row items-center justify-between q-py-xs border-bottom-subtle">
                  <span class="text-caption text-grey-6 font-weight-bold">Divisi Bisnis</span>
                  <span class="text-body2 text-weight-bold text-blue-grey-9 uppercase">{{
                    publicKaryawan.divisi
                  }}</span>
                </div>
                <div class="row items-center justify-between q-py-xs border-bottom-subtle">
                  <span class="text-caption text-grey-6 font-weight-bold">Masa Kerja</span>
                  <span class="text-body2 text-weight-bold text-blue-grey-9">{{
                    formatDateIndo(publicKaryawan.tglMasuk)
                  }}</span>
                </div>
                <div class="row items-start justify-between q-py-xs border-bottom-subtle">
                  <span class="text-caption text-grey-6 font-weight-bold q-pt-xs"
                    >Lokasi Dinas Aktif</span
                  >
                  <div class="text-right">
                    <template v-if="Array.isArray(publicKaryawan.lokasi_dinas)">
                      <q-badge
                        v-for="loc in publicKaryawan.lokasi_dinas"
                        :key="loc"
                        color="teal-1"
                        text-color="teal-10"
                        class="q-px-sm q-py-xs text-weight-bold q-ml-xs q-mb-xs"
                      >
                        <q-icon name="place" size="10px" class="q-mr-xs" />{{ loc }}
                      </q-badge>
                    </template>
                  </div>
                </div>
              </div>
            </q-card-section>
            <div class="bg-blue-grey-1 q-py-md text-caption text-grey-6 text-center border-top">
              Sistem Informasi SDM Terintegrasi AGRA ERP<br /><span class="font-bold text-indigo-10"
                >Valid &amp; Tercatat Resmi</span
              >
            </div>
          </q-card>
        </div>
      </div>
    </template>

    <q-dialog v-model="dialogShift" persistent backdrop-filter="blur(5px)">
      <q-card
        style="
          width: 640px;
          max-width: 98vw;
          max-height: 92vh;
          display: flex;
          flex-direction: column;
        "
        class="cute-dialog-card overflow-hidden"
      >
        <q-card-section class="q-pa-none">
          <div class="mac-header row items-center justify-between no-wrap">
            <div class="dots-row col-auto">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <div class="mac-title col text-center text-weight-bold text-pink-7">🕒 SHIFT &amp; LOKASI 🕒</div>
            <q-btn icon="close" flat round dense v-close-popup color="pink-7" class="col-auto bg-pink-1" size="sm" />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg q-pt-md" style="overflow-y: auto; flex: 1 1 auto">
          <div class="q-gutter-y-md">
            <q-card flat bordered class="rounded-12 bg-orange-1 border-subtle q-pa-md">
              <div
                class="text-caption text-weight-bold text-orange-9 uppercase q-mb-sm"
                style="font-size: 11px; letter-spacing: 1px"
              >
                ⚡ Terapkan Cepat ke Beberapa Hari
              </div>
              <div class="row q-col-gutter-sm items-end">
                <div class="col-6 sm:col-3">
                  <div class="text-caption text-blue-grey-7 q-mb-xs">Dari Hari</div>
                  <q-select
                    outlined
                    v-model="applyRangeJam.dari"
                    :options="hariList.map((h, i) => ({ label: h, value: i }))"
                    emit-value
                    map-options
                    dense
                    bg-color="white"
                  />
                </div>
                <div class="col-6 sm:col-3">
                  <div class="text-caption text-blue-grey-7 q-mb-xs">Sampai Hari</div>
                  <q-select
                    outlined
                    v-model="applyRangeJam.sampai"
                    :options="hariList.map((h, i) => ({ label: h, value: i }))"
                    emit-value
                    map-options
                    dense
                    bg-color="white"
                  />
                </div>
                <div class="col-6 sm:col-2">
                  <div class="text-caption text-blue-grey-7 q-mb-xs">Jam Masuk</div>
                  <q-input
                    outlined
                    v-model="applyRangeJam.jam_masuk"
                    type="time"
                    dense
                    bg-color="white"
                  />
                </div>
                <div class="col-6 sm:col-2">
                  <div class="text-caption text-blue-grey-7 q-mb-xs">Jam Pulang</div>
                  <q-input
                    outlined
                    v-model="applyRangeJam.jam_pulang"
                    type="time"
                    dense
                    bg-color="white"
                  />
                </div>
                <div class="col-12 sm:col-2">
                  <q-btn
                    unelevated
                    color="orange-8"
                    label="Terapkan"
                    icon="bolt"
                    @click="terapkanRange"
                    class="full-width text-weight-bold rounded-8"
                    dense
                  />
                </div>
              </div>
            </q-card>

            <div>
              <div
                class="text-caption text-weight-bold text-blue-grey-8 uppercase q-mb-sm"
                style="font-size: 11px; letter-spacing: 1px"
              >
                Jadwal Harian (Senin – Sabtu)
              </div>
              <q-card flat bordered class="rounded-12 overflow-hidden border-subtle">
                <div
                  class="row bg-blue-grey-9 text-white q-px-md q-py-xs"
                  style="font-size: 11px; font-weight: 700; letter-spacing: 0.5px"
                >
                  <div class="col-1 text-center">AKTIF</div>
                  <div class="col-3 q-pl-sm">HARI</div>
                  <div class="col-4 text-center">JAM MASUK</div>
                  <div class="col-4 text-center">JAM PULANG</div>
                </div>
                <div
                  v-for="jadwal in shiftForm.jadwal"
                  :key="jadwal.hari"
                  class="row items-center q-px-md q-py-sm shift-row-item"
                  :class="jadwal.aktif ? 'bg-white' : 'bg-grey-1'"
                  style="border-bottom: 1px solid #f1f5f9"
                >
                  <div class="col-1 flex flex-center">
                    <q-toggle v-model="jadwal.aktif" color="primary" dense size="sm" />
                  </div>
                  <div class="col-3 q-pl-sm">
                    <span
                      class="text-weight-bold"
                      :class="jadwal.aktif ? 'text-blue-grey-9' : 'text-grey-5'"
                      style="font-size: 13px"
                      >{{ jadwal.hari }}</span
                    >
                    <q-badge
                      v-if="!jadwal.aktif"
                      color="grey-3"
                      text-color="grey-6"
                      class="q-ml-xs"
                      style="font-size: 9px"
                      >LIBUR</q-badge
                    >
                  </div>
                  <div class="col-4 q-px-xs">
                    <q-input
                      outlined
                      v-model="jadwal.jam_masuk"
                      type="time"
                      dense
                      :disable="!jadwal.aktif"
                      :bg-color="jadwal.aktif ? 'white' : 'grey-2'"
                      style="font-size: 13px"
                    />
                  </div>
                  <div class="col-4 q-px-xs">
                    <q-input
                      outlined
                      v-model="jadwal.jam_pulang"
                      type="time"
                      dense
                      :disable="!jadwal.aktif"
                      :bg-color="jadwal.aktif ? 'white' : 'grey-2'"
                      style="font-size: 13px"
                    />
                  </div>
                </div>
              </q-card>
            </div>

            <div>
              <div
                class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-xs"
                style="font-size: 11px; letter-spacing: 1px"
              >
                Lokasi Dinas Penugasan (Bisa Pilih Beberapa) *
              </div>
              <q-select
                outlined
                v-model="shiftForm.lokasi_dinas"
                :options="lokasiOptions"
                emit-value
                map-options
                multiple
                use-chips
                dense
                placeholder="Pilih lokasi proyek/kantor penempatan aktif"
                ><template v-slot:prepend><q-icon name="place" color="blue-grey-4" /></template
              ></q-select>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md border-top-dashed">
          <q-btn
            flat
            label="Batal"
            color="pink-6"
            v-close-popup
            class="cute-btn-main font-pro"
          />
          <q-btn
            unelevated
            label="SIMPAN PERUBAHAN ✨"
            @click="saveShiftSettings"
            class="cute-btn-pink font-pro"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
              Database Karyawan Resmi
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 4px">
              Diekspor pada: {{ new Date().toLocaleString('id-ID') }} | PT Agra Abhinaya Perkasa
            </div>
          </div>
        </div>
        <table class="pdf-export-table" style="width: 100%; border-collapse: collapse">
          <thead>
            <tr>
              <th style="width: 5%; text-align: center">NO</th>
              <th style="width: 15%; text-align: left">NIK</th>
              <th style="width: 25%; text-align: left">NAMA LENGKAP</th>
              <th style="width: 20%; text-align: left">JABATAN</th>
              <th style="width: 15%; text-align: left">DIVISI</th>
              <th style="width: 20%; text-align: left">EMAIL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in karyawanList" :key="idx">
              <td style="text-align: center; font-weight: bold">{{ idx + 1 }}</td>
              <td style="text-align: left; font-weight: bold">{{ row.nik || '-' }}</td>
              <td
                style="
                  text-align: left;
                  font-weight: bold;
                  color: #1a237e;
                  text-transform: uppercase;
                "
              >
                {{ row.nama || '-' }}
              </td>
              <td style="text-align: left">{{ row.jabatan || '-' }}</td>
              <td style="text-align: left; font-weight: bold">{{ row.divisi || '-' }}</td>
              <td style="text-align: left">{{ row.email || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db, auth, storage } from 'src/boot/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  onSnapshot,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

const currentView = ref('list')
const filter = ref('')
const selectedKaryawanId = ref('')
const isEditMode = ref(false)
const submitting = ref(false)
const loading = ref(true)
const tab = ref('personal')
const dialogShift = ref(false)

const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const defaultJadwalHarian = () =>
  hariList.map((hari) => ({
    hari,
    aktif: hari !== 'Sabtu',
    jam_masuk: '08:00',
    jam_pulang: '17:00',
  }))

const shiftForm = ref({ karyawanId: '', lokasi_dinas: [], jadwal: defaultJadwalHarian() })
const applyRangeJam = ref({ dari: 0, sampai: 4, jam_masuk: '08:00', jam_pulang: '17:00' })

const terapkanRange = () => {
  const dari = parseInt(applyRangeJam.value.dari)
  const sampai = parseInt(applyRangeJam.value.sampai)
  if (dari > sampai) {
    $q.notify({ type: 'warning', message: 'Hari "Dari" tidak boleh lebih besar dari "Sampai"' })
    return
  }
  for (let i = dari; i <= sampai; i++) {
    shiftForm.value.jadwal[i].jam_masuk = applyRangeJam.value.jam_masuk
    shiftForm.value.jadwal[i].jam_pulang = applyRangeJam.value.jam_pulang
    shiftForm.value.jadwal[i].aktif = true
  }
  $q.notify({
    type: 'positive',
    message: `Jam diterapkan ke ${hariList[dari]}–${hariList[sampai]}`,
  })
}

const lokasiOptions = ref([])
const karyawanList = ref([])
const jabatanOptions = ref([])
const docList = ref([{ name: '', file: null }])
const fotoFile = ref(null)
const fotoRegistrasiFile = ref(null)

const fotoRegistrasiPreview = computed(() => {
  if (!fotoRegistrasiFile.value) return null
  return URL.createObjectURL(fotoRegistrasiFile.value)
})

const divOptions = ['Konstruksi', 'Manufaktur']
const publicKaryawan = ref(null)

const selectedKaryawan = computed(() => {
  return karyawanList.value.find((k) => k.id === selectedKaryawanId.value) || null
})

// REINSTATED: is_face_recognition_mandatory default true
const formDefault = {
  id: null,
  nik: '',
  nama: '',
  jabatan: '',
  email: '',
  password: '',
  hp: '',
  kotaLahir: '',
  tglLahir: '',
  tglMasuk: '',
  alamat: '',
  divisi: '',
  bpjs_kesehatan: '',
  bpjs_ketenagakerjaan: '',
  no_rekening: '',
  nama_bank: '',
  akses: [],
  foto_registrasi: '',
  fotoUrl: '',
  jam_masuk: '08:00',
  jam_pulang: '17:00',
  lokasi_dinas: [],
  is_face_recognition_mandatory: true, // REVISI EMAS: Default wajib AI Face-API
}
const form = ref({ ...formDefault })

let unsubUser = null,
  unsubKaryawan = null,
  unsubJabatan = null,
  unsubLocations = null
const userData = ref(null)

const currentUserRole = computed(() => userData.value?.jabatan || authStore.user?.role || '')

const filteredJabatanOptions = computed(() => {
  const options = jabatanOptions.value || []
  const role = currentUserRole.value?.toLowerCase() || ''
  if (role.includes('super admin') || role.includes('superadmin')) return options
  return options.filter((opt) => {
    const label = opt.label?.toLowerCase() || ''
    return !label.includes('super admin') && !label.includes('superadmin')
  })
})

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const loadExternalLibraries = async () => {
  try {
    await Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'),
      loadScript(
        'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
      ),
    ])
    await loadScript(
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js',
    )
  } catch (err) {
    console.error('Lib Error:', err)
  }
}

const onDivisiChange = (val) => {
  form.value.divisi = val
  form.value.akses = val === 'Konstruksi' ? ['konstruksi'] : ['manufaktur']
}

const calculateTenorDays = (tglMasuk) => {
  if (!tglMasuk) return '-'
  try {
    const joiningDate = new Date(tglMasuk)
    const today = new Date()
    let years = today.getFullYear() - joiningDate.getFullYear()
    let months = today.getMonth() - joiningDate.getMonth()
    if (months < 0 || (months === 0 && today.getDate() < joiningDate.getDate())) {
      years--
      months += 12
    }
    return years > 0 ? `${years} Tahun ${months} Bulan` : `${months} Bulan`
  } catch {
    return '-'
  }
}

const viewDetail = (data) => {
  selectedKaryawanId.value = data.id
  currentView.value = 'detail'
  window.scrollTo(0, 0)
}

const editKaryawan = (data) => {
  isEditMode.value = true
  let initialLocs = data.lokasi_dinas || []
  if (typeof initialLocs === 'string') {
    initialLocs = initialLocs ? [initialLocs] : []
  }

  form.value = {
    ...data,
    password: '',
    jam_masuk: data.jam_masuk || '08:00',
    jam_pulang: data.jam_pulang || '17:00',
    lokasi_dinas: initialLocs,
    // REINSTATED: Parsing kondisi bypass jika data lama kosongan
    is_face_recognition_mandatory:
      data.is_face_recognition_mandatory !== undefined ? data.is_face_recognition_mandatory : true,
  }
  docList.value = data.docs ? [...data.docs] : [{ name: '', file: null }]
  fotoFile.value = null
  fotoRegistrasiFile.value = null
  currentView.value = 'form'
  window.scrollTo(0, 0)
}

const openShiftDialog = (karyawan) => {
  let initialLocs = karyawan.lokasi_dinas || []
  if (typeof initialLocs === 'string') {
    initialLocs = initialLocs ? [initialLocs] : []
  }

  let jadwalLoaded = defaultJadwalHarian()
  if (Array.isArray(karyawan.jadwal_harian) && karyawan.jadwal_harian.length === 6) {
    jadwalLoaded = karyawan.jadwal_harian
  } else if (karyawan.jam_masuk || karyawan.jam_pulang) {
    jadwalLoaded = jadwalLoaded.map((j) => ({
      ...j,
      jam_masuk: karyawan.jam_masuk || '08:00',
      jam_pulang: karyawan.jam_pulang || '17:00',
    }))
  }

  shiftForm.value = { karyawanId: karyawan.id, lokasi_dinas: initialLocs, jadwal: jadwalLoaded }
  applyRangeJam.value = { dari: 0, sampai: 4, jam_masuk: '08:00', jam_pulang: '17:00' }
  dialogShift.value = true
}

const saveShiftSettings = async () => {
  if (!shiftForm.value.lokasi_dinas || shiftForm.value.lokasi_dinas.length === 0) {
    $q.notify({ type: 'warning', message: 'Silakan tentukan Lokasi Dinas proyek aktif!' })
    return
  }
  const hariAktif = shiftForm.value.jadwal.filter((j) => j.aktif)
  if (hariAktif.length === 0) {
    $q.notify({ type: 'warning', message: 'Minimal satu hari kerja harus aktif!' })
    return
  }
  $q.loading.show({ message: 'Memproses perubahan dinas reaktif...' })
  try {
    const firstAktif = hariAktif[0]
    const userRef = doc(db, 'karyawan', shiftForm.value.karyawanId)
    await updateDoc(userRef, {
      jadwal_harian: shiftForm.value.jadwal,
      jam_masuk: firstAktif.jam_masuk,
      jam_pulang: firstAktif.jam_pulang,
      lokasi_dinas: shiftForm.value.lokasi_dinas,
    })
    dialogShift.value = false
    $q.notify({ type: 'positive', message: 'Dinas & Jadwal Kerja Karyawan Berbaru!' })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Gagal memperbarui: ' + error.message })
  } finally {
    $q.loading.hide()
  }
}

const openDialog = () => {
  isEditMode.value = false
  form.value = { ...formDefault, nik: 'KRY-' + Date.now().toString().slice(-6) }
  docList.value = [{ name: '', file: null }]
  fotoFile.value = null
  fotoRegistrasiFile.value = null
  currentView.value = 'form'
  window.scrollTo(0, 0)
}

const saveKaryawan = async () => {
  if (!form.value.nama || !form.value.divisi) {
    $q.notify({ type: 'warning', message: 'Nama dan divisi wajib diisi!' })
    return
  }
  if (!form.value.foto_registrasi && !fotoRegistrasiFile.value) {
    $q.notify({ type: 'warning', message: 'Foto Registrasi wajib diunggah untuk acuan AI!' })
    return
  }

  $q.loading.show({ message: 'Menyimpan data karyawan...' })
  submitting.value = true

  try {
    let fotoUrl = form.value.fotoUrl || null
    if (fotoFile.value) {
      const fRef = storageRef(storage, `karyawan/avatars/${Date.now()}_${fotoFile.value.name}`)
      await uploadBytes(fRef, fotoFile.value)
      fotoUrl = await getDownloadURL(fRef)
    }

    let fotoRegistrasiUrl = form.value.foto_registrasi || null
    if (fotoRegistrasiFile.value) {
      const regRef = storageRef(
        storage,
        `karyawan/registrasi/${Date.now()}_${fotoRegistrasiFile.value.name}`,
      )
      await uploadBytes(regRef, fotoRegistrasiFile.value)
      fotoRegistrasiUrl = await getDownloadURL(regRef)
    }

    const uploadedDocs = []
    for (const item of docList.value) {
      if (item.file) {
        const docRef = storageRef(storage, `karyawan/docs/${Date.now()}_${item.file.name}`)
        await uploadBytes(docRef, item.file)
        const docUrl = await getDownloadURL(docRef)
        uploadedDocs.push({ name: item.name || item.file.name, url: docUrl })
      } else if (item.url) {
        uploadedDocs.push(item)
      }
    }

    const payload = JSON.parse(JSON.stringify(form.value))
    payload.fotoUrl = fotoUrl
    payload.foto_registrasi = fotoRegistrasiUrl
    payload.docs = uploadedDocs
    payload.updatedAt = serverTimestamp()

    const docId = payload.id
    delete payload.id
    const pwd = payload.password
    delete payload.password

    if (docId) {
      if (pwd && pwd.trim() !== '') {
        payload.tempPassword = pwd
      }
      await updateDoc(doc(db, 'karyawan', docId), payload)
    } else {
      const cred = await createUserWithEmailAndPassword(auth, form.value.email, pwd)
      payload.uid = cred.user.uid
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'karyawan'), payload)
    }

    currentView.value = 'list'
    $q.notify({ type: 'positive', message: 'Data karyawan berhasil disimpan!' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message })
  } finally {
    $q.loading.hide()
    submitting.value = false
  }
}

const deleteKaryawan = (row) => {
  $q.dialog({
    title: '<span class="text-red text-weight-bold">Konfirmasi Hapus</span>',
    message: `Apakah Anda yakin ingin menghapus data karyawan <b>${row.nama}</b> secara permanen?`,
    html: true,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    $q.loading.show()
    try {
      await deleteDoc(doc(db, 'karyawan', row.id))
      $q.notify({ type: 'positive', message: 'Data karyawan berhasil dihapus!' })
    } catch {
      $q.notify({ type: 'negative', message: 'Gagal menghapus data.' })
    } finally {
      $q.loading.hide()
    }
  })
}

const cetakIdCardLokal = () => {
  const element = document.getElementById('digital-id-card-badge')
  if (!element) return
  const opt = {
    margin: [5, 5, 5, 5],
    filename: `ID_Card_AGRA_${selectedKaryawan.value.nama.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 1.0 },
    html2canvas: { scale: 3, useCORS: true, allowTaint: true },
    jsPDF: { unit: 'mm', format: [85, 140], orientation: 'portrait' },
  }
  $q.loading.show({ message: 'Mengolah ID Card Biometrik...' })
  window
    .html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => $q.loading.hide())
    .catch(() => $q.loading.hide())
}

const exportToExcel = () => {
  try {
    let tableHtml = '<html><head><meta charset="utf-8"></head><body>'
    tableHtml += '<h2>Database Karyawan Resmi</h2><table border="1">'
    tableHtml +=
      '<thead><tr><th>No</th><th>NIK</th><th>Nama Lengkap</th><th>Jabatan</th><th>Divisi</th><th>Email</th><th>Jam Masuk</th><th>Jam Pulang</th><th>Lokasi Dinas</th></tr></thead><tbody>'
    karyawanList.value.forEach((r, idx) => {
      let locsStr = Array.isArray(r.lokasi_dinas)
        ? r.lokasi_dinas.join(', ')
        : r.lokasi_dinas || 'Kantor Pusat'
      tableHtml += `<tr><td>${idx + 1}</td><td>${r.nik}</td><td>${r.nama}</td><td>${r.jabatan}</td><td>${r.divisi}</td><td>${r.email}</td><td>${r.jam_masuk || '08:00'}</td><td>${r.jam_pulang || '17:00'}</td><td>${locsStr}</td></tr>`
    })
    tableHtml += '</tbody></table></body></html>'
    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `Database_Karyawan.xls`
    link.click()
  } catch {
    $q.notify({ type: 'negative', message: 'Gagal export excel.' })
  }
}

const exportToPDF = () => {
  const element = document.getElementById('table-pdf-export')
  const opt = {
    margin: 10,
    filename: 'Master_Data_Karyawan.pdf',
    jsPDF: { orientation: 'landscape' },
  }
  $q.loading.show()
  window
    .html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => $q.loading.hide())
    .catch(() => $q.loading.hide())
}

const openLink = (url) => {
  if (url) window.open(url, '_blank')
}
const formatDateIndo = (d) =>
  d && d !== '-'
    ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-'

const checkPublicVerificationRoute = async () => {
  const searchStr =
    window.location.search ||
    (window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '')
  const urlParams = new URLSearchParams(searchStr)
  const publicId = urlParams.get('public_id')
  if (publicId) {
    currentView.value = 'public-profile'
    loading.value = true
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth)
      }
      const docRef = doc(db, 'karyawan', publicId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        publicKaryawan.value = { ...docSnap.data(), id: docSnap.id }
      } else {
        $q.notify({ type: 'negative', message: 'Data verifikasi karyawan tidak ditemukan.' })
      }
    } catch {
      $q.notify({ type: 'negative', message: 'Koneksi ke sistem database terhambat.' })
    } finally {
      loading.value = false
    }
  }
}

onMounted(async () => {
  await loadExternalLibraries()
  await checkPublicVerificationRoute()
  if (currentView.value !== 'public-profile') {
    if (authStore.user?.email) {
      unsubUser = onSnapshot(
        query(collection(db, 'karyawan'), where('email', '==', authStore.user.email)),
        (snap) => {
          if (!snap.empty) userData.value = snap.docs[0].data()
        },
      )
    }
    unsubKaryawan = onSnapshot(
      query(collection(db, 'karyawan')),
      (s) => {
        karyawanList.value = s.docs
          .map((d) => ({ ...d.data(), id: d.id }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        loading.value = false
      },
      () => {
        loading.value = false
      },
    )
    unsubJabatan = onSnapshot(query(collection(db, 'jabatan')), (s) => {
      jabatanOptions.value = s.docs.map((d) => ({
        label: d.data().namaJabatan,
        value: d.data().namaJabatan,
      }))
    })
    unsubLocations = onSnapshot(query(collection(db, 'lokasi_kantor')), (s) => {
      lokasiOptions.value = s.docs.map((d) => {
        const name = d.data().nama_lokasi || ''
        return { label: name.toUpperCase(), value: name }
      })
    })
  }
})

onUnmounted(() => {
  if (unsubUser) unsubUser()
  if (unsubKaryawan) unsubKaryawan()
  if (unsubJabatan) unsubJabatan()
  if (unsubLocations) unsubLocations()
})

const columns = [
  { name: 'nik', label: 'NIK', field: 'nik', align: 'left', sortable: true },
  { name: 'nama', label: 'NAMA KARYAWAN', field: 'nama', align: 'left', sortable: true },
  { name: 'jabatan', label: 'JABATAN / DIVISI', field: 'jabatan', align: 'left' },
  { name: 'actions', label: 'AKSI', field: 'id', align: 'right' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap');

.karyawan-page {
  padding: 16px;
  background-color: #ffe4e6; /* Cute pastel rose pink background */
  background-image: 
    radial-gradient(#ffd1dc 2px, transparent 2px), 
    radial-gradient(#ffd1dc 2px, transparent 2px);
  background-size: 32px 32px;
  background-position: 0 0, 16px 16px;
  position: relative;
  overflow: hidden;
}

@media (min-width: 600px) {
  .karyawan-page {
    padding: 24px;
  }
}

@media (min-width: 1200px) {
  .karyawan-page {
    padding: 32px 40px;
  }
}

.font-pro {
  font-family: 'Fredoka', sans-serif;
}

/* ==========================================
   CUTE SHADOWS, CARDS, BUBBLES
   ========================================== */
.cute-search-card {
  background: #ffffff;
  border: 2.5px solid #ffb7c5;
  border-radius: 20px;
  box-shadow: 0 6px 0px #fecdd3 !important;
}

.cute-form-card {
  background: #ffffff;
  border: 2.5px solid #ffb7c5;
  border-radius: 24px;
  box-shadow: 0 6px 0px #fecdd3 !important;
}

.cute-dialog-card {
  background: #ffffff;
  border: 3.5px solid #ffb7c5 !important;
  border-radius: 28px !important;
  box-shadow: 0 10px 0px #fecdd3 !important;
}

.border-top-dashed {
  border-top: 2px dashed #ffccd5;
}

/* ==========================================
   CUTE BUTTONS
   ========================================== */
.cute-btn-main {
  background-color: #fff1f2 !important;
  border: 2.5px solid #fda4af !important;
  border-radius: 50px !important;
  color: #db2777 !important;
  box-shadow: 0 4px 0px #fecdd3 !important;
  transition: all 0.2s ease;
  font-weight: 700;
}
.cute-btn-main:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0px #fecdd3 !important;
  background-color: #ffe4e6 !important;
}
.cute-btn-main:active {
  transform: translateY(1px);
  box-shadow: 0 2px 0px #fecdd3 !important;
}

.cute-btn-pink {
  background-color: #db2777 !important;
  border: 2.5px solid #be185d !important;
  border-radius: 50px !important;
  color: #ffffff !important;
  box-shadow: 0 4px 0px #fecdd3 !important;
  transition: all 0.2s ease;
  font-weight: 700;
}
.cute-btn-pink:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0px #fecdd3 !important;
  background-color: #ec4899 !important;
}
.cute-btn-pink:active {
  transform: translateY(1px);
  box-shadow: 0 2px 0px #fecdd3 !important;
}

/* ==========================================
   MAC WINDOW SHELL CARDS
   ========================================== */
.mac-card {
  background: #ffffff;
  border: 3px solid #ffb7c5;
  border-radius: 24px;
  box-shadow: 0 10px 0px #fecdd3, 0 16px 30px rgba(225, 29, 72, 0.08) !important;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.mac-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 0px #fecdd3, 0 20px 35px rgba(225, 29, 72, 0.12) !important;
}

.mac-header {
  background: #fff0f2;
  border-bottom: 3px solid #ffb7c5;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  position: relative;
}

.dots-row {
  display: flex;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  border: 1.5px solid transparent;
}
.dot.red { background-color: #ff5f56; border-color: #e0443e; }
.dot.yellow { background-color: #ffbd2e; border-color: #dea123; }
.dot.green { background-color: #27c93f; border-color: #1aab29; }

.mac-title {
  width: 100%;
  text-align: center;
  font-size: 1.05rem;
  font-weight: 700;
  color: #db2777;
}

/* ==========================================
   KARYAWAN TABLE CUSTOM STYLING
   ========================================== */
.karyawan-table {
  background-color: transparent !important;
}

.karyawan-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #fff0f2 !important;
  color: #db2777 !important;
  font-family: 'Fredoka', sans-serif;
  font-weight: 800 !important;
  border-bottom: 3px solid #ffb7c5 !important;
}

.hover-bg:hover {
  background-color: rgba(219, 39, 119, 0.05) !important;
}

.border-subtle {
  border: 1px solid #ffe4e6 !important;
}

.border-bottom-subtle {
  border-bottom: 1px solid #ffe4e6 !important;
}

/* Inputs Scoped styling */
.karyawan-page :deep(.q-field--outlined .q-field__control) {
  border-radius: 14px;
  border-color: #ffb7c5;
  transition: all 0.2s ease;
}
.karyawan-page :deep(.q-field--outlined .q-field__control:hover) {
  border-color: #fda4af;
}
.karyawan-page :deep(.q-field--focused .q-field__control) {
  border-color: #db2777 !important;
  box-shadow: 0 0 0 3px rgba(219, 39, 119, 0.15);
}

.karyawan-page :deep(.q-field__label) {
  color: #db2777;
  font-weight: 600;
}

/* ==========================================
   BIODATA DETAIL STYLING
   ========================================== */
.detail-table {
  width: 100%;
  border-collapse: collapse;
}
.detail-table td {
  padding: 14px 8px;
  font-size: 13.5px;
  border-bottom: 1px dashed #ffe4e6;
}
.detail-table tr:last-child td {
  border-bottom: none;
}
.detail-table td:first-child {
  width: 35%;
  color: #db2777;
  font-weight: 700;
}
.detail-table td:last-child {
  color: #4c0519;
  font-weight: 600;
}

.saas-gradient-primary {
  background: linear-gradient(135deg, #db2777 0%, #ec4899 100%) !important;
  position: relative;
  overflow: hidden;
}

.border-white-5 {
  border: 4px solid #fff;
  box-shadow: 0 4px 10px rgba(219, 39, 119, 0.15);
}

/* ==========================================
   LANYARD ACCESS BADGE (HYBRID CUTE PINK SYSTEM)
   ========================================== */
.id-card-container {
  width: 280px;
  height: 440px;
  background: #ffffff;
  border-radius: 24px;
  border: 4px solid #ffb7c5;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  position: relative;
  box-shadow: 0 15px 35px rgba(219, 39, 119, 0.12), inset 0 0 20px rgba(219, 39, 119, 0.05);
}

.lanyard-hole {
  width: 35px;
  height: 8px;
  background: #ffe4e6;
  border: 2px solid #ffb7c5;
  border-radius: 10px;
  margin-bottom: 6px;
  z-index: 3;
}

.id-card-header {
  width: 100%;
  color: #db2777;
  z-index: 3;
}

.id-company-title {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.5px;
  color: #be185d;
}

.id-company-sub {
  font-size: 8px;
  color: #db2777;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.id-card-photo-box {
  width: 110px;
  height: 110px;
  border: 4.5px solid #ffccd5 !important;
  background: #fff0f2;
  z-index: 2;
  box-shadow: 0 4px 12px rgba(219, 39, 119, 0.1);
  box-sizing: border-box;
  border-radius: 50% !important;
  overflow: hidden;
  position: relative;
}

.id-photo-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.id-lock-tag {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: #db2777;
  color: #ffffff;
  font-size: 8px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  border: 1.5px solid #be185d;
}

.id-card-info {
  width: 100%;
  z-index: 3;
  margin-top: 4px;
}

.id-employee-name {
  font-size: 14px;
  font-weight: 800;
  color: #be185d;
  letter-spacing: 0.5px;
}

.id-employee-job {
  font-size: 10px;
  color: #db2777;
  font-weight: 700;
  text-transform: uppercase;
}

.qr-white-wrapper {
  background: #ffffff;
  padding: 4px;
  border-radius: 12px;
  border: 2.5px solid #ffccd5;
  z-index: 3;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
}

.qr-element {
  width: 60px;
  height: 60px;
}

.id-employee-nik {
  font-size: 11px;
  font-weight: 700;
  color: #be185d;
  margin-top: 4px;
  font-family: 'Courier New', monospace;
  background: #fff1f2;
  padding: 2px 10px;
  border-radius: 6px;
  border: 1.5px dashed #fda4af;
}

.id-card-footer {
  width: 100%;
  background: #db2777;
  color: #ffffff;
  font-size: 7px;
  font-weight: 900;
  padding: 4px 0;
  border-radius: 8px;
  letter-spacing: 0.8px;
}

.profile-verified-photo-box {
  width: 140px;
  height: 140px;
  border: 4px solid #ffccd5;
  border-radius: 50%;
  overflow: hidden;
  background: #fff5f6;
  box-shadow: 0 6px 15px rgba(219, 39, 119, 0.1);
}
.profile-verified-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.landscape-paper {
  background: white;
  width: 297mm;
  min-height: 210mm;
  padding: 10mm 15mm;
  box-sizing: border-box;
}
.pdf-export-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.pdf-export-table th {
  background-color: #db2777;
  color: #ffffff;
  padding: 10px;
  font-size: 11px;
}
.pdf-export-table td {
  padding: 10px;
  font-size: 10px;
  border: 1px solid #ffe4e6;
}

.shift-row-item {
  transition: background 0.15s;
}
.shift-row-item:last-child {
  border-bottom: none !important;
}
</style>
