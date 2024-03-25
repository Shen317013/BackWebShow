<template>
	<div class="home">
		<div class="text-container">
			<img src="/images/banner.png" alt="">
			<div class="text-overlay">
				<div v-if="currentLine !== null" class="fade-text">
					{{ textLines[currentLine] }}
				</div>
			</div>
		</div>
		<div class="text-wrapper">
			<p class="color-text">來到2024年</p>
			<div class="text-content">
				<p>在那遙遠的中土大陸...</p>
				<p>有著一群帶著信念與野心的人們</p>
				<p>將以無可撼動的實力統治世界</p>
			</div>
		</div>
		<el-carousel height="15vw" direction="vertical" :autoplay="true">
			<el-carousel-item v-for="index in 3" :key="index">
				<img :src="getImagePath(index)" alt="carousel-image">
			</el-carousel-item>
		</el-carousel>
		<div class="join-title">
			<p>如何加入遊戲?</p>
		</div>
		<div class="join-line">
			<el-divider><i class="fas fa-solid fa-cannabis"></i></el-divider>
		</div>
		<div class="join-content">
			<p>只需三步驟!</p>
		</div>
		<div class="steps">
			<el-steps simple>
				<el-step title="按讚粉專" icon="fas fa-thumbs-up"></el-step>
				<el-step title="加入會員" icon="fas fa-user-plus"></el-step>
				<el-step title="下載遊戲" icon="fas fa-download"></el-step>
			</el-steps>
		</div>
		<div class="carousel">
			<el-carousel :interval="5000" arrow="always">>
				<el-carousel-item v-for="item in 3" :key="item">
					<img :src="getLastImagePath(item)" alt="carousel-image">
				</el-carousel-item>
			</el-carousel>
		</div>
	</div>
</template>

<script>
	export default {
		name: "home",
		data() {
			return {
				images: [
					'image1.png',
					'image2.png',
					'image3.png',
				],
				lastimages: [
					'image4.png',
					'image5.png',
					'image6.png',
				],
				textLines: [
					"「MMORPG」台灣國產奇幻史詩鉅作",
					"在那遙遠的中土大陸...",
					"有著一群帶著信念與野心的人們",
					"將以無可撼動的實力統治世界",
				],
				currentLine: null
			};
		},
		methods: {
			startAnimation() { //淡入淡出圖
				setInterval(() => {
					this.currentLine = (this.currentLine + 1) % this.textLines.length;
				}, 5000);
			},
			getImagePath(index) { //第一個輪播圖(上下)
				return `/images/${this.images[index - 1]}`;
			},
			getLastImagePath(item) { //第二個輪播圖(左右)
				return `/images/${this.lastimages[item - 1]}`;
			}
		},
		mounted() {
			this.currentLine = 0;
			this.startAnimation();
		}
	};
</script>

<style scoped>
	.home {
		position: relative;
	}

	.text-container {
		position: relative;
		line-height: 0;
	}

	.text-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.fade-text {
		opacity: 0;
		animation: fadeInOut 5s linear infinite;
		font-size: 2.1vw;
		font-weight: bold;
		color: #ffffff;
		cursor: default;
	}

	@keyframes fadeInOut {

		0%,
		100% {
			opacity: 0;
		}

		50% {
			opacity: 1;
		}
	}

	.home img {
		width: 100%;
		height: auto;
	}

	.text-wrapper {
		background-color: #4a5262;
		padding: 4%;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		flex-direction: column;
	}

	.color-text {
		font-size: 5vw;
		background: url('/public/images/text.png') center/cover no-repeat;
		-webkit-background-clip: text;
		color: transparent;
		display: inline-block;
		margin: 0;
		padding: 20px;
		font-style: italic;
		font-weight: bold;
		cursor: default;
	}

	.text-content {
		margin-top: 3%;
		text-align: center;
	}

	.text-content p {
		width: 100%;
		margin-top: 2%;
		padding: 2%;
		font-size: 1.1vw;
		font-weight: bold;
		color: #ffffff;
		cursor: default;
	}

	.el-carousel__item:nth-child(2n) {
		background-color: #99a9bf;
	}

	.el-carousel__item:nth-child(2n+1) {
		background-color: #d3dce6;
	}

	.join-title {
		padding: 3vw;
		background-color: #4a5262;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 4vw;
		font-weight: bold;
		color: #ffffff;
		text-shadow: 0 0 11px rgba(255, 222.84782608695642, 0, .57)
	}

	.join-content {
		background-color: #4a5262;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 2vw;
		font-weight: bold;
		color: #ffffff;
		padding: 3vw;
	}

	.join-line {
		background-color: #4a5262;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.el-divider__text {
		background-color: #4a5262;
		color: #ffffff;
	}

	.steps {
		background-color: #4a5262;
		padding: 3%;
	}

	.el-steps--simple {
		background-color: #4a5262;
	}

	.fb-link {
		background-color: #4a5262;
		line-height: 0;
		padding: 3vw;
		display: flex;
		justify-content: center;
	}

	.fb-img {
		width: 28vw;
		position: relative;
	}

	.fb-title {
		position: absolute;
		top: 5%;
		left: 3%;
		background: #ffffff;
		padding: 0.3vw;
		width: 3vw;
	}

	.blackmask {
		background: linear-gradient(to bottom, rgba(0, 0, 0, .7) 0%, rgba(0, 0, 0, 0) 100%);
		position: absolute;
		width: 100%;
		padding-bottom: 30%;
	}

	.fb-text a {
		color: #ffffff;
		text-decoration: none;
		position: absolute;
		top: 13%;
		left: 18%;
		font-size: 1.5vw;
		font-weight: bold;
	}

	.fb-text p {
		color: #ffffff;
		position: absolute;
		top: 30%;
		left: 18%;
		font-size: 1.2vw;
		cursor: default;
	}
</style>