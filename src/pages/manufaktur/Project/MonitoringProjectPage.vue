<template>
  <q-page class="bg-page q-pa-md font-pro relative-position">
    <div class="page-content-wrapper animate-fade">
      <!-- LOCK SCREEN -->
      <template v-if="!canAction('lihat')">
        <div
          class="row flex-center q-pa-xl text-center animate-fade content-relative"
          style="min-height: 70vh"
        >
          <div
            class="col-12 col-sm-8 col-md-6 bg-white q-pa-xl rounded-20 shadow-premium border-subtle"
          >
            <q-avatar size="100px" color="red-1" text-color="red-10" icon="lock" class="q-mb-md" />
            <div class="text-h5 text-weight-bold text-blue-grey-10 q-mb-xs">Akses Terbatas</div>
            <div class="text-body2 text-grey-7 q-mb-lg">
              Maaf, Anda tidak memiliki izin untuk melihat modul Monitoring Proyek.
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

      <template v-else>
        <!-- VIEW 1: LIST PROYEK -->
        <div v-if="viewMode === 'list'" class="animate-fade content-relative">
          <div class="row items-center justify-between q-mb-xl">
            <div class="col-12">
              <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
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

          <!-- KPI CARDS -->
          <div class="row q-col-gutter-lg q-mb-lg animate-fade-up">
            <div class="col-12 col-sm-6 col-md-3">
              <q-card
                flat
                class="rounded-20 card-teal-gradient text-white transition-all hover-shadow"
              >
                <q-card-section class="row items-center no-wrap q-pa-md">
                  <div class="col">
                    <div
                      class="text-overline leading-none text-weight-bold tracking-widest"
                      style="color: rgba(255, 255, 255, 0.85)"
                    >
                      TOTAL PROYEK
                    </div>
                    <div class="text-h4 text-weight-bolder q-mt-xs">
                      {{ combinedProjects.length }}
                    </div>
                  </div>
                  <div
                    class="bg-white q-pa-md rounded-12 shadow-sm"
                    style="min-width: 56px; text-align: center"
                  >
                    <q-icon name="domain" color="teal-8" size="28px" />
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card
                flat
                class="rounded-20 card-blue-gradient text-white transition-all hover-shadow"
              >
                <q-card-section class="row items-center no-wrap q-pa-md">
                  <div class="col">
                    <div
                      class="text-overline leading-none text-weight-bold tracking-widest"
                      style="color: rgba(255, 255, 255, 0.85)"
                    >
                      SEDANG BERJALAN
                    </div>
                    <div class="text-h4 text-weight-bolder q-mt-xs">
                      {{ countByStatus('On Progress') }}
                    </div>
                  </div>
                  <div
                    class="bg-white q-pa-md rounded-12 shadow-sm"
                    style="min-width: 56px; text-align: center"
                  >
                    <q-icon name="trending_up" color="blue-8" size="28px" />
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card
                flat
                class="rounded-20 card-green-gradient text-white transition-all hover-shadow"
              >
                <q-card-section class="row items-center no-wrap q-pa-md">
                  <div class="col">
                    <div
                      class="text-overline leading-none text-weight-bold tracking-widest"
                      style="color: rgba(255, 255, 255, 0.85)"
                    >
                      PROYEK SELESAI
                    </div>
                    <div class="text-h4 text-weight-bolder q-mt-xs">
                      {{ countByStatus('Selesai') }}
                    </div>
                  </div>
                  <div
                    class="bg-white q-pa-md rounded-12 shadow-sm"
                    style="min-width: 56px; text-align: center"
                  >
                    <q-icon name="task_alt" color="green-8" size="28px" />
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card
                flat
                class="rounded-20 card-orange-gradient text-white transition-all hover-shadow"
              >
                <q-card-section class="row items-center no-wrap q-pa-md">
                  <div class="col">
                    <div
                      class="text-overline leading-none text-weight-bold tracking-widest"
                      style="color: rgba(255, 255, 255, 0.85)"
                    >
                      TOTAL VALUASI
                    </div>
                    <div class="text-h5 text-weight-bolder q-mt-xs">
                      Rp {{ formatCompact(totalValuation) }}
                    </div>
                  </div>
                  <div
                    class="bg-white q-pa-md rounded-12 shadow-sm"
                    style="min-width: 56px; text-align: center"
                  >
                    <q-icon name="account_balance_wallet" color="orange-9" size="28px" />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- SEARCH -->
          <q-card
            flat
            bordered
            class="q-mb-lg shadow-1 rounded-20 bg-white border-subtle content-relative"
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
                    <template v-slot:prepend
                      ><q-icon name="search" color="brand-primary"
                    /></template>
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

          <!-- TABLE -->
          <q-card
            flat
            bordered
            class="rounded-20 shadow-sm overflow-hidden bg-white border-brand-thin content-relative"
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
                    >{{ col.label }}</q-th
                  >
                </q-tr>
              </template>
              <template v-slot:body="props">
                <q-tr
                  :props="props"
                  class="hover-bg transition-all cursor-pointer"
                  @click="openProjectDashboard(props.row)"
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
                        <div class="text-caption text-grey-6 uppercase text-weight-medium">
                          Klien: {{ props.row.konsumen || 'Internal' }}
                          <q-badge
                            v-if="props.row.progress_status === 'Approved'"
                            color="positive"
                            dense
                            class="q-ml-xs text-white"
                            >VERIFIED</q-badge
                          >
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
                          >{{ props.row.status || 'Perencanaan' }}</q-chip
                        >
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
        </div>

        <!-- VIEW 2: DASHBOARD PROYEK -->
        <div v-else-if="viewMode === 'project'" class="animate-fade content-relative">
          <div class="row items-center q-mb-lg">
            <q-btn
              flat
              round
              icon="arrow_back"
              color="brand-primary"
              @click="viewMode = 'list'"
              class="q-mr-md bg-white shadow-1"
            />
            <div class="col">
              <div class="text-h5 text-weight-bolder text-brand-primary uppercase">
                Dashboard Proyek
              </div>
              <div class="text-caption text-grey-7">{{ currentProject?.nama }}</div>
            </div>
          </div>

          <q-card
            flat
            bordered
            class="bg-white rounded-20 shadow-premium q-mb-lg overflow-hidden border-brand-thin"
          >
            <div class="row">
              <div class="col-12 col-md-4 q-pa-xl text-center border-right-sep">
                <div class="text-overline text-grey-6 text-bold tracking-widest">
                  KLIEN / KONSUMEN
                </div>
                <div class="text-h5 text-brand-primary text-weight-bolder text-uppercase q-mt-sm">
                  {{ currentProject?.konsumen || '-' }}
                </div>
              </div>
              <div class="col-12 col-md-4 q-pa-xl text-center border-right-sep bg-brand-light">
                <div class="text-overline text-brand-primary text-bold tracking-widest">
                  TOTAL VALUASI OMZET
                </div>
                <div class="text-h4 text-brand-primary text-weight-black q-mt-sm">
                  Rp {{ formatCompact(currentProject?.total_omzet || 0) }}
                </div>
              </div>
              <div class="col-12 col-md-4 q-pa-xl text-center">
                <div class="text-overline text-grey-6 text-bold tracking-widest">
                  LOKASI PENGERJAAN
                </div>
                <div class="text-body1 text-weight-bold text-blue-grey-9 q-mt-sm">
                  {{ currentProject?.alamat || 'Belum diatur' }}
                </div>
              </div>
            </div>
          </q-card>

          <!-- GRAFIK ROW -->
          <div class="row q-col-gutter-lg q-mb-lg">
            <div class="col-12 col-md-4">
              <q-card flat bordered class="rounded-20 bg-white shadow-sm border-subtle h-full">
                <q-card-section class="q-pb-xs">
                  <div class="text-overline text-grey-6 text-weight-bold flex items-center">
                    <q-icon name="pie_chart" color="brand-primary" class="q-mr-xs" />DISTRIBUSI
                    NILAI SPK
                  </div>
                </q-card-section>
                <q-card-section class="flex flex-center column">
                  <div v-if="projectSpks.length === 0" class="text-grey-5 text-center q-pa-lg">
                    <q-icon name="insert_chart_outlined" size="48px" />
                    <div class="q-mt-sm">Belum ada SPK</div>
                  </div>
                  <div v-else style="width: 100%; max-width: 260px">
                    <svg viewBox="0 0 200 200" style="width: 100%; overflow: visible">
                      <template v-for="(slice, i) in pieSlices" :key="i">
                        <path :d="slice.path" :fill="slice.color" stroke="white" stroke-width="2" />
                      </template>
                      <circle cx="100" cy="100" r="50" fill="white" />
                      <text
                        x="100"
                        y="96"
                        text-anchor="middle"
                        font-size="11"
                        fill="#36ada3"
                        font-weight="bold"
                      >
                        {{ projectSpks.length }}
                      </text>
                      <text x="100" y="110" text-anchor="middle" font-size="9" fill="#888">
                        Kontrak
                      </text>
                    </svg>
                    <div class="row q-col-gutter-xs q-mt-sm">
                      <div v-for="(spk, i) in projectSpks.slice(0, 4)" :key="spk.id" class="col-6">
                        <div class="row items-center no-wrap q-gutter-x-xs">
                          <div
                            class="rounded-2"
                            :style="{
                              width: '10px',
                              height: '10px',
                              background: pieColors[i % pieColors.length],
                              flexShrink: 0,
                            }"
                          ></div>
                          <div class="text-caption text-grey-7 ellipsis">{{ spk.nomor_spk }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-4">
              <q-card flat bordered class="rounded-20 bg-white shadow-sm border-subtle h-full">
                <q-card-section class="q-pb-xs">
                  <div class="text-overline text-grey-6 text-weight-bold flex items-center">
                    <q-icon name="bar_chart" color="brand-primary" class="q-mr-xs" />PROGRES PER
                    KONTRAK
                  </div>
                </q-card-section>
                <q-card-section>
                  <div v-if="projectSpks.length === 0" class="text-grey-5 text-center q-pa-lg">
                    <q-icon name="insert_chart_outlined" size="48px" />
                    <div class="q-mt-sm">Belum ada SPK</div>
                  </div>
                  <div v-else class="q-gutter-y-md">
                    <div v-for="(spk, i) in projectSpks" :key="spk.id">
                      <div class="row items-center justify-between q-mb-xs">
                        <div
                          class="text-caption text-weight-bold text-blue-grey-9 ellipsis"
                          style="max-width: 65%"
                        >
                          {{ spk.nomor_spk }}
                        </div>
                        <div class="text-caption text-brand-primary text-weight-bold">
                          {{ spkProgress(spk) }}%
                        </div>
                      </div>
                      <q-linear-progress
                        :value="spkProgress(spk) / 100"
                        size="10px"
                        rounded
                        :color="pieColorsQ[i % pieColorsQ.length]"
                        track-color="grey-3"
                      />
                      <div class="text-caption text-grey-6 q-mt-xs">
                        <span
                          :class="spk.status === 'Approved' ? 'text-positive' : 'text-orange-9'"
                          class="text-weight-bold"
                          >{{ spk.status || 'Pending' }}</span
                        >
                        · Rp {{ formatCompact(spk.nilai_total || 0) }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-4">
              <q-card flat bordered class="rounded-20 bg-white shadow-sm border-subtle h-full">
                <q-card-section class="q-pb-xs">
                  <div class="text-overline text-grey-6 text-weight-bold flex items-center">
                    <q-icon name="monetization_on" color="brand-primary" class="q-mr-xs" />RINGKASAN
                    FINANSIAL
                  </div>
                </q-card-section>
                <q-card-section class="q-gutter-y-md">
                  <div class="q-pa-md bg-teal-1 rounded-12">
                    <div class="text-caption text-grey-6 text-weight-bold">TOTAL NILAI KONTRAK</div>
                    <div class="text-h6 text-weight-black text-brand-primary q-mt-xs">
                      Rp {{ (currentProject?.total_omzet || 0).toLocaleString('id-ID') }}
                    </div>
                  </div>
                  <div class="q-pa-md bg-green-1 rounded-12">
                    <div class="text-caption text-grey-6 text-weight-bold">
                      REALISASI FISIK ({{ currentProject?.progress || 0 }}%)
                    </div>
                    <div class="text-h6 text-weight-black text-green-8 q-mt-xs">
                      Rp
                      {{
                        Math.round(
                          ((currentProject?.progress || 0) / 100) *
                            (currentProject?.total_omzet || 0),
                        ).toLocaleString('id-ID')
                      }}
                    </div>
                  </div>
                  <div class="q-pa-md bg-orange-1 rounded-12">
                    <div class="text-caption text-grey-6 text-weight-bold">SISA PEKERJAAN</div>
                    <div class="text-h6 text-weight-black text-orange-9 q-mt-xs">
                      Rp
                      {{
                        (
                          (currentProject?.total_omzet || 0) -
                          Math.round(
                            ((currentProject?.progress || 0) / 100) *
                              (currentProject?.total_omzet || 0),
                          )
                        ).toLocaleString('id-ID')
                      }}
                    </div>
                  </div>
                  <div class="q-pa-md bg-blue-1 rounded-12">
                    <div class="text-caption text-grey-6 text-weight-bold">
                      JUMLAH KONTRAK (SPK)
                    </div>
                    <div class="text-h6 text-weight-black text-blue-9 q-mt-xs">
                      {{ projectSpks.length }} Kontrak
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- LIST SPK -->
          <div
            class="text-h6 text-brand-primary text-weight-bold uppercase q-mb-md flex items-center"
          >
            <q-icon name="list_alt" class="q-mr-sm" />Kontrak & SPK Terkait
          </div>
          <q-card
            flat
            bordered
            class="rounded-20 shadow-sm overflow-hidden bg-white border-brand-thin"
          >
            <q-table :rows="projectSpks" :columns="spkColumns" row-key="id" flat class="spk-table">
              <template v-slot:header="props">
                <q-tr :props="props" class="bg-blue-grey-10 text-white">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    class="text-weight-bold"
                    >{{ col.label }}</q-th
                  >
                </q-tr>
              </template>
              <template v-slot:body="props">
                <q-tr
                  :props="props"
                  class="hover-bg transition-all cursor-pointer"
                  @click="openSpkDetail(props.row)"
                >
                  <q-td key="no_spk">
                    <div class="row items-center q-gutter-x-sm">
                      <span class="text-weight-bold text-brand-primary text-subtitle1">{{
                        props.row.nomor_spk
                      }}</span>
                      <q-badge
                        v-if="props.row.status === 'Approved'"
                        color="positive"
                        class="text-weight-bold text-white"
                        >APPROVED</q-badge
                      >
                    </div>
                    <div class="text-caption text-grey-7 uppercase">
                      {{ props.row.nama_kontrak }}
                    </div>
                  </q-td>
                  <q-td key="durasi">
                    <div class="text-weight-medium">
                      {{ props.row.tgl_mulai || '-' }} s/d {{ props.row.tgl_akhir || '-' }}
                    </div>
                    <div class="text-caption text-grey-6">{{ props.row.durasi || '-' }}</div>
                  </q-td>
                  <q-td key="nilai" class="text-right">
                    <div class="text-weight-black text-brand-primary text-h6">
                      Rp {{ (props.row.nilai_total || 0).toLocaleString('id-ID') }}
                    </div>
                  </q-td>
                  <q-td key="aksi" class="text-center" @click.stop>
                    <q-btn
                      unelevated
                      rounded
                      color="brand-primary"
                      icon="analytics"
                      label="Lihat Detail"
                      size="sm"
                      class="q-px-md text-weight-bold text-white"
                      @click="openSpkDetail(props.row)"
                    />
                  </q-td>
                </q-tr>
              </template>
              <template v-slot:no-data>
                <div class="full-width row flex-center q-pa-xl text-grey-5">
                  <q-icon name="description" size="64px" class="q-mb-md" />
                  <div class="text-h6 full-width text-center">Belum ada SPK untuk proyek ini.</div>
                </div>
              </template>
            </q-table>
          </q-card>
        </div>

        <!-- VIEW 3: DETAIL SPK — 4 TAB -->
        <div v-else-if="viewMode === 'spk'" class="animate-fade content-relative">
          <!-- HEADER -->
          <div class="row items-center justify-between q-mb-lg q-col-gutter-sm">
            <div class="col-12 col-sm-auto row items-center">
              <q-btn
                flat
                round
                icon="arrow_back"
                color="brand-primary"
                @click="viewMode = 'project'"
                class="q-mr-md bg-white shadow-1"
              />
              <div>
                <div class="text-h5 text-weight-black text-brand-primary uppercase">
                  Detail Kontrak
                </div>
                <div class="text-subtitle1 text-grey-7">
                  {{ currentSpk?.nomor_spk }} · {{ currentSpk?.nama_kontrak }}
                </div>
              </div>
            </div>
            <div v-if="currentSpk?.status === 'Approved'" class="col-12 col-sm-auto">
              <q-chip
                color="positive"
                text-color="white"
                icon="verified"
                class="text-weight-bold q-px-lg"
                >APPROVED</q-chip
              >
            </div>
          </div>

          <!-- SPK INFO BAR -->
          <q-card
            flat
            bordered
            class="q-mb-lg bg-white rounded-20 shadow-sm border-brand-thin overflow-hidden"
          >
            <q-card-section class="row q-col-gutter-lg q-pa-lg">
              <div class="col-12 col-md-3 border-right-sep">
                <div class="text-overline text-grey-6 text-bold">REFERENSI SPK</div>
                <div class="text-subtitle1 text-bold text-blue-grey-10">
                  {{ currentSpk?.nomor_spk }}
                </div>
                <div class="text-caption text-brand-primary q-mt-xs">
                  {{ currentSpk?.no_quotation || '-' }}
                </div>
              </div>
              <div class="col-12 col-md-3 border-right-sep">
                <div class="text-overline text-grey-6 text-bold">NAMA KONTRAK</div>
                <div class="text-subtitle1 text-brand-primary text-bold">
                  {{ currentSpk?.nama_kontrak || '-' }}
                </div>
              </div>
              <div class="col-12 col-md-3 border-right-sep">
                <div class="text-overline text-grey-6 text-bold">DURASI</div>
                <div class="text-subtitle1 text-brand-primary text-bold">
                  {{ currentSpk?.durasi || '-' }}
                </div>
                <div class="text-caption text-grey-7">
                  {{ currentSpk?.tgl_mulai }} s/d {{ currentSpk?.tgl_akhir }}
                </div>
              </div>
              <div class="col-12 col-md-3">
                <div class="text-overline text-grey-6 text-bold">NILAI KONTRAK</div>
                <div class="text-h6 text-weight-black text-brand-primary">
                  Rp {{ (currentSpk?.nilai_total || 0).toLocaleString('id-ID') }}
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- 4 TABS -->
          <q-card
            flat
            bordered
            class="rounded-20 bg-white shadow-10 overflow-hidden border-brand-thin"
          >
            <q-tabs
              v-model="activeTab"
              dense
              class="bg-brand-primary text-white"
              active-color="white"
              indicator-color="orange-9"
              align="left"
              inline-label
              style="height: 60px"
            >
              <q-tab
                name="items"
                label="Item Pekerjaan"
                icon="format_list_numbered"
                class="q-px-lg text-weight-bold"
              />
              <q-tab
                name="plan"
                label="Perencanaan Harian"
                icon="event_note"
                class="q-px-lg text-weight-bold"
              />
              <q-tab
                name="progress"
                label="Input Progres Harian"
                icon="edit_calendar"
                class="q-px-lg text-weight-bold"
              />
              <q-tab
                name="kurva"
                label="Dashboard Kurva S"
                icon="insights"
                class="q-px-lg text-weight-bold"
              />
            </q-tabs>

            <q-tab-panels v-model="activeTab" animated class="bg-grey-1">
              <!-- TAB 1: ITEM PEKERJAAN -->
              <q-tab-panel name="items" class="q-pa-lg">
                <div class="row items-center justify-between q-mb-md">
                  <div
                    class="text-subtitle1 text-weight-bold text-brand-primary uppercase flex items-center"
                  >
                    <q-icon name="format_list_numbered" class="q-mr-xs" />DAFTAR ITEM PEKERJAAN,
                    VOLUME & BOBOT
                  </div>
                  <q-btn
                    v-if="isMonitoringEditable"
                    unelevated
                    color="brand-primary"
                    icon="save"
                    label="Simpan Perubahan Item"
                    class="text-weight-bold text-white rounded-12 shadow-2"
                    @click="saveItemChanges"
                    :loading="savingItems"
                  />
                </div>

                <q-card flat bordered class="rounded-12 bg-white shadow-sm overflow-hidden">
                  <div
                    class="q-pa-md bg-brand-light text-brand-primary text-caption text-weight-bold rounded-borders q-ma-md"
                  >
                    Data item pekerjaan diambil dari BOQ kontrak SPK. Kolom
                    <b>Bobot (%)</b> dihitung otomatis = <b>(Nilai Item ÷ Grand Total) × 100</b>.
                    Total bobot harus = 100%.
                    <span v-if="isMonitoringEditable" class="q-ml-sm text-orange-9"
                      >⚠ Anda dapat menghapus item pekerjaan (SPK belum Approved).</span
                    >
                    <span v-else class="q-ml-sm text-positive"
                      >✓ SPK sudah Approved — item terkunci, tidak dapat dihapus.</span
                    >
                  </div>

                  <q-markup-table flat bordered separator="cell" class="items-table">
                    <thead>
                      <tr class="bg-blue-grey-9 text-white text-weight-bold text-center uppercase">
                        <th width="50">#</th>
                        <th class="text-left">NAMA PEKERJAAN</th>
                        <th width="100">SATUAN</th>
                        <th width="100">VOL. TOTAL</th>
                        <th width="120">HARGA SATUAN</th>
                        <th width="150">NILAI TOTAL</th>
                        <th width="110">BOBOT (%)</th>
                        <th width="140">KONTRIBUSI MAKS</th>
                        <th v-if="isMonitoringEditable" width="80">HAPUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-for="(group, gi) in currentSpk?.groups || []" :key="gi">
                        <tr class="bg-blue-grey-1">
                          <td
                            colspan="9"
                            class="text-weight-black text-brand-primary q-px-lg q-py-sm uppercase"
                          >
                            <q-icon name="folder" class="q-mr-xs" />{{ group.title }}
                          </td>
                        </tr>
                        <template v-for="(item, ii) in group.items" :key="ii">
                          <tr v-if="item.is_header" class="bg-teal-1">
                            <td class="text-center text-grey-6 text-weight-bold">—</td>
                            <td
                              colspan="7"
                              class="q-px-md text-weight-black text-brand-primary uppercase"
                            >
                              {{ item.deskripsi }}
                            </td>
                            <td v-if="isMonitoringEditable" class="text-center">
                              <q-btn
                                flat
                                round
                                color="negative"
                                icon="delete_outline"
                                size="sm"
                                @click="confirmDeleteItem(gi, ii)"
                                ><q-tooltip>Hapus baris ini</q-tooltip></q-btn
                              >
                            </td>
                          </tr>
                          <tr v-else>
                            <td class="text-center text-grey-6 text-weight-bold">{{ ii + 1 }}</td>
                            <td class="q-px-md text-weight-medium">{{ item.deskripsi }}</td>
                            <td class="text-center text-weight-bold text-brand-primary uppercase">
                              {{ item.satuan }}
                            </td>
                            <td class="text-center text-weight-bold">{{ item.volume }}</td>
                            <td class="text-right q-px-md text-weight-medium">
                              Rp {{ (item.harga_satuan || 0).toLocaleString('id-ID') }}
                            </td>
                            <td class="text-right q-px-md text-weight-bold text-brand-primary">
                              Rp
                              {{
                                ((item.volume || 0) * (item.harga_satuan || 0)).toLocaleString(
                                  'id-ID',
                                )
                              }}
                            </td>
                            <td class="text-center">
                              <span class="text-weight-black text-blue-9 text-subtitle2"
                                >{{ getItemBobot(item).toFixed(2) }}%</span
                              >
                            </td>
                            <td class="text-center">
                              <div class="row items-center q-gutter-x-xs justify-center">
                                <q-linear-progress
                                  :value="getItemBobot(item) / 100"
                                  size="8px"
                                  rounded
                                  color="brand-primary"
                                  track-color="grey-3"
                                  style="width: 70px"
                                />
                                <span class="text-caption text-weight-bold text-brand-primary"
                                  >{{ getItemBobot(item).toFixed(2) }}%</span
                                >
                              </div>
                            </td>
                            <td v-if="isMonitoringEditable" class="text-center">
                              <q-btn
                                flat
                                round
                                color="negative"
                                icon="delete_outline"
                                size="sm"
                                @click="confirmDeleteItem(gi, ii)"
                                ><q-tooltip>Hapus item ini</q-tooltip></q-btn
                              >
                            </td>
                          </tr>
                        </template>
                      </template>
                      <tr v-if="!currentSpk?.groups?.length">
                        <td
                          :colspan="isMonitoringEditable ? 9 : 8"
                          class="text-center q-pa-xl text-grey-5 italic"
                        >
                          Belum ada data item pekerjaan di SPK ini.
                        </td>
                      </tr>
                    </tbody>
                    <tfoot v-if="currentSpk?.groups?.length">
                      <tr class="bg-brand-primary text-white">
                        <td
                          colspan="5"
                          class="text-right text-weight-bold q-px-lg q-py-sm uppercase"
                        >
                          GRAND TOTAL NILAI KONTRAK
                        </td>
                        <td class="text-right q-px-md text-weight-black text-subtitle1">
                          Rp {{ grandTotalJual.toLocaleString('id-ID') }}
                        </td>
                        <td class="text-center text-weight-black text-h6">100.00%</td>
                        <td></td>
                        <td v-if="isMonitoringEditable"></td>
                      </tr>
                    </tfoot>
                  </q-markup-table>
                </q-card>
              </q-tab-panel>

              <!-- TAB 2: PERENCANAAN KUMULATIF HARIAN -->
              <q-tab-panel name="plan" class="q-pa-lg">
                <div class="row items-center justify-between q-mb-md">
                  <div
                    class="text-subtitle1 text-weight-bold text-brand-primary uppercase flex items-center"
                  >
                    <q-icon name="event_note" class="q-mr-xs" />PERENCANAAN KUMULATIF HARIAN
                  </div>
                  <q-btn
                    unelevated
                    color="brand-primary"
                    icon="save"
                    label="Simpan Rencana"
                    class="text-weight-bold text-white rounded-12 shadow-2"
                    @click="saveDailyPlan"
                    :loading="savingPlan"
                  />
                </div>

                <div
                  class="q-pa-md bg-blue-grey-1 text-blue-grey-9 text-caption text-weight-bold q-mb-md rounded-12"
                >
                  Tentukan target progres kumulatif (%) per hari sesuai rencana kerja. Nilai ini
                  menjadi garis <b>Rencana (S-Curve)</b> pada Dashboard Kurva S.
                </div>

                <q-card
                  flat
                  bordered
                  class="rounded-20 bg-white shadow-sm q-mb-lg border-brand-thin"
                >
                  <q-card-section class="q-pa-md border-bottom-subtle bg-brand-light">
                    <div class="row items-center q-gutter-md flex-wrap">
                      <div
                        class="text-weight-bold text-brand-primary uppercase font-11 tracking-widest"
                      >
                        Pengaturan Hari Rencana
                      </div>
                      <q-btn
                        v-if="currentSpk?.tgl_mulai && currentSpk?.tgl_akhir"
                        unelevated
                        size="sm"
                        color="teal-7"
                        icon="auto_fix_high"
                        label="Generate Otomatis dari Tanggal Kontrak"
                        class="text-weight-bold text-white rounded-12"
                        @click="generatePlanFromContract"
                      />
                      <q-btn
                        unelevated
                        size="sm"
                        color="blue-7"
                        icon="add_circle"
                        label="Tambah Hari Manual"
                        class="text-weight-bold text-white rounded-12"
                        @click="addPlanRow"
                      />
                      <q-btn
                        v-if="dailyPlan.length > 0"
                        flat
                        size="sm"
                        color="negative"
                        icon="delete_sweep"
                        label="Hapus Semua"
                        class="text-weight-bold rounded-12"
                        @click="dailyPlan = []"
                      />
                    </div>
                    <div
                      v-if="currentSpk?.tgl_mulai && currentSpk?.tgl_akhir"
                      class="text-caption text-grey-7 q-mt-sm"
                    >
                      Kontrak: <b>{{ currentSpk.tgl_mulai }}</b> s/d
                      <b>{{ currentSpk.tgl_akhir }}</b> ({{ contractDays }} hari kalender)
                    </div>
                  </q-card-section>
                  <q-card-section class="q-pa-lg" v-if="dailyPlan.length === 0">
                    <div class="text-center text-grey-5 q-pa-xl">
                      <q-icon name="event_busy" size="64px" class="q-mb-md" />
                      <div class="text-h6">Belum ada rencana harian.</div>
                      <div class="text-body2 q-mt-sm">
                        Klik <b>Generate Otomatis</b> atau <b>Tambah Hari Manual</b> untuk memulai.
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <q-card
                  v-if="dailyPlan.length > 0"
                  flat
                  bordered
                  class="rounded-20 bg-white shadow-sm overflow-hidden border-brand-thin"
                >
                  <div style="overflow-x: auto">
                    <table class="daily-plan-table full-width">
                      <thead>
                        <tr class="bg-brand-primary text-white">
                          <th style="min-width: 60px; width: 60px" class="text-center">NO</th>
                          <th style="min-width: 160px" class="text-center">TANGGAL</th>
                          <th style="min-width: 200px" class="text-center">TARGET KUMULATIF (%)</th>
                          <th style="min-width: 200px" class="text-center">VISUALISASI TARGET</th>
                          <th style="min-width: 80px" class="text-center">AKSI</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(row, idx) in dailyPlan"
                          :key="idx"
                          :class="idx % 2 === 0 ? 'bg-white' : 'bg-grey-1'"
                        >
                          <td class="text-center text-weight-bold text-grey-6 q-pa-sm">
                            {{ idx + 1 }}
                          </td>
                          <td class="q-pa-sm">
                            <q-input
                              borderless
                              dense
                              v-model="row.tanggal"
                              type="date"
                              input-class="text-center text-weight-bold text-brand-primary"
                              style="min-width: 140px"
                            />
                          </td>
                          <td class="q-pa-sm">
                            <div class="row items-center q-gutter-x-sm justify-center">
                              <q-input
                                borderless
                                dense
                                v-model.number="row.rencana_kumulatif"
                                type="number"
                                min="0"
                                max="100"
                                input-class="text-center text-weight-black text-h6 text-brand-primary"
                                style="min-width: 100px"
                                @update:model-value="clampPlan(row)"
                              />
                              <span class="text-weight-bold text-grey-7">%</span>
                            </div>
                          </td>
                          <td class="q-pa-sm">
                            <div class="row items-center q-gutter-x-sm">
                              <q-linear-progress
                                :value="(row.rencana_kumulatif || 0) / 100"
                                size="12px"
                                rounded
                                color="brand-primary"
                                track-color="grey-3"
                                style="flex: 1"
                              />
                              <span
                                class="text-caption text-weight-bold text-brand-primary"
                                style="min-width: 42px; text-align: right"
                                >{{ (row.rencana_kumulatif || 0).toFixed(1) }}%</span
                              >
                            </div>
                          </td>
                          <td class="text-center q-pa-sm">
                            <q-btn
                              flat
                              round
                              color="negative"
                              icon="delete"
                              size="sm"
                              @click="dailyPlan.splice(idx, 1)"
                            />
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr class="bg-brand-primary text-white">
                          <td
                            colspan="2"
                            class="text-right q-px-lg q-py-sm text-weight-bold uppercase"
                          >
                            Target Akhir (Hari Terakhir)
                          </td>
                          <td class="text-center text-weight-black text-h6">
                            {{
                              dailyPlan.length
                                ? (dailyPlan[dailyPlan.length - 1].rencana_kumulatif || 0).toFixed(
                                    2,
                                  )
                                : 0
                            }}%
                          </td>
                          <td colspan="2"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </q-card>
              </q-tab-panel>

              <!-- TAB 3: INPUT PROGRES HARIAN -->
              <q-tab-panel name="progress" class="q-pa-lg">
                <div class="row items-center justify-between q-mb-md">
                  <div
                    class="text-subtitle1 text-weight-bold text-brand-primary uppercase flex items-center"
                  >
                    <q-icon name="edit_calendar" class="q-mr-xs" />INPUT PROGRES AKTUAL HARIAN
                  </div>
                  <div class="row q-gutter-sm items-center">
                    <q-btn
                      unelevated
                      size="sm"
                      color="blue-7"
                      icon="add_circle"
                      label="Tambah Hari"
                      class="text-weight-bold text-white rounded-12"
                      @click="addProgressRow"
                    />
                    <q-btn
                      unelevated
                      color="brand-primary"
                      icon="save"
                      label="Simpan Progres"
                      class="text-weight-bold text-white rounded-12 shadow-2"
                      @click="saveDailyProgress"
                      :loading="savingProgress"
                    />
                  </div>
                </div>

                <div
                  class="q-pa-md bg-blue-grey-1 text-blue-grey-9 text-caption text-weight-bold q-mb-md rounded-12"
                >
                  Isi <b>Volume Aktual</b> yang sudah dikerjakan per item per hari. Persentase
                  aktual dihitung otomatis: <b>(Vol. Aktual ÷ Vol. Total) × Bobot</b>, lalu dijumlah
                  semua item.
                </div>

                <div
                  v-if="allFlatItems.length === 0"
                  class="text-center text-grey-5 q-pa-xl bg-white rounded-20"
                >
                  <q-icon name="list_alt" size="64px" class="q-mb-md" />
                  <div class="text-h6">Belum ada item pekerjaan di SPK ini.</div>
                  <div class="text-body2 q-mt-sm">
                    Isi BOQ terlebih dahulu di halaman Master Proyek.
                  </div>
                </div>

                <div v-else>
                  <div class="row q-col-gutter-md q-mb-lg">
                    <div class="col-6 col-md-3">
                      <q-card flat class="rounded-12 bg-blue-grey-9 text-white q-pa-md text-center">
                        <div class="text-overline opacity-75">PROGRES AKTUAL</div>
                        <div class="text-h5 text-weight-black q-mt-xs">
                          {{ actualCumulative.toFixed(2) }}%
                        </div>
                        <div class="text-caption opacity-70">Total kumulatif</div>
                      </q-card>
                    </div>
                    <div class="col-6 col-md-3">
                      <q-card flat class="rounded-12 bg-positive text-white q-pa-md text-center">
                        <div class="text-overline opacity-75">RENCANA HARI INI</div>
                        <div class="text-h5 text-weight-black q-mt-xs">
                          {{ plannedForToday.toFixed(2) }}%
                        </div>
                        <div class="text-caption opacity-70">{{ todayStr }}</div>
                      </q-card>
                    </div>
                    <div class="col-6 col-md-3">
                      <q-card
                        flat
                        :class="deviasi >= 0 ? 'bg-blue-8' : 'bg-negative'"
                        class="rounded-12 text-white q-pa-md text-center"
                      >
                        <div class="text-overline opacity-75">DEVIASI</div>
                        <div class="text-h5 text-weight-black q-mt-xs">
                          {{ deviasi >= 0 ? '+' : '' }}{{ deviasi.toFixed(2) }}%
                        </div>
                        <div class="text-caption opacity-70">
                          {{ deviasi >= 0 ? 'On Track' : 'Behind' }}
                        </div>
                      </q-card>
                    </div>
                    <div class="col-6 col-md-3">
                      <q-card flat class="rounded-12 bg-orange-9 text-white q-pa-md text-center">
                        <div class="text-overline opacity-75">TOTAL HARI INPUT</div>
                        <div class="text-h5 text-weight-black q-mt-xs">
                          {{ dailyProgress.length }}
                        </div>
                        <div class="text-caption opacity-70">Hari tercatat</div>
                      </q-card>
                    </div>
                  </div>

                  <q-card
                    flat
                    bordered
                    class="rounded-20 bg-white shadow-sm overflow-hidden border-brand-thin"
                  >
                    <div style="overflow-x: auto">
                      <table class="progress-input-table full-width">
                        <thead>
                          <tr class="bg-blue-grey-9 text-white">
                            <th class="sticky-col text-center" style="min-width: 60px">NO</th>
                            <th class="sticky-col2 text-center" style="min-width: 160px">
                              TANGGAL
                            </th>
                            <th class="text-center" style="min-width: 140px">KONTRIBUSI (%)</th>
                            <template v-for="(item, idx) in allFlatItems" :key="idx">
                              <th class="text-center" style="min-width: 140px">
                                <div class="text-weight-bold">{{ item.deskripsi }}</div>
                                <div class="text-caption opacity-75">
                                  {{ item.satuan }} / Total: {{ item.volume }}
                                </div>
                                <div class="text-caption opacity-60">
                                  Bobot: {{ getItemBobot(item).toFixed(2) }}%
                                </div>
                              </th>
                            </template>
                            <th class="text-center" style="min-width: 60px">DEL</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(dayRow, dIdx) in dailyProgress"
                            :key="dIdx"
                            :class="dIdx % 2 === 0 ? 'bg-white' : 'bg-grey-1'"
                          >
                            <td class="sticky-col text-center text-weight-bold text-grey-6 q-pa-sm">
                              {{ dIdx + 1 }}
                            </td>
                            <td class="sticky-col2 q-pa-xs">
                              <q-input
                                borderless
                                dense
                                v-model="dayRow.tanggal"
                                type="date"
                                input-class="text-center text-weight-bold text-brand-primary"
                              />
                            </td>
                            <td class="text-center q-pa-sm">
                              <span
                                class="text-weight-black text-subtitle2"
                                :class="getDayContrib(dIdx) > 0 ? 'text-positive' : 'text-grey-5'"
                                >{{ getDayContrib(dIdx).toFixed(3) }}%</span
                              >
                            </td>
                            <template v-for="(item, iIdx) in allFlatItems" :key="iIdx">
                              <td class="q-pa-xs">
                                <q-input
                                  borderless
                                  dense
                                  v-model.number="dayRow.volumes[iIdx]"
                                  type="number"
                                  min="0"
                                  :max="item.volume"
                                  input-class="text-center text-weight-bold"
                                  style="min-width: 110px"
                                  @update:model-value="clampProgressVol(dayRow, iIdx, item.volume)"
                                />
                              </td>
                            </template>
                            <td class="text-center q-pa-sm">
                              <q-btn
                                flat
                                round
                                color="negative"
                                icon="delete"
                                size="sm"
                                @click="dailyProgress.splice(dIdx, 1)"
                              />
                            </td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr class="bg-blue-grey-8 text-white">
                            <td
                              colspan="2"
                              class="text-right text-weight-bold q-px-lg q-py-sm uppercase"
                            >
                              TOTAL VOLUME AKTUAL KUMULATIF
                            </td>
                            <td class="text-center text-weight-black text-green-4 text-h6">
                              {{ actualCumulative.toFixed(3) }}%
                            </td>
                            <template v-for="(item, iIdx) in allFlatItems" :key="iIdx">
                              <td class="text-center text-weight-bold text-amber">
                                {{ getTotalActualVolByItem(iIdx) }} / {{ item.volume }}
                              </td>
                            </template>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </q-card>

                  <div class="q-mt-lg">
                    <div
                      class="text-subtitle2 text-weight-bold text-brand-primary uppercase q-mb-md"
                    >
                      RINGKASAN PROGRES PER ITEM
                    </div>
                    <q-card
                      flat
                      bordered
                      class="rounded-20 bg-white shadow-sm overflow-hidden border-brand-thin"
                    >
                      <q-markup-table flat dark class="bg-blue-grey-10">
                        <thead>
                          <tr
                            class="bg-blue-grey-8 text-white text-caption text-weight-bold uppercase"
                          >
                            <th class="text-left">ITEM PEKERJAAN</th>
                            <th class="text-center">SATUAN</th>
                            <th class="text-center">VOL. TOTAL</th>
                            <th class="text-center">VOL. AKTUAL</th>
                            <th class="text-center">% SELESAI</th>
                            <th class="text-center">BOBOT (%)</th>
                            <th class="text-center">KONTRIBUSI %</th>
                            <th class="text-right">PROGRESS</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(item, idx) in allFlatItems"
                            :key="idx"
                            :class="idx % 2 === 0 ? 'bg-blue-grey-10' : 'bg-blue-grey-9'"
                          >
                            <td class="text-weight-bold text-white">{{ item.deskripsi }}</td>
                            <td class="text-center text-grey-4">{{ item.satuan }}</td>
                            <td class="text-center text-grey-4">{{ item.volume }}</td>
                            <td class="text-center">
                              <span
                                class="text-weight-bold"
                                :class="
                                  getTotalActualVolByItem(idx) > 0 ? 'text-amber' : 'text-grey-5'
                                "
                                >{{ getTotalActualVolByItem(idx) }}</span
                              >
                            </td>
                            <td class="text-center">
                              <span
                                class="text-weight-bold"
                                :class="getItemPct(idx) > 0 ? 'text-amber' : 'text-red-4'"
                                >{{ getItemPct(idx).toFixed(1) }}%</span
                              >
                            </td>
                            <td class="text-center text-grey-4">
                              {{ getItemBobot(item).toFixed(2) }}%
                            </td>
                            <td class="text-center">
                              <span
                                class="text-weight-bold"
                                :class="getItemContrib(idx) > 0 ? 'text-green-4' : 'text-grey-5'"
                                >{{ getItemContrib(idx).toFixed(3) }}%</span
                              >
                            </td>
                            <td class="text-right q-pr-md">
                              <q-linear-progress
                                :value="getItemPct(idx) / 100"
                                size="8px"
                                rounded
                                color="amber"
                                track-color="blue-grey-7"
                                style="min-width: 80px"
                              />
                            </td>
                          </tr>
                          <tr class="bg-blue-grey-8">
                            <td
                              colspan="6"
                              class="text-right text-weight-bold text-white q-pr-md uppercase"
                            >
                              TOTAL AKTUAL KUMULATIF
                            </td>
                            <td class="text-center text-weight-black text-green-4 text-h6">
                              {{ actualCumulative.toFixed(3) }}%
                            </td>
                            <td></td>
                          </tr>
                        </tbody>
                      </q-markup-table>
                    </q-card>
                  </div>
                </div>
              </q-tab-panel>

              <!-- TAB 4: DASHBOARD KURVA S -->
              <q-tab-panel name="kurva" class="q-pa-lg">
                <div class="row q-col-gutter-md q-mb-lg">
                  <div class="col-6 col-md-3">
                    <q-card flat class="rounded-12 bg-blue-grey-9 text-white q-pa-md text-center">
                      <div class="text-overline opacity-75">RENCANA S/D HARI INI</div>
                      <div class="text-h5 text-weight-black q-mt-xs">
                        {{ plannedForToday.toFixed(2) }}%
                      </div>
                      <div class="text-caption opacity-70">{{ todayStr }}</div>
                    </q-card>
                  </div>
                  <div class="col-6 col-md-3">
                    <q-card flat class="rounded-12 bg-positive text-white q-pa-md text-center">
                      <div class="text-overline opacity-75">PROGRES AKTUAL</div>
                      <div class="text-h5 text-weight-black q-mt-xs">
                        {{ actualCumulative.toFixed(2) }}%
                      </div>
                      <div class="text-caption opacity-70">Kumulatif dari input</div>
                    </q-card>
                  </div>
                  <div class="col-6 col-md-3">
                    <q-card
                      flat
                      :class="deviasi >= 0 ? 'bg-blue-8' : 'bg-negative'"
                      class="rounded-12 text-white q-pa-md text-center"
                    >
                      <div class="text-overline opacity-75">DEVIASI</div>
                      <div class="text-h5 text-weight-black q-mt-xs">
                        {{ deviasi >= 0 ? '+' : '' }}{{ deviasi.toFixed(2) }}%
                      </div>
                      <div class="text-caption opacity-70">
                        {{ deviasi >= 0 ? 'On Track' : 'Behind Schedule' }}
                      </div>
                    </q-card>
                  </div>
                  <div class="col-6 col-md-3">
                    <q-card flat class="rounded-12 bg-orange-9 text-white q-pa-md text-center">
                      <div class="text-overline opacity-75">TOTAL HARI RENCANA</div>
                      <div class="text-h5 text-weight-black q-mt-xs">{{ dailyPlan.length }}</div>
                      <div class="text-caption opacity-70">Dari perencanaan</div>
                    </q-card>
                  </div>
                </div>

                <!-- KURVA S CHART -->
                <div class="row q-col-gutter-md q-mb-lg">
                  <div class="col-12 col-md-8">
                    <q-card
                      flat
                      bordered
                      class="rounded-20 bg-blue-grey-10 shadow-sm overflow-hidden"
                    >
                      <q-card-section class="q-pb-xs">
                        <div class="row items-center justify-between">
                          <div
                            class="text-overline text-white text-weight-bold flex items-center q-gutter-x-md"
                          >
                            <span>KURVA S — BOBOT KUMULATIF (%)</span>
                            <div class="row q-gutter-x-md q-ml-md">
                              <div class="row items-center q-gutter-x-xs">
                                <div
                                  style="
                                    width: 24px;
                                    height: 3px;
                                    background: #36ada3;
                                    border-radius: 2px;
                                  "
                                ></div>
                                <span class="text-caption text-grey-4">Rencana</span>
                              </div>
                              <div class="row items-center q-gutter-x-xs">
                                <div
                                  style="
                                    width: 24px;
                                    height: 3px;
                                    background: #f29c1f;
                                    border-radius: 2px;
                                  "
                                ></div>
                                <span class="text-caption text-grey-4">Aktual</span>
                              </div>
                            </div>
                          </div>
                          <q-btn
                            flat
                            round
                            dense
                            icon="fullscreen"
                            color="grey-4"
                            @click="isFullscreenChart = true"
                          >
                            <q-tooltip>Perbesar Kurva S</q-tooltip>
                          </q-btn>
                        </div>
                      </q-card-section>
                      <q-card-section class="q-pt-none" @click.self="closePointInfo">
                        <div class="full-width" style="overflow-x: auto">
                          <svg
                            :viewBox="`0 0 ${chartW} ${chartH}`"
                            style="
                              min-width: 600px;
                              width: 100%;
                              max-height: 350px;
                              overflow: visible;
                            "
                            @click="closePointInfo"
                          >
                            <!-- Grid Y -->
                            <template v-for="i in 11" :key="'gy' + i">
                              <line
                                :x1="chartPad"
                                :y1="chartPad + ((i - 1) * (chartH - chartPad * 2)) / 10"
                                :x2="chartW - chartPad * 0.5"
                                :y2="chartPad + ((i - 1) * (chartH - chartPad * 2)) / 10"
                                stroke="rgba(255,255,255,0.08)"
                                stroke-width="1"
                              />
                              <text
                                :x="chartPad - 6"
                                :y="chartPad + ((i - 1) * (chartH - chartPad * 2)) / 10 + 4"
                                text-anchor="end"
                                fill="rgba(255,255,255,0.4)"
                                font-size="9"
                              >
                                {{ 100 - (i - 1) * 10 }}%
                              </text>
                            </template>
                            <!-- X labels -->
                            <template v-for="(lbl, li) in chartXLabels" :key="'xl' + li">
                              <text
                                :x="
                                  chartPad +
                                  (li * (chartW - chartPad * 1.5)) /
                                    Math.max(chartXLabels.length - 1, 1)
                                "
                                :y="chartH - chartPad * 0.3"
                                text-anchor="middle"
                                fill="rgba(255,255,255,0.4)"
                                font-size="7"
                              >
                                {{ lbl }}
                              </text>
                            </template>
                            <!-- Area rencana -->
                            <polygon
                              v-if="plannedPoints.length > 1"
                              :points="
                                `${chartPad},${chartH - chartPad} ` +
                                plannedPoints.map((p) => `${p[0]},${p[1]}`).join(' ') +
                                ` ${plannedPoints[plannedPoints.length - 1][0]},${chartH - chartPad}`
                              "
                              fill="rgba(54,173,163,0.08)"
                            />
                            <!-- Rencana line -->
                            <polyline
                              v-if="plannedPoints.length > 1"
                              :points="plannedPoints.map((p) => `${p[0]},${p[1]}`).join(' ')"
                              fill="none"
                              stroke="#36ada3"
                              stroke-width="2.5"
                              stroke-linejoin="round"
                            />
                            <!-- Area aktual -->
                            <polygon
                              v-if="actualChartPoints.length > 1"
                              :points="
                                `${chartPad},${chartH - chartPad} ` +
                                actualChartPoints.map((p) => `${p[0]},${p[1]}`).join(' ') +
                                ` ${actualChartPoints[actualChartPoints.length - 1][0]},${chartH - chartPad}`
                              "
                              fill="rgba(242,156,31,0.12)"
                            />
                            <!-- Aktual line -->
                            <polyline
                              v-if="actualChartPoints.length > 1"
                              :points="actualChartPoints.map((p) => `${p[0]},${p[1]}`).join(' ')"
                              fill="none"
                              stroke="#f29c1f"
                              stroke-width="2.5"
                              stroke-linejoin="round"
                            />

                            <!-- Dots Rencana untuk Click Info -->
                            <template v-for="(pt, pi) in plannedPoints" :key="'pdot' + pi">
                              <circle
                                :cx="pt[0]"
                                :cy="pt[1]"
                                r="6"
                                fill="#36ada3"
                                stroke="#102a43"
                                stroke-width="1.5"
                                class="cursor-pointer transition-all hover-dot"
                                @click="togglePointInfo(pt, 'Rencana')"
                              />
                            </template>

                            <!-- Dots Aktual untuk Click Info -->
                            <template v-for="(pt, pi) in actualChartPoints" :key="'dot' + pi">
                              <circle
                                :cx="pt[0]"
                                :cy="pt[1]"
                                r="6"
                                fill="#f29c1f"
                                stroke="#102a43"
                                stroke-width="1.5"
                                class="cursor-pointer transition-all hover-dot"
                                @click="togglePointInfo(pt, 'Aktual')"
                              />
                            </template>

                            <!-- Floating Popup -->
                            <foreignObject
                              v-if="selectedPointInfo"
                              :x="selectedPointInfo.x - 70"
                              :y="selectedPointInfo.y - 80"
                              width="140"
                              height="75"
                              style="pointer-events: none"
                            >
                              <div
                                class="bg-blue-grey-9 text-white font-pro shadow-4 rounded-12 q-pa-sm text-center"
                                :style="
                                  'border: 2px solid ' +
                                  (selectedPointInfo.type === 'Rencana' ? '#36ada3' : '#f29c1f')
                                "
                              >
                                <div
                                  class="text-caption text-weight-bolder leading-none q-mb-xs"
                                  :style="{
                                    color:
                                      selectedPointInfo.type === 'Rencana' ? '#36ada3' : '#f29c1f',
                                  }"
                                >
                                  {{
                                    selectedPointInfo.type === 'Rencana'
                                      ? 'TARGET RENCANA'
                                      : 'PROGRES AKTUAL'
                                  }}
                                </div>
                                <div class="text-subtitle1 text-weight-black leading-none">
                                  {{ selectedPointInfo.pct }}%
                                </div>
                                <div
                                  class="text-caption text-grey-4 q-mt-xs"
                                  style="font-size: 10px; line-height: 1"
                                >
                                  {{ selectedPointInfo.date }}
                                </div>
                              </div>
                            </foreignObject>

                            <!-- TODAY marker -->
                            <template v-if="todayPlannedPoint">
                              <circle
                                :cx="todayPlannedPoint[0]"
                                :cy="todayPlannedPoint[1]"
                                r="5"
                                fill="#36ada3"
                                stroke="#fff"
                                stroke-width="2"
                              />
                              <line
                                :x1="todayPlannedPoint[0]"
                                :y1="chartPad"
                                :x2="todayPlannedPoint[0]"
                                :y2="chartH - chartPad"
                                stroke="rgba(255,255,255,0.2)"
                                stroke-width="1"
                                stroke-dasharray="4,4"
                              />
                            </template>
                            <text
                              v-if="todayPlannedPoint"
                              :x="todayPlannedPoint[0]"
                              :y="chartPad - 4"
                              text-anchor="middle"
                              fill="rgba(255,255,255,0.5)"
                              font-size="8"
                            >
                              TODAY
                            </text>
                          </svg>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                  <div class="col-12 col-md-4">
                    <q-card flat bordered class="rounded-20 bg-blue-grey-10 shadow-sm h-full">
                      <q-card-section>
                        <div class="text-overline text-white text-weight-bold q-mb-md">
                          STATUS PROYEK
                        </div>
                        <div class="q-gutter-y-md">
                          <div class="bg-blue-grey-9 rounded-12 q-pa-md">
                            <div class="text-caption text-grey-5">Nama Proyek</div>
                            <div class="text-white text-weight-bold">
                              {{ currentProject?.nama || '—' }}
                            </div>
                          </div>
                          <div class="bg-blue-grey-9 rounded-12 q-pa-md">
                            <div class="text-caption text-grey-5">Kontrak</div>
                            <div class="text-white text-weight-bold">
                              {{ currentSpk?.nomor_spk || '—' }}
                            </div>
                          </div>
                          <div class="bg-blue-grey-9 rounded-12 q-pa-md">
                            <div class="text-caption text-grey-5">Nilai Kontrak</div>
                            <div class="text-white text-weight-bold">
                              Rp {{ formatCompact(currentSpk?.nilai_total || 0) }}
                            </div>
                          </div>
                          <div class="bg-blue-grey-9 rounded-12 q-pa-md">
                            <div class="text-caption text-grey-5">Durasi / Periode</div>
                            <div class="text-white text-weight-bold">
                              {{ currentSpk?.durasi || '—' }}
                            </div>
                          </div>
                          <div
                            class="rounded-12 q-pa-md"
                            :class="deviasi >= 0 ? 'bg-positive' : 'bg-negative'"
                          >
                            <div class="text-caption text-white opacity-80">Deviasi Kumulatif</div>
                            <div class="text-h5 text-white text-weight-black">
                              {{ deviasi >= 0 ? '+' : '' }}{{ deviasi.toFixed(3) }}%
                            </div>
                            <q-badge
                              color="white"
                              :text-color="deviasi >= 0 ? 'positive' : 'negative'"
                              class="q-mt-xs text-weight-bold"
                              >{{ deviasi >= 0 ? 'On Track' : 'Behind Schedule' }}</q-badge
                            >
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <!-- TABEL PERBANDINGAN -->
                <q-card flat bordered class="rounded-20 bg-blue-grey-10 shadow-sm overflow-hidden">
                  <q-card-section class="q-pb-xs">
                    <div class="text-overline text-white text-weight-bold">
                      PERBANDINGAN RENCANA VS AKTUAL PER HARI
                    </div>
                  </q-card-section>
                  <q-markup-table flat dark class="bg-blue-grey-10">
                    <thead>
                      <tr class="bg-blue-grey-8 text-white text-caption text-weight-bold uppercase">
                        <th class="text-center">HARI</th>
                        <th class="text-center">TANGGAL</th>
                        <th class="text-center">RENCANA (%)</th>
                        <th class="text-center">AKTUAL (%)</th>
                        <th class="text-center">DEVIASI</th>
                        <th class="text-center">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(planRow, pIdx) in dailyPlan"
                        :key="pIdx"
                        :class="pIdx % 2 === 0 ? 'bg-blue-grey-10' : 'bg-blue-grey-9'"
                      >
                        <td class="text-center text-weight-bold text-white">{{ pIdx + 1 }}</td>
                        <td class="text-center text-grey-4">{{ planRow.tanggal }}</td>
                        <td class="text-center text-weight-bold text-teal-4">
                          {{ (planRow.rencana_kumulatif || 0).toFixed(2) }}%
                        </td>
                        <td class="text-center text-weight-bold text-amber">
                          {{ getRowActual(planRow.tanggal).toFixed(2) }}%
                        </td>
                        <td
                          class="text-center text-weight-bold"
                          :class="
                            getRowDeviasi(planRow.tanggal, planRow.rencana_kumulatif) > 0
                              ? 'text-green-4'
                              : getRowDeviasi(planRow.tanggal, planRow.rencana_kumulatif) < 0
                                ? 'text-red-4'
                                : 'text-grey-5'
                          "
                        >
                          {{
                            getRowDeviasi(planRow.tanggal, planRow.rencana_kumulatif) > 0
                              ? '+'
                              : ''
                          }}{{
                            getRowDeviasi(planRow.tanggal, planRow.rencana_kumulatif).toFixed(2)
                          }}%
                        </td>
                        <td class="text-center">
                          <q-badge
                            :color="getRowStatus(planRow.tanggal, planRow.rencana_kumulatif).color"
                            class="text-white text-weight-bold q-px-sm"
                          >
                            {{ getRowStatus(planRow.tanggal, planRow.rencana_kumulatif).label }}
                          </q-badge>
                        </td>
                      </tr>
                      <tr v-if="dailyPlan.length === 0">
                        <td colspan="6" class="text-center text-grey-5 italic q-pa-xl">
                          Belum ada data perencanaan harian.
                        </td>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </q-card>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>
      </template>

      <!-- DIALOG FULLSCREEN KURVA S -->
      <q-dialog
        v-model="isFullscreenChart"
        maximized
        transition-show="slide-up"
        transition-hide="slide-down"
      >
        <q-card class="bg-blue-grey-10 text-white column no-wrap font-pro">
          <q-toolbar class="bg-blue-grey-9 q-py-md shadow-2">
            <q-icon name="insights" size="md" color="brand-primary" class="q-mr-sm" />
            <q-toolbar-title class="text-weight-bolder"
              >KURVA S FULLSCREEN — {{ currentProject?.nama }}</q-toolbar-title
            >
            <q-btn flat round dense icon="close" v-close-popup />
          </q-toolbar>

          <!-- KPI CARDS IN FULLSCREEN -->
          <q-card-section class="q-px-xl q-pt-xl q-pb-none">
            <div class="row q-col-gutter-md">
              <div class="col-6 col-md-3">
                <q-card
                  flat
                  class="rounded-12 bg-blue-grey-9 text-white q-pa-md text-center shadow-1"
                >
                  <div class="text-overline opacity-75">RENCANA S/D HARI INI</div>
                  <div class="text-h5 text-weight-black q-mt-xs">
                    {{ plannedForToday.toFixed(2) }}%
                  </div>
                  <div class="text-caption opacity-70">{{ todayStr }}</div>
                </q-card>
              </div>
              <div class="col-6 col-md-3">
                <q-card flat class="rounded-12 bg-positive text-white q-pa-md text-center shadow-1">
                  <div class="text-overline opacity-75">PROGRES AKTUAL</div>
                  <div class="text-h5 text-weight-black q-mt-xs">
                    {{ actualCumulative.toFixed(2) }}%
                  </div>
                  <div class="text-caption opacity-70">Kumulatif dari input</div>
                </q-card>
              </div>
              <div class="col-6 col-md-3">
                <q-card
                  flat
                  :class="deviasi >= 0 ? 'bg-blue-8' : 'bg-negative'"
                  class="rounded-12 text-white q-pa-md text-center shadow-1"
                >
                  <div class="text-overline opacity-75">DEVIASI</div>
                  <div class="text-h5 text-weight-black q-mt-xs">
                    {{ deviasi >= 0 ? '+' : '' }}{{ deviasi.toFixed(2) }}%
                  </div>
                  <div class="text-caption opacity-70">
                    {{ deviasi >= 0 ? 'On Track' : 'Behind Schedule' }}
                  </div>
                </q-card>
              </div>
              <div class="col-6 col-md-3">
                <q-card flat class="rounded-12 bg-orange-9 text-white q-pa-md text-center shadow-1">
                  <div class="text-overline opacity-75">TOTAL HARI RENCANA</div>
                  <div class="text-h5 text-weight-black q-mt-xs">{{ dailyPlan.length }}</div>
                  <div class="text-caption opacity-70">Dari perencanaan</div>
                </q-card>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="col flex flex-center q-pa-xl" @click.self="closePointInfo">
            <div class="full-width" style="max-width: 1200px">
              <svg
                :viewBox="`0 0 ${chartW} ${chartH}`"
                style="width: 100%; max-height: 80vh; overflow: visible"
                @click="closePointInfo"
              >
                <!-- Grid Y -->
                <template v-for="i in 11" :key="'gy_full' + i">
                  <line
                    :x1="chartPad"
                    :y1="chartPad + ((i - 1) * (chartH - chartPad * 2)) / 10"
                    :x2="chartW - chartPad * 0.5"
                    :y2="chartPad + ((i - 1) * (chartH - chartPad * 2)) / 10"
                    stroke="rgba(255,255,255,0.08)"
                    stroke-width="1"
                  />
                  <text
                    :x="chartPad - 6"
                    :y="chartPad + ((i - 1) * (chartH - chartPad * 2)) / 10 + 4"
                    text-anchor="end"
                    fill="rgba(255,255,255,0.6)"
                    font-size="9"
                    font-weight="bold"
                  >
                    {{ 100 - (i - 1) * 10 }}%
                  </text>
                </template>
                <!-- X labels -->
                <template v-for="(lbl, li) in chartXLabels" :key="'xl_full' + li">
                  <text
                    :x="
                      chartPad +
                      (li * (chartW - chartPad * 1.5)) / Math.max(chartXLabels.length - 1, 1)
                    "
                    :y="chartH - chartPad * 0.2"
                    text-anchor="middle"
                    fill="rgba(255,255,255,0.6)"
                    font-size="8"
                    font-weight="bold"
                  >
                    {{ lbl }}
                  </text>
                </template>
                <!-- Area rencana -->
                <polygon
                  v-if="plannedPoints.length > 1"
                  :points="
                    `${chartPad},${chartH - chartPad} ` +
                    plannedPoints.map((p) => `${p[0]},${p[1]}`).join(' ') +
                    ` ${plannedPoints[plannedPoints.length - 1][0]},${chartH - chartPad}`
                  "
                  fill="rgba(54,173,163,0.08)"
                />
                <!-- Rencana line -->
                <polyline
                  v-if="plannedPoints.length > 1"
                  :points="plannedPoints.map((p) => `${p[0]},${p[1]}`).join(' ')"
                  fill="none"
                  stroke="#36ada3"
                  stroke-width="3"
                  stroke-linejoin="round"
                />
                <!-- Area aktual -->
                <polygon
                  v-if="actualChartPoints.length > 1"
                  :points="
                    `${chartPad},${chartH - chartPad} ` +
                    actualChartPoints.map((p) => `${p[0]},${p[1]}`).join(' ') +
                    ` ${actualChartPoints[actualChartPoints.length - 1][0]},${chartH - chartPad}`
                  "
                  fill="rgba(242,156,31,0.12)"
                />
                <!-- Aktual line -->
                <polyline
                  v-if="actualChartPoints.length > 1"
                  :points="actualChartPoints.map((p) => `${p[0]},${p[1]}`).join(' ')"
                  fill="none"
                  stroke="#f29c1f"
                  stroke-width="3"
                  stroke-linejoin="round"
                />

                <!-- Dots Rencana untuk Click Info -->
                <template v-for="(pt, pi) in plannedPoints" :key="'pdot_full' + pi">
                  <circle
                    :cx="pt[0]"
                    :cy="pt[1]"
                    r="7"
                    fill="#36ada3"
                    stroke="#102a43"
                    stroke-width="2"
                    class="cursor-pointer transition-all hover-dot"
                    @click.stop="togglePointInfo(pt, 'Rencana')"
                  />
                </template>

                <!-- Dots Aktual untuk Click Info -->
                <template v-for="(pt, pi) in actualChartPoints" :key="'dot_full' + pi">
                  <circle
                    :cx="pt[0]"
                    :cy="pt[1]"
                    r="7"
                    fill="#f29c1f"
                    stroke="#102a43"
                    stroke-width="2"
                    class="cursor-pointer transition-all hover-dot"
                    @click.stop="togglePointInfo(pt, 'Aktual')"
                  />
                </template>

                <!-- Floating Popup -->
                <foreignObject
                  v-if="selectedPointInfo"
                  :x="selectedPointInfo.x - 70"
                  :y="selectedPointInfo.y - 80"
                  width="140"
                  height="75"
                  style="pointer-events: none"
                >
                  <div
                    class="bg-blue-grey-9 text-white font-pro shadow-4 rounded-12 q-pa-sm text-center"
                    :style="
                      'border: 2px solid ' +
                      (selectedPointInfo.type === 'Rencana' ? '#36ada3' : '#f29c1f')
                    "
                  >
                    <div
                      class="text-caption text-weight-bolder leading-none q-mb-xs"
                      :style="{
                        color: selectedPointInfo.type === 'Rencana' ? '#36ada3' : '#f29c1f',
                      }"
                    >
                      {{
                        selectedPointInfo.type === 'Rencana' ? 'TARGET RENCANA' : 'PROGRES AKTUAL'
                      }}
                    </div>
                    <div class="text-subtitle1 text-weight-black leading-none">
                      {{ selectedPointInfo.pct }}%
                    </div>
                    <div
                      class="text-caption text-grey-4 q-mt-xs"
                      style="font-size: 10px; line-height: 1"
                    >
                      {{ selectedPointInfo.date }}
                    </div>
                  </div>
                </foreignObject>

                <!-- TODAY marker -->
                <template v-if="todayPlannedPoint">
                  <circle
                    :cx="todayPlannedPoint[0]"
                    :cy="todayPlannedPoint[1]"
                    r="6"
                    fill="#36ada3"
                    stroke="#fff"
                    stroke-width="2"
                  />
                  <line
                    :x1="todayPlannedPoint[0]"
                    :y1="chartPad"
                    :x2="todayPlannedPoint[0]"
                    :y2="chartH - chartPad"
                    stroke="rgba(255,255,255,0.3)"
                    stroke-width="1.5"
                    stroke-dasharray="4,4"
                  />
                </template>
                <text
                  v-if="todayPlannedPoint"
                  :x="todayPlannedPoint[0]"
                  :y="chartPad - 6"
                  text-anchor="middle"
                  fill="rgba(255,255,255,0.7)"
                  font-size="10"
                  font-weight="bold"
                >
                  TODAY
                </text>
              </svg>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>

      <div class="q-py-xl"></div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
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

