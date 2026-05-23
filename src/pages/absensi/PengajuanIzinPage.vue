<template>
  <q-page class="bg-slate-50 q-pa-md q-pa-lg-xl font-inter">
    <div class="premium-container mx-auto">
      <!-- ========================================== -->
      <!-- BAGIAN 1: HEADER & USER INFO               -->
      <!-- ========================================== -->
      <div class="row items-center justify-between q-mb-xl">
        <div class="col-12 col-md-7">
          <div class="row items-center q-mb-xs">
            <div class="ios-icon-box small bg-blue-50 text-primary q-mr-sm">
              <q-icon name="edit_calendar" size="20px" />
            </div>
            <h4 class="text-h4 text-weight-bolder text-blue-grey-10 q-ma-none letter-spacing-tight">
              Pengajuan Cuti & Izin
            </h4>
          </div>
          <div class="text-subtitle1 text-blue-grey-6 q-mt-sm line-height-normal">
            Pusat manajemen permohonan ketidakhadiran, delegasi tugas, dan izin resmi karyawan.
          </div>
        </div>

        <!-- User Badge -->
        <div class="col-12 col-md-auto q-mt-md q-md-mt-none">
          <q-card
            flat
            class="rounded-16 bg-white shadow-soft border-grey hover-scale transition-smooth cursor-pointer"
          >
            <q-card-section class="row items-center q-py-sm q-px-md no-wrap">
              <div class="col-auto">
                <q-avatar size="46px" color="blue-1" text-color="primary" class="shadow-1">
                  <img v-if="userData.fotoUrl" :src="userData.fotoUrl" />
                  <span v-else class="text-weight-bold">{{
                    userData.nama ? userData.nama.substring(0, 1).toUpperCase() : 'U'
                  }}</span>
                </q-avatar>
              </div>

              <div class="col q-ml-md" style="max-width: 250px">
                <div
                  class="text-weight-bolder text-blue-grey-10 text-uppercase letter-spacing-tight"
                  style="
                    word-wrap: break-word;
                    word-break: break-word;
                    white-space: normal;
                    line-height: 1.2;
                  "
                >
                  {{ userData.nama || 'Memuat...' }}
                </div>
                <div
                  class="text-caption text-blue-grey-5 text-weight-bold text-uppercase letter-spacing-1 q-mt-xs"
                  style="line-height: 1.1; font-size: 11px"
                >
                  {{ userData.jabatan || userData.role || 'KARYAWAN' }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- BAGIAN 2: STATISTIK BENTO CARDS            -->
      <!-- ========================================== -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <div class="col-12 col-sm-4" v-for="(stat, index) in leaveStats" :key="index">
          <q-card
            flat
            class="bento-card bg-white full-height q-pa-md transition-smooth hover-scale relative-position overflow-hidden"
          >
            <!-- Background Icon Watermark -->
            <q-icon
              :name="stat.icon"
              size="100px"
              :color="stat.color + '-1'"
              class="absolute-bottom-right opacity-50"
              style="margin: -20px -20px 0 0"
            />

            <div class="row items-center no-wrap relative-position z-content">
              <div
                class="ios-icon-box q-mr-md"
                :class="'bg-' + stat.color + '-50 text-' + stat.color + '-6'"
              >
                <q-icon :name="stat.icon" size="28px" />
              </div>
              <div class="col">
                <div
                  class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1 q-mb-xs"
                >
                  {{ stat.label }}
                </div>
                <div
                  class="text-h4 text-weight-black line-height-tight"
                  :class="'text-' + (stat.textColor || stat.color + '-7')"
                >
                  {{ stat.value }}
                  <span class="text-subtitle1 text-weight-bold opacity-50">Hari</span>
                </div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div v-if="stat.showProgress" class="q-mt-lg relative-position z-content">
              <q-linear-progress
                :value="stat.progress"
                :color="stat.color + '-5'"
                track-color="grey-2"
                size="6px"
                class="rounded-borders"
              />
            </div>
          </q-card>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- BAGIAN 3: FORMULIR PENGAJUAN (WIZARD STYLE)-->
      <!-- ========================================== -->
      <div class="row q-col-gutter-lg">
        <div class="col-12 col-lg-5">
          <q-card flat class="bento-card bg-white full-height">
            <q-card-section class="q-pa-lg border-bottom-light row items-center justify-between">
              <div>
                <div class="text-h6 text-weight-bolder text-blue-grey-9">Buat Permohonan</div>
                <div class="text-caption text-blue-grey-5 text-weight-medium">
                  Lengkapi formulir pengajuan di bawah ini.
                </div>
              </div>
              <q-avatar
                color="blue-50"
                text-color="primary"
                icon="post_add"
                size="42px"
                class="rounded-12"
              />
            </q-card-section>

            <q-card-section class="q-pa-lg">
              <q-form @submit="onSubmit" class="q-gutter-y-lg">
                <!-- Jenis & Tanggal -->
                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <div
                      class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                    >
                      Jenis Izin / Cuti
                    </div>
                    <q-select
                      outlined
                      v-model="form.jenis"
                      :options="optionsJenis"
                      emit-value
                      map-options
                      class="rounded-input bg-grey-1"
                      color="primary"
                      placeholder="Pilih jenis ketidakhadiran"
                      :rules="[(val) => !!val || 'Wajib pilih jenis']"
                    >
                      <template v-slot:prepend
                        ><q-icon name="style" color="blue-grey-4"
                      /></template>
                    </q-select>
                  </div>

                  <div class="col-12">
                    <div
                      class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                    >
                      Rentang Waktu
                    </div>
                    <q-input
                      outlined
                      v-model="dateRangeLabel"
                      readonly
                      class="rounded-input bg-grey-1 cursor-pointer"
                      color="primary"
                      placeholder="Pilih rentang tanggal"
                      @click="$refs.qDateProxy.show()"
                    >
                      <template v-slot:prepend
                        ><q-icon name="calendar_today" color="blue-grey-4"
                      /></template>
                      <template v-slot:append
                        ><q-icon name="edit_calendar" color="primary" size="xs"
                      /></template>

                      <q-popup-proxy
                        ref="qDateProxy"
                        transition-show="scale"
                        transition-hide="scale"
                        backdrop-filter="blur(4px)"
                      >
                        <q-date
                          v-model="form.range"
                          range
                          minimal
                          emit-immediately
                          color="primary"
                          :options="(d) => !isDateDisabled(d)"
                          :events="(d) => calendarEvents.some((e) => e.date === d)"
                          :event-color="(d) => getDateColor(d)"
                          class="shadow-soft rounded-16"
                        >
                          <div class="row items-center justify-end q-gutter-sm q-pa-sm border-top">
                            <!-- Legenda kalender -->
                            <div class="full-width row q-gutter-xs q-mb-sm q-px-xs">
                              <div class="row items-center q-mr-md">
                                <div
                                  style="
                                    width: 10px;
                                    height: 10px;
                                    border-radius: 50%;
                                    background: #ef5350;
                                  "
                                  class="q-mr-xs"
                                ></div>
                                <span class="text-caption text-blue-grey-7"
                                  >Hari Libur Nasional</span
                                >
                              </div>
                              <div class="row items-center">
                                <div
                                  style="
                                    width: 10px;
                                    height: 10px;
                                    border-radius: 50%;
                                    background: #fb8c00;
                                  "
                                  class="q-mr-xs"
                                ></div>
                                <span class="text-caption text-blue-grey-7">Cuti Bersama</span>
                              </div>
                            </div>
                            <q-btn
                              label="SELESAI PILIH TANGGAL"
                              color="primary"
                              unelevated
                              class="full-width rounded-8 text-weight-bold"
                              v-close-popup
                            />
                          </div>
                        </q-date>
                        <div
                          v-if="form.jenis === 'Cuti Tahunan'"
                          class="text-caption text-orange q-mt-sm"
                        >
                          Pengajuan cuti tahunan wajib dilakukan minimal H+14.
                        </div>
                      </q-popup-proxy>
                    </q-input>
                  </div>
                </div>

                <!-- Alasan -->
                <div>
                  <div
                    class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                  >
                    Alasan Detail
                  </div>
                  <q-input
                    outlined
                    v-model="form.alasan"
                    type="textarea"
                    placeholder="Rincikan alasan Anda dengan jelas..."
                    class="rounded-input bg-grey-1"
                    color="primary"
                    rows="3"
                    :rules="[(val) => !!val || 'Wajib diisi']"
                  >
                    <template v-slot:prepend><q-icon name="notes" color="blue-grey-4" /></template>
                  </q-input>
                </div>

                <!-- Dokumen & Delegasi (FILE UPLOAD BARU) -->
                <div>
                  <div
                    class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                  >
                    Opsi Tambahan
                  </div>
                  <div class="row q-col-gutter-md">
                    <!-- UPLOAD FOTO/FILE -->
                    <div class="col-12 col-sm-6">
                      <q-file
                        outlined
                        v-model="form.lampiran"
                        placeholder="Pilih Foto/File Bukti (Opsional)"
                        class="rounded-input bg-grey-1"
                        color="primary"
                        accept="image/*, .pdf"
                        clearable
                        max-file-size="5242880"
                        @rejected="onFileRejected"
                      >
                        <template v-slot:prepend>
                          <q-icon name="cloud_upload" color="blue-grey-4" />
                        </template>
                        <template v-slot:append>
                          <q-icon name="attach_file" color="blue-grey-4" />
                        </template>
                        <q-tooltip class="bg-blue-grey-9">
                          Upload surat dokter atau foto bukti (Maks. 5MB)
                        </q-tooltip>
                      </q-file>
                    </div>

                    <div class="col-12 col-sm-6">
                      <q-select
                        outlined
                        v-model="form.delegasi"
                        :options="optionsKaryawan"
                        placeholder="Delegasi Tugas"
                        class="rounded-input bg-grey-1"
                        color="primary"
                      >
                        <template v-slot:prepend
                          ><q-icon name="person_add" color="blue-grey-4"
                        /></template>
                        <q-tooltip class="bg-blue-grey-9"
                          >Pilih rekan kerja untuk mendelegasikan tugas</q-tooltip
                        >
                      </q-select>
                    </div>
                  </div>
                </div>

                <!-- Tombol Submit -->
                <div class="q-pt-sm">
                  <q-btn
                    unelevated
                    color="primary"
                    label="KIRIM PENGAJUAN SEKARANG"
                    icon="send"
                    class="full-width q-py-md rounded-16 shadow-soft-primary text-weight-bolder text-subtitle1 transition-smooth"
                    :loading="submitting"
                    type="submit"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>

        <!-- ========================================== -->
        <!-- BAGIAN 4: TABEL RIWAYAT PENGAJUAN          -->
        <!-- ========================================== -->
        <div class="col-12 col-lg-7">
          <q-card flat class="bento-card bg-white full-height overflow-hidden">
            <q-card-section class="q-pa-lg border-bottom-light row items-center justify-between">
              <div>
                <div class="text-h6 text-weight-bolder text-blue-grey-9">Daftar Pengajuan Saya</div>
                <div class="text-caption text-blue-grey-5 text-weight-medium">
                  Status permohonan yang telah diajukan.
                </div>
              </div>
              <q-badge
                color="blue-grey-1"
                text-color="blue-grey-8"
                class="text-weight-bold q-px-sm q-py-xs rounded-6 border-grey"
              >
                Riwayat Personal
              </q-badge>
            </q-card-section>

            <q-table
              :rows="rows"
              :columns="columns"
              row-key="id"
              flat
              :loading="loading"
              :pagination="{ rowsPerPage: 10 }"
              class="premium-table"
              card-class="bg-transparent"
            >
              <!-- Header Styling -->
              <template v-slot:header="props">
                <q-tr :props="props" class="bg-slate-50">
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

              <!-- Body Styling -->
              <template v-slot:body="props">
                <q-tr :props="props" class="hover-effect">
                  <q-td key="no" class="text-center text-blue-grey-4 text-weight-bold">{{
                    props.rowIndex + 1
                  }}</q-td>

                  <q-td key="jenis" class="text-left">
                    <div class="row items-center no-wrap">
                      <div
                        class="type-indicator q-mr-sm"
                        :class="getJenisBg(props.row.jenis_pengajuan)"
                      ></div>
                      <div class="text-weight-bold text-blue-grey-9 text-subtitle2">
                        {{ props.row.jenis_pengajuan }}
                      </div>
                    </div>
                  </q-td>

                  <q-td key="mulai" class="text-center">
                    <span class="text-weight-medium text-blue-grey-8">{{
                      formatDate(props.row.tanggal_mulai)
                    }}</span>
                  </q-td>

                  <q-td key="selesai" class="text-center">
                    <span class="text-weight-medium text-blue-grey-8">{{
                      formatDate(props.row.tanggal_selesai)
                    }}</span>
                  </q-td>

                  <q-td key="alasan" class="text-left">
                    <div class="ellipsis text-blue-grey-7" style="max-width: 180px">
                      {{ props.row.alasan }}
                      <q-tooltip class="bg-blue-grey-9">{{ props.row.alasan }}</q-tooltip>
                    </div>
                  </q-td>

                  <q-td key="lampiran" class="text-center">
                    <q-btn
                      v-if="props.row.dokumen_url"
                      flat
                      round
                      color="primary"
                      icon="link"
                      size="sm"
                      class="bg-blue-50 transition-smooth"
                      type="a"
                      :href="props.row.dokumen_url"
                      target="_blank"
                    >
                      <q-tooltip>Lihat Dokumen</q-tooltip>
                    </q-btn>
                    <span v-else class="text-grey-4 font-mono">-</span>
                  </q-td>

                  <q-td key="delegasi" class="text-center">
                    <q-badge
                      v-if="props.row.delegasi"
                      outline
                      color="blue-grey-5"
                      class="rounded-6 bg-grey-1 text-weight-bold"
                    >
                      {{ props.row.delegasi }}
                    </q-badge>
                    <span v-else class="text-grey-4 font-mono">-</span>
                  </q-td>

                  <q-td key="status" class="text-right">
                    <q-badge
                      :color="getStatusColor(props.row.status_approval) + '-1'"
                      :text-color="getStatusColor(props.row.status_approval) + '-9'"
                      class="q-px-md q-py-xs text-weight-bolder uppercase rounded-8 shadow-1"
                    >
                      <q-icon
                        :name="getStatusIcon(props.row.status_approval)"
                        size="12px"
                        class="q-mr-xs"
                      />
                      {{ props.row.status_approval || 'Pending' }}
                    </q-badge>
                    <!-- Badge DIREVISI jika admin mengubah durasi -->
                    <div v-if="props.row.direvisi_oleh_admin" class="q-mt-xs">
                      <q-badge
                        color="orange-2"
                        text-color="orange-9"
                        class="q-px-sm q-py-xs rounded-6 text-weight-bold"
                        style="font-size: 10px"
                      >
                        <q-icon name="edit" size="10px" class="q-mr-xs" />
                        Durasi Direvisi Admin
                      </q-badge>
                    </div>
                  </q-td>

                  <!-- Kolom Catatan Admin -->
                  <q-td key="catatan" class="text-left">
                    <div
                      v-if="props.row.catatan_revisi"
                      class="row items-start no-wrap"
                      style="max-width: 200px"
                    >
                      <q-icon
                        name="admin_panel_settings"
                        color="orange-6"
                        size="14px"
                        class="q-mr-xs q-mt-xs flex-shrink-0"
                      />
                      <div>
                        <div class="text-caption text-weight-bold text-orange-8 q-mb-xs">
                          Catatan Admin:
                        </div>
                        <div
                          class="text-caption text-blue-grey-7 line-height-normal"
                          style="white-space: normal"
                        >
                          {{ props.row.catatan_revisi }}
                          <q-tooltip class="bg-blue-grey-9 text-white rounded-8" max-width="280px">
                            {{ props.row.catatan_revisi }}
                          </q-tooltip>
                        </div>
                      </div>
                    </div>
                    <span v-else class="text-grey-4 font-mono">-</span>
                  </q-td>
                </q-tr>
              </template>

              <!-- No Data State -->
              <template v-slot:no-data>
                <div class="full-width column flex-center q-pa-xl text-blue-grey-4">
                  <q-icon size="4em" name="fact_check" class="q-mb-md opacity-50" />
                  <div class="text-h6 text-weight-bold">Belum Ada Pengajuan</div>
                  <div class="text-caption">Anda belum pernah mengajukan cuti atau izin.</div>
                </div>
              </template>
            </q-table>
          </q-card>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- BAGIAN 5: KALENDER DINDING REALTIME        -->
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
                Data hari libur nasional & cuti bersama Indonesia otomatis
              </div>
            </div>
          </div>
          <div class="row items-center q-gutter-sm">
            <!-- Legenda -->
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
                style="width: 12px; height: 12px; border-radius: 3px; background: #ffebee"
                class="q-mr-xs q-ml-md; border: 1px solid #ef9a9a"
              ></div>
              <span class="text-caption text-weight-bold text-blue-grey-7">Minggu</span>
            </div>
            <!-- Navigasi Tahun -->
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

        <!-- Grid 12 Bulan -->
        <div class="row q-col-gutter-md">
          <div
            v-for="(bulan, bIndex) in calendarMonths"
            :key="bIndex"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <q-card flat class="bento-card bg-white overflow-hidden">
              <!-- Header Bulan -->
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

              <!-- Header Hari -->
              <div class="row q-px-xs q-pt-xs">
                <div
                  v-for="hari in ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']"
                  :key="hari"
                  class="col text-center"
                  style="font-size: 10px; font-weight: 700; padding: 4px 0; color: #90a4ae"
                >
                  {{ hari }}
                </div>
              </div>

              <!-- Grid Tanggal -->
              <div class="row q-px-xs q-pb-xs">
                <!-- Offset hari pertama bulan -->
                <div
                  v-for="n in bulan.offset"
                  :key="'off-' + n"
                  class="col"
                  style="aspect-ratio: 1"
                />
                <!-- Tanggal -->
                <div
                  v-for="tgl in bulan.totalDays"
                  :key="tgl"
                  class="col text-center cal-day"
                  style="padding: 2px"
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
                    <!-- Nama libur singkat (2 kata pertama) -->
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
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { db, storage } from 'src/boot/firebase'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useQuasar, date } from 'quasar'

