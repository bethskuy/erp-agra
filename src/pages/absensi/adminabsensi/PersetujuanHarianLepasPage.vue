<template>
  <q-page class="bg-page font-inter">
    <div class="premium-container mx-auto">
      <!-- ======================================================================= -->
      <!-- VIEW 1: LIST (DEFAULT)                                                 -->
      <!-- ======================================================================= -->
      <div v-if="viewMode === 'list'" class="animate-fade">
        <!-- HEADER -->
        <div class="row items-center justify-between list-header-row">
          <div class="col-12 col-md-8">
            <div class="row items-center no-wrap q-mb-xs">
              <div class="ios-icon-box small bg-blue-50 text-brand-primary q-mr-sm flex-shrink-0">
                <q-icon name="verified_user" size="20px" />
              </div>
              <h4 class="responsive-title text-weight-bolder text-blue-grey-10 q-ma-none letter-spacing-tight">
                Persetujuan Harian Lepas
              </h4>
            </div>
            <div class="text-subtitle1 text-blue-grey-6 q-mt-sm line-height-normal">
              Otorisasi laporan absensi harian mandor dan pekerja lepas proyek konstruksi.
            </div>
          </div>
        </div>

        <!-- TABEL 1: MENUNGGU PERSETUJUAN (PENDING) -->
        <div class="q-mb-md row items-center no-wrap">
          <q-icon name="pending_actions" color="orange-8" size="sm" class="q-mr-sm flex-shrink-0" />
          <span class="text-h6 text-weight-bold text-blue-grey-9 tracking-wide col">
            Antrean Absensi Menunggu Verifikasi
          </span>
          <q-badge color="orange-8" class="q-ml-sm rounded-6 text-weight-bold shadow-1 flex-shrink-0">
            {{ pendingRows.length }}
          </q-badge>
        </div>

        <q-card flat class="bento-card bg-white overflow-hidden shadow-soft main-card-spacing">
          <q-table
            :rows="pendingRows"
            :columns="columns"
            row-key="id"
            flat
            :loading="loading"
            class="premium-table"
            :pagination="{ rowsPerPage: 10 }"
            hide-bottom
          >
            <template v-slot:header="props">
              <q-tr :props="props" class="bg-brand-primary">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="text-weight-bolder text-white uppercase letter-spacing-1"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr
                :props="props"
                class="hover-effect cursor-pointer transition-smooth"
                @click="viewDetail(props.row)"
              >
                <!-- Nama Proyek -->
                <q-td key="proyek" class="text-left text-weight-bold text-blue-grey-9">
                  <div class="row items-center no-wrap">
                    <q-avatar size="36px" color="brand-light" text-color="brand-primary" class="q-mr-sm text-weight-bold">
                      {{ (props.row.projectName || 'P').substring(0, 1).toUpperCase() }}
                    </q-avatar>
                    <span>{{ props.row.projectName || 'PROYEK UNKNOWN' }}</span>
                  </div>
                </q-td>

                <!-- Tanggal Kehadiran -->
                <q-td key="tanggal" class="text-center text-weight-bold text-blue-grey-8 font-mono">
                  {{ formatTanggal(props.row.tanggal) }}
                </q-td>

                <!-- Jumlah Mandor/Pekerja -->
                <q-td key="jumlah" class="text-center font-mono">
                  {{ countMandors(props.row.absen) }} Mandor / {{ countPekerja(props.row.absen) }} Pekerja
                </q-td>

                <!-- Tanggal Pengajuan -->
                <q-td key="tanggal_pengajuan" class="text-center text-grey-6">
                  {{ formatTimestamp(props.row.updatedAt) }}
                </q-td>

                <!-- Aksi Keputusan -->
                <q-td key="aksi" class="text-center" @click.stop>
                  <div class="row items-center justify-center no-wrap q-gutter-x-sm">
                    <q-btn
                      unelevated
                      color="brand-primary"
                      label="Verifikasi"
                      icon="visibility"
                      no-caps
                      class="shadow-soft btn-table-action"
                      @click="viewDetail(props.row)"
                    />
                    <q-btn
                      unelevated
                      color="green-6"
                      label="Setujui"
                      icon="check"
                      no-caps
                      class="shadow-soft btn-table-action"
                      @click="updateStatus(props.row.id, 'disetujui')"
                    />
                    <q-btn
                      unelevated
                      color="brand-danger"
                      label="Tolak"
                      icon="close"
                      no-caps
                      class="shadow-soft btn-table-action"
                      @click="updateStatus(props.row.id, 'ditolak')"
                    />
                  </div>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:loading>
              <q-inner-loading showing color="brand-primary">
                <q-spinner-dots size="50px" color="brand-primary" />
                <div class="text-brand-primary q-mt-md text-weight-medium">Mengambil antrean absensi...</div>
              </q-inner-loading>
            </template>

            <template v-slot:no-data>
              <div class="full-width column flex-center q-pa-xl text-blue-grey-4">
                <q-icon size="4em" name="task_alt" class="q-mb-md opacity-50" color="green-4" />
                <div class="text-h6 text-weight-bold text-blue-grey-6">Semua Selesai!</div>
                <div class="text-caption">
                  Tidak ada pengajuan absensi harian lepas yang tertunda saat ini.
                </div>
              </div>
            </template>
          </q-table>
        </q-card>

        <!-- TABEL 2: RIWAYAT KEPUTUSAN -->
        <div class="section-title-spacing row items-center no-wrap">
          <q-icon name="history" color="blue-grey-5" size="sm" class="q-mr-sm flex-shrink-0" />
          <span class="text-h6 text-weight-bold text-blue-grey-8 tracking-wide col">
            Riwayat Keputusan Absensi Harian Lepas
          </span>
        </div>

        <q-card flat class="bento-card bg-white overflow-hidden shadow-soft">
          <q-table
            :rows="completedRows"
            :columns="columnsHistory"
            row-key="id"
            flat
            :loading="loading"
            class="premium-table"
            :pagination="{ rowsPerPage: 5 }"
            :rows-per-page-options="[5, 10, 20, 0]"
          >
            <template v-slot:header="props">
              <q-tr :props="props" class="bg-brand-primary">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="text-weight-bolder text-white uppercase letter-spacing-1"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props" class="hover-effect cursor-pointer" @click="viewDetail(props.row)">
                <!-- Nama Proyek -->
                <q-td key="proyek" class="text-left text-weight-bold text-blue-grey-8">
                  <div class="row items-center no-wrap">
                    <q-avatar size="32px" color="grey-2" text-color="blue-grey-8" class="q-mr-sm text-weight-bold opacity-80 flex-shrink-0">
                      {{ (props.row.projectName || 'P').substring(0, 1).toUpperCase() }}
                    </q-avatar>
                    <div>
                      <div class="text-weight-bold text-blue-grey-9 text-subtitle2">{{ props.row.projectName || 'PROYEK UNKNOWN' }}</div>
                      <div class="text-caption text-grey-6 text-weight-regular text-italic q-mt-xs" v-if="props.row.catatan">
                        Catatan: {{ props.row.catatan }}
                      </div>
                    </div>
                  </div>
                </q-td>

                <!-- Tanggal Kehadiran -->
                <q-td key="tanggal" class="text-center font-mono text-weight-medium">
                  {{ formatTanggal(props.row.tanggal) }}
                </q-td>

                <!-- Tanggal Keputusan -->
                <q-td key="tanggal_keputusan" class="text-center text-grey-6">
                  {{ formatTimestamp(props.row.updatedAt) }}
                </q-td>

                <!-- Status Final -->
                <q-td key="status" class="text-center">
                  <q-badge
                    :color="props.row.status === 'disetujui' ? 'teal-1' : 'red-1'"
                    :text-color="props.row.status === 'disetujui' ? 'teal-8' : 'red-8'"
                    class="q-px-md q-py-xs text-weight-bold rounded-8"
                  >
                    <q-icon
                      :name="props.row.status === 'disetujui' ? 'check_circle' : 'cancel'"
                      size="14px"
                      class="q-mr-xs"
                    />
                    {{ props.row.status === 'disetujui' ? 'DISETUJUI' : 'DITOLAK' }}
                  </q-badge>
                </q-td>

                <!-- Hapus Riwayat -->
                <q-td key="aksi" class="text-center" @click.stop>
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete_outline"
                    color="blue-grey-3"
                    class="hover-text-negative transition-smooth"
                    @click="deleteRecord(props.row.id)"
                  >
                    <q-tooltip class="bg-negative">Hapus Riwayat</q-tooltip>
                  </q-btn>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:no-data>
              <div class="full-width row items-center q-pa-xl justify-center text-blue-grey-4">
                <q-icon size="2em" name="history" class="q-mr-sm" />
                <div class="text-weight-medium">Belum ada riwayat persetujuan absensi harian lepas.</div>
              </div>
            </template>
          </q-table>
        </q-card>
      </div>

      <!-- ======================================================================= -->
      <!-- VIEW 2: DETAIL FULL PAGE (VERIFIKASI DETAIL)                           -->
      <!-- ======================================================================= -->
      <div v-else-if="viewMode === 'detail-full' && selectedRecord" class="animate-fade">
        <!-- HEADER -->
        <div class="row items-center justify-between detail-header-row">
          <div class="col-12 col-md-8 q-mb-md q-mb-md-none">
            <div class="row items-center">
              <q-btn
                flat
                round
                color="brand-primary"
                icon="arrow_back"
                @click="viewMode = 'list'; selectedRecord = null; mandors = [];"
                class="q-mr-md bg-white shadow-1"
              />
              <div class="col">
                <div class="row items-center q-gutter-x-sm flex-wrap">
                  <span class="responsive-title text-weight-bolder text-brand-primary leading-tight uppercase">
                    Verifikasi Laporan Absensi
                  </span>
                  <q-badge
                    :color="selectedRecord.status === 'disetujui' ? 'positive' : selectedRecord.status === 'diajukan' ? 'warning' : selectedRecord.status === 'ditolak' ? 'negative' : 'grey-7'"
                    class="text-weight-bold q-px-sm"
                    style="font-size: 11px; height: 20px;"
                  >
                    {{ selectedRecord.status === 'diajukan' ? 'MENUNGGU' : selectedRecord.status === 'disetujui' ? 'DISETUJUI' : selectedRecord.status === 'ditolak' ? 'DITOLAK' : 'DRAFT' }}
                  </q-badge>
                </div>
                <div class="text-body2 text-md-subtitle1 text-grey-7 q-mt-sm text-weight-medium">
                  {{ selectedRecord.projectName }}
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4" v-if="selectedRecord.status === 'diajukan'">
            <div class="row justify-end q-col-gutter-sm">
              <div class="col-6 col-sm-auto">
                <q-btn
                  unelevated
                  color="brand-danger"
                  label="Tolak"
                  icon="close"
                  no-caps
                  style="min-width: 120px; height: 40px;"
                  class="full-width text-weight-bold rounded-12 shadow-premium"
                  @click="updateStatus(selectedRecord.id, 'ditolak')"
                />
              </div>
              <div class="col-6 col-sm-auto">
                <q-btn
                  unelevated
                  color="green-6"
                  label="Setujui"
                  icon="check"
                  no-caps
                  style="min-width: 120px; height: 40px;"
                  class="full-width text-weight-bold rounded-12 shadow-soft-positive"
                  @click="updateStatus(selectedRecord.id, 'disetujui')"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- SUMMARY CARD -->
        <q-card flat bordered class="control-panel-card shadow-1 rounded-20 bg-white border-subtle">
          <q-card-section class="q-pa-lg">
            <div class="row q-col-gutter-md items-center justify-between">
              <div class="col-12 col-md-6 flex items-center q-gutter-x-md">
                <q-icon name="calendar_month" color="brand-primary" size="lg" />
                <div>
                  <div class="text-caption text-grey-6 font-weight-bold uppercase">TANGGAL KEHADIRAN</div>
                  <div class="text-h6 text-blue-grey-9 text-weight-bolder font-mono">
                    {{ formatTanggal(selectedRecord.tanggal) }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6 row justify-end q-col-gutter-md text-right-md">
                <div class="col-6 col-md-auto">
                  <div class="text-caption text-grey-5 uppercase font-weight-bold">Total Mandor</div>
                  <div class="text-h5 text-brand-primary text-weight-bold text-center text-md-right">{{ countMandors(selectedRecord.absen) }}</div>
                </div>
                <div class="col-6 col-md-auto">
                  <div class="text-caption text-grey-5 uppercase font-weight-bold">Total Pekerja</div>
                  <div class="text-h5 text-brand-primary text-weight-bold text-center text-md-right">{{ countPekerja(selectedRecord.absen) }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- MANDORS AND WORKERS LIST (READ ONLY) -->
        <div v-if="loadingDetails" class="flex flex-center q-pa-xl bg-white rounded-20 border border-subtle">
          <q-spinner-orbit color="brand-primary" size="48px" />
          <div class="text-subtitle2 text-grey-6 q-ml-md">Memuat detail kelompok...</div>
        </div>

        <div v-else-if="mandors.length === 0" class="text-center q-pa-xl bg-white rounded-20 border border-subtle shadow-soft">
          <q-icon name="group_off" size="4em" color="grey-4" />
          <div class="text-grey-6 text-subtitle1 q-mt-md">
            Tidak ada data kelompok pekerja mandor terdaftar untuk proyek ini.
          </div>
        </div>

        <div v-else class="mandor-list-container">
          <div v-for="(m, mi) in mandors" :key="m.id" class="mandor-card-wrapper">
            <q-card flat bordered class="rounded-20 shadow-1 bg-white border-subtle overflow-hidden">
              <!-- Header Mandor -->
              <div class="bg-brand-light q-pa-md q-pa-sm-lg row items-center justify-between border-bottom mandor-header-row">
                <div class="row items-center no-wrap">
                  <q-avatar size="40px" color="brand-primary" text-color="white" class="q-mr-md text-weight-bold shadow-sm flex-shrink-0">
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

                <!-- Mandor Status & Group Photo Preview -->
                <div class="row items-center no-wrap q-gutter-x-sm">
                  <q-btn
                    v-if="getMandorFotoBersama(m.id)"
                    outline
                    no-caps
                    size="sm"
                    color="brand-primary"
                    class="rounded-8 text-weight-bold q-px-sm bg-white"
                    icon="groups"
                    label="Lihat Foto Bersama"
                    @click="openPhotoPreview(getMandorFotoBersama(m.id), `Foto Bersama - Mandor ${m.nama}`)"
                  />
                  
                  <div class="row items-center no-wrap q-gutter-x-sm bg-white q-py-xs q-px-md rounded-12 border border-subtle">
                    <span class="text-caption text-weight-bold text-grey-6">STATUS MANDOR:</span>
                    <q-badge
                      :color="getMandorStatus(m.id) === 'hadir' ? 'brand-primary' : 'brand-danger'"
                      class="text-weight-bold q-px-md q-py-xs rounded-6 uppercase"
                    >
                      {{ getMandorStatus(m.id) === 'hadir' ? 'Hadir' : 'Tidak Hadir' }}
                    </q-badge>
                  </div>
                </div>
              </div>

              <!-- Workers Table -->
              <q-card-section class="q-pa-none">
                <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
                  <table class="abs-tbl">
                    <thead>
                      <tr class="bg-slate-50">
                        <th style="width: 40px" class="text-center text-weight-bold font-11 tracking-widest">#</th>
                        <th class="text-left text-weight-bold font-11 tracking-widest">NAMA PEKERJA</th>
                        <th class="text-center text-weight-bold font-11 tracking-widest">JABATAN</th>
                        <th class="text-center text-weight-bold font-11 tracking-widest" style="width: 90px;">JAM MASUK</th>
                        <th class="text-center text-weight-bold font-11 tracking-widest" style="width: 90px;">JAM PULANG</th>
                        <th class="text-right text-weight-bold font-11 tracking-widest">UPAH BASE</th>
                        <th class="text-center text-weight-bold font-11 tracking-widest">KOEF.</th>
                        <th class="text-right text-weight-bold font-11 tracking-widest">UPAH EFEKTIF</th>
                        <th class="text-center text-weight-bold font-11 tracking-widest">LEMBUR</th>
                        <th class="text-right text-weight-bold font-11 tracking-widest">UPAH LEMBUR</th>
                        <th class="text-right text-weight-bold font-11 tracking-widest text-teal-10">TOTAL UPAH</th>
                        <th class="text-center text-weight-bold font-11 tracking-widest" style="width: 70px;">BUKTI</th>
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
                          <q-badge color="brand-light" text-color="brand-primary" class="text-weight-bold q-px-sm q-py-xs rounded-6">
                            {{ p.jabatan || 'Tukang' }}
                          </q-badge>
                        </td>
                        <td class="text-center font-mono text-weight-bold text-blue-grey-8">
                          <span v-if="getWorkerJamMasuk(m.id, p.id)">{{ getWorkerJamMasuk(m.id, p.id) }}</span>
                          <q-badge v-else color="brand-danger" class="text-weight-bold q-px-sm rounded-6 uppercase">Absen</q-badge>
                        </td>
                        <td class="text-center font-mono text-weight-bold text-blue-grey-8">
                          <span v-if="getWorkerJamPulang(m.id, p.id)">{{ getWorkerJamPulang(m.id, p.id) }}</span>
                          <q-badge v-else color="brand-danger" class="text-weight-bold q-px-sm rounded-6 uppercase">Absen</q-badge>
                        </td>
                        <td class="text-right font-mono font-medium text-grey-7">
                          Rp {{ formatUang(p.upahHari) }}
                        </td>
                        <td class="text-center text-weight-bold text-amber-9 font-mono">
                          {{ (p.koef || 1.0).toFixed(2) }}x
                        </td>
                        <td class="text-right font-mono font-medium text-blue-grey-9">
                          Rp {{ formatUang(calculateWorkerEffectiveWage(p, m.id)) }}
                        </td>
                        <td class="text-center text-weight-bold text-blue-grey-8 font-mono">
                          {{ getWorkerLembur(m.id, p.id) }} Jam
                        </td>
                        <td class="text-right font-mono font-medium text-blue-grey-9">
                          Rp {{ formatUang(calculateWorkerLemburWage(p, m.id)) }}
                        </td>
                        <td class="text-right font-mono text-weight-bold text-brand-primary">
                          Rp {{ formatUang(calculateWorkerTotalWage(p, m.id)) }}
                        </td>
                        <td class="text-center">
                          <q-btn
                            v-if="getWorkerFoto(m.id, p.id)"
                            outline
                            color="brand-primary"
                            class="rounded-8 bg-white"
                            icon="photo"
                            size="sm"
                            @click="openPhotoPreview(getWorkerFoto(m.id, p.id), p.nama)"
                          >
                            <q-tooltip class="bg-brand-primary">Lihat Foto Bukti</q-tooltip>
                          </q-btn>
                          <span v-else class="text-grey-4 text-weight-bold">-</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- DECISION CARD AT BOTTOM -->
        <div class="decision-card-spacing" v-if="selectedRecord.status === 'diajukan' || selectedRecord.status === 'disetujui' || selectedRecord.status === 'ditolak'">
          <q-card flat bordered class="rounded-24 shadow-soft bg-white overflow-hidden">
            <q-card-section :class="selectedRecord.status === 'disetujui' ? 'bg-teal-6' : selectedRecord.status === 'ditolak' ? 'bg-red-8' : 'bg-brand-primary'" class="text-white text-weight-bold uppercase q-py-md">
              <q-icon :name="selectedRecord.status === 'disetujui' ? 'check_circle' : selectedRecord.status === 'ditolak' ? 'cancel' : 'gavel'" class="q-mr-sm" />
              {{ selectedRecord.status === 'diajukan' ? 'Keputusan Verifikasi Absensi' : 'Hasil Verifikasi Absensi oleh HRD' }}
            </q-card-section>
            <q-card-section class="q-pa-lg">
              <div class="row q-col-gutter-lg items-center">
                <div class="col-12" :class="selectedRecord.status === 'diajukan' ? 'col-md-7' : 'col-md-12'">
                  <div class="rounded-16 q-pa-md" :class="selectedRecord.status === 'disetujui' ? 'bg-teal-1 text-teal-9' : selectedRecord.status === 'ditolak' ? 'bg-red-1 text-red-9' : 'bg-blue-grey-1 text-blue-grey-8'">
                    <div class="text-subtitle2 text-weight-bold q-mb-xs">
                      <q-icon :name="selectedRecord.status === 'diajukan' ? 'info_outline' : 'rate_review'" class="q-mr-xs" />
                      {{ selectedRecord.status === 'diajukan' ? 'Catatan Verifikasi' : 'Keterangan Keputusan' }}
                    </div>
                    <div class="text-body2" style="line-height: 1.6">
                      {{ selectedRecord.status === 'diajukan'
                        ? 'Persetujuan laporan ini akan mengesahkan absensi mandor dan pekerja untuk proyek ini pada tanggal tersebut, serta mencatat upah harian ke dalam log pengeluaran proyek. Proses ini tidak dapat dibatalkan.'
                        : (selectedRecord.catatan || 'Tidak ada catatan verifikasi dari HRD.') }}
                    </div>
                  </div>
                </div>
                <div class="col-12 col-md-5" v-if="selectedRecord.status === 'diajukan'">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-6">
                      <q-btn
                        unelevated
                        color="brand-danger"
                        icon="cancel"
                        label="Tolak Laporan"
                        no-caps
                        class="text-weight-bold full-width rounded-12 shadow-premium"
                        style="min-height: 44px;"
                        @click="updateStatus(selectedRecord.id, 'ditolak')"
                      />
                    </div>
                    <div class="col-12 col-sm-6">
                      <q-btn
                        unelevated
                        color="green-6"
                        icon="check_circle"
                        label="Setujui Laporan"
                        no-caps
                        class="text-weight-bold full-width rounded-12 shadow-soft-positive"
                        style="min-height: 44px;"
                        @click="updateStatus(selectedRecord.id, 'disetujui')"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- ======================================================================= -->
    <!-- DIALOG: PREVIEW FOTO BUKTI ABSENSI                                      -->
    <!-- ======================================================================= -->
    <q-dialog v-model="showPreviewDialog" transition-show="scale" transition-hide="scale">
      <q-card class="rounded-24 shadow-premium overflow-hidden bg-slate-900 border-subtle" style="width: 550px; max-width: 95vw;">
        <!-- Header -->
        <q-card-section class="bg-brand-primary text-white row items-center justify-between q-py-md">
          <div class="row items-center">
            <q-icon name="image" size="20px" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-bolder uppercase tracking-wide">
              Detail Foto Bukti
            </div>
          </div>
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-card-section>

        <!-- Image Preview Card -->
        <q-card-section class="q-pa-none bg-slate-950 flex flex-center" style="min-height: 350px;">
          <q-img
            :src="previewPhotoUrl"
            style="width: 100%; height: auto; max-height: 480px;"
            fit="contain"
          />
        </q-card-section>

        <!-- Footer Title -->
        <q-card-section class="bg-white q-pa-md text-center">
          <div class="text-subtitle2 text-weight-bolder text-blue-grey-9 uppercase">
            {{ previewPhotoTitle }}
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { db } from 'src/boot/firebase'
import { useQuasar, date } from 'quasar'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore'

const $q = useQuasar()

// View toggles
const viewMode = ref('list') // 'list' | 'detail-full'
const selectedRecord = ref(null)

// Data arrays
const allRecords = ref([])
const loading = ref(true)
const loadingDetails = ref(false)
const mandors = ref([])
let unsubRecords = null
let unsubMandors = null

// Table headers for pending queue
const columns = [
  { name: 'proyek', label: 'PROYEK KONSTRUKSI', align: 'left', field: 'projectName' },
  { name: 'tanggal', label: 'TANGGAL KEHADIRAN', align: 'center', field: 'tanggal' },
  { name: 'jumlah', label: 'JUMLAH KEHADIRAN', align: 'center', field: 'id' },
  { name: 'tanggal_pengajuan', label: 'TANGGAL PENGAJUAN', align: 'center', field: 'updatedAt' },
  { name: 'aksi', label: 'VERIFIKASI / AKSI', align: 'center', field: 'id' }
]

// Table headers for decisions history
const columnsHistory = [
  { name: 'proyek', label: 'PROYEK KONSTRUKSI', align: 'left', field: 'projectName' },
  { name: 'tanggal', label: 'TANGGAL KEHADIRAN', align: 'center', field: 'tanggal' },
  { name: 'tanggal_keputusan', label: 'WAKTU KEPUTUSAN', align: 'center', field: 'updatedAt' },
  { name: 'status', label: 'KEPUTUSAN HRD', align: 'center', field: 'status' },
  { name: 'aksi', label: 'AKSI', align: 'center', field: 'id' }
]

// Real-time records listener
const fetchAttendanceRecords = () => {
  loading.value = true
  const q = query(
    collection(db, 'harian_lepas_absen'),
    orderBy('updatedAt', 'desc')
  )
  
  unsubRecords = onSnapshot(
    q,
    (snap) => {
      allRecords.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      console.error('Error load harian lepas absen:', err)
      loading.value = false
    }
  )
}

// Group records by pending approval
const pendingRows = computed(() => {
  return allRecords.value.filter((r) => r.status === 'diajukan')
})

// Group records by finalized status
const completedRows = computed(() => {
  return allRecords.value.filter((r) => r.status === 'disetujui' || r.status === 'ditolak')
})

// Helpers for counting sizes
const countMandors = (absenMap) => {
  if (!absenMap) return 0
  return Object.keys(absenMap).length
}

const countPekerja = (absenMap) => {
  if (!absenMap) return 0
  let count = 0
  Object.keys(absenMap).forEach((mandorId) => {
    const group = absenMap[mandorId]
    Object.keys(group).forEach((pekerjaId) => {
      if (pekerjaId !== '_self') count++
    })
  })
  return count
}

const formatTanggal = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return date.formatDate(d, 'DD MMMM YYYY', {
    months: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  })
}

const formatTimestamp = (ts) => {
  if (!ts) return '-'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return date.formatDate(d, 'DD/MM/YYYY HH:mm')
}

const formatUang = (val) => (val ? Math.round(val).toLocaleString('id-ID') : '0')

const rateLembur = ref(25000)

const fetchProjectSetup = async (projectId) => {
  try {
    const snap = await getDoc(doc(db, 'harian_lepas_setup', projectId))
    if (snap.exists()) {
      rateLembur.value = snap.data().lembur || 25000
    } else {
      rateLembur.value = 25000
    }
  } catch (err) {
    console.error('Error fetching project setup:', err)
    rateLembur.value = 25000
  }
}

// Verify / show detailed layout
const viewDetail = (record) => {
  selectedRecord.value = record
  viewMode.value = 'detail-full'
  
  loadingDetails.value = true
  fetchProjectSetup(record.projectId)
  
  // Realtime listener for mandors in that project to reconstruct table names
  const q = query(
    collection(db, 'harian_lepas_mandor'),
    where('projectId', '==', record.projectId)
  )
  
  unsubMandors = onSnapshot(
    q,
    (snap) => {
      mandors.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loadingDetails.value = false
    },
    (err) => {
      console.error('Error load mandors detail:', err)
      loadingDetails.value = false
    }
  )
}

// --- Preview Foto Bukti Absensi ---
const showPreviewDialog = ref(false)
const previewPhotoUrl = ref('')
const previewPhotoTitle = ref('')

const openPhotoPreview = (url, title) => {
  previewPhotoUrl.value = url
  previewPhotoTitle.value = title
  showPreviewDialog.value = true
}

const getWorkerFoto = (mandorId, pekerjaId) => {
  return selectedRecord.value?.absen?.[mandorId]?.[pekerjaId]?.foto || ''
}

const getMandorFotoBersama = (mandorId) => {
  return selectedRecord.value?.absen?.[mandorId]?._self?.fotoBersama || ''
}

const getMandorStatus = (mandorId) => {
  return selectedRecord.value?.absen?.[mandorId]?._self?.status || 'hadir'
}

const getWorkerJamMasuk = (mandorId, pekerjaId) => {
  return selectedRecord.value?.absen?.[mandorId]?.[pekerjaId]?.jamMasuk || ''
}

const getWorkerJamPulang = (mandorId, pekerjaId) => {
  return selectedRecord.value?.absen?.[mandorId]?.[pekerjaId]?.jamPulang || ''
}

const getWorkerLembur = (mandorId, pekerjaId) => {
  return selectedRecord.value?.absen?.[mandorId]?.[pekerjaId]?.lembur || 0
}

const calculateWorkerEffectiveWage = (pekerja, mandorId) => {
  const status = selectedRecord.value?.absen?.[mandorId]?.[pekerja.id]?.status || 'hadir'
  if (status !== 'hadir') return 0
  return (pekerja.upahHari || 0) * (pekerja.koef || 1.0)
}

const calculateWorkerLemburWage = (pekerja, mandorId) => {
  const hours = Number(getWorkerLembur(mandorId, pekerja.id)) || 0
  const rate = pekerja.upahLembur !== undefined ? pekerja.upahLembur : rateLembur.value
  return hours * rate
}

const calculateWorkerTotalWage = (pekerja, mandorId) => {
  return calculateWorkerEffectiveWage(pekerja, mandorId) + calculateWorkerLemburWage(pekerja, mandorId)
}

// Otorisasi Keputusan Admin / HRD
const updateStatus = async (id, newStatus) => {
  const isSetuju = newStatus === 'disetujui'
  $q.dialog({
    title: isSetuju ? 'Setujui Laporan Absensi' : 'Tolak Laporan Absensi',
    message: isSetuju
      ? 'Masukkan catatan atau keterangan persetujuan (opsional):'
      : 'Masukkan alasan atau keterangan penolakan (wajib):',
    prompt: {
      model: '',
      type: 'text',
      outlined: true,
      dense: true,
      placeholder: isSetuju ? 'Contoh: Laporan absensi lengkap dan sesuai.' : 'Contoh: Absensi tidak sesuai dengan log lapangan.'
    },
    cancel: {
      label: 'Batal',
      color: 'grey-7',
      flat: true
    },
    ok: {
      label: isSetuju ? 'Setujui' : 'Tolak',
      color: isSetuju ? 'green-6' : 'red-8',
      unelevated: true
    },
    persistent: true
  }).onOk(async (catatanInput) => {
    if (!isSetuju && (!catatanInput || !catatanInput.trim())) {
      $q.notify({
        type: 'warning',
        message: 'Alasan penolakan wajib diisi!'
      })
      return
    }

    loading.value = true
    try {
      await updateDoc(doc(db, 'harian_lepas_absen', id), {
        status: newStatus,
        catatan: catatanInput ? catatanInput.trim() : '',
        updatedAt: serverTimestamp()
      })
      $q.notify({
        type: 'positive',
        message: `Laporan absensi proyek berhasil diperbarui ke status: ${newStatus.toUpperCase()}`
      })
      if (viewMode.value === 'detail-full') {
        viewMode.value = 'list'
        selectedRecord.value = null
        mandors.value = []
      }
    } catch (err) {
      console.error('Error updating status:', err)
      $q.notify({
        type: 'negative',
        message: 'Gagal memperbarui status absensi: ' + err.message
      })
    } finally {
      loading.value = false
    }
  })
}

// Delete processed record from History (keeps database clean)
const deleteRecord = (id) => {
  $q.dialog({
    title: 'Hapus Riwayat',
    message: 'Apakah Anda yakin ingin menghapus catatan riwayat persetujuan absensi ini dari database?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'harian_lepas_absen', id))
      $q.notify({
        type: 'positive',
        message: 'Catatan riwayat absensi berhasil dihapus!'
      })
    } catch (err) {
      console.error('Error delete document:', err)
      $q.notify({
        type: 'negative',
        message: 'Gagal menghapus riwayat: ' + err.message
      })
    } finally {
      loading.value = false
    }
  })
}

