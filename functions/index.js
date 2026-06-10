const functions = require('firebase-functions/v1')
const admin = require('firebase-admin')

admin.initializeApp()

exports.deleteAuthUser = functions.firestore
  .document('karyawan/{karyawanId}')
  // eslint-disable-next-line no-unused-vars
  .onDelete(async (snap, context) => {
    const deletedKaryawan = snap.data()
    let uid = deletedKaryawan.uid
    const email = deletedKaryawan.email

    if (!uid && email) {
      try {
        console.log(`UID tidak ditemukan untuk karyawan yang dihapus. Mencari Auth User dengan email: ${email}`)
        const userRecord = await admin.auth().getUserByEmail(email)
        uid = userRecord.uid
      } catch (err) {
        console.error(`Gagal mencari Auth User untuk dihapus dengan email ${email}:`, err)
      }
    }

    if (uid) {
      try {
        await admin.auth().deleteUser(uid)
        console.log(`User dengan UID ${uid} (${email || ''}) berhasil dihapus dari Auth.`)
      } catch (error) {
        console.error('Error menghapus user dari Auth:', error)
      }
    } else {
      console.log('Tidak ada UID/User ditemukan pada dokumen karyawan ini.')
    }
  })

exports.updateAuthUser = functions.firestore
  .document('karyawan/{karyawanId}')
  .onUpdate(async (change) => {
    const newData = change.after.data()
    const previousData = change.before.data()
    const email = newData.email

    if (newData.tempPassword && newData.tempPassword !== previousData.tempPassword) {
      try {
        let uid = newData.uid

        if (!uid && email) {
          console.log(`UID tidak ditemukan pada dokumen karyawan. Mencari Auth User dengan email: ${email}`)
          try {
            const userRecord = await admin.auth().getUserByEmail(email)
            uid = userRecord.uid
            
            // Simpan UID ke dokumen Firestore agar tersinkronisasi untuk berikutnya
            await change.after.ref.update({ uid })
            console.log(`UID ${uid} berhasil disinkronkan ke dokumen Firestore.`)
          } catch (err) {
            console.error(`Gagal mencari Auth User dengan email ${email}:`, err)
          }
        }

        if (uid) {
          await admin.auth().updateUser(uid, {
            password: newData.tempPassword,
          })
          console.log(`User dengan UID ${uid} (${email || ''}) berhasil diupdate password-nya di Auth.`)
        } else {
          console.error(`Gagal mengupdate password karena UID tidak ditemukan untuk email ${email}`)
        }

        // Hapus tempPassword agar tidak tersimpan permanen di Firestore
        await change.after.ref.update({
          tempPassword: admin.firestore.FieldValue.delete(),
        })
      } catch (error) {
        console.error('Error mengupdate password user di Auth:', error)
      }
    }
  })

