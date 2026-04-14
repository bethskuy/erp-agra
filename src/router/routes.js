const routes = [
  // 1. LANDING PAGE (PILIH MODUL)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },

  // 2. AUTHENTICATION (LOGIN)
  {
    path: '/login',
    component: () => import('pages/auth/LoginPage.vue'),
  },

  // 3. MODUL KONSTRUKSI (UTAMA)
  {
    path: '/konstruksi',
    component: () => import('layouts/KonstruksiLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // Dashboard Konstruksi
      {
        path: 'dashboard',
        component: () => import('pages/konstruksi/Dashboard/DashboardPage.vue'),
      },

      // DATA MASTER (RESTRUKTURISASI REKANAN)
      {
        // Path disesuaikan agar menu Customer di Layout mengarah ke sini
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

      // MODUL PROYEK (PINDAHAN DARI MASTER)
      {
        path: 'master/proyek-data',
        component: () => import('pages/konstruksi/Master/DataProyek/MasterProyekPage.vue'),
      },
      {
        path: 'master/proyek-kategori',
        component: () => import('pages/konstruksi/Master/DataProyek/KategoriProyekPage.vue'),
      },

      // PROYEK - PELAKSANAAN
      {
        path: 'pelaksanaan/spk-mandor',
        component: () => import('pages/konstruksi/Proyek/Pelaksanaan/SpkMandor/SpkMandorPage.vue'),
      },

      // MODUL GUDANG
      {
        path: 'gudang/stok-opname',
        component: () => import('pages/konstruksi/Gudang/StokOpname/StokOpnamePage.vue'),
      },
      {
        path: 'gudang/penerimaan',
        component: () =>
          import('pages/konstruksi/Gudang/PenerimaanBarang/PenerimaanBarangPage.vue'),
      },
      {
        path: 'gudang/pengeluaran-material',
        component: () =>
          import('pages/konstruksi/Gudang/PengeluaranMaterial/PengeluaranBarangPage.vue'),
      },
      {
        path: 'gudang/pengeluaran-lain',
        component: () =>
          import('pages/konstruksi/Gudang/PengeluaranBarangLain/PengeluaranBarangLainPage.vue'),
      },

      // MODUL PEMBELIAN
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
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        component: () => import('pages/absensi/DashboardPage.vue'),
      },
    ],
  },

  // 5. ERROR 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
