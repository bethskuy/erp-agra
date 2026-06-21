<template>
  <q-page class="neo-page-bg q-pa-md q-pa-lg font-inter">
    <!-- Decorative Floating Neo-Brutalist Shapes -->
    <div class="neo-decorations-container">
      <div class="neo-shape neo-shape--circle-1"></div>
      <div class="neo-shape neo-shape--circle-2"></div>
      <div class="neo-shape neo-shape--square-1"></div>
      <div class="neo-shape neo-shape--square-2"></div>
      <div class="neo-shape neo-shape--star-1">★</div>
      <div class="neo-shape neo-shape--star-2">★</div>
      <div class="neo-shape neo-shape--triangle-1">▲</div>
      <div class="neo-shape neo-shape--triangle-2">▲</div>
      <div class="neo-shape neo-shape--cross-1">+</div>
      <div class="neo-shape neo-shape--cross-2">+</div>
      <div class="neo-shape neo-shape--cross-3">+</div>
      <div class="neo-shape neo-shape--blob-1"></div>
    </div>

    <div class="premium-container q-mx-auto">
      <!-- =====================================================================================
           VIEW 1: LIST (DEFAULT)
           ===================================================================================== -->
      <div v-if="viewMode === 'list'" class="animate-fade-in">
        <!-- HEADER -->
        <div class="row items-center justify-between q-mb-xl header-entrance">
          <div class="col-12 col-md-8">
            <div class="row items-center no-wrap q-mb-xs">
              <div class="ios-icon-box small bg-orange-50 text-orange-6 q-mr-sm flex-shrink-0">
                <q-icon name="rule_folder" size="20px" />
              </div>
              <h4
                class="text-h4 text-weight-bolder text-blue-grey-10 q-ma-none letter-spacing-tight"
              >
                Persetujuan Izin &amp; Sakit
              </h4>
            </div>
            <div class="text-subtitle1 text-blue-grey-6 q-mt-sm line-height-normal">
              Halaman otorisasi HRD/Admin harian untuk memvalidasi dispensasi ketidakhadiran &amp;
              absensi manual.
            </div>
          </div>
        </div>

        <!-- TABEL 1: MENUNGGU PERSETUJUAN (PENDING) -->
        <div class="q-mb-md row items-center no-wrap">
          <q-icon name="pending_actions" color="orange-6" size="sm" class="q-mr-sm flex-shrink-0" />
          <span class="text-h6 text-weight-bold text-blue-grey-9 tracking-wide col"
            >Antrean Izin Menunggu Verifikasi</span
          >
          <q-badge color="orange-6" class="q-ml-sm rounded-6 text-weight-bold shadow-1 flex-shrink-0">{{
            pendingRows.length
          }}</q-badge>
        </div>

        <q-card flat class="neo-card overflow-hidden table-entrance q-mb-xl">
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
              <q-tr :props="props">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="text-weight-bolder text-blue-grey-5 uppercase letter-spacing-1 bg-grey-1"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr
                :props="props"
                class="hover-effect cursor-pointer transition-smooth"
                @click="bukaDetailFullPage(props.row)"
              >
                <!-- Info Karyawan -->
                <q-td key="karyawan" class="text-left">
                  <div class="row items-center no-wrap">
                    <q-avatar
                      size="42px"
                      :color="getRandomColor(props.row.nama_karyawan)"
                      text-color="white"
                      class="q-mr-md text-weight-bold shadow-1 neo-avatar-border"
                    >
                      <img
                        v-if="getFotoProfil(props.row.nama_karyawan)"
                        :src="getFotoProfil(props.row.nama_karyawan)"
                        style="object-fit: cover"
                      />
                      <span v-else>{{ getInitial(props.row.nama_karyawan) }}</span>
                    </q-avatar>
                    <div>
                      <div class="text-weight-bolder text-blue-grey-10 text-uppercase">
                        {{ props.row.nama_karyawan }}
                      </div>
                      <div class="text-caption text-blue-grey-5 font-mono text-weight-medium">
                        NIK: {{ getNik(props.row.nama_karyawan) }}
                      </div>
                    </div>
                  </div>
                </q-td>

                <!-- Jenis Pengajuan -->
                <q-td key="jenis" class="text-center">
                  <q-badge
                    outline
                    :color="getJenisColor(props.row.jenis_pengajuan)"
                    class="q-px-sm q-py-xs rounded-6 text-weight-bold bg-white"
                  >
                    {{ props.row.jenis_pengajuan }}
                  </q-badge>
                </q-td>

                <!-- Tanggal -->
                <q-td key="tanggal" class="text-center">
                  <div class="text-weight-bold text-blue-grey-8">
                    {{ formatDate(props.row.tanggal_mulai) }}
                  </div>
                  <div v-if="props.row.tanggal_mulai !== props.row.tanggal_selesai">
                    <q-icon name="arrow_downward" color="grey-5" size="xs" class="q-my-xs" />
                    <div class="text-weight-bold text-blue-grey-8">
                      {{ formatDate(props.row.tanggal_selesai) }}
                    </div>
                  </div>
                  <div class="text-caption text-indigo-7 text-weight-bold q-mt-xs">
                    ({{ props.row.total_hari || 1 }} Hari Kerja)
                  </div>
                </q-td>

                <!-- Alasan & Lampiran -->
                <q-td key="alasan" class="text-left" @click.stop>
                  <div
                    class="text-body2 text-blue-grey-9 text-weight-medium line-height-tight q-mb-sm"
                    style="max-width: 250px; white-space: normal"
                  >
                    "{{ props.row.alasan }}"
                  </div>
                  <div class="row q-gutter-x-sm items-center">
                    <q-btn
                      v-if="props.row.dokumen_url"
                      unelevated
                      color="primary"
                      label="Lihat Surat Dokter"
                      icon="file_present"
                      class="rounded-6 text-weight-bold q-px-sm shadow-soft transition-smooth"
                      size="sm"
                      @click="bukaLampiran(props.row.dokumen_url)"
                    />
                    <div
                      v-if="props.row.delegasi"
                      class="q-py-xs q-px-sm rounded-6 text-weight-bold row items-center"
                      style="background: #dbeafe; color: #1d4ed8; font-size: 12px"
                    >
                      <q-icon name="person_add" size="14px" class="q-mr-xs" /> Delegasi:
                      {{ props.row.delegasi }}
                    </div>
                  </div>
                </q-td>

                <!-- Aksi Keputusan -->
                <q-td key="aksi" class="text-center" @click.stop>
                  <div class="row items-center justify-center no-wrap">
                    <q-btn
                      unelevated
                      color="green-6"
                      class="neo-btn q-px-md q-py-xs"
                      style="font-size: 11px; min-height: unset;"
                      @click="updateStatus(props.row.id, 'Approved')"
                    >
                      <div class="row items-center no-wrap q-gutter-x-xs">
                        <q-icon name="check" size="18px" class="text-white text-weight-bolder" />
                        <span class="text-white text-weight-bolder">SETUJUI</span>
                      </div>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      icon="close"
                      size="14px"
                      class="neo-delete-btn q-ml-sm"
                      @click="updateStatus(props.row.id, 'Rejected')"
                    >
                      <q-tooltip class="bg-negative text-weight-bold">Tolak Pengajuan</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:loading>
              <q-inner-loading showing color="orange">
                <q-spinner-dots size="50px" color="orange" />
                <div class="text-orange q-mt-md text-weight-medium">Mengambil antrean izin...</div>
              </q-inner-loading>
            </template>

            <template v-slot:no-data>
              <div class="full-width column flex-center q-pa-xl text-blue-grey-4">
                <q-icon size="4em" name="task_alt" class="q-mb-md opacity-50" color="green-4" />
                <div class="text-h6 text-weight-bold text-blue-grey-6">Semua Selesai!</div>
                <div class="text-caption">
                  Tidak ada pengajuan izin harian yang tertunda saat ini.
                </div>
              </div>
            </template>
          </q-table>
        </q-card>

        <!-- TABEL 2: RIWAYAT -->
        <div class="q-mb-md q-mt-xl row items-center no-wrap">
          <q-icon name="history" color="blue-grey-5" size="sm" class="q-mr-sm flex-shrink-0" />
          <span class="text-h6 text-weight-bold text-blue-grey-8 tracking-wide col"
            >Riwayat Pengambilan Keputusan Izin</span
          >
        </div>

        <q-card flat class="neo-card overflow-hidden table-entrance">
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
              <q-tr :props="props">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="text-weight-bolder text-blue-grey-5 uppercase letter-spacing-1 bg-grey-1"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props" class="hover-effect">
                <q-td key="karyawan" class="text-left">
                  <div class="row items-center no-wrap">
                    <q-avatar
                      size="36px"
                      :color="getRandomColor(props.row.nama_karyawan)"
                      text-color="white"
                      class="q-mr-md text-weight-bold shadow-1 opacity-80 neo-avatar-border"
                    >
                      <img
                        v-if="getFotoProfil(props.row.nama_karyawan)"
                        :src="getFotoProfil(props.row.nama_karyawan)"
                        style="object-fit: cover"
                      />
                      <span v-else>{{ getInitial(props.row.nama_karyawan) }}</span>
                    </q-avatar>
                    <div>
                      <div class="text-weight-bold text-blue-grey-9 text-uppercase">
                        {{ props.row.nama_karyawan }}
                      </div>
                      <div class="text-caption text-blue-grey-4 font-mono">
                        NIK: {{ getNik(props.row.nama_karyawan) }}
                      </div>
                    </div>
                  </div>
                </q-td>
                <q-td key="jenis" class="text-center">
                  <q-badge
                    outline
                    :color="getJenisColor(props.row.jenis_pengajuan)"
                    class="q-px-sm q-py-xs rounded-6 text-weight-bold bg-white"
                  >
                    {{ props.row.jenis_pengajuan }}
                  </q-badge>
                </q-td>
                <q-td key="tanggal" class="text-center">
                  <span class="font-mono text-blue-grey-8 text-weight-medium">{{
                    formatDate(props.row.tanggal_mulai)
                  }}</span>
                  <span
                    v-if="props.row.tanggal_mulai !== props.row.tanggal_selesai"
                    class="font-mono text-blue-grey-8 text-weight-medium"
                  >
                    <q-icon name="arrow_forward" size="10px" class="q-mx-xs text-grey-5" />
                    {{ formatDate(props.row.tanggal_selesai) }}
                  </span>
                </q-td>
                <q-td key="status" class="text-center">
                  <q-badge
                    :color="props.row.status_approval === 'Approved' ? 'teal-5' : 'red-5'"
                    class="q-px-md q-py-sm text-weight-bold rounded-8 shadow-1"
                  >
                    <q-icon
                      :name="props.row.status_approval === 'Approved' ? 'check_circle' : 'cancel'"
                      size="xs"
                      class="q-mr-xs"
                    />
                    {{ props.row.status_approval === 'Approved' ? 'DISETUJUI' : 'DITOLAK' }}
                  </q-badge>
                </q-td>
                <q-td key="aksi" class="text-center">
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete_outline"
                    class="neo-delete-btn"
                    size="sm"
                    @click="hapusData(props.row.id)"
                  >
                    <q-tooltip class="bg-red-8">Hapus Riwayat</q-tooltip>
                  </q-btn>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:no-data>
              <div class="full-width row items-center q-pa-xl justify-center text-blue-grey-4">
                <q-icon size="2em" name="history" class="q-mr-sm" />
                <div class="text-weight-medium">Belum ada riwayat dispensasi/izin harian.</div>
              </div>
            </template>
          </q-table>
        </q-card>
      </div>
      <!-- END VIEW LIST -->

      <!-- =====================================================================================
           VIEW 2: DETAIL FULL PAGE
           ===================================================================================== -->
      <div v-else-if="viewMode === 'detail-full' && selectedIzin" class="animate-fade-in">
        <!-- BACK HEADER -->
        <div class="row items-center justify-between q-mb-xl">
          <div class="col-12 col-md-8 q-mb-md q-mb-md-none">
            <div class="row items-center no-wrap">
              <q-btn
                flat
                round
                icon="arrow_back"
                @click="viewMode = 'list'"
                class="q-mr-md neo-nav-btn"
              />
              <div>
                <div
                  class="text-h4 text-weight-bolder text-blue-grey-10 letter-spacing-tight uppercase"
                >
                  Detail Pengajuan Izin
                </div>
                <div class="text-subtitle2 text-blue-grey-5 q-mt-xs">
                  Verifikasi dan keputusan pengajuan izin / sakit karyawan
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="row justify-end q-gutter-sm">
              <q-btn
                unelevated
                color="negative"
                label="TOLAK"
                icon="close"
                class="neo-delete-btn q-px-lg text-weight-bold"
                @click="updateStatus(selectedIzin.id, 'Rejected')"
              />
              <q-btn
                unelevated
                color="green-6"
                label="SETUJUI IZIN"
                icon="check"
                class="neo-btn q-px-lg text-weight-bold"
                @click="updateStatus(selectedIzin.id, 'Approved')"
              />
            </div>
          </div>
        </div>

        <div class="row justify-center">
          <div class="col-12 col-xl-10">
            <!-- PROFILE HEADER CARD -->
            <q-card flat class="neo-card q-mb-xl overflow-hidden">
              <div class="row">
                <!-- Avatar Side -->
                <div
                  class="col-12 col-md-4 flex flex-center q-pa-xl"
                  style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border-right: 3px solid #0f172a;"
                >
                  <div class="column items-center text-center">
                    <q-avatar
                      size="120px"
                      :color="getRandomColor(selectedIzin.nama_karyawan)"
                      text-color="white"
                      class="text-weight-bolder text-h3 q-mb-md neo-avatar-border"
                      style="border: 4px solid #0f172a !important"
                    >
                      <img
                        v-if="getFotoProfil(selectedIzin.nama_karyawan)"
                        :src="getFotoProfil(selectedIzin.nama_karyawan)"
                        style="object-fit: cover"
                      />
                      <span v-else>{{ getInitial(selectedIzin.nama_karyawan) }}</span>
                    </q-avatar>
                    <q-badge
                      :color="getJenisColor(selectedIzin.jenis_pengajuan)"
                      class="q-px-md q-py-sm rounded-8 text-weight-bolder"
                      style="font-size: 12px"
                    >
                      <q-icon name="rule_folder" size="14px" class="q-mr-xs" />
                      {{ selectedIzin.jenis_pengajuan }}
                    </q-badge>
                  </div>
                </div>

                <!-- Info Side -->
                <div class="col-12 col-md-8 q-pa-xl">
                  <div
                    class="text-h3 text-weight-bolder text-blue-grey-10 q-mb-xs uppercase letter-spacing-tight"
                  >
                    {{ selectedIzin.nama_karyawan }}
                  </div>
                  <div class="text-h6 text-blue-grey-5 q-mb-lg row items-center">
                    <q-icon name="badge" class="q-mr-sm" />
                    <span class="font-mono">NIK: {{ getNik(selectedIzin.nama_karyawan) }}</span>
                  </div>

                  <div class="row q-col-gutter-lg">
                    <div class="col-12 col-sm-6">
                      <div
                        class="text-overline text-blue-grey-5 text-weight-bold"
                        style="letter-spacing: 2px; font-size: 10px"
                      >
                        Jenis Pengajuan
                      </div>
                      <div
                        class="text-subtitle1 text-weight-bolder q-mt-xs"
                        :class="'text-' + getJenisColor(selectedIzin.jenis_pengajuan)"
                      >
                        <q-icon name="rule_folder" class="q-mr-xs" />
                        {{ selectedIzin.jenis_pengajuan }}
                      </div>
                    </div>
                    <div class="col-12 col-sm-6">
                      <div
                        class="text-overline text-blue-grey-5 text-weight-bold"
                        style="letter-spacing: 2px; font-size: 10px"
                      >
                        Status Saat Ini
                      </div>
                      <div class="q-mt-xs">
                        <q-badge
                          color="orange-2"
                          text-color="orange-9"
                          class="q-px-md q-py-sm text-weight-bolder"
                          style="font-size: 13px; border: 1.5px solid #0f172a;"
                        >
                          <q-icon name="pending_actions" class="q-mr-xs" size="sm" />
                          Menunggu Verifikasi HRD
                        </q-badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card>

            <!-- DETAIL GRID -->
            <div class="row q-col-gutter-xl">
              <!-- KIRI: Tanggal & Durasi -->
              <div class="col-12 col-md-6">
                <q-card flat class="neo-card full-height">
                  <q-card-section
                    class="text-weight-bold uppercase q-py-md bg-white neo-table-toolbar"
                    style="
                      color: #3730a3;
                      letter-spacing: 1.5px;
                      font-size: 11px;
                    "
                  >
                    <q-icon name="date_range" class="q-mr-sm" /> Informasi Waktu Izin
                  </q-card-section>
                  <q-card-section class="q-pa-lg">
                    <div class="q-gutter-y-lg">
                      <!-- Timeline -->
                      <div class="row items-center q-mb-md">
                        <div class="col">
                          <div
                            class="text-caption text-blue-grey-5 text-weight-bold uppercase"
                            style="letter-spacing: 1px; font-size: 10px"
                          >
                            Tanggal Mulai
                          </div>
                          <div class="text-h6 text-weight-bolder text-indigo-9 q-mt-xs">
                            {{ formatDate(selectedIzin.tanggal_mulai) }}
                          </div>
                        </div>
                        <div class="col-auto q-px-md text-center">
                          <q-icon name="arrow_forward" color="blue-grey-3" size="sm" />
                          <div class="text-caption text-blue-grey-4 text-weight-bold q-mt-xs">
                            {{ selectedIzin.total_hari || 1 }} Hari
                          </div>
                        </div>
                        <div class="col text-right">
                          <div
                            class="text-caption text-blue-grey-5 text-weight-bold uppercase"
                            style="letter-spacing: 1px; font-size: 10px"
                          >
                            Tanggal Selesai
                          </div>
                          <div class="text-h6 text-weight-bolder text-indigo-9 q-mt-xs">
                            {{ formatDate(selectedIzin.tanggal_selesai) }}
                          </div>
                        </div>
                      </div>

                      <!-- Durasi Badge -->
                      <div
                        class="rounded-16 q-pa-md text-center"
                        style="background: linear-gradient(135deg, #e0e7ff, #ede9fe); border: 2px solid #0f172a;"
                      >
                        <div
                          class="text-caption text-blue-grey-6 text-weight-bold uppercase q-mb-xs"
                          style="letter-spacing: 1px"
                        >
                          Total Durasi
                        </div>
                        <div class="text-h4 text-weight-bolder text-indigo-8">
                          {{ selectedIzin.total_hari || 1 }}
                        </div>
                        <div class="text-subtitle2 text-indigo-6 text-weight-medium">
                          Hari Kerja Efektif
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- KANAN: Alasan & Dokumen -->
              <div class="col-12 col-md-6">
                <q-card flat class="neo-card full-height">
                  <q-card-section
                    class="text-weight-bold uppercase q-py-md bg-white neo-table-toolbar"
                    style="
                      color: #c2410c;
                      letter-spacing: 1.5px;
                      font-size: 11px;
                    "
                  >
                    <q-icon name="chat_bubble_outline" class="q-mr-sm" /> Keterangan & Lampiran
                  </q-card-section>
                  <q-card-section class="q-pa-lg">
                    <div class="q-gutter-y-md">
                      <!-- Alasan -->
                      <div>
                        <div
                          class="text-caption text-blue-grey-5 text-weight-bold uppercase q-mb-sm"
                          style="letter-spacing: 1px; font-size: 10px"
                        >
                          Alasan Karyawan
                        </div>
                        <div
                          class="rounded-12 q-pa-md bg-orange-50"
                          style="border: 2px solid #0f172a;"
                        >
                          <div
                            class="text-body1 text-blue-grey-9 text-weight-medium"
                            style="line-height: 1.6; font-style: italic"
                          >
                            "{{ selectedIzin.alasan || 'Tidak ada keterangan.' }}"
                          </div>
                        </div>
                      </div>

                      <!-- Delegasi -->
                      <div v-if="selectedIzin.delegasi">
                        <div
                          class="text-caption text-blue-grey-5 text-weight-bold uppercase q-mb-sm"
                          style="letter-spacing: 1px; font-size: 10px"
                        >
                          Delegasi Tugas
                        </div>
                        <div class="rounded-12 q-pa-md bg-cyan-50 row items-center" style="border: 2px solid #0f172a;">
                          <q-avatar
                            size="36px"
                            color="cyan-7"
                            text-color="white"
                            class="q-mr-sm text-weight-bold neo-avatar-border"
                          >
                            {{ selectedIzin.delegasi?.charAt(0)?.toUpperCase() }}
                          </q-avatar>
                          <div>
                            <div class="text-weight-bolder text-cyan-9">
                              {{ selectedIzin.delegasi }}
                            </div>
                            <div class="text-caption text-blue-grey-5">Penerima Delegasi Tugas</div>
                          </div>
                        </div>
                      </div>

                      <!-- Dokumen / Surat Dokter -->
                      <div v-if="selectedIzin.dokumen_url">
                        <div
                          class="text-caption text-blue-grey-5 text-weight-bold uppercase q-mb-sm"
                          style="letter-spacing: 1px; font-size: 10px"
                        >
                          Lampiran Surat Keterangan
                        </div>
                        <q-btn
                          unelevated
                          color="primary"
                          icon="file_present"
                          label="Lihat Surat Dokter / Lampiran"
                          class="neo-btn text-weight-bold full-width"
                          @click="bukaLampiran(selectedIzin.dokumen_url)"
                        />
                        <!-- Preview inline jika gambar -->
                        <q-card
                          v-if="isImage(selectedIzin.dokumen_url)"
                          flat
                          class="q-mt-md neo-card overflow-hidden"
                        >
                          <img
                            :src="selectedIzin.dokumen_url"
                            style="width: 100%; max-height: 300px; object-fit: cover"
                          />
                        </q-card>
                      </div>

                      <!-- Tidak ada lampiran -->
                      <div
                        v-if="!selectedIzin.dokumen_url && !selectedIzin.delegasi"
                        class="rounded-12 q-pa-md bg-grey-1 text-center text-blue-grey-4"
                        style="border: 2px solid #0f172a;"
                      >
                        <q-icon name="attach_file" size="24px" class="q-mb-xs" />
                        <div class="text-caption">Tidak ada lampiran dokumen</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- BAWAH: Tombol Aksi Keputusan Final -->
              <div class="col-12 q-mb-xl">
                <q-card flat class="neo-card overflow-hidden">
                  <q-card-section
                    class="bg-white text-weight-bold uppercase q-py-md neo-table-toolbar"
                    style="letter-spacing: 1.5px; font-size: 11px; color: #0f5132;"
                  >
                    <q-icon name="gavel" class="q-mr-sm" /> Keputusan HRD/Admin
                  </q-card-section>
                  <q-card-section class="q-pa-lg">
                    <div class="row q-col-gutter-lg items-center">
                      <div class="col-12 col-md-7">
                        <div class="rounded-16 q-pa-md bg-blue-grey-1" style="border: 2px solid #0f172a;">
                          <div class="text-subtitle2 text-weight-bold text-blue-grey-8 q-mb-xs">
                            <q-icon name="info_outline" class="q-mr-xs" /> Catatan Penting
                          </div>
                          <div class="text-body2 text-blue-grey-7" style="line-height: 1.6">
                            Persetujuan atau penolakan bersifat final dari pihak HRD/Admin harian.
                            Karyawan akan menerima notifikasi atas keputusan yang diambil. Fitur
                            revisi tanggal hanya tersedia di halaman Persetujuan Cuti (otoritas
                            Direksi).
                          </div>
                        </div>
                      </div>
                      <div class="col-12 col-md-5">
                        <div class="column q-gutter-y-sm">
                          <q-btn
                            unelevated
                            color="green-6"
                            icon="check_circle"
                            label="SETUJUI PENGAJUAN INI"
                            class="neo-btn text-weight-bold full-width q-py-sm"
                            @click="updateStatus(selectedIzin.id, 'Approved')"
                          />
                          <q-btn
                            unelevated
                            color="negative"
                            icon="cancel"
                            label="TOLAK PENGAJUAN INI"
                            class="neo-delete-btn text-weight-bold full-width q-py-sm"
                            @click="updateStatus(selectedIzin.id, 'Rejected')"
                          />
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- END VIEW DETAIL FULL -->
    </div>

    <!-- PREVIEW LIGHTBOX SURAT DOKTER -->
    <q-dialog v-model="viewerDialog" backdrop-filter="blur(8px)">
      <q-card
        style="width: 600px; max-width: 95vw"
        class="neo-card overflow-hidden"
      >
        <!-- Dialog Header -->
        <q-card-section class="row items-center q-py-md q-px-lg neo-table-toolbar bg-white">
          <div class="row items-center">
            <q-icon name="image" color="primary" size="24px" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-bold text-blue-grey-10">
              Dokumen Lampiran / Surat Keterangan
            </div>
          </div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            color="red-6"
            class="neo-delete-btn"
          />
        </q-card-section>

        <!-- Lightbox Content -->
        <div class="q-pa-md bg-grey-1 flex flex-center">
          <q-img :src="selectedDoc" style="max-height: 70vh; object-fit: contain; border: 2.5px solid #0f172a;" class="rounded-12 shadow-2" />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useQuasar, date } from 'quasar'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore'

