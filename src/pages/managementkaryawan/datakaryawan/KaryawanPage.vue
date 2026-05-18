<template>
  <q-page class="bg-blue-grey-1 q-pa-md q-pa-md-lg font-pro">
    <!-- =====================================================================================
         VIEW 1: DAFTAR KARYAWAN (LIST VIEW)
         ===================================================================================== -->
    <template v-if="currentView === 'list'">
      <!-- HEADER DATABASE -->
      <div class="row items-center justify-between q-mb-md q-mb-md-lg no-print animate-fade">
        <div class="col-12 col-md-auto q-mb-md q-mb-md-none">
          <div class="text-h5 text-md-h4 text-weight-bolder text-blue-grey-10">
            Database Karyawan
          </div>
          <div class="text-caption text-md-subtitle2 text-grey-7">
            Manajemen data dan profil karyawan AGRA
          </div>
        </div>

        <div class="col-12 col-md-auto row q-gutter-sm no-wrap-md">
          <!-- Tombol Export -->
          <q-btn-dropdown
            outline
            color="blue-grey-8"
            label="Export"
            icon="download"
            rounded
            class="col col-md-auto"
          >
            <q-list>
              <q-item clickable v-ripple @click="exportToExcel">
                <q-item-section avatar>
                  <q-icon name="description" color="green-8" />
                </q-item-section>
                <q-item-section>Excel (.xlsx)</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="exportToPDF">
                <q-item-section avatar>
                  <q-icon name="picture_as_pdf" color="red-8" />
                </q-item-section>
                <q-item-section>PDF (.pdf)</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn
            color="primary"
            label="Tambah"
            icon="add"
            @click="openDialog"
            unelevated
            rounded
            class="col col-md-auto shadow-3"
          />
        </div>
      </div>

      <!-- FILTER & SEARCH AREA -->
      <q-card flat bordered class="q-mb-md shadow-1 rounded-borders no-print animate-fade">
        <q-card-section class="q-py-sm">
          <div class="row items-center q-col-gutter-sm q-col-gutter-md-md">
            <div class="col-12 col-md-5">
              <q-input
                v-model="filter"
                outlined
                dense
                rounded
                placeholder="Cari NIK, Nama, atau Jabatan..."
                bg-color="white"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="primary" />
                </template>
                <template v-slot:append v-if="filter">
                  <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </div>
            <q-space class="gt-sm" />
            <div class="col-12 col-md-auto text-center text-md-right text-caption text-grey-6">
              Total:
              <span class="text-weight-bold text-primary">{{ karyawanList.length }}</span> Karyawan
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- TABLE LIST KARYAWAN -->
      <q-card
        flat
        bordered
        class="shadow-2 rounded-borders overflow-hidden no-print animate-fade-up"
      >
        <q-table
          :rows="karyawanList"
          :columns="columns"
          row-key="id"
          flat
          :filter="filter"
          binary-state-sort
          class="karyawan-table"
          :pagination="{ rowsPerPage: 10 }"
        >
          <!-- Custom Header untuk Desktop -->
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-blue-grey-10 text-white">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bold uppercase font-11 tracking-wider text-left"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <!-- Row Desktop -->
          <template v-slot:body="props">
            <q-tr :props="props" class="hover-bg transition-all">
              <q-td
                key="nik"
                :props="props"
                class="cursor-pointer text-weight-medium"
                @click="viewDetail(props.row)"
              >
                {{ props.row.nik }}
              </q-td>
              <q-td
                key="nama"
                :props="props"
                class="cursor-pointer text-weight-bold uppercase"
                @click="viewDetail(props.row)"
              >
                {{ props.row.nama }}
              </q-td>
              <q-td
                key="jabatan"
                :props="props"
                class="cursor-pointer"
                @click="viewDetail(props.row)"
              >
                <div class="row items-center q-gutter-xs">
                  <q-badge
                    color="blue-1"
                    text-color="blue-grey-10"
                    class="q-px-sm q-py-xs text-weight-bold shadow-sm border-subtle"
                  >
                    {{ props.row.jabatan }}
                  </q-badge>
                  <q-badge
                    v-if="props.row.divisi"
                    color="indigo-10"
                    text-color="white"
                    class="q-px-sm q-py-xs text-weight-bold shadow-sm"
                  >
                    {{ props.row.divisi }}
                  </q-badge>
                </div>
              </q-td>

              <q-td key="actions" :props="props" auto-width>
                <q-btn
                  flat
                  round
                  color="blue-8"
                  icon="edit"
                  size="sm"
                  @click.stop="editKaryawan(props.row)"
                />
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click.stop="deleteKaryawan(props.row)"
                />
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-xl text-grey-6">
              <q-icon name="sentiment_dissatisfied" size="48px" class="q-mr-sm" />
              <div class="text-h6">Data tidak ditemukan</div>
            </div>
          </template>
        </q-table>
      </q-card>
    </template>

    <!-- =====================================================================================
         VIEW 2: DETAIL PROFIL (VIEW SWITCHER - DESIGN BARU SANGAT MODERN & ELEGAN)
         ===================================================================================== -->
    <template v-else-if="currentView === 'detail'">
      <!-- TOP NAVIGATION BAR -->
      <div class="row items-center justify-between q-mb-lg no-print animate-fade">
        <q-btn
          flat
          icon="arrow_back"
          label="Kembali"
          @click="currentView = 'list'"
          color="blue-grey-8"
          rounded
          class="bg-white shadow-soft border-subtle"
        />
        <q-space />
        <q-btn
          flat
          icon="print"
          color="primary"
          :label="$q.screen.gt.xs ? 'Cetak Profil' : ''"
          class="saas-btn-outline font-bold text-weight-bold"
          @click="exportSinglePDF(selectedKaryawan)"
        />
      </div>

      <div class="row justify-center animate-fade-up">
        <div class="col-12 col-md-10">
          <!-- MAIN HERO CARD WITH GRADIENT AND OVERLAPPING AVATAR -->
          <q-card
            flat
            bordered
            class="rounded-20 shadow-premium bg-white border-subtle overflow-hidden q-mb-lg"
          >
            <!-- SaaS Mesh Gradient Banner -->
            <div
              class="saas-gradient-primary relative-position flex items-end q-px-xl"
              style="height: 140px"
            >
              <div class="saas-blur-blob"></div>
            </div>

            <q-card-section
              class="q-px-lg q-px-md-xl q-pb-xl relative-position"
              style="padding-top: 0"
            >
              <!-- Overlapping Profile Avatar -->
              <div class="row items-end q-col-gutter-md profile-header-overlap q-mb-md">
                <div class="col-12 col-sm-auto text-center text-sm-left">
                  <div class="avatar-ring shadow-15">
                    <q-avatar size="130px" class="bg-white border-white-5">
                      <img
                        :src="selectedKaryawan.fotoUrl || 'https://cdn.quasar.dev/img/avatar.png'"
                        alt="Avatar"
                      />
                    </q-avatar>
                  </div>
                </div>
                <div class="col text-center text-sm-left q-pb-xs">
                  <div
                    class="text-h4 text-weight-bolder text-slate-900 leading-tight uppercase tracking-tight"
                  >
                    {{ selectedKaryawan.nama }}
                  </div>
                  <div
                    class="text-subtitle1 text-slate-500 font-medium flex items-center justify-center justify-sm-start q-mt-xs"
                  >
                    <q-icon name="work_outline" size="18px" class="q-mr-xs text-slate-400" />
                    {{ selectedKaryawan.jabatan }}
                  </div>
                </div>
              </div>

              <!-- KEY DATA SUMMARY ROW (WIDGETS) -->
              <div class="row q-col-gutter-md q-mt-lg">
                <div class="col-12 col-sm-4">
                  <div class="kpi-mini-card bg-slate-50">
                    <div
                      class="text-caption text-slate-500 text-bold uppercase tracking-wider font-bold"
                    >
                      Nomor Induk Karyawan
                    </div>
                    <div class="text-subtitle1 text-weight-bolder text-indigo-10 font-mono">
                      {{ selectedKaryawan.nik }}
                    </div>
                  </div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="kpi-mini-card bg-slate-50">
                    <div
                      class="text-caption text-slate-500 text-bold uppercase tracking-wider font-bold"
                    >
                      Divisi Kerja
                    </div>
                    <div class="text-subtitle1 text-weight-bolder text-slate-800 uppercase">
                      <q-icon name="business" class="q-mr-xs text-indigo-10" />
                      {{ selectedKaryawan.divisi || '-' }}
                    </div>
                  </div>
                </div>
                <div class="col-12 col-sm-4">
                  <div class="kpi-mini-card bg-slate-50">
                    <div
                      class="text-caption text-slate-500 text-bold uppercase tracking-wider font-bold"
                    >
                      Masa Kerja (Tenure)
                    </div>
                    <div class="text-subtitle1 text-weight-bolder text-teal-7">
                      <q-icon name="hourglass_empty" class="q-mr-xs text-teal-7" />
                      {{ calculateTenorDays(selectedKaryawan.tglMasuk) }}
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- EXPANDED DETAILED DETAILS -->
          <div class="row q-col-gutter-lg">
            <!-- Left Info Block: Personal, Kontak & Akun -->
            <div class="col-12 col-md-6">
              <q-card
                flat
                bordered
                class="rounded-16 shadow-soft bg-white full-height border-subtle"
              >
                <q-card-section class="q-pa-lg border-bottom-subtle row items-center">
                  <q-avatar
                    size="32px"
                    color="blue-50"
                    text-color="indigo-10"
                    icon="fingerprint"
                    class="q-mr-sm rounded-8"
                  />
                  <div class="text-subtitle1 text-weight-bold text-slate-800">
                    Biodata & Informasi Pribadi
                  </div>
                </q-card-section>

                <q-card-section class="q-pa-lg">
                  <div class="q-gutter-y-md">
                    <!-- Lahir -->
                    <div class="row items-center border-bottom-subtle q-pb-md">
                      <div
                        class="col-4 text-slate-500 font-medium font-12 uppercase tracking-wider"
                      >
                        Tempat, Tgl Lahir
                      </div>
                      <div class="col-8 text-weight-bold text-slate-800">
                        {{ selectedKaryawan.kotaLahir || '-' }},
                        {{ formatDateIndo(selectedKaryawan.tglLahir) }}
                      </div>
                    </div>
                    <!-- Telepon -->
                    <div class="row items-center border-bottom-subtle q-pb-md">
                      <div
                        class="col-4 text-slate-500 font-medium font-12 uppercase tracking-wider"
                      >
                        No. Telepon / HP
                      </div>
                      <div class="col-8 text-weight-bold text-indigo-10">
                        <q-icon name="phone_android" class="q-mr-xs" />
                        {{ selectedKaryawan.hp || '-' }}
                      </div>
                    </div>
                    <!-- Email -->
                    <div class="row items-center border-bottom-subtle q-pb-md">
                      <div
                        class="col-4 text-slate-500 font-medium font-12 uppercase tracking-wider"
                      >
                        Email Login
                      </div>
                      <div class="col-8 text-weight-bold text-slate-700">
                        <q-icon name="mail_outline" class="q-mr-xs" />
                        {{ selectedKaryawan.email || '-' }}
                      </div>
                    </div>
                    <!-- Alamat -->
                    <div class="row items-start">
                      <div
                        class="col-4 text-slate-500 font-medium font-12 uppercase tracking-wider q-pt-xs"
                      >
                        Alamat Domisili
                      </div>
                      <div class="col-8 text-slate-600 font-medium leading-relaxed font-13">
                        {{ selectedKaryawan.alamat || 'Alamat belum diunggah.' }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Right Info Block: Kepegawaian & Berkas Legalitas -->
            <div class="col-12 col-md-6">
              <!-- Kepegawaian Card -->
              <q-card flat bordered class="rounded-16 shadow-soft bg-white border-subtle q-mb-lg">
                <q-card-section class="q-pa-lg border-bottom-subtle row items-center">
                  <q-avatar
                    size="32px"
                    color="teal-50"
                    text-color="teal-8"
                    icon="calendar_today"
                    class="q-mr-sm rounded-8"
                  />
                  <div class="text-subtitle1 text-weight-bold text-slate-800">
                    Detail Kepegawaian
                  </div>
                </q-card-section>

                <q-card-section class="q-pa-lg">
                  <div class="q-gutter-y-md">
                    <!-- Tgl Masuk -->
                    <div class="row items-center border-bottom-subtle q-pb-md">
                      <div
                        class="col-4 text-slate-500 font-medium font-12 uppercase tracking-wider"
                      >
                        Tanggal Bergabung
                      </div>
                      <div class="col-8 text-weight-bold text-slate-800">
                        {{ formatDateIndo(selectedKaryawan.tglMasuk) }}
                      </div>
                    </div>
                    <!-- Jabatan -->
                    <div class="row items-center">
                      <div
                        class="col-4 text-slate-500 font-medium font-12 uppercase tracking-wider"
                      >
                        Posisi / Jabatan
                      </div>
                      <div class="col-8 text-weight-bold">
                        <q-badge
                          color="indigo-1"
                          text-color="indigo-10"
                          class="q-px-md q-py-xs text-weight-bold rounded-pill"
                        >
                          {{ selectedKaryawan.jabatan }}
                        </q-badge>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Berkas Digital / Dokumen Card -->
              <q-card flat bordered class="rounded-16 shadow-soft bg-white border-subtle">
                <q-card-section class="q-pa-lg border-bottom-subtle row items-center">
                  <q-avatar
                    size="32px"
                    color="purple-50"
                    text-color="purple-8"
                    icon="folder_open"
                    class="q-mr-sm rounded-8"
                  />
                  <div class="text-subtitle1 text-weight-bold text-slate-800">Lampiran Dokumen</div>
                </q-card-section>

                <q-list class="bg-white">
                  <!-- Iterasi berkas/dokumen legalitas lampiran karyawan -->
                  <q-item
                    v-for="(docItem, i) in selectedKaryawan.docs ||
                    selectedKaryawan.additional_docs"
                    :key="i"
                    clickable
                    v-ripple
                    @click="openLink(docItem.url || docItem.base64)"
                    class="q-py-md border-bottom-subtle saas-hover-row"
                  >
                    <q-item-section avatar>
                      <q-avatar
                        color="indigo-50"
                        text-color="primary"
                        icon="insert_drive_file"
                        size="sm"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold text-slate-800 text-subtitle2">{{
                        docItem.name || 'Dokumen ' + (i + 1)
                      }}</q-item-label>
                      <q-item-label caption class="font-10 text-slate-400"
                        >Klik untuk mengunduh / pratinjau berkas</q-item-label
                      >
                    </q-item-section>
                    <q-item-section side>
                      <q-icon name="open_in_new" color="grey-6" size="xs" />
                    </q-item-section>
                  </q-item>
                  <q-item
                    v-if="
                      !(selectedKaryawan.docs?.length || selectedKaryawan.additional_docs?.length)
                    "
                  >
                    <q-item-section
                      class="text-center q-pa-lg text-slate-400 font-medium italic font-12"
                    >
                      Belum ada dokumen pendukung terlampir.
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card>
            </div>
          </div>
        </div>
      </div>
      <div class="q-py-xl"></div>
    </template>

    <!-- =====================================================================================
         VIEW 3: FORM REGISTRASI / EDIT (VIEW SWITCHER - NO BORING DIALOGS!)
         ===================================================================================== -->
    <template v-else-if="currentView === 'form'">
      <div class="row items-center justify-between q-mb-xl animate-fade">
        <div class="row items-center no-wrap">
          <q-btn
            flat
            round
            color="indigo-10"
            icon="arrow_back"
            @click="currentView = 'list'"
            class="q-mr-md bg-white shadow-1"
          />
          <div>
            <div
              class="text-overline text-slate-500 text-bold tracking-widest q-mb-xs leading-none"
            >
              DATABASE KARYAWAN
            </div>
            <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight uppercase">
              {{ form.id ? 'Perbarui Data Karyawan' : 'Registrasi Baru' }}
            </div>
          </div>
        </div>
        <q-btn
          label="SIMPAN DATA"
          @click="saveKaryawan"
          unelevated
          rounded
          class="text-white shadow-6 q-px-xl q-py-sm text-weight-bold"
          style="background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)"
          :loading="submitting"
        />
      </div>

      <div class="row justify-center animate-fade-up">
        <div class="col-12 col-lg-10">
          <div class="row q-col-gutter-lg q-col-gutter-md-xl">
            <!-- Data Personal -->
            <div class="col-12 col-md-7">
              <q-card flat bordered class="rounded-borders q-pa-lg bg-white shadow-soft">
                <!-- Section Header Modern Proporsional -->
                <div class="row items-center q-mb-lg border-bottom-subtle q-pb-md">
                  <q-avatar
                    size="36px"
                    color="blue-50"
                    text-color="indigo-10"
                    icon="person"
                    class="q-mr-sm rounded-8 shadow-sm"
                  />
                  <div>
                    <div
                      class="text-subtitle1 text-weight-bold text-slate-800 leading-none q-mb-xs"
                    >
                      Informasi Personal
                    </div>
                    <div class="text-caption text-grey-6 leading-none">
                      Biodata dasar, kontak, dan jabatan karyawan
                    </div>
                  </div>
                </div>

                <div class="row q-col-gutter-md">
                  <q-input
                    class="col-12"
                    outlined
                    v-model="form.nik"
                    label="NIK"
                    readonly
                    bg-color="grey-1"
                    dense
                  />
                  <q-input class="col-12" outlined v-model="form.nama" label="Nama Lengkap" dense />
                  <q-input
                    class="col-12 col-sm-6"
                    outlined
                    v-model="form.hp"
                    label="No Handphone"
                    dense
                  />
                  <q-select
                    class="col-12 col-sm-6"
                    outlined
                    v-model="form.jabatan"
                    :options="filteredJabatanOptions"
                    label="Jabatan"
                    emit-value
                    map-options
                    dense
                  />
                  <q-input
                    class="col-6"
                    outlined
                    v-model="form.kotaLahir"
                    label="Tempat Lahir"
                    dense
                  />
                  <q-input
                    class="col-6"
                    outlined
                    v-model="form.tglLahir"
                    type="date"
                    stack-label
                    label="Tgl Lahir"
                    dense
                  />
                  <q-input
                    class="col-12"
                    outlined
                    v-model="form.tglMasuk"
                    type="date"
                    stack-label
                    label="Mulai Kerja"
                    dense
                  />
                  <q-input
                    class="col-12"
                    outlined
                    v-model="form.alamat"
                    type="textarea"
                    label="Alamat Lengkap"
                    autogrow
                    dense
                  />
                </div>
              </q-card>

              <q-card flat bordered class="rounded-borders q-pa-lg q-mt-lg bg-white shadow-soft">
                <!-- Section Header Modern Proporsional -->
                <div class="row items-center q-mb-lg border-bottom-subtle q-pb-md">
                  <q-avatar
                    size="36px"
                    color="blue-50"
                    text-color="indigo-10"
                    icon="vpn_key"
                    class="q-mr-sm rounded-8 shadow-sm"
                  />
                  <div>
                    <div
                      class="text-subtitle1 text-weight-bold text-slate-800 leading-none q-mb-xs"
                    >
                      Akun Sistem
                    </div>
                    <div class="text-caption text-grey-6 leading-none">
                      Kredensial login sistem ERP perusahaan
                    </div>
                  </div>
                </div>

                <div class="row q-col-gutter-md">
                  <q-input
                    class="col-12 col-sm-6"
                    outlined
                    v-model="form.email"
                    label="Email Login"
                    :readonly="!!form.id"
                    dense
                  />
                  <q-input
                    class="col-12 col-sm-6"
                    outlined
                    v-model="form.password"
                    label="Password"
                    type="password"
                    dense
                  />
                </div>
              </q-card>
            </div>

            <!-- Divisi & Media -->
            <div class="col-12 col-md-5">
              <q-card flat bordered class="rounded-borders q-pa-lg bg-white shadow-soft">
                <!-- Section Header Modern Proporsional -->
                <div class="row items-center q-mb-lg border-bottom-subtle q-pb-md">
                  <q-avatar
                    size="36px"
                    color="indigo-50"
                    text-color="indigo-10"
                    icon="business"
                    class="q-mr-sm rounded-8 shadow-sm"
                  />
                  <div>
                    <div
                      class="text-subtitle1 text-weight-bold text-slate-800 leading-none q-mb-xs"
                    >
                      Divisi
                    </div>
                    <div class="text-caption text-grey-6 leading-none">
                      Divisi operasional bisnis internal
                    </div>
                  </div>
                </div>

                <div class="q-mt-sm q-mb-xl">
                  <q-select
                    outlined
                    v-model="form.divisi"
                    :options="divisiOptions"
                    label="Pilih Divisi Kerja *"
                    placeholder="Klik untuk memilih divisi..."
                    dense
                    bg-color="white"
                    @update:model-value="onDivisiChange"
                    :rules="[(val) => !!val || 'Pilih divisi kerja']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="corporate_fare" color="primary" />
                    </template>
                  </q-select>
                </div>

                <!-- Section Header Modern Proporsional -->
                <div class="row items-center q-mb-md">
                  <q-avatar
                    size="36px"
                    color="teal-50"
                    text-color="teal-8"
                    icon="image"
                    class="q-mr-sm rounded-8 shadow-sm"
                  />
                  <div>
                    <div
                      class="text-subtitle1 text-weight-bold text-slate-800 leading-none q-mb-xs"
                    >
                      Foto Profil
                    </div>
                    <div class="text-caption text-grey-6 leading-none">
                      Unggah foto identitas berlatar bebas
                    </div>
                  </div>
                </div>
                <q-file
                  outlined
                  v-model="fotoFile"
                  label="Pilih Foto"
                  accept="image/*"
                  dense
                  class="q-mb-xl"
                >
                  <template v-slot:prepend><q-icon name="cloud_upload" /></template>
                </q-file>

                <!-- Section Header Modern Proporsional -->
                <div class="row items-center justify-between q-mb-md">
                  <div class="row items-center">
                    <q-avatar
                      size="36px"
                      color="purple-50"
                      text-color="purple-8"
                      icon="attach_file"
                      class="q-mr-sm rounded-8 shadow-sm"
                    />
                    <div>
                      <div
                        class="text-subtitle1 text-weight-bold text-slate-800 leading-none q-mb-xs"
                      >
                        Dokumen
                      </div>
                      <div class="text-caption text-grey-6 leading-none">
                        Unggah arsip berkas pelengkap
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-for="(item, index) in docList"
                  :key="index"
                  class="row q-col-gutter-xs q-mb-sm items-center"
                >
                  <q-input class="col-5" outlined v-model="item.name" label="Nama" dense />
                  <q-file class="col-5" outlined v-model="item.file" label="File" dense />
                  <div class="col-2 text-right">
                    <q-btn
                      color="negative"
                      icon="delete"
                      @click="docList.splice(index, 1)"
                      dense
                      flat
                      round
                      size="sm"
                    />
                  </div>
                </div>
                <q-btn
                  color="primary"
                  label="Tambah Dokumen"
                  icon="add_circle"
                  @click="docList.push({ name: '', file: null })"
                  outline
                  size="sm"
                  class="full-width q-mt-sm rounded-borders"
                />
              </q-card>
            </div>
          </div>
        </div>
      </div>
      <div class="q-py-xl"></div>
    </template>

    <!-- =====================================================================================
         HIDDEN AREA FOR PDF LIST EXPORT (BERWARNA & RAPI)
         ===================================================================================== -->
    <div style="position: absolute; top: -9999px; left: -9999px; width: 297mm; z-index: -1">
      <div id="table-pdf-export" class="landscape-paper">
        <div
          style="
            border-bottom: 3px solid #1a237e;
            padding-bottom: 15px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
          "
        >
          <div
            style="
              background-color: #1a237e;
              color: white;
              border-radius: 8px;
              padding: 12px;
              margin-right: 15px;
            "
          >
            <q-icon name="corporate_fare" size="32px" />
          </div>
          <div>
            <div
              style="
                font-size: 24px;
                font-weight: 900;
                color: #1a237e;
                text-transform: uppercase;
                letter-spacing: 1px;
              "
            >
              Database Karyawan Resmi
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 4px">
              Diekspor pada: {{ new Date().toLocaleString('id-ID') }} | PT Agra Abhinaya Perkasa
            </div>
          </div>
        </div>

        <table class="pdf-export-table" style="width: 100%; border-collapse: collapse">
          <thead>
            <tr>
              <th style="width: 5%; text-align: center">NO</th>
              <th style="width: 15%; text-align: left">NIK</th>
              <th style="width: 25%; text-align: left">NAMA LENGKAP</th>
              <th style="width: 20%; text-align: left">JABATAN</th>
              <th style="width: 15%; text-align: left">DIVISI</th>
              <th style="width: 20%; text-align: left">EMAIL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in karyawanList" :key="idx">
              <td style="text-align: center; font-weight: bold">{{ idx + 1 }}</td>
              <td style="text-align: left; font-weight: bold">{{ row.nik || '-' }}</td>
              <td
                style="
                  text-align: left;
                  font-weight: bold;
                  color: #1a237e;
                  text-transform: uppercase;
                "
              >
                {{ row.nama || '-' }}
              </td>
              <td style="text-align: left">{{ row.jabatan || '-' }}</td>
              <td style="text-align: left; font-weight: bold">{{ row.divisi || '-' }}</td>
              <td style="text-align: left">{{ row.email || '-' }}</td>
            </tr>
            <tr v-if="karyawanList.length === 0">
              <td
                colspan="6"
                style="text-align: center; padding: 20px; color: #888; font-style: italic"
              >
                Tidak ada data.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db, auth, storage } from 'src/boot/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const authStore = useAuthStore()

