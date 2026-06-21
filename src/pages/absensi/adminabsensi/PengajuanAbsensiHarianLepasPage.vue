<template>
  <q-page class="neo-page-bg font-inter q-pa-md q-pa-lg-lg relative-position overflow-hidden">
    <!-- FLOATING DECORATIONS CONTAINER -->
    <div class="neo-decorations-container no-print">
      <div class="neo-shape shape-wobbly-1"></div>
      <div class="neo-shape shape-wobbly-2"></div>
      <div class="neo-shape shape-wobbly-3"></div>
      <div class="neo-shape shape-wobbly-4"></div>
      <div class="neo-shape shape-wobbly-5"></div>
      <div class="neo-shape shape-wobbly-6"></div>
      <div class="neo-shape shape-wobbly-7"></div>
      <div class="neo-shape shape-wobbly-8"></div>
      <div class="neo-shape shape-wobbly-9"></div>
      <div class="neo-shape shape-wobbly-10"></div>
      <div class="neo-shape shape-wobbly-11"></div>
      <div class="neo-shape shape-wobbly-12"></div>
    </div>

    <!-- ======================================================================= -->
    <!-- VIEW 1: DAFTAR PROYEK AKTIF (RINGKASAN)                                  -->
    <!-- ======================================================================= -->
    <div v-if="!selectedProjectId" class="premium-container q-mx-auto page-content-wrapper table-entrance">
      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-md content-relative header-entrance">
        <div class="col-12 q-mb-md q-mb-md-none">
          <div class="text-h4 text-weight-bolder text-slate-900 leading-tight">
            Pengajuan Absensi Harian Lepas
            <span class="text-h5 text-weight-light text-grey-7 block q-mt-xs">
              Pilih Proyek Konstruksi Aktif
            </span>
          </div>
          <div class="text-subtitle1 text-slate-700 q-mt-sm">
            Manajemen kehadiran mandor dan pekerja harian lepas proyek secara terpusat.
          </div>
        </div>
      </div>

      <!-- SEARCH & STATS -->
      <q-card flat class="q-mb-lg neo-card content-relative">
        <q-card-section class="q-py-md">
          <div class="row items-center justify-between q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model="filterProyek"
                outlined
                dense
                placeholder="Cari Proyek, Klien, atau Lokasi..."
                bg-color="white"
                class="rounded-input"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="slate-900" />
                </template>
                <template v-slot:append v-if="filterProyek">
                  <q-icon name="close" @click="filterProyek = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-auto row items-center justify-end q-col-gutter-md q-mt-sm q-mt-md-none">
              <div class="col-12 col-md-auto text-caption text-slate-600 text-weight-medium text-center text-md-right">
                Total Proyek Aktif:
                <span class="text-weight-bold text-slate-900">{{ proyekList.length + 1 }} Entitas</span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>


      <!-- TABLE SECTION -->
      <q-card flat class="neo-card neo-table overflow-hidden content-relative">
        <q-table
          :rows="filteredProyekList"
          :columns="proyekColumns"
          row-key="id"
          flat
          :loading="loadingProyek"
          binary-state-sort
          class="project-table"
          :pagination="{ rowsPerPage: 10 }"
        >
          <!-- Custom Row Styling -->
          <template v-slot:body="props">
            <q-tr :props="props" class="hover-bg transition-all cursor-pointer" @click="selectProject(props.row)">
              <!-- NO -->
              <q-td key="no" :props="props" class="text-center font-mono text-slate-600 text-weight-bold" style="width: 60px">
                {{ props.rowIndex + 1 }}
              </q-td>

              <!-- NAMA PROYEK -->
              <q-td key="nama" :props="props">
                <div class="row items-center no-wrap">
                  <q-avatar
                    size="36px"
                    color="slate-900"
                    text-color="white"
                    class="q-mr-md text-weight-bold font-inter shadow-sm"
                  >
                    {{ props.row.nama.substring(0, 1).toUpperCase() }}
                  </q-avatar>
                  <div>
                    <div class="text-subtitle2 text-weight-bolder text-slate-900 uppercase">
                      {{ props.row.nama }}
                    </div>
                    <div class="text-caption text-slate-600 uppercase">
                      Klien: {{ props.row.konsumen_nama || 'Umum / Internal' }}
                    </div>
                  </div>
                </div>
              </q-td>

              <!-- LOKASI -->
              <q-td key="alamat" :props="props">
                <div class="row items-center no-wrap">
                  <q-icon name="place" color="slate-600" class="q-mr-xs" size="16px" />
                  <span class="text-slate-700 text-weight-medium">{{ props.row.alamat || 'LOKASI BELUM DIATUR' }}</span>
                </div>
              </q-td>

              <!-- STATUS -->
              <q-td key="status" :props="props" class="text-center">
                <span class="neo-badge bg-emerald-2 text-slate-900">AKTIF</span>
              </q-td>

              <!-- AKSI -->
              <q-td key="aksi" :props="props" class="text-center" @click.stop>
                <div class="row justify-center q-gutter-xs">
                  <q-btn
                    flat
                    round
                    color="slate-900"
                    icon="assignment"
                    size="sm"
                    @click="selectProject(props.row)"
                  >
                    <q-tooltip>Buat Pengajuan Absensi</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="slate-900"
                    icon="chevron_right"
                    size="sm"
                    @click="selectProject(props.row)"
                  />
                </div>
              </q-td>
            </q-tr>
          </template>

          <!-- Empty State -->
          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-xl text-grey-5">
              <q-icon name="business" size="64px" class="q-mb-md col-12" />
              <div class="text-h6 full-width text-center">Belum ada data proyek konstruksi terdaftar</div>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- ======================================================================= -->
    <!-- VIEW 2: FORM PENGAJUAN ABSENSI TERISOLASI PER PROYEK                    -->
    <!-- ======================================================================= -->
    <div v-else class="premium-container q-mx-auto page-content-wrapper table-entrance">
      <!-- HEADER BAR (VIEW SWITCHER STYLE) -->
      <div class="row items-center justify-between detail-header-row">
        <div class="col-12 col-md-8 detail-header-col">
          <div class="row items-center no-wrap">
            <q-btn
              flat
              round
              color="slate-900"
              icon="arrow_back"
              @click="deselectProject"
              class="q-mr-md neo-btn neo-btn-secondary"
            />
            <div>
              <div class="row items-center no-wrap q-gutter-x-sm">
                <span class="text-h5 text-md-h4 text-weight-bolder text-slate-900 leading-tight uppercase">
                  Detail Absensi Proyek
                </span>
                <span
                  v-if="currentStatus"
                  :class="[
                    'neo-badge text-weight-bold q-px-sm',
                    currentStatus === 'disetujui' ? 'bg-emerald-2 text-slate-900' : currentStatus === 'diajukan' ? 'bg-yellow-3 text-slate-900' : currentStatus === 'ditolak' ? 'bg-red-2 text-slate-900' : 'bg-slate-200 text-slate-900'
                  ]"
                  style="font-size: 11px; height: 20px; line-height: 20px;"
                >
                  {{ currentStatus === 'diajukan' ? 'DIAJUKAN' : currentStatus === 'disetujui' ? 'DISETUJUI' : currentStatus === 'ditolak' ? 'DITOLAK' : 'DRAFT' }}
                </span>
              </div>
              <div class="text-body2 text-md-subtitle1 text-slate-700 q-mt-sm text-weight-medium">
                {{ selectedProjectData?.nama }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="row justify-end q-col-gutter-sm">
            <div class="col-6 col-sm-auto">
              <q-btn
                unelevated
                label="AJUKAN"
                :loading="submitting"
                :disable="loadingDetails || currentStatus === 'disetujui'"
                class="full-width q-px-lg neo-btn neo-btn-orange btn-header-action"
                @click="submitAttendance"
              />
            </div>
            <div class="col-6 col-sm-auto">
              <q-btn
                unelevated
                label="SIMPAN ABSENSI"
                :loading="saving"
                :disable="loadingDetails || currentStatus === 'disetujui'"
                class="full-width q-px-lg neo-btn neo-btn-primary btn-header-action"
                @click="saveAttendance"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- CONTROL PANEL (DATE PICKER & GENERATE BUTTONS) -->
      <q-card flat class="control-panel-card neo-card">
        <q-card-section class="q-py-md">
          <div class="row q-col-gutter-md items-center justify-between">
            <!-- DATE PICKER -->
            <div class="col-12 col-sm-4 col-md-3">
              <q-input
                v-model="displaySelectedDate"
                outlined
                dense
                readonly
                label="Tanggal Kehadiran"
                bg-color="white"
                class="rounded-input cursor-pointer"
                input-class="cursor-pointer"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="slate-900" class="cursor-pointer" />
                </template>
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale" style="min-width: auto" content-style="width: 290px;">
                  <q-date v-model="selectedDate" mask="YYYY-MM-DD" @update:model-value="onDateChange">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-input>
            </div>

            <!-- DEFAULT JAM MASUK -->
            <div class="col-6 col-sm-4 col-md-2">
              <q-input
                v-model="defaultJamMasuk"
                outlined
                dense
                label="Jam Masuk Default"
                bg-color="white"
                class="rounded-input cursor-pointer"
                input-class="text-center cursor-pointer text-weight-bold font-mono"
                readonly
                @click="currentStatus !== 'disetujui' && $refs.defaultMasukProxy.show()"
              >
                <template v-slot:append>
                  <q-icon name="access_time" color="slate-900" class="cursor-pointer">
                    <q-popup-proxy ref="defaultMasukProxy" transition-show="scale" transition-hide="scale">
                      <q-time
                        v-model="defaultJamMasuk"
                        format24h
                        flat
                      >
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Set" color="primary" flat />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <!-- DEFAULT JAM PULANG -->
            <div class="col-6 col-sm-4 col-md-2">
              <q-input
                v-model="defaultJamPulang"
                outlined
                dense
                label="Jam Pulang Default"
                bg-color="white"
                class="rounded-input cursor-pointer"
                input-class="text-center cursor-pointer text-weight-bold font-mono"
                readonly
                @click="currentStatus !== 'disetujui' && $refs.defaultPulangProxy.show()"
              >
                <template v-slot:append>
                  <q-icon name="access_time" color="slate-900" class="cursor-pointer">
                    <q-popup-proxy ref="defaultPulangProxy" transition-show="scale" transition-hide="scale">
                      <q-time
                        v-model="defaultJamPulang"
                        format24h
                        flat
                      >
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Set" color="primary" flat />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <!-- GENERATE BUTTONS -->
            <div class="col-12 col-md-5 row q-col-gutter-sm items-center justify-center justify-md-end q-mt-sm q-mt-md-none">
              <div class="col-6 col-sm-auto">
                <q-btn
                  unelevated
                  icon="done_all"
                  label="Hadir Semua"
                  no-caps
                  :disable="currentStatus === 'disetujui'"
                  class="full-width neo-btn neo-btn-primary action-btn"
                  @click="generateAll('hadir')"
                />
              </div>
              <div class="col-6 col-sm-auto">
                <q-btn
                  unelevated
                  icon="close"
                  label="Tidak Hadir Semua"
                  no-caps
                  :disable="currentStatus === 'disetujui'"
                  class="full-width neo-btn neo-btn-danger action-btn"
                  @click="generateAll('alpha')"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- DETAIL MANDOR & PEKERJA -->
      <div v-if="loadingDetails" class="flex flex-center q-pa-xl bg-white neo-card">
        <q-spinner-orbit color="slate-900" size="48px" />
        <div class="text-subtitle2 text-slate-800 q-ml-md">Memuat log kehadiran...</div>
      </div>

      <div v-else-if="mandors.length === 0" class="text-center q-pa-xl bg-white neo-card">
        <q-icon name="group_off" size="4em" color="slate-600" />
        <div class="text-slate-700 text-subtitle1 q-mt-md">
          Belum ada kelompok mandor terdaftar di proyek ini. Silakan buat kelompok terlebih dahulu di menu Kelola Pekerja & Mandor.
        </div>
      </div>

      <div v-else class="q-gutter-y-lg">
        <div v-for="(m, mi) in mandors" :key="m.id" class="mandor-card-wrapper">
          <q-card flat class="neo-card overflow-hidden">
            <!-- Header Mandor -->
            <div class="bg-slate-100 q-pa-md row items-center justify-between border-bottom mandor-header-row">
              <div class="row items-center no-wrap">
                <q-avatar
                  size="40px"
                  color="slate-900"
                  text-color="white"
                  class="q-mr-md text-weight-bold shadow-sm flex-shrink-0"
                >
                  {{ mi + 1 }}
                </q-avatar>
                <div>
                  <div class="text-subtitle1 text-weight-bold text-slate-900 uppercase">
                    {{ m.nama }}
                  </div>
                  <div class="text-caption text-slate-700">
                    BIDANG: <span class="text-weight-bold text-slate-800">{{ (m.bidang || 'Umum').toUpperCase() }}</span>
                    <template v-if="m.spk_nama_kontrak">
                      <span class="q-mx-xs">•</span>
                      <span class="text-slate-900 text-weight-bold">{{ m.spk_nama_kontrak }}</span>
                    </template>
                  </div>
                </div>
              </div>

              <!-- MANDOR OWN ATTENDANCE BUTTONS & GROUP PHOTO -->
              <div class="row items-center no-wrap q-gutter-x-sm">
                <q-btn
                  v-if="!getMandorFotoBersama(m.id)"
                  no-caps
                  size="sm"
                  class="neo-btn neo-btn-secondary text-weight-bold q-px-sm"
                  icon="groups"
                  label="Foto Bersama"
                  @click="openPhotoCapture(m.id, '_group', `Grup Mandor ${m.nama}`)"
                />
                <q-btn
                  v-else
                  unelevated
                  no-caps
                  size="sm"
                  class="neo-btn neo-btn-primary text-weight-bold q-px-sm"
                  icon="groups"
                  label="Foto Bersama (Ada)"
                  @click="openPhotoCapture(m.id, '_group', `Grup Mandor ${m.nama}`)"
                />
                
                <div class="row items-center no-wrap q-gutter-x-xs bg-white q-pa-xs border-thick">
                  <span class="text-caption text-weight-bold text-slate-700 q-mr-sm q-pl-xs">ABSENSI MANDOR:</span>
                  <q-btn
                    label="Hadir"
                    size="sm"
                    unelevated
                    no-caps
                    :disable="currentStatus === 'disetujui'"
                    :color="getMandorStatus(m.id) === 'hadir' ? 'slate-900' : 'grey-2'"
                    :text-color="getMandorStatus(m.id) === 'hadir' ? 'white' : 'slate-800'"
                    class="rounded-8 text-weight-bold"
                    @click="setMandorStatus(m.id, 'hadir')"
                  />
                  <q-btn
                    label="Tidak Hadir"
                    size="sm"
                    unelevated
                    no-caps
                    :disable="currentStatus === 'disetujui'"
                    :color="getMandorStatus(m.id) === 'alpha' ? 'red-5' : 'grey-2'"
                    :text-color="getMandorStatus(m.id) === 'alpha' ? 'white' : 'slate-800'"
                    class="rounded-8 text-weight-bold"
                    @click="setMandorStatus(m.id, 'alpha')"
                  />
                </div>
              </div>
            </div>

            <!-- Table View for Desktop -->
            <q-card-section class="q-pa-none">
              <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
                <table class="abs-tbl">
                  <thead>
                    <tr class="bg-slate-100">
                      <th style="width: 40px" class="text-center text-weight-bold font-11 tracking-widest">#</th>
                      <th class="text-left text-weight-bold font-11 tracking-widest">NAMA PEKERJA</th>
                      <th class="text-center text-weight-bold font-11 tracking-widest">JABATAN</th>
                      <th class="text-center text-weight-bold font-11 tracking-widest">KOEF.</th>
                      <th class="text-center text-weight-bold font-11 tracking-widest" style="width: 140px;">JAM MASUK</th>
                      <th class="text-center text-weight-bold font-11 tracking-widest" style="width: 140px;">JAM PULANG</th>
                      <th class="text-center text-weight-bold font-11 tracking-widest" style="width: 110px;">LEMBUR (JAM)</th>
                      <th class="text-center text-weight-bold font-11 tracking-widest" style="width: 80px;">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(p, pi) in m.pekerja" :key="p.id">
                      <td class="text-center text-slate-600 text-weight-bold font-mono">
                        {{ pi + 1 }}
                      </td>
                      <td class="text-weight-bold text-slate-900 uppercase">
                        <div class="row items-center no-wrap">
                          <q-avatar size="28px" color="slate-200" text-color="slate-900" class="q-mr-sm text-weight-bold font-10">
                            {{ p.nama.substring(0, 2).toUpperCase() }}
                          </q-avatar>
                          <span>{{ p.nama }}</span>
                        </div>
                      </td>
                      <td class="text-center">
                        <span class="neo-badge bg-sky-1 text-slate-900">{{ p.jabatan || 'Tukang' }}</span>
                      </td>
                      <td class="text-center text-weight-bold text-amber-9 font-mono">
                        {{ (p.koef || 1.0).toFixed(2) }}x
                      </td>
                      <td class="text-center">
                        <q-input
                          :model-value="getWorkerJamMasuk(m.id, p.id)"
                          @update:model-value="val => setWorkerJamMasuk(m.id, p.id, val)"
                          outlined
                          dense
                          placeholder="--:--"
                          bg-color="white"
                          :disable="currentStatus === 'disetujui'"
                          class="rounded-input time-picker-input cursor-pointer"
                          input-class="text-center cursor-pointer text-weight-bold font-mono"
                          readonly
                          @click="!loadingDetails && currentStatus !== 'disetujui' && $refs['masukProxy_' + m.id + '_' + p.id][0].show()"
                        >
                          <template v-slot:append>
                            <q-icon name="access_time" color="slate-900" class="cursor-pointer">
                              <q-popup-proxy :ref="'masukProxy_' + m.id + '_' + p.id" transition-show="scale" transition-hide="scale">
                                <q-time
                                  :model-value="getWorkerJamMasuk(m.id, p.id) || defaultJamMasuk"
                                  @update:model-value="val => { setWorkerJamMasuk(m.id, p.id, val); $refs['masukProxy_' + m.id + '_' + p.id][0].hide(); }"
                                  format24h
                                  flat
                                >
                                  <div class="row items-center justify-between q-gutter-x-sm">
                                    <q-btn label="Clear" color="negative" flat @click="setWorkerJamMasuk(m.id, p.id, ''); $refs['masukProxy_' + m.id + '_' + p.id][0].hide();" />
                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                  </div>
                                </q-time>
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                      </td>
                      <td class="text-center">
                        <q-input
                          :model-value="getWorkerJamPulang(m.id, p.id)"
                          @update:model-value="val => setWorkerJamPulang(m.id, p.id, val)"
                          outlined
                          dense
                          placeholder="--:--"
                          bg-color="white"
                          :disable="currentStatus === 'disetujui'"
                          class="rounded-input time-picker-input cursor-pointer"
                          input-class="text-center cursor-pointer text-weight-bold font-mono"
                          readonly
                          @click="!loadingDetails && currentStatus !== 'disetujui' && $refs['pulangProxy_' + m.id + '_' + p.id][0].show()"
                        >
                          <template v-slot:append>
                            <q-icon name="access_time" color="slate-900" class="cursor-pointer">
                              <q-popup-proxy :ref="'pulangProxy_' + m.id + '_' + p.id" transition-show="scale" transition-hide="scale">
                                <q-time
                                  :model-value="getWorkerJamPulang(m.id, p.id) || defaultJamPulang"
                                  @update:model-value="val => { setWorkerJamPulang(m.id, p.id, val); $refs['pulangProxy_' + m.id + '_' + p.id][0].hide(); }"
                                  format24h
                                  flat
                                >
                                  <div class="row items-center justify-between q-gutter-x-sm">
                                    <q-btn label="Clear" color="negative" flat @click="setWorkerJamPulang(m.id, p.id, ''); $refs['pulangProxy_' + m.id + '_' + p.id][0].hide();" />
                                    <q-btn v-close-popup label="Close" color="primary" flat />
                                  </div>
                                </q-time>
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                      </td>
                      <td class="text-center">
                        <q-input
                          :model-value="getWorkerLembur(m.id, p.id)"
                          @update:model-value="val => setWorkerLembur(m.id, p.id, val)"
                          type="number"
                          outlined
                          dense
                          min="0"
                          :disable="currentStatus === 'disetujui'"
                          class="rounded-input lembur-input-box"
                          input-class="text-center font-mono text-weight-bold"
                        />
                      </td>
                      <td class="text-center">
                        <q-btn
                          v-if="!getWorkerFoto(m.id, p.id)"
                          class="neo-btn neo-btn-secondary"
                          icon="photo_camera"
                          size="sm"
                          @click="openPhotoCapture(m.id, p.id, p.nama)"
                        >
                          <q-tooltip>Ambil Foto Bukti</q-tooltip>
                        </q-btn>
                        <q-btn
                          v-else
                          unelevated
                          class="neo-btn neo-btn-primary"
                          icon="photo"
                          size="sm"
                          @click="openPhotoCapture(m.id, p.id, p.nama)"
                        >
                          <q-tooltip>Lihat / Ubah Foto Bukti</q-tooltip>
                        </q-btn>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- ======================================================================= -->
    <!-- DIALOG: AMBIL FOTO BUKTI DENGAN WATERMARK                               -->
    <!-- ======================================================================= -->
    <q-dialog v-model="showPhotoDialog" persistent>
      <q-card class="neo-card overflow-hidden font-inter" style="width: 480px; max-width: 95vw;">
        <!-- Card Header -->
        <q-card-section class="bg-slate-900 text-white row items-center justify-between q-py-md">
          <div class="row items-center">
            <q-icon name="photo_camera" size="20px" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-bolder uppercase tracking-wide">
              {{ photoDialogContext.pekerjaId === '_group' ? 'Foto Bersama Mandor' : 'Foto Bukti Pekerja' }}
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            color="white"
            v-close-popup
            @click="stopCamera"
          />
        </q-card-section>

        <!-- Card Body -->
        <q-card-section class="q-pa-lg relative-position">
          <div class="text-weight-bold text-slate-900 text-subtitle2 q-mb-md text-center uppercase">
            {{ photoDialogContext.title }}
          </div>

          <!-- Video Stream or Photo Preview -->
          <div class="relative-position overflow-hidden rounded-16 bg-slate-900 flex flex-center shadow-inner" style="min-height: 260px; max-height: 320px;">
            <!-- New Photo Preview -->
            <q-img
              v-if="photoDialogPreview"
              :src="photoDialogPreview"
              class="absolute-full"
              fit="contain"
            />

            <!-- Live Camera Video -->
            <video
              v-else-if="cameraActive"
              ref="videoEl"
              autoplay
              playsinline
              class="absolute-full"
              :style="{ transform: activeCameraFacing === 'user' ? 'scaleX(-1)' : 'none', objectFit: 'cover' }"
            />

            <!-- Camera Inactive Placeholder -->
            <div v-else class="text-center q-pa-xl text-blue-grey-3">
              <q-icon name="camera_alt" size="4em" class="q-mb-sm opacity-40" />
              <div class="text-weight-bold text-subtitle2 opacity-80">Kamera Belum Aktif</div>
              <div class="text-caption opacity-60">Silakan aktifkan kamera atau pilih file foto.</div>
            </div>

            <!-- Loading Spinner -->
            <q-inner-loading :showing="photoDialogLoading" color="slate-900">
              <q-spinner-dots size="40px" color="slate-900" />
              <div class="text-slate-900 q-mt-sm text-weight-bold font-inter text-caption">Memproses Watermark...</div>
            </q-inner-loading>
          </div>

          <!-- GPS Information Panel (Small Badge) -->
          <div class="q-mt-sm row items-center justify-between text-caption text-slate-700 q-px-xs">
            <div class="row items-center">
              <q-icon name="place" color="slate-900" size="14px" class="q-mr-xs" />
              <span class="text-weight-bold">{{ locationData.lat !== '0.0000' ? `${locationData.lat}, ${locationData.lng}` : 'Melacak GPS...' }}</span>
            </div>
            <div class="ellipsis max-w-200 text-weight-medium">
              {{ locationData.address || 'Mengambil alamat...' }}
            </div>
          </div>
        </q-card-section>

        <!-- Card Actions -->
        <q-card-actions align="center" class="q-px-lg q-pb-lg q-pt-none q-col-gutter-sm">
          <!-- Active Camera Controls -->
          <template v-if="cameraActive && !photoDialogPreview">
            <div class="col-6">
              <q-btn
                unelevated
                icon="photo_camera"
                label="Ambil Foto"
                class="full-width neo-btn neo-btn-primary q-py-sm"
                no-caps
                @click="captureFromVideo"
              />
            </div>
            <div class="col-3">
              <q-btn
                outline
                icon="switch_camera"
                class="full-width neo-btn neo-btn-secondary q-py-sm"
                @click="toggleCameraFacing"
              >
                <q-tooltip>Ganti Kamera</q-tooltip>
              </q-btn>
            </div>
            <div class="col-3">
              <q-btn
                outline
                icon="videocam_off"
                class="full-width neo-btn neo-btn-danger q-py-sm"
                @click="stopCamera"
              >
                <q-tooltip>Matikan Kamera</q-tooltip>
              </q-btn>
            </div>
          </template>

          <!-- Captured Photo Actions -->
          <template v-else-if="photoDialogPreview">
            <div class="col-6">
              <q-btn
                unelevated
                icon="done"
                label="Simpan Foto"
                class="full-width neo-btn neo-btn-primary q-py-sm"
                no-caps
                :loading="photoDialogLoading"
                @click="saveCapturedPhoto"
              />
            </div>
            <div class="col-6">
              <q-btn
                outline
                icon="refresh"
                label="Ambil Ulang"
                class="full-width neo-btn neo-btn-secondary q-py-sm"
                no-caps
                :disabled="photoDialogLoading"
                @click="photoDialogPreview = null; startCamera();"
              />
            </div>
          </template>

          <!-- Inactive Camera Controls -->
          <template v-else>
            <div class="col-6">
              <q-btn
                unelevated
                icon="videocam"
                label="Aktifkan Kamera"
                class="full-width neo-btn neo-btn-primary q-py-sm"
                no-caps
                @click="startCamera"
              />
            </div>
            <div class="col-6">
              <q-btn
                outline
                icon="file_upload"
                label="Pilih File Foto"
                class="full-width neo-btn neo-btn-secondary q-py-sm"
                no-caps
                @click="$refs.fileInputRef.click()"
              />
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                style="display: none;"
                @change="onFileSelected"
              />
            </div>
          </template>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { db, storage } from 'src/boot/firebase'
import { useQuasar, date } from 'quasar'
import {
  collection,
  query,
  where,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore'
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage'

const $q = useQuasar()

// --- State Ringkasan Proyek ---
const filterProyek = ref('')
const proyekList = ref([])
const loadingProyek = ref(true)
let unsubProyek = null

const proyekColumns = [
  { name: 'no', align: 'center', label: 'NO', field: 'id', style: 'width: 60px' },
  { name: 'nama', align: 'left', label: 'NAMA PROYEK & KLIEN', field: 'nama', sortable: true },
  { name: 'alamat', align: 'left', label: 'LOKASI PROYEK', field: 'alamat', sortable: true },
  { name: 'status', align: 'center', label: 'STATUS', field: 'id' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]

// --- State Detail Absensi Proyek ---
const selectedProjectId = ref('')
const selectedProjectData = ref(null)
const selectedDate = ref(date.formatDate(new Date(), 'YYYY-MM-DD'))
const mandors = ref([])
const localAttendance = ref({})
const currentStatus = ref('')
const defaultJamMasuk = ref('08:00')
const defaultJamPulang = ref('17:00')
const loadingDetails = ref(false)
const saving = ref(false)
const submitting = ref(false)
let unsubMandors = null

// --- State & Logika Bukti Foto, Watermark & GPS ---
const locationData = ref({
  lat: '0.0000',
  lng: '0.0000',
  address: '',
})

const getAddressName = async (lat, lng) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
    const d = await res.json()
    locationData.value.address = d.display_name.split(',').slice(0, 4).join(', ')
  } catch {
    locationData.value.address = 'Gagal memuat koordinat jalan'
  }
}

const detectLocation = () => {
  if (!navigator.geolocation) {
    locationData.value.address = 'GPS tidak didukung oleh browser'
    return
  }
  navigator.geolocation.getCurrentPosition(
    async (p) => {
      locationData.value.lat = p.coords.latitude.toFixed(5)
      locationData.value.lng = p.coords.longitude.toFixed(5)
      await getAddressName(p.coords.latitude, p.coords.longitude)
    },
    (err) => {
      console.warn('Gagal mendapatkan lokasi:', err)
      locationData.value.address = 'Akses lokasi tidak diizinkan'
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
  )
}

// Dialog Kamera & Upload State
const showPhotoDialog = ref(false)
const photoDialogContext = ref({ mandorId: '', pekerjaId: '', title: '' })
const videoEl = ref(null)
const mediaStream = ref(null)
const activeCameraFacing = ref('environment') // 'user' or 'environment'
const photoDialogLoading = ref(false)
const photoDialogPreview = ref(null) // base64 watermarked image preview
const cameraActive = ref(false)

const startCamera = async () => {
  if (mediaStream.value) {
    stopCamera()
  }
  try {
    const constraints = {
      video: {
        facingMode: activeCameraFacing.value
      }
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    mediaStream.value = stream
    cameraActive.value = true
    setTimeout(() => {
      if (videoEl.value) {
        videoEl.value.srcObject = stream
      }
    }, 100)
  } catch (err) {
    console.error('Gagal membuka kamera:', err)
    $q.notify({
      type: 'negative',
      message: 'Kamera tidak dapat diakses. Gunakan pilihan file fallback.',
      position: 'top'
    })
    cameraActive.value = false
  }
}

const toggleCameraFacing = async () => {
  activeCameraFacing.value = activeCameraFacing.value === 'user' ? 'environment' : 'user'
  if (cameraActive.value) {
    await startCamera()
  }
}

const stopCamera = () => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop())
    mediaStream.value = null
  }
  cameraActive.value = false
}

