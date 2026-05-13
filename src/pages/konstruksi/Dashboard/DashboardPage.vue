<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-lg-xl font-pro">
    <!-- JIKA PUNYA IZIN LIHAT -->
    <template v-if="canAction('lihat')">
      <!-- =====================================================================================
           HEADER & GREETING SECTION
           ===================================================================================== -->
      <div class="row items-end justify-between q-mb-xl animate-fade">
        <div class="col-12 col-md-8">
          <div class="text-h3 text-weight-black text-indigo-10 leading-tight greeting-text">
            Halo, {{ userFirstName }}! 👋
          </div>
          <div class="text-h6 text-grey-6 q-mt-sm font-weight-medium">
            Pusat Kendali Agra ERP. Hari ini adalah
            <span class="text-indigo-8 text-bold">{{ currentDate }}</span
            >.
          </div>
        </div>
        <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
          <q-btn
            v-if="canActionProyek('buat')"
            color="indigo-10"
            icon="rocket_launch"
            to="/konstruksi/master/proyek-data"
            label="Luncurkan Proyek Baru"
            unelevated
            rounded
            no-caps
            class="q-px-xl q-py-sm shadow-premium text-weight-bold text-subtitle1"
          />
        </div>
      </div>

      <!-- =====================================================================================
           KPI CARDS (AGRA THEME - PROPORSIONAL)
           ===================================================================================== -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <div class="col-12 col-sm-6 col-md-4 col-lg-2" v-for="kpi in kpiData" :key="kpi.label">
          <q-card
            flat
            class="list-card rounded-16 bg-white cursor-pointer"
            @click="$router.push(kpi.to)"
          >
            <q-card-section class="row items-center no-wrap q-pa-md">
              <div class="col">
                <div
                  class="text-caption text-grey-6 text-bold tracking-widest uppercase font-10 q-mb-xs"
                >
                  {{ kpi.label }}
                </div>
                <div class="text-h5 text-weight-black text-blue-grey-10">{{ kpi.value }}</div>
              </div>
              <div class="col-auto">
                <q-avatar
                  size="42px"
                  :color="kpi.color + '-1'"
                  :text-color="kpi.color + '-9'"
                  :icon="kpi.icon"
                  class="shadow-sm rounded-12"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- =====================================================================================
           MONITORING PROYEK (BIRDVIEW PSA STYLE - BOXES & RADIALS)
           ===================================================================================== -->
      <div class="row q-col-gutter-xl q-mb-xl">
        <div class="col-12">
          <q-card
            flat
            bordered
            class="rounded-20 shadow-sm bg-white border-indigo-thin overflow-hidden"
          >
            <q-card-section
              class="q-pa-lg bg-indigo-10 text-white row items-center justify-between"
            >
              <div class="row items-center">
                <q-icon name="dashboard_customize" size="sm" class="q-mr-md" />
                <div class="text-h6 text-weight-bold uppercase tracking-widest font-11">
                  Project Performance Monitor
                </div>
              </div>
              <div class="text-caption font-10 text-bold opacity-70 uppercase tracking-widest">
                Live Synchronization
              </div>
            </q-card-section>

            <q-card-section class="q-pa-lg">
              <!-- BIRDVIEW SUMMARY BOXES -->
              <div class="row q-col-gutter-md q-mb-xl">
                <div class="col-12 col-md-3">
                  <div class="summary-box bg-indigo-9 text-white rounded-12 shadow-2 hover-lift">
                    <div class="text-overline opacity-80 tracking-widest text-bold">
                      TOTAL PROYEK
                    </div>
                    <div class="text-h3 text-weight-black q-mt-sm">{{ stats.proyekAktif }}</div>
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="summary-box bg-red-6 text-white rounded-12 shadow-2 hover-lift">
                    <div class="text-overline opacity-80 tracking-widest text-bold">ON-GOING</div>
                    <div class="text-h3 text-weight-black q-mt-sm">
                      {{ topProjects.filter((p) => p.progress > 0 && p.progress < 100).length }}
                    </div>
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="summary-box bg-orange-5 text-white rounded-12 shadow-2 hover-lift">
                    <div class="text-overline opacity-80 tracking-widest text-bold">IMPROVING</div>
                    <div class="text-h3 text-weight-black q-mt-sm">
                      {{ topProjects.filter((p) => p.progress > 0 && p.progress < 50).length }}
                    </div>
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="summary-box bg-teal-6 text-white rounded-12 shadow-2 hover-lift">
                    <div class="text-overline opacity-80 tracking-widest text-bold">
                      CLOSED / DONE
                    </div>
                    <div class="text-h3 text-weight-black q-mt-sm">
                      {{ topProjects.filter((p) => p.progress >= 100).length }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- RADIAL PROGRESS GRID -->
              <div class="row q-col-gutter-xl items-center">
                <div class="col-12 col-md-7">
                  <div
                    class="text-subtitle2 text-weight-black text-indigo-10 uppercase tracking-widest q-mb-lg border-left-indigo q-pl-sm"
                  >
                    Status Proyek Teratas
                  </div>
                  <div class="row q-col-gutter-md">
                    <div
                      v-for="(p, index) in topProjects"
                      :key="p.id"
                      class="col-6 col-md-4 text-center q-mb-md"
                    >
                      <q-circular-progress
                        show-value
                        :value="p.progress || 0"
                        size="100px"
                        :thickness="0.2"
                        :color="getProjectColor(index)"
                        track-color="grey-2"
                        class="text-weight-black shadow-sm bg-white rounded-full"
                      >
                        <div class="text-h6">{{ p.progress || 0 }}%</div>
                      </q-circular-progress>
                      <div class="text-weight-bold text-blue-grey-9 q-mt-sm ellipsis font-11">
                        {{ p.nama }}
                      </div>
                      <div class="text-grey-5 font-10 uppercase tracking-tighter">
                        {{ p.konsumen || 'Internal' }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-12 col-md-5">
                  <div
                    class="text-subtitle2 text-weight-black text-indigo-10 uppercase tracking-widest q-mb-lg border-left-indigo q-pl-sm"
                  >
                    Financial Health Index
                  </div>
                  <div class="row q-col-gutter-md">
                    <!-- AR Radial -->
                    <div class="col-6 text-center">
                      <q-circular-progress
                        show-value
                        :value="
                          getChartRatio(
                            stats.piutangAR,
                            Math.max(stats.piutangAR, stats.hutangAP),
                          ) * 100
                        "
                        size="120px"
                        :thickness="0.25"
                        color="teal-5"
                        track-color="teal-1"
                        class="text-teal-9 text-weight-black shadow-soft bg-white rounded-full"
                      >
                        <q-icon name="trending_up" size="sm" />
                      </q-circular-progress>
                      <div class="text-weight-bold text-teal-9 q-mt-sm uppercase font-10">
                        PIUTANG (AR)
                      </div>
                      <div class="text-h6 text-weight-black">
                        Rp {{ formatCompact(stats.piutangAR) }}
                      </div>
                    </div>
                    <!-- AP Radial -->
                    <div class="col-6 text-center">
                      <q-circular-progress
                        show-value
                        :value="
                          getChartRatio(stats.hutangAP, Math.max(stats.piutangAR, stats.hutangAP)) *
                          100
                        "
                        size="120px"
                        :thickness="0.25"
                        color="red-5"
                        track-color="red-1"
                        class="text-red-9 text-weight-black shadow-soft bg-white rounded-full"
                      >
                        <q-icon name="trending_down" size="sm" />
                      </q-circular-progress>
                      <div class="text-weight-bold text-red-9 q-mt-sm uppercase font-10">
                        HUTANG (AP)
                      </div>
                      <div class="text-h6 text-weight-black">
                        Rp {{ formatCompact(stats.hutangAP) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- =====================================================================================
           ANALYTICS SECTION (MODERN RADIAL CHARTS)
           ===================================================================================== -->
      <div class="row q-col-gutter-xl q-mb-xl items-stretch">
        <!-- Chart 1: Donut Breakdown -->
        <div class="col-12 col-md-4">
          <q-card
            flat
            bordered
            class="rounded-20 shadow-sm bg-white border-indigo-thin h-full overflow-hidden flex column"
          >
            <q-card-section
              class="q-pa-md border-bottom-subtle text-weight-bold text-indigo-10 uppercase font-10 tracking-widest bg-indigo-1"
            >
              Komposisi Pengeluaran
            </q-card-section>
            <q-card-section class="flex flex-center col q-pa-xl">
              <div class="relative-position flex flex-center" style="width: 200px; height: 200px">
                <q-circular-progress
                  indeterminate
                  size="200px"
                  :thickness="0.18"
                  color="indigo-1"
                  track-color="grey-1"
                  class="absolute-full"
                />
                <q-circular-progress
                  :value="65"
                  size="160px"
                  :thickness="0.22"
                  color="teal-5"
                  track-color="transparent"
                  class="absolute-center"
                />
                <q-circular-progress
                  :value="40"
                  size="120px"
                  :thickness="0.28"
                  color="orange-5"
                  track-color="transparent"
                  class="absolute-center"
                />
                <div class="absolute-center text-center">
                  <div class="text-h6 text-weight-black text-indigo-10 leading-none">65%</div>
                  <div class="text-caption font-10 text-grey-6 uppercase text-bold">Materials</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Chart 2: Multi-Layer Radial Bar -->
        <div class="col-12 col-md-4">
          <q-card
            flat
            bordered
            class="rounded-20 shadow-sm bg-white border-indigo-thin h-full overflow-hidden flex column"
          >
            <q-card-section
              class="q-pa-md border-bottom-subtle text-weight-bold text-indigo-10 uppercase font-10 tracking-widest bg-indigo-1"
            >
              Bagan Radial Performa Departemen
            </q-card-section>
            <q-card-section class="flex flex-center col q-pa-lg">
              <div class="relative-position" style="width: 220px; height: 220px">
                <!-- Layer 1: Marketing -->
                <q-circular-progress
                  :value="90"
                  size="220px"
                  :thickness="0.12"
                  color="blue-6"
                  track-color="blue-1"
                  class="absolute-center"
                />
                <!-- Layer 2: Proyek -->
                <q-circular-progress
                  :value="75"
                  size="170px"
                  :thickness="0.15"
                  color="teal-6"
                  track-color="teal-1"
                  class="absolute-center"
                />
                <!-- Layer 3: Finance -->
                <q-circular-progress
                  :value="60"
                  size="120px"
                  :thickness="0.2"
                  color="orange-6"
                  track-color="orange-1"
                  class="absolute-center"
                />
                <div class="absolute-center">
                  <q-icon name="stars" size="lg" color="indigo-10" />
                </div>
              </div>
            </q-card-section>
            <q-card-section class="q-pa-md bg-grey-1">
              <div class="row justify-around">
                <div class="text-center">
                  <div
                    class="bg-blue-6 rounded-full"
                    style="width: 8px; height: 8px; display: inline-block"
                  ></div>
                  <span class="font-10 text-bold">MKT</span>
                </div>
                <div class="text-center">
                  <div
                    class="bg-teal-6 rounded-full"
                    style="width: 8px; height: 8px; display: inline-block"
                  ></div>
                  <span class="font-10 text-bold">PRJ</span>
                </div>
                <div class="text-center">
                  <div
                    class="bg-orange-6 rounded-full"
                    style="width: 8px; height: 8px; display: inline-block"
                  ></div>
                  <span class="font-10 text-bold">FIN</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Chart 3: Radial Efficiency -->
        <div class="col-12 col-md-4">
          <q-card
            flat
            bordered
            class="rounded-20 shadow-sm bg-white border-indigo-thin h-full overflow-hidden flex column"
          >
            <q-card-section
              class="q-pa-md border-bottom-subtle text-weight-bold text-indigo-10 uppercase font-10 tracking-widest bg-indigo-1"
            >
              Efisiensi Anggaran Operasional
            </q-card-section>
            <q-card-section class="flex flex-center col q-pa-xl">
              <q-circular-progress
                show-value
                class="text-indigo-10"
                value="82"
                size="180px"
                thickness="0.12"
                color="indigo-10"
                track-color="indigo-1"
                center-color="white"
              >
                <div class="text-center">
                  <div class="text-h3 text-weight-black">82%</div>
                  <div
                    class="text-caption font-10 text-positive text-weight-bold uppercase tracking-widest"
                  >
                    OPTIMAL
                  </div>
                </div>
              </q-circular-progress>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- =====================================================================================
           BOTTOM SECTION: LOGS & ALERTS
           ===================================================================================== -->
      <div class="row q-col-gutter-xl">
        <!-- RADAR AKTIVITAS -->
        <div class="col-12 col-md-8">
          <q-card flat bordered class="rounded-20 shadow-sm bg-white border-indigo-thin">
            <q-card-section
              class="q-pa-lg border-bottom-subtle bg-indigo-1 row items-center justify-between"
            >
              <div class="row items-center">
                <q-avatar
                  color="indigo-10"
                  text-color="white"
                  icon="history"
                  size="32px"
                  class="q-mr-sm rounded-8 shadow-sm"
                />
                <div class="text-subtitle1 text-weight-bold text-indigo-10">
                  Radar Aktivitas Sistem
                </div>
              </div>
              <q-btn
                flat
                dense
                color="primary"
                label="Lihat Seluruh Aktivitas"
                no-caps
                class="text-weight-bold font-10 tracking-widest"
              />
            </q-card-section>
            <q-card-section class="q-pa-none">
              <q-list separator>
                <q-item
                  v-for="(log, idx) in logs"
                  :key="idx"
                  class="q-py-md hover-bg transition-all"
                >
                  <q-item-section avatar>
                    <q-avatar
                      :color="log.color + '-1'"
                      :text-color="log.color + '-9'"
                      :icon="log.icon"
                      size="36px"
                      class="rounded-8"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold text-blue-grey-10 font-11">{{
                      log.title
                    }}</q-item-label>
                    <q-item-label caption class="text-grey-7 line-clamp-1 font-10">{{
                      log.description
                    }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="text-caption text-weight-bold text-indigo-10 font-10">
                      {{ log.time }}
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>

        <!-- STOK KRITIS ALERT -->
        <div class="col-12 col-md-4">
          <q-card
            flat
            bordered
            class="rounded-20 shadow-sm bg-white border-red-thin h-full flex column overflow-hidden"
          >
            <q-card-section
              class="q-pa-lg bg-red-1 border-bottom-subtle row items-center justify-between"
            >
              <div
                class="text-subtitle2 text-weight-bold text-red-9 uppercase tracking-widest font-10"
              >
                Logistik Alert
              </div>
              <q-icon name="warning" color="red-5" size="sm" />
            </q-card-section>
            <q-card-section class="q-pa-xl text-center col flex column justify-center">
              <div class="text-h2 text-weight-black text-red-9 q-mb-xs">{{ stats.stokKritis }}</div>
              <div class="text-subtitle2 text-blue-grey-8 text-bold uppercase tracking-tighter">
                Item Stok Kritis
              </div>
              <q-btn
                unelevated
                color="red-9"
                label="CEK GUDANG SEKARANG"
                class="full-width q-mt-xl rounded-12 font-11 text-weight-bold shadow-1"
                to="/konstruksi/gudang"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

    <!-- TAMPILAN JIKA TIDAK PUNYA IZIN -->
    <template v-else>
      <div class="fixed-center text-center animate-fade full-width q-pa-xl">
        <q-avatar
          size="150px"
          color="grey-2"
          text-color="grey-5"
          icon="lock"
          class="q-mb-lg shadow-sm"
        />
        <div class="text-h4 text-weight-black text-blue-grey-9">Akses Terbatas</div>
        <div class="text-subtitle1 text-grey-7 q-mt-md q-mb-xl">
          Akun Anda tidak memiliki otoritas untuk melihat dashboard monitoring konstruksi.
        </div>
        <q-btn
          color="indigo-10"
          label="Kembali ke Beranda"
          icon="home"
          to="/"
          rounded
          unelevated
          size="md"
          class="text-weight-bold shadow-1"
          padding="12px 30px"
        />
      </div>
    </template>

    <!-- FOOTER SPACER -->
    <div class="q-py-xl"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, getDocs, query, orderBy, limit, where, onSnapshot } from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()
const userData = ref(null)
const loading = ref(false)
let unsubscribeUser = null

const currentDate = new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const userFirstName = computed(() => {
  if (!userData.value?.nama) return 'Agra Team'
  return userData.value.nama.split(' ')[0]
})

const stats = ref({
  totalPenawaran: 0,
  proyekAktif: 0,
  stokKritis: 0,
  totalPO: 0,
  piutangAR: 0,
  hutangAP: 0,
  tagihanAktif: 0,
})

const kpiData = computed(() => [
  {
    label: 'Penawaran',
    value: stats.value.totalPenawaran,
    icon: 'campaign',
    color: 'blue',
    to: '/konstruksi/marketing/penawaran',
  },
  {
    label: 'Proyek',
    value: stats.value.proyekAktif,
    icon: 'architecture',
    color: 'indigo',
    to: '/konstruksi/master/proyek-data',
  },
  {
    label: 'Stok Kritis',
    value: stats.value.stokKritis,
    icon: 'inventory_2',
    color: 'orange',
    to: '/konstruksi/gudang',
  },
  {
    label: 'PO Aktif',
    value: stats.value.totalPO,
    icon: 'shopping_cart_checkout',
    color: 'purple',
    to: '/konstruksi/pembelian/pesanan',
  },
  {
    label: 'Piutang',
    value: formatCompact(stats.value.piutangAR),
    icon: 'request_quote',
    color: 'teal',
    to: '/konstruksi/finance/invoice',
  },
  {
    label: 'Tagihan AP',
    value: stats.value.tagihanAktif,
    icon: 'receipt_long',
    color: 'red',
    to: '/konstruksi/finance/tagihan',
  },
])

const topProjects = ref([])
const logs = ref([])

const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const menu = modulePerm.menus.find((m) => m.id === '_konstruksi_dashboard')
  return menu ? menu[actionType] : false
}

const canActionProyek = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  const menu = modulePerm?.menus.find((m) => m.id === '_konstruksi_master_proyek-data')
  return menu ? menu[actionType] : false
}

