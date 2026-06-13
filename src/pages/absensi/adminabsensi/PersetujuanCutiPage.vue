<template>
  <q-page class="bg-slate-50 q-pa-md q-pa-lg font-inter">
    <div class="premium-container mx-auto">
      <!-- =====================================================================================
           VIEW 1: LIST (DEFAULT)
           ===================================================================================== -->
      <div v-if="viewMode === 'list'" class="animate-fade-in">
        <!-- ========================================== -->
        <!-- HEADER SECTION                             -->
        <!-- ========================================== -->
        <div class="row items-center justify-between q-mb-xl">
          <div class="col-12 col-md-8">
            <div class="row items-center no-wrap q-mb-xs">
              <div class="ios-icon-box small bg-blue-50 text-primary q-mr-sm flex-shrink-0">
                <q-icon name="event_available" size="20px" />
              </div>
              <h4
                class="text-h4 text-weight-bolder text-blue-grey-10 q-ma-none letter-spacing-tight"
              >
                Persetujuan Cuti Tahunan (Direksi)
              </h4>
            </div>
            <div class="text-subtitle1 text-blue-grey-6 q-mt-sm line-height-normal">
              Otoritas khusus Direksi &amp; Super Admin untuk mengevaluasi cuti jangka panjang
              karyawan AGRA.
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- TABEL 1: MENUNGGU PERSETUJUAN (PENDING)    -->
        <!-- ========================================== -->
        <div class="q-mb-md row items-center no-wrap">
          <q-icon name="pending_actions" color="orange-6" size="sm" class="q-mr-sm flex-shrink-0" />
          <span class="text-h6 text-weight-bold text-blue-grey-9 tracking-wide col"
            >Antrean Cuti Menunggu Keputusan</span
          >
          <q-badge color="orange-6" class="q-ml-sm rounded-6 text-weight-bold shadow-1 flex-shrink-0">{{
            pendingRows.length
          }}</q-badge>
          <q-space />
          <!-- Tombol tutup panel detail jika sedang terbuka -->
          <q-btn
            v-if="selectedCuti"
            flat
            dense
            icon="close"
            color="blue-grey-5"
            label="Tutup Detail"
            size="sm"
            class="rounded-8 text-weight-bold"
            @click="selectedCuti = null"
          />
        </div>

        <!-- ── SPLIT VIEW: Tabel (kiri) + Panel Detail (kanan) ── -->
        <div class="row q-col-gutter-md q-mb-xl items-start">
          <!-- KOLOM KIRI: Tabel -->
          <div :class="selectedCuti ? 'col-12 col-lg-6' : 'col-12'" class="transition-col">
            <q-card flat class="bento-card bg-white overflow-hidden shadow-soft">
              <q-table
                :rows="pendingRows"
                :columns="selectedCuti ? columnsCompact : columns"
                row-key="id"
                flat
                :loading="loading"
                class="premium-table"
                :pagination="{ rowsPerPage: 10 }"
                hide-bottom
              >
                <template v-slot:header="props">
                  <q-tr :props="props" class="bg-blue-50">
                    <q-th
                      v-for="col in props.cols"
                      :key="col.name"
                      :props="props"
                      class="text-weight-bolder text-primary uppercase letter-spacing-1"
                    >
                      {{ col.label }}
                    </q-th>
                  </q-tr>
                </template>

                <template v-slot:body="props">
                  <q-tr
                    :props="props"
                    :class="[
                      'cursor-pointer transition-smooth',
                      selectedCuti && selectedCuti.id === props.row.id
                        ? 'row-selected'
                        : 'hover-effect',
                    ]"
                    @click="bukaDetailFullPage(props.row)"
                  >
                    <!-- Info Karyawan (Dinamis Foto Profil) -->
                    <q-td key="karyawan" class="text-left">
                      <div class="row items-center no-wrap">
                        <q-avatar
                          size="38px"
                          :color="getRandomColor(props.row.nama_karyawan)"
                          text-color="white"
                          class="q-mr-sm text-weight-bold shadow-1"
                        >
                          <img
                            v-if="getFotoProfil(props.row.nama_karyawan)"
                            :src="getFotoProfil(props.row.nama_karyawan)"
                            style="object-fit: cover"
                          />
                          <span v-else>{{ getInitial(props.row.nama_karyawan) }}</span>
                        </q-avatar>
                        <div>
                          <div
                            class="text-weight-bolder text-blue-grey-10 text-uppercase"
                            style="font-size: 12.5px"
                          >
                            {{ props.row.nama_karyawan }}
                          </div>
                          <div class="text-caption text-blue-grey-5 font-mono">
                            NIK: {{ getNik(props.row.nama_karyawan) }}
                          </div>
                        </div>
                      </div>
                    </q-td>

                    <!-- Tanggal (selalu tampil) -->
                    <q-td key="tanggal" class="text-center">
                      <div class="text-weight-bold text-blue-grey-8" style="font-size: 12px">
                        {{ formatDate(props.row.tanggal_mulai) }}
                      </div>
                      <div v-if="props.row.tanggal_mulai !== props.row.tanggal_selesai">
                        <q-icon name="arrow_downward" color="grey-5" size="xs" />
                        <div class="text-weight-bold text-blue-grey-8" style="font-size: 12px">
                          {{ formatDate(props.row.tanggal_selesai) }}
                        </div>
                      </div>
                      <div class="text-caption text-indigo-7 text-weight-bold">
                        ({{ props.row.total_hari }} Hari)
                      </div>
                    </q-td>

                    <!-- Jenis (sembunyi saat panel terbuka) -->
                    <q-td v-if="!selectedCuti" key="jenis" class="text-center">
                      <q-badge
                        color="indigo-1"
                        text-color="indigo-9"
                        class="q-px-sm q-py-xs rounded-6 text-weight-bolder"
                      >
                        {{ props.row.jenis_pengajuan }}
                      </q-badge>
                    </q-td>

                    <!-- Alasan (sembunyi saat panel terbuka) -->
                    <q-td v-if="!selectedCuti" key="alasan" class="text-left" @click.stop>
                      <div
                        class="text-body2 text-blue-grey-9 text-weight-medium line-height-tight q-mb-sm"
                        style="max-width: 220px; white-space: normal"
                      >
                        "{{ props.row.alasan }}"
                      </div>
                      <div class="row q-gutter-x-sm items-center">
                        <q-btn
                          v-if="props.row.dokumen_url"
                          unelevated
                          color="primary"
                          label="Berkas Bukti"
                          icon="file_present"
                          class="rounded-6 text-weight-bold q-px-sm shadow-soft"
                          size="sm"
                          :href="props.row.dokumen_url"
                          target="_blank"
                        />
                        <q-badge
                          v-if="props.row.delegasi"
                          color="blue-1"
                          text-color="primary"
                          class="q-py-xs q-px-sm rounded-6 text-weight-bold"
                        >
                          <q-icon name="person_add" size="14px" class="q-mr-xs" /> Delegasi:
                          {{ props.row.delegasi }}
                        </q-badge>
                      </div>
                    </q-td>

                    <!-- Aksi Keputusan -->
                    <q-td key="aksi" class="text-center" @click.stop>
                      <div class="column items-center q-gutter-y-xs">
                        <div class="row items-center justify-center no-wrap q-gutter-x-xs">
                          <q-btn
                            unelevated
                            color="green-6"
                            class="rounded-8 shadow-soft-positive transition-smooth hover-scale q-px-sm q-py-xs"
                            @click="updateStatus(props.row, 'Approved')"
                          >
                             <div class="row items-center no-wrap q-gutter-x-xs">
                               <q-icon name="check" size="14px" class="text-white" />
                               <span class="text-white text-weight-bolder" style="font-size: 9px"
                                 >SETUJUI</span
                               >
                             </div>
                          </q-btn>
                          <q-btn
                            flat
                            round
                            icon="close"
                            color="red-8"
                            size="14px"
                            class="transition-smooth hover-scale"
                            @click="updateStatus(props.row, 'Rejected')"
                          >
                            <q-tooltip class="bg-negative text-weight-bold">Tolak</q-tooltip>
                          </q-btn>
                        </div>
                        <q-btn
                          unelevated
                          color="orange-7"
                          icon="edit_calendar"
                          label="REVISI"
                          size="xs"
                          class="rounded-8 transition-smooth full-width text-weight-bold shadow-amber"
                          @click="bukaDialogRevisi(props.row)"
                        >
                          <q-tooltip class="bg-orange-8 text-weight-bold">Revisi Tanggal</q-tooltip>
                        </q-btn>
                      </div>
                    </q-td>
                  </q-tr>
                </template>

                <template v-slot:loading>
                  <q-inner-loading showing color="primary">
                    <q-spinner-dots size="50px" color="primary" />
                    <div class="text-primary q-mt-md text-weight-medium">
                      Sinkronisasi antrean cuti...
                    </div>
                  </q-inner-loading>
                </template>

                <template v-slot:no-data>
                  <div class="full-width column flex-center q-pa-xl text-blue-grey-4">
                    <q-icon size="4em" name="task_alt" class="q-mb-md opacity-50" color="green-4" />
                    <div class="text-h6 text-weight-bold text-blue-grey-6">
                      Antrean Cuti Bersih!
                    </div>
                    <div class="text-caption">
                      Tidak ada pengajuan cuti tahunan yang menunggu persetujuan.
                    </div>
                  </div>
                </template>
              </q-table>
            </q-card>
          </div>

          <!-- KOLOM KANAN: Panel Detail + View Switcher (Dinamis Foto Profil) -->
          <div v-if="selectedCuti" class="col-12 col-lg-6">
            <q-card flat class="bento-card bg-white shadow-soft detail-panel-card">
              <!-- ── Header Panel ── -->
              <div class="detail-panel-header q-pa-lg q-pb-md">
                <div class="row items-center no-wrap">
                  <!-- Avatar dinamis terhubung database -->
                  <q-avatar
                    size="52px"
                    :color="getRandomColor(selectedCuti.nama_karyawan)"
                    text-color="white"
                    class="q-mr-md text-weight-bolder shadow-2 text-subtitle1"
                  >
                    <img
                      v-if="getFotoProfil(selectedCuti.nama_karyawan)"
                      :src="getFotoProfil(selectedCuti.nama_karyawan)"
                      style="object-fit: cover"
                    />
                    <span v-else>{{ getInitial(selectedCuti.nama_karyawan) }}</span>
                  </q-avatar>
                  <div class="col">
                    <div
                      class="text-weight-bolder text-blue-grey-10 text-uppercase"
                      style="font-size: 14px"
                    >
                      {{ selectedCuti.nama_karyawan }}
                    </div>
                    <div class="text-caption text-blue-grey-5 font-mono q-mt-xs">
                      NIK: {{ getNik(selectedCuti.nama_karyawan) }}
                    </div>
                    <q-badge
                      color="indigo-1"
                      text-color="indigo-9"
                      class="q-mt-xs q-px-sm q-py-xs rounded-6 text-weight-bold"
                    >
                      <q-icon name="beach_access" size="12px" class="q-mr-xs" />
                      Saldo: {{ getSisaKuota(selectedCuti.nama_karyawan) }} Hari
                    </q-badge>
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    color="blue-grey-4"
                    size="sm"
                    class="bg-grey-2"
                    @click="selectedCuti = null"
                  />
                </div>

                <!-- View Switcher Tabs -->
                <q-tabs
                  v-model="dialogView"
                  dense
                  active-color="primary"
                  indicator-color="primary"
                  align="left"
                  class="q-mt-md text-blue-grey-5"
                >
                  <q-tab
                    name="detail"
                    icon="info_outline"
                    label="Detail"
                    class="text-weight-bold"
                  />
                  <q-tab
                    name="revisi"
                    icon="edit_calendar"
                    label="Revisi Tanggal"
                    class="text-weight-bold"
                  />
                </q-tabs>
                <q-separator />
              </div>

              <!-- ── Konten Panel (Scrollable) ── -->
              <q-scroll-area style="height: 480px">
                <div class="q-pa-lg q-pt-md">
                  <q-tab-panels v-model="dialogView" animated keep-alive class="bg-transparent">
                    <!-- ── TAB: DETAIL ── -->
                    <q-tab-panel name="detail" class="q-pa-none">
                      <!-- Grid Info Utama -->
                      <div class="row q-col-gutter-sm q-mb-md">
                        <div class="col-6">
                          <div class="detail-info-card rounded-12 q-pa-sm bg-indigo-50">
                            <div
                              class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1"
                              style="font-size: 10px"
                            >
                              Jenis Pengajuan
                            </div>
                            <div class="text-weight-bolder text-indigo-9" style="font-size: 13px">
                              {{ selectedCuti.jenis_pengajuan }}
                            </div>
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="detail-info-card rounded-12 q-pa-sm bg-teal-50">
                            <div
                              class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1"
                              style="font-size: 10px"
                            >
                              Total Durasi
                            </div>
                            <div class="text-weight-bolder text-teal-9" style="font-size: 13px">
                              {{ selectedCuti.total_hari }} Hari Kerja
                            </div>
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="detail-info-card rounded-12 q-pa-sm bg-blue-50">
                            <div
                              class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1"
                              style="font-size: 10px"
                            >
                              Tanggal Mulai
                            </div>
                            <div class="text-weight-bolder text-blue-9" style="font-size: 13px">
                              {{ formatDate(selectedCuti.tanggal_mulai) }}
                            </div>
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="detail-info-card rounded-12 q-pa-sm bg-blue-50">
                            <div
                              class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1"
                              style="font-size: 10px"
                            >
                              Tanggal Selesai
                            </div>
                            <div class="text-weight-bolder text-blue-9" style="font-size: 13px">
                              {{ formatDate(selectedCuti.tanggal_selesai) }}
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Alasan -->
                      <div class="detail-info-card rounded-12 q-pa-sm bg-amber-50 q-mb-sm">
                        <div class="row items-center q-mb-xs">
                          <q-icon
                            name="chat_bubble_outline"
                            color="amber-9"
                            size="14px"
                            class="q-mr-xs"
                          />
                          <span
                            class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1"
                            style="font-size: 10px"
                            >Alasan Karyawan</span
                          >
                        </div>
                        <div class="text-weight-bold text-blue-grey-9" style="font-size: 13px">
                          "{{ selectedCuti.alasan }}"
                        </div>
                      </div>

                      <!-- Delegasi & Dokumen -->
                      <div class="row q-col-gutter-sm q-mb-md">
                        <div class="col-12 col-sm-6" v-if="selectedCuti.delegasi">
                          <div class="detail-info-card rounded-12 q-pa-sm bg-cyan-50">
                            <div
                              class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1 q-mb-xs"
                              style="font-size: 10px"
                            >
                              Delegasi Tugas
                            </div>
                            <div class="row items-center">
                              <q-icon
                                name="person_add"
                                color="cyan-9"
                                size="14px"
                                class="q-mr-xs"
                              />
                              <span class="text-weight-bold text-cyan-9" style="font-size: 13px">{{
                                selectedCuti.delegasi
                              }}</span>
                            </div>
                          </div>
                        </div>
                        <div class="col-12 col-sm-6" v-if="selectedCuti.dokumen_url">
                          <div class="detail-info-card rounded-12 q-pa-sm bg-purple-50">
                            <div
                              class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1 q-mb-xs"
                              style="font-size: 10px"
                            >
                              Dokumen Bukti
                            </div>
                            <q-btn
                              unelevated
                              color="purple-6"
                              icon="open_in_new"
                              label="Buka Lampiran"
                              size="sm"
                              class="rounded-8 text-weight-bold"
                              type="a"
                              :href="selectedCuti.dokumen_url"
                              target="_blank"
                            />
                          </div>
                        </div>
                      </div>

                      <!-- Status & shortcut ke Revisi -->
                      <div class="rounded-12 q-pa-sm bg-orange-50 row items-center q-mb-md">
                        <q-icon name="pending_actions" color="orange-8" size="sm" class="q-mr-sm" />
                        <span class="text-weight-bold text-orange-9 text-caption"
                          >Menunggu Keputusan Direksi</span
                        >
                        <q-space />
                        <q-btn
                          unelevated
                          color="orange-7"
                          icon="edit_calendar"
                          label="Revisi"
                          size="xs"
                          class="rounded-8 text-weight-bold"
                          @click="dialogView = 'revisi'"
                        />
                      </div>
                    </q-tab-panel>

                    <!-- ── TAB: REVISI ── -->
                    <q-tab-panel name="revisi" class="q-pa-none">
                      <div
                        class="text-subtitle2 text-weight-bold text-orange-9 q-mb-sm row items-center"
                      >
                        <q-icon name="edit_calendar" class="q-mr-xs" /> FORM REVISI TANGGAL
                        (OPSIONAL)
                      </div>

                      <div class="row q-col-gutter-md">
                        <div class="col-12 col-sm-6">
                          <label class="text-caption text-weight-bold text-blue-grey-7"
                            >Tanggal Mulai</label
                          >
                          <q-input
                            outlined
                            :model-value="
                              revisiForm.tanggal_mulai ? formatDate(revisiForm.tanggal_mulai) : ''
                            "
                            readonly
                            dense
                            class="q-mt-xs rounded-input cursor-pointer"
                            placeholder="Pilih tanggal mulai"
                            @click="$refs.qRevisiMulaiPanel.show()"
                          >
                            <template v-slot:prepend
                              ><q-icon name="calendar_today" color="blue-grey-4"
                            /></template>
                            <q-popup-proxy
                              ref="qRevisiMulaiPanel"
                              transition-show="scale"
                              transition-hide="scale"
                            >
                              <q-date
                                :model-value="revisiForm.tanggal_mulai"
                                @update:model-value="
                                  (v) => {
                                    revisiForm.tanggal_mulai = v
                                    $refs.qRevisiMulaiPanel.hide()
                                  }
                                "
                                minimal
                                color="orange-8"
                                :options="(d) => !isRevisiDateDisabled(d)"
                                :events="(d) => calendarEvents.some((e) => e.date === d)"
                                :event-color="(d) => getDateColor(d)"
                                class="shadow-soft rounded-16"
                              />
                            </q-popup-proxy>
                          </q-input>
                        </div>
                        <div class="col-12 col-sm-6">
                          <label class="text-caption text-weight-bold text-blue-grey-7"
                            >Tanggal Selesai</label
                          >
                          <q-input
                            outlined
                            :model-value="
                              revisiForm.tanggal_selesai
                                ? formatDate(revisiForm.tanggal_selesai)
                                : ''
                            "
                            readonly
                            dense
                            class="q-mt-xs rounded-input cursor-pointer"
                            placeholder="Pilih tanggal selesai"
                            @click="$refs.qRevisiSelesaiPanel.show()"
                          >
                            <template v-slot:prepend
                              ><q-icon name="calendar_today" color="blue-grey-4"
                            /></template>
                            <q-popup-proxy
                              ref="qRevisiSelesaiPanel"
                              transition-show="scale"
                              transition-hide="scale"
                            >
                              <q-date
                                :model-value="revisiForm.tanggal_selesai"
                                @update:model-value="
                                  (v) => {
                                    revisiForm.tanggal_selesai = v
                                    $refs.qRevisiSelesaiPanel.hide()
                                  }
                                "
                                minimal
                                color="orange-8"
                                :options="(d) => !isRevisiDateDisabled(d)"
                                :events="(d) => calendarEvents.some((e) => e.date === d)"
                                :event-color="(d) => getDateColor(d)"
                                class="shadow-soft rounded-16"
                              />
                            </q-popup-proxy>
                          </q-input>
                        </div>
                      </div>

                      <div
                        class="q-pa-md rounded-12 bg-orange-50 text-orange-9 border-subtle q-mt-md"
                      >
                        <div class="row items-center no-wrap">
                          <q-icon name="info" size="sm" class="q-mr-md" />
                          <div>
                            <div class="text-subtitle2 text-weight-bolder">
                              Hasil Hitung Cuti Pintar:
                            </div>
                            <div class="text-caption">
                              Durasi hasil revisi:
                              <span class="text-weight-bold text-h6 text-primary q-mx-xs"
                                >{{ durasiRevisi }} Hari Kerja</span
                              >
                              (Otomatis mengabaikan hari Minggu &amp; Libur Nasional SKB).
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="q-mt-md">
                        <label class="text-caption text-weight-bold text-blue-grey-7"
                          >Catatan/Alasan Revisi (Ditampilkan ke Karyawan)</label
                        >
                        <q-input
                          outlined
                          v-model="revisiForm.catatan_revisi"
                          placeholder="Cth: Jadwal disesuaikan dengan timeline proyek penting..."
                          dense
                          class="q-mt-xs"
                        />
                      </div>
                    </q-tab-panel>
                  </q-tab-panels>
                </div>
              </q-scroll-area>

              <!-- ── Footer Aksi Panel ── -->
              <div class="detail-panel-footer q-pa-md row items-center justify-between">
                <q-btn
                  flat
                  label="Tutup"
                  color="blue-grey-6"
                  class="text-weight-bold rounded-8"
                  @click="selectedCuti = null"
                />
                <div class="row q-gutter-x-sm">
                  <q-btn
                    unelevated
                    label="TOLAK"
                    color="negative"
                    class="text-weight-bold rounded-12 q-px-md"
                    @click="updateStatus(selectedCuti, 'Rejected')"
                  />
                  <q-btn
                    v-if="isCutiRevised"
                    unelevated
                    label="KIRIM REVISI"
                    color="orange-8"
                    class="text-weight-bold rounded-12 q-px-lg"
                    @click="prosesPersetujuanDenganRevisi"
                  />
                  <q-btn
                    v-else
                    unelevated
                    label="SETUJUI CUTI"
                    color="green-6"
                    class="text-weight-bold rounded-12 q-px-lg shadow-soft-positive"
                    @click="prosesPersetujuanDenganRevisi"
                  />
                </div>
              </div>
            </q-card>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- TABEL 2: RIWAYAT KEPUTUSAN DIREKSI (DINAMIS FOTO PROFIL) -->
        <!-- ========================================== -->
        <div class="q-mb-md q-mt-xl row items-center no-wrap">
          <q-icon name="history" color="blue-grey-5" size="sm" class="q-mr-sm flex-shrink-0" />
          <span class="text-h6 text-weight-bold text-blue-grey-8 tracking-wide col"
            >Riwayat Pengambilan Keputusan</span
          >
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
              <q-tr :props="props" class="bg-slate-50 border-bottom-light">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="text-weight-bolder text-blue-grey-6 uppercase letter-spacing-1"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props" class="hover-effect">
                <!-- Info Karyawan -->
                <q-td key="karyawan" class="text-left">
                  <div class="row items-center no-wrap">
                    <q-avatar
                      size="36px"
                      :color="getRandomColor(props.row.nama_karyawan)"
                      text-color="white"
                      class="q-mr-md text-weight-bold shadow-1 opacity-80"
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

                <!-- Jenis Pengajuan -->
                <q-td key="jenis" class="text-center">
                  <q-badge
                    color="indigo-1"
                    text-color="indigo-9"
                    class="q-px-sm q-py-xs rounded-6 text-weight-bold"
                    >{{ props.row.jenis_pengajuan }}</q-badge
                  >
                </q-td>

                <!-- Tanggal Pelaksanaan -->
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
                  <span class="text-weight-bold text-indigo-8 q-ml-xs"
                    >({{ props.row.total_hari }} Hari)</span
                  >
                </q-td>

                <!-- Status -->
                <q-td key="status" class="text-center">
                  <q-badge
                    :color="getStatusBadgeColor(props.row.status_approval)"
                    class="q-px-md q-py-sm text-weight-bold rounded-8 shadow-1"
                  >
                    <q-icon
                      :name="getStatusIcon(props.row.status_approval)"
                      size="xs"
                      class="q-mr-xs"
                    />
                    {{ getStatusTextLabel(props.row.status_approval) }}
                  </q-badge>
                </q-td>

                <!-- Aksi Hapus -->
                <q-td key="aksi" class="text-center">
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete_outline"
                    color="blue-grey-3"
                    class="hover-text-negative transition-smooth"
                    @click="hapusData(props.row.id)"
                  >
                    <q-tooltip class="bg-negative">Hapus Riwayat</q-tooltip>
                  </q-btn>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:no-data>
              <div class="full-width row items-center q-pa-xl justify-center text-blue-grey-4">
                <q-icon size="2em" name="history" class="q-mr-sm" />
                <div class="text-weight-medium">Belum ada riwayat persetujuan cuti.</div>
              </div>
            </template>
          </q-table>
        </q-card>
        <!-- ========================================== -->
        <!-- KALENDER DINDING NASIONAL                 -->
        <!-- ========================================== -->
        <div class="q-mt-xl">
          <div class="row items-center justify-between q-mb-md">
            <div class="row items-center">
              <div class="ios-icon-box small bg-indigo-50 text-indigo-6 q-mr-sm">
                <q-icon name="calendar_month" size="20px" />
              </div>
              <div>
                <div class="text-h6 text-weight-bolder text-blue-grey-9">
                  Kalender {{ calendarYear }}
                  <q-spinner-dots
                    v-if="loadingCalendar"
                    color="primary"
                    size="18px"
                    class="q-ml-sm"
                  />
                </div>
                <div class="text-caption text-blue-grey-5">
                  Data hari libur nasional &amp; cuti bersama Indonesia otomatis
                </div>
              </div>
            </div>
            <div class="row items-center q-gutter-sm">
              <div class="row items-center q-mr-md q-gutter-xs">
                <div
                  style="width: 12px; height: 12px; border-radius: 3px; background: #c62828"
                  class="q-mr-xs"
                ></div>
                <span class="text-caption text-weight-bold text-blue-grey-7">Libur Nasional</span>
                <div
                  style="width: 12px; height: 12px; border-radius: 3px; background: #e65100"
                  class="q-mr-xs q-ml-md"
                ></div>
                <span class="text-caption text-weight-bold text-blue-grey-7">Cuti Bersama</span>
                <div
                  style="width: 12px; height: 12px; border-radius: 3px; background: #1976d2"
                  class="q-mr-xs q-ml-md"
                ></div>
                <span class="text-caption text-weight-bold text-blue-grey-7">Hari Ini</span>
                <div
                  style="
                    width: 12px;
                    height: 12px;
                    border-radius: 3px;
                    background: #ffebee;
                    border: 1px solid #ef9a9a;
                  "
                  class="q-mr-xs q-ml-md"
                ></div>
                <span class="text-caption text-weight-bold text-blue-grey-7">Minggu</span>
              </div>
              <q-btn
                flat
                round
                dense
                icon="chevron_left"
                color="primary"
                @click="calendarYear--"
                :disable="loadingCalendar"
              />
              <span class="text-subtitle1 text-weight-bolder text-blue-grey-9 q-px-sm">{{
                calendarYear
              }}</span>
              <q-btn
                flat
                round
                dense
                icon="chevron_right"
                color="primary"
                @click="calendarYear++"
                :disable="loadingCalendar"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div
              v-for="(bulan, bIndex) in calendarMonths"
              :key="bIndex"
              class="col-12 col-sm-6 col-md-4 col-lg-3"
            >
              <q-card flat class="bento-card bg-white overflow-hidden">
                <div
                  class="q-pa-sm text-center text-weight-bolder text-white"
                  :class="
                    bIndex === currentMonthIndex && calendarYear === currentYear
                      ? 'bg-primary'
                      : 'bg-blue-grey-7'
                  "
                  style="letter-spacing: 1px; font-size: 13px"
                >
                  {{ bulan.nama.toUpperCase() }}
                </div>

                <!-- Baris Nama Hari -->
                <div class="row q-px-xs q-pt-xs">
                  <div
                    v-for="hari in ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']"
                    :key="hari"
                    class="text-center text-weight-bold"
                    style="
                      width: 14.28%;
                      flex: 0 0 14.28%;
                      font-size: 10px;
                      padding: 4px 0;
                      color: #90a4ae;
                    "
                  >
                    {{ hari }}
                  </div>
                </div>

                <!-- Baris Angka Tanggal -->
                <div class="row q-px-xs q-pb-xs">
                  <div
                    v-for="n in bulan.offset"
                    :key="'off-' + n"
                    style="width: 14.28%; flex: 0 0 14.28%; aspect-ratio: 1"
                  />
                  <div
                    v-for="tgl in bulan.totalDays"
                    :key="tgl"
                    class="text-center cal-day"
                    style="width: 14.28%; flex: 0 0 14.28%; padding: 2px"
                  >
                    <div
                      class="cal-day-inner"
                      :class="getDayClass(calendarYear, bIndex + 1, tgl)"
                      style="
                        border-radius: 6px;
                        font-size: 11px;
                        font-weight: 600;
                        min-height: 28px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        cursor: default;
                        padding: 2px 1px;
                      "
                    >
                      <span>{{ tgl }}</span>
                      <span
                        v-if="getEventLabel(calendarYear, bIndex + 1, tgl)"
                        style="
                          font-size: 7px;
                          font-weight: 700;
                          line-height: 1.1;
                          text-align: center;
                          white-space: nowrap;
                          overflow: hidden;
                          text-overflow: ellipsis;
                          max-width: 100%;
                          opacity: 0.85;
                        "
                      >
                        {{
                          getEventLabel(calendarYear, bIndex + 1, tgl)
                            .split(' ')
                            .slice(0, 2)
                            .join(' ')
                        }}
                      </span>
                      <q-tooltip
                        v-if="getEventLabel(calendarYear, bIndex + 1, tgl)"
                        class="bg-blue-grey-9 text-white rounded-8"
                        style="font-size: 12px"
                      >
                        {{ getEventLabel(calendarYear, bIndex + 1, tgl) }}
                      </q-tooltip>
                    </div>
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </div>
        <!-- END KALENDER DINDING -->
      </div>
      <!-- END VIEW LIST -->

      <!-- =====================================================================================
           VIEW 2: DETAIL FULL PAGE (VIEW SWITCHER - DINAMIS FOTO PROFIL)
           ===================================================================================== -->
      <div v-else-if="viewMode === 'detail-full' && selectedCuti" class="animate-fade-in">
        <!-- BACK HEADER -->
        <div class="row items-center justify-between q-mb-xl">
          <div class="col-12 col-md-8 q-mb-md q-mb-md-none">
            <div class="row items-center no-wrap">
              <q-btn
                flat
                round
                color="primary"
                icon="arrow_back"
                @click="viewMode = 'list'"
                class="q-mr-md bg-white shadow-1 rounded-12"
              />
              <div>
                <div
                  class="text-h4 text-weight-bolder text-blue-grey-10 letter-spacing-tight uppercase"
                >
                  Detail Pengajuan Cuti
                </div>
                <div class="text-subtitle2 text-blue-grey-5 q-mt-xs">
                  Evaluasi dan keputusan akhir persetujuan cuti karyawan
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="row justify-end q-gutter-sm">
              <q-btn
                unelevated
                color="negative"
                label="TOLAK CUTI"
                icon="close"
                rounded
                class="text-weight-bold shadow-1 q-px-lg"
                @click="updateStatus(selectedCuti, 'Rejected')"
              />
              <q-btn
                unelevated
                color="green-6"
                label="SETUJUI CUTI"
                icon="check"
                rounded
                class="text-weight-bold shadow-soft-positive q-px-lg"
                @click="updateStatus(selectedCuti, 'Approved')"
              />
            </div>
          </div>
        </div>

        <div class="row justify-center">
          <div class="col-12 col-xl-10">
            <!-- PROFILE HEADER CARD (Dinamis Foto Profil) -->
            <q-card flat bordered class="rounded-24 shadow-soft q-mb-xl bg-white overflow-hidden">
              <div class="row">
                <!-- Avatar Side -->
                <div
                  class="col-12 col-md-4 flex flex-center q-pa-xl"
                  style="background: linear-gradient(135deg, #e8f4fd 0%, #dbeafe 100%)"
                >
                  <div class="column items-center text-center">
                    <q-avatar
                      size="120px"
                      :color="getRandomColor(selectedCuti.nama_karyawan)"
                      text-color="white"
                      class="shadow-10 text-weight-bolder text-h3 q-mb-md"
                      style="border: 5px solid white"
                    >
                      <img
                        v-if="getFotoProfil(selectedCuti.nama_karyawan)"
                        :src="getFotoProfil(selectedCuti.nama_karyawan)"
                        style="object-fit: cover"
                      />
                      <span v-else>{{ getInitial(selectedCuti.nama_karyawan) }}</span>
                    </q-avatar>
                    <q-badge
                      color="indigo-1"
                      text-color="indigo-9"
                      class="q-px-md q-py-sm rounded-8 text-weight-bolder"
                      style="font-size: 12px"
                    >
                      <q-icon name="beach_access" size="14px" class="q-mr-xs" />
                      Saldo Cuti: {{ getSisaKuota(selectedCuti.nama_karyawan) }} Hari
                    </q-badge>
                  </div>
                </div>

                <!-- Info Side -->
                <div class="col-12 col-md-8 q-pa-xl">
                  <div
                    class="text-h3 text-weight-bolder text-blue-grey-10 q-mb-xs uppercase letter-spacing-tight"
                  >
                    {{ selectedCuti.nama_karyawan }}
                  </div>
                  <div class="text-h6 text-blue-grey-5 q-mb-lg row items-center">
                    <q-icon name="badge" class="q-mr-sm" />
                    <span class="font-mono">NIK: {{ getNik(selectedCuti.nama_karyawan) }}</span>
                  </div>

                  <div class="row q-col-gutter-lg">
                    <div class="col-12 col-sm-6">
                      <div
                        class="text-overline text-blue-grey-5 text-weight-bold"
                        style="letter-spacing: 2px; font-size: 10px"
                      >
                        Jenis Pengajuan
                      </div>
                      <div class="text-subtitle1 text-weight-bolder text-indigo-9 q-mt-xs">
                        <q-icon name="beach_access" class="q-mr-xs" />
                        {{ selectedCuti.jenis_pengajuan }}
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
                          class="q-px-md q-py-sm rounded-8 text-weight-bolder shadow-1"
                          style="font-size: 13px"
                        >
                          <q-icon name="pending_actions" class="q-mr-xs" size="sm" />
                          Menunggu Keputusan Direksi
                        </q-badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card>

            <!-- INFO DETAIL GRID -->
            <div class="row q-col-gutter-xl">
              <!-- KIRI: Informasi Tanggal & Durasi -->
              <div class="col-12 col-md-6">
                <q-card flat bordered class="rounded-20 shadow-soft bg-white full-height">
                  <q-card-section
                    class="bg-blue-50 text-primary text-weight-bold uppercase q-py-md"
                    style="letter-spacing: 1.5px; font-size: 11px; border-radius: 20px 20px 0 0"
                  >
                    <q-icon name="date_range" class="q-mr-sm" /> Informasi Waktu Cuti
                  </q-card-section>
                  <q-separator />
                  <q-card-section class="q-pa-lg">
                    <div class="q-gutter-y-lg">
                      <!-- Timeline Visual -->
                      <div class="row items-center q-mb-md">
                        <div class="col">
                          <div
                            class="text-caption text-blue-grey-5 text-weight-bold uppercase"
                            style="letter-spacing: 1px; font-size: 10px"
                          >
                            Tanggal Mulai
                          </div>
                          <div class="text-h6 text-weight-bolder text-blue-9 q-mt-xs">
                            {{ formatDate(selectedCuti.tanggal_mulai) }}
                          </div>
                        </div>
                        <div class="col-auto q-px-md text-center">
                          <q-icon name="arrow_forward" color="blue-grey-3" size="sm" />
                          <div class="text-caption text-blue-grey-4 text-weight-bold q-mt-xs">
                            {{ selectedCuti.total_hari }} Hari
                          </div>
                        </div>
                        <div class="col text-right">
                          <div
                            class="text-caption text-blue-grey-5 text-weight-bold uppercase"
                            style="letter-spacing: 1px; font-size: 10px"
                          >
                            Tanggal Selesai
                          </div>
                          <div class="text-h6 text-weight-bolder text-blue-9 q-mt-xs">
                            {{ formatDate(selectedCuti.tanggal_selesai) }}
                          </div>
                        </div>
                      </div>

                      <!-- Durasi Badge -->
                      <div
                        class="rounded-16 q-pa-md text-center"
                        style="background: linear-gradient(135deg, #dbeafe, #e0e7ff)"
                      >
                        <div
                          class="text-caption text-blue-grey-6 text-weight-bold uppercase q-mb-xs"
                          style="letter-spacing: 1px"
                        >
                          Total Durasi
                        </div>
                        <div class="text-h4 text-weight-bolder text-indigo-8">
                          {{ selectedCuti.total_hari }}
                        </div>
                        <div class="text-subtitle2 text-indigo-6 text-weight-medium">
                          Hari Kerja Efektif
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- KANAN: Alasan & Delegasi -->
              <div class="col-12 col-md-6">
                <q-card flat bordered class="rounded-20 shadow-soft bg-white full-height">
                  <q-card-section
                    class="bg-amber-50 text-weight-bold uppercase q-py-md"
                    style="
                      color: #b45309;
                      letter-spacing: 1.5px;
                      font-size: 11px;
                      border-radius: 20px 20px 0 0;
                    "
                  >
                    <q-icon name="chat_bubble_outline" class="q-mr-sm" /> Alasan & Keterangan
                  </q-card-section>
                  <q-separator />
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
                          class="rounded-12 q-pa-md bg-amber-50"
                          style="border-left: 4px solid #f59e0b"
                        >
                          <div
                            class="text-body1 text-blue-grey-9 text-weight-medium"
                            style="line-height: 1.6; font-style: italic"
                          >
                            "{{ selectedCuti.alasan || 'Tidak ada keterangan.' }}"
                          </div>
                        </div>
                      </div>

                      <!-- Delegasi -->
                      <div v-if="selectedCuti.delegasi">
                        <div
                          class="text-caption text-blue-grey-5 text-weight-bold uppercase q-mb-sm"
                          style="letter-spacing: 1px; font-size: 10px"
                        >
                          Delegasi Tugas
                        </div>
                        <div class="rounded-12 q-pa-md bg-cyan-50 row items-center">
                          <q-avatar
                            size="36px"
                            color="cyan-7"
                            text-color="white"
                            class="q-mr-sm text-weight-bold"
                          >
                            {{ selectedCuti.delegasi?.charAt(0)?.toUpperCase() }}
                          </q-avatar>
                          <div>
                            <div class="text-weight-bolder text-cyan-9">
                              {{ selectedCuti.delegasi }}
                            </div>
                            <div class="text-caption text-blue-grey-5">Penerima Delegasi Tugas</div>
                          </div>
                        </div>
                      </div>

                      <!-- Dokumen -->
                      <div v-if="selectedCuti.dokumen_url">
                        <div
                          class="text-caption text-blue-grey-5 text-weight-bold uppercase q-mb-sm"
                          style="letter-spacing: 1px; font-size: 10px"
                        >
                          Dokumen Bukti
                        </div>
                        <q-btn
                          unelevated
                          color="primary"
                          icon="open_in_new"
                          label="Buka Lampiran Dokumen"
                          rounded
                          class="text-weight-bold full-width"
                          type="a"
                          :href="selectedCuti.dokumen_url"
                          target="_blank"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- BAWAH: Form Revisi Tanggal -->
              <div class="col-12">
                <q-card
                  flat
                  bordered
                  class="rounded-20 shadow-soft bg-white overflow-hidden q-mb-xl"
                >
                  <q-card-section
                    class="bg-orange-8 text-white text-weight-bold uppercase q-py-md"
                    style="letter-spacing: 1.5px; font-size: 11px"
                  >
                    <q-icon name="edit_calendar" class="q-mr-sm" /> Revisi Tanggal (Opsional)
                  </q-card-section>
                  <q-card-section class="q-pa-lg">
                    <div class="row q-col-gutter-xl items-start">
                      <div class="col-12 col-md-5">
                        <div class="row q-col-gutter-md">
                          <div class="col-12 col-sm-6">
                            <label class="text-caption text-weight-bold text-blue-grey-7"
                              >Tanggal Mulai Revisi</label
                            >
                            <q-input
                              outlined
                              :model-value="
                                revisiForm.tanggal_mulai ? formatDate(revisiForm.tanggal_mulai) : ''
                              "
                              readonly
                              dense
                              class="q-mt-xs rounded-input cursor-pointer"
                              placeholder="Pilih tanggal mulai"
                              @click="$refs.qRevisiMulaiFull.show()"
                            >
                              <template v-slot:prepend
                                ><q-icon name="calendar_today" color="blue-grey-4"
                              /></template>
                              <q-popup-proxy
                                ref="qRevisiMulaiFull"
                                transition-show="scale"
                                transition-hide="scale"
                              >
                                <q-date
                                  :model-value="revisiForm.tanggal_mulai"
                                  @update:model-value="
                                    (v) => {
                                      revisiForm.tanggal_mulai = v
                                      $refs.qRevisiMulaiFull.hide()
                                    }
                                  "
                                  minimal
                                  color="orange-8"
                                  :options="(d) => !isRevisiDateDisabled(d)"
                                  :events="(d) => calendarEvents.some((e) => e.date === d)"
                                  :event-color="(d) => getDateColor(d)"
                                  class="shadow-soft rounded-16"
                                />
                              </q-popup-proxy>
                            </q-input>
                          </div>
                          <div class="col-12 col-sm-6">
                            <label class="text-caption text-weight-bold text-blue-grey-7"
                              >Tanggal Selesai Revisi</label
                            >
                            <q-input
                              outlined
                              :model-value="
                                revisiForm.tanggal_selesai
                                  ? formatDate(revisiForm.tanggal_selesai)
                                  : ''
                              "
                              readonly
                              dense
                              class="q-mt-xs rounded-input cursor-pointer"
                              placeholder="Pilih tanggal selesai"
                              @click="$refs.qRevisiSelesaiFull.show()"
                            >
                              <template v-slot:prepend
                                ><q-icon name="calendar_today" color="blue-grey-4"
                              /></template>
                              <q-popup-proxy
                                ref="qRevisiSelesaiFull"
                                transition-show="scale"
                                transition-hide="scale"
                              >
                                <q-date
                                  :model-value="revisiForm.tanggal_selesai"
                                  @update:model-value="
                                    (v) => {
                                      revisiForm.tanggal_selesai = v
                                      $refs.qRevisiSelesaiFull.hide()
                                    }
                                  "
                                  minimal
                                  color="orange-8"
                                  :options="(d) => !isRevisiDateDisabled(d)"
                                  :events="(d) => calendarEvents.some((e) => e.date === d)"
                                  :event-color="(d) => getDateColor(d)"
                                  class="shadow-soft rounded-16"
                                />
                              </q-popup-proxy>
                            </q-input>
                          </div>
                        </div>
                        <div class="q-mt-md">
                          <label class="text-caption text-weight-bold text-blue-grey-7"
                            >Catatan Revisi (Ditampilkan ke Karyawan)</label
                          >
                          <q-input
                            outlined
                            v-model="revisiForm.catatan_revisi"
                            placeholder="Cth: Jadwal disesuaikan dengan timeline proyek penting..."
                            dense
                            class="q-mt-xs"
                          />
                        </div>
                      </div>
                      <div class="col-12 col-md-4">
                        <div
                          class="rounded-16 q-pa-lg text-center bg-orange-50"
                          style="border: 2px dashed #fb923c"
                        >
                          <q-icon name="calculate" color="orange-7" size="40px" class="q-mb-sm" />
                          <div
                            class="text-caption text-blue-grey-6 text-weight-bold uppercase q-mb-xs"
                            style="letter-spacing: 1px"
                          >
                            Durasi Hasil Revisi
                          </div>
                          <div class="text-h3 text-weight-bolder text-orange-8">
                            {{ durasiRevisi }}
                          </div>
                          <div class="text-subtitle2 text-orange-6">Hari Kerja Efektif</div>
                          <div class="text-caption text-blue-grey-5 q-mt-sm">
                            Otomatis mengabaikan Minggu &amp; Libur Nasional
                          </div>
                        </div>
                      </div>
                      <div class="col-12 col-md-3 column justify-center q-gutter-y-sm">
                        <q-btn
                          v-if="isCutiRevised"
                          unelevated
                          color="orange-8"
                          icon="edit_calendar"
                          label="KIRIM REVISI"
                          rounded
                          class="text-weight-bold full-width shadow-amber q-py-sm"
                          @click="prosesPersetujuanDenganRevisi"
                        />
                        <q-btn
                          v-else
                          unelevated
                          color="green-6"
                          icon="check_circle"
                          label="SETUJUI CUTI"
                          rounded
                          class="text-weight-bold full-width shadow-soft-positive q-py-sm"
                          @click="prosesPersetujuanDenganRevisi"
                        />
                        <q-btn
                          unelevated
                          color="negative"
                          icon="cancel"
                          label="TOLAK CUTI"
                          rounded
                          outline
                          class="text-weight-bold full-width q-py-sm"
                          @click="updateStatus(selectedCuti, 'Rejected')"
                        />
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
  </q-page>