// Watermark logic
const resizeImage = (base64Image, maxWidth = 640) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = base64Image
    img.onload = () => {
      if (img.width <= maxWidth) {
        resolve(base64Image)
        return
      }
      const canvas = document.createElement('canvas')
      const scale = maxWidth / img.width
      canvas.width = maxWidth
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
  })
}

const applyWatermark = (base64Image, label = 'ABSENSI HARIAN LEPAS') => {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = base64Image
    img.onload = () => {
      const wCanvas = document.createElement('canvas')
      wCanvas.width = img.width
      wCanvas.height = img.height
      const ctx = wCanvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const padding = Math.max(12, img.width * 0.035)
      const watermarkHeight = img.height * 0.2
      const startY = img.height - watermarkHeight
      const grad = ctx.createLinearGradient(0, startY, 0, img.height)
      grad.addColorStop(0, 'rgba(0,0,0,0)')
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.75)')
      ctx.fillStyle = grad
      ctx.fillRect(0, startY, img.width, watermarkHeight)
      
      const mapSize = Math.max(55, img.height * 0.13)
      const mapX = padding
      const mapY = img.height - mapSize - padding
      ctx.save()
      ctx.shadowColor = 'rgba(0,0,0,0.4)'
      ctx.shadowBlur = 6
      ctx.fillStyle = '#e2e8f0'
      ctx.beginPath()
      ctx.arc(mapX + mapSize / 2, mapY + mapSize / 2, mapSize / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(mapX + mapSize / 2, mapY + mapSize / 2, mapSize / 3, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(mapX, mapY + mapSize / 2)
      ctx.lineTo(mapX + mapSize, mapY + mapSize / 2)
      ctx.moveTo(mapX + mapSize / 2, mapY)
      ctx.lineTo(mapX + mapSize / 2, mapY + mapSize)
      ctx.stroke()
      
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(mapX + mapSize / 2, mapY + mapSize / 2, 4, 0, Math.PI * 2)
      ctx.fill()

      const textX = mapX + mapSize + 15
      let textY = mapY - 4
      const fontSize = Math.max(10, Math.floor(img.width * 0.028))
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1
      ctx.font = `bold ${fontSize}px sans-serif`
      ctx.fillText(date.formatDate(new Date(), 'DD MMM YYYY HH.mm.ss'), textX, textY)
      textY += fontSize + 4
      
      ctx.font = `${fontSize - 1}px sans-serif`
      ctx.fillText(
        selectedProjectData.value?.nama || 'PT AGRA ABHINAYA PERKASA',
        textX,
        textY
      )
      textY += fontSize + 3
      
      ctx.font = `${fontSize - 2}px sans-serif`
      const addrParts = locationData.value.address
        ? locationData.value.address.split(',')
        : ['Deltamas', 'Bekasi']
      ctx.fillText((addrParts[0] || '').trim(), textX, textY)
      textY += fontSize + 2
      
      ctx.font = `italic ${fontSize - 2}px sans-serif`
      ctx.fillText(
        `GPS: ${locationData.value.lat}, ${locationData.value.lng} (${label})`,
        textX,
        textY
      )
      resolve(wCanvas.toDataURL('image/jpeg', 0.9))
    }
  })
}

