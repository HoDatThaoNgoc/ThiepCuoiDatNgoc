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
    rimLight.position.set(-5, -4, -3);
    scene.add(rimLight);

    // Dynamic Canvas Textures
    function createFrontTexture(name) {
      const cv = document.createElement("canvas");
      cv.width = 1024;
      cv.height = 680;
      const ctx = cv.getContext("2d");

      // Nền phong bì sage green nhẹ
      const grad = ctx.createLinearGradient(0, 0, 1024, 680);
      grad.addColorStop(0, "#e8f2ea");
      grad.addColorStop(0.5, "#d6e6d9");
      grad.addColorStop(1, "#c8dacb");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 680);

      // Vân giấy tinh tế
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 680;
        ctx.fillRect(x, y, 2, 2);
      }

      // Khung viền đôi botanical vàng sage
      ctx.strokeStyle = "rgba(82, 121, 93, 0.45)";
      ctx.lineWidth = 3;
      ctx.strokeRect(36, 36, 1024 - 72, 680 - 72);
      ctx.strokeStyle = "rgba(82, 121, 93, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(46, 46, 1024 - 92, 680 - 92);

      // Hoa văn 4 góc (corner motifs)
      const drawCorner = (cx, cy) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.fillStyle = "#52795d";
        ctx.font = "20px serif";
        ctx.fillText("❦", -8, 8);
        ctx.restore();
      };
      drawCorner(58, 62);
      drawCorner(1024 - 74, 62);
      drawCorner(58, 680 - 52);
      drawCorner(1024 - 74, 680 - 52);

      // Tiêu đề nhỏ
      ctx.fillStyle = "#627566";
      ctx.font = "500 22px 'Be Vietnam Pro', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("TRÂN TRỌNG GỬI ĐẾN", 512, 220);

      // Tên khách mời (chữ thư pháp mềm mại)
      ctx.fillStyle = "#24432c";
      ctx.font = "600 58px 'Dancing Script', 'Playfair Display', cursive";
      ctx.fillText(name || "Quý Khách", 512, 310);

      // Đường kẻ trang trí dưới tên khách
      ctx.strokeStyle = "#52795d";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(380, 345);
      ctx.lineTo(644, 345);
      ctx.stroke();

      ctx.fillStyle = "#52795d";
      ctx.font = "18px serif";
      ctx.fillText("❧", 512, 351);

      // Tên cô dâu chú rể ở góc dưới
      ctx.fillStyle = "#52795d";
      ctx.font = "600 26px 'Playfair Display', serif";
      ctx.fillText("HỒ ĐẠT  &  THẢO NGỌC", 512, 530);

      ctx.fillStyle = "#627566";
      ctx.font = "400 18px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("25 . 10 . 2026", 512, 570);

      return new THREE.CanvasTexture(cv);
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

    // Lá thư siêu nét (High-Resolution 1200x860), thông tin đầy đủ từ thiệp cưới thực tế
    function createLetterTexture(name) {
      const cv = document.createElement("canvas");
      cv.width = 1200;
      cv.height = 860;
      const ctx = cv.getContext("2d");

      // Nền giấy thư ngọc ngà sang trọng với viền phủ mờ
      const grad = ctx.createLinearGradient(0, 0, 1200, 860);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.5, "#fafcf9");
      grad.addColorStop(1, "#f2f7f3");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 860);

      // Viền đôi hoàng gia
      ctx.strokeStyle = "rgba(193, 215, 197, 0.85)";
      ctx.lineWidth = 5;
      ctx.strokeRect(36, 36, 1200 - 72, 860 - 72);

      ctx.strokeStyle = "#52795d";
      ctx.lineWidth = 2;
      ctx.strokeRect(48, 48, 1200 - 96, 860 - 96);

      // Họa tiết góc
      const drawCorner = (cx, cy) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.fillStyle = "#52795d";
        ctx.font = "26px serif";
        ctx.fillText("❦", -12, 12);
        ctx.restore();
      };
      drawCorner(70, 75);
      drawCorner(1200 - 75, 75);
      drawCorner(70, 860 - 65);
      drawCorner(1200 - 75, 860 - 65);

      // 1. Dòng tiêu đề đầu
      ctx.fillStyle = "#52795d";
      ctx.font = "600 24px 'Playfair Display', serif";
      ctx.textAlign = "center";
      ctx.fillText("— ❦   SAVE THE DATE   ❦ —", 600, 130);

      // 2. Lời báo hỷ
      ctx.fillStyle = "#627566";
      ctx.font = "500 19px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("TRÂN TRỌNG BÁO HỶ & KÍNH MỜI", 600, 170);

      // 3. Tên Cô Dâu & Chú Rể
      ctx.fillStyle = "#24432c";
      ctx.font = "700 56px 'Playfair Display', serif";
      ctx.fillText("HỒ ĐẠT   &   THẢO NGỌC", 600, 250);

      ctx.fillStyle = "#52795d";
      ctx.font = "italic 20px 'Playfair Display', serif";
      ctx.fillText("(Út Nam)                                (Thứ Nữ)", 600, 280);

      // 4. Kính mời khách
      ctx.fillStyle = "#52795d";
      ctx.font = "600 38px 'Dancing Script', 'Playfair Display', cursive";
      ctx.fillText("Kính mời: " + (name || "Quý Khách"), 600, 350);

      // Đường kẻ phân cách
      ctx.strokeStyle = "#52795d";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(420, 380);
      ctx.lineTo(780, 380);
      ctx.stroke();
      ctx.fillStyle = "#52795d";
      ctx.font = "20px serif";
      ctx.fillText("💚", 600, 388);

      // 5. Thông tin hai gia đình
      ctx.fillStyle = "#4a5e4d";
      ctx.font = "500 19px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("Nhà Trai: Ông HỒ VĂN NHUNG — Bà VŨ THỊ LÝ (Tân Dân, Thanh Hóa)", 600, 440);
      ctx.fillText("Nhà Gái: Ông NGUYỄN ĐỨC MẠNH — Bà LÊ THỊ KIM PHƯƠNG (Quốc Oai, Hà Nội)", 600, 475);

      // 6. Hai mốc sự kiện lớn
      ctx.fillStyle = "#24432c";
      ctx.font = "700 24px 'Playfair Display', serif";
      ctx.fillText("💍 LỄ VU QUY (HÀ NỘI): 10:00 • 21.10.2026 (12.09 ÂL)", 600, 550);
      ctx.fillStyle = "#627566";
      ctx.font = "18px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("📍 Tại Gia Hưng — Số 01 Đường Hoàng Xá, Thôn Phủ Quốc, Quốc Oai, Hà Nội", 600, 582);

      ctx.fillStyle = "#24432c";
      ctx.font = "700 24px 'Playfair Display', serif";
      ctx.fillText("💒 LỄ THÀNH HÔN (THANH HÓA): 09:00 • 25.10.2026 (16.09 ÂL)", 600, 645);
      ctx.fillStyle = "#627566";
      ctx.font = "18px 'Be Vietnam Pro', sans-serif";
      ctx.fillText("📍 Tại Nhà Đa Năng Phường Tân Dân, Tỉnh Thanh Hóa", 600, 677);

      // 7. Lời cảm ơn từ thiệp cưới thực tế
      ctx.fillStyle = "#4a5e4d";
      ctx.font = "italic 21px 'Playfair Display', serif";
      ctx.fillText('"Thật sự hạnh phúc và vinh dự khi nhận được tình cảm', 600, 750);
      ctx.fillText('và sự hiện diện của bạn trong ngày vui của gia đình!"', 600, 782);

      return new THREE.CanvasTexture(cv);
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
      roughness: 0.5,
      metalness: 0.05,
    });
    const frontMesh = new THREE.Mesh(frontGeo, frontMat);
    frontMesh.position.z = envD / 2;
    frontMesh.receiveShadow = true;
    envelopeGroup.add(frontMesh);

    // Lá thư bên trong (Letter Card)
    const letterGeo = new THREE.PlaneGeometry(envW * 0.94, envH * 0.94);
    const letterMat = new THREE.MeshStandardMaterial({
      map: createLetterTexture(guestName),
      roughness: 0.35,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const letterMesh = new THREE.Mesh(letterGeo, letterMat);
    letterMesh.position.set(0, 0, 0.01);
    envelopeGroup.add(letterMesh);

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
        // Chạm vào lá thư khi đang ở trạng thái đọc để hiển thị chi tiết thiệp
        const intersects = raycaster.intersectObjects([letterMesh], true);
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
        envHint.textContent = "✨ Lá thiệp hạnh phúc đang mở ra... ✨";
      }

      // Ẩn con dấu sau khi nổ hạt
      setTimeout(() => {
        sealMesh.visible = false;
        heartMesh.visible = false;
      }, 160);
    }

    // Chuyển cảnh từ lá thư vào nội dung chính
    function proceedToContent() {
      if (state >= 3) return;
      state = 3;
      if (readingTimer) clearTimeout(readingTimer);

      const openBtn = document.getElementById("open-invite");
      if (openBtn) {
        openBtn.textContent = "💚 Đang vào lễ cưới...";
      }

      // Diễn hoạt lá thư tiến thẳng về camera và tan mờ mượt mà
      let fadeOutProgress = 0;
      function fadeOutStep() {
        fadeOutProgress += 0.035;
        letterMesh.position.z += 0.12;
        letterMesh.scale.multiplyScalar(1.018);

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

    // Resize Handler — căn chỉnh camera tự động đảm bảo toàn bộ thiệp luôn lọt trọn trong khung nhìn
    function onResize() {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const aspect = w / h;
      camera.aspect = aspect;

      // Cần bao quát được chiều cao ~4.8 (khi phong bì hạ xuống và lá thư ở giữa) và chiều rộng ~4.4
      const fovRad = (camera.fov * Math.PI) / 180;
      const distV = (4.8 / 2) / Math.tan(fovRad / 2);
      const distH = (4.4 / 2) / (Math.tan(fovRad / 2) * aspect);
      camera.position.z = Math.max(7.2, Math.max(distV, distH) * 1.18);
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

      // GIAI ĐOẠN 1: Mở nắp lật và hạ phong bì xuống, đưa lá thư ra CHÍNH GIỮA màn hình
      if (state === 1) {
        openProgress += 0.0072; // Tốc độ mở chậm rãi, tinh tế

        // Bước 1.1: Mở nắp lật (0 -> 0.35)
        if (openProgress <= 0.35) {
          const t = openProgress / 0.35;
          flapPivot.rotation.x = -easeOutCubic(t) * Math.PI * 0.94;
        }

        // Bước 1.2: Phong bì trượt hạ xuống, lá thư trượt nhô ra và căn CHÍNH GIỮA màn hình (0.22 -> 1.0)
        if (openProgress > 0.22) {
          const t = Math.min(1, (openProgress - 0.22) / 0.78);
          const easeT = easeOutCubic(t);

          // Phong bì hạ xuống dưới để nhường trung tâm cho lá thiệp
          envelopeGroup.position.y = -easeT * 1.35;

          // Lá thư trượt lên trên phong bì và tiến về phía trước (world Y: -1.35 + 1.75 = +0.40)
          letterMesh.position.y = easeT * 1.75;
          letterMesh.position.z = 0.05 + easeT * 1.7; // Tiến gần camera, hoàn toàn vượt ra trước phong bì
          const scale = 1 + easeT * 0.12;
          letterMesh.scale.set(scale, scale, 1);
        }

        // Bước 1.3: Khi lá thư đã mở hoàn tất → Chuyển sang GIAI ĐOẠN 2: ĐỌC THIỆP (READING STATE)
        if (openProgress >= 1.0) {
          state = 2; // Chuyển sang chế độ đọc thiệp

          // Hiển thị ngay bảng thiệp mời chi tiết sắc nét toàn màn hình
          if (typeof window.showLetterModal === "function") {
            window.showLetterModal();
          }

          // Cập nhật nút bấm
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
            viewBtn.onclick = () => {
              if (typeof window.showLetterModal === "function") window.showLetterModal();
            };
          }
          if (envHint) {
            envHint.innerHTML = "💚 <b>Thiệp cưới đã mở</b> • Bấm nút bên dưới để vào lễ cưới 💚";
          }
        }
      }

      // GIAI ĐOẠN 2: Lá thư lơ lửng nhẹ nhàng trước mắt người xem ở chính giữa
      if (state === 2) {
        letterMesh.position.y = 1.75 + Math.sin(elapsedTime * 1.5) * 0.03;
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