// View Switcher State
const currentView = ref('list') // 'list' | 'detail' | 'form'
const filter = ref('')
const selectedKaryawan = ref(null)
const isEditMode = ref(false)
const submitting = ref(false)

const karyawanList = ref([])
const jabatanOptions = ref([])
const docList = ref([{ name: '', file: null }])
const fotoFile = ref(null)

// Static Divisi Options
const divisiOptions = ['Konstruksi', 'Manufaktur']

const formDefault = {
  id: null,
  nik: '',
  nama: '',
  jabatan: '',
  email: '',
  password: '',
  hp: '',
  kotaLahir: '',
  tglLahir: '',
  tglMasuk: '',
  alamat: '',
  divisi: '',
  akses: [],
}
const form = ref({ ...formDefault })

let unsubUser = null
let unsubKaryawan = null
let unsubJabatan = null

const userData = ref(null)

// ============================================================================
// LOGIKA KEAMANAN PERAN (ROLE-BASED PERMISSION SEGREGATION)
// ============================================================================
const currentUserRole = computed(() => {
  return userData.value?.jabatan || authStore.user?.role || ''
})

// Menyaring opsi jabatan di form: hanya Super Admin yang bisa menunjuk Super Admin lain
const filteredJabatanOptions = computed(() => {
  const options = jabatanOptions.value || []
  const role = currentUserRole.value?.toLowerCase() || ''

  if (role.includes('super admin') || role.includes('superadmin')) {
    return options
  }

  // Saring/Hapus pilihan 'Super Admin' jika yang login bukan Super Admin
  return options.filter((opt) => {
    const label = opt.label?.toLowerCase() || ''
    const val = opt.value?.toLowerCase() || ''
    return (
      !label.includes('super admin') &&
      !label.includes('superadmin') &&
      !val.includes('super admin') &&
      !val.includes('superadmin')
    )
  })
})

