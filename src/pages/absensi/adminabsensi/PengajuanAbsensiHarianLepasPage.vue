<template>
  <q-page class="bg-page q-pa-md q-pa-lg font-pro relative-position">
    <!-- ======================================================================= -->
    <!-- VIEW 1: DAFTAR PROYEK AKTIF (RINGKASAN)                                  -->
    <!-- ======================================================================= -->
    <div v-if="!selectedProjectId" class="animate-fade premium-container q-mx-auto page-content-wrapper">
      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-md content-relative">
        <div class="col-12 q-mb-md q-mb-md-none">
          <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
            Pengajuan Absensi Harian Lepas
            <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
              Pilih Proyek Konstruksi Aktif
            </span>
          </div>
          <div class="text-subtitle1 text-grey-7 q-mt-sm">
            Manajemen kehadiran mandor dan pekerja harian lepas proyek secara terpusat.
          </div>
        </div>
      </div>

      <!-- SEARCH & STATS -->
      <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white border-subtle content-relative">
        <q-card-section class="q-py-md">
          <div class="row items-center justify-between q-col-gutter-md">
            <div class="col-12 col-md-4">
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
            </div>

            <div class="col-12 col-md-auto row items-center justify-end q-col-gutter-md q-mt-sm q-mt-md-none">
              <div class="col-12 col-md-auto text-caption text-grey-6 text-weight-medium text-center text-md-right">
                Total Proyek Aktif:
                <span class="text-weight-bold text-brand-primary">{{ proyekList.length }} Entitas</span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- TABLE SECTION -->
      <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white border-subtle content-relative">
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
              <q-td key="no" :props="props" class="text-center font-mono text-grey-6 text-weight-bold" style="width: 60px">
                {{ props.rowIndex + 1 }}
              </q-td>

              <!-- NAMA PROYEK -->
              <q-td key="nama" :props="props">
                <div class="row items-center no-wrap">
                  <q-avatar
                    size="36px"
                    color="brand-light"
                    text-color="brand-primary"
                    class="q-mr-md text-weight-bold font-pro shadow-sm"
                  >
                    {{ props.row.nama.substring(0, 1).toUpperCase() }}
                  </q-avatar>
                  <div>
                    <div class="text-subtitle2 text-weight-bolder text-blue-grey-9 uppercase">
                      {{ props.row.nama }}
                    </div>
                    <div class="text-caption text-grey-5 uppercase">
                      Klien: {{ props.row.konsumen_nama || 'Umum / Internal' }}
                    </div>
                  </div>
                </div>
              </q-td>

              <!-- LOKASI -->
              <q-td key="alamat" :props="props">
                <div class="row items-center no-wrap">
                  <q-icon name="place" color="grey-4" class="q-mr-xs" size="16px" />
                  <span class="text-grey-7 text-weight-medium">{{ props.row.alamat || 'LOKASI BELUM DIATUR' }}</span>
                </div>
              </q-td>

              <!-- STATUS -->
              <q-td key="status" :props="props" class="text-center">
                <q-badge
                  color="brand-light"
                  text-color="brand-primary"
                  class="text-weight-bold q-px-md q-py-xs rounded-6 font-pro text-11"
                >
                  AKTIF
                </q-badge>
              </q-td>

              <!-- AKSI -->
              <q-td key="aksi" :props="props" class="text-center" @click.stop>
                <div class="row justify-center q-gutter-xs">
                  <q-btn
                    flat
                    round
                    color="brand-primary"
                    icon="assignment"
                    size="sm"
                    @click="selectProject(props.row)"
                  >
                    <q-tooltip>Buat Pengajuan Absensi</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="brand-primary"
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
    <div v-else class="animate-fade premium-container q-mx-auto page-content-wrapper">
      <!-- HEADER BAR (VIEW SWITCHER STYLE) -->
      <div class="row items-center justify-between detail-header-row">
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
                <span class="text-h5 text-md-h4 text-weight-bolder text-brand-primary leading-tight uppercase">
                  Detail Absensi Proyek
                </span>
                <q-badge
                  v-if="currentStatus"
                  :color="currentStatus === 'disetujui' ? 'positive' : currentStatus === 'diajukan' ? 'warning' : currentStatus === 'ditolak' ? 'negative' : 'grey-7'"
                  class="text-weight-bold q-px-sm"
                  style="font-size: 11px; height: 20px;"
                >
                  {{ currentStatus === 'diajukan' ? 'DIAJUKAN' : currentStatus === 'disetujui' ? 'DISETUJUI' : currentStatus === 'ditolak' ? 'DITOLAK' : 'DRAFT' }}
                </q-badge>
              </div>
              <div class="text-body2 text-md-subtitle1 text-grey-7 q-mt-sm text-weight-medium">
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
                color="orange-9"
                label="AJUKAN"
                :loading="submitting"
                :disable="loadingDetails || currentStatus === 'disetujui'"
                rounded
                class="full-width q-px-lg text-weight-bold shadow-premium btn-header-action"
                @click="submitAttendance"
              />
            </div>
            <div class="col-6 col-sm-auto">
              <q-btn
                unelevated
                color="brand-primary"
                label="SIMPAN ABSENSI"
                :loading="saving"
                :disable="loadingDetails || currentStatus === 'disetujui'"
                rounded
                class="full-width q-px-lg text-weight-bold shadow-premium btn-header-action"
                @click="saveAttendance"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- CONTROL PANEL (DATE PICKER & GENERATE BUTTONS) -->
      <q-card flat bordered class="control-panel-card shadow-1 rounded-20 bg-white border-subtle">
        <q-card-section class="q-py-md">
          <div class="row q-col-gutter-md items-center justify-between">
            <!-- DATE PICKER -->
            <div class="col-12 col-sm-4 col-md-3">
              <q-input
                v-model="displaySelectedDate"
                outlined
                dense
                rounded
                readonly
                label="Tanggal Kehadiran"
                bg-color="white"
                class="search-input cursor-pointer"
                input-class="cursor-pointer"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="brand-primary" class="cursor-pointer" />
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
                rounded
                label="Jam Masuk Default"
                bg-color="white"
                class="cursor-pointer"
                input-class="text-center cursor-pointer text-weight-bold font-mono"
                readonly
                @click="currentStatus !== 'disetujui' && $refs.defaultMasukProxy.show()"
              >
                <template v-slot:append>
                  <q-icon name="access_time" color="brand-primary" class="cursor-pointer">
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
                rounded
                label="Jam Pulang Default"
                bg-color="white"
                class="cursor-pointer"
                input-class="text-center cursor-pointer text-weight-bold font-mono"
                readonly
                @click="currentStatus !== 'disetujui' && $refs.defaultPulangProxy.show()"
              >
                <template v-slot:append>
                  <q-icon name="access_time" color="brand-primary" class="cursor-pointer">
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
                  color="brand-primary"
                  icon="done_all"
                  label="Hadir Semua"
                  rounded
                  no-caps
                  :disable="currentStatus === 'disetujui'"
                  class="full-width shadow-premium btn-hover text-weight-bold action-btn"
                  @click="generateAll('hadir')"
                />
              </div>
              <div class="col-6 col-sm-auto">
                <q-btn
                  unelevated
                  color="brand-danger"
                  icon="close"
                  label="Tidak Hadir Semua"
                  rounded
                  no-caps
                  :disable="currentStatus === 'disetujui'"
                  class="full-width shadow-premium btn-hover text-weight-bold action-btn"
                  @click="generateAll('alpha')"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- DETAIL MANDOR & PEKERJA -->
      <div v-if="loadingDetails" class="flex flex-center q-pa-xl bg-white rounded-20 border border-subtle">
        <q-spinner-orbit color="brand-primary" size="48px" />
        <div class="text-subtitle2 text-grey-6 q-ml-md">Memuat log kehadiran...</div>
      </div>

      <div v-else-if="mandors.length === 0" class="text-center q-pa-xl bg-white rounded-20 border border-subtle shadow-soft">
        <q-icon name="group_off" size="4em" color="grey-4" />
        <div class="text-grey-6 text-subtitle1 q-mt-md">
          Belum ada kelompok mandor terdaftar di proyek ini. Silakan buat kelompok terlebih dahulu di menu Kelola Pekerja & Mandor.
        </div>
      </div>

      <div v-else class="q-gutter-y-lg">
        <div v-for="(m, mi) in mandors" :key="m.id" class="mandor-card-wrapper">
          <q-card flat bordered class="rounded-20 shadow-1 bg-white border-subtle overflow-hidden">
            <!-- Header Mandor -->
            <div class="bg-brand-light q-pa-md row items-center justify-between border-bottom mandor-header-row">
              <div class="row items-center no-wrap">
                <q-avatar
                  size="40px"
                  color="brand-primary"
                  text-color="white"
                  class="q-mr-md text-weight-bold shadow-sm flex-shrink-0"
                >
                  {{ mi + 1 }}
                </q-avatar>
                <div>
                  <div class="text-subtitle1 text-weight-bold text-blue-grey-10 uppercase">
                    {{ m.nama }}
                  </div>
                  <div class="text-caption text-grey-7">
                    BIDANG: <span class="text-weight-bold text-blue-grey-8">{{ (m.bidang || 'Umum').toUpperCase() }}</span>
                    <template v-if="m.spk_nama_kontrak">
                      <span class="q-mx-xs">•</span>
                      <span class="text-brand-primary text-weight-bold">{{ m.spk_nama_kontrak }}</span>
                    </template>
                  </div>
                </div>
              </div>

              <!-- MANDOR OWN ATTENDANCE BUTTONS & GROUP PHOTO -->
              <div class="row items-center no-wrap q-gutter-x-sm">
                <q-btn
                  v-if="!getMandorFotoBersama(m.id)"
                  outline
                  no-caps
                  size="sm"
                  color="grey-7"
                  class="rounded-8 text-weight-bold q-px-sm bg-white"
                  icon="groups"
                  label="Foto Bersama"
                  @click="openPhotoCapture(m.id, '_group', `Grup Mandor ${m.nama}`)"
                />
                <q-btn
                  v-else
                  unelevated
                  no-caps
                  size="sm"
                  color="brand-primary"
                  text-color="white"
                  class="rounded-8 text-weight-bold q-px-sm shadow-premium"
                  icon="groups"
                  label="Foto Bersama (Ada)"
                  @click="openPhotoCapture(m.id, '_group', `Grup Mandor ${m.nama}`)"
                />
                
                <div class="row items-center no-wrap q-gutter-x-xs bg-white q-pa-xs rounded-12 border border-subtle">
                  <span class="text-caption text-weight-bold text-grey-7 q-mr-sm q-pl-xs">ABSENSI MANDOR:</span>
                  <q-btn
                    label="Hadir"
                    size="sm"
                    unelevated
                    no-caps
                    :disable="currentStatus === 'disetujui'"
                    :color="getMandorStatus(m.id) === 'hadir' ? 'brand-primary' : 'grey-2'"
                    :text-color="getMandorStatus(m.id) === 'hadir' ? 'white' : 'grey-8'"
                    class="rounded-8 text-weight-bold"
                    @click="setMandorStatus(m.id, 'hadir')"
                  />
                  <q-btn
                    label="Tidak Hadir"
                    size="sm"
                    unelevated
                    no-caps
                    :disable="currentStatus === 'disetujui'"
                    :color="getMandorStatus(m.id) === 'alpha' ? 'brand-danger' : 'grey-2'"
                    :text-color="getMandorStatus(m.id) === 'alpha' ? 'white' : 'grey-8'"
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
                    <tr class="bg-slate-50">
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
                      <td class="text-center text-grey-5 text-weight-bold font-mono">
                        {{ pi + 1 }}
                      </td>
                      <td class="text-weight-bold text-blue-grey-9 uppercase">
                        <div class="row items-center no-wrap">
                          <q-avatar size="28px" color="brand-light" text-color="brand-primary" class="q-mr-sm text-weight-bold font-10">
                            {{ p.nama.substring(0, 2).toUpperCase() }}
                          </q-avatar>
                          <span>{{ p.nama }}</span>
                        </div>
                      </td>
                      <td class="text-center">
                        <q-badge
                          color="brand-light"
                          text-color="brand-primary"
                          class="text-weight-bold q-px-sm q-py-xs rounded-6"
                        >
                          {{ p.jabatan || 'Tukang' }}
                        </q-badge>
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
                          rounded
                          placeholder="--:--"
                          bg-color="white"
                          :disable="currentStatus === 'disetujui'"
                          class="time-picker-input cursor-pointer"
                          input-class="text-center cursor-pointer text-weight-bold font-mono"
                          readonly
                          @click="!loadingDetails && currentStatus !== 'disetujui' && $refs['masukProxy_' + m.id + '_' + p.id][0].show()"
                        >
                          <template v-slot:append>
                            <q-icon name="access_time" color="brand-primary" class="cursor-pointer">
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
                          rounded
                          placeholder="--:--"
                          bg-color="white"
                          :disable="currentStatus === 'disetujui'"
                          class="time-picker-input cursor-pointer"
                          input-class="text-center cursor-pointer text-weight-bold font-mono"
                          readonly
                          @click="!loadingDetails && currentStatus !== 'disetujui' && $refs['pulangProxy_' + m.id + '_' + p.id][0].show()"
                        >
                          <template v-slot:append>
                            <q-icon name="access_time" color="brand-primary" class="cursor-pointer">
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
                          rounded
                          min="0"
                          :disable="currentStatus === 'disetujui'"
                          class="lembur-input-box"
                          input-class="text-center font-mono text-weight-bold"
                        />
                      </td>
                      <td class="text-center">
                        <q-btn
                          v-if="!getWorkerFoto(m.id, p.id)"
                          outline
                          color="grey-7"
                          class="rounded-8 bg-white"
                          icon="photo_camera"
                          size="sm"
                          @click="openPhotoCapture(m.id, p.id, p.nama)"
                        >
                          <q-tooltip class="bg-brand-primary">Ambil Foto Bukti</q-tooltip>
                        </q-btn>
                        <q-btn
                          v-else
                          unelevated
                          color="brand-primary"
                          text-color="white"
                          class="rounded-8 shadow-sm"
                          icon="photo"
                          size="sm"
                          @click="openPhotoCapture(m.id, p.id, p.nama)"
                        >
                          <q-tooltip class="bg-brand-primary">Lihat / Ubah Foto Bukti</q-tooltip>
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
      <q-card class="rounded-24 shadow-soft bg-white border-subtle overflow-hidden font-pro" style="width: 480px; max-width: 95vw;">
        <!-- Card Header -->
        <q-card-section class="bg-brand-primary text-white row items-center justify-between q-py-md">
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
          <div class="text-weight-bold text-blue-grey-9 text-subtitle2 q-mb-md text-center uppercase">
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
            <q-inner-loading :showing="photoDialogLoading" color="brand-primary">
              <q-spinner-dots size="40px" color="brand-primary" />
              <div class="text-brand-primary q-mt-sm text-weight-bold font-pro text-caption">Memproses Watermark...</div>
            </q-inner-loading>
          </div>

          <!-- GPS Information Panel (Small Badge) -->
          <div class="q-mt-sm row items-center justify-between text-caption text-blue-grey-6 q-px-xs">
            <div class="row items-center">
              <q-icon name="place" color="brand-primary" size="14px" class="q-mr-xs" />
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
                color="brand-primary"
                icon="photo_camera"
                label="Ambil Foto"
                class="full-width rounded-12 text-weight-bold q-py-sm"
                no-caps
                @click="captureFromVideo"
              />
            </div>
            <div class="col-3">
              <q-btn
                outline
                color="blue-grey-7"
                icon="switch_camera"
                class="full-width rounded-12 q-py-sm"
                @click="toggleCameraFacing"
              >
                <q-tooltip>Ganti Kamera</q-tooltip>
              </q-btn>
            </div>
            <div class="col-3">
              <q-btn
                outline
                color="brand-danger"
                icon="videocam_off"
                class="full-width rounded-12 q-py-sm"
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
                color="brand-primary"
                icon="done"
                label="Simpan Foto"
                class="full-width rounded-12 text-weight-bold q-py-sm"
                no-caps
                :loading="photoDialogLoading"
                @click="saveCapturedPhoto"
              />
            </div>
            <div class="col-6">
              <q-btn
                outline
                color="blue-grey-7"
                icon="refresh"
                label="Ambil Ulang"
                class="full-width rounded-12 text-weight-bold q-py-sm"
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
                color="brand-primary"
                icon="videocam"
                label="Aktifkan Kamera"
                class="full-width rounded-12 text-weight-bold q-py-sm"
                no-caps
                @click="startCamera"
              />
            </div>
            <div class="col-6">
              <q-btn
                outline
                color="blue-grey-7"
                icon="file_upload"
                label="Pilih File Foto"
                class="full-width rounded-12 text-weight-bold q-py-sm"
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
  const f = filterProyek.value.toLowerCase().trim()
  if (!f) return proyekList.value
  return proyekList.value.filter(
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
.relative-position {
  position: relative;
}
.content-relative {
  position: relative;
  z-index: 1;
}

.rounded-20 {
  border-radius: 20px;
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
.shadow-premium {
  box-shadow: 0 10px 30px rgba(21, 101, 192, 0.2);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.project-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #1565c0 !important;
  color: #ffffff !important;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}
.project-table :deep(thead tr th .q-table__sort-icon) {
  color: rgba(255, 255, 255, 0.6) !important;
}
.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transition: 0.3s;
}
.hover-bg:hover {
  background-color: rgba(21, 101, 192, 0.06) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
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

.search-input :deep(.q-field__control) {
  border-radius: 30px;
}

/* ===== TABLE STYLING ===== */
table.abs-tbl {
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
  margin-top: 10px;
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

.font-mono {
  font-family: 'JetBrains Mono', monospace;
}
.uppercase {
  text-transform: uppercase;
}

/* ===== QUASAR COMPONENT DEEP OVERRIDES ===== */
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
}

@media (min-width: 600px) {
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

/* ===== RESPONSIVE SPACING & PADDING ===== */
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

@media (max-width: 599px) {
  .bg-page.q-page {
    padding: 12px !important;
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

.hover-scale {
  transition: transform 0.2s ease-in-out;
}
.hover-scale:hover {
  transform: scale(1.15);
}
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.premium-container {
  max-width: 1200px;
  width: 100%;
}
</style>
