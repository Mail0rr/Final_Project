function capitalizeInput() {
    const searchInput = document.getElementById('searchInput');
    let value = searchInput.value.trim();
    if (value) {
        searchInput.value = value.charAt(0).toUpperCase() + value.slice(1);
    }
}