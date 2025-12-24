class FrogSortingGame {
    constructor() {
        this.frogs = [];
        this.selectedFrog = null;
        this.stepCount = 0;
        this.swapCount = 0;
        this.frogCount = 6;

        this.init();
    }

    init() {
        this.createFrogs();
        this.renderFrogs();
        this.setupEventListeners();
        this.updateStats();
    }

    createFrogs() {
        this.frogs = [];
        const sizes = [30, 40, 50, 60, 70, 80];
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

        // Перемешиваем размеры
        const shuffledSizes = [...sizes].sort(() => Math.random() - 0.5);

        for (let i = 0; i < this.frogCount; i++) {
            this.frogs.push({
                id: i,
                size: shuffledSizes[i],
                color: colors[i],
                element: null
            });
        }
    }

    renderFrogs() {
        const lilyPads = document.getElementById('lilyPads');
        lilyPads.innerHTML = '';

        this.frogs.forEach((frog, index) => {
            const lilyPad = document.createElement('div');
            lilyPad.className = 'lily-pad';

            const frogElement = document.createElement('div');
            frogElement.className = 'frog';
            frogElement.style.width = `${frog.size}px`;
            frogElement.style.height = `${frog.size}px`;
            frogElement.style.background = frog.color;
            frogElement.textContent = frog.size;
            frogElement.dataset.index = index;
            frogElement.dataset.size = frog.size;

            frog.element = frogElement;
            lilyPad.appendChild(frogElement);
            lilyPads.appendChild(lilyPad);

            // Добавляем обработчик клика
            frogElement.addEventListener('click', () => this.handleFrogClick(index));
        });
    }

    setupEventListeners() {
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
    }

    handleFrogClick(clickedIndex) {
        if (this.selectedFrog === null) {
            // Первый выбор
            this.selectedFrog = clickedIndex;
            this.frogs[clickedIndex].element.classList.add('selected');
        } else {
            // Второй выбор - попытка обмена
            if (this.areNeighbors(this.selectedFrog, clickedIndex)) {
                this.swapFrogs(this.selectedFrog, clickedIndex);
                this.stepCount++;
            }

            // Снимаем выделение в любом случае
            this.frogs[this.selectedFrog].element.classList.remove('selected');
            this.selectedFrog = null;
            this.updateStats();
        }
    }

    areNeighbors(index1, index2) {
        return Math.abs(index1 - index2) === 1;
    }

    async swapFrogs(index1, index2) {
        this.swapCount++;

        // Визуализация сравнения
        this.frogs[index1].element.classList.add('compare');
        this.frogs[index2].element.classList.add('compare');

        await this.delay(500);

        // Анимация перестановки
        this.frogs[index1].element.classList.add('moving');
        this.frogs[index2].element.classList.add('moving');

        // Меняем местами в массиве
        [this.frogs[index1], this.frogs[index2]] = [this.frogs[index2], this.frogs[index1]];

        await this.delay(500);

        // Перерисовываем
        this.renderFrogs();

        // Убираем классы анимации
        this.frogs.forEach(frog => {
            if (frog.element) {
                frog.element.classList.remove('compare', 'moving');
            }
        });

        this.checkWinCondition();
    }

    resetGame() {
        this.createFrogs();
        this.renderFrogs();
        this.stepCount = 0;
        this.swapCount = 0;
        this.selectedFrog = null;
        this.updateStats();
        document.querySelector('.lily-pads').classList.remove('victory');
    }

    checkWinCondition() {
        const isSorted = this.frogs.every((frog, index, array) => {
            return index === 0 || frog.size >= array[index - 1].size;
        });

        console.log(isSorted);
        console.log(this.frogs);

        if (isSorted) {
            document.querySelector('.lily-pads').classList.add('victory');
            this.delay(3000);
            document.getElementById('winModal').style.display = 'block';
            return true;
        }
        return false;
    }

    updateStats() {
        document.getElementById('stepCount').textContent = this.stepCount;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Запуск игры когда страница загружена
document.addEventListener('DOMContentLoaded', () => {
    new FrogSortingGame();
});