const formatCompact = (num) => {
  if (!num) return '0'
  if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + ' M'
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + ' Jt'
  return num.toLocaleString('id-ID')
}

const getProjectColor = (index) => {
  const colors = ['indigo-8', 'teal-7', 'orange-8', 'blue-8', 'purple-7']
  return colors[index % colors.length]
}

const getChartRatio = (val, max) => {
  if (max === 0 || !val) return 0
  return val / max
}

const fetchData = async () => {
  loading.value = true
  try {
    // 1. PENAWARAN (Marketing)
    try {
      const penawaranSnap = await getDocs(collection(db, 'penawaran'))
      stats.value.totalPenawaran = penawaranSnap.size
    } catch {
      console.warn('Penawaran collection error')
    }

    // 2. PROYEK
    try {
      const projSnap = await getDocs(collection(db, 'proyek'))
      stats.value.proyekAktif = projSnap.size
      topProjects.value = projSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.progress || 0) - (a.progress || 0))
        .slice(0, 5)
    } catch {
      console.warn('Proyek data error')
    }

    // 3. GUDANG
    try {
      const stokSnap = await getDocs(collection(db, 'stok_barang'))
      stats.value.stokKritis = stokSnap.docs.filter(
        (d) => (Number(d.data().jumlah) || 0) < 10,
      ).length
    } catch {
      console.warn('Gudang data error')
    }

    // 4. PEMBELIAN
    try {
      const poSnap = await getDocs(collection(db, 'purchase_order'))
      stats.value.totalPO = poSnap.size
    } catch {
      console.warn('PO data error')
    }

    // 5. FINANCE AR
    try {
      const arSnap = await getDocs(collection(db, 'finance_invoice_customer'))
      let totalAR = 0
      arSnap.forEach((docSnap) => {
        const data = docSnap.data()
        if (data.status !== 'Lunas' && data.status !== 'Draft') {
          totalAR += (Number(data.grand_total) || 0) - (Number(data.total_dibayar) || 0)
        }
      })
      stats.value.piutangAR = totalAR
    } catch {
      console.warn('AR calculation error')
    }

    // 6. FINANCE AP (Hutang ke Vendor)
    try {
      const apSnap = await getDocs(collection(db, 'monitoring_tagihan_spk'))
      let totalAP = 0
      let countAktifAP = 0
      apSnap.forEach((docSnap) => {
        const data = docSnap.data()
        if (data.status !== 'Lunas') {
          countAktifAP++
          totalAP +=
            (Number(data.net_amount) || Number(data.grand_total) || 0) -
            (Number(data.total_dibayar) || 0)
        }
      })
      stats.value.hutangAP = totalAP
      stats.value.tagihanAktif = countAktifAP
    } catch {
      console.warn('AP calculation error')
    }

    // 7. LOG AKTIVITAS
    try {
      const logSnap = await getDocs(
        query(collection(db, 'aktivitas'), orderBy('timestamp', 'desc'), limit(5)),
      )
      logs.value = logSnap.docs.map((d) => {
        const data = d.data()
        let icon = 'history'
        let color = 'blue'
        if (data.tipe === 'MASUK') {
          icon = 'input'
          color = 'teal'
        } else if (data.tipe === 'KELUAR') {
          icon = 'output'
          color = 'orange'
        } else if (data.tipe === 'PR' || data.tipe === 'PO') {
          icon = 'receipt_long'
          color = 'purple'
        }
        return {
          title: data.nama_barang || data.aktivitas || 'Update Sistem',
          description: data.deskripsi || `Aktivitas pada modul ${data.tipe || 'Konstruksi'}`,
          icon,
          color,
          time: data.timestamp
            ? data.timestamp
                .toDate()
                .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            : 'Baru saja',
        }
      })
    } catch {
      console.warn('Log activities error')
    }
  } catch {
    console.error('General Fetch Error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubscribeUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) userData.value = snapshot.docs[0].data()
    })
  }
  fetchData()
})

