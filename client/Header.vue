<template>
	<div class="header">
		<!-- 左邊的 Logo -->
		<div class="logo"><img src="/images/logo.png" @click="$router.push('/home')" /></div>

		<!-- 右邊的按鈕 -->
		<div class="buttons">
			<button class="login-button" @click="$router.push('/login')"><i class="fas fa-solid fa-user"></i></button>
			<!-- 新增的會員登入按鈕 -->
			<button @click="$router.push('/datasheet')">資料表</button>
			<button @click="$router.push('/importlogs')">導入商店LOGS</button>
			<button>後續功能</button>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'Header',
	};
</script>

<style scoped>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #282c35;
		color: #ffffff;
	}

	.logo button {
		background-color: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.logo img {
		width: 20%;
		height: auto;
		margin-left: 30%;
		cursor: pointer;
	}

	.buttons {
		display: flex;
		margin-left: auto;
		margin-right: 5%;
	}

	.buttons button {
		padding: 20px 16px;
		background-color: #282c35;
		color: #ffffff;
		border: none;
		cursor: pointer;
	}

	.buttons button:hover {
		background-color: #dad2fe;
		color: #ffffff;
		font-weight: bold;
	}
</style>