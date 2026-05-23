<template>
  <q-page class="bg-blue-grey-1 q-pa-md q-pa-md-lg font-pro">
    <!-- =====================================================================================
         VIEW 1: DAFTAR KARYAWAN (LIST VIEW)
         ===================================================================================== -->
    <template v-if="currentView === 'list'">
      <!-- HEADER DATABASE -->
      <div class="row items-center justify-between q-mb-md q-mb-md-lg no-print animate-fade">
        <div class="col-12 col-md-auto q-mb-md q-mb-md-none">
          <div class="text-h5 text-md-h4 text-weight-bolder text-blue-grey-10">
            Database Karyawan
          </div>
          <div class="text-caption text-md-subtitle2 text-grey-7">
            Manajemen data, berkas legalitas, dan profil biometrik karyawan AGRA
          </div>
        </div>

        <div class="col-12 col-md-auto row q-gutter-sm no-wrap-md">
          <!-- Tombol Export -->
          <q-btn-dropdown
            outline
            color="blue-grey-8"
            label="Export Master"
            icon="download"
            rounded
            class="col col-md-auto"
          >
            <q-list>
              <q-item clickable v-ripple @click="exportToExcel">
                <q-item-section avatar>
                  <q-icon name="description" color="green-8" />
                </q-item-section>
                <q-item-section>Excel (.xlsx)</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="exportToPDF">
                <q-item-section avatar>
                  <q-icon name="picture_as_pdf" color="red-8" />
                </q-item-section>
                <q-item-section>PDF (.pdf)</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn
            color="primary"
            label="Tambah Karyawan"
            icon="add"
            @click="openDialog"
            unelevated
            rounded
            class="col col-md-auto shadow-3 text-weight-bold"
          />
        </div>
      </div>

      <!-- FILTER & SEARCH AREA -->
      <q-card flat bordered class="q-mb-md shadow-1 rounded-borders no-print animate-fade">
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
                  <q-icon name="search" color="primary" />
                </template>
                <template v-slot:append v-if="filter">
                  <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </div>
            <q-space class="gt-sm" />
            <div class="col-12 col-md-auto text-center text-md-right text-caption text-grey-6">
              Total:
              <span class="text-weight-bold text-primary">{{ karyawanList.length }}</span> Karyawan
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- TABLE LIST KARYAWAN -->
      <q-card
        flat
        bordered
        class="shadow-2 rounded-borders overflow-hidden no-print animate-fade-up"
      >
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

                  <!-- REVISI POIN 15: Rendering Multi-Lokasi Dinas dengan Indah di List View (ss 3) -->
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
      </q-card>
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
          color="blue-grey-8"
          rounded
          class="bg-white shadow-soft border-subtle text-weight-bold"
        />
        <q-space />
        <q-btn
          unelevated
          icon="print"
          color="indigo-10"
          label="Cetak ID Card Karyawan"
          class="rounded-8 font-bold text-weight-bold q-px-lg shadow-md"
          @click="cetakIdCardLokal"
        />
      </div>

      <div class="row q-col-gutter-lg justify-center animate-fade-up" v-if="selectedKaryawan">
        <!-- ID CARD PREVIEW (KOLOM KIRI: INTEGRASI BARCODE & BIOMETRIK WAJAH) -->
        <div class="col-12 col-md-4 flex flex-center">
          <div class="column items-center full-width">
            <div
              class="text-subtitle1 text-weight-bolder text-blue-grey-9 q-mb-sm text-center uppercase tracking-wide"
            >
              Access Badge Resmi Perusahaan
            </div>

            <div id="digital-id-card-badge" class="id-card-container shadow-24 relative-position">
              <div class="lanyard-hole"></div>

              <div class="id-card-header text-center column flex-center">
                <q-icon name="corporate_fare" size="28px" class="q-mb-xs" />
                <div class="id-company-title">PT AGRA ABHINAYA PERKASA</div>
                <div class="id-company-sub">Sistem Integrasi ERP Cloud</div>
              </div>

              <!-- Foto Registrasi Absen (Bukan foto profil sosial, melainkan master biometrik acuan AI) -->
              <div class="id-card-photo-box flex flex-center relative-position">
                <img
                  :src="selectedKaryawan.foto_registrasi || 'https://cdn.quasar.dev/img/avatar.png'"
                  class="id-photo-element"
                />
                <div class="id-lock-tag">
                  <q-icon name="verified" size="10px" class="q-mr-xs" />BIOMETRIC VALID
                </div>
              </div>

              <div class="id-card-info text-center">
                <div class="id-employee-name uppercase">{{ selectedKaryawan.nama }}</div>
                <div class="id-employee-job">{{ selectedKaryawan.jabatan }}</div>
                <q-badge
                  color="indigo-10"
                  text-color="white"
                  class="q-px-sm text-weight-bold text-overline font-mono q-mt-xs"
                >
                  {{ selectedKaryawan.divisi || 'STAFF' }}
                </q-badge>
              </div>

              <!-- QR Code Absensi Otomatis dari NIK (Saat Di-scan akan memunculkan NIK) -->
              <div class="id-card-qr-box text-center column flex-center">
                <div class="qr-white-wrapper shadow-soft">
                  <img
                    :src="
                      'https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=1a237e&data=' +
                      selectedKaryawan.nik
                    "
                    class="qr-element"
                  />
                </div>
                <div class="id-employee-nik font-mono">{{ selectedKaryawan.nik }}</div>
              </div>

              <div class="id-card-footer text-center">KARTU IDENTITAS DIGITAL RESMI PERUSAHAAN</div>
            </div>
          </div>
        </div>

        <!-- DETAILS BIODATA TABS -->
        <div class="col-12 col-md-8">
          <q-card
            flat
            bordered
            class="rounded-16 shadow-soft bg-white border-subtle overflow-hidden"
          >
            <!-- Header Nama & Avatar Hero -->
            <div
              class="saas-gradient-primary relative-position flex items-end q-px-lg q-py-md text-white"
            >
              <div class="row items-center q-col-gutter-md">
                <div class="col-auto">
                  <q-avatar size="64px" class="border-white-5">
                    <img
                      :src="selectedKaryawan.fotoUrl || 'https://cdn.quasar.dev/img/avatar.png'"
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
              class="text-grey-7 bg-slate-50 border-bottom-subtle"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
            >
              <q-tab name="personal" label="Personal" class="text-weight-bold" />
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

                    <!-- REVISI POIN 5 & 15: Penampilan dinamis untuk Jadwal & Multi-Lokasi Dinas -->
                    <tr>
                      <td>Jam Dinas / Shift Kerja</td>
                      <td>
                        <q-badge
                          color="orange-1"
                          text-color="orange-9"
                          class="q-px-md q-py-xs text-weight-bolder rounded-6"
                        >
                          <q-icon name="schedule" size="14px" class="q-mr-xs" />
                          {{ selectedKaryawan.jam_masuk || '08:00' }} -
                          {{ selectedKaryawan.jam_pulang || '17:00' }}
                        </q-badge>
                      </td>
                    </tr>
                    <tr>
                      <td>Lokasi Dinas Penugasan</td>
                      <td>
                        <div class="row q-gutter-xs">
                          <template v-if="Array.isArray(selectedKaryawan.lokasi_dinas)">
                            <q-badge
                              v-for="loc in selectedKaryawan.lokasi_dinas"
                              :key="loc"
                              color="teal-1"
                              text-color="teal-9"
                              class="q-px-md q-py-xs text-weight-bolder rounded-6"
                            >
                              <q-icon name="place" size="14px" class="q-mr-xs" />
                              {{ loc }}
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
                              <q-icon name="place" size="14px" class="q-mr-xs" />
                              {{ selectedKaryawan.lokasi_dinas }}
                            </q-badge>
                          </template>
                          <template v-else>
                            <span class="text-grey-6">Belum Ditugaskan</span>
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
                  <q-item v-if="!selectedKaryawan.docs?.length">
                    <q-item-section
                      class="text-center q-pa-lg text-slate-400 font-medium italic font-12"
                      >Belum ada berkas terlampir.</q-item-section
                    >
                  </q-item>
                </q-list>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>
      </div>
      <div class="q-py-xl"></div>
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
            color="indigo-10"
            icon="arrow_back"
            @click="currentView = 'list'"
            class="q-mr-md bg-white shadow-1"
          />
          <div>
            <div
              class="text-overline text-slate-500 text-bold tracking-widest q-mb-xs leading-none"
            >
              DATABASE KARYAWAN
            </div>
            <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight uppercase">
              {{ form.id ? 'Perbarui Data Karyawan' : 'Registrasi Baru' }}
            </div>
          </div>
        </div>
        <q-btn
          label="SIMPAN DATA"
          @click="saveKaryawan"
          unelevated
          rounded
          class="text-white shadow-6 q-px-xl q-py-sm text-weight-bold"
          style="background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)"
          :loading="submitting"
        />
      </div>

      <div class="row justify-center animate-fade-up">
        <div class="col-12 col-lg-10">
          <div class="row q-col-gutter-lg">
            <!-- INPUT KOLOM KIRI (7/12) -->
            <div class="col-12 col-md-7">
              <!-- CARD 1: INFORMASI PERSONAL -->
              <q-card flat bordered class="rounded-borders q-pa-lg bg-white shadow-soft q-mb-lg">
                <div class="row items-center q-mb-lg border-bottom-subtle q-pb-md">
                  <q-avatar
                    size="36px"
                    color="blue-50"
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
                    class="col-12 col-sm-6"
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

              <!-- CARD 2: KEPEGAWAIAN & SHIFT DINAMIS (REVISI INTEGRASI POIN 5) -->
              <q-card flat bordered class="rounded-borders q-pa-lg bg-white shadow-soft q-mb-lg">
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
                      Mulai Kerja & Shift Dinas
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

                  <!-- Pengaturan Jam Shift Masuk dan Pulang untuk Karyawan -->
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

                  <!-- REVISI POIN 15: Dropdown Multi-select Lokasi Dinas penugasan pada form registrasi utama -->
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
              <q-card flat bordered class="rounded-borders q-pa-lg bg-white shadow-soft q-mb-lg">
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
                      BPJS & Rekening Bank
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
              <q-card flat bordered class="rounded-borders q-pa-lg bg-white shadow-soft">
                <div class="row items-center q-mb-lg border-bottom-subtle q-pb-md">
                  <q-avatar
                    size="36px"
                    color="blue-50"
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
                  />
                </div>
              </q-card>
            </div>

            <!-- INPUT KOLOM KANAN (5/12) -->
            <div class="col-12 col-md-5">
              <q-card flat bordered class="rounded-borders q-pa-lg bg-white shadow-soft">
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
                  :options="divisiOptions"
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
                    Foto Registrasi Absen (Terkunci)
                  </div>
                </div>

                <div
                  v-if="form.foto_registrasi"
                  class="text-center q-pa-md rounded-12 border-subtle bg-slate-50 q-mb-md"
                >
                  <q-img
                    :src="form.foto_registrasi"
                    style="max-width: 130px; border-radius: 12px"
                    class="shadow-sm q-mb-xs"
                  />
                  <div class="text-caption text-weight-bold text-red-7">
                    <q-icon name="lock" class="q-mr-xs" /> SYSTEM LOCKED: DATABASE ACUAN AI
                  </div>
                </div>

                <q-file
                  v-else
                  outlined
                  v-model="fotoRegistrasiFile"
                  label="Upload Foto Registrasi Wajah Resmi"
                  accept="image/*"
                  dense
                  class="q-mb-md"
                  :rules="[
                    (val) =>
                      !!val ||
                      'Foto registrasi wajah wajib diunggah untuk basis database AI absensi!',
                  ]"
                />

                <!-- Dokumen Pendukung -->
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

    <!-- =====================================================================================
         REVISI EMAS: DIALOG POPUP SHIFT & MULTI LOKASI PENUGASAN REAKTIF (BISA DIUBAH KAPAN SAJA)
         ===================================================================================== -->
    <q-dialog v-model="dialogShift" persistent backdrop-filter="blur(5px)">
      <q-card
        style="width: 500px; max-width: 95vw"
        class="rounded-24 bg-white overflow-hidden shadow-soft"
      >
        <q-card-section class="row items-center q-pb-none q-pt-lg q-px-lg">
          <div class="row items-center">
            <q-avatar
              color="orange-1"
              text-color="orange-9"
              icon="schedule"
              size="42px"
              class="q-mr-md"
            />
            <div>
              <div class="text-h6 text-weight-bold text-blue-grey-10 line-height-1">
                Atur Shift & Lokasi Dinas
              </div>
              <div class="text-caption text-blue-grey-5">
                Ubah penugasan waktu dan lokasi dikoordinasikan secara reaktif kapan saja.
              </div>
            </div>
          </div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            color="blue-grey-4"
            class="bg-grey-2"
          />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="q-gutter-y-md">
            <!-- Jam Masuk & Pulang -->
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <div
                  class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-xs"
                  style="font-size: 11px"
                >
                  Jam Masuk Shift *
                </div>
                <q-input outlined v-model="shiftForm.jam_masuk" type="time" dense />
              </div>
              <div class="col-6">
                <div
                  class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-xs"
                  style="font-size: 11px"
                >
                  Jam Pulang Shift *
                </div>
                <q-input outlined v-model="shiftForm.jam_pulang" type="time" dense />
              </div>
            </div>

            <!-- REVISI POIN 15: Dropdown Multi-select Lokasi Dinas penugasan reaktif pada dialog cepat admin -->
            <div>
              <div
                class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-xs"
                style="font-size: 11px"
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
              >
                <template v-slot:prepend><q-icon name="place" color="blue-grey-4" /></template>
              </q-select>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="bg-grey-1 q-pa-md border-top">
          <q-btn
            flat
            label="Batal"
            color="blue-grey-6"
            v-close-popup
            class="text-weight-bold rounded-8 q-px-md"
          />
          <q-btn
            unelevated
            label="SIMPAN PERUBAHAN"
            color="primary"
            @click="saveShiftSettings"
            class="text-weight-bold rounded-12 q-px-xl shadow-soft-primary"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- HIDDEN EXPORT TABLE -->
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
  onSnapshot,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const authStore = useAuthStore()

