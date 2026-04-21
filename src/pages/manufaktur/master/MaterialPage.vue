<template>
  <q-page padding>
    <div class="text-h5 q-mb-md">Detail Work Order</div>

    <q-card class="q-pa-md q-mb-md">
      <div><b>Kode:</b> {{ wo.kode }}</div>
      <div><b>Produk:</b> {{ wo.produk }}</div>
      <div><b>Jumlah:</b> {{ wo.jumlah }}</div>
      <div><b>Status:</b> {{ wo.status }}</div>
    </q-card>

    <q-btn color="green" label="PRODUKSI SEKARANG" @click="prosesProduksi" />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { db } from 'boot/firebase'
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore'

const route = useRoute()
const wo = ref({})

onMounted(async () => {
  const snap = await getDoc(doc(db, 'work_orders', route.params.id))
  wo.value = snap.data()
})

const prosesProduksi = async () => {
  // 🔥 1. Ambil BOM sesuai produk
  const bomSnap = await getDocs(collection(db, 'boms'))

  const bomList = bomSnap.docs.map((d) => d.data()).filter((b) => b.produk === wo.value.produk)

  if (bomList.length === 0) {
    alert('BOM tidak ditemukan!')
    return
  }

  // 🔥 2. Loop semua material di BOM
  for (let bom of bomList) {
    const totalKebutuhan = bom.qty * wo.value.jumlah

    // 🔥 3. Ambil material dari Firestore
    const materialSnap = await getDocs(collection(db, 'materials'))
    const material = materialSnap.docs.find((m) => m.data().nama === bom.material)

    if (!material) {
      alert(`Material ${bom.material} tidak ada!`)
      return
    }

    const dataMaterial = material.data()

    // 🔥 4. CEK STOK
    if (dataMaterial.stok < totalKebutuhan) {
      alert(`Stok ${bom.material} tidak cukup!`)
      return
    }

    // 🔥 5. POTONG STOK
    await updateDoc(doc(db, 'materials', material.id), {
      stok: dataMaterial.stok - totalKebutuhan,
    })
  }

  // 🔥 6. UPDATE STATUS WO
  await updateDoc(doc(db, 'work_orders', route.params.id), {
    status: 'Done',
    progress: 100,
  })

  alert('Produksi berhasil!')
}
</script>
