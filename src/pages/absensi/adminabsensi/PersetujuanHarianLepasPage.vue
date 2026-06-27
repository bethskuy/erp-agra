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

    <div class="premium-container mx-auto">
      <!-- ======================================================================= -->
      <!-- VIEW 1: LIST (DEFAULT)                                                 -->
      <!-- ======================================================================= -->
      <div v-if="viewMode === 'list'" class="table-entrance">
        <!-- HEADER -->
        <div class="row items-center justify-between list-header-row header-entrance">
          <div class="col-12 col-md-8">
            <div class="row items-center no-wrap q-mb-xs">
              <div class="ios-icon-box small bg-slate-900 text-white q-mr-sm flex-shrink-0 border-thick">
                <q-icon name="verified_user" size="20px" />
              </div>
              <h4
                class="responsive-title text-weight-bolder text-slate-900 q-ma-none letter-spacing-tight"
              >
                Persetujuan Harian Lepas
              </h4>
            </div>
            <div class="text-subtitle1 text-slate-700 q-mt-sm line-height-normal">
              Otorisasi laporan absensi harian mandor dan pekerja lepas proyek konstruksi.
            </div>
          </div>
        </div>

        <!-- TABEL 1: MENUNGGU PERSETUJUAN (PENDING) -->
        <div class="q-mb-md row items-center no-wrap">
          <q-icon name="pending_actions" color="orange-8" size="sm" class="q-mr-sm flex-shrink-0" />
          <span class="text-h6 text-weight-bold text-slate-900 tracking-wide col">
            Antrean Absensi Menunggu Verifikasi
          </span>
          <span
            class="neo-badge bg-yellow-3 text-slate-900 font-bold ml-2 flex-shrink-0"
          >
            {{ pendingRows.length }}
          </span>
        </div>

        <q-card flat class="neo-card neo-table overflow-hidden main-card-spacing">
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
            <template v-slot:body="props">
              <q-tr
                :props="props"
                class="hover-effect cursor-pointer transition-smooth"
                @click="viewDetail(props.row)"
              >
                <!-- Nama Proyek -->
                <q-td key="proyek" class="text-left text-weight-bold text-slate-900">
                  <div class="row items-center no-wrap">
                    <q-avatar
                      size="36px"
                      color="slate-900"
                      text-color="white"
                      class="q-mr-sm text-weight-bold"
                    >
                      {{ (props.row.projectName || 'P').substring(0, 1).toUpperCase() }}
                    </q-avatar>
                    <span>{{ props.row.projectName || 'PROYEK UNKNOWN' }}</span>
                  </div>
                </q-td>

                <!-- Tanggal Kehadiran -->
                <q-td key="tanggal" class="text-center text-weight-bold text-slate-800 font-mono">
                  {{ formatTanggal(props.row.tanggal) }}
                </q-td>

                <!-- Jumlah Mandor/Pekerja -->
                <q-td key="jumlah" class="text-center font-mono">
                  {{ countMandors(props.row.absen) }} Mandor /
                  {{ countPekerja(props.row.absen) }} Pekerja
                </q-td>

                <!-- Tanggal Pengajuan -->
                <q-td key="tanggal_pengajuan" class="text-center text-slate-600">
                  {{ formatTimestamp(props.row.updatedAt) }}
                </q-td>

                <!-- Aksi Keputusan -->
                <q-td key="aksi" class="text-center" @click.stop>
                  <div class="row items-center justify-center no-wrap q-gutter-x-sm">
                    <q-btn
                      unelevated
                      label="Verifikasi"
                      icon="visibility"
                      no-caps
                      class="neo-btn neo-btn-primary btn-table-action"
                      @click="viewDetail(props.row)"
                    />
                    <q-btn
                      unelevated
                      label="Setujui"
                      icon="check"
                      no-caps
                      class="neo-btn neo-btn-success btn-table-action"
                      @click="updateStatus(props.row.id, 'disetujui')"
                    />
                    <q-btn
                      unelevated
                      label="Tolak"
                      icon="close"
                      no-caps
                      class="neo-btn neo-btn-danger btn-table-action"
                      @click="updateStatus(props.row.id, 'ditolak')"
                    />
                  </div>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:loading>
              <q-inner-loading showing color="slate-900">
                <q-spinner-dots size="50px" color="slate-900" />
                <div class="text-slate-900 q-mt-md text-weight-medium">
                  Mengambil antrean absensi...
                </div>
              </q-inner-loading>
            </template>

            <template v-slot:no-data>
              <div class="full-width column flex-center q-pa-xl text-slate-600">
                <q-icon size="4em" name="task_alt" class="q-mb-md opacity-50" color="slate-900" />
                <div class="text-h6 text-weight-bold text-slate-900">Semua Selesai!</div>
                <div class="text-caption">
                  Tidak ada pengajuan absensi harian lepas yang tertunda saat ini.
                </div>
              </div>
            </template>
          </q-table>
        </q-card>

        <!-- TABEL 2: RIWAYAT KEPUTUSAN -->
        <div class="section-title-spacing row items-center no-wrap">
          <q-icon name="history" color="slate-900" size="sm" class="q-mr-sm flex-shrink-0" />
          <span class="text-h6 text-weight-bold text-slate-900 tracking-wide col">
            Riwayat Keputusan Absensi Harian Lepas
          </span>
        </div>

        <q-card flat class="neo-card neo-table overflow-hidden">
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
            <template v-slot:body="props">
              <q-tr
                :props="props"
                class="hover-effect cursor-pointer"
                @click="viewDetail(props.row)"
              >
                <!-- Nama Proyek -->
                <q-td key="proyek" class="text-left text-weight-bold text-slate-900">
                  <div class="row items-center no-wrap">
                    <q-avatar
                      size="32px"
                      color="slate-900"
                      text-color="white"
                      class="q-mr-sm text-weight-bold opacity-80 flex-shrink-0"
                    >
                      {{ (props.row.projectName || 'P').substring(0, 1).toUpperCase() }}
                    </q-avatar>
                    <div>
                      <div class="text-weight-bold text-slate-900 text-subtitle2">
                        {{ props.row.projectName || 'PROYEK UNKNOWN' }}
                      </div>
                      <div
                        class="text-caption text-slate-600 text-weight-regular text-italic q-mt-xs"
                        v-if="props.row.catatan"
                      >
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
                <q-td key="tanggal_keputusan" class="text-center text-slate-600">
                  {{ formatTimestamp(props.row.updatedAt) }}
                </q-td>

                <!-- Status Final -->
                <q-td key="status" class="text-center">
                  <span
                    :class="[
                      'neo-badge text-weight-bold q-px-sm',
                      props.row.status === 'disetujui' ? 'bg-emerald-2 text-slate-900' : 'bg-red-2 text-slate-900'
                    ]"
                  >
                    <q-icon
                      :name="props.row.status === 'disetujui' ? 'check_circle' : 'cancel'"
                      size="14px"
                      class="q-mr-xs"
                    />
                    {{ props.row.status === 'disetujui' ? 'DISETUJUI' : 'DITOLAK' }}
                  </span>
                </q-td>

                <!-- Hapus Riwayat -->
                <q-td key="aksi" class="text-center" @click.stop>
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete_outline"
                    color="slate-600"
                    class="hover-text-negative transition-smooth"
                    @click="deleteRecord(props.row.id)"
                  >
                    <q-tooltip class="bg-negative">Hapus Riwayat</q-tooltip>
                  </q-btn>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:no-data>
              <div class="full-width row items-center q-pa-xl justify-center text-slate-600">
                <q-icon size="2em" name="history" class="q-mr-sm" />
                <div class="text-weight-medium">
                  Belum ada riwayat persetujuan absensi harian lepas.
                </div>
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
                color="slate-900"
                icon="arrow_back"
                @click="
                  viewMode = 'list';
                  selectedRecord = null;
                  mandors = [];
                "
                class="q-mr-md neo-btn neo-btn-secondary"
              />
              <div class="col">
                <div class="row items-center q-gutter-x-sm flex-wrap">
                  <span
                    class="responsive-title text-weight-bolder text-slate-900 leading-tight uppercase"
                  >
                    Verifikasi Laporan Absensi
                  </span>
                  <span
                    :class="[
                      'neo-badge text-weight-bold q-px-sm',
                      selectedRecord.status === 'disetujui' ? 'bg-emerald-2 text-slate-900' : selectedRecord.status === 'diajukan' ? 'bg-yellow-3 text-slate-900' : selectedRecord.status === 'ditolak' ? 'bg-red-2 text-slate-900' : 'bg-slate-200 text-slate-900'
                    ]"
                    style="font-size: 11px; height: 20px; line-height: 20px"
                  >
                    {{
                      selectedRecord.status === 'diajukan'
                        ? 'MENUNGGU'
                        : selectedRecord.status === 'disetujui'
                          ? 'DISETUJUI'
                          : selectedRecord.status === 'ditolak'
                            ? 'DITOLAK'
                            : 'DRAFT'
                    }}
                  </span>
                </div>
                <div class="text-body2 text-md-subtitle1 text-slate-700 q-mt-sm text-weight-medium">
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
                  label="Tolak"
                  icon="close"
                  no-caps
                  style="min-width: 120px;"
                  class="full-width neo-btn neo-btn-danger btn-header-action"
                  @click="updateStatus(selectedRecord.id, 'ditolak')"
                />
              </div>
              <div class="col-6 col-sm-auto">
                <q-btn
                  unelevated
                  label="Setujui"
                  icon="check"
                  no-caps
                  style="min-width: 120px;"
                  class="full-width neo-btn neo-btn-success btn-header-action"
                  @click="updateStatus(selectedRecord.id, 'disetujui')"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- SUMMARY CARD -->
        <q-card flat class="control-panel-card neo-card bg-yellow-1 text-slate-900">
          <q-card-section class="q-pa-lg">
            <div class="row q-col-gutter-md items-center justify-between">
              <div class="col-12 col-md-6 flex items-center q-gutter-x-md">
                <q-icon name="calendar_month" color="slate-900" size="lg" />
                <div>
                  <div class="text-caption text-slate-700 font-weight-bold uppercase">
                    TANGGAL KEHADIRAN
                  </div>
                  <div class="text-h6 text-slate-900 text-weight-bolder font-mono">
                    {{ formatTanggal(selectedRecord.tanggal) }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6 row justify-end q-col-gutter-md text-right-md">
                <div class="col-6 col-md-auto">
                  <div class="text-caption text-slate-700 uppercase font-weight-bold">
                    Total Mandor
                  </div>
                  <div
                    class="text-h5 text-slate-900 text-weight-bold text-center text-md-right"
                  >
                    {{ countMandors(selectedRecord.absen) }}
                  </div>
                </div>
                <div class="col-6 col-md-auto">
                  <div class="text-caption text-slate-700 uppercase font-weight-bold">
                    Total Pekerja
                  </div>
                  <div
                    class="text-h5 text-slate-900 text-weight-bold text-center text-md-right"
                  >
                    {{ countPekerja(selectedRecord.absen) }}
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- MANDORS AND WORKERS LIST (READ ONLY) -->
        <div
          v-if="loadingDetails"
          class="flex flex-center q-pa-xl bg-white neo-card"
        >
          <q-spinner-orbit color="slate-900" size="48px" />
          <div class="text-subtitle2 text-slate-800 q-ml-md">Memuat detail kelompok...</div>
        </div>

        <div
          v-else-if="mandors.length === 0"
          class="text-center q-pa-xl bg-white neo-card"
        >
          <q-icon name="group_off" size="4em" color="slate-900" />
          <div class="text-slate-700 text-subtitle1 q-mt-md">
            Tidak ada data kelompok pekerja mandor terdaftar untuk proyek ini.
          </div>
        </div>

        <div v-else class="mandor-list-container">
          <div v-for="(m, mi) in mandors" :key="m.id" class="mandor-card-wrapper">
            <q-card
              flat
              class="neo-card overflow-hidden"
            >
              <!-- Header Mandor -->
              <div
                class="bg-slate-100 q-pa-md q-pa-sm-lg row items-center justify-between border-bottom mandor-header-row"
              >
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
                      BIDANG:
                      <span class="text-weight-bold text-slate-800">{{
                        (m.bidang || 'Umum').toUpperCase()
                      }}</span>
                      <template v-if="m.spk_nama_kontrak">
                        <span class="q-mx-xs">•</span>
                        <span class="text-slate-900 text-weight-bold">{{
                          m.spk_nama_kontrak
                        }}</span>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- Mandor Status & Group Photo Preview -->
                <div class="row items-center no-wrap q-gutter-x-sm">
                  <q-btn
                    v-if="getMandorFotoBersama(m.id)"
                    no-caps
                    size="sm"
                    class="neo-btn neo-btn-secondary btn-table-action"
                    icon="groups"
                    label="Lihat Foto Bersama"
                    @click="
                      openPhotoPreview(
                        getMandorFotoBersama(m.id),
                        `Foto Bersama - Mandor ${m.nama}`,
                      )
                    "
                  />

                  <div
                    class="row items-center no-wrap q-gutter-x-sm bg-white q-py-xs q-px-md border-thick"
                  >
                    <span class="text-caption text-weight-bold text-slate-700">STATUS MANDOR:</span>
                    <span
                      :class="[
                        'neo-badge text-weight-bold q-px-sm',
                        getMandorStatus(m.id) === 'hadir' ? 'bg-emerald-2 text-slate-900' : 'bg-red-2 text-slate-900'
                      ]"
                    >
                      {{ getMandorStatus(m.id) === 'hadir' ? 'Hadir' : 'Tidak Hadir' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Workers Table -->
              <q-card-section class="q-pa-none">
                <div style="overflow-x: auto; -webkit-overflow-scrolling: touch">
                  <table class="abs-tbl">
                    <thead>
                      <tr class="bg-slate-100">
                        <th
                          style="width: 40px"
                          class="text-center text-weight-bold font-11 tracking-widest"
                        >
                          #
                        </th>
                        <th class="text-left text-weight-bold font-11 tracking-widest">
                          NAMA PEKERJA
                        </th>
                        <th class="text-center text-weight-bold font-11 tracking-widest">
                          JABATAN
                        </th>
                        <th
                          class="text-center text-weight-bold font-11 tracking-widest"
                          style="width: 90px"
                        >
                          JAM MASUK
                        </th>
                        <th
                          class="text-center text-weight-bold font-11 tracking-widest"
                          style="width: 90px"
                        >
                          JAM PULANG
                        </th>
                        <th class="text-right text-weight-bold font-11 tracking-widest">
                          UPAH BASE
                        </th>
                        <th class="text-center text-weight-bold font-11 tracking-widest">KOEF.</th>
                        <th class="text-right text-weight-bold font-11 tracking-widest">
                          UPAH EFEKTIF
                        </th>
                        <th class="text-center text-weight-bold font-11 tracking-widest">LEMBUR (RAW)</th>
                        <th class="text-center text-weight-bold font-11 tracking-widest">KOEF. LEMBUR</th>
                        <th class="text-center text-weight-bold font-11 tracking-widest">TOTAL LEMBUR</th>
                        <th class="text-right text-weight-bold font-11 tracking-widest">
                          UPAH LEMBUR
                        </th>
                        <th
                          class="text-right text-weight-bold font-11 tracking-widest text-teal-10"
                        >
                          TOTAL UPAH
                        </th>
                        <th
                          class="text-center text-weight-bold font-11 tracking-widest"
                          style="width: 70px"
                        >
                          BUKTI
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(p, pi) in m.pekerja" :key="p.id">
                      <td class="text-center text-slate-600 text-weight-bold font-mono">
                        {{ pi + 1 }}
                      </td>
                      <td class="text-weight-bold text-slate-900 uppercase">
                        <div class="row items-center no-wrap">
                          <q-avatar
                            size="28px"
                            color="slate-200"
                            text-color="slate-900"
                            class="q-mr-sm text-weight-bold font-10"
                          >
                            {{ p.nama.substring(0, 2).toUpperCase() }}
                          </q-avatar>
                          <span>{{ p.nama }}</span>
                        </div>
                      </td>
                      <td class="text-center">
                        <span class="neo-badge bg-sky-1 text-slate-900">{{ p.jabatan || 'Tukang' }}</span>
                      </td>
                      <td class="text-center font-mono text-weight-bold text-slate-800">
                        <span v-if="getWorkerJamMasuk(m.id, p.id)">{{
                          getWorkerJamMasuk(m.id, p.id)
                        }}</span>
                        <span v-else class="neo-badge bg-red-2 text-slate-900">Absen</span>
                      </td>
                      <td class="text-center font-mono text-weight-bold text-slate-800">
                        <span v-if="getWorkerJamPulang(m.id, p.id)">{{
                          getWorkerJamPulang(m.id, p.id)
                        }}</span>
                        <span v-else class="neo-badge bg-red-2 text-slate-900">Absen</span>
                      </td>
                      <td class="text-right font-mono font-medium text-slate-700">
                        Rp {{ formatUang(p.upahHari) }}
                      </td>
                      <td class="text-center text-weight-bold text-amber-9 font-mono">
                        {{ (p.koef || 1.0).toFixed(2) }}x
                      </td>
                      <td class="text-right font-mono font-medium text-slate-900">
                        Rp {{ formatUang(calculateWorkerEffectiveWage(p, m.id)) }}
                      </td>
                      <td class="text-center font-mono text-slate-800">
                        {{ getWorkerLembur(m.id, p.id) }} Jam
                      </td>
                      <td class="text-center text-weight-bold text-amber-9 font-mono">
                        {{ (p.koefLembur || 1.0).toFixed(2) }}x
                      </td>
                      <td class="text-center text-slate-900 font-mono text-weight-bolder">
                        {{ (getWorkerLembur(m.id, p.id) * (p.koefLembur || 1.0)).toFixed(2) }} Jam
                      </td>
                      <td class="text-right font-mono font-medium text-slate-900">
                        <div>Rp {{ formatUang(calculateWorkerLemburWage(p, m.id)) }}</div>
                        <div class="text-caption text-slate-600 font-10">
                          Base: Rp {{ formatUang(p.upahLembur !== undefined ? p.upahLembur : rateLembur) }}/Jam
                        </div>
                      </td>
                      <td class="text-right font-mono text-weight-bold text-slate-900">
                        Rp {{ formatUang(calculateWorkerTotalWage(p, m.id)) }}
                      </td>
                      <td class="text-center">
                        <q-btn
                          v-if="getWorkerFoto(m.id, p.id)"
                          no-caps
                          class="neo-btn neo-btn-secondary btn-table-action"
                          icon="photo"
                          size="sm"
                          @click="openPhotoPreview(getWorkerFoto(m.id, p.id), p.nama)"
                        >
                          <q-tooltip>Lihat Foto Bukti</q-tooltip>
                        </q-btn>
                        <span v-else class="text-slate-700 text-weight-bold">-</span>
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
      <div
        class="decision-card-spacing"
        v-if="
          selectedRecord.status === 'diajukan' ||
          selectedRecord.status === 'disetujui' ||
          selectedRecord.status === 'ditolak'
        "
      >
        <q-card flat class="neo-card overflow-hidden bg-white">
          <q-card-section
            :class="
              selectedRecord.status === 'disetujui'
                ? 'bg-emerald-2 text-slate-900'
                : selectedRecord.status === 'ditolak'
                  ? 'bg-red-2 text-slate-900'
                  : 'bg-slate-900 text-white'
            "
            class="text-weight-bold uppercase q-py-md border-bottom"
          >
            <q-icon
              :name="
                selectedRecord.status === 'disetujui'
                  ? 'check_circle'
                  : selectedRecord.status === 'ditolak'
                    ? 'cancel'
                    : 'gavel'
              "
              class="q-mr-sm"
            />
            {{
              selectedRecord.status === 'diajukan'
                ? 'Keputusan Verifikasi Absensi'
                : 'Hasil Verifikasi Absensi oleh HRD'
            }}
          </q-card-section>
          <q-card-section class="q-pa-lg">
            <div class="row q-col-gutter-lg items-center">
              <div
                class="col-12"
                :class="selectedRecord.status === 'diajukan' ? 'col-md-7' : 'col-md-12'"
              >
                <div
                  class="rounded-16 q-pa-md border-thick"
                  :class="
                    selectedRecord.status === 'disetujui'
                      ? 'bg-emerald-1 text-slate-900'
                      : selectedRecord.status === 'ditolak'
                        ? 'bg-red-2 text-slate-900'
                        : 'bg-slate-100 text-slate-800'
                  "
                >
                  <div class="text-subtitle2 text-weight-bold q-mb-xs">
                    <q-icon
                      :name="
                        selectedRecord.status === 'diajukan' ? 'info_outline' : 'rate_review'
                      "
                      class="q-mr-xs"
                    />
                    {{
                      selectedRecord.status === 'diajukan'
                        ? 'Catatan Verifikasi'
                        : 'Keterangan Keputusan'
                    }}
                  </div>
                  <div class="text-body2" style="line-height: 1.6">
                    {{
                      selectedRecord.status === 'diajukan'
                        ? 'Persetujuan laporan ini akan mengesahkan absensi mandor dan pekerja untuk proyek ini pada tanggal tersebut, serta mencatat upah harian ke dalam log pengeluaran proyek. Proses ini tidak dapat dibatalkan.'
                        : selectedRecord.catatan || 'Tidak ada catatan verifikasi dari HRD.'
                    }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-5" v-if="selectedRecord.status === 'diajukan'">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <q-btn
                      unelevated
                      icon="cancel"
                      label="Tolak Laporan"
                      no-caps
                      class="neo-btn neo-btn-danger text-weight-bold full-width"
                      style="min-height: 44px"
                      @click="updateStatus(selectedRecord.id, 'ditolak')"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-btn
                      unelevated
                      icon="check_circle"
                      label="Setujui Laporan"
                      no-caps
                      class="neo-btn neo-btn-success text-weight-bold full-width"
                      style="min-height: 44px"
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
      <q-card
        class="neo-card overflow-hidden bg-white"
        style="width: 550px; max-width: 95vw"
      >
        <!-- Header -->
        <q-card-section
          class="bg-slate-900 text-white row items-center justify-between q-py-md"
        >
          <div class="row items-center">
            <q-icon name="image" size="20px" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-bolder uppercase tracking-wide">
              Detail Foto Bukti
            </div>
          </div>
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-card-section>

        <!-- Image Preview Card -->
        <q-card-section class="q-pa-none bg-slate-950 flex flex-center" style="min-height: 350px">
          <q-img
            :src="previewPhotoUrl"
            style="width: 100%; height: auto; max-height: 480px"
            fit="contain"
          />
        </q-card-section>

        <!-- Footer Title -->
        <q-card-section class="bg-white q-pa-md text-center border-top">
          <div class="text-subtitle2 text-weight-bolder text-slate-900 uppercase">
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
  orderBy,
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
  { name: 'aksi', label: 'VERIFIKASI / AKSI', align: 'center', field: 'id' },
]

// Table headers for decisions history
const columnsHistory = [
  { name: 'proyek', label: 'PROYEK KONSTRUKSI', align: 'left', field: 'projectName' },
  { name: 'tanggal', label: 'TANGGAL KEHADIRAN', align: 'center', field: 'tanggal' },
  { name: 'tanggal_keputusan', label: 'WAKTU KEPUTUSAN', align: 'center', field: 'updatedAt' },
  { name: 'status', label: 'KEPUTUSAN HRD', align: 'center', field: 'status' },
  { name: 'aksi', label: 'AKSI', align: 'center', field: 'id' },
]

// Real-time records listener
const fetchAttendanceRecords = () => {
  loading.value = true
  const q = query(collection(db, 'harian_lepas_absen'), orderBy('updatedAt', 'desc'))

  unsubRecords = onSnapshot(
    q,
    (snap) => {
      allRecords.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      console.error('Error load harian lepas absen:', err)
      loading.value = false
    },
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
    months: [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ],
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
  const q = query(collection(db, 'harian_lepas_mandor'), where('projectId', '==', record.projectId))

  unsubMandors = onSnapshot(
    q,
    (snap) => {
      mandors.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loadingDetails.value = false
    },
    (err) => {
      console.error('Error load mandors detail:', err)
      loadingDetails.value = false
    },
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
  const kl = pekerja.koefLembur || 1.0
  return hours * rate * kl
}

const calculateWorkerTotalWage = (pekerja, mandorId) => {
  return (
    calculateWorkerEffectiveWage(pekerja, mandorId) + calculateWorkerLemburWage(pekerja, mandorId)
  )
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
      placeholder: isSetuju
        ? 'Contoh: Laporan absensi lengkap dan sesuai.'
        : 'Contoh: Absensi tidak sesuai dengan log lapangan.',
    },
    cancel: {
      label: 'Batal',
      color: 'grey-7',
      flat: true,
    },
    ok: {
      label: isSetuju ? 'Setujui' : 'Tolak',
      color: isSetuju ? 'green-6' : 'red-8',
      unelevated: true,
    },
    persistent: true,
  }).onOk(async (catatanInput) => {
    if (!isSetuju && (!catatanInput || !catatanInput.trim())) {
      $q.notify({
        type: 'warning',
        message: 'Alasan penolakan wajib diisi!',
      })
      return
    }

    loading.value = true
    try {
      await updateDoc(doc(db, 'harian_lepas_absen', id), {
        status: newStatus,
        catatan: catatanInput ? catatanInput.trim() : '',
        updatedAt: serverTimestamp(),
      })
      $q.notify({
        type: 'positive',
        message: `Laporan absensi proyek berhasil diperbarui ke status: ${newStatus.toUpperCase()}`,
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
        message: 'Gagal memperbarui status absensi: ' + err.message,
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
    message:
      'Apakah Anda yakin ingin menghapus catatan riwayat persetujuan absensi ini dari database?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true
    try {
      await deleteDoc(doc(db, 'harian_lepas_absen', id))
      $q.notify({
        type: 'positive',
        message: 'Catatan riwayat absensi berhasil dihapus!',
      })
    } catch (err) {
      console.error('Error delete document:', err)
      $q.notify({
        type: 'negative',
        message: 'Gagal menghapus riwayat: ' + err.message,
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
.border-top {
  border-top: 2px solid #0f172a;
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

/* Responsive Padding & Centering Container */
.premium-container {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  padding: 24px 16px;
  position: relative;
  z-index: 1;
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
.neo-btn-success {
  background-color: #22c55e !important;
  color: #ffffff !important;
}
.neo-btn-success:hover {
  background-color: #16a34a !important;
}
.neo-btn-danger {
  background-color: #ef4444 !important;
  color: #ffffff !important;
}
.neo-btn-danger:hover {
  background-color: #dc2626 !important;
}

/* CUSTOM COLOR UTILITIES */
.bg-yellow-1 { background-color: #fef9c3 !important; }
.bg-yellow-3 { background-color: #fde047 !important; }
.bg-emerald-1 { background-color: #d1fae5 !important; }
.bg-emerald-2 { background-color: #6ee7b7 !important; }
.bg-sky-1 { background-color: #e0f2fe !important; }
.bg-red-2 { background-color: #fecaca !important; }
.text-slate-900 { color: #0f172a !important; }
.text-slate-800 { color: #1e293b !important; }
.text-slate-700 { color: #334155 !important; }
.text-slate-600 { color: #475569 !important; }

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

/* Apple-style icons box renamed and brutalized */
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

/* RESPONSIVE LAYOUTS & GAPS */
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

.list-header-row {
  margin-bottom: 20px;
}
@media (min-width: 600px) {
  .list-header-row {
    margin-bottom: 32px;
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

.detail-header-row {
  margin-bottom: 20px;
}
@media (min-width: 600px) {
  .detail-header-row {
    margin-bottom: 32px;
  }
}
.btn-header-action {
  height: 40px;
  min-height: 40px;
  font-size: 12px !important;
  line-height: 1.2;
}

.control-panel-card {
  margin-bottom: 20px;
}
@media (min-width: 600px) {
  .control-panel-card {
    margin-bottom: 32px;
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

.decision-card-spacing {
  margin-top: 16px;
}
@media (min-width: 600px) {
  .decision-card-spacing {
    margin-top: 24px;
  }
}

.mandor-header-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
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
<style>
/* Global overrides to force side-by-side icon layout on action buttons */
.btn-table-action .q-btn__content {
  flex-direction: row !important;
  flex-wrap: nowrap !important;
}
.btn-table-action .q-icon {
  font-size: 14px !important;
  margin-right: 6px !important;
}
</style>
