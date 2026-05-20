<template>
  <q-page class="bg-slate-50 q-pa-md q-pa-lg-xl font-inter">
    <div class="bento-container mx-auto">
      <!-- ========================================== -->
      <!-- BAGIAN ATAS: PROFIL & WAKTU                -->
      <!-- ========================================== -->
      <div class="row q-col-gutter-lg q-mb-lg" v-if="!showCamera">
        <!-- WIDGET 1: PROFIL KARYAWAN -->
        <div class="col-12 col-md-7 col-lg-8 hide-on-mobile">
          <q-card flat class="bento-card bg-white full-height relative-position overflow-hidden">
            <div class="decor-circle-1"></div>
            <q-card-section
              class="q-pa-lg q-pa-md-xl z-content full-height flex column justify-center"
            >
              <div class="row items-center">
                <div class="col-auto q-mr-lg q-mb-sm relative-position">
                  <q-avatar
                    size="84px"
                    :color="getRandomColor(userData.nama)"
                    text-color="white"
                    class="shadow-soft text-weight-bolder text-h4 overflow-hidden"
                  >
                    <q-img
                      v-if="userData.fotoUrl || userData.foto_profil"
                      :src="userData.fotoUrl || userData.foto_profil"
                      class="absolute-full"
                    />
                    <span v-else>{{ getInitial(userData.nama) }}</span>
                  </q-avatar>
                  <q-badge floating color="teal-5" rounded class="status-badge shadow-1" />
                </div>

                <div class="col">
                  <div
                    class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1 q-mb-xs"
                  >
                    Selamat Datang Kembali,
                  </div>
                  <div
                    class="text-h5 text-md-h4 text-weight-bolder text-blue-grey-10 text-capitalize line-height-tight"
                    style="word-wrap: break-word; word-break: break-word"
                  >
                    {{ userData.nama || 'Memuat Data...' }}
                  </div>
                  <div class="row items-center q-mt-sm q-gutter-sm">
                    <q-badge
                      color="indigo-1"
                      text-color="indigo-9"
                      class="text-weight-bold q-px-sm q-py-xs rounded-6"
                    >
                      {{ userData.jabatan || userData.role || 'KARYAWAN' }}
                    </q-badge>
                    <q-badge
                      color="grey-2"
                      text-color="grey-7"
                      class="text-weight-bold q-px-sm q-py-xs rounded-6 ellipsis"
                      style="max-width: 100%"
                    >
                      <q-icon name="mail" size="10px" class="q-mr-xs" />
                      {{ userData.email || 'Memuat email...' }}
                    </q-badge>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- WIDGET 2: JAM "AURORA HOLOGRAPHIC" PREMIUM -->
        <div class="col-12 col-md-5 col-lg-4">
          <q-card
            flat
            class="bento-card aurora-card text-white full-height flex flex-center relative-position overflow-hidden"
          >
            <div class="aurora-bg"></div>
            <div class="glass-layer"></div>

            <q-card-section class="text-center z-content q-pa-lg full-width">
              <div class="row items-center justify-center q-mb-md opacity-80">
                <q-icon name="schedule" size="xs" color="white" class="q-mr-sm" />
                <div class="text-caption text-white text-weight-bold uppercase letter-spacing-2">
                  Waktu Server AGRA
                </div>
              </div>

              <div class="time-wrapper drop-shadow-glow text-white">
                <span class="time-hhmm"
                  >{{ currentHours }}<span class="blink text-blue-2">:</span
                  >{{ currentMinutes }}</span
                >
                <span class="time-ss text-blue-3">{{ currentSeconds }}</span>
              </div>

              <div class="date-chip q-mt-md shadow-2">{{ currentDate }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- BAGIAN TENGAH: RADAR LOKASI & ACTION       -->
      <!-- ========================================== -->
      <div class="row q-col-gutter-lg q-mb-lg flex" v-if="!showCamera">
        <!-- WIDGET 3: RADAR GPS -->
        <div class="col-12 col-md-6 mobile-order-2 desktop-order-1">
          <q-card flat class="bento-card bg-white full-height">
            <q-card-section class="q-pa-lg">
              <div class="row items-center justify-between q-mb-lg">
                <div class="row items-center">
                  <q-icon name="satellite_alt" color="blue-grey-4" size="sm" class="q-mr-sm" />
                  <div class="text-subtitle1 text-weight-bold text-blue-grey-9">
                    Sistem Radar Lokasi
                  </div>
                </div>
                <q-badge
                  outline
                  color="indigo-5"
                  class="q-px-sm q-py-xs rounded-6 font-mono text-weight-bold bg-indigo-50"
                >
                  <q-icon name="work_outline" size="12px" class="q-mr-xs" /> SHIFT: 08:00 - 17:00
                </q-badge>
              </div>

              <div
                class="radar-box q-pa-md rounded-16 relative-position overflow-hidden"
                :class="
                  locationData.inRange && !locationData.securityRisk
                    ? 'radar-valid'
                    : 'radar-invalid'
                "
              >
                <div class="row items-start no-wrap">
                  <div class="radar-icon-container q-mr-md q-mt-xs">
                    <div
                      class="icon-pulse-ring"
                      :class="
                        locationData.inRange && !locationData.securityRisk
                          ? 'pulse-green'
                          : 'pulse-red'
                      "
                    ></div>
                    <q-avatar
                      :color="
                        locationData.inRange && !locationData.securityRisk ? 'teal-1' : 'red-1'
                      "
                      :text-color="
                        locationData.inRange && !locationData.securityRisk ? 'teal-6' : 'red-5'
                      "
                      size="48px"
                    >
                      <q-icon
                        :name="
                          locationData.securityRisk
                            ? 'gavel'
                            : locationData.inRange
                              ? 'verified_user'
                              : 'location_off'
                        "
                        size="28px"
                      />
                    </q-avatar>
                  </div>

                  <div class="col">
                    <div
                      class="text-subtitle2 text-weight-bolder q-mb-xs"
                      :class="
                        locationData.inRange && !locationData.securityRisk
                          ? 'text-teal-7'
                          : 'text-red-6'
                      "
                    >
                      {{ locationData.statusText }}
                    </div>
                    <div
                      class="text-caption text-blue-grey-9 text-weight-medium line-height-normal q-mb-sm"
                    >
                      {{ locationData.address || 'Menyelaraskan koordinat satelit...' }}
                    </div>
                    <div
                      class="font-mono text-xs text-blue-grey-5 bg-grey-2 inline-block q-px-sm q-py-xs rounded-6"
                    >
                      {{ locationData.lat }}, {{ locationData.lng }}
                    </div>
                  </div>
                </div>

                <q-separator class="q-my-md opacity-50" />

                <div class="row items-center justify-between q-mb-sm">
                  <div
                    class="text-caption text-weight-bold text-blue-grey-6 uppercase letter-spacing-1"
                  >
                    ZONA TERDETEKSI:
                  </div>
                  <q-badge
                    :color="locationData.inRange ? 'teal-5' : 'red-5'"
                    class="text-weight-bold shadow-1"
                  >
                    {{
                      locationData.inRange
                        ? locationData.matchedLocationName
                        : 'TIDAK ADA ZONA VALID'
                    }}
                  </q-badge>
                </div>

                <div class="row items-center justify-between">
                  <div
                    class="text-caption text-weight-bold text-blue-grey-6 uppercase letter-spacing-1"
                  >
                    KEAMANAN SINYAL:
                  </div>
                  <q-badge
                    :color="locationData.securityRisk ? 'red-6' : 'green-6'"
                    class="text-weight-bold shadow-1"
                  >
                    <q-icon
                      :name="locationData.securityRisk ? 'warning' : 'shield'"
                      size="xs"
                      class="q-mr-xs"
                    />
                    {{ locationData.securityRisk ? 'FAKE GPS TERDETEKSI' : 'AMAN (ENCRYPTED)' }}
                  </q-badge>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- WIDGET 4: TOMBOL AKSI & ABSEN MANUAL -->
        <div class="col-12 col-md-6 mobile-order-1 desktop-order-2">
          <q-card flat class="bento-card bg-white full-height flex column justify-center">
            <q-card-section class="q-pa-lg">
              <div class="row items-center q-mb-lg">
                <q-icon name="touch_app" color="blue-grey-4" size="sm" class="q-mr-sm" />
                <div class="text-subtitle1 text-weight-bold text-blue-grey-9">Aksi Presensi</div>
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <button
                    v-if="locationData.inRange && !locationData.securityRisk"
                    class="btn-premium btn-clock-in full-width"
                    @click="startAbsensi"
                  >
                    <q-icon name="camera_alt" size="24px" class="q-mb-xs" />
                    <span>CLOCK IN</span>
                  </button>
                  <button v-else class="btn-premium btn-locked full-width" @click="startAbsensi">
                    <q-icon name="lock" size="24px" class="q-mb-xs text-blue-grey-4" />
                    <span class="text-blue-grey-5">TERKUNCI</span>
                  </button>
                </div>

                <div class="col-12 col-sm-6">
                  <button
                    v-if="locationData.inRange && !locationData.securityRisk"
                    class="btn-premium btn-clock-out full-width"
                    @click="absenPulang"
                  >
                    <q-icon name="logout" size="24px" class="q-mb-xs" />
                    <span>CLOCK OUT</span>
                  </button>
                  <button v-else class="btn-premium btn-locked full-width" @click="absenPulang">
                    <q-icon name="lock" size="24px" class="q-mb-xs text-blue-grey-4" />
                    <span class="text-blue-grey-5">OUT TERKUNCI</span>
                  </button>
                </div>
              </div>

              <!-- SENSOR ENGINE & AI STATUS BOARD -->
              <div
                class="row items-center q-mt-md q-pa-sm rounded-8 border-grey"
                :class="isAiReady ? 'bg-teal-50 border-teal-200' : 'bg-orange-50 border-orange-200'"
              >
                <q-icon
                  :name="isAiReady ? 'face' : 'psychology'"
                  :color="isAiReady ? 'teal-6' : 'orange-7'"
                  size="16px"
                  class="q-mr-sm"
                />
                <div
                  class="text-caption text-weight-bold"
                  :class="isAiReady ? 'text-teal-8' : 'text-orange-9'"
                  style="font-size: 11px"
                >
                  {{ aiStatusText }}
                </div>
              </div>

              <q-btn
                flat
                no-caps
                color="primary"
                icon="history_edu"
                label="Sistem Error? Ajukan Absensi Manual"
                class="full-width q-mt-sm text-weight-bold rounded-8 transition-smooth hover-bg"
                @click="manualDialog = true"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- WIDGET PEMBERITAHUAN UMUM                  -->
      <!-- ========================================== -->
      <q-slide-transition>
        <div class="row q-mb-lg" v-if="!showCamera && activeAnnouncements.length > 0">
          <div class="col-12">
            <q-card
              flat
              class="bento-card bg-gradient-indigo text-white overflow-hidden shadow-soft-primary"
            >
              <div class="row items-stretch no-wrap">
                <div
                  class="col-auto bg-black bg-opacity-20 flex flex-center q-pa-md"
                  style="width: 80px"
                >
                  <q-icon name="campaign" size="36px" color="white" class="drop-shadow-glow" />
                </div>

                <div class="col overflow-hidden relative-position">
                  <q-carousel
                    v-model="slidePengumuman"
                    transition-prev="slide-down"
                    transition-next="slide-up"
                    swipeable
                    animated
                    autoplay
                    infinite
                    :navigation="activeAnnouncements.length > 1"
                    navigation-position="right"
                    control-color="white"
                    height="auto"
                    class="bg-transparent full-height q-pa-sm"
                  >
                    <q-carousel-slide
                      v-for="(item, index) in activeAnnouncements"
                      :key="item.id"
                      :name="index"
                      class="q-pa-sm flex column justify-center"
                    >
                      <div
                        class="text-caption text-blue-2 text-weight-bold uppercase letter-spacing-1 q-mb-xs"
                      >
                        Pengumuman dari {{ item.pembuat || 'HRD' }}
                      </div>
                      <div
                        class="text-subtitle1 text-weight-bolder line-height-tight q-mb-xs text-shadow"
                        style="word-wrap: break-word; white-space: normal"
                      >
                        {{ item.judul }}
                      </div>
                      <div
                        class="text-caption text-blue-1 opacity-80 ellipsis-2-lines"
                        style="max-width: 95%"
                      >
                        {{ item.isi }}
                      </div>
                    </q-carousel-slide>
                  </q-carousel>
                </div>
              </div>
            </q-card>
          </div>
        </div>
      </q-slide-transition>

      <!-- ========================================== -->
      <!-- BAGIAN BAWAH: RIWAYAT                      -->
      <!-- ========================================== -->
      <div class="row q-col-gutter-lg" v-if="!showCamera">
        <div class="col-12">
          <q-card flat class="bento-card bg-white full-height">
            <q-card-section class="q-pa-lg border-bottom row items-center justify-between">
              <div class="text-subtitle1 text-weight-bold text-blue-grey-9">
                Aktivitas Saya Hari Ini
              </div>
              <q-badge color="indigo-1" text-color="indigo-7" class="text-weight-bold"
                >Log Pribadi</q-badge
              >
            </q-card-section>

            <q-card-section class="q-pa-none">
              <q-list>
                <div v-if="riwayatData.length === 0" class="text-center q-pa-xl">
                  <q-icon name="history_toggle_off" size="4em" color="grey-3" class="q-mb-md" />
                  <div class="text-blue-grey-5 text-weight-medium">
                    Belum ada rekam jejak absensi hari ini.
                  </div>
                </div>

                <q-item
                  v-for="item in riwayatData"
                  :key="item.id"
                  class="q-py-md q-px-lg hover-bg border-bottom-light"
                >
                  <q-item-section avatar>
                    <q-avatar
                      :color="item.status === 'Selesai' ? 'teal-1' : 'orange-1'"
                      size="42px"
                    >
                      <q-icon
                        name="fact_check"
                        :color="item.status === 'Selesai' ? 'teal-6' : 'orange-6'"
                        size="20px"
                      />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold text-blue-grey-9 text-subtitle2">{{
                      item.tanggal
                    }}</q-item-label>
                    <q-item-label caption class="text-blue-grey-5 q-mt-xs flex items-center">
                      <q-icon name="place" size="12px" class="q-mr-xs" />
                      <span class="text-weight-bold text-blue-grey-7">{{ item.nama_tempat }}</span>
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side class="text-right">
                    <div class="text-weight-bold font-mono text-body2">
                      <span :class="item.is_late ? 'text-red-6' : 'text-blue-grey-10'">{{
                        formatWaktu(item.waktu_masuk)
                      }}</span>
                      <span class="text-grey-4 q-mx-xs">━</span>
                      <span class="text-blue-grey-10">{{ formatWaktu(item.waktu_pulang) }}</span>
                    </div>

                    <div class="row q-gutter-x-xs q-mt-sm justify-end">
                      <q-badge
                        v-if="item.is_late"
                        color="red-5"
                        class="rounded-6 shadow-1 text-weight-bold"
                        >TERLAMBAT</q-badge
                      >
                      <q-badge
                        :color="item.status === 'Selesai' ? 'teal-5' : 'orange-5'"
                        class="rounded-6 shadow-1 text-weight-bold"
                        >{{ item.status.toUpperCase() }}</q-badge
                      >
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- MODAL ABSENSI MANUAL                       -->
      <!-- ========================================== -->
      <q-dialog v-model="manualDialog" persistent backdrop-filter="blur(5px)">
        <q-card
          style="width: 550px; max-width: 95vw"
          class="rounded-24 bg-white overflow-hidden shadow-soft flex column"
        >
          <q-form @submit.prevent="submitManualAbsen" class="column full-height" style="margin: 0">
            <q-card-section class="row items-center q-pb-md q-pt-lg q-px-lg">
              <div class="row items-center col">
                <div class="bg-blue-50 text-primary q-pa-sm rounded-8 q-mr-md">
                  <q-icon name="history_edu" size="24px" />
                </div>
                <div>
                  <div class="text-h6 text-weight-bolder text-blue-grey-10 line-height-tight">
                    Absensi Manual
                  </div>
                  <div class="text-caption text-blue-grey-5 font-mono text-weight-bold q-mt-xs">
                    Form pengajuan jika sistem error/lupa absen.
                  </div>
                </div>
              </div>
              <q-btn
                icon="close"
                flat
                round
                dense
                v-close-popup
                color="blue-grey-4"
                class="bg-grey-1 transition-smooth hover-scale"
              />
            </q-card-section>

            <q-card-section class="q-px-lg q-py-sm scroll" style="max-height: 60vh">
              <div class="q-gutter-y-md">
                <div>
                  <div
                    class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                  >
                    Tanggal Absen
                  </div>
                  <q-input
                    outlined
                    v-model="manualForm.tanggal"
                    type="date"
                    color="primary"
                    class="rounded-input"
                    :rules="[(val) => !!val || 'Wajib diisi']"
                  />
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <div
                      class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                    >
                      Jam Masuk
                    </div>
                    <q-input
                      outlined
                      v-model="manualForm.waktuIn"
                      type="time"
                      color="primary"
                      class="rounded-input"
                      :rules="[(val) => !!val || 'Wajib diisi']"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <div
                      class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                    >
                      Jam Pulang
                    </div>
                    <q-input
                      outlined
                      v-model="manualForm.waktuOut"
                      type="time"
                      color="primary"
                      class="rounded-input"
                    />
                  </div>
                </div>

                <div>
                  <div
                    class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                  >
                    Alasan Manual
                  </div>
                  <q-input
                    outlined
                    v-model="manualForm.alasan"
                    type="textarea"
                    rows="3"
                    placeholder="Contoh: Lupa absen pulang, HP error, jaringan hilang, dll."
                    color="primary"
                    class="rounded-input"
                    :rules="[(val) => !!val || 'Wajib diisi']"
                  />
                </div>

                <div>
                  <div
                    class="text-caption text-weight-bold text-blue-grey-8 uppercase letter-spacing-1 q-mb-sm"
                  >
                    Bukti (Opsional)
                  </div>
                  <q-file
                    outlined
                    v-model="manualForm.lampiran"
                    placeholder="Upload Foto / Screenshot"
                    color="primary"
                    class="rounded-input bg-grey-1"
                    accept="image/*, .pdf"
                    clearable
                    max-file-size="5242880"
                  >
                    <template v-slot:prepend
                      ><q-icon name="cloud_upload" color="blue-grey-4"
                    /></template>
                    <q-tooltip class="bg-blue-grey-9"
                      >Screenshot error atau foto bukti pendukung (Max 5MB)</q-tooltip
                    >
                  </q-file>
                </div>
              </div>
            </q-card-section>

            <q-card-actions align="right" class="bg-slate-50 q-px-lg q-pb-lg q-pt-md border-top">
              <q-btn
                flat
                label="BATAL"
                color="blue-grey-6"
                v-close-popup
                class="text-weight-bold rounded-8 q-px-md transition-smooth hover-scale"
              />
              <q-btn
                unelevated
                label="KIRIM PENGAJUAN"
                color="primary"
                type="submit"
                class="text-weight-bolder rounded-12 q-px-xl shadow-soft-primary transition-smooth hover-scale q-py-sm"
                :loading="submittingManual"
                icon="send"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>

      <!-- ========================================== -->
      <!-- MODAL SCREEN ABSEN DIGITAL VERIFICATION    -->
      <!-- ========================================== -->
      <q-slide-transition>
        <div v-if="showCamera" class="row justify-center">
          <div class="col-12 col-xl-10">
            <q-card flat class="bento-card bg-white overflow-hidden shadow-soft">
              <div
                class="bg-blue-grey-9 text-white row items-center q-pa-md z-top relative-position"
              >
                <q-btn
                  icon="arrow_back"
                  flat
                  round
                  dense
                  @click="stopCamera"
                  class="bg-blue-grey-8 transition-smooth hover-scale"
                />
                <div class="text-subtitle1 text-weight-bold q-ml-md letter-spacing-1">
                  VERIFIKASI BIOMETRIK WAJAH
                </div>
              </div>

              <div class="row">
                <div
                  class="col-12 col-md-7 bg-black relative-position flex flex-center"
                  style="min-height: 350px"
                >
                  <video ref="video" autoplay playsinline class="video-stream"></video>
                  <canvas ref="canvas" class="hidden"></canvas>

                  <div class="scanner-overlay" v-if="!capturedImage">
                    <div class="scanner-frame">
                      <div class="corner t-l"></div>
                      <div class="corner t-r"></div>
                      <div class="corner b-l"></div>
                      <div class="corner b-r"></div>
                      <div class="scan-laser"></div>
                    </div>
                    <div class="absolute-bottom text-center q-pb-md">
                      <q-chip
                        color="primary"
                        text-color="white"
                        class="text-weight-bold shadow-3 bg-opacity-80"
                      >
                        <q-icon name="face" size="xs" class="q-mr-xs" /> Deteksi Sensor Wajah Aktif
                      </q-chip>
                    </div>
                  </div>

                  <q-img
                    v-if="capturedImage"
                    :src="capturedImage"
                    class="captured-preview absolute-full"
                  />
                </div>

                <div class="col-12 col-md-5 q-pa-lg bg-grey-1 flex column justify-center">
                  <div class="bg-white q-pa-lg rounded-16 border-grey shadow-sm q-mb-lg">
                    <div
                      class="text-caption text-blue-grey-5 text-weight-bold uppercase letter-spacing-1 q-mb-md"
                    >
                      Informasi Log Absensi
                    </div>
                    <div class="row items-center q-mb-md">
                      <q-avatar
                        size="40px"
                        color="blue-1"
                        text-color="primary"
                        icon="person"
                        class="q-mr-md"
                      />
                      <div class="text-weight-bold text-blue-grey-10 text-subtitle1">
                        {{ userData.nama }}
                      </div>
                    </div>

                    <!-- INDIKATOR VERIFIKASI SEBELUM KIRIM (DENGAN ANIMASI LOADING UX) -->
                    <div
                      v-if="isVerifyingFace"
                      class="q-pa-sm rounded-8 text-center text-weight-bold q-mb-md bg-orange-50 text-orange-8 border-orange"
                    >
                      <q-spinner-dots size="1.5em" class="q-mr-xs" /> MEMPROSES BIOMETRIK...
                    </div>
                    <div
                      v-else
                      class="q-pa-sm rounded-8 text-center text-weight-bold q-mb-md"
                      :class="
                        isFaceMatched
                          ? 'bg-teal-50 text-teal-8 border-teal'
                          : 'bg-red-50 text-red-8 border-red'
                      "
                    >
                      <q-icon :name="isFaceMatched ? 'verified' : 'lock'" class="q-mr-xs" />
                      {{
                        isFaceMatched ? 'WAJAH COCOK DENGAN DATA HRD' : 'SILAKAN AMBIL FOTO WAJAH'
                      }}
                    </div>

                    <div class="row items-start q-mb-md">
                      <q-avatar
                        size="32px"
                        color="teal-1"
                        text-color="teal-7"
                        icon="place"
                        class="q-mr-md"
                      />
                      <div class="col">
                        <div class="text-weight-bold text-blue-grey-9 text-caption">
                          {{ locationData.matchedLocationName }}
                        </div>
                        <div class="text-blue-grey-6 line-height-tight" style="font-size: 11px">
                          {{ locationData.address }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- TOMBOL LOGIC SINKRON AI -->
                  <div v-if="!capturedImage">
                    <q-btn
                      unelevated
                      color="primary"
                      icon="photo_camera"
                      label="PINDAI WAJAH ANDA"
                      class="full-width rounded-12 q-py-md text-weight-bolder shadow-soft-primary text-subtitle1"
                      @click="takePhoto"
                      :disable="!isAiReady"
                    />
                  </div>

                  <div v-else class="column q-gutter-y-sm">
                    <!-- Tombol Loading AI (Perbaikan UX) -->
                    <q-btn
                      v-if="isVerifyingFace"
                      loading
                      color="orange-5"
                      label="MENGANALISIS..."
                      class="full-width rounded-12 q-py-md text-weight-bolder text-subtitle1"
                    />

                    <template v-else>
                      <q-btn
                        v-if="isFaceMatched"
                        unelevated
                        color="teal-6"
                        label="KONFIRMASI & KIRIM"
                        class="full-width rounded-12 q-py-md text-weight-bolder shadow-glow-positive text-subtitle1"
                        icon="send"
                        @click="saveAbsensi"
                      />
                      <q-btn
                        v-else
                        disabled
                        color="grey-5"
                        label="AKSES DIKUNCI: WAJAH SALAH"
                        class="full-width rounded-12 q-py-md text-weight-bolder text-subtitle1"
                        icon="block"
                      />
                    </template>

                    <!-- PERBAIKAN LOGIKA EVENT INLINE UNTUK MENGHINDARI ERROR COMPILER -->
                    <q-btn
                      outline
                      color="blue-grey-6"
                      label="ULANGI PINDAI"
                      class="full-width rounded-12 q-py-sm text-weight-bold bg-white"
                      @click="ulangiPindai"
                      :disable="isVerifyingFace"
                    />
                  </div>
                </div>
              </div>
            </q-card>
          </div>
        </div>
      </q-slide-transition>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { db, storage } from 'src/boot/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  Timestamp,
} from 'firebase/firestore'
import { ref as storageRef, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage'
import { useQuasar, date } from 'quasar'

const $q = useQuasar()
const LATE_LIMIT = '08:00'

// Deklarasi Listener
let timer, unsubMe, unsubAll, unsubUser, unsubLokasi, unsubPengumuman, locationTimer

// State Engine Waktu
const currentHours = ref('')
const currentMinutes = ref('')
const currentSeconds = ref('')
const currentDate = ref('')

const riwayatData = ref([])
const dataSeluruhKaryawan = ref([])

// State Pemberitahuan Umum
const activeAnnouncements = ref([])
const slidePengumuman = ref(0)

// State User & Master Data Karyawan
const userData = ref({
  nama: 'Memuat...',
  jabatan: 'Staff',
  role: 'Staff',
  email: '',
  fotoUrl: '',
  foto_profil: '',
})

// STATE AI FACE VERIFICATION
const isAiReady = ref(false)
const isFaceMatched = ref(false)
const isVerifyingFace = ref(false) // UX Loading State Tambahan
const aiStatusText = ref('Menginisialisasi modul kecerdasan buatan...')

const manualDialog = ref(false)
const submittingManual = ref(false)
const manualForm = ref({
  tanggal: date.formatDate(Date.now(), 'YYYY-MM-DD'),
  waktuIn: '',
  waktuOut: '',
  alasan: '',
  lampiran: null,
})

const documentId = ref(null)
const showCamera = ref(false)
const capturedImage = ref(null)
const video = ref(null)
const canvas = ref(null)
const daftarLokasiKantor = ref([])

const locationData = ref({
  lat: '0.0000',
  lng: '0.0000',
  address: '',
  statusText: 'Menghubungkan ke satelit...',
  inRange: false,
  matchedLocationName: 'MENCARI LOKASI',
  securityRisk: false,
})

// FUNGSI MENGHAPUS FOTO DAN MENGULANG SCAN (MENCEGAH ERROR VITE COMPILER)
const ulangiPindai = () => {
  capturedImage.value = null
  isFaceMatched.value = false
}

// FUNGSI INJEKSI SCRIPT CDN SECARA DINAMIS (ANTI-RIBET EDIT HTML)
const loadFaceApiScript = () => {
  return new Promise((resolve, reject) => {
    if (window.faceapi) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js'
    script.async = true
    script.onload = () => {
      resolve()
    }
    script.onerror = () => {
      reject(new Error('Gagal memuat library AI Face-API dari CDN.'))
    }
    document.head.appendChild(script)
  })
}

// FUNGSI LOAD CORE MODEL AI LANGSUNG DARI CLOUD CDN (MENGHINDARI ERROR LOKAL TENSOR)
const initFaceEngine = async () => {
  try {
    aiStatusText.value = 'Menghubungkan ke server satelit AI...'
    await loadFaceApiScript()

    aiStatusText.value = 'AI sedang mengunduh bobot jaringan dari Cloud...'

    // GANTI KE URL CLOUD RESMI (ANTI-CORRUPT & TIDAK PERLU COPY FOLDER PUBLIC/MODELS)
    const modelUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'

    await window.faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl)
    await window.faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl)
    await window.faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl)

    isAiReady.value = true
    aiStatusText.value = 'Double-Guard GPS & Pemindai Wajah Biometrik Aktif (Aman)'
  } catch (e) {
    console.error('Gagal memuat AI Engine:', e)
    aiStatusText.value = 'Gagal memuat model AI: ' + e.message
  }
}

