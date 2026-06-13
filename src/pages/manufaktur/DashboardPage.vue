<template>
  <q-page class="manufactur-dashboard">
    <section class="dashboard-shell">
      <span class="logic-anchor" aria-hidden="true">{{ statCards.length }}</span>

      <header class="dashboard-header">
        <div>
          <h1>Manufacturing Dashboard</h1>
          <p>Real-time operational monitoring AGRA ERP</p>
        </div>

        <div class="header-actions">
          <q-btn round flat class="header-icon-btn" aria-label="Notifications">
            <q-icon name="notifications" size="22px" />
            <span class="notification-pulse"></span>
          </q-btn>
          <div class="user-avatar">
            <q-icon name="person" size="24px" />
          </div>
        </div>
      </header>

      <section class="kpi-grid" aria-label="Manufacturing KPI">
        <article class="kpi-card">
          <div class="kpi-icon kpi-icon-green">
            <q-icon name="precision_manufacturing" size="26px" />
          </div>
          <span>Produksi Aktif</span>
          <q-skeleton v-if="loading" dark type="text" width="72px" height="42px" />
          <strong v-else>{{ animatedActiveProduction }}</strong>
          <small>Work order berjalan</small>
        </article>

        <article class="kpi-card">
          <div class="kpi-icon kpi-icon-cyan">
            <q-icon name="pending_actions" size="26px" />
          </div>
          <span>Order Pending</span>
          <strong>12</strong>
          <small>Menunggu penjadwalan</small>
        </article>

        <article class="kpi-card">
          <div class="kpi-icon kpi-icon-warning">
            <q-icon name="timer" size="26px" />
          </div>
          <span>Urgent Deadline</span>
          <strong>3</strong>
          <small>Butuh prioritas hari ini</small>
        </article>

        <article class="kpi-card">
          <div class="kpi-icon kpi-icon-danger">
            <q-icon name="inventory_2" size="26px" />
          </div>
          <span>Stock Kritis</span>
          <q-skeleton v-if="loading" dark type="text" width="72px" height="42px" />
          <strong v-else>{{ animatedCriticalStock }}</strong>
          <small>Material di bawah minimum</small>
        </article>

        <article class="kpi-card">
          <div class="kpi-icon kpi-icon-danger">
            <q-icon name="rule" size="26px" />
          </div>
          <span>QC Reject Hari Ini</span>
          <strong>14</strong>
          <small>Item perlu inspeksi ulang</small>
        </article>

        <article class="kpi-card">
          <div class="kpi-icon kpi-icon-green">
            <q-icon name="local_shipping" size="26px" />
          </div>
          <span>Delivery Ready</span>
          <q-skeleton v-if="loading" dark type="text" width="72px" height="42px" />
          <strong v-else>{{ Math.max(animatedBOM, 8) }}</strong>
          <small>Batch siap dikirim</small>
        </article>
      </section>

      <section class="main-grid">
        <article class="glass-card progress-card">
          <div class="section-heading">
            <div>
              <h2>Production Progress Today</h2>
              <p>Department throughput</p>
            </div>
            <q-icon name="monitoring" size="26px" />
          </div>

          <div class="progress-list">
            <div class="progress-row">
              <div class="progress-meta">
                <span>Cutting</span>
                <strong>82%</strong>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: 82%"></div>
              </div>
            </div>

            <div class="progress-row">
              <div class="progress-meta">
                <span>EPS</span>
                <strong>63%</strong>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: 63%"></div>
              </div>
            </div>

            <div class="progress-row">
              <div class="progress-meta">
                <span>Packing</span>
                <strong>45%</strong>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: 45%"></div>
              </div>
            </div>

            <div class="progress-row">
              <div class="progress-meta">
                <span>QC</span>
                <strong>91%</strong>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: 91%"></div>
              </div>
            </div>
          </div>
        </article>

        <article class="glass-card weekly-card">
          <div class="section-heading">
            <div>
              <h2>Weekly Production</h2>
              <p>Target vs Actual</p>
            </div>
            <q-icon name="stacked_bar_chart" size="26px" />
          </div>

          <div class="chart-legend">
            <span><i class="legend-target"></i>Target</span>
            <span><i class="legend-actual"></i>Actual</span>
          </div>

          <div class="weekly-chart">
            <div class="chart-day">
              <div class="bar-pair">
                <i class="bar target" style="height: 72%"></i>
                <i class="bar actual" style="height: 65%"></i>
              </div>
              <span>Mon</span>
            </div>
            <div class="chart-day">
              <div class="bar-pair">
                <i class="bar target" style="height: 78%"></i>
                <i class="bar actual" style="height: 71%"></i>
              </div>
              <span>Tue</span>
            </div>
            <div class="chart-day">
              <div class="bar-pair">
                <i class="bar target" style="height: 82%"></i>
                <i class="bar actual" style="height: 76%"></i>
              </div>
              <span>Wed</span>
            </div>
            <div class="chart-day">
              <div class="bar-pair">
                <i class="bar target" style="height: 86%"></i>
                <i class="bar actual" style="height: 58%"></i>
              </div>
              <span>Thu</span>
            </div>
            <div class="chart-day">
              <div class="bar-pair">
                <i class="bar target" style="height: 75%"></i>
                <i class="bar actual" style="height: 69%"></i>
              </div>
              <span>Fri</span>
            </div>
            <div class="chart-day">
              <div class="bar-pair">
                <i class="bar target" style="height: 68%"></i>
                <i class="bar actual" style="height: 52%"></i>
              </div>
              <span>Sat</span>
            </div>
            <div class="chart-day">
              <div class="bar-pair">
                <i class="bar target" style="height: 62%"></i>
                <i class="bar actual" style="height: 48%"></i>
              </div>
              <span>Sun</span>
            </div>
          </div>
        </article>
      </section>

      <section class="alert-grid" aria-label="Manufacturing alerts">
        <article class="alert-card">
          <div class="alert-icon warning">
            <q-icon name="warning" size="22px" />
          </div>
          <div>
            <div class="alert-topline">
              <h3>Deadline 2 Days Left</h3>
              <span class="badge warning">68%</span>
            </div>
            <p>Customer: SANJAYA MOONTAGE</p>
            <div class="mini-track">
              <i style="width: 68%"></i>
            </div>
          </div>
        </article>

        <article class="alert-card">
          <div class="alert-icon danger">
            <q-icon name="priority_high" size="22px" />
          </div>
          <div>
            <div class="alert-topline">
              <h3>Stock Critical</h3>
              <span class="badge danger">20 pcs</span>
            </div>
            <p>Material: Besi Hollow</p>
            <small>Remaining: 20 pcs</small>
          </div>
        </article>

        <article class="alert-card">
          <div class="alert-icon danger">
            <q-icon name="report_problem" size="22px" />
          </div>
          <div>
            <div class="alert-topline">
              <h3>QC Reject</h3>
              <span class="badge danger">14 pcs</span>
            </div>
            <p>Item: Stay Wire</p>
            <small>Rejected: 14 pcs</small>
          </div>
        </article>
      </section>

      <section class="bottom-grid">
        <article class="glass-card activity-card">
          <div class="section-heading">
            <div>
              <h2>Live Activity</h2>
              <p>Latest production movement</p>
            </div>
            <q-icon name="timeline" size="26px" />
          </div>

          <div class="timeline">
            <div class="timeline-item">
              <span>13:20</span>
              <p>Cutting updated qty 3200</p>
            </div>
            <div class="timeline-item">
              <span>13:35</span>
              <p>EPS finished order PLN-001</p>
            </div>
            <div class="timeline-item danger">
              <span>13:40</span>
              <p>QC rejected 5 pcs</p>
            </div>
            <div class="timeline-item">
              <span>14:05</span>
              <p>Packing completed batch #12</p>
            </div>
          </div>
        </article>

        <article class="glass-card quick-card">
          <div class="section-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Operational shortcuts</p>
            </div>
            <q-icon name="bolt" size="26px" />
          </div>

          <div class="quick-actions">
            <button type="button">
              <q-icon name="auto_awesome_motion" size="22px" />
              <span>Generate Planning</span>
            </button>
            <button type="button">
              <q-icon name="assignment_add" size="22px" />
              <span>Material Request</span>
            </button>
            <button type="button">
              <q-icon name="edit_note" size="22px" />
              <span>Update Produksi</span>
            </button>
            <button type="button">
              <q-icon name="fact_check" size="22px" />
              <span>Input QC</span>
            </button>
          </div>
        </article>
      </section>
    </section>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, getDocs } from 'firebase/firestore'

