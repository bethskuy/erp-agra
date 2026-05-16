<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-2 layout-container">
    <q-header borderless class="bg-indigo-10 text-white shadow-1">
      <q-toolbar class="q-py-xs">
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />

        <q-toolbar-title class="text-weight-bolder">
          <div class="row items-center no-wrap">
            <div class="row items-center no-wrap text-h6 text-md-h5">
              <span class="q-mr-xs tracking-tighter">AGRA</span>
              <span class="text-weight-light text-indigo-2">ERP</span>
            </div>
          </div>
        </q-toolbar-title>

        <q-space />

        <q-btn flat round icon="notifications" class="q-mr-xs">
          <q-badge color="red" floating v-if="totalNotifCount > 0" class="shadow-1 font-bold">
            {{ totalNotifCount }}
          </q-badge>

          <q-menu
            auto-close
            anchor="bottom right"
            self="top right"
            :offset="[0, 10]"
            class="shadow-10 rounded-12"
          >
            <q-list style="min-width: 320px" class="q-py-sm">
              <q-item-label
                header
                class="text-weight-bold text-indigo-10 uppercase tracking-widest bg-indigo-1 q-mx-sm q-mb-sm rounded-8"
                style="font-size: 11px"
              >
                Detail Notifikasi Sistem
              </q-item-label>

              <!-- NOTIFIKASI MARKETING -->
              <q-item
                v-if="pendingApprovalCount > 0"
                clickable
                v-ripple
                to="/konstruksi/marketing/approval-penawaran"
                class="notif-item"
              >
                <q-item-section avatar>
                  <q-avatar color="orange-1" text-color="orange-9" icon="fact_check" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Approval Penawaran</q-item-label>
                  <q-item-label caption
                    >{{ pendingApprovalCount }} dokumen menunggu otorisasi.</q-item-label
                  >
                </q-item-section>
              </q-item>

              <q-item
                v-if="rejectedPenawaranCount > 0"
                clickable
                v-ripple
                to="/konstruksi/marketing/penawaran"
                class="notif-item"
              >
                <q-item-section avatar>
                  <q-avatar color="red-1" text-color="negative" icon="cancel" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-negative"
                    >Penawaran Ditolak</q-item-label
                  >
                  <q-item-label caption
                    >{{ rejectedPenawaranCount }} dokumen butuh revisi.</q-item-label
                  >
                </q-item-section>
              </q-item>

              <q-item
                v-if="approvedPenawaranCount > 0"
                clickable
                v-ripple
                to="/konstruksi/marketing/penawaran"
                class="notif-item"
              >
                <q-item-section avatar>
                  <q-avatar color="green-1" text-color="positive" icon="verified" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-positive"
                    >Penawaran Disetujui</q-item-label
                  >
                  <q-item-label caption
                    >{{ approvedPenawaranCount }} dokumen disetujui (BARU).</q-item-label
                  >
                </q-item-section>
              </q-item>

              <!-- NOTIFIKASI GUDANG (MUTASI) -->
              <q-item
                v-if="pendingMutasiCount > 0"
                clickable
                v-ripple
                to="/konstruksi/gudang"
                class="notif-item"
              >
                <q-item-section avatar>
                  <q-avatar color="red-1" text-color="negative" icon="move_to_inbox" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-blue-grey-9"
                    >Permintaan Gudang</q-item-label
                  >
                  <q-item-label caption
                    >{{ pendingMutasiCount }} request mutasi stok masuk.</q-item-label
                  >
                </q-item-section>
              </q-item>

              <q-item
                v-if="approvedMutasiCount > 0"
                clickable
                v-ripple
                to="/konstruksi/gudang"
                class="notif-item"
              >
                <q-item-section avatar>
                  <q-avatar color="green-1" text-color="positive" icon="local_shipping" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-blue-grey-9"
                    >Barang Datang</q-item-label
                  >
                  <q-item-label caption
                    >{{ approvedMutasiCount }} request disetujui (BARU).</q-item-label
                  >
                </q-item-section>
              </q-item>

              <!-- NOTIFIKASI PURCHASE REQUEST (PEMBELIAN) -->
              <q-item
                v-if="pendingPrCount > 0"
                clickable
                v-ripple
                to="/konstruksi/pembelian/pesanan"
                class="notif-item"
              >
                <q-item-section avatar>
                  <q-avatar color="orange-1" text-color="orange-9" icon="shopping_cart" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Purchase Request</q-item-label>
                  <q-item-label caption>{{ pendingPrCount }} PR menunggu diproses.</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                v-if="approvedPrCount > 0"
                clickable
                v-ripple
                to="/konstruksi/pembelian/pesanan"
                class="notif-item"
              >
                <q-item-section avatar>
                  <q-avatar color="green-1" text-color="positive" icon="done_all" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-positive">PR Disetujui</q-item-label>
                  <q-item-label caption
                    >{{ approvedPrCount }} PR telah diotorisasi (BARU).</q-item-label
                  >
                </q-item-section>
              </q-item>

              <!-- JIKA KOSONG -->
              <q-item v-if="totalNotifCount === 0">
                <q-item-section class="text-center text-grey-6 q-pa-md text-caption">
                  <q-icon
                    name="notifications_off"
                    size="lg"
                    color="grey-4"
                    class="q-mx-auto q-mb-sm"
                  />
                  <div class="text-weight-medium">Belum ada pemberitahuan baru</div>
                  <div class="text-caption">Anda sudah membaca semua notifikasi.</div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn flat round icon="apps" class="q-mr-xs">
          <q-menu
            auto-close
            anchor="bottom right"
            self="top right"
            :offset="[0, 10]"
            class="app-launcher-menu shadow-10"
          >
            <div class="q-pa-md bg-white" style="width: 320px; border-radius: 12px">
              <div class="text-overline q-px-sm q-pb-sm text-grey-7">Modul Agra ERP</div>
              <div class="row q-col-gutter-sm">
                <template v-for="app in filteredUniqueApps" :key="app.aksesKey">
                  <div class="col-4">
                    <q-btn
                      flat
                      stack
                      class="full-width app-btn"
                      :class="{ 'active-app': app.aksesKey === 'konstruksi' }"
                      no-caps
                      :to="app.path"
                    >
                      <q-icon :name="app.icon" :color="app.color || 'primary'" size="32px" />
                      <div class="app-label text-center">{{ app.name }}</div>
                    </q-btn>
                  </div>
                </template>
              </div>
              <q-separator class="q-my-md" />
              <q-btn
                outline
                color="primary"
                class="full-width text-weight-bold"
                icon="home"
                label="Kembali ke Menu Utama"
                to="/"
                no-caps
                rounded
              />
            </div>
          </q-menu>
        </q-btn>

        <q-btn flat round no-caps class="q-ml-xs">
          <q-avatar
            size="32px"
            color="white"
            text-color="indigo-10"
            class="text-weight-bold shadow-1"
          >
            {{ userData?.nama?.charAt(0) || 'A' }}
          </q-avatar>
          <q-menu
            auto-close
            anchor="bottom right"
            self="top right"
            :offset="[0, 10]"
            class="shadow-10 rounded-12 overflow-hidden"
          >
            <q-list style="min-width: 220px" class="q-pa-sm">
              <q-item class="q-py-md">
                <q-item-section avatar>
                  <q-avatar
                    color="indigo-1"
                    text-color="indigo-10"
                    class="text-weight-bold shadow-sm"
                  >
                    {{ userData?.nama?.charAt(0) || 'A' }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-indigo-10">{{
                    userData?.nama || 'Administrator'
                  }}</q-item-label>
                  <q-item-label caption class="text-blue-grey-6">{{
                    authStore.user?.role || 'Staff User'
                  }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator class="q-my-sm" />
              <q-item clickable v-ripple class="rounded-borders" @click="showProfileDialog = true">
                <q-item-section avatar
                  ><q-icon name="person_outline" color="blue-grey-7" size="20px"
                /></q-item-section>
                <q-item-section class="text-weight-medium">Profil Saya</q-item-section>
              </q-item>
              <q-separator class="q-my-sm" />
              <q-item
                clickable
                v-ripple
                class="rounded-borders text-negative"
                @click="handleLogout"
              >
                <q-item-section avatar><q-icon name="logout" size="20px" /></q-item-section>
                <q-item-section class="text-weight-bold">KELUAR SISTEM</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="300"
      class="bg-white custom-sidebar hide-horizontal-scroll"
      elevation="2"
    >
      <div class="column fit hide-horizontal-scroll">
        <div class="q-pa-lg border-bottom-soft bg-profile-header">
          <div class="row items-center q-gutter-md">
            <q-avatar
              size="50px"
              color="indigo-10"
              text-color="white"
              class="font-bold text-h6 shadow-1"
            >
              {{ userData?.nama?.charAt(0) || 'A' }}
            </q-avatar>
            <div class="col overflow-hidden">
              <div
                class="text-weight-bolder text-subtitle1 ellipsis text-indigo-10"
                style="line-height: 1.2"
              >
                {{ userData?.nama || 'Administrator' }}
              </div>
              <div
                class="text-caption ellipsis text-uppercase tracking-widest text-grey-6 font-bold q-mt-xs"
                style="font-size: 10px"
              >
                {{ authStore.user?.role || 'User' }}
              </div>
            </div>
          </div>
        </div>

        <q-scroll-area
          class="col clean-scroll"
          :thumb-style="thumbStyle"
          :horizontal-thumb-style="{ display: 'none', width: '0' }"
          :horizontal-bar-style="{ display: 'none', width: '0' }"
          content-style="width: 100%; overflow-x: hidden;"
          content-active-style="width: 100%; overflow-x: hidden;"
        >
          <q-list class="q-pb-xl q-pt-sm">
            <div class="sidebar-section-title">UTAMA</div>

            <q-item
              v-if="checkPermission('dashboard')"
              clickable
              v-ripple
              to="/konstruksi/dashboard"
              class="menu-item-clean"
              active-class="menu-item-active"
            >
              <q-item-section avatar><q-icon name="space_dashboard" size="22px" /></q-item-section>
              <q-item-section class="menu-text">DASHBOARD</q-item-section>
            </q-item>

            <q-expansion-item
              v-if="
                hasSectionAccess([
                  'marketing/customer',
                  'master/supplier',
                  'master/barang-list',
                  'master/barang-kategori',
                  'master/satuan',
                ])
              "
              icon="view_cozy"
              label="DATA MASTER"
              class="menu-expansion-clean"
              header-class="menu-expansion-header"
              expand-icon-class="text-blue-grey-4"
              default-opened
            >
              <q-list>
                <q-expansion-item
                  v-if="hasSectionAccess(['marketing/customer', 'master/supplier'])"
                  label="Data Rekanan"
                  header-class="sub-expansion-header"
                  expand-icon-class="text-blue-grey-4"
                  dense
                  class="level-2-expansion"
                >
                  <template v-slot:header>
                    <q-item-section avatar
                      ><q-icon name="groups" size="22px" class="icon-sub"
                    /></q-item-section>
                    <q-item-section>Data Rekanan</q-item-section>
                  </template>
                  <q-list class="sub-list-container">
                    <q-item
                      v-if="checkPermission('marketing/customer')"
                      clickable
                      v-ripple
                      to="/konstruksi/marketing/customer"
                      class="level-3-item-clean"
                      active-class="sub-item-active"
                    >
                      <q-item-section class="menu-text">Customer / Klien</q-item-section>
                    </q-item>
                    <q-item
                      v-if="checkPermission('master/supplier')"
                      clickable
                      v-ripple
                      to="/konstruksi/master/supplier"
                      class="level-3-item-clean"
                      active-class="sub-item-active"
                    >
                      <q-item-section class="menu-text">Data Supplier</q-item-section>
                    </q-item>
                  </q-list>
                </q-expansion-item>

                <q-expansion-item
                  v-if="
                    hasSectionAccess([
                      'master/barang-list',
                      'master/barang-kategori',
                      'master/satuan',
                    ])
                  "
                  label="Data Barang"
                  header-class="sub-expansion-header"
                  expand-icon-class="text-blue-grey-4"
                  dense
                  class="level-2-expansion"
                >
                  <template v-slot:header>
                    <q-item-section avatar
                      ><q-icon name="inventory_2" size="22px" class="icon-sub"
                    /></q-item-section>
                    <q-item-section>Data Barang</q-item-section>
                  </template>
                  <q-list class="sub-list-container">
                    <q-item
                      v-if="checkPermission('master/barang-list')"
                      clickable
                      v-ripple
                      to="/konstruksi/master/barang-list"
                      class="level-3-item-clean"
                      active-class="sub-item-active"
                    >
                      <q-item-section class="menu-text">List Barang</q-item-section>
                    </q-item>
                    <q-item
                      v-if="checkPermission('master/barang-kategori')"
                      clickable
                      v-ripple
                      to="/konstruksi/master/barang-kategori"
                      class="level-3-item-clean"
                      active-class="sub-item-active"
                    >
                      <q-item-section class="menu-text">Kategori Barang</q-item-section>
                    </q-item>
                    <q-item
                      v-if="checkPermission('master/satuan')"
                      clickable
                      v-ripple
                      to="/konstruksi/master/satuan"
                      class="level-3-item-clean"
                      active-class="sub-item-active"
                    >
                      <q-item-section class="menu-text">Data Satuan</q-item-section>
                    </q-item>
                  </q-list>
                </q-expansion-item>
              </q-list>
            </q-expansion-item>

            <q-separator inset class="bg-grey-2 q-my-md border-separator" />

            <div class="sidebar-section-title">OPERASIONAL</div>

            <q-expansion-item
              v-if="
                hasSectionAccess([
                  'marketing/penawaran',
                  'marketing/approval-penawaran',
                  'marketing/ahsp',
                ])
              "
              icon="campaign"
              label="MARKETING"
              class="menu-expansion-clean"
              header-class="menu-expansion-header"
              expand-icon-class="text-blue-grey-4"
            >
              <q-list class="q-pb-sm">
                <q-item
                  v-if="checkPermission('marketing/ahsp')"
                  clickable
                  v-ripple
                  to="/konstruksi/marketing/ahsp"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="calculate" size="22px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Analisa AHSP</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('marketing/penawaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/marketing/penawaran"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="request_quote" size="22px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Penawaran</q-item-section>

                  <q-item-section
                    side
                    v-if="rejectedPenawaranCount > 0 || approvedPenawaranCount > 0"
                  >
                    <div class="row items-center q-gutter-x-xs">
                      <q-badge
                        v-if="rejectedPenawaranCount > 0"
                        color="negative"
                        rounded
                        class="q-px-sm font-bold shadow-1 animate-bounce"
                      >
                        {{ rejectedPenawaranCount }}
                      </q-badge>
                      <q-badge
                        v-if="approvedPenawaranCount > 0"
                        color="positive"
                        rounded
                        class="q-px-sm font-bold shadow-1 animate-bounce"
                      >
                        {{ approvedPenawaranCount }}
                      </q-badge>
                    </div>
                  </q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('marketing/approval-penawaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/marketing/approval-penawaran"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="fact_check" size="22px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Approval Penawaran</q-item-section>
                  <q-item-section side v-if="pendingApprovalCount > 0">
                    <q-badge
                      color="orange-9"
                      rounded
                      class="q-px-sm font-bold shadow-1 animate-bounce"
                      >{{ pendingApprovalCount }}</q-badge
                    >
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <q-expansion-item
              v-if="
                hasSectionAccess([
                  'master/proyek-data',
                  'master/proyek-monitoring',
                  'master/proyek-kategori',
                ])
              "
              icon="foundation"
              label="PROYEK"
              class="menu-expansion-clean"
              header-class="menu-expansion-header"
              expand-icon-class="text-blue-grey-4"
            >
              <q-list class="q-pb-sm">
                <q-item
                  v-if="checkPermission('master/proyek-data')"
                  clickable
                  v-ripple
                  to="/konstruksi/master/proyek-data"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="apartment" size="22px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Data Proyek</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('master/proyek-monitoring')"
                  clickable
                  v-ripple
                  to="/konstruksi/master/proyek-monitoring"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="monitor" size="22px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Monitoring Proyek</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('master/proyek-kategori')"
                  clickable
                  v-ripple
                  to="/konstruksi/master/proyek-kategori"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="account_tree" size="22px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Kategori Proyek</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <q-item
              v-if="checkPermission('gudang')"
              clickable
              v-ripple
              to="/konstruksi/gudang"
              class="menu-item-clean"
              active-class="menu-item-active"
            >
              <q-item-section avatar><q-icon name="warehouse" size="24px" /></q-item-section>
              <q-item-section class="menu-text">GUDANG & LOGISTIK</q-item-section>
              <q-item-section side v-if="pendingMutasiCount > 0 || approvedMutasiCount > 0">
                <div class="row items-center q-gutter-x-xs">
                  <q-badge
                    v-if="pendingMutasiCount > 0"
                    color="negative"
                    rounded
                    class="q-px-sm font-bold shadow-1 animate-bounce"
                  >
                    {{ pendingMutasiCount }}
                  </q-badge>
                  <q-badge
                    v-if="approvedMutasiCount > 0"
                    color="positive"
                    rounded
                    class="q-px-sm font-bold shadow-1 animate-bounce"
                  >
                    {{ approvedMutasiCount }}
                  </q-badge>
                </div>
              </q-item-section>
            </q-item>

            <q-expansion-item
              v-if="checkPermission('pembelian/pesanan')"
              icon="shopping_cart"
              label="PEMBELIAN"
              class="menu-expansion-clean"
              header-class="menu-expansion-header"
              expand-icon-class="text-blue-grey-4"
            >
              <q-list class="q-pb-sm">
                <q-item
                  clickable
                  v-ripple
                  to="/konstruksi/pembelian/pesanan"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="receipt_long" size="22px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Pesanan Pembelian</q-item-section>
                  <q-item-section side v-if="pendingPrCount > 0 || approvedPrCount > 0">
                    <div class="row items-center q-gutter-x-xs">
                      <q-badge
                        v-if="pendingPrCount > 0"
                        color="orange-9"
                        rounded
                        class="q-px-sm font-bold shadow-1 animate-bounce"
                        >{{ pendingPrCount }}</q-badge
                      >
                      <q-badge
                        v-if="approvedPrCount > 0"
                        color="positive"
                        rounded
                        class="q-px-sm font-bold shadow-1 animate-bounce"
                        >{{ approvedPrCount }}</q-badge
                      >
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <q-expansion-item
              v-if="
                hasSectionAccess([
                  'finance/invoice',
                  'finance/approval-invoice',
                  'finance/tagihan',
                  'finance/tagihan-supplier',
                  'finance/pengeluaran',
                  'finance/pembayaran',
                  'finance/approval-pembayaran',
                  'finance/realisasi-pembayaran',
                  'finance/balansheet',
                ])
              "
              icon="account_balance_wallet"
              label="FINANCE"
              class="menu-expansion-clean"
              header-class="menu-expansion-header"
              expand-icon-class="text-blue-grey-4"
            >
              <q-list class="q-pb-sm">
                <q-item
                  v-if="checkPermission('finance/invoice')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/invoice"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="receipt_long" size="22px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Pembuatan Invoice</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('finance/approval-invoice')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/approval-invoice"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="fact_check" size="22px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Approval Invoice</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('finance/tagihan')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/tagihan"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="receipt" size="22px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Monitoring Tagihan</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('finance/tagihan-supplier')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/tagihan-supplier"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="list_alt" size="22px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Tagihan Supplier</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('finance/pembayaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/pembayaran"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="payments" size="22px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Pengajuan Pembayaran</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('finance/approval-pembayaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/approval-pembayaran"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="gavel" size="22px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Approval Pembayaran</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('finance/realisasi-pembayaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/realisasi-pembayaran"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="price_check" size="22px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Realisasi Pembayaran</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('finance/pengeluaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/pengeluaran"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="trending_down" size="22px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Monitoring Pengeluaran</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('finance/balansheet')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/balansheet"
                  class="level-2-item-clean special-green-item q-mt-sm"
                  active-class="sub-menu-item-active-green"
                >
                  <q-item-section avatar
                    ><q-icon name="account_balance" size="22px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Monitoring Balansheet</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <div style="height: 120px"></div>
          </q-list>
        </q-scroll-area>
      </div>
    </q-drawer>

    <q-page-container class="no-horizontal-scroll">
      <router-view v-slot="{ Component }">
        <transition
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { auth, db } from 'src/boot/firebase'
import { signOut } from 'firebase/auth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const authStore = useAuthStore()
const router = useRouter()
const leftDrawerOpen = ref(false)
const showProfileDialog = ref(false)

// STATE NOTIFIKASI
const pendingApprovalCount = ref(0)
const rejectedPenawaranCount = ref(0)
const approvedPenawaranCount = ref(0)
const pendingPrCount = ref(0)
const approvedPrCount = ref(0) // Tambahan untuk Notifikasi PR Approved
const pendingMutasiCount = ref(0)
const approvedMutasiCount = ref(0)

const userData = ref(null)
const apps = ref([])
const currentAkses = ref([])

let unsubUser = null
let unsubApproval = null
let unsubRejectedPenawaran = null
let unsubApprovedPenawaran = null
let unsubApps = null
let unsubPrBadge = null
let unsubApprovedPr = null
let unsubMutasiPending = null
let unsubMutasiApproved = null

const totalNotifCount = computed(() => {
  return (
    pendingApprovalCount.value +
    pendingPrCount.value +
    approvedPrCount.value + // Menambahkan count PR Approved ke Badge Lonceng Total
    rejectedPenawaranCount.value +
    approvedPenawaranCount.value +
    pendingMutasiCount.value +
    approvedMutasiCount.value
  )
})

const thumbStyle = {
  right: '2px',
  borderRadius: '4px',
  backgroundColor: '#cbd5e1',
  width: '5px',
  opacity: 0.75,
}

const filteredUniqueApps = computed(() => {
  const uniqueMap = new Map()
  apps.value.forEach((app) => {
    if (!uniqueMap.has(app.aksesKey) && canShow(app)) {
      uniqueMap.set(app.aksesKey, app)
    }
  })
  return Array.from(uniqueMap.values())
})

const canShow = (app) => {
  if (!authStore.user) return false
  if (authStore.user.role === 'Super Admin') return true
  if (app.aksesKey === 'admin')
    return authStore.user.role === 'Admin' || authStore.user.role === 'Super Admin'
  return currentAkses.value.includes(app.aksesKey)
}

const checkPermission = (menuPath) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const targetId = `/konstruksi_${menuPath}`.replace(/\//g, '_')
  const menu = modulePerm.menus.find((m) => m.id === targetId)
  return menu ? menu.lihat : false
}

const hasSectionAccess = (menuPaths) => {
  if (authStore.user?.role === 'Super Admin') return true
  return menuPaths.some((path) => checkPermission(path))
}

const handleLogout = () => {
  $q.dialog({
    title: '<span class="text-indigo-10 text-weight-bold">Konfirmasi Keluar</span>',
    message: 'Apakah Anda yakin ingin mengakhiri sesi AGRA ERP ini?',
    html: true,
    cancel: true,
    ok: { unelevated: true, label: 'Ya, Keluar', color: 'negative', rounded: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (e) {
      console.error(e)
    }
  })
}

onMounted(() => {
  unsubApps = onSnapshot(collection(db, 'modul'), (snapshot) => {
    apps.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  })

  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data()
        userData.value = data
        currentAkses.value = data.akses || []
      }
    })
  }

  // Notifikasi Marketing
  const qApproval = query(collection(db, 'penawaran'), where('status', '==', 'Pending'))
  unsubApproval = onSnapshot(qApproval, (snapshot) => {
    pendingApprovalCount.value = snapshot.size
  })

  const qRejectedPenawaran = query(collection(db, 'penawaran'), where('status', '==', 'Rejected'))
  unsubRejectedPenawaran = onSnapshot(qRejectedPenawaran, (snapshot) => {
    rejectedPenawaranCount.value = snapshot.docs.filter(
      (d) => d.data().marketing_read === false,
    ).length
  })

  const qApprovedPenawaran = query(collection(db, 'penawaran'), where('status', '==', 'Approved'))
  unsubApprovedPenawaran = onSnapshot(qApprovedPenawaran, (snapshot) => {
    approvedPenawaranCount.value = snapshot.docs.filter(
      (d) => d.data().marketing_read === false,
    ).length
  })

  // Notifikasi Pembelian (PR Pending)
  const qPr = query(
    collection(db, 'permintaan_barang'),
    where('status', '==', 'Pending'),
    where('tipe', '==', 'PURCHASE_REQUEST'),
  )
  unsubPrBadge = onSnapshot(qPr, (snap) => {
    pendingPrCount.value = snap.size
  })

  // Notifikasi Pembelian (PR Approved)
  const qApprovedPr = query(
    collection(db, 'permintaan_barang'),
    where('status', '==', 'Approved'),
    where('tipe', '==', 'PURCHASE_REQUEST'),
  )
  unsubApprovedPr = onSnapshot(qApprovedPr, (snap) => {
    // Mengecek PR Approved yang belum dilihat (requester_read == false)
    approvedPrCount.value = snap.docs.filter((d) => d.data().requester_read === false).length
  })

  // Notifikasi Gudang (Mutasi Pending)
  const qMutasiPending = query(
    collection(db, 'permintaan_barang'),
    where('status', '==', 'Pending'),
    where('tipe', '==', 'ANTAR_GUDANG'),
  )
  unsubMutasiPending = onSnapshot(qMutasiPending, (snap) => {
    pendingMutasiCount.value = snap.size
  })

  // Notifikasi Gudang (Mutasi Approved & Unread)
  const qMutasiApproved = query(
    collection(db, 'permintaan_barang'),
    where('status', '==', 'Approved'),
    where('tipe', '==', 'ANTAR_GUDANG'),
  )
  unsubMutasiApproved = onSnapshot(qMutasiApproved, (snap) => {
    approvedMutasiCount.value = snap.docs.filter((d) => d.data().requester_read === false).length
  })
})

