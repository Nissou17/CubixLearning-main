const questions = document.getElementById("questions");
const text = document.getElementById("assistant-text");

// ====== Authentication Functions ======

function openAuthModal(tab) {
    document.getElementById('authModal').style.display = 'flex';
    if (tab === 'register') {
        switchToRegister();
    } else {
        switchToLogin();
    }
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
    clearAuthErrors();
}

function switchToLogin() {
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('registerTab').classList.remove('active');
    document.getElementById('authTitle').textContent = 'Se connecter';
}

function switchToRegister() {
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('registerTab').classList.add('active');
    document.getElementById('authTitle').textContent = "S'inscrire";
}

function clearAuthErrors() {
    document.getElementById('loginError').textContent = '';
    document.getElementById('registerError').textContent = '';
    const successEl = document.getElementById('registerSuccess');
    if (successEl) successEl.textContent = '';
}

// ── Connexion ─────────────────────────────────────────────────────────────
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = '';

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            closeAuthModal();
            location.reload(); // Flask injecte le nom via Jinja2 après rechargement
        } else {
            errorDiv.textContent = data.msg || 'Erreur de connexion';
        }
    })
    .catch(error => {
        errorDiv.textContent = 'Erreur lors de la connexion';
        console.error('Error:', error);
    });
}

// ── Inscription ───────────────────────────────────────────────────────────
function handleRegister(event) {
    event.preventDefault();
    const username        = document.getElementById('registerUsername').value.trim();
    const password        = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv        = document.getElementById('registerError');
    const successEl       = document.getElementById('registerSuccess');
    errorDiv.textContent  = '';
    if (successEl) successEl.textContent = '';

    if (password !== confirmPassword) {
        errorDiv.textContent = 'Les mots de passe ne correspondent pas';
        return;
    }

    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            if (successEl) successEl.textContent = data.msg;
            setTimeout(() => switchToLogin(), 1500); // Bascule vers connexion après 1.5s
        } else {
            errorDiv.textContent = data.msg || "Erreur lors de l'inscription";
        }
    })
    .catch(error => {
        errorDiv.textContent = "Erreur lors de l'inscription";
        console.error('Error:', error);
    });
}

// ── Déconnexion ───────────────────────────────────────────────────────────
function logout() {
    fetch('/logout')
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            location.reload(); // Flask efface la session, Jinja2 reaffiche "Se connecter"
        }
    })
    .catch(error => console.error('Error:', error));
}

// Fermer la modal en cliquant sur le fond
window.addEventListener('click', (event) => {
    const modal = document.getElementById('authModal');
    if (event.target === modal) {
        closeAuthModal();
    }
});

// ====== Assistant & Original Functions ======

if (questions && text) {
    questions.addEventListener("change", function () {
        if (this.value === "motdepasse") {
            text.innerHTML = "Cliquez sur 'Mot de passe oublié'";
            highlight("forgot");
            setTimeout(resetAssistant, 15000);
        } else if (this.value === "interface") {
            startInterfaceTour();
        } else {
            resetAssistant();
        }
    });
}

