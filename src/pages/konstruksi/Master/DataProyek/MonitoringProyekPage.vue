<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <!-- =====================================================================================
         SCREEN 1: LOCK SCREEN JIKA TIDAK MEMILIKI AKSES LIHAT
         ===================================================================================== -->
    <template v-if="!canAction('lihat')">
      <div
        class="row flex-center q-pa-xl text-center font-pro animate-fade"
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
            color="indigo-10"
            icon="arrow_back"
            rounded
            unelevated
            no-caps
            @click="$router.push('/')"
          />
        </div>
      </div>
    </template>

    <!-- =====================================================================================
         SCREEN 2: MONITORING VIEW JIKA AKSES LIHAT OK
         ===================================================================================== -->
    <template v-else>
      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-xl animate-fade no-print">
        <div class="col-12 col-md-8">
          <div class="row items-center no-wrap">
            <q-btn
              flat
              round
              color="indigo-10"
              icon="arrow_back"
              @click="$router.back()"
              class="q-mr-md bg-white shadow-1"
            />
            <div>
              <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight">
                Monitoring Proyek
                <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                  >Executive Dashboard & Tracking Pekerjaan</span
                >
              </div>
              <div class="text-subtitle1 text-grey-7 q-mt-sm">
                Pantau realisasi pekerjaan, timeline, dan status penyelesaian proyek secara
                real-time.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SUMMARY CARDS / KPI -->
      <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
        <!-- Total Proyek -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
            <q-card-section class="row items-center no-wrap q-pa-md">
              <div class="col">
                <div
                  class="text-overline text-grey-6 leading-none text-weight-bold tracking-widest"
                >
                  TOTAL PROYEK
                </div>
                <div class="text-h4 text-weight-bolder q-mt-xs text-indigo-10">
                  {{ combinedProjects.length }}
                </div>
              </div>
              <div
                class="bg-indigo-1 q-pa-md rounded-borders"
                style="min-width: 56px; text-align: center"
              >
                <q-icon name="domain" color="indigo-10" size="28px" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Proyek Berjalan -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
            <q-card-section class="row items-center no-wrap q-pa-md">
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
                class="bg-blue-1 q-pa-md rounded-borders"
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
            <q-card-section class="row items-center no-wrap q-pa-md">
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
                class="bg-green-1 q-pa-md rounded-borders"
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
            class="rounded-20 border-subtle bg-indigo-10 text-white transition-all hover-shadow"
          >
            <q-card-section class="row items-center no-wrap q-pa-md">
              <div class="col">
                <div
                  class="text-overline text-indigo-2 leading-none text-weight-bold tracking-widest"
                >
                  TOTAL VALUASI
                </div>
                <div class="text-h5 text-weight-bolder q-mt-xs">
                  Rp {{ formatCompact(totalValuation) }}
                </div>
              </div>
              <div
                class="bg-white q-pa-md rounded-borders shadow-2"
                style="min-width: 56px; text-align: center"
              >
                <q-icon name="account_balance_wallet" color="indigo-10" size="28px" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- SEARCH & FILTER AREA -->
      <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print">
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
                <template v-slot:prepend><q-icon name="search" color="primary" /></template>
                <template v-slot:append v-if="searchQuery">
                  <q-icon name="close" @click="searchQuery = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </div>
            <q-space />
            <q-btn flat round icon="refresh" color="primary" @click="fetchData" />
          </div>
        </q-card-section>
      </q-card>

      <!-- MAIN TABLE DATA -->
      <q-card
        flat
        bordered
        class="rounded-20 shadow-sm overflow-hidden bg-white no-print border-indigo-thin"
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
            <q-tr :props="props" class="bg-indigo-10 text-white">
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
                    color="indigo-1"
                    text-color="indigo-10"
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
                        class="text-weight-bold font-9"
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
                    <span class="text-caption text-primary text-weight-bolder"
                      >{{ props.row.progress || 0 }}%</span
                    >
                  </div>
                  <q-linear-progress
                    :value="(props.row.progress || 0) / 100"
                    size="8px"
                    rounded
                    color="primary"
                    track-color="blue-1"
                  />
                </div>
              </q-td>

              <q-td key="valuasi" class="text-right">
                <div class="text-weight-bolder text-indigo-10 text-subtitle2">
                  Rp {{ (props.row.total_omzet || 0).toLocaleString('id-ID') }}
                </div>
              </q-td>

              <q-td key="aksi" class="text-center" @click.stop>
                <!-- Tombol Update Progress Fisik Terkunci jika status approved -->
                <q-btn
                  v-if="canAction('ubah')"
                  unelevated
                  rounded
                  :color="props.row.progress_status === 'Approved' ? 'grey-5' : 'indigo-10'"
                  :icon="props.row.progress_status === 'Approved' ? 'lock' : 'update'"
                  label="Update"
                  size="sm"
                  class="q-px-md text-weight-bold shadow-2 btn-hover"
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
          <q-toolbar class="bg-indigo-10 text-white q-py-md">
            <q-avatar icon="assignment" color="white" text-color="indigo-10" size="md" />
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
                  class="text-h5 text-weight-black text-indigo-10 uppercase leading-none q-mb-sm"
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
                  class="text-weight-bold q-px-sm q-py-xs"
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
                    class="text-primary text-weight-black text-h4"
                    :value="selectedProjectDetail.progress"
                    size="140px"
                    :thickness="0.18"
                    color="primary"
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
                      color="indigo-10"
                      class="q-px-md q-py-xs text-weight-bold text-subtitle2"
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
                    <q-icon name="monetization_on" color="indigo-10" size="sm" class="q-mr-xs" />
                    RINCIAN VALUASI REALISASI PROYEK
                  </div>

                  <div class="row q-col-gutter-lg">
                    <!-- Nilai Kontrak / Omzet -->
                    <div class="col-12 col-sm-4">
                      <div class="text-caption text-grey-6 font-bold">TOTAL NILAI KONTRAK</div>
                      <div class="text-h6 text-weight-black text-indigo-10 q-mt-xs">
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
                <q-icon name="list_alt" color="primary" class="q-mr-xs" /> DAFTAR SPK KONTRAK YANG
                TERINTEGRASI
              </div>

              <q-markup-table
                flat
                bordered
                class="rounded-borders overflow-hidden bg-white shadow-sm border-subtle"
              >
                <thead>
                  <tr class="bg-indigo-1 text-indigo-10 text-left">
                    <th width="40" class="text-center font-bold">NO</th>
                    <th class="font-bold">NOMOR SPK / RUJUKAN</th>
                    <th class="font-bold">NAMA KONTRAK PEKERJAAN</th>
                    <th width="160" class="text-right font-bold">NILAI TOTAL (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(spk, idx) in relatedSpksDetail" :key="spk.id">
                    <td class="text-center font-bold text-grey-6">{{ idx + 1 }}</td>
                    <td class="text-weight-black text-indigo-10 font-mono">{{ spk.nomor_spk }}</td>
                    <td class="text-weight-bold text-uppercase">{{ spk.nama_kontrak }}</td>
                    <td class="text-right text-weight-bolder text-primary">
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
              class="q-px-lg text-weight-bold rounded-12"
            />
            <q-btn
              v-if="canAction('setuju') && selectedProjectDetail?.progress_status === 'Approved'"
              unelevated
              color="warning"
              icon="undo"
              label="Batalkan Verifikasi"
              @click="toggleVerifyProgress(selectedProjectDetail, 'Pending')"
              class="q-px-lg text-weight-bold rounded-12"
            />
            <q-btn
              flat
              label="Tutup Detail"
              color="indigo-10"
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
          class="rounded-20 shadow-24 bg-grey-2 column no-wrap animate-fade"
        >
          <q-toolbar class="bg-white text-indigo-10 q-py-md shadow-2 shrink">
            <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
            <q-toolbar-title class="text-weight-bold text-center uppercase tracking-widest font-11">
              Update Progres Pekerjaan
            </q-toolbar-title>
            <q-btn
              v-if="canAction('ubah')"
              unelevated
              color="indigo-10"
              label="SIMPAN"
              rounded
              class="q-px-xl text-weight-bold shadow-3"
              @click="saveProgress"
              :loading="submitting"
            />
          </q-toolbar>

          <q-card-section class="q-pa-lg scroll">
            <!-- CARD UTAMA IDENTITAS PROYEK -->
            <q-card flat bordered class="rounded-12 bg-white shadow-1 border-subtle q-mb-md">
              <q-card-section class="text-center">
                <div class="text-h6 text-weight-black text-indigo-10 leading-tight q-mb-xs">
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
                class="q-pa-md bg-indigo-1 text-indigo-10 rounded-borders row justify-between items-center"
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
                  input-class="text-weight-black text-indigo-10 text-h6"
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
import { useQuasar } from 'quasar'
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

// ============================================================================
// INTEGRATED REAL-TIME PERMISSION CONTROL MATRIX
// ============================================================================
const canAction = (actionType) => {
  // 1. Super Admin otomatis bypass
  if (authStore.user?.role === 'Super Admin') return true

  // 2. Safeguard jika profile hak akses belum termuat sempurna
  if (!userData.value?.permissions_detail) return false

  // 3. Ambil data izin modul 'konstruksi'
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false

  // 4. Cari sub-menu 'Proyek Monitoring' / 'proyek_monitoring'
  const menu = modulePerm.menus.find(
    (m) =>
      m.id.toLowerCase().includes('proyek_monitoring') ||
      m.id.toLowerCase().includes('proyek-monitoring'),
  )
  if (!menu) return false

  // 5. Mapping nama parameter pemanggil ke skema matrix AksesPage.vue
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

  // Ambil Data Proyek
  unsubProyek = onSnapshot(collection(db, 'proyek'), (snap) => {
    rawProjects.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    loading.value = false
  })

  // Ambil Data SPK untuk kalkulasi timeline & omzet
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
    $q.notify({ type: 'positive', message: 'Kemajuan proyek berhasil diperbarui!' })
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
    $q.notify({
      type: 'positive',
      message:
        statusVal === 'Approved'
          ? 'Progres kemajuan proyek resmi diverifikasi!'
          : 'Verifikasi progres dibatalkan.',
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
  box-shadow: 0 10px 30px rgba(25, 118, 210, 0.15);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-indigo-thin {
  border: 1px solid rgba(26, 35, 126, 0.1);
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
  background-color: rgba(25, 118, 210, 0.03) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 25px rgba(26, 35, 126, 0.1) !important;
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
</style>
