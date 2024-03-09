// Constants
const ARRAY_DELIMITER = ";";
const INFO_DELIMITER = "|";
const SEPARATOR = ",";
const MAX_DATE = Date.parse("9999-12-31");

// Variables
var filter_options = {dates: ["0001-01-01", "9999-12-31"], food_types: ["Starch/Grain", "Meat", "Vegetable", "Fruit", "Fat/Oil/Sugar", "Miscellaneous"], meals: ["Breakfast", "Lunch", "Dinner"]};

// Functions
function toggleNavigation() {
    let sources = document.getElementsByClassName('source_drop');
    for (source of sources) {
        if (source.style.display != "block") {
            source.style.display = "block";
        } else {
            source.style.display = "none";
        }
    }
}

function togglePopup(popup, action) {
    let body = document.querySelector("body");
    let form = document.getElementsByClassName(popup);

    // Setup for popup menu
    window.scrollTo(0, 0);
    switchAccountForm('login');
    
    // Open/close forms
    if (action == 'open') {
        body.style.overflow = "hidden";
        for (let element of form)
            element.style.display = "grid";
    } else {
        body.style.overflow = "auto";
        for (let element of form)
            element.style.display = "none";
    }
}

function toggleRecords(action = null) {
    let drop_table = document.getElementsByClassName("dropTable");
    for (let element of drop_table) {
        if (action == null && element.style.display == "block") {
            element.style.display = "none";
        } else {
            element.style.display = "block";
        }
    }
}

function toggleChecklist(List) {
    let checkList = document.getElementById(List);
    if (checkList.style.display == "block") {
        checkList.style.display = "none";
    } else {
        checkList.style.display = "block";
    }
}

function switchAccountForm(action) {
    let login_form = document.getElementById("loginForm");
    let signup_form = document.getElementById("signupForm");

    // Reset forms
    login_form.reset();
    signup_form.reset();
    
    // Switch between login and signup forms
    if (action == 'login') {
        signup_form.style.display = "none";
        login_form.style.display = "block";
    } else {
        login_form.style.display = "none";
        signup_form.style.display = "block";
    }
}

function confirmAccount(action) {
    let form = "";
    if (action == "signup") {
        form = document.getElementById("signupForm");
    } else {
        form = document.getElementById("loginForm");
    }
    
    let result = true;
    
    // Check if user filled in all fields
    let username = form.elements.Username.value.toLowerCase().trim().replace(/\s\s+/g, " ");
    let password = form.elements.Password.value;
    if (username && password) {
        form.elements.Username.value = username;
        
        // Check if logged in user logs in again
        let current_user = `${sessionStorage.getItem("account")}`.split(INFO_DELIMITER)[1];
        if (username != current_user) {
            // Check if sign up passwords do not match
            if (action == "signup") {
                let confirm_password = form.elements.confirmPassword.value;
                if (password != confirm_password) {
                    result = "Passwords do not match, try again.";
                }
            }
        } else {
            result = "User already logged in.";
        }
    } else {
        result = "Please fill in all the sections.";
    }

    return result;
}

function confirmChange(action) {
    let form = "";
    let food_table = "";
    if (action == "entry") {
        form = document.getElementById("entryForm");
        food_table = document.getElementById("foodEntryTable");
    } else {
        form = document.getElementById("editForm");
        food_table = document.getElementById("foodEditTable");
    }

    let result = true;

    let user_info = form.elements.userId.value;
    if (user_info) {
        // Check if entries are filled in
        if (!form.elements.Meal.value) {
            result = "Please enter the meal eaten.";
        }
        
        let date = Date.parse(form.elements.Date.value);
        if (isNaN(date) || date > MAX_DATE) {
            result = "Please enter a valid date.";
        }
        
        let chosen_type = false;
        for (let food_types of form.elements["foodTypes[]"]) {
            if (food_types.checked) {
                chosen_type = true;
            }
        }
        if (!chosen_type) {
            result = "Please enter at least one food type for your meal.";
        }
        
        if (food_table.rows.length > 1) {
            // Add food items to input
            form.elements.Food.value = "";
            for (let row_index = food_table.rows.length - 1; row_index > 0; row_index--) {
                form.elements.Food.value += food_table.rows[row_index].cells[0].innerHTML;
                if (row_index != 1) {
                    form.elements.Food.value += INFO_DELIMITER;
                }
            }
        } else {
            result = "Please enter at least one food item.";
        }
    } else {
        result = "You have to be signed in to store meal records.";
    }

    return result;
}