defineOptions({
  name: 'ManufactureMonitoringProjectPage',
})

const $q = useQuasar()
const authStore = useAuthStore()

// ============================================================
// STATE
// ============================================================
const loading = ref(true)
const savingPlan = ref(false)
const savingProgress = ref(false)
const savingItems = ref(false)
const searchQuery = ref('')
const viewMode = ref('list')
const activeTab = ref('items')
const isFullscreenChart = ref(false) // Untuk modal fullscreen Kurva S

const rawProjects = ref([])
const allSpksCache = ref([])
const primarySpksCache = ref([])
const legacySpksCache = ref([])
const projectSpks = ref([])

const currentProject = ref(null)
const currentSpk = ref(null)
const userData = ref(null)

const dailyPlan = ref([])
const dailyProgress = ref([])

let unsubProyek = null
let unsubAllSpk = null
let unsubLegacySpk = null
let unsubUser = null

const todayStr = new Date().toISOString().slice(0, 10)
const PROJECTS_COLLECTION = 'mf_projects'
const PROJECT_MONITORING_COLLECTION = 'mf_project_monitoring'
const LEGACY_PROJECT_MONITORING_COLLECTION = 'manufactur_master_proyek_spk'

const getProjectRefId = (row) => {
  const value = row?.projectId ?? row?.project_id ?? row?.proyek_id ?? row?.proyekId ?? row?.proyek

  if (value && typeof value === 'object') {
    return value.id || value.value || value.projectId || value.proyek_id || ''
  }

  return value || ''
}

