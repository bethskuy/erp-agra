<template>
  <q-page class="bg-page q-pa-md q-pa-lg-lg font-pro relative-position" @click="spawnIcon($event)">
    <!-- EFEK ANIMASI KLIK (SPAWN ICONS) -->
    <div class="click-spawn-container">
      <transition-group name="spawn">
        <div
          v-for="icon in spawnedIcons"
          :key="icon.id"
          class="spawned-icon"
          :style="{
            left: icon.x + 'px',
            top: icon.y + 'px',
            '--rand-rotate': icon.rotate + 'deg',
            '--rand-color': icon.color,
            fontSize: icon.size + 'px',
          }"
        >
          <q-icon :name="icon.name" />
        </div>
      </transition-group>
    </div>

    <!-- EFEK LATAR BELAKANG ANIMASI MENGAMBANG (Warna-Warni Tosca, Kebureman Tipis & Elegan) -->
    <div class="bg-animation-container">
      <q-icon name="engineering" class="floating-icon i-1" />
      <q-icon name="construction" class="floating-icon i-2" />
      <q-icon name="architecture" class="floating-icon i-3" />
      <q-icon name="location_city" class="floating-icon i-4" />
      <q-icon name="handyman" class="floating-icon i-5" />
      <q-icon name="apartment" class="floating-icon i-6" />
      <q-icon name="engineering" class="floating-icon i-7" />
      <q-icon name="hardware" class="floating-icon i-8" />
    </div>

    <!-- =====================================================================================
         SCREEN 1: LOCK SCREEN JIKA TIDAK MEMILIKI AKSES LIHAT
         ===================================================================================== -->
    <template v-if="!canAction('lihat')">
      <div
        class="row flex-center q-pa-xl text-center font-pro animate-fade content-relative"
        style="min-height: 70vh"
      >
        <div
          class="col-12 col-sm-8 col-md-6 bg-white q-pa-xl rounded-20 shadow-premium border-subtle"
        >
          <q-avatar size="100px" color="red-1" text-color="red-10" icon="lock" class="q-mb-md" />
          <div class="text-h5 text-weight-bold text-blue-grey-10 q-mb-xs">Akses Terbatas</div>
          <div class="text-body2 text-grey-7 q-mb-lg leading-relaxed">
            Maaf, Anda tidak memiliki izin untuk melihat modul Monitoring Proyek. Silakan hubungi
            Administrator atau Super Admin untuk konfigurasi hak akses Anda.
          </div>
          <q-btn
            label="Kembali ke Beranda"
            color="brand-primary"
            icon="arrow_back"
            rounded
            unelevated
            no-caps
            class="text-white text-weight-bold"
            @click="$router.push('/')"
          />
        </div>
      </div>
    </template>

    <!-- =====================================================================================
         SCREEN 2: MONITORING VIEW JIKA AKSES LIHAT OK
         ===================================================================================== -->
    <template v-else>
      <!-- HEADER SECTION (TOMBOL KEMBALI DIHAPUS AGAR PROPORSIAL & LAPANG) -->
      <div class="row items-center justify-between q-mb-xl animate-fade no-print content-relative">
        <div class="col-12">
          <div>
            <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
              Monitoring Proyek
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Executive Dashboard & Tracking Pekerjaan</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Pantau realisasi pekerjaan, timeline, dan status penyelesaian proyek secara real-time.
            </div>
          </div>
        </div>
      </div>

      <!-- SUMMARY CARDS / KPI (RESPONSIVE KE TENGAH DI HP, KIRI DI LAPTOP) -->
      <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print content-relative">
        <!-- Total Proyek -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
            <q-card-section
              class="row items-center no-wrap q-pa-md flex-column flex-sm-row text-center text-sm-left q-gutter-y-md q-gutter-sm-none"
            >
              <div class="col">
                <div
                  class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest"
                >
                  TOTAL PROYEK
                </div>
                <div class="text-h4 text-weight-bolder q-mt-xs text-brand-primary">
                  {{ combinedProjects.length }}
                </div>
              </div>
              <div
                class="bg-brand-light q-pa-md rounded-borders col-sm-auto"
                style="min-width: 56px; text-align: center"
              >
                <q-icon name="domain" color="brand-primary" size="28px" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Proyek Berjalan -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
            <q-card-section
              class="row items-center no-wrap q-pa-md flex-column flex-sm-row text-center text-sm-left q-gutter-y-md q-gutter-sm-none"
            >
              <div class="col">
                <div
                  class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest"
                >
                  SEDANG BERJALAN
                </div>
                <div class="text-h4 text-weight-bolder q-mt-xs text-blue-8">
                  {{ countByStatus('On Progress') }}
                </div>
              </div>
              <div
                class="bg-blue-1 q-pa-md rounded-borders col-sm-auto"
                style="min-width: 56px; text-align: center"
              >
                <q-icon name="trending_up" color="blue-8" size="28px" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Proyek Selesai -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
            <q-card-section
              class="row items-center no-wrap q-pa-md flex-column flex-sm-row text-center text-sm-left q-gutter-y-md q-gutter-sm-none"
            >
              <div class="col">
                <div
                  class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest"
                >
                  PROYEK SELESAI
                </div>
                <div class="text-h4 text-weight-bolder q-mt-xs text-positive">
                  {{ countByStatus('Selesai') }}
                </div>
              </div>
              <div
                class="bg-green-1 q-pa-md rounded-borders col-sm-auto"
                style="min-width: 56px; text-align: center"
              >
                <q-icon name="task_alt" color="positive" size="28px" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Total Valuasi -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card
            flat
            class="rounded-20 border-subtle bg-brand-primary text-white transition-all hover-shadow"
          >
            <q-card-section
              class="row items-center no-wrap q-pa-md flex-column flex-sm-row text-center text-sm-left q-gutter-y-md q-gutter-sm-none"
            >
              <div class="col">
                <div
                  class="text-overline text-brand-light leading-none text-weight-bold tracking-widest"
                >
                  TOTAL VALUASI
                </div>
                <div class="text-h5 text-weight-bolder q-mt-xs text-white">
                  Rp {{ formatCompact(totalValuation) }}
                </div>
              </div>
              <div
                class="bg-white q-pa-md rounded-borders shadow-2 col-sm-auto"
                style="min-width: 56px; text-align: center"
              >
                <q-icon name="account_balance_wallet" color="brand-primary" size="28px" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- SEARCH & FILTER AREA -->
      <q-card
        flat
        bordered
        class="q-mb-lg shadow-1 rounded-20 bg-white no-print content-relative border-subtle"
      >
        <q-card-section class="q-py-md">
          <div class="row items-center q-col-gutter-md">
            <div class="col-12 col-md-5">
              <q-input
                v-model="searchQuery"
                outlined
                dense
                rounded
                placeholder="Cari Proyek atau Klien..."
                bg-color="white"
                class="search-input"
              >
                <template v-slot:prepend><q-icon name="search" color="brand-primary" /></template>
                <template v-slot:append v-if="searchQuery">
                  <q-icon name="close" @click="searchQuery = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </div>
            <q-space />
            <q-btn flat round icon="refresh" color="brand-primary" @click="fetchData" />
          </div>
        </q-card-section>
      </q-card>

      <!-- MAIN TABLE DATA -->
      <q-card
        flat
        bordered
        class="rounded-20 shadow-sm overflow-hidden bg-white no-print border-brand-thin content-relative"
      >
        <q-table
          :rows="combinedProjects"
          :columns="columns"
          row-key="id"
          flat
          :loading="loading"
          :filter="searchQuery"
          binary-state-sort
          class="monitoring-table"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-brand-primary text-white">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bold uppercase font-11 tracking-widest"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr
              :props="props"
              class="hover-bg transition-all cursor-pointer"
              @click="openDetailDialog(props.row)"
            >
              <q-td key="proyek">
                <div class="row items-center no-wrap">
                  <q-avatar
                    size="36px"
                    color="brand-light"
                    text-color="brand-primary"
                    icon="foundation"
                    class="q-mr-md shadow-sm"
                  />
                  <div>
                    <div
                      class="text-weight-bold text-blue-grey-10 text-subtitle2 leading-none q-mb-xs"
                    >
                      {{ props.row.nama }}
                    </div>
                    <div
                      class="text-caption text-grey-6 uppercase text-weight-medium row items-center q-gutter-x-xs"
                    >
                      <span>Klien: {{ props.row.konsumen || 'Internal' }}</span>
                      <q-badge
                        v-if="props.row.progress_status === 'Approved'"
                        color="positive"
                        dense
                        class="text-weight-bold font-9 text-white"
                      >
                        VERIFIED
                      </q-badge>
                    </div>
                  </div>
                </div>
              </q-td>

              <q-td key="timeline">
                <div class="text-weight-medium text-blue-grey-9">
                  {{ formatTimeline(props.row) }}
                </div>
              </q-td>

              <q-td key="progress">
                <div class="full-width">
                  <div class="row items-center justify-between q-mb-xs">
                    <q-chip
                      dense
                      :color="getStatusColor(props.row.status).bg"
                      :text-color="getStatusColor(props.row.status).text"
                      class="text-weight-bold font-10 uppercase q-ma-none shadow-sm"
                    >
                      {{ props.row.status || 'Perencanaan' }}
                    </q-chip>
                    <span class="text-caption text-brand-primary text-weight-bolder"
                      >{{ props.row.progress || 0 }}%</span
                    >
                  </div>
                  <q-linear-progress
                    :value="(props.row.progress || 0) / 100"
                    size="8px"
                    rounded
                    color="brand-primary"
                    track-color="blue-1"
                  />
                </div>
              </q-td>

              <q-td key="valuasi" class="text-right">
                <div class="text-weight-bolder text-brand-primary text-subtitle2">
                  Rp {{ (props.row.total_omzet || 0).toLocaleString('id-ID') }}
                </div>
              </q-td>

              <q-td key="aksi" class="text-center" @click.stop>
                <!-- Tombol Update Progress Fisik Terkunci jika status approved -->
                <q-btn
                  v-if="canAction('ubah')"
                  unelevated
                  rounded
                  :color="props.row.progress_status === 'Approved' ? 'grey-5' : 'brand-primary'"
                  :icon="props.row.progress_status === 'Approved' ? 'lock' : 'update'"
                  label="Update"
                  size="sm"
                  class="q-px-md text-weight-bold shadow-2 btn-hover text-white"
                  @click="openUpdateDialog(props.row)"
                />
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-xl text-grey-5">
              <q-icon name="find_in_page" size="64px" class="q-mb-md" />
              <div class="text-h6 full-width text-center">Data proyek tidak ditemukan.</div>
            </div>
          </template>
        </q-table>
      </q-card>

      <!-- =====================================================================================
           MODAL 1: DETAIL RINGKASAN EXECUTIVE INFORMATIF (PROYEK PROFILE)
           ===================================================================================== -->
      <q-dialog v-model="showDetailDialog" backdrop-filter="blur(6px)">
        <q-card
          style="width: 750px; max-width: 95vw"
          class="rounded-20 shadow-24 bg-grey-1 text-blue-grey-10"
        >
          <q-toolbar class="bg-brand-primary text-white q-py-md">
            <q-avatar icon="assignment" color="white" text-color="brand-primary" size="md" />
            <q-toolbar-title
              class="text-weight-bold text-subtitle1 uppercase tracking-widest q-ml-sm animate-fade"
            >
              Profil Resmi & Kinerja Proyek
            </q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup color="white" />
          </q-toolbar>

          <q-card-section
            class="q-pa-lg scroll"
            style="max-height: 75vh"
            v-if="selectedProjectDetail"
          >
            <!-- SECTION 1: HEADER SUMMARY -->
            <div
              class="row q-col-gutter-md items-center justify-between bg-white q-pa-md rounded-12 shadow-sm q-mb-lg border-subtle"
            >
              <div class="col-12 col-sm-8 text-left">
                <div
                  class="text-h5 text-weight-black text-brand-primary uppercase leading-none q-mb-sm"
                >
                  {{ selectedProjectDetail.nama }}
                </div>
                <div class="text-subtitle2 text-grey-6 uppercase font-bold">
                  KONSUMEN / KLIEN:
                  <span class="text-blue-grey-10">{{
                    selectedProjectDetail.konsumen || 'INTERNAL'
                  }}</span>
                </div>
              </div>
              <div
                class="col-12 col-sm-4 text-center text-sm-right row items-center justify-end q-gutter-x-sm"
              >
                <q-badge
                  v-if="selectedProjectDetail.progress_status === 'Approved'"
                  color="positive"
                  class="text-weight-bold q-px-sm q-py-xs text-white"
                >
                  VERIFIED
                </q-badge>
                <q-chip
                  dense
                  :color="getStatusColor(selectedProjectDetail.status).bg"
                  :text-color="getStatusColor(selectedProjectDetail.status).text"
                  class="text-weight-bold q-px-md q-py-md text-subtitle2 uppercase shadow-sm"
                >
                  {{ selectedProjectDetail.status }}
                </q-chip>
              </div>
            </div>

            <!-- SECTION 2: GAUGE PROGRESS DAN TIMELINE -->
            <div class="row q-col-gutter-lg q-mb-lg">
              <div class="col-12 col-sm-5 flex flex-center">
                <q-card
                  flat
                  class="full-width rounded-12 bg-white q-pa-lg text-center shadow-sm border-subtle"
                >
                  <div class="text-overline text-grey-6 text-weight-bold q-mb-md">
                    PROGRES PEKERJAAN FISIK
                  </div>
                  <q-circular-progress
                    show-value
                    class="text-brand-primary text-weight-black text-h4"
                    :value="selectedProjectDetail.progress"
                    size="140px"
                    :thickness="0.18"
                    color="brand-primary"
                    track-color="blue-1"
                    animation-speed="600"
                  >
                    {{ selectedProjectDetail.progress }}%
                  </q-circular-progress>
                  <div class="text-caption text-grey-6 q-mt-md">
                    Kemajuan aktual fisik di lapangan.
                  </div>
                </q-card>
              </div>

              <div class="col-12 col-sm-7">
                <q-card
                  flat
                  class="full-width rounded-12 bg-white q-pa-lg shadow-sm border-subtle h-full column justify-between"
                >
                  <div class="text-overline text-grey-6 text-weight-bold">
                    TIMELINE & WAKTU PELAKSANAAN
                  </div>

                  <div class="q-my-md text-left">
                    <div class="row items-center q-mb-sm">
                      <q-icon name="event_available" color="green-8" size="sm" class="q-mr-sm" />
                      <div>
                        <div class="text-caption text-grey-6">Tanggal Mulai Pekerjaan</div>
                        <div class="text-weight-bold text-subtitle2">
                          {{
                            selectedProjectDetail.start_date
                              ? selectedProjectDetail.start_date.toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })
                              : '-'
                          }}
                        </div>
                      </div>
                    </div>

                    <div class="row items-center">
                      <q-icon name="event_busy" color="red-8" size="sm" class="q-mr-sm" />
                      <div>
                        <div class="text-caption text-grey-6">Tanggal Estimasi Selesai</div>
                        <div class="text-weight-bold text-subtitle2">
                          {{
                            selectedProjectDetail.end_date
                              ? selectedProjectDetail.end_date.toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })
                              : '-'
                          }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <q-separator />

                  <div class="row items-center justify-between q-pt-md">
                    <div class="text-caption text-grey-6 text-weight-bold">
                      SISA HARI PEKERJAAN :
                    </div>
                    <q-badge
                      color="brand-primary"
                      class="q-px-md q-py-xs text-weight-bold text-subtitle2 text-white"
                    >
                      {{ getDaysRemaining(selectedProjectDetail.end_date) }}
                    </q-badge>
                  </div>
                </q-card>
              </div>
            </div>

            <!-- SECTION 3: FINANSIAL breakdown -->
            <div class="row q-col-gutter-md q-mb-lg">
              <div class="col-12">
                <q-card flat class="rounded-12 bg-white q-pa-lg shadow-sm border-subtle text-left">
                  <div class="text-overline text-grey-6 text-weight-bold q-mb-md flex items-center">
                    <q-icon
                      name="monetization_on"
                      color="brand-primary"
                      size="sm"
                      class="q-mr-xs"
                    />
                    RINCIAN VALUASI REALISASI PROYEK
                  </div>

                  <div class="row q-col-gutter-lg">
                    <!-- Nilai Kontrak / Omzet -->
                    <div class="col-12 col-sm-4">
                      <div class="text-caption text-grey-6 font-bold">TOTAL NILAI KONTRAK</div>
                      <div class="text-h6 text-weight-black text-brand-primary q-mt-xs">
                        Rp {{ (selectedProjectDetail.total_omzet || 0).toLocaleString('id-ID') }}
                      </div>
                    </div>

                    <!-- Realisasi Progres (Persen ke Rupiah) -->
                    <div class="col-12 col-sm-4 border-left-gt-xs">
                      <div class="text-caption text-grey-6 font-bold">REALISASI FISIK (Rp)</div>
                      <div class="text-h6 text-weight-black text-green-8 q-mt-xs">
                        Rp
                        {{
                          Math.round(
                            ((selectedProjectDetail.progress || 0) / 100) *
                              (selectedProjectDetail.total_omzet || 0),
                          ).toLocaleString('id-ID')
                        }}
                      </div>
                    </div>

                    <!-- Sisa Nilai Pekerjaan -->
                    <div class="col-12 col-sm-4 border-left-gt-xs">
                      <div class="text-caption text-grey-6 font-bold">SISA NILAI PEKERJAAN</div>
                      <div class="text-h6 text-weight-black text-orange-9 q-mt-xs">
                        Rp
                        {{
                          (
                            (selectedProjectDetail.total_omzet || 0) -
                            Math.round(
                              ((selectedProjectDetail.progress || 0) / 100) *
                                (selectedProjectDetail.total_omzet || 0),
                            )
                          ).toLocaleString('id-ID')
                        }}
                      </div>
                    </div>
                  </div>
                </q-card>
              </div>
            </div>

            <!-- SECTION 4: SPK KONTRAK YANG MENYUSUN VALUASI -->
            <div class="column">
              <div class="text-overline text-grey-6 text-weight-bold q-mb-xs text-left">
                <q-icon name="list_alt" color="brand-primary" class="q-mr-xs" /> DAFTAR SPK KONTRAK
                YANG TERINTEGRASI
              </div>

              <q-markup-table
                flat
                bordered
                class="rounded-borders overflow-hidden bg-white shadow-sm border-subtle"
              >
                <thead>
                  <tr class="bg-brand-light text-brand-primary text-left">
                    <th width="40" class="text-center font-bold">NO</th>
                    <th class="font-bold">NOMOR SPK / RUJUKAN</th>
                    <th class="font-bold">NAMA KONTRAK PEKERJAAN</th>
                    <th width="160" class="text-right font-bold">NILAI TOTAL (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(spk, idx) in relatedSpksDetail" :key="spk.id">
                    <td class="text-center font-bold text-grey-6">{{ idx + 1 }}</td>
                    <td class="text-weight-black text-brand-primary font-mono">
                      {{ spk.nomor_spk }}
                    </td>
                    <td class="text-weight-bold text-uppercase">{{ spk.nama_kontrak }}</td>
                    <td class="text-right text-weight-bolder text-brand-primary">
                      Rp {{ (spk.nilai_total || 0).toLocaleString('id-ID') }}
                    </td>
                  </tr>
                  <tr v-if="relatedSpksDetail.length === 0">
                    <td colspan="4" class="text-center q-pa-md italic text-grey-5">
                      Belum ada SPK kontrak yang terintegrasi di proyek ini.
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </div>
          </q-card-section>

          <q-separator />
          <q-card-actions align="right" class="bg-white q-pa-md">
            <!-- Dynamic Authorization: Approve Progress (setuju Permission) -->
            <q-btn
              v-if="canAction('setuju') && selectedProjectDetail?.progress_status !== 'Approved'"
              unelevated
              color="positive"
              icon="verified"
              label="Verifikasi Progres"
              @click="toggleVerifyProgress(selectedProjectDetail, 'Approved')"
              class="q-px-lg text-weight-bold rounded-12 text-white"
            />
            <q-btn
              v-if="canAction('setuju') && selectedProjectDetail?.progress_status === 'Approved'"
              unelevated
              color="warning"
              icon="undo"
              label="Batalkan Verifikasi"
              @click="toggleVerifyProgress(selectedProjectDetail, 'Pending')"
              class="q-px-lg text-weight-bold rounded-12 text-white"
            />
            <q-btn
              flat
              label="Tutup"
              color="brand-primary"
              class="q-px-lg text-weight-bold rounded-12"
              v-close-popup
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- =====================================================================================
           MODAL 2: DIALOG UPDATE PROGRESS (MODAL KECIL UNTUK SUNTIK UPDATE)
           ===================================================================================== -->
      <q-dialog v-model="showUpdateDialog" persistent backdrop-filter="blur(4px)">
        <q-card
          style="width: 550px; max-width: 95vw"
          class="rounded-20 shadow-24 bg-grey-2 column no-wrap animate-fade relative-position"
        >
          <!-- Background Animation di dalam Dialog -->
          <div class="bg-animation-container">
            <q-icon name="engineering" class="floating-icon i-1" />
            <q-icon name="construction" class="floating-icon i-2" />
            <q-icon name="architecture" class="floating-icon i-3" />
          </div>

          <q-toolbar class="bg-white text-brand-primary q-py-md shadow-2 shrink content-relative">
            <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
            <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest font-11">
              Update Progres Pekerjaan
            </q-toolbar-title>
            <q-btn
              v-if="canAction('ubah')"
              unelevated
              color="brand-primary"
              label="SIMPAN"
              rounded
              class="q-px-xl text-weight-bold shadow-3 text-white gt-xs"
              @click="saveProgress"
              :loading="submitting"
            />
          </q-toolbar>

          <q-card-section class="q-pa-lg scroll content-relative">
            <!-- Tombol Simpan untuk versi Mobile (Membentang Penuh) -->
            <div class="lt-sm q-mb-md">
              <q-btn
                v-if="canAction('ubah')"
                unelevated
                color="brand-primary"
                label="SIMPAN PERUBAHAN"
                rounded
                class="full-width q-py-sm text-weight-bold shadow-3 text-white"
                @click="saveProgress"
                :loading="submitting"
              />
            </div>

            <!-- CARD UTAMA IDENTITAS PROYEK -->
            <q-card flat bordered class="rounded-12 bg-white shadow-1 border-subtle q-mb-md">
              <q-card-section class="text-center">
                <div class="text-h6 text-weight-black text-brand-primary leading-tight q-mb-xs">
                  {{ selectedProject?.nama }}
                </div>
                <div class="text-caption text-grey-7 uppercase tracking-widest text-weight-bold">
                  Klien: {{ selectedProject?.konsumen || 'Internal' }}
                </div>
              </q-card-section>
            </q-card>

            <!-- CARD INPUT PROGRES & AUTO KALKULASI NOMINAL -->
            <q-card
              flat
              bordered
              class="rounded-12 bg-white shadow-1 border-subtle q-pa-lg q-gutter-y-lg"
            >
              <!-- PILIH STATUS -->
              <div>
                <div class="label-req q-mb-sm">Status Proyek Saat Ini</div>
                <q-select
                  outlined
                  dense
                  v-model="formUpdate.status"
                  :options="['Perencanaan', 'On Progress', 'Tertunda', 'Selesai']"
                  bg-color="white"
                  class="text-weight-bold"
                  :readonly="!canAction('ubah')"
                >
                  <template v-slot:selected>
                    <q-chip
                      dense
                      :color="getStatusColor(formUpdate.status).bg"
                      :text-color="getStatusColor(formUpdate.status).text"
                      class="text-weight-bold q-ma-none uppercase font-10"
                    >
                      {{ formUpdate.status }}
                    </q-chip>
                  </template>
                </q-select>
              </div>

              <!-- VALUASI KONTRAK SEKARANG (INFO HARGA ACUAN) -->
              <div
                class="q-pa-md bg-brand-light text-brand-primary rounded-borders row justify-between items-center"
              >
                <div class="text-caption text-weight-bold">NILAI KONTRAK PROYEK :</div>
                <div class="text-subtitle1 text-weight-black">
                  Rp {{ (selectedProject?.total_omzet || 0).toLocaleString('id-ID') }}
                </div>
              </div>

              <!-- INPUT PERSEN MANUAL DENGAN VALIDASI DESIMAL -->
              <div>
                <div class="label-req q-mb-xs">Persentase Progres Selesai Fisik (%)</div>
                <q-input
                  outlined
                  dense
                  v-model.number="formUpdate.progress"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Contoh: 3.5"
                  suffix="%"
                  input-class="text-weight-black text-brand-primary text-h6"
                  bg-color="white"
                  :readonly="!canAction('ubah')"
                  :rules="[
                    (val) => val >= 0 || 'Minimal progres 0%',
                    (val) => val <= 100 || 'Maksimal progres 100%',
                  ]"
                />
              </div>

              <!-- HASIL KALKULASI FISIK (RUPIAH) -->
              <div class="q-pa-md bg-green-1 text-green-10 rounded-borders">
                <div class="row items-center justify-between">
                  <span class="text-caption text-weight-bold"
                    >ESTIMASI VALUASI FISIK REALISASI (Rp) :</span
                  >
                  <span class="text-caption font-bold font-mono"
                    >({{ formUpdate.progress || 0 }}%)</span
                  >
                </div>
                <div class="text-h5 text-weight-black q-mt-xs">
                  Rp {{ calculatedValuationNominal.toLocaleString('id-ID') }}
                </div>
              </div>
            </q-card>
          </q-card-section>
        </q-card>
      </q-dialog>
    </template>

    <div class="q-py-xl no-print"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

