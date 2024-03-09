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

function searchPage() {
    let search_bar = document.getElementById("searchBar");
    let search_text = search_bar.value.toLowerCase().trim().replace(/\s\s+/g, " ");
    let scrolled = false;
    let info_sections = document.getElementsByClassName("Information");
    for (section of info_sections) {
        for (info of section.children) {
            texts = info.querySelectorAll("h2,a,p,li,td");
            for (text of texts) {
                // Remove previous highlights
                text.innerHTML = text.innerHTML.replace(/(<mark[^>]*>|<\/mark>)/g, "");

                // Compare similar strings and add highlights
                if (search_text) {
                    content = text.textContent.toLowerCase().trim().replace(/\s\s+/g, " ");
                    if (content.includes(search_text)) {
                        if (!scrolled) {
                            text.scrollIntoView();
                            scrolled = true;
                        }
                        text.innerHTML = text.innerHTML.replace(new RegExp("("+search_text+")", "ig"), "<mark>$1</mark>");
                    }
                }
            }
        }
    }
}