const belongsToProject = (row, projectId) => getProjectRefId(row) === projectId

const normalizeMonitoringDoc = (document, collectionName) => {
  const data = document.data()
  return {
    id: document.id,
    ...data,
    projectId: getProjectRefId(data),
    __collection: collectionName,
  }
}

const syncAllSpksCache = () => {
  const merged = new Map()

  legacySpksCache.value.forEach((spk) => merged.set(spk.id, spk))
  primarySpksCache.value.forEach((spk) => merged.set(spk.id, spk))

  allSpksCache.value = Array.from(merged.values())
}

const getMonitoringCollectionName = (row) => row?.__collection || PROJECT_MONITORING_COLLECTION

// ============================================================
// PERMISSION
// ============================================================
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'manufaktur')
  if (!modulePerm || !modulePerm.isActive) return false
  const menu = modulePerm.menus.find(
    (m) =>
      m.id.toLowerCase().includes('project_monitoring') ||
      m.id.toLowerCase().includes('project-monitoring') ||
      m.id.toLowerCase().includes('produksi/project/monitoring'),
  )
  if (!menu) return false
  if (actionType === 'setuju') return menu.approve || false
  return menu[actionType] || false
}

const isMonitoringEditable = computed(
  () => canAction('ubah') && currentSpk.value?.status !== 'Approved',
)

