<template>
  <q-page class="bg-slate-50 q-pa-md q-pa-lg-xl font-inter">
    <!-- ============================================================ -->
    <!-- LOADING STATE: Saat cek hak akses berlangsung                -->
    <!-- ============================================================ -->
    <div v-if="aksesLoading" class="flex flex-center" style="min-height: 60vh">
      <div class="text-center">
        <q-spinner-orbit color="amber-9" size="60px" class="q-mb-md" />
        <div class="text-subtitle1 text-blue-grey-7 text-weight-medium">Memeriksa hak akses...</div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- AKSES DITOLAK: Tampil jika tidak punya izin                  -->
    <!-- ============================================================ -->
    <div v-else-if="!aksesGranted" class="flex flex-center" style="min-height: 60vh">
      <q-card
        flat
        bordered
        class="rounded-borders q-pa-xl text-center shadow-2"
        style="max-width: 420px"
      >
        <q-icon name="lock" color="red-4" size="80px" class="q-mb-md" />
        <div class="text-h6 text-weight-bold text-blue-grey-10 q-mb-sm">Akses Ditolak</div>
        <div class="text-body2 text-grey-7 q-mb-lg">
          Anda tidak memiliki izin untuk mengakses modul
          <strong>Absensi Harian Lepas</strong>. Silakan hubungi administrator untuk pengaturan hak
          akses.
        </div>
        <q-btn
          unelevated
          color="indigo-10"
          icon="arrow_back"
          label="Kembali ke Dashboard"
          rounded
          @click="router.replace('/')"
        />
      </q-card>
    </div>

    <!-- ============================================================ -->
    <!-- KONTEN UTAMA: Hanya tampil jika aksesGranted === true        -->
    <!-- ============================================================ -->
    <template v-else>
      <div class="premium-container mx-auto">
        <!-- ========================================== -->
        <!-- HEADER BANNER PREMIUM                      -->
        <!-- ========================================== -->
        <div class="row items-center justify-between q-mb-lg no-print animate-fade-in">
          <div class="col-12 col-md-8">
            <div class="row items-center q-mb-xs">
              <div class="ios-icon-box small bg-amber-50 text-amber-9 q-mr-sm">
                <q-icon name="engineering" size="22px" />
              </div>
              <h4
                class="text-h4 text-weight-black text-blue-grey-10 q-ma-none letter-spacing-tight"
              >
                {{ projectSetup.nama || 'Absensi Pekerja Harian' }}
              </h4>
            </div>
            <div
              class="text-subtitle1 text-blue-grey-6 q-mt-sm line-height-normal font-mono text-xs"
            >
              <q-icon name="tag" class="q-mr-xs" /> KODE:
              {{ projectSetup.kode || 'BELUM DI-SETUP' }}
              <span class="q-mx-sm">•</span>
              <q-icon name="place" class="q-mr-xs" /> LOKASI:
              {{ projectSetup.lokasi || 'BELUM DI-SETUP' }}
            </div>
          </div>
          <div class="col-12 col-md-auto q-mt-md q-md-mt-none row q-gutter-sm">
            <q-badge
              color="amber-2"
              text-color="amber-10"
              class="text-weight-bold q-px-md q-py-sm rounded-8 shadow-sm"
            >
              <q-icon name="event" class="q-mr-xs" /> {{ formatTanggalIndo(selectedDate) }}
            </q-badge>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- TABS NAVIGASI PREMIUM                      -->
        <!-- ========================================== -->
        <q-card flat class="bento-card bg-white q-mb-lg no-print shadow-soft overflow-hidden">
          <q-tabs
            v-model="activeTab"
            dense
            class="text-grey-7 bg-slate-50"
            active-color="amber-9"
            indicator-color="amber-9"
            align="left"
            narrow-indicator
          >
            <q-tab
              name="setup"
              icon="settings"
              label="Setup Proyek"
              class="text-weight-bold q-py-md"
            />
            <q-tab
              name="mandor"
              icon="groups"
              label="Mandor & Pekerja"
              class="text-weight-bold q-py-md"
            />
            <q-tab
              name="absen"
              icon="assignment_turned_in"
              label="Input Absensi"
              class="text-weight-bold q-py-md"
            />
            <q-tab
              name="rekap"
              icon="analytics"
              label="Rekap & Upah"
              class="text-weight-bold q-py-md"
            />
          </q-tabs>
        </q-card>

        <!-- ========================================== -->
        <!-- TAB PANELS CONTENT                         -->
        <!-- ========================================== -->
        <q-tab-panels v-model="activeTab" animated keep-alive class="bg-transparent">
          <!-- PANEL 1: SETUP PROYEK -->
          <q-tab-panel name="setup" class="q-pa-none">
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-8">
                <q-card flat class="bento-card bg-white q-pa-lg shadow-soft">
                  <div
                    class="text-subtitle1 text-weight-bold text-blue-grey-9 q-mb-md flex items-center"
                  >
                    <q-icon name="info" color="amber-8" class="q-mr-xs" /> Informasi Utama Proyek
                  </div>
                  <div class="row q-col-gutter-md">
                    <q-input
                      v-model="projectSetup.nama"
                      outlined
                      dense
                      label="Nama Proyek"
                      class="col-12 col-sm-6 rounded-input"
                      placeholder="Contoh: Gedung Kantor Pusat"
                    />
                    <q-input
                      v-model="projectSetup.kode"
                      outlined
                      dense
                      label="Nomor Kontrak / Kode Proyek"
                      class="col-12 col-sm-6 rounded-input"
                      placeholder="Contoh: PKT/2026/001"
                    />
                    <q-input
                      v-model="projectSetup.lokasi"
                      outlined
                      dense
                      label="Lokasi Proyek"
                      class="col-12 col-sm-6 rounded-input"
                      placeholder="Kota / Alamat Proyek"
                    />
                    <q-input
                      v-model="projectSetup.mandorUtama"
                      outlined
                      dense
                      label="Mandor / Sub Kontraktor Utama"
                      class="col-12 col-sm-6 rounded-input"
                      placeholder="Nama mandor utama"
                    />
                    <q-input
                      v-model="projectSetup.mulai"
                      outlined
                      dense
                      type="date"
                      stack-label
                      label="Tanggal Mulai Proyek"
                      class="col-12 col-sm-6 rounded-input"
                    />
                    <q-input
                      v-model="projectSetup.selesai"
                      outlined
                      dense
                      type="date"
                      stack-label
                      label="Tanggal Selesai Proyek"
                      class="col-12 col-sm-6 rounded-input"
                    />
                  </div>

                  <q-separator class="q-my-lg" />

                  <div
                    class="text-subtitle1 text-weight-bold text-blue-grey-9 q-mb-md flex items-center"
                  >
                    <q-icon name="tune" color="amber-8" class="q-mr-xs" /> Pengaturan Absensi &
                    Payroll
                  </div>
                  <div class="row q-col-gutter-md">
                    <q-input
                      v-model.number="projectSetup.jamKerja"
                      outlined
                      dense
                      type="number"
                      label="Jam Kerja Normal (jam/hari)"
                      class="col-12 col-sm-4 rounded-input"
                    />
                    <q-input
                      v-model.number="projectSetup.lembur"
                      outlined
                      dense
                      type="number"
                      prefix="Rp"
                      label="Upah Lembur per Jam"
                      class="col-12 col-sm-4 rounded-input"
                    />
                    <q-input
                      v-model="projectSetup.tglAbsen"
                      outlined
                      dense
                      type="date"
                      stack-label
                      label="Tanggal Absensi Aktif"
                      class="col-12 col-sm-4 rounded-input"
                    />
                  </div>

                  <div class="q-mt-lg">
                    <q-btn
                      unelevated
                      color="amber-9"
                      icon="save"
                      label="Simpan Pengaturan Proyek"
                      class="rounded-12 text-weight-bold q-px-lg"
                      @click="saveSetup"
                      :disable="!bisa.ubah && !bisa.buat"
                    />
                  </div>
                </q-card>
              </div>

              <div class="col-12 col-md-4">
                <q-card flat class="bento-card bg-white q-pa-lg shadow-soft full-height">
                  <div class="text-subtitle1 text-weight-bold text-blue-grey-9 q-mb-md">
                    Legenda Kehadiran
                  </div>
                  <div class="row q-col-gutter-xs q-mb-md">
                    <div class="col-6">
                      <q-badge
                        class="s-hadir full-width q-pa-sm rounded-6 text-weight-bold text-center flex justify-center"
                        >✔ HADIR</q-badge
                      >
                    </div>
                    <div class="col-6">
                      <q-badge
                        class="s-setengah full-width q-pa-sm rounded-6 text-weight-bold text-center flex justify-center"
                        >½ SETENGAH HARI</q-badge
                      >
                    </div>
                    <div class="col-6">
                      <q-badge
                        class="s-izin full-width q-pa-sm rounded-6 text-weight-bold text-center flex justify-center"
                        >📋 IZIN</q-badge
                      >
                    </div>
                    <div class="col-6">
                      <q-badge
                        class="s-sakit full-width q-pa-sm rounded-6 text-weight-bold text-center flex justify-center"
                        >🤒 SAKIT</q-badge
                      >
                    </div>
                    <div class="col-6">
                      <q-badge
                        class="s-alpha full-width q-pa-sm rounded-6 text-weight-bold text-center flex justify-center"
                        >✕ ALPHA</q-badge
                      >
                    </div>
                    <div class="col-6">
                      <q-badge
                        class="s-libur full-width q-pa-sm rounded-6 text-weight-bold text-center flex justify-center"
                        >🏖 LIBUR</q-badge
                      >
                    </div>
                  </div>
                  <q-separator class="q-my-sm" />
                  <div class="text-caption text-blue-grey-6 leading-relaxed">
                    <span class="text-weight-bold text-blue-grey-8 d-block q-mb-xs"
                      >⚙️ Rumus Hitung Upah Harian:</span
                    >
                    <div
                      class="bg-slate-50 q-pa-sm rounded-8 font-mono text-11 q-mb-sm border border-subtle"
                    >
                      Upah = (Hadir × Upah Pokok × Koef) + (Setengah × Upah Pokok × Koef × 0.5) +
                      (Jam Lembur × Rate Lembur)
                    </div>
                    * Setiap pekerja harian lepas dapat diberikan nilai koefisien keahlian khusus
                    berbeda (Tukang = 1.00, Kepala Tukang = 1.25, Helper = 0.85).
                  </div>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- PANEL 2: MANDOR & PEKERJA -->
          <q-tab-panel name="mandor" class="q-pa-none">
            <!-- Form Tambah Mandor -->
            <q-card flat class="bento-card bg-white q-pa-lg shadow-soft q-mb-lg no-print">
              <div class="text-subtitle1 text-weight-bold text-blue-grey-9 q-mb-md">
                Tambah Kelompok Mandor / Sub-Pekerjaan
              </div>
              <div class="row q-col-gutter-md items-end">
                <q-input
                  v-model="mandorForm.nama"
                  outlined
                  dense
                  label="Nama Mandor / PJ Sub"
                  class="col-12 col-sm-4 rounded-input"
                  placeholder="Contoh: Mandor Andi"
                />
                <q-select
                  v-model="mandorForm.bidang"
                  outlined
                  dense
                  :options="bidangOptions"
                  label="Bidang / Sub Pekerjaan"
                  class="col-12 col-sm-4 rounded-input"
                />
                <q-input
                  v-model="mandorForm.hp"
                  outlined
                  dense
                  label="No. HP Mandor"
                  class="col-12 col-sm-4 rounded-input"
                  placeholder="Contoh: 0812-xxxx-xxxx"
                />
                <div class="col-12">
                  <q-btn
                    unelevated
                    color="teal-6"
                    icon="person_add"
                    label="Tambah Kelompok Mandor"
                    class="rounded-12 text-weight-bold"
                    @click="addMandor"
                    :disable="!bisa.buat"
                  />
                </div>
              </div>
            </q-card>

            <!-- List Blok Mandor & Pekerja Di Dalamnya -->
            <div
              v-if="mandors.length === 0"
              class="text-center q-pa-xl bg-white rounded-24 border border-subtle"
            >
              <q-icon name="group_off" size="4em" color="grey-4" />
              <div class="text-grey-6 text-subtitle1 q-mt-sm">
                Belum ada kelompok mandor terdaftar. Silakan tambahkan di atas.
              </div>
            </div>

            <div
              v-for="(m, mi) in mandors"
              :key="m.id"
              class="mandor-container bg-white q-mb-lg rounded-24 border border-subtle shadow-soft overflow-hidden"
            >
              <!-- Header Mandor Group -->
              <div class="bg-slate-50 q-pa-md row items-center justify-between border-bottom">
                <div class="row items-center">
                  <q-avatar
                    :style="{
                      backgroundColor: getMandorColor(mi) + '22',
                      color: getMandorColor(mi),
                    }"
                    size="40px"
                    font-size="20px"
                    class="q-mr-md text-weight-bold"
                  >
                    {{ mi + 1 }}
                  </q-avatar>
                  <div>
                    <div class="text-subtitle1 text-weight-bold text-blue-grey-10 uppercase">
                      {{ m.nama }}
                    </div>
                    <div class="text-caption text-blue-grey-5 font-medium">
                      BIDANG: {{ m.bidang || 'Umum' }} <span class="q-mx-xs">•</span> TELP:
                      {{ m.hp || '-' }} <span class="q-mx-xs">•</span> TOTAL:
                      {{ m.pekerja ? m.pekerja.length : 0 }} Pekerja
                    </div>
                  </div>
                </div>
                <q-btn
                  flat
                  dense
                  round
                  icon="delete"
                  color="red-5"
                  class="no-print"
                  @click="deleteMandor(m.id)"
                  :disable="!bisa.hapus"
                />
              </div>

              <!-- Body Mandor Group: Input Pekerja Baru & Tabel List Pekerja -->
              <div class="q-pa-md">
                <!-- Baris Form Pekerja -->
                <div
                  class="row q-col-gutter-sm items-end q-mb-md no-print bg-amber-50/40 q-pa-sm rounded-12 border border-dashed border-amber-200"
                >
                  <q-input
                    v-model="pekerjaForms[m.id].nama"
                    outlined
                    dense
                    bg-color="white"
                    label="Nama Pekerja"
                    class="col-12 col-sm-3 rounded-input"
                    placeholder="Nama lengkap pekerja harian"
                  />
                  <q-select
                    v-model="pekerjaForms[m.id].jabatan"
                    outlined
                    dense
                    bg-color="white"
                    :options="jabatanOptions"
                    label="Jabatan"
                    class="col-12 col-sm-3 rounded-input"
                  />
                  <q-input
                    v-model.number="pekerjaForms[m.id].upahHari"
                    outlined
                    dense
                    bg-color="white"
                    type="number"
                    prefix="Rp"
                    label="Upah Base / Hari"
                    class="col-12 col-sm-3 rounded-input"
                  />
                  <q-input
                    v-model.number="pekerjaForms[m.id].koef"
                    outlined
                    dense
                    bg-color="white"
                    type="number"
                    step="0.05"
                    label="Koefisien Multiplier"
                    class="col-12 col-sm-2 rounded-input"
                  />
                  <div class="col-12 col-sm-1">
                    <q-btn
                      unelevated
                      color="teal-6"
                      icon="add"
                      class="full-width rounded-12 q-py-sm"
                      @click="addPekerja(m.id)"
                    />
                  </div>
                </div>

                <!-- Tabel Pekerja Harian Group Mandor -->
                <div
                  v-if="!m.pekerja || m.pekerja.length === 0"
                  class="text-center text-grey-5 text-caption q-py-md"
                >
                  Belum ada pekerja di dalam kelompok mandor ini.
                </div>
                <div v-else class="overflow-x-auto">
                  <table class="abs-tbl">
                    <thead>
                      <tr class="bg-slate-50">
                        <th style="width: 40px" class="text-center">#</th>
                        <th>NAMA PEKERJA</th>
                        <th class="text-center">JABATAN</th>
                        <th class="text-right">UPAH BASE / HARI</th>
                        <th class="text-center">KOEF.</th>
                        <th class="text-right">UPAH EFEKTIF / HARI</th>
                        <th style="width: 60px" class="text-center no-print">AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(p, pi) in m.pekerja" :key="p.id">
                        <td class="text-center text-grey-5 text-weight-bold font-mono">
                          {{ pi + 1 }}
                        </td>
                        <td class="text-weight-bold text-blue-grey-9 uppercase">{{ p.nama }}</td>
                        <td class="text-center">
                          <q-badge
                            color="indigo-1"
                            text-color="indigo-9"
                            class="text-weight-bold q-px-sm q-py-xs rounded-6"
                          >
                            {{ p.jabatan || 'Tukang' }}
                          </q-badge>
                        </td>
                        <td class="text-right font-mono font-medium">
                          Rp {{ formatUang(p.upahHari) }}
                        </td>
                        <td class="text-center text-weight-bold text-amber-9 font-mono">
                          {{ (p.koef || 1.0).toFixed(2) }}x
                        </td>
                        <td class="text-right text-weight-bold text-teal-7 font-mono">
                          Rp {{ formatUang((p.upahHari || 0) * (p.koef || 1.0)) }}
                        </td>
                        <td class="text-center no-print">
                          <q-btn
                            flat
                            dense
                            round
                            icon="close"
                            color="red-4"
                            size="sm"
                            @click="deletePekerja(m.id, p.id)"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- PANEL 3: INPUT ABSENSI HARIAN -->
          <q-tab-panel name="absen" class="q-pa-none">
            <!-- Control Header Absensi -->
            <q-card flat class="bento-card bg-white q-pa-md q-mb-lg shadow-soft no-print">
              <div class="row items-center justify-between q-col-gutter-md">
                <div class="row items-center q-col-gutter-sm col-12 col-md-6">
                  <q-input
                    v-model="selectedDate"
                    outlined
                    dense
                    type="date"
                    stack-label
                    label="Tanggal Absensi"
                    @update:model-value="onDateChange"
                    class="rounded-input bg-slate-50 text-weight-bold"
                    style="width: 200px"
                  />
                  <q-input
                    :model-value="getNamaHari(selectedDate)"
                    readonly
                    outlined
                    dense
                    label="Hari"
                    class="rounded-input font-mono font-bold text-orange-9"
                    style="width: 160px; background-color: #fffbeb"
                  />
                </div>
                <div class="col-12 col-md-6 row justify-end q-gutter-sm">
                  <q-btn
                    outline
                    color="indigo-7"
                    icon="content_copy"
                    label="Salin Hari Kemarin"
                    class="rounded-12 text-weight-bold bg-white"
                    @click="copyYesterdayAttendance"
                    :disable="!bisa.ubah && !bisa.buat"
                  />
                  <q-btn
                    unelevated
                    color="amber-9"
                    icon="save"
                    label="Simpan Log Absensi"
                    class="rounded-12 text-weight-bold shadow-soft"
                    @click="saveAttendanceLog"
                    :disable="!bisa.ubah && !bisa.buat"
                  />
                  <q-btn
                    flat
                    color="blue-grey-6"
                    icon="print"
                    class="bg-grey-2 rounded-12"
                    @click="triggerPrint"
                  />
                </div>
              </div>
            </q-card>

            <!-- Render Blocks Kelompok Absensi Per Mandor -->
            <div
              v-if="mandors.length === 0"
              class="text-center q-pa-xl bg-white rounded-24 border border-subtle"
            >
              <div class="text-grey-6">
                Belum ada grup pekerja harian terdaftar. Selesaikan konfigurasi di tab Mandor &
                Pekerja.
              </div>
            </div>

            <div
              v-for="(m, mi) in mandors"
              :key="'abs-' + m.id"
              class="mandor-container bg-white q-mb-lg rounded-24 border border-subtle shadow-soft overflow-hidden"
            >
              <!-- Header Group Absen -->
              <div class="bg-slate-50 q-pa-md row items-center justify-between border-bottom">
                <div class="row items-center">
                  <q-avatar
                    :style="{
                      backgroundColor: getMandorColor(mi) + '22',
                      color: getMandorColor(mi),
                    }"
                    size="36px"
                    font-size="18px"
                    class="q-mr-md text-weight-bold"
                  >
                    <q-icon name="engineering" />
                  </q-avatar>
                  <div>
                    <div class="text-subtitle2 text-weight-bold text-blue-grey-10 uppercase">
                      {{ m.nama }}
                    </div>
                    <div class="text-caption text-blue-grey-5 font-mono">
                      SUB: {{ m.bidang || 'Umum' }}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-caption text-grey-6">Akumulasi Upah Grup:</span>
                  <div class="text-subtitle1 text-weight-black text-amber-9 font-mono">
                    Rp {{ formatUang(calculateMandorDailyTotal(m.id)) }}
                  </div>
                </div>
              </div>

              <!-- Table Input Absensi -->
              <div class="q-pa-md">
                <div
                  v-if="!m.pekerja || m.pekerja.length === 0"
                  class="text-center text-grey-5 text-caption q-py-sm"
                >
                  Tidak ada pekerja dalam kelompok mandor ini.
                </div>
                <div v-else class="overflow-x-auto">
                  <table class="abs-tbl">
                    <thead>
                      <tr class="bg-slate-50">
                        <th style="width: 40px" class="text-center">#</th>
                        <th style="min-width: 180px">NAMA PEKERJA</th>
                        <th style="width: 150px" class="text-right">BASE RATE / HR</th>
                        <th style="width: 180px" class="text-center">STATUS KEHADIRAN</th>
                        <th style="width: 110px" class="text-center">JAM LEMBUR</th>
                        <th style="width: 160px" class="text-right">UPAH HARI INI</th>
                        <!-- REVISI EMAS: Pembetulan tag penutup yang salah ketik dari h3 ke th -->
                        <th style="min-width: 180px">KETERANGAN / LOG</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(p, pi) in m.pekerja" :key="'row-abs-' + p.id">
                        <td class="text-center text-grey-5 font-mono">{{ pi + 1 }}</td>
                        <td>
                          <div class="text-weight-bold text-blue-grey-9 uppercase">
                            {{ p.nama }}
                          </div>
                          <div class="text-11 text-grey-5 font-mono">
                            {{ p.jabatan || 'Tukang' }} • {{ (p.koef || 1.0).toFixed(2) }}x
                          </div>
                        </td>
                        <td class="text-right font-mono text-grey-7 font-medium">
                          Rp {{ formatUang(p.upahHari) }}
                        </td>
                        <td class="text-center">
                          <select
                            v-model="getAttendanceState(m.id, p.id).status"
                            :class="[
                              'status-sel text-weight-bold uppercase',
                              getStatusClass(getAttendanceState(m.id, p.id).status),
                            ]"
                            @change="recalculateRowWage(m.id, p.id)"
                          >
                            <option value="hadir">✔ Hadir</option>
                            <option value="setengah">½ Setengah Hari</option>
                            <option value="izin">📋 Izin</option>
                            <option value="sakit">🤒 Sakit</option>
                            <option value="alpha">✕ Alpha</option>
                            <option value="libur">🏖 Libur</option>
                          </select>
                        </td>
                        <td class="text-center">
                          <q-input
                            v-model.number="getAttendanceState(m.id, p.id).lembur"
                            type="number"
                            step="0.5"
                            min="0"
                            max="12"
                            dense
                            outlined
                            class="rounded-input text-center font-bold font-mono"
                            style="width: 80px; margin: 0 auto"
                            @update:model-value="recalculateRowWage(m.id, p.id)"
                          />
                        </td>
                        <td
                          class="text-right text-weight-black text-amber-9 font-mono text-subtitle2"
                        >
                          Rp
                          {{ formatUang(calculateRowDailyWage(p, getAttendanceState(m.id, p.id))) }}
                        </td>
                        <td>
                          <q-input
                            v-model="getAttendanceState(m.id, p.id).ket"
                            dense
                            outlined
                            placeholder="Keterangan..."
                            class="rounded-input text-caption"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- PANEL 4: REKAPITULASI & STATISTIK PAYROLL -->
          <q-tab-panel name="rekap" class="q-pa-none">
            <!-- Filter Jangkauan Rekap -->
            <q-card flat class="bento-card bg-white q-pa-md q-mb-lg shadow-soft no-print">
              <div class="row items-center q-col-gutter-md">
                <q-input
                  v-model="rekapRange.dari"
                  type="date"
                  outlined
                  dense
                  stack-label
                  label="Dari Tanggal"
                  class="col-12 col-sm-3 rounded-input"
                />
                <q-input
                  v-model="rekapRange.sampai"
                  type="date"
                  outlined
                  dense
                  stack-label
                  label="Sampai Tanggal"
                  class="col-12 col-sm-3 rounded-input"
                />
                <q-select
                  v-model="rekapRange.mandorId"
                  outlined
                  dense
                  :options="rekapMandorOptions"
                  emit-value
                  map-options
                  label="Filter Kelompok Mandor"
                  class="col-12 col-sm-3 rounded-input"
                />
                <div class="col-12 col-sm-3 row q-gutter-sm no-wrap">
                  <q-btn
                    unelevated
                    color="amber-9"
                    icon="search"
                    label="Tampilkan Rekap"
                    class="col rounded-12 text-weight-bold shadow-soft"
                    @click="generateReportData"
                  />
                  <q-btn
                    flat
                    color="blue-grey-6"
                    icon="print"
                    class="bg-grey-2 rounded-12"
                    @click="triggerPrint"
                  />
                </div>
              </div>
            </q-card>

            <!-- KPI Boards Summary -->
            <div v-if="reportGenerated" class="row q-col-gutter-md q-mb-lg animate-fade-in">
              <div class="col-12 col-sm-6 col-md-3">
                <div class="kpi-box bg-white q-pa-md rounded-24 border border-subtle shadow-soft">
                  <div
                    class="text-overline text-grey-5 font-bold uppercase tracking-wide font-medium"
                  >
                    Total Pekerja
                  </div>
                  <div class="text-h4 text-weight-black text-blue-grey-10 font-mono q-mt-xs">
                    {{ kpiSummary.totalPekerja }}
                  </div>
                  <div class="text-caption text-grey-5 q-mt-xs">Orang terdaftar aktif</div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div
                  class="kpi-box bg-white q-pa-md rounded-24 border border-subtle shadow-soft border-l-4 border-l-teal"
                >
                  <div
                    class="text-overline text-teal-8 font-bold uppercase tracking-wide font-medium"
                  >
                    Total Man-Days Hadir
                  </div>
                  <div class="text-h4 text-weight-black text-teal-7 font-mono q-mt-xs">
                    {{ kpiSummary.totalHadir }}
                  </div>
                  <div class="text-caption text-grey-5 q-mt-xs">Hari-orang produktif</div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div
                  class="kpi-box bg-white q-pa-md rounded-24 border border-subtle shadow-soft border-l-4 border-l-red"
                >
                  <div
                    class="text-overline text-red-8 font-bold uppercase tracking-wide font-medium"
                  >
                    Mangkir (Alpha)
                  </div>
                  <div class="text-h4 text-weight-black text-red-6 font-mono q-mt-xs">
                    {{ kpiSummary.totalAlpha }}
                  </div>
                  <div class="text-caption text-grey-5 q-mt-xs">Hari-orang absen tanpa info</div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div
                  class="kpi-box bg-white q-pa-md rounded-24 border border-subtle shadow-soft border-l-4 border-l-amber"
                >
                  <div
                    class="text-overline text-amber-9 font-bold uppercase tracking-wide font-medium"
                  >
                    Total Anggaran Payroll
                  </div>
                  <div class="text-h5 text-weight-black text-amber-8 font-mono q-mt-sm">
                    Rp {{ formatUang(kpiSummary.totalUpah) }}
                  </div>
                  <div class="text-caption text-grey-5 q-mt-xs">Seluruh kelompok mandor</div>
                </div>
              </div>
            </div>

            <!-- Report Tables Breakdown Per Mandor -->
            <div id="rekap-content-print">
              <div
                v-if="!reportGenerated"
                class="text-center q-pa-xl bg-white rounded-24 border border-subtle text-grey-5"
              >
                Tentukan parameter rentang tanggal di atas, lalu klik <b>Tampilkan Rekap</b> untuk
                mengompilasi lembar payroll.
              </div>

              <div
                v-else-if="reportData.length === 0"
                class="text-center q-pa-xl bg-white rounded-24 border border-subtle text-grey-5"
              >
                Tidak ada data log absensi yang ditemukan pada rentang tanggal tersebut.
              </div>

              <div
                v-else
                v-for="(rm, rmi) in reportData"
                :key="'rep-m-' + rm.id"
                class="card bg-white q-pa-lg shadow-soft border border-subtle rounded-24 q-mb-lg"
              >
                <div class="row items-center justify-between border-bottom q-pb-md q-mb-md">
                  <div class="row items-center">
                    <div
                      class="indicator-bar q-mr-md"
                      :style="{ backgroundColor: getMandorColor(rmi) }"
                    ></div>
                    <div>
                      <div class="text-subtitle1 text-weight-black text-blue-grey-9 uppercase">
                        {{ rm.nama }}
                      </div>
                      <div class="text-caption text-grey-5 font-medium">
                        SUB-BIDANG: {{ rm.bidang }} • PERIODE:
                        {{ rekapRange.dari.split('-').reverse().join('/') }} -
                        {{ rekapRange.sampai.split('-').reverse().join('/') }}
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-caption text-grey-5">Subtotal Wages:</span>
                    <div class="text-h6 text-weight-black text-amber-9 font-mono">
                      Rp {{ formatUang(rm.subtotalUpah) }}
                    </div>
                  </div>
                </div>

                <div class="overflow-x-auto">
                  <table class="rekap-tbl">
                    <thead>
                      <tr class="bg-slate-50">
                        <th style="width: 40px">#</th>
                        <th>NAMA PEKERJA HARI LEPAS</th>
                        <th>JABATAN</th>
                        <th class="text-center">HADIR</th>
                        <th class="text-center">½ HARI</th>
                        <th class="text-center">IZIN</th>
                        <th class="text-center">SAKIT</th>
                        <th class="text-center">ALPHA</th>
                        <th class="text-center">LIBUR</th>
                        <th class="text-center">LEMBUR (JAM)</th>
                        <th class="text-right">TOTAL UPAH BERSIH</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(rp, rpi) in rm.pekerja" :key="'rep-p-' + rp.id">
                        <td class="text-grey-5 font-mono text-weight-bold">{{ rpi + 1 }}</td>
                        <td class="text-weight-bold text-blue-grey-9 uppercase">{{ rp.nama }}</td>
                        <td class="text-caption text-grey-6 font-medium">{{ rp.hadir }}</td>
                        <td class="text-center font-mono font-bold text-teal-6">{{ rp.hadir }}</td>
                        <td class="text-center font-mono font-bold text-cyan-6">
                          {{ rp.setengah }}
                        </td>
                        <td class="text-center font-mono text-grey-5">{{ rp.izin }}</td>
                        <td class="text-center font-mono text-amber-8">{{ rp.sakit }}</td>
                        <td class="text-center font-mono font-bold text-red-6">{{ rp.alpha }}</td>
                        <td class="text-center font-mono text-purple-5">{{ rp.libur }}</td>
                        <td class="text-center font-mono text-blue-grey-7 font-medium">
                          {{ rp.lemburJam }}
                        </td>
                        <td class="text-right text-weight-black text-amber-9 font-mono">
                          Rp {{ formatUang(rp.upahTotal) }}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr class="rekap-foot">
                        <td
                          colspan="3"
                          class="q-pa-md uppercase text-blue-grey-8 text-weight-black"
                        >
                          TOTAL GRUP GRUP {{ rm.nama.toUpperCase() }}
                        </td>
                        <td class="text-center font-mono">{{ rm.totalHadir }}</td>
                        <td class="text-center font-mono">{{ rm.totalSetengah }}</td>
                        <td class="text-center font-mono">{{ rm.totalIzin }}</td>
                        <td class="text-center font-mono">{{ rm.totalSakit }}</td>
                        <td class="text-center font-mono">{{ rm.totalAlpha }}</td>
                        <td class="text-center font-mono">{{ rm.totalLibur }}</td>
                        <td class="text-center font-mono">{{ rm.totalLembur }}</td>
                        <td class="text-right font-mono text-amber-10 font-black">
                          Rp {{ formatUang(rm.subtotalUpah) }}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <!-- Grand Total Summary Banner Card -->
              <div
                v-if="reportGenerated && reportData.length > 0"
                class="card bg-slate-900 text-white q-pa-xl rounded-24 shadow-xl border border-slate-800 relative-position overflow-hidden"
              >
                <div class="decor-circle-1 bg-amber-500 opacity-10"></div>
                <div class="row items-center justify-between no-wrap-sm">
                  <div>
                    <div
                      class="text-subtitle1 text-weight-black text-amber-50 tracking-wider uppercase"
                    >
                      GRAND TOTAL SELURUH REKAP PAYROLL
                    </div>
                    <div class="text-caption text-slate-400 font-medium q-mt-xs">
                      Akumulasi biaya operasional harian lepas dari tanggal
                      {{ rekapRange.dari.split('-').reverse().join('/') }} s/d
                      {{ rekapRange.sampai.split('-').reverse().join('/') }}
                    </div>
                  </div>
                  <div class="text-right q-mt-md q-mt-sm-none">
                    <div class="text-h3 text-weight-black text-amber-4 font-mono font-black">
                      Rp {{ formatUang(kpiSummary.totalUpah) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div> </template
    ><!-- end v-else aksesGranted -->
  </q-page>
</template>

<script setup>
/*eslint-disable*/
import { ref, onMounted, computed } from 'vue'
import { useQuasar, date } from 'quasar'
import { useRouter } from 'vue-router'
import { db, auth } from 'src/boot/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const $q = useQuasar()
const router = useRouter()

// ============================================================================
// PERMISSION GUARD — Integrasi Hak Akses (sama dengan halaman lain)
// ============================================================================
const aksesGranted = ref(false) // false = belum diverifikasi / ditolak
const aksesLoading = ref(true) // tampilkan loading saat cek akses

/**
 * Cek apakah user punya izin 'lihat' untuk menu absensi-harian-lepas
 * berdasarkan permissions_detail yang tersimpan di Firestore (koleksi 'karyawan').
 * Menu ID yang dicek: '_absensi_harian_lepas' (sesuai generateMatrixFromRoutes di AksesPage)
 */
const checkAkses = async (uid) => {
  try {
    const q = query(collection(db, 'karyawan'), where('uid', '==', uid))
    const snap = await getDocs(q)

    if (snap.empty) {
      aksesGranted.value = false
      aksesLoading.value = false
      return
    }

    const karyawan = snap.docs[0].data()

    // ✅ Super Admin — langsung izinkan
    if (karyawan.is_super_admin === true) {
      aksesGranted.value = true
      aksesLoading.value = false
      return
    }

    // ✅ Fallback role-based check
    const SUPER_ROLES = ['super admin', 'superadmin', 'direktur', 'owner']
    const jabatan = (karyawan.jabatan || '').toLowerCase().trim()
    const role = (karyawan.role || '').toLowerCase().trim()
    if (SUPER_ROLES.includes(jabatan) || SUPER_ROLES.includes(role)) {
      aksesGranted.value = true
      aksesLoading.value = false
      return
    }

    // ✅ Cek permissions_detail: cari modul 'absensi' → menu '_absensi_harian_lepas'
    const permissions = karyawan.permissions_detail || []
    const modulAbsensi = permissions.find((m) => m.id === 'absensi')

    if (modulAbsensi && modulAbsensi.isActive) {
      const menuHarianLepas = modulAbsensi.menus?.find(
        (menu) => menu.id === '_absensi_harian_lepas',
      )
      if (menuHarianLepas && menuHarianLepas.lihat === true) {
        aksesGranted.value = true
        aksesLoading.value = false
        return
      }
    }

    // Tidak punya akses
    aksesGranted.value = false
    aksesLoading.value = false
  } catch (e) {
    console.error('Gagal memeriksa hak akses harian lepas:', e)
    aksesGranted.value = false
    aksesLoading.value = false
  }
}

/**
 * Computed: apakah user bisa melakukan aksi 'buat/ubah/hapus/approve'
 * pada halaman ini — digunakan untuk disable tombol aksi sensitif.
 */
const bisa = ref({ lihat: false, buat: false, ubah: false, hapus: false, approve: false })

const loadDetailPermission = async (uid) => {
  try {
    const q = query(collection(db, 'karyawan'), where('uid', '==', uid))
    const snap = await getDocs(q)
    if (snap.empty) return

    const karyawan = snap.docs[0].data()

    if (
      karyawan.is_super_admin === true ||
      ['super admin', 'superadmin', 'direktur', 'owner'].includes(
        (karyawan.jabatan || '').toLowerCase().trim(),
      )
    ) {
      bisa.value = { lihat: true, buat: true, ubah: true, hapus: true, approve: true }
      return
    }

    const permissions = karyawan.permissions_detail || []
    const modulAbsensi = permissions.find((m) => m.id === 'absensi')
    if (modulAbsensi) {
      const menu = modulAbsensi.menus?.find((m) => m.id === '_absensi_harian_lepas')
      if (menu) {
        bisa.value = {
          lihat: menu.lihat || false,
          buat: menu.buat || false,
          ubah: menu.ubah || false,
          hapus: menu.hapus || false,
          approve: menu.approve || false,
        }
      }
    }
  } catch (e) {
    console.error('Gagal memuat detail permission harian lepas:', e)
  }
}

// --- State Navigasi ---
const activeTab = ref('setup')
const selectedDate = ref(new Date().toISOString().split('T')[0])

// --- Data Master LocalStorage Blueprint ---
const projectSetup = ref({
  nama: '',
  kode: '',
  lokasi: '',
  mandorUtama: '',
  mulai: '',
  selesai: '',
  jamKerja: 8,
  lembur: 25000,
  tglAbsen: '',
})
const mandors = ref([])
const attendanceData = ref({}) // Format: { 'YYYY-MM-DD': { mandorId: { pekerjaId: { status, lembur, ket } } } }

// --- Dropdown Master Data Options ---
const bidangOptions = [
  'Struktur & Beton',
  'Pasangan & Dinding',
  'Atap',
  'Mekanikal',
  'Elektrikal',
  'Finishing',
  'Lansekap',
  'Umum / Helper',
  'Lainnya',
]
const jabatanOptions = [
  'Tukang',
  'Kepala Tukang',
  'Pekerja / Laden',
  'Operator',
  'Helper',
  'Mandor Lapangan',
]
const MANDOR_COLORS = [
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#ec4899',
]

// --- Form Buffer Input State ---
const mandorForm = ref({ nama: '', bidang: 'Umum / Helper', hp: '' })
const pekerjaForms = ref({}) // Map buffer penampung per mandor id

// --- Report/Rekap State ---
const reportGenerated = ref(false)
const rekapRange = ref({
  dari: new Date().toISOString().split('T')[0],
  sampai: new Date().toISOString().split('T')[0],
  mandorId: '',
})
const reportData = ref([])
const kpiSummary = ref({ totalPekerja: 0, totalHadir: 0, totalAlpha: 0, totalUpah: 0 })

// --- Computed Option Rekap ---
const rekapMandorOptions = computed(() => {
  const defaults = [{ label: 'Semua Kelompok Mandor', value: '' }]
  mandors.value.forEach((m) => {
    defaults.push({ label: m.nama.toUpperCase(), value: m.id })
  })
  return defaults
})

// =====================================================================================
// MANAJEMEN CORE DATA & SYNC LOKAL (SISTEM MEMORI MIKRO ENGINE)
// =====================================================================================
const loadEngineMemory = () => {
  try {
    const memory = localStorage.getItem('agra_erp_harian_lepas_v1')
    if (memory) {
      const parsed = JSON.parse(memory)
      if (parsed.projectSetup) projectSetup.value = parsed.projectSetup
      if (parsed.mandors) mandors.value = parsed.mandors
      if (parsed.attendanceData) attendanceData.value = parsed.attendanceData
    }
  } catch (e) {
    console.error('Gagal memuat memori lokal harian lepas:', e)
  }

  // Sinkronisasi sink struktur form dinamis
  syncPekerjaFormsStructure()
  if (projectSetup.value.tglAbsen) {
    selectedDate.value = projectSetup.value.tglAbsen
  }
}

const commitEngineMemory = () => {
  try {
    const payload = {
      projectSetup: projectSetup.value,
      mandors: mandors.value,
      attendanceData: attendanceData.value,
    }
    localStorage.setItem('agra_erp_harian_lepas_v1', JSON.stringify(payload))
  } catch (e) {
    console.error('Gagal menulis enkripsi memori lokal harian lepas:', e)
  }
}

const syncPekerjaFormsStructure = () => {
  mandors.value.forEach((m) => {
    if (!pekerjaForms.value[m.id]) {
      pekerjaForms.value[m.id] = { nama: '', jabatan: 'Tukang', upahHari: 150000, koef: 1.0 }
    }
  })
}

// =====================================================================================
// LOGIKA AKSI TAB 1: SETUP
// =====================================================================================
const saveSetup = () => {
  if (projectSetup.value.tglAbsen) {
    selectedDate.value = projectSetup.value.tglAbsen
  }
  commitEngineMemory()
  $q.notify({ type: 'positive', message: 'Setup konfigurasi proyek berhasil diperbarui!' })
}

// =====================================================================================
// LOGIKA AKSI TAB 2: MANAJEMEN GRUP MANDOR & PEKERJA
// =====================================================================================
const addMandor = () => {
  if (!mandorForm.value.nama) {
    $q.notify({ type: 'warning', message: 'Nama mandor wajib diisi!' })
    return
  }
  const id = 'MND-' + Date.now()
  mandors.value.push({
    id,
    nama: mandorForm.value.nama.trim().toUpperCase(),
    bidang: mandorForm.value.bidang,
    hp: mandorForm.value.hp.trim(),
    pekerja: [],
  })

  mandorForm.value = { nama: '', bidang: 'Umum / Helper', hp: '' }
  syncPekerjaFormsStructure()
  commitEngineMemory()
  $q.notify({ type: 'positive', message: 'Kelompok mandor baru sukses didaftarkan!' })
}

const deleteMandor = (id) => {
  $q.dialog({
    title: 'Hapus Grup Mandor',
    message:
      'Tindakan ini akan menghapus mandor beserta seluruh data pekerja harian lepas di dalamnya. Lanjutkan?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    mandors.value = mandors.value.filter((m) => m.id !== id)
    commitEngineMemory()
    $q.notify({ type: 'info', message: 'Grup mandor berhasil dibersihkan permanen.' })
  })
}

const addPekerja = (mandorId) => {
  const f = pekerjaForms.value[mandorId]
  if (!f || !f.nama) {
    $q.notify({ type: 'warning', message: 'Nama lengkap pekerja lepas wajib diisi!' })
    return
  }

  const m = mandors.value.find((m) => m.id === mandorId)
  if (!m) return

  if (!m.pekerja) m.pekerja = []
  m.pekerja.push({
    id: 'PKR-' + Date.now() + Math.floor(Math.random() * 100),
    nama: f.nama.trim().toUpperCase(),
    jabatan: f.jabatan,
    upahHari: parseInt(f.upahHari) || 0,
    koef: parseFloat(f.koef) || 1.0,
  })

  f.nama = ''
  commitEngineMemory()
  $q.notify({
    type: 'positive',
    message: 'Pekerja harian lepas berhasil dimasukkan ke dalam grup!',
  })
}

const deletePekerja = (mandorId, pekerjaId) => {
  const m = mandors.value.find((m) => m.id === mandorId)
  if (!m) return

  $q.dialog({
    title: 'Hapus Pekerja',
    message: 'Apakah Anda yakin ingin menghapus pekerja ini dari daftar penugasan kelompok?',
    cancel: true,
  }).onOk(() => {
    m.pekerja = m.pekerja.filter((p) => p.id !== pekerjaId)
    commitEngineMemory()
    $q.notify({ type: 'info', message: 'Pekerja berhasil dikeluarkan dari kelompok.' })
  })
}

// =====================================================================================
// LOGIKA AKSI TAB 3: INPUT ABSENSI HARIAN REAKTIF MATRIKS
// =====================================================================================
const onDateChange = (val) => {
  selectedDate.value = val
}

const getAttendanceState = (mandorId, pekerjaId) => {
  const tgl = selectedDate.value
  if (!attendanceData.value[tgl]) attendanceData.value[tgl] = {}
  if (!attendanceData.value[tgl][mandorId]) attendanceData.value[tgl][mandorId] = {}
  if (!attendanceData.value[tgl][mandorId][pekerjaId]) {
    attendanceData.value[tgl][mandorId][pekerjaId] = { status: 'hadir', lembur: 0, ket: '' }
  }
  return attendanceData.value[tgl][mandorId][pekerjaId]
}

const calculateRowDailyWage = (pekerja, state) => {
  const base = pekerja.upahHari || 0
  const k = pekerja.koef || 1.0
  let upahDinas = 0

  if (state.status === 'hadir') upahDinas = base * k
  else if (state.status === 'setengah') upahDinas = base * k * 0.5

  const rateLembur = projectSetup.value.lembur || 25000
  const totalLembur = (parseFloat(state.lembur) || 0) * rateLembur

  return Math.round(upahDinas + totalLembur)
}

const calculateMandorDailyTotal = (mandorId) => {
  const m = mandors.value.find((m) => m.id === mandorId)
  if (!m || !m.pekerja) return 0

  let total = 0
  m.pekerja.forEach((p) => {
    const st = getAttendanceState(mandorId, p.id)
    total += calculateRowDailyWage(p, st)
  })
  return total
}

const recalculateRowWage = (mandorId, pekerjaId) => {
  // Dipicu untuk memicu reaktivitas rendering Vue internal tracker
}

const saveAttendanceLog = () => {
  commitEngineMemory()
  $q.notify({
    type: 'positive',
    icon: 'cloud_done',
    message: `Seluruh log absensi tanggal ${selectedDate.value} sukses disimpan!`,
  })
}

const copyYesterdayAttendance = () => {
  const targetDate = selectedDate.value
  const d = new Date(targetDate + 'T00:00:00')
  d.setDate(d.getDate() - 1)
  const kemarinStr = d.toISOString().split('T')[0]

  if (!attendanceData.value[kemarinStr]) {
    $q.notify({
      type: 'negative',
      message: `Gagal menyalin: Data log hari kemarin (${kemarinStr}) tidak ditemukan!`,
    })
    return
  }

  attendanceData.value[targetDate] = JSON.parse(JSON.stringify(attendanceData.value[kemarinStr]))
  commitEngineMemory()
  $q.notify({
    type: 'positive',
    icon: 'file_copy',
    message: `Berhasil menduplikasi skema log kehadiran dari tanggal ${kemarinStr}!`,
  })
}

// =====================================================================================
// LOGIKA AKSI TAB 4: COMPILING & RENDER REKAPITULASI PAYROLL
// =====================================================================================
const generateReportData = () => {
  const dari = rekapRange.value.dari
  const sampai = rekapRange.value.sampai

  if (!dari || !sampai) {
    $q.notify({ type: 'warning', message: 'Tentukan rentang batas tanggal rekap!' })
    return
  }

  // Generate array list tanggal range
  const dateList = []
  let cur = new Date(dari + 'T00:00:00')
  const end = new Date(sampai + 'T00:00:00')
  while (cur <= end) {
    dateList.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 1)
  }

  // Filter Mandor
  const filteredMandors = rekapRange.value.mandorId
    ? mandors.value.filter((m) => m.id === rekapRange.value.mandorId)
    : mandors.value

  let totalHadirCount = 0
  let totalAlphaCount = 0
  let totalUpahAll = 0
  const computedReport = []

  filteredMandors.forEach((m) => {
    if (!m.pekerja || m.pekerja.length === 0) return

    const pekerjaSummaryRows = []
    let subtotalMandorUpah = 0
    let subHadir = 0,
      subSetengah = 0,
      subIzin = 0,
      subSakit = 0,
      subAlpha = 0,
      subLibur = 0,
      subLembur = 0

    m.pekerja.forEach((p) => {
      const pStats = {
        hadir: 0,
        setengah: 0,
        izin: 0,
        sakit: 0,
        alpha: 0,
        libur: 0,
        lemburJam: 0,
        upahTotal: 0,
      }

      dateList.forEach((tgl) => {
        const log = attendanceData.value[tgl]?.[m.id]?.[p.id]
        if (!log) return

        pStats[log.status]++
        pStats.lemburJam += parseFloat(log.lembur) || 0
        const wage = calculateRowDailyWage(p, log)
        pStats.upahTotal += wage

        if (log.status === 'hadir' || log.status === 'setengah') {
          totalHadirCount++
          if (log.status === 'hadir') subHadir++
          else subSetengah++
        }
        if (log.status === 'alpha') {
          totalAlphaCount++
          subAlpha++
        }
        if (log.status === 'izin') subIzin++
        if (log.status === 'sakit') subSakit++
        if (log.status === 'libur') subLibur++
      })

      subtotalMandorUpah += pStats.upahTotal
      subLembur += pStats.lemburJam
      totalUpahAll += pStats.upahTotal

      pekerjaSummaryRows.push({
        id: p.id,
        nama: p.nama,
        jabatan: p.jabatan || 'Tukang',
        ...pStats,
      })
    })

    computedReport.push({
      id: m.id,
      nama: m.nama,
      bidang: m.bidang || 'Umum / Helper',
      pekerja: pekerjaSummaryRows,
      subtotalUpah: subtotalMandorUpah,
      totalHadir: subHadir,
      totalSetengah: subSetengah,
      totalIzin: subIzin,
      totalSakit: subSakit,
      totalAlpha: subAlpha,
      totalLibur: subLibur,
      totalLembur: subLembur,
    })
  })

  // Push ke state rekap board
  kpiSummary.value = {
    totalPekerja: Object.keys(
      filteredMandors.reduce((acc, m) => {
        m.pekerja?.forEach((p) => (acc[p.id] = true))
        return acc
      }, {}),
    ).length,
    totalHadir: totalHadirCount,
    totalAlpha: totalAlphaCount,
    totalUpah: totalUpahAll,
  }

  reportData.value = computedReport
  reportGenerated.value = true
}

// =====================================================================================
// UTILITY HELPERS SYSTEM
// =====================================================================================
const getMandorColor = (index) => MANDOR_COLORS[index % MANDOR_COLORS.length]
const formatUang = (val) => (val ? Math.round(val).toLocaleString('id-ID') : '0')
const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : 'P')

