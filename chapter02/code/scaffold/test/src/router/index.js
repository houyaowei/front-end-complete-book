import Vue from "vue";
import Router from "vue-router";
import Main from "@/components/Main";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "Header",
      component: Main,
      children: [
        // {
        //   path: "demos",
        //   name: "Demos",
        //   component: Demos,
        //   children: []
        // },
        // {
        //   path: "about",
        //   name: "About",
        //   component: About
        // },
        // {
        //   path: "contact",
        //   name: "Contact",
        //   component: Contact
        // }
      ]
    }
  ]
});
