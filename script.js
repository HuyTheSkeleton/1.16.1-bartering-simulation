const totalWeight = 423;
const baseUrl = "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.16.1/assets/minecraft/textures/";

const defaultLootTable = [
    { name: "Ender Pearl", weight: 20, min: 4, max: 8, icon: "item/ender_pearl.png", important: true },
    { name: "Obsidian", weight: 40, min: 1, max: 1, icon: "block/obsidian.png", important: true },
    { name: "String", weight: 20, min: 8, max: 24, icon: "item/string.png", important: true },
    { 
        name: "Fire Resistance (Combined)", 
        weight: 20, 
        min: 1, 
        max: 1, 
        icon: "item/potion.png", 
        important: true,
        isGroup: true,
        expanded: false,
        subItems: [
            { name: "Fire Resistance Potion", weight: 10, min: 1, max: 1, icon: "item/potion.png" },
            { name: "Splash Potion of Fire Res", weight: 10, min: 1, max: 1, icon: "item/splash_potion.png" }
        ]
    },
    { name: "Nether Quartz", weight: 20, min: 8, max: 16, icon: "item/quartz.png" },
    { name: "Glowstone Dust", weight: 20, min: 5, max: 12, icon: "item/glowstone_dust.png" },
    { name: "Magma Cream", weight: 20, min: 2, max: 6, icon: "item/magma_cream.png" },
    { name: "Fire Charge", weight: 40, min: 1, max: 5, icon: "item/fire_charge.png" },
    { name: "Crying Obsidian", weight: 40, min: 1, max: 3, icon: "block/crying_obsidian.png" },
    { name: "Iron Boots (Soul Speed)", weight: 8, min: 1, max: 1, icon: "item/iron_boots.png" },
    { name: "Enchanted Book (Soul Speed)", weight: 5, min: 1, max: 1, icon: "item/enchanted_book.png" },
    { name: "Iron Nugget", weight: 10, min: 9, max: 36, icon: "item/iron_nugget.png" },
    { name: "Gravel", weight: 40, min: 8, max: 16, icon: "block/gravel.png" },
    { name: "Leather", weight: 40, min: 4, max: 10, icon: "item/leather.png" },
    { name: "Nether Brick", weight: 40, min: 4, max: 16, icon: "item/nether_brick.png" },
    { name: "Soul Sand", weight: 40, min: 4, max: 16, icon: "block/soul_sand.png" }
];

let lootTable = JSON.parse(JSON.stringify(defaultLootTable));

const goldNum = document.getElementById('goldNum');
const goldSlider = document.getElementById('goldSlider');
const targetNum = document.getElementById('targetNum');
const targetSlider = document.getElementById('targetSlider');
const requiredGoldDisplay = document.getElementById('requiredGold');
const tableBody = document.getElementById('tableBody');
const sortExpectedBtn = document.getElementById('sortExpected');
const resetOrderBtn = document.getElementById('resetOrderBtn');
const selectSelected = document.getElementById('selectSelected');
const selectItems = document.getElementById('selectItems');

let sortAscending = false;
let currentTargetItemName = "Ender Pearl";

function populateCustomDropdown() {
    selectItems.innerHTML = '';
    
    const initialItem = lootTable.find(i => i.name === currentTargetItemName) || lootTable[0];
    selectSelected.innerHTML = `<img src="${baseUrl}${initialItem.icon}" class="mc-icon"> ${initialItem.name}`;

    lootTable.forEach(item => {
        const div = document.createElement('div');
        div.innerHTML = `<img src="${baseUrl}${item.icon}" class="mc-icon"> ${item.name}`;
        div.addEventListener('click', () => {
            currentTargetItemName = item.name;
            selectSelected.innerHTML = `<img src="${baseUrl}${item.icon}" class="mc-icon"> ${item.name}`;
            selectItems.classList.remove('select-show');
            calculateTarget();
        });
        selectItems.appendChild(div);
    });
}

selectSelected.addEventListener('click', (e) => {
    e.stopPropagation();
    selectItems.classList.toggle('select-show');
});

document.addEventListener('click', () => {
    selectItems.classList.remove('select-show');
});

function calculateTarget() {
    const amountNeeded = parseInt(targetNum.value) || 0;
    const selectedItem = lootTable.find(i => i.name === currentTargetItemName);
    
    if(selectedItem) {
        const probability = selectedItem.weight / totalWeight;
        const averageDropPerHit = (selectedItem.min + selectedItem.max) / 2;
        const expectedPerGold = probability * averageDropPerHit;
        
        if (expectedPerGold > 0) {
            const goldNeeded = Math.ceil(amountNeeded / expectedPerGold);
            requiredGoldDisplay.textContent = goldNeeded.toLocaleString();
        } else {
            requiredGoldDisplay.textContent = "0";
        }
    }
}