// Helper Library Loaders
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const loadExternalLibraries = async () => {
  try {
    await Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'),
    ])
    await loadScript(
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js',
    )
  } catch (err) {
    console.error('Lib Error:', err)
  }
}

// Hak Akses Mapping on Divisi Change
const onDivisiChange = (val) => {
  form.value.divisi = val
  if (val === 'Konstruksi') {
    form.value.akses = ['konstruksi']
  } else if (val === 'Manufaktur') {
    form.value.akses = ['manufaktur']
  }
}

// Kalkulasi Tenure Hari / Masa Kerja secara informatif dan dinamis
const calculateTenorDays = (tglMasuk) => {
  if (!tglMasuk) return '-'
  try {
    const joiningDate = new Date(tglMasuk)
    const today = new Date()

    let years = today.getFullYear() - joiningDate.getFullYear()
    let months = today.getMonth() - joiningDate.getMonth()

    if (months < 0 || (months === 0 && today.getDate() < joiningDate.getDate())) {
      years--
      months += 12
    }

    if (years > 0) {
      return `${years} Tahun ${months} Bulan`
    }
    return `${months} Bulan`
  } catch (error) {
    console.error(error)
    return '-'
  }
}

// ACTIONS
const viewDetail = (data) => {
  selectedKaryawan.value = data
  currentView.value = 'detail'
  window.scrollTo(0, 0)
}