const processFileAndWatermark = async (base64Image) => {
  photoDialogLoading.value = true
  try {
    detectLocation()
    const resized = await resizeImage(base64Image, 640)
    const label = photoDialogContext.value.pekerjaId === '_group' ? 'FOTO BERSAMA HARIAN' : 'BUKTI ABSENSI HARIAN'
    const watermarked = await applyWatermark(resized, label)
    photoDialogPreview.value = watermarked
  } catch (err) {
    console.error('Gagal memproses watermark:', err)
  } finally {
    photoDialogLoading.value = false
  }
}

const onFileSelected = (ev) => {
  const file = ev.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (e) => {
    await processFileAndWatermark(e.target.result)
  }
  reader.readAsDataURL(file)
}

const captureFromVideo = async () => {
  if (!videoEl.value || !cameraActive.value) return
  const canvas = document.createElement('canvas')
  canvas.width = videoEl.value.videoWidth
  canvas.height = videoEl.value.videoHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(videoEl.value, 0, 0)
  const rawBase64 = canvas.toDataURL('image/jpeg')
  stopCamera()
  await processFileAndWatermark(rawBase64)
}

const uploadPhotoToStorage = async (base64Image, filename) => {
  const fRef = storageRef(storage, `absensi_harian_lepas/${filename}_${Date.now()}.jpg`)
  await uploadString(fRef, base64Image, 'data_url')
  return await getDownloadURL(fRef)
}

