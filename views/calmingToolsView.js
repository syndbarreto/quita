import { getCurrentUser, getAuthToken } from "../models/AuthModel.js";

const currentUser = await fetch(`http://localhost:3000/users/${getCurrentUser()?.id || 1}`, {
  headers: {
    "Authorization": `Bearer ${getAuthToken()}`
  }
})
  .then(response => response.json())
    .catch(error => {
      console.error("Error loading user:", error);
      return null;
    });

function getCurrentUser2() { 
    return currentUser;
}

const userId = currentUser ? currentUser.id : 1;

// get calmingTools.json data and display it in the search results list
fetch('./calmingTools.json')
  .then(response => response.json())
  .then(data => {
    const searchResultsList = document.getElementById('searchResultsList');
    const favsResultsList = document.getElementById('favsResultsList');

    let todoOHTML = '';
    let todoOHTML2 = '';
    let categoryHTML = {
        breathing: '',
        quotes: '',
        grounding: '',
        sounds: ''
    };

    data.tools.forEach(tool => {
        todoOHTML += `
        <div class="result-card" data-name="${tool.name.toLowerCase()}" data-category="${tool.category}">
            <div class="result-info">
                <img class="result-image" src="${tool.imageUrl || 'https://placehold.co/72x72'}" alt="${tool.name}">
                <div class="result-text">
                    <h3 class="result-title">${tool.name}</h3>
                    <p class="result-author">${tool.description || ''}</p>
                </div>
            </div>
        </div>
        `;

        // if tool belongs to user favorites, also add it to the favorites results list with a like button
        if (currentUser?.favTools?.includes(String(tool.id))) {
            todoOHTML2 += `
            <div class="result-card" data-name="${tool.name.toLowerCase()}" data-category="${tool.category}">
                <div class="result-info">
                    <img class="result-image" src="${tool.imageUrl || 'https://placehold.co/72x72'}" alt="${tool.name}">
                    <div class="result-text">
                        <h3 class="result-title">${tool.name}</h3>
                        <p class="result-author">${tool.description || ''}</p>
                    </div>
                </div>
                <button class="favorite-btn" type="button" aria-label="Favorite" onclick="addLike(this)" data-id="${tool.id}">
                    <img src="./assets/like-active.svg" alt="Favorite">
                </button>
            </div>
            `;
        }
        else {
            todoOHTML2 += `
            <div class="result-card" data-name="${tool.name.toLowerCase()}" data-category="${tool.category}">
                <div class="result-info">
                    <img class="result-image" src="${tool.imageUrl || 'https://placehold.co/72x72'}" alt="${tool.name}">
                    <div class="result-text">
                        <h3 class="result-title">${tool.name}</h3>
                        <p class="result-author">${tool.description || ''}</p>
                    </div>
                </div>
                <button class="favorite-btn" type="button" aria-label="Favorite" onclick="addLike(this)" data-id="${tool.id}">
                    <img src="./assets/like.svg" alt="Favorite">
                </button>
            </div>
            `;
        }

        
        const isLiked = currentUser?.favTools?.includes(String(tool.id));
        const heartIcon = isLiked ? './assets/like-active.svg' : './assets/like.svg';
        const activeClass = isLiked ? 'active' : '';

        const categoryCardHTML = `
        <div class="result-card" data-name="${tool.name.toLowerCase()}" data-category="${tool.category}">
            <div class="result-info">
                <img class="result-image" src="${tool.imageUrl || 'https://placehold.co/72x72'}" alt="${tool.name}">
                <div class="result-text">
                    <h3 class="result-title">${tool.name}</h3>
                    <p class="result-author">${tool.description || ''}</p>
                </div>
            </div>
            <button class="favorite-btn ${activeClass}" type="button" aria-label="Favorite" onclick="addLike(this)" data-id="${tool.id}">
                <img src="${heartIcon}" alt="Favorite">
            </button>
        </div>
        `;

        
        if (tool.category && categoryHTML[tool.category] !== undefined) {
            categoryHTML[tool.category] += categoryCardHTML;
        }

    });

    searchResultsList.innerHTML = todoOHTML;
    favsResultsList.innerHTML = todoOHTML2;
    
    // Injeta automaticamente o HTML nas listas de categorias que existirem na página
    Object.keys(categoryHTML).forEach(category => {
        const listElement = document.getElementById(`${category}ResultsList`);
        if (listElement) {
            listElement.innerHTML = categoryHTML[category];
        }
    });
  })
  .catch(error => console.error("Error loading tools:", error));
  