// Lifecycle Hooks
onMounted(() => {
  fetchAttendanceRecords()
})

onUnmounted(() => {
  if (unsubRecords) unsubRecords()
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
.text-brand-danger {
  color: #ad3640 !important;
}

.font-inter {
  font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
}

/* Responsive Padding & Centering Container */
.premium-container {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  padding: 24px 16px;
}
@media (min-width: 600px) {
  .premium-container {
    padding: 32px 24px;
  }
}
@media (min-width: 1200px) {
  .premium-container {
    padding: 40px 32px;
  }
}

.bento-card {
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.rounded-24 {
  border-radius: 24px;
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

.shadow-soft {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05) !important;
}
.shadow-soft-positive {
  box-shadow: 0 10px 30px rgba(76, 175, 80, 0.2);
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(21, 101, 192, 0.2);
}

.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.border-bottom-light {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

/* Apple-style icons */
.ios-icon-box {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ios-icon-box.small {
  width: 40px;
  height: 40px;
  border-radius: 12px;
}

.hover-effect:hover td {
  background-color: rgba(21, 101, 192, 0.03) !important;
}

/* Standard Premium Tables styling */
.premium-table :deep(thead tr th) {
  font-size: 11px;
  padding-top: 14px;
  padding-bottom: 14px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-bottom: none;
}
.premium-table :deep(tbody tr td) {
  font-size: 13px;
  padding-top: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.premium-table :deep(.q-table__middle) {
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch;
}
.premium-table :deep(table) {
  min-width: 800px;
}

/* Table Actions Alignment */
.btn-table-action {
  height: 32px;
  min-height: 32px;
  font-size: 11px !important;
  font-weight: 700;
  border-radius: 8px;
  padding: 0 10px !important;
}
.btn-table-action :deep(.q-btn__content) {
  flex-direction: row !important;
  flex-wrap: nowrap !important;
}
.btn-table-action :deep(.q-icon) {
  font-size: 14px !important;
  margin-right: 4px !important;
}

/* Plain HTML Absensi Table */
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
  padding: 12px 10px;
  border: none;
  border-bottom: 2px solid #0d47a1;
}
table.abs-tbl td {
  padding: 12px 10px;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  vertical-align: middle;
  color: #334155;
  font-size: 13px;
}
@media (min-width: 600px) {
  table.abs-tbl th {
    padding: 14px 16px;
  }
  table.abs-tbl td {
    padding: 14px 16px;
  }
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

/* Responsive headings & alignments */
.responsive-title {
  font-size: 1.5rem;
  line-height: 1.8rem;
}
@media (min-width: 600px) {
  .responsive-title {
    font-size: 2.125rem;
    line-height: 2.5rem;
  }
}

.text-right-md {
  text-align: left;
}
@media (min-width: 960px) {
  .text-right-md {
    text-align: right;
  }
}

/* Transition Animations */
.animate-fade {
  animation: fadeIn 0.5s ease-out;
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

/* Deep Quasar Overrides */
:deep(.q-btn[color='brand-primary']) {
  background: #1565c0 !important;
  color: white !important;
}
:deep(.q-btn[color='brand-danger']) {
  background: #ad3640 !important;
  color: white !important;
}

/* Custom Responsive Spacing Gaps */
.list-header-row {
  margin-bottom: 20px;
}
@media (min-width: 600px) {
  .list-header-row {
    margin-bottom: 32px;
  }
}
@media (min-width: 1200px) {
  .list-header-row {
    margin-bottom: 40px;
  }
}

.main-card-spacing {
  margin-bottom: 24px;
}
@media (min-width: 600px) {
  .main-card-spacing {
    margin-bottom: 36px;
  }
}
@media (min-width: 1200px) {
  .main-card-spacing {
    margin-bottom: 48px;
  }
}

.section-title-spacing {
  margin-bottom: 12px;
  margin-top: 24px;
}
@media (min-width: 600px) {
  .section-title-spacing {
    margin-bottom: 16px;
    margin-top: 36px;
  }
}
@media (min-width: 1200px) {
  .section-title-spacing {
    margin-bottom: 20px;
    margin-top: 48px;
  }
}

.detail-header-row {
  margin-bottom: 20px;
}
@media (min-width: 600px) {
  .detail-header-row {
    margin-bottom: 32px;
  }
}
@media (min-width: 1200px) {
  .detail-header-row {
    margin-bottom: 40px;
  }
}

.control-panel-card {
  margin-bottom: 20px;
}
@media (min-width: 600px) {
  .control-panel-card {
    margin-bottom: 32px;
  }
}
@media (min-width: 1200px) {
  .control-panel-card {
    margin-bottom: 40px;
  }
}

.mandor-list-container {
  display: flex;
  flex-direction: column;
}

.mandor-card-wrapper {
  margin-bottom: 20px;
}
.mandor-card-wrapper:last-child {
  margin-bottom: 0px;
}
@media (min-width: 600px) {
  .mandor-card-wrapper {
    margin-bottom: 24px;
  }
}
@media (min-width: 1200px) {
  .mandor-card-wrapper {
    margin-bottom: 36px;
  }
}

.decision-card-spacing {
  margin-top: 16px;
}
@media (min-width: 600px) {
  .decision-card-spacing {
    margin-top: 24px;
  }
}
@media (min-width: 1200px) {
  .decision-card-spacing {
    margin-top: 32px;
  }
}

.mandor-header-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
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
</style>

<style>
/* Global overrides for Persetujuan Harian Lepas action buttons to force side-by-side icon layout */
.btn-table-action .q-btn__content {
  flex-direction: row !important;
  flex-wrap: nowrap !important;
}
.btn-table-action .q-icon {
  font-size: 14px !important;
  margin-right: 6px !important;
}
</style>