const openPhotoCapture = (mandorId, pekerjaId, title) => {
  photoDialogContext.value = { mandorId, pekerjaId, title }
  photoDialogPreview.value = null
  showPhotoDialog.value = true
  detectLocation()
  
  let existingFoto = ''
  if (pekerjaId === '_group') {
    existingFoto = getMandorFotoBersama(mandorId)
  } else {
    existingFoto = getWorkerFoto(mandorId, pekerjaId)
  }
  if (existingFoto) {
    photoDialogPreview.value = existingFoto
  }
}

const saveCapturedPhoto = async () => {
  if (!photoDialogPreview.value) return
  photoDialogLoading.value = true
  try {
    const ctx = photoDialogContext.value
    let finalUrl = photoDialogPreview.value
    
    if (finalUrl.startsWith('data:image')) {
      const filename = ctx.pekerjaId === '_group'
        ? `group_${ctx.mandorId}`
        : `worker_${ctx.mandorId}_${ctx.pekerjaId}`
      finalUrl = await uploadPhotoToStorage(finalUrl, filename)
    }
    
    if (ctx.pekerjaId === '_group') {
      setMandorFotoBersama(ctx.mandorId, finalUrl)
    } else {
      setWorkerFoto(ctx.mandorId, ctx.pekerjaId, finalUrl)
    }
    
    $q.notify({
      type: 'positive',
      message: 'Foto bukti berhasil disimpan!',
      position: 'top'
    })
    showPhotoDialog.value = false
    stopCamera()
  } catch (err) {
    console.error('Gagal mengunggah foto:', err)
    $q.notify({
      type: 'negative',
      message: 'Gagal mengunggah foto: ' + err.message,
      position: 'top'
    })
  } finally {
    photoDialogLoading.value = false
  }
}

