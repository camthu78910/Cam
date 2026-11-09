// Lo xo dang cong thuc dong: cho t, tra ngay tien do 0 -> 1 (co do lo). Khong mo phong tung buoc.
// stiffness: do cung (cang lon cang nhanh). damping: do can (cang nho cang nhun lau).
function spring(t, { stiffness = 170, damping = 18, mass = 1 } = {}) {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + (zeta * w0 / wd) * Math.sin(wd * t));
  }
  return 1 - (1 + w0 * t) * Math.exp(-w0 * t);
}
const lerp = (a, b, k) => a + (b - a) * k;
// Nhanh, dut khoat: { stiffness: 300, damping: 26 }
// Mem, co nhun nhe: { stiffness: 170, damping: 18 } (mac dinh)
// Nay nhieu, vui:   { stiffness: 200, damping: 10 }
