<template>
  <div
    class="fullscreen bg-premium-mesh text-center q-pa-md flex flex-center overflow-hidden relative-position font-pro"
  >
    <!-- Dekorasi Latar Belakang (Blob) -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>

    <div class="z-top animate-fade-up">
      <!-- Ikon/Ilustrasi Kecil -->
      <div class="q-mb-lg">
        <q-icon name="explore_off" size="120px" class="text-indigo-2 opacity-40" />
      </div>

      <!-- Angka 404 dengan Gradasi -->
      <div class="error-code text-weight-bolder text-gradient-indigo">404</div>

      <!-- Pesan Utama -->
      <div class="text-h3 text-weight-bold text-blue-grey-10 q-mt-sm leading-tight">
        Halaman Tidak Ditemukan
      </div>

      <!-- Deskripsi -->
      <div class="text-subtitle1 text-grey-7 q-mt-md q-mx-auto" style="max-width: 500px">
        Oops! Sepertinya Anda tersesat di luar koordinat sistem AGRA ERP. Halaman yang Anda cari
        mungkin telah dipindahkan atau dihapus.
      </div>

      <!-- Tombol Navigasi -->
      <div class="row justify-center q-mt-xl q-gutter-md">
        <q-btn
          color="indigo-10"
          unelevated
          rounded
          to="/"
          label="Kembali ke Beranda"
          icon="home"
          no-caps
          padding="12px 35px"
          class="shadow-premium btn-hover text-weight-bold"
        />
      </div>
    </div>

    <!-- Footer Copyright -->
    <div
      class="absolute-bottom text-center q-pb-lg text-grey-5 text-caption tracking-widest uppercase"
    >
      Agra Abhinaya Perkasa
    </div>
  </div>
</template>

<script setup>
// Tidak memerlukan logika rumit, fokus pada UI/UX
</script>

<style scoped>
.font-pro {
  font-family:
    'Inter',
    -apple-system,
    Helvetica,
    Arial,
    sans-serif;
}

/* Background Premium Mesh */
.bg-premium-mesh {
  background-color: #f8fafd;
  background-image:
    radial-gradient(at 0% 0%, hsla(210, 100%, 98%, 1) 0, transparent 50%),
    radial-gradient(at 100% 0%, hsla(215, 100%, 98%, 1) 0, transparent 50%);
}

/* Dekorasi Blob */
.blob {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(26, 35, 126, 0.05) 0%, transparent 70%);
  filter: blur(80px);
  z-index: 0;
}
.blob-1 {
  top: -200px;
  left: -200px;
}
.blob-2 {
  bottom: -200px;
  right: -200px;
}

/* Error Code Styling */
.error-code {
  font-size: 25vh;
  line-height: 0.8;
  letter-spacing: -5px;
}

.text-gradient-indigo {
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Effects & Utility */
.opacity-40 {
  opacity: 0.4;
}
.leading-tight {
  line-height: 1.1;
}
.tracking-widest {
  letter-spacing: 0.3em;
}

.shadow-premium {
  box-shadow: 0 10px 30px rgba(26, 35, 126, 0.2);
}

.btn-hover:hover {
  transform: translateY(-3px);
  filter: brightness(1.1);
  transition: all 0.3s ease;
}

/* Animasi */
.animate-fade-up {
  animation: fadeUp 1s ease-out;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsivitas Mobile */
@media (max-width: 600px) {
  .error-code {
    font-size: 18vh;
  }
  .text-h3 {
    font-size: 1.8rem;
  }
  .text-subtitle1 {
    font-size: 0.9rem;
  }
}
</style>
