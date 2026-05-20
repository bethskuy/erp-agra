<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-2 layout-container">
    <q-header borderless class="bg-brand-teal text-white shadow-1">
      <q-toolbar class="q-py-xs">
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />

        <q-toolbar-title class="text-weight-bolder">
          <div class="row items-center no-wrap">
            <div class="row items-center no-wrap text-h6 text-md-h5">
              <span class="q-mr-xs tracking-tighter">AGRA</span>
              <span class="text-weight-light text-brand-light-text">ERP</span>
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
                class="text-weight-bold text-brand-primary uppercase tracking-widest bg-brand-pale q-mx-sm q-mb-sm rounded-8"
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

              <!-- NOTIFIKASI PR APPROVED -->
              <q-item
                v-if="approvedPrCount > 0"
                clickable
                v-ripple
                to="/konstruksi/gudang"
                class="notif-item"
              >
                <q-item-section avatar>
                  <q-avatar color="green-1" text-color="positive" icon="done_all" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-positive">PR Disetujui</q-item-label>
                  <q-item-label caption
                    >{{ approvedPrCount }} pengajuan PR Anda telah disetujui (BARU).</q-item-label
                  >
                </q-item-section>
              </q-item>

              <!-- NOTIFIKASI PR REJECTED -->
              <q-item
                v-if="rejectedPrCount > 0"
                clickable
                v-ripple
                to="/konstruksi/gudang"
                class="notif-item"
              >
                <q-item-section avatar>
                  <q-avatar color="red-1" text-color="negative" icon="block" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-negative">PR Ditolak</q-item-label>
                  <q-item-label caption
                    >{{ rejectedPrCount }} pengajuan PR Anda ditolak pimpinan.</q-item-label
                  >
                </q-item-section>
              </q-item>

              <!-- NOTIFIKASI FINANCE - INVOICE PENDING APPROVAL -->
              <q-item
                v-if="pendingInvoiceApprovalCount > 0"
                clickable
                v-ripple
                to="/konstruksi/finance/approval-invoice"
                class="notif-item"
              >
                <q-item-section avatar>
                  <q-avatar color="orange-1" text-color="orange-9" icon="gavel" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Approval Invoice</q-item-label>
                  <q-item-label caption
                    >{{ pendingInvoiceApprovalCount }} invoice baru menunggu
                    otorisasi.</q-item-label
                  >
                </q-item-section>
              </q-item>

              <!-- NOTIFIKASI FINANCE - INVOICE APPROVED -->
              <q-item
                v-if="approvedInvoiceCount > 0"
                clickable
                v-ripple
                to="/konstruksi/finance/invoice"
                class="notif-item"
              >
                <q-item-section avatar>
                  <q-avatar color="green-1" text-color="positive" icon="receipt_long" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-positive"
                    >Invoice Disetujui</q-item-label
                  >
                  <q-item-label caption
                    >{{ approvedInvoiceCount }} invoice tagihan disetujui pimpinan
                    (BARU).</q-item-label
                  >
                </q-item-section>
              </q-item>

              <!-- NOTIFIKASI FINANCE - INVOICE REJECTED -->
              <q-item
                v-if="rejectedInvoiceCount > 0"
                clickable
                v-ripple
                to="/konstruksi/finance/invoice"
                class="notif-item"
              >
                <q-item-section avatar>
                  <q-avatar color="red-1" text-color="negative" icon="block" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-negative"
                    >Invoice Ditolak</q-item-label
                  >
                  <q-item-label caption
                    >{{ rejectedInvoiceCount }} invoice tagihan Anda ditolak pimpinan.</q-item-label
                  >
                </q-item-section>
              </q-item>

              <!-- NOTIFIKASI OVERDUE INVOICE (JATUH TEMPO) -->
              <q-item
                v-if="overdueInvoiceCount > 0"
                clickable
                v-ripple
                to="/konstruksi/finance/tagihan"
                class="notif-item"
              >
                <q-item-section avatar>
                  <q-avatar color="red-1" text-color="red-10" icon="warning" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-negative"
                    >Tagihan Jatuh Tempo</q-item-label
                  >
                  <q-item-label caption
                    >{{ overdueInvoiceCount }} tagihan SPK telah melewati batas jatuh
                    tempo.</q-item-label
                  >
                </q-item-section>
              </q-item>

              <!-- NEW: NOTIFIKASI PENDING APPROVAL PEMBAYARAN -->
              <q-item
                v-if="pendingPaymentApprovalCount > 0"
                clickable
                v-ripple
                to="/konstruksi/finance/approval-pembayaran"
                class="notif-item"
              >
                <q-item-section avatar>
                  <q-avatar color="orange-1" text-color="orange-9" icon="gavel" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-orange-9"
                    >Approval Pembayaran</q-item-label
                  >
                  <q-item-label caption
                    >{{ pendingPaymentApprovalCount }} pengajuan pembayaran baru menunggu
                    otorisasi.</q-item-label
                  >
                </q-item-section>
              </q-item>

              <!-- NEW: NOTIFIKASI PEMBAYARAN DISETUJUI / SIAP CAIR -->
              <q-item
                v-if="approvedPaymentRequestCount > 0"
                clickable
                v-ripple
                to="/konstruksi/finance/pembayaran"
                class="notif-item"
              >
                <q-item-section avatar>
                  <q-avatar color="green-1" text-color="positive" icon="check_circle" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-positive"
                    >Pembayaran Disetujui</q-item-label
                  >
                  <q-item-label caption
                    >{{ approvedPaymentRequestCount }} pengajuan dana Anda telah disetujui
                    (BARU).</q-item-label
                  >
                </q-item-section>
              </q-item>

              <!-- NEW: NOTIFIKASI KASIR SIAP REALISASI PEMBAYARAN -->
              <q-item
                v-if="approvedPaymentRealizationCount > 0"
                clickable
                v-ripple
                to="/konstruksi/finance/realisasi-pembayaran"
                class="notif-item"
              >
                <q-item-section avatar>
                  <q-avatar color="blue-1" text-color="teal-9" icon="price_check" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-teal-9">Siap Direalisasi</q-item-label>
                  <q-item-label caption
                    >{{ approvedPaymentRealizationCount }} pengajuan pembayaran disetujui & siap
                    dicairkan.</q-item-label
                  >
                </q-item-section>
              </q-item>

              <!-- NEW: NOTIFIKASI PEMBAYARAN TEREALISASI (KEMBALI KE APPROVAL SEBAGAI INFORMASI) -->
              <q-item
                v-if="realizedPaymentApprovalCount > 0"
                clickable
                v-ripple
                to="/konstruksi/finance/approval-pembayaran"
                class="notif-item"
              >
                <q-item-section avatar>
                  <q-avatar color="green-1" text-color="positive" icon="done_all" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-positive"
                    >Pembayaran Cair</q-item-label
                  >
                  <q-item-label caption
                    >{{ realizedPaymentApprovalCount }} transaksi pembayaran berhasil dicairkan oleh
                    bendahara.</q-item-label
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
                color="teal-6"
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
            text-color="brand-primary"
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
                    color="brand-pale"
                    text-color="brand-primary"
                    class="text-weight-bold shadow-sm"
                  >
                    {{ userData?.nama?.charAt(0) || 'A' }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-brand-primary">{{
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
      :width="330"
      class="custom-sidebar hide-horizontal-scroll"
      elevation="2"
    >
      <div class="column fit hide-horizontal-scroll">
        <!-- USER PROFILE HEADER -->
        <div class="q-pa-lg border-bottom-soft bg-profile-header">
          <div class="row items-center q-gutter-md">
            <q-avatar
              size="54px"
              color="brand-teal"
              text-color="white"
              class="font-bold text-h6 shadow-2 profile-avatar"
            >
              {{ userData?.nama?.charAt(0) || 'A' }}
            </q-avatar>
            <div class="col overflow-hidden">
              <div
                class="text-weight-bolder text-subtitle1 ellipsis text-white"
                style="line-height: 1.2; font-size: 15px"
              >
                {{ userData?.nama || 'Administrator' }}
              </div>
              <div
                class="text-caption ellipsis text-uppercase tracking-widest font-bold q-mt-xs text-glow"
                style="color: rgba(255, 255, 255, 0.85); font-size: 10px; opacity: 0.95"
              >
                {{ authStore.user?.role || 'User' }}
              </div>
            </div>
          </div>
        </div>

        <!-- MAIN SCROLLABLE MENU -->
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
              icon="widgets"
              label="DATA MASTER"
              class="menu-expansion-clean"
              header-class="menu-expansion-header"
              expand-icon-class="text-brand-teal-icon"
              default-opened
            >
              <q-list>
                <q-expansion-item
                  v-if="hasSectionAccess(['marketing/customer', 'master/supplier'])"
                  header-class="sub-expansion-header"
                  expand-icon-class="text-brand-teal-icon"
                  dense
                  class="level-2-expansion"
                  default-opened
                >
                  <template v-slot:header>
                    <q-item-section avatar>
                      <q-icon name="groups" size="22px" class="icon-sub" />
                    </q-item-section>
                    <q-item-section class="text-weight-semibold sub-expansion-title"
                      >Data Rekanan</q-item-section
                    >
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
                      <q-item-section avatar>
                        <q-icon name="badge" size="18px" />
                      </q-item-section>
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
                      <q-item-section avatar>
                        <q-icon name="storefront" size="18px" />
                      </q-item-section>
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
                  header-class="sub-expansion-header"
                  expand-icon-class="text-brand-teal-icon"
                  dense
                  class="level-2-expansion"
                  default-opened
                >
                  <template v-slot:header>
                    <q-item-section avatar>
                      <q-icon name="inventory_2" size="22px" class="icon-sub" />
                    </q-item-section>
                    <q-item-section class="text-weight-semibold sub-expansion-title"
                      >Data Barang</q-item-section
                    >
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
                      <q-item-section avatar>
                        <q-icon name="category" size="18px" />
                      </q-item-section>
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
                      <q-item-section avatar>
                        <q-icon name="layers" size="18px" />
                      </q-item-section>
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
                      <q-item-section avatar>
                        <q-icon name="straighten" size="18px" />
                      </q-item-section>
                      <q-item-section class="menu-text">Data Satuan</q-item-section>
                    </q-item>
                  </q-list>
                </q-expansion-item>
              </q-list>
            </q-expansion-item>

            <q-separator inset class="bg-grey-9 q-my-md border-separator" />

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
              expand-icon-class="text-brand-teal-icon"
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
                  <q-item-section avatar>
                    <q-icon name="calculate" size="20px" class="icon-sub" />
                  </q-item-section>
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
                  <q-item-section avatar>
                    <q-icon name="request_quote" size="20px" class="icon-sub" />
                  </q-item-section>
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
                  <q-item-section avatar>
                    <q-icon name="fact_check" size="20px" class="icon-sub" />
                  </q-item-section>
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
              icon="construction"
              label="PROYEK"
              class="menu-expansion-clean"
              header-class="menu-expansion-header"
              expand-icon-class="text-brand-teal-icon"
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
                  <q-item-section avatar>
                    <q-icon name="apartment" size="20px" class="icon-sub" />
                  </q-item-section>
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
                  <q-item-section avatar>
                    <q-icon name="monitor" size="20px" class="icon-sub" />
                  </q-item-section>
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
                  <q-item-section avatar>
                    <q-icon name="account_tree" size="20px" class="icon-sub" />
                  </q-item-section>
                  <q-item-section class="menu-text">Kategori Proyek</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <!-- MENU GUDANG & LOGISTIK -->
            <q-item
              v-if="checkPermission('gudang')"
              clickable
              v-ripple
              to="/konstruksi/gudang"
              class="menu-item-clean"
              active-class="menu-item-active"
            >
              <q-item-section avatar><q-icon name="warehouse" size="22px" /></q-item-section>
              <q-item-section class="menu-text">GUDANG & LOGISTIK</q-item-section>
              <q-item-section
                side
                v-if="
                  pendingMutasiCount > 0 ||
                  approvedMutasiCount > 0 ||
                  approvedPrCount > 0 ||
                  rejectedPrCount > 0
                "
              >
                <div class="row items-center q-gutter-x-xs">
                  <!-- Mutasi -->
                  <q-badge
                    v-if="pendingMutasiCount > 0"
                    color="negative"
                    rounded
                    class="q-px-sm font-bold shadow-1 animate-bounce"
                    title="Permintaan Mutasi Masuk"
                  >
                    <q-icon name="move_to_inbox" size="10px" class="q-mr-xs" />
                    {{ pendingMutasiCount }}
                  </q-badge>
                  <q-badge
                    v-if="approvedMutasiCount > 0"
                    color="positive"
                    rounded
                    class="q-px-sm font-bold shadow-1 animate-bounce"
                    title="Barang Mutasi Datang"
                  >
                    <q-icon name="local_shipping" size="10px" class="q-mr-xs" />
                    {{ approvedMutasiCount }}
                  </q-badge>
                  <!-- PR -->
                  <q-badge
                    v-if="approvedPrCount > 0"
                    color="positive"
                    rounded
                    class="q-px-sm font-bold shadow-1 animate-bounce"
                    title="Purchase Request Disetujui"
                  >
                    <q-icon name="done_all" size="10px" class="q-mr-xs" /> {{ approvedPrCount }}
                  </q-badge>
                  <q-badge
                    v-if="rejectedPrCount > 0"
                    color="negative"
                    rounded
                    class="q-px-sm font-bold shadow-1 animate-bounce"
                    title="Purchase Request Ditolak"
                  >
                    <q-icon name="cancel" size="10px" class="q-mr-xs" /> {{ rejectedPrCount }}
                  </q-badge>
                </div>
              </q-item-section>
            </q-item>

            <!-- MENU PEMBELIAN -->
            <q-expansion-item
              v-if="checkPermission('pembelian/pesanan')"
              icon="shopping_cart"
              label="PEMBELIAN"
              class="menu-expansion-clean"
              header-class="menu-expansion-header"
              expand-icon-class="text-brand-teal-icon"
            >
              <q-list class="q-pb-sm">
                <q-item
                  clickable
                  v-ripple
                  to="/konstruksi/pembelian/pesanan"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar>
                    <q-icon name="receipt_long" size="20px" class="icon-sub" />
                  </q-item-section>
                  <q-item-section class="menu-text">Pesanan Pembelian</q-item-section>
                  <q-item-section side v-if="pendingPrCount > 0">
                    <div class="row items-center q-gutter-x-xs">
                      <q-badge
                        color="orange-9"
                        rounded
                        class="q-px-sm font-bold shadow-1 animate-bounce"
                        >{{ pendingPrCount }}</q-badge
                      >
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <!-- MENU FINANCE -->
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
              expand-icon-class="text-brand-teal-icon"
              default-opened
            >
              <q-list class="q-pb-sm">
                <!-- MENU PEMBUATAN INVOICE -->
                <q-item
                  v-if="checkPermission('finance/invoice')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/invoice"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar>
                    <q-icon name="post_add" size="20px" class="icon-sub" />
                  </q-item-section>
                  <q-item-section class="menu-text">Pembuatan Invoice</q-item-section>
                  <q-item-section side v-if="approvedInvoiceCount > 0 || rejectedInvoiceCount > 0">
                    <div class="row items-center q-gutter-x-xs">
                      <q-badge
                        v-if="approvedInvoiceCount > 0"
                        color="positive"
                        rounded
                        class="q-px-sm font-bold shadow-1 animate-bounce"
                        title="Invoice Disetujui"
                      >
                        <q-icon name="done_all" size="10px" class="q-mr-xs" />
                        {{ approvedInvoiceCount }}
                      </q-badge>
                      <q-badge
                        v-if="rejectedInvoiceCount > 0"
                        color="negative"
                        rounded
                        class="q-px-sm font-bold shadow-1 animate-bounce"
                        title="Invoice Direject"
                      >
                        <q-icon name="cancel" size="10px" class="q-mr-xs" />
                        {{ rejectedInvoiceCount }}
                      </q-badge>
                    </div>
                  </q-item-section>
                </q-item>

                <!-- MENU APPROVAL INVOICE -->
                <q-item
                  v-if="checkPermission('finance/approval-invoice')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/approval-invoice"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar>
                    <q-icon name="assignment_turned_in" size="20px" class="icon-sub" />
                  </q-item-section>
                  <q-item-section class="menu-text">Approval Invoice</q-item-section>
                  <q-item-section side v-if="pendingInvoiceApprovalCount > 0">
                    <q-badge
                      color="orange-9"
                      rounded
                      class="q-px-sm font-bold shadow-1 animate-bounce"
                      title="Invoice Menunggu Approval"
                      >{{ pendingInvoiceApprovalCount }}</q-badge
                    >
                  </q-item-section>
                </q-item>

                <!-- MONITORING TAGIHAN -->
                <q-item
                  v-if="checkPermission('finance/tagihan')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/tagihan"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar>
                    <q-icon name="notifications_active" size="20px" class="icon-sub" />
                  </q-item-section>
                  <q-item-section class="menu-text">Monitoring Tagihan</q-item-section>
                  <q-item-section side v-if="overdueInvoiceCount > 0">
                    <q-badge
                      color="red"
                      rounded
                      class="q-px-sm font-bold shadow-1 animate-bounce"
                      title="Tagihan Jatuh Tempo"
                    >
                      <q-icon name="warning" size="10px" class="q-mr-xs" />
                      {{ overdueInvoiceCount }}
                    </q-badge>
                  </q-item-section>
                </q-item>

                <!-- TAGIHAN SUPPLIER -->
                <q-item
                  v-if="checkPermission('finance/tagihan-supplier')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/tagihan-supplier"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar>
                    <q-icon name="list_alt" size="20px" class="icon-sub" />
                  </q-item-section>
                  <q-item-section class="menu-text">Tagihan Supplier</q-item-section>
                </q-item>

                <!-- PENGAJUAN PEMBAYARAN -->
                <q-item
                  v-if="checkPermission('finance/pembayaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/pembayaran"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar>
                    <q-icon name="payments" size="20px" class="icon-sub" />
                  </q-item-section>
                  <q-item-section class="menu-text">Pengajuan Pembayaran</q-item-section>
                  <q-item-section side v-if="approvedPaymentRequestCount > 0">
                    <q-badge
                      color="positive"
                      rounded
                      class="q-px-sm font-bold shadow-1 animate-bounce"
                      title="Pengajuan Disetujui"
                    >
                      <q-icon name="check_circle" size="10px" class="q-mr-xs" />
                      {{ approvedPaymentRequestCount }}
                    </q-badge>
                  </q-item-section>
                </q-item>

                <!-- APPROVAL PEMBAYARAN -->
                <q-item
                  v-if="checkPermission('finance/approval-pembayaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/approval-pembayaran"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar>
                    <q-icon name="gavel" size="20px" class="icon-sub" />
                  </q-item-section>
                  <q-item-section class="menu-text">Approval Pembayaran</q-item-section>
                  <q-item-section
                    side
                    v-if="pendingPaymentApprovalCount > 0 || realizedPaymentApprovalCount > 0"
                  >
                    <div class="row items-center q-gutter-x-xs">
                      <q-badge
                        v-if="pendingPaymentApprovalCount > 0"
                        color="orange-9"
                        rounded
                        class="q-px-sm font-bold shadow-1 animate-bounce"
                        title="Menunggu Persetujuan"
                      >
                        {{ pendingPaymentApprovalCount }}
                      </q-badge>
                      <q-badge
                        v-if="realizedPaymentApprovalCount > 0"
                        color="positive"
                        rounded
                        class="q-px-sm font-bold shadow-1 animate-bounce"
                        title="Telah Direalisasi"
                      >
                        <q-icon name="done_all" size="10px" />
                      </q-badge>
                    </div>
                  </q-item-section>
                </q-item>

                <!-- REALISASI PEMBAYARAN -->
                <q-item
                  v-if="checkPermission('finance/realisasi-pembayaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/realisasi-pembayaran"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar>
                    <q-icon name="price_check" size="20px" class="icon-sub" />
                  </q-item-section>
                  <q-item-section class="menu-text">Realisasi Pembayaran</q-item-section>
                  <q-item-section side v-if="approvedPaymentRealizationCount > 0">
                    <q-badge
                      color="primary"
                      rounded
                      class="q-px-sm font-bold shadow-1 animate-bounce"
                      title="Siap Dicairkan"
                    >
                      {{ approvedPaymentRealizationCount }}
                    </q-badge>
                  </q-item-section>
                </q-item>

                <!-- MONITORING PENGELUARAN -->
                <q-item
                  v-if="checkPermission('finance/pengeluaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/pengeluaran"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar>
                    <q-icon name="trending_down" size="20px" class="icon-sub" />
                  </q-item-section>
                  <q-item-section class="menu-text">Monitoring Pengeluaran</q-item-section>
                </q-item>

                <!-- MONITORING BALANSHEET -->
                <q-item
                  v-if="checkPermission('finance/balansheet')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/balansheet"
                  class="level-2-item-clean special-green-item q-mt-sm"
                  active-class="sub-menu-item-active-green"
                >
                  <q-item-section avatar>
                    <q-icon name="account_balance" size="20px" class="icon-sub" />
                  </q-item-section>
                  <q-item-section class="menu-text">Monitoring Balansheet</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <div style="height: 120px"></div>
          </q-list>
        </q-scroll-area>

        <!-- STICKY BOTTOM LOGOUT BUTTON -->
        <div class="q-pa-md border-top-soft bg-transparent text-center">
          <q-btn
            unelevated
            class="full-width logout-btn rounded-12 text-weight-bolder"
            color="red-1"
            text-color="red-10"
            icon="logout"
            label="Keluar Sistem"
            no-caps
            @click="handleLogout"
          />
        </div>
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
const approvedPrCount = ref(0)
const rejectedPrCount = ref(0)
const pendingMutasiCount = ref(0)
const approvedMutasiCount = ref(0)

// FINANCE INVOICE NOTIFICATION STATES
const pendingInvoiceApprovalCount = ref(0)
const approvedInvoiceCount = ref(0)
const rejectedInvoiceCount = ref(0)
const overdueInvoiceCount = ref(0) // Tagihan jatuh tempo monitoring_tagihan_spk

// NEW: PENGAJUAN & REALISASI PEMBAYARAN NOTIFICATION STATES
const pendingPaymentApprovalCount = ref(0) // (Event 1) Antrean pending approval baru
const approvedPaymentRequestCount = ref(0) // (Event 2) Pencipta dapat notif "Dana Approved"
const approvedPaymentRealizationCount = ref(0) // (Event 2) Bendahara dapat notif "Siap Cairkan"
const realizedPaymentApprovalCount = ref(0) // (Event 3) Pimpinan dapat notif "Transaksi Selesai/Cair"

const userData = ref(null)
const apps = ref([])
const currentAkses = ref([])

let unsubUser = null
let unsubApproval = null
let unsubRejectedPenawaran = null
let unsubApprovedPenawaran = null
let unsubApps = null
let unsubPermintaanAll = null
let unsubInvoiceAll = null
let unsubMonitoringTagihan = null
let unsubPembayaranRequests = null // LISTENER NYA

const totalNotifCount = computed(() => {
  return (
    pendingApprovalCount.value +
    pendingPrCount.value +
    approvedPrCount.value +
    rejectedPrCount.value +
    rejectedPenawaranCount.value +
    approvedPenawaranCount.value +
    pendingMutasiCount.value +
    approvedMutasiCount.value +
    pendingInvoiceApprovalCount.value +
    approvedInvoiceCount.value +
    rejectedInvoiceCount.value +
    overdueInvoiceCount.value +
    // NEW COUPLING: PENGAJUAN PEMBAYARAN
    pendingPaymentApprovalCount.value +
    approvedPaymentRequestCount.value +
    approvedPaymentRealizationCount.value +
    realizedPaymentApprovalCount.value
  )
})

const thumbStyle = {
  right: '2px',
  borderRadius: '4px',
  backgroundColor: '#36ADA3',
  width: '5px',
  opacity: 0.5,
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
    title: '<span class="text-brand-primary text-weight-bold">Konfirmasi Keluar</span>',
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
  const userUid = authStore.user?.uid
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

  // ALL-IN-ONE LISTENER FOR PERMINTAAN BARANG (PR & MUTASI)
  unsubPermintaanAll = onSnapshot(collection(db, 'permintaan_barang'), (snap) => {
    let mutPending = 0
    let mutApproved = 0
    let prPending = 0
    let prApproved = 0
    let prRejected = 0

    const isAdmin = authStore.user?.role === 'Super Admin' || authStore.user?.role === 'Admin'

    snap.docs.forEach((doc) => {
      const d = doc.data()

      // LOGIKA MUTASI ANTAR GUDANG
      if (d.tipe === 'ANTAR_GUDANG') {
        if (d.status === 'Pending') mutPending++
        if (d.status === 'Approved' && d.requester_read === false) mutApproved++
      }
      // LOGIKA PURCHASE REQUEST
      else if (d.tipe === 'PURCHASE_REQUEST') {
        if (d.status === 'Pending') prPending++

        // Filter "MILIKNYA"
        const isMilikku = d.pemohon?.id === userUid || d.pemohon?.email === userEmail || isAdmin

        if (d.status === 'Approved' && d.requester_read === false && isMilikku) {
          prApproved++
        }
        if (d.status === 'Rejected' && d.requester_read === false && isMilikku) {
          prRejected++
        }
      }
    })

    pendingMutasiCount.value = mutPending
    approvedMutasiCount.value = mutApproved
    pendingPrCount.value = prPending
    approvedPrCount.value = prApproved
    rejectedPrCount.value = prRejected
  })

  // REAL-TIME NOTIFICATION LISTENER FOR INVOICE CUSTOMER
  unsubInvoiceAll = onSnapshot(collection(db, 'finance_invoice_customer'), (snap) => {
    let pendingApprove = 0
    let approvedCount = 0
    let rejectedCount = 0

    const isAdmin = authStore.user?.role === 'Super Admin' || authStore.user?.role === 'Admin'

    snap.docs.forEach((doc) => {
      const d = doc.data()

      // 1. Pending Approval
      if (d.approval_status === 'Pending') {
        pendingApprove++
      }

      // 2. Approved / Rejected
      const isMyInvoice = d.creator_id === userUid || d.pemohon?.id === userUid || isAdmin
      if (d.creator_read === false && isMyInvoice) {
        if (d.approval_status === 'Approved') {
          approvedCount++
        } else if (d.approval_status === 'Rejected') {
          rejectedCount++
        }
      }
    })

    pendingInvoiceApprovalCount.value = pendingApprove
    approvedInvoiceCount.value = approvedCount
    rejectedInvoiceCount.value = rejectedCount
  })

  // REAL-TIME NOTIFICATION LISTENER FOR MONITORING TAGIHAN JATUH TEMPO
  unsubMonitoringTagihan = onSnapshot(collection(db, 'monitoring_tagihan_spk'), (snap) => {
    let overdueCount = 0
    const todayStr = new Date().toISOString().substr(0, 10)

    snap.docs.forEach((doc) => {
      const d = doc.data()
      if (d.status !== 'Lunas' && d.jatuh_tempo && d.jatuh_tempo < todayStr) {
        overdueCount++
      }
    })

    overdueInvoiceCount.value = overdueCount
  })

  // =========================================================================
  // NEW: REAL-TIME NOTIFICATION LISTENER FOR PENGAJUAN & REALISASI PEMBAYARAN
  // =========================================================================
  unsubPembayaranRequests = onSnapshot(collection(db, 'finance_pengajuan_pembayaran'), (snap) => {
    let pendingApprove = 0
    let approvedReq = 0
    let approvedRealize = 0
    let realizedApprove = 0

    const isAdmin = authStore.user?.role === 'Super Admin' || authStore.user?.role === 'Admin'

    snap.docs.forEach((doc) => {
      const d = doc.data()

      // 1. PENDING APPROVAL (Belum disetujui / status == 'Pending') -> Memicu Notif di Approval Pembayaran
      if (d.status === 'Pending' && d.approver_read !== true) {
        pendingApprove++
      }

      // 2. APPROVED / CAIR -> Memicu Notif di Pengajuan Pembayaran (untuk kreator) & Realisasi Pembayaran (untuk kasir)
      if (d.status === 'Cair' || d.status === 'Approved') {
        // Untuk pencipta (Pengajuan Pembayaran)
        const isMyRequest =
          d.creator_id === userUid ||
          d.pemohon_id === userUid ||
          d.pemohon?.id === userUid ||
          d.pemohon?.email === userEmail ||
          isAdmin
        if (isMyRequest && d.creator_read !== true) {
          approvedReq++
        }
        // Untuk realizer / bendahara (Realisasi Pembayaran)
        if (d.realizer_read !== true) {
          approvedRealize++
        }
      }

      // 3. TEREALISASI / SELESAI / CAIR SUKSES -> Memicu Notif di Approval Pembayaran (mengabari pimpinan/approver bahwa dana telah cair)
      if (
        (d.status === 'Realisasi' || d.status === 'Selesai' || d.status === 'Cair_Selesai') &&
        d.realized_approved_read !== true
      ) {
        realizedApprove++
      }
    })

    pendingPaymentApprovalCount.value = pendingApprove
    approvedPaymentRequestCount.value = approvedReq
    approvedPaymentRealizationCount.value = approvedRealize
    realizedPaymentApprovalCount.value = realizedApprove
  })
})

