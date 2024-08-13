// ---------------- ебенячий код переключателя стилей
document.addEventListener("DOMContentLoaded", function() {
const style1Btn = document.getElementById('style1');
const style2Btn = document.getElementById('style2');
// Add more buttons as needed

const stylesheet1 = document.getElementById('stylesheet1');
const stylesheet2 = document.getElementById('stylesheet2');
// Add more stylesheets as needed

// Check localStorage for the last selected style and apply it
const lastSelectedStyle = localStorage.getItem('selectedStyle');
if (lastSelectedStyle) {
applyStyle(lastSelectedStyle);
}

style1Btn.addEventListener("click", function() {
applyStyle('style1');
});

style2Btn.addEventListener("click", function() {
applyStyle('style2');
});
// Add more event listeners as needed

function applyStyle(style) {
stylesheet1.disabled = true;
stylesheet2.disabled = true;
// Disable all stylesheets by default

switch (style) {
    case 'style1':
        stylesheet1.disabled = false;
        break;
    case 'style2':
        stylesheet2.disabled = false;
        break;
    // Add more cases as needed
}

localStorage.setItem('selectedStyle', style); // Save the selected style to localStorage
}
});