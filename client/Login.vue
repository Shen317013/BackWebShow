<template>
	<div class="login">
		<div class="login-container" v-if="!isLoggedIn">
			<div class="login-mask">
				<h2>用戶登入</h2>
				<div class="login-wrapper">
					<el-form :model="loginUser" :rules="rules" ref="loginForm" label-width="4vw" class="loginForm">
						<div class="login-email">
							<el-form-item label="Email" prop="email">
								<el-input v-model="loginUser.email" placeholder="請輸入Email" clearable></el-input>
							</el-form-item>
						</div>
						<div class="login-password">
							<el-form-item label="密碼" prop="password">
								<el-input type="password" v-model="loginUser.password" placeholder="請輸入密碼"
									show-password></el-input>
							</el-form-item>
						</div>

						<el-form-item>
							<el-button type="primary" class="login-btn" @click="submitForm('loginForm')">登入</el-button>
						</el-form-item>

						<div class="createmember">
							<p><router-link to="/register">創建帳號</router-link></p>
						</div>
					</el-form>
				</div>
			</div>
		</div>
		<div class="logout-container" v-else>
			<div class="logout-mask">
				<div class="Avatar"></div>
				<el-button type="danger" class="logout-btn" @click="logout">登出</el-button>
			</div>
		</div>
	</div>
</template>

<script>
	import Form from 'element-ui'

	export default {
		name: "Login",
		data() {
			return {
				isLoggedIn: false,
				loginUser: {
					email: "",
					password: ""
				},
				rules: {
					email: [{
						type: "email",
						required: true,
						message: "電子郵件格式不正確",
						trigger: "blur"
					}],
					password: [{
							required: true,
							message: "密碼不能為空",
							trigger: "blur"
						},
						{
							min: 6,
							max: 30,
							message: "長度在6到30之間",
							trigger: "blur"
						}
					]
				}
			}
		},
		created() {
			const expirationTime = localStorage.getItem("eleTokenExpiration");
			const isLoginToken = localStorage.getItem("eleToken");
			if (expirationTime && isLoginToken) {
				this.isLoggedIn = true;
			}
		},
		methods: {
			logout() {
				const expirationTime = localStorage.getItem("eleTokenExpiration");
				const isLoginToken = localStorage.getItem("eleToken");
				if (expirationTime && isLoginToken) {
					this.isLoggedIn = false;
					localStorage.removeItem("eleToken");
					localStorage.removeItem("eleTokenExpiration");
				}
			},
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if (valid) {
						this.$axios.post("/api/users/login", this.loginUser)
							.then(res => {
								console.log("API 請求成功", res);
								//token
								const {
									token,
									expiresIn
								} = res.data;

								//計算過期時間
								const expirationTime = Date.now() + expiresIn * 1000;

								// token 儲存到localStorage
								localStorage.setItem("eleToken", token);
								localStorage.setItem("eleTokenExpiration", expirationTime);

								this.isLoggedIn = true;
								this.$router.push("/home");
							})

							.catch(error => {

							});
					}
				});
			},
		},
		components: {
			Form
		}
	}
</script>

<style>
	.login {
		background: url("/public/images/backgroundLogin.png")no-repeat center center;
		width: 100%;
		height: 100%;
		background-size: 100% 100%;
	}

	.login-container {
		width: 100%;
		height: 86.2vh;
	}

	.login-mask {
		background: rgba(233, 233, 233, 0.7);
		width: 80vw;
		height: 86.2vh;
		margin: auto;
	}

	.login-mask h2 {
		text-align: center;
		padding-top: 10%;
		font-size: 2rem;
		color: #000000;
	}

	.login-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.loginForm {
		margin-top: 20px;
		padding: 50px 60px 20px 20px;
		border-radius: 5px;
		border: 2px solid#000000;
		box-shadow: 0px 5px 10px #cccc;
	}

	.el-input__inner {
		padding: 0 100px 0 10px;
	}

	.submit_btn {
		width: 100%;
	}

	.el-button--primary {
		background: #f8b972;
		border-color: #f8b972;
	}

	.el-button--primary:hover {
		background: #6d3e35;
		color: #f8b972;
		border: 1px solid#6d3e35;
	}

	.el-form-item label {
		color: #000000;
		font-size: 1rem;
	}

	.el-form-item.is-required:not(.is-no-asterisk)>.el-form-item__label:before {
		display: none;
	}

	.login-name,
	.login-email,
	.login-password,
	.login-password2 {
		padding-bottom: 10px;
	}

	.login-btn {
		width: 100%;
	}

	.createmember a {
		color: #FFFFFF;
		font-weight: bold;
	}

	.createmember {
		text-align: center;
		padding-left: 30px;
	}

	.logout-container {
		width: 100%;
		height: 86.2vh;
	}

	.logout-btn {
		font-size: 2.5vw;
		margin-bottom: 15%;
	}
	
	.logout-mask {
		background: rgba(233, 233, 233, 0.7);
		width: 80vw;
		height: 86.2vh;
		margin: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.Avatar{
		background: url("/public/images/Avatar.jpg")no-repeat center center;
		width: 100%;
		height: 100%;
	}


	@media (max-width: 414px) {
		.el-input__inner {
			padding: 0 0 0 10px;
		}

		.el-form-item__content {
			margin-left: 0;
		}

		.el-form-item__label {
			text-align: start;
		}

		.el-input {
			width: 127%;
		}

		.login-mask h2 {
			font-size: 1.5rem;
		}
	}
</style>