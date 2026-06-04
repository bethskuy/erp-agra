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
        <!-- ID CARD PREVIEW (KOLOM KIRI: DESAIN ULTRA PREMIUM CYBER-GLASS TITANIUM BEZEL) -->
        <div class="col-12 col-md-4 flex flex-center">
          <div class="column items-center full-width">
            <div
              class="text-subtitle1 text-weight-bolder text-blue-grey-9 q-mb-md text-center uppercase tracking-wide font-pro"
            >
              Access Badge Resmi Perusahaan
            </div>

            <!-- ID CARD CONTAINER UTAMA (ULTRAPREMIUM HIGH-TECH GLASS) -->
            <div id="digital-id-card-badge" class="id-card-container relative-position">
              <!-- Metal Screws in Corners (Mekanikal Presisi) -->
              <div class="bezel-screw tl"></div>
              <div class="bezel-screw tr"></div>
              <div class="bezel-screw bl"></div>
              <div class="bezel-screw br"></div>

              <!-- Top Lanyard Mount (Klip Logam Industri) -->
              <div class="bezel-hanger-mount">
                <div class="bezel-hanger-core"></div>
              </div>

              <!-- Cyber Schematic Grids & Glow Layers -->
              <div class="cyber-grid-overlay"></div>
              <div class="cyber-glow-blue"></div>
              <div class="cyber-glow-purple"></div>

              <!-- Top Telemetry & Status Bar -->
              <div class="cyber-status-bar row no-wrap justify-between items-center full-width">
                <span class="status-indicator">
                  <span class="status-pulse-dot"></span>
                  SYS.SECURE // LIVE_PASS
                </span>
                <span class="tech-serial font-mono">AGR.026_X</span>
              </div>

              <!-- Header dengan Logo Resmi & Branding Modern -->
              <div class="id-card-header text-center column flex-center">
                <div class="id-logo-box q-mb-xs">
                  <img
                    src="/icons/logo-agra.png"
                    class="id-logo-element"
                    @error="useFallbackLogo = true"
                    v-if="!useFallbackLogo"
                    alt="AGRA Logo"
                  />
                  <q-icon name="corporate_fare" size="24px" class="text-indigo-10" v-else />
                </div>
                <div class="id-company-title">PT AGRA ABHINAYA PERKASA</div>
                <div class="id-company-sub">SISTEM INTEGRASI ERP CLOUD</div>
              </div>

              <!-- Biometric Scanning Target Frame & Glowing Pulse -->
              <div class="id-card-photo-wrapper flex flex-center relative-position">
                <div class="photo-glow-ring"></div>
                <div class="biometric-scanner-reticle"></div>
                <div class="scanner-sweep-line"></div>

                <q-avatar size="108px" class="id-card-photo-box">
                  <img
                    :src="selectedKaryawan.fotoUrl || 'https://cdn.quasar.dev/img/avatar.png'"
                    style="object-fit: cover"
                  />
                </q-avatar>

                <!-- Shield Security Badge (Plat Logam Holografik) -->
                <div class="id-official-badge">
                  <q-icon name="verified" size="12px" class="text-cyan-4 animate-pulse" />OFFICIAL
                  ID
                </div>
              </div>

              <!-- Grid Informasi Karyawan & Pembagian Visual -->
              <div class="id-card-info text-center">
                <div class="id-employee-name uppercase">{{ selectedKaryawan.nama }}</div>
                <div class="id-employee-job">{{ selectedKaryawan.jabatan }}</div>

                <div class="row justify-center q-mt-sm">
                  <span
                    class="id-custom-divisi-tag"
                    :class="selectedKaryawan.divisi?.toLowerCase() || 'staff'"
                  >
                    <q-icon
                      name="engineering"
                      size="11px"
                      class="q-mr-xs"
                      v-if="selectedKaryawan.divisi?.toLowerCase() === 'konstruksi'"
                    />
                    <q-icon
                      name="settings_suggest"
                      size="11px"
                      class="q-mr-xs"
                      v-else-if="selectedKaryawan.divisi?.toLowerCase() === 'manufaktur'"
                    />
                    {{ selectedKaryawan.divisi || 'STAFF' }}
                  </span>
                </div>
              </div>

              <!-- Enclosed QR Code & Barcode Telemetry -->
              <div class="id-card-qr-box text-center column flex-center">
                <div class="qr-cyber-wrapper">
                  <img :src="generateQrUrl(selectedKaryawan)" class="qr-element" />
                  <!-- Cyberpunk Angle brackets -->
                  <div class="corner-accent tl"></div>
                  <div class="corner-accent tr"></div>
                  <div class="corner-accent bl"></div>
                  <div class="corner-accent br"></div>
                </div>
                <div class="id-employee-nik font-mono">{{ selectedKaryawan.nik }}</div>
              </div>

              <!-- Premium Footer Strip -->
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
                      style="object-fit: cover"
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

            <!-- Tab Selector -->
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

            <!-- Tab Panels -->
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
                    <tr>
                      <td>Jam Dinas / Shift Kerja</td>
                      <td>
                        <!-- Jadwal per hari jika ada, fallback ke jam lama -->
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
                                <q-icon name="schedule" size="12px" class="q-mr-xs text-orange-7" />
                                {{ j.jam_masuk }} – {{ j.jam_pulang }}
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
                            <q-icon name="schedule" size="14px" class="q-mr-xs" />
                            {{ selectedKaryawan.jam_masuk || '08:00' }} -
                            {{ selectedKaryawan.jam_pulang || '17:00' }}
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
         VIEW 3: FORM REGISTRASI / EDIT
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

              <!-- CARD 2: KEPEGAWAIAN & SHIFT DINAMIS -->
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
                    Foto Registrasi Absen (Terkunci)
                  </div>
                </div>

                <!-- Tampilkan preview foto yang sudah tersimpan -->
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

                <!-- Preview foto baru yang dipilih (sebelum disimpan) -->
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
         VIEW 4: HALAMAN VERIFIKASI PROFIL PUBLIK (OVERLAY RESPONSIF BAGI SCANNED VISITOR)
         ===================================================================================== -->
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
            <!-- Header Status Verified -->
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

            <!-- Profile Frame Bulat Sempurna -->
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

              <!-- Data Non-Sensitif / Publik -->
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
                    <template v-else-if="publicKaryawan.lokasi_dinas">
                      <q-badge
                        color="teal-1"
                        text-color="teal-10"
                        class="q-px-sm q-py-xs text-weight-bold"
                      >
                        <q-icon name="place" size="10px" class="q-mr-xs" />{{
                          publicKaryawan.lokasi_dinas
                        }}
                      </q-badge>
                    </template>
                  </div>
                </div>
                <div class="row items-center justify-between q-py-xs">
                  <span class="text-caption text-grey-6 font-weight-bold">Status Kepegawaian</span>
                  <q-badge
                    color="positive"
                    class="q-px-md q-py-xs text-weight-bold rounded-pill text-overline"
                    >AKTIF</q-badge
                  >
                </div>
              </div>
            </q-card-section>

            <div class="bg-blue-grey-1 q-py-md text-caption text-grey-6 text-center border-top">
              Sistem Informasi SDM Terintegrasi AGRA ERP<br />
              <span class="font-bold text-indigo-10">Valid &amp; Tercatat Resmi</span>
            </div>
          </q-card>
        </div>

        <div v-else class="text-center animate-fade-up">
          <q-icon name="error_outline" color="negative" size="64px" />
          <div class="text-h6 q-mt-md text-red-7">Verifikasi Profil Gagal</div>
          <div class="text-caption text-grey-6 q-px-md">
            ID Karyawan tidak terdaftar atau telah dinonaktifkan dari PT AGRA ABHINAYA PERKASA.
          </div>
        </div>
      </div>
    </template>

    <!-- DIALOG POPUP SHIFT PER HARI & MULTI LOKASI PENUGASAN -->
    <q-dialog v-model="dialogShift" persistent backdrop-filter="blur(5px)">
      <q-card
        style="
          width: 640px;
          max-width: 98vw;
          max-height: 92vh;
          display: flex;
          flex-direction: column;
        "
        class="rounded-24 bg-white overflow-hidden shadow-soft"
      >
        <!-- Header -->
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
                Atur jam kerja per hari, bisa campur shift berbeda tiap hari.
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

        <q-card-section class="q-pa-lg q-pt-md" style="overflow-y: auto; flex: 1 1 auto">
          <div class="q-gutter-y-md">
            <!-- PANEL: Terapkan jam ke range hari sekaligus -->
            <q-card flat bordered class="rounded-12 bg-orange-1 border-subtle q-pa-md">
              <div
                class="text-caption text-weight-bold text-orange-9 uppercase q-mb-sm"
                style="font-size: 11px; letter-spacing: 1px"
              >
                ⚡ Terapkan Cepat ke Beberapa Hari
              </div>
              <div class="row q-col-gutter-sm items-end">
                <div class="col-6 col-sm-3">
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
                <div class="col-6 col-sm-3">
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
                <div class="col-6 col-sm-2">
                  <div class="text-caption text-blue-grey-7 q-mb-xs">Jam Masuk</div>
                  <q-input
                    outlined
                    v-model="applyRangeJam.jam_masuk"
                    type="time"
                    dense
                    bg-color="white"
                  />
                </div>
                <div class="col-6 col-sm-2">
                  <div class="text-caption text-blue-grey-7 q-mb-xs">Jam Pulang</div>
                  <q-input
                    outlined
                    v-model="applyRangeJam.jam_pulang"
                    type="time"
                    dense
                    bg-color="white"
                  />
                </div>
                <div class="col-12 col-sm-2">
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

            <!-- TABEL JADWAL PER HARI -->
            <div>
              <div
                class="text-caption text-weight-bold text-blue-grey-8 uppercase q-mb-sm"
                style="font-size: 11px; letter-spacing: 1px"
              >
                Jadwal Harian (Senin – Sabtu)
              </div>
              <q-card flat bordered class="rounded-12 overflow-hidden border-subtle">
                <!-- Header tabel -->
                <div
                  class="row bg-blue-grey-9 text-white q-px-md q-py-xs"
                  style="font-size: 11px; font-weight: 700; letter-spacing: 0.5px"
                >
                  <div class="col-1 text-center">AKTIF</div>
                  <div class="col-3 q-pl-sm">HARI</div>
                  <div class="col-4 text-center">JAM MASUK</div>
                  <div class="col-4 text-center">JAM PULANG</div>
                </div>
                <!-- Row per hari -->
                <div
                  v-for="jadwal in shiftForm.jadwal"
                  :key="jadwal.hari"
                  class="row items-center q-px-md q-py-sm shift-row-item"
                  :class="jadwal.aktif ? 'bg-white' : 'bg-grey-1'"
                  style="border-bottom: 1px solid #f1f5f9"
                >
                  <!-- Toggle aktif -->
                  <div class="col-1 flex flex-center">
                    <q-toggle v-model="jadwal.aktif" color="primary" dense size="sm" />
                  </div>
                  <!-- Nama hari -->
                  <div class="col-3 q-pl-sm">
                    <span
                      class="text-weight-bold"
                      :class="jadwal.aktif ? 'text-blue-grey-9' : 'text-grey-5'"
                      style="font-size: 13px"
                    >
                      {{ jadwal.hari }}
                    </span>
                    <q-badge
                      v-if="!jadwal.aktif"
                      color="grey-3"
                      text-color="grey-6"
                      class="q-ml-xs"
                      style="font-size: 9px"
                      >LIBUR</q-badge
                    >
                  </div>
                  <!-- Jam masuk -->
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
                  <!-- Jam pulang -->
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

            <!-- Lokasi Dinas -->
            <div>
              <div
                class="text-caption text-weight-bold text-blue-grey-8 uppercase q-mb-xs"
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