const $q = useQuasar()
const loading = ref(true)
const submitting = ref(false)
const rows = ref([])

// Kalender dari API publik (otomatis, tanpa input manual)
const holidays = ref([]) // semua hari libur + cuti bersama tahun ini
const disabledDates = ref([]) // tanggal yang tidak bisa dipilih di form
const calendarEvents = ref([]) // untuk highlight kalender dinding

// State Dinamis Terintegrasi
const userData = ref({
  nama: 'Memuat...',
  jabatan: 'Karyawan',
  role: 'Staff',
  fotoUrl: '',
  email: '',
})

const form = ref({
  jenis: null,
  range: { from: null, to: null },
  alasan: '',
  lampiran: null, // DIGANTI JADI OBJECT FILE
  delegasi: null,
})

const optionsJenis = [
  { label: 'Cuti Tahunan', value: 'Cuti Tahunan' },
  { label: 'Izin Sakit', value: 'Izin Sakit' },
  { label: 'Izin Mendadak', value: 'Izin' },
]

const optionsKaryawan = ['Ilham Fahyono', 'Ihmawan Wira', 'Budi Santoso', 'Agung Nugroho']

const columns = [
  { name: 'no', label: 'NO', align: 'center' },
  { name: 'jenis', label: 'JENIS PENGAJUAN', align: 'left' },
  { name: 'mulai', label: 'MULAI', align: 'center' },
  { name: 'selesai', label: 'AKHIR', align: 'center' },
  { name: 'alasan', label: 'ALASAN', align: 'left' },
  { name: 'lampiran', label: 'LAMPIRAN', align: 'center' },
  { name: 'delegasi', label: 'DELEGASI', align: 'center' },
  { name: 'status', label: 'STATUS', align: 'right' },
  { name: 'catatan', label: 'CATATAN ADMIN', align: 'left' },
]

