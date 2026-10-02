/* ============================================================
   THIỆP CƯỚI ONLINE — HỒ ĐẠT & THẢO NGỌC
   ------------------------------------------------------------
   ★ CHỈNH SỬA THÔNG TIN TẠI ĐÂY (CONFIG) ★
   ============================================================ */
const CONFIG = {
  // Ngày giờ tổ chức Lễ Thành Hôn chính thức (đồng hồ đếm ngược chạy theo mốc này)
  weddingDateISO: "2026-10-25T09:00:00+07:00",

  // Link Google Maps của 2 địa điểm chính xác từ thiệp cưới
  mapGroom: "https://www.google.com/maps/place/19%C2%B031'34.4%22N+105%C2%B047'40.5%22E/@19.526233,105.7939283,19z/data=!3m1!4b1!4m4!3m3!8m2!3d19.526233!4d105.794572?entry=ttu&g_ep=EgoyMDI2MDkyOS4wIKXMDSoASAFQAw%3D%3D",   // Nhà Đa Năng P. Tân Dân, Thanh Hóa
  mapBride: "https://www.google.com/maps/search/?api=1&query=S%E1%BB%91+01+%C4%90%C6%B0%E1%BB%9Dng+Ho%C3%A0ng+X%C3%A1+Qu%E1%BB%91c+Oai+H%C3%A0+N%E1%BB%99i",   // Gia Hưng, Quốc Oai, Hà Nội

  // Tài khoản ngân hàng nhận mừng cưới.
  // bankCode dùng mã VietQR: MB, VCB, TCB, ACB, VPB, BIDV, CTG, STB...
  // QR sẽ tự tạo từ bankCode + accNo + holder.
  bankGroom: { bankCode: "MB", accNo: "0123456789", holder: "HO VAN DAT" },
  bankBride: { bankCode: "MB", accNo: "0987654321", holder: "THAO NGOC" },

  // Nhạc nền
  musicFile: "Váy Cưới.mp3",

  // URL Web App triển khai từ Google Apps Script để lưu Lời Chúc & RSVP tự động vào Google Sheets
  // Dán link lấy từ Google Sheets (dạng https://script.google.com/macros/s/.../exec) vào đây:
  sheetScriptUrl: "https://script.google.com/macros/s/AKfycbz395ZVK0-3JzAGNmMjVFF7fF-pjcTR2z0MoDrTiaR-jpLXvi3baGEmW2AQHcDQhBFSvQ/exec",
};

/* Danh sách toàn bộ ảnh trong album */
const PHOTOS = [
  "1 (1).webp", "1 (2).webp", "1 (3).webp", "1 (4).webp", "1 (5).webp",
  "1 (6).webp", "1 (7).webp", "1 (8).webp", "1 (9).webp", "1 (10).webp",
  "1 (11).webp", "1 (12).webp", "1 (13).webp", "1 (14).webp", "1 (15).webp",
  "1 (16).webp", "1 (17).webp", "1 (18).webp", "1 (19).webp", "1 (20).webp",
  "1 (21).webp", "1 (22).webp", "1 (23).webp", "1 (24).webp", "1 (25).webp",
  "1 (26).webp", "1 (27).webp", "1 (28).webp", "1 (29).webp", "1 (30).webp",
  "1 (31).webp",
];

/* ============================================================
   TÊN KHÁCH MỜI — đọc từ ?guest= / ?to= / ?ten= / ?k= / ?u= trên URL
   Ví dụ: index.html?guest=Anh+Tuấn hoặc index.html?to=Bạn+Lan
   ============================================================ */
function getGuestName() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("guest") || params.get("to") || params.get("ten") || params.get("k") || params.get("u");
  if (raw && raw.trim()) {
    try {
      const decoded = decodeURIComponent(raw.replace(/\+/g, " ")).trim();
      return decoded || "Quý Khách";
    } catch {
      return raw.replace(/\+/g, " ").trim() || "Quý Khách";
    }
  }
  return "Quý Khách";
}

/* ============================================================
   PRELOADER → PHONG BÌ → NỘI DUNG
   ============================================================ */
const preloader = document.getElementById("preloader");
const envelopeScreen = document.getElementById("envelope-screen");
const mainContent = document.getElementById("main-content");
const musicBtn = document.getElementById("music-btn");
const bgMusic = document.getElementById("bg-music");

bgMusic.src = encodeURI(CONFIG.musicFile);
bgMusic.volume = 0.55;