// Struktur jadwal per hari: setiap hari punya jam_masuk, jam_pulang, aktif
const hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

const defaultJadwalHarian = () =>
  hariList.map((hari) => ({
    hari,
    aktif: hari !== 'Sabtu',
    jam_masuk: '08:00',
    jam_pulang: '17:00',
  }))

const shiftForm = ref({
  karyawanId: '',
  lokasi_dinas: [],
  jadwal: defaultJadwalHarian(),
})

const applyRangeJam = ref({
  dari: 0,
  sampai: 4,
  jam_masuk: '08:00',
  jam_pulang: '17:00',
})

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

// Preview URL untuk foto registrasi baru yang dipilih (sebelum di-upload)
const fotoRegistrasiPreview = computed(() => {
  if (!fotoRegistrasiFile.value) return null
  return URL.createObjectURL(fotoRegistrasiFile.value)
})

// Fallback jika asset logo-agra.png tidak berhasil dipanggil
const useFallbackLogo = ref(false)

const divOptions = ['Konstruksi', 'Manufaktur']

// Variable khusus menyimpan data verifikasi karyawan publik
const publicKaryawan = ref(null)

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
  fotoUrl: '',
  jam_masuk: '08:00',
  jam_pulang: '17:00',
  lokasi_dinas: [],
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

  // Load jadwal per hari dari data karyawan, fallback ke default jika belum ada
  let jadwalLoaded = defaultJadwalHarian()
  if (Array.isArray(karyawan.jadwal_harian) && karyawan.jadwal_harian.length === 6) {
    jadwalLoaded = karyawan.jadwal_harian
  } else if (karyawan.jam_masuk || karyawan.jam_pulang) {
    // Migrasi dari data lama: apply jam lama ke semua hari aktif
    jadwalLoaded = jadwalLoaded.map((j) => ({
      ...j,
      jam_masuk: karyawan.jam_masuk || '08:00',
      jam_pulang: karyawan.jam_pulang || '17:00',
    }))
  }

  shiftForm.value = {
    karyawanId: karyawan.id,
    lokasi_dinas: initialLocs,
    jadwal: jadwalLoaded,
  }

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
    // Ambil jam dari hari pertama yang aktif sebagai backward compat
    const firstAktif = hariAktif[0]
    const userRef = doc(db, 'karyawan', shiftForm.value.karyawanId)
    await updateDoc(userRef, {
      jadwal_harian: shiftForm.value.jadwal,
      jam_masuk: firstAktif.jam_masuk,
      jam_pulang: firstAktif.jam_pulang,
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

// METODE KHUSUS: Membuat Link Enkripsi QR Code Ke Halaman Validasi Publik
const generateQrUrl = (karyawan) => {
  if (!karyawan || !karyawan.id) return ''
  const baseUrl = window.location.origin + window.location.pathname
  const fullUrl = `${baseUrl}?public_id=${karyawan.id}`
  return (
    'https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=1a237e&data=' +
    encodeURIComponent(fullUrl)
  )
}

// METODE KHUSUS: Cek apakah visitor men-scan QR Code & mengarah ke halaman verifikasi publik
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
      // Jika visitor tidak login, gunakan login anonim agar dapat bypass Firebase Rule pembacaan data
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
    } catch (err) {
      console.error('Portal Verifikasi Publik Error:', err)
      $q.notify({ type: 'negative', message: 'Koneksi ke sistem database terhambat.' })
    } finally {
      loading.value = false
    }
  }
}

