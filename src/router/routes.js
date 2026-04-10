const routes = [
  // 1. LANDING PAGE (PILIH MODUL)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
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
    children: [
      // Dashboard Konstruksi
      {
        path: 'dashboard',
        component: () => import('pages/konstruksi/Dashboard/DashboardPage.vue'),
      },

      // DATA MASTER
      {
        path: 'master/proyek-data',
        component: () => import('pages/konstruksi/Master/DataProyek/MasterProyekPage.vue'),
      },
      {
        path: 'master/proyek-kategori',
        component: () => import('pages/konstruksi/Master/DataProyek/KategoriProyekPage.vue'),
      },
      {
        path: 'master/konsumen',
        component: () => import('pages/konstruksi/Master/DataKonsumen/KonsumenPage.vue'),
      },
      {
        path: 'master/supplier',
        component: () => import('pages/konstruksi/Master/DataSupplier/MasterSupplierPage.vue'),
      },
      {
        path: 'master/subkon',
        component: () => import('pages/konstruksi/Master/DataSubkon/MasterSubkonPage.vue'),
      },
      {
        path: 'master/pekerjaan',
        component: () => import('pages/konstruksi/Master/DataPekerjaan/MasterPekerjaanPage.vue'),
      },
      {
        path: 'master/ahsp',
        component: () => import('pages/konstruksi/Master/DataAhsp/MasterAhspPage.vue'),
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
        path: 'marketing/prospek', // Hapus slash di depan biar relatif ke /konstruksi
        component: () => import('pages/konstruksi/Marketing/Prospek/ProspekPage.vue'),
      },
      {
        path: 'marketing/penawaran',
        component: () => import('pages/konstruksi/Marketing/Penawaran/PenawaranPage.vue'),
      },

      // PROYEK - PERENCANAAN
      {
        path: 'perencanaan/boq',
        component: () => import('pages/konstruksi/Proyek/Perencanaan/BoqProyekPage.vue'),
      },
      {
        path: 'perencanaan/rab',
        component: () => import('pages/konstruksi/Proyek/Perencanaan/RabPage.vue'),
      },

      // PROYEK - PELAKSANAAN
      {
        path: 'pelaksanaan/spk-mandor',
        component: () => import('pages/konstruksi/Proyek/Pelaksanaan/SpkMandor/SpkMandorPage.vue'),
      },

      // PROYEK - KONTRAK, SPK & MATERIAL
      {
        path: 'proyek/kontrak',
        component: () => import('pages/konstruksi/Proyek/Kontrak/KontrakPage.vue'),
      },

      {
        path: 'proyek/permintaan-material',
        component: () =>
          import('pages/konstruksi/Proyek/PermintaanMaterial/PermintaanMaterialPage.vue'),
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

  // 4. ERROR 404 (SELALU PALING BAWAH)
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