document.body.style.overflow = "hidden"; // khóa cuộn khi chưa mở thiệp

let envelopeShown = false;
let threeEnvelope = null;

function revealInvitationContent() {
  window.hideLetterModal();
  envelopeScreen.classList.add("opened");
  mainContent.classList.remove("hidden");
  musicBtn.classList.remove("hidden");
  document.body.style.overflow = "";
  initReveal();
  initLazyBackgrounds();
  start3DPetals();
  init3DGalleryCarousel();
  window.scrollTo(0, 0);
}

/* ============================================================
   BẢN THIỆP MỜI TRANG TRỌNG (FULL DIGITAL LETTER MODAL)
   ============================================================ */
window.showLetterModal = function () {
  const modal = document.getElementById("letter-modal");
  const guest = getGuestName();
  const guestEl = document.getElementById("rl-guest-name");
  if (guestEl) guestEl.textContent = guest;
  if (modal) {
    modal.classList.remove("hidden");
    void modal.offsetWidth; // trigger reflow for smooth transition
    modal.classList.add("show");
  }
  const viewBtn = document.getElementById("view-card-btn");
  if (viewBtn) viewBtn.classList.remove("hidden");
};

window.hideLetterModal = function () {
  const modal = document.getElementById("letter-modal");
  if (modal) {
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 400);
  }
};

// Gán sự kiện cho các nút điều khiển của thiệp
const letterCloseBtn = document.getElementById("letter-close-btn");
if (letterCloseBtn) letterCloseBtn.addEventListener("click", window.hideLetterModal);

const letterBackdrop = document.getElementById("letter-backdrop");
if (letterBackdrop) letterBackdrop.addEventListener("click", window.hideLetterModal);

const rlProceedBtn = document.getElementById("rl-proceed-btn");
if (rlProceedBtn) rlProceedBtn.addEventListener("click", revealInvitationContent);

const viewCardBtn = document.getElementById("view-card-btn");
if (viewCardBtn) viewCardBtn.addEventListener("click", window.showLetterModal);

function showEnvelope() {
  if (envelopeShown) return;
  envelopeShown = true;
  const guest = getGuestName();
  document.getElementById("env-guest-name").textContent = guest;
  const inviteGuest = document.getElementById("invite-guest-name");
  if (inviteGuest) inviteGuest.textContent = guest;
  const rlGuest = document.getElementById("rl-guest-name");
  if (rlGuest) rlGuest.textContent = guest;

  preloader.classList.add("fade");
  envelopeScreen.classList.remove("hidden");

  // Khởi tạo phong bì Three.js 3D
  if (window.ThreeWedding && window.ThreeWedding.isSupported()) {
    const box = document.getElementById("envelope-3d-box");
    threeEnvelope = window.ThreeWedding.init3DEnvelope({
      container: box,
      guestName: guest,
      onOpen: revealInvitationContent,
    });
    if (threeEnvelope) {
      envelopeScreen.classList.add("three-active");
    }
  }
}
window.addEventListener("load", () => setTimeout(showEnvelope, 1100));
// Dự phòng: nếu tải lâu quá 4.5s vẫn hiện phong bì
setTimeout(showEnvelope, 4500);

document.getElementById("open-invite").addEventListener("click", () => {
  // Phát nhạc ngay khi khách bấm mở thiệp
  bgMusic.play().then(() => musicBtn.classList.add("playing")).catch(() => { });

  if (threeEnvelope) {
    threeEnvelope.triggerOpen();
  } else {
    // Fallback phong bì CSS
    const envelope = document.querySelector(".envelope");
    if (envelope) envelope.classList.add("open");
    setTimeout(() => {
      window.showLetterModal();
    }, 700);
  }
});

// Cho phép chạm vào canvas 3D cũng kích hoạt phát nhạc
document.getElementById("envelope-3d-box").addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play().then(() => musicBtn.classList.add("playing")).catch(() => { });
  }
});

/* ============================================================
   NÚT NHẠC BẬT / TẮT
   ============================================================ */
musicBtn.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play().then(() => musicBtn.classList.add("playing")).catch(() => { });
  } else {
    bgMusic.pause();
    musicBtn.classList.remove("playing");
  }
});

/* ============================================================
   ĐẾM NGƯỢC
   ============================================================ */
const targetDate = new Date(CONFIG.weddingDateISO).getTime();

function pad(n) { return String(n).padStart(2, "0"); }