const editKaryawan = (data) => {
  isEditMode.value = true
  form.value = { ...data, password: '' }
  docList.value = data.docs ? [...data.docs] : [{ name: '', file: null }]
  fotoFile.value = null
  currentView.value = 'form'
  window.scrollTo(0, 0)
}

const openDialog = () => {
  isEditMode.value = false
  form.value = { ...formDefault, nik: 'KRY-' + Date.now().toString().slice(-6) }
  docList.value = [{ name: '', file: null }]
  fotoFile.value = null
  currentView.value = 'form'
  window.scrollTo(0, 0)
}

const saveKaryawan = async () => {
  if (!form.value.nama) {
    $q.notify({ type: 'warning', message: 'Nama lengkap wajib diisi!' })
    return
  }
  if (!form.value.divisi) {
    $q.notify({ type: 'warning', message: 'Divisi wajib dipilih!' })
    return
  }

  $q.loading.show({ message: 'Menyimpan data karyawan...' })
  submitting.value = true

  try {
    let fotoUrl = form.value.fotoUrl || null
    if (fotoFile.value) {
      const fRef = storageRef(storage, `karyawan/avatars/${Date.now()}_${fotoFile.value.name}`)
      await uploadBytes(fRef, fotoFile.value)
      fotoUrl = await getDownloadURL(fRef)
    }

    const payload = JSON.parse(JSON.stringify(form.value))
    payload.fotoUrl = fotoUrl
    payload.updatedAt = serverTimestamp()

    const docId = payload.id
    delete payload.id
    delete payload.password

    if (docId) {
      await updateDoc(doc(db, 'karyawan', docId), payload)
    } else {
      const cred = await createUserWithEmailAndPassword(auth, form.value.email, form.value.password)
      payload.uid = cred.user.uid
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'karyawan'), payload)
    }

    currentView.value = 'list'
    $q.notify({ type: 'positive', message: 'Data karyawan berhasil disimpan!' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: error.message })
  } finally {
    $q.loading.hide()
    submitting.value = false
  }
}