onUnmounted(() => {
  if (unsubUser) unsubUser()
  if (unsubApproval) unsubApproval()
  if (unsubRejectedPenawaran) unsubRejectedPenawaran()
  if (unsubApprovedPenawaran) unsubApprovedPenawaran()
  if (unsubApps) unsubApps()
  if (unsubPrBadge) unsubPrBadge()
  if (unsubApprovedPr) unsubApprovedPr()
  if (unsubMutasiPending) unsubMutasiPending()
  if (unsubMutasiApproved) unsubMutasiApproved()
})
</script>

<style lang="scss" scoped>
/* ================== PENCEGAHAN SCROLLBAR HORIZONTAL GLOBAL ================== */
:global(body),
:global(#q-app),
.layout-container {
  overflow-x: hidden !important;
  max-width: 100vw !important;
}
.no-horizontal-scroll {
  overflow-x: hidden !important;
  max-width: 100% !important;
}

/* ================== GENERAL UTILS ================== */
.font-bold {
  font-weight: 700;
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

/* ================== SIDEBAR STYLING (CORPORATE CLEAN) ================== */
.bg-profile-header {
  background-color: #f4f6fc;
  border-bottom: 1px solid #edf2f7;
}
.custom-sidebar {
  border-right: 1px solid #edf2f7;
}

.sidebar-section-title {
  font-size: 11px;
  font-weight: 800;
  color: #9aa0ac;
  letter-spacing: 1.5px;
  margin: 16px 0 8px 24px;
}

.menu-text {
  font-weight: 600;
  letter-spacing: 0.3px;
}
.icon-sub {
  color: #64748b;
}

.menu-item-clean,
.menu-expansion-clean {
  color: #344767;
  margin: 2px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f1f5f9;
    color: #1a237e;
  }
}

.menu-item-clean {
  min-height: 48px;
}

.menu-item-active {
  background-color: #f1f5f9 !important;
  color: #1a237e !important;
  font-weight: 800 !important;
  border-left: 4px solid #1a237e;
  border-radius: 0 8px 8px 0;

  .q-icon {
    color: #1a237e !important;
  }
  .menu-text {
    font-weight: 800;
  }
}

.menu-expansion-clean {
  :deep(.q-item) {
    border-radius: 8px;
    min-height: 48px;
    transition: all 0.2s ease;
  }
  :deep(.q-item:hover) {
    background-color: #f1f5f9;
    color: #1a237e;
  }
}

.menu-expansion-header {
  font-size: 14px;
  font-weight: 700;
}
.sub-expansion-header {
  font-size: 13.5px;
  font-weight: 600;
  color: #475569;
}

.level-2-expansion {
  margin-bottom: 2px;
  :deep(.q-item) {
    min-height: 44px;
    border-radius: 8px;
  }
}

.level-2-item-clean {
  border-radius: 8px;
  margin: 2px 8px 2px 16px;
  min-height: 42px;
  font-size: 13.5px;
  color: #475569;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
    color: #1a237e;
  }
}