const usedDays = computed(() => {
  let total = 0

  rows.value.forEach((row) => {
    const approved = row.status_approval === 'Approved' || row.status_approval === 'Selesai'

    const isAnnualLeave = row.jenis_pengajuan === 'Cuti Tahunan'

    if (approved && isAnnualLeave) {
      const start = new Date(row.tanggal_mulai)
      const end = new Date(row.tanggal_selesai)

      total += Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1
    }
  })

  return total
})

const leaveStats = computed(() => [
  {
    label: 'Total Saldo Tahunan',
    value: 12,
    icon: 'account_balance_wallet',
    color: 'indigo',
    showProgress: false,
  },
  {
    label: 'Telah Digunakan',
    value: usedDays.value,
    icon: 'event_busy',
    color: 'orange',
    showProgress: true,
    progress: usedDays.value / 12,
  },
  {
    label: 'Sisa Saldo Cuti',
    value: Math.max(0, 12 - usedDays.value),
    icon: 'verified',
    color: 'teal',
    showProgress: true,
    progress: (12 - usedDays.value) / 12,
    textColor: 'teal-7',
  },
])

const dateRangeLabel = computed(() => {
  const r = form.value.range
  if (!r) return ''
  return typeof r === 'string' ? r : r.from ? `${r.from} — ${r.to}` : ''
})