// FIXED: Hapus Karyawan dengan dialog konfirmasi yang fungsional
const deleteKaryawan = (row) => {
  $q.dialog({
    title: '<span class="text-red text-weight-bold">Konfirmasi Hapus</span>',
    message: `Apakah Anda yakin ingin menghapus data karyawan <b>${row.nama}</b> (NIK: ${row.nik}) secara permanen dari sistem?`,
    html: true,
    cancel: { label: 'Batal', flat: true, color: 'grey-7', noCaps: true },
    ok: {
      label: 'Hapus Karyawan',
      color: 'negative',
      unelevated: true,
      rounded: true,
      noCaps: true,
    },
    persistent: true,
  }).onOk(async () => {
    $q.loading.show({ message: 'Menghapus data karyawan...' })
    try {
      await deleteDoc(doc(db, 'karyawan', row.id))
      $q.notify({
        type: 'positive',
        message: `Data karyawan ${row.nama} berhasil dihapus dari sistem!`,
        position: 'top',
      })
    } catch (error) {
      console.error('Error saat menghapus karyawan:', error)
      $q.notify({
        type: 'negative',
        message: 'Gagal menghapus data karyawan dari server.',
      })
    } finally {
      $q.loading.hide()
    }
  })
}

// ============================================================================
// PREMIUM EXPORTS (BEAUTIFUL & COLORFUL)
// ============================================================================
const exportToExcel = () => {
  try {
    const thStyle =
      'background-color: #1a237e; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 12px; text-align: left; text-transform: uppercase;'
    const tdStyle =
      'border: 1px solid #cbd5e1; padding: 10px; vertical-align: top; font-family: sans-serif;'

    let tableHtml =
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">'
    tableHtml += '<head><meta charset="utf-8"></head><body>'
    tableHtml +=
      '<h2 style="color: #1a237e; margin-bottom: 5px; font-family: sans-serif;">Database Karyawan Resmi</h2>'
    tableHtml +=
      '<p style="margin-top: 0; font-family: sans-serif; color: #64748b;">Tanggal Ekspor: ' +
      new Date().toLocaleString('id-ID') +
      ' | PT Agra Abhinaya Perkasa</p><br>'
    tableHtml += '<table style="border-collapse: collapse; width: 100%; font-family: sans-serif;">'
    tableHtml += '<thead><tr>'
    tableHtml += `<th style="${thStyle}">No</th>`
    tableHtml += `<th style="${thStyle}">NIK</th>`
    tableHtml += `<th style="${thStyle}">Nama Lengkap</th>`
    tableHtml += `<th style="${thStyle}">Jabatan</th>`
    tableHtml += `<th style="${thStyle}">Divisi</th>`
    tableHtml += `<th style="${thStyle}">Email</th>`
    tableHtml += `<th style="${thStyle}">No HP</th>`
    tableHtml += `<th style="${thStyle}">Mulai Kerja</th>`
    tableHtml += '</tr></thead><tbody>'

    karyawanList.value.forEach((r, idx) => {
      tableHtml += `
        <tr>
          <td style="${tdStyle} text-align: center;">${idx + 1}</td>
          <td style="${tdStyle} mso-number-format:'@'; font-weight: bold;">${r.nik || '-'}</td>
          <td style="${tdStyle} font-weight: bold; color: #1a237e; text-transform: uppercase;">${r.nama || '-'}</td>
          <td style="${tdStyle}">${r.jabatan || '-'}</td>
          <td style="${tdStyle}">${r.divisi || '-'}</td>
          <td style="${tdStyle}">${r.email || '-'}</td>
          <td style="${tdStyle} mso-number-format:'@';">${r.hp || '-'}</td>
          <td style="${tdStyle} text-align: center;">${r.tglMasuk || '-'}</td>
        </tr>
      `
    })

    tableHtml += '</tbody></table></body></html>'
    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Database_Karyawan_${Date.now()}.xls`
    link.click()
    URL.revokeObjectURL(url)

    $q.notify({ type: 'positive', message: 'Database Karyawan Berhasil Diekspor!' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal mengekspor data ke Excel.' })
  }
}

const exportToPDF = () => {
  const element = document.getElementById('table-pdf-export')
  if (!element) return

  const opt = {
    margin: [10, 10, 10, 10],
    filename: `List_Karyawan_AGRA_${Date.now()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
  }

  $q.loading.show({ message: 'Mempersiapkan PDF Laporan...' })
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => $q.loading.hide())
    .catch((err) => {
      console.error(err)
      $q.loading.hide()
    })
}