// LOGIKA MATEMATIKA: PEMBANDING VECTOR DESCRIPTOR WAJAH (E-KYC SINKRON)
const lakukanFaceMatch = async () => {
  const masterFotoUrl = userData.value.foto_profil || userData.value.fotoUrl
  if (!masterFotoUrl) {
    $q.notify({
      color: 'negative',
      icon: 'error',
      message: 'FOTO MASTER IDENTITAS BELUM DI-UPLOAD HRD PADA MODUL KARYAWAN!',
      position: 'top',
      timeout: 5000,
    })
    isFaceMatched.value = false
    return
  }

  try {
    // 1. Ambil Data Wajah Kamera (Live)
    const liveImg = new Image()
    liveImg.src = capturedImage.value
    await new Promise((r) => (liveImg.onload = r))
    const liveDesc = await window.faceapi
      .detectSingleFace(liveImg)
      .withFaceLandmarks()
      .withFaceDescriptor()

    // 2. Ambil Data Foto Identitas Resmi Karyawan (Master Data)
    const refImg = new Image()
    refImg.crossOrigin = 'anonymous'
    refImg.src = masterFotoUrl
    await new Promise((res, rej) => {
      refImg.onload = res
      refImg.onerror = () => rej(new Error('Gagal mengunduh foto master HRD.'))
    })
    const refDesc = await window.faceapi
      .detectSingleFace(refImg)
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (!liveDesc) {
      $q.notify({
        color: 'negative',
        message: 'Wajah gagal terdeteksi kamera! Dekatkan wajah Anda ke kamera.',
      })
      capturedImage.value = null
      isFaceMatched.value = false
      return
    }

    if (!refDesc) {
      $q.notify({
        color: 'negative',
        message: 'Foto master di database HRD buram/tidak valid! Hubungi Admin.',
      })
      isFaceMatched.value = false
      return
    }

    // 3. Hitung Jarak Euclidean (Ambang batas keamanan standard: 0.55)
    const distance = window.faceapi.euclideanDistance(liveDesc.descriptor, refDesc.descriptor)

    if (distance < 0.55) {
      isFaceMatched.value = true
      $q.notify({
        color: 'positive',
        icon: 'verified',
        message: 'Verifikasi Wajah Sukses! Identitas Valid.',
      })
    } else {
      isFaceMatched.value = false
      $q.notify({
        color: 'negative',
        icon: 'block',
        message: 'Verifikasi Gagal: Wajah Anda tidak cocok dengan database!',
      })
    }
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: 'Koneksi AI Terganggu: ' + err.message })
    isFaceMatched.value = false
  }
}