const currentView = ref('list')
const filter = ref('')
const selectedKaryawanId = ref('')
const isEditMode = ref(false)
const submitting = ref(false)
const loading = ref(true)
const tab = ref('personal')

// REVISI POIN 5 & 15: Variabel dynamic modal shift & list opsi lokasi dinas
const dialogShift = ref(false)
const shiftForm = ref({
  karyawanId: '',
  jam_masuk: '08:00',
  jam_pulang: '17:00',
  lokasi_dinas: [], // Diinisialisasi sebagai array kosong agar aman untuk multi-select
})
const lokasiOptions = ref([])

const karyawanList = ref([])
const jabatanOptions = ref([])
const docList = ref([{ name: '', file: null }])
const fotoFile = ref(null)
const fotoRegistrasiFile = ref(null)

const divisiOptions = ['Konstruksi', 'Manufaktur']

// REVISI UTAMA: selectedKaryawan diubah menjadi computed agar reaktif secara live dari data Firestore
const selectedKaryawan = computed(() => {
  return karyawanList.value.find((k) => k.id === selectedKaryawanId.value) || null
})

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
  jam_masuk: '08:00',
  jam_pulang: '17:00',
  lokasi_dinas: [], // Diubah menjadi array kosong secara default
}
const form = ref({ ...formDefault })