function tickCountdown() {
  const diff = targetDate - Date.now();
  const d = Math.max(0, Math.floor(diff / 86400000));
  const h = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  const m = Math.max(0, Math.floor((diff % 3600000) / 60000));
  const s = Math.max(0, Math.floor((diff % 60000) / 1000));
  document.getElementById("cd-days").textContent = pad(d);
  document.getElementById("cd-hours").textContent = pad(h);
  document.getElementById("cd-mins").textContent = pad(m);
  document.getElementById("cd-secs").textContent = pad(s);
}
tickCountdown();
setInterval(tickCountdown, 1000);

/* ============================================================
   HIỆU ỨNG HIỆN DẦN KHI CUỘN
   ============================================================ */
function initReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add("visible"), (i % 3) * 120);
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

/* ============================================================
   ALBUM ẢNH + LIGHTBOX
   ============================================================ */
const galleryGrid = document.getElementById("gallery-grid");
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lb-img");
let lbIndex = 0;

PHOTOS.forEach((src, idx) => {
  const item = document.createElement("div");
  item.className = "g-item";
  const img = document.createElement("img");
  img.src = src;
  img.alt = "Ảnh cưới " + (idx + 1);
  img.loading = "lazy";
  img.decoding = "async";
  item.appendChild(img);
  item.addEventListener("click", () => openLightbox(idx));
  galleryGrid.appendChild(item);
});

/* ============================================================
   LAZY LOAD HÌNH NỀN CSS ([data-bg]) CHO MOBILE SIÊU NHANH
   ============================================================ */
function initLazyBackgrounds() {
  const bgElements = document.querySelectorAll("[data-bg]");
  if ("IntersectionObserver" in window) {
    const bgObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            el.style.backgroundImage = `url('${el.dataset.bg}')`;
            obs.unobserve(el);
          }
        });
      },
      { rootMargin: "350px 0px" }
    );
    bgElements.forEach((el) => bgObserver.observe(el));
  } else {
    bgElements.forEach((el) => {
      el.style.backgroundImage = `url('${el.dataset.bg}')`;
    });
  }
}
initLazyBackgrounds();

function openLightbox(idx) {
  lbIndex = idx;
  lbImg.src = PHOTOS[lbIndex];
  lightbox.classList.add("show");
}
function closeLightbox() { lightbox.classList.remove("show"); }
function stepLightbox(step) {
  lbIndex = (lbIndex + step + PHOTOS.length) % PHOTOS.length;
  lbImg.src = PHOTOS[lbIndex];
}

lightbox.querySelector(".lb-close").addEventListener("click", closeLightbox);
lightbox.querySelector(".lb-prev").addEventListener("click", (e) => { e.stopPropagation(); stepLightbox(-1); });
lightbox.querySelector(".lb-next").addEventListener("click", (e) => { e.stopPropagation(); stepLightbox(1); });
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("show")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") stepLightbox(-1);
  if (e.key === "ArrowRight") stepLightbox(1);
});

/* ============================================================
   SỔ LƯU BÚT (lưu trên trình duyệt — localStorage)
   ============================================================ */
const WISH_KEY = "dn_wishes";
const DEFAULT_WISHES = [
  { name: "Gia Đình", msg: "Chúc hai con trăm năm hạnh phúc, đầu bạc răng long!" },
  { name: "Hội Bạn Thân", msg: "Chúc mừng hạnh phúc Đạt & Ngọc! Mãi bên nhau bạn nhé 💚" },
];

function loadWishes() {
  try { return JSON.parse(localStorage.getItem(WISH_KEY)) || []; }
  catch { return []; }
}

function renderWishes() {
  const list = document.getElementById("wish-list");
  const wishes = [...loadWishes(), ...DEFAULT_WISHES];
  list.innerHTML = "";
  wishes.forEach((w) => {
    const card = document.createElement("div");
    card.className = "wish-card";
    const strong = document.createElement("strong");
    strong.textContent = w.name;
    const p = document.createElement("p");
    p.textContent = w.msg;
    card.appendChild(strong);
    card.appendChild(p);
    list.appendChild(card);
  });
}
renderWishes();