// State
const loading = ref(true)
const submitting = ref(false)
const searchQuery = ref('')
const rawProjects = ref([])
const rawSpks = ref([])

// Dialog Update Progres State
const showUpdateDialog = ref(false)
const selectedProject = ref(null)
const formUpdate = ref({ status: 'Perencanaan', progress: 0 })

// Executive Detail Dialog
const showDetailDialog = ref(false)
const selectedProjectDetail = ref(null)

let unsubProyek = null
let unsubSpk = null
let unsubUser = null

const userData = ref(null)

// ==========================================
// ANIMASI KLIK & MENGAMBANG (SAMA SEPERTI MASTER BARANG)
// ==========================================
const spawnedIcons = ref([])
let spawnIdCounter = 0
const clickIcons = [
  'construction',
  'engineering',
  'handyman',
  'architecture',
  'foundation',
  'precision_manufacturing',
  'carpenter',
  'plumbing',
  'electrical_services',
  'hardware',
]

const spawnIcon = (e) => {
  const target = e.target
  if (
    target.closest('button') ||
    target.closest('.q-btn') ||
    target.closest('input') ||
    target.closest('.q-field') ||
    target.closest('.q-dialog') ||
    target.closest('.q-table') ||
    target.closest('.q-card')
  ) {
    return
  }

  const iconName = clickIcons[Math.floor(Math.random() * clickIcons.length)]
  const colors = ['#36ada3', '#2a8b83', '#56c2b9', '#f29c1f', '#e67e22', '#e74c3c']
  const randColor = colors[Math.floor(Math.random() * colors.length)]
  const randRotate = Math.floor(Math.random() * 90) - 45
  const randSize = Math.floor(Math.random() * 25) + 35

  const newIcon = {
    id: spawnIdCounter++,
    x: e.clientX,
    y: e.clientY,
    name: iconName,
    color: randColor,
    rotate: randRotate,
    size: randSize,
  }

  spawnedIcons.value.push(newIcon)

  setTimeout(() => {
    spawnedIcons.value = spawnedIcons.value.filter((i) => i.id !== newIcon.id)
  }, 1400)
}
// ==========================================