function confirmFilter() {
    let form = document.getElementById("filterForm");

    let result = true;

    let user_info = form.elements.userId.value;
    if (user_info) {
        // Check if filter options are applied
        // Meal filter
        let chosen_meal = false;
        for (let meal_times of form.elements["meals[]"]) {
            if (meal_times.checked) {
                chosen_meal = true;
            }
        }   
        if (!chosen_meal) {
            result = "Please choose at least one meal time to filter for.";
        }
    
        // Food type filter
        let chosen_type = false;
        for (let food_types of form.elements["foodTypes[]"]) {
            if (food_types.checked) {
                chosen_type = true;
            }
        }
        if (!chosen_type) {
            result = "Please choose at least one food type to filter for.";
        }

        // Date filter
        let date_lower = Date.parse(form.elements["Date[]"][0].value);
        let date_upper = Date.parse(form.elements["Date[]"][1].value);
        if (isNaN(date_lower) || isNaN(date_upper) || date_lower > MAX_DATE || date_upper > MAX_DATE || date_lower > date_upper) {
            result = "Please enter a valid date range.";
        }
    } else {
        result = "You have to be signed in to view your records.";
    }

    return result;
}

function updateAccount(action=null) {
    // Reset previous record information
    if (action != "reload") {
        sessionStorage.setItem("records", "");
        updateRecords();
    }
    
    let entry_form = document.getElementById("entryForm");
    let filter_form = document.getElementById("filterForm");

    entry_form.reset();
    filter_form.reset();
    let food_input = document.getElementById("foodEntryOption");
    food_input.value = "";
    let food_table = document.getElementById("foodEntryInfo");
    food_table.innerHTML = "";
    
    // Check if user information exists
    let user_information = sessionStorage.getItem("account");
    if (user_information) {
        let username = document.getElementById("Username");

        if (action == "signout") {
            // Clear session storage and main page details
            sessionStorage.setItem("account", "");

            user_information = "";
            username.innerHTML = "User: __________";
        } else {
            // Update page user detail display
            let user_name = user_information.split(INFO_DELIMITER)[1];
            
            username.innerHTML = `User: ${user_name}`;
        }

        // Update form user information
        let user_id = user_information.split(INFO_DELIMITER)[0];
        let user_inputs = document.getElementsByClassName("userInfo");
        for (let input of user_inputs) {
            input.value = user_id;
        }

        togglePopup("accountPopup", "close");
    } else if (action == "signout") {
        alert("No user signed in.");
    }
}

function addFood(action) {
    let new_food = "";
    let food_table = "";
    if (action == "entry") {
        new_food = document.getElementById("foodEntryOption").value.toLowerCase().trim().replace(/\s\s+/g, " ");
        food_table = document.getElementById("foodEntryInfo");
    } else {
        new_food = document.getElementById("foodEdit").value.toLowerCase().trim().replace(/\s\s+/g, " ");
        food_table = document.getElementById("foodEditInfo");
    }
    
    // Check if food already entered
    if (new_food) { 
        let add = true;
        for (let row of food_table.rows) {
            if (new_food == row.cells[0].innerHTML || !/^[A-Za-z0-9]*$/.test(new_food)) {
                add = false;
            }
        }

        // Add food to food table with remove button
        if (add) {
            let new_row_index = food_table.rows.length;
            let new_row = food_table.insertRow(new_row_index);
            let food_name = new_row.insertCell(0);
            let food_action = new_row.insertCell(1);
        
            food_name.innerHTML = new_food;
            food_action.innerHTML = `<button type="button" onclick="document.getElementById('${food_table.id}').deleteRow(this.parentElement.parentElement.rowIndex - 1);">Remove</button>`;
        } else {
            alert("Please enter a different valid food item.");
        }
    } else {
        alert("Please enter a food item.");
    }
}

function updateRecords() {
    // Clear previous data
    let record_table = document.getElementById("recordInfo");
    record_table.innerHTML = "";

    // Update record table if records edited
    let records = sessionStorage.getItem("records");
    if (records == "updated") {
        let form = document.getElementById("filterForm");
        form.elements["Date[]"][0].value = filter_options.dates[0];
        form.elements["Date[]"][1].value = filter_options.dates[1];
        for (let food_type of form.elements["foodTypes[]"]) {
            food_type.checked = false;
            if (filter_options.food_types.includes(food_type.value)) {
                food_type.checked = true;
            }
        }
        for (let meal of form.elements["meals[]"]) {
            meal.checked = false;
            if (filter_options.meals.includes(meal.value)) {
                meal.checked = true;
            }
        }
        form.submit();
        
    } else if (records) {
        // Add row to record table
        records = records.split(ARRAY_DELIMITER);
        for (let row_index = 0; row_index < records.length; row_index++) {
            let row = record_table.insertRow(row_index);
            let record_info = records[row_index].split(INFO_DELIMITER);
            
            for (let col_index = 0; col_index < record_info.length; col_index++) {
                let cell = row.insertCell(col_index);
                cell.innerHTML = record_info[col_index];
            }
    
            // Add action buttons to record row
            let edit_cell = row.insertCell(record_info.length);
            edit_cell.innerHTML = `<button type="button" onclick="setEditForm('${records[row_index]}')">Edit</button>`;
        }   
    }

    // Show record table
    toggleRecords("open");
}

