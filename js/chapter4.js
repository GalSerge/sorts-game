class QuickSortGame {
    constructor() {
        this.warriors = [];
        this.leftWarriors = [];
        this.rightWarriors = [];
        this.pivot = null;
        this.partitionCount = 0;
        this.comparisonCount = 0;
        this.swapCount = 0;
        this.recursionDepth = 0;
        this.balance = 100;
        this.recursionStack = [];
        this.totalWarriors = 8;
        this.sortedWarriors = [];

        this.init();
    }

    init() {
        this.createWarriors();
        this.renderWarriors();
        this.renderSortedWarriors();
        this.setupEventListeners();
        this.updateStats();
    }

    createWarriors() {
        this.warriors = [];
        this.leftWarriors = [];
        this.rightWarriors = [];
        this.pivot = null;

        const strengths = [25, 35, 45, 55, 65, 75, 85, 95];
        const types = ['warrior', 'archer', 'mage', 'knight', 'rogue', 'paladin', 'ranger', 'warlock'];
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEAA7', '#DDA0DD', '#FFA07A', '#20B2AA'
        ];

        const shuffledStrengths = [...strengths].sort(() => Math.random() - 0.5);

        for (let i = 0; i < this.totalWarriors; i++) {
            this.warriors.push({
                id: i,
                strength: shuffledStrengths[i],
                type: types[i],
                color: colors[i],
                element: null
            });
        }

        this.sortedWarriors = [...this.warriors];
    }

    renderWarriors() {
        const leftContainer = document.getElementById('leftWarriors');
        const centerContainer = document.getElementById('centerWarriors');
        const rightContainer = document.getElementById('rightWarriors');

        // Очищаем контейнеры
        leftContainer.innerHTML = '';
        centerContainer.innerHTML = '';
        rightContainer.innerHTML = '';

        // Рендерим левых воинов
        this.leftWarriors.forEach(warrior => {
            const warriorElement = this.createWarriorElement(warrior, 'left');
            leftContainer.appendChild(warriorElement);
        });

        // Рендерим опорного воина
        if (this.pivot) {
            const pivotElement = this.createWarriorElement(this.pivot, 'center');
            pivotElement.classList.add('pivot');
            centerContainer.appendChild(pivotElement);
        }

        // Рендерим правых воинов
        this.rightWarriors.forEach(warrior => {
            const warriorElement = this.createWarriorElement(warrior, 'right');
            rightContainer.appendChild(warriorElement);
        });

        // Рендерим нераспределенных воинов в центре с возможностью клика
        this.warriors.forEach(warrior => {
            const warriorElement = this.createWarriorElement(warrior, 'unassigned');

            // Добавляем обработчики для распределения
            if (this.pivot) {
                // После выбора опорного воины можно распределять
                warriorElement.addEventListener('click', () => this.distributeWarrior(warrior));
                warriorElement.style.cursor = 'pointer';
                warriorElement.title = `Кликни чтобы распределить (сила: ${warrior.strength})`;
            } else {
                // До выбора опорного можно выбирать только опорного
                warriorElement.addEventListener('click', () => this.selectPivot(warrior));
                warriorElement.style.cursor = 'pointer';
                warriorElement.title = `Кликни чтобы выбрать как опорного (сила: ${warrior.strength})`;
            }

            centerContainer.appendChild(warriorElement);
        });
    }

    renderSortedWarriors(warrior) {
        if (warrior && this.pivot) {
            let pivotIndex = this.sortedWarriors.findIndex(w => w.id === this.pivot.id);
            let warriorIndex = this.sortedWarriors.findIndex(w => w.id === warrior.id);
            this.sortedWarriors = this.sortedWarriors.filter(w => w.id !== warrior.id);

            if (this.pivot.strength > warrior.strength) {
                this.sortedWarriors.splice(pivotIndex, 0, warrior);
            } else {
                this.sortedWarriors.push(warrior);
            }
        }

        const sortedContainer = document.getElementById('sortedWarriors');
        sortedContainer.innerHTML = '';

        this.sortedWarriors.forEach(warrior => {
            const warriorElement = this.createWarriorElement(warrior, 'sorted');
            if (this.pivot && warrior.id === this.pivot.id)
                warriorElement.classList.add('pivot');
            sortedContainer.appendChild(warriorElement);
        });
    }

    createWarriorElement(warrior, gate) {
        const warriorElement = document.createElement('div');
        warriorElement.className = 'warrior';
        warriorElement.style.background = warrior.color;
        warriorElement.dataset.id = warrior.id;
        warriorElement.dataset.strength = warrior.strength;

        // Добавляем эмодзи в зависимости от типа
        const emojis = {
            'warrior': '⚔️', 'archer': '🏹', 'mage': '🔮', 'knight': '🛡️',
            'rogue': '🗡️', 'paladin': '✝️', 'ranger': '🌿', 'warlock': '☠️'
        };

        warriorElement.textContent = `${emojis[warrior.type]} ${warrior.strength}`;

        warrior.element = warriorElement;
        return warriorElement;
    }

    setupEventListeners() {
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
    }

    selectPivot(warrior) {
        if (this.pivot) return;

        this.pivot = warrior;
        this.warriors = this.warriors.filter(w => w.id !== warrior.id);

        document.getElementById('status').textContent = 'Отлично! Теперь кликай на воинов чтобы распределить их - меньшие слева, большие справа';

        this.renderWarriors();
        this.updateStats();
        this.renderSortedWarriors();
    }

    distributeWarrior(warrior) {
        if (!this.pivot) return;

        this.comparisonCount++;

        // Визуализация сравнения
        warrior.element.classList.add('comparing');

        setTimeout(() => {
            if (warrior.strength < this.pivot.strength) {
                // Меньшие - влево
                this.leftWarriors.push(warrior);
                warrior.element.style.setProperty('--move-x', '-100px');
                document.getElementById('status').textContent = `Слабейший налево`;
            } else {
                // Большие - вправо
                this.rightWarriors.push(warrior);
                warrior.element.style.setProperty('--move-x', '100px');
                document.getElementById('status').textContent = `Сильный направо`;
            }

            warrior.element.classList.add('moving');

            setTimeout(() => {
                warrior.element.classList.remove('comparing', 'moving');
                this.warriors = this.warriors.filter(w => w.id !== warrior.id);
                this.swapCount++;

                this.renderWarriors();
                this.updateStats();

                // Проверяем завершение распределения
                if (this.warriors.length === 0) {
                    setTimeout(() => this.completePartition(), 500);
                }
            }, 300);
        }, 400);

        this.renderSortedWarriors(warrior);
    }

    async completePartition() {
        this.partitionCount++;

        // Проверяем баланс
        this.updateBalance();

        document.getElementById('status').textContent = 'Разделение завершено! Готовься к рекурсии';

        await this.delay(1000);

        // Переходим к рекурсии
        await this.processRecursion();
    }

    async processRecursion() {
        this.recursionDepth++;

        // Добавляем группы в стек рекурсии
        if (this.leftWarriors.length > 1) {
            this.recursionStack.push({
                warriors: [...this.leftWarriors],
                side: 'left'
            });
        }

        if (this.rightWarriors.length > 1) {
            this.recursionStack.push({
                warriors: [...this.rightWarriors],
                side: 'right'
            });
        }

        if (this.recursionStack.length > 0) {
            // Берем следующую группу из стека
            const nextGroup = this.recursionStack.shift();
            this.warriors = nextGroup.warriors;
            this.leftWarriors = [];
            this.rightWarriors = [];
            this.pivot = null;

            document.getElementById('status').textContent = `Обрабатываем ${nextGroup.side === 'left' ? 'левую' : 'правую'} группу (глубина: ${this.recursionDepth})`;

            this.renderWarriors();
            this.updateStats();
        } else {
            // Рекурсия завершена - проверяем победу
            this.checkWinCondition();
        }
    }

    async autoPartition() {
        if (!this.pivot) return;

        // Автоматически распределяем воинов
        for (const warrior of [...this.warriors]) {
            this.comparisonCount++;

            // Визуализация сравнения
            warrior.element.classList.add('comparing');
            await this.delay(400);

            if (warrior.strength < this.pivot.strength) {
                this.leftWarriors.push(warrior);
                warrior.element.style.setProperty('--move-x', '-100px');
            } else {
                this.rightWarriors.push(warrior);
                warrior.element.style.setProperty('--move-x', '100px');
            }

            warrior.element.classList.add('moving');
            await this.delay(300);

            warrior.element.classList.remove('comparing', 'moving');
            this.warriors = this.warriors.filter(w => w.id !== warrior.id);
            this.swapCount++;

            this.renderWarriors();
            this.updateStats();
            await this.delay(200);
        }

        this.completePartition();
    }

    async fullQuickSort() {
        while (this.warriors.length > 0 || this.recursionStack.length > 0) {
            if (!this.pivot && this.warriors.length > 0) {
                // Выбираем опорного (середина для лучшего баланса)
                const midIndex = Math.floor(this.warriors.length / 2);
                this.selectPivot(this.warriors[midIndex]);
                await this.delay(800);
            }

            if (this.pivot && this.warriors.length > 0) {
                await this.autoPartition();
                await this.delay(1000);
            } else if (this.pivot && this.warriors.length === 0) {
                await this.completePartition();
            }
        }
    }

    updateBalance() {
        const total = this.leftWarriors.length + this.rightWarriors.length;
        if (total === 0) {
            this.balance = 100;
        } else {
            const imbalance = Math.abs(this.leftWarriors.length - this.rightWarriors.length);
            this.balance = Math.max(0, 100 - (imbalance / total) * 100);
        }
    }

    resetGame() {
        this.createWarriors();
        this.recursionStack = [];
        this.partitionCount = 0;
        this.comparisonCount = 0;
        this.swapCount = 0;
        this.recursionDepth = 0;
        this.balance = 100;

        this.renderWarriors();
        this.renderSortedWarriors();

        this.updateStats();
        document.getElementById('status').textContent = 'Выбери опорного воина';

        // Убираем анимацию победы
        document.querySelectorAll('.gate').forEach(gate => gate.classList.remove('victory'));
    }

    checkWinCondition() {
        // Проверяем, все ли группы отсортированы
        const allWarriors = [...this.leftWarriors, this.pivot, ...this.rightWarriors].filter(Boolean);
        const isSorted = allWarriors.every((warrior, index, array) => {
            return index === 0 || warrior.strength >= array[index - 1].strength;
        });

        if (isSorted && this.recursionStack.length === 0) {
            document.getElementById('status').textContent = 'Победа! Порядок восстановлен! 🏆';
            document.querySelectorAll('.gate').forEach(gate => gate.classList.add('victory'));

            this.delay(3000);
            document.getElementById('winModal').style.display = 'block';
            return true;
        }
        return false;
    }

    updateStats() {
        document.getElementById('recursionDepth').textContent = this.recursionDepth;
        document.getElementById('balance').textContent = `${Math.round(this.balance)}%`;
        document.getElementById('comparisonCount').textContent = this.comparisonCount;
        document.getElementById('swapCount').textContent = this.swapCount;

        // Подсветка баланса
        const balanceElement = document.getElementById('balance');
        balanceElement.className = this.balance < 50 ? 'balance-low' : '';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Запуск игры
document.addEventListener('DOMContentLoaded', () => {
    new QuickSortGame();
});