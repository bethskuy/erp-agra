import {
  collection,
  doc,
  getDocs,
  increment,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { auth, db } from 'src/boot/firebase'

export const FG_TRANSFER_STATUS = {
  TRANSIT: 'TRANSIT',
  WAITING_GUDANG: 'WAITING_GUDANG',
  VERIFYING: 'VERIFYING',
  PARTIAL_RECEIVED: 'PARTIAL_RECEIVED',
  RECEIVED: 'RECEIVED',
  HOLD: 'HOLD',
  CANCELLED: 'CANCELLED',
}

export const FG_TRANSFERS_COLLECTION = 'fg_transfers'
export const FG_TRANSFER_BOXES_COLLECTION = 'fg_transfer_boxes'
export const FG_RECEIVING_LOGS_COLLECTION = 'fg_receiving_logs'
export const FG_INBOUND_LOGS_COLLECTION = 'fg_inbound_logs'
export const FG_STOCK_MOVEMENTS_COLLECTION = 'fg_stock_movements'
export const FINISHED_GOODS_STOCK_COLLECTION = 'finished_goods_stock'
export const MASTER_FINISHED_GOODS_COLLECTION = 'master_finished_goods'

const toNumber = (value) => Number(value || 0)

const fgTransferStatus = (transfer = {}) =>
  transfer.transfer_status || transfer.status || FG_TRANSFER_STATUS.TRANSIT

export const parseFgQrPayload = (rawValue) => {
  const value = String(rawValue || '').trim()
  if (!value) throw new Error('QR box kosong.')

  try {
    const parsed = JSON.parse(value)
    return {
      transfer_id: parsed.transfer_id || parsed.transferId || parsed.packing_id || '',
      box_id: parsed.box_id || parsed.boxId || '',
      packing_id: parsed.packing_id || '',
      nomor_spk: parsed.nomor_spk || parsed.spk || '',
      product: parsed.product || parsed.produk || parsed.nama_produk || '',
      qty: toNumber(parsed.qty ?? parsed.qty_box ?? parsed.qty_isi),
      nomor_box: toNumber(parsed.nomor_box),
      raw: value,
    }
  } catch {
    const parts = value.split('-')
    const boxPart = parts.find((part) => /^B\d+$/i.test(part))
    const qtyPart = parts.find((part) => /^Q\d+$/i.test(part))

    return {
      transfer_id: parts[1] || '',
      packing_id: parts[1] || '',
      box_id: '',
      nomor_spk: parts[2] || '',
      product: '',
      qty: qtyPart ? toNumber(qtyPart.replace(/^Q/i, '')) : 0,
      nomor_box: boxPart ? toNumber(boxPart.replace(/^B/i, '')) : 0,
      raw: value,
    }
  }
}

export const scanFgTransferBox = async ({ transferId, qrValue, receiverName, receiverUserId = '' }) => {
  const payload = parseFgQrPayload(qrValue)
  const transferRef = doc(db, FG_TRANSFERS_COLLECTION, transferId)

  await runTransaction(db, async (transaction) => {
    const transferSnap = await transaction.get(transferRef)
    if (!transferSnap.exists()) throw new Error('Transfer FG tidak ditemukan.')

    const transfer = transferSnap.data()
    if ([FG_TRANSFER_STATUS.RECEIVED, FG_TRANSFER_STATUS.CANCELLED].includes(fgTransferStatus(transfer))) {
      throw new Error('Transfer sudah final dan tidak bisa discan ulang.')
    }

    const expectedTransferId = payload.transfer_id || payload.packing_id
    if (expectedTransferId && expectedTransferId !== transferId) {
      throw new Error('QR box bukan milik transfer ini.')
    }

    const boxId =
      payload.box_id ||
      `${transferId}_${payload.nomor_box || ''}` ||
      `${transferId}_${payload.raw}`
    const boxRef = doc(db, FG_TRANSFER_BOXES_COLLECTION, boxId)
    const boxSnap = await transaction.get(boxRef)

    if (!boxSnap.exists()) throw new Error('Box tidak terdaftar pada transfer ini.')
    const box = boxSnap.data()

    if (box.transfer_id !== transferId) throw new Error('Box bukan milik transfer ini.')
    if (box.scanned_at || box.status === 'SCANNED') throw new Error('Box sudah pernah discan.')
    if (payload.nomor_spk && payload.nomor_spk !== transfer.spk_no) {
      throw new Error('Nomor SPK pada QR tidak cocok dengan transfer.')
    }

    const expectedQty = toNumber(box.qty_isi ?? box.qty_sent ?? box.qty)
    if (payload.qty && expectedQty && payload.qty !== expectedQty) {
      throw new Error('Qty box pada QR tidak cocok dengan data transfer.')
    }

    const nextQtyReceived = toNumber(transfer.qty_received) + expectedQty

    transaction.update(boxRef, {
      status: 'SCANNED',
      scanned_at: serverTimestamp(),
      scanned_by: receiverName || '',
      scanned_by_user_id: receiverUserId || auth.currentUser?.uid || '',
      qr_verified: true,
      qr_raw: payload.raw,
      updated_at: serverTimestamp(),
    })

    transaction.update(transferRef, {
      status: FG_TRANSFER_STATUS.VERIFYING,
      transfer_status: FG_TRANSFER_STATUS.VERIFYING,
      qty_received: nextQtyReceived,
      qr_verified_count: increment(1),
      receiver_gudang: receiverName || transfer.receiver_gudang || transfer.receiver_name || '',
      receiver_name: receiverName || transfer.receiver_name || '',
      receiver_user_id: receiverUserId || transfer.receiver_user_id || auth.currentUser?.uid || '',
      updated_at: serverTimestamp(),
      verifying_at: transfer.verifying_at || serverTimestamp(),
    })

    transaction.set(doc(collection(db, FG_RECEIVING_LOGS_COLLECTION)), {
      transfer_id: transferId,
      box_id: boxId,
      action: 'SCAN_BOX',
      qty: expectedQty,
      receiver_name: receiverName || '',
      receiver_user_id: receiverUserId || auth.currentUser?.uid || '',
      qr_verified: true,
      created_at: serverTimestamp(),
    })
  })
}

export const completeFgReceiving = async ({
  transferId,
  receiverName,
  receiverUserId = '',
  note = '',
  allowPartial = false,
  rackLocation = '',
}) => {
  const transferRef = doc(db, FG_TRANSFERS_COLLECTION, transferId)
  const boxesQuery = query(
    collection(db, FG_TRANSFER_BOXES_COLLECTION),
    where('transfer_id', '==', transferId),
  )
  const boxSnaps = await getDocs(boxesQuery)

  await runTransaction(db, async (transaction) => {
    const transferSnap = await transaction.get(transferRef)
    if (!transferSnap.exists()) throw new Error('Transfer FG tidak ditemukan.')

    const transfer = transferSnap.data()
    if ([FG_TRANSFER_STATUS.RECEIVED, FG_TRANSFER_STATUS.CANCELLED].includes(fgTransferStatus(transfer))) {
      throw new Error('Transfer sudah final.')
    }

    const boxes = boxSnaps.docs.map((boxDoc) => ({ id: boxDoc.id, ...boxDoc.data() }))
    const scannedBoxes = boxes.filter((box) => box.status === 'SCANNED' || box.scanned_at)
    const qtyReceived = scannedBoxes.reduce(
      (total, box) => total + toNumber(box.qty_isi ?? box.qty_sent ?? box.qty),
      0,
    )
    const qtySent = toNumber(transfer.qty_sent || transfer.qty_packing)
    const alreadyPostedQty = toNumber(transfer.received_stock_qty)
    const stockDelta = Math.max(0, qtyReceived - alreadyPostedQty)
    const allBoxesScanned = boxes.length > 0 && scannedBoxes.length === boxes.length

    if (!allowPartial && !allBoxesScanned) {
      throw new Error('Semua box harus discan sebelum penerimaan diselesaikan.')
    }
    if (qtyReceived <= 0) throw new Error('Belum ada box yang discan.')
    if (allowPartial && stockDelta <= 0) {
      throw new Error('Tidak ada qty baru untuk diposting ke stok FG.')
    }

    const finalStatus =
      qtyReceived >= qtySent && allBoxesScanned
        ? FG_TRANSFER_STATUS.RECEIVED
        : FG_TRANSFER_STATUS.PARTIAL_RECEIVED

    const fgId = transfer.product_id || transfer.product_code || transfer.product_name || transferId
    const stockRef = doc(db, FINISHED_GOODS_STOCK_COLLECTION, fgId)
    const fgRef = doc(db, MASTER_FINISHED_GOODS_COLLECTION, fgId)
    const stockSnap = await transaction.get(stockRef)
    const stockBefore = stockSnap.exists()
      ? toNumber(stockSnap.data().stock_fg ?? stockSnap.data().stok_tersedia ?? stockSnap.data().stok)
      : 0
    const stockAfter = stockBefore + stockDelta
    const resolvedReceiverUserId = receiverUserId || auth.currentUser?.uid || transfer.receiver_user_id || ''
    const resolvedRackLocation = rackLocation || transfer.rack_location || ''

    transaction.set(
      stockRef,
      {
        product_id: transfer.product_id || fgId,
        product_code: transfer.product_code || fgId,
        product_name: transfer.product_name || '',
        nama: transfer.product_name || '',
        nama_barang: transfer.product_name || '',
        kode: transfer.product_code || fgId,
        kode_barang: transfer.product_code || fgId,
        customer_name: transfer.customer_name || '',
        spk_no: transfer.spk_no || '',
        po_no: transfer.po_no || '',
        kategori: 'finished_goods',
        jenis_material: 'finished_goods',
        tipe_material: 'finished_goods',
        satuan: transfer.satuan || 'PCS',
        stock_fg: increment(stockDelta),
        stok_tersedia: increment(stockDelta),
        stok: increment(stockDelta),
        rack_location: resolvedRackLocation,
        last_received_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        ...(stockSnap.exists() ? {} : { created_at: serverTimestamp() }),
      },
      { merge: true },
    )

    transaction.set(
      fgRef,
      {
        product_id: transfer.product_id || fgId,
        product_code: transfer.product_code || fgId,
        product_name: transfer.product_name || '',
        nama: transfer.product_name || '',
        nama_barang: transfer.product_name || '',
        kode: transfer.product_code || fgId,
        kode_barang: transfer.product_code || fgId,
        customer_name: transfer.customer_name || '',
        kategori: 'finished_goods',
        jenis_material: 'finished_goods',
        tipe_material: 'finished_goods',
        satuan: transfer.satuan || 'PCS',
        stock_fg: increment(stockDelta),
        stok_tersedia: increment(stockDelta),
        stok: increment(stockDelta),
        rack_location: resolvedRackLocation,
        last_received_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      },
      { merge: true },
    )

    transaction.update(transferRef, {
      status: finalStatus,
      transfer_status: finalStatus,
      qty_received: qtyReceived,
      received_stock_qty: qtyReceived,
      receiver_gudang: receiverName || transfer.receiver_gudang || transfer.receiver_name || '',
      receiver_name: receiverName || transfer.receiver_name || '',
      receiver_user_id: resolvedReceiverUserId,
      receiving_note: note,
      rack_location: resolvedRackLocation,
      qr_verified: allBoxesScanned,
      received_at: finalStatus === FG_TRANSFER_STATUS.RECEIVED ? serverTimestamp() : null,
      received_date: finalStatus === FG_TRANSFER_STATUS.RECEIVED ? serverTimestamp() : null,
      partial_received_at:
        finalStatus === FG_TRANSFER_STATUS.PARTIAL_RECEIVED ? serverTimestamp() : null,
      updated_at: serverTimestamp(),
    })

    transaction.set(doc(collection(db, FG_RECEIVING_LOGS_COLLECTION)), {
      transfer_id: transferId,
      action: finalStatus === FG_TRANSFER_STATUS.RECEIVED ? 'COMPLETE_RECEIVING' : 'PARTIAL_RECEIVING',
      qty: stockDelta,
      qty_received: qtyReceived,
      receiver_name: receiverName || '',
      receiver_user_id: resolvedReceiverUserId,
      note,
      rack_location: resolvedRackLocation,
      qr_verified: allBoxesScanned,
      created_at: serverTimestamp(),
    })

    if (stockDelta > 0) {
      const inboundLogRef = doc(collection(db, FG_INBOUND_LOGS_COLLECTION))
      const movementRef = doc(collection(db, FG_STOCK_MOVEMENTS_COLLECTION))

      transaction.set(inboundLogRef, {
        id: inboundLogRef.id,
        transfer_id: transferId,
        transfer_no: transfer.transfer_no || transferId,
        packing_no: transfer.packing_no || transfer.packing_id || '',
        spk_no: transfer.spk_no || '',
        po_no: transfer.po_no || '',
        customer_name: transfer.customer_name || '',
        product_id: transfer.product_id || fgId,
        product_name: transfer.product_name || '',
        qty_received: stockDelta,
        total_box: toNumber(transfer.total_box || transfer.jumlah_koli),
        verified_box: scannedBoxes.length,
        receiver_user_id: resolvedReceiverUserId,
        receiver_name: receiverName || transfer.receiver_name || '',
        receive_notes: note,
        received_at: serverTimestamp(),
        rack_location: resolvedRackLocation,
        qr_verified: allBoxesScanned,
        created_at: serverTimestamp(),
      })

      transaction.set(movementRef, {
        id: movementRef.id,
        tanggal: serverTimestamp(),
        timestamp: serverTimestamp(),
        type: finalStatus === FG_TRANSFER_STATUS.RECEIVED ? 'INBOUND_PACKING' : 'INBOUND_PARTIAL',
        tipe_movement: finalStatus === FG_TRANSFER_STATUS.RECEIVED ? 'INBOUND_PACKING' : 'INBOUND_PARTIAL',
        referensi: transfer.transfer_no || transferId,
        reference_no: transfer.transfer_no || transferId,
        transfer_id: transferId,
        product_id: transfer.product_id || fgId,
        product_name: transfer.product_name || '',
        qty_in: stockDelta,
        qty_out: 0,
        saldo_akhir: stockAfter,
        user: receiverName || transfer.receiver_name || '',
        user_id: resolvedReceiverUserId,
        rack_location: resolvedRackLocation,
        created_at: serverTimestamp(),
      })
    }
  })
}

export const updateFinishedGoodsRackLocation = async ({ stockId, rackLocation, userName = '', userId = '' }) => {
  if (!stockId) throw new Error('Data finished goods tidak valid.')
  const payload = {
    rack_location: rackLocation || '',
    rack_updated_by: userName || '',
    rack_updated_by_user_id: userId || auth.currentUser?.uid || '',
    rack_updated_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }
  const stockRef = doc(db, FINISHED_GOODS_STOCK_COLLECTION, stockId)
  await updateDoc(stockRef, payload)
  await setDoc(doc(db, MASTER_FINISHED_GOODS_COLLECTION, stockId), payload, { merge: true })
}
