document.getElementById('ordersButton').addEventListener('click', function() {
    document.getElementById('ordersModal').classList.remove('hidden');
    document.getElementById('ordersModal').classList.add('scale-100');
});

document.getElementById('closeOrders').addEventListener('click', function() {
    document.getElementById('ordersModal').classList.add('hidden');
    document.getElementById('ordersModal').classList.remove('scale-100');
});

document.getElementById('closeOrdersBtn').addEventListener('click', function() {
    document.getElementById('ordersModal').classList.add('hidden');
    document.getElementById('ordersModal').classList.remove('scale-100');
});