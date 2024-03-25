<template>
	<div class="datasheet">
		<div class="datasheet-container">
			<div class="datasheet-mask">
				<p class="datasheet-title">--- 資料表列表 ---</p>
				<div class="datasheet-buttons">
					<el-button type="primary" plain v-for="(item, index) in dataSheets" :key="index" @click="handleButtonClick(item.name)">
						{{ item.name }}
					</el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: "datasheet",
		data() {
			return {
				dataSheets: [{
						name: "accounts"
					},
					{
						name: "characters"
					},
					{
						name: "yunaccountlog"
					},
					{
						name: "accountbosslog"
					},
					{
						name: "eventpasslog"
					},
					{
						name: "wz_customlife"
					},
					{
						name: "logdata"
					},
					{
						name: "donate"
					},
					{
						name: "donate_logs"
					},
					{
						name: "guilds"
					},
					{
						name: "gmlog"
					},
					{
						name: "gvglog"
					},
					{
						name: "gvgranks"
					},
					{
						name: "inventoryitems"
					},
					{
						name: "macbans"
					},
					{
						name: "notes"
					},
					{
						name: "offlinegift"
					},
					{
						name: "prizelog"
					},
					{
						name: "queststatus"
					},
					{
						name: "speedranks"
					}
				]
			};
		},
		methods: {
			handleButtonClick(tableName) {
				this.$store.commit('setTableName', tableName);
				// 導航到 database.vue 並傳遞參數
				this.$router.push({
					name: 'database',
					params: {
						tableName
					}
				});
			}
		}
	};
</script>

<style scoped>
	.datasheet {
		background: url("/public/images/backgroundLogin.png") no-repeat center center;
		width: 100%;
		height: 100%;
		background-size: 100% 100%;
	}

	.datasheet-container {
		width: 100%;
		height: 86.2vh;
	}

	.datasheet-mask {
		background: rgba(233, 233, 233, 0.7);
		width: 80vw;
		height: 86.2vh;
		margin: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.datasheet-title {
		font-size: 2.5vw;
		font-weight: bold;
		margin-top: 3%;
	}

	.datasheet-buttons {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		max-width: 80vw;
		margin-top: 2vw;
	}

	button {
		margin: 0.5vw;
		flex-basis: calc(16.6667% - 1vw);
	}
</style>