const getNamaHari = (dateStr) => {
  if (!dateStr) return '-'
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const d = new Date(dateStr + 'T00:00:00')
  return days[d.getDay()]
}

const formatTanggalIndo = (dateStr) => {
  if (!dateStr) return 'Pilih Tanggal'
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Ags',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ]
  return `${parts[2]} ${months[parseInt(parts[1]) - 1]} ${parts[0]}`
}

const getStatusClass = (st) => {
  const map = {
    hadir: 's-hadir',
    setengah: 's-setengah',
    izin: 's-izin',
    sakit: 's-sakit',
    alpha: 's-alpha',
    libur: 's-libur',
  }
  return map[st] || 's-hadir'
}

const triggerPrint = () => {
  window.print()
}

// --- Lifecycle Hook ---
onMounted(() => {
  // ✅ Cek autentikasi + hak akses sebelum load data
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Belum login — arahkan ke halaman login
      router.replace('/login')
      return
    }
    await checkAkses(user.uid)
    await loadDetailPermission(user.uid)

    if (!aksesGranted.value) {
      // Tidak punya hak akses — tampilkan notifikasi lalu redirect
      $q.notify({
        type: 'negative',
        icon: 'lock',
        message: 'Anda tidak memiliki izin untuk mengakses halaman Absensi Harian Lepas.',
        position: 'top',
        timeout: 3000,
      })
      // Redirect ke halaman utama / dashboard setelah notif
      setTimeout(() => router.replace('/'), 1500)
      return
    }

    // Akses diberikan — muat data lokal
    loadEngineMemory()
  })
})
</script>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
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
  border-bottom: 1px solid #f1f5f9;
}
.rounded-input :deep(.q-field__control) {
  border-radius: 12px;
}

