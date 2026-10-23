const projectGrid = document.querySelector('.project-grid');
const projectCards = [...projectGrid.querySelectorAll('.project-card')];
const projectControls = document.getElementById('project-controls');
const projectFilters = document.getElementById('project-filters');
const projectSearch = document.getElementById('project-search');
const projectResultCount = document.getElementById('project-result-count');
const projectEmpty = document.getElementById('project-empty');

if (projectCards.length) {
  const total = String(projectCards.length).padStart(2, '0');
  document.getElementById('hero-project-count').textContent = total;
  document.getElementById('project-range').textContent = `01 — ${total}`;

  const categories = ['전체', ...new Set(projectCards.map((card) => card.dataset.category).filter(Boolean))];
  let activeCategory = '전체';

  for (const category of categories) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'project-filter';
    button.textContent = category;
    button.setAttribute('aria-pressed', String(category === activeCategory));
    button.addEventListener('click', () => {
      activeCategory = category;
      projectFilters.querySelectorAll('button').forEach((filter) => {
        filter.setAttribute('aria-pressed', String(filter === button));
      });
      updateProjects();
    });
    projectFilters.append(button);
  }

  function updateProjects() {
    const query = projectSearch.value.trim().toLocaleLowerCase('ko');
    let visible = 0;

    for (const card of projectCards) {
      const matchesCategory = activeCategory === '전체' || card.dataset.category === activeCategory;
      const matchesSearch = !query || card.textContent.toLocaleLowerCase('ko').includes(query);
      card.hidden = !(matchesCategory && matchesSearch);
      if (!card.hidden) visible += 1;
    }

    projectResultCount.textContent = `${visible}개 프로젝트${visible === projectCards.length ? '' : ` · 전체 ${projectCards.length}개`}`;
    projectEmpty.hidden = visible !== 0;
    projectGrid.classList.toggle('project-grid-dense', visible >= 5);
  }

  projectSearch.addEventListener('input', updateProjects);
  projectControls.hidden = false;
  projectResultCount.hidden = false;
  updateProjects();
}
