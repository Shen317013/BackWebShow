<template>
	<div class="register">
		<div class="register-container">
			<div class="register-mask">
				<h2>用戶註冊</h2>
				<div class="register-wrapper">
					<el-form :model="registerUser" :rules="rules" ref="registerForm" label-width="6vw"
						class="registerForm">
						<div class="register-name">
							<el-form-item label="用戶名" prop="name">
								<el-input v-model="registerUser.name" placeholder="請輸入用戶名"></el-input>
							</el-form-item>
						</div>
						<div class="register-email">
							<el-form-item label="Email" prop="email">
								<el-input v-model="registerUser.email" placeholder="請輸入Email"></el-input>
							</el-form-item>
						</div>
						<div class="register-password">
							<el-form-item label="密碼" prop="password">
								<el-input type="password" v-model="registerUser.password"
									placeholder="請輸入密碼"></el-input>
							</el-form-item>
						</div>
						<div class="register-password2">
							<el-form-item label="確認密碼" prop="password2">
								<el-input type="password" v-model="registerUser.password2"
									placeholder="請再次輸入密碼"></el-input>
							</el-form-item>
						</div>

						<el-form-item>
							<el-button type="primary" class="register-btn"
								@click="submitForm('registerForm')">註冊</el-button>
						</el-form-item>
					</el-form>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import {
		Form
	} from "element-ui";
	import axios from '@/http.js';

	export default {
		name: "Register",
		data() {
			var validatePass2 = (rule, value, callback) => {
				if (value !== this.registerUser.password) {
					callback(new Error('兩次密碼輸入不一致!'));
				} else {
					callback();
				}
			};
			return {
				registerUser: {
					name: "",
					email: "",
					password: "",
					password2: "",
				},
				rules: {
					name: [{
							required: true,
							message: "用戶名不能為空",
							trigger: "blur"
						},
						{
							min: 2,
							max: 30,
							message: "長度在2到30個字符之間",
							trigger: "blur"
						}
					],
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
					],
					password2: [{
							required: true,
							message: "確認密碼不能為空",
							trigger: "blur"
						},
						{
							min: 6,
							max: 30,
							message: "長度在6到30之間",
							trigger: "blur"
						},
						{
							validator: validatePass2,
							trigger: "blur"
						}
					]
				}
			}
		},
		methods: {
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if (valid) {
						this.$axios.post("/api/users/register", this.registerUser)
							.then(res => {
								//註冊成功
								this.$message({
									message: "帳號註冊成功!",
									type: "success"
								});
							})
						this.$router.push("/login")
					}
				});
			}
		},
		components: {
			Form
		}
	}
</script>

<style scoped>
	.register {
		background: url("/public/images/backgroundLogin.png")no-repeat center center;
		width: 100%;
		height: 100%;
		background-size: cover;
	}

	.register-container {
		width: 100%;
		height: 86.2vh;
	}

	.register-mask {
		background: rgba(233, 233, 233, 0.7);
		width: 80vw;
		height: 86.2vh;
		margin: auto;
	}


	.register-mask h2 {
		text-align: center;
		padding-top: 10%;
		font-size: 2rem;
		color: #000000;
	}

	.register-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.registerForm {
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

	.register-name,
	.register-email,
	.register-password,
	.register-password2 {
		padding-bottom: 10px;
	}

	.register-btn {
		width: 100%;
	}

	@media (max-width: 414px) {
		.el-input__inner {
			padding: 0 0 0 10px;
		}

		.register-mask h2 {
			font-size: 1.5rem;
		}
	}
</style>