const totalActiveProduction = ref(0)
const totalCriticalStock = ref(0)
const totalBOM = ref(0)
const animatedActiveProduction = ref(0)
const animatedCriticalStock = ref(0)
const animatedBOM = ref(0)
const loading = ref(true)
const animationFrames = new Set()

const animateNumber = (source, target) => {
  watch(
    source,
    (nextValue, previousValue = 0) => {
      const start = Number(previousValue) || 0
      const end = Number(nextValue) || 0
      const duration = 650
      const startedAt = performance.now()

      const tick = (now) => {
        animationFrames.delete(activeFrame)
        const progress = Math.min((now - startedAt) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        target.value = Math.round(start + (end - start) * eased)

        if (progress < 1) {
          activeFrame = requestAnimationFrame(tick)
          animationFrames.add(activeFrame)
        }
      }

      let activeFrame = requestAnimationFrame(tick)
      animationFrames.add(activeFrame)
    },
    { immediate: true },
  )
}

animateNumber(totalActiveProduction, animatedActiveProduction)
animateNumber(totalCriticalStock, animatedCriticalStock)
animateNumber(totalBOM, animatedBOM)

const statCards = ref([
  {
    title: 'Produksi Aktif',
    value: animatedActiveProduction,
    icon: 'precision_manufacturing',
    color: '#1976d2',
    iconColor: 'blue-8',
  },
  {
    title: 'Stok Kritis',
    value: animatedCriticalStock,
    icon: 'warning_amber',
    color: '#d32f2f',
    iconColor: 'red-8',
  },
  {
    title: 'Total Resep (BOM)',
    value: animatedBOM,
    icon: 'receipt_long',
    color: '#004d40',
    iconColor: 'teal-8',
  },
])

const fetchData = async () => {
  try {
    const wo = await getDocs(collection(db, 'work_orders'))
    totalActiveProduction.value = wo.docs.filter((d) => d.data().status !== 'Selesai').length
    const mat = await getDocs(collection(db, 'materials'))
    totalCriticalStock.value = mat.docs.filter((d) => Number(d.data().stok) <= 10).length
    const bom = await getDocs(collection(db, 'boms'))
    totalBOM.value = bom.size
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
onMounted(fetchData)
onUnmounted(() => {
  animationFrames.forEach((frame) => cancelAnimationFrame(frame))
  animationFrames.clear()
})
</script>

<style scoped>
.manufactur-dashboard {
  min-height: 100vh;
  background:
    radial-gradient(circle at 14% 8%, rgba(0, 209, 178, 0.16), transparent 30%),
    radial-gradient(circle at 82% 0%, rgba(124, 255, 79, 0.12), transparent 28%),
    linear-gradient(135deg, #071826 0%, #0d2233 100%);
  color: #f4f7fa;
  padding: 28px;
}

.dashboard-shell {
  position: relative;
  max-width: 1480px;
  margin: 0 auto;
}

.logic-anchor {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.dashboard-header,
.section-heading,
.alert-topline,
.progress-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-header h1,
.section-heading h2,
.alert-card h3 {
  margin: 0;
  color: #f4f7fa;
  letter-spacing: 0;
}

.dashboard-header h1 {
  font-size: clamp(30px, 4vw, 44px);
  font-weight: 800;
  line-height: 1.08;
}

.dashboard-header p,
.section-heading p,
.alert-card p,
.alert-card small,
.kpi-card small,
.kpi-card span,
.chart-day span,
.timeline-item span {
  color: #8ca3b8;
}

.dashboard-header p,
.section-heading p {
  margin: 8px 0 0;
  font-size: 15px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon-btn,
.user-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  border: 1px solid rgba(124, 255, 79, 0.16);
  border-radius: 18px;
  background: rgba(13, 34, 51, 0.76);
  color: #f4f7fa;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(18px);
}

.user-avatar {
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(124, 255, 79, 0.22), rgba(0, 209, 178, 0.18));
}

.notification-pulse {
  position: absolute;
  top: 11px;
  right: 12px;
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #7cff4f;
  box-shadow: 0 0 18px rgba(124, 255, 79, 0.85);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.kpi-card,
.glass-card,
.alert-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(124, 255, 79, 0.12);
  border-radius: 18px;
  background: rgba(22, 45, 68, 0.8);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(18px);
}

.kpi-card::before,
.glass-card::before,
.alert-card::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent 36%);
  content: '';
}

.kpi-card {
  min-height: 172px;
  padding: 20px;
}

.kpi-icon,
.alert-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 18px;
  border-radius: 16px;
  color: #071826;
}

.kpi-icon-green {
  background: #7cff4f;
  box-shadow: 0 0 26px rgba(124, 255, 79, 0.32);
}

.kpi-icon-cyan {
  background: #00d1b2;
  box-shadow: 0 0 26px rgba(0, 209, 178, 0.32);
}

.kpi-icon-warning {
  background: #ffa940;
  box-shadow: 0 0 26px rgba(255, 169, 64, 0.28);
}

.kpi-icon-danger {
  background: #ff4d4f;
  color: #fff;
  box-shadow: 0 0 26px rgba(255, 77, 79, 0.28);
}

.kpi-card span,
.kpi-card small {
  display: block;
  font-size: 13px;
  font-weight: 600;
}

.kpi-card strong {
  display: block;
  margin: 8px 0 2px;
  color: #f4f7fa;
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
}

.kpi-card small {
  line-height: 1.45;
}

.main-grid,
.bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(340px, 0.85fr);
  gap: 24px;
  margin-bottom: 24px;
}