// Hàm gửi dữ liệu bất đồng bộ đến Google Sheets qua Google Apps Script
async function sendToGoogleSheet(payload) {
  if (!CONFIG.sheetScriptUrl || !CONFIG.sheetScriptUrl.trim()) {
    console.log("Chưa cấu hình CONFIG.sheetScriptUrl — Dữ liệu đang được lưu tạm trên trình duyệt (localStorage).");
    return { status: "local_only" };
  }

  try {
    await fetch(CONFIG.sheetScriptUrl, {
      method: "POST",
      mode: "no-cors",
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { status: "success" };
  } catch (err) {
    console.warn("Không thể gửi dữ liệu đến Google Sheets:", err);
    return { status: "error", error: err };
  }
}

document.getElementById("wish-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nameEl = document.getElementById("wish-name");
  const msgEl = document.getElementById("wish-msg");
  const submitBtn = document.getElementById("wish-submit-btn");
  const thanksEl = document.getElementById("wish-thanks");

  const name = nameEl.value.trim() || "Khách mời";
  const msg = msgEl.value.trim();
  if (!msg) return;

  // Hiệu ứng đang gửi
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "⏳ Đang gửi lời chúc...";
  }

  // 1. Gửi lên Google Sheets (nếu đã cấu hình link)
  const payload = {
    action: "wish",
    name: name,
    msg: msg,
    time: new Date().toISOString(),
  };
  await sendToGoogleSheet(payload);

  // 2. Lưu dự phòng trên máy khách
  const wishes = loadWishes();
  wishes.unshift({ name, msg });
  localStorage.setItem(WISH_KEY, JSON.stringify(wishes.slice(0, 100)));

  // 3. Phản hồi giao diện
  msgEl.value = "";
  if (thanksEl) {
    thanksEl.classList.remove("hidden");
    setTimeout(() => thanksEl.classList.add("hidden"), 6000);
  }
  if (submitBtn) {
    submitBtn.textContent = "Đã Gửi Thành Công ✅";
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = "Gửi Lời Chúc 💌";
    }, 3000);
  }
  renderWishes();
});

/* ============================================================
   RSVP — XÁC NHẬN THAM DỰ
   ============================================================ */
document.getElementById("rsvp-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nameEl = document.getElementById("rsvp-name");
  const attendChoice = document.querySelector('input[name="attend"]:checked');
  const countEl = document.getElementById("rsvp-count");
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const thanksEl = document.getElementById("rsvp-thanks");

  const name = nameEl.value.trim() || "Khách mời";
  const attend = attendChoice ? attendChoice.value : "yes";
  const count = countEl ? countEl.value : "1";

  // Hiệu ứng đang ghi nhận
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "⏳ Đang ghi nhận...";
  }

  const payload = {
    action: "rsvp",
    name: name,
    attend: attend,
    count: count,
    time: new Date().toISOString(),
  };

  // 1. Gửi lên Google Sheets
  await sendToGoogleSheet(payload);

  // 2. Lưu dự phòng vào localStorage máy khách
  const all = JSON.parse(localStorage.getItem("dn_rsvp") || "[]");
  all.push(payload);
  localStorage.setItem("dn_rsvp", JSON.stringify(all));

  // 3. Phản hồi giao diện
  if (thanksEl) {
    thanksEl.classList.remove("hidden");
  }
  if (submitBtn) {
    submitBtn.textContent = "Đã Xác Nhận ✅";
  }
});

// Điền sẵn tên khách mởi vào các form
const guestName = getGuestName();
if (guestName !== "Quý Khách") {
  document.getElementById("invite-guest-name").textContent = guestName;
  document.getElementById("rsvp-name").value = guestName;
  document.getElementById("wish-name").value = guestName;
}

/* ============================================================
   HỘP MỪNG CƯỚI — QR VietQR + nút sao chép
   ============================================================ */
function setupGift(prefix, bank) {
  document.getElementById("bank-" + prefix).textContent = bank.bankCode + " Bank";
  document.getElementById("holder-" + prefix).textContent = bank.holder;
  document.getElementById("acc-" + prefix).textContent = bank.accNo;
  const qrImg = document.getElementById("qr-" + prefix);
  if (bank.bankCode && bank.accNo) {
    qrImg.src =
      "https://img.vietqr.io/image/" + bank.bankCode + "-" + bank.accNo +
      "-compact2.png?accountName=" + encodeURIComponent(bank.holder) +
      "&addInfo=" + encodeURIComponent("Mung cuoi Dat & Ngoc");
  } else {
    qrImg.style.display = "none";
  }
}
setupGift("groom", CONFIG.bankGroom);
setupGift("bride", CONFIG.bankBride);