const $q = useQuasar()
const loading = ref(true)
const allData = ref([])
const karyawanMap = ref({})

// View Mode Switcher
const viewMode = ref('list') // 'list' | 'detail-full'
const selectedIzin = ref(null)

// Lightbox Document Viewer
const viewerDialog = ref(false)
const selectedDoc = ref(null)

const columns = [
  { name: 'karyawan', label: 'INFORMASI KARYAWAN', align: 'left', field: 'nama_karyawan' },
  { name: 'jenis', label: 'JENIS PENGAJUAN', align: 'center', field: 'jenis_pengajuan' },
  { name: 'tanggal', label: 'TANGGAL & DURASI', align: 'center', field: 'tanggal_mulai' },
  { name: 'alasan', label: 'ALASAN & LAMPIRAN SURAT KETERANGAN', align: 'left', field: 'alasan' },
  { name: 'aksi', label: 'KEPUTUSAN', align: 'center', field: 'aksi' },
]

const columnsHistory = [
  { name: 'karyawan', label: 'INFORMASI KARYAWAN', align: 'left', field: 'nama_karyawan' },
  { name: 'jenis', label: 'JENIS PENGAJUAN', align: 'center', field: 'jenis_pengajuan' },
  { name: 'tanggal', label: 'TANGGAL PELAKSANAAN', align: 'center', field: 'tanggal_mulai' },
  { name: 'status', label: 'STATUS FINAL', align: 'center', field: 'status_approval' },
  { name: 'aksi', label: 'HAPUS', align: 'center', field: 'aksi' },
]

