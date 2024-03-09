const NUM_BACKGROUND_IMAGES = 3;

var image_index = 0;

function toggleBackground(set_index = null) {
    let background = document.getElementById(`display_${image_index + 1}`);
    background.style.display = "none";
    
    if (set_index == null) {
        if (image_index < NUM_BACKGROUND_IMAGES - 1) {
            image_index += 1;
        } else {
            image_index = 0;
        }
    } else {
        image_index = set_index;
    }
    
    let dots = document.getElementsByClassName("dot");
    for (let dot_index = 0, dot; dot = dots[dot_index]; dot_index++) {
        if (dot_index == image_index) {
            dots[dot_index].style.backgroundColor = "#91785a";
        } else {
            dots[dot_index].style.backgroundColor = "#dbcbb8";
        }
    }

    background = document.getElementById(`display_${image_index + 1}`);
    background.style.display = "block";
}

function toggleForm(action) {
    let account_form = document.getElementsByClassName("Account");
    if (action == 'open') {
        for (element of account_form)
            element.style.display = "block";
    } else {
        for (element of account_form)
            element.style.display = "none";
    }
}

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

function accountLogin() {
    sessionStorage.setItem('action', 'login');
    window.location.href = "diet_logger.html";
}

toggleBackground(0);
setInterval(toggleBackground, 10000);