const takePhoto = async () => {
  const ctx = canvas.value.getContext('2d')
  canvas.value.width = video.value.videoWidth
  canvas.value.height = video.value.videoHeight
  ctx.drawImage(video.value, 0, 0)
  capturedImage.value = canvas.value.toDataURL('image/jpeg')

  // Langsung picu komparasi AI wajah setelah jepret foto
  isVerifyingFace.value = true // Nyalakan indikator loading UI
  await lakukanFaceMatch()
  isVerifyingFace.value = false // Matikan indikator loading UI
}

// UI Helpers
const getInitial = (n) => (n ? n.charAt(0).toUpperCase() : 'U')
const getRandomColor = (n) => {
  if (!n) return 'primary'
  const colors = ['blue-6', 'teal-5', 'indigo-5', 'deep-purple-5', 'cyan-7']
  return colors[n.length % colors.length]
}

const updateTime = () => {
  const now = new Date()
  currentHours.value = date.formatDate(now, 'HH')
  currentMinutes.value = date.formatDate(now, 'mm')
  currentSeconds.value = date.formatDate(now, 'ss')
  currentDate.value = date.formatDate(now, 'dddd, DD MMMM YYYY', {
    days: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
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

const getAddressName = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
    )
    const d = await res.json()
    locationData.value.address = d.display_name.split(',').slice(0, 4).join(', ')
  } catch {
    locationData.value.address = 'Gagal memuat koordinat jalan'
  }
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

const detectLocation = () => {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(
    (p) => {
      const lat = p.coords.latitude
      const lng = p.coords.longitude
      const acc = p.coords.accuracy

      const isSuspicious =
        p.coords.mocked === true || acc === 10 || acc === 5 || acc === 1 || acc === 100

      if (isSuspicious) {
        locationData.value.securityRisk = true
        locationData.value.inRange = false
        locationData.value.lat = lat.toFixed(5)
        locationData.value.lng = lng.toFixed(5)
        locationData.value.statusText = 'TERDETEKSI FAKE GPS / LOKASI PALSU'
        locationData.value.matchedLocationName = 'AKSES DITOLAK'
        return
      }

      locationData.value.securityRisk = false
      locationData.value.lat = lat.toFixed(5)
      locationData.value.lng = lng.toFixed(5)

      let foundMatch = false
      let matchedName = 'TIDAK TERDETEKSI'

      for (const loc of daftarLokasiKantor.value) {
        const distance = calculateDistance(lat, lng, loc.latitude, loc.longitude)
        if (distance <= loc.radius) {
          foundMatch = true
          matchedName = loc.nama_lokasi
          break
        }
      }

      locationData.value.inRange = foundMatch
      locationData.value.matchedLocationName = matchedName
      locationData.value.statusText = foundMatch ? 'LOKASI VALID & COCOK' : 'DI LUAR AREA KANTOR'
      getAddressName(lat, lng)
    },
    () => {
      locationData.value.statusText = 'IZINKAN GPS BROWSER!'
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
  )
}

const startAbsensi = () => {
  if (locationData.value.securityRisk || !locationData.value.inRange) return

  const timeStr = `${currentHours.value}:${currentMinutes.value}`
  if (timeStr > LATE_LIMIT) {
    $q.notify({
      color: 'red-6',
      icon: 'warning',
      message: 'Waktu presensi sudah melebihi 08:00. Log tersimpan sebagai Terlambat.',
      position: 'top',
    })
  }

  showCamera.value = true
  setTimeout(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
      if (video.value) video.value.srcObject = s
    })
  }, 100)
}

