<template>
  <div class="hello">
    <div>
      <!-- <div><router-link to="/">主页</router-link></div>
      <div><router-link to="/demos">行业案例</router-link></div>
      <div><router-link to="/about">关于我们</router-link></div>
      <div><router-link to="/contact">联系我们</router-link></div> -->
      <div>
				<div>
        <el-input v-model="userName" placeholder="请输入用户名"></el-input>
				<el-button type="primary" @click="userLogin">login</el-button>
        <span v-if="this.$store.state.show">已登录</span>
				</div>
        <span>用户登陆： {{status}} </span>
				<hr />
				<div>
					<input v-model="number1" placeholder="number1"><br />
					<input v-model="number2" placeholder="number2"><br />
					<button @click="addNumber">两个数字相加</button>
				</div>
				<div>
					<span style="color: red;font-size: 40;">两个数的结果是：{{sum}}</span>
				</div>
      </div>
    </div>
    <div class="detail-left">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>
    
  </div>
  
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import { XAHC_LOGIN_ACTION,XAHC_NUMBERADD_ACTION } from "../store/mutation-types";

export default {
  name: "Header",
  data() {
    return {
      userName: "",
			number1: 1,
			number2:2
    };
  },
  computed: mapGetters({
    status: "getStatus",
		sum: "getResult"
  }),
  methods: mapActions({
    userLogin(dispatch) {
      const { userName } = this;
      if (userName.trim()) {
        dispatch(XAHC_LOGIN_ACTION, {
          userName
        });
        // this.userName = "";
      }else {
				alert("请输入用户名");
			}
    },
		addNumber(dispatch){
			const {number1: a, number2:b} = this;
			dispatch(XAHC_NUMBERADD_ACTION, {
			  a,
				b
			});
		}
  })
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.nav {
  display: flex;
  flex-wrap: no-wrap;
  justify-content: center;
  background-color: #363636;
  color: #fff;
}
.nav > div {
  width: 100px;
  height: 50px;
  line-height: 50px;
}
a {
  color: #fff;
  text-decoration: none;
}
.detail-left {
  background-color: #ccc;
  height: 600px;
}
.app-foot {
  text-align: center;
  height: 80px;
  width: 100%;
  line-height: 80px;
  background: #e3e4e8;
}
</style>