</template>

<script setup>
/*eslint-disable*/
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
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

// View Mode: 'list' | 'detail-full'
const viewMode = ref('list')

// State Panel Detail Inline (View Switcher)
const selectedCuti = ref(null)
const dialogView = ref('detail') // 'detail' | 'revisi'
const revisiForm = ref({
  tanggal_mulai: '',
  tanggal_selesai: '',
  catatan_revisi: '',
})

// Kolom penuh (saat panel tidak aktif)
const columns = [
  { name: 'karyawan', label: 'INFORMASI KARYAWAN', align: 'left', field: 'nama_karyawan' },
  { name: 'jenis', label: 'JENIS PENGAJUAN', align: 'center', field: 'jenis_pengajuan' },
  { name: 'tanggal', label: 'TANGGAL & DURASI', align: 'center', field: 'tanggal_mulai' },
  { name: 'alasan', label: 'ALASAN & DELEGASI TUGAS', align: 'left', field: 'alasan' },
  { name: 'aksi', label: 'KEPUTUSAN DIREKSI', align: 'center', field: 'aksi' },
]

// Kolom kompak (saat panel detail terbuka di samping)
const columnsCompact = [
  { name: 'karyawan', label: 'KARYAWAN', align: 'left', field: 'nama_karyawan' },
  { name: 'tanggal', label: 'TANGGAL', align: 'center', field: 'tanggal_mulai' },
  { name: 'aksi', label: 'KEPUTUSAN', align: 'center', field: 'aksi' },
]