// INTEGRATED REAL-TIME PERMISSION CONTROL MATRIX
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const menu = modulePerm.menus.find(
    (m) =>
      m.id.toLowerCase().includes('proyek_monitoring') ||
      m.id.toLowerCase().includes('proyek-monitoring'),
  )
  if (!menu) return false
  if (actionType === 'setuju') return menu.approve || false
  return menu[actionType] || false
}

const columns = [
  { name: 'proyek', align: 'left', label: 'IDENTITAS PROYEK', field: 'nama', sortable: true },
  {
    name: 'monitoring_timeline',
    align: 'left',
    label: 'TIMELINE PELAKSANAAN',
    field: 'start_date',
    sortable: true,
  },
  {
    name: 'progress',
    align: 'left',
    label: 'STATUS & KEMAJUAN',
    field: 'progress',
    sortable: true,
    style: 'width: 250px',
  },
  {
    name: 'valuasi',
    align: 'right',
    label: 'VALUASI KONTRAK',
    field: 'total_omzet',
    sortable: true,
  },
  { name: 'aksi', align: 'center', label: 'UPDATE', field: 'id' },
]

// Real-time calculation nominal Rp pada modal update progres
const calculatedValuationNominal = computed(() => {
  const contractValue = selectedProject.value?.total_omzet || 0
  const pct = Number(formUpdate.value.progress) || 0
  return Math.round((pct / 100) * contractValue)
})

