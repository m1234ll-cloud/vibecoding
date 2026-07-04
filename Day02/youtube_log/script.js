const STORAGE_KEY = "youtube_log_entries_v1";

const entryForm = document.getElementById("entryForm");
const urlInput = document.getElementById("urlInput");
const clearInputButton = document.getElementById("clearInputButton");
const formHint = document.getElementById("formHint");
const videoList = document.getElementById("videoList");
const emptyState = document.getElementById("emptyState");
const totalCount = document.getElementById("totalCount");
const doneCount = document.getElementById("doneCount");
const clearAllButton = document.getElementById("clearAllButton");

let entries = loadEntries();
const pendingTitleRequests = new Set();

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function isYouTubeUrl(value) {
  try {
    const url = new URL(value);
    const isYouTubeDomain =
      url.hostname === "youtu.be" ||
      url.hostname.endsWith(".youtube.com") ||
      url.hostname === "youtube.com" ||
      url.hostname.endsWith("youtube.com");

    if (!isYouTubeDomain) {
      return false;
    }

    return getYouTubeVideoId(value).length > 0;
  } catch {
    return false;
  }
}

function getFallbackVideoTitle(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes("youtu.be")
      ? `YouTube 영상 (${parsed.pathname.replace("/", "") || "링크"})`
      : `YouTube 영상 (${parsed.searchParams.get("v") || parsed.pathname || "링크"})`;
  } catch {
    return "YouTube 영상";
  }
}

function getYouTubeVideoId(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.replace("/", "").split("/")[0] || "";
    }

    if (parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname.split("/")[2] || "";
    }

    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname.split("/")[2] || "";
    }

    return parsed.searchParams.get("v") || "";
  } catch {
    return "";
  }
}

function getFallbackThumbnailUrl(url) {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";
}