const columnsHistory = [
  { name: 'karyawan', label: 'INFORMASI KARYAWAN', align: 'left', field: 'nama_karyawan' },
  { name: 'jenis', label: 'JENIS PENGAJUAN', align: 'center', field: 'jenis_pengajuan' },
  { name: 'tanggal', label: 'TANGGAL & DURASI', align: 'center', field: 'tanggal_mulai' },
  { name: 'status', label: 'STATUS FINAL', align: 'center', field: 'status_approval' },
  { name: 'aksi', label: 'HAPUS', align: 'center', field: 'aksi' },
]

const pendingRows = computed(() => {
  return allData.value.filter(
    (d) => d.status_approval === 'Pending' && d.jenis_pengajuan === 'Cuti Tahunan',
  )
})

const completedRows = computed(() => {
  return allData.value.filter(
    (d) => d.status_approval !== 'Pending' && d.jenis_pengajuan === 'Cuti Tahunan',
  )
})

// REVISI EMAS: Deteksi apakah Direktur melakukan revisi tanggal cuti
const isCutiRevised = computed(() => {
  if (!selectedCuti.value) return false
  return (
    revisiForm.value.tanggal_mulai !== selectedCuti.value.tanggal_mulai ||
    revisiForm.value.tanggal_selesai !== selectedCuti.value.tanggal_selesai
  )
})