// Real-time SPK List yang menyusun valuasi proyek terpilih di detail
const relatedSpksDetail = computed(() => {
  if (!selectedProjectDetail.value) return []
  return rawSpks.value.filter((spk) => spk.projectId === selectedProjectDetail.value.id)
})

// Fetch Data Real-time
const fetchData = () => {
  loading.value = true
  unsubProyek = onSnapshot(collection(db, 'proyek'), (snap) => {
    rawProjects.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    loading.value = false
  })
  unsubSpk = onSnapshot(collection(db, 'spk_customer'), (snap) => {
    rawSpks.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })
}

// Computed: Gabungkan data Proyek dengan kalkulasi dari SPK
const combinedProjects = computed(() => {
  return rawProjects.value
    .map((proj) => {
      const relatedSpks = rawSpks.value.filter((spk) => spk.projectId === proj.id)
      const totalOmzet = relatedSpks.reduce((sum, spk) => sum + (spk.nilai_total || 0), 0)

      let startDate = null
      let endDate = null
      relatedSpks.forEach((spk) => {
        if (spk.tgl_mulai) {
          const d = new Date(spk.tgl_mulai)
          if (!startDate || d < startDate) startDate = d
        }
        if (spk.tgl_akhir) {
          const d = new Date(spk.tgl_akhir)
          if (!endDate || d > endDate) endDate = d
        }
      })

      return {
        ...proj,
        total_omzet: totalOmzet,
        start_date: startDate,
        end_date: endDate,
        progress: proj.progress || 0,
        status: proj.status || 'Perencanaan',
        progress_status: proj.progress_status || 'Pending',
      }
    })
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
})