const getWorkerFoto = (mandorId, pekerjaId) => {
  return localAttendance.value?.[mandorId]?.[pekerjaId]?.foto || ''
}

const setWorkerFoto = (mandorId, pekerjaId, val) => {
  if (!localAttendance.value[mandorId]) {
    localAttendance.value[mandorId] = {}
  }
  if (!localAttendance.value[mandorId][pekerjaId]) {
    localAttendance.value[mandorId][pekerjaId] = {
      status: 'hadir',
      lembur: 0,
      potongan: 0,
      keterangan: '',
      jamMasuk: defaultJamMasuk.value,
      jamPulang: defaultJamPulang.value,
    }
  }
  localAttendance.value[mandorId][pekerjaId].foto = val
}

const getMandorFotoBersama = (mandorId) => {
  return localAttendance.value?.[mandorId]?._self?.fotoBersama || ''
}

const setMandorFotoBersama = (mandorId, val) => {
  if (!localAttendance.value[mandorId]) {
    localAttendance.value[mandorId] = {}
  }
  if (!localAttendance.value[mandorId]._self) {
    localAttendance.value[mandorId]._self = { status: 'hadir' }
  }
  localAttendance.value[mandorId]._self.fotoBersama = val
}

const qDateProxy = ref(null)

const onDateChange = () => {
  qDateProxy.value?.hide()
  loadAttendance()
}

// ============================================================================
// DATA LOADERS
// ============================================================================
const fetchProyekList = () => {
  loadingProyek.value = true
  const q = query(collection(db, 'proyek'), orderBy('createdAt', 'desc'))
  unsubProyek = onSnapshot(
    q,
    (snap) => {
      proyekList.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loadingProyek.value = false
    },
    (err) => {
      console.error('Error penarikan master proyek:', err)
      loadingProyek.value = false
    }
  )
}

