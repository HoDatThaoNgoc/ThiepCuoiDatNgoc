/* ============================================================
   THIỆP CƯỚI ONLINE — HỒ ĐẠT & THẢO NGỌC
   ------------------------------------------------------------
   ★ CHỈNH SỬA THÔNG TIN TẠI ĐÂY (CONFIG) ★
   ============================================================ */
const CONFIG = {
  // Ngày giờ tổ chức (đồng hồ đếm ngược chạy theo mốc này)
  weddingDateISO: "2026-11-15T18:00:00+07:00",

  // Link Google Maps của 2 địa điểm (dán link vào đây)
  mapGroom: "https://www.google.com/maps",   // Tiệc cưới nhà trai
  mapBride: "https://www.google.com/maps",   // Lễ vu quy nhà gái

  // Tài khoản ngân hàng nhận mừng cưới.
  // bankCode dùng mã VietQR: MB, VCB, TCB, ACB, VPB, BIDV, CTG, STB...
  // QR sẽ tự tạo từ bankCode + accNo + holder.
  bankGroom: { bankCode: "MB", accNo: "0123456789", holder: "HO VAN DAT" },
  bankBride: { bankCode: "MB", accNo: "0987654321", holder: "THAO NGOC" },

  // Nhạc nền
  musicFile: "Váy Cưới.mp3",
};

/* Danh sách toàn bộ ảnh trong album */
const PHOTOS = [
  "KL_05974.JPG", "KL_06019.JPG", "KL_06027.JPG", "KL_06034.JPG",
  "KL_06048.JPG", "KL_06055.JPG", "KL_06060.JPG", "KL_06076.JPG",
  "KL_06080.JPG", "KL_06091.JPG", "KL_06103.JPG", "KL_06111.JPG",
  "KL_06122.JPG", "KL_06126.JPG", "KL_06161.JPG", "KL_06168.JPG",
  "KL_06175.JPG", "KL_06189.JPG", "KL_06193.JPG", "KL_06206.JPG",
  "KL_06207.JPG", "KL_06221.JPG", "KL_06295.JPG", "KL_06339.JPG",
  "KL_06342.JPG", "KL_06372.JPG", "KL_06395.JPG", "KL_06396.JPG",
  "KL_06482.JPG", "KL_06496.JPG", "KL_06508.JPG", "KL_06515.JPG",
  "KL_06641.JPG", "KL_06818.JPG", "KL_06819.JPG",
];

/* ============================================================
   TÊN KHÁCH MỜI — đọc từ ?guest= trên URL
   Ví dụ: index.html?guest=bạn Minh Hiếu
   ============================================================ */
function getGuestName() {
  const g = new URLSearchParams(window.location.search).get("guest");
  return g && g.trim() ? g.trim() : "Quý Khách";
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
function showEnvelope() {
  if (envelopeShown) return;
  envelopeShown = true;
  document.getElementById("env-guest-name").textContent = getGuestName();
  preloader.classList.add("fade");
  envelopeScreen.classList.remove("hidden");
}
window.addEventListener("load", () => setTimeout(showEnvelope, 1100));
// Dự phòng: nếu tải lâu quá 4.5s vẫn hiện phong bì
setTimeout(showEnvelope, 4500);

document.getElementById("open-invite").addEventListener("click", () => {
  const envelope = document.querySelector(".envelope");
  envelope.classList.add("open");

  // phát nhạc ngay khi khách bấm mở thiệp (được trình duyệt cho phép vì có thao tác click)
  bgMusic.play().then(() => musicBtn.classList.add("playing")).catch(() => {});

  setTimeout(() => {
    envelopeScreen.classList.add("opened");
    mainContent.classList.remove("hidden");
    musicBtn.classList.remove("hidden");
    document.body.style.overflow = "";
    initReveal();
    startPetals();
    window.scrollTo(0, 0);
  }, 1200);
});

/* ============================================================
   NÚT NHẠC BẬT / TẮT
   ============================================================ */
musicBtn.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play().then(() => musicBtn.classList.add("playing")).catch(() => {});
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
  item.appendChild(img);
  item.addEventListener("click", () => openLightbox(idx));
  galleryGrid.appendChild(item);
});

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
  { name: "Hội Bạn Thân", msg: "Chúc mừng hạnh phúc Đạt & Ngọc! Mãi bên nhau bạn nhé ❤️" },
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

document.getElementById("wish-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const nameEl = document.getElementById("wish-name");
  const msgEl = document.getElementById("wish-msg");
  const wishes = loadWishes();
  wishes.unshift({ name: nameEl.value.trim(), msg: msgEl.value.trim() });
  localStorage.setItem(WISH_KEY, JSON.stringify(wishes.slice(0, 100)));
  msgEl.value = "";
  renderWishes();
});

/* ============================================================
   RSVP — XÁC NHẬN THAM DỰ
   ============================================================ */
document.getElementById("rsvp-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const record = {
    name: document.getElementById("rsvp-name").value.trim(),
    attend: document.querySelector('input[name="attend"]:checked').value,
    count: document.getElementById("rsvp-count").value,
    time: new Date().toISOString(),
  };
  const all = JSON.parse(localStorage.getItem("dn_rsvp") || "[]");
  all.push(record);
  localStorage.setItem("dn_rsvp", JSON.stringify(all));
  document.getElementById("rsvp-thanks").classList.remove("hidden");
  e.target.querySelector('button[type="submit"]').disabled = true;
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
   CÁNH HOA RƠI
   ============================================================ */
function startPetals() {
  const box = document.getElementById("petals");
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
