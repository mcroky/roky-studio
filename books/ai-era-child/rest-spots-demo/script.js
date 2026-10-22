const places = [
  { name: "A", shade: true, seat: true, rain: false },
  { name: "B", shade: false, seat: true, rain: true },
  { name: "C", shade: true, seat: false, rain: true },
];

const labels = { shade: "그늘", seat: "앉을 곳", rain: "비를 피할 곳" };

function scorePlace(place, selected) {
  return selected.filter((condition) => place[condition] === true).length;
}

function rankPlaces(selected) {
  return places
    .map((place) => ({ ...place, score: scorePlace(place, selected) }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

function render() {
  const selected = [...document.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
  const summary = document.getElementById("summary");
  const results = document.getElementById("results");
  results.replaceChildren();

  if (selected.length === 0) {
    summary.textContent = "조건을 하나 이상 선택해 주세요.";
    return;
  }

  summary.textContent = `${selected.length}개 조건을 선택했습니다. 일치하는 조건이 많은 순서로 보여 줍니다.`;
  for (const place of rankPlaces(selected)) {
    const card = document.createElement("article");
    card.className = "card";
    const title = document.createElement("h3");
    title.textContent = `장소 ${place.name}`;
    const score = document.createElement("div");
    score.className = "score";
    score.textContent = `${place.score} / ${selected.length}`;
    const list = document.createElement("ul");
    list.className = "features";
    for (const key of Object.keys(labels)) {
      const item = document.createElement("li");
      item.textContent = `${labels[key]}: ${place[key] ? "있음" : "없음"}`;
      list.append(item);
    }
    card.append(title, score, list);
    results.append(card);
  }
}

if (typeof document !== "undefined") {
  document.querySelectorAll('input[type="checkbox"]').forEach((input) => input.addEventListener("change", render));
  render();
}

if (typeof module !== "undefined") module.exports = { places, scorePlace, rankPlaces };
