var titleInput = document.getElementById("titleInput");
var subtitleInput = document.getElementById("subtitleInput");
var bodyInput = document.getElementById("bodyInput");
var tagInput = document.getElementById("tagInput");

var previewTitle = document.getElementById("previewTitle");
var previewSubtitle = document.getElementById("previewSubtitle");
var previewBody = document.getElementById("previewBody");
var previewTags = document.getElementById("previewTags");

var tagContainer = document.getElementById("tagContainer");
var titleCount = document.getElementById("titleCount");
var subtitleCount = document.getElementById("subtitleCount");


let tags = [];

function onTitleInput() {
    // if (titleInput.value !== "") {
    //     previewTitle = titleInput.value
    // } else {
    //     previewTitle = "Title";
    // }

    previewTitle.textContent = titleInput.value || "Title";

    titleCount.textContent = `${titleInput.value.length} / 120`;
}

function onSubtitleInput() {
    if (subtitleInput.value) {
        previewSubtitle.textContent = subtitleInput.value;
    } else {
        previewSubtitle.textContent = "Subtitle";
    }

    subtitleCount.textContent = `${subtitleInput.value.length} / 120`
}

function handleTagKeyEvent(e) {
    if (e.key === " ") {
        e.preventDefault();

        const value = tagInput.value.trim();
        if (value !== "") {
            if (tags.length === 5) return;
            tags.push(value);
            renderTags();
            tagInput.value = "";
        }
    }
}

function renderTags() {
    tagContainer.innerHTML = "";
    previewTags.innerHTML = "";

    tags.forEach(tag => {

        // Editor tag pill
        const tagEl = document.createElement("div");
        tagEl.classList.add("tag");
        tagEl.textContent = "#" + tag;
        tagContainer.appendChild(tagEl);

        // Preview tag pill
        const previewTag = document.createElement("div");
        previewTag.classList.add("tag");
        previewTag.textContent = "#" + tag;
        previewTags.appendChild(previewTag);
    })
}

function onBodyInput() {
    let text = bodyInput.value;

    text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    text = text.replace(/\*(.*?)\*/g, "<strong>$1</strong>");

    text = text.replace(/\_(.*?)\_/g, "<em>$1</em>");

    text = text.replace(/`(.*?)`/g, "<code>$1</code>");

     text = text.replace(/\^(\d+|\([^)]+\)|[a-zA-Z])/g, (m, p1) => {
        return "<sup>" + p1.replace(/[()]/g, "") + "</sup>";
    });

    // Subscript: H~2~O or CO~2~
    text = text.replace(/~(.*?)~/g, "<sub>$1</sub>");

    previewBody.innerHTML = text.replaceAll("\n", "<br>") || "Start typing...";
}