onMounted(async () => {
  await loadExternalLibraries()

  // Cek apakah ini adalah link hasil scan QR ID Card karyawan
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
    unsubLokasi = onSnapshot(query(collection(db, 'lokasi_kantor')), (s) => {
      lokasiOptions.value = s.docs.map((d) => {
        const name = d.data().nama_lokasi || ''
        return {
          label: name.toUpperCase(),
          value: name,
        }
      })
    })
  }
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
.rounded-24 {
  border-radius: 24px;
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

/* =========================================================================
   ULTRAPREMIUM CYBER-GLASSMOPHISM ID CARD (FUTURISTIC SCI-FI TECH BADGE)
   ========================================================================= */
.id-card-container {
  width: 280px;
  height: 440px;
  background: rgba(255, 255, 255, 0.82); /* Frosted Ice-glass */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 18px;
  border: 4px solid #94a3b8; /* Brushed Titanium Matte Frame */
  padding: 14px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  position: relative;
  box-shadow:
    0 15px 35px rgba(15, 23, 42, 0.15),
    inset 0 0 20px rgba(99, 102, 241, 0.06);
}

/* Metal Screws on Corners (Mekanikal Hardware) */
.bezel-screw {
  position: absolute;
  width: 7px;
  height: 7px;
  background: radial-gradient(circle, #cbd5e1 30%, #475569 80%);
  border-radius: 50%;
  border: 0.5px solid #94a3b8;
  z-index: 4;
}
.bezel-screw.tl {
  top: 6px;
  left: 6px;
}
.bezel-screw.tr {
  top: 6px;
  right: 6px;
}
.bezel-screw.bl {
  bottom: 6px;
  left: 6px;
}
.bezel-screw.br {
  bottom: 6px;
  right: 6px;
}

/* Titanium Lanyard Holder (Klip Gantung Atas) */
.bezel-hanger-mount {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 12px;
  background: linear-gradient(180deg, #94a3b8 0%, #475569 100%);
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}
.bezel-hanger-core {
  width: 22px;
  height: 3px;
  background: #1e293b;
  border-radius: 2px;
}

/* High-tech Background Schematic Grid Lines */
.cyber-grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(99, 102, 241, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, 0.04) 1px, transparent 1px);
  background-size: 14px 14px;
  pointer-events: none;
  z-index: 1;
}

/* Back-glow Ambient Orbs */
.cyber-glow-blue {
  position: absolute;
  top: -40px;
  left: -40px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
  pointer-events: none;
  z-index: 1;
}
.cyber-glow-purple {
  position: absolute;
  bottom: -40px;
  right: -40px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(255, 255, 255, 0) 70%);
  pointer-events: none;
  z-index: 1;
}

/* Tech Telemetry Bar */
.cyber-status-bar {
  font-size: 7px;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.8px;
  z-index: 3;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
  padding: 4px 6px 2px 6px;
  margin-top: 4px;
}
.status-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}
.status-pulse-dot {
  width: 4px;
  height: 4px;
  background-color: #06b6d4;
  border-radius: 50%;
  box-shadow: 0 0 6px #06b6d4;
  animation: pulseNeon 1.5s infinite ease-in-out;
}