/* SHADOWS & CARDS */
.bento-card {
  border-radius: 24px;
  border: 1px solid #f1f5f9;
}
.shadow-soft {
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.04) !important;
}
.shadow-soft-primary {
  box-shadow: 0 8px 24px -8px rgba(245, 158, 11, 0.4) !important;
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

/* PREMIUM TABLE MATRIX STYLE */
.abs-tbl-wrap {
  width: 100%;
}
table.abs-tbl {
  width: 100%;
  border-collapse: collapse;
}
table.abs-tbl th {
  font-size: 11px;
  color: #64748b;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 14px 12px;
  border-bottom: 2px solid #e2e8f0;
  text-align: left;
}
table.abs-tbl td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  color: #334155;
}

/* INTERACTIVE DROPDOWN STATUS BADGES */
.status-sel {
  appearance: none;
  -webkit-appearance: none;
  text-align: center;
  font-size: 12px;
  cursor: pointer;
  border-radius: 30px !important;
  padding: 6px 16px !important;
  outline: none;
  transition: all 0.2s ease;
  width: 150px;
}
.s-hadir {
  background-color: #f0fdf4 !important;
  color: #16a34a !important;
  border: 1.5px solid #bbf7d0 !important;
}
.s-setengah {
  background-color: #f0fdfa !important;
  color: #0d9488 !important;
  border: 1.5px solid #99f6e4 !important;
}
.s-izin {
  background-color: #f0f9ff !important;
  color: #0284c7 !important;
  border: 1.5px solid #bae6fd !important;
}
.s-sakit {
  background-color: #fffbeb !important;
  color: #d97706 !important;
  border: 1.5px solid #fde68a !important;
}
.s-alpha {
  background-color: #fef2f2 !important;
  color: #dc2626 !important;
  border: 1.5px solid #fecaca !important;
}
.s-libur {
  background-color: #faf5ff !important;
  color: #7c3aed !important;
  border: 1.5px solid #e9d5ff !important;
}

