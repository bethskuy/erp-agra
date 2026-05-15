<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-2">
    <!-- Header -->
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

        <!-- NOTIFIKASI TOTAL (Penawaran + PR + Rejected/Approved) -->
        <q-btn flat round icon="notifications" class="q-mr-xs">
          <q-badge
            color="red"
            floating
            v-if="
              pendingApprovalCount +
                pendingPrCount +
                rejectedPenawaranCount +
                approvedPenawaranCount >
              0
            "
          >
            {{
              pendingApprovalCount +
              pendingPrCount +
              rejectedPenawaranCount +
              approvedPenawaranCount
            }}
          </q-badge>

          <!-- MENU DROPDOWN NOTIFIKASI DETAIL -->
          <q-menu
            auto-close
            anchor="bottom right"
            self="top right"
            :offset="[0, 10]"
            class="shadow-10 rounded-12"
          >
            <q-list style="min-width: 280px" class="q-py-sm">
              <q-item-label
                header
                class="text-weight-bold text-indigo-10 uppercase tracking-widest"
                style="font-size: 11px"
              >
                Notifikasi Sistem
              </q-item-label>

              <!-- Notifikasi Approval Penawaran -->
              <q-item
                v-if="pendingApprovalCount > 0"
                clickable
                v-ripple
                to="/konstruksi/marketing/approval-penawaran"
              >
                <q-item-section avatar>
                  <q-avatar color="orange-1" text-color="orange-9" icon="fact_check" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Approval Penawaran</q-item-label>
                  <q-item-label caption
                    >{{ pendingApprovalCount }} dokumen menunggu persetujuan.</q-item-label
                  >
                </q-item-section>
              </q-item>

              <!-- Notifikasi Penawaran Ditolak -->
              <q-item
                v-if="rejectedPenawaranCount > 0"
                clickable
                v-ripple
                to="/konstruksi/marketing/penawaran"
              >
                <q-item-section avatar>
                  <q-avatar color="red-1" text-color="negative" icon="cancel" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-negative"
                    >Penawaran Ditolak</q-item-label
                  >
                  <q-item-label caption
                    >{{ rejectedPenawaranCount }} dokumen membutuhkan revisi.</q-item-label
                  >
                </q-item-section>
              </q-item>

              <!-- Notifikasi Penawaran Disetujui -->
              <q-item
                v-if="approvedPenawaranCount > 0"
                clickable
                v-ripple
                to="/konstruksi/marketing/penawaran"
              >
                <q-item-section avatar>
                  <q-avatar color="green-1" text-color="positive" icon="verified" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-positive"
                    >Penawaran Disetujui</q-item-label
                  >
                  <q-item-label caption
                    >{{ approvedPenawaranCount }} dokumen telah disetujui.</q-item-label
                  >
                </q-item-section>
              </q-item>

              <!-- Notifikasi Purchase Request -->
              <q-item
                v-if="pendingPrCount > 0"
                clickable
                v-ripple
                to="/konstruksi/pembelian/pesanan"
              >
                <q-item-section avatar>
                  <q-avatar color="orange-1" text-color="orange-9" icon="shopping_cart" size="md" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">Purchase Request</q-item-label>
                  <q-item-label caption>{{ pendingPrCount }} PR menunggu diproses.</q-item-label>
                </q-item-section>
              </q-item>

              <!-- Pesan Kosong Jika Tidak Ada Notif -->
              <q-item
                v-if="
                  pendingApprovalCount +
                    pendingPrCount +
                    rejectedPenawaranCount +
                    approvedPenawaranCount ===
                  0
                "
              >
                <q-item-section class="text-center text-grey-6 q-pa-md text-caption">
                  <i>Belum ada pemberitahuan baru</i>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <!-- APP LAUNCHER -->
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

        <!-- USER PROFILE -->
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

    <!-- Sidebar / Drawer -->
    <q-drawer v-model="leftDrawerOpen" show-if-above :width="295" class="bg-white" elevation="10">
      <div class="column fit">
        <div class="q-pa-lg bg-indigo-1 text-indigo-10 border-bottom-soft">
          <div class="row items-center q-gutter-md">
            <q-avatar size="56px" color="indigo-10" text-color="white" class="shadow-2">
              {{ userData?.nama?.charAt(0) || 'A' }}
            </q-avatar>
            <div class="col overflow-hidden">
              <div class="text-weight-bold text-subtitle1 ellipsis">
                {{ userData?.nama || 'Administrator' }}
              </div>
              <div
                class="text-caption text-grey-7 ellipsis text-uppercase tracking-widest"
                style="font-size: 10px"
              >
                {{ authStore.user?.role || 'User' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Hapus Scrollbar Horizontal (Kanan-Kiri) Secara Paksa -->
        <q-scroll-area
          class="col"
          :horizontal-thumb-style="{ display: 'none' }"
          :horizontal-bar-style="{ display: 'none' }"
          content-style="overflow-x: hidden;"
        >
          <q-list class="q-py-md">
            <div class="q-px-md q-pt-sm q-pb-sm text-overline text-grey-6 tracking-widest">
              UTAMA
            </div>
            <q-item
              v-if="checkPermission('dashboard')"
              clickable
              v-ripple
              to="/konstruksi/dashboard"
              class="menu-item q-mb-sm"
              active-class="menu-item-active"
            >
              <q-item-section avatar><q-icon name="dashboard" size="22px" /></q-item-section>
              <q-item-section class="text-weight-bold">DASHBOARD</q-item-section>
            </q-item>

            <!-- DATA MASTER -->
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
              icon="grid_view"
              label="DATA MASTER"
              class="menu-expansion q-mb-xs"
              header-class="text-weight-bold"
              default-opened
            >
              <q-list>
                <!-- Rekanan -->
                <q-expansion-item
                  v-if="hasSectionAccess(['marketing/customer', 'master/supplier'])"
                  icon="groups"
                  label="Data Rekanan"
                  header-class="text-blue-grey-9 text-weight-bold"
                  dense
                  class="level-2-expansion"
                >
                  <q-list>
                    <q-item
                      v-if="checkPermission('marketing/customer')"
                      clickable
                      v-ripple
                      to="/konstruksi/marketing/customer"
                      class="level-3-item"
                      active-class="sub-menu-item-active"
                    >
                      <q-item-section avatar
                        ><q-icon name="person_outline" size="18px"
                      /></q-item-section>
                      <q-item-section>Customer</q-item-section>
                    </q-item>
                    <q-item
                      v-if="checkPermission('master/supplier')"
                      clickable
                      v-ripple
                      to="/konstruksi/master/supplier"
                      class="level-3-item"
                      active-class="sub-menu-item-active"
                    >
                      <q-item-section avatar
                        ><q-icon name="local_shipping" size="18px"
                      /></q-item-section>
                      <q-item-section>Data Supplier</q-item-section>
                    </q-item>
                  </q-list>
                </q-expansion-item>
                <!-- Barang -->
                <q-expansion-item
                  v-if="
                    hasSectionAccess([
                      'master/barang-list',
                      'master/barang-kategori',
                      'master/satuan',
                    ])
                  "
                  icon="inventory_2"
                  label="Data Barang"
                  header-class="text-blue-grey-9 text-weight-bold"
                  dense
                  class="level-2-expansion"
                >
                  <q-list>
                    <q-item
                      v-if="checkPermission('master/barang-list')"
                      clickable
                      v-ripple
                      to="/konstruksi/master/barang-list"
                      class="level-3-item"
                      active-class="sub-menu-item-active"
                    >
                      <q-item-section avatar><q-icon name="list_alt" size="18px" /></q-item-section>
                      <q-item-section>List Barang</q-item-section>
                    </q-item>
                    <q-item
                      v-if="checkPermission('master/barang-kategori')"
                      clickable
                      v-ripple
                      to="/konstruksi/master/barang-kategori"
                      class="level-3-item"
                      active-class="sub-menu-item-active"
                    >
                      <q-item-section avatar><q-icon name="category" size="18px" /></q-item-section>
                      <q-item-section>Kategori Barang</q-item-section>
                    </q-item>
                    <q-item
                      v-if="checkPermission('master/satuan')"
                      clickable
                      v-ripple
                      to="/konstruksi/master/satuan"
                      class="level-3-item"
                      active-class="sub-menu-item-active"
                    >
                      <q-item-section avatar
                        ><q-icon name="straighten" size="18px"
                      /></q-item-section>
                      <q-item-section>Data Satuan</q-item-section>
                    </q-item>
                  </q-list>
                </q-expansion-item>
              </q-list>
            </q-expansion-item>

            <q-separator spaced inset class="bg-grey-3 q-my-md" />
            <div class="q-px-md q-pt-sm q-pb-sm text-overline text-grey-6 tracking-widest">
              OPERASIONAL
            </div>

            <!-- MARKETING -->
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
              class="menu-expansion q-mb-sm"
              header-class="text-weight-bold"
            >
              <q-list>
                <q-item
                  v-if="checkPermission('marketing/ahsp')"
                  clickable
                  v-ripple
                  to="/konstruksi/marketing/ahsp"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar><q-icon name="calculate" size="20px" /></q-item-section>
                  <q-item-section>Analisa AHSP</q-item-section>
                </q-item>

                <!-- MENU PENAWARAN (DENGAN BADGE REJECTED & APPROVED) -->
                <q-item
                  v-if="checkPermission('marketing/penawaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/marketing/penawaran"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="request_quote" size="20px"
                  /></q-item-section>
                  <q-item-section>Penawaran</q-item-section>
                  <!-- BADGE NOTIFIKASI PENAWARAN -->
                  <q-item-section
                    side
                    v-if="rejectedPenawaranCount > 0 || approvedPenawaranCount > 0"
                  >
                    <div class="row items-center q-gutter-x-xs">
                      <q-badge
                        v-if="rejectedPenawaranCount > 0"
                        color="negative"
                        rounded
                        class="q-px-sm text-weight-bold"
                      >
                        {{ rejectedPenawaranCount }}
                      </q-badge>
                      <q-badge
                        v-if="approvedPenawaranCount > 0"
                        color="positive"
                        rounded
                        class="q-px-sm text-weight-bold"
                      >
                        {{ approvedPenawaranCount }}
                      </q-badge>
                    </div>
                  </q-item-section>
                </q-item>

                <!-- MENU APPROVAL PENAWARAN -->
                <q-item
                  v-if="checkPermission('marketing/approval-penawaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/marketing/approval-penawaran"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar><q-icon name="fact_check" size="20px" /></q-item-section>
                  <q-item-section>Approval Penawaran</q-item-section>
                  <q-item-section side v-if="pendingApprovalCount > 0">
                    <q-badge color="orange-9" rounded class="q-px-sm text-weight-bold">{{
                      pendingApprovalCount
                    }}</q-badge>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <!-- PROYEK -->
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
              class="menu-expansion q-mb-sm"
              header-class="text-weight-bold"
            >
              <q-list>
                <q-item
                  v-if="checkPermission('master/proyek-data')"
                  clickable
                  v-ripple
                  to="/konstruksi/master/proyek-data"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar><q-icon name="apartment" size="20px" /></q-item-section>
                  <q-item-section>Data Proyek</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('master/proyek-monitoring')"
                  clickable
                  v-ripple
                  to="/konstruksi/master/proyek-monitoring"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar><q-icon name="monitor" size="20px" /></q-item-section>
                  <q-item-section>Monitoring Proyek</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('master/proyek-kategori')"
                  clickable
                  v-ripple
                  to="/konstruksi/master/proyek-kategori"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar><q-icon name="account_tree" size="20px" /></q-item-section>
                  <q-item-section>Kategori Proyek</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <!-- GUDANG -->
            <q-item
              v-if="checkPermission('gudang')"
              clickable
              v-ripple
              to="/konstruksi/gudang"
              class="menu-item q-mb-sm"
              active-class="menu-item-active"
            >
              <q-item-section avatar><q-icon name="warehouse" size="22px" /></q-item-section>
              <q-item-section class="text-weight-bold uppercase">GUDANG & LOGISTIK</q-item-section>
            </q-item>

            <!-- PEMBELIAN -->
            <q-expansion-item
              v-if="checkPermission('pembelian/pesanan')"
              icon="shopping_cart"
              label="PEMBELIAN"
              class="menu-expansion q-mb-sm"
              header-class="text-weight-bold"
            >
              <q-list>
                <q-item
                  clickable
                  v-ripple
                  to="/konstruksi/pembelian/pesanan"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar><q-icon name="receipt_long" size="20px" /></q-item-section>
                  <q-item-section>Pesanan Pembelian (PO)</q-item-section>
                  <q-item-section side v-if="pendingPrCount > 0">
                    <q-badge color="orange-9" rounded class="q-px-sm text-weight-bold">{{
                      pendingPrCount
                    }}</q-badge>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <!-- FINANCE -->
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
              class="menu-expansion q-mb-sm"
              header-class="text-weight-bold"
            >
              <q-list>
                <q-item
                  v-if="checkPermission('finance/invoice')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/invoice"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar><q-icon name="receipt_long" size="20px" /></q-item-section>
                  <q-item-section>Pembuatan Invoice</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('finance/approval-invoice')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/approval-invoice"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar><q-icon name="fact_check" size="20px" /></q-item-section>
                  <q-item-section>Approval Invoice</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('finance/tagihan')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/tagihan"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar><q-icon name="receipt" size="20px" /></q-item-section>
                  <q-item-section>Monitoring Tagihan</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('finance/tagihan-supplier')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/tagihan-supplier"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar><q-icon name="list_alt" size="20px" /></q-item-section>
                  <q-item-section>Tagihan Supplier / Labour</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('finance/pembayaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/pembayaran"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar><q-icon name="payments" size="20px" /></q-item-section>
                  <q-item-section>Pengajuan Pembayaran</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('finance/approval-pembayaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/approval-pembayaran"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar><q-icon name="gavel" size="20px" /></q-item-section>
                  <q-item-section>Approval Pembayaran</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('finance/realisasi-pembayaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/realisasi-pembayaran"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar><q-icon name="price_check" size="20px" /></q-item-section>
                  <q-item-section>Realisasi Pembayaran</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('finance/pengeluaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/pengeluaran"
                  class="level-2-item"
                  active-class="sub-menu-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="trending_down" size="20px"
                  /></q-item-section>
                  <q-item-section>Monitoring Pengeluaran</q-item-section>
                </q-item>

                <q-item
                  v-if="checkPermission('finance/balansheet')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/balansheet"
                  class="level-2-item special-green-item q-mt-sm"
                  active-class="sub-menu-item-active-green"
                >
                  <q-item-section avatar
                    ><q-icon name="account_balance" size="20px"
                  /></q-item-section>
                  <q-item-section><i>Monitoring Balansheet</i></q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <div style="height: 100px"></div>
          </q-list>
        </q-scroll-area>
      </div>
    </q-drawer>

    <!-- Page Container -->
    <q-page-container>
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
const pendingApprovalCount = ref(0)
const rejectedPenawaranCount = ref(0)
const approvedPenawaranCount = ref(0)
const pendingPrCount = ref(0)
const userData = ref(null)
const apps = ref([])
const currentAkses = ref([])

let unsubUser = null
let unsubApproval = null
let unsubRejectedPenawaran = null
let unsubApprovedPenawaran = null
let unsubApps = null
let unsubPrBadge = null

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

  const qPr = query(
    collection(db, 'permintaan_barang'),
    where('status', '==', 'Pending'),
    where('tipe', '==', 'PURCHASE_REQUEST'),
  )
  unsubPrBadge = onSnapshot(qPr, (snap) => {
    pendingPrCount.value = snap.size
  })
})

onUnmounted(() => {
  if (unsubUser) unsubUser()
  if (unsubApproval) unsubApproval()
  if (unsubRejectedPenawaran) unsubRejectedPenawaran()
  if (unsubApprovedPenawaran) unsubApprovedPenawaran()
  if (unsubApps) unsubApps()
  if (unsubPrBadge) unsubPrBadge()
})
</script>

<style lang="scss" scoped>
.app-launcher-menu {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.app-btn {
  border-radius: 8px;
  padding: 12px 4px;
  transition: all 0.3s ease;
  min-height: 85px;
  &:hover {
    background: #f8f9fa;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
}
.active-app {
  background: #e8eaf6;
  border: 1px solid rgba(26, 35, 126, 0.1);
  .app-label {
    font-weight: 700;
    color: #1a237e;
  }
}
.app-label {
  font-size: 11px;
  margin-top: 8px;
  color: #444;
  font-weight: 500;
  line-height: 1.2;
}
.menu-item {
  border-radius: 0 25px 25px 0;
  color: #546e7a;
  margin: 0 12px 4px 0;
  font-size: 13.5px;
  &:hover {
    background-color: rgba(26, 35, 126, 0.04);
    color: #1a237e;
  }
}
.menu-item-active {
  background-color: #e8eaf6 !important;
  color: #1a237e !important;
  font-weight: 800 !important;
  border-right: 5px solid #1a237e;
}
.menu-expansion {
  border-radius: 0 25px 25px 0;
  margin: 0 12px 4px 0;
  color: #37474f;
  :deep(.q-item) {
    border-radius: 0 25px 25px 0;
    min-height: 50px;
  }
}
.level-2-expansion {
  margin-bottom: 2px;
  :deep(.q-item) {
    padding-left: 42px !important;
    min-height: 44px;
    border-radius: 0 25px 25px 0;
  }
}
.level-2-item {
  border-radius: 0 25px 25px 0;
  margin-bottom: 2px;
  min-height: 42px;
  padding-left: 42px;
  font-size: 13.5px;
  color: #546e7a;
  transition: all 0.3s ease;
  &:hover {
    background-color: #f5f5f5;
  }
}

/* Mematikan semua scrollbar bawaan di dalam q-scroll-area agar tampil rapi */
:deep(.q-scrollarea__content) {
  overflow-x: hidden !important;
}

.special-green-item {
  background-color: #2e7d32 !important;
  color: #ffffff !important;
  font-weight: 700;

  .q-icon {
    color: #ffffff !important;
  }

  &:hover {
    background-color: #1b5e20 !important;
  }
}

.sub-menu-item-active-green {
  color: #ffffff !important;
  font-weight: 800 !important;
  background-color: #1b5e20 !important;
  border-right: 5px solid #81c784;
  .q-icon {
    color: #ffffff !important;
  }
}

.level-3-item {
  border-radius: 0 25px 25px 0;
  margin-bottom: 2px;
  min-height: 38px;
  padding-left: 72px;
  font-size: 13px;
  color: #607d8b;
}
.sub-menu-item-active {
  color: #1a237e !important;
  font-weight: 700;
  background-color: rgba(26, 35, 126, 0.05) !important;
}
.border-bottom-soft {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.rounded-20 {
  border-radius: 20px;
}
.border-white-3 {
  border: 3px solid white;
}
</style>