/* Header & Logo */
.id-card-header {
  width: 100%;
  z-index: 3;
  margin-top: 2px;
}
.id-logo-box {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.id-logo-element {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.id-company-title {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1.2px;
  color: #0f172a; /* Dark Navy Slate */
}
.id-company-sub {
  font-size: 8px;
  color: #4f46e5;
  font-weight: 800;
  letter-spacing: 0.8px;
}

/* Biometric Scanner Frame with Circular Sweep Line */
.id-card-photo-wrapper {
  z-index: 3;
  margin: 4px 0;
}
.photo-glow-ring {
  position: absolute;
  width: 116px;
  height: 116px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #6366f1, #06b6d4, #6366f1);
  animation: spinRing 5s linear infinite;
  opacity: 0.8;
  filter: blur(1.5px);
}
.biometric-scanner-reticle {
  position: absolute;
  width: 122px;
  height: 122px;
  border-radius: 50%;
  border: 1px dashed rgba(6, 182, 212, 0.6);
  animation: pulseNeon 2s infinite ease-in-out;
  pointer-events: none;
}
.scanner-sweep-line {
  position: absolute;
  width: 110px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #06b6d4, transparent);
  box-shadow: 0 0 8px #06b6d4;
  z-index: 3;
  animation: sweepAction 3.5s infinite ease-in-out;
}
.id-card-photo-box {
  width: 106px;
  height: 106px;
  border: 3px solid #ffffff !important;
  background: #f8fafc;
  z-index: 2;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.12);
  box-sizing: border-box;
}

/* Premium Shield Badge (Plat Keamanan Biometrik) */
.id-official-badge {
  position: absolute;
  bottom: -6px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #22d3ee; /* Glowing Electric Cyan */
  font-size: 8px;
  font-weight: 900;
  text-align: center;
  padding: 3px 12px;
  border-radius: 20px;
  letter-spacing: 1px;
  box-shadow: 0 4px 10px rgba(6, 182, 212, 0.25);
  z-index: 4;
  text-transform: uppercase;
  border: 1.5px solid #06b6d4;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Karyawan Metadata Area */
.id-card-info {
  width: 100%;
  z-index: 3;
}
.id-employee-name {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: 0.5px;
  line-height: 1.2;
}
.id-employee-job {
  font-size: 10px;
  color: #475569;
  font-weight: 700;
  margin-top: 1px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Custom Cyberpunk Division Chips with Glowing Border */
.id-custom-divisi-tag {
  font-size: 8px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 3px 14px;
  border-radius: 6px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.5);
}
.id-custom-divisi-tag.konstruksi {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(99, 102, 241, 0.12) 100%);
  color: #4f46e5;
  border: 1.2px solid rgba(79, 70, 229, 0.35);
}
.id-custom-divisi-tag.manufaktur {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(219, 39, 119, 0.12) 100%);
  color: #db2777;
  border: 1.2px solid rgba(236, 72, 153, 0.35);
}
.id-custom-divisi-tag.staff {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.12) 100%);
  color: #059669;
  border: 1.2px solid rgba(16, 185, 129, 0.35);
}

