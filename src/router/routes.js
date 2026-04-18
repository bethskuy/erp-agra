const routes = [
  // 1. LANDING PAGE
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },

  // 2. AUTHENTICATION
  {
    path: '/login',
    component: () => import('pages/auth/LoginPage.vue'),
  },

  // 3. MODUL KONSTRUKSI
  {
    path: '/konstruksi',
    component: () => import('layouts/KonstruksiLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        component: () => import('pages/konstruksi/Dashboard/DashboardPage.vue'),
      },
      // MASTER
      {
        path: 'marketing/customer',
        component: () => import('pages/konstruksi/Master/Customer/CustomerPage.vue'),
      },
      {
        path: 'master/supplier',
        component: () => import('pages/konstruksi/Master/DataSupplier/MasterSupplierPage.vue'),
      },
      {
        path: 'master/barang-list',
        component: () => import('pages/konstruksi/Master/DataBarang/MasterBarangPage.vue'),
      },
      {
        path: 'master/barang-kategori',
        component: () => import('pages/konstruksi/Master/DataBarang/KategoriBarangPage.vue'),
      },
      {
        path: 'master/satuan',
        component: () => import('pages/konstruksi/Master/DataSatuan/MasterSatuanPage.vue'),
      },

      // MARKETING
      {
        path: 'marketing/penawaran',
        component: () => import('pages/konstruksi/Marketing/Penawaran/PenawaranPage.vue'),
      },
      {
        path: 'marketing/approval-penawaran',
        component: () => import('pages/konstruksi/Marketing/ApprovalPenawaranPage.vue'),
      },

      // PROYEK
      {
        path: 'master/proyek-data',
        component: () => import('pages/konstruksi/Master/DataProyek/MasterProyekPage.vue'),
      },
      {
        path: 'master/proyek-kategori',
        component: () => import('pages/konstruksi/Master/DataProyek/KategoriProyekPage.vue'),
      },
      {
        path: 'pelaksanaan/spk-mandor',
        component: () => import('pages/konstruksi/Proyek/Pelaksanaan/SpkMandor/SpkMandorPage.vue'),
      },

      // MODUL GUDANG
      {
        path: 'gudang',
        component: () => import('pages/konstruksi/Gudang/GudangPage.vue'),
      },
      {
        path: 'gudang/transaksi',
        component: () => import('pages/konstruksi/Gudang/RiwayatTransaksiPage.vue'),
      },
      {
        path: '/konstruksi/gudang/opname/:id',
        component: () => import('pages/konstruksi/Gudang/OpnamePage.vue'),
      },
      {
        path: '/konstruksi/gudang/masuk/:id',
        component: () => import('pages/konstruksi/Gudang/BarangMasukPage.vue'),
      },
      {
        path: '/konstruksi/gudang/keluar/:id',
        component: () => import('pages/konstruksi/Gudang/BarangKeluarPage.vue'),
      },
      // PEMBELIAN
      {
        path: 'pembelian/pesanan',
        component: () =>
          import('pages/konstruksi/Pembelian/PesananPembelian/PesananPembelianPage.vue'),
      },
    ],
  },
  // 4. MODUL ABSENSI
  {
    path: '/absensi',
    component: () => import('layouts/AbsensiLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'absensi-dashboard',
        component: () => import('pages/absensi/DashboardPage.vue'),
      },
      // ROUTE RIWAYAT ABSENSI
      {
        path: 'riwayat',
        name: 'absensi-riwayat',
        component: () => import('pages/absensi/RiwayatPage.vue'),
      },
    ],
  },
  { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue') },
]

export default routes
