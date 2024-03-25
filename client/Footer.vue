<template>
	<div class="footer">
		<div class="left-content">
			<p>© 2024</p>
			<button class="footer-button">Copyright©2023 - 2024 </button>
			<p>.本遊戲部分內容需另行支付費用.</p>
			<button class="footer-button-rule">使用條款</button>
			<p>-</p>
			<button class="footer-button-gamerule">遊戲管理規範</button>
			<p>-</p>
			<button class="footer-button-privacy">隱私權政策</button>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'Footer',
	};
</script>

<style scoped>
	.footer {
		display: flex;
		align-items: center;
		background-color: #282c35;
		padding: 1.5% 0 1.5% 0;
		color: #ffffff;
	}
	
	.left-content{
		display: flex;
		margin-left: 3%;
	}

	.footer p,
	.footer button {
		margin-right: 5px;
		/* 清除段落的預設邊距 */
	}

	.footer p {
		font-size: 13px;
	}

	.footer button {
		background-color: transparent;
		border: none;
		padding: 0;
		color: #ef534f;
		cursor: pointer;
	}

	.footer-button:hover {
		text-decoration: underline;
	}
</style>