const formatDate = (d) => (d ? date.formatDate(d, 'DD MMM YYYY') : '-')

// HELPER WARNA UNTUK STATUS & JENIS
const getStatusColor = (s) => {
  const st = s ? s.toLowerCase() : 'pending'
  if (st === 'pending') return 'orange'
  if (st === 'approved') return 'teal'
  return 'red'
}

const getStatusIcon = (s) => {
  const st = s ? s.toLowerCase() : 'pending'
  if (st === 'pending') return 'schedule'
  if (st === 'approved') return 'check_circle'
  return 'cancel'
}

const getJenisBg = (j) => {
  if (j === 'Izin Sakit') return 'bg-red-4'
  if (j === 'Cuti Tahunan') return 'bg-indigo-4'
  return 'bg-blue-grey-4'
}

const onFileRejected = () => {
  $q.notify({
    color: 'negative',
    message: 'File ditolak. Pastikan format berupa Gambar/PDF dan ukuran maksimal 5MB.',
    icon: 'warning',
  })
}

// ============================================================
// DATA HARI LIBUR INDONESIA — per tahun, lengkap & akurat
// Sumber: Keputusan Bersama/SKB Pemerintah RI
// Format tanggal: YYYY/MM/DD  |  type: 'holiday' | 'cuti_bersama'
// ============================================================
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
    { tanggal: '2026/03/21', nama: 'Idul Fitri 1447 H', type: 'holiday' },
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