onUnmounted(() => {
  if (unsubUser) unsubUser()
  if (unsubApproval) unsubApproval()
  if (unsubRejectedPenawaran) unsubRejectedPenawaran()
  if (unsubApprovedPenawaran) unsubApprovedPenawaran()
  if (unsubApps) unsubApps()
  if (unsubPermintaanAll) unsubPermintaanAll()
  if (unsubInvoiceAll) unsubInvoiceAll()
  if (unsubMonitoringTagihan) unsubMonitoringTagihan()
  if (unsubPembayaranRequests) unsubPembayaranRequests() // Bersihkan listener baru
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

/* ================== NAVBAR COLOR ================== */
.bg-brand-teal {
  background: linear-gradient(135deg, #36ada3 0%, #2a9089 100%) !important;
}

/* ================== LIGHT TEAL SIDEBAR THEME ================== */
/* Sidebar putih bersih dengan aksen teal cerah dan merah */
.custom-sidebar,
:deep(.q-drawer),
:deep(.q-drawer__content),
:deep(.q-navigation-deck) {
  background: #ffffff !important;
  color: #2d4a48 !important;
  border-right: 2px solid rgba(54, 173, 163, 0.15) !important;
}

.bg-profile-header {
  background: linear-gradient(135deg, #36ada3 0%, #2a9089 100%) !important;
  position: relative;
  overflow: hidden;
  border-bottom: 2px solid rgba(54, 173, 163, 0.3) !important;
}

.profile-avatar {
  border: 3px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.3);
}

.text-glow {
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.sidebar-section-title {
  font-size: 11px;
  font-weight: 800;
  color: #1e7a74 !important; /* Teal Dark */
  letter-spacing: 2px;
  margin: 22px 0 10px 24px;
  text-shadow: none;
  position: relative;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #ad3640;
    margin-right: 8px;
    box-shadow: 0 0 6px rgba(173, 54, 64, 0.4);
  }
}

.menu-text {
  font-weight: 600;
  letter-spacing: 0.1px;
}

.icon-sub {
  color: #36ada3 !important; /* Teal Icons */
}

/* ITEM MENU LEVEL 1 & 2 UTAMA - SEKARANG BERKONTRAST TINGGI DI ATAS BG GELAP */
.menu-item-clean {
  color: #2d4a48 !important; /* Teks gelap di bg putih */
  margin: 6px 14px;
  border-radius: 10px;
  min-height: 48px;
  padding: 8px 16px;
  background-color: transparent !important;
  border: 1px solid transparent !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  :deep(.q-icon) {
    color: #36ada3 !important;
    transition: color 0.25s ease;
  }

  &:hover {
    background-color: rgba(54, 173, 163, 0.08) !important;
    color: #1e7a74 !important;
    transform: translateX(4px);
    border-color: rgba(54, 173, 163, 0.4) !important;
    box-shadow: 0 4px 15px rgba(54, 173, 163, 0.12) !important;

    :deep(.q-icon) {
      color: #36ada3 !important;
    }
  }
}

.menu-item-active {
  background: linear-gradient(
    135deg,
    #36ada3 0%,
    #1e6e69 100%
  ) !important; /* Teal Gradient Active */
  color: #ffffff !important;
  font-weight: 800 !important;
  border: none !important;
  box-shadow: 0 8px 24px rgba(54, 173, 163, 0.35) !important;

  :deep(.q-icon) {
    color: #ffffff !important;
  }
  .menu-text {
    font-weight: 800;
  }
}

/* EXPANSION MENU OVERHAUL - KARTU GLASS GELAP UNTUK KATEGORI UTAMA */
.menu-expansion-clean {
  background-color: rgba(54, 173, 163, 0.04) !important;
  border-radius: 10px;
  margin: 6px 14px;
  border: 1px solid rgba(54, 173, 163, 0.1) !important;
  transition: all 0.3s ease;

  :deep(.q-item) {
    border-radius: 10px;
    min-height: 48px;
    color: #2d4a48 !important;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :deep(.q-item__section--avatar .q-icon) {
    color: #36ada3 !important;
  }

  :deep(.q-item:hover) {
    background-color: rgba(54, 173, 163, 0.1) !important;
    color: #1e7a74 !important;
    transform: translateX(3px);
    .q-item__section--avatar .q-icon {
      color: #36ada3 !important;
    }
  }

  &.q-expansion-item--expanded {
    background-color: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(54, 173, 163, 0.3) !important;
    background-color: rgba(54, 173, 163, 0.06) !important;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2) !important;
  }
}

.menu-expansion-header {
  font-size: 14px;
  font-weight: 700;
  color: #1e4a47 !important;
  text-shadow: none;
}

.sub-expansion-header {
  font-size: 13.5px;
  font-weight: 600;
  color: #2d4a48 !important;
}

.sub-expansion-title {
  color: #2d4a48 !important;
}

/* LEVEL 2 & LEVEL 3 ITEMS */
.level-2-expansion {
  margin-bottom: 2px;
  :deep(.q-item) {
    min-height: 44px;
    border-radius: 8px;
    color: #2d4a48 !important;
  }
}

.level-2-item-clean {
  border-radius: 8px;
  margin: 3px 10px 3px 20px;
  min-height: 42px;
  font-size: 13.5px;
  color: #2d4a48 !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  .icon-sub {
    color: #36ada3 !important;
  }

  &:hover {
    background-color: rgba(54, 173, 163, 0.1) !important;
    color: #1e7a74 !important;
    transform: translateX(4px);
    .icon-sub {
      color: #36ada3 !important;
    }
  }
}

.level-3-item-clean {
  border-radius: 8px;
  margin: 3px 10px 3px 36px;
  min-height: 38px;
  font-size: 13px;
  color: #3a5a57 !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  :deep(.q-icon) {
    color: #36ada3 !important;
    margin-right: 8px;
    transition: color 0.25s ease;
  }

  &:hover {
    background-color: rgba(54, 173, 163, 0.1) !important;
    color: #1e7a74 !important;
    transform: translateX(4px);
    :deep(.q-icon) {
      color: #36ada3 !important;
    }
  }
}

