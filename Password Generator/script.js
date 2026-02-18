var passwordBox = document.getElementById("password");
var lengthSlider = document.getElementById("lengthSlider");
var lengthValue = document.getElementById("lengthValue");
var hasUppercase = document.getElementById("uppercase");
var hasNumbers = document.getElementById("numbers");
var hasSymbols = document.getElementById("symbols");
var strengthText = document.getElementById("strength");

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*(){}[]<>?/\\";

function onLengthSliderChange() {
    lengthValue.textContent = lengthSlider.value;
    generatePassword();
}

function onCheckboxChange() {
    generatePassword();
}

function generatePassword() {
    let characters = LOWERCASE;
    let length = lengthSlider.value;

    if (hasUppercase.checked) characters += UPPERCASE;
    if (hasNumbers.checked) characters += NUMBERS;
    if (hasSymbols.checked) characters += SYMBOLS;

    console.log(characters);

    let password = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
    }

    passwordBox.textContent = password;
    checkStrength(password)
}

function checkStrength(password) {
    let strength = 0;

    if (password.length >= 12) strength++;
    if (hasNumbers.checked) strength++;
    if (hasSymbols.checked) strength++;
    if (hasUppercase.checked) strength++;


    if (strength <= 1) {
        strengthText.textContent = "Strength: Weak";
        strengthText.style.color = "red";
    } else if (strength === 2 || strength === 3) {
        strengthText.textContent = "Strength: Medium";
        strengthText.style.color = "orange";
    } else {
        strengthText.textContent = "Strength: Strong";
        strengthText.style.color = "green";
    }
}