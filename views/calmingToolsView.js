import { getCurrentUser } from "../services/auth-service.js";
import { getCalmingTools } from "../services/tools-service.js";
import { getUserRecord, updateUserRecord } from "../services/api-service.js";

const authUser = getCurrentUser();
let currentUser = null;

if (authUser?.id) {
  currentUser = await getUserRecord(authUser.id).catch(error => {
    console.error("Error loading user:", error);
    return null;
  });
}

const userId = currentUser?.id ?? authUser?.id;

// get calming tools data and display it in the search results list
getCalmingTools()
  .then(tools => {
    const searchResultsList = document.getElementById('searchResultsList');
    const favsResultsList = document.getElementById('favsResultsList');

    let todoOHTML = '';
    let todoOHTML2 = '';
    const favoriteIds = (currentUser?.favTools ?? []).map(Number);

    tools.forEach(tool => {
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
        if (favoriteIds.includes(Number(tool.id))) {
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


    });

    searchResultsList.innerHTML = todoOHTML;
    favsResultsList.innerHTML = todoOHTML2;
  })
  .catch(error => console.error("Error loading tools:", error));
  
Promise.resolve(currentUser)
  .then(user => {
    const favTools = (user?.favTools || []).map(Number);
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
  }

  if (filterChip) {
    const currentView = filterChip.closest(".search-view");
    if (currentView) {
      currentView.querySelectorAll(".filter-chip").forEach(chip => chip.classList.remove("active"));
      filterChip.classList.add("active");
      filterResults(currentView);
    }
  }
});

function openFavoriteView() {
  document.getElementById("savedToolsView").style.display = "flex";
  document.getElementById("calmingToolPage").style.display = "none";
}

function addLike(button) {
    if (!userId) {
      return;
    }

    // toggle between like.svg and like-active.svg
    const img = button.querySelector("img");
    const toolId = Number(button.dataset.id);
    if (img.src.includes("like.svg")) {
        img.src = "./assets/like-active.svg";

        const updatedFavTools = [...new Set([...(currentUser?.favTools ?? []).map(Number), toolId])];
        if (currentUser) currentUser.favTools = updatedFavTools;

        // add chosen calming tool to user's favTools in db.json
        updateUserRecord(userId, {
          favTools: updatedFavTools,
        })
        .catch(error => console.error("Error adding tool to favorites:", error));

    } else {
        img.src = "./assets/like.svg";

        const updatedFavTools = (currentUser?.favTools ?? []).map(Number).filter(id => id !== toolId);
        if (currentUser) currentUser.favTools = updatedFavTools;

        // remove chosen calming tool from user's favTools in db.json
        updateUserRecord(userId, {
          favTools: updatedFavTools,
        })
        .catch(error => console.error("Error removing tool from favorites:", error));       
    }
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

//
