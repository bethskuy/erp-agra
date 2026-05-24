<template>
  <div class="splash-screen">
    <img src="/icons/logo-agra.png" class="logo" />
    <h1>AGRA ERP</h1>
    <p>Integrated Engineering System</p>
  </div>
</template>

<style scoped>
.splash-screen {
  position: fixed;
  inset: 0;
  overflow: hidden;

  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.25), transparent 35%),
    radial-gradient(circle at bottom right, rgba(29, 78, 216, 0.3), transparent 35%),
    linear-gradient(135deg, #050816 0%, #071120 40%, #0b1d35 100%);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  z-index: 99999;
}

/* Glow Blur Background */
.splash-screen::before {
  content: '';
  position: absolute;

  width: 450px;
  height: 450px;

  background: rgba(37, 99, 235, 0.18);

  border-radius: 999px;

  top: -120px;
  left: -120px;

  filter: blur(100px);
}

.splash-screen::after {
  content: '';
  position: absolute;

  width: 350px;
  height: 350px;

  background: rgba(59, 130, 246, 0.15);

  border-radius: 999px;

  bottom: -100px;
  right: -100px;

  filter: blur(100px);
}

/* LOGO */
.logo {
  width: 130px;
  margin-bottom: 24px;

  z-index: 2;

  animation: floatLogo 2.5s ease-in-out infinite;
}

/* TITLE */
h1 {
  color: white;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: 1px;

  margin: 0;

  z-index: 2;
}

/* SUBTITLE */
p {
  color: #94a3b8;
  margin-top: 10px;
  font-size: 14px;
  letter-spacing: 0.5px;

  z-index: 2;
}

/* ANIMATION */
@keyframes floatLogo {
  0% {
    transform: translateY(0px) scale(1);
    opacity: 0.85;
  }

  50% {
    transform: translateY(-12px) scale(1.04);
    opacity: 1;
  }

  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.85;
  }
}

.logo {
  width: 130px;
  margin-bottom: 20px;

  animation: floatLogo 2s ease-in-out infinite;
}

h1 {
  color: white;
  font-size: 32px;
  font-weight: 800;
  margin: 0;
}

p {
  color: #9ca3af;
  margin-top: 10px;
  font-size: 14px;
}

@keyframes floatLogo {
  0% {
    transform: translateY(0px) scale(1);
    opacity: 0.8;
  }

  50% {
    transform: translateY(-10px) scale(1.03);
    opacity: 1;
  }

  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.8;
  }
}
</style>