const loadAttendance = async () => {
  if (!selectedProjectId.value || !selectedDate.value) return
  loadingDetails.value = true
  
  // Clear state synchronously to prevent date bleed bug
  localAttendance.value = {}
  currentStatus.value = ''
  
  const idAbsen = `${selectedProjectId.value}_${selectedDate.value}`
  try {
    const snap = await getDoc(doc(db, 'harian_lepas_absen', idAbsen))
    if (snap.exists()) {
      const data = snap.data()
      localAttendance.value = data.absen || {}
      currentStatus.value = data.status || 'draft'
      
      // Migrate old data or ensure defaults on load
      Object.keys(localAttendance.value).forEach(mandorId => {
        if (mandorId === '_self') return
        const group = localAttendance.value[mandorId]
        if (typeof group !== 'object') return
        Object.keys(group).forEach(pekerjaId => {
          if (pekerjaId === '_self') return
          const pData = group[pekerjaId]
          if (pData.status === 'hadir') {
            if (!pData.jamMasuk) pData.jamMasuk = defaultJamMasuk.value
            if (!pData.jamPulang) pData.jamPulang = defaultJamPulang.value
          }
        })
      })
    } else {
      localAttendance.value = {}
      currentStatus.value = 'draft'
    }
  } catch (err) {
    console.error('Error load attendance:', err)
    $q.notify({ type: 'negative', message: 'Gagal memuat data absensi' })
  } finally {
    loadingDetails.value = false
  }
}

// ============================================================================
// ACTIONS
// ============================================================================
const selectProject = (proyek) => {
  selectedProjectId.value = proyek.id
  selectedProjectData.value = proyek
  
  // Real-time listener for mandors in the project
  const q = query(
    collection(db, 'harian_lepas_mandor'),
    where('projectId', '==', proyek.id)
  )
  unsubMandors = onSnapshot(
    q,
    (snap) => {
      mandors.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    },
    (err) => {
      console.error('Error penarikan data mandor proyek:', err)
    }
  )
  loadAttendance()
}

const deselectProject = () => {
  if (unsubMandors) {
    unsubMandors()
    unsubMandors = null
  }
  selectedProjectId.value = ''
  selectedProjectData.value = null
  localAttendance.value = {}
}


const getWorkerJamMasuk = (mandorId, pekerjaId) => {
  return localAttendance.value?.[mandorId]?.[pekerjaId]?.jamMasuk || ''
}

const setWorkerJamMasuk = (mandorId, pekerjaId, val) => {
  if (!localAttendance.value[mandorId]) {
    localAttendance.value[mandorId] = {}
  }
  if (!localAttendance.value[mandorId][pekerjaId]) {
    localAttendance.value[mandorId][pekerjaId] = {
      status: 'hadir',
      lembur: 0,
      potongan: 0,
      keterangan: '',
    }
  }
  localAttendance.value[mandorId][pekerjaId].jamMasuk = val
  updateWorkerStatusBasedOnTimes(mandorId, pekerjaId)
}

const getWorkerJamPulang = (mandorId, pekerjaId) => {
  return localAttendance.value?.[mandorId]?.[pekerjaId]?.jamPulang || ''
}

const setWorkerJamPulang = (mandorId, pekerjaId, val) => {
  if (!localAttendance.value[mandorId]) {
    localAttendance.value[mandorId] = {}
  }
  if (!localAttendance.value[mandorId][pekerjaId]) {
    localAttendance.value[mandorId][pekerjaId] = {
      status: 'hadir',
      lembur: 0,
      potongan: 0,
      keterangan: '',
    }
  }
  localAttendance.value[mandorId][pekerjaId].jamPulang = val
  updateWorkerStatusBasedOnTimes(mandorId, pekerjaId)
}

const updateWorkerStatusBasedOnTimes = (mandorId, pekerjaId) => {
  const w = localAttendance.value[mandorId][pekerjaId]
  if (w.jamMasuk && w.jamPulang) {
    w.status = 'hadir'
  } else {
    w.status = 'alpha'
  }
}

const getWorkerLembur = (mandorId, pekerjaId) => {
  return localAttendance.value?.[mandorId]?.[pekerjaId]?.lembur ?? 0
}

const setWorkerLembur = (mandorId, pekerjaId, val) => {
  if (!localAttendance.value[mandorId]) {
    localAttendance.value[mandorId] = {}
  }
  if (!localAttendance.value[mandorId][pekerjaId]) {
    localAttendance.value[mandorId][pekerjaId] = {
      status: 'hadir',
      lembur: 0,
      potongan: 0,
      keterangan: '',
      jamMasuk: defaultJamMasuk.value,
      jamPulang: defaultJamPulang.value,
    }
  }
  const numericVal = val === '' || val === null || val === undefined ? 0 : Number(val)
  localAttendance.value[mandorId][pekerjaId].lembur = numericVal
}

const getMandorStatus = (mandorId) => {
  return localAttendance.value?.[mandorId]?._self?.status || 'hadir'
}

const setMandorStatus = (mandorId, status) => {
  if (!localAttendance.value[mandorId]) {
    localAttendance.value[mandorId] = {}
  }
  localAttendance.value[mandorId]._self = {
    status,
  }
}

const generateAll = (status) => {
  mandors.value.forEach((m) => {
    setMandorStatus(m.id, status)
    if (m.pekerja && m.pekerja.length > 0) {
      m.pekerja.forEach((p) => {
        if (status === 'hadir') {
          setWorkerJamMasuk(m.id, p.id, defaultJamMasuk.value)
          setWorkerJamPulang(m.id, p.id, defaultJamPulang.value)
          setWorkerLembur(m.id, p.id, 0)
        } else {
          setWorkerJamMasuk(m.id, p.id, '')
          setWorkerJamPulang(m.id, p.id, '')
          setWorkerLembur(m.id, p.id, 0)
        }
      })
    }
  })
  $q.notify({
    type: 'info',
    message: status === 'hadir' 
      ? `Berhasil meratakan jam masuk (${defaultJamMasuk.value}) dan pulang (${defaultJamPulang.value}) untuk semua pekerja`
      : 'Berhasil mengosongkan jam masuk & pulang (Tidak Hadir) untuk semua pekerja',
    position: 'top',
  })
}

const saveAttendance = async () => {
  if (!selectedProjectId.value || !selectedDate.value) return
  saving.value = true
  
  // Ensure default status is set for mandors and workers if not explicitly set
  mandors.value.forEach((m) => {
    if (!localAttendance.value[m.id]) {
      localAttendance.value[m.id] = {}
    }
    if (!localAttendance.value[m.id]._self) {
      localAttendance.value[m.id]._self = { status: 'hadir' }
    }
    if (m.pekerja && m.pekerja.length > 0) {
      m.pekerja.forEach((p) => {
        if (!localAttendance.value[m.id][p.id]) {
          localAttendance.value[m.id][p.id] = {
            status: 'hadir',
            lembur: 0,
            potongan: 0,
            keterangan: '',
            jamMasuk: defaultJamMasuk.value,
            jamPulang: defaultJamPulang.value,
          }
        } else {
          if (localAttendance.value[m.id][p.id].jamMasuk === undefined) {
            localAttendance.value[m.id][p.id].jamMasuk = defaultJamMasuk.value
          }
          if (localAttendance.value[m.id][p.id].jamPulang === undefined) {
            localAttendance.value[m.id][p.id].jamPulang = defaultJamPulang.value
          }
        }
      })
    }
  })

  const idAbsen = `${selectedProjectId.value}_${selectedDate.value}`
  try {
    const nextStatus = currentStatus.value || 'draft'
    await setDoc(doc(db, 'harian_lepas_absen', idAbsen), {
      projectId: selectedProjectId.value,
      projectName: selectedProjectData.value?.nama || '',
      tanggal: selectedDate.value,
      absen: localAttendance.value,
      status: nextStatus,
      updatedAt: serverTimestamp(),
    }, { merge: true })
    currentStatus.value = nextStatus
    $q.notify({
      type: 'positive',
      message: 'Laporan absensi proyek berhasil disimpan!',
      position: 'top',
    })
  } catch (err) {
    console.error('Error save attendance:', err)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan laporan absensi: ' + err.message })
  } finally {
    saving.value = false
  }
}