const loadingCalendar = ref(false)

const fetchHolidaysByYear = (year) => {
  loadingCalendar.value = true
  const data = HOLIDAY_DATA[year] || []
  holidays.value = data
  disabledDates.value = data.map((h) => h.tanggal)
  calendarEvents.value = data.map((h) => ({
    date: h.tanggal,
    type: h.type,
    label: h.nama,
  }))
  loadingCalendar.value = false
}

const isDateDisabled = (dateString) => {
  return disabledDates.value.includes(dateString)
}

// Helper: warna highlight di kalender berdasarkan jenis event
const getDateColor = (dateString) => {
  const ev = calendarEvents.value.find((e) => e.date === dateString)
  if (!ev) return null
  return ev.type === 'holiday' ? 'red' : 'orange'
}

// ================================================
// KALENDER DINDING — computed & helpers
// ================================================
const now = new Date()
const currentYear = now.getFullYear()
const currentMonthIndex = now.getMonth() // 0-based
const calendarYear = ref(currentYear)

// Watch: setiap calendarYear berubah, fetch data libur tahun itu otomatis
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

// Build struktur 12 bulan untuk tahun yang dipilih
const calendarMonths = computed(() => {
  return NAMA_BULAN.map((nama, idx) => {
    const firstDay = new Date(calendarYear.value, idx, 1).getDay() // 0=Min
    const totalDays = new Date(calendarYear.value, idx + 1, 0).getDate()
    return { nama, offset: firstDay, totalDays }
  })
})