const stopCamera = () => {
  if (video.value?.srcObject) video.value.srcObject.getTracks().forEach((t) => t.stop())
  showCamera.value = false
  capturedImage.value = null
  isFaceMatched.value = false
  isVerifyingFace.value = false
}

const saveAbsensi = async () => {
  if (!locationData.value.inRange || locationData.value.securityRisk || !isFaceMatched.value) return

  $q.loading.show({ message: 'Menyimpan log presensi digital...' })
  try {
    const formattedName = (userData.value.nama || 'USER').toUpperCase()
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const isLate = timeStr > LATE_LIMIT

    let fotoUrl = null
    if (capturedImage.value) {
      const fRef = storageRef(storage, `absensi/${formattedName}_IN_${Date.now()}.jpg`)
      await uploadString(fRef, capturedImage.value, 'data_url')
      fotoUrl = await getDownloadURL(fRef)
    }

    await addDoc(collection(db, 'absensi'), {
      nama_karyawan: formattedName,
      waktu_masuk: serverTimestamp(),
      waktu_pulang: null,
      tanggal: currentDate.value,
      status: 'Hadir',
      nama_tempat: locationData.value.matchedLocationName,
      alamat_lengkap: locationData.value.address,
      koordinat: `${locationData.value.lat}, ${locationData.value.lng}`,
      foto_masuk: fotoUrl,
      is_late: isLate,
    })

    $q.notify({
      color: 'positive',
      message: 'Clock-In Sukses! Selamat bekerja.',
      icon: 'check_circle',
    })
    stopCamera()
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    $q.notify({ color: 'negative', message: 'Koneksi gagal, coba lagi.' })
  } finally {
    $q.loading.hide()
  }
}