// REVISI EMAS: Hitung durasi hari kerja secara instan saat Direktur mengubah tanggal mulai/selesai di Dialog
const durasiRevisi = computed(() => {
  if (!revisiForm.value.tanggal_mulai || !revisiForm.value.tanggal_selesai) return 0
  const start = new Date(revisiForm.value.tanggal_mulai)
  const end = new Date(revisiForm.value.tanggal_selesai)
  if (end < start) return 0

  let count = 0
  const current = new Date(start)
  const activeYear = start.getFullYear()
  const yearHolidays = HOLIDAY_DATA[activeYear] || []
  const holidayStrings = yearHolidays.map((h) => h.tanggal)

  while (current <= end) {
    const dayOfWeek = current.getDay()
    const checkDateStr = date.formatDate(current, 'YYYY/MM/DD')

    const isSunday = dayOfWeek === 0
    const isHoliday = holidayStrings.includes(checkDateStr)

    if (!isSunday && !isHoliday) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  return count
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

const getNik = (nama) => {
  if (!nama) return '-'
  return karyawanMap.value[nama.toUpperCase()]?.nik || 'Tidak Tersedia'
}

const getSisaKuota = (nama) => {
  if (!nama) return 12
  return karyawanMap.value[nama.toUpperCase()]?.kuota_cuti || 12
}

// METODE KHUSUS: Mengambil Foto Profil Karyawan terdaftar di database secara dinamis (Anti-Dummy)
const getFotoProfil = (nama) => {
  if (!nama) return ''
  return karyawanMap.value[nama.toUpperCase()]?.foto_profil || ''
}

const getStatusBadgeColor = (status) => {
  if (!status) return 'orange-5'
  const s = status.toLowerCase()
  if (s === 'approved') return 'teal-5'
  if (s === 'revisi') return 'orange-5'
  return 'red-5'
}

const getStatusIcon = (status) => {
  if (!status) return 'schedule'
  const s = status.toLowerCase()
  if (s === 'approved') return 'check_circle'
  if (s === 'revisi') return 'edit_calendar'
  return 'cancel'
}

const getStatusTextLabel = (status) => {
  if (!status) return 'PENDING'
  const s = status.toLowerCase()
  if (s === 'approved') return 'DISETUJUI'
  if (s === 'revisi') return 'REVISI'
  return 'DITOLAK'
}

// Helper: normalkan tanggal dari Firestore (bisa YYYY-MM-DD) ke YYYY/MM/DD untuk q-date
const toQDateFormat = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.replace(/-/g, '/')
}

// Buka Full-Page Detail (klik baris di tabel) — View Switcher seperti CustomerPage
const bukaDetailFullPage = (row) => {
  selectedCuti.value = row
  dialogView.value = 'detail'
  revisiForm.value = {
    tanggal_mulai: toQDateFormat(row.tanggal_mulai),
    tanggal_selesai: toQDateFormat(row.tanggal_selesai),
    catatan_revisi: row.catatan_revisi || '',
  }
  viewMode.value = 'detail-full'
  window.scrollTo(0, 0)
}

// Buka Panel Detail (klik baris)
const bukaDetailCuti = (row) => {
  selectedCuti.value = row
  dialogView.value = 'detail'
  revisiForm.value = {
    tanggal_mulai: toQDateFormat(row.tanggal_mulai),
    tanggal_selesai: toQDateFormat(row.tanggal_selesai),
    catatan_revisi: row.catatan_revisi || '',
  }
}

// Buka Panel langsung ke tab Revisi (klik tombol REVISI di tabel)
const bukaDialogRevisi = (row) => {
  selectedCuti.value = row
  dialogView.value = 'revisi'
  revisiForm.value = {
    tanggal_mulai: toQDateFormat(row.tanggal_mulai),
    tanggal_selesai: toQDateFormat(row.tanggal_selesai),
    catatan_revisi: row.catatan_revisi || '',
  }
}

let unsubscribeData = null

// Load Data Karyawan (untuk NIK, ID Pengurangan Kuota Cuti, dan FOTO PROFIL AKTIF secara dinamis)
const loadKaryawan = async () => {
  try {
    const snap = await getDocs(collection(db, 'karyawan'))
    snap.forEach((docObj) => {
      const data = docObj.data()
      if (data.nama) {
        karyawanMap.value[data.nama.toUpperCase()] = {
          id: docObj.id,
          nik: data.nik || 'Tidak Tersedia',
          kuota_cuti: typeof data.kuota_cuti !== 'undefined' ? data.kuota_cuti : 12,
          foto_profil: data.fotoUrl || data.foto_profil || '', // REVISI: Tarik foto asli dari database (Anti-Dummy)
        }
      }
    })
  } catch (error) {
    console.error('Gagal load NIK Karyawan', error)
  }
}

const hitungHariKerja = (startStr, endStr) => {
  if (!startStr) return 0
  const start = new Date(startStr.replace(/-/g, '/'))
  const end = endStr ? new Date(endStr.replace(/-/g, '/')) : new Date(startStr.replace(/-/g, '/'))
  if (end < start) return 0

  let count = 0
  const current = new Date(start)
  const activeYear = start.getFullYear()
  const yearHolidays = HOLIDAY_DATA[activeYear] || []
  const holidayStrings = yearHolidays.map((h) => h.tanggal)

  while (current <= end) {
    const dayOfWeek = current.getDay()
    const checkDateStr = date.formatDate(current, 'YYYY/MM/DD')

    const isSunday = dayOfWeek === 0
    const isHoliday = holidayStrings.includes(checkDateStr)

    if (!isSunday && !isHoliday) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  return count
}

// Load Data Pengajuan Realtime
const loadDataRealtime = () => {
  const qData = query(collection(db, 'pengajuan'), orderBy('created_at', 'desc'))
  unsubscribeData = onSnapshot(
    qData,
    (snap) => {
      allData.value = snap.docs.map((d) => {
        const data = d.data()
        let totalHari = data.total_hari
        if (totalHari === undefined || totalHari === null || totalHari === '') {
          totalHari = hitungHariKerja(data.tanggal_mulai, data.tanggal_selesai)
        }
        return { id: d.id, ...data, total_hari: totalHari }
      })
      loading.value = false
    },
    (err) => {
      console.error('Gagal fetch realtime pengajuan: ', err)
      loading.value = false
    },
  )
}

// REVISI EMAS: Aksi Simpan Keputusan dengan penambahan Deteksi Fitur Revisi Durasi Tanggal
const prosesPersetujuanDenganRevisi = async () => {
  if (!selectedCuti.value) return

  const id = selectedCuti.value.id
  const hasBeenRevised = isCutiRevised.value

  const durasiFinal = hasBeenRevised ? durasiRevisi.value : selectedCuti.value.total_hari
  const karyawanNameUpper = selectedCuti.value.nama_karyawan.toUpperCase()
  const targetKaryawan = karyawanMap.value[karyawanNameUpper]

  if (targetKaryawan && !hasBeenRevised) {
    const sisaKuotaLama = targetKaryawan.kuota_cuti
    if (sisaKuotaLama < durasiFinal) {
      $q.notify({
        color: 'warning',
        message: `Saldo cuti ${selectedCuti.value.nama_karyawan} tidak mencukupi! (Sisa: ${sisaKuotaLama} Hari, Pengajuan: ${durasiFinal} Hari)`,
        icon: 'warning',
      })
      return
    }
  }

  // Jika direvisi oleh Direktur, status berubah menjadi 'Revisi' bukan 'Approved' secara sepihak
  const finalStatusApproval = hasBeenRevised ? 'Revisi' : 'Approved'
  const confirmTitle = hasBeenRevised ? 'Kirim Revisi Tanggal Cuti' : 'Konfirmasi Keputusan Direksi'
  const confirmMessage = hasBeenRevised
    ? `Apakah Anda yakin ingin mengirim rancangan <b>REVISI</b> cuti harian baru ke <b>${selectedCuti.value.nama_karyawan}</b>?<br/>` +
      `<span class="text-orange-9 text-weight-bold">Status pengajuan akan dialihkan menjadi REVISI untuk dikonfirmasi karyawan.</span>`
    : `Apakah Anda yakin ingin menyetujui pengajuan cuti tahunan milik <b>${selectedCuti.value.nama_karyawan}</b>?<br/>` +
      `<span class="text-positive text-weight-bold">Tindakan ini otomatis memotong ${durasiFinal} Hari kuota cuti karyawan.</span>`

  $q.dialog({
    title: confirmTitle,
    message: confirmMessage,
    html: true,
    persistent: true,
    ok: {
      color: hasBeenRevised ? 'orange-8' : 'positive',
      label: hasBeenRevised ? 'Ya, Kirim Revisi' : 'Ya, Setujui',
      unelevated: true,
      class: 'rounded-8 text-weight-bold',
    },
    cancel: { flat: true, color: 'blue-grey-6', class: 'text-weight-bold' },
    class: 'rounded-16',
  }).onOk(async () => {
    try {
      $q.loading.show({
        message: hasBeenRevised
          ? 'Mengirim status revisi...'
          : 'Memproses pengurangan kuota cuti...',
      })

      const updatePayload = {
        status_approval: finalStatusApproval,
      }

      if (hasBeenRevised) {
        updatePayload.tanggal_mulai = revisiForm.value.tanggal_mulai
        updatePayload.tanggal_selesai = revisiForm.value.tanggal_selesai
        updatePayload.total_hari = durasiFinal
        updatePayload.direvisi_oleh_admin = true
        updatePayload.catatan_revisi = revisiForm.value.catatan_revisi
      }

      // 1. Update Dokumen Cuti di Firestore
      await updateDoc(doc(db, 'pengajuan', id), updatePayload)

      // 2. Jika disetujui instan (tanpa revisi), potong saldo kuota cuti karyawan secara langsung
      if (!hasBeenRevised && targetKaryawan && targetKaryawan.id) {
        const sisaKuotaLama = targetKaryawan.kuota_cuti
        const sisaKuotaBaru = Math.max(0, sisaKuotaLama - durasiFinal)

        await updateDoc(doc(db, 'karyawan', targetKaryawan.id), {
          kuota_cuti: sisaKuotaBaru,
        })

        // Update local map secara instan
        karyawanMap.value[karyawanNameUpper].kuota_cuti = sisaKuotaBaru
      }

      selectedCuti.value = null
      viewMode.value = 'list'
      $q.notify({
        color: 'positive',
        message: hasBeenRevised
          ? 'Revisi berhasil dikirim ke karyawan!'
          : 'Pengajuan cuti berhasil disetujui!',
        icon: 'check_circle',
      })
    } catch (error) {
      console.error(error)
      $q.notify({ color: 'negative', message: 'Gagal memproses tindakan cuti.' })
    } finally {
      $q.loading.hide()
    }
  })
}

// AKSI ADMIN: UPDATE STATUS LANGSUNG DARI TABEL (TANPA DIALOG DETAIL)
const updateStatus = (item, newStatus) => {
  const id = item.id
  const statusIndo = newStatus === 'Approved' ? 'Setujui' : 'Tolak'
  const statusColor = newStatus === 'Approved' ? 'positive' : 'negative'

  $q.dialog({
    title: 'Konfirmasi Keputusan',
    message:
      `Apakah Anda yakin ingin <b>${statusIndo}</b> pengajuan cuti tahunan milik <b>${item.nama_karyawan}</b>?<br/>` +
      (newStatus === 'Approved'
        ? `<span class="text-positive text-weight-bold">Tindakan ini otomatis mengurangi ${item.total_hari} Hari kuota cuti karyawan.</span>`
        : ''),
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
      $q.loading.show({ message: 'Memproses keputusan...' })

      await updateDoc(doc(db, 'pengajuan', id), {
        status_approval: newStatus,
      })

      if (newStatus === 'Approved') {
        const karyawanNameUpper = item.nama_karyawan.toUpperCase()
        const targetKaryawan = karyawanMap.value[karyawanNameUpper]

        if (targetKaryawan && targetKaryawan.id) {
          const sisaKuotaLama = targetKaryawan.kuota_cuti
          const totalPotong = item.total_hari || 0
          const sisaKuotaBaru = Math.max(0, sisaKuotaLama - totalPotong)

          await updateDoc(doc(db, 'karyawan', targetKaryawan.id), {
            kuota_cuti: sisaKuotaBaru,
          })

          karyawanMap.value[karyawanNameUpper].kuota_cuti = sisaKuotaBaru
        }
      }

      selectedCuti.value = null
      viewMode.value = 'list'
      $q.notify({
        color: 'positive',
        message: `Pengajuan cuti berhasil diproses!`,
        icon: 'check_circle',
      })
    } catch (error) {
      console.error(error)
      $q.notify({ color: 'negative', message: 'Gagal memproses pengajuan cuti.' })
    } finally {
      $q.loading.hide()
    }
  })
}

// AKSI ADMIN: HAPUS RIWAYAT
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
  fetchHolidaysByYear(calendarYear.value)
})

