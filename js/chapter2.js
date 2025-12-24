class TowerSelectionGame {
    constructor() {
        this.blocks = [];
        this.sortedBlocks = [];
        this.currentMinIndex = -1;
        this.currentMinValue = Infinity;
        this.stepCount = 0;
        this.minFoundCount = 0;
        this.stability = 100;
        this.blockCount = 8;

        this.init();
    }

    init() {
        this.createBlocks();
        this.renderBlocks();
        this.setupEventListeners();
        this.updateStats();
    }

    createBlocks() {
        this.blocks = [];
        this.sortedBlocks = [];

        const sizes = [40, 50, 60, 70, 80, 90, 100, 110];
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEAA7', '#DDA0DD', '#FFA07A', '#20B2AA'
        ];

        // Перемешиваем размеры
        const shuffledSizes = [...sizes].sort(() => Math.random() - 0.5);

        for (let i = 0; i < this.blockCount; i++) {
            this.blocks.push({
                id: i,
                size: shuffledSizes[i],
                color: colors[i],
                value: shuffledSizes[i],
                element: null
            });
        }

        this.resetSelection();
    }

    renderBlocks() {
        const unsortedContainer = document.getElementById('unsortedBlocks');
        const tower = document.getElementById('tower');

        // Очищаем контейнеры
        unsortedContainer.innerHTML = '';
        tower.innerHTML = '';

        // Рендерим неотсортированные блоки
        this.blocks.forEach((block, index) => {
            const blockElement = document.createElement('div');
            blockElement.className = 'magic-block';
            blockElement.style.width = `${block.size}px`;
            blockElement.style.height = `${block.size}px`;
            blockElement.style.background = block.color;
            blockElement.textContent = block.value;
            blockElement.dataset.index = index;
            blockElement.dataset.value = block.value;

            block.element = blockElement;
            unsortedContainer.appendChild(blockElement);

            blockElement.addEventListener('click', () => this.handleBlockClick(index));
        });

        // Рендерим отсортированные блоки в башне
        this.sortedBlocks.forEach((block, index) => {
            const blockElement = document.createElement('div');
            blockElement.className = 'magic-block';
            blockElement.style.width = `${block.size}px`;
            blockElement.style.height = `${block.size}px`;
            blockElement.style.background = block.color;
            blockElement.textContent = block.value;
            blockElement.style.order = index; // Для правильного порядка в flex

            tower.appendChild(blockElement);
        });

        // Обновляем состояние башни
        this.updateTowerStability();
    }

    setupEventListeners() {
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
    }

    handleBlockClick(clickedIndex) {
        this.currentMinIndex = clickedIndex;
        if (this.blocks.length === 0) return;

        const clickedBlock = this.blocks[clickedIndex];

        // Проверяем, является ли выбранный блок текущим минимумом
        if (this.currentMinIndex === -1 || clickedBlock.value <= this.currentMinValue) {
            // Снимаем выделение с предыдущего минимума
            if (this.currentMinIndex !== -1) {
                this.blocks[this.currentMinIndex].element.classList.remove('candidate');
            }

            // Устанавливаем новый минимум
            this.currentMinIndex = clickedIndex;
            this.currentMinValue = clickedBlock.value;
            clickedBlock.element.classList.add('candidate');

            document.getElementById('status').textContent = 'Отличный выбор! Теперь найди блок меньше или подтверди этот';
        } else {
            // Неправильный выбор - теряем стабильность
            this.loseStability(15);
            clickedBlock.element.classList.add('incorrect');
            setTimeout(() => {
                clickedBlock.element.classList.remove('incorrect');
            }, 1000);

            document.getElementById('status').textContent = 'Этот блок больше текущего минимума! Ищи меньше';
        }

        this.updateStats();
    }

    async confirmSelection() {
        if (this.currentMinIndex === -1) return;

        this.stepCount++;
        this.minFoundCount++;

        const selectedBlock = this.blocks[this.currentMinIndex];

        // Анимация перемещения блока
        selectedBlock.element.classList.add('moving');

        await this.delay(1000);

        // Перемещаем блок из неотсортированных в отсортированные
        this.sortedBlocks.push(selectedBlock);
        this.blocks.splice(this.currentMinIndex, 1);

        // Проверяем, является ли выбранный блок текущим минимумом
        if (this.sortedBlocks.length > 2) {
            if (this.sortedBlocks[this.sortedBlocks.length - 1].value >= this.sortedBlocks[this.sortedBlocks.length - 2].value)
                // Восстанавливаем немного стабильности за правильный ход
                this.gainStability(5);
            else
                // Неправильный выбор - теряем стабильность
                this.loseStability(15);
        }

        this.renderBlocks();
        this.resetSelection();
        this.updateStats();

        document.getElementById('status').textContent = 'Отлично! Теперь найди следующий самый маленький блок';

        // Проверяем победу
        if (this.blocks.length === 0) {
            this.checkWinCondition();
        }
    }

    resetSelection() {
        this.currentMinIndex = -1;
        this.currentMinValue = Infinity;
    }

    loseStability(amount) {
        this.stability = Math.max(0, this.stability - amount);
        this.updateTowerStability();

        if (this.stability <= 0) {
            this.gameOver();
        }
    }

    gainStability(amount) {
        this.stability = Math.min(100, this.stability + amount);
        this.updateTowerStability();
    }

    updateTowerStability() {
        const tower = document.getElementById('tower');
        const stabilityElement = document.getElementById('stability');

        stabilityElement.textContent = `${this.stability}%`;

        // Убираем все классы стабильности
        tower.classList.remove('stable', 'shaking');
        stabilityElement.classList.remove('stability-low', 'stability-medium');

        // Добавляем соответствующие классы
        if (this.stability <= 30) {
            tower.classList.add('shaking');
            stabilityElement.classList.add('stability-low');
        } else if (this.stability <= 60) {
            stabilityElement.classList.add('stability-medium');
        } else if (this.stability === 100) {
            tower.classList.add('stable');
        }
    }

    resetGame() {
        this.createBlocks();
        this.renderBlocks();
        this.resetGameState();
    }

    resetGameState() {
        this.stepCount = 0;
        this.minFoundCount = 0;
        this.stability = 100;
        this.resetSelection();
        this.updateStats();
        document.getElementById('status').textContent = 'Выбери самый маленький блок';
    }

    checkWinCondition() {
        if (this.blocks.length === 0 && this.sortedBlocks.length === this.blockCount) {
            // Проверяем, что башня отсортирована правильно
            const isSorted = this.sortedBlocks.every((block, index, array) => {
                return index === 0 || block.value >= array[index - 1].value;
            });

            if (isSorted) {
                document.getElementById('status').textContent = 'Победа! Мост построен идеально! 🏆';
                document.getElementById('tower').classList.add('victory');

                this.delay(3000);
                document.getElementById('winModal').style.display = 'block';
                return true;
            } else {
                this.gameOver();
            }
        }
        return false;
    }

    gameOver() {
        document.getElementById('status').textContent = 'Мост разрушен! Начни заново 💥';
    }

    updateStats() {
        document.getElementById('stepCount').textContent = this.stepCount;
        document.getElementById('minFoundCount').textContent = this.minFoundCount;
        document.getElementById('stability').textContent = `${this.stability}%`;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Автоматическое подтверждение выбора при двойном клике на блок-кандидат
document.addEventListener('DOMContentLoaded', () => {
    const game = new TowerSelectionGame();

    // Добавляем обработчик двойного клика для подтверждения выбора
    document.addEventListener('dblclick', (event) => {
        if (event.target.classList.contains('magic-block') &&
            event.target.classList.contains('candidate')) {
            game.confirmSelection();
        }
    });
});