function setEditForm(info) {
    togglePopup("editPopup", "open");

    let form = document.getElementById("editForm");
    let record = form.elements.recordId;
    let date = form.elements.Date;
    let meal = form.elements.mealEdit;
    let food_types = form.elements["foodTypes[]"];

    // Reset food input
    let food_input = document.getElementById("foodEdit");
    food_input.value = "";
        
    // Set form type to edit
    let form_name = form.elements.recordForm;
    form_name.value = "edit";
    
    // Set record information
    let record_info = info.replace("_", " ").split(INFO_DELIMITER);
    record.value = record_info[0];
    // Date and meal
    date.value = record_info[1];
    meal.value = record_info[2];
    // Food list
    // Delete previous rows
    let food_table = document.getElementById("foodEditTable");
    for (let index = 1; index < food_table.rows.length; index++) {
        food_table.deleteRow(index);
    }
    // Add current food to rows
    let foods = record_info[3].split(SEPARATOR);
    food_table = document.getElementById("foodEditInfo");
    food_table.innerHTML = "";
    for (let row_index = 0; row_index < foods.length; row_index++) {
        let new_row = food_table.insertRow(row_index);
        let food_name = new_row.insertCell(0);
        let food_action = new_row.insertCell(1);
    
        food_name.innerHTML = foods[row_index];
        food_action.innerHTML = `<button type="button" 
        onclick="document.getElementById('${food_table.id}').deleteRow(this.parentElement.parentElement.rowIndex - 1);">Remove</button>`;
    }
    // Food types
    let types = record_info[4].split(SEPARATOR);
    for (let type of food_types) {
        type.checked = false;
        if (types.includes(type.value)) {
            type.checked = true;
        }
    }
}

function submitForm(action) {
    let submit = true;

    // Account form
    let form = "";
    if (action == "login" || action == "signup") {
        if (action == "login") {
            form = document.getElementById("loginForm");
        } else {
            form = document.getElementById("signupForm");
        }
        submit = confirmAccount(action);
    // Entry/edit form
    } else if (action == "entry" || action == "edit") {
        if (action == "entry") {
            form = document.getElementById("entryForm");
        } else {
            form = document.getElementById("editForm");
        }
        submit = confirmChange(action);
    // Filter form
    } else if (action == "filter") {
        form = document.getElementById("filterForm");
        submit = confirmFilter();
    // Delete records
    } else if (action == "delete") {
        form = document.getElementById("editForm");
        form.elements.recordForm.value = "delete";
    }

    // Submit details if valid
    if (submit == true) {
        form.submit();

        if (action == "filter") {
            filter_options.dates = [form.elements["Date[]"][0].value, form.elements["Date[]"][1].value];

            filter_options.food_types = [];
            for (let food_type of form.elements["foodTypes[]"]) {
                if (food_type.checked) {
                    filter_options.food_types.push(food_type.value);
                }
            }

            filter_options.meals = [];
            for (let meal of form.elements["meals[]"]) {
                if (meal.checked) {
                    filter_options.meals.push(meal.value);
                }
            }
        } else if (action == "entry") {
            form.reset();
            let food_input = document.getElementById("foodEntryOption");
            food_input.value = "";

            let food_table = document.getElementById("foodEntryInfo");
            food_table.innerHTML = "";
        }
    } else {
        alert(submit);
    }
}

function updatePage() {
    let action = sessionStorage.getItem("action");
    if (action == "account") {
        updateAccount();
        sessionStorage.setItem("action", "");
    } else if (action == "record") {
        updateRecords();
        sessionStorage.setItem("action", "");
    } else if (action == "login") {
        togglePopup("accountPopup", "open");
        sessionStorage.setItem("action", "");
    }
}

function setOnload() {
    updateAccount("reload");
    updateRecords();
}

window.onload = setOnload();
setInterval(updatePage, 5);