let unsubUser = null,
  unsubKaryawan = null,
  unsubJabatan = null,
  unsubLokasi = null
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

// Mengunci ke ID reaktif
const viewDetail = (data) => {
  selectedKaryawanId.value = data.id
  currentView.value = 'detail'
  window.scrollTo(0, 0)
}

const editKaryawan = (data) => {
  isEditMode.value = true

  // Konversi database lama (jika ada string) menjadi array lokasi dinas
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
  }
  docList.value = data.docs ? [...data.docs] : [{ name: '', file: null }]
  fotoFile.value = null
  fotoRegistrasiFile.value = null
  currentView.value = 'form'
  window.scrollTo(0, 0)
}

// REVISI EMAS: Logic pembuka quick dialog penyesuaian shift hrd dinamis
const openShiftDialog = (karyawan) => {
  let initialLocs = karyawan.lokasi_dinas || []
  if (typeof initialLocs === 'string') {
    initialLocs = initialLocs ? [initialLocs] : []
  }

  shiftForm.value = {
    karyawanId: karyawan.id,
    jam_masuk: karyawan.jam_masuk || '08:00',
    jam_pulang: karyawan.jam_pulang || '17:00',
    lokasi_dinas: initialLocs,
  }
  dialogShift.value = true
}

// REVISI EMAS: Handler penyimpanan shift & lokasi dinas dinamis di detail page (Auto-sync reaktif)
const saveShiftSettings = async () => {
  if (!shiftForm.value.lokasi_dinas || shiftForm.value.lokasi_dinas.length === 0) {
    $q.notify({ type: 'warning', message: 'Silakan tentukan Lokasi Dinas proyek aktif!' })
    return
  }
  $q.loading.show({ message: 'Memproses perubahan dinas reaktif...' })
  try {
    const userRef = doc(db, 'karyawan', shiftForm.value.karyawanId)
    await updateDoc(userRef, {
      jam_masuk: shiftForm.value.jam_masuk,
      jam_pulang: shiftForm.value.jam_pulang,
      lokasi_dinas: shiftForm.value.lokasi_dinas,
    })

    dialogShift.value = false
    $q.notify({ type: 'positive', message: 'Dinas & Jadwal Kerja Karyawan Berhasil Diperbarui!' })
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
    $q.notify({ type: 'warning', message: 'Foto Registrasi wajib diunggah untuk data acuan AI!' })
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
    console.error(error)
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
  html2pdf()
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
  html2pdf()
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

onMounted(async () => {
  await loadExternalLibraries()
  if (authStore.user?.email) {
    unsubUser = onSnapshot(
      query(collection(db, 'karyawan'), where('email', '==', authStore.user.email)),
      (snap) => {
        if (!snap.empty) userData.value = snap.docs[0].data()
      },
    )
  }
  unsubKaryawan = onSnapshot(query(collection(db, 'karyawan')), (s) => {
    karyawanList.value = s.docs
      .map((d) => ({ ...d.data(), id: d.id }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  })
  unsubJabatan = onSnapshot(query(collection(db, 'jabatan')), (s) => {
    jabatanOptions.value = s.docs.map((d) => ({
      label: d.data().namaJabatan,
      value: d.data().namaJabatan,
    }))
  })
  // REVISI POIN 15: Sinkronisasi real-time dropdown Lokasi Dinas dengan menu Pengaturan Absensi menggunakan model objek berlabel
  unsubLokasi = onSnapshot(query(collection(db, 'lokasi_kantor')), (s) => {
    lokasiOptions.value = s.docs.map((d) => {
      const name = d.data().nama_lokasi || ''
      return {
        label: name.toUpperCase(),
        value: name,
      }
    })
  })
})

onUnmounted(() => {
  if (unsubUser) unsubUser()
  if (unsubKaryawan) unsubKaryawan()
  if (unsubJabatan) unsubJabatan()
  if (unsubLokasi) unsubLokasi()
})

const columns = [
  { name: 'nik', label: 'NIK', field: 'nik', align: 'left', sortable: true },
  { name: 'nama', label: 'NAMA KARYAWAN', field: 'nama', align: 'left', sortable: true },
  { name: 'jabatan', label: 'JABATAN / DIVISI', field: 'jabatan', align: 'left' },
  { name: 'actions', label: 'AKSI', field: 'id', align: 'right' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.font-pro {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.rounded-borders {
  border-radius: 12px;
}
.rounded-16 {
  border-radius: 16px;
}
.rounded-20 {
  border-radius: 20px;
}
.border-subtle {
  border: 1px solid #f1f5f9 !important;
}
.border-bottom-subtle {
  border-bottom: 1px solid #f1f5f9 !important;
}
.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.04) !important;
}
.shadow-soft {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
}
.karyawan-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #263238;
  color: white;
}
.leading-none {
  line-height: 1;
}

.id-card-container {
  width: 280px;
  height: 440px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #cbd5e1;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  background-image: radial-gradient(circle at 100% 0%, #e0e7ff 0%, #ffffff 60%);
}
.lanyard-hole {
  width: 35px;
  height: 8px;
  background: #cbd5e1;
  border-radius: 10px;
  margin-top: -4px;
  margin-bottom: 8px;
}
.id-card-header {
  width: 100%;
  color: #1a237e;
}
.id-company-title {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
}
.id-company-sub {
  font-size: 9px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
}

.id-card-photo-box {
  width: 110px;
  height: 135px;
  border: 3px solid #1a237e;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.id-photo-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.id-lock-tag {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(20, 184, 166, 0.9);
  color: white;
  font-size: 8px;
  font-weight: 800;
  text-align: center;
  padding: 2px 0;
}

.id-employee-name {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 2px;
  letter-spacing: -0.3px;
}
.id-employee-job {
  font-size: 11px;
  color: #475569;
  font-weight: 600;
}

.id-card-qr-box {
  margin-top: 4px;
}
.qr-white-wrapper {
  background: white;
  padding: 6px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.qr-element {
  width: 75px;
  height: 75px;
  display: block;
}
.id-employee-nik {
  font-size: 11px;
  font-weight: 700;
  color: #1a237e;
  margin-top: 4px;
}

.id-card-footer {
  width: 100%;
  background: #1a237e;
  color: white;
  font-size: 8px;
  font-weight: 700;
  padding: 6px 0;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

/* Landscape Export Hidden View */
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
  background-color: #1a237e;
  color: #ffffff;
  padding: 10px;
  font-size: 11px;
}
.pdf-export-table td {
  padding: 10px;
  font-size: 10px;
  border: 1px solid #e0e0e0;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
}
.detail-table td {
  padding: 12px 0;
  font-size: 13.5px;
  border-bottom: 1px solid #f1f5f9;
}
.detail-table tr:last-child td {
  border-bottom: none;
}
.detail-table td:first-child {
  width: 35%;
  color: #64748b;
  font-weight: 500;
}
.detail-table td:last-child {
  color: #1e293b;
}
.saas-gradient-primary {
  background: linear-gradient(135deg, #1a237e 0%, #3b82f6 100%);
  position: relative;
  overflow: hidden;
}
.border-white-5 {
  border: 5px solid white;
}
</style>
