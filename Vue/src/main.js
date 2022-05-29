import { createApp } from 'vue'
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import App from './App.vue';
const app = createApp(App)
app.mount('#app');

app.use(Toast, {
    transition: "Vue-Toastification__fade",
    maxToasts: 5,
    newestOnTop: true,
    filterBeforeCreate: (toast, toasts) => {
        if (toasts.filter(
          t => t.type === toast.type
        ).length !== 0) {
          return false;
        }
        return toast;
      }
});




