let pageHiders = {
    succesToast: document.getElementById("model-succes"),
    errorToast: document.getElementById("model-error"),
    buttonSubmit: document.getElementById("submitButton"),
    buttonSpinner: document.getElementById("buttonSpinner"),
    buttonText: document.getElementById("submitText"),
    hideToast() {
        this.buttonSpinner.style.display = 'none';
        this.succesToast.style.display = 'none';
        this.errorToast.style.display = 'none';
    },
    showSucces() {
        this.succesToast.style.display = '';
        this.errorToast.style.display = 'none';
    },
    showError() {
        this.succesToast.style.display = 'none';
        this.errorToast.style.display = '';
    },
    buttonLoader() {
        this.buttonSubmit.setAttribute("disabled", "");
        this.buttonText.textContent = '';
        this.buttonSpinner.style.display = '';
    },
    buttonLoaderRemover() {
        this.buttonSubmit.removeAttribute('disabled');
        this.buttonSpinner.style.display = 'none';
        this.buttonText.textContent = 'Send Email';
    }
};
pageHiders.hideToast();

let submitEmailContainer = {
    emailSubmmit: document.getElementById("contact-form"),
    email: document.getElementById("email"),
    subject: document.getElementById("subject"),
    name: document.getElementById("name"),
    message: document.getElementById("message"),
    succsess: false,
    errors: false,
    showToast() {
        console.log(this.succsess, this.errors)
    },
    submitEmail(e) {
        e.preventDefault();
        pageHiders.buttonLoader();
        const body = {
            email: this.email.value,
            subject: this.subject.value,
            message: this.message.value,
            name: this.name.value,
        }
        fetch('https://alfonsojan.pythonanywhere.com/contact', { method: 'POST', body: JSON.stringify(body), headers: {'Accept': 'application/json, text/plain, */*','Content-Type': 'application/json'}, })
        .then((res) => {
            if (res.status === 200) {
                this.errors = false;
                this.succsess = true;
            } else {
                this.errors = true;
                this.succsess = false;
            }
        }).catch(() => {
            this.errors = true;
            this.succsess = false;
        })
        .finally(() => {
            pageHiders.buttonLoaderRemover();
            this.email.value = '',
            this.subject.value = '',
            this.message.value = '',
            this.name.value =  '';
            if (this.succsess) pageHiders.showSucces();
            if (this.errors) pageHiders.showError();
        })
    }
}

document.addEventListener('DOMContentLoaded', function() {
    submitEmailContainer.emailSubmmit.addEventListener('submit', submitEmailContainer.submitEmail);
});