// Kalkulasi KPI
const totalValuation = computed(() => {
  return combinedProjects.value.reduce((sum, p) => sum + (p.total_omzet || 0), 0)
})

const countByStatus = (status) => {
  return combinedProjects.value.filter((p) => p.status === status).length
}

// Dialog Logic
const openDetailDialog = (proj) => {
  selectedProjectDetail.value = proj
  showDetailDialog.value = true
}

const openUpdateDialog = (proj) => {
  if (!canAction('ubah')) {
    $q.notify({
      type: 'negative',
      message: 'Anda tidak memiliki hak akses untuk merubah data ini!',
    })
    return
  }

  // Jika progres sudah disetujui (Approved) secara resmi oleh PM, kunci update bagi staf biasa
  if (proj.progress_status === 'Approved' && !canAction('setuju')) {
    $q.notify({
      type: 'warning',
      message:
        'Progres proyek ini sudah dikunci & diverifikasi oleh PM. Perubahan hanya bisa dilakukan oleh PM / Super Admin.',
    })
    return
  }

  selectedProject.value = proj
  formUpdate.value = {
    status: proj.status || 'Perencanaan',
    progress: proj.progress || 0,
  }
  showUpdateDialog.value = true
}

const saveProgress = async () => {
  if (!canAction('ubah')) {
    $q.notify({
      type: 'negative',
      message: 'Anda tidak memiliki hak akses untuk merubah data ini!',
    })
    return
  }

  if (formUpdate.value.progress < 0 || formUpdate.value.progress > 100) {
    return $q.notify({
      type: 'warning',
      message: 'Input persentase progres harus berada di rentang 0 - 100%',
    })
  }
  submitting.value = true
  try {
    const projRef = doc(db, 'proyek', selectedProject.value.id)
    await updateDoc(projRef, {
      status: formUpdate.value.status,
      progress: Number(formUpdate.value.progress),
      updatedAt: serverTimestamp(),
    })

    // NOTIFIKASI SIMPAN PROGRES PREMIUM
    $q.notify({
      html: true,
      message:
        '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Pembaruan Sukses!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Kemajuan proyek berhasil diperbarui dan disinkronisasi ke sistem.</div>',
      color: 'positive',
      icon: 'task_alt',
      position: 'top',
      timeout: 4000,
      progress: true,
      classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
      actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
    })

    showUpdateDialog.value = false
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal mengupdate proyek.' })
  } finally {
    submitting.value = false
  }
}

