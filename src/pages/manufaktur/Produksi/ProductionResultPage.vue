<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-teal-10">Production Result Monitoring</div>
        <div class="text-subtitle2 text-grey-6">Integrasi Produksi & Proyek Konstruksi</div>
      </div>

      <q-btn
        color="teal-10"
        icon="add"
        label="Tambah Hasil Produksi"
        @click="openDialog"
        class="shadow-2"
      />
    </div>

    <q-card flat class="rounded-borders shadow-sm">
      <q-table :rows="rows" :columns="columns" row-key="id" flat>
        <template v-slot:body-cell-wo="props">
          <q-td :props="props">
            <div class="text-weight-bold text-teal-9">{{ props.row.wo }}</div>
            <div class="text-caption text-grey-7">{{ props.row.productName }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-jumlah_hasil="props">
          <q-td :props="props" class="text-center">
            <q-chip outline color="teal" text-color="white" icon="inventory_2">
              {{ props.row.jumlah_hasil }} Unit
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td class="text-center">
            <q-btn dense flat icon="delete" color="negative" @click="confirmDelete(props.row.id)" />
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width text-center q-pa-md text-grey">
            Belum ada aktivitas produksi 🚧
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 450px; border-radius: 15px">
        <q-card-section class="bg-teal-10 text-white row items-center">
          <div class="text-h6">Recording Production</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-lg q-gutter-md">
          <q-select
            outlined
            v-model="form.work_order_id"
            :options="woOptions"
            label="Pilih Work Order (Target Proyek)"
            option-label="kode"
            option-value="id"
            emit-value
            map-options
            @update:model-value="syncProductInfo"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.kode }}</q-item-label>
                  <q-item-label caption>Produk: {{ scope.opt.productName }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-input
            outlined
            v-model.number="form.jumlah_hasil"
            type="number"
            label="Jumlah yang Selesai"
            prefix="Qty:"
          />

          <q-input
            outlined
            v-model="form.keterangan"
            label="Catatan Produksi / QC"
            type="textarea"
            rows="3"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Batal" color="grey-7" v-close-popup />
          <q-btn color="teal-10" label="Simpan & Update" @click="simpanData" icon="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs,
  query,
  where,
  updateDoc,
} from 'firebase/firestore'

const $q = useQuasar()

// STATE
const dialog = ref(false)
const rows = ref([])
const woOptions = ref([])
const form = ref({
  work_order_id: '',
  jumlah_hasil: 0,
  keterangan: '',
  productName: '',
})

const columns = [
  { name: 'wo', label: 'Work Order / Product', field: 'wo', align: 'left' },
  { name: 'jumlah_hasil', label: 'Hasil Produksi', field: 'jumlah_hasil', align: 'center' },
  { name: 'keterangan', label: 'Keterangan', field: 'keterangan', align: 'left' },
  { name: 'actions', label: 'Aksi', field: 'actions', align: 'center' },
]

const syncProductInfo = (val) => {
  const selected = woOptions.value.find((w) => w.id === val)
  if (selected) form.value.productName = selected.productName
}

const getWO = async () => {
  const snapshot = await getDocs(collection(db, 'work_orders'))
  woOptions.value = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    kode: docSnap.data().kode,
    productName: docSnap.data().productName || docSnap.data().produk,
  }))
}

const getData = () => {
  onSnapshot(collection(db, 'production_results'), (snapshot) => {
    rows.value = snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      const wo = woOptions.value.find((w) => w.id === data.work_order_id)
      return {
        id: docSnap.id,
        ...data,
        wo: wo ? wo.kode : 'Unknown WO',
        productName: wo ? wo.productName : '-',
      }
    })
  })
}

const openDialog = () => {
  form.value = { work_order_id: '', jumlah_hasil: 0, keterangan: '', productName: '' }
  dialog.value = true
}

const simpanData = async () => {
  if (!form.value.work_order_id || form.value.jumlah_hasil <= 0) {
    $q.notify({ type: 'negative', message: 'Lengkapi data!' })
    return
  }

  $q.loading.show()
  try {
    const q = query(
      collection(db, 'production_results'),
      where('work_order_id', '==', form.value.work_order_id),
    )
    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
      await updateDoc(doc(db, 'production_results', snapshot.docs[0].id), {
        jumlah_hasil: form.value.jumlah_hasil,
        keterangan: form.value.keterangan,
        updated_at: new Date(),
      })
    } else {
      await addDoc(collection(db, 'production_results'), {
        ...form.value,
        created_at: new Date(),
      })
    }
    dialog.value = false
    $q.notify({ type: 'positive', message: 'Data Tersimpan' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error Simpan Data' })
  } finally {
    $q.loading.hide()
  }
}

const confirmDelete = (id) => {
  $q.dialog({
    title: 'Hapus?',
    message: 'Data produksi akan dihapus.',
    cancel: true,
  }).onOk(async () => {
    await deleteDoc(doc(db, 'production_results', id))
  })
}

onMounted(async () => {
  await getWO()
  getData()
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
.shadow-sm {
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.06);
}
</style>