const exportSinglePDF = (k) => {
  const jspdf = window.jspdf
  if (!jspdf) {
    $q.notify({ type: 'warning', message: 'Library cetak PDF belum termuat.' })
    return
  }
  const doc = new jspdf.jsPDF('p', 'mm', 'a4')

  // Header Accent Block
  doc.setFillColor(26, 35, 126) // #1a237e
  doc.rect(0, 0, 210, 45, 'F')

  // PT Name & Document title
  doc.setTextColor(255, 255, 255)
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('PT AGRA ABHINAYA PERKASA', 20, 18)
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('DOKUMEN PROFIL RESMI KARYAWAN', 20, 26)

  // Profile Details Table Box
  doc.setFillColor(248, 250, 252)
  doc.rect(15, 55, 180, 100, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.rect(15, 55, 180, 100, 'D')

  doc.setTextColor(15, 23, 42)
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('DATA PERSONAL KARYAWAN', 25, 70)

  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(71, 85, 105)

  let y = 82
  const drawField = (label, val) => {
    doc.setFont('Helvetica', 'bold')
    doc.text(`${label}:`, 25, y)
    doc.setFont('Helvetica', 'normal')
    doc.text(val || '-', 65, y)
    y += 10
  }

  drawField('Nama Lengkap', k.nama)
  drawField('NIK', k.nik)
  drawField('Jabatan', k.jabatan)
  drawField('Divisi Kerja', k.divisi)
  drawField('No. Handphone', k.hp)
  drawField('Email Akun', k.email)
  drawField('Mulai Kerja', k.tglMasuk)

  // Alamat Box
  doc.setFont('Helvetica', 'bold')
  doc.text('Alamat Domisili:', 25, 165)
  doc.setFont('Helvetica', 'normal')
  doc.text(k.alamat || '-', 25, 172, { maxWidth: 160 })

  doc.save(`Profil_${k.nama.replace(/\s+/g, '_')}.pdf`)
  $q.notify({ type: 'positive', message: 'Profil Karyawan Berhasil Dicetak!' })
}

const openLink = (url) => {
  if (url) window.open(url, '_blank')
}

// eslint-disable-next-line no-unused-vars
const isImage = (url) => {
  if (!url) return false
  return (
    url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null ||
    url.includes('alt=media') ||
    url.startsWith('data:image/')
  )
}

const formatDateIndo = (d) => {
  if (!d || d === '-') return '-'
  const date = new Date(d)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  await loadExternalLibraries()

  // 1. Pantau Hak Akses User Real-time
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) {
        userData.value = snapshot.docs[0].data()
      }
    })
  }

  // 2. Ambil List Karyawan Real-time (SINKRONISASI TOTAL: JS Sorting di memori untuk mencegah hilangnya data lama tanpa createdAt)
  const qKaryawan = query(collection(db, 'karyawan'))
  unsubKaryawan = onSnapshot(
    qKaryawan,
    (s) => {
      karyawanList.value = s.docs
        .map((d) => ({ ...d.data(), id: d.id }))
        .sort((a, b) => {
          const dateA = a.createdAt?.seconds ? a.createdAt.seconds : 0
          const dateB = b.createdAt?.seconds ? b.createdAt.seconds : 0
          return dateB - dateA
        })
      // eslint-disable-next-line no-undef
      loading.value = false
    },
    (err) => {
      console.error(err)
      // eslint-disable-next-line no-undef
      loading.value = false
    },
  )

  // 3. Ambil List Jabatan Real-time
  const qJabatan = query(collection(db, 'jabatan'))
  unsubJabatan = onSnapshot(qJabatan, (s) => {
    jabatanOptions.value = s.docs.map((d) => ({
      label: d.data().namaJabatan,
      value: d.data().namaJabatan,
    }))
  })
})

