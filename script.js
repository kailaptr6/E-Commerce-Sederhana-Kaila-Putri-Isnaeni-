let keranjang = []; // [{ nama, harga, qty }]

function formatRupiah(angka) {
    return "Rp " + angka.toLocaleString('id-ID');
}

function filterKategori(kategori) {
    const semuaProduk = document.querySelectorAll('.product-card');
    const semuaKategoriCard = document.querySelectorAll('.category-card');

    semuaKategoriCard.forEach(card => {
        card.classList.toggle('active', card.dataset.kategori === kategori);
    });

    let adaYangTampil = false;
    semuaProduk.forEach(produk => {
        const cocok = (kategori === 'all') || (produk.dataset.category === kategori);
        produk.classList.toggle('hide', !cocok);
        if (cocok) adaYangTampil = true;
    });

    tampilkanPesanKosong(!adaYangTampil);

    // Scroll otomatis ke bagian produk
    document.getElementById('produk').scrollIntoView({ behavior: 'smooth' });
}

function tampilkanPesanKosong(tampilkan) {
    const grid = document.querySelector('.product-grid');
    let pesan = grid.querySelector('.product-empty-msg');
    if (tampilkan) {
        if (!pesan) {
            pesan = document.createElement('p');
            pesan.className = 'product-empty-msg';
            pesan.innerText = 'Belum ada produk pada kategori ini.';
            grid.appendChild(pesan);
        }
    } else if (pesan) {
        pesan.remove();
    }
}

function tambahKeKeranjang(namaProduk, harga) {
    const itemAda = keranjang.find(item => item.nama === namaProduk);
    if (itemAda) {
        itemAda.qty++;
    } else {
        keranjang.push({ nama: namaProduk, harga: harga, qty: 1 });
    }
    perbaruiTampilanKeranjang();

    // Notifikasi kecil, tetap buka panel keranjang
    bukaKeranjang();
}

function ubahJumlah(index, perubahan) {
    keranjang[index].qty += perubahan;
    if (keranjang[index].qty <= 0) {
        keranjang.splice(index, 1);
    }
    perbaruiTampilanKeranjang();
}

function hapusItem(index) {
    keranjang.splice(index, 1);
    perbaruiTampilanKeranjang();
}

function hitungTotal() {
    return keranjang.reduce((total, item) => total + (item.harga * item.qty), 0);
}

function hitungJumlahBarang() {
    return keranjang.reduce((total, item) => total + item.qty, 0);
}

function perbaruiTampilanKeranjang() {
    const container = document.getElementById('cartItemsContainer');
    const totalEl = document.getElementById('cartTotal');
    const countEl = document.getElementById('cart-count');
    const btnCheckout = document.getElementById('btnCheckout');

    countEl.innerText = hitungJumlahBarang();
    totalEl.innerText = formatRupiah(hitungTotal());
    btnCheckout.disabled = keranjang.length === 0;

    if (keranjang.length === 0) {
        container.innerHTML = '<p class="cart-empty">Keranjang masih kosong</p>';
        return;
    }

    container.innerHTML = keranjang.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.nama}</h4>
                <p>${formatRupiah(item.harga)}</p>
                <div class="qty-control">
                    <button onclick="ubahJumlah(${index}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="ubahJumlah(${index}, 1)">+</button>
                </div>
                <button class="remove-item" onclick="hapusItem(${index})">Hapus</button>
            </div>
            <div><strong>${formatRupiah(item.harga * item.qty)}</strong></div>
        </div>
    `).join('');
}

function bukaKeranjang() {
    document.getElementById('cartPanel').classList.add('active');
    document.getElementById('overlay').classList.add('active');
}
function tutupKeranjang() {
    document.getElementById('cartPanel').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}
function tutupSemua() {
    tutupKeranjang();
    tutupCheckout();
}

function bukaCheckout() {
    if (keranjang.length === 0) return;

    const total = hitungTotal();
    const ringkasan = keranjang.map(item => `
        <div class="modal-summary-item">
            <span>${item.nama} x${item.qty}</span>
            <span>${formatRupiah(item.harga * item.qty)}</span>
        </div>
    `).join('');

    document.getElementById('checkoutModalContent').innerHTML = `
        <h2>Checkout</h2>
        <div class="modal-summary">
            ${ringkasan}
            <div class="modal-summary-total">
                <span>Total Bayar</span>
                <span>${formatRupiah(total)}</span>
            </div>
        </div>

        <label>Nama Penerima</label>
        <input type="text" id="checkoutNama" placeholder="Nama lengkap" required>

        <label>Nomor HP</label>
        <input type="text" id="checkoutHp" placeholder="08xxxxxxxxxx" required>

        <label>Alamat Pengiriman</label>
        <textarea id="checkoutAlamat" rows="3" placeholder="Alamat lengkap" required></textarea>

        <label>Metode Pembayaran</label>
        <select id="checkoutMetode">
            <option value="Transfer Bank">Transfer Bank</option>
            <option value="COD">COD (Bayar di Tempat)</option>
            <option value="E-Wallet">E-Wallet</option>
        </select>

        <div class="modal-actions">
            <button class="btn-cancel" onclick="tutupCheckout()">Batal</button>
            <button class="btn-confirm" onclick="konfirmasiCheckout()">Konfirmasi Pesanan</button>
        </div>
    `;

    document.getElementById('checkoutModal').classList.add('active');
}

function tutupCheckout() {
    document.getElementById('checkoutModal').classList.remove('active');
}

function konfirmasiCheckout() {
    const nama = document.getElementById('checkoutNama').value.trim();
    const hp = document.getElementById('checkoutHp').value.trim();
    const alamat = document.getElementById('checkoutAlamat').value.trim();
    const metode = document.getElementById('checkoutMetode').value;

    if (!nama || !hp || !alamat) {
        alert('Mohon lengkapi semua data terlebih dahulu.');
        return;
    }

    const total = hitungTotal();
    const kodePesanan = 'KF' + Date.now().toString().slice(-6);

    document.getElementById('checkoutModalContent').innerHTML = `
        <div class="success-box">
            <div class="icon">✅</div>
            <h2>Pesanan Berhasil!</h2>
            <p>Kode Pesanan: <strong>${kodePesanan}</strong></p>
            <p>Terima kasih, <strong>${nama}</strong>!</p>
            <div class="modal-summary" style="text-align:left;">
                <div class="modal-summary-item"><span>Total Bayar</span><span>${formatRupiah(total)}</span></div>
                <div class="modal-summary-item"><span>Metode</span><span>${metode}</span></div>
                <div class="modal-summary-item"><span>Dikirim ke</span><span>${alamat}</span></div>
                <div class="modal-summary-item"><span>No. HP</span><span>${hp}</span></div>
            </div>
            <div class="modal-actions">
                <button class="btn-confirm" style="flex:1;" onclick="selesaiBelanja()">Selesai</button>
            </div>
        </div>
    `;

    keranjang = [];
    perbaruiTampilanKeranjang();
}

function selesaiBelanja() {
    tutupCheckout();
    tutupKeranjang();
}
