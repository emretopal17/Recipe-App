const mealsEl = document.getElementById('meals');
const favoriteContainer = document.getElementById('fav-container');
const searchTerm = document.getElementById("search-term");
const saerchBtn = document.getElementById("search");
const mealPopup = document.getElementById("meal-popup");
const popupCloseBtn = document.getElementById("close-popup");
const mealInfoEl = document.getElementById('meal-info');
const meals = document.getElementById('meals');


getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const respData = await resp.json();
    const randomMeal = respData.meals[0];

    addMeal(randomMeal, true);
}

async function getMealById(id) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id);
    const respData = await resp.json();
    const meal = respData.meals[0];
    return meal;

}

async function getMealBySearch(term) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + term);
    const respData = await resp.json();
    const meals = respData.meals;
    return meals;

}

function addMeal(mealData, random = false) {
    
    const meal = document.createElement('div');
    meal.classList.add('meal');
    meal.innerHTML = `
     
    <div class="meal-header">
        ${random ? `
        <div class="random">
        Random Recipe
        </div>` : ""}
        <img id="favImg" src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    </div>
    <div class="meal-body">
        <h4>${mealData.strMeal}</h4>
        <button class="fav-button"><i class="fa fa-heart"></i></button>
    </div>
 
    `;

    const favBtn = meal.querySelector(".meal-body .fav-button");
    favBtn.addEventListener("click", () => {
        if (favBtn.classList.contains('active')) {
            removeMealLS(mealData.idMeal);
            favBtn.classList.remove('active');
        } else {
            addMealLS(mealData.idMeal);
            favBtn.classList.add('active');
        }

        fetchFavMeals();
    })

    meals.appendChild(meal);
    
    const favImg = document.getElementById('favImg');
    favImg.addEventListener("click", () => { // meal.addEvnt..
        showMealInfo(mealData);
    })

   
}

function addMealLS(mealId) {
    const mealIds = getMealsLS();
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

function removeMealLS(mealId) {
    const mealIds = getMealsLS();
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter((id) => id !== mealId)));
}

function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
    const mealIds = getMealsLS();
    //clean the container
    favoriteContainer.innerHTML = "";
    const meals = [];
    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);
        addMealToFav(meal);
    }
}

function addMealToFav(mealData) {
    const favMeal = document.createElement('li');

    favMeal.innerHTML = `
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    <span>${mealData.strMeal}</span>
    <button class="clear"><i class="fas fa-window-close"></i></button>
 
    `;
    const clearBtn = favMeal.querySelector('.clear');
    clearBtn.addEventListener("click", () => {
        removeMealLS(mealData.idMeal);
        fetchFavMeals();
    });
    const imgSmall =favMeal.querySelector('img')
    imgSmall.addEventListener("click",() => {
        showMealInfo(mealData);
    })

    favoriteContainer.appendChild(favMeal);
}
function showMealInfo(mealData) {
    //clean it up
    mealInfoEl.innerHTML = "";
    //uodate to meal info
    const mealEl = document.createElement("div");
    const ingredients = [];
    //get ingredients and measures
    for (let i = 1; i <= 20; i++) {
        if (mealData['strIngredient'+i]) {
            ingredients.push(`${mealData['strIngredient'+i]} / ${mealData['strMeasure'+i]} `);

        } else {
            break;
        }
    }
    mealEl.classList.add("box1");

    mealEl.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <img src="${mealData.strMealThumb}" alt="">

    <p>
    ${mealData.strInstructions}
    </p>
    <h3> Ingredients : </h3>
    <ul>
     ${ingredients.map((ing) => `
        <li> ${ing}</li>
    `).join('')}
     </ul>
    `;
    mealInfoEl.appendChild(mealEl);

    //show the pop up
    mealPopup.classList.remove('hidden');
}

saerchBtn.addEventListener("click", async () => {
    //clean container
    mealsEl.innerHTML = "";

    const search = searchTerm.value;
    const meals = await getMealBySearch(search);
    if (meals) {
        meals.forEach((meal) => {
            addMeal(meal);

        });

    }


})

popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add("hidden");

})