onUnmounted(() => {
  if (unsubUser) unsubUser()
  if (unsubKaryawan) unsubKaryawan()
  if (unsubJabatan) unsubJabatan()
})

const columns = [
  { name: 'nik', label: 'NIK', field: 'nik', align: 'left', sortable: true },
  { name: 'nama', label: 'NAMA KARYAWAN', field: 'nama', align: 'left', sortable: true },
  { name: 'jabatan', label: 'JABATAN / DIVISI', field: 'jabatan', align: 'left', sortable: true },
  { name: 'actions', label: 'AKSI', field: 'id', align: 'right' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.font-pro {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    sans-serif;
}
.rounded-borders {
  border-radius: 12px;
}
.rounded-16 {
  border-radius: 16px;
}
.rounded-20 {
  border-radius: 20px;
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.border-dashed {
  border: 2px dashed #cbd5e1;
}
.dashed-box {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
}
.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.03) !important;
}
.border-white-5 {
  border: 5px solid white;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(25, 118, 210, 0.15);
}
.shadow-soft {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
}
.shadow-15 {
  box-shadow: 0 15px 35px rgba(26, 35, 126, 0.15);
}
.karyawan-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #263238;
  color: white;
}
.leading-none {
  line-height: 1;
}

.float-icon {
  position: absolute;
  bottom: -150px;
  color: #1a237e;
  opacity: 0.03;
  animation: floatUp 24s infinite linear;
  will-change: transform, opacity;
}
@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(0deg) scale(0.8);
    opacity: 0;
  }
  10% {
    opacity: 0.03;
  }
  90% {
    opacity: 0.03;
  }
  100% {
    transform: translateY(-110vh) rotate(360deg) scale(1.2);
    opacity: 0;
  }
}