const pendingRows = computed(() => {
  return allData.value.filter(
    (d) => d.status_approval === 'Pending' && d.jenis_pengajuan !== 'Cuti Tahunan',
  )
})

const completedRows = computed(() => {
  return allData.value.filter(
    (d) => d.status_approval !== 'Pending' && d.jenis_pengajuan !== 'Cuti Tahunan',
  )
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return date.formatDate(d, 'DD MMM YYYY')
}

const getInitial = (name) => {
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
}

const getRandomColor = (name) => {
  if (!name) return 'primary'
  const colors = [
    'blue-6',
    'teal-6',
    'indigo-5',
    'deep-purple-5',
    'cyan-7',
    'light-blue-7',
    'pink-6',
  ]
  const index = name.length % colors.length
  return colors[index]
}

const getJenisColor = (jenis) => {
  if (!jenis) return 'primary'
  const j = jenis.toLowerCase()
  if (j.includes('sakit')) return 'red-8'
  if (j.includes('manual')) return 'orange-8'
  return 'blue-grey-8'
}

const getNik = (nama) => {
  if (!nama) return '-'
  return karyawanMap.value[nama.toUpperCase()]?.nik || 'Tidak Tersedia'
}

const getFotoProfil = (nama) => {
  if (!nama) return ''
  return karyawanMap.value[nama.toUpperCase()]?.foto_profil || ''
}

const isImage = (url) => {
  if (!url) return false
  return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null || url.startsWith('data:image/')
}

const bukaLampiran = (url) => {
  selectedDoc.value = url
  viewerDialog.value = true
}

// Buka full-page detail view
const bukaDetailFullPage = (row) => {
  selectedIzin.value = row
  viewMode.value = 'detail-full'
  window.scrollTo(0, 0)
}

let unsubscribeData = null

const loadKaryawan = async () => {
  try {
    const snap = await getDocs(collection(db, 'karyawan'))
    snap.forEach((docObj) => {
      const data = docObj.data()
      if (data.nama) {
        karyawanMap.value[data.nama.toUpperCase()] = {
          id: docObj.id,
          nik: data.nik || 'Tidak Tersedia',
          foto_profil: data.fotoUrl || data.foto_profil || '',
        }
      }
    })
  } catch (error) {
    console.error('Gagal load NIK Karyawan', error)
  }
}

const loadDataRealtime = () => {
  const qData = query(collection(db, 'pengajuan'), orderBy('created_at', 'desc'))
  unsubscribeData = onSnapshot(
    qData,
    (snap) => {
      allData.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      console.error('Gagal fetch realtime pengajuan: ', err)
      loading.value = false
    },
  )
}

// AKSI: SETUJUI / TOLAK
const updateStatus = (id, newStatus) => {
  const statusIndo = newStatus === 'Approved' ? 'Setujui' : 'Tolak'
  const statusColor = newStatus === 'Approved' ? 'positive' : 'negative'

  $q.dialog({
    title: 'Konfirmasi Keputusan',
    message: `Apakah Anda yakin ingin <b>${statusIndo}</b> pengajuan izin harian ini?`,
    html: true,
    persistent: true,
    ok: {
      color: statusColor,
      label: 'Ya, Lanjutkan',
      unelevated: true,
      class: 'rounded-8 text-weight-bold',
    },
    cancel: { flat: true, color: 'blue-grey-6', class: 'text-weight-bold' },
    class: 'rounded-16',
  }).onOk(async () => {
    try {
      $q.loading.show()
      await updateDoc(doc(db, 'pengajuan', id), { status_approval: newStatus })
      selectedIzin.value = null
      viewMode.value = 'list'
      $q.notify({
        color: 'positive',
        message: 'Pengajuan berhasil diproses!',
        icon: 'check_circle',
      })
    } catch (error) {
      console.error(error)
      $q.notify({ color: 'negative', message: 'Gagal memproses pengajuan.' })
    } finally {
      $q.loading.hide()
    }
  })
}

// AKSI: HAPUS RIWAYAT
const hapusData = (id) => {
  $q.dialog({
    title: 'Hapus Riwayat',
    message: 'Data yang dihapus tidak dapat dikembalikan. Lanjutkan?',
    persistent: true,
    ok: { flat: true, color: 'negative', label: 'Hapus Permanen' },
    cancel: { flat: true, color: 'blue-grey-6', label: 'Batal' },
    class: 'rounded-16',
  }).onOk(async () => {
    try {
      $q.loading.show()
      await deleteDoc(doc(db, 'pengajuan', id))
      $q.notify({ color: 'primary', message: 'Riwayat berhasil dibersihkan.', icon: 'delete' })
    } catch (error) {
      console.error(error)
      $q.notify({ color: 'negative', message: 'Gagal menghapus data.' })
    } finally {
      $q.loading.hide()
    }
  })
}

onMounted(async () => {
  await loadKaryawan()
  loadDataRealtime()
})

onUnmounted(() => {
  if (unsubscribeData) unsubscribeData()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
}
.font-mono {
  font-family: 'JetBrains Mono', monospace;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.letter-spacing-tight {
  letter-spacing: -0.5px;
}
.tracking-wide {
  letter-spacing: 0.5px;
}
.line-height-tight {
  line-height: 1.2;
}
.line-height-normal {
  line-height: 1.4;
}
.uppercase {
  text-transform: uppercase;
}

.premium-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  width: 100%;
}

/* NEO-BRUTALIST STYLING CORE */
.neo-page-bg {
  background-color: #f1f5f9;
  background-image: radial-gradient(#cbd5e1 2px, transparent 2px);
  background-size: 24px 24px;
  position: relative;
  min-height: 100vh;
}

.neo-card {
  background: #ffffff !important;
  border: 3px solid #0f172a !important;
  box-shadow: 6px 6px 0px #0f172a !important;
  border-radius: 20px !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.neo-card:hover {
  transform: translateY(-2px) translateX(2px);
  box-shadow: 8px 8px 0px #0f172a !important;
}

.neo-btn {
  border: 2.5px solid #0f172a !important;
  box-shadow: 3.5px 3.5px 0px #0f172a !important;
  border-radius: 12px;
  font-weight: 700;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.neo-btn:hover {
  transform: translateY(-1px) translateX(1px);
  box-shadow: 2.5px 2.5px 0px #0f172a !important;
}

.neo-btn:active {
  transform: translateY(2px) translateX(2px);
  box-shadow: 0px 0px 0px #0f172a !important;
}

.neo-nav-btn {
  border: 2px solid #0f172a !important;
  background: #ffffff !important;
  color: #0f172a !important;
  transition: all 0.2s ease;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  box-shadow: 2px 2px 0px #0f172a !important;
}

.neo-nav-btn:hover {
  background: #e0f2fe !important;
  transform: translateY(-1px) translateX(1px);
  box-shadow: 1.5px 1.5px 0px #0f172a !important;
}

.neo-nav-btn:active {
  transform: translateY(1.5px) translateX(1.5px);
  box-shadow: 0px 0px 0px #0f172a !important;
}

.neo-edit-btn {
  border: 1.5px solid #0f172a !important;
  background: #e0f2fe !important;
  color: #1d4ed8 !important;
  transition: all 0.2s ease;
}
.neo-edit-btn:hover {
  background: #3b82f6 !important;
  color: #ffffff !important;
  transform: scale(1.1);
}

.neo-delete-btn {
  border: 1.5px solid #0f172a !important;
  background: #fee2e2 !important;
  color: #b91c1c !important;
  transition: all 0.2s ease;
}
.neo-delete-btn:hover {
  background: #ef4444 !important;
  color: #ffffff !important;
  transform: scale(1.1);
}

.neo-table-toolbar {
  border-bottom: 2.5px solid #0f172a;
}

.neo-avatar-border {
  border: 2px solid #0f172a !important;
}

/* CUSTOM INPUTS */
.rounded-input :deep(.q-field__control) {
  border-radius: 12px;
  border: 2px solid #0f172a !important;
  box-shadow: 2px 2px 0px #0f172a !important;
}
.rounded-input :deep(.q-field__marginal) {
  height: 50px;
}

/* TABLES STYLING */
.premium-table :deep(thead tr th) {
  font-size: 12px;
  font-weight: 800 !important;
  color: #0f172a !important;
  background-color: #f1f5f9 !important;
  border-bottom: 2.5px solid #0f172a !important;
  border-top: none;
  letter-spacing: 0.5px;
}

.premium-table :deep(tbody tr td) {
  font-size: 13.5px;
  color: #0f172a !important;
  border-bottom: 1.5px solid #0f172a !important;
  transition: all 0.2s ease;
}

.hover-effect:hover td {
  background-color: #e0f2fe !important;
}

.premium-table :deep(.q-badge) {
  border: 1.5px solid #0f172a !important;
  font-weight: 800 !important;
  padding: 4px 8px !important;
  border-radius: 6px !important;
  box-shadow: none !important;
}

/* Floating Shapes Background Styling */
.neo-decorations-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.neo-shape {
  position: absolute;
  user-select: none;
  transition: all 0.3s ease;
}

/* 1. Circle 1 - Indigo/Blue */
.neo-shape--circle-1 {
  width: 180px;
  height: 180px;
  border: 3px solid rgba(59, 130, 246, 0.25);
  background: rgba(59, 130, 246, 0.07);
  box-shadow: 5px 5px 0px rgba(59, 130, 246, 0.12);
  top: 8%;
  left: -20px;
  animation: drift-wobble-1 25s ease-in-out infinite;
}

/* 2. Circle 2 - Pink/Rose */
.neo-shape--circle-2 {
  width: 140px;
  height: 140px;
  border: 3px solid rgba(244, 63, 94, 0.25);
  background: rgba(244, 63, 94, 0.07);
  box-shadow: 5px 5px 0px rgba(244, 63, 94, 0.12);
  top: 52%;
  right: 6%;
  animation: drift-wobble-2 22s ease-in-out infinite reverse;
}

/* 3. Square 1 - Orange */
.neo-shape--square-1 {
  width: 130px;
  height: 130px;
  border: 3px solid rgba(245, 158, 11, 0.25);
  background: rgba(245, 158, 11, 0.07);
  box-shadow: 5px 5px 0px rgba(245, 158, 11, 0.12);
  top: 65%;
  right: -30px;
  animation: drift-wobble-2 30s ease-in-out infinite;
}

/* 4. Square 2 - Lime */
.neo-shape--square-2 {
  width: 110px;
  height: 110px;
  border: 3px solid rgba(132, 204, 22, 0.25);
  background: rgba(132, 204, 22, 0.07);
  box-shadow: 4px 4px 0px rgba(132, 204, 22, 0.12);
  top: 22%;
  left: 15%;
  animation: drift-wobble-1 27s ease-in-out infinite;
}

/* 5. Star 1 - Purple */
.neo-shape--star-1 {
  font-size: 130px;
  color: rgba(168, 85, 247, 0.22);
  text-shadow: 4px 4px 0px rgba(168, 85, 247, 0.12);
  top: 3%;
  right: 15%;
  animation: drift-diagonal-1 28s ease-in-out infinite reverse;
}

/* 6. Star 2 - Yellow */
.neo-shape--star-2 {
  font-size: 90px;
  color: rgba(234, 179, 8, 0.24);
  text-shadow: 3px 3px 0px rgba(234, 179, 8, 0.14);
  top: 85%;
  right: 25%;
  animation: drift-diagonal-2 20s ease-in-out infinite;
}

/* 7. Triangle 1 - Cyan */
.neo-shape--triangle-1 {
  font-size: 100px;
  color: rgba(6, 182, 212, 0.22);
  text-shadow: 4px 4px 0px rgba(6, 182, 212, 0.12);
  top: 40%;
  left: 8%;
  animation: drift-wobble-2 24s ease-in-out infinite reverse;
}

/* 8. Triangle 2 - Amber/Gold */
.neo-shape--triangle-2 {
  font-size: 80px;
  color: rgba(245, 158, 11, 0.22);
  text-shadow: 3px 3px 0px rgba(245, 158, 11, 0.12);
  top: 12%;
  left: 35%;
  animation: drift-diagonal-1 23s ease-in-out infinite;
}

/* 9. Cross 1 - Emerald Green */
.neo-shape--cross-1 {
  font-size: 110px;
  color: rgba(16, 185, 129, 0.22);
  text-shadow: 4px 4px 0px rgba(16, 185, 129, 0.12);
  top: 30%;
  right: 25%;
  animation: drift-diagonal-1 22s ease-in-out infinite;
}

/* 10. Cross 2 - Red/Rose */
.neo-shape--cross-2 {
  font-size: 90px;
  color: rgba(239, 68, 68, 0.22);
  text-shadow: 4px 4px 0px rgba(239, 68, 68, 0.12);
  top: 75%;
  left: 2%;
  animation: drift-diagonal-2 26s ease-in-out infinite;
}

/* 11. Cross 3 - Deep Indigo */
.neo-shape--cross-3 {
  font-size: 100px;
  color: rgba(99, 102, 241, 0.22);
  text-shadow: 4px 4px 0px rgba(99, 102, 241, 0.12);
  top: 90%;
  left: 40%;
  animation: drift-wobble-1 29s ease-in-out infinite;
}

/* 12. Blob 1 - Teal Organic Morphing Blob */
.neo-shape--blob-1 {
  width: 160px;
  height: 160px;
  border: 3px solid rgba(20, 184, 166, 0.25);
  background: rgba(20, 184, 166, 0.07);
  box-shadow: 5px 5px 0px rgba(20, 184, 166, 0.12);
  top: 48%;
  left: 42%;
  animation: drift-blob 32s ease-in-out infinite;
}

/* KEYFRAMES FOR ORGANIC DRIFTING (AGAR.IO STYLE) */
@keyframes drift-wobble-1 {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    border-radius: 50% 50% 50% 50%;
  }
  25% {
    transform: translate(50px, -40px) scale(1.05) rotate(90deg);
    border-radius: 46% 54% 48% 52%;
  }
  50% {
    transform: translate(20px, -80px) scale(0.95) rotate(180deg);
    border-radius: 54% 46% 52% 48%;
  }
  75% {
    transform: translate(-40px, -30px) scale(1.02) rotate(270deg);
    border-radius: 48% 52% 54% 46%;
  }
  100% {
    transform: translate(0, 0) scale(1) rotate(360deg);
    border-radius: 50% 50% 50% 50%;
  }
}

@keyframes drift-wobble-2 {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    border-radius: 8px;
  }
  33% {
    transform: translate(-60px, -30px) scale(1.08) rotate(120deg);
    border-radius: 14px 8px 14px 8px;
  }
  66% {
    transform: translate(30px, -70px) scale(0.92) rotate(240deg);
    border-radius: 8px 14px 8px 14px;
  }
  100% {
    transform: translate(0, 0) scale(1) rotate(360deg);
    border-radius: 8px;
  }
}

@keyframes drift-diagonal-1 {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  50% {
    transform: translate(45px, 60px) rotate(180deg) scale(1.05);
  }
  100% {
    transform: translate(0, 0) rotate(360deg) scale(1);
  }
}

@keyframes drift-diagonal-2 {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  50% {
    transform: translate(-50px, -60px) rotate(-180deg) scale(0.95);
  }
  100% {
    transform: translate(0, 0) rotate(-360deg) scale(1);
  }
}

@keyframes drift-blob {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  }
  33% {
    transform: translate(40px, -50px) scale(1.06) rotate(120deg);
    border-radius: 70% 30% 52% 48% / 60% 40% 70% 30%;
  }
  66% {
    transform: translate(-30px, 30px) scale(0.94) rotate(240deg);
    border-radius: 50% 50% 30% 70% / 50% 60% 40% 60%;
  }
  100% {
    transform: translate(0, 0) scale(1) rotate(360deg);
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  }
}

/* Entrance animation classes */
.header-entrance {
  animation: brutalist-bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.table-entrance {
  opacity: 0;
  animation: brutalist-bounce-in 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.15s forwards;
}

@keyframes brutalist-bounce-in {
  0% {
    opacity: 0;
    transform: translateY(35px);
  }
  60% {
    opacity: 1;
    transform: translateY(-6px);
  }
  80% {
    transform: translateY(2px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ios icon box (keep fallback for some legacy classes, but they are stylized with borders now) */
.ios-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #0f172a;
}
.ios-icon-box.small {
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

/* VIEW SWITCHER ANIMATION */
.animate-fade-in {
  animation: fadeInUp 0.5s ease-out;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
