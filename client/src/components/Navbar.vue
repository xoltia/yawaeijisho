<template>
  <div class="navbar">
    <router-link to="/about" class="nav-link">このサイトについて</router-link>
    <router-link to="/lists" class="nav-link">リスト</router-link>
    <div v-if="!this.auth.isAuthenticated" class="nav-btns">
      <router-link to="/signin" class="btn invert" >ログイン</router-link>
      <router-link to="/signup" class="btn" style="margin-left: 10px">登録</router-link>
    </div>
    <div v-else class="nav-btns">
      <a class="btn invert" @click="this.auth.logout">ログアウト</a>
    </div>
  </div>

  <button class="menu-btn" @click="showMobileMenu = true">
    <font-awesome-icon icon="bars" size="2x"/>
  </button>

  <div class="menu" :class="[ showMobileMenu ? 'show' : '' ]">
    <router-link to="/signin" class="menu-link" >
      <text>ログイン</text>
      <font-awesome-icon icon="chevron-right"/>
    </router-link>
    <router-link to="/signup" class="menu-link">
      <text>登録</text>
      <font-awesome-icon icon="chevron-right"/>
    </router-link>
    <router-link to="/about" class="menu-link">
      <text>このサイトについて</text>
      <font-awesome-icon icon="chevron-right"/>
    </router-link>
    <router-link to="/lists" class="menu-link">
      <text>リスト</text>
      <font-awesome-icon icon="chevron-right"/>
    </router-link>
    <a @click="showMobileMenu = false" class="menu-link">
      <text>戻る</text>
      <font-awesome-icon icon="chevron-left"/>
    </a>
  </div>
</template>

<script>
import { useAuthStore } from '../store/useAuthStore';

export default {
  name: 'Navbar',
  setup() {
    const auth = useAuthStore();
    return { auth };
  },
  data() {
    return {
      showMobileMenu: false
    }
  }
}
</script>

<style scoped>
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
</style>