// ============================================================
// COLUMNS
// ============================================================
const columns = [
  { name: 'proyek', align: 'left', label: 'IDENTITAS PROJECT', field: 'nama', sortable: true },
  { name: 'timeline', align: 'left', label: 'TIMELINE', field: 'start_date', sortable: true },
  {
    name: 'progress',
    align: 'left',
    label: 'STATUS & KEMAJUAN',
    field: 'progress',
    sortable: true,
    style: 'width:250px',
  },
  {
    name: 'valuasi',
    align: 'right',
    label: 'VALUASI KONTRAK',
    field: 'total_omzet',
    sortable: true,
  },
]
const spkColumns = [
  { name: 'no_spk', align: 'left', label: 'INFORMASI KONTRAK (SPK)', field: 'nomor_spk' },
  { name: 'durasi', align: 'left', label: 'DURASI KONTRAK', field: 'tgl_mulai' },
  { name: 'nilai', align: 'right', label: 'TOTAL NILAI KONTRAK', field: 'nilai_total' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]

// ============================================================
// STATUS & KONDISI BARIS TABEL
// ============================================================
const maxProgressDate = computed(() => {
  if (!dailyProgress.value || dailyProgress.value.length === 0) return null
  const dates = dailyProgress.value.map((r) => r.tanggal).sort()
  return dates[dates.length - 1]
})

const getRowActual = (date) => {
  if (maxProgressDate.value && date > maxProgressDate.value) return 0
  return getActualCumulativeAtDate(date)
}

const getRowDeviasi = (date, plan) => {
  if (maxProgressDate.value && date > maxProgressDate.value) return 0
  return getActualCumulativeAtDate(date) - (plan || 0)
}

const getRowStatus = (date, plan) => {
  if (maxProgressDate.value && date > maxProgressDate.value)
    return { label: 'BELUM MULAI', color: 'grey-7' }
  const actual = getActualCumulativeAtDate(date)
  const dev = actual - (plan || 0)

  if (dev > 0.01) return { label: 'LEBIH CEPAT', color: 'info' } // info = biru di Quasar default
  if (dev < -0.01) return { label: 'LEBIH LAMBAT', color: 'negative' }
  return { label: 'SESUAI TARGET', color: 'positive' }
}

// ============================================================
// FETCH DATA
// ============================================================
const fetchData = () => {
  loading.value = true
  unsubProyek = onSnapshot(collection(db, PROJECTS_COLLECTION), (snap) => {
    rawProjects.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    loading.value = false
  })
  unsubAllSpk = onSnapshot(collection(db, PROJECT_MONITORING_COLLECTION), (snap) => {
    primarySpksCache.value = snap.docs.map((d) =>
      normalizeMonitoringDoc(d, PROJECT_MONITORING_COLLECTION),
    )
    syncAllSpksCache()
    if (currentSpk.value?.id) {
      const updated = allSpksCache.value.find((s) => s.id === currentSpk.value.id)
      if (updated) {
        currentSpk.value = {
          ...updated,
          daily_plan: currentSpk.value.daily_plan,
          daily_progress: currentSpk.value.daily_progress,
        }
      }
    }
  })
  unsubLegacySpk = onSnapshot(collection(db, LEGACY_PROJECT_MONITORING_COLLECTION), (snap) => {
    legacySpksCache.value = snap.docs.map((d) =>
      normalizeMonitoringDoc(d, LEGACY_PROJECT_MONITORING_COLLECTION),
    )
    syncAllSpksCache()
    if (currentSpk.value?.id) {
      const updated = allSpksCache.value.find((s) => s.id === currentSpk.value.id)
      if (updated) {
        currentSpk.value = {
          ...updated,
          daily_plan: currentSpk.value.daily_plan,
          daily_progress: currentSpk.value.daily_progress,
        }
      }
    }
  })
}

// ============================================================
// COMPUTED: combinedProjects
// ============================================================
const combinedProjects = computed(() => {
  return rawProjects.value
    .map((proj) => {
      const spks = allSpksCache.value.filter((s) => belongsToProject(s, proj.id))
      const totalOmzet = spks.reduce((sum, s) => sum + (Number(s.nilai_total) || 0), 0)
      let startDate = null,
        endDate = null
      spks.forEach((spk) => {
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

const totalValuation = computed(() =>
  combinedProjects.value.reduce((s, p) => s + (p.total_omzet || 0), 0),
)
const countByStatus = (st) => combinedProjects.value.filter((p) => p.status === st).length

// ============================================================
// OPEN VIEWS
// ============================================================
const openProjectDashboard = (proj) => {
  currentProject.value = proj
  projectSpks.value = allSpksCache.value.filter((s) => belongsToProject(s, proj.id))
  viewMode.value = 'project'
  window.scrollTo(0, 0)
}

const openSpkDetail = (spk) => {
  currentSpk.value = JSON.parse(JSON.stringify(spk))
  activeTab.value = 'items'
  dailyPlan.value = (spk.daily_plan || []).map((r) => ({ ...r }))
  dailyProgress.value = (spk.daily_progress || []).map((r) => ({
    tanggal: r.tanggal,
    volumes: [...(r.volumes || Array(allFlatItems.value.length).fill(0))],
  }))
  viewMode.value = 'spk'
  window.scrollTo(0, 0)
}

// ============================================================
// HAPUS ITEM
// ============================================================
const confirmDeleteItem = (groupIdx, itemIdx) => {
  const item = currentSpk.value.groups[groupIdx]?.items[itemIdx]
  if (!item) return
  $q.dialog({
    title: '<div class="text-weight-bolder text-negative">Konfirmasi Hapus Item</div>',
    message: `Hapus item <b>"${item.deskripsi || 'item ini'}"</b>?<br/><span class="text-caption text-grey-7">Bobot akan dihitung ulang otomatis setelah item dihapus.</span>`,
    html: true,
    cancel: {
      label: 'Batal',
      color: 'grey-7',
      outline: true,
      rounded: true,
      class: 'q-px-lg text-weight-bold',
    },
    ok: {
      label: 'Ya, Hapus',
      color: 'negative',
      unelevated: true,
      rounded: true,
      class: 'q-px-lg text-weight-bold',
    },
    class: 'rounded-20 q-pa-sm',
    persistent: true,
  }).onOk(() => {
    currentSpk.value.groups[groupIdx].items.splice(itemIdx, 1)
    $q.notify({
      type: 'warning',
      icon: 'delete_outline',
      position: 'top',
      message: `Item "${item.deskripsi || ''}" dihapus. Klik "Simpan Perubahan Item" untuk menyimpan ke database.`,
      timeout: 5000,
    })
  })
}

// ============================================================
// SIMPAN PERUBAHAN ITEM
// ============================================================
const saveItemChanges = async () => {
  if (!currentSpk.value?.id) return
  savingItems.value = true
  try {
    const newGrandTotal = grandTotalJual.value
    await updateDoc(doc(db, getMonitoringCollectionName(currentSpk.value), currentSpk.value.id), {
      groups: JSON.parse(JSON.stringify(currentSpk.value.groups)),
      nilai_total: newGrandTotal,
      updatedAt: serverTimestamp(),
    })
    currentSpk.value.nilai_total = newGrandTotal
    $q.notify({
      type: 'positive',
      position: 'top',
      icon: 'save',
      message: 'Perubahan item berhasil disimpan! Grand total diperbarui.',
      timeout: 3000,
    })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan perubahan item.' })
  } finally {
    savingItems.value = false
  }
}

// ============================================================
// ITEM HELPERS
// ============================================================
const allFlatItems = computed(() => {
  if (!currentSpk.value?.groups) return []
  const items = []
  currentSpk.value.groups.forEach((g) => {
    g.items.forEach((item) => {
      if (!item.is_header) items.push(item)
    })
  })
  return items
})

const grandTotalJual = computed(() => {
  if (!currentSpk.value?.groups) return 0
  return currentSpk.value.groups.reduce(
    (s, g) => s + g.items.reduce((ss, i) => ss + (i.volume || 0) * (i.harga_satuan || 0), 0),
    0,
  )
})

const getItemBobot = (item) => {
  if (!grandTotalJual.value) return 0
  return (((item.volume || 0) * (item.harga_satuan || 0)) / grandTotalJual.value) * 100
}

// ============================================================
// KONTRAK HARI
// ============================================================
const contractDays = computed(() => {
  if (!currentSpk.value?.tgl_mulai || !currentSpk.value?.tgl_akhir) return 0
  return Math.max(
    Math.ceil(
      (new Date(currentSpk.value.tgl_akhir) - new Date(currentSpk.value.tgl_mulai)) /
        (1000 * 60 * 60 * 24),
    ),
    1,
  )
})

// ============================================================
// DAILY PLAN
// ============================================================
const clampPlan = (row) => {
  if (row.rencana_kumulatif < 0) row.rencana_kumulatif = 0
  if (row.rencana_kumulatif > 100) row.rencana_kumulatif = 100
}

const addPlanRow = () => {
  const lastDate = dailyPlan.value.length
    ? dailyPlan.value[dailyPlan.value.length - 1].tanggal
    : currentSpk.value?.tgl_mulai || todayStr
  const nextDate = new Date(lastDate)
  nextDate.setDate(nextDate.getDate() + 1)
  const lastPct = dailyPlan.value.length
    ? dailyPlan.value[dailyPlan.value.length - 1].rencana_kumulatif || 0
    : 0
  dailyPlan.value.push({
    tanggal: nextDate.toISOString().slice(0, 10),
    rencana_kumulatif: Math.min(lastPct + 100 / Math.max(contractDays.value, 1), 100),
  })
}

const generatePlanFromContract = () => {
  if (!currentSpk.value?.tgl_mulai || !currentSpk.value?.tgl_akhir) return
  const start = new Date(currentSpk.value.tgl_mulai)
  const end = new Date(currentSpk.value.tgl_akhir)
  const days = Math.max(Math.ceil((end - start) / (1000 * 60 * 60 * 24)), 1)
  const rows = []
  for (let i = 0; i <= days; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    rows.push({
      tanggal: d.toISOString().slice(0, 10),
      rencana_kumulatif: parseFloat(Math.min((i / days) * 100, 100).toFixed(2)),
    })
  }
  dailyPlan.value = rows
  $q.notify({
    type: 'positive',
    position: 'top',
    message: `${rows.length} hari rencana berhasil dibuat otomatis.`,
  })
}

const saveDailyPlan = async () => {
  if (!currentSpk.value?.id) return
  savingPlan.value = true
  try {
    await updateDoc(doc(db, getMonitoringCollectionName(currentSpk.value), currentSpk.value.id), {
      daily_plan: dailyPlan.value.map((r) => ({
        tanggal: r.tanggal,
        rencana_kumulatif: Number(r.rencana_kumulatif) || 0,
      })),
      updatedAt: serverTimestamp(),
    })
    $q.notify({
      type: 'positive',
      position: 'top',
      icon: 'event_note',
      message: 'Perencanaan harian berhasil disimpan!',
      timeout: 3000,
    })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan rencana.' })
  } finally {
    savingPlan.value = false
  }
}

// ============================================================
// DAILY PROGRESS
// ============================================================
const clampProgressVol = (dayRow, iIdx, maxVol) => {
  if (dayRow.volumes[iIdx] < 0) dayRow.volumes[iIdx] = 0
  if (dayRow.volumes[iIdx] > maxVol) dayRow.volumes[iIdx] = maxVol
}

const addProgressRow = () => {
  const lastDate = dailyProgress.value.length
    ? dailyProgress.value[dailyProgress.value.length - 1].tanggal
    : currentSpk.value?.tgl_mulai || todayStr
  const nextDate = new Date(lastDate)
  nextDate.setDate(nextDate.getDate() + 1)
  dailyProgress.value.push({
    tanggal: nextDate.toISOString().slice(0, 10),
    volumes: Array(allFlatItems.value.length).fill(0),
  })
}

const getTotalActualVolByItem = (itemIdx) =>
  dailyProgress.value.reduce((sum, row) => sum + (Number(row.volumes?.[itemIdx]) || 0), 0)
const getItemPct = (itemIdx) => {
  const item = allFlatItems.value[itemIdx]
  if (!item || !item.volume) return 0
  return Math.min((getTotalActualVolByItem(itemIdx) / item.volume) * 100, 100)
}
const getItemContrib = (itemIdx) => {
  const item = allFlatItems.value[itemIdx]
  return (getItemPct(itemIdx) / 100) * getItemBobot(item)
}
const getDayContrib = (dIdx) =>
  allFlatItems.value.reduce((sum, item, iIdx) => {
    const vol = Number(dailyProgress.value[dIdx]?.volumes?.[iIdx]) || 0
    return sum + (item.volume ? (vol / item.volume) * getItemBobot(item) : 0)
  }, 0)

const actualCumulative = computed(() =>
  allFlatItems.value.reduce((sum, _, idx) => sum + getItemContrib(idx), 0),
)

// ✅ getActualCumulativeAtDate — kumulatif aktual hingga tanggal tertentu
const getActualCumulativeAtDate = (targetDate) => {
  return allFlatItems.value.reduce((sum, item, iIdx) => {
    const totalVol = dailyProgress.value
      .filter((r) => r.tanggal <= targetDate)
      .reduce((s, r) => s + (Number(r.volumes?.[iIdx]) || 0), 0)
    return sum + (item.volume ? (totalVol / item.volume) * getItemBobot(item) : 0)
  }, 0)
}

const plannedForToday = computed(() => {
  const row = [...dailyPlan.value]
    .filter((r) => r.tanggal <= todayStr)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))[0]
  return row ? row.rencana_kumulatif || 0 : 0
})

const deviasi = computed(() => actualCumulative.value - plannedForToday.value)

const saveDailyProgress = async () => {
  if (!currentSpk.value?.id) return
  savingProgress.value = true
  try {
    const nItems = allFlatItems.value.length
    const payload = dailyProgress.value.map((r) => ({
      tanggal: r.tanggal,
      volumes: Array.from({ length: nItems }, (_, i) => Number(r.volumes?.[i]) || 0),
    }))
    await updateDoc(doc(db, getMonitoringCollectionName(currentSpk.value), currentSpk.value.id), {
      daily_progress: payload,
      updatedAt: serverTimestamp(),
    })
    $q.notify({
      type: 'positive',
      position: 'top',
      icon: 'edit_calendar',
      message: 'Progres harian berhasil disimpan!',
      timeout: 3000,
    })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan progres.' })
  } finally {
    savingProgress.value = false
  }
}

// ============================================================
// ✅ KURVA S CHART — FIXED actualChartPoints & todayPlannedPoint
// Dengan penambahan nilai dan tanggal untuk fitur Tooltip (Hover)
// ============================================================
const chartW = 680,
  chartH = 280,
  chartPad = 45

const chartXLabels = computed(() => {
  if (!dailyPlan.value.length) return []
  const n = Math.min(dailyPlan.value.length, 12)
  const step = Math.max(Math.ceil(dailyPlan.value.length / n), 1)
  const labels = []
  for (let i = 0; i < dailyPlan.value.length; i += step)
    labels.push(dailyPlan.value[i].tanggal?.slice(5) || '')
  const lastLabel = dailyPlan.value[dailyPlan.value.length - 1]?.tanggal?.slice(5) || ''
  if (labels[labels.length - 1] !== lastLabel) labels.push(lastLabel)
  return labels
})

const totalPlanDays = computed(() => Math.max(dailyPlan.value.length, 1))
const toChartX = (idx) =>
  chartPad + (idx / Math.max(totalPlanDays.value - 1, 1)) * (chartW - chartPad * 1.5)
const toChartY = (pct) => chartPad + (1 - pct / 100) * (chartH - chartPad * 2)

// plannedPoints dengan info [x, y, percent, date]
const plannedPoints = computed(() =>
  dailyPlan.value.map((row, i) => [
    toChartX(i),
    toChartY(row.rencana_kumulatif || 0),
    (row.rencana_kumulatif || 0).toFixed(2),
    row.tanggal,
  ]),
)

// FIX actualChartPoints: Berhenti menggambar titik progress apabila tanggalnya melampaui hari input terakhir
const actualChartPoints = computed(() => {
  if (!dailyPlan.value.length || !dailyProgress.value.length) return []

  const planDates = dailyPlan.value.map((r) => r.tanggal).sort()
  const firstPlanDate = planDates[0]
  const lastPlanDate = planDates[planDates.length - 1]
  const totalPlanMs = new Date(lastPlanDate) - new Date(firstPlanDate)

  if (totalPlanMs <= 0) return []

  const progressDates = [...new Set(dailyProgress.value.map((r) => r.tanggal))].sort()
  const pts = []

  pts.push([chartPad, toChartY(0), '0.00', firstPlanDate])

  progressDates.forEach((tgl) => {
    if (tgl < firstPlanDate || tgl > lastPlanDate) return
    // TIdak ada blokir ke masa depan (todayStr) karena inputan progress mendikte batas grafis aktual
    const xRatio = (new Date(tgl) - new Date(firstPlanDate)) / totalPlanMs
    const x = chartPad + xRatio * (chartW - chartPad * 1.5)
    const cumActual = getActualCumulativeAtDate(tgl)
    pts.push([x, toChartY(Math.min(cumActual, 100)), cumActual.toFixed(2), tgl])
  })

  return pts
})

const todayPlannedPoint = computed(() => {
  if (!dailyPlan.value.length) return null
  const planDates = dailyPlan.value.map((r) => r.tanggal).sort()
  const firstPlanDate = planDates[0]
  const lastPlanDate = planDates[planDates.length - 1]
  if (todayStr < firstPlanDate || todayStr > lastPlanDate) return null
  const totalPlanMs = new Date(lastPlanDate) - new Date(firstPlanDate)
  if (totalPlanMs <= 0) return null
  const xRatio = (new Date(todayStr) - new Date(firstPlanDate)) / totalPlanMs
  const x = chartPad + xRatio * (chartW - chartPad * 1.5)
  const y = toChartY(plannedForToday.value)
  return [x, y]
})

// ============================================================
// Point Click Info State
// ============================================================
const selectedPointInfo = ref(null)

const togglePointInfo = (pt, type) => {
  if (
    selectedPointInfo.value &&
    selectedPointInfo.value.x === pt[0] &&
    selectedPointInfo.value.y === pt[1] &&
    selectedPointInfo.value.type === type
  ) {
    selectedPointInfo.value = null
  } else {
    selectedPointInfo.value = {
      x: pt[0],
      y: pt[1],
      pct: pt[2],
      date: pt[3],
      type,
    }
  }
}

const closePointInfo = () => {
  selectedPointInfo.value = null
}

// ============================================================
// PIE CHART
// ============================================================
const pieColors = [
  '#36ada3',
  '#0284c7',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
  '#84cc16',
]
const pieColorsQ = ['brand-primary', 'blue-8', 'green-8', 'orange-8', 'purple-8', 'red-8']

const pieSlices = computed(() => {
  const spks = projectSpks.value
  if (!spks.length) return []
  const total = spks.reduce((s, k) => s + (k.nilai_total || 0), 0)
  if (!total) return []
  const cx = 100,
    cy = 100,
    r = 80
  let startAngle = -Math.PI / 2
  return spks.map((spk, i) => {
    const pct = (spk.nilai_total || 0) / total
    const angle = pct * 2 * Math.PI
    const endAngle = startAngle + angle
    const x1 = cx + r * Math.cos(startAngle),
      y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle),
      y2 = cy + r * Math.sin(endAngle)
    const largeArc = angle > Math.PI ? 1 : 0
    const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`
    startAngle = endAngle
    return { path, color: pieColors[i % pieColors.length], spk, pct }
  })
})

const spkProgress = (spk) => {
  if (!spk.daily_progress || !spk.groups) return 0
  const items = []
  spk.groups.forEach((g) =>
    g.items.forEach((i) => {
      if (!i.is_header) items.push(i)
    }),
  )
  const total = items.reduce((s, i) => s + (i.volume || 0) * (i.harga_satuan || 0), 0)
  if (!total) return 0
  let cum = 0
  items.forEach((item, idx) => {
    const totalVol = spk.daily_progress.reduce((s, row) => s + (Number(row.volumes?.[idx]) || 0), 0)
    const bobot = item.volume ? ((item.volume * (item.harga_satuan || 0)) / total) * 100 : 0
    cum += item.volume ? (totalVol / item.volume) * bobot : 0
  })
  return Math.min(Math.round(cum * 100) / 100, 100)
}

// ============================================================
// UTILS
// ============================================================
const formatTimeline = (proj) => {
  if (!proj.start_date && !proj.end_date) return 'Belum ada SPK'
  const fmt = { day: 'numeric', month: 'short', year: 'numeric' }
  const s = proj.start_date ? proj.start_date.toLocaleDateString('id-ID', fmt) : '?'
  const e = proj.end_date ? proj.end_date.toLocaleDateString('id-ID', fmt) : '?'
  return `${s} - ${e}`
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

watch(allSpksCache, () => {
  if (currentProject.value)
    projectSpks.value = allSpksCache.value.filter((s) =>
      belongsToProject(s, currentProject.value.id),
    )
})

// ============================================================
// LIFECYCLE
// ============================================================
onMounted(() => {
  fetchData()
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubUser = onSnapshot(qUser, (snap) => {
      if (!snap.empty) userData.value = snap.docs[0].data()
    })
  }
})
onUnmounted(() => {
  if (unsubProyek) unsubProyek()
  if (unsubAllSpk) unsubAllSpk()
  if (unsubLegacySpk) unsubLegacySpk()
  if (unsubUser) unsubUser()
})
</script>

<style scoped>
/* Monitoring Project Page — Dark Premium Theme */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.bg-page {
  background-color: #071826;
}
.font-pro {
  font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-12 {
  border-radius: 12px;
}
.rounded-2 {
  border-radius: 2px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(0, 209, 178, 0.15);
}
.border-subtle {
  border: 1px solid rgba(124, 255, 79, 0.08);
}
.border-right-sep {
  border-right: 1px solid rgba(124, 255, 79, 0.08);
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(124, 255, 79, 0.06);
}

.bg-brand-primary,
:deep(.bg-brand-primary) {
  background-color: #00D1B2 !important;
}
.text-brand-primary,
:deep(.text-brand-primary) {
  color: #00D1B2 !important;
}
.bg-brand-light {
  background-color: rgba(0, 209, 178, 0.08) !important;
}
.border-brand-thin {
  border: 2px solid rgba(0, 209, 178, 0.25) !important;
}

.card-teal-gradient {
  background: linear-gradient(135deg, #00D1B2 0%, #0a8f7e 100%) !important;
  box-shadow: 0 8px 24px rgba(0, 209, 178, 0.4) !important;
}
.card-blue-gradient {
  background: linear-gradient(135deg, #3BA7FF 0%, #0369a1 100%) !important;
  box-shadow: 0 8px 24px rgba(59, 167, 255, 0.35) !important;
}
.card-green-gradient {
  background: linear-gradient(135deg, #7CFF4F 0%, #22c55e 100%) !important;
  box-shadow: 0 8px 24px rgba(124, 255, 79, 0.4) !important;
  color: #071826 !important;
}
.card-green-gradient div,
.card-green-gradient .text-h4 {
  color: #071826 !important;
}
.card-green-gradient .text-overline {
  color: rgba(7, 24, 38, 0.75) !important;
}
.card-orange-gradient {
  background: linear-gradient(135deg, #FFA940 0%, #d46b08 100%) !important;
  box-shadow: 0 8px 24px rgba(255, 169, 64, 0.35) !important;
}

.monitoring-table :deep(thead tr th),
.spk-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 700 !important;
  font-size: 11px;
  letter-spacing: 0.4px !important;
  text-transform: uppercase;
  color: #EAF2FF !important;
}
.monitoring-table :deep(tbody tr td),
.spk-table :deep(tbody tr td) {
  color: #F4F7FA !important;
}
.hover-bg:hover {
  background-color: rgba(0, 209, 178, 0.06) !important;
}
.hover-shadow:hover {
  transform: translateY(-4px);
}
.hover-dot:hover {
  stroke-width: 3;
  filter: brightness(1.2);
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
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

.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.tracking-widest {
  letter-spacing: 0.15em;
}
.font-11 {
  font-size: 11px;
}
.font-10 {
  font-size: 10px;
}
.leading-tight {
  line-height: 1.1;
}
.block {
  display: block;
}
.uppercase {
  text-transform: uppercase;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.h-full {
  height: 100%;
}

.items-table :deep(thead th) {
  font-size: 11px;
  font-weight: 700 !important;
  color: #EAF2FF !important;
  letter-spacing: 0.4px !important;
  padding: 12px;
}
.items-table :deep(td) {
  border: 1px solid rgba(124, 255, 79, 0.08);
  padding: 10px;
  color: #F4F7FA !important;
}
.items-table :deep(tfoot td) {
  font-size: 13px;
  padding: 14px;
  color: #F4F7FA !important;
}

.daily-plan-table {
  border-collapse: collapse;
}
.daily-plan-table th {
  padding: 12px 10px;
  font-size: 10px;
  font-weight: 700 !important;
  letter-spacing: 0.4px !important;
  text-align: center;
  border: 1px solid rgba(0, 209, 178, 0.15);
  background: linear-gradient(135deg, #00D1B2, #007C85);
  color: #071826;
}
.daily-plan-table td {
  border: 1px solid rgba(124, 255, 79, 0.08);
  padding: 4px 8px;
  color: #F4F7FA !important;
}

.progress-input-table {
  border-collapse: collapse;
}
.progress-input-table th {
  padding: 10px 8px;
  font-size: 10px;
  font-weight: 700 !important;
  letter-spacing: 0.4px !important;
  border: 1px solid rgba(124, 255, 79, 0.1);
  white-space: nowrap;
  background: rgba(10, 30, 46, 0.95);
  color: #EAF2FF !important;
}
.progress-input-table td {
  border: 1px solid rgba(124, 255, 79, 0.06);
  padding: 2px 4px;
  color: #F4F7FA !important;
}
.progress-input-table tfoot td {
  background: rgba(10, 30, 46, 0.95);
  color: #F4F7FA !important;
  padding: 8px;
  border: 1px solid rgba(124, 255, 79, 0.1);
}

.sticky-col {
  position: sticky;
  left: 0;
  background: inherit;
  z-index: 2;
}
.sticky-col2 {
  position: sticky;
  left: 60px;
  background: inherit;
  z-index: 2;
}

.content-relative {
  position: relative;
  z-index: 1;
}

@media (max-width: 599px) {
  .border-right-sep {
    border-right: none;
    border-bottom: 1px solid rgba(124, 255, 79, 0.06);
  }
}
</style>

