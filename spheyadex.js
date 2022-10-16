let typeButtons;
let results;
let move1;
let move2;
let move3;
let move4;
let ability;

let loaded = false;

let didIncludeMove1 = false;
let didIncludeMove2 = false;
let didIncludeMove3 = false;
let didIncludeMove4 = false;
let didIncludeAbility = false;

window.addEventListener("load", (event) => {
    results = document.getElementById("pokemonResults");
    typeButtons = document.getElementsByClassName("typeButton");

    move1 = document.getElementById("move1");
    move2 = document.getElementById("move2");
    move3 = document.getElementById("move3");
    move4 = document.getElementById("move4");

    ability = document.getElementById("ability");

    move1.addEventListener("keyup", (e) => {
        if(didIncludeMove1 != moves.includes(move1.value.toLowerCase()))
            updateResults()
    });
    move1.addEventListener("change", (e) => {
        if(didIncludeMove1 != moves.includes(move1.value.toLowerCase()))
            updateResults()
    });
    move2.addEventListener("keyup", (e) => {
        if(didIncludeMove2 != moves.includes(move2.value.toLowerCase()))
            updateResults()
    });
    move2.addEventListener("change", (e) => {
        if(didIncludeMove2 != moves.includes(move2.value.toLowerCase()))
            updateResults()
    });
    move3.addEventListener("keyup", (e) => {
        if(didIncludeMove3 != moves.includes(move3.value.toLowerCase()))
            updateResults()
    });
    move3.addEventListener("change", (e) => {
        if(didIncludeMove3 != moves.includes(move3.value.toLowerCase()))
            updateResults()
    });
    move4.addEventListener("keyup", (e) => {
        if(didIncludeMove4 != moves.includes(move4.value.toLowerCase()))
            updateResults()
    });
    move4.addEventListener("change", (e) => {
        if(didIncludeMove4 != moves.includes(move4.value.toLowerCase()))
            updateResults()
    });
    ability.addEventListener("keyup",  (e) => {
        if(didIncludeAbility != abilities.includes(ability.value.toLowerCase()))
            updateResults()
    });
    ability.addEventListener("change", (e) => {
        if(didIncludeAbility != abilities.includes(ability.value.toLowerCase()))
            updateResults()
    });

    autocomplete(move1, moves);
    autocomplete(move2, moves);
    autocomplete(move3, moves);
    autocomplete(move4, moves);

    autocomplete(ability, abilities);

    loaded = true;

    updateResults();
});

async function getPokemonByType(typename) {
    let response = await fetch("https://pokeapi.co/api/v2/type/" + typename);
    let data = await response.json();
    return data.pokemon;
}

async function getPokemonByAbility(abilityname) {
    let response = await fetch("https://pokeapi.co/api/v2/ability/" + abilityname.replace(' ', '-'));
    let data = await response.json();
    return data.pokemon;
}

async function getPokemonByMove(movename) {
    let response = await fetch("https://pokeapi.co/api/v2/move/" + movename.replace(' ', '-'));
    let data = await response.json();

    let additionalPokemon = [];

    for(let i = 0; i < data.learned_by_pokemon.length; i++) {
        for(let j = 0; j < evolutionLines.length; j++) {
            let addToPokemon = false;
            for(let k = 0; k < evolutionLines[j].length; k++) {
                if(addToPokemon) {
                    additionalPokemon.push({name: evolutionLines[j][k], url: "https://pokeapi.co/api/v2/pokemon/" + pokemonIds[evolutionLines[j][k]] + "/"});
                }

                if(data.learned_by_pokemon[i].name == evolutionLines[j][k]) {
                    addToPokemon = true;
                }
            }
        }
    }

    for(let i = 0; i < additionalPokemon.length; i++) {
        let add = true;
        for(let j = 0; j < data.learned_by_pokemon.length; j++) {
            if(additionalPokemon[i].name == data.learned_by_pokemon[j].name) {
                add = false;
                break;
            }
        }
        if(add){
            data.learned_by_pokemon.push(additionalPokemon[i]);
        }
    }

    if(data.learned_by_pokemon.length > 0) {
        data.learned_by_pokemon.push({name: "smeargle", url: ""});
    }

    return data.learned_by_pokemon;
}

