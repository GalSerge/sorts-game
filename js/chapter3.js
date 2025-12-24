class InsertionMagicGame {
    constructor() {
        this.crystals = [];
        this.sortedCrystals = [];
        this.crystalInHand = null;
        this.totalCrystals = 8;
        this.isAutoSorting = false;

        this.init();
    }

    init() {
        this.createCrystals();
        this.renderCrystals();
        this.setupEventListeners();
        this.updateStats();
    }

    createCrystals() {
        this.crystals = [];
        this.sortedCrystals = [];

        const energies = [20, 30, 40, 50, 60, 70, 80, 90];
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEAA7', '#DDA0DD', '#FFA07A', '#20B2AA'
        ];

        // Перемешиваем энергии
        const shuffledEnergies = [...energies].sort(() => Math.random() - 0.5);

        for (let i = 0; i < this.totalCrystals; i++) {
            this.crystals.push({
                id: i,
                energy: shuffledEnergies[i],
                color: colors[i],
                element: null
            });
        }
    }

    renderCrystals() {
        const unsortedContainer = document.getElementById('unsortedCrystals');
        const sortedContainer = document.getElementById('sortedCrystals');

        // Очищаем контейнеры
        unsortedContainer.innerHTML = '';
        sortedContainer.innerHTML = '';

        // Рендерим хаотичные кристаллы
        this.crystals.forEach((crystal, index) => {
            const crystalElement = this.createCrystalElement(crystal, 'unsorted', index);
            unsortedContainer.appendChild(crystalElement);
        });

        // Рендерим отсортированные кристаллы с позициями вставки
        this.renderSortedCrystalsWithInsertionPoints();

        // Если есть кристалл в руке, показываем подсказки
        if (this.crystalInHand) {
            this.showInsertionHints();
        }
    }

    createCrystalElement(crystal, type, index) {
        const crystalElement = document.createElement('div');
        crystalElement.className = `crystal ${type === 'unsorted' ? 'appearing' : ''}`;
        crystalElement.style.background = crystal.color;
        crystalElement.textContent = crystal.energy;
        crystalElement.dataset.id = crystal.id;
        crystalElement.dataset.energy = crystal.energy;
        crystalElement.dataset.type = type;

        if (type === 'unsorted') {
            crystalElement.draggable = true;
            this.makeCrystalDraggable(crystalElement, crystal);
        }

        crystal.element = crystalElement;
        return crystalElement;
    }

    renderSortedCrystalsWithInsertionPoints() {
        const sortedContainer = document.getElementById('sortedCrystals');

        // Добавляем первую позицию вставки (перед всеми кристаллами)
        this.createInsertionPoint(sortedContainer, 0);

        // Добавляем кристаллы и позиции между ними
        this.sortedCrystals.forEach((crystal, index) => {
            // Добавляем кристалл
            const crystalElement = this.createCrystalElement(crystal, 'sorted', index);
            sortedContainer.appendChild(crystalElement);

            if ((index < this.sortedCrystals.length - 1 && (this.sortedCrystals[index + 1].energy - crystal.energy) !== 10) || index === this.sortedCrystals.length - 1)
                // Добавляем позицию вставки после этого кристалла
                this.createInsertionPoint(sortedContainer, index + 1);
        });
    }

    createInsertionPoint(container, position) {
        const insertionPoint = document.createElement('div');
        insertionPoint.className = 'insertion-point';
        insertionPoint.dataset.position = position;
        insertionPoint.title = `Вставить на позицию ${position + 1}`;

        insertionPoint.addEventListener('click', () => this.handleInsertion(position));
        insertionPoint.addEventListener('dragover', (e) => e.preventDefault());
        insertionPoint.addEventListener('drop', (e) => this.handleDrop(e, position));

        container.appendChild(insertionPoint);
        return insertionPoint;
    }

    makeCrystalDraggable(element, crystal) {
        element.addEventListener('dragstart', (e) => {
            if (this.crystalInHand || this.isAutoSorting) {
                e.preventDefault();
                return;
            }
            e.dataTransfer.setData('text/plain', crystal.id);
            element.classList.add('dragging');
        });

        element.addEventListener('dragend', () => {
            element.classList.remove('dragging');
        });
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());

        // Обработчики для руки мага
        const handSlot = document.getElementById('handSlot');
        handSlot.addEventListener('dragover', (e) => e.preventDefault());
        handSlot.addEventListener('drop', (e) => this.handleHandDrop(e));
    }

    startGame() {
        document.getElementById('startBtn').disabled = true;
        document.getElementById('status').textContent = 'Перетащи кристалл в Руку мага';
    }

    handleHandDrop(e) {
        e.preventDefault();
        if (this.crystalInHand || this.isAutoSorting) return;

        const crystalId = parseInt(e.dataTransfer.getData('text/plain'));
        const crystal = this.crystals.find(c => c.id === crystalId);

        if (crystal) {
            this.pickUpCrystal(crystal);
        }
    }

    pickUpCrystal(crystal) {
        this.crystalInHand = crystal;

        // Убираем кристалл из хаоса
        this.crystals = this.crystals.filter(c => c.id !== crystal.id);

        // Обновляем руку мага
        const handSlot = document.getElementById('handSlot');
        handSlot.innerHTML = '';
        handSlot.classList.add('active');

        const crystalElement = this.createCrystalElement(crystal, 'hand', 0);
        crystalElement.classList.add('in-hand');
        crystalElement.draggable = false;
        handSlot.appendChild(crystalElement);

        document.getElementById('status').textContent = 'Теперь выбери позицию на алтаре';

        // Показываем подсказки для вставки
        this.showInsertionHints();

        this.updateStats();
    }

    showInsertionHints() {
        if (!this.crystalInHand) return;

        const insertionPoints = document.querySelectorAll('.insertion-point');
        insertionPoints.forEach(point => point.classList.remove('active'));

        // Находим правильные позиции для вставки
        let correctPosition = 0;
        for (let i = 0; i < this.sortedCrystals.length; i++) {
            if (this.crystalInHand.energy < this.sortedCrystals[i].energy) {
                break;
            }
            correctPosition = i + 1;
        }

        // Подсвечиваем правильную позицию
        const correctPoint = document.querySelector(`.insertion-point[data-position="${correctPosition}"]`);
        if (correctPoint) {
            correctPoint.classList.add('active');
        }
    }

    async handleInsertion(position) {
        if (!this.crystalInHand || this.isAutoSorting) return;

        // Проверяем, правильная ли позиция
        const isCorrect = this.isPositionCorrect(position);

        if (isCorrect) {
            await this.insertCrystal(position);
        } else {
            document.getElementById('status').textContent = 'Неверная позиция! Попробуй другую';
        }

        this.updateStats();
    }

    async handleDrop(e, position) {
        e.preventDefault();
        await this.handleInsertion(position);
    }

    isPositionCorrect(position) {
        // Проверяем левого соседа (если есть)
        if (position > 0 && this.crystalInHand.energy < this.sortedCrystals[position - 1].energy) {
            return false;
        }

        // Проверяем правого соседа (если есть)
        if (position < this.sortedCrystals.length && this.crystalInHand.energy > this.sortedCrystals[position].energy) {
            return false;
        }

        return true;
    }

    async insertCrystal(position) {
        // Вставляем кристалл на алтарь
        this.sortedCrystals.splice(position, 0, this.crystalInHand);

        // Визуализируем сдвиг кристаллов справа
        await this.visualizeShift(position);

        // Обновляем отображение
        this.renderCrystals();
        this.crystalInHand = null;

        const handSlot = document.getElementById('handSlot');
        handSlot.innerHTML = '<div class="instruction">Перетащи кристалл сюда</div>';
        handSlot.classList.remove('active');

        document.getElementById('status').textContent = 'Отлично! Возьми следующий кристалл';

        // Проверяем победу
        if (this.crystals.length === 0 && this.crystalInHand === null) {
            this.checkWinCondition();
        }
    }

    async visualizeShift(insertPosition) {
        // Подсвечиваем кристаллы, которые сдвинутся
        for (let i = insertPosition; i < this.sortedCrystals.length; i++) {
            if (this.sortedCrystals[i].element) {
                this.sortedCrystals[i].element.classList.add('shifting');
            }
        }

        await this.delay(300);

        // Убираем подсветку
        for (let i = insertPosition; i < this.sortedCrystals.length; i++) {
            if (this.sortedCrystals[i].element) {
                this.sortedCrystals[i].element.classList.remove('shifting');
            }
        }

        await this.delay(200);
    }

    async autoSortStep() {
        if (this.crystals.length === 0 && !this.crystalInHand) return false;

        if (!this.crystalInHand) {
            // Берем первый кристалл из хаоса
            const crystal = this.crystals[0];
            this.pickUpCrystal(crystal);
            await this.delay(800);
        }

        if (this.crystalInHand) {
            // Находим правильную позицию
            let position = 0;
            for (let i = 0; i < this.sortedCrystals.length; i++) {
                if (this.crystalInHand.energy < this.sortedCrystals[i].energy) {
                    break;
                }
                position = i + 1;
            }

            // Вставляем кристалл
            await this.insertCrystal(position);
            await this.delay(600);
        }

        return this.crystals.length > 0 || this.crystalInHand !== null;
    }

    async toggleAutoSort() {
        if (this.isAutoSorting) {
            this.stopAutoSort();
            document.getElementById('autoSortBtn').textContent = 'Авто-сортировка';
        } else {
            this.isAutoSorting = true;
            document.getElementById('autoSortBtn').textContent = 'Стоп';
            document.getElementById('resetBtn').disabled = true;

            let continueSorting = true;
            while (continueSorting && this.isAutoSorting) {
                continueSorting = await this.autoSortStep();
            }

            this.stopAutoSort();
        }
    }

    stopAutoSort() {
        this.isAutoSorting = false;
        document.getElementById('autoSortBtn').textContent = 'Авто-сортировка';
        document.getElementById('resetBtn').disabled = false;
    }

    resetGame() {
        this.stopAutoSort();
        this.createCrystals();
        this.crystalInHand = null;

        this.renderCrystals();

        const handSlot = document.getElementById('handSlot');
        handSlot.innerHTML = '<div class="instruction">Перетащи кристалл сюда</div>';
        handSlot.classList.remove('active');

        document.getElementById('startBtn').disabled = false;
        document.getElementById('autoSortBtn').disabled = true;

        this.updateStats();
        document.getElementById('status').textContent = 'Возьми первый кристалл';

        // Убираем анимацию победы
        document.querySelector('.crystal-rack')?.classList.remove('victory');
    }

    checkWinCondition() {
        if (this.crystals.length === 0 && this.crystalInHand === null && this.sortedCrystals.length === this.totalCrystals) {
            // Проверяем, что кристаллы отсортированы
            const isSorted = this.sortedCrystals.every((crystal, index, array) => {
                return index === 0 || crystal.energy >= array[index - 1].energy;
            });

            if (isSorted) {
                document.getElementById('status').textContent = 'Победа! Порядок восстановлен! 👑';
                document.querySelector('.crystal-rack').classList.add('victory');
                this.delay(3000);
                document.getElementById('winModal').style.display = 'block';

                this.stopAutoSort();
                return true;
            }
        }
        return false;
    }

    updateStats() {
        document.getElementById('crystalsSorted').textContent = this.sortedCrystals.length;
        document.getElementById('totalCrystals').textContent = this.totalCrystals;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Запуск игры
document.addEventListener('DOMContentLoaded', () => {
    new InsertionMagicGame();
});