const submitAttendance = async () => {
  if (!selectedProjectId.value || !selectedDate.value) return
  
  $q.dialog({
    title: 'Ajukan Absensi',
    message: 'Apakah Anda yakin ingin mengajukan laporan absensi harian ini untuk persetujuan?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    submitting.value = true
    
    // Ensure default status is set for mandors and workers if not explicitly set
    mandors.value.forEach((m) => {
      if (!localAttendance.value[m.id]) {
        localAttendance.value[m.id] = {}
      }
      if (!localAttendance.value[m.id]._self) {
        localAttendance.value[m.id]._self = { status: 'hadir' }
      }
      if (m.pekerja && m.pekerja.length > 0) {
        m.pekerja.forEach((p) => {
          if (!localAttendance.value[m.id][p.id]) {
            localAttendance.value[m.id][p.id] = {
              status: 'hadir',
              lembur: 0,
              potongan: 0,
              keterangan: '',
              jamMasuk: defaultJamMasuk.value,
              jamPulang: defaultJamPulang.value,
            }
          } else {
            if (localAttendance.value[m.id][p.id].jamMasuk === undefined) {
              localAttendance.value[m.id][p.id].jamMasuk = defaultJamMasuk.value
            }
            if (localAttendance.value[m.id][p.id].jamPulang === undefined) {
              localAttendance.value[m.id][p.id].jamPulang = defaultJamPulang.value
            }
          }
        })
      }
    })

    const idAbsen = `${selectedProjectId.value}_${selectedDate.value}`
    try {
      await setDoc(doc(db, 'harian_lepas_absen', idAbsen), {
        projectId: selectedProjectId.value,
        projectName: selectedProjectData.value?.nama || '',
        tanggal: selectedDate.value,
        absen: localAttendance.value,
        status: 'diajukan',
        updatedAt: serverTimestamp(),
      }, { merge: true })
      
      currentStatus.value = 'diajukan'
      $q.notify({
        type: 'positive',
        message: 'Laporan absensi proyek berhasil diajukan!',
        position: 'top',
      })
    } catch (err) {
      console.error('Error submit attendance:', err)
      $q.notify({ type: 'negative', message: 'Gagal mengajukan laporan absensi: ' + err.message })
    } finally {
      submitting.value = false
    }
  })
}

// ============================================================================
// COMPUTED / WATCHERS
// ============================================================================
const filteredProyekList = computed(() => {
  const list = [...proyekList.value]
  list.push({
    id: 'proyek-kantor-pusat',
    nama: 'KHUSUS KANTOR',
    konsumen_nama: 'INTERNAL KANTOR',
    alamat: 'Kantor Pusat AGRA',
    isVirtual: true,
  })

  const f = filterProyek.value.toLowerCase().trim()
  if (!f) return list
  return list.filter(
    (p) =>
      (p.nama && p.nama.toLowerCase().includes(f)) ||
      (p.alamat && p.alamat.toLowerCase().includes(f)) ||
      (p.konsumen_nama && p.konsumen_nama.toLowerCase().includes(f))
  )
})

const displaySelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  const parts = selectedDate.value.split('-')
  if (parts.length !== 3) return selectedDate.value
  return `${parts[2]}/${parts[1]}/${parts[0]}` // DD/MM/YYYY
})

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(() => {
  fetchProyekList()
  detectLocation()
})