onUnmounted(() => {
  if (unsubscribeData) unsubscribeData()
})

// ================================================
// KALENDER DINDING — state & helpers
// ================================================
const loadingCalendar = ref(false)
const calendarHolidays = ref([])
const calendarEvents = ref([])

const now = new Date()
const currentYear = now.getFullYear()
const currentMonthIndex = now.getMonth() // 0-based
const calendarYear = ref(currentYear)

const fetchHolidaysByYear = (year) => {
  loadingCalendar.value = true
  const data = HOLIDAY_DATA[year] || []
  calendarHolidays.value = data
  calendarEvents.value = data.map((h) => ({
    date: h.tanggal,
    type: h.type,
    label: h.nama,
  }))
  loadingCalendar.value = false
}

watch(calendarYear, (newYear) => {
  fetchHolidaysByYear(newYear)
})

const NAMA_BULAN = [
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
]

const calendarMonths = computed(() => {
  return NAMA_BULAN.map((nama, idx) => {
    const firstDay = new Date(calendarYear.value, idx, 1).getDay()
    const totalDays = new Date(calendarYear.value, idx + 1, 0).getDate()
    return { nama, offset: firstDay, totalDays }
  })
})

const toDateStr = (year, month1based, day) => {
  const mm = String(month1based).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}/${mm}/${dd}`
}

const getEventLabel = (year, month1based, day) => {
  const ds = toDateStr(year, month1based, day)
  const ev = calendarEvents.value.find((e) => e.date === ds)
  return ev ? ev.label : ''
}

const getDayClass = (year, month1based, day) => {
  const ds = toDateStr(year, month1based, day)
  const todayStr = toDateStr(now.getFullYear(), now.getMonth() + 1, now.getDate())
  const ev = calendarEvents.value.find((e) => e.date === ds)
  const dow = new Date(year, month1based - 1, day).getDay()

  if (ds === todayStr) return 'cal-today'
  if (ev) return ev.type === 'holiday' ? 'cal-holiday' : 'cal-cuti-bersama'
  if (dow === 0) return 'cal-sunday'
  return ''
}

// Untuk q-date revisi: disable hari Minggu saja (bukan libur, biar direksi bisa lihat)
const isRevisiDateDisabled = (dateString) => {
  const day = new Date(dateString).getDay()
  return day === 0 // hanya Minggu yang di-disable
}

const getDateColor = (dateString) => {
  const ev = calendarEvents.value.find((e) => e.date === dateString)
  if (!ev) return null
  return ev.type === 'holiday' ? 'red' : 'orange'
}

const HOLIDAY_DATA = {
  2025: [
    { tanggal: '2025/01/01', nama: 'Tahun Baru 2025', type: 'holiday' },
    { tanggal: '2025/01/27', nama: 'Isra Miraj', type: 'holiday' },
    { tanggal: '2025/01/28', nama: 'Cuti Bersama Isra Miraj', type: 'cuti_bersama' },
    { tanggal: '2025/01/29', nama: 'Tahun Baru Imlek', type: 'holiday' },
    { tanggal: '2025/03/29', nama: 'Hari Raya Nyepi', type: 'holiday' },
    { tanggal: '2025/03/28', nama: 'Cuti Bersama Nyepi', type: 'cuti_bersama' },
    { tanggal: '2025/03/31', nama: 'Idul Fitri 1446 H', type: 'holiday' },
    { tanggal: '2025/04/01', nama: 'Idul Fitri 1446 H', type: 'holiday' },
    { tanggal: '2025/03/26', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
    { tanggal: '2025/03/27', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
    { tanggal: '2025/04/02', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
    { tanggal: '2025/04/03', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
    { tanggal: '2025/04/04', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
    { tanggal: '2025/04/07', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
    { tanggal: '2025/04/18', nama: 'Wafat Yesus Kristus', type: 'holiday' },
    { tanggal: '2025/05/01', nama: 'Hari Buruh Internasional', type: 'holiday' },
    { tanggal: '2025/05/12', nama: 'Hari Raya Waisak', type: 'holiday' },
    { tanggal: '2025/05/13', nama: 'Cuti Bersama Waisak', type: 'cuti_bersama' },
    { tanggal: '2025/05/29', nama: 'Kenaikan Yesus Kristus', type: 'holiday' },
    { tanggal: '2025/05/28', nama: 'Cuti Bersama Kenaikan Yesus', type: 'cuti_bersama' },
    { tanggal: '2025/06/01', nama: 'Hari Lahir Pancasila', type: 'holiday' },
    { tanggal: '2025/06/06', nama: 'Idul Adha 1446 H', type: 'holiday' },
    { tanggal: '2025/06/27', nama: 'Tahun Baru Islam 1447 H', type: 'holiday' },
    { tanggal: '2025/08/17', nama: 'HUT Kemerdekaan RI', type: 'holiday' },
    { tanggal: '2025/09/05', nama: 'Maulid Nabi Muhammad SAW', type: 'holiday' },
    { tanggal: '2025/12/25', nama: 'Hari Raya Natal', type: 'holiday' },
    { tanggal: '2025/12/26', nama: 'Cuti Bersama Natal', type: 'cuti_bersama' },
  ],
  2026: [
    { tanggal: '2026/01/01', nama: 'Tahun Baru 2026', type: 'holiday' },
    { tanggal: '2026/01/16', nama: 'Isra Miraj 1447 H', type: 'holiday' },
    { tanggal: '2026/02/17', nama: 'Tahun Baru Imlek 2577', type: 'holiday' },
    { tanggal: '2026/03/19', nama: 'Hari Raya Nyepi', type: 'holiday' },
    { tanggal: '2026/03/20', nama: 'Wafat Yesus Kristus', type: 'holiday' },
    { tanggal: '2026/03/21', module: 'absensi', nama: 'Idul Fitri 1447 H', type: 'holiday' },
    { tanggal: '2026/03/22', nama: 'Idul Fitri 1447 H', type: 'holiday' },
    { tanggal: '2026/03/18', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
    { tanggal: '2026/03/23', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
    { tanggal: '2026/03/24', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
    { tanggal: '2026/03/25', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
    { tanggal: '2026/03/26', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
    { tanggal: '2026/03/27', nama: 'Cuti Bersama Idul Fitri', type: 'cuti_bersama' },
    { tanggal: '2026/05/01', nama: 'Hari Buruh Internasional', type: 'holiday' },
    { tanggal: '2026/05/14', nama: 'Kenaikan Yesus Kristus', type: 'holiday' },
    { tanggal: '2026/05/25', nama: 'Hari Raya Waisak', type: 'holiday' },
    { tanggal: '2026/06/01', nama: 'Hari Lahir Pancasila', type: 'holiday' },
    { tanggal: '2026/05/27', nama: 'Idul Adha 1447 H', type: 'holiday' },
    { tanggal: '2026/05/28', nama: 'Cuti Bersama Idul Adha', type: 'cuti_bersama' },
    { tanggal: '2026/06/17', nama: 'Tahun Baru Islam 1448 H', type: 'holiday' },
    { tanggal: '2026/08/17', nama: 'HUT Kemerdekaan RI ke-81', type: 'holiday' },
    { tanggal: '2026/08/25', nama: 'Maulid Nabi Muhammad SAW', type: 'holiday' },
    { tanggal: '2026/12/25', nama: 'Hari Raya Natal', type: 'holiday' },
    { tanggal: '2026/12/24', nama: 'Cuti Bersama Natal', type: 'cuti_bersama' },
    { tanggal: '2026/12/26', nama: 'Cuti Bersama Natal', type: 'cuti_bersama' },
    { tanggal: '2026/12/31', nama: 'Cuti Bersama Tahun Baru', type: 'cuti_bersama' },
  ],
}
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
  max-width: 1400px;
  width: 100%;
}
.bento-card {
  border-radius: 24px;
  border: 1px solid #f1f5f9;
}
.bg-slate-50 {
  background-color: #f8fafc;
}
.border-bottom-light {
  border-bottom: 1px solid #f8fafc;
}
.opacity-50 {
  opacity: 0.5;
}
.opacity-80 {
  opacity: 0.8;
}

.shadow-soft {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05) !important;
}
.shadow-soft-positive {
  box-shadow: 0 8px 24px -8px rgba(33, 186, 69, 0.5) !important;
}
.rounded-24 {
  border-radius: 24px;
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
.rounded-4 {
  border-radius: 4px;
}

.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.hover-effect:hover td {
  background-color: #f8fafc !important;
}
.hover-scale:hover {
  transform: scale(1.08);
}
.hover-text-negative:hover {
  color: #f44336 !important;
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

/* TABLE STYLING: Premium */
.premium-table :deep(thead tr th) {
  font-size: 12px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-bottom: none;
}
.premium-table :deep(tbody tr td) {
  font-size: 13.5px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.3s ease;
}

/* SELECTED ROW in split view */
.row-selected td {
  background-color: #eff6ff !important;
  border-left: 3px solid #3b82f6;
}

/* DETAIL INFO CARDS */
.detail-info-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.detail-info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.08);
}

/* SPLIT PANEL CARD */
.detail-panel-card {
  position: sticky;
  top: 80px;
  border: 1.5px solid #e0e7ff;
}
.detail-panel-header {
  background: linear-gradient(135deg, #f8faff 0%, #f0fdf4 100%);
  border-bottom: 1px solid #f1f5f9;
}
.detail-panel-footer {
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
}

/* SMOOTH COLUMN TRANSITION */
.transition-col {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ORANGE SHADOW FOR REVISI BUTTON */
.shadow-amber {
  box-shadow: 0 4px 16px -4px rgba(251, 140, 0, 0.45) !important;
}

/* BORDER TOP FOR DIALOG FOOTER */
.border-top {
  border-top: 1px solid #f1f5f9;
}

/* CUSTOM INPUTS */
.rounded-input :deep(.q-field__control) {
  border-radius: 12px;
  transition: all 0.3s ease;
}
.rounded-input :deep(.q-field__control:hover) {
  border-color: #e65100;
}

.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* VIEW SWITCHER FADE ANIMATION */
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

.rounded-20 {
  border-radius: 20px;
}

/* ==============================
   KALENDER DINDING
   ============================== */
.cal-day {
  min-width: 0;
}
.cal-day-inner {
  color: #37474f;
  transition: background 0.15s ease;
}
.cal-day-inner:hover {
  background: #f1f5f9;
}
/* Hari ini */
.cal-today {
  background: #1976d2 !important;
  color: #fff !important;
  border-radius: 6px;
}
/* Libur Nasional */
.cal-holiday {
  background: #ffebee !important;
  color: #c62828 !important;
  font-weight: 800 !important;
  border-radius: 6px;
}
/* Cuti Bersama */
.cal-cuti-bersama {
  background: #fff3e0 !important;
  color: #e65100 !important;
  font-weight: 700 !important;
  border-radius: 6px;
}
/* Hari Minggu */
.cal-sunday {
  color: #ef9a9a !important;
  font-weight: 600 !important;
}
.premium-container {
  max-width: 1200px;
  width: 100%;
}
</style>
