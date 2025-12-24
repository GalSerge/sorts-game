// Функции для управления модальным окном
function showWizardModal() {
    document.getElementById('wizardModal').style.display = 'block';
}

function closeWizardModal() {
    document.getElementById('wizardModal').style.display = 'none';
}

function showHelpModal() {
    document.getElementById('helpModal').style.display = 'block';
}

function closeHelpModal() {
    document.getElementById('helpModal').style.display = 'none';
}

function updateWizardSpeech(title, speech) {
    document.querySelector('.modal-title').textContent = title;
    document.querySelector('.wizard-speech').innerHTML = speech;
}

// Закрытие по клику вне окна
window.addEventListener('click', function (event) {
    const modal = document.getElementById('wizardModal');
    const helpModal = document.getElementById('helpModal');
    if (event.target === modal) {
        closeWizardModal();
    } else if (event.target === helpModal) {
        closeHelpModal();
    }
});