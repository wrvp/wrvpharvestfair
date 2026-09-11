/**
 * Photo competition form:
 * - Any image type, 1–3 photos
 * - Rename files to Name_1.ext, Name_2.ext, … (extension preserved when possible)
 * - Keep quality high; only re-encode if the whole request would exceed Netlify’s ~8MB form limit
 */
(function () {
  const form = document.querySelector('form[name="photo-competition"]');
  if (!form) return;

  const statusEl = document.getElementById("photo-form-status");
  const submitBtn = document.getElementById("photo-submit");
  const MAX_REQUEST_BYTES = 7.5 * 1024 * 1024;
  const host = window.location.hostname;
  const onNetlify =
    host.endsWith("netlify.app") ||
    host.includes("harvestfair") ||
    host.includes("wrvp");

  function setStatus(message, isError) {
    if (!statusEl) return;
    statusEl.hidden = !message;
    statusEl.textContent = message || "";
    statusEl.classList.toggle("is-error", Boolean(isError));
  }

  function sanitizeName(raw) {
    const cleaned = String(raw || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "")
      .slice(0, 40);
    return cleaned || "Entrant";
  }

  function isImage(file) {
    if (!file) return false;
    const type = (file.type || "").toLowerCase();
    if (type.startsWith("image/")) return true;
    return /\.(jpe?g|png|gif|webp|heic|heif|tif|tiff|bmp|avif)$/i.test(file.name || "");
  }

  function extensionFor(file, forceJpeg) {
    if (forceJpeg) return "jpg";
    const fromName = (file.name || "").match(/\.([a-z0-9]+)$/i);
    if (fromName) return fromName[1].toLowerCase().replace("jpeg", "jpg");
    const type = (file.type || "").toLowerCase();
    if (type === "image/jpeg" || type === "image/jpg") return "jpg";
    if (type === "image/png") return "png";
    if (type === "image/gif") return "gif";
    if (type === "image/webp") return "webp";
    if (type === "image/heic" || type === "image/heif") return "heic";
    if (type === "image/tiff") return "tiff";
    if (type === "image/bmp") return "bmp";
    if (type === "image/avif") return "avif";
    return "jpg";
  }

  function readAsImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read image"));
      };
      img.src = url;
    });
  }

  async function encodeJpeg(file, maxEdge, quality) {
    const img = await readAsImage(file);
    let { width, height } = img;
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob) throw new Error("Could not encode image");
    return blob;
  }

  async function prepareFile(file, person, index) {
    const smallEnough =
      file.size <= MAX_REQUEST_BYTES / 2 && file.size <= 5 * 1024 * 1024;

    if (smallEnough) {
      const ext = extensionFor(file, false);
      return new File([file], `${person}_${index}.${ext}`, {
        type: file.type || "application/octet-stream",
        lastModified: file.lastModified,
      });
    }

    const attempts = [
      { maxEdge: 4500, quality: 0.92 },
      { maxEdge: 3600, quality: 0.88 },
      { maxEdge: 3000, quality: 0.85 },
      { maxEdge: 2400, quality: 0.82 },
    ];

    let best = null;
    for (const attempt of attempts) {
      const blob = await encodeJpeg(file, attempt.maxEdge, attempt.quality);
      best = blob;
      if (blob.size <= 4.5 * 1024 * 1024) break;
    }

    return new File([best], `${person}_${index}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  }

  function assignFile(input, file) {
    const transfer = new DataTransfer();
    if (file) transfer.items.add(file);
    input.files = transfer.files;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    const nameInput = form.elements.namedItem("name");
    const email = String(form.elements.namedItem("email")?.value || "").trim();
    const person = sanitizeName(nameInput?.value);
    const slots = [1, 2, 3].map((n) => ({
      n,
      input: form.elements.namedItem(`photo_${n}`),
      caption: form.elements.namedItem(`caption_${n}`),
    }));

    const selected = slots.filter((slot) => slot.input?.files?.[0]);
    if (!selected.length) {
      setStatus("Please upload at least one photo.", true);
      return;
    }

    for (const slot of selected) {
      const file = slot.input.files[0];
      if (!isImage(file)) {
        setStatus("Please upload image files only.", true);
        return;
      }
    }

    slots.forEach((slot) => {
      if (!slot.input?.files?.length) {
        assignFile(slot.input, null);
        if (slot.caption) slot.caption.value = "";
      }
    });

    submitBtn.disabled = true;
    setStatus("Preparing your photos…");

    try {
      const prepared = [];
      for (const slot of selected) {
        const original = slot.input.files[0];
        const file = await prepareFile(original, person, slot.n);
        prepared.push({ slot, file });
      }

      let total = prepared.reduce((sum, item) => sum + item.file.size, 0);
      if (total > MAX_REQUEST_BYTES) {
        for (const item of prepared) {
          const blob = await encodeJpeg(item.file, 2200, 0.8);
          const base = item.file.name.replace(/\.[^.]+$/, "");
          item.file = new File([blob], `${base}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
        }
        total = prepared.reduce((sum, item) => sum + item.file.size, 0);
      }

      if (total > MAX_REQUEST_BYTES) {
        setStatus(
          "Those photos are still too large to send together. Try 1–2 photos, or slightly smaller files.",
          true
        );
        submitBtn.disabled = false;
        return;
      }

      prepared.forEach(({ slot, file }) => assignFile(slot.input, file));

      let subject = form.querySelector('input[name="subject"]');
      if (!subject) {
        subject = document.createElement("input");
        subject.type = "hidden";
        subject.name = "subject";
        form.appendChild(subject);
      }
      subject.setAttribute("data-remove-prefix", "");
      subject.value = `Photo competition — ${nameInput.value.trim()}${
        email ? ` <${email}>` : ""
      } · ${prepared.length} photo${prepared.length > 1 ? "s" : ""}`;

      if (!onNetlify) {
        setStatus("Local preview only — deploy to Netlify to submit entries.");
        window.location.href = "confirmation.html";
        return;
      }

      setStatus("Uploading your entry…");
      form.submit();
    } catch (err) {
      console.error(err);
      setStatus("Something went wrong preparing your photos. Please try again.", true);
      submitBtn.disabled = false;
    }
  });
})();