const absenPulang = async () => {
  if (!documentId.value || locationData.value.securityRisk || !locationData.value.inRange) return
  $q.loading.show()
  try {
    await updateDoc(doc(db, 'absensi', documentId.value), {
      waktu_pulang: serverTimestamp(),
      status: 'Selesai',
      koordinat_pulang: `${locationData.value.lat}, ${locationData.value.lng}`,
      nama_tempat_pulang: locationData.value.matchedLocationName,
    })
    $q.notify({
      color: 'primary',
      message: 'Clock-Out Sukses! Selamat beristirahat.',
      icon: 'logout',
    })
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    $q.notify({ color: 'negative', message: 'Gagal memproses pengakhiran shift.' })
  } finally {
    $q.loading.hide()
  }
}

const submitManualAbsen = async () => {
  submittingManual.value = true
  try {
    const namaKaryawan = (userData.value.nama || 'USER').toUpperCase()
    let finalDocUrl = ''
    if (manualForm.value.lampiran) {
      const file = manualForm.value.lampiran
      const extension = file.name.split('.').pop()
      const fileName = `MANUAL_ABSEN_${namaKaryawan}_${Date.now()}.${extension}`
      const sRef = storageRef(storage, `lampiran_pengajuan/${fileName}`)

      await uploadBytes(sRef, file)
      finalDocUrl = await getDownloadURL(sRef)
    }

    const outTime = manualForm.value.waktuOut ? manualForm.value.waktuOut : 'Belum Pulang'
    await addDoc(collection(db, 'pengajuan'), {
      nama_karyawan: namaKaryawan,
      jenis_pengajuan: 'Absensi Manual',
      tanggal_mulai: manualForm.value.tanggal,
      tanggal_selesai: manualForm.value.tanggal,
      alasan: `[Jam Masuk: ${manualForm.value.waktuIn} | Jam Pulang: ${outTime}] - Alasan: ${manualForm.value.alasan}`,
      dokumen_url: finalDocUrl,
      status_approval: 'Pending',
      created_at: serverTimestamp(),
    })

    $q.notify({
      color: 'positive',
      message: 'Pengajuan Absensi Manual Terkirim!',
      icon: 'check_circle',
    })
    manualDialog.value = false
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    $q.notify({ color: 'negative', message: 'Gagal memproses data manual.' })
  } finally {
    submittingManual.value = false
  }
}

