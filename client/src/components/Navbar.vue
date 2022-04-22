<template>
  <div class="navbar">
    <span :class="['dot', ankiConnect.isOnline ? 'green' : 'red']" @click="$router.push({ name: 'AnkiSettings' })"></span>
    <span :class="['dot-description', ankiConnect.isOnline ? 'green' : 'red']">
      {{ ankiConnect.isOnline ? $t('anki-connected') : $t('anki-not-connected') }}
    </span>
    <router-link v-if="showHomeLink" to="/" class="nav-link">{{ $t('home-link') }}</router-link>
    <router-link to="/about" class="nav-link">{{ $t('about-link') }}</router-link>
    <router-link v-if="showListsLink" to="/lists" class="nav-link">{{ $t('lists-link') }}</router-link>
    <LocaleSwitcher/>
    <div v-if="!this.auth.isAuthenticated" class="nav-btns">
      <router-link to="/signin" class="btn invert" >{{ $t('login-button') }}</router-link>
      <router-link to="/signup" class="btn" style="margin-left: 10px">{{ $t('signup-button') }}</router-link>
    </div>
    <div v-else class="nav-btns">
      <a class="btn invert" @click="this.auth.logout">{{ $t('logout-button') }}</a>
    </div>
  </div>

  <button class="menu-btn" @click="showMobileMenu = true">
    <font-awesome-icon icon="bars" size="2x"/>
  </button>

  <div class="menu" :class="[ showMobileMenu ? 'show' : '' ]">
    <router-link v-if="showHomeLink" to="/" class="menu-link">
      <text>{{ $t('home-link') }}</text>
      <font-awesome-icon icon="chevron-right"/>
    </router-link>
    <router-link v-if="!this.auth.isAuthenticated" to="/signin" class="menu-link" >
      <text>{{ $t('login-button') }}</text>
      <font-awesome-icon icon="chevron-right"/>
    </router-link>
    <router-link v-if="!this.auth.isAuthenticated" to="/signup" class="menu-link">
      <text>{{ $t('signup-button') }}</text>
      <font-awesome-icon icon="chevron-right"/>
    </router-link>
    <router-link to="/about" class="menu-link">
      <text>{{ $t('about-link') }}</text>
      <font-awesome-icon icon="chevron-right"/>
    </router-link>
    <router-link v-if="showListsLink" to="/lists" class="menu-link">
      <text>{{ $t('lists-link') }}</text>
      <font-awesome-icon icon="chevron-right"/>
    </router-link>
    <a v-if="this.auth.isAuthenticated" class="menu-link" @click="this.auth.logout">
      <text>{{ $t('logout-button') }}</text>
      <font-awesome-icon icon="chevron-left"/>
    </a>
    <a @click="showMobileMenu = false" class="menu-link">
      <text>{{ $t('return-link') }}</text>
      <font-awesome-icon icon="chevron-left"/>
    </a>
    <LocaleSwitcher class="mobile-locale-switch"/>
  </div>
</template>

<script>
import LocaleSwitcher from '../components/LocaleSwitcher.vue';
import { useAuthStore } from '../store/useAuthStore';
import { useAnkiStore } from '../store/useAnkiStore';

export default {
  name: 'Navbar',
  components: {
    LocaleSwitcher
  },
  props: {
    showHomeLink: {
      type: Boolean,
      default: true
    },
    showListsLink: {
      type: Boolean,
      default: true
    },
  },
  setup() {
    const auth = useAuthStore();
    const ankiConnect = useAnkiStore();

    ankiConnect.tryConnect();

    return { auth, ankiConnect };
  },
  data() {
    return {
      showMobileMenu: false
    }
  },
  watch: {
    showMobileMenu(show) {
      // Hide scrolling when looking at mobile menu
      document.documentElement.style.overflow = show ? 'hidden' : 'auto';
    }
  }
}
</script>

<style scoped>
.mobile-locale-switch {
  padding: 5px;
  max-width: 100px;
  align-self: center;
}

.navbar {
  display: flex;
  margin-top: 20px;
  align-items: center;
  padding: 0 15px;
  flex-wrap: wrap-reverse;
}

.nav-btns {
  margin-left: auto;
}

.nav-link {
  font-weight: bold;
  font-size: 14px;
  margin: 0;
  margin-right: 15px;
}

.nav-link.logo {
  font-size: 25px;
}

.menu {
  position: absolute;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100vw;
  background: whitesmoke;
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: ease-in 0.5s;
  z-index: 1;
}

.menu.show {
  transform: translateX(0%);
  transition: ease-out 0.5s;
}

.menu-link {
  padding: 12px;
  text-decoration: none;
  font-weight: bold;
  color: #2c3e50;
  display: flex;
}

.menu-link > svg {
  margin-left: auto;
}

.menu-btn {
  display: none;
  border: none;
  background: none;
}

@media (max-width: 450px){
  .navbar {
    display: none;
  }

  .menu-btn {
    display: block;
  }
}

.dot {
  height: 12px;
  width: 12px;
  background-color: gray;
  border-radius: 50%;
  display: inline-block;
  margin-right: 10px;
}

.dot.red {
  background-color: lightcoral;
}

.dot.green {
  background-color: lightgreen;
}

.dot-description {
  display: none;
}

.dot-description.red {
  color: lightcoral;
}

.dot-description.green {
  color: rgb(0, 190, 0);
}

.dot:hover~.dot-description {
  display: block;
  margin-right: 10px;
}

.dot:hover {
  cursor: pointer;
}
</style>
