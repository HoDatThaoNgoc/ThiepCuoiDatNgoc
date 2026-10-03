/**
 * ============================================================
 * THIỆP CƯỚI HỒ ĐẠT & THẢO NGỌC — THREE.JS 3D ENGINE
 * ------------------------------------------------------------
 * 1. Phong bì 3D tương tác 360° + Mở nắp lật chậm + Lá thư nổi đọc chữ
 * 2. Cánh hoa lá 3D toàn trang (Ambient Botanical Petals)
 * 3. Vòng quay ảnh cưới 3D vô cực (3D Infinite Photo Carousel — CSS 3D Native Images)
 * ============================================================
 */

(function (window) {
  "use strict";

  // Kiểm tra hỗ trợ WebGL
  function isWebGLSupported() {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch (e) {
      return false;
    }
  }

  // Easing functions
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  function easeOutBack(t, s = 1.35) {
    return (t = t - 1) * t * ((s + 1) * t + s) + 1;
  }
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  /* ============================================================
   * 1. PHONG BÌ 3D TƯƠNG TÁC (3D ENVELOPE)
   * ============================================================ */
  function init3DEnvelope(options) {
    const { container, guestName, onOpen } = options;
    if (!container || !isWebGLSupported() || typeof THREE === "undefined") {
      return null;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const isMobile = width < 600;
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    const initialCamZ = isMobile ? 8.6 : 7.0;
    camera.position.set(0, 0, initialCamZ);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.92);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xf4faf5, 0.95);
    dirLight.position.set(4, 7, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xc2dec8, 0.45);
    // Helper vẽ hình chữ nhật bo góc tương thích mọi trình duyệt
    function drawRoundRect(ctx, x, y, w, h, r) {
      if (typeof ctx.roundRect === "function") {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        return;
      }
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    // Dynamic Canvas Textures
    function createFrontTexture(name) {
      const cv = document.createElement("canvas");
      cv.width = 2048;
      cv.height = 1360;
      const ctx = cv.getContext("2d");

      // Nền phong bì sage green sang trọng
      const grad = ctx.createLinearGradient(0, 0, 2048, 1360);
      grad.addColorStop(0, "#e8f2ea");
      grad.addColorStop(0.5, "#d6e6d9");
      grad.addColorStop(1, "#c8dacb");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 2048, 1360);

      // Vân giấy tinh tế
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      for (let i = 0; i < 700; i++) {
        const x = Math.random() * 2048;
        const y = Math.random() * 1360;
        ctx.fillRect(x, y, 3, 3);
      }

      // Khung viền đôi botanical
      ctx.strokeStyle = "rgba(35, 75, 45, 0.45)";
      ctx.lineWidth = 6;
      ctx.strokeRect(72, 72, 2048 - 144, 1360 - 144);
      ctx.strokeStyle = "rgba(35, 75, 45, 0.25)";
      ctx.lineWidth = 3;
      ctx.strokeRect(92, 92, 2048 - 184, 1360 - 184);

      // Hoa văn 4 góc
      const drawCorner = (cx, cy) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.fillStyle = "#1b4a28";
        ctx.font = "38px serif";
        ctx.fillText("❦", -15, 15);
        ctx.restore();
      };
      drawCorner(116, 124);
      drawCorner(2048 - 148, 124);
      drawCorner(116, 1360 - 104);
      drawCorner(2048 - 148, 1360 - 104);

      // Tiêu đề nhỏ
      ctx.fillStyle = "#1f4828";
      ctx.font = "700 42px 'Be Vietnam Pro', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("TRÂN TRỌNG GỬI ĐẾN", 1024, 440);

      // Tên khách mời sắc nét, rõ ràng
      ctx.fillStyle = "#081d0d";
      ctx.font = "bold 96px 'Playfair Display', 'Dancing Script', cursive, serif";
      ctx.fillText(name || "Quý Khách", 1024, 620);

      // Đường kẻ trang trí dưới tên khách
      ctx.strokeStyle = "#275233";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(760, 690);
      ctx.lineTo(1288, 690);
      ctx.stroke();

      ctx.fillStyle = "#275233";
      ctx.font = "32px serif";
      ctx.fillText("❧", 1024, 702);

      // Tên cô dâu chú rể ở góc dưới
      ctx.fillStyle = "#164023";
      ctx.font = "700 52px 'Playfair Display', serif";
      ctx.fillText("HỒ ĐẠT   &   THẢO NGỌC", 1024, 1050);

      ctx.fillStyle = "#275233";
      ctx.font = "600 36px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("25 . 10 . 2026", 1024, 1130);

      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      if (renderer && renderer.capabilities) {
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      }
      return tex;
    }

    function createBackTexture() {
      const cv = document.createElement("canvas");
      cv.width = 1024;
      cv.height = 680;
      const ctx = cv.getContext("2d");

      const grad = ctx.createLinearGradient(0, 0, 1024, 680);
      grad.addColorStop(0, "#dae7dc");
      grad.addColorStop(1, "#c7d9cb");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 680);

      // Đường gập phong bì mặt sau
      ctx.strokeStyle = "rgba(45, 80, 55, 0.18)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(512, 420);
      ctx.lineTo(1024, 0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 680);
      ctx.lineTo(512, 360);
      ctx.lineTo(1024, 680);
      ctx.stroke();

      return new THREE.CanvasTexture(cv);
    }

    function createFlapTexture() {
      const cv = document.createElement("canvas");
      cv.width = 1024;
      cv.height = 512;
      const ctx = cv.getContext("2d");

      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, "#d5e4d8");
      grad.addColorStop(1, "#bfd3c3");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 512);

      // Viền tam giác nắp
      ctx.strokeStyle = "rgba(82, 121, 93, 0.4)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(30, 20);
      ctx.lineTo(512, 480);
      ctx.lineTo(994, 20);
      ctx.stroke();

      return new THREE.CanvasTexture(cv);
    }

    // Lá thư siêu nét (Ultra High-Resolution 2400x1600), chữ to đậm sắc sảo, chống lóa 100%
    function createLetterTexture(name) {
      const cv = document.createElement("canvas");
      cv.width = 2400;
      cv.height = 1600;
      const ctx = cv.getContext("2d");

      // 1. Nền giấy mỹ thuật ngọc ngà với bề mặt mịn màng
      const grad = ctx.createLinearGradient(0, 0, 2400, 1600);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.65, "#fbfdfb");
      grad.addColorStop(1, "#f2f7f3");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 2400, 1600);

      // 2. Viền đôi hoàng gia Botanical sang trọng
      ctx.strokeStyle = "#1b4a28";
      ctx.lineWidth = 6;
      ctx.strokeRect(48, 48, 2400 - 96, 1600 - 96);

      ctx.strokeStyle = "rgba(79, 128, 92, 0.45)";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(64, 64, 2400 - 128, 1600 - 128);

      // Họa tiết góc cổ điển
      const drawCorner = (cx, cy) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.fillStyle = "#1b4a28";
        ctx.font = "bold 44px serif";
        ctx.fillText("❦", -18, 18);
        ctx.restore();
      };
      drawCorner(104, 110);
      drawCorner(2400 - 104, 110);
      drawCorner(104, 1600 - 98);
      drawCorner(2400 - 104, 1600 - 98);

      ctx.textAlign = "center";

      // 3. Tiêu đề đầu (chữ to rõ, sang trọng)
      ctx.fillStyle = "#164023";
      ctx.font = "700 46px 'Playfair Display', 'Be Vietnam Pro', Georgia, serif";
      ctx.fillText("— ❦   SAVE THE DATE   ❦ —", 1200, 115);

      // 4. Lời báo hỷ
      ctx.fillStyle = "#275233";
      ctx.font = "700 32px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("TRÂN TRỌNG BÁO HỶ & KÍNH MỜI", 1200, 165);

      // 5. Tên Cô Dâu & Chú Rể — Chữ to 102px, mực ngọc đậm tối cao cấp, cực kỳ nổi bật
      ctx.fillStyle = "#081d0e";
      ctx.font = "800 102px 'Playfair Display', 'Be Vietnam Pro', Georgia, serif";
      ctx.fillText("HỒ ĐẠT", 760, 260);

      ctx.fillStyle = "#2b5635";
      ctx.font = "italic 600 80px 'Playfair Display', serif";
      ctx.fillText("&", 1200, 260);

      ctx.fillStyle = "#081d0e";
      ctx.font = "800 102px 'Playfair Display', 'Be Vietnam Pro', Georgia, serif";
      ctx.fillText("THẢO NGỌC", 1640, 260);

      // Thứ bậc
      ctx.fillStyle = "#275233";
      ctx.font = "italic 600 34px 'Playfair Display', 'Be Vietnam Pro', Georgia, serif";
      ctx.fillText("(Út Nam)", 760, 312);
      ctx.fillText("(Thứ Nữ)", 1640, 312);

      // 6. Khung Kính Mời Khách to rõ, trang trọng
      drawRoundRect(ctx, 560, 345, 1280, 82, 41);
      ctx.fillStyle = "#edf5ef";
      ctx.fill();
      ctx.strokeStyle = "#7da586";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = "#061a0b";
      ctx.font = "bold 46px 'Playfair Display', 'Be Vietnam Pro', Georgia, serif";
      ctx.fillText("🌿   Kính mời: " + (name || "Quý Khách") + "   🌿", 1200, 398);

      // 7. Thông tin hai bên gia đình (chữ đậm 34px)
      // Nhà Trai
      ctx.fillStyle = "#164023";
      ctx.font = "800 28px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("NHÀ TRAI", 680, 460);

      ctx.fillStyle = "#081d0e";
      ctx.font = "800 34px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("Ông HỒ VĂN NHUNG — Bà VŨ THỊ LÝ", 680, 498);

      ctx.fillStyle = "#275233";
      ctx.font = "600 28px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("📍 Tân Dân, Tỉnh Thanh Hóa", 680, 534);

      // Vạch phân cách giữa hai gia đình
      ctx.strokeStyle = "rgba(79, 128, 92, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(1200, 455);
      ctx.lineTo(1200, 545);
      ctx.stroke();

      ctx.fillStyle = "#2b5635";
      ctx.font = "22px serif";
      ctx.fillText("❦", 1200, 502);

      // Nhà Gái
      ctx.fillStyle = "#164023";
      ctx.font = "800 28px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("NHÀ GÁI", 1720, 460);

      ctx.fillStyle = "#081d0e";
      ctx.font = "800 34px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("Ông NGUYỄN ĐỨC MẠNH — Bà LÊ THỊ KIM PHƯƠNG", 1720, 498);

      ctx.fillStyle = "#275233";
      ctx.font = "600 28px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("📍 Quốc Oai, TP. Hà Nội", 1720, 534);

      // 8. HAI THẺ SỰ KIỆN NỔI BẬT (HIGHLIGHT EVENT CARDS) — Mở rộng tối đa
      // Thẻ Trái: LỄ VU QUY (HÀ NỘI)
      drawRoundRect(ctx, 80, 575, 1095, 760, 24);
      ctx.fillStyle = "#f3f8f4";
      ctx.fill();
      ctx.strokeStyle = "#7da586";
      ctx.lineWidth = 3;
      ctx.stroke();

      drawRoundRect(ctx, 105, 598, 1045, 74, 16);
      ctx.fillStyle = "#164023";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 36px 'Be Vietnam Pro', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("💍 LỄ VU QUY (HÀ NỘI)", 627, 646);

      ctx.fillStyle = "#275233";
      ctx.font = "700 26px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("HÔN LỄ TỔ CHỨC TẠI NHÀ GÁI", 627, 706);

      ctx.strokeStyle = "rgba(79, 128, 92, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(125, 730);
      ctx.lineTo(1130, 730);
      ctx.stroke();

      ctx.textAlign = "left";
      ctx.fillStyle = "#164023";
      ctx.font = "800 28px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("🍽️  TIỆC MỪNG:", 135, 775);

      ctx.fillStyle = "#061a0b";
      ctx.font = "900 42px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("16:00 • Thứ Ba, 20.10.2026", 135, 825);

      ctx.fillStyle = "#275233";
      ctx.font = "600 26px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("(Tức ngày 11 tháng 09 năm Bính Ngọ)", 135, 868);

      ctx.fillStyle = "#164023";
      ctx.font = "800 28px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("💒  LỄ VU QUY:", 135, 935);

      ctx.fillStyle = "#061a0b";
      ctx.font = "900 42px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("10:00 • Thứ Tư, 21.10.2026", 135, 985);

      ctx.fillStyle = "#275233";
      ctx.font = "600 26px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("(Tức ngày 12 tháng 09 năm Bính Ngọ)", 135, 1028);

      ctx.strokeStyle = "rgba(79, 128, 92, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(125, 1060);
      ctx.lineTo(1130, 1060);
      ctx.stroke();

      ctx.fillStyle = "#164023";
      ctx.font = "800 28px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("📍  ĐỊA ĐIỂM TỔ CHỨC:", 135, 1105);

      ctx.fillStyle = "#061a0b";
      ctx.font = "900 40px 'Playfair Display', 'Be Vietnam Pro', Georgia, serif";
      ctx.fillText("TƯ GIA HƯNG", 135, 1155);

      ctx.fillStyle = "#214929";
      ctx.font = "600 28px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("Số 01 Đường Hoàng Xá, Thôn Phủ Quốc,", 135, 1205);
      ctx.fillText("Huyện Quốc Oai, TP. Hà Nội", 135, 1248);

      // Thẻ Phải: LỄ THÀNH HÔN (THANH HÓA)
      drawRoundRect(ctx, 1225, 575, 1095, 760, 24);
      ctx.fillStyle = "#f3f8f4";
      ctx.fill();
      ctx.strokeStyle = "#7da586";
      ctx.lineWidth = 3;
      ctx.stroke();

      drawRoundRect(ctx, 1250, 598, 1045, 74, 16);
      ctx.fillStyle = "#164023";
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 36px 'Be Vietnam Pro', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("💒 LỄ THÀNH HÔN (THANH HÓA)", 1772, 646);

      ctx.fillStyle = "#275233";
      ctx.font = "700 26px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("HÔN LỄ TỔ CHỨC TẠI NHÀ TRAI", 1772, 706);

      ctx.strokeStyle = "rgba(79, 128, 92, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(1270, 730);
      ctx.lineTo(2275, 730);
      ctx.stroke();

      ctx.textAlign = "left";
      ctx.fillStyle = "#164023";
      ctx.font = "800 28px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("💒  LỄ THÀNH HÔN:", 1280, 775);

      ctx.fillStyle = "#061a0b";
      ctx.font = "900 42px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("09:00 • Chủ Nhật, 25.10.2026", 1280, 825);

      ctx.fillStyle = "#275233";
      ctx.font = "600 26px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("(Tức ngày 16 tháng 09 năm Bính Ngọ)", 1280, 868);

      ctx.fillStyle = "#164023";
      ctx.font = "800 28px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("🍽️  TIỆC MỪNG CHUNG VUI:", 1280, 935);

      ctx.fillStyle = "#061a0b";
      ctx.font = "900 42px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("10:00 • Chủ Nhật, 25.10.2026", 1280, 985);

      ctx.fillStyle = "#275233";
      ctx.font = "600 26px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("(Tức ngày 16 tháng 09 năm Bính Ngọ)", 1280, 1028);

      ctx.strokeStyle = "rgba(79, 128, 92, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(1270, 1060);
      ctx.lineTo(2275, 1060);
      ctx.stroke();

      ctx.fillStyle = "#164023";
      ctx.font = "800 28px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("📍  ĐỊA ĐIỂM TỔ CHỨC:", 1280, 1105);

      ctx.fillStyle = "#061a0b";
      ctx.font = "900 40px 'Playfair Display', 'Be Vietnam Pro', Georgia, serif";
      ctx.fillText("NHÀ VĂN HÓA ĐA NĂNG PHƯỜNG TÂN DÂN", 1280, 1155);

      ctx.fillStyle = "#214929";
      ctx.font = "600 28px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("Phường Tân Dân, Thị xã Nghi Sơn,", 1280, 1205);
      ctx.fillText("Tỉnh Thanh Hóa", 1280, 1248);

      // 9. Lời chúc và tri ân chân thành (chữ to 36px)
      ctx.textAlign = "center";
      ctx.fillStyle = "#061a0b";
      ctx.font = "italic 700 36px 'Playfair Display', 'Be Vietnam Pro', Georgia, serif";
      ctx.fillText('"Thật sự hạnh phúc và vinh dự khi nhận được tình cảm', 1200, 1410);
      ctx.fillText('và sự hiện diện của bạn trong ngày vui của gia đình!"', 1200, 1460);

      ctx.fillStyle = "#275233";
      ctx.font = "32px serif";
      ctx.fillText("❦   —   💚   —   ❦", 1200, 1520);

      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      if (renderer && renderer.capabilities) {
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      }
      return tex;
    }

    // Build 3D Envelope Mesh Group
    const envelopeGroup = new THREE.Group();
    scene.add(envelopeGroup);

    const envW = 4.2;
    const envH = 2.8;
    const envD = 0.08;

    // Mặt sau (Back)
    const backGeo = new THREE.PlaneGeometry(envW, envH);
    const backMat = new THREE.MeshStandardMaterial({
      map: createBackTexture(),
      roughness: 0.55,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.position.z = -envD / 2;
    backMesh.castShadow = true;
    envelopeGroup.add(backMesh);

    // Mặt trước (Front)
    const frontGeo = new THREE.PlaneGeometry(envW, envH);
    const frontMat = new THREE.MeshStandardMaterial({
      map: createFrontTexture(guestName),
      roughness: 0.65,
      metalness: 0.0,
    });
    const frontMesh = new THREE.Mesh(frontGeo, frontMat);
    frontMesh.position.z = envD / 2;
    frontMesh.receiveShadow = true;
    envelopeGroup.add(frontMesh);

    // Lá thư bên trong (Letter Card) — Dùng MeshBasicMaterial để giữ độ tương phản 100% không bị đèn 3D làm bạc màu
    const letterGeo = new THREE.PlaneGeometry(envW * 0.94, envH * 0.94);
    const letterMat = new THREE.MeshBasicMaterial({
      map: createLetterTexture(guestName),
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const letterMesh = new THREE.Mesh(letterGeo, letterMat);
    letterMesh.position.set(0, 0, 0.01);
    letterMesh.visible = false; // Bỏ phần thiệp 3D này theo yêu cầu, mở thiệp sẽ chỉ hiện thiệp hoàng gia HTML
    envelopeGroup.add(letterMesh);

    // Tự động vẽ lại nét hơn khi font Google hoàn tất tải về
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        try {
          if (letterMat) {
            letterMat.map = createLetterTexture(guestName);
            letterMat.map.needsUpdate = true;
          }
          if (frontMat) {
            frontMat.map = createFrontTexture(guestName);
            frontMat.map.needsUpdate = true;
          }
        } catch (e) {
          console.warn("Font refresh on canvas error:", e);
        }
      });
    }

    // Nắp phong bì (Top Flap) với trục xoay Pivot
    const flapPivot = new THREE.Group();
    flapPivot.position.set(0, envH / 2, envD / 2);
    envelopeGroup.add(flapPivot);

    const flapShape = new THREE.Shape();
    flapShape.moveTo(-envW / 2, 0);
    flapShape.lineTo(envW / 2, 0);
    flapShape.lineTo(0, -envH * 0.54);
    flapShape.closePath();

    const flapGeo = new THREE.ShapeGeometry(flapShape);
    const flapMat = new THREE.MeshStandardMaterial({
      map: createFlapTexture(),
      roughness: 0.5,
      side: THREE.DoubleSide,
    });
    const flapMesh = new THREE.Mesh(flapGeo, flapMat);
    flapMesh.position.z = 0.005;
    flapMesh.castShadow = true;
    flapPivot.add(flapMesh);

    // Con dấu sáp (Wax Seal) dập nổi
    const sealGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.08, 32);
    const sealMat = new THREE.MeshStandardMaterial({
      color: 0x416b4c, // Sage dark wax
      roughness: 0.25,
      metalness: 0.25,
    });
    const sealMesh = new THREE.Mesh(sealGeo, sealMat);
    sealMesh.rotation.x = Math.PI / 2;
    sealMesh.position.set(0, -envH * 0.48, 0.05);
    flapPivot.add(sealMesh);

    // Hình tim nổi trên con dấu
    const heartShape = new THREE.Shape();
    const hx = 0, hy = 0, hs = 0.14;
    heartShape.moveTo(hx, hy + hs * 0.7);
    heartShape.bezierCurveTo(hx, hy + hs * 1.3, hx - hs * 1.2, hy + hs * 1.3, hx - hs * 1.2, hy + hs * 0.7);
    heartShape.bezierCurveTo(hx - hs * 1.2, hy + hs * 0.2, hx, hy - hs * 0.4, hx, hy - hs * 0.9);
    heartShape.bezierCurveTo(hx, hy - hs * 0.4, hx + hs * 1.2, hy + hs * 0.2, hx + hs * 1.2, hy + hs * 0.7);
    heartShape.bezierCurveTo(hx + hs * 1.2, hy + hs * 1.3, hx, hy + hs * 1.3, hx, hy + hs * 0.7);

    const heartGeo = new THREE.ShapeGeometry(heartShape);
    const heartMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    heartMesh.position.set(0, -envH * 0.48, 0.1);
    flapPivot.add(heartMesh);

    // Particle Burst System khi bẻ dấu sáp
    const particleCount = 85;
    const particleGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pVelocities = [];
    const pColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = 0;
      pPositions[i * 3 + 1] = 0;
      pPositions[i * 3 + 2] = 0;

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.04 + Math.random() * 0.08;
      pVelocities.push({
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed + 0.03,
        z: (Math.random() - 0.5) * speed,
      });

      // Vàng kim và xanh ngọc
      if (i % 2 === 0) {
        pColors[i * 3] = 0.95; pColors[i * 3 + 1] = 0.85; pColors[i * 3 + 2] = 0.45; // Gold
      } else {
        pColors[i * 3] = 0.43; pColors[i * 3 + 1] = 0.68; pColors[i * 3 + 2] = 0.50; // Sage
      }
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(pColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    particleSystem.position.set(0, 0, 0.2);
    envelopeGroup.add(particleSystem);

    // State Variables
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    // Các giai đoạn mở thiệp
    // 0: Chờ bấm mở | 1: Đang mở (mở nắp + lá thư trượt ra) | 2: Đang đọc thiệp (Reading State) | 3: Đang chuyển cảnh vào web
    let state = 0;
    let openProgress = 0;
    let particlesActive = false;
    let readingTimer = null;

    // Raycaster để click con dấu sáp hoặc lá thư
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Event Listeners (Mouse & Touch)
    function onPointerDown(e) {
      if (state !== 0) return;
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    }

    function onPointerMove(e) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      if (isDragging && state === 0) {
        const deltaX = clientX - prevMouseX;
        const deltaY = clientY - prevMouseY;
        targetRotY += deltaX * 0.008;
        targetRotX = Math.max(-0.6, Math.min(0.6, targetRotX + deltaY * 0.006));
        prevMouseX = clientX;
        prevMouseY = clientY;
      }
    }

    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
    }

    function onClick(e) {
      const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (state === 0) {
        const intersects = raycaster.intersectObjects([sealMesh, heartMesh, frontMesh, flapMesh], true);
        if (intersects.length > 0) {
          triggerOpen();
        }
      } else if (state === 2) {
        // Chạm vào phong bì đã mở để hiển thị lại chi tiết thiệp hoàng gia
        const intersects = raycaster.intersectObjects([frontMesh, backMesh, flapMesh], true);
        if (intersects.length > 0) {
          if (typeof window.showLetterModal === "function") {
            window.showLetterModal();
          }
        }
      }
    }

    // Bắt đầu mở phong bì (Chậm hơn, mượt hơn, nghệ thuật hơn)
    function triggerOpen() {
      if (state === 2) {
        proceedToContent();
        return;
      }
      if (state !== 0) return;
      state = 1;
      particlesActive = true;
      particleMat.opacity = 1;

      // Nổ hạt từ vị trí con dấu
      particleSystem.position.set(0, -envH * 0.48, 0.15);

      // Cập nhật giao diện nút bấm
      const openBtn = document.getElementById("open-invite");
      const envHint = document.getElementById("env-hint");
      if (openBtn) {
        openBtn.textContent = "⏳ Đang mở thiệp cưới...";
        openBtn.style.opacity = "0.7";
        openBtn.style.pointerEvents = "none";
      }
      if (envHint) {
        envHint.textContent = "Lá thiệp hạnh phúc đang mở ra... ";
      }

      // Ẩn con dấu sau khi nổ hạt
      setTimeout(() => {
        sealMesh.visible = false;
        heartMesh.visible = false;
      }, 160);
    }

    // Chuyển cảnh từ phong bì vào nội dung chính
    function proceedToContent() {
      if (state >= 3) return;
      state = 3;
      if (readingTimer) clearTimeout(readingTimer);

      const openBtn = document.getElementById("open-invite");
      if (openBtn) {
        openBtn.textContent = "💚 Đang vào lễ cưới...";
      }

      // Diễn hoạt phong bì tiến thẳng về camera và tan mờ mượt mà
      let fadeOutProgress = 0;
      function fadeOutStep() {
        fadeOutProgress += 0.035;
        envelopeGroup.position.z += 0.12;
        envelopeGroup.scale.multiplyScalar(1.02);

        if (fadeOutProgress < 1.0) {
          requestAnimationFrame(fadeOutStep);
        } else {
          state = 4;
          if (typeof onOpen === "function") {
            onOpen();
          }
        }
      }
      fadeOutStep();
    }

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    dom.addEventListener("click", onClick);

    dom.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp, { passive: true });
    dom.addEventListener("touchend", onClick);

    // Resize Handler — căn chỉnh camera tự động đảm bảo phong bì 3D luôn lọt trọn trong khung nhìn
    function onResize() {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const aspect = w / h;
      camera.aspect = aspect;

      const fovRad = (camera.fov * Math.PI) / 180;
      const isMobile = w < 600;
      const requiredH = isMobile ? 4.8 : 3.8;
      const requiredW = isMobile ? 4.6 : 4.4;
      const distV = (requiredH / 2) / Math.tan(fovRad / 2);
      const distH = (requiredW / 2) / (Math.tan(fovRad / 2) * aspect);
      camera.position.z = Math.max(distV, distH) * (isMobile ? 1.05 : 1.0);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);
    onResize();

    // Animation Loop
    let clock = new THREE.Clock();
    let animId = null;

    function animate() {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Damping góc xoay phong bì khi chưa mở
      if (state === 0) {
        envelopeGroup.rotation.y += (targetRotY - envelopeGroup.rotation.y) * 0.08;
        envelopeGroup.rotation.x += (targetRotX - envelopeGroup.rotation.x) * 0.08;

        // Bồng bềnh nhẹ nhàng
        envelopeGroup.position.y = Math.sin(elapsedTime * 1.8) * 0.12;
      } else {
        // Đưa phong bì về chính diện khi mở
        envelopeGroup.rotation.y += (0 - envelopeGroup.rotation.y) * 0.08;
        envelopeGroup.rotation.x += (0 - envelopeGroup.rotation.x) * 0.08;
      }

      // Xử lý nổ hạt sáp
      if (particlesActive) {
        const pos = particleGeo.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          pos[i * 3] += pVelocities[i].x;
          pos[i * 3 + 1] += pVelocities[i].y;
          pos[i * 3 + 2] += pVelocities[i].z;
          pVelocities[i].y -= 0.002; // gravity
        }
        particleGeo.attributes.position.needsUpdate = true;
        particleMat.opacity -= 0.015;
        if (particleMat.opacity <= 0) particlesActive = false;
      }

      // GIAI ĐOẠN 1: Mở nắp phong bì và tự động hiển thị thiệp hoàng gia HTML
      if (state === 1) {
        openProgress += 0.014; // Tốc độ mở nắp mượt mà

        // Bước 1.1: Mở nắp lật (0 -> 0.6)
        if (openProgress <= 0.6) {
          const t = openProgress / 0.6;
          flapPivot.rotation.x = -easeOutCubic(t) * Math.PI * 0.94;
        }

        // Bước 1.2: Phong bì hơi hạ nhẹ xuống tự nhiên (0.2 -> 0.7)
        if (openProgress > 0.2) {
          const t = Math.min(1, (openProgress - 0.2) / 0.5);
          envelopeGroup.position.y = -easeOutCubic(t) * 0.35;
        }

        // Bước 1.3: Khi nắp phong bì đã mở hoàn tất → Chuyển sang GIAI ĐOẠN 2 & TỰ ĐỘNG HIỆN THIỆP HOÀNG GIA HTML
        if (openProgress >= 0.65) {
          state = 2; // Chuyển sang chế độ đã mở

          // TỰ ĐỘNG BẬT THIỆP HOÀNG GIA HTML ĐẦY ĐỦ CHI TIẾT
          if (typeof window.showLetterModal === "function") {
            window.showLetterModal();
          }

          // Cập nhật nút bấm giao diện
          const openBtn = document.getElementById("open-invite");
          const viewBtn = document.getElementById("view-card-btn");
          const envHint = document.getElementById("env-hint");
          if (openBtn) {
            openBtn.textContent = "✨ Khám Phá Lễ Cưới ⬇";
            openBtn.style.opacity = "1";
            openBtn.style.pointerEvents = "auto";
            openBtn.onclick = proceedToContent;
          }
          if (viewBtn) {
            viewBtn.classList.remove("hidden");
            viewBtn.textContent = "📜 Xem Lại Thiệp";
            viewBtn.onclick = () => {
              if (typeof window.showLetterModal === "function") window.showLetterModal();
            };
          }
          if (envHint) {
            envHint.innerHTML = "💚 <b>Thiệp cưới đã mở</b> • Bấm nút bên dưới để vào lễ cưới 💚";
          }
        }
      }

      // GIAI ĐOẠN 2: Phong bì lơ lửng nhẹ nhàng trong nền
      if (state === 2) {
        envelopeGroup.position.y = -0.35 + Math.sin(elapsedTime * 1.5) * 0.04;
      }

      renderer.render(scene, camera);
    }
    animate();

    return {
      triggerOpen,
      proceedToContent,
      destroy: () => {
        cancelAnimationFrame(animId);
        if (readingTimer) clearTimeout(readingTimer);
        window.removeEventListener("resize", onResize);
        dom.removeEventListener("mousedown", onPointerDown);
        window.removeEventListener("mousemove", onPointerMove);
        window.removeEventListener("mouseup", onPointerUp);
        dom.removeEventListener("click", onClick);
        renderer.dispose();
      },
    };
  }

  /* ============================================================
   * 2. CÁNH HOA LÁ 3D TOÀN TRANG (3D AMBIENT PETALS)
   * ============================================================ */
  function init3DPetals(canvas) {
    if (!canvas || !isWebGLSupported() || typeof THREE === "undefined") {
      return null;
    }

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 15;

    // Hình học cánh hoa lá cong 3D
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, -0.5);
    petalShape.bezierCurveTo(0.4, -0.3, 0.5, 0.3, 0, 0.6);
    petalShape.bezierCurveTo(-0.5, 0.3, -0.4, -0.3, 0, -0.5);

    const petalGeo = new THREE.ShapeGeometry(petalShape);

    const colors = [0xcde3d2, 0xa5cba9, 0xd8eadc, 0xb8d9be, 0xffffff];
    const materials = colors.map(
      (c) =>
        new THREE.MeshBasicMaterial({
          color: c,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.78,
        })
    );

    const petalCount = window.innerWidth < 600 ? 32 : 55;
    const petals = [];

    for (let i = 0; i < petalCount; i++) {
      const mat = materials[i % materials.length];
      const mesh = new THREE.Mesh(petalGeo, mat);
      const scale = 0.35 + Math.random() * 0.45;
      mesh.scale.set(scale, scale, scale);

      mesh.position.set(
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10
      );

      petals.push({
        mesh,
        vy: 0.018 + Math.random() * 0.024,
        vx: (Math.random() - 0.5) * 0.012,
        rx: (Math.random() - 0.5) * 0.02,
        ry: (Math.random() - 0.5) * 0.03,
        rz: (Math.random() - 0.5) * 0.02,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
      });

      scene.add(mesh);
    }

    let lastScrollY = window.scrollY;
    let scrollBoost = 0;

    function onScroll() {
      const delta = Math.abs(window.scrollY - lastScrollY);
      scrollBoost = Math.min(0.08, delta * 0.001);
      lastScrollY = window.scrollY;
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    let animId = null;
    function animate() {
      animId = requestAnimationFrame(animate);

      scrollBoost *= 0.94;

      for (let i = 0; i < petalCount; i++) {
        const p = petals[i];
        p.wobble += p.wobbleSpeed;

        p.mesh.position.y -= p.vy + scrollBoost;
        p.mesh.position.x += Math.sin(p.wobble) * 0.014 + p.vx;
        p.mesh.rotation.x += p.rx;
        p.mesh.rotation.y += p.ry;
        p.mesh.rotation.z += p.rz;

        if (p.mesh.position.y < -12) {
          p.mesh.position.y = 12;
          p.mesh.position.x = (Math.random() - 0.5) * 24;
        }
      }

      renderer.render(scene, camera);
    }
    animate();

    return {
      destroy: () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
      },
    };
  }

  /* ============================================================
   * 3. VÒNG QUAY ẢNH CƯỚI 3D VÔ CỰC (CSS 3D CYLINDRICAL CAROUSEL)
   * ------------------------------------------------------------
   * Dùng CSS 3D với thẻ <img> gốc:
   * ✓ 100% hiển thị ảnh ngay lập tức trên file:/// và mọi thiết bị
   * ✓ Không bị lỗi CORS/Tainted Canvas của WebGL
   * ✓ Vuốt xoay 360° có quán tính mượt mà 60fps
   * ✓ Bấm vào bất kỳ ảnh nào để mở Lightbox phóng to
   * ============================================================ */
  function init3DCarousel(options) {
    const { container, photos, onPhotoClick } = options;
    if (!container || !photos || !photos.length) return null;

    // Chọn lọc 10 bức ảnh cưới đẹp nhất
    const curatedPhotos = photos.slice(0, 10);
    const count = curatedPhotos.length;

    container.innerHTML = "";

    // Tạo sân khấu 3D
    const stage = document.createElement("div");
    stage.className = "carousel-3d-stage";

    // Khối trục trụ xoay 3D
    const cylinder = document.createElement("div");
    cylinder.className = "carousel-3d-cylinder";

    const isMobile = window.innerWidth < 600;
    const radius = isMobile ? 280 : 380; // Bán kính vòng xoay 3D

    curatedPhotos.forEach((src, idx) => {
      const card = document.createElement("div");
      card.className = "carousel-3d-card";

      const angle = (idx / count) * 360;
      card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;

      const img = document.createElement("img");
      img.src = src;
      img.alt = "Ảnh cưới Đạt & Ngọc " + (idx + 1);
      img.loading = "lazy";
      img.decoding = "async";

      card.appendChild(img);

      // Nhấp ảnh để mở Lightbox
      card.addEventListener("click", () => {
        if (typeof onPhotoClick === "function") {
          onPhotoClick(idx, src);
        }
      });

      cylinder.appendChild(card);
    });

    stage.appendChild(cylinder);
    container.appendChild(stage);

    // Điều khiển xoay 3D (Touch / Mouse Drag + Quán tính)
    let currentAngle = 0;
    let targetAngle = 0;
    let isDragging = false;
    let startX = 0;
    let prevX = 0;
    let velocity = 0;
    let isHovered = false;

    function onPointerDown(e) {
      isDragging = true;
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      prevX = startX;
      velocity = 0;
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const delta = x - prevX;
      velocity = delta;
      targetAngle += delta * 0.32;
      prevX = x;
    }

    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
      // Thêm quán tính vuốt
      targetAngle += velocity * 1.5;
    }

    stage.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    stage.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp, { passive: true });

    stage.addEventListener("mouseenter", () => (isHovered = true));
    stage.addEventListener("mouseleave", () => (isHovered = false));

    // Nút sang trái / phải
    const stepAngle = 360 / count;
    function step(dir) {
      targetAngle += dir * stepAngle;
    }

    // Animation Loop
    let animId = null;
    function animate() {
      animId = requestAnimationFrame(animate);

      // Tự động xoay chậm khi người dùng không tương tác
      if (!isDragging && !isHovered) {
        targetAngle -= 0.1;
      }

      // Easing mượt mà
      currentAngle += (targetAngle - currentAngle) * 0.085;
      cylinder.style.transform = `rotateY(${currentAngle}deg)`;
    }
    animate();

    return {
      step,
      destroy: () => {
        cancelAnimationFrame(animId);
        stage.removeEventListener("mousedown", onPointerDown);
        window.removeEventListener("mousemove", onPointerMove);
        window.removeEventListener("mouseup", onPointerUp);
        container.innerHTML = "";
      },
    };
  }

  // Export sang đối tượng toàn cục
  window.ThreeWedding = {
    isSupported: isWebGLSupported,
    init3DEnvelope,
    init3DPetals,
    init3DCarousel,
  };
})(window);