/* QR Code Bracket Enclosure */
.qr-cyber-wrapper {
  background: #ffffff;
  padding: 6px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  position: relative;
  z-index: 3;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
}
.qr-element {
  width: 58px;
  height: 58px;
  display: block;
}

/* Cyberpunk Corner Highlight Brackets */
.corner-accent {
  position: absolute;
  width: 6px;
  height: 6px;
  border-color: #06b6d4;
  border-style: solid;
  pointer-events: none;
}
.corner-accent.tl {
  top: -1px;
  left: -1px;
  border-width: 1.5px 0 0 1.5px;
}
.corner-accent.tr {
  top: -1px;
  right: -1px;
  border-width: 1.5px 1.5px 0 0;
}
.corner-accent.bl {
  bottom: -1px;
  left: -1px;
  border-width: 0 0 1.5px 1.5px;
}
.corner-accent.br {
  bottom: -1px;
  right: -1px;
  border-width: 0 1.5px 1.5px 0;
}

/* Secure digital hash code NIK */
.id-employee-nik {
  font-size: 11px;
  font-weight: 900;
  color: #1e1b4b;
  margin-top: 4px;
  letter-spacing: 0.8px;
  font-family: 'Courier New', Courier, monospace;
  background: rgba(99, 102, 241, 0.07);
  padding: 1.5px 8px;
  border-radius: 4px;
  border: 1px solid rgba(99, 102, 241, 0.15);
  z-index: 3;
}