function highlight(id) {
    document.querySelectorAll(".highlight").forEach(el => el.classList.remove("highlight"));
    const element = document.getElementById(id);
    if (element) {
        element.classList.add("highlight");
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function clearHighlight() {
    document.querySelectorAll(".highlight").forEach(el => el.classList.remove("highlight"));
}

function resetAssistant() {
    text.innerHTML = "Bonjour ! Besoin d'aide ?";
    clearHighlight();
    questions.value = "";
}

function startInterfaceTour() {
    const steps = [
        { id: "search-bar", message: "Voici la barre de recherche Google. Cette dernière permet de vérifier des informations sur internet, ou même pour les plus motivés, à tester notre apprentissage en situation réelle ! - Vous pouvez soit cliquer sur le 🍀, soit en appuyent sur la touche Entrée ou Enter (des fois flèche brisée vers la gauche)" },
        { id: "signup",     message: "Pour sauvegarder votre progression dans le cours, vous pouvez vous connecter ou créer un compte via le bouton Compte " },
        { id: "langues",    message: "Pour les plus bilingues d'entre vous, ce bouton permet de changer la langue du site." },
        { id: "taille-texte", message: "Si vous avez du mal à voir, pas de panique ! Ce bouton ajuste la taille du texte." },
        { id: "card1", message: "Voici le premier cours, il vous permettra de comprendre l'interface, les différeentes applications comment envoyer des messages etc" },
        { id: "card2", message: "Vient après, le second cours, il vous permettra de vous habituer à l'outil que vous utilisé actuellement, de comprendre les différentes possibilités et fonctionnalités etc" },
        { id: "card3", message: "Ensuite, voici le troisième cours, il vous permettra de vous sortir de situation où vous pourriez vite panniquer en étant débutant, ou encore faire le beau devant vos proches ou collègues et devenir un technicien essentiel" },
        { id: "card4", message: "Voici enfin le dernier cours proposé, il vous montrera qu'internet n'est pas tout le temps génial et que des personnes malveillantes peuvent vite arnaquer des personnes comme vous et même des fois des personnes expérimentées !" }
    ];
    let currentStep = 0;
    function nextStep() {
        if (currentStep < steps.length) {
            const step = steps[currentStep];
            highlight(step.id);
            text.innerHTML = step.message;
            currentStep++;
            setTimeout(nextStep, 12000);
        } else {
            setTimeout(resetAssistant, 1000);
        }
    }
    nextStep();
}

// ====== Scroll & UI ======

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleTextSize() {
    let box = document.getElementById("textSizeControl");
    box.style.display = (box.style.display === "none") ? "block" : "none";
}

function changeTextSize(size) {
    document.body.style.fontSize = size + "px";
}

// ====== Recherche Google ======

function searchGoogle() {
    const searchInput = document.getElementById('search-input').value;
    if (searchInput.trim() !== '') {
        window.open('https://www.google.com/search?q=' + encodeURIComponent(searchInput), '_blank');
    } else {
        alert('Veuillez entrer un terme de recherche');
    }
}

function handleSearchEnter(event) {
    if (event.key === 'Enter') {
        searchGoogle();
    }
}

// ====== Langue ======

function changeLanguage(lang) {
    localStorage.setItem("language", lang);

    if (lang === "en") {
        document.getElementById("title").textContent          = "Welcome to CubixLearning";
        document.getElementById("lessons").textContent        = "Lessons";
        document.getElementById("aboutMenu").textContent      = "About";
        document.getElementById("contactMenu").textContent    = "Contact";
        document.getElementById("taille-texte").textContent   = "Text size";
        document.getElementById("search-input").placeholder   = "Search with Google...";
        document.getElementById("aboutTitle").textContent     = "About CubixLearning";
        document.getElementById("aboutText").textContent      = "Welcome. This website was created to help you better understand and use digital tools in your daily life, step by step and without stress. Here, you will learn how to perform practical actions (sending a document, recognizing a suspicious message, using an online service), with simple explanations and continuous guidance. You can take your time, start again as many times as necessary, and get help at every step.";
        document.getElementById("title1").textContent         = "1 - Smartphone oriented learning";
        document.getElementById("title2").textContent         = "2 - Computer oriented learning";
        document.getElementById("title3").textContent         = "3 - How to fix small technical problems?";
        document.getElementById("title4").textContent         = "4 - How to avoid online scams?";
        document.getElementById("contactTitle").textContent   = "Contact us";
        document.getElementById("contactText").textContent    = "For any question or request, feel free to contact us at: cubixlearningdev@gmail.com";
        document.getElementById("footerText").textContent     = "© 2026 CubixLearning. All rights reserved.";

        // Boutons auth (seulement si présents dans le DOM)
        const signup = document.getElementById('signup');
        const logout = document.getElementById('logout');
        if (signup) signup.textContent = signup.dataset.loggedIn === "true" ? signup.textContent : "Login";
        if (logout) logout.textContent = "Logout";
    }

    if (lang === "fr") {
        document.getElementById("title").textContent          = "Bienvenue chez CubixLearning";
        document.getElementById("lessons").textContent        = "Leçons";
        document.getElementById("aboutMenu").textContent      = "À propos";
        document.getElementById("contactMenu").textContent    = "Contact";
        document.getElementById("taille-texte").textContent   = "Taille Texte";
        document.getElementById("search-input").placeholder   = "Rechercher via Google...";
        document.getElementById("aboutTitle").textContent     = "À propos de CubixLearning";
        document.getElementById("aboutText").textContent      = "Bienvenue. Ce site a été conçu pour vous aider à mieux comprendre et utiliser le numérique au quotidien, pas à pas et sans stress. Ici, vous apprenez à réaliser des actions concrètes (envoyer un document, reconnaître un message suspect, utiliser un service en ligne), avec des explications simples et un accompagnement permanent. Vous pouvez prendre votre temps, recommencer autant que nécessaire, et vous faire aider à chaque étape.";
        document.getElementById("title1").textContent         = "1 - Enseignement orienté smartphone";
        document.getElementById("title2").textContent         = "2 - Enseignement orienté ordinateur";
        document.getElementById("title3").textContent         = "3 - Comment dépanner des petits problèmes techniques ?";
        document.getElementById("title4").textContent         = "4 - Comment ne pas se faire arnaquer en ligne ?";
        document.getElementById("contactTitle").textContent   = "Contactez-nous";
        document.getElementById("contactText").textContent    = "Pour toute question ou demande, n'hésitez pas à nous contacter. Contactez-nous à l'adresse email : cubixlearningdev@gmail.com";
        document.getElementById("footerText").textContent     = "© 2026 CubixLearning. Tous droits réservés.";

        const signup = document.getElementById('signup');
        const logout = document.getElementById('logout');
        if (signup) signup.textContent = signup.dataset.loggedIn === "true" ? signup.textContent : "Se connecter";
        if (logout) logout.textContent = "Déconnexion";
    }
}

// ====== Init au chargement ======

window.onload = function () {
    // Restaurer la langue sauvegardée
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
        changeLanguage(savedLanguage);
    }
    // Note : l'état connecté/déconnecté est géré par Jinja2 (Flask session),
    // pas besoin de localStorage pour l'auth.
};