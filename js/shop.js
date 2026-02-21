document.addEventListener('DOMContentLoaded', () => {

    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const productGrid = document.getElementById('productGrid');

    if (gridViewBtn && listViewBtn && productGrid) {
        gridViewBtn.addEventListener('click', () => {
            productGrid.classList.remove('list-view');
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
        });

        listViewBtn.addEventListener('click', () => {
            productGrid.classList.add('list-view');
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
        });
    }

    const handleStickySidebar = () => {
        const sidebar = document.querySelector('.filter-sidebar');
        if (!sidebar) return;

        if (window.innerWidth <= 768) {
            sidebar.style.position = '';
            sidebar.style.top = '';
            sidebar.style.bottom = '';
            return;
        }

        const viewportHeight = window.innerHeight;
        const sidebarHeight = sidebar.offsetHeight;
        const stickyTop = 130;
        const stickyBottom = 30;

        if (sidebarHeight + stickyTop + stickyBottom > viewportHeight) {
            sidebar.style.top = 'auto';
            sidebar.style.bottom = `${stickyBottom}px`;
            sidebar.style.position = 'sticky';
        } else {
            sidebar.style.top = `${stickyTop}px`;
            sidebar.style.bottom = 'auto';
            sidebar.style.position = 'sticky';
        }
    };

    window.addEventListener('resize', handleStickySidebar);
    document.addEventListener('scroll', handleStickySidebar);
    handleStickySidebar();

    const searchInput = document.querySelector('.search-bar');
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    const sizeCheckboxes = document.querySelectorAll('input[data-filter="size"]');
    const colorCheckboxes = document.querySelectorAll('input[data-filter="color"]');
    const minPriceInput = document.querySelectorAll('.price-input')[0];
    const maxPriceInput = document.querySelectorAll('.price-input')[1];
    const sortSelect = document.querySelector('.sort-select');
    const productCountSpan = document.querySelector('.product-count');
    const heroCountSpan = document.querySelector('.product-available-count');
    const noProductsMsg = document.getElementById('noProductsMessage');

    if (productGrid && searchInput) {
        const products = Array.from(productGrid.querySelectorAll('.product-card'));

        const applyUrlFilters = () => {
            const params = new URLSearchParams(window.location.search);
            const categoryParam = params.get('category');

            if (categoryParam) {
                categoryRadios.forEach(radio => {
                    const label = radio.nextElementSibling.textContent.trim();
                    if (label.toLowerCase() === categoryParam.toLowerCase()) {
                        radio.checked = true;
                    }
                });
            }
        };

        const filterProducts = () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            const checkedCategory = document.querySelector('input[name="category"]:checked');
            const selectedCategory = checkedCategory ? checkedCategory.nextElementSibling.textContent.trim() : 'All Categories';

            const selectedSizes = Array.from(sizeCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.nextElementSibling.textContent.trim());

            const selectedColors = Array.from(colorCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => {

                    const labelSpan = cb.parentElement.querySelector('span:not(.color-swatch)');
                    return labelSpan ? labelSpan.textContent.trim() : '';
                })
                .filter(color => color !== '');

            const minPrice = parseFloat(minPriceInput.value) || 0;
            const maxPrice = parseFloat(maxPriceInput.value) || Infinity;

            let visibleCount = 0;

            products.forEach(product => {
                const title = product.querySelector('.product-title').textContent.toLowerCase();
                const category = product.dataset.category || '';
                const price = parseFloat(product.dataset.price) || 0;
                const productSizes = (product.dataset.size || '').split(' ');
                const productColor = product.dataset.color || '';

                const matchesSearch = title.includes(searchTerm);
                const matchesCategory = selectedCategory === 'All Categories' || category === selectedCategory;
                const matchesPrice = price >= minPrice && price <= maxPrice;
                const matchesSize = selectedSizes.length === 0 || selectedSizes.some(s => productSizes.includes(s));
                const matchesColor = selectedColors.length === 0 || selectedColors.includes(productColor);

                if (matchesSearch && matchesCategory && matchesPrice && matchesSize && matchesColor) {
                    product.style.display = '';
                    visibleCount++;
                } else {
                    product.style.display = 'none';
                }
            });

            if (productCountSpan) productCountSpan.textContent = `${visibleCount} items`;
            if (heroCountSpan) heroCountSpan.textContent = `${visibleCount} products available`;
            if (noProductsMsg) {
                noProductsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        };

        const sortProducts = () => {
            const sortBy = sortSelect.value;
            const sortedProducts = [...products].sort((a, b) => {
                const priceA = parseFloat(a.dataset.price) || 0;
                const priceB = parseFloat(b.dataset.price) || 0;

                if (sortBy === 'Price: Low to High') return priceA - priceB;
                if (sortBy === 'Price: High to Low') return priceB - priceA;
                return 0;
            });
            sortedProducts.forEach(p => productGrid.appendChild(p));
        };

        searchInput.addEventListener('input', filterProducts);
        categoryRadios.forEach(radio => radio.addEventListener('change', filterProducts));
        sizeCheckboxes.forEach(cb => cb.addEventListener('change', filterProducts));
        colorCheckboxes.forEach(cb => cb.addEventListener('change', filterProducts));
        if (minPriceInput) minPriceInput.addEventListener('input', filterProducts);
        if (maxPriceInput) maxPriceInput.addEventListener('input', filterProducts);
        if (sortSelect) sortSelect.addEventListener('change', sortProducts);

        applyUrlFilters();
        filterProducts();
    }

    const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const content = trigger.nextElementSibling;
            if (content && content.classList.contains('dropdown-content')) {
                trigger.classList.toggle('active');
                content.classList.toggle('show');
            }
        });
    });

    const mobileFilterBtn = document.getElementById('mobileFilterBtn');
    const filterSidebar = document.querySelector('.filter-sidebar');
    const closeFilter = document.getElementById('closeFilter');
    const overlay = document.getElementById('sidebarOverlay');

    if (mobileFilterBtn && filterSidebar && overlay) {
        mobileFilterBtn.addEventListener('click', () => {
            filterSidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        const hideSidebar = () => {
            filterSidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (closeFilter) closeFilter.addEventListener('click', hideSidebar);
        overlay.addEventListener('click', hideSidebar);
    }
});