.floating-construction-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}
.z-index-10 {
  position: relative;
  z-index: 10;
}
.h-full-view {
  min-height: 100vh;
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

/* =======================================================================
   TABLE PDF EXPORT STYLES (LANDSCAPE)
   ======================================================================= */
.landscape-paper {
  background: white;
  width: 297mm;
  min-height: 210mm;
  padding: 10mm 15mm;
  margin: 0;
  color: #1a1a1a;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
}
.pdf-export-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Inter', Arial, sans-serif;
  margin-top: 10px;
}
.pdf-export-table th {
  background-color: #1a237e !important;
  color: #ffffff !important;
  padding: 10px;
  font-size: 11px;
  border: 1px solid #1a237e;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.pdf-export-table td {
  padding: 10px;
  font-size: 10px;
  border: 1px solid #e0e0e0;
  color: #1e293b;
  vertical-align: top;
}

@media print {
  body {
    background: white !important;
  }
  .no-print {
    display: none !important;
  }
}

/* =======================================================================
   MODERN SAAS UI COMPACT COMPONENT DESIGN
   ======================================================================= */
.bg-saas-base {
  background-color: #f8fafc;
}
.saas-header-icon {
  width: 56px;
  height: 56px;
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}
.saas-btn-primary {
  border-radius: 10px;
  background-color: #1a237e !important; /* Corporate Indigo */
  box-shadow: 0 4px 6px -1px rgba(26, 35, 126, 0.2);
  transition: all 0.2s;
}
.saas-btn-primary:hover {
  background-color: #0f172a !important;
  transform: translateY(-1px);
}
.saas-btn-outline {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background-color: white;
  transition: all 0.2s;
}
.saas-input :deep(.q-field__control) {
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  transition: all 0.2s ease;
}
.saas-input :deep(.q-field__control:before),
.saas-input :deep(.q-field__control:after) {
  display: none !important;
}
.saas-label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}
.saas-table :deep(.q-table__container) {
  border-radius: 16px;
  border: none;
}
.saas-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px;
}
.saas-table :deep(tbody td) {
  border-bottom: 1px solid #f1f5f9;
  padding: 14px 16px;
}
.saas-hover-row {
  transition: all 0.2s ease;
}
.saas-hover-row:hover {
  background-color: #f8fafc !important;
}

.saas-action-btn {
  transition: all 0.2s;
}
.saas-action-btn:hover {
  background-color: #f1f5f9 !important;
  transform: scale(1.05);
}

.saas-gradient-primary {
  background: linear-gradient(135deg, #1a237e 0%, #3b82f6 100%);
  position: relative;
  overflow: hidden;
}
.saas-blur-blob {
  position: absolute;
  width: 250px;
  height: 250px;
  background: rgba(255, 255, 255, 0.15);
  filter: blur(50px);
  border-radius: 50%;
  top: -70px;
  right: -50px;
}

/* Detail Profile Specifics */
.profile-header-overlap {
  margin-top: -65px;
  position: relative;
  z-index: 5;
}
.avatar-ring {
  padding: 6px;
  background: white;
  border-radius: 50%;
  display: inline-block;
  position: relative;
}
.status-badge-dot {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 4px solid white;
  border-radius: 50%;
  bottom: 10px;
  right: 10px;
}
.kpi-mini-card {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  min-height: 75px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.detail-table {
  width: 100%;
  border-collapse: collapse;
}
.detail-table td {
  padding: 12px 0;
  font-size: 13.5px;
  border-bottom: 1px solid #f1f5f9;
}
.detail-table tr:last-child td {
  border-bottom: none;
}
.detail-table td:first-child {
  width: 35%;
  color: #64748b;
  font-weight: 500;
}
.detail-table td:last-child {
  color: #1e293b;
}

/* CUSTOM STYLING UTILITIES FOR MODERN SLATE LOOK */
.bg-slate-50 {
  background-color: #f8fafc !important;
}
.text-slate-800 {
  color: #1e293b !important;
}
.text-slate-500 {
  color: #64748b !important;
}
.text-slate-600 {
  color: #475569 !important;
}
.text-slate-900 {
  color: #0f172a !important;
}
.border-subtle {
  border: 1px solid #e2e8f0 !important;
}
.border-bottom-subtle {
  border-bottom: 1px solid #f1f5f9 !important;
}
.avatar-ring {
  background: white;
  padding: 4px;
  border-radius: 50%;
  display: inline-block;
}
.shadow-premium {
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.05),
    0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
}
</style>