// Fungsi Persetujuan / Verifikasi Progres Lapangan (setuju Permission)
const toggleVerifyProgress = async (proj, statusVal) => {
  if (!canAction('setuju')) {
    $q.notify({
      type: 'negative',
      message: 'Anda tidak memiliki hak akses persetujuan untuk modul ini!',
    })
    return
  }
  $q.loading.show({
    message:
      statusVal === 'Approved' ? 'Memverifikasi Progres Lapangan...' : 'Membatalkan Verifikasi...',
  })
  try {
    const projRef = doc(db, 'proyek', proj.id)
    await updateDoc(projRef, {
      progress_status: statusVal,
      updatedAt: serverTimestamp(),
    })
    proj.progress_status = statusVal

    // NOTIFIKASI PERSUBALAN/OTORISASI PREMIUM (DENGAN TIMELINE PROGRESS BAR & CLOSE BUTTON)
    $q.notify({
      html: true,
      message:
        statusVal === 'Approved'
          ? '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Verifikasi Berhasil!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Progres kemajuan proyek resmi diverifikasi!</div>'
          : '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Verifikasi Dibatalkan!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Verifikasi progres telah berhasil dibatalkan.</div>',
      color: statusVal === 'Approved' ? 'positive' : 'warning',
      icon: statusVal === 'Approved' ? 'verified' : 'undo',
      position: 'top',
      timeout: 4000,
      progress: true,
      classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
      actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
    })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Terjadi kesalahan sistem.' })
  } finally {
    $q.loading.hide()
  }
}