async function fetchYouTubeMetadata(url) {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`oEmbed request failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    title: typeof data.title === "string" && data.title.trim() ? data.title.trim() : getFallbackVideoTitle(url),
    thumbnailUrl: typeof data.thumbnail_url === "string" && data.thumbnail_url.trim()
      ? data.thumbnail_url.trim()
      : getFallbackThumbnailUrl(url),
  };
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function updateSummary() {
  totalCount.textContent = String(entries.length);
  doneCount.textContent = String(entries.filter((entry) => entry.done).length);
}

function setHint(message, isError = false) {
  formHint.textContent = message;
  formHint.style.color = isError ? "#cc1818" : "";
}

function openVideo(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function upsertEntry(id, patch) {
  entries = entries.map((entry) => {
    if (entry.id !== id) {
      return entry;
    }

    return {
      ...entry,
      ...patch,
      updatedAt: Date.now(),
    };
  });
}

async function loadTitleForEntry(id) {
  const entry = entries.find((item) => item.id === id);
  if (!entry) {
    return;
  }

  if (entry.title && entry.titleStatus === "ready" && entry.thumbnailUrl && entry.thumbnailStatus === "ready") {
    return;
  }

  if (pendingTitleRequests.has(id)) {
    return;
  }

  pendingTitleRequests.add(id);

  try {
    const metadata = await fetchYouTubeMetadata(entry.url);
    upsertEntry(id, {
      title: metadata.title,
      titleStatus: "ready",
      thumbnailUrl: metadata.thumbnailUrl,
      thumbnailStatus: "ready",
    });
  } catch {
    upsertEntry(id, {
      title: getFallbackVideoTitle(entry.url),
      titleStatus: "error",
      thumbnailUrl: getFallbackThumbnailUrl(entry.url),
      thumbnailStatus: "error",
    });
  }

  pendingTitleRequests.delete(id);
  saveEntries();
  render();
}

function hydrateMissingTitles() {
  entries.forEach((entry) => {
    if (!entry.title || !entry.thumbnailUrl || entry.titleStatus === "loading" || entry.thumbnailStatus === "loading") {
      loadTitleForEntry(entry.id);
    }
  });
}

function toggleDone(id) {
  upsertEntry(id, {
    done: !entries.find((entry) => entry.id === id)?.done,
  });
  saveEntries();
  render();
}

function deleteEntry(id) {
  entries = entries.filter((entry) => entry.id !== id);
  saveEntries();
  render();
}

function clearAllEntries() {
  const confirmed = window.confirm("저장된 모든 기록을 삭제할까요?");
  if (!confirmed) {
    return;
  }

  entries = [];
  saveEntries();
  render();
  setHint("모든 기록을 삭제했습니다.");
}

function createEntryElement(entry) {
  const item = document.createElement("li");
  item.className = `item${entry.done ? " done" : ""}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "checkbox";
  checkbox.checked = entry.done;
  checkbox.setAttribute("aria-label", "학습 완료 표시");
  checkbox.addEventListener("change", () => toggleDone(entry.id));

  const thumbnailWrap = document.createElement("div");
  thumbnailWrap.className = "thumbnail-wrap";

  const thumbnail = document.createElement("img");
  thumbnail.className = "thumbnail";
  thumbnail.alt = entry.title && entry.titleStatus === "ready" ? entry.title : "유튜브 썸네일";
  thumbnail.loading = "lazy";
  thumbnail.decoding = "async";
  thumbnail.src = entry.thumbnailUrl || getFallbackThumbnailUrl(entry.url) || "";
  thumbnail.addEventListener("error", () => {
    const fallbackThumb = getFallbackThumbnailUrl(entry.url);
    if (fallbackThumb && thumbnail.src !== fallbackThumb) {
      thumbnail.src = fallbackThumb;
      return;
    }

    thumbnail.classList.add("thumbnail-fallback");
    thumbnail.removeAttribute("src");
  });

  if (!thumbnail.src) {
    thumbnail.classList.add("thumbnail-fallback");
  }

  thumbnailWrap.appendChild(thumbnail);

  const main = document.createElement("div");
  main.className = "item-main";

  const title = document.createElement("p");
  title.className = "item-title";
  title.textContent = entry.title || getFallbackVideoTitle(entry.url);

  if (entry.titleStatus === "loading") {
    title.textContent = "제목을 불러오는 중...";
  } else if (entry.titleStatus === "error") {
    title.textContent = `${title.textContent} (제목 불러오기 실패)`;
  }

  const link = document.createElement("a");
  link.className = "item-url";
  link.href = entry.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = entry.url;
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openVideo(entry.url);
  });

  const meta = document.createElement("div");
  meta.className = "item-meta";
  const titleStateText = entry.titleStatus === "error" ? " / 제목 불러오기 실패" : "";
  meta.textContent = `등록 ${formatDate(entry.createdAt)}${titleStateText}${entry.updatedAt !== entry.createdAt ? ` / 수정 ${formatDate(entry.updatedAt)}` : ""}`;

  main.appendChild(title);
  main.appendChild(link);
  main.appendChild(meta);

  const actions = document.createElement("div");
  actions.className = "item-actions";

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.className = "icon-button";
  openButton.textContent = "열기";
  openButton.addEventListener("click", () => openVideo(entry.url));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "icon-button";
  deleteButton.textContent = "삭제";
  deleteButton.addEventListener("click", () => deleteEntry(entry.id));

  actions.appendChild(openButton);
  actions.appendChild(deleteButton);

  item.appendChild(checkbox);
  item.appendChild(thumbnailWrap);
  item.appendChild(main);
  item.appendChild(actions);

  return item;
}

function render() {
  videoList.innerHTML = "";

  if (entries.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  entries
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((entry) => {
      videoList.appendChild(createEntryElement(entry));
    });

  updateSummary();
}

entryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const url = urlInput.value.trim();
  const videoId = getYouTubeVideoId(url);
  if (!url) {
    setHint("URL을 입력해 주세요.", true);
    urlInput.focus();
    return;
  }

  if (!isYouTubeUrl(url)) {
    setHint("유튜브 영상 링크만 저장할 수 있습니다.", true);
    urlInput.focus();
    return;
  }

  const isDuplicate = entries.some((entry) => getYouTubeVideoId(entry.url) === videoId);
  if (isDuplicate) {
    setHint("이미 저장된 영상입니다.", true);
    urlInput.focus();
    return;
  }

  entries.push({
    id: crypto.randomUUID(),
    url,
    videoId,
    title: "제목을 불러오는 중...",
    titleStatus: "loading",
    thumbnailUrl: getFallbackThumbnailUrl(url),
    thumbnailStatus: "loading",
    done: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  saveEntries();
  render();
  entryForm.reset();
  urlInput.focus();
  setHint("저장했습니다.");
  loadTitleForEntry(entries[entries.length - 1].id);
});

clearAllButton.addEventListener("click", clearAllEntries);

clearInputButton.addEventListener("click", () => {
  urlInput.value = "";
  urlInput.focus();
  setHint("URL 입력을 지웠습니다.");
});

render();
hydrateMissingTitles();