onUnmounted(() => {
  if (unsubscribeUser) unsubscribeUser()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
.font-pro {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.rounded-8 {
  border-radius: 8px;
}
.rounded-12 {
  border-radius: 12px;
}
.rounded-16 {
  border-radius: 16px;
}
.rounded-20 {
  border-radius: 20px;
}
.shadow-premium {
  box-shadow: 0 8px 25px rgba(26, 35, 126, 0.15) !important;
}
.shadow-inner {
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.06);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.border-indigo-thin {
  border: 1px solid rgba(26, 35, 126, 0.1);
}
.border-red-thin {
  border: 1px solid rgba(229, 57, 53, 0.15);
}
.list-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}
.list-card:hover {
  border-color: #1a237e;
  transform: translateY(-4px);
}
.hover-bg:hover {
  background-color: #f8faff;
}
.hover-lift {
  transition: transform 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-3px);
}
.summary-box {
  padding: 24px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.animate-fade {
  animation: fadeIn 0.6s ease-out both;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.border-left-indigo {
  border-left: 4px solid #1a237e;
}

/* FIX: line-clamp standard property added for compatibility */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Horizontal Chart CSS (Progress Bar) */
.animate-grow-horizontal {
  animation: growRight 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  transform-origin: left;
}
@keyframes growRight {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.font-10 {
  font-size: 10px;
}
.font-11 {
  font-size: 11px;
}
</style>