document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const text = document.getElementById(btn.dataset.copy).textContent.trim();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const tmp = document.createElement("textarea");
      tmp.value = text;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      tmp.remove();
    }
    const old = btn.textContent;
    btn.textContent = "Đã chép ✓";
    setTimeout(() => (btn.textContent = old), 2000);
  });
});

/* Link bản đồ từ CONFIG */
document.querySelector('[data-map="groom"]').href = CONFIG.mapGroom;
document.querySelector('[data-map="bride"]').href = CONFIG.mapBride;

/* ============================================================
   MENU CHỈ HIỆN KHI CUỘN QUA ẢNH ĐẦU (HERO)
   ============================================================ */
const topNav = document.getElementById("top-nav");
function toggleNav() {
  const hero = document.getElementById("hero");
  const trigger = hero.offsetTop + hero.offsetHeight - 90;
  topNav.classList.toggle("show", window.scrollY > trigger);
}
window.addEventListener("scroll", toggleNav, { passive: true });
toggleNav();

/* ============================================================
   LỊCH "SAVE THE DATE" — tự dựng theo ngày cưới trong CONFIG
   ============================================================ */
function buildCalendar() {
  const d = new Date(CONFIG.weddingDateISO);
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  document.getElementById("cal-title").textContent = "Tháng " + (month + 1) + ", " + year;

  const grid = document.getElementById("cal-grid");
  ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].forEach((t) => {
    const el = document.createElement("div");
    el.className = "cal-dow";
    el.textContent = t;
    grid.appendChild(el);
  });

  // Tuần bắt đầu từ Thứ 2
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < lead; i++) grid.appendChild(document.createElement("div"));

  const specialDays = {
    20: { label: "Tiệc mừng Nhà Gái (Quốc Oai, Hà Nội)" },
    21: { label: "Lễ Vu Quy Nhà Gái (Quốc Oai, Hà Nội)", isMain: true },
    25: { label: "Lễ Thành Hôn Nhà Trai (Tân Dân, Thanh Hóa)", isMain: true },
  };

  for (let dd = 1; dd <= daysInMonth; dd++) {
    const cell = document.createElement("div");
    cell.className = "cal-day";
    const info = specialDays[dd];

    if (info) {
      cell.classList.add("marked");
      cell.title = info.label;
      cell.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
        '<path d="M12 21s-7.5-4.9-10-9.2C.3 8.4 2.3 4.5 6 4.1c2.1-.2 4 .9 6 3 2-2.1 3.9-3.2 6-3 3.7.4 5.7 4.3 4 7.7C19.5 16.1 12 21 12 21z"/></svg>';
    }
    const num = document.createElement("span");
    num.textContent = dd;
    cell.appendChild(num);
    grid.appendChild(cell);
  }
}
buildCalendar();

/* ============================================================
   CÁNH HOA RƠI 3D (THREE.JS) HOẶC FALLBACK 2D
   ============================================================ */
function start3DPetals() {
  const canvas = document.getElementById("petals-canvas");
  if (window.ThreeWedding && window.ThreeWedding.isSupported() && canvas) {
    const pEngine = window.ThreeWedding.init3DPetals(canvas);
    if (pEngine) {
      document.body.classList.add("three-petals-active");
      return;
    }
  }
  startPetals();
}

function startPetals() {
  const box = document.getElementById("petals");
  if (!box) return;
  const COUNT = 16;
  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement("div");
    p.className = "petal";
    const size = 9 + Math.random() * 9;
    p.style.width = size + "px";
    p.style.height = size * 0.9 + "px";
    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDuration = 8 + Math.random() * 7 + "s";
    p.style.animationDelay = Math.random() * 12 + "s";
    box.appendChild(p);
  }
}

/* ============================================================
   VÒNG QUAY ẢNH CƯỚI 3D VÔ CỰC (THREE.JS)
   ============================================================ */
let threeCarousel = null;
function init3DGalleryCarousel() {
  const container = document.getElementById("carousel-3d-container");
  if (!container || !window.ThreeWedding || !window.ThreeWedding.isSupported()) return;

  threeCarousel = window.ThreeWedding.init3DCarousel({
    container: container,
    photos: PHOTOS,
    onPhotoClick: (idx, src) => {
      openLightbox(idx);
    },
  });

  if (threeCarousel) {
    const prevBtn = document.getElementById("car-prev");
    const nextBtn = document.getElementById("car-next");
    if (prevBtn) prevBtn.addEventListener("click", () => threeCarousel.step(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => threeCarousel.step(1));
  }
}