// Format tanggal ke string YYYY/MM/DD untuk dicocokkan dengan Firestore
const toDateStr = (year, month1based, day) => {
  const mm = String(month1based).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}/${mm}/${dd}`
}

// Ambil label event (nama libur/cuti) untuk tooltip
const getEventLabel = (year, month1based, day) => {
  const ds = toDateStr(year, month1based, day)
  const ev = calendarEvents.value.find((e) => e.date === ds)
  return ev ? ev.label : ''
}

// Tentukan class CSS tiap tanggal di kalender dinding
const getDayClass = (year, month1based, day) => {
  const ds = toDateStr(year, month1based, day)
  const todayStr = toDateStr(now.getFullYear(), now.getMonth() + 1, now.getDate())
  const ev = calendarEvents.value.find((e) => e.date === ds)
  const dow = new Date(year, month1based - 1, day).getDay() // 0=Min

  if (ds === todayStr) return 'cal-today'
  if (ev) return ev.type === 'holiday' ? 'cal-holiday' : 'cal-cuti-bersama'
  if (dow === 0) return 'cal-sunday' // Minggu tetap merah muda
  return ''
}

const validateLeaveSubmission = () => {
  const range = form.value.range

  const startDate = typeof range === 'string' ? range : range?.from

  if (!startDate) {
    throw new Error('Tanggal cuti wajib dipilih.')
  }

  if (form.value.jenis === 'Cuti Tahunan') {
    const today = new Date()

    today.setHours(0, 0, 0, 0)

    const minimumDate = new Date(today)

    minimumDate.setDate(minimumDate.getDate() + 14)

    const selectedDate = new Date(startDate)

    selectedDate.setHours(0, 0, 0, 0)

    if (selectedDate < minimumDate) {
      throw new Error('Pengajuan cuti tahunan minimal harus H+14 dari tanggal pengajuan.')
    }
  }

  if (isDateDisabled(startDate)) {
    throw new Error('Tanggal yang dipilih merupakan hari libur nasional / cuti bersama.')
  }
}

const onSubmit = async () => {
  submitting.value = true
  try {
    validateLeaveSubmission()

    const range = form.value.range
    const start = typeof range === 'string' ? range : range?.from
    const end = typeof range === 'string' ? range : range?.to
    if (!start) throw new Error('Harap pilih rentang tanggal pada formulir.')

    const namaKaryawan = (userData.value.nama || 'USER').toUpperCase()

    // 1. PROSES UPLOAD FILE LAMPIRAN JIKA ADA
    let finalDocUrl = ''
    if (form.value.lampiran) {
      $q.loading.show({ message: 'Mengunggah dokumen bukti ke Cloud...' })
      const file = form.value.lampiran
      const extension = file.name.split('.').pop()
      const fileName = `PENGAJUAN_${namaKaryawan}_${Date.now()}.${extension}`

      const sRef = storageRef(storage, `lampiran_pengajuan/${fileName}`)
      await uploadBytes(sRef, file)
      finalDocUrl = await getDownloadURL(sRef)
      $q.loading.hide()
    }

    // 2. SIMPAN DATA KE FIRESTORE
    await addDoc(collection(db, 'pengajuan'), {
      nama_karyawan: namaKaryawan,
      jenis_pengajuan: form.value.jenis,
      tanggal_mulai: start,
      tanggal_selesai: end || start,
      alasan: form.value.alasan,
      dokumen_url: finalDocUrl, // Ini sekarang adalah Link asli dari file yang diupload!
      delegasi: form.value.delegasi,
      status_approval: 'Pending',
      created_at: serverTimestamp(),
    })

    $q.notify({
      color: 'positive',
      message: 'Pengajuan Berhasil Dikirim!',
      position: 'top',
      icon: 'check_circle',
      classes: 'rounded-12 text-weight-bold',
    })

    // RESET FORM
    form.value = {
      jenis: null,
      range: { from: null, to: null },
      alasan: '',
      lampiran: null,
      delegasi: null,
    }
  } catch (e) {
    if ($q.loading.isActive) $q.loading.hide()
    $q.notify({ color: 'negative', message: e.message, classes: 'rounded-12 text-weight-bold' })
  } finally {
    submitting.value = false
  }
}

let unsubscribeData = null
let unsubscribeUser = null

onMounted(() => {
  // Kalender: load data tahun ini dari data lokal (instant, tanpa API)
  fetchHolidaysByYear(currentYear)

  // 1. SINKRONISASI DATA USER DARI LOKAL
  const saved = localStorage.getItem('user_data')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      userData.value = {
        nama: parsed.nama || 'User',
        jabatan: parsed.jabatan || parsed.role || 'Karyawan',
        role: parsed.role || 'Staff',
        email: parsed.email || '',
        fotoUrl: parsed.fotoUrl || parsed.foto_profil || '',
      }

      // 2. REAL-TIME LISTENER PROFILE DARI FIRESTORE
      if (userData.value.email) {
        const qUser = query(collection(db, 'karyawan'), where('email', '==', userData.value.email))
        unsubscribeUser = onSnapshot(qUser, (snap) => {
          if (!snap.empty) {
            const data = snap.docs[0].data()
            userData.value = {
              ...userData.value,
              nama: data.nama || userData.value.nama,
              jabatan: data.jabatan || userData.value.jabatan,
              role: data.role || userData.value.role,
              fotoUrl: data.foto_profil || data.fotoUrl || userData.value.fotoUrl,
            }
          }
        })
      }
    } catch (e) {
      console.error('Error memuat sesi lokal:', e)
    }
  }

  // 3. AMBIL DAFTAR PENGAJUAN MILIK USER SAJA
  const searchName = (userData.value.nama || 'USER').toUpperCase()

  const qData = query(
    collection(db, 'pengajuan'),
    where('nama_karyawan', '==', searchName),
    orderBy('created_at', 'desc'),
  )

  unsubscribeData = onSnapshot(
    qData,
    (snap) => {
      rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      console.error('Gagal mengambil data pengajuan:', err)
      loading.value = false
    },
  )
})

onUnmounted(() => {
  if (unsubscribeData) unsubscribeData()
  if (unsubscribeUser) unsubscribeUser()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap');

/* GLOBAL TYPOGRAPHY */
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
.line-height-tight {
  line-height: 1.1;
}
.line-height-normal {
  line-height: 1.4;
}
.uppercase {
  text-transform: uppercase;
}

/* LAYOUTING & BENTO GRID */
.premium-container {
  max-width: 1400px;
}
.bento-card {
  border-radius: 24px;
  border: 1px solid #f1f5f9;
}
.bg-slate-50 {
  background-color: #f8fafc;
}
.border-grey {
  border: 1px solid #e2e8f0;
}
.border-bottom-light {
  border-bottom: 1px solid #f8fafc;
}
.border-top {
  border-top: 1px solid #f1f5f9;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.z-content {
  position: relative;
  z-index: 2;
}
.opacity-50 {
  opacity: 0.5;
}

/* SHADOWS & RADIUS */
.shadow-soft {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.06) !important;
}
.shadow-soft-primary {
  box-shadow: 0 8px 24px -8px rgba(25, 118, 210, 0.5) !important;
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

/* ANIMATION */
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.hover-scale:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px -10px rgba(0, 0, 0, 0.1) !important;
}
.hover-effect:hover td {
  background-color: #f8fafc !important;
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

/* CUSTOM INPUTS */
.rounded-input :deep(.q-field__control) {
  border-radius: 12px;
  transition: all 0.3s ease;
}
.rounded-input :deep(.q-field__control:hover) {
  border-color: #1976d2;
}

/* TABLE STYLING */
.premium-table :deep(thead tr th) {
  font-size: 12px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-bottom: none;
}
.premium-table :deep(tbody tr td) {
  font-size: 14px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.3s ease;
}
.type-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
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
</style>