onUnmounted(() => {
  if (unsubProyek) unsubProyek()
  if (unsubMandors) unsubMandors()
  stopCamera()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap');

.font-inter {
  font-family: 'Inter', -apple-system, sans-serif;
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
  border-bottom: 2px solid #0f172a;
}

/* NEO-BRUTALIST STYLING TOKENS */
.neo-page-bg {
  background-color: #f3f4f6 !important;
  background-image: radial-gradient(#d1d5db 1.5px, transparent 1.5px);
  background-size: 24px 24px;
  min-height: 100vh;
  position: relative;
}

.neo-decorations-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.neo-shape {
  position: absolute;
  opacity: 0.08;
  pointer-events: none;
}

.shape-wobbly-1 {
  width: 300px;
  height: 300px;
  background-color: #3b82f6;
  border-radius: 43% 57% 41% 59% / 57% 46% 54% 43%;
  top: -50px;
  left: -100px;
  animation: drift-slow 25s infinite alternate ease-in-out;
}
.shape-wobbly-2 {
  width: 250px;
  height: 250px;
  background-color: #ec4899;
  border-radius: 50% 50% 30% 70% / 50% 60% 40% 50%;
  bottom: 10%;
  right: -80px;
  animation: drift-slow 20s infinite alternate-reverse ease-in-out;
}
.shape-wobbly-3 {
  width: 180px;
  height: 180px;
  background-color: #f59e0b;
  border-radius: 60% 40% 70% 30% / 50% 50% 50% 50%;
  top: 40%;
  left: -50px;
  animation: drift-slow 30s infinite alternate ease-in-out;
}
.shape-wobbly-4 {
  width: 220px;
  height: 220px;
  background-color: #10b981;
  border-radius: 40% 60% 50% 50% / 40% 50% 50% 60%;
  top: 15%;
  right: 15%;
  animation: drift-slow 22s infinite alternate ease-in-out;
}
.shape-wobbly-5 { width: 140px; height: 140px; background-color: #8b5cf6; border-radius: 35% 65% 55% 45% / 45% 35% 65% 55%; bottom: 25%; left: 10%; animation: drift-slow 28s infinite alternate ease-in-out; }
.shape-wobbly-6 { width: 160px; height: 160px; background-color: #06b6d4; border-radius: 55% 45% 35% 65% / 55% 65% 35% 45%; top: 70%; left: 30%; animation: drift-slow 24s infinite alternate ease-in-out; }
.shape-wobbly-7 { width: 280px; height: 280px; background-color: #f43f5e; border-radius: 65% 35% 45% 55% / 35% 45% 55% 65%; top: 50%; right: 25%; animation: drift-slow 26s infinite alternate ease-in-out; }
.shape-wobbly-8 { width: 200px; height: 200px; background-color: #eab308; border-radius: 45% 55% 65% 35% / 65% 55% 45% 35%; bottom: -50px; right: 20%; animation: drift-slow 23s infinite alternate ease-in-out; }
.shape-wobbly-9 { width: 150px; height: 150px; background-color: #6366f1; border-radius: 50% 50% 50% 50% / 30% 70% 30% 70%; top: -30px; left: 45%; animation: drift-slow 27s infinite alternate ease-in-out; }
.shape-wobbly-10 { width: 170px; height: 170px; background-color: #14b8a6; border-radius: 70% 30% 50% 50% / 50% 50% 70% 30%; bottom: 40%; left: 40%; animation: drift-slow 21s infinite alternate ease-in-out; }
.shape-wobbly-11 { width: 190px; height: 190px; background-color: #a855f7; border-radius: 40% 40% 60% 60% / 60% 60% 40% 40%; top: 30%; left: 70%; animation: drift-slow 29s infinite alternate ease-in-out; }
.shape-wobbly-12 { width: 130px; height: 130px; background-color: #ff007f; border-radius: 30% 70% 30% 70% / 70% 30% 70% 30%; bottom: -30px; left: -30px; animation: drift-slow 19s infinite alternate ease-in-out; }

@keyframes drift-slow {
  0% { transform: translate(0, 0) rotate(0deg) scale(1); }
  100% { transform: translate(40px, 30px) rotate(360deg) scale(1.1); }
}

/* STAGGERED ENTRANCES */
.header-entrance {
  animation: bounceInDown 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}
.table-entrance {
  animation: fadeInUpStagger 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes bounceInDown {
  0% { opacity: 0; transform: translateY(-30px); }
  60% { opacity: 0.9; transform: translateY(5px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInUpStagger {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* NEO BRUTALIST CARD */
.neo-card {
  border: 3px solid #0f172a !important;
  border-radius: 12px !important;
  box-shadow: 6px 6px 0px #0f172a !important;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  background-color: #ffffff;
}
.neo-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 8px 8px 0px #0f172a !important;
}
.neo-card:active {
  transform: translate(2px, 2px);
  box-shadow: 4px 4px 0px #0f172a !important;
}

/* NEO BRUTALIST BUTTON */
.neo-btn {
  border: 3px solid #0f172a !important;
  border-radius: 8px !important;
  box-shadow: 4px 4px 0px #0f172a !important;
  font-weight: 850 !important;
  letter-spacing: 0.5px;
  transition: all 0.15s ease-out;
  text-transform: uppercase;
}
.neo-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 5px 5px 0px #0f172a !important;
}
.neo-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px #0f172a !important;
}
.neo-btn[disabled] {
  opacity: 0.5 !important;
  pointer-events: none !important;
  box-shadow: 2px 2px 0px #0f172a !important;
  transform: none !important;
}

.neo-btn-primary {
  background-color: #1565c0 !important;
  color: #ffffff !important;
}
.neo-btn-primary:hover {
  background-color: #0d47a1 !important;
}
.neo-btn-secondary {
  background-color: #ffffff !important;
  color: #0f172a !important;
}
.neo-btn-secondary:hover {
  background-color: #f1f5f9 !important;
}
.neo-btn-orange {
  background-color: #f97316 !important;
  color: #ffffff !important;
}
.neo-btn-orange:hover {
  background-color: #ea580c !important;
}
.neo-btn-danger {
  background-color: #ef4444 !important;
  color: #ffffff !important;
}
.neo-btn-danger:hover {
  background-color: #dc2626 !important;
}

/* CUSTOM COLOR UTILITIES */
.bg-sky-1 { background-color: #e0f2fe !important; }
.bg-emerald-2 { background-color: #a7f3d0 !important; }
.bg-yellow-3 { background-color: #fde047 !important; }
.bg-red-2 { background-color: #fecaca !important; }

/* NEO BADGE */
.neo-badge {
  background-color: #f1f5f9;
  color: #0f172a;
  border: 2px solid #0f172a;
  border-radius: 6px;
  padding: 4px 8px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* FORM CONTROL OVERRIDES */
.rounded-input :deep(.q-field__control) {
  border: 2.5px solid #0f172a !important;
  border-radius: 8px !important;
  box-shadow: 2.5px 2.5px 0px #0f172a !important;
  transition: all 0.2s ease;
  background-color: #ffffff !important;
}
.rounded-input :deep(.q-field__control):hover {
  transform: translate(-1px, -1px);
  box-shadow: 3.5px 3.5px 0px #0f172a !important;
}
.rounded-input :deep(.q-field--focused .q-field__control) {
  border-color: #0f172a !important;
  transform: translate(-1.5px, -1.5px);
  box-shadow: 4px 4px 0px #0f172a !important;
}
.rounded-input :deep(.q-field__label) {
  color: #475569 !important;
  font-weight: 700 !important;
}

.border-thick {
  border: 2.5px solid #0f172a !important;
  border-radius: 8px !important;
}

/* NEO BRUTALIST FOR Q-TABLE */
.neo-table :deep(table) {
  border-collapse: separate;
  border-spacing: 0;
}
.neo-table :deep(thead tr th) {
  background-color: #f8fafc !important;
  color: #0f172a !important;
  font-weight: 900 !important;
  font-size: 11px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  padding: 14px 16px;
  border-bottom: 3px solid #0f172a !important;
  border-right: 2px solid #0f172a !important;
}
.neo-table :deep(thead tr th:last-child) {
  border-right: none !important;
}
.neo-table :deep(tbody tr td) {
  padding: 14px 16px;
  border-bottom: 2px solid #0f172a !important;
  border-right: 2px solid #0f172a !important;
  color: #0f172a !important;
  font-weight: 700 !important;
  font-size: 13px;
  background-color: #ffffff;
}
.neo-table :deep(tbody tr:last-child td) {
  border-bottom: none !important;
}
.neo-table :deep(tbody tr td:last-child) {
  border-right: none !important;
}
.neo-table :deep(tbody tr:hover td) {
  background-color: #f1f5f9 !important;
}

/* ABS-TBL STYLING */
table.abs-tbl {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 3px solid #0f172a;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 12px;
  background-color: #ffffff;
}
table.abs-tbl th {
  background-color: #f8fafc !important;
  color: #0f172a !important;
  font-weight: 900;
  font-size: 11px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  padding: 12px 16px;
  border-bottom: 3px solid #0f172a;
  border-right: 2px solid #0f172a;
}
table.abs-tbl th:last-child {
  border-right: none;
}
table.abs-tbl td {
  padding: 14px 16px;
  border-bottom: 2px solid #0f172a;
  border-right: 2px solid #0f172a;
  vertical-align: middle;
  color: #0f172a;
  font-weight: 700;
}
table.abs-tbl tr:last-child td {
  border-bottom: none;
}
table.abs-tbl td:last-child {
  border-right: none;
}
table.abs-tbl tr {
  background-color: #ffffff;
  transition: background-color 0.2s ease;
}
table.abs-tbl tr:hover {
  background-color: #f1f5f9;
}

/* BUTTONS & SPACING GAPS */
.action-btn {
  height: 68px;
  min-height: 68px;
  font-size: 11px !important;
  padding: 8px 8px !important;
}
.action-btn :deep(.q-btn__content) {
  flex-direction: column !important;
  justify-content: center;
  align-items: center;
  gap: 4px;
}
.btn-header-action {
  height: 48px;
  min-height: 48px;
  font-size: 12px !important;
  line-height: 1.2;
}

@media (min-width: 600px) {
  .btn-header-action {
    height: 44px;
    min-height: 44px;
    font-size: 13px !important;
  }
  .action-btn {
    height: auto;
    min-height: auto;
    font-size: 13px !important;
    padding: 8px 16px !important;
  }
  .action-btn :deep(.q-btn__content) {
    flex-direction: row !important;
    gap: 8px;
  }
}

.detail-header-row {
  margin-bottom: 16px;
}
.detail-header-col {
  margin-bottom: 12px;
}
.control-panel-card {
  margin-bottom: 16px;
}
.mandor-card-wrapper {
  margin-bottom: 16px;
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
  .control-panel-card {
    margin-bottom: 24px;
  }
  .mandor-card-wrapper {
    margin-bottom: 24px;
  }
}

.time-picker-input {
  max-width: 115px;
  margin: 0 auto;
}
.time-picker-input :deep(.q-field__control) {
  border-radius: 8px;
  height: 36px;
  min-height: 36px;
}
.time-picker-input :deep(.q-field__marginal) {
  height: 36px;
}
.time-picker-input :deep(.q-field__native) {
  padding: 0;
}

.lembur-input-box {
  max-width: 90px;
  margin: 0 auto;
}
.lembur-input-box :deep(.q-field__control) {
  border-radius: 8px;
  height: 36px;
  min-height: 36px;
}
.lembur-input-box :deep(.q-field__native) {
  padding: 0;
}

.premium-container {
  max-width: 1200px;
  width: 100%;
}

/* PRINT MEDIA OVERRIDES */
@media print {
  .no-print,
  .q-header,
  .q-drawer,
  .q-btn,
  .neo-btn,
  .neo-decorations-container,
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
  .neo-card {
    border: 1px solid #000 !important;
    box-shadow: none !important;
    background: #fff !important;
    margin-bottom: 20px !important;
    page-break-inside: avoid;
    transform: none !important;
  }
  .neo-badge {
    border: 1px solid #000 !important;
    background: transparent !important;
    color: #000 !important;
  }
  table.abs-tbl {
    border: 1.5px solid #000 !important;
  }
  table.abs-tbl th, table.abs-tbl td {
    border: 1px solid #000 !important;
    background: transparent !important;
    color: #000 !important;
  }
}
</style>