const formatWaktu = (ts) => (ts ? date.formatDate(ts.toDate(), 'HH:mm') : '--:--')

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  initFaceEngine()

  unsubLokasi = onSnapshot(collection(db, 'lokasi_kantor'), (snap) => {
    daftarLokasiKantor.value = snap.docs.map((doc) => doc.data())
    detectLocation()
  })
  locationTimer = setInterval(detectLocation, 30000)

  // SINKRONISASI PENGUMUMAN (Bug Fixed)
  const qPengumuman = query(collection(db, 'pemberitahuan'), orderBy('tgl_publikasi', 'desc'))
  unsubPengumuman = onSnapshot(qPengumuman, (snap) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const semuaPengumuman = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

    activeAnnouncements.value = semuaPengumuman.filter((p) => {
      if (!p.tgl_kadaluarsa) return true
      const expDate = new Date(p.tgl_kadaluarsa)
      return expDate >= today
    })
  })

  const saved = localStorage.getItem('user_data')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      userData.value = { ...userData.value, email: parsed.email || '', nama: parsed.nama || 'User' }

      if (userData.value.email) {
        const qUser = query(collection(db, 'karyawan'), where('email', '==', userData.value.email))
        unsubUser = onSnapshot(qUser, (snap) => {
          if (!snap.empty) {
            const data = snap.docs[0].data()
            userData.value = {
              ...userData.value,
              nama: data.nama || userData.value.nama,
              jabatan: data.jabatan || data.role,
              foto_profil: data.foto_profil || data.fotoUrl || '',
            }
          }
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  const searchName = (userData.value.nama || 'USER').toUpperCase()
  unsubMe = onSnapshot(
    query(
      collection(db, 'absensi'),
      where('nama_karyawan', '==', searchName),
      orderBy('waktu_masuk', 'desc'),
      limit(5),
    ),
    (snap) => {
      riwayatData.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      const active = riwayatData.value.find(
        (a) => a.tanggal === currentDate.value && a.status === 'Hadir',
      )
      documentId.value = active ? active.id : null
    },
  )

  unsubAll = onSnapshot(
    query(
      collection(db, 'absensi'),
      where('waktu_masuk', '>=', Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)))),
      orderBy('waktu_masuk', 'desc'),
    ),
    (snap) => {
      dataSeluruhKaryawan.value = snap.docs.map((d, i) => ({
        no: i + 1,
        nama_karyawan: d.data().nama_karyawan,
        checkin: formatWaktu(d.data().waktu_masuk),
      }))
    },
  )
})

