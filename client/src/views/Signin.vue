<template>
  <div class="form" @keyup.enter.prevent="handleSubmit">
    <h1>{{ $t(isSignup ? 'welcome' : 'welcome-back') }}</h1>
    <div class="error-msg big" v-for="err in errors.$" :key="err.name">
      {{ err.message }}
    </div>
    <input
      :class="['form-input', errors.username ? 'error' : '']"
      v-model="username"
      type="text"
      :placeholder="$t('username-placeholder')"
    />
    <div class="error-msg" v-for="err in errors.username" :key="err.name">
      {{ err.message }}
    </div>
    <input
      :class="['form-input', errors.password ? 'error' : '']"
      v-model="password"
      type="password"
      :placeholder="$t('pwd-placeholder')"
    />
    <div class="error-msg" v-for="err in errors.password" :key="err.name">
      {{ err.message }}
    </div>
    <input
      class="form-input"
      v-if="isSignup"
      v-model="passwordConfirmation"
      type="password"
      :placeholder="$t('pwd-confirm-placeholder')"
    />
    <router-link to="/" class="link">{{ $t('return-home-link') }}</router-link>
    <a :class="['btn', canSubmit ? '' : 'disabled']" @click="handleSubmit">
      {{ isSignup ? $t('signup-button'): $t('login-button') }}
    </a>
  </div>
</template>

<script>
import { useAuthStore } from '../store/useAuthStore';

export default {
  name: 'Signin',
  setup() {
    const auth = useAuthStore();
    return { auth };
  },
  data() {
    return {
      username: '',
      password: '',
      passwordConfirmation: '',
      errors: {}
    }
  },
  props: {
    isSignup: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    canSubmit() {
      // Make sure a username has been input, and that this is either a login form or that the password confirm matched
      return this.username && this.password && (!this.isSignup || this.password === this.passwordConfirmation);
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.canSubmit)
        return;

      try {
        if (this.isSignup)
          await this.auth.register(this.username, this.password);
        else
          await this.auth.login(this.username, this.password);

        this.$router.push('/');
      } catch (e) {
        this.showApiErrors(e);
      }

    },
    showApiErrors(errors) {
      // Reset old errors
      this.errors = {};

      for (let err of errors) {
        // Second part of error says what field is causing error
        const param = err.error.split('_')[1].toLowerCase();
        const message = err.message;
        this.errors[param] = this.errors[param] || [];
        this.errors[param].push({ name: err.error, message });
      }
    }
  }
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  text-align: center;
  max-width: 400px;
  margin: auto;
  margin-top: 15vh;
  background: white;
  padding: 50px 30px;
  box-shadow: 0px 0px 15px 0px lightgray;
  border-radius: 3px;
}

.form h1 {
  margin: 0;
  margin-bottom: 20px;
}

.form .form-input {
  font-size: 15px;
  padding: 10px;
  text-align: center;
  margin-bottom: 5px;
  border: 1px solid lightgray;
}

.form .form-input.error {
  border-color: lightcoral;
}

.form .link {
  font-size: 12px;
  margin: 10px 0;
}

.form .error-msg {
  font-size: 10px;
  padding: 3px;
  color: lightcoral;
  border-radius: 3px;
  margin-bottom: 10px;
}

.form .error-msg.big {
  font-size: 12px;
}

@media (max-width: 450px) {
  /* Blend in with background on small screens */
  .form {
    margin-top: 10vh;
    box-shadow: none;
    background: whitesmoke;
  }
}
</style>