/* REKAP BREAKDOWN GRID */
table.rekap-tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
table.rekap-tbl th {
  font-size: 11px;
  color: #475569;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 10px;
  border-bottom: 2px solid #e2e8f0;
  text-align: left;
}
table.rekap-tbl td {
  padding: 12px 10px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}
.rekap-foot td {
  background-color: #f8fafc;
  font-weight: 800;
  color: #1e293b;
  border-top: 2px solid #cbd5e1;
}

.indicator-bar {
  width: 6px;
  height: 32px;
  border-radius: 4px;
}
.kpi-box {
  background-color: white;
  transition: transform 0.2s;
}
.kpi-box:hover {
  transform: translateY(-2px);
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

.total-mandor {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 0 4px;
  font-size: 13px;
  color: #64748b;
}
.total-mandor strong {
  color: #d97706;
  font-size: 16px;
  font-family: monospace;
}

.decor-circle-1 {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%);
  top: -150px;
  right: -50px;
  border-radius: 50%;
  z-index: 0;
}

.animate-fade-in {
  animation: fadeInUp 0.4s ease-out;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* PRINT MEDIA FRIENDLY RE-STYLING */
@media print {
  .no-print,
  .q-header,
  .q-drawer,
  .q-btn,
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
  .bento-card,
  .mandor-container,
  .card {
    border: 1px solid #94a3b8 !important;
    box-shadow: none !important;
    background: #fff !important;
    margin-bottom: 20px !important;
    page-break-inside: avoid;
  }
  .bg-slate-50 {
    background-color: #f1f5f9 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  table.abs-tbl th,
  table.rekap-tbl th {
    background-color: #f1f5f9 !important;
    color: #000 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .status-sel {
    border: none !important;
    background: transparent !important;
    color: #000 !important;
    font-weight: bold !important;
    padding: 0 !important;
    appearance: normal;
    -webkit-appearance: normal;
  }
  .tech-progress-track {
    display: none !important;
  }
}
</style>