onUnmounted(() => {
  clearInterval(timer)
  clearInterval(locationTimer)
  if (unsubMe) unsubMe()
  if (unsubAll) unsubAll()
  if (unsubUser) unsubUser()
  if (unsubLokasi) unsubLokasi()
  if (unsubPengumuman) unsubPengumuman() // Hapus Listener Memori Pengumuman
})
</script>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
.font-mono {
  font-family: monospace;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.letter-spacing-2 {
  letter-spacing: 2px;
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
.bento-container {
  max-width: 1400px;
}
.bento-card {
  border-radius: 24px;
  border: 1px solid #f1f5f9;
}
.bg-slate-50 {
  background-color: #f8fafc;
}
.border-bottom {
  border-bottom: 1px solid #f1f5f9;
}
.border-bottom-light {
  border-bottom: 1px solid #f8fafc;
}
.border-top {
  border-top: 1px solid #f1f5f9;
}
.border-grey {
  border: 1px solid #e2e8f0;
}
.border-teal {
  border: 1px solid #14b8a6;
}
.border-red {
  border: 1px solid #ef4444;
}
.border-orange {
  border: 1px solid #f97316;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.text-xs {
  font-size: 11px;
}
.shadow-soft {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05) !important;
}
.shadow-soft-primary {
  box-shadow: 0 8px 24px -8px rgba(25, 118, 210, 0.5) !important;
}
.shadow-glow-positive {
  box-shadow: 0 8px 24px -8px rgba(0, 150, 136, 0.6) !important;
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

.decor-circle-1 {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
  top: -150px;
  right: -50px;
  border-radius: 50%;
  z-index: 0;
}
.status-badge {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 18px;
  height: 18px;
  border: 3px solid white;
}
.aurora-card {
  background: #0f172a;
}
.aurora-bg {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(56, 189, 248, 0.35),
    rgba(99, 102, 241, 0.15),
    transparent 60%
  );
  animation: rotateAurora 15s linear infinite;
}
@keyframes rotateAurora {
  100% {
    transform: rotate(360deg);
  }
}
.glass-layer {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
}
.drop-shadow-glow {
  text-shadow: 0 4px 30px rgba(56, 189, 248, 0.4);
}
.time-wrapper {
  display: flex;
  align-items: baseline;
  justify-content: center;
  line-height: 1;
}
.time-hhmm {
  font-size: 5rem;
  font-weight: 900;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: -3px;
}
.time-ss {
  font-size: 2.2rem;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  margin-left: 8px;
}
.blink {
  animation: blinker 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes blinker {
  50% {
    opacity: 0;
  }
}
.date-chip {
  display: inline-block;
  padding: 8px 20px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.radar-box {
  border: 1px solid #f1f5f9;
  background: #fafafa;
}
.radar-valid {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.radar-invalid {
  background: #fef2f2;
  border-color: #fecaca;
}
.radar-icon-container {
  position: relative;
}
.icon-pulse-ring {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  z-index: 0;
}
.pulse-green {
  animation: pulseGreen 2s infinite;
}
.pulse-red {
  animation: pulseRed 2s infinite;
}
@keyframes pulseGreen {
  0% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.6);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 15px rgba(20, 184, 166, 0);
  }
  100% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(20, 184, 166, 0);
  }
}
@keyframes pulseRed {
  0% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 15px rgba(239, 68, 68, 0);
  }
  100% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.btn-premium {
  border: none;
  border-radius: 16px;
  padding: 16px 20px;
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-clock-in {
  background: #0d9488;
  color: white;
  box-shadow: 0 8px 25px -8px rgba(13, 148, 136, 0.6);
}
.btn-clock-in:hover {
  background: #0f766e;
  transform: translateY(-3px);
  box-shadow: 0 12px 30px -8px rgba(13, 148, 136, 0.8);
}
.btn-clock-out {
  background: #ef4444;
  color: white;
  box-shadow: 0 8px 25px -8px rgba(239, 68, 68, 0.6);
}
.btn-clock-out:hover {
  background: #dc2626;
  transform: translateY(-3px);
  box-shadow: 0 12px 30px -8px rgba(239, 68, 68, 0.8);
}
.btn-locked {
  background: #f8fafc;
  color: #94a3b8;
  border: 2px dashed #cbd5e1;
  box-shadow: none;
  cursor: not-allowed;
}
.btn-locked:hover {
  background: #f1f5f9;
}

.hover-bg {
  transition: background 0.3s;
}
.hover-bg:hover {
  background: #f8fafc;
}
.z-content {
  position: relative;
  z-index: 1;
}
.video-stream {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}
.scanner-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;
}
.scanner-frame .corner {
  position: absolute;
  width: 40px;
  height: 40px;
  border-color: #00e676;
  border-style: solid;
}
.corner.t-l {
  top: 0;
  left: 0;
  border-width: 4px 0 0 4px;
}
.corner.t-r {
  top: 0;
  right: 0;
  border-width: 4px 4px 0 0;
}
.corner.b-l {
  bottom: 0;
  left: 0;
  border-width: 0 0 4px 4px;
}
.corner.b-r {
  bottom: 0;
  right: 0;
  border-width: 0 4px 4px 0;
}
@keyframes scan-laser {
  0% {
    top: 5%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 95%;
    opacity: 0;
  }
}
.scan-laser {
  position: absolute;
  left: 5%;
  width: 90%;
  height: 2px;
  background: #00e676;
  box-shadow: 0 0 15px 2px #00e676;
  animation: scan-laser 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.captured-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.bg-opacity-80 {
  background: rgba(0, 77, 64, 0.8) !important;
}

@media (max-width: 1023px) {
  .hide-on-mobile {
    display: none !important;
  }
}
@media (max-width: 1023px) {
  .mobile-order-1 {
    order: 1 !important;
  }
  .mobile-order-2 {
    order: 2 !important;
  }
}
@media (min-width: 1024px) {
  .desktop-order-1 {
    order: 1 !important;
  }
  .desktop-order-2 {
    order: 2 !important;
  }
}
</style>