const savedOrder = JSON.parse(localStorage.getItem('barterOrder116'));
if (savedOrder) {
    lootTable.sort((a, b) => {
        const indexA = savedOrder.indexOf(a.name);
        const indexB = savedOrder.indexOf(b.name);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
}

function createRow(item, index, gold, isSub = false) {
    const probability = item.weight / totalWeight;
    const averageDropPerHit = (item.min + item.max) / 2;
    const expectedTotal = probability * averageDropPerHit * gold;

    const row = document.createElement('tr');
    
    if (!isSub) {
        row.className = 'draggable-row';
        if (item.important) row.classList.add('important-trade');
        row.draggable = true;
        
        row.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index);
            setTimeout(() => row.classList.add('dragging'), 0);
        });

        row.addEventListener('dragend', () => row.classList.remove('dragging'));
        row.addEventListener('dragover', (e) => e.preventDefault());

        row.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
            if (draggedIndex !== index) {
                const draggedItem = lootTable.splice(draggedIndex, 1)[0];
                lootTable.splice(index, 0, draggedItem);
                localStorage.setItem('barterOrder116', JSON.stringify(lootTable.map(i => i.name)));
                
                populateCustomDropdown();
                renderTable();
            }
        });
    } else {
        row.className = 'sub-row';
    }

    let nameHtml = `<span>${item.name}</span>`;
    if (item.isGroup) {
        nameHtml = `<span class="group-toggle">${item.expanded ? '▼' : '►'} ${item.name}</span>`;
        row.addEventListener('click', (e) => {
            if(e.target.closest('.group-toggle')) {
                item.expanded = !item.expanded;
                renderTable();
            }
        });
    }

    row.innerHTML = `
        <td>
            <div class="item-cell">
                <img class="mc-icon" src="${baseUrl}${item.icon}" alt="${item.name}" onerror="this.style.display='none'">
                ${nameHtml}
            </div>
        </td>
        <td>${(probability * 100).toFixed(2)}%</td>
        <td>${item.min} - ${item.max}</td>
        <td class="drop-value">${expectedTotal.toFixed(2)}</td>
    `;

    return row;
}

function renderTable() {
    let gold = parseInt(goldNum.value);
    if (isNaN(gold)) gold = 0;
    
    tableBody.innerHTML = '';

    lootTable.forEach((item, index) => {
        tableBody.appendChild(createRow(item, index, gold, false));
        
        if (item.isGroup && item.expanded) {
            item.subItems.forEach(subItem => {
                tableBody.appendChild(createRow(subItem, index, gold, true));
            });
        }
    });
}

sortExpectedBtn.addEventListener('click', () => {
    const gold = Math.max(1, parseInt(goldNum.value) || 0);
    sortAscending = !sortAscending;

    lootTable.sort((a, b) => {
        const valA = (a.weight / totalWeight) * ((a.min + a.max) / 2) * gold;
        const valB = (b.weight / totalWeight) * ((b.min + b.max) / 2) * gold;
        return sortAscending ? valA - valB : valB - valA;
    });

    localStorage.setItem('barterOrder116', JSON.stringify(lootTable.map(i => i.name)));
    populateCustomDropdown();
    renderTable();
});

// Reset Everything
resetOrderBtn.addEventListener('click', () => {
    localStorage.removeItem('barterOrder116');
    lootTable = JSON.parse(JSON.stringify(defaultLootTable));
    
    currentTargetItemName = "Ender Pearl";
    targetNum.value = 20;
    targetSlider.value = 20;
    goldNum.value = 100;
    goldSlider.value = 100;
    
    populateCustomDropdown();
    renderTable();
    calculateTarget();
});

goldSlider.addEventListener('input', (e) => {
    goldNum.value = e.target.value;
    renderTable();
});
goldNum.addEventListener('input', (e) => {
    goldSlider.value = e.target.value;
    renderTable();
});

targetSlider.addEventListener('input', (e) => {
    targetNum.value = e.target.value;
    calculateTarget();
});
targetNum.addEventListener('input', (e) => {
    targetSlider.value = e.target.value;
    calculateTarget();
});

// Initialization
populateCustomDropdown();
renderTable();
calculateTarget();