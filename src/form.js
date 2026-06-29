/**
 * Çark Widget - Form Manager
 * Form validasyonları ve maskeleme
 */

export class FormManager {
  constructor(formElement, config, callbacks) {
    this.form = formElement;
    this.config = config;
    this.callbacks = callbacks;
    this.errorContainer = this.form.querySelector('#cark-error');

    this.inputs = {
      name: this.form.querySelector('#cark-name'),
      phone: this.form.querySelector('#cark-phone'),
      email: this.form.querySelector('#cark-email'),
      kvkk1: this.form.querySelector('#cark-kvkk1'),
      kvkk2: this.form.querySelector('#cark-kvkk2'),
    };

    this.setupListeners();
  }

  setupListeners() {
    // Phone mask (5XX XXX XX XX)
    this.inputs.phone.addEventListener('input', (e) => {
      const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
      if (!x) {
        return;
      }

      // Prevent entering anything other than 5 as first digit
      if (x[1] && x[1][0] !== '5') {
        x[1] = '5' + x[1].substring(1);
      }

      e.target.value = !x[2]
        ? x[1]
        : !x[3]
          ? `${x[1]} ${x[2]}`
          : !x[4]
            ? `${x[1]} ${x[2]} ${x[3]}`
            : `${x[1]} ${x[2]} ${x[3]} ${x[4]}`;
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const validation = this.validate();

      if (validation.valid) {
        if (this.callbacks.onSubmit) {
          this.callbacks.onSubmit(this.getData());
        }
      } else {
        this.showError(validation.errors[0]);
      }
    });

    // Clear error on input
    Object.values(this.inputs).forEach((input) => {
      if (input) {
        input.addEventListener('input', () => this.clearError());
        input.addEventListener('change', () => this.clearError());
      }
    });
  }

  validate() {
    const errors = [];

    // Clear previous highlights
    Object.values(this.inputs).forEach((input) => {
      if (input && input.classList) {
        input.classList.remove('error');
      }
    });

    // Name: min 2 chars, should have a space (Ad Soyad)
    const nameVal = this.inputs.name.value.trim();
    if (nameVal.length < 3 || !nameVal.includes(' ')) {
      errors.push('Lütfen adınızı ve soyadınızı giriniz.');
      this.inputs.name.classList.add('error');
    }

    // Phone: length check
    const phoneVal = this.inputs.phone.value.replace(/\D/g, '');
    if (phoneVal.length !== 10 || !phoneVal.startsWith('5')) {
      errors.push('Geçerli bir telefon numarası giriniz (5XX...).');
      this.inputs.phone.classList.add('error');
    }

    // Email
    const emailVal = this.inputs.email.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      errors.push('Geçerli bir e-posta adresi giriniz.');
      this.inputs.email.classList.add('error');
    }

    // KVKK Checkboxes
    if (!this.inputs.kvkk1.checked || !this.inputs.kvkk2.checked) {
      errors.push('Lütfen sözleşme ve aydınlatma metinlerini onaylayınız.');
    }

    return { valid: errors.length === 0, errors };
  }

  getData() {
    return {
      name: this.inputs.name.value.trim(),
      phone: this.inputs.phone.value.replace(/\D/g, ''),
      email: this.inputs.email.value.trim(),
    };
  }

  showError(msg) {
    this.errorContainer.textContent = msg;
    this.errorContainer.style.animation = 'none';
    this.errorContainer.offsetHeight; // trigger reflow
    this.errorContainer.style.animation = 'carkShake 0.4s ease';
  }

  clearError() {
    this.errorContainer.textContent = '';
  }

  reset() {
    this.form.reset();
    this.clearError();
  }
}