// Utils
const formatTimeline = (proj) => {
  if (!proj.start_date && !proj.end_date) return 'Belum ada SPK'
  const formatOpt = { day: 'numeric', month: 'short', year: 'numeric' }
  const startStr = proj.start_date ? proj.start_date.toLocaleDateString('id-ID', formatOpt) : '?'
  const endStr = proj.end_date ? proj.end_date.toLocaleDateString('id-ID', formatOpt) : '?'
  return `${startStr} - ${endStr}`
}

const getDaysRemaining = (endDate) => {
  if (!endDate) return 'Belum Diatur'
  const today = new Date()
  const diffTime = endDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? `${diffDays} Hari` : 'Waktu Habis / Selesai'
}

const formatCompact = (num) => {
  if (!num) return '0'
  if (num >= 1000000000) return (num / 1000000000).toFixed(2).replace(/\.00$/, '') + ' Miliar'
  if (num >= 1000000) return (num / 1000000).toFixed(2).replace(/\.00$/, '') + ' Juta'
  return num.toLocaleString('id-ID')
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Perencanaan':
      return { bg: 'grey-3', text: 'grey-8' }
    case 'On Progress':
      return { bg: 'blue-2', text: 'blue-9' }
    case 'Tertunda':
      return { bg: 'red-2', text: 'red-9' }
    case 'Selesai':
      return { bg: 'green-2', text: 'green-9' }
    default:
      return { bg: 'grey-3', text: 'grey-8' }
  }
}

onMounted(() => {
  fetchData()

  // Pantau Hak Akses User Aktif secara Real-time
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) {
        userData.value = snapshot.docs[0].data()
      }
    })
  }
})

onUnmounted(() => {
  if (unsubProyek) unsubProyek()
  if (unsubSpk) unsubSpk()
  if (unsubUser) unsubUser()
})
</script>