fetch(`http://localhost:3000/users/${userId}`, {
  headers: {
    "Authorization": `Bearer ${getAuthToken()}`
  }
})
  .then(response => response.json())
  .then(user => {
    const favTools = user.favTools || [];
    const addToolsScroll = document.getElementById('addToolsScroll');
    
    favTools.forEach(toolId => {
        // add buttons for each favorite tool in the saved tools view to id addToolsScroll
        addToolsScroll.innerHTML += `
        <button class="add-tool-btn" type="button" onclick="openFavoriteView()">
            <img src="./assets/tool${toolId}.png" alt="Saved Tool" style="opacity: 1; border-radius: 16px; object-fit: cover;">
        </button>
        `;
    });
    
    // fill out the remaining slots with empty buttons until there are at least 5 buttons or 1 empty slot to add more
    const currentButtons = addToolsScroll.querySelectorAll('.add-tool-btn').length;
    const emptySlotsCount = Math.max(5 - currentButtons, 1);
    for (let i = 0; i < emptySlotsCount; i++) {
        addToolsScroll.innerHTML += `
        <button class="add-tool-btn" type="button" onclick="openFavoriteView()">
            <img src="./assets/fixar.svg" alt="Add">
        </button>
        `;
    }
  })
  .catch(error => console.error("Error loading user:", error));

//

document.addEventListener("click", (event) => {
  const openSearchBtn = event.target.closest("[data-open-search]");
  const closeSearchBtn = event.target.closest("[data-close-search]");
  const closeSavedBtn = event.target.closest("[data-close-saved]");
  const filterChip = event.target.closest(".filter-chip");
  const closeInfoBtn = event.target.closest("[data-close-info]");
  const openCategoryBtn = event.target.closest("[data-open-category]");


  const favoriteBtn = event.target.closest(".favorite-btn");
  if (favoriteBtn) {
    favoriteBtn.classList.toggle("active");
  }

  if (openSearchBtn) {
    document.getElementById("searchView").style.display = "flex";
    document.getElementById("calmingToolPage").style.display = "none";
  }

  if (closeSearchBtn) {
    document.getElementById("searchView").style.display = "none";
    document.getElementById("calmingToolPage").style.display = "flex";
  }

  if (closeSavedBtn) {
    document.getElementById("savedToolsView").style.display = "none";
    document.getElementById("calmingToolPage").style.display = "flex";

    // Gets all images marked with "like-active" and extracts the SRC of the respective tool image
    const addToolsScroll = document.querySelector('.add-tools-scroll');
    const likedImages = Array.from(document.querySelectorAll('#favsResultsList .favorite-btn img[src*="like-active.svg"]'))
      .map(icon => icon.closest('.result-card').querySelector('.result-image').src);

    let updatedScrollHTML = '';

    // Creates a button for each saved tool
    likedImages.forEach(imgSrc => {
      updatedScrollHTML += `
        <button class="add-tool-btn" type="button" onclick="openFavoriteView()">
            <img src="${imgSrc}" alt="Saved Tool" style="opacity: 1; border-radius: 16px; object-fit: cover;">
        </button>
      `;
    });

    // Fills the remaining slots (ensures it shows at least 5 buttons or 1 empty slot to add more)
    const emptySlotsCount = Math.max(5 - likedImages.length, 1);
    for (let i = 0; i < emptySlotsCount; i++) {
      updatedScrollHTML += `
        <button class="add-tool-btn" type="button" onclick="openFavoriteView()">
            <img src="./assets/fixar.svg" alt="Add">
        </button>
      `;
    }

    // Updates the home screen bar
    addToolsScroll.innerHTML = updatedScrollHTML;
    updatePinnedTools();
  }

  if (filterChip) {
    const currentView = filterChip.closest(".search-view");
    if (currentView) {
      currentView.querySelectorAll(".filter-chip").forEach(chip => chip.classList.remove("active"));
      filterChip.classList.add("active");
      filterResults(currentView);
    }
  }

  if (openCategoryBtn) {
    const category = openCategoryBtn.dataset.openCategory; 
    const view = document.getElementById(`${category}InfoView`); 
    if (view) {
      view.style.display = "block";
      const mainPage = document.getElementById("calmingToolPage");
      if (mainPage) mainPage.style.display = "none";
    }
  }

  if (closeInfoBtn) {
    const currentInfoView = event.target.closest("main");
    if (currentInfoView) currentInfoView.style.display = "none";
    
    document.getElementById("calmingToolPage").style.display = "flex";
  }
});