async function showResults(pokemonListPromises) {
    // Make sure the api request is completed
    pokemonLists = await Promise.all(pokemonListPromises);

    // End up with a list that only contains pokemon that appear in every list by counting how much they appear
    let occurances = {};

    for (let i = 0; i < pokemonLists.length; i++) { 
        for (let j = 0; j < pokemonLists[i].length; j++) {
            let pokemon;
            if(pokemonLists[i][j].pokemon === undefined) {
                pokemon = pokemonLists[i][j];
            }else{
                pokemon = pokemonLists[i][j].pokemon;
            }

            let name = pokemon.name;

            if (name in occurances) {
                occurances[name] += 1;
            } else {
                let splitUrl = pokemon.url.split('/');
                let id = splitUrl[splitUrl.length - 2];
                occurances[name] = 1;
            }
        }
    }

    let finalListing = [];
    for(let pokemon in occurances) {
        if(occurances[pokemon] == pokemonLists.length) {
            let id = pokemonIds[pokemon];

            if(id > 0) {
                finalListing.push([displayNames[pokemon], pokemonIds[pokemon], internalPokemonIds[pokemon]]);
            }
        }
    }
    finalListing.sort((a,b) => (a[1] - b[1]));

    // Update the list on the webpage
    results.innerHTML = "";
    for(let i = 0; i < finalListing.length; i++) {
        let pokemon = finalListing[i][0];

        let item = document.createElement("li");
        item.setAttribute("class", "pokemon-entry");
        
        let span = document.createElement("span");
        let img = document.createElement("img");
        img.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/" + finalListing[i][2] + ".png";
        span.setAttribute("class", "pokemon-preview");
        span.appendChild(img);
        item.appendChild(span);

        let textArea = document.createElement("span");
        
        textArea.setAttribute("class", "pokemon-name-area");

        let subText = "";
        if(pokemon.includes(',')) {
            let temp = pokemon.split(',');
            pokemon = temp[0];
            subText = temp[1];
        }

        let txt = document.createElement("p");
        txt.setAttribute("class", "pokemon-name");
        txt.appendChild(document.createTextNode(pokemon));
        textArea.appendChild(txt);

        if(subText != "") {
            let subTxt = document.createElement("p");
            subTxt.setAttribute("class", "pokemon-subtext");
            subTxt.appendChild(document.createTextNode(subText));
            textArea.appendChild(subTxt);
        }

        item.appendChild(textArea);


        let txt2 = document.createElement("p");
        txt2.setAttribute("class", "pokemon-id");
        txt2.appendChild(document.createTextNode("#" +finalListing[i][1]));
        item.appendChild(txt2);

        results.appendChild(item);
    }
}

function updateResults() {
    if (!loaded)
        return;

    // A list of all the pokemons that pass the individual filters
    pokemonLists = [];

    // Filter pokemon by type
    for (let i = 0; i < typeButtons.length; i++) {
        let checkBox = typeButtons[i].children[0];
        if (checkBox.checked) {
            pokemonLists.push(getPokemonByType(checkBox.id));
        }
    }

    // Filter pokemon by moves
    didIncludeMove1 = false;
    didIncludeMove2 = false;
    didIncludeMove3 = false;
    didIncludeMove4 = false;
    didIncludeAbility = false;
    if(moves.includes(move1.value.toLowerCase())) {
        pokemonLists.push(getPokemonByMove(move1.value.toLowerCase()));
        didIncludeMove1 = true;
    }
    if(moves.includes(move2.value.toLowerCase())) {
        pokemonLists.push(getPokemonByMove(move2.value.toLowerCase()));
        didIncludeMove2 = true;
    }
    if(moves.includes(move3.value.toLowerCase())) {
        pokemonLists.push(getPokemonByMove(move3.value.toLowerCase()));
        didIncludeMove3 = true;
    }
    if(moves.includes(move4.value.toLowerCase())) {
        pokemonLists.push(getPokemonByMove(move4.value.toLowerCase()));
        didIncludeMove4 = true;
    }

    // Filter pokemon by abilities
    if(abilities.includes(ability.value.toLowerCase())) {
        pokemonLists.push(getPokemonByAbility(ability.value.toLowerCase()));
        didIncludeAbility = true;
    }

    // Show the results on the site
    showResults(pokemonLists);
}