<style scoped>
/* ===== GLOBAL THEME OVERRIDES (DARI MASTER BARANG TEAL/TOSCA) ===== */
.bg-page {
  background-color: #f8fcfb;
}

.font-pro {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-12 {
  border-radius: 12px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(54, 173, 163, 0.15); /* Teal accent shadow */
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-indigo-thin {
  border: 1px solid rgba(54, 173, 163, 0.15); /* Soft Teal border */
}
.border-white-2 {
  border: 2px solid rgba(255, 255, 255, 0.4);
}

/* OVERRIDE WARNA LAMA (INDIGO) MENJADI BRAND COLOR BARU (TEAL) */
.bg-brand-primary,
:deep(.bg-brand-primary) {
  background-color: #36ada3 !important;
}
.text-brand-primary,
:deep(.text-brand-primary) {
  color: #36ada3 !important;
}
.bg-brand-light {
  background-color: #e6f5f4 !important; /* Soft Teal */
}
.text-brand-secondary {
  color: #2a8b83 !important;
}
.border-brand-thin {
  border: 2px solid #b2e5e2 !important; /* Soft Teal border */
}

/* QUASAR COMPONENT OVERRIDES */
:deep(.q-btn.bg-brand-primary) {
  background-color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__control) {
  border-color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__label) {
  color: #36ada3 !important;
}
:deep(.q-icon[color='brand-primary']),
:deep(.q-field__prepend .q-icon) {
  color: #36ada3 !important;
}

/* RESPONSIVE SUMMARY CARDS AT ALIGNMENT ON MOBILE */
@media (max-width: 599px) {
  .flex-column {
    flex-direction: column !important;
  }
  .text-center {
    text-align: center !important;
  }
  .items-center {
    align-items: center !important;
  }
}

/* Table Styling */
.monitoring-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
}
.hover-bg:hover {
  background-color: #e6f5f4 !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(54, 173, 163, 0.1) !important;
}

.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transition: 0.3s;
}

.animate-fade {
  animation: fadeIn 0.4s ease-out;
}
.animate-fade-up {
  animation: fadeUp 0.6s ease-out both;
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
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.label-req {
  font-size: 11px;
  font-weight: 800;
  color: #444;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.block {
  display: block;
}
.uppercase {
  text-transform: uppercase;
}
.font-11 {
  font-size: 11px;
}
.font-10 {
  font-size: 10px;
}
.tracking-widest {
  letter-spacing: 0.15em;
}
.border-left-gt-xs {
  border-left: 1px solid #edf2f7;
}
@media (max-width: 600px) {
  .border-left-gt-xs {
    border-left: none;
    border-top: 1px solid #edf2f7;
    padding-top: 16px;
  }
}

/* ===== ANIMASI BACKGROUND (FLOATING TEAL DENGAN BLUR HALUS) ===== */
.bg-animation-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.floating-icon {
  position: absolute;
  bottom: -150px;
  animation: floatUp linear infinite;
  opacity: 0.15;
  filter: blur(1.5px); /* Kebureman tipis dan lembut sesuai contoh */
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

/* Posisi dan durasi masing-masing ikon mengambang */
.i-1 {
  left: 10%;
  font-size: 100px;
  animation-duration: 25s;
  animation-delay: 0s;
  color: #36ada3;
}
.i-2 {
  left: 30%;
  font-size: 70px;
  animation-duration: 35s;
  animation-delay: 5s;
  color: #f29c1f;
}
.i-3 {
  left: 60%;
  font-size: 120px;
  animation-duration: 40s;
  animation-delay: 12s;
  color: #e74c3c;
}
.i-4 {
  left: 80%;
  font-size: 85px;
  animation-duration: 30s;
  animation-delay: 2s;
  color: #56c2b9;
}
.i-5 {
  left: 15%;
  font-size: 90px;
  animation-duration: 28s;
  animation-delay: 15s;
  color: #e67e22;
}
.i-6 {
  left: 45%;
  font-size: 110px;
  animation-duration: 45s;
  animation-delay: 8s;
  color: #2a8b83;
}
.i-7 {
  left: 75%;
  font-size: 60px;
  animation-duration: 22s;
  animation-delay: 20s;
  color: #f29c1f;
}
.i-8 {
  left: 25%;
  font-size: 95px;
  animation-duration: 32s;
  animation-delay: 25s;
  color: #e74c3c;
}

@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.15;
  }
  90% {
    opacity: 0.15;
  }
  100% {
    transform: translateY(-120vh) rotate(360deg);
    opacity: 0;
  }
}

/* ===== CLICK SPAWN ICONS (MEMANCAR REAKTIF) ===== */
.click-spawn-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.spawned-icon {
  position: absolute;
  color: var(--rand-color);
  transform-origin: center;
  pointer-events: none;
  animation: spawnBurst 1.4s ease-out forwards;
}

@keyframes spawnBurst {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 1;
  }
  40% {
    transform: translate(-50%, -100%) scale(1.2) rotate(var(--rand-rotate));
    opacity: 0.9;
  }
  100% {
    transform: translate(-50%, -180%) scale(0.5) rotate(calc(var(--rand-rotate) * 1.5));
    opacity: 0;
  }
}

.spawn-enter-active,
.spawn-leave-active {
  transition: all 1.4s ease;
}

.shrink {
  flex: 0 0 auto;
}
.content-relative {
  position: relative;
  z-index: 1;
}
</style>
