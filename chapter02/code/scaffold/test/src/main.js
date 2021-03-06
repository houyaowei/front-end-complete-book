import Vue from "vue";
import App from "./App.vue";
import ElementUI from "element-ui";
import 'element-ui/lib/theme-chalk/index.css';
import Router from "./router/index";
import store from "./store/store";
import ApolloClient from "apollo-boost";
import VueApollo from "vue-apollo";

const apolloClient = new ApolloClient({
	uri:"http://localhost:4000/graphql"
});
Vue.use(ElementUI);
Vue.use(VueApollo);
const apolloProvider = new VueApollo({
 defaultClient: apolloClient,
});
		
Vue.config.productionTip = false;

new Vue({
  store,
  router: Router,
  render: h => h(App),
	apolloProvider
}).$mount("#app");