.level-3-item-clean {
  border-radius: 8px;
  margin: 2px 8px 2px 32px;
  min-height: 38px;
  font-size: 13px;
  color: #475569;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
    color: #1a237e;
  }
}

.sub-item-active {
  background-color: #f4f6fc !important;
  color: #1a237e !important;
  font-weight: 800 !important;
  border-radius: 8px;

  .q-icon {
    color: #1a237e !important;
    opacity: 1;
  }
  .menu-text {
    font-weight: 800;
  }
}

.sub-list-container {
  padding-left: 0;
  border-left: none;
}

/* ================== NOTIF DROPDOWN ================== */
.notif-item {
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 4px 8px;
  border: 1px solid transparent;
  &:hover {
    background: #f8fafc;
  }
}

/* ANIMASI BADGE */
.animate-bounce {
  animation: bounce 1.5s infinite;
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* ================== KELAS KHUSUS BALANSHEET ================== */
.special-green-item {
  background-color: #f0fdf4 !important;
  color: #2e7d32 !important;
  border-radius: 8px;

  .q-icon {
    color: #2e7d32 !important;
    opacity: 1;
  }

  &:hover {
    background-color: #e8f5e9 !important;
  }
}

.sub-menu-item-active-green {
  background-color: #e8f5e9 !important;
  color: #1b5e20 !important;
  font-weight: 800 !important;
}

.border-separator {
  height: 1px;
  background-color: #edf2f7;
}

/* HIDE SCROLLBAR CSS UNTUK SIDEBAR */
.hide-horizontal-scroll {
  overflow-x: hidden !important;
}
.clean-scroll :deep(.q-scrollarea__content) {
  overflow-x: hidden !important;
  width: 100% !important;
}
.clean-scroll :deep(.q-scrollarea) {
  overflow-x: hidden !important;
}
::-webkit-scrollbar:horizontal {
  display: none !important;
  height: 0 !important;
  width: 0 !important;
}
</style>