function openFavoriteView() { 
  document.getElementById("savedToolsView").style.display = "flex";
  document.getElementById("calmingToolPage").style.display = "none";
}

function updatePinnedTools() {
  const addToolsScroll = document.querySelector('.add-tools-scroll');
  if (!addToolsScroll) return;

  const likedImages = Array.from(document.querySelectorAll('#favsResultsList .favorite-btn img[src*="like-active.svg"]'))
    .map(icon => icon.closest('.result-card').querySelector('.result-image').src);

  let updatedScrollHTML = '';

  likedImages.forEach(imgSrc => {
    updatedScrollHTML += `
      <button class="add-tool-btn" type="button" onclick="openFavoriteView()">
          <img src="${imgSrc}" alt="Saved Tool" style="opacity: 1; border-radius: 16px; object-fit: cover;">
      </button>
    `;
  });

  const emptySlotsCount = Math.max(5 - likedImages.length, 1);
  for (let i = 0; i < emptySlotsCount; i++) {
    updatedScrollHTML += `
      <button class="add-tool-btn" type="button" onclick="openFavoriteView()">
          <img src="./assets/fixar.svg" alt="Add">
      </button>
    `;
  }

  addToolsScroll.innerHTML = updatedScrollHTML;
}

function addLike(button) {
  const img = button.querySelector("img");
  const toolId = String(button.dataset.id);
  const isLiking = img.src.includes("like.svg");

  document.querySelectorAll(`.favorite-btn[data-id="${toolId}"]`).forEach(btn => {
    const btnImg = btn.querySelector("img");
    if (isLiking) {
      btnImg.src = "./assets/like-active.svg";
      btn.classList.add("active");
    } else {
      btnImg.src = "./assets/like.svg";
      btn.classList.remove("active");
    }
  });

  let updatedFavTools = (currentUser?.favTools ?? []).map(String);
  
  if (isLiking) {
    updatedFavTools = [...new Set([...updatedFavTools, toolId])];
  } else {
    updatedFavTools = updatedFavTools.filter(id => id !== toolId);
  }
  
  if (currentUser) currentUser.favTools = updatedFavTools;

  updatePinnedTools();

  fetch(`http://localhost:3000/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify({
      favTools: updatedFavTools,
    }),
  }).catch(error => console.error("Error updating favorites:", error));
}

// Helper function to filter results based on search input and active category
function filterResults(view) {
  const query = (view.querySelector("input.search-input-wrapper")?.value || "").toLowerCase().trim();
  const activeChip = view.querySelector(".filter-chip.active .chip-text");
  const selectedCategory = activeChip ? activeChip.textContent.toLowerCase().trim() : "all";

  const resultCards = view.querySelectorAll(".result-card");

  resultCards.forEach(card => {
    const name = card.dataset.name || "";
    const category = card.dataset.category || "";

    const matchesSearch = name.includes(query) || category.includes(query);
    const matchesCategory = selectedCategory === "all" || category === selectedCategory;

    // Shows the card if both the search text and selected category match
    if (matchesSearch && matchesCategory) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

// Event listener for when the user types in the search input
document.addEventListener("input", (event) => {
  if (event.target.matches("input.search-input-wrapper")) {
    const currentView = event.target.closest(".search-view");
    if (currentView) {
      filterResults(currentView);
    }
  }
});
window.filterResults = filterResults;
window.addLike = addLike;
window.openFavoriteView = openFavoriteView;
