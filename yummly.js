var userIngredientArray = [];
var numberIngredients = 0;
var maxIngredients = 3;
var maxRecipes = 9;
var recipeID = [];
var recipeNames = [];
var latitude;
var longitude;
var map;

function checkUser () {
  if (userIngredientArray.length > 0) {
    console.log(userIngredientArray.length);
    return true;
  } else {
    return false;
  }
};
function buildIngredientURL (array) {
  var searchquery = "&allowedIngredient[]=";
  var ingredientArray = array;

  for (var i = 0; i < ingredientArray.length; i++) {
    if (i < ingredientArray.length - 1) {
      searchquery += ingredientArray[i];
      searchquery += "&allowedIngredient[]=";
    } else {
      searchquery += ingredientArray[i];
    }
  }
  return searchquery;
};
function createIngredientList () {
  $("#ingredient-area > tbody").empty();

  for (var i = 0; i < userIngredientArray.length; i++) {
    $("#ingredient-area > tbody").append("<tr><td><button class='remove' data-value=" + userIngredientArray[i] + "> X </button> " + userIngredientArray[i] + "</td></tr>");
  }
};
function initMap () {
  $("#recipe-area").empty();
  navigator.geolocation.getCurrentPosition(function (position) {
    latitude = (position.coords.latitude);
    longitude = (position.coords.longitude);
    console.log("lat: " + latitude + " lng: " + longitude);
    var mapOptions = {
      center: { lat: latitude, lng: longitude },
      zoom: 15
    };
    map = new google.maps.Map(document.getElementById("recipe-area"), mapOptions);
    var request = {
      location: mapOptions.center,
      radius: "2000",
      type: ["restaurant"]
    };
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
  }, function () {
    alert("Error");
  });
};

function callback (results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {

    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      createMarker(results[i]);
    }
  }
};
function createMarker (place) {
  var placeLoc = place.geometry.location;
  var infowindow = new google.maps.InfoWindow();
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, "mouseover", function () {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}

$(document).ready(function () {
  $("#ingredient-input").on("click", function (event) {
    event.preventDefault();

    var userIngredient = $("#ingredient-name-input").val().trim();

    if (userIngredient !== "" && numberIngredients < maxIngredients) {
      userIngredientArray.push(userIngredient);
      createIngredientList();
      numberIngredients++;
      $("#ingredient-name-input").val("");
    } else {
      $("#ingredient-name-input").val("");
    }
  });

  $(document).on("click", ".remove", function () {
    var removeItem = $(this).attr("data-value");
    var index = userIngredientArray.indexOf(removeItem);

    userIngredientArray.splice(index, 1);
    createIngredientList();
    numberIngredients--;
  });

  $("#search-recipe").on("click", function () {
    $("#recipe-area").empty();
    // var appID = "1178d920";
    // var apiKEY = "9444249c26105ff9651c6b6d9088c564";
    // var userStr = buildIngredientURL(userIngredientArray);
    // var queryURL = "https://api.yummly.com/v1/api/recipes?_app_id=" + appID + "&_app_key=" + apiKEY + userStr;

    recipeID = [];
    recipeNames = [];

    if (checkUser()) {
      $.ajax({
        url: "./Files-JSON/data.json",
        // url: queryURL,
        method: "GET",
        dataType: "json",
        async: false
      })
        .done(function (response) {
          var results = response;
          var numRecipe = Math.min(maxRecipes, response.matches.length);
          var attributionDiv = $("<div>");

          attributionDiv.html(results.attribution.html);

          $("recipe-area").empty();
          for (var i = 0; i < numRecipe; i++) {
            recipeID.push(results.matches[i].id);
            recipeNames.push(results.matches[i].recipeName);

            var recipeDiv = $("<div class='recipe-display col s4'>");
            var recipeImg = $("<img>");
            var recipeLink = $("<a>");
            var recipeNameDisp = $("<p>");
            // var newURL = "https://api.yummly.com/v1/api/recipe/" + recipeID[i] + "?_app_id=" + appID + "&_app_key=" + apiKEY;

            $.ajax({
              url: "./Files-JSON/recipe0" + (i + 1) + ".json",
              // url: newURL,
              method: "GET",
              dataType: "json",
              async: false
            })
              .done(function (response) {
                var recipeResults = response;

                recipeImg.attr("src", recipeResults.images[0].imageUrlsBySize["360"]);
                recipeLink.attr("href", recipeResults.source.sourceRecipeUrl);
                recipeLink.attr("target", "_blank");
                recipeNameDisp.text(recipeResults.source.sourceDisplayName + ": " + recipeResults.name);

                recipeLink.append(recipeNameDisp);
                recipeLink.append(recipeImg);
                recipeDiv.append(recipeLink);
              });

            $("#recipe-area").prepend(recipeDiv);
          }
          $("#recipe-area").append(attributionDiv);
        });
    } else {
      alert("Please enter at least one ingredient.");
    }
  });

  $("#search-rest").on("click", initMap);
});