/* Secure Bottom Branding Strip */
.id-card-footer {
  width: 100%;
  background: linear-gradient(90deg, #1e1b4b 0%, #312e81 100%);
  color: #22d3ee; /* Glowing cyan font */
  font-size: 7px;
  font-weight: 900;
  padding: 4px 0;
  border-radius: 5px;
  letter-spacing: 0.8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 3;
  text-transform: uppercase;
}

/* =========================================================================
   SCI-FI MICRO-ANIMATIONS
   ========================================================================= */
@keyframes spinRing {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulseNeon {
  0%,
  100% {
    opacity: 0.6;
    box-shadow: 0 0 4px rgba(6, 182, 212, 0.3);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 10px rgba(6, 182, 212, 0.7);
  }
}

@keyframes sweepAction {
  0%,
  100% {
    top: 4px;
    opacity: 0.2;
  }
  50% {
    top: 102px;
    opacity: 0.9;
  }
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

/* Shift row item hover */
.shift-row-item {
  transition: background 0.15s;
}
.shift-row-item:last-child {
  border-bottom: none !important;
}
.saas-gradient-primary {
  background: linear-gradient(135deg, #1a237e 0%, #3b82f6 100%);
  position: relative;
  overflow: hidden;
}

.border-white-5 {
  border: 4px solid white;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* CSS Khusus Portal Verifikasi Publik */
.profile-verified-photo-box {
  width: 140px;
  height: 140px;
  border: 4px solid #009688;
  border-radius: 50%;
  overflow: hidden;
  background: #f8fafc;
}
.profile-verified-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