.sub-item-active {
  background-color: rgba(54, 173, 163, 0.18) !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  border: 1px solid rgba(54, 173, 163, 0.5) !important;
  border-radius: 8px;

  :deep(.q-icon),
  .icon-sub {
    color: #36ada3 !important;
    opacity: 1;
    text-shadow: 0 0 8px rgba(54, 173, 163, 0.6);
  }
  .menu-text {
    font-weight: 700;
  }

  &:hover {
    background-color: rgba(54, 173, 163, 0.25) !important;
    color: #ffffff !important;
  }
}

.sub-list-container {
  padding-left: 0;
  border-left: none;
}

/* ================== PREMIUM LOGOUT BUTTON ================== */
.border-top-soft {
  border-top: 1px solid rgba(54, 173, 163, 0.15) !important;
}

.bg-slate-50 {
  background-color: transparent !important;
}

.logout-btn {
  font-weight: 700;
  font-size: 13.5px;
  background-color: rgba(173, 54, 64, 0.06) !important;
  border: 1px dashed rgba(173, 54, 64, 0.4) !important;
  color: #ad3640 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 10px 0;

  &:hover {
    background-color: #ad3640 !important;
    color: #ffffff !important;
    border-style: solid;
    border-color: #ad3640 !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(173, 54, 64, 0.3) !important;
  }
  &:active {
    transform: translateY(0);
  }
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
  background-color: rgba(34, 197, 94, 0.05) !important;
  color: #4ade80 !important;
  border: 1px solid rgba(34, 197, 94, 0.15) !important;
  border-radius: 8px;

  :deep(.q-icon) {
    color: #4ade80 !important;
    opacity: 1;
  }

  &:hover {
    background-color: rgba(34, 197, 94, 0.12) !important;
    color: #22c55e !important;
    border-color: rgba(34, 197, 94, 0.4) !important;
    :deep(.q-icon) {
      color: #22c55e !important;
    }
  }
}

.sub-menu-item-active-green {
  background: linear-gradient(135deg, #22c55e 0%, #15803d 100%) !important;
  color: #ffffff !important;
  font-weight: 800 !important;
  border: none !important;
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3) !important;

  :deep(.q-icon) {
    color: #ffffff !important;
  }
}

.border-separator {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.06) !important;
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