.glass-card {
  padding: 24px;
  background: rgba(13, 34, 51, 0.88);
}

.section-heading {
  margin-bottom: 24px;
}

.section-heading h2 {
  font-size: 20px;
  font-weight: 750;
}

.section-heading > .q-icon {
  color: #00d1b2;
  filter: drop-shadow(0 0 14px rgba(0, 209, 178, 0.45));
}

.progress-list {
  display: grid;
  gap: 24px;
}

.progress-meta {
  margin-bottom: 10px;
  font-size: 15px;
}

.progress-meta span {
  color: #f4f7fa;
  font-weight: 650;
}

.progress-meta strong {
  color: #7cff4f;
  font-size: 15px;
}

.progress-track,
.mini-track {
  overflow: hidden;
  height: 12px;
  border-radius: 999px;
  background: rgba(244, 247, 250, 0.09);
}

.progress-fill,
.mini-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #7cff4f 0%, #00d1b2 100%);
  box-shadow: 0 0 18px rgba(0, 209, 178, 0.42);
  animation: progressGlow 2.4s ease-in-out infinite;
}

.chart-legend {
  display: flex;
  gap: 16px;
  margin-bottom: 18px;
  color: #8ca3b8;
  font-size: 13px;
}

.chart-legend span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.chart-legend i {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.legend-target {
  background: rgba(140, 163, 184, 0.72);
}

.legend-actual {
  background: #00d1b2;
}

.weekly-chart {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  align-items: end;
  gap: 12px;
  height: 250px;
  padding-top: 14px;
}

.chart-day {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 12px;
  height: 100%;
  text-align: center;
}

.bar-pair {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 5px;
  min-height: 0;
  border-bottom: 1px solid rgba(140, 163, 184, 0.18);
}

.bar {
  display: block;
  width: 10px;
  min-height: 28px;
  border-radius: 999px 999px 4px 4px;
}

.bar.target {
  background: rgba(140, 163, 184, 0.5);
}

.bar.actual {
  background: linear-gradient(180deg, #7cff4f, #00d1b2);
  box-shadow: 0 0 16px rgba(0, 209, 178, 0.35);
}

.alert-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.alert-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  padding: 20px;
  background: rgba(13, 34, 51, 0.88);
}

.alert-icon {
  width: 44px;
  height: 44px;
  margin: 0;
  color: #071826;
}

.alert-icon.warning {
  background: #ffa940;
}

.alert-icon.danger {
  background: #ff4d4f;
  color: #fff;
}

.alert-card h3 {
  font-size: 16px;
  font-weight: 750;
}

.alert-card p {
  margin: 8px 0;
  font-size: 14px;
}

.badge {
  flex: 0 0 auto;
  padding: 5px 10px;
  border-radius: 999px;
  color: #071826;
  font-size: 12px;
  font-weight: 800;
}

.badge.warning {
  background: #ffa940;
}

.badge.danger {
  background: #ff4d4f;
  color: #fff;
}

.mini-track {
  height: 8px;
  margin-top: 12px;
}

.activity-card,
.quick-card {
  min-height: 360px;
}

.timeline {
  position: relative;
  display: grid;
  gap: 22px;
  padding-left: 24px;
}

.timeline::before {
  position: absolute;
  top: 7px;
  bottom: 7px;
  left: 7px;
  width: 1px;
  background: linear-gradient(180deg, #7cff4f, #00d1b2, rgba(0, 209, 178, 0.08));
  content: '';
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 16px;
}

.timeline-item::before {
  position: absolute;
  top: 6px;
  left: -23px;
  width: 14px;
  height: 14px;
  border: 3px solid rgba(13, 34, 51, 0.92);
  border-radius: 999px;
  background: #7cff4f;
  box-shadow: 0 0 18px rgba(124, 255, 79, 0.75);
  content: '';
}

.timeline-item.danger::before {
  background: #ff4d4f;
  box-shadow: 0 0 18px rgba(255, 77, 79, 0.72);
}

.timeline-item span {
  font-size: 13px;
  font-weight: 750;
}

.timeline-item p {
  margin: 0;
  color: #f4f7fa;
  font-size: 15px;
  line-height: 1.45;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.quick-actions button {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 72px;
  padding: 16px;
  border: 1px solid rgba(0, 209, 178, 0.18);
  border-radius: 18px;
  background: rgba(22, 45, 68, 0.72);
  color: #f4f7fa;
  font: inherit;
  font-weight: 750;
  text-align: left;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.quick-actions button .q-icon {
  flex: 0 0 auto;
  color: #7cff4f;
}

.quick-actions button:hover {
  border-color: rgba(124, 255, 79, 0.45);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.28);
  transform: translateY(-2px);
}

@keyframes progressGlow {
  0%,
  100% {
    filter: brightness(1);
  }

  50% {
    filter: brightness(1.18);
  }
}

@media (max-width: 1180px) {
  .kpi-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .main-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .manufactur-dashboard {
    padding: 18px;
  }

  .dashboard-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .kpi-grid,
  .alert-grid,
  .quick-actions {
    grid-template-columns: 1fr;
  }

  .weekly-chart {
    gap: 8px;
    height: 210px;
  }

  .glass-card,
  .kpi-card,
  .alert-card {
    padding: 18px;
  }
}

@media (max-width: 420px) {
  .timeline-item {
    grid-template-columns: 48px 1fr;
    gap: 12px;
  }

  .bar {
    width: 8px;
  }
}
</style>
