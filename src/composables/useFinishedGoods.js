import { computed, onUnmounted, ref } from 'vue'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import {
  FG_TRANSFER_BOXES_COLLECTION,
  FG_TRANSFERS_COLLECTION,
  FG_TRANSFER_STATUS,
} from 'src/services/finishedGoodsService'

const ACTIVE_TRANSFER_STATUSES = [
  FG_TRANSFER_STATUS.TRANSIT,
  FG_TRANSFER_STATUS.VERIFYING,
  FG_TRANSFER_STATUS.PARTIAL_RECEIVED,
]

const normalizeDateValue = (value) => {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate()
  if (value instanceof Date) return value
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function useFinishedGoodsReceiving() {
  const transfers = ref([])
  const selectedBoxes = ref([])
  const loading = ref(false)
  const loadingBoxes = ref(false)
  const error = ref(null)
  let unsubscribeTransfers = null
  let unsubscribeBoxes = null

  const subscribeTransfers = () => {
    loading.value = true
    if (unsubscribeTransfers) unsubscribeTransfers()

    unsubscribeTransfers = onSnapshot(
      query(collection(db, FG_TRANSFERS_COLLECTION), orderBy('created_at', 'desc')),
      (snapshot) => {
        transfers.value = snapshot.docs
          .map((docItem) => {
            const data = docItem.data()
            const status = data.transfer_status || data.status || FG_TRANSFER_STATUS.TRANSIT
            return {
              id: data.id || docItem.id,
              qty_received: 0,
              ...data,
              status,
              transfer_status: status,
            }
          })
          .filter((transfer) => ACTIVE_TRANSFER_STATUSES.includes(transfer.transfer_status))
        loading.value = false
        error.value = null
      },
      (snapshotError) => {
        console.error(snapshotError)
        error.value = snapshotError
        loading.value = false
      },
    )
  }

  const subscribeBoxes = (transferId) => {
    selectedBoxes.value = []
    if (unsubscribeBoxes) unsubscribeBoxes()
    if (!transferId) return

    loadingBoxes.value = true
    unsubscribeBoxes = onSnapshot(
      query(
        collection(db, FG_TRANSFER_BOXES_COLLECTION),
        where('transfer_id', '==', transferId),
        orderBy('nomor_box', 'asc'),
      ),
      (snapshot) => {
        selectedBoxes.value = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }))
        loadingBoxes.value = false
      },
      (snapshotError) => {
        console.error(snapshotError)
        error.value = snapshotError
        loadingBoxes.value = false
      },
    )
  }

  const unsubscribeAll = () => {
    if (unsubscribeTransfers) unsubscribeTransfers()
    if (unsubscribeBoxes) unsubscribeBoxes()
    unsubscribeTransfers = null
    unsubscribeBoxes = null
  }

  const todayReceivedCount = computed(() => {
    const now = new Date()
    return transfers.value.filter((transfer) => {
      if (transfer.status !== FG_TRANSFER_STATUS.RECEIVED) return false
      const receivedAt = normalizeDateValue(transfer.received_at)
      if (!receivedAt) return false
      return (
        receivedAt.getFullYear() === now.getFullYear() &&
        receivedAt.getMonth() === now.getMonth() &&
        receivedAt.getDate() === now.getDate()
      )
    }).length
  })

  const stats = computed(() => ({
    transit: transfers.value.filter((item) => item.status === FG_TRANSFER_STATUS.TRANSIT).length,
    waiting: transfers.value.filter((item) => item.status === FG_TRANSFER_STATUS.TRANSIT).length,
    verifying: transfers.value.filter((item) => item.status === FG_TRANSFER_STATUS.VERIFYING).length,
    partial: transfers.value.filter((item) => item.status === FG_TRANSFER_STATUS.PARTIAL_RECEIVED).length,
    receivedToday: todayReceivedCount.value,
  }))

  onUnmounted(unsubscribeAll)

  return {
    transfers,
    selectedBoxes,
    loading,
    loadingBoxes,
    error,
    stats,
    subscribeTransfers,
    subscribeBoxes,
    unsubscribeAll,
  }
}
